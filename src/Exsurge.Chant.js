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

import { ChantLine } from "./Exsurge.Chant.ChantLine.js";
import { InsertionCursor } from "./Exsurge.Chant.Signs.js";
import { Pitch, Rect, Step } from "./Exsurge.Core.js";
import {
  Annotation, ChantLayoutElement,
  ChantNotationElement,
  GlyphCode,
  GlyphVisualizer, QuickSvg, TextLeftRight,
  TextSpan
} from "./Exsurge.Drawing.js";
import { Gabc } from "./Exsurge.Gabc.js";
import { Titles } from "./Exsurge.Titles.js";

export var LiquescentType = {
  None: 0,

  // flags that can be combined, though of course it
  // it doesn't make sense to combine some!
  Large: 1 << 0,
  Small: 1 << 1,
  Ascending: 1 << 2,
  Descending: 1 << 3,
  InitioDebilis: 1 << 4,

  // handy liquescent types
  LargeAscending: (1 << 0) | (1 << 2),
  LargeDescending: (1 << 0) | (1 << 3),
  SmallAscending: (1 << 1) | (1 << 2),
  SmallDescending: (1 << 1) | (1 << 3)
};

export var NoteShape = {
  // shapes
  Default: 0,
  Virga: 1,
  Inclinatum: 2,
  Quilisma: 3,
  Stropha: 4,
  Oriscus: 5
};

export var NoteShapeModifiers = {
  // flags which modify the shape
  // not all of them apply to every shape of course
  None: 0,
  Ascending: 1 << 0,
  Descending: 1 << 1,
  Cavum: 1 << 2,
  Stemmed: 1 << 3,
  Linea: 1 << 4,
  Reverse: 1 << 5
};

/**
 * @class
 */
export class Note extends ChantLayoutElement {
  /**
   * @para {Pitch} pitch
   */
  constructor(pitch) {
    super();

    if (typeof pitch !== "undefined") this.pitch = pitch;
    else this.pitch = null;

    this.glyphVisualizer = null;

    // The staffPosition on a note is an integer that indicates the vertical position on the staff.
    // 0 is the space just below the lowest line on the staff (equivalent to gabc 'c'). Positive numbers go up
    // the staff, and negative numbers go down, i.e., 1 is gabc 'd', 2 is gabc 'e', -1 is gabc 'b', etc.
    this.staffPosition = 4;
    this.liquescent = LiquescentType.None;
    this.shape = NoteShape.Default;
    this.shapeModifiers = NoteShapeModifiers.None;

    // notes keep track of the neume they belong to in order to facilitate layout
    // this.neume gets set when a note is added to a neume via Neume.addNote()
    this.neume = null;

    // various markings that can exist on a note, organized by type
    // for faster access and simpler code logic
    this.episemata = [];
    this.morae = []; // silly to have an array of these, but gabc allows multiple morae per note!

    // these are set on the note when they are needed, otherwise, they're undefined
    // this.ictus
    // this.accuteAccent
    // this.braceStart
    // this.braceEnd
  }

  setGlyph(ctxt, glyphCode) {
    if (this.glyphVisualizer) this.glyphVisualizer.setGlyph(ctxt, glyphCode);
    else this.glyphVisualizer = new GlyphVisualizer(ctxt, glyphCode);

    this.glyphVisualizer.setStaffPosition(ctxt, this.staffPosition);

    // assign glyphvisualizer metrics to this note
    this.bounds.x = this.glyphVisualizer.bounds.x;
    this.bounds.y = this.glyphVisualizer.bounds.y;
    this.bounds.width = this.glyphVisualizer.bounds.width;
    this.bounds.height = this.glyphVisualizer.bounds.height;

    this.origin.x = this.glyphVisualizer.origin.x;
    this.origin.y = this.glyphVisualizer.origin.y;
  }

