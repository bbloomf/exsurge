// @vitest-environment jsdom
// What the source draws with text measured from svg elements in the DOM
// (TextMeasuringStrategy.Svg), with getBBox() and getSubStringLength()
// stubbed, since jsdom has neither.

import { afterAll, beforeAll, vi } from "vitest";
import { svgMeasuredCases } from "./cases";
import { describeGoldenCases } from "./golden";
import { stubSvgTextMeasurement } from "./harness";

let unstub: () => void;
beforeAll(() => {
  unstub = stubSvgTextMeasurement();
});
afterAll(() => unstub());

const load = async () => {
  vi.resetModules();
  return await import("../../src/index");
};

// rendered separately, as svg.test.ts and dom.test.ts render them
describeGoldenCases("golden svg-measured output", load, ["svg", "lines", "tree", "canvas"], svgMeasuredCases);
describeGoldenCases("golden svg-measured svg nodes", load, ["node", "nodeLines"], svgMeasuredCases);
