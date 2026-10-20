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
//# sourceMappingURL=Exsurge.Glyphs.d.ts.map