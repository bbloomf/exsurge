import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'vitest';
import { ChantContext, ChantScore, Clef, Custos, Gabc, Note } from '../src/index.js';
import { fakeFont } from './helpers/fonts';

const font = fakeFont(0.5);
const notesOf = (score: ChantScore) => score.notations.flatMap(n => n.notes || []);
const written = (score: ChantScore) => notesOf(score).map(n => [n.sourceGabc, n.staffPosition, n.pitch!.toInt()]);

function markSections(score: ChantScore) {
  // Tests explicitly mark the first sung note after each double bar. The
  // application supplies provenance, rather than inferring it in the library.
  let pending = false;
  const starts = new Set<Note>();
  for (const n of score.notations) {
    if (n.isDivider && n.sourceGabc?.startsWith('::')) pending = true;
    if (n.notes?.length) {
      if (pending) starts.add(n.notes[0]);
      pending = false;
    }
  }
  score.playbackSections = starts;
}

function create(source: string, marked = true) {
  const ctxt = new ChantContext();
  ctxt.setFont('serif', 16, {}, { Regular: font });
  const score = new ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, source), false);
  if (marked) markSections(score);
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

// Independently interpret each rendered automatic custos under its active
// written clef and add the preceding section's singing displacement.
function assertCustodesAgree(score: ChantScore) {
  const pitches = score.getPlaybackPitches();
  let clef = score.startingClef, offset = 0, checked = 0;
  const check = (custos: Custos, after: number, active: Clef, singingOffset: number) => {
    if (!custos.auto) return;
    const next = score.notations.slice(after + 1).flatMap(n => n.notes || [])[0];
    if (!next) return;
    assert.equal(active.staffPositionToPitch(custos.staffPosition).toInt() + singingOffset,
      pitches.get(next), `custos after notation ${after}`);
    checked++;
  };
  score.notations.forEach((n, i) => {
    if (n.isClef) clef = n as Clef;
    if (n instanceof Custos) check(n, i, clef, offset);
    if (n.notes?.length) {
      const last = n.notes[n.notes.length - 1];
      offset = pitches.get(last)! - last.pitch!.toInt();
    }
    for (const line of score.lines) {
      if (line.notationsStartIndex + line.numNotationsOnLine - 1 === i &&
          line.custos && !score.notations.includes(line.custos))
        check(line.custos, i, clef, offset);
    }
  });
  assert.ok(checked, 'rendered at least one automatic custos');
}

