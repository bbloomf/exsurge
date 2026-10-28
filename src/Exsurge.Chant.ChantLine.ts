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

import { ChantLineBreak, NoteShape, TextOnly } from "./Exsurge.Chant.js";
import {
  BraceAttachment, BracePoint, BraceShape, HorizontalEpisemaAlignment, Slur, ledgerLinePosition
} from "./Exsurge.Chant.Markings.js";
import {
  AccidentalType,
  Custos,
  DoubleBar,
  FullBar
} from "./Exsurge.Chant.Signs.js";
import { custosLedgerLineOverhang, hasDrawnLedgerLine, ledgerLineOverhang } from "./ledgerLines.js";
import { Point, Rect } from "./Exsurge.Core.js";
import {
  ChantLayoutElement, CurlyBraceVisualizer, GlyphCode, Lyric,
  LyricArray,
  LyricType, MarkingPositionHint, NabcDimensions, QuickSvg, RoundBraceVisualizer
} from "./Exsurge.Drawing.js";
import { Glyphs } from "./Exsurge.Glyphs.js";
import type { ChantScore, Clef, Note } from "./Exsurge.Chant.js";
import type { BraceNote, EpisemaTuning, HorizontalEpisema, LedgerLineExtent } from "./Exsurge.Chant.Markings.js";
import type { Neume, NeumeLedgerLine } from "./Exsurge.Chant.Neumes.js";
import type { Accidental, Divider, InsertionCursor } from "./Exsurge.Chant.Signs.js";
import type {
  ChantContext,
  ChantNotationElement,
  NabcNeumes,
  SvgAttributes,
  SvgElementWithSource,
  SvgTreeNode,
  TextElement,
  TrailingSpaceFunction
} from "./Exsurge.Drawing.js";

// a soft accidental that isn't printed takes no space, unless it has to hold lyrics
export const isHiddenAccidental = (notation: ChantNotationElement) =>
  notation.isAccidental && (notation as Accidental).hidden && !notation.hasLyrics();

// (these, like isHiddenAccidental, are shared with LineBreaker.layOutLineFrom(),
// which lays out lines as buildFromChantNotationIndex() does)

/** whether only text-only notations come between the notation at index, which is one, and the next divider */
export function isTextOnlyBeforeDivider(notations: ChantNotationElement[], index: number) {
  if (notations[index].constructor !== TextOnly) return false;
  for (let k = index + 1; k < notations.length; k++) {
    if (notations[k].isDivider) return true;
    if (notations[k].constructor !== TextOnly) return false;
  }
  return false;
}

/**
 * whether the notations from index on allow the line that ends just before
 * them an automatic custos: Gregorio leaves it out just before a euouae area
 * (gabc <eu>), and after a [nocustos] before the next note
 */
export function allowsCustosBefore(notations: ChantNotationElement[], index: number) {
  for (let k = index; k < notations.length; k++) {
    let next = notations[k];
    if (next.isClef || next.constructor === ChantLineBreak) continue;
    if (next.euouae && next.euouae.start) return false;
    break;
  }
  for (let k = index; k < notations.length; k++) {
    if (notations[k].isNeume) return !notations[k].notes![0].noCustosBefore;
  }
  return true;
}

/**
 * copies of the lyrics of the double bar that ends a line, which go at the
 * start of the next line, the first at x = 0; or null, if it has none to go there
 */
export function copyBeginningLyrics(ctxt: ChantContext, notation: ChantNotationElement) {
  if (notation.constructor !== DoubleBar) return null;
  var bar = notation as DoubleBar;
  if (!bar.hasLyrics() || (bar.lyrics.length === 1 && bar.lyrics[0].text.match(/^(i\.?)+j\.?/))) return null;
  var lyrics = bar.lyrics.map((lyric) => {
    var newLyric = new Lyric(
      ctxt,
      lyric.originalText,
      lyric.lyricType,
      lyric.notation,
      lyric.notations,
      lyric.sourceIndex,
      lyric.openStyles
    );
    newLyric.elidesToNext = lyric.elidesToNext;
    if (lyric.verseNumber) newLyric.verseNumber = lyric.verseNumber.copy(ctxt, lyric.verseNumber.sourceIndex);
    newLyric.endsVerseNumbers = lyric.endsVerseNumbers;
    return newLyric;
  });
  LyricArray.alignVerseNumbers(ctxt, lyrics);
  var minX = lyrics.map((l) => l.leftOffset()).reduce((a, b) => (a < b ? a : b));
  lyrics.forEach((l) => {
    l.bounds.x -= minX;
  });
  return lyrics;
}

/**
 * Puts back what laying a notation out on a line changed, as the notation's
 * own layout left it, before it's laid out on another line: its trailing
 * space, its lyrics' connectors, and lyrics that a line wrapped or shrank (in
 * setMaxWidth()) or moved (in centerDividers()).  So each line is laid out
 * the same however the score was laid out before, and whichever lines the
 * optimal line breaker tried first.
 */
export function resetNotation(ctxt: ChantContext, notation: ChantNotationElement) {
  if (notation.layoutTrailingSpace !== undefined) notation.calculatedTrailingSpace = notation.layoutTrailingSpace;
  // (text that the line doesn't place vertically, as on lines of text only
  // syllables, stays where its layout put it)
  if (notation.alText) for (let text of notation.alText) text.bounds.y = 0;
  if (notation.translationText) for (let text of notation.translationText) text.bounds.y = 0;
  if (!notation.hasLyrics()) return;
  let moved = false;
  for (let lyric of notation.lyrics) {
    // (ChantLine.repeatVerseNumbers() gives them to the first text of each line of lyrics on a line)
    if (lyric.repeatedVerseNumber) {
      delete lyric.repeatedVerseNumber;
      moved = true;
    }
    if (lyric.needsLayout) {
      lyric.recalculateMetrics(ctxt);
      lyric.needsLayout = false;
      moved = true;
    } else lyric.resetConnector();
    lyric.bounds.y = 0;
    if (lyric.lineWidth !== undefined) delete lyric.lineWidth;
  }
  if (moved) notation.alignLyrics(ctxt);
}

// a notation whose own trailing space is negative (gabc /[-1]) moves the next one back
const hasBackspace = (ctxt: ChantContext, notation: ChantNotationElement) =>
  (typeof notation.trailingSpace === "function"
    ? notation.trailingSpace(ctxt)
    : notation.trailingSpace) < 0;

// how far right Gregorio's NABC goes on the line's notations, from the one at
// index back through the syllable of the one at stop (the last with notes,
// after which those without notes are placed), or -Infinity if they have none
function nabcRight(line: ChantLine, index: number, stop = index) {
  let notations = line.score.notations;
  let right = -Infinity;
  for (let i = index; i >= line.notationsStartIndex; i--) {
    for (let nabc of notations[i].nabcNeumes || [])
      if (nabc) right = Math.max(right, notations[i].bounds.x + nabc.bounds.right());
    if (i <= stop && notations[i].firstOfParentheses) break;
  }
  return right;
}

/**
 * Puts Gregorio's NABC on a line (see NabcNeumes) where GregorioTeX does
 * (adjust_additional_spaces() in tex/gregoriotex.lua): the first line of it
 * with its baseline abovelinesnabcraise above the top line, and the second
 * belowlinesnabcheight below the bottom line, each further from the staff
 * where notes go far above or below the staff or the NABC's glyphs reach
 * towards it.  It makes room for them in the line's notationBounds, so that
 * text above the lines goes above the first, and the lyrics below the
 * second.
 */
function layoutNabcLines(ctxt: ChantContext, line: ChantLine, notations: ChantNotationElement[]) {
  // the NABC on each line of it
  let voices: Array<Array<[ChantNotationElement, NabcNeumes]>> = [[], []];
  for (let notation of notations)
    for (let nabc of notation.nabcNeumes || []) if (nabc) voices[nabc.voice].push([notation, nabc]);
  if (!voices[0].length && !voices[1].length) return;
  let interval = ctxt.staffInterval;
  // the staff positions of the highest and lowest notes (0 is c, below the bottom line)
  let high = -Infinity;
  let low = Infinity;
  for (let notation of notations)
    for (let note of notation.notes || []) {
      high = Math.max(high, note.staffPosition);
      low = Math.min(low, note.staffPosition);
    }
  let topLine = 2 * line.score.staffLineCount - 1;
  let bounds = line.notationBounds!;
  const most = (nabcs: Array<[ChantNotationElement, NabcNeumes]>, measure: (nabc: NabcNeumes) => number) =>
    Math.max(0, ...nabcs.map(([, nabc]) => measure(nabc) * nabc.unit));
  if (voices[0].length) {
    // (keeping a staff interval clear between the glyphs and the staff)
    let baseline =
      -topLine * interval -
      NabcDimensions.aboveLinesRaise * interval -
      Math.max(0, high - topLine - NabcDimensions.aboveThreshold) * interval -
      Math.max(0, most(voices[0], (nabc) => nabc.layout.depth) - Math.max(0, (NabcDimensions.aboveLinesHeight - 1) * interval));
    for (let [, nabc] of voices[0]) nabc.setBaseline(baseline);
    let height = NabcDimensions.aboveLinesHeight * interval + most(voices[0], (nabc) => nabc.layout.raised);
    bounds.union(new Rect(0, baseline - height, 0, height));
  }
  if (voices[1].length) {
    // (keeping half a staff interval clear)
    let baseline =
      -interval +
      NabcDimensions.belowLinesHeight * interval +
      Math.max(0, 1 - low - NabcDimensions.belowThreshold) * interval +
      Math.max(0, most(voices[1], (nabc) => nabc.layout.height) - Math.max(0, (NabcDimensions.belowLinesHeight - 0.5) * interval));
    for (let [, nabc] of voices[1]) nabc.setBaseline(baseline);
    bounds.union(new Rect(0, baseline, 0, most(voices[1], (nabc) => nabc.layout.lowered)));
  }
  // and room for all of their glyphs
  for (let [notation, nabc] of [...voices[0], ...voices[1]])
    bounds.union(new Rect(notation.bounds.x + nabc.bounds.x, nabc.bounds.y, nabc.bounds.width, nabc.bounds.height));
}

/** a ledger line on a chant line */
export interface LedgerLine {
  x1: number;
  x2: number;
  staffPosition: number;
}

/** the space before a notation, and how much of it can be taken out to fit more on the line */
interface CondensableSpace {
  notation: ChantNotationElement;
  total: number;
  condensable: number;
}

/** the spaces between notations so far on a line, and the sum of their condensable space */
type CondensableSpaces = CondensableSpace[] & { sum: number };

// the sum of the condensable space in spaces, added up in order
const sumCondensable = (spaces: CondensableSpace[]) => {
  var sum = 0;
  for (var i = 0; i < spaces.length; i++) sum += spaces[i].condensable;
  return sum;
};

// QuickSvg.createNode() or QuickSvg.createSvgTree(), as getInnerNodes() calls them
type CreateSvgElement = (
  name: string,
  attributes: SvgAttributes,
  children?: Array<SvgElementWithSource | SvgTreeNode>
) => SvgElementWithSource | SvgTreeNode;

// a chant line represents one staff line on the page. ChantLines are created by the score
// and laid out by the page
export class ChantLine extends ChantLayoutElement {
  score: ChantScore;
  /** the index in the score's notations of the first notation on the line */
  notationsStartIndex: number;
  numNotationsOnLine: number;
  /** how many notations would have fit, when fewer were kept on the line to keep some together */
  maxNumNotationsOnLine?: number;
  /**
   * the index of the notation after the last one that the optimal line
   * breaker planned for the line (see LineBreaker), which the line then
   * takes all of, or undefined to fill the line greedily
   */
  plannedEnd?: number;
  notationBounds: Rect | null;
  staffLeft: number;
  staffRight: number;
  /**
   * how far left the line's text other than its lyrics may go, to keep clear
   * of a drop cap that reaches down beside the line (see
   * ChantScore.lineExtent())
   */
  textLeft: number;
  /** whether the line is the score's first, which has its drop cap and annotation */
  isFirstLine: boolean;
  /** the space to the left of the drop cap */
  paddingLeft!: number;
  /** a copy of the clef in effect at the start of the line */
  startingClef: Clef;
  custos: Custos | null;
  /**
   * the line break that ends the line when a clef comes just before it: the
   * clef goes at the start of the next line instead, and the line break is
   * left out of both lines
   */
  clefLineBreak: ChantLineBreak | null;
  justify: boolean | undefined;
  ledgerLines: LedgerLine[];
  braces: Array<RoundBraceVisualizer | CurlyBraceVisualizer>;
  /** Gregorio's slurs on the line */
  slurs: Slur[];
  nextLine: ChantLine | null;
  previousLine: ChantLine | null;
  lyricLineHeight: number;
  lyricLineBaseline: number;
  numLyricLines: number;
  /**
   * the row that each line of lyrics is drawn on, leaving out the lines of
   * lyrics that have no text on the line and no verse number in effect (as
   * before an Amen after an empty verse number), which take up no room
   */
  lyricRows: number[] = [];
  altLineHeight!: number;
  altLineBaseline!: number;
  numAltLines!: number;
  translationLineHeight!: number;
  translationLineBaseline!: number;
  numTranslationLines!: number;
  spaceAfterNotations: number;
  spaceBetweenTextTracks: number;
  /** the last lyrics on the line, on each line of lyrics */
  lastLyrics: Lyric[];
  /**
   * the index of the first of the text-only notations at the end of the line
   * whose lyrics go on lines of their own under the line, or null
   */
  extraTextOnlyIndex!: number | null;
  /** which line of lyrics the text-only notations at the end of the line are on */
  extraTextOnlyLyricIndex!: number;
  extraTextOnlyHeight!: number;
  lastLyricsBeforeTextOnly?: Lyric[];
  /** the notations that space can be added before, to justify the line */
  toJustify?: Array<ChantNotationElement | null>;
  condensableSpaces?: CondensableSpaces;
  insertionCursor?: InsertionCursor | null;
  /** the line's index in the score's lines */
  elementIndex!: number;
  /** a brace that continues onto the next line */
  braceStart?: BracePoint;
  /**
   * the index of the furthest notation that buildFromChantNotationIndex()
   * laid out on the line, to see whether it fitted (see readEnd())
   */
  furthestLaidOut?: number;
  /**
   * what the line put inside its svg last (see createSvgFragment()), and the
   * key it was made for
   */
  svgFragmentCache?: { key: string; inner: string };

