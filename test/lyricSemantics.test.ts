import { describe, it } from "vitest";
import assert from "node:assert";
import * as Chant from "../src/Exsurge.Chant.js";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { Gabc } from "../src/Exsurge.Gabc.js";
import * as Text from "../src/Exsurge.Text.js";
import { fakeFont } from "./helpers/fonts";

function lyricsOf(gabc: string, setupContext?: (ctxt: Drawing.ChantContext) => void) {
  var ctxt = new Drawing.ChantContext();
  // every character is half an em wide
  ctxt.setFont('Palatino', 16, {}, { Regular: fakeFont(0.5) });
  if (setupContext) setupContext(ctxt);
  var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), false);
  score.performLayout(ctxt);
  return score.notations.filter((notation) => notation.hasLyrics()).map((notation) => notation.lyrics[0]);
}

describe('Elisions', function() {
  it('elides a syllable that ends in an elision into the next', function() {
    var lyrics = lyricsOf('(c4) ri<e>a</e>(f) in(g) <e>son</e>(h) tu(g)');
    assert.deepEqual(lyrics.map((lyric) => !!lyric.elidesToNext), [true, false, true, false]);
  });

  it('elides a syllable that ends in italics unless italicMeansElision is false', function() {
    var gabc = '(c4) ri<i>a</i>(f) in(g)';
    assert.deepEqual(lyricsOf(gabc).map((lyric) => !!lyric.elidesToNext), [true, false]);
    var lyrics = lyricsOf(gabc, (ctxt) => (ctxt.italicMeansElision = false));
    assert.deepEqual(lyrics.map((lyric) => !!lyric.elidesToNext), [false, false]);
    // an elision still elides
    lyrics = lyricsOf('(c4) ri<e>a</e>(f) in(g)', (ctxt) => (ctxt.italicMeansElision = false));
    assert.deepEqual(lyrics.map((lyric) => !!lyric.elidesToNext), [true, false]);
  });
});

describe('Lyric ties', function() {
  it('makes a ~ a space by default, and otherwise the tie that ctxt.lyricTie names', function() {
    var gabc = '(c4) De~us(f) <sp>~</sp>(g)';
    assert.deepEqual(lyricsOf(gabc).map((lyric) => lyric.text), ['De us', '∼']);
    // (the specials ut, ot and dt)
    var ties = { space: ' ', undertie: '‿', overtie: '⁀', doubletie: '⁀‿' } as const;
    for (const [tie, text] of Object.entries(ties)) {
      var lyrics = lyricsOf(gabc, (ctxt) => (ctxt.lyricTie = tie as keyof typeof ties));
      assert.deepEqual(lyrics.map((lyric) => lyric.text), ['De' + text + 'us', '∼'], tie);
    }
  });

  it('draws a tie as ctxt.specials draws its special', function() {
    var [lyric] = lyricsOf('(c4) De~us(f)', (ctxt) => {
      ctxt.lyricTie = 'doubletie';
      ctxt.specials.dt = '⁐';
    });
    assert.equal(lyric.text, 'De⁐us');
  });

  it('keeps a ~ a space in verbatim text, above-lines text and translations', function() {
    var [notation] = lyricsOf('(c4) <alt>a~b</alt>c<v>d~e</v>f~g[h~i](f)', (ctxt) => (ctxt.lyricTie = 'undertie'))
      .map((lyric) => lyric.notation);
    assert.equal(notation.lyrics[0].text, 'cd ef‿g');
    assert.equal(notation.alText![0].text, 'a b');
    assert.equal(notation.translationText![0].text, 'h i');
  });

  it('centers a syllable with a tie on its first vowel, rather than after the space', function() {
    var [spaced] = lyricsOf('(c4) De~us(f)');
    var [tied] = lyricsOf('(c4) De~us(f)', (ctxt) => (ctxt.lyricTie = 'undertie'));
    assert(tied.origin.x < spaced.origin.x, `${tied.origin.x} < ${spaced.origin.x}`);
  });
});

