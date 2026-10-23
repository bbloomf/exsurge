// Reading Gregorio's NABC as GregorioTeX does (see docs/gregorio-feature-gap.md,
// §13 and Phase 10).  Most of the NABC here is from Gregorio's NABC reference
// (doc/GregorioNabcRef.tex) and the scores that it prints (doc/veni.gabc and
// doc/omnes.gabc).

import assert from "node:assert";
import { describe, it } from "vitest";
import {
  ChantContext,
  type ChantNotationElement,
  Gabc,
  nabcAliases,
  nabcNameOfGlyph,
  parseNabc
} from "../src/index.js";

// each item in brief: a neume as its glyph names (base, prepunctis,
// subpunctis and letters) and its pitch if it isn't f, a space as it's
// written, and an error as ERR, which is what Gregorio draws
const brief = (nabc: string) =>
  parseNabc(nabc).map((item) => {
    if (item.type === "space") return (item.direction > 0 ? "/" : "`").repeat(item.size === "larger" ? 2 : 1);
    if (item.type === "error") return "ERR";
    let height = item.glyphs[0].height;
    return [
      item.base,
      item.prepunctis,
      item.subpunctis,
      ...item.letters.map((letter) => letter.name + letter.position),
      height === 5 ? "" : "h" + "abcdefghijklmnp"[height]
    ]
      .filter(Boolean)
      .join(" ");
  });

