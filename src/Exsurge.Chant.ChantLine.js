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

import * as Exsurge from "./Exsurge.Core.js";
import { Step, Pitch, Rect, Point, Margins } from "./Exsurge.Core.js";
import * as Neumes from "./Exsurge.Chant.Neumes.js";
import {
  QuickSvg,
  ChantLayoutElement,
  GlyphCode,
  GlyphVisualizer,
  RoundBraceVisualizer,
  CurlyBraceVisualizer,
  MarkingPositionHint,
  Lyric,
  LyricArray,
  LyricType,
  DropCap
} from "./Exsurge.Drawing.js";
import { ChantLineBreak, TextOnly, NoteShape } from "./Exsurge.Chant.js";
import { Glyphs } from "./Exsurge.Glyphs.js";
import {
  Custos,
  DoubleBar,
  FullBar,
  InsertionCursor
} from "./Exsurge.Chant.Signs.js";
import {
  HorizontalEpisemaAlignment,
  HorizontalEpisema,
  BraceShape,
  BracePoint,
  BraceAttachment
} from "./Exsurge.Chant.Markings.js";

// a chant line represents one staff line on the page. ChantLines are created by the score
// and laid out by the page
export class ChantLine extends ChantLayoutElement {
  constructor(score) {
    super();

    this.score = score;

    this.notationsStartIndex = 0;
    this.numNotationsOnLine = 0;
    this.notationBounds = null; // Rect

    this.staffLeft = 0;
    this.staffRight = 0;

    this.startingClef = null; // necessary for the layout process
    this.custos = null;

    this.justify = true;

    // these are markings that exist at the chant line level rather than at the neume level.
    this.ledgerLines = [];
    this.braces = [];

    this.nextLine = null;
    this.previousLine = null; // for layout assistance

    this.lyricLineHeight = 0; // height of each text line
    this.lyricLineBaseline = 0; // offsets from the top of the text line to the baseline
    this.numLyricLines = 0; // maximum count of lyrics on the same syllable

    // fixme: make these configurable values from the score
    this.spaceAfterNotations = 0; // the space between the notation bounds and the first text track
    this.spaceBetweenTextTracks = 0; // spacing between each text track

    this.lastLyrics = [];
  }

  performLayout(ctxt) {
    // start off with a rectangle that holds at least the four staff lines
    this.notationBounds = new Rect(
      this.staffLeft,
      -(ctxt.staffLineWeight / 2 + 3 + ctxt.minSpaceAboveStaff) *
        ctxt.staffInterval,
      this.staffRight - this.staffLeft,
      (ctxt.staffLineWeight + 6 + ctxt.minSpaceAboveStaff) * ctxt.staffInterval
    );

    // run through all the elements of the line and calculate the bounds of the notations,
    // as well as the bounds of each text track we will use
    var i;
    var notations = this.score.notations;
    var lastNeumeIndex =
      this.extraTextOnlyIndex === null
        ? this.notationsStartIndex + this.numNotationsOnLine
        : this.extraTextOnlyIndex;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
    var notation = null;

    this.notationBounds.union(this.startingClef.bounds);

    // reset the lyric line offsets before we [re]calculate them now
    this.lyricLineHeight = ctxt.textStyles.lyric.size * 1.1;
    this.lyricLineBaseline = 0;
    this.numLyricLines = 0;

    this.altLineHeight = 0;
    this.altLineBaseline = 0;
    this.numAltLines = 0;

    this.translationLineHeight = ctxt.textStyles.translation.size * 1.1;
    this.translationLineBaseline = 0;
    this.numTranslationLines = 0;

    for (i = this.notationsStartIndex; i < lastNeumeIndex; i++) {
      notation = notations[i];

      this.notationBounds.union(notation.bounds);

      // keep track of lyric line offsets
      if (notation.lyrics.length && notation.lyrics[0].text) {
        // if (notation.lyrics[0].bounds.height > this.lyricLineHeight)
        //   this.lyricLineHeight = notation.lyrics[0].bounds.height;
        if (notation.lyrics[0].origin.y > this.lyricLineBaseline)
          this.lyricLineBaseline = notation.lyrics[0].origin.y;
        if (notation.lyrics.length > this.numLyricLines)
          this.numLyricLines = notation.lyrics.length;
      }

      if (notation.alText && this.numAltLines < notation.alText.length) {
        if (notation.alText[0].bounds.height > this.altLineHeight)
          this.altLineHeight = notation.alText[0].bounds.height;
        if (notation.alText[0].origin.y > this.altLineBaseline)
          this.altLineBaseline = notation.alText[0].origin.y;
        if (notation.alText.length > this.numAltLines)
          this.numAltLines = notation.alText.length;
      }

      if (
        notation.translationText &&
        notation.translationText[0] &&
        notation.translationText[0].text
      ) {
        // if (
        //   notation.translationText[0].bounds.height > this.translationLineHeight
        // )
        //   this.translationLineHeight =
        //     notation.translationText[0].bounds.height;
        if (notation.translationText[0].origin.y > this.translationLineBaseline)
          this.translationLineBaseline = notation.translationText[0].origin.y;
        if (notation.translationText.length > this.numTranslationLines)
          this.numTranslationLines = notation.translationText.length;
      }
    }

    if (this.custos) this.notationBounds.union(this.custos.bounds);

    // add any braces to the notationBounds as well
    for (i = 0; i < this.braces.length; i++)
      this.notationBounds.union(this.braces[i].bounds);

    // finalize the lyrics placement
    var notationBoundsOffset =
      this.notationBounds.bottom() +
      ctxt.minSpaceBelowStaff * ctxt.staffInterval;
    this.lyricLineBaseline += notationBoundsOffset;
    this.translationLineBaseline += notationBoundsOffset;
    this.altLineBaseline +=
      this.notationBounds.y - this.altLineHeight - ctxt.staffInterval * 0.5;

    for (i = this.notationsStartIndex; i < lastNeumeIndex; i++) {
      notation = notations[i];
      var offset = 0;
      for (var j = 0; j < notation.lyrics.length; j++) {
        notation.lyrics[j].bounds.y = offset + this.lyricLineBaseline;
        offset += this.lyricLineHeight;
      }

      if (notation.translationText) {
        for (j = 0; j < notation.translationText.length; j++) {
          notation.translationText[j].bounds.y =
            offset + this.translationLineBaseline;
          offset += this.translationLineHeight;
        }
      }

      if (notation.alText) {
        offset = 0;
        for (j = 0; j < notation.alText.length; j++) {
          notation.alText[j].bounds.y = offset + this.altLineBaseline;
          offset -= ctxt.textStyles.al.size * 1.1;
        }
      }
    }

    this.extraTextOnlyHeight = 0;
    // handle placement of extra TextOnly elements:
    if (ctxt.useExtraTextOnly) {
      var extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex;
      if (this.extraTextOnlyIndex === null) {
        // even if extraTextOnlyIndex is null, there might be extra lines on the last lyric if it is TextOnly:
        let lastNotation = notations[lastNeumeIndex - 1] || {};
        if (lastNotation.constructor === ChantLineBreak)
          lastNotation = notations[lastNeumeIndex - 2];
        if (
          lastNotation.constructor === TextOnly &&
          lastNotation.lyrics.length === 1 &&
          lastNotation.lyrics[0].bounds.height > this.lyricLineHeight
        ) {
          this.extraTextOnlyHeight = this.lyricLineHeight;
        }
      } else {
        let lastLyrics = null;
        let xOffset = 0;
        offset = (this.numLyricLines - 1) * this.lyricLineHeight;
        offset += this.numTranslationLines * this.translationLineHeight;
        let extraLines = 0;
        for (i = this.extraTextOnlyIndex; i < lastIndex; i++) {
          notation = notations[i];
          if (!notation.lyrics[extraTextOnlyLyricIndex]) continue;
          lastLyrics = notation.lyrics[extraTextOnlyLyricIndex];
          if (lastLyrics.lineWidth) {
            xOffset = this.staffRight - lastLyrics.lineWidth;
            offset += this.lyricLineHeight;
            extraLines++;
          }
          extraLines += lastLyrics.numLines - 1;
          lastLyrics.bounds.y = offset + this.lyricLineBaseline;
          notation.bounds.x += xOffset;
        }
        this.extraTextOnlyHeight = this.lyricLineHeight * extraLines;
      }
    }

    if (this.startingClef.hasLyrics()) {
      offset = 0;
      for (j = 0; j < this.startingClef.lyrics.length; j++) {
        this.startingClef.lyrics[j].bounds.y = offset + this.lyricLineBaseline;
        offset += this.lyricLineHeight;
      }
    }

    // dropCap and the annotations
    if (this.notationsStartIndex === 0) {
      if (this.score.annotation !== null) {
        // annotations use dominant-baseline to align text to the top
        this.score.annotation.bounds.x = this.staffLeft / 2;
        this.score.annotation.bounds.y = -ctxt.staffInterval * 3;
        if (this.score.dropCap !== null) {
          var lowestPossibleAnnotationY =
            this.lyricLineBaseline -
            this.score.annotation.bounds.height -
            ctxt.staffInterval * ctxt.textStyles.annotation.padding -
            this.score.dropCap.origin.y;
          // if the annotation would overlap with the drop cap, move the annotation higher.
          // otherwise, center the annotation in the vertical space between the top of the drop cap and the top of the staff.
          if (lowestPossibleAnnotationY < this.score.annotation.bounds.y) {
            this.score.annotation.bounds.y = lowestPossibleAnnotationY;
          } else {
            this.score.annotation.bounds.y =
              (this.score.annotation.bounds.y + lowestPossibleAnnotationY) / 2;
          }
          if (this.score.annotation.bounds.y < this.notationBounds.y) {
            this.notationBounds.y = this.score.annotation.bounds.y;
            this.notationBounds.height +=
              this.notationBounds.y - this.score.annotation.bounds.y;
          }
        }
        this.score.annotation.bounds.y += this.score.annotation.origin.y;
      }

      if (this.score.dropCap !== null) {
        // drop caps and annotations are drawn from their center, so aligning them
        // horizontally is as easy as this.staffLeft / 2
        this.score.dropCap.bounds.x = this.staffLeft / 2;
        this.score.dropCap.bounds.y =
          this.lyricLineBaseline - this.score.dropCap.origin.y;
        this.notationBounds.union(this.score.dropCap.bounds);
        this.score.dropCap.bounds.y = this.lyricLineBaseline;
      }
    }

    if (this.numLyricLines > 0) {
      // add up the lyric line heights to get the total height of the chant line
      var lyricAndTextRect = new Rect(
        0,
        notationBoundsOffset,
        0,
        this.lyricLineHeight * this.numLyricLines +
          this.extraTextOnlyHeight +
          this.translationLineHeight * this.numTranslationLines
      );
      this.notationBounds.union(lyricAndTextRect);
    }
    if (this.numAltLines > 0) {
      var altLineTextRect = new Rect(
        0,
        this.notationBounds.y -
          this.altLineHeight -
          0.5 * ctxt.staffInterval -
          ctxt.textStyles.al.size * 1.1 * (this.numAltLines - 1),
        0,
        ctxt.textStyles.al.size * 1.1 * this.numAltLines
      );
      this.notationBounds.union(altLineTextRect);
    }
    // Ensure that there is at least minSpaceBelowStaff below the lowest staff line:
    this.notationBounds.union(
      new Rect(
        0,
        0,
        0,
        (3 + ctxt.staffLineWeight / 2 + ctxt.minSpaceBelowStaff) *
          ctxt.staffInterval
      )
    );
    var totalHeight = this.notationBounds.height;

    this.bounds.x = 0;
    this.bounds.y = this.notationBounds.y;
    this.bounds.width = this.notationBounds.right();
    this.bounds.height = totalHeight;

    // the origin of the chant line's coordinate space is at the center line of the left extremity of the staff
    this.origin = new Point(this.staffLeft, -this.notationBounds.y);
  }

