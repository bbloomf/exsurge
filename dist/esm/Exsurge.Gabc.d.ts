import { LyricType, Lyric } from "./Exsurge.Drawing.js";
import { Note, ChantMapping, type MarksForNext, ChantScore, Clef } from "./Exsurge.Chant.js";
import * as Markings from "./Exsurge.Chant.Markings.js";
import * as Signs from "./Exsurge.Chant.Signs.js";
import * as Neumes from "./Exsurge.Chant.Neumes.js";
import type { ChantContext, ChantNotationElement, TrailingSpace } from "./Exsurge.Drawing.js";
/**
 * how a list of mappings differs from a list of gabc words: words that are
 * the same ("="), mappings taken out ("-") or words put in ("+")
 */
export type WordDiff<Descriptor extends {
    source: string;
} = ChantMapping> = ["=" | "+", string[]] | ["-", Descriptor[]];
/** a syllable of a gabc word, from Gabc.parseWord() */
export interface ParsedSyllable {
    notations: string;
    lyrics: string[];
}
interface GabcHeaderMembers {
    /** the text of the header, through the %% line */
    original: string;
    /** the header's comment lines, by line number */
    comments: string[];
    /** the values of commented-out header lines ("%name: value;") */
    cValues: {
        [key: string]: string;
    };
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
export declare const GabcHeader: GabcHeaderConstructor;
/**
 * Which headers Gabc.applyHeader() applies.  Each is applied unless it is
 * set to false, except the legacy ones, which are only applied if legacy is
 * set to true.
 */
export interface ApplyHeaderOptions {
    /** annotation, as the score's annotation */
    annotation?: boolean;
    /**
     * mode, mode-modifier and mode-differentia, as the score's annotation, if
     * the header has no annotation
     */
    mode?: boolean;
    /** staff-lines, as the score's staffLineCount */
    staffLines?: boolean;
    /** language, as the language of the score's lyrics */
    language?: boolean;
    /**
     * the headers that Gregorio no longer reads: initial-style, as the score's
     * useDropCap, and centering-scheme, as the language of the score's lyrics
     */
    legacy?: boolean;
}
export declare class Gabc {
    /** a brace given a length rather than an end, which the next note ends */
    static needToEndBrace?: Markings.BracePoint;
    /** what the gabc parsed last leaves for the next notes and syllable (see createMappingFromWord()) */
    static marksForNext: MarksForNext;
    static createMappingsFromSource(ctxt: ChantContext, gabcSource: string): ChantMapping[];
    /** the number of lines of NABC that a gabc file's header gives (nabc-lines) */
    static getNabcLines(gabc: string, headerLength?: number): number;
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
    static splitNabc(data: string, nabcLines: number): {
        gabc: string;
        cuts: number[];
        parts: {
            index: number;
            end: number;
            nabc: string[];
        }[];
    };
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
    static applyHeader(score: ChantScore, ctxt: ChantContext, header: GabcHeader, options?: ApplyHeaderOptions): void;
    /**
     * The mode line that Gregorio writes above the initial when there is no
     * annotation (\GreMode): the mode, then the modifier and the differentia,
     * each after a space unless it starts with punctuation.  A mode that
     * starts with a number from 1 to 8 has it written in ctxt.modeNumberSystem
     * ("8" is VIII, "4A" is IVA); any other mode is written as it is.  With no
     * mode, the modifier and differentia aren't written either.
     */
    static modeText(ctxt: ChantContext, mode: string, modifier?: string, differentia?: string): string;
    static diffDescriptorsAndNewWords<Descriptor extends {
        source: string;
    }>(before: Descriptor[], after: string[]): WordDiff<Descriptor>[];
    static diffDescriptorsAndNewWordsBySubstring<Descriptor extends {
        source: string;
    }>(before: Descriptor[], after: string[]): WordDiff<Descriptor>[];
    /**
     * Updates mappings in place to match newGabcSource, and returns the length
     * of newGabcSource's header.
     */
    static updateMappingsFromSource(ctxt: ChantContext, mappings: ChantMapping[], newGabcSource: string, insertionIndex?: number | null, oldInsertionIndex?: number | null): number;
    static createMappingsFromWords(ctxt: ChantContext, words: string[]): ChantMapping[];
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
    static setAutomaticLeanings(notes: Note[]): void;
    static createMappingFromWord(ctxt: ChantContext, word: string, sourceIndex: number, lastTranslationNeumes: ChantNotationElement[], insertionIndex?: number): ChantMapping;
    static createSyllableLyrics(ctxt: ChantContext, text: string, proposedLyricType: LyricType, notation: ChantNotationElement, notations: ChantNotationElement[], sourceIndex: number): Lyric[];
    static makeLyric(ctxt: ChantContext, text: string, lyricType: LyricType, notation: ChantNotationElement, notations: ChantNotationElement[], sourceIndex: number): Lyric;
    static parseNotations(ctxt: ChantContext, data: string, sourceIndex: number, insertionIndex?: number): ChantNotationElement[];
    static createClef(type: string, line: number, flat: boolean): Clef;
    static joinElements(neumes: Neumes.Neume[], joinsPreviousElement: boolean): boolean;
    static createNeumesFromNotes(ctxt: ChantContext, notes: Note[], finalTrailingSpace: TrailingSpace): Neumes.Neume[];
    static createFusedNeumes(ctxt: ChantContext, notes: Note[], finalTrailingSpace: TrailingSpace, autoFused: Set<Note>): Neumes.Neume[];
    static createNoteFromData(ctxt: ChantContext, clef: Clef, data: string, notes: Note[], sourceIndex: number): void;
    static processInstructionForNote(ctxt: ChantContext, note: Note, instruction: string, sourceIndexOffset: number): void;
    /**
     * Has the note end the brace that a brace given a length (gabc
     * [ob:1;6mm] and the like) left open before it, as the next note does
     * unless it has a brace of its own, or leaves the note's own such brace
     * open for the notes after it.  Each note of the notations is passed in
     * order, when they're parsed and again when they're kept by
     * updateMappingsFromSource(), which first takes away the end it gave.
     */
    static endAutomaticBrace(note: Note): void;
    static processDecorationForNote(note: Note, instruction: string): boolean;
    static processEpisemaTuning(instruction: string, note: Note | null): boolean;
    static customLedgerLine(results: RegExpMatchArray): Markings.CustomLedgerLine | null;
    static splitWords(gabcNotations: string): string[];
    static parseSource(gabcSource: string): (ParsedSyllable[] & {
        wordLength: number;
    })[];
    static parseWords(gabcWords: string[]): (ParsedSyllable[] & {
        wordLength: number;
    })[];
    static parseWord(gabcWord: string): ParsedSyllable[] & {
        wordLength: number;
    };
    /**
     *
     * @param {*} gabcHeight gabc letter a through m
     * @returns pitch
     */
    static gabcHeightToExsurgeHeight(gabcHeight: string): number;
    /**
     *
     * @param {*} staffPosition
     * @param {*} zeroOrNine 0 or 9 or nothing, to shift a little down or up
     * @returns staffposition offset
     */
    static getStaffPositionOffset(staffPosition: number, zeroOrNine: string | undefined): number;
    /**
     *
     * @param {*} note to set staffPosition and staffPositionOffset on
     * @param {*} gabcAtom gabc letter from a to m with modifiers
     * @param {*} clef the clef the note is under: only under a Chi-Rho clef do 0 and 9 nudge it
     */
    static setStaffPositionAndOffset(note: Note | Signs.Custos, gabcAtom: string, clef: Clef): void;
}
export {};
//# sourceMappingURL=Exsurge.Gabc.d.ts.map