//

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
export abstract class Language {
  name: string;
  /**
   * whether a neume is centered over its syllable, rather than its first
   * note being centered over the syllable's vowel
   */
  centerNeume: boolean;

  constructor(name?: string) {
    this.name = typeof name !== "undefined" ? name : "<unknown>";
    this.centerNeume = false;
  }

  /**
   * @param {String} text The string to parsed into words.
   * @return {Word[]} the resulting parsed words from syllabification
   */
  syllabify(text: string) {
    var parsedWords: string[][] = [];

    if (typeof text === "undefined" || text === "") return parsedWords;

    // Divide the text into words separated by whitespace
    var words = text.split(/[\s]+/);

    for (var i = 0, end = words.length; i < end; i++)
      parsedWords.push(this.syllabifyWord!(words[i]));

    return parsedWords;
  }

  /** splits word into its syllables (not every language can) */
  syllabifyWord?(word: string): string[];

  /**
   * @param s the string to search
   * @param startIndex The index at which to start searching for a vowel in the string
   * @param ignore ranges of s, counted from startIndex, to skip over
   */
  abstract findVowelSegment(s: string, startIndex: number, ignore?: IgnoredRange[]): VowelSegment;
}

export class English extends Language {
  regexLetter: RegExp;

  constructor() {
    super("English");
    this.centerNeume = true;
    this.regexLetter = /[a-z\u00c0-\u02af\u0300-\u036f\u1e00-\u1eff‿]+/i;
  }

  /**
   * @param {String} s the string to search
   * @param {Number} startIndex The index at which to start searching for a vowel in the string
   * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
   */
  findVowelSegment(s: string, startIndex: number): VowelSegment {
    var match = this.regexLetter.exec(s.slice(startIndex));
    if (match)
      return {
        found: true,
        startIndex: startIndex + match.index,
        length: match[0].length
      };

    // no vowels sets found after startIndex!
    return { found: false, startIndex: -1, length: -1 };
  }
}

/**
 * @class
 */
export class Latin extends Language {
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
  constructor() {
    super("Latin");

    // fixme: ui is only diphthong in the exceptional cases below (according to Wheelock's Latin)
    this.diphthongs = ["ae", "au", "oe", "aé", "áu", "oé"];
    // for centering over the vowel, we will need to know any combinations that might be diphthongs:
    this.possibleDiphthongs = this.diphthongs.concat([
      "ei",
      "eu",
      "ui",
      "éi",
      "éu",
      "úi"
    ]);
    this.regexVowel = /(i|(?:[qg]|^)u)?([eé][iu]|[uú]i|[ao][eé]|[aá]u|[aeiouáéíóúäëïöüāēīōūăĕĭŏŭåe̊o̊ůæœǽyýÿ])/gi;

    // some words that are simply exceptions to standard syllabification rules!
    var wordExceptions: { [word: string]: string[] } = {};

    // ui combos pronounced as diphthongs
    wordExceptions["huius"] = ["hui", "us"];
    wordExceptions["cuius"] = ["cui", "us"];
    wordExceptions["huic"] = ["huic"];
    wordExceptions["cui"] = ["cui"];
    wordExceptions["hui"] = ["hui"];

    // eu combos pronounced as diphthongs
    wordExceptions["euge"] = ["eu", "ge"];
    wordExceptions["seu"] = ["seu"];

    this.vowels = [
      "a",
      "e",
      "i",
      "o",
      "u",
      "á",
      "é",
      "í",
      "ó",
      "ú",
      "ä",
      "ë",
      "ï",
      "ö",
      "ü",
      "ā",
      "ē",
      "ī",
      "ō",
      "ū",
      "ă",
      "ĕ",
      "ĭ",
      "ŏ",
      "ŭ",
      "å",
      "e̊",
      "o̊",
      "ů",
      "æ",
      "œ",
      "ǽ", // no accented œ in unicode?
      "y",
      "ý",
      "ÿ"
    ]; // y is treated as a vowel; not native to Latin but useful for words borrowed from Greek

    this.vowelsThatMightBeConsonants = ["i", "u"];

    this.muteConsonantsAndF = ["b", "c", "d", "g", "p", "t", "f"];

    this.liquidConsonants = ["l", "r"];
  }

