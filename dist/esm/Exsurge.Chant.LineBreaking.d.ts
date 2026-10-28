import { ChantLine } from "./Exsurge.Chant.ChantLine.js";
import { Custos } from "./Exsurge.Chant.Signs.js";
import type { ChantScore, Clef } from "./Exsurge.Chant.js";
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
export declare const readFrom: (start: number) => number;
export declare const readTo: (last: number, notationCount: number) => number;
/**
 * the notations that laying out a line read, as they were then: laying it out
 * again gives the same while they're the same (see isReadUpToDate()), and the
 * clef in effect at its start is too
 */
export interface ReadNotations {
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
}
/**
 * whether the notations that a line read from the one at from (see
 * readFrom()) are still the score's notations there, not laid out again
 * since, with the same ends to their translations, and going on to the end of
 * the score only if they did then (for a line at the end of the score
 * finishes differently)
 */
export declare function isReadUpToDate(notations: ChantNotationElement[], from: number, line: ReadNotations): boolean;
/**
 * what lines laid out from the score depend on besides its notations: the
 * context's settings, and whether the score has a drop cap (but for the
 * settings that are objects, such as the text styles, which the notations
 * are laid out again for: see ChantScore.performLayout())
 */
export declare function layoutSettings(score: ChantScore, ctxt: ChantContext): string;
/** a line laid out from some notation (see LineBreaker.layOutLineFrom()) */
interface TrialLine extends ReadNotations {
    /** where its staff starts (where it ends is up to the layout that uses it) */
    staffLeft: number;
    paddingLeft: number;
    /** the clef in effect at its start, and that clef's layoutId */
    clef: Clef;
    clefLayoutId?: number;
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
    /** the settings they were laid out with (see layoutSettings()) */
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
    /** the ends of the lines that could start at each notation, by its index, for each place a line's staff can start */
    lineEnds: Array<{
        extent: LineExtent;
        ends: Array<number[] | undefined>;
    }>;
    /** the lines laid out from each notation by this layout and the last ones (see getTrialLine()) */
    trialLines?: TrialLines;
    /** a line for keepsInArea() to ask */
    areaLine?: ChantLine;
    /** (see getAfter()) */
    after?: {
        blocked: Uint8Array;
        custos: Uint8Array;
    };
    /** (see getNoteCounts()) */
    noteCounts?: {
        notesInSyllable: number[];
        notesBeforeInSyllable: number[];
        syllablesFrom: number[];
        notesFrom: number[];
    };
    /** the clef in effect just before each notation (see clefBefore()) */
    clefs?: Clef[];
    constructor(score: ChantScore, ctxt: ChantContext, width: number);
    /**
     * The index of the notation after the last one to go on the line with the
     * index lineIndex, which starts at the notation with the index start; or
     * undefined, if the line should be filled greedily (because the rest of the
     * score couldn't be broken into lines that fit).
     */
    plannedEnd(lineIndex: number, start: number): number | undefined;
    /**
     * whether an earlier layout planned the lines of the same notations, laid
     * out as they are now, at the same width, as this layout would (and it
     * then uses its plan); or else keeps this layout's plan for later ones
     */
    planAgain(): boolean;
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
     * the badness and the fitness class of the line that ends at the end at k
     * in ends, as TeX works them out, or null if the line is too loose or too
     * tight for the threshold (as a line that has to break where it does, at
     * gabc z, can be too: there is then another way to break the lines before
     * it, or else the last pass, with no threshold, sets it however loose it is)
     */
    fit(ends: number[], k: number, hasCustos: boolean, threshold: number): {
        badness: number;
        fitness: number;
    } | null;
    /**
     * the lines that start at start and end at one of ends (see TrialLine.ends)
     * that fit for threshold (see fit()), up to the first that is too full even
     * when condensed: for each, the index of the notation the next line starts
     * with, its fitness class and its demerits, as TeX works them out but for
     * adjDemerits
     */
    fitLineEnds(start: number, ends: number[], threshold: number): number[];
    /** where the line with the index lineIndex has its staff, if it starts at start */
    getLineExtent(lineIndex: number, start: number): LineExtent;
    /** the ends of the lines that could start at start, as the line with the index lineIndex */
    getLineEnds(lineIndex: number, start: number): number[];
    /**
     * the line laid out from the notation at start on a staff at extent: as an
     * earlier layout laid it out, if laying it out again would give the same,
     * or else laid out now (and kept for the next layouts)
     */
    getTrialLine(start: number, extent: LineExtent): TrialLine;
    /** whether laying out the line from start again would give the same as line */
    isUpToDate(line: TrialLine, start: number): boolean;
    /**
     * the lines laid out by the last layouts of the score, unless the settings
     * have changed since, without those from notations no longer in it
     */
    getTrialLines(): TrialLines;
    /** (see layoutSettings()) */
    getSettings(): string;
    /**
     * Lays out notations from start, as buildFromChantNotationIndex() would lay
     * them out on a line that ends where it was planned to, until the line is
     * too full to fit even when condensed, and gives each place the line could
     * end, with what it read (see TrialLine).
     */
    layOutLineFrom(start: number, extent: LineExtent): TrialLine;
    /**
     * adds the space that justifying the line could stretch before the
     * notation at index, which has just been laid out on it, to stretch, as
     * findNeumesToJustify() would find it
     */
    addToStretch(line: ChantLine, stretch: Stretch, index: number): void;
    /** how far the space before a notation stretches, for a badness of 100 */
    getStretchBefore(notation: ChantNotationElement): number;
    /** the clef in effect at the start of a line that starts at index: the one there, or else the one before it */
    clefAt(index: number): Clef;
    /** the clef in effect just before the notation at index */
    clefBefore(index: number): Clef;
    /**
     * whether the clef at index goes at the start of the next line, along with
     * the line break just after it, as buildFromChantNotationIndex() puts it
     */
    isClefLineBreak(index: number): boolean;
    /**
     * Gregorio's penalty for breaking the line just before the notation at
     * index, or infinitePenalty where the line can't break, as far as the
     * line's own notations say (isBlocked() says the rest); translationStart is
     * the notation with a translation that is still going on there
     */
    getPenalty(index: number, translationStart: ChantNotationElement | null): number;
    /**
     * whether a line can't break just before the notation at index after all,
     * whichever line it ends, for what comes after it or the rest of the score
     * (getPenalty() works out the rest): before text only notations that come
     * just before a divider, where too little would be left for the last line,
     * in a no-line-break or euouae area (gabc <nlba> or <eu>), or within a
     * syllable too short to break in
     */
    isBlocked(index: number): boolean;
    /** (see ChantLine.keepsInArea()) */
    keepsInArea(index: number): boolean;
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
    /**
     * adds to ends (see TrialLine.ends) what the line laid out so far from
     * start would be like if it ended just before the notation at end, where
     * the notations laid out reach right as far as reach
     */
    addLineEnd(ends: number[], start: number, line: ChantLine, end: number, shrink: number, reach: number, stretchable: Stretch, penalty: number, ragged: boolean): void;
    /**
     * how far a line stretches, for a badness of 100, when justifyElements()
     * justifies it: the space before each notation in findNeumesToJustify() is
     * stretched by the same amount (as added up in stretchable by
     * addToStretch()), but for the space before a custos at its end
     */
    getStretch(line: ChantLine, stretchable: Stretch): number;
    /**
     * what the notations after a line that ends just before each notation, and
     * the rest of the score, say about it in this layout, worked out once for
     * each place (see isBlockedAt() and hasCustos())
     */
    getAfter(): {
        blocked: Uint8Array;
        custos: Uint8Array;
    };
    /** whether a line can't end just before the notation at end after all (see isBlocked()) */
    isBlockedAt(end: number): boolean;
    /**
     * whether a line that ends just before the notation at end has a custos at
     * its end, where custos is the index in custosKinds of what its own
     * notations say, for what the notations after it say (see allowsCustosBefore())
     */
    hasCustos(custos: number, end: number): boolean;
}
export {};
//# sourceMappingURL=Exsurge.Chant.LineBreaking.d.ts.map