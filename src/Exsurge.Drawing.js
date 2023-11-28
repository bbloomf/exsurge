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
import { Glyphs } from "./Exsurge.Glyphs.js";
import { language } from "./Exsurge.Text.js";
import { addAccent } from "./addAccent.js";
import { makeLigature } from "./makeLigature.js";
import { greextraGlyphs } from "./greextraGlyphs.js";

function getFontFilenameForProperties(properties = {}, url = "{}") {
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

const __getNeumeFromSvgElem = (score, elem) => {
  let note =
    score.notes[
      elem.parentElement
        .querySelector("[element-index]")
        .getAttribute("element-index")
    ];
  return note.neume || note;
};

// for positioning markings on notes
export var MarkingPositionHint = {
  Default: 0,
  Above: 1,
  Below: 2
};

/**
 * List of types of text and their defaults relative to lyrics
 * @type Array
 */
export const TextTypes = {
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
    getFromScore: (score, elem) => score.titles[elem.extraClass],
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
      (score.annotation.annotations
        ? score.annotation.annotations[elementIndex]
        : score.annotation),
    getFromSvgElem: (score, elem) =>
      score.annotation &&
      (score.annotation.annotations
        ? score.annotation.annotations[Array.from(elem.parentElement.querySelectorAll("text.annotation")).indexOf(elem)]
        : score.annotation)
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
      score.notations[elem.notation.notationIndex].alText[elem.alIndex],
    getFromSvgElem: (score, elem) =>
      __getNeumeFromSvgElem(score, elem).alText[
        elem.getAttribute("al-index") || 0
      ]
  },
  choralSign: {
    display: "Choral Sign",
    size: (ctxt) => ctxt.staffInterval * 1.5,
    containedInScore: (score) => false,
    getFromScore: (score, elem) =>
      score.notes[elem.note.elementIndex].choralSign
  },
  lyric: {
    display: "Lyric",
    defaultSize: (size) => size * 0.9,
    containedInScore: (score) => score.hasLyrics,
    getFromScore: (score, elem) =>
      score.notations[elem.notation.notationIndex].lyrics[elem.lyricIndex],
    getFromSvgElem: (score, elem) =>
      __getNeumeFromSvgElem(score, elem).lyrics[
        elem.getAttribute("lyric-index") || 0
      ]
  },
  translation: {
    display: "Translation",
    defaultSize: (size) => size * 0.75,
    containedInScore: (score) => score.hasTranslations,
    getFromScore: (score, elem) =>
      score.notations[elem.notation.notationIndex].translationText[
        elem.translationIndex
      ],
    getFromSvgElem: (score, elem) =>
      __getNeumeFromSvgElem(score, elem).translationText[
        elem.getAttribute("translation-index") || 0
      ]
  }
};
export const TextTypesByClass = {};
Object.entries(TextTypes).forEach(([key, entry]) => {
  let cssClass = (entry.cssClass = entry.cssClass || key);
  entry.key = key;
  TextTypesByClass[cssClass] = entry;
});

export const DefaultTrailingSpace = (ctxt) =>
  ctxt.intraNeumeSpacing * ctxt.interSyllabicMultiplier;
DefaultTrailingSpace.isDefault = true;

export let GlyphCode = {
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
  Flat: "Flat",
  Mora: "Mora",
  Natural: "Natural",
  OriscusAsc: "OriscusAsc",
  OriscusDes: "OriscusDes",
  OriscusLiquescent: "OriscusLiquescent",

  PodatusLower: "PodatusLower",
  PodatusUpper: "PodatusUpper",

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
}; // GlyphCode

export var QuickSvg = {
  // namespaces
  ns: "http://www.w3.org/2000/svg",
  xmlns: "https://www.w3.org/2000/xmlns/",
  xlink: "http://www.w3.org/1999/xlink",

  hasDOMAccess: function () {
    return canAccessDOM;
  },

  // create the root level svg object
  svg: function (width, height) {
    var node = document.createElementNS(this.ns, "svg");

    node.setAttribute("xmlns", this.ns);
    node.setAttribute("version", "1.1");
    node.setAttributeNS(this.xmlns, "xmlns:xlink", this.xlink);

    node.setAttribute("width", width);
    node.setAttribute("height", height);

    // create the defs element
    var defs = document.createElementNS(this.ns, "defs");
    node.appendChild(defs);

    node.defs = defs;

    node.clearNotations = function () {
      // clear out all children except defs
      node.removeChild(defs);

      while (node.hasChildNodes()) node.removeChild(node.lastChild);

      node.appendChild(defs);
    };

    return node;
  },

  rect: function (width, height) {
    var node = document.createElementNS(this.ns, "rect");

    node.setAttribute("width", width);
    node.setAttribute("height", height);

    return node;
  },

  line: function (x1, y1, x2, y2) {
    var node = document.createElementNS(this.ns, "line");

    node.setAttribute("x1", x1);
    node.setAttribute("y1", y1);
    node.setAttribute("x2", x2);
    node.setAttribute("y2", y2);

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

  tspan: function (str) {
    var node = document.createElementNS(this.ns, "tspan");
    node.textContent = str;

    return node;
  },

  // nodeRef should be the id of the object in defs (without the #)
  use: function (nodeRef) {
    var node = document.createElementNS(this.ns, "use");
    node.setAttributeNS(this.xlink, "xlink:href", "#" + nodeRef);

    return node;
  },

  svgFragmentForGlyph: function (glyph) {
    var svgSrc = "";
    for (var i = 0; i < glyph.paths.length; ++i) {
      var path = glyph.paths[i];
      svgSrc += QuickSvg.createFragment(path.data ? "path" : "g", {
        d: path.data || undefined,
        fill: path.type === "negative" ? "#fff" : undefined
      });
    }
    return svgSrc;
  },

  nodesForGlyph: function (glyph, functionName = "createNode") {
    var nodes = [];
    for (var i = 0; i < glyph.paths.length; ++i) {
      var path = glyph.paths[i];
      let props = {};
      if (path.data) props.d = path.data;
      if (path.type === "negative") props.fill = "#fff";
      nodes.push(QuickSvg[functionName](path.data ? "path" : "g", props));
    }
    return nodes;
  },

  createNode: function (name, attributes, children) {
    var node = document.createElementNS(this.ns, name);
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
          node.setAttributeNS(this[match[1]], match[2], val);
        } else {
          node.setAttribute(attr, val);
        }
      }
    }
    if (children) {
      if (typeof children === "string") {
        node.textContent = children;
      } else if (children.constructor === [].constructor) {
        for (var i = 0; i < children.length; ++i) {
          node.appendChild(children[i]);
        }
      } else {
        node.appendChild(children);
      }
    }
    return node;
  },

  createSvgTree(name, props, ...children) {
    if ("class" in props) {
      props.className = props.class;
      delete props.class;
    }
    if (children.length === 1 && children[0] instanceof Array) {
      children = children[0];
    }
    const convertKeysToCamelCase = (obj) => {
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
    if (props.style) convertKeysToCamelCase(props.style);
    let source = props.source;
    if (source && source.sourceGabc) {
      props["source-gabc"] = source.sourceGabc;
    }
    return { name, props, children };
  },

  createFragment: function (name, attributes, child) {
    if (child === undefined || child === null) child = "";

    var fragment = "<" + name + " ";

    for (var attr in attributes) {
      if (
        attributes.hasOwnProperty(attr) &&
        typeof attributes[attr] !== "undefined"
      )
        fragment += attr + '="' + attributes[attr] + '" ';
    }

    fragment += ">" + child + "</" + name + ">";

    return fragment;
  },

  parseFragment: function (fragment) {
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
      for (var i = 0, il = well.firstChild.childNodes.length; i < il; i++)
        container.appendChild(well.firstChild.firstChild);

      return container;
    }
  },

  translate: function (node, x, y) {
    node.setAttribute("transform", "translate(" + x + "," + y + ")");
    return node;
  },

  scale: function (node, sx, sy) {
    node.setAttribute("transform", "scale(" + sx + "," + sy + ")");
    return node;
  }
};

