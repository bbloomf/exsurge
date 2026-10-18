var assert = require('assert');
var Drawing = require('../src/Exsurge.Drawing');
var Gabc = require('../src/Exsurge.Gabc').Gabc;

// the diff algorithm as it was before common prefixes and suffixes were split off
function referenceDiff(before, after) {
  var oldIndexMap = {}, i;
  for (i = 0; i < before.length; i++) {
    oldIndexMap[before[i].source] = oldIndexMap[before[i].source] || [];
    oldIndexMap[before[i].source].push(i);
  }
  var overlap = [], startOld = 0, startNew = 0, subLength = 0;
  for (var inew = 0; inew < after.length; inew++) {
    var _overlap = [];
    oldIndexMap[after[inew]] = oldIndexMap[after[inew]] || [];
    for (i = 0; i < oldIndexMap[after[inew]].length; i++) {
      var iold = oldIndexMap[after[inew]][i];
      _overlap[iold] = ((iold && overlap[iold - 1]) || 0) + 1;
      if (_overlap[iold] > subLength) {
        subLength = _overlap[iold];
        startOld = iold - subLength + 1;
        startNew = inew - subLength + 1;
      }
    }
    overlap = _overlap;
  }
  if (subLength === 0) {
    var result = [];
    if (before.length) result.push(['-', before]);
    if (after.length) result.push(['+', after]);
    return result;
  }
  return [].concat(
    referenceDiff(before.slice(0, startOld), after.slice(0, startNew)),
    [['=', after.slice(startNew, startNew + subLength)]],
    referenceDiff(before.slice(startOld + subLength), after.slice(startNew + subLength))
  );
}

function words(source) {
  return Gabc.splitWords(source);
}

function descriptors(source) {
  return words(source).map(function(word) { return { source: word }; });
}

function serializeDiff(results) {
  return results.map(function(result) {
    return [result[0], result[1].map(function(value) { return typeof value === 'string' ? value : value.source; })];
  });
}

function keptCount(results) {
  return results.reduce(function(count, result) { return count + (result[0] === '=' ? result[1].length : 0); }, 0);
}

function serializeMappings(mappings) {
  return mappings.map(function(mapping) {
    return [mapping.source, mapping.sourceIndex, mapping.notations.map(function(notation) {
      return [
        notation.constructor.name,
        notation.sourceIndex,
        notation.trailingSpace,
        notation.isAccidental ? notation.pitch.toInt() : null,
        (notation.notes || []).map(function(note) {
          return [note.pitch && note.pitch.toInt(), note.sourceIndex, note.shape];
        }),
        (notation.lyrics || []).map(function(lyric) {
          return [lyric.text, lyric.sourceIndex, lyric.lyricType];
        })
      ];
    })];
  });
}

function parsedMappings(source) {
  return serializeMappings(Gabc.createMappingsFromSource(new Drawing.ChantContext(), source));
}

function updatedMappings(beforeSource, afterSource, diff) {
  var originalDiff = Gabc.diffDescriptorsAndNewWords;
  Gabc.diffDescriptorsAndNewWords = diff;
  try {
    var ctxt = new Drawing.ChantContext();
    var mappings = Gabc.createMappingsFromSource(ctxt, beforeSource);
    Gabc.updateMappingsFromSource(ctxt, mappings, afterSource);
    return serializeMappings(mappings);
  } finally {
    Gabc.diffDescriptorsAndNewWords = originalDiff;
  }
}

// checks that results is a diff of before into after: the unchanged and deleted words
// make up before, the unchanged and inserted words make up after, and there are no
// adjacent chunks of the same kind
function assertValidDiff(before, after, results) {
  var rebuiltBefore = [], rebuiltAfter = [];
  results.forEach(function(result, i) {
    var values = result[1].map(function(value) { return typeof value === 'string' ? value : value.source; });
    if (result[0] !== '+') rebuiltBefore = rebuiltBefore.concat(values);
    if (result[0] !== '-') rebuiltAfter = rebuiltAfter.concat(values);
    assert.ok(values.length > 0, 'empty ' + result[0] + ' chunk');
    if (i > 0) assert.notStrictEqual(result[0], results[i - 1][0], 'adjacent ' + result[0] + ' chunks');
  });
  assert.deepStrictEqual(rebuiltBefore, before.map(function(descriptor) { return descriptor.source; }));
  assert.deepStrictEqual(rebuiltAfter, after);
}

