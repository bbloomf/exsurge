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
  getCssForProperties, Point,
  Rect
} from "./Exsurge.Core.js";
import { Glyphs, type Glyph } from "./Exsurge.Glyphs.js";
import { language, type IgnoredRange, type Language } from "./Exsurge.Text.js";
import { addAccent } from "./addAccent.js";
import { restoreEscapes, unescapeChar } from "./gabcEscapes.js";
import { greextraGlyphs } from "./greextraGlyphs.js";
import { makeLigature } from "./makeLigature.js";
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
  layout(
    text: string,
    features?: { [feature: string]: boolean }
  ): {
    advanceWidth: number;
    bbox: { minX: number; maxY: number; height: number };
  };
}

/** options for laying out text with an opentype.js font */
export interface OpenTypeRenderOptions {
  features?: { [feature: string]: boolean };
}

/** an opentype.js font, as far as exsurge uses one (opentype.js's Font fits this) */
export interface OpenTypeFont {
  getPath(
    text: string,
    x: number,
    y: number,
    fontSize: number,
    options?: OpenTypeRenderOptions
  ): { getBoundingBox(): OpenTypeBoundingBox };
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
  bbox: { minX: number; maxY: number; height: number };
}

/** the metrics of text drawn in an opentype.js font */
interface OpenTypeMetrics {
  advanceWidth: number;
  bbox: OpenTypeBoundingBox;
}

function getFontFilenameForProperties(properties: FontStyleProperties = {}, url = "{}") {
  var italic = properties["font-style"] === "italic" ? "Italic" : "",
    bold = properties["font-weight"] === "bold" ? "Bold" : "";
  return url.replace(
    "{}",
    `${italic || bold ? `${bold}${italic}` : `Regular`}`
  );
}

// load in the web font for special chant characters here:
// var __exsurgeCharactersFont = require("url?limit=30000!../assets/fonts/ExsurgeChar.otf")

const canAccessDOM = typeof document !== "undefined";

// TextSpans keep their merged properties until this changes, which it does
// whenever any ChantContext's text styles change (see clearTextCache()).
let __textStyleVersion = 0;

// bumped whenever the browser finishes loading a web font, or a font is added
// to or removed from document.fonts, which changes what text measured on a
// canvas in that font comes to.
let __fontLoadGeneration = 0;
let __listeningForFontLoads = false;
function listenForFontLoads() {
  if (__listeningForFontLoads) return;
  const fonts = typeof document !== "undefined" && document.fonts;
  if (!fonts || typeof fonts.addEventListener !== "function") return;
  __listeningForFontLoads = true;
  fonts.addEventListener("loadingdone", () => __fontLoadGeneration++);
}

// a FontFace that has already loaded when it's added to document.fonts (as in
// `document.fonts.add(await new FontFace(...).load())`) fires no event, so the
// size of document.fonts is compared before each layout as well.
let __fontSetSize: number | undefined;
function noticeFontSetChanges() {
  const fonts = typeof document !== "undefined" && document.fonts;
  const size = fonts ? fonts.size : undefined;
  if (size !== __fontSetSize) {
    __fontSetSize = size;
    __fontLoadGeneration++;
  }
}

// how many measurements a ChantContext remembers before starting over
const __maxCachedTextMetrics = 20000;

// an attribute used as an index into an array, which the attribute's string
// works as just as well as a number
const __attributeAsIndex = (attribute: string | number | null) =>
  attribute as unknown as number;

const __getNeumeFromSvgElem = (score: ChantScore, elem: Element) => {
  let note =
    score.notes[
      __attributeAsIndex(
        elem.parentElement!
          .querySelector("[element-index]")!
          .getAttribute("element-index")
      )
    ];
  return ((note as Note).neume || note) as ChantNotationElement;
};

// for positioning markings on notes
export const MarkingPositionHint = {
  Default: 0,
  Above: 1,
  Below: 2
} as const;
export type MarkingPositionHint =
  (typeof MarkingPositionHint)[keyof typeof MarkingPositionHint];

/**
 * A score with titles.  A score made without a ChantContext, or a later page
 * from paginate(), has none.
 */
export type ScoreWithTitles = ChantScore & { titles: Titles };

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

/** any of TextTypes, as code that goes through all of them sees it */
interface AnyTextType {
  display: string;
  key: keyof TextTypes;
  cssClass: string;
  defaultSize?(size: number, ctxt?: ChantContext): number;
  size?(ctxt: ChantContext): number;
}

// TextTypes as they are written below, before their keys and classes are set
type TextTypeDefinitions = {
  [K in keyof TextTypes]: Omit<TextTypes[K], "key" | "cssClass"> & {
    cssClass?: string;
  };
};

/**
 * List of types of text and their defaults relative to lyrics
 * @type Array
 */
const textTypeDefinitions: TextTypeDefinitions = {
  supertitle: {
    display: "Supertitle",
    defaultSize: (size) => (size * 7) / 6, // 14pt
    containedInScore: (score) => score.titles.hasSupertitle(),
    getFromScore: (score) => score.titles.supertitle
  },
  title: {
    display: "Title",
    defaultSize: (size) => (size * 3) / 2, // 18pt
    containedInScore: (score) => score.titles.hasTitle(),
    getFromScore: (score) => score.titles.title
  },
  subtitle: {
    display: "Subtitle",
    defaultSize: (size) => size, // 12pt
    containedInScore: (score) => score.titles.hasSubtitle(),
    getFromScore: (score) => score.titles.subtitle
  },
  leftRight: {
    display: "Left / Right Text",
    cssClass: "textLeftRight",
    defaultSize: (size) => size * 0.9,
    containedInScore: (score) =>
      score.titles.hasTextLeft() || score.titles.hasTextRight(),
    getFromScore: (score, elem) =>
      score.titles[(elem as TextLeftRight).extraClass],
    getFromSvgElem: (score, elem) =>
      score.titles[
        elem.classList.contains("textRight") ? "textRight" : "textLeft"
      ]
  },
  annotation: {
    display: "Annotation",
    defaultSize: (size) => (size * 2) / 3,
    containedInScore: (score) =>
      !!score.annotation,
    getFromScore: (score, { elementIndex = 0 }) =>
      score.annotation &&
      ((score.annotation as Annotations).annotations
        ? (score.annotation as Annotations).annotations[elementIndex]
        : (score.annotation as Annotation)),
    getFromSvgElem: (score, elem) =>
      score.annotation &&
      ((score.annotation as Annotations).annotations
        ? (score.annotation as Annotations).annotations[Array.from(elem.parentElement!.querySelectorAll("text.annotation")).indexOf(elem)]
        : (score.annotation as Annotation))
  },
  dropCap: {
    display: "Drop Cap",
    defaultSize: (size) => size * 4,
    containedInScore: (score) => !!score.dropCap,
    getFromScore: (score) => score.dropCap
  },
  al: {
    display: "Above Staff",
    cssClass: "aboveLinesText",
    defaultSize: (size) => size,
    containedInScore: (score) => score.hasAboveLinesText,
    getFromScore: (score, elem) =>
      score.notations[(elem as AboveLinesText).notation.notationIndex!].alText![
        (elem as AboveLinesText).alIndex!
      ],
    getFromSvgElem: (score, elem) =>
      __getNeumeFromSvgElem(score, elem).alText![
        __attributeAsIndex(elem.getAttribute("al-index") || 0)
      ]
  },
  choralSign: {
    display: "Choral Sign",
    size: (ctxt: ChantContext) => ctxt.staffInterval * 1.5,
    containedInScore: (score) => false,
    getFromScore: (score, elem) =>
      (score.notes[(elem as ChoralSign).note.elementIndex!] as Note).choralSign
  },
  lyric: {
    display: "Lyric",
    defaultSize: (size) => size * 0.9,
    containedInScore: (score) => score.hasLyrics,
    getFromScore: (score, elem) =>
      score.notations[(elem as Lyric).notation.notationIndex!].lyrics[
        (elem as Lyric).lyricIndex!
      ],
    getFromSvgElem: (score, elem) =>
      __getNeumeFromSvgElem(score, elem).lyrics[
        __attributeAsIndex(elem.getAttribute("lyric-index") || 0)
      ]
  },
  translation: {
    display: "Translation",
    defaultSize: (size) => size * 0.75,
    containedInScore: (score) => score.hasTranslations,
    getFromScore: (score, elem) =>
      score.notations[(elem as TranslationText).notation.notationIndex!]
        .translationText![(elem as TranslationText).translationIndex!],
    getFromSvgElem: (score, elem) =>
      __getNeumeFromSvgElem(score, elem).translationText![
        __attributeAsIndex(elem.getAttribute("translation-index") || 0)
      ]
  }
};
// the key and class of each are set just below
export const TextTypes = textTypeDefinitions as TextTypes;
export const TextTypesByClass: { [cssClass: string]: TextTypes[keyof TextTypes] } = {};
(Object.entries(TextTypes) as [keyof TextTypes, AnyTextType][]).forEach(([key, entry]) => {
  let cssClass = (entry.cssClass = entry.cssClass || key);
  entry.key = key;
  TextTypesByClass[cssClass] = entry as TextTypes[keyof TextTypes];
});

/** the TextTypes, as code that goes through each of them sees them */
const __textTypeEntries = () =>
  Object.entries(TextTypes) as [keyof TextTypes, AnyTextType][];

/**
 * how much space to leave after a notation: a width, or a function of the
 * context.  A function's isDefault is set if it is DefaultTrailingSpace.
 */
export type TrailingSpace = number | TrailingSpaceFunction;
export type TrailingSpaceFunction = ((ctxt: ChantContext) => number) & {
  isDefault?: boolean;
};

export const DefaultTrailingSpace: TrailingSpaceFunction = (ctxt: ChantContext) =>
  ctxt.intraNeumeSpacing * ctxt.interSyllabicMultiplier;
DefaultTrailingSpace.isDefault = true;

export const GlyphCode = {
  None: "None",

  AcuteAccent: "AcuteAccent",
  GraveAccent: "GraveAccent",
  Circle: "Circle",
  Semicircle: "Semicircle",
  ReversedSemicircle: "ReversedSemicircle",
  Stropha: "Stropha",
  StrophaLiquescent: "StrophaLiquescent",

  BeginningAscLiquescent: "BeginningAscLiquescent",
  BeginningDesLiquescent: "BeginningDesLiquescent",

  CustosDescLong: "CustosDescLong",
  CustosDescShort: "CustosDescShort",
  CustosLong: "CustosLong",
  CustosShort: "CustosShort",

  // clefs and other markings
  DoClef: "DoClef",
  FaClef: "FaClef",
  TrebleClef: "TrebleClef",
  TrebleClefSmall: "TrebleClefSmall",
  ChiRhoClef: "ChiRhoClef",
  ChiRhoClefSans: "ChiRhoClefSans",
  Flat: "Flat",
  Mora: "Mora",
  Natural: "Natural",
  OriscusAsc: "OriscusAsc",
  OriscusDes: "OriscusDes",
  OriscusLiquescent: "OriscusLiquescent",

  PodatusLower: "PodatusLower",
  PodatusUpper: "PodatusUpper",
  PodatusLowerShort: "PodatusLowerShort",
  PodatusUpperShort: "PodatusUpperShort",

  Porrectus1: "Porrectus1", // 1 staff line difference,
  Porrectus2: "Porrectus2", // 2 lines difference, etc...
  Porrectus3: "Porrectus3",
  Porrectus4: "Porrectus4",

  PunctumCavum: "PunctumCavum",
  PunctumQuadratum: "PunctumQuadratum",
  PunctumQuadratumLiquescent: "PunctumQuadratumLiquescent",
  PunctumQuadratumAscLiquescent: "PunctumQuadratumAscLiquescent",
  PunctumQuadratumDesLiquescent: "PunctumQuadratumDesLiquescent",
  PunctumInclinatum: "PunctumInclinatum",
  PunctumInclinatumLiquescent: "PunctumInclinatumLiquescent",
  Quilisma: "Quilisma",

  Sharp: "Sharp",
  TerminatingAscLiquescent: "TerminatingAscLiquescent",
  TerminatingDesLiquescent: "TerminatingDesLiquescent",
  VerticalEpisemaAbove: "VerticalEpisemaAbove",
  VerticalEpisemaBelow: "VerticalEpisemaBelow",
  VirgaLong: "VirgaLong",
  VirgaShort: "VirgaShort",
  Virgula: "Virgula",

  UpperBrace: "UpperBrace"
} as const; // GlyphCode
export type GlyphCode = (typeof GlyphCode)[keyof typeof GlyphCode];

/** attributes of an svg element, by name; undefined ones are left out */
export interface SvgAttributes {
  [name: string]: any;
}

/** an svg element, with what in the score it shows (if anything) */
export type SvgElementWithSource = SVGElement & { source?: unknown };

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

export const QuickSvg = {
  // namespaces
  ns: "http://www.w3.org/2000/svg" as const,
  xmlns: "http://www.w3.org/2000/xmlns/",
  xlink: "http://www.w3.org/1999/xlink",

  hasDOMAccess: function () {
    return canAccessDOM;
  },

  // create the root level svg object
  svg: function (width: number, height: number): QuickSvgRoot {
    var node = document.createElementNS(this.ns, "svg") as QuickSvgRoot;

    node.setAttribute("xmlns", this.ns);
    node.setAttribute("version", "1.1");
    node.setAttributeNS(this.xmlns, "xmlns:xlink", this.xlink);

    node.setAttribute("width", String(width));
    node.setAttribute("height", String(height));

    // create the defs element
    var defs = document.createElementNS(this.ns, "defs");
    node.appendChild(defs);

    node.defs = defs;

    node.clearNotations = function () {
      // clear out all children except defs
      node.removeChild(defs);

      while (node.hasChildNodes()) node.removeChild(node.lastChild!);

      node.appendChild(defs);
    };

    return node;
  },

  rect: function (width: number, height: number) {
    var node = document.createElementNS(this.ns, "rect");

    node.setAttribute("width", String(width));
    node.setAttribute("height", String(height));

    return node;
  },

  line: function (x1: number, y1: number, x2: number, y2: number) {
    var node = document.createElementNS(this.ns, "line");

    node.setAttribute("x1", String(x1));
    node.setAttribute("y1", String(y1));
    node.setAttribute("x2", String(x2));
    node.setAttribute("y2", String(y2));

    return node;
  },

  g: function () {
    var node = document.createElementNS(this.ns, "g");

    return node;
  },

  text: function () {
    var node = document.createElementNS(this.ns, "text");

    return node;
  },

  tspan: function (str: string) {
    var node = document.createElementNS(this.ns, "tspan");
    node.textContent = str;

    return node;
  },

  // nodeRef should be the id of the object in defs (without the #)
  use: function (nodeRef: string) {
    var node = document.createElementNS(this.ns, "use");
    node.setAttributeNS(this.xlink, "xlink:href", "#" + nodeRef);

    return node;
  },

  svgFragmentForGlyph: function (glyph: Glyph, negativeFillColor = "#fff") {
    var svgSrc = "";
    for (var i = 0; i < glyph.paths.length; ++i) {
      var path = glyph.paths[i];
      svgSrc += QuickSvg.createFragment(path.data ? "path" : "g", {
        d: path.data || undefined,
        fill: path.type === "negative" ? negativeFillColor : undefined
      });
    }
    return svgSrc;
  },

  nodesForGlyph: function <F extends "createNode" | "createSvgTree" = "createNode">(
    glyph: Glyph,
    functionName: F = "createNode" as F,
    negativeFillColor = "#fff"
  ): Array<F extends "createSvgTree" ? SvgTreeNode : SvgElementWithSource> {
    var nodes = [];
    for (var i = 0; i < glyph.paths.length; ++i) {
      var path = glyph.paths[i];
      let props: SvgAttributes = {};
      if (path.data) props.d = path.data;
      if (path.type === "negative") props.fill = negativeFillColor;
      nodes.push(QuickSvg[functionName](path.data ? "path" : "g", props));
    }
    return nodes as Array<F extends "createSvgTree" ? SvgTreeNode : SvgElementWithSource>;
  },

  createNode: function (
    name: string,
    attributes?: SvgAttributes | null,
    children?: string | Node | Node[]
  ): SvgElementWithSource {
    var node: SvgElementWithSource = document.createElementNS(this.ns, name);
    if (attributes && attributes.source) {
      node.source = attributes.source;
      delete attributes.source;
    }
    for (var attr in attributes) {
      if (
        attributes.hasOwnProperty(attr) &&
        typeof attributes[attr] !== "undefined"
      ) {
        var val = attributes[attr];
        var match = attr.match(/^([^:]+):([^:]+)$/);
        if (match) {
          node.setAttributeNS(
            (this as unknown as { [prefix: string]: string })[match[1]],
            attr,
            val
          );
        } else {
          node.setAttribute(attr, val);
        }
      }
    }
    if (children) {
      if (typeof children === "string") {
        node.textContent = children;
      } else if (children.constructor === [].constructor) {
        for (var i = 0; i < (children as Node[]).length; ++i) {
          node.appendChild((children as Node[])[i]);
        }
      } else {
        node.appendChild(children as Node);
      }
    }
    return node;
  },

  createSvgTree(
    name: string,
    props: SvgAttributes,
    ...children: Array<SvgTreeNode | string | Array<SvgTreeNode | string>>
  ): SvgTreeNode {
    if ("class" in props) {
      props.className = props.class;
      delete props.class;
    }
    if (children.length === 1 && children[0] instanceof Array) {
      children = children[0];
    }
    const convertKeysToCamelCase = (obj: SvgAttributes) => {
      for (let key of Object.keys(obj)) {
        if (/[-:][a-z]/.test(key)) {
          if (/^\w+-index$/.test(key)) continue;
          let camelCase = key.replace(/[-:]([a-z])/g, (whole, letter) =>
            letter.toUpperCase()
          );
          obj[camelCase] = obj[key];
          delete obj[key];
        }
      }
    };
    convertKeysToCamelCase(props);
    if (props.style && typeof props.style === "object") {
      // camelCase a copy, since the style object may not be the caller's to
      // change (TextElement passes ctxt.baseTextStyle)
      props.style = Object.assign({}, props.style);
      convertKeysToCamelCase(props.style);
    }
    let source = props.source;
    if (source && source.sourceGabc) {
      props["source-gabc"] = source.sourceGabc;
    }
    return { name, props, children: children as Array<SvgTreeNode | string> };
  },

  createFragment: function (
    name: string,
    attributes?: SvgAttributes | null,
    child?: string | null
  ) {
    if (child === undefined || child === null) child = "";

    var fragment = "<" + name + " ";

    for (var attr in attributes) {
      if (
        attributes!.hasOwnProperty(attr) &&
        typeof attributes![attr] !== "undefined"
      )
        fragment += attr + '="' + attributes![attr] + '" ';
    }

    fragment += ">" + child + "</" + name + ">";

    return fragment;
  },

  parseFragment: function (fragment: string) {
    // create temporary holder
    var well = document.createElement("svg");

    // act as a setter if svg is given
    if (fragment) {
      var container = this.g();

      // dump raw svg
      // do this to allow the browser to automatically create svg nodes?
      well.innerHTML =
        "<svg>" +
        fragment
          .replace(/\n/, "")
          .replace(/<(\w+)([^<]+?)\/>/g, "<$1$2></$1>") +
        "</svg>";

      // transplant nodes
      for (var i = 0, il = well.firstChild!.childNodes.length; i < il; i++)
        container.appendChild(well.firstChild!.firstChild!);

      return container;
    }
  },

  translate: function (node: Element, x: number, y: number) {
    node.setAttribute("transform", "translate(" + x + "," + y + ")");
    return node;
  },

  scale: function (node: Element, sx: number, sy: number) {
    node.setAttribute("transform", "scale(" + sx + "," + sy + ")");
    return node;
  }
};

