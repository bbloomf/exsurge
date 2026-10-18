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

  it('skips a silent u before an accented vowel', function() {
    var spanish = new Spanish();
    ['qué', 'quí', 'gué', 'guí'].forEach(function(syllable) {
      assert.deepEqual(spanish.findVowelSegment(syllable, 0), { found: true, startIndex: 2, length: 1 }, syllable);
    });
  });

  it('finds the first vowel segment rather than the first vowel in its list', function() {
    var spanish = new Spanish();
    assert.deepEqual(spanish.findVowelSegment('guerra', 0), { found: true, startIndex: 2, length: 1 });
    assert.deepEqual(spanish.findVowelSegment('cantai', 0), { found: true, startIndex: 1, length: 1 });
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

  it('adds the line of a pes quassus only once', function() {
    var neume = layoutNotations('(c4) a(goi)')[0];
    assert(neume instanceof Neumes.PesQuassus);
    neume.visualizers.forEach(function(visualizer, index) {
      assert.equal(neume.visualizers.indexOf(visualizer), index);
    });
  });
});

describe('Lyric parsing', function() {
  it('strips trailing whitespace from a lyric after a |', function() {
    var ctxt = new Drawing.ChantContext();
    var mappings = Gabc.createMappingsFromSource(ctxt, '(c4) a|bus\t (g)');
    var lyrics = mappings[1].notations[0].lyrics;
    assert.deepEqual(lyrics.map(function(lyric) { return lyric.text; }), ['a', 'bus']);
    assert.equal(lyrics[1].lyricType, Drawing.LyricType.EndingSyllable);
  });

  it('only gives lyrics that allow a connector a connector span', function() {
    var ctxt = new Drawing.ChantContext();
    assert(new Drawing.Lyric(ctxt, 'a', Drawing.LyricType.BeginningSyllable).connectorSpan);
    assert(new Drawing.Lyric(ctxt, 'a', Drawing.LyricType.MiddleSyllable).connectorSpan);
    assert.equal(new Drawing.Lyric(ctxt, 'a', Drawing.LyricType.SingleSyllable).connectorSpan, undefined);
    assert.equal(new Drawing.Lyric(ctxt, 'a', Drawing.LyricType.EndingSyllable).connectorSpan, undefined);
  });
});

describe('Neume spacing', function() {
  it('allows a line break between neumes separated by a space', function() {
    var neumes = layoutNotations('(c4) a(f/g//h fg!h)');
    assert.deepEqual(
      neumes.map(function(neume) { return !!neume.allowLineBreakBeforeNext; }),
      [true, true, true, false, false]
    );
  });

  it("doesn't keep a syllable with the next because of a / or space at its end", function() {
    var neumes = layoutNotations('(c4) A(f/)ve(g//) Ma(h )ri(g/ )a(f)');
    assert.deepEqual(
      neumes.map(function(neume) { return !!neume.keepWithNext; }),
      [false, false, false, false, false]
    );
    // the space after them is kept, though
    var ctxt = new Drawing.ChantContext();
    assert(neumes[0].trailingSpace(ctxt) > 0);
  });

  it('gives !/ the width of its slash but keeps the neumes together', function() {
    var ctxt = new Drawing.ChantContext();
    var neumes = layoutNotations('(c4) a(f!/g!//h!i)');
    assert.deepEqual(
      neumes.map(function(neume) { return !!neume.keepWithNext && !neume.allowLineBreakBeforeNext; }),
      [true, true, true, false]
    );
    assert.equal(neumes[1].trailingSpace(ctxt), 2 * neumes[0].trailingSpace(ctxt));
    assert.equal(neumes[2].trailingSpace, 0);
  });
});

describe('Units', function() {
  var Units = Core.Units;

  function assertClose(actual, expected) {
    assert(Math.abs(actual - expected) < 1e-9, actual + ' is not close to ' + expected);
  }

  it('converts to and from device independent units', function() {
    assertClose(Units.ToDeviceIndependent(1, Units.Inches), 96);
    assertClose(Units.ToDeviceIndependent(2.54, Units.Centimeters), 96);
    assertClose(Units.ToDeviceIndependent(25.4, Units.Millimeters), 96);
    assertClose(Units.ToDeviceIndependent(7, Units.DeviceIndepenedent), 7);
    assertClose(Units.FromDeviceIndependent(96, Units.Inches), 1);
    assertClose(Units.FromDeviceIndependent(96, Units.Centimeters), 2.54);
    assertClose(Units.FromDeviceIndependent(96, Units.Millimeters), 25.4);
  });

  it('parses unit names', function() {
    assert.equal(Units.StringToUnitsType('IN'), Units.Inches);
    assert.equal(Units.StringToUnitsType('cm'), Units.Centimeters);
    assert.equal(Units.StringToUnitsType('Millimeters'), Units.Millimeters);
    assert.equal(Units.StringToUnitsType('di'), Units.DeviceIndepenedent);
  });
});
