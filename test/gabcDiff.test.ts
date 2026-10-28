import { describe, it } from "vitest";
import assert from "node:assert";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { Gabc, type WordDiff } from "../src/Exsurge.Gabc.js";
import type { ChantMapping } from "../src/Exsurge.Chant.js";
import * as Exsurge from "../src/index.js";
import { featureCases } from "./golden/cases";
import { render } from "./golden/harness";

type Descriptor = { source: string };
type Diff = WordDiff<Descriptor>[];

// the diff algorithm as it was before common prefixes and suffixes were split off
function referenceDiff(before: Descriptor[], after: string[]): Diff {
  var oldIndexMap: { [source: string]: number[] } = {}, i;
  for (i = 0; i < before.length; i++) {
    oldIndexMap[before[i].source] = oldIndexMap[before[i].source] || [];
    oldIndexMap[before[i].source].push(i);
  }
  var overlap: number[] = [], startOld = 0, startNew = 0, subLength = 0;
  for (var inew = 0; inew < after.length; inew++) {
    var _overlap: number[] = [];
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
    var result: Diff = [];
    if (before.length) result.push(['-', before]);
    if (after.length) result.push(['+', after]);
    return result;
  }
  return ([] as Diff).concat(
    referenceDiff(before.slice(0, startOld), after.slice(0, startNew)),
    [['=', after.slice(startNew, startNew + subLength)]] as Diff,
    referenceDiff(before.slice(startOld + subLength), after.slice(startNew + subLength))
  );
}

function words(source: string) {
  return Gabc.splitWords(source);
}

function descriptors(source: string): Descriptor[] {
  return words(source).map(function(word) { return { source: word }; });
}

function serializeDiff(results: Diff) {
  return results.map(function(result) {
    return [result[0], (result[1] as Array<string | Descriptor>).map(function(value) { return typeof value === 'string' ? value : value.source; })];
  });
}

function keptCount(results: Diff) {
  return results.reduce(function(count: number, result) { return count + (result[0] === '=' ? result[1].length : 0); }, 0);
}

function serializeMappings(mappings: ChantMapping[]): any[] {
  return mappings.map(function(mapping) {
    // (as any, to look at what each kind of notation has)
    return [mapping.source, mapping.sourceIndex, mapping.notations.map(function(notation: any) {
      return [
        notation.constructor.name,
        notation.sourceIndex,
        notation.trailingSpace,
        notation.isAccidental ? notation.pitch.toInt() : null,
        (notation.notes || []).map(function(note: any) {
          return [
            note.pitch && note.pitch.toInt(), note.sourceIndex, note.shape, note.bracketStart,
            note.choralSign && note.choralSign.sourceIndex,
            note.choralNabc && note.choralNabc.sourceIndex,
            note.braceStart && [note.braceStart.automatic, note.braceStart.length],
            note.braceEnd && [note.braceEnd.automatic, note.braceEnd.attachment]
          ];
        }),
        (notation.lyrics || []).map(function(lyric: any) {
          return [lyric.text, lyric.sourceIndex, lyric.lyricType, lyric.openStyles];
        }),
        notation.noLineBreak,
        notation.euouae
      ];
    })];
  });
}

function parsedMappings(source: string) {
  return serializeMappings(Gabc.createMappingsFromSource(new Drawing.ChantContext(), source));
}

