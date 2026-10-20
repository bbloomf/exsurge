// @vitest-environment jsdom
// TextMeasuringStrategy.Svg measures text as the page styles it, so it has to
// measure each element with the css classes it is drawn with.

import { afterAll, afterEach, beforeAll, describe, it } from "vitest";
import assert from "node:assert";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { stubSvgTextMeasurement } from "./golden/harness";

let unstub: () => void;
beforeAll(() => {
  unstub = stubSvgTextMeasurement();
});
afterAll(() => unstub());

let ctxt: Drawing.ChantContext;
function createContext() {
  ctxt = new Drawing.ChantContext(Drawing.TextMeasuringStrategy.Svg);
  ctxt.setFont("'Fake', serif", 16);
  return ctxt;
}
afterEach(() => {
  ctxt.svgTextMeasurer!.remove();
  document.head.replaceChildren();
});

// adds css to the page, which has to be more specific than the text styles
// (svg.Exsurge .lyric and so on) to override them
function addStyle(css: string) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}

describe("TextMeasuringStrategy.Svg", () => {
  it("measures text in the size of its text style", () => {
    createContext();
    const lyric = new Drawing.Lyric(ctxt, "K");
    const dropCap = new Drawing.DropCap(ctxt, "K");
    assert.strictEqual(ctxt.textStyles.dropCap.size / ctxt.textStyles.lyric.size, 64 / 14.4);
    assert.ok(Math.abs(dropCap.bounds.width / lyric.bounds.width - 64 / 14.4) < 1e-9);
  });

  it("measures the hyphen as a lyric", () => {
    createContext();
    addStyle("svg.Exsurge text.lyric{font-size:28.8px}");
    ctxt.updateHyphenWidth();
    assert.strictEqual(ctxt.hyphenWidth, new Drawing.Lyric(ctxt, "-").bounds.width);
    addStyle("svg.Exsurge text.lyric{font-size:14.4px}");
    assert.ok(ctxt.hyphenWidth > new Drawing.Lyric(ctxt, "-").bounds.width * 1.9);
  });

  it("measures a directive in its own css class", () => {
    createContext();
    addStyle("svg.Exsurge .lyric.directive{font-size:28.8px}");
    const directive = new Drawing.Lyric(ctxt, "ij.", Drawing.LyricType.Directive);
    const lyric = new Drawing.Lyric(ctxt, "ij.", Drawing.LyricType.SingleSyllable);
    assert.ok(Math.abs(directive.bounds.width / lyric.bounds.width - 2) < 1e-9);
    // and centers it as a directive
    assert.strictEqual(directive.bounds.x, -directive.bounds.width / 2);
  });

  it("measures text left and right in their own css classes", () => {
    createContext();
    addStyle("svg.Exsurge .textLeftRight.textLeft{font-size:28.8px}");
    const left = new Drawing.TextLeftRight(ctxt, "Mode", "textLeft");
    const right = new Drawing.TextLeftRight(ctxt, "Mode", "textRight");
    assert.ok(Math.abs(left.bounds.width / right.bounds.width - 2) < 1e-9);
  });

  it("wraps text", () => {
    createContext();
    const title = new Drawing.Title(ctxt, "Ad te levávi ánimam meam Deus meus in te confído");
    const width = title.bounds.width;
    title.setMaxWidth(ctxt, width / 2);
    assert.ok(title.spans.some((span) => span.newLine === true));
    assert.ok(title.bounds.width <= width / 2);
    assert.ok(title.numLines! >= 2);
  });
});
