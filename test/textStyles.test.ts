import { describe, it } from "vitest";
import assert from "node:assert";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { fakeFont } from "./helpers/fonts";

describe('Text styles', function() {
  it('styles choral signs at the size they are measured at', function() {
    var ctxt = new Drawing.ChantContext();
    var css = ctxt.createStyleCss();
    assert(!/NaN/.test(css), css);
    var size = Drawing.TextTypes.choralSign.size(ctxt);
    assert(css.indexOf('.choralSign{') >= 0, css);
    assert(css.indexOf('.choralSign{fill:#000;font-family:' + ctxt.textStyles.choralSign.font + ';font-size:' + size + 'px;') >= 0, css);
  });

  it('keeps the choral sign size in step with the staff', function() {
    var ctxt = new Drawing.ChantContext();
    assert.strictEqual(ctxt.textStyles.choralSign.size, Drawing.TextTypes.choralSign.size(ctxt));
    var size = ctxt.textStyles.choralSign.size;
    ctxt.setStaffHeight(200);
    assert.strictEqual(ctxt.textStyles.choralSign.size, Drawing.TextTypes.choralSign.size(ctxt));
    assert.notStrictEqual(ctxt.textStyles.choralSign.size, size);
    ctxt.setFont('Courier New', 12);
    assert.strictEqual(ctxt.textStyles.choralSign.size, Drawing.TextTypes.choralSign.size(ctxt));
  });
});

describe('Lyric word spacing', function() {
  var palatino = fakeFont(0.33);

  it('keeps its ratio to the hyphen width when the lyric font changes', function() {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Palatino', 16, {}, { Regular: palatino });
    ctxt.updateHyphenWidth();
    ctxt.minLyricWordSpacing = 2 * ctxt.hyphenWidth;
    ctxt.setFont('Palatino', 24);
    ctxt.updateHyphenWidth();
    assert(Math.abs(ctxt.hyphenWidth - 0.33 * 24 * 0.9) < 1e-9, String(ctxt.hyphenWidth));
    assert(Math.abs(ctxt.minLyricWordSpacing - 2 * ctxt.hyphenWidth) < 1e-9, String(ctxt.minLyricWordSpacing));
  });

  it('keeps its ratio to the hyphen width across a hyphen with no width', function() {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Palatino', 16, {}, { Regular: palatino });
    ctxt.updateHyphenWidth();
    var hyphenWidth = ctxt.hyphenWidth;
    ctxt.minLyricWordSpacing = 2 * hyphenWidth;
    // nothing to measure with, e.g. while the lyric font loads
    ctxt.fontDictionary = undefined;
    ctxt.updateHyphenWidth();
    assert.strictEqual(ctxt.hyphenWidth, 0);
    assert.strictEqual(ctxt.minLyricWordSpacing, 0);
    ctxt.updateHyphenWidth();
    ctxt.fontDictionary = { Regular: palatino };
    ctxt.updateHyphenWidth();
    assert.strictEqual(ctxt.hyphenWidth, hyphenWidth);
    assert(Math.abs(ctxt.minLyricWordSpacing - 2 * hyphenWidth) < 1e-9, String(ctxt.minLyricWordSpacing));
  });

  it('keeps a word spacing of zero', function() {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Palatino', 16, {}, { Regular: palatino });
    ctxt.updateHyphenWidth();
    ctxt.minLyricWordSpacing = 0;
    ctxt.updateHyphenWidth();
    assert.strictEqual(ctxt.minLyricWordSpacing, 0);
  });

  it('matches the hyphen width until a caller sets it', function() {
    var ctxt = new Drawing.ChantContext();
    assert.strictEqual(ctxt.minLyricWordSpacing, ctxt.hyphenWidth);
    ctxt.setFont('Palatino', 16, {}, { Regular: palatino });
    ctxt.updateHyphenWidth();
    assert(ctxt.hyphenWidth > 0);
    assert.strictEqual(ctxt.minLyricWordSpacing, ctxt.hyphenWidth);
  });
});
