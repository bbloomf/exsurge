// Gregorio's NABC: the St. Gall and Laon neumes that Gregorio draws above and
// below the staff (see docs/gregorio-feature-gap.md, §13 and Phase 10).  Gabc
// keeps a notation's NABC strings on it (ChantNotationElement.nabc), and this
// reads them as GregorioTeX does (tex/gregoriotex-nabc.lua:120-303, with the
// references below to that file), into neumes, spaces and errors.  Like
// GregorioTeX, it doesn't throw on NABC that it can't read: Gregorio draws
// "ERR" there, and here an error takes its place.  Which glyphs draw a neume
// depends on the font, so that's left to whatever draws them.
//
// The glyphs of Gregorio's NABC fonts (gregall, gresgmodern and grelaon) are
// named after the NABC that they draw, so a neume's names here (base,
// prepunctis, subpunctis and its letters' names) are the names of glyphs.

/** a glyph descriptor: a base neume, with its modifiers, variant and pitch */
export interface NabcGlyphDescriptor {
  /** the two letters of the base neume (vi, pu, cl…) */
  neume: string;
  /** its modifiers, without repeats and in Gregorio's order (MSG-><~) */
  modifiers: string;
  /** its variant, a digit from 1 to 9, or "" */
  variant: string;
  /** its pitch, from h and a pitch: 0 (a) to 14 (p), or 5 (f) if it has none */
  height: number;
}

/** a significative letter (ls) or Tironian note (lt), and where it goes */
export interface NabcLetter {
  /** the name of its glyph: ls or lt and the shorthand (lsc, ltdo…) */
  name: string;
  /**
   * where it goes around the neume: 1 to 9, from the top left to the bottom
   * right (2 above, 4 to the left), with 5 inside the neume (in Laon)
   */
  position: number;
}

/** a complex neume descriptor: one or more glyph descriptors, with puncta and letters */
export interface NabcNeume {
  type: "neume";
  /** the glyph descriptors, which ! joins */
  glyphs: NabcGlyphDescriptor[];
  /**
   * the name of the glyph for the glyph descriptors: each one's neume,
   * modifiers and variant, joined with !, and after each but the first whose
   * pitch isn't the first one's, the difference plus 5 as a pitch (so
   * qlhh!vshj is ql!vsh)
   */
  base: string;
  /** the prepunctis, as written (pp2, ppt1pp1…), or "" */
  prepunctis: string;
  /** the subpunctis, as written (su1sut1sux1…), or "" */
  subpunctis: string;
  /** the significative letters and Tironian notes, in the order written */
  letters: NabcLetter[];
  /** where the neume starts in the NABC */
  index: number;
  length: number;
}

/** a space: / and // to the right, ` and `` to the left */
export interface NabcSpace {
  type: "space";
  /** "interelement" (/ and `, nabcinterelementspace) or "larger" (// and ``, nabclargerspace) */
  size: "interelement" | "larger";
  /** 1 to the right, -1 to the left */
  direction: 1 | -1;
  index: number;
  length: number;
}

/**
 * NABC that Gregorio can't read, where it draws "ERR".  A neume whose
 * glyphs are too far apart in pitch is one, and Gregorio goes on after it,
 * but after one it can't parse, it stops: the error goes to the end.
 */
export interface NabcError {
  type: "error";
  /** what's wrong */
  message: string;
  index: number;
  length: number;
}

export type NabcItem = NabcNeume | NabcSpace | NabcError;

/** a glyph of a NABC font: its advance width, height and depth, and its svg path data */
export type NabcGlyph = [width: number, height: number, depth: number, path: string];

/**
 * The glyphs of one of Gregorio's NABC fonts, by their NABC names, which
 * exsurge draws NABC with.  They're converted from Gregorio's fonts, which
 * are under the SIL Open Font License, so they aren't in exsurge's bundle:
 * import them from exsurge-ts/nabc-gregall, exsurge-ts/nabc-gresgmodern or
 * exsurge-ts/nabc-grelaon (or with a script tag, dist/nabc-gregall.min.js
 * and so on, which makes exsurgeNabcGregall.gregall and so on).
 * Paths go from the left of the baseline, with y going down, as in svg, and
 * all of it is in units of unitsPerEm to the em.
 */
export interface NabcFont {
  /** the font that the glyphs are from: gregall, gresgmodern or grelaon */
  name: string;
  unitsPerEm: number;
  glyphs: { readonly [name: string]: NabcGlyph };
}

