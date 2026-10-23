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

function layout(clefVisibility?: Drawing.ClefVisibility, source = gabc) {
  var ctxt = new Drawing.ChantContext();
  ctxt.setFont('serif', 16, {}, { Regular: font });
  if (clefVisibility) ctxt.clefVisibility = clefVisibility;
  var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, source), false);
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

  it('draws a change of clef at the start of a line', function() {
    (['invisible', 'phantom'] as Drawing.ClefVisibility[]).forEach(function(clefVisibility) {
      var { score } = layout(clefVisibility, "(c4) A(f) (z) (f3) B(h) (::)");
      assert.deepEqual(startingClefGlyphs(score), [[], ['FaClef']], clefVisibility);
    });
  });
});

describe('Two clefs (c1@c4)', function() {
  // the clefs of a score's notations
  function clefs(source: string) {
    var ctxt = new Drawing.ChantContext();
    var mappings = Gabc.createMappingsFromSource(ctxt, source);
    return mappings.flatMap(function(mapping) { return mapping.notations; })
      .filter(function(notation) { return notation.isClef; }) as Chant.Clef[];
  }

  it('reads the second clef, with its flat, onto the first', function() {
    var [first, pair] = clefs("(c4) a(f) (cb3@fb3) b(g)");
    assert.equal(first.secondClef, undefined);
    assert.equal(pair.sourceGabc, "cb3@fb3");
    assert(pair instanceof Chant.DoClef);
    assert(pair.secondClef instanceof Chant.FaClef);
    // each flat as on a clef by itself
    var [doClef, faClef] = clefs("(cb3) a(f) (fb3) b(g)");
    assert.equal(pair.defaultAccidental!.staffPosition, doClef.defaultAccidental!.staffPosition);
    assert.equal(pair.secondClef!.staffPosition, faClef.staffPosition);
    assert.equal(pair.secondClef!.defaultAccidental!.staffPosition, faClef.defaultAccidental!.staffPosition);
  });

  it('gives each copy of a clef its own second clef', function() {
    var [pair] = clefs("(c1@c4) a(f)");
    var copy = pair.clone();
    assert(copy.secondClef instanceof Chant.DoClef);
    assert.notEqual(copy.secondClef, pair.secondClef);
    assert.equal(copy.secondClef!.staffPosition, pair.secondClef!.staffPosition);
  });
});
