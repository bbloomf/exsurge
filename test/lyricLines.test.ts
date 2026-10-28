import { describe, it, vi } from "vitest";
import assert from "node:assert";
import * as Chant from "../src/Exsurge.Chant.js";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { Gabc, GabcHeader } from "../src/Exsurge.Gabc.js";
import { fakeFont } from "./helpers/fonts";

const { LyricType } = Drawing;

function scoreOf(gabc: string, setupContext?: (ctxt: Drawing.ChantContext) => void) {
  var ctxt = new Drawing.ChantContext();
  // every character is half an em wide
  ctxt.setFont('Palatino', 16, {}, { Regular: fakeFont(0.5) });
  if (setupContext) setupContext(ctxt);
  var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), false);
  score.performLayout(ctxt);
  return { score, ctxt };
}

// the lyrics of each neume, as their text
function linesOf(gabc: string, setupContext?: (ctxt: Drawing.ChantContext) => void) {
  return scoreOf(gabc, setupContext)
    .score.notations.filter((notation) => notation.isNeume)
    .map((notation) => notation.lyrics.map((lyric) => lyric.text));
}

// the lyrics of the first lyric-line, on the neumes that have them
function lyricLineOf(gabc: string) {
  return scoreOf(gabc)
    .score.notations.filter((notation) => notation.lyrics[1])
    .map((notation) => notation.lyrics[1]);
}

const kyrie = '(c4) Ky(f)ri(g)e(h) (,) e(f)le(g)i(h)son(f) (::)';