var kyrie = '(c4) KY(f)ri(gh)e(h.) *(;) e(ixhi)lé(hg)i(h)son.(h.) (::) ' +
  'Chri(h)ste(gf) *(,) e(fg)lé(f)i(e)son.(f.) (::) ' +
  'Ky(f)ri(gh)e(h.) *(;) e(ixhi)lé(hg)i(h)son.(h.) (::) ' +
  'Al(f)le(g)lú(h)ia,(h.) (,) al(h)le(g)lú(f)ia.(f.) *(:) Ps.(::) ' +
  'Lau(f)da(g)te(h) (,) Do(h)mi(g)num(f) *(:) om(f)nes(g) gen(h)tes.(h.) (::)';

var edits = [
  ['changes a word in the middle', kyrie, kyrie.replace('Chri(h)ste(gf)', 'Chri(h)ste(ghf)')],
  ['inserts a word', kyrie, kyrie.replace('Lau(f)da(g)te(h)', 'Lau(f)da(g)te(h) Do(h)')],
  ['deletes a word', kyrie, kyrie.replace(' om(f)nes(g)', '')],
  ['inserts a repeated bar', kyrie, kyrie.replace('Do(h)mi(g)num(f)', 'Do(h)mi(g)num(f) (,)')],
  ['deletes a repeated bar', kyrie, kyrie.replace('(;) e(ixhi)', 'e(ixhi)')],
  ['inserts a repeated asterisk', kyrie, kyrie.replace('gen(h)tes.(h.)', '*(:) gen(h)tes.(h.)')],
  ['edits the first word', kyrie, kyrie.replace('KY(f)', 'KY(g)')],
  ['edits the last word', kyrie, kyrie.replace(/\(::\)$/, '(:)')],
  ['edits two separate words', kyrie, kyrie.replace('KY(f)', 'KY(g)').replace('gen(h)tes', 'gen(i)tes')],
  ['replaces everything', kyrie, '(c3) A(d)men.(d) (:)'],
  ['empties the source', kyrie, ''],
  ['starts from nothing', '', kyrie],
  ['changes nothing', kyrie, kyrie]
];

