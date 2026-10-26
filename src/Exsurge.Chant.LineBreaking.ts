//
// Line breaking across the whole score, as Gregorio does it.
//
// GregorioTeX sets a score as one TeX paragraph, so TeX's Knuth-Plass
// algorithm chooses all of its line breaks together, weighing how full each
// line would be against penalties that Gregorio puts at each place a line can
// break (tex/gregoriotex-gsp-default.tex:26-63 in Gregorio).  This module does
// the same with exsurge's own spacing: each line that could be made is laid
// out as ChantLine.buildFromChantNotationIndex() would lay it out, which gives
// its natural width, how much it can be condensed (ctxt.condensingTolerance)
// and how many places it can be stretched at to justify it.  Then the breaks
// with the fewest demerits are found as TeX finds them, and each ChantLine is
// built to end where it was planned to (ChantLine.plannedEnd).
//
// Laying out the lines that could be made takes most of the time, so the
// next layout of the score at the same width uses them again
// (score.lineBreaker), where the notations that a line looked at are the same
// ones and haven't been laid out again, nothing else that it depends on has
// changed (see LineBreaker.getLayoutFacts()), and laying it out again would
// read the same from its notations as it did (see LineBreaker.recordEntry()).
// A line used again leaves its notations as laying it out did, when it would
// have been laid out (see LineBreaker.enterLine()), so the score is laid out
// just as it would be without it; and after an edit, only the lines that
// could include what changed are laid out again.
//
// It is used when ctxt.lineBreaking is "optimal" (see ChantScore.layoutChantLines).
//

import {
  ChantLine,
  copyBeginningLyrics,
  isHiddenAccidental,
  isTextOnlyBeforeDivider,
  restoreLyrics
} from "./Exsurge.Chant.ChantLine.js";
import { ChantLineBreak, NoteShape, TextOnly } from "./Exsurge.Chant.js";
import { Custos } from "./Exsurge.Chant.Signs.js";
import { LyricArray, LyricType } from "./Exsurge.Drawing.js";
import { Glyphs } from "./Exsurge.Glyphs.js";
import type { ChantScore, Clef } from "./Exsurge.Chant.js";
import type { Accidental } from "./Exsurge.Chant.Signs.js";
import type { ChantContext, ChantNotationElement, Lyric } from "./Exsurge.Drawing.js";

/**
 * How ChantScore.layoutChantLines() breaks a score into lines: "greedy" (the
 * default) fills each line with as much as fits before going on to the next;
 * "optimal" chooses the breaks of the whole score together, as Gregorio does
 * (see LineBreaker).
 */
export type LineBreaking = "greedy" | "optimal";

// Gregorio's penalties (tex/gregoriotex-gsp-default.tex:26-50).  A penalty of
// 10000 or more is a place the line can't break at; -10000 or less is one it
// has to break at.
const penalties = {
  endOfWord: -100,
  endOfSyllable: -50,
  endOfElement: -50,
  afterBar: -200,
  // the \discretionary that Gregorio puts at a change of clef
  clefChange: -200
};
const infinitePenalty = 10000;

// TeX's paragraph parameters, as Gregorio sets them for a score
// (tex/gregoriotex-gsp-default.tex:52-58, tex/gregoriotex-spaces.tex:57-102),
// and the LaTeX defaults of those it leaves alone.
const pretolerance = 100;
const tolerance = 9000;
const looseness = -1;
const linePenalty = 10;
const adjDemerits = 10000;
// (Gregorio sets \doublehyphendemerits and \finalhyphendemerits to 0)

// TeX's badness of a line too loose or too tight to be set
const infiniteBadness = 10000;

// TeX's fitness classes
const veryLoose = 0,
  loose = 1,
  decent = 2,
  tight = 3;

// How far the space before a notation may stretch when a line is justified,
// in staff intervals, for badness = 100: Gregorio's interwordspacenotes is
// 0.29cm plus 0.05cm, and its bars' spaces stretch by 0.22787cm, on a staff
// whose lines are 0.287cm apart (tex/gregoriotex-gsp-default.tex:142, :215-229
// and tex/gregoriotex-main.tex:1868-1870 at \gre@factor 17).
const wordStretch = 0.05 / 0.287;
const barStretch = 0.22787 / 0.287;

// Gregorio doesn't break a syllable with fewer notes than this, nor within
// this many notes of either end of one (\gresetunbreakablesyllablenotes{10}{4}{4},
// tex/gregoriotex-syllable.tex:883-894)
const unbreakableSyllableNotes = 10;
const unbreakableInitialNotes = 4;
const unbreakableFinalNotes = 4;

// the end of a note's gabc where a space between neumes (/, //, a space or
// /[n]) ends the neume, which, unless the neume's allowLineBreakBeforeNext
// says otherwise (gabc /0, /! or ! before the space), a line can break at in
// Gregorio; where exsurge splits a run of notes into neumes itself, it can't
const breakableSpaceRegex = /(?:\/|\s|\/\[-?(?:\d+\.?\d*|\.\d+)\])$/;

/** where a line's staff starts and ends */
interface LineExtent {
  staffLeft: number;
  /** the space to the left of the drop cap */
  paddingLeft: number;
  staffRight: number;
}

/** a place where a line laid out from some notation could end */
interface LineEnd {
  /** the index of the notation the next line would start with (the number of notations, at the end of the score) */
  end: number;
  /** the space left at the right of the line, which is negative if it's too full */
  space: number;
  /** how much the line can be condensed */
  shrink: number;
  /** how much the line can be stretched, for a badness of 100 */
  stretch: number;
  /** Gregorio's penalty for breaking the line here */
  penalty: number;
  /** whether the line doesn't stretch to the end of the staff (the last line, or gabc Z) */
  ragged: boolean;
  /** the threshold that fitness and demerits were last worked out for (see fitLineEnd()) */
  threshold?: number;
  /** the line's fitness class, or null if it's too loose or too tight for threshold */
  fitness?: number | null;
  /** the line's demerits, but for adjDemerits */
  demerits?: number;
}

/**
 * how far a line laid out so far stretches, for a badness of 100: the sum of
 * the stretch before each notation that findNeumesToJustify() would find, in
 * the same order (see LineBreaker.addToStretch())
 */
interface Stretch {
  /** the last notation laid out (or the one after the accidental before it) */
  prev: ChantNotationElement | null;
  /** the last lyrics before prev, as findNeumesToJustify() merges them */
  prevLyrics: Lyric[];
  /** the last notation laid out, if it's an accidental, which is taken with the notation after it */
  accidental: ChantNotationElement | null;
  sum: number;
  /** the last custos without lyrics that sum includes the space before, which isn't stretched while it's the line's custos */
  custos: Custos | null;
  /** sum without the space before custos */
  sumWithoutCustos: number;
}

