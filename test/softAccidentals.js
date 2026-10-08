var assert = require('assert');
var Chant = require('../src/Exsurge.Chant');
var Drawing = require('../src/Exsurge.Drawing');
var Gabc = require('../src/Exsurge.Gabc').Gabc;
var Signs = require('../src/Exsurge.Chant.Signs');
var Step = require('../src/Exsurge.Core').Step;

// stands in for a fontkit font so that lyrics have widths: every character is half an em wide
var font = {
  unitsPerEm: 1000,
  layout: function(text) {
    return { advanceWidth: 500 * text.length, bbox: { minX: 0, maxY: 700, height: 900 } };
  }
};

function createScore(gabc) {
  var ctxt = new Drawing.ChantContext();
  ctxt.setFont('serif', 16, {}, { Regular: font });
  var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), false);
  score.performLayout(ctxt);
  return { ctxt: ctxt, score: score };
}

function layout(gabc, width) {
  var chant = createScore(gabc);
  chant.score.layoutChantLines(chant.ctxt, width);
  return chant.score;
}

function notationsOnLine(score, line) {
  return score.notations.slice(line.notationsStartIndex, line.notationsStartIndex + line.numNotationsOnLine);
}

// the accidentals on each line, with the ones that aren't printed in parentheses
function accidentalsByLine(score) {
  return score.lines.map(function(line) {
    return notationsOnLine(score, line)
      .filter(function(notation) { return notation.isAccidental; })
      .map(function(accidental) { return accidental.hidden ? '(' + accidental.sourceGabc + ')' : accidental.sourceGabc; })
      .join(' ');
  });
}

// where each line's notations are drawn
function positions(score, includeAccidentals) {
  return score.lines.map(function(line) {
    return notationsOnLine(score, line)
      .filter(function(notation) { return includeAccidentals || !notation.isAccidental; })
      .map(function(notation) { return notation.constructor.name + '@' + notation.bounds.x.toFixed(6); })
      .join(' ');
  });
}

var dominicanExample = '(c3) (e) (e) (e) gX(gXge) (f)gX(gXghED) (eddc) (;) (efef//hhv) gX(gXfe//fgED//efDC//ef) (;) (hhvFEf)(fv_//hhf)gY(gYghghf) (::)';

