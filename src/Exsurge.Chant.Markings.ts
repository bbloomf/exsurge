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

import { NoteShape, type Note } from "./Exsurge.Chant.js";
import {
  ChantLayoutElement,
  GlyphCode,
  GlyphVisualizer,
  InclinatumGlyphTurn,
  MarkingPositionHint,
  QuickSvg,
  type ChantContext,
  type ChantNotationElement
} from "./Exsurge.Drawing.js";

// whether a glyph is a punctum inclinatum's (other than a deminutus), solid or hollow
function isInclinatumGlyph(glyphCode: GlyphCode) {
  return glyphCode in InclinatumGlyphTurn;
}

export class Accent extends GlyphVisualizer {
  note: Note;
  positionHint: MarkingPositionHint;

  constructor(ctxt: ChantContext, note: Note, glyphCode: GlyphCode = GlyphCode.AcuteAccent) {
    super(ctxt, glyphCode);
    this.note = note;
    this.positionHint = MarkingPositionHint.Above;
  }

  performLayout(ctxt: ChantContext) {
    this.bounds.x = this.note.bounds.x + this.bounds.width / 2; // center on the note itself

    // this puts the acute accent either over the staff lines, or over the note if the
    // note is above the staff lines
    this.setStaffPosition(ctxt, Math.max(this.note.staffPosition + 1, 2 * ctxt.staffLineCount));
  }
}

/**
 * Gregorio's musica ficta (gabc r6, r7 and r8): a small flat, natural or
 * sharp above the staff, or above the note if it's higher, as an accent is
 */
export class MusicaFicta extends Accent {
  constructor(ctxt: ChantContext, note: Note, glyphCode: GlyphCode) {
    super(ctxt, note, glyphCode);
    this.scale = 0.75;
    this.setGlyph(ctxt, glyphCode);
  }

  performLayout(ctxt: ChantContext) {
    // centered on the note, with its bottom where an accent's is
    this.bounds.x = this.note.bounds.x + (this.note.bounds.width - this.bounds.width) / 2;
    this.bounds.y =
      ctxt.calculateHeightFromStaffPosition(
        Math.max(this.note.staffPosition + 1, 2 * ctxt.staffLineCount)
      ) - this.bounds.height;
  }
}

// for positioning markings on notes
export const HorizontalEpisemaAlignment = {
  Default: 0,
  Left: 1,
  Center: 2,
  Right: 3
} as const;
export type HorizontalEpisemaAlignment =
  (typeof HorizontalEpisemaAlignment)[keyof typeof HorizontalEpisemaAlignment];

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

// how far GregorioTeX puts an episema up from the middle of its space for
// each position, in staff intervals: its hepisemamiddleshift,
// overhepisemalowshift and so on (0.07206cm, 0.02287cm, 0.10066cm,
// 0.02763cm and 0.10981cm at its default staff size, from 70 of the 157.5
// font units of a step below the middle of the space)
const episemaTuningShifts = { m: 0.057, ol: -0.285, oh: 0.257, ul: -0.252, uh: 0.32 };

/*
 * HorizontalEpisema
 *
 * A horizontal episema marking is it's own visualizer (that is, it implements createSvgFragment)
 */
export class HorizontalEpisema extends ChantLayoutElement {
  note: Note;
  positionHint: MarkingPositionHint;
  /** whether the episema stops at its note, rather than joining the next one */
  terminating: boolean;
  alignment: HorizontalEpisemaAlignment;

  constructor(note: Note) {
    super();

    this.note = note;

    this.positionHint = MarkingPositionHint.Default;
    this.terminating = false; // indicates if this episema should terminate itself or not
    this.alignment = HorizontalEpisemaAlignment.Default;
  }

