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

import {
  Units,
  Pitch,
  Point,
  Rect,
  Margins,
  Size,
  Step
} from "./Exsurge.Core.js";
import {
  MarkingPositionHint,
  LyricType,
  Lyric,
  LyricArray,
  AboveLinesText,
  ChoralSign,
  TranslationText,
  DefaultTrailingSpace,
  GlyphCode
} from "./Exsurge.Drawing.js";
import {
  Note,
  LiquescentType,
  NoteShape,
  NoteShapeModifiers,
  ChantMapping,
  ChantScore,
  ChantDocument,
  Clef,
  DoClef,
  FaClef,
  TrebleClef,
  TextOnly,
  ChantLineBreak,
  ChiRhoClef
} from "./Exsurge.Chant.js";
import * as Markings from "./Exsurge.Chant.Markings.js";
import * as Signs from "./Exsurge.Chant.Signs.js";
import * as Neumes from "./Exsurge.Chant.Neumes.js";
import { escapeChar, restoreEscapes, unescapeText } from "./gabcEscapes.js";
import type {
  AreaBoundary,
  ChantContext,
  ChantNotationElement,
  LyricProtrusion,
  TrailingSpace,
  TrailingSpaceFunction
} from "./Exsurge.Drawing.js";

/**
 * how a list of mappings differs from a list of gabc words: words that are
 * the same ("="), mappings taken out ("-") or words put in ("+")
 */
export type WordDiff<Descriptor extends { source: string } = ChantMapping> =
  | ["=" | "+", string[]]
  | ["-", Descriptor[]];

/** a syllable of a gabc word, from Gabc.parseWord() */
export interface ParsedSyllable {
  notations: string;
  lyrics: string[];
}

// one of the states of the state machine in Gabc.createNeumesFromNotes()
interface NeumeState {
  /** the neume to make of the notes so far, when there are no more notes */
  neume(): Neumes.Neume;
  /** returns the next state, after making a neume if this note can't continue this one */
  handle(currNote: Note, prevNote: Note, notesRemaining: number): NeumeState;
}

// what Gregorio's comments are masked with (see maskGabc() below)
var __commentMask = "\uFDD0";

// reusable reg exps
// (a syllable starts after any spaces or masked comments)
var __syllablesRegex = /(?=[^\s\uFDD0])((?:<v>[\s\S]*?<\/v>|[^(])*)(?:\(?([^)]*)\)?)?/g
var __altTranslationRegex = /<alt>(.*?)<\/alt>|\[(alt:)?(.*?)\]/g;
// Gregorio's comments and $ escapes in the notation section (see maskGabc()
// below), and the text where a % isn't a comment
var __commentRegex = /<sp>[^<]*?<\/sp>|<v>[\s\S]*?<\/v>|\$([\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S])|%[^%\s][^%\n]*%|(%[^\n]*\n?)/g;
var __commentMaskRegex = /\uFDD0/g;
// Gregorio's syllable controls, which aren't printed: the euouae and
// no-line-break areas, <clear> and <pr> (with spaces where Gregorio allows them)
var __lyricAreaTagRegex = /<(\/)?(eu|nlba)>/g;
var __lyricClearRegex = /<\s*clear\s*\/?\s*>/g;
var __lyricProtrusionRegex = /<\s*pr\s*(?::\s*(\d*\.?\d+|\d+\.)\s*)?\/?\s*>/g;

