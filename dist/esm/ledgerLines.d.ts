import type { Note } from "./Exsurge.Chant.js";
import type { ChantContext, ChantNotationElement } from "./Exsurge.Drawing.js";
/**
 * How a ledger-line state was set, weakest first, as Gregorio's
 * gregorio_ledger_specificity (src/struct.h).  Explicit and Drawn are bits:
 * only a state with the Drawn bit draws a line.
 */
export declare enum LedgerLineSpecificity {
    /** not set: Gregorio's episema placement guesses it (LEDGER_SUPPOSED) */
    Supposed = 0,
    /**
     * Gregorio's [hl:…] or [ll:…], or a note inside a custom ledger line from
     * note to note ([oll:…{…] to [oll:}]): where its episemata go and how long
     * its stem is, without drawing a line (LEDGER_EXPLICIT)
     */
    Explicit = 1,
    /** the note is on or beyond the ledger line, or the line is run through it (LEDGER_DRAWN) */
    Drawn = 2,
    /** Gregorio's [oll:0/1] or [ull:0/1] (LEDGER_EXPLICITLY_DRAWN) */
    ExplicitlyDrawn = 3
}
/** whether there is a ledger line on one side of a note, and how that was set */
export interface LedgerLineState {
    line: boolean;
    specificity: LedgerLineSpecificity;
}
/** a note's (or accidental's) ledger-line state above the staff and below it */
export interface LedgerLineStates {
    above: LedgerLineState;
    below: LedgerLineState;
}
/** what determineLedgerLines() gives a state: a note, or an accidental */
export interface LedgerLineItem {
    staffPosition: number;
    ledgerLineState?: LedgerLineStates;
}
/**
 * How far a ledger line goes beyond a note on each side, in staff intervals:
 * Gregorio's additionallineswidth, 0.14584 cm at its default staff size
 * (tex/gregoriotex-gsp-default.tex)
 */
export declare const ledgerLineOverhang = 1.0157;
/**
 * the same beyond a custos: additionalcustoslineswidth, 0.09114 cm (on the
 * left only, at the end of a line)
 */
export declare const custosLedgerLineOverhang = 0.6347;
/** whether a state draws a ledger line */
export declare function drawsLedgerLine(state: LedgerLineState | undefined): boolean;
/** whether an item has a ledger line drawn above the staff, or below it */
export declare function hasDrawnLedgerLine(item: LedgerLineItem, isAbove: boolean): boolean;
export declare function isOnOrBeyond(staffPosition: number, ledgerLine: number, isAbove: boolean): boolean;
/**
 * Gives every note and accidental of the notations its ledger-line state,
 * as Gregorio determines it, and has a notation laid out again when the
 * state of one of its notes changes.  A notation's continuesElement says
 * whether it's in the same element as the one before it.
 */
export declare function determineLedgerLines(ctxt: ChantContext, notations: ChantNotationElement[]): void;
/**
 * Where a stem goes below the staff, as Gregorio's queuetype (gregoriotex-write.c),
 * which chooses a stem's length
 */
export declare enum StemQueue {
    OnSpaceBelowBottomLine = 0,
    OnSpaceAboveBottomLine = 1,
    OnBottomLine = 2,
    OnLineAboveBottomLine = 3
}
/**
 * Gregorio's adjusted_queuetype_of(): the queue type of a stem at note (moved
 * by adjustment), where the ledger line below queueNote makes it the
 * bottom line.  Only a note at c or d depends on that.  A note that a Chi-Rho
 * clef moves off its line or space has none (undefined).
 */
export declare function stemQueue(note: Note, queueNote?: Note, adjustment?: number): StemQueue | undefined;
//# sourceMappingURL=ledgerLines.d.ts.map