  performLayout(ctxt: ChantContext) {
    // following logic helps to keep the episemata away from staff lines if they get too close

    var y = 0,
      step;
    var minDistanceAway = ctxt.staffInterval * 0.25; // min distance from neume
    var glyphCode = this.note.glyphVisualizer!.glyphCode;
    var ledgerLine: { staffPosition?: number } = this.note.neume!.ledgerLines[0] || {};
    // whether there's a ledger line at a step outside the staff (steps go
    // down from the middle of the staff), or, with Gregorio's [ll:…] or
    // [hl:…] hint on that side, whether to place the episema as if there were
    var hasLedgerLineAt = (step: number) => {
      var hint = step > 0 ? this.note.lowLedgerLine : this.note.highLedgerLine;
      if (hint !== undefined) return hint;
      return ctxt.convertStaffPositionToSymmetric(ledgerLine.staffPosition as number) === -step;
    };
    var punctumInclinatumShorten = false;

    if (isInclinatumGlyph(glyphCode)) {
      let notes = this.note.neume!.notes,
        index = notes.indexOf(this.note),
        prevNote = notes[index - 1];
      if (
        prevNote &&
        isInclinatumGlyph(prevNote.glyphVisualizer!.glyphCode) &&
        prevNote.staffPosition - this.note.staffPosition === 1
      ) {
        punctumInclinatumShorten = true;
      }
    }

    const staffLineCountParity = (ctxt.staffLineCount % 2) || 0;
    const staffLineCountNonParity = (staffLineCountParity + 1) % 2;
    if (this.positionHint === MarkingPositionHint.Below) {
      y = this.note.bounds.bottom() + minDistanceAway; // the highest the line could be at
      // convert y to be based around center Y between top and bottom staff lines so that it is symmetric:
      y += ctxt.staffLineCount * ctxt.staffInterval;

      if (glyphCode === GlyphCode.None)
        // correction for episema under the second note of a porrectus
        y += ctxt.staffInterval / 2;
      step = Math.ceil(y / ctxt.staffInterval);
      // if there's enough space, center the episema between the punctum and the next staff line
      if (Math.abs(step % 2) === staffLineCountParity) {
        step = (step + 3 / 4 + (y - minDistanceAway) / ctxt.staffInterval) / 2;
      } else {
        // otherwise, find nearest acceptable third between staff lines (or staff line)
        step = (Math.ceil((1.5 * y) / ctxt.staffInterval - 0.5) * 2 + staffLineCountNonParity) / 3;

        // if it's an odd step, that means we're on a staff line,
        // so we shift to between the staff line
        if (Math.abs(step) % 2 === staffLineCountNonParity) {
          if (Math.abs(step) < ctxt.staffLineCount || hasLedgerLineAt(step)) {
            step += 2 / 3;
          } else {
            // no ledger line, but we don't want the episema to be at exactly the same height the ledger line would occupy:
            step += 1 / 3;
          }
        }
      }
    } else {
      y = this.note.bounds.y - minDistanceAway; // the lowest the line could be at
      // convert y to be based around center Y between top and bottom staff lines so that it is symmetric:
      y += ctxt.staffLineCount * ctxt.staffInterval;

      step = Math.floor(y / ctxt.staffInterval);
      // if there's enough space, center the episema between the punctum and the next staff line
      if (Math.abs(step % 2) === staffLineCountParity) {
        step = (step - 3 / 4 + (y + minDistanceAway) / ctxt.staffInterval) / 2;
      } else {
        // otherwise, find nearest acceptable third between staff lines (or staff line)
        step = (Math.floor((1.5 * y) / ctxt.staffInterval - 0.5) * 2 + staffLineCountNonParity) / 3;

        // find nearest acceptable third between staff lines (or staff line)
        if (Math.abs(step) % 2 === staffLineCountNonParity) {
          // if it was a staff line, we need to adjust
          if (Math.abs(step) < ctxt.staffLineCount || hasLedgerLineAt(step)) {
            step -= 2 / 3;
          } else {
            // no ledger line, but we don't want the episema to be at exactly the same height the ledger line would occupy:
            step -= 1 / 3;
          }
        }
      }
    }

    y = (step - ctxt.staffLineCount) * ctxt.staffInterval;

    var width = this.note.bounds.width;
    var x = this.note.bounds.x;

    // The porrectus requires special handling of the note width,
    // otherwise the width is just that of the note itself
    if (this.note.glyphVisualizer!.porrectusNoteDiff)
      width = ctxt.staffInterval;
    else if (glyphCode === GlyphCode.None) {
      width = ctxt.staffInterval;
      x -= width;
    } else if (punctumInclinatumShorten) {
      width *= 2 / 3;
      x += 0.5 * width;
    } else if (
      glyphCode === GlyphCode.PunctumInclinatumLiquescent ||
      glyphCode === GlyphCode.PunctumInclinatumLiquescentCavum
    ) {
      width *= 2 / 3;
      x += 0.25 * width;
    }

    // also, the position hint can affect the x/width of the episema
    if (this.alignment === HorizontalEpisemaAlignment.Left) {
      width *= 0.8;
    } else if (this.alignment === HorizontalEpisemaAlignment.Center) {
      x += width * 0.1;
      width *= 0.8;
    } else if (this.alignment === HorizontalEpisemaAlignment.Right) {
      x += width * 0.2;
      width *= 0.8;
    }

    y = this.tunedY(ctxt, y);

    this.bounds.x = x;
    this.bounds.y = y - ctxt.episemaLineWeight / 2;
    this.bounds.width = width;
    this.bounds.height = ctxt.episemaLineWeight;

    this.origin.x = 0;
    this.origin.y = 0;
  }

