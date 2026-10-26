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
import { getCssForProperties, Point, Rect } from "./Exsurge.Core.js";
import { Glyphs, porrectusSwash, porrectusSwashWidth } from "./Exsurge.Glyphs.js";
import { language } from "./Exsurge.Text.js";
import { addAccent } from "./addAccent.js";
import { escapedSource, restoreEscapes, unescapeText } from "./gabcEscapes.js";
import { greextraGlyphs } from "./greextraGlyphs.js";
import { stemQueue, StemQueue } from "./ledgerLines.js";
import { makeLigature } from "./makeLigature.js";
import { layoutNabc, parseNabc } from "./Exsurge.Nabc.js";
import { texLengthToStaffIntervals } from "./texLengths.js";
function getFontFilenameForProperties(properties = {}, url = "{}") {
    var italic = properties["font-style"] === "italic" ? "Italic" : "", bold = properties["font-weight"] === "bold" ? "Bold" : "";
    return url.replace("{}", `${italic || bold ? `${bold}${italic}` : `Regular`}`);
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
    if (__listeningForFontLoads)
        return;
    const fonts = typeof document !== "undefined" && document.fonts;
    if (!fonts || typeof fonts.addEventListener !== "function")
        return;
    __listeningForFontLoads = true;
    fonts.addEventListener("loadingdone", () => __fontLoadGeneration++);
}
// a FontFace that has already loaded when it's added to document.fonts (as in
// `document.fonts.add(await new FontFace(...).load())`) fires no event, so the
// size of document.fonts is compared before each layout as well.
let __fontSetSize;
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
const __attributeAsIndex = (attribute) => attribute;
const __getNeumeFromSvgElem = (score, elem) => {
    let note = score.notes[__attributeAsIndex(elem.parentElement
        .querySelector("[element-index]")
        .getAttribute("element-index"))];
    return (note.neume || note);
};
// for positioning markings on notes
export const MarkingPositionHint = {
    Default: 0,
    Above: 1,
    Below: 2
};
/**
 * List of types of text and their defaults relative to lyrics
 * @type Array
 */
const textTypeDefinitions = {
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
        containedInScore: (score) => score.titles.hasTextLeft() || score.titles.hasTextRight(),
        getFromScore: (score, elem) => score.titles[elem.extraClass],
        getFromSvgElem: (score, elem) => score.titles[elem.classList.contains("textRight") ? "textRight" : "textLeft"]
    },
    annotation: {
        display: "Annotation",
        defaultSize: (size) => (size * 2) / 3,
        containedInScore: (score) => !!score.annotation,
        getFromScore: (score, { elementIndex = 0 }) => score.annotation &&
            (score.annotation.annotations
                ? score.annotation.annotations[elementIndex]
                : score.annotation),
        getFromSvgElem: (score, elem) => score.annotation &&
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
        getFromScore: (score, elem) => score.notations[elem.notation.notationIndex].alText[elem.alIndex],
        getFromSvgElem: (score, elem) => __getNeumeFromSvgElem(score, elem).alText[__attributeAsIndex(elem.getAttribute("al-index") || 0)]
    },
    choralSign: {
        display: "Choral Sign",
        size: (ctxt) => ctxt.staffInterval * 1.5,
        containedInScore: (score) => false,
        getFromScore: (score, elem) => score.notes[elem.note.elementIndex].choralSign
    },
    lyric: {
        display: "Lyric",
        defaultSize: (size) => size * 0.9,
        containedInScore: (score) => score.hasLyrics,
        getFromScore: (score, elem) => score.notations[elem.notation.notationIndex].lyrics[elem.lyricIndex],
        getFromSvgElem: (score, elem) => __getNeumeFromSvgElem(score, elem).lyrics[__attributeAsIndex(elem.getAttribute("lyric-index") || 0)]
    },
    translation: {
        display: "Translation",
        defaultSize: (size) => size * 0.75,
        containedInScore: (score) => score.hasTranslations,
        getFromScore: (score, elem) => score.notations[elem.notation.notationIndex]
            .translationText[elem.translationIndex],
        getFromSvgElem: (score, elem) => __getNeumeFromSvgElem(score, elem).translationText[__attributeAsIndex(elem.getAttribute("translation-index") || 0)]
    }
};
// the key and class of each are set just below
export const TextTypes = textTypeDefinitions;
export const TextTypesByClass = {};
Object.entries(TextTypes).forEach(([key, entry]) => {
    let cssClass = (entry.cssClass = entry.cssClass || key);
    entry.key = key;
    TextTypesByClass[cssClass] = entry;
});
/** the TextTypes, as code that goes through each of them sees them */
const __textTypeEntries = () => Object.entries(TextTypes);
// a TeX length, in staff intervals at Gregorio's default staff size
const __texLength = (length) => texLengthToStaffIntervals(length);
/**
 * GregorioTeX's dimensions for NABC (tex/gregoriotex-gsp-default.tex), in
 * staff intervals at its default staff size
 */
export const NabcDimensions = {
    /** a point */
    pointsPerStaffInterval: 1 / __texLength("1pt"),
    /** the room that / makes between neumes (nabcinterelementspace), and // (nabclargerspace) */
    interElementSpace: __texLength("0.06927cm"),
    largerSpace: __texLength("0.10938cm"),
    /** from the top line to the baseline of the NABC above the staff (abovelinesnabcraise) */
    aboveLinesRaise: __texLength("0.17351cm"),
    /** the room that the NABC above the staff takes, above its baseline (abovelinesnabcheight) */
    aboveLinesHeight: __texLength("0.3cm"),
    /** from the bottom line to the baseline of the NABC below the staff (belowlinesnabcheight) */
    belowLinesHeight: __texLength("0.6cm"),
    /**
     * how many staff intervals above the top line notes can go before they
     * push the NABC above the staff up (additionaltopspacenabcthreshold), and
     * below the bottom line before they push the NABC below it down
     * (additionalbottomspacenabcthreshold, 2, which GregorioTeX counts from a)
     */
    aboveThreshold: 4,
    belowThreshold: 1
};
export const DefaultTrailingSpace = (ctxt) => ctxt.intraNeumeSpacing * ctxt.interSyllabicMultiplier;
DefaultTrailingSpace.isDefault = true;
export const GlyphCode = {
    None: "None",
    Linea: "Linea",
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
    // a porrectus's swash falling 1 staff position, 2, and so on.  (it can fall
    // any distance: see porrectusGlyphCode())
    Porrectus1: "Porrectus1",
    Porrectus2: "Porrectus2",
    Porrectus3: "Porrectus3",
    Porrectus4: "Porrectus4",
    Porrectus5: "Porrectus5",
    PunctumCavum: "PunctumCavum",
    PunctumQuadratum: "PunctumQuadratum",
    PunctumQuadratumLiquescent: "PunctumQuadratumLiquescent",
    PunctumQuadratumAscLiquescent: "PunctumQuadratumAscLiquescent",
    PunctumQuadratumDesLiquescent: "PunctumQuadratumDesLiquescent",
    PunctumInclinatum: "PunctumInclinatum",
    PunctumInclinatumAscendens: "PunctumInclinatumAscendens",
    PunctumInclinatumDescendens: "PunctumInclinatumDescendens",
    PunctumInclinatumAuctus: "PunctumInclinatumAuctus",
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
    OpenParenthesis: "OpenParenthesis",
    CloseParenthesis: "CloseParenthesis",
    UpperBrace: "UpperBrace",
    // the hollow (cavum) forms of the note glyphs (see CavumGlyphCode)
    OriscusAscCavum: "OriscusAscCavum",
    OriscusDesCavum: "OriscusDesCavum",
    OriscusLiquescentCavum: "OriscusLiquescentCavum",
    PodatusLowerCavum: "PodatusLowerCavum",
    PodatusUpperCavum: "PodatusUpperCavum",
    PodatusLowerShortCavum: "PodatusLowerShortCavum",
    PodatusUpperShortCavum: "PodatusUpperShortCavum",
    Porrectus1Cavum: "Porrectus1Cavum",
    Porrectus2Cavum: "Porrectus2Cavum",
    Porrectus3Cavum: "Porrectus3Cavum",
    Porrectus4Cavum: "Porrectus4Cavum",
    Porrectus5Cavum: "Porrectus5Cavum",
    PunctumQuadratumLiquescentCavum: "PunctumQuadratumLiquescentCavum",
    PunctumQuadratumAscLiquescentCavum: "PunctumQuadratumAscLiquescentCavum",
    PunctumQuadratumDesLiquescentCavum: "PunctumQuadratumDesLiquescentCavum",
    PunctumInclinatumCavum: "PunctumInclinatumCavum",
    PunctumInclinatumAscendensCavum: "PunctumInclinatumAscendensCavum",
    PunctumInclinatumDescendensCavum: "PunctumInclinatumDescendensCavum",
    PunctumInclinatumAuctusCavum: "PunctumInclinatumAuctusCavum",
    PunctumInclinatumLiquescentCavum: "PunctumInclinatumLiquescentCavum",
    QuilismaCavum: "QuilismaCavum",
    StrophaCavum: "StrophaCavum",
    StrophaLiquescentCavum: "StrophaLiquescentCavum",
    TerminatingAscLiquescentCavum: "TerminatingAscLiquescentCavum",
    TerminatingDesLiquescentCavum: "TerminatingDesLiquescentCavum"
}; // GlyphCode
/**
 * The glyph code of a porrectus's swash, falling interval staff positions (a
 * whole number for the clefs that exsurge shares with Gregorio, or with the
 * Chi-Rho clef's offsets, in thirds): Porrectus followed by the interval, to
 * three decimal places, and Cavum if it's hollow.  The swash is drawn for it
 * when it's first used.
 */
export function porrectusGlyphCode(interval, hollow = false) {
    return `Porrectus${Math.round(interval * 1000) / 1000}${hollow ? "Cavum" : ""}`;
}
// the glyphs of the porrectus swashes other than those in Glyphs, by their ids
// (see GlyphVisualizer.glyphId)
const porrectusGlyphs = {};
// the glyph of a porrectus's swash falling interval staff positions under
// glyphMultiplier: one that falls as far, whatever size the notes are, and is
// as wide as they are, as the other glyphs are
function porrectusGlyph(glyphId, interval, glyphMultiplier, hollow) {
    return (Glyphs[glyphId] ||
        porrectusGlyphs[glyphId] ||
        (porrectusGlyphs[glyphId] = porrectusSwash((100 * interval) / glyphMultiplier, porrectusSwashWidth(interval), hollow)));
}
/** the hollow form of each note glyph, for a note with a cavum (gabc r) */
export const CavumGlyphCode = {
    [GlyphCode.BeginningAscLiquescent]: GlyphCode.PunctumQuadratumAscLiquescentCavum, // (the same outline)
    [GlyphCode.BeginningDesLiquescent]: GlyphCode.PunctumQuadratumDesLiquescentCavum, // (the same outline)
    [GlyphCode.OriscusAsc]: GlyphCode.OriscusAscCavum,
    [GlyphCode.OriscusDes]: GlyphCode.OriscusDesCavum,
    [GlyphCode.OriscusLiquescent]: GlyphCode.OriscusLiquescentCavum,
    [GlyphCode.PodatusLower]: GlyphCode.PodatusLowerCavum,
    [GlyphCode.PodatusUpper]: GlyphCode.PodatusUpperCavum,
    [GlyphCode.PodatusLowerShort]: GlyphCode.PodatusLowerShortCavum,
    [GlyphCode.PodatusUpperShort]: GlyphCode.PodatusUpperShortCavum,
    [GlyphCode.Porrectus1]: GlyphCode.Porrectus1Cavum,
    [GlyphCode.Porrectus2]: GlyphCode.Porrectus2Cavum,
    [GlyphCode.Porrectus3]: GlyphCode.Porrectus3Cavum,
    [GlyphCode.Porrectus4]: GlyphCode.Porrectus4Cavum,
    [GlyphCode.Porrectus5]: GlyphCode.Porrectus5Cavum,
    [GlyphCode.PunctumQuadratum]: GlyphCode.PunctumCavum,
    [GlyphCode.PunctumQuadratumLiquescent]: GlyphCode.PunctumQuadratumLiquescentCavum,
    [GlyphCode.PunctumQuadratumAscLiquescent]: GlyphCode.PunctumQuadratumAscLiquescentCavum,
    [GlyphCode.PunctumQuadratumDesLiquescent]: GlyphCode.PunctumQuadratumDesLiquescentCavum,
    [GlyphCode.PunctumInclinatum]: GlyphCode.PunctumInclinatumCavum,
    [GlyphCode.PunctumInclinatumAscendens]: GlyphCode.PunctumInclinatumAscendensCavum,
    [GlyphCode.PunctumInclinatumDescendens]: GlyphCode.PunctumInclinatumDescendensCavum,
    [GlyphCode.PunctumInclinatumAuctus]: GlyphCode.PunctumInclinatumAuctusCavum,
    [GlyphCode.PunctumInclinatumLiquescent]: GlyphCode.PunctumInclinatumLiquescentCavum,
    [GlyphCode.Quilisma]: GlyphCode.QuilismaCavum,
    [GlyphCode.Stropha]: GlyphCode.StrophaCavum,
    [GlyphCode.StrophaLiquescent]: GlyphCode.StrophaLiquescentCavum,
    [GlyphCode.TerminatingAscLiquescent]: GlyphCode.TerminatingAscLiquescentCavum,
    [GlyphCode.TerminatingDesLiquescent]: GlyphCode.TerminatingDesLiquescentCavum
};
/**
 * the glyphs of a punctum inclinatum (other than a deminutus), solid or
 * hollow, and which way each is turned: 1 as in an ascending line, -1 as in
 * a descending one, and 0 if it's upright
 */
