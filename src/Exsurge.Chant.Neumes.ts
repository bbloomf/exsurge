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
  GlyphCode, InclinatumGlyphTurn, LineaVisualizer, MarkingPositionHint,
  NeumeBeamVisualizer,
  NeumeLineVisualizer, porrectusGlyphCode, VirgaLineVisualizer,
  type ChantContext
} from "./Exsurge.Drawing.js";
import { Glyphs } from "./Exsurge.Glyphs.js";
import { NoteBracket, ledgerLinePosition } from "./Exsurge.Chant.Markings.js";
import { hasDrawnLedgerLine } from "./ledgerLines.js";

/** a ledger line that a neume's notes have, from one of its notes to another */
export interface NeumeLedgerLine {
  element: Note;
  endElem: Note;
  staffPosition: number;
  /** where it goes under in the neume, if it's under only part of a note's glyph */
  x1?: number;
  x2?: number;
}

// the stroke of a porrectus from start down to end, however far that is: a
// stroke for both notes, so hollow if either is
function porrectusGlyph(start: Note, end: Note): GlyphCode {
  return porrectusGlyphCode(
    start.staffPosition - end.staffPosition,
    ((start.shapeModifiers | end.shapeModifiers) & NoteShapeModifiers.Cavum) !== 0
  );
}

// the head of a punctum auctus, ascending or descending, for a note with < or
// >, and otherwise glyph
function auctusHead(note: Note, glyph: GlyphCode): GlyphCode {
  if (note.liquescent & LiquescentType.Ascending) return GlyphCode.PunctumQuadratumAscLiquescent;
  if (note.liquescent & LiquescentType.Descending) return GlyphCode.PunctumQuadratumDesLiquescent;
  return glyph;
}

// a punctum inclinatum's glyph: an auctus for gabc G< or G>, and otherwise
// leaning as its leaning says, or upright if ctxt.inclinatumLeaning is off
function inclinatumGlyph(ctxt: ChantContext, note: Note): GlyphCode {
  if (note.liquescent & (LiquescentType.Ascending | LiquescentType.Descending))
    return GlyphCode.PunctumInclinatumAuctus;
  switch (ctxt.inclinatumLeaning && (note.leaning || note.automaticLeaning)) {
    case "ascending":
      return GlyphCode.PunctumInclinatumAscendens;
    case "descending":
      return GlyphCode.PunctumInclinatumDescendens;
    default:
      return GlyphCode.PunctumInclinatum;
  }
}

// upright inclinata a step apart lie along a line 2/3 of a staff interval
// across for each one down, as the lower edges of PunctumInclinatum do, and
// PunctumInclinatumAscendens and Descendens are it turned 6°
const inclinatumStepAngle = Math.atan(2 / 3),
  inclinatumLean = (6 * Math.PI) / 180;

// which way an inclinatum's glyph is turned: 1 as in an ascending line, -1 as
// in a descending line, and 0 if it's upright
function inclinatumTurn(note: Note): number {
  return InclinatumGlyphTurn[note.glyphVisualizer!.glyphCode] || 0;
}

// how far right of its middle an inclinatum's top point is, which turning
// PunctumInclinatum 6° takes round with it
function inclinatumTopOffset(ctxt: ChantContext, note: Note): number {
  return (
    inclinatumTurn(note) * Math.sin(inclinatumLean) * Glyphs.PunctumInclinatum.origin.y * ctxt.glyphScaling
  );
}

// the glyph for a porrectus's third note, which goes up from the second
function porrectusThirdGlyph(second: Note, third: Note): GlyphCode {
  if (third.liquescent & LiquescentType.Small)
    return GlyphCode.TerminatingAscLiquescent;
  else if (third.liquescent & LiquescentType.Descending)
    return GlyphCode.PunctumQuadratumDesLiquescent;
  else
    return third.staffPosition - second.staffPosition > 1
      ? GlyphCode.PodatusUpper
      : GlyphCode.PodatusUpperShort;
}

// whether Gregorio's [shape:stroke] hint on a flexus's lower note draws it as
// the stroke a porrectus starts with (but not one with an oriscus or a
// liquescent)
function hasStrokeHint(upper: Note, lower: Note) {
  return (
    upper.shape === NoteShape.Default &&
    lower.liquescent === LiquescentType.None &&
    !!lower.shapeHint &&
    lower.shapeHint.split(",").includes("stroke")
  );
}

