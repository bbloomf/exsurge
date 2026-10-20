const accentedVowels = {
    "Æ": "Ǽ",
    "Œ": "Œ́",
    "A": "Á",
    "E": "É",
    "I": "Í",
    "O": "Ó",
    "U": "Ú",
    "Y": "Ý",
    "æ": "ǽ",
    "œ": "œ́",
    "a": "á",
    "e": "é",
    "i": "í",
    "o": "ó",
    "u": "ú",
    "y": "ý"
};
export const addAccent = (vowel) => accentedVowels[vowel] || vowel;
//# sourceMappingURL=addAccent.js.map