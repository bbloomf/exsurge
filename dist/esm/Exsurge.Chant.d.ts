import { ChantLine } from "./Exsurge.Chant.ChantLine.js";
import { Pitch, Rect } from "./Exsurge.Core.js";
import { Annotation, ChantLayoutElement, ChantNotationElement, GlyphCode, GlyphVisualizer, Lyric, TextLeftRight } from "./Exsurge.Drawing.js";
import { Titles } from "./Exsurge.Titles.js";
import { type LedgerLineStates } from "./ledgerLines.js";
import type { Accidental } from "./Exsurge.Chant.Signs.js";
import type { Accent, BracePoint, CustomLedgerLine, EpisemaTuning, HorizontalEpisema, Ictus, Mora, SlurMark } from "./Exsurge.Chant.Markings.js";
import type { Neume } from "./Exsurge.Chant.Neumes.js";
import type { Language } from "./Exsurge.Text.js";
import type { AboveLinesText, Annotations, AreaBoundary, ChantContext, ChoralSign, NabcChoralSign, DropCap, SvgElementWithSource, SvgTreeNode } from "./Exsurge.Drawing.js";
export declare const LiquescentType: {
    readonly None: 0;
    readonly Large: number;
    readonly Small: number;
    readonly Ascending: number;
    readonly Descending: number;
    readonly InitioDebilis: number;
    readonly LargeAscending: number;
    readonly LargeDescending: number;
    readonly SmallAscending: number;
    readonly SmallDescending: number;
};
/** LiquescentType flags, combined */
export type LiquescentType = number;
export declare const NoteShape: {
    readonly Default: 0;
    readonly Virga: 1;
    readonly Inclinatum: 2;
    readonly Quilisma: 3;
    readonly Stropha: 4;
    readonly Oriscus: 5;
};
export type NoteShape = (typeof NoteShape)[keyof typeof NoteShape];
/** which way Gregorio's punctum inclinatum leans (gabc G0, G1 and G2) */
export type InclinatumLeaning = "descending" | "ascending" | "unison";
export declare const NoteShapeModifiers: {
    readonly None: 0;
    readonly Ascending: number;
    readonly Descending: number;
    readonly Cavum: number;
    readonly Stemmed: number;
    readonly Linea: number;
    readonly Reverse: number;
};
/** NoteShapeModifiers flags, combined */
export type NoteShapeModifiers = number;
/**
 * @class
 */
