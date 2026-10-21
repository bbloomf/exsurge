import { beforeEach, describe, it } from "vitest";
import assert from "node:assert";
import * as Chant from "../src/Exsurge.Chant.js";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { Gabc } from "../src/Exsurge.Gabc.js";

// the tests stand in a document of their own
const g: any = globalThis;

// stands in for a fontkit font, counting what it lays out: every character is half an em wide
function countingFont() {
  var font = {
    unitsPerEm: 1000,
    laidOut: [] as string[],
    charWidth: 500,
    layout: function(text: string) {
      font.laidOut.push(text);
      return { advanceWidth: font.charWidth * text.length, bbox: { minX: 0, maxY: 700, height: 900 } };
    }
  };
  return font;
}

// stands in for a canvas context, counting what it measures
function countingCanvas() {
  var canvas: any = {
    font: '',
    textAlign: 'start',
    measured: [] as string[],
    charWidth: 0.5,
    measureText: function(text: string) {
      canvas.measured.push(text);
      var size = parseFloat(this.font.match(/([\d.]+)px/)[1]);
      return { width: canvas.charWidth * size * text.length };
    }
  };
  return canvas;
}

function useCanvas(ctxt: Drawing.ChantContext, canvas: any) {
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
    var drawn: string[][] = [];
    Object.assign(canvas, {
      fillStyle: '',
      translate: function() {},
      fillText: function(this: { font: string }, text: string) { drawn.push([this.font, text]); }
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
    var hadDocument = 'document' in g, oldDocument = g.document;
    var listeners: Array<() => void> = [];
    g.document = {
      fonts: {
        addEventListener: function(type: string, listener: () => void) {
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
      if (hadDocument) g.document = oldDocument;
      else delete g.document;
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
    assert.strictEqual((lyric.createSvgTree(ctxt).children[0] as Drawing.SvgTreeNode).props!.style.fill, '#123456');
  });

  it('wraps text where each line still fits', function() {
    var font = countingFont();
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Fake', 16, {}, { Regular: font });
    var words = 'Ad te levávi ánimam meam Deus meus in te confído non erubéscam neque irrídeant me inimíci mei'.split(' ');
    var title = new Drawing.Title(ctxt, words.join(' '));
    var charWidth = ctxt.textStyles.title.size / 2;

    function lines() {
      var result = [''];
      title.spans.forEach(function(span) {
        if (span.newLine) result.push('');
        result[result.length - 1] += span.text;
      });
      return result;
    }

    function wrap(chars: number) {
      var maxWidth = chars * charWidth;
      title.setMaxWidth(ctxt, maxWidth);
      var result = lines();
      assert.deepEqual(result.join(' ').split(' '), words);
      result.forEach(function(line, i) {
        assert(line.length * charWidth <= maxWidth, JSON.stringify(line) + ' is too wide');
        // the next line's first word wouldn't have fit on this line
        if (i + 1 < result.length) {
          var next = line + ' ' + result[i + 1].split(' ')[0];
          assert(next.length * charWidth > maxWidth, JSON.stringify(next) + ' would have fit');
        }
      });
      assert.strictEqual(title.numLines, result.length);
      return result;
    }

    assert.strictEqual(wrap(60).length, 2);
    assert.deepEqual(wrap(20), [
      'Ad te levávi ánimam',
      'meam Deus meus in te',
      'confído non',
      'erubéscam neque',
      'irrídeant me inimíci',
      'mei'
    ]);
    // a line can hold a single word, when the next one wouldn't fit with it
    assert.deepEqual(wrap(14), [
      'Ad te levávi',
      'ánimam meam',
      'Deus meus in',
      'te confído non',
      'erubéscam',
      'neque',
      'irrídeant me',
      'inimíci mei'
    ]);
    // and wrapping again starts over
    assert.strictEqual(wrap(1000).length, 1);
    assert.strictEqual(wrap(20).length, 6);
  });

  it('wraps text with line breaks and markup in it', function() {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Fake', 16, {}, { Regular: countingFont() });
    var title = new Drawing.Title(ctxt, 'Ad te <i>levávi</i> ánimam<br>meam Deus meus <i>in te confído</i> non erubéscam');
    title.setMaxWidth(ctxt, 12 * ctxt.textStyles.title.size / 2);
    var lines = [''];
    title.spans.forEach(function(span) {
      if (span.newLine) lines.push('');
      lines[lines.length - 1] += span.text;
    });
    assert.deepEqual(lines, ['Ad te levávi', 'ánimam', 'meam Deus', 'meus in te', 'confído non', 'erubéscam']);
    assert.strictEqual(title.numLines, 6);
  });
  describe('wrapping around line breaks', function() {
    var ctxt: Drawing.ChantContext;
    beforeEach(function() {
      ctxt = new Drawing.ChantContext();
      ctxt.setFont('Fake', 16, {}, { Regular: countingFont() });
    });

    // the lines of title, with the whitespace left before a <br> taken off
    function lines(title: Drawing.Title) {
      var result = [''];
      title.spans.forEach(function(span) {
        if (span.newLine) result.push('');
        result[result.length - 1] += span.text;
      });
      return result.map(function(line) { return line.replace(/\s+$/, ''); });
    }

    // the text of title, with a newline where each line starts
    function joined(title: Drawing.Title) {
      return title.spans.map(function(span) {
        return (span.newLine ? '\n' : '') + span.text;
      }).join('');
    }

    // wraps title to chars characters, checking that each line is filled
    // greedily, and returns its lines
    function wrap(title: Drawing.Title, chars: number) {
      var charWidth = ctxt.textStyles.title.size / 2;
      var maxWidth = chars * charWidth;
      title.setMaxWidth(ctxt, maxWidth);
      var result = lines(title);
      var words = title.sourceGabc!.replace(/<br>/g, ' ').replace(/<[^>]*>/g, '');
      assert.strictEqual(result.join(' ').split(/\s+/).filter(Boolean).join(' '),
        words.split(/\s+/).filter(Boolean).join(' '));
      // the spans that start each line
      var starts = [title.spans[0]].concat(title.spans.filter(function(span) {
        return span.newLine;
      }));
      result.forEach(function(line, i) {
        if (/\s/.test(line.trim()))
          assert(line.length * charWidth <= maxWidth, JSON.stringify(line) + ' is too wide');
        // unless the next line starts at a <br>
        if (i + 1 < result.length && starts[i + 1].newLine === true) {
          var next = line + starts[i + 1].wrappedSpace + result[i + 1].split(' ')[0];
          assert(next.length * charWidth > maxWidth, JSON.stringify(next) + ' would have fit');
        }
      });
      // with a blank line for each <br> after the first in a row
      var blank = starts.reduce(function(sum, span) {
        return sum + Math.max(0, (parseInt(span.newLine as unknown as string) || 1) - 1);
      }, 0);
      assert.strictEqual(title.numLines, result.length + blank);
      return result;
    }

    it('wraps the lines after a line break where they fill up', function() {
      var title = new Drawing.Title(ctxt, 'aa bb cc dd <br>ee ff gg hh');
      assert.deepEqual(wrap(title, 11), ['aa bb cc dd', 'ee ff gg hh']);
      // and the <br> is still there when wrapping again
      assert.deepEqual(wrap(title, 100), ['aa bb cc dd', 'ee ff gg hh']);

      title = new Drawing.Title(ctxt, 'Ad te levávi <br>ánimam meam Deus meus in te confído');
      assert.deepEqual(wrap(title, 12), ['Ad te levávi', 'ánimam meam', 'Deus meus in', 'te confído']);
    });

    it('wraps the lines after a word too wide to fit', function() {
      var title = new Drawing.Title(ctxt, 'Supercalifragilistic a b c d e f g h');
      assert.deepEqual(wrap(title, 6), ['Supercalifragilistic', 'a b c', 'd e f', 'g h']);

      title = new Drawing.Title(ctxt, 'a b<br>Supercalifragilistic c d');
      assert.deepEqual(wrap(title, 6), ['a b', 'Supercalifragilistic', 'c d']);
    });

    it('takes out all of the whitespace where it wraps', function() {
      var title = new Drawing.Title(ctxt, '<i>aa </i> bb cc');
      assert.deepEqual(wrap(title, 3), ['aa', 'bb', 'cc']);
      title = new Drawing.Title(ctxt, ' aaaa bb');
      assert.deepEqual(wrap(title, 3), [' aaaa', 'bb']);
    });

    it('wraps again the same as it wraps the first time', function() {
      [
        'aa bb cc dd <br>ee ff gg hh',
        'Ad te levávi <br>ánimam meam Deus meus in te confído',
        'Supercalifragilistic a b c d e f g h',
        'a b<br>Supercalifragilistic c d',
        '<i>aa </i> bb cc',
        ' aaaa bb',
        'aa bb cc <br>',
        'Ad te <i>levávi</i> ánimam<br>meam Deus meus <i>in te confído</i> non erubéscam',
        'a<br><br> b c d<br> e f g h i'
      ].forEach(function(text) {
        var title = new Drawing.Title(ctxt, text);
        [3, 6, 11, 4, 100, 8, 5, 2].forEach(function(chars) {
          var fresh = new Drawing.Title(ctxt, text);
          var expected = wrap(fresh, chars);
          assert.deepEqual(wrap(title, chars), expected, JSON.stringify(text) + ' at ' + chars);
          // the whitespace is all taken out at the same places
          assert.strictEqual(joined(title), joined(fresh));
          assert.strictEqual(title.bounds.width, fresh.bounds.width);
        });
      });
    });
  });
});
