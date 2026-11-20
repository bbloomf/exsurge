import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "vitest";
import { ChantContext, ChantScore, Clef, Custos, Gabc } from "../src/index.js";
import type { ChantMapping } from "../src/index.js";

const notesOf = (mappings: ChantMapping[]) => mappings.flatMap(mapping =>
  mapping.notations.flatMap(notation => notation.notes || []));
const parse = (source: string) => Gabc.createMappingsFromSource(new ChantContext(), source);
const pitches = (mappings: ChantMapping[]) => notesOf(mappings).map(note => note.pitch!.toInt());
// as they are sung (see ChantScore.getPlaybackPitches(), and test/playbackRegister.test.ts)
const sung = (source: string) => {
  const ctxt = new ChantContext();
  return [...new ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, source), false).getPlaybackPitches().values()];
};

describe("Pitch octaves across clef changes", () => {
  it("reckons the F clef's F as the one above the C clef's C, as Gregorio does", () => {
    assert.equal(Gabc.createClef('c', 4, false).staffPositionToPitch(7).toInt(), 24);
    assert.equal(Gabc.createClef('f', 3, false).staffPositionToPitch(5).toInt(), 29);
    assert.equal(Gabc.createClef('f', 3, false).staffPositionToPitch(3).toInt(), 26);
    assert.equal(Gabc.createClef('c', 4, false).staffPositionToPitch(1).toInt(), 14);
  });

  it("keeps C at the same octave through C/C and F/F changes on all five lines", () => {
    // These written positions all denote the C on the C clef's line, or the one above the F clef's.
    const clefs = ['c1', 'c2', 'c3', 'c4', 'c5', 'f1', 'f2', 'f3', 'f4'];
    const letters = ['d', 'f', 'h', 'j', 'l', 'h', 'j', 'l', 'n'];
    for (let i = 0; i < clefs.length; i++) {
      for (let j = 0; j < clefs.length; j++) {
        if (clefs[i][0] !== clefs[j][0]) continue;
        const source = `(${clefs[i]}) a(${letters[i]}) (${clefs[j]}) b(${letters[j]})`;
        const c = clefs[i][0] === 'c' ? 24 : 36;
        assert.deepEqual(pitches(parse(source)), [c, c], source);
        assert.deepEqual(sung(source), [c, c], source);
      }
    }
    // F5's C lies beyond the gabc note range; check its pitch conversion directly.
    assert.equal(Gabc.createClef('f', 5, false).staffPositionToPitch(13).toInt(), 36);
    // the F on the F clef's line is written an octave above the one under the C clef
    for (let line = 1; line <= 5; line++) {
      const letter = ['d', 'f', 'h', 'j', 'l'][line - 1];
      assert.deepEqual(pitches(parse(`(c4) a(f) (f${line}) b(${letter}) (c4) c(f)`)), [17, 29, 17]);
    }
  });

  it("preserves written octaves and larger leaps", () => {
    assert.deepEqual(pitches(parse('(f3) a(fm) (c4) b(dk) (f3) c(mf)')), [26, 38, 14, 26, 38, 26]);
    // (sung, the notes under the C clef are where a custos shows them from the F clef)
    assert.deepEqual(sung('(f3) a(fm) (c4) b(dk) (f3) c(mf)'), [26, 38, 26, 38, 38, 26]);
  });

  it("keeps flats, naturals and accidental resets at their written pitches", () => {
    const source = '(fb1) a(g) (cb4) b(i) (f1) c(gxg) d(g) (c4) e(ixii) f(iyi)';
    assert.deepEqual(pitches(parse(source)), [34, 22, 34, 35, 22, 22, 23]);
    assert.deepEqual(sung(source), [34, 34, 34, 35, 34, 34, 35]);
  });

  it("uses only the first clef of a pair for pitch", () => {
    assert.deepEqual(pitches(parse('(f3@c4) a(f) (c4@f3) b(d)')), [26, 14]);
    assert.deepEqual(sung('(f3@c4) a(f) (c4@f3) b(d)'), [26, 26]);
  });

  it("keeps the existing treble and Chi-Rho reference octaves", () => {
    for (const clef of ['treble2', 'treble-2'])
      assert.deepEqual(pitches(parse(`(f3) a(l) (${clef}) b(b) (c4) c(j)`)), [36, 24, 24]);
    for (const clef of ['xp3', 'xp-3'])
      assert.deepEqual(pitches(parse(`(f3) a(l) (${clef}) b(h) (c4) c(j)`)), [36, 24, 24]);
  });

  it("recomputes kept notes when clefs are inserted, edited or removed", () => {
    const ctxt = new ChantContext();
    const mappings = Gabc.createMappingsFromSource(ctxt, '(f3) a(f) (c4) b(d) c(ixi)');
    for (const source of [
      '(f3) a(f) (f4) b(d) c(ixi)',
      '(c4) a(f) (f4) b(d) c(ixi)',
      '(c4) a(f) b(d) c(ixi)',
      '(c4) a(f) (fb3) b(d) c(ixi)',
      '(f3) a(f) (c4) b(d) c(ixi)'
    ]) {
      const kept = notesOf(mappings).slice(-2);
      Gabc.updateMappingsFromSource(ctxt, mappings, source);
      assert.equal(notesOf(mappings).slice(-2)[0], kept[0]);
      assert.deepEqual(pitches(mappings), pitches(parse(source)), source);
    }
    assert.deepEqual(pitches(mappings), [26, 14, 22]);
  });

  it("places automatic custodes across the F3/C4 change as Gregorio does, and explicit ones as written", () => {
    for (const [source, position] of [
      ['(f3) a(f) (z0::c4) b(d)', 3],
      ['(f3) a(f) (f+z0::c4) b(d)', 3],
      // (the D under the F clef is reckoned an octave above the one under the C clef)
      ['(c4) a(d) (z0::f3) b(f)', 8],
      ['(c4) a(d) (d+z0::f3) b(f)', 1]
    ] as const) {
      const ctxt = new ChantContext();
      const score = new ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, source), false);
      score.performLayout(ctxt);
      score.layoutChantLines(ctxt, 600);
      const explicit = score.notations.find(notation => notation instanceof Custos) as Custos | undefined;
      const custos = explicit || score.lines[0].custos;
      assert.ok(custos, source);
      assert.equal(custos.staffPosition, position, source);
      assert.deepEqual(score.notations.filter(notation => notation.isClef).map(notation =>
        (notation as Clef).sourceGabc), [source.startsWith('(f3)') ? 'c4' : 'f3']);
    }
  });

  it("sings the actual Ad te Domine / full verse 1 join as D to D", () => {
    const source = readFileSync(new URL('./fixtures/ad-te-domine-verse-1.gabc', import.meta.url), 'utf8');
    const ctxt = new ChantContext();
    const score = new ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, source), false);
    const notes = notesOf(score.mappings), played = score.getPlaybackPitches();
    const join = source.indexOf('(z0::c4)');
    const before = notes.filter(note => note.sourceIndex! < join).slice(-2);
    const after = notes.filter(note => note.sourceIndex! > join).slice(0, 2);
    assert.deepEqual(before.map(note => [note.sourceGabc, played.get(note)]), [['g', 28], ['f..', 26]]);
    assert.deepEqual(after.map(note => [note.sourceGabc, played.get(note)]), [['d', 26], ['h', 33]]);
  });
});
