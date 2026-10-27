// ctxt.lineBreaking = "optimal": the line breaks of the whole score chosen
// together, as Gregorio chooses them (see LineBreaker)

import { describe, it } from "vitest";
import assert from "node:assert";
import * as E from "../src/index.js";
import { featureCases, settingCases } from "./golden/cases";
import { render, type RenderOptions } from "./golden/harness";

const puer = featureCases.find((c) => c.name === "puer-natus-est")!.gabc;
const adTeLevavi = featureCases.find((c) => c.name === "ad-te-levavi")!.gabc;
const salveRegina = featureCases.find((c) => c.name === "salve-regina")!.gabc;

async function layOut(gabc: string, options: RenderOptions & { lineBreaking?: "greedy" | "optimal" } = {}) {
  const { score, ctxt } = await render(
    E,
    gabc,
    {
      ...options,
      setupContext: (ctxt) => {
        ctxt.lineBreaking = options.lineBreaking || "optimal";
        if (options.setupContext) options.setupContext(ctxt, E);
      }
    },
    []
  );
  return { score, ctxt };
}

/** the index of the first notation on each line */
const lineStarts = (score: any): number[] => score.lines.map((line: any) => line.notationsStartIndex);

/** where each notation and its lyrics are, and how wide its lyrics are */
const positions = (score: any) =>
  score.notations.map((n: any) => [n.bounds.x, ...n.lyrics.map((lyric: any) => [lyric.bounds.x, lyric.bounds.width])]);

/** where a new LineBreaker plans each line of a laid-out score to end, leaving out extraLines as given */
function plannedEnds(score: any, ctxt: any, width: number, extraLines: number) {
  const breaker = new E.LineBreaker(score, ctxt, width);
  breaker.extraLines = extraLines;
  const ends: (number | undefined)[] = [];
  for (let line = 0, start = 0; start !== undefined && start < score.notations.length; line++) {
    start = breaker.plannedEnd(line, start)!;
    ends.push(start);
  }
  return ends;
}

/** the notations on each line, as the gabc of their notes or the text of their lyrics */
function lineContents(score: any) {
  return score.lines.map((line: any) =>
    score.notations
      .slice(line.notationsStartIndex, line.notationsStartIndex + line.numNotationsOnLine)
      .map((notation: any) => (notation.notes || []).map((note: any) => note.sourceGabc).join("") || notation.constructor.name)
  );
}

