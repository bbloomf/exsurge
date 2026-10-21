import { LyricType, Lyric } from "./Exsurge.Drawing.js";
import { Note, ChantMapping, Clef } from "./Exsurge.Chant.js";
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
export declare class Gabc {
    /** a brace given a length rather than an end, which the next note ends */
    static needToEndBrace?: Markings.BracePoint;
    static createMappingsFromSource(ctxt: ChantContext, gabcSource: string): ChantMapping[];
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
    static createMappingFromWord(ctxt: ChantContext, word: string, sourceIndex: number, lastTranslationNeumes: ChantNotationElement[], insertionIndex?: number): ChantMapping;
    static createSyllableLyrics(ctxt: ChantContext, text: string, proposedLyricType: LyricType, notation: ChantNotationElement, notations: ChantNotationElement[], sourceIndex: number): Lyric[];
    static makeLyric(ctxt: ChantContext, text: string, lyricType: LyricType, notation: ChantNotationElement, notations: ChantNotationElement[], sourceIndex: number): Lyric;
    static parseNotations(ctxt: ChantContext, data: string, sourceIndex: number, insertionIndex?: number): ChantNotationElement[];
    static createNeumesFromNotes(ctxt: ChantContext, notes: Note[], finalTrailingSpace: TrailingSpace): Neumes.Neume[];
    static createNoteFromData(ctxt: ChantContext, clef: Clef, data: string, notes: Note[], sourceIndex: number): void;
    static processInstructionForNote(ctxt: ChantContext, note: Note, instruction: string, sourceIndexOffset: number): void;
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
     */
    static setStaffPositionAndOffset(note: Note | Signs.Custos, gabcAtom: string): void;
}
export {};
//# sourceMappingURL=Exsurge.Gabc.d.ts.map