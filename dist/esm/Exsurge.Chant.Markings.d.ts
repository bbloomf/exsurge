import { type Note } from "./Exsurge.Chant.js";
import type { Rect } from "./Exsurge.Core.js";
import { ChantLayoutElement, GlyphCode, GlyphVisualizer, MarkingPositionHint, type ChantContext, type ChantNotationElement } from "./Exsurge.Drawing.js";
export declare class Accent extends GlyphVisualizer {
    note: Note;
    positionHint: MarkingPositionHint;
    constructor(ctxt: ChantContext, note: Note, glyphCode?: GlyphCode);
    performLayout(ctxt: ChantContext): void;
}
/**
 * Gregorio's musica ficta (gabc r6, r7 and r8): a small flat, natural or
 * sharp above the staff, or above the note if it's higher, as an accent is
 */
export declare class MusicaFicta extends Accent {
    constructor(ctxt: ChantContext, note: Note, glyphCode: GlyphCode);
    performLayout(ctxt: ChantContext): void;
}
export declare const HorizontalEpisemaAlignment: {
    readonly Default: 0;
    readonly Left: 1;
    readonly Center: 2;
    readonly Right: 3;
};
export type HorizontalEpisemaAlignment = (typeof HorizontalEpisemaAlignment)[keyof typeof HorizontalEpisemaAlignment];
/**
 * Where Gregorio's episema tuning puts an episema in its space: m in the
 * middle, l low or h high (as for an episema over the note, or under it, as
 * the episema is), or ol, oh, ul or uh, low or high as for one over (o) or
 * under (u) the note
 */
export type EpisemaTuningPosition = "m" | "l" | "h" | "ol" | "oh" | "ul" | "uh";
/**
 * Gregorio's tuning of the episema over a note (gabc [oh:…]) or under it
 * ([uh:…]), or of the episemata of a block of notes ([oh:…{] … [oh}])
 */
export interface EpisemaTuning {
    position?: EpisemaTuningPosition;
    /** how far to move the episema up, in staff intervals */
    nudge?: number;
    /** whether the tuning is a block's, whose episemata are put on one level */
    block?: boolean;
}
export declare class HorizontalEpisema extends ChantLayoutElement {
    note: Note;
    positionHint: MarkingPositionHint;
    /** whether the episema stops at its note, rather than joining the next one */
    terminating: boolean;
    alignment: HorizontalEpisemaAlignment;
    /** where performLayout() put the episema, which each line that joins it to others starts from */
    layoutBounds?: Rect;
    constructor(note: Note);
    performLayout(ctxt: ChantContext): void;
    supposesLedgerLine(ctxt: ChantContext, isAbove: boolean): boolean;
    tunedY(ctxt: ChantContext, y: number): number;
    draw(ctxt: ChantContext): void;
    getSvgProps(ctxt: ChantContext): {
        x: number;
        y: number;
        width: number;
        height: number;
        fill: string;
        class: string;
    };
    createSvgNode(ctxt: ChantContext): import("./Exsurge.Drawing.js").SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): import("./Exsurge.Drawing.js").SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export declare class Ictus extends GlyphVisualizer {
    note: Note;
    positionHint: MarkingPositionHint;
    constructor(ctxt: ChantContext, note: Note);
    performLayout(ctxt: ChantContext): void;
}
export declare class Mora extends GlyphVisualizer {
    note: Note;
    positionHint: MarkingPositionHint;
    /** how far the dot is from the right of the note */
    horizontalOffset: number;
    constructor(ctxt: ChantContext, note: Note);
    performLayout(ctxt: ChantContext): void;
}
export declare class NoteBracket extends ChantLayoutElement {
    isRight: boolean;
    /** the width of the line and hooks */
    lineWeight: number;
    constructor(ctxt: ChantContext, isRight: boolean, lowStaffPosition: number, highStaffPosition: number);
    getPoints(): number[][];
    draw(ctxt: ChantContext): void;
    getSvgProps(ctxt: ChantContext): {
        d: string;
        fill: string;
        class: string;
    };
    createSvgNode(ctxt: ChantContext): import("./Exsurge.Drawing.js").SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): import("./Exsurge.Drawing.js").SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
/**
 * How far a custom ledger line goes beyond where it's introduced: a length in
 * staff intervals (Gregorio's 0 is 0), or, for Gregorio's 1, "overhang", as
 * far as a ledger line goes beyond a note
 */