// the glyph for a note on its own, such as a punctum's (see Punctum)
function punctumGlyphCode(note: Note): GlyphCode {
  if (note.liquescent !== LiquescentType.None) {
    if (note.shape === NoteShape.Inclinatum)
      return GlyphCode.PunctumInclinatumLiquescent;
    else if (note.shape === NoteShape.Oriscus)
      return GlyphCode.OriscusLiquescent;
    else if (note.liquescent & LiquescentType.Ascending)
      return GlyphCode.PunctumQuadratumAscLiquescent;
    else if (note.liquescent & LiquescentType.Descending)
      return GlyphCode.PunctumQuadratumDesLiquescent;
    else return GlyphCode.PunctumQuadratumLiquescent;
  } else {
    // (noteAt() draws a cavum hollow)
    if (note.shape === NoteShape.Inclinatum)
      return GlyphCode.PunctumInclinatum;
    else if (note.shape === NoteShape.Quilisma) return GlyphCode.Quilisma;
    else return GlyphCode.PunctumQuadratum;
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

  // used to start a hanging line on the left of the next note.  (a fused
  // neume that isn't a FusedNeume, such as a porrectus flexus, keeps its
  // stem, since Gregorio doesn't join it to the glyph before)
  lineFrom(note: Note) {
    var previousNotation = this.ctxt.notations![this.ctxt.currNotationIndex - 1];
    if (
      this.x === 0 &&
      previousNotation &&
      previousNotation.notes &&
      previousNotation.trailingSpace === 0 &&
      !this.neume.notes[0].fused
    ) {
      this.lastNote = previousNotation.notes.slice(-1)[0];
      this.minX = -this.ctxt.neumeLineWeight;
    } else {
      this.lastNote = note;
      this.lineIsHanging = true;
    }
    return this;
  }

  // add a note, with a connecting line on the left if we have one.  withStem
  // false draws an oriscus scapus as a plain oriscus, as Gregorio fuses it
  noteAt(note: Note, glyph: GlyphCode, withLineTo = true, withStem = true) {
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
        (withStem && (note.shapeModifiers & NoteShapeModifiers.Stemmed) !== 0) ||
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
    // add the punctum for the virga (a virga reversa auctus, gabc V< or V>,
    // has the head of a punctum auctus, as Gregorio's does)
    this.noteAt(
      note,
      note.shapeModifiers & NoteShapeModifiers.Reverse
        ? auctusHead(note, GlyphCode.PunctumQuadratum)
        : GlyphCode.PunctumQuadratum
    );

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
  // its stem, so it's added with noteAt() instead).  fusedShift is the
  // interval to a note it's fused to (see VirgaLineVisualizer)
  oriscusAt(note: Note, glyph: GlyphCode, withLineTo = true, fusedShift = 0) {
    this.noteAt(note, glyph, withLineTo);

    if (note.shapeModifiers & NoteShapeModifiers.Stemmed) {
      var line = new VirgaLineVisualizer(this.ctxt, note, fusedShift);
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

    // a quilisma quadratum's pes (as Gregorio's QuilismaPesQuadratum): the
    // upper note beside the quilisma rather than above it, joined to it by a
    // line where they don't touch (a deminutus stays as it is, as Gregorio
    // has no square pes deminutus)
    if (lowerNote.quilismaQuadratum && !(upperNote.liquescent & LiquescentType.Small))
      upperGlyph = auctusHead(upperNote, GlyphCode.PunctumQuadratum);

    this.noteAt(lowerNote, lowerGlyph).noteAt(upperNote, upperGlyph);

    // make sure we don't have lines connected to the podatus
    this.lastNote = null;

    return this;
  }

  // a pes quassus: an oriscus (without a scapus's stem, as in Gregorio) or a
  // punctum, and the note above it, a virga if it's a second above
  withPesQuassus(lower: Note, upper: Note) {
    this.noteAt(
      lower,
      lower.shape === NoteShape.Oriscus
        ? Oriscus.getGlyphCode(lower, true)
        : GlyphCode.PunctumQuadratum,
      true,
      false
    );

    if (upper.staffPosition - lower.staffPosition === 1)
      // use a virga glyph in this case
      this.virgaAt(upper);
    else
      this.noteAt(
        upper,
        upper.liquescent === LiquescentType.LargeDescending
          ? GlyphCode.PunctumQuadratumDesLiquescent
          : GlyphCode.PunctumQuadratum
      ).withLineEndingAt(lower);

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
      else note.setGlyph(this.ctxt, inclinatumGlyph(this.ctxt, note));

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

      if (i > 0) {
        // leaning inclinata go further apart along their leaning and closer
        // together against it, so that their edges line up as upright ones'
        // do (turned as the one before, or as this one if that's upright)
        let turn =
          (inclinatumTurn(notes[i - 1]) || inclinatumTurn(note)) *
          Math.sign(staffPosition - prevStaffPosition);
        if (turn)
          multiple *=
            Math.tan(inclinatumStepAngle + turn * inclinatumLean) / Math.tan(inclinatumStepAngle);
        this.x += advanceWidth * multiple;
      }

      note.bounds.x = this.x;

      this.neume.addVisualizer(note);
      if (beams) {
        stemNotes.push(note);
      }
    }
    if (stemNotes.length) {
      const firstNote = stemNotes[0];
      const lastNote = stemNotes[stemNotes.length - 1];
      // each stem stands on its inclinatum's top point, and the beams meet them
      const stemX = (note: Note) => note.bounds.x + inclinatumTopOffset(this.ctxt, note);
      const startCoord = { x: stemX(firstNote), staffPosition: firstNote.staffPosition + 4 };
      const endCoord = { x: stemX(lastNote), staffPosition: lastNote.staffPosition + 4 };
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
          getStaffPositionForX(stemX(note))
        );
        stem.bounds.x = stemX(note) + (note.bounds.width / 2) - (stem.bounds.width / 2);
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

    start.setGlyph(this.ctxt, porrectusGlyph(start, end));
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
  /** whether it's fused to the neume before it (gabc @), as Gabc.createFusedNeumes() makes it */
  fusedToPrevious?: boolean;

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
    var bracketWidth = this.layoutLeftBracket(ctxt);
    // (where a right bracket goes, unless a mora goes further)
    var rightBracketX = this.bounds.right();
    this.ledgerLines = this.drawnLedgerLines(ctxt);

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
        rightBracketX = Math.max(rightBracketX, note.morae[j].bounds.right());
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

      // (which is drawn only when there's a NABC font to draw it with)
      if (note.choralNabc) {
        note.choralNabc.performLayout(ctxt);
        if (note.choralNabc.neumes) this.addVisualizer(note.choralNabc);
      }

      // braces are handled by the chant line, so we don't mess with them here
      // this is because brace size depends on chant line logic (neume spacing,
      // justification, etc.) so they are considered chant line level
      // markings rather than note level markings
    }

    this.layoutRightBracket(ctxt, rightBracketX);

    this.origin.x = this.notes[0].origin.x + bracketWidth;
    this.origin.y = this.notes[0].origin.y;

    super.finishLayout(ctxt);
  }

  // Gregorio's brackets (gabc [[ and ]]): one at the left of the first note
  // if it starts brackets, which moves the notes to the right to make room for
  // it.  Returns its width, if there is one.
  layoutLeftBracket(ctxt: ChantContext) {
    var ranges = this.notes[0].bracketRanges;
    if (!ranges || !ranges.start) return 0;

    var bracket = new NoteBracket(ctxt, false, ranges.start.low, ranges.start.high);
    var width = bracket.bounds.width;
    for (var i = 0; i < this.visualizers.length; i++) this.visualizers[i].bounds.x += width;
    this.bounds.x += width;
    this.addVisualizer(bracket);
    return width;
  }

  // and one at x, after the last note and its morae, if the note ends them
  layoutRightBracket(ctxt: ChantContext, x: number) {
    var ranges = this.notes[this.notes.length - 1].bracketRanges;
    if (!ranges || !ranges.end) return;

    var bracket = new NoteBracket(ctxt, true, ranges.end.low, ranges.end.high);
    bracket.bounds.x = x;
    this.addVisualizer(bracket);
  }

  // the ledger lines that the neume's notes have (see determineLedgerLines()):
  // one at each such note, but under the stroke of a porrectus, where
  // either of its notes has one, a line under the whole stroke.  As
  // Gregorio's write_additional_line() (src/gregoriotex/gregoriotex-write.c)
  // draws them, a line at the stroke's lower note is left out where its
  // upper note is on or beyond a ledger line, and so is one at the note after
  // the stroke where the stroke has the line: below the staff, or above it
  // where the stroke's lower note is on or above the ledger line.  A clivis
  // drawn as a stroke (gabc [shape:stroke]) is a flexus to Gregorio, whose
  // lines go under the ends of the stroke where its notes are.
  drawnLedgerLines(ctxt: ChantContext) {
    var result: NeumeLedgerLine[] = [];
    var notes = this.notes || [];
    var isStroke = (note: Note | undefined) => !!note && !!note.glyphVisualizer && !!note.glyphVisualizer.porrectusNoteDiff;
    var isInsideStaff = (note: Note) =>
      note.staffPosition > ledgerLinePosition(ctxt, false) && note.staffPosition < ledgerLinePosition(ctxt, true);

    notes.forEach((note, i) => {
      for (let isAbove of [true, false]) {
        if (!hasDrawnLedgerLine(note, isAbove)) continue;
        let staffPosition = ledgerLinePosition(ctxt, isAbove);
        let line: NeumeLedgerLine = { element: note, endElem: note, staffPosition };
        let punctumWidth = ctxt.glyphPunctumWidth * ctxt.glyphScaling;
        if (isStroke(note) && this.isClivisStroke(i)) {
          line.x1 = note.bounds.x;
          line.x2 = note.bounds.x + punctumWidth;
        } else if (isStroke(notes[i - 1]) && this.isClivisStroke(i - 1)) {
          line.x2 = notes[i - 1].bounds.right();
          line.x1 = line.x2 - punctumWidth;
        } else if (isStroke(notes[i - 1])) {
          // the stroke's lower note: the line goes under the stroke
          let upper = notes[i - 1];
          if (!isInsideStaff(upper) || hasDrawnLedgerLine(upper, isAbove)) continue;
          line.element = line.endElem = upper;
        } else if (isStroke(notes[i - 2]) && !this.isClivisStroke(i - 2)) {
          if (!isAbove || notes[i - 1].staffPosition >= staffPosition) continue;
        }
        result.push(line);
      }
    });
    return result;
  }

  // whether the stroke from the note at index is a clivis drawn as a stroke,
  // rather than a porrectus's: the stroke of the neume's last two notes
  isClivisStroke(index: number) {
    return index === this.notes.length - 2;
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
    if (note.choralNabc) note.choralNabc.positionHint = position;
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
    if (note.shape === NoteShape.Stropha)
      // (a stropha aucta for gabc s< or s>)
      return note.liquescent & (LiquescentType.Ascending | LiquescentType.Descending)
        ? GlyphCode.StrophaLiquescent
        : GlyphCode.Stropha;

    // (noteAt() draws a cavum hollow)
    return auctusHead(note, GlyphCode.PunctumQuadratum);
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

    // Gregorio's [shape:stroke] hint on the lower note draws a clivis as the
    // stroke a porrectus starts with, with its stem
    if (hasStrokeHint(upper, lower))
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
      if (glyphCode === GlyphCode.Stropha || glyphCode === GlyphCode.StrophaLiquescent)
        glyphAdvance -= ctxt.intraNeumeSpacing / 4;
    });

    this.build(ctxt)
      .noteAt(this.notes[0], glyphCodes[0])
      .advanceBy(glyphAdvance)
      .noteAt(this.notes[1], glyphCodes[1]);

    this.finishLayout(ctxt);
  }
}

