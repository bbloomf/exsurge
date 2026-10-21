import { ChantLine } from "./Exsurge.Chant.ChantLine.js";
import { Pitch, Rect } from "./Exsurge.Core.js";
import { Annotation, ChantLayoutElement, ChantNotationElement, GlyphCode, GlyphVisualizer, TextLeftRight } from "./Exsurge.Drawing.js";
import { Titles } from "./Exsurge.Titles.js";
import type { Accidental } from "./Exsurge.Chant.Signs.js";
import type { Accent, BracePoint, HorizontalEpisema, Ictus, Mora } from "./Exsurge.Chant.Markings.js";
import type { Neume } from "./Exsurge.Chant.Neumes.js";
import type { AboveLinesText, Annotations, ChantContext, ChoralSign, DropCap, SvgElementWithSource, SvgTreeNode } from "./Exsurge.Drawing.js";
export declare const LiquescentType: {
    readonly None: 0;
    readonly Large: number;
    readonly Small: number;
    readonly Ascending: number;
    readonly Descending: number;
    readonly InitioDebilis: number;
    readonly LargeAscending: number;
    readonly LargeDescending: number;
    readonly SmallAscending: number;
    readonly SmallDescending: number;
};
/** LiquescentType flags, combined */
export type LiquescentType = number;
export declare const NoteShape: {
    readonly Default: 0;
    readonly Virga: 1;
    readonly Inclinatum: 2;
    readonly Quilisma: 3;
    readonly Stropha: 4;
    readonly Oriscus: 5;
};
export type NoteShape = (typeof NoteShape)[keyof typeof NoteShape];
export declare const NoteShapeModifiers: {
    readonly None: 0;
    readonly Ascending: number;
    readonly Descending: number;
    readonly Cavum: number;
    readonly Stemmed: number;
    readonly Linea: number;
    readonly Reverse: number;
};
/** NoteShapeModifiers flags, combined */
export type NoteShapeModifiers = number;
/**
 * @class
 */