export var TextMeasuringStrategy = {
  // shapes
  Svg: 0,
  Canvas: 1,
  FontDictionary: 2
};

/*
 * ChantContext
 */
export class ChantContext {
  constructor(
    textMeasuringStrategy = QuickSvg.hasDOMAccess()
      ? TextMeasuringStrategy.Canvas
      : TextMeasuringStrategy.FontDictionary
  ) {
    /**
     * font dictionary
     * @type {{ [key: string]: import('opentype.js').Font }}
     */
    this.fontDictionary = undefined;
    this.textMeasuringStrategy = textMeasuringStrategy;
    this.getFontFilenameForProperties = getFontFilenameForProperties;
    this.defs = {};
    this.makeDefs = [];
    if (QuickSvg.hasDOMAccess()) {
      this.defsNode = QuickSvg.createNode("defs");
    }

    // font styles
    this.textStyles = {};
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
    this.plusProperties = {};
    this.asteriskProperties = {};
    this.specialCharText = (char) => this.specialCharMap[char] || char;

    this.fontStyleDictionary = {
      b: { "font-weight": "bold" },
      i: { "font-style": "italic" },
      u: { "text-decoration": "underline" },
      ul: { "text-decoration": "underline" },
      c: { fill: this.rubricColor, class: 'rubric' },
      sc: {
        "font-variant": "small-caps",
        "font-variant-caps": "small-caps",
        "font-feature-settings": "'smcp'",
        "-webkit-font-feature-settings": "'smcp'"
      },
      v: {}
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
    this.activeClef = null;

    this.neumeLineColor = "#000";
    this.staffLineColor = "#000";
    this.dividerLineColor = "#000";

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
   * 
   * @param {*} properties 
   * @param {string} fontFamily 
   * @returns {import('opentype.js').Font | undefined}
   */
  getFontForProperties(properties = {}, fontFamily) {
    let key = this.getFontFilenameForProperties(properties),
      keyWithFontFamily = this.getFontFilenameForProperties(properties, fontFamily);
    return (
      this.fontDictionary &&
      (this.fontDictionary[keyWithFontFamily] ||
        this.fontDictionary[fontFamily] ||
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
  setFont(font, size = 16, baseStyle = {}, fontDictionary) {
    for (let [key, textType] of Object.entries(TextTypes)) {
      let textStyle = (this.textStyles[key] = this.textStyles[key] || {});
      textStyle.size = textType.defaultSize
        ? textType.defaultSize(size, this)
        : textType.size(this);
      textStyle.font = font;
      textStyle.color = this.textColor || "#000";
    }

    this.baseTextStyle = baseStyle;

    if (fontDictionary) {
      this.textMeasuringStrategy = TextMeasuringStrategy.FontDictionary;
      this.fontDictionary = fontDictionary;
    }
  }

  setRubricColor(color) {
    this.rubricColor = color;
    this.specialCharProperties.fill = color;
    this.fontStyleDictionary.c.fill = color;
  }

  setMergeAnnotationWithTextLeft(merge) {
    this.mergeAnnotationWithTextLeft = merge ? __mergeAnnotationWithTextLeft : undefined;
  }

  setScaleDefs(scaleDefs) {
    scaleDefs = !!scaleDefs;
    if (this.scaleDefs !== scaleDefs) {
      this.scaleDefs = scaleDefs;
      this.setGlyphScaling(this.glyphScaling);
    }
  }

  createStyleCss() {
    var style = "";
    for (let [key, textType] of Object.entries(TextTypes)) {
      var cssClass = textType.cssClass,
        { color, font, size } = this.textStyles[key];
      style += `svg.Exsurge .${cssClass}{fill:${color};font-family:${font};font-size:${size}px;font-kerning:normal}`;
    }
    return style;
  }

  createStyleNode() {
    var node = QuickSvg.createNode("style", {});
    node.textContent = this.createStyleCss();
    return node;
  }

  createStyleTree() {
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
    var multiplier =
      this.minLyricWordSpacing /
        (this.hyphenWidth || this.minLyricWordSpacing) || 1;
    this.hyphenWidth = hyphen.bounds.width;

    this.minLyricWordSpacing = multiplier * this.hyphenWidth;
  }

  setStaffHeight(staffHeight) {
    this.setGlyphScaling(staffHeight / 600);
  }

  setGlyphScaling(glyphScaling) {
    this.glyphScaling = glyphScaling;

    this.staffInterval = this.glyphPunctumWidth * this.glyphScaling;

    // setup the line weights for the various elements.
    this.staffLineWeight = Math.ceil((5 * this.staffInterval) / 8) / 5;
    this.neumeLineWeight = this.staffLineWeight; // the weight of connecting lines in the glyphs.
    this.dividerLineWeight = this.neumeLineWeight; // of quarter bar, half bar, etc.
    this.episemaLineWeight = this.neumeLineWeight * 1.25; // of horizontal episemata

    this.intraNeumeSpacing = this.staffInterval / 2.0;

    while (this.defsNode && this.defsNode.firstChild)
      this.defsNode.removeChild(this.defsNode.firstChild);
    for (var i = 0; i < this.makeDefs.length; ++i) {
      this.makeDefs[i]();
    }

    this.updateHyphenWidth();
  }

  calculateHeightFromStaffPosition(staffPosition) {
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
  findNextNeume() {
    if (typeof this.currNotationIndex === "undefined")
      throw "findNextNeume() called without a valid currNotationIndex set";

    for (var i = this.currNotationIndex + 1; i < this.notations.length; i++) {
      var notation = this.notations[i];

      if (notation.isNeume && !notation.hasNoWidth) return notation;
    }

    return null;
  }

  makeCanvasIfNeeded() {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvasCtxt = this.canvas.getContext("2d");
    }
  }

  setCanvasSize(width, height, scale = 1) {
    this.makeCanvasIfNeeded();

    this.canvas.style.width = width * scale + "px";
    this.canvas.style.height = height * scale + "px";
    scale *= this.pixelRatio;
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;

    this.canvasCtxt.setTransform(scale, 0, 0, scale, 0, 0);
  }
}

/*
 * ChantLayoutElement
 */
export class ChantLayoutElement {
  constructor() {
    this.bounds = new Rect();
    this.origin = new Point(0, 0);

    this.selected = false;
    this.highlighted = false;
  }

  // draws the element on an html5 canvas
  draw(ctxt) {
    throw "ChantLayout Elements must implement draw(ctxt)";
  }

  // returns svg element
  createSvgNode(ctxt) {
    throw "ChantLayout Elements must implement createSvgNode(ctxt)";
  }

  // returns svg code for the element, used for printing support
  createSvgFragment(ctxt) {
    throw "ChantLayout Elements must implement createSvgFragment(ctxt)";
  }
}

export class DividerLineVisualizer extends ChantLayoutElement {
  constructor(ctxt, staffPosition0, staffPosition1, divider) {
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

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.fillStyle = ctxt.dividerLineColor;

    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.dividerLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt) {
    let props = {
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

  createSvgNode(ctxt) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

export class NeumeLineVisualizer extends ChantLayoutElement {
  constructor(ctxt, note0, note1, hanging) {
    super();

    var staffPosition0 = note0.staffPosition;
    var staffPosition1 = note1.staffPosition;

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

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;

    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.neumeLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt) {
    return {
      x: this.bounds.x,
      y: this.bounds.y,
      width: ctxt.neumeLineWeight,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "neumeLine"
    };
  }

  createSvgNode(ctxt) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

export class VirgaLineVisualizer extends ChantLayoutElement {
  constructor(ctxt, note) {
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

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.fillStyle = ctxt.neumeLineColor;
    canvasCtxt.fillRect(
      this.bounds.x,
      this.bounds.y,
      ctxt.neumeLineWeight,
      this.bounds.height
    );
  }

  getSvgProps(ctxt) {
    return {
      x: this.bounds.x,
      y: this.bounds.y,
      width: ctxt.neumeLineWeight,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "neumeLine"
    };
  }

  createSvgNode(ctxt) {
    return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
  }
  createSvgTree(ctxt) {
    return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
  }
}

export class LineaVisualizer extends ChantLayoutElement {
  constructor(ctxt, note) {
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

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

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

  getSvgProps(ctxt, x) {
    return {
      x,
      y: this.bounds.y,
      width: ctxt.neumeLineWeight,
      height: this.bounds.height,
      fill: ctxt.neumeLineColor,
      class: "neumeLine"
    };
  }

  createSvgNode(ctxt) {
    return QuickSvg.createNode("g", null, [
      this.bounds.x,
      this.bounds.x + this.bounds.width - ctxt.neumeLineWeight
    ].map(x => QuickSvg.createNode("rect", this.getSvgProps(ctxt, x))));
  }

  createSvgTree(ctxt) {
    return QuickSvg.createSvgTree("g", {}, ...[
      this.bounds.x,
      this.bounds.x + this.bounds.width - ctxt.neumeLineWeight
    ].map(x => QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt, x))));
  }

  createSvgFragment(ctxt) {
    return QuickSvg.createFragment("g", null, [
      this.bounds.x,
      this.bounds.x + this.bounds.width - ctxt.neumeLineWeight
    ].map(x => QuickSvg.createFragment("rect", this.getSvgProps(ctxt, x))).join(''));
  }
}

export class GlyphVisualizer extends ChantLayoutElement {
  constructor(ctxt, glyphCode) {
    super();

    this.glyph = null;

    this.setGlyph(ctxt, glyphCode);
  }

  setGlyph(ctxt, glyphCode) {
    if (this.glyphCode !== glyphCode) {
      if (
        typeof glyphCode === "undefined" ||
        glyphCode === null ||
        glyphCode === ""
      )
        glyphCode = this.glyphCode = GlyphCode.None;
      else this.glyphCode = glyphCode;

      let glyph = this.glyph = Glyphs[glyphCode];

      // if this glyph hasn't been used yet, then load it up in the defs section for sharing
      if (!ctxt.defs.hasOwnProperty(glyphCode)) {
        var getDefProps = () => {
          var options = {
            id: glyphCode,
            class: "glyph"
          };
          if (ctxt.scaleDefs === true) {
            options.transform = "scale(" + ctxt.glyphScaling + ")";
          }
          return options;
        };
        var makeDef = () => {
          let options = getDefProps();
          // create the ref
          ctxt.defs[glyphCode] = QuickSvg.createFragment(
            "g",
            options,
            QuickSvg.svgFragmentForGlyph(glyph)
          );

          if (ctxt.defsNode)
            ctxt.defsNode.appendChild(
              QuickSvg.createNode(
                "g",
                options,
                QuickSvg.nodesForGlyph(glyph)
              )
            );
        };
        makeDef.makeSvgTree = () => {
          return QuickSvg.createSvgTree(
            "g",
            getDefProps(),
            ...QuickSvg.nodesForGlyph(glyph, "createSvgTree")
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

  setStaffPosition(ctxt, staffPosition) {
    this.bounds.y =
      ctxt.calculateHeightFromStaffPosition(staffPosition) - this.origin.y;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    var x = this.bounds.x + this.origin.x;
    var y = this.bounds.y + this.origin.y;
    canvasCtxt.translate(x, y);
    canvasCtxt.scale(ctxt.glyphScaling, ctxt.glyphScaling);

    for (var i = 0; i < this.glyph.paths.length; i++) {
      var path = this.glyph.paths[i];
      canvasCtxt.fillStyle =
        path.type === "negative" ? "#fff" : ctxt.neumeLineColor;
      canvasCtxt.fill(new Path2D(path.data));
    }

    canvasCtxt.scale(1.0 / ctxt.glyphScaling, 1.0 / ctxt.glyphScaling);
    canvasCtxt.translate(-x, -y);
  }

  getSvgAttributes(ctxt, source) {
    let className = "";
    if (/^Porrectus\d$/.test(this.glyphCode)) {
      let notes = source.neume.notes,
        noteIndex = notes.indexOf(source),
        nextNote = notes[noteIndex + 1];
      className = source.selected
        ? nextNote.selected
          ? "selected"
          : "selectedA"
        : nextNote.selected
        ? "selectedB"
        : "";
    } else {
      let isSelected =
        source && (source.selected || (source.model && source.model.selected));
      className = isSelected ? "selected" : "";
    }
    var result = {
      "xlink:href": "#" + this.glyphCode,
      class: className
    };
    if (source) {
      result["source-index"] = source.sourceIndex;
      result["element-index"] = source.elementIndex;
      if ('noteIndex' in source) {
        result.class += ' note';
        result.id = ctxt.noteIdPrefix + (source.noteIndex + 1);
        if (source.neume) {
          const glyphCode = source.glyphVisualizer.glyphCode;
          if (/^Porrectus/.test(glyphCode)) {
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
    } else {
      result.x = (this.bounds.x + this.origin.x) / ctxt.glyphScaling;
      result.y = (this.bounds.y + this.origin.y) / ctxt.glyphScaling;
      result.transform = "scale(" + ctxt.glyphScaling + ")";
    }
    return result;
  }

  createSvgNode(ctxt, source) {
    var attributes = this.getSvgAttributes(ctxt, source);
    attributes.source = source;
    return QuickSvg.createNode("use", attributes);
  }
  createSvgTree(ctxt, source) {
    var attributes = this.getSvgAttributes(ctxt, source);
    if (source) attributes.source = source;
    return QuickSvg.createSvgTree("use", attributes);
  }

  createSvgFragment(ctxt, source) {
    return QuickSvg.createFragment("use", this.getSvgAttributes(ctxt, source));
  }
}

export class RoundBraceVisualizer extends ChantLayoutElement {
  constructor(ctxt, x1, x2, y, isAbove) {
    super();

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

  getSvgPathProps(ctxt) {
    return {
      d: this.generatePathString(),
      stroke: ctxt.neumeLineColor,
      "stroke-width": ctxt.staffLineWeight + "px",
      fill: "none",
      class: "brace"
    };
  }

  createSvgNode(ctxt) {
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
  createSvgTree(ctxt) {
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

  createSvgFragment(ctxt) {
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

  // returns svg path d string
  generatePathString() {
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
  constructor(ctxt, x1, x2, y, isAbove = true, addAcuteAccent = false) {
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

  getSvgPathProps(ctxt) {
    return {
      d: this.generatePathString(),
      stroke: ctxt.neumeLineColor,
      "stroke-width": ctxt.staffLineWeight + "px",
      fill: "none",
      class: "brace"
    };
  }

  createSvgNode(ctxt) {
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
  createSvgTree(ctxt) {
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

  createSvgFragment(ctxt) {
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

export class TextSpan {
  constructor(text, propertyArray, activeTags, index = 0, extraProps) {
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

  get properties() {
    const result = Object.assign.apply(null, [{}].concat(this.propertyArray).concat());
    if ('xOffset' in this) result.xOffset = this.xOffset;
    if ('newLine' in this) result.newLine = this.newLine;
    return result;
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
    return result;
  }
}

class MarkupStackFrame {
  constructor(tagName, startIndex, propertyArray = [], symbol) {
    this.tagName = tagName;
    this.startIndex = startIndex;
    this.propertyArray = propertyArray;
    if (symbol) this.symbol = symbol;
  }

  get properties() {
    return Object.assign.apply(null, [{}].concat(this.propertyArray));
  }

  static createStackFrame(ctxt, tagName, startIndex, extraProperties = {}, symbol = '') {
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
var __subsForTspans = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};

export class TextElement extends ChantLayoutElement {
  constructor(
    ctxt,
    text,
    fontFamily,
    fontSize,
    textAnchor,
    sourceIndex,
    sourceGabc
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
    this.sourceGabc = sourceGabc;
    this.dominantBaseline = "baseline"; // default placement

    this.generateSpansFromText(ctxt, text);

    this.recalculateMetrics(ctxt);
  }

  getFromScore(score) {
    return this.textType.getFromScore(score, this);
  }

  generateSpansFromText(ctxt, text) {
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

    var markupStack = [];
    var spanStartIndex = 0;
    var newLineInNextSpan = 0;

    var filterFrames = (frame, symbol) => frame.Symbol === symbol;

    var closeSpan = (spanText, index, extraProperties) => {
      if (spanText === "" && !this.dropCap) return;

      this.text += spanText;

      var properties = [];
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

    var markupRegex = /(<br\/?>)|<v>([\s\S]*?)(?:<\/v>|$)|(\*)(?=\s*\*|[^*]*(?:$|<v>))|(\+)|<sp>(?:(~)|(')?([ao]e|[æœaeiouy])|([arv])\/)<\/sp>|([arv])\/\.|([℣℟])\.?|(?:([*_^%])|<(\/)?([bciuv]|ul|sc|font)(?:\s+(?:family="([^"]+)"|fill="([^"]+)"|class="([^"]+)"))*>)(?=(?:(.+?)(?:\11|<\/\13>))?)/gi;
    var vTagRegex = /(\\grecross)|\{greextra\}\{([^}]*)\}/g;
    var match = null;
    var openedAsterisk = false;
    var closeCurrentSpan = () =>
      closeSpan(text.substring(spanStartIndex, match.index), spanStartIndex);
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
        enclosedText
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
        let vMatch;
        let lastIndex = 0;
        let iOffset = 0;
        while ((vMatch = vTagRegex.exec(vTag))) {
          if (lastIndex < vMatch.index) {
            closeSpan(vTag.slice(lastIndex, vMatch.index), match.index + lastIndex + iOffset);
            iOffset = 3; // length of '<v>'
          }
          let [, grecross, greextra] = vMatch;
          if (grecross) {
            // grecross is just the command for the Cross:
            // set up greextra so it will get handled with it below:
            greextra = 'Cross';
          }    
          const char = greextraGlyphs[greextra];
          if (char) {
            closeSpan(char, match.index + vMatch.index + iOffset, { 'font-family': 'greextra' })
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
            closingTag = true;
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
            const extraProperties = {};
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

  getCanvasFontForProperties(ctxt, properties = {}) {
    var font = "";
    if (properties["font-style"] === "italic") font += "italic ";
    if (properties["font-variant"] === "small-caps") font += "small-caps ";
    if (properties["font-weight"] === "bold") font += "bold ";
    let fontSize = parseFloat(properties["font-size"]) || this.fontSize(ctxt);
    if (/%$/.test(properties["font-size"])) {
      fontSize *= this.fontSize(ctxt) / 100;
    }
    font += `${fontSize * (this.resize || 1)}px `;
    font += properties["font-family"] || this.fontFamily(ctxt);
    return font;
  }

  measureSubstringBBox(ctxt, length) {
    return this.measureSubstring(ctxt, length, true);
  }

  /**
   * if length is undefined and this.rightAligned === true, then offsets will be marked for each newLine span
   * 
   * @param {ChantContext} ctxt 
   * @param {number} length 
   * @param {boolean} returnBBox 
   * @returns measured substring, as a simple width unless returnBBox == true
   */
  measureSubstring(ctxt, length, returnBBox = false) {
    if (length === 0) return 0;
    if (!length) length = Infinity;
    if (length < 0) {
      var lines = -length;
      length = Infinity;
    }
    var canvasCtxt = ctxt.canvasCtxt;
    var width = 0;
    var widths = [];
    var newLineSpans = [this.spans[0]];
    var subStringLength = 0;
    var numLines = 1;
    var fontSize = this.fontSize(ctxt) * (this.resize || 1);
    var bbox = new Rect(0, 0, 0, 0);
    for (var i = 0; i < this.spans.length; i++) {
      var span = this.spans[i],
        myText = span.text.slice(0, length - subStringLength);
      if (span.newLine) {
        numLines += parseInt(span.newLine) || 1;
        if (!lines && this.rightAligned === true && length === Infinity) {
          newLineSpans[newLineSpans.length - 1].xOffset =
            this.firstLineMaxWidth - width;
          newLineSpans.push(span);
        } else if (--lines === 0) break;
        widths.push(width);
        width = 0;
      }
      if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Canvas) {
        canvasCtxt.font = this.getCanvasFontForProperties(
          ctxt,
          span.properties
        );
        let metrics = canvasCtxt.measureText(
          myText,
          width,
          fontSize * (numLines - 1)
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
            new Rect(width, fontSize * (numLines - 2), metrics.width, fontSize)
          );
        }
        width += metrics.width;
      } else if (
        ctxt.textMeasuringStrategy === TextMeasuringStrategy.FontDictionary &&
        ctxt.fontDictionary
      ) {
        // get the bounding box for the substring, placing it at x = width, y = fontSize * (numLines - 1)
        let font = ctxt.getFontForProperties(
          span.properties,
          span.properties["font-family"] || this.fontFamily(ctxt)
        );
        /**
         * @type {{ features: { liga: boolean; smcp?: boolean; } }}
         */
        let options = { features: { liga: true } };
        if (span.properties["font-variant"] === "small-caps") {
          options.features.smcp = true;
        }
        let spanFontSize = parseFloat(span.properties["font-size"]) || fontSize;
        if (/%$/.test(span.properties["font-size"])) {
          spanFontSize *= fontSize / 100;
        }
        let subBbox = font
          .getPath(
            myText,
            width,
            fontSize * (numLines - 1),
            spanFontSize,
            options
          )
          .getBoundingBox();
        let subWidth = font.getAdvanceWidth(myText, spanFontSize, options);

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
        this.firstLineMaxWidth - width;
    }
    width = Math.max(width, ...widths);
    if (returnBBox === true) {
      let height = bbox.height;
      let y = bbox.y,
        x = bbox.x;
      return { width, height, x, y };
    } else {
      return width;
    }
  }

  recalculateMetrics(ctxt, resetNewLines = true) {
    if (resetNewLines) {
      delete this.maxWidth;
      delete this.firstLineMaxWidth;
      delete this.rightAligned;
      delete this.resize;
      delete this.numLines;
      // replace newlines with spaces
      this.spans.forEach((span) => {
        delete span.xOffset;
        if (span.newLine === true) {
          delete span.newLine;
          span.text = " " + span.text;
        }
      });
    }

    this.bounds.x = 0;
    this.bounds.y = 0;

    this.origin.x = 0;

    if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
      while (ctxt.svgTextMeasurer.firstChild)
        ctxt.svgTextMeasurer.removeChild(ctxt.svgTextMeasurer.firstChild);
      ctxt.svgTextMeasurer.appendChild(this.createSvgNode(ctxt));
      ctxt.svgTextMeasurer.appendChild(ctxt.createStyleNode());

      var bbox = ctxt.svgTextMeasurer.firstChild.getBBox();
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
        (span.newLine ? parseInt(span.newLine) || 1 : 0),
      1
    );
  }

  setMaxWidth(ctxt, maxWidth, firstLineMaxWidth = maxWidth) {
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
        var lastWidth = 0,
          lastMatch = null,
          regex = /\s+|$/g,
          max = firstLineMaxWidth,
          match;
        while (
          (match = regex.exec(this.text)) &&
          (!lastMatch || match.index > lastMatch.index)
        ) {
          var width = this.measureSubstring(ctxt, match.index);
          if (width > max && lastMatch) {
            var spanIndex = 0,
              length = 0;
            while (length < lastMatch.index && spanIndex < this.spans.length) {
              let span = this.spans[spanIndex++];
              length += span.text.length + (span.newLine ? 1 : 0);
            }
            if (length > lastMatch.index) {
              let span = this.spans[--spanIndex];
              length -= span.text.length;
            }
            var splitSpan = this.spans[spanIndex],
              textLeft = splitSpan.text.slice(0, lastMatch.index - length),
              textRight = splitSpan.text.slice(
                lastMatch.index + lastMatch[0].length - length
              ),
              newSpans = [];
            this.rightAligned =
              max === firstLineMaxWidth && firstLineMaxWidth !== maxWidth;
            if (textLeft)
              newSpans.push(
                new TextSpan(
                  textLeft,
                  splitSpan.propertyArray,
                  splitSpan.activeTags
                )
              );
            if (textRight) {
              newSpans.push(
                new TextSpan(
                  textRight,
                  splitSpan.propertyArray,
                  splitSpan.activeTags,
                  undefined,
                  { newLine: true }
                )
              );
            } else if (this.spans[spanIndex + 1]) {
              this.spans[spanIndex + 1].newLine = true;
            }
            this.spans.splice(spanIndex, 1, ...newSpans);
            this.needsLayout = true;
            max = maxWidth;
            if (
              match.index === this.text.length ||
              this.measureSubstring(ctxt) <= maxWidth
            )
              break;
            width = 0;
            match = lastMatch = null;
          }
          lastWidth = width;
          lastMatch = match;
        }
      }
      this.recalculateMetrics(ctxt, false);
    }
  }

  getCssClasses() {
    return (this.textType && this.textType.cssClass) || "";
  }

  getExtraStyleProperties(ctxt) {
    return ctxt.baseTextStyle || {};
  }

  static escapeForTspan(string) {
    return String(string).replace(/[&<>]/g, function (s) {
      return __subsForTspans[s];
    });
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    if (this.textAnchor === "middle") canvasCtxt.textAlign = "center";
    else canvasCtxt.textAlign = "start";

    var translateWidth = 0,
      translateHeight = 0;
    for (var i = 0; i < this.spans.length; i++) {
      var span = this.spans[i];
      var xOffset = span.xOffset || 0;
      if (span.newLine) {
        count = parseInt(span.newLine) || 1;
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
        this.getExtraStyleProperties(ctxt),
        span.properties
      );
      canvasCtxt.font = this.getCanvasFontForProperties(ctxt, properties);
      canvasCtxt.fillStyle = properties.fill || "#000";
      canvasCtxt.fillText(
        span.text,
        this.bounds.x,
        this.bounds.y,
        span.textLength || undefined
      );
      var metrics = canvasCtxt.measureText(
        span.text,
        this.bounds.x,
        this.bounds.y
      );
      translateWidth -= metrics.width;
      canvasCtxt.translate(metrics.width, 0);
    }
    canvasCtxt.translate(translateWidth, translateHeight);
  }

  getSvgProps() {
    return {
      "source-index": this.sourceIndex,
      x: this.bounds.x,
      y: this.bounds.y,
      class: this.getCssClasses().trim(),
      "text-anchor": this.textAnchor
      //'dominant-baseline': this.dominantBaseline, // hanging baseline doesn't work in Safari
    };
  }

  getSpanOptions(span, ctxt, useStyleObject = false) {
    var options = {
      "source-index": span.index,
      class: span.properties.class,
      style: useStyleObject
        ? Object.assign({}, span.properties)
        : getCssForProperties(span.properties)
    };

    if (span.newLine) {
      var xOffset = span.xOffset || 0;
      options.dy = 1.1 * (parseInt(span.newLine) || 1) + "em";
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
        span.properties["font-size"] || this.fontSize(ctxt) * this.resize;
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

  createSvgNode(ctxt) {
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
  createSvgTree(ctxt) {
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

  createSvgFragment(ctxt) {
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

export var LyricType = {
  SingleSyllable: 0,
  BeginningSyllable: 1,
  MiddleSyllable: 2,
  EndingSyllable: 3,

  Directive: 4 // for asterisks, "ij." elements, or other performance notes.
};

export var LyricArray = {
  getLeft: function (lyricArray) {
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

  getRight: function (lyricArray, presumeConnectorNeeded) {
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
            (presumeConnectorNeeded && l.allowsConnector() && !l.needsConnector
              ? l.getConnectorWidth()
              : 0)
        );
    }

    return x;
  },

  hasOnlyOneLyric: function (lyricArray) {
    return lyricArray.filter((l) => l.originalText).length === 1;
  },

  indexOfLyric: function (lyricArray) {
    return lyricArray.indexOf(lyricArray.filter((l) => l.originalText)[0]);
  },

  mergeIn: function (lyricArray, newLyrics) {
    for (var i = 0; i < newLyrics.length; ++i) {
      if (newLyrics[i].originalText || !lyricArray[i])
        lyricArray[i] = newLyrics[i];
    }
  },

  mergeInArray: function (lyricArray, notations) {
    for (var i = 0; i < notations.length; ++i) {
      this.mergeIn(lyricArray, notations[i].lyrics);
    }
  },

  setNotation: function (lyricArray, notation) {
    notation.lyrics = lyricArray;
    for (var i = 0; i < lyricArray.length; ++i) {
      lyricArray[i].notation = notation;
    }
  }
};

export class Lyric extends TextElement {
  constructor(ctxt, text, lyricType, notation, notations, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.lyric.prefix || "") + text,
      (ctxt) => ctxt.textStyles.lyric.font,
      (ctxt) => ctxt.textStyles.lyric.size,
      "start",
      sourceIndex,
      text
    );
    this.textType = TextTypes.lyric;

    // save the original text in case we need to later use the lyric
    // in a dropcap...
    this.originalText = text;

    this.notation = notation;
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

    // Lyrics can have their own language defined, which affects the alignment
    // of the text with the notation element
    this.language = null;

    if (this.allowsConnector)
      this.connectorSpan = new TextSpan(ctxt.syllableConnector);
  }

  allowsConnector() {
    return (
      this.lyricType === LyricType.BeginningSyllable ||
      this.lyricType === LyricType.MiddleSyllable
    );
  }

  setForceConnector(force) {
    this.forceConnector = force && this.allowsConnector();
  }

  setNeedsConnector(needs, width) {
    if (needs === true || this.forceConnector) {
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
        this.spans.push(this.connectorSpan);
    } else {
      this.connectorWidth = 0;
      this.needsConnector = false;
      this.bounds.width = this.widthWithoutConnector;

      var span = this.spans.pop();
      if (span && span !== this.connectorSpan) this.spans.push(span);
    }
  }

  setConnectorWidth(width) {
    this.connectorWidth = width;
    this.connectorSpan.textLength = width;
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

  recalculateMetrics(ctxt, resetNewLines = true) {
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
        x1 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(
          0,
          this.centerStartIndex
        );
        x2 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(
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

        // Non-directive elements are lined up to the chant notation based on vowel segments,
        var result = activeLanguage.findVowelSegment(this.text, startIndex);

        if (result.found !== true) {
          var match = this.text.slice(startIndex).match(/[a-z]+/i);
          if (match) {
            result.startIndex = startIndex + match.index;
            result.length = match[0].length;
          } else {
            result.startIndex = startIndex;
            result.length = this.text.length - startIndex;
          }
        }
        if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
          // svgTextMeasurer still has the current lyric in it...
          x1 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(
            0,
            result.startIndex
          );
          x2 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(
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

  generateDropCap(ctxt) {
    if (this.dropCap) return this.dropCap;
    // disallow special characters:
    if (this.spans[0].properties['font-family'] === ctxt.specialCharProperties['font-family']) {
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
    )[0].length;
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

  getExtraStyleProperties(ctxt) {
    var props = super.getExtraStyleProperties(ctxt);

    if (this.lyricType === LyricType.Directive && ctxt.autoColor === true)
      props = Object.assign({}, props, { fill: ctxt.rubricColor });

    return props;
  }
}

export class ChoralSign extends TextElement {
  constructor(ctxt, text, note, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.choralSign.prefix || "") + text,
      (ctxt) => ctxt.textStyles.choralSign.font,
      TextTypes.choralSign.size,
      "start",
      sourceIndex,
      text
    );
    this.positionHint = MarkingPositionHint.Default;
    this.note = note;
    this.textType = TextTypes.choralSign;
  }

  recalculateMetrics(ctxt) {
    super.recalculateMetrics(ctxt);
  }

  performLayout(ctxt) {
    this.recalculateMetrics(ctxt);
    this.bounds.x =
      this.note.bounds.x +
      Math.max(0, (ctxt.staffInterval - this.bounds.width) / 2); // center on the note itself

    let offset, staffPosition;
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
  constructor(ctxt, text, notation, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.al.prefix || "") + text,
      (ctxt) => ctxt.textStyles.al.font,
      (ctxt) => ctxt.textStyles.al.size,
      "start",
      sourceIndex,
      text
    );
    this.notation = notation;
    this.textType = TextTypes.al;

    this.padding = ctxt.staffInterval / 2;
  }
}

export class TranslationText extends TextElement {
  /**
   * @param {String} text
   */
  constructor(ctxt, text, notation, sourceIndex) {
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
      gabcSource
    );
    this.notation = notation;
    this.textType = TextTypes.translation;

    this.padding = ctxt.staffInterval / 2;
  }
}

export class DropCap extends TextElement {
  /**
   * @param {String} text
   */
  constructor(ctxt, text, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.dropCap.prefix || "") + text,
      (ctxt) => ctxt.textStyles.dropCap.font,
      (ctxt) => ctxt.textStyles.dropCap.size,
      "middle",
      sourceIndex,
      text
    );
    this.textType = TextTypes.dropCap;

    this.padding = ctxt.staffInterval * ctxt.textStyles.dropCap.padding;
  }
}

export class TitleTextElement extends TextElement {
  constructor(
    ctxt,
    text,
    fontFamily,
    fontSize,
    textAnchor,
    sourceIndex,
    sourceGabc
  ) {
    super(
      ctxt,
      text,
      fontFamily,
      fontSize,
      textAnchor,
      sourceIndex,
      sourceGabc
    );
  }
}

export class Supertitle extends TitleTextElement {
  constructor(ctxt, text, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.supertitle.prefix || "") + text,
      (ctxt) => ctxt.textStyles.supertitle.font,
      (ctxt) => ctxt.textStyles.supertitle.size,
      "middle",
      sourceIndex,
      text
    );
    this.textType = TextTypes.supertitle;

    this.padding = (ctxt) => (
      (Number(ctxt.textStyles.supertitle.padding) || 1) * ctxt.textStyles.supertitle.size / 3
    );
  }
}

export class Title extends TitleTextElement {
  constructor(ctxt, text, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.title.prefix || "") + text,
      (ctxt) => ctxt.textStyles.title.font,
      (ctxt) => ctxt.textStyles.title.size,
      "middle",
      sourceIndex,
      text
    );
    this.textType = TextTypes.title;

    this.padding = (ctxt) => (
      (Number(ctxt.textStyles.title.padding) || 1) * ctxt.textStyles.title.size / 3
    );
  }
}

export class Subtitle extends TitleTextElement {
  constructor(ctxt, text, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.subtitle.prefix || "") + text,
      (ctxt) => ctxt.textStyles.subtitle.font,
      (ctxt) => ctxt.textStyles.subtitle.size,
      "middle",
      sourceIndex,
      text
    );
    this.textType = TextTypes.subtitle;

    this.padding = (ctxt) => (
      (Number(ctxt.textStyles.subtitle.padding) || 1) * ctxt.textStyles.subtitle.size / 3
    );
  }
}

export class TextLeftRight extends TitleTextElement {
  constructor(ctxt, text, type, sourceIndex) {
    super(
      ctxt,
      (ctxt.textStyles.leftRight.prefix || "") + text,
      (ctxt) => ctxt.textStyles.leftRight.font,
      (ctxt) => ctxt.textStyles.leftRight.size,
      type === "textLeft" ? "start" : "end",
      sourceIndex,
      text
    );
    this.textType = TextTypes.leftRight;
    this.extraClass = type === "textLeft" ? "textLeft" : "textRight";
    this.headerKey = type === "textLeft" ? "text-left" : "text-right";
    this.padding = (ctxt) => (
      (Number(ctxt.textStyles.leftRight.padding) || 1) * ctxt.textStyles.leftRight.size / 5
    );
  }

  getCssClasses() {
    return this.extraClass + " " + super.getCssClasses();
  }
}

export class Annotation extends TextElement {
  /**
   * @param {String} text
   */
  constructor(ctxt, text, elementIndex) {
    super(
      ctxt,
      (ctxt.textStyles.annotation.prefix || "") + text,
      (ctxt) => ctxt.textStyles.annotation.font,
      (ctxt) => ctxt.textStyles.annotation.size,
      "middle"
    );
    this.sourceGabc = text;
    if (typeof elementIndex === 'number') this.elementIndex = elementIndex;
    this.textType = TextTypes.annotation;
    this.padding = ctxt.staffInterval * ctxt.textStyles.annotation.padding;
    this.dominantBaseline = "hanging"; // so that annotations can be aligned at the top.
  }
}

export class Annotations extends ChantLayoutElement {
  /**
   * @param {String} text
   */
  constructor(ctxt, ...texts) {
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

  updateBounds(multiplier) {
    if (!multiplier) multiplier = 1;
    for (var i = 0; i < this.annotations.length; ++i) {
      var annotation = this.annotations[i];
      annotation.bounds.x += this.bounds.x * multiplier;
      annotation.bounds.y += this.bounds.y * multiplier;
    }
  }

  recalculateMetrics(ctxt) {
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

  draw(ctxt) {
    this.updateBounds();
    this.annotations.forEach(function (annotation) {
      annotation.draw(ctxt);
    });
    this.updateBounds(-1);
  }

  createSvgNode(ctxt) {
    this.updateBounds();
    var result = this.annotations.map(function (annotation) {
      return annotation.createSvgNode(ctxt);
    });
    this.updateBounds(-1);
    return result;
  }
  createSvgTree(ctxt) {
    this.updateBounds();
    var result = this.annotations.map(function (annotation) {
      return annotation.createSvgTree(ctxt);
    });
    this.updateBounds(-1);
    return { children: result };
  }

  createSvgFragment(ctxt) {
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

export class ChantNotationElement extends ChantLayoutElement {
  constructor() {
    super();

    //double
    this.leadingSpace = 0.0;
    this.trailingSpace = DefaultTrailingSpace;
    this.keepWithNext = false;
    this.needsLayout = true;

    this.lyrics = [];

    this.score = null; // the ChantScore
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
  addVisualizer(chantLayoutElement) {
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
  prependVisualizer(chantLayoutElement) {
    if (this.bounds.isEmpty()) this.bounds = chantLayoutElement.bounds.clone();
    else this.bounds.union(chantLayoutElement.bounds);

    this.visualizers.unshift(chantLayoutElement);
  }

  // chant notation elements are given an opportunity to perform their layout via this function.
  // subclasses should call this function first in overrides of this function.
  // on completion, exsurge presumes that the bounds, the origin, and the fragment objects are
  // all valid and prepared for higher level layout.
  performLayout(ctxt) {
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
  finishLayout(ctxt) {
    this.bounds.x = 0;

    let language =
      (this.lyrics[0] && this.lyrics[0].language) || ctxt.defaultLanguage;
    // center the neume itself over the syllable, or just the first punctum
    // if the neume is wider than the syllable + the width of a punctum, we always revert to centering just over the punctum
    let calculateLyricX = language.centerNeume
      ? (lyric) =>
          (lyric.bounds.x =
            this.bounds.width + ctxt.staffInterval < lyric.vowelSegmentWidth
              ? this.bounds.width / 2 - lyric.origin.x
              : this.origin.x - lyric.origin.x)
      : (lyric) => (lyric.bounds.x = this.origin.x - lyric.origin.x);
    this.lyrics.forEach(calculateLyricX);

    this.needsLayout = false;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;
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

  getInnerSvgNodes(ctxt, functionName = "createSvgNode") {
    var inner = [];

    for (i = 0; i < this.lyrics.length; i++)
      inner.push(this.lyrics[i][functionName](ctxt));

    if (this.translationText)
      for (i = 0; i < this.translationText.length; i++)
        inner.push(this.translationText[i][functionName](ctxt));

    if (this.alText)
      for (i = 0; i < this.alText.length; i++)
        inner.push(this.alText[i][functionName](ctxt));

    if (this.visualizers.length) {
      let visualizers = [];
      for (var i = 0; i < this.visualizers.length; i++)
        visualizers.push(this.visualizers[i][functionName](ctxt, this));

      if (functionName === "createSvgTree") {
        inner.push(
          QuickSvg.createSvgTree("g", { class: "Notations" }, ...visualizers)
        );
      } else {
        inner.push(
          QuickSvg.createNode("g", { class: "Notations" }, visualizers)
        );
      }
    }
    return inner;
  }

  getSvgProps() {
    return {
      // this.constructor.name will not be the same after being mangled by UglifyJS
      class: "ChantNotationElement " + (this.cssClass || this.constructor.name),
      transform: "translate(" + this.bounds.x + "," + 0 + ")"
    };
  }

  createSvgNode(ctxt) {
    var inner = this.getInnerSvgNodes(ctxt, "createSvgNode");
    var svgProps = this.getSvgProps();
    svgProps.source = this;
    return QuickSvg.createNode("g", svgProps, inner);
  }
  createSvgTree(ctxt) {
    var inner = this.getInnerSvgNodes(ctxt, "createSvgTree");
    var svgProps = this.getSvgProps();
    svgProps.source = this;
    return QuickSvg.createSvgTree("g", svgProps, ...inner);
  }

  createSvgFragment(ctxt) {
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
const __mergeAnnotationWithTextLeft = (...annotationSpans) =>
    annotationSpans.reduce((result, spans) => {
      if (result && result.length) {
        if (spans && spans.length) return result.concat(__connectorSpan, spans);
        else return result;
      } else if (spans && spans.length) {
        return spans;
      }
      return [];
    });