  // a utility function for modifiers
  shapeModifierMatches(shapeModifier) {
    if (shapeModifier === NoteShapeModifiers.None)
      return this.shapeModifier === NoteShapeModifiers.None;
    else return this.shapeModifier & (shapeModifier !== 0);
  }

  draw(ctxt) {
    this.glyphVisualizer.bounds.x = this.bounds.x;
    this.glyphVisualizer.bounds.y = this.bounds.y;

    this.glyphVisualizer.draw(ctxt);
  }

  createSvgNode(ctxt) {
    this.glyphVisualizer.bounds.x = this.bounds.x;
    this.glyphVisualizer.bounds.y = this.bounds.y;
    this.svgNode = this.glyphVisualizer.createSvgNode(ctxt, this);
    return this.svgNode;
  }
  createSvgTree(ctxt) {
    this.glyphVisualizer.bounds.x = this.bounds.x;
    this.glyphVisualizer.bounds.y = this.bounds.y;
    return this.glyphVisualizer.createSvgTree(ctxt, this);
  }

  createSvgFragment(ctxt) {
    this.glyphVisualizer.bounds.x = this.bounds.x;
    this.glyphVisualizer.bounds.y = this.bounds.y;
    return this.glyphVisualizer.createSvgFragment(ctxt, this);
  }
}

export class Clef extends ChantNotationElement {
  constructor(staffPosition, octave, defaultAccidental = null) {
    super();

    this.isClef = true;
    this.staffPosition = staffPosition;
    this.octave = octave;
    this.defaultAccidental = defaultAccidental;
    this.activeAccidental = defaultAccidental;
    this.keepWithNext = true;
  }

  resetAccidentals() {
    this.activeAccidental = this.defaultAccidental;
  }

  pitchToStaffPosition(pitch) {}

  performLayout(ctxt) {
    ctxt.activeClef = this;

    if (this.defaultAccidental) this.defaultAccidental.performLayout(ctxt);

    super.performLayout(ctxt);
  }

  finishLayout(ctxt) {
    // if we have a default accidental, then add a glyph for it now
    if (this.defaultAccidental) {
      var accidentalGlyph = this.defaultAccidental.createGlyphVisualizer(ctxt);
      accidentalGlyph.bounds.x +=
        this.visualizers[0].bounds.right() + ctxt.intraNeumeSpacing;
      this.addVisualizer(accidentalGlyph);
    }

    super.finishLayout(ctxt);
  }

  static default() {
    return __defaultDoClef;
  }

  clone() {
    if (this.model) return this.model.clone();
    let clone = new this.constructor(
      this.staffPosition,
      this.octave,
      this.defaultAccidental
    );
    clone.small = this.small;
    clone.sourceGabc = this.sourceGabc;
    clone.sourceIndex = this.sourceIndex;
    clone.elementIndex = this.elementIndex;
    clone.model = this;
    return clone;
  }
}

export class DoClef extends Clef {
  constructor(staffPosition, octave, defaultAccidental = null) {
    super(staffPosition, octave, defaultAccidental);

    this.leadingSpace = 0;
  }

  pitchToStaffPosition(pitch) {
    return (
      (pitch.octave - this.octave) * 7 +
      this.staffPosition +
      Pitch.stepToStaffOffset(pitch.step) -
      Pitch.stepToStaffOffset(Step.Do)
    );
  }

  staffPositionToPitch(staffPosition) {
    var offset = staffPosition - this.staffPosition;
    var octaveOffset = Math.floor(offset / 7);

    var step = Pitch.staffOffsetToStep(offset);

    if (
      this.activeAccidental &&
      this.activeAccidental.staffPosition === staffPosition
    )
      step += this.activeAccidental.accidentalType;

    return new Pitch(step, this.octave + octaveOffset);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var glyph = new GlyphVisualizer(ctxt, GlyphCode.DoClef);
    glyph.setStaffPosition(ctxt, this.staffPosition);
    this.addVisualizer(glyph);

    this.finishLayout(ctxt);
  }
}