describe("parseNabc", function() {
  it("reads the example that Gregorio's NABC reference explains", function() {
    assert.deepStrictEqual(brief("```po////pe>2lse7lsl3qlhh!vshhppt1sut2ql>ppu3"), [
      "``",
      "`",
      "po",
      "//",
      "//",
      "pe>2 lse7 lsl3",
      "ql!vs ppt1 sut2 hh",
      "ql> ppu3"
    ]);
  });

  it("gives the parts of a neume and where it is", function() {
    assert.deepStrictEqual(parseNabc("/vi-hhppu2su1sut1lsc3"), [
      { type: "space", size: "interelement", direction: 1, index: 0, length: 1 },
      {
        type: "neume",
        glyphs: [{ neume: "vi", modifiers: "-", variant: "", height: 7 }],
        base: "vi-",
        prepunctis: "ppu2",
        subpunctis: "su1sut1",
        letters: [{ name: "lsc", position: 3 }],
        index: 1,
        length: 20
      }
    ]);
  });

  it("puts a glyph's modifiers in Gregorio's order, once each, before its variant", function() {
    assert.deepStrictEqual(brief("cl-S"), ["clS-"]);
    assert.deepStrictEqual(brief("vi~>-->"), ["vi->~"]);
    assert.deepStrictEqual(brief("GM"), ["ERR"]);
    assert.deepStrictEqual(brief("cl>1"), ["cl>1"]);
    assert.deepStrictEqual(brief("saM-4hk"), ["saM-4 hk"]);
    // (a second digit isn't a variant, so it can't start the next neume)
    assert.deepStrictEqual(brief("cl>12"), ["cl>1", "ERR"]);
  });

  it("reads a glyph's pitch from h and a pitch, which is f without one", function() {
    assert.deepStrictEqual(
      ["vi", "viha", "vihf", "vihn", "vihp"].map((nabc) => (parseNabc(nabc)[0] as { glyphs: { height: number }[] }).glyphs[0].height),
      [5, 0, 5, 13, 14]
    );
    // (there's no o)
    assert.deepStrictEqual(brief("viho"), ["ERR"]);
  });

  it("reads one neume after another, with nothing between them", function() {
    assert.deepStrictEqual(brief("peclhgpi"), ["pe", "cl hg", "pi"]);
    assert.deepStrictEqual(brief("vi-su1sut1vi-hhpr-hh"), ["vi- su1sut1", "vi- hh", "pr- hh"]);
  });

  it("joins glyphs with !, and names their pitches from the first glyph's", function() {
    assert.deepStrictEqual(brief("pecl!pr"), ["pe", "cl!pr"]);
    assert.deepStrictEqual(brief("qlhh!vshh"), ["ql!vs hh"]);
    // (two above the first glyph is h, as two above f is)
    assert.deepStrictEqual(brief("qlhh!vshj"), ["ql!vsh hh"]);
    assert.deepStrictEqual(brief("vihf!puha!clhp"), ["vi!pua!clp"]);
    assert.deepStrictEqual(brief("ql!po"), ["ql!po"]);
  });

  it("reads subpunctis and prepunctis, with their shapes, in the order written", function() {
    assert.deepStrictEqual(brief("visu1sut1sux1"), ["vi su1sut1sux1"]);
    assert.deepStrictEqual(brief("vippt3"), ["vi ppt3"]);
    assert.deepStrictEqual(brief("un1hbppn1ppq1sun2ql!po"), ["un1 ppn1ppq1 sun2 hb", "ql!po"]);
    assert.deepStrictEqual(brief("visu1lsc2ppt1su2"), ["vi ppt1 su1su2 lsc2"]);
  });

  it("reads significative letters and Tironian notes, in the order written", function() {
    assert.deepStrictEqual(brief("vilsc1lst1lsc9"), ["vi lsc1 lst1 lsc9"]);
    assert.deepStrictEqual(brief("vilseq-4ltdo6"), ["vi lseq-4 ltdo6"]);
    assert.deepStrictEqual(brief("clGhglsa5vi"), ["clG lsa5 hg", "vi"]);
    assert.deepStrictEqual(brief("to>ltsr6"), ["to> ltsr6"]);
  });

  it("reads spaces before and between neumes", function() {
    assert.deepStrictEqual(brief("/vi`"), ["/", "vi", "`"]);
    assert.deepStrictEqual(brief("/////bv-"), ["//", "//", "/", "bv-"]);
    assert.deepStrictEqual(brief("un1helst8`tohi"), ["un1 lst8 he", "`", "to hi"]);
    assert.deepStrictEqual(brief("``"), ["``"]);
    assert.deepStrictEqual(brief(""), []);
  });

  describe("NABC that Gregorio can't read", function() {
    it("is an error from where Gregorio stops reading, to the end", function() {
      assert.deepStrictEqual(brief("vi/xx/pe"), ["vi", "/", "ERR"]);
      assert.deepStrictEqual(parseNabc("vi/xx/pe")[2], { type: "error", message: "not a neume", index: 3, length: 5 });
      for (let nabc of ["vix", "vi ", "vih"]) assert.deepStrictEqual(brief(nabc), ["vi", "ERR"], nabc);
      for (let nabc of ["xx", "v", "vi!", "vi!x", "visu", "visut", "vippa1", "vilsc", "vilsc0", "vilsz3", "viltc3"])
        assert.deepStrictEqual(brief(nabc), ["ERR"], nabc);
    });

    it("is an error where puncta or letters have no neume", function() {
      assert.deepStrictEqual(brief("su1sut1sux1"), ["ERR"]);
      assert.deepStrictEqual(brief("lsc3pu"), ["ERR"]);
      assert.deepStrictEqual(brief("//lsc3"), ["//", "ERR"]);
    });

    it("is an error for lspulcre, which GregorioTeX's list of letters doesn't have", function() {
      assert.deepStrictEqual(brief("vilspulcre2"), ["ERR"]);
    });

    it("is an error, which Gregorio reads past, where glyphs are too far apart in pitch", function() {
      assert.deepStrictEqual(brief("viha!puhp/pe"), ["ERR", "/", "pe"]);
      assert.deepStrictEqual(brief("vihp!pu"), ["ERR"]);
      // (5 below and 9 above are as far as they go)
      assert.deepStrictEqual(brief("vihk!puhf"), ["vi!pua hk"]);
      assert.deepStrictEqual(brief("viha!puhj"), ["vi!pup ha"]);
      assert.deepStrictEqual(parseNabc("viha!puhp/pe")[0], {
        type: "error",
        message: "the neumes are too far apart",
        index: 0,
        length: 9
      });
    });

    it("is an error, not an exception, where GregorioTeX reads a character as a pattern", function() {
      // (GregorioTeX takes vi. for vi and vih. for viha, and stops with an
      // error at vi%)
      for (let nabc of ["vi.", "vi^", "vi$", "vi%", "vi("]) assert.deepStrictEqual(brief(nabc), ["vi", "ERR"], nabc);
      for (let nabc of ["vih.", "visu."]) assert.deepStrictEqual(brief(nabc), ["ERR"], nabc);
    });
  });

  it("reads all the NABC in the scores that Gregorio's NABC reference prints", function() {
    // doc/veni.gabc, in St. Gall neumes
    let veni = [
      "ta>", "peclhgpi", "ta-", "bv-", "vi-hhppu2su1sut1", "to", "pt", "/////bv-", "pe-hhsu1sut1", "vi-su2sut1",
      "pe-su2suy1", "pr", "``qlppt1", "ci-or>peS", "vi-", "ql-ppt1", "tohh", "cl-hhvi-hi", "po-1", "vi-su1sut1vi-hhpr-hh",
      "ta", "pe->", "vi>", "vi-po-1hh", "cl-hh", "pehh", "vi-hh", "pe", "/////vi-hhsu1sut1", "vi-su1sut1", "pe-su1sut1",
      "pi", "tahksaM-4hkvi-hisu1sut1vi-hisu1sut1", "``pe-su1sut1", "``pi", "``ql-ppt1vi-hj", "//vi-", "cl", "pecl!pr",
      "vi-hhppt2su1sut1"
    ];
    // doc/omnes.gabc, in Laon neumes
    let omnes = [
      "clGhhta>", "un1hg", "puhd", "pu", "un1helst8`tohi", "clGhglsa5vi", "bvlsa2", "un", "unhd",
      "un1hbppn1ppq1sun2ql!po", "clGhg", "clGhdlsa5vihbqlheunhh", "un1heppn1sun2", "unlsa2`vi>", "tosu1", "to>ltsr6"
    ];
    for (let nabc of [...veni, ...omnes])
      assert.ok(
        parseNabc(nabc).every((item) => item.type !== "error"),
        nabc
      );
    assert.deepStrictEqual(brief("tahksaM-4hkvi-hisu1sut1vi-hisu1sut1"), [
      "ta hk",
      "saM-4 hk",
      "vi- su1sut1 hi",
      "vi- su1sut1 hi"
    ]);
    assert.deepStrictEqual(brief("clGhdlsa5vihbqlheunhh"), ["clG lsa5 hd", "vi hb", "ql he", "un hh"]);
  });
});

