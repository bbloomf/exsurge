var assert = require('assert');
var ChantLine = require('../src/Exsurge.Chant.ChantLine').ChantLine;
var Custos = require('../src/Exsurge.Chant.Signs').Custos;
var Drawing = require('../src/Exsurge.Drawing');
var Gabc = require('../src/Exsurge.Gabc').Gabc;

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

        var line = new ChantLine({
          notations: [custos, text],
          staffLineCount: 4,
          dropCap: null,
          annotation: null
        });
        line.numNotationsOnLine = 2;
        line.custos = explicit ? custos : new Custos(true);
        var elements = explicit ? [custos, text] : [custos, text, line.custos];
        var calls = elements.map(function() { return 0; });
        elements.forEach(function(element, index) {
          // Each notation renders its glyph and attached lyrics together.
          element[method] = function() {
            calls[index]++;
            return '';
          };
        });
        line.startingClef = {};
        line.startingClef[method] = function() { return ''; };
        ctxt.canvasCtxt = {};
        ['translate', 'beginPath', 'moveTo', 'lineTo', 'stroke'].forEach(function(name) {
          ctxt.canvasCtxt[name] = function() {};
        });

        // Supply a DOM-free node factory for the SVG DOM rendering path.
        var createNode = Drawing.QuickSvg.createNode;
        Drawing.QuickSvg.createNode = function() { return {}; };
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