/**
 * a line laid out from some notation (see LineBreaker.layOutLineFrom()), and
 * what laying it out left on the notations, for the next layout of the score
 * to use it again (see LineBreaker.enterLine())
 */
interface MeasuredLine {
  ends: LineEnd[];
  /**
   * the index of the last notation that laying the line out looked at, or
   * the number of notations if it looked to the end of the score
   */
  lastRead: number;
  /** the indices of the first and last notations that it laid out (last < first if none) */
  first: number;
  last: number;
  /**
   * where what it left on the notations from first to last starts in its line
   * breaker's exits (see recordExit()), or -1 if it can't be used again (see
   * recordEntry())
   */
  exit: number;
}

/**
 * what the lines laid out in a layout of the score depend on besides the
 * notations themselves and the context's settings, for each notation (see
 * LineBreaker.getLayoutFacts())
 */
interface LayoutFacts {
  notations: ChantNotationElement[];
  timesLaidOut: Array<number | undefined>;
  /** the clef in effect before each notation */
  clefs: Clef[];
  keptInAreas: boolean[];
  /** (see LineBreaker.leavesTooLittleForLastLine()) */
  tooLittleForLastLine: boolean[];
  notesInSyllable: number[];
  notesBeforeInSyllable: number[];
  /** the notation that each notation's translation ends at */
  translationEnds: Array<ChantNotationElement | undefined>;
  /**
   * each notation's calculatedTrailingSpace and width, and its lyrics, with
   * the bounds.x, widthWithoutConnector and protrusionWidth of each from
   * lyricsAt[i] * 3 in lyricMetrics, as they are before any line is laid out
   * (see LineBreaker.recordEntry())
   */
  trailingSpaces: Float64Array;
  widths: Float64Array;
  /** 1 for each notation that a line can't be used again if it lays out (see recordEntry()) */
  notReusable: Uint8Array;
  lyrics: Lyric[];
  lyricsAt: Int32Array;
  lyricMetrics: Float64Array;
  /** the context's settings and the score's */
  settings: string;
  language: unknown;
}

// whether a number that a line read is the one it read before (where -0 isn't
// 0, NaN is NaN, and undefined, which is kept as NaN, is NaN)
const same = (a: number | undefined, b: number) =>
  a === b ? a !== 0 || 1 / a === 1 / b : Number.isNaN(b) && (a === undefined || Number.isNaN(a));

// how lyric.needsConnector is kept in LineBreaker.exits
const connectorCodes: Array<boolean | undefined> = [false, true, undefined];
const connectorCode = (needs: boolean | undefined) => (needs === undefined ? 2 : needs ? 1 : 0);

// the properties of a ChantContext that change as it lays a score out, or that
// only set others (minLyricWordSpacingRatio, which updateHyphenWidth() sets
// minLyricWordSpacing from)
const contextStateProperties = ["currNotationIndex", "textMetricsCacheSize", "minLyricWordSpacingRatio"];

/** a way to break the score into lines up to some notation, as TeX's active nodes are */
interface BreakNode {
  /** the index of the notation that the next line starts with */
  position: number;
  /** the number of lines before position */
  line: number;
  fitness: number;
  demerits: number;
  previous: BreakNode | null;
}

/**
 * Breaks a score into lines as Gregorio does (see the top of this module).
 * ChantScore.layoutChantLines() asks it where each line it builds should end.
 */
export class LineBreaker {
  score: ChantScore;
  ctxt: ChantContext;
  width: number;
  /**
   * how many lines more than the fewest it can be done in, or than the way
   * with the fewest demerits for each fitness class, that the ways of
   * breaking the score into lines up to a notation are kept for (see
   * findBreaks()): TeX keeps them all, but looks for the way with the fewest
   * demerits and then one with a line fewer (\looseness=-1)
   */
  extraLines = 2;
  /** where each line was planned to end, by its index and the notation it starts with */
  plannedEnds = new Map<string, number>();
  /** the lines laid out from each notation, by its index, for each place a line's staff can be */
  measuredLines: Array<{ extent: LineExtent; lines: Array<MeasuredLine | undefined> }> = [];
  /** the line breaker of the last layout, whose measured lines this one uses again where it can */
  previous: LineBreaker | null;
  /** (see getLayoutFacts()) */
  facts?: LayoutFacts;
  /**
   * for each notation, and the end of the score, the index it had in the
   * last layout, if nothing a line depends on has changed at it, or else -1;
   * or null, if nothing from the last layout can be used (see matchPrevious())
   */
  previousIndices?: Int32Array | null;
  /**
   * for each notation, the first of the notations up to it that have the
   * indices that follow on from it in the last layout
   */
  runStarts?: Int32Array;
  /**
   * what each line that can be used again left on the notations it laid out
   * (see recordExit()), up to exitsLength
   */
  exits: Float64Array = new Float64Array(1024);
  exitsLength = 0;
  /**
   * 1 for each notation that has been found to read as before (see
   * readsAsBefore()) since this plan() began, and since a line that can't be
   * used again laid it out (as only such a line can change what it reads)
   */
  checked?: Uint8Array;
  /** (see getNoteCounts()) */
  noteCounts?: {
    notesInSyllable: number[];
    notesBeforeInSyllable: number[];
    syllablesFrom: number[];
    notesFrom: number[];
  };

  constructor(score: ChantScore, ctxt: ChantContext, width: number, previous: LineBreaker | null = null) {
    this.score = score;
    this.ctxt = ctxt;
    this.width = width;
    this.previous = previous;
    // (which needs nothing from the one before it; and with room for as many
    // lines as it measured)
    if (previous) {
      previous.previous = null;
      this.exits = new Float64Array(Math.max(1024, previous.exitsLength + (previous.exitsLength >> 2)));
    }
  }

  /**
   * lets go of what the next layout won't use, once the lines are built: the
   * last layout's line breaker (the lines of which that could be used again
   * are kept in this one), and the room in exits that wasn't used
   */
  release() {
    this.previous = null;
    if (this.exits.length > this.exitsLength) this.exits = this.exits.slice(0, this.exitsLength);
  }

  /**
   * The index of the notation after the last one to go on the line with the
   * index lineIndex, which starts at the notation with the index start; or
   * undefined, if the line should be filled greedily (because the rest of the
   * score couldn't be broken into lines that fit).
   */
  plannedEnd(lineIndex: number, start: number) {
    var key = lineIndex + ":" + start;
    if (!this.plannedEnds.has(key)) {
      // the score hasn't been broken from here yet (or a line didn't end where
      // it was planned to), so break the rest of it from here
      var activeClef = this.ctxt.activeClef;
      try {
        this.plan(lineIndex, start);
      } finally {
        this.ctxt.activeClef = activeClef;
      }
    }
    return this.plannedEnds.get(key);
  }

