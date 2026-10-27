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
// Laying out the lines takes most of the time, so the next layouts of the
// score use them again (see LineBreaker.getTrialLine()) while the notations
// that a line read are the same ones, not laid out again since, and the
// settings are the same.  A line laid out to some width gives each place it
// could end without the width (see TrialLine.ends), so it serves any narrower
// width as well.  What the notations after a line and the rest of the score
// say about where it can end, and about its custos, is worked out for each
// layout instead (see LineBreaker.fitLineEnds()).
//
// It is used when ctxt.lineBreaking is "optimal" (see ChantScore.layoutChantLines).
//

import {
  allowsCustosBefore,
  ChantLine,
  copyBeginningLyrics,
  isHiddenAccidental,
  isTextOnlyBeforeDivider,
  resetNotation
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

// Each place where a line laid out from some notation could end, as it is
// whatever the width (see LineBreaker.layOutLineFrom()), is kept as
// lineEndSize numbers in a row in TrialLine.ends, at these offsets (which
// takes a quarter of the memory that an object for each would)
const lineEndSize = 8;
// the index of the notation the next line would start with (the number of
// notations, at the end of the score), less the index of the one the line
// starts with
const endAt = 0;
// how far right the line goes, as getWhitespaceOnRight() measures it: its
// last notation or lyric, or its own custos if it has one (see custosKinds)
const rightAt = 1;
// how far right it goes with an automatic custos at its end
const rightWithCustosAt = 2;
// how far right the notations before this end go, condensed as far as they
// can be: the line can end here on a staff that ends there or further right
const reachAt = 3;
// how much the line can be condensed
const shrinkAt = 4;
// how much the line can be stretched, for a badness of 100 (see fit())
const stretchAt = 5;
// Gregorio's penalty for breaking the line here, as far as the line's own
// notations say (see LineBreaker.isBlocked() for the rest)
const penaltyAt = 6;
// the index in custosKinds of what the line's own notations say about an
// automatic custos at its end (see ChantLine.eolCustos()), or "own" if it has
// a custos of its own, with the flags below
const flagsAt = 7;
const custosKinds = ["never", "allowed", "always", "own"] as const;
const custosMask = 3;
// whether the next line starts a word, so that the space before a custos at
// the end of this one stretches too
const nextStartsWordFlag = 4;
// whether the line doesn't stretch to the end of the staff (the last line, or gabc Z)
const raggedFlag = 8;

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
 * the notations that a line laid out from the one at start reads (see
 * LineBreaker.layOutLineFrom()): from the one before it (whose lyrics it can
 * start with), up to two after the last that it lays out, where last is
 * (which spaceNeumeBeforeSoftAccidental() and isClefLineBreak() look at),
 * or to the end of the score
 */
const readFrom = (start: number) => Math.max(0, start - 1);
const readTo = (last: number, notationCount: number) => Math.min(notationCount, last + 3);

/** a line laid out from some notation (see LineBreaker.layOutLineFrom()) */
interface TrialLine {
  /** where its staff starts (where it ends is up to the layout that uses it) */
  staffLeft: number;
  paddingLeft: number;
  /** the clef in effect at its start, and that clef's layoutId */
  clef: Clef;
  clefLayoutId?: number;
  /** the notations that it read (see readFrom()), and their layoutIds */
  read: ChantNotationElement[];
  layoutIds: Array<number | undefined>;
  /** whether the notations it read went on to the end of the score */
  toEnd: boolean;
  /**
   * each notation with a translation that it laid out, followed by the end
   * neume of its translation, which an edit can change without laying the
   * notation out again (see Gabc.updateMappingsFromSource())
   */
  translationEnds: Array<ChantNotationElement | undefined>;
  /**
   * the widths it serves: from how far right it was laid out to, or with no
   * limit if it ended of its own accord, down to any narrower width, unless
   * it laid out text only syllables, which are fitted to the staff
   * (positionNotationElement() calls Lyric.setMaxWidth())
   */
  widest: number;
  narrowest: number;
  /**
   * each place it could end (see lineEndSize), in order, from where it
   * starts, so that they move with it if notations before it are added or
   * taken away
   */
  ends: number[];
}

/** the lines laid out from each notation by the last layouts of a score, by the notation */
interface TrialLines {
  /** the settings they were laid out with (see LineBreaker.getSettings()) */
  settings: string;
  lines: Map<ChantNotationElement, TrialLine[]>;
  /** the last layouts' plans (see LineBreaker.planAgain()) */
  plans: Plan[];
}

/** where a layout planned each line to end (see LineBreaker.planAgain()) */
interface Plan {
  /** the width, the staff beside the drop cap and how many lines are beside it, and extraLines */
  key: string;
  startingClef: Clef;
  notations: ChantNotationElement[];
  layoutIds: Array<number | undefined>;
  /** the end neume of each notation's translation (see TrialLine.translationEnds) */
  translationEnds: Array<ChantNotationElement | undefined>;
  plannedEnds: Map<string, number>;
}
const trialLines = new WeakMap<ChantScore, TrialLines>();

// the context's properties that are the state of a layout rather than its
// settings (and minLyricWordSpacingRatio, which only gives minLyricWordSpacing)
const contextState = ["currNotationIndex", "textMetricsCacheSize", "minLyricWordSpacingRatio"];

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
  /** the ends of the lines that could start at each notation, by its index, for each place a line's staff can start */
  lineEnds: Array<{ extent: LineExtent; ends: Array<number[] | undefined> }> = [];
  /** the lines laid out from each notation by this layout and the last ones (see getTrialLine()) */
  trialLines?: TrialLines;
  /** a line for keepsInArea() to ask */
  areaLine?: ChantLine;
  /** (see getAfter()) */
  after?: { blocked: Uint8Array; custos: Uint8Array };
  /** (see getNoteCounts()) */
  noteCounts?: {
    notesInSyllable: number[];
    notesBeforeInSyllable: number[];
    syllablesFrom: number[];
    notesFrom: number[];
  };
  /** the clef in effect just before each notation (see clefBefore()) */
  clefs?: Clef[];

  constructor(score: ChantScore, ctxt: ChantContext, width: number) {
    this.score = score;
    this.ctxt = ctxt;
    this.width = width;
  }

  /**
   * The index of the notation after the last one to go on the line with the
   * index lineIndex, which starts at the notation with the index start; or
   * undefined, if the line should be filled greedily (because the rest of the
   * score couldn't be broken into lines that fit).
   */
  plannedEnd(lineIndex: number, start: number) {
    var key = lineIndex + ":" + start;
    if (!this.plannedEnds.has(key) && !(lineIndex === 0 && start === 0 && this.planAgain())) {
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

  /**
   * whether an earlier layout planned the lines of the same notations, laid
   * out as they are now, at the same width, as this layout would (and it
   * then uses its plan); or else keeps this layout's plan for later ones
   */
  planAgain() {
    var cache = this.getTrialLines(),
      score = this.score,
      notations = score.notations,
      key = [this.width, JSON.stringify(this.getLineExtent(0, 0)), score.linesBesideDropCap(), this.extraLines].join(";"),
      translationEnds = notations.map((notation) => notation.translationText?.[0]?.endNeume);
    var same = (plan: Plan) =>
      plan.key === key &&
      plan.startingClef === score.startingClef &&
      plan.notations.length === notations.length &&
      notations.every(
        (notation, k) =>
          notation === plan.notations[k] &&
          notation.layoutId === plan.layoutIds[k] &&
          translationEnds[k] === plan.translationEnds[k]
      );
    var plan = cache.plans.find(same);
    if (plan) {
      this.plannedEnds = plan.plannedEnds;
      return true;
    }
    // (the last plan at each of two widths)
    cache.plans = [
      ...cache.plans.filter((plan) => plan.key !== key).slice(-1),
      {
        key,
        startingClef: score.startingClef,
        notations: notations.slice(),
        layoutIds: notations.map((notation) => notation.layoutId),
        translationEnds,
        plannedEnds: this.plannedEnds
      }
    ];
    return false;
  }

  /** breaks the rest of the score into lines, from the line with the index lineIndex, which starts at start */
  plan(lineIndex: number, start: number) {
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
    // (the lines that start further right, as getLineExtent() lays them out)
    var besideDropCap = this.score.linesBesideDropCap();

    for (var position = start; position < notations.length; position++) {
      var here = nodes[position];
      if (!here) continue;
      nodes[position] = undefined;
      // (once past the lines beside the drop cap, the lines after a way to
      // get here don't depend on how many lines it took, only on its fitness
      // class, so the way with the fewest demerits in each fitness class is
      // the only one in that class that can start the best way to break the
      // rest of the score.  Any other way that takes more than extraLines
      // lines more than the fewest it can be done in, and than each of those,
      // is left out, to keep the number of nodes down; the ways that are kept
      // are nearly always enough for \looseness to choose from.)
      var fewestLines = Infinity,
        leastDemerits: BreakNode[] = [];
      // (the lines that start here that fit, and the ends they're for: see fitLineEnds())
      var fits: number[] = [],
        fitted: number[] | null = null;
      for (var node of here) {
        if (node.line < besideDropCap) continue;
        fewestLines = Math.min(fewestLines, node.line);
        var least = leastDemerits[node.fitness];
        if (!least || node.demerits < least.demerits) leastDemerits[node.fitness] = node;
      }
      for (node of here) {
        if (
          node.line >= besideDropCap &&
          node.line > fewestLines + this.extraLines &&
          !leastDemerits.some((least) => Math.abs(node.line - least.line) <= this.extraLines)
        )
          continue;
        if (node.position > farthest.position || (node.position === farthest.position && node.demerits < farthest.demerits))
          farthest = node;
        var lineEnds = this.getLineEnds(node.line, position);
        if (lineEnds !== fitted) {
          fitted = lineEnds;
          fits = this.fitLineEnds(position, lineEnds, threshold);
        }
        for (var f = 0; f < fits.length; f += 3) {
          var end = fits[f],
            fitness = fits[f + 1],
            demerits = fits[f + 2];
          if (Math.abs(fitness - node.fitness) > 1) demerits += adjDemerits;
          demerits = node.demerits + demerits;

          var line = node.line + 1;
          var there = nodes[end] || (nodes[end] = []);
          var k = 0;
          while (k < there.length && (there[k].line !== line || there[k].fitness !== fitness)) k++;
          if (k < there.length && !(demerits < there[k].demerits)) continue;
          there[k] = { position: end, line, fitness, demerits, previous: node };
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
   * the badness and the fitness class of the line that ends at the end at k
   * in ends, as TeX works them out, or null if the line is too loose or too
   * tight for the threshold (as a line that has to break where it does, at
   * gabc z, can be too: there is then another way to break the lines before
   * it, or else the last pass, with no threshold, sets it however loose it is)
   */
  fit(ends: number[], k: number, hasCustos: boolean, threshold: number) {
    var badness: number,
      fitness: number,
      flags = ends[k + flagsAt];
    // the space left at the right of the line, which is negative if it's too
    // full (justifyElements() leaves the line alone when it's this close to full)
    var space = this.width - ends[k + (hasCustos ? rightWithCustosAt : rightAt)];
    if (Math.abs(space) < 0.5) space = 0;
    if (space >= 0) {
      var stretch = ends[k + stretchAt];
      if (hasCustos && flags & nextStartsWordFlag) stretch += wordStretch * this.ctxt.staffInterval;
      if (flags & raggedFlag || space === 0) badness = 0;
      else if (stretch <= 0) badness = infiniteBadness;
      else badness = Math.min(infiniteBadness, 100 * Math.pow(space / stretch, 3));
      fitness = badness > 99 ? veryLoose : badness > 12 ? loose : decent;
    } else {
      // an overfull line
      var shrink = ends[k + shrinkAt];
      if (-space > shrink) return null;
      badness = 100 * Math.pow(-space / shrink, 3);
      fitness = badness > 12 ? tight : decent;
    }
    if (badness > threshold) return null;
    return { badness, fitness };
  }

  /**
   * the lines that start at start and end at one of ends (see TrialLine.ends)
   * that fit for threshold (see fit()), up to the first that is too full even
   * when condensed: for each, the index of the notation the next line starts
   * with, its fitness class and its demerits, as TeX works them out but for
   * adjDemerits
   */
  fitLineEnds(start: number, ends: number[], threshold: number) {
    var fits: number[] = [];
    // (the line can't go on once it's too full even when condensed)
    for (var k = 0; k < ends.length && !(ends[k + reachAt] > this.width); k += lineEndSize) {
      var end = start + ends[k + endAt],
        penalty = ends[k + penaltyAt];
      if (penalty > -infinitePenalty && this.isBlockedAt(end)) continue;
      var fit = this.fit(ends, k, this.hasCustos(ends[k + flagsAt] & custosMask, end), threshold);
      if (!fit) continue;
      var demerits = linePenalty + fit.badness;
      demerits = demerits >= 10000 ? 100000000 : demerits * demerits;
      if (penalty > 0) demerits += penalty * penalty;
      else if (penalty > -infinitePenalty) demerits -= penalty * penalty;
      fits.push(end, fit.fitness, demerits);
    }
    return fits;
  }

  /** where the line with the index lineIndex has its staff, if it starts at start */
  getLineExtent(lineIndex: number, start: number): LineExtent {
    // (as in buildFromChantNotationIndex(), the lines beside a drop cap
    // and/or annotation, if present, make room for it)
    var score = this.score;
    if (start === 0) lineIndex = 0;
    var extent = score.lineExtent(this.ctxt, lineIndex, this.width);
    var paddingLeft = lineIndex === 0 && score.dropCap ? (extent.left - score.dropCap.bounds.width) / 2 : 0;
    return { staffLeft: extent.left, paddingLeft, staffRight: extent.right };
  }

  /** the ends of the lines that could start at start, as the line with the index lineIndex */
  getLineEnds(lineIndex: number, start: number) {
    var extent = this.getLineExtent(lineIndex, start);
    var k = 0;
    for (; k < this.lineEnds.length; k++) {
      var other = this.lineEnds[k].extent;
      if (
        other.staffLeft === extent.staffLeft &&
        other.paddingLeft === extent.paddingLeft &&
        other.staffRight === extent.staffRight
      )
        break;
    }
    if (k === this.lineEnds.length) this.lineEnds.push({ extent, ends: [] });
    var ends = this.lineEnds[k].ends;
    return ends[start] || (ends[start] = this.getTrialLine(start, extent).ends);
  }

  /**
   * the line laid out from the notation at start on a staff at extent: as an
   * earlier layout laid it out, if laying it out again would give the same,
   * or else laid out now (and kept for the next layouts)
   */
  getTrialLine(start: number, extent: LineExtent) {
    var cache = this.getTrialLines(),
      notation = this.score.notations[start],
      lines = cache.lines.get(notation) || [];
    for (var k = lines.length - 1; k >= 0; k--) {
      var line = lines[k];
      if (
        line.staffLeft === extent.staffLeft &&
        line.paddingLeft === extent.paddingLeft &&
        line.narrowest <= this.width &&
        this.width <= line.widest &&
        this.isUpToDate(line, start)
      )
        return line;
    }
    var laidOut = this.layOutLineFrom(start, extent);
    // (in place of those it serves for, but keeping a few on staffs that
    // start elsewhere, or for other widths)
    lines = lines.filter(
      (line) =>
        line.staffLeft !== extent.staffLeft ||
        line.paddingLeft !== extent.paddingLeft ||
        line.narrowest < laidOut.narrowest ||
        line.widest > laidOut.widest
    );
    cache.lines.set(notation, [...lines.slice(-3), laidOut]);
    return laidOut;
  }

  /** whether laying out the line from start again would give the same as line */
  isUpToDate(line: TrialLine, start: number) {
    var notations = this.score.notations,
      from = readFrom(start),
      read = line.read;
    if (line.toEnd !== (from + read.length === notations.length) || from + read.length > notations.length)
      return false;
    for (var k = 0; k < read.length; k++) {
      var notation = notations[from + k];
      if (notation !== read[k] || notation.layoutId !== line.layoutIds[k]) return false;
    }
    var ends = line.translationEnds;
    for (k = 0; k < ends.length; k += 2) if (ends[k]!.translationText![0].endNeume !== ends[k + 1]) return false;
    var clef = this.clefAt(start);
    return clef === line.clef && clef.layoutId === line.clefLayoutId;
  }

  /**
   * the lines laid out by the last layouts of the score, unless the settings
   * have changed since, without those from notations no longer in it
   */
  getTrialLines() {
    if (!this.trialLines) {
      var settings = this.getSettings(),
        notations = this.score.notations;
      this.trialLines = trialLines.get(this.score);
      if (!this.trialLines || this.trialLines.settings !== settings) {
        this.trialLines = { settings, lines: new Map(), plans: [] };
        trialLines.set(this.score, this.trialLines);
      }
      for (var notation of this.trialLines.lines.keys())
        if (notations[notation.notationIndex!] !== notation) this.trialLines.lines.delete(notation);
    }
    return this.trialLines;
  }

  /**
   * what lines laid out from the score depend on besides its notations: the
   * context's settings, and whether the score has a drop cap (but for the
   * settings that are objects, such as the text styles, which the notations
   * are laid out again for: see ChantScore.performLayout())
   */
  getSettings() {
    var ctxt = this.ctxt as unknown as Record<string, unknown>,
      settings = "useDropCap=" + this.score.useDropCap;
    for (var key of Object.keys(ctxt)) {
      var value = ctxt[key];
      if (typeof value !== "object" && typeof value !== "function" && !contextState.includes(key))
        settings += ";" + key + "=" + value;
    }
    return settings;
  }

  /**
   * Lays out notations from start, as buildFromChantNotationIndex() would lay
   * them out on a line that ends where it was planned to, until the line is
   * too full to fit even when condensed, and gives each place the line could
   * end, with what it read (see TrialLine).
   */
  layOutLineFrom(start: number, extent: LineExtent): TrialLine {
    var ctxt = this.ctxt,
      score = this.score,
      notations = score.notations,
      ends: number[] = [];
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
    var clef = (ctxt.activeClef = this.clefAt(start));
    var startsWithClefChange = clef === notations[i];
    if (startsWithClefChange) {
      // (and a line break just after it ended the line before already)
      if (this.isClefLineBreak(i)) i++;
      i++;
      line.notationsStartIndex = i;
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
    // how far right the notations laid out go, condensed (see reachAt);
    // the last of them; how wide a staff the line serves (see TrialLine); and
    // whether it fitted a text only syllable to its staff
    var reach = -Infinity,
      laidOut = start - 1,
      widest = Infinity,
      fitted = false,
      translationEnds: Array<ChantNotationElement | undefined> = [];
    // (a place where the line could end, just before the notation at end)
    var addLineEnd = (end: number, penalty: number, ragged: boolean) =>
      this.addLineEnd(ends, start, line, end, condensableSpaces.sum, reach, stretch, penalty, ragged);

    for (; i < notations.length; i++) {
      if (!isHiddenAccidental(curr) && curr.constructor !== TextOnly) prevNeume = curr;
      curr = notations[i];

      if (line.numNotationsOnLine > 0) {
        // a clef just before a line break goes at the start of the next line
        if (this.isClefLineBreak(i)) {
          line.clefLineBreak = notations[i + 1] as ChantLineBreak;
          addLineEnd(i, -infinitePenalty, !line.clefLineBreak.justify);
          break;
        }
        var penalty = this.getPenalty(i, translationStart);
        if (penalty < infinitePenalty) addLineEnd(i, penalty, false);
      }

      // (as in buildFromChantNotationIndex(), from what the notation's own
      // layout left, whatever lines it was laid out on before)
      resetNotation(ctxt, curr);

      if (curr.isAccidental && (curr as Accidental).soft)
        (curr as Accidental).setHidden(ctxt, !line.isSoftAccidentalVisible(i));
      else if (curr.isNeume) line.spaceNeumeBeforeSoftAccidental(ctxt, i);

      if (isHiddenAccidental(curr)) curr.bounds.x = prevNeume.bounds.right() + prevNeume.calculatedTrailingSpace;
      else line.positionNotationElement(ctxt, line.lastLyrics, prevNeume, curr, Infinity, condensableSpaces);
      if (curr.constructor === TextOnly && (curr as TextOnly).lyrics.length === 1) fitted = true;
      laidOut = i;

      if (curr.hasLyrics()) LyricArray.mergeIn(line.lastLyrics, curr.lyrics);

      if (translationStart && curr === translationStart.translationText![0].endNeume) translationStart = null;
      else if (curr.translationText && curr.translationText.length && curr.translationText[0].endNeume)
        translationStart = curr;
      if (curr.translationText && curr.translationText.length)
        translationEnds.push(curr, curr.translationText[0].endNeume);

      line.numNotationsOnLine++;
      this.addToStretch(line, stretch, i);
      if (curr.isClef) ctxt.activeClef = curr as Clef;

      if (curr.constructor === ChantLineBreak) {
        addLineEnd(i + 1, -infinitePenalty, !(curr as ChantLineBreak).justify);
        break;
      }

      if (curr.constructor === Custos) line.custos = curr as Custos;
      else if (curr.isNeume) line.custos = null;

      // the line can't go on once it's too full even when condensed
      var right = curr.bounds.right();
      if (curr.hasLyrics()) right = Math.max(right, LyricArray.getRight(curr.lyrics, false, true));
      reach = Math.max(reach, right - condensableSpaces.sum);
      if (reach > line.staffRight) {
        widest = line.staffRight;
        break;
      }
    }

    if (i === notations.length) addLineEnd(notations.length, -infinitePenalty, true);

    var from = readFrom(start),
      to = readTo(laidOut, notations.length),
      read = notations.slice(from, to);
    return {
      staffLeft: extent.staffLeft,
      paddingLeft: extent.paddingLeft,
      clef,
      clefLayoutId: clef.layoutId,
      read,
      layoutIds: read.map((notation) => notation.layoutId),
      toEnd: to === notations.length,
      translationEnds,
      widest: fitted ? extent.staffRight : widest,
      narrowest: fitted ? extent.staffRight : 0,
      // (without the room left to add more)
      ends: ends.slice()
    };
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

  /** the clef in effect at the start of a line that starts at index: the one there, or else the one before it */
  clefAt(index: number) {
    var notation = this.score.notations[index];
    return notation.isClef ? (notation as Clef) : this.clefBefore(index);
  }

  /** the clef in effect just before the notation at index */
  clefBefore(index: number) {
    if (!this.clefs) {
      // (worked out once, rather than by looking back from each line)
      var clef = this.score.startingClef;
      this.clefs = this.score.notations.map((notation) => {
        var before = clef;
        if (notation.isClef) clef = notation as Clef;
        return before;
      });
    }
    return this.clefs[index];
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
   * index, or infinitePenalty where the line can't break, as far as the
   * line's own notations say (isBlocked() says the rest); translationStart is
   * the notation with a translation that is still going on there
   */
  getPenalty(index: number, translationStart: ChantNotationElement | null) {
    var notations = this.score.notations,
      prev = notations[index - 1],
      next = notations[index],
      firstNote = next.notes && next.notes[0];
    // nowhere that buildFromChantNotationIndex() wouldn't break a line either
    if (
      next.isDivider ||
      next.constructor === Custos ||
      next.constructor === ChantLineBreak ||
      prev.firstWithNoWidth ||
      translationStart ||
      (firstNote && (firstNote.shape === NoteShape.Quilisma || firstNote.shape === NoteShape.Inclinatum)) ||
      (prev.keepWithNext && !prev.allowLineBreakBeforeNext)
    )
      return infinitePenalty;

    if (next.isClef) return penalties.clefChange;
    if (prev.isDivider) return penalties.afterBar;
    if (next.firstOfParentheses) return this.startsWord(index) ? penalties.endOfWord : penalties.endOfSyllable;

    // a syllable breaks only at a space between its neumes in the gabc (and
    // only if it is long enough: see isBlocked())
    var lastNote = prev.notes && prev.notes[prev.notes.length - 1];
    if (!prev.allowLineBreakBeforeNext || !lastNote || !breakableSpaceRegex.test(lastNote.sourceGabc))
      return infinitePenalty;
    return penalties.endOfElement;
  }

  /**
   * whether a line can't break just before the notation at index after all,
   * whichever line it ends, for what comes after it or the rest of the score
   * (getPenalty() works out the rest): before text only notations that come
   * just before a divider, where too little would be left for the last line,
   * in a no-line-break or euouae area (gabc <nlba> or <eu>), or within a
   * syllable too short to break in
   */
  isBlocked(index: number) {
    var notations = this.score.notations,
      prev = notations[index - 1],
      next = notations[index];
    if (
      isTextOnlyBeforeDivider(notations, index) ||
      this.leavesTooLittleForLastLine(index) ||
      this.keepsInArea(index - 1)
    )
      return true;
    // (where getPenalty() lets the line break within a syllable)
    if (next.isClef || prev.isDivider || next.firstOfParentheses) return false;
    var counts = this.getNoteCounts(),
      notesBefore = counts.notesBeforeInSyllable[index],
      notes = counts.notesInSyllable[index];
    return (
      notes < unbreakableSyllableNotes ||
      notesBefore < unbreakableInitialNotes ||
      notes - notesBefore < unbreakableFinalNotes
    );
  }

  /** (see ChantLine.keepsInArea()) */
  keepsInArea(index: number) {
    if (!this.areaLine) this.areaLine = new ChantLine(this.score);
    return this.areaLine.keepsInArea(index);
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

  /**
   * adds to ends (see TrialLine.ends) what the line laid out so far from
   * start would be like if it ended just before the notation at end, where
   * the notations laid out reach right as far as reach
   */
  addLineEnd(
    ends: number[],
    start: number,
    line: ChantLine,
    end: number,
    shrink: number,
    reach: number,
    stretchable: Stretch,
    penalty: number,
    ragged: boolean
  ) {
    var ctxt = this.ctxt,
      notations = this.score.notations;
    // as getWhitespaceOnRight() works it out once the line is built, with a
    // hyphen after the last syllable if its word goes on to the next line, and
    // the custos at the end of the line
    var last = notations[end - 1];
    var neumeRight = last.bounds.right() + last.calculatedTrailingSpace;
    var lyricRight = line.lastLyrics.length ? LyricArray.getRight(line.lastLyrics, true, true) : 0;
    var custos: (typeof custosKinds)[number] = "never";
    if (line.custos) {
      custos = "own";
      neumeRight += line.custos.bounds.width + line.custos.leadingSpace;
      if (line.custos.hasLyrics()) lyricRight = LyricArray.getRight(line.custos.lyrics, false, true);
    } else if (end < notations.length) custos = line.eolCustos(ctxt);
    var right = Math.max(lyricRight, neumeRight);

    var next = notations[end];
    var nextStartsWord =
      !!next &&
      next.hasLyrics() &&
      (next.lyrics[0].lyricType === LyricType.BeginningSyllable ||
        next.lyrics[0].lyricType === LyricType.SingleSyllable);
    ends.push(
      end - start,
      right,
      custos === "own" ? right : Math.max(lyricRight, neumeRight + Glyphs.CustosLong.bounds.width * ctxt.glyphScaling),
      reach,
      shrink,
      // (which only matters for a line that isn't full and isn't ragged)
      this.getStretch(line, stretchable),
      penalty,
      custosKinds.indexOf(custos) | (nextStartsWord ? nextStartsWordFlag : 0) | (ragged ? raggedFlag : 0)
    );
  }

  /**
   * how far a line stretches, for a badness of 100, when justifyElements()
   * justifies it: the space before each notation in findNeumesToJustify() is
   * stretched by the same amount (as added up in stretchable by
   * addToStretch()), but for the space before a custos at its end
   */
  getStretch(line: ChantLine, stretchable: Stretch) {
    if (stretchable.accidental) {
      // (which findNeumesToJustify() takes with the notation after the line)
      var stretch = 0;
      line.findNeumesToJustify([]);
      for (var notation of line.toJustify!) stretch += this.getStretchBefore(notation!);
      return stretch;
    }
    return stretchable.custos && stretchable.custos === line.custos ? stretchable.sumWithoutCustos : stretchable.sum;
  }

  /**
   * what the notations after a line that ends just before each notation, and
   * the rest of the score, say about it in this layout, worked out once for
   * each place (see isBlockedAt() and hasCustos())
   */
  getAfter() {
    var notations = this.score.notations;
    return this.after || (this.after = { blocked: new Uint8Array(notations.length), custos: new Uint8Array(notations.length) });
  }

  /** whether a line can't end just before the notation at end after all (see isBlocked()) */
  isBlockedAt(end: number) {
    var after = this.getAfter();
    if (!after.blocked[end]) after.blocked[end] = this.isBlocked(end) ? 2 : 1;
    return after.blocked[end] === 2;
  }

  /**
   * whether a line that ends just before the notation at end has a custos at
   * its end, where custos is the index in custosKinds of what its own
   * notations say, for what the notations after it say (see allowsCustosBefore())
   */
  hasCustos(custos: number, end: number) {
    var kind = custosKinds[custos];
    if (kind === "own" || kind === "never") return kind === "own";
    var after = this.getAfter(),
      notations = this.score.notations;
    // (1 if no neume comes after the line, 2 if one does, 3 if the notations after it allow a custos too)
    if (!after.custos[end]) {
      var neume = false;
      for (var k = end; k < notations.length && !neume; k++) neume = !!notations[k].isNeume;
      after.custos[end] = !neume ? 1 : allowsCustosBefore(notations, end) ? 3 : 2;
    }
    return kind === "always" ? after.custos[end] > 1 : after.custos[end] === 3;
  }
}
