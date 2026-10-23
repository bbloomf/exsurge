import { describe, it } from "vitest";
import assert from "node:assert";
import * as Chant from "../src/Exsurge.Chant.js";
import * as Core from "../src/Exsurge.Core.js";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { Gabc } from "../src/Exsurge.Gabc.js";
import * as Neumes from "../src/Exsurge.Chant.Neumes.js";
import * as Signs from "../src/Exsurge.Chant.Signs.js";
import { Spanish } from "../src/Exsurge.Text.js";

function layoutNotations(gabc: string) {
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
    assert.equal(virgas[1].notes![0].shapeModifiers & Chant.NoteShapeModifiers.Reverse, Chant.NoteShapeModifiers.Reverse);
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

describe('Note', function() {
  it('matches its shape modifiers', function() {
    var note = new Chant.Note();
    assert.strictEqual(note.shapeModifierMatches(Chant.NoteShapeModifiers.None), true);
    assert.strictEqual(note.shapeModifierMatches(Chant.NoteShapeModifiers.Reverse), false);
    note.shapeModifiers = Chant.NoteShapeModifiers.Reverse | Chant.NoteShapeModifiers.Stemmed;
    assert.strictEqual(note.shapeModifierMatches(Chant.NoteShapeModifiers.None), false);
    assert.strictEqual(note.shapeModifierMatches(Chant.NoteShapeModifiers.Reverse), true);
    assert.strictEqual(note.shapeModifierMatches(Chant.NoteShapeModifiers.Stemmed), true);
    assert.strictEqual(note.shapeModifierMatches(Chant.NoteShapeModifiers.Cavum), false);
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
    assert((neumes[0].trailingSpace as Drawing.TrailingSpaceFunction)(ctxt) > 0);
  });

  it('gives !/ the width of its slash but keeps the neumes together', function() {
    var ctxt = new Drawing.ChantContext();
    var neumes = layoutNotations('(c4) a(f!/g!//h!i)');
    assert.deepEqual(
      neumes.map(function(neume) { return !!neume.keepWithNext && !neume.allowLineBreakBeforeNext; }),
      [true, true, true, false]
    );
    assert.equal(
      (neumes[1].trailingSpace as Drawing.TrailingSpaceFunction)(ctxt),
      2 * (neumes[0].trailingSpace as Drawing.TrailingSpaceFunction)(ctxt)
    );
    assert.equal(neumes[2].trailingSpace, 0);
  });
});

describe('Units', function() {
  var Units = Core.Units;

  function assertClose(actual: number, expected: number) {
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

describe('Braces', function() {
  it('ends a brace that is still open at an explicit custos at the end of the score', function() {
    // this used to throw, looking for a notation after the custos
    var ctxt = new Drawing.ChantContext();
    var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, '(c4) a(g[ob:1{]h+)'), false);
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, 400);
    assert.equal(score.lines.length, 1);
    var line = score.lines[0];
    assert(line.custos instanceof Signs.Custos);
    assert.equal(line.custos, score.notations[score.notations.length - 1]);
    assert.equal(line.braces.length, 1);
    assert.equal(line.braces[0].bounds.right(), line.custos.bounds.right());
  });
});

describe('Staff position offsets', function() {
  function notesOf(mappings: Chant.ChantMapping[]) {
    var notes: Chant.Note[] = [];
    mappings.forEach(function(mapping) {
      mapping.notations.forEach(function(notation) {
        if (notation.notes) notes.push(...notation.notes);
      });
    });
    return notes;
  }

  function parseNotes(gabc: string) {
    return notesOf(Gabc.createMappingsFromSource(new Drawing.ChantContext(), gabc));
  }

  // the number of half steps from the Do of a clef's octave to a note
  function halfStepsFromDo(note: Chant.Note) {
    assert(Number.isInteger(note.pitch!.step) && note.pitch!.step >= 0 && note.pitch!.step < 12, note.sourceGabc);
    return note.pitch!.toInt() - new Core.Pitch(Core.Step.Do, 2).toInt();
  }

  it('ignores 0 and 9 after a pitch under clefs other than the Chi-Rho clef', function() {
    ['c1', 'c2', 'c3', 'c4', 'f1', 'f2', 'f3', 'f4', 'cb3', 'treble2'].forEach(function(clef) {
      var letters = 'abcdefghijklm'.split('');
      var notes = parseNotes('(' + clef + ') ' + letters.map(function(letter) {
        return '(' + letter + ') (' + letter + '0) (' + letter + '9)';
      }).join(' '));
      assert.equal(notes.length, letters.length * 3);
      for (var i = 0; i < notes.length; i += 3) {
        var plain = notes[i];
        assert.equal(typeof plain.pitch!.step, 'number', clef + ' ' + plain.sourceGabc);
        [notes[i + 1], notes[i + 2]].forEach(function(note) {
          var message = clef + ' ' + note.sourceGabc;
          assert.equal(note.staffPosition, plain.staffPosition, message);
          assert.equal(note.staffPositionOffset, 0, message);
          assert.deepEqual(note.pitch, plain.pitch, message);
        });
      }
    });
  });

  it('gives the Chi-Rho clef chromatic pitches, with each line a minor third above the one below it', function() {
    var expected: [string, number][] = [
      ['b', -9], ['d', -6], ['f', -3], ['f9', -2], ['g0', -2], ['g', -2], ['g9', -1], ['h0', -1],
      ['h', 0], ['h9', 1], ['i0', 1], ['i', 1], ['i9', 2], ['j0', 2], ['j', 3], ['j9', 4],
      ['k0', 4], ['k', 4], ['k9', 5], ['l0', 5], ['l', 6], ['m0', 7], ['m', 7], ['m9', 8]
    ];
    var notes = parseNotes('(xp3) ' + expected.map(function(e) { return '(' + e[0] + ')'; }).join(' '));
    assert.deepEqual(
      notes.map(function(note) { return [note.sourceGabc, halfStepsFromDo(note)]; }),
      expected
    );
    assert.deepEqual(notes[expected.findIndex(function(e) { return e[0] === 'i0'; })].pitch, new Core.Pitch(Core.Step.Du, 2));
    assert.deepEqual(notes[expected.findIndex(function(e) { return e[0] === 'g0'; })].pitch, new Core.Pitch(Core.Step.Te, 1));

    // the middle of a space is never used: a note on a space without 0 or 9 is at its bottom
    ['a', 'c', 'e', 'g', 'i', 'k', 'm'].forEach(function(space) {
      var spaceNotes = parseNotes('(xp3) (' + space + ') (' + space + '0)');
      assert.equal(spaceNotes[0].staffPositionOffset, -1 / 3, space);
      assert.equal(spaceNotes[0].staffPosition, spaceNotes[1].staffPosition, space);
      assert.deepEqual(spaceNotes[0].pitch, spaceNotes[1].pitch, space);
    });

    // whichever line the clef is on, that line is Do
    ['xp1', 'xp2', 'xp3', 'xp4', 'xp-2'].forEach(function(clef) {
      var lines = parseNotes('(' + clef + ') (d) (f) (h) (j) (l)');
      var clefLine = Number(clef.slice(-1)) - 1;
      lines.forEach(function(note, line) {
        assert.equal(halfStepsFromDo(note), (line - clefLine) * 3, clef + ' ' + note.sourceGabc);
      });
    });
  });

  it('nudges notes again when the kind of clef changes as the mappings are updated', function() {
    var ctxt = new Drawing.ChantContext();
    var mappings = Gabc.createMappingsFromSource(ctxt, '(xp3) a(k0) b(f)');
    var note = mappings[1].notations[0].notes![0];
    assert.equal(note.staffPosition, 8 - 1 / 3);
    assert.equal(note.pitch!.step, Core.Step.Mi);

    // the note is kept, with its pitch under the new clef
    Gabc.updateMappingsFromSource(ctxt, mappings, '(xp4) a(k0) b(f)');
    assert.equal(mappings[1].notations[0].notes![0], note);
    assert.equal(note.pitch!.step, Core.Step.Du);

    // under a C clef, the 0 no longer nudges the note
    Gabc.updateMappingsFromSource(ctxt, mappings, '(c4) a(k0) b(f)');
    note = mappings[1].notations[0].notes![0];
    assert.equal(note.staffPosition, 8);
    assert.equal(note.sourceIndex, '(c4) a('.length);
    assert.equal(note.pitch!.step, Core.Step.Re);

    Gabc.updateMappingsFromSource(ctxt, mappings, '(xp4) a(k0) b(f)');
    note = mappings[1].notations[0].notes![0];
    assert.equal(note.staffPosition, 8 - 1 / 3);
    assert.equal(note.sourceIndex, '(xp4) a('.length);
    assert.equal(note.pitch!.step, Core.Step.Du);
  });

  ['c4', 'xp4'].forEach(function(clef) {
    it('places an automatic custos announcing g9 at a line break, under ' + clef, function() {
      // the custos used to get a NaN position under c4, which made the whole svg NaN high
      var ctxt = new Drawing.ChantContext();
      ctxt.setStaffHeight(48);
      var gabc = '(' + clef + ') a(f)b(g)c(h)d(g)e(f)f(e)g(f)h(g9)i(g0)j(g9)k(g0)l(g9)m(g0) (::)';
      var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), false);
      score.performLayout(ctxt);
      score.layoutChantLines(ctxt, 200);
      assert(score.lines.length > 1);
      score.lines.slice(0, -1).forEach(function(line, i) {
        var next = score.lines[i + 1];
        var neume = score.notations.slice(next.notationsStartIndex).find(function(notation) {
          return notation.isNeume;
        })!;
        assert(line.custos);
        assert(Math.abs(line.custos.staffPosition - neume.notes![0].staffPosition) < 1e-9,
          'custos at ' + line.custos.staffPosition + ' for ' + neume.notes![0].sourceGabc);
      });
      assert(Number.isFinite(score.bounds.height));
      assert.doesNotMatch(score.createSvg(ctxt), /NaN/);
    });
  });
});

