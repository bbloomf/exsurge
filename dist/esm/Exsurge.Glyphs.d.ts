export interface GlyphPath {
    /** a negative path is filled with ChantContext.negativeFillColor, e.g. the hole of a punctum cavum */
    type: "positive" | "negative";
    /** svg path data */
    data: string;
    /** the path, parsed for drawing on a canvas (set the first time it's drawn) */
    path2d?: Path2D;
}
export interface Glyph {
    paths: GlyphPath[];
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    origin: {
        x: number;
        y: number;
    };
    align?: "left" | "right";
}
export declare const Glyphs: {
    [name: string]: Glyph;
};
/**
 * The width of a porrectus's swash for a fall of interval staff positions,
 * in glyph units: between the widths for the whole numbers either side of it,
 * and below 1 and above 5, narrower or wider by as much again for each staff
 * position as from 1 to 2 and from 4 to 5.
 */
export declare function porrectusSwashWidth(interval: number): number;
/**
 * A porrectus's swash (see above), falling drop glyph units (100 to a staff
 * position) over width; hollow, if it is, with the hole that a punctum cavum
 * has, its outline inset by 18.  Its origin is in the middle of its first note.
 */
export declare function porrectusSwash(drop: number, width: number, hollow?: boolean): Glyph;
//# sourceMappingURL=Exsurge.Glyphs.d.ts.map