  // c must be lowercase!
  isVowel(c: string) {
    for (var i = 0, end = this.vowels.length; i < end; i++)
      if (this.vowels[i] === c) return true;

    return false;
  }

  isVowelThatMightBeConsonant(c: string) {
    for (var i = 0, end = this.vowelsThatMightBeConsonants.length; i < end; i++)
      if (this.vowelsThatMightBeConsonants[i] === c) return true;

    return false;
  }

  // substring should be a vowel and the character following
  isVowelActingAsConsonant(substring: string) {
    return (
      this.isVowelThatMightBeConsonant(substring[0]) &&
      this.isVowel(substring[1])
    );
  }

  /**
   * f is not a mute consonant, but we lump it together for syllabification
   * since it is syntactically treated the same way
   *
   * @param {String} c The character to test; must be lowercase
   * @return {boolean} true if c is an f or a mute consonant
   */
  isMuteConsonantOrF(c: string) {
    for (var i = 0, end = this.muteConsonantsAndF.length; i < end; i++)
      if (this.muteConsonantsAndF[i] === c) return true;

    return false;
  }

  /**
   *
   * @param {String} c The character to test; must be lowercase
   * @return {boolean} true if c is a liquid consonant
   */
  isLiquidConsonant(c: string) {
    for (var i = 0, end = this.liquidConsonants.length; i < end; i++)
      if (this.liquidConsonants[i] === c) return true;

    return false;
  }

  /**
   *
   * @param {String} s The string to test; must be lowercase
   * @return {boolean} true if s is a diphthong
   */
  isDiphthong(s: string) {
    for (var i = 0, end = this.diphthongs.length; i < end; i++)
      if (this.diphthongs[i] === s) return true;

    return false;
  }

  /**
   *
   * @param {String} s The string to test; must be lowercase
   * @return {boolean} true if s is a diphthong
   */
  isPossibleDiphthong(s: string) {
    for (var i = 0, end = this.possibleDiphthongs.length; i < end; i++)
      if (this.possibleDiphthongs[i] === s) return true;

    return false;
  }

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
  syllabifyWord(word: string) {
    var syllables: string[] = [];
    var haveCompleteSyllable = false;
    var previousWasVowel = false;
    var workingString = word.toLowerCase();
    var startSyllable = 0;

    var c, lookahead, haveLookahead;

    // a helper function to create syllables
    var makeSyllable = function(length: number) {
      if (haveCompleteSyllable) {
        syllables.push(word.substr(startSyllable, length));
        startSyllable += length;
      }

      haveCompleteSyllable = false;
    };

    for (var i = 0, wordLength = workingString.length; i < wordLength; i++) {
      c = workingString[i];

      // get our lookahead in case we need them...
      lookahead = "*";
      haveLookahead = i + 1 < wordLength;

      if (haveLookahead) lookahead = workingString[i + 1];

      var cIsVowel = this.isVowel(c);

      // i is a special case for a vowel. when i is at the beginning
      // of the word (Iesu) or i is between vowels (alleluia),
      // then the i is treated as a consonant (y)
      if (c === "i") {
        if (i === 0 && haveLookahead && this.isVowel(lookahead))
          cIsVowel = false;
        else if (previousWasVowel && haveLookahead && this.isVowel(lookahead)) {
          cIsVowel = false;
        }
      }

      if (c === "-") {
        // a hyphen forces a syllable break, which effectively resets
        // the logic...

        haveCompleteSyllable = true;
        previousWasVowel = false;
        makeSyllable(i - startSyllable);
        startSyllable++;
      } else if (cIsVowel) {
        // once we get a vowel, we have a complete syllable
        haveCompleteSyllable = true;

        if (
          previousWasVowel &&
          !this.isDiphthong(workingString[i - 1] + "" + c)
        ) {
          makeSyllable(i - startSyllable);
          haveCompleteSyllable = true;
        }

        previousWasVowel = true;
      } else if (haveLookahead) {
        if (
          (c === "q" && lookahead === "u") ||
          (lookahead === "h" && (c === "c" || c === "p" || c === "t"))
        ) {
          // handle wheelock's exceptions for qu, ch, ph and th
          makeSyllable(i - startSyllable);
          i++; // skip over the 'h' or 'u'
        } else if (previousWasVowel && this.isVowel(lookahead)) {
          // handle division rule 2
          makeSyllable(i - startSyllable);
        } else if (
          this.isMuteConsonantOrF(c) &&
          this.isLiquidConsonant(lookahead)
        ) {
          // handle exception 2
          makeSyllable(i - startSyllable);
        } else if (haveCompleteSyllable) {
          // handle division rule 3
          makeSyllable(i + 1 - startSyllable);
        }

        previousWasVowel = false;
      }
    }

    // if we have a complete syllable, we can add it as a new one. Otherwise
    // we tack the remaining characters onto the last syllable.
    if (haveCompleteSyllable) syllables.push(word.substr(startSyllable));
    else if (startSyllable > 0)
      syllables[syllables.length - 1] += word.substr(startSyllable);

    return syllables;
  }