describe('Canvas drawing', function() {
  [1, 0.8, 1.25].forEach(function(glyphMultiplier) {
    it('draws a porrectus where the svg does, with a glyph multiplier of ' + glyphMultiplier, function() {
      // the porrectus's y used to be divided by its scale before the translation, so it was drawn far off
      var g = globalThis as any;
      var hadPath2D = 'Path2D' in g;
      if (!hadPath2D) g.Path2D = function() {};
      var ctxt = new Drawing.ChantContext();
      ctxt.setStaffHeight(37.5, glyphMultiplier);
      var calls: any[][] = [];
      ctxt.canvasCtxt = {
        translate: function(x: number, y: number) { calls.push(['translate', x, y]); },
        scale: function(x: number, y: number) { calls.push(['scale', x, y]); },
        fill: function() { calls.push(['fill']); }
      } as any;
      var glyph = new Drawing.GlyphVisualizer(ctxt, Drawing.GlyphCode.Porrectus2);
      glyph.bounds.x = 10;
      glyph.setStaffPosition(ctxt, 2);
      try {
        glyph.draw(ctxt);
      } finally {
        if (!hadPath2D) delete g.Path2D;
      }
      // where the svg puts it too (its x and y), at the glyphs' scale: a
      // swash drawn for the glyph multiplier, rather than one stretched
      assert.equal(glyph.glyphId, glyphMultiplier === 1 ? 'Porrectus2' : 'Porrectus2x' + glyphMultiplier);
      assert.deepEqual(calls.slice(0, 2), [
        ['translate', glyph.bounds.x + glyph.origin.x, glyph.bounds.y + glyph.origin.y],
        ['scale', ctxt.glyphScaling, ctxt.glyphScaling]
      ]);
    });

    it('draws a porrectus swash that falls as far as its notes, at their size, with a glyph multiplier of ' + glyphMultiplier, function() {
      var ctxt = new Drawing.ChantContext();
      ctxt.setStaffHeight(37.5, glyphMultiplier);
      var glyph = new Drawing.GlyphVisualizer(ctxt, Drawing.GlyphCode.Porrectus2).glyph;
      // its lowest point is under the second note, two staff positions down,
      // by about half a punctum at the multiplier (52 to 63 glyph units)
      var belowSecondNote = (glyph.bounds.height - glyph.origin.y) * ctxt.glyphScaling - 2 * ctxt.staffInterval;
      assert(belowSecondNote > 52 * ctxt.glyphScaling && belowSecondNote < 63 * ctxt.glyphScaling,
        'the swash ends ' + belowSecondNote + ' below its second note');
    });
  });
});
