//
// Author(s):
// Fr. Matthew Spencer, OSJ <mspencer@osjusa.org>
//
// Copyright (c) 2008-2016 Fr. Matthew Spencer, OSJ
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

import { Rect, Step, type Pitch } from "./Exsurge.Core.js";
import {
  ChantNotationElement, DividerLineVisualizer, GlyphCode,
  GlyphVisualizer,
  RoundBraceVisualizer,
  type ChantContext,
  type ChantLayoutElement
} from "./Exsurge.Drawing.js";
import type { BracePoint } from "./Exsurge.Chant.Markings.js";
import type { LedgerLineStates } from "./ledgerLines.js";

// adds a sign to a notation between parentheses (Gregorio's parenthesized
// accidentals and bars): an open one at the sign's left, which moves right
// to make room for it, and a close one at its right, each as tall as the
// sign (or a staff interval and a half, if that's taller) and centred on it.
// drawnOffset is how far right of its bounds the sign is drawn.  Returns
// how far the sign and its parentheses go, from left to right.
function addInParentheses(
  ctxt: ChantContext,
  notation: ChantNotationElement,
  sign: ChantLayoutElement,
  drawnOffset = 0
) {
  var middle = sign.bounds.y + sign.bounds.height / 2;
  var height = Math.max(sign.bounds.height, ctxt.staffInterval * 1.5);
  var gap = ctxt.staffInterval / 8;
  var [open, close] = [GlyphCode.OpenParenthesis, GlyphCode.CloseParenthesis].map((glyphCode) => {
    var parenthesis = new GlyphVisualizer(ctxt, glyphCode);
    parenthesis.scale = height / (parenthesis.glyph.bounds.height * ctxt.glyphScaling);
    parenthesis.setGlyph(ctxt, glyphCode);
    parenthesis.bounds.y = middle - parenthesis.bounds.height / 2;
    return parenthesis;
  });
  open.bounds.x = sign.bounds.x + drawnOffset;
  sign.bounds.x = open.bounds.right() + gap - drawnOffset;
  close.bounds.x = sign.bounds.right() + drawnOffset + gap;
  notation.addVisualizer(open);
  notation.addVisualizer(sign);
  notation.addVisualizer(close);
  return { x1: open.bounds.x, x2: close.bounds.right() };
}

// a high bar (see Divider.high) and its parentheses, if it has them, as
// addInParentheses() adds them, and where its ledger line goes (see
// Divider.ledgerLineExtent)
function addHighBar(ctxt: ChantContext, divider: Divider, sign: ChantLayoutElement, drawnOffset = 0) {
  var extent = { x1: sign.bounds.x + drawnOffset, x2: sign.bounds.right() + drawnOffset };
  if (divider.parenthesized) extent = addInParentheses(ctxt, divider, sign, drawnOffset);
  else divider.addVisualizer(sign);
  if (divider.high) divider.ledgerLineExtent = extent;
}

/*
 *
 */
export class Custos extends ChantNotationElement {
  auto: boolean;
  staffPosition: number;
  staffPositionOffset?: number;
  /** the end of a brace that ends at the custos, at the end of a line */
  braceEnd?: BracePoint;

  // if auto is true, then the custos will automatically try to determine it's height based on
  // subsequent notations
  constructor(auto = false) {
    super();
    this.auto = auto;
    this.staffPosition = 2; // default sane value
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    if (this.auto) {
      var neume = ctxt.findNextNeume();

      if (neume) {
        // (under a Chi-Rho clef, the pitch places a note nudged with 0 or 9)
        this.staffPosition = ctxt.activeClef.pitchToStaffPosition(
          neume.notes[0].pitch!
        );
      }

      // in case there was a weird fa/do clef change, let's sanitize the staffPosition by making sure it is
      // within reasonable bounds
      while (this.staffPosition < -2) this.staffPosition += 7;

      while (this.staffPosition > 2 * ctxt.staffLineCount + 2) this.staffPosition -= 7;
    }

    var glyph = new GlyphVisualizer(
      ctxt,
      Custos.getGlyphCode(this.staffPosition, ctxt.staffLineCount)
    );
    glyph.setStaffPosition(ctxt, this.staffPosition);
    this.addVisualizer(glyph);

    this.finishLayout(ctxt);
  }

  // called when layout has changed and our dependencies are no longer good
  resetDependencies() {
    // we only need to resolve new dependencies if we're an automatic custos
    if (this.auto) this.needsLayout = true;
  }

  /**
   * 
   * @param {number} staffPosition position of custos
   * @param {number} staffLineCount number of lines on staff
   * @returns 
   */
  static getGlyphCode(staffPosition: number, staffLineCount = 4) {
    if (staffPosition <= staffLineCount * 2 - 2) {
      // ascending custos
      if (Math.abs(staffPosition) % 2 === 1) return GlyphCode.CustosLong;
      else return GlyphCode.CustosShort;
    } else {
      // descending custos
      if (Math.abs(staffPosition) % 2 === 1) return GlyphCode.CustosDescLong;
      else return GlyphCode.CustosDescShort;
    }
  }
}