  // y, the middle of the episema, as Gregorio's episema tuning of its note
  // ([oh:…] or [uh:…]) moves it: to a position in the space that Gregorio
  // puts it in, which is the space above (or below) the note, or the one
  // beyond that if that's a staff line or ledger line, and then by the nudge
  tunedY(ctxt: ChantContext, y: number) {
    var isAbove = this.positionHint !== MarkingPositionHint.Below;
    var tuning = this.note.episemaTuning && this.note.episemaTuning[isAbove ? "above" : "below"];
    if (!tuning) return y;

    if (tuning.position) {
      let staffPosition = isAbove ? Math.floor(this.note.staffPosition) + 1 : Math.ceil(this.note.staffPosition) - 1;
      let isOnLine =
        Math.abs(staffPosition) % 2 === 1 &&
        ((staffPosition > 0 && staffPosition < 2 * ctxt.staffLineCount) ||
          this.note.neume!.ledgerLines.some((ledgerLine) => ledgerLine.staffPosition === staffPosition));
      if (isOnLine) staffPosition += isAbove ? 1 : -1;
      let position = tuning.position;
      if (position === "l" || position === "h") position = ((isAbove ? "o" : "u") + position) as EpisemaTuningPosition;
      y = ctxt.calculateHeightFromStaffPosition(
        staffPosition + episemaTuningShifts[position as keyof typeof episemaTuningShifts]
      );
    }
    if (tuning.nudge) y -= tuning.nudge * ctxt.staffInterval;
    return y;
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;

    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    );
  }

  getSvgProps(ctxt: ChantContext) {
    return {
      x: this.bounds.x,
      y: this.bounds.y,
      width: this.bounds.width,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "horizontalEpisema"
    };
  }

  createSvgNode(ctxt: ChantContext) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt: ChantContext) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt: ChantContext) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

/*
 * Ictus
 */
export class Ictus extends GlyphVisualizer {
  note: Note;
  positionHint: MarkingPositionHint;

  constructor(ctxt: ChantContext, note: Note) {
    super(ctxt, GlyphCode.VerticalEpisemaAbove);
    this.note = note;
    this.positionHint = MarkingPositionHint.Default;
  }

