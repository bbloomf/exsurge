// Renders gabc through every output path that exsurge has (the svg string,
// the svg tree, svg DOM nodes and drawing on a canvas), measuring text with
// stand-ins for fontkit, opentype.js and canvas fonts, so that what exsurge
// draws can be compared from one version to the next.
//
// Everything here works with the exsurge module namespace passed in, rather
// than importing it, so that the same cases can be run on the source and on
// the built bundles.

export type Exsurge = any;

export type Strategy =
  | "fontkit" // fontkit fonts, with a separate font for bold, italic and bold italic
  | "opentype" // opentype.js fonts
  | "canvas" // a canvas that gives the bounding box of what it measures
  | "canvas-basic" // a canvas that only gives widths, like older browsers
  | "svg" // measured from svg elements in the DOM (getBBox() is stubbed)
  | "none"; // no fonts to measure with, so all text is zero-width

export interface RenderOptions {
  strategy?: Strategy;
  /** the width to lay the score out at (0 or less doesn't break lines) */
  width?: number;
  /** further widths to lay the same score out at, rendering only the last */
  relayoutWidths?: number[];
  useDropCap?: boolean;
  /** called once the ChantContext is set up, before the gabc is parsed */
  setupContext?: (ctxt: any, E: Exsurge) => void;
  /** called once the score is created, before it is laid out */
  setupScore?: (score: any, ctxt: any, E: Exsurge) => void;
  /** called after the layout, before rendering */
  afterLayout?: (score: any, ctxt: any, E: Exsurge) => void;
  /** gabc to update the mappings to (with Gabc.updateMappingsFromSource) after the first layout */
  edits?: string[];
  /** lays the score out with performLayoutAsync() rather than performLayout() */
  async?: boolean;
  /** renders each page of score.paginate(height) rather than the whole score */
  paginate?: number;
  /** zoom for createSvgTree() */
  zoom?: number | boolean;
}

export type OutputName = "svg" | "lines" | "tree" | "canvas" | "node" | "nodeLines";

// -----------------------------------------------------------------------------
// fonts

// a deterministic width, in thousandths of an em, for each character
function charAdvance(code: number, seed: number) {
  return 260 + ((code * 37 + seed * 101) % 420);
}

function textAdvance(text: string, seed: number, smallCaps = false) {
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0)!;
    let advance = charAdvance(code, seed);
    if (smallCaps && char !== char.toUpperCase()) advance *= 0.8;
    width += advance;
  }
  return width;
}

function ascent(text: string) {
  return /[A-ZÀ-ÞÆŒǼ℣℟bdfhklt]/.test(text) ? 730 : 520;
}

function descent(text: string) {
  return /[gjpqy,;]/.test(text) ? 240 : 15;
}

/** stands in for a fontkit font, with units of a thousandth of an em */
export function fakeFontkitFont(seed: number) {
  return {
    unitsPerEm: 1000,
    layout(text: string, features?: { [feature: string]: boolean }) {
      const firstCode = text.length ? text.codePointAt(0)! : 0;
      return {
        advanceWidth: textAdvance(text, seed, !!(features && features.smcp)),
        bbox: {
          minX: (firstCode % 9) * 7 - 14,
          maxY: ascent(text),
          height: ascent(text) + descent(text)
        }
      };
    }
  };
}

/** stands in for an opentype.js font */
export function fakeOpenTypeFont(seed: number) {
  return {
    unitsPerEm: 1000,
    getAdvanceWidth(text: string, fontSize: number, options?: any) {
      const smallCaps = !!(options && options.features && options.features.smcp);
      return (textAdvance(text, seed, smallCaps) * fontSize) / 1000;
    },
    getPath(text: string, x: number, y: number, fontSize: number, options?: any) {
      const width = this.getAdvanceWidth(text, fontSize, options);
      const firstCode = text.length ? text.codePointAt(0)! : 0;
      return {
        getBoundingBox() {
          return {
            x1: x + (((firstCode % 9) * 7 - 14) * fontSize) / 1000,
            y1: y - (ascent(text) * fontSize) / 1000,
            x2: x + width - (fontSize * (firstCode % 3)) / 100,
            y2: y + (descent(text) * fontSize) / 1000
          };
        }
      };
    }
  };
}

