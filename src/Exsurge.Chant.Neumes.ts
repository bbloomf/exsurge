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

import {
  LiquescentType,
  NoteShape,
  NoteShapeModifiers,
  type Note
} from "./Exsurge.Chant.js";
import {
  ChantNotationElement,
  GlyphCode, LineaVisualizer, MarkingPositionHint,
  NeumeBeamVisualizer,
  NeumeLineVisualizer, VirgaLineVisualizer,
  type ChantContext
} from "./Exsurge.Drawing.js";
import { Glyphs } from "./Exsurge.Glyphs.js";

/** a ledger line that a neume needs, from one of its notes to another */
export interface NeumeLedgerLine {
  element: Note;
  endElem: Note;
  staffPosition: number;
}

// the stroke of a porrectus from start down to end, or GlyphCode.None if
// there's no glyph for it (an interval of more than a fourth)
function porrectusGlyph(start: Note, end: Note): GlyphCode {
  switch (start.staffPosition - end.staffPosition) {
    case 1:
      return GlyphCode.Porrectus1;
    case 2:
      return GlyphCode.Porrectus2;
    case 3:
      return GlyphCode.Porrectus3;
    case 4:
      return GlyphCode.Porrectus4;
    default:
      return GlyphCode.None;
  }
}

// the glyph for the note after a porrectus's stroke from start down to end:
// glyph itself, unless the stroke has no glyph and is drawn as puncta, which
// the note follows, rather than standing on the last as a podatus's upper
// note does, where it would hit the line between them.  (A deminutus keeps
// its small punctum at the end of the last, as in a pes deminutus, which
// clears the line.)
function glyphAfterPorrectus(start: Note, end: Note, glyph: GlyphCode): GlyphCode {
  if (porrectusGlyph(start, end) !== GlyphCode.None) return glyph;
  switch (glyph) {
    case GlyphCode.PodatusUpper:
    case GlyphCode.PodatusUpperShort:
      return GlyphCode.PunctumQuadratum;
    default:
      return glyph;
  }
}

class NeumeBuilder {
  ctxt: ChantContext;
  neume: Neume;
  /** where the next note goes */
  x: number;
  /** the note the next note is joined to by a line, if any */
  lastNote: Note | null;
  lineIsHanging: boolean;
  minX: number;

  constructor(ctxt: ChantContext, neume: Neume, startingX = 0) {
    this.ctxt = ctxt;
    this.neume = neume;
    this.x = startingX;
    this.lastNote = null;
    this.lineIsHanging = false;
    this.minX = 0;
  }

  // used to start a hanging line on the left of the next note
  lineFrom(note: Note) {
    var previousNotation = this.ctxt.notations![this.ctxt.currNotationIndex - 1];
    if (
      this.x === 0 &&
      previousNotation &&
      previousNotation.notes &&
      previousNotation.trailingSpace === 0
    ) {
      this.lastNote = previousNotation.notes.slice(-1)[0];
      this.minX = -this.ctxt.neumeLineWeight;
    } else {
      this.lastNote = note;
      this.lineIsHanging = true;
    }
    return this;
  }

  // add a note, with a connecting line on the left if we have one
  noteAt(note: Note, glyph: GlyphCode, withLineTo = true) {
    if (!note) throw "NeumeBuilder.noteAt: note must be a valid note";

    if (!glyph) throw "NeumeBuilder.noteAt: glyph must be a valid glyph code";

    note.setGlyph(this.ctxt, glyph);
    var noteAlignsRight = note.glyphVisualizer!.align === "right";

    var needsLine =
      withLineTo &&
      this.lastNote !== null &&
      (this.ctxt.glyphMultiplier < 1 ||
        this.lineIsHanging ||
        // (an oriscus scapus's stem, even a second above)
        (note.shapeModifiers & NoteShapeModifiers.Stemmed) !== 0 ||
        (this.lastNote.glyphVisualizer &&
          this.lastNote.glyphVisualizer.align === "right") ||
        Math.abs(this.lastNote.staffPosition - note.staffPosition) > 1);

    if (needsLine) {
      var line = new NeumeLineVisualizer(
        this.ctxt,
        this.lastNote!,
        note,
        this.lineIsHanging
      );
      line.bounds.x = Math.max(this.minX, this.x - line.bounds.width);
      this.neume.addVisualizer(line);

      if (!noteAlignsRight) this.x = line.bounds.x;
    }
    
    let xOffset = 0;
    if (note.shapeModifiers & NoteShapeModifiers.Linea) {
      var linea = new LineaVisualizer(
        this.ctxt,
        note
      );
      this.neume.addVisualizer(linea);
      note.origin.x += linea.origin.x;
      xOffset = linea.origin.x;
    }

    // if this is the first note of a right aligned glyph (probably an initio debilis),
    // then there's nothing to worry about. but if it's not then first, then this
    // subtraction will right align it visually
    if (noteAlignsRight && this.lastNote)
      note.bounds.x = this.x - note.bounds.width;
    else {
      note.bounds.x = this.x + xOffset;
      this.x += note.bounds.width + xOffset;
    }

    this.neume.addVisualizer(note);

    this.lastNote = note;
    this.lineIsHanging = false;

    return this;
  }

  // a special form of noteAdd that creates a virga
  // uses a punctum cuadratum and a line rather than the virga glyphs
  virgaAt(note: Note, withLineTo = true) {
    // add the punctum for the virga
    this.noteAt(note, GlyphCode.PunctumQuadratum);

    // add a line for the virga
    var line = new VirgaLineVisualizer(this.ctxt, note);
    this.x -= line.bounds.width;
    if (note.shapeModifiers & NoteShapeModifiers.Reverse) {
      line.bounds.x = 0;
    } else {
      line.bounds.x = this.x;
    }
    this.neume.addVisualizer(line);

    this.lastNote = note;
    this.lineIsHanging = false;

    return this;
  }

  // adds an oriscus with the glyph given (OriscusAsc or OriscusDes).  an
  // oriscus scapus (gabc O) also gets a stem down on its left, like a virga
  // reversa's, as in Gregorio's OriscusScapus glyphs.  (where an oriscus
  // scapus is joined to the lower note before it, the line joining them is
  // its stem, so it's added with noteAt() instead)
  oriscusAt(note: Note, glyph: GlyphCode, withLineTo = true) {
    this.noteAt(note, glyph, withLineTo);

    if (note.shapeModifiers & NoteShapeModifiers.Stemmed) {
      var line = new VirgaLineVisualizer(this.ctxt, note);
      line.bounds.x = note.bounds.x;
      this.neume.addVisualizer(line);
    }

    return this;
  }