  performLayout(ctxt: ChantContext) {
    var glyphCode = this.note.glyphVisualizer!.glyphCode;
    // we have to place the ictus further from the note in some cases to avoid a collision with an episema on the same note:
    var positionHint = this.positionHint || MarkingPositionHint.Below;
    var staffPosition =
      this.note.staffPosition +
      (positionHint === MarkingPositionHint.Above ? 1 : -1);
    var collisionWithEpisema =
      this.note.episemata.length > 0 &&
      (this.note.episemata[0].positionHint || MarkingPositionHint.Above) ===
        positionHint;
    var horizontalOffset;
    var verticalOffset = 1;
    var shortOffset = -0.2;
    var extraOffset = 0;
    var collisionWithStaffLine =
      staffPosition % 2 &&
      (Math.abs(ctxt.convertStaffPositionToSymmetric(staffPosition)) < ctxt.staffLineCount ||
        (this.note.neume!.ledgerLines[0] || ({} as { staffPosition?: number })).staffPosition ===
          staffPosition);

    // The porrectus requires special handling of the note width,
    // otherwise the width is just that of the note itself
    if (this.note.glyphVisualizer!.porrectusNoteDiff)
      horizontalOffset = ctxt.staffInterval / 2;
    else if (glyphCode === GlyphCode.None) {
      horizontalOffset = -ctxt.staffInterval / 2;
    } else {
      horizontalOffset = this.note.bounds.width / 2;
      if (
        isInclinatumGlyph(glyphCode) &&
        !collisionWithStaffLine &&
        !collisionWithEpisema
      ) {
        extraOffset = 0.3;
      } else if (
        positionHint === MarkingPositionHint.Below &&
        (glyphCode === GlyphCode.StrophaLiquescent || glyphCode === GlyphCode.StrophaLiquescentCavum)
      ) {
        // (below the tail of a stropha aucta, which is longer than a stropha's)
        extraOffset = 0.2;
      }
    }

    if (this.positionHint === MarkingPositionHint.Above) {
      glyphCode = GlyphCode.VerticalEpisemaAbove;
      verticalOffset *= -1;
    } else {
      glyphCode = GlyphCode.VerticalEpisemaBelow;
    }
    if (collisionWithEpisema) {
      extraOffset = 0.4;
    }
    verticalOffset *=
      ctxt.staffInterval *
      (extraOffset + (collisionWithStaffLine ? 0.3 : shortOffset));

    this.setGlyph(ctxt, glyphCode);
    this.setStaffPosition(ctxt, staffPosition);

    this.bounds.x = this.note.bounds.x + horizontalOffset - this.origin.x;
    this.bounds.y += verticalOffset;
  }
}

/*
 * Mora
 */
export class Mora extends GlyphVisualizer {
  note: Note;
  positionHint: MarkingPositionHint;
  /** how far the dot is from the right of the note */
  horizontalOffset: number;

  constructor(ctxt: ChantContext, note: Note) {
    super(ctxt, GlyphCode.Mora);
    this.note = note;
    this.positionHint = MarkingPositionHint.Default;
    this.horizontalOffset = ctxt.staffInterval / 2 + this.origin.x;
  }