  /** breaks the rest of the score into lines, from the line with the index lineIndex, which starts at start */
  plan(lineIndex: number, start: number) {
    // (as they are before any line is laid out, for the next layout to compare)
    this.getLayoutFacts();
    this.checked = new Uint8Array(this.score.notations.length);
    // As TeX does, look first for breaks where no line is looser or tighter
    // than the pretolerance allows, and then where none is more than the
    // tolerance allows, and look for a way to set the score in one line
    // fewer than the best (\looseness=-1) in each.  Where TeX would then
    // set a line as loose as it has to be, look for breaks with no limit on
    // how loose a line is (as TeX's \emergencystretch would let it be), so
    // that the lines still break only where Gregorio breaks them.
    var final: BreakNode | null = null,
      reached: BreakNode | null = null;
    for (var threshold of [pretolerance, tolerance, Infinity]) {
      var { best, bestLooser, farthest } = this.findBreaks(lineIndex, start, threshold);
      reached = farthest;
      if (best) final = bestLooser || best;
      if (bestLooser || (best && threshold >= tolerance)) break;
    }

    // (and if the rest of the score can't be broken into lines that fit,
    // because something that can't be broken is too wide for a line, plan the
    // lines as far as it can be, and fill the next one greedily: see
    // buildFromChantNotationIndex(); no line is planned from there, so
    // plannedEnd() gives undefined for it)
    var node = final || reached;
    var path: BreakNode[] = [];
    for (; node && node.previous; node = node.previous) path.unshift(node);
    var previousEnd = start;
    for (node of path) {
      this.plannedEnds.set(node.previous!.line + ":" + previousEnd, node.position);
      previousEnd = node.position;
    }
  }

  /**
   * TeX's line breaking: the way of breaking the score into lines from start
   * that has the fewest demerits, with no line looser or tighter than
   * threshold; and the way that has the fewest demerits with the number of
   * lines that \looseness asks for, if it isn't the same; or else the way to
   * break it into lines as far as it can be
   */
  findBreaks(lineIndex: number, start: number, threshold: number) {
    var notations = this.score.notations;
    // the nodes at each notation, one for each line and fitness, in the order
    // that they were first found in (which decides between two as good)
    var nodes = new Array<BreakNode[] | undefined>(notations.length + 1);
    var startNode: BreakNode = { position: start, line: lineIndex, fitness: decent, demerits: 0, previous: null };
    nodes[start] = [startNode];
    var farthest = startNode;

    for (var position = start; position < notations.length; position++) {
      var here = nodes[position];
      if (!here) continue;
      nodes[position] = undefined;
      // (the lines after a way to get here don't depend on how many lines it
      // took, only on its fitness class, so the way with the fewest demerits
      // in each fitness class is the only one in that class that can start
      // the best way to break the rest of the score.  Any other way that
      // takes more than extraLines lines more than the fewest it can be done
      // in, and than each of those, is left out, to keep the number of nodes
      // down; the ways that are kept are nearly always enough for \looseness
      // to choose from.)
      var fewestLines = Infinity,
        leastDemerits: BreakNode[] = [];
      for (var node of here) {
        fewestLines = Math.min(fewestLines, node.line);
        var least = leastDemerits[node.fitness];
        if (!least || node.demerits < least.demerits) leastDemerits[node.fitness] = node;
      }
      for (node of here) {
        if (
          node.line > fewestLines + this.extraLines &&
          !leastDemerits.some((least) => Math.abs(node.line - least.line) <= this.extraLines)
        )
          continue;
        if (node.position > farthest.position || (node.position === farthest.position && node.demerits < farthest.demerits))
          farthest = node;
        for (var lineEnd of this.getLineEnds(node.line, position)) {
          this.fitLineEnd(lineEnd, threshold);
          var fitness = lineEnd.fitness;
          if (fitness === null || fitness === undefined) continue;
          var demerits = lineEnd.demerits!;
          if (Math.abs(fitness - node.fitness) > 1) demerits += adjDemerits;
          demerits = node.demerits + demerits;

          var line = node.line + 1;
          var there = nodes[lineEnd.end] || (nodes[lineEnd.end] = []);
          var k = 0;
          while (k < there.length && (there[k].line !== line || there[k].fitness !== fitness)) k++;
          if (k < there.length && !(demerits < there[k].demerits)) continue;
          there[k] = { position: lineEnd.end, line, fitness, demerits, previous: node };
        }
      }
    }

    var ends = nodes[notations.length] || [];
    var best: BreakNode | null = null,
      bestLooser: BreakNode | null = null;
    for (node of ends) if (!best || node.demerits < best.demerits) best = node;
    for (node of ends) {
      if (node.line - best!.line === looseness && (!bestLooser || node.demerits < bestLooser.demerits))
        bestLooser = node;
    }
    return { best, bestLooser, farthest };
  }

  /**
   * the badness and the fitness class of a line, as TeX works them out, or
   * null if the line is too loose or too tight for the threshold (as a line
   * that has to break where it does, at gabc z, can be too: there is then
   * another way to break the lines before it, or else the last pass, with no
   * threshold, sets it however loose it is)
   */
  fit(lineEnd: LineEnd, threshold: number) {
    var badness: number,
      fitness: number;
    // (justifyElements() leaves the line alone when it's this close to full)
    var space = Math.abs(lineEnd.space) < 0.5 ? 0 : lineEnd.space;
    if (space >= 0) {
      if (lineEnd.ragged || space === 0) badness = 0;
      else if (lineEnd.stretch <= 0) badness = infiniteBadness;
      else badness = Math.min(infiniteBadness, 100 * Math.pow(space / lineEnd.stretch, 3));
      fitness = badness > 99 ? veryLoose : badness > 12 ? loose : decent;
    } else {
      // an overfull line
      if (-space > lineEnd.shrink) return null;
      badness = 100 * Math.pow(-space / lineEnd.shrink, 3);
      fitness = badness > 12 ? tight : decent;
    }
    if (badness > threshold) return null;
    return { badness, fitness };
  }

  /**
   * works out the fitness class of the line that ends at lineEnd and its
   * demerits, as TeX does, but for adjDemerits (see fit()), for threshold,
   * unless they have been already
   */
  fitLineEnd(lineEnd: LineEnd, threshold: number) {
    if (lineEnd.threshold === threshold) return;
    lineEnd.threshold = threshold;
    var fit = this.fit(lineEnd, threshold);
    if (!fit) {
      lineEnd.fitness = null;
      return;
    }
    var demerits = linePenalty + fit.badness;
    demerits = demerits >= 10000 ? 100000000 : demerits * demerits;
    if (lineEnd.penalty > 0) demerits += lineEnd.penalty * lineEnd.penalty;
    else if (lineEnd.penalty > -infinitePenalty) demerits -= lineEnd.penalty * lineEnd.penalty;
    lineEnd.fitness = fit.fitness;
    lineEnd.demerits = demerits;
  }

