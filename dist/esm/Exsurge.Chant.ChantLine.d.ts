import { ChantLineBreak } from "./Exsurge.Chant.js";
import { BracePoint, Slur } from "./Exsurge.Chant.Markings.js";
import { Custos } from "./Exsurge.Chant.Signs.js";
import { Rect } from "./Exsurge.Core.js";
import { ChantLayoutElement, CurlyBraceVisualizer, Lyric, RoundBraceVisualizer } from "./Exsurge.Drawing.js";
import type { ChantScore, Clef, Note } from "./Exsurge.Chant.js";
import type { BraceNote } from "./Exsurge.Chant.Markings.js";
import type { InsertionCursor } from "./Exsurge.Chant.Signs.js";
import type { ChantContext, ChantNotationElement, SvgElementWithSource, SvgOutput, SvgPart, SvgTreeNode } from "./Exsurge.Drawing.js";
export declare const isHiddenAccidental: (notation: ChantNotationElement) => boolean | undefined;
/** whether a notation's lyrics start a word: they're the first syllable of one, or a word of one syllable */
export declare const startsWordWithLyrics: (notation: ChantNotationElement) => boolean;
/**
 * whether the notation at index is a clef that a line break comes just after,
 * which, as in Gregorio, only goes at the start of the next line (but not
 * when the clef or the line break has text, which neither line would then draw)
 */
export declare function isClefLineBreak(notations: ChantNotationElement[], index: number): boolean;
/** whether only text-only notations come between the notation at index, which is one, and the next divider */
export declare function isTextOnlyBeforeDivider(notations: ChantNotationElement[], index: number): boolean;
/**
 * whether the notations from index on allow the line that ends just before
 * them an automatic custos: Gregorio leaves it out just before a euouae area
 * (gabc <eu>), and after a [nocustos] before the next note
 */
export declare function allowsCustosBefore(notations: ChantNotationElement[], index: number): boolean;
/**
 * copies of the lyrics of the double bar that ends a line, which go at the
 * start of the next line, the first at x = 0; or null, if it has none to go there
 */
export declare function copyBeginningLyrics(ctxt: ChantContext, notation: ChantNotationElement): Lyric[] | null;
/**
 * Puts back what laying a notation out on a line changed, as the notation's
 * own layout left it, before it's laid out on another line: its trailing
 * space, its lyrics' connectors, and lyrics that a line wrapped or shrank (in
 * setMaxWidth()) or moved (in centerDividers()).  So each line is laid out
 * the same however the score was laid out before, and whichever lines the
 * optimal line breaker tried first.
 */
