const ligatures: { [vowels: string]: string } = {
  AE: "Æ",
  Ae: "Æ",
  ae: "æ",
  OE: "Œ",
  Oe: "Œ",
  oe: "œ"
};

export const makeLigature = (vowels: string) => ligatures[vowels] || vowels;
