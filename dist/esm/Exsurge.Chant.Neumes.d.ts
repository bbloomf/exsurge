import { type Note } from "./Exsurge.Chant.js";
import { ChantNotationElement, GlyphCode, MarkingPositionHint, type ChantContext } from "./Exsurge.Drawing.js";
/** a ledger line that a neume's notes have, from one of its notes to another */
export interface NeumeLedgerLine {
    element: Note;
    endElem: Note;
    staffPosition: number;
    /** where it goes under in the neume, if it's under only part of a note's glyph */
    x1?: number;
    x2?: number;
}
declare class NeumeBuilder {
    ctxt: ChantContext;
    neume: Neume;
    /** where the next note goes */
    x: number;
    /** the note the next note is joined to by a line, if any */
    lastNote: Note | null;
    lineIsHanging: boolean;
    minX: number;
    constructor(ctxt: ChantContext, neume: Neume, startingX?: number);
    lineFrom(note: Note): this;
    noteAt(note: Note, glyph: GlyphCode, withLineTo?: boolean, withStem?: boolean): this;
    virgaAt(note: Note, withLineTo?: boolean): this;
    oriscusAt(note: Note, glyph: GlyphCode, withLineTo?: boolean, fusedShift?: number): this;
    lineaAt(note: Note): this;
    advanceBy(x: number): this;
    withLineEndingAt(note: Note): this | undefined;
    withPodatus(lowerNote: Note, upperNote: Note): this;
    withPesQuassus(lower: Note, upper: Note): this;
    withClivisUpper(upper: Note, lower?: Note | null, glyph?: GlyphCode): this;
    withClivisLower(lower: Note): this;
    withClivis(upper: Note, lower: Note): this;
    withInclinata(notes: Note[]): this;
    withPorrectusSwash(start: Note, end: Note): this;
}
export declare class Neume extends ChantNotationElement {
    isNeume: true;
    notes: Note[];
    ledgerLines: NeumeLedgerLine[];
    /** whether it's fused to the neume before it (gabc @), as Gabc.createFusedNeumes() makes it */
    fusedToPrevious?: boolean;
    constructor(notes?: Note[]);
    addNote(note: Note): void;
    performLayout(ctxt: ChantContext): void;
    finishLayout(ctxt: ChantContext): void;
    layoutLeftBracket(ctxt: ChantContext): number;
    layoutRightBracket(ctxt: ChantContext, x: number): void;
    drawnLedgerLines(ctxt: ChantContext): NeumeLedgerLine[];
    isClivisStroke(index: number): boolean;
    resetDependencies(): void;
    build(ctxt: ChantContext): NeumeBuilder;
    positionEpisemata(note: Note, position: MarkingPositionHint): number;
    positionEpisemataAbove(note: Note): number;
    positionEpisemataBelow(note: Note): number;
    positionPodatusEpisemata(bottomNote: Note, topNote: Note): void;
    positionInclinataMorae(notes: Note[]): void;
    positionPodatusMorae(bottomNote: Note, topNote: Note): void;
    positionPodatusMarkings(bottomNote: Note, topNote: Note): void;
    positionTorculusMarkings(firstNote: Note, secondNote: Note, thirdNote: Note): number;
    positionClivisMorae(firstNote: Note, secondNote: Note): void;
    positionClivisEpisemata(firstNote: Note, secondNote: Note): number;
    positionClivisMarkings(firstNote: Note, secondNote: Note): number;
    positionPorrectusMarkings(firstNote: Note, secondNote: Note, thirdNote: Note): void;
    positionPorrectusFlexusMarkings(first: Note, second: Note, third: Note, fourth: Note): void;
    positionMarkings(): void;
}
export declare class Apostropha extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
    static getNoteGlyphCode(note: Note): GlyphCode;
}
export declare class Bivirga extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Trivirga extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Climacus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Clivis extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Ancus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Distropha extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
/** the glyphs that Gregorio fuses (gabc @ and @[…]) into a FusedNeume */
export declare const FusedGlyphKind: {
    /** one note: a punctum, oriscus, oriscus scapus or quilisma, or a liquescent */
    readonly Punctum: "punctum";
    readonly Flexus: "flexus";
    readonly Pes: "pes";
    readonly Porrectus: "porrectus";
    readonly Virga: "virga";
    readonly VirgaReversa: "virgaReversa";
};
export type FusedGlyphKind = (typeof FusedGlyphKind)[keyof typeof FusedGlyphKind];
/** one of the glyphs of a FusedNeume */
export interface FusedGlyph {
    kind: FusedGlyphKind;
    notes: Note[];
    /**
     * Gregorio's fused glyph: it's drawn right after the glyph before, and
     * joined to it where Gregorio joins them, and a flexus or porrectus has no
     * stem on its left
     */
    fused: boolean;
}
export declare function gabcStaffPosition(note: Note): number;
export declare class FusedNeume extends Neume {
    glyphs: FusedGlyph[];
    /** whether the neume after it is fused to it (a fused glyph that Gregorio doesn't join, say) */
    fusedToNext: boolean;
    /** whether it's fused to the neume before it (a torculus, say) */
    fusedToPrevious: boolean;
    constructor(glyphs?: FusedGlyph[]);
    isClivisStroke(index: number): boolean;
    static fusedShift(glyphs: FusedGlyph[], index: number, fusedToNext?: boolean): number;
    static joinsPrevious(glyphs: FusedGlyph[], index: number, fusedToNext?: boolean): boolean;
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
    withFlexus(builder: NeumeBuilder, glyph: FusedGlyph, shiftToNext: number): void;
    withPes(builder: NeumeBuilder, lower: Note, upper: Note): void;
    getNoteGlyphCode(ctxt: ChantContext, note: Note): GlyphCode;
    nextPositionInNeume(note: Note): number | null;
    resetDependencies(): void;
}
export declare class Oriscus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
    resetDependencies(): void;
    static getGlyphCode(note: Note, pointsToHigherNote: boolean): "OriscusAsc" | "OriscusDes";
    static getLastNoteGlyphCode(ctxt: ChantContext, note: Note): "OriscusAsc" | "OriscusDes";
    static pointsToNextNeume(note: Note): boolean;
}
export declare class PesOriscus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
    resetDependencies(): void;
}
export declare class PesQuadratum extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class PesQuassus extends Neume {
    performLayout(ctxt: ChantContext): void;
}
export declare class PesSubpunctis extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Podatus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Porrectus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class PorrectusFlexus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class PunctaInclinata extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Punctum extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Salicus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class SalicusFlexus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Scandicus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class ScandicusFlexus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Torculus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class TorculusResupinus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class TorculusResupinusFlexus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Tristropha extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class Virga extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
}
export {};
//# sourceMappingURL=Exsurge.Chant.Neumes.d.ts.map