export const TextMeasuringStrategy = {
  // shapes
  Svg: 0,
  Canvas: 1,
  /** also used for fontkit */
  OpenTypeJS: 2
} as const;
export type TextMeasuringStrategy =
  (typeof TextMeasuringStrategy)[keyof typeof TextMeasuringStrategy];

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

/*
 * ChantContext
 */
export class ChantContext {
  /** the fonts to measure text in, with TextMeasuringStrategy.OpenTypeJS */
  fontDictionary?: FontDictionary;
  staffLineCount: number;
  textMeasuringStrategy: TextMeasuringStrategy;
  getFontFilenameForProperties: (
    properties?: FontStyleProperties,
    /** "{}" is replaced by Regular, Bold, Italic or BoldItalic; defaults to "{}" */
    url?: string
  ) => string;
  /** the svg source of the def of each glyph used so far, by glyph code */
  defs: { [glyphCode: string]: string };
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
  baseTextStyle!: CssProperties;

  rubricColor: string;
  specialCharProperties: CssProperties;
  specialCharText: (char: string) => string;
  textBeforeSpecialChar: string;
  textAfterSpecialChar: string;
  /** what each of "℣", "℟", "*" and "+" is shown as */
  specialCharMap: { [char: string]: string };
  /**
   * What each of Gregorio's special characters, <sp>…</sp>, is shown as, by
   * the text between the tags, for the specials that exsurge doesn't draw
   * itself (it draws the ligatures and accented vowels, A/, R/, V/ and ~).
   * A special shown as "*" or "+" is drawn as a lyric's asterisk or plus
   * would be, and one that isn't here is shown as its text.
   */
  specials: { [special: string]: string };
  asteriskProperties: CssProperties;
  plusProperties: CssProperties;
  fontStyleDictionary: {
    [tag: string]: CssProperties;
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
  glyphMultiplier!: number;
  glyphScaling!: number;
  staffInterval!: number;
  staffLineWeight!: number;
  neumeLineWeight!: number;
  dividerLineWeight!: number;
  episemaLineWeight!: number;
  intraNeumeSpacing!: number;

  // set by updateHyphenWidth():
  hyphenWidth!: number;
  minLyricWordSpacing!: number;
  /**
   * minLyricWordSpacing / hyphenWidth, as of the last hyphen that had a
   * width; updateHyphenWidth() keeps minLyricWordSpacing at this ratio.  It
   * recomputes this from minLyricWordSpacing, so set that instead.
   */
  declare readonly minLyricWordSpacingRatio?: number;

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
  mergeAnnotationWithTextLeft?: (
    ...spans: Array<TextSpan[] | null | undefined>
  ) => TextSpan[];

  // the text measured so far (see clearTextCache())
  private textMetricsCache!: Map<object, Map<string, any>>;
  private textMetricsCacheSize!: number;
  private fontLoadGeneration!: number;

  constructor(
    textMeasuringStrategy: TextMeasuringStrategy = QuickSvg.hasDOMAccess()
      ? TextMeasuringStrategy.Canvas
      : TextMeasuringStrategy.OpenTypeJS
  ) {
    /**
     * font dictionary
     * @type {{ [key: string]: import('opentype.js').Font }}
     */
    this.fontDictionary = undefined;
    noticeFontSetChanges();
    this.clearTextCache();
    listenForFontLoads();
    this.staffLineCount = 4;
    this.textMeasuringStrategy = textMeasuringStrategy;
    this.getFontFilenameForProperties = getFontFilenameForProperties;
    this.defs = {};
    this.makeDefs = [];
    if (QuickSvg.hasDOMAccess()) {
      this.defsNode = QuickSvg.createNode("defs");
    }

    // font styles
    this.textStyles = {} as TextTypeStyles;
    this.textColor = "#000";
    this.setFont("'Palatino Linotype', 'Book Antiqua', Palatino, serif", 16);

    this.rubricColor = "#d00";
    this.specialCharProperties = {
      "font-family": "'Exsurge Characters'",
      fill: this.rubricColor,
      class: 'rubric'
    };
    this.textBeforeSpecialChar = "";
    this.textAfterSpecialChar = ".";
    this.specialCharMap = {
      "℣": 'v',
      "℟": 'r',
      "+": "+",
      "*": "*"
    };
    this.specials = {
      "*": "*",
      "+": "†",
      // a zero-width hyphen
      "-": "",
      "\\": "\\",
      "&": "&",
      "#": "#",
      "_": "_",
      "%": "%",
      ot: "⁀",
      ut: "‿",
      dt: "⁀‿"
    };
    this.plusProperties = {};
    this.asteriskProperties = {};
    this.specialCharText = (char: string) => this.specialCharMap[char] || char;

    this.fontStyleDictionary = {
      b: { "font-weight": "bold" },
      i: { "font-style": "italic" },
      u: { "text-decoration": "underline" },
      ul: { "text-decoration": "underline" },
      c: { fill: this.rubricColor, class: 'rubric' },
      sc: { "font-variant": "small-caps" },
      tt: { "font-family": "monospace" },
      v: {},
      e: { "font-style": "italic", "font-size": "90%" }
    };

    this.markupSymbolDictionary = {
      "*": "b",
      "_": "i",
      "^": "c",
      "%": "sc"
    };

    this.textStyles.al.prefix = "<i>";

    this.textStyles.translation.prefix = "<i>";

    this.textStyles.dropCap.padding = 1; // minimum padding on either side of drop cap in staffIntervals

    this.textStyles.annotation.padding = 1; // minimum padding on either side of annotation in staffIntervals

    this.minLedgerSeparation = 2; // multiple of staffInterval
    this.minSpaceAboveStaff = 2; // multiple of staffInterval
    this.minSpaceBelowStaff = 1; // multiple of staffInterval
    this.spaceBetweenSystems = 1.5; // multiple of staffInterval

    // everything depends on the scale of the punctum
    this.glyphPunctumWidth = Glyphs.PunctumQuadratum.bounds.width;
    this.glyphPunctumHeight = Glyphs.PunctumQuadratum.bounds.height;

    // max space to add between notations when justifying, in multiples of this.staffInterval
    this.maxExtraSpaceInStaffIntervals = 0.5;

    // for keeping track of the clef
    this.activeClef = null as unknown as Clef;

    this.neumeLineColor = "#000";
    this.staffLineColor = "#000";
    this.dividerLineColor = "#000";
    // fill for the "negative" parts of a glyph (e.g. the hole of a punctum
    // cavum), which have to match whatever the chant is drawn on rather than
    // the chant itself.  Glyphs are shared through <use>, and CSS selectors do
    // not reach into a use element's shadow tree, so a caller that follows a
    // page theme needs to set this rather than style the paths from a
    // stylesheet.
    this.negativeFillColor = "#fff";

    this.defaultLanguage = language.latin;

    // calculate the pixel ratio for drawing to a canvas
    this.pixelRatio =
      typeof window === 'undefined'
        ? 1.0
        : (window.devicePixelRatio || 1.0);

    //this.canvasCtxt.scale(this.pixelRatio, this.pixelRatio);

    if (textMeasuringStrategy === TextMeasuringStrategy.Svg) {
      this.svgTextMeasurer = QuickSvg.svg(0, 0);
      this.svgTextMeasurer.setAttribute("id", "TextMeasurer");
      // the classes of the svg that the score is drawn in, which the text
      // styles (see createStyleCss()) are for
      this.svgTextMeasurer.setAttribute("class", "Exsurge ChantScore");
      this.svgTextMeasurer.setAttribute("style", "position:absolute");
      document.body.insertBefore(
        this.svgTextMeasurer,
        document.body.firstChild
      );
    } else if (textMeasuringStrategy === TextMeasuringStrategy.Canvas) {
      this.makeCanvasIfNeeded();
    }

    // for connecting neume syllables...
    this.syllableConnector = "-";

    // how long ChantScore.performLayoutAsync() waits, in milliseconds, for a
    // lyric font that seems not to have loaded yet before laying out anyway.
    this.fontLoadTimeout = 3000;

    // set whether to scale the def tags (scaleDefs = true) or the use tags.
    this.scaleDefs = true;

    // fixme: for now, we just set these using the glyph scales as noted above, presuming a
    // staff line size of 0.5 in. Really what we should do is scale the punctum size based
    // on the text metrics, right? 1 punctum ~ x height size?
    this.setGlyphScaling(1.0 / 16.0);

    // minimum space between puncta of different syllables, in multiples of this.intraNeumeSpacing
    this.interSyllabicMultiplier = 2.5;

    // space between an accidental and the following note, in multiples of this.intraNeumeSpacing
    this.accidentalSpaceMultiplier = 2;

    // space added between puncta of different words, in multiples of this.intraNeumeSpacing
    this.interVerbalMultiplier = 1;

    this.drawGuides = false;
    this.drawDebuggingBounds = true;

    // we keep track of where we are in processing notations, so that
    // we can maintain the context for notations to know about.
    //
    // these are only gauranteed to be valid during the performLayout phase!
    this.activeNotations = null;
    this.currNotationIndex = -1;

    this.minSyllablesLastLine = 0;
    this.minNotesLastLine = 0;

    // chant notation elements are normally separated by a minimum fixed amount of space
    // on the staff line. It can happen, however, that two text elements are almost close
    // enough to merge, only to be separated much more by the required hyphen (or other
    // connecting string).
    //
    // This tolerance value allows a little bit of flexibility to merge two close lyrical
    // elements, thus bringing the chant notation elements a bit closer than otherwise
    // would be normally allowed.
    //
    // condensing tolerance is a percentage value (0.0-1.0, inclusive) that indicates
    // how much the default spacing can shrink. E.g., a value of 0.20 allows the layout
    // engine to separate two glyphs by only 80% of the normal inter-neume spacing value.
    this.condensingTolerance = 0.3;

    // if auto color is true, then exsurge tries to automatically colorize
    // some elements of the chant (directives become rubric color, etc.)
    this.autoColor = true;

    this.useExtraTextOnly = true;

    this.noteIdPrefix = 'note-';

    this.insertFontsInDoc();
    this.setMergeAnnotationWithTextLeft(true);
  }

  /**
   * convert a staff position counting from the first space below the staff (gabc notation "c")
   * into a position counting from the middle space (variable based on how many staff lines there are)
   * @param {number} staffPosition 
   * @returns {number}
   */
  convertStaffPositionToSymmetric(staffPosition: number) {
    return staffPosition - this.staffLineCount;
  }

  convertSymmetricStaffPosition(staffPositionSymmetric: number) {
    return staffPositionSymmetric + this.staffLineCount;
  }

  /**
   * 
   * @param {*} properties 
   * @param {string} fontFamily 
   * @returns {import('opentype.js').Font | import('fontkit').Font | undefined}
   */
  getFontForProperties(
    properties: FontStyleProperties = {},
    fontFamily?: string
  ): MeasuringFont | undefined {
    let key = this.getFontFilenameForProperties(properties),
      keyWithFontFamily = this.getFontFilenameForProperties(properties, fontFamily);
    return (
      this.fontDictionary &&
      (this.fontDictionary[keyWithFontFamily] ||
        this.fontDictionary[fontFamily as string] ||
        this.fontDictionary.Regular)
    );
  }

  /**
   * 
   * @param {string} font : ;
   * @param {number} size 
   * @param {any} baseStyle 
   * @param {{ [key: string]: import('opentype.js').Font }} fontDictionary 
   */
  setFont(
    font: string,
    size = 16,
    baseStyle: CssProperties = {},
    fontDictionary?: FontDictionary
  ) {
    const textStyles = this.textStyles as { [key: string]: TextStyle };
    for (let [key, textType] of __textTypeEntries()) {
      let textStyle = (textStyles[key] = textStyles[key] || ({} as TextStyle));
      textStyle.size = textType.defaultSize
        ? textType.defaultSize(size, this)
        : textType.size!(this);
      textStyle.font = font;
      textStyle.color = this.textColor || "#000";
    }

    this.baseTextStyle = baseStyle;

    if (fontDictionary) {
      this.textMeasuringStrategy = TextMeasuringStrategy.OpenTypeJS;
      this.fontDictionary = fontDictionary;
    }
    this.clearTextCache();
  }

  setRubricColor(color: string) {
    this.rubricColor = color;
    this.specialCharProperties.fill = color;
    this.fontStyleDictionary.c.fill = color;
    this.clearTextCache();
  }

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
  clearTextCache() {
    // maps whatever measures the text (a canvas context or a font) to a map
    // from what was measured to its metrics
    this.textMetricsCache = new Map();
    this.textMetricsCacheSize = 0;
    this.fontLoadGeneration = __fontLoadGeneration;
    __textStyleVersion++;
  }

  /**
   * Starts measuring text again if fonts have been added to or removed from
   * document.fonts since text was last measured.  ChantScore calls this at the
   * start of each layout, rather than with every measurement, since asking
   * document.fonts its size can make the browser bring its styles up to date;
   * call it before measuring text outside of a layout.
   */
  noticeFontChanges() {
    noticeFontSetChanges();
  }

  /**
   * @param {object} measurer what measures the text: a canvas context or a font
   * @returns {Map<string, any>} the measurements made with it so far
   */
  getTextMetricsCache(measurer: object): Map<string, any> {
    if (
      this.fontLoadGeneration !== __fontLoadGeneration ||
      this.textMetricsCacheSize >= __maxCachedTextMetrics
    )
      this.clearTextCache();
    let cache = this.textMetricsCache.get(measurer);
    if (!cache) {
      cache = new Map();
      this.textMetricsCache.set(measurer, cache);
    }
    return cache;
  }

  cacheTextMetrics<T>(cache: Map<string, any>, key: string, metrics: T): T {
    cache.set(key, metrics);
    this.textMetricsCacheSize++;
    return metrics;
  }

  /**
   * measures text on this.canvasCtxt in the given CSS font, setting the
   * canvas's font only if the text hasn't been measured in that font yet
   * @param {string} font
   * @param {string} text
   * @returns {TextMetrics}
   */
  measureCanvasText(font: string, text: string): TextMetrics {
    const canvasCtxt = this.canvasCtxt!;
    const cache = this.getTextMetricsCache(canvasCtxt);
    // the alignment moves the bounding box, and draw() leaves it set
    const key = canvasCtxt.textAlign + "\0" + font + "\0" + text;
    let metrics = cache.get(key);
    if (!metrics) {
      if (canvasCtxt.font !== font) canvasCtxt.font = font;
      metrics = this.cacheTextMetrics(cache, key, canvasCtxt.measureText(text));
    }
    return metrics;
  }

  /**
   * measures a text element in the DOM, with TextMeasuringStrategy.Svg
   * @returns the text's advance width, and its bounding box, with the baseline
   * at y = 0
   */
  measureSvgText(node: SVGTextElement): { advanceWidth: number; bbox: TextBBox } {
    const measurer = this.svgTextMeasurer!;
    // (after the text that recalculateMetrics() leaves in the measurer, which
    // Lyric.recalculateMetrics() goes on to measure)
    measurer.appendChild(node);
    const { x, y, width, height } = node.getBBox();
    const advanceWidth = node.getComputedTextLength();
    measurer.removeChild(node);
    return { advanceWidth, bbox: { x, y, width, height } };
  }

  /**
   * lays out text with a fontkit font, in font units
   * @param {import('fontkit').Font} font
   * @param {string} text
   * @param {boolean} smallCaps
   * @returns {{ advanceWidth: number, bbox: { minX: number, maxY: number, height: number } }}
   */
  layoutFontkitText(font: FontkitFont, text: string, smallCaps: boolean): FontkitMetrics {
    const cache = this.getTextMetricsCache(font);
    const key = (smallCaps ? "c" : "-") + text;
    let metrics = cache.get(key);
    if (!metrics) {
      const features: { [feature: string]: boolean } = { liga: true };
      if (smallCaps) features.smcp = true;
      const run = font.layout(text, features);
      // keep just the numbers rather than the whole glyph run
      metrics = this.cacheTextMetrics(cache, key, {
        advanceWidth: run.advanceWidth,
        bbox: run.bbox
      });
    }
    return metrics;
  }

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
  measureOpenTypeText(
    font: OpenTypeFont,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    smallCaps: boolean
  ): OpenTypeMetrics {
    const cache = this.getTextMetricsCache(font);
    // the bounding box comes out slightly differently depending on where
    // the path is, so where it is is part of the key
    const key = `${x},${y},${fontSize},${smallCaps ? "c" : "-"},${text}`;
    let metrics = cache.get(key);
    if (!metrics) {
      const options: { features: { [feature: string]: boolean } } = {
        features: { liga: true }
      };
      if (smallCaps) options.features.smcp = true;
      metrics = this.cacheTextMetrics(cache, key, {
        bbox: font.getPath(text, x, y, fontSize, options).getBoundingBox(),
        advanceWidth: font.getAdvanceWidth(text, fontSize, options)
      });
    }
    return metrics;
  }

  setMergeAnnotationWithTextLeft(merge: boolean) {
    this.mergeAnnotationWithTextLeft = merge ? __mergeAnnotationWithTextLeft : undefined;
  }

  setScaleDefs(scaleDefs: boolean) {
    scaleDefs = !!scaleDefs;
    if (this.scaleDefs !== scaleDefs) {
      this.scaleDefs = scaleDefs;
      this.setGlyphScaling(this.glyphScaling);
    }
  }

  createStyleCss() {
    var style = "";
    for (let [key, textType] of __textTypeEntries()) {
      var cssClass = textType.cssClass,
        { color, font, size } = this.textStyles[key];
      // some text (e.g., choral signs) is measured at a size that follows the
      // staff rather than the text style, so draw it at that size too.
      if (textType.size) size = textType.size(this);
      style += `svg.Exsurge .${cssClass}{fill:${color};font-family:${font};font-size:${size}px;font-kerning:normal}`;
    }
    return style;
  }

  createStyleNode() {
    var node = QuickSvg.createNode("style", {}) as SVGStyleElement;
    node.textContent = this.createStyleCss();
    return node;
  }

  createStyleTree(): { name: "style"; props: Record<string, never>; children: [string] } {
    return { name: "style", props: {}, children: [this.createStyleCss()] };
  }

  createStyle() {
    return "<style>" + this.createStyleCss() + "</style>";
  }

  updateHyphenWidth() {
    // measure the size of a hyphen for the lyrics
    var hyphen = new Lyric(
      this,
      this.syllableConnector,
      LyricType.SingleSyllable
    );
    // minLyricWordSpacing follows the hyphen width, keeping whatever ratio a
    // caller has set it to.  A hyphen with no width (e.g., when there's no
    // lyric font to measure with yet) says nothing about that ratio, so keep
    // the ratio from the last hyphen that had a width.
    if (this.hyphenWidth > 0 && this.minLyricWordSpacing >= 0)
      (this as { minLyricWordSpacingRatio?: number }).minLyricWordSpacingRatio =
        this.minLyricWordSpacing / this.hyphenWidth;
    this.hyphenWidth = hyphen.bounds.width;

    this.minLyricWordSpacing =
      (this.minLyricWordSpacingRatio! >= 0 ? this.minLyricWordSpacingRatio! : 1) *
      this.hyphenWidth;
  }

  setStaffHeight(staffHeight: number, glyphMultiplier = 1) {
    this.setGlyphScaling(staffHeight / 600, glyphMultiplier);
  }

  setGlyphScaling(glyphScaling: number, glyphMultiplier = 1) {
    this.glyphMultiplier = glyphMultiplier;
    this.glyphScaling = glyphScaling * glyphMultiplier;

    this.staffInterval = this.glyphPunctumWidth * glyphScaling;

    // setup the line weights for the various elements.
    this.staffLineWeight = Math.ceil((5 * this.staffInterval) / 8) / 5;
    this.neumeLineWeight = this.staffLineWeight; // the weight of connecting lines in the glyphs.
    this.dividerLineWeight = this.neumeLineWeight; // of quarter bar, half bar, etc.
    this.episemaLineWeight = this.neumeLineWeight * 1.25; // of horizontal episemata

    this.intraNeumeSpacing = this.staffInterval / 2.0;

    this.clearTextCache();

    // some text (e.g., choral signs) is sized by the staff rather than by the
    // font size given to setFont(), so keep its style in step with the staff.
    for (let [key, textType] of __textTypeEntries()) {
      if (textType.size && this.textStyles[key])
        this.textStyles[key].size = textType.size(this);
    }

    while (this.defsNode && this.defsNode.firstChild)
      this.defsNode.removeChild(this.defsNode.firstChild);
    for (var i = 0; i < this.makeDefs.length; ++i) {
      this.makeDefs[i]();
    }

    this.updateHyphenWidth();
  }

  calculateHeightFromStaffPosition(staffPosition: number) {
    return -staffPosition * this.staffInterval;
  }

  insertFontsInDoc() {
    if (!canAccessDOM) return;

    var styleElement = document.getElementById("exsurge-fonts");

    if (styleElement === null) {
      // create it since it doesn't exist yet.
      styleElement = document.createElement("style");
      styleElement.id = "exsurge-fonts";

      // styleElement.appendChild(document.createTextNode("@font-face{font-family: 'Exsurge Characters';font-weight: normal;font-style: normal;src: url(" + __exsurgeCharactersFont + ") format('opentype');}"));

      document.head.appendChild(styleElement);
    }
  }

  // returns the next neume starting at this.currNotationIndex, or null
  // if there isn't a neume after this one...
  findNextNeume(): Neume | null {
    if (typeof this.currNotationIndex === "undefined")
      throw "findNextNeume() called without a valid currNotationIndex set";

    for (var i = this.currNotationIndex + 1; i < this.notations!.length; i++) {
      var notation = this.notations![i];

      if (notation.isNeume && !notation.hasNoWidth) return notation as Neume;
    }

    return null;
  }

  makeCanvasIfNeeded() {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvasCtxt = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    }
  }

