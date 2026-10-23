// Drop caps beside several lines (ChantContext.dropCapLines, Gregorio's
// \gresetinitiallines), rendered with the golden cases' stand-in fonts.

import { describe, it } from "vitest";
import assert from "node:assert";
import * as E from "../src/index";
import { featureCases } from "./golden/cases";
import { render, type RenderOptions } from "./golden/harness";

const gabc =
  "(c4) AD(c)te(d) le(f)vá(fe)vi(f) á(fg)ni(gf)mam(f) me(fe)am:(e.) (,) De(f)us(fg) me(f)us,(fe) in(e) te(f) con(gh)fí(g)do,(fe) (;) " +
  "non(f) e(fe)ru(c)bé(d)scam:(fe..) (:) ne(f)que(f) ir(fe)rí(fg)de(gf)ant(f) me(fe) in(f)i(gh)mí(g)ci(fe) me(f)i:(f.) (;) " +
  "et(f) e(fg)nim(f) u(fe)ni(e)vér(f)si(gh) qui(g) te(fe) ex(f)spé(fe)ctant,(e.) (,) non(d) con(fe)fun(f)dén(gf)tur.(f.) (::)";

function renderWithLines(lines: number, options: RenderOptions = {}, text = gabc) {
  const setupContext = options.setupContext;
  return render(
    E,
    text,
    {
      useDropCap: true,
      ...options,
      setupContext: (ctxt, E) => {
        ctxt.dropCapLines = lines;
        if (setupContext) setupContext(ctxt, E);
      }
    },
    ["svg"]
  );
}

// the y of a line's origin, from the first line's
const lineY = (score: any, i: number) => score.lines[i].bounds.y - score.lines[0].bounds.y;

// the y of the top of the drop cap's letter, from the first line's top staff line
const dropCapTop = (score: any, ctxt: any) =>
  score.dropCap.bounds.y - score.dropCap.origin.y + ctxt.staffInterval * 7;

// (the defs keep the glyphs drawn at other widths)
const withoutDefs = (svg: string) => svg.replace(/<defs.*<\/defs>/, "");

