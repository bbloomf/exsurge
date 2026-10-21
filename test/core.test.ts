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

describe("Gregorio note tokens", function() {
  const notesOf = (notations: Exsurge.ChantNotationElement[]) =>
    notations.flatMap((notation) => notation.notes || []);
  const sources = (notations: Exsurge.ChantNotationElement[]) =>
    notations.map((notation) => (notation.notes ? notation.notes.map((note) => note.sourceGabc).join("") : notation.sourceGabc));

  it("keeps the notes in [[ ]] and records the bracket on them", function() {
    const notations = parseNotations("(c4) a(f[[gh]]i) b([[g]]) c(fg]])");
    // the brackets end the neumes, as ! does
    assert.deepStrictEqual(sources(notations), ["f", "gh", "i", "g", "fg"]);
    assert.strictEqual(notations[0].keepWithNext, true);
    assert.strictEqual(notations[0].trailingSpace, 0);
    const notes = notesOf(notations);
    assert.deepStrictEqual(
      notes.map((note) => [!!note.bracketStart, !!note.bracketEnd]),
      [[false, false], [true, false], [false, true], [false, false], [true, true], [false, false], [false, true]]
    );
  });

  it("keeps the notes in <nlba> </nlba> and marks the area on the notes and their notations", function() {
    const notations = parseNotations("(c4) a(fg<nlba>hg</nlba>ih) b(<nlba>fg) c(hg</nlba>)");
    // the tags end the neumes, as / does
    assert.deepStrictEqual(sources(notations), ["fg", "hg", "ih", "fg", "hg"]);
    assert.strictEqual(notations[0].allowLineBreakBeforeNext, true);
    assert.deepStrictEqual(
      notesOf(notations).map((note) => note.noLineBreak),
      [undefined, undefined, { start: true }, { end: true }, undefined, undefined, { start: true }, undefined, undefined, { end: true }]
    );
    assert.deepStrictEqual(
      notations.map((notation) => notation.noLineBreak),
      [undefined, { start: true, end: true }, undefined, { start: true }, { end: true }]
    );
  });

  it("records @, @[ and ]", function() {
    const notations = parseNotations("(c4) a(h@iw@j) b(@[fhg]) c(@hg) d(c1@c4)");
    const notes = notesOf(notations);
    assert.deepStrictEqual(notes.map((note) => note.sourceGabc), ["h", "@iw", "@j", "f", "h", "g", "@h", "g"]);
    assert.deepStrictEqual(notes.map((note) => !!note.fused), [false, true, true, false, false, false, true, false]);
    assert.deepStrictEqual(notes[3].autoFusion, { start: true });
    assert.deepStrictEqual(notes[5].autoFusion, { end: true });
    // the @ between two clefs isn't a fusion
    assert.deepStrictEqual(sources(notations).slice(-2), ["c1", "c4"]);
  });

  it("records =, q, W and parenthesized accidentals, and r6 to r8 aren't cavum", function() {
    const notations = parseNotations("(c4) a(g=) b(fqg) c(gWh) d(fx?g) e(fyg) f(gr6) g(gr8)");
    const notes = notesOf(notations);
    assert.strictEqual(notes[0].linea, true);
    assert.strictEqual(notes[1].quadratum, true);
    assert.strictEqual(notes[3].quilismaQuadratum, true);
    const accidentals = notations.filter((notation) => notation.isAccidental) as Exsurge.Accidental[];
    assert.deepStrictEqual(accidentals.map((accidental) => !!accidental.parenthesized), [true, false]);
    for (const note of notes.slice(-2)) {
      assert.strictEqual(note.shapeModifiers & Exsurge.NoteShapeModifiers.Cavum, 0, note.sourceGabc);
    }
  });
});

describe("Gregorio comments", function() {
  it("leaves out a % comment to the end of the line", function() {
    const notations = parseNotations("(c4) Ky(f)ri(g)e(h) % a comment (x)\n e(g)lé(f) (::)\n% a whole line\nChri(g)ste(h)");
    assert.deepStrictEqual(lyricTexts(notations), ["Ky", "ri", "e", "e", "lé", "Chri", "ste"]);
    assert.strictEqual(notations.length, 8);
  });

  it("takes away the line break at the end of a comment", function() {
    const notations = parseNotations("(c4) Ky(f)ri(g)%comment\ne(h) Ky%c\nri(g)e(h) a(f%c (x)\ng)");
    assert.deepStrictEqual(lyricTexts(notations), ["Ky", "ri", "e", "Kyri", "e", "a"]);
    // Ky(f)ri(g)e(h) is still one word
    assert.deepStrictEqual(
      notations.slice(0, 3).map((notation) => notation.lyrics[0].lyricType),
      [Exsurge.LyricType.BeginningSyllable, Exsurge.LyricType.MiddleSyllable, Exsurge.LyricType.EndingSyllable]
    );
    // and (f%c⏎g) is one neume
    assert.strictEqual(notations[5].notes!.length, 2);
  });

  it("keeps the source indices of what comes after a comment", function() {
    const source = "(c4) a(f) % comment\n b(g)";
    const notations = parseNotations(source);
    assert.strictEqual(notations[1].notes![0].sourceIndex, source.indexOf("g)"));
    assert.strictEqual(notations[1].lyrics[0].sourceIndex, source.indexOf("b(g)"));
  });

  it("keeps a % closed on its line, a % in <sp> or <v> and an escaped %", function() {
    const notations = parseNotations("(c4) %small%(g) a%b%c(h) <sp>%</sp>(f) <v>%y</v>(f) %%% sep\n d(g) % 50% off\n e(h)");
    assert.deepStrictEqual(lyricTexts(notations), ["small", "abc", "%", "%y", "d", "e"]);
    assert.deepStrictEqual(notations[0].lyrics[0].spans[0].activeTags, ["sc"]);
  });
});

describe("Gregorio $ escapes", function() {
  it("takes away the special meaning of the character after a $", function() {
    const notations = parseNotations(
      "(c4) a$(b$)(f) c$$d(g) e$<b>f(h) g$~h(g) i$[j$](f) k$|l(g) m$-(f) n(g) $*(h) o$%p(g) <eu>$<eu>(f)"
    );
    assert.deepStrictEqual(lyricTexts(notations), ["a(b)", "c$d", "e<b>f", "g~h", "i[j]", "k|l", "m-", "n", "*", "o%p", "<eu>"]);
    // m$- is a word of its own rather than a syllable with a hyphen
    assert.strictEqual(notations[6].lyrics[0].lyricType, Exsurge.LyricType.SingleSyllable);
    assert.strictEqual(notations.length, 11);
  });

  it("keeps the escapes in the source and the source indices", function() {
    const source = "(c4) a$(b$)(f[cs:x$]y]) c(g)";
    const notations = parseNotations(source);
    assert.strictEqual(notations[0].lyrics[0].sourceGabc, "a$(b$)");
    assert.strictEqual(notations[0].notes![0].sourceGabc, "f[cs:x$]y]");
    assert.strictEqual(notations[0].notes![0].choralSign!.text, "x]y");
    assert.strictEqual(notations[0].notes![0].sourceIndex, source.indexOf("f[cs"));
    assert.strictEqual(notations[1].lyrics[0].sourceIndex, source.indexOf("c(g)"));
  });

  it("unescapes the lyrics from parseWord()", function() {
    assert.deepStrictEqual(Exsurge.Gabc.parseWord("a$(b$)(f)c$$(g)"), Object.assign(
      [{ notations: "f", lyrics: ["a(b)"] }, { notations: "g", lyrics: ["c$"] }],
      { wordLength: 15 }
    ));
  });
});