var __defaultDoClef = new DoClef(7, 2);

export class FaClef extends Clef {
  constructor(staffPosition, octave, defaultAccidental = null) {
    super(staffPosition, octave, defaultAccidental);

    this.leadingSpace = 0;
  }

  pitchToStaffPosition(pitch) {
    return (
      (pitch.octave - this.octave) * 7 +
      this.staffPosition +
      Pitch.stepToStaffOffset(pitch.step) -
      Pitch.stepToStaffOffset(Step.Fa)
    );
  }

  staffPositionToPitch(staffPosition) {
    var offset = staffPosition - this.staffPosition + 3; // + 3 because it's a fa clef (3 == offset from Do)
    var octaveOffset = Math.floor(offset / 7);

    var step = Pitch.staffOffsetToStep(offset);

    if (
      this.activeAccidental &&
      this.activeAccidental.staffPosition === staffPosition
    )
      step += this.activeAccidental.accidentalType;

    return new Pitch(step, this.octave + octaveOffset);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var glyph = new GlyphVisualizer(ctxt, GlyphCode.FaClef);
    glyph.setStaffPosition(ctxt, this.staffPosition);
    this.addVisualizer(glyph);

    this.finishLayout(ctxt);
  }
}

export class TrebleClef extends Clef {
  constructor(staffPosition, octave, defaultAccidental = null, small = false) {
    super(staffPosition, octave, defaultAccidental);

    this.leadingSpace = 0;
    this.small = small;
  }

  pitchToStaffPosition(pitch) {
    return (
      (pitch.octave - this.octave) * 7 +
      this.staffPosition +
      Pitch.stepToStaffOffset(pitch.step) -
      Pitch.stepToStaffOffset(Step.So)
    );
  }

  staffPositionToPitch(staffPosition) {
    var offset = staffPosition - this.staffPosition + 4; // + 4 because it's a sol clef (4 == offset from Do)
    var octaveOffset = Math.floor(offset / 7);

    var step = Pitch.staffOffsetToStep(offset);

    if (
      this.activeAccidental &&
      this.activeAccidental.staffPosition === staffPosition
    )
      step += this.activeAccidental.accidentalType;

    return new Pitch(step, this.octave + octaveOffset);
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    var glyph = new GlyphVisualizer(ctxt, this.small ? GlyphCode.TrebleClefSmall : GlyphCode.TrebleClef);
    glyph.setStaffPosition(ctxt, this.staffPosition);
    this.addVisualizer(glyph);

    this.finishLayout(ctxt);
  }
}

/*
 * TextOnly
 */
export class TextOnly extends ChantNotationElement {
  constructor(sourceIndex, sourceLength) {
    super();
    this.sourceIndex = sourceIndex;
    this.sourceLength = sourceLength;
    this.sourceGabc = "";
    this.trailingSpace = 0;
  }

  performLayout(ctxt) {
    super.performLayout(ctxt);

    // add an empty glyph as a placeholder
    this.addVisualizer(new GlyphVisualizer(ctxt, GlyphCode.None));

    this.origin.x = 0;
    this.origin.y = -ctxt.staffInterval;

    this.finishLayout(ctxt);
  }
}

export class ChantLineBreak extends ChantNotationElement {
  constructor(justify) {
    super();
    this.calculatedTrailingSpace = this.trailingSpace = 0;
    this.justify = justify;
  }

  performLayout(ctxt) {
    // reset the bounds before doing a layout
    this.bounds = new Rect(0, 0, 0, 0);
  }

  clone() {
    var lb = new ChantLineBreak();
    lb.justify = this.justify;

    return lb;
  }
}

