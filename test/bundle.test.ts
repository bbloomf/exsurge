// @vitest-environment jsdom
//
// Builds exsurge as it is published, the minified UMD bundle and the ES
// modules, and checks that they draw the same as the source (by checking
// them against the golden snapshots too).

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { rollup, type OutputOptions, type RollupOptions } from "rollup";
import { afterAll, beforeAll, describe, it, vi } from "vitest";
import rollupConfig from "../rollup.config.mjs";
import { svgMeasuredCases } from "./golden/cases";
import { describeGoldenCases, describeGoldenTables } from "./golden/golden";
import { stubSvgTextMeasurement, type OutputName } from "./golden/harness";

const root = resolve(__dirname, "..");
const tsc = join(root, "node_modules/typescript/bin/tsc");
// in the project (rather than node_modules) so that its ES modules are loaded as such
const buildDir = join(root, "test/.build");
const minifiedBundle = join(buildDir, "exsurge.min.js");
// rendered separately, as test/golden renders them.  (createSvgTree() used
// to camelCase the keys of ctxt.baseTextStyle in place, changing the outputs
// rendered after it; test/svgTree.test.ts checks that it doesn't now.)
const stringOutputs: OutputName[] = ["svg", "lines", "tree", "canvas"];
const nodeOutputs: OutputName[] = ["node", "nodeLines"];

beforeAll(async () => {
  rmSync(buildDir, { recursive: true, force: true });
  mkdirSync(buildDir, { recursive: true });
  execFileSync(process.execPath, [tsc, "-p", "tsconfig.build.json", "--outDir", join(buildDir, "esm")], {
    cwd: root
  });
  const config = rollupConfig as RollupOptions & { output: OutputOptions[] };
  const bundle = await rollup({ ...config, onwarn: () => {} });
  // the minified build, as in dist/exsurge.min.js
  await bundle.write({ ...config.output.find((output) => /min\.js$/.test(output.file!))!, file: minifiedBundle });
  await bundle.close();
}, 120000);

// a fresh copy of the bundle, as require() loads it
const requireBundle = createRequire(__filename);
async function loadMinifiedBundle() {
  delete requireBundle.cache[minifiedBundle];
  return requireBundle(minifiedBundle);
}

async function loadEsmBuild() {
  vi.resetModules();
  return await import(/* @vite-ignore */ join(buildDir, "esm/index.js"));
}

describe("the published builds", () => {
  it("has typings that fit how exsurge is used (test/types.ts)", () => {
    execFileSync(process.execPath, [tsc, "-p", "test/tsconfig.dist.json"], { cwd: root, stdio: "pipe" });
  });

  describeGoldenTables("minified bundle tables", loadMinifiedBundle);
  describeGoldenCases("minified bundle", loadMinifiedBundle, stringOutputs);
  describeGoldenCases("minified bundle svg nodes", loadMinifiedBundle, nodeOutputs);
  describeGoldenCases("ES modules", loadEsmBuild, stringOutputs);
  describeGoldenCases("ES modules svg nodes", loadEsmBuild, nodeOutputs);

  describe("with text measured from svg elements", () => {
    let unstub: () => void;
    beforeAll(() => {
      unstub = stubSvgTextMeasurement();
    });
    afterAll(() => unstub());

    describeGoldenCases("minified bundle", loadMinifiedBundle, stringOutputs, svgMeasuredCases);
    describeGoldenCases("minified bundle svg nodes", loadMinifiedBundle, nodeOutputs, svgMeasuredCases);
    describeGoldenCases("ES modules", loadEsmBuild, stringOutputs, svgMeasuredCases);
    describeGoldenCases("ES modules svg nodes", loadEsmBuild, nodeOutputs, svgMeasuredCases);
  });
});