// the base neumes that the parser accepts (gregallneumekinds), for both St.
// Gall and Laon (un and oc are Laon's), and pv, which no font draws
const neumes = new Set([
  "vi", "pu", "ta", "gr", "cl", "un", "pv", "pe", "po", "to", "ci", "sc", "pf", "sf", "tr", "st", "ds", "ts", "tg",
  "bv", "tv", "pr", "pi", "vs", "or", "sa", "pq", "qi", "ql", "pt", "oc", "ni"
]);
// the shorthands of the significative letters (gregalllskinds), for both St.
// Gall and Laon.  (GregorioNabcRef lists lspulcre too, which isn't here, so
// Gregorio can't read it.)
const letterShorthands = new Set([
  "c", "t", "s", "l", "x", "+", "a", "al", "am", "b", "cm", "co", "cw", "d", "e", "eq", "ew", "f", "fid", "fr", "g", "h",
  "hp", "hn", "i", "im", "iv", "k", "lb", "lc", "len", "lm", "lp", "lt", "m", "md", "moll", "n", "nl", "nt", "p", "par",
  "pfec", "pm", "q", "sb", "sc", "simil", "simul", "sj", "sjc", "sjcm", "sm", "st", "sta", "su", "tb", "th", "tm", "tw",
  "v", "ve", "vol", "eq-", "equ", "simp", "simpl", "sp"
]);
// the Tironian notes' shorthands (grelaonltkinds)
const tironianShorthands = new Set([
  "i", "do", "dr", "dx", "ps", "qm", "sb", "se", "sj", "sl", "sn", "sp", "sr", "st", "us"
]);
const modifierOrder = "MSG-><~";
const pitches = "abcdefghijklmnp";
const punctumShapes = "tuvwxyqnz";
// (the Lua finds these characters in strings with string.find(), which reads
// them as patterns, so it takes ".", "^" and "$" for modifiers or digits; this
// takes only the characters themselves)
const isDigit = (char: string) => char >= "1" && char <= "9";

/**
 * Reads a glyph descriptor at index i (gregallparse_base, :132-165).
 * Returns it and where it ends, or null if there isn't one there.
 */
function parseGlyphDescriptor(nabc: string, i: number) {
  let neume = nabc.slice(i, i + 2);
  if (i + 2 > nabc.length || !neumes.has(neume)) return null;
  i += 2;
  let found = "";
  while (i < nabc.length && modifierOrder.includes(nabc[i])) found += nabc[i++];
  let modifiers = [...modifierOrder].filter((modifier) => found.includes(modifier)).join("");
  let variant = "";
  if (i < nabc.length && isDigit(nabc[i])) variant = nabc[i++];
  let height = 5;
  // (an h at the very end is left for the next neume, which it can't start)
  if (i + 1 < nabc.length && nabc[i] === "h") {
    height = pitches.indexOf(nabc[i + 1]);
    if (height < 0) return null;
    i += 2;
  }
  return { glyph: { neume, modifiers, variant, height } as NabcGlyphDescriptor, end: i };
}

/**
 * Reads a complex neume descriptor at index i (gregallparse_neume,
 * :169-223): glyph descriptors joined with !, then puncta and letters in any
 * order.  Returns it and where it ends, or a message if it can't.
 */
function parseNeume(nabc: string, i: number) {
  let index = i;
  let glyphs: NabcGlyphDescriptor[] = [];
  let prepunctis = "";
  let subpunctis = "";
  let letters: NabcLetter[] = [];
  do {
    let parsed = parseGlyphDescriptor(nabc, glyphs.length ? i + 1 : i);
    if (!parsed) return { message: glyphs.length ? "no neume after !" : "not a neume" };
    glyphs.push(parsed.glyph);
    i = parsed.end;
  } while (i < nabc.length && nabc[i] === "!");
  while (i + 1 < nabc.length) {
    let prefix = nabc.slice(i, i + 2);
    if (prefix === "ls" || prefix === "lt") {
      let j = i + 2;
      while (j < nabc.length && !isDigit(nabc[j])) j++;
      if (j >= nabc.length || !(prefix === "ls" ? letterShorthands : tironianShorthands).has(nabc.slice(i + 2, j)))
        return { message: "not a significative letter or Tironian note" };
      letters.push({ name: nabc.slice(i, j), position: +nabc[j] });
      i = j + 1;
    } else if (prefix === "su" || prefix === "pp") {
      let j = i + 2;
      if (j < nabc.length && punctumShapes.includes(nabc[j])) j++;
      if (j >= nabc.length || !isDigit(nabc[j])) return { message: "no number of puncta" };
      if (prefix === "su") subpunctis += nabc.slice(i, j + 1);
      else prepunctis += nabc.slice(i, j + 1);
      i = j + 1;
    } else break;
  }
  return {
    neume: { type: "neume", glyphs, base: "", prepunctis, subpunctis, letters, index, length: i - index } as NabcNeume,
    end: i
  };
}