/** the glyphs that Gregorio fuses (gabc @ and @[…]) into a FusedNeume */
export const FusedGlyphKind = {
  /** one note: a punctum, oriscus, oriscus scapus or quilisma, or a liquescent */
  Punctum: "punctum",
  Flexus: "flexus",
  Pes: "pes",
  Porrectus: "porrectus",
  Virga: "virga",
  VirgaReversa: "virgaReversa"
} as const;
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

// a note's gabc pitch as a staff position, without the nudge that a note can
// have under a Chi-Rho clef
export function gabcStaffPosition(note: Note) {
  return note.staffPosition - (note.staffPositionOffset || 0);
}

// whether a note has an episema above it (Gregorio's h_episema_above)
function hasEpisemaAbove(note: Note) {
  return note.episemata.some((episema) => episema.positionHint === MarkingPositionHint.Above);
}

/*
 * FusedNeume
 *
 * Gregorio's neume fusion (gabc @ and @[…]): glyphs drawn one after another
 * with no space between them, each joined to the one before it where Gregorio
 * joins them.  Joined notes more than a step apart get a line between them,
 * and a flexus joined to a higher note after it is drawn as a porrectus's
 * stroke.  A fused flexus or porrectus has no stem on its left, nor a fused
 * oriscus scapus its stem.
 */
