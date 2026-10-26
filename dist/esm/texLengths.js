// TeX lengths, as Gregorio gives them (in gabc, as for a brace's length, and
// in GregorioTeX's own dimensions), in exsurge's staff intervals.
// a TeX length: a number (with TeX's . or , for the decimal point) and a unit
// in either case, maybe with true before it (the same at TeX's usual
// magnification), and any stretch and shrink after it (plus …, minus …)
const texLengthRegex = /^\s*([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*(?:true\s*)?([a-z]{2})(?:\s*(?:plus|minus).*)?\s*$/i;
// TeX's units in scaled points (with em and ex those of TeX's default font, cmr10)
const texUnits = {
    sp: 1,
    pt: 65536,
    bp: (65536 * 72.27) / 72,
    pc: 65536 * 12,
    in: 65536 * 72.27,
    cm: (65536 * 72.27) / 2.54,
    mm: (65536 * 72.27) / 25.4,
    dd: (65536 * 1238) / 1157,
    cc: (65536 * 12 * 1238) / 1157,
    em: 65536 * 10,
    ex: 65536 * 4.30554
};
// a staff interval (from a line to the next space) in scaled points at
// Gregorio's default staff size, \gre@factor 17: half the distance between
// lines, (\gre@dimen@interstafflinedistancebase + \gre@dimen@stafflinethicknessbase) * 17
const gregorioStaffIntervalInSp = ((30000 + 1500) * 17) / 2;
/**
 * a TeX length in staff intervals at Gregorio's default staff size, or
 * undefined if it isn't a length exsurge can read (TeX can take a macro)
 */
export function texLengthToStaffIntervals(length) {
    var results = length.match(texLengthRegex);
    var unit = results && results[2].toLowerCase();
    if (!unit || !texUnits.hasOwnProperty(unit))
        return undefined;
    return ((Number(results[1].replace(",", ".")) * texUnits[unit]) /
        gregorioStaffIntervalInSp);
}
//# sourceMappingURL=texLengths.js.map