// a chant mapping is a lightweight format independent way of
// tracking how a chant language (e.g., gabc) has been
// mapped to exsurge notations.
export class ChantMapping {
  // source can be any object type. in the case of gabc, source is a text
  // string that maps to a gabc word (e.g.: "no(g)bis(fg)").
  // notations is an array of ChantNotationElements
  constructor(source, notations, sourceIndex) {
    this.source = source;
    this.notations = notations;
    this.sourceIndex = sourceIndex;
  }
}

/*
 * Score, document
 */
export class ChantScore {
  // mappings is an array of ChantMappings.
  constructor(ctxt, mappings = [], useDropCap) {
    this.mappings = mappings;

    this.lines = [];
    this.notes = [];
    this.staffLineCount = 4;
    if (ctxt) this.titles = new Titles(ctxt, this);

    this.startingClef = null;

    this.useDropCap = useDropCap;
    this.dropCap = null;

    this.annotation = null;

    this.compiled = false;

    this.autoColoring = true;
    this.needsLayout = true;

    // valid after chant lines are created...
    this.bounds = new Rect();

    if (ctxt) this.updateNotations(ctxt);
  }

  /**
   * Make a copy of the score, only including the specified lines
   * @param  {number} startLine starting index
   * @param  {number} endLine   ending index
   * @return {ChantScore}           the partial score
   */
  copyLines(startLine, endLine) {
    let result = new ChantScore();
    result.lines = this.lines.slice(startLine, endLine);
    result.bounds = this.bounds.clone();
    let lastLine = result.lines.slice(-1)[0];
    result.bounds.height = lastLine.bounds.bottom() - lastLine.origin.y;
    if (startLine === 0) {
      result.titles = this.titles;
      result.dropCap = this.dropCap;
      result.annotation = this.annotation;
    }
    return result;
  }

  updateSelection(selection) {
    this.selection = selection;
    const elementSelection = (selection && selection.element) || {
      indices: []
    };
    const selectedIndices = elementSelection.indices;
    let insertion = elementSelection.insertion;
    if (
      !insertion &&
      selectedIndices.length === 1 &&
      this.notes[selectedIndices[0]] instanceof TextOnly
    ) {
      // if there is only one selection, and its a text only, it should display as an insertion cursor:
      insertion = { afterElementIndex: selectedIndices[0] };
    }
    // update the selected elements so that they can be given a .selected class when rendered
    for (let i = 0; i < this.notes.length; ++i) {
      let element = this.notes[i];
      element.selected = selectedIndices.includes(i);
    }
    (
      this.startingClef.model || this.startingClef
    ).selected = selectedIndices.includes(-1);
    for (let i = 0; i < this.lines.length; ++i) {
      this.lines[i].insertionCursor = null;
    }
    // update the insertion cursor, so it can be drawn on the correct system
    this.insertionElement = null;
    let insertionLine = null;
    if (insertion) {
      if (typeof insertion.chantLine === "number") {
        insertionLine = this.lines[insertion.chantLine];
        this.insertionElement = insertionLine.startingClef;
        insertionLine.insertionCursor = new InsertionCursor();
      } else if (typeof insertion.afterElementIndex === "number") {
        this.insertionElement = this.notes[insertion.afterElementIndex];
        if (!this.insertionElement) {
          insertionLine = this.lines[0];
          this.insertionElement = insertionLine.startingClef;
        } else if (this.insertionElement.neume) {
          this.insertionElement = this.insertionElement.neume;
        }
        if (!insertionLine) {
          insertionLine = this.insertionElement.line || this.lines[this.lines.length - 1];
        }
        insertionLine.insertionCursor = new InsertionCursor();
      }
    }
  }

