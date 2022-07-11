export const makeLigature = (vowels) =>
  ({
    AE: "Æ",
    Ae: "Æ",
    ae: "æ",
    OE: "Œ",
    Oe: "Œ",
    oe: "œ"
  }[vowels] || vowels);