describe('First word styles', function() {
  function styled(gabc: string, useDropCap: boolean, setupContext?: (ctxt: Drawing.ChantContext) => void) {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Palatino', 16, {}, { Regular: fakeFont(0.5) });
    if (setupContext) setupContext(ctxt);
    var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), useDropCap);
    score.performLayout(ctxt);
    var spans = score.notations
      .filter((notation) => notation.hasLyrics())
      .map((notation) => notation.lyrics[0].spans.map((span) => span.text + ':' + span.getCss()));
    return { ctxt, score, spans };
  }
  var styles = (ctxt: Drawing.ChantContext) => {
    ctxt.firstWordStyle = { 'font-variant': 'small-caps' };
    ctxt.firstSyllableStyle = { 'font-weight': 'bold' };
    ctxt.firstSyllableInitialStyle = { fill: '#d00' };
  };

  it('changes nothing by default', function() {
    assert.deepEqual(styled('(c4) Glo(f)ri(g)a(h) in(g)', false).spans, [
      ['Glo:'], ['ri:'], ['a:'], ['in:']
    ]);
  });

  it('styles the first word, its first syllable and its first letter', function() {
    assert.deepEqual(styled('(c4) Glo(f)<b>ri</b>(g)a(h) in(g)', false, styles).spans, [
      ['G:font-variant: small-caps;font-weight: bold;fill: #d00;', 'lo:font-variant: small-caps;font-weight: bold;'],
      ['ri:font-variant: small-caps;font-weight: bold;'],
      ['a:font-variant: small-caps;'],
      ['in:']
    ]);
  });

  it('styles the first letter after the drop cap', function() {
    var { score, spans } = styled('(c4) Glo(f)ri(g)a(h) in(g)', true, styles);
    assert.equal(score.dropCap!.spans.map((span) => span.text + ':' + span.getCss()).join(), 'G:');
    assert.deepEqual(spans[0], [
      'l:font-variant: small-caps;font-weight: bold;fill: #d00;',
      'o:font-variant: small-caps;font-weight: bold;'
    ]);
  });

  it('takes the styles away from a lyric with a drop cap as it was parsed', function() {
    var gabc = '(c4) <b>G</b><i></i>lo(f)ri(g)';
    var parsed = styled(gabc, true).spans[0];
    var { ctxt, score } = styled(gabc, true, styles);
    ctxt.firstWordStyle = {};
    ctxt.firstSyllableStyle = {};
    ctxt.firstSyllableInitialStyle = {};
    score.updateNotations(ctxt);
    assert.deepEqual(score.notations[0].lyrics[0].spans.map((span) => span.text + ':' + span.getCss()), parsed);
  });

  it('moves the styles when the first word changes, and takes them away when they are emptied', function() {
    var { ctxt, score } = styled('(c4) Glo(f)ri(g)a(h) in(g)', false, styles);
    var gabc = '(c4) In(f) ex(g)';
    Gabc.updateMappingsFromSource(ctxt, score.mappings, gabc);
    score.updateNotations(ctxt);
    var spans = () => score.notations.filter((notation) => notation.hasLyrics()).map((notation) => notation.lyrics[0].spans.map((span) => span.text + ':' + span.getCss()));
    assert.deepEqual(spans(), [
      ['I:font-variant: small-caps;font-weight: bold;fill: #d00;', 'n:font-variant: small-caps;font-weight: bold;'],
      ['ex:']
    ]);
    ctxt.firstWordStyle = {};
    ctxt.firstSyllableInitialStyle = {};
    score.updateNotations(ctxt);
    assert.deepEqual(spans(), [['In:font-weight: bold;'], ['ex:']]);
    ctxt.firstSyllableStyle = {};
    score.updateNotations(ctxt);
    assert.deepEqual(spans(), [['In:'], ['ex:']]);
  });
});

