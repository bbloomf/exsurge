// The svg string, svg tree and canvas output of the source, without a DOM.

import { vi } from "vitest";
import { describeGoldenCases, describeGoldenTables } from "./golden";

const load = async () => {
  vi.resetModules();
  return await import("../../src/index");
};

describeGoldenTables("golden tables", load);
describeGoldenCases("golden output", load, ["svg", "lines", "tree", "canvas"]);