describe('Gabc diff', function() {
  edits.forEach(function(edit) {
    it('gives the same diff as before when it ' + edit[0], function() {
      var before = descriptors(edit[1]), after = words(edit[2]);
      var results = Gabc.diffDescriptorsAndNewWords(before, after);
      assertValidDiff(before, after, results);
      assert.deepStrictEqual(serializeDiff(results), serializeDiff(referenceDiff(before, after)));
      var expectedMappings = parsedMappings(edit[2]);
      assert.deepStrictEqual(updatedMappings(edit[1], edit[2], Gabc.diffDescriptorsAndNewWords), expectedMappings);
      assert.deepStrictEqual(updatedMappings(edit[1], edit[2], referenceDiff), expectedMappings);
    });
  });

  it('may align repeated words differently, but still updates the mappings correctly', function() {
    // with a common prefix split off, the inserted "(,)" goes after the kept one rather than before it
    var beforeSource = '(c4) a(f) x(g) (,)', afterSource = '(c4) a(f) (,) y(h) (,)';
    var before = descriptors(beforeSource), after = words(afterSource);
    var results = Gabc.diffDescriptorsAndNewWords(before, after);
    assertValidDiff(before, after, results);
    assert.notDeepStrictEqual(serializeDiff(results), serializeDiff(referenceDiff(before, after)));
    assert.deepStrictEqual(updatedMappings(beforeSource, afterSource, Gabc.diffDescriptorsAndNewWords), parsedMappings(afterSource));
    assert.deepStrictEqual(updatedMappings(beforeSource, afterSource, referenceDiff), parsedMappings(afterSource));
  });

  it('recomputes the pitch of a kept accidental after a clef change', function() {
    var beforeSource = '(c4) x(f) a(ix) b(g)', afterSource = '(c4) a(ix) (f3) a(ix) b(g)';
    assert.deepStrictEqual(updatedMappings(beforeSource, afterSource, Gabc.diffDescriptorsAndNewWords), parsedMappings(afterSource));
  });

  it('resets the accidentals at a new word before a kept accidental', function() {
    var beforeSource = '(f3) b(ixi) d(ix) e(h)', afterSource = '(c4) b(ixi) d(ix) e(h)';
    assert.deepStrictEqual(updatedMappings(beforeSource, afterSource, Gabc.diffDescriptorsAndNewWords), parsedMappings(afterSource));
  });

  it('leaves no empty mapping behind for trailing whitespace', function() {
    assert.deepStrictEqual(updatedMappings('(c4) a(f)', '(c4) a(f) b(g) ', Gabc.diffDescriptorsAndNewWords), parsedMappings('(c4) a(f) b(g) '));
  });

  it("doesn't carry an accidental or an open brace over from the last chant parsed", function() {
    var pitch = parsedMappings('(i)')[0][2][0][4][0][0];
    parsedMappings('b(ixi)');
    assert.strictEqual(parsedMappings('(i)')[0][2][0][4][0][0], pitch);
    var mappings = parsedMappings('a(f)');
    parsedMappings('y(g[ub:0;4mm])');
    assert.deepStrictEqual(parsedMappings('a(f)'), mappings);
    assert.strictEqual(Gabc.createMappingsFromSource(new Drawing.ChantContext(), 'a(f)')[0].notations[0].notes[0].braceEnd, undefined);
  });

  it('updates mappings to match a fresh parse for random edits with repeated words', function() {
    var vocabulary = ['(,)', '*(:)', '(;)', '(::)', 'Ky(f)', 'ri(gh)', 'e(h.)', 'a(fg)', 'b(gx)', 'c(h)', '(c3)', 'e(i;)', '<i>Ps.</i>(::)',
      '(f3)', '(cb3)', 'a(ix)', 'd(ixi)', '(ixhi)', 'e(hy)', 'o(i#i)', 'f(e0f9)', 'q(f[ub:0;4mm])', 'r(gh[ob:1;6mm])'];
    // a small seeded generator (mulberry32), so that failures are reproducible
    var seed = 12345;
    function random(n) {
      var t = (seed = (seed + 0x6d2b79f5) | 0);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) % n;
    }
    function randomWords(count) {
      var result = [];
      for (var i = 0; i < count; i++) result.push(vocabulary[random(vocabulary.length)]);
      return result;
    }

    for (var trial = 0; trial < 300; trial++) {
      var beforeWords = ['(c4)'].concat(randomWords(1 + random(20)));
      var afterWords = beforeWords.slice();
      for (var edit = random(2); edit >= 0; edit--) {
        var position = 1 + random(afterWords.length);
        switch (random(3)) {
          case 0: afterWords.splice.apply(afterWords, [position, 0].concat(randomWords(1 + random(3)))); break;
          case 1: afterWords.splice(position, 1 + random(3)); break;
          default: afterWords.splice(position, 1, vocabulary[random(vocabulary.length)]);
        }
      }
      var beforeSource = beforeWords.join(' '), afterSource = afterWords.join(' ');
      var before = descriptors(beforeSource), after = words(afterSource);
      var results = Gabc.diffDescriptorsAndNewWords(before, after);
      assertValidDiff(before, after, results);
      assert.ok(keptCount(results) >= keptCount(referenceDiff(before, after)), beforeSource + ' => ' + afterSource);
      assert.deepStrictEqual(
        updatedMappings(beforeSource, afterSource, Gabc.diffDescriptorsAndNewWords),
        parsedMappings(afterSource),
        beforeSource + ' => ' + afterSource
      );
    }
  });
});
