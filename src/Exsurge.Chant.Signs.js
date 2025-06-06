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

import { Step } from "./Exsurge.Core.js";
import {
  ChantNotationElement, DividerLineVisualizer, GlyphCode,
  GlyphVisualizer,
  RoundBraceVisualizer
} from "./Exsurge.Drawing.js";

/*
 *
 */
export class Custos extends ChantNotationElement {
  // if auto is true, then the custos will automatically try to determine it's height based on
  // subsequent notations
  constructor(auto = false) {
    super();
    this.auto = auto;
    this.staffPosition = 2; // default sane value
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    if (this.auto) {
      var neume = ctxt.findNextNeume();

      if (neume)
        this.staffPosition = ctxt.activeClef.pitchToStaffPosition(
          neume.notes[0].pitch
        );

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
  static getGlyphCode(staffPosition, staffLineCount = 4) {
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
  constructor(withCarryover = false) {
    super();

    this.isDivider = true;
    this.hasCarryover = withCarryover || false;
    this.resetsAccidentals = true;
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);
    if (this.hasCarryover) {
      const top = ctxt.staffLineCount * 2;
      const y = ctxt.calculateHeightFromStaffPosition(top);
      this.addVisualizer(new RoundBraceVisualizer(ctxt, -ctxt.staffInterval * 1.5, ctxt.staffInterval * 1.5, y, true));
    }
    
  }
}

/*
 * QuarterBar
 */
export class QuarterBar extends Divider {
  performLayout(ctxt) {
    super.performLayout(ctxt);
    const top = ctxt.staffLineCount * 2;
    this.addVisualizer(new DividerLineVisualizer(ctxt, top - 2, top, this));
    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * HalfBar
 */
export class HalfBar extends Divider {
  performLayout(ctxt) {
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
  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.addVisualizer(new DividerLineVisualizer(ctxt, 1, ctxt.staffLineCount * 2 - 1, this));

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}

/*
 * Insertion Cursor
 */
export class InsertionCursor extends Divider {
  performLayout(ctxt) {
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
  constructor(staffPosition) {
    super();
    var parity = (staffPosition + 1) % 2;

    this.staffPosition = staffPosition - 2 * parity;
  }

  performLayout(ctxt) {
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
  performLayout(ctxt) {
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
};

/*
 * Accidental
 */
export class Accidental extends ChantNotationElement {
  constructor(staffPosition, accidentalType) {
    super();
    this.isAccidental = true;
    this.keepWithNext = true; // accidentals should always stay connected...

    this.staffPosition = staffPosition;
    this.accidentalType = accidentalType;
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    this.addVisualizer(this.createGlyphVisualizer(ctxt));

    this.finishLayout(ctxt);
  }

  // creation of the glyph visualizer is refactored out or performLayout
  // so that clefs can use the same logic for their accidental glyph
  createGlyphVisualizer(ctxt) {
    var glyphCode = GlyphCode.Flat;

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

  adjustStep(step) {
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

  applyToPitch(pitch) {
    // no adjusment needed
    if (this.pitch.octave !== pitch.octave) return;

    pitch.step = this.adjustStep(pitch.step);
  }
}

/*
 * Virgula
 */
export class Virgula extends Divider {
  constructor(withCarryover = false) {
    super(withCarryover);

    // unlike other dividers a virgula does not reset accidentals
    this.resetsAccidentals = false;

    // the staff position of the virgula is customizable, so that it
    // can be placed on different lines (top or bottom) depending on the
    // notation tradition of what is being notated (e.g., Benedictine has it
    //  on top line, Norbertine at the bottom)
    this.staffPosition = 7;
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var glyph = new GlyphVisualizer(ctxt, GlyphCode.Virgula);
    glyph.setStaffPosition(ctxt, this.staffPosition);

    this.addVisualizer(glyph);

    this.origin.x = this.bounds.width / 2;

    this.finishLayout(ctxt);
  }
}
