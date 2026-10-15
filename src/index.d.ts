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
  
  export interface Titles {
    score: ChantScore;
    setSupertitle(ctxt: ChantContext, supertitle: string): Supertitle;
    setTitle(ctxt: ChantContext, title: string): Title;
    setSubtitle(ctxt: ChantContext, subtitle: string): Subtitle;
    setTextLeft(ctxt: ChantContext, textLeft: string): TextLeft;
    setTextRight(ctxt: ChantContext, textRight: string): TextRight;
  };

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
  interface TextType {
    display: string;

    defaultSize(size: number): number;
    containedInScore(score: ChantScore): boolean;
    getFromScore(score: ChantScore): string;
  }

  interface TextTypeWithCssClass {
    cssClass: string;
  }

  interface TextTypeWithSvgElem {
    getFromSvgElem(score: any, elem: any): any;
  }

  interface TextTypeWithSvgAndCss {
    TextTypeWithSvgElem;
    TextTypeWithCssClass;
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
    constructor(ctxt: ChantContext, ...string);
    recalculateMetrics(ctxt: ChantContext): void;
  }

  class ChantMapping {
    source: string;
    notations: ChantNotation[];
    sourceIndex: number;
  }

  export class Gabc {
    static createMappingsFromSource(ctxt: ChantContext, gabcSource: string);
    static updateMappingsFromSource(
      ctxt: ChantContext,
      mappings: ChantMapping[],
      newGabcSource: string,
      insertionIndex?: number,
      oldInsertionIndex?: number
    );
  }

  export class GabcHeader {
    static getLength(gabc: string): number;
    constructor(text: string);
    toString(): string;
    [key: `${string}Array`]: string[];
    [key: string]: string;
  }

  export interface SvgTreeNode {
    name?: string;
    props?: {
      [key: string]: any;
    };
    children: SvgTreeNode[];
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
    forceLayout: boolean;
    pages: ChantScore[];
    selection?: Selection;
    copyLines(startLine: number, endLine: number): ChantScore;
    updateSelection(selection: Selection): void;
    /**
     * @param zoom a number sets the width to zoom times the score's width and
     * leaves out the height; `true` leaves out both, so that the svg fills its
     * container.
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
    initializeLayout(ctxt: ChantContext): void;
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
    layoutElementsAsync(
      ctxt: ChantContext,
      index: number,
      finishedCallback?: () => void
    ): void;
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
    supertitle: TextType;
    title: TextType;
    subtitle: TextType;
    leftRight: TextType & TextTypeWithSvgAndCss;
    annotation: TextType;
    dropCap: TextType;
    al: TextType & TextTypeWithSvgAndCss;
    choralSign: TextType;
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
    /**
     * For the drop cap and annotation, the minimum padding on either side, in
     * staff intervals (defaults to 1).  For titles and left/right text, a
     * multiplier of the default padding (defaults to 1).
     */
    padding?: number;
  }

  export type TextTypeStyles = {
    [K in keyof TextTypes]: TextStyle;
  } & {
    supertitle: TextStyleWithAlignment & TextStyleWithPadding;
    title: TextStyleWithAlignment & TextStyleWithPadding;
    subtitle: TextStyleWithAlignment & TextStyleWithPadding;
    leftRight: TextStyleWithPadding;
    annotation: TextStyleWithPadding;
    dropCap: TextStyleWithPadding;
  };

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
    ): import('opentype.js').Font | undefined;
    fontDictionary?: { [key: string]: import('opentype.js').Font };

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
    editable: boolean;
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
      fontDictionary?: { [key: string]: import('opentype.js').Font }
    ): void;
    setRubricColor(color: string): void;
    setMergeAnnotationWithTextLeft(merge: boolean): void;
    setScaleDefs(scaleDefs: boolean): void;
    createStyleCss(): string;
    createStyleNode(): HTMLOrSVGElement;
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
