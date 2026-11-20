import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'vitest';
import { ChantContext, ChantScore, Clef, Custos, Gabc } from '../src/index.js';
import { fakeFont } from './helpers/fonts';

const font = fakeFont(0.5);
const notesOf = (score: ChantScore) => score.notations.flatMap(n => n.notes || []);
const written = (score: ChantScore) => notesOf(score).map(n => [n.sourceGabc, n.staffPosition, n.pitch!.toInt()]);
const played = (score: ChantScore) => [...score.getPlaybackPitches().values()];

function create(source: string) {
  const ctxt = new ChantContext();
  ctxt.setFont('serif', 16, {}, { Regular: font });
  const score = new ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, source), false);
  return { ctxt, score };
}

function layout(ctxt: ChantContext, score: ChantScore, width = 600) {
  score.performLayout(ctxt);
  score.layoutChantLines(ctxt, width);
  assert.match(score.createSvg(ctxt), /<svg/);
}

// the staff position of every custos: the notations', then the lines' own
const custodes = (score: ChantScore) => [
  ...score.notations.filter(n => n instanceof Custos),
  ...score.lines.map(line => line.custos).filter(custos => custos && !score.notations.includes(custos))
].map(custos => (custos as Custos).staffPosition);

// Reads each drawn custos back under the clef it is drawn with, in the octave
// the notes before it are sung in, and compares that with the note after it
// as it is played: the same note, and (unless anyOctave) at the same pitch.
// (Only the custodes that which() picks: an explicit custos needn't be for
// the note after it.)
function assertCustodesAgree(score: ChantScore, anyOctave = false, which = (_custos: Custos) => true) {
  const pitches = score.getPlaybackPitches();
  let clef = score.startingClef, offset = 0, checked = 0;
  const check = (custos: Custos, after: number) => {
    if (!which(custos)) return;
    const next = score.notations.slice(after + 1).flatMap(n => n.notes || [])[0];
    if (!next) return;
    const difference = Math.abs(clef.staffPositionToPitch(custos.staffPosition).toInt() + offset - pitches.get(next)!);
    assert.equal(anyOctave ? difference % 12 : difference, 0, `custos after notation ${after}`);
    checked++;
  };
  score.notations.forEach((n, i) => {
    if (n.isClef) clef = n as Clef;
    if (n instanceof Custos) check(n, i);
    if (n.notes?.length) {
      const last = n.notes[n.notes.length - 1];
      offset = pitches.get(last)! - last.pitch!.toInt();
    }
    for (const line of score.lines) {
      if (line.notationsStartIndex + line.numNotationsOnLine - 1 === i &&
          line.custos && !score.notations.includes(line.custos))
        check(line.custos, i);
    }
  });
  assert.ok(checked, 'rendered at least one custos');
}

// The six changes between a do and a fa clef in Ott's Offertoriale (1935):
// the notes around each, the staff position its custos is printed at, and
// the interval which that shows from the last note before it.
const printed = [
  ['Ad te Domine, p. 5', '(f3) tur.(gf) (z0::c4) Dí(dh)', 3, 0],
  ['Tollite portas, p. 15', '(c3) o.(fe) (::) (z0::f3) I(bf)', 2, 0],
  ['Dextera Domini, p. 25', '(c4) ni.(iih) (z0::f3) In(c) tri(egf)', 5, 0],
  ['Laudate Dominum, p. 40', '(f3) ra.(gf) (z0::c3) Qui(ef)', -1, -7],
  // (the one that isn't where an automatic custos goes, and so is written)
  ['Meditabor, p. 109', '(c3) xi.(gf) (a+::f3) Pars(ef)', -2, -9],
  ['Anima nostra, p. 146', '(f3) mus.(fgf) (z0::c3) Ni(fe)', 0, -5]
] as const;

