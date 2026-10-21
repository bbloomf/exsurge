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
    var ties = { space: ' ', undertie: '‿', overtie: '⁀', doubletie: '⁐' } as const;
    for (const [tie, text] of Object.entries(ties)) {
      var lyrics = lyricsOf(gabc, (ctxt) => (ctxt.lyricTie = tie as keyof typeof ties));
      assert.deepEqual(lyrics.map((lyric) => lyric.text), ['De' + text + 'us', '∼'], tie);
    }
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

  it('leaves out TeX commands that it has nothing to draw for, with their arguments', function() {
    assert.deepEqual(spansOf('a<v>\\textit{b}</v>c'), ['a', 'c']);
    assert.deepEqual(spansOf('<v>\\hspace{1em}</v>d'), ['d']);
    assert.deepEqual(spansOf('<v>\\textbf[x]{a {b} c}</v>d'), ['d']);
    assert.deepEqual(spansOf('<v>{\\bf e}</v>'), [' e']);
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