  // adds a linea (gabc =), a flat bar between two lines, as Gregorio's Linea
  // glyph is.  the note's glyph (Linea) draws nothing, but the note has the
  // bar's bounds, which its markings go by
  lineaAt(note: Note) {
    note.setGlyph(this.ctxt, GlyphCode.Linea);

    var linea = new LineaVisualizer(this.ctxt, note, true);
    linea.bounds.x = this.x;
    this.neume.addVisualizer(linea);

    note.bounds.x = linea.bounds.x + linea.origin.x;
    note.bounds.y = linea.bounds.y + linea.bar!.y;
    note.bounds.width = linea.bounds.width - linea.origin.x * 2;
    note.bounds.height = linea.bar!.height;
    // (as noteAt() does for the lines around a punctum, from the left of the lines)
    note.origin.x = linea.origin.x + note.bounds.width / 2;
    note.origin.y = note.bounds.height / 2;
    this.neume.addVisualizer(note);

    this.x += linea.bounds.width;
    this.lastNote = note;
    this.lineIsHanging = false;

    return this;
  }

  advanceBy(x: number) {
    this.lastNote = null;
    this.lineIsHanging = false;

    this.x += x;

    return this;
  }

  // for terminating hanging lines with no lower notes
  withLineEndingAt(note: Note) {
    if (this.lastNote === null) return;

    var line = new NeumeLineVisualizer(this.ctxt, this.lastNote, note, true);
    this.x -= line.bounds.width;
    line.bounds.x = this.x;

    this.neume.addVisualizer(line);

    this.lastNote = note;

    return this;
  }

