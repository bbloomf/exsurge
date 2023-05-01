declare module "exsurge" {
  // TODO: Add types for these:
  type ChantNotation = unknown;
  type ChantLine = unknown;
  type Note = unknown;
  type Titles = unknown;
  type Clef = unknown;
  type DropCap = unknown;
  type Annotation = unknown;
  type Rect = unknown;
  type ExsurgeLanguage = unknown;
  type ChantNotationElement = unknown;


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
    OpenTypeJS,
  }

  export class Annotations {
    constructor(ctxt: ChantContext, ...string);
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

  export interface SvgTreeNode {
    name?: string;
    props?: {
      [key: string]: any;
    };
    children: SvgTreeNode[];
  }

  export class ChantScore {
    constructor(ctxt: ChantContext);

    mappings: ChantMapping[];
    lines: ChantLine[];
    notes: Note;
    titles?: Titles;
    startingClef: Clef;
    useDropCap: boolean;
    dropCap: DropCap;
    annotation: Annotation;
    compiled: boolean;
    autoColoring: boolean;
    needsLayout: boolean;
    bounds: Rect;
    forceLayout: boolean;
    pages: ChantScore[];
    updateSelection(selection: Selection);
    createSvgTree(ctxt: ChantContext, zoom?: number): SvgTreeNode;
    recreateDropCap(ctxt: ChantContext): void;
    updateNotations(ctxt: ChantContext): void;
    performLayout(ctxt: ChantContext, forceLayout: boolean): void;
    layoutChantLines(ctxt: ChantContext, width: number): void;
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
  }

  export interface TextStyleWithAlignment {
    alignment?: string;
  }
  export interface TextStyleWithPadding {
    padding?: number;
  }

  export type TextTypeStyles = {
    [K in keyof TextTypes]: TextStyle;
  } & {
    supertitle: TextStyleWithAlignment;
    title: TextStyleWithAlignment;
    subtitle: TextStyleWithAlignment;
    annotation: TextStyleWithPadding;
    dropCap: TextStyleWithPadding;
  };

  export class ChantContext {
    constructor(textMeasuringStrategy?: TextMeasuringStrategy);

    textStyles: TextTypeStyles;

    textMeasuringStrategy: TextMeasuringStrategy;
    lyricTextColor: string;
    setFont(font: string, size: number): any;
    rubricColor: string;
    
    specialCharProperties: { [key: string]: string; };
    specialCharText?: (char: string) => string;
    textBeforeSpecialChar: string;
    textAfterSpecialChar: string;
    specialCharMap: { [key in '℣'|'℟'|'*'|'+']: string; };
    asteriskProperties: { [key: string]: string; };
    plusProperties: { [key: string]: string; };
    fontStyleDictionary: {
      [tag: string]: {
        [cssProp: string]: string;
      };
    };
    editable: boolean;
    useExtraTextOnly: boolean;

    alTextStyle: string;
    translationTextStyle: string;

    dropCapPadding: number;

    annotationPadding: number;

    minLedgerSeparation: number;
    minSpaceAboveStaff: number;
    minSpaceBelowStaff: number;
    spaceBetweenSystems: number;

    minNotesLastLine: number;
    minSyllablesLastLine: number;

    glyphPunctumWidth: number;
    glyphPunctumHeight: number;

    maxExtraSpaceInStaffIntervals: number;

    activeClef: Clef;

    neumeLineColor: string;
    staffLineColor: string;
    dividerLineColor: string;

    defaultLanguage: ExsurgeLanguage;

    pixelRatio: number;

    svgTextMeasurer?: SVGElement;

    syllableConnector: string;

    scaleDefs: boolean;

    interSyllabicMultiplier: number;

    accidentalSpaceMultiplier: number;

    interVerbalMultiplier: number;

    drawGuides: boolean;
    drawDebuggingBounds: boolean;

    currNotationIndex: number;

    condensingTolerance: number;

    autoColor: boolean;

    setFont(
      font: string,
      size: number,
      baseStyle: any,
      opentypeFontDictionary: any
    ): void;
    setRubricColor(color: string): void;
    setMergeAnnotationWithTextLeft(merge: boolean): void;
    setScaleDefs(scaleDefs: boolean);
    createStyleCss(): string;
    createStyleNode(): HTMLOrSVGElement;
    createStyleReact(): any;
    createStyle(): string;
    updateHyphenWidth(): void;
    setStaffHeight(staffHeight: number): void;
    setGlyphScaling(glyphScaling: number): void;
    calculateHeightFromStaffPosition(staffPosition: number): number;
    insertFontsInDoc(): void;
    findNextNeume(): ChantNotationElement;
    makeCanvasIfNeeded(): void;
    setCanvasSize(width: number, height: number, scale?: number): void;
    mapAnnotationSpansToTextLeft?: AnnotationSpansToTextLeftMapper;
    mergeAnnotationWithTextLeft?: (...annotationSpan: TextSpan[]) => TextSpan[];
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
