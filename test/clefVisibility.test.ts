import { describe, it } from "vitest";
import assert from "node:assert";
import * as Chant from "../src/Exsurge.Chant.js";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { Gabc } from "../src/Exsurge.Gabc.js";

// stands in for a fontkit font so that lyrics have widths: every character is half an em wide
var font = {
  unitsPerEm: 1000,
  layout: function(text: string) {
    return { advanceWidth: 500 * text.length, bbox: { minX: 0, maxY: 700, height: 900 } };
  }
};

// two lines, each starting with a pair of clefs, and a change of clef in the second
var gabc = "(c1@c4) A(d)B(j) (z) C(h) (f3) D(h) (::)";

function layout(clefVisibility?: Drawing.ClefVisibility) {
  var ctxt = new Drawing.ChantContext();
  ctxt.setFont('serif', 16, {}, { Regular: font });
  if (clefVisibility) ctxt.clefVisibility = clefVisibility;
  var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), false);
  score.performLayout(ctxt);
  score.layoutChantLines(ctxt, 600);
  return { ctxt: ctxt, score: score };
}

// the glyphs that each line's starting clef draws
function startingClefGlyphs(score: Chant.ChantScore) {
  return score.lines.map(function(line) {
    return line.startingClef.visualizers.map(function(visualizer: any) { return visualizer.glyphCode; });
  });
}

// where the first notation of each line is drawn
function firstNotationX(score: Chant.ChantScore) {
  return score.lines.map(function(line) { return score.notations[line.notationsStartIndex].bounds.x; });
}

describe('ChantContext.clefVisibility', function() {
  it('draws the clefs at the start of lines by default', function() {
    var { ctxt, score } = layout();
    assert.equal(ctxt.clefVisibility, 'visible');
    assert.deepEqual(startingClefGlyphs(score), [['DoClef', 'DoClef'], ['DoClef', 'DoClef']]);
  });

  it('leaves out the clefs at the start of lines, and their space, when invisible', function() {
    var visible = layout().score;
    var { ctxt, score } = layout('invisible');
    assert.deepEqual(startingClefGlyphs(score), [[], []]);
    score.lines.forEach(function(line) {
      assert.equal(line.startingClef.bounds.width, 0);
    });
    var visibleX = firstNotationX(visible);
    firstNotationX(score).forEach(function(x, i) {
      assert(x < visibleX[i], 'line ' + i + ' starts at ' + x + ', not before ' + visibleX[i]);
    });

    // only the change of clef is drawn
    var svg = score.createSvg(ctxt);
    assert.equal(svg.match(/<use[^>]*#DoClef"/g), null);
    assert.equal(svg.match(/<use[^>]*#FaClef"/g)!.length, 1);
  });

  it('leaves the space of the clefs at the start of lines empty when phantom', function() {
    var visible = layout().score;
    var { ctxt, score } = layout('phantom');
    assert.deepEqual(startingClefGlyphs(score), [[], []]);
    score.lines.forEach(function(line, i) {
      assert.equal(line.startingClef.bounds.width, visible.lines[i].startingClef.bounds.width);
    });
    assert.deepEqual(firstNotationX(score), firstNotationX(visible));

    var svg = score.createSvg(ctxt);
    assert.equal(svg.match(/<use[^>]*#DoClef"/g), null);
    assert.equal(svg.match(/<use[^>]*#FaClef"/g)!.length, 1);
  });
});