describe('Vowel rules', function() {
  // the example vowel file in Gregorio's documentation (doc/Gabc.tex)
  var vowelFile = `
    # a comment; with a semicolon
    alias [english] to [en];
    alias [English] to [en];
    alias [eng] to [english];

    language [en];

    vowel aàáAÀÁ;
    vowel eèéëEÈÉË;
    vowel iìíIÌÍ;
    vowel oòóOÒÓ;
    vowel uùúUÙÚ;
    vowel yỳýYỲÝ;
    vowel æǽÆǼ;
    vowel œŒ;

    prefix qu Qu qU QU;
    prefix y Y;

    suffix w W;
    suffix we We wE WE;

    secondary w W;
  `;
  var segment = (lang: Text.Language, s: string, ignore?: Text.IgnoredRange[]) => {
    var result = lang.findVowelSegment(s, 0, ignore);
    return result.found ? s.substr(result.startIndex, result.length) : null;
  };

  it('reads the languages of a Gregorio vowel file by their names and aliases', function() {
    var languages = Text.VowelRulesLanguage.fromVowelFile(vowelFile);
    assert.deepEqual(Object.keys(languages).sort(), ['English', 'en', 'eng', 'english']);
    assert.strictEqual(languages.eng, languages.en);
    var english = languages.en;
    assert.deepEqual(
      ['queen', 'quick', 'yes', 'rhythm', 'cow', 'cowed', 'cower', 'psst', 'pfft', 'cwm', 'Equus'].map((s) => segment(english, s)),
      ['ee', 'i', 'e', 'y', 'ow', 'owe', 'owe', null, null, 'w', 'E']
    );
  });

  it('counts an elision as consonants, and a vowel before one as part of a prefix', function() {
    var english = Text.VowelRulesLanguage.fromVowelFile(vowelFile).en;
    assert.equal(segment(english, 'tea', [{ index: 1, endIndex: 2 }]), 'a');
    // the u of qu, before an elision, is still part of the prefix
    assert.equal(segment(english, 'que', [{ index: 2, endIndex: 3 }]), null);
  });

  it('has the Hungarian and Church Slavonic rules of Gregorio', function() {
    var hungarian = Text.language.hungarian;
    assert.deepEqual(['szőlő', 'fű', 'Úr', 'gyöngy'].map((s) => segment(hungarian, s)), ['ő', 'ű', 'Ú', 'ö']);
    var slavonic = Text.language.churchSlavonic;
    // (m is a secondary center too)
    assert.deepEqual(['vlk', 'krk', 'smrt', 'Bůh', 'świę', 'mlha'].map((s) => segment(slavonic, s)), ['l', 'r', 'm', 'ů', 'ię', 'a']);
  });

  it('centers a lyric on its first letter or its whole syllable, as ctxt.lyricCentering says', function() {
    var centers = (lyricCentering: Drawing.ChantContext['lyricCentering']) =>
      lyricsOf('(c4) Glo(f) f{i}re(g)', (ctxt) => (ctxt.lyricCentering = lyricCentering)).map(
        // in characters, which are each 7.2 wide
        (lyric) => Math.round((lyric.origin.x / 7.2) * 100) / 100
      );
    // (the braces always win)
    assert.deepEqual(centers('vowel'), [2.5, 1.5]);
    assert.deepEqual(centers('firstletter'), [0.5, 1.5]);
    assert.deepEqual(centers('syllable'), [1.5, 1.5]);
  });
});