export class FusedNeume extends Neume {
  glyphs: FusedGlyph[];
  /** whether the neume after it is fused to it (a fused glyph that Gregorio doesn't join, say) */
  fusedToNext: boolean;
  /** whether it's fused to the neume before it (a torculus, say) */
  fusedToPrevious: boolean;

  constructor(glyphs: FusedGlyph[] = []) {
    var notes: Note[] = [];
    for (var i = 0; i < glyphs.length; i++) notes.push(...glyphs[i].notes);
    super(notes);

    this.glyphs = glyphs;
    this.fusedToNext = false;
    this.fusedToPrevious = false;
  }

  // a flexus drawn as a stroke is a porrectus's where a higher note is fused
  // to it, and else a clivis's (see withFlexus())
  isClivisStroke(index: number) {
    var note = this.notes[index];
    var i = this.glyphs.findIndex((glyph) => glyph.notes[0] === note);
    return (
      i >= 0 &&
      this.glyphs[i].kind === FusedGlyphKind.Flexus &&
      FusedNeume.fusedShift(this.glyphs, i + 1, this.fusedToNext) <= 0
    );
  }

  // the interval up from the glyph before to the glyph at index, if Gregorio
  // fuses them, or else 0 (compute_fused_shift() in gregoriotex-position.c).
  // fusedToNext is whether a glyph after the last is fused to it.
  static fusedShift(glyphs: FusedGlyph[], index: number, fusedToNext = false) {
    var glyph = glyphs[index];
    var previous = glyphs[index - 1];
    if (!glyph || !previous || !glyph.fused) return 0;

    var first = glyph.notes[0];
    var last = previous.notes[previous.notes.length - 1];
    var nextIsFused = index + 1 < glyphs.length ? glyphs[index + 1].fused : fusedToNext;

    // a liquescent ends the fused shape
    if (last.liquescent & ~LiquescentType.InitioDebilis) return 0;

    // a pes or porrectus can only end it, and a virga reversa only start it
    switch (glyph.kind) {
      case FusedGlyphKind.Pes:
      case FusedGlyphKind.Porrectus:
        if (nextIsFused) return 0;
        break;
      case FusedGlyphKind.VirgaReversa:
        return 0;
    }

    // a quilisma (or quilisma quadratum) isn't fused to the glyph before it,
    // and only a punctum, flexus or virga reversa is fused to the glyph after it
    if (first.shape === NoteShape.Quilisma || first.quilismaQuadratum) return 0;
    switch (previous.kind) {
      case FusedGlyphKind.Punctum:
      case FusedGlyphKind.Flexus:
      case FusedGlyphKind.VirgaReversa:
        break;
      default:
        return 0;
    }

    var shift = gabcStaffPosition(first) - gabcStaffPosition(last);
    // (Gregorio has no fused glyphs that span more than a sixth)
    if (Math.abs(shift) > 5) return 0;
    if (shift > 0 && previous.kind === FusedGlyphKind.VirgaReversa) return 0;
    if (shift < 0) {
      // a pes can be fused to a higher note if it's a pes deminutus or quassus
      if (glyph.kind === FusedGlyphKind.Pes)
        return (glyph.notes[1].liquescent & LiquescentType.Small) ||
          first.shape === NoteShape.Oriscus
          ? shift
          : 0;
      // a flexus drawn as a porrectus's stroke, a porrectus and an initio
      // debilis can't be fused to a higher note
      if (
        (nextIsFused && glyph.kind === FusedGlyphKind.Flexus) ||
        glyph.kind === FusedGlyphKind.Porrectus ||
        (previous.kind === FusedGlyphKind.Punctum &&
          previous.notes[0].liquescent === LiquescentType.InitioDebilis)
      )
        return 0;
    }
    return shift;
  }