/**
 * The name of the glyph for a neume's glyph descriptors (:314-328), or null
 * if one is more than 5 below the first or 9 above it.
 */
function baseName(glyphs: NabcGlyphDescriptor[]) {
  let name = "";
  for (let glyph of glyphs) {
    if (name) name += "!";
    name += glyph.neume + glyph.modifiers + glyph.variant;
    let height = glyph.height - glyphs[0].height;
    if (glyph === glyphs[0] || height === 0) continue;
    height += 5;
    if (height < 0 || height > 14) return null;
    name += pitches[height];
  }
  return name;
}

/** Reads the spaces at index i (add_spacing, :286-303) into items, and returns where they end */
function parseSpaces(nabc: string, i: number, items: NabcItem[]) {
  while (i < nabc.length && (nabc[i] === "/" || nabc[i] === "`")) {
    let length = nabc[i + 1] === nabc[i] ? 2 : 1;
    items.push({
      type: "space",
      size: length === 2 ? "larger" : "interelement",
      direction: nabc[i] === "/" ? 1 : -1,
      index: i,
      length
    });
    i += length;
  }
  return i;
}

/**
 * Reads a NABC string as GregorioTeX does (gregallparse_neumes, :305-479):
 * neumes, with spaces before and between them, and an error in place of
 * whatever Gregorio would draw as "ERR".
 */
export function parseNabc(nabc: string): NabcItem[] {
  let items: NabcItem[] = [];
  let i = parseSpaces(nabc, 0, items);
  while (i < nabc.length) {
    let parsed = parseNeume(nabc, i);
    if (!parsed.neume) {
      items.push({ type: "error", message: parsed.message, index: i, length: nabc.length - i });
      break;
    }
    let { neume } = parsed;
    let base = baseName(neume.glyphs);
    if (base === null)
      items.push({ type: "error", message: "the neumes are too far apart", index: i, length: neume.length });
    else items.push({ ...neume, base });
    i = parseSpaces(nabc, parsed.end, items);
  }
  return items;
}

/**
 * Gregorio's other names for glyphs in gregall and gresgmodern, by the name
 * of the glyph that they draw (gregallaliases, :27-72).  Gregorio uses them
 * for a font that doesn't have a glyph of the alias's name, but not for
 * grelaon.
 */
export const nabcAliases: { readonly [alias: string]: string } = {
  "ci~": "cl>",
  "pe~": "ta>",
  "vs~": "ta>",
  "pf~": "po>",
  "sc~": "pe>2",
  "sa~": "pe>2",
  suu1: "ta-",
  ppu1: "ta-",
  pfG: "sfM",
  "cl~": "vi>",
  "pr~": "vs>",
  visu2: "ci",
  "vi-su2": "ci-",
  visu3: "ci1",
  visu1sux1: "ci>",
  clSsut1: "ciG",
  clSsu2: "ciG1",
  visu1suw1: "ciM",
  "vi-su1suw1": "ciM-",
  visu1sut1: "ciS",
  visut2: "ciS1",
  visu2lsc3: "cilsc3",
  vipp2: "sc",
  "vi-ppt2": "sc-",
  vipp3: "sc1",
  "vi>pp2": "sc>",
  peppt1: "scG",
  vippt2: "scS",
  "ta>ppt1": "sc~",
  clpp2: "sf",
  "cl-ppt2": "sf-",
  "cl>pp2": "sf>",
  toppt1: "sfG",
  clMpp2: "sfM1",
  clppt2: "sfS",
  clpp2lsc2: "sflsc2",
  ciSppt1: "vippt1su1sut1",
  cippt1: "vippt1su2",
  cippt1lsc3: "vippt1su2lsc3",
  cippu1: "vippu1su2",
  cippu1lsc3: "vippu1su2lsc3",
  clppt1: "toG",
  "pf!cl~": "cl!po>",
  "pf!cl~ppt1": "cl!po>ppt1"
};

