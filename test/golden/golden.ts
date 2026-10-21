// Runs each golden case and compares each of its outputs with the snapshot
// of it in __snapshots__, which was made with exsurge before it was converted
// to TypeScript.  Run `npx vitest -u` to update the snapshots after a change
// that is meant to change what exsurge draws.

import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { featureCases, settingCases, type GoldenCase } from "./cases";
import { render, type Exsurge, type OutputName } from "./harness";

const extensions: Record<OutputName, string> = {
  svg: "svg",
  lines: "svg",
  tree: "txt",
  canvas: "txt",
  node: "txt",
  nodeLines: "txt"
};

export const allCases: GoldenCase[] = [
  ...featureCases.map((c) => ({ outputs: ["svg", "tree", "node", "canvas"] as OutputName[], ...c })),
  ...settingCases.map((c) => ({ outputs: ["svg"] as OutputName[], ...c }))
];

// (absolute, since the tests in other folders check the same snapshots)
const snapshotDir = join(__dirname, "__snapshots__");

export function snapshotPath(name: string, output: OutputName) {
  return join(snapshotDir, name, `${output}.${extensions[output]}`);
}

/**
 * Puts each tag of an svg string on its own line, so that a change to one
 * element shows up as a change to one line.  The svg has no newlines of its
 * own, so the svg can be told from this exactly.
 */
export function formatSvg(svg: string) {
  if (svg.includes("\n")) throw new Error("the svg has a newline in it, so formatting it would lose it");
  return svg.replace(/></g, ">\n<");
}

/**
 * Checks the outputs of each case against the snapshots, loading a fresh copy
 * of exsurge for each case so that no case depends on what the ones before it
 * left behind.
 */
export function describeGoldenCases(
  title: string,
  loadExsurge: () => Promise<Exsurge>,
  /** the outputs this environment can check */
  supportedOutputs: OutputName[],
  cases: GoldenCase[] = allCases
) {
  describe(title, () => {
    for (const goldenCase of cases) {
      const outputs = goldenCase.outputs!.filter((output) => supportedOutputs.includes(output));
      if (!outputs.length) continue;
      it(goldenCase.name, async () => {
        const E = await loadExsurge();
        const { outputs: rendered } = await render(E, goldenCase.gabc, goldenCase, outputs);
        for (const output of outputs) {
          let result = rendered[output]!;
          if (output === "svg" || output === "lines") result = formatSvg(result);
          await expect(result).toMatchFileSnapshot(snapshotPath(goldenCase.name, output));
        }
      });
    }
  });
}

/** checks the tables that the svg is made from */
export function describeGoldenTables(title: string, loadExsurge: () => Promise<Exsurge>) {
  describe(title, () => {
    it("glyphs", async () => {
      const E = await loadExsurge();
      await expect(JSON.stringify(E.Glyphs, null, 1)).toMatchFileSnapshot(join(snapshotDir, "tables/glyphs.json"));
    });

    it("greextra glyphs", async () => {
      const E = await loadExsurge();
      await expect(JSON.stringify(E.greextraGlyphs, null, 1)).toMatchFileSnapshot(
        join(snapshotDir, "tables/greextraGlyphs.json")
      );
    });

    it("text styles", async () => {
      const E = await loadExsurge();
      const ctxt = new E.ChantContext(E.TextMeasuringStrategy.OpenTypeJS);
      const result = {
        css: ctxt.createStyleCss(),
        style: ctxt.createStyle(),
        styleTree: ctxt.createStyleTree(),
        textStyles: ctxt.textStyles,
        textTypes: Object.fromEntries(
          Object.entries<any>(E.TextTypes).map(([key, type]) => [
            key,
            { display: type.display, key: type.key, cssClass: type.cssClass, defaultSize: type.defaultSize?.(12) }
          ])
        )
      };
      await expect(JSON.stringify(result, null, 1)).toMatchFileSnapshot(join(snapshotDir, "tables/textStyles.json"));
    });
  });
}