  setCanvasSize(width: number, height: number, scale = 1) {
    this.makeCanvasIfNeeded();

    this.canvas!.style.width = width * scale + "px";
    this.canvas!.style.height = height * scale + "px";
    scale *= this.pixelRatio;
    this.canvas!.width = width * scale;
    this.canvas!.height = height * scale;

    this.canvasCtxt!.setTransform(scale, 0, 0, scale, 0, 0);
  }
}

/*
 * ChantLayoutElement
 */
/**
 * what a glyph is drawn for, which its svg element is marked with: a note, or a
 * notation such as a clef or custos
 */
export type GlyphSource = Note | ChantNotationElement;

// each kind of ChantLayoutElement makes its own svg tree (this only adds the
// signature, which each subclass implements)
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface ChantLayoutElement {
  /** returns the element as an svg tree, e.g. for React */
  createSvgTree(ctxt: ChantContext, ...args: any[]): SvgTreeNode;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class ChantLayoutElement {
  bounds: Rect;
  origin: Point;
  selected: boolean;
  highlighted: boolean;
  /** leaves the element out of the bounds of the notation it's added to */
  ignoreBounds?: boolean;

  constructor() {
    this.bounds = new Rect();
    this.origin = new Point(0, 0);

    this.selected = false;
    this.highlighted = false;
  }

  // draws the element on an html5 canvas
  draw(ctxt: ChantContext, ...args: any[]): void {
    throw "ChantLayout Elements must implement draw(ctxt)";
  }

  // returns svg element
  createSvgNode(ctxt: ChantContext, ...args: any[]): SvgElementWithSource | SvgElementWithSource[] {
    throw "ChantLayout Elements must implement createSvgNode(ctxt)";
  }

  // returns svg code for the element, used for printing support
  createSvgFragment(ctxt: ChantContext, ...args: any[]): string {
    throw "ChantLayout Elements must implement createSvgFragment(ctxt)";
  }
}

export class DividerLineVisualizer extends ChantLayoutElement {
  divider?: ChantNotationElement;

  constructor(
    ctxt: ChantContext,
    staffPosition0: number,
    staffPosition1: number,
    divider?: ChantNotationElement
  ) {
    super();

    this.divider = divider;

    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition0);
    var y1 = ctxt.calculateHeightFromStaffPosition(staffPosition1);

    if (y0 > y1) {
      var temp = y0;
      y0 = y1;
      y1 = temp;
    }

    this.bounds.x = 0;
    this.bounds.y = y0;
    this.bounds.width = ctxt.dividerLineWeight;
    this.bounds.height = y1 - y0;

    this.origin.x = this.bounds.width / 2;
    this.origin.y = y0;
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;

    canvasCtxt.fillStyle = ctxt.dividerLineColor;

    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.dividerLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt: ChantContext) {
    let props: SvgAttributes = {
      x: this.bounds.x,
      y: this.bounds.y,
      width: ctxt.dividerLineWeight,
      height: this.bounds.height,
      fill: ctxt.dividerLineColor,
      class: "dividerLine"
    };
    if (this.divider) {
      if (this.divider.selected) props.class += " selected";
      props["source-index"] = this.divider.sourceIndex;
      props["element-index"] = this.divider.elementIndex;
      props.source = this.divider;
    }
    return props;
  }

  createSvgNode(ctxt: ChantContext) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt: ChantContext) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt: ChantContext) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

export class NeumeLineVisualizer extends ChantLayoutElement {
  /**
   * @param note1 the note to draw the line to, or a staff position to draw it
   * to, or nothing to draw it to four staff positions above note0
   */
  constructor(
    ctxt: ChantContext,
    note0: Note,
    note1?: Note | number | null,
    hanging?: boolean
  ) {
    super();

    var staffPosition0 = note0.staffPosition;
    var staffPosition1 =
      typeof note1 === "number"
        ? note1
        : note1
          ? note1.staffPosition
          : note0.staffPosition + 4;

    // note0 should be the upper one for our calculations here
    if (staffPosition0 < staffPosition1) {
      var temp = staffPosition0;
      staffPosition0 = staffPosition1;
      staffPosition1 = temp;
    }

    if (hanging && staffPosition0 - staffPosition1 > 4) {
      staffPosition1 = staffPosition0 - 4;
    }

    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition0);
    var y1 = 0;

    if (hanging) {
      // if the difference between the notes is only one, and the upper
      // note is on a line, and the lower note is within the four staff lines,
      // then our hanging line goes past the lower note by a whole
      // staff interval
      if (
        staffPosition0 - staffPosition1 === 1 &&
        Math.abs(staffPosition0) % 2 === 1 &&
        staffPosition1 > -3
      )
        staffPosition1--;

      y1 += (ctxt.glyphPunctumHeight * ctxt.glyphScaling) / 2.2;
    }

    y1 += ctxt.calculateHeightFromStaffPosition(staffPosition1);

    this.bounds.x = 0;
    this.bounds.y = y0;
    this.bounds.width = ctxt.neumeLineWeight;
    this.bounds.height = y1 - y0;

    this.origin.x = 0;
    this.origin.y = 0;
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;

    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.neumeLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt: ChantContext) {
    return {
      x: this.bounds.x,
      y: this.bounds.y,
      width: ctxt.neumeLineWeight,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "neumeLine"
    };
  }

  createSvgNode(ctxt: ChantContext) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt: ChantContext) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt: ChantContext) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

export class NeumeBeamVisualizer extends ChantLayoutElement {
  constructor(
    ctxt: ChantContext,
    x0: number,
    x1: number,
    staffPosition0: number,
    staffPosition1: number,
    yOffset = 0
  ) {
    super();
    
    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition0);
    var y1 = ctxt.calculateHeightFromStaffPosition(staffPosition1);
    
    if (y0 === y1 && x0 === x1) {
      y0 -= ctxt.staffInterval / 2;
      x0 -= ctxt.staffInterval * 2 / 3;
    }

    this.bounds.x = x0;
    this.bounds.y = y0 + (yOffset * ctxt.neumeLineWeight * 6);
    this.bounds.width = x1 - x0;
    this.bounds.height = y1 - y0;


    this.origin.x = 0;
    this.origin.y = 0;
  }
  getPoints(ctxt: ChantContext) {
    const lineHeight = ctxt.neumeLineWeight * 3;
    return {
      x0: this.bounds.x - ctxt.neumeLineWeight / 2,
      x1: this.bounds.x + this.bounds.width + ctxt.neumeLineWeight / 2,
      y0: this.bounds.y,
      y1: this.bounds.y + this.bounds.height,
      height: lineHeight
    };
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;
    const points = this.getPoints(ctxt);

    canvasCtxt.fillStyle = ctxt.neumeLineColor;
    canvasCtxt.beginPath();
    canvasCtxt.moveTo(points.x0, points.y0 + points.height / 2);
    canvasCtxt.lineTo(points.x0, points.y0 - points.height / 2);
    canvasCtxt.lineTo(points.x1, points.y1 - points.height / 2);
    canvasCtxt.lineTo(points.x1, points.y1 + points.height / 2);
    canvasCtxt.closePath();
    canvasCtxt.fill();
  }

  getSvgProps(ctxt: ChantContext) {
    const points = this.getPoints(ctxt);
    return {
      points: `${points.x0},${points.y0 + points.height / 2} ${points.x0},${points.y0 - points.height / 2} ${
        points.x1
      },${points.y1 - points.height / 2} ${points.x1},${points.y1 + points.height / 2}`,
      fill: ctxt.neumeLineColor,
      class: "neumeBeam"
    };
  }

  createSvgNode(ctxt: ChantContext) {
    return QuickSvg.createNode("polygon", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt: ChantContext) {
    return QuickSvg.createSvgTree("polygon", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt: ChantContext) {
    return QuickSvg.createFragment("polygon", this.getSvgProps(ctxt));
  }
}

export class VirgaLineVisualizer extends ChantLayoutElement {
  constructor(ctxt: ChantContext, note: Note) {
    super();

    var staffPosition = note.staffPosition;

    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition);
    var y1;

    if (Math.abs(staffPosition % 2) === 0) y1 = y0 + ctxt.staffInterval * 1.8;
    else y1 = y0 + ctxt.staffInterval * 2.7;

    this.bounds.x = 0;
    this.bounds.y = y0;
    this.bounds.width = ctxt.neumeLineWeight;
    this.bounds.height = y1 - y0;

    this.origin.x = 0;
    this.origin.y = 0;
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;
    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.neumeLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt: ChantContext) {
    return {
      x: this.bounds.x,
      y: this.bounds.y,
      width: ctxt.neumeLineWeight,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "neumeLine"
    };
  }

  createSvgNode(ctxt: ChantContext) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt: ChantContext) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt: ChantContext) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

export class LineaVisualizer extends ChantLayoutElement {
  constructor(ctxt: ChantContext, note: Note) {
    super();

    var staffPosition = note.staffPosition;

    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition) - note.origin.y;
    var y1 = y0 + note.bounds.height;

