// ctxt.useExtraTextOnly: text only syllables that don't fit at the end of a
// line go below the line's lyrics, with either way of breaking lines

import { describe, it } from "vitest";
import assert from "node:assert";
import * as E from "../src/index.js";
import { render } from "./golden/harness";

type LineBreaking = "greedy" | "optimal";

// psalm verses as jgabc sets them for verses ad libitum: each ends with a
// double bar, a custos for the antiphon's first note, "Ant." in italics and
// a line break, and the next starts with a custos for the antiphon's last note
const verses = [
  "Di(f)xit(h) Dó(h)mi(h)nus(h) Dó(h)mi(h)no(h) me(h)o:(h) *(:) Se(h)de(h) a(h) dex(h)tris(h) me(g)is.(f)",
  "Do(f)nec(h) po(h)nam(h) in(h)i(h)mí(h)cos(h) tu(h)os,(h) *(:) sca(h)bél(h)lum(h) pe(h)dum(h) tu(g)ó(f)rum.(f)",
  "Vir(f)gam(h) vir(h)tú(h)tis(h) tu(h)æ(h) e(h)mít(h)tet(h) Dó(h)mi(h)nus(h) ex(h) Si(h)on:(h) *(:) " +
    "do(h)mi(h)ná(h)re(h) in(h) mé(h)di(h)o(h) i(h)ni(h)mi(h)có(h)rum(h) tu(g)ó(f)rum.(f)",
  "Te(f)cum(h) prin(h)cí(h)pi(h)um(h) *(:) Ja(h)cob.(gf..)",
  "Ju(f)rá(h)vit(h) Dó(h)mi(h)nus,(h) et(h) non(h) pœ(h)ni(h)té(h)bit(h) e(h)um:(h) *(:) Tu(h) es(h) sa(h)cér(h)dos(h) " +
    "in(h) ætér(h)num(h) se(g)cún(f)dum(f) ór(h)di(h)nem(g) Mel(f)chí(f)se(f)dech.(f)"
];
const psalm = "(c4) " + verses.map((verse, k) => `(d+) ${k + 1}. ${verse} (::) (j+) <i>Ant.</i>() (Z)\n`).join("");

async function layOut(gabc: string, width: number, lineBreaking: LineBreaking, setup?: (ctxt: any) => void) {
  return render(
    E,
    gabc,
    {
      width,
      setupContext: (ctxt) => {
        ctxt.lineBreaking = lineBreaking;
        // (as jgabc sets it)
        ctxt.minLyricWordSpacing *= 0.7;
        if (setup) setup(ctxt);
      }
    },
    []
  );
}

/** each line's notations */
const lineNotations = (score: any): any[][] =>
  score.lines.map((line: any) =>
    score.notations.slice(line.notationsStartIndex, line.notationsStartIndex + line.numNotationsOnLine)
  );

/** each line, as where it starts, how many notations it has and where its text only notations go below its lyrics from */
const lineLayout = (score: any) =>
  score.lines.map((line: any) => [line.notationsStartIndex, line.numNotationsOnLine, line.extraTextOnlyIndex]);

const isAnt = (notation: any) => notation instanceof E.TextOnly && notation.lyrics[0].text === "Ant.";

