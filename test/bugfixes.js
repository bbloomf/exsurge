var assert = require('assert');
var Chant = require('../src/Exsurge.Chant');
var Core = require('../src/Exsurge.Core');
var Drawing = require('../src/Exsurge.Drawing');
var Gabc = require('../src/Exsurge.Gabc').Gabc;
var Neumes = require('../src/Exsurge.Chant.Neumes');
var Spanish = require('../src/Exsurge.Text').Spanish;

function layoutNotations(gabc) {
  var ctxt = new Drawing.ChantContext();
  var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), false);
  score.performLayout(ctxt);
  return score.notations;
}

describe('Spanish syllabification', function() {
  it('finds the vowel segment of a u diphthong that is not an exception', function() {
    // this used to loop forever
    var segment = new Spanish().findVowelSegment('cuidado', 0);
    assert.deepEqual(segment, { found: true, startIndex: 1, length: 2 });
  });

  it("syllabifies 'cuidado guitarra'", function() {
    assert.deepEqual(new Spanish().syllabify('cuidado guitarra'), [
      ['cui', 'da', 'do'],
      ['gui', 'ta', 'rra']
    ]);
  });
});

describe('Neume layout', function() {
  it('draws a reverse virga with its line on the left', function() {
    var virgas = layoutNotations('(c4) a(gv) b(gV)');
    assert.equal(virgas.length, 2);
    var lines = virgas.map(function(virga) {
      assert(virga instanceof Neumes.Virga);
      return virga.visualizers[virga.visualizers.length - 1];
    });
    assert.equal(virgas[1].notes[0].shapeModifiers & Chant.NoteShapeModifiers.Reverse, Chant.NoteShapeModifiers.Reverse);
    assert(lines[0].bounds.x > 0);
    assert.equal(lines[1].bounds.x, 0);
  });

});
