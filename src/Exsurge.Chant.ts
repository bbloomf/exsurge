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
import {
  isReadUpToDate,
  layoutSettings,
  LineBreaker,
  readFrom,
  type ReadNotations
} from "./Exsurge.Chant.LineBreaking.js";
import { InsertionCursor } from "./Exsurge.Chant.Signs.js";
import { Pitch, Rect, Step } from "./Exsurge.Core.js";
import {
  Annotation, CavumGlyphCode, ChantLayoutElement,
  ChantNotationElement,
  GlyphCode,
  GlyphVisualizer, Lyric, LyricType, newLayoutId, QuickSvg, TextLeftRight,
  TextMeasuringStrategy,
  TextSpan,
  type VerseNumber
} from "./Exsurge.Drawing.js";
import { Gabc } from "./Exsurge.Gabc.js";
import { Titles } from "./Exsurge.Titles.js";
import { determineLedgerLines, type LedgerLineStates } from "./ledgerLines.js";
import type { Accidental } from "./Exsurge.Chant.Signs.js";
import type {
  Accent,
  BracePoint,
  CustomLedgerLine,
  EpisemaTuning,
  HorizontalEpisema,
  Ictus,
  Mora,
  SlurMark
} from "./Exsurge.Chant.Markings.js";
import type { Neume } from "./Exsurge.Chant.Neumes.js";
import type { Language } from "./Exsurge.Text.js";
import type {
  AboveLinesText,
  Annotations,
  AreaBoundary,
  ChantContext,
  ChoralSign,
  NabcChoralSign,
  DropCap,
  SvgAttributes,
  SvgElementWithSource,
  SvgTreeNode
} from "./Exsurge.Drawing.js";

export const LiquescentType = {
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
} as const;
/** LiquescentType flags, combined */
export type LiquescentType = number;

export const NoteShape = {
  // shapes
  Default: 0,
  Virga: 1,
  Inclinatum: 2,
  Quilisma: 3,
  Stropha: 4,
  Oriscus: 5
} as const;
export type NoteShape = (typeof NoteShape)[keyof typeof NoteShape];

/** which way Gregorio's punctum inclinatum leans (gabc G0, G1 and G2) */
export type InclinatumLeaning = "descending" | "ascending" | "unison";

export const NoteShapeModifiers = {
  // flags which modify the shape
  // not all of them apply to every shape of course
  None: 0,
  Ascending: 1 << 0,
  Descending: 1 << 1,
  Cavum: 1 << 2,
  Stemmed: 1 << 3,
  Linea: 1 << 4,
  Reverse: 1 << 5
} as const;
/** NoteShapeModifiers flags, combined */
export type NoteShapeModifiers = number;

/**
 * @class
 */
export class Note extends ChantLayoutElement {
  pitch: Pitch | null;
  glyphVisualizer: GlyphVisualizer | null;
  /**
   * the vertical position of the note on the staff, where 0 is the space
   * below the lowest line (gabc "c")
   */
  staffPosition: number;
  /**
   * a nudge up or down a third of a space, under a Chi-Rho clef (gabc 9 or 0 after a pitch;
   * a note on a space without a 9 is nudged down)
   */
  staffPositionOffset?: number;
  liquescent: LiquescentType;
  shape: NoteShape;
  shapeModifiers: NoteShapeModifiers;
  /** the neume the note is in */
  neume: Neume | null;
  episemata: HorizontalEpisema[];
  morae: Mora[];
  ictus?: Ictus;
  accent?: Accent;
  braceStart?: BracePoint;
  braceEnd?: BracePoint;
  choralSign?: ChoralSign;
  /** Gregorio's NABC choral sign ([cn:…]), drawn where a choral sign goes */
  choralNabc?: NabcChoralSign;
  /** text above the note, which goes to its neume's alText */
  alText?: AboveLinesText;
  /** the number of stems of a punctum inclinatum (gabc |) */
  inclinataFlags?: number;
  /**
   * Gregorio's shape hints for the neume the note ends (gabc [shape:…]), as
   * a list separated by commas.  The one there is, stroke, draws a clivis as
   * the stroke a porrectus starts with.
   */
  shapeHint?: string;
  /**
   * Gregorio's ledger-line hint below the note (gabc [ll:1] or [ll:0]):
   * whether to give its stem the length and place its episemata as if there
   * were a ledger line below it, without drawing one or leaving one out.
   * A stronger setting overrides it (see ledgerLineState).
   */
  lowLedgerLine?: boolean;
  /** the same above the note (gabc [hl:1] or [hl:0]), for its episemata */
  highLedgerLine?: boolean;
  /** leaves out the custos of a line that breaks after the note (gabc [nocustos]) */
  noCustos?: boolean;
  /**
   * leaves out the custos of a line that breaks before the note, after a
   * [nocustos] with no note before it in its notes
   */
  noCustosBefore?: boolean;

  /** Gregorio's square brackets (gabc [[) start at the note (see ChantScore.updateBrackets()) */
  bracketStart?: boolean;
  /** Gregorio's square brackets (gabc ]]) end at the note */
  bracketEnd?: boolean;
  /**
   * the lowest and highest staff positions of the notes in the brackets
   * that start at the note, and in those that end at it, where the neume
   * draws them (see ChantScore.updateBrackets())
   */
  bracketRanges?: { start?: BracketRange; end?: BracketRange };
  /** Gregorio's slurs (gabc [oslur:…] and [uslur:…]) on the note, which the chant line draws */
  slurs?: SlurMark[];
  /**
   * whether Gregorio's [oll:1] or [oll:0] draws a ledger line above the
   * staff at the note, or leaves one out, whatever its pitch and the notes
   * around it (see ledgerLineState)
   */
  ledgerLineAbove?: boolean;
  /** whether Gregorio's [ull:1] or [ull:0] draws a ledger line below the staff at the note, or leaves one out */
  ledgerLineBelow?: boolean;
  /** Gregorio's ledger lines of a given length (gabc [oll:…] and [ull:…]) next to the note, which the chant line draws */
  customLedgerLines?: CustomLedgerLine[];
  /**
   * whether a new one of Gregorio's elements starts at the note, although it
   * isn't the first of its neume, as where Gregorio makes the notes around it
   * into glyphs of their own (see ChantNotationElement.continuesElement)
   */
  startsElement?: boolean;
  /**
   * whether the note has a ledger line above the staff and below it, and how
   * that was set, as Gregorio decides it from the note's pitch, the notes
   * around it and the settings above (see determineLedgerLines())
   */
  ledgerLineState?: LedgerLineStates;
  /**
   * Gregorio's tuning of the episema over the note (gabc [oh:…]) and under
   * it ([uh:…]), the note's own or its block's
   */
  episemaTuning?: { above?: EpisemaTuning; below?: EpisemaTuning };

  // Gregorio's notation read since Phase 1 of docs/gregorio-feature-gap.md,
  // not all of it drawn yet
  /**
   * whether a no-line-break area (<nlba>…</nlba> in the notes) starts at
   * the note after <nlba> or ends at the note before </nlba>.  The note's
   * notation has the same mark in its noLineBreak, and gabc's
   * neume ends at the tag, as it does at a /.
   */
  noLineBreak?: AreaBoundary;
  /** the note is fused to the note before it, or, first in its neume, drawn without a stem (gabc @ before the pitch) */
  fused?: boolean;
  /** whether an automatic fusion (gabc @[…]) starts or ends at the note */
  autoFusion?: AreaBoundary;
  /** a linea (gabc =), a flat bar between two lines, a neume of its own */
  linea?: boolean;
  /** the first note of a pes quadratum (gabc q) */
  quadratum?: boolean;
  /**
   * a quilisma quadratum (gabc W): a quilisma, with a higher note in its pes
   * beside it, joined by a stem, rather than above it
   */
  quilismaQuadratum?: boolean;
  /**
   * the leaning given to a punctum inclinatum (gabc G0, G1 or G2), drawn
   * unless ChantContext.inclinatumLeaning is turned off
   */
  leaning?: InclinatumLeaning;
  /**
   * the leaning that Gregorio gives a punctum inclinatum without one, from
   * the notes around it in its syllable (see Gabc.setAutomaticLeanings()),
   * drawn unless ChantContext.inclinatumLeaning is turned off
   */
  automaticLeaning?: InclinatumLeaning;
  /** where the note is in the gabc source */
  sourceIndex!: number;
  sourceGabc!: string;
  /** the note's index in its score's notes */
  elementIndex?: number;
  /** the note's index among the notes of its score, not counting other notations */
  noteIndex?: number;
  svgNode?: SvgElementWithSource;

