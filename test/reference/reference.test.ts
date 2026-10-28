// @vitest-environment jsdom
//
// Compares what the source draws with what another version of exsurge drew,
// on the golden cases at several widths and with each way of measuring text,
// and on random gabc.  It's skipped unless EXSURGE_REFERENCE names the git
// ref to compare with, e.g.
//
//   EXSURGE_REFERENCE=v1.30.1 npm run test:reference
//
// EXSURGE_FUZZ_COUNT sets how many random scores to compare (default 1000) and
// EXSURGE_FUZZ_SEED the seed for the first one.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { beforeAll, describe, it, vi } from "vitest";
import type { GoldenCase } from "../golden/cases";
import { allCases, formatSvg } from "../golden/golden";
import { render, type Exsurge, type OutputName, type RenderOptions, type Strategy } from "../golden/harness";
import { createRandom, randomGabc } from "./gabcFuzzer";

const reference = process.env.EXSURGE_REFERENCE;
const fuzzCount = Number(process.env.EXSURGE_FUZZ_COUNT || 1000);
const fuzzSeed = Number(process.env.EXSURGE_FUZZ_SEED || 1);

const root = resolve(__dirname, "../..");
const outputs: OutputName[] = ["svg", "lines", "tree", "node", "nodeLines", "canvas"];
const strategies: Strategy[] = ["fontkit", "opentype", "canvas", "canvas-basic", "none"];

let referenceIndex: string;

/** extracts the reference's src directory, so that it can be imported */
function extractReference(ref: string) {
  const dir = join(root, "test/reference/.cache", ref.replace(/[^\w.-]+/g, "_"));
  const commit = execFileSync("git", ["rev-parse", ref], { cwd: root, encoding: "utf8" }).trim();
  const marker = join(dir, commit);
  if (!existsSync(marker)) {
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    // (the tar is larger than execFileSync()'s default buffer of 1MB)
    const archive = execFileSync("git", ["archive", "--format=tar", commit, "src"], {
      cwd: root,
      maxBuffer: 256 * 1024 * 1024
    });
    execFileSync("tar", ["-x", "-C", dir], { input: archive });
    mkdirSync(marker);
  }
  return join(dir, "src/index");
}

/** a fresh copy of the source and of the reference */
async function loadBoth(): Promise<[Exsurge, Exsurge]> {
  vi.resetModules();
  const current = await import("../../src/index");
  const previous = await import(/* @vite-ignore */ referenceIndex);
  return [current, previous];
}

async function renderOrError(E: Exsurge, gabc: string, options: RenderOptions) {
  try {
    const { outputs: result } = await render(E, gabc, options, outputs);
    if (result.svg !== undefined) result.svg = formatSvg(result.svg);
    if (result.lines !== undefined) result.lines = formatSvg(result.lines);
    return result;
  } catch (e) {
    return { error: String(e) } as Record<string, string>;
  }
}

/** throws an error showing where actual first differs from expected */
function assertSame(label: string, gabc: string, expected: Record<string, string>, actual: Record<string, string>) {
  for (const key of new Set([...Object.keys(expected), ...Object.keys(actual)])) {
    if (expected[key] === actual[key]) continue;
    const expectedLines = (expected[key] ?? "(none)").split("\n");
    const actualLines = (actual[key] ?? "(none)").split("\n");
    let line = 0;
    while (expectedLines[line] === actualLines[line]) line++;
    const context = (lines: string[]) => lines.slice(Math.max(0, line - 3), line + 3).join("\n");
    throw new Error(
      `${label}: the ${key} output differs from the reference at line ${line + 1}\n` +
        `gabc: ${gabc}\n--- reference\n${context(expectedLines)}\n--- source\n${context(actualLines)}`
    );
  }
}

async function compare(label: string, gabc: string, options: RenderOptions) {
  const [current, previous] = await loadBoth();
  const expected = await renderOrError(previous, gabc, options);
  const actual = await renderOrError(current, gabc, options);
  assertSame(label, gabc, expected, actual);
}

describe.skipIf(!reference)(`the same output as ${reference}`, { timeout: 120000 }, () => {
  beforeAll(() => {
    referenceIndex = extractReference(reference!);
  });

  describe("golden cases at other widths and with other fonts", () => {
    allCases.forEach((goldenCase: GoldenCase, caseIndex) => {
      it(goldenCase.name, async () => {
        const widths = [goldenCase.width ?? 600, 160, 333, 777, 0];
        for (let i = 0; i < widths.length; i++) {
          const strategy = i ? strategies[(caseIndex + i) % strategies.length] : goldenCase.strategy;
          const options = { ...goldenCase, width: widths[i], strategy };
          await compare(`${goldenCase.name} at ${widths[i]} with ${strategy}`, goldenCase.gabc, options);
        }
      });
    });
  });

  describe.skipIf(!fuzzCount)("random gabc", () => {
    const batchSize = 50;
    for (let start = 0; start < fuzzCount; start += batchSize) {
      const end = Math.min(fuzzCount, start + batchSize);
      it(`scores ${start + 1}-${end}`, async () => {
        for (let i = start; i < end; i++) {
          const seed = fuzzSeed + i;
          const random = createRandom(seed);
          const gabc = randomGabc(random);
          // each version gets its own options, drawing the same random numbers
          const [current, previous] = await loadBoth();
          const expected = await renderOrError(previous, gabc, fuzzOptions(seed));
          const actual = await renderOrError(current, gabc, fuzzOptions(seed));
          assertSame(`random score ${seed}`, gabc, expected, actual);
        }
      });
    }
  });
});

/** random settings to lay a random score out with */
function fuzzOptions(seed: number): RenderOptions {
  const random = createRandom(seed + 0x9e3779b9);
  return {
    strategy: random.pick(strategies),
    width: random.pick([0, 120, 200, 280, 350, 480, 640, 900]),
    useDropCap: random.chance(0.5),
    setupContext: (ctxt) => {
      if (random.chance(0.2)) ctxt.setStaffHeight(30 + random.int(80), random.pick([1, 1, 0.8]));
      if (random.chance(0.1)) ctxt.setScaleDefs(false);
      if (random.chance(0.2)) {
        ctxt.updateHyphenWidth();
        ctxt.minLyricWordSpacing = ctxt.hyphenWidth * random.pick([0.25, 0.5, 2]);
      }
      if (random.chance(0.1)) ctxt.editable = true;
    },
    setupScore: (score, ctxt, E) => {
      if (random.chance(0.15)) score.staffLineCount = random.pick([2, 3, 5]);
      if (random.chance(0.2)) score.annotation = new E.Annotations(ctxt, "Ant.", "VIII");
      if (random.chance(0.2)) score.titles.setTitle(ctxt, "A title for this score");
    }
  };
}