  // TODO: remove if not necsessary
  layoutInsertionCursor(ctxt) {
    if (this.insertionCursor) {
      // we have either a Notation to draw the cursor after, or the ChantLine itself when the cursor is the first thing on the line
      this.insertionCursor.performLayout(ctxt);
      this.insertionCursor.bounds.x =
        this.score.insertionElement.bounds.right() +
        ((this.score.insertionElement.trailingSpace &&
          this.score.insertionElement.calculatedTrailingSpace) ||
          0) /
          2 -
        this.insertionCursor.origin.x;
    }
    return this.insertionCursor;
  }

  draw(ctxt) {
    var canvasCtxt = ctxt.canvasCtxt;

    canvasCtxt.translate(this.bounds.x, this.bounds.y);

    // draw the staff lines
    var i,
      x1 = this.staffLeft,
      x2 = this.staffRight,
      y;
    canvasCtxt.lineWidth = ctxt.staffLineWeight;
    canvasCtxt.strokeStyle = ctxt.staffLineColor;

    for (i = -3; i <= 3; i += 2) {
      y = ctxt.staffInterval * i;

      canvasCtxt.beginPath();
      canvasCtxt.moveTo(x1, y);
      canvasCtxt.lineTo(x2, y);
      canvasCtxt.stroke();
    }

    if (this.layoutInsertionCursor(ctxt)) {
      this.insertionCursor.draw(ctxt);
    }

    // draw the ledger lines
    for (i = 0; i < this.ledgerLines.length; i++) {
      var ledgerLine = this.ledgerLines[i];
      y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);

      canvasCtxt.beginPath();
      canvasCtxt.moveTo(ledgerLine.x1, y);
      canvasCtxt.lineTo(ledgerLine.x2, y);
      canvasCtxt.stroke();
    }

    // fixme: draw the braces