export declare class Note extends ChantLayoutElement {
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
    bracketRanges?: {
        start?: BracketRange;
        end?: BracketRange;
    };
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
    episemaTuning?: {
        above?: EpisemaTuning;
        below?: EpisemaTuning;
    };
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
    sourceIndex: number;
    sourceGabc: string;
    /** the note's index in its score's notes */
    elementIndex?: number;
    /** the note's index among the notes of its score, not counting other notations */
    noteIndex?: number;
    svgNode?: SvgElementWithSource;
    /**
     * @para {Pitch} pitch
     */
    constructor(pitch?: Pitch);
    setGlyph(ctxt: ChantContext, glyphCode: GlyphCode): void;
    shapeModifierMatches(shapeModifier: NoteShapeModifiers): boolean;
    draw(ctxt: ChantContext): void;
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export interface Clef {
    staffPositionToPitch(staffPosition: number): Pitch;
}
export declare class Clef extends ChantNotationElement {
    isClef: true;
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
    constructor(staffPosition: number, octave: number, defaultAccidental?: Accidental | null);
    resetAccidentals(): void;
    pitchToStaffPosition(pitch: Pitch): number;
    performLayout(ctxt: ChantContext): void;
    finishLayout(ctxt: ChantContext): void;
    hide(ctxt: ChantContext): void;
    private addSecondClef;
    static default(): Clef;
    clone(): Clef;
}
export declare class DoClef extends Clef {
    constructor(staffPosition: number, octave: number, defaultAccidental?: Accidental | null);
    pitchToStaffPosition(pitch: Pitch): number;
    staffPositionToPitch(staffPosition: number): Pitch;
    performLayout(ctxt: ChantContext): void;
}
export declare class FaClef extends Clef {
    constructor(staffPosition: number, octave: number, defaultAccidental?: Accidental | null);
    pitchToStaffPosition(pitch: Pitch): number;
    staffPositionToPitch(staffPosition: number): Pitch;
    performLayout(ctxt: ChantContext): void;
}
export declare class TrebleClef extends Clef {
    constructor(staffPosition: number, octave: number, defaultAccidental?: Accidental | null, small?: boolean);
    pitchToStaffPosition(pitch: Pitch): number;
    staffPositionToPitch(staffPosition: number): Pitch;
    performLayout(ctxt: ChantContext): void;
}
export declare class ChiRhoClef extends Clef {
    constructor(staffPosition: number, octave: number, defaultAccidental?: Accidental | null, sans?: boolean);
    pitchToStaffPosition(pitch: Pitch): number;
    staffPositionToPitch(staffPosition: number): Pitch;
    performLayout(ctxt: ChantContext): void;
}
export declare class TextOnly extends ChantNotationElement {
    constructor(sourceIndex: number, sourceLength: number);
    performLayout(ctxt: ChantContext): void;
}
/**
 * whether a line break ends its line with a custos: "auto" if
 * ChantContext.eolCustos says so (gabc z or Z), "force" to always (z+ or Z+)
 * or "none" to never (z- or Z-)
 */
export type LineBreakCustos = "auto" | "force" | "none";
export declare class ChantLineBreak extends ChantNotationElement {
    /** whether to justify the line that it ends */
    justify?: boolean;
    custos: LineBreakCustos;
    constructor(justify?: boolean, custos?: LineBreakCustos);
    performLayout(ctxt: ChantContext): void;
    clone(): ChantLineBreak;
}
/**
 * Gregorio's marks after the last notes of a gabc word ([[, <nlba> or @[),
 * which go on the next note, and its controls after its last notes (such as
 * </nlba>), which go on the next syllable's notations
 */
export interface MarksForNext {
    noteMarks: ((note: Note) => void)[];
    areas: {
        euouae?: AreaBoundary;
        noLineBreak?: AreaBoundary;
    };
    /** the tunings of Gregorio's blocks of episemata ([oh:…{] … [oh}]) that the next notes are in */
    episemaBlocks?: {
        above?: EpisemaTuning;
        below?: EpisemaTuning;
    };
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
/** a syllable with notes: the notation that takes its lyrics, and all of its notations */
export interface LyricSlot {
    notation: ChantNotationElement;
    notations: ChantNotationElement[];
}
export declare class ChantMapping {
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
    constructor(source: string, notations: ChantNotationElement[], sourceIndex: number);
}
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
export declare class ChantScore {
    mappings: ChantMapping[];
    lines: ChantLine[];
    /**
     * Every element of the score, in order (the notes of each neume, plus the
     * other notations such as dividers and clefs).  Set by updateNotations().
     */
    notes: Array<Note | ChantNotationElement>;
    notations: ChantNotationElement[];
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
    private dropCapRelayouts;
    private linesLaidOutWith?;
    annotation: Annotation | Annotations | null;
    compiled: boolean;
    autoColoring: boolean;
    needsLayout: boolean;
    extendLastSystemStaffLines: boolean;
    bounds: Rect;
    hasLyrics: boolean;
    hasAboveLinesText: boolean;
    hasTranslations: boolean;
    /**
     * Not read by exsurge; available for clients to track whether they need
     * to pass `force` to performLayout().
     */
    forceLayout?: boolean;
    /** the score split into pages, by paginate() (or just this score) */
    pages: ChantScore[];
    /**
     * whether paginate() left the page the score starts on empty, because its
     * titles and first line (or the lines beside its drop cap) didn't fit in
     * the firstPageHeight it was given.  pages[0] is then the score's first
     * page after that one.
     */
    firstPageEmpty: boolean;
    private laidOutLines?;
    selection?: Selection;
    /** the notation that the insertion cursor is after */
    insertionElement?: ChantNotationElement | null;
    /** the annotation and left text together, when they're merged */
    overrideTextLeft?: TextLeftRight | null;
    /** the lyrics given the first word's styles (see updateFirstWordStyles()) */
    firstWordLyrics?: Lyric[];
    svg?: SvgElementWithSource;
    constructor(ctxt?: ChantContext, mappings?: ChantMapping[], useDropCap?: boolean);
    /**
     * Make a copy of the score, only including the specified lines
     * @param  {number} startLine starting index
     * @param  {number} endLine   ending index
     * @return {ChantScore}           the partial score
     */
    copyLines(startLine: number, endLine: number): ChantScore;
    updateSelection(selection?: Selection): void;
    updateNotations(ctxt: ChantContext): void;
    /**
     * Gives each lyric the verse number in effect on its line of lyrics, from
     * the last syllable before it with one, unless an empty one came after it
     * (see ChantLine.repeatVerseNumbers())
     */
    updateVerseNumbers(): void;
    /**
     * Gives the notation's lyrics the score's language, if it has one, and has
     * the notation laid out again if that changes them.
     */
    updateLanguage(notation: ChantNotationElement): void;
    recreateDropCap(ctxt: ChantContext): void;
    private updateBrackets;
    /**
     * Gives the lyrics of the first word ctxt.firstWordStyle, and the first
     * syllable (after any drop cap) ctxt.firstSyllableStyle and
     * ctxt.firstSyllableInitialStyle, taking them from any lyrics that had them
     * but are no longer the first word.
     */
    updateFirstWordStyles(ctxt: ChantContext): void;
    /**
     * Shared layout initialization method for performLayout() and performLayoutAsync()
     * @param  {ChantContext} ctxt
     */
    private initializeLayout;
    performLayout(ctxt: ChantContext, force?: boolean): void;
    performLayoutAsync(ctxt: ChantContext, finishedCallback?: () => void): void;
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
    waitForLyricFont(ctxt: ChantContext, ready: () => void): void;
    layoutElementsAsync(ctxt: ChantContext, index: number, finishedCallback?: () => void): void;
    /**
     * How many lines the drop cap is beside: ctxt.dropCapLines (at least 1) as
     * of the last layoutChantLines(), or 0 when there's no drop cap.
     */
    linesBesideDropCap(): number;
    /**
     * the index of the last line beside the drop cap (or 0), which paginate()
     * keeps on the first line's page
     */
    get lastLineBesideDropCap(): number;
    private staffTop;
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
    lineExtent(ctxt: ChantContext, lineIndex: number, width: number): LineExtent;
    /**
     * Whether the first line puts the drop cap and the annotation in place as
     * it's laid out, as it does for a drop cap beside it alone, with its
     * baseline on the lyric baseline (the default).  Otherwise placeDropCap()
     * places them once all the lines are laid out.
     */
    dropCapOnFirstLine(ctxt: ChantContext): boolean;
    /**
     * The y on the first line of the top of the annotation, above the drop cap
     * with its baseline at dropCapBaseline: the top staff line, as in Gregorio,
     * or higher, to be clear of the drop cap by the annotation's padding.  With
     * centered (as for a drop cap beside the first line alone), it's halfway
     * down from the top staff line to where it would touch the drop cap, when
     * that's lower.
     */
    annotationTop(ctxt: ChantContext, dropCapBaseline: number, centered: boolean): number;
    private startDropCapLayout;
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
    private fitDropCap;
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
    private placeDropCap;
    layoutChantLines(ctxt: ChantContext, width: number, finishedCallback?: (score: ChantScore) => void): void;
    /**
     * What the lines laid out at width depend on besides the notations that
     * they read (see LineLayoutInputs): the context's settings (see
     * layoutSettings()), the width, and the staff.  Or undefined, where the
     * next layout can't use them again: when the optimal line breaker plans
     * them (and lays out lines of its own from the notations, which leaves them
     * as those lines laid them out), and when the drop cap is beside more than
     * the first line or put somewhere else on it (see placeDropCap()), which
     * moves the lines it's beside.
     */
    private lineLayoutSettings;
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
    private reusableLines;
    /**
     * Keeps what the layout of line, which started at the notation at start
     * under clef, at extent, depended on (see LineLayoutInputs), once it's laid
     * out.
     */
    private recordLineLayout;
    /**
     * Puts what the line's layout left in the context, and in the score, back
     * as it left them, for a line laid out by an earlier layout that this one
     * uses again (see reusableLines()): the clef in effect after it, and for
     * the first line, where it put the drop cap and the annotation.
     */
    private reuseLine;
    /** how big the drop cap and the annotation are, which the first line depends on */
    private dropCapAndAnnotationSizes;
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
    paginate(height: number, firstPageHeight?: number): void;
    draw(ctxt: ChantContext, scale?: number): void;
    getSvgProps(ctxt: ChantContext, zoom?: number | boolean): {
        [attribute: string]: string | number | undefined;
    };
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext, zoom?: number | boolean): SvgTreeNode;
    createSvg(ctxt: ChantContext): string;
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
    private lineSvgKey;
    /**
     * For drawing line i on its own, in an svg that starts at top: the
     * transform that puts the part of a drop cap beside the line in its svg,
     * where it reaches down from the first line (whose svg has the rest), or
     * else null.  (Each line's svg shows only its own part, so that it can be
     * drawn or clipped on its own.)
     */
    private dropCapTransformBesideLine;
    createSvgNodeForEachLine(ctxt: ChantContext): SvgElementWithSource[];
    createSvgForEachLine(ctxt: ChantContext): string;
    unserializeFromJson(data: any, ctxt?: ChantContext): void;
    serializeToJson(): {
        [key: string]: unknown;
    };
}
export declare class ChantDocument {
    layout: ChantDocumentLayout;
    scores: ChantScore[];
    constructor();
    copyLayout(to: {
        layout?: ChantDocumentLayout;
    }, from: {
        layout: ChantDocumentLayout;
    }): void;
    unserializeFromJson(data: any): void;
    serializeToJson(): {
        layout?: ChantDocumentLayout;
        scores?: unknown[];
    };
}
export {};
//# sourceMappingURL=Exsurge.Chant.d.ts.map