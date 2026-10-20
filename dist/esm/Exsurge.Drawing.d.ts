import { Point, Rect } from "./Exsurge.Core.js";
import { type Glyph } from "./Exsurge.Glyphs.js";
import { type Language } from "./Exsurge.Text.js";
import type { ChantLine } from "./Exsurge.Chant.ChantLine.js";
import type { ChantMapping, ChantScore, Clef, Note } from "./Exsurge.Chant.js";
import type { BracePoint } from "./Exsurge.Chant.Markings.js";
import type { Neume } from "./Exsurge.Chant.Neumes.js";
import type { Titles } from "./Exsurge.Titles.js";
/** the css properties of text that choose which face of a font it is in */
export interface FontStyleProperties {
    "font-style"?: string;
    "font-weight"?: string;
}
/** css properties of text, by name */
export interface CssProperties {
    [property: string]: string;
}
/** a fontkit font, as far as exsurge uses one (fontkit's Font fits this) */
export interface FontkitFont {
    unitsPerEm: number;
    layout(text: string, features?: {
        [feature: string]: boolean;
    }): {
        advanceWidth: number;
        bbox: {
            minX: number;
            maxY: number;
            height: number;
        };
    };
}
/** options for laying out text with an opentype.js font */
export interface OpenTypeRenderOptions {
    features?: {
        [feature: string]: boolean;
    };
}
/** an opentype.js font, as far as exsurge uses one (opentype.js's Font fits this) */
export interface OpenTypeFont {
    getPath(text: string, x: number, y: number, fontSize: number, options?: OpenTypeRenderOptions): {
        getBoundingBox(): OpenTypeBoundingBox;
    };
    getAdvanceWidth(text: string, fontSize?: number, options?: OpenTypeRenderOptions): number;
}
export interface OpenTypeBoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
/** a font that exsurge can measure text with */
export type MeasuringFont = OpenTypeFont | FontkitFont;
/**
 * Fonts to measure text in.  Each font is found by its family, with "{}" in
 * the family replaced by Regular, Bold, Italic or BoldItalic, falling back to
 * the font under Regular.
 */
export interface FontDictionary {
    [key: string]: MeasuringFont;
}
/** the metrics of text laid out in a fontkit font, in font units */
interface FontkitMetrics {
    advanceWidth: number;
    bbox: {
        minX: number;
        maxY: number;
        height: number;
    };
}
/** the metrics of text drawn in an opentype.js font */
interface OpenTypeMetrics {
    advanceWidth: number;
    bbox: OpenTypeBoundingBox;
}
export declare const MarkingPositionHint: {
    readonly Default: 0;
    readonly Above: 1;
    readonly Below: 2;
};
export type MarkingPositionHint = (typeof MarkingPositionHint)[keyof typeof MarkingPositionHint];
/**
 * A score with titles.  A score made without a ChantContext, or a later page
 * from paginate(), has none.
 */
export type ScoreWithTitles = ChantScore & {
    titles: Titles;
};
/** a kind of text in a score, and its defaults */
export interface TextType<Score = ChantScore> {
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
    getFromScore(score: Score, elem: TextElement): TextElement | null | undefined;
}
/** a text type that a score has at most one of, so elem isn't needed */
export interface SingleTextType<Score = ChantScore> extends TextType<Score> {
    getFromScore(score: Score, elem?: TextElement): TextElement | null;
}
export interface TextTypeWithSvgElem<Score = ChantScore> {
    /** Returns the element in score that elem, an svg text element, shows. */
    getFromSvgElem(score: Score, elem: Element): TextElement | null | undefined;
}
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
export declare const TextTypes: TextTypes;
export declare const TextTypesByClass: {
    [cssClass: string]: TextTypes[keyof TextTypes];
};
/**
 * how much space to leave after a notation: a width, or a function of the
 * context.  A function's isDefault is set if it is DefaultTrailingSpace.
 */