describe('Soft accidentals', function() {
  it('parses X, Y and ## as soft accidentals, and x, y and # as hard ones', function() {
    var ctxt = new Drawing.ChantContext();
    var mappings = Gabc.createMappingsFromSource(ctxt, '(c3) a(gXg) b(gYg) c(g##g) d(gxg) e(gyg) f(g#g)');
    var expected = [
      [Signs.AccidentalType.Flat, true],
      [Signs.AccidentalType.Natural, true],
      [Signs.AccidentalType.Sharp, true],
      [Signs.AccidentalType.Flat, false],
      [Signs.AccidentalType.Natural, false],
      [Signs.AccidentalType.Sharp, false]
    ];
    expected.forEach(function(e, i) {
      var notations = mappings[i + 1].notations;
      assert.equal(notations.length, 2);
      assert(notations[0] instanceof Signs.Accidental);
      assert.equal(notations[0].accidentalType, e[0]);
      assert.equal(notations[0].soft, e[1]);
      assert.equal(notations[1].notes.length, 1);
    });
  });

  it('alters the sung pitch whether or not it is printed', function() {
    // with a c3 clef, g is ti and d is fa
    var score = layout('(c3) a(gXg) b(gXg) c(gYg) d(d##d) e(d##ddYd)', 1000);
    assert.deepEqual(accidentalsByLine(score), ['gX (gX) gY d## (d##) dY']);
    var steps = score.notes
      .filter(function(note) { return note instanceof Chant.Note; })
      .map(function(note) { return note.pitch.step; });
    assert.deepEqual(steps, [Step.Te, Step.Te, Step.Ti, Step.Fu, Step.Fu, Step.Fa]);
  });

  it('prints a soft flat or sharp only when it is not already in effect on its staff position', function() {
    var score = layout('(c3) a(gXg) b(gXg) c(eXe) d(d##d) e(d##d) f(gyg) g(gXg) h(gxg) i(gXg)', 1000);
    assert.deepEqual(accidentalsByLine(score), ['gX (gX) eX d## (d##) gy gX gx (gX)']);
  });

  it('prints a soft natural only when a flat or sharp is in effect on its staff position', function() {
    var score = layout('(c3) a(gYg) b(gXg) c(gYg) d(gYg) e(gxg) f(gYg) g(d##d) h(dYd) i(eYe)', 1000);
    assert.deepEqual(accidentalsByLine(score), ['(gY) gX gY (gY) gx gY d## dY (eY)']);
  });

  it('counts the flat of a flat clef as in effect', function() {
    // the cb3 clef has a flat on g
    var score = layout('(cb3) a(gXg) b(gYg) c(gXg)', 1000);
    assert.deepEqual(accidentalsByLine(score), ['(gX) gY gX']);
  });

  it('matches Gregorio for its Dominican example on a single line', function() {
    var score = layout(dominicanExample, 2000);
    assert.deepEqual(accidentalsByLine(score), ['gX (gX) (gX) gY']);
  });

  it('decides which soft accidentals to print separately for each line', function() {
    var widths = [150, 200, 250, 300, 400];
    var lineCounts = widths.map(function(width) {
      var score = layout(dominicanExample, width);
      score.lines.forEach(function(line) {
        var flatInEffect = false;
        notationsOnLine(score, line).forEach(function(notation) {
          if (!notation.isAccidental) return;
          if (notation.accidentalType === Signs.AccidentalType.Flat) {
            assert.equal(notation.hidden, flatInEffect, 'width ' + width);
            flatInEffect = true;
          } else {
            assert.equal(notation.hidden, !flatInEffect, 'width ' + width);
            flatInEffect = false;
          }
        });
      });
      return score.lines.length;
    });
    assert(Math.max.apply(null, lineCounts) > 2);
  });

  it('gives a hidden soft accidental no space', function() {
    // in the middle of a run of notes, a hidden accidental leaves the neumes on either side
    // spaced as though the run were simply split there
    var gabc = '(c3) a(gXg) b(gXge) c(hgXgh) d(hg.gXgh) e(fgXgwh) before(f) (,) longer(gXg) (:) end(f)';
    var withoutHidden = '(c3) a(gXg) b(ge) c(h/gh) d(hg./gh) e(f!gwh) before(f) (,) longer(g) (:) end(f)';
    // at widths where the soft flats after the first one all stay on the first line, and so
    // are hidden, including widths where that line is condensed to fit
    var compared = 0;
    for (var width = 150; width <= 400; width += 5) {
      var score = layout(gabc, width);
      if (accidentalsByLine(score)[0] !== 'gX (gX) (gX) (gX) (gX) (gX)') continue;
      assert.deepEqual(positions(score), positions(layout(withoutHidden, width)), 'width ' + width);
      compared++;
    }
    assert(compared > 10);
  });

  it('keeps the syllable of a hidden soft accidental under it', function() {
    var score = layout('(c3) a(gXg) Al(gX)le(ge)lu(f)ia.(g.) b(gX) c(g)', 1000);
    assert.deepEqual(accidentalsByLine(score), ['gX (gX) (gX)']);
    var lyrics = score.notations
      .filter(function(notation) { return notation.hasLyrics(); })
      .map(function(notation) {
        var lyric = notation.lyrics[0];
        return { left: notation.bounds.x + lyric.bounds.x, right: notation.bounds.x + lyric.bounds.right() };
      });
    for (var i = 1; i < lyrics.length; i++) assert(lyrics[i - 1].right <= lyrics[i].left);

    // the word after it is spaced as though it followed a syllable without notes
    var withoutNotes = layout('(c3) a(gXg) Al(gX)le(ge)lu(f)ia.(g.) b() c(g)', 1000);
    assert.equal(score.notations.slice(-1)[0].bounds.x, withoutNotes.notations.slice(-1)[0].bounds.x);
  });

  it('lays out a printed soft accidental just like a hard one', function() {
    var soft = layout('(c3) a(gXg) b(hgeXeh) c(d##d) d(hg.dYdh)', 1000);
    assert.deepEqual(accidentalsByLine(soft), ['gX eX d## dY']);
    assert.deepEqual(
      positions(soft, true),
      positions(layout('(c3) a(gxg) b(hgexeh) c(d#d) d(hg.dydh)', 1000), true)
    );
  });

  it('lays out the same way when a score is laid out again at a different width', function() {
    var gabc = '(c3) a(gXg) b(hgXgh) c(hg.gXgh) d(gYg) ' + dominicanExample.slice(5);
    var chant = createScore(gabc);
    [180, 2000, 250, 150, 1000].forEach(function(width) {
      chant.score.layoutChantLines(chant.ctxt, width);
      var fresh = layout(gabc, width);
      assert.deepEqual(accidentalsByLine(chant.score), accidentalsByLine(fresh));
      assert.deepEqual(positions(chant.score, true), positions(fresh, true));
    });
  });
});
