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

import * as Exsurge from "./Exsurge.Core.js";
import {
  QuickSvg,
  ChantLayoutElement,
  MarkingPositionHint,
  GlyphCode,
  GlyphVisualizer
} from "./Exsurge.Drawing.js";
import { Note, NoteShape } from "./Exsurge.Chant.js";

export class Accent extends GlyphVisualizer {
  constructor(ctxt, note, glyphCode = GlyphCode.AcuteAccent) {
    super(ctxt, glyphCode);
    this.note = note;
    this.positionHint = MarkingPositionHint.Above;
  }

  performLayout(ctxt) {
    this.bounds.x = this.note.bounds.x + this.bounds.width / 2; // center on the note itself

    // this puts the acute accent either over the staff lines, or over the note if the
    // note is above the staff lines
    this.setStaffPosition(ctxt, Math.max(this.note.staffPosition + 1, 4));
  }
}

// for positioning markings on notes
export var HorizontalEpisemaAlignment = {
  Default: 0,
  Left: 1,
  Center: 2,
  Right: 3
};

/*
 * HorizontalEpisema
 *
 * A horizontal episema marking is it's own visualizer (that is, it implements createSvgFragment)
 */
export class HorizontalEpisema extends ChantLayoutElement {
  constructor(note) {
    super();

    this.note = note;

    this.positionHint = MarkingPositionHint.Default;
    this.terminating = false; // indicates if this episema should terminate itself or not
    this.alignment = HorizontalEpisemaAlignment.Default;
  }

  performLayout(ctxt) {
    // following logic helps to keep the episemata away from staff lines if they get too close

    var y = 0,
      step;
    var minDistanceAway = ctxt.staffInterval * 0.25; // min distance from neume
    var glyphCode = this.note.glyphVisualizer.glyphCode;
    var ledgerLine = this.note.neume.ledgerLines[0] || {};
    var punctumInclinatumShorten = false;

    if (glyphCode === GlyphCode.PunctumInclinatum) {
      let notes = this.note.neume.notes,
        index = notes.indexOf(this.note),
        prevNote = notes[index - 1];
      if (
        prevNote &&
        prevNote.glyphVisualizer.glyphCode === GlyphCode.PunctumInclinatum &&
        prevNote.staffPosition - this.note.staffPosition === 1
      ) {
        punctumInclinatumShorten = true;
      }
    }

    if (this.positionHint === MarkingPositionHint.Below) {
      y = this.note.bounds.bottom() + minDistanceAway; // the highest the line could be at
      if (glyphCode === GlyphCode.None)
        // correction for episema under the second note of a porrectus
        y += ctxt.staffInterval / 2;
      step = Math.ceil(y / ctxt.staffInterval);
      // if there's enough space, center the episema between the punctum and the next staff line
      if (step % 2 === 0) {
        step = (step + 3 / 4 + (y - minDistanceAway) / ctxt.staffInterval) / 2;
      } else {
        // otherwise, find nearest acceptable third between staff lines (or staff line)
        step = (Math.ceil((1.5 * y) / ctxt.staffInterval - 0.5) * 2 + 1) / 3;

        // if it's an odd step, that means we're on a staff line,
        // so we shift to between the staff line
        if (Math.abs(step) % 2 === 1) {
          if (Math.abs(step) < 4 || ledgerLine.staffPosition === -step) {
            step += 2 / 3;
          } else {
            // no ledger line, but we don't want the episema to be at exactly the same height the ledger line would occupy:
            step += 1 / 3;
          }
        }
      }
    } else {
      y = this.note.bounds.y - minDistanceAway; // the lowest the line could be at
      step = Math.floor(y / ctxt.staffInterval);
      // if there's enough space, center the episema between the punctum and the next staff line
      if (step % 2 === 0) {
        step = (step - 3 / 4 + (y + minDistanceAway) / ctxt.staffInterval) / 2;
      } else {
        // otherwise, find nearest acceptable third between staff lines (or staff line)
        step = (Math.floor((1.5 * y) / ctxt.staffInterval - 0.5) * 2 + 1) / 3;

        // find nearest acceptable third between staff lines (or staff line)
        if (Math.abs(step) % 2 === 1) {
          // if it was a staff line, we need to adjust
          if (Math.abs(step) < 4 || ledgerLine.staffPosition === -step) {
            step -= 2 / 3;
          } else {
            // no ledger line, but we don't want the episema to be at exactly the same height the ledger line would occupy:
            step -= 1 / 3;
          }
        }
      }
    }

    y = step * ctxt.staffInterval;

    var width = this.note.bounds.width;
    var x = this.note.bounds.x;

    // The porrectus requires special handling of the note width,
    // otherwise the width is just that of the note itself
    if (
      glyphCode === GlyphCode.Porrectus1 ||
      glyphCode === GlyphCode.Porrectus2 ||
      glyphCode === GlyphCode.Porrectus3 ||
      glyphCode === GlyphCode.Porrectus4
    )
      width = ctxt.staffInterval;
    else if (glyphCode === GlyphCode.None) {
      width = ctxt.staffInterval;
      x -= width;
    } else if (punctumInclinatumShorten) {
      width *= 2 / 3;
      x += 0.5 * width;
    } else if (glyphCode === GlyphCode.PunctumInclinatumLiquescent) {
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

    this.bounds.x = x;
    this.bounds.y = y - ctxt.episemaLineWeight / 2;
    this.bounds.width = width;
    this.bounds.height = ctxt.episemaLineWeight;

    this.origin.x = 0;
    this.origin.y = 0;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;

    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    );
  }