  withPodatus(lowerNote: Note, upperNote: Note) {
    var upperGlyph;
    var lowerGlyph;

    if (lowerNote.liquescent === LiquescentType.InitioDebilis) {
      // liquescent upper note or not?
      if (upperNote.liquescent === LiquescentType.None)
        upperGlyph = GlyphCode.PunctumQuadratum;
      else upperGlyph = GlyphCode.PunctumQuadratumDesLiquescent;

      lowerGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (upperNote.liquescent & LiquescentType.Small) {
      lowerGlyph = GlyphCode.BeginningAscLiquescent;
      upperGlyph = GlyphCode.TerminatingAscLiquescent;
    } else if (upperNote.liquescent & LiquescentType.Ascending) {
      lowerGlyph = GlyphCode.PunctumQuadratum;
      upperGlyph = GlyphCode.PunctumQuadratumAscLiquescent;
    } else if (upperNote.liquescent & LiquescentType.Descending) {
      lowerGlyph = GlyphCode.PunctumQuadratum;
      upperGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    } else {
      const diff = upperNote.staffPosition - lowerNote.staffPosition + (this.ctxt.glyphMultiplier <= 0.85 ? 1 : 0);
      // standard shape
      lowerGlyph = diff > 1 ? GlyphCode.PodatusLower : GlyphCode.PodatusLowerShort;
      upperGlyph = diff > 1 ? GlyphCode.PodatusUpper : GlyphCode.PodatusUpperShort;
    }

    // allow a quilisma pes
    if (lowerNote.shape === NoteShape.Quilisma) lowerGlyph = GlyphCode.Quilisma;

    this.noteAt(lowerNote, lowerGlyph).noteAt(upperNote, upperGlyph);

    // make sure we don't have lines connected to the podatus
    this.lastNote = null;

    return this;
  }

  withClivisUpper(upper: Note, lower?: Note | null, glyph: GlyphCode = GlyphCode.PunctumQuadratum) {
    if (upper.shape === NoteShape.Oriscus)
      this.oriscusAt(upper, Oriscus.getGlyphCode(upper, false), false);
    else {
      if (lower) {
        this.lineFrom(lower);
        this.lineIsHanging = lower.staffPosition < upper.staffPosition;
        if (lower.liquescent & LiquescentType.Small) {
          glyph = GlyphCode.BeginningDesLiquescent;
        }
      }
      this.noteAt(upper, glyph);
    }
    return this;
  }

  withClivisLower(lower: Note) {
    var lowerGlyph;
    if (lower.liquescent & LiquescentType.Small) {
      lowerGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (lower.liquescent === LiquescentType.Ascending)
      lowerGlyph = GlyphCode.PunctumQuadratumAscLiquescent;
    else if (lower.liquescent === LiquescentType.Descending)
      lowerGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    else lowerGlyph = GlyphCode.PunctumQuadratum;

    return this.noteAt(lower, lowerGlyph);
  }

  withClivis(upper: Note, lower: Note) {
    this.withClivisUpper(upper, lower);
    this.withClivisLower(lower);

    // make sure we don't have lines connected to the clivis
    this.lastNote = null;

    return this;
  }

  // lays out a sequence of notes that are inclinata (e.g., climacus, pes subpunctis)
  withInclinata(notes: Note[]) {
    var staffPosition = notes[0].staffPosition,
      prevStaffPosition = notes[0].staffPosition;

    // it is important to advance by the width of the inclinatum glyph itself
    // rather than by individual note widths, so that any liquescents are spaced
    // the same as non-liquscents
    var advanceWidth =
      Glyphs.PunctumInclinatum.bounds.width * this.ctxt.glyphScaling;

    const stemNotes: Note[] = [];
    let beamCount: number | undefined;
    // now add all the punctum inclinatum
    for (var i = 0; i < notes.length; i++, prevStaffPosition = staffPosition) {
      var note = notes[i];
      let beams = notes.slice(i).find(note => note.inclinataFlags);
      beamCount = beamCount || (beams && beams.inclinataFlags);

      if (note.liquescent & LiquescentType.Small)
        note.setGlyph(this.ctxt, GlyphCode.PunctumInclinatumLiquescent);
      else if (note.liquescent & LiquescentType.Large)
        // fixme: is the large inclinatum liquescent the same as the apostropha?
        note.setGlyph(this.ctxt, GlyphCode.Stropha);
      // fixme: some climaci in the new chant books end with a punctum quadratum
      // (see, for example, the antiphon "Sancta Maria" for October 7).
      else note.setGlyph(this.ctxt, GlyphCode.PunctumInclinatum);

      staffPosition = note.staffPosition;

      var multiple = Math.abs(prevStaffPosition - staffPosition);
      switch (multiple) {
        case 0:
          multiple = 1.1;
          break;
        default:
          multiple *= (multiple >= 1 ? 2 : 4) / 3;
          break;
      }

      if (i > 0) this.x += advanceWidth * multiple;

      note.bounds.x = this.x;

      this.neume.addVisualizer(note);
      if (beams) {
        stemNotes.push(note);
      }
    }
    if (stemNotes.length) {
      const firstNote = stemNotes[0];
      const lastNote = stemNotes[stemNotes.length - 1];
      const startCoord = { x: firstNote.bounds.x, staffPosition: firstNote.staffPosition + 4 };
      const endCoord = { x: lastNote.bounds.x, staffPosition: lastNote.staffPosition + 4 };
      // Linear interpolation: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
      const getStaffPositionForX = (x: number) =>
        x === startCoord.x ? startCoord.staffPosition :
        startCoord.staffPosition +
        ((x - startCoord.x) / (endCoord.x - startCoord.x)) *
          (endCoord.staffPosition - startCoord.staffPosition);
      
      for (const note of stemNotes) {
        var stem = new NeumeLineVisualizer(
          this.ctxt,
          note,
          getStaffPositionForX(note.bounds.x)
        );
        stem.bounds.x = note.bounds.x + (note.bounds.width / 2) - (stem.bounds.width / 2);
        this.neume.addVisualizer(stem);
      }
      while (beamCount! > 0) {
        let beams = new NeumeBeamVisualizer(this.ctxt, startCoord.x + (firstNote.bounds.width / 2), endCoord.x + (lastNote.bounds.width / 2), startCoord.staffPosition, endCoord.staffPosition, --beamCount!);
        this.neume.addVisualizer(beams);
      }
    }

    return this;
  }

  withPorrectusSwash(start: Note, end: Note) {
    var glyph = porrectusGlyph(start, end);
    if (glyph === GlyphCode.None) {
      // a stroke wider than a fourth, which has no glyph yet: the two notes
      // as puncta joined by a line, as a clivis's are, so that neither is lost
      return this.noteAt(start, GlyphCode.PunctumQuadratum).noteAt(end, GlyphCode.PunctumQuadratum);
    }

    var needsLine =
      this.lastNote !== null &&
      (this.ctxt.glyphMultiplier < 1 ||
        this.lineIsHanging ||
        (this.lastNote.glyphVisualizer &&
          this.lastNote.glyphVisualizer.align === "right") ||
        Math.abs(this.lastNote.staffPosition - start.staffPosition) > 1);

    if (needsLine) {
      var line = new NeumeLineVisualizer(
        this.ctxt,
        this.lastNote!,
        start,
        this.lineIsHanging
      );
      this.x = Math.max(this.minX, this.x - line.bounds.width);
      line.bounds.x = this.x;
      this.neume.addVisualizer(line);
    }

    start.setGlyph(this.ctxt, glyph);
    start.bounds.x = this.x;

    // the second glyph does not draw anything, but it still has logical importance for the editing
    // environment...it can respond to changes which will then change the swash glyph of the first.
    end.setGlyph(this.ctxt, GlyphCode.None);

    this.x = start.bounds.right();
    end.bounds.x = this.x - end.bounds.width;

    this.neume.addVisualizer(start);
    this.neume.addVisualizer(end);

    this.lastNote = end;
    this.lineIsHanging = false;

    return this;
  }
}

/*
 * Neumes base class
 */
export class Neume extends ChantNotationElement {
  declare isNeume: true;
  declare notes: Note[];
  ledgerLines!: NeumeLedgerLine[];

  constructor(notes: Note[] = []) {
    super();

    this.isNeume = true; // poor man's reflection
    this.notes = notes;

    for (var i = 0; i < notes.length; i++) notes[i].neume = this;
  }

  addNote(note: Note) {
    note.neume = this;
    this.notes.push(note);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);
  }

  finishLayout(ctxt: ChantContext) {
    this.ledgerLines = this.requiresLedgerLine(ctxt);

    // allow subclasses an opportunity to position their own markings...
    this.positionMarkings();

    // layout the markings of the notes
    for (var i = 0; i < this.notes.length; i++) {
      var note = this.notes[i];
      var j;

      for (j = 0; j < note.episemata.length; j++) {
        note.episemata[j].performLayout(ctxt);
        this.addVisualizer(note.episemata[j]);
      }

      for (j = 0; j < note.morae.length; j++) {
        note.morae[j].performLayout(ctxt);
        this.addVisualizer(note.morae[j]);
      }

      // if the note has an ictus, then add it here
      if (note.ictus) {
        note.ictus.performLayout(ctxt);
        this.addVisualizer(note.ictus);
      }

      if (note.accent) {
        note.accent.performLayout(ctxt);
        this.addVisualizer(note.accent);
      }

      if (note.choralSign) {
        note.choralSign.performLayout(ctxt);
        this.addVisualizer(note.choralSign);
      }

      // braces are handled by the chant line, so we don't mess with them here
      // this is because brace size depends on chant line logic (neume spacing,
      // justification, etc.) so they are considered chant line level
      // markings rather than note level markings
    }

    this.origin.x = this.notes[0].origin.x;
    this.origin.y = this.notes[0].origin.y;

    super.finishLayout(ctxt);
  }

  requiresLedgerLine(ctxt: ChantContext) {
    var firstAbove: number | false = false,
      needsAbove = false,
      firstBelow: number | false = false,
      needsBelow = false,
      // isPorrectus = false,
      result: NeumeLedgerLine[] = [],
      ledgerLinePositionAbove = ctxt.staffLineCount * 2 + 1;

    if (!this.notes) return result;

    for (var i = 0; i < this.notes.length; ++i) {
      var note = this.notes[i];
      var staffPosition = note.staffPosition;
      if (staffPosition >= ledgerLinePositionAbove - 1) {
        needsAbove = needsAbove || staffPosition >= ledgerLinePositionAbove - 0.9;
        if (firstAbove === false) firstAbove = Math.max(0, i - 1);
        if (staffPosition >= ledgerLinePositionAbove) continue;
      } else if (staffPosition <= 0) {
        needsBelow = needsBelow || staffPosition < -0.1;
        if (firstBelow === false) firstBelow = Math.max(0, i - 1);
        if (staffPosition <= -1) continue;
      }
      if (needsAbove || needsBelow) {
        var endI = i; // Math.abs(staffPosition) >= 4? i : i - 1;
        result.push({
          element: this.notes[firstAbove || firstBelow || 0],
          endElem: this.notes[endI],
          staffPosition: needsAbove ? ledgerLinePositionAbove : -1
        });
        firstAbove = firstBelow = needsAbove = needsBelow = false;
      }
      // isPorrectus = /^Porrectus\d$/.test(note.glyphVisualizer.glyphCode);
    }
    if (needsAbove || needsBelow) {
      result.push({
        element: this.notes[firstAbove || firstBelow || 0],
        endElem: this.notes[this.notes.length - 1],
        staffPosition: needsAbove ? ledgerLinePositionAbove : -1
      });
    }
    return result;
  }

  resetDependencies() {}

  build(ctxt: ChantContext) {
    return new NeumeBuilder(ctxt, this);
  }
  positionEpisemata(note: Note, position: MarkingPositionHint) {
    var i;
    for (i = 0; i < note.episemata.length; i++)
      if (note.episemata[i].positionHint === MarkingPositionHint.Default)
        note.episemata[i].positionHint = position;
    if (note.choralSign) note.choralSign.positionHint = position;
    return note.episemata.length;
  }
  positionEpisemataAbove(note: Note) {
    return this.positionEpisemata(note, MarkingPositionHint.Above);
  }
  positionEpisemataBelow(note: Note) {
    return this.positionEpisemata(note, MarkingPositionHint.Below);
  }

  positionPodatusEpisemata(bottomNote: Note, topNote: Note) {
    // 1. episema on lower note by default be below, upper note above
    this.positionEpisemataBelow(bottomNote);
    this.positionEpisemataAbove(topNote);
    if (topNote.ictus) {
      topNote.ictus.positionHint = MarkingPositionHint.Above;
    }
  }
  positionInclinataMorae(notes: Note[]) {
    notes = notes.slice(-2);
    if (notes.length < 2 || notes[1].staffPosition > notes[0].staffPosition)
      return;
    var bottomNote = notes[1],
      topNote = notes[0],
      mark;

    // The mora on the second (lower) note should be below the punctum,
    // if the punctum is on a line and the previous punctum is in the space above.
    if (
      Math.abs(bottomNote.staffPosition % 2) === 1 &&
      topNote.staffPosition - bottomNote.staffPosition === 1 &&
      bottomNote.morae.length > 0
    ) {
      mark = bottomNote.morae.slice(-1)[0];
      if (mark.positionHint === MarkingPositionHint.Default)
        mark.positionHint = MarkingPositionHint.Below;
    }
  }
  positionPodatusMorae(bottomNote: Note, topNote: Note) {
    var mark;

    // The mora on the first (lower) note should be below it,
    // if it is on a line.
    if (Math.abs(bottomNote.staffPosition % 2) === 1) {
      if (bottomNote.morae.length === 1) {
        mark = bottomNote.morae[0];
      } else if (topNote.morae.length > 1) {
        mark = topNote.morae[0];
      }
      if (mark && mark.positionHint === MarkingPositionHint.Default)
        mark.positionHint = MarkingPositionHint.Below;
    }

    // if there is a mora on the first note but not on the second, and the neume
    // continues with a punctum higher than the second note, we need to adjust
    // the space after the neume so that it follows immediately with no gap
    if (bottomNote.morae.length > 0 && topNote.morae.length === 0) {
      bottomNote.morae[0].ignoreBounds = true;
    }
  }
  // for any subclasses that begin with a podatus, they can call this from their own positionMarkings()
  positionPodatusMarkings(bottomNote: Note, topNote: Note) {
    this.positionPodatusEpisemata(bottomNote, topNote);
    this.positionPodatusMorae(bottomNote, topNote);
  }

  // just like a clivis, but the first note of the three also works like the second note of the clivis:
  // episema below, unless the middle note also has an episema
  positionTorculusMarkings(firstNote: Note, secondNote: Note, thirdNote: Note) {
    var hasTopEpisema = this.positionClivisMarkings(secondNote, thirdNote);
    hasTopEpisema =
      this.positionEpisemata(
        firstNote,
        hasTopEpisema ? MarkingPositionHint.Above : MarkingPositionHint.Below
      ) && hasTopEpisema;
    return hasTopEpisema;
  }
  positionClivisMorae(firstNote: Note, secondNote: Note) {
    // 1. second note of a clivis that ends on a line and goes down one step has its mora below:
    var morae = firstNote.morae.concat(secondNote.morae);
    if (
      secondNote.morae.length &&
      firstNote.staffPosition - secondNote.staffPosition === 1 &&
      Math.abs(secondNote.staffPosition % 2) === 1
    ) {
      morae.slice(-1)[0].positionHint = MarkingPositionHint.Below;
    }
  }
  positionClivisEpisemata(firstNote: Note, secondNote: Note) {
    var hasTopEpisema = this.positionEpisemataAbove(firstNote);
    this.positionEpisemata(
      secondNote,
      hasTopEpisema ? MarkingPositionHint.Above : MarkingPositionHint.Below
    );
    return hasTopEpisema;
  }
  positionClivisMarkings(firstNote: Note, secondNote: Note) {
    this.positionClivisMorae(firstNote, secondNote);
    return this.positionClivisEpisemata(firstNote, secondNote);
  }

  positionPorrectusMarkings(firstNote: Note, secondNote: Note, thirdNote: Note) {
    // episemata on first and second note work like a clivis,
    // the second note should have its episema below, unless the first note also has an episema.
    this.positionClivisEpisemata(firstNote, secondNote);
    this.positionPodatusMarkings(secondNote, thirdNote);
  }

  positionPorrectusFlexusMarkings(first: Note, second: Note, third: Note, fourth: Note) {
    var hasTopEpisema = this.positionEpisemataAbove(first);
    hasTopEpisema = this.positionClivisMarkings(third, fourth) || hasTopEpisema;
    this.positionEpisemata(
      second,
      hasTopEpisema ? MarkingPositionHint.Above : MarkingPositionHint.Below
    );
  }

  // subclasses can override this in order to correctly place markings in a neume specific way
  positionMarkings() {}
}

/*
 * Apostropha
 */
export class Apostropha extends Neume {
  positionMarkings() {
    var positionHint: MarkingPositionHint = MarkingPositionHint.Above;

    // logic here is this: if first episema is default position, place it above.
    // then place the second one (if there is one) opposite of the first.
    for (var i = 0; i < this.notes[0].episemata.length; i++) {
      if (
        this.notes[0].episemata[i].positionHint === MarkingPositionHint.Default
      )
        this.notes[0].episemata[i].positionHint = positionHint;
      else positionHint = this.notes[0].episemata[i].positionHint;

      // now place the next one in the opposite position
      positionHint =
        positionHint === MarkingPositionHint.Above
          ? MarkingPositionHint.Below
          : MarkingPositionHint.Above;
    }
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    this.build(ctxt).noteAt(
      this.notes[0],
      Apostropha.getNoteGlyphCode(this.notes[0])
    );

    this.finishLayout(ctxt);
  }

