/** where the vowel segment of a syllable is, which lyrics are centered on */
export interface VowelSegment {
    found: boolean;
    startIndex: number;
    length: number;
}
/** a range of the text to leave out when looking for a vowel segment */
export interface IgnoredRange {
    index: number;
    endIndex: number;
}
/**
 * @class
 */
export declare abstract class Language {
    name: string;
    /**
     * whether a neume is centered over its syllable, rather than its first
     * note being centered over the syllable's vowel
     */
    centerNeume: boolean;
    constructor(name?: string);
    /**
     * @param {String} text The string to parsed into words.
     * @return {Word[]} the resulting parsed words from syllabification
     */
    syllabify(text: string): string[][];
    /** splits word into its syllables (not every language can) */
    syllabifyWord?(word: string): string[];
    /**
     * @param s the string to search
     * @param startIndex The index at which to start searching for a vowel in the string
     * @param ignore ranges of s, counted from startIndex, to skip over
     */
    abstract findVowelSegment(s: string, startIndex: number, ignore?: IgnoredRange[]): VowelSegment;
}
export declare class English extends Language {
    regexLetter: RegExp;
    constructor();
    /**
     * @param {String} s the string to search
     * @param {Number} startIndex The index at which to start searching for a vowel in the string
     * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
     */
    findVowelSegment(s: string, startIndex: number): VowelSegment;
}
/**
 * @class
 */
export declare class Latin extends Language {
    diphthongs: string[];
    possibleDiphthongs: string[];
    regexVowel: RegExp;
    vowels: string[];
    vowelsThatMightBeConsonants: string[];
    muteConsonantsAndF: string[];
    liquidConsonants: string[];
    /**
     * @constructs
     */
    constructor();
    isVowel(c: string): boolean;
    isVowelThatMightBeConsonant(c: string): boolean;
    isVowelActingAsConsonant(substring: string): boolean;
    /**
     * f is not a mute consonant, but we lump it together for syllabification
     * since it is syntactically treated the same way
     *
     * @param {String} c The character to test; must be lowercase
     * @return {boolean} true if c is an f or a mute consonant
     */
    isMuteConsonantOrF(c: string): boolean;
    /**
     *
     * @param {String} c The character to test; must be lowercase
     * @return {boolean} true if c is a liquid consonant
     */
    isLiquidConsonant(c: string): boolean;
    /**
     *
     * @param {String} s The string to test; must be lowercase
     * @return {boolean} true if s is a diphthong
     */
    isDiphthong(s: string): boolean;
    /**
     *
     * @param {String} s The string to test; must be lowercase
     * @return {boolean} true if s is a diphthong
     */
    isPossibleDiphthong(s: string): boolean;
    /**
     * Rules for Latin syllabification (from Collins, "A Primer on Ecclesiastical Latin")
     *
     * Divisions occur when:
     *   1. After open vowels (those not followed by a consonant) (e.g., "pi-us" and "De-us")
     *   2. After vowels followed by a single consonant (e.g., "vi-ta" and "ho-ra")
     *   3. After the first consonant when two or more consonants follow a vowel
     *      (e.g., "mis-sa", "minis-ter", and "san-ctus").
     *
     * Exceptions:
     *   1. In compound words the consonants stay together (e.g., "de-scribo").
     *   2. A mute consonant (b, c, d, g, p, t) or f followed by a liquid consonant (l, r)
     *      go with the succeeding vowel: "la-crima", "pa-tris"
     *
     * In addition to these rules, Wheelock's Latin provides this sound exception:
     *   -  Also counted as single consonants are qu and the aspirates ch, ph,
     *      th, which should never be separated in syllabification:
     *      architectus, ar-chi-tec-tus; loquacem, lo-qua-cem.
     *
     */
    syllabifyWord(word: string): string[];
    /**
     * @param {String} s the string to search
     * @param {Number} startIndex The index at which to start searching for a vowel in the string
     * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
     */
    findVowelSegment(s: string, startIndex: number, ignore?: IgnoredRange[]): VowelSegment;
}
/**
 * @class
 */
export declare class Spanish extends Language {
    vowels: string[];
    weakVowels: string[];
    strongVowels: string[];
    diphthongs: string[];
    uDiphthongExceptions: string[];
    constructor();
    isVowel(c: string): boolean;
    /**
     * @param {String} c The character to test; must be lowercase
     * @return {boolean} true if c is an f or a mute consonant
     */
    isWeakVowel(c: string): boolean;
    /**
     * @param {String} c The character to test; must be lowercase
     * @return {boolean} true if c is an f or a mute consonant
     */
    isStrongVowel(c: string): boolean;
    /**
     *
     * @param {String} s The string to test; must be lowercase
     * @return {boolean} true if s is a diphthong
     */
    isDiphthong(s: string): boolean;
    createSyllable(text: string): string;
    /**
     */
    syllabifyWord(word: string): string[];
    /**
     * @param {String} s the string to search
     * @param {Number} startIndex The index at which to start searching for a vowel in the string
     * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
     */
    findVowelSegment(s: string, startIndex: number): VowelSegment;
}
/** the rules of a VowelRulesLanguage, as Gregorio's vowel files give them */
export interface VowelRules {
    /** the characters that are vowels */
    vowels: string;
    /**
     * strings ending in a vowel that aren't part of the vowel segment when a
     * vowel follows them (e.g. "qu" in English)
     */
    prefixes?: string[];
    /**
     * strings not starting with a vowel that are part of the vowel segment
     * when they follow one (e.g. "w" in English)
     */
    suffixes?: string[];
    /**
     * strings without vowels that a syllable with no vowels is centered on
     * (e.g. the syllabic "l" and "r" of Czech)
     */
    secondary?: string[];
}
interface CharacterTrie {
    next: Map<string, CharacterTrie>;
    isFinal: boolean;
}
/**
 * A language whose vowel segments are found with rules like those of
 * Gregorio's vowel files (gregorio-vowels.dat): sets of vowels, prefixes,
 * suffixes and secondary centers.  It can't split words into syllables.
 * Like Gregorio, it doesn't fold case, so the rules list upper- and
 * lower-case characters.
 */
export declare class VowelRulesLanguage extends Language {
    vowels: Set<string>;
    prefixes: CharacterTrie;
    suffixes: CharacterTrie;
    secondary: CharacterTrie;
    constructor(name: string, rules: VowelRules);
    /**
     * Reads the languages in the text of a Gregorio vowel file, by their names
     * and their aliases.
     */
    static fromVowelFile(text: string): {
        [name: string]: VowelRulesLanguage;
    };
    isVowel(char: string | undefined): boolean;
    /**
     * Finds the vowel segment as Gregorio does (gregorio_find_vowel_group in
     * its src/vowel/vowel.c), with the text in each ignored range (an elision)
     * counting as consonants.
     */
    findVowelSegment(s: string, startIndex: number, ignore?: IgnoredRange[]): VowelSegment;
}
/**
 * Church Slavonic, which Gregorio also uses for Polish, Czech and Slovak
 * (from Gregorio's gregorio-vowels.dat)
 */
export declare class ChurchSlavonic extends VowelRulesLanguage {
    constructor();
}
/** Hungarian (from Gregorio's gregorio-vowels.dat) */
export declare class Hungarian extends VowelRulesLanguage {
    constructor();
}
export declare const language: {
    english: English;
    latin: Latin;
    spanish: Spanish;
    churchSlavonic: ChurchSlavonic;
    hungarian: Hungarian;
};
export {};
//# sourceMappingURL=Exsurge.Text.d.ts.map