/** a font dictionary with a separate font for each style, under a font family of "Fake-{}" */
function fontDictionary(createFont: (seed: number) => object) {
  return {
    Regular: createFont(1),
    "Fake-Regular": createFont(1),
    "Fake-Bold": createFont(2),
    "Fake-Italic": createFont(3),
    "Fake-BoldItalic": createFont(4),
    greextra: createFont(5),
    "'Exsurge Characters'": createFont(6)
  };
}

// measures text in a CSS font the way a canvas does
function measureCanvasFont(font: string, text: string, withBoundingBox: boolean) {
  const size = parseFloat(/([\d.]+)px/.exec(font)![1]);
  const seed = /bold/.test(font) ? (/italic/.test(font) ? 4 : 2) : /italic/.test(font) ? 3 : 1;
  const width = (textAdvance(text, seed, /small-caps/.test(font)) * size) / 1000;
  const firstCode = text.length ? text.codePointAt(0)! : 0;
  const metrics: any = { width };
  if (withBoundingBox) {
    metrics.actualBoundingBoxLeft = (((firstCode % 9) * 7 - 14) * size) / -1000;
    metrics.actualBoundingBoxAscent = (ascent(text) * size) / 1000;
    metrics.actualBoundingBoxDescent = (descent(text) * size) / 1000;
  }
  return metrics;
}

// -----------------------------------------------------------------------------
// measuring svg text

interface StyleRule {
  selector: string;
  declarations: Map<string, string>;
}

// parses css declarations, "name: value; name: value"
function parseDeclarations(css: string) {
  const declarations = new Map<string, string>();
  for (const declaration of css.split(";")) {
    const colon = declaration.indexOf(":");
    if (colon > 0) declarations.set(declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim());
  }
  return declarations;
}

const parsedStyles = new Map<string, StyleRule[]>();

// the rules of the style elements in the document, which exsurge writes as selector{declarations}
function styleRules(document: Document) {
  return Array.from(document.querySelectorAll("style")).flatMap((style) => {
    const css = style.textContent || "";
    let rules = parsedStyles.get(css);
    if (!rules) {
      rules = Array.from(css.matchAll(/([^{}]+)\{([^{}]*)\}/g), ([, selector, declarations]) => ({
        selector: selector.trim(),
        declarations: parseDeclarations(declarations)
      }));
      parsedStyles.set(css, rules);
    }
    return rules;
  });
}

// the value that element gives property itself: its style attribute, else
// the last style rule that matches it, else its presentation attribute
function specifiedValue(element: Element, property: string, rules: StyleRule[]) {
  const inline = parseDeclarations(element.getAttribute("style") || "").get(property);
  if (inline) return inline;
  let value: string | undefined;
  for (const rule of rules) {
    if (rule.declarations.has(property) && element.matches(rule.selector)) value = rule.declarations.get(property);
  }
  return value ?? element.getAttribute(property) ?? undefined;
}

// the value of an inherited property for element
function inheritedValue(element: Element, property: string, rules: StyleRule[], initial: string) {
  for (let e: Element | null = element; e; e = e.parentElement) {
    const value = specifiedValue(e, property, rules);
    if (value !== undefined) return value;
  }
  return initial;
}

function computedFontSize(element: Element | null, rules: StyleRule[]): number {
  if (!element) return 16; // the browser's default
  const value = specifiedValue(element, "font-size", rules);
  if (value === undefined) return computedFontSize(element.parentElement, rules);
  if (/%$/.test(value)) return (parseFloat(value) * computedFontSize(element.parentElement, rules)) / 100;
  if (/em$/.test(value)) return parseFloat(value) * computedFontSize(element.parentElement, rules);
  return parseFloat(value);
}