    this.bounds.x = 0;
    this.bounds.y = y0;
    this.bounds.width = ctxt.neumeLineWeight * 5 + note.bounds.width;
    this.bounds.height = y1 - y0;

    this.origin.x = ctxt.neumeLineWeight * 2.5;
    this.origin.y = 0;
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;
    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.neumeLineWeight,
      this.bounds.height
    );
    canvasCtxt.fillRect(
      this.bounds.x + this.bounds.width - ctxt.neumeLineWeight,
      this.bounds.y,
      ctxt.neumeLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt: ChantContext, x: number) {
    return {
      x,
      y: this.bounds.y,
      width: ctxt.neumeLineWeight,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "neumeLine"
    };
  }

  createSvgNode(ctxt: ChantContext) {
    return QuickSvg.createNode("g", null, [
      this.bounds.x,
      this.bounds.x + this.bounds.width - ctxt.neumeLineWeight
    ].map(x => QuickSvg.createNode("rect", this.getSvgProps(ctxt, x))));
  }

  createSvgTree(ctxt: ChantContext) {
    return QuickSvg.createSvgTree("g", {}, ...[
      this.bounds.x,
      this.bounds.x + this.bounds.width - ctxt.neumeLineWeight
    ].map(x => QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt, x))));
  }

  createSvgFragment(ctxt: ChantContext) {
    return QuickSvg.createFragment("g", null, [
      this.bounds.x,
      this.bounds.x + this.bounds.width - ctxt.neumeLineWeight
    ].map(x => QuickSvg.createFragment("rect", this.getSvgProps(ctxt, x))).join(''));
  }
}

export class GlyphVisualizer extends ChantLayoutElement {
  glyph: Glyph;
  glyphCode!: GlyphCode;
  /** for a porrectus, the staff positions its notes are apart; otherwise 0 */
  porrectusNoteDiff!: number;
  align?: "left" | "right";

  constructor(ctxt: ChantContext, glyphCode?: GlyphCode | null) {
    super();

    // setGlyph() sets the glyph just below
    this.glyph = null as unknown as Glyph;

    this.setGlyph(ctxt, glyphCode);
  }

  setGlyph(ctxt: ChantContext, glyphCode?: GlyphCode | null | "") {
    if (this.glyphCode !== glyphCode) {
      if (
        typeof glyphCode === "undefined" ||
        glyphCode === null ||
        glyphCode === ""
      )
        glyphCode = this.glyphCode = GlyphCode.None;
      else this.glyphCode = glyphCode;

      let glyph = this.glyph = Glyphs[glyphCode];
      const porrectusResult = /^Porrectus([1-9])$/.exec(glyphCode);
      this.porrectusNoteDiff = porrectusResult ? Number(porrectusResult[1]) : 0;

      // if this glyph hasn't been used yet, then load it up in the defs section for sharing
      if (!ctxt.defs.hasOwnProperty(glyphCode)) {
        var getDefProps = () => {
          var options: SvgAttributes = {
            id: glyphCode,
            class: "glyph"
          };
          if (ctxt.scaleDefs === true) {
            options.transform = "scale(" + ctxt.glyphScaling + ")";
          }
          return options;
        };
        const makeDef = () => {
          let options = getDefProps();
          // create the ref
          ctxt.defs[glyphCode as GlyphCode] = QuickSvg.createFragment(
            "g",
            options,
            QuickSvg.svgFragmentForGlyph(glyph, ctxt.negativeFillColor)
          );

          if (ctxt.defsNode)
            ctxt.defsNode.appendChild(
              QuickSvg.createNode(
                "g",
                options,
                QuickSvg.nodesForGlyph(
                  glyph,
                  "createNode",
                  ctxt.negativeFillColor
                )
              )
            );
        };
        makeDef.makeSvgTree = () => {
          return QuickSvg.createSvgTree(
            "g",
            getDefProps(),
            ...QuickSvg.nodesForGlyph(
              glyph,
              "createSvgTree",
              ctxt.negativeFillColor
            )
          );
        };
        makeDef.glyphCode = glyphCode;
        makeDef();
        ctxt.makeDefs.push(makeDef);
      }

      this.align = this.glyph.align;
    }

    this.origin.x = this.glyph.origin.x * ctxt.glyphScaling;
    this.origin.y = this.glyph.origin.y * ctxt.glyphScaling;

    this.bounds.x = 0;
    this.bounds.y = -this.origin.y;
    this.bounds.width = this.glyph.bounds.width * ctxt.glyphScaling;
    this.bounds.height = this.glyph.bounds.height * ctxt.glyphScaling;
  }

  setStaffPosition(ctxt: ChantContext, staffPosition: number) {
    this.bounds.y =
      ctxt.calculateHeightFromStaffPosition(staffPosition) - this.origin.y;
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;

    const porrectusNoteDiff = this.porrectusNoteDiff;

    var x = this.bounds.x + this.origin.x;
    var y = this.bounds.y + this.origin.y;
    var scaleX = ctxt.glyphScaling;
    var scaleY = ctxt.glyphScaling;
    if (porrectusNoteDiff) {
      scaleY /= ctxt.glyphMultiplier;
      y /= scaleY;
    }
    canvasCtxt.translate(x, y);
    canvasCtxt.scale(scaleX, scaleY);

    for (var i = 0; i < this.glyph.paths.length; i++) {
      var path = this.glyph.paths[i];
      if (!path.data) continue;
      canvasCtxt.fillStyle =
        path.type === "negative"
          ? ctxt.negativeFillColor
          : ctxt.neumeLineColor;
      // glyph paths are shared module-level objects, so the parsed Path2D is cached on them
      canvasCtxt.fill(path.path2d || (path.path2d = new Path2D(path.data)));
    }

    canvasCtxt.scale(1 / scaleX, 1 / scaleY);
    canvasCtxt.translate(-x, -y);
  }

  getSvgAttributes(ctxt: ChantContext, source?: GlyphSource) {
    let className = "";
    const porrectusNoteDiff = this.porrectusNoteDiff;
    if (porrectusNoteDiff) {
      // only the first note of a porrectus has a porrectus glyph
      let notes = (source as Note).neume!.notes,
        noteIndex = notes.indexOf(source as Note),
        nextNote = notes[noteIndex + 1];
      className = source!.selected
        ? nextNote.selected
          ? "selected"
          : "selectedA"
        : nextNote.selected
        ? "selectedB"
        : "";
    } else {
      let isSelected =
        source && (source.selected || ((source as Clef).model && (source as Clef).model!.selected));
      className = isSelected ? "selected" : "";
    }
    var result: SvgAttributes = {
      "xlink:href": "#" + this.glyphCode,
      class: className
    };
    if (source) {
      result["source-index"] = source.sourceIndex;
      result["element-index"] = source.elementIndex;
      if ('noteIndex' in source) {
        result.class += ' note';
        result.id = ctxt.noteIdPrefix + (source.noteIndex! + 1);
        if (source.neume) {
          const glyphCode = source.glyphVisualizer!.glyphCode;
          if (porrectusNoteDiff) {
            result.class += ' porrectus porrectus-start';
          } else if (glyphCode === 'None') {
            result.class += ' porrectus porrectus-end';
          }
        }
      }
    }
    if (ctxt.scaleDefs === true) {
      result.x = this.bounds.x + this.origin.x;
      result.y = this.bounds.y + this.origin.y;
      if (porrectusNoteDiff) {
        // result.transform = "scale(" + (porrectusNoteDiff / (porrectusNoteDiff + 1)) + ")";
        const scaleGlyph = 1 / ctxt.glyphMultiplier;
        result.transform = "scale(1," + scaleGlyph + ")";
        result.y /= scaleGlyph;
      }
    } else {
      const scaleGlyph = porrectusNoteDiff
        ? ctxt.glyphScaling / ctxt.glyphMultiplier
        : ctxt.glyphScaling;
      result.x = (this.bounds.x + this.origin.x) / ctxt.glyphScaling;
      result.y = (this.bounds.y + this.origin.y) / scaleGlyph;
      result.transform = "scale(" + ctxt.glyphScaling + "," + scaleGlyph + ")";
    }
    return result;
  }

  createSvgNode(ctxt: ChantContext, source?: GlyphSource) {
    var attributes = this.getSvgAttributes(ctxt, source);
    attributes.source = source;
    return QuickSvg.createNode("use", attributes);
  }
  createSvgTree(ctxt: ChantContext, source?: GlyphSource) {
    var attributes = this.getSvgAttributes(ctxt, source);
    if (source) attributes.source = source;
    return QuickSvg.createSvgTree("use", attributes);
  }

  createSvgFragment(ctxt: ChantContext, source?: GlyphSource) {
    return QuickSvg.createFragment("use", this.getSvgAttributes(ctxt, source));
  }
}

export class RoundBraceVisualizer extends ChantLayoutElement {
  isAbove: boolean;
  braceHeight: number;
  accent?: GlyphVisualizer;

  constructor(ctxt: ChantContext, x1: number, x2: number, y: number, isAbove: boolean) {
    super();
    this.ignoreBounds = true;

    if (x1 > x2) {
      // swap the xs
      var temp = x1;
      x1 = x2;
      x2 = temp;
    }

    this.isAbove = isAbove;
    this.braceHeight = (3 * ctxt.staffInterval) / 2;

    this.bounds = new Rect(
      x1,
      isAbove ? y - this.braceHeight : y,
      x2 - x1,
      this.braceHeight
    );

    this.origin.x = 0;
    this.origin.y = 0;
  }

  draw(ctxt: ChantContext) {
    /**
     * @type CanvasRenderingContext2D
     */
    var d = ctxt.canvasCtxt!;

    const { x1, x2, y, cx1, cx2, cy } = this.getPathPoints();
    d.beginPath();
    d.moveTo(x1, y);
    d.bezierCurveTo(cx1, cy, cx2, cy, x2, y);
    d.stroke();
  }

  getSvgPathProps(ctxt: ChantContext) {
    return {
      d: this.generatePathString(),
      stroke: ctxt.neumeLineColor,
      "stroke-width": ctxt.staffLineWeight + "px",
      fill: "none",
      class: "brace"
    };
  }

  createSvgNode(ctxt: ChantContext) {
    var node = QuickSvg.createNode("path", this.getSvgPathProps(ctxt));
    if (this.accent) {
      return QuickSvg.createNode(
        "g",
        {
          class: "accentedBrace"
        },
        [node, this.accent.createSvgNode(ctxt)]
      );
    } else return node;
  }
  createSvgTree(ctxt: ChantContext) {
    var node = QuickSvg.createSvgTree("path", this.getSvgPathProps(ctxt));
    if (this.accent) {
      return QuickSvg.createSvgTree(
        "g",
        {
          class: "accentedBrace"
        },
        node,
        this.accent.createSvgTree(ctxt)
      );
    } else return node;
  }

  createSvgFragment(ctxt: ChantContext) {
    var fragment = QuickSvg.createFragment("path", this.getSvgPathProps(ctxt));

    if (this.accent) {
      fragment += this.accent.createSvgFragment(ctxt);

      return QuickSvg.createFragment(
        "g",
        {
          class: "accentedBrace"
        },
        fragment
      );
    } else return fragment;
  }

  getPathPoints() {
    var x1 = this.bounds.x;
    var x2 = this.bounds.right();
    var width = this.bounds.width;
    var y, dx, dy;

    dx = width / 6;
    dy = this.bounds.height;
    if (this.isAbove) {
      y = this.bounds.bottom();
      dy = -dy;
    } else {
      y = this.bounds.y;
    }

    //Calculate Control Points of path,
    var cx1 = x1 + dx;
    var cy = y + dy;
    var cx2 = x2 - dx;

    return { x1, x2, y, cx1, cx2, cy };
  }

  // returns svg path d string
  generatePathString() {
    const { x1, x2, y, cx1, cx2, cy } = this.getPathPoints();

    // two decimal points should be enough, but if we need more precision, we can
    // up it here.
    var dp = 2;
    return (
      "M " +
      x1.toFixed(dp) +
      " " +
      y.toFixed(dp) +
      " C " +
      cx1.toFixed(dp) +
      " " +
      cy.toFixed(dp) +
      " " +
      cx2.toFixed(dp) +
      " " +
      cy.toFixed(dp) +
      " " +
      x2.toFixed(dp) +
      " " +
      y.toFixed(dp)
    );
  }
}

export class CurlyBraceVisualizer extends ChantLayoutElement {
  isAbove: boolean;
  braceHeight: number;
  accent?: GlyphVisualizer;

  constructor(
    ctxt: ChantContext,
    x1: number,
    x2: number,
    y: number,
    isAbove = true,
    addAcuteAccent = false
  ) {
    super();

    if (x1 > x2) {
      // swap the xs
      var temp = x1;
      x1 = x2;
      x2 = temp;
    }

    this.isAbove = isAbove;
    this.braceHeight = ctxt.staffInterval / 2;

    // y is the actual vertical start of the brace (left hand side)
    // thus for a brace over notes, bounds.y is the bottom of brace,
    // but for a brace under the notes, y is simply the y passed in.
    if (isAbove) y -= this.braceHeight;

    var bounds = new Rect(x1, y, x2 - x1, this.braceHeight);

    if (addAcuteAccent && isAbove) {
      this.accent = new GlyphVisualizer(ctxt, GlyphCode.AcuteAccent);
      this.accent.bounds.x += bounds.x + (x2 - x1) / 2;
      this.accent.bounds.y += bounds.y - ctxt.staffInterval / 4;

      bounds.union(this.accent.bounds);
    }

    this.bounds = bounds;

    this.origin.x = 0;
    this.origin.y = 0;
  }

  getSvgPathProps(ctxt: ChantContext) {
    return {
      d: this.generatePathString(),
      stroke: ctxt.neumeLineColor,
      "stroke-width": ctxt.staffLineWeight + "px",
      fill: "none",
      class: "brace"
    };
  }

  createSvgNode(ctxt: ChantContext) {
    var node = QuickSvg.createNode("path", this.getSvgPathProps(ctxt));

    if (this.accent) {
      return QuickSvg.createNode(
        "g",
        {
          class: "accentedBrace"
        },
        [node, this.accent.createSvgNode(ctxt)]
      );
    } else return node;
  }
  createSvgTree(ctxt: ChantContext) {
    var node = QuickSvg.createSvgTree("path", this.getSvgPathProps(ctxt));
    if (this.accent) {
      return QuickSvg.createSvgTree(
        "g",
        {
          class: "accentedBrace"
        },
        node,
        this.accent.createSvgTree(ctxt)
      );
    } else return node;
  }

  createSvgFragment(ctxt: ChantContext) {
    var fragment = QuickSvg.createFragment("path", this.getSvgPathProps(ctxt));

    if (this.accent) {
      fragment += this.accent.createSvgFragment(ctxt);

      return QuickSvg.createFragment(
        "g",
        {
          class: "accentedBrace"
        },
        fragment
      );
    } else return fragment;
  }

  // code below inspired by: https://gist.github.com/alexhornbake
  // optimized for braces that are only drawn horizontally.
  // returns svg path d string
  generatePathString() {
    var q = 0.6; // .5 is normal, higher q = more expressive bracket

    var x1 = this.bounds.x;
    var x2 = this.bounds.right();
    var width = this.bounds.width;
    var y, h;

    if (this.isAbove) {
      y = this.bounds.bottom();
      h = -this.braceHeight;
    } else {
      y = this.bounds.y;
      h = this.braceHeight;
    }

    // calculate Control Points of path
    var qy1 = y + q * h;
    var qx2 = x1 + 0.25 * width;
    var qy2 = y + (1 - q) * h;
    var tx1 = x1 + 0.5 * width;
    var ty1 = y + h;
    var qy3 = y + q * h;
    var qx4 = x1 + 0.75 * width;
    var qy4 = y + (1 - q) * h;

    // two decimal points should be enough, but if we need more precision, we can
    // up it here.
    var dp = 2;
    return (
      "M " +
      x1.toFixed(dp) +
      " " +
      y.toFixed(dp) +
      " Q " +
      x1.toFixed(dp) +
      " " +
      qy1.toFixed(dp) +
      " " +
      qx2.toFixed(dp) +
      " " +
      qy2.toFixed(dp) +
      " T " +
      tx1.toFixed(dp) +
      " " +
      ty1.toFixed(dp) +
      " M " +
      x2.toFixed(dp) +
      " " +
      y.toFixed(dp) +
      " Q " +
      x2.toFixed(dp) +
      " " +
      qy3.toFixed(dp) +
      " " +
      qx4.toFixed(dp) +
      " " +
      qy4.toFixed(dp) +
      " T " +
      tx1.toFixed(dp) +
      " " +
      ty1.toFixed(dp)
    );
  }
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

// parseInt() of a span's newLine, which is the number of line breaks before
// it, or true where the text was wrapped (which comes out NaN)
const __parseNewLine = (newLine: number | boolean | undefined) =>
  parseInt(newLine as unknown as string);

/** a run of text in one style */
export class TextSpan {
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
  private propertiesVersion?: number;
  private cachedProperties?: CssProperties;
  private cachedCss?: string;

