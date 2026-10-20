// The UMD build: dist/exsurge.js, and minified, dist/exsurge.min.js (the
// package's main).  tsc makes the ES module build, dist/esm (see
// tsconfig.build.json).
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

export default {
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
};
