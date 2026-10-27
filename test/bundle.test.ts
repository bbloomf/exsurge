// @vitest-environment jsdom
//
// Builds exsurge as it is published, the minified UMD bundle and the ES
// modules, and checks that they draw the same as the source (by checking
// them against the golden snapshots too).

import { execFileSync } from "node:child_process";
import assert from "node:assert";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { rollup, type OutputOptions, type RollupOptions } from "rollup";
import { afterAll, beforeAll, describe, it, vi } from "vitest";
import rollupConfig, { nabcFonts } from "../rollup.config.mjs";
import { svgMeasuredCases } from "./golden/cases";
import { describeGoldenCases, describeGoldenTables, describeNabcFontTables } from "./golden/golden";
import { stubSvgTextMeasurement, type OutputName } from "./golden/harness";
import { nabcFonts as testedNabcFonts } from "./golden/nabcFonts";

const root = resolve(__dirname, "..");
const tsc = join(root, "node_modules/typescript/bin/tsc");
// in the project (rather than node_modules) so that its ES modules are loaded as such
const buildDir = join(root, "test/.build");
const minifiedBundle = join(buildDir, "exsurge.min.js");
// the bundle of a NABC font's glyphs, as in dist/nabc-<font>.min.js
const nabcBundle = (font: string) => join(buildDir, `nabc-${font}.min.js`);
// rendered separately, as test/golden renders them.  (createSvgTree() used
// to camelCase the keys of ctxt.baseTextStyle in place, changing the outputs
// rendered after it; test/svgTree.test.ts checks that it doesn't now.)
const stringOutputs: OutputName[] = ["svg", "lines", "tree", "canvas"];
const nodeOutputs: OutputName[] = ["node", "nodeLines"];

beforeAll(async () => {
  rmSync(buildDir, { recursive: true, force: true });
  mkdirSync(buildDir, { recursive: true });
  for (const project of ["tsconfig.build.json", "tsconfig.nabc.json"])
    execFileSync(process.execPath, [tsc, "-p", project, "--outDir", join(buildDir, "esm")], { cwd: root });
  const [config, ...nabcConfigs] = rollupConfig as RollupOptions[];
  const bundle = await rollup({ ...config, onwarn: () => {} });
  // the minified build, as in dist/exsurge.min.js
  const outputs = config.output as OutputOptions[];
  await bundle.write({ ...outputs.find((output) => /min\.js$/.test(output.file!))!, file: minifiedBundle });
  await bundle.close();
  for (const [i, nabcConfig] of nabcConfigs.entries()) {
    const nabc = await rollup({ ...nabcConfig, onwarn: () => {} });
    await nabc.write({ ...(nabcConfig.output as OutputOptions), file: nabcBundle(nabcFonts[i]) });
    await nabc.close();
  }
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
  // a whole tsc run, which on Node 22 alongside the other test files can take longer than vitest's 5s
  it("has typings that fit how exsurge is used (test/types.ts)", () => {
    execFileSync(process.execPath, [tsc, "-p", "test/tsconfig.dist.json"], { cwd: root, stdio: "pipe" });
  }, 60000);

  describeGoldenTables("minified bundle tables", loadMinifiedBundle);
  describeNabcFontTables("minified NABC font tables", async (font) => {
    delete requireBundle.cache[nabcBundle(font)];
    return requireBundle(nabcBundle(font))[font];
  });
  describeNabcFontTables(
    "NABC font ES modules",
    async (font) => (await import(/* @vite-ignore */ join(buildDir, `esm/nabc/${font}.js`)))[font]
  );

  it("keeps the NABC fonts out of exsurge's bundle, and their license with them", () => {
    const license = "SIL Open Font License";
    assert.ok(!readFileSync(minifiedBundle, "utf8").includes(license));
    for (const font of nabcFonts) {
      const bundled = readFileSync(nabcBundle(font), "utf8");
      assert.ok(bundled.startsWith("/*!") && bundled.indexOf(license) < bundled.indexOf("*/"), font);
      for (const file of [`esm/nabc/${font}.js`, `esm/nabc/${font}.d.ts`])
        assert.ok(readFileSync(join(buildDir, file), "utf8").startsWith("/*!"), file);
    }
  });

  it("publishes each NABC font as exsurge-ts/nabc-<font>, pointing at its builds", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const [, ...nabcConfigs] = rollupConfig as RollupOptions[];
    nabcFonts.forEach((font, i) => {
      const entry = JSON.parse(readFileSync(join(root, `nabc-${font}/package.json`), "utf8"));
      assert.strictEqual(entry.main, "../" + (nabcConfigs[i].output as OutputOptions).file);
      assert.strictEqual(entry.module, `../dist/esm/nabc/${font}.js`);
      assert.strictEqual(entry.types, `../dist/esm/nabc/${font}.d.ts`);
      for (const file of [`nabc-${font}`, `dist/nabc-${font}.min.js`]) assert.ok(pkg.files.includes(file), file);
    });
    assert.ok(pkg.files.includes("LICENSE-OFL.txt"));
    // (the fonts that the tests draw with are those that are built)
    assert.deepStrictEqual(Object.keys(testedNabcFonts), nabcFonts);
  });
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