  /** where the line with the index lineIndex has its staff, if it starts at start */
  getLineExtent(lineIndex: number, start: number): LineExtent {
    // (as in buildFromChantNotationIndex(), the first line makes room for a
    // drop cap and/or annotation, if present)
    var score = this.score,
      staffLeft = 0,
      paddingLeft = 0;
    if (start === 0) {
      var padding = 0;
      if (score.dropCap) padding = score.dropCap.bounds.width + score.dropCap.padding * 2;
      if (score.annotation && (!this.ctxt.mergeAnnotationWithTextLeft || score.dropCap))
        padding = Math.max(padding, score.annotation.bounds.width + score.annotation.padding * 2);
      staffLeft += padding;
      if (score.dropCap) paddingLeft = (padding - score.dropCap.bounds.width) / 2;
    }
    return { staffLeft, paddingLeft, staffRight: this.width };
  }

  /** the ends of the lines that could start at start, as the line with the index lineIndex */
  getLineEnds(lineIndex: number, start: number) {
    var extent = this.getLineExtent(lineIndex, start);
    var lines = this.findMeasuredLines(extent);
    if (!lines) this.measuredLines.push({ extent, lines: (lines = []) });
    var line = lines[start];
    if (!line) {
      var reused = this.reuseLine(start, extent);
      lines[start] = line = reused && this.enterLine(reused) ? reused : this.layOutLineFrom(start, extent);
    }
    return line.ends;
  }

  /**
   * Uses a line measured in the last layout as though it had been laid out
   * again, if laying it out would read the same from the notations it lays
   * out as it did (see recordEntry()), by leaving them as laying it out left
   * them (see recordExit()); and returns whether it could.
   *
   * (Laying out a line leaves its notations where it put them, and the lines
   * laid out after it, and the ChantLines that are built, can start from
   * that: for instance, a translation is placed by where its end neume was
   * left, which can be on a later line.  So a line that isn't laid out again
   * has to leave the notations as it would have, when it would have.)
   */
  enterLine(line: MeasuredLine) {
    var notations = this.score.notations,
      exits = this.previous!.exits,
      i: number,
      k: number,
      at = line.exit,
      lyric: Lyric;
    for (k = at, i = line.first; i <= line.last; i++) {
      var notation = notations[i];
      if (!this.checked![i] && !this.readsAsBefore(notation, i)) return false;
      k++;
      for (lyric of notation.lyrics) {
        var required = exits[k + 2],
          span = lyric.connectorSpan;
        if (!Number.isNaN(required) && !same(span && span.textLength, required)) return false;
        k += 4;
      }
    }

    // (and kept for the next layout)
    var length = k - at;
    this.reserveExits(length);
    this.exits.set(exits.subarray(at, k), this.exitsLength);
    line.exit = this.exitsLength;
    this.exitsLength += length;

    for (k = at, i = line.first; i <= line.last; i++) {
      notation = notations[i];
      notation.bounds.x = exits[k++];
      for (lyric of notation.lyrics) {
        var needsConnector = connectorCodes[exits[k++]];
        span = lyric.connectorSpan;
        lyric.needsConnector = needsConnector as boolean;
        lyric.connectorWidth = exits[k++];
        // (as setNeedsConnector() leaves them)
        if (needsConnector) {
          lyric.bounds.width = lyric.widthWithoutConnector + lyric.getConnectorWidth();
          if (lyric.spans.length > 0 && lyric.spans[lyric.spans.length - 1] !== span) lyric.spans.push(span!);
        } else {
          lyric.bounds.width = lyric.widthWithoutConnector;
          if (lyric.spans.length > 0 && lyric.spans[lyric.spans.length - 1] === span) lyric.spans.pop();
        }
        k++;
        var textLength = exits[k++];
        if (span && textLength !== -Infinity) span.textLength = Number.isNaN(textLength) ? undefined : textLength;
      }
    }
    return true;
  }

  /**
   * whether a line laid out now would read from the notation at index what
   * it would have before any line was laid out (and as the lines that are
   * used again read it): it reads its calculatedTrailingSpace (which can be
   * left changed by the line before it, and is then read by the next) and
   * its width, and where its lyrics are and how wide they are without
   * connectors, and whether they have to be measured again
   */
  readsAsBefore(notation: ChantNotationElement, index: number) {
    var facts = this.facts!;
    if (
      !same(notation.calculatedTrailingSpace, facts.trailingSpaces[index]) ||
      !same(notation.bounds.width, facts.widths[index])
    )
      return false;
    var lyrics = facts.lyrics,
      metrics = facts.lyricMetrics,
      end = facts.lyricsAt[index + 1];
    for (var j = facts.lyricsAt[index], k = j * 3; j < end; j++, k += 3) {
      var lyric = lyrics[j];
      if (
        lyric.needsLayout ||
        !same(lyric.bounds.x, metrics[k]) ||
        !same(lyric.widthWithoutConnector, metrics[k + 1]) ||
        !same(lyric.protrusionWidth, metrics[k + 2])
      )
        return false;
    }
    this.checked![index] = 1;
    return true;
  }

  /**
   * Checks that the line can be used again, as it lays out the notation at
   * index next (and see recordExit()): not if laying it out reads or sets more
   * than recordExit() records.  A soft accidental can be shown or not, and
   * the neume before it spaced to suit; text only can be shrunk or wrapped to
   * fit; a notation can be given the negative trailing space of the one
   * before it; a lyric with no text, one that has to have a connector, and
   * one in the drop cap keep what their connectors were; a lyric that has to
   * be measured again is; and a notation without width is placed by the
   * notation that starts its group (see getLayoutFacts()).  And the rest that
   * it reads has to be as it was before any line was laid out (see
   * readsAsBefore()).
   */
  recordEntry(line: MeasuredLine, index: number) {
    if (line.exit < 0) return;
    if (
      this.facts!.notReusable[index] ||
      (!this.checked![index] && !this.readsAsBefore(this.score.notations[index], index))
    )
      line.exit = -1;
  }