const glyphNameCharacters: { [char: string]: string } = { B: ">", N: "-", E: "!", T: "~" };

/**
 * The NABC name of a glyph in one of Gregorio's NABC fonts, whose glyph
 * names have B, N, E and T for >, -, ! and ~ (:89).
 */
export const nabcNameOfGlyph = (glyphName: string) =>
  glyphName.replace(/[BNET]/g, (char) => glyphNameCharacters[char]);

const nabcNameCharacters: { [char: string]: string } = { ">": "B", "-": "N", "!": "E", "~": "T" };

/** The name of a glyph in one of Gregorio's NABC fonts for its NABC name (see nabcNameOfGlyph()). */
export const glyphNameOfNabc = (nabcName: string) =>
  nabcName.replace(/[>\-!~]/g, (char) => nabcNameCharacters[char]);

const has = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);

/**
 * The name of a font's glyph for a NABC name: the glyph of that name, or
 * else the glyph that Gregorio's alias of it names (but for grelaon, which
 * Gregorio doesn't give the aliases), or undefined if the font has neither.
 */
export function nabcGlyphName(font: NabcFont, name: string) {
  // (an alias can name another: ta>ppt1 is sc~, which is pe>2.  GregorioTeX
  // follows these or not depending on the order of a Lua table.)
  for (let i = 0; i < 4; i++) {
    if (has(font.glyphs, name)) return name;
    if (font.name === "grelaon" || !has(nabcAliases, name)) break;
    name = nabcAliases[name];
  }
  return undefined;
}

/** a glyph that layoutNabc() places: the name of the font's glyph, and where it goes */
export interface NabcPlacedGlyph {
  name: string;
  /** from the start of the NABC */
  x: number;
  /** up from its baseline */
  y: number;
}

/** NABC laid out with a font's glyphs (see layoutNabc()), all in the font's units */
export interface NabcLayout {
  glyphs: NabcPlacedGlyph[];
  /** where each error is, which Gregorio draws as ERR (see NabcLayoutOptions.errorWidth) */
  errors: number[];
  /** how far it goes: where what came after it would start */
  width: number;
  /** where its leftmost glyph starts, if that's before the start (which 'neume' alignment can make it), or 0 */
  left: number;
  /** how far its glyphs go above and below its baseline, by their heights and depths */
  height: number;
  depth: number;
  /** the most that h and a pitch raises a neume, and the most that it lowers one, or 0 */
  raised: number;
  lowered: number;
}

export interface NabcLayoutOptions {
  /** the room that / and ` (nabcinterelementspace) and // and `` (nabclargerspace) make, in the font's units */
  interElementSpace: number;
  largerSpace: number;
  /**
   * full, Gregorio's default, to start each neume with its letters, or
   * neume, to start it with the neume, the letters on its left hanging back
   * (\gresetnabcalignment)
   */
  alignment?: "full" | "neume";
  /**
   * the room that an error takes, where ERR is drawn: none by default, as in
   * Gregorio, which draws ERR in the NABC font, which has no E or R
   */
  errorWidth?: number;
}

// what GregorioTeX makes of NABC: kerns, glyphs and boxes (raised, and as
// wide as what's in them), and errors
type NabcOp = { kern: number } | { glyph: string; raise: number } | { box: NabcOp[]; raise: number } | { error: true };

/**
 * Lays NABC out with a font's glyphs, as GregorioTeX does
 * (gregallparse_neumes, :305-479): for each neume, it draws the glyph with
 * as much of the neume and its puncta and letters in it as the font has,
 * with the prepunctis and subpunctis that aren't in it before and after it,
 * and the letters that aren't on a 3×3 grid around it, raised by its pitch.
 * A neume that the font can't draw is an error, as Gregorio's ERR is.
 */
