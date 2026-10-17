declare module "exsurge" {
  // TODO: Add types for these:
  type ChantNotation = unknown;
  type ChantLine = unknown;
  type Note = unknown;
  type Clef = unknown;
  type DropCap = unknown;
  type Annotation = { recalculateMetrics: (ctxt: ChantContext) => void; };
  type Rect = unknown;
  type ExsurgeLanguage = unknown;
  type ChantNotationElement = unknown;
  /** A piece of text in a score, e.g. a Lyric, Title, DropCap or Annotation. */
  export interface TextElement {
    /** the text, split up by style */
    spans: TextSpan[];
    /** the text as given, without its text style's prefix */
    sourceGabc?: string;
    bounds: Rect;
    /**
     * The matching element in score (see TextType.getFromScore()).  For title
     * text, score needs titles.
     */
    getFromScore(score: ChantScore): TextElement | null | undefined;
  }
  
  export class Titles {
    constructor(
      ctxt: ChantContext,
      score: ChantScore,
      titles?: {
        supertitle?: string;
        title?: string;
        subtitle?: string;
        textLeft?: string;
        textRight?: string;
      }
    );
    score: ChantScore;
    // each is null when the score doesn't have it:
    supertitle: TextElement | null;
    title: TextElement | null;
    subtitle: TextElement | null;
    textLeft: TextElement | null;
    textRight: TextElement | null;
    hasSupertitle(): boolean;
    hasTitle(): boolean;
    hasSubtitle(): boolean;
    hasTextLeft(): boolean;
    hasTextRight(): boolean;
    setSupertitle(ctxt: ChantContext, supertitle: string): void;
    setTitle(ctxt: ChantContext, title: string): void;
    setSubtitle(ctxt: ChantContext, subtitle: string): void;
    setTextLeft(ctxt: ChantContext, textLeft: string): void;
    setTextRight(ctxt: ChantContext, textRight: string): void;
    /** Lays out the titles across width, and returns their total height. */
    layoutTitles(ctxt: ChantContext, width: number): number;
    draw(ctxt: ChantContext, scale?: number): void;
    createSvgNode(ctxt: ChantContext): SVGGElement;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
  }

  export interface Language {
    syllabify(text: string): Array<Array<string>>;
    findVowelSegment(
      text: string,
      startingIndex: number
    ): { found: boolean; startIndex: number; length: number };
  }
  export interface English extends Language {
    regexLetter: RegExp;
  }
  export const language: {
    english: English;
    latin: Language;
  };
  
  export interface TextSpan {
    text: string;
    properties: { 
      newLine?: number | boolean;
      "font-weight"?: string;
      "font-style"?: string;
      "text-decoration"?: string;
      "font-variant"?: string;
      "font-variant-caps"?: string;
      "font-feature-settings"?: string;
      "-webkit-font-feature-settings"?: string;
    };
    activeTags: string[];
    index: number;
    clone: () => TextSpan;
  }

  export type AnnotationSpansToTextLeftMapper = (spans: TextSpan[]) => TextSpan[];
  /**
   * A score with titles.  A score made without a ChantContext, or a later page
   * from paginate(), has none.
   */
  export type ScoreWithTitles = ChantScore & { titles: Titles };

  interface TextType<Score = ChantScore> {
    display: string;
    /** this type's key in TextTypes (set when exsurge loads) */
    key: keyof TextTypes;
    /** the class of this type's svg text elements; defaults to the key */
    cssClass: string;

    defaultSize(size: number): number;
    containedInScore(score: Score): boolean;
    /**
     * Returns the element in score that matches elem, a text element of this
     * type (e.g. from before the score was updated), or null or undefined if
     * there isn't one.
     */
    getFromScore(
      score: Score,
      elem: TextElement
    ): TextElement | null | undefined;
  }

  /** a text type that a score has at most one of, so elem isn't needed */
  interface SingleTextType<Score = ChantScore> extends TextType<Score> {
    getFromScore(score: Score, elem?: TextElement): TextElement | null;
  }

  interface TextTypeWithSvgElem<Score = ChantScore> {
    /** Returns the element in score that elem, an svg text element, shows. */
    getFromSvgElem(
      score: Score,
      elem: Element
    ): TextElement | null | undefined;
  }

  export enum TextMeasuringStrategy {
    Svg,
    Canvas,
    /**
     * also used font fontkit
     */
    OpenTypeJS
  }

  export class Annotations {
    constructor(ctxt: ChantContext, ...texts: string[]);
    recalculateMetrics(ctxt: ChantContext): void;
  }

  class ChantMapping {
    source: string;
    notations: ChantNotation[];
    sourceIndex: number;
  }

  export class Gabc {
    static createMappingsFromSource(
      ctxt: ChantContext,
      gabcSource: string
    ): ChantMapping[];
    /**
     * Updates mappings in place to match newGabcSource, and returns the length
     * of newGabcSource's header.
     */
    static updateMappingsFromSource(
      ctxt: ChantContext,
      mappings: ChantMapping[],
      newGabcSource: string,
      insertionIndex?: number,
      oldInsertionIndex?: number
    ): number;
  }

  interface GabcHeaderMembers {
    /** the text of the header, through the %% line */
    original: string;
    /** the header's comment lines, by line number */
    comments: string[];
    /** the values of commented-out header lines ("%name: value;") */
    cValues: { [key: string]: string };
    toString(): string;
  }
  /**
   * A gabc header.  Each field is set under its gabc name (e.g. "office-part")
   * and, if different, its camelCase name (e.g. "officePart").  A field that
   * appears more than once also gets an array of all its values, e.g.
   * "commentaryArray".  Fields that aren't in the header are undefined.
   *
   * This is an intersection rather than a class so that the index signatures
   * don't have to allow the types of the members above.
   */
  export type GabcHeader = GabcHeaderMembers & {
    [key: `${string}Array`]: string[] | undefined;
  } & {
    [key: string]: string | undefined;
  };
  export const GabcHeader: {
    new (text?: string): GabcHeader;
    getLength(gabc: string): number;
  };

  export interface SvgTreeNode {
    name?: string;
    props?: {
      [key: string]: any;
    };
    /** strings are text content, e.g. of a tspan */
    children: Array<SvgTreeNode | string>;
  }

  export class ChantScore {
    constructor(
      ctxt?: ChantContext,
      mappings?: ChantMapping[],
      useDropCap?: boolean
    );

    mappings: ChantMapping[];
    lines: ChantLine[];
    staffLineCount: number;
    /**
     * Every element of the score, in order (the notes of each neume, plus the
     * other notations such as dividers and clefs).  Set by updateNotations().
     */
    notes: Array<Note | ChantNotationElement>;
    notations: ChantNotation[];
    hasLyrics: boolean;
    hasAboveLinesText: boolean;
    hasTranslations: boolean;
    titles?: Titles;
    startingClef: Clef;
    useDropCap: boolean;
    dropCap: DropCap;
    annotation: Annotation | null;
    compiled: boolean;
    autoColoring: boolean;
    needsLayout: boolean;
    extendLastSystemStaffLines: boolean;
    bounds: Rect;
    /**
     * Not read by exsurge; available for clients to track whether they need
     * to pass `force` to performLayout().
     */
    forceLayout?: boolean;
    pages: ChantScore[];
    selection?: Selection;
    copyLines(startLine: number, endLine: number): ChantScore;
    updateSelection(selection: Selection): void;
    /**
     * @param zoom a nonzero number sets the width to zoom times the score's
     * width and leaves out the height (0 makes the width 0 and keeps the
     * height); `true` leaves out both, so that the svg fills its container.
     */
    createSvgTree(ctxt: ChantContext, zoom?: number | boolean): SvgTreeNode;
    createSvgNode(ctxt: ChantContext): SVGSVGElement;
    createSvg(ctxt: ChantContext): string;
    createSvgNodeForEachLine(ctxt: ChantContext): SVGSVGElement[];
    createSvgForEachLine(ctxt: ChantContext): string;
    getSvgProps(
      ctxt: ChantContext,
      zoom?: number | boolean
    ): { [attribute: string]: string | number | undefined };
    draw(ctxt: ChantContext, scale?: number): void;
    recreateDropCap(ctxt: ChantContext): void;
    updateNotations(ctxt: ChantContext): void;
    performLayout(ctxt: ChantContext, forceLayout?: boolean): void;
    /**
     * Lays out the notations a few at a time, so as not to block the UI
     * thread, then calls finishedCallback.  Waits first for the lyric font
     * (see waitForLyricFont()).
     */
    performLayoutAsync(ctxt: ChantContext, finishedCallback?: () => void): void;
    /**
     * Calls ready() once the lyric font gives a sane hyphen width, or after
     * at most ctxt.fontLoadTimeout milliseconds.
     */
    waitForLyricFont(ctxt: ChantContext, ready: () => void): void;
    layoutChantLines(
      ctxt: ChantContext,
      width: number,
      finishedCallback?: (score: ChantScore) => void
    ): void;
    paginate(height: number): void;
  }

  export const QuickSvg: {
    react: any;
  };

  export interface TextTypes {
    supertitle: SingleTextType<ScoreWithTitles>;
    title: SingleTextType<ScoreWithTitles>;
    subtitle: SingleTextType<ScoreWithTitles>;
    leftRight: TextType<ScoreWithTitles> & TextTypeWithSvgElem<ScoreWithTitles>;
    annotation: TextType & TextTypeWithSvgElem;
    dropCap: SingleTextType;
    al: TextType & TextTypeWithSvgElem;
    choralSign: Omit<TextType, "defaultSize"> & {
      /** choral signs are sized relative to the staff, not the lyrics */
      size(ctxt: ChantContext): number;
    };
    lyric: TextType & TextTypeWithSvgElem;
    translation: TextType & TextTypeWithSvgElem;
  }

  export interface TextStyle {
    size: number;
    font: string;
    color?: string;
    /**
     * Currently only used on lyrics, translations, and above lines text
     * Defaults to 1.1
     */
    lineHeight?: number;
    /**
     * Markup put before every text of this type, e.g. "<i>" (the default for
     * above lines text and translations).
     */
    prefix?: string;
  }

  export interface TextStyleWithAlignment {
    alignment?: string;
  }
  export interface TextStyleWithPadding {
    /** A multiplier of the default padding.  Unset or 0 means 1. */
    padding?: number;
  }
  export interface TextStyleWithStaffPadding {
    /**
     * The minimum padding on either side, in staff intervals.  ChantContext's
     * constructor sets it to 1, and nothing falls back to 1 if it's unset.
     */
    padding: number;
  }

  export type TextTypeStyles = {
    [K in keyof TextTypes]: TextStyle;
  } & {
    supertitle: TextStyleWithAlignment & TextStyleWithPadding;
    title: TextStyleWithAlignment & TextStyleWithPadding;
    subtitle: TextStyleWithAlignment & TextStyleWithPadding;
    leftRight: TextStyleWithPadding;
    annotation: TextStyleWithStaffPadding;
    dropCap: TextStyleWithStaffPadding;
    choralSign: {
      /**
       * Has no effect: choral signs are sized by the staff (see
       * TextTypes.choralSign.size()), and setGlyphScaling() resets this.
       */
      size: number;
    };
  };

  /** a fontkit font, as far as exsurge uses one (fontkit's Font fits this) */
  interface FontkitFont {
    unitsPerEm: number;
    layout(
      text: string,
      features?: { [feature: string]: boolean }
    ): {
      advanceWidth: number;
      bbox: { minX: number; maxY: number; height: number };
    };
  }
  /** a font that exsurge can measure text with */
  type MeasuringFont = import('opentype.js').Font | FontkitFont;

  export class ChantContext {
    constructor(textMeasuringStrategy?: TextMeasuringStrategy);
    getFontFilenameForProperties: (
      properties?: {
        "font-style"?: string;
        "font-weight"?: string;
      },
      /** "{}" is replaced by Regular, Bold, Italic or BoldItalic; defaults to "{}" */
      url?: string
    ) => string;
    getFontForProperties(
      properties?: { "font-style"?: string; "font-weight"?: string },
      fontFamily?: string
    ): MeasuringFont | undefined;
    fontDictionary?: { [key: string]: MeasuringFont };

    /**
     * Each text type's size, font, color, etc.  setFont() resets the size,
     * font and color of every type.
     */
    textStyles: TextTypeStyles;
    /** The color setFont() gives every text type; defaults to "#000" */
    textColor: string;
    baseTextStyle: { [cssProp: string]: string };

    textMeasuringStrategy: TextMeasuringStrategy;
    rubricColor: string;

    specialCharProperties: { [key: string]: string };
    specialCharText?: (char: string) => string;
    textBeforeSpecialChar: string;
    textAfterSpecialChar: string;
    specialCharMap: { [key in "℣" | "℟" | "*" | "+"]: string };
    asteriskProperties: { [key: string]: string };
    plusProperties: { [key: string]: string };
    fontStyleDictionary: {
      [tag: string]: {
        [cssProp: string]: string;
      };
    };
    /** maps a markup symbol (e.g. "*") to a fontStyleDictionary tag (e.g. "b") */
    markupSymbolDictionary: { [symbol: string]: string };
    editable?: boolean;
    useExtraTextOnly: boolean;
    /** prefix for the id of each note's svg element; defaults to "note-" */
    noteIdPrefix: string;

    minLedgerSeparation: number;
    minSpaceAboveStaff: number;
    minSpaceBelowStaff: number;
    spaceBetweenSystems: number;

    minNotesLastLine: number;
    minSyllablesLastLine: number;

    glyphPunctumWidth: number;
    glyphPunctumHeight: number;

    // set by setGlyphScaling() (and so by setStaffHeight()):
    glyphMultiplier: number;
    glyphScaling: number;
    staffInterval: number;
    staffLineWeight: number;
    neumeLineWeight: number;
    dividerLineWeight: number;
    episemaLineWeight: number;
    intraNeumeSpacing: number;

    // set by updateHyphenWidth():
    hyphenWidth: number;
    minLyricWordSpacing: number;
    /**
     * minLyricWordSpacing / hyphenWidth, as of the last hyphen that had a
     * width; updateHyphenWidth() keeps minLyricWordSpacing at this ratio.  It
     * recomputes this from minLyricWordSpacing, so set that instead.
     */
    readonly minLyricWordSpacingRatio?: number;

    maxExtraSpaceInStaffIntervals: number;

    activeClef: Clef;

    neumeLineColor: string;
    staffLineColor: string;
    dividerLineColor: string;
    negativeFillColor: string;

    defaultLanguage: ExsurgeLanguage;

    pixelRatio: number;

    svgTextMeasurer?: SVGElement;
    // set by makeCanvasIfNeeded():
    canvas?: HTMLCanvasElement;
    canvasCtxt?: CanvasRenderingContext2D;

    syllableConnector: string;

    /**
     * How long ChantScore.performLayoutAsync() waits, in milliseconds, for a
     * lyric font that seems not to have loaded yet before laying out anyway.
     * Defaults to 3000.
     */
    fontLoadTimeout: number;

    scaleDefs: boolean;

    interSyllabicMultiplier: number;

    accidentalSpaceMultiplier: number;

    interVerbalMultiplier: number;

    drawGuides: boolean;
    drawDebuggingBounds: boolean;

    currNotationIndex: number;

    condensingTolerance: number;

    autoColor: boolean;
    staffLineCount: number;

    convertStaffPositionToSymmetric(staffPosition: number): number;
    convertSymmetricStaffPosition(staffPositionSymmetric: number): number;
    setFont(
      font: string,
      size?: number,
      baseStyle?: any,
      fontDictionary?: { [key: string]: MeasuringFont }
    ): void;
    setRubricColor(color: string): void;
    /**
     * Forgets the text measurements and merged text span styles kept to speed
     * up layout.  Call it after changing fontStyleDictionary,
     * specialCharProperties, asteriskProperties or plusProperties directly once
     * text has been created, or after a font has loaded that document.fonts
     * doesn't know about.
     */
    clearTextCache(): void;
    setMergeAnnotationWithTextLeft(merge: boolean): void;
    setScaleDefs(scaleDefs: boolean): void;
    createStyleCss(): string;
    createStyleNode(): SVGStyleElement;
    createStyleTree(): { name: "style"; props: {}; children: [string] };
    createStyle(): string;
    updateHyphenWidth(): void;
    setStaffHeight(staffHeight: number, glyphMultiplier?: number): void;
    setGlyphScaling(glyphScaling: number, glyphMultiplier?: number): void;
    calculateHeightFromStaffPosition(staffPosition: number): number;
    insertFontsInDoc(): void;
    findNextNeume(): ChantNotationElement;
    makeCanvasIfNeeded(): void;
    setCanvasSize(width: number, height: number, scale?: number): void;
    mapAnnotationSpansToTextLeft?: AnnotationSpansToTextLeftMapper;
    /**
     * Joins the annotation's spans (one array per annotation) and the spans of
     * the left text.  Set by setMergeAnnotationWithTextLeft().
     */
    mergeAnnotationWithTextLeft?: (
      ...spans: Array<TextSpan[] | undefined>
    ) => TextSpan[];
  }

  export const TextTypes: TextTypes;

  export interface ElementSelection {
    indices: number[];
    insertion?: {
      afterElementIndex?: number;
      chantLine?: number;
    };
  }
  export interface Selection {
    element?: ElementSelection;
  }
  

  export const greextraGlyphs: {
    MedicaeaFlat: string;
    HufnagelCustosUpShort: string;
    HufnagelCustosUpLong: string;
    HufnagelCustosUpMedium: string;
    HufnagelCustosDownShort: string;
    HufnagelCustosDownLong: string;
    HufnagelCustosDownMedium: string;
    MedicaeaCustosUpShort: string;
    MedicaeaCustosUpLong: string;
    MedicaeaCustosUpMedium: string;
    MedicaeaCustosDownShort: string;
    MedicaeaCustosDownLong: string;
    MedicaeaCustosDownMedium: string;
    MensuralCustosUpShort: string;
    MensuralCustosUpLong: string;
    MensuralCustosUpMedium: string;
    MensuralCustosDownShort: string;
    MensuralCustosDownLong: string;
    MensuralCustosDownMedium: string;
    MensuralFlat: string;
    HufnagelFlat: string;
    MedicaeaCClef: string;
    MedicaeaCClefChange: string;
    MedicaeaFClef: string;
    MedicaeaFClefChange: string;
    HufnagelCClef: string;
    HufnagelCClefChange: string;
    HufnagelFClef: string;
    HufnagelFClefChange: string;
    HugnagelCFClef: string;
    HufnagelCFClefChange: string;
    MensuralFlatHole: string;
    HufnagelFlatHole: string;
    MedicaeaFlatHole: string;
    StarSix: string;
    Dagger: string;
    "Bar.alt": string;
    StarHeight: string;
    Cross: string;
    "RBar.alt": string;
    "VBar.alt": string;
    Drawing1: string;
    Drawing2: string;
    RWithBarGoth: string;
    VWithBarGoth: string;
    Line1: string;
    Line2: string;
    Line3: string;
    Line4: string;
    Line5: string;
    "Cross.alt": string;
    ABarCaption: string;
    RBarCaption: string;
    VBarCaption: string;
    ABarCaptionSC: string;
    RBarCaptionSC: string;
    VBarCaptionSC: string;
    ABar: string;
    RBar: string;
    VBar: string;
    ABarSC: string;
    RBarSC: string;
    VBarSC: string;
    ABarSmall: string;
    RBarSmall: string;
    VBarSmall: string;
    ABarSmallSC: string;
    RBarSmallSC: string;
    VBarSmallSC: string;
    "RBar.alt2": string;
    "VBar.alt2": string;
    ABarCaptionSlant: string;
    RBarCaptionSlant: string;
    VBarCaptionSlant: string;
    ABarSlant: string;
    RBarSlant: string;
    VBarSlant: string;
    ABarSmallSlant: string;
    RBarSmallSlant: string;
    VBarSmallSlant: string;
  }
}

// export const TextTypesByClass = {};
// Object.entries(TextTypes).forEach(([key, entry]) => {
//   let cssClass = (entry.cssClass = entry.cssClass || key);
//   entry.key = key;
//   TextTypesByClass[cssClass] = entry;
// });
//
// export const DefaultTrailingSpace = ctxt =>
//   ctxt.intraNeumeSpacing * ctxt.interSyllabicMultiplier;
// DefaultTrailingSpace.isDefault = true;
