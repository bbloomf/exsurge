// Laying out a score's lines gives the same output however they were laid out
// before: at the same width or at another one first, and, with optimal line
// breaking, whichever lines the line breaker tried before building them.  So
// the lines that a layout builds depend only on the score, the width and the
// context's settings.

import { describe, it } from "vitest";
import assert from "node:assert";
import * as E from "../src/index.js";
import { featureCases, settingCases } from "./golden/cases";
import { render } from "./golden/harness";
import { createRandom, randomGabc } from "./reference/gabcFuzzer";

type LineBreaking = "greedy" | "optimal";

// the golden cases, and random gabc, which has many more text only syllables
// (and the same with most of those given notes)
const cases: { name: string; gabc: string; options: any }[] = [];
for (const c of [...featureCases, ...settingCases]) {
  if (c.name.endsWith("-optimal")) continue;
  const { name, gabc, strategy, useDropCap, setupContext, setupScore } = c;
  cases.push({ name, gabc, options: { strategy, useDropCap, setupContext, setupScore } });
}
for (let seed = 1; seed <= 40; seed++) {
  const random = createRandom(seed);
  const gabc = randomGabc(random, 10 + random.int(60));
  cases.push({ name: `random ${seed}`, gabc, options: { useDropCap: seed % 2 === 0 } });
  const notes = createRandom(seed + 1000);
  cases.push({
    name: `random ${seed} with notes`,
    gabc: gabc.replace(/([^\s(])\(\)/g, (m, c) => (notes.chance(0.9) ? `${c}(${notes.pick(["f", "gh", "fe", "hg/hi"])})` : m)),
    options: { useDropCap: seed % 2 === 1 }
  });
}

async function layOut(c: (typeof cases)[number], lineBreaking: LineBreaking, width: number) {
  return render(
    E,
    c.gabc,
    {
      ...c.options,
      width,
      setupContext: (ctxt, E) => {
        if (c.options.setupContext) c.options.setupContext(ctxt, E);
        ctxt.lineBreaking = lineBreaking;
      }
    },
    []
  );
}

/**
 * where the lines start, and the svg (leaving out the glyphs' definitions,
 * which keep those that a layout at another width used)
 */
const output = (score: any, ctxt: any) =>
  JSON.stringify(score.lines.map((line: any) => line.notationsStartIndex)) +
  score.createSvg(ctxt).replace(/<defs[\s\S]*?<\/defs>/, "");

describe("Laying out a score again", () => {
  for (const lineBreaking of ["greedy", "optimal"] as const) {
    it(`gives the svg that laying it out afresh does, with ${lineBreaking} line breaking`, async () => {
      for (const c of cases) {
        const fresh = await layOut(c, lineBreaking, 330);
        const expected = output(fresh.score, fresh.ctxt);
        for (const before of [330, 520]) {
          const { score, ctxt } = await layOut(c, lineBreaking, before);
          score.layoutChantLines(ctxt, 330);
          assert.strictEqual(output(score, ctxt), expected, `${c.name}, laid out at ${before} first`);
        }
      }
    }, 60000);
  }

  it("gives the same svg whichever lines the optimal line breaker tried first", async () => {
    // more lines tried from where the line breaker plans from, at random
    // widths, before and after it plans the lines as it does (it doesn't try
    // lines that start before where it plans from, which are built already)
    const plan = E.LineBreaker.prototype.plan;
    let random: ReturnType<typeof createRandom> | null = null;
    const tryLines = (breaker: any, start: number) => {
      const n = breaker.score.notations.length,
        clef = breaker.ctxt.activeClef;
      for (let k = 0; random && start + 1 < n && k < 20; k++) {
        const from = Math.max(start, 1) + random.int(n - Math.max(start, 1) - 1);
        breaker.layOutLineFrom(from, { staffLeft: 0, paddingLeft: 0, staffRight: 120 + random.int(800) });
      }
      breaker.ctxt.activeClef = clef;
    };
    E.LineBreaker.prototype.plan = function (lineIndex: number, start: number) {
      tryLines(this, start);
      plan.call(this, lineIndex, start);
      tryLines(this, start);
    };
    try {
      // (the random gabc, and the golden cases with text only syllables,
      // which the lines tried could leave shrunk or wrapped)
      for (const c of cases.filter((c) => /^random|text-only|resized-lyric|line-height/.test(c.name))) {
        const outputs: string[][] = [];
        for (const triesMore of [false, true]) {
          random = triesMore ? createRandom(c.name.length * 31 + 7) : null;
          const { score, ctxt } = await layOut(c, "optimal", 330);
          const o = [output(score, ctxt)];
          score.layoutChantLines(ctxt, 190);
          o.push(output(score, ctxt));
          outputs.push(o);
        }
        assert.deepStrictEqual(outputs[1], outputs[0], c.name);
      }
    } finally {
      E.LineBreaker.prototype.plan = plan;
    }
  }, 60000);
});
