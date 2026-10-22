// Parsing gabc headers as Gregorio does (see docs/gregorio-feature-gap.md, §1).

import assert from "node:assert";
import { describe, it } from "vitest";
import { GabcHeader } from "../src/index.js";

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
