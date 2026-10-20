import { type Note } from "./Exsurge.Chant.js";
import { ChantNotationElement, GlyphCode, MarkingPositionHint, type ChantContext } from "./Exsurge.Drawing.js";
/** a ledger line that a neume needs, from one of its notes to another */
export interface NeumeLedgerLine {
    element: Note;
    endElem: Note;
    staffPosition: number;
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
    noteAt(note: Note, glyph: GlyphCode, withLineTo?: boolean): this;
    virgaAt(note: Note, withLineTo?: boolean): this;
    advanceBy(x: number): this;
    withLineEndingAt(note: Note): this | undefined;
    withPodatus(lowerNote: Note, upperNote: Note): this;
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
    constructor(notes?: Note[]);
    addNote(note: Note): void;
    performLayout(ctxt: ChantContext): void;
    finishLayout(ctxt: ChantContext): void;
    requiresLedgerLine(ctxt: ChantContext): NeumeLedgerLine[];
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
    static getNoteGlyphCode(note: Note): "Stropha" | "PunctumCavum" | "PunctumQuadratum" | "PunctumQuadratumAscLiquescent" | "PunctumQuadratumDesLiquescent";
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
export declare class Oriscus extends Neume {
    positionMarkings(): void;
    performLayout(ctxt: ChantContext): void;
    resetDependencies(): void;
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