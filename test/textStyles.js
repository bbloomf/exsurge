var assert = require('assert');
var Drawing = require('../src/Exsurge.Drawing');

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