describe('lyric-line headers', function() {
  it("gives each syllable with notes the next syllable of each lyric-line, as a line of lyrics after the first", function() {
    var lines = linesOf(`lyric-line: Chri+ste e+le+i+son;\nlyric-line: a+b c d+e+f+g;\n%%\n${kyrie}`);
    assert.deepEqual(lines, [
      ['Ky', 'Chri', 'a'],
      ['ri', 'ste', 'b'],
      ['e', 'e', 'c'],
      ['e', 'le', 'd'],
      ['le', 'i', 'e'],
      ['i', 'son', 'f'],
      ['son', '', 'g']
    ]);
  });

  it("gives each syllable its place in its word, from the spaces, + and -", function() {
    var lyrics = lyricLineOf(`lyric-line: Chri-ste e+le+i son;\n%%\n${kyrie}`);
    assert.deepEqual(
      lyrics.map((lyric) => [lyric.text, lyric.lyricType, !!lyric.forceConnector]),
      [
        ['Chri', LyricType.BeginningSyllable, true],
        ['ste', LyricType.EndingSyllable, false],
        ['e', LyricType.BeginningSyllable, false],
        ['le', LyricType.MiddleSyllable, false],
        ['i', LyricType.EndingSyllable, false],
        ['son', LyricType.SingleSyllable, false]
      ]
    );
  });

  it("ends a word at the end of the line after a + or -, and at a - between spaces", function() {
    var ctxt = new Drawing.ChantContext();
    const types = (text: string) =>
      Gabc.splitLyricLine(ctxt, { text, indices: Array.from(text, (_, i) => i) }).map((lyric) => [lyric.text, lyric.lyricType]);
    assert.deepEqual(types('a+b+c-'), [
      ['a', LyricType.BeginningSyllable],
      ['b', LyricType.MiddleSyllable],
      ['c-', LyricType.EndingSyllable]
    ]);
    assert.deepEqual(types('a+b+'), [['a', LyricType.BeginningSyllable], ['b', LyricType.EndingSyllable]]);
    assert.deepEqual(types('a - b -c'), [
      ['a', LyricType.SingleSyllable],
      ['b', LyricType.SingleSyllable],
      ['c', LyricType.SingleSyllable]
    ]);
  });

  it("leaves a syllable that is just _ empty, without counting it in its word", function() {
    // (with no line after it that has a syllable there, it has no lyric at all)
    var lines = linesOf(`lyric-line: Chri+_+ste e+le+_ son;\n%%\n${kyrie}`);
    assert.deepEqual(lines.map((lyrics) => lyrics[1]), ['Chri', undefined, 'ste', 'e', 'le', undefined, 'son']);
    lines = linesOf(`lyric-line: Chri+_+ste e+le+_ son;\nlyric-line: a b c d e f g;\n%%\n${kyrie}`);
    assert.deepEqual(lines.map((lyrics) => lyrics[1]), ['Chri', '', 'ste', 'e', 'le', '', 'son']);
    var lyrics = lyricLineOf(`lyric-line: Chri+_+ste e+le+_ son;\n%%\n${kyrie}`).filter((lyric) => lyric.text);
    assert.deepEqual(
      lyrics.map((lyric) => lyric.lyricType),
      [LyricType.BeginningSyllable, LyricType.EndingSyllable, LyricType.BeginningSyllable, LyricType.EndingSyllable, LyricType.SingleSyllable]
    );
  });

  it("gives a syllable with notes but no text an empty lyric before the lyric-line's", function() {
    var lines = linesOf('lyric-line: a+b+c;\n%%\n(c4) Ky(f)(g)ri(h)');
    assert.deepEqual(lines, [['Ky', 'a'], ['', 'b'], ['ri', 'c']]);
  });

  it("gives the syllables without notes, the clefs and the bars none of the lyric-line's syllables", function() {
    var { score } = scoreOf('lyric-line: a b;\n%%\n(c4) *(,) Ky(f) <i>Ps.</i>() ri(g) (::)');
    var lyrics = score.notations.map((notation) => notation.lyrics.map((lyric) => lyric.originalText));
    assert.deepEqual(lyrics, [['*'], ['Ky', 'a'], ['<i>Ps.</i>'], ['ri', 'b'], []]);
  });

  it("leaves out the controls in the lines that | adds to a syllable with notes", function() {
    var { score } = scoreOf('lyric-line: x;\n%%\n(c4) a|<eu>b(f) c(g)');
    assert.ok(score.notations.every((notation) => !notation.euouae));
    // (without lyric-line headers, they're read)
    assert.ok(scoreOf('(c4) a|<eu>b(f) c(g)').score.notations.some((notation) => notation.euouae));
  });

  it("makes _ in a syllable a space, and ~ a lyric tie as ctxt.lyricTie has it", function() {
    var gabc = 'lyric-line: De_us~me+us;\n%%\n(c4) a(f)b(g)';
    assert.deepEqual(linesOf(gabc).map((lyrics) => lyrics[1]), ['De us me', 'us']);
    var { score, ctxt } = scoreOf(gabc, (ctxt) => (ctxt.lyricTie = 'undertie'));
    assert.equal(score.notations[0].lyrics[1].text, 'De us' + ctxt.specials.ut + 'me');
  });

  it("takes away the meaning of + - _ ~ ; and the space after a $", function() {
    var lines = linesOf('lyric-line: twen$-ty$+one $_$~$ x$;;\n%%\n(c4) a(f)b(g)');
    assert.deepEqual(lines.map((lyrics) => lyrics[1]), ['twen-ty+one', '_~ x;']);
  });

  it("keeps the text in <v>, <sp> and tags together, and a verse number with the syllable after it", function() {
    var lyrics = lyricLineOf('lyric-line: <verseNum>2.</verseNum> a<sp>+</sp>b+c<v>x y</v>;\n%%\n(c4) a(f)b(g)');
    assert.deepEqual(lyrics.map((lyric) => lyric.originalText), ['a<sp>+</sp>b', 'c<v>x y</v>']);
    assert.equal(lyrics[0].verseNumber!.text, '2.');
  });

  it("carries the styles left open on to the syllables after them", function() {
    var lyrics = lyricLineOf(`lyric-line: <i>Chri+ste</i> e+<b>le+i</b>+son;\n%%\n${kyrie}`);
    assert.deepEqual(
      lyrics.map((lyric) => lyric.openStyles || ''),
      ['', '<i>', '', '', '<b>', '']
    );
  });

  it("takes the place of the lines that | adds to a syllable with notes, but not of those on other notations", function() {
    var lines = linesOf('lyric-line: x y;\n%%\n(c4) a|b(f) c|d|e(g) f(h)');
    assert.deepEqual(lines, [['a', 'x'], ['c', 'y'], ['f']]);
    var { score } = scoreOf('lyric-line: x;\n%%\n(c4) a(f) *|†(,)');
    assert.deepEqual(score.notations[1].lyrics.map((lyric) => lyric.originalText), ['*', '†']);
    // (without lyric-line headers, the lines that | adds are kept)
    assert.deepEqual(linesOf('(c4) a|b(f) c|d|e(g)'), [['a', 'b'], ['c', 'd', 'e']]);
  });

  it("reads a lyric-line over more than one line, and leaves out an empty one", function() {
    var lines = linesOf(`lyric-line:;\nlyric-line: Chri+ste\ne+le+i+son;;\n%%\n${kyrie}`);
    assert.deepEqual(lines.map((lyrics) => lyrics.length), [2, 2, 2, 2, 2, 2, 1]);
    assert.equal(lines[2][1], 'e');
  });

  it("warns of syllables that there are no syllables with notes for, and leaves them out", function() {
    var warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      var lines = linesOf('lyric-line: a b c;\n%%\n(c4) x(f)y(g)');
      assert.deepEqual(lines, [['x', 'a'], ['y', 'b']]);
      assert.equal(warn.mock.calls.length, 1);
    } finally {
      warn.mockRestore();
    }
  });

  it("gives each lyric the negative of its index in the gabc, which an edit of the notes doesn't change", function() {
    var gabc = `name: Kyrie;\nlyric-line: Chri+ste <verseNum>3.</verseNum> e+le+i+son;\n%%\n${kyrie}`;
    var { score, ctxt } = scoreOf(gabc);
    var lyrics = score.notations.filter((notation) => notation.lyrics[1]).map((notation) => notation.lyrics[1]);
    assert.deepEqual(
      lyrics.map((lyric) => gabc.slice(-lyric.sourceIndex).match(/^\w+/)![0]),
      ['Chri', 'ste', 'e', 'le', 'i', 'son']
    );
    assert.equal(gabc.slice(-lyrics[2].verseNumber!.sourceIndex!, -lyrics[2].verseNumber!.sourceIndex! + 2), '3.');
    // (after a byte-order mark, and on the lines of a multi-line value with \r\n line ends)
    var bomGabc = '﻿lyric-line: a\r\nb+c;;\r\n%%\r\n(c4) x(f)y(g)z(h)';
    assert.deepEqual(
      lyricLineOf(bomGabc).map((lyric) => bomGabc[-lyric.sourceIndex]),
      ['a', 'b', 'c']
    );
    var sourceIndices = lyrics.map((lyric) => lyric.sourceIndex);
    Gabc.updateMappingsFromSource(ctxt, score.mappings, gabc.replace('Ky(f)', 'Kyy(f)'));
    score.updateNotations(ctxt);
    assert.deepEqual(
      score.notations.filter((notation) => notation.lyrics[1]).map((notation) => notation.lyrics[1].sourceIndex),
      sourceIndices
    );
  });

  it("keeps the lyrics that stay the same after an edit, and lays out again only the notations whose lyrics change", function() {
    var gabc = `lyric-line: Chri+ste e+le+i+son;\n%%\n${kyrie}`;
    var { score, ctxt } = scoreOf(gabc);
    var before = score.notations.map((notation) => notation.lyrics[1]);
    Gabc.updateMappingsFromSource(ctxt, score.mappings, gabc.replace('Chri+ste', 'Chri+sti'));
    score.updateNotations(ctxt);
    var after = score.notations.map((notation) => notation.lyrics[1]);
    assert.deepEqual(after.map((lyric, i) => lyric === before[i]), [true, false, true, true, true, true, true, true, true]);
    assert.equal(after[1].text, 'sti');
    assert.deepEqual(score.notations.slice(0, 7).map((notation) => notation.needsLayout), [false, true, false, false, false, false, false]);
  });

  it("keeps the lyrics that only move in the header, with their source indices moved too", function() {
    var gabc = `name: K;\nlyric-line: <verseNum>2.</verseNum> Chri+ste e+le+i+son;\n%%\n${kyrie}`;
    var { score, ctxt } = scoreOf(gabc);
    var before = score.notations.map((notation) => notation.lyrics[1]);
    var edited = gabc.replace('name: K;', 'name: Kyrie;');
    Gabc.updateMappingsFromSource(ctxt, score.mappings, edited);
    score.updateNotations(ctxt);
    var after = score.notations.map((notation) => notation.lyrics[1]);
    assert.ok(after.every((lyric, i) => lyric === before[i]));
    // (all but the last word, which is always parsed again)
    assert.ok(score.notations.slice(0, -1).every((notation) => !notation.needsLayout));
    var lyrics = after.filter((lyric) => lyric);
    assert.deepEqual(
      lyrics.map((lyric) => edited.slice(-lyric.sourceIndex).match(/^\w+/)![0]),
      ['Chri', 'ste', 'e', 'le', 'i', 'son']
    );
    assert.equal(edited.slice(-lyrics[0].verseNumber!.sourceIndex!, -lyrics[0].verseNumber!.sourceIndex! + 2), '2.');
  });
});

