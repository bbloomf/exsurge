import { describe, it } from "vitest";
import assert from "node:assert";
import { ChantLine } from "../src/Exsurge.Chant.ChantLine.js";
import { ChantScore, Clef } from "../src/Exsurge.Chant.js";
import { Custos } from "../src/Exsurge.Chant.Signs.js";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { Gabc } from "../src/Exsurge.Gabc.js";
import { fakeFont } from "./helpers/fonts";

describe('Custos rendering', function() {
  ['draw', 'createSvgFragment', 'createSvgNode', 'createSvgTree'].forEach(function(method) {
    [true, false].forEach(function(explicit) {
      it(method + ' renders an ' + (explicit ? 'explicit' : 'automatic') + ' ending custos once', function() {
        var ctxt = new Drawing.ChantContext();
        var mappings = Gabc.createMappingsFromSource(ctxt, '<i><c>TEST</i>(d+) <c><i>TEST');
        var custos = mappings[0].notations[0];
        var text = mappings[1].notations[0];
        assert(custos instanceof Custos);
        assert(custos.hasLyrics());
        assert(text.hasLyrics());

        // a line of a score with just these notations
        var line: any = new ChantLine({
          notations: [custos, text],
          staffLineCount: 4,
          dropCap: null,
          annotation: null
        } as any);
        line.numNotationsOnLine = 2;
        line.custos = explicit ? custos : new Custos(true);
        var elements = explicit ? [custos, text] : [custos, text, line.custos];
        var calls = elements.map(function() { return 0; });
        elements.forEach(function(element: any, index) {
          // Each notation renders its glyph and attached lyrics together.
          element[method] = function() {
            calls[index]++;
            return '';
          };
        });
        line.startingClef = {};
        line.startingClef[method] = function() { return ''; };
        var canvasCtxt: any = {};
        ['translate', 'beginPath', 'moveTo', 'lineTo', 'stroke'].forEach(function(name) {
          canvasCtxt[name] = function() {};
        });
        ctxt.canvasCtxt = canvasCtxt;

        // Supply a DOM-free node factory for the SVG DOM rendering path.
        var createNode = Drawing.QuickSvg.createNode;
        Drawing.QuickSvg.createNode = function() { return {} as Drawing.SvgElementWithSource; };
        try {
          line[method](ctxt);
        } finally {
          Drawing.QuickSvg.createNode = createNode;
        }
        assert.deepEqual(calls, elements.map(function() { return 1; }));
      });
    });
  });
});