  /**
   * @param {String} s the string to search
   * @param {Number} startIndex The index at which to start searching for a vowel in the string
   * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
   */
  findVowelSegment(s: string, startIndex: number, ignore?: IgnoredRange[]): VowelSegment {
    this.regexVowel.lastIndex = 0;
    let stringSlice = s.slice(startIndex);
    var match = this.regexVowel.exec(stringSlice);
    var isIgnoredMatch = ({ index, endIndex }: IgnoredRange) => (index <= match!.index && endIndex > match!.index) || (index < this.regexVowel.lastIndex && endIndex >= this.regexVowel.lastIndex);
    let inIgnore = match && ignore && ignore.length && ignore.find(isIgnoredMatch);
    while (inIgnore) {
      match = this.regexVowel.exec(stringSlice);
      inIgnore = match && ignore!.find(isIgnoredMatch);
    }
    if (match) {
      if (match[1]) {
        // the first group should be ignored, as it is to separate an i or u that is used as a consonant.
        match.index += match[1].length;
      }
      return {
        found: true,
        startIndex: startIndex + match.index,
        length: match[2].length
      };
    }

    // no vowels sets found after startIndex!
    return { found: false, startIndex: -1, length: -1 };
  }
}

/**
 * @class
 */
export class Spanish extends Language {
  vowels: string[];
  weakVowels: string[];
  strongVowels: string[];
  diphthongs: string[];
  uDiphthongExceptions: string[];

  constructor() {
    super("Spanish");

    this.vowels = ["a", "e", "i", "o", "u", "y", "á", "é", "í", "ó", "ú", "ü"];

    this.weakVowels = ["i", "u", "ü", "y"];

    this.strongVowels = ["a", "e", "o", "á", "é", "í", "ó", "ú"];

    this.diphthongs = [
      "ai",
      "ei",
      "oi",
      "ui",
      "ia",
      "ie",
      "io",
      "iu",
      "au",
      "eu",
      "ou",
      "ua",
      "ue",
      "uo",
      "ái",
      "éi",
      "ói",
      "úi",
      "iá",
      "ié",
      "ió",
      "iú",
      "áu",
      "éu",
      "óu",
      "uá",
      "ué",
      "uó",
      "üe",
      "üi"
    ];

    // a u between a g or q and these vowels is silent
    this.uDiphthongExceptions = [
      "gue",
      "gui",
      "qua",
      "que",
      "qui",
      "quo",
      "gué",
      "guí",
      "quá",
      "qué",
      "quí",
      "quó"
    ];
  }

  // c must be lowercase!
  isVowel(c: string) {
    for (var i = 0, end = this.vowels.length; i < end; i++)
      if (this.vowels[i] === c) return true;

    return false;
  }

  /**
   * @param {String} c The character to test; must be lowercase
   * @return {boolean} true if c is an f or a mute consonant
   */
  isWeakVowel(c: string) {
    for (var i = 0, end = this.weakVowels.length; i < end; i++)
      if (this.weakVowels[i] === c) return true;

    return false;
  }

  /**
   * @param {String} c The character to test; must be lowercase
   * @return {boolean} true if c is an f or a mute consonant
   */
  isStrongVowel(c: string) {
    for (var i = 0, end = this.strongVowels.length; i < end; i++)
      if (this.strongVowels[i] === c) return true;

    return false;
  }

