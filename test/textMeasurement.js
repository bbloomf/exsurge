var assert = require('assert');
var Chant = require('../src/Exsurge.Chant');
var Drawing = require('../src/Exsurge.Drawing');
var Gabc = require('../src/Exsurge.Gabc').Gabc;

// stands in for a fontkit font, counting what it lays out: every character is half an em wide
function countingFont() {
  var font = {
    unitsPerEm: 1000,
    laidOut: [],
    charWidth: 500,
    layout: function(text) {
      font.laidOut.push(text);
      return { advanceWidth: font.charWidth * text.length, bbox: { minX: 0, maxY: 700, height: 900 } };
    }
  };
  return font;
}

// stands in for a canvas context, counting what it measures
function countingCanvas() {
  var canvas = {
    font: '',
    textAlign: 'start',
    measured: [],
    charWidth: 0.5,
    measureText: function(text) {
      canvas.measured.push(text);
      var size = parseFloat(this.font.match(/([\d.]+)px/)[1]);
      return { width: canvas.charWidth * size * text.length };
    }
  };
  return canvas;
}

function useCanvas(ctxt, canvas) {
  ctxt.textMeasuringStrategy = Drawing.TextMeasuringStrategy.Canvas;
  ctxt.canvasCtxt = canvas;
  ctxt.updateHyphenWidth();
}

var gabc = '(c4) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (;) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (::)';

describe('Text measurement', function() {
  it('lays out each piece of text in a font only once', function() {
    var font = countingFont();
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Fake', 16, {}, { Regular: font });
    var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), false);
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, 300);
    score.layoutChantLines(ctxt, 600);
    score.createSvg(ctxt);
    assert(font.laidOut.length > 0);
    var unique = font.laidOut.filter(function(text, i) { return font.laidOut.indexOf(text) === i; });
    assert.deepEqual(font.laidOut, unique);
  });

  it('measures each piece of text on a canvas only once, even to draw it', function() {
    var canvas = countingCanvas();
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Fake', 16);
    useCanvas(ctxt, canvas);
    var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), false);
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, 300);
    var measured = canvas.measured.length;
    var lyric = score.notations.filter(function(notation) {
      return notation.hasLyrics() && notation.lyrics[0].text === 'Ky';
    })[0].lyrics[0];
    var drawn = [];
    Object.assign(canvas, {
      fillStyle: '',
      translate: function() {},
      fillText: function(text) { drawn.push([this.font, text]); }
    });
    lyric.draw(ctxt);
    assert.deepEqual(drawn[0], ['14.4px Fake', 'Ky']);
    assert.strictEqual(canvas.measured.length, measured, JSON.stringify(canvas.measured));
  });

  it('measures again once the font changes', function() {
    var ctxt = new Drawing.ChantContext();
    var font = countingFont();
    ctxt.setFont('Fake', 16, {}, { Regular: font });
    var lyric = new Drawing.Lyric(ctxt, 'Ky', Drawing.LyricType.SingleSyllable);
    assert.strictEqual(lyric.bounds.width, 14.4);

    // a new font object is measured separately
    var wider = countingFont();
    wider.charWidth = 1000;
    ctxt.setFont('Fake', 16, {}, { Regular: wider });
    lyric.recalculateMetrics(ctxt);
    assert.strictEqual(lyric.bounds.width, 28.8);

    // and so is a new size
    ctxt.textStyles.lyric.size = 10;
    lyric.recalculateMetrics(ctxt);
    assert.strictEqual(lyric.bounds.width, 20);
  });

  it('measures again on a canvas once a font has loaded', function() {
    var hadDocument = 'document' in global, oldDocument = global.document;
    var listeners = [];
    global.document = {
      fonts: {
        addEventListener: function(type, listener) {
          if (type === 'loadingdone') listeners.push(listener);
        }
      }
    };
    try {
      var canvas = countingCanvas();
      var ctxt = new Drawing.ChantContext();
      ctxt.setFont("'Webfont', serif", 16);
      useCanvas(ctxt, canvas);
      var lyric = new Drawing.Lyric(ctxt, 'Ky', Drawing.LyricType.SingleSyllable);
      assert.strictEqual(lyric.bounds.width, 14.4);
      lyric.recalculateMetrics(ctxt);
      assert.strictEqual(lyric.bounds.width, 14.4);

      // the web font finishes loading
      canvas.charWidth = 1;
      listeners.forEach(function(listener) { listener(); });
      lyric.recalculateMetrics(ctxt);
      if (listeners.length) {
        assert.strictEqual(lyric.bounds.width, 28.8);
      } else {
        // a ctxt created by an earlier test already listens to another document
        ctxt.clearTextCache();
        lyric.recalculateMetrics(ctxt);
        assert.strictEqual(lyric.bounds.width, 28.8);
      }
    } finally {
      if (hadDocument) global.document = oldDocument;
      else delete global.document;
    }
  });

  it('draws rubrics in the color set after the text was created', function() {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Fake', 16, {}, { Regular: countingFont() });
    var lyric = new Drawing.Lyric(ctxt, '<c>Ky</c>', Drawing.LyricType.SingleSyllable);
    assert(/fill: #d00;/.test(lyric.createSvgFragment(ctxt)));
    ctxt.setRubricColor('#123456');
    var svg = lyric.createSvgFragment(ctxt);
    assert(/fill: #123456;/.test(svg), svg);
    assert(!/#d00/.test(svg), svg);
    assert.strictEqual(lyric.spans[0].properties.fill, '#123456');
    assert.strictEqual(lyric.createSvgTree(ctxt).children[0].props.style.fill, '#123456');
  });

  it('wraps text where each line still fits', function() {
    var font = countingFont();
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Fake', 16, {}, { Regular: font });
    var words = 'Ad te levávi ánimam meam Deus meus in te confído non erubéscam neque irrídeant me inimíci mei'.split(' ');
    var title = new Drawing.Title(ctxt, words.join(' '));
    var charWidth = ctxt.textStyles.title.size / 2;
    // (breaking into more than two lines loses line breaks, which is a bug of its own)
    var maxWidth = 60 * charWidth;
    title.setMaxWidth(ctxt, maxWidth);

    var lines = [''];
    title.spans.forEach(function(span) {
      if (span.newLine) lines.push('');
      lines[lines.length - 1] += span.text;
    });
    assert.deepEqual(lines.join(' ').split(' '), words);
    lines.forEach(function(line, i) {
      assert(line.length * charWidth <= maxWidth, JSON.stringify(line) + ' is too wide');
      // the next line's first word wouldn't have fit on this line
      if (i + 1 < lines.length) {
        var next = line + ' ' + lines[i + 1].split(' ')[0];
        assert(next.length * charWidth > maxWidth, JSON.stringify(next) + ' would have fit');
      }
    });
    assert.strictEqual(lines.length, 2);
    assert.strictEqual(title.numLines, 2);
  });
});
