import { describe, it } from "vitest";
import assert from "node:assert";
import { ChantLine } from "../src/Exsurge.Chant.ChantLine.js";
import { Custos } from "../src/Exsurge.Chant.Signs.js";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { Gabc } from "../src/Exsurge.Gabc.js";

describe('Custos rendering', function() {
  ['draw', 'createSvgFragment', 'createSvgNode', 'createSvgTree'].forEach(function(method) {
    [true, false].forEach(function(explicit) {
      it(method + ' renders an ' + (explicit ? 'explicit' : 'automatic') + ' ending custos once', function() {
        var ctxt = new Drawing.ChantContext();
        var mappings = Gabc.createMappingsFromSource(ctxt, '<i><c>TEST</i>(d+) <c><i>TEST');
        var custos = mappings[0].notations[0];
        var text = mappings[1].notations[0];
        assert(custos instanceof Custos);
        assert(custos.hasLyrics());
        assert(text.hasLyrics());

        // a line of a score with just these notations
        var line: any = new ChantLine({
          notations: [custos, text],
          staffLineCount: 4,
          dropCap: null,
          annotation: null
        } as any);
        line.numNotationsOnLine = 2;
        line.custos = explicit ? custos : new Custos(true);
        var elements = explicit ? [custos, text] : [custos, text, line.custos];
        var calls = elements.map(function() { return 0; });
        elements.forEach(function(element: any, index) {
          // Each notation renders its glyph and attached lyrics together.
          element[method] = function() {
            calls[index]++;
            return '';
          };
        });
        line.startingClef = {};
        line.startingClef[method] = function() { return ''; };
        var canvasCtxt: any = {};
        ['translate', 'beginPath', 'moveTo', 'lineTo', 'stroke'].forEach(function(name) {
          canvasCtxt[name] = function() {};
        });
        ctxt.canvasCtxt = canvasCtxt;

        // Supply a DOM-free node factory for the SVG DOM rendering path.
        var createNode = Drawing.QuickSvg.createNode;
        Drawing.QuickSvg.createNode = function() { return {} as Drawing.SvgElementWithSource; };
        try {
          line[method](ctxt);
        } finally {
          Drawing.QuickSvg.createNode = createNode;
        }
        assert.deepEqual(calls, elements.map(function() { return 1; }));
      });
    });
  });
});
