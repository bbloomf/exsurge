// Converts one of Gregorio's NABC fonts (gregall, gresgmodern or grelaon) to
// the glyph data in src/nabc/<font>.ts, which exsurge draws NABC with (see
// src/Exsurge.Nabc.ts):
//
//   node tools/convert-nabc-font.mjs <a clone of Gregorio> <font>
//
// It reads the glyphs as GregorioTeX does (gregallreadfont() in
// tex/gregoriotex-nabc.lua): those in the private use area from U+E400 to
// U+EFFF, by their NABC names (with B, N, E and T in the glyph names for >,
// -, ! and ~).  Each glyph is its advance width, its height and depth (from
// the extremes of its outline, as TeX's box has them) and its outline as svg
// path data, all in the font's units (1000 to the em in each), with y going down
// from the baseline, as svg has it.  The path data is relative, rounded to
// whole units.
//
// The fonts are under the SIL Open Font License, so the data is too: the
// module starts with the font's copyright and the license, in a comment
// that minifiers keep (/*! … */).

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const [gregorio, font] = process.argv.slice(2);
if (!gregorio || !font) {
  console.error("usage: node tools/convert-nabc-font.mjs <a clone of Gregorio> <gregall|gresgmodern|grelaon>");
  process.exit(1);
}
const sfd = readFileSync(join(gregorio, "fonts", font + ".sfd"), "latin1");
const commit = execFileSync("git", ["-C", gregorio, "rev-parse", "--short=7", "HEAD"]).toString().trim();
const nabcName = (name) => name.replace(/[BNET]/g, (char) => ({ B: ">", N: "-", E: "!", T: "~" })[char]);

// each glyph's contours from its foreground layer (the background layer has
// the images of the manuscripts that the glyphs were drawn from), as lists
// of segments: [op, ...points], with op M, L or C
const glyphs = [];
for (const block of sfd.split(/^StartChar: /m).slice(1)) {
  const unicode = +/^Encoding: -?\d+ (-?\d+)/m.exec(block)[1];
  if (!(unicode >= 0xe400 && unicode < 0xf000)) continue;
  if (/^Refer:/m.test(block)) throw new Error("references aren't supported");
  const contours = [];
  const fore = block.indexOf("\nFore\n");
  const start = fore < 0 ? -1 : block.indexOf("\nSplineSet\n", fore);
  if (start >= 0) {
    for (const line of block.slice(start, block.indexOf("\nEndSplineSet", start)).split("\n")) {
      const match = /^\s*([-\d.e ]+?)\s+([mlc])\s/.exec(line + " ");
      if (!match) continue;
      const points = match[1].trim().split(/\s+/).map(Number);
      if (match[2] === "m") contours.push([["M", ...points]]);
      else contours[contours.length - 1].push([match[2] === "l" ? "L" : "C", ...points]);
    }
  }
  glyphs.push({
    name: nabcName(block.slice(0, block.indexOf("\n"))),
    width: +/^Width: (-?\d+)/m.exec(block)[1],
    contours
  });
}

const unitsPerEm = +/^Ascent: (\d+)/m.exec(sfd)[1] + +/^Descent: (\d+)/m.exec(sfd)[1];

// the lowest and highest y of the contours, with the extremes of the curves
function yExtent(contours) {
  let min = 0;
  let max = 0;
  for (const contour of contours) {
    let y0 = 0;
    for (const [op, ...points] of contour) {
      const y3 = points[points.length - 1];
      if (op === "C") {
        const [, y1, , y2] = points;
        // the roots of the derivative of the cubic, a t² + b t + c
        const a = -y0 + 3 * y1 - 3 * y2 + y3;
        const b = 2 * (y0 - 2 * y1 + y2);
        const c = y1 - y0;
        const discriminant = b * b - 4 * a * c;
        const roots =
          Math.abs(a) < 1e-12
            ? Math.abs(b) < 1e-12 ? [] : [-c / b]
            : discriminant < 0 ? [] : [1, -1].map((sign) => (-b + sign * Math.sqrt(discriminant)) / (2 * a));
        for (const t of roots) {
          if (t <= 0 || t >= 1) continue;
          const y = (1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3 * y3;
          min = Math.min(min, y);
          max = Math.max(max, y);
        }
      }
      min = Math.min(min, y3);
      max = Math.max(max, y3);
      y0 = y3;
    }
  }
  return { min, max };
}

// svg path data, relative and in whole units (rounding each point before
// taking the differences, so that the errors don't add up)
function pathData(contours) {
  let data = "";
  let x = 0;
  let y = 0;
  let last = "";
  for (const contour of contours) {
    let startX = 0;
    let startY = 0;
    for (const [op, ...points] of contour) {
      const absolute = points.map((value, i) => Math.round(i % 2 ? -value : value));
      let numbers = absolute.map((value, i) => value - (i % 2 ? y : x));
      let command = op.toLowerCase();
      if (command === "l" && numbers[0] === 0) [command, numbers] = ["v", [numbers[1]]];
      else if (command === "l" && numbers[1] === 0) [command, numbers] = ["h", [numbers[0]]];
      const text = numbers.map((n, i) => (i && n >= 0 ? " " : "") + n).join("");
      // (a command that repeats needn't be written again)
      data += command === last && command !== "m" ? (text[0] === "-" ? "" : " ") + text : command + text;
      last = command;
      x = absolute[absolute.length - 2];
      y = absolute[absolute.length - 1];
      if (op === "M") [startX, startY] = [x, y];
    }
    data += "z";
    last = "z";
    [x, y] = [startX, startY];
  }
  return data;
}

const copyright = /^Copyright: (.*)$/m.exec(sfd)[1].replace(/\\n/g, "\n");
const lines = glyphs.map(({ name, width, contours }) => {
  const { min, max } = yExtent(contours);
  return `    ${JSON.stringify(name)}: [${width}, ${Math.max(0, Math.round(max))}, ${Math.max(0, Math.round(-min))}, ${JSON.stringify(pathData(contours))}]`;
});
const module = `/*!
 * The glyphs of ${font}, converted for exsurge from fonts/${font}.sfd in Gregorio
 * (https://github.com/gregorio-project/gregorio, ${commit}) by
 * tools/convert-nabc-font.mjs.  They're under the SIL Open Font License,
 * as the font is, not exsurge's MIT license.
 *
${copyright
  .split("\n")
  .map((line) => (" * " + line).trimEnd())
  .join("\n")}
 */

// generated by tools/convert-nabc-font.mjs: don't edit

/** each glyph's advance width, height and depth, and its svg path data, in the font's units */
type Glyph = [number, number, number, string];

/** the glyphs of ${font}, one of Gregorio's NABC fonts, by their NABC names (see NabcFont) */
export const ${font}: { name: string; unitsPerEm: number; glyphs: { readonly [name: string]: Glyph } } = {
  name: ${JSON.stringify(font)},
  unitsPerEm: ${unitsPerEm},
  glyphs: {
${lines.join(",\n")}
  }
};
`;
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "nabc", font + ".ts");
writeFileSync(out, module);
console.log(`${out}: ${glyphs.length} glyphs, ${module.length} bytes`);