  /**
   * records what laying out the line left on the notations it laid out, in
   * exits from line.exit: for each, where it is, and for each lyric, whether
   * it needs a connector (see connectorCodes) and the connector's width
   * (which give the lyric's width and spans, as setNeedsConnector() and
   * setConnectorWidth() set them), the textLength that the connector has to
   * have for the line to be used again (or NaN), and the connector's
   * textLength after (or -Infinity if laying out the line didn't set it).
   * (Laying out the line sets nothing else of the notations, where it can be
   * used again: see recordEntry().)
   */
  recordExit(line: MeasuredLine) {
    var notations = this.score.notations,
      facts = this.facts!,
      lyrics = facts.lyrics,
      lyricsAt = facts.lyricsAt;
    // (no notation's calculatedTrailingSpace can have changed, as none of the
    // notations that it can change on are laid out (see getLayoutFacts()), but
    // for the first, which is laid out after a copy of a clef)
    var first = line.first;
    if (
      line.exit >= 0 &&
      first <= line.last &&
      !same(notations[first].calculatedTrailingSpace, facts.trailingSpaces[first])
    )
      line.exit = -1;
    if (line.exit < 0) {
      // (and one that can't be used again can have changed what the lines
      // after it read from the notations it laid out, and from the
      // accidental after them: see spaceNeumeBeforeSoftAccidental())
      this.checked!.fill(0, line.first, line.last + 2);
      return;
    }
    var exits = this.reserveExits(line.last - first + 1 + 4 * (lyricsAt[line.last + 1] - lyricsAt[first])),
      k = (line.exit = this.exitsLength);
    for (var i = line.first; i <= line.last; i++) {
      exits[k++] = notations[i].bounds.x;
      for (var j = lyricsAt[i], end = lyricsAt[i + 1]; j < end; j++) {
        var lyric = lyrics[j],
          span = lyric.connectorSpan,
          textLength = span && span.textLength !== undefined ? span.textLength : NaN;
        exits[k++] = connectorCode(lyric.needsConnector);
        exits[k++] = lyric.connectorWidth;
        // Laying out the line sets the connector's width to 0, and then sets
        // it and the textLength together (in setConnectorWidth()), if at all.
        // So the textLength was set if the width isn't 0, and wasn't if the
        // width is 0 and the textLength isn't; if they're both 0, it was set
        // to 0 or left at 0, which is the same where it's 0 (as it then has to
        // be: see enterLine()).
        if (lyric.connectorWidth !== 0) {
          exits[k++] = NaN;
          exits[k++] = textLength;
        } else {
          exits[k++] = textLength === 0 ? 0 : NaN;
          exits[k++] = -Infinity;
        }
      }
    }
    this.exitsLength = k;
  }

  /** makes room for length more numbers in exits, and returns it */
  reserveExits(length: number) {
    if (this.exitsLength + length > this.exits.length) {
      var exits = new Float64Array(Math.max(this.exits.length * 2, this.exitsLength + length));
      exits.set(this.exits.subarray(0, this.exitsLength));
      this.exits = exits;
    }
    return this.exits;
  }

  /** the lines laid out from each notation with their staff at extent, if any have been */
  findMeasuredLines(extent: LineExtent) {
    for (var measured of this.measuredLines) {
      var other = measured.extent;
      if (
        other.staffLeft === extent.staffLeft &&
        other.paddingLeft === extent.paddingLeft &&
        other.staffRight === extent.staffRight
      )
        return measured.lines;
    }
    return undefined;
  }

  /**
   * the line laid out from start in the last layout, if it can be used again
   * and nothing that it depends on has changed since, with its notations'
   * indices moved to where they are now
   */
  reuseLine(start: number, extent: LineExtent): MeasuredLine | undefined {
    if (!this.previous || !this.matchPrevious()) return undefined;
    var indices = this.previousIndices!,
      previousStart = indices[start],
      lines = previousStart >= 0 && this.previous.findMeasuredLines(extent),
      line = lines && lines[previousStart];
    // (the line looked at the notations from the one before it, for a double
    // bar's lyrics, to its lastRead, which have to be the same ones in order)
    if (!line || line.exit < 0 || (start === 0) !== (previousStart === 0)) return undefined;
    var shift = start - previousStart,
      first = Math.max(start - 1, 0),
      last = line.lastRead + shift;
    if (last > this.score.notations.length || this.runStarts![last] > first) return undefined;
    return {
      ends: shift ? line.ends.map((end) => ({ ...end, end: end.end + shift })) : line.ends,
      lastRead: last,
      first: line.first + shift,
      last: line.last + shift,
      exit: line.exit
    };
  }

  /**
   * works out which notations are where they were in the last layout, with
   * nothing that a line depends on changed at them, and returns whether
   * anything from the last layout can be used
   */
  matchPrevious() {
    if (this.previousIndices !== undefined) return this.previousIndices !== null;
    var facts = this.getLayoutFacts(),
      before = this.previous && this.previous.facts;
    this.previousIndices = null;
    if (
      !before ||
      this.previous!.width !== this.width ||
      this.previous!.ctxt !== this.ctxt ||
      before.settings !== facts.settings ||
      before.language !== facts.language
    )
      return false;

    var previousIndex = new Map<ChantNotationElement, number>();
    before.notations.forEach((notation, i) => previousIndex.set(notation, i));
    var n = facts.notations.length,
      indices = (this.previousIndices = new Int32Array(n + 1)),
      runStarts = (this.runStarts = new Int32Array(n + 1));
    for (var i = 0; i <= n; i++) {
      var j = i === n ? before.notations.length : previousIndex.get(facts.notations[i]) ?? -1;
      if (
        j >= 0 &&
        i < n &&
        (facts.timesLaidOut[i] !== before.timesLaidOut[j] ||
          facts.clefs[i] !== before.clefs[j] ||
          facts.keptInAreas[i] !== before.keptInAreas[j] ||
          facts.tooLittleForLastLine[i] !== before.tooLittleForLastLine[j] ||
          facts.notesInSyllable[i] !== before.notesInSyllable[j] ||
          facts.notesBeforeInSyllable[i] !== before.notesBeforeInSyllable[j] ||
          facts.translationEnds[i] !== before.translationEnds[j] ||
          !this.sameAsBefore(before, j, i))
      )
        j = -1;
      indices[i] = j;
      runStarts[i] = j < 0 ? i + 1 : i > 0 && indices[i - 1] >= 0 && j === indices[i - 1] + 1 ? runStarts[i - 1] : i;
    }
    return true;
  }

  /**
   * whether the notation at index was as it was at previousIndex in the last
   * layout before any line was laid out, as readsAsBefore() reads it
   */
  sameAsBefore(before: LayoutFacts, previousIndex: number, index: number) {
    var facts = this.facts!,
      k = facts.lyricsAt[index],
      j = before.lyricsAt[previousIndex],
      end = before.lyricsAt[previousIndex + 1];
    if (
      !same(facts.trailingSpaces[index], before.trailingSpaces[previousIndex]) ||
      !same(facts.widths[index], before.widths[previousIndex]) ||
      end - j !== facts.lyricsAt[index + 1] - k
    )
      return false;
    for (; j < end; j++, k++) {
      if (
        before.lyrics[j] !== facts.lyrics[k] ||
        !same(facts.lyricMetrics[k * 3], before.lyricMetrics[j * 3]) ||
        !same(facts.lyricMetrics[k * 3 + 1], before.lyricMetrics[j * 3 + 1]) ||
        !same(facts.lyricMetrics[k * 3 + 2], before.lyricMetrics[j * 3 + 2])
      )
        return false;
    }
    return true;
  }