export type LedgerLineExtent = number | "overhang";
/** the staff position of the first ledger line above the staff, or below it */
export declare function ledgerLinePosition(ctxt: ChantContext, isAbove: boolean): number;
/**
 * A Gregorio custom ledger line (gabc [oll:…] or [ull:…]), or its start or
 * end, introduced just after a note, or just before it if nothing comes
 * between them
 */
export interface CustomLedgerLine {
    isAbove: boolean;
    /** whether it's introduced at the left of the note rather than its right */
    before?: boolean;
    kind: "fixed" | "start" | "end";
    /** how far the line starts to the left of where it's introduced */
    left?: LedgerLineExtent;
    /** a fixed line's length to the right, or how far one from note to note goes beyond its end */
    right?: LedgerLineExtent;
}
/**
 * Where a custom ledger line from note to note started, while the layout
 * looks for its end (x is null if it started on an earlier line)
 */
export interface LedgerLineStart {
    x: number | null;
    right: LedgerLineExtent;
}
/**
 * A Gregorio slur on a note (gabc [oslur:…] or [uslur:…]): one of its own,
 * with its width and height, or the start or end of one to another note.
 */
export interface SlurMark {
    isAbove: boolean;
    /**
     * where the slur starts or ends: 0 at the right of the note, 1 a punctum's
     * width to the left of that, or 2 half a punctum's width to the left
     */
    shift: 0 | 1 | 2;
    kind: "fixed" | "start" | "end";
    /** a fixed slur's width, in staff intervals */
    width?: number;
    /** a fixed slur's height from its start to its end (up), in staff intervals */
    height?: number;
}
/**
 * Where a slur from note to note started, while the layout looks for its end:
 * x is null if it started on an earlier line, so that it goes on from the
 * start of this one
 */
export interface SlurStart {
    x: number | null;
    y: number;
}
export declare class Slur extends ChantLayoutElement {
    isAbove: boolean;
    start: {
        x: number;
        y: number;
    };
    end: {
        x: number;
        y: number;
    };
    constructor(ctxt: ChantContext, x0: number, y0: number, x1: number, y1: number, isAbove: boolean);
    static cubicTurningPoints(p0: number, p1: number, p2: number, p3: number): number[];
    static pointOnNote(ctxt: ChantContext, note: Note, mark: SlurMark): {
        x: number;
        y: number;
    };
    getControlPoints(ctxt: ChantContext, outer: boolean): {
        x: number;
        y: number;
    }[];
    pointOnOuterCurve(ctxt: ChantContext, t: number): {
        x: number;
        y: number;
    };
    draw(ctxt: ChantContext): void;
    getPenWidth(ctxt: ChantContext): number;
    getSvgProps(ctxt: ChantContext): {
        d: string;
        fill: string;
        stroke: string;
        "stroke-width": number;
        "stroke-linejoin": string;
        class: string;
    };
    createSvgNode(ctxt: ChantContext): import("./Exsurge.Drawing.js").SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): import("./Exsurge.Drawing.js").SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export declare const BraceShape: {
    readonly RoundBrace: 0;
    readonly CurlyBrace: 1;
    readonly AccentedCurlyBrace: 2;
};
export type BraceShape = (typeof BraceShape)[keyof typeof BraceShape];
export declare const BraceAttachment: {
    readonly Left: 0;
    readonly Right: 1;
};
export type BraceAttachment = (typeof BraceAttachment)[keyof typeof BraceAttachment];
/** what a brace is attached to: a note, or a clef or custos at either end of a line */
export type BraceNote = Note | ChantNotationElement;
export declare class BracePoint extends ChantLayoutElement {
    note: BraceNote | null;
    isAbove: boolean;
    shape: BraceShape;
    attachment: BraceAttachment;
    /** whether the brace was given a length (rather than an end), so the next note ends it */
    automatic?: boolean;
    /**
     * the length the brace was given (gabc [ob:0;6mm] and the like), in staff
     * intervals at Gregorio's default staff size, if it's a TeX length that
     * exsurge can read.  The brace still ends at the next note.
     */
    length?: number;
    /** the index of the notation that the brace starts at */
    notationIndex?: number;
    constructor(note: BraceNote | null, isAbove: boolean, shape: BraceShape, attachment: BraceAttachment);
    getAttachmentX(note?: BraceNote | null): number;
}
//# sourceMappingURL=Exsurge.Chant.Markings.d.ts.map