describe('Sung pitches and custodes across clef changes', () => {
  it('places the custos of each do/fa clef change in the 1935 Offertoriale as printed, and sings from it', () => {
    for (const [name, source, position, interval] of printed) {
      const { ctxt, score } = create(source), before = written(score);
      const sung = played(score), first = notesOf(score).findIndex(n => n.sourceIndex! > source.indexOf('::'));
      assert.equal(sung[first] - sung[first - 1], interval, name);
      layout(ctxt, score);
      assert.deepEqual(custodes(score), [position], name);
      // (the same before a layout as after it)
      assert.deepEqual(played(score), sung, name);
      assertCustodesAgree(score);
      assert.deepEqual(written(score), before, name);
    }
  });

  it('sings the written pitches, an octave from them only where a custos is', () => {
    for (const [source, expected] of [
      ['(c4) A(h) (z0::f3) B(c) C(ef)', [21, 21, 24, 26]],
      // (the custos is an octave nearer than the note is written)
      ['(f3) A(f) (z0::c4) B(d) C(hj)', [26, 26, 33, 36]],
      ['(f3) a(fm) (z0::c4) b(dk)', [26, 38, 26, 38]],
      ['(fb1) a(g) (z0::cb4) b(i) c(ixii) d(iyi)', [34, 34, 34, 34, 35]]
    ] as const) {
      const { ctxt, score } = create(source);
      assert.deepEqual(played(score), expected, source);
      const pitches = score.getPlaybackPitches();
      // every interval but the one across the change is as it is written
      for (const n of score.notations) for (let i = 1; i < (n.notes?.length || 0); i++)
        assert.equal(pitches.get(n.notes![i])! - pitches.get(n.notes![i - 1])!,
          n.notes![i].pitch!.toInt() - n.notes![i - 1].pitch!.toInt());
      layout(ctxt, score);
      assertCustodesAgree(score);
    }
  });

  it('sings the note after any do/fa clef change where its automatic custos shows it', () => {
    const clefs = ['c1', 'c2', 'c3', 'c4', 'f1', 'f2', 'f3', 'f4'];
    for (const from of clefs) for (const to of clefs) for (const notes of ['a', 'f', 'm']) {
      if (from[0] === to[0]) continue;
      const source = `(${from}) A(h) (z0::${to}) B(${notes})`;
      const { ctxt, score } = create(source);
      layout(ctxt, score);
      assertCustodesAgree(score);
    }
  });

  it('follows an explicit custos before the change, in whichever octave it is written', () => {
    for (const [source, expected, positions] of [
      ['(c3) A(f) (h+::f3) B(e)', [21, 24], [5]],
      ['(c3) A(f) (a+::f3) B(e)', [21, 12], [-2]],
      ['(c4) A(h) (a+::f3) B(c)', [21, 9], [-2]],
      ['(f3) A(f) (m+::c4) B(d) C(h)', [26, 38, 45], [10]],
      // (the last custos before the change, though an automatic one comes before it)
      ['(c4) A(d) (z0d+::f3) B(f)', [14, 14], [8, 1]]
    ] as const) {
      const { ctxt, score } = create(source);
      assert.deepEqual(played(score), expected, source);
      layout(ctxt, score);
      assert.deepEqual(custodes(score), positions, source);
      assert.deepEqual(played(score), expected, source);
      if (positions.length === 1) assertCustodesAgree(score);
    }
  });

  it('goes by an automatic custos after an explicit one, which is then for something else', () => {
    // The return to the offertory after a verse has its own custos, where
    // the return begins; the next verse, under another clef, then starts a
    // line with the custos for its own first note.  Here the two are the same
    // note an octave apart, so the custos of the return could be taken for
    // the custos of the change.
    const [toReturn, verse] = ['(c3) A(h) (::l+) <nlba>*~Et introíbit.</nlba>() ', ' B(b) C(h)'];
    for (const [source, expected, positions] of [
      [toReturn + '(Zz0f3)' + verse, [24, 19, 29], [9, 2]],
      [toReturn + '(Z) (z0) (f3)' + verse, [24, 19, 29], [9, 2]],
      [toReturn + '(Z) (z0f3)' + verse, [24, 19, 29], [9, 2]],
      // (an octave the other way)
      ['(c3) A(h) (::a+) <nlba>*~Et introíbit.</nlba>() (Zz0f3) B(l) C(h)', [24, 24, 17], [-2, 5]],
      // (with nothing between the two custodes)
      ['(c3) A(h) (l+z0::f3) B(b) C(h)', [24, 19, 29], [9, 2]],
      ['(c4) A(d) (d+z0::f3) B(f)', [14, 26], [1, 8]],
      // as it is sung when the return has no custos (and the line before the
      // verse gets none either, for the note that the verse's own custos shows)
      ['(c3) A(h) (::) <nlba>*~Et introíbit.</nlba>() (Zz0f3) B(b) C(h)', [24, 19, 29], [2]],
      // (Tollite portas, where the return's custos is on another note anyway)
      ['(c3) e(fhGF)o.(fe) (::h+) <nlba>*~Et introíbit.</nlba>() (Zz0f3) Ip(bf)se(f)', [21, 24, 23, 21, 21, 19, 19, 26, 26], [5, 2]]
    ] as const) {
      const { ctxt, score } = create(source);
      assert.deepEqual(played(score), expected, source);
      for (const breaking of ['greedy', 'optimal'] as const) {
        ctxt.lineBreaking = breaking;
        layout(ctxt, score);
        assert.deepEqual(custodes(score), positions, source);
        assert.deepEqual(played(score), expected, source);
        // the note after the change is sung where the automatic custos shows it
        assertCustodesAgree(score, false, custos => custos.auto);
      }
    }
  });

  it('still follows an explicit custos with no automatic one after it', () => {
    for (const [source, expected] of [
      // the custos of the return is the only one before the change
      ['(c3) A(h) (::l+) <nlba>*~Et introíbit.</nlba>() (Z) (f3) B(b) C(h)', [24, 31, 41]],
      // an explicit custos for the change, after the custos of the return
      ['(c3) A(h) (::h+) <nlba>*~Et introíbit.</nlba>() (Zl+f3) B(b) C(h)', [24, 31, 41]],
      ['(c3) A(h) (::l+) <nlba>*~Et introíbit.</nlba>() (Zb+f3) B(b) C(h)', [24, 19, 29]],
      // (and after an automatic one)
      ['(c3) A(h) (::h+) <nlba>*~Et introíbit.</nlba>() (Zz0l+f3) B(b) C(h)', [24, 31, 41]]
    ] as const) {
      const { ctxt, score } = create(source);
      assert.deepEqual(played(score), expected, source);
      layout(ctxt, score);
      assert.deepEqual(played(score), expected, source);
    }
  });

  it('goes by where an automatic custos would be when an explicit one says nothing of the change', () => {
    for (const [source, positions] of [
      // on another note than the one after the change
      ['(c4) A(h) (g+::f3) B(c)', [4]],
      // after the new clef, and so drawn with it
      ['(c4) A(h) (::f3) (c+) B(c)', [0]],
      // no custos at all
      ['(c4) A(h) (::f3) B(c)', []],
      ['(c4) A(h) (f3) B(c)', []]
    ] as const) {
      const { ctxt, score } = create(source);
      assert.deepEqual(played(score), [21, 21], source);
      layout(ctxt, score);
      assert.deepEqual(custodes(score), positions, source);
    }
    // (an octave nearer, as the automatic custos of the change is)
    assert.deepEqual(played(create('(f3) A(f) (::c4) B(d)').score), [26, 26]);
    assert.deepEqual(played(create('(f3) A(f) (c4) B(d)').score), [26, 26]);
  });

  it('keeps the octave of each kind of clef through later changes', () => {
    for (const [source, expected, positions] of [
      // back under the fa clef, its notes are sung as they were before
      ['(f3) A(f) (z0::c4) B(d) C(hj) (z0::f3) D(f)', [26, 26, 33, 36, 26], [3, 8]],
      ['(f3) a(fm) (c4) b(dk) (f3) c(mf)', [26, 38, 26, 38, 38, 26], []],
      // (the custos of the way back is beyond the staff, and so an octave nearer)
      ['(c4) A(e) B(h) (z0::f3) C(c) (z0::c4) D(e)', [16, 21, 21, 16], [5, 4]],
      // (with the custos of a line break among them)
      ['(c4) A(h) (z0::f3) B(c) (z) C(ef) (z0::c4) D(h) (z0::f2) E(a)', [21, 21, 24, 26, 21, 21], [5, 0, 5, 2]],
      // other changes of clef are sung as they are written
      ['(f3) A(f) (z0::c4) B(d) (z0::c2) C(h) (z0::f3) D(f)', [26, 26, 40, 26], [3, 9, 4]]
    ] as const) {
      const { ctxt, score } = create(source);
      assert.deepEqual(played(score), expected, source);
      for (const breaking of ['greedy', 'optimal'] as const)
        for (const width of [600, 120, 600]) {
          ctxt.lineBreaking = breaking;
          layout(ctxt, score, width);
          assert.deepEqual(played(score), expected, source);
        }
      if (positions.length) {
        assert.deepEqual(custodes(score), positions, source);
        // each custos shows the note that is played, whichever octave of it
        assertCustodesAgree(score, true);
      }
    }
  });

  it('follows an explicit custos at a later change too', () => {
    assert.deepEqual(played(create('(f3) A(f) (z0::c4) B(d) (k+::f3) C(f)').score), [26, 26, 38]);
    assert.deepEqual(played(create('(f3) A(f) (z0::c4) B(d) (d+::f3) C(f)').score), [26, 26, 26]);
    assert.deepEqual(played(create('(f3) A(f) (z0::c4) B(d) (k+::f3) C(f) (z0::c4) D(d)').score), [26, 26, 38, 26]);
    // (but not the custos of a return, with an automatic custos after it for the change)
    assert.deepEqual(played(create('(f3) A(f) (z0::c4) B(d) (::k+) <nlba>*~Et.</nlba>() (Zz0f3) C(f)').score), [26, 26, 26]);
  });

  it('goes by the note the custos is for, after notes that have no width', () => {
    const { ctxt, score } = create('(c4) A(h) (z0::f3) B({m}c)');
    layout(ctxt, score);
    assert.deepEqual(custodes(score), [5]);
    assert.deepEqual(played(score), [21, 38, 21]);
  });

  it('sings changes between clefs of the same kind, and to other clefs, as they are written', () => {
    for (const source of [
      '(c4) A(h) (z0::c2) B(a)',
      '(c1) A(m) (z0::c4) B(a)',
      '(f3) A(c) (z0::f2) B(m)',
      '(treble2) A(h) (z0::f3) B(c)',
      '(f3) A(l) (z0::treble2) B(b) (z0::c4) C(j)',
      '(xp3) A(h) (z0::c4) B(c)'
    ]) {
      const { ctxt, score } = create(source);
      layout(ctxt, score);
      assert.deepEqual(played(score), notesOf(score).map(n => n.pitch!.toInt()), source);
    }
  });

  it('leaves the written notes, flats and explicit custodes as they are', () => {
    const { ctxt, score } = create('(cb4) A(ixi) (h+z0::fb3) B(cd) C(cm) (z0::c4) D(h)');
    const before = written(score);
    const explicit = score.notations.find(n => n instanceof Custos && !n.auto) as Custos;
    const position = explicit.staffPosition;
    const sung = score.getPlaybackPitches();
    sung.clear(); // (each call makes its own)
    layout(ctxt, score);
    assert.equal(explicit.staffPosition, position);
    assert.deepEqual(written(score), before);
    assert.equal(score.getPlaybackPitches().size, before.length);
  });

  it('gives the pages of a paginated score, which have no notations, no pitches', () => {
    const { ctxt, score } = create('(c4) A(h) (z0::f3) B(c) (z) C(ef) (z0::c4) D(h) (z) E(h)');
    layout(ctxt, score, 200);
    score.paginate(60);
    assert.ok(score.pages.length > 1);
    for (const page of score.pages) assert.equal(page.getPlaybackPitches().size, 0);
    assert.equal(new ChantScore().getPlaybackPitches().size, 0);
  });

  it('follows an edit of the clef or of the custos', () => {
    const { ctxt, score } = create('(f3) A(f) (z0::c4) B(d)');
    layout(ctxt, score);
    for (const [source, expected] of [
      ['(f3) A(f) (m+::c4) B(d)', [26, 38]],
      ['(f3) A(f) (z0::c4) B(d)', [26, 26]],
      ['(c4) A(f) (z0::c4) B(d)', [17, 14]],
      ['(c4) A(f) (z0::f3) B(d)', [17, 23]],
      ['(c4) A(f) (b+::f3) B(d)', [17, 11]]
    ] as const) {
      Gabc.updateMappingsFromSource(ctxt, score.mappings, source);
      score.updateNotations(ctxt);
      assert.deepEqual(played(score), expected, source);
      layout(ctxt, score);
      assert.deepEqual(played(score), expected, source);
      assertCustodesAgree(score);
    }
  });

  it('sings the same pitches after an asynchronous layout', async () => {
    const { ctxt, score } = create('(c4) A(h) (z0::f3) B(c) (z0::c4) C(h)');
    await new Promise<void>(resolve => score.performLayoutAsync(ctxt, resolve));
    score.layoutChantLines(ctxt, 200);
    assertCustodesAgree(score);
    assert.deepEqual(played(score), [21, 21, 21]);
  });

  it('joins the real Dextera Domini and Ad te Domine to their verses at a unison, after initial and incremental parsing', () => {
    const dextera = readFileSync(new URL('./fixtures/dextera-domini-verse-1.gabc', import.meta.url), 'utf8');
    const adTe = readFileSync(new URL('./fixtures/ad-te-domine-verse-1.gabc', import.meta.url), 'utf8');
    const { ctxt, score } = create(dextera);
    for (const source of [dextera, adTe, dextera.replace('(z0::f3)', '(z0::fb3)'), dextera]) {
      Gabc.updateMappingsFromSource(ctxt, score.mappings, source);
      score.updateNotations(ctxt);
      const before = written(score);
      layout(ctxt, score);
      assertCustodesAgree(score);
      assert.deepEqual(written(score), before);
      const notes = notesOf(score), i = notes.findIndex(n => n.sourceIndex! > source.indexOf('(z0::'));
      const sung = score.getPlaybackPitches();
      assert.equal(sung.get(notes[i - 1]), sung.get(notes[i]));
    }
  });
});