export type TrailingSpace = number | TrailingSpaceFunction;
export type TrailingSpaceFunction = ((ctxt: ChantContext) => number) & {
    isDefault?: boolean;
};
export declare const DefaultTrailingSpace: TrailingSpaceFunction;
export declare const GlyphCode: {
    readonly None: "None";
    readonly AcuteAccent: "AcuteAccent";
    readonly GraveAccent: "GraveAccent";
    readonly Circle: "Circle";
    readonly Semicircle: "Semicircle";
    readonly ReversedSemicircle: "ReversedSemicircle";
    readonly Stropha: "Stropha";
    readonly StrophaLiquescent: "StrophaLiquescent";
    readonly BeginningAscLiquescent: "BeginningAscLiquescent";
    readonly BeginningDesLiquescent: "BeginningDesLiquescent";
    readonly CustosDescLong: "CustosDescLong";
    readonly CustosDescShort: "CustosDescShort";
    readonly CustosLong: "CustosLong";
    readonly CustosShort: "CustosShort";
    readonly DoClef: "DoClef";
    readonly FaClef: "FaClef";
    readonly TrebleClef: "TrebleClef";
    readonly TrebleClefSmall: "TrebleClefSmall";
    readonly ChiRhoClef: "ChiRhoClef";
    readonly ChiRhoClefSans: "ChiRhoClefSans";
    readonly Flat: "Flat";
    readonly Mora: "Mora";
    readonly Natural: "Natural";
    readonly OriscusAsc: "OriscusAsc";
    readonly OriscusDes: "OriscusDes";
    readonly OriscusLiquescent: "OriscusLiquescent";
    readonly PodatusLower: "PodatusLower";
    readonly PodatusUpper: "PodatusUpper";
    readonly PodatusLowerShort: "PodatusLowerShort";
    readonly PodatusUpperShort: "PodatusUpperShort";
    readonly Porrectus1: "Porrectus1";
    readonly Porrectus2: "Porrectus2";
    readonly Porrectus3: "Porrectus3";
    readonly Porrectus4: "Porrectus4";
    readonly PunctumCavum: "PunctumCavum";
    readonly PunctumQuadratum: "PunctumQuadratum";
    readonly PunctumQuadratumLiquescent: "PunctumQuadratumLiquescent";
    readonly PunctumQuadratumAscLiquescent: "PunctumQuadratumAscLiquescent";
    readonly PunctumQuadratumDesLiquescent: "PunctumQuadratumDesLiquescent";
    readonly PunctumInclinatum: "PunctumInclinatum";
    readonly PunctumInclinatumLiquescent: "PunctumInclinatumLiquescent";
    readonly Quilisma: "Quilisma";
    readonly Sharp: "Sharp";
    readonly TerminatingAscLiquescent: "TerminatingAscLiquescent";
    readonly TerminatingDesLiquescent: "TerminatingDesLiquescent";
    readonly VerticalEpisemaAbove: "VerticalEpisemaAbove";
    readonly VerticalEpisemaBelow: "VerticalEpisemaBelow";
    readonly VirgaLong: "VirgaLong";
    readonly VirgaShort: "VirgaShort";
    readonly Virgula: "Virgula";
    readonly UpperBrace: "UpperBrace";
};
export type GlyphCode = (typeof GlyphCode)[keyof typeof GlyphCode];
/** attributes of an svg element, by name; undefined ones are left out */
export interface SvgAttributes {
    [name: string]: any;
}
/** an svg element, with what in the score it shows (if anything) */
export type SvgElementWithSource = SVGElement & {
    source?: unknown;
};
/**
 * an svg element made by createSvgTree(), e.g. for React.  Its props are
 * camelCased, with class as className.
 */