export const InclinatumGlyphTurn = {
    [GlyphCode.PunctumInclinatum]: 0,
    [GlyphCode.PunctumInclinatumAscendens]: 1,
    [GlyphCode.PunctumInclinatumDescendens]: -1,
    [GlyphCode.PunctumInclinatumAuctus]: 0,
    [GlyphCode.PunctumInclinatumCavum]: 0,
    [GlyphCode.PunctumInclinatumAscendensCavum]: 1,
    [GlyphCode.PunctumInclinatumDescendensCavum]: -1,
    [GlyphCode.PunctumInclinatumAuctusCavum]: 0
};
export const QuickSvg = {
    // namespaces
    ns: "http://www.w3.org/2000/svg",
    xmlns: "http://www.w3.org/2000/xmlns/",
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
        node.setAttribute("width", String(width));
        node.setAttribute("height", String(height));
        // create the defs element
        var defs = document.createElementNS(this.ns, "defs");
        node.appendChild(defs);
        node.defs = defs;
        node.clearNotations = function () {
            // clear out all children except defs
            node.removeChild(defs);
            while (node.hasChildNodes())
                node.removeChild(node.lastChild);
            node.appendChild(defs);
        };
        return node;
    },
    rect: function (width, height) {
        var node = document.createElementNS(this.ns, "rect");
        node.setAttribute("width", String(width));
        node.setAttribute("height", String(height));
        return node;
    },
    line: function (x1, y1, x2, y2) {
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
    tspan: function (str) {
        var node = document.createElementNS(this.ns, "tspan");
        node.textContent = str;
        return node;
    },
    // nodeRef should be the id of the object in defs (with its ChantContext.defIdPrefix, without the #)
    use: function (nodeRef) {
        var node = document.createElementNS(this.ns, "use");
        node.setAttributeNS(this.xlink, "xlink:href", "#" + nodeRef);
        return node;
    },
    svgFragmentForGlyph: function (glyph, negativeFillColor = "#fff") {
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
    nodesForGlyph: function (glyph, functionName = "createNode", negativeFillColor = "#fff") {
        var nodes = [];
        for (var i = 0; i < glyph.paths.length; ++i) {
            var path = glyph.paths[i];
            let props = {};
            if (path.data)
                props.d = path.data;
            if (path.type === "negative")
                props.fill = negativeFillColor;
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
            if (attributes.hasOwnProperty(attr) &&
                typeof attributes[attr] !== "undefined") {
                var val = attributes[attr];
                var match = attr.match(/^([^:]+):([^:]+)$/);
                if (match) {
                    node.setAttributeNS(this[match[1]], attr, val);
                }
                else {
                    node.setAttribute(attr, val);
                }
            }
        }
        if (children) {
            if (typeof children === "string") {
                node.textContent = children;
            }
            else if (children.constructor === [].constructor) {
                for (var i = 0; i < children.length; ++i) {
                    node.appendChild(children[i]);
                }
            }
            else {
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
                    if (/^\w+-index$/.test(key))
                        continue;
                    let camelCase = key.replace(/[-:]([a-z])/g, (whole, letter) => letter.toUpperCase());
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
        return { name, props, children: children };
    },
    createFragment: function (name, attributes, child) {
        if (child === undefined || child === null)
            child = "";
        var fragment = "<" + name + " ";
        for (var attr in attributes) {
            if (attributes.hasOwnProperty(attr) &&
                typeof attributes[attr] !== "undefined")
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
export const TextMeasuringStrategy = {
    // shapes
    Svg: 0,
    Canvas: 1,
    /** also used for fontkit */
    OpenTypeJS: 2
};
/**
 * the special character (in ChantContext.specials) that a ~ in the lyrics
 * becomes, for each LyricTie but "space", as Gregorio draws its lyric ties
 * with the macros of <sp>ut</sp>, <sp>ot</sp> and <sp>dt</sp>
 */
export const LyricTieSpecials = {
    space: null,
    undertie: "ut",
    overtie: "ot",
    doubletie: "dt"
};
/*
 * ChantContext
 */
export class ChantContext {
    constructor(textMeasuringStrategy = QuickSvg.hasDOMAccess()
        ? TextMeasuringStrategy.Canvas
        : TextMeasuringStrategy.OpenTypeJS) {
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
        this.specialCharText = (char) => this.specialCharMap[char] || char;
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
        this.minLedgerSeparation = 0; // multiple of staffInterval
        this.ledgerLineHeuristic = true;
        this.minSpaceAboveStaff = 2; // multiple of staffInterval
        this.minSpaceBelowStaff = 1; // multiple of staffInterval
        this.spaceBetweenSystems = 1.5; // multiple of staffInterval
        // everything depends on the scale of the punctum
        this.glyphPunctumWidth = Glyphs.PunctumQuadratum.bounds.width;
        this.glyphPunctumHeight = Glyphs.PunctumQuadratum.bounds.height;
        this.inclinatumLeaning = true;
        // max space to add between notations when justifying, in multiples of this.staffInterval
        this.maxExtraSpaceInStaffIntervals = 0.5;
        // for keeping track of the clef
        this.activeClef = null;
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
        this.clefVisibility = "visible";
        this.modeNumberSystem = "roman-majuscule";
        this.dropCapLines = 1;
        this.dropCapPosition = "lastbaseline";
        this.dropCapAnchor = "baseline";
        this.defaultLanguage = language.latin;
        this.lyricCentering = "vowel";
        this.italicMeansElision = true;
        this.lyricTie = "space";
        this.firstWordStyle = {};
        this.firstSyllableStyle = {};
        this.firstSyllableInitialStyle = {};
        this.translationCentering = "left";
        this.defaultProtrusionFactor = 1;
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
            document.body.insertBefore(this.svgTextMeasurer, document.body.firstChild);
        }
        else if (textMeasuringStrategy === TextMeasuringStrategy.Canvas) {
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
        // the width of each space between neumes, in multiples of this.intraNeumeSpacing
        this.neumeSpaceMultipliers = { "/0": 0.5, "/!": 1, "/": 1, "//": 2, " ": 2 };
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
        this.eolCustos = "auto";
        this.lineBreaking = "greedy";
        // if auto color is true, then exsurge tries to automatically colorize
        // some elements of the chant (directives become rubric color, etc.)
        this.autoColor = true;
        this.useExtraTextOnly = true;
        this.noteIdPrefix = 'note-';
        this.defIdPrefix = '';
        this.nabcLines = 0;
        this.nabcFonts = [];
        this.nabcSize = 8 / NabcDimensions.pointsPerStaffInterval;
        this.nabcAlignment = "full";
        this.nabcVisibility = ["visible", "visible"];
        this.insertFontsInDoc();
        this.setMergeAnnotationWithTextLeft(true);
    }
    /**
     * convert a staff position counting from the first space below the staff (gabc notation "c")
     * into a position counting from the middle space (variable based on how many staff lines there are)
     * @param {number} staffPosition
     * @returns {number}
     */
    convertStaffPositionToSymmetric(staffPosition) {
        return staffPosition - this.staffLineCount;
    }
    convertSymmetricStaffPosition(staffPositionSymmetric) {
        return staffPositionSymmetric + this.staffLineCount;
    }
    /**
     *
     * @param {*} properties
     * @param {string} fontFamily
     * @returns {import('opentype.js').Font | import('fontkit').Font | undefined}
     */
    getFontForProperties(properties = {}, fontFamily) {
        let key = this.getFontFilenameForProperties(properties), keyWithFontFamily = this.getFontFilenameForProperties(properties, fontFamily);
        return (this.fontDictionary &&
            (this.fontDictionary[keyWithFontFamily] ||
                this.fontDictionary[fontFamily] ||
                this.fontDictionary.Regular));
    }
    /**
     *
     * @param {string} font : ;
     * @param {number} size
     * @param {any} baseStyle
     * @param {{ [key: string]: import('opentype.js').Font }} fontDictionary
     */
    setFont(font, size = 16, baseStyle = {}, fontDictionary) {
        const textStyles = this.textStyles;
        for (let [key, textType] of __textTypeEntries()) {
            let textStyle = (textStyles[key] = textStyles[key] || {});
            textStyle.size = textType.defaultSize
                ? textType.defaultSize(size, this)
                : textType.size(this);
            textStyle.font = font;
            textStyle.color = this.textColor || "#000";
        }
        // (hasDefaultDropCapSize() until the drop cap's size is set again, even
        // to the same size, or its style is replaced)
        const dropCapStyle = this.textStyles.dropCap;
        let dropCapSize = dropCapStyle.size;
        Object.defineProperty(dropCapStyle, "size", {
            configurable: true,
            enumerable: true,
            get: () => dropCapSize,
            set: (size) => {
                dropCapSize = size;
                delete this.setFontDropCapStyle;
            }
        });
        this.setFontDropCapStyle = dropCapStyle;
        this.baseTextStyle = baseStyle;
        if (fontDictionary) {
            this.textMeasuringStrategy = TextMeasuringStrategy.OpenTypeJS;
            this.fontDictionary = fontDictionary;
        }
        this.clearTextCache();
    }
    /** whether textStyles.dropCap.size is still the size that setFont() gave it */
    hasDefaultDropCapSize() {
        return this.textStyles.dropCap === this.setFontDropCapStyle;
    }
    setRubricColor(color) {
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
    getTextMetricsCache(measurer) {
        if (this.fontLoadGeneration !== __fontLoadGeneration ||
            this.textMetricsCacheSize >= __maxCachedTextMetrics)
            this.clearTextCache();
        let cache = this.textMetricsCache.get(measurer);
        if (!cache) {
            cache = new Map();
            this.textMetricsCache.set(measurer, cache);
        }
        return cache;
    }
    cacheTextMetrics(cache, key, metrics) {
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
    measureCanvasText(font, text) {
        const canvasCtxt = this.canvasCtxt;
        const cache = this.getTextMetricsCache(canvasCtxt);
        // the alignment moves the bounding box, and draw() leaves it set
        const key = canvasCtxt.textAlign + "\0" + font + "\0" + text;
        let metrics = cache.get(key);
        if (!metrics) {
            if (canvasCtxt.font !== font)
                canvasCtxt.font = font;
            metrics = this.cacheTextMetrics(cache, key, canvasCtxt.measureText(text));
        }
        return metrics;
    }
    /**
     * measures a text element in the DOM, with TextMeasuringStrategy.Svg
     * @returns the text's advance width, and its bounding box, with the baseline
     * at y = 0
     */
    measureSvgText(node) {
        const measurer = this.svgTextMeasurer;
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
    layoutFontkitText(font, text, smallCaps) {
        const cache = this.getTextMetricsCache(font);
        const key = (smallCaps ? "c" : "-") + text;
        let metrics = cache.get(key);
        if (!metrics) {
            const features = { liga: true };
            if (smallCaps)
                features.smcp = true;
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
    measureOpenTypeText(font, text, x, y, fontSize, smallCaps) {
        const cache = this.getTextMetricsCache(font);
        // the bounding box comes out slightly differently depending on where
        // the path is, so where it is is part of the key
        const key = `${x},${y},${fontSize},${smallCaps ? "c" : "-"},${text}`;
        let metrics = cache.get(key);
        if (!metrics) {
            const options = {
                features: { liga: true }
            };
            if (smallCaps)
                options.features.smcp = true;
            metrics = this.cacheTextMetrics(cache, key, {
                bbox: font.getPath(text, x, y, fontSize, options).getBoundingBox(),
                advanceWidth: font.getAdvanceWidth(text, fontSize, options)
            });
        }
        return metrics;
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
        for (let [key, textType] of __textTypeEntries()) {
            var cssClass = textType.cssClass, { color, font, size } = this.textStyles[key];
            // some text (e.g., choral signs) is measured at a size that follows the
            // staff rather than the text style, so draw it at that size too.
            if (textType.size)
                size = textType.size(this);
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
        var hyphen = new Lyric(this, this.syllableConnector, LyricType.SingleSyllable);
        // minLyricWordSpacing follows the hyphen width, keeping whatever ratio a
        // caller has set it to.  A hyphen with no width (e.g., when there's no
        // lyric font to measure with yet) says nothing about that ratio, so keep
        // the ratio from the last hyphen that had a width.
        if (this.hyphenWidth > 0 && this.minLyricWordSpacing >= 0)
            this.minLyricWordSpacingRatio =
                this.minLyricWordSpacing / this.hyphenWidth;
        this.hyphenWidth = hyphen.bounds.width;
        this.minLyricWordSpacing =
            (this.minLyricWordSpacingRatio >= 0 ? this.minLyricWordSpacingRatio : 1) *
                this.hyphenWidth;
    }
    setStaffHeight(staffHeight, glyphMultiplier = 1) {
        this.setGlyphScaling(staffHeight / 600, glyphMultiplier);
    }
    setGlyphScaling(glyphScaling, glyphMultiplier = 1) {
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
    calculateHeightFromStaffPosition(staffPosition) {
        return -staffPosition * this.staffInterval;
    }
    insertFontsInDoc() {
        if (!canAccessDOM)
            return;
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
            if (notation.isNeume && !notation.hasNoWidth)
                return notation;
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
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class ChantLayoutElement {
    constructor() {
        this.bounds = new Rect();
        this.origin = new Point(0, 0);
        this.selected = false;
        this.highlighted = false;
    }
    // draws the element on an html5 canvas
    draw(ctxt, ...args) {
        throw "ChantLayout Elements must implement draw(ctxt)";
    }
    // returns svg element
    createSvgNode(ctxt, ...args) {
        throw "ChantLayout Elements must implement createSvgNode(ctxt)";
    }
    // returns svg code for the element, used for printing support
    createSvgFragment(ctxt, ...args) {
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
        canvasCtxt.fillRect(this.bounds.x, this.bounds.y, ctxt.dividerLineWeight, this.bounds.height);
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
            if (this.divider.selected)
                props.class += " selected";
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
    /**
     * @param note1 the note to draw the line to, or a staff position to draw it
     * to, or nothing to draw it to four staff positions above note0
     */
    constructor(ctxt, note0, note1, hanging) {
        super();
        var staffPosition0 = note0.staffPosition;
        var staffPosition1 = typeof note1 === "number"
            ? note1
            : note1
                ? note1.staffPosition
                : note0.staffPosition + 4;
        // (the upper and lower notes, if both are notes)
        var upperNote = note0, lowerNote = typeof note1 === "object" ? note1 : null;
        // note0 should be the upper one for our calculations here
        if (staffPosition0 < staffPosition1) {
            var temp = staffPosition0;
            staffPosition0 = staffPosition1;
            staffPosition1 = temp;
            [upperNote, lowerNote] = [lowerNote, upperNote];
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
            // staff interval.  As in Gregorio (the long stem of a flexus or
            // porrectus whose notes are a second apart), the bottom line only
            // counts as a line if the upper note has a ledger line below it, and
            // the ledger line below the staff doesn't (see stemQueue())
            var queue = upperNote && lowerNote ? stemQueue(lowerNote, upperNote) : undefined;
            if (staffPosition0 - staffPosition1 === 1 &&
                (queue === undefined
                    ? Math.abs(staffPosition0) % 2 === 1 && staffPosition1 > -3
                    : queue === StemQueue.OnSpaceAboveBottomLine))
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
        canvasCtxt.fillRect(this.bounds.x, this.bounds.y, ctxt.neumeLineWeight, this.bounds.height);
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
export class NeumeBeamVisualizer extends ChantLayoutElement {
    constructor(ctxt, x0, x1, staffPosition0, staffPosition1, yOffset = 0) {
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
    getPoints(ctxt) {
        const lineHeight = ctxt.neumeLineWeight * 3;
        return {
            x0: this.bounds.x - ctxt.neumeLineWeight / 2,
            x1: this.bounds.x + this.bounds.width + ctxt.neumeLineWeight / 2,
            y0: this.bounds.y,
            y1: this.bounds.y + this.bounds.height,
            height: lineHeight
        };
    }
    draw(ctxt) {
        var canvasCtxt = ctxt.canvasCtxt;
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
    getSvgProps(ctxt) {
        const points = this.getPoints(ctxt);
        return {
            points: `${points.x0},${points.y0 + points.height / 2} ${points.x0},${points.y0 - points.height / 2} ${points.x1},${points.y1 - points.height / 2} ${points.x1},${points.y1 + points.height / 2}`,
            fill: ctxt.neumeLineColor,
            class: "neumeBeam"
        };
    }
    createSvgNode(ctxt) {
        return QuickSvg.createNode("polygon", this.getSvgProps(ctxt));
    }
    createSvgTree(ctxt) {
        return QuickSvg.createSvgTree("polygon", this.getSvgProps(ctxt));
    }
    createSvgFragment(ctxt) {
        return QuickSvg.createFragment("polygon", this.getSvgProps(ctxt));
    }
}
export class VirgaLineVisualizer extends ChantLayoutElement {
    /**
     * @param fusedShift the interval to the next note, if a virga reversa or
     * oriscus scapus is fused to it (see FusedNeume.fusedShift()), or else 0
     */
    constructor(ctxt, note, fusedShift = 0) {
        super();
        var staffPosition = note.staffPosition;
        var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition);
        var y1;
        // a note on a space has a shorter stem than one on a line.  As in
        // Gregorio, a note on the bottom line has the shorter one unless it has a
        // ledger line below it (gabc [ll:1] counts), where its stem would end;
        // and so does a note on the ledger line below the staff (see
        // stemQueue(), whose queue types each have a stem: Gregorio's open one
        // is drawn as the shorter one).  Fused down to a note, the stem goes by
        // where that note is, and at a second the long and short swap, as
        // Gregorio's fusible_queued_shape() has it
        var queue = stemQueue(note, note, Math.min(fusedShift, 0));
        var long = queue === undefined
            ? Math.abs(staffPosition % 2) !== 0
            : fusedShift === -1
                ? queue === StemQueue.OnSpaceAboveBottomLine
                : fusedShift < 0
                    ? queue === StemQueue.OnBottomLine || queue === StemQueue.OnLineAboveBottomLine
                    : queue === StemQueue.OnLineAboveBottomLine;
        if (!long)
            y1 = y0 + ctxt.staffInterval * 1.8;
        else
            y1 = y0 + ctxt.staffInterval * 2.7;
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
        canvasCtxt.fillRect(this.bounds.x, this.bounds.y, ctxt.neumeLineWeight, this.bounds.height);
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
    /** @param bar whether it's a linea (gabc =), a flat bar between the lines, rather than lines around the note */
    constructor(ctxt, note, bar = false) {
        super();
        var staffPosition = note.staffPosition;
        if (bar) {
            // Gregorio's Linea glyph: a bar three quarters as tall as a punctum and
            // 2.4 times as wide, between lines that stand a quarter of a punctum's
            // height above and below it
            var punctumHeight = Glyphs.PunctumQuadratum.bounds.height * ctxt.glyphScaling;
            var barHeight = punctumHeight * 0.75;
            var overhang = punctumHeight / 4;
            this.bar = { y: overhang, height: barHeight };
            this.bounds.x = 0;
            this.bounds.y =
                ctxt.calculateHeightFromStaffPosition(staffPosition) - barHeight / 2 - overhang;
            this.bounds.width =
                Glyphs.PunctumQuadratum.bounds.width * ctxt.glyphScaling * 2.4 +
                    ctxt.neumeLineWeight * 2;
            this.bounds.height = barHeight + overhang * 2;
            this.origin.x = ctxt.neumeLineWeight;
            this.origin.y = 0;
            return;
        }
        this.bar = null;
        var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition) - note.origin.y;
        var y1 = y0 + note.bounds.height;
        this.bounds.x = 0;
        this.bounds.y = y0;
        this.bounds.width = ctxt.neumeLineWeight * 5 + note.bounds.width;
        this.bounds.height = y1 - y0;
        this.origin.x = ctxt.neumeLineWeight * 2.5;
        this.origin.y = 0;
    }
    // the rectangles to fill: the line on each side, and the bar if there is one
    getRects(ctxt) {
        var rects = [
            this.bounds.x,
            this.bounds.x + this.bounds.width - ctxt.neumeLineWeight
        ].map((x) => ({
            x,
            y: this.bounds.y,
            width: ctxt.neumeLineWeight,
            height: this.bounds.height
        }));
        if (this.bar)
            rects.push({
                x: this.bounds.x + ctxt.neumeLineWeight,
                y: this.bounds.y + this.bar.y,
                width: this.bounds.width - ctxt.neumeLineWeight * 2,
                height: this.bar.height
            });
        return rects;
    }
    draw(ctxt) {
        var canvasCtxt = ctxt.canvasCtxt;
        canvasCtxt.fillStyle = ctxt.neumeLineColor;
        for (var rect of this.getRects(ctxt))
            canvasCtxt.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
    getSvgProps(ctxt, rect) {
        return Object.assign(Object.assign({}, rect), { fill: ctxt.neumeLineColor, class: "neumeLine" });
    }
    createSvgNode(ctxt) {
        return QuickSvg.createNode("g", null, this.getRects(ctxt).map((rect) => QuickSvg.createNode("rect", this.getSvgProps(ctxt, rect))));
    }
    createSvgTree(ctxt) {
        return QuickSvg.createSvgTree("g", {}, ...this.getRects(ctxt).map((rect) => QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt, rect))));
    }
    createSvgFragment(ctxt) {
        return QuickSvg.createFragment("g", null, this.getRects(ctxt).map((rect) => QuickSvg.createFragment("rect", this.getSvgProps(ctxt, rect))).join(''));
    }
}
export class GlyphVisualizer extends ChantLayoutElement {
    /** (glyph is one that isn't in Glyphs, such as a NABC font's, whose def's id is glyphCode) */
    constructor(ctxt, glyphCode, glyph) {
        super();
        this.scale = 1;
        // setGlyph() sets the glyph just below
        this.glyph = null;
        this.setGlyph(ctxt, glyphCode, glyph);
    }
    setGlyph(ctxt, glyphCode, ownGlyph) {
        if (typeof glyphCode === "undefined" || glyphCode === null || glyphCode === "")
            glyphCode = GlyphCode.None;
        const swash = /^Porrectus([\d.]+)(Cavum)?$/.exec(glyphCode);
        const glyphId = swash && ctxt.glyphMultiplier !== 1
            ? `Porrectus${swash[1]}x${ctxt.glyphMultiplier}${swash[2] || ""}`
            : glyphCode;
        if (this.glyphId !== glyphId) {
            this.glyphCode = glyphCode;
            this.glyphId = glyphId;
            let glyph = (this.glyph =
                ownGlyph ||
                    (swash ? porrectusGlyph(glyphId, Number(swash[1]), ctxt.glyphMultiplier, !!swash[2]) : Glyphs[glyphCode]));
            this.porrectusNoteDiff = swash ? Number(swash[1]) : 0;
            // if this glyph hasn't been used yet, then load it up in the defs section for sharing
            if (!ctxt.defs.hasOwnProperty(glyphId)) {
                var getDefProps = () => {
                    var options = {
                        id: ctxt.defIdPrefix + glyphId,
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
                    ctxt.defs[glyphId] = QuickSvg.createFragment("g", options, QuickSvg.svgFragmentForGlyph(glyph, ctxt.negativeFillColor));
                    if (ctxt.defsNode)
                        ctxt.defsNode.appendChild(QuickSvg.createNode("g", options, QuickSvg.nodesForGlyph(glyph, "createNode", ctxt.negativeFillColor)));
                };
                makeDef.makeSvgTree = () => {
                    return QuickSvg.createSvgTree("g", getDefProps(), ...QuickSvg.nodesForGlyph(glyph, "createSvgTree", ctxt.negativeFillColor));
                };
                makeDef.glyphCode = glyphCode;
                makeDef();
                ctxt.makeDefs.push(makeDef);
            }
            this.align = this.glyph.align;
        }
        const glyphScaling = ctxt.glyphScaling * this.scale;
        this.origin.x = this.glyph.origin.x * glyphScaling;
        this.origin.y = this.glyph.origin.y * glyphScaling;
        this.bounds.x = 0;
        this.bounds.y = -this.origin.y;
        this.bounds.width = this.glyph.bounds.width * glyphScaling;
        this.bounds.height = this.glyph.bounds.height * glyphScaling;
    }
    setStaffPosition(ctxt, staffPosition) {
        this.bounds.y =
            ctxt.calculateHeightFromStaffPosition(staffPosition) - this.origin.y;
    }
    draw(ctxt) {
        var canvasCtxt = ctxt.canvasCtxt;
        var x = this.bounds.x + this.origin.x;
        var y = this.bounds.y + this.origin.y;
        var scale = ctxt.glyphScaling * this.scale;
        canvasCtxt.translate(x, y);
        canvasCtxt.scale(scale, scale);
        for (var i = 0; i < this.glyph.paths.length; i++) {
            var path = this.glyph.paths[i];
            if (!path.data)
                continue;
            canvasCtxt.fillStyle =
                path.type === "negative"
                    ? ctxt.negativeFillColor
                    : ctxt.neumeLineColor;
            // glyph paths are shared module-level objects, so the parsed Path2D is cached on them
            canvasCtxt.fill(path.path2d || (path.path2d = new Path2D(path.data)));
        }
        canvasCtxt.scale(1 / scale, 1 / scale);
        canvasCtxt.translate(-x, -y);
    }
    getSvgAttributes(ctxt, source) {
        let className = "";
        const porrectusNoteDiff = this.porrectusNoteDiff;
        if (porrectusNoteDiff) {
            // only the first note of a porrectus has a porrectus glyph
            let notes = source.neume.notes, noteIndex = notes.indexOf(source), nextNote = notes[noteIndex + 1];
            className = source.selected
                ? nextNote.selected
                    ? "selected"
                    : "selectedA"
                : nextNote.selected
                    ? "selectedB"
                    : "";
        }
        else {
            let isSelected = source && (source.selected || (source.model && source.model.selected));
            className = isSelected ? "selected" : "";
        }
        var result = {
            "xlink:href": "#" + ctxt.defIdPrefix + this.glyphId,
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
                    if (porrectusNoteDiff) {
                        result.class += ' porrectus porrectus-start';
                    }
                    else if (glyphCode === 'None') {
                        result.class += ' porrectus porrectus-end';
                    }
                }
            }
        }
        if (ctxt.scaleDefs === true) {
            result.x = this.bounds.x + this.origin.x;
            result.y = this.bounds.y + this.origin.y;
            if (this.scale !== 1) {
                result.transform = "scale(" + this.scale + ")";
                result.x /= this.scale;
                result.y /= this.scale;
            }
        }
        else {
            const glyphScaling = ctxt.glyphScaling * this.scale;
            result.x = (this.bounds.x + this.origin.x) / glyphScaling;
            result.y = (this.bounds.y + this.origin.y) / glyphScaling;
            result.transform = "scale(" + glyphScaling + "," + glyphScaling + ")";
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
        if (source)
            attributes.source = source;
        return QuickSvg.createSvgTree("use", attributes);
    }
    createSvgFragment(ctxt, source) {
        return QuickSvg.createFragment("use", this.getSvgAttributes(ctxt, source));
    }
}
// each NABC font that's been drawn: the name in its glyphs' defs' ids (its
// own, or with a number after it for another font of that name, such as one
// converted from another version of Gregorio), and the Glyph of each glyph
// of it that's been drawn, by its name
const __nabcFonts = new WeakMap();
const __nabcFontNames = new Map();
function nabcFont(font) {
    let drawn = __nabcFonts.get(font);
    if (!drawn) {
        let count = (__nabcFontNames.get(font.name) || 0) + 1;
        __nabcFontNames.set(font.name, count);
        __nabcFonts.set(font, (drawn = { id: count > 1 ? `${font.name}-${count}` : font.name, glyphs: {} }));
    }
    return drawn;
}
/** a NABC font's glyph as a Glyph, which GlyphVisualizer can draw */
function nabcGlyph(font, name) {
    let glyphs = nabcFont(font).glyphs;
    if (!Object.prototype.hasOwnProperty.call(glyphs, name)) {
        let [width, height, depth, data] = font.glyphs[name];
        glyphs[name] = {
            paths: [{ type: "positive", data }],
            bounds: { x: 0, y: -height, width, height: height + depth },
            origin: { x: 0, y: height }
        };
    }
    return glyphs[name];
}
/**
 * A line of Gregorio's NABC on a notation (ChantNotationElement.nabcNeumes):
 * its neumes, laid out with layoutNabc() and drawn with a NabcFont's
 * glyphs.  It starts at the left of the notation, as Gregorio's starts at
 * the left of its first glyph, and takes no room among the notes, and
 * ChantLine.performLayout() puts its baseline above or below the staff.
 */
export class NabcNeumes extends ChantLayoutElement {
    constructor(ctxt, items, voice, font, phantom = false) {
        super();
        this.voice = voice;
        this.phantom = phantom;
        let unit = (this.unit = (ctxt.nabcSize * ctxt.staffInterval) / font.unitsPerEm);
        let layout = (this.layout = layoutNabc(items, font, {
            interElementSpace: (NabcDimensions.interElementSpace * ctxt.staffInterval) / unit,
            largerSpace: (NabcDimensions.largerSpace * ctxt.staffInterval) / unit,
            alignment: ctxt.nabcAlignment,
            // (about as wide as ERR is, which is drawn so that it can be seen)
            errorWidth: font.unitsPerEm * NabcNeumes.errorSize * 2
        }));
        // (none for a phantom, which isn't drawn)
        this.glyphs = (phantom ? [] : layout.glyphs).map((placed) => {
            // (whose def's id is the font's name and the glyph's, as the font names
            // it, with B, N, E and T for >, -, ! and ~)
            let id = `Nabc-${nabcFont(font).id}-${placed.name.replace(/[>\-!~]/g, (char) => "BNET"[">-!~".indexOf(char)])}`;
            let glyph = nabcGlyph(font, placed.name);
            let visualizer = new GlyphVisualizer(ctxt, id, glyph);
            visualizer.scale = unit / ctxt.glyphScaling;
            visualizer.setGlyph(ctxt, id, glyph);
            visualizer.bounds.x = placed.x * unit;
            return visualizer;
        });
        // (as wide as the NABC's box, or its glyphs, where letters stick out of it)
        let right = Math.max(layout.width, ...layout.glyphs.map((placed) => placed.x + font.glyphs[placed.name][0]));
        this.bounds.x = layout.left * unit;
        this.bounds.width = (right - layout.left) * unit;
        this.bounds.height = (layout.height + layout.depth) * unit;
        this.setBaseline(0);
    }
    setBaseline(baseline) {
        this.baseline = baseline;
        this.bounds.y = baseline - this.layout.height * this.unit;
        this.glyphs.forEach((visualizer, i) => {
            visualizer.bounds.y = baseline - this.layout.glyphs[i].y * this.unit - visualizer.origin.y;
        });
    }
    // Gregorio's ERR, where the NABC is wrong, in the lyrics' font and the
    // neumes' color, as the canvas draws it
    errorAttributes(ctxt, x) {
        return {
            class: "nabcError",
            x: x * this.unit,
            y: this.baseline,
            // (with the font's names in ', which mean the same as " in css, since
            // the attribute is in ")
            "font-family": ctxt.textStyles.lyric.font.replace(/"/g, "'"),
            "font-size": NabcNeumes.errorSize * ctxt.nabcSize * ctxt.staffInterval,
            fill: ctxt.neumeLineColor
        };
    }
    draw(ctxt) {
        if (this.phantom)
            return;
        for (let glyph of this.glyphs)
            glyph.draw(ctxt);
        let canvasCtxt = ctxt.canvasCtxt;
        for (let x of this.layout.errors) {
            canvasCtxt.font = NabcNeumes.errorSize * ctxt.nabcSize * ctxt.staffInterval + "px " + ctxt.textStyles.lyric.font;
            canvasCtxt.fillStyle = ctxt.neumeLineColor;
            canvasCtxt.fillText("ERR", x * this.unit, this.baseline);
        }
    }
    getSvgAttributes() {
        return { class: "nabc nabc-" + (this.voice + 1) };
    }
    createSvgNode(ctxt) {
        return QuickSvg.createNode("g", this.getSvgAttributes(), [
            ...this.glyphs.map((glyph) => glyph.createSvgNode(ctxt)),
            ...this.layout.errors.map((x) => QuickSvg.createNode("text", this.errorAttributes(ctxt, x), "ERR"))
        ]);
    }
    createSvgTree(ctxt) {
        return QuickSvg.createSvgTree("g", this.getSvgAttributes(), ...this.glyphs.map((glyph) => glyph.createSvgTree(ctxt)), ...this.layout.errors.map((x) => QuickSvg.createSvgTree("text", this.errorAttributes(ctxt, x), "ERR")));
    }
    createSvgFragment(ctxt) {
        let inner = this.glyphs.map((glyph) => glyph.createSvgFragment(ctxt)).join("");
        for (let x of this.layout.errors)
            inner += QuickSvg.createFragment("text", this.errorAttributes(ctxt, x), "ERR");
        return QuickSvg.createFragment("g", this.getSvgAttributes(), inner);
    }
}
/** the size of ERR, where the NABC is wrong, in the font's ems */
NabcNeumes.errorSize = 0.6;
/** a brace over or under notes, which a canvas strokes along its svg path */
export class BraceVisualizer extends ChantLayoutElement {
    draw(ctxt) {
        var canvasCtxt = ctxt.canvasCtxt;
        canvasCtxt.strokeStyle = ctxt.neumeLineColor;
        canvasCtxt.lineWidth = ctxt.staffLineWeight;
        canvasCtxt.stroke(new Path2D(this.generatePathString()));
        if (this.accent)
            this.accent.draw(ctxt);
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
            return QuickSvg.createNode("g", {
                class: "accentedBrace"
            }, [node, this.accent.createSvgNode(ctxt)]);
        }
        else
            return node;
    }
    createSvgTree(ctxt) {
        var node = QuickSvg.createSvgTree("path", this.getSvgPathProps(ctxt));
        if (this.accent) {
            return QuickSvg.createSvgTree("g", {
                class: "accentedBrace"
            }, node, this.accent.createSvgTree(ctxt));
        }
        else
            return node;
    }
    createSvgFragment(ctxt) {
        var fragment = QuickSvg.createFragment("path", this.getSvgPathProps(ctxt));
        if (this.accent) {
            fragment += this.accent.createSvgFragment(ctxt);
            return QuickSvg.createFragment("g", {
                class: "accentedBrace"
            }, fragment);
        }
        else
            return fragment;
    }
}
export class RoundBraceVisualizer extends BraceVisualizer {
    constructor(ctxt, x1, x2, y, isAbove) {
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
        this.bounds = new Rect(x1, isAbove ? y - this.braceHeight : y, x2 - x1, this.braceHeight);
        this.origin.x = 0;
        this.origin.y = 0;
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
        }
        else {
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
        return ("M " +
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
            y.toFixed(dp));
    }
}
export class CurlyBraceVisualizer extends BraceVisualizer {
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
        if (isAbove)
            y -= this.braceHeight;
        this.braceBounds = new Rect(x1, y, x2 - x1, this.braceHeight);
        var bounds = this.braceBounds.clone();
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
    // code below inspired by: https://gist.github.com/alexhornbake
    // optimized for braces that are only drawn horizontally.
    // returns svg path d string
    generatePathString() {
        var q = 0.6; // .5 is normal, higher q = more expressive bracket
        var x1 = this.braceBounds.x;
        var x2 = this.braceBounds.right();
        var width = this.braceBounds.width;
        var y, h;
        if (this.isAbove) {
            y = this.braceBounds.bottom();
            h = -this.braceHeight;
        }
        else {
            y = this.braceBounds.y;
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
        return ("M " +
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
            ty1.toFixed(dp));
    }
}
// parseInt() of a span's newLine, which is the number of line breaks before
// it, or true where the text was wrapped (which comes out NaN)
const __parseNewLine = (newLine) => parseInt(newLine);
/** a run of text in one style */
export class TextSpan {
    constructor(text, propertyArray, activeTags, index = 0, extraProps) {
        if (typeof propertyArray === "undefined" || propertyArray === null)
            propertyArray = [];
        this.text = text;
        this.propertyArray = propertyArray;
        this.activeTags = activeTags || [];
        this.index = index;
        if (extraProps) {
            if ('xOffset' in extraProps)
                this.xOffset = extraProps.xOffset;
            if ('newLine' in extraProps)
                this.newLine = extraProps.newLine;
        }
    }
    /**
     * the styles in propertyArray merged together, which must not be modified.
     * They're kept until the text styles change (see ChantContext.clearTextCache()),
     * since the objects in propertyArray belong to the ChantContext.
     */
    get mergedProperties() {
        if (this.propertiesVersion !== __textStyleVersion) {
            this.propertiesVersion = __textStyleVersion;
            this.cachedProperties = Object.assign.apply(null, [{}].concat(this.propertyArray));
            this.cachedCss = undefined;
        }
        return this.cachedProperties;
    }
    get properties() {
        const result = Object.assign({}, this.mergedProperties);
        if ('xOffset' in this)
            result.xOffset = this.xOffset;
        if ('newLine' in this)
            result.newLine = this.newLine;
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
        if (this.xOffset)
            css += `xOffset: ${this.xOffset};`;
        if (this.newLine)
            css += `newLine: ${this.newLine};`;
        return css;
    }
    clone() {
        const result = new TextSpan(this.text, this.propertyArray, this.activeTags, this.index);
        if ('xOffset' in this)
            result.xOffset = this.xOffset;
        if ('newLine' in this)
            result.newLine = this.newLine;
        if ('wrappedSpace' in this)
            result.wrappedSpace = this.wrappedSpace;
        return result;
    }
}
class MarkupStackFrame {
    constructor(tagName, startIndex, propertyArray = [], symbol) {
        this.tagName = tagName;
        this.startIndex = startIndex;
        this.propertyArray = propertyArray;
        if (symbol)
            this.symbol = symbol;
    }
    get properties() {
        return Object.assign.apply(null, [{}].concat(this.propertyArray));
    }
    static createStackFrame(ctxt, tagName, startIndex, extraProperties = {}, symbol = '') {
        return new MarkupStackFrame(tagName, startIndex, [ctxt.fontStyleDictionary[tagName], extraProperties], symbol);
    }
}
// for escaping html strings before they go into the svgs
// adapted from http://stackoverflow.com/a/12034334/5720160
var __subsForTspans = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;"
};
// the markup in a TextElement's text (see generateSpansFromText()), and the
// characters that Gregorio's $ escaped (see gabcEscapes.ts)
const markupRegexSource = /(<br\/?>)|<v>([\s\S]*?)(?:<\/v>|$)|(\*)(?=\s*\*|[^*]*(?:$|<v>))|(\+)|<sp>(?:(~)|(')?([ao]e|[æœaeiouy])|([arv])\/)<\/sp>|([arv])\/\.|([℣℟])\.?|(?:([*_^%])|<(\/)?([bceiuv]|ul|sc|tt|font)(?:\s+(?:family="([^"]+)"|fill="([^"]+)"|class="([^"]+)"))*>)(?=(?:(.+?)(?:\11|<\/\13>))?)|<sp>([^<]*?)<\/sp>/.source + `|(${escapedSource})`;
// Gregorio's commands for the symbols in its greextra font (from its
// gregoriotex-symbols.tex), by their names in lower case
const __greextraCommands = {
    grecross: "Cross",
    grealtcross: "Cross.alt",
    gredagger: "Dagger",
    greheightstar: "StarHeight",
    gresixstar: "StarSix",
    grestar: "StarSix",
    gothrbar: "RWithBarGoth",
    gothvbar: "VWithBarGoth"
};
// TeX commands whose arguments aren't text to show: spacing, colors and
// labels, and Gregorio's own commands
const __texCommandsWithoutText = /^(?:gre|[hv]space$|[hv]skip$|kern$|rule$|[hv]?phantom$|color$|label$|(?:set|addto)length$)/i;
/** A piece of text in a score, e.g. a Lyric, Title, DropCap or Annotation. */
export class TextElement extends ChantLayoutElement {
    constructor(ctxt, text, fontFamily, fontSize, textAnchor, sourceIndex, sourceGabc, 
    /** set before the text is measured, since its css class can style it */
    textType) {
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
        if (textType)
            this.textType = textType;
        this.generateSpansFromText(ctxt, text);
        this.recalculateMetrics(ctxt);
    }
    /**
     * The matching element in score (see TextType.getFromScore()).  For title
     * text, score needs titles.
     */
    getFromScore(score) {
        return this.textType.getFromScore(score, this);
    }
    generateSpansFromText(ctxt, text) {
        text = text.replace(/\s+/g, " ");
        this.text = "";
        this.spans = [];
        delete this.wrappedSpans;
        // save ourselves a lot of grief for a very common text:
        if (text === "*" || text === "+" || text === "†") {
            let properties = text === "*"
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
        // (a frame has no Symbol, so this never matches)
        var filterFrames = (frame, symbol) => frame.Symbol === symbol;
        var closeSpan = (spanText, index, extraProperties) => {
            if (spanText === "" && !this.dropCap)
                return;
            this.text += spanText;
            var properties = [];
            for (var i = 0; i < markupStack.length; i++) {
                properties.push.apply(properties, markupStack[i].propertyArray);
            }
            if (extraProperties)
                properties.push(extraProperties);
            const span = new TextSpan(spanText, properties, markupStack.map((frame) => frame.tagName), index);
            this.spans.push(span);
            if (newLineInNextSpan) {
                span.newLine = newLineInNextSpan;
                newLineInNextSpan = 0;
            }
        };
        var markupRegex = new RegExp(markupRegexSource, "gi");
        // in verbatim TeX (<v>): a symbol in Gregorio's greextra font (as
        // {greextra}{Name}), a ligature, an acute accent on a vowel, an escaped
        // character, a command with its arguments, or a brace, which is left out
        // unless it's one of the others (a command's {arguments} may be read again)
        var vTagRegex = /\{greextra\}\{([^}]*)\}|\{?(\\?')?(?:\\([ao]e|æœaeiouy))\}?|\\'\{?([æœaeiouy])\}?|\\([a-z@]+)\*?((?:\s*(?:\[[^\]]*\]|\{(?:[^{}]|\{[^{}]*\})*\}))*)|\\([&%$#_{}])|[{}]/gi;
        var match = null;
        var openedAsterisk = false;
        var closeCurrentSpan = () => closeSpan(text.substring(spanStartIndex, match.index), spanStartIndex);
        while ((match = markupRegex.exec(text))) {
            var [, newLine, vTag, asterisk, plus, tilde, accent, vowelLigature, specialChar, specialChar2, specialChar3, markupSymbol, closingTag, tagName, family, fill, cssClass, enclosedText, special, escaped] = match;
            specialChar = specialChar || specialChar2 || specialChar3;
            // non-matching symbols first
            if (newLine) {
                // close the current span, if any:
                if (match.index > spanStartIndex) {
                    closeCurrentSpan();
                }
                // add the newline span:
                newLineInNextSpan++;
            }
            else if (vTag) {
                closeCurrentSpan();
                let vMatch;
                let lastIndex = 0;
                let iOffset = 0;
                while ((vMatch = vTagRegex.exec(vTag))) {
                    if (lastIndex < vMatch.index) {
                        closeSpan(vTag.slice(lastIndex, vMatch.index), match.index + lastIndex + iOffset);
                        iOffset = 3; // length of '<v>'
                    }
                    let [, greextra, accent, diphthong, accentedVowel, command, args, escaped] = vMatch;
                    let char = '';
                    if (diphthong) {
                        char = makeLigature(diphthong);
                        if (accent)
                            char = addAccent(char);
                        closeSpan(char, match.index + vMatch.index + iOffset);
                    }
                    else if (accentedVowel) {
                        closeSpan(addAccent(accentedVowel), match.index + vMatch.index + iOffset);
                    }
                    else if (escaped) {
                        closeSpan(escaped, match.index + vMatch.index + iOffset);
                    }
                    else {
                        if (command) {
                            // \greextra{Name}, or one of Gregorio's commands for a symbol
                            // (e.g. \grecross for the Cross)
                            greextra = /^greextra$/i.test(command)
                                ? (/\{([^{}]*)\}/.exec(args) || [])[1]
                                : __greextraCommands[command.toLowerCase()];
                            // any other command is left out, but the text of its {arguments}
                            // is read again (e.g. the x of \textit{x}), unless it has none
                            let braceIndex = args.indexOf("{");
                            if (!greextra &&
                                braceIndex >= 0 &&
                                !__texCommandsWithoutText.test(command))
                                vTagRegex.lastIndex -= args.length - braceIndex;
                        }
                        char = greextra && greextraGlyphs[greextra];
                        if (char) {
                            closeSpan(char, match.index + vMatch.index + iOffset, { 'font-family': 'greextra' });
                        }
                    }
                    lastIndex = vTagRegex.lastIndex;
                    iOffset = 3; // length of '<v>'
                }
                if (lastIndex < vTag.length) {
                    closeSpan(vTag.slice(lastIndex), match.index + lastIndex + iOffset);
                }
            }
            else if (asterisk) {
                closeCurrentSpan();
                // first check if it is just a symbol to close:
                if (markupStack.length > 0 &&
                    markupStack[markupStack.length - 1].symbol === asterisk) {
                    // close asterisk tag
                    markupStack.pop();
                }
                else {
                    // add special asterisk:
                    closeSpan(ctxt.specialCharText(asterisk) || '*', match.index, ctxt.asteriskProperties);
                }
            }
            else if (plus) {
                closeCurrentSpan();
                closeSpan(ctxt.specialCharText(plus) || '+', match.index, ctxt.plusProperties);
            }
            else if (tilde) {
                closeCurrentSpan();
                closeSpan('∼', match.index);
            }
            else if (vowelLigature) {
                let vowel = makeLigature(vowelLigature);
                if (accent)
                    vowel = addAccent(vowel);
                closeCurrentSpan();
                closeSpan(vowel, match.index);
            }
            else if (specialChar) {
                closeCurrentSpan();
                closeSpan(ctxt.textBeforeSpecialChar +
                    ctxt.specialCharText(specialChar) +
                    ctxt.textAfterSpecialChar, match.index, ctxt.specialCharProperties);
            }
            else if (escaped) {
                // a character that Gregorio's $ escaped (see gabcEscapes.ts)
                closeCurrentSpan();
                closeSpan(unescapeText(escaped), match.index);
            }
            else if (special !== undefined) {
                // the rest of Gregorio's specials
                closeCurrentSpan();
                let specialText = Object.prototype.hasOwnProperty.call(ctxt.specials, special)
                    ? ctxt.specials[special]
                    : special;
                if (specialText === "*")
                    closeSpan(ctxt.specialCharText("*") || "*", match.index, ctxt.asteriskProperties);
                else if (specialText === "+")
                    closeSpan(ctxt.specialCharText("+") || "+", match.index, ctxt.plusProperties);
                else
                    closeSpan(specialText, match.index);
            }
            else {
                // otherwise we're dealing with matching markup delimeters
                if (markupSymbol === "*") {
                    // we are only strict with the asterisk, because there are cases when it needs to be displayed rather than count as a markup symbol
                    if (enclosedText && /[^\s*]/.test(enclosedText)) {
                        openedAsterisk = true;
                    }
                    else if (openedAsterisk) {
                        openedAsterisk = false;
                    }
                    else {
                        // actually use the asterisk, since it doesn't have a matching closing asterisk
                        continue;
                    }
                }
                if (markupSymbol) {
                    tagName = ctxt.markupSymbolDictionary[markupSymbol];
                    if (markupStack.length > 0 &&
                        markupStack[markupStack.length - 1].tagName === tagName &&
                        markupStack[markupStack.length - 1].symbol === markupSymbol) {
                        closingTag = true;
                    }
                }
                if (markupStack.length > 0 &&
                    markupStack[markupStack.length - 1].tagName === tagName) {
                    // (a tag opened again inside itself, e.g. <i> in a translation,
                    // which is already in italics, changes nothing, but the text
                    // before it is kept)
                    closeCurrentSpan();
                    // group close
                    if (closingTag)
                        markupStack.pop();
                }
                else if (markupStack.filter(filterFrames).length > 0) {
                    // trying to open a recursive group (or forgot to close a previous group)
                    // in either case, we just unwind to the previous stack frame
                    spanStartIndex = markupStack[markupStack.length - 1].startIndex;
                    markupStack.pop();
                    continue;
                }
                else {
                    closeCurrentSpan();
                    if (closingTag) {
                        // out of order group close:
                        let index = markupStack.findIndex((frame) => frame.tagName === tagName);
                        if (index >= 0) {
                            markupStack.splice(index, 1);
                        }
                    }
                    else {
                        // group open
                        const extraProperties = {};
                        if (family)
                            extraProperties['font-family'] = family;
                        if (fill)
                            extraProperties.fill = fill;
                        if (cssClass)
                            extraProperties.class = cssClass;
                        markupStack.push(MarkupStackFrame.createStackFrame(ctxt, tagName, match.index, extraProperties, markupSymbol));
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
    /** the size in px of this element's text in the given properties */
    fontSizeForProperties(ctxt, properties = {}) {
        let fontSize = parseFloat(properties["font-size"]) || this.fontSize(ctxt);
        if (/%$/.test(properties["font-size"])) {
            fontSize *= this.fontSize(ctxt) / 100;
        }
        return fontSize * (this.resize || 1);
    }
    /** the distance from one line of this element's text to the next, in ems */
    lineSpacing(ctxt) {
        return (this.textType && ctxt.textStyles[this.textType.key].lineHeight) || 1.1;
    }
    /**
     * how far below the line before it the line that span starts is, in px: the
     * same as the span's dy in the svg, in its own font size
     */
    lineBreakHeight(ctxt, span, properties = span.mergedProperties) {
        return (this.lineSpacing(ctxt) *
            this.fontSizeForProperties(ctxt, properties) *
            (__parseNewLine(span.newLine) || 1));
    }
    getCanvasFontForProperties(ctxt, properties = {}) {
        var font = "";
        if (properties["font-style"] === "italic")
            font += "italic ";
        if (properties["font-variant"] === "small-caps")
            font += "small-caps ";
        if (properties["font-weight"] === "bold")
            font += "bold ";
        font += `${this.fontSizeForProperties(ctxt, properties)}px `;
        font += properties["font-family"] || this.fontFamily(ctxt);
        return font;
    }
    measureSubstringBBox(ctxt, length) {
        return this.measureSubstring(ctxt, length, true);
    }
    measureSubstring(ctxt, length, returnBBox = false, lastLineOnly = false) {
        if (length === 0)
            return 0;
        if (!length)
            length = Infinity;
        var lines;
        if (length < 0) {
            lines = -length;
            length = Infinity;
        }
        var strategy = ctxt.textMeasuringStrategy;
        var width = 0;
        var widths = [];
        var newLineSpans = [this.spans[0]];
        var subStringLength = 0;
        var fontSize = this.fontSize(ctxt) * (this.resize || 1);
        // the y of the current line's baseline
        var baseline = 0;
        var bbox = new Rect(0, 0, 0, 0);
        for (var i = 0; i < this.spans.length; i++) {
            var span = this.spans[i], myText = span.text.slice(0, length - subStringLength);
            if (span.newLine) {
                baseline += this.lineBreakHeight(ctxt, span);
                if (!lines && this.rightAligned === true && length === Infinity) {
                    newLineSpans[newLineSpans.length - 1].xOffset =
                        this.firstLineMaxWidth - width;
                    newLineSpans.push(span);
                }
                else if (--lines === 0)
                    break;
                widths.push(width);
                width = 0;
            }
            if (strategy === TextMeasuringStrategy.Canvas) {
                let metrics = ctxt.measureCanvasText(this.getCanvasFontForProperties(ctxt, span.mergedProperties), myText);
                if ("actualBoundingBoxAscent" in metrics) {
                    let left = metrics.actualBoundingBoxLeft;
                    bbox.union(new Rect(width - left, baseline - metrics.actualBoundingBoxAscent, metrics.width + left, metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent));
                    if (this instanceof DropCap) {
                        width += Math.max(0, left);
                    }
                }
                else {
                    bbox.union(new Rect(width, baseline - fontSize, metrics.width, fontSize));
                }
                width += metrics.width;
            }
            else if (strategy === TextMeasuringStrategy.OpenTypeJS &&
                ctxt.fontDictionary) {
                // get the bounding box for the substring, placing it at x = width, y = baseline
                const properties = span.mergedProperties;
                let font = ctxt.getFontForProperties(properties, properties["font-family"] || this.fontFamily(ctxt));
                const smallCaps = properties["font-variant"] === "small-caps";
                const spanFontSize = this.fontSizeForProperties(ctxt, properties);
                if ('getPath' in font) {
                    // opentype.js
                    const measured = ctxt.measureOpenTypeText(font, myText, width, baseline, spanFontSize, smallCaps);
                    let subBbox = measured.bbox;
                    let subWidth = measured.advanceWidth;
                    bbox.union(new Rect(width + subBbox.x1, subBbox.y1, subWidth - subBbox.x1, subBbox.y2 - subBbox.y1));
                    width += subWidth;
                    if (this instanceof DropCap) {
                        width -= subBbox.x1;
                    }
                }
                else {
                    // fontkit
                    const run = ctxt.layoutFontkitText(font, myText, smallCaps);
                    const { unitsPerEm } = font;
                    const multiplier = spanFontSize / unitsPerEm;
                    let subBbox = run.bbox;
                    let subWidth = run.advanceWidth * multiplier;
                    bbox.union(new Rect(width + subBbox.minX * multiplier, baseline - subBbox.maxY * multiplier, subWidth - subBbox.minX * multiplier, (subBbox.height) * multiplier));
                    width += subWidth;
                    if (this instanceof DropCap) {
                        width -= subBbox.minX * multiplier;
                    }
                }
            }
            else if (strategy === TextMeasuringStrategy.Svg) {
                const measured = ctxt.measureSvgText(this.createSvgNodeToMeasure(ctxt, span, myText));
                const subBbox = measured.bbox;
                bbox.union(new Rect(width + subBbox.x, baseline + subBbox.y, subBbox.width, subBbox.height));
                width += measured.advanceWidth;
                if (this instanceof DropCap) {
                    width -= Math.min(0, subBbox.x);
                }
            }
            subStringLength += myText.length;
            if (subStringLength === length)
                break;
        }
        if (!lines &&
            width &&
            newLineSpans.length &&
            this.rightAligned === true &&
            length === Infinity) {
            newLineSpans[newLineSpans.length - 1].xOffset =
                this.firstLineMaxWidth - width;
        }
        if (!lastLineOnly)
            width = Math.max(width, ...widths);
        if (returnBBox === true) {
            let height = bbox.height;
            let y = bbox.y, x = bbox.x;
            return { width, height, x, y };
        }
        else {
            return width;
        }
    }
    /**
     * The lines of the text, as they are drawn.  Where setMaxWidth() wrapped
     * the text, the spans no longer have the whitespace that it broke the line
     * at, though this.text still does.
     */
    getLines() {
        var lines = [], index = 0, textIndex = 0;
        this.spans.forEach((span, i) => {
            if (!i || span.newLine) {
                if (span.newLine === true)
                    textIndex += (span.wrappedSpace || " ").length;
                lines.push({ start: index, end: index, textStart: textIndex, xOffset: span.xOffset || 0 });
            }
            index += span.text.length;
            textIndex += span.text.length;
            lines[lines.length - 1].end = index;
        });
        return lines;
    }
    /** puts back the spans that setMaxWidth() replaced to wrap the text */
    unwrap() {
        var wrapped = this.wrappedSpans;
        if (!wrapped)
            return;
        for (var i = wrapped.length - 1; i >= 0; i--)
            this.spans.splice(wrapped[i].index, wrapped[i].count, ...wrapped[i].spans);
        delete this.wrappedSpans;
    }
    recalculateMetrics(ctxt, resetNewLines = true) {
        if (resetNewLines) {
            delete this.maxWidth;
            delete this.firstLineMaxWidth;
            delete this.rightAligned;
            delete this.resize;
            delete this.numLines;
            // (as they were before the text was wrapped, so that it's measured and
            // wrapped again the same way each time)
            this.unwrap();
            this.spans.forEach((span) => {
                delete span.xOffset;
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
            // (the loop above leaves TypeScript thinking that firstChild is null)
            var bbox = ctxt.svgTextMeasurer.firstChild.getBBox();
            this.bounds.width = bbox.width;
            this.bounds.height = bbox.height;
            this.origin.y = -bbox.y; // offset to baseline from top
            this.origin.x = -bbox.x;
        }
        else {
            let bbox = this.measureSubstringBBox(ctxt);
            this.bounds.width = bbox.width;
            this.bounds.height = bbox.height;
            this.origin.y = -bbox.y;
            this.origin.x = -bbox.x;
        }
        this.numLines = this.spans.reduce((result, span) => result +
            (span.newLine ? __parseNewLine(span.newLine) || 1 : 0), 1);
    }
    setMaxWidth(ctxt, maxWidth, firstLineMaxWidth = maxWidth) {
        if (this.wrappedSpans) {
            // first get rid of any new lines set from a previous maxWidth
            this.recalculateMetrics(ctxt);
        }
        if (this.bounds.width > maxWidth) {
            this.maxWidth = maxWidth;
            var percentage = maxWidth / this.bounds.width;
            if (this instanceof Lyric && percentage >= 0.85) {
                this.resize = percentage;
                // so that the next layout measures it at its full size again
                this.needsLayout = true;
            }
            else {
                if (firstLineMaxWidth < 0)
                    firstLineMaxWidth = maxWidth;
                this.firstLineMaxWidth = firstLineMaxWidth;
                // the places where a line could break: each run of whitespace, and the end
                var matches = [], regex = /\s+|$/g, match;
                while ((match = regex.exec(this.text)) &&
                    (!matches.length || match.index > matches[matches.length - 1].index))
                    matches.push(match);
                // whitespace at the very start doesn't end a word, so breaking there
                // would only leave the first line empty, and whitespace at the very
                // end is where the text ends
                if (matches.length > 1 && matches[0].index === 0)
                    matches.shift();
                if (matches.length > 1 &&
                    matches[matches.length - 2].index +
                        matches[matches.length - 2][0].length ===
                        this.text.length)
                    matches.pop();
                // a line can't go on past a <br>, so mark where each one is as forced,
                // along with any whitespace next to it, which then isn't measured as
                // part of the line before it
                var position = 0;
                this.spans.forEach((span, i) => {
                    if (i && span.newLine) {
                        let j = 0;
                        while (matches[j].index + matches[j][0].length < position)
                            j++;
                        if (matches[j].index <= position)
                            matches[j].forced = true;
                        else
                            matches.splice(j, 0, { index: position, 0: "", forced: true });
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
                    var index = this.findFirstMatchWiderThan(ctxt, matches, lineStart + 1, max, removed, lineEnd + 1);
                    if (index > lineEnd) {
                        // the rest of the line fits
                        max = maxWidth;
                        lineStart = lineEnd + 1;
                        continue;
                    }
                    var lastMatch = matches[index - 1];
                    match = matches[index];
                    // find the spans the whitespace to break at starts and ends in
                    var breakStart = lastMatch.index - removed, breakEnd = breakStart + lastMatch[0].length, spanIndex = 0, length = 0;
                    while (spanIndex < this.spans.length - 1 &&
                        length + this.spans[spanIndex].text.length <= breakStart) {
                        length += this.spans[spanIndex++].text.length;
                    }
                    var splitSpan = this.spans[spanIndex], textLeft = splitSpan.text.slice(0, breakStart - length), endIndex = spanIndex;
                    while (endIndex < this.spans.length - 1 &&
                        length + this.spans[endIndex].text.length < breakEnd) {
                        length += this.spans[endIndex++].text.length;
                    }
                    var endSpan = this.spans[endIndex], nextSpan = this.spans[endIndex + 1], textRight = endSpan.text.slice(breakEnd - length), newSpans = [];
                    this.rightAligned =
                        max === firstLineMaxWidth && firstLineMaxWidth !== maxWidth;
                    removed += lastMatch[0].length;
                    if (textLeft) {
                        let left = new TextSpan(textLeft, splitSpan.propertyArray, splitSpan.activeTags, undefined, 
                        // keep the line break of a span that starts a line
                        "newLine" in splitSpan
                            ? { newLine: splitSpan.newLine }
                            : undefined);
                        if ("wrappedSpace" in splitSpan)
                            left.wrappedSpace = splitSpan.wrappedSpace;
                        newSpans.push(left);
                    }
                    // the span that starts the new line keeps the whitespace taken out
                    // (see getLines())
                    if (textRight) {
                        let right = new TextSpan(textRight, endSpan.propertyArray, endSpan.activeTags, undefined, { newLine: true });
                        right.wrappedSpace = lastMatch[0];
                        newSpans.push(right);
                    }
                    else if (nextSpan) {
                        // (a copy, so that the span itself is put back as it was)
                        let next = nextSpan.clone();
                        next.newLine = true;
                        next.wrappedSpace = lastMatch[0];
                        newSpans.push(next);
                        endIndex++;
                    }
                    (this.wrappedSpans || (this.wrappedSpans = [])).push({
                        index: spanIndex,
                        count: newSpans.length,
                        spans: this.spans.splice(spanIndex, endIndex - spanIndex + 1, ...newSpans)
                    });
                    this.needsLayout = true;
                    max = maxWidth;
                    if (match.index === this.text.length ||
                        this.measureSubstring(ctxt) <= maxWidth)
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
    findFirstMatchWiderThan(ctxt, matches, start, max, removed = 0, end = matches.length) {
        // only the last line matters, since the lines before it were already
        // broken where they fit
        var isWider = (i) => this.measureSubstring(ctxt, matches[i].index - removed, false, true) >
            max;
        // first gallop forward to bracket the match...
        var low = start, high = start, step = 1;
        while (high < end && !isWider(high)) {
            low = high + 1;
            high += step;
            step *= 2;
        }
        high = Math.min(high, end);
        // ...then search between the last one that fit and the first that didn't
        while (low < high) {
            var mid = (low + high) >> 1;
            if (isWider(mid))
                high = mid;
            else
                low = mid + 1;
        }
        return low;
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
        if (this.textAnchor === "middle")
            canvasCtxt.textAlign = "center";
        else
            canvasCtxt.textAlign = "start";
        var translateWidth = 0, translateHeight = 0, extraStyleProperties = this.getExtraStyleProperties(ctxt), font = null;
        for (var i = 0; i < this.spans.length; i++) {
            var span = this.spans[i];
            var xOffset = span.xOffset || 0;
            var properties = Object.assign({}, extraStyleProperties, span.mergedProperties);
            if (span.newLine) {
                let lineHeight = this.lineBreakHeight(ctxt, span, properties);
                canvasCtxt.translate(translateWidth + xOffset, lineHeight);
                translateWidth = -xOffset;
                translateHeight -= lineHeight;
            }
            else if (xOffset) {
                canvasCtxt.translate(translateWidth + xOffset, 0);
                translateWidth = -xOffset;
            }
            var spanFont = this.getCanvasFontForProperties(ctxt, properties);
            if (spanFont !== font)
                canvasCtxt.font = font = spanFont;
            canvasCtxt.fillStyle = properties.fill || "#000";
            canvasCtxt.fillText(span.text, this.bounds.x, this.bounds.y, span.textLength || undefined);
            var metrics = ctxt.measureCanvasText(font, span.text);
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
        var properties = span.mergedProperties;
        var options = {
            "source-index": span.index,
            class: properties.class,
            style: useStyleObject ? span.properties : span.getCss()
        };
        if (span.newLine) {
            var xOffset = span.xOffset || 0;
            options.dy = this.lineSpacing(ctxt) * (__parseNewLine(span.newLine) || 1) + "em";
            options.x = this.bounds.x + xOffset;
        }
        else if (span.xOffset) {
            options.x = this.bounds.x + span.xOffset;
        }
        if (span.textLength) {
            options.textLength = span.textLength;
            options.lengthAdjust = "spacingAndGlyphs";
            options.y = this.bounds.y;
        }
        if (this.resize) {
            options["font-size"] = this.fontSizeForProperties(ctxt, properties);
            if (properties["font-size"]) {
                // the span's own font-size, in its style, would win over the attribute
                const style = span.properties;
                delete style["font-size"];
                options.style = useStyleObject ? style : getCssForProperties(style);
            }
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
    createSvgNodeToMeasure(ctxt, span, text) {
        const properties = span.mergedProperties;
        const extraStyleProperties = this.getExtraStyleProperties(ctxt);
        let textClass = this.getCssClasses().trim();
        if (extraStyleProperties.class)
            textClass = extraStyleProperties.class + " " + textClass;
        let style = properties;
        if (this.resize && properties["font-size"]) {
            // the span's own font-size, in its style, would win over the attribute
            style = Object.assign({}, properties);
            delete style["font-size"];
        }
        const spanNode = QuickSvg.createNode("tspan", {
            class: properties.class,
            style: getCssForProperties(style),
            "font-size": this.resize
                ? this.fontSizeForProperties(ctxt, properties)
                : undefined
        }, text);
        return QuickSvg.createNode("text", { class: textClass, style: getCssForProperties(extraStyleProperties) }, spanNode);
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
            spans += QuickSvg.createFragment("tspan", options, TextElement.escapeForTspan(span.text));
        }
        let options = this.getSvgProps();
        const extraStyleProperties = this.getExtraStyleProperties(ctxt);
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
};
/** helpers for the lyrics of a notation, one for each line of lyrics */
export const LyricArray = {
    getLeft: function (lyricArray) {
        if (lyricArray.length === 0)
            return NaN;
        var x = Number.MAX_VALUE;
        for (var i = 0; i < lyricArray.length; i++) {
            if (lyricArray[i])
                x = Math.min(x, lyricArray[i].notation.bounds.x + lyricArray[i].bounds.x);
        }
        return x;
    },
    /** (lessProtrusion leaves out how far each lyric may go past the end of the staff) */
    getRight: function (lyricArray, presumeConnectorNeeded, lessProtrusion) {
        if (lyricArray.length === 0)
            return NaN;
        var x = Number.MIN_VALUE;
        for (var i = 0; i < lyricArray.length; i++) {
            let l = lyricArray[i];
            if (l)
                x = Math.max(x, l.notation.bounds.x +
                    l.bounds.x +
                    l.bounds.width +
                    (presumeConnectorNeeded &&
                        l.allowsConnector() &&
                        !l.preventConnector &&
                        !l.needsConnector
                        ? l.getConnectorWidth()
                        : 0) -
                    (lessProtrusion ? l.protrusionWidth || 0 : 0));
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
        super(ctxt, (ctxt.textStyles.lyric.prefix || "") + text, (ctxt) => ctxt.textStyles.lyric.font, (ctxt) => ctxt.textStyles.lyric.size, "start", sourceIndex, text, TextTypes.lyric);
        // save the original text in case we need to later use the lyric
        // in a dropcap...
        this.originalText = text;
        // (only the lyrics of a score have a notation, rather than e.g. a hyphen being measured)
        this.notation = notation;
        this.notations = notations;
        if (typeof lyricType === "undefined" ||
            lyricType === null ||
            lyricType === "")
            this.lyricType = LyricType.SingleSyllable;
        else
            this.lyricType = lyricType;
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
        if (this.lyricType === LyricType.Directive)
            this.recalculateMetrics(ctxt);
    }
    allowsConnector() {
        return (this.lyricType === LyricType.BeginningSyllable ||
            this.lyricType === LyricType.MiddleSyllable);
    }
    setForceConnector(force) {
        this.forceConnector = force && this.allowsConnector();
    }
    // prevents a connector from ever being drawn after this lyric, without
    // affecting how the syllables are otherwise laid out within the word
    setPreventConnector(prevent) {
        this.preventConnector = prevent && this.allowsConnector();
    }
    setNeedsConnector(needs, width) {
        if ((needs === true || this.forceConnector) && !this.preventConnector) {
            this.needsConnector = true;
            if (typeof width !== "undefined") {
                this.setConnectorWidth(width);
            }
            else {
                this.bounds.width =
                    this.widthWithoutConnector + this.getConnectorWidth();
            }
            if (this.spans.length > 0 &&
                this.spans[this.spans.length - 1] !== this.connectorSpan)
                this.spans.push(this.connectorSpan);
        }
        else {
            this.clearConnectorWidth();
            this.needsConnector = false;
            this.bounds.width = this.widthWithoutConnector;
            var span = this.spans.pop();
            if (span && span !== this.connectorSpan)
                this.spans.push(span);
        }
    }
    setConnectorWidth(width) {
        this.connectorWidth = width;
        this.connectorSpan.textLength = width;
        if (this.needsConnector)
            this.bounds.width = this.widthWithoutConnector + this.getConnectorWidth();
    }
    /** gives the connector its default width, and draws it that wide */
    clearConnectorWidth() {
        this.connectorWidth = 0;
        if (this.connectorSpan && this.connectorSpan.textLength)
            this.connectorSpan.textLength = 0;
    }
    /**
     * puts the connector back as recalculateMetrics() leaves it, which a lyric
     * has only if it's forced to (and was measured with)
     */
    resetConnector() {
        var needs = !!this.forceConnector && !this.preventConnector;
        // (setConnectorWidth() and clearConnectorWidth() keep the connector's
        // textLength the same as connectorWidth)
        if (this.needsConnector === needs && !this.connectorWidth && this.bounds.width === this.widthWithoutConnector)
            return;
        var last = this.spans[this.spans.length - 1];
        this.needsConnector = needs;
        if (this.needsConnector) {
            if (last && last !== this.connectorSpan)
                this.spans.push(this.connectorSpan);
        }
        else if (last && last === this.connectorSpan)
            this.spans.pop();
        this.clearConnectorWidth();
        this.bounds.width = this.widthWithoutConnector;
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
        this.clearConnectorWidth();
        this.defaultConnectorWidth = ctxt.hyphenWidth;
        var activeLanguage = this.language || ctxt.defaultLanguage;
        // calculate the point where the text lines up to the staff notation
        // and offset the rect that much. By default we just center the text,
        // but the logic below allows for smarter lyric alignment based
        // on manual override or language control.
        var offset = this.widthWithoutConnector / 2, x1, x2, vowelSegmentWidth = this.widthWithoutConnector;
        // svgTextMeasurer still has the current lyric in it...
        var svgText = ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg
            ? ctxt.svgTextMeasurer.firstChild
            : null;
        var lines = this.getLines();
        // the line that an index of this.text is on
        var lineAt = (index) => lines.reduce((result, line) => (line.textStart <= index ? line : result));
        // the x of an index of the spans' text, on its line as it's drawn
        var measure = (line, index) => line.xOffset +
            (index <= line.start
                ? 0
                : svgText
                    ? svgText.getSubStringLength(line.start, index - line.start)
                    : this.measureSubstring(ctxt, index, false, true));
        // the x of the start and the end of length characters of this.text from
        // index, on the line that they start on (and so that they end on, at the
        // latest)
        var measureOnLine = (index, length) => {
            let line = lineAt(index), start = Math.min(line.end, line.start + index - line.textStart);
            return [measure(line, start), measure(line, Math.min(line.end, start + length))];
        };
        // some simple checks for sanity, and disable manual centering if the numbers are bad
        if (this.centerStartIndex >= 0 &&
            (this.centerStartIndex >= this.text.length ||
                this.centerLength < 0 ||
                this.centerStartIndex + this.centerLength > this.text.length))
            this.centerStartIndex = -1;
        if (this.text.length === 0) {
            // if we have no text to work with, then there's nothing to do!
            // Unless it's a drop cap, in which case we center the connector:
            if (this.dropCap && this.originalText) {
                offset = ctxt.hyphenWidth / 2;
                vowelSegmentWidth = ctxt.hyphenWidth;
            }
        }
        else if (this.centerStartIndex >= 0) {
            // if we have manually overriden the centering logic for this lyric,
            // then always use that.
            [x1, x2] = measureOnLine(this.centerStartIndex, this.centerLength);
            offset = (x1 + x2) / 2;
            vowelSegmentWidth = x2 - x1;
        }
        else {
            // if it's a directive with no manual centering override, then
            // just center the text.
            if (this.lyricType !== LyricType.Directive) {
                // only consider text content after the last space (if any)
                var startIndex = this.text.lastIndexOf(" ") + 1;
                // unless there are no text characters following the space:
                if (startIndex > 0 &&
                    !this.text
                        .slice(startIndex)
                        .match(/[a-záéíóúýäëïöüÿàèìòùỳāēīōūȳăĕĭŏŭ]/i)) {
                    startIndex = 0;
                }
                // elisions (<e> tags) count as consonants when finding the vowel
                // segment, so one at the start is skipped and any later one ignored:
                var textStartIndex = startIndex;
                var elisions = [];
                let index = 0;
                for (var span of this.spans) {
                    let endIndex = index + span.text.length;
                    if (span.activeTags.includes('e') && endIndex > startIndex) {
                        if (index <= startIndex) {
                            startIndex = endIndex;
                        }
                        else {
                            elisions.push({ index, endIndex });
                        }
                    }
                    index = endIndex;
                }
                // (findVowelSegment counts the ranges from startIndex)
                var ignore = elisions.map((range) => ({
                    index: range.index - startIndex,
                    endIndex: range.endIndex - startIndex
                }));
                // Non-directive elements are lined up to the chant notation based on vowel segments,
                // or (as ctxt.lyricCentering says) on the whole syllable or its first letter
                var result = ctxt.lyricCentering === "syllable"
                    ? { found: true, startIndex: 0, length: this.text.length }
                    : ctxt.lyricCentering === "firstletter"
                        ? { found: true, startIndex: 0, length: Array.from(this.text)[0].length }
                        : activeLanguage.findVowelSegment(this.text, startIndex, ignore);
                if (result.found !== true) {
                    // with no vowel, center on the syllable's letters, elisions and all
                    // (as Gregorio centers a syllable with no vowel as a whole)
                    startIndex = textStartIndex;
                    var match = this.text.slice(startIndex).match(/[a-z]+/i);
                    if (match) {
                        result.startIndex = startIndex + match.index;
                        result.length = match[0].length;
                    }
                    else {
                        result.startIndex = startIndex;
                        result.length = this.text.length - startIndex;
                    }
                }
                [x1, x2] = measureOnLine(result.startIndex, result.length);
                offset = (x1 + x2) / 2;
                vowelSegmentWidth = x2 - x1;
            }
        }
        this.vowelSegmentWidth = vowelSegmentWidth;
        // the width of the text after a <pr>, times how much of it may protrude,
        // unless a connector would follow it (which Gregorio doesn't protrude)
        this.protrusionWidth = 0;
        // (the drop cap took the first letter of the text that the index counts in)
        let protrusionIndex = this.protrusion
            ? Math.max(0, this.protrusion.textIndex - (this.dropCap ? 1 : 0))
            : 0;
        if (this.protrusion &&
            protrusionIndex < this.text.length &&
            !(this.allowsConnector() && !this.preventConnector)) {
            let factor = this.protrusion.factor;
            if (factor === undefined)
                factor = ctxt.defaultProtrusionFactor;
            // the right of the text before it: where it starts on its line, unless
            // a line before that ends further right.  (The width is measured from
            // the left of the line that's moved right the least.)
            let line = lineAt(protrusionIndex);
            let start = Math.max(measureOnLine(protrusionIndex, 0)[0], ...lines.slice(0, lines.indexOf(line)).map((before) => measure(before, before.end))) - Math.min(...lines.map((each) => each.xOffset));
            this.protrusionWidth =
                Math.max(0, Math.min(1, factor)) * (this.widthWithoutConnector - start);
        }
        this.bounds.x = -offset;
        this.bounds.y = 0;
        this.origin.x = offset;
    }
    generateDropCap(ctxt) {
        if (this.dropCap)
            return this.dropCap;
        // (the letter is taken from the spans as they were before any wrapping)
        this.unwrap();
        // disallow special characters:
        if (this.spans[0].mergedProperties['font-family'] === ctxt.specialCharProperties['font-family']) {
            return null;
        }
        let dropCapSpan = this.spans[0].clone();
        dropCapSpan.text = dropCapSpan.text.slice(0, 1).toUpperCase();
        let dropCapLowerCase = dropCapSpan.text.toLowerCase();
        // disallow any characters that do not change from .toUpperCase():
        if (dropCapSpan.text === dropCapLowerCase)
            return null;
        if (dropCapSpan.activeTags.indexOf("sc") >= 0)
            dropCapSpan.text = dropCapLowerCase;
        var dropCap = (this.dropCap = new DropCap(ctxt, "", this.sourceIndex));
        dropCap.spans = [dropCapSpan];
        let dropCapSourceGabcLength = this.sourceGabc.match(/^(?:<\/?[^>]+>)*.?(?:<\/[^>]+>)*/)[0].length;
        dropCap.sourceGabc = this.sourceGabc.slice(0, dropCapSourceGabcLength);
        this.sourceIndex += dropCap.sourceGabc.length;
        this.sourceGabc = this.sourceGabc.slice(dropCapSourceGabcLength);
        this.spans[0].text = this.spans[0].text.slice(1);
        this.text = this.text.slice(1);
        this.centerStartIndex--; // lost a letter, so adjust centering accordingly
        return dropCap;
    }
    /**
     * Gives the lyric the styles of the score's first word (part "word"), or of
     * its first syllable ("syllable", which also styles the first letter after
     * any drop cap), from ChantContext.firstWordStyle and so on, or takes them
     * away (null).  Returns whether the lyric's spans changed.
     */
    setFirstWordStyles(ctxt, part) {
        const hasProperties = (style) => !!style && Object.keys(style).length > 0;
        let styles = [], initialStyle = null;
        if (part) {
            styles = [ctxt.firstWordStyle];
            if (part === "syllable") {
                styles.push(ctxt.firstSyllableStyle);
                initialStyle = ctxt.firstSyllableInitialStyle;
            }
            styles = styles.filter(hasProperties);
            if (initialStyle && !hasProperties(initialStyle))
                initialStyle = null;
        }
        const applied = this.firstWordStyles || [];
        if (applied.length === styles.length + 1 &&
            styles.every((style, i) => applied[i] === style) &&
            applied[styles.length] === initialStyle)
            return false;
        if (!applied.length && !styles.length && !initialStyle)
            return false;
        if (applied.length) {
            // start again from the lyric as it was parsed (less its drop cap), which
            // was before it had a drop cap, so without its empty spans
            const dropCap = this.dropCap;
            this.dropCap = null;
            this.generateSpansFromText(ctxt, (ctxt.textStyles.lyric.prefix || "") + this.originalText);
            this.dropCap = dropCap;
            if (this.dropCap) {
                this.spans[0].text = this.spans[0].text.slice(1);
                this.text = this.text.slice(1);
            }
        }
        this.firstWordStyles =
            styles.length || initialStyle ? [...styles, initialStyle] : undefined;
        if (!this.firstWordStyles)
            return true;
        // the lyric's own markup goes last, so that it wins
        this.unwrap();
        let spans = [];
        for (let span of this.spans) {
            if (span === this.connectorSpan)
                continue;
            let propertyArray = [...styles, ...span.propertyArray];
            if (initialStyle && span.text) {
                // the first letter gets a span of its own
                const initial = Array.from(span.text)[0];
                const initialSpan = span.clone();
                initialSpan.text = initial;
                initialSpan.propertyArray = [...styles, initialStyle, ...span.propertyArray];
                spans.push(initialSpan);
                initialStyle = null;
                if (span.text.length === initial.length)
                    continue;
                span = span.clone();
                span.text = span.text.slice(initial.length);
                span.index += initial.length;
                delete span.newLine;
                delete span.wrappedSpace;
            }
            else {
                span = span.clone();
            }
            span.propertyArray = propertyArray;
            spans.push(span);
        }
        this.spans = spans;
        return true;
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
        super(ctxt, (ctxt.textStyles.choralSign.prefix || "") + text, (ctxt) => ctxt.textStyles.choralSign.font, TextTypes.choralSign.size, "start", sourceIndex, text, TextTypes.choralSign);
        this.positionHint = MarkingPositionHint.Default;
        this.note = note;
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
        }
        else {
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
    constructor(ctxt, text, notation, sourceIndex) {
        super(ctxt, (ctxt.textStyles.al.prefix || "") + text, (ctxt) => ctxt.textStyles.al.font, (ctxt) => ctxt.textStyles.al.size, "start", sourceIndex, text, TextTypes.al);
        // (text above a note gets moved to its neume, see Gabc.createNeumesFromNotes)
        this.notation = notation;
        this.padding = ctxt.staffInterval / 2;
    }
}
export class TranslationText extends TextElement {
    constructor(ctxt, text, notation, sourceIndex) {
        var gabcSource = text;
        var anchor = "start";
        if (text === "/") {
            text = "";
            anchor = "end";
        }
        else {
            text = (ctxt.textStyles.translation.prefix || "") + text;
        }
        super(ctxt, text, (ctxt) => ctxt.textStyles.translation.font, (ctxt) => ctxt.textStyles.translation.size, anchor, sourceIndex, gabcSource, TextTypes.translation);
        this.notation = notation;
        this.padding = ctxt.staffInterval / 2;
    }
}
export class DropCap extends TextElement {
    constructor(ctxt, text, sourceIndex) {
        super(ctxt, (ctxt.textStyles.dropCap.prefix || "") + text, (ctxt) => ctxt.textStyles.dropCap.font, (ctxt) => ctxt.textStyles.dropCap.size, "middle", sourceIndex, text, TextTypes.dropCap);
        this.fontSize = (ctxt) => this.sizeForLines || ctxt.textStyles.dropCap.size;
        this.padding = ctxt.staffInterval * ctxt.textStyles.dropCap.padding;
    }
    /** measures the drop cap at the given font size, or else its text style's */
    measureAtSize(ctxt, size) {
        if (size)
            this.sizeForLines = size;
        else
            delete this.sizeForLines;
        this.recalculateMetrics(ctxt);
    }
    /**
     * Makes the drop cap's height above and below its baseline its letter's,
     * where it was measured by its font's box instead, as it is with
     * TextMeasuringStrategy.Svg or a canvas without actualBoundingBox metrics:
     * its letter as measured on a canvas, where the browser can, or else a
     * typical capital, 0.7em high.
     */
    fitBoundsToLetter(ctxt) {
        var strategy = ctxt.textMeasuringStrategy, span = this.spans[0];
        if (!span || (strategy !== TextMeasuringStrategy.Svg && strategy !== TextMeasuringStrategy.Canvas))
            return;
        if (strategy === TextMeasuringStrategy.Svg &&
            typeof TextMetrics !== "undefined" &&
            "actualBoundingBoxAscent" in TextMetrics.prototype)
            ctxt.makeCanvasIfNeeded();
        var metrics = ctxt.canvasCtxt &&
            ctxt.measureCanvasText(this.getCanvasFontForProperties(ctxt, span.mergedProperties), span.text);
        if (metrics && "actualBoundingBoxAscent" in metrics) {
            // (as a canvas strategy has measured it already)
            if (strategy === TextMeasuringStrategy.Canvas)
                return;
            this.origin.y = metrics.actualBoundingBoxAscent;
            this.bounds.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        }
        else {
            this.origin.y = this.bounds.height = this.fontSize(ctxt) * 0.7;
        }
    }
    getExtraStyleProperties(ctxt) {
        var properties = super.getExtraStyleProperties(ctxt);
        // (the drop cap's css class gives it its text style's size)
        return this.sizeForLines
            ? Object.assign({}, properties, { "font-size": this.sizeForLines + "px" })
            : properties;
    }
}
export class TitleTextElement extends TextElement {
    constructor(ctxt, text, fontFamily, fontSize, textAnchor, sourceIndex, sourceGabc, textType) {
        super(ctxt, text, fontFamily, fontSize, textAnchor, sourceIndex, sourceGabc, textType);
    }
}
export class Supertitle extends TitleTextElement {
    constructor(ctxt, text, sourceIndex) {
        super(ctxt, (ctxt.textStyles.supertitle.prefix || "") + text, (ctxt) => ctxt.textStyles.supertitle.font, (ctxt) => ctxt.textStyles.supertitle.size, "middle", sourceIndex, text, TextTypes.supertitle);
        this.padding = (ctxt) => ((Number(ctxt.textStyles.supertitle.padding) || 1) * ctxt.textStyles.supertitle.size / 3);
    }
}
export class Title extends TitleTextElement {
    constructor(ctxt, text, sourceIndex) {
        super(ctxt, (ctxt.textStyles.title.prefix || "") + text, (ctxt) => ctxt.textStyles.title.font, (ctxt) => ctxt.textStyles.title.size, "middle", sourceIndex, text, TextTypes.title);
        this.padding = (ctxt) => ((Number(ctxt.textStyles.title.padding) || 1) * ctxt.textStyles.title.size / 3);
    }
}
export class Subtitle extends TitleTextElement {
    constructor(ctxt, text, sourceIndex) {
        super(ctxt, (ctxt.textStyles.subtitle.prefix || "") + text, (ctxt) => ctxt.textStyles.subtitle.font, (ctxt) => ctxt.textStyles.subtitle.size, "middle", sourceIndex, text, TextTypes.subtitle);
        this.padding = (ctxt) => ((Number(ctxt.textStyles.subtitle.padding) || 1) * ctxt.textStyles.subtitle.size / 3);
    }
}
export class TextLeftRight extends TitleTextElement {
    constructor(ctxt, text, type, sourceIndex) {
        super(ctxt, (ctxt.textStyles.leftRight.prefix || "") + text, (ctxt) => ctxt.textStyles.leftRight.font, (ctxt) => ctxt.textStyles.leftRight.size, type === "textLeft" ? "start" : "end", sourceIndex, text, TextTypes.leftRight);
        this.extraClass = type === "textLeft" ? "textLeft" : "textRight";
        this.headerKey = type === "textLeft" ? "text-left" : "text-right";
        this.padding = (ctxt) => ((Number(ctxt.textStyles.leftRight.padding) || 1) * ctxt.textStyles.leftRight.size / 5);
        // measured again, since TextElement measured it before it had extraClass
        this.recalculateMetrics(ctxt);
    }
    getCssClasses() {
        return this.extraClass + " " + super.getCssClasses();
    }
}
export class Annotation extends TextElement {
    constructor(ctxt, text, elementIndex) {
        super(ctxt, (ctxt.textStyles.annotation.prefix || "") + text, (ctxt) => ctxt.textStyles.annotation.font, (ctxt) => ctxt.textStyles.annotation.size, "middle", undefined, text, TextTypes.annotation);
        if (typeof elementIndex === 'number')
            this.elementIndex = elementIndex;
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
        this.annotations = texts.map(function (text, i) {
            return new Annotation(ctxt, text, i);
        });
        this.padding = Math.max.apply(null, this.annotations.map(function (annotation) {
            return annotation.padding;
        }));
    }
    updateBounds(multiplier) {
        if (!multiplier)
            multiplier = 1;
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
            // past the annotation's line breaks, to the line after its last line
            annotation.spans.forEach((span) => {
                if (span.newLine)
                    y += annotation.lineBreakHeight(ctxt, span);
            });
            y += annotation.fontSize(ctxt) * (annotation.resize || 1) * (this.lineHeight || annotation.lineSpacing(ctxt));
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
/**
 * A notation in a score: a neume, clef, divider, accidental, custos, line
 * break or text with no notes.  The layout tells them apart by the flags
 * isNeume, isClef, isDivider and isAccidental.
 */
export class ChantNotationElement extends ChantLayoutElement {
    /** the NABC of each line, read with parseNabc(): its neumes, spaces and errors */
    get parsedNabc() {
        if (!this.nabc)
            return undefined;
        let nabc = JSON.stringify(this.nabc);
        if (!this.readNabc || this.readNabc.nabc !== nabc)
            this.readNabc = { nabc, items: this.nabc.map(parseNabc) };
        return this.readNabc.items;
    }
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
        if (this.lyrics.length === 0)
            return this.bounds.right();
        var x = Number.MAX_VALUE;
        for (var i = 0; i < this.lyrics.length; i++) {
            if (this.lyrics[i])
                x = Math.min(x, this.lyrics[i].bounds.x);
        }
        return this.bounds.x + x;
    }
    getAllLyricsRight() {
        if (this.lyrics.length === 0)
            return this.bounds.x;
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
            else
                this.bounds.union(chantLayoutElement.bounds);
        }
        this.visualizers.push(chantLayoutElement);
    }
    // same as addVisualizer, except the element is unshifted to the front
    // of the visualizer array rather than the end. This way, some
    // visualizers can be placed behind the others...ledger lines for example.
    prependVisualizer(chantLayoutElement) {
        if (this.bounds.isEmpty())
            this.bounds = chantLayoutElement.bounds.clone();
        else
            this.bounds.union(chantLayoutElement.bounds);
        this.visualizers.unshift(chantLayoutElement);
    }
    // chant notation elements are given an opportunity to perform their layout via this function.
    // subclasses should call this function first in overrides of this function.
    // on completion, exsurge presumes that the bounds, the origin, and the fragment objects are
    // all valid and prepared for higher level layout.
    performLayout(ctxt) {
        if (typeof this.trailingSpace === "function")
            this.calculatedTrailingSpace = this.trailingSpace(ctxt);
        else
            this.calculatedTrailingSpace = this.trailingSpace;
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
        // (only two lines of NABC are drawn, as in Gregorio)
        let parsedNabc = this.parsedNabc;
        this.nabcNeumes =
            parsedNabc && ctxt.nabcFonts.length
                ? parsedNabc.slice(0, 2).map((items, voice) => {
                    let visibility = ctxt.nabcVisibility[voice] || "visible";
                    if (!items.length || visibility === "invisible")
                        return undefined;
                    let font = ctxt.nabcFonts[voice] || ctxt.nabcFonts[0];
                    return new NabcNeumes(ctxt, items, voice, font, visibility === "phantom");
                })
                : undefined;
        if (this.nabcNeumes && !this.nabcNeumes.some((nabc) => nabc))
            this.nabcNeumes = undefined;
    }
    // some subclasses have internal dependencies on other notations (for example,
    // a custos can depend on a later neume which it uses to set its height).
    // subclasses can override this function so that when the notations are
    // altered, the subclass can correctly invalidate (and later restore) its own
    // depedencies
    resetDependencies() { }
    // a helper function for subclasses to call after they are done performing layout...
    finishLayout(ctxt) {
        this.bounds.x = 0;
        this.layoutTrailingSpace = this.calculatedTrailingSpace;
        this.alignLyrics(ctxt);
        this.needsLayout = false;
    }
    // lines the lyrics up with the notation, once they and the notation have been measured
    alignLyrics(ctxt) {
        let language = (this.lyrics[0] && this.lyrics[0].language) || ctxt.defaultLanguage;
        // center the neume itself over the syllable, or just the first punctum
        // if the neume is wider than the syllable + the width of a punctum, we always revert to centering just over the punctum
        let calculateLyricX = language.centerNeume
            ? (lyric) => (lyric.bounds.x =
                this.bounds.width + ctxt.staffInterval < lyric.vowelSegmentWidth
                    ? this.bounds.width / 2 - lyric.origin.x
                    : this.origin.x - lyric.origin.x)
            : (lyric) => (lyric.bounds.x = this.origin.x - lyric.origin.x);
        this.lyrics.forEach(calculateLyricX);
    }
    draw(ctxt) {
        var canvasCtxt = ctxt.canvasCtxt;
        canvasCtxt.translate(this.bounds.x, 0);
        for (var i = 0; i < this.visualizers.length; i++)
            this.visualizers[i].draw(ctxt);
        for (i = 0; i < this.lyrics.length; i++)
            this.lyrics[i].draw(ctxt);
        if (this.translationText)
            for (i = 0; i < this.translationText.length; i++)
                this.translationText[i].draw(ctxt);
        if (this.alText)
            for (i = 0; i < this.alText.length; i++)
                this.alText[i].draw(ctxt);
        if (this.nabcNeumes)
            for (let nabc of this.nabcNeumes)
                if (nabc)
                    nabc.draw(ctxt);
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
        if (this.nabcNeumes)
            for (let nabc of this.nabcNeumes)
                if (nabc && !nabc.phantom)
                    inner.push(nabc[functionName](ctxt));
        if (this.visualizers.length) {
            // (only annotations make more than one svg node)
            let visualizers = [];
            for (var i = 0; i < this.visualizers.length; i++)
                visualizers.push(this.visualizers[i][functionName](ctxt, this));
            if (functionName === "createSvgTree") {
                inner.push(QuickSvg.createSvgTree("g", { class: "Notations" }, ...visualizers));
            }
            else {
                inner.push(QuickSvg.createNode("g", { class: "Notations" }, visualizers));
            }
        }
        return inner;
    }
    getSvgProps() {
        return {
            // this.constructor.name is kept by the minified build too (see rollup.config.mjs)
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
        if (this.nabcNeumes)
            for (let nabc of this.nabcNeumes)
                if (nabc && !nabc.phantom)
                    inner += nabc.createSvgFragment(ctxt);
        for (var i = 0; i < this.visualizers.length; i++)
            inner += this.visualizers[i].createSvgFragment(ctxt, this);
        return QuickSvg.createFragment("g", this.getSvgProps(), inner);
    }
}
const __connectorSpan = new TextSpan(" • ");
const __mergeAnnotationWithTextLeft = (...annotationSpans) => annotationSpans.reduce((result, spans) => {
    if (result && result.length) {
        if (spans && spans.length)
            return result.concat(__connectorSpan, spans);
        else
            return result;
    }
    else if (spans && spans.length) {
        return spans;
    }
    return [];
});
//# sourceMappingURL=Exsurge.Drawing.js.map