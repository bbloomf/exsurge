// Drop caps beside several lines (ChantContext.dropCapLines, Gregorio's
// \gresetinitiallines), rendered with the golden cases' stand-in fonts.

import { describe, it } from "vitest";
import assert from "node:assert";
import * as E from "../src/index";
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

describe("Drop caps beside several lines", function () {
  it("start the lines beside the drop cap after it, and the others at the left", async function () {
    const { score, ctxt } = await renderWithLines(3, { width: 500 });
    const dropCap = score.dropCap;
    const left = dropCap.bounds.width + dropCap.padding * 2;
    assert(score.lines.length > 3);
    score.lines.forEach((line: any, i: number) => {
      assert.strictEqual(line.staffLeft, i < 3 ? left : 0);
      assert.strictEqual(line.staffRight, 500);
      assert.deepEqual(score.lineExtent(ctxt, i, 500), { left: line.staffLeft, right: 500 });
    });
    assert.deepEqual(score.lineExtent(ctxt, 0, 0), { left, right: Infinity });
    // centered in the space before the staff
    assert.strictEqual(dropCap.bounds.x, left / 2);
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
    assert.strictEqual(firstTop.top, firstTop.staffTop);
    const firstBaseline = await place("firstbaseline", "baseline");
    assert.strictEqual(firstBaseline.baseline, firstBaseline.score.lines[0].lyricLineBaseline);
    const lastBottom = await place("lastbottom", "bottom");
    const last = lastBottom.score.lines[1];
    assert.strictEqual(lastBottom.bottom, lineY(lastBottom.score, 1) + last.notationBounds.bottom());
  });

  it("make the drop cap bigger for more lines, unless its size has been set", async function () {
    const sizes = await Promise.all(
      [1, 2, 3].map(async (lines) => (await renderWithLines(lines)).score.dropCap.sizeForLines)
    );
    assert.strictEqual(sizes[0], undefined);
    assert(sizes[1] > 64 && sizes[2] > sizes[1], `sizes ${sizes}`);

    const { score, ctxt } = await renderWithLines(3, {
      setupContext: (ctxt) => (ctxt.textStyles.dropCap.size = 80)
    });
    assert.strictEqual(score.dropCap.sizeForLines, undefined);
    assert.strictEqual(score.dropCap.fontSize(ctxt), 80);
  });

  it("leave the drop cap out with dropCapLines 0, as useDropCap false does", async function () {
    const none = await renderWithLines(0);
    assert.strictEqual(none.score.dropCap, null);
    assert.strictEqual(none.score.lines[0].staffLeft, 0);
    const withoutDropCap = await render(E, gabc, { useDropCap: false }, ["svg"]);
    assert.strictEqual(none.outputs.svg, withoutDropCap.outputs.svg);
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

    // (the defs keep the glyphs drawn at the other widths)
    const withoutDefs = (svg: string) => svg.replace(/<defs.*<\/defs>/, "");
    const relaidOut = await renderWithLines(2, { width: 600, relayoutWidths: [300, 450, 600] });
    const laidOut = await renderWithLines(2, { width: 600 });
    assert.strictEqual(withoutDefs(relaidOut.outputs.svg!), withoutDefs(laidOut.outputs.svg!));
  });

  it("are laid out beside as many lines as performLayout() sized the drop cap for", async function () {
    const { score, ctxt } = await renderWithLines(1, { width: 400 });
    const height = score.dropCap.bounds.height;
    ctxt.dropCapLines = 3;
    // (laid out already, so only with force)
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, 400);
    assert.strictEqual(score.dropCap.bounds.height, height);
    assert.strictEqual(score.lines[1].staffLeft, 0);
    score.performLayout(ctxt, true);
    score.layoutChantLines(ctxt, 400);
    assert(score.dropCap.bounds.height > height);
    assert.strictEqual(score.lines[2].staffLeft, score.lines[0].staffLeft);
    assert.strictEqual(score.lastLineBesideDropCap, 2);
  });

  it("keep the lines beside the drop cap on the first page", async function () {
    const { score, ctxt } = await renderWithLines(3, { width: 400 });
    score.paginate(10);
    assert.strictEqual(score.pages[0].lines.length, 3);
    assert.strictEqual(score.pages[1].lines.length, 1);
    assert.strictEqual(score.pages[0].dropCap, score.dropCap);
    // drawn line by line, the first line lets the drop cap reach past it
    assert.match(score.pages[0].createSvgForEachLine(ctxt), /^<svg [^>]*overflow="visible"/);
  });

  it("put the drop cap on the last line when there are fewer lines than dropCapLines", async function () {
    const { score } = await renderWithLines(4, {}, "(c4) AL(f)le(g)lú(h)ia.(g) (::)");
    assert.strictEqual(score.lines.length, 1);
    assert.strictEqual(score.lastLineBesideDropCap, 0);
    const line = score.lines[0];
    assert.strictEqual(score.dropCap.bounds.y, line.lyricLineBaseline);
    // the line is made tall enough for it
    assert(line.notationBounds.y <= score.dropCap.bounds.y - score.dropCap.origin.y);
  });
});
