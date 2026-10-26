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
// It is used when ctxt.lineBreaking is "optimal" (see ChantScore.layoutChantLines).
//

import {
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
import type { ChantContext, ChantNotationElement } from "./Exsurge.Drawing.js";

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

// how much further than it can stretch a line has to stretch to be as bad as
// a line can be: 100 * 4.65^3 > infiniteBadness
const hopelessStretch = 4.65;

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
}

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
  /** the ends of the lines that could start at a notation, by its index and where the line's staff is */
  lineEnds = new Map<string, LineEnd[]>();
  /** (see getNoteCounts()) */
  noteCounts?: {
    notesInSyllable: number[];
    notesBeforeInSyllable: number[];
    syllablesFrom: number[];
    notesFrom: number[];
  };

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
    // the nodes at each notation, by their line and fitness
    var nodes = new Map<number, Map<string, BreakNode>>();
    var startNode: BreakNode = { position: start, line: lineIndex, fitness: decent, demerits: 0, previous: null };
    nodes.set(start, new Map([["", startNode]]));
    var farthest = startNode;

    for (var position = start; position < notations.length; position++) {
      var here = nodes.get(position);
      if (!here) continue;
      nodes.delete(position);
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
      for (var node of here.values()) {
        fewestLines = Math.min(fewestLines, node.line);
        var least = leastDemerits[node.fitness];
        if (!least || node.demerits < least.demerits) leastDemerits[node.fitness] = node;
      }
      for (node of here.values()) {
        if (
          node.line > fewestLines + this.extraLines &&
          !leastDemerits.some((least) => Math.abs(node.line - least.line) <= this.extraLines)
        )
          continue;
        if (node.position > farthest.position || (node.position === farthest.position && node.demerits < farthest.demerits))
          farthest = node;
        for (var lineEnd of this.getLineEnds(node.line, position)) {
          var fit = this.fit(lineEnd, threshold);
          if (!fit) continue;
          var demerits = linePenalty + fit.badness;
          demerits = demerits >= 10000 ? 100000000 : demerits * demerits;
          if (lineEnd.penalty > 0) demerits += lineEnd.penalty * lineEnd.penalty;
          else if (lineEnd.penalty > -infinitePenalty) demerits -= lineEnd.penalty * lineEnd.penalty;
          if (Math.abs(fit.fitness - node.fitness) > 1) demerits += adjDemerits;

          var next: BreakNode = {
            position: lineEnd.end,
            line: node.line + 1,
            fitness: fit.fitness,
            demerits: node.demerits + demerits,
            previous: node
          };
          var key = next.line + ":" + next.fitness;
          var there = nodes.get(next.position);
          if (!there) nodes.set(next.position, (there = new Map()));
          var other = there.get(key);
          if (!other || next.demerits < other.demerits) there.set(key, next);
        }
      }
    }

    var ends = Array.from((nodes.get(notations.length) || new Map<string, BreakNode>()).values());
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
    var key = [start, extent.staffLeft, extent.paddingLeft, extent.staffRight].join(":");
    var lineEnds = this.lineEnds.get(key);
    if (!lineEnds) this.lineEnds.set(key, (lineEnds = this.layOutLineFrom(start, extent)));
    return lineEnds;
  }

  /**
   * Lays out notations from start, as buildFromChantNotationIndex() would lay
   * them out on a line that ends where it was planned to, until the line is
   * too full to fit even when condensed, and gives each place the line could
   * end.
   */
  layOutLineFrom(start: number, extent: LineExtent) {
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
    // (the number of dividers on the line, for getLineEnd())
    var dividers = 0;
    var prevNeume: ChantNotationElement = curr;
    // a translation that the line can't break within, until its end neume
    var translationStart: ChantNotationElement | null = null;

    for (; i < notations.length; i++) {
      if (!isHiddenAccidental(curr) && curr.constructor !== TextOnly) prevNeume = curr;
      curr = notations[i];

      if (line.numNotationsOnLine > 0) {
        // a clef just before a line break goes at the start of the next line
        if (this.isClefLineBreak(i)) {
          line.clefLineBreak = notations[i + 1] as ChantLineBreak;
          lineEnds.push(
            this.getLineEnd(line, i, condensableSpaces.sum, dividers, -infinitePenalty, !line.clefLineBreak.justify)
          );
          return lineEnds;
        }
        var penalty = this.getPenalty(line, i, translationStart);
        if (penalty < infinitePenalty)
          lineEnds.push(this.getLineEnd(line, i, condensableSpaces.sum, dividers, penalty, false));
      }

      // (as in buildFromChantNotationIndex(), from what the notation's own
      // layout left, whatever lines it was laid out on before)
      resetNotation(ctxt, curr);

      if (curr.isAccidental && (curr as Accidental).soft)
        (curr as Accidental).setHidden(ctxt, !line.isSoftAccidentalVisible(i));
      else if (curr.isNeume) line.spaceNeumeBeforeSoftAccidental(ctxt, i);

      if (isHiddenAccidental(curr)) curr.bounds.x = prevNeume.bounds.right() + prevNeume.calculatedTrailingSpace;
      else line.positionNotationElement(ctxt, line.lastLyrics, prevNeume, curr, Infinity, condensableSpaces);

      if (curr.hasLyrics()) LyricArray.mergeIn(line.lastLyrics, curr.lyrics);

      if (translationStart && curr === translationStart.translationText![0].endNeume) translationStart = null;
      else if (curr.translationText && curr.translationText.length && curr.translationText[0].endNeume)
        translationStart = curr;

      line.numNotationsOnLine++;
      if (curr.isDivider) dividers++;
      if (curr.isClef) ctxt.activeClef = curr as Clef;

      if (curr.constructor === ChantLineBreak) {
        lineEnds.push(
          this.getLineEnd(line, i + 1, condensableSpaces.sum, dividers, -infinitePenalty, !(curr as ChantLineBreak).justify)
        );
        return lineEnds;
      }

      if (curr.constructor === Custos) line.custos = curr as Custos;
      else if (curr.isNeume) line.custos = null;

      // the line can't go on once it's too full even when condensed
      var right = curr.bounds.right();
      if (curr.hasLyrics()) right = Math.max(right, LyricArray.getRight(curr.lyrics, false, true));
      if (right - condensableSpaces.sum > line.staffRight) return lineEnds;
    }

    lineEnds.push(this.getLineEnd(line, notations.length, condensableSpaces.sum, dividers, -infinitePenalty, true));
    return lineEnds;
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
    dividers: number,
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
    // full and isn't ragged; and a line too loose to be set even if the space
    // before every notation on it stretched as a bar's does is as bad as a
    // line can be anyway
    var stretch = 0;
    if (space >= 0.5 && !ragged) {
      var mostStretch =
        (line.numNotationsOnLine * wordStretch + 2 * dividers * (barStretch - wordStretch) + wordStretch) *
        ctxt.staffInterval;
      stretch = space > mostStretch * hopelessStretch ? mostStretch : this.getStretch(line, end, custos);
    }

    return { end, space, shrink, stretch, penalty, ragged };
  }

  /**
   * how far a line that ends just before the notation at end stretches, for a
   * badness of 100, when justifyElements() justifies it: the space before
   * each notation in findNeumesToJustify() is stretched by the same amount
   */
  getStretch(line: ChantLine, end: number, custos: boolean) {
    var ctxt = this.ctxt,
      notations = this.score.notations,
      stretch = 0;
    line.findNeumesToJustify([]);
    for (var notation of line.toJustify!) {
      var index = notation!.notationIndex ?? notations.indexOf(notation!);
      var nextToBar = notation!.isDivider || (index > 0 && notations[index - 1].isDivider);
      stretch += (nextToBar ? barStretch : wordStretch) * ctxt.staffInterval;
    }
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
