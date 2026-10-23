# exsurge
A JavaScript library for rendering Gregorian Chant in square note notation

## Synopsis

exsurge allows developers to create SVG images of square note notation from gabc notation. These SVGs can then be inserted in the DOM or used for presentation purposes.

[![CI](https://github.com/bbloomf/exsurge/actions/workflows/ci.yml/badge.svg)](https://github.com/bbloomf/exsurge/actions/workflows/ci.yml)

## Live Browser Example

Want to see gabc code rendered to chant on the fly? [Try going here](https://bbloomf.github.io/exsurge/chant.html).

## Code Example

First, create a ChantContext which contains the settings for how the chant will be rendered:

```javascript
var ctxt = new exsurge.ChantContext();
```

Then, create a ChantScore from gabc code:

```javascript
var gabc = "(f3) EC(ce!fg)CE(f) *(,) ad(fe~)vé(f!gwhf)nit(f) (,)"
var mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
var score = new exsurge.ChantScore(ctxt, mappings, true);
```

Finally, let the ChantScore handle the layout process, and use the SVG however you want:

```javascript
// perform layout on the chant
score.performLayout(ctxt, function() {
  score.layoutChantLines(ctxt, 1000, function() {

    // render the score to svg code
    var svgNode = document.createElement('div');
    var innerHtml = score.createDrawable(ctxt);
    svgNode.innerHTML = innerHtml;
    document.body.appendChild(svgNode);
  });
});
```

### St. Gall neumes (NABC)

exsurge draws Gregorio's NABC, the St. Gall neumes that gabc with a `nabc-lines` header has after `|`s in its notes, above the staff (and a second line of it below the staff), given a font to draw it with.  Its glyphs are converted from Gregorio's gregall font, and since they're under the SIL Open Font License (see below), they aren't in exsurge's bundle: import them from `exsurge-ts/nabc-gregall`, or load `dist/nabc-gregall.min.js` after exsurge, which defines `exsurgeNabcGregall`.

```javascript
import { gregall } from "exsurge-ts/nabc-gregall";

ctxt.nabcFonts = [gregall];
var gabc = "nabc-lines: 1;\n%%\n(f3) AL(ef~|ta>)le(fg/hggf|peclhgpi)lú(ef~|ta>)ia.(f.|ta-) (,)";
```

`ctxt.nabcSize`, `ctxt.nabcAlignment` and `ctxt.nabcVisibility` change its size, how it lines up with the notes and whether each line of it is drawn, as Gregorio's `\gresetnabcfont`, `\gresetnabcalignment` and `\gresetnabc` do.

## Motivation

Very few good chant layout software exist for developers. exsurge allows web developers to insert beautiful chant into their workflow with the simplicity of a little JavaScript.

## Developer Installation

exsurge is written in TypeScript, in `src/`.  After grabbing the repo from github, it's a simple matter of using `npm` to build exsurge:

```
npm install
npm run build
```

This makes:

- `dist/esm/`: ES modules with their typings, which the package's `module` and `types` point to
- `dist/exsurge.min.js`: a minified UMD bundle, which the package's `main` points to (and `dist/exsurge.js`, the same unminified)
- `dist/nabc-gregall.min.js` (and `dist/esm/nabc/`): the glyphs that exsurge draws Gregorio's NABC (St. Gall neumes) with, which aren't in exsurge's bundle, and which the package's `exsurge-ts/nabc-gregall` entry point points to (see the license, below)

`src/nabc/` is converted from the fonts of [Gregorio](https://github.com/gregorio-project/gregorio) by `tools/convert-nabc-font.mjs`.

Alternatively, you can run `npm run dev` which will watch and rebuild the UMD bundle after each saved change.  `test/index.html` is a page to try exsurge in a browser, once it's built; serve the repository and open it.

## API Reference

Under construction...

## Tests

`npm test` lints the code, type-checks it, and runs the tests (with [Vitest](https://vitest.dev)).  `npm run test:watch` runs the tests as files change.

The golden tests (`test/golden/`) draw a collection of gabc, covering each kind of notation, marking and text and the settings that change the layout, in each way exsurge can draw it: the svg string, the svg tree, svg DOM nodes and on a canvas.  They compare what's drawn with the snapshots in `test/golden/__snapshots__/`, as do the tests of the minified bundle and the ES modules (`test/bundle.test.ts`), which build exsurge as it is published.  After a change that is meant to change what exsurge draws, look over the changes to the snapshots and update them with `npx vitest -u`.

`npm run test:reference` compares what the source draws with what another version drew, on the golden tests at other widths and on random gabc, e.g. `EXSURGE_REFERENCE=v1.30.1 npm run test:reference`.

`npm run bench` times parsing, layout and drawing an svg.

## Contributors

Under construction...

## License

MIT License: http://adampritchard.mit-license.org/ or see [the `LICENSE` file](https://github.com/bbloomf/exsurge/blob/master/LICENSE).

The glyphs for NABC in `src/nabc/` (and what's built from them: `dist/esm/nabc/`, `dist/nabc-gregall.min.js` and the `exsurge-ts/nabc-gregall` entry point) are converted from Gregorio's gregall font, copyright © 2014–2026 Jakub Jelinek, and are under the SIL Open Font License 1.1, not the MIT License: see [the `LICENSE-OFL.txt` file](https://github.com/bbloomf/exsurge/blob/master/LICENSE-OFL.txt).
