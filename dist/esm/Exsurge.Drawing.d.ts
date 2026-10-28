import { Point, Rect } from "./Exsurge.Core.js";
import { type Glyph } from "./Exsurge.Glyphs.js";
import { type Language } from "./Exsurge.Text.js";
import type { ChantLine } from "./Exsurge.Chant.ChantLine.js";
import type { ChantMapping, ChantScore, Clef, Note } from "./Exsurge.Chant.js";
import type { LineBreaking } from "./Exsurge.Chant.LineBreaking.js";
import type { BracePoint, LedgerLineStart, SlurStart } from "./Exsurge.Chant.Markings.js";
import type { Neume } from "./Exsurge.Chant.Neumes.js";
import { type NabcFont, type NabcItem, type NabcLayout } from "./Exsurge.Nabc.js";
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
/**
 * GregorioTeX's dimensions for NABC (tex/gregoriotex-gsp-default.tex), in
 * staff intervals at its default staff size
 */
export declare const NabcDimensions: {
    /** a point */
    pointsPerStaffInterval: number;
    /** the room that / makes between neumes (nabcinterelementspace), and // (nabclargerspace) */
    interElementSpace: number;
    largerSpace: number;
    /** from the top line to the baseline of the NABC above the staff (abovelinesnabcraise) */
    aboveLinesRaise: number;
    /** the room that the NABC above the staff takes, above its baseline (abovelinesnabcheight) */
    aboveLinesHeight: number;
    /** from the bottom line to the baseline of the NABC below the staff (belowlinesnabcheight) */
    belowLinesHeight: number;
    /**
     * how many staff intervals above the top line notes can go before they
     * push the NABC above the staff up (additionaltopspacenabcthreshold), and
     * below the bottom line before they push the NABC below it down
     * (additionalbottomspacenabcthreshold, 2, which GregorioTeX counts from a)
     */
    aboveThreshold: number;
    belowThreshold: number;
};
export declare const DefaultTrailingSpace: TrailingSpaceFunction;
/**
 * the gabc for a space between neumes: half a space within the neume ("/0"),
 * a small space within the neume ("/!"), a small space ("/"), a medium space
 * ("//") or a large space (" ")
 */
export type NeumeSpaceCode = "/0" | "/!" | "/" | "//" | " ";
export declare const GlyphCode: {
    readonly None: "None";
    readonly Linea: "Linea";
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
    readonly Porrectus5: "Porrectus5";
    readonly PunctumCavum: "PunctumCavum";
    readonly PunctumQuadratum: "PunctumQuadratum";
    readonly PunctumQuadratumLiquescent: "PunctumQuadratumLiquescent";
    readonly PunctumQuadratumAscLiquescent: "PunctumQuadratumAscLiquescent";
    readonly PunctumQuadratumDesLiquescent: "PunctumQuadratumDesLiquescent";
    readonly PunctumInclinatum: "PunctumInclinatum";
    readonly PunctumInclinatumAscendens: "PunctumInclinatumAscendens";
    readonly PunctumInclinatumDescendens: "PunctumInclinatumDescendens";
    readonly PunctumInclinatumAuctus: "PunctumInclinatumAuctus";
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
    readonly OpenParenthesis: "OpenParenthesis";
    readonly CloseParenthesis: "CloseParenthesis";
    readonly UpperBrace: "UpperBrace";
    readonly OriscusAscCavum: "OriscusAscCavum";
    readonly OriscusDesCavum: "OriscusDesCavum";
    readonly OriscusLiquescentCavum: "OriscusLiquescentCavum";
    readonly PodatusLowerCavum: "PodatusLowerCavum";
    readonly PodatusUpperCavum: "PodatusUpperCavum";
    readonly PodatusLowerShortCavum: "PodatusLowerShortCavum";
    readonly PodatusUpperShortCavum: "PodatusUpperShortCavum";
    readonly Porrectus1Cavum: "Porrectus1Cavum";
    readonly Porrectus2Cavum: "Porrectus2Cavum";
    readonly Porrectus3Cavum: "Porrectus3Cavum";
    readonly Porrectus4Cavum: "Porrectus4Cavum";
    readonly Porrectus5Cavum: "Porrectus5Cavum";
    readonly PunctumQuadratumLiquescentCavum: "PunctumQuadratumLiquescentCavum";
    readonly PunctumQuadratumAscLiquescentCavum: "PunctumQuadratumAscLiquescentCavum";
    readonly PunctumQuadratumDesLiquescentCavum: "PunctumQuadratumDesLiquescentCavum";
    readonly PunctumInclinatumCavum: "PunctumInclinatumCavum";
    readonly PunctumInclinatumAscendensCavum: "PunctumInclinatumAscendensCavum";
    readonly PunctumInclinatumDescendensCavum: "PunctumInclinatumDescendensCavum";
    readonly PunctumInclinatumAuctusCavum: "PunctumInclinatumAuctusCavum";
    readonly PunctumInclinatumLiquescentCavum: "PunctumInclinatumLiquescentCavum";
    readonly QuilismaCavum: "QuilismaCavum";
    readonly StrophaCavum: "StrophaCavum";
    readonly StrophaLiquescentCavum: "StrophaLiquescentCavum";
    readonly TerminatingAscLiquescentCavum: "TerminatingAscLiquescentCavum";
    readonly TerminatingDesLiquescentCavum: "TerminatingDesLiquescentCavum";
};
export type GlyphCode = (typeof GlyphCode)[keyof typeof GlyphCode] | `Porrectus${number}` | `Porrectus${number}Cavum`;
/**
 * The glyph code of a porrectus's swash, falling interval staff positions (a
 * whole number for the clefs that exsurge shares with Gregorio, or with the
 * Chi-Rho clef's offsets, in thirds): Porrectus followed by the interval, to
 * three decimal places, and Cavum if it's hollow.  The swash is drawn for it
 * when it's first used.
 */
