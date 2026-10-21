//
// Author(s):
// Fr. Matthew Spencer, OSJ <mspencer@osjusa.org>
//
// Copyright (c) 2008-2016 Fr. Matthew Spencer, OSJ
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

import assert from "node:assert";
import { describe, it } from "vitest";
import * as Exsurge from "../src/index.js";



describe('Core functionality', function() {

  it('Point object', function() {
    var point = new Exsurge.Point(3.14, 159.26);
    assert.strictEqual(point.x, 3.14);
    assert.strictEqual(point.y, 159.26);

    var clone = point.clone();
    assert.strictEqual(clone.x, 3.14);
    assert.strictEqual(clone.y, 159.26);

    assert.strictEqual(point.equals(clone), true);
    assert.strictEqual(point.equals(new Exsurge.Point()), false);
  });

  it('Rect object', function() {

    var rect = new Exsurge.Rect(3, 1, 4, 5);
    assert.strictEqual(rect.x, 3);
    assert.strictEqual(rect.y, 1);
    assert.strictEqual(rect.width, 4);
    assert.strictEqual(rect.height, 5);

    var clone = rect.clone();
    assert.strictEqual(clone.x, 3);
    assert.strictEqual(clone.y, 1);
    assert.strictEqual(clone.width, 4);
    assert.strictEqual(clone.height, 5);

    assert.strictEqual(rect.isEmpty(), false);

    assert.strictEqual(rect.right(), 3 + 4);
    assert.strictEqual(rect.bottom(), 1 + 5);

    assert.strictEqual(rect.equals(clone), true);

    var badRect = new Exsurge.Rect();
    assert.strictEqual(badRect.isEmpty(), true);

    assert.strictEqual(rect.equals(badRect), false);

    // fixme: test Rect.contains and Rect.union
  });

  it('Margins object', function() {
    var margins = new Exsurge.Margins(10, 11, 12, 13);
    assert.strictEqual(margins.left, 10);
    assert.strictEqual(margins.top, 11);
    assert.strictEqual(margins.right, 12);
    assert.strictEqual(margins.bottom, 13);

    var clone = margins.clone();
    assert.strictEqual(clone.left, 10);
    assert.strictEqual(clone.top, 11);
    assert.strictEqual(clone.right, 12);
    assert.strictEqual(clone.bottom, 13);

    assert.strictEqual(margins.equals(clone), true);
  });

  it('Size object', function() {
    var size = new Exsurge.Size(3.14, 159.26);
    assert.strictEqual(size.width, 3.14);
    assert.strictEqual(size.height, 159.26);

    var clone = size.clone();
    assert.strictEqual(clone.width, 3.14);
    assert.strictEqual(clone.height, 159.26);

    assert.strictEqual(size.equals(clone), true);
    assert.strictEqual(size.equals(new Exsurge.Size()), false);
  });
});

describe('Latin syllabification', function() {

  var lang = new Exsurge.Latin();

  var assertWordSyllables = function(word: string[], syllables: string[]) {
    assert.strictEqual(word.length, syllables.length);

    for (var i = 0; i < word.length; i++) {
      assert.strictEqual(word[i], syllables[i]);
    }
  }

  it("Syllabify 'Puer natus est'", function() {

    var words = lang.syllabify('Puer natus est');
    assert.strictEqual(words.length, 3);

    assertWordSyllables(words[0], ['Pu', 'er']);
    assertWordSyllables(words[1], ['na', 'tus']);
    assertWordSyllables(words[2], ['est']);
  });
});

// ---- Gregorio GABC (docs/gregorio-feature-gap.md, Phase 1)

// the notations of a score, without its first clef (as in score.notations)
const parseNotations = (gabc: string) => {
  const ctxt = new Exsurge.ChantContext();
  const notations = Exsurge.Gabc.createMappingsFromSource(ctxt, gabc).flatMap((mapping) => mapping.notations);
  return notations[0]?.isClef ? notations.slice(1) : notations;
};
const lyricTexts = (notations: Exsurge.ChantNotationElement[]) =>
  notations.flatMap((notation) => notation.lyrics.map((lyric) => lyric.text));