export declare class Note extends ChantLayoutElement {
    pitch: Pitch | null;
    glyphVisualizer: GlyphVisualizer | null;
    /**
     * the vertical position of the note on the staff, where 0 is the space
     * below the lowest line (gabc "c")
     */
    staffPosition: number;
    /** a nudge up or down a third of a space (gabc 9 or 0 after a pitch) */
    staffPositionOffset?: number;
    liquescent: LiquescentType;
    shape: NoteShape;
    shapeModifiers: NoteShapeModifiers;
    /** the neume the note is in */
    neume: Neume | null;
    episemata: HorizontalEpisema[];
    morae: Mora[];
    ictus?: Ictus;
    accent?: Accent;
    braceStart?: BracePoint;
    braceEnd?: BracePoint;
    choralSign?: ChoralSign;
    /** text above the note, which goes to its neume's alText */
    alText?: AboveLinesText;
    /** the number of stems of a punctum inclinatum (gabc |) */
    inclinataFlags?: number;
    /** where the note is in the gabc source */
    sourceIndex: number;
    sourceGabc: string;
    /** the note's index in its score's notes */
    elementIndex?: number;
    /** the note's index among the notes of its score, not counting other notations */
    noteIndex?: number;
    svgNode?: SvgElementWithSource;
    /**
     * @para {Pitch} pitch
     */
    constructor(pitch?: Pitch);
    setGlyph(ctxt: ChantContext, glyphCode: GlyphCode): void;
    shapeModifierMatches(shapeModifier: NoteShapeModifiers): boolean;
    draw(ctxt: ChantContext): void;
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export interface Clef {
    staffPositionToPitch(staffPosition: number): Pitch;
}
export declare class Clef extends ChantNotationElement {
    isClef: true;
    staffPosition: number;
    octave: number;
    /** the flat of a flat clef (gabc cb) */
    defaultAccidental: Accidental | null;
    activeAccidental: Accidental | null;
    small?: boolean;
    sans?: boolean;
    /** the clef that this clef (at the start of a line) is a copy of */
    model?: Clef;
    constructor(staffPosition: number, octave: number, defaultAccidental?: Accidental | null);
    resetAccidentals(): void;
    pitchToStaffPosition(pitch: Pitch): number;
    performLayout(ctxt: ChantContext): void;
    finishLayout(ctxt: ChantContext): void;
    static default(): Clef;
    clone(): Clef;
}
export declare class DoClef extends Clef {
    constructor(staffPosition: number, octave: number, defaultAccidental?: Accidental | null);
    pitchToStaffPosition(pitch: Pitch): number;
    staffPositionToPitch(staffPosition: number): Pitch;
    performLayout(ctxt: ChantContext): void;
}
export declare class FaClef extends Clef {
    constructor(staffPosition: number, octave: number, defaultAccidental?: Accidental | null);
    pitchToStaffPosition(pitch: Pitch): number;
    staffPositionToPitch(staffPosition: number): Pitch;
    performLayout(ctxt: ChantContext): void;
}
export declare class TrebleClef extends Clef {
    constructor(staffPosition: number, octave: number, defaultAccidental?: Accidental | null, small?: boolean);
    pitchToStaffPosition(pitch: Pitch): number;
    staffPositionToPitch(staffPosition: number): Pitch;
    performLayout(ctxt: ChantContext): void;
}
export declare class ChiRhoClef extends Clef {
    constructor(staffPosition: number, octave: number, defaultAccidental?: Accidental | null, sans?: boolean);
    pitchToStaffPosition(pitch: Pitch): number;
    staffPositionToPitch(staffPosition: number): Pitch;
    performLayout(ctxt: ChantContext): void;
}
export declare class TextOnly extends ChantNotationElement {
    constructor(sourceIndex: number, sourceLength: number);
    performLayout(ctxt: ChantContext): void;
}
export declare class ChantLineBreak extends ChantNotationElement {
    /** whether to justify the line that it ends */
    justify?: boolean;
    constructor(justify?: boolean);
    performLayout(ctxt: ChantContext): void;
    clone(): ChantLineBreak;
}
export declare class ChantMapping {
    source: string;
    notations: ChantNotationElement[];
    sourceIndex: number;
    constructor(source: string, notations: ChantNotationElement[], sourceIndex: number);
}
export interface ElementSelection {
    /** the indices of the selected elements in the score's notes (-1 for the starting clef) */
    indices: number[];
    insertion?: {
        afterElementIndex?: number;
        chantLine?: number;
    };
}
export interface Selection {
    element?: ElementSelection;
}
/** the layout of a ChantDocument */
interface ChantDocumentLayout {
    units: string;
    "default-font": {
        "font-family": string;
        "font-size": number;
    };
    page: {
        width: number;
        height: number;
        "margin-left": number;
        "margin-top": number;
        "margin-right": number;
        "margin-bottom": number;
    };
}
export declare class ChantScore {
    mappings: ChantMapping[];
    lines: ChantLine[];
    /**
     * Every element of the score, in order (the notes of each neume, plus the
     * other notations such as dividers and clefs).  Set by updateNotations().
     */
    notes: Array<Note | ChantNotationElement>;
    notations: ChantNotationElement[];
    staffLineCount: number;
    titles?: Titles;
    startingClef: Clef;
    useDropCap: boolean | undefined;
    dropCap: DropCap | null;
    annotation: Annotation | Annotations | null;
    compiled: boolean;
    autoColoring: boolean;
    needsLayout: boolean;
    extendLastSystemStaffLines: boolean;
    bounds: Rect;
    hasLyrics: boolean;
    hasAboveLinesText: boolean;
    hasTranslations: boolean;
    /**
     * Not read by exsurge; available for clients to track whether they need
     * to pass `force` to performLayout().
     */
    forceLayout?: boolean;
    /** the score split into pages, by paginate() (or just this score) */
    pages: ChantScore[];
    selection?: Selection;
    /** the notation that the insertion cursor is after */
    insertionElement?: ChantNotationElement | null;
    /** the annotation and left text together, when they're merged */
    overrideTextLeft?: TextLeftRight | null;
    svg?: SvgElementWithSource;
    constructor(ctxt?: ChantContext, mappings?: ChantMapping[], useDropCap?: boolean);
    /**
     * Make a copy of the score, only including the specified lines
     * @param  {number} startLine starting index
     * @param  {number} endLine   ending index
     * @return {ChantScore}           the partial score
     */
    copyLines(startLine: number, endLine: number): ChantScore;
    updateSelection(selection?: Selection): void;
    updateNotations(ctxt: ChantContext): void;
    recreateDropCap(ctxt: ChantContext): void;
    /**
     * Shared layout initialization method for performLayout() and performLayoutAsync()
     * @param  {ChantContext} ctxt
     */
    private initializeLayout;
    performLayout(ctxt: ChantContext, force?: boolean): void;
    performLayoutAsync(ctxt: ChantContext, finishedCallback?: () => void): void;
    /**
     * Calls ready() once the lyric font gives a sane hyphen width, or once
     * waiting longer won't help.  A missing hyphen width, or one wider than
     * 0.6em, usually means that the lyric font hasn't loaded yet, but some real
     * fonts have hyphens that wide (Courier New's is 1229/2048em), so this waits
     * at most ctxt.fontLoadTimeout milliseconds.  Without document.fonts to say
     * whether the font has loaded, a ctxt waits that long only once for the
     * same lyric font.
     * @param  {ChantContext} ctxt
     * @param  {function(): void} ready
     */
    waitForLyricFont(ctxt: ChantContext, ready: () => void): void;
    layoutElementsAsync(ctxt: ChantContext, index: number, finishedCallback?: () => void): void;
    layoutChantLines(ctxt: ChantContext, width: number, finishedCallback?: (score: ChantScore) => void): void;
    paginate(height: number): void;
    draw(ctxt: ChantContext, scale?: number): void;
    getSvgProps(ctxt: ChantContext, zoom?: number | boolean): {
        [attribute: string]: string | number | undefined;
    };
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext, zoom?: number | boolean): SvgTreeNode;
    createSvg(ctxt: ChantContext): string;
    createSvgNodeForEachLine(ctxt: ChantContext): SvgElementWithSource[];
    createSvgForEachLine(ctxt: ChantContext): string;
    unserializeFromJson(data: any, ctxt?: ChantContext): void;
    serializeToJson(): {
        [key: string]: unknown;
    };
}
export declare class ChantDocument {
    layout: ChantDocumentLayout;
    scores: ChantScore[];
    constructor();
    copyLayout(to: {
        layout?: ChantDocumentLayout;
    }, from: {
        layout: ChantDocumentLayout;
    }): void;
    unserializeFromJson(data: any): void;
    serializeToJson(): {
        layout?: ChantDocumentLayout;
        scores?: unknown[];
    };
}
export {};
//# sourceMappingURL=Exsurge.Chant.d.ts.map