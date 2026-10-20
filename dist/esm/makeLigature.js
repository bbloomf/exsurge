const ligatures = {
    AE: "Æ",
    Ae: "Æ",
    ae: "æ",
    OE: "Œ",
    Oe: "Œ",
    oe: "œ"
};
export const makeLigature = (vowels) => ligatures[vowels] || vowels;
//# sourceMappingURL=makeLigature.js.map