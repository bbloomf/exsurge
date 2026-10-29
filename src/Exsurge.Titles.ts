//
// Author(s):
// Benjamin Bloomfield <benjamin@sourceandsummit.com>
//
// Copyright (c) 2019
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

import { Rect } from "./Exsurge.Core.js";
import {
  ChantLayoutElement, QuickSvg, Subtitle, Supertitle, TextLeftRight, Title,
  type ChantContext,
  type SvgElementWithSource,
  type SvgTreeNode
} from "./Exsurge.Drawing.js";
import type { ChantScore } from "./Exsurge.Chant.js";

/** the text of the titles of a score */
export interface TitlesText {
  supertitle?: string;
  title?: string;
  subtitle?: string;
  textLeft?: string;
  textRight?: string;
}

export class Titles extends ChantLayoutElement {
  score: ChantScore;
  // each is null when the score doesn't have it:
  supertitle!: Supertitle | null;
  title!: Title | null;
  subtitle!: Subtitle | null;
  textLeft!: TextLeftRight | null;
  textRight!: TextLeftRight | null;
  svg?: SvgElementWithSource;

  constructor(
    ctxt: ChantContext,
    score: ChantScore,
    { supertitle, title, subtitle, textLeft, textRight }: TitlesText = {}
  ) {
    super();
    this.score = score;
    this.setSupertitle(ctxt, supertitle);
    this.setTitle(ctxt, title);
    this.setSubtitle(ctxt, subtitle);
    this.setTextLeft(ctxt, textLeft);
    this.setTextRight(ctxt, textRight);
  }

  setBoundsX(
    ctxt: ChantContext,
    elementName: "supertitle" | "title" | "subtitle",
    width: number
  ) {
    let element = this[elementName]!;
    switch (ctxt.textStyles[elementName].alignment) {
      case "left":
        element.textAnchor = "start";
        element.bounds.x = 0;
        break;
      case "right":
        element.textAnchor = "end";
        element.bounds.x = width;
        break;
      case "center":
      default:
        element.textAnchor = "middle";
        element.bounds.x = width / 2;
    }
  }

  /**
   * Lays out the titles, and returns their total height
   * @param  {ChantContext} ctxt
   * @return {number}      the tottal height of titles laid out
   */
  layoutTitles(ctxt: ChantContext, width: number) {
    this.bounds = new Rect(0, 0, 0, 0);
    let y = 0;
    for (let key of ["supertitle", "title", "subtitle"] as const) {
      let element = this[key];
      if (!element) continue;
      // (with its padding above it too, after the title above it)
      if (y) y += element.padding(ctxt);
      element.recalculateMetrics(ctxt);
      element.setMaxWidth(ctxt, width);
      this.setBoundsX(ctxt, key, width);
      element.bounds.y = y;
      this.bounds.union(element.bounds);
      element.bounds.y += element.origin.y;
      y += element.bounds.height + element.padding(ctxt);
    }
    let finalY = y,
      textLeft = this.score.overrideTextLeft || this.textLeft;
    if (textLeft) {
      textLeft.recalculateMetrics(ctxt);
      textLeft.bounds.y = y;
      this.bounds.union(textLeft.bounds);
      textLeft.bounds.y += textLeft.origin.y;
      finalY = y + textLeft.bounds.height + textLeft.padding(ctxt);
    }
    if (this.textRight) {
      this.textRight.recalculateMetrics(ctxt);
      this.textRight.bounds.x = width;
      this.textRight.bounds.y = y;
      this.bounds.union(this.textRight.bounds);
      this.textRight.bounds.y += this.textRight.origin.y;
      finalY = Math.max(
        finalY,
        y + this.textRight.bounds.height + this.textRight.padding(ctxt)
      );
    }
    return finalY;
  }

  setSupertitle(ctxt: ChantContext, supertitle?: string) {
    this.supertitle = supertitle ? new Supertitle(ctxt, supertitle) : null;
  }
  setTitle(ctxt: ChantContext, title?: string) {
    this.title = title ? new Title(ctxt, title) : null;
  }
  setSubtitle(ctxt: ChantContext, subtitle?: string) {
    this.subtitle = subtitle ? new Subtitle(ctxt, subtitle) : null;
  }
  setTextLeft(ctxt: ChantContext, textLeft?: string) {
    this.textLeft = textLeft
      ? new TextLeftRight(ctxt, textLeft, "textLeft")
      : null;
  }
  setTextRight(ctxt: ChantContext, textRight?: string) {
    this.textRight = textRight
      ? new TextLeftRight(ctxt, textRight, "textRight")
      : null;
  }

  hasSupertitle(ctxt?: ChantContext, supertitle?: string) {
    return !!this.supertitle;
  }
  hasTitle(ctxt?: ChantContext, title?: string) {
    return !!this.title;
  }
  hasSubtitle(ctxt?: ChantContext, subtitle?: string) {
    return !!this.subtitle;
  }
  hasTextLeft(ctxt?: ChantContext, textLeft?: string) {
    return !!this.textLeft;
  }
  hasTextRight(ctxt?: ChantContext, textRight?: string) {
    return !!this.textRight;
  }

  /** the titles and the texts at the left and right, in the order that they're drawn in */
  elements() {
    return [this.supertitle, this.title, this.subtitle, this.score.overrideTextLeft || this.textLeft, this.textRight];
  }

  draw(ctxt: ChantContext, scale = 1) {
    var canvasCtxt = ctxt.canvasCtxt!;
    canvasCtxt.translate(this.bounds.x, this.bounds.y);

    for (let el of this.elements()) {
      if (el) el.draw(ctxt);
    }

    canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
  }

  getInnerNodes(
    ctxt: ChantContext,
    functionName: "createSvgNode" | "createSvgTree" = "createSvgNode"
  ) {
    var nodes: Array<SvgElementWithSource | SvgTreeNode> = [];

    for (let el of this.elements()) {
      if (el) nodes.push(el[functionName](ctxt));
    }
    return nodes;
  }

  createSvgNode(ctxt: ChantContext) {
    var nodes = this.getInnerNodes(ctxt, "createSvgNode");

    var node = QuickSvg.createNode("g", { class: "Titles" }, nodes as SvgElementWithSource[]);

    node.source = this;
    this.svg = node;

    return node;
  }

  createSvgTree(ctxt: ChantContext) {
    var nodes = this.getInnerNodes(ctxt, "createSvgTree");

    return QuickSvg.createSvgTree(
      "g",
      { class: "Titles", source: this },
      ...(nodes as SvgTreeNode[])
    );
  }

  createSvgFragment(ctxt: ChantContext) {
    var fragment = "";

    for (let el of this.elements()) {
      if (el) fragment += el.createSvgFragment(ctxt);
    }

    fragment = QuickSvg.createFragment("g", { class: "Titles" }, fragment);
    return fragment;
  }
}