    // draw the dropCap and the annotations
    if (this.notationsStartIndex === 0) {
      if (this.score.dropCap !== null) this.score.dropCap.draw(ctxt);

      if (
        this.score.annotation !== null &&
        (!this.score.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
        this.score.annotation.draw(ctxt);
    }

    // draw the notations
    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    for (i = this.notationsStartIndex; i < lastIndex; i++)
      notations[i].draw(ctxt);

    this.startingClef.draw(ctxt);

    if (this.custos) this.custos.draw(ctxt);

    canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
  }

  getInnerNodes(
    ctxt,
    top = 0,
    functionNames = { quickSvg: "createNode", elements: "createSvgNode" }
  ) {
    var inner = [];

    // add the chant lines
    var i,
      x1 = this.staffLeft,
      x2 = this.staffRight;

    if (ctxt.editable) {
      inner.push(
        QuickSvg[functionNames.quickSvg]("rect", {
          key: "insertion",
          x: x1,
          y: ctxt.staffInterval * -3,
          width: x2 - x1,
          height: ctxt.staffInterval * 6,
          fill: "none"
        })
      );
    }

    // create the staff lines
    for (i = -3; i <= 3; i += 2) {
      inner.push(
        QuickSvg[functionNames.quickSvg]("line", {
          key: i,
          x1: x1,
          y1: ctxt.staffInterval * i,
          x2: x2,
          y2: ctxt.staffInterval * i,
          stroke: ctxt.staffLineColor,
          "stroke-width": ctxt.staffLineWeight,
          class: "staffLine"
        })
      );
    }

    inner = [
      QuickSvg[functionNames.quickSvg]("g", { class: "staffLines" }, inner)
    ];

    if (this.layoutInsertionCursor(ctxt)) {
      inner.push(this.insertionCursor[functionNames.elements](ctxt));
    }

    // create the ledger lines
    for (i = 0; i < this.ledgerLines.length; i++) {
      var ledgerLine = this.ledgerLines[i];
      var y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);

      inner.push(
        QuickSvg[functionNames.quickSvg]("line", {
          x1: ledgerLine.x1,
          y1: y,
          x2: ledgerLine.x2,
          y2: y,
          stroke: ctxt.staffLineColor,
          "stroke-width": ctxt.staffLineWeight,
          class: "ledgerLine"
        })
      );
    }

    // add any braces
    for (i = 0; i < this.braces.length; i++)
      inner.push(this.braces[i][functionNames.elements](ctxt));

    // dropCap and the annotations
    if (this.notationsStartIndex === 0) {
      if (this.score.dropCap !== null)
        inner.push(this.score.dropCap[functionNames.elements](ctxt));

      if (
        this.score.annotation !== null &&
        (!this.score.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
        inner = inner.concat(
          this.score.annotation[functionNames.elements](ctxt)
        );
    }

    inner.push(this.startingClef[functionNames.elements](ctxt));

    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // add all of the notations
    for (i = this.notationsStartIndex; i < lastIndex; i++)
      inner.push(notations[i][functionNames.elements](ctxt));

    if (this.custos) inner.push(this.custos[functionNames.elements](ctxt));
    return inner;
  }

  createSvgNode(ctxt, top = 0) {
    let inner = this.getInnerNodes(ctxt, top, {
      quickSvg: "createNode",
      elements: "createSvgNode"
    });

    return QuickSvg.createNode(
      "g",
      {
        class: "chantLine",
        transform:
          "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
        "element-index": this.elementIndex,
        source: this
      },
      inner
    );
  }

  createSvgTree(ctxt, top = 0) {
    let inner = this.getInnerNodes(ctxt, top, {
      quickSvg: "createSvgTree",
      elements: "createSvgTree"
    });

    return QuickSvg.createSvgTree(
      "g",
      {
        class: "chantLine",
        transform:
          "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
        "element-index": this.elementIndex
      },
      ...inner
    );
  }

  createSvgFragment(ctxt, top = 0) {
    var inner = "";

    // add the chant lines
    var i,
      x1 = this.staffLeft,
      x2 = this.staffRight;

    // create the staff lines
    for (i = -3; i <= 3; i += 2) {
      inner += QuickSvg.createFragment("line", {
        x1: x1,
        y1: ctxt.staffInterval * i,
        x2: x2,
        y2: ctxt.staffInterval * i,
        stroke: ctxt.staffLineColor,
        "stroke-width": ctxt.staffLineWeight,
        class: "staffLine"
      });
    }

    inner = QuickSvg.createFragment("g", { class: "staffLines" }, inner);

    if (this.layoutInsertionCursor(ctxt)) {
      inner += this.insertionCursor.createSvgFragment(ctxt);
    }

    // create the ledger lines
    for (i = 0; i < this.ledgerLines.length; i++) {
      var ledgerLine = this.ledgerLines[i];
      var y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);

      inner += QuickSvg.createFragment("line", {
        x1: ledgerLine.x1,
        y1: y,
        x2: ledgerLine.x2,
        y2: y,
        stroke: ctxt.staffLineColor,
        "stroke-width": ctxt.staffLineWeight,
        class: "ledgerLine"
      });
    }

    // add any braces
    for (i = 0; i < this.braces.length; i++)
      inner += this.braces[i].createSvgFragment(ctxt);

    // dropCap and the annotations
    if (this.notationsStartIndex === 0) {
      if (this.score.dropCap !== null)
        inner += this.score.dropCap.createSvgFragment(ctxt);

      if (
        this.score.annotation !== null &&
        (!this.score.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
        inner += this.score.annotation.createSvgFragment(ctxt);
    }

    inner += this.startingClef.createSvgFragment(ctxt);

    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // add all of the notations
    for (i = this.notationsStartIndex; i < lastIndex; i++)
      inner += notations[i].createSvgFragment(ctxt);

    if (this.custos) inner += this.custos.createSvgFragment(ctxt);

    return QuickSvg.createFragment(
      "g",
      {
        class: "chantLine",
        transform:
          "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
        "element-index": this.elementIndex
      },
      inner
    );
  }

  // code below based on code by: https://gist.github.com/alexhornbake
  //
  // optimized for braces that are only drawn horizontally.
  // returns svg path string ready to insert into svg doc
  generateCurlyBraceDrawable(ctxt, x1, x2, y, isAbove) {
    var h;

    if (isAbove) h = -ctxt.staffInterval / 2;
    else h = ctxt.staffInterval / 2;

    // and q factor, .5 is normal, higher q = more expressive bracket
    var q = 0.6;

    var len = x2 - x1;

    //Calculate Control Points of path,
    var qx1 = x1;
    var qy1 = y + q * h;
    var qx2 = x1 + 0.25 * len;
    var qy2 = y + (1 - q) * h;
    var tx1 = x1 + 0.5 * len;
    var ty1 = y + h;
    var qx3 = x2;
    var qy3 = y + q * h;
    var qx4 = x1 + 0.75 * len;
    var qy4 = y + (1 - q) * h;
    var d =
      "M " +
      x1 +
      " " +
      y +
      " Q " +
      qx1 +
      " " +
      qy1 +
      " " +
      qx2 +
      " " +
      qy2 +
      " T " +
      tx1 +
      " " +
      ty1 +
      " M " +
      x2 +
      " " +
      y +
      " Q " +
      qx3 +
      " " +
      qy3 +
      " " +
      qx4 +
      " " +
      qy4 +
      " T " +
      tx1 +
      " " +
      ty1;

    return QuickSvg.createFragment("path", {
      d: d,
      stroke: ctxt.neumeLineColor,
      "stroke-width": ctxt.neumeLineWeight + "px",
      fill: "none"
    });
  }

  buildFromChantNotationIndex(ctxt, newElementStart, width) {
    // todo: reset / clear the children we have in case they have data
    var notations = this.score.notations,
      beginningLyrics = null,
      prev = null,
      prevNeume = null,
      prevLyrics = [];
    var condensableSpaces = [];
    this.notationsStartIndex = newElementStart;
    this.numNotationsOnLine = 0;

    this.staffLeft = 0;
    this.paddingLeft = 0;

    this.extraTextOnlyIndex = null;
    this.extraTextOnlyLyricIndex = 0;

    if (width > 0) this.staffRight = width;
    else this.staffRight = Infinity; // no limit to staff size

    // If this is the first chant line, then we have to make room for a
    // drop cap and/or annotation, if present
    if (this.notationsStartIndex === 0) {
      var padding = 0;

      if (this.score.dropCap !== null)
        padding =
          this.score.dropCap.bounds.width + this.score.dropCap.padding * 2;

      if (
        this.score.annotation !== null &&
        (!this.score.mergeAnnotationWithTextLeft || this.score.dropCap)
      )
        padding = Math.max(
          padding,
          this.score.annotation.bounds.width + this.score.annotation.padding * 2
        );

      this.staffLeft += padding;
      if (this.score.dropCap !== null)
        this.paddingLeft = (padding - this.score.dropCap.bounds.width) / 2;
    } else {
      prev = notations[newElementStart - 1];
      if (
        prev.constructor === DoubleBar &&
        prev.hasLyrics() &&
        (prev.lyrics.length > 1 || !prev.lyrics[0].text.match(/^(i\.?)+j\.?/))
      ) {
        beginningLyrics = prev.lyrics.map(function(lyric) {
          var newLyric = new Lyric(
            ctxt,
            lyric.originalText,
            lyric.lyricType,
            lyric.notation,
            lyric.notations,
            lyric.sourceIndex
          );
          newLyric.elidesToNext = lyric.elidesToNext;
          // Hide the original lyric by setting its bounds.y to an extremely high number.
          // If the chant is re-laid out, this value will be recalculated so that it won't stay hidden.
          lyric.bounds.y = Number.MAX_SAFE_INTEGER;
          return newLyric;
        });
        var minX = beginningLyrics
          .map(function(l) {
            return l.bounds.x;
          })
          .reduce(function(a, b) {
            return a < b ? a : b;
          });
        beginningLyrics.forEach(function(l) {
          l.bounds.x -= minX;
        });
      }
    }

    // set up the clef...
    // if the first notation on the line is a starting clef, then we treat it a little differently...
    // the clef becomes this line's starting clef and we skip over the clef in the notations array
    if (notations.length && notations[newElementStart].isClef) {
      ctxt.activeClef = notations[newElementStart];
      newElementStart++;
      this.notationsStartIndex++;
    }

    // make a copy for this line to use at the beginning
    this.startingClef = ctxt.activeClef.clone();
    this.startingClef.performLayout(ctxt);
    this.startingClef.bounds.x = this.staffLeft;

    var curr = this.startingClef;

    if (beginningLyrics) {
      LyricArray.setNotation(beginningLyrics, curr);
    }

    // estimate how much space we have available to us
    var rightNotationBoundary =
      this.staffRight - Glyphs.CustosLong.bounds.width * ctxt.glyphScaling; // possible custos on the line
    var lastTranslationTextWithEndNeume = null;

    // iterate through the notations, fittng what we can on this line
    var i,
      j,
      lastNotationIndex = notations.length - 1;

    if (curr.hasLyrics()) LyricArray.mergeIn(this.lastLyrics, curr.lyrics);

    // if we already have a start brace on the context, we must be continuing it from the previous system.
    if (ctxt.lastStartBrace && !ctxt.lastStartBrace.note) {
      ctxt.lastStartBrace.note = this.startingClef;
    }
    var lastLyricsBeforeTextOnly;
    var textOnlyStartIndex;

    for (i = newElementStart; i <= lastNotationIndex; i++) {
      prev = curr;
      if (curr.constructor !== TextOnly) prevNeume = curr;

      curr = notations[i];

      var actualRightBoundary;
      if (
        i === lastNotationIndex ||
        curr.constructor === Custos ||
        (prev.constructor === Custos && curr.isDivider) ||
        (curr.constructor === ChantLineBreak &&
          prevNeume.constructor === Custos)
      ) {
        // on the last notation of the score, we don't need a custos or trailing space, so we use staffRight as the
        // right boundary.
        // Also, if the current notation is a divider and the previous was a custos, we don't need extra space
        // because if the following notation won't fit, we can switch the order and use the custos as the end-of-the-line custos
        // Ditto in the case of the current element being a chant line break and the previous neume a custos, because that custos will become our end-of-line custos
        actualRightBoundary = this.staffRight;
      } else if (i === lastNotationIndex - 1) {
        // on the penultimate notation, make sure there is at least enough room for whichever takes up less space,
        // between the final notation and a custos:
        actualRightBoundary = Math.max(
          rightNotationBoundary,
          this.staffRight - notations[lastNotationIndex].bounds.width
        );
      } else {
        // Otherwise, we use rightNotationBoundary, which leaves room for a custos...
        actualRightBoundary = rightNotationBoundary;
      }

      // First check if we're already beyond the rightNotationBoundary (due to condensing that hasn't yet happened) and have a good element to end with
      // but if we have 2 or fewer elements, or if the current element is a line break or a custos, we'll go ahead and try for them anyway.
      var forceBreak =
        !curr.isDivider &&
        curr.constructor !== ChantLineBreak &&
        curr.constructor !== Custos &&
        !(
          curr.constructor === TextOnly &&
          curr.hasLyrics() &&
          /^(?:[*†]|i+j\.?)$/.test(curr.lyrics[0].text)
        ) &&
        lastNotationIndex - i > 1 &&
        !prevNeume.keepWithNext &&
        prevNeume.bounds.right() >= rightNotationBoundary;

      // also force a break if we've run into extra TextOnly elements, but the current notation is not a TextOnly and has lyrics
      forceBreak =
        forceBreak ||
        (this.extraTextOnlyIndex !== null &&
          curr.constructor !== TextOnly &&
          curr.constructor !== ChantLineBreak &&
          curr.constructor !== Custos &&
          curr.hasLyrics());

      if (curr instanceof TextOnly && prev === prevNeume) {
        lastLyricsBeforeTextOnly = this.lastLyrics.slice();
        textOnlyStartIndex = i;
      }
      if (
        curr instanceof TextOnly &&
        notations[textOnlyStartIndex] &&
        !notations[textOnlyStartIndex].hasLyrics()
      ) {
        // we want textOnlyStartIndex to be the first TextOnly that actually has lyrics,
        // so if the current "textOnlyStart" element does not have lyrics, and we have another textOnly
        // that does have lyrics, we will use it instead
        textOnlyStartIndex = i;
      }

      if (curr.hasLyrics() && curr.lyrics[0].needsLayout) {
        curr.lyrics[0].recalculateMetrics(ctxt);
      }

      // try to fit the curr element on this line.
      // if it doesn't fit, we finish up here.
      var fitsOnLine =
        !forceBreak &&
        this.positionNotationElement(
          ctxt,
          this.lastLyrics,
          prevNeume,
          curr,
          actualRightBoundary,
          this.extraTextOnlyIndex ? [] : condensableSpaces // no spaces are condensable once we are on extra text only lyrics
        );
      var candidateForExtraTextOnlyLine =
        ctxt.useExtraTextOnly &&
        curr.constructor === TextOnly &&
        LyricArray.hasOnlyOneLyric(curr.lyrics) &&
        (fitsOnLine === false || this.extraTextOnlyIndex !== null);
      var extraTextOnlyLyricIndex;
      if (candidateForExtraTextOnlyLine && this.extraTextOnlyIndex === null) {
        // check to make sure there is enough text to put on the text only line:
        extraTextOnlyLyricIndex = LyricArray.indexOfLyric(curr.lyrics);
        if (textOnlyStartIndex === i) {
          var currentLyric = notations[i].lyrics[extraTextOnlyLyricIndex].text;
          if (currentLyric.length <= 1) {
            var nextNotation = notations[i + 1];
            candidateForExtraTextOnlyLine =
              nextNotation &&
              nextNotation.constructor === TextOnly &&
              nextNotation.lyrics[extraTextOnlyLyricIndex] &&
              nextNotation.lyrics[extraTextOnlyLyricIndex].text.length > 0;
          }
        }
      }
      if (candidateForExtraTextOnlyLine) {
        // a special case for TextOnly elements that don't fit on the line: since they don't have neumes associated with them, we can place this
        // and any additional TextOnly elements just below the current lyric lines, but we can only do this if the TextOnly elements have only one
        // line of lyrics associated with them.
        var firstOnLine;
        extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex;
        if (
          this.extraTextOnlyIndex === null &&
          notations[textOnlyStartIndex].lyrics.length
        ) {
          if (
            textOnlyStartIndex === this.notationsStartIndex ||
            !ctxt.startExtraTextOnlyFromFirst
          ) {
            textOnlyStartIndex = i;
            let lastNotationWithLyrics = notations
              .slice(this.notationsStartIndex, i)
              .reverse()
              .find(notation => notation.hasLyrics());
            lastLyricsBeforeTextOnly =
              (lastNotationWithLyrics &&
                lastNotationWithLyrics.lyrics.slice()) ||
              [];
          }
          // go back to the first in this string of consecutive TextOnly elements.
          this.extraTextOnlyIndex = textOnlyStartIndex;
          extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex = LyricArray.indexOfLyric(
            curr.lyrics
          );
          this.lastLyricsBeforeTextOnly = lastLyricsBeforeTextOnly;
          this.lastLyrics = [];
          i = textOnlyStartIndex - 1;
          this.numNotationsOnLine =
            textOnlyStartIndex - this.notationsStartIndex;
          continue;
        }
        delete curr.lyrics[extraTextOnlyLyricIndex].lineWidth;
        if (!fitsOnLine || i === this.extraTextOnlyIndex) {
          curr.bounds.x = curr.lyrics[extraTextOnlyLyricIndex].origin.x;
          let lastLyricRight = ctxt.startExtraTextOnlyFromFirst
            ? LyricArray.getRight(this.lastLyrics) +
              (ctxt.minLyricWordSpacing || 0)
            : 0;
          curr.lyrics[extraTextOnlyLyricIndex].setMaxWidth(
            ctxt,
            this.staffRight,
            this.staffRight - lastLyricRight
          );
          firstOnLine = curr;
        }
        if (firstOnLine)
          firstOnLine.lyrics[extraTextOnlyLyricIndex].lineWidth = curr.lyrics[
            extraTextOnlyLyricIndex
          ].getRight();
      } else if (fitsOnLine === false) {
        const isTextOnlyBeforeDivider = (i) => {
          const curr = notations[i];
          if (curr.constructor !== TextOnly) return false;
          const firstDivider = notations.slice(i + 1).findIndex(notation => notation.isDivider);
          if (firstDivider < 0) return false;
          return notations.slice(i + 1, i + 1 + firstDivider).every(notation => notation.constructor === TextOnly);
        }
        // first check for elements that cannot begin a system: dividers and custodes
        while (
          this.numNotationsOnLine > 1 &&
          (curr.isDivider || curr.constructor === Custos || isTextOnlyBeforeDivider(i))
        ) {
          curr = notations[--i];
          this.numNotationsOnLine--;
        }

        if (lastTranslationTextWithEndNeume) {
          // console.info(notations[i - 1], lastTranslationTextWithEndNeume);
          // TODO?: need to go back to before the last translation text start:
        }

        // check if the prev elements want to be kept with this one
        for (j = i - 1; j > this.notationsStartIndex; j--) {
          var cne = notations[j];
          curr = notations[j + 1];

          // curr is the first notation on the next line
          // cne is the last notation on this line

          if (cne.firstWithNoWidth) {
            this.numNotationsOnLine--;
            continue;
          }

          // don't let a line break occur in the middle of a translation
          if (lastTranslationTextWithEndNeume) {
            this.numNotationsOnLine--;
            if (cne === lastTranslationTextWithEndNeume) {
              lastTranslationTextWithEndNeume = null;
            }
            continue;
          }

          // force any notations starting with a quilisma or inclinatum (diamond) to be kept with the previous notation:
          if (
            curr &&
            curr.notes &&
            (curr.notes[0].shape === NoteShape.Quilisma ||
              curr.notes[0].shape === NoteShape.Inclinatum)
          ) {
            this.numNotationsOnLine--;
            continue;
          }

          // if the line break is allowed (cne.allowLineBreakBeforeNext), keep this number of notations around so we can check during justification
          // whether there would be too much space introduced between
          if (cne.keepWithNext === true) {
            if (cne.allowLineBreakBeforeNext && !this.maxNumNotationsOnLine)
              this.maxNumNotationsOnLine = this.numNotationsOnLine;
            this.numNotationsOnLine--;
          } else break;
        }

        // if for some reason not a single notation can fit on the line, we'd better put it on anyway, to avoid an infinite loop:
        if (this.numNotationsOnLine === 0) this.numNotationsOnLine = 1;

        // determine the neumes we can space apart, if we do end up justifying
        curr = this.findNeumesToJustify(prevLyrics);

        this.lastLyrics = prevLyrics;
        if (this.maxNumNotationsOnLine) {
          // Check whether we should squeeze some extra notations on the line to avoid too much space after justification:
          // Check how much space we would have without the extra notations
          var extraSpace = this.getWhitespaceOnRight(ctxt);
          if (
            extraSpace / this.toJustify.length >
            ctxt.staffInterval * ctxt.maxExtraSpaceInStaffIntervals
          ) {
            LyricArray.mergeInArray(
              prevLyrics,
              notations.slice(
                this.notationsStartIndex + this.numNotationsOnLine,
                this.notationsStartIndex + this.maxNumNotationsOnLine
              )
            );
            this.numNotationsOnLine = this.maxNumNotationsOnLine;
            delete this.maxNumNotationsOnLine;
          }
        }

        // if the next line begins with a fresh word, than there can be extra space between the last notation on this line and the custos:
        let next = this.score.notations[
          this.extraTextOnlyIndex === null
            ? this.notationsStartIndex + this.numNotationsOnLine
            : this.extraTextOnlyIndex
        ];
        if (
          next &&
          next.hasLyrics() &&
          (next.lyrics[0].lyricType === LyricType.BeginningSyllable ||
            next.lyrics[0].lyricType === LyricType.SingleSyllable)
        ) {
          this.toJustify.push(this.custos);
        }

        if (
          j >= 1 &&
          notations[j].isDivider &&
          notations[j - 1].constructor === Custos
        ) {
          // reverse the order: put the divider first, and end the line with the custos.
          prevLyrics = [];
          for (i = j - 2; i >= this.notationsStartIndex; i--) {
            if (notations[i].hasLyrics()) {
              LyricArray.mergeIn(prevLyrics, notations[i].lyrics);
              break;
            }
          }
          // remove the custos and divider from the condensable spaces list, before adding the divider back, when repositioning it.
          condensableSpaces.sum -= condensableSpaces.pop().condensable;
          condensableSpaces.sum -= condensableSpaces.pop().condensable;
          this.positionNotationElement(
            ctxt,
            prevLyrics,
            notations[j - 2],
            notations[j],
            this.staffRight,
            condensableSpaces
          );
          this.custos = notations[j - 1];
          this.custos.bounds.x =
            this.staffRight -
            this.custos.bounds.width -
            this.custos.leadingSpace;
        }

        // we are at the end of the line!
        break;
      }

      if (curr.hasLyrics()) LyricArray.mergeIn(this.lastLyrics, curr.lyrics);

      if (
        lastTranslationTextWithEndNeume &&
        curr === lastTranslationTextWithEndNeume.translationText[0].endNeume
      ) {
        lastTranslationTextWithEndNeume = null;
      } else if (
        curr.translationText &&
        curr.translationText.length &&
        curr.translationText[0].endNeume
      ) {
        lastTranslationTextWithEndNeume = curr;
      }

      curr.line = this;
      this.numNotationsOnLine++;

      if (curr.isClef) ctxt.activeClef = curr;

      // line breaks are a special case indicating to stop processing here
      if (curr.constructor === ChantLineBreak && width > 0) {
        this.justify =
          curr.justify ||
          this.extraTextOnlyIndex !== null ||
          this.getWhitespaceOnRight(ctxt) < 0;
        if (this.justify) this.findNeumesToJustify(prevLyrics);
        break;
      }

      if (curr.constructor === Custos) {
        this.custos = curr;
      } else if (curr.isNeume) {
        this.custos = null;
      }
    }

    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine - 1;
    var last = notations[lastIndex] || {};
    while (
      lastIndex > 0 &&
      (last.constructor === ChantLineBreak ||
        last.constructor === Custos ||
        last.constructor === TextOnly)
    ) {
      last = notations[--lastIndex];
    }
    var isLastLine =
      this.notationsStartIndex + this.numNotationsOnLine === notations.length;
    if (
      (this.justify && this.extraTextOnlyIndex !== null) ||
      (width > 0 && isLastLine)
    ) {
      // this is the last chant line, or it has extra TextOnly elements at the end
      if (!this.toJustify) this.findNeumesToJustify(prevLyrics);
      this.justify =
        (!isLastLine || last.isDivider) &&
        this.getWhitespaceOnRight(ctxt) / (this.toJustify.length || 1) <=
          ctxt.staffInterval * ctxt.maxExtraSpaceInStaffIntervals;
    }

    if (!this.custos) {
      // create the automatic custos at the end of the line if there are neumes left in the notations
      for (
        i = this.notationsStartIndex + this.numNotationsOnLine;
        i < notations.length;
        i++
      ) {
        var notation = notations[i];

        if (notation.isNeume) {
          this.custos = new Custos(true);
          ctxt.currNotationIndex = i - 1; // make sure the context knows where the custos is
          this.custos.performLayout(ctxt);

          if (this.justify) {
            // Put the custos at the very end of the line
            this.custos.bounds.x =
              this.staffRight -
              this.custos.bounds.width -
              this.custos.leadingSpace;
          } else {
            this.custos.bounds.x =
              prevNeume.bounds.right() + prevNeume.calculatedTrailingSpace;
          }
          // nothing more to see here...
          break;
        }
      }
    }

    if (this.lastLyricsBeforeTextOnly) {
      this.lastLyrics = this.lastLyricsBeforeTextOnly;
      delete this.lastLyricsBeforeTextOnly;
    }

    // find the final lyric and mark it as connecting if needed.
    if (width > 0) {
      var whitespace = this.getWhitespaceOnRight();
      var rightEdge = this.staffRight;
      if (whitespace < 0) {
        rightEdge -= whitespace;
      }
    }
    i = 0;
    while (this.lastLyrics && this.lastLyrics[i]) {
      let lyrics = this.lastLyrics[i];
      if (lyrics.allowsConnector()) {
        lyrics.setNeedsConnector(true, 0);
        if (width > 0 && ctxt.minLyricWordSpacing < ctxt.hyphenWidth) {
          whitespace = rightEdge - lyrics.getRight();
          // shrink the hyphen if we are already out of whitespace or if we would be if we used a regular hyphen:
          if (whitespace < 0) {
            var minHyphenWidth = Math.max(
              ctxt.hyphenWidth + whitespace,
              this.lastLyrics.length > 1
                ? ctxt.intraNeumeSpacing
                : ctxt.minLyricWordSpacing
            );
            // we might not need to shift the syllable, but we do want to shrink the hyphen...
            lyrics.setConnectorWidth(minHyphenWidth);
          }
        }
      }
      ++i;
    }

    // if the provided width is less than zero, then set the width of the line
    // based on the last notation
    if (width <= 0) {
      this.staffRight = notations[
        this.notationsStartIndex + this.numNotationsOnLine - 1
      ].bounds.right();
      this.justify = false;
    }

    // Justify the line if we need to
    this.justifyElements(ctxt, this.justify, condensableSpaces);

    this.centerDividers();

    this.finishLayout(ctxt);
  }

  centerDividers() {
    var lastIndex =
        this.extraTextOnlyIndex === null
          ? this.notationsStartIndex + this.numNotationsOnLine
          : this.extraTextOnlyIndex,
      curr;
    for (var i = this.notationsStartIndex; i < lastIndex; i++) {
      curr = this.score.notations[i];

      if (curr && curr.isDivider) {
        var j = 1;
        var prev = this.score.notations[i - 1];
        var next =
          i + 1 === lastIndex ? this.custos : this.score.notations[i + 1];
        if (prev === next && next === this.custos) {
          prev = this.score.notations[i - 2];
        }
        if (prev && next) {
          //if (prev instanceof TextOnly || next instanceof TextOnly) continue;
          var oldBoundsX = curr.bounds.x;
          var leftPoint =
              prev instanceof TextOnly && prev.hasLyrics()
                ? prev.lyrics[0].getRight()
                : prev.bounds.right(),
            rightPoint =
              next instanceof TextOnly && next.hasLyrics()
                ? next.lyrics[0].getLeft()
                : next.bounds.x;
          curr.bounds.x = (leftPoint + rightPoint - curr.bounds.width) / 2;
          if (curr.hasLyrics()) {
            var offset = oldBoundsX - curr.bounds.x;
            for (j = curr.lyrics.length - 1; j >= 0; j--) {
              curr.lyrics[j].bounds.x += offset;
              curr.lyrics[j].needsLayout = true;
            }
          }
        } else if (
          i === lastIndex - 1 &&
          this.justify &&
          (curr.constructor === DoubleBar || curr.constructor === FullBar)
        ) {
          curr.bounds.x = this.staffRight - curr.bounds.width;
        }
      }
    }
  }

  findNeumesToJustify(prevLyrics) {
    this.toJustify = [];
    var prev,
      curr = null,
      next = null,
      nextOrCurr = null,
      lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
    for (var i = this.notationsStartIndex; i < lastIndex; i++) {
      prev = nextOrCurr;
      curr = this.score.notations[i];
      next = curr.isAccidental && this.score.notations[++i];
      nextOrCurr = next || curr;
      var hasLyrics = nextOrCurr.hasLyrics();

      if (!curr || !prev) continue;

      if (
        this.extraTextOnlyIndex !== null &&
        i >= this.extraTextOnlyIndex &&
        curr.constructor === TextOnly
      )
        continue;

      if (prev !== null) {
        LyricArray.mergeIn(prevLyrics, prev.lyrics);
        if (prev.keepWithNext === true) continue;
      }

      if (
        !curr.isDivider &&
        prevLyrics.length &&
        prevLyrics[0].allowsConnector() &&
        hasLyrics
      )
        continue;

      if (nextOrCurr.constructor === ChantLineBreak) continue;

      if (nextOrCurr === this.custos && !hasLyrics) continue;

      if (i === 0 && this.score.useDropCap && hasLyrics) continue;

      // otherwise, we can add space before this element
      this.toJustify.push(curr);
    }
    if (nextOrCurr !== null) LyricArray.mergeIn(prevLyrics, nextOrCurr.lyrics);
    return nextOrCurr;
  }

  getWhitespaceOnRight(ctxt) {
    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
    var last = notations[lastIndex - 1];
    if (this.extraTextOnlyIndex !== null && last.constructor === TextOnly) {
      lastIndex = this.extraTextOnlyIndex;
      last = notations[lastIndex - 1];
    }
    var lastRightNeume = last
      ? last.bounds.right() + last.calculatedTrailingSpace
      : 0;
    var lastLyrics = this.lastLyricsBeforeTextOnly || this.lastLyrics;
    var lastRightLyric = lastLyrics.length
      ? LyricArray.getRight(lastLyrics)
      : 0;

    if (this.custos) {
      lastRightNeume += this.custos.bounds.width + this.custos.leadingSpace;
      if (this.custos.hasLyrics()) {
        lastRightLyric = LyricArray.getRight(this.custos.lyrics);
      }
    } else if (ctxt && lastIndex < notations.length) {
      lastRightNeume += Glyphs.CustosLong.bounds.width * ctxt.glyphScaling;
    }
    return this.staffRight - Math.max(lastRightLyric, lastRightNeume);
  }

  justifyElements(ctxt, doJustify, condensableSpaces) {
    var i;
    var toJustify = this.toJustify || [];
    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // if it wasn't an ideal line break, and the last note is further from the custos than it would have been from its next punctum,
    // move the custos over.
    // We do this first so that if it opens up any new whitespace, that gets accounted for when we do the justification
    var lastNotation =
      notations[this.notationsStartIndex + this.numNotationsOnLine - 1];
    var extraSpaceBeforeCustos =
      this.staffRight < Infinity &&
      this.custos &&
      lastNotation.keepWithNext &&
      this.custos.bounds.x -
        lastNotation.bounds.right() -
        lastNotation.calculatedTrailingSpace;
    if (extraSpaceBeforeCustos > 0) {
      // first, shrink the hyphen(s) if applicable, to move the neumes closer to the custos:
      i = 0;
      while (this.lastLyrics && this.lastLyrics[i]) {
        let lyrics = this.lastLyrics[i];
        if (lyrics.allowsConnector()) {
          var connectorWidth = lyrics.getConnectorWidth();
          if (ctxt.minLyricWordSpacing < connectorWidth) {
            var minHyphenWidth = Math.max(
              connectorWidth - extraSpaceBeforeCustos,
              this.lastLyrics.length > 1
                ? ctxt.intraNeumeSpacing
                : ctxt.minLyricWordSpacing
            );
            // we might not need to shift the syllable, but we do want to shrink the hyphen...
            lyrics.setConnectorWidth(minHyphenWidth);
          }
        }
        ++i;
      }
      this.custos.bounds.x =
        lastNotation.bounds.right() + lastNotation.calculatedTrailingSpace;
    }

    // first step of justification is to determine how much space we have to use up
    var extraSpace = this.getWhitespaceOnRight();

    if (
      Math.abs(extraSpace) < 0.5 ||
      (extraSpace > 0 && ((doJustify && toJustify.length === 0) || !doJustify))
    )
      return;

    this.condensableSpaces = condensableSpaces;

    var curr, prev;
    var offset = 0;
    var increment = extraSpace / toJustify.length;
    var multiplier = 0;
    var toJustifyIndex = 0;
    if (extraSpace < 0) {
      toJustify = condensableSpaces.filter(s => s.condensable > 0);
      multiplier = extraSpace / condensableSpaces.sum;
      increment = 0;
    }
    var nextToJustify = toJustify[toJustifyIndex++];
    var incrementOffsetAtNextChance = false;
    for (i = this.notationsStartIndex; i < lastIndex; i++) {
      prev = curr;
      curr = notations[i];

      if (
        this.extraTextOnlyIndex !== null &&
        i >= this.extraTextOnlyIndex &&
        curr.constructor === TextOnly
      ) {
        continue;
      }

      if (!multiplier && curr === this.custos) {
        if (curr.hasLyrics()) {
          curr.bounds.x = Math.min(
            curr.bounds.x +
              (this.staffRight - LyricArray.getRight(curr.lyrics)),
            this.staffRight - curr.bounds.width
          );
          offset += increment;
        } else {
          curr.bounds.x = Math.min(
            curr.bounds.x + offset,
            this.staffRight - curr.bounds.width
          );
        }
        continue;
      }

      if (multiplier) {
        if (nextToJustify && nextToJustify.notation === curr) {
          offset += multiplier * nextToJustify.condensable;
          nextToJustify = toJustify[toJustifyIndex++];
        }
      } else if (nextToJustify === curr) {
        if (prev.hasNoWidth) {
          incrementOffsetAtNextChance = true;
        } else {
          offset += increment;
        }
        nextToJustify = toJustify[toJustifyIndex++];
      } else if (incrementOffsetAtNextChance && !prev.hasNoWidth) {
        incrementOffsetAtNextChance = false;
        offset += increment;
      }

      curr.bounds.x += offset;
    }

    if (extraSpaceBeforeCustos > 0) {
      this.custos.bounds.x =
        lastNotation.bounds.right() + lastNotation.calculatedTrailingSpace;
    }
  }

  handleEndBrace(ctxt, note, i) {
    var startBrace = ctxt.lastStartBrace;
    if (!startBrace) return;
    // calculate the y value of the brace by iterating over all notations
    // under/over the brace.
    var y;
    var k = startBrace.notationIndex;
    var notations = this.score.notations;
    var dy = ctxt.intraNeumeSpacing / 2; // some safe space between brace and notes.
    var startNote = startBrace.note;

    if (startBrace.isAbove) {
      y = Math.min(
        ctxt.calculateHeightFromStaffPosition(4),
        ...[startNote, note]
          .concat(notations.slice(k, i + 1))
          .map(n => n.bounds.y - dy)
      );
    } else {
      y = Math.max(
        ctxt.calculateHeightFromStaffPosition(-4),
        ...[startNote, note]
          .concat(notations.slice(k, i + 1))
          .map(n => n.bounds.bottom() + dy)
      );
    }

    var addAcuteAccent = false;

    if (startBrace.shape === BraceShape.RoundBrace) {
      this.braces.push(
        new RoundBraceVisualizer(
          ctxt,
          startBrace.getAttachmentX(startNote),
          note.braceEnd.getAttachmentX(note),
          y,
          startBrace.isAbove
        )
      );
    } else {
      if (startBrace.shape === BraceShape.AccentedCurlyBrace)
        addAcuteAccent = true;

      this.braces.push(
        new CurlyBraceVisualizer(
          ctxt,
          startBrace.getAttachmentX(startNote),
          note.braceEnd.getAttachmentX(note),
          y,
          startBrace.isAbove,
          addAcuteAccent
        )
      );
    }

    delete ctxt.lastStartBrace;
  }

  finishLayout(ctxt) {
    this.ledgerLines = []; // clear any existing ledger lines

    var notations = this.score.notations;
    var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;

    // an element needs to have a staffPosition property, as well as the standard
    // bounds property. so it could be a note, or it could be a custos
    // offsetX can be used to add to the position info for the element,
    // useful in the case of notes.
    var processElementForLedgerLine = (
      element,
      endElem = element,
      staffPosition = element.staffPosition,
      offsetX = element.neume ? element.neume.bounds.x : 0
    ) => {
      // do we need a ledger line for this note?

      if (staffPosition >= 5 || staffPosition <= -5) {
        var x1 = offsetX + element.bounds.x - ctxt.intraNeumeSpacing;
        var x2 =
          offsetX +
          endElem.bounds.x +
          endElem.bounds.width +
          ctxt.intraNeumeSpacing;

        // round the staffPosition to the nearest line
        if (staffPosition > 0)
          staffPosition = staffPosition - ((staffPosition - 1) % 2);
        else staffPosition = staffPosition - ((staffPosition + 1) % 2);

        // if we have a ledger line close by, then average out the distance between the two
        var minLedgerSeparation = ctxt.staffInterval * ctxt.minLedgerSeparation;

        if (
          this.ledgerLines.length > 0 &&
          this.ledgerLines[this.ledgerLines.length - 1].x2 +
            minLedgerSeparation >=
            x1
        ) {
          // average out the distance
          var half =
            (x1 - this.ledgerLines[this.ledgerLines.length - 1].x2) / 2;
          this.ledgerLines[this.ledgerLines.length - 1].x2 += half;
          x1 -= half;
        }

        // never let a ledger line extend past the staff width
        if (x2 > this.staffRight) x2 = this.staffRight;

        // finally, add the ledger line
        this.ledgerLines.push({
          x1: x1,
          x2: x2,
          staffPosition: staffPosition
        });
      }
    };

    var episemata = []; // keep track of episemata in case we can connect some
    var startBrace = null;
    var minY = Number.MAX_VALUE,
      maxY = Number.MIN_VALUE; // for braces

    var positionNonLyricText = (text, neume, rightX) => {
      text.setMaxWidth(ctxt, this.staffRight);
      //text.bounds.x = neume.hasLyrics()? Math.min(...neume.lyrics.map(l => l.bounds.x)) : 0;
      text.bounds.x = 0;
      if (rightX)
        text.bounds.x = (text.bounds.x + rightX - text.bounds.width) / 2;
      var beyondStaffRight =
        neume.bounds.x + text.bounds.right() - this.staffRight;
      if (beyondStaffRight > 0) {
        text.bounds.x -= beyondStaffRight;
      }
      if (neume.bounds.x + text.bounds.x < 0) {
        text.bounds.x = -neume.bounds.x;
      }
    };

    // make a final pass over all of the notes to add any necessary
    // ledger lines and to smooth out episemata
    for (var i = this.notationsStartIndex; i < lastIndex; i++) {
      var neume = notations[i];

      minY = Math.min(minY, neume.bounds.y);
      maxY = Math.max(maxY, neume.bounds.bottom());

      if (neume.constructor === Custos) {
        processElementForLedgerLine(neume);
        continue;
      }

      // if the AboveLinesText would extend beyond the right edge of the staff, right align it instead
      if (neume.alText) {
        for (var j = 0; j < neume.alText.length; j++) {
          positionNonLyricText(neume.alText[j], neume);
        }
      }

      // set up horizontal position of translations
      if (neume.translationText) {
        for (j = 0; j < neume.translationText.length; j++) {
          var text = neume.translationText[j];
          if (text.endNeume) {
            var rightX = text.endNeume.hasLyrics()
              ? text.endNeume.bounds.x +
                Math.max(...text.endNeume.lyrics.map(l => l.bounds.right()))
              : text.endNeume.bounds.right();
            rightX -= neume.bounds.x;
            positionNonLyricText(text, neume, rightX);
          } else {
            positionNonLyricText(text, neume);
          }
        }
      }

      // if it's not a neume then just skip here
      if (!neume.isNeume) continue;

      for (j = 0; j < neume.ledgerLines.length; j++) {
        var ll = neume.ledgerLines[j];
        processElementForLedgerLine(ll.element, ll.endElem, ll.staffPosition);
      }

      for (j = 0; j < neume.notes.length; j++) {
        var k,
          note = neume.notes[j];

        // blend episemata as we're able
        if (note.episemata.length === 0) episemata = [];
        for (k = 0; k < note.episemata.length; k++) {
          var episema = note.episemata[k];

          var spaceBetweenEpisemata = 0;

          // calculate the distance between the last episemata and this one...
          // lots of code for a simple: currEpisemata.left - prevEpisemata.right
          if (episemata.length > 0)
            spaceBetweenEpisemata =
              neume.bounds.x +
              episema.bounds.x -
              (episemata[episemata.length - 1].note.neume.bounds.x +
                episemata[episemata.length - 1].bounds.right());

          // we try to blend the episema if we're able.
          if (
            episemata.length === 0 ||
            episemata[episemata.length - 1].positionHint !==
              episema.positionHint ||
            episemata[episemata.length - 1].terminating === true ||
            episemata[episemata.length - 1].alignment ===
              HorizontalEpisemaAlignment.Left ||
            episemata[episemata.length - 1].alignment ===
              HorizontalEpisemaAlignment.Center ||
            episema.alignment === HorizontalEpisemaAlignment.Right ||
            episema.alignment === HorizontalEpisemaAlignment.Center ||
            (spaceBetweenEpisemata > ctxt.intraNeumeSpacing * 2 &&
              note.glyphVisualizer.glyphCode !== GlyphCode.None)
          ) {
            // start a new set of episemata to potentially blend
            episemata = [episema];
          } else {
            // blend all previous with this one
            var newY;

            if (episema.positionHint === MarkingPositionHint.Below)
              newY = Math.max(
                episema.bounds.y,
                episemata[episemata.length - 1].bounds.y
              );
            else
              newY = Math.min(
                episema.bounds.y,
                episemata[episemata.length - 1].bounds.y
              );

            if (episema.bounds.y !== newY) episema.bounds.y = newY;
            else {
              for (var l = 0; l < episemata.length; l++)
                episemata[l].bounds.y = newY;
            }

            // extend the last episema to meet the new one
            var newWidth =
              neume.bounds.x +
              episema.bounds.x -
              (episemata[episemata.length - 1].note.neume.bounds.x +
                episemata[episemata.length - 1].bounds.x);
            if (newWidth < 0) {
              newWidth *= -1;
              episemata[episemata.length - 1].bounds.x -= newWidth;
            }
            episemata[episemata.length - 1].bounds.width = newWidth;

            episemata.push(episema);
          }
        }

        if (note.braceEnd) this.handleEndBrace(ctxt, note, i);

        if (note.braceStart) {
          ctxt.lastStartBrace = startBrace = note.braceStart;
          startBrace.notationIndex = i;
        }
      }
    }

    // if we still have an active brace, that means it spands two chant lines!
    if (startBrace !== null) {
      if (this.custos) {
        // if the next end brace is on the first note following the line break, simply use it with the custos
        // Do the same if there is only an accidental between
        // otherwise, make a new end brace to work for this one, and a new start brace for the next line.
        var nextNotation = notations[lastIndex];
        var nextNote = nextNotation.notes && nextNotation.notes[0];
        var nextNotationButOne = notations[lastIndex + 1];
        var nextNoteButOne =
          nextNotationButOne &&
          nextNotationButOne.notes &&
          nextNotationButOne.notes[0];
        var braceEnd =
          (nextNote && nextNote.braceEnd) ||
          (nextNotation.isAccidental &&
            nextNoteButOne &&
            nextNoteButOne.braceEnd);
        if (braceEnd) {
          this.custos.braceEnd = braceEnd;
          this.handleEndBrace(ctxt, this.custos, i);
        } else {
          this.braceStart = startBrace;
          this.custos.braceEnd = new BracePoint(
            this.custos,
            startBrace.isAbove,
            startBrace.shape,
            BraceAttachment.Right
          );
          this.handleEndBrace(ctxt, this.custos, i - 1);
          ctxt.lastStartBrace = new BracePoint(
            null,
            startBrace.isAbove,
            startBrace.shape,
            BraceAttachment.Left
          );
          ctxt.lastStartBrace.notationIndex = i;
        }
      }
    }

    // don't forget to also include the final custos, which may need a ledger line too
    if (this.custos) processElementForLedgerLine(this.custos);
  }

  // this is where the real core of positioning neumes takes place
  // returns true if positioning was able to fit the neume before rightNotationBoundary.
  // returns false if cannot fit before given right margin.
  // fixme: if this returns false, shouldn't we set the connectors on prev to be activated?!
  positionNotationElement(
    ctxt,
    prevLyrics,
    prev,
    curr,
    rightNotationBoundary,
    condensableSpaces = []
  ) {
    if (!condensableSpaces.hasOwnProperty("sum")) condensableSpaces.sum = 0;
    var i,
      space = { notation: curr },
      fixedX = false;

    // To begin we just place the current notation right after the previous,
    // irrespective of lyrics.
    // But if the previous neume was part of a polyphonic "no width" group and the current is not, or is of a separate group,
    // we force it to have the same x as the previous group.
    if (
      (!curr.hasNoWidth || curr.firstWithNoWidth === curr) &&
      prev.firstWithNoWidth
    ) {
      curr.bounds.x = prev.firstWithNoWidth.bounds.x;
      fixedX = true;
    } else {
      curr.bounds.x = prev.bounds.right();
    }

    if (
      (curr.constructor === TextOnly && this.extraTextOnlyIndex === null) ||
      (!curr.hasLyrics() && prev.calculatedTrailingSpace < 0)
    ) {
      // We transfer over the trailing space from the previous neume if the current neume is text only,
      // so that the text only neume has a better chance at not needing a connector.
      curr.calculatedTrailingSpace = prev.calculatedTrailingSpace;
      if (curr.hasLyrics())
        curr.calculatedTrailingSpace -= curr.lyrics[0].bounds.width;
      if (curr.constructor === TextOnly && curr.lyrics.length === 1) {
        curr.lyrics[0].setMaxWidth(
          ctxt,
          this.staffRight,
          this.staffRight -
            LyricArray.getRight(prevLyrics) -
            ctxt.minLyricWordSpacing
        );
      }
    } else if (!fixedX) {
      curr.bounds.x += prev.calculatedTrailingSpace;
    }

    if (
      curr.hasLyrics() &&
      !prev.isDivider &&
      !prev.isAccidental &&
      this.numNotationsOnLine > 0 &&
      (curr.lyrics[0].lyricType === LyricType.SingleSyllable ||
        curr.lyrics[0].lyricType === LyricType.BeginningSyllable)
    ) {
      curr.bounds.x += ctxt.intraNeumeSpacing * ctxt.interVerbalMultiplier;
    }
    if (curr.hasNoWidth || fixedX) {
      space.total = space.condensable = 0;
    } else if (
      this.extraTextOnlyIndex !== null &&
      curr.constructor === TextOnly
    ) {
      curr.bounds.x = 0;
      space.total = space.condensable = 0;
    } else {
      space.total = curr.bounds.x - prev.bounds.right();
      space.condensable = space.total * ctxt.condensingTolerance;
    }

    // if the previous notation has no lyrics, then we simply make sure the
    // current notation with lyrics is in the bounds of the line
    if (prevLyrics.length === 0) {
      var maxRight = curr.bounds.right() + curr.calculatedTrailingSpace;

      // if the lyric left is negative, then offset the neume appropriately
      for (i = 0; i < curr.lyrics.length; i++) {
        let currLyric = curr.lyrics[i];
        // we hope for the best!
        // but always use a connector if the lyric has original text that was all used up for the drop cap.
        let needsConnector =
          currLyric.allowsConnector() &&
          currLyric.dropCap &&
          currLyric.originalText &&
          !currLyric.text;
        currLyric.setNeedsConnector(needsConnector);
        let minLeft = this.staffLeft - this.paddingLeft;

        if (currLyric.getLeft() < minLeft)
          curr.bounds.x -= currLyric.getLeft() - minLeft;

        space.condensable = Math.min(
          space.condensable,
          currLyric.getLeft() - minLeft
        );
        maxRight = Math.max(maxRight, currLyric.getRight());
      }

      if (
        maxRight >
        rightNotationBoundary + condensableSpaces.sum + space.condensable
      )
        return false;
      condensableSpaces.push(space);
      condensableSpaces.sum += space.condensable;
      return true;
    } else {
      if (curr.firstOfSyllable && prevLyrics.length && !curr.hasLyrics()) {
        curr.bounds.x = Math.max(curr.bounds.x, prevLyrics[0].getRight());
        space.total = curr.bounds.x - prev.bounds.right();
        space.condensable = space.total * ctxt.condensingTolerance;
      }
    }

    // if the curr notation has no lyrics, then simply check whether there is enough room
    if (curr.hasLyrics() === false) {
      if (
        curr.bounds.right() + curr.calculatedTrailingSpace >
        rightNotationBoundary + condensableSpaces.sum + space.condensable
      )
        return false;
      condensableSpaces.push(space);
      condensableSpaces.sum += space.condensable;
      return true;
    }

    // if we have multiple lyrics on the current or the previous notation,
    // we will have to run several passes over each set of lyrics:

    // on the first pass, we will check the absolute left-most placement of the new syllables
    // we will make additional passes until everything is stable
    do {
      var hasShifted = false;
      var atLeastOneWithoutConnector = false;
      for (i = 0; i < curr.lyrics.length; i++) {
        if (!curr.lyrics[i].originalText) continue;
        var prevLyricRight = 0;
        let condensableSpacesSincePrevLyric = [];
        let condensableSpaceSincePrevLyric = null;
        if (i < prevLyrics.length && prevLyrics[i]) {
          prevLyricRight = prevLyrics[i].getRight();
          let notationI = condensableSpaces
            .map(s => s.notation)
            .lastIndexOf(prevLyrics[i].notation);
          if (notationI >= 0) {
            condensableSpacesSincePrevLyric = condensableSpaces.slice(
              notationI + 1
            );
            condensableSpacesSincePrevLyric.sum = condensableSpacesSincePrevLyric
              .map(s => s.condensable)
              .reduce((a, b) => a + b, 0);
          } else {
            condensableSpacesSincePrevLyric.sum = 0;
          }
        }

        curr.lyrics[i].setNeedsConnector(false); // we hope for the best!
        var currLyricLeft = curr.lyrics[i].getLeft();
        if (!prevLyrics[i] || prevLyrics[i].allowsConnector() === false) {
          // No connector needed, but include space between words if necessary!
          let extraSpace = currLyricLeft - prevLyricRight - ctxt.minLyricWordSpacing;
          if (extraSpace < 0) {
            // push the current element over a bit.
            let shift =
              prevLyricRight + ctxt.minLyricWordSpacing - currLyricLeft;
            curr.bounds.x += shift;
            condensableSpaceSincePrevLyric = 0;
            hasShifted = shift > 0.5;
          } else {
            condensableSpaceSincePrevLyric = extraSpace;
          }
        } else {
          // we may need a connector yet...
          if (
            prevLyricRight + 0.1 >
            currLyricLeft -
              condensableSpacesSincePrevLyric.sum -
              space.condensable
          ) {
            // in this case, the lyric elements actually overlap.
            // so nope, no connector needed. instead, we just place the lyrics together
            // fixme: for better text layout, we could actually use the kerning values
            // between the prev and curr lyric elements!
            let shift = prevLyricRight - currLyricLeft;
            if (shift < -0.1) {
              // in this case, the spacing needs to be condensed in the neumes since the last lyric...
              let multiplier =
                shift /
                (condensableSpacesSincePrevLyric.sum + space.condensable);
              let offset = 0;
              condensableSpacesSincePrevLyric.forEach(s => {
                offset += multiplier * s.condensable;
                s.notation.bounds.x += offset;
              });
            }
            curr.bounds.x += shift;
            condensableSpaceSincePrevLyric = 0;
            atLeastOneWithoutConnector = true;
            hasShifted = shift > 0.5;
          } else {
            // bummer, looks like we couldn't merge the syllables together. Better add a connector...
            if (ctxt.minLyricWordSpacing < ctxt.hyphenWidth) {
              var spaceBetweenSyls = currLyricLeft - prevLyricRight;
              if (spaceBetweenSyls < ctxt.hyphenWidth) {
                var minHyphenWidth =
                  prevLyrics.length > 1
                    ? ctxt.intraNeumeSpacing
                    : ctxt.minLyricWordSpacing;
                // we might not need to shift the syllable, but we do want to shrink the hyphen...
                prevLyrics[i].setConnectorWidth(
                  Math.max(minHyphenWidth, spaceBetweenSyls)
                );
              }
            }
            prevLyrics[i].setNeedsConnector(true);
            prevLyricRight = prevLyrics[i].getRight();

            if (prevLyricRight + 0.1 > currLyricLeft) {
              let shift = prevLyricRight - currLyricLeft;
              curr.bounds.x += shift;
              condensableSpaceSincePrevLyric = 0;
              hasShifted = shift > 0.5;
            } else {
              condensableSpaceSincePrevLyric = currLyricLeft - prevLyricRight;
            }
          }
        }

        if (condensableSpaceSincePrevLyric !== null) {
          if (
            condensableSpaceSincePrevLyric <
            condensableSpacesSincePrevLyric.sum + space.condensable
          ) {
            // reduce condensable space so that lyrics retain at least the width of a space character between words:
            let multiplier = condensableSpaceSincePrevLyric / (condensableSpacesSincePrevLyric.sum + space.condensable);
            space.condensable *= multiplier;
            if (condensableSpacesSincePrevLyric.sum) {
              condensableSpacesSincePrevLyric.forEach(space => {
                space.condensable *= multiplier;
              });
              condensableSpaces.sum = condensableSpaces
                .map(s => s.condensable)
                .reduce((a, b) => a + b, 0);
            }
          }
        }
      }
    } while (
      curr.lyrics.length > 1 &&
      hasShifted &&
      atLeastOneWithoutConnector
    );

    for (i = Math.min(curr.lyrics.length, prevLyrics.length) - 1; i >= 0; i--) {
      let pLyrics = prevLyrics[i];
      if (pLyrics.needsConnector && pLyrics.connectorWidth) {
        currLyricLeft = curr.lyrics[i].getLeft();
        prevLyricRight = pLyrics.getRight() - pLyrics.connectorWidth;
        spaceBetweenSyls = currLyricLeft - prevLyricRight;
        if (spaceBetweenSyls >= ctxt.hyphenWidth) spaceBetweenSyls = 0;
        pLyrics.setConnectorWidth(spaceBetweenSyls);
      }
    }

    if (
      curr.bounds.right() + curr.calculatedTrailingSpace <
        rightNotationBoundary + condensableSpaces.sum + space.condensable &&
      LyricArray.getRight(curr.lyrics, true) <=
        this.staffRight + condensableSpaces.sum + space.condensable
    ) {
      if (prev.isAccidental) {
        // move the previous accidental up next to the current note:
        let shift =
          curr.bounds.x -
          prev.bounds.width -
          prev.calculatedTrailingSpace -
          prev.bounds.x;
        prev.bounds.x += shift;
        if (Math.abs(shift) > 0.1) {
          let lastCondensable = condensableSpaces[condensableSpaces.length - 1];
          condensableSpaces.sum -= lastCondensable.condensable;
          lastCondensable.condensable = 0;
        }
      }
      condensableSpaces.push(space);
      condensableSpaces.sum += space.condensable;
      return true;
    }

    // if we made it this far, then the element won't fit on this line.
    return false;
  }

  /**
   * Find the notation closest to x without going past it
   * @param {number} x
   */
  bisectNotationAtX(x, useMidpoint = true) {
    let minIndex = -1,
      maxIndex = Math.min(this.numNotationsOnLine, Infinity),
      curIndex = minIndex + ((maxIndex - minIndex) >> 1),
      notations = this.score.notations.slice(
        this.notationsStartIndex,
        this.notationsStartIndex + this.numNotationsOnLine
      );

    while (minIndex < curIndex) {
      let notation = notations[curIndex];
      let notationX = notation.bounds.x;
      if (notationX > x) {
        maxIndex = curIndex;
      } else {
        minIndex = curIndex;
      }
      curIndex = minIndex + ((maxIndex - minIndex) >> 1);
    }
    let notation = notations[curIndex];
    if (
      useMidpoint &&
      notation &&
      notation.bounds.width === 0 &&
      curIndex + 1 < notations.length
    ) {
      let nextNotation = notations[curIndex + 1],
        closenessToLeft = x - notation.bounds.x,
        closenessToRight = nextNotation.bounds.x - x;
      if (nextNotation.bounds.width === 0 && closenessToRight < closenessToLeft)
        ++curIndex;
    }
    return notations[curIndex];
  }
}