  performLayout(ctxt: ChantContext) {
    this.setGlyph(ctxt, this.glyphCode);
    this.horizontalOffset = ctxt.staffInterval / 2 + this.origin.x;
    var staffPosition = this.note.staffPosition;

    this.setStaffPosition(ctxt, staffPosition);

    var verticalOffset = 0;
    // First, we need to find the next note in the neume.
    var noteIndex = this.note.neume!.notes.indexOf(this.note);
    var nextNote: Note | null | undefined;
    if (noteIndex >= 0) {
      ++noteIndex;
      if (this.note.neume!.notes.length > noteIndex) {
        nextNote = this.note.neume!.notes[noteIndex];
        if (
          nextNote.morae &&
          nextNote.morae.length &&
          this.note.neume!.notes.length === noteIndex + 1
        ) {
          // this note is the second to last in its neume, and the last note also has a mora
          this.horizontalOffset +=
            nextNote.bounds.right() - this.note.bounds.right();
        } else if (nextNote.bounds.right() > this.note.bounds.right()) {
          // center the dot over the following note.
          this.horizontalOffset =
            (nextNote.bounds.right() -
              this.note.bounds.right() -
              this.bounds.right()) /
            2;
        } else {
          nextNote = null;
        }
      } else if (this.note.neume!.notes.length === noteIndex) {
        // this note is the last in its neume:
        if (this.note.neume!.trailingSpace === 0) {
          // if this was the last note in its neume, we only care about the next note if there is no trailing space at the end of this neume.
          var notations = this.note.neume!.score!.notations;
          // the neume is usually the notation being laid out, so avoid searching for it
          var notationIndex =
            notations[ctxt.currNotationIndex] === this.note.neume
              ? ctxt.currNotationIndex
              : notations.indexOf(this.note.neume!);
          if (notationIndex >= 0) {
            var nextNotation = notations[notationIndex + 1];
            if (nextNotation && nextNotation.notes) {
              nextNote = nextNotation.notes[0];
            }
          }
        } else if (this.note.shape !== NoteShape.Inclinatum) {
          this.note.neume!.calculatedTrailingSpace += this.origin.x;
        }
      }
    }

    if (this.positionHint === MarkingPositionHint.Above) {
      if (staffPosition % 2 === 0) verticalOffset -= ctxt.staffInterval * 1.75;
      else verticalOffset -= ctxt.staffInterval * 0.75;
    } else if (this.positionHint === MarkingPositionHint.Below) {
      if (staffPosition % 2 === 0) verticalOffset += ctxt.staffInterval * 1.75;
      else verticalOffset += ctxt.staffInterval * 0.75;
    } else {
      if (staffPosition % 2 === 0) {
        // if the note is in a space and followed by a note on the line below, we often want to move the mora dot up slightly so that it is centered
        // between the top of the note's space and the top of the following note.
        if (nextNote && nextNote.staffPosition === staffPosition - 1) {
          verticalOffset -= ctxt.staffInterval * 0.25;
        }
      } else {
        verticalOffset -= ctxt.staffInterval * 0.75;
      }
    }
    this.bounds.x = this.horizontalOffset + this.note.bounds.right();
    this.bounds.y += verticalOffset;
  }
}

/*
 * NoteBracket
 *
 * One of Gregorio's square brackets around notes (gabc [[ and ]]): a line at
 * the left or right of the notes with a hook at each end, from below the
 * lowest note in the brackets to above the highest.  The lengths are those
 * of GregorioTeX's bracket glyphs (\GreBracket), in staff intervals: its
 * step is 157.5 font units, and its bracketupshift and bracketdownshift are
 * 0.03cm and 0.04cm at its default staff size, where a step is 0.1436cm.
 */
export class NoteBracket extends ChantLayoutElement {
  isRight: boolean;
  /** the width of the line and hooks */
  lineWeight: number;

  constructor(ctxt: ChantContext, isRight: boolean, lowStaffPosition: number, highStaffPosition: number) {
    super();

    this.isRight = isRight;
    this.lineWeight = ctxt.neumeLineWeight;

    let low = Math.round(lowStaffPosition),
      high = Math.round(highStaffPosition);
    let isOnLine = (staffPosition: number) => Math.abs(staffPosition) % 2 === 1;
    let isBelowStaff = (staffPosition: number) => staffPosition <= 0;
    let isAboveStaff = (staffPosition: number) => staffPosition >= 2 * ctxt.staffLineCount;

    // Gregorio picks a short, normal or long top so that the ends don't fall on staff lines
    let top = 1.556;
    if (!isBelowStaff(low) && !isOnLine(low)) {
      if (!isAboveStaff(high) && !isOnLine(high)) top = 2.056;
    } else if (isAboveStaff(high) || isOnLine(high)) {
      top = 1.056;
    }
    // and raises it a little from a low note on a staff line or below the
    // staff, or lowers it from one in a space
    let lowIsOnStaffLine = isOnLine(low) && !isBelowStaff(low) && !isAboveStaff(low);
    let shift = lowIsOnStaffLine || isBelowStaff(low) ? 0.209 : -0.279;

    let y0 = ctxt.calculateHeightFromStaffPosition(high + top + shift);
    let y1 = ctxt.calculateHeightFromStaffPosition(low - 1.444 + shift);

    this.bounds.x = 0;
    this.bounds.y = y0;
    this.bounds.width = (83 / 157.5) * ctxt.staffInterval;
    this.bounds.height = y1 - y0;

    this.origin.x = 0;
    this.origin.y = 0;
  }