  /**
   *
   * @param {String} s The string to test; must be lowercase
   * @return {boolean} true if s is a diphthong
   */
  isDiphthong(s: string) {
    for (var i = 0, end = this.diphthongs.length; i < end; i++)
      if (this.diphthongs[i] === s) return true;

    return false;
  }

  createSyllable(text: string) {
    /*
    var accented = false;
    var ellidesToNext = false;

    if (text.length > 0) {

        if (text[0] == '`') {
            accented = true;
            text = text.substr(1);
        }

        if (text[text.length - 1] == '_') {
            ellidesToNext = true;
            text = text.substr(0, text.length - 1);
        }
    }

    var s = new Syllable(text);

    s.isMusicalAccent = accented;
    s.elidesToNext = ellidesToNext;*/

    return text;
  }

  /**
   */
  syllabifyWord(word: string) {
    var syllables: string[] = [];

    var haveCompleteSyllable = false;
    var previousIsVowel = false;
    var previousIsStrongVowel = false; // only valid if previousIsVowel == true
    var startSyllable = 0;

    // fixme: first check for prefixes

    for (var i = 0; i < word.length; i++) {
      var c = word[i].toLowerCase();

      if (this.isVowel(c)) {
        // we have a complete syllable as soon as we have a vowel
        haveCompleteSyllable = true;

        var cIsStrongVowel = this.isStrongVowel(c);

        if (previousIsVowel) {
          // if we're at a strong vowel, then we finish out the last syllable
          if (cIsStrongVowel) {
            if (previousIsStrongVowel) {
              syllables.push(
                this.createSyllable(
                  word.substr(startSyllable, i - startSyllable)
                )
              );
              startSyllable = i;
            }
          }
        }

        previousIsVowel = true;
        previousIsStrongVowel = cIsStrongVowel;
      } else {
        if (!haveCompleteSyllable) {
          // do nothing since we don't have a complete syllable yet...
        } else {
          // handle explicit syllable breaks
          if (word[i] === "-") {
            // start new syllable
            syllables.push(
              this.createSyllable(word.substr(startSyllable, i - startSyllable))
            );
            startSyllable = ++i;
          } else {
            var numberOfConsonants = 1,
              consonant2;

            // count how many more consonants there are
            for (var j = i + 1; j < word.length; j++) {
              if (this.isVowel(word[j])) break;
              numberOfConsonants++;
            }

            if (numberOfConsonants === 1) {
              // start new syllable
              syllables.push(
                this.createSyllable(
                  word.substr(startSyllable, i - startSyllable)
                )
              );
              startSyllable = i;
            } else if (numberOfConsonants === 2) {
              consonant2 = word[i + 1].toLowerCase();
              if (
                consonant2 === "l" ||
                consonant2 === "r" ||
                (c === "c" && consonant2 === "h")
              ) {
                // split before the consonant pair
                syllables.push(
                  this.createSyllable(
                    word.substr(startSyllable, i - startSyllable)
                  )
                );
                startSyllable = i++;
              } else {
                //split the consonants
                syllables.push(
                  this.createSyllable(
                    word.substr(startSyllable, ++i - startSyllable)
                  )
                );
                startSyllable = i;
              }
            } else if (numberOfConsonants === 3) {
              consonant2 = word[i + 1].toLowerCase();

              // if second consonant is s, divide cc-c, otherwise divide c-cc
              if (consonant2 === "s") {
                i += 2;
                syllables.push(
                  this.createSyllable(
                    word.substr(startSyllable, i - startSyllable)
                  )
                );
              } else
                syllables.push(
                  this.createSyllable(
                    word.substr(startSyllable, ++i - startSyllable)
                  )
                );

              startSyllable = i;
            } else if (numberOfConsonants === 4) {
              // four always get split cc-cc
              syllables.push(
                this.createSyllable(
                  word.substr(startSyllable, i - startSyllable + 2)
                )
              );
              startSyllable = i + 2;
              i += 3;
            }
          }

          haveCompleteSyllable = false;
        }

        previousIsVowel = false;
      }
    }

    // if we have a complete syllable, we can add it as a new one. Otherwise
    // we tack the remaining characters onto the last syllable.
    if (haveCompleteSyllable) syllables.push(word.substr(startSyllable));
    else if (startSyllable > 0)
      syllables[syllables.length - 1] += word.substr(startSyllable);
    else if (syllables.length === 0) syllables.push(this.createSyllable(word));

    return syllables;
  }

