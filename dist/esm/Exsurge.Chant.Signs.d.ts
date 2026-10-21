import { type Pitch } from "./Exsurge.Core.js";
import { ChantNotationElement, GlyphVisualizer, type ChantContext } from "./Exsurge.Drawing.js";
import type { BracePoint } from "./Exsurge.Chant.Markings.js";
export declare class Custos extends ChantNotationElement {
    auto: boolean;
    staffPosition: number;
    staffPositionOffset?: number;
    /** the end of a brace that ends at the custos, at the end of a line */
    braceEnd?: BracePoint;
    constructor(auto?: boolean);
    performLayout(ctxt: ChantContext): void;
    resetDependencies(): void;
    /**
     *
     * @param {number} staffPosition position of custos
     * @param {number} staffLineCount number of lines on staff
     * @returns
     */
    static getGlyphCode(staffPosition: number, staffLineCount?: number): "CustosDescLong" | "CustosDescShort" | "CustosLong" | "CustosShort";
}
export declare class Divider extends ChantNotationElement {
    isDivider: true;
    /** whether a brace above the divider carries the melody over it (gabc _) */
    hasCarryover: boolean;
    constructor(withCarryover?: boolean);
    performLayout(ctxt: ChantContext): void;
}
export declare class QuarterBar extends Divider {
    performLayout(ctxt: ChantContext): void;
}
export declare class HalfBar extends Divider {
    performLayout(ctxt: ChantContext): void;
}
export declare class FullBar extends Divider {
    performLayout(ctxt: ChantContext): void;
}
export declare class InsertionCursor extends Divider {
    performLayout(ctxt: ChantContext): void;
}
export declare class DominicanBar extends Divider {
    staffPosition: number;
    constructor(staffPosition: number);
    performLayout(ctxt: ChantContext): void;
}
export declare class DoubleBar extends Divider {
    performLayout(ctxt: ChantContext): void;
}
export declare const AccidentalType: {
    readonly Flat: -1;
    readonly Natural: 0;
    readonly Sharp: 1;
};
export type AccidentalType = (typeof AccidentalType)[keyof typeof AccidentalType];
export declare class Accidental extends ChantNotationElement {
    isAccidental: true;
    staffPosition: number;
    accidentalType: AccidentalType;
    /** a soft accidental (gabc X, Y or ##) is only printed if it changes the accidental in effect */
    soft: boolean;
    hidden: boolean;
    pitch?: Pitch;
    constructor(staffPosition: number, accidentalType: AccidentalType, soft?: boolean);
    performLayout(ctxt: ChantContext): void;
    setHidden(ctxt: ChantContext, hidden: boolean): void;
    createGlyphVisualizer(ctxt: ChantContext): GlyphVisualizer;
    adjustStep(step: number): number;
    applyToPitch(pitch: Pitch): void;
}
export declare class Virgula extends Divider {
    staffPosition: number;
    constructor(withCarryover?: boolean);
    performLayout(ctxt: ChantContext): void;
}
//# sourceMappingURL=Exsurge.Chant.Signs.d.ts.map