  constructor(score: ChantScore) {
    super();

    this.score = score;

    this.notationsStartIndex = 0;
    this.numNotationsOnLine = 0;
    this.notationBounds = null; // Rect

    this.staffLeft = 0;
    this.staffRight = 0;
    this.textLeft = 0;
    this.isFirstLine = false;

    this.startingClef = null as unknown as Clef; // necessary for the layout process
    this.custos = null;
    this.clefLineBreak = null;

    this.justify = true;

    // these are markings that exist at the chant line level rather than at the neume level.
    this.ledgerLines = [];
    this.braces = [];
    this.slurs = [];

    this.nextLine = null;
    this.previousLine = null; // for layout assistance

    this.lyricLineHeight = 0; // height of each text line
    this.lyricLineBaseline = 0; // offsets from the top of the text line to the baseline
    this.numLyricLines = 0; // maximum count of lyrics on the same syllable

    // fixme: make these configurable values from the score
    this.spaceAfterNotations = 0; // the space between the notation bounds and the first text track
    this.spaceBetweenTextTracks = 0; // spacing between each text track

    this.lastLyrics = [];
  }

  get staffSpaces() {
    return this.score.staffLineCount - 1;
  }

  performLayout(ctxt: ChantContext) {
    // start off with a rectangle that holds at least the four staff lines
    const staffSpaces = this.staffSpaces;
    const staffLineCount = this.score.staffLineCount;
    this.notationBounds = new Rect(
      this.staffLeft,
      -(ctxt.staffLineWeight / 2 + staffLineCount * 2 - 1 + ctxt.minSpaceAboveStaff) *
        ctxt.staffInterval,
      this.staffRight - this.staffLeft,
      (ctxt.staffLineWeight + (staffSpaces * 2) + ctxt.minSpaceAboveStaff) * ctxt.staffInterval
    );

    // run through all the elements of the line and calculate the bounds of the notations,
    // as well as the bounds of each text track we will use
    var i;
    var notations = this.score.notations;
    var lastNeumeIndex =
      this.extraTextOnlyIndex === null
        ? this.notationsStartIndex + this.numNotationsOnLine
        : this.extraTextOnlyIndex;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
    var notation = null;

    this.notationBounds.union(this.startingClef.bounds);

    // reset the lyric line offsets before we [re]calculate them now
    this.lyricLineHeight = ctxt.textStyles.lyric.size * (ctxt.textStyles.lyric.lineHeight || 1.1);
    this.lyricLineBaseline = 0;
    this.numLyricLines = 0;

    this.altLineHeight = 0;
    this.altLineBaseline = 0;
    this.numAltLines = 0;

    this.translationLineHeight = ctxt.textStyles.translation.size * (ctxt.textStyles.translation.lineHeight || 1.1);
    this.translationLineBaseline = 0;
    this.numTranslationLines = 0;

    const aboveLinesLineHeight = ctxt.textStyles.al.size * (ctxt.textStyles.al.lineHeight || 1.1);
    const usedLyricLines: boolean[] = [];

    for (i = this.notationsStartIndex; i < lastNeumeIndex; i++) {
      notation = notations[i];

      if (notation.bounds.height || notation.bounds.width)
        this.notationBounds.union(notation.bounds);

      // keep track of lyric line offsets, and which lines of lyrics are used
      notation.lyrics.forEach((lyric, j) => {
        if (!lyric.text && !lyric.verseNumber && !lyric.verseNumberInEffect) return;
        usedLyricLines[j] = true;
        if (lyric.origin.y > this.lyricLineBaseline) this.lyricLineBaseline = lyric.origin.y;
      });

      if (notation.alText && this.numAltLines < notation.alText.length) {
        if (notation.alText[0].bounds.height > this.altLineHeight)
          this.altLineHeight = notation.alText[0].bounds.height;
        if (notation.alText[0].origin.y > this.altLineBaseline)
          this.altLineBaseline = notation.alText[0].origin.y;
        if (notation.alText.length > this.numAltLines)
          this.numAltLines = notation.alText.length;
      }

      if (
        notation.translationText &&
        notation.translationText[0] &&
        notation.translationText[0].text
      ) {
        // if (
        //   notation.translationText[0].bounds.height > this.translationLineHeight
        // )
        //   this.translationLineHeight =
        //     notation.translationText[0].bounds.height;
        if (notation.translationText[0].origin.y > this.translationLineBaseline)
          this.translationLineBaseline = notation.translationText[0].origin.y;
        if (notation.translationText.length > this.numTranslationLines)
          this.numTranslationLines = notation.translationText.length;
      }
    }

    // a line of lyrics that isn't used is drawn on the row of the next one
    this.lyricRows = [];
    for (let j = 0; j < usedLyricLines.length; j++) {
      this.lyricRows.push(this.numLyricLines);
      if (usedLyricLines[j]) this.numLyricLines++;
    }

    if (this.custos) this.notationBounds.union(this.custos.bounds);

    // add any braces to the notationBounds as well
    for (i = 0; i < this.braces.length; i++)
      this.notationBounds.union(this.braces[i].bounds);
    for (i = 0; i < this.slurs.length; i++)
      this.notationBounds.union(this.slurs[i].bounds);
    // and Gregorio's NABC, above and below the staff
    layoutNabcLines(ctxt, this, notations.slice(this.notationsStartIndex, lastNeumeIndex));

    // finalize the lyrics placement
    var notationBoundsOffset =
      this.notationBounds.bottom() +
      ctxt.minSpaceBelowStaff * ctxt.staffInterval;
    this.lyricLineBaseline += notationBoundsOffset;
    this.translationLineBaseline += notationBoundsOffset;
    this.altLineBaseline +=
      this.notationBounds.y - this.altLineHeight - ctxt.staffInterval * 0.5;

    for (i = this.notationsStartIndex; i < lastNeumeIndex; i++) {
      notation = notations[i];
      for (var j = 0; j < notation.lyrics.length; j++)
        notation.lyrics[j].bounds.y = this.lyricRow(j) * this.lyricLineHeight + this.lyricLineBaseline;
      var offset = this.lyricRow(notation.lyrics.length) * this.lyricLineHeight;

      if (notation.translationText) {
        for (j = 0; j < notation.translationText.length; j++) {
          notation.translationText[j].bounds.y =
            offset + this.translationLineBaseline;
          offset += this.translationLineHeight;
        }
      }

      if (notation.alText) {
        offset = 0;
        for (j = 0; j < notation.alText.length; j++) {
          notation.alText[j].bounds.y = offset + this.altLineBaseline;
          offset -= aboveLinesLineHeight;
        }
      }
    }

    this.extraTextOnlyHeight = 0;
    // handle placement of extra TextOnly elements:
    if (ctxt.useExtraTextOnly) {
      var extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex;
      if (this.extraTextOnlyIndex === null) {
        // even if extraTextOnlyIndex is null, there might be extra lines on the last lyric if it is TextOnly:
        let lastNotation = (notations[lastNeumeIndex - 1] || {}) as ChantNotationElement;
        if (lastNotation.constructor === ChantLineBreak)
          lastNotation = (notations[lastNeumeIndex - 2] || {}) as ChantNotationElement;
        if (
          lastNotation.constructor === TextOnly &&
          (lastNotation as TextOnly).lyrics.length === 1 &&
          (lastNotation as TextOnly).lyrics[0].bounds.height > this.lyricLineHeight
        ) {
          this.extraTextOnlyHeight = this.lyricLineHeight;
        }
      } else {
        let lastLyrics = null;
        let xOffset = 0;
        // they go below the last line of the lyrics before them, which may
        // have line breaks or be wrapped
        let lyricLines = this.numLyricLines;
        for (i = this.notationsStartIndex; i < this.extraTextOnlyIndex; i++) {
          notations[i].lyrics.forEach((lyric, j) => {
            if (lyric.text) lyricLines = Math.max(lyricLines, this.lyricRow(j) + lyric.numLines!);
          });
        }
        offset = (lyricLines - 1) * this.lyricLineHeight;
        offset += this.numTranslationLines * this.translationLineHeight;
        let extraLines = lyricLines - this.numLyricLines;
        for (i = this.extraTextOnlyIndex; i < lastIndex; i++) {
          notation = notations[i];
          if (!notation.lyrics[extraTextOnlyLyricIndex]) continue;
          lastLyrics = notation.lyrics[extraTextOnlyLyricIndex];
          if (lastLyrics.lineWidth) {
            xOffset = this.staffRight - lastLyrics.lineWidth;
            offset += this.lyricLineHeight;
            extraLines++;
          }
          extraLines += lastLyrics.numLines! - 1;
          lastLyrics.bounds.y = offset + this.lyricLineBaseline;
          notation.bounds.x += xOffset;
          // what comes after it goes below its last line
          offset += (lastLyrics.numLines! - 1) * this.lyricLineHeight;
        }
        this.extraTextOnlyHeight = this.lyricLineHeight * extraLines;
      }
    }

    if (this.startingClef.hasLyrics()) {
      for (j = 0; j < this.startingClef.lyrics.length; j++)
        this.startingClef.lyrics[j].bounds.y = this.lyricRow(j) * this.lyricLineHeight + this.lyricLineBaseline;
    }

    // dropCap and the annotations (which ChantScore.placeDropCap() places once
    // the lines are laid out, for a drop cap beside more lines than this)
    if (this.isFirstLine) {
      var dropCap = this.score.dropCapOnFirstLine(ctxt) ? this.score.dropCap : null;
      if (this.score.annotation !== null) {
        // annotations use dominant-baseline to align text to the top
        this.score.annotation.bounds.x = this.staffLeft / 2;
        this.score.annotation.bounds.y = -ctxt.staffInterval * (staffLineCount * 2 - 1);
        if (dropCap !== null) {
          this.score.annotation.bounds.y = this.score.annotationTop(ctxt, this.lyricLineBaseline, true);
          if (this.score.annotation.bounds.y < this.notationBounds.y) {
            this.notationBounds.y = this.score.annotation.bounds.y;
            this.notationBounds.height +=
              this.notationBounds.y - this.score.annotation.bounds.y;
          }
        }
        this.score.annotation.bounds.y += this.score.annotation.origin.y;
      }

      if (dropCap !== null) {
        // drop caps and annotations are drawn from their center, so aligning them
        // horizontally is as easy as this.staffLeft / 2
        dropCap.bounds.x = this.staffLeft / 2;
        dropCap.bounds.y = this.lyricLineBaseline - dropCap.origin.y;
        this.notationBounds.union(dropCap.bounds);
        dropCap.bounds.y = this.lyricLineBaseline;
      }
    }

    if (this.numLyricLines > 0) {
      // add up the lyric line heights to get the total height of the chant line
      var lyricAndTextRect = new Rect(
        0,
        notationBoundsOffset,
        0,
        this.lyricLineHeight * this.numLyricLines +
          this.extraTextOnlyHeight +
          this.translationLineHeight * this.numTranslationLines
      );
      this.notationBounds.union(lyricAndTextRect);
    }
    if (this.numAltLines > 0) {
      var altLineTextRect = new Rect(
        0,
        this.notationBounds.y -
          this.altLineHeight -
          0.5 * ctxt.staffInterval -
          aboveLinesLineHeight * (this.numAltLines - 1),
        0,
        aboveLinesLineHeight * this.numAltLines
      );
      this.notationBounds.union(altLineTextRect);
    }
    // Ensure that there is at least minSpaceBelowStaff below the lowest staff line:
    this.notationBounds.union(
      new Rect(
        0,
        -ctxt.staffInterval, // lowest staff line
        0,
        (ctxt.staffLineWeight / 2 + ctxt.minSpaceBelowStaff) *
          ctxt.staffInterval
      )
    );
    // with room for lyrics that protrude past the end of the staff (<pr>)
    for (i = this.notationsStartIndex; i < lastIndex; i++) {
      for (var lyric of notations[i].lyrics) {
        if (lyric && lyric.protrusionWidth)
          this.notationBounds.union(
            new Rect(lyric.getRight(), this.notationBounds.y, 0, 0)
          );
      }
    }
    var totalHeight = this.notationBounds.height;

    this.bounds.x = 0;
    this.bounds.y = this.notationBounds.y;
    this.bounds.width = this.notationBounds.right();
    this.bounds.height = totalHeight;

    // the origin of the chant line's coordinate space is at the center line of the left extremity of the staff
    this.origin = new Point(this.staffLeft, -this.notationBounds.y);
  }

  /**
   * Makes the line, once it's laid out, reach up to top and down to bottom
   * (in its own coordinates), as performLayout() would have for something
   * there, and returns how much taller that makes it above its staff and
   * below it, by which it and the lines below it have to move down.
   */
  reach(top: number, bottom: number) {
    var bounds = this.notationBounds!,
      above = Math.max(0, bounds.y - top),
      below = Math.max(0, bottom - bounds.bottom());
    bounds.union(new Rect(bounds.x, bounds.y - above, 0, bounds.height + above + below));
    this.bounds.height = bounds.height;
    this.origin.y = -bounds.y;
    return { above, below };
  }

  // TODO: remove if not necsessary
  layoutInsertionCursor(ctxt: ChantContext) {
    if (this.insertionCursor) {
      // we have either a Notation to draw the cursor after, or the ChantLine itself when the cursor is the first thing on the line
      this.insertionCursor.performLayout(ctxt);
      this.insertionCursor.bounds.x =
        this.score.insertionElement!.bounds.right() +
        ((this.score.insertionElement!.trailingSpace &&
          this.score.insertionElement!.calculatedTrailingSpace) ||
          0) /
          2 -
        this.insertionCursor.origin.x;
    }
    return this.insertionCursor;
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;

    canvasCtxt.translate(this.bounds.x, this.bounds.y);

    // draw the staff lines
    var i,
      x1 = this.staffLeft,
      x2 = this.staffRight,
      y;
    canvasCtxt.lineWidth = ctxt.staffLineWeight;
    canvasCtxt.strokeStyle = ctxt.staffLineColor;

    for (i = this.score.staffLineCount * -2 + 1; i < 0; i += 2) {
      y = ctxt.staffInterval * i;

      canvasCtxt.beginPath();
      canvasCtxt.moveTo(x1, y);
      canvasCtxt.lineTo(x2, y);
      canvasCtxt.stroke();
    }

    if (this.layoutInsertionCursor(ctxt)) {
      this.insertionCursor!.draw(ctxt);
    }

    // draw the ledger lines
    for (i = 0; i < this.ledgerLines.length; i++) {
      var ledgerLine = this.ledgerLines[i];
      y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);

      canvasCtxt.beginPath();
      canvasCtxt.moveTo(ledgerLine.x1, y);
      canvasCtxt.lineTo(ledgerLine.x2, y);
      canvasCtxt.stroke();
    }

    // draw any braces
    for (i = 0; i < this.braces.length; i++) this.braces[i].draw(ctxt);