describe("text only syllables below the lyrics", () => {
  for (const lineBreaking of ["greedy", "optimal"] as const) {
    describe(lineBreaking, () => {
      it("doesn't leave a text only syllable or a line break alone on a line, whatever the width", async () => {
        const { score, ctxt } = await layOut(psalm, 330, lineBreaking);
        let below = 0,
          inline = 0;
        for (let width = 330; width <= 624; width += 6) {
          score.layoutChantLines(ctxt, width);
          for (const notations of lineNotations(score)) {
            const first = notations[0];
            assert(!(first instanceof E.TextOnly), `"${first.lyrics[0]?.text}" starts a line at ${width}`);
            assert(!(first instanceof E.ChantLineBreak), `an empty line at ${width}`);
          }
          score.lines.forEach((line: any, k: number) => {
            const notations = lineNotations(score)[k];
            const ant = notations.findIndex(isAnt);
            if (ant < 0) {
              assert.equal(line.extraTextOnlyIndex, null);
              return;
            }
            // (the custos is on the line, before "Ant.", and the line break after it)
            assert(notations[ant - 1] instanceof E.Custos, `the custos before "Ant." at ${width}`);
            assert(notations[ant + 1] instanceof E.ChantLineBreak, `the line break after "Ant." at ${width}`);
            if (line.extraTextOnlyIndex === null) {
              inline++;
              // ("Ant." fits on the line, condensed if need be, but for less
              // than justifyElements() leaves alone)
              assert(notations[ant].lyrics[0].getRight() < line.staffRight + 0.5, `"Ant." past the staff at ${width}`);
            } else {
              below++;
              assert.equal(line.extraTextOnlyIndex, line.notationsStartIndex + ant);
            }
          });
        }
        // (both happen at these widths)
        assert(below > 10, `"Ant." went below the lyrics ${below} times`);
        assert(inline > 10, `"Ant." stayed on the line ${inline} times`);
      });

      it("puts a text only syllable below the lyrics only where it doesn't fit on the line", async () => {
        const verse = `(c4) (d+) 1. ${verses[3]} (::) (j+) <i>Ant.</i>() (Z)\n(d+) 2. ${verses[0]} (::) (j+) <i>Ant.</i>() (Z)`;
        // (wide enough for each verse on a line of its own, with "Ant.")
        let { score } = await layOut(verse, 600, lineBreaking);
        assert.equal(score.lines.length, 2);
        for (const line of score.lines) assert.equal(line.extraTextOnlyIndex, null);
        // (where the first verse fills the line just to its custos)
        const custos = lineNotations(score)[0].find((n: any) => n instanceof E.Custos && n.notationIndex! > 1);
        const width = Math.ceil(custos.bounds.right()) + 1;
        ({ score } = await layOut(verse, width, lineBreaking));
        const [first] = lineNotations(score);
        assert(first.some(isAnt), `"Ant." on the first line at ${width}`);
        assert(first[first.length - 1] instanceof E.ChantLineBreak);
        assert.equal(score.lines[0].extraTextOnlyIndex, first.findIndex(isAnt));
      });

      it("lays out the same at each width as it does at that width alone", async () => {
        const { score, ctxt } = await layOut(psalm, 330, lineBreaking);
        const laidOut = new Map<number, unknown>();
        for (let width = 330; width <= 624; width += 18) {
          score.layoutChantLines(ctxt, width);
          laidOut.set(width, lineLayout(score));
        }
        for (const [width, layout] of laidOut) {
          const fresh = await layOut(psalm, width, lineBreaking);
          assert.deepEqual(lineLayout(fresh.score), layout, `at ${width}`);
        }
      });

      for (const startExtraTextOnlyFromFirst of [false, true]) {
        it(`puts a long run of text only syllables below the lyrics${startExtraTextOnlyFromFirst ? ", from the first" : ""}`, async () => {
          const gabc =
            "(c4) Ky(f)ri(g)e(h) (,) Here is() a very long run of text only syllables that will not fit() " +
            "on the line() and so goes underneath() (;) e(g)lé(f)i(e)son.(f) (::)";
          for (const width of [200, 300, 400]) {
            const setup = (ctxt: any) => (ctxt.startExtraTextOnlyFromFirst = startExtraTextOnlyFromFirst);
            const greedy = await layOut(gabc, width, "greedy", setup);
            const { score } = await layOut(gabc, width, lineBreaking, setup);
            assert.notEqual(score.lines[0].extraTextOnlyIndex, null);
            assert.deepEqual(lineLayout(score), lineLayout(greedy.score), `at ${width}`);
          }
        });
      }
    });
  }

  it("ends the line with the line break after the text only syllables that went below its lyrics", async () => {
    // (greedy: with "Ant." below the lyrics, the custos so near the end of
    // the staff that the line break after "Ant." doesn't fit, as no space
    // on the line can be condensed for it any more)
    const { score, ctxt } = await layOut(psalm, 330, "greedy");
    for (let width = 330; width <= 624; width += 1) {
      score.layoutChantLines(ctxt, width);
      score.lines.forEach((line: any, k: number) => {
        const notations = lineNotations(score)[k];
        assert(!(notations[0] instanceof E.ChantLineBreak), `an empty line at ${width}`);
        if (line.extraTextOnlyIndex !== null)
          assert(notations[notations.length - 1] instanceof E.ChantLineBreak, `the line break ends the line at ${width}`);
      });
    }
  });

  it("breaks optimally before text only syllables only where notes come after them on the line", async () => {
    const gabc =
      "(c4) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (::) <i>Ps.</i>() Di(f)xit(h) Dó(h)mi(h)nus(h) (::) (j+) <i>Ant.</i>() (Z) " +
      "Ky(f)ri(g)e(h) (::) <i>Ant.</i>()";
    const textOnly = (score: any) =>
      score.notations.map((n: any, k: number) => (n instanceof E.TextOnly ? k : -1)).filter((k: number) => k >= 0);
    let { score, ctxt } = await layOut(gabc, 400, "optimal");
    let breaker = new E.LineBreaker(score, ctxt, 400);
    // (before "Ps.", but not before "Ant." alone before the line break, or at the end)
    assert.deepEqual(textOnly(score).map((k: number) => breaker.isBlocked(k)), [false, true, true]);
    // (and without useExtraTextOnly, "Ant." has nowhere else to go)
    ({ score, ctxt } = await layOut(gabc, 400, "optimal", (ctxt) => (ctxt.useExtraTextOnly = false)));
    breaker = new E.LineBreaker(score, ctxt, 400);
    assert.deepEqual(textOnly(score).map((k: number) => breaker.isBlocked(k)), [false, false, false]);
  });
});
