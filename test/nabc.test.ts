// Reading Gregorio's NABC as GregorioTeX does (see docs/gregorio-feature-gap.md,
// §13 and Phase 10).  Most of the NABC here is from Gregorio's NABC reference
// (doc/GregorioNabcRef.tex) and the scores that it prints (doc/veni.gabc and
// doc/omnes.gabc).

import assert from "node:assert";
import { describe, it } from "vitest";
import * as Exsurge from "../src/index.js";
import {
  ChantContext,
  type ChantNotationElement,
  Gabc,
  layoutNabc,
  nabcAliases,
  NabcDimensions,
  type NabcFont,
  nabcGlyphName,
  nabcNameOfGlyph,
  parseNabc
} from "../src/index.js";
import { gregall } from "../src/nabc/gregall.js";
import { grelaon } from "../src/nabc/grelaon.js";
import { gresgmodern } from "../src/nabc/gresgmodern.js";
import { featureCases } from "./golden/cases";
import { render } from "./golden/harness";

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

describe("the NABC fonts", function() {
  const fonts: NabcFont[] = [gregall, gresgmodern, grelaon];

  it("name each glyph as parseNabc() reads it", function() {
    // (but for a glyph in each that GregorioTeX never looks for: a joined
    // glyph's name has one letter for its pitch, not h and a pitch, and a
    // glyph's modifiers come before its variant)
    let unreadable: { [font: string]: string[] } = { gregall: ["to!ciGhh"], gresgmodern: ["toM2-"], grelaon: ["to!pohd"] };
    for (let font of fonts) {
      let unread: string[] = [];
      for (let [name, [width, height, depth, path]] of Object.entries(font.glyphs)) {
        assert.ok(width >= 0 && height >= 0 && depth >= 0, name);
        // (ni, nihil, draws nothing)
        assert.strictEqual(path === "", name === "ni", name);
        // the glyphs of letters and puncta alone aren't neumes
        if (/^(ls|lt|su|pp)/.test(name)) continue;
        let items = parseNabc(name);
        let neume = items[0];
        if (
          items.length !== 1 ||
          neume.type !== "neume" ||
          neume.base + neume.prepunctis + neume.subpunctis + neume.letters.map((letter) => letter.name + letter.position).join("") !==
            name
        )
          unread.push(name);
      }
      assert.deepStrictEqual(unread, unreadable[font.name], font.name);
    }
    assert.deepStrictEqual(
      fonts.map((font) => [font.name, font.unitsPerEm, Object.keys(font.glyphs).length]),
      [["gregall", 1000, 603], ["gresgmodern", 1000, 524], ["grelaon", 1000, 572]]
    );
  });

  it("have the glyphs of Gregorio's aliases, but for a few, and grelaon doesn't use them", function() {
    const missing = (font: NabcFont) =>
      Object.entries(nabcAliases)
        .filter(([alias]) => !nabcGlyphName(font, alias))
        .map(([alias, name]) => `${alias} ${name}`);
    // (gresgmodern has sf>, sfG and sfM1, and in both, ta>ppt1's glyph is
    // sc~'s, an alias itself, of pe>2)
    assert.deepStrictEqual(missing(gregall), ["cl>pp2 sf>", "toppt1 sfG", "clMpp2 sfM1", "clpp2lsc2 sflsc2"]);
    assert.deepStrictEqual(missing(gresgmodern), [
      "visu2lsc3 cilsc3",
      "clpp2lsc2 sflsc2",
      "cippt1lsc3 vippt1su2lsc3",
      "cippu1lsc3 vippu1su2lsc3"
    ]);
    assert.ok("cl>" in grelaon.glyphs);
    assert.strictEqual(nabcGlyphName(grelaon, "ci~"), undefined);
  });
});