  constructor(
    text: string,
    propertyArray?: SpanPropertyDict[] | null,
    activeTags?: string[],
    index = 0,
    extraProps?: { xOffset?: number; newLine?: number | boolean }
  ) {
    if (typeof propertyArray === "undefined" || propertyArray === null)
      propertyArray = [];

    this.text = text;
    this.propertyArray = propertyArray;
    this.activeTags = activeTags || [];
    this.index = index;
    if (extraProps) {
      if ('xOffset' in extraProps) this.xOffset = extraProps.xOffset;
      if ('newLine' in extraProps) this.newLine = extraProps.newLine;
    }
  }

  /**
   * the styles in propertyArray merged together, which must not be modified.
   * They're kept until the text styles change (see ChantContext.clearTextCache()),
   * since the objects in propertyArray belong to the ChantContext.
   */
  get mergedProperties(): CssProperties {
    if (this.propertiesVersion !== __textStyleVersion) {
      this.propertiesVersion = __textStyleVersion;
      this.cachedProperties = (Object.assign as (...objects: SpanPropertyDict[]) => CssProperties).apply(
        null,
        ([{}] as SpanPropertyDict[]).concat(this.propertyArray)
      );
      this.cachedCss = undefined;
    }
    return this.cachedProperties!;
  }

  get properties() {
    const result: TextSpanProperties = Object.assign({}, this.mergedProperties);
    if ('xOffset' in this) result.xOffset = this.xOffset;
    if ('newLine' in this) result.newLine = this.newLine;
    return result;
  }

  /**
   * @returns {string} the same as getCssForProperties(this.properties)
   */
  getCss() {
    const properties = this.mergedProperties;
    if (this.cachedCss === undefined)
      this.cachedCss = getCssForProperties(properties);
    let css = this.cachedCss;
    if (this.xOffset) css += `xOffset: ${this.xOffset};`;
    if (this.newLine) css += `newLine: ${this.newLine};`;
    return css;
  }

  clone() {
    const result = new TextSpan(
      this.text,
      this.propertyArray,
      this.activeTags,
      this.index
    );
    if ('xOffset' in this) result.xOffset = this.xOffset;
    if ('newLine' in this) result.newLine = this.newLine;
    if ('wrappedSpace' in this) result.wrappedSpace = this.wrappedSpace;
    return result;
  }
}

class MarkupStackFrame {
  tagName: string;
  startIndex: number;
  propertyArray: SpanPropertyDict[];
  symbol?: string;

  constructor(
    tagName: string,
    startIndex: number,
    propertyArray: SpanPropertyDict[] = [],
    symbol?: string
  ) {
    this.tagName = tagName;
    this.startIndex = startIndex;
    this.propertyArray = propertyArray;
    if (symbol) this.symbol = symbol;
  }

  get properties(): CssProperties {
    return (Object.assign as (...objects: SpanPropertyDict[]) => CssProperties).apply(
      null,
      ([{}] as SpanPropertyDict[]).concat(this.propertyArray)
    );
  }