  /**
   * @para {Pitch} pitch
   */
  constructor(pitch?: Pitch) {
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

  setGlyph(ctxt: ChantContext, glyphCode: GlyphCode) {
    // (a cavum, gabc r, is drawn with the hollow form of its glyph)
    if (this.shapeModifiers & NoteShapeModifiers.Cavum) glyphCode = CavumGlyphCode[glyphCode] || glyphCode;
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
  shapeModifierMatches(shapeModifier: NoteShapeModifiers) {
    if (shapeModifier === NoteShapeModifiers.None)
      return this.shapeModifiers === NoteShapeModifiers.None;
    else return (this.shapeModifiers & shapeModifier) !== 0;
  }

  draw(ctxt: ChantContext) {
    this.glyphVisualizer!.bounds.x = this.bounds.x;
    this.glyphVisualizer!.bounds.y = this.bounds.y;

    this.glyphVisualizer!.draw(ctxt);
  }

  createSvgNode(ctxt: ChantContext) {
    this.glyphVisualizer!.bounds.x = this.bounds.x;
    this.glyphVisualizer!.bounds.y = this.bounds.y;
    this.svgNode = this.glyphVisualizer!.createSvgNode(ctxt, this);
    return this.svgNode;
  }
  createSvgTree(ctxt: ChantContext) {
    this.glyphVisualizer!.bounds.x = this.bounds.x;
    this.glyphVisualizer!.bounds.y = this.bounds.y;
    return this.glyphVisualizer!.createSvgTree(ctxt, this);
  }

  createSvgFragment(ctxt: ChantContext) {
    this.glyphVisualizer!.bounds.x = this.bounds.x;
    this.glyphVisualizer!.bounds.y = this.bounds.y;
    return this.glyphVisualizer!.createSvgFragment(ctxt, this);
  }
}

// each kind of clef has its own staffPositionToPitch() (this only adds the
// signature, which each subclass implements)
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface Clef {
  staffPositionToPitch(staffPosition: number): Pitch;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Clef extends ChantNotationElement {
  declare isClef: true;
  staffPosition: number;
  octave: number;
  /** the flat of a flat clef (gabc cb) */
  defaultAccidental: Accidental | null;
  activeAccidental: Accidental | null;
  small?: boolean;
  sans?: boolean;
  /** the clef that this clef (at the start of a line) is a copy of */
  model?: Clef;
  /**
   * the second clef of a pair (gabc c1@c4), which is drawn with this one;
   * the pitches follow this one
   */
  secondClef?: Clef;

  constructor(staffPosition: number, octave: number, defaultAccidental: Accidental | null = null) {
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

  // each kind of clef has its own
  pitchToStaffPosition(pitch: Pitch): number {
    return undefined as unknown as number;
  }

  /** the glyph the clef is drawn with (each kind of clef has its own) */
  glyphCode(): GlyphCode {
    return GlyphCode.None;
  }

  performLayout(ctxt: ChantContext) {
    ctxt.activeClef = this;

    // (finishLayout() draws the default accidental's glyph, so it isn't laid out itself)
    super.performLayout(ctxt);

    var glyph = new GlyphVisualizer(ctxt, this.glyphCode());
    glyph.setStaffPosition(ctxt, this.staffPosition);
    this.addVisualizer(glyph);

    this.finishLayout(ctxt);
  }

  /**
   * the pitch of step, octaveOffset octaves from the clef's, as the
   * accidental in effect at staffPosition alters it (for staffPositionToPitch())
   */
  protected pitchAt(step: number, octaveOffset: number, staffPosition: number) {
    if (this.activeAccidental && this.activeAccidental.staffPosition === staffPosition)
      step += this.activeAccidental.accidentalType;

    return new Pitch(step, this.octave + octaveOffset);
  }

  finishLayout(ctxt: ChantContext) {
    // if we have a default accidental, then add a glyph for it now
    if (this.defaultAccidental) {
      var accidentalGlyph = this.defaultAccidental.createGlyphVisualizer(ctxt);
      accidentalGlyph.bounds.x +=
        this.visualizers[0].bounds.right() + ctxt.intraNeumeSpacing;
      this.addVisualizer(accidentalGlyph);
    }

    if (this.secondClef) this.addSecondClef(ctxt);

    super.finishLayout(ctxt);
  }

  // takes the glyphs away after a layout, for ctxt.clefVisibility: an
  // invisible clef has no width, and a phantom one keeps its width
  hide(ctxt: ChantContext) {
    this.visualizers = [];
    if (ctxt.clefVisibility === "invisible") this.bounds.width = 0;
  }

  // adds the glyphs of the second clef, placed as Gregorio places them
  // (gre@boxclef in gregoriotex-signs.tex): clefs two or more lines apart
  // start at the same x, and clefs on the same or neighboring lines go one
  // after the other
  private addSecondClef(ctxt: ChantContext) {
    var secondClef = this.secondClef!;
    secondClef.performLayout(ctxt);
    ctxt.activeClef = this;

    var x =
      Math.abs(secondClef.staffPosition - this.staffPosition) > 2
        ? 0
        : this.bounds.right() + ctxt.intraNeumeSpacing;
    for (var visualizer of secondClef.visualizers) {
      visualizer.bounds.x += x;
      this.addVisualizer(visualizer);
    }
  }

  static default(): Clef {
    return __defaultDoClef;
  }

  clone(): Clef {
    if (this.model) return this.model.clone();
    let clone = new (this.constructor as new (
      staffPosition: number,
      octave: number,
      defaultAccidental: Accidental | null
    ) => Clef)(
      this.staffPosition,
      this.octave,
      this.defaultAccidental
    );
    clone.small = this.small;
    clone.sans = this.sans;
    // (a copy, since laying a clef out lays its second clef out too)
    clone.secondClef = this.secondClef && this.secondClef.clone();
    clone.sourceGabc = this.sourceGabc;
    clone.sourceIndex = this.sourceIndex;
    clone.elementIndex = this.elementIndex;
    clone.model = this;
    return clone;
  }
}

/** a clef on a step of the diatonic scale: a do, fa or sol (treble) clef */
export abstract class DiatonicClef extends Clef {
  /** the step on the clef's line */
  abstract get clefStep(): Step;

  constructor(staffPosition: number, octave: number, defaultAccidental: Accidental | null = null) {
    super(staffPosition, octave, defaultAccidental);

    this.leadingSpace = 0;
  }

  pitchToStaffPosition(pitch: Pitch) {
    return (
      (pitch.octave - this.octave) * 7 +
      this.staffPosition +
      Pitch.stepToStaffOffset(pitch.step) -
      Pitch.stepToStaffOffset(this.clefStep)
    );
  }

  staffPositionToPitch(staffPosition: number) {
    // (from the do below the clef's line)
    var offset = staffPosition - this.staffPosition + Pitch.stepToStaffOffset(this.clefStep);
    return this.pitchAt(Pitch.staffOffsetToStep(offset), Math.floor(offset / 7), staffPosition);
  }
}

export class DoClef extends DiatonicClef {
  get clefStep() {
    return Step.Do;
  }

  glyphCode() {
    return GlyphCode.DoClef;
  }
}

var __defaultDoClef = new DoClef(7, 2);

export class FaClef extends DiatonicClef {
  get clefStep() {
    return Step.Fa;
  }

  glyphCode() {
    return GlyphCode.FaClef;
  }
}

export class TrebleClef extends DiatonicClef {
  constructor(
    staffPosition: number,
    octave: number,
    defaultAccidental: Accidental | null = null,
    small = false
  ) {
    super(staffPosition, octave, defaultAccidental);

    this.small = small;
  }

  get clefStep() {
    return Step.So;
  }

  glyphCode() {
    return this.small ? GlyphCode.TrebleClefSmall : GlyphCode.TrebleClef;
  }
}

export class ChiRhoClef extends Clef {
  constructor(
    staffPosition: number,
    octave: number,
    defaultAccidental: Accidental | null = null,
    sans = false
  ) {
    super(staffPosition, octave, defaultAccidental);

    this.leadingSpace = 0;
    this.sans = sans;
  }

  // the pitches of a Chi-Rho clef are chromatic: its line is Do, and each line is a
  // minor third above the one below it. A space holds the two half steps between its
  // lines, the lower at its bottom (gabc 0 after the space, or 9 after the line below)
  // and the upper at its top (9 after the space, or 0 after the line above), so going
  // from a line to the space above it is a half step and a half. The middle of a space
  // is never used: a note on a space with neither 0 nor 9 is at its bottom.
  pitchToStaffPosition(pitch: Pitch) {
    var halfSteps = (pitch.octave - this.octave) * 12 + pitch.step;
    return this.staffPosition + (halfSteps * 2) / 3;
  }

  staffPositionToPitch(staffPosition: number) {
    // the middle of a space (where an accidental is) is rounded down to the bottom of the space
    var halfSteps = Math.ceil(((staffPosition - this.staffPosition) * 3) / 2 - 0.5);
    var octaveOffset = Math.floor(halfSteps / 12);

    return this.pitchAt(halfSteps - octaveOffset * 12, octaveOffset, staffPosition);
  }

  glyphCode() {
    return this.sans ? GlyphCode.ChiRhoClefSans : GlyphCode.ChiRhoClef;
  }
}

/*
 * TextOnly
 */
export class TextOnly extends ChantNotationElement {
  constructor(sourceIndex: number, sourceLength: number) {
    super();
    this.sourceIndex = sourceIndex;
    this.sourceLength = sourceLength;
    this.sourceGabc = "";
    this.trailingSpace = 0;
  }

  performLayout(ctxt: ChantContext) {
    super.performLayout(ctxt);

    // add an empty glyph as a placeholder
    this.addVisualizer(new GlyphVisualizer(ctxt, GlyphCode.None));

    this.origin.x = 0;
    this.origin.y = -ctxt.staffInterval;

    this.finishLayout(ctxt);
  }
}

/**
 * whether a line break ends its line with a custos: "auto" if
 * ChantContext.eolCustos says so (gabc z or Z), "force" to always (z+ or Z+)
 * or "none" to never (z- or Z-)
 */
export type LineBreakCustos = "auto" | "force" | "none";

export class ChantLineBreak extends ChantNotationElement {
  /** whether to justify the line that it ends */
  justify?: boolean;
  custos: LineBreakCustos;

  constructor(justify?: boolean, custos: LineBreakCustos = "auto") {
    super();
    this.calculatedTrailingSpace = this.layoutTrailingSpace = this.trailingSpace = 0;
    this.justify = justify;
    this.custos = custos;
  }

  performLayout(ctxt: ChantContext) {
    // (a layoutId, as any notation's layout gives it, so that the lines that
    // read it are laid out again for it, and it's laid out until it needs to
    // be again, rather than each time the score is: see layoutChantLines())
    this.layoutId = newLayoutId();
    // reset the bounds before doing a layout
    this.bounds = new Rect(0, 0, 0, 0);
    this.needsLayout = false;
  }

  clone() {
    var lb = new ChantLineBreak();
    lb.justify = this.justify;
    lb.custos = this.custos;

    return lb;
  }
}

/**
 * Gregorio's marks after the last notes of a gabc word ([[, <nlba> or @[),
 * which go on the next note, and its controls after its last notes (such as
 * </nlba>), which go on the next syllable's notations
 */
export interface MarksForNext {
  noteMarks: ((note: Note) => void)[];
  areas: { euouae?: AreaBoundary; noLineBreak?: AreaBoundary };
  /** the tunings of Gregorio's blocks of episemata ([oh:…{] … [oh}]) that the next notes are in */
  episemaBlocks?: { above?: EpisemaTuning; below?: EpisemaTuning };
  /**
   * the names of Gregorio's styles left open (e.g. "i" for <i>), which go on
   * into the next syllables, for each line of lyrics (see Gabc.createSyllableLyrics())
   */
  openStyles?: string[][];
}

/** the lowest and highest staff positions of the notes in Gregorio's brackets (gabc [[ and ]]) */
export interface BracketRange {
  low: number;
  high: number;
}

// a chant mapping is a lightweight format independent way of
// tracking how a chant language (e.g., gabc) has been
// mapped to exsurge notations.
/** a syllable with notes: the notation that takes its lyrics, and all of its notations */
export interface LyricSlot {
  notation: ChantNotationElement;
  notations: ChantNotationElement[];
}

export class ChantMapping {
  source: string;
  notations: ChantNotationElement[];
  sourceIndex: number;
  /** what the gabc word leaves for the next one's notes and syllable */
  marksForNext?: MarksForNext;
  /** whether the word before left marks on this one's notes or syllable */
  followsMarks?: boolean;
  /** the styles that the words before left open on its lyrics, as it was parsed (see MarksForNext.openStyles) */
  openStylesBefore?: string[][];
  /** the word's syllables with notes, which take the lyrics of the lyric-line headers in turn */
  lyricSlots?: LyricSlot[];
  /**
   * whether it was parsed under a Chi-Rho clef, the only clef under which 0
   * and 9 nudge notes, so that it can be parsed again under another kind of
   * clef (see Gabc.updateMappingsFromSource())
   */
  parsedUnderChiRho?: boolean;

  // source can be any object type. in the case of gabc, source is a text
  // string that maps to a gabc word (e.g.: "no(g)bis(fg)").
  // notations is an array of ChantNotationElements
  constructor(source: string, notations: ChantNotationElement[], sourceIndex: number) {
    this.source = source;
    this.notations = notations;
    this.sourceIndex = sourceIndex;
  }
}

// for each ChantContext, the lyric fonts that ChantScore.waitForLyricFont()
// last gave up waiting for when it had no document.fonts to ask.
const __lyricFontsWaitedFor = new WeakMap<ChantContext, string>();

export interface ElementSelection {
  /** the indices of the selected elements in the score's notes (-1 for the starting clef) */
  indices: number[];
  insertion?: {
    afterElementIndex?: number;
    chantLine?: number;
  };
}
export interface Selection {
  element?: ElementSelection;
}

/** the layout of a ChantDocument */
interface ChantDocumentLayout {
  units: string;
  "default-font": {
    "font-family": string;
    "font-size": number;
  };
  page: {
    width: number;
    height: number;
    "margin-left": number;
    "margin-top": number;
    "margin-right": number;
    "margin-bottom": number;
  };
}

/**
 * where the staff of a line of a score starts and ends, so that the line is
 * right - left wide (see ChantScore.lineExtent())
 */
export interface LineExtent {
  left: number;
  /** Infinity when the score's width has no limit */
  right: number;
  /**
   * how far left the line's text other than its lyrics may go: left, beside
   * a drop cap that reaches down beside the line, or else 0
   */
  textLeft: number;
}

// ctxt.dropCapLines as a number of lines, with what isn't a whole number of
// them from 0 up (as from a JavaScript caller) counted as 1, the default
function dropCapLineCount(ctxt: ChantContext) {
  var lines = Math.floor(ctxt.dropCapLines);
  return lines >= 0 && lines < Infinity ? lines : 1;
}

// ctxt.dropCapPosition and ctxt.dropCapAnchor, with anything else (as from a
// JavaScript caller) counted as the default
function dropCapPlacement(ctxt: ChantContext) {
  var position = ctxt.dropCapPosition,
    anchor = ctxt.dropCapAnchor;
  return {
    position:
      position === "firsttop" || position === "firstbaseline" || position === "lastbottom"
        ? position
        : "lastbaseline",
    anchor: anchor === "top" || anchor === "bottom" ? anchor : "baseline"
  };
}

/**
 * what laying out a line of a score depended on, so that the next layout of
 * the score can use the line again if it would lay it out the same (see
 * ChantScore.reusableLines())
 */
interface LineLayoutInputs extends ReadNotations {
  /**
   * the source index of the mapping of each notation it read, which its svg
   * shows (as do the lyrics that a line can start with, copied from the
   * notation before it), and which an edit of the spaces between words can
   * change without laying the notation out again
   */
  sourceIndices: number[];
  /** the clef in effect at its start, and that clef's layoutId; and the clef in effect after it */
  clef: Clef;
  clefLayoutId?: number;
  clefAfter: Clef;
  /** where its staff was (see ChantScore.lineExtent()) */
  extent: LineExtent;
  /**
   * whether a brace, slur or custom ledger line went on from it to the next
   * line, which the next line takes from the context (so the lines after it
   * aren't laid out again without it)
   */
  leftOpen: boolean;
  /**
   * for the first line: the drop cap and annotation, how big they were (see
   * dropCapAndAnnotationSizes()), and where it put them, which their layout
   * forgets
   */
  first?: {
    dropCap: DropCap | null;
    annotation: Annotation | Annotations | null;
    sizes: string;
    placed: number[];
  };
}
const lineLayoutInputs = new WeakMap<ChantLine, LineLayoutInputs>();

/*
 * Score, document
 */
export class ChantScore {
  mappings: ChantMapping[];
  lines: ChantLine[];
  /**
   * Every element of the score, in order (the notes of each neume, plus the
   * other notations such as dividers and clefs).  Set by updateNotations().
   */
  notes: Array<Note | ChantNotationElement>;
  notations!: ChantNotationElement[];
  /**
   * for each notation, whether a Gregorio no-line-break or euouae area keeps
   * it with the next one; worked out by ChantLine.keepsInArea() during
   * layoutChantLines()
   */
  keptInAreas?: boolean[] | null;
  staffLineCount: number;
  /**
   * the language of the score's lyrics, which Gabc.applyHeader() sets from
   * the header and updateNotations() gives the lyrics it doesn't have yet
   * (such as those of an edit), or null for each lyric's own (by default
   * ctxt.defaultLanguage)
   */
  language: Language | null;
  titles?: Titles;
  startingClef: Clef;
  useDropCap: boolean | undefined;
  dropCap: DropCap | null;
  // how many times layoutChantLines() has laid the lines out again so far, to
  // fit a drop cap to them (see fitDropCap())
  private dropCapRelayouts = 0;
  // what the last layoutChantLines() laid the lines out with, if the next can
  // use them again (see reusableLines())
  private linesLaidOutWith?: string;
  annotation: Annotation | Annotations | null;
  compiled: boolean;
  autoColoring: boolean;
  needsLayout: boolean;
  extendLastSystemStaffLines: boolean;
  bounds: Rect;
  hasLyrics!: boolean;
  hasAboveLinesText!: boolean;
  hasTranslations!: boolean;
  /**
   * Not read by exsurge; available for clients to track whether they need
   * to pass `force` to performLayout().
   */
  forceLayout?: boolean;
  /** the score split into pages, by paginate() (or just this score) */
  pages!: ChantScore[];
  /**
   * whether paginate() left the page the score starts on empty, because its
   * titles and first line (or the lines beside its drop cap) didn't fit in
   * the firstPageHeight it was given.  pages[0] is then the score's first
   * page after that one.
   */
  firstPageEmpty = false;
  // the lines of the last layout and the y of each in it, which paginate()
  // puts them back at before it moves them to their pages
  private laidOutLines?: { lines: ChantLine[]; ys: number[] };
  selection?: Selection;
  /** the notation that the insertion cursor is after */
  insertionElement?: ChantNotationElement | null;
  /** the annotation and left text together, when they're merged */
  overrideTextLeft?: TextLeftRight | null;
  /** the lyrics given the first word's styles (see updateFirstWordStyles()) */
  firstWordLyrics?: Lyric[];
  svg?: SvgElementWithSource;

  // mappings is an array of ChantMappings.
  constructor(ctxt?: ChantContext, mappings: ChantMapping[] = [], useDropCap?: boolean) {
    this.mappings = mappings;

    this.lines = [];
    this.notes = [];
    this.staffLineCount = 4;
    this.language = null;
    if (ctxt) this.titles = new Titles(ctxt, this);

    // set by updateNotations()
    this.startingClef = null as unknown as Clef;

    this.useDropCap = useDropCap;
    this.dropCap = null;

    this.annotation = null;

    this.compiled = false;

    this.autoColoring = true;
    this.needsLayout = true;
    this.extendLastSystemStaffLines = true;

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
  copyLines(startLine: number, endLine: number) {
    let result = new ChantScore();
    result.lines = this.lines.slice(startLine, endLine);
    result.bounds = this.bounds.clone();
    let lastLine = result.lines.slice(-1)[0];
    result.bounds.height = lastLine.bounds.bottom() - lastLine.origin.y;
    if (startLine === 0) {
      result.titles = this.titles;
      result.dropCap = this.dropCap;
      result.annotation = this.annotation;
      // (with room for a drop cap that reaches down past its last line)
      let dropCap = this.dropCap;
      if (dropCap && endLine <= this.lastLineBesideDropCap)
        result.bounds.height = Math.max(
          result.bounds.height,
          result.lines[0].bounds.y + dropCap.bounds.y - dropCap.origin.y + dropCap.bounds.height
        );
    }
    return result;
  }

  updateSelection(selection?: Selection) {
    this.selection = selection;
    const elementSelection: ElementSelection = (selection && selection.element) || {
      indices: []
    };
    const selectedIndices = elementSelection.indices;
    const selectedIndexSet = new Set(selectedIndices);
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
      element.selected = selectedIndexSet.has(i);
    }
    (
      this.startingClef.model || this.startingClef
    ).selected = selectedIndexSet.has(-1);
    for (let i = 0; i < this.lines.length; ++i) {
      this.lines[i].insertionCursor = null;
    }
    // update the insertion cursor, so it can be drawn on the correct system
    this.insertionElement = null;
    let insertionLine: ChantLine | null = null;
    if (insertion) {
      if (typeof insertion.chantLine === "number") {
        insertionLine = this.lines[insertion.chantLine];
        this.insertionElement = insertionLine.startingClef;
        insertionLine.insertionCursor = new InsertionCursor();
      } else if (typeof insertion.afterElementIndex === "number") {
        // a note is replaced by its neume just below
        this.insertionElement = this.notes[insertion.afterElementIndex] as ChantNotationElement;
        if (!this.insertionElement) {
          insertionLine = this.lines[0];
          this.insertionElement = insertionLine.startingClef;
        } else if ((this.insertionElement as unknown as Note).neume) {
          this.insertionElement = (this.insertionElement as unknown as Note).neume;
        }
        if (!insertionLine) {
          insertionLine = this.insertionElement!.line || this.lines[this.lines.length - 1];
        }
        insertionLine.insertionCursor = new InsertionCursor();
      }
    }
  }

  updateNotations(ctxt: ChantContext) {
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
    const selectedIndexSet = new Set(elementSelection.indices);
    let nonNoteElementCount = 0;

    // find the starting clef...
    // start with a default clef in case the notations don't provide one.
    this.startingClef = null as unknown as Clef;

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
            this.startingClef = notation as Clef;
            continue;
          }
        }

        notation.notationIndex = this.notations.push(notation) - 1;
        if (!this.hasLyrics && notation.hasLyrics()) this.hasLyrics = true;
        this.updateLanguage(notation);
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
          
          element.selected = selectedIndexSet.has(elementIndex);
        }
      }
    }