  // whether the glyph at index is drawn joined to the glyph before.  Gregorio's
  // glyphs that are fused to the next one join a flexus to a higher note only
  // (with a porrectus's stroke), and a quilisma to a higher note only
  static joinsPrevious(glyphs: FusedGlyph[], index: number, fusedToNext = false) {
    var shift = FusedNeume.fusedShift(glyphs, index, fusedToNext);
    if (shift > 0) return true;
    if (shift === 0) return false;
    var previous = glyphs[index - 1];
    return (
      previous.kind !== FusedGlyphKind.Flexus &&
      previous.notes[0].shape !== NoteShape.Quilisma &&
      !previous.notes[0].quilismaQuadratum
    );
  }

  positionMarkings() {
    var glyphs = this.glyphs;

    // (from the last glyph, since a glyph's episemata can go by the next's)
    for (var i = glyphs.length - 1; i >= 0; i--) {
      var notes = glyphs[i].notes;
      var next = glyphs[i + 1];

      switch (glyphs[i].kind) {
        case FusedGlyphKind.Punctum:
          // a note fused to a higher one, from a higher one or from no glyph
          // (Gregorio's first of an element), has its episema below, as a
          // pes's lower note has, unless the note after it has one above
          if (
            (i === 0
              ? !this.fusedToPrevious
              : FusedNeume.fusedShift(glyphs, i, this.fusedToNext) < 0) &&
            FusedNeume.fusedShift(glyphs, i + 1, this.fusedToNext) > 0
          )
            this.positionEpisemata(
              notes[0],
              hasEpisemaAbove(next.notes[0])
                ? MarkingPositionHint.Above
                : MarkingPositionHint.Below
            );
          else this.positionEpisemataAbove(notes[0]);
          break;
        case FusedGlyphKind.Flexus:
          // a porrectus's stroke has an episema above on its lower note if
          // the note after it has one above
          if (
            FusedNeume.joinsPrevious(glyphs, i + 1, this.fusedToNext) &&
            hasEpisemaAbove(next.notes[0])
          )
            this.positionEpisemataAbove(notes[1]);
          this.positionClivisMarkings(notes[0], notes[1]);
          break;
        case FusedGlyphKind.Pes:
          this.positionPodatusMarkings(notes[0], notes[1]);
          break;
        case FusedGlyphKind.Porrectus:
          this.positionPorrectusMarkings(notes[0], notes[1], notes[2]);
          break;
        default:
          this.positionEpisemataAbove(notes[0]);
          break;
      }
    }
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    var builder = this.build(ctxt);
    var glyphs = this.glyphs;

    for (var i = 0; i < glyphs.length; i++) {
      var glyph = glyphs[i];
      var notes = glyph.notes;

      // a glyph that isn't joined to the one before follows it with no space
      if (!FusedNeume.joinsPrevious(glyphs, i, this.fusedToNext)) builder.lastNote = null;

      switch (glyph.kind) {
        case FusedGlyphKind.Punctum:
          // (a linea (gabc =) is never fused, but a note can be fused to it)
          if (notes[0].linea) builder.lineaAt(notes[0]);
          else if (!glyph.fused && notes[0].shape === NoteShape.Oriscus)
            builder.oriscusAt(
              notes[0],
              this.getNoteGlyphCode(ctxt, notes[0]),
              true,
              FusedNeume.fusedShift(glyphs, i + 1, this.fusedToNext)
            );
          else builder.noteAt(notes[0], this.getNoteGlyphCode(ctxt, notes[0]), true, false);
          break;
        case FusedGlyphKind.Virga:
          builder.virgaAt(notes[0]);
          // (the stem is inside the punctum, where virgaAt() leaves the next note)
          builder.x = notes[0].bounds.right();
          break;
        case FusedGlyphKind.VirgaReversa: {
          builder.noteAt(notes[0], GlyphCode.PunctumQuadratum);
          var stem = new VirgaLineVisualizer(ctxt, notes[0], FusedNeume.fusedShift(glyphs, i + 1, this.fusedToNext));
          stem.bounds.x = notes[0].bounds.x;
          this.addVisualizer(stem);
          break;
        }
        case FusedGlyphKind.Flexus:
          this.withFlexus(builder, glyph, FusedNeume.fusedShift(glyphs, i + 1, this.fusedToNext));
          break;
        case FusedGlyphKind.Pes:
          this.withPes(builder, notes[0], notes[1]);
          break;
        case FusedGlyphKind.Porrectus:
          if (!glyph.fused) builder.lineFrom(notes[1]);
          builder
            .withPorrectusSwash(notes[0], notes[1])
            .noteAt(notes[2], porrectusThirdGlyph(notes[1], notes[2]));
          break;
      }
    }

    this.finishLayout(ctxt);
  }