function updatedMappings(
  beforeSource: string,
  afterSource: string,
  diff: (before: Descriptor[], after: string[]) => Diff
) {
  var originalDiff = Gabc.diffDescriptorsAndNewWords;
  Gabc.diffDescriptorsAndNewWords = diff as typeof Gabc.diffDescriptorsAndNewWords;
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
function assertValidDiff(before: Descriptor[], after: string[], results: Diff) {
  var rebuiltBefore: string[] = [], rebuiltAfter: string[] = [];
  results.forEach(function(result, i) {
    var values = (result[1] as Array<string | Descriptor>).map(function(value) { return typeof value === 'string' ? value : value.source; });
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
  ['changes nothing', kyrie, kyrie],
  ['adds a Gregorio comment', kyrie, kyrie.replace('Chri(h)ste(gf) ', 'Chri(h)ste(gf) % a comment (f)\n')],
  ['comments out a word', kyrie, kyrie.replace(' om(f)nes(g) ', ' % om(f)nes(g)\n ')],
  ['edits a word after a comment', kyrie.replace('Lau(f)', '% x\nLau(f)'), kyrie.replace('Lau(f)', '% x\nLau(g)')],
  ['adds a comment between syllables', kyrie, kyrie.replace('e(fg)lé(f)', 'e(fg)%c\nlé(f)')],
  ['edits a word after a blank line', kyrie.replace(' Lau(f)', '\n\nLau(f)'), kyrie.replace(' Lau(f)', '\n\nLau(f)').replace('gen(h)tes', 'gen(i)tes')],
  ['edits a word after a comment and a blank line', kyrie.replace('Lau(f)', '% x\n\nLau(f)'), kyrie.replace('Lau(f)', '% x\n\nLau(f)').replace('gen(h)tes', 'gen(i)tes')],
  ['adds <nlba> after a word\'s last notes', kyrie, kyrie.replace('Chri(h)ste(gf)', 'Chri(h)ste(gf<nlba>)')],
  ['takes away <nlba> after a word\'s last notes', kyrie.replace('Chri(h)ste(gf)', 'Chri(h)ste(gf<nlba>)'), kyrie],
  ['adds [[ after a word\'s last notes', kyrie, kyrie.replace('Lau(f)da(g)te(h)', 'Lau(f)da(g)te(h[[)')],
  ['edits the word after [[', kyrie.replace('Lau(f)da(g)te(h)', 'Lau(f)da(g)te(h[[)'), kyrie.replace('Lau(f)da(g)te(h)', 'Lau(f)da(g)te(h[[)').replace('Do(h)', 'Do(i)')],
  ['adds a closing tag after a word', kyrie, kyrie.replace('Chri(h)ste(gf) ', 'Chri(h)ste(gf)</nlba> ')],
  ['edits the word before a closing tag', kyrie.replace('Chri(h)ste(gf) ', 'Chri(h)ste(gf)</nlba> '), kyrie.replace('Chri(h)ste(gf) ', 'Chri(h)ste(ghf)</nlba> ')],
  ['edits a word after a newline and a space', kyrie.replace(' Lau(f)', '\n Lau(f)'), kyrie.replace(' Lau(f)', '\n Lau(g)')],
  ['edits a word after two spaces', kyrie.replace(' Lau(f)', '  Lau(f)'), kyrie.replace(' Lau(f)', '  Lau(f)').replace('Do(h)', 'Do(i)')],
  ['opens a style that goes on into the next words', kyrie, kyrie.replace('Chri(h)', '<i>Chri(h)')],
  ['closes a style after a word\'s last notes', kyrie.replace('Chri(h)', '<i>Chri(h)'), kyrie.replace('Chri(h)ste(gf) ', '<i>Chri(h)ste(gf)</i> ')],
  ['edits a word in a style left open', kyrie.replace('Chri(h)', '<i>Chri(h)'), kyrie.replace('Chri(h)', '<i>Chri(h)').replace('Lau(f)', 'Lau(g)')],
  ['takes away a style left open', kyrie.replace('Chri(h)', '<i>Chri(h)'), kyrie],
  ['adds a closing tag that isn\'t Gregorio\'s after a word', kyrie, kyrie.replace('Chri(h)ste(gf) ', 'Chri(h)ste(gf)</e> ')],
  ['inserts a word before a choral sign', kyrie.replace('om(f)', 'om(f[cs:t])'), kyrie.replace('om(f)', 'no(g) om(f[cs:t])')],
  ['inserts a word before a NABC choral sign', kyrie.replace('om(f)', 'om(f[cn:vi])'), kyrie.replace('om(f)', 'no(g) om(f[cn:vi])')],
  ['adds a brace given a length before kept repeated notes', kyrie.replace('om(f)', 'om(fss)'), kyrie.replace('om(f)', 'om(fss)').replace('num(f)', 'num(f[ob:1;4mm])')]
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

  it("doesn't parse the words after an edit again just because a style is left open", function() {
    var ctxt = new Drawing.ChantContext();
    var mappings = Gabc.createMappingsFromSource(ctxt, '(c4) <i>a(f) b(g) c(h) d(i) e(j)');
    var [first, , , next] = mappings.slice(1);
    Gabc.updateMappingsFromSource(ctxt, mappings, '(c4) <i>a(f) b(g) c(hg) d(i) e(j)');
    assert.strictEqual(mappings[1], first);
    assert.strictEqual(mappings[4], next);
    assert.deepStrictEqual(serializeMappings(mappings), parsedMappings('(c4) <i>a(f) b(g) c(hg) d(i) e(j)'));
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
    assert.strictEqual(Gabc.createMappingsFromSource(new Drawing.ChantContext(), 'a(f)')[0].notations[0].notes![0].braceEnd, undefined);
  });

  it('updates mappings to match a fresh parse for random edits with repeated words', function() {
    var vocabulary = ['(,)', '*(:)', '(;)', '(::)', 'Ky(f)', 'ri(gh)', 'e(h.)', 'a(fg)', 'b(gx)', 'c(h)', '(c3)', 'e(i;)', '<i>Ps.</i>(::)', '<i>a(f)', 'b(g)</i>',
      '(f3)', '(cb3)', 'a(ix)', 'd(ixi)', '(ixhi)', 'e(hy)', 'o(i#i)', 'f(e0f9)', 'q(f[ub:0;4mm])', 'r(gh[ob:1;6mm])',
      's(hss)', 't(gvv)', 'u(g[cs:t]f)'];
    // a small seeded generator (mulberry32), so that failures are reproducible
    var seed = 12345;
    function random(n: number) {
      var t = (seed = (seed + 0x6d2b79f5) | 0);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) % n;
    }
    function randomWords(count: number) {
      var result: string[] = [];
      for (var i = 0; i < count; i++) result.push(vocabulary[random(vocabulary.length)]);
      return result;
    }

    for (var trial = 0; trial < 300; trial++) {
      var beforeWords = ['(c4)'].concat(randomWords(1 + random(20)));
      var afterWords = beforeWords.slice();
      for (var edit = random(2); edit >= 0; edit--) {
        var position = 1 + random(afterWords.length);
        switch (random(3)) {
          case 0: afterWords.splice(position, 0, ...randomWords(1 + random(3))); break;
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

describe('Laying out an edited score', function() {
  var puer = featureCases.find(function(c) { return c.name === 'puer-natus-est'; })!.gabc;
  var edited = puer
    .replace('na(iji)tus(h)', 'na(ijiji)tus(hg) no(h)vus(h)')
    .replace('(;) ma(hj)gni', '(;) ma(hjk)gni');

  // where each line starts, and where each notation and its lyrics are on its line
  function positions(score: any) {
    return {
      lines: score.lines.map(function(line: any) { return line.notationsStartIndex; }),
      notations: score.notations.map(function(notation: any) {
        return [notation.bounds.x].concat(notation.lyrics.map(function(lyric: any) { return lyric.bounds.x; }));
      })
    };
  }

  // the lyrics under Puer natus est's divisiones (such as *(:)) are moved with them when
  // they are centered, and used to be put back elsewhere for the next layout
  it('places the notations as a fresh layout does, after an edit or at another width', async function() {
    for (var width = 150; width <= 700; width += 10) {
      var fresh = positions((await render(Exsurge, edited, { useDropCap: true, width: width }, [])).score);
      var afterEdit = await render(Exsurge, puer, { useDropCap: true, width: width, edits: [edited] }, []);
      assert.deepStrictEqual(positions(afterEdit.score), fresh, 'edited, at ' + width);
      var relaidOut = await render(Exsurge, edited, { useDropCap: true, width: 1000 - width, relayoutWidths: [width] }, []);
      assert.deepStrictEqual(positions(relaidOut.score), fresh, 'laid out again, at ' + width);
    }
  });
});