export declare function resetNotation(ctxt: ChantContext, notation: ChantNotationElement): void;
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
type CondensableSpaces = CondensableSpace[] & {
    sum: number;
};
export declare class ChantLine extends ChantLayoutElement {
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
    paddingLeft: number;
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
    lyricRows: number[];
    altLineHeight: number;
    altLineBaseline: number;
    numAltLines: number;
    translationLineHeight: number;
    translationLineBaseline: number;
    numTranslationLines: number;
    spaceAfterNotations: number;
    spaceBetweenTextTracks: number;
    /** the last lyrics on the line, on each line of lyrics */
    lastLyrics: Lyric[];
    /**
     * the index of the first of the text-only notations at the end of the line
     * whose lyrics go on lines of their own under the line, or null
     */
    extraTextOnlyIndex: number | null;
    /** which line of lyrics the text-only notations at the end of the line are on */
    extraTextOnlyLyricIndex: number;
    extraTextOnlyHeight: number;
    lastLyricsBeforeTextOnly?: Lyric[];
    /** the notations that space can be added before, to justify the line */
    toJustify?: Array<ChantNotationElement | null>;
    condensableSpaces?: CondensableSpaces;
    insertionCursor?: InsertionCursor | null;
    /** the line's index in the score's lines */
    elementIndex: number;
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
    svgFragmentCache?: {
        key: string;
        inner: string;
    };
    constructor(score: ChantScore);
    get staffSpaces(): number;
    performLayout(ctxt: ChantContext): void;
    /**
     * Makes the line, once it's laid out, reach up to top and down to bottom
     * (in its own coordinates), as performLayout() would have for something
     * there, and returns how much taller that makes it above its staff and
     * below it, by which it and the lines below it have to move down.
     */
    reach(top: number, bottom: number): {
        above: number;
        below: number;
    };
    layoutInsertionCursor(ctxt: ChantContext): InsertionCursor | null | undefined;
    draw(ctxt: ChantContext): void;
    /**
     * what goes inside the line's svg, made as output makes it (and when the
     * context is editable, with an invisible rect over the staff for the
     * editor's mouse events)
     */
    createInnerSvg(ctxt: ChantContext, output: SvgOutput): SvgPart[];
    /** what goes inside the line's svg, as DOM nodes or an svg tree (see createInnerSvg()) */
    getInnerNodes(ctxt: ChantContext, top?: number, functionNames?: {
        quickSvg: "createNode" | "createSvgTree";
        elements: "createSvgNode" | "createSvgTree";
    }): Array<SvgElementWithSource | SvgTreeNode>;
    /** the line's svg, starting at top, made as output makes it, with what goes inside it */
    private createSvgAs;
    createSvgNode(ctxt: ChantContext, top?: number): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext, top?: number): SvgTreeNode;
    /**
     * The line's svg, starting at top.  With a cacheKey, what goes inside it is
     * kept, and used again while createSvgFragment() is given the same key, so
     * the key has to say everything about the line that its svg shows besides
     * how it's laid out (such as what's selected: see ChantScore.createSvg()).
     * Laying the line out again forgets it.
     */
    createSvgFragment(ctxt: ChantContext, top?: number, cacheKey?: string): string;
    /** what goes inside the line's svg (see createSvgFragment()) */
    createInnerSvgFragment(ctxt: ChantContext): string;
    buildFromChantNotationIndex(ctxt: ChantContext, newElementStart: number, width: number, lineIndex?: number): void;
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
    readEnd(ctxt: ChantContext): number;
    centerDividers(): void;
    isSoftAccidentalVisible(index: number): boolean;
    spaceNeumeBeforeSoftAccidental(ctxt: ChantContext, index: number): void;
    alignHiddenAccidentals(): void;
    findNeumesToJustify(prevLyrics: Lyric[]): ChantNotationElement | null;
    /**
     * whether justifying the line can add space before curr, which follows
     * prev, as findNeumesToJustify() works it out: nextOrCurr is the notation
     * at index, which is curr, or the one after it if curr is an accidental,
     * and prevLyrics are the last lyrics before it.  (Space isn't added before
     * the line's custos either, unless it has lyrics.)
     */
    canJustifyBefore(prev: ChantNotationElement, curr: ChantNotationElement, nextOrCurr: ChantNotationElement, index: number, prevLyrics: Lyric[]): boolean;
    getWhitespaceOnRight(ctxt?: ChantContext): number;
    /**
     * How far right a notation on the line goes: its notes, or Gregorio's
     * NABC, which widens its syllable, on it and on the notations before it in
     * its syllable (and for one without notes, in the syllable of the last
     * with notes before it, which it's placed after).  Line layout measures a
     * notation by this rather than by its bounds.
     */
    notationRight(notation: ChantNotationElement): number;
    /**
     * whether a Gregorio no-line-break or euouae area (gabc <nlba> or <eu>)
     * keeps the score's notation at index on the same line as the one after it
     */
    keepsInArea(index: number): boolean;
    /**
     * whether the line, ending where it does now, gets an automatic custos (see
     * eolCustos())
     */
    wantsEolCustos(ctxt: ChantContext): boolean;
    /**
     * whether the line, ending where it does now, gets an automatic custos:
     * "always" or "never" as the line break that ends it says (gabc z+ or z-);
     * or else "never" if a [nocustos] is on the last note before the end of the
     * line or ctxt.eolCustos is "manual"; or else "allowed", if the notations
     * after the line allow it (see allowsCustosBefore())
     */
    eolCustos(ctxt: ChantContext): "always" | "never" | "allowed";
    justifyElements(ctxt: ChantContext, doJustify: boolean | undefined, condensableSpaces: CondensableSpaces): void;
    handleEndBrace(ctxt: ChantContext, note: BraceNote & {
        braceEnd?: BracePoint;
    }, i: number): void;
    finishLayout(ctxt: ChantContext): void;
    startX(start: {
        x: number | null;
    }): number;
    handleCustomLedgerLines(ctxt: ChantContext, note: Note, customLedgerLines: LedgerLine[]): void;
    alignEpisemaBlocks(notations: ChantNotationElement[]): void;
    handleSlurs(ctxt: ChantContext, note: Note): void;
    positionNotationElement(ctxt: ChantContext, prevLyrics: Lyric[], prev: ChantNotationElement, curr: ChantNotationElement, rightNotationBoundary: number, condensableSpaces?: CondensableSpaces): boolean;
    /**
     * Gives the lyrics of the notation at index that are the first text of
     * their lines of lyrics on the line the verse numbers in effect on them
     * (with ChantContext.repeatVerseNumbers), before it's positioned.
     */
    repeatVerseNumbers(ctxt: ChantContext, index: number): void;
    /** the row on the line that the line of lyrics at index is drawn on */
    lyricRow(index: number): number;
    /**
     * Find the notation closest to x without going past it
     * @param {number} x
     */
    bisectNotationAtX(x: number, useMidpoint?: boolean): ChantNotationElement | undefined;
}
export {};
//# sourceMappingURL=Exsurge.Chant.ChantLine.d.ts.map