export interface SvgTreeNode {
    name?: string;
    props?: {
        [key: string]: any;
    };
    /** strings are text content, e.g. of a tspan */
    children: Array<SvgTreeNode | string>;
}
/** the svg element made by QuickSvg.svg() */
export type QuickSvgRoot = SVGSVGElement & {
    defs: SVGDefsElement;
    clearNotations(): void;
};
export declare const QuickSvg: {
    ns: "http://www.w3.org/2000/svg";
    xmlns: string;
    xlink: string;
    hasDOMAccess: () => boolean;
    svg: (width: number, height: number) => QuickSvgRoot;
    rect: (width: number, height: number) => SVGRectElement;
    line: (x1: number, y1: number, x2: number, y2: number) => SVGLineElement;
    g: () => SVGGElement;
    text: () => SVGTextElement;
    tspan: (str: string) => SVGTSpanElement;
    use: (nodeRef: string) => SVGUseElement;
    svgFragmentForGlyph: (glyph: Glyph, negativeFillColor?: string) => string;
    nodesForGlyph: <F extends "createNode" | "createSvgTree" = "createNode">(glyph: Glyph, functionName?: F, negativeFillColor?: string) => Array<F extends "createSvgTree" ? SvgTreeNode : SvgElementWithSource>;
    createNode: (name: string, attributes?: SvgAttributes | null, children?: string | Node | Node[]) => SvgElementWithSource;
    createSvgTree(name: string, props: SvgAttributes, ...children: Array<SvgTreeNode | string | Array<SvgTreeNode | string>>): SvgTreeNode;
    createFragment: (name: string, attributes?: SvgAttributes | null, child?: string | null) => string;
    parseFragment: (fragment: string) => SVGGElement | undefined;
    translate: (node: Element, x: number, y: number) => Element;
    scale: (node: Element, sx: number, sy: number) => Element;
};
export declare const TextMeasuringStrategy: {
    readonly Svg: 0;
    readonly Canvas: 1;
    /** also used for fontkit */
    readonly OpenTypeJS: 2;
};
export type TextMeasuringStrategy = (typeof TextMeasuringStrategy)[keyof typeof TextMeasuringStrategy];
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
export type AnnotationSpansToTextLeftMapper = (spans: TextSpan[]) => TextSpan[];
/** remakes a glyph's def in ChantContext.defs (and defsNode) at the current scale */
export type MakeDef = (() => void) & {
    /** the def as an svg tree */
    makeSvgTree(): SvgTreeNode;
    glyphCode: GlyphCode;
};
export declare class ChantContext {
    /** the fonts to measure text in, with TextMeasuringStrategy.OpenTypeJS */
    fontDictionary?: FontDictionary;
    staffLineCount: number;
    textMeasuringStrategy: TextMeasuringStrategy;
    getFontFilenameForProperties: (properties?: FontStyleProperties, 
    /** "{}" is replaced by Regular, Bold, Italic or BoldItalic; defaults to "{}" */
    url?: string) => string;
    /** the svg source of the def of each glyph used so far, by glyph code */
    defs: {
        [glyphCode: string]: string;
    };
    /** remakes each def in defs (and defsNode), e.g. when the scale changes */
    makeDefs: MakeDef[];
    /** the defs as svg DOM nodes, when there's a DOM */
    defsNode?: SvgElementWithSource;
    /**
     * Each text type's size, font, color, etc.  setFont() resets the size,
     * font and color of every type.
     */
    textStyles: TextTypeStyles;
    /** The color setFont() gives every text type; defaults to "#000" */
    textColor: string;
    baseTextStyle: CssProperties;
    rubricColor: string;
    specialCharProperties: CssProperties;
    specialCharText: (char: string) => string;
    textBeforeSpecialChar: string;
    textAfterSpecialChar: string;
    /** what each of "℣", "℟", "*" and "+" is shown as */
    specialCharMap: {
        [char: string]: string;
    };
    asteriskProperties: CssProperties;
    plusProperties: CssProperties;
    fontStyleDictionary: {
        [tag: string]: CssProperties;
    };
    /** maps a markup symbol (e.g. "*") to a fontStyleDictionary tag (e.g. "b") */
    markupSymbolDictionary: {
        [symbol: string]: string;
    };
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
    glyphMultiplier: number;
    glyphScaling: number;
    staffInterval: number;
    staffLineWeight: number;
    neumeLineWeight: number;
    dividerLineWeight: number;
    episemaLineWeight: number;
    intraNeumeSpacing: number;
    hyphenWidth: number;
    minLyricWordSpacing: number;
    /**
     * minLyricWordSpacing / hyphenWidth, as of the last hyphen that had a
     * width; updateHyphenWidth() keeps minLyricWordSpacing at this ratio.  It
     * recomputes this from minLyricWordSpacing, so set that instead.
     */
    readonly minLyricWordSpacingRatio?: number;
    maxExtraSpaceInStaffIntervals: number;
    /** the clef in effect while gabc is parsed or a score is laid out */
    activeClef: Clef;
    /** the notations of the score being laid out */
    notations?: ChantNotationElement[];
    activeNotations: ChantNotationElement[] | null;
    /** a brace that has started, but not yet ended, in the score being laid out */
    lastStartBrace?: BracePoint;
    neumeLineColor: string;
    staffLineColor: string;
    dividerLineColor: string;
    negativeFillColor: string;
    defaultLanguage: Language;
    pixelRatio: number;
    svgTextMeasurer?: QuickSvgRoot;
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
    /** gives each svg text element a font-size attribute in createSvg() */
    setFontFamilyAttributes?: boolean;
    /**
     * starts the lines of text-only syllables after the last lyric on the
     * line, rather than at the start of the line
     */
    startExtraTextOnlyFromFirst?: boolean;
    mapAnnotationSpansToTextLeft?: AnnotationSpansToTextLeftMapper;
    /**
     * Joins the annotation's spans (one array per annotation) and the spans of
     * the left text.  Set by setMergeAnnotationWithTextLeft().
     */
    mergeAnnotationWithTextLeft?: (...spans: Array<TextSpan[] | null | undefined>) => TextSpan[];
    private textMetricsCache;
    private textMetricsCacheSize;
    private fontLoadGeneration;
    constructor(textMeasuringStrategy?: TextMeasuringStrategy);
    /**
     * convert a staff position counting from the first space below the staff (gabc notation "c")
     * into a position counting from the middle space (variable based on how many staff lines there are)
     * @param {number} staffPosition
     * @returns {number}
     */
    convertStaffPositionToSymmetric(staffPosition: number): number;
    convertSymmetricStaffPosition(staffPositionSymmetric: number): number;
    /**
     *
     * @param {*} properties
     * @param {string} fontFamily
     * @returns {import('opentype.js').Font | import('fontkit').Font | undefined}
     */
    getFontForProperties(properties?: FontStyleProperties, fontFamily?: string): MeasuringFont | undefined;
    /**
     *
     * @param {string} font : ;
     * @param {number} size
     * @param {any} baseStyle
     * @param {{ [key: string]: import('opentype.js').Font }} fontDictionary
     */
    setFont(font: string, size?: number, baseStyle?: CssProperties, fontDictionary?: FontDictionary): void;
    setRubricColor(color: string): void;
    /**
     * Forgets the text measurements and the merged text span styles that are
     * kept to speed up layout.  setFont(), setRubricColor() and the like call
     * this.  Text measured on a canvas is also measured again after
     * document.fonts fires loadingdone, and at the start of a ChantScore layout
     * once a font has been added to or removed from document.fonts; call this
     * after changing fontStyleDictionary, specialCharProperties,
     * asteriskProperties or plusProperties directly once text has been created,
     * or after any other change to the fonts that text is measured in (such as
     * replacing a face in document.fonts with another, which leaves its size
     * the same).
     */
    clearTextCache(): void;
    /**
     * Starts measuring text again if fonts have been added to or removed from
     * document.fonts since text was last measured.  ChantScore calls this at the
     * start of each layout, rather than with every measurement, since asking
     * document.fonts its size can make the browser bring its styles up to date;
     * call it before measuring text outside of a layout.
     */
    noticeFontChanges(): void;
    /**
     * @param {object} measurer what measures the text: a canvas context or a font
     * @returns {Map<string, any>} the measurements made with it so far
     */
    getTextMetricsCache(measurer: object): Map<string, any>;
    cacheTextMetrics<T>(cache: Map<string, any>, key: string, metrics: T): T;
    /**
     * measures text on this.canvasCtxt in the given CSS font, setting the
     * canvas's font only if the text hasn't been measured in that font yet
     * @param {string} font
     * @param {string} text
     * @returns {TextMetrics}
     */
    measureCanvasText(font: string, text: string): TextMetrics;
    /**
     * lays out text with a fontkit font, in font units
     * @param {import('fontkit').Font} font
     * @param {string} text
     * @param {boolean} smallCaps
     * @returns {{ advanceWidth: number, bbox: { minX: number, maxY: number, height: number } }}
     */
    layoutFontkitText(font: FontkitFont, text: string, smallCaps: boolean): FontkitMetrics;
    /**
     * measures text drawn with an opentype.js font at (x, y)
     * @param {import('opentype.js').Font} font
     * @param {string} text
     * @param {number} x
     * @param {number} y
     * @param {number} fontSize
     * @param {boolean} smallCaps
     * @returns {{ advanceWidth: number, bbox: import('opentype.js').BoundingBox }}
     */
    measureOpenTypeText(font: OpenTypeFont, text: string, x: number, y: number, fontSize: number, smallCaps: boolean): OpenTypeMetrics;
    setMergeAnnotationWithTextLeft(merge: boolean): void;
    setScaleDefs(scaleDefs: boolean): void;
    createStyleCss(): string;
    createStyleNode(): SVGStyleElement;
    createStyleTree(): {
        name: "style";
        props: Record<string, never>;
        children: [string];
    };
    createStyle(): string;
    updateHyphenWidth(): void;
    setStaffHeight(staffHeight: number, glyphMultiplier?: number): void;
    setGlyphScaling(glyphScaling: number, glyphMultiplier?: number): void;
    calculateHeightFromStaffPosition(staffPosition: number): number;
    insertFontsInDoc(): void;
    findNextNeume(): Neume | null;
    makeCanvasIfNeeded(): void;
    setCanvasSize(width: number, height: number, scale?: number): void;
}
/**
 * what a glyph is drawn for, which its svg element is marked with: a note, or a
 * notation such as a clef or custos
 */
