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
import { Units, Pitch, Point, Rect, Margins, Size, Step } from "./Exsurge.Core.js";
import { MarkingPositionHint, LyricType, Lyric, LyricArray, AboveLinesText, ChoralSign, TranslationText, DefaultTrailingSpace, GlyphCode, Annotation, Annotations, LyricTieSpecials } from "./Exsurge.Drawing.js";
import { language as languages } from "./Exsurge.Text.js";
import { Note, LiquescentType, NoteShape, NoteShapeModifiers, ChantMapping, ChantScore, ChantDocument, Clef, DoClef, FaClef, TrebleClef, TextOnly, ChantLineBreak, ChiRhoClef } from "./Exsurge.Chant.js";
import * as Markings from "./Exsurge.Chant.Markings.js";
import * as Signs from "./Exsurge.Chant.Signs.js";
import * as Neumes from "./Exsurge.Chant.Neumes.js";
import { escapeChar, escapedCharSource, restoreEscapes } from "./gabcEscapes.js";
import { texLengthToStaffIntervals } from "./texLengths.js";
var gabcStaffPosition = Neumes.gabcStaffPosition;
// a linea (gabc =), or a punctum linea (R or r0)
var isLinea = (note) => note.shape === NoteShape.Default &&
    (!!(note.shapeModifiers & NoteShapeModifiers.Linea) || !!note.linea);
// the glyph that Gregorio fuses that a neume is, if it's one
var fusedGlyphOfNeume = (neume, fused) => {
    var kind;
    if (neume instanceof Neumes.Punctum || neume instanceof Neumes.Oriscus)
        kind = Neumes.FusedGlyphKind.Punctum;
    else if (neume instanceof Neumes.Virga)
        kind =
            neume.notes[0].shapeModifiers & NoteShapeModifiers.Reverse
                ? Neumes.FusedGlyphKind.VirgaReversa
                : Neumes.FusedGlyphKind.Virga;
    else if (neume instanceof Neumes.Clivis)
        kind = Neumes.FusedGlyphKind.Flexus;
    else if (neume instanceof Neumes.Podatus || neume instanceof Neumes.PesQuassus)
        kind = Neumes.FusedGlyphKind.Pes;
    else if (neume instanceof Neumes.Porrectus)
        kind = Neumes.FusedGlyphKind.Porrectus;
    else
        return undefined;
    return { kind, notes: neume.notes, fused };
};
// the notes that Gregorio fuses in @[…]: puncta (but not lineae), oriscus
// notes, quilismata and virgae (but not virgae reversae)
var isAutoFusible = (note) => {
    switch (note.shape) {
        case NoteShape.Default:
            return !isLinea(note);
        case NoteShape.Oriscus:
        case NoteShape.Quilisma:
            return true;
        case NoteShape.Virga:
            return !(note.shapeModifiers & NoteShapeModifiers.Reverse);
        default:
            return false;
    }
};
// whether a note in @[…] starts a new fused glyph rather than continuing one:
// all but a punctum do, as does an @ or an initio debilis
var startsAutoFusedGlyph = (note) => !!note.fused ||
    note.shape !== NoteShape.Default ||
    !!note.quadratum ||
    !!note.quilismaQuadratum ||
    !!(note.liquescent & LiquescentType.InitioDebilis);
// a liquescent other than an initio debilis, which ends a fused glyph
var isTailLiquescent = (note) => !!(note.liquescent & ~LiquescentType.InitioDebilis);
// a note that Gregorio doesn't fuse to the glyph before, even after an @: a
// stropha or a linea
var isNeverFused = (note) => note.shape === NoteShape.Stropha || isLinea(note);
// a punctum that isn't a linea or the first note of a pes quadratum
var isPlainPunctum = (note) => note.shape === NoteShape.Default && !isLinea(note) && !note.quadratum && !note.quilismaQuadratum;
// Gregorio's glyphs that can't have more notes
var __completeGregorioGlyphs = [
    "scandicus",
    "pesQuadratum",
    "salicusFlexus",
    "ancus",
    "torculusLiquescens",
    "torculusResupinusFlexus",
    "porrectusFlexus"
];
// Gregorio's glyph that starts with the note at index (add_note_to_a_glyph()
// in gabc-glyphs-determination.c): how many notes it has, its kind if it's a
// glyph that Gregorio fuses, and whether Gregorio fuses the next glyph to it.
// Gregorio's glyphs either side of an @ are the ones that it fuses, where
// exsurge's neumes can be other groups (a distropha of two puncta at the
// unison, say).
var nextGregorioGlyph = (notes, index) => {
    var first = notes[index];
    var position = (i) => gabcStaffPosition(notes[i]);
    // (an @ or an initio debilis starts a glyph)
    var canAdd = (i) => i < notes.length && !notes[i].fused && !(notes[i].liquescent & LiquescentType.InitioDebilis);
    var end = index + 1;
    switch (first.shape) {
        case NoteShape.Inclinatum:
            while (canAdd(end) &&
                notes[end].shape === NoteShape.Inclinatum &&
                position(end) !== position(end - 1))
                end++;
            return { length: end - index };
        case NoteShape.Stropha:
            while (end - index < 3 &&
                canAdd(end) &&
                notes[end].shape === NoteShape.Stropha &&
                position(end) === position(index))
                end++;
            return { length: end - index };
        case NoteShape.Virga:
            if (first.shapeModifiers & NoteShapeModifiers.Reverse)
                return { length: 1, kind: Neumes.FusedGlyphKind.VirgaReversa };
            while (end - index < 3 &&
                canAdd(end) &&
                notes[end].shape === NoteShape.Virga &&
                !(notes[end].shapeModifiers & NoteShapeModifiers.Reverse) &&
                position(end) === position(index))
                end++;
            return end - index === 1
                ? { length: 1, kind: Neumes.FusedGlyphKind.Virga }
                : { length: end - index };
    }
    if (isLinea(first))
        return { length: 1 };
    if (isTailLiquescent(first))
        return { length: 1, kind: Neumes.FusedGlyphKind.Punctum };
    // a punctum, oriscus, quilisma or the first note of a pes quadratum, and
    // the notes that Gregorio adds to it
    var isNormalPunctum = first.shape === NoteShape.Default && !(first.liquescent & LiquescentType.InitioDebilis);
    var type = first.quadratum ? "quadratum" : first.quilismaQuadratum ? "quilismaQuadratum" : "punctum";
    for (; canAdd(end); end++) {
        var note = notes[end];
        var interval = position(end) - position(end - 1);
        var next = null;
        if (Math.abs(interval) > 5)
            break;
        if (note.shape === NoteShape.Oriscus && note.shapeModifiers & NoteShapeModifiers.Stemmed) {
            if (type === "punctum" && interval > 0)
                next = "pesOriscus";
        }
        else if (isPlainPunctum(note) && interval !== 0) {
            switch (type) {
                case "punctum":
                    next = interval > 0 ? "pes" : "flexus";
                    break;
                case "pes":
                    if (interval < 0)
                        next = "torculus";
                    else if (isNormalPunctum)
                        next = "scandicus";
                    break;
                case "quadratum":
                    next = interval > 0 ? "pesQuadratum" : "flexus";
                    break;
                case "quilismaQuadratum":
                    if (interval > 0)
                        next = "pesQuadratum";
                    break;
                case "pesOriscus":
                    if (interval > 0)
                        next = "salicus";
                    break;
                case "salicus":
                    if (interval < 0)
                        next = "salicusFlexus";
                    break;
                case "flexus":
                    if (interval > 0) {
                        if (isNormalPunctum)
                            next = "porrectus";
                    }
                    else if (note.liquescent & LiquescentType.Small)
                        next = "ancus";
                    break;
                case "torculus":
                    if (interval > 0)
                        next = "torculusResupinus";
                    else if (note.liquescent === LiquescentType.Small)
                        next = "torculusLiquescens";
                    break;
                case "torculusResupinus":
                case "porrectus":
                    if (interval < 0)
                        next = type + "Flexus";
                    break;
            }
        }
        if (next === null)
            break;
        type = next;
        // (these glyphs, and a liquescent, end the glyph)
        if (__completeGregorioGlyphs.indexOf(type) >= 0 || isTailLiquescent(note)) {
            end++;
            break;
        }
    }
    // (Gregorio has no torculus that starts with an oriscus, and fuses the
    // oriscus and a flexus instead, as close_glyph() does)
    if (type === "torculus" && first.shape === NoteShape.Oriscus)
        return { length: 1, kind: Neumes.FusedGlyphKind.Punctum, fusesNext: true };
    var kinds = {
        punctum: Neumes.FusedGlyphKind.Punctum,
        quadratum: Neumes.FusedGlyphKind.Punctum,
        quilismaQuadratum: Neumes.FusedGlyphKind.Punctum,
        pes: Neumes.FusedGlyphKind.Pes,
        flexus: Neumes.FusedGlyphKind.Flexus,
        porrectus: Neumes.FusedGlyphKind.Porrectus
    };
    return { length: end - index, kind: kinds[type] };
};
// Gregorio's split of the notes of a fused glyph in @[…] into the glyphs it
// fuses (close_fusion_glyph() in gabc-glyphs-determination.c): a pes or
// flexus of the last two notes, a porrectus of the last three, a flexus
// before a higher note (which it draws as a porrectus's stroke), and single
// notes.  The first glyph is fused if fused is, and the others are.
// previousInterval is the interval up to the first note from a note before it
// that Gregorio counts (a virga reversa or stropha), or else 0.
var splitFusion = (notes, fused, previousInterval) => {
    var pieces = [];
    var add = (kind, glyphNotes) => {
        var glyphFused = fused || pieces.length > 0;
        pieces.push({ glyph: { kind, notes: glyphNotes, fused: glyphFused }, fused: glyphFused });
    };
    var interval = (i) => gabcStaffPosition(notes[i + 1]) - gabcStaffPosition(notes[i]);
    for (var i = 0; i < notes.length;) {
        if (i === notes.length - 1) {
            add(notes[i].shape === NoteShape.Virga ? Neumes.FusedGlyphKind.Virga : Neumes.FusedGlyphKind.Punctum, [notes[i]]);
            break;
        }
        var shift = interval(i);
        if (shift !== 0 && i + 1 === notes.length - 1) {
            add(shift < 0 ? Neumes.FusedGlyphKind.Flexus : Neumes.FusedGlyphKind.Pes, notes.slice(i));
            break;
        }
        // (with two notes left, a flexus would have ended the notes above)
        if (previousInterval >= 0 && shift < 0 && interval(i + 1) > 0) {
            if (i + 2 === notes.length - 1) {
                add(Neumes.FusedGlyphKind.Porrectus, notes.slice(i));
                break;
            }
            add(Neumes.FusedGlyphKind.Flexus, notes.slice(i, i + 2));
            previousInterval = interval(i + 1);
            i += 2;
            continue;
        }
        add(Neumes.FusedGlyphKind.Punctum, [notes[i]]);
        previousInterval = shift;
        i++;
    }
    return pieces;
};
// gives the last of a syllable's neumes the space after it
var setFinalTrailingSpace = (ctxt, neumes, finalTrailingSpace) => {
    if (neumes.length > 0) {
        if (!finalTrailingSpace.isDefault) {
            neumes[neumes.length - 1].trailingSpace = finalTrailingSpace;
            neumes[neumes.length - 1].keepWithNext = true;
            // finalTrailingSpace is either 0 or a function of the context
            if (typeof finalTrailingSpace === "function"
                ? finalTrailingSpace(ctxt) > 0
                : finalTrailingSpace > 0)
                neumes[neumes.length - 1].allowLineBreakBeforeNext = neumes[neumes.length - 1].keepWithNext = true;
        }
    }
};
// what Gregorio's comments are masked with (see maskGabc() below)
var __commentMask = "\uFDD0";
// reusable reg exps
// (a syllable starts after any spaces or masked comments)
var __syllablesRegex = /(?=[^\s\uFDD0])((?:<v>[\s\S]*?<\/v>|[^(])*)(?:\(?([^)]*)\)?)?/g;
var __altTranslationRegex = /<alt>(.*?)<\/alt>|\[(alt:)?(.*?)\]/g;
// a $ escape (see gabcEscapes.ts)
var __escapeSource = "\\$(" + escapedCharSource + ")";
var __escapeRegex = new RegExp(__escapeSource, "g");
// a comment: a % to the end of its line, unless it starts exsurge's %small
// caps%, which another % closes later on the line, before notes on the line
var __commentSource = "%(?![^%\\s][^%\\n]*%[^\\n%(]*\\()[^\\n]*\\n?";
// Gregorio's comments and $ escapes in the notation section (see maskGabc()
// below): the text in <sp> and <v>, where they're neither, a $ escape, notes
// (where Gregorio has no comments) and the comment right after them, and a
// comment at the start of a line or after a space
var __commentRegex = new RegExp("<sp>[^<]*?<\\/sp>|<v>[\\s\\S]*?<\\/v>|" +
    __escapeSource +
    "|(\\((?:\\$[\\s\\S]|[^)$])*\\)?)(" + __commentSource + ")?" +
    "|(^|[ \\t\\r\\n])(" + __commentSource + ")", "gm");