/** a run of text in an svg text element, measured in the fake canvas fonts */
class SvgTextRun {
  size: number;
  seed: number;
  smallCaps: boolean;
  /** what textLength stretches the run's advance by */
  stretch = 1;
  constructor(
    public text: string,
    /** the element the run takes its font and position from */
    public element: Element,
    rules: StyleRule[]
  ) {
    this.size = computedFontSize(element, rules);
    const weight = inheritedValue(element, "font-weight", rules, "normal");
    const bold = weight === "bold" || weight === "bolder" || parseInt(weight) >= 600;
    const italic = /italic|oblique/.test(inheritedValue(element, "font-style", rules, "normal"));
    this.seed = bold ? (italic ? 4 : 2) : italic ? 3 : 1;
    this.smallCaps = inheritedValue(element, "font-variant", rules, "normal") === "small-caps";
    const textLength = element.getAttribute("textLength");
    if (textLength !== null && text) this.stretch = parseFloat(textLength) / this.advance(text, 1);
  }

  advance(text: string, stretch = this.stretch) {
    return ((textAdvance(text, this.seed, this.smallCaps) * this.size) / 1000) * stretch;
  }
}

// the runs of text in a text element: its text nodes and tspans
function svgTextRuns(text: Element) {
  const rules = styleRules(text.ownerDocument);
  return Array.from(text.childNodes).flatMap((node) => {
    if (node.nodeType === 3) return [new SvgTextRun(node.textContent || "", text, rules)];
    if ((node as Element).localName === "tspan") return [new SvgTextRun(node.textContent || "", node as Element, rules)];
    return [];
  });
}

// the box a browser gives each glyph, from the ascent to the descent of the font
const cellAscent = 0.73;
const cellDescent = 0.24;

// the bounding box of a text element, as a browser lays it out: each tspan
// with an x or y starts a new chunk of text, which text-anchor aligns
function measureSvgText(text: Element) {
  if (text.localName !== "text") throw new Error(`getBBox() isn't stubbed for <${text.localName}>`);
  const anchor = inheritedValue(text, "text-anchor", styleRules(text.ownerDocument), "start");
  const length = (value: string | null, size: number) =>
    value === null ? 0 : parseFloat(value) * (/em$/.test(value) ? size : 1);
  let x = length(text.getAttribute("x"), 0);
  let y = length(text.getAttribute("y"), 0);
  let left = Infinity,
    top = Infinity,
    right = -Infinity,
    bottom = -Infinity;
  let chunk: { x: number; width: number; top: number; bottom: number }[] = [];
  let chunkWidth = 0;
  const endChunk = () => {
    const shift = anchor === "middle" ? -chunkWidth / 2 : anchor === "end" ? -chunkWidth : 0;
    for (const run of chunk) {
      left = Math.min(left, run.x + shift);
      right = Math.max(right, run.x + shift + run.width);
      top = Math.min(top, run.top);
      bottom = Math.max(bottom, run.bottom);
    }
    chunk = [];
    chunkWidth = 0;
  };
  for (const run of svgTextRuns(text)) {
    const { element, size } = run;
    if (element !== text) {
      if (element.hasAttribute("x") || element.hasAttribute("y")) endChunk();
      if (element.hasAttribute("x")) x = length(element.getAttribute("x"), size);
      if (element.hasAttribute("y")) y = length(element.getAttribute("y"), size);
      x += length(element.getAttribute("dx"), size);
      y += length(element.getAttribute("dy"), size);
    }
    if (!run.text) continue;
    const width = run.advance(run.text);
    chunk.push({ x, width, top: y - cellAscent * size, bottom: y + cellDescent * size });
    chunkWidth += width;
    x += width;
  }
  endChunk();
  if (left === Infinity) return { x: 0, y: 0, width: 0, height: 0 };
  return { x: left, y: top, width: right - left, height: bottom - top };
}

// the advance of nchars characters of a text element, from charnum
function measureSvgSubString(text: Element, charnum: number, nchars: number) {
  const runs = svgTextRuns(text);
  const count = runs.reduce((sum, run) => sum + run.text.length, 0);
  if (charnum >= count) throw new DOMException(`charnum ${charnum} is past the end of the text`, "IndexSizeError");
  let start = 0,
    width = 0;
  for (const run of runs) {
    const from = Math.max(charnum, start),
      to = Math.min(charnum + nchars, start + run.text.length);
    if (to > from) width += run.advance(run.text.slice(from - start, to - start));
    start += run.text.length;
  }
  return width;
}