  static getNoteGlyphCode(note: Note) {
    if (note.shape === NoteShape.Stropha) return GlyphCode.Stropha;

    if (note.liquescent & LiquescentType.Ascending)
      return GlyphCode.PunctumQuadratumAscLiquescent;
    else if (note.liquescent & LiquescentType.Descending)
      return GlyphCode.PunctumQuadratumDesLiquescent;

    if (note.shapeModifiers & NoteShapeModifiers.Cavum)
      return GlyphCode.PunctumCavum;

    return GlyphCode.PunctumQuadratum;
  }
}

/*
 * Bivirga
 *
 * For simplicity in implementation, Bivirga's have two notes in the object
 * structure. These technically must be the same pitch though.
 */
export class Bivirga extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
    this.positionEpisemataAbove(this.notes[1]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    this.build(ctxt)
      .virgaAt(this.notes[0])
      .advanceBy(ctxt.intraNeumeSpacing)
      .virgaAt(this.notes[1]);

    this.finishLayout(ctxt);
  }
}

/*
 * Trivirga
 *
 * For simplicity in implementation, Trivirga's have three notes in the object
 * structure. These technically must be the same pitch though.
 */
export class Trivirga extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
    this.positionEpisemataAbove(this.notes[1]);
    this.positionEpisemataAbove(this.notes[2]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    this.build(ctxt)
      .virgaAt(this.notes[0])
      .advanceBy(ctxt.intraNeumeSpacing)
      .virgaAt(this.notes[1])
      .advanceBy(ctxt.intraNeumeSpacing)
      .virgaAt(this.notes[2]);

    this.finishLayout(ctxt);
  }
}