var __commentMaskRegex = /\uFDD0/g;
// Gregorio's syllable controls, which aren't printed: the euouae and
// no-line-break areas, <clear> and <pr> (with spaces where Gregorio allows them)
var __lyricAreaTagRegex = /<(\/)?(eu|nlba)>/g;
var __lyricClearRegex = /<\s*clear\s*\/?\s*>/g;
var __lyricProtrusionRegex = /<\s*pr\s*(?::\s*(\d*\.?\d+|\d+\.)\s*)?\/?\s*>/g;
// those controls at the start of a lyric
var __leadingControlsRegex = new RegExp("^(?:" + [__lyricAreaTagRegex, __lyricClearRegex, __lyricProtrusionRegex].map((regex) => regex.source).join("|") + ")*");
// (a note can start with Gregorio's @, unless it's the @ between two clefs, c1@c4)
var __notationsRegex = /z0|z[+-]?|Z[+-]?|((?:::|:\?|[,`]0?\?|\^0?|`0?|,0|[,;][1-8]?|:)['_]*)|(?:[cfg]|[cf]b|treble-?|xp-?)[1-5](?:@[cf]b?[1-5])?|\[nocustos\]|\/[0!]|\/\[-?(?:\.\d+|\d+(?:\.\d*)?)\]|\/+| |\!|\[\[|\[[^\[\]]*\]|\]\]?|<\/?nlba>|@\[|(?:-|@(?![cf]b?[1-5]))?[a-nA-N](?:[oOwWvVrRsxXyY#~\+>_\.'0-9|=q?]|<(?!\/?nlba>))*(?:\[(?!\[)[^\]]*\]?)*|\{([^}]+)\}?/g;
var __notationsRegex_group_bar = 1;
var __notationsRegex_group_insideBraces = 2;
// Gregorio's marks between notes, which are recorded on the notes after or
// before them (and the instructions in [ and ] that aren't after a note)
var __noteMarkRegex = /^(?:\[\[|\]\]?|<\/?nlba>|@\[|\[[^\[\]]*\])$/;
var __bracketedCommandRegex = /^([a-z]+):(.*)/;
// a clef with a second clef after it, as in c1@c4 or c3@fb2 (the clefs of
// __notationsRegex).  The groups are:
//  1. the first clef
//  2. c or f, the second clef's type
//  3. b if the second clef has a flat
//  4. the line of the second clef
var __secondClefRegex = /^((?:[cfg]|[cf]b|treble-?|xp-?)[1-5])@([cf])(b?)([1-5])$/;
// for the brace string inside of [ and ] in notation data
// the capturing groups are:
//  1. o or u, to indicate over or under
//  2. b, cb, or cba, to indicate the brace type
//  3. 0 or 1 to indicate the attachment point
//  4. { or } to indicate opening/closing (this group will be null if the metric version is used)
//  5. the length of the brace, which Gregorio passes to TeX (as 6mm, 0.3in or 10pt)
var __braceSpecRegex = /([ou])(b|cb|cba):([01])(?:([{}])|;([^\]]+))/;
// Gregorio's slurs, inside [ and ] after a note: [oslur:s;w,h], or [oslur:s{]
// and [oslur:s}] for one from note to note (and uslur under the notes).  The
// capturing groups are:
//  1. o or u, for over or under
//  2. the shift: 0, 1 or 2
//  3. and 4. the width and height, as TeX lengths
//  5. { or } for the start or end of a slur from note to note
var __slurRegex = /^([ou])slur:([012])(?:;([^,]+),(.+)|([{}]))$/;
// Gregorio's custom ledger lines, inside [ and ]: [oll:1] or [oll:0] after a
// note, to draw a ledger line at the note or leave it out, [oll:l;r], one of
// a given length, and [oll:l{r] … [oll:}], one from the first to the second
// (and ull under the staff).  The capturing groups are:
//  1. o or u, for over or under
//  2. 1 or 0, to draw a ledger line at the note or leave it out
//  3. }, for the end of one from note to note
//  4. how far the line starts to the left: 0, 1 or a TeX length
//  5. ; for a line of a given length, or { for the start of one from note to note
//  6. its length to the right, or how far it goes past its end (0, 1 or a TeX length)
var __ledgerLineRegex = /^([ou])ll:(?:([01])|(\})|([^;{]+)([;{])(.+))$/;
// Gregorio's episema tuning, inside [ and ]: [oh:p] after a note, where p is
// a position in the space (m, l, h, ol, oh, ul or uh) or a nudge (a TeX
// length starting with + or -), or both, and [oh:p{] … [oh}] for the notes
// between them, where p can be left out (and uh for the episema under the
// note).  The capturing groups are:
//  1. o or u, for the episema over or under the note
//  2. the position
//  3. the nudge
//  4. { or }, for the start or end of a block
var __episemaTuningRegex = /^([ou])h(?::(m|[ou]?[lh])?([+-][^{}]+)?)?([{}])?$/;
const TrailingSpaceForAccidental = (ctxt) => ctxt.intraNeumeSpacing * ctxt.accidentalSpaceMultiplier;
const TrailingSpaceMultiple = (multiplier) => (ctxt) => ctxt.intraNeumeSpacing * multiplier;
// a space between neumes, from ctxt.neumeSpaceMultipliers, times factor
const NeumeSpace = (code, factor = 1) => (ctxt) => ctxt.intraNeumeSpacing * ctxt.neumeSpaceMultipliers[code] * factor;
// the line that ends the header: two or more %s, as Gregorio allows, and the
// blank lines after it, which Gregorio also takes
const regexHeaderEnd = /(?:^|\n)(%%+)[ \t\r]*(\n|$)(?:[ \t\r]*\n)*/g;
const regexHeaderEndLine = /^%%+\s*$/;
// the start of a header: a field, after any blank lines and comments
const regexHeaderStart = /^(?:[ \t\r]*(?:[%#][^\n]*)?\n)*[\w-_.]+:/;
// the end of gabc's header, if it has one.  gabc without a header can have
// comment lines of %s in it, so only a line of just %% ends a header unless
// the gabc starts with a header field.
const findHeaderEnd = (gabc) => {
    regexHeaderEnd.lastIndex = 0;
    let match;
    while ((match = regexHeaderEnd.exec(gabc))) {
        if ((match[1] === "%%" && match[2]) || regexHeaderStart.test(gabc))
            break;
    }
    regexHeaderEnd.lastIndex = 0;
    return match;
};
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
const multiLineHeaderValue = (lines, start) => {
    let values = [];
    for (let i = start + 1; i < lines.length; ++i) {
        if (regexHeaderNotValue.test(lines[i]))
            break;
        let match = regexHeaderValueEnd.exec(lines[i]);
        if (match)
            return { values: [...values, match[1]], end: i };
        values.push(lines[i]);
    }
    return null;
};
// a header field's lines, with a multi-line value ending in ;; as Gregorio's do
const headerLines = (key, value) => value.includes("\n")
    ? `${key}: ${value};;`.split("\n")
    : [`${key}: ${value};`];
const GabcHeaderClass = class GabcHeader {
    static getLength(gabc) {
        let match = findHeaderEnd(gabc);
        return match ? match.index + match[0].length : 0;
    }
    constructor(text) {
        if (typeof text !== "string")
            text = "";
        this.comments = [];
        this.cValues = {};
        this.original = "";
        let match = findHeaderEnd(text);
        if (match) {
            let txtHeader = (this.original = text.slice(0, match.index + match[0].length));
            var lines = txtHeader.split(/\r?\n/g);
            for (var i = 0; i < lines.length; ++i) {
                let line = lines[i], match = regexHeaderLine.exec(line);
                if (match) {
                    var key = match[1].replace(/-([a-z])/g, function (a, letter) {
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
                    }
                    else {
                        this[match[1]] = value;
                    }
                    if (key !== match[1])
                        this[key] = this[match[1]];
                }
                else if ((match = regexHeaderComment.exec(line))) {
                    if (!regexHeaderEndLine.test(line)) {
                        match = regexHeaderLine.exec(line.slice(1));
                        if (match) {
                            let key = match[1].replace(/-([a-z])/g, function (a, letter) {
                                return letter.toUpperCase();
                            });
                            this.cValues[match[1]] = match[2];
                            if (key !== match[1])
                                this.cValues[key] = match[2];
                        }
                        else {
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
            if (typeof this[key] !== "string" ||
                /^(length|original|comments|cValues)$/.test(key)) {
                continue;
            }
            var alternateKey = key.replace(/[A-Z]/g, function (letter) {
                return "-" + letter.toLowerCase();
            });
            if (alternateKey !== key && alternateKey in this)
                continue;
            var array = this[key + "Array"];
            if (array) {
                for (var i = 0; i < array.length; ++i) {
                    result.push(...headerLines(key, array[i]));
                }
            }
            else {
                result.push(...headerLines(key, this[key]));
            }
        }
        for (let key in this.cValues) {
            if (key.length === 0 || !this.cValues.hasOwnProperty(key))
                continue;
            result.push("%" + key + ": " + this.cValues[key] + ";");
        }
        for (let i in this.comments) {
            if (!this.comments.hasOwnProperty(i))
                continue;
            try {
                // (i is a string, which splice() takes as the number it is)
                result.splice(i, 0, this.comments[i]);
            }
            catch (e) {
                console.warn(e);
            }
        }
        return result.join("\n") + "\n%%\n";
    }
};
export const GabcHeader = GabcHeaderClass;
/**
 * Masks Gregorio's comments in the notation section: a % to the end of its
 * line, which also takes the line break away.  Each character becomes a
 * noncharacter (U+FDD0), so that the source keeps its length (and the source
 * indices stay where they were), and the parser skips it as it does a space
 * between syllables, though without ending a word or a neume.  A comment
 * starts at the start of a line, or after a space or the notes.  A % that
 * another % closes later on its line, before notes, is exsurge's %small caps%
 * markup instead (when no space follows it), and a % elsewhere, in the notes,
 * in <sp>…</sp> or <v>…</v>, or escaped as $%, isn't a comment.
 *
 * Also replaces Gregorio's $ escapes outside <sp> and <v> with characters
 * that mean nothing to the parser (see gabcEscapes.ts), also keeping the
 * length.
 */
var maskGabc = (gabc) => gabc.replace(__commentRegex, (match, escaped, notes, notesComment = "", before, comment) => escaped
    ? escapeChar(escaped)
    : notes
        ? notes.replace(__escapeRegex, (escape, char) => escapeChar(char)) +
            __commentMask.repeat(notesComment.length)
        : comment
            ? before + __commentMask.repeat(comment.length)
            : match);
// whether a gabc word is only spaces and comments
var isEmptyWord = (word) => maskGabc(word).replace(__commentMaskRegex, "").trim() === "";
// the languages of the language header, by their names and their ISO 639
// codes, in lower case (Church Slavonic's and Hungarian's are the aliases in
// Gregorio's gregorio-vowels.dat, which also gives Polish, Czech and Slovak
// Church Slavonic's vowel rules)
const __languagesByName = {
    latin: languages.latin,
    la: languages.latin,
    lat: languages.latin,
    english: languages.english,
    en: languages.english,
    eng: languages.english,
    spanish: languages.spanish,
    "español": languages.spanish,
    es: languages.spanish,
    spa: languages.spanish,
    "church slavonic": languages.churchSlavonic,
    "church slavic": languages.churchSlavonic,
    "old church slavonic": languages.churchSlavonic,
    "old slavonic": languages.churchSlavonic,
    "old bulgarian": languages.churchSlavonic,
    slavic: languages.churchSlavonic,
    cu: languages.churchSlavonic,
    chu: languages.churchSlavonic,
    polish: languages.churchSlavonic,
    pl: languages.churchSlavonic,
    pol: languages.churchSlavonic,
    czech: languages.churchSlavonic,
    cs: languages.churchSlavonic,
    ces: languages.churchSlavonic,
    cze: languages.churchSlavonic,
    slovak: languages.churchSlavonic,
    sk: languages.churchSlavonic,
    slk: languages.churchSlavonic,
    slo: languages.churchSlavonic,
    hungarian: languages.hungarian,
    hu: languages.hungarian,
    hun: languages.hungarian
};
// the languages of the old centering-scheme header, which said how to center
// the lyrics: on the vowel (latine) or on the whole syllable (english)
const __languagesByCenteringScheme = {
    latine: languages.latin,
    english: languages.english
};
// the annotations that Gabc.applyHeader() made, which it replaces when it's
// called again
const __headerAnnotations = new WeakSet();
const __romanModeNumbers = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];
// text that starts with punctuation: ASCII's, as Lua's %p has it, and that
// of Latin-1 and of Unicode's general punctuation
const __punctuationRegex = /^[!-/:-@[-`{-~\u00a1-\u00bf\u2010-\u205e]/;
// a header value as one line of text: Gregorio's values go into TeX, which
// reads the line ends of a multi-line value as spaces
const headerText = (value) => (value || "").replace(/\s+/g, " ").trim();
var elementCountForNotations = (items) => items.reduce((sum, item) => sum + (item.notes ? item.notes.length : 1), 0);
// whether there are any areas in areas
var hasAreas = (areas) => !!(areas.euouae || areas.noLineBreak);
// the areas in both a and b
var mergeAreas = (a, b) => {
    let areas = Object.assign({}, a);
    for (let name of ["euouae", "noLineBreak"])
        if (b[name])
            areas[name] = Object.assign(Object.assign({}, a[name]), b[name]);
    return areas;
};
// no marks for the next word
var noMarksForNext = { noteMarks: [], areas: {} };
// whether marks has any marks
var hasMarks = (marks) => marks.noteMarks.length > 0 ||
    hasAreas(marks.areas) ||
    !!(marks.episemaBlocks && (marks.episemaBlocks.above || marks.episemaBlocks.below));
// the areas that Gregorio's closing tags after the last word's notes end, which end at its last notation
var endTrailingAreas = (mappings, areas) => {
    let notations = mappings.length ? mappings[mappings.length - 1].notations : [];
    if (!notations.length)
        return;
    setAreaBoundaries(notations, {
        euouae: areas.euouae && areas.euouae.end ? { end: true } : undefined,
        noLineBreak: areas.noLineBreak && areas.noLineBreak.end ? { end: true } : undefined
    });
};
// what Gregorio's [[ marks on the note after it
var markBracketStart = (note) => (note.bracketStart = true);
// what Gregorio's <nlba> in the notes marks on the note, or other notation, after it
var markNoLineBreakStart = (element) => (element.noLineBreak = Object.assign(Object.assign({}, element.noLineBreak), { start: true }));
// what Gregorio's @[ marks on the note after it
var markAutoFusionStart = (note) => (note.autoFusion = Object.assign(Object.assign({}, note.autoFusion), { start: true }));
// the NABC for one notation of two of Gregorio's elements, the second after a space ("/")
var joinNabc = (first, second) => first && second ? first + "/" + second : (first || "") + second;
// marks the start of an area on the first of a syllable's notations and its end on the last
var setAreaBoundaries = (items, areas) => {
    for (let name of ["euouae", "noLineBreak"]) {
        let area = areas[name];
        if (!area)
            continue;
        if (area.start)
            items[0][name] = Object.assign(Object.assign({}, items[0][name]), { start: true });
        if (area.end) {
            let last = items[items.length - 1];
            last[name] = Object.assign(Object.assign({}, last[name]), { end: true });
        }
    }
};
// reads the <eu> and <nlba> tags in a syllable's text into areas, and returns
// the text that's printed: without those tags, <clear> or <pr>, and empty if
// there's nothing else but spaces
var readSyllableControls = (text, areas) => {
    let printedText = text
        .replace(__lyricAreaTagRegex, (tag, closing, name) => {
        let area = name === "eu" ? "euouae" : "noLineBreak";
        areas[area] = Object.assign(Object.assign({}, areas[area]), { [closing ? "end" : "start"]: true });
        return "";
    })
        .replace(__lyricClearRegex, "")
        .replace(__lyricProtrusionRegex, "");
    return printedText !== text && printedText.trim() === "" ? "" : printedText;
};
// the index in a lyric's text of what was at index in the text it was made from
var lyricTextIndex = (ctxt, lyric, text, index) => {
    // (the spans' indices are in the text after the style's prefix, with each
    // run of spaces made one, as generateSpansFromText() makes it)
    index = ((ctxt.textStyles.lyric.prefix || "") + text.slice(0, index)).replace(/\s+/g, " ").length;
    let textIndex = 0;
    for (let span of lyric.spans) {
        if (index < span.index + span.text.length)
            return textIndex + Math.max(0, index - span.index);
        textIndex += span.text.length;
    }
    return textIndex;
};
export class Gabc {
    // takes gabc source code (without the header info) and returns an array
    // of ChantMappings describing the chant. A chant score can then be created
    // fron the chant mappings and later updated via updateMappings() if need
    // be...
    static createMappingsFromSource(ctxt, gabcSource) {
        var headerLength = GabcHeader.getLength(gabcSource);
        ctxt.nabcLines = this.getNabcLines(gabcSource, headerLength);
        gabcSource = gabcSource.slice(headerLength);
        var words = this.splitWords(gabcSource);
        // set the default clef
        ctxt.activeClef = Clef.default();
        // the default clef is shared, so forget any accidental the last chant left on it
        ctxt.activeClef.resetAccidentals();
        // an automatic brace left open at the end of the last chant parsed doesn't
        // carry over into this one, nor do Gregorio's marks for the next notes
        delete this.needToEndBrace;
        this.marksForNext = noMarksForNext;
        var mappings = this.createMappingsFromWords(ctxt, words);
        endTrailingAreas(mappings, this.marksForNext.areas);
        // always set the last notation to have a trailingSpace of 0. This makes layout for the last chant line simpler
        if (mappings.length > 0 &&
            mappings[mappings.length - 1].notations.length > 0)
            mappings[mappings.length - 1].notations[mappings[mappings.length - 1].notations.length - 1].trailingSpace = 0;
        return mappings;
    }
    /** the number of lines of NABC that a gabc file's header gives (nabc-lines) */
    static getNabcLines(gabc, headerLength = GabcHeader.getLength(gabc)) {
        if (!headerLength)
            return 0;
        let nabcLines = parseInt(new GabcHeader(gabc.slice(0, headerLength))["nabc-lines"], 10);
        return nabcLines > 0 ? nabcLines : 0;
    }
    /**
     * Splits a syllable's notes into gabc and Gregorio's NABC, when there are
     * nabcLines lines of NABC.  As in Gregorio, the parts between the |s take
     * turns: gabc, then the NABC of each line, then gabc again.  Returns the
     * notes with the NABC and the |s masked (keeping their length), but with a
     * / at a | between two parts of gabc, which Gregorio makes separate
     * elements, and each part of gabc that has NABC, by where it starts and ends
     * in the notes, and where it put the /s.  The NABC of a part of gabc that's empty,
     * which Gregorio gives an element of its own, goes with the part before it,
     * after a / (a space in NABC).
     */
    static splitNabc(data, nabcLines) {
        let gabc = "";
        let cuts = [];
        let parts = [];
        let part = null;
        let lastGabc = "";
        let index = 0;
        data.split("|").forEach((snippet, i) => {
            let state = i % (nabcLines + 1);
            if (state === 0) {
                if (i > 0 && lastGabc.trim() && snippet.trim()) {
                    cuts.push(gabc.length);
                    gabc += "/";
                }
                else if (i > 0)
                    gabc += __commentMask;
                if (snippet.trim() || !part)
                    parts.push((part = { index, end: index + snippet.length, nabc: [] }));
                if (snippet.trim())
                    lastGabc = snippet;
                gabc += snippet;
            }
            else {
                gabc += __commentMask.repeat(snippet.length + 1);
                part.nabc[state - 1] = joinNabc(part.nabc[state - 1], snippet);
            }
            index += snippet.length + 1;
        });
        // (a voice that was skipped with || has an empty string)
        for (let p of parts)
            for (let v = 0; v < p.nabc.length; v++)
                p.nabc[v] = p.nabc[v] || "";
        return { gabc, cuts, parts: parts.filter((p) => p.nabc.length > 0) };
    }
    /**
     * Applies the settings in a gabc header to a score, as Gregorio does.
     * exsurge doesn't otherwise read them, so call this after making the score,
     * and again after updating its mappings if the header has changed.  The
     * score keeps what it applies, so the lyrics of edits get the header's
     * language without it.  The score is then laid out again where it needs
     * to be.
     *
     * - annotation: the first two, one line each, as the score's annotation.
     * - mode, mode-modifier and mode-differentia, if there is no annotation
     *   header: one line, as the score's annotation (see modeText()).
     * - staff-lines: 2 to 5, as the score's staffLineCount.
     * - language: Latin, English, Spanish, Church Slavonic (also for Polish,
     *   Czech and Slovak, as in Gregorio) or Hungarian, by name or ISO 639
     *   code, as the score's language, which its lyrics are centered for, so
     *   that ctxt.defaultLanguage stays as it is for other scores.  A language
     *   that exsurge doesn't have leaves them as they are.
     * - with options.legacy, the headers that Gregorio no longer reads:
     *   initial-style (0 for no drop cap, 1 or 2 for one) as the score's
     *   useDropCap, and centering-scheme (latine or english) as the language
     *   of the score's lyrics, in place of the language header.
     *
     * A score that already has an annotation that this didn't make keeps it,
     * and gets no mode line, as in Gregorio, where an annotation set in TeX
     * wins over the header.
     */
    static applyHeader(score, ctxt, header, options = {}) {
        var annotations = (header.annotationArray || [header.annotation])
            .map(headerText)
            .filter((text) => text)
            .slice(0, 2);
        if (!score.annotation || __headerAnnotations.has(score.annotation)) {
            var annotation = null;
            if (annotations.length) {
                if (options.annotation !== false)
                    annotation =
                        annotations.length === 1
                            ? new Annotation(ctxt, annotations[0])
                            : new Annotations(ctxt, ...annotations);
            }
            else if (options.mode !== false) {
                var mode = this.modeText(ctxt, headerText(header.mode), headerText(header["mode-modifier"]), headerText(header["mode-differentia"]));
                if (mode)
                    annotation = new Annotation(ctxt, mode);
            }
            if (annotation)
                __headerAnnotations.add(annotation);
            score.annotation = annotation;
        }
        var staffLineCount = parseInt(headerText(header["staff-lines"]), 10);
        if (options.staffLines !== false &&
            staffLineCount >= 2 &&
            staffLineCount <= 5 &&
            staffLineCount !== score.staffLineCount) {
            score.staffLineCount = staffLineCount;
            // everything on the staff is laid out for its number of lines
            for (let notation of score.notations)
                notation.needsLayout = true;
        }
        var language = (options.language !== false &&
            __languagesByName[headerText(header.language).toLowerCase()]) ||
            null;
        if (options.legacy)
            language =
                __languagesByCenteringScheme[headerText(header["centering-scheme"]).toLowerCase()] ||
                    language;
        if (language) {
            // (which the lyrics of later edits get too, from updateNotations())
            score.language = language;
            for (let notation of score.notations)
                score.updateLanguage(notation);
        }
        if (options.legacy) {
            var initialStyle = headerText(header["initial-style"]);
            if (/^[012]$/.test(initialStyle)) {
                score.useDropCap = initialStyle !== "0";
                score.recreateDropCap(ctxt);
            }
        }
        score.needsLayout = true;
    }
    /**
     * The mode line that Gregorio writes above the initial when there is no
     * annotation (\GreMode): the mode, then the modifier and the differentia,
     * each after a space unless it starts with punctuation.  A mode that
     * starts with a number from 1 to 8 has it written in ctxt.modeNumberSystem
     * ("8" is VIII, "4A" is IVA); any other mode is written as it is.  With no
     * mode, the modifier and differentia aren't written either.
     */
    static modeText(ctxt, mode, modifier = "", differentia = "") {
        if (!mode)
            return "";
        var number = /^[1-8]/.test(mode) ? parseInt(mode[0], 10) : 0;
        if (number) {
            var roman = __romanModeNumbers[number - 1];
            mode =
                (ctxt.modeNumberSystem === "arabic"
                    ? mode[0]
                    : ctxt.modeNumberSystem === "roman-minuscule"
                        ? roman
                        : roman.toUpperCase()) + mode.slice(1);
        }
        for (var part of [modifier, differentia]) {
            if (part)
                mode += (__punctuationRegex.test(part) ? "" : " ") + part;
        }
        return mode;
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
    static diffDescriptorsAndNewWords(before, after) {
        var beforeLength = before.length, afterLength = after.length, prefixLength = 0, suffixLength = 0;
        while (prefixLength < beforeLength &&
            prefixLength < afterLength &&
            before[prefixLength].source === after[prefixLength])
            prefixLength++;
        while (suffixLength < beforeLength - prefixLength &&
            suffixLength < afterLength - prefixLength &&
            before[beforeLength - 1 - suffixLength].source ===
                after[afterLength - 1 - suffixLength])
            suffixLength++;
        var result = [];
        if (prefixLength)
            result.push(["=", after.slice(0, prefixLength)]);
        result = result.concat(this.diffDescriptorsAndNewWordsBySubstring(before.slice(prefixLength, beforeLength - suffixLength), after.slice(prefixLength, afterLength - suffixLength)));
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
    static diffDescriptorsAndNewWordsBySubstring(before, after) {
        // Create a map from before values to their indices
        var oldIndexMap = new Map(), indices, i;
        for (i = 0; i < before.length; i++) {
            indices = oldIndexMap.get(before[i].source);
            if (indices)
                indices.push(i);
            else
                oldIndexMap.set(before[i].source, [i]);
        }
        // overlap[iold] is the length of the common substring ending at
        // before[iold] and the previous new word; only the entries at
        // overlapIndices are non-zero.
        var overlap = new Int32Array(before.length), _overlap = new Int32Array(before.length), overlapIndices = null, swap, startOld, startNew, subLength, inew;
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
            var result = [];
            if (before.length)
                result.push(["-", before]);
            if (after.length)
                result.push(["+", after]);
            return result;
        }
        // ...otherwise, the common substring is unchanged and we recursively
        // diff the text before and after that substring
        return [].concat(this.diffDescriptorsAndNewWordsBySubstring(before.slice(0, startOld), after.slice(0, startNew)), [["=", after.slice(startNew, startNew + subLength)]], this.diffDescriptorsAndNewWordsBySubstring(before.slice(startOld + subLength), after.slice(startNew + subLength)));
    }
    // this function essentially performs and applies a rudimentary diff between a
    // previously parsed set of mappings and between a new gabc source text.
    // the mappings array passed in is changed in place to be updated from the
    // new source
    /**
     * Updates mappings in place to match newGabcSource, and returns the length
     * of newGabcSource's header.
     */
    static updateMappingsFromSource(ctxt, mappings, newGabcSource, insertionIndex = null, oldInsertionIndex = null) {
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
        var parsedUnderChiRho = new Map();
        var underChiRho = false;
        for (const oldMapping of mappings) {
            parsedUnderChiRho.set(oldMapping, underChiRho);
            for (const notation of oldMapping.notations)
                if (notation.isClef)
                    underChiRho = notation instanceof ChiRhoClef;
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
        var results = this.diffDescriptorsAndNewWords(mappings, newWords.slice(0, -1));
        if (newWords.length) {
            var lastResult = results[results.length - 1];
            if (lastResult && lastResult[0] === "+")
                lastResult[1] = lastResult[1].concat(newWords.slice(-1));
            else
                results.push(["+", newWords.slice(-1)]);
        }
        var index = 0, j, k, l, sourceIndex = 0, wordLength = 0, mapping, elementIndex = 0;
        ctxt.activeClef = Clef.default();
        // the default clef is shared, so forget any accidental the last chant left on it
        ctxt.activeClef.resetAccidentals();
        delete this.needToEndBrace;
        this.marksForNext = noMarksForNext;
        // apply the results to the mappings, marking notations that need to be processed
        var lastTranslationNeumes = [];
        for (var i = 0; i < results.length; i++) {
            var resultCode = results[i][0];
            // (the words kept or added, or the mappings deleted, of which only the number is used)
            var resultValues = results[i][1];
            // (after insertions, sourceIndex is already past them and the empty words among them)
            if (index > 0 && (i === 0 || results[i - 1][0] !== "+"))
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
                    if (elementIndex === 0 &&
                        mapping.notations.length &&
                        mapping.notations[0].isClef) {
                        // the first clef doesn't get kept as a notation:
                        elementIndex = -1;
                    }
                    if (insertionIndex >= elementIndex ||
                        oldInsertionIndex >= elementIndex) {
                        // check if the insertion index is within this mapping:
                        let elementCount = elementCountForNotations(mapping.notations);
                        if ((insertionIndex >= elementIndex &&
                            insertionIndex < elementIndex + elementCount) ||
                            (oldInsertionIndex >= elementIndex &&
                                oldInsertionIndex < elementIndex + elementCount)) {
                            // re-do this mapping:
                            // TODO: check sourceIndex
                            let sourceIndex = mapping.sourceIndex + sourceIndexDiff;
                            mapping = this.createMappingFromWord(ctxt, resultValues[j], sourceIndex, lastTranslationNeumes, insertionIndex - elementIndex);
                            mappings.splice(index, 1, mapping);
                            elementIndex += elementCount;
                            continue;
                        }
                        elementIndex += elementCount;
                    }
                    if (parsedUnderChiRho.get(mapping) !==
                        ctxt.activeClef instanceof ChiRhoClef ||
                        hasMarks(this.marksForNext) ||
                        mapping.followsMarks) {
                        // the kind of clef has changed, and with it whether 0 and 9 nudge the notes,
                        // or the word before leaves (or left) Gregorio's marks on this one's
                        mapping = this.createMappingFromWord(ctxt, resultValues[j], mapping.sourceIndex + sourceIndexDiff, lastTranslationNeumes);
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
                            ctxt.activeClef = mappings[index].notations[k];
                            // a fresh clef starts out with its default accidental, rather
                            // than with whatever accidental was active when it was last used
                            ctxt.activeClef.resetAccidentals();
                        }
                        if (curNotation.isAccidental) {
                            curNotation.pitch = ctxt.activeClef.staffPositionToPitch(curNotation.staffPosition);
                            ctxt.activeClef.activeAccidental = curNotation;
                        }
                        else if (curNotation.resetsAccidentals) {
                            ctxt.activeClef.resetAccidentals();
                        }
                        // update source index, pitch, and automatic braces
                        if (curNotation.notes) {
                            for (l = 0; l < curNotation.notes.length; ++l) {
                                let note = curNotation.notes[l];
                                note.sourceIndex += sourceIndexDiff;
                                if (note.choralSign)
                                    note.choralSign.sourceIndex += sourceIndexDiff;
                                note.pitch = ctxt.activeClef.staffPositionToPitch(note.staffPosition);
                                this.endAutomaticBrace(note);
                            }
                        }
                        if (curNotation.translationText) {
                            for (l = 0; l < curNotation.translationText.length; ++l) {
                                let transText = curNotation.translationText[l];
                                delete transText.endNeume;
                                curNotation.translationText[l].sourceIndex += sourceIndexDiff;
                                if (transText.textAnchor === "end" &&
                                    lastTranslationNeumes[0]) {
                                    let lastTranslationText = lastTranslationNeumes[0].translationText[l];
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
                                let lyric = curNotation.lyrics[l];
                                lyric.sourceIndex += sourceIndexDiff;
                                if (lyric.dropCap)
                                    lyric.dropCap.sourceIndex += sourceIndexDiff;
                            }
                            if (curNotation.alText) {
                                for (l = 0; l < curNotation.alText.length; ++l) {
                                    curNotation.alText[l].sourceIndex += sourceIndexDiff;
                                }
                            }
                        }
                    }
                    this.marksForNext = mapping.marksForNext || noMarksForNext;
                }
            }
            else if (resultCode === "-") {
                // delete elements that no longer exist, but first notify all
                // elements of the change
                mappings.splice(index, resultValues.length);
            }
            else if (resultCode === "+") {
                // insert new ones
                for (j = 0; j < resultValues.length; j++) {
                    wordLength = resultValues[j].length + 1;
                    // like createMappingsFromWords, skip the empty word that trailing
                    // whitespace leaves at the end of the source
                    if (isEmptyWord(resultValues[j])) {
                        sourceIndex += wordLength;
                        continue;
                    }
                    let marksBefore = this.marksForNext;
                    mapping = this.createMappingFromWord(ctxt, resultValues[j], sourceIndex, lastTranslationNeumes, insertionIndex - elementIndex);
                    if (elementIndex === 0 &&
                        mapping.notations.length &&
                        mapping.notations[0].isClef) {
                        // the first clef doesn't get kept as a notation:
                        elementIndex = -1;
                        let elementCount = elementCountForNotations(mapping.notations);
                        if (insertionIndex < elementCount) {
                            // re-do the first mapping, because it was broken up incorrectly, due to the presence of the initial clef
                            this.marksForNext = marksBefore;
                            mapping = this.createMappingFromWord(ctxt, resultValues[j], sourceIndex, lastTranslationNeumes, insertionIndex - elementIndex);
                        }
                    }
                    for (k = 0; k < mapping.notations.length; k++) {
                        let curNotation = mapping.notations[k];
                        elementIndex += curNotation.notes ? curNotation.notes.length : 1;
                        if (curNotation.isClef) {
                            ctxt.activeClef = mapping.notations[k];
                        }
                    }
                    mappings.splice(index++, 0, mapping);
                    sourceIndex += wordLength;
                }
            }
        }
        endTrailingAreas(mappings, this.marksForNext.areas);
        // always set the last notation to have a trailingSpace of 0. This makes layout for the last chant line simpler
        if (mappings.length > 0 &&
            mappings[mappings.length - 1].notations.length > 0)
            mappings[mappings.length - 1].notations[mappings[mappings.length - 1].notations.length - 1].trailingSpace = 0;
        return headerLength;
    }
    // takes an array of gabc words (like that returned by splitWords below)
    // and returns an array of ChantMapping objects, one for each word.
    static createMappingsFromWords(ctxt, words) {
        var mappings = [];
        var sourceIndex = 0, wordLength = 0, lastTranslationNeumes = [];
        for (var i = 0; i < words.length; i++) {
            sourceIndex += wordLength;
            wordLength = words[i].length + 1;
            // (the word as it is, which starts at sourceIndex, as in
            // updateMappingsFromSource(): its syllables skip any space it starts with)
            var word = words[i];
            if (isEmptyWord(word))
                continue;
            var mapping = this.createMappingFromWord(ctxt, word, sourceIndex, lastTranslationNeumes);
            if (mapping)
                mappings.push(mapping);
        }
        return mappings;
    }
    /**
     * Sets the automaticLeaning of each punctum inclinatum in a syllable's
     * notes that has no leaning of its own, as Gregorio does
     * (gabc_determine_punctum_inclinatum_orientation()).  A run of inclinata
     * leans the way the line they make goes, counting the steps into and out
     * of it, unless they're all at one pitch, which leaves them upright; an
     * inclinatum in the run that has a leaning, or is a liquescent (which
     * leans down), gives the run its leaning instead.  (Gregorio carries a
     * run's leaning on into the next syllable; this doesn't look past the
     * syllable.)
     */
    static setAutomaticLeanings(notes) {
        // the inclinata in the run that have no leaning of their own, and the
        // leaning that an inclinatum in the run that has one gives them
        let run = [];
        let leaning;
        // the steps up less the steps down, the number of inclinata, and whether they're at one pitch
        let rising = 0, count = 0, unison = true;
        let previous;
        const endRun = () => {
            let runLeaning = leaning ||
                (unison && (count > 1 || (count === 1 && rising === 0))
                    ? "unison"
                    : rising > 0
                        ? "ascending"
                        : "descending");
            for (let note of run)
                note.automaticLeaning = runLeaning;
            run = [];
            unison = true;
        };
        for (let note of notes) {
            let isInclinatum = note.shape === NoteShape.Inclinatum;
            // (a deminutus or an auctus, not an initio debilis)
            let isLiquescent = isInclinatum &&
                (note.liquescent & (LiquescentType.Small | LiquescentType.Ascending | LiquescentType.Descending)) !== 0;
            let step = previous ? Math.sign(note.staffPosition - previous.staffPosition) : 0;
            delete note.automaticLeaning;
            if (isInclinatum && !note.leaning && !isLiquescent) {
                if (leaning)
                    note.automaticLeaning = leaning;
                else {
                    rising += step;
                    if (step && count > 0)
                        unison = false;
                    run.push(note);
                }
                count++;
            }
            else {
                if (isLiquescent) {
                    unison = false;
                    leaning = "descending";
                }
                else if (isInclinatum)
                    leaning = note.leaning;
                if (run.length) {
                    if (!isInclinatum)
                        rising += step;
                    endRun();
                }
                if (isInclinatum)
                    count++;
                else {
                    rising = count = 0;
                    unison = true;
                    leaning = undefined;
                }
            }
            previous = note;
        }
        if (run.length)
            endRun();
    }
    // takes a gabc word (like those returned by splitWords below) and returns
    // a ChantMapping object that contains the gabc word source text as well
    // as the generated notations.
    static createMappingFromWord(ctxt, word, sourceIndex, lastTranslationNeumes, insertionIndex) {
        var matches = [];
        var notations = [];
        var currSyllable = 0;
        // (the word is parsed with Gregorio's comments and escapes masked)
        var maskedWord = maskGabc(word);
        // whether the accidentals were reset since the last notation parsed
        var resetAccidentals = false;
        // Gregorio's marks that the word before left for this one's notes and
        // first syllable, which parseNotations() and the syllables below take
        // from marksForNext, and leave the rest of for the next word
        var followsMarks = hasMarks(this.marksForNext);
        var mappingOf = () => {
            this.marksForNext = Object.assign(Object.assign({}, this.marksForNext), { areas: mergeAreas(this.marksForNext.areas, trailingAreas) });
            let mapping = new ChantMapping(word, notations, sourceIndex);
            if (hasMarks(this.marksForNext))
                mapping.marksForNext = this.marksForNext;
            if (followsMarks)
                mapping.followsMarks = true;
            return mapping;
        };
        var syllableMatch;
        while ((syllableMatch = __syllablesRegex.exec(maskedWord)))
            matches.push(syllableMatch);
        // Gregorio's controls after the word's last notes, with no notes of their
        // own, like the closing tags that splitWords() leaves with the word before
        // them ("son.(f)</nlba> Chri(f)"), go on the next syllable, as in
        // Gregorio, where they're its text
        var trailingAreas = {};
        var lastMatch = matches[matches.length - 1];
        if (lastMatch &&
            lastMatch[2] === undefined &&
            readSyllableControls(lastMatch[1].replace(__commentMaskRegex, ""), trailingAreas) === "")
            matches.pop();
        else
            trailingAreas = {};
        for (var j = 0; j < matches.length; j++) {
            var match = matches[j];
            // a ~ is a lyric tie (except in a special character, e.g. <sp>~</sp>),
            // or a space in verbatim TeX, above-lines text and translations
            var lyricTieSpecial = LyricTieSpecials[ctxt.lyricTie];
            var lyricTie = (lyricTieSpecial && ctxt.specials[lyricTieSpecial]) || " ";
            var lyricText = match[1].replace(__commentMaskRegex, "").replace(/(^|<\/sp>)([\s\S]*?)($|<sp>)/g, (_, pre, main, post) => `${pre}${main.replace(/(<v>[\s\S]*?<\/v>|<alt>[\s\S]*?<\/alt>|\[[^\]]*\])|~/g, (tie, notLyric) => (notLyric ? notLyric.replace(/~/g, " ") : lyricTie))}${post}`);
            var alText = [];
            var translationText = [];
            var notationData = match[2];
            // Gregorio's controls, which aren't printed: <eu> and <nlba> start or
            // end areas at the syllable's notations (and are taken out of the text
            // below), and createSyllableLyrics() reads <clear> and <pr>
            var areas = {};
            var printedText = readSyllableControls(lyricText, areas);
            if (printedText === "")
                lyricText = "";
            // new words reset the accidentals, per the Solesmes style (see LU xviij)
            // but we need to also make sure that there _is_ a word and that it has notes associated with it.
            if (currSyllable === 0 &&
                /[a-z]/i.test(printedText) &&
                /[a-n]/i.test(notationData)) {
                ctxt.activeClef.resetAccidentals();
                resetAccidentals = true;
            }
            var notationsSourceIndex = sourceIndex + match.index + match[1].length + 1;
            // Gregorio's NABC, which is kept on the notations (see splitNabc())
            var nabc = ctxt.nabcLines > 0 && notationData && notationData.includes("|")
                ? this.splitNabc(notationData, ctxt.nabcLines)
                : null;
            var items = this.parseNotations(ctxt, nabc ? (isEmptyWord(nabc.gabc) ? "" : nabc.gabc) : notationData, notationsSourceIndex, insertionIndex);
            if (nabc) {
                const sourceIndexOf = (item) => (item.notes ? item.notes[0].sourceIndex : item.sourceIndex);
                // (a clef, which may become a line's starting clef, and a line break
                // don't draw NABC)
                const drawsNabc = (item) => !!item && !item.isClef && item.constructor !== ChantLineBreak;
                for (let part of nabc.parts) {
                    // the first notation of the part, or the last one before it
                    let partIndex = notationsSourceIndex + part.index;
                    let notation = items.find((item) => sourceIndexOf(item) >= partIndex) || items[items.length - 1];
                    if (!notation)
                        continue;
                    if (!drawsNabc(notation)) {
                        // the next notation of the part, or else one of its own just
                        // after it, without notes (as Gregorio gives the NABC of a part of
                        // gabc that's empty an element of its own)
                        let index = items.indexOf(notation) + 1;
                        let next = items[index];
                        if (!drawsNabc(next) || sourceIndexOf(next) >= notationsSourceIndex + part.end)
                            items.splice(index, 0, (next = new TextOnly(partIndex, 0)));
                        notation = next;
                    }
                    let notationNabc = (notation.nabc = notation.nabc || []);
                    part.nabc.forEach((line, v) => (notationNabc[v] = joinNabc(notationNabc[v], line)));
                }
                // a / that splitNabc() put in isn't in the source of the note before it
                // (unless the source has a / there too)
                let notes = [].concat(...items.map((item) => item.notes || []));
                for (let cut of nabc.cuts) {
                    let noteBefore = notes.filter((note) => note.sourceIndex - notationsSourceIndex < cut).pop();
                    if (noteBefore &&
                        noteBefore.sourceGabc.endsWith("/") &&
                        notationData[noteBefore.sourceIndex - notationsSourceIndex + noteBefore.sourceGabc.length - 1] !== "/")
                        noteBefore.sourceGabc = noteBefore.sourceGabc.slice(0, -1);
                }
            }
            if (items.length === 0)
                continue;
            var itemNotes = [].concat(...items.map((item) => item.notes || []));
            this.setAutomaticLeanings(itemNotes);
            for (let note of itemNotes)
                this.endAutomaticBrace(note);
            // (and the areas that the word before left for its next syllable)
            setAreaBoundaries(items, this.marksForNext.areas);
            this.marksForNext = Object.assign(Object.assign({}, this.marksForNext), { areas: {} });
            setAreaBoundaries(items, areas);
            // so that updateMappingsFromSource can reset them at the same point
            if (resetAccidentals) {
                items[0].resetsAccidentalsBefore = true;
                resetAccidentals = false;
            }
            if (insertionIndex >= 0)
                insertionIndex -= elementCountForNotations(items);
            items[0].firstOfSyllable = !!printedText;
            items[0].firstOfParentheses = true;
            notations.push(...items);
            // add the lyrics and/or alText to the first notation that makes sense...
            var notationWithLyrics = null;
            for (var i = 0; i < items.length; i++) {
                var cne = items[i];
                if (cne.isAccidental && i + 1 < items.length)
                    continue;
                notationWithLyrics = cne;
                break;
            }
            // (exec() of "undefined", which matches nothing, so lastIndex goes back to 0)
            var m = __altTranslationRegex.exec(undefined);
            let indexOffset = 0;
            while ((m = __altTranslationRegex.exec(lyricText))) {
                let index = m.index;
                lyricText =
                    lyricText.slice(0, index) + lyricText.slice(index + m[0].length);
                index += sourceIndex + indexOffset + 1;
                if (typeof m[1] === "string") {
                    let elem = new AboveLinesText(ctxt, m[1], notationWithLyrics, index + 4);
                    elem.alIndex = alText.push(elem) - 1;
                }
                else if (typeof m[2] === "string") {
                    let elem = new AboveLinesText(ctxt, m[3], notationWithLyrics, index + m[2].length);
                    elem.alIndex = alText.push(elem) - 1;
                }
                else {
                    let elem = new TranslationText(ctxt, m[3], notationWithLyrics, index);
                    elem.translationIndex = translationText.push(elem) - 1;
                }
                indexOffset += m[0].length;
                __altTranslationRegex.exec(undefined);
            }
            // (Gregorio's controls alone aren't a lyric; createSyllableLyrics() takes them out of one)
            if (readSyllableControls(lyricText, {}) === "")
                lyricText = "";
            if (lyricText === "" && alText.length === 0)
                continue;
            if (notationWithLyrics === null)
                return mappingOf();
            if (alText.length)
                notationWithLyrics.alText = alText;
            if (translationText.length) {
                notationWithLyrics.translationText = translationText;
                for (i = 0; i < translationText.length; ++i) {
                    let transText = translationText[i];
                    if (transText.textAnchor === "end" && lastTranslationNeumes[0]) {
                        let lastTranslationText = lastTranslationNeumes[0].translationText[i];
                        if (lastTranslationText)
                            lastTranslationText.endNeume = notationWithLyrics;
                    }
                }
                lastTranslationNeumes[0] = notationWithLyrics;
            }
            if (lyricText === "")
                continue;
            var proposedLyricType;
            // if it's not a neume or a TextOnly notation, then make the lyrics a directive
            if (!cne.isNeume && cne.constructor !== TextOnly)
                proposedLyricType = LyricType.Directive;
            // otherwise trye to guess the lyricType for the first lyric anyway
            else if (currSyllable === 0 && j === matches.length - 1)
                proposedLyricType = LyricType.SingleSyllable;
            else if (currSyllable === 0 && j < matches.length - 1)
                proposedLyricType = LyricType.BeginningSyllable;
            else if (j === matches.length - 1)
                proposedLyricType = LyricType.EndingSyllable;
            else
                proposedLyricType = LyricType.MiddleSyllable;
            currSyllable++;
            var lyrics = this.createSyllableLyrics(ctxt, lyricText, proposedLyricType, notationWithLyrics, items, sourceIndex + match.index);
            if (lyrics === null || lyrics.length === 0)
                continue;
            notationWithLyrics.lyrics = lyrics;
        }
        return mappingOf();
    }
    // returns an array of lyrics (an array because each syllable can have multiple lyrics)
    static createSyllableLyrics(ctxt, text, proposedLyricType, notation, notations, sourceIndex) {
        var lyrics = [];
        // an extension to gabc: multiple lyrics per syllable can be separated by a |
        var lyricTexts = text.split("|");
        for (var i = 0; i < lyricTexts.length; i++) {
            var lyricText = lyricTexts[i];
            if (i > 0) {
                if (lyricText.match(/\s$/)) {
                    lyricText = lyricText.replace(/\s+$/, "");
                    proposedLyricType = LyricType.EndingSyllable;
                }
                else {
                    proposedLyricType = LyricType.MiddleSyllable;
                }
            }
            // Gregorio's controls, which aren't printed: <eu> and <nlba> (which
            // createMappingFromWord() read), <clear> and <pr> (only the first <pr>
            // counts, as in Gregorio).  The lyric's source starts after any at its start.
            var lyricSourceIndex = sourceIndex + __leadingControlsRegex.exec(lyricText)[0].length;
            var clear = false;
            var protrusion;
            lyricText = lyricText
                .replace(__lyricAreaTagRegex, "")
                .replace(__lyricClearRegex, () => {
                clear = true;
                return "";
            })
                .replace(__lyricProtrusionRegex, (tag, factor, index) => {
                if (!protrusion)
                    protrusion = { factor: factor ? parseFloat(factor) : undefined, textIndex: index };
                return "";
            });
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
            const vtags = [];
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
                if (indexClosingBracket >= 0 &&
                    indexClosingBracket > centerStartIndex) {
                    const getTrueIndex = (indexWithoutVTags) => {
                        // map indices back to the lyricText with the V tags:
                        let accum = 0;
                        // (index is a string, which compares with a number as the number it is)
                        for (let index in vtags) {
                            if (vtags.hasOwnProperty(index) && indexWithoutVTags >= index) {
                                accum += vtags[index];
                            }
                            else {
                                break;
                            }
                        }
                        return indexWithoutVTags + accum;
                    };
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
                }
                else
                    centerStartIndex = -1; // if there's no closing bracket, don't enable centering
            }
            var lyric = this.makeLyric(ctxt, lyricText, proposedLyricType, notation, notations, lyricSourceIndex);
            if (centerStartIndex >= 0) {
                // update indices in case there had been any tags, etc.
                let textIndex = 0, centerEndIndex = -1;
                for (let span of lyric.spans) {
                    if (centerStartIndex >= span.index &&
                        centerStartIndex <= span.index + span.text.length) {
                        centerEndIndex = centerStartIndex + centerLength;
                        centerStartIndex += textIndex - span.index;
                    }
                    if (centerEndIndex >= 0 &&
                        centerEndIndex >= span.index &&
                        centerEndIndex <= span.index + span.text.length) {
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
            if (clear)
                lyric.clear = true;
            if (protrusion) {
                protrusion.textIndex = lyricTextIndex(ctxt, lyric, lyricText, protrusion.textIndex);
                lyric.protrusion = protrusion;
            }
            lyric.lyricIndex = lyrics.push(lyric) - 1;
            sourceIndex += lyricTexts[i].length + 1;
        }
        notation.lyrics = lyrics;
        return lyrics;
    }
    static makeLyric(ctxt, text, lyricType, notation, notations, sourceIndex) {
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
            }
            else if (lastChar === " ") {
                if (lyricType === LyricType.MiddleSyllable)
                    lyricType = LyricType.EndingSyllable;
                else if (lyricType === LyricType.BeginningSyllable)
                    lyricType = LyricType.SingleSyllable;
                text = text.slice(0, -1);
            }
            else if (["—", "–"].includes(lastChar)) {
                // an em dash or en dash remains part of the syllable text and prevents a
                // connecting hyphen from ever being drawn before the next syllable,
                // but the syllables are still laid out as part of a single word
                preventConnector = true;
            }
            else if (/<\/e>$/.test(text) ||
                (ctxt.italicMeansElision && /<\/i>$/.test(text))) {
                // must be an elision
                elides = true;
            }
        }
        if (text.match(/^(?:[*†]+|i+j|\d+)\.?$/))
            lyricType = LyricType.Directive;
        var lyric = new Lyric(ctxt, text, lyricType, notation, notations, sourceIndex);
        lyric.elidesToNext = elides;
        if (forceConnector)
            lyric.setForceConnector(true);
        if (preventConnector)
            lyric.setPreventConnector(true);
        return lyric;
    }
    // takes a string of gabc notations and creates exsurge objects out of them.
    // returns an array of notations.
    static parseNotations(ctxt, data, sourceIndex, insertionIndex) {
        // if there is no data, then this must be a text only object
        if (!data)
            return [new TextOnly(sourceIndex, 0)];
        var baseSourceIndex = sourceIndex;
        var sourceLength = 0;
        var notations = [];
        var notes = [];
        var trailingSpace = DefaultTrailingSpace;
        // whether the data so far ends with a / or a space after a neume that the line can break at
        var endsWithSpace = false;
        // what Gregorio's [[, <nlba> and @[ (and a </nlba> before any note) mark on
        // the next note, starting with those that the notes before left (see
        // createMappingFromWord()); any left at the end are left for the next notes
        var nextNoteMarks = this.marksForNext.noteMarks.slice();
        this.marksForNext = Object.assign(Object.assign({}, this.marksForNext), { noteMarks: [] });
        // the space before the next note, where a mark between notes ends the neume
        var spaceBeforeNextNote = null;
        // whether the next notation is in the same one of Gregorio's elements as
        // the last (see ChantNotationElement.continuesElement): after a !, /!,
        // /0, [[ or ]], or after an accidental
        var joinsNextElement = false;
        // the notes in Gregorio's automatic fusions (@[…]), which end with the notes
        var autoFused = new Set();
        var autoFusing = false;
        // the last note before a mark, if any (the marks after it are recorded on it)
        var lastNote = () => {
            if (notes.length)
                return notes[notes.length - 1];
            for (let i = notations.length - 1; i >= 0; i--) {
                let notationNotes = notations[i].notes;
                if (notationNotes && notationNotes.length)
                    return notationNotes[notationNotes.length - 1];
            }
            return null;
        };
        var addToLastSourceGabc = (gabc) => {
            if (notes.length > 0) {
                notes[notes.length - 1].sourceGabc += gabc;
            }
        };
        // ends the neume before a space (/0, /!, /, //, /[n] or a space), which
        // the line can break at only if it is breakable
        var addSpace = (atom, space, breakable) => {
            // (a space at the very end that the line can't break at, such as /0
            // or a backspace, still keeps the neume with the next syllable's)
            endsWithSpace = breakable && (endsWithSpace || notes.length > 0);
            let prevNotation = notations[notations.length - 1];
            if (!notes.length &&
                data[match.index - 1] === "!" &&
                prevNotation &&
                prevNotation.isNeume) {
                // a space after a ! can't be broken: the neume before it
                // already keeps with the next one, so it only needs the width
                prevNotation.trailingSpace = space;
            }
            let endsNeume = notes.length > 0;
            trailingSpace = space;
            addToLastSourceGabc(atom);
            addNotation(null);
            if (endsNeume && !breakable)
                notations[notations.length - 1].allowLineBreakBeforeNext = false;
            // (Gregorio's spaces inside an element; any other ends it)
            joinsNextElement = atom === "/0" || atom === "/!";
        };
        var addNotation = (notation) => {
            // first, if we have any notes left over, we create a neume out of them
            if (notes.length > 0) {
                // create neume(s)
                var neumes = notes.some((note) => note.fused || autoFused.has(note))
                    ? this.createFusedNeumes(ctxt, notes, trailingSpace, autoFused)
                    : this.createNeumesFromNotes(ctxt, notes, trailingSpace);
                joinsNextElement = this.joinElements(neumes, joinsNextElement);
                for (var i = 0; i < neumes.length; i++)
                    notations.push(neumes[i]);
                notes = [];
            }
            // reset the trailing space
            trailingSpace = DefaultTrailingSpace;
            // then, if we're passed a notation, let's add it
            // also, perform chant logic here
            if (notation !== null) {
                let prevNotation = notations[notations.length - 1];
                notation.sourceIndex = sourceIndex;
                notation.sourceGabc = match[0];
                // (as in Gregorio, an accidental starts an element, unless a !, /!
                // or /0 is before it, and the notes after it are in its element)
                notation.continuesElement = !!notation.isAccidental && joinsNextElement;
                joinsNextElement = !!notation.isAccidental;
                if (notation.isClef) {
                    ctxt.activeClef = notation;
                    if (secondClef)
                        notation.secondClef = secondClef;
                    if (prevNotation &&
                        prevNotation.trailingSpace.isDefault &&
                        prevNotation.isDivider) {
                        prevNotation.trailingSpace = TrailingSpaceForAccidental;
                    }
                }
                else if (notation.isAccidental) {
                    ctxt.activeClef.activeAccidental = notation;
                }
                else if (notation.trailingSpace.isDefault &&
                    notation instanceof Signs.Custos) {
                    notation.trailingSpace = TrailingSpaceForAccidental;
                }
                else if (notation.resetsAccidentals)
                    ctxt.activeClef.resetAccidentals();
                // a no-line-break area that starts before a notation that isn't a note starts at it
                if (nextNoteMarks.includes(markNoLineBreakStart)) {
                    markNoLineBreakStart(notation);
                    nextNoteMarks = nextNoteMarks.filter((mark) => mark !== markNoLineBreakStart);
                }
                notations.push(notation);
            }
        };
        var regex = new RegExp(__notationsRegex);
        var match;
        // the second clef of the clef being parsed (gabc c1@c4)
        var secondClef;
        while ((match = regex.exec(data))) {
            sourceIndex = baseSourceIndex + match.index;
            sourceLength = match[0].length;
            var atom = match[0];
            var bar = match[__notationsRegex_group_bar];
            // a second clef goes on the clef before it, which is parsed below
            var secondClefMatch = __secondClefRegex.exec(atom);
            secondClef =
                secondClefMatch &&
                    this.createClef(secondClefMatch[2], parseInt(secondClefMatch[4], 10), !!secondClefMatch[3]);
            if (secondClefMatch)
                atom = secondClefMatch[1];
            // a bar can be followed by _ (a brace carrying the melody over it) and ' (a vertical episema)
            let barSigns = bar ? /['_]*$/.exec(bar)[0] : "";
            let barWithCarryover = barSigns.includes("_");
            if (barSigns) {
                atom = atom.slice(0, -barSigns.length);
            }
            // (addSpace() sets it for a space)
            if (atom !== " " && atom[0] !== "/" && atom !== "[nocustos]" && !__noteMarkRegex.test(atom))
                endsWithSpace = false;
            // handle the clefs and dividers here
            switch (atom) {
                case ",":
                case ",0":
                    addNotation(new Signs.QuarterBar(barWithCarryover, atom === ",0"));
                    break;
                case "`":
                case "`0":
                    addNotation(new Signs.Virgula(barWithCarryover, atom === "`0"));
                    break;
                case "^":
                case "^0":
                    addNotation(new Signs.DivisioMinimis(barWithCarryover, atom === "^0"));
                    break;
                // Gregorio's parenthesized bars (`0? and ,0? high, as `0 and ,0 are)
                case ",?":
                case ",0?":
                case "`?":
                case "`0?": {
                    let high = atom[1] === "0";
                    let parenthesizedBar = atom[0] === "," ? new Signs.QuarterBar(barWithCarryover, high) : new Signs.Virgula(barWithCarryover, high);
                    parenthesizedBar.parenthesized = true;
                    addNotation(parenthesizedBar);
                    break;
                }
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
                case ":?":
                    addNotation(new Signs.FullBar(barWithCarryover, atom === ":?"));
                    break;
                case "::":
                    addNotation(new Signs.DoubleBar());
                    break;
                // the parenthesized bars (`? ,? and ,0?) are not supported yet
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
                case "fb1":
                case "fb2":
                case "fb3":
                case "fb4":
                case "fb5":
                    addNotation((ctxt.activeClef = this.createClef(atom[0], parseInt(atom[2], 10), true)));
                    break;
                case "z":
                case "z+":
                case "z-":
                case "Z":
                case "Z+":
                case "Z-":
                    addNotation(new ChantLineBreak(atom[0] === "z", atom[1] === "+" ? "force" : atom[1] === "-" ? "none" : "auto"));
                    break;
                case "z0":
                    addNotation(new Signs.Custos(true));
                    break;
                case "[nocustos]": {
                    // (after a space: it applies to the note before the space, and with
                    // no note before it, to a line break before the next note)
                    let note = lastNote();
                    if (note)
                        note.noCustos = true;
                    else
                        nextNoteMarks.push((note) => (note.noCustosBefore = true));
                    break;
                }
                // Gregorio's marks between notes, which are recorded on the notes
                // after or before them.  Brackets end a neume as ! does, and
                // no-line-break areas as / does, as they end Gregorio's glyphs and
                // elements, so that their marks are where neumes start or end.
                case "[[":
                    nextNoteMarks.push(markBracketStart);
                    if (spaceBeforeNextNote === null)
                        spaceBeforeNextNote = 0;
                    break;
                case "]]": {
                    // (as in Gregorio, a ]] with no notes since the [[ doesn't close
                    // the brackets, which start at the next note)
                    let note = lastNote();
                    if (note && !nextNoteMarks.includes(markBracketStart))
                        note.bracketEnd = true;
                    if (spaceBeforeNextNote === null)
                        spaceBeforeNextNote = 0;
                    break;
                }
                case "<nlba>":
                    nextNoteMarks.push(markNoLineBreakStart);
                    spaceBeforeNextNote = TrailingSpaceMultiple(1);
                    break;
                case "</nlba>": {
                    // (at the start of the notes, the area ends at the first note instead)
                    let markEnd = (note) => (note.noLineBreak = Object.assign(Object.assign({}, note.noLineBreak), { end: true }));
                    let note = lastNote();
                    if (note)
                        markEnd(note);
                    else
                        nextNoteMarks.push(markEnd);
                    spaceBeforeNextNote = TrailingSpaceMultiple(1);
                    break;
                }
                case "@[":
                    nextNoteMarks.push(markAutoFusionStart);
                    break;
                case "]": {
                    let note = lastNote();
                    if (note)
                        note.autoFusion = Object.assign(Object.assign({}, note.autoFusion), { end: true });
                    autoFusing = false;
                    // (an @[ with no notes before the ] fuses none after it)
                    nextNoteMarks = nextNoteMarks.filter((mark) => mark !== markAutoFusionStart);
                    break;
                }
                // spacing indicators
                case "!":
                    trailingSpace = 0;
                    addToLastSourceGabc(atom);
                    addNotation(null);
                    joinsNextElement = true;
                    break;
                case " ":
                    // (by default the same width as //, see ctxt.neumeSpaceMultipliers)
                    addSpace(atom, NeumeSpace(" "), true);
                    break;
                case "/0":
                case "/!":
                    // spaces within a neume, which the line can't break at
                    addSpace(atom, NeumeSpace(atom), false);
                    break;
                default:
                    // might be a number of slashes, a custos, might be an accidental, or might be a note
                    if (atom.startsWith("/[")) {
                        // /[n]: n times /, where a negative n moves the next neume back
                        let factor = parseFloat(atom.slice(2, -1));
                        addSpace(atom, NeumeSpace("/", factor), factor > 0);
                    }
                    else if (atom[0] === "/") {
                        // (/// and more: // and then / for each further slash)
                        let slashes = atom.length;
                        addSpace(atom, slashes === 1
                            ? NeumeSpace("/")
                            : (ctxt) => NeumeSpace("//")(ctxt) + NeumeSpace("/", slashes - 2)(ctxt), true);
                    }
                    else if (atom[0] === "[") {
                        // Gregorio's instructions that aren't after a note: the start or
                        // end of a block of episema tuning, and a custom ledger line,
                        // which is introduced just before the next note
                        let instruction = atom.slice(1, -1);
                        let results = instruction.match(__ledgerLineRegex);
                        let line = results && !results[2] && this.customLedgerLine(results);
                        if (line) {
                            let lineBefore = Object.assign(Object.assign({}, line), { before: true });
                            nextNoteMarks.push((note) => (note.customLedgerLines = (note.customLedgerLines || []).concat(lineBefore)));
                        }
                        else
                            this.processEpisemaTuning(instruction, null);
                    }
                    else if (atom.length > 1 && atom.endsWith("+")) {
                        // custos
                        var custos = new Signs.Custos();
                        this.setStaffPositionAndOffset(custos, atom, ctxt.activeClef);
                        addNotation(custos);
                    }
                    else if (atom.length > 1 && /[xXyY#]/.test(atom[1])) {
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
                        var noteArray = [];
                        this.createNoteFromData(ctxt, ctxt.activeClef, atom, noteArray, sourceIndex);
                        // X, Y, and ## are Gregorio's soft flat, natural, and sharp
                        var accidental = new Signs.Accidental(noteArray[0].staffPosition, accidentalType, /^.(?:[XY]|##)/.test(atom));
                        if (atom[2] === "?")
                            accidental.parenthesized = true;
                        accidental.pitch = ctxt.activeClef.staffPositionToPitch(noteArray[0].staffPosition);
                        accidental.sourceIndex = sourceIndex;
                        accidental.sourceLength = sourceLength;
                        accidental.trailingSpace = TrailingSpaceForAccidental;
                        ctxt.activeClef.activeAccidental = accidental;
                        addNotation(accidental);
                    }
                    else if (atom.length > 1 && atom[0] === "{") {
                        trailingSpace = 0;
                        addNotation(null);
                        let bracketedNotations = this.parseNotations(ctxt, match[__notationsRegex_group_insideBraces], sourceIndex + 1);
                        nextNoteMarks.push(...this.marksForNext.noteMarks);
                        this.marksForNext = Object.assign(Object.assign({}, this.marksForNext), { noteMarks: [] });
                        // Set the width of these notations to 0
                        bracketedNotations.forEach(neume => {
                            neume.hasNoWidth = true;
                            neume.firstWithNoWidth = bracketedNotations[0];
                        });
                        notations.push(...bracketedNotations);
                        // (Gregorio ends an element at a { or a })
                        joinsNextElement = false;
                    }
                    else {
                        // looks like it's a note
                        if (spaceBeforeNextNote !== null) {
                            if (notes.length) {
                                trailingSpace = spaceBeforeNextNote;
                                addNotation(null);
                                // (Gregorio keeps the notes either side of [[ or ]] in one
                                // element, as it does at a !, and ends it at <nlba> or </nlba>)
                                joinsNextElement = spaceBeforeNextNote === 0;
                            }
                            spaceBeforeNextNote = null;
                        }
                        if (insertionIndex === -1) {
                            trailingSpace = TrailingSpaceMultiple(1);
                            addNotation(null);
                        }
                        let firstNewNote = notes.length;
                        this.createNoteFromData(ctxt, ctxt.activeClef, atom, notes, sourceIndex);
                        for (let mark of nextNoteMarks)
                            mark(notes[firstNewNote]);
                        nextNoteMarks = [];
                        if (notes[firstNewNote].autoFusion && notes[firstNewNote].autoFusion.start)
                            autoFusing = true;
                        if (autoFusing)
                            for (let i = firstNewNote; i < notes.length; i++)
                                autoFused.add(notes[i]);
                        --insertionIndex;
                    }
                    break;
            }
            if (barSigns.includes("'"))
                notations[notations.length - 1].hasVerticalEpisema = true;
        }
        // finish up any remaining notes we have left
        addNotation(null);
        this.marksForNext = Object.assign(Object.assign({}, this.marksForNext), { noteMarks: nextNoteMarks });
        // a no-line-break area that starts or ends in the notes starts or ends at their notation
        for (let notation of notations) {
            for (let note of notation.notes || []) {
                if (note.noLineBreak)
                    notation.noLineBreak = Object.assign(Object.assign({}, notation.noLineBreak), note.noLineBreak);
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
    // a do (c) or fa (f) clef on a line from 1 to 5, with or without a flat
    static createClef(type, line, flat) {
        var staffPosition = 2 * line - 1;
        if (type === "c")
            return new DoClef(staffPosition, 2, flat ? new Signs.Accidental(staffPosition - 1, Signs.AccidentalType.Flat) : null);
        // the flat is on the B above the F, or, when that's above a
        // four-line staff, the B below (as Gregorio puts it)
        return new FaClef(staffPosition, 2, flat
            ? new Signs.Accidental(staffPosition <= 3 ? staffPosition + 3 : staffPosition - 4, Signs.AccidentalType.Flat)
            : null);
    }
    // which of Gregorio's elements the neumes made from one run of notes are
    // in (the first is in the element before it if joinsPreviousElement), as
    // gabc_det_elements_from_glyphs() decides it
    // (src/gabc/gabc-elements-determination.c).  It goes by Gregorio's
    // glyphs, which nextGregorioGlyph() finds in the notes of the neumes
    // between fused ones, whatever neumes exsurge makes of them.  A fused
    // neume (gabc @) is one glyph, as Gregorio keeps fused glyphs in one
    // element.  A glyph starts an element, except that a glyph fused to the
    // one before, a stropha and descending inclinata join the glyph before
    // them, a glyph joins an inclinatum (or ascending inclinata) before it, a
    // single note at the same pitch, inclinata less than a third away or a
    // pes it rises from as a virga; but a mora or a stropha aucta ends an
    // element.  Returns whether an accidental right after the notes is in
    // their last element (after an inclinatum).
    static joinElements(neumes, joinsPreviousElement) {
        var tailLiquescence = LiquescentType.Large | LiquescentType.Small | LiquescentType.Ascending | LiquescentType.Descending;
        var isInclinatum = (note) => note.shape === NoteShape.Inclinatum;
        var glyphs = [];
        var run = [];
        var runIsFused = false;
        var endRun = () => {
            for (let i = 0; i < run.length;) {
                let glyph = nextGregorioGlyph(run, i);
                glyphs.push({ notes: run.slice(i, i + glyph.length), kind: glyph.kind, fused: runIsFused && i === 0 });
                i += glyph.length;
            }
            run = [];
        };
        for (let neume of neumes) {
            let isFusedNeume = neume instanceof Neumes.FusedNeume;
            if (isFusedNeume || neume.fusedToPrevious || !run.length) {
                endRun();
                runIsFused = !!neume.fusedToPrevious;
            }
            if (isFusedNeume)
                glyphs.push({ notes: neume.notes.slice(), fused: !!neume.fusedToPrevious, isFusedNeume });
            else
                run.push(...neume.notes);
        }
        endRun();
        // (a glyph of one note: a punctum, a virga or the like, and a bivirga or
        // distropha, the glyphs of a virga or stropha with more notes)
        var isSingleNote = (glyph) => !isInclinatum(glyph.notes[0]) &&
            (glyph.notes.length === 1 ||
                (!glyph.isFusedNeume &&
                    (glyph.notes[0].shape === NoteShape.Virga || glyph.notes[0].shape === NoteShape.Stropha)));
        var isInclinata = (glyph) => isInclinatum(glyph.notes[0]);
        var isPes = (glyph) => !glyph.isFusedNeume && glyph.kind === Neumes.FusedGlyphKind.Pes;
        var isVirga = (glyph) => !glyph.isFusedNeume && glyph.kind === Neumes.FusedGlyphKind.Virga;
        var isStropha = (glyph) => glyph.notes.length === 1 && glyph.notes[0].shape === NoteShape.Stropha;
        var isDescending = (glyph) => glyph.notes.length > 1 && glyph.notes[glyph.notes.length - 1].staffPosition < glyph.notes[0].staffPosition;
        var last = (glyph) => glyph.notes[glyph.notes.length - 1];
        var doNotCut = joinsPreviousElement, forceCut = false, previous = null;
        // (the first notes of the glyphs that start an element)
        var starts = new Set();
        glyphs.forEach((glyph, i) => {
            var cut = false;
            if (i > 0 && glyph.fused)
                doNotCut = true;
            else if (forceCut) {
                cut = true;
                previous = null;
            }
            forceCut = false;
            if (isInclinata(glyph) && !isDescending(glyph)) {
                if (!doNotCut)
                    cut = true;
                doNotCut = true;
            }
            else if (isStropha(glyph) || (isInclinata(glyph) && isDescending(glyph))) {
                doNotCut = false;
                if (isStropha(glyph) && last(glyph).liquescent & (LiquescentType.Ascending | LiquescentType.Descending))
                    forceCut = true;
            }
            else {
                let step = previous ? glyph.notes[0].staffPosition - last(previous).staffPosition : 0;
                if (previous &&
                    !(last(previous).liquescent & tailLiquescence) &&
                    ((isSingleNote(previous) && step === 0) ||
                        (isInclinata(previous) && isSingleNote(glyph) && Math.abs(step) < 2) ||
                        (isPes(previous) && isVirga(glyph) && step >= 0)))
                    doNotCut = false;
                else if (doNotCut)
                    doNotCut = false;
                else
                    cut = true;
            }
            if (last(glyph).morae.length)
                forceCut = true;
            previous = glyph;
            // (the first glyph is in the element before it only after a !, /!, /0 or an accidental)
            if (i === 0)
                cut = !joinsPreviousElement;
            if (cut)
                starts.add(glyph.notes[0]);
        });
        // (a neume continues the element before it unless a glyph that starts one starts the neume)
        for (let neume of neumes) {
            neume.continuesElement = !starts.has(neume.notes[0]);
            neume.notes.forEach((note, i) => {
                if (i > 0 && starts.has(note))
                    note.startsElement = true;
            });
        }
        return doNotCut && !forceCut;
    }
    static createNeumesFromNotes(ctxt, notes, finalTrailingSpace) {
        var neumes = [];
        var firstNoteIndex = 0;
        var currNoteIndex = 0;
        // here we use a simple finite state machine to create the neumes from the notes
        // createNeume is helper function which returns the next state after a neume is created
        // (unknownState). Each state object has a neume() function and a handle() function.
        // neume() allows us to create the neume of the state in the event that we run out
        // of notes. handle() gives the state an opportunity to examine the currNote and
        // determine what to do...either transition to a different neume/state, or
        // continue building the neume of that state. handle() returns the next state
        var createNeume = function (neume, includeCurrNote, includePrevNote = true) {
            // add the notes to the neume
            var lastNoteIndex;
            if (includeCurrNote)
                lastNoteIndex = currNoteIndex;
            else if (includePrevNote)
                lastNoteIndex = currNoteIndex - 1;
            else
                lastNoteIndex = currNoteIndex - 2;
            // (which leaves no state to go on to)
            if (lastNoteIndex < 0)
                return undefined;
            while (firstNoteIndex <= lastNoteIndex) {
                let note = notes[firstNoteIndex++];
                neume.addNote(note);
                if (note.alText) {
                    if (!neume.alText)
                        neume.alText = [];
                    neume.alText.push(note.alText);
                    note.alText.noteIndex = firstNoteIndex - 1;
                }
            }
            neumes.push(neume);
            if (includeCurrNote === false) {
                currNoteIndex--;
                if (includePrevNote === false)
                    currNoteIndex--;
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
        var unknownState = {
            neume: function () {
                return new Neumes.Punctum();
            },
            handle: function (currNote, prevNote) {
                // a linea (gabc =) is a neume of its own, whatever its shape
                if (currNote.linea)
                    return createNeume(new Neumes.Punctum(), true);
                else if (currNote.shape === NoteShape.Virga)
                    return virgaState;
                else if (currNote.shape === NoteShape.Stropha)
                    return apostrophaState;
                else if (currNote.shape === NoteShape.Oriscus)
                    return oriscusState;
                else if (currNote.shape === NoteShape.Inclinatum)
                    return punctaInclinataState;
                // (a cavum goes into a neume like any other note, and is drawn hollow
                // there, but a punctum cavum between lines, r0, stands alone)
                else if (currNote.shapeModifiers & NoteShapeModifiers.Cavum &&
                    currNote.shapeModifiers & NoteShapeModifiers.Linea)
                    return createNeume(new Neumes.Punctum(), true);
                else
                    return punctumState;
            }
        };
        var punctumState = {
            neume: function () {
                return new Neumes.Punctum();
            },
            handle: function (currNote, prevNote, notesRemaining) {
                // an oriscus scapus is joined to the lower punctum before it, as in
                // Gregorio (unless either is liquescent)
                if (currNote.shape === NoteShape.Oriscus &&
                    currNote.shapeModifiers & NoteShapeModifiers.Stemmed &&
                    currNote.staffPosition > prevNote.staffPosition &&
                    prevNote.liquescent === LiquescentType.None &&
                    currNote.liquescent === LiquescentType.None)
                    return pesOriscusState;
                if (currNote.shape || prevNote.liquescent === LiquescentType.Small) {
                    var neume = new Neumes.Punctum();
                    var state = createNeume(neume, false);
                    // if the current note is on a space within the staff AND the previous note is on the line below AND the previous note has a mora,
                    // then we went the trailing space at its default of intraNeumeSpacing to prevent the dot from running up into the current note.
                    // Otherwise, we want no trailing space.
                    if (currNote.staffPosition > prevNote.staffPosition &&
                        (currNote.staffPosition % 2 === 1 ||
                            prevNote.staffPosition !== currNote.staffPosition - 1 ||
                            !prevNote.morae ||
                            prevNote.morae.length === 0))
                        neume.trailingSpace = 0;
                    return state;
                }
                if (currNote.staffPosition > prevNote.staffPosition) {
                    if (currNote.ictus)
                        currNote.ictus.positionHint = MarkingPositionHint.Above;
                    // a pes quadratum (gabc q) has no more notes, as in Gregorio
                    if (prevNote.quadratum)
                        return createNeume(new Neumes.PesQuadratum(), true);
                    return podatusState;
                }
                else if (currNote.staffPosition < prevNote.staffPosition) {
                    if (prevNote.ictus)
                        prevNote.ictus.positionHint = MarkingPositionHint.Above;
                    // (TypeScript thinks the shape must be 0 by now, from the check above)
                    if (currNote.shape === NoteShape.Inclinatum)
                        return climacusState;
                    else {
                        return clivisState;
                    }
                }
                else if (!prevNote.morae || !prevNote.morae.length) {
                    return distrophaState;
                }
                return createNeume(new Neumes.Punctum(), false);
            }
        };
        var punctaInclinataState = {
            neume: function () {
                return new Neumes.PunctaInclinata();
            },
            handle: function () {
                if (currNote.shape !== NoteShape.Inclinatum)
                    return createNeume(new Neumes.PunctaInclinata(), false);
                else
                    return punctaInclinataState;
            }
        };
        var oriscusState = {
            neume: function () {
                return new Neumes.Oriscus();
            },
            handle: function (currNote, prevNote) {
                // (the oriscus points to the note after it, unless gabc designates its direction)
                if (currNote.shape === NoteShape.Default) {
                    if (currNote.staffPosition > prevNote.staffPosition)
                        return createNeume(new Neumes.PesQuassus(), true);
                    else if (currNote.staffPosition < prevNote.staffPosition)
                        return createNeume(new Neumes.Clivis(), true);
                }
                // stand alone oriscus
                var neume = new Neumes.Oriscus(), state = createNeume(neume, false);
                // if the current note is on a space within the staff AND the previous note is on the line below AND the previous note has a mora,
                // then we went the trailing space at its default of intraNeumeSpacing to prevent the dot from running up into the current note.
                // Otherwise, we want no trailing space.
                if (currNote.staffPosition > prevNote.staffPosition &&
                    (currNote.staffPosition % 2 === 1 ||
                        prevNote.staffPosition !== currNote.staffPosition - 1 ||
                        !prevNote.morae ||
                        prevNote.morae.length === 0))
                    neume.trailingSpace = 0;
                return state;
            }
        };
        var pesOriscusState = {
            neume: function () {
                return new Neumes.PesOriscus();
            },
            handle: function (currNote, prevNote) {
                if (currNote.shape === NoteShape.Default &&
                    currNote.staffPosition > prevNote.staffPosition)
                    return salicusState;
                else
                    return createNeume(new Neumes.PesOriscus(), false);
            }
        };
        var podatusState = {
            neume: function () {
                return new Neumes.Podatus();
            },
            handle: function (currNote, prevNote) {
                if (currNote.staffPosition > prevNote.staffPosition) {
                    if (currNote.ictus)
                        currNote.ictus.positionHint = MarkingPositionHint.Above;
                    if (prevNote.ictus)
                        prevNote.ictus.positionHint = MarkingPositionHint.Below;
                    if (prevNote.shape === NoteShape.Oriscus)
                        return salicusState;
                    else
                        return scandicusState;
                }
                else if (currNote.staffPosition < prevNote.staffPosition) {
                    if (currNote.shape === NoteShape.Inclinatum)
                        return pesSubpunctisState;
                    else
                        return torculusState;
                }
                else
                    return createNeume(new Neumes.Podatus(), false);
            }
        };
        var clivisState = {
            neume: function () {
                return new Neumes.Clivis();
            },
            handle: function (currNote, prevNote) {
                if (currNote.shape === NoteShape.Default &&
                    currNote.staffPosition > prevNote.staffPosition) {
                    if (currNote.ictus)
                        currNote.ictus.positionHint = MarkingPositionHint.Above;
                    return porrectusState;
                }
                else if (currNote.staffPosition < prevNote.staffPosition &&
                    currNote.liquescent & LiquescentType.Small) {
                    return createNeume(new Neumes.Ancus(), true);
                }
                else {
                    return createNeume(new Neumes.Clivis(), false);
                }
            }
        };
        var climacusState = {
            neume: function () {
                return new Neumes.Climacus();
            },
            handle: function (currNote, prevNote) {
                if (currNote.shape !== NoteShape.Inclinatum)
                    return createNeume(new Neumes.Climacus(), false);
                else
                    return state;
            }
        };
        var porrectusState = {
            neume: function () {
                return new Neumes.Porrectus();
            },
            handle: function (currNote, prevNote) {
                if (currNote.shape === NoteShape.Default &&
                    currNote.staffPosition < prevNote.staffPosition)
                    return createNeume(new Neumes.PorrectusFlexus(), true);
                else
                    return createNeume(new Neumes.Porrectus(), false);
            }
        };
        var pesSubpunctisState = {
            neume: function () {
                return new Neumes.PesSubpunctis();
            },
            handle: function (currNote, prevNote) {
                if (currNote.shape !== NoteShape.Inclinatum)
                    return createNeume(new Neumes.PesSubpunctis(), false);
                else
                    return state;
            }
        };
        var salicusState = {
            neume: function () {
                return new Neumes.Salicus();
            },
            handle: function (currNote, prevNote) {
                if (currNote.shape === NoteShape.Default &&
                    currNote.staffPosition < prevNote.staffPosition)
                    return salicusFlexusState;
                else
                    return createNeume(new Neumes.Salicus(), false);
            }
        };
        var salicusFlexusState = {
            neume: function () {
                return new Neumes.SalicusFlexus();
            },
            handle: function (currNote, prevNote) {
                return createNeume(new Neumes.SalicusFlexus(), false);
            }
        };
        var scandicusState = {
            neume: function () {
                return new Neumes.Scandicus();
            },
            handle: function (currNote, prevNote) {
                if (prevNote.shape === NoteShape.Virga &&
                    currNote.shape === NoteShape.Inclinatum &&
                    currNote.staffPosition < prevNote.staffPosition) {
                    // if we get here, then it seems we have a podatus, now being followed by a climacus
                    // rather than a scandicus. react accordingly
                    return createNeume(new Neumes.Podatus(), false, false);
                }
                else if (currNote.shape === NoteShape.Default &&
                    currNote.staffPosition < prevNote.staffPosition)
                    return scandicusFlexusState;
                else
                    return createNeume(new Neumes.Scandicus(), false);
            }
        };
        var scandicusFlexusState = {
            neume: function () {
                return new Neumes.ScandicusFlexus();
            },
            handle: function (currNote, prevNote) {
                return createNeume(new Neumes.ScandicusFlexus(), false);
            }
        };
        var virgaState = {
            neume: function () {
                return new Neumes.Virga();
            },
            handle: function (currNote, prevNote) {
                if (currNote.shape === NoteShape.Inclinatum &&
                    currNote.staffPosition < prevNote.staffPosition)
                    return climacusState;
                else if (currNote.shape === NoteShape.Virga &&
                    currNote.staffPosition === prevNote.staffPosition)
                    return bivirgaState;
                else
                    return createNeume(new Neumes.Virga(), false);
            }
        };
        var bivirgaState = {
            neume: function () {
                return new Neumes.Bivirga();
            },
            handle: function (currNote, prevNote) {
                if (currNote.shape === NoteShape.Virga &&
                    currNote.staffPosition === prevNote.staffPosition)
                    return createNeume(new Neumes.Trivirga(), true);
                else
                    return createNeume(new Neumes.Bivirga(), false);
            }
        };
        var apostrophaState = {
            neume: function () {
                return new Neumes.Apostropha();
            },
            handle: function (currNote, prevNote) {
                if (currNote.staffPosition === prevNote.staffPosition)
                    return distrophaState;
                else
                    return createNeume(new Neumes.Apostropha(), false);
            }
        };
        var distrophaState = {
            neume: function () {
                return new Neumes.Distropha();
            },
            handle: function (currNote, prevNote) {
                if (currNote.staffPosition === prevNote.staffPosition) {
                    if (prevNote.morae && prevNote.morae.length) {
                        return createNeume(new Neumes.Distropha(), false);
                    }
                    else {
                        return tristrophaState;
                    }
                }
                else
                    return createNeume(new Neumes.Apostropha(), false, false);
            }
        };
        var tristrophaState = {
            neume: function () {
                return new Neumes.Tristropha();
            },
            handle: function (currNote, prevNote) {
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
        var torculusState = {
            neume: function () {
                return new Neumes.Torculus();
            },
            handle: function (currNote, prevNote) {
                if (currNote.shape === NoteShape.Default &&
                    currNote.staffPosition > prevNote.staffPosition) {
                    if (currNote.ictus)
                        currNote.ictus.positionHint = MarkingPositionHint.Above;
                    return torculusResupinusState;
                }
                return createNeume(new Neumes.Torculus(), false);
            }
        };
        var torculusResupinusState = {
            neume: function () {
                return new Neumes.TorculusResupinus();
            },
            handle: function (currNote, prevNote) {
                if (currNote.shape === NoteShape.Default &&
                    currNote.staffPosition < prevNote.staffPosition)
                    return createNeume(new Neumes.TorculusResupinusFlexus(), true);
                else
                    return createNeume(new Neumes.TorculusResupinus(), false);
            }
        };
        var state = unknownState;
        while (currNoteIndex < notes.length) {
            var prevNote = currNoteIndex > 0 ? notes[currNoteIndex - 1] : null;
            var currNote = notes[currNoteIndex];
            // a linea (gabc =) and the lower note of a pes quadratum (gabc q) start
            // a new neume, as in Gregorio
            if ((currNote.linea || currNote.quadratum) && state !== unknownState)
                state = createNeume(state.neume(), false);
            else
                // (only the first note has no previous note, and it starts with unknownState, which doesn't use it)
                state = state.handle(currNote, prevNote, notes.length - 1 - currNoteIndex);
            // if we are on the last note, then try to create a neume if we need to.
            if (currNoteIndex === notes.length - 1 && state !== unknownState)
                createNeume(state.neume(), true);
            currNoteIndex++;
        }
        setFinalTrailingSpace(ctxt, neumes, finalTrailingSpace);
        return neumes;
    }
    // makes neumes of notes that Gregorio fuses (gabc @ before a note, and
    // @[…]), as createNeumesFromNotes() makes them of other notes.  Gregorio's
    // glyphs end at each @, which fuses the glyph after it to the glyph before,
    // and at each end of @[…], in which it splits the notes into glyphs and
    // fuses each to the one before.  Glyphs that Gregorio fuses (see
    // fusedGlyphOfNeume()), fused one to the next, make a FusedNeume, and a
    // fused glyph of another kind (a torculus, say) is a neume of its own, right
    // after the neume before it with no space.
    static createFusedNeumes(ctxt, notes, finalTrailingSpace, autoFused) {
        var pieces = [];
        // (the first note of @[…] isn't fused, unless there's an @ before it)
        var startsArea = (note) => !!(note.autoFusion && note.autoFusion.start);
        // the neumes that the state machine makes of some notes; the first is
        // fused to the piece before if fused is
        var addNeumes = (someNotes, fused) => {
            this.createNeumesFromNotes(ctxt, someNotes, DefaultTrailingSpace).forEach((neume, i) => {
                var neumeFused = fused && i === 0;
                pieces.push({ glyph: fusedGlyphOfNeume(neume, neumeFused), neume, fused: neumeFused });
            });
        };
        // the notes outside @[…] between two @s, or an @ and the end: the glyphs
        // next to the @s are Gregorio's (see nextGregorioGlyph()), and the notes
        // between them make neumes as usual
        var addSegment = (segment, fusedAfter) => {
            var glyphs = [];
            for (var i = 0, fused = !!segment[0].fused && !isNeverFused(segment[0]); i < segment.length;) {
                var glyph = nextGregorioGlyph(segment, i);
                glyphs.push({ start: i, length: glyph.length, kind: glyph.kind, fused });
                fused = !!glyph.fusesNext;
                i += glyph.length;
            }
            // the glyphs fused to the @ before the segment, and to the @ after it
            var first = 0;
            while (first < glyphs.length && glyphs[first].fused && glyphs[first].kind)
                first++;
            var last = glyphs.length;
            if (fusedAfter)
                while (last > first &&
                    glyphs[last - 1].kind &&
                    (last === glyphs.length || glyphs[last].fused))
                    last--;
            var addGlyph = (glyph) => pieces.push({
                glyph: {
                    kind: glyph.kind,
                    notes: segment.slice(glyph.start, glyph.start + glyph.length),
                    fused: glyph.fused
                },
                fused: glyph.fused
            });
            glyphs.slice(0, first).forEach(addGlyph);
            if (last > first)
                addNeumes(segment.slice(glyphs[first].start, glyphs[last - 1].start + glyphs[last - 1].length), glyphs[first].fused);
            glyphs.slice(last).forEach(addGlyph);
        };
        // Gregorio's glyphs in @[…] (gabc_det_glyphs_from_notes() with
        // autofuse): the notes it fuses make fused glyphs, which splitFusion()
        // splits.  An oriscus, quilisma or virga starts one, as does a punctum
        // after other notes, and a virga or a liquescent (of any shape) ends one.
        // The other notes make neumes, fused to the glyph before if it ended
        // with its last note.
        var addAutoFused = (areaNotes) => {
            var fusing = [];
            var fusingIsFused = false;
            var others = [];
            var othersAreFused = false;
            var endedWithNote = false;
            // (Gregorio makes a stropha or virga reversa before a punctum the first
            // note of its fused glyph, as a glyph of its own, which splitFusion()
            // counts in the intervals)
            var fusingInterval = 0;
            var endFusing = () => {
                if (fusing.length)
                    pieces.push(...splitFusion(fusing, fusingIsFused, fusingInterval));
                fusing = [];
            };
            var endOthers = () => {
                if (others.length)
                    addNeumes(others, othersAreFused);
                others = [];
            };
            areaNotes.forEach((note) => {
                if (fusing.length &&
                    isTailLiquescent(note) &&
                    !note.fused &&
                    !(note.liquescent & LiquescentType.InitioDebilis)) {
                    fusing.push(note);
                    endFusing();
                    endedWithNote = true;
                }
                else if (isAutoFusible(note)) {
                    var previous = others[others.length - 1];
                    endOthers();
                    if (startsAutoFusedGlyph(note))
                        endFusing();
                    if (!fusing.length) {
                        fusingIsFused =
                            !!note.fused || (!startsArea(note) && !(note.liquescent & LiquescentType.InitioDebilis));
                        fusingInterval =
                            previous &&
                                !startsAutoFusedGlyph(note) &&
                                (previous.shape === NoteShape.Stropha || previous.shape === NoteShape.Virga)
                                ? gabcStaffPosition(note) - gabcStaffPosition(previous)
                                : 0;
                    }
                    fusing.push(note);
                    endedWithNote = isTailLiquescent(note) || note.shape === NoteShape.Virga;
                    if (endedWithNote)
                        endFusing();
                }
                else {
                    endFusing();
                    if (note.fused)
                        endOthers();
                    if (!others.length)
                        othersAreFused =
                            (!!note.fused || (!startsArea(note) && endedWithNote)) && !isNeverFused(note);
                    others.push(note);
                    endedWithNote = false;
                }
            });
            endFusing();
            endOthers();
        };
        // the notes in each @[…], and the notes outside them split at each @
        for (var start = 0; start < notes.length;) {
            var inArea = autoFused.has(notes[start]);
            var end = start + 1;
            while (end < notes.length &&
                autoFused.has(notes[end]) === inArea &&
                !(inArea && startsArea(notes[end])))
                end++;
            if (inArea)
                addAutoFused(notes.slice(start, end));
            else {
                for (var segmentStart = start; segmentStart < end;) {
                    var segmentEnd = segmentStart + 1;
                    while (segmentEnd < end && !notes[segmentEnd].fused)
                        segmentEnd++;
                    addSegment(notes.slice(segmentStart, segmentEnd), segmentEnd < notes.length && !!notes[segmentEnd].fused && !isNeverFused(notes[segmentEnd]));
                    segmentStart = segmentEnd;
                }
            }
            start = end;
        }
        // the neumes: each run of glyphs fused one to the next makes a
        // FusedNeume, as does a fused glyph on its own (a flexus or porrectus
        // without its stem)
        var neumes = [];
        var fusedToPrevious = [];
        for (var first = 0; first < pieces.length;) {
            var last = first + 1;
            if (pieces[first].glyph)
                while (last < pieces.length && pieces[last].fused && pieces[last].glyph)
                    last++;
            var run = pieces.slice(first, last);
            var runNeumes;
            if (run.length > 1 || (run[0].glyph && run[0].fused)) {
                var neume = new Neumes.FusedNeume(run.map((piece) => piece.glyph));
                // (it ends as the neume of its last glyph did)
                var lastNeume = run[run.length - 1].neume;
                if (lastNeume) {
                    neume.trailingSpace = lastNeume.trailingSpace;
                    neume.keepWithNext = lastNeume.keepWithNext;
                    neume.allowLineBreakBeforeNext = lastNeume.allowLineBreakBeforeNext;
                }
                neume.notes.forEach((note, i) => {
                    if (note.alText) {
                        if (!neume.alText)
                            neume.alText = [];
                        neume.alText.push(note.alText);
                        note.alText.noteIndex = i;
                    }
                });
                runNeumes = [neume];
            }
            else if (run[0].neume)
                runNeumes = [run[0].neume];
            else
                runNeumes = this.createNeumesFromNotes(ctxt, run[0].glyph.notes, DefaultTrailingSpace);
            runNeumes.forEach((neume, i) => {
                neumes.push(neume);
                fusedToPrevious.push(i === 0 && run[0].fused && neumes.length > 1);
            });
            first = last;
        }
        // a fused neume follows the one before with no space, and other neumes
        // follow with the space that createNeumesFromNotes() leaves between them
        for (var n = 0; n + 1 < neumes.length; n++) {
            var current = neumes[n];
            if (fusedToPrevious[n + 1]) {
                if (current instanceof Neumes.FusedNeume)
                    current.fusedToNext = true;
                neumes[n + 1].fusedToPrevious = true;
                current.trailingSpace = 0;
                current.keepWithNext = true;
                current.allowLineBreakBeforeNext = false;
            }
            else if (current.trailingSpace.isDefault) {
                current.keepWithNext = true;
                if (neumes[n + 1].notes[0].shape === NoteShape.Quilisma)
                    current.trailingSpace = 0;
                else {
                    current.trailingSpace = TrailingSpaceMultiple(1);
                    current.allowLineBreakBeforeNext = true;
                }
            }
        }
        setFinalTrailingSpace(ctxt, neumes, finalTrailingSpace);
        return neumes;
    }
    // appends any notes created to the notes array argument
    static createNoteFromData(ctxt, clef, data, notes, sourceIndex) {
        var note = new Note();
        note.sourceIndex = sourceIndex;
        note.sourceGabc = restoreEscapes(data);
        // (the tuning of the blocks of Gregorio's episema tuning that the note is in)
        var episemaBlocks = this.marksForNext.episemaBlocks;
        if (episemaBlocks && (episemaBlocks.above || episemaBlocks.below))
            note.episemaTuning = { above: episemaBlocks.above, below: episemaBlocks.below };
        if (data.length < 1)
            throw "Invalid note data: " + data;
        if (data[0] === "-") {
            // liquescent initio debilis
            note.liquescent = LiquescentType.InitioDebilis;
            data = data.substring(1);
        }
        else if (data[0] === "@") {
            // Gregorio's fusion to the note before
            note.fused = true;
            data = data.substring(1);
        }
        if (data.length < 1)
            throw "Invalid note data: " + data;
        if (data[0] === data[0].toUpperCase()) {
            note.shape = NoteShape.Inclinatum;
            // Gregorio's leaning, which isn't a nudge after a capital (see setStaffPositionAndOffset())
            let leaning = ["descending", "ascending", "unison"][Number(data[1])];
            if (leaning)
                note.leaning = leaning;
        }
        this.setStaffPositionAndOffset(note, data, clef);
        note.pitch = clef.staffPositionToPitch(note.staffPosition);
        var mark;
        var episemaNoteIndex = notes.length;
        var episemaNote = note;
        // starts a new note at the same pitch after the note so far, for gabc's
        // repeated notes (gsss, gvvv and gVV)
        var startRepeatedNote = (sourceGabc) => {
            let newNote = new Note();
            newNote.sourceIndex = sourceIndex + i;
            newNote.sourceGabc = sourceGabc;
            newNote.staffPosition = note.staffPosition;
            newNote.pitch = note.pitch;
            notes.push(note);
            note = newNote;
            episemaNoteIndex++; // since a new note was added, increase the index here
        };
        // process the modifiers
        for (var i = 1; i < data.length; i++) {
            var c = data[i];
            var lookahead = "\0";
            var haveLookahead = i + 1 < data.length;
            if (haveLookahead)
                lookahead = data[i + 1];
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
                        else if (lookahead === "2")
                            mark.terminating = true;
                        // episema terminates
                        else if (lookahead === "3")
                            mark.alignment = Markings.HorizontalEpisemaAlignment.Left;
                        else if (lookahead === "4")
                            mark.alignment = Markings.HorizontalEpisemaAlignment.Center;
                        else if (lookahead === "5")
                            mark.alignment = Markings.HorizontalEpisemaAlignment.Right;
                        else
                            break;
                        // the gabc definition for episemata is so convoluted...
                        // - double underscores create episemata over multiple notes.
                        // - unless the _ has a 0, 1, 3, 4, or 5 modifier, which means
                        //   another underscore puts a second episema on the same note
                        // - (when there's a 2 lookahead, then this is treated as an
                        //   unmodified underscore, so another underscore would be
                        //   added to previous notes
                        if (mark.alignment !== Markings.HorizontalEpisemaAlignment.Default &&
                            mark.positionHint !== MarkingPositionHint.Below)
                            episemaHadModifier = true;
                        i++;
                        haveLookahead = i + 1 < data.length;
                        if (haveLookahead)
                            lookahead = data[i + 1];
                    }
                    // since gabc allows consecutive underscores which is a shortcut to
                    // apply the episemata to previous notes, we keep track of that here
                    // in order to add the new episema to the correct note.
                    if (episemaNote)
                        episemaNote.episemata.push(mark);
                    if (episemaNote === note && episemaHadModifier)
                        episemaNote = note;
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
                                note.accent = new Markings.Accent(ctxt, note, GlyphCode.AcuteAccent);
                                break;
                            case "2":
                                note.accent = new Markings.Accent(ctxt, note, GlyphCode.GraveAccent);
                                break;
                            case "3":
                                note.accent = new Markings.Accent(ctxt, note, GlyphCode.Circle);
                                break;
                            case "4":
                                note.accent = new Markings.Accent(ctxt, note, GlyphCode.Semicircle);
                                break;
                            case "5":
                                note.accent = new Markings.Accent(ctxt, note, GlyphCode.ReversedSemicircle);
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
                    }
                    else
                        note.shapeModifiers |= NoteShapeModifiers.Cavum;
                    break;
                case "R":
                    note.shapeModifiers |= NoteShapeModifiers.Linea;
                    break;
                case "s":
                    if (note.shape === NoteShape.Stropha) {
                        // if we're already a stropha, that means this is gabc's
                        // quick stropha feature (e.g., gsss). create a new note
                        startRepeatedNote("s");
                    }
                    note.shape = NoteShape.Stropha;
                    break;
                case "v":
                    if (note.shape === NoteShape.Virga) {
                        // if we're already a stropha, that means this is gabc's
                        // quick virga feature (e.g., gvvv). create a new note
                        startRepeatedNote("v");
                    }
                    note.shape = NoteShape.Virga;
                    break;
                case "V":
                    if (data[i - 1] === "V") {
                        // gabc VV and VVV, which Gregorio reads as vv and vvv: a bivirga
                        // or trivirga of virgas that aren't reversed
                        // (gabc-glyphs-determination.c), so create a new note
                        note.shapeModifiers &= ~NoteShapeModifiers.Reverse;
                        startRepeatedNote("V");
                        note.shape = NoteShape.Virga;
                        break;
                    }
                    note.shape = NoteShape.Virga;
                    note.shapeModifiers |= NoteShapeModifiers.Reverse;
                    break;
                case "w":
                    note.shape = NoteShape.Quilisma;
                    break;
                // Gregorio's quilisma quadratum: a quilisma, which a higher note
                // follows as in a pes quadratum
                case "W":
                    note.shape = NoteShape.Quilisma;
                    note.quilismaQuadratum = true;
                    break;
                // Gregorio's pes quadratum and linea
                case "q":
                    note.quadratum = true;
                    break;
                case "=":
                    note.linea = true;
                    break;
                // an oriscus's direction: Gregorio's 1 (up) and 0 (down), or
                // exsurge's own < and >
                case "o":
                    note.shape = NoteShape.Oriscus;
                    if (haveLookahead && (lookahead === "<" || lookahead === "1")) {
                        note.shapeModifiers |= NoteShapeModifiers.Ascending;
                        i++;
                    }
                    else if (haveLookahead && (lookahead === ">" || lookahead === "0")) {
                        note.shapeModifiers |= NoteShapeModifiers.Descending;
                        i++;
                    }
                    break;
                case "O":
                    note.shape = NoteShape.Oriscus;
                    if (haveLookahead && (lookahead === "<" || lookahead === "1")) {
                        note.shapeModifiers |=
                            NoteShapeModifiers.Ascending | NoteShapeModifiers.Stemmed;
                        i++;
                    }
                    else if (haveLookahead && (lookahead === ">" || lookahead === "0")) {
                        note.shapeModifiers |=
                            NoteShapeModifiers.Descending | NoteShapeModifiers.Stemmed;
                        i++;
                    }
                    else
                        note.shapeModifiers |= NoteShapeModifiers.Stemmed;
                    break;
                // liquescents
                case "~":
                    if (note.shape === NoteShape.Inclinatum)
                        note.liquescent |= LiquescentType.Small;
                    else if (note.shape === NoteShape.Oriscus)
                        note.liquescent |= LiquescentType.Large;
                    else
                        note.liquescent |= LiquescentType.Small;
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
                    if (note.pitch.step === Step.Mi)
                        note.pitch.step = Step.Me;
                    else if (note.pitch.step === Step.Ti)
                        note.pitch.step = Step.Te;
                    break;
                case "y":
                case "Y":
                    if (note.pitch.step === Step.Te)
                        note.pitch.step = Step.Ti;
                    else if (note.pitch.step === Step.Me)
                        note.pitch.step = Step.Mi;
                    else if (note.pitch.step === Step.Du)
                        note.pitch.step = Step.Do;
                    else if (note.pitch.step === Step.Fu)
                        note.pitch.step = Step.Fa;
                    break;
                case "#":
                    if (note.pitch.step === Step.Do)
                        note.pitch.step = Step.Du;
                    else if (note.pitch.step === Step.Fa)
                        note.pitch.step = Step.Fu;
                    break;
                // gabc special item groups
                case "[":
                    // read in the whole group and parse it
                    var startIndex = ++i;
                    while (i < data.length && data[i] !== "]")
                        i++;
                    this.processInstructionForNote(ctxt, note, data.substring(startIndex, i), startIndex);
                    break;
            }
        }
        notes.push(note);
    }
    // an instruction in this context is referring to a special gabc coding found after
    // notes between ['s and ]'s. choral signs and braces fall into this
    // category.
    //
    // currently only brace instructions are supported here!
    static processInstructionForNote(ctxt, note, instruction, sourceIndexOffset) {
        if (instruction === "nocustos") {
            note.noCustos = true;
            return;
        }
        if (this.processDecorationForNote(note, instruction))
            return;
        var results = instruction.match(__bracketedCommandRegex);
        if (results === null)
            return;
        var cmd = results[1];
        var data = results[2];
        switch (cmd) {
            case "cs":
                note.choralSign = new ChoralSign(ctxt, data, note, note.sourceIndex + sourceIndexOffset);
                return;
            case "alt":
                note.alText = new AboveLinesText(ctxt, data, note, note.sourceIndex + sourceIndexOffset);
                return;
            // Gregorio's shape hints, which replace any before them on the note
            case "shape":
                note.shapeHint = data;
                return;
            // Gregorio's ledger-line hints, of which the first on the note counts
            case "ll":
                if (note.lowLedgerLine === undefined && /^[01]$/.test(data))
                    note.lowLedgerLine = data === "1";
                return;
            case "hl":
                if (note.highLedgerLine === undefined && /^[01]$/.test(data))
                    note.highLedgerLine = data === "1";
                return;
        }
        results = instruction.match(__braceSpecRegex);
        if (results === null)
            return;
        // see the comments at the definition of __braceSpecRegex for the
        // capturing groups
        var above = results[1] === "o";
        var shape = Markings.BraceShape.CurlyBrace; // default
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
        var attachmentPoint = results[3] === "1"
            ? Markings.BraceAttachment.Left
            : Markings.BraceAttachment.Right;
        if (results[4] === "{" || results[5])
            note.braceStart = new Markings.BracePoint(note, above, shape, attachmentPoint);
        else
            note.braceEnd = new Markings.BracePoint(note, above, shape, attachmentPoint);
        // just have the next note end a brace that uses length (see endAutomaticBrace())
        if (results[5]) {
            note.braceStart.automatic = true;
            note.braceStart.length = texLengthToStaffIntervals(results[5]);
        }
    }
    /**
     * Has the note end the brace that a brace given a length (gabc
     * [ob:1;6mm] and the like) left open before it, as the next note does
     * unless it has a brace of its own, or leaves the note's own such brace
     * open for the notes after it.  Each note of the notations is passed in
     * order, when they're parsed and again when they're kept by
     * updateMappingsFromSource(), which first takes away the end it gave.
     */
    static endAutomaticBrace(note) {
        if (note.braceEnd && note.braceEnd.automatic)
            delete note.braceEnd;
        if (this.needToEndBrace && !note.braceStart && !note.braceEnd) {
            note.braceEnd = new Markings.BracePoint(note, this.needToEndBrace.isAbove, this.needToEndBrace.shape, this.needToEndBrace.attachment === Markings.BraceAttachment.Left
                ? Markings.BraceAttachment.Right
                : Markings.BraceAttachment.Left);
            note.braceEnd.automatic = true;
            delete this.needToEndBrace;
        }
        else if (note.braceStart && note.braceStart.automatic) {
            this.needToEndBrace = note.braceStart;
        }
    }
    // Gregorio's slurs, custom ledger lines and episema tuning on the note.
    // Returns whether the instruction is one of these.
    static processDecorationForNote(note, instruction) {
        if (this.processEpisemaTuning(instruction, note))
            return true;
        var results = instruction.match(__ledgerLineRegex);
        if (results) {
            // (of [oll:0/1] and [ull:0/1], the first on the note counts, as in Gregorio)
            if (results[2] && results[1] === "o") {
                if (note.ledgerLineAbove === undefined)
                    note.ledgerLineAbove = results[2] === "1";
            }
            else if (results[2]) {
                if (note.ledgerLineBelow === undefined)
                    note.ledgerLineBelow = results[2] === "1";
            }
            else {
                let line = this.customLedgerLine(results);
                if (line)
                    note.customLedgerLines = (note.customLedgerLines || []).concat(line);
            }
            return true;
        }
        results = instruction.match(__slurRegex);
        if (results) {
            let mark = {
                isAbove: results[1] === "o",
                shift: Number(results[2]),
                kind: results[5] === "{" ? "start" : results[5] === "}" ? "end" : "fixed"
            };
            if (mark.kind === "fixed") {
                let width = texLengthToStaffIntervals(results[3]);
                let height = texLengthToStaffIntervals(results[4]);
                if (width === undefined || height === undefined)
                    return true;
                mark.width = width;
                mark.height = height;
            }
            note.slurs = (note.slurs || []).concat(mark);
            return true;
        }
        return false;
    }
    // Gregorio's episema tuning ([oh:…] and [uh:…]): one for the note it's
    // after, if there is one, or the start or end of a block, whose tuning goes
    // on the notes that come between its start and end.  Returns whether the
    // instruction is one of these.
    static processEpisemaTuning(instruction, note) {
        var results = instruction.match(__episemaTuningRegex);
        if (!results)
            return false;
        var side = results[1] === "o" ? "above" : "below";
        var hasPositionOrNudge = !!(results[2] || results[3]);
        var tuning = {};
        if (results[2])
            tuning.position = results[2];
        if (results[3]) {
            let nudge = texLengthToStaffIntervals(results[3]);
            if (nudge === undefined)
                return true;
            tuning.nudge = nudge;
        }
        var blocks = this.marksForNext.episemaBlocks || {};
        if (results[4] === "{") {
            // (as in Gregorio, a block can't start before the last one ends)
            if (!blocks[side])
                this.marksForNext = Object.assign(Object.assign({}, this.marksForNext), { episemaBlocks: Object.assign(Object.assign({}, blocks), { [side]: Object.assign(Object.assign({}, tuning), { block: true }) }) });
        }
        else if (results[4] === "}") {
            if (!hasPositionOrNudge)
                this.marksForNext = Object.assign(Object.assign({}, this.marksForNext), { episemaBlocks: Object.assign(Object.assign({}, blocks), { [side]: undefined }) });
        }
        else if (note && hasPositionOrNudge && !blocks[side]) {
            // (as in Gregorio, a note in a block has the block's tuning, not its own)
            note.episemaTuning = Object.assign(Object.assign({}, note.episemaTuning), { [side]: tuning });
        }
        return true;
    }
    // the custom ledger line that a match of __ledgerLineRegex gives, if its lengths are valid
    static customLedgerLine(results) {
        var isAbove = results[1] === "o";
        if (results[3])
            return { isAbove, kind: "end" };
        var extent = (text) => text === "0" ? 0 : text === "1" ? "overhang" : texLengthToStaffIntervals(text);
        var left = extent(results[4]);
        var right = results[5] === ";" ? texLengthToStaffIntervals(results[6]) : extent(results[6]);
        if (left === undefined || right === undefined)
            return null;
        return { isAbove, kind: results[5] === ";" ? "fixed" : "start", left, right };
    }
    // takes raw gabc text source and parses it into words. For example, passing
    // in a string of "me(f.) (,) ma(fff)num(d!ewf) tu(fgF'E)am,(f.)" would return
    // an array of four strings: ["me(f.)", "(,)", "ma(fff)num(d!ewf)", "tu(fgF'E)am,(f.)"]
    //
    // The words are found in a copy with Gregorio's comments and escapes masked
    // (see maskGabc()), so a word can go on after a comment at the end of a
    // line, and "$)" doesn't end one, but they're the source's own text.
    static splitWords(gabcNotations) {
        // split the notations on whitespace boundaries, as long as the space
        // immediately follows a set of parentheses. Prior to doing that, we replace
        // all whitespace with spaces, which prevents tabs and newlines from ending
        // up in the notation data.
        // Gregorio's closing </eu> and </nlba> tags can come between the
        // parentheses and the space, and stay with the word before them.
        var words = [];
        var start = 0;
        maskGabc(gabcNotations)
            // .trim()
            // .replace(/\s/g, " ")
            .replace(/\)((?:<\/(?:eu|nlba)>)*)\s(?=[^\)]*(?:\(|$))/g, ")$1\n")
            .split(/\n/g)
            .forEach((maskedWord) => {
            words.push(gabcNotations.substr(start, maskedWord.length));
            start += maskedWord.length + 1;
        });
        return words;
    }
    static parseSource(gabcSource) {
        return this.parseWords(this.splitWords(gabcSource));
    }
    // gabcWords is an array of strings, e.g., the result of splitWords above
    static parseWords(gabcWords) {
        var words = [];
        for (var i = 0; i < gabcWords.length; i++)
            words.push(this.parseWord(gabcWords[i]));
        return words;
    }
    // returns an array of objects, each of which has the following properties
    //  - notations (string)
    //  - lyrics (array of strings)
    static parseWord(gabcWord) {
        var syllables = [];
        var matches = [];
        // (the syllables are found with Gregorio's comments and escapes masked, but
        // their text is the word's own)
        var maskedWord = maskGabc(gabcWord);
        syllables.wordLength = gabcWord.length;
        var syllableMatch;
        while ((syllableMatch = __syllablesRegex.exec(maskedWord)))
            matches.push(syllableMatch);
        for (var j = 0; j < matches.length; j++) {
            var match = matches[j];
            var lyrics = gabcWord.substr(match.index, match[1].length).trim().split("|");
            var notations = match[2] === undefined
                ? match[2]
                : gabcWord.substr(match.index + match[1].length + 1, match[2].length);
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
    static gabcHeightToExsurgeHeight(gabcHeight) {
        return gabcHeight.toLowerCase().charCodeAt(0) - "c".charCodeAt(0);
    }
    /**
     *
     * @param {*} staffPosition
     * @param {*} zeroOrNine 0 or 9 or nothing, to shift a little down or up
     * @returns staffposition offset
     */
    static getStaffPositionOffset(staffPosition, zeroOrNine) {
        let offset = 0;
        if (/0|9/.test(zeroOrNine)) {
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
    static setStaffPositionAndOffset(note, gabcAtom, clef) {
        const staffPosition = this.gabcHeightToExsurgeHeight(gabcAtom[0]);
        note.staffPositionOffset = 0;
        if (clef instanceof ChiRhoClef) {
            // a 0 after a punctum inclinatum (a capital) is Gregorio's leaning rather than a nudge down
            const isLeaning = note instanceof Note && /[A-N]/.test(gabcAtom[0]) && gabcAtom[1] === "0";
            let zeroOrNine = isLeaning ? undefined : gabcAtom[1];
            // the middle of a space is never used: a note on a space without a 9 is at the
            // bottom of the space, as if it had a 0
            if (staffPosition % 2 === 0 && zeroOrNine !== "9")
                zeroOrNine = "0";
            note.staffPositionOffset = this.getStaffPositionOffset(staffPosition, zeroOrNine);
        }
        note.staffPosition = staffPosition + note.staffPositionOffset;
    }
}
/** what the gabc parsed last leaves for the next notes and syllable (see createMappingFromWord()) */
Gabc.marksForNext = noMarksForNext;
//# sourceMappingURL=Exsurge.Gabc.js.map