/**
 * Gives svg elements the getBBox() and getSubStringLength() that jsdom
 * doesn't have, for TextMeasuringStrategy.Svg, measuring text in the fake
 * canvas fonts at the font that its styles give it.  Returns a function that
 * takes them away again.
 */
export function stubSvgTextMeasurement() {
  const prototype = (globalThis as any).SVGElement.prototype;
  prototype.getBBox = function (this: Element) {
    return measureSvgText(this);
  };
  prototype.getSubStringLength = function (this: Element, charnum: number, nchars: number) {
    return measureSvgSubString(this, charnum, nchars);
  };
  return () => {
    delete prototype.getBBox;
    delete prototype.getSubStringLength;
  };
}

// -----------------------------------------------------------------------------
// recording canvas

function formatNumber(n: number) {
  return Object.is(n, -0) ? "-0" : String(n);
}

function formatValue(value: any): string {
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (value && typeof value === "object" && "pathData" in value) return `Path2D(${value.label})`;
  return String(value);
}

let pathLabels: Map<string, string> | null = null;

// names each glyph path by the glyph it belongs to, so that the canvas log
// doesn't repeat the path data
function labelForPath(E: Exsurge, data: string) {
  if (!pathLabels) {
    pathLabels = new Map();
    for (const [name, glyph] of Object.entries<any>(E.Glyphs)) {
      glyph.paths.forEach((path: any, i: number) => {
        if (path.data && !pathLabels!.has(path.data)) pathLabels!.set(path.data, `${name}[${i}]`);
      });
    }
  }
  return pathLabels.get(data) || `path ${JSON.stringify(data)}`;
}

/** a Path2D for the tests to use when there isn't one */
export class FakePath2D {
  pathData: string;
  label: string;
  constructor(data: string) {
    this.pathData = data;
    this.label = labelForPath(currentExsurge, data);
  }
}
let currentExsurge: Exsurge;

/**
 * A canvas context that measures text in the fake canvas fonts, and keeps a
 * log of what is drawn on it.  Each call that paints logs the state it paints
 * with, rather than logging each change of state, so the log doesn't depend
 * on when exsurge sets the font to measure text in it.
 */
export function createRecordingCanvas(withBoundingBox = true) {
  const log: string[] = [];
  let matrix = [1, 0, 0, 1, 0, 0];
  const canvasCtxt: any = {
    log,
    font: "10px sans-serif",
    fillStyle: "#000000",
    strokeStyle: "#000000",
    lineWidth: 1,
    textAlign: "start",
    measureText(text: string) {
      return measureCanvasFont(this.font, text, withBoundingBox);
    },
    translate(x: number, y: number) {
      const [a, b, c, d, e, f] = matrix;
      matrix = [a, b, c, d, e + a * x + c * y, f + b * x + d * y];
    },
    scale(sx: number, sy: number) {
      const [a, b, c, d, e, f] = matrix;
      matrix = [a * sx, b * sx, c * sy, d * sy, e, f];
    },
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
      matrix = [a, b, c, d, e, f];
      log.push(`setTransform(${[a, b, c, d, e, f].map(formatNumber).join(", ")})`);
    }
  };
  const state = (...names: string[]) =>
    ` [${names.map((name) => `${name}=${formatValue(canvasCtxt[name])}`).concat(`matrix=${matrix.map(formatNumber).join(",")}`).join(" ")}]`;
  const paint = (name: string, stateNames: string[]) =>
    function (...args: any[]) {
      log.push(`${name}(${args.map(formatValue).join(", ")})${state(...stateNames)}`);
    };
  const path = (name: string) =>
    function (...args: any[]) {
      log.push(`${name}(${args.map(formatValue).join(", ")})`);
    };
  Object.assign(canvasCtxt, {
    clearRect: paint("clearRect", []),
    fillRect: paint("fillRect", ["fillStyle"]),
    fill: paint("fill", ["fillStyle"]),
    stroke: paint("stroke", ["strokeStyle", "lineWidth"]),
    fillText: paint("fillText", ["font", "fillStyle", "textAlign"]),
    beginPath: path("beginPath"),
    closePath: path("closePath"),
    moveTo: path("moveTo"),
    lineTo: path("lineTo"),
    bezierCurveTo: path("bezierCurveTo")
  });
  return canvasCtxt;
}