describe("Gregorio lyric controls", function() {
  it("marks the notations where <eu> and <nlba> areas start and end", function() {
    const notations = parseNotations(
      "(c4) a(f) (:) <eu>E(i) u(i) o(i) u(h) a(hhh) e</eu>(fe..) (::) <nlba>Ky(f)ri(g)e(h/gh)</nlba> son(f)"
    );
    assert.deepStrictEqual(lyricTexts(notations), ["a", "E", "u", "o", "u", "a", "e", "Ky", "ri", "e", "son"]);
    const marks = notations.map((notation) => [notation.euouae, notation.noLineBreak]);
    assert.deepStrictEqual(marks[2], [{ start: true }, undefined]);
    assert.deepStrictEqual(marks[7], [{ end: true }, undefined]);
    assert.deepStrictEqual(marks[9], [undefined, { start: true }]);
    // the syllable e(h/gh) is two notations, and the area ends at the last
    assert.deepStrictEqual(marks[11], [undefined, undefined]);
    assert.deepStrictEqual(marks[12], [undefined, { end: true }]);
    assert.strictEqual(notations.filter((notation) => notation.euouae || notation.noLineBreak).length, 4);
  });

  it("ends an area at a closing tag between a word's notes and the next word", function() {
    const notations = parseNotations("(c4) <nlba>Ky(f)ri(g)e.(h)</nlba> Chri(g)ste(f) e(g)lé(f)i(e)son(f)</eu> (::)");
    assert.deepStrictEqual(lyricTexts(notations), ["Ky", "ri", "e.", "Chri", "ste", "e", "lé", "i", "son"]);
    assert.deepStrictEqual(notations[2].noLineBreak, { end: true });
    // e. is the end of a word, and Chri the start of the next
    assert.strictEqual(notations[2].lyrics[0].lyricType, Exsurge.LyricType.EndingSyllable);
    assert.strictEqual(notations[3].lyrics[0].lyricType, Exsurge.LyricType.BeginningSyllable);
    assert.deepStrictEqual(notations[8].euouae, { end: true });
    assert.strictEqual(notations[8].lyrics[0].lyricType, Exsurge.LyricType.EndingSyllable);
    assert.strictEqual(notations.length, 10);
  });

  it("marks an area of one notation as both starting and ending there", function() {
    const notations = parseNotations("(c4) <nlba>Ky</nlba>(f) e(g)");
    assert.deepStrictEqual(notations[0].noLineBreak, { start: true, end: true });
  });

  it("records <clear> and <pr> on the lyric", function() {
    const notations = parseNotations(
      "(c4) <clear>e(g)lé(f)son<pr>.(f) son<pr:0.5>;(g) a<clear/>b< pr : .25 />c(h) f{i}re<pr>s(g) d(h)"
    );
    const lyrics = notations.map((notation) => notation.lyrics[0]);
    assert.deepStrictEqual(lyrics.map((lyric) => lyric.text), ["e", "lé", "son.", "son;", "abc", "fires", "d"]);
    assert.deepStrictEqual(lyrics.map((lyric) => !!lyric.clear), [true, false, false, false, true, false, false]);
    assert.deepStrictEqual(
      lyrics.map((lyric) => lyric.protrusion),
      [
        undefined,
        undefined,
        { factor: undefined, textIndex: 3 },
        { factor: 0.5, textIndex: 3 },
        { factor: 0.25, textIndex: 2 },
        { factor: undefined, textIndex: 4 },
        undefined
      ]
    );
    // the centering braces still center on the i
    assert.strictEqual(lyrics[5].centerStartIndex, 1);
  });

  it("makes no lyric of a syllable with only controls", function() {
    const notations = parseNotations("(c4) a(f) <clear>(g) <pr>(h) <eu>(i) b</eu>(j)");
    assert.deepStrictEqual(lyricTexts(notations), ["a", "b"]);
    assert.deepStrictEqual(notations[3].euouae, { start: true });
    assert.strictEqual(notations.length, 5);
  });
});

describe("Gregorio special characters", function() {
  const text = (ctxt: Exsurge.ChantContext, lyric: string) => new Exsurge.Lyric(ctxt, lyric).text;

  it("shows Gregorio's default specials, and an unknown one as its text", function() {
    const ctxt = new Exsurge.ChantContext();
    assert.strictEqual(text(ctxt, "De<sp>ut</sp>us"), "De‿us");
    assert.strictEqual(text(ctxt, "De<sp>ot</sp>us"), "De⁀us");
    assert.strictEqual(text(ctxt, "ex<sp>-</sp>cel"), "excel");
    assert.strictEqual(text(ctxt, "<sp>+</sp>"), "†");
    assert.strictEqual(text(ctxt, "<sp>\\</sp><sp>&</sp><sp>#</sp><sp>_</sp><sp>%</sp>"), "\\&#_%");
    assert.strictEqual(text(ctxt, "a<sp>unknown</sp>b"), "aunknownb");
    // the specials exsurge draws itself are as they were
    assert.strictEqual(text(ctxt, "<sp>'ae</sp><sp>OE</sp><sp>~</sp>"), "ǽŒ∼");
  });

  it("takes the specials from ctxt.specials", function() {
    const ctxt = new Exsurge.ChantContext();
    ctxt.specials.ut = "_";
    ctxt.specials.new = "N";
    delete ctxt.specials["-"];
    assert.strictEqual(text(ctxt, "De<sp>ut</sp>us <sp>new</sp> ex<sp>-</sp>cel"), "De_us N ex-cel");
  });

  it("styles <tt> in monospace", function() {
    const lyric = new Exsurge.Lyric(new Exsurge.ChantContext(), "a<tt>b</tt>c");
    assert.strictEqual(lyric.text, "abc");
    assert.deepStrictEqual(lyric.spans[1].activeTags, ["tt"]);
    assert.strictEqual(lyric.spans[1].mergedProperties["font-family"], "monospace");
  });
});