describe("optimal line breaking", () => {
  it("is off by default", () => {
    assert.strictEqual(new E.ChantContext().lineBreaking, "greedy");
  });

  it("builds each line to end where it was planned to", async () => {
    for (const width of [150, 220, 330, 470, 600, 700]) {
      const { score } = await layOut(puer, { useDropCap: true, width });
      for (const line of score.lines) {
        assert.notStrictEqual(line.plannedEnd, undefined, `line ${line.elementIndex} at ${width}`);
        assert.strictEqual(line.notationsStartIndex + line.numNotationsOnLine, line.plannedEnd);
      }
    }
  });

  it("plans the lines beside a drop cap over several lines with the room it takes", async () => {
    for (const dropCapLines of [2, 3]) {
      for (const width of [220, 330, 470]) {
        const { score, ctxt } = await layOut(puer, {
          useDropCap: true,
          width,
          setupContext: (ctxt) => (ctxt.dropCapLines = dropCapLines)
        });
        assert(score.lines.length > dropCapLines);
        assert(score.lines[1].staffLeft > 0 && score.lines[dropCapLines].staffLeft === 0);
        const breaker = new E.LineBreaker(score, ctxt, width);
        score.lines.forEach((line: any, i: number) => {
          // (a line that starts with a change of clef is planned from the clef)
          const start = line.notationsStartIndex - (score.notations[line.notationsStartIndex - 1]?.isClef ? 1 : 0);
          const { staffLeft, paddingLeft, staffRight } = line;
          assert.deepStrictEqual(breaker.getLineExtent(i, start), { staffLeft, paddingLeft, staffRight }, `line ${i}`);
          assert.strictEqual(line.notationsStartIndex + line.numNotationsOnLine, line.plannedEnd);
        });
      }
    }
  });

  it("puts each notation on one line, in order", async () => {
    for (const width of [150, 330, 600]) {
      const { score } = await layOut(puer, { useDropCap: true, width });
      let next = 0;
      for (const line of score.lines) {
        // (a clef at the start of a line is its starting clef)
        if (line.notationsStartIndex !== next) assert(score.notations[next].isClef);
        next = line.notationsStartIndex + line.numNotationsOnLine;
      }
      assert.strictEqual(next, score.notations.length);
    }
  });

  it("breaks at gabc z and Z, and nowhere else when everything fits", async () => {
    const { score } = await layOut("(c4) Ky(f)ri(g)e(h) (z) e(g)lé(f)i(e)son.(f) (Z) Chri(g)ste(h) (::)", { width: 600 });
    assert.deepStrictEqual(lineContents(score), [
      ["f", "g", "h", "ChantLineBreak"],
      ["g", "f", "e", "f", "ChantLineBreak"],
      ["g", "h", "DoubleBar"]
    ]);
    // (z is justified and Z isn't)
    assert.strictEqual(score.lines[0].justify, true);
    assert.strictEqual(score.lines[1].justify, false);
  });

  it("doesn't break within <nlba>", async () => {
    const gabc = "(c4) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (;) <nlba>Chri(f)ste(g) e(h)lé(i)i(h)son.(g)</nlba> (:) Ky(f)ri(g)e(h) (::)";
    for (const width of [230, 260, 300, 400]) {
      const { score } = await layOut(gabc, { width });
      const notations = score.notations;
      const start = notations.findIndex((n: any) => n.noLineBreak && n.noLineBreak.start);
      const end = notations.findIndex((n: any) => n.noLineBreak && n.noLineBreak.end);
      for (const lineStart of lineStarts(score)) assert(lineStart <= start || lineStart > end, `${lineStart} at ${width}`);
    }
  });

  it("only breaks a syllable of 10 notes or more, at a space, with 4 notes on each side", async () => {
    // the syllable "a" has 14 notes, each set apart, and "b" 9
    const gabc =
      "(c4) a(f/g/h/g/f/g/h/g/f/g/h/g/f/g) b(f/g/h/g/f/g/h/g/f) c(g) d(h) e(g) (::)";
    for (const width of [100, 110, 120, 130, 160, 200]) {
      const { score } = await layOut(gabc, { width });
      assert(score.lines.every((line: any) => line.plannedEnd !== undefined));
      const notations = score.notations;
      for (const lineStart of lineStarts(score).slice(1)) {
        const notation = notations[lineStart];
        if (notation.firstOfParentheses) continue;
        // a break within a syllable: count its notes before and after
        let first = lineStart;
        while (!notations[first].firstOfParentheses) first--;
        let last = lineStart;
        while (last + 1 < notations.length && !notations[last + 1].firstOfParentheses) last++;
        const count = (from: number, to: number) =>
          notations.slice(from, to).reduce((sum: number, n: any) => sum + (n.notes ? n.notes.length : 0), 0);
        assert.strictEqual(count(first, last + 1), 14, `the syllable broken at ${width}`);
        assert(count(first, lineStart) >= 4 && count(lineStart, last + 1) >= 4, `${lineStart} at ${width}`);
      }
    }
  });

  it("breaks after a bar rather than within a word, where both fit", async () => {
    // greedy fills the third line up to "Gló-ri-a Pa-"
    const greedy = await layOut(puer, { useDropCap: true, width: 600, lineBreaking: "greedy" });
    const optimal = await layOut(puer, { useDropCap: true, width: 600 });
    const notations = optimal.score.notations;
    const gloria = notations.findIndex((n: any) => n.hasLyrics() && n.lyrics[0].text === "Gló");
    assert(notations[gloria - 1].isDivider);
    assert(!lineStarts(greedy.score).includes(gloria));
    assert(lineStarts(optimal.score).includes(gloria));
  });

  it("starts the last line within a word only as TeX's \\finalhyphendemerits let it", async () => {
    assert.strictEqual(new E.ChantContext().finalHyphenDemerits, 0);
    /** whether the last line of a score starts within a word (each gabc word has a mapping of its own) */
    const lastLineStartsWithinWord = (score: any) => {
      const start = lineStarts(score).pop()!;
      return score.notations[start].mapping === score.notations[start - 1].mapping;
    };
    // TeX's default of 5000 is enough to move the break before the last line
    // to the end of a word here, with as many lines
    for (const [gabc, width] of [
      [puer, 340],
      [adTeLevavi, 330]
    ] as const) {
      const gregorio = await layOut(gabc, { width });
      const tex = await layOut(gabc, { width, setupContext: (ctxt) => (ctxt.finalHyphenDemerits = 5000) });
      assert(lastLineStartsWithinWord(gregorio.score), `${width}`);
      assert(!lastLineStartsWithinWord(tex.score), `${width}`);
      assert.strictEqual(tex.score.lines.length, gregorio.score.lines.length);
    }
    // and enough of them keep "A-men" together, though the line before it is loose
    const amen =
      "(c3)No(h)ctem(h) qui(h)é(h)tam(h) et(h) fi(h)nem(g) per(f)fé(h)ctum(h.) (;) con(h)cé(h)dat(h) no(h)bis(h) Dó(h)mi(h)nus(h) om(h)ní(h)po(d)tens.(d.) (::) A(g.)men.(h.) (::)";
    const split = await layOut(amen, { width: 450, setupContext: (ctxt) => (ctxt.finalHyphenDemerits = 5000) });
    const together = await layOut(amen, { width: 450, setupContext: (ctxt) => (ctxt.finalHyphenDemerits = 1e9) });
    assert(lastLineStartsWithinWord(split.score));
    assert(!lastLineStartsWithinWord(together.score));
    assert.strictEqual(together.score.lines.length, 2);
  });

  it("sets a line as loose as it has to be, rather than break where Gregorio wouldn't", async () => {
    // the 14 notes of "a" fill most of a line, and the 9 of "b" can't be split
    const { score } = await layOut("(c4) a(f/g/h/g/f/g/h/g/f/g/h/g/f/g) b(f/g/h/g/f/g/h/g/f) c(g) d(h) e(g) (::)", {
      width: 180
    });
    assert.deepStrictEqual(lineStarts(score), [0, 14]);
    assert(score.lines.every((line: any) => line.plannedEnd !== undefined));
  });

  it("falls back to filling a line greedily when nothing fits", async () => {
    // the no-line-break area is too long for the line
    const gabc = "(c4) <nlba>Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) Chri(f)ste(g) e(h)lé(i)i(h)son.(g)</nlba> (::)";
    const { score } = await layOut(gabc, { width: 120 });
    assert(score.lines.length > 1);
    assert(score.lines.some((line: any) => line.plannedEnd === undefined));
    const last = score.lines[score.lines.length - 1];
    assert.strictEqual(last.notationsStartIndex + last.numNotationsOnLine, score.notations.length);
  });

  it("ranks a line that has to break where it does by how loose it is", async () => {
    // a line can't end at z both full and after a word, so the lines break
    // after the bar, where each is only a little loose, rather than leave the
    // line before z far looser than the pretolerance
    const la = (pitch: string, count: number) => Array(count).fill(`la(${pitch})`).join(" ");
    const { score } = await layOut(`(c4) ${la("f", 9)} (;) ${la("g", 9)} (z) ${la("f", 20)} (::)`, { width: 250 });
    assert.deepStrictEqual(lineStarts(score).slice(0, 3), [0, 10, 20]);
  });

  it("finds the breaks with the fewest demerits, as a search that keeps far more ways of breaking the lines would", async () => {
    // (where leaving out the ways that take more than two lines more than
    // the fewest, as it once did, lost the best one.  Keeping those within
    // 20 lines finds the same breaks here as keeping every way, which is
    // much slower)
    const gabc = Array(3).fill([puer, adTeLevavi, salveRegina].join(" ")).join(" ");
    const { score, ctxt } = await layOut(gabc, { width: 140 });
    const ends = plannedEnds(score, ctxt, 140, 2);
    assert(!ends.includes(undefined));
    assert.deepStrictEqual(ends, plannedEnds(score, ctxt, 140, 20));
  });

  it("lays an edited score out as it lays out the same gabc parsed afresh", async () => {
    // (Puer natus est has lyrics under its bars, which centerDividers() moves)
    const edits = [
      [adTeLevavi, adTeLevavi.replace("le(f)vá(fe)vi(f)", "le(fgf)vá(fe)vi(f) no(g)vum(f)").replace("me(f)i:(f.)", "me(fg)i:(f.)")],
      [puer, puer.replace("na(iji)tus(h)", "na(ijiji)tus(hg) no(h)vus(h)").replace("(;) ma(hj)gni", "(;) ma(hjk)gni")]
    ];
    for (const [gabc, edited] of edits) {
      for (const width of [180, 250, 330, 420, 600]) {
        const fresh = await layOut(edited, { useDropCap: true, width });
        const { score } = await layOut(gabc, { useDropCap: true, width, edits: [edited] });
        assert.deepStrictEqual(lineStarts(score), lineStarts(fresh.score), `at ${width}`);
        assert.deepStrictEqual(positions(score), positions(fresh.score), `at ${width}`);
      }
    }
  });

  it("lays a score out again as it lays it out the first time", async () => {
    for (const width of [180, 250, 330, 450, 600]) {
      const fresh = await layOut(puer, { useDropCap: true, width });
      for (const before of [width, 300, 800]) {
        const { score } = await layOut(puer, { useDropCap: true, width: before, relayoutWidths: [width] });
        assert.deepStrictEqual(lineStarts(score), lineStarts(fresh.score), `${before} then ${width}`);
        assert.deepStrictEqual(positions(score), positions(fresh.score), `${before} then ${width}`);
      }
    }
  });

  // (a layout leaves nothing behind, such as shrunk text only, that the lines
  // planned the next time are planned around)
  describe("lays each golden case out again at the same width as it lays it out the first time", () => {
    for (const c of [...featureCases, ...settingCases]) {
      it(c.name, async () => {
        const { gabc, strategy, useDropCap, setupContext, setupScore } = c;
        for (const width of [220, 380, 560]) {
          const options = { strategy, useDropCap, setupContext, setupScore, width };
          const fresh = await layOut(gabc, options);
          const { score } = await layOut(gabc, { ...options, relayoutWidths: [width] });
          assert.deepStrictEqual(lineStarts(score), lineStarts(fresh.score), `at ${width}`);
          assert.deepStrictEqual(positions(score), positions(fresh.score), `at ${width}`);
        }
      });
    }
  });

  it("leaves the context's clef as it found it", async () => {
    const { score, ctxt } = await layOut("(c4) a(f) (c3) b(g) c(h) (f3) d(f) e(g) (::)", { width: 120 });
    const clef = ctxt.activeClef;
    const breaker = new E.LineBreaker(score, ctxt, 120);
    breaker.plannedEnd(0, 0);
    assert.strictEqual(ctxt.activeClef, clef);
  });

  it("lays out on one line without a width", async () => {
    const { score } = await layOut(puer, { width: 0 });
    assert.strictEqual(score.lines.length, 1);
    assert.strictEqual(score.lines[0].plannedEnd, undefined);
  });
});