/** stands in for a canvas element */
export function createFakeCanvasElement(canvasCtxt: any) {
  return {
    style: {} as { [key: string]: string },
    width: 0,
    height: 0,
    getContext: () => canvasCtxt
  };
}

// -----------------------------------------------------------------------------
// serializing the svg tree and DOM

function describeSource(source: any) {
  if (!source || typeof source !== "object") return formatValue(source);
  const name = source.constructor && source.constructor.name;
  const parts = [name];
  for (const key of ["sourceIndex", "elementIndex", "noteIndex"]) {
    if (typeof source[key] === "number") parts.push(`${key}=${formatNumber(source[key])}`);
  }
  return `<${parts.join(" ")}>`;
}

function serializePropValue(key: string, value: any): string {
  if (key === "source") return describeSource(value);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return `{${Object.keys(value)
      .map((k) => `${k}: ${serializePropValue(k, value[k])}`)
      .join(", ")}}`;
  }
  if (Array.isArray(value)) return `[${value.map((v) => serializePropValue("", v)).join(", ")}]`;
  return formatValue(value);
}

/**
 * Writes out an svg tree (from createSvgTree()) one element per line, keeping
 * whether each value is a number or a string.
 */
export function serializeTree(node: any, indent = ""): string {
  if (typeof node === "string") return indent + JSON.stringify(node);
  if (Array.isArray(node)) {
    return [indent + "[", ...node.map((child) => serializeTree(child, indent + "  ")), indent + "]"].join("\n");
  }
  if (!node || typeof node !== "object") return indent + formatValue(node);
  const props = node.props
    ? Object.keys(node.props).map((key) => ` ${key}=${serializePropValue(key, node.props[key])}`)
    : [];
  const otherKeys = Object.keys(node).filter((key) => !["name", "props", "children"].includes(key));
  const head = `${indent}<${node.name === undefined ? "" : node.name}${props.join("")}${
    otherKeys.length ? ` (keys: ${otherKeys.join(", ")})` : ""
  }${node.props === undefined ? " (no props)" : ""}>`;
  const children = node.children || [];
  return [head, ...children.map((child: any) => serializeTree(child, indent + "  "))].join("\n");
}

/** writes out svg DOM nodes, one element per line */
export function serializeNode(node: any, indent = ""): string {
  if (node.nodeType === 3) return indent + JSON.stringify(node.textContent);
  const attributes = Array.from(node.attributes as ArrayLike<any>).map(
    (attr) => ` ${attr.namespaceURI ? `{${attr.namespaceURI}}` : ""}${attr.name}=${JSON.stringify(attr.value)}`
  );
  const source = node.source ? ` source=${describeSource(node.source)}` : "";
  const ns = node.namespaceURI === "http://www.w3.org/2000/svg" ? "" : `{${node.namespaceURI}}`;
  return [
    `${indent}<${ns}${node.localName}${attributes.join("")}${source}>`,
    ...Array.from(node.childNodes as ArrayLike<any>).map((child) => serializeNode(child, indent + "  "))
  ].join("\n");
}

// -----------------------------------------------------------------------------
// rendering

/** sets up ctxt to measure text with strategy */
function useStrategy(E: Exsurge, ctxt: any, strategy: Strategy, canvasCtxt: any) {
  switch (strategy) {
    case "fontkit":
      ctxt.setFont("Fake-{}", 16, {}, fontDictionary(fakeFontkitFont));
      break;
    case "opentype":
      ctxt.setFont("Fake-{}", 16, {}, fontDictionary(fakeOpenTypeFont));
      break;
    case "canvas":
    case "canvas-basic":
      ctxt.setFont("'Fake', serif", 16);
      ctxt.textMeasuringStrategy = E.TextMeasuringStrategy.Canvas;
      ctxt.canvasCtxt = canvasCtxt;
      ctxt.canvas = createFakeCanvasElement(canvasCtxt);
      ctxt.updateHyphenWidth();
      break;
    case "svg":
    case "none":
      ctxt.setFont("'Fake', serif", 16);
      break;
  }
}