  getSvgProps(ctxt) {
    return {
      x: this.bounds.x,
      y: this.bounds.y,
      width: this.bounds.width,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "horizontalEpisema"
    };
  }

  createSvgNode(ctxt) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createReact(ctxt) {
    return QuickSvg.createReact("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

/*
 * Ictus
 */
export class Ictus extends GlyphVisualizer {
  constructor(ctxt, note) {
    super(ctxt, GlyphCode.VerticalEpisemaAbove);
    this.note = note;
    this.positionHint = MarkingPositionHint.Default;
  }

  performLayout(ctxt) {
    var glyphCode = this.note.glyphVisualizer.glyphCode;
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
      (Math.abs(staffPosition) < 4 ||
        (this.note.neume.ledgerLines[0] || {}).staffPosition === staffPosition);

    // The porrectus requires special handling of the note width,
    // otherwise the width is just that of the note itself
    if (
      glyphCode === GlyphCode.Porrectus1 ||
      glyphCode === GlyphCode.Porrectus2 ||
      glyphCode === GlyphCode.Porrectus3 ||
      glyphCode === GlyphCode.Porrectus4
    )
      horizontalOffset = ctxt.staffInterval / 2;
    else if (glyphCode === GlyphCode.None) {
      horizontalOffset = -ctxt.staffInterval / 2;
    } else {
      horizontalOffset = this.note.bounds.width / 2;
      if (
        glyphCode === GlyphCode.PunctumInclinatum &&
        !collisionWithStaffLine &&
        !collisionWithEpisema
      ) {
        extraOffset = 0.3;
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
  constructor(ctxt, note) {
    super(ctxt, GlyphCode.Mora);
    this.note = note;
    this.positionHint = MarkingPositionHint.Default;
    this.horizontalOffset = ctxt.staffInterval / 2 + this.origin.x;
  }

  performLayout(ctxt) {
    var staffPosition = this.note.staffPosition;

    this.setStaffPosition(ctxt, staffPosition);

    var verticalOffset = 0;
    if (this.horizontalOffset === ctxt.staffInterval / 2 + this.origin.x) {
      // First, we need to find the next note in the neume.
      var noteIndex = this.note.neume.notes.indexOf(this.note);
      var nextNote;
      if (noteIndex >= 0) {
        ++noteIndex;
        if (this.note.neume.notes.length > noteIndex) {
          nextNote = this.note.neume.notes[noteIndex];
          if (nextNote.bounds.right() > this.note.bounds.right()) {
            // center the dot over the following note.
            this.horizontalOffset =
              (nextNote.bounds.right() -
                this.note.bounds.right() -
                this.bounds.right()) /
              2;
          } else {
            nextNote = null;
          }
        } else if (this.note.neume.notes.length === noteIndex) {
          // this note is the last in its neume:
          if (this.note.neume.trailingSpace === 0) {
            // if this was the last note in its neume, we only care about the next note if there is no trailing space at the end of this neume.
            var notationIndex = this.note.neume.score.notations.indexOf(
              this.note.neume
            );
            if (notationIndex >= 0) {
              var nextNotation = this.note.neume.score.notations[
                notationIndex + 1
              ];
              if (nextNotation && nextNotation.notes) {
                nextNote = nextNotation.notes[0];
              }
            }
          } else if (this.note.shape !== NoteShape.Inclinatum) {
            this.note.neume.calculatedTrailingSpace += this.origin.x;
          }
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

// indicates the shape of the brace
export var BraceShape = {
  RoundBrace: 0,
  CurlyBrace: 1,
  AccentedCurlyBrace: 2
};

// indicates how the brace is alignerd to the note to which it's connected
export var BraceAttachment = {
  Left: 0,
  Right: 1
};

export class BracePoint extends ChantLayoutElement {
  constructor(note, isAbove, shape, attachment) {
    super();

    this.note = note;
    this.isAbove = isAbove;
    this.shape = shape;
    this.attachment = attachment;
  }

  getAttachmentX(note) {
    if (!note) note = this.note;
    if (this.attachment === BraceAttachment.Left)
      return (note.neume ? note.neume.bounds.x : 0) + note.bounds.x;
    else return (note.neume ? note.neume.bounds.x : 0) + note.bounds.right();
  }
}