describe("layoutNabc", function() {
  // the glyphs that it places, as [name, x, y], and where the errors are
  const laidOut = (nabc: string, alignment: "full" | "neume" = "full") => {
    let layout = layoutNabc(parseNabc(nabc), gregall, { interElementSpace: 100, largerSpace: 150, alignment });
    return {
      glyphs: layout.glyphs.map((glyph) => [glyph.name, glyph.x, glyph.y]),
      errors: layout.errors,
      width: layout.width
    };
  };

  // (what GregorioTeX's own Lua lays out with gregall's metrics, with 100
  // and 150 for its two spaces)
  it("draws a neume with the glyph that has the most of it in it, as GregorioTeX does", function() {
    assert.deepStrictEqual(laidOut("vilsc3"), { glyphs: [["vilsc3", 0, 0]], errors: [], width: 797 });
    assert.deepStrictEqual(laidOut("vi-hhppu2su1sut1"), {
      glyphs: [["ppu2", 0, 286.5], ["vi-su1sut1", 909, 286.5]],
      errors: [],
      width: 2136
    });
  });

  it("draws the glyphs of Gregorio's aliases", function() {
    assert.strictEqual(nabcGlyphName(gregall, "ci~"), "cl>");
    assert.deepStrictEqual(laidOut("ci~"), { glyphs: [["cl>", 0, 0]], errors: [], width: 995 });
    assert.deepStrictEqual(laidOut("clppt2lsc6lst8"), {
      glyphs: [["sfS", 0, 0], ["lst", 518, -296], ["lsc", 1924, 462.5]],
      errors: [],
      width: 2368
    });
    // (through sc~, which is itself an alias, which GregorioTeX may or may not do)
    assert.strictEqual(nabcGlyphName(gregall, "ta>ppt1"), "pe>2");
    assert.strictEqual(nabcGlyphName({ ...gregall, name: "grelaon" }, "ci~"), undefined);
  });

  it("puts letters around the neume, those at one position side by side", function() {
    assert.deepStrictEqual(laidOut("pfhhlsl2lsc2"), {
      glyphs: [["pf", 0, 286.5], ["lsl", 134, 1091.5], ["lsc", 584, 1091.5]],
      errors: [],
      width: 1162
    });
    assert.deepStrictEqual(laidOut("vippt1lsc2"), {
      glyphs: [["ppt1", 0, 0], ["vi", 488, 0], ["lsc", 388, 568]],
      errors: [],
      width: 1220
    });
    assert.deepStrictEqual(laidOut("vilst1lsc4lsx7"), {
      glyphs: [["lst", 0, 433], ["lsc", 444, 125], ["lsx", 138, -250], ["vi", 888, 0]],
      errors: [],
      width: 1620
    });
    assert.deepStrictEqual(laidOut("tolse4lsc6"), {
      glyphs: [["lse", 0, 93.5], ["to", 724, 0], ["lsc", 1453, 105.5]],
      errors: [],
      width: 1897
    });
  });

  it("hangs the letters on the left back, with 'neume' alignment", function() {
    assert.deepStrictEqual(laidOut("vilst1lsc4lsx7", "neume"), {
      glyphs: [["lst", -888, 433], ["lsc", -444, 125], ["lsx", -750, -250], ["vi", 0, 0]],
      errors: [],
      width: 732
    });
    assert.deepStrictEqual(laidOut("tolse4lsc6", "neume"), {
      glyphs: [["lse", -724, 93.5], ["to", 0, 0], ["lsc", 729, 105.5]],
      errors: [],
      width: 1173
    });
  });

  it("makes the spaces, raises neumes by their pitch, and measures them", function() {
    assert.deepStrictEqual(laidOut("cl/pe//vi`to``pu"), {
      glyphs: [["cl", 0, 0], ["pe", 708, 0], ["vi", 1874, 0], ["to", 2506, 0], ["pu", 3085, 0]],
      errors: [],
      width: 3441
    });
    let layout = layoutNabc(parseNabc("vihk"), gregall, { interElementSpace: 100, largerSpace: 150 });
    assert.deepStrictEqual(layout.glyphs, [{ name: "vi", x: 0, y: 716.25 }]);
    assert.deepStrictEqual(
      [layout.height, layout.depth, layout.raised, layout.lowered],
      [716.25 + gregall.glyphs.vi[1], 0, 716.25, 0]
    );
  });

  it("puts the letters below a neume with puncta below its glyphs, not its height below them", function() {
    // (GregorioTeX takes the height for the depth there, which puts this
    // letter 700 below the baseline)
    let [, , suDepth] = gregall.glyphs.su1;
    let [, , clDepth] = gregall.glyphs["cl>"];
    let [, lsiHeight, lsiDepth] = gregall.glyphs.lsi;
    let letter = laidOut("ci~su1lsi7").glyphs[0];
    assert.deepStrictEqual(letter, ["lsi", 0, -Math.max(suDepth, clDepth) - (lsiHeight + lsiDepth) / 2]);
  });

  it("makes an error of a neume that the font can't draw, which takes the room it's given", function() {
    assert.deepStrictEqual(laidOut("pv"), { glyphs: [], errors: [0], width: 0 });
    assert.deepStrictEqual(laidOut("vilspulcre2"), { glyphs: [], errors: [0], width: 0 });
    let layout = layoutNabc(parseNabc("vixx"), gregall, { interElementSpace: 100, largerSpace: 150, errorWidth: 500 });
    assert.deepStrictEqual([layout.errors, layout.width], [[732], 1232]);
  });
});