/*
 * Divider
 */
export class Divider extends ChantNotationElement {
  declare isDivider: true;
  /** whether a brace above the divider carries the melody over it (gabc _) */
  hasCarryover: boolean;
  /** whether the divider has a vertical episema under the staff (gabc ') */
  hasVerticalEpisema: boolean;
  /** whether the divider is a space higher, on or above the ledger line above the staff (gabc `0, ,0 and ^0) */
  high: boolean;
  /** Gregorio's parenthesized bar (gabc `?, `0?, ,? or ,0?), drawn between parentheses */
  parenthesized?: boolean;
  /**
   * where a high virgula, divisio minima or divisio minimis (and its
   * parentheses) goes, from left to right, which has a ledger line under it
   * as in Gregorio (see ChantLine.finishLayout())
   */
  ledgerLineExtent?: { x1: number; x2: number };

  constructor(withCarryover = false, high = false) {
    super();

    this.isDivider = true;
    this.hasCarryover = withCarryover || false;
    this.hasVerticalEpisema = false;
    this.high = high;
    this.resetsAccidentals = true;
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);
    delete this.ledgerLineExtent;
    if (this.hasCarryover) {
      // (above a high divider too)
      const top = ctxt.staffLineCount * 2 + (this.high ? 2 : 0);
      const y = ctxt.calculateHeightFromStaffPosition(top);
      this.addVisualizer(new RoundBraceVisualizer(ctxt, -ctxt.staffInterval * 1.5, ctxt.staffInterval * 1.5, y, true));
    }

  }

  // the subclasses call this once they have drawn the divider and set its origin
  finishLayout(ctxt: ChantContext) {
    if (this.hasVerticalEpisema) {
      // Gregorio puts it under the staff (at gabc c), as it would go under a
      // note on the bottom line, centered on the divider
      var episema = new GlyphVisualizer(ctxt, GlyphCode.VerticalEpisemaBelow);
      episema.setStaffPosition(ctxt, 0);
      episema.bounds.x = this.origin.x - episema.origin.x;
      episema.bounds.y -= ctxt.staffInterval * 0.2;
      this.addVisualizer(episema);
    }

    super.finishLayout(ctxt);
  }
}

/*
 * QuarterBar
 */
export class QuarterBar extends Divider {
  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);
    const top = ctxt.staffLineCount * 2 + (this.high ? 2 : 0);
    addHighBar(ctxt, this, new DividerLineVisualizer(ctxt, top - 2, top, this));
    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * DivisioMinimis, Gregorio's eighth bar: a short stroke just above the staff
 */
export class DivisioMinimis extends Divider {
  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);
    // (the top line, or the ledger line above it)
    const line = ctxt.staffLineCount * 2 - 1 + (this.high ? 2 : 0);
    addHighBar(ctxt, this, new DividerLineVisualizer(ctxt, line + 0.5, line + 1.5, this));
    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * HalfBar
 */
export class HalfBar extends Divider {
  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    const offset = ctxt.staffLineCount === 2 ? 1.5 : 2;
    this.addVisualizer(new DividerLineVisualizer(ctxt, offset, ctxt.staffLineCount * 2 - offset, this));

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * FullBar
 */
export class FullBar extends Divider {
  /** whether the bar is dotted (gabc :?) */
  dotted: boolean;

  constructor(withCarryover = false, dotted = false) {
    super(withCarryover);
    this.dotted = dotted;
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    const top = ctxt.staffLineCount * 2 - 1;
    if (this.dotted) {
      // dashes a quarter of a space long, four to a space, with the staff
      // lines in the middle of the gaps between them, and one dash beyond the
      // top and bottom lines, as in Gregorio's glyph
      for (var center = 0.75; center < top + 0.5; center += 0.5)
        this.addVisualizer(new DividerLineVisualizer(ctxt, center - 0.125, center + 0.125, this));
    } else {
      this.addVisualizer(new DividerLineVisualizer(ctxt, 1, top, this));
    }

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * Insertion Cursor
 */
export class InsertionCursor extends Divider {
  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);
    this.cssClass = 'InsertionCursor';

    this.addVisualizer(new DividerLineVisualizer(ctxt, 0, ctxt.staffLineCount * 2));

    this.origin.x = this.bounds.width / 2;
    this.bounds.width = 0;
    this.bounds.height = 0;

    this.finishLayout(ctxt);
  }
}

/*
 * DominicanBar
 */
export class DominicanBar extends Divider {
  staffPosition: number;

  constructor(staffPosition: number) {
    super();
    var parity = (staffPosition + 1) % 2;

    this.staffPosition = staffPosition - 2 * parity;
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);
    this.addVisualizer(
      new DividerLineVisualizer(
        ctxt,
        this.staffPosition,
        this.staffPosition + 3,
        this
      )
    );

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * DoubleBar
 */
export class DoubleBar extends Divider {
  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    const top = ctxt.staffLineCount * 2 - 1;
    var line0 = new DividerLineVisualizer(ctxt, 1, top, this);
    line0.bounds.x = 0;
    this.addVisualizer(line0);