export function layoutNabc(items: NabcItem[], font: NabcFont, options: NabcLayoutOptions): NabcLayout {
  let layout: NabcLayout = { glyphs: [], errors: [], width: 0, left: 0, height: 0, depth: 0, raised: 0, lowered: 0 };
  let ops: NabcOp[] = [];
  for (let item of items) {
    if (item.type === "space")
      ops.push({ kern: item.direction * (item.size === "larger" ? options.largerSpace : options.interElementSpace) });
    else if (item.type === "error") ops.push({ error: true });
    else ops.push(...neumeOps(item, font, options.alignment || "full", layout));
  }
  // (each box is as wide as what's in it)
  const place = (ops: NabcOp[], x: number, raise: number) => {
    for (let op of ops) {
      if ("kern" in op) x += op.kern;
      else if ("error" in op) {
        layout.errors.push(x);
        x += options.errorWidth || 0;
      }
      else if ("box" in op) x = place(op.box, x, raise + op.raise);
      else {
        let [width, height, depth] = font.glyphs[op.glyph];
        let y = raise + op.raise;
        layout.glyphs.push({ name: op.glyph, x, y });
        layout.left = Math.min(layout.left, x);
        layout.height = Math.max(layout.height, y + height);
        layout.depth = Math.max(layout.depth, depth - y);
        x += width;
      }
    }
    return x;
  };
  layout.width = place(ops, 0, 0);
  return layout;
}