/*
 * Climacus
 */
export class Climacus extends Neume {
  positionMarkings() {
    for (var i = 0; i < this.notes.length; i++) {
      this.positionEpisemataAbove(this.notes[i]);
    }
    this.positionInclinataMorae(this.notes);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    this.build(ctxt)
      .virgaAt(this.notes[0])
      .advanceBy(ctxt.intraNeumeSpacing)
      .withInclinata(this.notes.slice(1));

    this.finishLayout(ctxt);
  }
}

/*
 * Clivis
 */
export class Clivis extends Neume {
  positionMarkings() {
    this.positionClivisMarkings(this.notes[0], this.notes[1]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var upper = this.notes[0];
    var lower = this.notes[1];

    // Gregorio's [shape:stroke] hint on the lower note draws a clivis (but
    // not one with an oriscus or a liquescent) as the stroke a porrectus
    // starts with, with its stem
    if (
      upper.shape === NoteShape.Default &&
      lower.liquescent === LiquescentType.None &&
      lower.shapeHint &&
      lower.shapeHint.split(",").includes("stroke")
    )
      this.build(ctxt).lineFrom(lower).withPorrectusSwash(upper, lower);
    else this.build(ctxt).withClivis(upper, lower);

    this.finishLayout(ctxt);
  }
}

/*
 * Ancus
 */
export class Ancus extends Neume {
  positionMarkings() {
    this.positionClivisMarkings(this.notes[0], this.notes[2]);
    this.positionClivisMarkings(this.notes[1], this.notes[2]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var upper = this.notes[0];
    var middle = this.notes[1];
    var lower = this.notes[2];

    var builder = this.build(ctxt);
    builder.withClivisUpper(upper, middle);
    let middleGlyph: GlyphCode = GlyphCode.PunctumQuadratum;
    if (lower.liquescent & LiquescentType.Small) {
      middleGlyph = GlyphCode.BeginningDesLiquescent;
    }
    if (upper.staffPosition - middle.staffPosition > 1) {
      builder.withClivisUpper(middle, upper, middleGlyph);
    } else {
      builder.withClivisUpper(middle, null, middleGlyph);
    }
    builder.withClivisLower(lower);
    builder.lastNote = null;

    this.finishLayout(ctxt);
  }
}

/*
 * Distropha
 *
 * For simplicity in implementation, Distropha's have two notes in the object
 * structure. These technically must be the same pitch though (like Bivirga).
 */
export class Distropha extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
    this.positionEpisemataAbove(this.notes[1]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);
    let glyphCodes = this.notes.map((note) =>
      Apostropha.getNoteGlyphCode(note)
    );
    let glyphAdvance = ctxt.intraNeumeSpacing;
    glyphCodes.slice(0, 2).forEach((glyphCode) => {
      if (glyphCode === GlyphCode.Stropha)
        glyphAdvance -= ctxt.intraNeumeSpacing / 4;
    });

    this.build(ctxt)
      .noteAt(this.notes[0], glyphCodes[0])
      .advanceBy(glyphAdvance)
      .noteAt(this.notes[1], glyphCodes[1]);

    this.finishLayout(ctxt);
  }
}

/*
 * Oriscus
 */
export class Oriscus extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    // determine the glyph to use
    var note = this.notes[0];
    var glyph;

    if (note.liquescent !== LiquescentType.None) {
      glyph = GlyphCode.OriscusLiquescent;
    } else glyph = Oriscus.getLastNoteGlyphCode(ctxt, note);

    this.build(ctxt).oriscusAt(note, glyph);

    this.finishLayout(ctxt);
  }

  resetDependencies() {
    if (Oriscus.pointsToNextNeume(this.notes[0])) this.needsLayout = true;
  }

  // OriscusAsc or OriscusDes: as gabc o1 or o0 (or o< or o>) designates, or
  // else pointing up if the note it points to is higher
  static getGlyphCode(note: Note, pointsToHigherNote: boolean) {
    if (note.shapeModifiers & NoteShapeModifiers.Ascending)
      return GlyphCode.OriscusAsc;
    else if (note.shapeModifiers & NoteShapeModifiers.Descending)
      return GlyphCode.OriscusDes;
    else if (pointsToHigherNote) return GlyphCode.OriscusAsc;
    else return GlyphCode.OriscusDes;
  }

  // the glyph for an oriscus that ends its neume, which points, as in
  // Gregorio, to the first note after it that isn't at the unison, however
  // many neumes on, or down if there's none
  static getLastNoteGlyphCode(ctxt: ChantContext, note: Note) {
    var staffPosition = ctxt.activeClef.pitchToStaffPosition(note.pitch!);

    for (var i = ctxt.currNotationIndex + 1; i < ctxt.notations!.length; i++) {
      var notation = ctxt.notations![i];

      if (!notation.isNeume || notation.hasNoWidth) continue;

      for (var nextNote of notation.notes!) {
        var nextStaffPosition = ctxt.activeClef.pitchToStaffPosition(
          nextNote.pitch!
        );

        if (nextStaffPosition !== staffPosition)
          return Oriscus.getGlyphCode(note, nextStaffPosition > staffPosition);
      }
    }

    return Oriscus.getGlyphCode(note, false);
  }

  // an oriscus at the end of its neume tries to automatically use the right
  // direction based on the following neumes. if we don't have a manually
  // designated direction, then its neume resets its layout so that we can
  // try to guess it at next layout phase.
  static pointsToNextNeume(note: Note) {
    return !(
      note.shapeModifiers & NoteShapeModifiers.Ascending ||
      note.shapeModifiers & NoteShapeModifiers.Descending
    );
  }
}