  updateNotations(ctxt) {
    var i, j, mapping, notation;

    // flatten all mappings into one array for N(0) access to notations
    this.notations = [];
    this.notes = [];
    this.hasLyrics = false;
    this.hasAboveLinesText = false;
    this.hasTranslations = false;
    const elementSelection = (this.selection && this.selection.element) || {
      indices: []
    };
    const selectedIndices = elementSelection.indices;
    let nonNoteElementCount = 0;

    // find the starting clef...
    // start with a default clef in case the notations don't provide one.
    this.startingClef = null;

    for (i = 0; i < this.mappings.length; i++) {
      mapping = this.mappings[i];
      for (j = 0; j < mapping.notations.length; j++) {
        notation = mapping.notations[j];
        notation.score = this;
        notation.mapping = mapping;

        if (!this.startingClef) {
          if (notation.isNeume) {
            this.startingClef = Clef.default();
          } else if (notation.isClef) {
            this.startingClef = notation;
            continue;
          }
        }

        notation.notationIndex = this.notations.push(notation) - 1;
        if (!this.hasLyrics && notation.hasLyrics()) this.hasLyrics = true;
        if (!this.hasAboveLinesText && notation.alText)
          this.hasAboveLinesText = true;
        if (!this.hasTranslations && notation.translationText)
          this.hasTranslations = true;

        // Update this.notes and find element indices:
        let elements = notation.notes || [notation];
        for (let element of elements) {
          let elementIndex = (element.elementIndex =
            this.notes.push(element) - 1);
          if (element instanceof Note) {
            element.noteIndex = elementIndex - nonNoteElementCount;
          } else {
            ++nonNoteElementCount;
          }
          
          element.selected = selectedIndices.includes(elementIndex);
        }
      }
    }

    // if we've reached this far and we *still* don't have a clef, then there aren't even
    // any neumes in the score. still, set the default clef just for good measure
    if (!this.startingClef) this.startingClef = Clef.default();
    this.startingClef.elementIndex = -1;

    // update drop cap
    if (this.useDropCap) this.recreateDropCap(ctxt);
    else this.dropCap = null;

    this.needsLayout = true;
  }

  recreateDropCap(ctxt) {
    this.dropCap = null;

    // find the first notation with lyrics to use
    for (var i = 0; i < this.notations.length; i++) {
      if (
        this.notations[i].hasLyrics() &&
        this.notations[i].lyrics[0] !== null &&
        this.notations[i].lyrics[0].spans &&
        this.notations[i].lyrics[0].spans.length
      ) {
        let notation = this.notations[i],
          lyrics = notation.lyrics[0];
        if (this.useDropCap) {
          this.dropCap = lyrics.generateDropCap(ctxt);
        } else {
          lyrics.dropCap = null;
          lyrics.generateSpansFromText(ctxt, lyrics.originalText);
        }
        notation.needsLayout = true;
        return;
      }
    }
  }

  /**
   * Shared layout initialization method for performLayout() and performLayoutAsync()
   * @param  {ChantContext} ctxt
   */
  initializeLayout(ctxt) {
    // setup the context
    ctxt.activeClef = this.startingClef;
    ctxt.notations = this.notations;
    ctxt.currNotationIndex = 0;
    ctxt.staffLineCount = this.staffLineCount;

    if (this.dropCap) this.dropCap.recalculateMetrics(ctxt);

    if (this.annotation) this.annotation.recalculateMetrics(ctxt);
  }

  // this is the the synchronous version of performLayout that
  // process everything without yielding to any other workers/threads.
  // good for server side processing or very small chant pieces.
  performLayout(ctxt, force) {
    if (!force && this.needsLayout === false) return; // nothing to do here!

    ctxt.updateHyphenWidth();

    this.initializeLayout(ctxt);

    for (let i = 0; i < this.notations.length; i++) {
      let notation = this.notations[i];
      if (force || notation.needsLayout) {
        ctxt.currNotationIndex = i;
        notation.performLayout(ctxt);
      }
    }

    this.needsLayout = false;
  }