describe('Header values', function() {
  it("ends a lyric-line header's value at a ; that a $ doesn't escape, and other values at any ;", function() {
    var header = new GabcHeader('lyric-line: a$; b$;;\nname: c$$;\ncommentary: Price $;\n%%\n');
    assert.equal(header['lyric-line'], 'a$; b$;');
    assert.equal(header.name, 'c$$');
    assert.equal(header.commentary, 'Price $');
  });
});

describe('Lines of lyrics on a line of the score', function() {
  // the number of lines of lyrics on each line of the score, and the y of each lyric of its neumes
  function rowsOf(gabc: string) {
    var { score, ctxt } = scoreOf(gabc);
    score.layoutChantLines(ctxt, 1000);
    return score.lines.map((line): [number, number[][]] => [
      line.numLyricLines,
      score.notations
        .slice(line.notationsStartIndex, line.notationsStartIndex + line.numNotationsOnLine)
        .filter((notation) => notation.isNeume)
        .map((notation) => notation.lyrics.map((lyric) => lyric.bounds.y - line.lyricLineBaseline))
    ]);
  }

  it("leaves out the lines of lyrics with no text and no verse number in effect, as before an Amen", function() {
    var verses = '(c4) <verseNum>1.</verseNum> Glo|<verseNum>2.</verseNum> Lau(f)ri|des(g)a.|tu.(h) (::) (z) ';
    var [first, amen] = rowsOf(verses + '<verseNum></verseNum>|<verseNum></verseNum>A(f) |men.(g) (::)');
    assert.equal(first[0], 2);
    assert.equal(amen[0], 1);
    assert.deepEqual(amen[1], [[0, 0], [0, 0]]);
  });

  it("keeps a line of lyrics with a verse number in effect, though it has no text on the line", function() {
    var verses = '(c4) <verseNum>1.</verseNum> Glo|<verseNum>2.</verseNum> Lau(f)ri|des(g)a.|tu.(h) (::) (z) ';
    var [, amen] = rowsOf(verses + '|A(f) |men.(g) (::)');
    assert.equal(amen[0], 2);
    var height = rowsOf(verses)[0][1][0][1];
    assert.deepEqual(amen[1], [[0, height], [0, height]]);
  });
});