describe('Verbatim text', function() {
  var spansOf = (text: string) =>
    new Drawing.Lyric(new Drawing.ChantContext(), text, Drawing.LyricType.SingleSyllable).spans.map(
      (span) => span.text + (span.mergedProperties['font-family'] === 'greextra' ? '@greextra' : '')
    );

  it('leaves out TeX commands that it has nothing to draw for, but not the text of their arguments', function() {
    assert.deepEqual(spansOf('a<v>\\textit{b}</v>c'), ['a', 'b', 'c']);
    assert.deepEqual(spansOf('<v>\\textit{Amen}</v>'), ['Amen']);
    assert.deepEqual(spansOf('<v>\\textbf[x]{a {b} c}</v>d'), ['a ', 'b', ' c', 'd']);
    assert.deepEqual(spansOf('<v>\\emph{\\\'e}</v>'), ['é']);
    assert.deepEqual(spansOf('<v>{\\bf e}</v>'), [' e']);
    // spacing, and Gregorio's own commands, have no text to show
    assert.deepEqual(spansOf('<v>\\hspace{1em}</v>d'), ['d']);
    assert.deepEqual(spansOf('<v>\\kern{2pt}\\gresetlyriccentering{vowel}</v>d'), ['d']);
  });

  it("draws Gregorio's symbol commands, accents and escaped characters", function() {
    var cross = spansOf('<v>\\grecross</v>')[0];
    assert.match(cross, /@greextra$/);
    assert.deepEqual(spansOf('<v>\\greextra{Cross}</v>'), [cross]);
    assert.deepEqual(spansOf('<v>{greextra}{Cross}</v>'), [cross]);
    assert.deepEqual(spansOf('<v>\\GreStar</v>'), spansOf('<v>\\greextra{StarSix}</v>'));
    assert.deepEqual(spansOf("<v>\\'e{\\'\\ae}\\&\\%\\#\\_\\$</v>"), ['é', 'ǽ', '&', '%', '#', '_', '$']);
  });
});

describe('Above-lines text and translations', function() {
  it('keeps the text before a tag that is already open', function() {
    var ctxt = new Drawing.ChantContext();
    var spans = (text: string) => new Drawing.AboveLinesText(ctxt, text, null).spans.map((span) => span.text);
    assert.deepEqual(spans('<b>Bold</b> <i>it</i> plain'), ['Bold', ' ', 'it', ' plain']);
    assert.deepEqual(spans('a <i>b</i> c'), ['a ', 'b', ' c']);
  });

  it('centers a translation under its lyric with translationCentering "center"', function() {
    var translations = (translationCentering: Drawing.ChantContext['translationCentering']) => {
      var ctxt = new Drawing.ChantContext();
      ctxt.setFont('Palatino', 16, {}, { Regular: fakeFont(0.5) });
      ctxt.translationCentering = translationCentering;
      var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, '(c4) Kyrie[Lord](f) a(g)'), false);
      score.performLayout(ctxt);
      score.layoutChantLines(ctxt, 600);
      var notation = score.notations.find((notation) => notation.translationText)!;
      var lyric = notation.lyrics[0], translation = notation.translationText![0];
      return {
        lyric: lyric.bounds.x + lyric.bounds.width / 2,
        translation: translation.bounds.x + translation.bounds.width / 2,
        left: translation.bounds.x
      };
    };
    assert.strictEqual(translations('left').left, 0);
    var centered = translations('center');
    assert(Math.abs(centered.lyric - centered.translation) < 1e-9, JSON.stringify(centered));
  });
});

describe('Clear', function() {
  function layout(gabc: string, fontSize = 16) {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Palatino', fontSize, {}, { Regular: fakeFont(0.5) });
    var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), false);
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, 1000);
    return score.notations;
  }

  it("keeps a lyric with <clear> from reaching back under the previous notes", function() {
    var [, plain] = layout('(c4) e(hih) Christe(g)');
    var [melisma, cleared] = layout('(c4) e(hih) <clear>Christe(g)');
    // without it, the text starts under the melisma
    assert(plain.lyrics[0].getLeft() < plain.bounds.x - 1);
    assert(Math.abs(cleared.lyrics[0].getLeft() - melisma.bounds.right()) < 1e-9);
  });

  it("keeps the notes of a syllable with <clear> from starting before the previous lyric ends", function() {
    // in small text, a note is wider than a letter, so it starts before its letter
    var [first, plain] = layout('(c4) Bene(f)i(g)', 8);
    assert(plain.bounds.x < first.lyrics[0].getRight() - 1);
    var [first, cleared] = layout('(c4) Bene(f)<clear>i(g)', 8);
    assert(Math.abs(cleared.bounds.x - first.lyrics[0].getRight()) < 1e-9);
  });

  it("doesn't condense the space before a syllable with <clear> and then leave a gap without a hyphen", function() {
    // (one word, with notes without text between its syllables)
    var [ky, melisma, cleared] = layout('(c4) Ky(f)(ghg)<clear>ri(g)');
    assert(cleared.lyrics[0].getLeft() >= melisma.bounds.right() - 1e-9);
    var gap = cleared.lyrics[0].getLeft() - ky.lyrics[0].getRight();
    assert(ky.lyrics[0].needsConnector || gap < 0.5, String(gap));
  });

  it("changes nothing where the text is clear already", function() {
    var plain = layout('(c4) Ky(f) ri(g)').map((notation) => notation.bounds.x);
    var cleared = layout('(c4) Ky(f) <clear>ri(g)').map((notation) => notation.bounds.x);
    assert.deepEqual(cleared, plain);
  });
});

