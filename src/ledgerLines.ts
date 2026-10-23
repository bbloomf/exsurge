// Gregorio's ledger lines: which notes and accidentals get a ledger line
// above or below the staff, as Gregorio decides it (gabc_determine_ledger_lines()
// in src/gabc/gabc-score-determination.c), and the stems that depend on it
// (adjusted_queuetype_of() in src/gregoriotex/gregoriotex-write.c).
//
// Each note has a state on each side: whether it has a line, and how that was
// set.  A setting only replaces a weaker one, as Gregorio's LEDGER() does
// (src/gabc/gabc-notes-determination.l), so the first of two equally strong
// settings counts.  Gregorio then runs a line from each note drawn with one
// through the notes around it in its element: the notes and accidentals of a
// neume and of those joined to it (see ChantNotationElement.continuesElement).

import type { Note } from "./Exsurge.Chant.js";
import type { ChantContext, ChantNotationElement } from "./Exsurge.Drawing.js";

/**
 * How a ledger-line state was set, weakest first, as Gregorio's
 * gregorio_ledger_specificity (src/struct.h).  Explicit and Drawn are bits:
 * only a state with the Drawn bit draws a line.
 */
export enum LedgerLineSpecificity {
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
export const ledgerLineOverhang = 1.0157;
/**
 * the same beyond a custos: additionalcustoslineswidth, 0.09114 cm (on the
 * left only, at the end of a line)
 */
export const custosLedgerLineOverhang = 0.6347;

/** whether a state draws a ledger line */
export function drawsLedgerLine(state: LedgerLineState | undefined) {
  return !!state && state.line && (state.specificity & LedgerLineSpecificity.Drawn) !== 0;
}

/** whether an item has a ledger line drawn above the staff, or below it */
export function hasDrawnLedgerLine(item: LedgerLineItem, isAbove: boolean) {
  return !!item.ledgerLineState && drawsLedgerLine(item.ledgerLineState[isAbove ? "above" : "below"]);
}

// a staff position is on or beyond the ledger line above the staff (at
// ledgerLine), or beyond it.  A note under a Chi-Rho clef that 0 or 9 moves
// off its line or space is on the nearest line (as exsurge has always drawn
// its line), so positions within 0.9 of the line are on it.
function isOnOrBeyond(staffPosition: number, ledgerLine: number, isAbove: boolean) {
  return isAbove ? staffPosition >= ledgerLine - 0.9 : staffPosition <= ledgerLine + 0.9;
}
function isBeyond(staffPosition: number, ledgerLine: number, isAbove: boolean) {
  return isAbove ? staffPosition > ledgerLine + 0.9 : staffPosition < ledgerLine - 0.9;
}

// replaces state with a setting that is stronger than it (Gregorio's LEDGER())
function setLedgerLine(state: LedgerLineState, specificity: LedgerLineSpecificity, line: boolean) {
  if (specificity > state.specificity) {
    state.line = line;
    state.specificity = specificity;
  }
}

// whether Gregorio runs the line on the note next to it, note (before it, or
// after it), through note: if note is higher than the one next to it, or
// the step between them crosses the ledger line.  For the line below the
// staff Gregorio compares the pitches the same way as above it
// (extend_low_ledger() does as extend_high_ledger() does), so that line runs
// back through falling notes and on through rising ones; this copies it.
function extendsLedgerLine(item: LedgerLineItem, next: LedgerLineItem, ledgerLine: number, isAbove: boolean) {
  return (
    next.staffPosition < item.staffPosition ||
    (isAbove
      ? isBeyond(next.staffPosition, ledgerLine, true) && !isOnOrBeyond(item.staffPosition, ledgerLine, true)
      : !isOnOrBeyond(next.staffPosition, ledgerLine, false) && isBeyond(item.staffPosition, ledgerLine, false))
  );
}

// Gregorio's adjust_ledger() for one side of every item of an element, in order
function runLedgerLines(items: LedgerLineItem[], ledgerLine: number, isAbove: boolean) {
  var side = isAbove ? ("above" as const) : ("below" as const);
  var extend = (item: LedgerLineItem, next: LedgerLineItem) => {
    var extended = extendsLedgerLine(item, next, ledgerLine, isAbove);
    if (extended) item.ledgerLineState![side] = { line: true, specificity: LedgerLineSpecificity.Drawn };
    return extended;
  };
  // the items since the last one with the Drawn bit, which a line can run
  // back through, and whether a line runs on from the last item
  var stack: LedgerLineItem[] = [],
    running = false,
    previous: LedgerLineItem | null = null;
  for (let item of items) {
    let state = item.ledgerLineState![side];
    if (state.specificity & LedgerLineSpecificity.Drawn) {
      if (state.line) {
        // (back from this item, until the line ends)
        let after = item,
          before: LedgerLineItem | undefined;
        while ((before = stack.pop()) && extend(before, after)) after = before;
        running = true;
      } else running = false;
      stack = [];
    } else if (running) {
      if (!extend(item, previous!)) {
        stack.push(item);
        running = false;
      }
    } else stack.push(item);
    previous = item;
  }
}

/**
 * Gives every note and accidental of the notations its ledger-line state,
 * as Gregorio determines it, and has a notation laid out again when the
 * state of one of its notes changes.  A notation's continuesElement says
 * whether it's in the same element as the one before it.
 */
export function determineLedgerLines(ctxt: ChantContext, notations: ChantNotationElement[]) {
  var above = ctxt.staffLineCount * 2 + 1,
    below = -1;
  var open = { above: false, below: false };
  var elements: LedgerLineItem[][] = [];
  var previousStates = new Map<LedgerLineItem, LedgerLineStates | undefined>();
  var owners = new Map<LedgerLineItem, ChantNotationElement>();

  for (let notation of notations) {
    // (anything but a neume or an accidental, such as a bar or a clef, ends the element)
    if (
      !notation.continuesElement ||
      notation.firstOfParentheses ||
      !(notation.isNeume || notation.isAccidental) ||
      !elements.length
    )
      elements.push([]);
    let items: LedgerLineItem[] = notation.isAccidental
      ? [notation as ChantNotationElement & LedgerLineItem]
      : notation.isNeume
        ? notation.notes || []
        : [];

    items.forEach((item, i) => {
      if (i > 0 && (item as Note).startsElement) elements.push([]);
      previousStates.set(item, item.ledgerLineState);
      owners.set(item, notation);
      let note = notation.isNeume ? (item as Note) : null;
      // a custom ledger line from note to note that starts before the note
      // (or ends before it) does so before the note is added, as Gregorio
      // adds the note after the instruction
      let lines = (note && note.customLedgerLines) || [];
      for (let line of lines)
        if (line.before && line.kind !== "fixed") open[line.isAbove ? "above" : "below"] = line.kind === "start";

      let state: LedgerLineStates = {
        above: { line: false, specificity: LedgerLineSpecificity.Supposed },
        below: { line: false, specificity: LedgerLineSpecificity.Supposed }
      };
      // (as Gregorio's lex_add_note(): the note's pitch, or the custom line it's in)
      if (isOnOrBeyond(item.staffPosition, above, true)) setLedgerLine(state.above, LedgerLineSpecificity.Drawn, true);
      else if (open.above) setLedgerLine(state.above, LedgerLineSpecificity.Explicit, true);
      if (isOnOrBeyond(item.staffPosition, below, false)) setLedgerLine(state.below, LedgerLineSpecificity.Drawn, true);
      else if (open.below) setLedgerLine(state.below, LedgerLineSpecificity.Explicit, true);
      if (note) {
        if (note.highLedgerLine !== undefined)
          setLedgerLine(state.above, LedgerLineSpecificity.Explicit, note.highLedgerLine);
        if (note.lowLedgerLine !== undefined)
          setLedgerLine(state.below, LedgerLineSpecificity.Explicit, note.lowLedgerLine);
        if (note.ledgerLineAbove !== undefined)
          setLedgerLine(state.above, LedgerLineSpecificity.ExplicitlyDrawn, note.ledgerLineAbove);
        if (note.ledgerLineBelow !== undefined)
          setLedgerLine(state.below, LedgerLineSpecificity.ExplicitlyDrawn, note.ledgerLineBelow);
      }
      item.ledgerLineState = state;
      elements[elements.length - 1].push(item);

      for (let line of lines)
        if (!line.before && line.kind !== "fixed") open[line.isAbove ? "above" : "below"] = line.kind === "start";
    });
  }

  for (let items of elements) {
    runLedgerLines(items, above, true);
    runLedgerLines(items, below, false);
  }

  var sameState = (a?: LedgerLineState, b?: LedgerLineState) =>
    !!a && !!b && a.line === b.line && a.specificity === b.specificity;
  for (let [item, before] of previousStates) {
    let after = item.ledgerLineState!;
    if (!before || !sameState(before.above, after.above) || !sameState(before.below, after.below))
      owners.get(item)!.needsLayout = true;
  }
}

/**
 * Where a stem goes below the staff, as Gregorio's queuetype (gregoriotex-write.c),
 * which chooses a stem's length
 */
export enum StemQueue {
  OnSpaceBelowBottomLine,
  OnSpaceAboveBottomLine,
  OnBottomLine,
  OnLineAboveBottomLine
}

/**
 * Gregorio's adjusted_queuetype_of(): the queue type of a stem at note (moved
 * by adjustment), where the ledger line below queueNote makes it the
 * bottom line.  Only a note at c or d depends on that.  A note that a Chi-Rho
 * clef moves off its line or space has none (undefined).
 */
export function stemQueue(note: Note, queueNote: Note = note, adjustment = 0) {
  // (Gregorio counts from a, two below c)
  var position = note.staffPosition + adjustment + 2;
  if (position !== Math.round(position)) return undefined;
  var lowLedgerLine = !!queueNote.ledgerLineState && queueNote.ledgerLineState.below.line;
  switch (position) {
    case 0:
      return StemQueue.OnSpaceBelowBottomLine;
    case 1:
      return StemQueue.OnBottomLine;
    case 2:
      return lowLedgerLine ? StemQueue.OnSpaceAboveBottomLine : StemQueue.OnSpaceBelowBottomLine;
    case 3:
      return lowLedgerLine ? StemQueue.OnLineAboveBottomLine : StemQueue.OnBottomLine;
    default:
      return position % 2 ? StemQueue.OnLineAboveBottomLine : StemQueue.OnSpaceAboveBottomLine;
  }
}