/*
 * PesOriscus
 *
 * A punctum and an oriscus scapus above it (gabc egO), joined by a line, which
 * is the oriscus's stem (Gregorio's pes ascendens or descendens oriscus). The
 * oriscus points the way a lone oriscus does.
 */
export class PesOriscus extends Neume {
  positionMarkings() {
    this.positionPodatusMarkings(this.notes[0], this.notes[1]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var lower = this.notes[0];
    var upper = this.notes[1];

    this.build(ctxt)
      .noteAt(lower, GlyphCode.PunctumQuadratum)
      .noteAt(upper, Oriscus.getLastNoteGlyphCode(ctxt, upper));

    this.finishLayout(ctxt);
  }

  resetDependencies() {
    if (Oriscus.pointsToNextNeume(this.notes[1])) this.needsLayout = true;
  }
}

/*
 * PesQuadratum
 *
 * Two square puncta (gabc fqg), joined by a line when they're more than a
 * second apart, with a virga's stem down from the upper one, as Gregorio's
 * PesQuadratum glyphs have. A liquescent upper note is drawn as in a podatus,
 * as Gregorio draws a pes quadratum auctus like a pes auctus.
 */
export class PesQuadratum extends Neume {
  positionMarkings() {
    this.positionPodatusMarkings(this.notes[0], this.notes[1]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var lower = this.notes[0];
    var upper = this.notes[1];

    if (upper.liquescent !== LiquescentType.None)
      this.build(ctxt).withPodatus(lower, upper);
    else
      this.build(ctxt)
        .noteAt(
          lower,
          lower.liquescent === LiquescentType.InitioDebilis
            ? GlyphCode.TerminatingDesLiquescent
            : GlyphCode.PunctumQuadratum
        )
        .virgaAt(upper);

    this.finishLayout(ctxt);
  }
}

/*
 * PesQuassus
 */
export class PesQuassus extends Neume {
  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var lower = this.notes[0];
    var upper = this.notes[1];

    var lowerGlyph;

    var lowerStaffPos = lower.staffPosition;
    var upperStaffPos = upper.staffPosition;

    if (lower.shape === NoteShape.Oriscus)
      lowerGlyph = Oriscus.getGlyphCode(lower, true);
    else lowerGlyph = GlyphCode.PunctumQuadratum;

    var builder = this.build(ctxt).noteAt(lower, lowerGlyph);

    if (upperStaffPos - lowerStaffPos === 1)
      // use a virga glyph in this case
      builder.virgaAt(upper);
    else if (upper.liquescent === LiquescentType.LargeDescending)
      builder
        .noteAt(upper, GlyphCode.PunctumQuadratumDesLiquescent)
        .withLineEndingAt(lower);
    else
      builder.noteAt(upper, GlyphCode.PunctumQuadratum).withLineEndingAt(lower);

    this.finishLayout(ctxt);
  }
}

/*
 * PesSubpunctis
 */
export class PesSubpunctis extends Neume {
  positionMarkings() {
    this.positionPodatusEpisemata(this.notes[0], this.notes[1]);
    for (var i = 2; i < this.notes.length; ++i) {
      this.positionEpisemataAbove(this.notes[i]);
    }
    this.positionInclinataMorae(this.notes.slice(1));
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    // podatus followed by inclinata
    this.build(ctxt)
      .withPodatus(this.notes[0], this.notes[1])
      .advanceBy(ctxt.intraNeumeSpacing * 0.68)
      .withInclinata(this.notes.slice(2));

    this.finishLayout(ctxt);
  }
}

/*
 * Podatus
 *
 * This podatus class handles a few neume types actually, depending on the note
 * data: Podatus (including various liquescent types on the upper note),
 * Podatus initio debilis, and Quilisma-Pes
 */
export class Podatus extends Neume {
  positionMarkings() {
    this.positionPodatusMarkings(this.notes[0], this.notes[1]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    this.build(ctxt).withPodatus(this.notes[0], this.notes[1]);

    this.finishLayout(ctxt);
  }
}

/*
 * Porrectus
 */
export class Porrectus extends Neume {
  positionMarkings() {
    this.positionPorrectusMarkings(this.notes[0], this.notes[1], this.notes[2]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];

    var thirdGlyph;

    if (third.liquescent & LiquescentType.Small)
      thirdGlyph = GlyphCode.TerminatingAscLiquescent;
    else if (third.liquescent & LiquescentType.Descending)
      thirdGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    else
      thirdGlyph =
        third.staffPosition - second.staffPosition > 1
          ? GlyphCode.PodatusUpper
          : GlyphCode.PodatusUpperShort;

    this.build(ctxt)
      .lineFrom(second)
      .withPorrectusSwash(first, second)
      .noteAt(third, glyphAfterPorrectus(first, second, thirdGlyph));

    this.finishLayout(ctxt);
  }
}

/*
 * PorrectusFlexus
 */
export class PorrectusFlexus extends Neume {
  positionMarkings() {
    this.positionPorrectusFlexusMarkings(
      this.notes[0],
      this.notes[1],
      this.notes[2],
      this.notes[3]
    );
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];
    var fourth = this.notes[3];

    var thirdGlyph: GlyphCode = GlyphCode.PunctumQuadratum,
      fourthGlyph;