  static createStackFrame(
    ctxt: ChantContext,
    tagName: string,
    startIndex: number,
    extraProperties: CssProperties = {},
    symbol = ''
  ) {
    return new MarkupStackFrame(
      tagName,
      startIndex,
      [ctxt.fontStyleDictionary[tagName], extraProperties],
      symbol
    );
  }
}

// for escaping html strings before they go into the svgs
// adapted from http://stackoverflow.com/a/12034334/5720160
var __subsForTspans: { [char: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};

/** what measureSubstring() gives with returnBBox */
export interface TextBBox {
  width: number;
  height: number;
  x: number;
  y: number;
}

// a place where text can be wrapped: a run of whitespace (from a regular
// expression's match), or a <br>
interface BreakMatch {
  index: number;
  0: string;
  /** whether the line has to break here */
  forced?: boolean;
}

/** A piece of text in a score, e.g. a Lyric, Title, DropCap or Annotation. */
export class TextElement extends ChantLayoutElement {
  fontFamily: (ctxt: ChantContext) => string;
  fontSize: (ctxt: ChantContext) => number;
  textAnchor: string;
  sourceIndex?: number;
  /** the text as given, without its text style's prefix */
  sourceGabc?: string;
  dominantBaseline: string;
  /** the text, without its markup */
  text!: string;
  /** the text, split up by style */
  spans!: TextSpan[];
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

  constructor(
    ctxt: ChantContext,
    text: string,
    fontFamily: (ctxt: ChantContext) => string,
    fontSize: (ctxt: ChantContext) => number,
    textAnchor: string,
    sourceIndex?: number,
    sourceGabc?: string,
    /** set before the text is measured, since its css class can style it */
    textType?: TextTypes[keyof TextTypes]
  ) {
    super();

    // set these to some sane values for now...
    this.bounds.x = 0;
    this.bounds.y = 0;
    this.bounds.width = 0;
    this.bounds.height = 0;
    this.origin.x = 0;
    this.origin.y = 0;

    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    this.textAnchor = textAnchor;
    this.sourceIndex = sourceIndex;
    this.sourceGabc = sourceGabc === undefined ? sourceGabc : restoreEscapes(sourceGabc);
    this.dominantBaseline = "baseline"; // default placement
    if (textType) this.textType = textType;

    this.generateSpansFromText(ctxt, text);

    this.recalculateMetrics(ctxt);
  }

  /**
   * The matching element in score (see TextType.getFromScore()).  For title
   * text, score needs titles.
   */
  getFromScore(score: ChantScore): TextElement | null | undefined {
    return (this.textType as TextType).getFromScore(score, this);
  }

  generateSpansFromText(ctxt: ChantContext, text: string) {
    text = text.replace(/\s+/g, " ");
    this.text = "";
    this.spans = [];

    // save ourselves a lot of grief for a very common text:
    if (text === "*" || text === "+" || text === "†") {
      let properties =
        text === "*"
          ? [ctxt.asteriskProperties]
          : text === "+"
          ? [ctxt.plusProperties]
          : null;
      text = ctxt.specialCharText(text) || text;
      this.spans.push(new TextSpan(text, properties));
      return;
    }

    var markupStack: MarkupStackFrame[] = [];
    var spanStartIndex = 0;
    var newLineInNextSpan = 0;

    // (a frame has no Symbol, so this never matches)
    var filterFrames = (frame: MarkupStackFrame, symbol: number) =>
      (frame as unknown as { Symbol?: unknown }).Symbol === symbol;

    var closeSpan = (spanText: string, index: number, extraProperties?: CssProperties) => {
      if (spanText === "" && !this.dropCap) return;

      this.text += spanText;

      var properties: SpanPropertyDict[] = [];
      for (var i = 0; i < markupStack.length; i++) {
        properties.push.apply(properties, markupStack[i].propertyArray);
      }

      if (extraProperties) properties.push(extraProperties);
      const span = new TextSpan(
        spanText,
        properties,
        markupStack.map((frame) => frame.tagName),
        index
      );
      this.spans.push(span);
      if (newLineInNextSpan) {
        span.newLine = newLineInNextSpan;
        newLineInNextSpan = 0;
      }

    };

    var markupRegex = /(<br\/?>)|<v>([\s\S]*?)(?:<\/v>|$)|(\*)(?=\s*\*|[^*]*(?:$|<v>))|(\+)|<sp>(?:(~)|(')?([ao]e|[æœaeiouy])|([arv])\/)<\/sp>|([arv])\/\.|([℣℟])\.?|(?:([*_^%])|<(\/)?([bceiuv]|ul|sc|tt|font)(?:\s+(?:family="([^"]+)"|fill="([^"]+)"|class="([^"]+)"))*>)(?=(?:(.+?)(?:\11|<\/\13>))?)|<sp>([^<]*?)<\/sp>|\uFDD1([\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S])/gi;
    var vTagRegex = /(\\grecross)|\{greextra\}\{([^}]*)\}|\{?(\\?')?(?:\\([ao]e|æœaeiouy))\}?/gi;
    var match: RegExpExecArray | null = null;
    var openedAsterisk = false;
    var closeCurrentSpan = () =>
      closeSpan(text.substring(spanStartIndex, match!.index), spanStartIndex);
    while ((match = markupRegex.exec(text))) {
      var [
        ,
        newLine,
        vTag,
        asterisk,
        plus,
        tilde,
        accent,
        vowelLigature,
        specialChar,
        specialChar2,
        specialChar3,
        markupSymbol,
        closingTag,
        tagName,
        family,
        fill,
        cssClass,
        enclosedText,
        special,
        escaped
      ] = match;
      specialChar = specialChar || specialChar2 || specialChar3;
      // non-matching symbols first
      if (newLine) {
        // close the current span, if any:
        if (match.index > spanStartIndex) {
          closeCurrentSpan();
        }
        // add the newline span:
        newLineInNextSpan++;
      } else if (vTag) {
        closeCurrentSpan();
        let vMatch: RegExpExecArray | null;
        let lastIndex = 0;
        let iOffset = 0;
        while ((vMatch = vTagRegex.exec(vTag))) {
          if (lastIndex < vMatch.index) {
            closeSpan(vTag.slice(lastIndex, vMatch.index), match.index + lastIndex + iOffset);
            iOffset = 3; // length of '<v>'
          }
          let [, grecross, greextra, accent, diphthong] = vMatch;
          let char = '';
          if (diphthong) {
            char = makeLigature(diphthong);
            if (accent) char = addAccent(char);
            closeSpan(char, match.index + vMatch.index + iOffset)
          } else {
            if (grecross) {
              // grecross is just the command for the Cross:
              // set up greextra so it will get handled with it below:
              greextra = 'Cross';
            }    
            char = (greextraGlyphs as { [name: string]: string })[greextra];
            if (char) {
              closeSpan(char, match.index + vMatch.index + iOffset, { 'font-family': 'greextra' })
            }
          }
          lastIndex = vTagRegex.lastIndex;
          iOffset = 3; // length of '<v>'
        }
        if (lastIndex < vTag.length) {
          closeSpan(vTag.slice(lastIndex), match.index + lastIndex + iOffset);
        }
      } else if (asterisk) {
        closeCurrentSpan();
        // first check if it is just a symbol to close:
        if (
          markupStack.length > 0 &&
          markupStack[markupStack.length - 1].symbol === asterisk
        ) {
          // close asterisk tag
          markupStack.pop();
        } else {
          // add special asterisk:
          closeSpan(ctxt.specialCharText(asterisk) || '*', match.index, ctxt.asteriskProperties);
        }
      } else if (plus) {
        closeCurrentSpan();
        closeSpan(ctxt.specialCharText(plus) || '+', match.index, ctxt.plusProperties);
      } else if (tilde) {
        closeCurrentSpan();
        closeSpan('∼', match.index);
      } else if (vowelLigature) {
        let vowel = makeLigature(vowelLigature);
        if (accent) vowel = addAccent(vowel);
        closeCurrentSpan();
        closeSpan(vowel, match.index);
      } else if (specialChar) {
        closeCurrentSpan();
        closeSpan(
          ctxt.textBeforeSpecialChar +
            ctxt.specialCharText(specialChar) +
            ctxt.textAfterSpecialChar,
          match.index,
          ctxt.specialCharProperties
        );
      } else if (escaped) {
        // a character that Gregorio's $ escaped (see gabcEscapes.ts)
        closeCurrentSpan();
        closeSpan(unescapeChar(escaped), match.index);
      } else if (special !== undefined) {
        // the rest of Gregorio's specials
        closeCurrentSpan();
        let specialText = Object.prototype.hasOwnProperty.call(ctxt.specials, special)
          ? ctxt.specials[special]
          : special;
        if (specialText === "*")
          closeSpan(ctxt.specialCharText("*") || "*", match.index, ctxt.asteriskProperties);
        else if (specialText === "+")
          closeSpan(ctxt.specialCharText("+") || "+", match.index, ctxt.plusProperties);
        else closeSpan(specialText, match.index);
      } else {
        // otherwise we're dealing with matching markup delimeters
        if (markupSymbol === "*") {
          // we are only strict with the asterisk, because there are cases when it needs to be displayed rather than count as a markup symbol
          if (enclosedText && /[^\s*]/.test(enclosedText)) {
            openedAsterisk = true;
          } else if (openedAsterisk) {
            openedAsterisk = false;
          } else {
            // actually use the asterisk, since it doesn't have a matching closing asterisk
            continue;
          }
        }
        if (markupSymbol) {
          tagName = ctxt.markupSymbolDictionary[markupSymbol];
          if (
            markupStack.length > 0 &&
            markupStack[markupStack.length - 1].tagName === tagName &&
            markupStack[markupStack.length - 1].symbol === markupSymbol
          ) {
            (closingTag as unknown as boolean) = true;
          }
        }
        if (
          markupStack.length > 0 &&
          markupStack[markupStack.length - 1].tagName === tagName
        ) {
          if (closingTag) {
            // group close
            closeCurrentSpan();
            markupStack.pop();
          }
        } else if (markupStack.filter(filterFrames).length > 0) {
          // trying to open a recursive group (or forgot to close a previous group)
          // in either case, we just unwind to the previous stack frame
          spanStartIndex = markupStack[markupStack.length - 1].startIndex;
          markupStack.pop();
          continue;
        } else {
          closeCurrentSpan();
          if (closingTag) {
            // out of order group close:
            let index = markupStack.findIndex(
              (frame) => frame.tagName === tagName
            );
            if (index >= 0) {
              markupStack.splice(index, 1);
            }
          } else {
            // group open
            const extraProperties: CssProperties = {};
            if (family) extraProperties['font-family'] = family;
            if (fill) extraProperties.fill = fill;
            if (cssClass) extraProperties.class = cssClass;
            markupStack.push(
              MarkupStackFrame.createStackFrame(ctxt, tagName, match.index, extraProperties, markupSymbol)
            );
          }
        }
      }

      // advance the start index past the current markup
      spanStartIndex = match.index + match[0].length;
    }

    // if we finished matches, and there is still some text left,
    // or if we haven't generated any spans yet, create one final run
    if (spanStartIndex < text.length || this.spans.length === 0)
      closeSpan(text.slice(spanStartIndex), spanStartIndex);
  }

  getCanvasFontForProperties(ctxt: ChantContext, properties: CssProperties | TextSpanProperties = {}) {
    var font = "";
    if (properties["font-style"] === "italic") font += "italic ";
    if (properties["font-variant"] === "small-caps") font += "small-caps ";
    if (properties["font-weight"] === "bold") font += "bold ";
    let fontSize = parseFloat(properties["font-size"] as string) || this.fontSize(ctxt);
    if (/%$/.test(properties["font-size"] as string)) {
      fontSize *= this.fontSize(ctxt) / 100;
    }
    font += `${fontSize * (this.resize || 1)}px `;
    font += properties["font-family"] || this.fontFamily(ctxt);
    return font;
  }

  measureSubstringBBox(ctxt: ChantContext, length?: number) {
    return this.measureSubstring(ctxt, length, true);
  }

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
  measureSubstring(
    ctxt: ChantContext,
    length?: number,
    returnBBox?: false,
    lastLineOnly?: boolean
  ): number;
  measureSubstring(
    ctxt: ChantContext,
    length: number | undefined,
    returnBBox: true,
    lastLineOnly?: boolean
  ): TextBBox;
  measureSubstring(
    ctxt: ChantContext,
    length?: number,
    returnBBox = false,
    lastLineOnly = false
  ): number | TextBBox {
    if (length === 0) return 0;
    if (!length) length = Infinity;
    var lines: number | undefined;
    if (length < 0) {
      lines = -length;
      length = Infinity;
    }
    var strategy = ctxt.textMeasuringStrategy;
    var width = 0;
    var widths: number[] = [];
    var newLineSpans = [this.spans[0]];
    var subStringLength = 0;
    var numLines = 1;
    var fontSize = this.fontSize(ctxt) * (this.resize || 1);
    var bbox = new Rect(0, 0, 0, 0);
    for (var i = 0; i < this.spans.length; i++) {
      var span = this.spans[i],
        myText = span.text.slice(0, length - subStringLength);
      if (span.newLine) {
        numLines += __parseNewLine(span.newLine) || 1;
        if (!lines && this.rightAligned === true && length === Infinity) {
          newLineSpans[newLineSpans.length - 1].xOffset =
            this.firstLineMaxWidth! - width;
          newLineSpans.push(span);
        } else if (--lines! === 0) break;
        widths.push(width);
        width = 0;
      }
      if (strategy === TextMeasuringStrategy.Canvas) {
        let metrics = ctxt.measureCanvasText(
          this.getCanvasFontForProperties(ctxt, span.mergedProperties),
          myText
        );
        if ("actualBoundingBoxAscent" in metrics) {
          let left = metrics.actualBoundingBoxLeft;
          bbox.union(
            new Rect(
              width - left,
              fontSize * (numLines - 1) - metrics.actualBoundingBoxAscent,
              metrics.width + left,
              metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent
            )
          );
          if (this instanceof DropCap) {
            width += Math.max(0, left);
          }
        } else {
          bbox.union(
            new Rect(width, fontSize * (numLines - 2), (metrics as TextMetrics).width, fontSize)
          );
        }
        width += metrics.width;
      } else if (
        strategy === TextMeasuringStrategy.OpenTypeJS &&
        ctxt.fontDictionary
      ) {
        // get the bounding box for the substring, placing it at x = width, y = fontSize * (numLines - 1)
        const properties = span.mergedProperties;
        let font = ctxt.getFontForProperties(
          properties,
          properties["font-family"] || this.fontFamily(ctxt)
        )!;
        const smallCaps = properties["font-variant"] === "small-caps";
        let spanFontSize = parseFloat(properties["font-size"]) || fontSize;
        if (/%$/.test(properties["font-size"])) {
          spanFontSize *= fontSize / 100;
        }
        const y = fontSize * (numLines - 1);
        if ('getPath' in font) {
          // opentype.js
          const measured = ctxt.measureOpenTypeText(
            font,
            myText,
            width,
            y,
            spanFontSize,
            smallCaps
          );
          let subBbox = measured.bbox;
          let subWidth = measured.advanceWidth;
          bbox.union(
            new Rect(
              width + subBbox.x1,
              subBbox.y1,
              subWidth - subBbox.x1,
              subBbox.y2 - subBbox.y1
            )
          );
          width += subWidth;
          if (this instanceof DropCap) {
            width -= subBbox.x1;
          }
        } else {
          // fontkit
          const run = ctxt.layoutFontkitText(font, myText, smallCaps);
          const { unitsPerEm }= font;
          const multiplier = spanFontSize / unitsPerEm;
          let subBbox = run.bbox;
          let subWidth = run.advanceWidth * multiplier;
          bbox.union(
            new Rect(
              width + subBbox.minX * multiplier,
              y - subBbox.maxY * multiplier,
              subWidth - subBbox.minX * multiplier,
              (subBbox.height) * multiplier
            )
          );
          width += subWidth;
          if (this instanceof DropCap) {
            width -= subBbox.minX * multiplier;
          }
        }        
      } else if (strategy === TextMeasuringStrategy.Svg) {
        const measured = ctxt.measureSvgText(this.createSvgNodeToMeasure(ctxt, span, myText));
        const subBbox = measured.bbox;
        bbox.union(
          new Rect(
            width + subBbox.x,
            fontSize * (numLines - 1) + subBbox.y,
            subBbox.width,
            subBbox.height
          )
        );
        width += measured.advanceWidth;
        if (this instanceof DropCap) {
          width -= Math.min(0, subBbox.x);
        }
      }
      subStringLength += myText.length;
      if (subStringLength === length) break;
    }
    if (
      !lines &&
      width &&
      newLineSpans.length &&
      this.rightAligned === true &&
      length === Infinity
    ) {
      newLineSpans[newLineSpans.length - 1].xOffset =
        this.firstLineMaxWidth! - width;
    }
    if (!lastLineOnly) width = Math.max(width, ...widths);
    if (returnBBox === true) {
      let height = bbox.height;
      let y = bbox.y,
        x = bbox.x;
      return { width, height, x, y };
    } else {
      return width;
    }
  }

  recalculateMetrics(ctxt: ChantContext, resetNewLines = true) {
    if (resetNewLines) {
      delete this.maxWidth;
      delete this.firstLineMaxWidth;
      delete this.rightAligned;
      delete this.resize;
      delete this.numLines;
      // put back the whitespace that was taken out where the text was wrapped
      this.spans.forEach((span) => {
        delete span.xOffset;
        if (span.newLine === true) {
          delete span.newLine;
          span.text = (span.wrappedSpace || " ") + span.text;
          delete span.wrappedSpace;
        }
      });
    }

    this.bounds.x = 0;
    this.bounds.y = 0;

    this.origin.x = 0;

    if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
      while (ctxt.svgTextMeasurer!.firstChild)
        ctxt.svgTextMeasurer!.removeChild(ctxt.svgTextMeasurer!.firstChild);
      ctxt.svgTextMeasurer!.appendChild(this.createSvgNode(ctxt));
      ctxt.svgTextMeasurer!.appendChild(ctxt.createStyleNode());

      // (the loop above leaves TypeScript thinking that firstChild is null)
      var bbox = (ctxt.svgTextMeasurer!.firstChild as unknown as SVGGraphicsElement).getBBox();
      this.bounds.width = bbox.width;
      this.bounds.height = bbox.height;
      this.origin.y = -bbox.y; // offset to baseline from top
      this.origin.x = -bbox.x;
    } else {
      let bbox = this.measureSubstringBBox(ctxt);
      this.bounds.width = bbox.width;
      this.bounds.height = bbox.height;
      this.origin.y = -bbox.y;
      this.origin.x = -bbox.x;
    }
    this.numLines = this.spans.reduce(
      (result, span) =>
        result +
        (span.newLine ? __parseNewLine(span.newLine) || 1 : 0),
      1
    );
  }

  setMaxWidth(ctxt: ChantContext, maxWidth: number, firstLineMaxWidth = maxWidth) {
    if (this.spans.filter((s) => s.newLine === true).length) {
      // first get rid of any new lines set from a previous maxWidth
      this.recalculateMetrics(ctxt);
    }
    if (this.bounds.width > maxWidth) {
      this.maxWidth = maxWidth;
      var percentage = maxWidth / this.bounds.width;
      if (this instanceof Lyric && percentage >= 0.85) {
        this.resize = percentage;
      } else {
        if (firstLineMaxWidth < 0) firstLineMaxWidth = maxWidth;
        this.firstLineMaxWidth = firstLineMaxWidth;
        // the places where a line could break: each run of whitespace, and the end
        var matches: BreakMatch[] = [],
          regex = /\s+|$/g,
          match: BreakMatch | null;
        while (
          (match = regex.exec(this.text)) &&
          (!matches.length || match.index > matches[matches.length - 1].index)
        )
          matches.push(match);
        // whitespace at the very start doesn't end a word, so breaking there
        // would only leave the first line empty, and whitespace at the very
        // end is where the text ends
        if (matches.length > 1 && matches[0].index === 0) matches.shift();
        if (
          matches.length > 1 &&
          matches[matches.length - 2].index +
            matches[matches.length - 2][0].length ===
            this.text.length
        )
          matches.pop();
        // a line can't go on past a <br>, so mark where each one is as forced,
        // along with any whitespace next to it, which then isn't measured as
        // part of the line before it
        var position = 0;
        this.spans.forEach((span, i) => {
          if (i && span.newLine) {
            let j = 0;
            while (matches[j].index + matches[j][0].length < position) j++;
            if (matches[j].index <= position) matches[j].forced = true;
            else matches.splice(j, 0, { index: position, 0: "", forced: true });
          }
          position += span.text.length;
        });
        var max = firstLineMaxWidth,
          // the match that ends the first word on the current line, which is
          // the first it can be broken after
          lineStart = 0,
          // how many characters of this.text the line breaks so far have taken
          // out of the spans, so that an index into this.text is that many
          // characters further on in the spans
          removed = 0;
        while (lineStart < matches.length) {
          // the line goes on to the next <br> at the most
          var lineEnd = lineStart;
          while (lineEnd < matches.length - 1 && !matches[lineEnd].forced)
            lineEnd++;
          // the first match after lineStart at which the line is too wide.  The
          // line is broken at the match before it.
          var index = this.findFirstMatchWiderThan(
            ctxt,
            matches,
            lineStart + 1,
            max,
            removed,
            lineEnd + 1
          );
          if (index > lineEnd) {
            // the rest of the line fits
            max = maxWidth;
            lineStart = lineEnd + 1;
            continue;
          }
          var lastMatch = matches[index - 1];
          match = matches[index];
          // find the spans the whitespace to break at starts and ends in
          var breakStart = lastMatch.index - removed,
            breakEnd = breakStart + lastMatch[0].length,
            spanIndex = 0,
            length = 0;
          while (
            spanIndex < this.spans.length - 1 &&
            length + this.spans[spanIndex].text.length <= breakStart
          ) {
            length += this.spans[spanIndex++].text.length;
          }
          var splitSpan = this.spans[spanIndex],
            textLeft = splitSpan.text.slice(0, breakStart - length),
            endIndex = spanIndex;
          while (
            endIndex < this.spans.length - 1 &&
            length + this.spans[endIndex].text.length < breakEnd
          ) {
            length += this.spans[endIndex++].text.length;
          }
          var endSpan = this.spans[endIndex],
            nextSpan = this.spans[endIndex + 1],
            textRight = endSpan.text.slice(breakEnd - length),
            newSpans: TextSpan[] = [];
          this.rightAligned =
            max === firstLineMaxWidth && firstLineMaxWidth !== maxWidth;
          removed += lastMatch[0].length;
          if (textLeft) {
            let left = new TextSpan(
              textLeft,
              splitSpan.propertyArray,
              splitSpan.activeTags,
              undefined,
              // keep the line break of a span that starts a line
              "newLine" in splitSpan
                ? { newLine: splitSpan.newLine }
                : undefined
            );
            if ("wrappedSpace" in splitSpan)
              left.wrappedSpace = splitSpan.wrappedSpace;
            newSpans.push(left);
          }
          // the span that starts the new line keeps the whitespace taken out,
          // to put back if the text is wrapped again (see recalculateMetrics())
          if (textRight) {
            let right = new TextSpan(
              textRight,
              endSpan.propertyArray,
              endSpan.activeTags,
              undefined,
              { newLine: true }
            );
            right.wrappedSpace = lastMatch[0];
            newSpans.push(right);
          } else if (nextSpan) {
            nextSpan.newLine = true;
            nextSpan.wrappedSpace = lastMatch[0];
          }
          this.spans.splice(spanIndex, endIndex - spanIndex + 1, ...newSpans);
          this.needsLayout = true;
          max = maxWidth;
          if (
            match!.index === this.text.length ||
            this.measureSubstring(ctxt) <= maxWidth
          )
            break;
          lineStart = index;
        }
      }
      this.recalculateMetrics(ctxt, false);
    }
  }

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
  findFirstMatchWiderThan(
    ctxt: ChantContext,
    matches: BreakMatch[],
    start: number,
    max: number,
    removed = 0,
    end = matches.length
  ) {
    // only the last line matters, since the lines before it were already
    // broken where they fit
    var isWider = (i: number) =>
      this.measureSubstring(ctxt, matches[i].index - removed, false, true) >
      max;
    // first gallop forward to bracket the match...
    var low = start,
      high = start,
      step = 1;
    while (high < end && !isWider(high)) {
      low = high + 1;
      high += step;
      step *= 2;
    }
    high = Math.min(high, end);
    // ...then search between the last one that fit and the first that didn't
    while (low < high) {
      var mid = (low + high) >> 1;
      if (isWider(mid)) high = mid;
      else low = mid + 1;
    }
    return low;
  }

  getCssClasses() {
    return (this.textType && this.textType.cssClass) || "";
  }

  getExtraStyleProperties(ctxt: ChantContext): CssProperties {
    return ctxt.baseTextStyle || {};
  }

  static escapeForTspan(string: unknown) {
    return String(string).replace(/[&<>]/g, function (s) {
      return __subsForTspans[s];
    });
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;

    if (this.textAnchor === "middle") canvasCtxt.textAlign = "center";
    else canvasCtxt.textAlign = "start";

    var translateWidth = 0,
      translateHeight = 0,
      extraStyleProperties = this.getExtraStyleProperties(ctxt),
      font: string | null = null;
    for (var i = 0; i < this.spans.length; i++) {
      var span = this.spans[i];
      var xOffset = span.xOffset || 0;
      if (span.newLine) {
        let count = __parseNewLine(span.newLine) || 1;
        canvasCtxt.translate(
          translateWidth + xOffset,
          this.fontSize(ctxt) * count
        );
        translateWidth = -xOffset;
        translateHeight -= this.fontSize(ctxt);
      } else if (xOffset) {
        canvasCtxt.translate(translateWidth + xOffset, 0);
        translateWidth = -xOffset;
      }
      var properties = Object.assign(
        {},
        extraStyleProperties,
        span.mergedProperties
      );
      var spanFont = this.getCanvasFontForProperties(ctxt, properties);
      if (spanFont !== font) canvasCtxt.font = font = spanFont;
      canvasCtxt.fillStyle = properties.fill || "#000";
      canvasCtxt.fillText(
        span.text,
        this.bounds.x,
        this.bounds.y,
        span.textLength || undefined
      );
      var metrics = ctxt.measureCanvasText(font!, span.text);
      translateWidth -= metrics.width;
      canvasCtxt.translate(metrics.width, 0);
    }
    canvasCtxt.translate(translateWidth, translateHeight);
  }

  getSvgProps(): SvgAttributes {
    return {
      "source-index": this.sourceIndex,
      x: this.bounds.x,
      y: this.bounds.y,
      class: this.getCssClasses().trim(),
      "text-anchor": this.textAnchor
      //'dominant-baseline': this.dominantBaseline, // hanging baseline doesn't work in Safari
    };
  }

  getSpanOptions(span: TextSpan, ctxt: ChantContext, useStyleObject = false) {
    var properties = span.mergedProperties;
    var options: SvgAttributes = {
      "source-index": span.index,
      class: properties.class,
      style: useStyleObject ? span.properties : span.getCss()
    };

    if (span.newLine) {
      var xOffset = span.xOffset || 0;
      options.dy = 1.1 * (__parseNewLine(span.newLine) || 1) + "em";
      options.x = this.bounds.x + xOffset;
    } else if (span.xOffset) {
      options.x = this.bounds.x + span.xOffset;
    }
    if (span.textLength) {
      options.textLength = span.textLength;
      options.lengthAdjust = "spacingAndGlyphs";
      options.y = this.bounds.y;
    }
    if (this.resize) {
      options["font-size"] =
        properties["font-size"] || this.fontSize(ctxt) * this.resize;
    }
    // if (ctxt.setFontFamilyAttributes) {
    //   options["font-family"] =
    //     span.properties["font-family"] ||
    //     getFontFilenameForProperties(span.properties, this.fontFamily(ctxt));
    //   let properties = Object.assign({}, span.properties);
    //   delete properties["font-weight"];
    //   delete properties["font-style"];
    //   options["style"] = getCssForProperties(properties);
    // } else {
    //   options["style"] = getCssForProperties(span.properties);
    // }

    return options;
  }

  /**
   * a text element of text in span's style, styled as createSvgNode() styles
   * this one, but starting at the origin, for TextMeasuringStrategy.Svg
   */
  createSvgNodeToMeasure(ctxt: ChantContext, span: TextSpan, text: string) {
    const properties = span.mergedProperties;
    const extraStyleProperties = this.getExtraStyleProperties(ctxt);
    let textClass = this.getCssClasses().trim();
    if (extraStyleProperties.class) textClass = extraStyleProperties.class + " " + textClass;
    const spanNode = QuickSvg.createNode(
      "tspan",
      {
        class: properties.class,
        style: getCssForProperties(properties),
        "font-size": this.resize
          ? properties["font-size"] || this.fontSize(ctxt) * this.resize
          : undefined
      },
      text
    );
    return QuickSvg.createNode(
      "text",
      { class: textClass, style: getCssForProperties(extraStyleProperties) },
      spanNode
    ) as unknown as SVGTextElement;
  }

  createSvgNode(ctxt: ChantContext) {
    var spans = [];

    for (var i = 0; i < this.spans.length; i++) {
      let span = this.spans[i];
      let options = this.getSpanOptions(span, ctxt);

      spans.push(QuickSvg.createNode("tspan", options, span.text));
    }

    let options = this.getSvgProps();
    const extraStyleProperties = this.getExtraStyleProperties(ctxt);
    options.style = getCssForProperties(extraStyleProperties);
    if (extraStyleProperties.class) {
      options.class = extraStyleProperties.class + ' ' + options.class;
    }
    options.source = this;

    return (this.svgNode = QuickSvg.createNode("text", options, spans));
  }
  createSvgTree(ctxt: ChantContext) {
    var spans = [];

    for (var i = 0; i < this.spans.length; i++) {
      let span = this.spans[i];
      let options = this.getSpanOptions(span, ctxt, true);

      spans.push(QuickSvg.createSvgTree("tspan", options, span.text));
    }

    let options = this.getSvgProps();
    options.style = this.getExtraStyleProperties(ctxt);
    if (options.style.class) {
      options.class = options.style.class + ' ' + options.class;
    }
    options.source = this;

    return QuickSvg.createSvgTree("text", options, ...spans);
  }

  createSvgFragment(ctxt: ChantContext) {
    var spans = "";

    for (var i = 0; i < this.spans.length; i++) {
      let span = this.spans[i];
      let options = this.getSpanOptions(span, ctxt);

      spans += QuickSvg.createFragment(
        "tspan",
        options,
        TextElement.escapeForTspan(span.text)
      );
    }

    let options = this.getSvgProps();
    const extraStyleProperties = this.getExtraStyleProperties(ctxt)
    options.style = getCssForProperties(extraStyleProperties);
    if (extraStyleProperties.class) {
      options.class = extraStyleProperties.class + ' ' + options.class;
    }
    if (ctxt.setFontFamilyAttributes) {
      options["font-size"] = this.fontSize(ctxt);
    }

    return QuickSvg.createFragment("text", options, spans);
  }
}

export const LyricType = {
  SingleSyllable: 0,
  BeginningSyllable: 1,
  MiddleSyllable: 2,
  EndingSyllable: 3,

  Directive: 4 // for asterisks, "ij." elements, or other performance notes.
} as const;
export type LyricType = (typeof LyricType)[keyof typeof LyricType];

/** helpers for the lyrics of a notation, one for each line of lyrics */
export const LyricArray = {
  getLeft: function (lyricArray: Lyric[]) {
    if (lyricArray.length === 0) return NaN;

    var x = Number.MAX_VALUE;
    for (var i = 0; i < lyricArray.length; i++) {
      if (lyricArray[i])
        x = Math.min(
          x,
          lyricArray[i].notation.bounds.x + lyricArray[i].bounds.x
        );
    }

    return x;
  },

  getRight: function (lyricArray: Lyric[], presumeConnectorNeeded?: boolean) {
    if (lyricArray.length === 0) return NaN;

    var x = Number.MIN_VALUE;
    for (var i = 0; i < lyricArray.length; i++) {
      let l = lyricArray[i];
      if (l)
        x = Math.max(
          x,
          l.notation.bounds.x +
            l.bounds.x +
            l.bounds.width +
            (presumeConnectorNeeded &&
            l.allowsConnector() &&
            !l.preventConnector &&
            !l.needsConnector
              ? l.getConnectorWidth()
              : 0)
        );
    }

    return x;
  },

  hasOnlyOneLyric: function (lyricArray: Lyric[]) {
    return lyricArray.filter((l) => l.originalText).length === 1;
  },

  indexOfLyric: function (lyricArray: Lyric[]) {
    return lyricArray.indexOf(lyricArray.filter((l) => l.originalText)[0]);
  },

  mergeIn: function (lyricArray: Lyric[], newLyrics: Lyric[]) {
    for (var i = 0; i < newLyrics.length; ++i) {
      if (newLyrics[i].originalText || !lyricArray[i])
        lyricArray[i] = newLyrics[i];
    }
  },

  mergeInArray: function (lyricArray: Lyric[], notations: ChantNotationElement[]) {
    for (var i = 0; i < notations.length; ++i) {
      this.mergeIn(lyricArray, notations[i].lyrics);
    }
  },

  setNotation: function (lyricArray: Lyric[], notation: ChantNotationElement) {
    notation.lyrics = lyricArray;
    for (var i = 0; i < lyricArray.length; ++i) {
      lyricArray[i].notation = notation;
    }
  }
};

export class Lyric extends TextElement {
  declare textType: TextTypes["lyric"];
  declare sourceIndex: number;
  declare sourceGabc: string;
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
  connectorWidth!: number;
  defaultConnectorWidth!: number;
  widthWithoutConnector!: number;
  vowelSegmentWidth!: number;
  elidesToNext?: boolean;
  /** Gregorio's <clear>: the lyric may not reach back under the previous syllable's notes */
  clear?: boolean;
  /** Gregorio's <pr>: how much of the lyric may go into the right margin */
  protrusion?: LyricProtrusion;
  /** which line of lyrics this is */
  lyricIndex?: number;
  /** the right edge of a line of text-only syllables that starts with this lyric */
  lineWidth?: number;

  constructor(
    ctxt: ChantContext,
    text: string,
    lyricType?: LyricType | null | "",
    notation?: ChantNotationElement,
    notations?: ChantNotationElement[],
    sourceIndex?: number
  ) {
    super(
      ctxt,
      (ctxt.textStyles.lyric.prefix || "") + text,
      (ctxt) => ctxt.textStyles.lyric.font,
      (ctxt) => ctxt.textStyles.lyric.size,
      "start",
      sourceIndex,
      text,
      TextTypes.lyric
    );

    // save the original text in case we need to later use the lyric
    // in a dropcap...
    this.originalText = text;

    // (only the lyrics of a score have a notation, rather than e.g. a hyphen being measured)
    this.notation = notation!;
    this.notations = notations;

    if (
      typeof lyricType === "undefined" ||
      lyricType === null ||
      lyricType === ""
    )
      this.lyricType = LyricType.SingleSyllable;
    else this.lyricType = lyricType;

    // Lyrics keep track of how to center them on notation elements.
    // centerTextIndex is the index in this.text where the centering starts,
    // centerLength is how many characters comprise the center point.
    // performLayout will do the processing
    this.centerStartIndex = -1;
    this.centerLength = text.length;

    this.needsConnector = false;
    this.preventConnector = false;

    // Lyrics can have their own language defined, which affects the alignment
    // of the text with the notation element
    this.language = null;

    if (this.allowsConnector())
      this.connectorSpan = new TextSpan(ctxt.syllableConnector);

    // TextElement measured the lyric before it knew it was a directive, which
    // has a css class of its own and is centered differently
    if (this.lyricType === LyricType.Directive) this.recalculateMetrics(ctxt);
  }

  allowsConnector() {
    return (
      this.lyricType === LyricType.BeginningSyllable ||
      this.lyricType === LyricType.MiddleSyllable
    );
  }

  setForceConnector(force: boolean) {
    this.forceConnector = force && this.allowsConnector();
  }

  // prevents a connector from ever being drawn after this lyric, without
  // affecting how the syllables are otherwise laid out within the word
  setPreventConnector(prevent: boolean) {
    this.preventConnector = prevent && this.allowsConnector();
  }

  setNeedsConnector(needs?: boolean, width?: number) {
    if ((needs === true || this.forceConnector) && !this.preventConnector) {
      this.needsConnector = true;
      if (typeof width !== "undefined") {
        this.setConnectorWidth(width);
      } else {
        this.bounds.width =
          this.widthWithoutConnector + this.getConnectorWidth();
      }

      if (
        this.spans.length > 0 &&
        this.spans[this.spans.length - 1] !== this.connectorSpan
      )
        this.spans.push(this.connectorSpan!);
    } else {
      this.connectorWidth = 0;
      this.needsConnector = false;
      this.bounds.width = this.widthWithoutConnector;

      var span = this.spans.pop();
      if (span && span !== this.connectorSpan) this.spans.push(span);
    }
  }

  setConnectorWidth(width: number) {
    this.connectorWidth = width;
    this.connectorSpan!.textLength = width;
    if (this.needsConnector)
      this.bounds.width = this.widthWithoutConnector + this.getConnectorWidth();
  }

  getConnectorWidth() {
    return this.connectorWidth || this.defaultConnectorWidth;
  }

  getLeft() {
    return this.notation.bounds.x + this.bounds.x;
  }

  getRight() {
    return this.notation.bounds.x + this.bounds.x + this.bounds.width;
  }

  recalculateMetrics(ctxt: ChantContext, resetNewLines = true) {
    this.setNeedsConnector();

    super.recalculateMetrics(ctxt, resetNewLines);

    this.widthWithoutConnector = this.bounds.width;

    this.connectorWidth = 0;
    this.defaultConnectorWidth = ctxt.hyphenWidth;

    var activeLanguage = this.language || ctxt.defaultLanguage;

    // calculate the point where the text lines up to the staff notation
    // and offset the rect that much. By default we just center the text,
    // but the logic below allows for smarter lyric alignment based
    // on manual override or language control.
    var offset = this.widthWithoutConnector / 2,
      x1,
      x2,
      vowelSegmentWidth = this.widthWithoutConnector;

    // some simple checks for sanity, and disable manual centering if the numbers are bad
    if (
      this.centerStartIndex >= 0 &&
      (this.centerStartIndex >= this.text.length ||
        this.centerLength < 0 ||
        this.centerStartIndex + this.centerLength > this.text.length)
    )
      this.centerStartIndex = -1;

    if (this.text.length === 0) {
      // if we have no text to work with, then there's nothing to do!
      // Unless it's a drop cap, in which case we center the connector:
      if (this.dropCap && this.originalText) {
        offset = ctxt.hyphenWidth / 2;
        vowelSegmentWidth = ctxt.hyphenWidth;
      }
    } else if (this.centerStartIndex >= 0) {
      // if we have manually overriden the centering logic for this lyric,
      // then always use that.
      if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
        // svgTextMeasurer still has the current lyric in it...
        x1 = (ctxt.svgTextMeasurer!.firstChild as SVGTextContentElement).getSubStringLength(
          0,
          this.centerStartIndex
        );
        x2 = (ctxt.svgTextMeasurer!.firstChild as SVGTextContentElement).getSubStringLength(
          0,
          this.centerStartIndex + this.centerLength
        );
      } else {
        x1 = this.measureSubstring(ctxt, this.centerStartIndex);
        x2 = this.measureSubstring(
          ctxt,
          this.centerStartIndex + this.centerLength
        );
      }
      offset = (x1 + x2) / 2;
      vowelSegmentWidth = x2 - x1;
    } else {
      // if it's a directive with no manual centering override, then
      // just center the text.
      if (this.lyricType !== LyricType.Directive) {
        // only consider text content after the last space (if any)
        var startIndex = this.text.lastIndexOf(" ") + 1;

        // unless there are no text characters following the space:
        if (
          startIndex > 0 &&
          !this.text
            .slice(startIndex)
            .match(/[a-záéíóúýäëïöüÿàèìòùỳāēīōūȳăĕĭŏŭ]/i)
        ) {
          startIndex = 0;
        }

        // find indices of e tags to ignore when finding vowel segment:
        var ignore: IgnoredRange[] = [];
        let index = 0;
        let indexOffset = startIndex;
        for (var span of this.spans) {
          let endIndex = index + span.text.length;
          if (span.activeTags.includes('e')) {
            if (index <= startIndex) {
              startIndex = endIndex;
            } else {
              ignore.push({ index: index - indexOffset, endIndex: endIndex - indexOffset });
            }
          }
          index = endIndex;
        }
        // Non-directive elements are lined up to the chant notation based on vowel segments,
        var result = activeLanguage.findVowelSegment(this.text, startIndex, ignore);

        if (result.found !== true) {
          var match = this.text.slice(startIndex).match(/[a-z]+/i);
          if (match) {
            result.startIndex = startIndex + match.index!;
            result.length = match[0].length;
          } else {
            result.startIndex = startIndex;
            result.length = this.text.length - startIndex;
          }
        }
        if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
          // svgTextMeasurer still has the current lyric in it...
          x1 = (ctxt.svgTextMeasurer!.firstChild as SVGTextContentElement).getSubStringLength(
            0,
            result.startIndex
          );
          x2 = (ctxt.svgTextMeasurer!.firstChild as SVGTextContentElement).getSubStringLength(
            0,
            result.startIndex + result.length
          );
        } else {
          x1 = this.measureSubstring(ctxt, result.startIndex);
          x2 = this.measureSubstring(ctxt, result.startIndex + result.length);
        }
        offset = (x1 + x2) / 2;
        vowelSegmentWidth = x2 - x1;
      }
    }

    this.vowelSegmentWidth = vowelSegmentWidth;

    this.bounds.x = -offset;
    this.bounds.y = 0;

    this.origin.x = offset;
  }

  generateDropCap(ctxt: ChantContext): DropCap | null {
    if (this.dropCap) return this.dropCap;
    // disallow special characters:
    if (this.spans[0].mergedProperties['font-family'] === ctxt.specialCharProperties['font-family']) {
      return null;
    }
    let dropCapSpan = this.spans[0].clone();
    dropCapSpan.text = dropCapSpan.text.slice(0, 1).toUpperCase();
    let dropCapLowerCase = dropCapSpan.text.toLowerCase();
    // disallow any characters that do not change from .toUpperCase():
    if (dropCapSpan.text === dropCapLowerCase) return null;

    if (dropCapSpan.activeTags.indexOf("sc") >= 0)
      dropCapSpan.text = dropCapLowerCase;

    var dropCap = (this.dropCap = new DropCap(ctxt, "", this.sourceIndex));
    dropCap.spans = [dropCapSpan];
    let dropCapSourceGabcLength = this.sourceGabc.match(
      /^(?:<\/?[^>]+>)*.?(?:<\/[^>]+>)*/
    )![0].length;
    dropCap.sourceGabc = this.sourceGabc.slice(0, dropCapSourceGabcLength);
    this.sourceIndex += dropCap.sourceGabc.length;
    this.sourceGabc = this.sourceGabc.slice(dropCapSourceGabcLength);

    this.spans[0].text = this.spans[0].text.slice(1);
    this.text = this.text.slice(1);
    this.centerStartIndex--; // lost a letter, so adjust centering accordingly

    return dropCap;
  }

  getCssClasses() {
    var classes = this.lyricType === LyricType.Directive ? "directive " : "";

    return classes + super.getCssClasses();
  }

  getExtraStyleProperties(ctxt: ChantContext) {
    var props = super.getExtraStyleProperties(ctxt);

    if (this.lyricType === LyricType.Directive && ctxt.autoColor === true)
      props = Object.assign({}, props, { fill: ctxt.rubricColor });

    return props;
  }
}

export class ChoralSign extends TextElement {
  declare textType: TextTypes["choralSign"];
  positionHint: MarkingPositionHint;
  note: Note;

  constructor(ctxt: ChantContext, text: string, note: Note, sourceIndex?: number) {
    super(
      ctxt,
      (ctxt.textStyles.choralSign.prefix || "") + text,
      (ctxt) => ctxt.textStyles.choralSign.font,
      TextTypes.choralSign.size,
      "start",
      sourceIndex,
      text,
      TextTypes.choralSign
    );
    this.positionHint = MarkingPositionHint.Default;
    this.note = note;
  }

  recalculateMetrics(ctxt: ChantContext) {
    super.recalculateMetrics(ctxt);
  }

  performLayout(ctxt: ChantContext) {
    this.recalculateMetrics(ctxt);
    this.bounds.x =
      this.note.bounds.x +
      Math.max(0, (ctxt.staffInterval - this.bounds.width) / 2); // center on the note itself

    let offset: number, staffPosition: number;
    if (this.positionHint === MarkingPositionHint.Below) {
      offset = -1;
      staffPosition = this.note.staffPosition + 2 * offset;
      staffPosition += staffPosition % 2 === 0 ? 0.3 : 1;
    } else {
      offset = 1;
      staffPosition = this.note.staffPosition + 2 * offset;
      staffPosition += staffPosition % 2 === 0 ? 0.3 : -0.4;
    }
    // if (staffPosition % 2 === 0) staffPosition += offset;
    this.bounds.y =
      ctxt.calculateHeightFromStaffPosition(staffPosition) + this.origin.y;
  }
}

export class AboveLinesText extends TextElement {
  /**
   * @param {String} text
   */
  declare textType: TextTypes["al"];
  declare sourceIndex: number;
  notation: ChantNotationElement;
  padding: number;
  /** which line of above-lines text this is */
  alIndex?: number;
  /** for text above a note, which note of its neume it's above */
  noteIndex?: number;

  constructor(
    ctxt: ChantContext,
    text: string,
    notation: ChantNotationElement | Note | null,
    sourceIndex?: number
  ) {
    super(
      ctxt,
      (ctxt.textStyles.al.prefix || "") + text,
      (ctxt) => ctxt.textStyles.al.font,
      (ctxt) => ctxt.textStyles.al.size,
      "start",
      sourceIndex,
      text,
      TextTypes.al
    );
    // (text above a note gets moved to its neume, see Gabc.createNeumesFromNotes)
    this.notation = notation as ChantNotationElement;

    this.padding = ctxt.staffInterval / 2;
  }
}

export class TranslationText extends TextElement {
  /**
   * @param {String} text
   */
  declare textType: TextTypes["translation"];
  declare sourceIndex: number;
  notation: ChantNotationElement;
  padding: number;
  /** which line of translations this is */
  translationIndex?: number;
  /** the notation a translation ends at, for one that spans several */
  endNeume?: ChantNotationElement;

  constructor(
    ctxt: ChantContext,
    text: string,
    notation: ChantNotationElement | null,
    sourceIndex?: number
  ) {
    var gabcSource = text;
    var anchor = "start";
    if (text === "/") {
      text = "";
      anchor = "end";
    } else {
      text = (ctxt.textStyles.translation.prefix || "") + text;
    }
    super(
      ctxt,
      text,
      (ctxt) => ctxt.textStyles.translation.font,
      (ctxt) => ctxt.textStyles.translation.size,
      anchor,
      sourceIndex,
      gabcSource,
      TextTypes.translation
    );
    this.notation = notation!;

    this.padding = ctxt.staffInterval / 2;
  }
}

export class DropCap extends TextElement {
  /**
   * @param {String} text
   */
  declare textType: TextTypes["dropCap"];
  padding: number;

  constructor(ctxt: ChantContext, text: string, sourceIndex?: number) {
    super(
      ctxt,
      (ctxt.textStyles.dropCap.prefix || "") + text,
      (ctxt) => ctxt.textStyles.dropCap.font,
      (ctxt) => ctxt.textStyles.dropCap.size,
      "middle",
      sourceIndex,
      text,
      TextTypes.dropCap
    );

    this.padding = ctxt.staffInterval * ctxt.textStyles.dropCap.padding;
  }
}

export class TitleTextElement extends TextElement {
  /** the space after the text */
  padding!: (ctxt: ChantContext) => number;

  constructor(
    ctxt: ChantContext,
    text: string,
    fontFamily: (ctxt: ChantContext) => string,
    fontSize: (ctxt: ChantContext) => number,
    textAnchor: string,
    sourceIndex?: number,
    sourceGabc?: string,
    textType?: TextTypes[keyof TextTypes]
  ) {
    super(
      ctxt,
      text,
      fontFamily,
      fontSize,
      textAnchor,
      sourceIndex,
      sourceGabc,
      textType
    );
  }
}

export class Supertitle extends TitleTextElement {
  constructor(ctxt: ChantContext, text: string, sourceIndex?: number) {
    super(
      ctxt,
      (ctxt.textStyles.supertitle.prefix || "") + text,
      (ctxt) => ctxt.textStyles.supertitle.font,
      (ctxt) => ctxt.textStyles.supertitle.size,
      "middle",
      sourceIndex,
      text,
      TextTypes.supertitle
    );

    this.padding = (ctxt: ChantContext) => (
      (Number(ctxt.textStyles.supertitle.padding) || 1) * ctxt.textStyles.supertitle.size / 3
    );
  }
}

export class Title extends TitleTextElement {
  constructor(ctxt: ChantContext, text: string, sourceIndex?: number) {
    super(
      ctxt,
      (ctxt.textStyles.title.prefix || "") + text,
      (ctxt) => ctxt.textStyles.title.font,
      (ctxt) => ctxt.textStyles.title.size,
      "middle",
      sourceIndex,
      text,
      TextTypes.title
    );

    this.padding = (ctxt: ChantContext) => (
      (Number(ctxt.textStyles.title.padding) || 1) * ctxt.textStyles.title.size / 3
    );
  }
}

export class Subtitle extends TitleTextElement {
  constructor(ctxt: ChantContext, text: string, sourceIndex?: number) {
    super(
      ctxt,
      (ctxt.textStyles.subtitle.prefix || "") + text,
      (ctxt) => ctxt.textStyles.subtitle.font,
      (ctxt) => ctxt.textStyles.subtitle.size,
      "middle",
      sourceIndex,
      text,
      TextTypes.subtitle
    );

    this.padding = (ctxt: ChantContext) => (
      (Number(ctxt.textStyles.subtitle.padding) || 1) * ctxt.textStyles.subtitle.size / 3
    );
  }
}

export class TextLeftRight extends TitleTextElement {
  extraClass: "textLeft" | "textRight";
  /** the gabc header field this text comes from */
  headerKey: string;

  constructor(ctxt: ChantContext, text: string, type: string, sourceIndex?: number) {
    super(
      ctxt,
      (ctxt.textStyles.leftRight.prefix || "") + text,
      (ctxt) => ctxt.textStyles.leftRight.font,
      (ctxt) => ctxt.textStyles.leftRight.size,
      type === "textLeft" ? "start" : "end",
      sourceIndex,
      text,
      TextTypes.leftRight
    );
    this.extraClass = type === "textLeft" ? "textLeft" : "textRight";
    this.headerKey = type === "textLeft" ? "text-left" : "text-right";
    this.padding = (ctxt: ChantContext) => (
      (Number(ctxt.textStyles.leftRight.padding) || 1) * ctxt.textStyles.leftRight.size / 5
    );

    // measured again, since TextElement measured it before it had extraClass
    this.recalculateMetrics(ctxt);
  }

  getCssClasses() {
    return this.extraClass + " " + super.getCssClasses();
  }
}

export class Annotation extends TextElement {
  /**
   * @param {String} text
   */
  declare textType: TextTypes["annotation"];
  padding: number;

  constructor(ctxt: ChantContext, text: string, elementIndex?: number) {
    super(
      ctxt,
      (ctxt.textStyles.annotation.prefix || "") + text,
      (ctxt) => ctxt.textStyles.annotation.font,
      (ctxt) => ctxt.textStyles.annotation.size,
      "middle",
      undefined,
      text,
      TextTypes.annotation
    );
    if (typeof elementIndex === 'number') this.elementIndex = elementIndex;
    this.padding = ctxt.staffInterval * ctxt.textStyles.annotation.padding;
    this.dominantBaseline = "hanging"; // so that annotations can be aligned at the top.
  }
}

export class Annotations extends ChantLayoutElement {
  lineHeight: number;
  annotations: Annotation[];
  padding: number;

  /**
   * @param {String} text
   */
  constructor(ctxt: ChantContext, ...texts: string[]) {
    super();

    this.lineHeight = 1.1;
    this.annotations = texts.map(function (text, i) {
      return new Annotation(ctxt, text, i);
    });
    this.padding = Math.max.apply(
      null,
      this.annotations.map(function (annotation) {
        return annotation.padding;
      })
    );
  }

  updateBounds(multiplier?: number) {
    if (!multiplier) multiplier = 1;
    for (var i = 0; i < this.annotations.length; ++i) {
      var annotation = this.annotations[i];
      annotation.bounds.x += this.bounds.x * multiplier;
      annotation.bounds.y += this.bounds.y * multiplier;
    }
  }

  recalculateMetrics(ctxt: ChantContext) {
    this.bounds.x = 0;
    this.bounds.y = 0;

    this.bounds.width = 0;
    this.bounds.height = 0;

    this.origin.x = 0;
    this.origin.y = 0;

    let y = 0;
    for (var i = 0; i < this.annotations.length; ++i) {
      var annotation = this.annotations[i];
      annotation.recalculateMetrics(ctxt);
      this.bounds.width = Math.max(this.bounds.width, annotation.bounds.width);
      annotation.bounds.y += y;
      this.bounds.height = annotation.bounds.bottom();
      this.origin.y = this.origin.y || annotation.origin.y;
      y += annotation.fontSize(ctxt) * (annotation.resize || 1) * this.lineHeight;
    }
  }

  draw(ctxt: ChantContext) {
    this.updateBounds();
    this.annotations.forEach(function (annotation) {
      annotation.draw(ctxt);
    });
    this.updateBounds(-1);
  }

  createSvgNode(ctxt: ChantContext) {
    this.updateBounds();
    var result = this.annotations.map(function (annotation) {
      return annotation.createSvgNode(ctxt);
    });
    this.updateBounds(-1);
    return result;
  }
  createSvgTree(ctxt: ChantContext) {
    this.updateBounds();
    var result = this.annotations.map(function (annotation) {
      return annotation.createSvgTree(ctxt);
    });
    this.updateBounds(-1);
    return { children: result };
  }

  createSvgFragment(ctxt: ChantContext) {
    this.updateBounds();
    var result = this.annotations
      .map(function (annotation) {
        return annotation.createSvgFragment(ctxt);
      })
      .join("");
    this.updateBounds(-1);
    return result;
  }
}

/** what was done to a neume's trailing space for a hidden soft accidental after it */
export interface SoftAccidentalShift {
  unshifted: number;
  shifted?: number;
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

/**
 * A notation in a score: a neume, clef, divider, accidental, custos, line
 * break or text with no notes.  The layout tells them apart by the flags
 * isNeume, isClef, isDivider and isAccidental.
 */
export class ChantNotationElement extends ChantLayoutElement {
  leadingSpace: number;
  trailingSpace: TrailingSpace;
  /** the trailing space for the current layout */
  calculatedTrailingSpace!: number;
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
  /** whether a Gregorio euouae area (<eu>…</eu> in the lyrics) starts or ends at this notation */
  euouae?: AreaBoundary;
  /**
   * whether a Gregorio no-line-break area (<nlba>…</nlba>, in the lyrics or
   * in the notes) starts or ends at this notation
   */
  noLineBreak?: AreaBoundary;

  // poor man's reflection:
  isNeume?: boolean;
  isClef?: boolean;
  isDivider?: boolean;
  isAccidental?: boolean;
  /** whether the notation resets the accidentals in effect */
  resetsAccidentals?: boolean;
  /** a neume's notes */
  notes?: Note[];

  constructor() {
    super();

    //double
    this.leadingSpace = 0.0;
    this.trailingSpace = DefaultTrailingSpace;
    this.keepWithNext = false;
    this.needsLayout = true;

    this.lyrics = [];

    /**
     * @type {ChantScore}
     */
    this.score = null; // the ChantScore

    /**
     * @type {ChantLine}
     */
    this.line = null; // the ChantLine

    this.visualizers = [];
  }

  hasLyrics() {
    return this.lyrics.length !== 0;
  }

  getAllLyricsLeft() {
    if (this.lyrics.length === 0) return this.bounds.right();

    var x = Number.MAX_VALUE;
    for (var i = 0; i < this.lyrics.length; i++) {
      if (this.lyrics[i]) x = Math.min(x, this.lyrics[i].bounds.x);
    }

    return this.bounds.x + x;
  }

  getAllLyricsRight() {
    if (this.lyrics.length === 0) return this.bounds.x;

    var x = Number.MIN_VALUE;
    for (var i = 0; i < this.lyrics.length; i++) {
      if (this.lyrics[i])
        x = Math.max(x, this.lyrics[i].bounds.x + this.lyrics[i].bounds.width);
    }

    return this.bounds.x + x;
  }

  // used by subclasses while building up the chant notations.
  addVisualizer(chantLayoutElement: ChantLayoutElement) {
    if (!chantLayoutElement.ignoreBounds) {
      if (this.bounds.isEmpty())
        this.bounds = chantLayoutElement.bounds.clone();
      else this.bounds.union(chantLayoutElement.bounds);
    }

    this.visualizers.push(chantLayoutElement);
  }

  // same as addVisualizer, except the element is unshifted to the front
  // of the visualizer array rather than the end. This way, some
  // visualizers can be placed behind the others...ledger lines for example.
  prependVisualizer(chantLayoutElement: ChantLayoutElement) {
    if (this.bounds.isEmpty()) this.bounds = chantLayoutElement.bounds.clone();
    else this.bounds.union(chantLayoutElement.bounds);

    this.visualizers.unshift(chantLayoutElement);
  }

  // chant notation elements are given an opportunity to perform their layout via this function.
  // subclasses should call this function first in overrides of this function.
  // on completion, exsurge presumes that the bounds, the origin, and the fragment objects are
  // all valid and prepared for higher level layout.
  performLayout(ctxt: ChantContext) {
    if (typeof this.trailingSpace === "function")
      this.calculatedTrailingSpace = this.trailingSpace(ctxt);
    else this.calculatedTrailingSpace = this.trailingSpace;

    // reset the bounds and the staff notations before doing a layout
    this.visualizers = [];
    this.bounds = new Rect(Infinity, Infinity, -Infinity, -Infinity);

    for (var i = 0; i < this.lyrics.length; i++)
      this.lyrics[i].recalculateMetrics(ctxt);

    if (this.alText)
      for (i = 0; i < this.alText.length; i++)
        this.alText[i].recalculateMetrics(ctxt);

    if (this.translationText)
      for (i = 0; i < this.translationText.length; i++)
        this.translationText[i].recalculateMetrics(ctxt);
  }

  // some subclasses have internal dependencies on other notations (for example,
  // a custos can depend on a later neume which it uses to set its height).
  // subclasses can override this function so that when the notations are
  // altered, the subclass can correctly invalidate (and later restore) its own
  // depedencies
  resetDependencies() {}

  // a helper function for subclasses to call after they are done performing layout...
  finishLayout(ctxt: ChantContext) {
    this.bounds.x = 0;

    let language =
      (this.lyrics[0] && this.lyrics[0].language) || ctxt.defaultLanguage;
    // center the neume itself over the syllable, or just the first punctum
    // if the neume is wider than the syllable + the width of a punctum, we always revert to centering just over the punctum
    let calculateLyricX = language.centerNeume
      ? (lyric: Lyric) =>
          (lyric.bounds.x =
            this.bounds.width + ctxt.staffInterval < lyric.vowelSegmentWidth
              ? this.bounds.width / 2 - lyric.origin.x
              : this.origin.x - lyric.origin.x)
      : (lyric: Lyric) => (lyric.bounds.x = this.origin.x - lyric.origin.x);
    this.lyrics.forEach(calculateLyricX);

    this.needsLayout = false;
  }

  draw(ctxt: ChantContext) {
    var canvasCtxt = ctxt.canvasCtxt!;
    canvasCtxt.translate(this.bounds.x, 0);

    for (var i = 0; i < this.visualizers.length; i++)
      this.visualizers[i].draw(ctxt);

    for (i = 0; i < this.lyrics.length; i++) this.lyrics[i].draw(ctxt);

    if (this.translationText)
      for (i = 0; i < this.translationText.length; i++)
        this.translationText[i].draw(ctxt);

    if (this.alText)
      for (i = 0; i < this.alText.length; i++) this.alText[i].draw(ctxt);

    canvasCtxt.translate(-this.bounds.x, 0);
  }

  getInnerSvgNodes(
    ctxt: ChantContext,
    functionName: "createSvgNode" | "createSvgTree" = "createSvgNode"
  ) {
    var inner: Array<SvgElementWithSource | SvgTreeNode> = [];

    for (i = 0; i < this.lyrics.length; i++)
      inner.push(this.lyrics[i][functionName](ctxt));

    if (this.translationText)
      for (i = 0; i < this.translationText.length; i++)
        inner.push(this.translationText[i][functionName](ctxt));

    if (this.alText)
      for (i = 0; i < this.alText.length; i++)
        inner.push(this.alText[i][functionName](ctxt));

    if (this.visualizers.length) {
      // (only annotations make more than one svg node)
      let visualizers: Array<SvgElementWithSource | SvgTreeNode> = [];
      for (var i = 0; i < this.visualizers.length; i++)
        visualizers.push(
          this.visualizers[i][functionName](ctxt, this) as SvgElementWithSource | SvgTreeNode
        );

      if (functionName === "createSvgTree") {
        inner.push(
          QuickSvg.createSvgTree("g", { class: "Notations" }, ...(visualizers as SvgTreeNode[]))
        );
      } else {
        inner.push(
          QuickSvg.createNode("g", { class: "Notations" }, visualizers as SvgElementWithSource[])
        );
      }
    }
    return inner;
  }

  getSvgProps(): SvgAttributes {
    return {
      // this.constructor.name is kept by the minified build too (see rollup.config.mjs)
      class: "ChantNotationElement " + (this.cssClass || this.constructor.name),
      transform: "translate(" + this.bounds.x + "," + 0 + ")"
    };
  }

  createSvgNode(ctxt: ChantContext) {
    var inner = this.getInnerSvgNodes(ctxt, "createSvgNode");
    var svgProps = this.getSvgProps();
    svgProps.source = this;
    return QuickSvg.createNode("g", svgProps, inner as SvgElementWithSource[]);
  }
  createSvgTree(ctxt: ChantContext) {
    var inner = this.getInnerSvgNodes(ctxt, "createSvgTree");
    var svgProps = this.getSvgProps();
    svgProps.source = this;
    return QuickSvg.createSvgTree("g", svgProps, ...(inner as SvgTreeNode[]));
  }

  createSvgFragment(ctxt: ChantContext) {
    var inner = "";

    for (i = 0; i < this.lyrics.length; i++)
      inner += this.lyrics[i].createSvgFragment(ctxt);

    if (this.translationText)
      for (i = 0; i < this.translationText.length; i++)
        inner += this.translationText[i].createSvgFragment(ctxt);

    if (this.alText)
      for (i = 0; i < this.alText.length; i++)
        inner += this.alText[i].createSvgFragment(ctxt);

    for (var i = 0; i < this.visualizers.length; i++)
      inner += this.visualizers[i].createSvgFragment(ctxt, this);

    return QuickSvg.createFragment("g", this.getSvgProps(), inner);
  }
}

const __connectorSpan = new TextSpan(" • ");
const __mergeAnnotationWithTextLeft = (...annotationSpans: Array<TextSpan[] | null | undefined>) =>
    annotationSpans.reduce((result, spans) => {
      if (result && result.length) {
        if (spans && spans.length) return result.concat(__connectorSpan, spans);
        else return result;
      } else if (spans && spans.length) {
        return spans;
      }
      return [];
    }) as TextSpan[];