// A verse of an offertory after the return to the offertory: the return has
// its own custos, on its double bar, and the next verse, under another clef,
// starts a line with the custos for its first note and the new clef.
describe('A custos and a clef change at the start of a line', function() {
  var font = fakeFont(0.5);
  var before = '(c3) Dó(h)mi(h)ni.(e) (::h+) <nlba>*~Et introíbit.</nlba>() ';
  var verse = ' V. 2. Ip(b)se.(c) fun(f)dá(e)vit.(d) (::)';
  var forms = ['(Zz0f3)', '(Z) (z0) (f3)', '(Z) (z0f3)'];
  // (long enough for the verse to fill lines of many widths: Tollite portas, verse 2)
  var long = '(c3) há(fh)bi(h)tant(ih/if) in(ef) e(fhGF)o.(fe) (::h+) <nlba>*~Et introíbit.</nlba>() (Zz0f3) ' +
    '<sp>V/</sp> 2 Ip(bf)se(f) su(f)per(fe) má(f/hhf)ri(fe)a(f) fun(f)dá(fe/f/hhivHF)vit(f) e(dxfdevDCBcdb)um(b) (:) ' +
    'et(ba) su(dxd)per(efe) flú(f/hhf)mi(fe!fwgfg)na(gf) (;) præ(dxd)pa(efe)rá(f)vit(fe) ' +
    'e(fh!ivHGhiHFhhf/efef;fh!ivHGhiHFhhf/efef)um.(dyge/ghf/ee/cdc) (::)';

  function create(source: string, lineBreaking: 'greedy' | 'optimal' = 'greedy') {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('serif', 16, {}, { Regular: font });
    ctxt.lineBreaking = lineBreaking;
    var score = new ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, source), false);
    score.performLayout(ctxt);
    return { ctxt, score };
  }

  // the line that starts with a custos, and what it starts with: its opening
  // clef, the custos, the new clef and the first notes, with the space
  // between each and the next, and where the lyrics of the notes start
  function start(score: ChantScore) {
    var line = score.lines.find(function(line) { return score.notations[line.notationsStartIndex] instanceof Custos; })!;
    assert(line, 'a line starts with a custos');
    var [custos, clef, note] = score.notations.slice(line.notationsStartIndex, line.notationsStartIndex + 3);
    return {
      line, custos: custos as Custos, clef: clef as Clef, note,
      spaces: [
        custos.bounds.x - line.startingClef.bounds.right(),
        clef.bounds.x - custos.bounds.right(),
        note.bounds.x - clef.bounds.right()
      ],
      lyricLeft: note.bounds.x + note.lyrics[0].bounds.x
    };
  }

  function assertClose(actual: number, expected: number, message: string) {
    assert(Math.abs(actual - expected) < 1e-6, message + ': ' + actual + ', not ' + expected);
  }

  it('parses each way of writing it as a line break, an automatic custos and a clef', function() {
    forms.forEach(function(form) {
      var { score } = create(before + form + verse);
      var i = score.notations.findIndex(function(n) { return n.constructor.name === 'ChantLineBreak'; });
      var [custos, clef, note] = score.notations.slice(i + 1, i + 4);
      assert(custos instanceof Custos && custos.auto, form);
      assert(clef.isClef && clef.constructor.name === 'FaClef', form);
      assert(note.isNeume, form);
    });
  });

  it('draws the opening clef, the custos under it and the new clef, spaced as at a clef change within a line', function() {
    // the same change within a line, on a staff with room to spare
    var { ctxt, score: within } = create('(c3) Dó(h)mi(h)ni.(e) (z0) (f3) Ip(b)se.(c) fun(f)dá(e)vit.(d) (::)');
    within.layoutChantLines(ctxt, 600);
    var i = within.notations.findIndex(function(n) { return n instanceof Custos; });
    var [last, custos, clef] = within.notations.slice(i - 1, i + 2);
    var beforeCustos = custos.bounds.x - last.bounds.right(), beforeClef = clef.bounds.x - custos.bounds.right();
    assert(beforeCustos > 0 && beforeClef > 0);

    forms.forEach(function(form) {
      var { ctxt, score } = create(before + form + verse);
      score.layoutChantLines(ctxt, 600);
      var { line, custos, clef, note, spaces } = start(score);
      // the opening clef is the old one, and the custos shows the next note under it
      assert.equal(line.startingClef.constructor.name, 'DoClef', form);
      assert.equal(line.startingClef.bounds.x, line.staffLeft, form);
      assert.equal(custos.staffPosition, line.startingClef.pitchToStaffPosition(note.notes![0].pitch!), form);
      assert.equal(clef.constructor.name, 'FaClef', form);
      assertClose(spaces[0], beforeCustos, form + ': the space before the custos');
      assertClose(spaces[1], beforeClef, form + ': the space before the new clef');
      assert(spaces[2] > 0, form);
      assert.match(score.createSvg(ctxt), /<svg/);
    });
  });

  it('keeps that spacing when the line is condensed or stretched to fill the staff', function() {
    (['greedy', 'optimal'] as const).forEach(function(lineBreaking) {
      var { ctxt, score } = create(long, lineBreaking);
      score.layoutChantLines(ctxt, 2000);
      var natural = start(score).spaces;
      var filled = 0;
      for (var width = 200; width <= 700; width += 7) {
        score.layoutChantLines(ctxt, width);
        var { line, note, spaces, lyricLeft } = start(score), at = lineBreaking + ' at ' + width;
        assertClose(spaces[0], natural[0], at + ': the space before the custos');
        assertClose(spaces[1], natural[1], at + ': the space before the new clef');
        // the first note stays clear of the new clef, and its lyrics within the staff
        assert(spaces[2] > natural[2] * (1 - ctxt.condensingTolerance) - 1e-6, at + ': ' + spaces[2]);
        assert(lyricLeft > line.staffLeft - 1e-6, at + ': lyrics start at ' + lyricLeft);
        assert(note.bounds.x > lyricLeft, at);
        // and the line is still filled to the end of the staff, where it's a full line
        if (line !== score.lines[score.lines.length - 1]) {
          assert(line.custos, at);
          assert(Math.abs(line.custos!.bounds.right() - line.staffRight) < 0.5, at + ': ends at ' + line.custos!.bounds.right());
          filled++;
        }
        assert.doesNotMatch(score.createSvg(ctxt), /NaN|Infinity/);
      }
      assert(filled > 20, lineBreaking + ': ' + filled + ' full lines');
    });
  });

  it('gives the line before no automatic custos of its own, for the note that the next line\'s custos shows', function() {
    var toReturn = '(c3) Dó(h)mi(h)ni.(e) (::) <nlba>*~Et introíbit.</nlba>() ';
    // every custos drawn: the notations', and the lines' own automatic ones
    function drawn(source: string, lineBreaking: 'greedy' | 'optimal') {
      var { ctxt, score } = create(source, lineBreaking);
      score.layoutChantLines(ctxt, 600);
      assert.equal(score.lines.length, 2, source);
      assert.match(score.createSvg(ctxt), /<svg/);
      return {
        own: score.notations.filter(function(n) { return n instanceof Custos; }).length,
        endOfLine: score.lines.map(function(line) { return !!line.custos && !score.notations.includes(line.custos); })
      };
    }
    (['greedy', 'optimal'] as const).forEach(function(lineBreaking) {
      // (and before an explicit custos that starts the line, or one with no clef after it)
      forms.concat(['(Zb+f3)', '(z) (z0) (f3)', '(Z) (z0)', '(Z) (b+)']).forEach(function(form) {
        assert.deepEqual(drawn(toReturn + form + verse, lineBreaking), { own: 1, endOfLine: [false, false] }, form);
      });
      // a line break alone still ends its line with a custos, as does a clef that starts the next line
      ['(Z)', '(z)', '(Z) (f3)', '(f3) (Z)'].forEach(function(form) {
        assert.deepEqual(drawn(toReturn + form + verse, lineBreaking), { own: 0, endOfLine: [true, false] }, form);
      });
      // and one that is asked for (gabc Z+) is drawn all the same
      assert.deepEqual(drawn(toReturn + '(Z+z0f3)' + verse, lineBreaking), { own: 1, endOfLine: [true, false] });
      // the custos of the return is the one its line ends with
      assert.deepEqual(drawn(before + '(Zz0f3)' + verse, lineBreaking), { own: 2, endOfLine: [false, false] });
    });
  });

  it('leaves a custos alone at the start of a line, and a clef change after notes, as they were', function() {
    // (only a custos and clef that start the line go with its opening clef)
    var { ctxt, score } = create('(c3) Dó(h)mi(h)ni.(e) (::) (Z) (b+) Ip(b)se.(c) (z0) (f3) fun(b)dá(e)vit.(d) (::)');
    score.layoutChantLines(ctxt, 600);
    var line = score.lines[1], first = line.notationsStartIndex;
    assert(score.notations[first] instanceof Custos);
    assert.equal(line.startsWithClefChangeAt(first), false);
    for (var i = first; i < first + line.numNotationsOnLine; i++) assert.equal(line.startsWithClefChangeAt(i), false, 'notation ' + i);
  });
});
