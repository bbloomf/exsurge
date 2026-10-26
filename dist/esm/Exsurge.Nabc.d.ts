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
    glyphs: {
        readonly [name: string]: NabcGlyph;
    };
}
/**
 * Reads a NABC string as GregorioTeX does (gregallparse_neumes, :305-479):
 * neumes, with spaces before and between them, and an error in place of
 * whatever Gregorio would draw as "ERR".
 */
export declare function parseNabc(nabc: string): NabcItem[];
/**
 * Gregorio's other names for glyphs in gregall and gresgmodern, by the name
 * of the glyph that they draw (gregallaliases, :27-72).  Gregorio uses them
 * for a font that doesn't have a glyph of the alias's name, but not for
 * grelaon.
 */
export declare const nabcAliases: {
    readonly [alias: string]: string;
};
/**
 * The NABC name of a glyph in one of Gregorio's NABC fonts, whose glyph
 * names have B, N, E and T for >, -, ! and ~ (:89).
 */
export declare const nabcNameOfGlyph: (glyphName: string) => string;
/**
 * The name of a font's glyph for a NABC name: the glyph of that name, or
 * else the glyph that Gregorio's alias of it names (but for grelaon, which
 * Gregorio doesn't give the aliases), or undefined if the font has neither.
 */
export declare function nabcGlyphName(font: NabcFont, name: string): string | undefined;
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
/**
 * Lays NABC out with a font's glyphs, as GregorioTeX does
 * (gregallparse_neumes, :305-479): for each neume, it draws the glyph with
 * as much of the neume and its puncta and letters in it as the font has,
 * with the prepunctis and subpunctis that aren't in it before and after it,
 * and the letters that aren't on a 3×3 grid around it, raised by its pitch.
 * A neume that the font can't draw is an error, as Gregorio's ERR is.
 */
export declare function layoutNabc(items: NabcItem[], font: NabcFont, options: NabcLayoutOptions): NabcLayout;
//# sourceMappingURL=Exsurge.Nabc.d.ts.map