describe('Protrusion', function() {
  function firstLine(gabc: string, width: number, setupContext?: (ctxt: Drawing.ChantContext) => void) {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Palatino', 16, {}, { Regular: fakeFont(0.5) });
    if (setupContext) setupContext(ctxt);
    var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), false);
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, width);
    var line = score.lines[0];
    var last = score.notations[line.notationsStartIndex + line.numNotationsOnLine - 1];
    return { line, last, lyric: last.lyrics[0] };
  }
  var gabc = (pr: string) => `(c4) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son${pr}.(f) Chri(f)ste(g) (::)`;

  // the narrowest width that "son." fits at without protruding
  var width = 100;
  while (firstLine(gabc(''), width).lyric.text !== 'son.') width++;

  it('lets the text after <pr> go past the end of the staff', function() {
    // a little narrower, "son." doesn't fit
    assert.equal(firstLine(gabc(''), width - 3).lyric.text, 'i');
    var { line, lyric } = firstLine(gabc('<pr>'), width - 3);
    assert.equal(lyric.text, 'son.');
    // (the period is a character, 7.2, wide)
    assert(Math.abs(lyric.protrusionWidth! - 7.2) < 1e-9);
    assert(lyric.getRight() > line.staffRight);
    assert(lyric.getRight() - lyric.protrusionWidth! <= line.staffRight + 1e-9);
  });

  it('lets only part of it protrude with a factor, or with defaultProtrusionFactor', function() {
    var { lyric } = firstLine(gabc('<pr:0.5>'), width - 3);
    assert.equal(lyric.text, 'son.');
    assert(Math.abs(lyric.protrusionWidth! - 3.6) < 1e-9);
    assert.equal(firstLine(gabc('<pr:0>'), width - 1).lyric.text, 'i');
    var halfway = (ctxt: Drawing.ChantContext) => (ctxt.defaultProtrusionFactor = 0.5);
    lyric = firstLine(gabc('<pr>'), width - 3, halfway).lyric;
    assert.equal(lyric.text, 'son.');
    assert(Math.abs(lyric.protrusionWidth! - 3.6) < 1e-9);
  });

  it('makes the score wide enough for the text that protrudes', function() {
    var { line, lyric } = firstLine(gabc('<pr>'), width - 3);
    assert(Math.abs(line.score.bounds.width - lyric.getRight()) < 1e-9);
    assert.equal(firstLine(gabc(''), width).line.score.bounds.width, width);
  });

  it("doesn't protrude a syllable that a hyphen follows", function() {
    var [lyric] = lyricsOf('(c4) glo<pr>ri(f)a(g)');
    assert.equal(lyric.protrusionWidth, 0);
  });

  it('keeps protruding the same text when the drop cap is taken away and made again', function() {
    var ctxt = new Drawing.ChantContext();
    ctxt.setFont('Palatino', 16, {}, { Regular: fakeFont(0.5) });
    var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, '(c4) Al<pr>.(f)'), true);
    var lyric = score.notations[0].lyrics[0];
    var widths = [true, false, true].map((useDropCap) => {
      score.useDropCap = useDropCap;
      score.recreateDropCap(ctxt);
      lyric.recalculateMetrics(ctxt);
      return lyric.protrusionWidth;
    });
    // (the period, 7.2 wide)
    assert.deepEqual(widths.map((width) => Math.round(width! * 10) / 10), [7.2, 7.2, 7.2]);
  });
});