  // for web applications, probably performLayoutAsync would be more
  // apppropriate that the above performLayout, since it will process
  // the notations without locking up the UI thread.
  performLayoutAsync(ctxt, finishedCallback) {
    if (this.needsLayout === false) {
      if (finishedCallback) setTimeout(() => finishedCallback(), 0);

      return; // nothing to do here!
    }

    if (ctxt.onFontLoaded) {
      ctxt.onFontLoaded.push(() =>
        this.performLayoutAsync(ctxt, finishedCallback)
      );
      return;
    }

    // check for sane value of hyphen width:
    ctxt.updateHyphenWidth();
    if (
      !ctxt.hyphenWidth ||
      ctxt.hyphenWidth / ctxt.textStyles.lyric.size > 0.6
    ) {
      setTimeout(() => {
        this.performLayoutAsync(ctxt, finishedCallback);
      }, 100);
      return;
    }

    this.initializeLayout(ctxt);

    setTimeout(() => this.layoutElementsAsync(ctxt, 0, finishedCallback), 0);
  }

  layoutElementsAsync(ctxt, index, finishedCallback) {
    if (index >= this.notations.length) {
      this.needsLayout = false;

      if (finishedCallback) setTimeout(() => finishedCallback(), 0);

      return;
    }

    if (index === 0) ctxt.activeClef = this.startingClef;

    var timeout = new Date().getTime() + 50; // process for fifty milliseconds
    do {
      var notation = this.notations[index];
      if (notation.needsLayout) {
        ctxt.currNotationIndex = index;
        notation.performLayout(ctxt);
      }

      index++;
    } while (index < this.notations.length && new Date().getTime() < timeout);

    // schedule the next block of processing
    setTimeout(
      () => this.layoutElementsAsync(ctxt, index, finishedCallback),
      0
    );
  }

  layoutChantLines(ctxt, width, finishedCallback) {
    this.lines = [];

    if (ctxt.mergeAnnotationWithTextLeft && this.annotation && !this.dropCap) {
      let annotation = this.annotation,
        annotationSpans = annotation.annotations
          ? annotation.annotations.map((annotation) => annotation.spans)
          : [annotation.spans];
      this.overrideTextLeft = new TextLeftRight(ctxt, "", "textLeft");
      if (ctxt.mapAnnotationSpansToTextLeft) {
        annotationSpans = annotationSpans.map(ctxt.mapAnnotationSpansToTextLeft);
      }
      this.overrideTextLeft.spans = ctxt.mergeAnnotationWithTextLeft(
        ...annotationSpans,
        this.titles.textLeft && this.titles.textLeft.spans
      );
    } else {
      this.overrideTextLeft = null;
    }

    var y = width > 0 ? this.titles.layoutTitles(ctxt, width) : 0;
    var currIndex = 0;

    ctxt.activeClef = this.startingClef;

    var spaceBetweenSystems = ctxt.staffInterval * ctxt.spaceBetweenSystems;

    do {
      var line = new ChantLine(this);

      line.buildFromChantNotationIndex(ctxt, currIndex, width);
      currIndex = line.notationsStartIndex + line.numNotationsOnLine;
      line.performLayout(ctxt);
      line.elementIndex = this.lines.length;
      this.lines.push(line);

      line.bounds.y = -line.bounds.y + y;
      y += line.bounds.height + spaceBetweenSystems;
    } while (currIndex < this.notations.length);

    var lastLine = this.lines[this.lines.length - 1];

    this.bounds.x = 0;
    this.bounds.y = 0;
    this.bounds.width = lastLine.bounds.width;
    this.bounds.height = y - spaceBetweenSystems;

    this.pages = [this];

    if (this.selection) {
      this.updateSelection(this.selection);
    }

    if (finishedCallback) finishedCallback(this);
  }