export declare function porrectusGlyphCode(interval: number, hollow?: boolean): GlyphCode;
/** the hollow form of each note glyph, for a note with a cavum (gabc r) */
export declare const CavumGlyphCode: {
    readonly [glyphCode in GlyphCode]?: GlyphCode;
};
/**
 * the glyphs of a punctum inclinatum (other than a deminutus), solid or
 * hollow, and which way each is turned: 1 as in an ascending line, -1 as in
 * a descending one, and 0 if it's upright
 */
export declare const InclinatumGlyphTurn: {
    readonly [glyphCode in GlyphCode]?: number;
};
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
     * The distance from one line to the next, in ems: between the lines of a
     * text with line breaks in it; for lyrics, translations and above lines
     * text, between the lines that ChantLine lays them out on; and, for
     * annotations, between the annotations of an Annotations.
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
/** whether the clefs at the start of lines are drawn (see ChantContext.clefVisibility) */
export type ClefVisibility = "visible" | "invisible" | "phantom";
/** how the number of a mode is written (see ChantContext.modeNumberSystem) */
export type ModeNumberSystem = "roman-majuscule" | "roman-minuscule" | "arabic";
/** where a score's drop cap is put (see ChantContext.dropCapPosition) */
export type DropCapPosition = "firsttop" | "firstbaseline" | "lastbaseline" | "lastbottom";
/** which part of a drop cap is put at its position (see ChantContext.dropCapAnchor) */
export type DropCapAnchor = "top" | "baseline" | "bottom";
/** how a ~ in the lyrics (Gregorio's lyric tie) is drawn: see ChantContext.lyricTie */
export type LyricTie = "space" | "undertie" | "overtie" | "doubletie";
/**
 * the special character (in ChantContext.specials) that a ~ in the lyrics
 * becomes, for each LyricTie but "space", as Gregorio draws its lyric ties
 * with the macros of <sp>ut</sp>, <sp>ot</sp> and <sp>dt</sp>
 */