  // the outline, from the top of the line clockwise for a left bracket
  getPoints() {
    let { x, y, width, height } = this.bounds;
    let w = this.lineWeight;
    let points = [
      [0, 0],
      [width, 0],
      [width, w],
      [w, w],
      [w, height - w],
      [width, height - w],
      [width, height],
      [0, height]
    ];
    return points.map(([px, py]) => [x + (this.isRight ? width - px : px), y + py]);
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;
    var points = this.getPoints();

    canvasCtxt.fillStyle = ctxt.neumeLineColor;
    canvasCtxt.beginPath();
    canvasCtxt.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) canvasCtxt.lineTo(points[i][0], points[i][1]);
    canvasCtxt.closePath();
    canvasCtxt.fill();
  }

  getSvgProps(ctxt: ChantContext) {
    return {
      d: "M " + this.getPoints().map(([x, y]) => x.toFixed(2) + " " + y.toFixed(2)).join(" L ") + " Z",
      fill: ctxt.neumeLineColor,
      class: "bracket"
    };
  }

  createSvgNode(ctxt: ChantContext) {
    return QuickSvg.createNode("path", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt: ChantContext) {
    return QuickSvg.createSvgTree("path", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt: ChantContext) {
    return QuickSvg.createFragment("path", this.getSvgProps(ctxt));
  }
}

/**
 * How far a custom ledger line goes beyond where it's introduced: a length in
 * staff intervals (Gregorio's 0 is 0), or, for Gregorio's 1, "overhang", as
 * far as a ledger line goes beyond a note
 */
export type LedgerLineExtent = number | "overhang";

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

/*
 * Slur
 *
 * A slur from one point to another, drawn as GregorioTeX draws its slurs
 * (\GreSlur): a crescent that bulges 0.20 to 0.22 of the em of Gregorio's
 * music font (6.35 staff intervals) at the control points, above the line
 * between its ends or below it, outlined with a 0.3bp pen (0.074 staff
 * intervals).  The slur is drawn by the chant line.
 */
export class Slur extends ChantLayoutElement {
  isAbove: boolean;
  start: { x: number; y: number };
  end: { x: number; y: number };

  constructor(ctxt: ChantContext, x0: number, y0: number, x1: number, y1: number, isAbove: boolean) {
    super();

    this.isAbove = isAbove;
    this.start = { x: x0, y: y0 };
    this.end = { x: x1, y: y1 };

    var points = [0, 0.25, 0.5, 0.75, 1].map((t) => this.pointOnOuterCurve(ctxt, t));
    var xs = points.map((p) => p.x),
      ys = points.map((p) => p.y);
    this.bounds.x = Math.min(...xs);
    this.bounds.y = Math.min(...ys);
    this.bounds.width = Math.max(...xs) - this.bounds.x;
    this.bounds.height = Math.max(...ys) - this.bounds.y;
  }

  // where a slur that the mark puts on the note starts or ends, in the
  // coordinates of the chant line: GregorioTeX raises a slur from the pitch
  // above the note (or the pitch below), by its overslurshift (0.05cm) or
  // underslurshift (0.01cm)
  static pointOnNote(ctxt: ChantContext, note: Note, mark: SlurMark) {
    // (a punctum is a staff interval wide)
    var x = note.neume!.bounds.x + note.bounds.right() - [0, 1, 0.5][mark.shift] * ctxt.staffInterval;
    var y = ctxt.calculateHeightFromStaffPosition(note.staffPosition + (mark.isAbove ? 0.904 : -1.375));
    return { x, y };
  }

  // the control points of the slur's inner curve (at 0.20 em) or outer curve (0.22 em)
  getControlPoints(ctxt: ChantContext, outer: boolean) {
    var { start, end } = this;
    var length = Math.hypot(end.x - start.x, end.y - start.y) || 1;
    var ux = (end.x - start.x) / length,
      uy = (end.y - start.y) / length;
    // (the normal, pointing up for a slur above the notes)
    var direction = this.isAbove ? 1 : -1;
    var nx = uy * direction,
      ny = -ux * direction;
    var offset = (outer ? 0.22 : 0.2) * (1000 / 157.5) * ctxt.staffInterval;
    return [0.3, 0.7].map((t) => ({
      x: start.x + t * length * ux + offset * nx,
      y: start.y + t * length * uy + offset * ny
    }));
  }

  pointOnOuterCurve(ctxt: ChantContext, t: number) {
    var [c1, c2] = this.getControlPoints(ctxt, true);
    var { start, end } = this;
    var bezier = (p0: number, p1: number, p2: number, p3: number) =>
      (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;
    return { x: bezier(start.x, c1.x, c2.x, end.x), y: bezier(start.y, c1.y, c2.y, end.y) };
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;
    var [c1, c2] = this.getControlPoints(ctxt, false);
    var [d1, d2] = this.getControlPoints(ctxt, true);

    var lineWidth = canvasCtxt.lineWidth;

    canvasCtxt.fillStyle = canvasCtxt.strokeStyle = ctxt.neumeLineColor;
    canvasCtxt.lineWidth = this.getPenWidth(ctxt);
    canvasCtxt.beginPath();
    canvasCtxt.moveTo(this.start.x, this.start.y);
    canvasCtxt.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, this.end.x, this.end.y);
    canvasCtxt.bezierCurveTo(d2.x, d2.y, d1.x, d1.y, this.start.x, this.start.y);
    canvasCtxt.closePath();
    canvasCtxt.fill();
    canvasCtxt.stroke();
    canvasCtxt.lineWidth = lineWidth;
  }

  getPenWidth(ctxt: ChantContext) {
    return 0.074 * ctxt.staffInterval;
  }

  getSvgProps(ctxt: ChantContext) {
    var [c1, c2] = this.getControlPoints(ctxt, false);
    var [d1, d2] = this.getControlPoints(ctxt, true);
    var point = (p: { x: number; y: number }) => p.x.toFixed(2) + " " + p.y.toFixed(2);
    return {
      d:
        "M " + point(this.start) +
        " C " + [c1, c2, this.end].map(point).join(" ") +
        " C " + [d2, d1, this.start].map(point).join(" ") +
        " Z",
      fill: ctxt.neumeLineColor,
      stroke: ctxt.neumeLineColor,
      "stroke-width": this.getPenWidth(ctxt),
      "stroke-linejoin": "round",
      class: "slur"
    };
  }

  createSvgNode(ctxt: ChantContext) {
    return QuickSvg.createNode("path", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt: ChantContext) {
    return QuickSvg.createSvgTree("path", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt: ChantContext) {
    return QuickSvg.createFragment("path", this.getSvgProps(ctxt));
  }
}

// indicates the shape of the brace
export const BraceShape = {
  RoundBrace: 0,
  CurlyBrace: 1,
  AccentedCurlyBrace: 2
} as const;
export type BraceShape = (typeof BraceShape)[keyof typeof BraceShape];

// indicates how the brace is alignerd to the note to which it's connected
export const BraceAttachment = {
  Left: 0,
  Right: 1
} as const;
export type BraceAttachment = (typeof BraceAttachment)[keyof typeof BraceAttachment];

/** what a brace is attached to: a note, or a clef or custos at either end of a line */
export type BraceNote = Note | ChantNotationElement;

export class BracePoint extends ChantLayoutElement {
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

  constructor(
    note: BraceNote | null,
    isAbove: boolean,
    shape: BraceShape,
    attachment: BraceAttachment
  ) {
    super();

    this.note = note;
    this.isAbove = isAbove;
    this.shape = shape;
    this.attachment = attachment;
  }

  getAttachmentX(note?: BraceNote | null) {
    if (!note) note = this.note!;
    // (only a note has a neume)
    if (this.attachment === BraceAttachment.Left)
      return ((note as Note).neume ? (note as Note).neume!.bounds.x : 0) + note.bounds.x;
    else return ((note as Note).neume ? (note as Note).neume!.bounds.x : 0) + note.bounds.right();
  }
}
