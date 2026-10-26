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
    // a closing tag after a word's notes is the next syllable's, as in Gregorio
    assert.deepStrictEqual(marks[12], [undefined, undefined]);
    assert.deepStrictEqual(marks[13], [undefined, { end: true }]);
    assert.strictEqual(notations.filter((notation) => notation.euouae || notation.noLineBreak).length, 4);
  });

  it("ends an area at a closing tag between a word's notes and the next word at the next syllable", function() {
    const notations = parseNotations("(c4) <nlba>Ky(f)ri(g)e.(h)</nlba> Chri(g)ste(f) e(g)lé(f)i(e)son(f)</eu> (::)");
    assert.deepStrictEqual(lyricTexts(notations), ["Ky", "ri", "e.", "Chri", "ste", "e", "lé", "i", "son"]);
    // (as in Gregorio, where the tag is the text of the syllable after it)
    assert.deepStrictEqual(notations[2].noLineBreak, undefined);
    assert.deepStrictEqual(notations[3].noLineBreak, { end: true });
    // e. is the end of a word, and Chri the start of the next
    assert.strictEqual(notations[2].lyrics[0].lyricType, Exsurge.LyricType.EndingSyllable);
    assert.strictEqual(notations[3].lyrics[0].lyricType, Exsurge.LyricType.BeginningSyllable);
    assert.deepStrictEqual(notations[9].euouae, { end: true });
    assert.strictEqual(notations[8].lyrics[0].lyricType, Exsurge.LyricType.EndingSyllable);
    assert.strictEqual(notations.length, 10);
  });

  it("starts an area at an opening tag after a word's notes at the next syllable", function() {
    const notations = parseNotations("(c4) A(f)B(g)<eu> C(h) D(i)</eu>");
    assert.deepStrictEqual(
      notations.map((notation) => notation.euouae),
      [undefined, undefined, { start: true }, { end: true }]
    );
  });

  it("gives a lyric the source index of its text after the controls", function() {
    const source = "(c4) <eu>E(f) <clear>Ky|<pr>ri(g)</eu>";
    const lyrics = parseNotations(source).flatMap((notation) => notation.lyrics);
    assert.deepStrictEqual(
      lyrics.map((lyric) => [lyric.text, lyric.sourceIndex]),
      [["E", source.indexOf("E(")], ["Ky", source.indexOf("Ky")], ["ri", source.indexOf("ri")]]
    );
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

  it("counts a run of spaces as one in a protrusion's index, as the lyric's text does", function() {
    const lyric = parseNotations("(c4) a  b<pr>c(f)")[0].lyrics[0];
    assert.strictEqual(lyric.text, "a bc");
    assert.strictEqual(lyric.protrusion!.textIndex, 3);
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

  it("puts [[, <nlba> and @[ after a syllable's last notes on the next note, and <nlba> on a bar after it", function() {
    const notations = parseNotations("(c4) a(fg<nlba>) b(h) c(f[[) d(g]]) e(f@[) f(gh]) g(fg<nlba>,h</nlba>)");
    const notes = notesOf(notations);
    assert.deepStrictEqual(notes[2].noLineBreak, { start: true });
    assert.deepStrictEqual(notations[1].noLineBreak, { start: true });
    assert.deepStrictEqual([!!notes[4].bracketStart, !!notes[4].bracketEnd], [true, true]);
    assert.deepStrictEqual(notes[6].autoFusion, { start: true });
    // the area starts at the bar after <nlba>
    assert.ok(notations[7].isDivider);
    assert.deepStrictEqual(notations[7].noLineBreak, { start: true });
    assert.deepStrictEqual(notations[8].noLineBreak, { end: true });
  });

  it("records @, @[ and ]", function() {
    const notations = parseNotations("(c4) a(h@iw@j) b(@[fhg]) c(@hg) d(c1@c4)");
    const notes = notesOf(notations);
    assert.deepStrictEqual(notes.map((note) => note.sourceGabc), ["h", "@iw", "@j", "f", "h", "g", "@h", "g"]);
    assert.deepStrictEqual(notes.map((note) => !!note.fused), [false, true, true, false, false, false, true, false]);
    assert.deepStrictEqual(notes[3].autoFusion, { start: true });
    assert.deepStrictEqual(notes[5].autoFusion, { end: true });
    // the @ between two clefs isn't a fusion: c1@c4 is one clef, with a second clef
    assert.deepStrictEqual(sources(notations).slice(-2), ["@hg", "c1@c4"]);
    assert.ok((notations[notations.length - 1] as Exsurge.Clef).secondClef instanceof Exsurge.DoClef);
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
    // (item 1.6 draws them as musica ficta)
    assert.ok(notes[notes.length - 1].accent instanceof Exsurge.MusicaFicta);
    assert.deepStrictEqual(notes.slice(-2).map((note) => note.accent!.glyphCode), ["Flat", "Sharp"]);
  });
});

describe("Gregorio comments", function() {
  it("leaves out a % comment to the end of the line", function() {
    const notations = parseNotations("(c4) Ky(f)ri(g)e(h) % a comment (x)\n e(g)lé(f) (::)\n% a whole line\nChri(g)ste(h)");
    assert.deepStrictEqual(lyricTexts(notations), ["Ky", "ri", "e", "e", "lé", "Chri", "ste"]);
    assert.strictEqual(notations.length, 8);
  });

  it("takes away the line break at the end of a comment", function() {
    const notations = parseNotations("(c4) Ky(f)ri(g)%comment\ne(h) a(f)");
    assert.deepStrictEqual(lyricTexts(notations), ["Ky", "ri", "e", "a"]);
    // Ky(f)ri(g)e(h) is still one word
    assert.deepStrictEqual(
      notations.slice(0, 3).map((notation) => notation.lyrics[0].lyricType),
      [Exsurge.LyricType.BeginningSyllable, Exsurge.LyricType.MiddleSyllable, Exsurge.LyricType.EndingSyllable]
    );
  });

  it("starts a comment only at the start of a line, or after a space or notes", function() {
    const notations = parseNotations("(c4) a(f%g) b(h) %TODO: 100% sure?\nc(g) 50%(f) d(g)");
    assert.deepStrictEqual(lyricTexts(notations), ["a", "b", "c", "50", "d"]);
    // a % in the notes isn't a comment, as in Gregorio
    assert.strictEqual(notations[0].notes!.length, 2);
    // nor is one after a letter
    assert.strictEqual(notations[3].notes![0].sourceGabc, "f");
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

  it("splits words and syllables at the unescaped characters, but keeps their source", function() {
    assert.deepStrictEqual(Exsurge.Gabc.splitWords("a$) b(f) c(g) %x)\n d(h)"), ["a$) b(f)", "c(g)", "%x)\n d(h)"]);
    assert.deepStrictEqual(Exsurge.Gabc.parseWord("a$(b$)(f)c$$(g)"), Object.assign(
      [{ notations: "f", lyrics: ["a$(b$)"] }, { notations: "g", lyrics: ["c$$"] }],
      { wordLength: 15 }
    ));
  });

  it("draws a $ before any other character as that character", function() {
    const notations = parseNotations("(c4) a$\uE041b(f) c$éd(g)");
    assert.deepStrictEqual(lyricTexts(notations), ["a\uE041b", "céd"]);
    assert.strictEqual(notations[0].lyrics[0].sourceGabc, "a$\uE041b");
  });
});

describe("Gregorio NABC", function() {
  const nabcOf = (notations: Exsurge.ChantNotationElement[]) =>
    notations.map((notation) => notation.nabc && notation.nabc.join("/"));

  it("keeps the gabc's own / before the NABC in the note's source", function() {
    const notations = parseNotations("nabc-lines: 1;\n%%\n(c4) A(f/|vi|g|pu)");
    assert.deepStrictEqual(notations.map((notation) => notation.notes!.map((note) => note.sourceGabc).join("")), ["f/", "g"]);
  });

  it("keeps the gabc and puts the NABC on the first notation of the gabc before it", function() {
    const notations = parseNotations(
      "nabc-lines: 1;\n%%\n(c3) FAc(e|talsi8)tus(ei|pe) ad(fg/hggf|peclhgpi|hg|cl)ve(g$|h) a(fg|pe||vi) b(|vi)"
    );
    assert.deepStrictEqual(
      notations.map((notation) => (notation.notes ? notation.notes.map((note) => note.sourceGabc).join("") : notation.constructor.name)),
      ["e", "ei", "fg/", "hg", "gf", "hg", "gh", "fg", "TextOnly"]
    );
    // (the NABC after an empty part of gabc, Gregorio's empty element, follows after a space)
    assert.deepStrictEqual(nabcOf(notations), ["talsi8", "pe", "peclhgpi", undefined, undefined, "cl", undefined, "pe/vi", "vi"]);
    // the gabc after the NABC is a new neume, as after a /
    assert.strictEqual(notations[4].allowLineBreakBeforeNext, true);
    assert.deepStrictEqual(lyricTexts(notations), ["FAc", "tus", "ad", "ve", "a", "b"]);
  });

  it("takes the lines of NABC in turn", function() {
    const notations = parseNotations("nabc-lines: 2;\n%%\n(c3) a(g||ta) b(g|vi|pe|h|cl) d(ixi|vi)");
    assert.deepStrictEqual(notations.map((notation) => notation.nabc), [["", "ta"], ["vi", "pe"], ["cl"], ["vi"], undefined]);
    assert.strictEqual(notations[3].isAccidental, true);
  });

  it("keeps | as the stem of an inclinatum without the nabc-lines header", function() {
    const notations = parseNotations("(c4) a(G|FE) b(g|vi)");
    assert.strictEqual(notations[0].notes![0].inclinataFlags, 1);
    assert.strictEqual(notations.filter((notation) => notation.nabc).length, 0);
    // (g|v is a virga with a stem, as it was)
    assert.strictEqual(notesOfAll(notations).length, 5);
  });

  it("parses every word anew when nabc-lines changes", function() {
    const ctxt = new Exsurge.ChantContext();
    const mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, "(c3) a(g|vi) b(h)");
    Exsurge.Gabc.updateMappingsFromSource(ctxt, mappings, "nabc-lines: 1;\n%%\n(c3) a(g|vi) b(h)");
    assert.strictEqual(ctxt.nabcLines, 1);
    assert.deepStrictEqual(mappings[1].notations[0].nabc, ["vi"]);
  });
});

function notesOfAll(notations: Exsurge.ChantNotationElement[]) {
  return notations.flatMap((notation) => notation.notes || []);
}

describe("Gregorio flat F clefs", function() {
  it("reads fb1 to fb5 as F clefs with a flat on the B", function() {
    const ctxt = new Exsurge.ChantContext();
    const notations = Exsurge.Gabc.createMappingsFromSource(ctxt, "(fb1) (fb2) (fb3) (fb4) (fb5) a(h)").flatMap(
      (mapping) => mapping.notations
    );
    const clefs = notations.filter((notation) => notation.isClef) as Exsurge.Clef[];
    assert.ok(clefs.every((clef) => clef instanceof Exsurge.FaClef));
    assert.deepStrictEqual(
      clefs.map((clef) => [clef.staffPosition, clef.defaultAccidental!.staffPosition]),
      [[1, 4], [3, 6], [5, 1], [7, 3], [9, 5]]
    );
    // h is the B below the F on line 5, flattened
    assert.strictEqual(notations[notations.length - 1].notes![0].pitch!.step, Exsurge.Step.Te);
  });
});

describe("Gregorio inclinatum digits", function() {
  it("reads 0, 1 and 2 after an inclinatum as its leaning, not as a nudge", function() {
    const notes = parseNotations("(c4) a(hG0F0) b(fG1H1) c(gG2) d(G) e(-G0)").flatMap(
      (notation) => notation.notes || []
    );
    assert.deepStrictEqual(
      notes.map((note) => [note.sourceGabc, note.leaning, note.staffPositionOffset]),
      [
        ["h", undefined, 0],
        ["G0", "descending", 0],
        ["F0", "descending", 0],
        ["f", undefined, 0],
        ["G1", "ascending", 0],
        ["H1", "ascending", 0],
        ["g", undefined, 0],
        ["G2", "unison", 0],
        ["G", undefined, 0],
        ["-G0", "descending", 0]
      ]
    );
  });

  it("doesn't nudge an inclinatum with a 0 under a Chi-Rho clef, where 0 and 9 nudge other notes", function() {
    const notes = parseNotations("(xp3) a(H0) b(h0) c(H9)").flatMap((notation) => notation.notes || []);
    assert.deepStrictEqual(
      notes.map((note) => [note.sourceGabc, note.leaning, note.staffPositionOffset]),
      [
        ["H0", "descending", 0],
        // a lowercase pitch is still nudged, and so is an inclinatum with a 9
        ["h0", undefined, -2 / 3],
        ["H9", undefined, 2 / 3]
      ]
    );
    // as is a custos
    const custos = parseNotations("(xp3) a(h0+)").find((notation) => notation instanceof Exsurge.Custos) as Exsurge.Custos;
    assert.strictEqual(custos.staffPositionOffset, -2 / 3);
  });
});

describe("Gregorio bars, line breaks and spacing codes", function() {
  const space = (notation: Exsurge.ChantNotationElement) => {
    const ctxt = new Exsurge.ChantContext();
    const trailingSpace = notation.trailingSpace;
    return (typeof trailingSpace === "function" ? trailingSpace(ctxt) : trailingSpace) / ctxt.intraNeumeSpacing;
  };

  it("reads the bars, high and dotted, and their vertical episemata", function() {
    const dividers = parseNotations("(c4) a(f) (^) (^0) (`0) (,0) (:?) (:'_) (::') (;3')").filter(
      (notation) => notation.isDivider
    ) as Exsurge.Divider[];
    assert.deepStrictEqual(
      dividers.map((divider) => [
        divider.constructor.name,
        divider.high,
        (divider as Exsurge.FullBar).dotted,
        divider.hasCarryover,
        divider.hasVerticalEpisema
      ]),
      [
        ["DivisioMinimis", false, undefined, false, false],
        ["DivisioMinimis", true, undefined, false, false],
        ["Virgula", true, undefined, false, false],
        ["QuarterBar", true, undefined, false, false],
        ["FullBar", false, true, false, false],
        ["FullBar", false, false, true, true],
        ["DoubleBar", false, undefined, false, true],
        ["DominicanBar", false, undefined, false, true]
      ]
    );
    assert.strictEqual((dividers[2] as Exsurge.Virgula).staffPosition, 9);
  });

  it("reads z+, z-, Z+ and Z- as line breaks that force or leave out the custos", function() {
    const breaks = parseNotations("(c4) a(f) (z) (z+) (z-) (Z) (Z+) (Z-)").filter(
      (notation) => notation instanceof Exsurge.ChantLineBreak
    ) as Exsurge.ChantLineBreak[];
    assert.deepStrictEqual(
      breaks.map((lineBreak) => [lineBreak.justify, lineBreak.custos]),
      [[true, "auto"], [true, "force"], [true, "none"], [false, "auto"], [false, "force"], [false, "none"]]
    );
  });

  it("puts [nocustos] on the note before it, or with no note before it, on the next note", function() {
    const notes = parseNotations("(c4) a(fg[nocustos]) b(h [nocustos]) c([nocustos]) d(g) e([nocustos]f)").flatMap(
      (notation) => notation.notes || []
    );
    assert.deepStrictEqual(
      notes.map((note) => [note.sourceGabc, !!note.noCustos, !!note.noCustosBefore]),
      [
        ["f", false, false],
        ["g[nocustos]", true, false],
        ["h ", true, false],
        ["g", false, true],
        ["f", false, true]
      ]
    );
  });

  it("reads /0, /!, /[n] and ! before a space, and which of them the line can break at", function() {
    const notations = parseNotations("(c4) a(f/0g) b(f/!g) c(f/[2]g) d(f/[-1]g) e(f! g) f(f g) g(f///g)");
    const firsts = notations.filter((_, index) => index % 2 === 0);
    assert.deepStrictEqual(
      firsts.map((notation) => [space(notation), !!notation.keepWithNext, !!notation.allowLineBreakBeforeNext]),
      [
        [0.5, true, false],
        [1, true, false],
        [2, true, true],
        [-1, true, false],
        [2, true, false],
        [2, true, true],
        [3, true, true]
      ]
    );
  });

  it("keeps a space the line can't break at at the end of the notes, but not one it can", function() {
    const notations = parseNotations("(c4) a(fg/[-1]) b(h/0) c(f/) d(g)");
    assert.deepStrictEqual(
      notations.slice(0, 3).map((notation) => [!!notation.keepWithNext, !!notation.allowLineBreakBeforeNext]),
      [[true, false], [true, false], [false, false]]
    );
  });
});

describe("Gregorio brace lengths", function() {
  it("draws a brace given a length in any TeX unit, and reads the length in staff intervals", function() {
    const braces = parseNotations(
      "(c4) a(f[ob:1;6mm]g) b(f[ub:1;0.3in]g) c(f[ocb:1;10pt]g) d(f[ob:0;1,5cm]g) e(f[ob:0;-2em]g) " +
        "f(f[ob:0;267750sp]g) g(f[ob:0;\\gre@dimen]g) h(f[ob:0;]g)"
    ).flatMap((notation) => (notation.notes || []).map((note) => note.braceStart));
    // (a staff interval at Gregorio's default staff size is 267750sp)
    const expected = [4.178554198372262, 5.306763831932773, 2.44765639589169, 10.446385495930656, -4.89531279178338, 1];
    expected.forEach((length, i) => {
      const brace = braces[i * 2]!;
      assert.ok(brace.automatic);
      assert.ok(Math.abs(brace.length! - length) < 1e-9, `${brace.length} should be ${length}`);
    });
    // a length that isn't one exsurge can read still draws the brace, and an empty one doesn't
    assert.ok(braces[12]!.automatic);
    assert.strictEqual(braces[12]!.length, undefined);
    assert.strictEqual(braces[14], undefined);
  });

  it("reads a unit in either case, with true, and with stretch and shrink, as TeX does", function() {
    const braces = parseNotations(
      "(c4) a(f[ob:1;6MM]g) b(f[ob:1;6truemm]g) c(f[ob:1;6 true mm]g) d(f[ob:1;6mm plus 1fil minus 2pt]g)"
    ).flatMap((notation) => (notation.notes || []).map((note) => note.braceStart));
    [0, 2, 4, 6].forEach((i) => {
      assert.ok(Math.abs(braces[i]!.length! - 4.178554198372262) < 1e-9, `${braces[i]!.length} should be 4.178554198372262`);
    });
  });

  it("ends a brace given a length at the next note, the first of repeated notes, past an accidental", function() {
    const ends = (gabc: string) =>
      parseNotations(gabc)
        .flatMap((notation) => notation.notes || [])
        .map((note) => (note.braceEnd ? `${note.sourceGabc}${note.braceEnd.automatic ? "" : " (its own)"}` : null))
        .filter((end) => end);
    assert.deepStrictEqual(ends("(c4) a(f[ob:1;6mm]gss) b(hvv)"), ["gss"]);
    assert.deepStrictEqual(ends("(c4) a(f[ob:1;6mm]) b(ixi) c(hvv)"), ["i"]);
    // (a note with a brace of its own doesn't end it)
    assert.deepStrictEqual(ends("(c4) a(f[ob:1;6mm]g[ob:0{]h[ob:0}])"), ["h[ob:0}] (its own)"]);
  });
});

describe("Gregorio inclinatum leaning", function() {
  const leanings = (gabc: string) =>
    parseNotations(gabc)
      .flatMap((notation) => notation.notes || [])
      .filter((note) => note.shape === Exsurge.NoteShape.Inclinatum)
      .map((note) => [note.sourceGabc, note.automaticLeaning]);

  it("leans a run of inclinata the way the line goes, counting the steps into and out of it", function() {
    assert.deepStrictEqual(leanings("(c4) a(hGFE) b(GHI) c(fG) d(hG) e(iGHG) f(GFh)"), [
      ["G", "descending"],
      ["F", "descending"],
      ["E", "descending"],
      ["G", "ascending"],
      ["H", "ascending"],
      ["I", "ascending"],
      ["G", "ascending"],
      ["G", "descending"],
      ["G", "descending"],
      ["H", "descending"],
      ["G", "descending"],
      // a step down and a step up, which leave it leaning down
      ["G", "descending"],
      ["F", "descending"]
    ]);
  });

  it("keeps inclinata at one pitch upright, and one alone without a step into it", function() {
    assert.deepStrictEqual(leanings("(c4) a(GG) b(gG) c(G)"), [
      ["G", "unison"],
      ["G", "unison"],
      ["G", "unison"],
      ["G", "unison"]
    ]);
  });

  it("gives a run the leaning of an inclinatum in it that has one, or descending for a liquescent", function() {
    assert.deepStrictEqual(leanings("(c4) a(fG1HI) b(fGH0) c(fGH~) d(fGH<)"), [
      ["G1", undefined],
      ["H", "ascending"],
      ["I", "ascending"],
      ["G", "descending"],
      ["H0", undefined],
      ["G", "descending"],
      ["H~", undefined],
      ["G", "descending"],
      ["H<", undefined]
    ]);
  });

  it("starts again at each syllable and after other notes", function() {
    assert.deepStrictEqual(leanings("(c4) a(hG) b(G) c(GFgG) d(G~hGG) e(G~gG)"), [
      ["G", "descending"],
      ["G", "unison"],
      ["G", "descending"],
      ["F", "descending"],
      ["G", "unison"],
      ["G~", undefined],
      ["G", "unison"],
      ["G", "unison"],
      ["G~", undefined],
      ["G", "unison"]
    ]);
  });
});

describe("Gregorio slurs and custom ledger lines", function() {
  const notesOf = (gabc: string) => parseNotations(gabc).flatMap((notation) => notation.notes || []);
  // a TeX length in staff intervals, at Gregorio's default staff size
  const mm = (length: number) => (length * 72.27) / 25.4 / ((31500 / 2) * 17 / 65536);
  const rounded = (value: any) => JSON.parse(JSON.stringify(value), (key, v) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v));

  it("reads slurs of a given size, and slurs from note to note", function() {
    const notes = notesOf("(c4) a(g[oslur:0;5mm,-0.5mm]) b(f[uslur:2{]g[uslur:1}]) c(f[oslur:0;\\slurwidth,1mm]) d(f[oslur:3;1mm,1mm])");
    assert.deepStrictEqual(
      rounded(notes.map((note) => note.slurs)),
      rounded([
        [{ isAbove: true, shift: 0, kind: "fixed", width: mm(5), height: mm(-0.5) }],
        [{ isAbove: false, shift: 2, kind: "start" }],
        [{ isAbove: false, shift: 1, kind: "end" }],
        // (a length that's a TeX macro isn't understood, and there's no shift 3)
        undefined,
        undefined
      ])
    );
  });

  it("reads ledger lines drawn or left out at notes, and custom ledger lines", function() {
    const notes = notesOf("(c4) a(g[oll:1]m[oll:0]d[ull:1]b[ull:0]) b(g[oll:1;2mm]h[ull:2mm{1]) c([ull:0{0]f) d(g[ull:}])");
    assert.deepStrictEqual(
      notes.map((note) => [note.ledgerLineAbove, note.ledgerLineBelow]),
      [[true, undefined], [false, undefined], [undefined, true], [undefined, false], [undefined, undefined], [undefined, undefined], [undefined, undefined], [undefined, undefined]]
    );
    assert.deepStrictEqual(
      rounded(notes.map((note) => note.customLedgerLines)),
      rounded([
        undefined,
        undefined,
        undefined,
        undefined,
        [{ isAbove: true, kind: "fixed", left: "overhang", right: mm(2) }],
        [{ isAbove: false, kind: "start", left: mm(2), right: "overhang" }],
        // one that isn't after a note is introduced just before the next note
        [{ isAbove: false, kind: "start", left: 0, right: 0, before: true }],
        [{ isAbove: false, kind: "end" }]
      ])
    );
  });

  it("doesn't take the ] of an instruction that isn't after a note as the end of a fusion", function() {
    const notes = notesOf("(c4) a(f) b([cs:x]g) c(f[[) d([oll:1;1mm]g]])");
    assert.deepStrictEqual(
      notes.map((note) => [note.autoFusion, !!note.bracketStart, !!note.bracketEnd]),
      [[undefined, false, false], [undefined, false, false], [undefined, false, false], [undefined, true, true]]
    );
    assert.strictEqual(notes[3].customLedgerLines![0].before, true);
  });
});

describe("Gregorio episema tuning", function() {
  const mm = (length: number) => (length * 72.27) / 25.4 / ((31500 / 2) * 17 / 65536);
  const notesOfMappings = (mappings: Exsurge.ChantMapping[]) =>
    mappings.flatMap((mapping) => mapping.notations).flatMap((notation) => notation.notes || []);

  it("reads a note's own tuning, and a block's for the notes between its start and end", function() {
    const ctxt = new Exsurge.ChantContext();
    const notes = notesOfMappings(
      Exsurge.Gabc.createMappingsFromSource(
        ctxt,
        "(c4) a(g_[oh:m]) b(g_0[uh:ol+1mm]) c(g_[oh:{]h_) d(i_[oh:h]j_[oh}]) e(f_) f([uh{]g_0) g(h_0[uh:}]) h(g_[oh:] g_[oh:m}])"
      )
    );
    const block = notes[3].episemaTuning!.above;
    assert.deepStrictEqual(
      notes.map((note) => note.episemaTuning),
      [
        { above: { position: "m" } },
        { below: { position: "ol", nudge: mm(1) } },
        // (the block starts after the note it follows)
        undefined,
        { above: { block: true }, below: undefined },
        // (as in Gregorio, a note in a block has the block's tuning, not its own)
        { above: block, below: undefined },
        { above: block, below: undefined },
        undefined,
        { above: undefined, below: { block: true } },
        { above: undefined, below: notes[7].episemaTuning!.below },
        // ([oh:] and [oh:m}] aren't Gregorio's)
        undefined,
        undefined
      ]
    );
    assert.strictEqual(notes[5].episemaTuning!.above, block);
  });

  it("puts the notes of words that are kept, as the gabc is changed, in the blocks that they're now in", function() {
    const ctxt = new Exsurge.ChantContext();
    const mappings = Exsurge.Gabc.createMappingsFromSource(ctxt, "(c4) a(f_[oh:{]g_) b(h_) c(g_[oh}]) d(f_)");
    const inBlock = () => notesOfMappings(mappings).map((note) => !!(note.episemaTuning && note.episemaTuning.above));
    assert.deepStrictEqual(inBlock(), [false, true, true, true, false]);
    Exsurge.Gabc.updateMappingsFromSource(ctxt, mappings, "(c4) a(f_[oh:{]g_) b(h_) c(g_) d(f_)");
    assert.deepStrictEqual(inBlock(), [false, true, true, true, true]);
    Exsurge.Gabc.updateMappingsFromSource(ctxt, mappings, "(c4) a(f_g_) b(h_) c(g_) d(f_)");
    assert.deepStrictEqual(inBlock(), [false, false, false, false, false]);
  });
});

describe("Gregorio brackets", function() {
  // the staff positions that the brackets of the score's neumes reach, after
  // a layout
  const bracketTops = (score: Exsurge.ChantScore) =>
    score.notations.flatMap((notation) =>
      notation.visualizers
        .filter((visualizer) => visualizer instanceof Exsurge.NoteBracket)
        .map((bracket) => [bracket.bounds.y, bracket.bounds.bottom()])
    );
  const laidOut = (ctxt: Exsurge.ChantContext, gabc: string) => {
    const score = new Exsurge.ChantScore(ctxt, Exsurge.Gabc.createMappingsFromSource(ctxt, gabc), false);
    score.performLayout(ctxt);
    return score;
  };

  it("draws the brackets again when the notes in them change in other notations", function() {
    for (const [before, after] of [
      ["(c4) ad([[ef) te(g]]) (::)", "(c4) ad([[cf) te(g]]) (::)"],
      ["(c4) ad([[ef) te(g]]) (::)", "(c4) ad([[ef) te(k]]) (::)"],
      ["(c4) a(f) ad([[ef) te(g]]) (::)", "(c4) a(f) ad([[ef) te([[g]]) (::)"]
    ]) {
      const ctxt = new Exsurge.ChantContext();
      const score = laidOut(ctxt, before);
      Exsurge.Gabc.updateMappingsFromSource(ctxt, score.mappings, after);
      score.updateNotations(ctxt);
      score.performLayout(ctxt);
      assert.deepStrictEqual(bracketTops(score), bracketTops(laidOut(new Exsurge.ChantContext(), after)), after);
    }
  });

  it("keeps brackets open after a ]] with no notes since the [[, as Gregorio does", function() {
    const score = laidOut(new Exsurge.ChantContext(), "(c4) k(f[[]]g) l(h]]) (::)");
    assert.strictEqual(bracketTops(score).length, 2);
  });

  it("puts a right bracket after the mora", function() {
    const score = laidOut(new Exsurge.ChantContext(), "(c4) a([[g.]]) (::)");
    const neume = score.notations[0];
    const mora = neume.visualizers.find((visualizer) => visualizer instanceof Exsurge.Mora)!;
    const brackets = neume.visualizers.filter((visualizer) => visualizer instanceof Exsurge.NoteBracket);
    assert.ok(brackets[1].bounds.x >= mora.bounds.right());
  });

  it("draws ledger lines above and below a note that asks for both", function() {
    const score = laidOut(new Exsurge.ChantContext(), "(c4) a(g[oll:1][ull:1]) (::)");
    assert.deepStrictEqual(
      (score.notations[0] as Exsurge.Neume).ledgerLines.map((line) => line.staffPosition),
      [9, -1]
    );
  });
});

describe("Gregorio ledger lines", function() {
  const laidOut = (ctxt: Exsurge.ChantContext, gabc: string) => {
    const score = new Exsurge.ChantScore(ctxt, Exsurge.Gabc.createMappingsFromSource(ctxt, gabc), false);
    score.performLayout(ctxt);
    return score;
  };
  const notesOf = (score: Exsurge.ChantScore) =>
    score.notations.flatMap((notation): (Exsurge.Note | Exsurge.Accidental)[] =>
      notation.isAccidental ? [notation as Exsurge.Accidental] : notation.notes || []
    );
  // each note's state above and below the staff, as "T" or "F" (whether it
  // has a line) and how it was set, with an x after an accidental's pitch
  const states = (gabc: string) =>
    notesOf(laidOut(new Exsurge.ChantContext(), gabc)).map((item) => {
      const state = item.ledgerLineState!;
      const side = (s: Exsurge.LedgerLineState) => (s.line ? "T" : "F") + s.specificity;
      return side(state.above) + "/" + side(state.below);
    });
  // the notes (and accidentals) with a ledger line drawn, by their gabc
  const drawn = (gabc: string) =>
    notesOf(laidOut(new Exsurge.ChantContext(), gabc)).map(
      (item) =>
        (item instanceof Exsurge.Accidental ? "x" : item.sourceGabc[0]) +
        (Exsurge.hasDrawnLedgerLine(item, true) ? "^" : "") +
        (Exsurge.hasDrawnLedgerLine(item, false) ? "_" : "")
    );

  it("keeps the strongest setting on each side of each note, and the first of two as strong", function() {
    const { Supposed, Explicit, Drawn, ExplicitlyDrawn } = Exsurge.LedgerLineSpecificity;
    assert.deepStrictEqual(
      states("(c4) a(l[hl:0]) b(l[oll:0]) c(k[oll:1][oll:0]) d(k[hl:1][hl:0]) e(c[ll:1][ull:0]) f(g)"),
      [
        `T${Drawn}/F${Supposed}`,
        `F${ExplicitlyDrawn}/F${Supposed}`,
        `T${ExplicitlyDrawn}/F${Supposed}`,
        `T${Explicit}/F${Supposed}`,
        `F${Supposed}/F${ExplicitlyDrawn}`,
        `F${Supposed}/F${Supposed}`
      ]
    );
  });

  it("gives the notes in a custom ledger line from note to note the explicit state", function() {
    const { Supposed, Explicit, Drawn } = Exsurge.LedgerLineSpecificity;
    assert.deepStrictEqual(states("(c4) a(c[ull:1{1]d) b([ull:0{0]e b) c(f[ull:}]g)").slice(0, 6), [
      `F${Supposed}/F${Supposed}`,
      `F${Supposed}/T${Explicit}`,
      `F${Supposed}/T${Explicit}`,
      `F${Supposed}/T${Drawn}`,
      `F${Supposed}/T${Explicit}`,
      `F${Supposed}/F${Supposed}`
    ]);
  });

  it("runs ledger lines through the notes as Gregorio does", function() {
    assert.deepStrictEqual(drawn("(c4) a(klk) b(j/!m) c(m/!j/!k) d(c/!b/!c/!d/!c) e(b/c)"), [
      "k", "l^", "k", "j^", "m^", "m^", "j^", "k^", "c_", "b_", "c_", "d_", "c", "b_", "c"
    ]);
  });

  it("keeps a ledger line in Gregorio's element", function() {
    // (!, /! and /0 join neumes in one, and an accidental joins the note after
    // it; a space ends one, and so does an inclinatum after other notes, a
    // quilisma pes and the last note of a scandicus flexus)
    assert.deepStrictEqual(drawn("(c4) a(b!c) b(b/0c) c(b/c) d(bxc) e(bx/c) f(cdB) g(bcwd) h(bcdc)"), [
      "b_", "c_", "b_", "c_", "b_", "c", "x_", "c_", "x_", "c", "c", "d", "B_", "b_", "c", "d", "b_", "c_", "d_", "c"
    ]);
  });

  it("keeps fused neumes, and the notes either side of brackets, in one element", function() {
    // (a fused neume and a neume fused to the one before join its element,
    // shown by their @, and so do the notes after [[ or ]]; a { } group ends it)
    assert.deepStrictEqual(drawn("(c4) a(b@cdc) b(b@c@b) c(c[[b]]) d(b/0{c}d)"), [
      "b_", "@_", "d_", "c", "b_", "@_", "@_", "c_", "b_", "b_", "c", "d"
    ]);
    const neumes = laidOut(new Exsurge.ChantContext(), "(c4) a(g@hih)").notations.filter(
      (notation) => notation.isNeume
    );
    assert.deepStrictEqual(neumes.map((neume) => !!neume.continuesElement), [false, true]);
  });

  it("finds the notes' ledger lines again when the notes around them change", function() {
    const ctxt = new Exsurge.ChantContext();
    const score = laidOut(ctxt, "(c4) a(j/!k) (::)");
    Exsurge.Gabc.updateMappingsFromSource(ctxt, score.mappings, "(c4) a(j/!m) (::)");
    score.updateNotations(ctxt);
    score.performLayout(ctxt);
    const neume = score.notations.find((notation) => notation.isNeume) as Exsurge.Neume;
    assert.ok(Exsurge.hasDrawnLedgerLine(neume.notes[0], true));
    assert.strictEqual(neume.ledgerLines.length, 1);
  });

  it("doesn't join ledger lines, and places episemata by Gregorio's guess, by default", function() {
    const ctxt = new Exsurge.ChantContext();
    assert.strictEqual(ctxt.minLedgerSeparation, 0);
    assert.strictEqual(ctxt.ledgerLineHeuristic, true);
  });
});
