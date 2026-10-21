// Parsing gabc headers as Gregorio does (see docs/gregorio-feature-gap.md, §1).

import assert from "node:assert";
import { describe, it } from "vitest";
import {
  Annotation,
  Annotations,
  type ApplyHeaderOptions,
  ChantContext,
  ChantScore,
  Gabc,
  GabcHeader,
  language,
  type Language
} from "../src/index.js";

describe("GabcHeader", function() {
  it("reads name: value; lines under their gabc and camelCase names", function() {
    const header = new GabcHeader("name: Kyrie;\noffice-part: Kyriale;\n%%\n(c4) a(f)");
    assert.strictEqual(header.name, "Kyrie");
    assert.strictEqual(header["office-part"], "Kyriale");
    assert.strictEqual(header.officePart, "Kyriale");
  });

  it("ignores spaces after the semicolon", function() {
    const header = new GabcHeader("name: x;   \nmode: 8;\t\n%%\n");
    assert.strictEqual(header.name, "x");
    assert.strictEqual(header.mode, "8");
  });

  it("keeps a semicolon followed by more of the value", function() {
    const header = new GabcHeader("name: a; b;\n%%\n");
    assert.strictEqual(header.name, "a; b");
  });

  it("reads a value over several lines, ending in ;;", function() {
    const header = new GabcHeader("name: one;\ncommentary: first line\nsecond line;;\nmode: 8;\n%%\n");
    assert.strictEqual(header.name, "one");
    assert.strictEqual(header.commentary, "first line\nsecond line");
    assert.strictEqual(header.mode, "8");
  });

  it("reads a def-m macro written over several lines", function() {
    const header = new GabcHeader("def-m1:\n\\def\\x{y}\n\\x;;\n%%\n");
    assert.strictEqual(header["def-m1"], "\n\\def\\x{y}\n\\x");
    assert.strictEqual(header.defM1, header["def-m1"]);
  });

  it("collects repeated multi-line values in the field's array", function() {
    const header = new GabcHeader("annotation: one\ntwo;;\nannotation: three;\n%%\n");
    assert.deepStrictEqual(header.annotationArray, ["one\ntwo", "three"]);
  });

  it("still reads a line without a semicolon as a value on its own", function() {
    const header = new GabcHeader("name: Kyrie\nmode: 8\n%%\n");
    assert.strictEqual(header.name, "Kyrie");
    assert.strictEqual(header.mode, "8");
  });

  it("doesn't run a value into a comment or the end of the header", function() {
    const header = new GabcHeader("name: Kyrie\n% a comment;;\nmode: 8\n%%\n");
    assert.strictEqual(header.name, "Kyrie");
    assert.strictEqual(header.mode, "8");
    assert.strictEqual(header.comments[1], "% a comment;;");
  });

  it("ends the header at a line of two or more %s", function() {
    for (const end of ["%%", "%%%", "%%%%", "%% ", "%%\r"]) {
      const text = `name: Kyrie;\n${end}\n(c4) a(f)`;
      assert.strictEqual(GabcHeader.getLength(text), text.indexOf("(c4)"), JSON.stringify(end));
      const header = new GabcHeader(text);
      assert.strictEqual(header.name, "Kyrie");
      assert.deepStrictEqual(header.comments, [], JSON.stringify(end));
    }
  });

  it("doesn't end the header at a comment that starts with %%", function() {
    assert.strictEqual(GabcHeader.getLength("name: Kyrie;\n%% a comment\n(c4) a(f)"), 0);
  });

  it("has no length without a header", function() {
    assert.strictEqual(GabcHeader.getLength("(c4) a(f) % a comment\n(g)"), 0);
  });

  it("doesn't end a header at a comment line of %s in gabc without one", function() {
    assert.strictEqual(GabcHeader.getLength("(c4) A(f) B(g)\n%%%%%%%%\n% verse 2\nC(h) D(i)"), 0);
    assert.strictEqual(GabcHeader.getLength("% a comment\nname: Kyrie;\n%%%%\n(c4) a(f)"), "% a comment\nname: Kyrie;\n%%%%\n".length);
  });

  it("takes the blank lines after the end of the header, as Gregorio does", function() {
    assert.strictEqual(GabcHeader.getLength("name: x;\n%%\n\n \n(c4) a(f)"), "name: x;\n%%\n\n \n".length);
  });

  it("writes multi-line values back with ;;", function() {
    const text = "name: one;\ncommentary: first line\nsecond line;;\n% a comment\nmode: 8;\n%%\n";
    const header = new GabcHeader(text);
    assert.strictEqual(header.toString(), text);
    assert.strictEqual(new GabcHeader(header.toString()).commentary, "first line\nsecond line");
  });
});

