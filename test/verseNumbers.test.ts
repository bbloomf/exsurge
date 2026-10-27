import { describe, it } from "vitest";
import assert from "node:assert";
import * as Chant from "../src/Exsurge.Chant.js";
import * as Drawing from "../src/Exsurge.Drawing.js";
import { DoubleBar } from "../src/Exsurge.Chant.Signs.js";
import { Gabc } from "../src/Exsurge.Gabc.js";
import { fakeFont } from "./helpers/fonts";

function scoreOf(
  gabc: string,
  width?: number,
  setupContext?: (ctxt: Drawing.ChantContext) => void,
  useDropCap = false
) {
  var ctxt = new Drawing.ChantContext();
  // every character is half an em wide
  ctxt.setFont('Palatino', 16, {}, { Regular: fakeFont(0.5) });
  if (setupContext) setupContext(ctxt);
  var score = new Chant.ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), useDropCap);
  score.performLayout(ctxt);
  if (width) score.layoutChantLines(ctxt, width);
  return { ctxt, score };
}

// the right of a lyric's verse number, from its notation's x
const verseNumberRight = (lyric: Drawing.Lyric) =>
  lyric.bounds.x + lyric.verseNumberX + lyric.shownVerseNumber!.bounds.width;

// three verses, over several lines at a width of 200
const stanza = 'ni|di|sep(gf) Cre|ce|ti(g)a|ris |for(h)tor|Pa|mis (h) Spi|ra|mu(ih)ri|cli|ne(g)tus,|tus, |re, (gh) (,) ';
// (the tags for each line of lyrics)
const verseNums = (...numbers: string[]) => numbers.map((n) => `<verseNum>${n}</verseNum>`);
const [one, two, ten] = verseNums('1.', '2.', '10.');
const hymn =
  `(c4) ${one} Ve|${two} Qui |${ten} Tu (g)` + stanza + ('Ve|Qui |Tu (g)' + stanza).repeat(2) + '(::)';

/** the first notation with lyrics on each line */
const lineStarts = (score: Chant.ChantScore) =>
  score.lines.map((line) => {
    for (let i = line.notationsStartIndex; i < line.notationsStartIndex + line.numNotationsOnLine; i++)
      if (score.notations[i].hasLyrics()) return score.notations[i];
    return null;
  });

