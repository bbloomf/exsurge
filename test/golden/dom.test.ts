// @vitest-environment jsdom
// The svg DOM nodes that the source creates.

import { vi } from "vitest";
import { describeGoldenCases } from "./golden";

describeGoldenCases(
  "golden svg nodes",
  async () => {
    vi.resetModules();
    return await import("../../src/index");
  },
  ["node", "nodeLines"]
);