    if (fourth.liquescent & LiquescentType.Small) {
      thirdGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
      fourthGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (fourth.liquescent & LiquescentType.Ascending)
      fourthGlyph = GlyphCode.PunctumQuadratumAscLiquescent;
    else if (fourth.liquescent & LiquescentType.Descending)
      fourthGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    else fourthGlyph = GlyphCode.PunctumQuadratum;

    this.build(ctxt)
      .lineFrom(second)
      .withPorrectusSwash(first, second)
      .noteAt(third, thirdGlyph)
      .noteAt(fourth, fourthGlyph);

    this.finishLayout(ctxt);
  }
}

// this is some type of pseudo nume right? there is no such thing as a neume
// of puncta inclinata, but this will be part of other composite neumes.
export class PunctaInclinata extends Neume {
  positionMarkings() {
    this.positionInclinataMorae(this.notes);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    this.build(ctxt).withInclinata(this.notes);

    this.finishLayout(ctxt);
  }
}

/*
 * Punctum
 */
export class Punctum extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var note = this.notes[0];
    var glyph: GlyphCode = GlyphCode.PunctumQuadratum;

    if (note.linea) {
      this.build(ctxt).lineaAt(note);
      this.finishLayout(ctxt);
      return;
    }

    // determine the glyph to use
    if (note.liquescent !== LiquescentType.None) {
      if (note.shape === NoteShape.Inclinatum)
        glyph = GlyphCode.PunctumInclinatumLiquescent;
      else if (note.shape === NoteShape.Oriscus)
        glyph = GlyphCode.OriscusLiquescent;
      else if (note.liquescent & LiquescentType.Ascending)
        glyph = GlyphCode.PunctumQuadratumAscLiquescent;
      else if (note.liquescent & LiquescentType.Descending)
        glyph = GlyphCode.PunctumQuadratumDesLiquescent;
      else glyph = GlyphCode.PunctumQuadratumLiquescent;
    } else {
      if (note.shapeModifiers & NoteShapeModifiers.Cavum)
        glyph = GlyphCode.PunctumCavum;
      else if (note.shape === NoteShape.Inclinatum)
        glyph = GlyphCode.PunctumInclinatum;
      else if (note.shape === NoteShape.Quilisma) glyph = GlyphCode.Quilisma;
      else glyph = GlyphCode.PunctumQuadratum;
    }

    this.build(ctxt).noteAt(note, glyph);

    this.finishLayout(ctxt);
  }
}

/*
 * Salicus
 */
export class Salicus extends Neume {
  positionMarkings() {
    // by default place episema below
    // fixme: is this correct?
    for (var i = 0; i < this.notes.length; i++)
      this.positionEpisemataBelow(this.notes[i]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];

    var builder = this.build(ctxt).noteAt(first, GlyphCode.PunctumQuadratum);

    // if the next note doesn't require a stem connector, then add a tad bit
    // of spacing here
    if (!(second.shapeModifiers & NoteShapeModifiers.Stemmed))
      builder.advanceBy(ctxt.intraNeumeSpacing);

    // second note is always an oriscus, which may or may not be stemmed
    // to the first, and points up unless gabc designates otherwise
    builder.noteAt(second, Oriscus.getGlyphCode(second, true));

    // third note can be a punctum quadratum or various liquescent forms
    if (third.liquescent & LiquescentType.Small)
      builder.noteAt(third, GlyphCode.TerminatingAscLiquescent);
    else if (third.liquescent === LiquescentType.Ascending)
      builder.noteAt(third, GlyphCode.PunctumQuadratumAscLiquescent);
    else if (third.liquescent === LiquescentType.Descending)
      builder.noteAt(third, GlyphCode.PunctumQuadratumDesLiquescent);
    else builder.virgaAt(third);

    this.finishLayout(ctxt);
  }
}

/*
 * Salicus Flexus
 */
export class SalicusFlexus extends Neume {
  positionMarkings() {
    var hasTopEpisema = this.positionTorculusMarkings(
      this.notes[1],
      this.notes[2],
      this.notes[3]
    );
    this.positionEpisemata(
      this.notes[0],
      hasTopEpisema ? MarkingPositionHint.Above : MarkingPositionHint.Below
    );
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];
    var fourth = this.notes[3];

    var builder = this.build(ctxt).noteAt(first, GlyphCode.PunctumQuadratum);

    // if the next note doesn't require a stem connector, then add a tad bit
    // of spacing here
    if (!(second.shapeModifiers & NoteShapeModifiers.Stemmed))
      builder.advanceBy(ctxt.intraNeumeSpacing);

    // second note is always an oriscus, which may or may not be stemmed
    // to the first, and points up unless gabc designates otherwise
    builder.noteAt(second, Oriscus.getGlyphCode(second, true));

    // third note can be a punctum quadratum or various liquescent forms,
    // ...based on note four though!
    if (fourth.liquescent & LiquescentType.Small)
      builder.noteAt(third, GlyphCode.PunctumQuadratumDesLiquescent);
    else builder.noteAt(third, GlyphCode.PunctumQuadratum);

    // finally, do the fourth note
    if (fourth.liquescent & LiquescentType.Small)
      builder.noteAt(fourth, GlyphCode.TerminatingDesLiquescent);
    else if (fourth.liquescent & LiquescentType.Ascending)
      builder.noteAt(fourth, GlyphCode.PunctumQuadratumAscLiquescent);
    else if (fourth.liquescent & LiquescentType.Descending)
      builder.noteAt(fourth, GlyphCode.PunctumQuadratumDesLiquescent);
    else builder.noteAt(fourth, GlyphCode.PunctumQuadratum);

    this.finishLayout(ctxt);
  }
}

/*
 * Scandicus
 */
export class Scandicus extends Neume {
  positionMarkings() {
    if (this.notes[2].shape === NoteShape.Virga) {
      this.positionPodatusMarkings(this.notes[0], this.notes[1]);
      this.positionEpisemataAbove(this.notes[2]);
    } else {
      this.positionEpisemataBelow(this.notes[0]);
      this.positionPodatusMarkings(this.notes[1], this.notes[2]);
    }
  }

  // if the third note shape is a virga, then the scadicus is rendered
  // as a podatus followed by a virga. Otherwise, it's rendered as a
  // punctum followed by a podatus...
  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];

    if (third.shape === NoteShape.Virga) {
      this.build(ctxt).withPodatus(first, second).virgaAt(third);
    } else {
      this.build(ctxt)
        .noteAt(
          first,
          first.shape === NoteShape.Quilisma
            ? GlyphCode.Quilisma
            : GlyphCode.PunctumQuadratum
        )
        .withPodatus(second, third);
    }

    this.finishLayout(ctxt);
  }
}

/*
 * Scandicus Flexus
 */