    var line1 = new DividerLineVisualizer(ctxt, 1, top, this);
    line1.bounds.x = ctxt.intraNeumeSpacing * 2 - line1.bounds.width;
    this.addVisualizer(line1);

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

export const AccidentalType = {
  Flat: -1,
  Natural: 0,
  Sharp: 1
} as const;
export type AccidentalType = (typeof AccidentalType)[keyof typeof AccidentalType];

/*
 * Accidental
 */
export class Accidental extends ChantNotationElement {
  declare isAccidental: true;
  staffPosition: number;
  accidentalType: AccidentalType;
  /** a soft accidental (gabc X, Y or ##) is only printed if it changes the accidental in effect */
  soft: boolean;
  hidden: boolean;
  /** Gregorio's parenthesized accidental (gabc x?, y? or #?), drawn between parentheses */
  parenthesized?: boolean;
  pitch?: Pitch;
  /** whether it has a ledger line above the staff and below it, as a note can (see determineLedgerLines()) */
  ledgerLineState?: LedgerLineStates;

  constructor(staffPosition: number, accidentalType: AccidentalType, soft = false) {
    super();
    this.isAccidental = true;
    this.keepWithNext = true; // accidentals should always stay connected...

    this.staffPosition = staffPosition;
    this.accidentalType = accidentalType;

    // a soft accidental always alters the pitch, but it is only printed if it
    // changes the accidental in effect on its line (see ChantLine.isSoftAccidentalVisible)
    this.soft = soft;
    this.hidden = false;
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    if (this.hidden) {
      // nothing to draw, and no space to take up
      this.calculatedTrailingSpace = 0;
      this.bounds = new Rect(
        0,
        ctxt.calculateHeightFromStaffPosition(this.staffPosition),
        0,
        0
      );
    } else if (this.parenthesized) {
      addInParentheses(ctxt, this, this.createGlyphVisualizer(ctxt));
    } else {
      this.addVisualizer(this.createGlyphVisualizer(ctxt));
    }

    this.finishLayout(ctxt);
  }

  setHidden(ctxt: ChantContext, hidden: boolean) {
    if (this.hidden === hidden) return;

    this.hidden = hidden;
    this.performLayout(ctxt);
  }

  // creation of the glyph visualizer is refactored out or performLayout
  // so that clefs can use the same logic for their accidental glyph
  createGlyphVisualizer(ctxt: ChantContext) {
    var glyphCode: GlyphCode = GlyphCode.Flat;

    switch (this.accidentalType) {
      case AccidentalType.Natural:
        glyphCode = GlyphCode.Natural;
        break;
      case AccidentalType.Sharp:
        glyphCode = GlyphCode.Sharp;
        break;
      default:
        glyphCode = GlyphCode.Flat;
        break;
    }

    var glyph = new GlyphVisualizer(ctxt, glyphCode);
    glyph.setStaffPosition(ctxt, this.staffPosition);

    return glyph;
  }

  adjustStep(step: number) {
    switch (this.accidentalType) {
      case AccidentalType.Flat:
        if (step === Step.Ti) return Step.Te;
        if (step === Step.Mi) return Step.Me;
        break;
      case AccidentalType.Sharp:
        if (step === Step.Do) return Step.Du;
        if (step === Step.Fa) return Step.Fu;
        break;
      case AccidentalType.Natural:
        if (step === Step.Te) return Step.Ti;
        if (step === Step.Me) return Step.Mi;
        if (step === Step.Du) return Step.Do;
        if (step === Step.Fu) return Step.Fa;
        break;
    }

    // no adjustment needed
    return step;
  }

  applyToPitch(pitch: Pitch) {
    // no adjusment needed
    if (this.pitch!.octave !== pitch.octave) return;

    pitch.step = this.adjustStep(pitch.step);
  }
}

/*
 * Virgula
 */
export class Virgula extends Divider {
  staffPosition: number;

  /** @param high whether it is on the ledger line above the staff (gabc `0) */
  constructor(withCarryover = false, high = false) {
    super(withCarryover, high);

    // unlike other dividers a virgula does not reset accidentals
    this.resetsAccidentals = false;

    // the staff position of the virgula is customizable, so that it
    // can be placed on different lines (top or bottom) depending on the
    // notation tradition of what is being notated (e.g., Benedictine has it
    //  on top line, Norbertine at the bottom)
    this.staffPosition = high ? 9 : 7;
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);
    // (a high virgula is on the ledger line, whatever the number of staff lines)
    if (this.high) this.staffPosition = ctxt.staffLineCount * 2 + 1;

    var glyph = new GlyphVisualizer(ctxt, GlyphCode.Virgula);
    glyph.setStaffPosition(ctxt, this.staffPosition);

    // (the virgula is drawn centred on the left of its bounds)
    addHighBar(ctxt, this, glyph, -glyph.bounds.width / 2);

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}