    // draw the dropCap and the annotations
    if (this.isFirstLine) {
      if (this.score.dropCap !== null) this.score.dropCap.draw(ctxt);

      if (
        this.score.annotation !== null &&
        (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
        this.score.annotation.draw(ctxt);
    }

    this.startingClef.draw(ctxt);

    // The ending custos is drawn separately, even when it is an explicit notation.
    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    for (i = this.notationsStartIndex; i < lastIndex; i++)
      if (notations[i] !== this.custos) notations[i].draw(ctxt);

    for (i = 0; i < this.slurs.length; i++) this.slurs[i].draw(ctxt);

    if (this.custos) this.custos.draw(ctxt);

    canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
  }

  getInnerNodes(
    ctxt: ChantContext,
    top = 0,
    functionNames: {
      quickSvg: "createNode" | "createSvgTree";
      elements: "createSvgNode" | "createSvgTree";
    } = { quickSvg: "createNode", elements: "createSvgNode" }
  ) {
    var inner: Array<SvgElementWithSource | SvgTreeNode> = [];

    // add the chant lines
    var i,
      x1 = this.staffLeft,
      x2 = this.staffRight;
    const staffSpaces = this.staffSpaces;
    if (ctxt.editable) {
      inner.push(
        (QuickSvg[functionNames.quickSvg] as CreateSvgElement)("rect", {
          key: "insertion",
          x: x1,
          y: ctxt.staffInterval * this.score.staffLineCount * -2 + 1,
          width: x2 - x1,
          height: ctxt.staffInterval * 2 * staffSpaces,
          fill: "none"
        })
      );
    }

    // create the staff lines
    for (i = this.score.staffLineCount * -2 + 1; i < 0; i += 2) {
      inner.push(
        (QuickSvg[functionNames.quickSvg] as CreateSvgElement)("line", {
          key: i,
          x1: x1,
          y1: ctxt.staffInterval * i,
          x2: x2,
          y2: ctxt.staffInterval * i,
          stroke: ctxt.staffLineColor,
          "stroke-width": ctxt.staffLineWeight,
          class: "staffLine"
        })
      );
    }

    inner = [
      (QuickSvg[functionNames.quickSvg] as CreateSvgElement)("g", { class: "staffLines" }, inner)
    ];

    if (this.layoutInsertionCursor(ctxt)) {
      inner.push(this.insertionCursor![functionNames.elements](ctxt) as SvgElementWithSource | SvgTreeNode);
    }

    // create the ledger lines
    for (i = 0; i < this.ledgerLines.length; i++) {
      var ledgerLine = this.ledgerLines[i];
      var y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);

      inner.push(
        (QuickSvg[functionNames.quickSvg] as CreateSvgElement)("line", {
          x1: ledgerLine.x1,
          y1: y,
          x2: ledgerLine.x2,
          y2: y,
          stroke: ctxt.staffLineColor,
          "stroke-width": ctxt.staffLineWeight,
          class: "ledgerLine"
        })
      );
    }

    // add any braces
    for (i = 0; i < this.braces.length; i++)
      inner.push(this.braces[i][functionNames.elements](ctxt) as SvgElementWithSource | SvgTreeNode);
    for (i = 0; i < this.slurs.length; i++)
      inner.push(this.slurs[i][functionNames.elements](ctxt) as SvgElementWithSource | SvgTreeNode);

    // dropCap and the annotations
    if (this.isFirstLine) {
      if (this.score.dropCap !== null)
        inner.push(this.score.dropCap[functionNames.elements](ctxt) as SvgElementWithSource | SvgTreeNode);

      if (
        this.score.annotation !== null &&
        (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
        inner = inner.concat(
          this.score.annotation[functionNames.elements](ctxt)
        );
    }

    inner.push(this.startingClef[functionNames.elements](ctxt) as SvgElementWithSource | SvgTreeNode);

    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // The ending custos is added separately, even when it is an explicit notation.
    for (i = this.notationsStartIndex; i < lastIndex; i++)
      if (notations[i] !== this.custos)
        inner.push(notations[i][functionNames.elements](ctxt) as SvgElementWithSource | SvgTreeNode);

    if (this.custos)
      inner.push(this.custos[functionNames.elements](ctxt) as SvgElementWithSource | SvgTreeNode);
    return inner;
  }

  createSvgNode(ctxt: ChantContext, top = 0) {
    let inner = this.getInnerNodes(ctxt, top, {
      quickSvg: "createNode",
      elements: "createSvgNode"
    });

    return QuickSvg.createNode(
      "g",
      {
        class: "chantLine",
        transform:
          "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
        "element-index": this.elementIndex,
        source: this
      },
      inner as SvgElementWithSource[]
    );
  }

  createSvgTree(ctxt: ChantContext, top = 0) {
    let inner = this.getInnerNodes(ctxt, top, {
      quickSvg: "createSvgTree",
      elements: "createSvgTree"
    });

    return QuickSvg.createSvgTree(
      "g",
      {
        class: "chantLine",
        transform:
          "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
        "element-index": this.elementIndex
      },
      ...(inner as SvgTreeNode[])
    );
  }

  /**
   * The line's svg, starting at top.  With a cacheKey, what goes inside it is
   * kept, and used again while createSvgFragment() is given the same key, so
   * the key has to say everything about the line that its svg shows besides
   * how it's laid out (such as what's selected: see ChantScore.createSvg()).
   * Laying the line out again forgets it.
   */
  createSvgFragment(ctxt: ChantContext, top = 0, cacheKey?: string) {
    var cache = this.svgFragmentCache,
      inner =
        cacheKey !== undefined && cache && cache.key === cacheKey ? cache.inner : this.createInnerSvgFragment(ctxt);
    if (cacheKey !== undefined) this.svgFragmentCache = { key: cacheKey, inner };
    return QuickSvg.createFragment(
      "g",
      {
        class: "chantLine",
        transform:
          "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
        "element-index": this.elementIndex
      },
      inner
    );
  }

  /** what goes inside the line's svg (see createSvgFragment()) */
  createInnerSvgFragment(ctxt: ChantContext) {
    var inner = "";

    // add the chant lines
    var i,
      x1 = this.staffLeft,
      x2 = this.staffRight;

    // create the staff lines
    for (i = this.score.staffLineCount * -2 + 1; i < 0; i += 2) {
      inner += QuickSvg.createFragment("line", {
        x1: x1,
        y1: ctxt.staffInterval * i,
        x2: x2,
        y2: ctxt.staffInterval * i,
        stroke: ctxt.staffLineColor,
        "stroke-width": ctxt.staffLineWeight,
        class: "staffLine"
      });
    }

    inner = QuickSvg.createFragment("g", { class: "staffLines" }, inner);

    if (this.layoutInsertionCursor(ctxt)) {
      inner += this.insertionCursor!.createSvgFragment(ctxt);
    }

    // create the ledger lines
    for (i = 0; i < this.ledgerLines.length; i++) {
      var ledgerLine = this.ledgerLines[i];
      var y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);

      inner += QuickSvg.createFragment("line", {
        x1: ledgerLine.x1,
        y1: y,
        x2: ledgerLine.x2,
        y2: y,
        stroke: ctxt.staffLineColor,
        "stroke-width": ctxt.staffLineWeight,
        class: "ledgerLine"
      });
    }

    // add any braces
    for (i = 0; i < this.braces.length; i++)
      inner += this.braces[i].createSvgFragment(ctxt);
    for (i = 0; i < this.slurs.length; i++)
      inner += this.slurs[i].createSvgFragment(ctxt);

    // dropCap and the annotations
    if (this.isFirstLine) {
      if (this.score.dropCap !== null)
        inner += this.score.dropCap.createSvgFragment(ctxt);

      if (
        this.score.annotation !== null &&
        (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
        inner += this.score.annotation.createSvgFragment(ctxt);
    }

    inner += this.startingClef.createSvgFragment(ctxt);

    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // The ending custos is added separately, even when it is an explicit notation.
    for (i = this.notationsStartIndex; i < lastIndex; i++)
      if (notations[i] !== this.custos)
        inner += notations[i].createSvgFragment(ctxt);

    if (this.custos) inner += this.custos.createSvgFragment(ctxt);

    return inner;
  }

  buildFromChantNotationIndex(
    ctxt: ChantContext,
    newElementStart: number,
    width: number,
    // which of the score's lines this is (see ChantScore.lineExtent()): the
    // first if it starts at the first notation, or else the next one
    lineIndex = newElementStart ? this.score.lines.length : 0
  ) {
    // todo: reset / clear the children we have in case they have data
    var notations = this.score.notations,
      beginningLyrics: Lyric[] | null = null,
      prev: ChantNotationElement | null = null,
      prevNeume: ChantNotationElement | null = null,
      prevLyrics: Lyric[] = [];
    var condensableSpaces = [] as unknown as CondensableSpaces;
    this.notationsStartIndex = newElementStart;
    this.numNotationsOnLine = 0;
    this.clefLineBreak = null;
    delete this.svgFragmentCache;

    this.paddingLeft = 0;

    this.extraTextOnlyIndex = null;
    this.extraTextOnlyLyricIndex = 0;

    // room for a drop cap and/or annotation, if present (and no limit to the
    // staff size with no width)
    var extent = this.score.lineExtent(ctxt, lineIndex, width);
    this.staffLeft = extent.left;
    this.staffRight = extent.right;
    this.textLeft = extent.textLeft;
    this.isFirstLine = lineIndex === 0;

    if (this.isFirstLine) {
      if (this.score.dropCap)
        this.paddingLeft = (this.staffLeft - this.score.dropCap.bounds.width) / 2;
    } else {
      prev = notations[newElementStart - 1];
      beginningLyrics = copyBeginningLyrics(ctxt, prev);
      if (beginningLyrics) {
        // Hide the original lyrics by setting their bounds.y to an extremely high number.
        // If the chant is re-laid out, this value will be recalculated so that it won't stay hidden.
        for (let lyric of prev.lyrics) lyric.bounds.y = Number.MAX_SAFE_INTEGER;
      }
    }

    // set up the clef...
    // if the first notation on the line is a starting clef, then we treat it a little differently...
    // the clef becomes this line's starting clef and we skip over the clef in the notations array
    var startsWithClefChange = !!(notations.length && notations[newElementStart].isClef);
    if (startsWithClefChange) {
      ctxt.activeClef = notations[newElementStart] as Clef;
      newElementStart++;
      this.notationsStartIndex++;

      // the line break just after the clef may have ended the line before
      // already (see clefLineBreak)
      let previousLine = lineIndex > 0 && this.score.lines && this.score.lines[lineIndex - 1];
      if (previousLine && previousLine.clefLineBreak && previousLine.clefLineBreak === notations[newElementStart]) {
        newElementStart++;
        this.notationsStartIndex++;
      }
    }

    // make a copy for this line to use at the beginning
    this.startingClef = ctxt.activeClef.clone();
    this.startingClef.performLayout(ctxt);
    // (a change of clef is drawn even when the clefs at the start of lines aren't)
    if (ctxt.clefVisibility !== "visible" && !startsWithClefChange) this.startingClef.hide(ctxt);
    this.startingClef.bounds.x = this.staffLeft;

    var curr: ChantNotationElement = this.startingClef;

    if (beginningLyrics) {
      LyricArray.setNotation(beginningLyrics, curr);
    }

    // estimate how much space we have available to us
    var rightNotationBoundary =
      this.staffRight - Glyphs.CustosLong.bounds.width * ctxt.glyphScaling; // possible custos on the line
    var lastTranslationTextWithEndNeume: ChantNotationElement | null = null;

    // iterate through the notations, fittng what we can on this line
    var i,
      j,
      lastNotationIndex = notations.length - 1;

    if (curr.hasLyrics()) LyricArray.mergeIn(this.lastLyrics, curr.lyrics);

    // if we already have a start brace on the context, we must be continuing it from the previous system.
    if (ctxt.lastStartBrace && !ctxt.lastStartBrace.note) {
      ctxt.lastStartBrace.note = this.startingClef;
    }
    var lastLyricsBeforeTextOnly: Lyric[] | undefined;
    var textOnlyStartIndex: number | undefined;
    this.furthestLaidOut = newElementStart;

    for (i = newElementStart; i <= lastNotationIndex; i++) {
      // a hidden soft accidental takes no space, so the notation after it is
      // positioned as though it weren't there
      if (!isHiddenAccidental(curr)) {
        prev = curr;
        if (curr.constructor !== TextOnly) prevNeume = curr;
      }

      curr = notations[i];
      if (i > this.furthestLaidOut) this.furthestLaidOut = i;

      // as in Gregorio, a clef just before a line break only goes at the start
      // of the next line, and the custos at the end of this line is worked out
      // from the clef that is in effect on it.  (Not when the clef or the line
      // break has text, which neither line would then draw.)
      if (
        width > 0 &&
        curr.isClef &&
        !curr.hasLyrics() &&
        this.numNotationsOnLine > 0 &&
        i + 1 < lastNotationIndex &&
        notations[i + 1].constructor === ChantLineBreak &&
        !notations[i + 1].hasLyrics()
      ) {
        this.clefLineBreak = notations[i + 1] as ChantLineBreak;
        this.justify =
          this.clefLineBreak.justify ||
          this.extraTextOnlyIndex !== null ||
          this.getWhitespaceOnRight(ctxt) < 0;
        if (this.justify) this.findNeumesToJustify(prevLyrics);
        break;
      }

      resetNotation(ctxt, curr);
      this.repeatVerseNumbers(ctxt, i);

      if (curr.isAccidental && (curr as Accidental).soft)
        (curr as Accidental).setHidden(ctxt, !this.isSoftAccidentalVisible(i));
      else if (curr.isNeume) this.spaceNeumeBeforeSoftAccidental(ctxt, i);

      var actualRightBoundary;
      if (
        i === lastNotationIndex ||
        curr.constructor === Custos ||
        (prev!.constructor === Custos && curr.isDivider) ||
        (curr.constructor === ChantLineBreak &&
          prevNeume!.constructor === Custos)
      ) {
        // on the last notation of the score, we don't need a custos or trailing space, so we use staffRight as the
        // right boundary.
        // Also, if the current notation is a divider and the previous was a custos, we don't need extra space
        // because if the following notation won't fit, we can switch the order and use the custos as the end-of-the-line custos
        // Ditto in the case of the current element being a chant line break and the previous neume a custos, because that custos will become our end-of-line custos
        actualRightBoundary = this.staffRight;
      } else if (i === lastNotationIndex - 1) {
        // on the penultimate notation, make sure there is at least enough room for whichever takes up less space,
        // between the final notation and a custos:
        actualRightBoundary = Math.max(
          rightNotationBoundary,
          this.staffRight - notations[lastNotationIndex].bounds.width
        );
      } else {
        // Otherwise, we use rightNotationBoundary, which leaves room for a custos...
        actualRightBoundary = rightNotationBoundary;
      }
      // (a line planned by the optimal line breaker takes everything up to
      // where it was planned to end, and ends there)
      var planned = this.plannedEnd !== undefined && i < this.plannedEnd;
      if (planned) actualRightBoundary = Infinity;

      // First check if we're already beyond the rightNotationBoundary (due to condensing that hasn't yet happened) and have a good element to end with
      // but if we have 2 or fewer elements, or if the current element is a line break or a custos, we'll go ahead and try for them anyway.
      var forceBreak =
        !planned &&
        !curr.isDivider &&
        curr.constructor !== ChantLineBreak &&
        curr.constructor !== Custos &&
        !(
          curr.constructor === TextOnly &&
          (curr as TextOnly).hasLyrics() &&
          /^(?:[*†]|i+j\.?)$/.test((curr as TextOnly).lyrics[0].text)
        ) &&
        lastNotationIndex - i > 1 &&
        !prevNeume!.keepWithNext &&
        prevNeume!.bounds.right() >= rightNotationBoundary;

      // also force a break if we've run into extra TextOnly elements, but the current notation is not a TextOnly and has lyrics
      forceBreak =
        forceBreak ||
        this.plannedEnd === i ||
        (this.extraTextOnlyIndex !== null &&
          curr.constructor !== TextOnly &&
          curr.constructor !== ChantLineBreak &&
          curr.constructor !== Custos &&
          curr.hasLyrics());

      if (curr instanceof TextOnly && prev === prevNeume) {
        lastLyricsBeforeTextOnly = this.lastLyrics.slice();
        textOnlyStartIndex = i;
      }
      if (
        curr instanceof TextOnly &&
        notations[textOnlyStartIndex!] &&
        !notations[textOnlyStartIndex!].hasLyrics()
      ) {
        // we want textOnlyStartIndex to be the first TextOnly that actually has lyrics,
        // so if the current "textOnlyStart" element does not have lyrics, and we have another textOnly
        // that does have lyrics, we will use it instead
        textOnlyStartIndex = i;
      }

      // try to fit the curr element on this line.
      // if it doesn't fit, we finish up here.
      var fitsOnLine;
      if (isHiddenAccidental(curr) && this.plannedEnd !== i) {
        // it will be moved to the notation that follows it in alignHiddenAccidentals()
        curr.bounds.x = prevNeume!.bounds.right() + prevNeume!.calculatedTrailingSpace;
        fitsOnLine = true;
      } else {
        fitsOnLine =
          !forceBreak &&
          this.positionNotationElement(
            ctxt,
            this.lastLyrics,
            prevNeume!,
            curr,
            actualRightBoundary,
            this.extraTextOnlyIndex ? ([] as unknown as CondensableSpaces) : condensableSpaces // no spaces are condensable once we are on extra text only lyrics
          );
      }
      var candidateForExtraTextOnlyLine =
        ctxt.useExtraTextOnly &&
        this.plannedEnd === undefined &&
        curr.constructor === TextOnly &&
        LyricArray.hasOnlyOneLyric((curr as TextOnly).lyrics) &&
        (fitsOnLine === false || this.extraTextOnlyIndex !== null);
      var extraTextOnlyLyricIndex;
      if (candidateForExtraTextOnlyLine && this.extraTextOnlyIndex === null) {
        // check to make sure there is enough text to put on the text only line:
        extraTextOnlyLyricIndex = LyricArray.indexOfLyric(curr.lyrics);
        if (textOnlyStartIndex === i) {
          var currentLyric = notations[i].lyrics[extraTextOnlyLyricIndex].text;
          if (currentLyric.length <= 1) {
            var nextNotation = notations[i + 1];
            candidateForExtraTextOnlyLine =
              nextNotation &&
              nextNotation.constructor === TextOnly &&
              (nextNotation as TextOnly).lyrics[extraTextOnlyLyricIndex] &&
              (nextNotation as TextOnly).lyrics[extraTextOnlyLyricIndex].text.length > 0;
          }
        }
      }
      if (candidateForExtraTextOnlyLine) {
        // a special case for TextOnly elements that don't fit on the line: since they don't have neumes associated with them, we can place this
        // and any additional TextOnly elements just below the current lyric lines, but we can only do this if the TextOnly elements have only one
        // line of lyrics associated with them.
        var firstOnLine;
        extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex;
        if (
          this.extraTextOnlyIndex === null &&
          notations[textOnlyStartIndex!].lyrics.length
        ) {
          if (
            textOnlyStartIndex === this.notationsStartIndex ||
            !ctxt.startExtraTextOnlyFromFirst
          ) {
            textOnlyStartIndex = i;
            let lastNotationWithLyrics;
            for (let k = i - 1; k >= this.notationsStartIndex; k--) {
              if (notations[k].hasLyrics()) {
                lastNotationWithLyrics = notations[k];
                break;
              }
            }
            lastLyricsBeforeTextOnly =
              (lastNotationWithLyrics &&
                lastNotationWithLyrics.lyrics.slice()) ||
              [];
          }
          // go back to the first in this string of consecutive TextOnly elements.
          this.extraTextOnlyIndex = textOnlyStartIndex!;
          extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex = LyricArray.indexOfLyric(
            curr.lyrics
          );
          this.lastLyricsBeforeTextOnly = lastLyricsBeforeTextOnly;
          this.lastLyrics = [];
          i = textOnlyStartIndex! - 1;
          this.numNotationsOnLine =
            textOnlyStartIndex! - this.notationsStartIndex;
          continue;
        }
        delete curr.lyrics[extraTextOnlyLyricIndex].lineWidth;
        if (!fitsOnLine || i === this.extraTextOnlyIndex) {
          curr.bounds.x = this.textLeft + curr.lyrics[extraTextOnlyLyricIndex].origin.x;
          let lastLyricRight = ctxt.startExtraTextOnlyFromFirst
            ? LyricArray.getRight(this.lastLyrics) +
              (ctxt.minLyricWordSpacing || 0)
            : this.textLeft;
          curr.lyrics[extraTextOnlyLyricIndex].setMaxWidth(
            ctxt,
            this.staffRight - this.textLeft,
            this.staffRight - lastLyricRight
          );
          firstOnLine = curr;
        }
        if (firstOnLine)
          firstOnLine.lyrics[extraTextOnlyLyricIndex].lineWidth = curr.lyrics[
            extraTextOnlyLyricIndex
          ].getRight();
      } else if (fitsOnLine === false) {
        // first check for elements that cannot begin a system: dividers and custodes
        while (
          this.plannedEnd !== i &&
          this.numNotationsOnLine > 1 &&
          (curr.isDivider || curr.constructor === Custos || isTextOnlyBeforeDivider(notations, i))
        ) {
          curr = notations[--i];
          this.numNotationsOnLine--;
          if (this.lastLyricsBeforeTextOnly && isTextOnlyBeforeDivider(notations, i)) {
            delete this.lastLyricsBeforeTextOnly;
          }
        }

        if (lastTranslationTextWithEndNeume) {
          // console.info(notations[i - 1], lastTranslationTextWithEndNeume);
          // TODO?: need to go back to before the last translation text start:
        }

        // count syllables and notes; the counts only ever grow, and only matter while both are below
        // their minimums, so we can stop counting once either one reaches its minimum
        let countSyllables = 0;
        let countNotes = 0;
        if (ctxt.minSyllablesLastLine && ctxt.minNotesLastLine) {
          for (
            let k = i + 1;
            k < notations.length &&
            countSyllables < ctxt.minSyllablesLastLine &&
            countNotes < ctxt.minNotesLastLine;
            k++
          ) {
            const notation = notations[k];
            if (notation.hasLyrics()) countSyllables++;
            if (notation.notes) {
              for (let l = 0; l < notation.notes.length; l++) {
                if (notation.notes[l]) countNotes++;
              }
            }
          }
        }

        // check if the prev elements want to be kept with this one
        var breakInArea: number | undefined;
        for (j = i - 1; j > this.notationsStartIndex && this.plannedEnd !== i; j--) {
          var cne = notations[j];
          curr = notations[j + 1];

          // curr is the first notation on the next line
          // cne is the last notation on this line
          if (ctxt.minSyllablesLastLine && ctxt.minNotesLastLine) {
            countSyllables += curr.hasLyrics() ? 1 : 0;
            countNotes += (curr.notes || []).length;
          }

          if (cne.firstWithNoWidth) {
            this.numNotationsOnLine--;
            continue;
          }

          // don't let a line break occur in the middle of a translation
          if (lastTranslationTextWithEndNeume) {
            this.numNotationsOnLine--;
            if (cne === lastTranslationTextWithEndNeume) {
              lastTranslationTextWithEndNeume = null;
            }
            continue;
          }

          // force any notations starting with a quilisma or inclinatum (diamond) to be kept with the previous notation:
          if (
            curr &&
            curr.notes &&
            (curr.notes[0].shape === NoteShape.Quilisma ||
              curr.notes[0].shape === NoteShape.Inclinatum)
          ) {
            this.numNotationsOnLine--;
            continue;
          }

          if (countSyllables < ctxt.minSyllablesLastLine && countNotes < ctxt.minNotesLastLine) {
            this.numNotationsOnLine--;
            continue;
          }

          // if the line break is allowed (cne.allowLineBreakBeforeNext), keep this number of notations around so we can check during justification
          // whether there would be too much space introduced between
          if (cne.keepWithNext === true) {
            if (cne.allowLineBreakBeforeNext && !this.maxNumNotationsOnLine && !this.keepsInArea(j))
              this.maxNumNotationsOnLine = this.numNotationsOnLine;
            this.numNotationsOnLine--;
          } else if (this.keepsInArea(j)) {
            // no line break in a Gregorio no-line-break or euouae area, unless
            // the line can't break anywhere else (see just below)
            if (breakInArea === undefined) breakInArea = this.numNotationsOnLine;
            this.numNotationsOnLine--;
          } else break;
        }
        // (an area too long for the line has to break after all)
        if (j === this.notationsStartIndex && breakInArea !== undefined)
          this.numNotationsOnLine = breakInArea;
        if (this.extraTextOnlyIndex && (this.notationsStartIndex + this.numNotationsOnLine) <= this.extraTextOnlyIndex) {
          // we've cut back to before the extra text only index, so we have to remove it:
          this.extraTextOnlyIndex = null;
        }

        // if for some reason not a single notation can fit on the line, we'd better put it on anyway, to avoid an infinite loop:
        if (this.numNotationsOnLine === 0) this.numNotationsOnLine = 1;

        // determine the neumes we can space apart, if we do end up justifying
        curr = this.findNeumesToJustify(prevLyrics)!;

        this.lastLyrics = prevLyrics;
        if (this.maxNumNotationsOnLine) {
          // Check whether we should squeeze some extra notations on the line to avoid too much space after justification:
          // Check how much space we would have without the extra notations
          var extraSpace = this.getWhitespaceOnRight(ctxt);
          if (
            extraSpace / this.toJustify!.length >
            ctxt.staffInterval * ctxt.maxExtraSpaceInStaffIntervals
          ) {
            LyricArray.mergeInArray(
              prevLyrics,
              notations.slice(
                this.notationsStartIndex + this.numNotationsOnLine,
                this.notationsStartIndex + this.maxNumNotationsOnLine
              )
            );
            this.numNotationsOnLine = this.maxNumNotationsOnLine;
            delete this.maxNumNotationsOnLine;
          }
        }

        // if the next line begins with a fresh word, than there can be extra space between the last notation on this line and the custos:
        let next = this.score.notations[
          this.extraTextOnlyIndex === null
            ? this.notationsStartIndex + this.numNotationsOnLine
            : this.extraTextOnlyIndex
        ];
        if (
          next &&
          next.hasLyrics() &&
          (next.lyrics[0].lyricType === LyricType.BeginningSyllable ||
            next.lyrics[0].lyricType === LyricType.SingleSyllable) &&
          (this.custos || this.wantsEolCustos(ctxt))
        ) {
          this.toJustify!.push(this.custos);
        }

        // (only where the custos is on this line too, and not the end of the line before)
        if (
          j - 1 >= this.notationsStartIndex &&
          notations[j].isDivider &&
          notations[j - 1].constructor === Custos
        ) {
          // reverse the order: put the divider first, and end the line with the custos.
          // (a custos that starts the line puts the divider after the clef)
          let prevOnLine = j - 2 >= this.notationsStartIndex ? notations[j - 2] : this.startingClef;
          prevLyrics = [];
          for (i = j - 2; i >= this.notationsStartIndex; i--) {
            if (notations[i].hasLyrics()) {
              LyricArray.mergeIn(prevLyrics, notations[i].lyrics);
              break;
            }
          }
          // (the lyrics a line can start with are on its clef)
          if (i < this.notationsStartIndex && this.startingClef.hasLyrics())
            LyricArray.mergeIn(prevLyrics, this.startingClef.lyrics);
          // remove the custos and divider from the condensable spaces list, before adding the divider back, when repositioning it.
          condensableSpaces.sum -= condensableSpaces.pop()!.condensable;
          condensableSpaces.sum -= condensableSpaces.pop()!.condensable;
          this.positionNotationElement(
            ctxt,
            prevLyrics,
            prevOnLine,
            notations[j],
            this.staffRight,
            condensableSpaces
          );
          this.custos = notations[j - 1] as Custos;
          this.custos.bounds.x =
            this.staffRight -
            this.custos.bounds.width -
            this.custos.leadingSpace;
        }

        // we are at the end of the line!
        break;
      }

      if (curr.hasLyrics()) LyricArray.mergeIn(this.lastLyrics, curr.lyrics);

      if (
        lastTranslationTextWithEndNeume &&
        curr === lastTranslationTextWithEndNeume.translationText![0].endNeume
      ) {
        lastTranslationTextWithEndNeume = null;
      } else if (
        curr.translationText &&
        curr.translationText.length &&
        curr.translationText[0].endNeume
      ) {
        lastTranslationTextWithEndNeume = curr;
      }

      curr.line = this;
      this.numNotationsOnLine++;

      if (curr.isClef) ctxt.activeClef = curr as Clef;

      // line breaks are a special case indicating to stop processing here
      if (curr.constructor === ChantLineBreak && width > 0) {
        this.justify =
          (curr as ChantLineBreak).justify ||
          this.extraTextOnlyIndex !== null ||
          this.getWhitespaceOnRight(ctxt) < 0;
        if (this.justify) this.findNeumesToJustify(prevLyrics);
        break;
      }

      if (curr.constructor === Custos) {
        this.custos = curr;
      } else if (curr.isNeume) {
        this.custos = null;
      }
    }

    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine - 1;
    var last = notations[lastIndex] || {};
    while (
      lastIndex > 0 &&
      (last.constructor === ChantLineBreak ||
        last.constructor === Custos ||
        last.constructor === TextOnly)
    ) {
      last = notations[--lastIndex];
    }
    var isLastLine =
      this.notationsStartIndex + this.numNotationsOnLine === notations.length;
    if (
      (this.justify && this.extraTextOnlyIndex !== null) ||
      (width > 0 && isLastLine)
    ) {
      // this is the last chant line, or it has extra TextOnly elements at the end
      if (!this.toJustify) this.findNeumesToJustify(prevLyrics);
      this.justify =
        (!isLastLine || last.isDivider) &&
        this.getWhitespaceOnRight(ctxt) / (this.toJustify!.length || 1) <=
          ctxt.staffInterval * ctxt.maxExtraSpaceInStaffIntervals;
    }

    if (!this.custos && this.wantsEolCustos(ctxt)) {
      // create the automatic custos at the end of the line if there are neumes left in the notations
      for (
        i = this.notationsStartIndex + this.numNotationsOnLine;
        i < notations.length;
        i++
      ) {
        var notation = notations[i];

        if (notation.isNeume) {
          this.custos = new Custos(true);
          ctxt.currNotationIndex = i - 1; // make sure the context knows where the custos is
          this.custos.performLayout(ctxt);

          if (this.justify) {
            // Put the custos at the very end of the line
            this.custos.bounds.x =
              this.staffRight -
              this.custos.bounds.width -
              this.custos.leadingSpace;
          } else {
            this.custos.bounds.x =
              this.notationRight(prevNeume!) + prevNeume!.calculatedTrailingSpace;
          }
          // nothing more to see here...
          break;
        }
      }
    }

    if (this.lastLyricsBeforeTextOnly) {
      this.lastLyrics = this.lastLyricsBeforeTextOnly;
      delete this.lastLyricsBeforeTextOnly;
    }

    // find the final lyric and mark it as connecting if needed.
    if (width > 0) {
      var whitespace = this.getWhitespaceOnRight();
      var rightEdge = this.staffRight;
      if (whitespace < 0) {
        rightEdge -= whitespace;
      }
    }
    i = 0;
    while (this.lastLyrics && this.lastLyrics[i]) {
      let lyrics = this.lastLyrics[i];
      if (lyrics.allowsConnector()) {
        lyrics.setNeedsConnector(true, 0);
        if (width > 0 && ctxt.minLyricWordSpacing < ctxt.hyphenWidth) {
          whitespace = rightEdge! - lyrics.getRight();
          // shrink the hyphen if we are already out of whitespace or if we would be if we used a regular hyphen:
          if (whitespace < 0) {
            var minHyphenWidth = Math.max(
              ctxt.hyphenWidth + whitespace,
              this.lastLyrics.length > 1
                ? ctxt.intraNeumeSpacing
                : ctxt.minLyricWordSpacing
            );
            // we might not need to shift the syllable, but we do want to shrink the hyphen...
            lyrics.setConnectorWidth(minHyphenWidth);
          }
        }
      }
      ++i;
    }

    // if the provided width is less than zero, then set the width of the line
    // based on the last notation
    if (width <= 0) {
      const lastNotation = notations[
        this.notationsStartIndex + this.numNotationsOnLine - 1
      ];
      if (lastNotation) {
        this.staffRight = lastNotation.bounds.right();
      }
      this.justify = false;
    }

    // Justify the line if we need to
    this.justifyElements(ctxt, this.justify, condensableSpaces);

    this.alignHiddenAccidentals();

    this.centerDividers();

    if (width > 0 && isLastLine && this.score.extendLastSystemStaffLines !== true) {
      // set the staff lines to only extend to the last element
      const lastNotation = notations[
        this.notationsStartIndex + this.numNotationsOnLine - 1
      ];
      if (lastNotation) {
        this.staffRight = lastNotation.bounds.right();
      }
    }

    this.finishLayout(ctxt);
  }

  /**
   * The index after the last of the score's notations that
   * buildFromChantNotationIndex() could have read to lay the line out, so
   * that it would lay it out the same again while they're the same (see
   * ChantScore.reusableLines()): as many past the furthest that it laid out
   * as LineBreaker's readTo() reads (for a soft accidental, a clef and line
   * break, or the end of the score), and on through the text only notations
   * after that (see isTextOnlyBeforeDivider()), to the neume that the custos
   * at the end of the line is for (see wantsEolCustos() and
   * ChantContext.findNextNeume()), and through the syllables and notes that
   * ctxt.minSyllablesLastLine and ctxt.minNotesLastLine count, from there
   * (which counts more of them than it did, if it counted from further back).
   */
  readEnd(ctxt: ChantContext) {
    var notations = this.score.notations,
      count = notations.length,
      furthest = this.furthestLaidOut!,
      // (as readTo() in Exsurge.Chant.LineBreaking)
      end = Math.min(count, furthest + 3),
      k = furthest + 1;
    while (k < count && notations[k].constructor === TextOnly) k++;
    end = Math.max(end, Math.min(count, k + 1));
    k = this.notationsStartIndex + this.numNotationsOnLine;
    while (k < count && !(notations[k].isNeume && !notations[k].hasNoWidth)) k++;
    end = Math.max(end, Math.min(count, k + 1));
    if (ctxt.minSyllablesLastLine && ctxt.minNotesLastLine) {
      let syllables = 0,
        notes = 0;
      for (
        k = furthest + 1;
        k < count && syllables < ctxt.minSyllablesLastLine && notes < ctxt.minNotesLastLine;
        k++
      ) {
        if (notations[k].hasLyrics()) syllables++;
        notes += (notations[k].notes || []).length;
      }
      end = Math.max(end, k);
    }
    return end;
  }

  centerDividers() {
    var lastIndex =
        this.extraTextOnlyIndex === null
          ? this.notationsStartIndex + this.numNotationsOnLine
          : this.extraTextOnlyIndex,
      curr;
    for (var i = this.notationsStartIndex; i < lastIndex; i++) {
      curr = this.score.notations[i];

      if (curr && curr.isDivider) {
        var j = 1;
        // (the clef at the start of the line, rather than the change of clef
        // before it, which the line draws a copy of)
        var prev = i > this.notationsStartIndex ? this.score.notations[i - 1] : this.startingClef;
        var next =
          i + 1 === lastIndex ? this.custos : this.score.notations[i + 1];
        if (prev === next && next === this.custos) {
          prev = i - 2 >= this.notationsStartIndex ? this.score.notations[i - 2] : this.startingClef;
          // force custos to right edge in this case, since it is a custos that exists
          // regardless of line break, and would normally be before the double bar, but in this case it ends the line:
          next.bounds.x = this.staffRight - next.bounds.width;
        }
        if (prev && next) {
          //if (prev instanceof TextOnly || next instanceof TextOnly) continue;
          var oldBoundsX = curr.bounds.x;
          var barWidth = curr.bounds.width;
          var leftPoint =
              prev instanceof TextOnly && prev.hasLyrics()
                ? prev.lyrics[0].getRight()
                : prev.bounds.right(),
            rightPoint =
              next instanceof TextOnly && next.hasLyrics()
                ? next.lyrics[0].getLeft()
                : next.bounds.x;
          if (prev instanceof TextOnly) {
            let prev;
            for (let k = i - 1; k >= this.notationsStartIndex; k--) {
              if (!(this.score.notations[k] instanceof TextOnly)) {
                prev = this.score.notations[k];
                break;
              }
            }
            leftPoint = prev ? prev.bounds.right() : 0;
          }
          if (next instanceof TextOnly) {
            // a TextOnly's lyric is under the staff, and can start under the bar (as
            // Ant. does in "(::) Ant.() (f+)"), so the bar is centered before the next
            // notation on the staff, if the text doesn't push that along (as it does a
            // neume with lyrics, or a bar, which is centered in its turn).  Otherwise
            // it's centered before the text if that starts after it, or left where it is.
            let next,
              end = this.notationsStartIndex + this.numNotationsOnLine;
            for (let k = i + 1; k < end; k++) {
              let notation = this.score.notations[k];
              if (!(notation instanceof TextOnly) && !(notation instanceof ChantLineBreak)) {
                next = notation;
                break;
              }
            }
            next = next || this.custos;
            if (next && !next.isDivider && !next.hasLyrics()) rightPoint = next.bounds.x;
            else if (rightPoint < curr.bounds.right()) rightPoint = 0;
          }
          if (leftPoint && rightPoint) {
            curr.bounds.x = (leftPoint + rightPoint - barWidth) / 2;
          }
          if (curr.hasLyrics()) {
            var offset = oldBoundsX - curr.bounds.x;
            for (j = curr.lyrics.length - 1; j >= 0; j--) {
              curr.lyrics[j].bounds.x += offset;
              curr.lyrics[j].needsLayout = true;
            }
          }
        } else if (
          i === lastIndex - 1 &&
          this.justify &&
          (curr.constructor === DoubleBar || curr.constructor === FullBar)
        ) {
          (curr as ChantNotationElement).bounds.x =
            this.staffRight - (curr as ChantNotationElement).bounds.width;
        }
      }
    }
  }

  // Soft accidentals (gabc X, Y, and ##) follow Gregorio's default
  // \gresetalterationeffect{line}: an accidental, printed or not, stays in effect on
  // its staff position until the end of the line (as in Dominican chant books) or
  // until another accidental there replaces it. A soft flat or sharp is printed only
  // when it isn't already in effect, and a soft natural only when a flat or sharp is.
  // A clef's flat counts as in effect from the clef onward.
  isSoftAccidentalVisible(index: number) {
    var notations = this.score.notations;
    var accidental = notations[index] as Accidental;
    var clef = this.startingClef;
    var inEffect: AccidentalType | null = null;

    for (var i = index - 1; i >= this.notationsStartIndex; i--) {
      var notation = notations[i];
      if (
        notation.isAccidental &&
        (notation as Accidental).staffPosition === accidental.staffPosition
      ) {
        inEffect = (notation as Accidental).accidentalType;
        break;
      }
      if (notation.isClef) {
        clef = notation as Clef;
        break;
      }
    }

    if (
      inEffect === null &&
      clef.defaultAccidental &&
      clef.defaultAccidental.staffPosition === accidental.staffPosition
    )
      inEffect = clef.defaultAccidental.accidentalType;

    if (accidental.accidentalType === AccidentalType.Natural)
      return inEffect !== null && inEffect !== AccidentalType.Natural;

    return inEffect !== accidental.accidentalType;
  }

  // A soft accidental in the middle of a run of notes (as in "hgfgXgh") splits
  // the run into separate neumes. When it isn't printed, the neume before it is
  // spaced as though the run had simply been split there (see createNeume in
  // Gabc.createNeumesFromNotes) rather than as a neume before an accidental.
  // This is decided before that neume is positioned, since it changes its spacing.
  spaceNeumeBeforeSoftAccidental(ctxt: ChantContext, index: number) {
    var notations = this.score.notations;
    var neume = notations[index];
    var accidental = notations[index + 1] as Accidental | undefined;
    var next = notations[index + 2];
    if (
      !accidental ||
      !accidental.soft ||
      accidental.firstOfParentheses ||
      !next ||
      !next.isNeume ||
      next.firstOfParentheses ||
      !(neume.trailingSpace as TrailingSpaceFunction).isDefault
    )
      return;

    accidental.setHidden(ctxt, !this.isSoftAccidentalVisible(index + 1));

    neume.keepWithNext = accidental.hidden;
    neume.allowLineBreakBeforeNext = false;
    if (accidental.hidden) {
      var splitSpace = 0;
      if (next.notes![0].shape !== NoteShape.Quilisma) {
        splitSpace = ctxt.intraNeumeSpacing;
        neume.allowLineBreakBeforeNext = true;
      }
      // The neume's trailing space may have been adjusted in its layout (e.g.,
      // for a mora), so it is shifted rather than replaced.  (resetNotation()
      // has put it back as the layout left it, before the neume's line.)
      neume.calculatedTrailingSpace +=
        splitSpace - (neume.trailingSpace as TrailingSpaceFunction)(ctxt);
    }
  }

  // keep each hidden accidental at the position of the notation that follows it
  alignHiddenAccidentals() {
    var notations = this.score.notations;
    var next = null;

    for (
      var i = this.notationsStartIndex + this.numNotationsOnLine - 1;
      i >= this.notationsStartIndex;
      i--
    ) {
      var notation = notations[i];
      if (!isHiddenAccidental(notation)) next = notation;
      else if (next) notation.bounds.x = next.bounds.x;
    }
  }

  findNeumesToJustify(prevLyrics: Lyric[]) {
    this.toJustify = [];
    var prev,
      curr = null,
      next = null,
      nextOrCurr = null,
      lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
    for (var i = this.notationsStartIndex; i < lastIndex; i++) {
      prev = nextOrCurr;
      curr = this.score.notations[i];
      next = curr.isAccidental && this.score.notations[++i];
      nextOrCurr = next || curr;

      if (!curr || !prev) continue;

      if (
        this.extraTextOnlyIndex !== null &&
        i >= this.extraTextOnlyIndex &&
        curr.constructor === TextOnly
      )
        continue;

      LyricArray.mergeIn(prevLyrics, prev.lyrics);
      if (!this.canJustifyBefore(prev, curr, nextOrCurr, i, prevLyrics)) continue;

      if (nextOrCurr === this.custos && !nextOrCurr.hasLyrics()) continue;

      // otherwise, we can add space before this element
      this.toJustify.push(curr);
    }
    if (nextOrCurr !== null) LyricArray.mergeIn(prevLyrics, nextOrCurr.lyrics);
    return nextOrCurr;
  }

  /**
   * whether justifying the line can add space before curr, which follows
   * prev, as findNeumesToJustify() works it out: nextOrCurr is the notation
   * at index, which is curr, or the one after it if curr is an accidental,
   * and prevLyrics are the last lyrics before it.  (Space isn't added before
   * the line's custos either, unless it has lyrics.)
   */
  canJustifyBefore(
    prev: ChantNotationElement,
    curr: ChantNotationElement,
    nextOrCurr: ChantNotationElement,
    index: number,
    prevLyrics: Lyric[]
  ) {
    if (prev.keepWithNext === true) return false;

    var hasLyrics = nextOrCurr.hasLyrics();
    if (
      !curr.isDivider &&
      prevLyrics.length &&
      prevLyrics[0].allowsConnector() &&
      hasLyrics
    )
      return false;

    if (nextOrCurr.constructor === ChantLineBreak) return false;

    if (index === 0 && this.score.useDropCap && hasLyrics) return false;

    return true;
  }

  getWhitespaceOnRight(ctxt?: ChantContext) {
    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
    var last = notations[lastIndex - 1];
    if (this.extraTextOnlyIndex !== null && last.constructor === TextOnly) {
      lastIndex = this.extraTextOnlyIndex;
      last = notations[lastIndex - 1];
    }
    var lastRightNeume = last
      ? this.notationRight(last) + last.calculatedTrailingSpace
      : 0;
    var lastLyrics = this.lastLyricsBeforeTextOnly || this.lastLyrics;
    // (a lyric's protrusion may go past the end of the staff)
    var lastRightLyric = lastLyrics.length
      ? LyricArray.getRight(lastLyrics, false, true)
      : 0;

    if (this.custos) {
      lastRightNeume += this.custos.bounds.width + this.custos.leadingSpace;
      if (this.custos.hasLyrics()) {
        lastRightLyric = LyricArray.getRight(this.custos.lyrics, false, true);
      }
    } else if (ctxt && lastIndex < notations.length && this.wantsEolCustos(ctxt)) {
      lastRightNeume += Glyphs.CustosLong.bounds.width * ctxt.glyphScaling;
    }
    return this.staffRight - Math.max(lastRightLyric, lastRightNeume);
  }

  /**
   * How far right a notation on the line goes: its notes, or Gregorio's
   * NABC, which widens its syllable, on it and on the notations before it in
   * its syllable (and for one without notes, in the syllable of the last
   * with notes before it, which it's placed after).  Line layout measures a
   * notation by this rather than by its bounds.
   */
  notationRight(notation: ChantNotationElement) {
    let notations = this.score.notations;
    let index = notation.notationIndex!;
    // (the clef at the start of the line isn't one of them)
    if (notations[index] !== notation) return notation.bounds.right();
    let stop = index;
    while (stop > this.notationsStartIndex && notations[stop].constructor === TextOnly) stop--;
    return Math.max(notation.bounds.right(), nabcRight(this, index, stop));
  }

  /**
   * whether a Gregorio no-line-break or euouae area (gabc <nlba> or <eu>)
   * keeps the score's notation at index on the same line as the one after it
   */
  keepsInArea(index: number) {
    var score = this.score;
    if (!score.keptInAreas) {
      // (worked out once for each layout of the score)
      var inside = { noLineBreak: false, euouae: false };
      score.keptInAreas = score.notations.map((notation) => {
        var kept = false;
        for (const area of ["noLineBreak", "euouae"] as const) {
          var boundary = notation[area];
          if (boundary && boundary.start) inside[area] = true;
          // (the line can break after the end of an area)
          if (inside[area] && !(boundary && boundary.end)) kept = true;
          if (boundary && boundary.end) inside[area] = false;
        }
        return kept;
      });
    }
    return score.keptInAreas[index];
  }

  /**
   * whether the line, ending where it does now, gets an automatic custos (see
   * eolCustos())
   */
  wantsEolCustos(ctxt: ChantContext) {
    var custos = this.eolCustos(ctxt);
    return (
      custos === "always" ||
      (custos === "allowed" &&
        allowsCustosBefore(this.score.notations, this.notationsStartIndex + this.numNotationsOnLine))
    );
  }

  /**
   * whether the line, ending where it does now, gets an automatic custos:
   * "always" or "never" as the line break that ends it says (gabc z+ or z-);
   * or else "never" if a [nocustos] is on the last note before the end of the
   * line or ctxt.eolCustos is "manual"; or else "allowed", if the notations
   * after the line allow it (see allowsCustosBefore())
   */
  eolCustos(ctxt: ChantContext): "always" | "never" | "allowed" {
    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine - 1;
    var last = this.clefLineBreak || notations[lastIndex];
    if (last && last.constructor === ChantLineBreak) {
      if ((last as ChantLineBreak).custos === "force") return "always";
      if ((last as ChantLineBreak).custos === "none") return "never";
    }

    for (var i = lastIndex; i >= this.notationsStartIndex; i--) {
      if (notations[i].isNeume) {
        var notes = notations[i].notes!;
        if (notes[notes.length - 1].noCustos) return "never";
        break;
      }
    }

    return ctxt.eolCustos === "manual" ? "never" : "allowed";
  }

  justifyElements(
    ctxt: ChantContext,
    doJustify: boolean | undefined,
    condensableSpaces: CondensableSpaces
  ) {
    var i;
    var toJustify: Array<ChantNotationElement | null | CondensableSpace> =
      this.toJustify || [];
    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // if it wasn't an ideal line break, and the last note is further from the custos than it would have been from its next punctum,
    // move the custos over.
    // We do this first so that if it opens up any new whitespace, that gets accounted for when we do the justification
    var lastNotation =
      notations[this.notationsStartIndex + this.numNotationsOnLine - 1];
    // (false or null when there isn't one)
    var extraSpaceBeforeCustos = (this.staffRight < Infinity &&
      this.custos &&
      lastNotation.keepWithNext &&
      this.custos.bounds.x -
        this.notationRight(lastNotation) -
        lastNotation.calculatedTrailingSpace) as number;
    if (extraSpaceBeforeCustos > 0) {
      // first, shrink the hyphen(s) if applicable, to move the neumes closer to the custos:
      i = 0;
      while (this.lastLyrics && this.lastLyrics[i]) {
        let lyrics = this.lastLyrics[i];
        if (lyrics.allowsConnector()) {
          var connectorWidth = lyrics.getConnectorWidth();
          if (ctxt.minLyricWordSpacing < connectorWidth) {
            var minHyphenWidth = Math.max(
              connectorWidth - extraSpaceBeforeCustos,
              this.lastLyrics.length > 1
                ? ctxt.intraNeumeSpacing
                : ctxt.minLyricWordSpacing
            );
            // we might not need to shift the syllable, but we do want to shrink the hyphen...
            lyrics.setConnectorWidth(minHyphenWidth);
          }
        }
        ++i;
      }
      this.custos!.bounds.x =
        this.notationRight(lastNotation) + lastNotation.calculatedTrailingSpace;
    }

    // first step of justification is to determine how much space we have to use up
    var extraSpace = this.getWhitespaceOnRight();

    if (
      Math.abs(extraSpace) < 0.5 ||
      (extraSpace > 0 && ((doJustify && toJustify.length === 0) || !doJustify))
    )
      return;

    this.condensableSpaces = condensableSpaces;

    var curr, prev: ChantNotationElement | undefined;
    var offset = 0;
    var increment = extraSpace / toJustify.length;
    var multiplier = 0;
    var toJustifyIndex = 0;
    if (extraSpace < 0) {
      toJustify = condensableSpaces.filter(s => s.condensable > 0);
      multiplier = extraSpace / condensableSpaces.sum;
      increment = 0;
    }
    var nextToJustify = toJustify[toJustifyIndex++];
    var incrementOffsetAtNextChance = false;
    for (i = this.notationsStartIndex; i < lastIndex; i++) {
      prev = curr;
      curr = notations[i];

      if (
        this.extraTextOnlyIndex !== null &&
        i >= this.extraTextOnlyIndex &&
        curr.constructor === TextOnly
      ) {
        continue;
      }

      if (!multiplier && curr === this.custos) {
        if (curr.hasLyrics()) {
          curr.bounds.x = Math.min(
            curr.bounds.x +
              (this.staffRight - LyricArray.getRight(curr.lyrics)),
            this.staffRight - curr.bounds.width
          );
          offset += increment;
        } else {
          curr.bounds.x = Math.min(
            curr.bounds.x + offset,
            this.staffRight - curr.bounds.width
          );
        }
        continue;
      }

      if (multiplier) {
        // (the spaces that can be condensed)
        if (nextToJustify && (nextToJustify as CondensableSpace).notation === curr) {
          offset += multiplier * (nextToJustify as CondensableSpace).condensable;
          nextToJustify = toJustify[toJustifyIndex++];
        }
      } else if (nextToJustify === curr) {
        if (prev!.hasNoWidth) {
          incrementOffsetAtNextChance = true;
        } else {
          offset += increment;
        }
        nextToJustify = toJustify[toJustifyIndex++];
      } else if (incrementOffsetAtNextChance && !prev!.hasNoWidth) {
        incrementOffsetAtNextChance = false;
        offset += increment;
      }

      curr.bounds.x += offset;
    }

    if (extraSpaceBeforeCustos > 0) {
      this.custos!.bounds.x =
        this.notationRight(lastNotation) + lastNotation.calculatedTrailingSpace;
    }
  }

  handleEndBrace(ctxt: ChantContext, note: BraceNote & { braceEnd?: BracePoint }, i: number) {
    var startBrace = ctxt.lastStartBrace;
    if (!startBrace) return;
    // calculate the y value of the brace by iterating over all notations
    // under/over the brace.
    var y;
    var k = startBrace.notationIndex;
    var notations = this.score.notations;
    var dy = ctxt.intraNeumeSpacing / 2; // some safe space between brace and notes.
    var startNote = startBrace.note;

    if (startBrace.isAbove) {
      y = Math.min(
        ctxt.calculateHeightFromStaffPosition(this.score.staffLineCount * 2),
        ...[startNote, note]
          .concat(notations.slice(k, i + 1))
          .map(n => n!.bounds.y - dy)
      );
    } else {
      y = Math.max(
        ctxt.calculateHeightFromStaffPosition(0),
        ...[startNote, note]
          .concat(notations.slice(k, i + 1))
          .map(n => n!.bounds.bottom() + dy)
      );
    }

    var addAcuteAccent = false;

    if (startBrace.shape === BraceShape.RoundBrace) {
      this.braces.push(
        new RoundBraceVisualizer(
          ctxt,
          startBrace.getAttachmentX(startNote),
          note.braceEnd!.getAttachmentX(note),
          y,
          startBrace.isAbove
        )
      );
    } else {
      if (startBrace.shape === BraceShape.AccentedCurlyBrace)
        addAcuteAccent = true;

      this.braces.push(
        new CurlyBraceVisualizer(
          ctxt,
          startBrace.getAttachmentX(startNote),
          note.braceEnd!.getAttachmentX(note),
          y,
          startBrace.isAbove,
          addAcuteAccent
        )
      );
    }

    delete ctxt.lastStartBrace;
  }

  finishLayout(ctxt: ChantContext) {
    this.ledgerLines = []; // clear any existing ledger lines
    this.slurs = [];
    // (Gregorio's custom ledger lines, which go after the automatic ones)
    var customLedgerLines: LedgerLine[] = [];

    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // adds a ledger line from x1 to x2 at staffPosition, but never past the
    // staff's right edge.  A line that overlaps the last one there is drawn
    // as one line with it, and one no more than ctxt.minLedgerSeparation
    // staff intervals from it is joined to it, each lengthened to meet the
    // other halfway (0 by default, as Gregorio never joins them)
    var addLedgerLine = (x1: number, x2: number, staffPosition: number) => {
      x2 = Math.min(x2, this.staffRight);
      var last: LedgerLine | undefined;
      for (let i = this.ledgerLines.length - 1; i >= 0 && !last; i--)
        if (this.ledgerLines[i].staffPosition === staffPosition) last = this.ledgerLines[i];
      if (last && x1 <= last.x2 && x2 >= last.x1) {
        last.x1 = Math.min(last.x1, x1);
        last.x2 = Math.max(last.x2, x2);
        return;
      }
      if (last && x1 > last.x2 && x1 - last.x2 <= ctxt.staffInterval * ctxt.minLedgerSeparation) {
        var half = (x1 - last.x2) / 2;
        last.x2 += half;
        x1 -= half;
      }
      this.ledgerLines.push({ x1, x2, staffPosition });
    };
    // a ledger line under notes from element to endElem of a neume (see
    // Neume.drawnLedgerLines()), as far beyond them on each side as Gregorio's
    // reaches (see ledgerLineOverhang)
    var processElementForLedgerLine = (line: NeumeLedgerLine) => {
      var offsetX = line.element.neume!.bounds.x;
      var overhang = ctxt.staffInterval * ledgerLineOverhang;
      var x1 = line.x1 === undefined ? line.element.bounds.x : line.x1;
      var x2 = line.x2 === undefined ? line.endElem.bounds.right() : line.x2;
      addLedgerLine(offsetX + x1 - overhang, offsetX + x2 + overhang, line.staffPosition);
    };
    // and under a sign that has one: an accidental on or beyond a ledger
    // line, a custos there, whose line goes a little less far (and not past
    // its right at the end of a line), or a high bar (gabc `0, ,0 or ^0)
    var processSignForLedgerLine = (notation: ChantNotationElement) => {
      var lines: { x1: number; x2: number; isAbove: boolean }[] = [];
      var overhang = ctxt.staffInterval * ledgerLineOverhang;
      if (notation.isAccidental && !(notation as Accidental).hidden) {
        for (let isAbove of [false, true])
          if (hasDrawnLedgerLine(notation as Accidental, isAbove))
            lines.push({ x1: notation.bounds.x - overhang, x2: notation.bounds.right() + overhang, isAbove });
      } else if (notation instanceof Custos) {
        let custosOverhang = ctxt.staffInterval * custosLedgerLineOverhang;
        let isAbove = notation.staffPosition >= ledgerLinePosition(ctxt, true);
        if (isAbove || notation.staffPosition <= ledgerLinePosition(ctxt, false))
          lines.push({
            x1: notation.bounds.x - custosOverhang,
            x2: notation.bounds.right() + (notation === this.custos ? 0 : custosOverhang),
            isAbove
          });
      } else if (notation.isDivider && (notation as Divider).ledgerLineExtent) {
        let extent = (notation as Divider).ledgerLineExtent!;
        lines.push({
          x1: notation.bounds.x + extent.x1 - overhang,
          x2: notation.bounds.x + extent.x2 + overhang,
          isAbove: true
        });
      }
      for (let line of lines) addLedgerLine(line.x1, line.x2, ledgerLinePosition(ctxt, line.isAbove));
    };

    var episemata: HorizontalEpisema[] = []; // keep track of episemata in case we can connect some
    var startBrace = null;
    var minY = Number.MAX_VALUE,
      maxY = Number.MIN_VALUE; // for braces

    // (centered between leftX and rightX, when there's a rightX)
    var positionNonLyricText = (text: TextElement, neume: ChantNotationElement, rightX?: number, leftX = 0) => {
      text.setMaxWidth(ctxt, this.staffRight - this.textLeft);
      //text.bounds.x = neume.hasLyrics()? Math.min(...neume.lyrics.map(l => l.bounds.x)) : 0;
      text.bounds.x = leftX;
      if (rightX !== undefined)
        text.bounds.x = (text.bounds.x + rightX - text.bounds.width) / 2;
      var beyondStaffRight =
        neume.bounds.x + text.bounds.right() - this.staffRight;
      if (beyondStaffRight > 0) {
        text.bounds.x -= beyondStaffRight;
      }
      if (neume.bounds.x + text.bounds.x < this.textLeft) {
        text.bounds.x = this.textLeft - neume.bounds.x;
      }
    };

    // make a final pass over all of the notes to add any necessary
    // ledger lines and to smooth out episemata
    for (var i = this.notationsStartIndex; i < lastIndex; i++) {
      var neume = notations[i];

      minY = Math.min(minY, neume.bounds.y);
      maxY = Math.max(maxY, neume.bounds.bottom());

      if (neume.constructor === Custos) {
        processSignForLedgerLine(neume);
        continue;
      }
      processSignForLedgerLine(neume);

      // if the AboveLinesText would extend beyond the right edge of the staff, right align it instead
      if (neume.alText) {
        for (var j = 0; j < neume.alText.length; j++) {
          positionNonLyricText(neume.alText[j], neume);
        }
      }

      // set up horizontal position of translations
      if (neume.translationText) {
        for (j = 0; j < neume.translationText.length; j++) {
          var text = neume.translationText[j];
          if (text.endNeume) {
            // (a translation whose end neume is on a later line, where the
            // line couldn't be kept from breaking, goes on to the end of this one)
            let endsOnLine = false;
            for (let k = i; k < lastIndex && !endsOnLine; k++) endsOnLine = notations[k] === text.endNeume;
            var rightX = !endsOnLine
              ? this.staffRight
              : text.endNeume.hasLyrics()
              ? text.endNeume.bounds.x +
                Math.max(...text.endNeume.lyrics.map(l => l.bounds.right()))
              : text.endNeume.bounds.right();
            rightX -= neume.bounds.x;
            positionNonLyricText(text, neume, rightX);
          } else if (ctxt.translationCentering === "center") {
            // centered under the lyric (or the notation, if it has none)
            var lyric = neume.hasLyrics() ? neume.lyrics[0] : null;
            var lyricLeft = lyric ? lyric.bounds.x : 0;
            var lyricRight = lyric
              ? lyric.bounds.x + lyric.widthWithoutConnector
              : neume.bounds.width;
            positionNonLyricText(text, neume, lyricRight, lyricLeft);
          } else {
            positionNonLyricText(text, neume);
          }
        }
      }

      // if it's not a neume then just skip here
      if (!neume.isNeume) continue;

      for (j = 0; j < (neume as Neume).ledgerLines.length; j++)
        processElementForLedgerLine((neume as Neume).ledgerLines[j]);

      for (j = 0; j < neume.notes!.length; j++) {
        var k,
          note = neume.notes![j];

        // blend episemata as we're able
        if (note.episemata.length === 0) episemata = [];
        for (k = 0; k < note.episemata.length; k++) {
          var episema = note.episemata[k];
          // (from where the episema's layout put it, however an earlier line joined it to others)
          if (episema.layoutBounds) episema.bounds = episema.layoutBounds.clone();

          var spaceBetweenEpisemata = 0;

          // calculate the distance between the last episemata and this one...
          // lots of code for a simple: currEpisemata.left - prevEpisemata.right
          if (episemata.length > 0)
            spaceBetweenEpisemata =
              neume.bounds.x +
              episema.bounds.x -
              (episemata[episemata.length - 1].note.neume!.bounds.x +
                episemata[episemata.length - 1].bounds.right());

          // we try to blend the episema if we're able.
          if (
            episemata.length === 0 ||
            episemata[episemata.length - 1].positionHint !==
              episema.positionHint ||
            episemata[episemata.length - 1].terminating === true ||
            episemata[episemata.length - 1].alignment ===
              HorizontalEpisemaAlignment.Left ||
            episemata[episemata.length - 1].alignment ===
              HorizontalEpisemaAlignment.Center ||
            episema.alignment === HorizontalEpisemaAlignment.Right ||
            episema.alignment === HorizontalEpisemaAlignment.Center ||
            (spaceBetweenEpisemata > ctxt.intraNeumeSpacing * 2 &&
              note.glyphVisualizer!.glyphCode !== GlyphCode.None)
          ) {
            // start a new set of episemata to potentially blend
            episemata = [episema];
          } else {
            // blend all previous with this one
            var newY;

            if (episema.positionHint === MarkingPositionHint.Below)
              newY = Math.max(
                episema.bounds.y,
                episemata[episemata.length - 1].bounds.y
              );
            else
              newY = Math.min(
                episema.bounds.y,
                episemata[episemata.length - 1].bounds.y
              );

            if (episema.bounds.y !== newY) episema.bounds.y = newY;
            else {
              for (var l = 0; l < episemata.length; l++)
                episemata[l].bounds.y = newY;
            }

            // extend the last episema to meet the new one
            var newWidth =
              neume.bounds.x +
              episema.bounds.x -
              (episemata[episemata.length - 1].note.neume!.bounds.x +
                episemata[episemata.length - 1].bounds.x);
            if (newWidth < 0) {
              newWidth *= -1;
              episemata[episemata.length - 1].bounds.x -= newWidth;
            }
            episemata[episemata.length - 1].bounds.width = newWidth;

            episemata.push(episema);
          }
        }

        if (note.slurs) this.handleSlurs(ctxt, note);
        if (note.customLedgerLines) this.handleCustomLedgerLines(ctxt, note, customLedgerLines);

        if (note.braceEnd) this.handleEndBrace(ctxt, note, i);

        if (note.braceStart) {
          ctxt.lastStartBrace = startBrace = note.braceStart;
          startBrace.notationIndex = i;
        }
      }
    }

    this.alignEpisemaBlocks(notations.slice(this.notationsStartIndex, lastIndex));

    // if we still have an active brace, that means it spands two chant lines!
    if (startBrace !== null) {
      if (this.custos) {
        // if the next end brace is on the first note following the line break, simply use it with the custos
        // Do the same if there is only an accidental between
        // otherwise, make a new end brace to work for this one, and a new start brace for the next line.
        // (An explicit custos can end the score, in which case there is no next notation.)
        var nextNotation = notations[lastIndex];
        var nextNote =
          nextNotation && nextNotation.notes && nextNotation.notes[0];
        var nextNotationButOne = notations[lastIndex + 1];
        var nextNoteButOne =
          nextNotationButOne &&
          nextNotationButOne.notes &&
          nextNotationButOne.notes[0];
        var braceEnd =
          (nextNote && nextNote.braceEnd) ||
          (nextNotation &&
            nextNotation.isAccidental &&
            nextNoteButOne &&
            nextNoteButOne.braceEnd);
        if (braceEnd) {
          this.custos.braceEnd = braceEnd;
          this.handleEndBrace(ctxt, this.custos, i);
        } else {
          this.braceStart = startBrace;
          this.custos.braceEnd = new BracePoint(
            this.custos,
            startBrace.isAbove,
            startBrace.shape,
            BraceAttachment.Right
          );
          this.handleEndBrace(ctxt, this.custos, i - 1);
          ctxt.lastStartBrace = new BracePoint(
            null,
            startBrace.isAbove,
            startBrace.shape,
            BraceAttachment.Left
          );
          ctxt.lastStartBrace.notationIndex = i;
        }
      }
    }

    // don't forget to also include the final custos, which may need a ledger line too
    if (this.custos) processSignForLedgerLine(this.custos);

    // a slur that goes on to the next line goes to the end of this one (and
    // one that isn't closed by the end of the score isn't drawn)
    var openSlurs = ctxt.openSlurs || {};
    for (let side of ["above", "below"] as const) {
      let start = openSlurs[side];
      if (!start || lastIndex >= notations.length) continue;
      this.slurs.push(new Slur(ctxt, this.startX(start), start.y, this.staffRight, start.y, side === "above"));
      start.x = null;
    }

    // and so does a custom ledger line
    var openLedgerLines = ctxt.openLedgerLines || {};
    for (let side of ["above", "below"] as const) {
      let start = openLedgerLines[side];
      if (!start || lastIndex >= notations.length) continue;
      customLedgerLines.push({
        x1: this.startX(start),
        x2: this.staffRight,
        staffPosition: ledgerLinePosition(ctxt, side === "above")
      });
      start.x = null;
    }
    for (let line of customLedgerLines) {
      line.x1 = Math.max(line.x1, this.staffLeft);
      line.x2 = Math.min(line.x2, this.staffRight);
      this.ledgerLines.push(line);
    }
  }

  // where a slur or custom ledger line from note to note that started at
  // start begins on this line: where it started, or after the clef if that
  // was on an earlier line
  startX(start: { x: number | null }) {
    return start.x === null ? this.startingClef.bounds.right() : start.x;
  }

  // Gregorio's ledger lines of a given length next to the note (gabc [oll:…]
  // and [ull:…]), or from note to note, which go in customLedgerLines.  As in
  // Gregorio, a line that starts before the last one ends, or ends without
  // one, is ignored.
  handleCustomLedgerLines(ctxt: ChantContext, note: Note, customLedgerLines: LedgerLine[]) {
    var openLedgerLines = (ctxt.openLedgerLines = ctxt.openLedgerLines || {});
    var extent = (e: LedgerLineExtent) => (e === "overhang" ? ledgerLineOverhang : e) * ctxt.staffInterval;
    for (let line of note.customLedgerLines!) {
      let side = line.isAbove ? ("above" as const) : ("below" as const);
      let staffPosition = ledgerLinePosition(ctxt, line.isAbove);
      // (where the line is introduced)
      let x = note.neume!.bounds.x + (line.before ? note.bounds.x : note.bounds.right());
      let start = openLedgerLines[side];
      if (line.kind === "fixed") {
        customLedgerLines.push({ x1: x - extent(line.left!), x2: x + extent(line.right!), staffPosition });
      } else if (line.kind === "start") {
        if (!start) openLedgerLines[side] = { x: x - extent(line.left!), right: line.right! };
      } else if (start) {
        customLedgerLines.push({
          x1: this.startX(start),
          x2: x + extent(start.right),
          staffPosition
        });
        delete openLedgerLines[side];
      }
    }
  }

  // puts the episemata of each of Gregorio's blocks of episema tuning
  // ([oh:…{] … [oh}]) on the notations on the same level, the highest of
  // them over the notes, or the lowest under them
  alignEpisemaBlocks(notations: ChantNotationElement[]) {
    var blocks = new Map<EpisemaTuning, HorizontalEpisema[]>();
    for (let notation of notations) {
      for (let note of notation.notes || []) {
        for (let episema of note.episemata) {
          let isAbove = episema.positionHint !== MarkingPositionHint.Below;
          let tuning = note.episemaTuning && note.episemaTuning[isAbove ? "above" : "below"];
          if (tuning && tuning.block) blocks.set(tuning, (blocks.get(tuning) || []).concat(episema));
        }
      }
    }
    blocks.forEach((episemata) => {
      let ys = episemata.map((episema) => episema.bounds.y);
      let y = episemata[0].positionHint === MarkingPositionHint.Below ? Math.max(...ys) : Math.min(...ys);
      for (let episema of episemata) episema.bounds.y = y;
    });
  }

  // Gregorio's slurs on the note (gabc [oslur:…] and [uslur:…]): one of its
  // own, or the start or end of one from note to note.  As in Gregorio, a
  // slur that starts before the last one ends, or ends without one, is ignored.
  handleSlurs(ctxt: ChantContext, note: Note) {
    var openSlurs = (ctxt.openSlurs = ctxt.openSlurs || {});
    for (let mark of note.slurs!) {
      let side = mark.isAbove ? ("above" as const) : ("below" as const);
      let point = Slur.pointOnNote(ctxt, note, mark);
      let start = openSlurs[side];
      if (mark.kind === "fixed") {
        this.slurs.push(
          new Slur(
            ctxt,
            point.x,
            point.y,
            point.x + mark.width! * ctxt.staffInterval,
            point.y - mark.height! * ctxt.staffInterval,
            mark.isAbove
          )
        );
      } else if (mark.kind === "start") {
        if (!start) openSlurs[side] = point;
      } else if (start) {
        // (one that started on an earlier line goes on from the start of this one, level with its end)
        let y = start.x === null ? point.y : start.y;
        this.slurs.push(new Slur(ctxt, this.startX(start), y, point.x, point.y, mark.isAbove));
        delete openSlurs[side];
      }
    }
  }

  // this is where the real core of positioning neumes takes place
  // returns true if positioning was able to fit the neume before rightNotationBoundary.
  // returns false if cannot fit before given right margin.
  // fixme: if this returns false, shouldn't we set the connectors on prev to be activated?!
  positionNotationElement(
    ctxt: ChantContext,
    prevLyrics: Lyric[],
    prev: ChantNotationElement,
    curr: ChantNotationElement,
    rightNotationBoundary: number,
    condensableSpaces = [] as unknown as CondensableSpaces
  ) {
    if (!condensableSpaces.hasOwnProperty("sum")) condensableSpaces.sum = 0;
    var i,
      // (its total and condensable space are set just below)
      space = { notation: curr } as CondensableSpace,
      fixedX = false;

    // To begin we just place the current notation right after the previous,
    // irrespective of lyrics.
    // But if the previous neume was part of a polyphonic "no width" group and the current is not, or is of a separate group,
    // we force it to have the same x as the previous group.
    if (
      (!curr.hasNoWidth || curr.firstWithNoWidth === curr) &&
      prev.firstWithNoWidth
    ) {
      curr.bounds.x = prev.firstWithNoWidth.bounds.x;
      fixedX = true;
    } else {
      curr.bounds.x = prev.bounds.right();
    }

    if (
      (curr.constructor === TextOnly && this.extraTextOnlyIndex === null) ||
      (!curr.hasLyrics() &&
        prev.calculatedTrailingSpace < 0 &&
        !hasBackspace(ctxt, prev))
    ) {
      // We transfer over the trailing space from the previous neume if the current neume is text only,
      // so that the text only neume has a better chance at not needing a connector.
      // (A backspace moves the text only neume back instead, as it would any other.)
      if (hasBackspace(ctxt, prev)) curr.bounds.x += prev.calculatedTrailingSpace;
      curr.calculatedTrailingSpace = hasBackspace(ctxt, prev) ? 0 : prev.calculatedTrailingSpace;
      if (curr.hasLyrics())
        curr.calculatedTrailingSpace -= curr.lyrics[0].bounds.width;
      if (curr.constructor === TextOnly && (curr as TextOnly).lyrics.length === 1) {
        (curr as TextOnly).lyrics[0].setMaxWidth(
          ctxt,
          this.staffRight,
          this.staffRight -
            LyricArray.getRight(prevLyrics) -
            ctxt.minLyricWordSpacing
        );
      }
    } else if (!fixedX) {
      curr.bounds.x += prev.calculatedTrailingSpace;
    }

    if (
      curr.hasLyrics() &&
      !prev.isDivider &&
      !prev.isAccidental &&
      this.numNotationsOnLine > 0 &&
      (curr.lyrics[0].lyricType === LyricType.SingleSyllable ||
        curr.lyrics[0].lyricType === LyricType.BeginningSyllable)
    ) {
      curr.bounds.x += ctxt.intraNeumeSpacing * ctxt.interVerbalMultiplier;
    }
    if (curr.hasNoWidth || fixedX) {
      space.total = space.condensable = 0;
    } else if (
      this.extraTextOnlyIndex !== null &&
      curr.constructor === TextOnly
    ) {
      (curr as TextOnly).bounds.x = 0;
      space.total = space.condensable = 0;
    } else {
      space.total = curr.bounds.x - prev.bounds.right();
      // (a backspace can't be condensed)
      space.condensable = hasBackspace(ctxt, prev)
        ? 0
        : space.total * ctxt.condensingTolerance;

      // Gregorio's NABC widens its syllable, where it's wider than the notes,
      // so that the next syllable starts after it.  (Here, the next NABC in
      // a syllable starts after it too.)  With "neume" alignment, the notes
      // make room for the letters that hang back before the NABC on them.
      if (curr.firstOfParentheses || curr.nabcNeumes) {
        // (the NABC on prev's syllable, and on the notations without notes
        // between prev and curr, which are placed after prev)
        let notations = this.score.notations;
        let stop = notations[prev.notationIndex!] === prev ? prev.notationIndex! : this.notationsStartIndex;
        let shift = Math.max(0, nabcRight(this, curr.notationIndex! - 1, stop) - prev.bounds.right());
        if (ctxt.nabcAlignment === "neume")
          shift += Math.max(0, ...(curr.nabcNeumes || []).map((nabc) => (nabc ? -nabc.bounds.x : 0)));
        curr.bounds.x += shift;
        space.total += shift;
      }
    }
    const currRight = () => this.notationRight(curr);

    // Gregorio's <clear>: a lyric's text may not start before the previous
    // notation's notes end, nor its notation's notes before the previous
    // lyric ends.  This is checked before the lyrics are spaced, so that
    // their connectors are worked out where they'll be, and again after,
    // in case they were brought together.
    var clearShift = () => {
      var shift = 0;
      for (var lyric of curr.lyrics) {
        if (!lyric.clear) continue;
        shift = Math.max(shift, prev.bounds.right() - lyric.getLeft());
        if (prevLyrics.length)
          shift = Math.max(shift, LyricArray.getRight(prevLyrics) - curr.bounds.x);
      }
      return shift;
    };
    var cleared = curr.lyrics.some((lyric) => lyric.clear);
    if (cleared) {
      let shift = clearShift();
      curr.bounds.x += shift;
      space.total += shift;
      // (condensing the space before it could bring it back)
      space.condensable = 0;
    }

    // if the previous notation has no lyrics, then we simply make sure the
    // current notation with lyrics is in the bounds of the line
    if (prevLyrics.length === 0) {
      var maxRight = currRight() + curr.calculatedTrailingSpace;

      // if the lyric left is negative, then offset the neume appropriately
      for (i = 0; i < curr.lyrics.length; i++) {
        let currLyric = curr.lyrics[i];
        // we hope for the best!
        // but always use a connector if the lyric has original text that was all used up for the drop cap.
        let needsConnector =
          currLyric.allowsConnector() &&
          currLyric.dropCap &&
          currLyric.originalText &&
          !currLyric.text;
        currLyric.setNeedsConnector(needsConnector as boolean);
        let minLeft = this.staffLeft - this.paddingLeft;

        if (currLyric.getLeft() < minLeft)
          curr.bounds.x -= currLyric.getLeft() - minLeft;

        space.condensable = Math.min(
          space.condensable,
          currLyric.getLeft() - minLeft
        );
        maxRight = Math.max(
          maxRight,
          currLyric.getRight() - (currLyric.protrusionWidth || 0)
        );
      }

      if (
        maxRight >
        rightNotationBoundary + condensableSpaces.sum + space.condensable
      )
        return false;
      condensableSpaces.push(space);
      condensableSpaces.sum += space.condensable;
      return true;
    } else {
      if (curr.firstOfSyllable && prevLyrics.length && !curr.hasLyrics()) {
        curr.bounds.x = Math.max(curr.bounds.x, prevLyrics[0].getRight());
        space.total = curr.bounds.x - prev.bounds.right();
        space.condensable = space.total * ctxt.condensingTolerance;
      }
    }

    // if the curr notation has no lyrics, then simply check whether there is enough room
    if (curr.hasLyrics() === false) {
      if (
        currRight() + curr.calculatedTrailingSpace >
        rightNotationBoundary + condensableSpaces.sum + space.condensable
      )
        return false;
      condensableSpaces.push(space);
      condensableSpaces.sum += space.condensable;
      return true;
    }

    // if we have multiple lyrics on the current or the previous notation,
    // we will have to run several passes over each set of lyrics:

    // on the first pass, we will check the absolute left-most placement of the new syllables
    // we will make additional passes until everything is stable
    do {
      var hasShifted = false;
      var atLeastOneWithoutConnector = false;
      for (i = 0; i < curr.lyrics.length; i++) {
        if (!curr.lyrics[i].originalText) continue;
        var prevLyricRight = 0;
        let condensableSpacesSincePrevLyric = [] as unknown as CondensableSpaces;
        let condensableSpaceSincePrevLyric = null;
        if (i < prevLyrics.length && prevLyrics[i]) {
          prevLyricRight = prevLyrics[i].getRight();
          // (the space before the previous lyric's notation is usually one
          // of the last few, so look for it from the end)
          let notationI = condensableSpaces.length - 1;
          while (notationI >= 0 && condensableSpaces[notationI].notation !== prevLyrics[i].notation) notationI--;
          if (notationI >= 0) {
            condensableSpacesSincePrevLyric = condensableSpaces.slice(
              notationI + 1
            ) as CondensableSpaces;
            condensableSpacesSincePrevLyric.sum = sumCondensable(condensableSpacesSincePrevLyric);
          } else {
            condensableSpacesSincePrevLyric.sum = 0;
          }
          // (the spaces before a syllable with <clear> aren't condensed, which
          // could bring it back under the notes before it)
          if (cleared) condensableSpacesSincePrevLyric.sum = 0;
        }

        curr.lyrics[i].setNeedsConnector(false); // we hope for the best!
        var currLyricLeft = curr.lyrics[i].getLeft();
        if (!prevLyrics[i] || prevLyrics[i].allowsConnector() === false) {
          // No connector needed, but include space between words if necessary!
          let extraSpace = currLyricLeft - prevLyricRight - ctxt.minLyricWordSpacing;
          if (extraSpace < 0) {
            // push the current element over a bit.
            let shift =
              prevLyricRight + ctxt.minLyricWordSpacing - currLyricLeft;
            curr.bounds.x += shift;
            condensableSpaceSincePrevLyric = 0;
            hasShifted = shift > 0.5;
          } else {
            condensableSpaceSincePrevLyric = extraSpace;
          }
        } else {
          // we may need a connector yet...
          if (
            prevLyricRight + 0.1 >
            currLyricLeft -
              condensableSpacesSincePrevLyric.sum -
              space.condensable
          ) {
            // in this case, the lyric elements actually overlap.
            // so nope, no connector needed. instead, we just place the lyrics together
            // fixme: for better text layout, we could actually use the kerning values
            // between the prev and curr lyric elements!
            let shift = prevLyricRight - currLyricLeft;
            if (shift < -0.1) {
              // in this case, the spacing needs to be condensed in the neumes since the last lyric...
              let multiplier =
                shift /
                (condensableSpacesSincePrevLyric.sum + space.condensable);
              let offset = 0;
              condensableSpacesSincePrevLyric.forEach(s => {
                offset += multiplier * s.condensable;
                s.notation.bounds.x += offset;
              });
            }
            curr.bounds.x += shift;
            condensableSpaceSincePrevLyric = 0;
            atLeastOneWithoutConnector = true;
            hasShifted = shift > 0.5;
          } else {
            // bummer, looks like we couldn't merge the syllables together. Better add a connector...
            if (ctxt.minLyricWordSpacing < ctxt.hyphenWidth) {
              var spaceBetweenSyls = currLyricLeft - prevLyricRight;
              if (spaceBetweenSyls < ctxt.hyphenWidth) {
                var minHyphenWidth =
                  prevLyrics.length > 1
                    ? ctxt.intraNeumeSpacing
                    : ctxt.minLyricWordSpacing;
                // we might not need to shift the syllable, but we do want to shrink the hyphen...
                prevLyrics[i].setConnectorWidth(
                  Math.max(minHyphenWidth, spaceBetweenSyls)
                );
              }
            }
            prevLyrics[i].setNeedsConnector(true);
            prevLyricRight = prevLyrics[i].getRight();

            if (prevLyricRight + 0.1 > currLyricLeft) {
              let shift = prevLyricRight - currLyricLeft;
              curr.bounds.x += shift;
              condensableSpaceSincePrevLyric = 0;
              hasShifted = shift > 0.5;
            } else {
              condensableSpaceSincePrevLyric = currLyricLeft - prevLyricRight;
            }
          }
        }

        if (condensableSpaceSincePrevLyric !== null) {
          if (
            condensableSpaceSincePrevLyric <
            condensableSpacesSincePrevLyric.sum + space.condensable
          ) {
            // reduce condensable space so that lyrics retain at least the width of a space character between words:
            let multiplier = condensableSpaceSincePrevLyric / (condensableSpacesSincePrevLyric.sum + space.condensable);
            space.condensable *= multiplier;
            if (condensableSpacesSincePrevLyric.sum) {
              condensableSpacesSincePrevLyric.forEach(space => {
                space.condensable *= multiplier;
              });
              condensableSpaces.sum = sumCondensable(condensableSpaces);
            }
          }
        }
      }
    } while (
      curr.lyrics.length > 1 &&
      hasShifted &&
      atLeastOneWithoutConnector
    );
    if (cleared) curr.bounds.x += clearShift();

    for (i = Math.min(curr.lyrics.length, prevLyrics.length) - 1; i >= 0; i--) {
      let pLyrics = prevLyrics[i];
      if (pLyrics.needsConnector && pLyrics.connectorWidth) {
        currLyricLeft = curr.lyrics[i].getLeft();
        prevLyricRight = pLyrics.getRight() - pLyrics.connectorWidth;
        spaceBetweenSyls = currLyricLeft - prevLyricRight;
        if (spaceBetweenSyls >= ctxt.hyphenWidth) spaceBetweenSyls = 0;
        pLyrics.setConnectorWidth(spaceBetweenSyls);
      }
    }

    if (
      currRight() + curr.calculatedTrailingSpace <
        rightNotationBoundary + condensableSpaces.sum + space.condensable &&
      (rightNotationBoundary === Infinity ||
        LyricArray.getRight(curr.lyrics, true, true) <=
          this.staffRight + condensableSpaces.sum + space.condensable)
    ) {
      if (prev.isAccidental && !(prev as Accidental).hidden) {
        // move the previous accidental up next to the current note:
        let shift =
          curr.bounds.x -
          prev.bounds.width -
          prev.calculatedTrailingSpace -
          prev.bounds.x;
        prev.bounds.x += shift;
        if (Math.abs(shift) > 0.1) {
          let lastCondensable = condensableSpaces[condensableSpaces.length - 1];
          condensableSpaces.sum -= lastCondensable.condensable;
          lastCondensable.condensable = 0;
        }
      }
      condensableSpaces.push(space);
      condensableSpaces.sum += space.condensable;
      return true;
    }

    // if we made it this far, then the element won't fit on this line.
    return false;
  }

  /**
   * Gives the lyrics of the notation at index that are the first text of
   * their lines of lyrics on the line the verse numbers in effect on them
   * (with ChantContext.repeatVerseNumbers), before it's positioned.
   */
  repeatVerseNumbers(ctxt: ChantContext, index: number) {
    var notations = this.score.notations,
      notation = notations[index];
    if (!ctxt.repeatVerseNumbers || !notation.hasLyrics()) return;
    var repeated = false;
    notation.lyrics.forEach((lyric, lyricIndex) => {
      if (!lyric.verseNumberInEffect || !lyric.originalText) return;
      for (let i = this.notationsStartIndex; i < index; i++) {
        let before = notations[i].lyrics[lyricIndex];
        if (before && before.originalText) return;
      }
      lyric.repeatedVerseNumber = lyric.getRepeatedVerseNumber(ctxt);
      repeated = true;
    });
    if (repeated) notation.alignLyrics(ctxt);
  }

  /** the row on the line that the line of lyrics at index is drawn on */
  lyricRow(index: number) {
    return index < this.lyricRows.length ? this.lyricRows[index] : this.numLyricLines;
  }

  /**
   * Find the notation closest to x without going past it
   * @param {number} x
   */
  bisectNotationAtX(x: number, useMidpoint = true) {
    let minIndex = -1,
      maxIndex = Math.min(this.numNotationsOnLine, Infinity),
      curIndex = minIndex + ((maxIndex - minIndex) >> 1),
      startIndex = this.notationsStartIndex,
      length = Math.max(
        0,
        Math.min(
          this.numNotationsOnLine,
          this.score.notations.length - startIndex
        )
      ),
      // the notations on this line, indexed from the start of the line
      notationAt = (index: number) =>
        index >= 0 && index < length
          ? this.score.notations[startIndex + index]
          : undefined;

    while (minIndex < curIndex) {
      let notation = notationAt(curIndex);
      let notationX = notation!.bounds.x;
      if (notationX > x) {
        maxIndex = curIndex;
      } else {
        minIndex = curIndex;
      }
      curIndex = minIndex + ((maxIndex - minIndex) >> 1);
    }
    let notation = notationAt(curIndex);
    if (
      useMidpoint &&
      notation &&
      notation.bounds.width === 0 &&
      curIndex + 1 < length
    ) {
      let nextNotation = notationAt(curIndex + 1),
        closenessToLeft = x - notation.bounds.x,
        closenessToRight = nextNotation!.bounds.x - x;
      if (nextNotation!.bounds.width === 0 && closenessToRight < closenessToLeft)
        ++curIndex;
    }
    return notationAt(curIndex);
  }
}