  // a flexus, with a stem on its left unless it's fused, or the stroke of a
  // porrectus if it's joined to a higher note after it (shiftToNext > 0), or
  // has Gregorio's [shape:stroke] hint and isn't fused to a note after it
  withFlexus(builder: NeumeBuilder, glyph: FusedGlyph, shiftToNext: number) {
    var upper = glyph.notes[0];
    var lower = glyph.notes[1];

    // (Gregorio has no porrectus's stroke from an oriscus)
    if (
      (shiftToNext > 0 && upper.shape !== NoteShape.Oriscus) ||
      (shiftToNext === 0 && hasStrokeHint(upper, lower))
    ) {
      if (!glyph.fused) builder.lineFrom(lower);
      builder.withPorrectusSwash(upper, lower);
      return;
    }

    if (!glyph.fused) builder.withClivisUpper(upper, lower);
    else if (upper.shape === NoteShape.Oriscus)
      builder.noteAt(upper, Oriscus.getGlyphCode(upper, false), true, false);
    else
      builder.noteAt(
        upper,
        lower.liquescent & LiquescentType.Small
          ? GlyphCode.BeginningDesLiquescent
          : GlyphCode.PunctumQuadratum
      );
    builder.withClivisLower(lower);
  }

  // a pes, or a pes quassus, drawn as PesQuassus draws it
  withPes(builder: NeumeBuilder, lower: Note, upper: Note) {
    if (lower.shape !== NoteShape.Oriscus) builder.withPodatus(lower, upper);
    else builder.withPesQuassus(lower, upper);
    builder.lastNote = null;
  }