export declare const LyricTieSpecials: {
    [tie in LyricTie]: string | null;
};
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
    /**
     * What each of Gregorio's special characters, <sp>…</sp>, is shown as, by
     * the text between the tags, for the specials that exsurge doesn't draw
     * itself (it draws the ligatures and accented vowels, A/, R/, V/ and ~).
     * A special shown as "*" or "+" is drawn as a lyric's asterisk or plus
     * would be, and one that isn't here is shown as its text.
     */
    specials: {
        [special: string]: string;
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
    /**
     * Prefix for the id of each glyph's def, which the svg's <use> elements
     * refer to; defaults to "".  A page looks an id up among all of its
     * elements, so when svgs with different staff heights, glyph multipliers
     * or negativeFillColors are inline in one page, give each context its own
     * prefix, or the later svgs draw the first one's glyphs.  Set it before
     * the first layout: the defs are made then (and remade by setStaffHeight()).
     *
     * The text styles in each svg's <style> (see createStyleCss()) apply to
     * the whole page too, so the last svg's sizes, fonts and colors would win.
     * With a prefix, each svg (and the svg text measurer) also has the class
     * defIdPrefix + "ChantScore", e.g. "score2-ChantScore", and its rules
     * apply only to svgs with that class: svg.Exsurge.score2-ChantScore .lyric
     * rather than svg.Exsurge .lyric.  (So css that overrides a text style for
     * such an svg has to be that specific too.)  Like an id, it can't have
     * whitespace.
     */
    defIdPrefix: string;
    /**
     * The number of lines of Gregorio's NABC (St. Gall or Laon neumes) in the
     * gabc, from its nabc-lines header, which Gabc.createMappingsFromSource()
     * and updateMappingsFromSource() set.  When it's more than 0, a | in the
     * notes separates gabc from NABC rather than adding a stem to an
     * inclinatum.
     */
    nabcLines: number;
    /**
     * The number of lines of lyrics that the gabc's lyric-line headers give,
     * which Gabc.createMappingsFromSource() and updateMappingsFromSource() set.
     * When it's more than 0, they take the place of the lines of lyrics after
     * the first that a | adds to a syllable with notes.
     */
    lyricLines: number;
    /**
     * The fonts to draw Gregorio's NABC with: nabcFonts[0] for its first line,
     * above the staff, and nabcFonts[1] for its second, below the staff, or
     * nabcFonts[0] for both, as with Gregorio's \gresetnabcfont.  exsurge has
     * none of its own, since Gregorio's are under the SIL Open Font License:
     * import gregall from exsurge-ts/nabc-gregall, or gresgmodern or grelaon
     * (Laon) likewise (see NabcFont).  With none, NABC isn't drawn.  Defaults
     * to [].
     */
    nabcFonts: NabcFont[];
    /**
     * The size of the NABC fonts' em, in staff intervals.  Defaults to 8pt at
     * Gregorio's default staff size, \gresetnabcfont's default.
     */
    nabcSize: number;
    /**
     * Where each NABC neume starts, as with Gregorio's \gresetnabcalignment:
     * "full", the default, with its significative letters, or "neume" with
     * the neume, its letters on the left hanging back (and the notes moving
     * over to make room for them).
     */
    nabcAlignment: "full" | "neume";
    /**
     * Whether each line of NABC is drawn, as with Gregorio's \gresetnabc:
     * "visible", the default, "invisible", taking no room, or "phantom",
     * taking its room.
     */
    nabcVisibility: ClefVisibility[];
    /**
     * Ledger lines on one side of the staff that are no more than this many
     * staff intervals apart are joined, by lengthening each of them to meet
     * halfway.  0 by default, as Gregorio never joins them (lines that overlap
     * are always drawn as one); 2 joins them as exsurge did before.
     */
    minLedgerSeparation: number;
    /**
     * Whether an episema over a note at the space below the ledger line above
     * the staff (or under one at the space above the line below it) is put
     * closer to the note where there's no ledger line there, as Gregorio does
     * with \gresetledgerlineheuristic{enable}, its default.  When it's false,
     * the episema is always placed as if there were a ledger line.
     */
    ledgerLineHeuristic: boolean;
    minSpaceAboveStaff: number;
    minSpaceBelowStaff: number;
    spaceBetweenSystems: number;
    minNotesLastLine: number;
    minSyllablesLastLine: number;
    glyphPunctumWidth: number;
    glyphPunctumHeight: number;
    /**
     * Whether puncta inclinata lean as Gregorio's do: as their gabc says (G0
     * descending, G1 ascending, G2 upright), or else the way the notes around
     * them go (see Note.automaticLeaning).  On by default; set it false to draw
     * every inclinatum upright.
     */
    inclinatumLeaning: boolean;
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
    /** Gregorio's slurs from note to note that have started, but not yet ended, in the score being laid out */
    openSlurs?: {
        above?: SlurStart;
        below?: SlurStart;
    };
    /** Gregorio's custom ledger lines from note to note that have started, but not yet ended, in the score being laid out */
    openLedgerLines?: {
        above?: LedgerLineStart;
        below?: LedgerLineStart;
    };
    neumeLineColor: string;
    staffLineColor: string;
    dividerLineColor: string;
    negativeFillColor: string;
    /**
     * whether the clef at the start of each line is drawn, as with Gregorio's
     * \gresetclef: "invisible" leaves it out, and "phantom" leaves its space
     * empty.  A change of clef within a line is drawn either way.  Defaults to
     * "visible".
     */
    clefVisibility: ClefVisibility;
    /**
     * how Gabc.applyHeader() writes the number of the mode header (1 to 8), as
     * with Gregorio's \gresetmodenumbersystem: "roman-majuscule" (VIII), the
     * default, "roman-minuscule" (viii) or "arabic" (8)
     */
    modeNumberSystem: ModeNumberSystem;
    /**
     * How many lines a score's drop cap is beside, as with Gregorio's
     * \gresetinitiallines.  1 is the default; with more, the drop cap is
     * dropped beside that many lines, which all start after it.  0 leaves the
     * drop cap out, as ChantScore.useDropCap false does: a score has a drop cap
     * only with useDropCap as well, and a change to or from 0 takes effect, as
     * one to useDropCap does, when the score makes its drop cap again
     * (updateNotations() or recreateDropCap()); other changes take effect, as
     * ones to the spacing do, when its lines are laid out again
     * (ChantScore.layoutChantLines()).  What isn't a whole number from 0 up
     * counts as 1.  A drop cap beside more than one line, with its baseline at
     * the last one's lyric baseline or its top at the first one's top staff
     * line, is made just big enough for its letter to reach from the one to the
     * other, unless textStyles.dropCap.size has been set since setFont().
     */
    dropCapLines: number;
    /**
     * Where the drop cap goes, as with Gregorio's \gresetinitialposition: the
     * top staff line of the first line ("firsttop"), the lyric baseline of the
     * first line ("firstbaseline") or of the last line beside the drop cap
     * ("lastbaseline", the default, which anything else counts as), or the
     * bottom of that last line, below its lyrics and translations
     * ("lastbottom").  dropCapAnchor says which part of the drop cap goes there.
     */
    dropCapPosition: DropCapPosition;
    /**
     * Which part of the drop cap goes at dropCapPosition, as with Gregorio's
     * \gresetinitialanchor: the top of its letter, its baseline (the default,
     * which anything else counts as) or the bottom of its letter.
     */
    dropCapAnchor: DropCapAnchor;
    defaultLanguage: Language;
    /**
     * What each lyric is centered under its notation on, as Gregorio's
     * \gresetlyriccentering: "vowel" (the default) centers it on its vowel
     * segment, found by its language's rules (see defaultLanguage); "syllable"
     * on the whole syllable; and "firstletter" on its first letter (after any
     * drop cap).  Centering marked in the gabc with braces (e.g. "f{i}re")
     * wins over each of these.
     */
    lyricCentering: "vowel" | "syllable" | "firstletter";
    /**
     * Whether a syllable that ends in italics (e.g. "ri<i>a</i>") elides into
     * the next one, as a syllable that ends in an elision ("ri<e>a</e>") does.
     * Defaults to true.
     */
    italicMeansElision: boolean;
    /**
     * What a ~ in the lyrics becomes.  "space" (the default) is a space that
     * doesn't break the syllable, so the syllable is centered on the text after
     * it.  "undertie", "overtie" and "doubletie" are Gregorio's lyric ties,
     * drawn as the specials ut, ot and dt are (see specials), which join the
     * words, so the syllable is centered on its first vowel.  Like the rest of
     * the lyrics, it's read when the gabc is parsed.
     */
    lyricTie: LyricTie;
    /**
     * Whether every line starts with the verse number of each line of lyrics
     * on it, as a hymn's first line does.  A verse number is marked in the
     * gabc at the start of a syllable ("<verseNum>1.</verseNum> Ve"), and is
     * in effect until the next one on the same line of lyrics, or an empty one
     * ("<verseNum></verseNum>A", e.g. before an Amen or a refrain).  The verse
     * numbers on a syllable are right aligned whether or not they're repeated.
     * Defaults to true.
     */
    repeatVerseNumbers: boolean;
    /**
     * Gregorio's firstword, firstsyllable and firstsyllableinitial styles: the
     * styles of the lyrics of the score's first word, of its first syllable
     * (after any drop cap), and of that syllable's first letter.  Markup in the
     * lyrics wins over them.  Each is empty, and so changes nothing, by default.
     * They're applied by ChantScore.updateNotations().
     */
    firstWordStyle: CssProperties;
    firstSyllableStyle: CssProperties;
    firstSyllableInitialStyle: CssProperties;
    /**
     * Where a translation starts under its syllable, as Gregorio's
     * \gresettranslationcentering: "left" (the default) at the left of the
     * syllable's notation, or "center" centered under its lyric.  A
     * translation that ends at a later syllable ([/]) is centered between the
     * two either way.
     */
    translationCentering: "left" | "center";
    /**
     * How much of the text after a <pr> (with no factor of its own, as <pr:0.5>
     * has) may go past the right end of the staff, from 0 to 1.  It's 1 by
     * default, as in Gregorio (\gresetprotrusionfactor{default}).  Text past
     * the end of the staff is outside the width the score is laid out at.
     */
    defaultProtrusionFactor: number;
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
    /**
     * the width of each space between neumes that the gabc gives, in multiples
     * of this.intraNeumeSpacing.  /[n] is n times "/", and three or more
     * slashes are "//" and then "/" for each slash after the second.  The
     * defaults make a large space (" ") the same as "//"; Gregorio's own widths
     * are about { "/0": 0.5, "/!": 1, "/": 1, "//": 1.58, " ": 3.16 }.
     */
    neumeSpaceMultipliers: {
        [code in NeumeSpaceCode]: number;
    };
    drawGuides: boolean;
    drawDebuggingBounds: boolean;
    currNotationIndex: number;
    condensingTolerance: number;
    /**
     * which lines end with a custos when the gabc doesn't put one there: "auto"
     * (the default) for every line that has notes after it, or "manual" for
     * only the line breaks that ask for one (gabc z+ or Z+), as with Gregorio's
     * \greseteolcustos
     */
    eolCustos: "auto" | "manual";
    /**
     * how ChantScore.layoutChantLines() breaks the score into lines: "greedy"
     * (the default) to fill each line in turn, or "optimal" to choose the
     * breaks of the whole score together, as Gregorio does (see LineBreaker)
     */
    lineBreaking: LineBreaking;
    /**
     * with optimal line breaking, the demerits added to a way of breaking the
     * score whose last line starts within a word, as TeX's \finalhyphendemerits
     * are: 0 (the default, as Gregorio sets it) to let it, more to make it less
     * likely, so that a word such as "A-men" isn't split before the last line
     */
    finalHyphenDemerits: number;
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
    private setFontDropCapStyle?;
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
    /** whether textStyles.dropCap.size is still the size that setFont() gave it */
    hasDefaultDropCapSize(): boolean;
    setRubricColor(color: string): void;
    /**
     * Forgets the text measurements and the merged text span styles that are
     * kept to speed up layout.  setFont(), setRubricColor() and the like call
     * this.  Text measured on a canvas is also measured again after
     * document.fonts fires loadingdone, and at the start of a ChantScore layout
     * once a font has been added to or removed from document.fonts; call this
     * after changing fontStyleDictionary, specialCharProperties,
     * asteriskProperties, plusProperties or specials directly once text has been created,
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
     * measures a text element in the DOM, with TextMeasuringStrategy.Svg
     * @returns the text's advance width, and its bounding box, with the baseline
     * at y = 0
     */
    measureSvgText(node: SVGTextElement): {
        advanceWidth: number;
        bbox: TextBBox;
    };
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
    /**
     * the classes of each svg that a score is drawn in: Exsurge ChantScore, and
     * defIdPrefix + "ChantScore" when there's a prefix, which the text styles
     * are scoped to (see defIdPrefix)
     */
    getSvgClass(): string;
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
    /**
     * @param fusedShift the interval to the next note, if a virga reversa or
     * oriscus scapus is fused to it (see FusedNeume.fusedShift()), or else 0
     */
    constructor(ctxt: ChantContext, note: Note, fusedShift?: number);
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
    /**
     * the flat bar between the lines of a linea (gabc =), from the top of the
     * lines, or null for the lines around a punctum (gabc R)
     */
    bar: {
        y: number;
        height: number;
    } | null;
    /** @param bar whether it's a linea (gabc =), a flat bar between the lines, rather than lines around the note */
    constructor(ctxt: ChantContext, note: Note, bar?: boolean);
    getRects(ctxt: ChantContext): {
        x: number;
        y: number;
        width: number;
        height: number;
    }[];
    draw(ctxt: ChantContext): void;
    getSvgProps(ctxt: ChantContext, rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): {
        fill: string;
        class: string;
        x: number;
        y: number;
        width: number;
        height: number;
    };
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export declare class GlyphVisualizer extends ChantLayoutElement {
    glyph: Glyph;
    glyphCode: GlyphCode;
    /**
     * the id of the glyph's svg def: its code, but for a porrectus's swash
     * under a glyph multiplier other than 1, which has a glyph of its own, its
     * code with x and the multiplier after the interval (e.g. Porrectus2x0.8)
     */
    glyphId: string;
    /** for a porrectus, the staff positions its notes are apart; otherwise 0 */
    porrectusNoteDiff: number;
    align?: "left" | "right";
    /** the glyph's size, relative to the other glyphs (set it before setGlyph()) */
    scale: number;
    /** (glyph is one that isn't in Glyphs, such as a NABC font's, whose def's id is glyphCode) */
    constructor(ctxt: ChantContext, glyphCode?: GlyphCode | null, glyph?: Glyph);
    setGlyph(ctxt: ChantContext, glyphCode?: GlyphCode | null | "", ownGlyph?: Glyph): void;
    setStaffPosition(ctxt: ChantContext, staffPosition: number): void;
    draw(ctxt: ChantContext): void;
    getSvgAttributes(ctxt: ChantContext, source?: GlyphSource): SvgAttributes;
    createSvgNode(ctxt: ChantContext, source?: GlyphSource): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext, source?: GlyphSource): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext, source?: GlyphSource): string;
}
/**
 * A line of Gregorio's NABC on a notation (ChantNotationElement.nabcNeumes):
 * its neumes, laid out with layoutNabc() and drawn with a NabcFont's
 * glyphs.  It starts at the left of the notation, as Gregorio's starts at
 * the left of its first glyph, and takes no room among the notes, and
 * ChantLine.performLayout() puts its baseline above or below the staff.
 */
