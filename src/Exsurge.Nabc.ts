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
 * import them from exsurge-ts/nabc-gregall (or with a script tag,
 * dist/nabc-gregall.min.js, which makes exsurgeNabcGregall.gregall).
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