describe("NABC on the staff", function() {
  it("goes where GregorioTeX puts it, further from the staff for low notes and neumes", async function() {
    const goldenCase = featureCases.find((c) => c.name === "nabc-two-voices")!;
    const { score, ctxt } = await render(Exsurge as any, goldenCase.gabc, goldenCase, ["svg"]);
    let baselines = score.lines.map((line: any) => {
      let voices: number[][] = [[], []];
      for (let i = line.notationsStartIndex; i < line.notationsStartIndex + line.numNotationsOnLine; i++)
        for (let nabc of score.notations[i].nabcNeumes || []) if (nabc) voices[nabc.voice].push(nabc.baseline / ctxt.staffInterval);
      return voices.map((voice) => [...new Set(voice.map((baseline) => +baseline.toFixed(6)))]);
    });
    let above = -7 - NabcDimensions.aboveLinesRaise;
    let below = -1 + NabcDimensions.belowLinesHeight;
    assert.deepStrictEqual(baselines[0], [[+above.toFixed(6)], [+below.toFixed(6)]]);
    // (its vihb reaches further than a staff interval less than the room
    // above the staff, and its b is two staff intervals below the staff)
    assert.ok(baselines[1][0][0] < above);
    assert.deepStrictEqual(baselines[1][1], [+(below + 1).toFixed(6)]);
  });

  it("isn't drawn without a font", async function() {
    const goldenCase = featureCases.find((c) => c.name === "nabc-st-gall-basic")!;
    const { score } = await render(Exsurge as any, goldenCase.gabc, { ...goldenCase, setupContext: undefined }, ["svg"]);
    assert.ok(score.notations.every((notation: ChantNotationElement) => !notation.nabcNeumes));
    assert.ok(score.notations.some((notation: ChantNotationElement) => notation.parsedNabc));
  });

  it("draws ERR in the lyrics' font, with its names in ', and in the neumes' color", async function() {
    const { outputs } = await render(Exsurge as any, "nabc-lines: 1;\n%%\n(c4) (f|vixx) (::)", {
      strategy: "none",
      setupContext: (ctxt) => {
        ctxt.nabcFonts = [gregall];
        ctxt.textStyles.lyric.font = '"Times New Roman", serif';
        ctxt.neumeLineColor = "#a00";
      }
    }, ["svg"]);
    assert.match(outputs.svg!, /<text class="nabcError" [^>]*font-family="'Times New Roman', serif" [^>]*fill="#a00" >ERR</);
  });

  it("gives another font of the same name defs of its own", async function() {
    const copy: NabcFont = { ...gregall, glyphs: { ...gregall.glyphs, vi: gregall.glyphs.pe } };
    const { outputs } = await render(Exsurge as any, "nabc-lines: 2;\n%%\n(c4) a(f|vi|vi) (::)", {
      setupContext: (ctxt) => (ctxt.nabcFonts = [gregall, copy])
    }, ["svg"]);
    const hrefs = [...outputs.svg!.matchAll(/xlink:href="#(Nabc-[^"]*)"/g)].map((match) => match[1]);
    assert.strictEqual(hrefs.length, 2);
    assert.notStrictEqual(hrefs[0], hrefs[1]);
    for (const id of hrefs) assert.ok(outputs.svg!.includes(`id="${id}"`), id);
  });

  it("has no glyphs or defs where it's a phantom", async function() {
    const { score, ctxt } = await render(Exsurge as any, "nabc-lines: 1;\n%%\n(c4) a(f|vilsc2) b(g|pe) (::)", {
      setupContext: (ctxt) => {
        ctxt.nabcFonts = [gregall];
        ctxt.nabcVisibility = ["phantom"];
      }
    }, ["svg"]);
    const nabcs = score.notations.flatMap((notation: ChantNotationElement) => notation.nabcNeumes || []);
    assert.strictEqual(nabcs.length, 2);
    assert.ok(nabcs.every((nabc: any) => nabc.phantom && nabc.glyphs.length === 0 && nabc.bounds.width > 0));
    assert.deepStrictEqual(Object.keys(ctxt.defs).filter((id) => id.startsWith("Nabc-")), []);
  });
});

