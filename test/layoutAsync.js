var assert = require('assert');
var Chant = require('../src/Exsurge.Chant');
var Drawing = require('../src/Exsurge.Drawing');
var Gabc = require('../src/Exsurge.Gabc').Gabc;
var fakeFont = require('./helpers/fonts').fakeFont;

// Courier New's hyphen, like every glyph in it, is 1229/2048em wide
var courierNew = fakeFont(1229 / 2048);
var palatino = fakeFont(0.33);

function createScore(ctxt) {
  return new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, '(c4) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (::)'), false);
}

// lays the score out asynchronously, and resolves with how long that took
function performLayoutAsync(ctxt, score) {
  var start = Date.now();
  return new Promise(function(resolve) {
    score.performLayoutAsync(ctxt, function() {
      resolve(Date.now() - start);
    });
  });
}

function assertLaidOut(score) {
  assert.strictEqual(score.needsLayout, false);
  score.notations.forEach(function(notation) {
    assert.strictEqual(notation.needsLayout, false);
  });
}

// measures text on a canvas the way a browser does: in the fallback font until the real one loads
function useFakeCanvas(ctxt, getFont) {
  ctxt.textMeasuringStrategy = Drawing.TextMeasuringStrategy.Canvas;
  ctxt.canvasCtxt = {
    font: '',
    measureText: function(text) {
      var size = parseFloat(this.font.match(/([\d.]+)px/)[1]);
      var font = getFont();
      return { width: font.layout(text).advanceWidth / font.unitsPerEm * size };
    }
  };
  ctxt.updateHyphenWidth();
}

describe('Asynchronous layout', function() {
  it('lays out a lyric font whose hyphen is wider than 0.6em', function() {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Courier New', 16, {}, { Regular: courierNew });
    ctxt.fontLoadTimeout = 300;
    var score = createScore(ctxt);
    return performLayoutAsync(ctxt, score).then(function() {
      assertLaidOut(score);
      assert(ctxt.hyphenWidth / ctxt.textStyles.lyric.size > 0.6);
    });
  });

  it('lays out with no lyric font at all', function() {
    var ctxt = new Drawing.ChantContext();
    ctxt.fontLoadTimeout = 300;
    var score = createScore(ctxt);
    return performLayoutAsync(ctxt, score).then(function() {
      assertLaidOut(score);
      assert.strictEqual(ctxt.hyphenWidth, 0);
    });
  });

  it('waits for a lyric font that is still loading', function() {
    var ctxt = new Drawing.ChantContext();
    ctxt.fontLoadTimeout = 5000;
    var score = createScore(ctxt);
    setTimeout(function() {
      ctxt.fontDictionary = { Regular: palatino };
    }, 150);
    return performLayoutAsync(ctxt, score).then(function(elapsed) {
      assertLaidOut(score);
      assert(elapsed >= 150, 'laid out after ' + elapsed + 'ms, before the font loaded');
      assert(elapsed < 1000, 'laid out after ' + elapsed + 'ms, long after the font loaded');
      assert(Math.abs(ctxt.hyphenWidth / ctxt.textStyles.lyric.size - 0.33) < 1e-9);
    });
  });

  describe('with document.fonts', function() {
    var hadDocument, oldDocument;
    beforeEach(function() {
      hadDocument = 'document' in global;
      oldDocument = global.document;
    });
    afterEach(function() {
      if (hadDocument) global.document = oldDocument;
      else delete global.document;
    });

    it('does not wait for a font that has loaded', function() {
      var ctxt = new Drawing.ChantContext();
      ctxt.setFont('Courier New', 16);
      useFakeCanvas(ctxt, function() { return courierNew; });
      ctxt.fontLoadTimeout = 5000;
      var checked = [];
      global.document = {
        fonts: {
          check: function(font, text) {
            checked.push([font, text]);
            return true;
          },
          load: function() {
            throw new Error('load() called for a font that check() says has loaded');
          }
        }
      };
      var score = createScore(ctxt);
      return performLayoutAsync(ctxt, score).then(function(elapsed) {
        assertLaidOut(score);
        assert(elapsed < 1000, 'laid out after ' + elapsed + 'ms');
        assert.deepEqual(checked, [['14.4px Courier New', '-']]);
      });
    });

    it('waits for document.fonts to load the lyric font', function() {
      var ctxt = new Drawing.ChantContext();
      ctxt.setFont("'Webfont', serif", 16);
      var font = fakeFont(0.8); // whatever the canvas falls back to while the font loads
      useFakeCanvas(ctxt, function() { return font; });
      ctxt.fontLoadTimeout = 5000;
      var loaded = [];
      global.document = {
        fonts: {
          check: function() { return font === palatino; },
          load: function(fontString, text) {
            loaded.push([fontString, text]);
            return new Promise(function(resolve) {
              setTimeout(function() {
                font = palatino;
                resolve([{}]);
              }, 150);
            });
          }
        }
      };
      var score = createScore(ctxt);
      return performLayoutAsync(ctxt, score).then(function(elapsed) {
        assertLaidOut(score);
        assert(elapsed >= 150, 'laid out after ' + elapsed + 'ms, before the font loaded');
        assert(elapsed < 1000, 'laid out after ' + elapsed + 'ms, long after the font loaded');
        assert.deepEqual(loaded, [["14.4px 'Webfont', serif", '-']]);
        assert(Math.abs(ctxt.hyphenWidth / ctxt.textStyles.lyric.size - 0.33) < 1e-9);
      });
    });

    it('asks document.fonts about the face that the hyphen is drawn in', function() {
      var ctxt = new Drawing.ChantContext();
      ctxt.setFont("'Webfont', serif", 16);
      ctxt.textStyles.lyric.prefix = '<i>';
      var font = fakeFont(0.8);
      useFakeCanvas(ctxt, function() { return font; });
      ctxt.fontLoadTimeout = 5000;
      var checked = [], loaded = [];
      global.document = {
        fonts: {
          check: function(fontString, text) {
            checked.push([fontString, text]);
            return false;
          },
          load: function(fontString, text) {
            loaded.push([fontString, text]);
            font = palatino;
            return Promise.resolve([{}]);
          }
        }
      };
      var score = createScore(ctxt);
      return performLayoutAsync(ctxt, score).then(function() {
        assertLaidOut(score);
        assert.deepEqual(checked, [["italic 14.4px 'Webfont', serif", '-']]);
        assert.deepEqual(loaded, [["italic 14.4px 'Webfont', serif", '-']]);
      });
    });

    it('stops waiting for a font that never finishes loading', function() {
      var ctxt = new Drawing.ChantContext();
      ctxt.setFont("'Webfont', serif", 16);
      useFakeCanvas(ctxt, function() { return courierNew; });
      ctxt.fontLoadTimeout = 300;
      global.document = {
        fonts: {
          check: function() { return false; },
          load: function() { return new Promise(function() {}); }
        }
      };
      var score = createScore(ctxt);
      return performLayoutAsync(ctxt, score).then(function(elapsed) {
        assertLaidOut(score);
        assert(elapsed >= 300, 'laid out after ' + elapsed + 'ms');
      });
    });
  });
});
