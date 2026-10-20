// @vitest-environment jsdom

import assert from "node:assert";
import { describe, it } from "vitest";
import * as Exsurge from "../src/index.js";
import { serializeTree } from "./golden/harness";
import { fakeFont } from "./helpers/fonts";

describe('Svg trees', function() {
  it("don't change what the score draws afterwards", function() {
    var ctxt = new Exsurge.ChantContext(Exsurge.TextMeasuringStrategy.OpenTypeJS);
    ctxt.setFont('Fake', 16, { fill: '#555', 'letter-spacing': '1px' }, { Regular: fakeFont(0.33) });
    var gabc = '(c4) Ky(f)ri(g)e(h) *(,) e(f)lé(g)i(h)son.(f) <i>ij.</i>(::)';
    var score = new Exsurge.ChantScore(ctxt, Exsurge.Gabc.createMappingsFromSource(ctxt, gabc), false);
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, 600);

    var svg = score.createSvg(ctxt);
    var node = score.createSvgNode(ctxt).outerHTML;
    assert(/letter-spacing: ?1px/.test(svg), svg);

    var tree = serializeTree(score.createSvgTree(ctxt));
    assert(/letterSpacing: "1px"/.test(tree), tree);

    assert.strictEqual(score.createSvg(ctxt), svg);
    assert.strictEqual(score.createSvgNode(ctxt).outerHTML, node);
    assert.strictEqual(serializeTree(score.createSvgTree(ctxt)), tree);
    assert.deepStrictEqual(ctxt.baseTextStyle, { fill: '#555', 'letter-spacing': '1px' });
  });
});