  /**
   * @param {String} s the string to search
   * @param {Number} startIndex The index at which to start searching for a vowel in the string
   * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
   */
  findVowelSegment(s: string, startIndex: number): VowelSegment {
    var workingString = s.toLowerCase();

    // the first vowel segment after startIndex, whether a diphthong or a single vowel
    for (var index = startIndex; index < workingString.length; index++) {
      // skip a silent u, as in que or guí
      if (
        workingString[index] === "u" &&
        index > 0 &&
        this.uDiphthongExceptions.indexOf(
          workingString.substr(index - 1, 3)
        ) >= 0
      )
        continue;

      if (this.diphthongs.indexOf(workingString.substr(index, 2)) >= 0)
        return { found: true, startIndex: index, length: 2 };

      if (this.isVowel(workingString[index]))
        return { found: true, startIndex: index, length: 1 };
    }

    // no vowels sets found after startIndex!
    return { found: false, startIndex: -1, length: -1 };
  }
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

// a trie of strings, as Gregorio keeps its prefixes, suffixes and secondaries
interface CharacterTrie {
  next: Map<string, CharacterTrie>;
  isFinal: boolean;
}

function makeTrie(strings: string[], backwards = false): CharacterTrie {
  const root: CharacterTrie = { next: new Map(), isFinal: false };
  for (const string of strings) {
    let chars = Array.from(string);
    if (!chars.length) continue;
    if (backwards) chars = chars.reverse();
    let node = root;
    for (const char of chars) {
      let next = node.next.get(char);
      if (!next) node.next.set(char, (next = { next: new Map(), isFinal: false }));
      node = next;
    }
    node.isFinal = true;
  }
  return root;
}

// stands for an elision in the text searched for a vowel segment, as
// Gregorio's GREVOWEL_ELISION_MARK does
const ELISION_MARK = "\ufffe";

/**
 * A language whose vowel segments are found with rules like those of
 * Gregorio's vowel files (gregorio-vowels.dat): sets of vowels, prefixes,
 * suffixes and secondary centers.  It can't split words into syllables.
 * Like Gregorio, it doesn't fold case, so the rules list upper- and
 * lower-case characters.
 */
export class VowelRulesLanguage extends Language {
  vowels: Set<string>;
  prefixes: CharacterTrie;
  suffixes: CharacterTrie;
  secondary: CharacterTrie;

  constructor(name: string, rules: VowelRules) {
    super(name);
    this.vowels = new Set(Array.from(rules.vowels));
    // prefixes are matched backwards from the vowel
    this.prefixes = makeTrie(rules.prefixes || [], true);
    this.suffixes = makeTrie(rules.suffixes || []);
    this.secondary = makeTrie(rules.secondary || []);
  }

  /**
   * Reads the languages in the text of a Gregorio vowel file, by their names
   * and their aliases.
   */
  static fromVowelFile(text: string) {
    const rules: { [name: string]: VowelRules } = {};
    const aliases: { [alias: string]: string } = {};
    let current: VowelRules | null = null;
    // (comments end at the end of the line; each statement ends with a ;)
    const statements = text.replace(/#[^\n\r]*/g, "").split(";");
    for (const statement of statements) {
      const match = /^\s*(\w+)([\s\S]*)$/.exec(statement);
      if (!match) continue;
      const [, keyword, rest] = match;
      const names: string[] = [];
      const nameRegex = /\[([^\]]+)\]/g;
      let name: RegExpExecArray | null;
      while ((name = nameRegex.exec(rest))) names.push(name[1]);
      const strings = rest.split(/[\s,]+/).filter(Boolean);
      if (keyword === "language" && names.length) {
        current = rules[names[0]] = rules[names[0]] || { vowels: "", prefixes: [], suffixes: [], secondary: [] };
      } else if (keyword === "alias" && names.length === 2) {
        aliases[names[0]] = names[1];
      } else if (current && keyword === "vowel") {
        current.vowels += strings.join("");
      } else if (current && (keyword === "prefix" || keyword === "suffix")) {
        current[keyword === "prefix" ? "prefixes" : "suffixes"]!.push(...strings);
      } else if (current && keyword === "secondary") {
        current.secondary!.push(...strings);
      }
    }
    const languages: { [name: string]: VowelRulesLanguage } = {};
    for (const name of Object.keys(rules))
      languages[name] = new VowelRulesLanguage(name, rules[name]);
    for (let alias of Object.keys(aliases)) {
      // (an alias can be of another alias)
      let name = aliases[alias];
      for (let i = 0; i < 10 && !languages[name] && aliases[name]; i++) name = aliases[name];
      if (languages[name] && !languages[alias]) languages[alias] = languages[name];
    }
    return languages;
  }

