import { type Note } from "./Exsurge.Chant.js";
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
export declare class HorizontalEpisema extends ChantLayoutElement {
    note: Note;
    positionHint: MarkingPositionHint;
    /** whether the episema stops at its note, rather than joining the next one */
    terminating: boolean;
    alignment: HorizontalEpisemaAlignment;
    constructor(note: Note);
    performLayout(ctxt: ChantContext): void;
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
    /** the index of the notation that the brace starts at */
    notationIndex?: number;
    constructor(note: BraceNote | null, isAbove: boolean, shape: BraceShape, attachment: BraceAttachment);
    getAttachmentX(note?: BraceNote | null): number;
}
//# sourceMappingURL=Exsurge.Chant.Markings.d.ts.map