  paginate(height) {
    if (!height) return;
    this.pages = [];
    let pageHeightOffset = 0,
      startLineIndex = 0;
    for (let i = 1; i < this.lines.length; ++i) {
      let line = this.lines[i];
      let pageHeight = line.bounds.bottom() - pageHeightOffset - line.origin.y;

      if (pageHeight > height) {
        // this line will be the first on the new page
        this.pages.push(this.copyLines(startLineIndex, i));
        startLineIndex = i;
        pageHeightOffset = line.bounds.y - line.origin.y;
        line.bounds.y = line.origin.y;
      } else {
        // not a new page yet...update the bounds:
        line.bounds.y -= pageHeightOffset;
      }
    }
    this.pages.push(this.copyLines(startLineIndex, this.lines.length));
  }

  draw(ctxt, scale = 1) {
    ctxt.setCanvasSize(this.bounds.width, this.bounds.height, scale);

    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);

    canvasCtxt.translate(this.bounds.x, this.bounds.y);

    if (this.titles) this.titles.draw(ctxt);

    for (var i = 0; i < this.lines.length; i++) this.lines[i].draw(ctxt);

    canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
  }

  getSvgProps(ctxt, zoom) {
    let width =
        typeof zoom === "number"
          ? zoom * this.bounds.width
          : zoom
          ? undefined
          : this.bounds.width,
      height = zoom ? undefined : this.bounds.height;

    return {
      xmlns: QuickSvg.ns,
      "xmlns:xlink": QuickSvg.xlink,
      version: "1.1",
      class: "Exsurge ChantScore" + (ctxt.editable ? " EditableChantScore" : ""),
      width,
      height,
      viewBox: [0, 0, this.bounds.width, this.bounds.height].join(" ")
    };
  }

  createSvgNode(ctxt) {
    // create defs section
    var node = [ctxt.defsNode.cloneNode(true)];
    node[0].appendChild(ctxt.createStyleNode());

    if (this.titles) node.push(this.titles.createSvgNode(ctxt));

    for (var i = 0; i < this.lines.length; i++)
      node.push(this.lines[i].createSvgNode(ctxt));

    node = QuickSvg.createNode("g", {}, node);

    node = QuickSvg.createNode("svg", this.getSvgProps(ctxt), node);

    node.source = this;
    this.svg = node;

    return node;
  }

  createSvgTree(ctxt, zoom) {
    // create defs section
    var node = [
      QuickSvg.createSvgTree(
        "defs",
        {},
        ...ctxt.makeDefs.map((makeDef) => makeDef.makeSvgTree()),
        ctxt.createStyleTree()
      )
    ];

    if (this.titles) node.push(this.titles.createSvgTree(ctxt));

    for (var i = 0; i < this.lines.length; i++)
      node.push(this.lines[i].createSvgTree(ctxt));

    node = QuickSvg.createSvgTree("g", {}, ...node);
    let svgProps = this.getSvgProps(ctxt, zoom);
    svgProps.source = this;
    node = QuickSvg.createSvgTree("svg", svgProps, node);

    return node;
  }

  createSvg(ctxt) {
    var fragment = "";

    // create defs section
    for (var def in ctxt.defs)
      if (ctxt.defs.hasOwnProperty(def)) fragment += ctxt.defs[def];
    fragment += ctxt.createStyle();

    fragment = QuickSvg.createFragment("defs", {}, fragment);

    if (this.titles) fragment += this.titles.createSvgFragment(ctxt);

    for (var i = 0; i < this.lines.length; i++)
      fragment += this.lines[i].createSvgFragment(ctxt);

    fragment = QuickSvg.createFragment("g", {}, fragment);

    fragment = QuickSvg.createFragment("svg", this.getSvgProps(ctxt), fragment);

    return fragment;
  }

  createSvgNodeForEachLine(ctxt) {
    var node = [];

    var top = 0;
    for (var i = 0; i < this.lines.length; i++) {
      var lineFragment = [
        ctxt.defsNode.cloneNode(true),
        this.lines[i].createSvgNode(ctxt, top)
      ];
      lineFragment[0].appendChild(ctxt.createStyleNode());
      var height = this.lines[i].bounds.height + ctxt.staffInterval * 1.5;
      lineFragment = QuickSvg.createNode("g", {}, lineFragment);
      lineFragment = QuickSvg.createNode(
        "svg",
        {
          xmlns: QuickSvg.ns,
          version: "1.1",
          class: "Exsurge ChantScore",
          width: this.bounds.width,
          height: height,
          viewBox: [0, 0, this.bounds.width, height].join(" ")
        },
        lineFragment
      );
      node.push(lineFragment);
      top += height;
    }
    return node;
  }

  createSvgForEachLine(ctxt) {
    var fragment = "",
      fragmentDefs = "";

    // create defs section
    for (var def in ctxt.defs)
      if (ctxt.defs.hasOwnProperty(def)) fragmentDefs += ctxt.defs[def];
    fragmentDefs += ctxt.createStyle();

    fragmentDefs = QuickSvg.createFragment("defs", {}, fragmentDefs);
    var top = 0;
    for (var i = 0; i < this.lines.length; i++) {
      var lineFragment =
        fragmentDefs + this.lines[i].createSvgFragment(ctxt, top);
      var height = this.lines[i].bounds.height + ctxt.staffInterval * 1.5;
      lineFragment = QuickSvg.createFragment("g", {}, lineFragment);
      lineFragment = QuickSvg.createFragment(
        "svg",
        {
          xmlns: QuickSvg.ns,
          version: "1.1",
          "xmlns:xlink": QuickSvg.xlink,
          class: "Exsurge ChantScore",
          width: this.bounds.width,
          height: height
        },
        lineFragment
      );
      fragment += lineFragment;
      top += height;
    }
    return fragment;
  }

  unserializeFromJson(data, ctxt) {
    this.autoColoring = data["auto-coloring"];

    if (data.annotation !== null && data.annotation !== "") {
      // create the annotation
      this.annotation = new Annotation(ctxt, data.annotation);
    } else this.annotation = null;

    var createDropCap = data["drop-cap"] === "auto" ? true : false;

    Gabc.parseChantNotations(data.notations, this, createDropCap);
  }

  serializeToJson() {
    var data = {};

    data["type"] = "score";
    data["auto-coloring"] = true;

    if (this.annotation !== null)
      data.annotation = this.annotation.unsanitizedText;
    else data.annotation = "";

    return data;
  }
}