  /**
   * What a line laid out in this layout depends on, other than the notations
   * that it looks at and their own layout, for the next layout to compare
   * with its own.  (Anything else that it reads is either part of those
   * notations or is set again as the line is laid out.)
   */
  getLayoutFacts() {
    if (this.facts) return this.facts;
    var ctxt = this.ctxt,
      score = this.score,
      notations = score.notations,
      counts = this.getNoteCounts();
    var settings: string[] = [];
    for (var key of Object.keys(ctxt)) {
      var value = (ctxt as unknown as Record<string, unknown>)[key];
      if (
        contextStateProperties.includes(key) ||
        (typeof value === "object" && value !== null) ||
        typeof value === "function"
      )
        continue;
      settings.push(key + "=" + value);
    }
    settings.push("useDropCap=" + score.useDropCap);

    var clefs: Clef[] = [],
      clef = score.startingClef;
    for (var notation of notations) {
      clefs.push(clef);
      if (notation.isClef) clef = notation as Clef;
    }
    // (worked out for each layout of the score, by keepsInArea())
    if (notations.length) new ChantLine(score).keepsInArea(0);

    var trailingSpaces = new Float64Array(notations.length),
      widths = new Float64Array(notations.length),
      notReusable = new Uint8Array(notations.length),
      lyrics: Lyric[] = [],
      lyricsAt = new Int32Array(notations.length + 1);
    for (var i = 0; i < notations.length; i++) {
      notation = notations[i];
      var next = notations[i + 1];
      trailingSpaces[i] = notation.calculatedTrailingSpace;
      widths[i] = notation.bounds.width;
      if (
        notation.constructor === TextOnly ||
        (notation.isAccidental && (notation as Accidental).soft) ||
        (next && next.isAccidental && (next as Accidental).soft) ||
        notation.hasNoWidth ||
        notation.firstWithNoWidth ||
        // (which positionNotationElement() can give the negative trailing
        // space of the notation before it)
        (i > 0 && trailingSpaces[i - 1] < 0 && !notation.hasLyrics())
      )
        notReusable[i] = 1;
      lyricsAt[i] = lyrics.length;
      for (var lyric of notation.lyrics) {
        if (!lyric.originalText || lyric.forceConnector || lyric.dropCap) notReusable[i] = 1;
        lyrics.push(lyric);
      }
    }
    lyricsAt[notations.length] = lyrics.length;
    var lyricMetrics = new Float64Array(lyrics.length * 3);
    for (var k = 0; k < lyrics.length; k++) {
      lyric = lyrics[k];
      lyricMetrics[k * 3] = lyric.bounds.x;
      lyricMetrics[k * 3 + 1] = lyric.widthWithoutConnector;
      lyricMetrics[k * 3 + 2] = lyric.protrusionWidth === undefined ? NaN : lyric.protrusionWidth;
    }

    return (this.facts = {
      notations: notations.slice(),
      timesLaidOut: notations.map((notation) => notation.timesLaidOut),
      clefs,
      keptInAreas: notations.length ? score.keptInAreas!.slice() : [],
      tooLittleForLastLine: notations.map((notation, i) => this.leavesTooLittleForLastLine(i)),
      notesInSyllable: counts.notesInSyllable,
      notesBeforeInSyllable: counts.notesBeforeInSyllable,
      translationEnds: notations.map((notation) =>
        notation.translationText && notation.translationText.length ? notation.translationText[0].endNeume : undefined
      ),
      trailingSpaces,
      widths,
      notReusable,
      lyrics,
      lyricsAt,
      lyricMetrics,
      settings: settings.join(";"),
      language: ctxt.defaultLanguage
    });
  }