describe("NABC among the notes", function() {
  const layOut = async (gabc: string, options: Parameters<typeof render>[2] = {}) =>
    (await render(Exsurge as any, gabc, { setupContext: (ctxt) => (ctxt.nabcFonts = [gregall]), ...options }, ["svg"])).score;
  // where the NABC of each notation that has it starts and ends on its line
  const nabcExtents = (score: any) =>
    score.notations.flatMap((notation: ChantNotationElement) =>
      (notation.nabcNeumes || []).flatMap((nabc) =>
        nabc ? [[notation.bounds.x + nabc.bounds.x, notation.bounds.x + nabc.bounds.right()]] : []
      )
    );
  const wide = "vilst4lsc1/pelsc2/cllsc3/tolsc2/vilsc3/pelsc2";

  it("stays within the staff when the line is justified", async function() {
    const syllables = Array.from({ length: 16 }, (_, i) => `la(g|${i % 2 ? wide : "vi"})`);
    for (const width of [250, 300, 350]) {
      const score = await layOut(`nabc-lines: 1;\n%%\n(c4) ${syllables.join(" ")} (::)`, { width });
      assert.ok(score.lines.length > 1);
      for (const line of score.lines) {
        assert.ok(line.bounds.width <= line.staffRight + 1e-9, `${width}: ${line.bounds.width}`);
        for (let i = line.notationsStartIndex; i < line.notationsStartIndex + line.numNotationsOnLine; i++)
          for (const [, right] of nabcExtents({ notations: [score.notations[i]] }))
            assert.ok(right <= line.staffRight + 1e-9, `${width}: ${right}`);
      }
    }
  });

  it("of a syllable without notes is kept clear by the syllables after it", async function() {
    for (const strategy of ["fontkit", "none"] as const) {
      const score = await layOut(`nabc-lines: 1;\n%%\n(c4) a(f|vi) b(|${wide}) c(g|ta) d(|pe) e(|cl) f(g|vi) (::)`, {
        width: 0,
        strategy
      });
      const extents = nabcExtents(score);
      assert.strictEqual(extents.length, 6);
      extents.slice(1).forEach(([left]: number[], i: number) => assert.ok(left >= extents[i][1], `${strategy}: ${i + 1}`));
    }
  });

  it("moves the notes over for the letters that hang back only with 'neume' alignment", async function() {
    const notesAt = async (nabc: string, nabcAlignment: "full" | "neume") =>
      (await layOut(`nabc-lines: 1;\n%%\n(c4) a(f|${nabc}) b(g|vi) (::)`, {
        width: 0,
        setupContext: (ctxt) => {
          ctxt.nabcFonts = [gregall];
          ctxt.nabcAlignment = nabcAlignment;
        }
      })).notations[0].bounds.x;
    // (` moves the NABC back, rather than the notes on)
    assert.strictEqual(await notesAt("`vi", "full"), await notesAt("vi", "full"));
    assert.ok((await notesAt("vilst4", "neume")) > (await notesAt("vilst4", "full")));
  });

  it("doesn't move notes that have none drawn", async function() {
    const at = async (gabc: string) => {
      const score = await layOut(`nabc-lines: 2;\n%%\n(c4) ${gabc} (::)`, {
        width: 0,
        setupContext: (ctxt) => {
          ctxt.nabcFonts = [gregall];
          ctxt.nabcVisibility = ["visible", "invisible"];
        }
      });
      return score.notations.map((notation: ChantNotationElement) => [notation.bounds.x, !!notation.nabcNeumes]);
    };
    // (the second part's NABC is on the second line, which isn't drawn)
    const drawn = await at(`a(f|${wide}|pu|g||ta)`);
    assert.deepStrictEqual(drawn.map(([, nabc]: any[]) => nabc), [true, false, false]);
    assert.deepStrictEqual(drawn, await at(`a(f|${wide}|pu|g)`));
  });

  it("on a clef or a line break is drawn after it", async function() {
    const score = await layOut("nabc-lines: 1;\n%%\n(c4|vi) a(f|pe) (z|to) b(g|cl) (c3|pu) c(h|ta) (::)");
    const drawn = score.notations.filter((notation: ChantNotationElement) => notation.nabcNeumes);
    assert.deepStrictEqual(
      drawn.map((notation: ChantNotationElement) => [notation.constructor.name, notation.nabc]),
      [["TextOnly", ["vi"]], ["Punctum", ["pe"]], ["TextOnly", ["to"]], ["Punctum", ["cl"]], ["TextOnly", ["pu"]], ["Punctum", ["ta"]]]
    );
    // (the line break's on the next line)
    assert.strictEqual(score.lines[1].notationsStartIndex, drawn[2].notationIndex);
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

  it("is read again when the notation's NABC changes", function() {
    const [notation] = parseNotations("nabc-lines: 1;\n%%\n(c3) a(g|vi)");
    assert.deepStrictEqual(parsedNabcOf(notation), [["vi"]]);
    notation.nabc = ["pe"];
    assert.deepStrictEqual(parsedNabcOf(notation), [["pe"]]);
    notation.nabc[0] = "cl";
    assert.deepStrictEqual(parsedNabcOf(notation), [["cl"]]);
    delete notation.nabc;
    assert.strictEqual(notation.parsedNabc, undefined);
  });

  it("on a clef or a line break goes on the next notation of its part, or one of its own after it", function() {
    const notations = parseNotations("nabc-lines: 1;\n%%\n(c4) a(f|vi) (z|pe) b(g|ta) (c3 hg|cl) c(h|vi) (c4|to|g|pu) d(f|vi)");
    assert.deepStrictEqual(
      notations.filter((notation) => notation.nabc).map((notation) => [notation.constructor.name, notation.nabc]),
      [
        ["Punctum", ["vi"]],
        ["TextOnly", ["pe"]],
        ["Punctum", ["ta"]],
        ["Clivis", ["cl"]],
        ["Punctum", ["vi"]],
        ["TextOnly", ["to"]],
        ["Punctum", ["pu"]],
        ["Punctum", ["vi"]]
      ]
    );
  });
});