export class ScandicusFlexus extends Neume {
  positionMarkings() {
    if (this.notes[2].shape === NoteShape.Virga) {
      this.positionPodatusMarkings(this.notes[0], this.notes[1]);
      this.positionClivisMarkings(this.notes[2], this.notes[3]);
    } else {
      this.positionEpisemataBelow(this.notes[0]);
      this.positionPodatusMarkings(this.notes[1], this.notes[2]);
      this.positionEpisemataAbove(this.notes[3]);
    }
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];
    var fourth = this.notes[3];

    if (third.shape === NoteShape.Virga) {
      this.build(ctxt)
        .withPodatus(first, second)
        .advanceBy(ctxt.intraNeumeSpacing)
        .withClivis(third, fourth);
    } else {
      var fourthGlyph: GlyphCode = GlyphCode.PunctumQuadratum;

      if (fourth.liquescent & LiquescentType.Ascending)
        fourthGlyph = GlyphCode.PunctumQuadratumAscLiquescent;
      else if (fourth.liquescent & LiquescentType.Descending)
        fourthGlyph = GlyphCode.PunctumQuadratumDesLiquescent;

      this.build(ctxt)
        .noteAt(first, GlyphCode.PunctumQuadratum)
        .withPodatus(second, third)
        .advanceBy(ctxt.intraNeumeSpacing)
        .noteAt(fourth, fourthGlyph);
    }

    this.finishLayout(ctxt);
  }
}

/*
 * Torculus
 */
export class Torculus extends Neume {
  positionMarkings() {
    this.positionTorculusMarkings(this.notes[0], this.notes[1], this.notes[2]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var note1 = this.notes[0];
    var note2 = this.notes[1];
    var note3 = this.notes[2];

    var glyph1, glyph3;

    if (note1.liquescent === LiquescentType.InitioDebilis)
      glyph1 = GlyphCode.TerminatingDesLiquescent;
    else if (note1.shape === NoteShape.Quilisma) glyph1 = GlyphCode.Quilisma;
    else glyph1 = GlyphCode.PunctumQuadratum;

    if (note3.liquescent & LiquescentType.Small)
      glyph3 = GlyphCode.TerminatingDesLiquescent;
    else if (note3.liquescent & LiquescentType.Ascending)
      glyph3 = GlyphCode.PunctumQuadratumAscLiquescent;
    else if (note3.liquescent & LiquescentType.Descending)
      glyph3 = GlyphCode.PunctumQuadratumDesLiquescent;
    else glyph3 = GlyphCode.PunctumQuadratum;

    this.build(ctxt)
      .noteAt(note1, glyph1)
      .noteAt(note2, GlyphCode.PunctumQuadratum)
      .noteAt(note3, glyph3);

    this.finishLayout(ctxt);
  }
}

/*
 * TorculusResupinus
 */
export class TorculusResupinus extends Neume {
  positionMarkings() {
    this.positionPorrectusMarkings(this.notes[1], this.notes[2], this.notes[3]);
    this.positionClivisEpisemata(this.notes[1], this.notes[0]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];
    var fourth = this.notes[3];

    var firstGlyph, fourthGlyph;

    if (first.liquescent === LiquescentType.InitioDebilis) {
      firstGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (first.shape === NoteShape.Quilisma)
      firstGlyph = GlyphCode.Quilisma;
    else firstGlyph = GlyphCode.PunctumQuadratum;

    if (fourth.liquescent & LiquescentType.Small)
      fourthGlyph = GlyphCode.TerminatingAscLiquescent;
    else if (third.liquescent & LiquescentType.Descending)
      fourthGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    else fourthGlyph = GlyphCode.PodatusUpper;

    this.build(ctxt)
      .noteAt(first, firstGlyph)
      .withPorrectusSwash(second, third)
      .noteAt(fourth, glyphAfterPorrectus(second, third, fourthGlyph));

    this.finishLayout(ctxt);
  }
}

/*
 * TorculusResupinusFlexus
 */
export class TorculusResupinusFlexus extends Neume {
  positionMarkings() {
    this.positionPorrectusFlexusMarkings(
      this.notes[1],
      this.notes[2],
      this.notes[3],
      this.notes[4]
    );
    this.positionClivisEpisemata(this.notes[1], this.notes[0]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var first = this.notes[0];
    var second = this.notes[1];
    var third = this.notes[2];
    var fourth = this.notes[3];
    var fifth = this.notes[4];

    var firstGlyph,
      fourthGlyph: GlyphCode = GlyphCode.PunctumQuadratum,
      fifthGlyph;

    if (first.liquescent === LiquescentType.InitioDebilis) {
      firstGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (first.shape === NoteShape.Quilisma)
      firstGlyph = GlyphCode.Quilisma;
    else firstGlyph = GlyphCode.PunctumQuadratum;

    if (fifth.liquescent & LiquescentType.Small) {
      fourthGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
      fifthGlyph = GlyphCode.TerminatingDesLiquescent;
    } else if (fifth.liquescent & LiquescentType.Ascending)
      fifthGlyph = GlyphCode.PunctumQuadratumAscLiquescent;
    else if (fifth.liquescent & LiquescentType.Descending)
      fifthGlyph = GlyphCode.PunctumQuadratumDesLiquescent;
    else fifthGlyph = GlyphCode.PunctumQuadratum;

    this.build(ctxt)
      .noteAt(first, firstGlyph)
      .withPorrectusSwash(second, third)
      .noteAt(fourth, fourthGlyph)
      .noteAt(fifth, fifthGlyph);

    this.finishLayout(ctxt);
  }
}

/*
 * Tristropha
 *
 * For simplicity in implementation, Tristropha's have three notes in the object
 * structure. These technically must be the same pitch though (like the
 * Distropha and Bivirga).
 */
export class Tristropha extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
    this.positionEpisemataAbove(this.notes[1]);
    this.positionEpisemataAbove(this.notes[2]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);
    let glyphCodes = this.notes.map((note) =>
      Apostropha.getNoteGlyphCode(note)
    );
    let glyphAdvance =
      glyphCodes[0] === GlyphCode.Stropha
        ? ctxt.intraNeumeSpacing / 2
        : ctxt.intraNeumeSpacing;

    this.build(ctxt)
      .noteAt(this.notes[0], glyphCodes[0])
      .advanceBy(glyphAdvance)
      .noteAt(this.notes[1], glyphCodes[1])
      .advanceBy(glyphAdvance)
      .noteAt(this.notes[2], glyphCodes[2]);

    this.finishLayout(ctxt);
  }
}

/*
 * Virga
 */
export class Virga extends Neume {
  positionMarkings() {
    this.positionEpisemataAbove(this.notes[0]);
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    this.build(ctxt).virgaAt(this.notes[0]);

    this.finishLayout(ctxt);
  }
}