describe('Verse numbers', function() {
  it('takes the verse number in a <verseNum> tag out of the syllable', function() {
    var gabc = `(c4) ${one} Ve|<verseNum>2.</verseNum>~Qui |<VERSENUM> 10. </VERSENUM>Tu (g)ni(h)`;
    var { score } = scoreOf(gabc);
    var lyrics = score.notations[0].lyrics;
    assert.deepEqual(lyrics.map((lyric) => lyric.text), ['Ve', 'Qui', 'Tu']);
    assert.deepEqual(lyrics.map((lyric) => lyric.verseNumber!.text), ['1.', '2.', '10.']);
    assert.deepEqual(lyrics.map((lyric) => lyric.sourceIndex), ['Ve', 'Qui', 'Tu'].map((text) => gabc.indexOf(text)));
    assert.deepEqual(
      lyrics.map((lyric) => lyric.verseNumber!.sourceIndex),
      ['1.', '2.', ' 10.'].map((text) => gabc.indexOf(text))
    );
    // (the syllable is still the first of its word)
    assert.equal(lyrics[0].lyricType, Drawing.LyricType.BeginningSyllable);
  });

  it('takes the tag after a space, in markup of its own, and with a lyric tie after it', function() {
    var lyrics = scoreOf(`(c4) <i><verseNum>1.</verseNum></i> Ve| ${two} Qui |<verseNum>3.</verseNum>~Tu (g)`, 0, (ctxt) => {
      ctxt.lyricTie = 'undertie';
    }).score.notations[0].lyrics;
    assert.deepEqual(lyrics.map((lyric) => lyric.text), ['Ve', 'Qui', 'Tu']);
    assert.deepEqual(lyrics.map((lyric) => lyric.verseNumber!.text), ['1.', '2.', '3.']);
    assert.equal(lyrics[0].verseNumber!.gabcText, '<i>1.</i>');
    // (but not in markup that goes on into the syllable)
    lyrics = scoreOf('(c4) <i><verseNum>1.</verseNum> Ve</i>(g)').score.notations[0].lyrics;
    assert(!lyrics[0].verseNumber);
  });

  it('leaves numbers without the tag in the syllable', function() {
    var { score } = scoreOf('(c4) 1.~Ve(g) 1.(g) Ve<verseNum>2.</verseNum>(g)');
    var lyrics = score.notations.filter((notation) => notation.hasLyrics()).map((notation) => notation.lyrics[0]);
    assert.deepEqual(lyrics.map((lyric) => lyric.text), ['1. Ve', '1.', 'Ve<verseNum>2.</verseNum>']);
    assert(lyrics.every((lyric) => !lyric.verseNumber));
    // (nor in a syllable's other lines of lyrics, after one that has one)
    lyrics = scoreOf(`(c4) ${one} Ve|Qui (g)`).score.notations[0].lyrics;
    assert.deepEqual(lyrics.map((lyric) => lyric.verseNumber && lyric.verseNumber.text), ['1.', undefined]);
  });

  it('reads an empty tag as the end of the verse number', function() {
    var lyrics = scoreOf('(c4) <verseNum></verseNum>A|<verseNum/>A |<verseNum> </verseNum> A (g)').score.notations[0]
      .lyrics;
    assert.deepEqual(lyrics.map((lyric) => lyric.text), ['A', 'A', 'A']);
    assert(lyrics.every((lyric) => lyric.endsVerseNumbers && !lyric.verseNumber));
  });

  it('right aligns the verse numbers a word space before the leftmost syllable', function() {
    var { ctxt, score } = scoreOf(`(c4) ${one} Ve|${two} Qui |${ten} Tu (g)ni(h)`);
    var lyrics = score.notations[0].lyrics;
    var right = Math.min(...lyrics.map((lyric) => lyric.bounds.x)) - ctxt.minLyricWordSpacing;
    for (let lyric of lyrics) assert(Math.abs(verseNumberRight(lyric) - right) < 1e-9);
    // and the syllables are centered as they would be without them
    var { score: without } = scoreOf('(c4) Ve|Qui |Tu (g)ni(h)');
    assert.deepEqual(lyrics.map((lyric) => lyric.bounds.x), without.notations[0].lyrics.map((lyric) => lyric.bounds.x));
  });

  it('makes room for the verse numbers at the start of the line', function() {
    var { score } = scoreOf(`(c4) ${one} Ve|${two} Qui |${ten} Tu (g)ni(h) (::)`, 400);
    var [line] = score.lines;
    var lyrics = score.notations[0].lyrics;
    assert(Math.abs(Math.min(...lyrics.map((lyric) => lyric.getLeft())) - line.staffLeft) < 1e-9);
    // (where "10." starts)
    assert.equal(lyrics[2].getLeft(), lyrics[2].notation.bounds.x + lyrics[2].bounds.x + lyrics[2].verseNumberX);
  });

  it('draws the verse numbers in every output', function() {
    var { ctxt, score } = scoreOf(`(c4) ${one} Ve|${two} Qui (g)ni(h) (::)`, 400);
    var svg = score.createSvg(ctxt);
    var numbers = Array.from(svg.matchAll(/<text[^>]*class="verseNumber lyric"[^>]*><tspan[^>]*>([^<]*)</g), (m) => m[1]);
    assert.deepEqual(numbers, ['1.', '2.']);
    var count = (node: Drawing.SvgTreeNode | string): number =>
      typeof node === 'string'
        ? 0
        : (node.props && node.props.className === 'verseNumber lyric' ? 1 : 0) +
          node.children.reduce((sum, child) => sum + count(child), 0);
    assert.equal(count(score.createSvgTree(ctxt)), 2);
  });

  it('repeats the verse numbers at the start of every line unless ctxt.repeatVerseNumbers is false', function() {
    var { score } = scoreOf(hymn, 200, (ctxt) => (ctxt.repeatVerseNumbers = false));
    assert(score.lines.length > 2);
    assert(score.notations.every((notation) => notation.lyrics.every((lyric) => !lyric.repeatedVerseNumber)));

    var { ctxt, score: repeated } = scoreOf(hymn, 200);
    var starts = lineStarts(repeated);
    assert.deepEqual(starts[0]!.lyrics.map((lyric) => lyric.shownVerseNumber!.text), ['1.', '2.', '10.']);
    for (let notation of starts.slice(1)) {
      assert.deepEqual(notation!.lyrics.map((lyric) => lyric.repeatedVerseNumber!.text), ['1.', '2.', '10.']);
      let right = Math.min(...notation!.lyrics.map((lyric) => lyric.bounds.x)) - ctxt.minLyricWordSpacing;
      for (let lyric of notation!.lyrics) assert(Math.abs(verseNumberRight(lyric) - right) < 1e-9);
    }
    // (and nowhere else)
    var withRepeated = repeated.notations.filter((notation) => notation.lyrics.some((lyric) => lyric.repeatedVerseNumber));
    assert.deepEqual(withRepeated, starts.slice(1));
    for (let [i, line] of repeated.lines.entries())
      assert(Math.min(...starts[i]!.lyrics.map((lyric) => lyric.getLeft())) >= line.staffLeft - 1e-9);
  });

  it('repeats only at the starts of the lines of the latest layout', function() {
    var { ctxt, score } = scoreOf(hymn, 200);
    score.layoutChantLines(ctxt, 320);
    var withRepeated = score.notations.filter((notation) => notation.lyrics.some((lyric) => lyric.repeatedVerseNumber));
    assert.deepEqual(withRepeated, lineStarts(score).slice(1));
  });

  it('repeats a verse number as it is in the gabc, with its escapes', function() {
    var { score } = scoreOf(hymn.replace(one, '<verseNum>$<1$></verseNum>'), 200);
    var starts = lineStarts(score);
    for (let notation of starts) assert.equal(notation!.lyrics[0].shownVerseNumber!.text, '<1>');
  });

  it("repeats the verse numbers at the start of the line, not of an extra line of text only syllables", function() {
    var gabc =
      `(c4) ${one} Ve(g)ni(h) ` +
      'lo(g)rem() ip()sum() do()lor() sit() a()met() con()sec()te()tur() ad()i()pi()scing() e()lit() '.repeat(3) +
      '(::)';
    var { score } = scoreOf(gabc, 200);
    assert(score.lines.some((line) => line.extraTextOnlyIndex !== null));
    var withRepeated = score.notations.filter((notation) => notation.lyrics.some((lyric) => lyric.repeatedVerseNumber));
    assert.deepEqual(withRepeated, lineStarts(score).slice(1));
  });

  it("repeats a verse number before its line of lyrics' first text on the line", function() {
    // (the third verse has melismas, so some lines start without its text)
    var gabc =
      `(c4) ${one} Ve|${two} Qui |<verseNum>3.</verseNum> Tu (g)` +
      'ni|di|(gf) Cre|ce|sep(g)a|ris |ti(h)tor|Pa|(h) Spi|ra|a(ih)ri|cli|(g)tus,|tus, |ris (gh) '.repeat(4) +
      '(::)';
    var { score } = scoreOf(gabc, 120);
    var withoutThird = 0;
    for (let line of score.lines.slice(1)) {
      let notations = score.notations.slice(line.notationsStartIndex, line.notationsStartIndex + line.numNotationsOnLine);
      for (let lyricIndex = 0; lyricIndex < 3; lyricIndex++) {
        let first = notations.find((notation) => notation.lyrics[lyricIndex] && notation.lyrics[lyricIndex].text)!;
        assert.equal(first.lyrics[lyricIndex].shownVerseNumber!.text, `${lyricIndex + 1}.`);
        if (first !== notations[0]) withoutThird++;
      }
    }
    assert(withoutThird > 0);
  });

  it('repeats the verse numbers after the lyrics of a double bar that ended the line before', function() {
    var gabc = (hymn.replace('(::)', '') + 'R.|R. |R. (::) ').replace(/\(,\) (Ve)/g, 'R.|R. |R. (::) $1') + '(::)';
    var { score } = scoreOf(gabc, 130);
    var afterBar = score.lines.slice(1).filter((line) => {
      let before = score.notations[line.notationsStartIndex - 1];
      return before instanceof DoubleBar && before.hasLyrics();
    });
    assert(afterBar.length > 0);
    for (let line of afterBar)
      assert.deepEqual(
        score.notations[line.notationsStartIndex].lyrics.map((lyric) => lyric.shownVerseNumber!.text),
        ['1.', '2.', '10.']
      );
  });

  it('repeats the latest verse number on each line of lyrics', function() {
    var [one, two, three, four] = verseNums('1.', '2.', '3.', '4.');
    var gabc =
      `(c4) ${one} Ve|${two} Qui |${three} Tu (g)` + stanza + `${four} Ve|Qui |Tu (g)` + stanza +
      'Ve|Qui |Tu (g)' + stanza + '(::)';
    var { score } = scoreOf(gabc, 200);
    var starts = lineStarts(score);
    var last = starts[starts.length - 1]!;
    assert.deepEqual(last.lyrics.map((lyric) => lyric.shownVerseNumber!.text), ['4.', '2.', '3.']);
  });

  it('stops repeating the verse numbers after an empty tag', function() {
    var gabc =
      hymn.replace('(::)', '') +
      '<verseNum></verseNum>A|<verseNum/>A |<verseNum></verseNum>A (g)' + stanza.repeat(2) + '(::)';
    var { score } = scoreOf(gabc, 200);
    var amen = score.notations.findIndex((notation) => notation.lyrics.some((lyric) => lyric.endsVerseNumbers));
    var starts = lineStarts(score);
    var before = starts.filter((notation) => notation!.notationIndex! <= amen);
    var after = starts.filter((notation) => notation!.notationIndex! > amen);
    assert(before.length > 1 && after.length > 0);
    for (let notation of before) assert(notation!.lyrics.every((lyric) => lyric.shownVerseNumber || lyric.endsVerseNumbers));
    for (let notation of after) assert(notation!.lyrics.every((lyric) => !lyric.shownVerseNumber));
  });

  describe('with a drop cap', function() {
    const svgVerseNumbers = (svg: string) =>
      Array.from(svg.matchAll(/<text[^>]*class="verseNumber lyric"[^>]*><tspan[^>]*>([^<]*)</g), (m) => m[1]);
    const shownNumbers = (notation: Drawing.ChantNotationElement) =>
      notation.lyrics.map((lyric) => lyric.shownVerseNumber && lyric.shownVerseNumber.text);

    it('takes the drop cap from the first syllable, and leaves out its verse number', function() {
      var { ctxt, score } = scoreOf(`(c4) ${one} Ve|${two} Qui (g)ni(h) (::)`, 400, undefined, true);
      assert.equal(score.dropCap!.spans.map((span) => span.text).join(''), 'V');
      var lyrics = score.notations[0].lyrics;
      assert.deepEqual(lyrics.map((lyric) => lyric.text), ['e', 'Qui']);
      // (the lyric keeps it, but doesn't show it)
      assert.equal(lyrics[0].verseNumber!.text, '1.');
      assert.deepEqual(shownNumbers(score.notations[0]), [undefined, '2.']);
      assert.deepEqual(svgVerseNumbers(score.createSvg(ctxt)), ['2.']);
    });

    it("doesn't repeat the first verse number, but repeats the others", function() {
      var { score } = scoreOf(hymn, 200, undefined, true);
      assert(score.dropCap);
      var starts = lineStarts(score);
      assert(starts.length > 2);
      for (let notation of starts) assert.deepEqual(shownNumbers(notation!), [undefined, '2.', '10.']);
    });

    it('repeats a later verse number on the first line of lyrics', function() {
      var [four] = verseNums('4.');
      var gabc =
        `(c4) ${one} Ve|${two} Qui |${ten} Tu (g)` + stanza + `${four} Ve|Qui |Tu (g)` + stanza.repeat(2) + '(::)';
      var { score } = scoreOf(gabc, 200, undefined, true);
      var starts = lineStarts(score);
      assert.deepEqual(shownNumbers(starts[starts.length - 1]!), ['4.', '2.', '10.']);
    });

    it('shows the first verse number again when the score stops using the drop cap, and hides it when it starts again', function() {
      var { ctxt, score } = scoreOf(hymn, 200, undefined, true);
      var relayout = (useDropCap: boolean) => {
        score.useDropCap = useDropCap;
        score.updateNotations(ctxt);
        score.performLayout(ctxt);
        score.layoutChantLines(ctxt, 200);
      };
      relayout(false);
      assert.equal(score.dropCap, null);
      var fresh = scoreOf(hymn, 200);
      assert.equal(score.createSvg(ctxt), fresh.score.createSvg(fresh.ctxt));
      for (let notation of lineStarts(score)) assert.deepEqual(shownNumbers(notation!), ['1.', '2.', '10.']);

      relayout(true);
      fresh = scoreOf(hymn, 200, undefined, true);
      assert.equal(score.createSvg(ctxt), fresh.score.createSvg(fresh.ctxt));
    });
  });
});
