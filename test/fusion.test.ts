// Gregorio's neume fusion, gabc @ (docs/gregorio-feature-gap.md, Phase 8).
// Each expected split is Gregorio's: the glyphs that gregorio (b63f074) writes
// for the same notes, such as PunctumOneUp, a punctum fused to a note a step
// higher.

import assert from "node:assert";
import { describe, it } from "vitest";
import * as Exsurge from "../src/index.js";

// the neumes of a syllable's notes: a FusedNeume as its glyphs (with @ if a
// glyph is fused and its interval up from the glyph before if it's joined to
// it), and other neumes by their class, with " + " between neumes that have no
// space between them and " | " between others
const fusion = (notes: string) => {
  const ctxt = new Exsurge.ChantContext();
  const neumes = Exsurge.Gabc.createMappingsFromSource(ctxt, `(c4) a(${notes})`)
    .flatMap((mapping) => mapping.notations)
    .filter((notation): notation is Exsurge.Neume => !!notation.isNeume);
  return neumes
    .map((neume, i) => {
      let text = neume.constructor.name;
      if (neume instanceof Exsurge.FusedNeume) {
        text = neume.glyphs
          .map((glyph, j) => {
            const shift = Exsurge.FusedNeume.fusedShift(neume.glyphs, j, neume.fusedToNext);
            const interval = shift > 0 ? "+" + shift : shift < 0 ? String(shift) : "";
            return glyph.kind + (glyph.fused ? "@" : "") + interval;
          })
          .join(" ");
      }
      return i + 1 < neumes.length ? text + (neume.trailingSpace === 0 ? " + " : " | ") : text;
    })
    .join("");
};

describe("Gregorio's neume fusion", function() {
  it("fuses the glyphs either side of an @, and joins them as Gregorio does", function() {
    const cases: [string, string][] = [
      // Gabc.tex's examples (Punctum, QuilismaOneUp, FlexusNobarOneOneUp,
      // PunctumOneDown, FlexusNobarOneDeminutus...)
      ["h@iw@ji@j@ih~", "punctum punctum@ flexus@+1 punctum@+1 flexus@-1"],
      ["d@eo@fd", "punctum punctum@+1 flexus@+1"],
      ["IJ@kh", "PunctaInclinata + Clivis"],
      ["g@h@g@h@g", "punctum punctum@+1 punctum@-1 punctum@+1 punctum@-1"],
      ["e@gfg", "punctum porrectus@+2"],
      ["hg@hg", "flexus flexus@+1"],
      ["gV@e", "virgaReversa punctum@-2"],
      ["g@iv", "punctum virga@+2"],
      ["h@gv", "punctum virga@-1"],
      // a pes is fused to a higher note only if it's a pes deminutus or quassus
      ["h@fg~", "punctum pes@-2"],
      ["h@fog", "punctum pes@-2"],
      ["h@fg", "punctum pes@"],
      ["gO@f", "punctum punctum@-1"],
      ["f@gO@h", "punctum punctum@+1 punctum@+1"],
      ["gw@hi", "punctum pes@+1"],
      // nothing is fused to a quilisma, a pes or a torculus
      ["g@hw", "punctum punctum@"],
      ["fg@hg", "pes flexus@"],
      ["g@hih", "Punctum + Torculus"],
      // Gregorio's glyphs, rather than exsurge's distropha and pes quassus,
      // are fused
      ["jj@h", "Punctum | punctum punctum@-2"],
      ["i@gOki", "punctum punctum@-2 flexus@+4"],
      // a flexus before a fused glyph can't be fused to a higher note
      ["j@if@Hj", "punctum flexus@ + PunctaInclinata | Punctum"],
      // nor is a stropha fused
      ["j@fs", "Punctum | Apostropha"],
      ["jj@fs", "Distropha | Apostropha"]
    ];
    for (const [notes, expected] of cases) assert.strictEqual(fusion(notes), expected, notes);
  });

  it("gives a fused neume that isn't joined no space before it, and no line break", function() {
    const ctxt = new Exsurge.ChantContext();
    const notations = Exsurge.Gabc.createMappingsFromSource(ctxt, "(c4) a(g@hih)").flatMap(
      (mapping) => mapping.notations
    );
    const punctum = notations[1];
    assert.ok(punctum instanceof Exsurge.Punctum);
    assert.strictEqual(punctum.trailingSpace, 0);
    assert.strictEqual(punctum.keepWithNext, true);
    assert.strictEqual(punctum.allowLineBreakBeforeNext, false);
  });
});
