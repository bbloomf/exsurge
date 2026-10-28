// ChantScore.paginate(height, firstPageHeight): the score split into pages,
// with only firstPageHeight on the first, and paginated again without a new
// layout.

import { describe, it } from "vitest";
import assert from "node:assert";
import * as E from "../src/index";
import { settingCases } from "./golden/cases";
import { render } from "./golden/harness";

// the puer natus with titles and a drop cap (whose titles and first line
// take about 170), split into pages of height
const { gabc, ...options } = settingCases.find((c) => c.name === "paginated")!;
const height = 250;

async function laidOut() {
  const { score, ctxt } = await render(E, gabc, { ...options, paginate: undefined }, ["svg"]);
  return { score, ctxt };
}

// the svg of each page, and whether the first was left empty
const pagesOf = (score: any, ctxt: any) => ({
  firstPageEmpty: score.firstPageEmpty,
  svgs: score.pages.map((page: any) => page.createSvg(ctxt))
});

// how tall the titles, the first line and the lines beside the drop cap are
const firstLinesHeight = (score: any) => score.copyLines(0, score.lastLineBesideDropCap + 1).bounds.height;

describe("Paginating a score", function () {
  it("gives the same pages again when it's paginated again", async function () {
    const { score, ctxt } = await laidOut();
    score.paginate(height);
    const once = pagesOf(score, ctxt);
    assert(once.svgs.length > 2);
    assert.strictEqual(once.firstPageEmpty, false);
    score.paginate(height);
    assert.deepStrictEqual(pagesOf(score, ctxt), once);
  });

  it("gives the same pages for firstPageHeight as when the score is laid out again", async function () {
    const { score, ctxt } = await laidOut();
    const firstHeights = [height / 2, 1, height, firstLinesHeight(score) + 1];
    for (const before of firstHeights)
      for (const after of firstHeights) {
        score.paginate(height, before);
        score.paginate(height, after);
        const fresh = await laidOut();
        fresh.score.paginate(height, after);
        assert.deepStrictEqual(pagesOf(score, ctxt), pagesOf(fresh.score, fresh.ctxt), `${before}, then ${after}`);
      }
  });

  it("puts only what fits in firstPageHeight on the first page, and height on the rest", async function () {
    const { score } = await laidOut();
    const firstPageHeight = firstLinesHeight(score) + 1;
    score.paginate(height, firstPageHeight);
    assert.strictEqual(score.firstPageEmpty, false);
    const [first, ...rest] = score.pages;
    assert.strictEqual(first.lines.length, score.lastLineBesideDropCap + 1);
    assert(first.bounds.height <= firstPageHeight);
    assert.strictEqual(first.titles, score.titles);
    assert(rest.every((page: any) => page.bounds.height <= height || page.lines.length === 1));
    assert.strictEqual(score.pages.flatMap((page: any) => page.lines).length, score.lines.length);
  });

  it("leaves the first page empty when the titles and the lines beside the drop cap don't fit there", async function () {
    const { score, ctxt } = await laidOut();
    score.paginate(height);
    const full = pagesOf(score, ctxt);
    score.paginate(height, firstLinesHeight(score) - 1);
    // (and starts on the next page, as it would on a page of its own)
    assert.deepStrictEqual(pagesOf(score, ctxt), { ...full, firstPageEmpty: true });
    assert.strictEqual(score.pages[0].titles, score.titles);
    assert.strictEqual(score.pages[0].dropCap, score.dropCap);
  });

  it("counts a firstPageHeight that's more than height, or not a finite number, as height", async function () {
    const { score, ctxt } = await laidOut();
    score.paginate(height);
    const full = pagesOf(score, ctxt);
    for (const firstPageHeight of [height * 2, Infinity, NaN, undefined]) {
      score.paginate(height, firstPageHeight);
      assert.deepStrictEqual(pagesOf(score, ctxt), full, String(firstPageHeight));
    }
  });

  it("says the first page isn't empty after the score is laid out again", async function () {
    const { score, ctxt } = await laidOut();
    score.paginate(height, 1);
    assert.strictEqual(score.firstPageEmpty, true);
    score.layoutChantLines(ctxt, options.width);
    assert.strictEqual(score.firstPageEmpty, false);
    assert.deepStrictEqual(score.pages, [score]);
  });
});
