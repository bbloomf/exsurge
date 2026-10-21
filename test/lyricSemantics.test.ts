import { describe, it } from "vitest";
import assert from "node:assert";
import * as Chant from "../src/Exsurge.Chant.js";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { Gabc } from "../src/Exsurge.Gabc.js";

function lyricsOf(gabc: string, setupContext?: (ctxt: Drawing.ChantContext) => void) {
  var ctxt = new Drawing.ChantContext();
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