  isVowel(char: string | undefined) {
    return char !== undefined && this.vowels.has(char);
  }

  /**
   * Finds the vowel segment as Gregorio does (gregorio_find_vowel_group in
   * its src/vowel/vowel.c), with the text in each ignored range (an elision)
   * counting as consonants.
   */
  findVowelSegment(s: string, startIndex: number, ignore: IgnoredRange[] = []): VowelSegment {
    // the characters searched, and where each is in s
    const chars: string[] = [];
    const indices: number[] = [];
    let index = startIndex;
    for (const char of Array.from(s.slice(startIndex))) {
      const offset = index - startIndex;
      const range = ignore.find((range) => range.index <= offset && offset < range.endIndex);
      if (!range) {
        chars.push(char);
        indices.push(index);
      } else if (offset === range.index) {
        chars.push(ELISION_MARK);
        indices.push(index);
      }
      index += char.length;
    }
    indices.push(index);
    const segment = (start: number, end: number): VowelSegment => ({
      found: true,
      startIndex: indices[start],
      length: indices[end] - indices[start]
    });

    // whether the vowel at i ends one of the prefixes
    const isInPrefix = (i: number) => {
      let node = this.prefixes;
      let next: CharacterTrie | undefined;
      while (i >= 0 && (next = node.next.get(chars[i]))) {
        node = next;
        i--;
      }
      return node.isFinal;
    };

    let start = -1,
      end = -1,
      suffix: CharacterTrie | undefined;
    for (let i = 0; i <= chars.length; i++) {
      const char = chars[i];
      if (start < 0) {
        if (this.isVowel(char)) {
          const following = chars[i + 1];
          if ((!this.isVowel(following) && following !== ELISION_MARK) || !isInPrefix(i))
            start = i;
        }
      } else if (!suffix) {
        if (!this.isVowel(char)) {
          end = i;
          suffix = this.suffixes.next.get(char);
          if (!suffix) return segment(start, end);
        }
      } else {
        if (suffix.isFinal) end = i;
        suffix = suffix.next.get(char);
        if (!suffix) return segment(start, end);
      }
    }

    // no vowel, so look for a secondary center
    for (start = 0; start < chars.length; start++) {
      let node: CharacterTrie | undefined = this.secondary;
      end = -1;
      for (let i = start; (node = node.next.get(chars[i])); i++) {
        if (node.isFinal) end = i + 1;
      }
      if (end >= 0) return segment(start, end);
    }

    // no vowels sets found after startIndex!
    return { found: false, startIndex: -1, length: -1 };
  }
}

/**
 * Church Slavonic, which Gregorio also uses for Polish, Czech and Slovak
 * (from Gregorio's gregorio-vowels.dat)
 */
export class ChurchSlavonic extends VowelRulesLanguage {
  constructor() {
    super("Church Slavonic", {
      vowels:
        "aàáâąAÀÁÂĄeèéêëěęEÈÉÊËĚĘiìíîIÌÍÎoòóôOÒÓÔuùúûůUÙÚÛŮyỳýYỲÝæǽÆǼœŒ",
      secondary: ["l", "L", "ĺ", "Ĺ", "r", "R", "ŕ", "Ŕ", "m", "M"]
    });
  }
}

/** Hungarian (from Gregorio's gregorio-vowels.dat) */
export class Hungarian extends VowelRulesLanguage {
  constructor() {
    super("Hungarian", {
      vowels: "aáAÁéeëÉEËiíIÍoóöőOÓÖŐuúüűUÚÜŰ"
    });
  }
}

export const language = {
  english: new English(),
  latin: new Latin(),
  spanish: new Spanish(),
  churchSlavonic: new ChurchSlavonic(),
  hungarian: new Hungarian()
};