describe('Shared singing registers and automatic custodes', () => {
  it('retains the direction of tritone ties across multiple octaves', () => {
    for (const [interval, source] of [
      [-30, '(c1) A(j) (z0::f3) B(a)'],
      [-18, '(c1) A(j) (z0::f1) B(d)'],
      [-6, '(c1) A(j) (z0::f1) B(k)'],
      [6, '(c1) A(c) (z0::f1) B(k)'],
      [18, '(c4) A(b) (z0::f1) B(k)'],
      [30, '(f3) A(a) (z0::c1) B(j)']
    ] as const) {
      const { ctxt, score } = create(source), notes = notesOf(score);
      assert.equal(notes[1].pitch!.toInt() - notes[0].pitch!.toInt(), interval);
      const played = [...score.getPlaybackPitches().values()];
      assert.equal(played[1] - played[0], Math.sign(interval) * 6);
      layout(ctxt, score);
      assertCustodesAgree(score);
    }
  });

  it('aligns C/F and F/C joins without changing the written notes', () => {
    for (const [source, expected, position] of [
      ['(c4) A(h) (z0::f3) B(c)', [21, 21], 5],
      ['(f3) A(c) (z0::c4) B(h)', [9, 9], 0],
      ['(f3) A(f) (z0::c4) B(d)', [14, 14], 3]
    ] as const) {
      const { ctxt, score } = create(source), before = written(score);
      layout(ctxt, score);
      assert.deepEqual([...score.getPlaybackPitches().values()], expected);
      assert.equal((score.notations.find(n => n instanceof Custos) as Custos).staffPosition, position);
      assertCustodesAgree(score);
      assert.deepEqual(written(score), before);
    }
  });

  it('uses the preceding shifted section at reverse joins and ordinary line breaks', () => {
    for (const source of [
      '(c4) A(h) (z0::f3) B(c) (z) C(ef) (z0::c4) D(h)',
      '(f3) A(c) (z0::c4) B(h) (z) C(jk) (z0::f3) D(c)'
    ]) {
      const { ctxt, score } = create(source), before = written(score);
      for (const breaking of ['greedy', 'optimal'] as const)
        for (const width of [600, 120, 600]) {
          ctxt.lineBreaking = breaking;
          layout(ctxt, score, width);
          assertCustodesAgree(score);
          assert.deepEqual(written(score), before);
        }
    }
  });

  it('preserves explicit custodes, flats, and written melodic octaves', () => {
    const { ctxt, score } = create('(cb4) A(ixi) (h+z0::fb3) B(cd) C(cm) (z0::c4) D(h)');
    const before = written(score);
    const explicit = score.notations.find(n => n instanceof Custos && !n.auto) as Custos;
    const position = explicit.staffPosition;
    layout(ctxt, score);
    assert.equal(explicit.staffPosition, position);
    assert.deepEqual(written(score), before);
    const pitches = score.getPlaybackPitches();
    for (const n of score.notations) for (let i = 1; i < (n.notes?.length || 0); i++)
      assert.equal(pitches.get(n.notes![i])! - pitches.get(n.notes![i - 1])!,
        n.notes![i].pitch!.toInt() - n.notes![i - 1].pitch!.toInt());
    assertCustodesAgree(score);
  });

  it('does not infer registers for unmarked scores, same-clef joins or internal clef changes', () => {
    for (const [source, marked] of [
      ['(c4) A(h) (z0::f3) B(c)', false],
      ['(c4) A(h) (z0::c4) B(a)', true],
      ['(c4) A(h) (f3) B(c)', true],
      ['(treble2) A(h) (z0::f3) B(c)', true],
      ['(xp3) A(h) (z0::c4) B(c)', true]
    ] as const) {
      const { ctxt, score } = create(source, marked), plain = create(source, false);
      assert.deepEqual([...score.getPlaybackPitches().values()], notesOf(score).map(n => n.pitch!.toInt()));
      // laid out, their custodes are where an unmarked score puts them
      for (const width of [600, 120]) {
        layout(ctxt, score, width);
        layout(plain.ctxt, plain.score, width);
        assert.deepEqual(custodes(score), custodes(plain.score), source);
      }
    }
  });

  it('folds the custodes that are not before a reconciled section into the staff', () => {
    const source = '(c2) A(h) (z0::f3) B(g) C(d) (z0) (c2) D(g) (z0) (f3) E(c)';
    const { ctxt, score } = create(source), plain = create(source, false);
    layout(ctxt, score);
    layout(plain.ctxt, plain.score);
    assert.deepEqual(custodes(score), [5, ...custodes(plain.score).slice(1)]);
  });

  it('reconciles a clef change written before or after the bar, and places a custos by its own clef', () => {
    for (const [source, position] of [
      ['(c4) A(h) (z0::f3) B(c)', 5],
      ['(c4) A(h) (z0) (f3) (::) B(c)', 5],
      ['(c4) A(h) (z0f3::) B(c)', 5],
      // under the section's own clef, the custos is where its note is
      ['(c4) A(h) (::) (f3) (z0) B(c)', 0],
      ['(c4) A(h) (::f3z0) B(c)', 0]
    ] as const) {
      const { ctxt, score } = create(source);
      layout(ctxt, score);
      assert.deepEqual([...score.getPlaybackPitches().values()], [21, 21], source);
      assert.deepEqual(custodes(score), [position], source);
    }
  });

  it('keeps the custos and the layout finite when a section is sung below octave 0', () => {
    const { ctxt, score } = create('(f4) A(a) (z0::c4) B(a)');
    layout(ctxt, score);
    assert.deepEqual([...score.getPlaybackPitches().values()], [2, -3]);
    assert.deepEqual(custodes(score), [-5]);
    assert.ok(Number.isFinite(score.bounds.height));
    assertCustodesAgree(score);
  });

  it('gives the pages of a paginated score, which have no notations, no pitches', () => {
    const { ctxt, score } = create('(c4) A(h) (z0::f3) B(c) (z) C(ef) (z0::c4) D(h) (z) E(h)');
    layout(ctxt, score, 200);
    score.paginate(60);
    assert.ok(score.pages.length > 1);
    for (const page of score.pages) assert.equal(page.getPlaybackPitches().size, 0);
    assert.equal(new ChantScore().getPlaybackPitches().size, 0);
  });

  it('keeps the laid out lines when the same starts are assigned again, and drops the ones an edit replaced', () => {
    const { ctxt, score } = create('(c4) A(h) (z0::f3) B(c) (z) C(d)');
    layout(ctxt, score);
    const lines = score.lines.slice();
    score.playbackSections = new Set(score.playbackSections);
    layout(ctxt, score);
    assert.ok(score.lines.length > 1 && score.lines.every((line, i) => line === lines[i]));
    Gabc.updateMappingsFromSource(ctxt, score.mappings, '(c4) A(h) (z0::f3) B(d) (z) C(d)');
    score.updateNotations(ctxt);
    assert.equal(score.playbackSections!.size, 0);
    layout(ctxt, score);
    assert.deepEqual([...score.getPlaybackPitches().values()], notesOf(score).map(n => n.pitch!.toInt()));
  });

  it('invalidates layouts when section sets are replaced, cleared or reassigned', () => {
    const { ctxt, score } = create('(c4) A(h) (z0::f3) B(c)', false);
    const custos = score.notations.find(n => n instanceof Custos) as Custos;
    layout(ctxt, score);
    assert.equal(custos.staffPosition, -2);
    const starts = new Set([notesOf(score)[1]]);
    score.playbackSections = starts;
    starts.clear(); // the setter owns a copy
    layout(ctxt, score);
    assert.equal(custos.staffPosition, 5);
    score.getPlaybackPitches().clear(); // result mutation cannot change layout
    score.playbackSections = new Set(score.playbackSections);
    layout(ctxt, score);
    assertCustodesAgree(score);
    score.playbackSections = undefined;
    layout(ctxt, score);
    assert.equal(custos.staffPosition, -2);
  });

  it('uses the same registers in asynchronous layout', async () => {
    const { ctxt, score } = create('(c4) A(h) (z0::f3) B(c) (z0::c4) C(h)');
    await new Promise<void>(resolve => score.performLayoutAsync(ctxt, resolve));
    score.layoutChantLines(ctxt, 200);
    assertCustodesAgree(score);
    assert.deepEqual([...score.getPlaybackPitches().values()], [21, 21, 21]);
  });

  it('reconciles real Dextera Domini and Ad te Domine after initial and incremental parsing', () => {
    const dextera = readFileSync(new URL('./fixtures/dextera-domini-verse-1.gabc', import.meta.url), 'utf8');
    const adTe = readFileSync(new URL('./fixtures/ad-te-domine-verse-1.gabc', import.meta.url), 'utf8');
    const { ctxt, score } = create(dextera);
    for (const source of [dextera, adTe, dextera.replace('(z0::f3)', '(z0::fb3)'), dextera]) {
      Gabc.updateMappingsFromSource(ctxt, score.mappings, source);
      score.updateNotations(ctxt);
      markSections(score);
      const before = written(score);
      layout(ctxt, score);
      assertCustodesAgree(score);
      assert.deepEqual(written(score), before);
      const notes = notesOf(score), start = [...score.playbackSections!][0], i = notes.indexOf(start);
      const played = score.getPlaybackPitches();
      assert.equal(played.get(notes[i - 1]), played.get(start));
    }
  });
});
