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
});
