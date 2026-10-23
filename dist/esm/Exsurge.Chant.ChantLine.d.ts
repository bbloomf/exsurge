import { ChantLineBreak } from "./Exsurge.Chant.js";
import { BracePoint, Slur } from "./Exsurge.Chant.Markings.js";
import { Custos } from "./Exsurge.Chant.Signs.js";
import { Rect } from "./Exsurge.Core.js";
import { ChantLayoutElement, CurlyBraceVisualizer, Lyric, RoundBraceVisualizer } from "./Exsurge.Drawing.js";
import type { ChantScore, Clef, Note } from "./Exsurge.Chant.js";
import type { BraceNote } from "./Exsurge.Chant.Markings.js";
import type { InsertionCursor } from "./Exsurge.Chant.Signs.js";
import type { ChantContext, ChantNotationElement, SvgElementWithSource, SvgTreeNode } from "./Exsurge.Drawing.js";
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
    notationBounds: Rect | null;
    staffLeft: number;
    staffRight: number;
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
    constructor(score: ChantScore);
    get staffSpaces(): number;
    performLayout(ctxt: ChantContext): void;
    layoutInsertionCursor(ctxt: ChantContext): InsertionCursor | null | undefined;
    draw(ctxt: ChantContext): void;
    getInnerNodes(ctxt: ChantContext, top?: number, functionNames?: {
        quickSvg: "createNode" | "createSvgTree";
        elements: "createSvgNode" | "createSvgTree";
    }): (SvgTreeNode | SvgElementWithSource)[];
    createSvgNode(ctxt: ChantContext, top?: number): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext, top?: number): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext, top?: number): string;
    buildFromChantNotationIndex(ctxt: ChantContext, newElementStart: number, width: number): void;
    centerDividers(): void;
    isSoftAccidentalVisible(index: number): boolean;
    spaceNeumeBeforeSoftAccidental(ctxt: ChantContext, index: number): void;
    alignHiddenAccidentals(): void;
    findNeumesToJustify(prevLyrics: Lyric[]): ChantNotationElement | null;
    getWhitespaceOnRight(ctxt?: ChantContext): number;
    /**
     * whether a Gregorio no-line-break or euouae area (gabc <nlba> or <eu>)
     * keeps the score's notation at index on the same line as the one after it
     */
    keepsInArea(index: number): boolean;
    /**
     * whether the line, ending where it does now, gets an automatic custos: as
     * the line break that ends it says (gabc z+ or z-), or else unless a
     * euouae area (gabc <eu>) starts the next line, a [nocustos] is on the last
     * note before the end of the line or ctxt.eolCustos is "manual"
     */
    wantsEolCustos(ctxt: ChantContext): boolean;
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
     * Find the notation closest to x without going past it
     * @param {number} x
     */
    bisectNotationAtX(x: number, useMidpoint?: boolean): ChantNotationElement | undefined;
}
export {};
//# sourceMappingURL=Exsurge.Chant.ChantLine.d.ts.map