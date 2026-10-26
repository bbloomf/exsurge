// The svg string, svg tree and canvas output of the source, without a DOM.

import { vi } from "vitest";
import { describeGoldenCases, describeGoldenTables, describeNabcFontTables } from "./golden";
import { nabcFonts } from "./nabcFonts";

const load = async () => {
  vi.resetModules();
  return await import("../../src/index");
};

describeGoldenTables("golden tables", load);
describeNabcFontTables("golden NABC font tables", async (font) => nabcFonts[font as keyof typeof nabcFonts]);
describeGoldenCases("golden output", load, ["svg", "lines", "tree", "canvas"]);
