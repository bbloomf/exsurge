// The svg string, svg tree and canvas output of the source, without a DOM.

import { vi } from "vitest";
import { describeGoldenCases, describeGoldenTables, describeNabcFontTables } from "./golden";
import { gregall } from "../../src/nabc/gregall";
import { grelaon } from "../../src/nabc/grelaon";
import { gresgmodern } from "../../src/nabc/gresgmodern";

const nabcFonts: { [font: string]: typeof gregall } = { gregall, gresgmodern, grelaon };

const load = async () => {
  vi.resetModules();
  return await import("../../src/index");
};

describeGoldenTables("golden tables", load);
describeNabcFontTables("golden NABC font tables", async (font) => nabcFonts[font]);
describeGoldenCases("golden output", load, ["svg", "lines", "tree", "canvas"]);