  /**
   * Lays out notations from start, as buildFromChantNotationIndex() would lay
   * them out on a line that ends where it was planned to, until the line is
   * too full to fit even when condensed, and gives each place the line could
   * end.
   */
  layOutLineFrom(start: number, extent: LineExtent): MeasuredLine {
    var ctxt = this.ctxt,
      score = this.score,
      notations = score.notations,
      lineEnds: LineEnd[] = [];
    var line = new ChantLine(score);
    line.notationsStartIndex = start;
    line.staffLeft = extent.staffLeft;
    line.paddingLeft = extent.paddingLeft;
    line.staffRight = extent.staffRight;
    line.extraTextOnlyIndex = null;
    line.extraTextOnlyLyricIndex = 0;

    // the lyrics of a double bar at the end of the line before go at the
    // start of this one (copied, as buildFromChantNotationIndex() copies them,
    // but leaving the double bar's own lyrics where they are)
    var beginningLyrics = start > 0 ? copyBeginningLyrics(ctxt, notations[start - 1]) : null;

    // the clef in effect at the start of the line
    var i = start;
    var startsWithClefChange = i < notations.length && !!notations[i].isClef;
    if (startsWithClefChange) {
      ctxt.activeClef = notations[i] as Clef;
      // (and a line break just after it ended the line before already)
      if (this.isClefLineBreak(i)) i++;
      i++;
      line.notationsStartIndex = i;
    } else {
      ctxt.activeClef = score.startingClef;
      for (var k = start - 1; k >= 0; k--) {
        if (notations[k].isClef) {
          ctxt.activeClef = notations[k] as Clef;
          break;
        }
      }
    }
    line.startingClef = ctxt.activeClef.clone();
    line.startingClef.performLayout(ctxt);
    if (ctxt.clefVisibility !== "visible" && !startsWithClefChange) line.startingClef.hide(ctxt);
    line.startingClef.bounds.x = line.staffLeft;

    var curr: ChantNotationElement = line.startingClef;
    if (beginningLyrics) LyricArray.setNotation(beginningLyrics, curr);
    if (curr.hasLyrics()) LyricArray.mergeIn(line.lastLyrics, curr.lyrics);

    var condensableSpaces = Object.assign([], { sum: 0 });
    var stretch: Stretch = { prev: null, prevLyrics: [], accidental: null, sum: 0, custos: null, sumWithoutCustos: 0 };
    var prevNeume: ChantNotationElement = curr;
    // a translation that the line can't break within, until its end neume
    var translationStart: ChantNotationElement | null = null;

    var measured: MeasuredLine = { ends: lineEnds, lastRead: 0, first: i, last: i - 1, exit: 0 };

    for (; i < notations.length; i++) {
      if (!isHiddenAccidental(curr) && curr.constructor !== TextOnly) prevNeume = curr;
      curr = notations[i];

      if (line.numNotationsOnLine > 0) {
        // a clef just before a line break goes at the start of the next line
        if (this.isClefLineBreak(i)) {
          line.clefLineBreak = notations[i + 1] as ChantLineBreak;
          lineEnds.push(
            this.getLineEnd(line, i, condensableSpaces.sum, stretch, -infinitePenalty, !line.clefLineBreak.justify)
          );
          return this.finishMeasuredLine(measured, i);
        }
        var penalty = this.getPenalty(line, i, translationStart);
        if (penalty < infinitePenalty)
          lineEnds.push(this.getLineEnd(line, i, condensableSpaces.sum, stretch, penalty, false));
      }

      this.recordEntry(measured, i);
      measured.last = i;

      if (curr.isAccidental && (curr as Accidental).soft)
        (curr as Accidental).setHidden(ctxt, !line.isSoftAccidentalVisible(i));
      else if (curr.isNeume) line.spaceNeumeBeforeSoftAccidental(ctxt, i);

      // (lyrics an earlier layout of the lines wrapped or moved go back, as in
      // buildFromChantNotationIndex(), before any line is planned around them)
      restoreLyrics(ctxt, curr);

      if (isHiddenAccidental(curr)) curr.bounds.x = prevNeume.bounds.right() + prevNeume.calculatedTrailingSpace;
      else {
        var textOnly = curr.constructor === TextOnly && (curr as TextOnly).hasLyrics() ? (curr as TextOnly).lyrics[0] : null,
          resize = textOnly && textOnly.resize;
        line.positionNotationElement(ctxt, line.lastLyrics, prevNeume, curr, Infinity, condensableSpaces);
        // (text only that it shrank to fit the line, in setMaxWidth(), is
        // measured again before it's laid out on another line, as text that
        // it wrapped is, so that the line built starts from the same text
        // as it would have without this one)
        if (textOnly && textOnly.resize !== resize) textOnly.needsLayout = true;
      }

      if (curr.hasLyrics()) LyricArray.mergeIn(line.lastLyrics, curr.lyrics);

      if (translationStart && curr === translationStart.translationText![0].endNeume) translationStart = null;
      else if (curr.translationText && curr.translationText.length && curr.translationText[0].endNeume)
        translationStart = curr;

      line.numNotationsOnLine++;
      this.addToStretch(line, stretch, i);
      if (curr.isClef) ctxt.activeClef = curr as Clef;

      if (curr.constructor === ChantLineBreak) {
        lineEnds.push(
          this.getLineEnd(line, i + 1, condensableSpaces.sum, stretch, -infinitePenalty, !(curr as ChantLineBreak).justify)
        );
        return this.finishMeasuredLine(measured, i);
      }

      if (curr.constructor === Custos) line.custos = curr as Custos;
      else if (curr.isNeume) line.custos = null;

      // the line can't go on once it's too full even when condensed
      var right = curr.bounds.right();
      if (curr.hasLyrics()) right = Math.max(right, LyricArray.getRight(curr.lyrics, false, true));
      if (right - condensableSpaces.sum > line.staffRight) return this.finishMeasuredLine(measured, i);
    }

    lineEnds.push(this.getLineEnd(line, notations.length, condensableSpaces.sum, stretch, -infinitePenalty, true));
    return this.finishMeasuredLine(measured, notations.length - 1);
  }

  /**
   * finishes measuring a line laid out as far as the notation at last, which
   * looked at the two after it as well (in isClefLineBreak() and
   * spaceNeumeBeforeSoftAccidental()), and on to the next neume (in
   * getLineEnd(), wantsEolCustos() and isTextOnlyBeforeDivider())
   */
  finishMeasuredLine(line: MeasuredLine, last: number): MeasuredLine {
    var notations = this.score.notations,
      lastRead = last + 1;
    while (lastRead < notations.length && !notations[lastRead].isNeume) lastRead++;
    line.lastRead = Math.min(Math.max(lastRead, last + 2), notations.length);
    this.recordExit(line);
    return line;
  }

  /**
   * adds the space that justifying the line could stretch before the
   * notation at index, which has just been laid out on it, to stretch, as
   * findNeumesToJustify() would find it
   */
  addToStretch(line: ChantLine, stretch: Stretch, index: number) {
    var notation = this.score.notations[index],
      curr = notation;
    // (an accidental is taken with the notation after it)
    if (stretch.accidental) {
      curr = stretch.accidental;
      stretch.accidental = null;
    } else if (notation.isAccidental) {
      stretch.accidental = notation;
      return;
    }
    var prev = stretch.prev;
    stretch.prev = notation;
    if (!prev) return;
    LyricArray.mergeIn(stretch.prevLyrics, prev.lyrics);
    if (!line.canJustifyBefore(prev, curr, notation, index, stretch.prevLyrics)) return;

    var amount = this.getStretchBefore(curr);
    if (!notation.hasLyrics() && notation.constructor === Custos) {
      stretch.custos = notation as Custos;
      stretch.sumWithoutCustos = stretch.sum;
    } else stretch.sumWithoutCustos += amount;
    stretch.sum += amount;
  }

  /** how far the space before a notation stretches, for a badness of 100 */
  getStretchBefore(notation: ChantNotationElement) {
    var notations = this.score.notations;
    var index = notation.notationIndex ?? notations.indexOf(notation);
    var nextToBar = notation.isDivider || (index > 0 && notations[index - 1].isDivider);
    return (nextToBar ? barStretch : wordStretch) * this.ctxt.staffInterval;
  }

  /**
   * whether the clef at index goes at the start of the next line, along with
   * the line break just after it, as buildFromChantNotationIndex() puts it
   */
  isClefLineBreak(index: number) {
    var notations = this.score.notations;
    return (
      !!notations[index].isClef &&
      !notations[index].hasLyrics() &&
      index + 1 < notations.length - 1 &&
      notations[index + 1].constructor === ChantLineBreak &&
      !notations[index + 1].hasLyrics()
    );
  }