// (a note can start with Gregorio's @, unless it's the @ between two clefs, c1@c4)
var __notationsRegex = /z0|z|Z|(::|(?::|[,;][1-8]?|`)_?)|(?:[cfg]|cb|treble-?|xp-?)[1-5]|\/+| |\!|\[\[|\]\]?|<\/?nlba>|@\[|(?:-|@(?![cf]b?[1-5]))?[a-nA-N](?:[oOwWvVrRsxXyY#~\+>_\.'0-9|=q?]|<(?!\/?nlba>))*(?:\[(?!\[)[^\]]*\]?)*|\{([^}]+)\}?/g;
var __notationsRegex_group_bar = 1;
var __notationsRegex_group_insideBraces = 2;
// Gregorio's marks between notes, which are recorded on the notes after or before them
var __noteMarkRegex = /^(?:\[\[|\]\]?|<\/?nlba>|@\[)$/;

var __bracketedCommandRegex = /^([a-z]+):(.*)/;

// for the brace string inside of [ and ] in notation data
// the capturing groups are:
//  1. o or u, to indicate over or under
//  2. b, cb, or cba, to indicate the brace type
//  3. 0 or 1 to indicate the attachment point
//  4. { or } to indicate opening/closing (this group will be null if the metric version is used)
//  5. a float indicating the millimeter length of the brace (not supported yet)
var __braceSpecRegex = /([ou])(b|cb|cba):([01])(?:([{}])|;(\d*(?:\.\d+)?)mm)/;

const TrailingSpaceForAccidental = (ctxt: ChantContext) =>
  ctxt.intraNeumeSpacing * ctxt.accidentalSpaceMultiplier;
const TrailingSpaceMultiple = (multiplier: number) => (ctxt: ChantContext) =>
  ctxt.intraNeumeSpacing * multiplier;

// the line that ends the header: two or more %s, as Gregorio allows
const regexHeaderEnd = /(?:^|\n)%%+[ \t\r]*(?:\n|$)/;
const regexHeaderEndLine = /^%%+\s*$/;
// a header line, "name: value;".  The value ends at a ; or ;; with nothing
// but spaces after it.  A line without that ending is a value on its own (as
// it always was in exsurge), unless the lines after it end the value, as
// Gregorio's multi-line values do ("name: first line⏎second line;;")
const regexHeaderLine = /^([\w-_.]+):\s*(.*?)(;;?[ \t]*)?$/i;
// a line that ends a multi-line value
const regexHeaderValueEnd = /^(.*?);;?[ \t]*$/;
// lines that can't be part of a multi-line value: another header, a comment
// or the end of the header
const regexHeaderNotValue = /^(?:[\w-_.]+:|[%#])/i;
const regexHeaderComment = /^%.*/;

// the lines of a value that goes on over the lines after lines[start], and
// the index of the line that ends it, or null if those lines don't end it
const multiLineHeaderValue = (lines: string[], start: number) => {
  let values: string[] = [];
  for (let i = start + 1; i < lines.length; ++i) {
    if (regexHeaderNotValue.test(lines[i])) break;
    let match = regexHeaderValueEnd.exec(lines[i]);
    if (match) return { values: [...values, match[1]], end: i };
    values.push(lines[i]);
  }
  return null;
};

// a header field's lines, with a multi-line value ending in ;; as Gregorio's do
const headerLines = (key: string, value: string) =>
  value.includes("\n")
    ? `${key}: ${value};;`.split("\n")
    : [`${key}: ${value};`];
interface GabcHeaderMembers {
  /** the text of the header, through the %% line */
  original: string;
  /** the header's comment lines, by line number */
  comments: string[];
  /** the values of commented-out header lines ("%name: value;") */
  cValues: { [key: string]: string };
  toString(): string;
}
/**
 * A gabc header.  Each field is set under its gabc name (e.g. "office-part")
 * and, if different, its camelCase name (e.g. "officePart").  A field that
 * appears more than once also gets an array of all its values, e.g.
 * "commentaryArray".  Fields that aren't in the header are undefined.
 *
 * This is an intersection rather than a class so that the index signatures
 * don't have to allow the types of the members above.
 */
export type GabcHeader = GabcHeaderMembers & {
  [key: `${string}Array`]: string[] | undefined;
} & {
  [key: string]: string | undefined;
};
export interface GabcHeaderConstructor {
  new (text?: string): GabcHeader;
  getLength(gabc: string): number;
}

const GabcHeaderClass = class GabcHeader {
  // the fields of the header, which aren't known in advance
  [field: string]: any;
  comments: string[];
  cValues: { [key: string]: string };
  original: string;

  static getLength(gabc: string) {
    let match = gabc.match(regexHeaderEnd);
    return match ? match.index! + match[0].length : 0;
  }

  constructor(text?: string) {
    if (typeof text !== "string") text = "";
    this.comments = [];
    this.cValues = {};
    this.original = "";
    let match = text.match(regexHeaderEnd);
    if (match) {
      let txtHeader = (this.original = text.slice(
        0,
        match.index! + match[0].length
      ));
      var lines = txtHeader.split(/\r?\n/g);
      for (var i = 0; i < lines.length; ++i) {
        let line = lines[i],
          match = regexHeaderLine.exec(line);
        if (match) {
          var key = match[1].replace(/-([a-z])/g, function(a: string, letter: string) {
            return letter.toUpperCase();
          });
          var value = match[2];
          var multiLine = match[3] ? null : multiLineHeaderValue(lines, i);
          if (multiLine) {
            value = [value, ...multiLine.values].join("\n");
            i = multiLine.end;
          }
          if (this[match[1]]) {
            var arrayName = match[1] + "Array";
            if (!this[arrayName]) {
              this[arrayName] = [this[match[1]]];
            }
            this[arrayName].push(value);
          } else {
            this[match[1]] = value;
          }
          if (key !== match[1]) this[key] = this[match[1]];
        } else if ((match = regexHeaderComment.exec(line))) {
          if (!regexHeaderEndLine.test(line)) {
            match = regexHeaderLine.exec(line.slice(1));
            if (match) {
              let key = match[1].replace(/-([a-z])/g, function(a: string, letter: string) {
                return letter.toUpperCase();
              });
              this.cValues[match[1]] = match[2];
              if (key !== match[1]) this.cValues[key] = match[2];
            } else {
              this.comments[i] = line;
            }
          }
        }
      }
    }
  }

  toString() {
    var result = [];
    for (let key in this) {
      if (
        typeof this[key] !== "string" ||
        /^(length|original|comments|cValues)$/.test(key)
      ) {
        continue;
      }
      var alternateKey = key.replace(/[A-Z]/g, function(letter: string) {
        return "-" + letter.toLowerCase();
      });
      if (alternateKey !== key && alternateKey in this) continue;
      var array = this[key + "Array"];
      if (array) {
        for (var i = 0; i < array.length; ++i) {
          result.push(...headerLines(key, array[i]));
        }
      } else {
        result.push(...headerLines(key, this[key]));
      }
    }
    for (let key in this.cValues) {
      if (key.length === 0 || !this.cValues.hasOwnProperty(key)) continue;
      result.push("%" + key + ": " + this.cValues[key] + ";");
    }
    for (let i in this.comments) {
      if (!this.comments.hasOwnProperty(i)) continue;
      try {
        // (i is a string, which splice() takes as the number it is)
        result.splice(i as unknown as number, 0, this.comments[i as unknown as number]);
      } catch (e) {
        console.warn(e);
      }
    }
    return result.join("\n") + "\n%%\n";
  }
};
export const GabcHeader = GabcHeaderClass as unknown as GabcHeaderConstructor;

/**
 * Masks Gregorio's comments in the notation section: a % to the end of its
 * line, which also takes the line break away.  Each character becomes a
 * noncharacter (U+FDD0), so that the source keeps its length (and the source
 * indices stay where they were), and the parser skips it as it does a space
 * between syllables, though without ending a word or a neume.  A % that
 * another % closes later on its line is exsurge's %small caps% markup
 * instead (when no space follows it), and a % in <sp>…</sp> or <v>…</v>, or
 * escaped as $%, isn't a comment.
 *
 * Also replaces Gregorio's $ escapes outside <sp> and <v> with characters
 * that mean nothing to the parser (see gabcEscapes.ts), also keeping the
 * length.
 */
var maskGabc = (gabc: string) =>
  gabc.replace(__commentRegex, (match, escaped, comment) =>
    escaped ? escapeChar(escaped) : comment ? __commentMask.repeat(comment.length) : match
  );

// whether a gabc word is only spaces and comments
var isEmptyWord = (word: string) => word.replace(__commentMaskRegex, "").trim() === "";

var elementCountForNotations = (items: ChantNotationElement[]) =>
  items.reduce((sum, item) => sum + (item.notes ? item.notes.length : 1), 0);

/** the Gregorio areas that a syllable's lyrics start or end */
type SyllableAreas = { euouae?: AreaBoundary; noLineBreak?: AreaBoundary };

// marks the start of an area on the first of a syllable's notations and its end on the last
var setAreaBoundaries = (items: ChantNotationElement[], areas: SyllableAreas) => {
  for (let name of ["euouae", "noLineBreak"] as const) {
    let area = areas[name];
    if (!area) continue;
    if (area.start) items[0][name] = { ...items[0][name], start: true };
    if (area.end) {
      let last = items[items.length - 1];
      last[name] = { ...last[name], end: true };
    }
  }
};

// reads the <eu> and <nlba> tags in a syllable's text into areas, and returns
// the text that's printed: without those tags, <clear> or <pr>, and empty if
// there's nothing else but spaces
var readSyllableControls = (text: string, areas: SyllableAreas) => {
  let printedText = text
    .replace(__lyricAreaTagRegex, (tag, closing, name) => {
      let area: keyof SyllableAreas = name === "eu" ? "euouae" : "noLineBreak";
      areas[area] = { ...areas[area], [closing ? "end" : "start"]: true };
      return "";
    })
    .replace(__lyricClearRegex, "")
    .replace(__lyricProtrusionRegex, "");
  return printedText !== text && printedText.trim() === "" ? "" : printedText;
};

// the index in a lyric's text of what was at index in the text it was made from
var lyricTextIndex = (ctxt: ChantContext, lyric: Lyric, index: number) => {
  index += (ctxt.textStyles.lyric.prefix || "").length;
  let textIndex = 0;
  for (let span of lyric.spans) {
    if (index < span.index + span.text.length)
      return textIndex + Math.max(0, index - span.index);
    textIndex += span.text.length;
  }
  return textIndex;
};

export class Gabc {
  /** a brace given a length rather than an end, which the next note ends */
  static needToEndBrace?: Markings.BracePoint;

  // takes gabc source code (without the header info) and returns an array
  // of ChantMappings describing the chant. A chant score can then be created
  // fron the chant mappings and later updated via updateMappings() if need
  // be...
  static createMappingsFromSource(ctxt: ChantContext, gabcSource: string) {
    var headerLength = GabcHeader.getLength(gabcSource);
    ctxt.nabcLines = this.getNabcLines(gabcSource, headerLength);
    gabcSource = gabcSource.slice(headerLength);
    var words = this.splitWords(gabcSource);

    // set the default clef
    ctxt.activeClef = Clef.default();
    // the default clef is shared, so forget any accidental the last chant left on it
    ctxt.activeClef.resetAccidentals();
    // an automatic brace left open at the end of the last chant parsed doesn't
    // carry over into this one
    delete this.needToEndBrace;

    var mappings = this.createMappingsFromWords(ctxt, words);

    // always set the last notation to have a trailingSpace of 0. This makes layout for the last chant line simpler
    if (
      mappings.length > 0 &&
      mappings[mappings.length - 1].notations.length > 0
    )
      mappings[mappings.length - 1].notations[
        mappings[mappings.length - 1].notations.length - 1
      ].trailingSpace = 0;

    return mappings;
  }

  /** the number of lines of NABC that a gabc file's header gives (nabc-lines) */
  static getNabcLines(gabc: string, headerLength = GabcHeader.getLength(gabc)) {
    if (!headerLength) return 0;
    let nabcLines = parseInt(new GabcHeader(gabc.slice(0, headerLength))["nabc-lines"]!, 10);
    return nabcLines > 0 ? nabcLines : 0;
  }

  /**
   * Splits a syllable's notes into gabc and Gregorio's NABC, when there are
   * nabcLines lines of NABC.  As in Gregorio, the parts between the |s take
   * turns: gabc, then the NABC of each line, then gabc again.  Returns the
   * notes with the NABC and the |s masked (keeping their length), but with a
   * / at a | between two parts of gabc, which Gregorio makes separate
   * elements, and each part of gabc that has NABC, by where it starts in the
   * notes, and where it put the /s.  The NABC of a part of gabc that's empty
   * goes with the part before it.
   */
  static splitNabc(data: string, nabcLines: number) {
    let gabc = "";
    let cuts: number[] = [];
    let parts: { index: number; nabc: string[] }[] = [];
    let part: { index: number; nabc: string[] } | null = null;
    let lastGabc = "";
    let index = 0;
    data.split("|").forEach((snippet, i) => {
      let state = i % (nabcLines + 1);
      if (state === 0) {
        if (i > 0 && lastGabc.trim() && snippet.trim()) {
          cuts.push(gabc.length);
          gabc += "/";
        } else if (i > 0) gabc += __commentMask;
        if (snippet.trim() || !part) parts.push((part = { index, nabc: [] }));
        if (snippet.trim()) lastGabc = snippet;
        gabc += snippet;
      } else {
        gabc += __commentMask.repeat(snippet.length + 1);
        part!.nabc[state - 1] = (part!.nabc[state - 1] || "") + snippet;
      }
      index += snippet.length + 1;
    });
    // (a voice that was skipped with || has an empty string)
    for (let p of parts) for (let v = 0; v < p.nabc.length; v++) p.nabc[v] = p.nabc[v] || "";
    return { gabc, cuts, parts: parts.filter((p) => p.nabc.length > 0) };
  }

  // A simple general purpose diff algorithm adapted here for comparing
  // an array of existing mappings with an updated list of gabc words.
  // note before is an array of mappings, and after is an array of strings
  // (gabc words).
  //
  // Edits usually touch only a few words, so any common prefix and suffix
  // are split off as unchanged first, and only the words in between are
  // diffed with the (much slower) longest common substring algorithm below.
  //
  // Returns:
  //   A list of pairs, with the first part of the pair being one of three
  //   strings ('-', '+', '=') and the second part being a list of values from
  //   the original before and/or after lists. The first part of the pair
  //   corresponds to whether the list of values is a deletion, insertion, or
  //   unchanged, respectively.
  static diffDescriptorsAndNewWords<Descriptor extends { source: string }>(
    before: Descriptor[],
    after: string[]
  ): WordDiff<Descriptor>[] {
    var beforeLength = before.length,
      afterLength = after.length,
      prefixLength = 0,
      suffixLength = 0;

    while (
      prefixLength < beforeLength &&
      prefixLength < afterLength &&
      before[prefixLength].source === after[prefixLength]
    )
      prefixLength++;

    while (
      suffixLength < beforeLength - prefixLength &&
      suffixLength < afterLength - prefixLength &&
      before[beforeLength - 1 - suffixLength].source ===
        after[afterLength - 1 - suffixLength]
    )
      suffixLength++;

    var result: WordDiff<Descriptor>[] = [];
    if (prefixLength) result.push(["=", after.slice(0, prefixLength)]);
    result = result.concat(
      this.diffDescriptorsAndNewWordsBySubstring(
        before.slice(prefixLength, beforeLength - suffixLength),
        after.slice(prefixLength, afterLength - suffixLength)
      )
    );
    if (suffixLength)
      result.push(["=", after.slice(afterLength - suffixLength)]);
    return result;
  }

  // The general case of diffDescriptorsAndNewWords: finds the longest common
  // substring and recursively diffs the words before and after it.
  //
  // This is definitely not the most effecient diff algorithm, but for our
  // limited needs and source size it seems to work just fine...
  //
  // code is adapted from: https://github.com/paulgb/simplediff
  static diffDescriptorsAndNewWordsBySubstring<Descriptor extends { source: string }>(
    before: Descriptor[],
    after: string[]
  ): WordDiff<Descriptor>[] {
    // Create a map from before values to their indices
    var oldIndexMap = new Map<string, number[]>(),
      indices: number[] | undefined,
      i;
    for (i = 0; i < before.length; i++) {
      indices = oldIndexMap.get(before[i].source);
      if (indices) indices.push(i);
      else oldIndexMap.set(before[i].source, [i]);
    }

    // overlap[iold] is the length of the common substring ending at
    // before[iold] and the previous new word; only the entries at
    // overlapIndices are non-zero.
    var overlap = new Int32Array(before.length),
      _overlap = new Int32Array(before.length),
      overlapIndices: number[] | undefined | null = null,
      swap,
      startOld,
      startNew,
      subLength,
      inew;

    startOld = startNew = subLength = 0;

    for (inew = 0; inew < after.length; inew++) {
      indices = oldIndexMap.get(after[inew]);
      if (indices) {
        for (i = 0; i < indices.length; i++) {
          var iold = indices[i];
          // now we are considering all values of val such that
          // `before[iold] == after[inew]`
          _overlap[iold] = (iold > 0 ? overlap[iold - 1] : 0) + 1;
          if (_overlap[iold] > subLength) {
            // this is the largest substring seen so far, so store its indices
            subLength = _overlap[iold];
            startOld = iold - subLength + 1;
            startNew = inew - subLength + 1;
          }
        }
      }
      if (overlapIndices)
        for (i = 0; i < overlapIndices.length; i++)
          overlap[overlapIndices[i]] = 0;
      swap = overlap;
      overlap = _overlap;
      _overlap = swap;
      overlapIndices = indices;
    }

    if (subLength === 0) {
      // If no common substring is found, we return an insert and delete...
      var result: WordDiff<Descriptor>[] = [];

      if (before.length) result.push(["-", before]);

      if (after.length) result.push(["+", after]);

      return result;
    }

    // ...otherwise, the common substring is unchanged and we recursively
    // diff the text before and after that substring
    return ([] as WordDiff<Descriptor>[]).concat(
      this.diffDescriptorsAndNewWordsBySubstring(
        before.slice(0, startOld),
        after.slice(0, startNew)
      ),
      [["=", after.slice(startNew, startNew + subLength)] as WordDiff<Descriptor>],
      this.diffDescriptorsAndNewWordsBySubstring(
        before.slice(startOld + subLength),
        after.slice(startNew + subLength)
      )
    );
  }

  // this function essentially performs and applies a rudimentary diff between a
  // previously parsed set of mappings and between a new gabc source text.
  // the mappings array passed in is changed in place to be updated from the
  // new source
  /**
   * Updates mappings in place to match newGabcSource, and returns the length
   * of newGabcSource's header.
   */
  static updateMappingsFromSource(
    ctxt: ChantContext,
    mappings: ChantMapping[],
    newGabcSource: string,
    insertionIndex: number | null = null,
    oldInsertionIndex: number | null = null
  ): number {
    var headerLength = GabcHeader.getLength(newGabcSource);
    var nabcLines = this.getNabcLines(newGabcSource, headerLength);
    newGabcSource = newGabcSource.slice(headerLength);
    if (nabcLines !== ctxt.nabcLines) {
      // a | means something else now, so every word is parsed anew
      ctxt.nabcLines = nabcLines;
      mappings.splice(0);
    }
    // always remove the last old mapping since it's spacing/trailingSpace is handled specially
    mappings.pop();

    // whether each mapping was parsed under a Chi-Rho clef, the only clef under which 0
    // and 9 nudge notes, so that a mapping that is now under another kind of clef can be
    // parsed again (the default clef is a do clef)
    var parsedUnderChiRho = new Map<ChantMapping, boolean>();
    var underChiRho = false;
    for (const oldMapping of mappings) {
      parsedUnderChiRho.set(oldMapping, underChiRho);
      for (const notation of oldMapping.notations)
        if (notation.isClef) underChiRho = notation instanceof ChiRhoClef;
    }

    if (insertionIndex === null) {
      insertionIndex = NaN;
    }
    if (oldInsertionIndex === null) {
      oldInsertionIndex = NaN;
    }

    var newWords = this.splitWords(newGabcSource);

    // the last word is always parsed anew, since its old mapping was removed above. Leaving
    // it out of the diff lets the diff skip over the unchanged words at the end.
    var results = this.diffDescriptorsAndNewWords(
      mappings,
      newWords.slice(0, -1)
    );
    if (newWords.length) {
      var lastResult = results[results.length - 1];
      if (lastResult && lastResult[0] === "+")
        lastResult[1] = (lastResult[1] as string[]).concat(newWords.slice(-1));
      else results.push(["+", newWords.slice(-1)]);
    }

    var index = 0,
      j,
      k,
      l,
      sourceIndex = 0,
      wordLength = 0,
      mapping: ChantMapping,
      elementIndex = 0;

    ctxt.activeClef = Clef.default();
    // the default clef is shared, so forget any accidental the last chant left on it
    ctxt.activeClef.resetAccidentals();
    delete this.needToEndBrace;

    // apply the results to the mappings, marking notations that need to be processed
    var lastTranslationNeumes: ChantNotationElement[] = [];
    for (var i = 0; i < results.length; i++) {
      var resultCode = results[i][0];
      // (the words kept or added, or the mappings deleted, of which only the number is used)
      var resultValues = results[i][1] as string[];

      if (index > 0)
        sourceIndex =
          mappings[index - 1].sourceIndex +
          mappings[index - 1].source.length +
          1;
      if (resultCode === "=") {
        var sourceIndexDiff = sourceIndex - mappings[index].sourceIndex;
        // skip over ones that haven't changed, but updating the clef and source
        // index (and pitch in case clef or accidentals have changed) as we go
        for (j = 0; j < resultValues.length; j++, index++) {
          mapping = mappings[index];
          if (
            elementIndex === 0 &&
            mapping.notations.length &&
            mapping.notations[0].isClef
          ) {
            // the first clef doesn't get kept as a notation:
            elementIndex = -1;
          }
          if (
            insertionIndex >= elementIndex ||
            oldInsertionIndex >= elementIndex
          ) {
            // check if the insertion index is within this mapping:
            let elementCount = elementCountForNotations(mapping.notations);
            if (
              (insertionIndex >= elementIndex &&
                insertionIndex < elementIndex + elementCount) ||
              (oldInsertionIndex >= elementIndex &&
                oldInsertionIndex < elementIndex + elementCount)
            ) {
              // re-do this mapping:
              // TODO: check sourceIndex
              let sourceIndex = mapping.sourceIndex + sourceIndexDiff;
              mapping = this.createMappingFromWord(
                ctxt,
                resultValues[j],
                sourceIndex,
                lastTranslationNeumes,
                insertionIndex - elementIndex
              );
              mappings.splice(index, 1, mapping);

              elementIndex += elementCount;
              continue;
            }
            elementIndex += elementCount;
          }
          if (
            parsedUnderChiRho.get(mapping) !==
            ctxt.activeClef instanceof ChiRhoClef
          ) {
            // the kind of clef has changed, and with it whether 0 and 9 nudge the notes
            mapping = this.createMappingFromWord(
              ctxt,
              resultValues[j],
              mapping.sourceIndex + sourceIndexDiff,
              lastTranslationNeumes
            );
            mappings.splice(index, 1, mapping);
            continue;
          }
          mapping.sourceIndex += sourceIndexDiff;
          for (k = 0; k < mapping.notations.length; k++) {
            var curNotation = mapping.notations[k];
            // notify the notation that its dependencies are no longer valid
            curNotation.resetDependencies();

            // new words reset the accidentals where createMappingFromWord did
            if (curNotation.resetsAccidentalsBefore)
              ctxt.activeClef.resetAccidentals();

            if (curNotation.isClef) {
              ctxt.activeClef = mappings[index].notations[k] as Clef;
              // a fresh clef starts out with its default accidental, rather
              // than with whatever accidental was active when it was last used
              ctxt.activeClef.resetAccidentals();
            }

            if (curNotation.isAccidental) {
              (curNotation as Signs.Accidental).pitch = ctxt.activeClef.staffPositionToPitch(
                (curNotation as Signs.Accidental).staffPosition
              );
              ctxt.activeClef.activeAccidental = curNotation as Signs.Accidental;
            } else if (curNotation.resetsAccidentals) {
              ctxt.activeClef.resetAccidentals();
            }

            // update source index, pitch, and automatic braces
            if (curNotation.notes) {
              for (l = 0; l < curNotation.notes.length; ++l) {
                let note = curNotation.notes[l];
                note.sourceIndex += sourceIndexDiff;
                note.pitch = ctxt.activeClef.staffPositionToPitch(note.staffPosition);
                if (note.braceEnd && note.braceEnd.automatic)
                  delete note.braceEnd;
                if (this.needToEndBrace && !note.braceStart && !note.braceEnd) {
                  note.braceEnd = new Markings.BracePoint(
                    note,
                    this.needToEndBrace.isAbove,
                    this.needToEndBrace.shape,
                    this.needToEndBrace.attachment ===
                    Markings.BraceAttachment.Left
                      ? Markings.BraceAttachment.Right
                      : Markings.BraceAttachment.Left
                  );
                  note.braceEnd.automatic = true;
                  delete this.needToEndBrace;
                } else if (note.braceStart && note.braceStart.automatic) {
                  this.needToEndBrace = note.braceStart;
                }
              }
            }
            if (curNotation.translationText) {
              for (l = 0; l < curNotation.translationText.length; ++l) {
                let transText = curNotation.translationText[l];
                delete transText.endNeume;
                curNotation.translationText[l].sourceIndex += sourceIndexDiff;
                if (
                  transText.textAnchor === "end" &&
                  lastTranslationNeumes[0]
                ) {
                  let lastTranslationText =
                    lastTranslationNeumes[0].translationText![l];
                  if (lastTranslationText)
                    lastTranslationText.endNeume = curNotation;
                }
              }
              lastTranslationNeumes[0] = curNotation;
            }
            if (sourceIndexDiff) {
              if (typeof curNotation.sourceIndex === "number") {
                curNotation.sourceIndex += sourceIndexDiff;
              }
              for (l = 0; l < curNotation.lyrics.length; ++l) {
                curNotation.lyrics[l].sourceIndex += sourceIndexDiff;
              }
              if (curNotation.alText) {
                for (l = 0; l < curNotation.alText.length; ++l) {
                  curNotation.alText[l].sourceIndex += sourceIndexDiff;
                }
              }
            }
          }
        }
      } else if (resultCode === "-") {
        // delete elements that no longer exist, but first notify all
        // elements of the change
        mappings.splice(index, resultValues.length);
      } else if (resultCode === "+") {
        // insert new ones
        for (j = 0; j < resultValues.length; j++) {
          wordLength = resultValues[j].length + 1;
          // like createMappingsFromWords, skip the empty word that trailing
          // whitespace leaves at the end of the source
          if (isEmptyWord(resultValues[j])) {
            sourceIndex += wordLength;
            continue;
          }
          mapping = this.createMappingFromWord(
            ctxt,
            resultValues[j],
            sourceIndex,
            lastTranslationNeumes,
            insertionIndex - elementIndex
          );

          if (
            elementIndex === 0 &&
            mapping.notations.length &&
            mapping.notations[0].isClef
          ) {
            // the first clef doesn't get kept as a notation:
            elementIndex = -1;
            let elementCount = elementCountForNotations(mapping.notations);
            if (insertionIndex < elementCount) {
              // re-do the first mapping, because it was broken up incorrectly, due to the presence of the initial clef
              mapping = this.createMappingFromWord(
                ctxt,
                resultValues[j],
                sourceIndex,
                lastTranslationNeumes,
                insertionIndex - elementIndex
              );
            }
          }

          for (k = 0; k < mapping.notations.length; k++) {
            let curNotation = mapping.notations[k];
            elementIndex += curNotation.notes ? curNotation.notes.length : 1;
            if (curNotation.isClef) {
              ctxt.activeClef = mapping.notations[k] as Clef;
            }
          }

          mappings.splice(index++, 0, mapping);
          sourceIndex += wordLength;
        }
      }
    }

    // always set the last notation to have a trailingSpace of 0. This makes layout for the last chant line simpler
    if (
      mappings.length > 0 &&
      mappings[mappings.length - 1].notations.length > 0
    )
      mappings[mappings.length - 1].notations[
        mappings[mappings.length - 1].notations.length - 1
      ].trailingSpace = 0;

    return headerLength;
  }

  // takes an array of gabc words (like that returned by splitWords below)
  // and returns an array of ChantMapping objects, one for each word.
  static createMappingsFromWords(ctxt: ChantContext, words: string[]) {
    var mappings: ChantMapping[] = [];
    var sourceIndex = 0,
      wordLength = 0,
      lastTranslationNeumes: ChantNotationElement[] = [];

    for (var i = 0; i < words.length; i++) {
      sourceIndex += wordLength;
      wordLength = words[i].length + 1;
      var word = words[i].trim();

      if (isEmptyWord(word)) continue;

      var mapping = this.createMappingFromWord(
        ctxt,
        word,
        sourceIndex,
        lastTranslationNeumes
      );

      if (mapping) mappings.push(mapping);
    }

    return mappings;
  }

  // takes a gabc word (like those returned by splitWords below) and returns
  // a ChantMapping object that contains the gabc word source text as well
  // as the generated notations.
  static createMappingFromWord(
    ctxt: ChantContext,
    word: string,
    sourceIndex: number,
    lastTranslationNeumes: ChantNotationElement[],
    insertionIndex?: number
  ) {
    var matches: RegExpExecArray[] = [];
    var notations: ChantNotationElement[] = [];
    var currSyllable = 0;
    // (a word from splitWords() is masked already, and masking it again changes nothing)
    word = maskGabc(word);
    // whether the accidentals were reset since the last notation parsed
    var resetAccidentals = false;

    var syllableMatch: RegExpExecArray | null;
    while ((syllableMatch = __syllablesRegex.exec(word))) matches.push(syllableMatch);

    // Gregorio's controls after the word's last notes, with no notes of their
    // own, like the closing tags that splitWords() leaves with the word they
    // end ("son.(f)</nlba> Chri(f)"), belong to its last notation
    var trailingAreas: SyllableAreas = {};
    var lastMatch = matches[matches.length - 1];
    if (
      lastMatch &&
      lastMatch[2] === undefined &&
      readSyllableControls(lastMatch[1].replace(__commentMaskRegex, ""), trailingAreas) === ""
    )
      matches.pop();
    else trailingAreas = {};

    for (var j = 0; j < matches.length; j++) {
      var match = matches[j];

      var lyricText = match[1].replace(__commentMaskRegex, "").replace(
        /(^|<\/sp>)([\s\S]*?)($|<sp>)/g,
        (_, pre, main, post) => `${pre}${main.replace(/~/g, " ")}${post}`
      );
      var alText: AboveLinesText[] = [];
      var translationText: TranslationText[] = [];
      var notationData = match[2];

      // Gregorio's controls, which aren't printed: <eu> and <nlba> start or
      // end areas at the syllable's notations (and are taken out of the text
      // below), and createSyllableLyrics() reads <clear> and <pr>
      var areas: SyllableAreas = {};
      var printedText = readSyllableControls(lyricText, areas);
      if (printedText === "") lyricText = "";

      // new words reset the accidentals, per the Solesmes style (see LU xviij)
      // but we need to also make sure that there _is_ a word and that it has notes associated with it.
      if (
        currSyllable === 0 &&
        /[a-z]/i.test(printedText) &&
        /[a-n]/i.test(notationData)
      ) {
        ctxt.activeClef.resetAccidentals();
        resetAccidentals = true;
      }

      var notationsSourceIndex = sourceIndex + match.index + match[1].length + 1;
      // Gregorio's NABC, which is kept on the notations (see splitNabc())
      var nabc =
        ctxt.nabcLines > 0 && notationData && notationData.includes("|")
          ? this.splitNabc(notationData, ctxt.nabcLines)
          : null;
      var items = this.parseNotations(
        ctxt,
        nabc ? (isEmptyWord(nabc.gabc) ? "" : nabc.gabc) : notationData,
        notationsSourceIndex,
        insertionIndex
      );
      if (nabc) {
        for (let part of nabc.parts) {
          // the first notation of the part, or the last one before it
          let partIndex = notationsSourceIndex + part.index;
          let notation =
            items.find((item) => (item.notes ? item.notes[0].sourceIndex : item.sourceIndex!) >= partIndex) ||
            items[items.length - 1];
          if (!notation) continue;
          let notationNabc = (notation.nabc = notation.nabc || []);
          part.nabc.forEach((line, v) => (notationNabc[v] = (notationNabc[v] || "") + line));
        }
        // a / that splitNabc() put in isn't in the source of the note before it
        let notes = ([] as Note[]).concat(...items.map((item) => item.notes || []));
        for (let cut of nabc.cuts) {
          let noteBefore = notes.filter((note) => note.sourceIndex - notationsSourceIndex < cut).pop();
          if (noteBefore && noteBefore.sourceGabc.endsWith("/"))
            noteBefore.sourceGabc = noteBefore.sourceGabc.slice(0, -1);
        }
      }

      if (items.length === 0) continue;
      setAreaBoundaries(items, areas);
      // so that updateMappingsFromSource can reset them at the same point
      if (resetAccidentals) {
        items[0].resetsAccidentalsBefore = true;
        resetAccidentals = false;
      }

      if (insertionIndex! >= 0)
        (insertionIndex as number) -= elementCountForNotations(items);

      items[0].firstOfSyllable = !!printedText;
      items[0].firstOfParentheses = true;
      notations.push(...items);

      // add the lyrics and/or alText to the first notation that makes sense...
      var notationWithLyrics: ChantNotationElement | null = null;
      for (var i = 0; i < items.length; i++) {
        var cne = items[i];

        if (cne.isAccidental && i + 1 < items.length) continue;

        notationWithLyrics = cne;
        break;
      }

      // (exec() of "undefined", which matches nothing, so lastIndex goes back to 0)
      var m = __altTranslationRegex.exec(undefined as unknown as string);
      let indexOffset = 0;
      while ((m = __altTranslationRegex.exec(lyricText))) {
        let index = m.index;
        lyricText =
          lyricText.slice(0, index) + lyricText.slice(index + m[0].length);
        index += sourceIndex + indexOffset + 1;
        if (typeof m[1] === "string") {
          let elem = new AboveLinesText(
            ctxt,
            m[1],
            notationWithLyrics,
            index + 4
          );
          elem.alIndex = alText.push(elem) - 1;
        } else if (typeof m[2] === "string") {
          let elem = new AboveLinesText(
            ctxt,
            m[3],
            notationWithLyrics,
            index + m[2].length
          );
          elem.alIndex = alText.push(elem) - 1;
        } else {
          let elem = new TranslationText(ctxt, m[3], notationWithLyrics, index);
          elem.translationIndex = translationText.push(elem) - 1;
        }
        indexOffset += m[0].length;
        __altTranslationRegex.exec(undefined as unknown as string);
      }
      lyricText = lyricText.replace(__lyricAreaTagRegex, "");
      if (lyricText === "" && alText.length === 0) continue;

      if (notationWithLyrics === null)
        return new ChantMapping(word, notations, sourceIndex);

      if (alText.length) notationWithLyrics.alText = alText;

      if (translationText.length) {
        notationWithLyrics.translationText = translationText;
        for (i = 0; i < translationText.length; ++i) {
          let transText = translationText[i];
          if (transText.textAnchor === "end" && lastTranslationNeumes[0]) {
            let lastTranslationText =
              lastTranslationNeumes[0].translationText![i];
            if (lastTranslationText)
              lastTranslationText.endNeume = notationWithLyrics;
          }
        }
        lastTranslationNeumes[0] = notationWithLyrics;
      }

      if (lyricText === "") continue;

      var proposedLyricType;

      // if it's not a neume or a TextOnly notation, then make the lyrics a directive
      if (!cne!.isNeume && cne!.constructor !== TextOnly)
        proposedLyricType = LyricType.Directive;
      // otherwise trye to guess the lyricType for the first lyric anyway
      else if (currSyllable === 0 && j === matches.length - 1)
        proposedLyricType = LyricType.SingleSyllable;
      else if (currSyllable === 0 && j < matches.length - 1)
        proposedLyricType = LyricType.BeginningSyllable;
      else if (j === matches.length - 1)
        proposedLyricType = LyricType.EndingSyllable;
      else proposedLyricType = LyricType.MiddleSyllable;

      currSyllable++;

      var lyrics = this.createSyllableLyrics(
        ctxt,
        lyricText,
        proposedLyricType,
        notationWithLyrics,
        items,
        sourceIndex + match.index
      );

      if (lyrics === null || lyrics.length === 0) continue;

      notationWithLyrics.lyrics = lyrics;
    }

    if (notations.length) setAreaBoundaries(notations, trailingAreas);

    return new ChantMapping(word, notations, sourceIndex);
  }

  // returns an array of lyrics (an array because each syllable can have multiple lyrics)
  static createSyllableLyrics(
    ctxt: ChantContext,
    text: string,
    proposedLyricType: LyricType,
    notation: ChantNotationElement,
    notations: ChantNotationElement[],
    sourceIndex: number
  ) {
    var lyrics: Lyric[] = [];

    // an extension to gabc: multiple lyrics per syllable can be separated by a |
    var lyricTexts = text.split("|");

    for (var i = 0; i < lyricTexts.length; i++) {
      var lyricText = lyricTexts[i];

      if (i > 0) {
        if (lyricText.match(/\s$/)) {
          lyricText = lyricText.replace(/\s+$/, "");
          proposedLyricType = LyricType.EndingSyllable;
        } else {
          proposedLyricType = LyricType.MiddleSyllable;
        }
      }

      // Gregorio's <clear> and <pr>, which aren't printed (only the first <pr> counts, as in Gregorio)
      var controlsLength = lyricText.length;
      var clear = false;
      var protrusion: LyricProtrusion | undefined;
      lyricText = lyricText
        .replace(__lyricClearRegex, () => {
          clear = true;
          return "";
        })
        .replace(__lyricProtrusionRegex, (tag, factor, index) => {
          if (!protrusion)
            protrusion = { factor: factor ? parseFloat(factor) : undefined, textIndex: index };
          return "";
        });
      controlsLength -= lyricText.length;

      // gabc allows lyrics to indicate the centering part of the text by
      // using braces to indicate how to center the lyric. So a lyric can
      // look like "f{i}re" or "{fenced}" to center on the i or on the entire
      // word, respectively. Here we determine if the lyric should be spaced
      // manually with this method of using braces.
      // however, we don't want to consider any braces inside of v tags, so we
      // do a bit of text processing here:
      var lyricTextWithoutVTags = lyricText;
      const vtagRegex = /<v>[\s\S]*?<\/v>/;
      let match;
      // the lengths of the <v> tags taken out, by where they were
      const vtags: number[] = [];
      while ((match = vtagRegex.exec(lyricTextWithoutVTags))) {
        let index = match.index;
        let length = match[0].length;
        vtags[index] = length;
        lyricTextWithoutVTags = lyricTextWithoutVTags.slice(0, index) + lyricTextWithoutVTags.slice(index + length);
      }
      var centerStartIndex = lyricTextWithoutVTags.indexOf("{");
      var centerLength = 0;

      if (centerStartIndex >= 0) {
        let indexClosingBracket = lyricTextWithoutVTags.indexOf("}");

        if (
          indexClosingBracket >= 0 &&
          indexClosingBracket > centerStartIndex
        ) {
          const getTrueIndex = (indexWithoutVTags: number) => {
            // map indices back to the lyricText with the V tags:
            let accum = 0;
            // (index is a string, which compares with a number as the number it is)
            for (let index in vtags) {
              if (vtags.hasOwnProperty(index) && indexWithoutVTags >= (index as unknown as number)) {
                accum += vtags[index as unknown as number];
              } else {
                break;
              }
            }
            return indexWithoutVTags + accum;
          }
          centerStartIndex = getTrueIndex(centerStartIndex);
          indexClosingBracket = getTrueIndex(indexClosingBracket);
          centerLength = indexClosingBracket - centerStartIndex - 1;

          // strip out the brackets:
          lyricText =
            lyricText.substring(0, centerStartIndex) +
            lyricText.substring(centerStartIndex + 1, indexClosingBracket) +
            lyricText.substring(indexClosingBracket + 1, lyricText.length);
          if (protrusion && protrusion.textIndex > centerStartIndex)
            protrusion.textIndex -= protrusion.textIndex > indexClosingBracket ? 2 : 1;
        } else centerStartIndex = -1; // if there's no closing bracket, don't enable centering
      }

      var lyric = this.makeLyric(
        ctxt,
        lyricText,
        proposedLyricType,
        notation,
        notations,
        sourceIndex
      );

      if (centerStartIndex >= 0) {
        // update indices in case there had been any tags, etc.
        let textIndex = 0,
          centerEndIndex = -1;
        for (let span of lyric.spans) {
          if (
            centerStartIndex >= span.index &&
            centerStartIndex <= span.index + span.text.length
          ) {
            centerEndIndex = centerStartIndex + centerLength;
            centerStartIndex += textIndex - span.index;
          }
          if (
            centerEndIndex >= 0 &&
            centerEndIndex >= span.index &&
            centerEndIndex <= span.index + span.text.length
          ) {
            centerEndIndex += textIndex - span.index;
            centerLength = centerEndIndex - centerStartIndex;
            centerEndIndex = -1;
            break;
          }
          textIndex += span.text.length;
        }
        if (centerEndIndex >= 0) {
          centerEndIndex = textIndex;
          centerLength = centerEndIndex - centerStartIndex;
        }
      }

      // if we have manual lyric centering, then set it now
      if (centerStartIndex >= 0) {
        lyric.centerStartIndex = centerStartIndex;
        lyric.centerLength = centerLength;
      }

      if (clear) lyric.clear = true;
      if (protrusion) {
        protrusion.textIndex = lyricTextIndex(ctxt, lyric, protrusion.textIndex);
        lyric.protrusion = protrusion;
      }

      lyric.lyricIndex = lyrics.push(lyric) - 1;
      sourceIndex += lyricText.length + controlsLength + 1;
    }
    notation.lyrics = lyrics;
    return lyrics;
  }

  static makeLyric(
    ctxt: ChantContext,
    text: string,
    lyricType: LyricType,
    notation: ChantNotationElement,
    notations: ChantNotationElement[],
    sourceIndex: number
  ) {
    var elides = false;
    var forceConnector = false;
    var preventConnector = false;
    if (text.length > 1) {
      const lastChar = text.slice(-1);
      if (lastChar === "-") {
        forceConnector = true;
        if (lyricType === LyricType.EndingSyllable)
          lyricType = LyricType.MiddleSyllable;
        else if (lyricType === LyricType.SingleSyllable)
          lyricType = LyricType.BeginningSyllable;

        text = text.slice(0, -1);
      } else if (lastChar === " ") {
        if (lyricType === LyricType.MiddleSyllable)
          lyricType = LyricType.EndingSyllable;
        else if (lyricType === LyricType.BeginningSyllable)
          lyricType = LyricType.SingleSyllable;

        text = text.slice(0, -1);
      } else if (["—", "–"].includes(lastChar)) {
        // an em dash or en dash remains part of the syllable text and prevents a
        // connecting hyphen from ever being drawn before the next syllable,
        // but the syllables are still laid out as part of a single word
        preventConnector = true;
      } else if (/<\/i>$/.test(text)) {
        // must be an elision
        elides = true;
      }
    }

    if (text.match(/^(?:[*†]+|i+j|\d+)\.?$/)) lyricType = LyricType.Directive;

    var lyric = new Lyric(
      ctxt,
      text,
      lyricType,
      notation,
      notations,
      sourceIndex
    );
    lyric.elidesToNext = elides;
    if (forceConnector) lyric.setForceConnector(true);
    if (preventConnector) lyric.setPreventConnector(true);

    return lyric;
  }

  // takes a string of gabc notations and creates exsurge objects out of them.
  // returns an array of notations.
  static parseNotations(
    ctxt: ChantContext,
    data: string,
    sourceIndex: number,
    insertionIndex?: number
  ): ChantNotationElement[] {
    // if there is no data, then this must be a text only object
    if (!data) return [new TextOnly(sourceIndex, 0)];

    var baseSourceIndex = sourceIndex;
    var sourceLength = 0;
    var notations: ChantNotationElement[] = [];
    var notes: Note[] = [];
    var trailingSpace: TrailingSpace = DefaultTrailingSpace;
    // whether the data so far ends with a / or a space after a neume
    var endsWithSpace = false;
    // what Gregorio's [[, <nlba> and @[ (and a </nlba> before any note) mark on the next note
    var nextNoteMarks: ((note: Note) => void)[] = [];
    // the space before the next note, where a mark between notes ends the neume
    var spaceBeforeNextNote: TrailingSpace | null = null;

    // the last note before a mark, if any (the marks after it are recorded on it)
    var lastNote = () => {
      if (notes.length) return notes[notes.length - 1];
      for (let i = notations.length - 1; i >= 0; i--) {
        let notationNotes = notations[i].notes;
        if (notationNotes && notationNotes.length)
          return notationNotes[notationNotes.length - 1];
      }
      return null;
    };

    var addToLastSourceGabc = (gabc: string) => {
      if (notes.length > 0) {
        notes[notes.length - 1].sourceGabc += gabc;
      }
    };
    var addNotation = (notation: ChantNotationElement | null) => {
      // first, if we have any notes left over, we create a neume out of them
      if (notes.length > 0) {
        // create neume(s)
        var neumes = this.createNeumesFromNotes(ctxt, notes, trailingSpace);
        for (var i = 0; i < neumes.length; i++) notations.push(neumes[i]);

        notes = [];
      }

      // reset the trailing space
      trailingSpace = DefaultTrailingSpace;

      // then, if we're passed a notation, let's add it
      // also, perform chant logic here
      if (notation !== null) {
        let prevNotation = notations[notations.length - 1];
        notation.sourceIndex = sourceIndex;
        notation.sourceGabc = match![0];
        if (notation.isClef) {
          ctxt.activeClef = notation as Clef;
          if (
            prevNotation &&
            (prevNotation.trailingSpace as TrailingSpaceFunction).isDefault &&
            prevNotation.isDivider
          ) {
            prevNotation.trailingSpace = TrailingSpaceForAccidental;
          }
        } else if (notation.isAccidental) {
          ctxt.activeClef.activeAccidental = notation as Signs.Accidental;
        } else if (
          (notation.trailingSpace as TrailingSpaceFunction).isDefault &&
          notation instanceof Signs.Custos
        ) {
          notation.trailingSpace = TrailingSpaceForAccidental;
        } else if (notation.resetsAccidentals)
          ctxt.activeClef.resetAccidentals();

        notations.push(notation);
      }
    };

    var regex = new RegExp(__notationsRegex);
    var match: RegExpExecArray | null;

    while ((match = regex.exec(data))) {
      sourceIndex = baseSourceIndex + match.index;
      sourceLength = match[0].length;
      var atom = match[0];
      var bar = match[__notationsRegex_group_bar];

      let barWithCarryover = !!bar && bar.endsWith('_');
      if (barWithCarryover) {
        atom = atom.slice(0, -1);
      }

      if (atom === " " || atom[0] === "/")
        endsWithSpace = endsWithSpace || notes.length > 0;
      else if (!__noteMarkRegex.test(atom)) endsWithSpace = false;

      // handle the clefs and dividers here
      switch (atom) {
        case ",":
          addNotation(new Signs.QuarterBar(barWithCarryover));
          break;
        case "`":
          addNotation(new Signs.Virgula(barWithCarryover));
          break;
        case ";":
          addNotation(new Signs.HalfBar(barWithCarryover));
          break;
        case ";1":
        case ";2":
        case ";3":
        case ";4":
        case ";5":
        case ";6":
        case ";7":
        case ";8":
        case ",1":
        case ",2":
        case ",3":
        case ",4":
        case ",5":
        case ",6":
        case ",7":
        case ",8":
          addNotation(new Signs.DominicanBar(parseInt(atom[1], 10)));
          break;
        case ":":
          addNotation(new Signs.FullBar(barWithCarryover));
          break;
        case "::":
          addNotation(new Signs.DoubleBar());
          break;
        // other gregorio dividers are not supported yet

        case "c1":
        case "c2":
        case "c3":
        case "c4":
        case "c5":
          addNotation((ctxt.activeClef = new DoClef(2 * parseInt(atom[1], 10) - 1, 2)));
          break;
        case "f1":
        case "f2":
        case "f3":
        case "f4":
        case "f5":
          addNotation((ctxt.activeClef = new FaClef(2 * parseInt(atom[1], 10) - 1, 2)));
          break;
        case "treble1":
        case "treble2":
        case "treble3":
        case "treble4":
        case "treble5":
        case "treble-1":
        case "treble-2":
        case "treble-3":
        case "treble-4":
        case "treble-5":
          addNotation((ctxt.activeClef = new TrebleClef(2 * parseInt(atom.slice(-1), 10) - 1, 2, null, atom[6] === '-')));
          break;
        case "xp1":
        case "xp2":
        case "xp3":
        case "xp4":
        case "xp5":
        case "xp-1":
        case "xp-2":
        case "xp-3":
        case "xp-4":
        case "xp-5":
          addNotation((ctxt.activeClef = new ChiRhoClef(2 * parseInt(atom.slice(-1), 10) - 1, 2, null, atom.slice(-2, -1) === '-')));
          break;
        case "cb1":
        case "cb2":
        case "cb3":
        case "cb4":
        case "cb5":
          {
            const line = 2 * parseInt(atom[2], 10) - 1;
            addNotation(
              (ctxt.activeClef = new DoClef(
                line,
                2,
                new Signs.Accidental(line - 1, Signs.AccidentalType.Flat)
              ))
            );
          }
          break;

        case "z":
          addNotation(new ChantLineBreak(true));
          break;
        case "Z":
          addNotation(new ChantLineBreak(false));
          break;
        case "z0":
          addNotation(new Signs.Custos(true));
          break;

        // Gregorio's marks between notes, which are recorded on the notes
        // after or before them.  Brackets end a neume as ! does, and
        // no-line-break areas as / does, as they end Gregorio's glyphs and
        // elements, so that their marks are where neumes start or end.
        case "[[":
          nextNoteMarks.push((note) => (note.bracketStart = true));
          if (spaceBeforeNextNote === null) spaceBeforeNextNote = 0;
          break;
        case "]]": {
          let note = lastNote();
          if (note) note.bracketEnd = true;
          if (spaceBeforeNextNote === null) spaceBeforeNextNote = 0;
          break;
        }
        case "<nlba>":
          nextNoteMarks.push((note) => (note.noLineBreak = { ...note.noLineBreak, start: true }));
          spaceBeforeNextNote = TrailingSpaceMultiple(1);
          break;
        case "</nlba>": {
          // (at the start of the notes, the area ends at the first note instead)
          let markEnd = (note: Note) => (note.noLineBreak = { ...note.noLineBreak, end: true });
          let note = lastNote();
          if (note) markEnd(note);
          else nextNoteMarks.push(markEnd);
          spaceBeforeNextNote = TrailingSpaceMultiple(1);
          break;
        }
        case "@[":
          nextNoteMarks.push((note) => (note.autoFusion = { ...note.autoFusion, start: true }));
          break;
        case "]": {
          let note = lastNote();
          if (note) note.autoFusion = { ...note.autoFusion, end: true };
          break;
        }

        // spacing indicators
        case "!":
          trailingSpace = 0;
          addToLastSourceGabc(atom);
          addNotation(null);
          break;
        case " ":
          // fixme: is this correct? logically what is the difference in gabc
          // between putting a space between notes vs putting '//' between notes?
          trailingSpace = TrailingSpaceMultiple(2);
          addToLastSourceGabc(atom);
          addNotation(null);
          break;

        default:
          // might be a number of slashes, a custos, might be an accidental, or might be a note
          if (atom[0] === "/") {
            let prevNotation = notations[notations.length - 1];
            if (
              !notes.length &&
              data[match.index - 1] === "!" &&
              prevNotation &&
              prevNotation.isNeume
            ) {
              // !/ is a space that can't be broken: the neume before it
              // already keeps with the next one, so it only needs the width
              prevNotation.trailingSpace = TrailingSpaceMultiple(atom.length);
            }
            trailingSpace = TrailingSpaceMultiple(atom.length);
            addToLastSourceGabc(atom);
            addNotation(null);
          } else if (atom.length > 1 && atom.endsWith("+")) {
            // custos
            var custos = new Signs.Custos();

            this.setStaffPositionAndOffset(custos, atom, ctxt.activeClef);

            addNotation(custos);
          } else if (atom.length > 1 && /[xXyY#]/.test(atom[1])) {
            var accidentalType;

            switch (atom[1]) {
              case "y":
              case "Y":
                accidentalType = Signs.AccidentalType.Natural;
                break;
              case "#":
                accidentalType = Signs.AccidentalType.Sharp;
                break;
              default:
                accidentalType = Signs.AccidentalType.Flat;
                break;
            }

            var noteArray: Note[] = [];
            this.createNoteFromData(
              ctxt,
              ctxt.activeClef,
              atom,
              noteArray,
              sourceIndex
            );
            // X, Y, and ## are Gregorio's soft flat, natural, and sharp
            var accidental = new Signs.Accidental(
              noteArray[0].staffPosition,
              accidentalType,
              /^.(?:[XY]|##)/.test(atom)
            );
            if (atom[2] === "?") accidental.parenthesized = true;
            accidental.pitch = ctxt.activeClef.staffPositionToPitch(noteArray[0].staffPosition);
            accidental.sourceIndex = sourceIndex;
            accidental.sourceLength = sourceLength;
            accidental.trailingSpace = TrailingSpaceForAccidental;

            ctxt.activeClef.activeAccidental = accidental;

            addNotation(accidental);
          } else if (atom.length > 1 && atom[0] === "{") {
            trailingSpace = 0;
            addNotation(null);
            let bracketedNotations = this.parseNotations(
              ctxt,
              match[__notationsRegex_group_insideBraces],
              sourceIndex + 1
            );
            // Set the width of these notations to 0
            bracketedNotations.forEach(neume => {
              neume.hasNoWidth = true;
              neume.firstWithNoWidth = bracketedNotations[0];
            });
            notations.push(...bracketedNotations);
          } else {
            // looks like it's a note
            if (spaceBeforeNextNote !== null) {
              if (notes.length) {
                trailingSpace = spaceBeforeNextNote;
                addNotation(null);
              }
              spaceBeforeNextNote = null;
            }
            if (insertionIndex === -1) {
              trailingSpace = TrailingSpaceMultiple(1);
              addNotation(null);
            }
            let firstNewNote = notes.length;
            this.createNoteFromData(
              ctxt,
              ctxt.activeClef,
              atom,
              notes,
              sourceIndex
            );
            for (let mark of nextNoteMarks) mark(notes[firstNewNote]);
            nextNoteMarks = [];
            --insertionIndex!;
          }
          break;
      }
    }

    // finish up any remaining notes we have left
    addNotation(null);

    // a no-line-break area that starts or ends in the notes starts or ends at their notation
    for (let notation of notations) {
      for (let note of notation.notes || []) {
        if (note.noLineBreak)
          notation.noLineBreak = { ...notation.noLineBreak, ...note.noLineBreak };
      }
    }

    // a / or a space at the very end spaces the last neume from the next
    // syllable's, but the line can still break between them as usual
    if (endsWithSpace) {
      let lastNotation = notations[notations.length - 1];
      lastNotation.keepWithNext = false;
      lastNotation.allowLineBreakBeforeNext = false;
    }

    return notations;
  }

  static createNeumesFromNotes(
    ctxt: ChantContext,
    notes: Note[],
    finalTrailingSpace: TrailingSpace
  ) {
    var neumes: Neumes.Neume[] = [];
    var firstNoteIndex = 0;
    var currNoteIndex = 0;

    // here we use a simple finite state machine to create the neumes from the notes
    // createNeume is helper function which returns the next state after a neume is created
    // (unknownState). Each state object has a neume() function and a handle() function.
    // neume() allows us to create the neume of the state in the event that we run out
    // of notes. handle() gives the state an opportunity to examine the currNote and
    // determine what to do...either transition to a different neume/state, or
    // continue building the neume of that state. handle() returns the next state

    var createNeume = function(
      neume: Neumes.Neume,
      includeCurrNote: boolean,
      includePrevNote = true
    ): NeumeState {
      // add the notes to the neume
      var lastNoteIndex;
      if (includeCurrNote) lastNoteIndex = currNoteIndex;
      else if (includePrevNote) lastNoteIndex = currNoteIndex - 1;
      else lastNoteIndex = currNoteIndex - 2;

      // (which leaves no state to go on to)
      if (lastNoteIndex < 0) return undefined as unknown as NeumeState;

      while (firstNoteIndex <= lastNoteIndex) {
        let note = notes[firstNoteIndex++];
        neume.addNote(note);
        if (note.alText) {
          if (!neume.alText) neume.alText = [];
          neume.alText.push(note.alText);
          note.alText.noteIndex = firstNoteIndex - 1;
        }
      }

      neumes.push(neume);

      if (includeCurrNote === false) {
        currNoteIndex--;

        if (includePrevNote === false) currNoteIndex--;

        neume.keepWithNext = true;
        if (notes[currNoteIndex + 1].shape === NoteShape.Quilisma)
          neume.trailingSpace = 0;
        else {
          neume.trailingSpace = TrailingSpaceMultiple(1);
          neume.allowLineBreakBeforeNext = true;
        }
      }

      return unknownState;
    };

    var unknownState: NeumeState = {
      neume: function() {
        return new Neumes.Punctum();
      },
      handle: function(currNote, prevNote) {
        if (currNote.shape === NoteShape.Virga) return virgaState;
        else if (currNote.shape === NoteShape.Stropha) return apostrophaState;
        else if (currNote.shape === NoteShape.Oriscus) return oriscusState;
        else if (currNote.shape === NoteShape.Inclinatum)
          return punctaInclinataState;
        else if (currNote.shapeModifiers & NoteShapeModifiers.Cavum)
          return createNeume(new Neumes.Punctum(), true);
        else return punctumState;
      }
    };

    var punctumState: NeumeState = {
      neume: function() {
        return new Neumes.Punctum();
      },
      handle: function(currNote, prevNote, notesRemaining) {
        if (currNote.shape || prevNote.liquescent === LiquescentType.Small) {
          var neume = new Neumes.Punctum();
          var state = createNeume(neume, false);
          // if the current note is on a space within the staff AND the previous note is on the line below AND the previous note has a mora,
          // then we went the trailing space at its default of intraNeumeSpacing to prevent the dot from running up into the current note.
          // Otherwise, we want no trailing space.
          if (
            currNote.staffPosition > prevNote.staffPosition &&
            (currNote.staffPosition % 2 === 1 ||
              prevNote.staffPosition !== currNote.staffPosition - 1 ||
              !prevNote.morae ||
              prevNote.morae.length === 0)
          )
            neume.trailingSpace = 0;
          return state;
        }

        if (currNote.staffPosition > prevNote.staffPosition) {
          if (currNote.ictus)
            currNote.ictus.positionHint = MarkingPositionHint.Above;
          return podatusState;
        } else if (currNote.staffPosition < prevNote.staffPosition) {
          if (prevNote.ictus)
            prevNote.ictus.positionHint = MarkingPositionHint.Above;
          // (TypeScript thinks the shape must be 0 by now, from the check above)
          if ((currNote.shape as NoteShape) === NoteShape.Inclinatum) return climacusState;
          else {
            return clivisState;
          }
        } else if (!prevNote.morae || !prevNote.morae.length) {
          return distrophaState;
        }
        return createNeume(new Neumes.Punctum(), false);
      }
    };

    var punctaInclinataState: NeumeState = {
      neume: function() {
        return new Neumes.PunctaInclinata();
      },
      handle: function() {
        if (currNote.shape !== NoteShape.Inclinatum)
          return createNeume(new Neumes.PunctaInclinata(), false);
        else return punctaInclinataState;
      }
    };

    var oriscusState: NeumeState = {
      neume: function() {
        return new Neumes.Oriscus();
      },
      handle: function(currNote, prevNote) {
        if (currNote.shape === NoteShape.Default) {
          if (currNote.staffPosition > prevNote.staffPosition) {
            prevNote.shapeModifiers |= NoteShapeModifiers.Ascending;
            return createNeume(new Neumes.PesQuassus(), true);
          } else if (currNote.staffPosition < prevNote.staffPosition) {
            prevNote.shapeModifiers |= NoteShapeModifiers.Descending;
            return createNeume(new Neumes.Clivis(), true);
          }
        }
        // stand alone oriscus
        var neume = new Neumes.Oriscus(),
          state = createNeume(neume, false);
        // if the current note is on a space within the staff AND the previous note is on the line below AND the previous note has a mora,
        // then we went the trailing space at its default of intraNeumeSpacing to prevent the dot from running up into the current note.
        // Otherwise, we want no trailing space.
        if (
          currNote.staffPosition > prevNote.staffPosition &&
          (currNote.staffPosition % 2 === 1 ||
            prevNote.staffPosition !== currNote.staffPosition - 1 ||
            !prevNote.morae ||
            prevNote.morae.length === 0)
        )
          neume.trailingSpace = 0;
        return state;
      }
    };

    var podatusState: NeumeState = {
      neume: function() {
        return new Neumes.Podatus();
      },
      handle: function(currNote, prevNote) {
        if (currNote.staffPosition > prevNote.staffPosition) {
          if (currNote.ictus)
            currNote.ictus.positionHint = MarkingPositionHint.Above;
          if (prevNote.ictus)
            prevNote.ictus.positionHint = MarkingPositionHint.Below;

          if (prevNote.shape === NoteShape.Oriscus) return salicusState;
          else return scandicusState;
        } else if (currNote.staffPosition < prevNote.staffPosition) {
          if (currNote.shape === NoteShape.Inclinatum)
            return pesSubpunctisState;
          else return torculusState;
        } else return createNeume(new Neumes.Podatus(), false);
      }
    };

    var clivisState: NeumeState = {
      neume: function() {
        return new Neumes.Clivis();
      },
      handle: function(currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Default &&
          currNote.staffPosition > prevNote.staffPosition
        ) {
          if (currNote.ictus)
            currNote.ictus.positionHint = MarkingPositionHint.Above;
          return porrectusState;
        } else if (
          currNote.staffPosition < prevNote.staffPosition &&
          currNote.liquescent & LiquescentType.Small
        ) {
          return createNeume(new Neumes.Ancus(), true);
        } else {
          return createNeume(new Neumes.Clivis(), false);
        }
      }
    };

    var climacusState: NeumeState = {
      neume: function() {
        return new Neumes.Climacus();
      },
      handle: function(currNote, prevNote) {
        if (currNote.shape !== NoteShape.Inclinatum)
          return createNeume(new Neumes.Climacus(), false);
        else return state;
      }
    };

    var porrectusState: NeumeState = {
      neume: function() {
        return new Neumes.Porrectus();
      },
      handle: function(currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Default &&
          currNote.staffPosition < prevNote.staffPosition
        )
          return createNeume(new Neumes.PorrectusFlexus(), true);
        else return createNeume(new Neumes.Porrectus(), false);
      }
    };

    var pesSubpunctisState: NeumeState = {
      neume: function() {
        return new Neumes.PesSubpunctis();
      },
      handle: function(currNote, prevNote) {
        if (currNote.shape !== NoteShape.Inclinatum)
          return createNeume(new Neumes.PesSubpunctis(), false);
        else return state;
      }
    };

    var salicusState: NeumeState = {
      neume: function() {
        return new Neumes.Salicus();
      },
      handle: function(currNote, prevNote) {
        if (currNote.staffPosition < prevNote.staffPosition)
          return salicusFlexusState;
        else return createNeume(new Neumes.Salicus(), false);
      }
    };

    var salicusFlexusState: NeumeState = {
      neume: function() {
        return new Neumes.SalicusFlexus();
      },
      handle: function(currNote, prevNote) {
        return createNeume(new Neumes.SalicusFlexus(), false);
      }
    };

    var scandicusState: NeumeState = {
      neume: function() {
        return new Neumes.Scandicus();
      },
      handle: function(currNote, prevNote) {
        if (
          prevNote.shape === NoteShape.Virga &&
          currNote.shape === NoteShape.Inclinatum &&
          currNote.staffPosition < prevNote.staffPosition
        ) {
          // if we get here, then it seems we have a podatus, now being followed by a climacus
          // rather than a scandicus. react accordingly
          return createNeume(new Neumes.Podatus(), false, false);
        } else if (
          currNote.shape === NoteShape.Default &&
          currNote.staffPosition < prevNote.staffPosition
        )
          return scandicusFlexusState;
        else return createNeume(new Neumes.Scandicus(), false);
      }
    };

    var scandicusFlexusState: NeumeState = {
      neume: function() {
        return new Neumes.ScandicusFlexus();
      },
      handle: function(currNote, prevNote) {
        return createNeume(new Neumes.ScandicusFlexus(), false);
      }
    };

    var virgaState: NeumeState = {
      neume: function() {
        return new Neumes.Virga();
      },
      handle: function(currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Inclinatum &&
          currNote.staffPosition < prevNote.staffPosition
        )
          return climacusState;
        else if (
          currNote.shape === NoteShape.Virga &&
          currNote.staffPosition === prevNote.staffPosition
        )
          return bivirgaState;
        else return createNeume(new Neumes.Virga(), false);
      }
    };

    var bivirgaState: NeumeState = {
      neume: function() {
        return new Neumes.Bivirga();
      },
      handle: function(currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Virga &&
          currNote.staffPosition === prevNote.staffPosition
        )
          return createNeume(new Neumes.Trivirga(), true);
        else return createNeume(new Neumes.Bivirga(), false);
      }
    };

    var apostrophaState: NeumeState = {
      neume: function() {
        return new Neumes.Apostropha();
      },
      handle: function(currNote, prevNote) {
        if (currNote.staffPosition === prevNote.staffPosition)
          return distrophaState;
        else return createNeume(new Neumes.Apostropha(), false);
      }
    };

    var distrophaState: NeumeState = {
      neume: function() {
        return new Neumes.Distropha();
      },
      handle: function(currNote, prevNote) {
        if (currNote.staffPosition === prevNote.staffPosition) {
          if (prevNote.morae && prevNote.morae.length) {
            return createNeume(new Neumes.Distropha(), false);
          } else {
            return tristrophaState;
          }
        } else return createNeume(new Neumes.Apostropha(), false, false);
      }
    };

    var tristrophaState: NeumeState = {
      neume: function() {
        return new Neumes.Tristropha();
      },
      handle: function(currNote, prevNote) {
        // we only create a tristropha when the note run ends after three
        // and the neume() function of this state is called. Otherwise
        // we always interpret the third note to belong to the next sequence
        // of notes.
        //
        // fixme: gabc allows any number of punctum/stropha in succession...
        // is this a valid neume type? Or is it just multiple *stropha neumes
        // in succession? Should we simplify the apostropha/distropha/
        // tristropha classes to a generic stropha neume that can have 1 or
        // more successive notes?
        return createNeume(new Neumes.Distropha(), false, false);
      }
    };

    var torculusState: NeumeState = {
      neume: function() {
        return new Neumes.Torculus();
      },
      handle: function(currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Default &&
          currNote.staffPosition > prevNote.staffPosition
        ) {
          let prevNoteButOne = notes[currNoteIndex - 2];
          if (
            prevNoteButOne &&
            prevNoteButOne.staffPosition - prevNote.staffPosition <= 4
          ) {
            if (currNote.ictus)
              currNote.ictus.positionHint = MarkingPositionHint.Above;
            return torculusResupinusState;
          }
        }
        return createNeume(new Neumes.Torculus(), false);
      }
    };

    var torculusResupinusState: NeumeState = {
      neume: function() {
        return new Neumes.TorculusResupinus();
      },
      handle: function(currNote, prevNote) {
        if (
          currNote.shape === NoteShape.Default &&
          currNote.staffPosition < prevNote.staffPosition
        )
          return createNeume(new Neumes.TorculusResupinusFlexus(), true);
        else return createNeume(new Neumes.TorculusResupinus(), false);
      }
    };

    var state = unknownState;

    while (currNoteIndex < notes.length) {
      var prevNote = currNoteIndex > 0 ? notes[currNoteIndex - 1] : null;
      var currNote = notes[currNoteIndex];

      // (only the first note has no previous note, and it starts with unknownState, which doesn't use it)
      state = state.handle(
        currNote,
        prevNote!,
        notes.length - 1 - currNoteIndex
      );

      // if we are on the last note, then try to create a neume if we need to.
      if (currNoteIndex === notes.length - 1 && state !== unknownState)
        createNeume(state.neume(), true);

      currNoteIndex++;
    }

    if (neumes.length > 0) {
      if (!(finalTrailingSpace as TrailingSpaceFunction).isDefault) {
        neumes[neumes.length - 1].trailingSpace = finalTrailingSpace;
        neumes[neumes.length - 1].keepWithNext = true;

        // finalTrailingSpace is either 0 or a function of the context
        if (
          typeof finalTrailingSpace === "function"
            ? finalTrailingSpace(ctxt) > 0
            : finalTrailingSpace > 0
        )
          neumes[neumes.length - 1].allowLineBreakBeforeNext = neumes[
            neumes.length - 1
          ].keepWithNext = true;
      }
    }

    return neumes;
  }

  // appends any notes created to the notes array argument
  static createNoteFromData(
    ctxt: ChantContext,
    clef: Clef,
    data: string,
    notes: Note[],
    sourceIndex: number
  ) {
    var note = new Note();
    note.sourceIndex = sourceIndex;
    note.sourceGabc = restoreEscapes(data);

    if (data.length < 1) throw "Invalid note data: " + data;

    if (data[0] === "-") {
      // liquescent initio debilis
      note.liquescent = LiquescentType.InitioDebilis;
      data = data.substring(1);
    } else if (data[0] === "@") {
      // Gregorio's fusion to the note before
      note.fused = true;
      data = data.substring(1);
    }

    if (data.length < 1) throw "Invalid note data: " + data;

    if (data[0] === data[0].toUpperCase()) note.shape = NoteShape.Inclinatum;

    this.setStaffPositionAndOffset(note, data, clef);
    note.pitch = clef.staffPositionToPitch(note.staffPosition);

    var mark;

    var episemaNoteIndex = notes.length;
    var episemaNote = note;

    // process the modifiers
    for (var i = 1; i < data.length; i++) {
      var c = data[i];
      var lookahead = "\0";

      var haveLookahead = i + 1 < data.length;
      if (haveLookahead) lookahead = data[i + 1];

      switch (c) {
        // rhythmic markings
        case ".":
          mark = null;

          // gabc supports putting up to two morae on each note, by repeating the
          // period. here, we check to see if we've already created a mora for the
          // note, and if so, we simply force the second one to have an Above
          // position hint. if a user decides to try to put position indicators
          // on the double morae (such as 1 or 2), then really the behavior is
          // not defined by gabc, so it's on the user to figure it out.
          if (note.morae.length > 0 && notes.length) {
            var previousNote = notes.slice(-1)[0];
            var previousMora = note.morae.slice(-1)[0];
            previousMora.note = previousNote;
          }

          mark = new Markings.Mora(ctxt, note);
          if (haveLookahead && lookahead === "1")
            mark.positionHint = MarkingPositionHint.Above;
          else if (haveLookahead && lookahead === "0")
            mark.positionHint = MarkingPositionHint.Below;

          note.morae.push(mark);
          break;

        case "_":
          var episemaHadModifier = false;

          mark = new Markings.HorizontalEpisema(episemaNote);
          while (haveLookahead) {
            if (lookahead === "0")
              mark.positionHint = MarkingPositionHint.Below;
            else if (lookahead === "1")
              mark.positionHint = MarkingPositionHint.Above;
            else if (lookahead === "2") mark.terminating = true;
            // episema terminates
            else if (lookahead === "3")
              mark.alignment = Markings.HorizontalEpisemaAlignment.Left;
            else if (lookahead === "4")
              mark.alignment = Markings.HorizontalEpisemaAlignment.Center;
            else if (lookahead === "5")
              mark.alignment = Markings.HorizontalEpisemaAlignment.Right;
            else break;

            // the gabc definition for episemata is so convoluted...
            // - double underscores create episemata over multiple notes.
            // - unless the _ has a 0, 1, 3, 4, or 5 modifier, which means
            //   another underscore puts a second episema on the same note
            // - (when there's a 2 lookahead, then this is treated as an
            //   unmodified underscore, so another underscore would be
            //   added to previous notes
            if (
              mark.alignment !== Markings.HorizontalEpisemaAlignment.Default &&
              mark.positionHint !== MarkingPositionHint.Below
            )
              episemaHadModifier = true;

            i++;
            haveLookahead = i + 1 < data.length;

            if (haveLookahead) lookahead = data[i + 1];
          }

          // since gabc allows consecutive underscores which is a shortcut to
          // apply the episemata to previous notes, we keep track of that here
          // in order to add the new episema to the correct note.

          if (episemaNote) episemaNote.episemata.push(mark);

          if (episemaNote === note && episemaHadModifier) episemaNote = note;
          else if (episemaNoteIndex >= 0 && notes.length > 0)
            episemaNote = notes[--episemaNoteIndex];

          break;

        case "'":
          mark = new Markings.Ictus(ctxt, note);
          if (haveLookahead && lookahead === "1")
            mark.positionHint = MarkingPositionHint.Above;
          else if (haveLookahead && lookahead === "0")
            mark.positionHint = MarkingPositionHint.Below;
          else if (note.shape === NoteShape.Virga)
            // ictus on a virga goes above by default:
            mark.positionHint = MarkingPositionHint.Above;

          note.ictus = mark;
          break;
        
        case "|":
          note.inclinataFlags = (note.inclinataFlags || 0) + 1;
          break;

        //note shapes
        case "r":
          if (haveLookahead && /^[0-8]$/.test(lookahead)) {
            switch (lookahead) {
              case "0":
                note.shapeModifiers |= NoteShapeModifiers.Cavum;
                note.shapeModifiers |= NoteShapeModifiers.Linea;
                break;
              case "1":
                note.accent = new Markings.Accent(
                  ctxt,
                  note,
                  GlyphCode.AcuteAccent
                );
                break;
              case "2":
                note.accent = new Markings.Accent(
                  ctxt,
                  note,
                  GlyphCode.GraveAccent
                );
                break;
              case "3":
                note.accent = new Markings.Accent(ctxt, note, GlyphCode.Circle);
                break;
              case "4":
                note.accent = new Markings.Accent(
                  ctxt,
                  note,
                  GlyphCode.Semicircle
                );
                break;
              case "5":
                note.accent = new Markings.Accent(
                  ctxt,
                  note,
                  GlyphCode.ReversedSemicircle
                );
                break;
              // Gregorio's musica ficta
              case "6":
                note.accent = new Markings.MusicaFicta(ctxt, note, GlyphCode.Flat);
                break;
              case "7":
                note.accent = new Markings.MusicaFicta(ctxt, note, GlyphCode.Natural);
                break;
              case "8":
                note.accent = new Markings.MusicaFicta(ctxt, note, GlyphCode.Sharp);
                break;
              default:
            }
            i++;
          } else note.shapeModifiers |= NoteShapeModifiers.Cavum;
          break;
        
        case "R":
          note.shapeModifiers |= NoteShapeModifiers.Linea;
          break;

        case "s":
          if (note.shape === NoteShape.Stropha) {
            // if we're already a stropha, that means this is gabc's
            // quick stropha feature (e.g., gsss). create a new note
            let newNote = new Note();
            newNote.sourceIndex = sourceIndex + i;
            newNote.sourceGabc = "s";
            newNote.staffPosition = note.staffPosition;
            newNote.pitch = note.pitch;
            notes.push(note);
            note = newNote;
            episemaNoteIndex++; // since a new note was added, increase the index here
          }

          note.shape = NoteShape.Stropha;
          break;

        case "v":
          if (note.shape === NoteShape.Virga) {
            // if we're already a stropha, that means this is gabc's
            // quick virga feature (e.g., gvvv). create a new note
            let newNote = new Note();
            newNote.sourceIndex = sourceIndex + i;
            newNote.sourceGabc = "v";
            newNote.staffPosition = note.staffPosition;
            newNote.pitch = note.pitch;
            notes.push(note);
            note = newNote;
            episemaNoteIndex++; // since a new note was added, increase the index here
          }

          note.shape = NoteShape.Virga;
          break;
        
        case "V":
          note.shape = NoteShape.Virga;
          note.shapeModifiers |= NoteShapeModifiers.Reverse;
          break;

        case "w":
          note.shape = NoteShape.Quilisma;
          break;

        // Gregorio's shapes that are read but not drawn yet
        case "W":
          note.quilismaQuadratum = true;
          break;
        case "q":
          note.quadratum = true;
          break;
        case "=":
          note.linea = true;
          break;

        case "o":
          note.shape = NoteShape.Oriscus;
          if (haveLookahead && lookahead === "<") {
            note.shapeModifiers |= NoteShapeModifiers.Ascending;
            i++;
          } else if (haveLookahead && lookahead === ">") {
            note.shapeModifiers |= NoteShapeModifiers.Descending;
            i++;
          }
          break;

        case "O":
          note.shape = NoteShape.Oriscus;
          if (haveLookahead && lookahead === "<") {
            note.shapeModifiers |=
              NoteShapeModifiers.Ascending | NoteShapeModifiers.Stemmed;
            i++;
          } else if (haveLookahead && lookahead === ">") {
            note.shapeModifiers |=
              NoteShapeModifiers.Descending | NoteShapeModifiers.Stemmed;
            i++;
          } else note.shapeModifiers |= NoteShapeModifiers.Stemmed;
          break;

        // liquescents
        case "~":
          if (note.shape === NoteShape.Inclinatum)
            note.liquescent |= LiquescentType.Small;
          else if (note.shape === NoteShape.Oriscus)
            note.liquescent |= LiquescentType.Large;
          else note.liquescent |= LiquescentType.Small;
          break;
        case "<":
          note.liquescent |= LiquescentType.Ascending;
          break;
        case ">":
          note.liquescent |= LiquescentType.Descending;
          break;

        // accidentals
        case "x":
        case "X":
          if (note.pitch!.step === Step.Mi) note.pitch!.step = Step.Me;
          else if (note.pitch!.step === Step.Ti) note.pitch!.step = Step.Te;
          break;
        case "y":
        case "Y":
          if (note.pitch!.step === Step.Te) note.pitch!.step = Step.Ti;
          else if (note.pitch!.step === Step.Me) note.pitch!.step = Step.Mi;
          else if (note.pitch!.step === Step.Du) note.pitch!.step = Step.Do;
          else if (note.pitch!.step === Step.Fu) note.pitch!.step = Step.Fa;
          break;
        case "#":
          if (note.pitch!.step === Step.Do) note.pitch!.step = Step.Du;
          else if (note.pitch!.step === Step.Fa) note.pitch!.step = Step.Fu;
          break;

        // gabc special item groups
        case "[":
          // read in the whole group and parse it
          var startIndex = ++i;
          while (i < data.length && data[i] !== "]") i++;

          this.processInstructionForNote(
            ctxt,
            note,
            data.substring(startIndex, i),
            startIndex
          );
          break;
      }
    }

    if (
      this.needToEndBrace &&
      !note.braceStart &&
      !note.braceEnd &&
      !/[xXyY#]/.test(c!)
    ) {
      note.braceEnd = new Markings.BracePoint(
        note,
        this.needToEndBrace.isAbove,
        this.needToEndBrace.shape,
        this.needToEndBrace.attachment === Markings.BraceAttachment.Left
          ? Markings.BraceAttachment.Right
          : Markings.BraceAttachment.Left
      );
      note.braceEnd.automatic = true;
      delete this.needToEndBrace;
    }

    notes.push(note);
  }

  // an instruction in this context is referring to a special gabc coding found after
  // notes between ['s and ]'s. choral signs and braces fall into this
  // category.
  //
  // currently only brace instructions are supported here!
  static processInstructionForNote(
    ctxt: ChantContext,
    note: Note,
    instruction: string,
    sourceIndexOffset: number
  ) {
    var results = instruction.match(__bracketedCommandRegex);
    if (results === null) return;
    var cmd = results[1];
    var data = results[2];
    switch (cmd) {
      case "cs":
        note.choralSign = new ChoralSign(
          ctxt,
          data,
          note,
          note.sourceIndex + sourceIndexOffset
        );
        return;
      case "alt":
        note.alText = new AboveLinesText(
          ctxt,
          data,
          note,
          note.sourceIndex + sourceIndexOffset
        );
        return;
    }

    results = instruction.match(__braceSpecRegex);

    if (results === null) return;

    // see the comments at the definition of __braceSpecRegex for the
    // capturing groups
    var above = results[1] === "o";
    var shape: Markings.BraceShape = Markings.BraceShape.CurlyBrace; // default

    switch (results[2]) {
      case "b":
        shape = Markings.BraceShape.RoundBrace;
        break;
      case "cb":
        shape = Markings.BraceShape.CurlyBrace;
        break;
      case "cba":
        shape = Markings.BraceShape.AccentedCurlyBrace;
        break;
    }

    var attachmentPoint =
      results[3] === "1"
        ? Markings.BraceAttachment.Left
        : Markings.BraceAttachment.Right;

    if (results[4] === "{" || results[5])
      note.braceStart = new Markings.BracePoint(
        note,
        above,
        shape,
        attachmentPoint
      );
    else
      note.braceEnd = new Markings.BracePoint(
        note,
        above,
        shape,
        attachmentPoint
      );

    // just have the next note end a brace that uses length;
    if (results[5]) {
      note.braceStart!.automatic = true;
      this.needToEndBrace = note.braceStart;
    }
  }

  // takes raw gabc text source and parses it into words. For example, passing
  // in a string of "me(f.) (,) ma(fff)num(d!ewf) tu(fgF'E)am,(f.)" would return
  // an array of four strings: ["me(f.)", "(,)", "ma(fff)num(d!ewf)", "tu(fgF'E)am,(f.)"]
  //
  // Gregorio's comments and escapes are masked (see maskGabc()), so a word can
  // go on after a comment at the end of a line, and "$)" doesn't end one.
  static splitWords(gabcNotations: string) {
    // split the notations on whitespace boundaries, as long as the space
    // immediately follows a set of parentheses. Prior to doing that, we replace
    // all whitespace with spaces, which prevents tabs and newlines from ending
    // up in the notation data.
    // Gregorio's closing </eu> and </nlba> tags can come between the
    // parentheses and the space, and stay with the word they end.
    gabcNotations = maskGabc(gabcNotations)
      // .trim()
      // .replace(/\s/g, " ")
      .replace(/\)((?:<\/(?:eu|nlba)>)*)\s(?=[^\)]*(?:\(|$))/g, ")$1\n");
    return gabcNotations.split(/\n/g);
  }

  static parseSource(gabcSource: string) {
    return this.parseWords(this.splitWords(gabcSource));
  }

  // gabcWords is an array of strings, e.g., the result of splitWords above
  static parseWords(gabcWords: string[]) {
    var words = [];

    for (var i = 0; i < gabcWords.length; i++)
      words.push(this.parseWord(gabcWords[i]));

    return words;
  }

  // returns an array of objects, each of which has the following properties
  //  - notations (string)
  //  - lyrics (array of strings)
  static parseWord(gabcWord: string) {
    var syllables = [] as unknown as ParsedSyllable[] & { wordLength: number };
    var matches: RegExpExecArray[] = [];
    // (a word from splitWords() is masked already, and masking it again changes nothing)
    gabcWord = maskGabc(gabcWord);

    syllables.wordLength = gabcWord.length;

    var syllableMatch: RegExpExecArray | null;
    while ((syllableMatch = __syllablesRegex.exec(gabcWord))) matches.push(syllableMatch);

    for (var j = 0; j < matches.length; j++) {
      var match = matches[j];

      var lyrics = match[1]
        .replace(__commentMaskRegex, "")
        .trim()
        .split("|")
        .map(unescapeText);
      var notations = match[2] && unescapeText(match[2].replace(__commentMaskRegex, ""));

      syllables.push({
        notations: notations,
        lyrics: lyrics
      });
    }

    return syllables;
  }

  /**
   * 
   * @param {*} gabcHeight gabc letter a through m
   * @returns pitch
   */
  static gabcHeightToExsurgeHeight(gabcHeight: string) {
    return gabcHeight.toLowerCase().charCodeAt(0) - "c".charCodeAt(0);
  }

  /**
   * 
   * @param {*} staffPosition
   * @param {*} zeroOrNine 0 or 9 or nothing, to shift a little down or up
   * @returns staffposition offset
   */
  static getStaffPositionOffset(staffPosition: number, zeroOrNine: string | undefined) {
    let offset = 0;
    if (/0|9/.test(zeroOrNine as string)) {
      const basis = staffPosition % 2 ? 2 : 1;
      offset = (Number(zeroOrNine) ? basis : -basis) / 3;
    }
    return offset;
  }

  /**
   * 
   * @param {*} note to set staffPosition and staffPositionOffset on
   * @param {*} gabcAtom gabc letter from a to m with modifiers
   * @param {*} clef the clef the note is under: only under a Chi-Rho clef do 0 and 9 nudge it
   */
  static setStaffPositionAndOffset(note: Note | Signs.Custos, gabcAtom: string, clef: Clef) {
    const staffPosition = this.gabcHeightToExsurgeHeight(gabcAtom[0]);
    note.staffPositionOffset = 0;
    if (clef instanceof ChiRhoClef) {
      let zeroOrNine = gabcAtom[1];
      // the middle of a space is never used: a note on a space without a 9 is at the
      // bottom of the space, as if it had a 0
      if (staffPosition % 2 === 0 && zeroOrNine !== "9") zeroOrNine = "0";
      note.staffPositionOffset = this.getStaffPositionOffset(staffPosition, zeroOrNine);
    }
    note.staffPosition = staffPosition + note.staffPositionOffset;
  }
}
