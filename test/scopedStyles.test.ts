// @vitest-environment jsdom
// Each svg has its context's text styles in a <style>, which applies to the
// whole page.  So when svgs from contexts with different text sizes, fonts or
// colors are in one page, a context's defIdPrefix scopes its styles to its
// own svgs, as it does its def ids.

import { afterAll, afterEach, beforeAll, beforeEach, describe, it } from "vitest";
import assert from "node:assert";
import * as Exsurge from "../src/index.js";
import { stubSvgTextMeasurement } from "./golden/harness";

let unstub: () => void;
beforeAll(() => {
  unstub = stubSvgTextMeasurement();
});
afterAll(() => unstub());

let contexts: Exsurge.ChantContext[] = [];
// the part of the page with the svgs (and not the contexts' text measurers)
let page: HTMLElement;
beforeEach(() => {
  page = document.body.appendChild(document.createElement("div"));
});
afterEach(() => {
  contexts.forEach((ctxt) => ctxt.svgTextMeasurer!.remove());
  contexts = [];
  page.remove();
});

const gabc = "(c4) Ky(f)ri(gfg)e(h) e(f)lé(g)i(h)son.(f) (::)";

function createContext(prefix: string, fontSize: number) {
  const ctxt = new Exsurge.ChantContext(Exsurge.TextMeasuringStrategy.Svg);
  contexts.push(ctxt);
  ctxt.defIdPrefix = prefix;
  ctxt.setFont("'Fake', serif", fontSize);
  return ctxt;
}

function createScore(ctxt: Exsurge.ChantContext) {
  const score = new Exsurge.ChantScore(ctxt, Exsurge.Gabc.createMappingsFromSource(ctxt, gabc), false);
  score.performLayout(ctxt);
  score.layoutChantLines(ctxt, 600);
  return score;
}

// an element for an svg tree, with the attributes that css matches
function createNodeFromTree(tree: Exsurge.SvgTreeNode | string): Node {
  if (typeof tree === "string") return document.createTextNode(tree);
  const node = document.createElementNS(Exsurge.QuickSvg.ns, tree.name!);
  const { className, id } = tree.props || {};
  if (className) node.setAttribute("class", className);
  if (id) node.setAttribute("id", id);
  tree.children.forEach((child) => node.appendChild(createNodeFromTree(child)));
  return node;
}

// exsurge's css, selector{declarations}...
function rulesOf(style: Element) {
  return Array.from((style.textContent || "").matchAll(/([^{}]+)\{([^{}]*)\}/g)).map(([, selector, declarations]) => ({
    selector,
    fontSize: /font-size:([^;]*)/.exec(declarations)![1]
  }));
}

// contextOfEachSvg: the context that drew each svg in the page
function assertEachSvgHasItsOwnTextStyles(contextOfEachSvg: Exsurge.ChantContext[]) {
  const svgs = Array.from(page.querySelectorAll("svg.Exsurge"));
  assert.strictEqual(svgs.length, contextOfEachSvg.length);
  svgs.forEach((svg, i) => {
    const styles = svg.querySelectorAll("style");
    assert.strictEqual(styles.length, 1);
    // its rules match only text in its own svg
    for (const { selector } of rulesOf(styles[0]))
      for (const element of Array.from(page.querySelectorAll(selector)))
        assert.strictEqual(element.closest("svg"), svg, selector);
    // and its lyrics have its lyric size
    const lyrics = Array.from(svg.querySelectorAll("text.lyric"));
    assert.ok(lyrics.length > 0);
    for (const lyric of lyrics) {
      const sizes = Array.from(page.querySelectorAll("style"))
        .flatMap(rulesOf)
        .filter(({ selector }) => lyric.matches(selector))
        .map(({ fontSize }) => fontSize);
      assert.deepStrictEqual(sizes, [contextOfEachSvg[i].textStyles.lyric.size + "px"]);
    }
  });
}

describe("text styles with defIdPrefix", () => {
  it("apply only to their own context's svgs, in each way of drawing an svg", () => {
    const ctxts = [createContext("a-", 16), createContext("1-", 24)];
    assert.notStrictEqual(ctxts[0].textStyles.lyric.size, ctxts[1].textStyles.lyric.size);
    const scores = ctxts.map(createScore);

    scores.forEach((score, i) => page.insertAdjacentHTML("beforeend", score.createSvg(ctxts[i])));
    assertEachSvgHasItsOwnTextStyles(ctxts);

    page.replaceChildren(...scores.map((score, i) => score.createSvgNode(ctxts[i])));
    assertEachSvgHasItsOwnTextStyles(ctxts);

    page.replaceChildren(...scores.map((score, i) => createNodeFromTree(score.createSvgTree(ctxts[i]))));
    assertEachSvgHasItsOwnTextStyles(ctxts);

    // and each line's own svg
    page.replaceChildren(...scores.flatMap((score, i) => score.createSvgNodeForEachLine(ctxts[i])));
    assertEachSvgHasItsOwnTextStyles(scores.flatMap((score, i) => score.lines.map(() => ctxts[i])));
    page.replaceChildren();
    scores.forEach((score, i) => page.insertAdjacentHTML("beforeend", score.createSvgForEachLine(ctxts[i])));
    assertEachSvgHasItsOwnTextStyles(scores.flatMap((score, i) => score.lines.map(() => ctxts[i])));
  });

  it("are the same as without it when it's empty", () => {
    const ctxt = createContext("", 16);
    assert.strictEqual(ctxt.getSvgClass(), "Exsurge ChantScore");
    assert.match(ctxt.createStyleCss(), /^svg\.Exsurge \.[\w-]+\{/);
  });

  it("measure text at its own context's size, whatever other svgs are in the page", () => {
    const small = createContext("a-", 16);
    const measure = () => new Exsurge.Lyric(small, "Kyrie").bounds.width;
    const width = measure();
    // a larger context's score, after the measurer in the page
    const large = createContext("b-", 24);
    page.appendChild(createScore(large).createSvgNode(large));
    assert.strictEqual(measure(), width);
  });
});