  /**
   * Gregorio's penalty for breaking the line just before the notation at
   * index, or infinitePenalty where the line can't break; translationStart is
   * the notation with a translation that is still going on there
   */
  getPenalty(line: ChantLine, index: number, translationStart: ChantNotationElement | null) {
    var notations = this.score.notations,
      prev = notations[index - 1],
      next = notations[index],
      firstNote = next.notes && next.notes[0];
    // nowhere that buildFromChantNotationIndex() wouldn't break a line either
    if (
      next.isDivider ||
      next.constructor === Custos ||
      next.constructor === ChantLineBreak ||
      isTextOnlyBeforeDivider(notations, index) ||
      prev.firstWithNoWidth ||
      translationStart ||
      (firstNote && (firstNote.shape === NoteShape.Quilisma || firstNote.shape === NoteShape.Inclinatum)) ||
      (prev.keepWithNext && !prev.allowLineBreakBeforeNext) ||
      this.leavesTooLittleForLastLine(index) ||
      // (nor in a no-line-break or euouae area, gabc <nlba> or <eu>)
      line.keepsInArea(index - 1)
    )
      return infinitePenalty;

    if (next.isClef) return penalties.clefChange;
    if (prev.isDivider) return penalties.afterBar;
    if (next.firstOfParentheses) return this.startsWord(index) ? penalties.endOfWord : penalties.endOfSyllable;

    // a syllable breaks only at a space between its neumes in the gabc, and
    // only if it is long enough
    var lastNote = prev.notes && prev.notes[prev.notes.length - 1];
    if (!prev.allowLineBreakBeforeNext || !lastNote || !breakableSpaceRegex.test(lastNote.sourceGabc))
      return infinitePenalty;
    var counts = this.getNoteCounts(),
      notesBefore = counts.notesBeforeInSyllable[index],
      notes = counts.notesInSyllable[index];
    if (
      notes < unbreakableSyllableNotes ||
      notesBefore < unbreakableInitialNotes ||
      notes - notesBefore < unbreakableFinalNotes
    )
      return infinitePenalty;
    return penalties.endOfElement;
  }

  /** whether the notation at index starts a word */
  startsWord(index: number) {
    var notations = this.score.notations,
      prev = notations[index - 1],
      next = notations[index];
    // (each gabc word has a mapping of its own)
    if (next.mapping && prev.mapping) return next.mapping !== prev.mapping;
    return (
      next.hasLyrics() &&
      (next.lyrics[0].lyricType === LyricType.BeginningSyllable ||
        next.lyrics[0].lyricType === LyricType.SingleSyllable)
    );
  }

  /**
   * whether a line break before the notation at index would leave fewer than
   * ctxt.minSyllablesLastLine syllables and ctxt.minNotesLastLine notes for
   * the last line
   */
  leavesTooLittleForLastLine(index: number) {
    var ctxt = this.ctxt;
    if (!ctxt.minSyllablesLastLine || !ctxt.minNotesLastLine) return false;
    var counts = this.getNoteCounts();
    return (
      counts.syllablesFrom[index] < ctxt.minSyllablesLastLine && counts.notesFrom[index] < ctxt.minNotesLastLine
    );
  }

  /**
   * for each notation, the notes in its syllable, and in its syllable before
   * it; and the syllables with text and the notes from it to the end of the
   * score
   */
  getNoteCounts() {
    if (!this.noteCounts) {
      var notations = this.score.notations,
        n = notations.length;
      var counts = (this.noteCounts = {
        notesInSyllable: new Array<number>(n),
        notesBeforeInSyllable: new Array<number>(n),
        syllablesFrom: new Array<number>(n + 1).fill(0),
        notesFrom: new Array<number>(n + 1).fill(0)
      });
      var syllableStart = 0,
        notes = 0;
      var endSyllable = (end: number) => {
        for (var k = syllableStart; k < end; k++) counts.notesInSyllable[k] = notes;
      };
      for (var k = 0; k < n; k++) {
        var notation = notations[k];
        if (notation.firstOfParentheses && k > 0) {
          endSyllable(k);
          syllableStart = k;
          notes = 0;
        }
        counts.notesBeforeInSyllable[k] = notes;
        if (notation.isNeume) notes += notation.notes!.length;
      }
      endSyllable(n);
      for (k = n - 1; k >= 0; k--) {
        counts.syllablesFrom[k] = counts.syllablesFrom[k + 1] + (notations[k].hasLyrics() ? 1 : 0);
        counts.notesFrom[k] = counts.notesFrom[k + 1] + (notations[k].notes || []).length;
      }
    }
    return this.noteCounts;
  }

  /** what the line laid out so far would be like if it ended just before the notation at end */
  getLineEnd(
    line: ChantLine,
    end: number,
    shrink: number,
    stretchable: Stretch,
    penalty: number,
    ragged: boolean
  ): LineEnd {
    var ctxt = this.ctxt,
      notations = this.score.notations;
    // as getWhitespaceOnRight() works it out once the line is built, with a
    // hyphen after the last syllable if its word goes on to the next line, and
    // the custos at the end of the line
    var last = notations[end - 1];
    var neumeRight = last.bounds.right() + last.calculatedTrailingSpace;
    var lyricRight = line.lastLyrics.length ? LyricArray.getRight(line.lastLyrics, true, true) : 0;
    var custos = !!line.custos;
    if (line.custos) {
      neumeRight += line.custos.bounds.width + line.custos.leadingSpace;
      if (line.custos.hasLyrics()) lyricRight = LyricArray.getRight(line.custos.lyrics, false, true);
    } else if (end < notations.length && line.wantsEolCustos(ctxt)) {
      for (var k = end; k < notations.length && !custos; k++) custos = !!notations[k].isNeume;
      if (custos) neumeRight += Glyphs.CustosLong.bounds.width * ctxt.glyphScaling;
    }
    var space = line.staffRight - Math.max(lyricRight, neumeRight);

    // and how far it stretches, which only matters for a line that isn't
    // full and isn't ragged
    var stretch = 0;
    if (space >= 0.5 && !ragged) stretch = this.getStretch(line, end, custos, stretchable);

    return { end, space, shrink, stretch, penalty, ragged };
  }

  /**
   * how far a line that ends just before the notation at end stretches, for a
   * badness of 100, when justifyElements() justifies it: the space before
   * each notation in findNeumesToJustify() is stretched by the same amount
   * (as added up in stretchable by addToStretch())
   */
  getStretch(line: ChantLine, end: number, custos: boolean, stretchable: Stretch) {
    var ctxt = this.ctxt,
      notations = this.score.notations,
      stretch = 0;
    if (stretchable.accidental) {
      // (which findNeumesToJustify() takes with the notation after the line)
      line.findNeumesToJustify([]);
      for (var notation of line.toJustify!) stretch += this.getStretchBefore(notation!);
    } else
      stretch =
        stretchable.custos && stretchable.custos === line.custos ? stretchable.sumWithoutCustos : stretchable.sum;
    // (and before the custos, if the next line starts a word)
    var next = notations[end];
    if (
      custos &&
      next &&
      next.hasLyrics() &&
      (next.lyrics[0].lyricType === LyricType.BeginningSyllable ||
        next.lyrics[0].lyricType === LyricType.SingleSyllable)
    )
      stretch += wordStretch * ctxt.staffInterval;
    return stretch;
  }
}