export interface RenderResult {
  outputs: Partial<Record<OutputName, string>>;
  ctxt: any;
  score: any;
}

/**
 * Lays out gabc with options, and renders it with each of the outputs.  In a
 * DOM environment, pass "node" and "nodeLines" to render svg nodes.
 */
export async function render(
  E: Exsurge,
  gabc: string,
  options: RenderOptions,
  outputNames: OutputName[]
): Promise<RenderResult> {
  currentExsurge = E;
  const g = globalThis as any;
  const strategy = options.strategy || "fontkit";
  const canvasCtxt = createRecordingCanvas(strategy !== "canvas-basic");
  const ctxt =
    strategy === "svg"
      ? new E.ChantContext(E.TextMeasuringStrategy.Svg)
      : new E.ChantContext(E.TextMeasuringStrategy.OpenTypeJS);
  useStrategy(E, ctxt, strategy, canvasCtxt);
  if (options.setupContext) options.setupContext(ctxt, E);

  let mappings = E.Gabc.createMappingsFromSource(ctxt, gabc);
  const score = new E.ChantScore(ctxt, mappings, !!options.useDropCap);
  if (options.setupScore) options.setupScore(score, ctxt, E);

  const width = options.width === undefined ? 600 : options.width;
  if (options.async) {
    await new Promise<void>((resolve) => score.performLayoutAsync(ctxt, () => resolve()));
    await new Promise<void>((resolve) => score.layoutChantLines(ctxt, width, () => resolve()));
  } else {
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, width);
  }
  for (const edit of options.edits || []) {
    E.Gabc.updateMappingsFromSource(ctxt, score.mappings, edit);
    score.updateNotations(ctxt);
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, width);
  }
  for (const relayoutWidth of options.relayoutWidths || []) {
    score.performLayout(ctxt);
    score.layoutChantLines(ctxt, relayoutWidth);
  }
  if (options.afterLayout) options.afterLayout(score, ctxt, E);

  const scores = options.paginate ? (score.paginate(options.paginate), score.pages) : [score];
  // svg strings have no newlines, so the pages of one are put together without any
  const each = (f: (s: any) => string, separator = "\n") =>
    scores.length === 1
      ? f(scores[0])
      : scores.map((s: any, i: number) => `<!-- page ${i} -->${separator}${f(s)}`).join(separator);

  const outputs: RenderResult["outputs"] = {};
  const hadPath2D = "Path2D" in g;
  if (!hadPath2D) g.Path2D = FakePath2D;
  try {
    for (const name of outputNames) {
      outputs[name] = renderOutput(E, name, ctxt, canvasCtxt, options, each);
    }
  } finally {
    if (!hadPath2D) delete g.Path2D;
    // so that the next case doesn't measure text with this one's styles
    if (ctxt.svgTextMeasurer) ctxt.svgTextMeasurer.remove();
  }
  return { outputs, ctxt, score };
}

function renderOutput(
  E: Exsurge,
  name: OutputName,
  ctxt: any,
  canvasCtxt: any,
  options: RenderOptions,
  each: (f: (s: any) => string, separator?: string) => string
) {
  switch (name) {
    case "svg":
      return each((s) => s.createSvg(ctxt), "");
    case "lines":
      return each((s) => s.createSvgForEachLine(ctxt), "");
    case "tree":
      return each((s) => serializeTree(s.createSvgTree(ctxt, options.zoom)));
    case "node":
      return each((s) => serializeNode(s.createSvgNode(ctxt)));
    case "nodeLines":
      return each((s) =>
        s
          .createSvgNodeForEachLine(ctxt)
          .map((node: any) => serializeNode(node))
          .join("\n")
      );
    case "canvas":
      return each((s) => {
        if (ctxt.canvasCtxt !== canvasCtxt) {
          ctxt.canvasCtxt = canvasCtxt;
          ctxt.canvas = createFakeCanvasElement(canvasCtxt);
        }
        canvasCtxt.log.length = 0;
        s.draw(ctxt);
        return canvasCtxt.log.join("\n");
      });
  }
}