/** what GregorioTeX makes of a neume (:329-473), or an error */
function neumeOps(neume: NabcNeume, font: NabcFont, alignment: "full" | "neume", layout: NabcLayout): NabcOp[] {
  const glyph = (name: string) => font.glyphs[nabcGlyphName(font, name)!];
  const found = (name: string) => (nabcGlyphName(font, name) ? name : null);
  const error: NabcOp[] = [{ error: true }];
  // the font must have each letter (:331), and those inside the neume (5)
  // must be in the neume's glyph
  if (neume.letters.some((letter) => !nabcGlyphName(font, letter.name))) return error;
  let inside = neume.letters
    .filter((letter) => letter.position === 5)
    .map((letter) => letter.name + letter.position)
    .join("");
  // the others, by name and position ("" for those inside, as in the Lua)
  let letters = neume.letters.map((letter) => (letter.position === 5 ? "" : letter.name + letter.position));
  let { base } = neume;
  let pp = neume.prepunctis;
  let su = neume.subpunctis;

  // the glyph of the neume with parts (0 to 2) of its prepunctis and
  // subpunctis and some letters (l.try, :340-348), taking the puncta that
  // it has in it off pp and su
  const tryGlyph = (parts: number, ls: string) => {
    let name: string | null;
    if (parts === 2 && pp && su && (name = found(base + pp + su + inside + ls))) {
      pp = su = "";
      return name;
    }
    // (subpunctis before prepunctis)
    if (parts === 1 && su && (name = found(base + su + inside + ls))) {
      su = "";
      return name;
    }
    if (parts === 1 && pp && (name = found(base + pp + inside + ls))) {
      pp = "";
      return name;
    }
    // (and subpunctis before letters)
    if (parts === 0 && su && ls && found(base + su + inside)) return null;
    if (parts === 0) return found(base + inside + ls);
    return null;
  };
  // the glyph with as many of the parts as there's a glyph for, taking a
  // glyph with letters only if it has all of them (:349-407)
  const ppsuParts = (pp ? 1 : 0) + (su ? 1 : 0);
  const count = letters.length;
  const position = (letter: string) => letter.slice(-1);
  let name: string | null = null;
  for (let parts = ppsuParts + Math.min(count, 3); parts >= 0; parts--) {
    if (count === 3 && parts >= 3 && parts <= 3 + ppsuParts) {
      let [a, b, c] = letters;
      name = tryGlyph(parts - 3, a + b + c);
      // (in another order, if they're at different positions)
      if (!name && a && b && c && position(a) !== position(b) && position(a) !== position(c) && position(b) !== position(c))
        for (let order of [[b, a, c], [a, c, b], [b, c, a], [c, a, b], [c, b, a]])
          if (!name) name = tryGlyph(parts - 3, order.join(""));
      if (name) {
        letters = ["", "", ""];
        break;
      }
    }
    if (count === 2 && parts >= 2 && parts <= 2 + ppsuParts) {
      let [a, b] = letters;
      name = tryGlyph(parts - 2, a + b);
      if (!name && a && b && position(a) !== position(b)) name = tryGlyph(parts - 2, b + a);
      if (name) {
        letters = ["", ""];
        break;
      }
    }
    if (count === 1 && parts >= 1 && parts <= 1 + ppsuParts) {
      name = tryGlyph(parts - 1, letters[0]);
      if (name) {
        letters = [""];
        break;
      }
    }
    name = tryGlyph(parts, "");
    if (name) break;
  }
  if (!name || (pp && !found(pp)) || (su && !found(su))) return error;

  // the glyph, with the prepunctis before it and the subpunctis after it
  // that aren't in it (:410-430), and the box of all of them, which the
  // letters go around
  let [width, height, depth] = glyph(name);
  let ops: NabcOp[] = [{ glyph: nabcGlyphName(font, name)!, raise: 0 }];
  for (let puncta of [pp, su]) {
    if (!puncta) continue;
    let metrics = glyph(puncta);
    let op = { glyph: nabcGlyphName(font, puncta)!, raise: 0 };
    if (puncta === pp) ops.unshift(op);
    else ops.push(op);
    width += metrics[0];
    height = Math.max(height, metrics[1]);
    // (GregorioTeX takes the larger of this and the height here, :423 and
    // :429, which can only be a mistake: it puts the letters below the
    // neume a glyph's height below it)
    depth = Math.max(depth, metrics[2]);
  }
  let box = { width, height, depth };
  // raised by its pitch, a quarter of the clivis's height for each step from f (:431-438)
  let raise = 0;
  if (neume.glyphs[0].height !== 5) {
    raise = ((neume.glyphs[0].height - 5) * (glyph("cl") || [0, 0])[1]) / 4;
    ops = [{ box: ops, raise }];
    layout.raised = Math.max(layout.raised, raise);
    layout.lowered = Math.max(layout.lowered, -raise);
  }

  // the letters on a 3×3 grid around the box (add_ls, :225-284, and
  // :439-461): those at each position side by side in the order written,
  // in columns at the left (1, 4 and 7, by its index 10 in widths) and the
  // right (3, 6 and 9, by 12), and centered above and below (2 and 8, by 11)
  let widths = Array<number>(13).fill(0);
  let placed = Array<number>(13).fill(0);
  for (let letter of letters) if (letter) widths[+position(letter)] += glyph(letter.slice(0, -1))[0];
  widths[10] = Math.max(widths[1], widths[4], widths[7]);
  widths[11] = Math.max(widths[2], widths[8]);
  widths[12] = Math.max(widths[3], widths[6], widths[9]);
  let before: NabcOp[] = [];
  let after: NabcOp[] = [];
  for (let letter of letters) {
    if (!letter) continue;
    let at = +position(letter);
    let [letterWidth, letterHeight, letterDepth] = glyph(letter.slice(0, -1));
    let op = { glyph: nabcGlyphName(font, letter.slice(0, -1))!, raise };
    if (at === 2 || at === 8) {
      op.raise += at === 2 ? box.height + letterDepth : -box.depth - letterHeight;
      let kern = -Math.max(box.width, widths[11]) / 2 - widths[at] / 2 + placed[at];
      placed[at] += letterWidth;
      let kernAfter = -kern - letterWidth;
      // (the first moves the neume to the middle of letters wider than it)
      if (placed[11] === 0 && box.width < widths[11]) {
        placed[11] = 1;
        ops.unshift({ kern: (widths[11] - box.width) / 2 });
        kern += (widths[11] - box.width) / 2;
      }
      ops.push({ kern }, op, { kern: kernAfter });
      continue;
    }
    // (at the top, the middle or the bottom)
    op.raise +=
      at <= 3
        ? box.height - (letterHeight - letterDepth) / 2
        : at <= 6
        ? (box.height - box.depth) / 2 - (letterHeight + letterDepth) / 2
        : -box.depth - (letterHeight + letterDepth) / 2;
    if (at % 3 === 0) {
      let kern = placed[at] - widths[12];
      placed[at] += letterWidth;
      let kernAfter = widths[12] - placed[at];
      if (placed[12] === 0) {
        placed[12] = 1;
        kern = 0;
      }
      after.push({ kern }, op, { kern: kernAfter });
    } else {
      let kern = placed[at] - widths[at];
      placed[at] += letterWidth;
      let kernAfter = widths[at] - placed[at];
      if (placed[10] === 0) {
        placed[10] = 1;
        kern = widths[10] - widths[at];
      }
      before.push({ kern }, op, { kern: kernAfter });
    }
  }
  ops = [...before, ...ops, ...after];
  // with 'neume' alignment, the letters on the left hang back (:462-472)
  if (alignment === "neume" && widths[10] > 0) ops.unshift({ kern: -widths[10] });
  return ops;
}
