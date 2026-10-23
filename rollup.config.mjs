// The UMD build: dist/exsurge.js, and minified, dist/exsurge.min.js (the
// package's main), and a bundle of the glyph data of each NABC font,
// dist/nabc-<font>.min.js, which isn't in exsurge's (see
// src/Exsurge.Nabc.ts).  tsc makes the ES module build, dist/esm (see
// tsconfig.build.json and tsconfig.nabc.json).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const umd = {
  format: "umd",
  name: "exsurge",
  amd: { id: "exsurge" },
  exports: "named",
  // as the webpack build did, so that bundlers treat it as an ES module
  esModule: true,
  sourcemap: true
};

// the NABC fonts, in src/nabc
export const nabcFonts = ["gregall", "gresgmodern", "grelaon"];
// the comment at the top of a NABC font's module, with its license
const licenseOf = (font) =>
  /^\/\*![\s\S]*?\*\//.exec(
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), "src", "nabc", font + ".ts"), "utf8")
  )[0];

export default [
  {
    input: "src/index.ts",
    onwarn(warning, warn) {
      // the modules import each other (e.g. Chant and Gabc), which is fine as
      // long as none uses another's exports as it loads
      if (warning.code !== "CIRCULAR_DEPENDENCY") warn(warning);
    },
    output: [
      { ...umd, file: "dist/exsurge.js" },
      {
        ...umd,
        file: "dist/exsurge.min.js",
        plugins: [
          terser({
            ecma: 2017,
            // the svg that exsurge makes names the class of each notation (see
            // ChantNotationElement.getSvgProps())
            keep_classnames: true
          })
        ]
      }
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        compilerOptions: { noEmit: false, sourceMap: true, inlineSources: true }
      })
    ]
  },
  ...nabcFonts.map((font) => ({
    input: `src/nabc/${font}.ts`,
    output: {
      format: "umd",
      // e.g. exsurgeNabcGregall.gregall
      name: "exsurgeNabc" + font[0].toUpperCase() + font.slice(1),
      exports: "named",
      esModule: true,
      file: `dist/nabc-${font}.min.js`,
      // with the license at the top (rather than in the UMD wrapper)
      plugins: [terser({ ecma: 2017, format: { comments: false, preamble: licenseOf(font) } })]
    },
    plugins: [typescript({ tsconfig: "./tsconfig.json", compilerOptions: { noEmit: false } })]
  }))
];