export type GlyphSource = Note | ChantNotationElement;
export interface ChantLayoutElement {
    /** returns the element as an svg tree, e.g. for React */
    createSvgTree(ctxt: ChantContext, ...args: any[]): SvgTreeNode;
}
export declare class ChantLayoutElement {
    bounds: Rect;
    origin: Point;
    selected: boolean;
    highlighted: boolean;
    /** leaves the element out of the bounds of the notation it's added to */
    ignoreBounds?: boolean;
    constructor();
    draw(ctxt: ChantContext, ...args: any[]): void;
    createSvgNode(ctxt: ChantContext, ...args: any[]): SvgElementWithSource | SvgElementWithSource[];
    createSvgFragment(ctxt: ChantContext, ...args: any[]): string;
}
export declare class DividerLineVisualizer extends ChantLayoutElement {
    divider?: ChantNotationElement;
    constructor(ctxt: ChantContext, staffPosition0: number, staffPosition1: number, divider?: ChantNotationElement);
    draw(ctxt: ChantContext): void;
    getSvgProps(ctxt: ChantContext): SvgAttributes;
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export declare class NeumeLineVisualizer extends ChantLayoutElement {
    /**
     * @param note1 the note to draw the line to, or a staff position to draw it
     * to, or nothing to draw it to four staff positions above note0
     */
    constructor(ctxt: ChantContext, note0: Note, note1?: Note | number | null, hanging?: boolean);
    draw(ctxt: ChantContext): void;
    getSvgProps(ctxt: ChantContext): {
        x: number;
        y: number;
        width: number;
        height: number;
        fill: string;
        class: string;
    };
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export declare class NeumeBeamVisualizer extends ChantLayoutElement {
    constructor(ctxt: ChantContext, x0: number, x1: number, staffPosition0: number, staffPosition1: number, yOffset?: number);
    getPoints(ctxt: ChantContext): {
        x0: number;
        x1: number;
        y0: number;
        y1: number;
        height: number;
    };
    draw(ctxt: ChantContext): void;
    getSvgProps(ctxt: ChantContext): {
        points: string;
        fill: string;
        class: string;
    };
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export declare class VirgaLineVisualizer extends ChantLayoutElement {
    constructor(ctxt: ChantContext, note: Note);
    draw(ctxt: ChantContext): void;
    getSvgProps(ctxt: ChantContext): {
        x: number;
        y: number;
        width: number;
        height: number;
        fill: string;
        class: string;
    };
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export declare class LineaVisualizer extends ChantLayoutElement {
    constructor(ctxt: ChantContext, note: Note);
    draw(ctxt: ChantContext): void;
    getSvgProps(ctxt: ChantContext, x: number): {
        x: number;
        y: number;
        width: number;
        height: number;
        fill: string;
        class: string;
    };
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export declare class GlyphVisualizer extends ChantLayoutElement {
    glyph: Glyph;
    glyphCode: GlyphCode;
    /** for a porrectus, the staff positions its notes are apart; otherwise 0 */
    porrectusNoteDiff: number;
    align?: "left" | "right";
    constructor(ctxt: ChantContext, glyphCode?: GlyphCode | null);
    setGlyph(ctxt: ChantContext, glyphCode?: GlyphCode | null | ""): void;
    setStaffPosition(ctxt: ChantContext, staffPosition: number): void;
    draw(ctxt: ChantContext): void;
    getSvgAttributes(ctxt: ChantContext, source?: GlyphSource): SvgAttributes;
    createSvgNode(ctxt: ChantContext, source?: GlyphSource): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext, source?: GlyphSource): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext, source?: GlyphSource): string;
}
export declare class RoundBraceVisualizer extends ChantLayoutElement {
    isAbove: boolean;
    braceHeight: number;
    accent?: GlyphVisualizer;
    constructor(ctxt: ChantContext, x1: number, x2: number, y: number, isAbove: boolean);
    draw(ctxt: ChantContext): void;
    getSvgPathProps(ctxt: ChantContext): {
        d: string;
        stroke: string;
        "stroke-width": string;
        fill: string;
        class: string;
    };
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
    getPathPoints(): {
        x1: number;
        x2: number;
        y: number;
        cx1: number;
        cx2: number;
        cy: number;
    };
    generatePathString(): string;
}
export declare class CurlyBraceVisualizer extends ChantLayoutElement {
    isAbove: boolean;
    braceHeight: number;
    accent?: GlyphVisualizer;
    constructor(ctxt: ChantContext, x1: number, x2: number, y: number, isAbove?: boolean, addAcuteAccent?: boolean);
    getSvgPathProps(ctxt: ChantContext): {
        d: string;
        stroke: string;
        "stroke-width": string;
        fill: string;
        class: string;
    };
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
    generatePathString(): string;
}
/** a group of css properties of a span of text; Object.assign() skips any missing ones */
export type SpanPropertyDict = CssProperties | null | undefined;
/** a span's css properties, along with where it starts a line */
export interface TextSpanProperties {
    [property: string]: string | number | boolean | undefined;
    /** the number of line breaks before the span, or true where the text was wrapped */
    newLine?: number | boolean;
    /** how far to shift the line the span starts to the right */
    xOffset?: number;
    "font-weight"?: string;
    "font-style"?: string;
    "text-decoration"?: string;
    "font-variant"?: string;
    "font-variant-caps"?: string;
    "font-feature-settings"?: string;
    "-webkit-font-feature-settings"?: string;
}
/** a run of text in one style */
export declare class TextSpan {
    text: string;
    /** the css properties of the span, which are merged in order */
    propertyArray: SpanPropertyDict[];
    /** the markup tags (e.g. "b" or "i") that the span is in */
    activeTags: string[];
    /** where the span starts in the source text */
    index: number;
    /** how far to shift the line the span starts to the right */
    xOffset?: number;
    /** the number of line breaks before the span, or true where the text was wrapped */
    newLine?: number | boolean;
    /** where the text was wrapped before the span, the whitespace taken out */
    wrappedSpace?: string;
    /** the width to stretch or squeeze the span's text to (for connectors) */
    textLength?: number;
    private propertiesVersion?;
    private cachedProperties?;
    private cachedCss?;
    constructor(text: string, propertyArray?: SpanPropertyDict[] | null, activeTags?: string[], index?: number, extraProps?: {
        xOffset?: number;
        newLine?: number | boolean;
    });
    /**
     * the styles in propertyArray merged together, which must not be modified.
     * They're kept until the text styles change (see ChantContext.clearTextCache()),
     * since the objects in propertyArray belong to the ChantContext.
     */
    get mergedProperties(): CssProperties;
    get properties(): TextSpanProperties;
    /**
     * @returns {string} the same as getCssForProperties(this.properties)
     */
    getCss(): string;
    clone(): TextSpan;
}
/** what measureSubstring() gives with returnBBox */
export interface TextBBox {
    width: number;
    height: number;
    x: number;
    y: number;
}
interface BreakMatch {
    index: number;
    0: string;
    /** whether the line has to break here */
    forced?: boolean;
}
/** A piece of text in a score, e.g. a Lyric, Title, DropCap or Annotation. */
export declare class TextElement extends ChantLayoutElement {
    fontFamily: (ctxt: ChantContext) => string;
    fontSize: (ctxt: ChantContext) => number;
    textAnchor: string;
    sourceIndex?: number;
    /** the text as given, without its text style's prefix */
    sourceGabc?: string;
    dominantBaseline: string;
    /** the text, without its markup */
    text: string;
    /** the text, split up by style */
    spans: TextSpan[];
    textType?: TextTypes[keyof TextTypes];
    /** a lyric's drop cap, made from its first letter */
    dropCap?: DropCap | null;
    /** the width the text was wrapped to, if it was too wide */
    maxWidth?: number;
    firstLineMaxWidth?: number;
    /** whether the lines after the first are aligned to the right of the first */
    rightAligned?: boolean;
    /** how much a lyric that was too wide has been shrunk */
    resize?: number;
    numLines?: number;
    needsLayout?: boolean;
    svgNode?: SvgElementWithSource;
    elementIndex?: number;
    constructor(ctxt: ChantContext, text: string, fontFamily: (ctxt: ChantContext) => string, fontSize: (ctxt: ChantContext) => number, textAnchor: string, sourceIndex?: number, sourceGabc?: string);
    /**
     * The matching element in score (see TextType.getFromScore()).  For title
     * text, score needs titles.
     */
    getFromScore(score: ChantScore): TextElement | null | undefined;
    generateSpansFromText(ctxt: ChantContext, text: string): void;
    getCanvasFontForProperties(ctxt: ChantContext, properties?: CssProperties | TextSpanProperties): string;
    measureSubstringBBox(ctxt: ChantContext, length?: number): TextBBox;
    /**
     * if length is undefined and this.rightAligned === true, then offsets will be marked for each newLine span
     *
     * @param {ChantContext} ctxt
     * @param {number} length
     * @param {boolean} returnBBox
     * @param {boolean} lastLineOnly whether to measure only the substring's last
     * line, rather than its widest
     * @returns measured substring, as a simple width unless returnBBox == true
     */
    measureSubstring(ctxt: ChantContext, length?: number, returnBBox?: false, lastLineOnly?: boolean): number;
    measureSubstring(ctxt: ChantContext, length: number | undefined, returnBBox: true, lastLineOnly?: boolean): TextBBox;
    recalculateMetrics(ctxt: ChantContext, resetNewLines?: boolean): void;
    setMaxWidth(ctxt: ChantContext, maxWidth: number, firstLineMaxWidth?: number): void;
    /**
     * Finds the first of matches[start...end) such that the line up to it is
     * wider than max, measuring as few of them as it can.  The width of the line
     * up to a match only grows from one match to the next, so this gallops
     * forward and then searches back, rather than measuring the line up to each
     * match.
     * @param {ChantContext} ctxt
     * @param {RegExpExecArray[]} matches
     * @param {number} start
     * @param {number} max
     * @param {number} removed how many characters before the matches have been
     * taken out of the spans
     * @param {number} end
     * @returns {number} the index of that match, or end if there isn't one
     */
    findFirstMatchWiderThan(ctxt: ChantContext, matches: BreakMatch[], start: number, max: number, removed?: number, end?: number): number;
    getCssClasses(): string;
    getExtraStyleProperties(ctxt: ChantContext): CssProperties;
    static escapeForTspan(string: unknown): string;
    draw(ctxt: ChantContext): void;
    getSvgProps(): SvgAttributes;
    getSpanOptions(span: TextSpan, ctxt: ChantContext, useStyleObject?: boolean): SvgAttributes;
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export declare const LyricType: {
    readonly SingleSyllable: 0;
    readonly BeginningSyllable: 1;
    readonly MiddleSyllable: 2;
    readonly EndingSyllable: 3;
    readonly Directive: 4;
};
export type LyricType = (typeof LyricType)[keyof typeof LyricType];
/** helpers for the lyrics of a notation, one for each line of lyrics */
export declare const LyricArray: {
    getLeft: (lyricArray: Lyric[]) => number;
    getRight: (lyricArray: Lyric[], presumeConnectorNeeded?: boolean) => number;
    hasOnlyOneLyric: (lyricArray: Lyric[]) => boolean;
    indexOfLyric: (lyricArray: Lyric[]) => number;
    mergeIn: (lyricArray: Lyric[], newLyrics: Lyric[]) => void;
    mergeInArray: (lyricArray: Lyric[], notations: ChantNotationElement[]) => void;
    setNotation: (lyricArray: Lyric[], notation: ChantNotationElement) => void;
};
export declare class Lyric extends TextElement {
    textType: TextTypes["lyric"];
    sourceIndex: number;
    sourceGabc: string;
    /** the text before any of it went to make a drop cap */
    originalText: string;
    notation: ChantNotationElement;
    notations?: ChantNotationElement[];
    lyricType: LyricType;
    /** where the centering starts in the text, or -1 to center on the vowel */
    centerStartIndex: number;
    /** how many characters the lyric is centered on */
    centerLength: number;
    needsConnector: boolean;
    preventConnector: boolean;
    forceConnector?: boolean;
    /** the language that the lyric is centered for, if not the context's */
    language: Language | null;
    /** the hyphen after the lyric, when it allows one */
    connectorSpan?: TextSpan;
    connectorWidth: number;
    defaultConnectorWidth: number;
    widthWithoutConnector: number;
    vowelSegmentWidth: number;
    elidesToNext?: boolean;
    /** which line of lyrics this is */
    lyricIndex?: number;
    /** the right edge of a line of text-only syllables that starts with this lyric */
    lineWidth?: number;
    constructor(ctxt: ChantContext, text: string, lyricType?: LyricType | null | "", notation?: ChantNotationElement, notations?: ChantNotationElement[], sourceIndex?: number);
    allowsConnector(): boolean;
    setForceConnector(force: boolean): void;
    setPreventConnector(prevent: boolean): void;
    setNeedsConnector(needs?: boolean, width?: number): void;
    setConnectorWidth(width: number): void;
    getConnectorWidth(): number;
    getLeft(): number;
    getRight(): number;
    recalculateMetrics(ctxt: ChantContext, resetNewLines?: boolean): void;
    generateDropCap(ctxt: ChantContext): DropCap | null;
    getCssClasses(): string;
    getExtraStyleProperties(ctxt: ChantContext): CssProperties;
}
export declare class ChoralSign extends TextElement {
    textType: TextTypes["choralSign"];
    positionHint: MarkingPositionHint;
    note: Note;
    constructor(ctxt: ChantContext, text: string, note: Note, sourceIndex?: number);
    recalculateMetrics(ctxt: ChantContext): void;
    performLayout(ctxt: ChantContext): void;
}
export declare class AboveLinesText extends TextElement {
    /**
     * @param {String} text
     */
    textType: TextTypes["al"];
    sourceIndex: number;
    notation: ChantNotationElement;
    padding: number;
    /** which line of above-lines text this is */
    alIndex?: number;
    /** for text above a note, which note of its neume it's above */
    noteIndex?: number;
    constructor(ctxt: ChantContext, text: string, notation: ChantNotationElement | Note | null, sourceIndex?: number);
}
export declare class TranslationText extends TextElement {
    /**
     * @param {String} text
     */
    textType: TextTypes["translation"];
    sourceIndex: number;
    notation: ChantNotationElement;
    padding: number;
    /** which line of translations this is */
    translationIndex?: number;
    /** the notation a translation ends at, for one that spans several */
    endNeume?: ChantNotationElement;
    constructor(ctxt: ChantContext, text: string, notation: ChantNotationElement | null, sourceIndex?: number);
}
export declare class DropCap extends TextElement {
    /**
     * @param {String} text
     */
    textType: TextTypes["dropCap"];
    padding: number;
    constructor(ctxt: ChantContext, text: string, sourceIndex?: number);
}
export declare class TitleTextElement extends TextElement {
    /** the space after the text */
    padding: (ctxt: ChantContext) => number;
    constructor(ctxt: ChantContext, text: string, fontFamily: (ctxt: ChantContext) => string, fontSize: (ctxt: ChantContext) => number, textAnchor: string, sourceIndex?: number, sourceGabc?: string);
}
export declare class Supertitle extends TitleTextElement {
    constructor(ctxt: ChantContext, text: string, sourceIndex?: number);
}
export declare class Title extends TitleTextElement {
    constructor(ctxt: ChantContext, text: string, sourceIndex?: number);
}
export declare class Subtitle extends TitleTextElement {
    constructor(ctxt: ChantContext, text: string, sourceIndex?: number);
}
export declare class TextLeftRight extends TitleTextElement {
    extraClass: "textLeft" | "textRight";
    /** the gabc header field this text comes from */
    headerKey: string;
    constructor(ctxt: ChantContext, text: string, type: string, sourceIndex?: number);
    getCssClasses(): string;
}
export declare class Annotation extends TextElement {
    /**
     * @param {String} text
     */
    textType: TextTypes["annotation"];
    padding: number;
    constructor(ctxt: ChantContext, text: string, elementIndex?: number);
}
export declare class Annotations extends ChantLayoutElement {
    lineHeight: number;
    annotations: Annotation[];
    padding: number;
    /**
     * @param {String} text
     */
    constructor(ctxt: ChantContext, ...texts: string[]);
    updateBounds(multiplier?: number): void;
    recalculateMetrics(ctxt: ChantContext): void;
    draw(ctxt: ChantContext): void;
    createSvgNode(ctxt: ChantContext): SvgElementWithSource[];
    createSvgTree(ctxt: ChantContext): {
        children: SvgTreeNode[];
    };
    createSvgFragment(ctxt: ChantContext): string;
}
/** what was done to a neume's trailing space for a hidden soft accidental after it */
export interface SoftAccidentalShift {
    unshifted: number;
    shifted?: number;
}
/**
 * A notation in a score: a neume, clef, divider, accidental, custos, line
 * break or text with no notes.  The layout tells them apart by the flags
 * isNeume, isClef, isDivider and isAccidental.
 */
export declare class ChantNotationElement extends ChantLayoutElement {
    leadingSpace: number;
    trailingSpace: TrailingSpace;
    /** the trailing space for the current layout */
    calculatedTrailingSpace: number;
    keepWithNext: boolean;
    /** lets the line break after this notation even though it's kept with the next */
    allowLineBreakBeforeNext?: boolean;
    needsLayout: boolean;
    lyrics: Lyric[];
    alText?: AboveLinesText[];
    translationText?: TranslationText[];
    /** the ChantScore */
    score: ChantScore | null;
    /** the ChantLine */
    line: ChantLine | null;
    mapping?: ChantMapping;
    /** this notation's index in its score's notations */
    notationIndex?: number;
    /** this notation's index in its score's notes (if it isn't a neume) */
    elementIndex?: number;
    visualizers: ChantLayoutElement[];
    sourceIndex?: number;
    sourceLength?: number;
    sourceGabc?: string;
    /** whether the notation is the first of a syllable that has text */
    firstOfSyllable?: boolean;
    /** whether the notation is the first in its parentheses */
    firstOfParentheses?: boolean;
    /** whether the accidentals were reset (at a new word) just before this notation */
    resetsAccidentalsBefore?: boolean;
    /** whether the notation is in a group in braces that takes up no width */
    hasNoWidth?: boolean;
    /** the first notation of the group in braces that this notation is in */
    firstWithNoWidth?: ChantNotationElement;
    softAccidentalShift?: SoftAccidentalShift | null;
    /** the css class of the notation's svg element; defaults to its class name */
    cssClass?: string;
    isNeume?: boolean;
    isClef?: boolean;
    isDivider?: boolean;
    isAccidental?: boolean;
    /** whether the notation resets the accidentals in effect */
    resetsAccidentals?: boolean;
    /** a neume's notes */
    notes?: Note[];
    constructor();
    hasLyrics(): boolean;
    getAllLyricsLeft(): number;
    getAllLyricsRight(): number;
    addVisualizer(chantLayoutElement: ChantLayoutElement): void;
    prependVisualizer(chantLayoutElement: ChantLayoutElement): void;
    performLayout(ctxt: ChantContext): void;
    resetDependencies(): void;
    finishLayout(ctxt: ChantContext): void;
    draw(ctxt: ChantContext): void;
    getInnerSvgNodes(ctxt: ChantContext, functionName?: "createSvgNode" | "createSvgTree"): (SvgTreeNode | SvgElementWithSource)[];
    getSvgProps(): SvgAttributes;
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export {};
//# sourceMappingURL=Exsurge.Drawing.d.ts.map