import { ChantLine } from "./Exsurge.Chant.ChantLine.js";
import { Custos } from "./Exsurge.Chant.Signs.js";
import type { ChantScore } from "./Exsurge.Chant.js";
import type { ChantContext, ChantNotationElement, Lyric } from "./Exsurge.Drawing.js";
/**
 * How ChantScore.layoutChantLines() breaks a score into lines: "greedy" (the
 * default) fills each line with as much as fits before going on to the next;
 * "optimal" chooses the breaks of the whole score together, as Gregorio does
 * (see LineBreaker).
 */
export type LineBreaking = "greedy" | "optimal";
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
export declare class LineBreaker {
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
    extraLines: number;
    /** where each line was planned to end, by its index and the notation it starts with */
    plannedEnds: Map<string, number>;
    /** the ends of the lines that could start at each notation, by its index, for each place a line's staff can be */
    lineEnds: Array<{
        extent: LineExtent;
        ends: Array<LineEnd[] | undefined>;
    }>;
    /** (see getNoteCounts()) */
    noteCounts?: {
        notesInSyllable: number[];
        notesBeforeInSyllable: number[];
        syllablesFrom: number[];
        notesFrom: number[];
    };
    constructor(score: ChantScore, ctxt: ChantContext, width: number);
    /**
     * The index of the notation after the last one to go on the line with the
     * index lineIndex, which starts at the notation with the index start; or
     * undefined, if the line should be filled greedily (because the rest of the
     * score couldn't be broken into lines that fit).
     */
    plannedEnd(lineIndex: number, start: number): number | undefined;
    /** breaks the rest of the score into lines, from the line with the index lineIndex, which starts at start */
    plan(lineIndex: number, start: number): void;
    /**
     * TeX's line breaking: the way of breaking the score into lines from start
     * that has the fewest demerits, with no line looser or tighter than
     * threshold; and the way that has the fewest demerits with the number of
     * lines that \looseness asks for, if it isn't the same; or else the way to
     * break it into lines as far as it can be
     */
    findBreaks(lineIndex: number, start: number, threshold: number): {
        best: BreakNode | null;
        bestLooser: BreakNode | null;
        farthest: BreakNode;
    };
    /**
     * the badness and the fitness class of a line, as TeX works them out, or
     * null if the line is too loose or too tight for the threshold (as a line
     * that has to break where it does, at gabc z, can be too: there is then
     * another way to break the lines before it, or else the last pass, with no
     * threshold, sets it however loose it is)
     */
    fit(lineEnd: LineEnd, threshold: number): {
        badness: number;
        fitness: number;
    } | null;
    /**
     * works out the fitness class of the line that ends at lineEnd and its
     * demerits, as TeX does, but for adjDemerits (see fit()), for threshold,
     * unless they have been already
     */
    fitLineEnd(lineEnd: LineEnd, threshold: number): void;
    /** where the line with the index lineIndex has its staff, if it starts at start */
    getLineExtent(lineIndex: number, start: number): LineExtent;
    /** the ends of the lines that could start at start, as the line with the index lineIndex */
    getLineEnds(lineIndex: number, start: number): LineEnd[];
    /**
     * Lays out notations from start, as buildFromChantNotationIndex() would lay
     * them out on a line that ends where it was planned to, until the line is
     * too full to fit even when condensed, and gives each place the line could
     * end.
     */
    layOutLineFrom(start: number, extent: LineExtent): LineEnd[];
    /**
     * adds the space that justifying the line could stretch before the
     * notation at index, which has just been laid out on it, to stretch, as
     * findNeumesToJustify() would find it
     */
    addToStretch(line: ChantLine, stretch: Stretch, index: number): void;
    /** how far the space before a notation stretches, for a badness of 100 */
    getStretchBefore(notation: ChantNotationElement): number;
    /**
     * whether the clef at index goes at the start of the next line, along with
     * the line break just after it, as buildFromChantNotationIndex() puts it
     */
    isClefLineBreak(index: number): boolean;
    /**
     * Gregorio's penalty for breaking the line just before the notation at
     * index, or infinitePenalty where the line can't break; translationStart is
     * the notation with a translation that is still going on there
     */
    getPenalty(line: ChantLine, index: number, translationStart: ChantNotationElement | null): number;
    /** whether the notation at index starts a word */
    startsWord(index: number): boolean;
    /**
     * whether a line break before the notation at index would leave fewer than
     * ctxt.minSyllablesLastLine syllables and ctxt.minNotesLastLine notes for
     * the last line
     */
    leavesTooLittleForLastLine(index: number): boolean;
    /**
     * for each notation, the notes in its syllable, and in its syllable before
     * it; and the syllables with text and the notes from it to the end of the
     * score
     */
    getNoteCounts(): {
        notesInSyllable: number[];
        notesBeforeInSyllable: number[];
        syllablesFrom: number[];
        notesFrom: number[];
    };
    /** what the line laid out so far would be like if it ended just before the notation at end */
    getLineEnd(line: ChantLine, end: number, shrink: number, stretchable: Stretch, penalty: number, ragged: boolean): LineEnd;
    /**
     * how far a line that ends just before the notation at end stretches, for a
     * badness of 100, when justifyElements() justifies it: the space before
     * each notation in findNeumesToJustify() is stretched by the same amount
     * (as added up in stretchable by addToStretch())
     */
    getStretch(line: ChantLine, end: number, custos: boolean, stretchable: Stretch): number;
}
export {};
//# sourceMappingURL=Exsurge.Chant.LineBreaking.d.ts.map