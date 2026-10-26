// An edited score (Gabc.updateMappingsFromSource(), then updateNotations(),
// performLayout(), which lays out only the notations that need it, and
// layoutChantLines()) gives the same output as the edited gabc parsed afresh.
// So what the score kept from before the edit is brought up to date: source
// indices, the drop cap and the first word's styles, the header's language,
// braces given a length, and the clef that each notation is laid out under.

import { describe, it } from "vitest";
import assert from "node:assert";
import * as E from "../src/index.js";
import { featureCases, settingCases } from "./golden/cases";
import { render, type RenderOptions } from "./golden/harness";
import { createRandom, randomGabc } from "./reference/gabcFuzzer";

type LineBreaking = "greedy" | "optimal";

const golden = (name: string) => [...featureCases, ...settingCases].find((c) => c.name === name)!;

/**
 * where the lines start, and the svg (leaving out the glyphs' definitions,
 * which keep those that a layout before the edit used)
 */
const output = (score: any, ctxt: any) =>
  JSON.stringify(score.lines.map((line: any) => [line.notationsStartIndex, line.numNotationsOnLine])) +
  score.createSvg(ctxt).replace(/<defs[\s\S]*?<\/defs>/, "");

const withLineBreaking = (options: RenderOptions, lineBreaking: LineBreaking): RenderOptions => ({
  ...options,
  setupContext: (ctxt, E) => {
    if (options.setupContext) options.setupContext(ctxt, E);
    ctxt.lineBreaking = lineBreaking;
  }
});

/**
 * Lays gabc out, then edits it to each of edits in turn, checking each
 * time that it's laid out as the edited gabc is afresh.
 */
async function assertEditsLaidOutAfresh(
  gabc: string,
  edits: string[],
  options: RenderOptions,
  lineBreaking: LineBreaking,
  message: string
) {
  const width = options.width || 330;
  options = withLineBreaking({ ...options, width }, lineBreaking);
  const { score, ctxt } = await render(E, gabc, options, []);
  for (const [i, edit] of edits.entries()) {
    E.Gabc.updateMappingsFromSource(ctxt, score.mappings, edit);
    score.updateNotations(ctxt);
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, width);
    const fresh = await render(E, edit, options, []);
    assert.strictEqual(output(score, ctxt), output(fresh.score, fresh.ctxt), `${message}, edit ${i}`);
  }
}

// a word put in after the first clef (or the header and the clef)
const putInFirst = (gabc: string, word: string) => gabc.replace(/\((?:c|f|cb)\d\) /, (clef) => clef + word + " ");

const cases: { name: string; gabc: string; edits: string[]; options?: RenderOptions }[] = [
  {
    name: "moves the choral signs' source indices with their notes",
    gabc: golden("accents-and-choral-signs").gabc,
    edits: [putInFirst(golden("accents-and-choral-signs").gabc, "no(gh)vum(g)")]
  },
  {
    name: "moves the drop cap's source index with its lyric",
    gabc: golden("drop-cap-variants").gabc,
    edits: [golden("drop-cap-variants").gabc.replace("(c4)", "(cb3)")],
    options: { useDropCap: true }
  },
  ...["first-syllable-styles", "drop-cap-variants", "drop-cap-single-letter"].map((name) => {
    const { gabc, useDropCap, setupContext } = golden(name);
    return {
      name: `takes the drop cap and the first word's styles from a word put in before the first (${name})`,
      gabc,
      // (and gives them back when it's taken out again)
      edits: [putInFirst(gabc, "No(g)vum(f)"), gabc],
      options: { useDropCap, setupContext }
    };
  }),
  {
    name: "gives the header's language to the lyrics of a word put in",
    gabc: golden("header-settings").gabc,
    edits: [putInFirst(golden("header-settings").gabc, "no(gh)vum(g)")],
    options: { useDropCap: true, setupScore: golden("header-settings").setupScore }
  },
  {
    // an automatic custos (z0) and an oriscus at the end of its neume, laid
    // out again for the notes after them, under a clef that isn't
    name: "lays notations out again under the clef before them",
    gabc: "(c4) a(f) (f3) b(g) (z0) c(h) d(ho) e(h) (c3) f(ko) g(i) (::)",
    edits: ["(c4) a(fg) (f3) b(g) (z0) c(h) d(ho) e(h) (c3) f(ko) g(i) (::)"]
  },
  {
    name: "puts an automatic custos with no neume after it where a new one goes",
    gabc: "(c4) a(f) (z0) b(h) (::)",
    edits: ["(c4) a(f) (z0) (::)"]
  },
  {
    // the first of repeated notes after a brace given a length ends it
    name: "ends a brace given a length at the next note, as the gabc parsed afresh does",
    gabc: "(c4) a(f[ob:1;4mm]gss) b(e[ub:1;4mm]) c(hvv) d(g[ocb:1;3mm]) e(fff) (::)",
    edits: ["(c4) a(f[ob:1;4mm]gss) b(e[ub:1;4mm]) c(hvv) d(g[ocb:1;3mm]) e(fffg) (::)"]
  },
  {
    // (a word that starts with a space, after a newline, which isn't split off with it)
    name: "gives the lyrics after more than one space the source indices of their text",
    gabc: "(c4) a(f) b(g)\n c(h)  d(g) e(f) (::)",
    edits: ["(c4) a(f) b(g)\n c(h)  d(g) e(fe) (::)", "(c4) a(f) b(g)\n c(hg)  d(g) e(fe) (::)"]
  }
];

describe("Laying out an edited score", () => {
  for (const lineBreaking of ["greedy", "optimal"] as const) {
    describe(`with ${lineBreaking} line breaking`, () => {
      for (const c of cases) {
        it(c.name, () => assertEditsLaidOutAfresh(c.gabc, c.edits, c.options || {}, lineBreaking, c.name));
      }
    });
  }

  it("gives the lyric back the letter of a drop cap that the score no longer uses", async () => {
    const gabc = golden("first-syllable-styles").gabc;
    const setupContext = golden("first-syllable-styles").setupContext;
    const { score, ctxt } = await render(E, gabc, { useDropCap: true, setupContext, width: 330 }, []);
    score.useDropCap = false;
    score.updateNotations(ctxt);
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, 330);
    const fresh = await render(E, gabc, { useDropCap: false, setupContext, width: 330 }, []);
    assert.strictEqual(score.dropCap, null);
    assert.strictEqual(output(score, ctxt), output(fresh.score, fresh.ctxt));
  });

  // random gabc, with a note added, a word put in and a word taken out
  it("lays random gabc out after edits as it lays the edited gabc out afresh", async () => {
    for (let seed = 1; seed <= 120; seed++) {
      const random = createRandom(seed);
      const gabc = randomGabc(random, 10 + random.int(60));
      const edits: string[] = [];
      let edited = gabc;
      const groups = [...gabc.matchAll(/\(([a-mA-M][^()]*)\)/g)];
      if (groups.length > 2) {
        const group = groups[1 + random.int(groups.length - 2)];
        const end = group.index! + group[0].length - 1;
        edits.push((edited = edited.slice(0, end) + "g" + edited.slice(end)));
      }
      const words = edited.split(" ");
      if (words.length > 3) {
        words.splice(1 + random.int(words.length - 2), 0, "no(gh)vum(g)");
        edits.push(words.join(" "));
        words.splice(1 + random.int(words.length - 2), 1);
        edits.push(words.join(" "));
      }
      await assertEditsLaidOutAfresh(gabc, edits, { useDropCap: seed % 2 === 0 }, "greedy", `random ${seed}`);
    }
  }, 60000);
});