  // the glyph of a one-note glyph: as a punctum's (see Punctum), or an
  // oriscus that points to the next note that isn't at the unison
  getNoteGlyphCode(ctxt: ChantContext, note: Note) {
    if (note.shape === NoteShape.Oriscus && note.liquescent === LiquescentType.None) {
      var position = this.nextPositionInNeume(note);
      if (position === null) return Oriscus.getLastNoteGlyphCode(ctxt, note);
      return Oriscus.getGlyphCode(note, position > gabcStaffPosition(note));
    }

    return punctumGlyphCode(note);
  }

  // the staff position of the first note after this one in the neume that
  // isn't at the unison, or null if there's none
  nextPositionInNeume(note: Note) {
    var position = gabcStaffPosition(note);
    for (var i = this.notes.indexOf(note) + 1; i < this.notes.length; i++) {
      var nextPosition = gabcStaffPosition(this.notes[i]);
      if (nextPosition !== position) return nextPosition;
    }
    return null;
  }

  resetDependencies() {
    // an oriscus that points past the neume points to the neumes after it
    for (var note of this.notes) {
      if (
        note.shape === NoteShape.Oriscus &&
        Oriscus.pointsToNextNeume(note) &&
        this.nextPositionInNeume(note) === null
      )
        this.needsLayout = true;
    }
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

    this.build(ctxt).withPesQuassus(this.notes[0], this.notes[1]);

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

    this.build(ctxt)
      .lineFrom(second)
      .withPorrectusSwash(first, second)
      .noteAt(third, porrectusThirdGlyph(second, third));

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

    if (note.linea) {
      this.build(ctxt).lineaAt(note);
      this.finishLayout(ctxt);
      return;
    }

    this.build(ctxt).noteAt(note, punctumGlyphCode(note));

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
      .noteAt(fourth, fourthGlyph);

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
      glyphCodes[0] === GlyphCode.Stropha || glyphCodes[0] === GlyphCode.StrophaLiquescent
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