describe("nabcAliases", function() {
  it("has Gregorio's 44 other names for glyphs", function() {
    assert.strictEqual(Object.keys(nabcAliases).length, 44);
    assert.strictEqual(nabcAliases["ci~"], "cl>");
    assert.strictEqual(nabcAliases.visu2, "ci");
    assert.strictEqual(nabcAliases["pf!cl~ppt1"], "cl!po>ppt1");
  });

  it("names neumes as parseNabc() names them", function() {
    // (other than suu1 and ppu1, which are subpunctis and prepunctis)
    for (let alias of Object.keys(nabcAliases).filter((alias) => !/^(su|pp)/.test(alias))) {
      let items = parseNabc(alias);
      assert.strictEqual(items.length, 1, alias);
      let neume = items[0];
      assert.ok(neume.type === "neume", alias);
      assert.strictEqual(
        neume.base + neume.prepunctis + neume.subpunctis + neume.letters.map((letter) => letter.name + letter.position).join(""),
        alias
      );
    }
  });
});

describe("nabcNameOfGlyph", function() {
  it("reads B, N, E and T in the names of Gregorio's NABC glyphs as >, -, ! and ~", function() {
    assert.strictEqual(nabcNameOfGlyph("clBpp2"), "cl>pp2");
    assert.strictEqual(nabcNameOfGlyph("pfEclT"), "pf!cl~");
    assert.strictEqual(nabcNameOfGlyph("viNsu1"), "vi-su1");
    assert.strictEqual(nabcNameOfGlyph("lseqN"), "lseq-");
    assert.strictEqual(nabcNameOfGlyph("clMSG"), "clMSG");
  });
});

describe("NABC in gabc", function() {
  const parseNotations = (gabc: string) => {
    const ctxt = new ChantContext();
    const notations = Gabc.createMappingsFromSource(ctxt, gabc).flatMap((mapping) => mapping.notations);
    return notations[0]?.isClef ? notations.slice(1) : notations;
  };
  const parsedNabcOf = (notation: ChantNotationElement) =>
    notation.parsedNabc && notation.parsedNabc.map((line) => line.map((item) => (item.type === "neume" ? item.base : item.type)));

  it("is parsed on the notation that keeps it", function() {
    // (the example at the start of Gregorio's NABC reference)
    const notations = parseNotations(
      "nabc-lines: 1;\n%%\n(f3) AL(ef~|ta>)le(fg/hggf|peclhgpi)lú(ef~|ta>)ia.(f.|ta-) (,)\n" +
        "(ii//|bv-|gh!ivHG//|vi-hhppu2su1sut1|fhg/|to|eef.|pt) (;)"
    );
    assert.deepStrictEqual(
      notations.filter((notation) => notation.nabc).map(parsedNabcOf),
      [[["ta>"]], [["pe", "cl", "pi"]], [["ta>"]], [["ta-"]], [["bv-"]], [["vi-"]], [["to"]], [["pt"]]]
    );
    assert.deepStrictEqual(
      notations.filter((notation) => notation.nabc).map((notation) => notation.nabc),
      [["ta>"], ["peclhgpi"], ["ta>"], ["ta-"], ["bv-"], ["vi-hhppu2su1sut1"], ["to"], ["pt"]]
    );
    assert.strictEqual(notations.filter((notation) => notation.parsedNabc && !notation.nabc).length, 0);
  });

  it("is parsed for each line, with errors, and with a space where Gabc joins two strings", function() {
    const notations = parseNotations("nabc-lines: 2;\n%%\n(c3) a(g|vi-|pex) b(g||ta|h|cl) c(|vi)");
    assert.deepStrictEqual(notations.filter((notation) => notation.nabc).map(parsedNabcOf), [
      [["vi-"], ["pe", "error"]],
      [[], ["ta"]],
      [["cl"]],
      [["vi"]]
    ]);
    // (a(fg|pe||vi) has an empty part of gabc, whose NABC Gabc puts after a /)
    const joined = parseNotations("nabc-lines: 1;\n%%\n(c3) a(fg|pe||vi)");
    assert.deepStrictEqual(parsedNabcOf(joined[0]), [["pe", "space", "vi"]]);
  });
});