export declare class NabcNeumes extends ChantLayoutElement {
    /** which line of NABC it is: 0, above the staff, or 1, below it */
    voice: number;
    layout: NabcLayout;
    /** the size of the font's units, in the units of the score */
    unit: number;
    /** whether it takes its room without being drawn (ChantContext.nabcVisibility "phantom") */
    phantom: boolean;
    glyphs: GlyphVisualizer[];
    /** where its baseline is on the line */
    baseline: number;
    /** how far moveBy() has moved it */
    xOffset: number;
    /** the size of ERR, where the NABC is wrong, in the font's ems */
    static errorSize: number;
    constructor(ctxt: ChantContext, items: NabcItem[], voice: number, font: NabcFont, phantom?: boolean);
    /** moves it dx to the right */
    moveBy(dx: number): void;
    setBaseline(baseline: number): void;
    errorAttributes(ctxt: ChantContext, x: number): SvgAttributes;
    draw(ctxt: ChantContext): void;
    getSvgAttributes(): SvgAttributes;
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
/** a brace over or under notes, which a canvas strokes along its svg path */
export declare abstract class BraceVisualizer extends ChantLayoutElement {
    isAbove: boolean;
    braceHeight: number;
    accent?: GlyphVisualizer;
    abstract generatePathString(): string;
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
}
export declare class RoundBraceVisualizer extends BraceVisualizer {
    constructor(ctxt: ChantContext, x1: number, x2: number, y: number, isAbove: boolean);
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
export declare class CurlyBraceVisualizer extends BraceVisualizer {
    /** the brace's own extent, which its path is drawn in (bounds takes in its accent too) */
    braceBounds: Rect;
    constructor(ctxt: ChantContext, x1: number, x2: number, y: number, isAbove?: boolean, addAcuteAccent?: boolean);
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
interface TextLine {
    /** the index in the spans' text where the line starts */
    start: number;
    /** the index in the spans' text where the line ends */
    end: number;
    /** the index in the element's text where the line starts */
    textStart: number;
    /** how far right the line is moved, where the lines are right aligned */
    xOffset: number;
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
    /**
     * the spans that setMaxWidth() replaced to wrap the text, where it put the
     * spans that replaced them and how many, in order, to put back in unwrap()
     */
    wrappedSpans?: Array<{
        index: number;
        count: number;
        spans: TextSpan[];
    }>;
    needsLayout?: boolean;
    svgNode?: SvgElementWithSource;
    elementIndex?: number;
    constructor(ctxt: ChantContext, text: string, fontFamily: (ctxt: ChantContext) => string, fontSize: (ctxt: ChantContext) => number, textAnchor: string, sourceIndex?: number, sourceGabc?: string, 
    /** set before the text is measured, since its css class can style it */
    textType?: TextTypes[keyof TextTypes], 
    /**
     * whether to measure the text now, rather than leave it for whatever lays
     * it out to measure (see recalculateMetrics())
     */
    measure?: boolean);
    /**
     * The matching element in score (see TextType.getFromScore()).  For title
     * text, score needs titles.
     */
    getFromScore(score: ChantScore): TextElement | null | undefined;
    generateSpansFromText(ctxt: ChantContext, text: string): void;
    /** the size in px of this element's text in the given properties */
    fontSizeForProperties(ctxt: ChantContext, properties?: CssProperties | TextSpanProperties): number;
    /** the distance from one line of this element's text to the next, in ems */
    lineSpacing(ctxt: ChantContext): number;
    /**
     * how far below the line before it the line that span starts is, in px: the
     * same as the span's dy in the svg, in its own font size
     */
    lineBreakHeight(ctxt: ChantContext, span: TextSpan, properties?: CssProperties): number;
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
    /**
     * The lines of the text, as they are drawn.  Where setMaxWidth() wrapped
     * the text, the spans no longer have the whitespace that it broke the line
     * at, though this.text still does.
     */
    getLines(): TextLine[];
    /** puts back the spans that setMaxWidth() replaced to wrap the text */
    unwrap(): void;
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
    /**
     * a text element of text in span's style, styled as createSvgNode() styles
     * this one, but starting at the origin, for TextMeasuringStrategy.Svg
     */
    createSvgNodeToMeasure(ctxt: ChantContext, span: TextSpan, text: string): SVGTextElement;
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
    /** (lessProtrusion leaves out how far each lyric may go past the end of the staff) */
    getRight: (lyricArray: Lyric[], presumeConnectorNeeded?: boolean, lessProtrusion?: boolean) => number;
    hasOnlyOneLyric: (lyricArray: Lyric[]) => boolean;
    indexOfLyric: (lyricArray: Lyric[]) => number;
    mergeIn: (lyricArray: Lyric[], newLyrics: Lyric[]) => void;
    mergeInArray: (lyricArray: Lyric[], notations: ChantNotationElement[]) => void;
    /**
     * right aligns the verse numbers of the lyrics (of one notation), a word
     * space before the leftmost of the lyrics, so that the lyrics stay where
     * they are
     */
    alignVerseNumbers: (ctxt: ChantContext, lyricArray: Lyric[]) => void;
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
    /** Gregorio's <clear>: the lyric may not reach back under the previous syllable's notes */
    clear?: boolean;
    /** Gregorio's <pr>: how much of the lyric may go into the right margin */
    protrusion?: LyricProtrusion;
    /** how far the lyric may go past the end of the staff, for its protrusion */
    protrusionWidth?: number;
    /** which line of lyrics this is */
    lyricIndex?: number;
    /**
     * whether the lyric is from a lyric-line header (or makes room for one),
     * and so has a source index that is the negative of its index in the gabc,
     * header and all (see Gabc.applyLyricLines())
     */
    fromLyricLine?: boolean;
    /** what the lyric was made from, to keep it while that stays the same (see Gabc.applyLyricLines()) */
    lyricLineKey?: string;
    /** the index in the gabc of the lyric-line syllable that the lyric was made from */
    lyricLineIndex?: number;
    /** the right edge of a line of text-only syllables that starts with this lyric */
    lineWidth?: number;
    /** the verse number before the lyric in the gabc ("<verseNum>1.</verseNum> Ve") */
    verseNumber?: VerseNumber;
    /**
     * whether an empty verse number ("<verseNum></verseNum>") ends the verse
     * number in effect on the lyric's line of lyrics, so that it isn't repeated
     */
    endsVerseNumbers?: boolean;
    /**
     * the verse number in effect on the lyric's line of lyrics, from an earlier
     * syllable (set by ChantScore.updateVerseNumbers())
     */
    verseNumberInEffect?: VerseNumber;
    /** the copy of verseNumberInEffect that's repeated (see getRepeatedVerseNumber()) */
    verseNumberCopy?: VerseNumber;
    /**
     * the verse number in effect, repeated before the lyric when it's the first
     * text of its line of lyrics on a line (see ChantContext.repeatVerseNumbers)
     */
    repeatedVerseNumber?: VerseNumber;
    /** where the verse number starts, from the lyric's x (see alignVerseNumbers()) */
    verseNumberX: number;
    /**
     * the styles that setFirstWordStyles() gave the lyric: the first word's and
     * first syllable's, then the first letter's
     */
    firstWordStyles?: SpanPropertyDict[];
    /**
     * the tags of Gregorio's styles that a syllable before the lyric left open
     * (e.g. "<i>"), which the lyric is styled with until it closes them, as
     * Gregorio carries them on; they aren't in its source
     */
    openStyles?: string;
    constructor(ctxt: ChantContext, text: string, lyricType?: LyricType | null | "", notation?: ChantNotationElement, notations?: ChantNotationElement[], sourceIndex?: number, 
    /** the tags of the styles left open before the lyric, e.g. "<i>" (see openStyles) */
    openStyles?: string, 
    /**
     * whether to measure the lyric now; a lyric of a notation that will be laid
     * out needn't be, since ChantNotationElement.performLayout() measures it
     * again anyway
     */
    measure?: boolean);
    allowsConnector(): boolean;
    setForceConnector(force: boolean): void;
    setPreventConnector(prevent: boolean): void;
    setNeedsConnector(needs?: boolean, width?: number): void;
    setConnectorWidth(width: number): void;
    /** gives the connector its default width, and draws it that wide */
    clearConnectorWidth(): void;
    /**
     * puts the connector back as recalculateMetrics() leaves it, which a lyric
     * has only if it's forced to (and was measured with)
     */
    resetConnector(): void;
    getConnectorWidth(): number;
    /** the left of the lyric, or of its verse number */
    getLeft(): number;
    /** the left of the lyric, or of its verse number, from its notation's x */
    leftOffset(): number;
    /**
     * the verse number drawn before the lyric, if any (the drop cap takes the
     * place of the verse number of the lyric it was taken from, which is still
     * repeated on the later lines)
     */
    get shownVerseNumber(): VerseNumber | undefined;
    /** a copy of the verse number in effect, to repeat before the lyric (made once) */
    getRepeatedVerseNumber(ctxt: ChantContext): VerseNumber | undefined;
    /** the verse number drawn before the lyric, if any, placed where it's drawn */
    placeVerseNumber(): VerseNumber | undefined;
    getRight(): number;
    recalculateMetrics(ctxt: ChantContext, resetNewLines?: boolean): void;
    generateDropCap(ctxt: ChantContext): DropCap | null;
    /**
     * Gives the lyric back the letter that its drop cap took (see
     * generateDropCap()), without the first word's styles.
     */
    removeDropCap(ctxt: ChantContext): void;
    /** makes the lyric's spans again from its text, as the constructor did */
    generateLyricSpans(ctxt: ChantContext): void;
    private shiftSpansPastOpenStyles;
    /**
     * Gives the lyric the styles of the score's first word (part "word"), or of
     * its first syllable ("syllable", which also styles the first letter after
     * any drop cap), from ChantContext.firstWordStyle and so on, or takes them
     * away (null).  Returns whether the lyric's spans changed.
     */
    setFirstWordStyles(ctxt: ChantContext, part: "syllable" | "word" | null): boolean;
    getCssClasses(): string;
    getExtraStyleProperties(ctxt: ChantContext): CssProperties;
}
/**
 * The verse number before a lyric ("<verseNum>1.</verseNum> Ve"), drawn in the lyrics'
 * style.  A notation's verse numbers are right aligned, a word space before
 * the leftmost of its lyrics (see LyricArray.alignVerseNumbers()).
 */
export declare class VerseNumber extends TextElement {
    textType: TextTypes["lyric"];
    /** the text as the gabc parser gave it (with its escapes), to copy it from */
    gabcText: string;
    constructor(ctxt: ChantContext, text: string, sourceIndex?: number);
    /** a copy, to draw before another lyric */
    copy(ctxt: ChantContext, sourceIndex?: number): VerseNumber;
    getCssClasses(): string;
}
export declare class ChoralSign extends TextElement {
    textType: TextTypes["choralSign"];
    positionHint: MarkingPositionHint;
    note: Note;
    constructor(ctxt: ChantContext, text: string, note: Note, sourceIndex?: number);
    recalculateMetrics(ctxt: ChantContext): void;
    performLayout(ctxt: ChantContext): void;
}
/**
 * Gregorio's NABC choral sign ([cn:…] after a note): NABC drawn where a
 * choral sign goes, in the font of the first line of NABC (as Gregorio's
 * \GreNABCChar draws it).  Without a NABC font (ChantContext.nabcFonts),
 * it isn't drawn, as NABC isn't.
 */
export declare class NabcChoralSign extends ChantLayoutElement {
    /** the NABC, as in the gabc */
    nabc: string;
    /** the NABC read with parseNabc() */
    items: NabcItem[];
    note: Note;
    positionHint: MarkingPositionHint;
    sourceIndex: number;
    /** the NABC as it's drawn, if there's a font to draw it with (see performLayout()) */
    neumes?: NabcNeumes;
    constructor(nabc: string, note: Note, sourceIndex: number);
    performLayout(ctxt: ChantContext): void;
    draw(ctxt: ChantContext): void;
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
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
    /**
     * the font size that the score gave the drop cap to reach across the
     * lines beside it (see ChantContext.dropCapLines), in place of its text
     * style's size
     */
    sizeForLines?: number;
    /**
     * how many lines the score lays the drop cap out beside (ctxt.dropCapLines
     * as of its last ChantScore.layoutChantLines())
     */
    linesBeside?: number;
    constructor(ctxt: ChantContext, text: string, sourceIndex?: number);
    /** measures the drop cap at the given font size, or else its text style's */
    measureAtSize(ctxt: ChantContext, size?: number): void;
    /**
     * Makes the drop cap's height above and below its baseline its letter's,
     * where it was measured by its font's box instead, as it is with
     * TextMeasuringStrategy.Svg or a canvas without actualBoundingBox metrics:
     * its letter as measured on a canvas, where the browser can, or else a
     * typical capital, 0.7em high.
     */
    fitBoundsToLetter(ctxt: ChantContext): void;
    getExtraStyleProperties(ctxt: ChantContext): CssProperties;
}
export declare class TitleTextElement extends TextElement {
    /** the space after the text */
    padding: (ctxt: ChantContext) => number;
    constructor(ctxt: ChantContext, text: string, fontFamily: (ctxt: ChantContext) => string, fontSize: (ctxt: ChantContext) => number, textAnchor: string, sourceIndex?: number, sourceGabc?: string, textType?: TextTypes[keyof TextTypes]);
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
    /**
     * the distance from one annotation to the next, in ems, if it's not the
     * annotation text style's lineHeight
     */
    lineHeight?: number;
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
/**
 * Where one of Gregorio's areas (<eu>…</eu> or <nlba>…</nlba>) starts or
 * ends.  An area starts at the first notation of the syllable (or, in the
 * notes, of the note) after its opening tag, and ends at the last notation
 * of the syllable (or note) before its closing tag, so an area of one
 * notation both starts and ends there.
 */
export interface AreaBoundary {
    start?: boolean;
    end?: boolean;
}
/** a lyric's Gregorio protrusion, <pr> or <pr:factor> */
export interface LyricProtrusion {
    /**
     * how much of the text after the tag may go into the right margin, from 0
     * to 1, or undefined for <pr>, which takes the default factor (1 in
     * Gregorio)
     */
    factor?: number;
    /** where the text that may protrude starts in the lyric's text */
    textIndex: number;
}
/** a ChantNotationElement.layoutId for a layout of a notation, unlike any before it */
export declare const newLayoutId: () => number;
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
    /**
     * the trailing space that the notation's own layout gave it, which each
     * line that it's laid out on starts from (see resetNotation() in
     * Exsurge.Chant.ChantLine)
     */
    layoutTrailingSpace?: number;
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
    /**
     * a number that each layout of the notation gives it, unlike any before
     * it, so that a line laid out from it can be used again until it's laid out
     * again (see LineBreaker)
     */
    layoutId?: number;
    visualizers: ChantLayoutElement[];
    sourceIndex?: number;
    sourceLength?: number;
    sourceGabc?: string;
    /** whether the notation is the first of a syllable that has text */
    firstOfSyllable?: boolean;
    /** whether the notation is the first in its parentheses */
    firstOfParentheses?: boolean;
    /**
     * whether the notation is in the same one of Gregorio's elements as the
     * notation before it: the neumes and accidentals that a ledger line can run
     * through (see determineLedgerLines()), which are joined by gabc !, /! and
     * /0, and some by the notes themselves (see Gabc.joinElements())
     */
    continuesElement?: boolean;
    /** whether the accidentals were reset (at a new word) just before this notation */
    resetsAccidentalsBefore?: boolean;
    /** whether the notation is in a group in braces that takes up no width */
    hasNoWidth?: boolean;
    /** the first notation of the group in braces that this notation is in */
    firstWithNoWidth?: ChantNotationElement;
    /** the css class of the notation's svg element; defaults to its class name */
    cssClass?: string;
    /** whether a Gregorio euouae area (<eu>…</eu> in the lyrics) starts or ends at this notation */
    euouae?: AreaBoundary;
    /**
     * Gregorio's NABC for the gabc that starts with this notation, a string
     * for each line (nabc[0] above the staff, nabc[1] below it), which is
     * drawn when there's a NabcFont to draw it with (see nabcNeumes)
     */
    nabc?: string[];
    private readNabc?;
    /** the NABC of each line, read with parseNabc(): its neumes, spaces and errors */
    get parsedNabc(): NabcItem[][] | undefined;
    /**
     * the NABC of each line that's drawn, laid out (when there's a NabcFont to
     * draw it with), or undefined if none is
     */
    nabcNeumes?: Array<NabcNeumes | undefined>;
    /**
     * whether a Gregorio no-line-break area (<nlba>…</nlba>, in the lyrics or
     * in the notes) starts or ends at this notation
     */
    noLineBreak?: AreaBoundary;
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
    alignLyrics(ctxt: ChantContext): void;
    draw(ctxt: ChantContext): void;
    getInnerSvgNodes(ctxt: ChantContext, functionName?: "createSvgNode" | "createSvgTree"): (SvgElementWithSource | SvgTreeNode)[];
    getSvgProps(): SvgAttributes;
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
export {};
//# sourceMappingURL=Exsurge.Drawing.d.ts.map