describe("Drop caps beside several lines", function () {
  it("start the lines beside the drop cap after it, and the others at the left", async function () {
    const { score, ctxt } = await renderWithLines(3, { width: 500 });
    const dropCap = score.dropCap;
    const left = score.lines[0].staffLeft;
    // (it's fitted to the lines to within half a pixel)
    assert(Math.abs(left - (dropCap.bounds.width + dropCap.padding * 2)) < 0.5);
    assert(score.lines.length > 3);
    score.lines.forEach((line: any, i: number) => {
      assert.strictEqual(line.staffLeft, i < 3 ? left : 0);
      assert.strictEqual(line.textLeft, i < 3 ? left : 0);
      assert.strictEqual(line.staffRight, 500);
    });
    const extent = score.lineExtent(ctxt, 2, 0);
    assert(Math.abs(extent.left - left) < 0.5 && extent.textLeft === extent.left && extent.right === Infinity);
    assert.deepEqual(score.lineExtent(ctxt, 3, 500), { left: 0, right: 500, textLeft: 0 });
    // centered in the space before the staff
    assert.strictEqual(dropCap.bounds.x, left / 2);
  });

  it("keep the lines' other text clear of the drop cap", async function () {
    const textCase = featureCases.find((c) => c.name === "two-line-initial-text")!;
    const { score } = await render(E, textCase.gabc!, textCase, ["svg"]);
    let texts = 0;
    score.lines.slice(0, 2).forEach((line: any) => {
      assert(line.textLeft > 0);
      for (let i = line.notationsStartIndex; i < line.notationsStartIndex + line.numNotationsOnLine; i++) {
        const notation = score.notations[i];
        for (const text of [...notation.lyrics, ...(notation.translationText || []), ...(notation.alText || [])]) {
          if (!text || !text.text) continue;
          texts++;
          const x = notation.bounds.x + text.bounds.x;
          assert(x >= line.textLeft, `"${text.text}" at ${x}, left of ${line.textLeft}`);
        }
      }
    });
    assert(texts > 10, `${texts} texts`);
  });

  it("put the drop cap's baseline on the lyric baseline of the last line beside it", async function () {
    const { score } = await renderWithLines(2);
    assert.strictEqual(score.dropCap.bounds.y, lineY(score, 1) + score.lines[1].lyricLineBaseline);
    assert.strictEqual(score.lastLineBesideDropCap, 1);
  });

  it("put the drop cap where dropCapPosition and dropCapAnchor say", async function () {
    const place = async (position: string, anchor: string) => {
      const { score, ctxt } = await renderWithLines(2, {
        setupContext: (ctxt) => {
          ctxt.dropCapPosition = position;
          ctxt.dropCapAnchor = anchor;
        }
      });
      const dropCap = score.dropCap;
      return {
        top: dropCap.bounds.y - dropCap.origin.y,
        baseline: dropCap.bounds.y,
        bottom: dropCap.bounds.y - dropCap.origin.y + dropCap.bounds.height,
        score,
        staffTop: -ctxt.staffInterval * 7
      };
    };
    const firstTop = await place("firsttop", "top");
    assert(Math.abs(firstTop.top - firstTop.staffTop) < 1e-9);
    const firstBaseline = await place("firstbaseline", "baseline");
    assert.strictEqual(firstBaseline.baseline, firstBaseline.score.lines[0].lyricLineBaseline);
    const lastBottom = await place("lastbottom", "bottom");
    const last = lastBottom.score.lines[1];
    assert.strictEqual(lastBottom.bottom, lineY(lastBottom.score, 1) + last.notationBounds.bottom());
  });

  it("make the drop cap just big enough to reach from the top staff line, unless its size has been set", async function () {
    for (const lines of [2, 3]) {
      for (const width of [500, 600]) {
        const { score, ctxt } = await renderWithLines(lines, { width });
        assert(score.dropCap.sizeForLines > 64);
        assert(Math.abs(dropCapTop(score, ctxt)) < 0.01, `${lines} lines at ${width}: ${dropCapTop(score, ctxt)}`);
      }
    }
    // (with translations, which take more room)
    const translated = gabc.replace("AD(c)", "AD[Unto thee](c)").replace("De(f)us", "De[O my God](f)us");
    const withTranslations = await renderWithLines(2, {}, translated);
    assert(Math.abs(dropCapTop(withTranslations.score, withTranslations.ctxt)) < 0.01);
    assert.strictEqual((await renderWithLines(1)).score.dropCap.sizeForLines, undefined);

    const { score, ctxt } = await renderWithLines(3, {
      setupContext: (ctxt) => (ctxt.textStyles.dropCap.size = 80)
    });
    assert.strictEqual(score.dropCap.sizeForLines, undefined);
    assert.strictEqual(score.dropCap.fontSize(ctxt), 80);
    // even the size that setFont() gave it
    const same = await renderWithLines(3, {
      setupContext: (ctxt) => (ctxt.textStyles.dropCap.size = 64)
    });
    assert.strictEqual(same.score.dropCap.fontSize(same.ctxt), 64);
  });

  it("leave the drop cap out with dropCapLines 0, as useDropCap false does", async function () {
    const none = await renderWithLines(0);
    assert.strictEqual(none.score.dropCap, null);
    assert.strictEqual(none.score.lines[0].staffLeft, 0);
    const withoutDropCap = await render(E, gabc, { useDropCap: false }, ["svg"]);
    assert.strictEqual(none.outputs.svg, withoutDropCap.outputs.svg);
    // keeping the first syllable's prefix
    const bold = (ctxt: any) => (ctxt.textStyles.lyric.prefix = "<b>");
    const noneBold = await renderWithLines(0, { setupContext: bold });
    const withoutDropCapBold = await render(E, gabc, { useDropCap: false, setupContext: bold }, ["svg"]);
    assert.strictEqual(noneBold.outputs.svg, withoutDropCapBold.outputs.svg);
  });

  it("count what isn't a number of lines, a position or an anchor as the default", async function () {
    const options = (position?: any, anchor?: any): RenderOptions => ({
      setupContext: (ctxt) => {
        ctxt.textStyles.dropCap.size = 30;
        ctxt.dropCapPosition = position;
        ctxt.dropCapAnchor = anchor;
      },
      setupScore: (score, ctxt, E) => (score.annotation = new E.Annotation(ctxt, "Ant."))
    });
    const plain = await renderWithLines(1, options("lastbaseline", "baseline"));
    const others: [number, any, any][] = [
      [NaN, "lastbaseline", "baseline"],
      [Infinity, "lastbaseline", "baseline"],
      [-1, "lastbaseline", "baseline"],
      [1, "lastBaseline", undefined],
      [1, undefined, "Baseline"]
    ];
    for (const [lines, position, anchor] of others) {
      const { outputs } = await renderWithLines(lines, options(position, anchor));
      assert.strictEqual(outputs.svg, plain.outputs.svg, `${lines} ${position} ${anchor}`);
    }
    assert.strictEqual((await renderWithLines("0" as any)).score.dropCap, null);
  });

  it("are laid out the same asynchronously", async function () {
    const sync = await renderWithLines(2);
    const async = await renderWithLines(2, { async: true });
    assert.strictEqual(async.outputs.svg, sync.outputs.svg);
  });

  it("are laid out again the same after the gabc is edited or the width changes", async function () {
    const edited = gabc.replace("AD(c)te(d)", "AD(c)te(dfe)").replace("me(f)i:(f.) (;)", "me(f)i:(f.) (:)");
    const fresh = await renderWithLines(2, {}, edited);
    const afterEdit = await renderWithLines(2, { edits: [edited] });
    assert.strictEqual(afterEdit.outputs.svg, fresh.outputs.svg);

    const relaidOut = await renderWithLines(2, { width: 600, relayoutWidths: [300, 450, 600] });
    const laidOut = await renderWithLines(2, { width: 600 });
    assert.strictEqual(withoutDefs(relaidOut.outputs.svg!), withoutDefs(laidOut.outputs.svg!));
  });

  it("take a change to dropCapLines or to the spacing when the lines are laid out again", async function () {
    const { score, ctxt } = await renderWithLines(1, { width: 400 });
    const height = score.dropCap.bounds.height;
    ctxt.dropCapLines = 3;
    score.layoutChantLines(ctxt, 400);
    assert(score.dropCap.bounds.height > height);
    assert.strictEqual(score.lines[2].staffLeft, score.lines[0].staffLeft);
    assert.strictEqual(score.lastLineBesideDropCap, 2);

    ctxt.minSpaceBelowStaff = 2.5;
    score.layoutChantLines(ctxt, 400);
    const fresh = await renderWithLines(3, { width: 400, setupContext: (ctxt) => (ctxt.minSpaceBelowStaff = 2.5) });
    assert.strictEqual(withoutDefs(score.createSvg(ctxt)), withoutDefs(fresh.outputs.svg!));
  });

  it("keep the lines beside the drop cap on the first page", async function () {
    const { score, ctxt } = await renderWithLines(3, { width: 400 });
    score.paginate(10);
    assert.strictEqual(score.pages[0].lines.length, 3);
    assert.strictEqual(score.pages[1].lines.length, 1);
    assert.strictEqual(score.pages[0].dropCap, score.dropCap);
    // drawn line by line, each line's svg has the part of the drop cap beside it
    const lineSvgs = score.pages[0].createSvgForEachLine(ctxt).split("</svg>").slice(0, -1);
    assert.deepEqual(lineSvgs.map((svg: string) => /class="dropCap"/.test(svg)), [true, true, true]);
    assert.doesNotMatch(lineSvgs.join(""), /overflow/);
  });

  it("fit the drop cap to the lines there are when there are fewer than dropCapLines", async function () {
    const { score, ctxt } = await renderWithLines(4, {}, "(c4) AL(f)le(g)lú(h)ia.(g) (::)");
    assert.strictEqual(score.lines.length, 1);
    assert.strictEqual(score.lastLineBesideDropCap, 0);
    assert.strictEqual(score.dropCap.bounds.y, score.lines[0].lyricLineBaseline);
    assert(Math.abs(dropCapTop(score, ctxt)) < 0.01);
  });

  it("draw the drop cap of a score that starts with a change of clef", async function () {
    const { score, outputs } = await renderWithLines(2, { width: 400 }, "(c4) (c3) " + gabc.slice(5));
    assert.match(outputs.svg!, /class="dropCap"/);
    assert(score.lines[0].staffLeft > 0);
    assert.strictEqual(score.lines[1].staffLeft, score.lines[0].staffLeft);
  });

  it("give a copy of the first line alone room for the drop cap, and the line the same room built again", async function () {
    const { score, ctxt } = await renderWithLines(2, { width: 500 });
    const dropCap = score.dropCap,
      first = score.lines[0];
    const page = score.copyLines(0, 1);
    assert(page.bounds.height >= first.bounds.y + dropCap.bounds.y - dropCap.origin.y + dropCap.bounds.height);
    assert.strictEqual(page.lastLineBesideDropCap, 0);

    // (to within half a pixel, as the drop cap is fitted to the lines)
    const line = new E.ChantLine(score);
    line.buildFromChantNotationIndex(ctxt, 0, 500);
    assert.strictEqual(line.isFirstLine, true);
    assert(Math.abs(line.staffLeft - first.staffLeft) < 0.5);
    assert(Math.abs(line.paddingLeft - first.paddingLeft) < 0.5);
  });
});
