import { describe, it } from "vitest";
import assert from "node:assert";
import * as Chant from "../src/Exsurge.Chant.js";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { Gabc } from "../src/Exsurge.Gabc.js";
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