// Gabc.applyHeader(): the settings in a header, applied as Gregorio applies them
describe("Gabc.applyHeader", function() {
  const chant = "(c4) Ky(f)ri(g)e(h) (::)";

  function score(header: string, options?: ApplyHeaderOptions, setup?: (ctxt: ChantContext) => void) {
    const ctxt = new ChantContext();
    if (setup) setup(ctxt);
    const gabc = header + "%%\n" + chant;
    const score = new ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), true);
    Gabc.applyHeader(score, ctxt, new GabcHeader(gabc), options);
    return { ctxt, score };
  }

  // the text of each line of the score's annotation
  function annotationLines(score: ChantScore) {
    const annotation = score.annotation;
    if (!annotation) return [];
    return annotation instanceof Annotations ? annotation.annotations.map((a) => a.text) : [annotation.text];
  }

  it("changes nothing unless it is called", function() {
    const ctxt = new ChantContext();
    const gabc = "annotation: Ant.;\nmode: 8;\nstaff-lines: 5;\nlanguage: English;\n%%\n" + chant;
    const score = new ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), true);
    assert.strictEqual(score.annotation, null);
    assert.strictEqual(score.staffLineCount, 4);
    assert.strictEqual(ctxt.defaultLanguage, language.latin);
  });

  it("changes nothing for a header without its settings", function() {
    const { ctxt, score: s } = score("name: Kyrie;\noffice-part: Kyriale;\n");
    assert.strictEqual(s.annotation, null);
    assert.strictEqual(s.staffLineCount, 4);
    assert.strictEqual(ctxt.defaultLanguage, language.latin);
    assert.strictEqual(s.useDropCap, true);
  });

  it("makes the annotation from one annotation header", function() {
    const { score: s } = score("annotation: <b>Ant.</b>;\n");
    assert(s.annotation instanceof Annotation);
    assert.deepStrictEqual(annotationLines(s), ["Ant."]);
  });

  it("makes a line of the annotation from each of two annotation headers", function() {
    const { score: s } = score("annotation: Ad Magnif.;\nannotation: VIII G;\n");
    assert(s.annotation instanceof Annotations);
    assert.deepStrictEqual(annotationLines(s), ["Ad Magnif.", "VIII G"]);
  });

  it("uses only the first two annotation headers, as Gregorio does", function() {
    const { score: s } = score("annotation: one;\nannotation: two;\nannotation: three;\n");
    assert.deepStrictEqual(annotationLines(s), ["one", "two"]);
  });

  it("puts an annotation written over several lines on one line", function() {
    const { score: s } = score("annotation: Ad\nMagnif.;;\nannotation: VIII\n  G;;\n");
    assert.deepStrictEqual(annotationLines(s), ["Ad Magnif.", "VIII G"]);
  });

  it("skips empty annotation headers", function() {
    const { score: s } = score("annotation: ;\nannotation: Ant.;\n");
    assert.deepStrictEqual(annotationLines(s), ["Ant."]);
  });

  it("writes the mode as the annotation if there is no annotation header", function() {
    const { score: s } = score("mode: 8;\nmode-modifier: t.;\nmode-differentia: G*;\n");
    assert(s.annotation instanceof Annotation);
    assert.deepStrictEqual(annotationLines(s), ["VIII t. G*"]);
  });

  it("prefers the annotation header to the mode", function() {
    const { score: s } = score("mode: 8;\nannotation: Ant.;\n");
    assert.deepStrictEqual(annotationLines(s), ["Ant."]);
  });

  it("keeps an annotation that the score already has", function() {
    for (const header of ["annotation: Ant.;\n", "mode: 8;\n"]) {
      const ctxt = new ChantContext();
      const gabc = header + "%%\n" + chant;
      const s = new ChantScore(ctxt, Gabc.createMappingsFromSource(ctxt, gabc), true);
      const annotation = (s.annotation = new Annotation(ctxt, "Intr."));
      Gabc.applyHeader(s, ctxt, new GabcHeader(gabc));
      assert.strictEqual(s.annotation, annotation, header);
    }
  });

  it("writes the mode as Gregorio does", function() {
    const ctxt = new ChantContext();
    // the examples in Gregorio's GABC reference (doc/Gabc.tex)
    assert.strictEqual(Gabc.modeText(ctxt, "6"), "VI");
    assert.strictEqual(Gabc.modeText(ctxt, "4A"), "IVA");
    assert.strictEqual(Gabc.modeText(ctxt, "4a"), "IVa");
    assert.strictEqual(Gabc.modeText(ctxt, "2*", "t."), "II* t.");
    assert.strictEqual(Gabc.modeText(ctxt, "5", ", t."), "V, t.");
    assert.strictEqual(Gabc.modeText(ctxt, "8", "-t.", "G*"), "VIII-t. G*");
    assert.strictEqual(Gabc.modeText(ctxt, "7", "", "c2"), "VII c2");
    assert.strictEqual(Gabc.modeText(ctxt, "t. irregularis"), "t. irregularis");
    // numbers other than 1 to 8 are written as they are
    assert.strictEqual(Gabc.modeText(ctxt, "9"), "9");
    // nothing without a mode
    assert.strictEqual(Gabc.modeText(ctxt, "", "t.", "G"), "");
  });

  it("writes the mode number in ctxt.modeNumberSystem", function() {
    const ctxt = new ChantContext();
    assert.strictEqual(ctxt.modeNumberSystem, "roman-majuscule");
    ctxt.modeNumberSystem = "roman-minuscule";
    assert.strictEqual(Gabc.modeText(ctxt, "8", "", "G"), "viii G");
    ctxt.modeNumberSystem = "arabic";
    assert.strictEqual(Gabc.modeText(ctxt, "8", "", "G"), "8 G");

    const { score: s } = score("mode: 3;\n", {}, (ctxt) => (ctxt.modeNumberSystem = "roman-minuscule"));
    assert.deepStrictEqual(annotationLines(s), ["iii"]);
  });

  it("sets the number of staff lines from 2 to 5", function() {
    for (const count of [2, 3, 4, 5]) {
      assert.strictEqual(score(`staff-lines: ${count};\n`).score.staffLineCount, count);
    }
    for (const value of ["1", "6", "five", ""]) {
      assert.strictEqual(score(`staff-lines: ${value};\n`).score.staffLineCount, 4, value);
    }
  });

  it("sets the language by name or ISO 639 code", function() {
    const languages: [string, Language][] = [
      ["English", language.english],
      ["english", language.english],
      ["en", language.english],
      ["eng", language.english],
      ["Spanish", language.spanish],
      ["es", language.spanish],
      ["Latin", language.latin],
      ["la", language.latin]
    ];
    for (const [name, expected] of languages) {
      // (starting from another language)
      const other = expected === language.latin ? language.english : language.latin;
      const { ctxt } = score(`language: ${name};\n`, {}, (ctxt) => (ctxt.defaultLanguage = other));
      assert.strictEqual(ctxt.defaultLanguage, expected, name);
    }
  });

  it("leaves the language as it is for one that exsurge doesn't have", function() {
    const { ctxt } = score("language: Polish;\n", {}, (ctxt) => (ctxt.defaultLanguage = language.english));
    assert.strictEqual(ctxt.defaultLanguage, language.english);
  });

  it("applies only the settings that the options don't turn off", function() {
    const header = "annotation: Ant.;\nstaff-lines: 5;\nlanguage: English;\n";
    const { ctxt, score: s } = score(header, { annotation: false, staffLines: false, language: false });
    assert.strictEqual(s.annotation, null);
    assert.strictEqual(s.staffLineCount, 4);
    assert.strictEqual(ctxt.defaultLanguage, language.latin);
    // without the annotation, the mode isn't written either if there is an annotation header
    assert.strictEqual(score("annotation: Ant.;\nmode: 8;\n", { annotation: false }).score.annotation, null);
    assert.strictEqual(score("mode: 8;\n", { mode: false }).score.annotation, null);
  });

  it("applies initial-style and centering-scheme only with options.legacy", function() {
    const header = "initial-style: 0;\ncentering-scheme: english;\nlanguage: Latin;\n";
    const { ctxt, score: s } = score(header);
    assert.strictEqual(s.useDropCap, true);
    assert(s.dropCap);
    assert.strictEqual(ctxt.defaultLanguage, language.latin);

    const legacy = score(header, { legacy: true });
    assert.strictEqual(legacy.score.useDropCap, false);
    assert.strictEqual(legacy.score.dropCap, null);
    assert.strictEqual(legacy.ctxt.defaultLanguage, language.english);

    const ctxt1 = new ChantContext();
    const gabc = "initial-style: 1;\n%%\n" + chant;
    const withoutDropCap = new ChantScore(ctxt1, Gabc.createMappingsFromSource(ctxt1, gabc), false);
    Gabc.applyHeader(withoutDropCap, ctxt1, new GabcHeader(gabc), { legacy: true });
    assert.strictEqual(withoutDropCap.useDropCap, true);
    assert(withoutDropCap.dropCap);

    const latine = score("centering-scheme: latine;\n", { legacy: true }, (ctxt) => (ctxt.defaultLanguage = language.english));
    assert.strictEqual(latine.ctxt.defaultLanguage, language.latin);
  });
});
