import { ChantLayoutElement, Subtitle, Supertitle, TextLeftRight, Title, type ChantContext, type SvgElementWithSource, type SvgTreeNode } from "./Exsurge.Drawing.js";
import type { ChantScore } from "./Exsurge.Chant.js";
/** the text of the titles of a score */
export interface TitlesText {
    supertitle?: string;
    title?: string;
    subtitle?: string;
    textLeft?: string;
    textRight?: string;
}
export declare class Titles extends ChantLayoutElement {
    score: ChantScore;
    supertitle: Supertitle | null;
    title: Title | null;
    subtitle: Subtitle | null;
    textLeft: TextLeftRight | null;
    textRight: TextLeftRight | null;
    svg?: SvgElementWithSource;
    constructor(ctxt: ChantContext, score: ChantScore, { supertitle, title, subtitle, textLeft, textRight }?: TitlesText);
    setBoundsX(ctxt: ChantContext, elementName: "supertitle" | "title" | "subtitle", width: number): void;
    /**
     * Lays out the titles, and returns their total height
     * @param  {ChantContext} ctxt
     * @return {number}      the tottal height of titles laid out
     */
    layoutTitles(ctxt: ChantContext, width: number): number;
    setSupertitle(ctxt: ChantContext, supertitle?: string): void;
    setTitle(ctxt: ChantContext, title?: string): void;
    setSubtitle(ctxt: ChantContext, subtitle?: string): void;
    setTextLeft(ctxt: ChantContext, textLeft?: string): void;
    setTextRight(ctxt: ChantContext, textRight?: string): void;
    hasSupertitle(ctxt?: ChantContext, supertitle?: string): boolean;
    hasTitle(ctxt?: ChantContext, title?: string): boolean;
    hasSubtitle(ctxt?: ChantContext, subtitle?: string): boolean;
    hasTextLeft(ctxt?: ChantContext, textLeft?: string): boolean;
    hasTextRight(ctxt?: ChantContext, textRight?: string): boolean;
    /** the titles and the texts at the left and right, in the order that they're drawn in */
    elements(): (Supertitle | Title | Subtitle | TextLeftRight | null)[];
    draw(ctxt: ChantContext, scale?: number): void;
    getInnerNodes(ctxt: ChantContext, functionName?: "createSvgNode" | "createSvgTree"): (SvgElementWithSource | SvgTreeNode)[];
    createSvgNode(ctxt: ChantContext): SvgElementWithSource;
    createSvgTree(ctxt: ChantContext): SvgTreeNode;
    createSvgFragment(ctxt: ChantContext): string;
}
//# sourceMappingURL=Exsurge.Titles.d.ts.map