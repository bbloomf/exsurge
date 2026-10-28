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
  },
  {
    // the lyric-line headers' syllables move on to the syllables after a
    // word put in, and the lines that | adds come back without the headers
    name: "gives the syllables with notes the lyric-line headers' syllables in turn",
    gabc: "lyric-line: Chri+ste e+le+i+son;\n%%\n(c4) Ky(f)ri(g)e(h) (,) e(f)(g)le|x(h)i(h)son(f) (::)",
    edits: [
      "lyric-line: Chri+ste e+le+i+son;\n%%\n(c4) no(g) Ky(f)ri(g)e(h) (,) e(f)(g)le|x(h)i(h)son(f) (::)",
      "lyric-line: Chri+ste e+le+_ son;\nlyric-line: <i>a+b</i> c;\n%%\n(c4) no(g) Ky(f)ri(g)e(h) (,) e(f)(g)le|x(h)i(h)son(f) (::)",
      "lyric-line: <verseNum>2.</verseNum> Chri-ste e+le+_ son;\nlyric-line: <i>a+b</i> c;\n%%\n(c4) Ky(f)ri(g)e(h) (,) e(f)(g)le|x(h)i(h)son(f) (::)",
      "name: Kyrie;\n%%\n(c4) Ky(f)ri(g)e(h) (,) e(f)(g)le|x(h)i(h)son(f) (::)"
    ]
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

// The lines at the start that an edit leaves as they were are used again,
// with their svg (see ChantScore.layoutChantLines() and createSvg()).  So
// after each edit, the score is compared with the same score edited the
// same way but with every line laid out again (and its svg made again),
// glyph definitions and all, and with the edited gabc laid out afresh.
describe("Using the lines that an edit leaves as they were", () => {
  /** a copy of the svg of each line, to count those used again */
  const lineSvgs = (score: any) => new Map(score.lines.map((line: any) => [line, line.svgFragmentCache?.inner]));

  async function assertLinesUsedAgain(gabc: string, edits: string[], options: RenderOptions, message: string) {
    const width = options.width || 330;
    const random = createRandom(edits.length);
    const reused = await render(E, gabc, { ...options, width }, []);
    const relaidOut = await render(E, gabc, { ...options, width }, []);
    let linesUsedAgain = 0;
    // each with the same elements selected, or the insertion cursor in the same place
    const select = (score: any, selection: any) => {
      score.updateSelection(selection);
    };
    let lastLines = lineSvgs(reused.score);
    for (const [i, edit] of edits.entries()) {
      const elementCount = reused.score.notes.length;
      const selection = random.chance(0.3)
        ? undefined
        : random.chance(0.5)
        ? { element: { indices: [random.int(elementCount), random.int(elementCount)] } }
        : { element: { indices: [], insertion: { afterElementIndex: random.int(elementCount) } } };
      for (const { score, ctxt } of [reused, relaidOut]) {
        E.Gabc.updateMappingsFromSource(ctxt, score.mappings, edit);
        score.updateNotations(ctxt);
        score.performLayout(ctxt);
        // (with no lines from before, it lays them all out again)
        if (score === relaidOut.score) score.lines = [];
        score.layoutChantLines(ctxt, width);
        select(score, selection);
      }
      linesUsedAgain += reused.score.lines.filter((line: any) => lastLines.has(line)).length;
      assert.strictEqual(
        reused.score.createSvg(reused.ctxt),
        relaidOut.score.createSvg(relaidOut.ctxt),
        `${message}, edit ${i}`
      );
      lastLines = lineSvgs(reused.score);
      const fresh = await render(E, edit, { ...options, width }, []);
      select(fresh.score, selection);
      assert.strictEqual(output(reused.score, reused.ctxt), output(fresh.score, fresh.ctxt), `${message}, edit ${i} afresh`);

      // and with only the selection changed, the svg of the lines with it is made again
      const selected = { element: { indices: [random.int(elementCount)] } };
      select(reused.score, selected);
      select(relaidOut.score, selected);
      relaidOut.score.lines.forEach((line: any) => delete line.svgFragmentCache);
      assert.strictEqual(
        reused.score.createSvg(reused.ctxt),
        relaidOut.score.createSvg(relaidOut.ctxt),
        `${message}, edit ${i}, selected again`
      );
    }
    return linesUsedAgain;
  }

  /** edits of gabc, one after another: notes added and changed, words and dividers put in and taken out, and spaces added */
  function randomEdits(random: ReturnType<typeof createRandom>, gabc: string, count: number) {
    const edits: string[] = [];
    let edited = gabc;
    for (let i = 0; i < count; i++) {
      const words = edited.split(" ");
      const at = 1 + random.int(Math.max(1, words.length - 1));
      const groups = [...edited.matchAll(/\(([a-mA-M][^()]*)\)/g)];
      const group = groups.length > 2 ? groups[1 + random.int(groups.length - 2)] : null;
      switch (random.int(6)) {
        case 0:
          if (!group) continue;
          edited = edited.slice(0, group.index! + 1) + "g" + edited.slice(group.index! + 1);
          break;
        case 1:
          if (!group) continue;
          edited = edited.slice(0, group.index!) + "(h)" + edited.slice(group.index! + group[0].length);
          break;
        case 2:
          words.splice(at, 0, random.pick(["no(gh)vum(g)", "(,)", "(z)", "(c3)", "Al(f)le(g)lú(h)ia.(g) (::)"]));
          edited = words.join(" ");
          break;
        case 3:
          if (words.length < 4) continue;
          words.splice(at, 1);
          edited = words.join(" ");
          break;
        case 4:
          // (a space more between two words, which only moves the source indices after it)
          words[at] = " " + words[at];
          edited = words.join(" ");
          break;
        default:
          edited = edited.replace(/\((.)/g, (paren, pitch, index) =>
            index === groups[groups.length - 1]?.index ? "(" + pitch + "f" : paren
          );
      }
      edits.push(edited);
    }
    return edits;
  }

  it("lays random gabc out after edits as when every line is laid out again", async () => {
    let linesUsedAgain = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const random = createRandom(1000 + seed);
      const gabc = randomGabc(random, 30 + random.int(90));
      const options: RenderOptions = {
        width: random.pick([200, 330, 600]),
        useDropCap: seed % 2 === 0,
        setupContext: (ctxt) => {
          if (seed % 4 === 1) {
            ctxt.minSyllablesLastLine = 3;
            ctxt.minNotesLastLine = 5;
          }
        },
        setupScore: (score, ctxt, E) => {
          if (seed % 3 === 0) score.annotation = new E.Annotation(ctxt, "Ps.");
        }
      };
      linesUsedAgain += await assertLinesUsedAgain(gabc, randomEdits(random, gabc, 6), options, `random ${seed}`);
    }
    assert.ok(linesUsedAgain > 0);
  }, 120000);

  it("moves the source indices of the lyrics that a line starts with, when a space put in before moves them", async () => {
    // (at this width, most lines start with the lyrics of the double bar before them)
    const gabc = "(c4) " + "Al(f)le(g)lú(h)ia.(g) Ps.(::) ".repeat(12);
    const spaceAfter = (count: number) =>
      gabc.split("Ps.(::) ").reduce((edited, part, i) => edited + (i ? "Ps.(::) " + (i === count ? " " : "") : "") + part);
    const edits = [spaceAfter(1), gabc, spaceAfter(6), gabc];
    await assertLinesUsedAgain(gabc, edits, { width: 210 }, "spaces");
  });

  it("uses the lines before an edit of a long score again", async () => {
    const passage =
      "AD(c)te(d) le(f)vá(fe)vi(f) á(fg)ni(gf)mam(f) me(fe)am:(e.) (,) De(f)us(fg) me(f)us,(fe) in(e) te(f) con(gh)fí(g)do,(fe) (;) " +
      "non(f) e(fe)ru(c)bé(d)scam:(fe..) (:) ne(f)que(f) ir(fe)rí(fg)de(gf)ant(f) me(fe) in(f)i(gh)mí(g)ci(fe) me(f)i:(f.) (::) ";
    const gabc = "(c4) " + passage.repeat(6);
    const notes = [...gabc.matchAll(/\(f\)/g)].map((match) => match.index!);
    const edits: string[] = [];
    for (const index of [notes[1], notes[notes.length >> 1], notes[notes.length - 2]]) {
      edits.push(gabc.slice(0, index) + "(g)" + gabc.slice(index + 3), gabc);
    }
    for (const useDropCap of [false, true]) {
      const linesUsedAgain = await assertLinesUsedAgain(gabc, edits, { width: 600, useDropCap }, `long score`);
      // (3 of its 8 lines after each edit in the middle, and 7 after each at the end)
      assert.strictEqual(linesUsedAgain, 20);
    }
  }, 60000);
});