export class ChantDocument {
  constructor() {
    var defaults = {
      layout: {
        units: "mm",
        "default-font": {
          "font-family": "Crimson",
          "font-size": 14
        },
        page: {
          width: 8.5,
          height: 11,
          "margin-left": 0,
          "margin-top": 0,
          "margin-right": 0,
          "margin-bottom": 0
        }
      },
      scores: []
    };

    // default layout
    this.copyLayout(this, defaults);

    this.scores = defaults.scores;
  }

  copyLayout(to, from) {
    to.layout = {
      units: from.layout.units,
      "default-font": {
        "font-family": from.layout["default-font"]["font-family"],
        "font-size": from.layout["default-font"]["font-size"]
      },
      page: {
        width: from.layout.page.width,
        height: from.layout.page.height,
        "margin-left": from.layout.page["margin-left"],
        "margin-top": from.layout.page["margin-top"],
        "margin-right": from.layout.page["margin-right"],
        "margin-bottom": from.layout.page["margin-bottom"]
      }
    };
  }

  unserializeFromJson(data) {
    this.copyLayout(this, data);

    this.scores = [];

    // read in the scores
    for (var i = 0; i < data.scores.length; i++) {
      var score = new ChantScore();

      score.unserializeFromJson(data.scores[i]);
      this.scores.push(score);
    }
  }

  serializeToJson() {
    var data = {};

    this.copyLayout(data, this);

    data.scores = [];

    // save scores...
    for (var i = 0; i < this.scores.length; i++)
      data.scores.push(this.scores[i].serializeToJson());

    return data;
  }
}