    // if we've reached this far and we *still* don't have a clef, then there aren't even
    // any neumes in the score. still, set the default clef just for good measure
    if (!this.startingClef) this.startingClef = Clef.default();
    this.startingClef.elementIndex = -1;

    this.updateVerseNumbers();

    // update drop cap (giving its letter back if it's no longer wanted), and
    // with it the first word's styles
    if (this.useDropCap || this.dropCap) this.recreateDropCap(ctxt);
    else this.updateFirstWordStyles(ctxt);

    this.needsLayout = true;
  }

  /**
   * Gives each lyric the verse number in effect on its line of lyrics, from
   * the last syllable before it with one, unless an empty one came after it
   * (see ChantLine.repeatVerseNumbers())
   */
  updateVerseNumbers() {
    var inEffect: Array<VerseNumber | undefined> = [];
    for (let notation of this.notations)
      notation.lyrics.forEach((lyric, lyricIndex) => {
        if (lyric.verseNumber || lyric.endsVerseNumbers) inEffect[lyricIndex] = lyric.verseNumber;
        else if (lyric.verseNumberInEffect !== inEffect[lyricIndex]) {
          lyric.verseNumberInEffect = inEffect[lyricIndex];
          delete lyric.verseNumberCopy;
        }
      });
  }

  /**
   * Gives the notation's lyrics the score's language, if it has one, and has
   * the notation laid out again if that changes them.
   */
  updateLanguage(notation: ChantNotationElement) {
    if (!this.language) return;
    for (let lyric of notation.lyrics) {
      if (lyric && lyric.language !== this.language) {
        lyric.language = this.language;
        notation.needsLayout = true;
      }
    }
  }

  recreateDropCap(ctxt: ChantContext) {
    this.dropCap = null;
    // (ctxt.dropCapLines 0 leaves the drop cap out too)
    var useDropCap = this.useDropCap && dropCapLineCount(ctxt) !== 0;

    // find the first notation with lyrics to use
    var first = this.notations.find(
      (notation) =>
        notation.hasLyrics() &&
        notation.lyrics[0] !== null &&
        notation.lyrics[0].spans &&
        notation.lyrics[0].spans.length
    );
    for (let notation of this.notations) {
      let lyrics = notation.lyrics[0];
      if (notation === first) {
        // a new drop cap is taken from the lyric without the first word's styles
        let hadDropCap = lyrics.dropCap;
        if (!useDropCap || !hadDropCap)
          lyrics.setFirstWordStyles(ctxt, null);
        if (useDropCap) {
          this.dropCap = lyrics.generateDropCap(ctxt);
        } else {
          lyrics.removeDropCap(ctxt);
        }
        // (but a drop cap that it had already is kept, with the lyric as it
        // was, which needn't be laid out again; so the lines that an edit
        // after it leaves as they were can be used again: see
        // layoutChantLines())
        if (!useDropCap || !hadDropCap || lyrics.dropCap !== hadDropCap) notation.needsLayout = true;
      } else if (lyrics && lyrics.dropCap) {
        // the lyric that the drop cap was taken from before the score was
        // edited, which isn't the first any longer
        lyrics.removeDropCap(ctxt);
        notation.needsLayout = true;
      }
    }
    this.updateFirstWordStyles(ctxt);
  }

  // Gregorio's brackets (gabc [[ and ]]) go round the notes from a [[ to the
  // ]] that closes it, which can be in other notations.  This records the
  // lowest and highest staff positions of those notes on the notes that the
  // brackets start and end at, and has a notation laid out again when the
  // brackets at its notes change.  As in Gregorio, a [[ inside brackets is
  // ignored, and so are brackets that aren't closed.
  private updateBrackets() {
    var ranges = new Map<Note, { start?: BracketRange; end?: BracketRange }>();
    var start: Note | null = null,
      range: BracketRange = { low: 0, high: 0 },
      // (whether a note had brackets before, so that a score without any,
      // which most are, is gone through only once)
      hadRanges = false;
    for (let notation of this.notations) {
      for (let note of notation.notes || []) {
        if (note.bracketRanges) hadRanges = true;
        if (note.bracketStart && !start) {
          start = note;
          range = { low: note.staffPosition, high: note.staffPosition };
        }
        if (!start) continue;
        range.low = Math.min(range.low, note.staffPosition);
        range.high = Math.max(range.high, note.staffPosition);
        if (note.bracketEnd) {
          ranges.set(start, { ...ranges.get(start), start: range });
          ranges.set(note, { ...ranges.get(note), end: range });
          start = null;
        }
      }
    }

    if (!ranges.size && !hadRanges) return;
    var sameRange = (a?: BracketRange, b?: BracketRange) =>
      a === b || (!!a && !!b && a.low === b.low && a.high === b.high);
    var none = {};
    for (let notation of this.notations) {
      for (let note of notation.notes || []) {
        let before: { start?: BracketRange; end?: BracketRange } = note.bracketRanges || none,
          after: { start?: BracketRange; end?: BracketRange } = ranges.get(note) || none;
        if (sameRange(before.start, after.start) && sameRange(before.end, after.end)) continue;
        note.bracketRanges = ranges.get(note);
        notation.needsLayout = true;
      }
    }
  }

  /**
   * Gives the lyrics of the first word ctxt.firstWordStyle, and the first
   * syllable (after any drop cap) ctxt.firstSyllableStyle and
   * ctxt.firstSyllableInitialStyle, taking them from any lyrics that had them
   * but are no longer the first word.
   */
  updateFirstWordStyles(ctxt: ChantContext) {
    const lyrics: Lyric[] = [];
    for (const notation of this.notations) {
      const lyric = notation.hasLyrics() ? notation.lyrics[0] : null;
      if (!lyric || !lyric.spans || !lyric.spans.length) continue;
      lyrics.push(lyric);
      // the first word ends with its last syllable (or a directive)
      if (
        lyric.lyricType !== LyricType.BeginningSyllable &&
        lyric.lyricType !== LyricType.MiddleSyllable
      )
        break;
    }
    for (const lyric of this.firstWordLyrics || []) {
      if (!lyrics.includes(lyric) && lyric.setFirstWordStyles(ctxt, null))
        lyric.notation.needsLayout = true;
    }
    lyrics.forEach((lyric, i) => {
      if (lyric.setFirstWordStyles(ctxt, i === 0 ? "syllable" : "word"))
        lyric.notation.needsLayout = true;
    });
    this.firstWordLyrics = lyrics;
  }

  /**
   * Shared layout initialization method for performLayout() and performLayoutAsync()
   * @param  {ChantContext} ctxt
   */
  private initializeLayout(ctxt: ChantContext) {
    // setup the context
    ctxt.activeClef = this.startingClef;
    ctxt.notations = this.notations;
    ctxt.currNotationIndex = 0;
    ctxt.staffLineCount = this.staffLineCount;
    this.updateBrackets();
    determineLedgerLines(ctxt, this.notations);

    if (this.dropCap) this.dropCap.measureAtSize(ctxt);

    if (this.annotation) this.annotation.recalculateMetrics(ctxt);
  }

  // this is the the synchronous version of performLayout that
  // process everything without yielding to any other workers/threads.
  // good for server side processing or very small chant pieces.
  performLayout(ctxt: ChantContext, force?: boolean) {
    if (!force && this.needsLayout === false) return; // nothing to do here!

    ctxt.noticeFontChanges();
    ctxt.updateHyphenWidth();

    this.initializeLayout(ctxt);

    for (let i = 0; i < this.notations.length; i++) {
      let notation = this.notations[i];
      if (force || notation.needsLayout) {
        ctxt.currNotationIndex = i;
        notation.performLayout(ctxt);
      } else if (notation.isClef) {
        // what's laid out after it is under it, as if it had been laid out
        ctxt.activeClef = notation as Clef;
      }
    }

    this.needsLayout = false;
  }

  // for web applications, probably performLayoutAsync would be more
  // apppropriate that the above performLayout, since it will process
  // the notations without locking up the UI thread.
  performLayoutAsync(ctxt: ChantContext, finishedCallback?: () => void) {
    if (this.needsLayout === false) {
      if (finishedCallback) setTimeout(() => finishedCallback(), 0);

      return; // nothing to do here!
    }

    // before the hyphen is measured, so that one measured in a fallback font
    // before the lyric font was added to document.fonts isn't used.
    ctxt.noticeFontChanges();
    this.waitForLyricFont(ctxt, () => {
      this.initializeLayout(ctxt);

      setTimeout(() => this.layoutElementsAsync(ctxt, 0, finishedCallback), 0);
    });
  }

  /**
   * Calls ready() once the lyric font gives a sane hyphen width, or once
   * waiting longer won't help.  A missing hyphen width, or one wider than
   * 0.6em, usually means that the lyric font hasn't loaded yet, but some real
   * fonts have hyphens that wide (Courier New's is 1229/2048em), so this waits
   * at most ctxt.fontLoadTimeout milliseconds.  Without document.fonts to say
   * whether the font has loaded, a ctxt waits that long only once for the
   * same lyric font.
   * @param  {ChantContext} ctxt
   * @param  {function(): void} ready
   */
  waitForLyricFont(ctxt: ChantContext, ready: () => void) {
    const hasSaneHyphenWidth = () => {
      ctxt.updateHyphenWidth();
      return (
        ctxt.hyphenWidth > 0 &&
        ctxt.hyphenWidth / ctxt.textStyles.lyric.size <= 0.6
      );
    };
    if (hasSaneHyphenWidth()) {
      ready();
      return;
    }

    // the fonts that the hyphen is measured in, which a lyric prefix such as
    // <i> can make differ from the plain lyric font.
    const hyphen = new Lyric(
      ctxt,
      ctxt.syllableConnector,
      LyricType.SingleSyllable
    );
    const hyphenFonts = hyphen.spans.map((span) => ({
      font: hyphen.getCanvasFontForProperties(ctxt, span.properties),
      text: span.text
    }));

    const fonts =
      ctxt.textMeasuringStrategy !== TextMeasuringStrategy.OpenTypeJS &&
      typeof document !== "undefined" &&
      document.fonts;
    if (fonts) {
      // the browser knows whether the font is still loading, so ask it
      // rather than polling until the deadline.
      let loaded: boolean;
      try {
        loaded = hyphenFonts.every(({ font, text }) => fonts.check(font, text));
      } catch (e) {
        loaded = true; // not a valid CSS font, so there's nothing to wait for
      }
      if (loaded) {
        ready();
        return;
      }

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        // text measured while the font was loading was measured in another font
        ctxt.clearTextCache();
        ctxt.updateHyphenWidth();
        ready();
      };
      const timeout = setTimeout(finish, ctxt.fontLoadTimeout);
      // finish from a timer rather than from the promise, so that layout
      // errors aren't swallowed as unhandled rejections.
      const finishSoon = () => setTimeout(finish, 0);
      Promise.all(
        hyphenFonts.map(({ font, text }) => fonts.load(font, text))
      ).then(finishSoon, finishSoon);
      return;
    }

    // without document.fonts, a font that hasn't loaded looks just like one
    // with a wide hyphen, so once a wait for these fonts has run out, don't
    // make every later layout wait for them again.
    const fontsKey = hyphenFonts.map(({ font }) => font).join("|");
    if (__lyricFontsWaitedFor.get(ctxt) === fontsKey) {
      ready();
      return;
    }
    const deadline = Date.now() + ctxt.fontLoadTimeout;
    const retry = () => {
      // the font may have loaded since the hyphen was last measured
      ctxt.clearTextCache();
      if (hasSaneHyphenWidth()) {
        ready();
      } else if (Date.now() >= deadline) {
        __lyricFontsWaitedFor.set(ctxt, fontsKey);
        ready();
      } else setTimeout(retry, 100);
    };
    setTimeout(retry, 100);
  }

  layoutElementsAsync(ctxt: ChantContext, index: number, finishedCallback?: () => void) {
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
      } else if (notation.isClef) {
        ctxt.activeClef = notation as Clef;
      }

      index++;
    } while (index < this.notations.length && new Date().getTime() < timeout);

    // schedule the next block of processing
    setTimeout(
      () => this.layoutElementsAsync(ctxt, index, finishedCallback),
      0
    );
  }

  /**
   * How many lines the drop cap is beside: ctxt.dropCapLines (at least 1) as
   * of the last layoutChantLines(), or 0 when there's no drop cap.
   */
  linesBesideDropCap() {
    return this.dropCap ? this.dropCap.linesBeside || 1 : 0;
  }

  /**
   * the index of the last line beside the drop cap (or 0), which paginate()
   * keeps on the first line's page
   */
  get lastLineBesideDropCap() {
    return Math.max(0, Math.min(this.linesBesideDropCap(), this.lines.length) - 1);
  }

  // the y of the top staff line, on a line of the score
  private staffTop(ctxt: ChantContext) {
    return ctxt.calculateHeightFromStaffPosition(this.staffLineCount * 2 - 1);
  }

  /**
   * Where the staff of the line at lineIndex (from 0) starts and ends, when
   * the score is laid out at width (0 or less for no limit).  The lines
   * beside the drop cap start after it and the space on each side of it, or
   * after the annotation and the space on each side of that, if that's wider;
   * as in Gregorio, they all leave as much room.  Without a drop cap, the
   * first line still leaves room for the annotation, unless it's merged into
   * the left text.  The lines' other text, such as translations, keeps to
   * the right of a drop cap that reaches down beside them (placeDropCap()).
   * (For any line breaker: ChantLine.buildFromChantNotationIndex() lays the
   * line out between these edges.)
   */
  lineExtent(ctxt: ChantContext, lineIndex: number, width: number): LineExtent {
    var left = 0,
      textLeft = 0;
    if (lineIndex === 0 || lineIndex < this.linesBesideDropCap()) {
      if (this.dropCap) left = this.dropCap.bounds.width + this.dropCap.padding * 2;

      if (this.annotation && (!ctxt.mergeAnnotationWithTextLeft || this.dropCap))
        left = Math.max(left, this.annotation.bounds.width + this.annotation.padding * 2);

      if (this.dropCap && !this.dropCapOnFirstLine(ctxt)) textLeft = left;
    }
    return { left, right: width > 0 ? width : Infinity, textLeft };
  }

  /**
   * Whether the first line puts the drop cap and the annotation in place as
   * it's laid out, as it does for a drop cap beside it alone, with its
   * baseline on the lyric baseline (the default).  Otherwise placeDropCap()
   * places them once all the lines are laid out.
   */
  dropCapOnFirstLine(ctxt: ChantContext) {
    var { position, anchor } = dropCapPlacement(ctxt);
    return (
      this.linesBesideDropCap() === 1 &&
      anchor === "baseline" &&
      (position === "lastbaseline" || position === "firstbaseline")
    );
  }

  /**
   * The y on the first line of the top of the annotation, above the drop cap
   * with its baseline at dropCapBaseline: the top staff line, as in Gregorio,
   * or higher, to be clear of the drop cap by the annotation's padding.  With
   * centered (as for a drop cap beside the first line alone), it's halfway
   * down from the top staff line to where it would touch the drop cap, when
   * that's lower.
   */
  annotationTop(ctxt: ChantContext, dropCapBaseline: number, centered: boolean) {
    var staffTop = this.staffTop(ctxt),
      lowest =
        dropCapBaseline -
        this.annotation!.bounds.height -
        this.annotation!.padding -
        this.dropCap!.origin.y;
    return lowest < staffTop ? lowest : centered ? (staffTop + lowest) / 2 : staffTop;
  }

  // a drop cap starts at its text style's size, beside ctxt.dropCapLines
  // lines, when the lines are laid out, rather than as they were last laid
  // out (see fitDropCap())
  private startDropCapLayout(ctxt: ChantContext) {
    var dropCap = this.dropCap;
    if (!dropCap || this.dropCapRelayouts) return;
    dropCap.linesBeside = Math.max(1, dropCapLineCount(ctxt));
    if (dropCap.sizeForLines) dropCap.measureAtSize(ctxt);
  }

  /**
   * Once the lines are laid out, makes a drop cap beside more than one of
   * them, with its baseline at the last one's lyric baseline or its top at
   * the first one's top staff line, just big enough for its letter to reach
   * from the one to the other, unless its size has been set (see
   * ChantContext.dropCapLines).  Returns whether the lines need to be laid
   * out again for the room that it then takes beside them, which they are
   * twice at most: after that, it's kept no bigger than the room they have
   * left it.
   */
  private fitDropCap(ctxt: ChantContext) {
    var dropCap = this.dropCap,
      { position, anchor } = dropCapPlacement(ctxt),
      relayouts = this.dropCapRelayouts;
    this.dropCapRelayouts = 0;
    if (
      !dropCap ||
      this.linesBesideDropCap() < 2 ||
      !ctxt.hasDefaultDropCapSize() ||
      !(
        (position === "lastbaseline" && anchor === "baseline") ||
        (position === "firsttop" && anchor === "top")
      )
    )
      return false;

    dropCap.fitBoundsToLetter(ctxt);
    var first = this.lines[0],
      last = this.lines[this.lastLineBesideDropCap],
      size = dropCap.sizeForLines,
      // from the top staff line to the lyric baseline
      reach = last.bounds.y - first.bounds.y + last.lyricLineBaseline - this.staffTop(ctxt),
      fitted = (dropCap.fontSize(ctxt) * reach) / dropCap.origin.y;
    if (!(fitted > 0)) return false;
    dropCap.measureAtSize(ctxt, fitted);

    var widening = this.lineExtent(ctxt, 0, 0).left - first.staffLeft;
    if (Math.abs(widening) >= 0.5 && relayouts < 2) {
      this.dropCapRelayouts = relayouts + 1;
      return true;
    }
    if (widening >= 0.5) dropCap.measureAtSize(ctxt, size);
    return false;
  }

  /**
   * Places the drop cap at ctxt.dropCapPosition and the annotation above it,
   * unless the first line has (see dropCapOnFirstLine()), once the lines are
   * laid out and each line's bounds.y is the y of its origin in the score.  As
   * in Gregorio (drop_initial() in gregoriotex.lua), the drop cap takes no
   * room from the lines beside it, except that the first line is made taller
   * if the drop cap or the annotation reaches above it, and the last line
   * beside the drop cap if the drop cap reaches below it, moving the lines
   * after them down.  Returns how much taller that makes the lines.
   */
  private placeDropCap(ctxt: ChantContext) {
    var dropCap = this.dropCap,
      lines = this.lines;
    if (!dropCap || this.dropCapOnFirstLine(ctxt)) return 0;
    dropCap.fitBoundsToLetter(ctxt);

    var lastIndex = this.lastLineBesideDropCap,
      first = lines[0],
      last = lines[lastIndex],
      // the y of the last line's origin, from the first line's
      lastY = last.bounds.y - first.bounds.y,
      { position, anchor } = dropCapPlacement(ctxt),
      // the y of the drop cap's baseline on the first line
      y =
        position === "firsttop"
          ? this.staffTop(ctxt)
          : position === "firstbaseline"
          ? first.lyricLineBaseline
          : position === "lastbottom"
          ? lastY + last.notationBounds!.bottom()
          : lastY + last.lyricLineBaseline;

    if (anchor === "top") y += dropCap.origin.y;
    else if (anchor === "bottom") y -= dropCap.bounds.height - dropCap.origin.y;
    // drop caps and annotations are drawn from their center
    dropCap.bounds.x = first.staffLeft / 2;
    dropCap.bounds.y = y;

    var top = y - dropCap.origin.y,
      bottom = top + dropCap.bounds.height;
    if (this.annotation) {
      let annotationTop = this.annotationTop(ctxt, y, false);
      this.annotation.bounds.y = annotationTop + this.annotation.origin.y;
      top = Math.min(top, annotationTop);
    }

    var above = first.reach(top, -Infinity).above,
      below = last.reach(Infinity, bottom - lastY).below;
    lines.forEach((line, i) => (line.bounds.y += above + (i > lastIndex ? below : 0)));
    return above + below;
  }

  layoutChantLines(
    ctxt: ChantContext,
    width: number,
    finishedCallback?: (score: ChantScore) => void
  ) {
    var lastLines = this.lines;
    this.lines = [];
    this.keptInAreas = null;
    ctxt.noticeFontChanges();
    this.startDropCapLayout(ctxt);

    if (ctxt.mergeAnnotationWithTextLeft && this.annotation && !this.dropCap) {
      let annotation = this.annotation,
        annotationSpans = (annotation as Annotations).annotations
          ? (annotation as Annotations).annotations.map((annotation) => annotation.spans)
          : [(annotation as Annotation).spans];
      this.overrideTextLeft = new TextLeftRight(ctxt, "", "textLeft");
      if (ctxt.mapAnnotationSpansToTextLeft) {
        annotationSpans = annotationSpans.map(ctxt.mapAnnotationSpansToTextLeft);
      }
      this.overrideTextLeft.spans = ctxt.mergeAnnotationWithTextLeft(
        ...annotationSpans,
        this.titles!.textLeft && this.titles!.textLeft.spans
      );
    } else {
      this.overrideTextLeft = null;
    }

    var y = width > 0 ? this.titles!.layoutTitles(ctxt, width) : 0;
    var currIndex = 0;

    ctxt.activeClef = this.startingClef;
    // (a brace, slur or custom ledger line left open by the last layout
    // doesn't go on into this one)
    delete ctxt.lastStartBrace;
    delete ctxt.openSlurs;
    delete ctxt.openLedgerLines;

    var spaceBetweenSystems = ctxt.staffInterval * ctxt.spaceBetweenSystems;
    var lineBreaker = ctxt.lineBreaking === "optimal" && width > 0 ? new LineBreaker(this, ctxt, width) : null;
    // (planned before the lines are built, so that it's known which notations
    // the plan laid out lines of its own from: see reusableLines())
    if (lineBreaker) lineBreaker.plannedEnd(0, 0);

    // (the lines at the start that the last layout laid out as this one
    // would, which this one uses again)
    var settings = this.lineLayoutSettings(ctxt, width, !!lineBreaker),
      reusable = this.reusableLines(ctxt, width, lastLines, settings, lineBreaker);

    do {
      var line: ChantLine;
      if (this.lines.length < reusable) {
        line = lastLines[this.lines.length];
        this.reuseLine(ctxt, line);
      } else {
        line = new ChantLine(this);
        let start = currIndex,
          clef = ctxt.activeClef,
          extent = this.lineExtent(ctxt, this.lines.length, width);

        if (lineBreaker) line.plannedEnd = lineBreaker.plannedEnd(this.lines.length, currIndex);
        line.buildFromChantNotationIndex(ctxt, currIndex, width);
        line.performLayout(ctxt);
        if (settings) this.recordLineLayout(ctxt, line, start, clef, extent);
      }
      currIndex = line.notationsStartIndex + line.numNotationsOnLine;
      line.elementIndex = this.lines.length;
      this.lines.push(line);

      // (from where the line's layout put the top of it, which is where its
      // bounds were before this put them in the score)
      line.bounds.y = -line.notationBounds!.y + y;
      y += line.bounds.height + spaceBetweenSystems;
    } while (currIndex < this.notations.length);
    this.linesLaidOutWith = settings;

    // (again, for a drop cap fitted to the lines; see fitDropCap())
    if (this.fitDropCap(ctxt)) {
      this.layoutChantLines(ctxt, width, finishedCallback);
      return;
    }
    y += this.placeDropCap(ctxt);

    var firstLine = this.lines[0];

    this.bounds.x = 0;
    this.bounds.y = 0;
    // (a line is wider than the first when a lyric protrudes past its staff)
    this.bounds.width = Math.max(...this.lines.map((line) => line.bounds.width));
    this.bounds.height = y - spaceBetweenSystems;

    this.pages = [this];
    this.firstPageEmpty = false;
    this.laidOutLines = { lines: this.lines, ys: this.lines.map((line) => line.bounds.y) };

    if (this.selection) {
      this.updateSelection(this.selection);
    }

    if (finishedCallback) finishedCallback(this);
  }

  /**
   * What the lines laid out at width depend on besides the notations that
   * they read (see LineLayoutInputs): the context's settings (see
   * layoutSettings()), the width, the staff, and whether the optimal line
   * breaker plans them.  Or undefined, where the next layout can't use them
   * again: when the drop cap is beside more than the first line or put
   * somewhere else on it (see placeDropCap()), which moves the lines it's
   * beside.
   */
  private lineLayoutSettings(ctxt: ChantContext, width: number, planned: boolean) {
    if (this.dropCap && !this.dropCapOnFirstLine(ctxt)) return undefined;
    return [
      layoutSettings(this, ctxt),
      "planned=" + planned,
      "width=" + width,
      "staffLineCount=" + this.staffLineCount,
      "extendLastSystemStaffLines=" + this.extendLastSystemStaffLines
    ].join(";");
  }

  /**
   * How many of lines, the lines that the last layoutChantLines() laid out,
   * from the first, this layout would lay out the same, with settings (see
   * lineLayoutSettings()), so that it can use them again: those that read
   * the same notations, not laid out again since (see isReadUpToDate()), with
   * the same source indices, under the same clef, on the same staff (see
   * lineExtent()), and for the first line, beside the same drop cap and
   * annotation, as big as they were.  (The notations that a line read are
   * laid out as it left them still, since the lines after it lay out only
   * the notations after it.)  It stops after the last of them that left the
   * context as it was at the start, with no brace, slur or custom ledger line
   * going on to the next line, so that the line after it can be laid out
   * from there.
   */
  private reusableLines(
    ctxt: ChantContext,
    width: number,
    lines: ChantLine[],
    settings?: string,
    lineBreaker?: LineBreaker | null
  ) {
    if (!settings || settings !== this.linesLaidOutWith) return 0;
    var notations = this.notations,
      clef = this.startingClef,
      start = 0,
      reusable = 0;
    for (var i = 0; i < lines.length && start < notations.length; i++) {
      var line = lines[i],
        inputs = lineLayoutInputs.get(line),
        from = readFrom(start),
        extent = this.lineExtent(ctxt, i, width);
      if (
        !inputs ||
        inputs.clef !== clef ||
        inputs.clefLayoutId !== clef.layoutId ||
        inputs.extent.left !== extent.left ||
        inputs.extent.right !== extent.right ||
        inputs.extent.textLeft !== extent.textLeft ||
        !isReadUpToDate(notations, from, inputs) ||
        inputs.sourceIndices.some((sourceIndex, k) => notations[from + k].mapping!.sourceIndex !== sourceIndex) ||
        // (planned to end where it did, and read only notations that none of
        // the line breaker's own lines laid out since)
        (lineBreaker &&
          (lineBreaker.plannedEnds.get(i + ":" + start) !== line.plannedEnd ||
            from + inputs.read.length > lineBreaker.touchedFrom))
      )
        break;
      var first = inputs.first;
      if (
        first &&
        (first.dropCap !== this.dropCap ||
          first.annotation !== this.annotation ||
          first.sizes !== this.dropCapAndAnnotationSizes())
      )
        break;
      clef = inputs.clefAfter;
      start = line.notationsStartIndex + line.numNotationsOnLine;
      if (!inputs.leftOpen) reusable = i + 1;
    }
    return reusable;
  }

  /**
   * Keeps what the layout of line, which started at the notation at start
   * under clef, at extent, depended on (see LineLayoutInputs), once it's laid
   * out.
   */
  private recordLineLayout(ctxt: ChantContext, line: ChantLine, start: number, clef: Clef, extent: LineExtent) {
    var notations = this.notations,
      from = readFrom(start),
      read = notations.slice(from, line.readEnd(ctxt)),
      translationEnds: Array<ChantNotationElement | undefined> = [],
      isOpen = (open?: object) => !!open && Object.keys(open).length > 0;
    for (var notation of read)
      if (notation.translationText && notation.translationText.length)
        translationEnds.push(notation, notation.translationText[0].endNeume);
    var inputs: LineLayoutInputs = {
      read,
      layoutIds: read.map((notation) => notation.layoutId),
      toEnd: from + read.length === notations.length,
      translationEnds,
      sourceIndices: read.map((notation) => notation.mapping!.sourceIndex),
      clef,
      clefLayoutId: clef.layoutId,
      clefAfter: ctxt.activeClef,
      extent,
      leftOpen: !!ctxt.lastStartBrace || isOpen(ctxt.openSlurs) || isOpen(ctxt.openLedgerLines)
    };
    if (line.isFirstLine) {
      var dropCap = this.dropCap,
        annotation = this.annotation;
      inputs.first = {
        dropCap,
        annotation,
        sizes: this.dropCapAndAnnotationSizes(),
        placed: [
          dropCap ? dropCap.bounds.x : 0,
          dropCap ? dropCap.bounds.y : 0,
          annotation ? annotation.bounds.x : 0,
          annotation ? annotation.bounds.y : 0
        ]
      };
    }
    lineLayoutInputs.set(line, inputs);
  }

  /**
   * Puts what the line's layout left in the context, and in the score, back
   * as it left them, for a line laid out by an earlier layout that this one
   * uses again (see reusableLines()): the clef in effect after it, and for
   * the first line, where it put the drop cap and the annotation.
   */
  private reuseLine(ctxt: ChantContext, line: ChantLine) {
    var inputs = lineLayoutInputs.get(line)!,
      first = inputs.first;
    ctxt.activeClef = inputs.clefAfter;
    if (first) {
      if (this.dropCap) {
        this.dropCap.bounds.x = first.placed[0];
        this.dropCap.bounds.y = first.placed[1];
      }
      if (this.annotation) {
        this.annotation.bounds.x = first.placed[2];
        this.annotation.bounds.y = first.placed[3];
      }
    }
  }

  /** how big the drop cap and the annotation are, which the first line depends on */
  private dropCapAndAnnotationSizes() {
    return [this.dropCap, this.annotation]
      .map((element) =>
        element
          ? [element.bounds.width, element.bounds.height, element.origin.x, element.origin.y, element.padding].join()
          : ""
      )
      .join(";");
  }

  /**
   * Split the score into pages (this.pages) of at most height, keeping the
   * lines beside the drop cap together on the first.  It can be called again,
   * with another height, without laying the lines out again.
   * @param height the height of a page
   * @param firstPageHeight the room left on the page the score starts on
   *   (when something else began it), at most height, which it is by default
   *   or when it isn't a finite number.  The first page has only the lines
   *   that fit there; when the titles and first line (or the lines beside the
   *   drop cap) don't, it's left empty, which firstPageEmpty says, and the
   *   score starts on the next page.  The pages after the first have height.
   */
  paginate(height: number, firstPageHeight = height) {
    if (!height) return;
    // (the lines where their layout put them, if paginate() has moved them)
    const laidOut = this.laidOutLines;
    if (laidOut && laidOut.lines === this.lines) this.lines.forEach((line, i) => (line.bounds.y = laidOut.ys[i]));
    this.pages = [];
    let pageHeight = Number.isFinite(firstPageHeight) ? Math.min(firstPageHeight, height) : height;
    this.firstPageEmpty =
      pageHeight < height && this.copyLines(0, this.lastLineBesideDropCap + 1).bounds.height > pageHeight;
    if (this.firstPageEmpty) pageHeight = height;
    let pageHeightOffset = 0,
      startLineIndex = 0;
    for (let i = 1; i < this.lines.length; ++i) {
      let line = this.lines[i];
      let bottom = line.bounds.bottom() - pageHeightOffset - line.origin.y;

      // (the lines beside a drop cap stay on its page)
      if (bottom > pageHeight && i > this.lastLineBesideDropCap) {
        // this line will be the first on the new page
        this.pages.push(this.copyLines(startLineIndex, i));
        startLineIndex = i;
        pageHeightOffset = line.bounds.y - line.origin.y;
        line.bounds.y = line.origin.y;
        pageHeight = height;
      } else {
        // not a new page yet...update the bounds:
        line.bounds.y -= pageHeightOffset;
      }
    }
    this.pages.push(this.copyLines(startLineIndex, this.lines.length));
  }

  draw(ctxt: ChantContext, scale = 1) {
    ctxt.setCanvasSize(this.bounds.width, this.bounds.height, scale);

    var canvasCtxt = ctxt.canvasCtxt!;

    canvasCtxt.clearRect(0, 0, ctxt.canvas!.width, ctxt.canvas!.height);

    canvasCtxt.translate(this.bounds.x, this.bounds.y);

    if (this.titles) this.titles.draw(ctxt);

    for (var i = 0; i < this.lines.length; i++) this.lines[i].draw(ctxt);

    canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
  }

  getSvgProps(
    ctxt: ChantContext,
    zoom?: number | boolean
  ): { [attribute: string]: string | number | undefined } {
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
      class: ctxt.getSvgClass() + (ctxt.editable ? " EditableChantScore" : ""),
      width,
      height,
      viewBox: [0, 0, this.bounds.width, this.bounds.height].join(" ")
    };
  }

  createSvgNode(ctxt: ChantContext) {
    // create defs section
    var nodes: Node[] = [ctxt.defsNode!.cloneNode(true)];
    nodes[0].appendChild(ctxt.createStyleNode());

    if (this.titles) nodes.push(this.titles.createSvgNode(ctxt));

    for (var i = 0; i < this.lines.length; i++)
      nodes.push(this.lines[i].createSvgNode(ctxt));

    var node = QuickSvg.createNode("g", {}, nodes);

    node = QuickSvg.createNode("svg", this.getSvgProps(ctxt), node);

    node.source = this;
    this.svg = node;

    return node;
  }

  createSvgTree(ctxt: ChantContext, zoom?: number | boolean) {
    // create defs section
    var nodes = [
      QuickSvg.createSvgTree(
        "defs",
        {},
        ...ctxt.makeDefs.map((makeDef) => makeDef.makeSvgTree()),
        ctxt.createStyleTree()
      )
    ];

    if (this.titles) nodes.push(this.titles.createSvgTree(ctxt));

    for (var i = 0; i < this.lines.length; i++)
      nodes.push(this.lines[i].createSvgTree(ctxt));

    var node = QuickSvg.createSvgTree("g", {}, ...nodes);
    let svgProps: { [attribute: string]: unknown } = this.getSvgProps(ctxt, zoom);
    svgProps.source = this;
    node = QuickSvg.createSvgTree("svg", svgProps, node);

    return node;
  }

  /** the defs of an svg string: the glyphs used, and the styles */
  private createDefsFragment(ctxt: ChantContext) {
    var fragment = "";
    for (var def in ctxt.defs)
      if (ctxt.defs.hasOwnProperty(def)) fragment += ctxt.defs[def];
    fragment += ctxt.createStyle();
    return QuickSvg.createFragment("defs", {}, fragment);
  }

  /** the attributes of the svg of a line on its own (see createSvgForEachLine()), height high */
  private lineSvgProps(ctxt: ChantContext, height: number): SvgAttributes {
    return {
      xmlns: QuickSvg.ns,
      version: "1.1",
      class: ctxt.getSvgClass(),
      width: this.bounds.width,
      height: height,
      viewBox: [0, 0, this.bounds.width, height].join(" ")
    };
  }

  createSvg(ctxt: ChantContext) {
    var fragment = this.createDefsFragment(ctxt);

    if (this.titles) fragment += this.titles.createSvgFragment(ctxt);

    // (each line's svg is kept, for the next svg to use again where the line
    // and what it shows are the same)
    var settings = layoutSettings(this, ctxt);
    for (var i = 0; i < this.lines.length; i++)
      fragment += this.lines[i].createSvgFragment(ctxt, 0, this.lineSvgKey(this.lines[i], settings));

    fragment = QuickSvg.createFragment("g", {}, fragment);

    fragment = QuickSvg.createFragment("svg", this.getSvgProps(ctxt), fragment);

    return fragment;
  }

  /**
   * What the svg of line shows besides how the line is laid out (see
   * ChantLine.createSvgFragment()), with the context's settings (see
   * layoutSettings()): each of its notations, as it's laid out (by its
   * layoutId), with its source index and which of its elements are selected,
   * the same for its clef and custos, and on the first line, the drop cap and
   * annotation, as big as they are and where they are.  Or undefined for the
   * line with the insertion cursor, which is drawn where the selection is
   * (see ChantLine.layoutInsertionCursor()).  (From the line's own score,
   * which a page of it isn't: see copyLines().)
   */
  private lineSvgKey(line: ChantLine, settings: string) {
    if (line.insertionCursor) return undefined;
    var score = line.score,
      notations = score.notations,
      end = line.notationsStartIndex + line.numNotationsOnLine,
      selected = (element: ChantLayoutElement) =>
        element.selected || ((element as Clef).model && (element as Clef).model!.selected) ? 1 : 0,
      describe = (notation: ChantNotationElement) => {
        var description = notation.layoutId + ":" + (notation.mapping ? notation.mapping.sourceIndex : "") + ":";
        if (!notation.notes) return description + selected(notation);
        for (var note of notation.notes) description += selected(note);
        return description;
      },
      key = settings + "|" + describe(line.startingClef);
    for (var i = line.notationsStartIndex; i < end; i++) key += "," + describe(notations[i]);
    if (line.custos) key += "|" + describe(line.custos);
    if (line.isFirstLine)
      key +=
        "|" +
        score.dropCapAndAnnotationSizes() +
        [score.dropCap, score.annotation].map((element) => element && [element.bounds.x, element.bounds.y]).join();
    return key;
  }

  /**
   * For drawing line i on its own, in an svg that starts at top: the
   * transform that puts the part of a drop cap beside the line in its svg,
   * where it reaches down from the first line (whose svg has the rest), or
   * else null.  (Each line's svg shows only its own part, so that it can be
   * drawn or clipped on its own.)
   */
  private dropCapTransformBesideLine(i: number, top: number) {
    var first = this.lines[0];
    return this.dropCap && i > 0 && i <= this.lastLineBesideDropCap
      ? "translate(" + first.bounds.x + "," + (first.bounds.y - top) + ")"
      : null;
  }

  createSvgNodeForEachLine(ctxt: ChantContext) {
    var node: SvgElementWithSource[] = [];

    var top = 0;
    for (var i = 0; i < this.lines.length; i++) {
      var lineNodes: Node[] = [
        ctxt.defsNode!.cloneNode(true),
        this.lines[i].createSvgNode(ctxt, top)
      ];
      lineNodes[0].appendChild(ctxt.createStyleNode());
      var dropCapTransform = this.dropCapTransformBesideLine(i, top);
      if (dropCapTransform)
        lineNodes.push(
          QuickSvg.createNode("g", { transform: dropCapTransform }, this.dropCap!.createSvgNode(ctxt))
        );
      var height = this.lines[i].bounds.height + ctxt.staffInterval * 1.5;
      var lineFragment = QuickSvg.createNode("g", {}, lineNodes);
      lineFragment = QuickSvg.createNode("svg", this.lineSvgProps(ctxt, height), lineFragment);
      node.push(lineFragment);
      top += height;
    }
    return node;
  }

  createSvgForEachLine(ctxt: ChantContext) {
    var fragment = "",
      fragmentDefs = this.createDefsFragment(ctxt);
    var top = 0;
    for (var i = 0; i < this.lines.length; i++) {
      var lineFragment =
        fragmentDefs + this.lines[i].createSvgFragment(ctxt, top);
      var dropCapTransform = this.dropCapTransformBesideLine(i, top);
      if (dropCapTransform)
        lineFragment += QuickSvg.createFragment(
          "g",
          { transform: dropCapTransform },
          this.dropCap!.createSvgFragment(ctxt)
        );
      var height = this.lines[i].bounds.height + ctxt.staffInterval * 1.5;
      lineFragment = QuickSvg.createFragment("g", {}, lineFragment);
      // (and in a string, the namespace of the glyphs' xlink:href)
      lineFragment = QuickSvg.createFragment(
        "svg",
        { ...this.lineSvgProps(ctxt, height), "xmlns:xlink": QuickSvg.xlink },
        lineFragment
      );
      fragment += lineFragment;
      top += height;
    }
    return fragment;
  }

  // (Gabc has no parseChantNotations(), so this throws)
  unserializeFromJson(data: any, ctxt?: ChantContext) {
    this.autoColoring = data["auto-coloring"];

    if (data.annotation !== null && data.annotation !== "") {
      // create the annotation
      this.annotation = new Annotation(ctxt!, data.annotation);
    } else this.annotation = null;

    var createDropCap = data["drop-cap"] === "auto" ? true : false;

    (Gabc as unknown as {
      parseChantNotations(notations: unknown, score: ChantScore, createDropCap: boolean): void;
    }).parseChantNotations(data.notations, this, createDropCap);
  }

  serializeToJson() {
    var data: { [key: string]: unknown } = {};

    data["type"] = "score";
    data["auto-coloring"] = true;

    if (this.annotation !== null)
      data.annotation = (this.annotation as unknown as { unsanitizedText?: string }).unsanitizedText;
    else data.annotation = "";

    return data;
  }
}

export class ChantDocument {
  layout!: ChantDocumentLayout;
  scores: ChantScore[];

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

  copyLayout(to: { layout?: ChantDocumentLayout }, from: { layout: ChantDocumentLayout }) {
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

  unserializeFromJson(data: any) {
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
    var data: { layout?: ChantDocumentLayout; scores?: unknown[] } = {};

    this.copyLayout(data, this);

    data.scores = [];

    // save scores...
    for (var i = 0; i < this.scores.length; i++)
      data.scores.push(this.scores[i].serializeToJson());

    return data;
  }
}
