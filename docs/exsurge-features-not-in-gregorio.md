# What exsurge has that Gregorio lacks

This document lists the features of exsurge that Gregorio lacks, and explains how to use each one. Gregorio is the reference GABC implementation: the `gregorio` program plus GregorioTeX. This is the other half of [`gregorio-feature-gap.md`](gregorio-feature-gap.md): that document's Part 1 lists what Gregorio has that exsurge lacks, and its §16 gives a short list going the other way. This document checks that list and adds to it.

Part 1 covers GABC syntax: what you write in a `.gabc` file. Part 2 covers the JavaScript API: what you set on a `ChantContext` or a `ChantScore`, and what exsurge can produce.

## Contents

- [Versions and method](#versions-and-method)
- [Summary](#summary)
- **Part 1. GABC syntax**
  1. [The treble clef](#1-the-treble-clef)
  2. [The Chi-Rho clef](#2-the-chi-rho-clef)
  3. [Notes offset within a space: `0` and `9`](#3-notes-offset-within-a-space-0-and-9)
  4. [Stems, flags and beams on inclinata: `|`](#4-stems-flags-and-beams-on-inclinata-)
  5. [Oriscus orientation with `<` and `>`](#5-oriscus-orientation-with--and-)
  6. [Several lyric lines under one note: `|` in the lyrics](#6-several-lyric-lines-under-one-note--in-the-lyrics)
  7. [Lyric markup](#7-lyric-markup)
  8. [No hyphen after an em dash or en dash](#8-no-hyphen-after-an-em-dash-or-en-dash)
  9. [Rubrics found automatically](#9-rubrics-found-automatically)
  10. [Text-only syllables on extra lines](#10-text-only-syllables-on-extra-lines)
  11. [Several above-lines texts on one syllable](#11-several-above-lines-texts-on-one-syllable)
- **Part 2. API and output**
  12. [Output: SVG, SVG DOM, a React-style tree, canvas, lines and pages](#12-output-svg-svg-dom-a-react-style-tree-canvas-lines-and-pages)
  13. [Editing support](#13-editing-support)
  14. [Titles, and left and right text](#14-titles-and-left-and-right-text)
  15. [Annotations of any number of lines](#15-annotations-of-any-number-of-lines)
  16. [Staffs of one line, or more than five](#16-staffs-of-one-line-or-more-than-five)
  17. [Neume size apart from the staff size](#17-neume-size-apart-from-the-staff-size)
  18. [Colours](#18-colours)
  19. [A minimum for the last line](#19-a-minimum-for-the-last-line)
  20. [Spanish, and syllabification](#20-spanish-and-syllabification)
  21. [The pitch of every note](#21-the-pitch-of-every-note)
  22. [The header as an object, with its comments kept](#22-the-header-as-an-object-with-its-comments-kept)
- [Checked, and in Gregorio after all](#checked-and-in-gregorio-after-all)
- [Syntax collisions](#syntax-collisions)
- [Limits and bugs found while checking](#limits-and-bugs-found-while-checking)
- [Appendix: how the examples were rendered](#appendix-how-the-examples-were-rendered)

## Versions and method

**exsurge** is at `master`, commit `c945494` (version 2.0.0). **Gregorio** is at commit `b63f074` of `gregorio-project/gregorio` (24 August 2026), the same commit that `gregorio-feature-gap.md` uses. That is the `develop` branch just after release 6.2.0. To browse a Gregorio reference on GitHub, prefix its path with `https://github.com/gregorio-project/gregorio/blob/b63f074253bd2f6b837f9f9778bba299ac139ec0/`.

**exsurge's behaviour** comes from rendering, not from reading the code alone. Every example here was rendered with `render()` from the golden-test harness (`test/golden/harness.ts`). Each SVG was rasterised with `rsvg-convert` and looked at. A dump of what exsurge parsed was also checked: each notation's class, each note's position, shape and pitch, the glyphs drawn, and the line breaks. The [appendix](#appendix-how-the-examples-were-rendered) says how. The images are SVGs in [`exsurge-features-not-in-gregorio/`](exsurge-features-not-in-gregorio/), rendered the same way.

**Gregorio's behaviour** comes from its sources and documentation, not from memory: the lexers and parser (`src/gabc/`), the GregorioTeX writer (`src/gregoriotex/`), GregorioTeX itself (`tex/`), the fonts (`fonts/`), and the references (`doc/`). Where something was looked for and not found, the search is described.

**Abbreviations used in the tables:**

| Short form | File |
|---|---|
| `notes.l` | `src/gabc/gabc-notes-determination.l` (Gregorio's lexer for the inside of `( )`) |
| `score.l`, `score.y` | `src/gabc/gabc-score-determination.l` and `.y` (Gregorio's lexer and parser for headers and lyrics) |
| `gtex-write.c` | `src/gregoriotex/gregoriotex-write.c` (Gregorio's GregorioTeX writer) |
| `Gabc.tex` | `doc/Gabc.tex` (Gregorio's GABC reference) |
| `CmdUser.tex` | `doc/Command_Index_User.tex` (GregorioTeX's user commands) |
| `Gabc.ts`, `Chant.ts`, `ChantLine.ts`, `Neumes.ts`, `Signs.ts`, `Drawing.ts`, `Glyphs.ts`, `Text.ts`, `Titles.ts`, `Core.ts` | `src/Exsurge.Gabc.ts`, `src/Exsurge.Chant.ts`, `src/Exsurge.Chant.ChantLine.ts`, and so on, in this repository |
| `cases.ts` | `test/golden/cases.ts` |

**Status values:**

- **Not in Gregorio**: Gregorio has no syntax, command or glyph for it.
- **Different syntax**: Gregorio has an equivalent, written another way in GABC or set with a GregorioTeX command.
- **TeX or font only**: Gregorio has no feature for it, but a user can get the result by writing their own TeX, or by substituting a glyph from another font.

**Collides** says whether the exsurge syntax means something else to Gregorio. GABC that uses the features in Part 1 is exsurge-only: Gregorio rejects most of it with errors, and reads some of it differently. The [syntax collisions](#syntax-collisions) section collects them.

## Summary

All four of the features this document was asked to start with are confirmed. exsurge has each of them, and Gregorio has none of them:

- the treble clef;
- the Chi-Rho clef;
- notes offset within a space;
- flags and beams like eighth notes.

The table lists those four and the 18 others found. Gregorio has an equivalent for a few of them, written another way. A few other things that look like exsurge additions turned out to be in Gregorio after all, and are listed under [Checked, and in Gregorio after all](#checked-and-in-gregorio-after-all). The main one is the brace over a bar, `,_`, which exsurge calls a "carryover".

| # | Feature | How to use it | Status | Collides | Golden case |
|---|---|---|---|---|---|
| 1 | Treble clef | `(treble2)`, `(treble-2)` | Not in Gregorio | Gregorio reports errors and reads stray notes | `other-clefs` |
| 2 | Chi-Rho clef | `(xp3)`, `(xp-3)` | Not in Gregorio | Gregorio reports errors and reads stray signs | `other-clefs` |
| 3 | Notes offset within a space | `g0`, `g9`, `f9+` | Not in Gregorio | Only after a capital: `G0` | `staff-position-offsets` |
| 4 | Stems, flags and beams on inclinata | `G\|`, `G\|\|`, `G\|F\|E\|` | Not in Gregorio | `\|` is Gregorio's NABC separator | `inclinata-with-stems` |
| 5 | Oriscus orientation | `o<`, `o>`, `O<`, `O>` | Different syntax: `o1`, `o0` | Gregorio reads `<` and `>` as liquescence | `single-notes` |
| 6 | Several lyric lines | `Ky\|Chri(f)` | Not in Gregorio | `\|` is a literal character to Gregorio | `multiple-lyric-lines` |
| 7 | Lyric markup | `*b*`, `_i_`, `^red^`, `%sc%`, `<u>` | Different syntax | `%` starts a Gregorio comment; `*` is a star | `lyric-markup` |
| | | `<font family fill class>` | TeX or font only | Printed literally by Gregorio | `lyric-markup` |
| | | `<br>` | Not in Gregorio | Printed literally by Gregorio | `line-breaks-in-text` |
| 8 | No hyphen after a dash | `ia—(g)A(f)men` | Not in Gregorio | No | `lyric-connectors` |
| 9 | Rubrics found automatically | `*`, `†`, `ij.`, `1.`, `℣.`, `V/.` | Different syntax: `<c>`, `<sp>V/</sp>` | `+` is a dagger to Gregorio | `directives`, `special-characters` |
| 10 | Text-only syllables on extra lines | `text()` | Not in Gregorio | No | `extra-text-only-lines` |
| 11 | Several above-lines texts on a syllable | `<alt>A</alt><alt>B</alt>` | Not in Gregorio | Gregorio keeps only the last `<alt>` | `above-lines-text-and-translations` |
| 12 | SVG, DOM, tree and canvas output | `createSvg()`, `createSvgTree()`, `draw()`, … | Not in Gregorio | — | `paginated`, `tree-zoom`, `canvas`, … |
| 13 | Editing support | `Gabc.updateMappingsFromSource()`, `updateSelection()` | Not in Gregorio | — | `edited`, `editable-with-selection`, … |
| 14 | Titles, left and right text | `score.titles.setTitle()`, … | TeX or font only | — | `titles`, `titles-aligned-and-wrapped` |
| 15 | Annotations of any number of lines | `new Annotations(ctxt, …)` | Different syntax: `\greannotation` | — | `tall-annotations-with-drop-cap` |
| 16 | Staffs of one line, or more than five | `score.staffLineCount` | Not in Gregorio | — | none (two, three and five lines: `two-line-staff`, …) |
| 17 | Neume size apart from the staff | `ctxt.setStaffHeight(h, multiplier)` | Not in Gregorio | — | `glyph-multiplier` |
| 18 | Colours | `ctxt.setRubricColor()`, `ctxt.staffLineColor`, … | Different syntax for staff lines and text; TeX only for neume lines and bars | — | `colors` |
| 19 | A minimum for the last line | `ctxt.minSyllablesLastLine`, `ctxt.minNotesLastLine` | Not in Gregorio | — | `last-line-minimums` |
| 20 | Spanish vowel rules | `ctxt.defaultLanguage = language.spanish` | Different syntax: a user `gregorio-vowels.dat` | — | `spanish` |
| | Syllabification | `language.latin.syllabify(text)` | Not in Gregorio | — | none (unit tests) |
| 21 | The pitch of every note | `note.pitch` | Not in Gregorio | — | none (unit tests) |
| 22 | The header as an object, with its comments | `new GabcHeader(text)`, `toString()` | Not in Gregorio | — | `header` |

---

# Part 1. GABC syntax

One point about GABC matters for the clefs and for §21. A note letter names a position on the staff, not a pitch: `f` is always the second line of a four-line staff, whatever the clef. The clef changes only what is drawn at the start of the line and, in exsurge, the pitch that the note is given.

## 1. The treble clef

| Status | Implemented in | Golden case | Collides |
|---|---|---|---|
| **Not in Gregorio** | the clef token, `Gabc.ts:98`; `Gabc.ts:1198-1209`; `TrebleClef`, `Chant.ts:396-442`; outlines `TrebleClef` and `TrebleClefSmall`, `Glyphs.ts:340`, `:360` | `other-clefs` (`cases.ts:167`) | Gregorio reports errors and reads stray notes |

**What it does.** `trebleN` draws a modern treble (G) clef whose curl wraps around staff line N, counting up from the bottom line, as for `c` and `f` clefs. A note on that line is So (G). `treble-N` draws the same clef smaller.

![A treble clef on line 2 of a five-line staff, with a scale from do to do, then a smaller treble clef](exsurge-features-not-in-gregorio/treble-clef.svg)

**How to use it.** The example above is on a five-line staff (`score.staffLineCount = 5`):

```
(treble2) do(b) re(c) mi(d) fa(e) sol(f) la(g) ti(h) do(i) (:) (treble-2) sol(f) (::)
```

- **Lines.** `treble1` to `treble5`, and `treble-1` to `treble-5` for the small clef. `treble2` is where a treble clef usually sits. Like `c5`, `treble5` is meant for a five-line staff; on a four-line staff it is accepted and drawn above the staff.
- **Pitches.** With `treble2`, `d` (the first line) is Mi, `f` (the second line) is So and `b` (below the staff) is Do. This shows only in `note.pitch` (§21), since notes are placed by their letters.
- **Accidentals.** There is no flat form like `cb3`: `trebleb2` isn't recognised. A note-level accidental works as usual: in `(treble2) a(gxg)`, the second note is La flat.
- **Clef changes and line breaks.** A treble clef can change the clef in the middle of a score. Like any clef, it is drawn again at the start of each later line, and the custos before the break works. (Checked at a width of 200.)

**What Gregorio does instead.** It has no treble clef:

- Its only clefs are C and F: `[cf][1-5]` and `[cf]b[1-5]`, plus a second clef after `@` (`notes.l:1194-1215`). `letter_to_clef()` knows only `c` and `f` (`notes.l:384-397`), and `Gabc.tex:849-852` describes a clef as "`c` or `f`".
- No Gregorio font has a G clef. The score fonts' clefs are `CClef`, `FClef` and their smaller `…Change` forms (`fonts/squarize.py:251-254`), and `greextra` adds only Medicaea and Hufnagel C and F clefs (`fonts/greextra.sfd:758-1130`).
- The nearest a user can get is `\grechangeglyph{CClef}{font}{glyph}`, which swaps the C clef's glyph for a glyph from another font (`CmdUser.tex:474-484`). Every C clef then looks like a treble clef, and Gregorio still treats it as a C clef.

Given `(treble2)`, Gregorio's lexer reports `t` and `2` as unrecognised characters (`notes.l:1507-1511`). It reads `r` as a cavum mark (`notes.l:1261`) and `e`, `b`, `l` and `e` as four notes (`notes.l:1405`).

## 2. The Chi-Rho clef

| Status | Implemented in | Golden case | Collides |
|---|---|---|---|
| **Not in Gregorio** | `Gabc.ts:98`, `Gabc.ts:1210-1221`; `ChiRhoClef`, `Chant.ts:444-492`; outlines `ChiRhoClef` and `ChiRhoClefSans`, `Glyphs.ts:380`, `:399` | `other-clefs` (`cases.ts:167`) | Gregorio reports errors and reads stray signs |

**What it does.** `xpN` draws a Chi-Rho (☧) on staff line N in place of a clef. `xp-N` draws a plainer, sans-serif ☧.

![A serif Chi-Rho clef on line 3, then a sans-serif one](exsurge-features-not-in-gregorio/chi-rho-clef.svg)

**How to use it.**

```
(xp3) Chri(h)stus(hg) vin(h)cit(hi) (;) (xp-3) Chri(h)stus(hg) re(h)gnat(hi) (::)
```

- **Lines.** `xp1` to `xp5`, and `xp-1` to `xp-5` for the sans-serif form.
- **Pitches.** A Chi-Rho clef gives notes the pitches that a C clef on the same line would. Under both `(xp3)` and `(c3)`, `h` is Do and `g` is Ti. The code marks this with a `TODO` (`Chant.ts:457-481`).
- **Line breaks.** It is drawn again at the start of each line, like any clef.

**What Gregorio does instead.** It has no such clef or glyph:

- The lexer has only C and F clefs (`notes.l:384-397`, `:1194-1215`).
- No font has a ☧. The 83 glyphs of `fonts/greextra.sfd` are custodes, flats and clefs for the alternative glyph styles, stars, a dagger, a cross, the barred A, R and V, and a few lines and drawings. A search of the whole repository for `chi.?rho`, `chirho`, `XP`, `2627` and `☧` found nothing relevant.
- As for the treble clef, `\grechangeglyph` could draw a ☧ taken from a text font in place of the C clef.

Given `(xp3)`, Gregorio reads `x` as a flat sign (`notes.l:1297`) and `p` as a note (`notes.l:1405`), and reports `3` as an unrecognised character.

## 3. Notes offset within a space: `0` and `9`

| Status | Implemented in | Golden case | Collides |
|---|---|---|---|
| **Not in Gregorio** | `Gabc.getStaffPositionOffset()` and `setStaffPositionAndOffset()`, `Gabc.ts:2290-2308`, used for notes at `Gabc.ts:1842-1843` and for custodes at `:1280-1286`; `Note.staffPositionOffset`, `Chant.ts:114-115`; the automatic custos, `Signs.ts:55-65` | `staff-position-offsets` (`cases.ts:92`) | Only after a capital: `G0` |

**What it does.** A `0` or `9` straight after the pitch letter moves the note a little down or up. Each space between two lines then has a lower and an upper position as well as the middle one.

![Three positions in one space (g0, g, g9); f9 is the same as g0, and h0 as g9; then a pes with offsets](exsurge-features-not-in-gregorio/staff-position-offsets.svg)

**How it works.** Staff positions count in steps, and a step is half the distance between two lines. How far the note moves depends on where it is:

- A note in a **space** moves ⅓ step: `g0` goes ⅓ step down from the middle of the space, and `g9` ⅓ step up.
- A note on a **line** moves ⅔ step, into the space beside it: `f9` lands exactly where `g0` does, and `h0` where `g9` does.

So, with a `c4` clef, the space between the second line (`f`) and the third (`h`) has three positions:

| GABC | Staff position | Where |
|---|---|---|
| `h` | 5 | on the third line |
| `g9`, `h0` | 4⅓ | the upper position in the space |
| `g` | 4 | the middle of the space |
| `f9`, `g0` | 3⅔ | the lower position in the space |
| `f` | 3 | on the second line |

The upper and lower positions are each a sixth of the line spacing from the middle.

**How to use it.** The example above:

```
(c4) g0(g0) g(g) g9(g9) (,) f9(f9) g0(g0) (,) h0(h0) g9(g9) (,) e9f0g(e9f0g) (::)
```

- **Where the digit goes.** It must come straight after the pitch letter. In `fv0` the `0` is ignored. `f.0`, `f_0` and `f'0` keep their Gregorio meaning: a mora, episema or ictus below the note. An initio debilis is fine: `-f0g`.
- **In neumes.** It works on any note of any neume: `(g0h9)` is a pes, and `(h9g0)` a clivis.
- **Custodes.** `f9+` puts a custos at the offset position. An automatic custos at the end of a line copies the offset of the note it announces (`Signs.ts:55-65`).
- **Outside the staff.** It works on ledger-line notes too: `a0`, `l9`, `m9`.
- **Pitch.** The note keeps the pitch of its letter: `f9` is still Fa with a `c4` clef. Only the drawing moves. (But see [the bug](#limits-and-bugs-found-while-checking): under some clefs a few offset notes, such as `g9`, get a wrong pitch or none.)
- **Capitals.** `G9` moves an inclinatum up, but `G0` collides with Gregorio (below).

**What Gregorio does instead.** Nothing like it:

- Pitches are whole staff positions, the letters `a` to `n` and `p` (`Gabc.tex:410-413`).
- After a lowercase pitch, the lexer accepts no digit. `f0` and `f9` give a punctum on `f` plus an "unrecognized character" error for the digit (`notes.l:1405`, `:1507-1511`).
- A custos must be a pitch letter followed directly by `+` (`notes.l:1158`), so in `f9+` both the `9` and the `+` are errors.
- No GregorioTeX command moves a single note. The `\grechangedim` dimensions named "shift" or "raise" move signs, braces and text, not notes (`tex/gregoriotex-gsp-default.tex:167-205`, `:313-428`). TeX given with `[nv:]` is written after the glyph, so it can't move it (`gtex-write.c:3107-3111`).

**Collision.** After a capital letter, Gregorio reads `0`, `1` and `2` as the way the inclinatum leans: `G0` leans down, `G1` up, and `G2` is upright (`notes.l:1414-1417`). exsurge reads `G0` as a nudge down. `gregorio-feature-gap.md` §15 proposes nudging only lowercase pitches and custodes.

## 4. Stems, flags and beams on inclinata: `|`

| Status | Implemented in | Golden case | Collides |
|---|---|---|---|
| **Not in Gregorio** | the `\|` modifier, `Gabc.ts:1947-1949`; `Note.inclinataFlags`, `Chant.ts:130-131`; `NeumeBuilder.withInclinata()`, `Neumes.ts:269-345`; `NeumeBeamVisualizer`, `Drawing.ts:1727-1801` | `inclinata-with-stems` (`cases.ts:83`) | `\|` is Gregorio's NABC separator |

**What it does.** A `|` after a punctum inclinatum gives it a stem going up, like a modern eighth note:

- One stemmed note gets a flag.
- A run of stemmed notes is joined by a beam, which slopes with the notes.
- Each `|` adds one flag or beam: `||` looks like a sixteenth note, and `|||` like a thirty-second note.

![Inclinata with a flag, two flags, a beamed run, a double beam, a climacus, a rising run, and a virga with beamed inclinata](exsurge-features-not-in-gregorio/inclinata-stems.svg)

**How to use it.** The example above, from left to right:

```
(c4) a(G|) b(G||) c(G|F|E|) d(GF||E) e(hG|F|E|D) f(F|G|H|) g(gvF|E|) (::)
```

The rules come from `withInclinata()`:

- **Which notes get stems.** In a run of inclinata, every note from the first one up to the last one with a `|` gets a stem. So `(G|F|E|)`, `(G|FE|)` and `(GF|E|)` all stem all three notes. `(G|FE)` stems only `G`, and `(GF||E)` stems `G` and `F`.
- **How many beams.** As many as there are `|` on the first note that has any. In `(GF||E)` that is two.
- **Flags.** When only one note is stemmed, its beam becomes a short stroke from the top of the stem, slanting up to the left (`Drawing.ts:1741-1744`).
- **Where.** Stems go up two line spacings from each note. The beam runs from the top of the first stem to the top of the last, and the stems in between reach up to it.
- **Which neumes.** Any run of inclinata that exsurge lays out with `withInclinata()`: puncta inclinata on their own (`Neumes.ts:1098`), and the inclinata of a climacus (`:777`) or a pes subpunctis (`:982`). In `(hG|F|E|D)` the `h` is a separate punctum, and the inclinata after it get the stems. In `(gvF|E|)` the virga keeps its own stem.
- **With other marks.** Morae, episemata, ictus and liquescence work as usual: `(G|.F|.)`, `(G|_F|_)`, `(G|'F|)`, `(G~|)`.

**Limits.**

- Only inclinata take stems. On a lowercase note `|` is ignored without a warning, so `(g|)` is a plain punctum.
- Stems always go up, and the beam's slope isn't limited: `(K|G|)` draws a steep beam.
- The inclinata are spaced as they would be without stems, so beamed notes are as close together as plain ones.

**What Gregorio does instead.** It has no stems, flags or beams on any note:

- No font has a stemmed or flagged note, or a beam. The inclinatum glyphs come only as ascendens, descendens and stans, with their liquescent forms (`fonts/squarize.py:311-313`, `:327-328`). The only stems are those of the virga and of neumes.
- The glyph styles of `\gresetglyphstyle` are `default`, `medicaea`, `hufnagel` and `mensural`, and they change only custodes, clefs and flats (`tex/gregoriotex-chars.tex:125-201`).
- Inside a note group, `|` is the NABC separator. Without a `nabc-lines` header, using it is a fatal error: "You used character "|" in gabc without setting "nabc-lines" parameter" (`score.l:389-396`, `score.y:870-887`).

## 5. Oriscus orientation with `<` and `>`

| Status | Implemented in | Golden case | Collides |
|---|---|---|---|
| **Different syntax**: Gregorio's `o1` and `o0` | `Gabc.ts:2043-2065` | `single-notes` (`cases.ts:58`: `fo<`, `fo>`, `fO<`, `fO>`) | Gregorio reads `<` and `>` as liquescence |

**What it does.** `o<` draws an oriscus pointing up (the `OriscusAsc` glyph), and `o>` one pointing down (`OriscusDes`). `O<` and `O>` do the same for the oriscus scapus, which exsurge parses but draws without its stem (`gregorio-feature-gap.md` §2).

**How to use it.**

```
(c4) a(go) b(go<) c(go>) d(gO<) e(gO>) (::)
```

This matters mostly for an oriscus on its own. In a pes quassus (`go<h`) or a clivis starting with an oriscus (`go>f`), exsurge sets the orientation from the next note anyway (`Gabc.ts:1505-1512`). Without `<` or `>`, an oriscus on its own looks at the first note of the next neume (`Neumes.ts:886-910`).

**What Gregorio does instead.** It writes the same thing as `o1` (ascending) and `o0` (descending), and `O1` and `O0` for the oriscus scapus (`notes.l:1455-1474`, `Gabc.tex:549-550`). exsurge doesn't read those (`gregorio-feature-gap.md` §2).

**Collision.** To Gregorio, `<` and `>` after a note are liquescence marks (`notes.l:1439-1446`). By default it removes them from an oriscus. With the `oriscus-orientation: legacy` header, both make the oriscus point down (`src/struct.c:413-439`). So `o<` points up in exsurge but down in Gregorio's legacy mode.

## 6. Several lyric lines under one note: `|` in the lyrics

| Status | Implemented in | Golden case | Collides |
|---|---|---|---|
| **Not in Gregorio** | `Gabc.createSyllableLyrics()`, `Gabc.ts:887-901`; each text becomes a lyric with its own `lyricIndex` (`Gabc.ts:1000`) | `multiple-lyric-lines` (`cases.ts:230`); unit test `test/bugfixes.test.ts:82` | `\|` is a literal character in Gregorio's lyrics |

**What it does.** A `|` in a syllable's text separates the texts of several lyric lines, one under another. This is how a hymn shows several stanzas under one melody.

![Three stanzas of Veni Creator under one melody](exsurge-features-not-in-gregorio/multiple-lyric-lines.svg)

**How to use it.** The example above:

```
(c4) 1.~Ve|2.~Qui |3.~Tu (g)ni,|dí|sep(gf) Cre|ce|ti(g)á|ris, |fór(h)tor|Pa|mis (h)
Spí|rá|mú(ih)ri|cli|ne(g)tus,|tus, |re, (gh) (::)
```

- **Line order.** The first text is the top line, and each `|` starts the next one down. A syllable can have fewer texts than its neighbours: in `Ky|Chri(f)ri|ste(g)e|e(h) e|e |e(g)lé(f)`, only the fourth syllable has three lines, and the last has one.
- **Word ends.** In the first line, words follow the GABC words, as usual: a word ends at a space after `)`. Each later line marks its own word ends. A text ending in a space ends a word; any other text is the middle of a word, and gets a hyphen. So in the second and later lines, put a space before the `|` or the `(` at every word end, even after a one-syllable word (`Qui |`). Otherwise `Qui` gets a hyphen.
- **Reading the lines.** Each text is a separate `Lyric` in `notation.lyrics`, with its `lyricIndex`.

**Limits.**

- A `|` can't be printed in a lyric.
- Text-only syllables go on extra lines (§10) only when they have a single lyric line (`ChantLine.ts:1022`).

**What Gregorio does instead.** It has no such feature:

- A syllable has exactly one text, one optional translation and one optional above-lines text (`src/struct.h:656-688`).
- The only second line under the lyrics is the translation, written in `[…]` (`Gabc.tex:337-343`).
- A search of the documentation, TeX and C sources for "stanza", "verses" and "lyric lines" found only the `meter` header, which is metadata.

In lyrics, `|` is an ordinary character (`score.l:240`) and is printed as it stands.

## 7. Lyric markup

| Markup | What it does | Status | Gregorio's equivalent |
|---|---|---|---|
| `*text*` | bold | **Different syntax** | `<b>` |
| `_text_` | italic | **Different syntax** | `<i>` |
| `^text^` | the rubric colour | **Different syntax** | `<c>` |
| `%text%` | small capitals | **Different syntax** | `<sc>` |
| `<u>` | underline | **Different syntax** | `<ul>` (which exsurge also has) |
| `<font family="…" fill="…" class="…">` | a font family, a fill colour and a CSS class | **TeX or font only** | TeX in `<v>` |
| `<br>`, `<br/>` | a line break inside the text | **Not in Gregorio** | none |

| Implemented in | Golden cases | Collides |
|---|---|---|
| the tag styles and the symbols, `Drawing.ts:990-1006`; the markup pattern, `Drawing.ts:2749`; `<br>`, `:2778-2784`; the symbols, `:2853-2873` | `lyric-markup` (`cases.ts:205`) and its `opentype-markup`, `canvas-markup` and `svg-measured-markup` variants; `line-breaks-in-text` (`cases.ts:266`); `text-only-at-end` (`cases.ts:337`) | `%` starts a Gregorio comment; `*` is a star and `_` an underscore |

**What it does.** Besides the tags it shares with Gregorio (`<b>`, `<i>`, `<c>`, `<sc>`, `<ul>`, `<e>`, `<sp>`, `<v>`), exsurge has the shorter forms above. All text goes through the same markup code, so the markup works in lyrics, translations, above-lines text, annotations and titles.

![Bold, italic, red, small caps, underline, a red asterisk, Alleluia—Amen with no hyphen, and a red iij.](exsurge-features-not-in-gregorio/lyric-markup.svg)

**How to use it.** The example above:

```
(c4) *Bold*(f) _ital_(g) ^red^(h) %Small%(g) <u>under</u>(f) *(;) Al(f)le(g)lú(h)ia—(g)A(f)men.(f) iij.(::)
```

- **Asterisks.** `*…*` is bold only if a closing `*` follows with some text that isn't a space in between (`Drawing.ts:2853-2863`). Otherwise the asterisk is printed, with `ctxt.asteriskProperties`, so `a*b` and `* x` keep their asterisk. A lyric that is only `*` is a directive (§9).
- **The other symbols.** `_`, `^` and `%` each switch their style on and off.
- **`<font>`.** It takes `family`, `fill` and `class`, in any order and any combination: `<font fill="#00a" family="monospace">f</font>`.
- **`<br>`.** It starts a new line within the text. The lines stack, each 1.1 em below the one before. It works in lyrics, in text-only syllables and in titles (the golden cases `line-breaks-in-text`, `text-only-at-end` and `titles-aligned-and-wrapped`).
- **Changing what the symbols mean.** `ctxt.markupSymbolDictionary` maps each symbol to a tag: by default `*` to `b`, `_` to `i`, `^` to `c` and `%` to `sc`. `ctxt.fontStyleDictionary` maps each tag to its CSS properties. Call `ctxt.clearTextCache()` after changing them. The set of symbols and tag names is fixed by the markup pattern, so these settings can change what a tag does but can't add one.

**Limits.**

- A `<br>` in a syllable with notes doesn't make its system any taller. With `(c4) Ky<br>ri(f)e(g) (z) e(h)lé<br>i(g)son(f) (::)`, the second line of `lé<br>i`, on the last system, fell below the bottom of the SVG.
- A single `_`, `^` or `%` isn't printed: `x_y` prints "xy", `a^b` "ab" and `50%` "50". A single `*` is printed.

**What Gregorio does instead.** It has a fixed set of tags: `<b>`, `<i>`, `<sc>`, `<tt>`, `<ul>` and `<c>`, plus the control tags `<e>`, `<eu>`, `<nlba>`, `<clear>`, `<pr>`, `<alt>`, `<sp>` and `<v>` (`score.l:251-384`, `Gabc.tex:254-317`). In particular:

- **`<u>`, `<br>` and `<font>`** aren't tags. A `<` that doesn't start a known tag is an ordinary character (`score.l:333-335`), so these are typeset as literal text.
- **`*` and `+`** become a star and a dagger, `\GreStar` and `\GreDagger` (`gtex-write.c:1439-1441`, `:1458-1460`).
- **`_`** is printed as an underscore (`gtex-write.c:1461-1463`). **`^`** is passed to TeX unescaped (`:1470-1471`).
- **`%`** starts a comment that runs to the end of the line (`score.l:313-321`, `Gabc.tex:63-64`).
- **Line breaks.** There is no way to break a line inside a syllable. A line end in the lyrics is read as a space between words (`score.l:234-236`), and a syllable's text is set in a single `\hbox` (`tex/gregoriotex-syllable.tex:1041`).
- **Fonts.** A different font or colour for some text means writing TeX in `<v>…</v>` (`score.l:322-332`).

## 8. No hyphen after an em dash or en dash

| Status | Implemented in | Golden case | Collides |
|---|---|---|---|
| **Not in Gregorio** | `Gabc.makeLyric()`, `Gabc.ts:1035-1039` | `lyric-connectors` (`cases.ts:219`: `ex(f)tre(g)ma—(h)men(g)te(f) can–(g)ta(h)`) | No |

**What it does.** When a syllable's text ends with an em dash (—) or an en dash (–), the dash stays in the text, and exsurge draws no hyphen between it and the next syllable (`Lyric.setPreventConnector()`). The syllables still belong to one word, so they keep the spacing of syllables within a word. It came in with exsurge 1.26.0 (the em dash) and 1.26.1 (the en dash).

**How to use it.** `Al(f)le(g)lú(h)ia—(g)A(f)men.(f)` prints "Al-le-lú-ia—Amen." (see the image in §7). The text must be longer than the dash alone.

**What Gregorio does instead.** It has no way to stop a hyphen between two syllables of one word:

- It can force a hyphen, with a trailing `-` or with `\gresethyphen{force}` (`score.y:1126-1139`, `CmdUser.tex:1333-1339`).
- It can raise the threshold `maximumspacewithoutdash` for the whole score (`tex/gregoriotex-gsp-default.tex:308-309`). That stops hyphens in the middle of lines only: a hyphen is always added at the end of a line after a syllable inside a word (`tex/gregoriotex.lua:1086-1113`).
- Every syllable inside a word is marked as one that may need a hyphen (`tex/gregoriotex-syllable.tex:1059-1072`). `<sp>-</sp>` adds a zero-width hyphen rather than stopping one (`tex/gregoriotex-symbols.tex:228`).

The only way is to end the word, with a space after the `)`, which also changes the spacing.

## 9. Rubrics found automatically

| Status | Implemented in | Golden cases | Collides |
|---|---|---|---|
| **Different syntax**: by hand, with `<c>` and `<sp>V/</sp>` | directives, `Gabc.ts:845-847` and `:1046`; their colour, `Drawing.ts:3968-3975`; ℣ and ℟, `Drawing.ts:2749` and `:2842-2850`; the settings, `Drawing.ts:972-988` | `directives` (`cases.ts:235`), `no-auto-color` (`:543`), `dividers-on-syllables` (`:184`), `special-characters` (`:212`), `special-character-settings` (`:492`), `drop-cap-special-char` (`:350`) | `+` is a dagger to Gregorio |

**What it does.** exsurge recognises two kinds of rubric in the lyrics, with no markup, and draws them in the rubric colour (red by default).

**Directives.** A lyric becomes a directive in either of two cases:

- Its whole text is asterisks or daggers (`*`, `**`, `†`), `ij` or `iij` (any number of `i`s followed by `j`), or a number, each optionally followed by `.` (`Gabc.ts:1046`).
- It sits under a notation that isn't a neume, such as a bar (`Gabc.ts:845-847`).

A directive's lyric type is `LyricType.Directive`, and it is drawn in `ctxt.rubricColor` while `ctxt.autoColor` is `true` (the default; `Drawing.ts:3968-3975`). With `ctxt.autoColor = false`, it keeps that lyric type but is drawn in the text colour.

**Versicles and responses.** These are drawn with `ctxt.specialCharProperties` (the 'Exsurge Characters' font, the rubric colour, and the CSS class `rubric`):

- `℣` and `℟`, with or without a following `.`;
- `V/.`, `R/.` and `A/.`, in either case;
- `<sp>V/</sp>`, `<sp>R/</sp>` and `<sp>A/</sp>`.

The text drawn is `ctxt.textBeforeSpecialChar + ctxt.specialCharMap[char] + ctxt.textAfterSpecialChar`. By default that is "v." or "r.", and the 'Exsurge Characters' font draws the letters `v`, `r` and `a` as the barred V, R and A. exsurge ships that font as `assets/fonts/ExsurgeChar.otf`, but doesn't add it to the page itself: the code that would is commented out (`Drawing.ts:121-122`).

**How to use it.**

```
(c4) Ky(f)ri(g)e(h) *(;) ij.(:) e(g)lé(f)i(e)son.(f) iij.(::) ℣.(f) Ad(g)ju(h)tó(g)ri(f)um(f) (::)
```

Settings, all on `ChantContext`:

- `ctxt.setRubricColor("#a00")` changes the colour of directives, of `<c>` and `^…^`, and of ℣ and ℟.
- `ctxt.autoColor = false` stops directives being coloured.
- `ctxt.specialCharMap`, `ctxt.textBeforeSpecialChar` and `ctxt.textAfterSpecialChar` change how ℣, ℟, `*` and `+` are written. For example, `specialCharMap["℣"] = "V"` with the text before and after set to `(` and `)` gives "(V)".
- `ctxt.asteriskProperties` and `ctxt.plusProperties` style the asterisk and the plus sign.

After changing these, call `ctxt.clearTextCache()`.

**What Gregorio does instead.** It colours nothing automatically:

- `*` and `+` in the lyrics become a star and a dagger (`gtex-write.c:1439-1441`, `:1458-1460`), drawn in the text colour, black by default (`tex/gregoriotex-symbols.tex:162`, `:170-171`).
- Nothing detects `ij.`, `iij.` or numbers: a search of the sources and documentation for `ij\.` and `iij` found nothing. Text is coloured only by `<c>…</c>`, in `gregoriocolor` (`Gabc.tex:260-261`; RGB 229, 53, 44, `tex/gregoriotex.sty:101`).
- The barred ℣, ℟ and A come only from `<sp>V/</sp>`, `<sp>R/</sp>` and `<sp>A/</sp>` (`tex/gregoriotex-symbols.tex:218-221`, `Gabc.tex:362-366`). A bare `V/.` is printed as it stands (`score.l:240`), and Unicode ℣ and ℟ are passed through as ordinary characters of the text font.

**Collision.** A lyric `+` is a dagger to Gregorio and a plus sign to exsurge, unless `ctxt.specialCharMap["+"]` is changed. `†`, on the other hand, is a red directive to exsurge and an ordinary character to Gregorio.

## 10. Text-only syllables on extra lines

| Status | Implemented in | Golden cases | Collides |
|---|---|---|---|
| **Not in Gregorio** | `ChantLine.buildFromChantNotationIndex()`, `ChantLine.ts:1019-1100`; the extra height, `ChantLine.ts:299-335`; `ctxt.useExtraTextOnly` and `ctxt.startExtraTextOnlyFromFirst`, `Drawing.ts:838`, `:925-929`, `:1122` | `text-only-syllables` (`cases.ts:239`), `extra-text-only-lines` (`:245`), `extra-text-only-narrow` (`:326`), `no-extra-text-only` (`:531`), `extra-text-only-from-first` (`:537`), `text-only-at-end` (`:337`) | No |

**What it does.** Sometimes a run of syllables with text and no notes, written `text()`, doesn't fit on the line. A psalm verse in a responsory is a typical case. exsurge then doesn't start a new system with an empty staff for each such syllable. It sets them as running text under the staff instead, continuing on extra lines of text below the lyrics. The notes then carry on with the next system.

![A Kyrie followed by the text of the Gloria Patri set as running text on two lines under the staff](exsurge-features-not-in-gregorio/text-only-lines.svg)

**How to use it.** It is on by default. The example above, at a width of 360:

```
(c4) Ky(f)ri(g)e(h) (,) Glória Patri, et Fílio,() et Spirítui Sancto.() Sicut erat in princípio,()
et nunc, et semper,() (;) e(g)lé(f)i(e)son.(f) (::)
```

- `ctxt.useExtraTextOnly = false` turns it off. Each text-only syllable that doesn't fit then starts a new system: the same example takes six systems, and three of them have no notes.
- `ctxt.startExtraTextOnlyFromFirst = true` changes where the extra lines start. In the words of its documentation comment, it "starts the lines of text-only syllables after the last lyric on the line, rather than at the start of the line" (`Drawing.ts:925-929`).

**Limits.**

- Only text-only syllables with a single lyric line qualify (`ChantLine.ts:1022`).
- A run that starts with a text of one character qualifies only if another text-only syllable follows (`ChantLine.ts:1028-1037`).
- A single text-only syllable that is longer than a line wraps onto two lines, and the syllables after it are then drawn on top of its second line. The golden case `extra-text-only-lines` shows this; shorter syllables, as in the example above, don't overlap.

**What Gregorio does instead.** It sets a syllable with no notes inline, under the staff, like any other syllable. The staff continues above it, and lines break normally (`gtex-write.c:4189-4190`, `tex/gregoriotex-syllable.tex:271-276`). A search of the sources and documentation for "no notes", "text only" and "empty syllable" found no special layout.

## 11. Several above-lines texts on one syllable

| Status | Implemented in | Golden case | Collides |
|---|---|---|---|
| **Not in Gregorio** | the pattern, `Gabc.ts:96`; the loop that collects them, `Gabc.ts:790-819` | `above-lines-text-and-translations` (`cases.ts:252`: `<alt>One</alt><alt>Two</alt>c(h)` and `b(g[alt:al1]f[alt:al2])`) | Gregorio keeps only the last `<alt>`; `[alt:…]` in the lyrics is a translation to Gregorio |

**What it does.** Each `<alt>…</alt>` on a syllable adds another line of above-lines text, stacked upwards, with the first one nearest the staff. Above-lines text can also be written `[alt:…]` in the lyric text. Several `[alt:…]` on the notes of one neume stack in the same way, at the neume's left edge rather than over each note.

**How to use it.**

```
(c4) <alt>One</alt><alt>Two</alt>a(h) b(g[alt:x]f[alt:y]) (::)
```

**What Gregorio does instead.**

- A syllable has one above-lines text. A second `<alt>` replaces the first without a warning (`score.y:1115-1119`, `:240`, `:563-566`).
- Several `[alt:…]` inside the notes are kept, each printed over the next glyph (`notes.l:985-987`, `gtex-write.c:4284-4289`). Two before the same glyph keep only the last (`tex/gregoriotex-main.tex:658-666`).
- In the lyrics, `[…]` is always a translation (`score.l:356-364`), so exsurge's `[alt:text]` there would print "alt:text" as a translation.

---

# Part 2. API and output

These features are set from JavaScript. Most of them sit on the `ChantContext`, which holds the settings for drawing, or on the `ChantScore`. The basic sequence:

```js
const ctxt = new exsurge.ChantContext();
const mappings = exsurge.Gabc.createMappingsFromSource(ctxt, gabc);
const score = new exsurge.ChantScore(ctxt, mappings, true); // true: draw a drop cap
score.performLayout(ctxt);
score.layoutChantLines(ctxt, 600);                           // the width; 0 doesn't break lines
const svg = score.createSvg(ctxt);
```

## 12. Output: SVG, SVG DOM, a React-style tree, canvas, lines and pages

| Status | Implemented in | Golden cases |
|---|---|---|
| **Not in Gregorio** | `ChantScore`, `Chant.ts`: `paginate()` `:1073-1094`, `draw()` `:1096`, `getSvgProps()` `:1112-1133`, `createSvgNode()` `:1135`, `createSvgTree()` `:1155`, `createSvg()` `:1179`, `createSvgNodeForEachLine()` `:1201`, `createSvgForEachLine()` `:1231`, `performLayoutAsync()` `:870`, `waitForLyricFont()` `:898`; `TextMeasuringStrategy`, `Drawing.ts:726-731` | every case renders the SVG string, the SVG tree, SVG DOM nodes and a canvas; also `kyrie` (per line), `paginated` (`cases.ts:613`), `tree-zoom` (`:614`), `tree-fill-container` (`:615`), `async-layout` (`:612`), `relayout` (`:325`), `unlimited-width` (`:324`), `canvas` (`:315`), `canvas-basic` (`:316`), `opentype` (`:314`), `svg-measured` (`:627`), `scale-uses` (`:428`), `font-family-attributes` (`:548`) |

**What it does.** exsurge is a library that runs in the browser or in Node, and lays out and draws a score in several forms:

| Call | Gives |
|---|---|
| `score.createSvg(ctxt)` | an SVG document as a string |
| `score.createSvgNode(ctxt)` | SVG DOM nodes (this needs a `document`) |
| `score.createSvgTree(ctxt, zoom)` | a tree of `{ name, props, children }`, with camel-cased props and `className`, e.g. for React |
| `score.draw(ctxt, scale)` | drawing on the canvas `ctxt.canvas` |
| `score.createSvgForEachLine(ctxt)` | one SVG per system, all in one string |
| `score.createSvgNodeForEachLine(ctxt)` | an array of SVG nodes, one per system |
| `score.paginate(height)`, then `score.pages` | the score split into pages of at most `height`, each a `ChantScore` to render with the calls above (the titles go on the first page) |
| `score.performLayoutAsync(ctxt, done)` | layout that yields to the browser between notations, and waits for the lyric font to load, for at most `ctxt.fontLoadTimeout` milliseconds (3000 by default) |
| `score.layoutChantLines(ctxt, width)` | the score laid out again at another width, without parsing the GABC again |

For `createSvgTree()`, `zoom` can be a number, which scales the width and lets the height follow, or `true`, which leaves out the width and height so that the SVG fills its container.

Text is measured in one of three ways, chosen with `new ChantContext(strategy)`:

- `TextMeasuringStrategy.Canvas`, the default in a browser;
- `TextMeasuringStrategy.Svg`, which measures SVG text elements in the page;
- `TextMeasuringStrategy.OpenTypeJS`, the default without a DOM. It uses fonts that `ctxt.setFont()` is given, from opentype.js or fontkit, so it works in Node.

The SVG is made to be scripted and styled:

- Each glyph is defined once and placed with `<use>`. `ctxt.setScaleDefs(false)` scales the `<use>` elements rather than the definitions.
- Each note's element has an id (`note-1`, …, with the prefix set by `ctxt.noteIdPrefix`), and elements carry `source-index` and `element-index` attributes.
- Elements have CSS classes, such as `note`, `neumeLine`, `neumeBeam`, `staffLine`, `lyric` and `rubric`.
- The text styles are written as a `<style>` element. `ctxt.setFontFamilyAttributes = true` also gives each text element in `createSvg()` a `font-size` attribute.

**How to use it.**

```js
score.performLayout(ctxt);
score.layoutChantLines(ctxt, 600);
container.appendChild(score.createSvgNode(ctxt));         // DOM
const tree = score.createSvgTree(ctxt, true);             // for React, filling its container
score.paginate(800);
const pages = score.pages.map((page) => page.createSvg(ctxt));
```

**What Gregorio does instead.** It makes PDF, through LuaLaTeX:

- The `gregorio` program writes GregorioTeX (`gtex`), GABC again (`gabc`), or a debugging dump (`dump`), and reads only GABC (`src/gregorio-utils.c:52-64`, `:207-212`).
- GregorioTeX typesets the score inside a LaTeX document.
- The build makes one executable and no library (`src/Makefile.am:22`).
- A search of the repository for SVG, canvas, JavaScript and WebAssembly found nothing. `README.md:13` links to an online demo that isn't part of the repository.

## 13. Editing support

| Status | Implemented in | Golden cases |
|---|---|---|
| **Not in Gregorio**, whose point-and-click is the nearest thing | `Gabc.updateMappingsFromSource()`, `Gabc.ts:432-686`, with the diff at `:301-422`; `ChantScore.updateNotations()`, `Chant.ts:734`; `ChantScore.updateSelection()`, `Chant.ts:682-733`; `InsertionCursor`, `Signs.ts:184`; `ctxt.editable`, `ChantLine.ts:527-537` and `Chant.ts:1128`; the `selected` classes, `Drawing.ts:2056-2073`; `TextTypes`, `Drawing.ts:255-355`; `ChantLine.bisectNotationAtX()`, `ChantLine.ts:2425` | `edited` (`cases.ts:602`), `editable-with-selection` (`:570`), `insertion-cursor-after-element` (`:577`), `insertion-cursor-on-line` (`:583`), `insertion-cursor-on-text-only` (`:590`), `selected-porrectus` (`:596`), `note-id-prefix` (`:563`); unit tests `test/gabcDiff.test.ts:142-190` |

**What it does.** exsurge has what an editor needs, one that redraws the score as you type and lets you point at the drawing:

- **Re-parsing only what changed.** `Gabc.updateMappingsFromSource()` compares the new GABC with the mappings already parsed, word by word. It parses again only the words that changed, and keeps the rest of the mappings. In a check that changed `lé(f)` to `lé(fg)` in `(c4) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (::)`, the mappings for `(c4)` and `Ky(f)ri(g)e(h)` were the same objects afterwards. Only the changed word, and the last word, which is always parsed again, were new.
- **Selection.** `score.updateSelection()` marks elements as selected. They get the CSS class `selected`, for your stylesheet to show; the two notes of a porrectus glyph get `selectedA` and `selectedB`. The indices count the elements of `score.notes`, which are the notes of each neume plus the other notations, with -1 for the starting clef.
- **An insertion cursor.** It goes after an element, or at the start of a system.
- **Editable SVG.** `ctxt.editable = true` adds the class `EditableChantScore` to the SVG, and an unfilled rectangle the size of each staff.
- **Finding what was clicked.** Every note has an id and a `source-index`, which is where it is in the GABC. `TextTypes[type].getFromSvgElem()` finds the lyric, annotation or above-lines text that an SVG text element shows. `ChantLine.bisectNotationAtX()` finds the notation at an x position.

**How to use it.**

```js
// after each edit
exsurge.Gabc.updateMappingsFromSource(ctxt, score.mappings, newGabc);
score.updateNotations(ctxt);
score.performLayout(ctxt);
score.layoutChantLines(ctxt, width);

// select the starting clef and elements 1, 2 and 7
score.updateSelection({ element: { indices: [-1, 1, 2, 7] } });
// or put the insertion cursor after element 3, or at the start of the second system
score.updateSelection({ element: { indices: [], insertion: { afterElementIndex: 3 } } });
score.updateSelection({ element: { indices: [], insertion: { chantLine: 1 } } });
```

**What Gregorio does instead.** It has point-and-click, which runs the other way, from the output back to the source:

- `gregorio -p` writes the GABC file's line, offset and column for each glyph and each syllable's text (`src/gregorio-utils.c:198`, `gtex-write.c:3183-3186`, `:3697-3705`).
- GregorioTeX turns those into `textedit://` links in the PDF (`tex/gregoriotex-syllable.tex:66-89`). They appear only after `\gresetpointandclick{on}`, which is off by default because the links contain absolute paths (`CmdUser.tex:228-241`).

There is nothing for re-typesetting only what changed, for selection, or for a cursor.

## 14. Titles, and left and right text

| Status | Implemented in | Golden cases |
|---|---|---|
| **TeX or font only** | `Titles`, `Titles.ts:44-185`, with its setters at `:151-169`; the text types and their alignment and padding, `Drawing.ts:255-286` and `:752-775` | `titles` (`cases.ts:403`), `titles-aligned-and-wrapped` (`:405`), `svg-measured-titles` (`:640`), `paginated` (`:613`) |

**What it does.** A score has a titles block above the first staff: a supertitle, a title and a subtitle, and a left and a right text on one line under them. Each one can use markup (§7), and wraps to the width of the score.

**How to use it.**

```js
score.titles.setSupertitle(ctxt, "Dominica I Adventus");
score.titles.setTitle(ctxt, "<b>Ad te levávi</b>");
score.titles.setSubtitle(ctxt, "Introitus · <i>Ps. 24</i>");
score.titles.setTextLeft(ctxt, "Mode 8");
score.titles.setTextRight(ctxt, "<sc>Graduale Romanum</sc> p. 15");
ctxt.textStyles.title.alignment = "right";  // "left", "center" (the default) or "right"
ctxt.textStyles.title.padding = 2;          // a multiple of the default padding
```

The sizes follow the size given to `ctxt.setFont()`, which is 16 by default. The supertitle is 7/6 of that size, the title 3/2 of it, and the subtitle the same size. The left and right text are 0.9 of it, as are the lyrics (`Drawing.ts:255-286`, `:330-332`).

**What Gregorio does instead.** GregorioTeX typesets no title, supertitle or subtitle: a search of `tex/` and `CmdUser.tex` for "title" found nothing. The `name` header is required but not printed (`Gabc.tex:79-82`). Titles are written in the LaTeX document around the score. The nearest GregorioTeX features are:

- `\gresetheadercapture`, which passes a header's value, such as `name`, to a TeX macro of your choice (`tex/gregoriotex-main.tex:1950-1953`, `CmdUser.tex:1416-1457`);
- `\grecommentary`, which sets text flush right above the score, like exsurge's right text (`tex/gregoriotex-main.tex:596-630`).

## 15. Annotations of any number of lines

| Status | Implemented in | Golden cases |
|---|---|---|
| **Different syntax**: `\greannotation`, called once per line | `Annotations`, `Drawing.ts:4265`; `Annotation`, `:4241`; merging with the left text, `Chant.ts:1020-1025`, `ChantLine.ts:492-495`, `ctxt.setMergeAnnotationWithTextLeft()` at `Drawing.ts:1355-1357`, and `ctxt.mapAnnotationSpansToTextLeft` at `:931` | `annotation-with-drop-cap` (`cases.ts:353`), `annotations-with-drop-cap` (`:360`), `tall-annotations-with-drop-cap` (`:367`, four lines), `annotation-merged-into-text-left` (`:374`), `annotation-not-merged` (`:383`), `annotation-spans-mapped` (`:390`) |

**What it does.** `new Annotations(ctxt, …lines)` takes any number of lines and stacks them above the drop cap. When there is no drop cap, the annotation becomes part of the left text above the score instead (`Chant.ts:1020-1025`).

**How to use it.**

```js
score.annotation = new exsurge.Annotations(ctxt, "Ant.", "VIII", "g", "<b>x</b>");
ctxt.setMergeAnnotationWithTextLeft(false); // draw it at the start of the first line even without a drop cap
ctxt.mapAnnotationSpansToTextLeft = (spans) => spans; // change the annotation's text as it goes into the left text
```

The annotation isn't read from the GABC header: the client creates it (`gregorio-feature-gap.md` §1).

**What Gregorio does instead.** The `annotation` header allows two lines (`MAX_ANNOTATIONS`, `src/struct.h:704`). A third is ignored with a warning (`score.y:831-839`). In TeX, each call of `\greannotation` adds another line, with no fixed limit (`tex/gregoriotex-main.tex:451`, `:485-546`; `CmdUser.tex:870-880`).

## 16. Staffs of one line, or more than five

| Status | Implemented in | Golden cases |
|---|---|---|
| **Not in Gregorio** for one line, or more than five | `score.staffLineCount`, `Chant.ts:605`, `:639`, read when the staff, bars, custodes and ledger lines are drawn (e.g. `ChantLine.ts:541`, `Signs.ts:128-236`) | `two-line-staff` (`cases.ts:435`), `three-line-staff` (`:441`), `five-line-staff` (`:447`); none for one line, or more than five |

**What it does.** A staff can have any number of lines. Two to five lines are what Gregorio has too. One line, as for a recitation tone, and six or more, work as well: `(c1) a(cdc) b(b) (,) c(d) (::)` on one line and `(c4) a(fgh) b(m) (,) c(n) (::)` on six were both drawn as expected, with ledger lines and bars in place.

**How to use it.**

```js
score.staffLineCount = 1; // before performLayout()
```

The `staff-lines` header isn't read (`gregorio-feature-gap.md` §1).

**What Gregorio does instead.** It accepts two to five lines and reports any other number as an error (`src/struct.c:1221-1225`).

## 17. Neume size apart from the staff size

| Status | Implemented in | Golden case |
|---|---|---|
| **Not in Gregorio** | `ctxt.setStaffHeight(staffHeight, glyphMultiplier)` and `ctxt.setGlyphScaling(scaling, glyphMultiplier)`, `Drawing.ts:1415-1449` | `glyph-multiplier` (`cases.ts:426`) |

**What it does.** The second argument of `setStaffHeight()` scales the neumes, clefs and other glyphs against a staff whose size the first argument sets. `ctxt.setStaffHeight(48, 0.8)` draws the notes at 80% of their usual size on the same staff. This came in with exsurge 1.25.0 and 1.25.1.

**How to use it.**

```js
ctxt.setStaffHeight(37.5, 0.8); // the golden case
```

**What Gregorio does instead.** One factor sets both the size of the neume font and the distance between staff lines (`\grechangestaffsize`, `tex/gregoriotex-main.tex:1936-1945`). `\grechangestafflinethickness` changes only the thickness of the lines (`tex/gregoriotex-spaces.tex:194-198`). The documentation of `\gresetgregoriofontscaled` says it can't be used to scale glyphs up or down (`CmdUser.tex:457-461`).

## 18. Colours

| Status | Implemented in | Golden case |
|---|---|---|
| **Different syntax** for staff lines, text and rubrics; **TeX or font only** for neume lines and bars | the `ChantContext` fields, `Drawing.ts:820-823`, `:883-886`; their defaults, `:969-976`, `:1031-1040`; `setRubricColor()`, `:1196-1201` | `colors` (`cases.ts:462`) |

**What it does.** Each part of the drawing has its own colour:

| Setting | Colours | Default |
|---|---|---|
| `ctxt.setRubricColor(c)` | directives, `<c>` and `^…^`, ℣ and ℟ | `#d00` |
| `ctxt.textColor`, then `ctxt.setFont()` | all text | `#000` |
| `ctxt.textStyles[type].color` | one kind of text: `lyric`, `translation`, `al`, `annotation`, `dropCap`, `title`, … | `textColor` |
| `ctxt.staffLineColor` | staff lines | `#000` |
| `ctxt.neumeLineColor` | the lines in neumes: stems, the lines joining notes, and beams | `#000` |
| `ctxt.dividerLineColor` | bars | `#000` |
| `ctxt.negativeFillColor` | the "holes" in glyphs, such as the inside of a punctum cavum, which must match the background when the page has a dark theme | `#fff` |

**How to use it.**

```js
ctxt.setRubricColor("#a00");
ctxt.staffLineColor = "#888";
ctxt.textColor = "#444";
ctxt.setFont("'Palatino Linotype', serif", 16); // applies textColor
```

**What Gregorio does instead.**

- Staff lines: `\gresetlinecolor` (`CmdUser.tex:395-400`).
- Text: `\grechangestyle` can colour each kind of text, such as the translation, above-lines text, initial or annotation (`CmdUser.tex:803-835`).
- `<c>`: it uses the colour `gregoriocolor`, which can be redefined (`tex/gregoriotex.sty:101`).
- Notes, neume lines and bars: there is no GregorioTeX command to colour them. Only TeX in `[nv:]`, `[gv:]` or `[ev:]` could.

## 19. A minimum for the last line

| Status | Implemented in | Golden case |
|---|---|---|
| **Not in Gregorio** | `ctxt.minSyllablesLastLine` and `ctxt.minNotesLastLine`, `Drawing.ts:847-848`, `:1101-1102`; `ChantLine.ts:1125-1187` | `last-line-minimums` (`cases.ts:522`) |

**What it does.** It stops the last line of a score from holding only a word or two. When exsurge breaks a line, it counts the syllables and notes that would be left after the break. If there are fewer than `minSyllablesLastLine` syllables and fewer than `minNotesLastLine` notes, it moves the break earlier, until either count is reached. Both settings must be set for it to work. In a check at a width of 330, `minSyllablesLastLine = 4` and `minNotesLastLine = 6` took the last line from three notations to five.

**How to use it.**

```js
ctxt.minSyllablesLastLine = 4;
ctxt.minNotesLastLine = 6;
```

**What Gregorio does instead.** It has `\gresetlastline{justified|ragged|trimmed}`, which sets how the last line is filled, not what goes on it (`tex/gregoriotex-main.tex:1117-1134`, `CmdUser.tex:1209-1216`). A search of `tex/` for "lastline", "widow", "club" and similar terms found no minimum. GregorioTeX's widow and club penalties are about page breaks (`tex/gregoriotex-gsp-default.tex:58-63`).

## 20. Spanish, and syllabification

| Status | Implemented in | Golden cases and tests |
|---|---|---|
| **Different syntax** for Spanish: a user's `gregorio-vowels.dat`; **not in Gregorio** for syllabification | `Spanish`, `Text.ts:404`; `language`, `Text.ts:707-711`; `Language.syllabify()`, `Text.ts:36-47`; `Latin.syllabifyWord()`, `Text.ts:272`; `Spanish.syllabifyWord()`, `Text.ts:540` | `spanish` (`cases.ts:558`), `english` (`:553`); `test/core.test.ts:106-118`, `test/bugfixes.test.ts:18-38` |

**What it does.**

- **Spanish.** exsurge has vowel rules for Spanish, as well as Latin (the default) and English. They decide which letters each syllable's notes are centred over. For example, they skip the silent `u` of `que` and `guí` and centre on the vowel after it (`Text.ts:680-701`).
- **Syllabification.** The Latin and Spanish rules can also split plain text into syllables. An editor can use this to turn a text into GABC.

**How to use it.**

```js
ctxt.defaultLanguage = exsurge.language.spanish;

exsurge.language.latin.syllabify("Glória Patri et Fílio");
// [["Gló","ri","a"], ["Pa","tri"], ["et"], ["Fí","li","o"]]
exsurge.language.spanish.syllabify("Señor, ten piedad de nosotros");
// [["Se","ñor,"], ["ten"], ["pie","dad"], ["de"], ["no","so","tros"]]
```

English has no syllabification: `language.english.syllabify()` throws, because `English` has no `syllabifyWord()`. English centres each neume over the whole syllable (`Text.ts:61-66`). The `language` header isn't read (`gregorio-feature-gap.md` §1).

**What Gregorio does instead.**

- **Vowel rules.** It has Latin, built into the C code (`src/characters.c:223-233`), and English, Church Slavonic (with Polish, Czech and Slovak as aliases) and Hungarian, in `tex/gregorio-vowels.dat:30-136`. It has no Spanish: a search for "spanish", "español" and `[es]` found nothing. A user can add a language by writing their own `gregorio-vowels.dat` and naming it in the `language` header (`Gabc.tex:1121-1227`).
- **Syllabification.** Gregorio doesn't split text into syllables. `contrib/checkSyllabation.py` only checks the syllables of an existing GABC file against hyphenation patterns, and GregorioTeX turns TeX's own hyphenation off inside scores (`tex/gregoriotex.lua:1211-1216`).

## 21. The pitch of every note

| Status | Implemented in | Tests |
|---|---|---|
| **Not in Gregorio** | `Note.pitch`, `Chant.ts:107`, set at `Gabc.ts:1843` through each clef's `staffPositionToPitch()` (`Chant.ts:326-339`, `:370-383`, `:418-431`, `:468-481`); `Pitch`, `Core.ts:305-353`; `Step`, `Core.ts:277-289`; accidentals reset at each word, `Gabc.ts:746-755` | none among the golden cases, since pitches aren't drawn; `test/gabcDiff.test.ts:166`, `:171` |

**What it does.** Every note has a `pitch`, worked out from its position, the clef, and the accidentals in force:

- `pitch.step` is a `Step`, counted in semitones from Do: Do 0, Du 1, Re 2, Me 3, Mi 4, Fa 5, Fu 6, So 7, La 9, Te 10 and Ti 11.
- `pitch.octave` is an octave number, relative to the clef. Under a C clef, the clef's line is Do in octave 2.
- `pitch.toInt()` gives `octave × 12 + step`: a semitone number, ready for playback or transposition.

An accidental (`ix`) changes the pitch of later notes in the same position until the next word, bar or clef. This follows Solesmes practice (`Gabc.ts:746-755`), and differs from Gregorio's idea of how long an accidental lasts.

**How to use it.**

```js
score.notes.filter((n) => n.pitch).map((n) => n.pitch.toInt());
```

With `(c4) a(defghij) b(ixi) c(i) (::)`, the notes are Re, Mi, Fa, So, La, Ti and Do, then Te after the flat, and Ti again in the next word. (The flat sign `ix` has a pitch of its own too, so it appears in that list.)

**Limit.** Under some clefs, a few offset notes, such as `g9`, get a wrong pitch or none (see [the bug](#limits-and-bugs-found-while-checking)).

**What Gregorio does instead.** It has no pitch output. The `dump` format, which is for debugging, prints each note as the letter of its staff position (`src/dump/dump.c:78-90`). Accidentals are tracked per line and staff position only to decide whether a soft accidental is shown (`tex/gregoriotex.lua:1175-1199`) and whether a custos needs one (`src/struct.c:1291-1336`).

## 22. The header as an object, with its comments kept

| Status | Implemented in | Golden case |
|---|---|---|
| **Not in Gregorio** | `GabcHeader`, `Gabc.ts:130-246`: `getLength()` `:156-159`, the constructor `:161-206`, `toString()` `:208-244`; `createMappingsFromSource()` skips the header, `Gabc.ts:259-261` | `header` (`cases.ts:285`) |

**What it does.** `new GabcHeader(text)` parses a GABC header into an object:

- Each field is set under its GABC name and its camel-cased name (`office-part` and `officePart`).
- A field that appears more than once also gets an array, such as `annotationArray`.
- Commented-out fields (`%name: value;`) go in `cValues`, and other comment lines go in `comments`, by line number.

`toString()` writes the header back, comments included, so an editor can change a field without losing anything.

**How to use it.**

```js
const header = new exsurge.GabcHeader("name: Kyrie;\n%office-part: Kyriale;\n% a comment\nmode: 8;\n%%\n(c4) a(f)");
header.name;     // "Kyrie"
header.mode;     // "8"
header.cValues;  // { "office-part": "Kyriale", officePart: "Kyriale" }
header.comments; // [ , , "% a comment"]
exsurge.GabcHeader.getLength(gabc); // where the notation starts
header.toString();
```

**Limits.**

- `toString()` writes a commented-out field with a hyphen in its name twice: the example above gives both `%office-part: Kyriale;` and `%officePart: Kyriale;`.
- A comment keeps its line number rather than its place among the fields, so in the example it moves after `mode`.
- Multi-line values ending in `;;` keep only their first line (`gregorio-feature-gap.md` §1).

**What Gregorio does instead.** Its lexer drops `%` and `#` lines in the header (`score.l:129-137`). `gregorio -F gabc` writes GABC back with the headers it kept (`src/gabc/gabc-write.c:1243-1244`), so the comments are lost.

---

## Checked, and in Gregorio after all

These looked like exsurge additions, or are listed as such somewhere, but Gregorio has them too:

| Feature | exsurge | Gregorio |
|---|---|---|
| A brace over a bar, which exsurge calls a "carryover" | `,_`, `;_`, `:_`, `` `_ `` (`Gabc.ts:1138-1141`, `Signs.ts:112-134`, `CHANGELOG.md` 1.19.0; golden case `dividers`) | The same syntax, a "bar brace": a round arch above the staff, centred on the bar (`Gabc.tex:823-830`; `tex/gregoriotex-signs.tex:1404-1422`) |
| Staff lines that end at the last notation | `score.extendLastSystemStaffLines = false` (golden case `staff-lines-end-at-last-notation`) | `\gresetlastline{trimmed}`, new in 6.2.0 (`CmdUser.tex:1209-1216`, `CHANGELOG.md:50`) |
| Staffs of two, three or five lines | `score.staffLineCount` | The `staff-lines` header (`src/struct.c:1217-1234`) |
| More than two annotation lines | `Annotations` | `\greannotation`, called once per line (§15) |
| Centring a neume over the whole syllable | the `English` language (`Text.ts:61-66`) | `\gresetlyriccentering{syllable}` (`CmdUser.tex:978`) |
| Text styles | `ctxt.textStyles`, with `prefix`, `lineHeight` and `color` | `\grechangestyle` (`CmdUser.tex:803-835`) |
| Spacing settings | `ctxt.interSyllabicMultiplier` and the like | `\grechangedim` and the `gsp-*.tex` files |
| Elision by a final `<i>` | A syllable ending in `</i>` sets `lyric.elidesToNext` (`Gabc.ts:1040-1043`; golden case `elisions`). Nothing in the layout reads that flag, so the only visible effect is the italics. | `<e>`, which also affects centring (`score.l:293-298`) |
| A hyphen string of your choice | `ctxt.syllableConnector` | The font's `\hyphenchar` (`tex/gregoriotex-main.tex:2086`) |
| `<sp>` ligatures, `<v>\greextra{…}`, `[alt:]` on notes, `{}` centring, translations with `[/]`, `R`, `r0`, soft accidentals, Dominican bars, custodes, zero-width `{…}` groups | All supported | All Gregorio syntax (see `gregorio-feature-gap.md` Part 1) |

`gregorio-feature-gap.md` §16 lists 13 exsurge additions, and each was checked here:

| Addition in §16 | Result |
|---|---|
| Several lyric lines | confirmed (§6) |
| The ⅓-step nudge | confirmed, with a correction: a note on a line moves ⅔ step (§3) |
| Stems on inclinata | confirmed, and they also have flags and beams (§4) |
| Treble and Chi-Rho clefs | confirmed (§1, §2) |
| `o<` and `o>` | Gregorio's equivalent is `o1`/`o0` (§5) |
| The markdown-like markup, `<u>`, `<br>` and `<font>` | confirmed (§7) |
| Directives and the rubric colour | confirmed (§9) |
| Text-only syllables on extra lines, and the last-line minimums | confirmed (§10, §19) |
| The titles block | confirmed (§14) |
| Editing support | confirmed (§13) |
| The output forms | confirmed (§12) |
| Round-tripping the header | confirmed (§22) |
| Spanish vowel rules | confirmed (§20) |

## Syntax collisions

How Gregorio reads exsurge's own syntax. `gregorio-feature-gap.md` §15 covers these the other way round, as exsurge's reading of Gregorio's syntax.

| exsurge syntax | exsurge meaning | What Gregorio does with it |
|---|---|---|
| `treble2`, `treble-2` | treble clef (§1) | errors for `t` and `2`, and for the `-` of `treble-2`; `r` is a cavum mark; `e`, `b`, `l`, `e` are notes |
| `xp3`, `xp-3` | Chi-Rho clef (§2) | `x` is a flat; `p` is a note; errors for `3`, and for the `-` of `xp-3` |
| `f0`, `f9`, `f9+` | offset note or custos (§3) | the note, and an error for the digit (and, in `f9+`, for the `+`) |
| `G0` | inclinatum nudged down (§3) | inclinatum leaning down (`notes.l:1414-1417`) |
| `G\|` in the notes | stem and flag (§4) | NABC separator, a fatal error without `nabc-lines` |
| `o<`, `o>` | oriscus up or down (§5) | the liquescence is dropped; with `oriscus-orientation: legacy`, both point down |
| `\|` in the lyrics | the next lyric line (§6) | a literal `\|` |
| `*bold*` | bold | two stars around the text |
| `_italic_` | italic | two underscores around the text |
| `^red^` | rubric colour | `^` passed to TeX |
| `%small caps%` | small capitals | a comment to the end of the line |
| `<u>`, `<br>`, `<font …>` | underline, line break, font | printed as literal text |
| `+` | a plus sign (`ctxt.specialCharMap["+"]`) | a dagger |
| `†`, `ij.`, `1.` | red directives (§9) | ordinary text |
| `V/.`, `℣.` | the barred V (§9) | ordinary text |
| `[alt:text]` in the lyrics | above-lines text (§11) | a translation reading "alt:text" |
| a second `<alt>` | a second line of above-lines text (§11) | replaces the first |
| `~` in the lyrics | a space that doesn't break | a lyric tie (`gregorio-feature-gap.md` §15) |

## Limits and bugs found while checking

These came up while rendering the examples. None of them is fixed here; each would be a change under `src/`.

1. **Some offset notes get a wrong pitch or none, and an automatic custos announcing one with no pitch breaks the whole SVG.** `createNoteFromData()` adds the offset to the staff position and then subtracts it again before looking up the pitch (`Gabc.ts:1842-1843`). In floating point, 4 + ⅓ − ⅓ comes out as 3.9999999999999996, which isn't a step (`Pitch.staffOffsetToStep()`, `Core.ts:347-352`). Every pitch `a` to `m` with `0` or `9` was compared with the same pitch without the digit, under 11 clefs:
   - `g9` (and `G9`) gets no step under `c1`, `c2`, `c4`, `f2` and `f3`.
   - The same rounding gives a wrong pitch in three cases: `g9` is Do under `f4`, `g9` loses the clef's flat under `cb3`, and `d9` comes out an octave low under `c1`.
   - `c3`, `f1`, `treble2` and `xp3` are unaffected.
   - When a line break falls just before such a note, the automatic custos's position is `NaN` (`Signs.ts:55-65`). The `NaN` spreads to the height of the SVG, and nothing is drawn. Example: `(c4) a(f)b(g)c(h)d(g)e(f)f(e)g(f)h(g9)i(g0)j(g9)k(g0)l(g9)m(g0) (::)` at a width of 200, with `ctxt.setStaffHeight(48)`.
   - A fix would compute the pitch from the unrounded position: `gabcHeightToExsurgeHeight(data[0])`.
2. **A `<br>` in a syllable with notes isn't given room** (§7). On the last system, the extra line falls outside the SVG.
3. **Text-only syllables can overlap on the extra lines** (§10). When one is longer than a line, the next ones are drawn over its second line, as in the golden case `extra-text-only-lines`.
4. **`GabcHeader.toString()` duplicates commented-out fields** whose names have a hyphen (§22).
5. **`language.english.syllabify()` throws**, because `English` has no `syllabifyWord()` (§20).
6. **`lyric.elidesToNext` is set but never read**, so ending a syllable with `</i>` has no effect beyond the italics.
7. **The Chi-Rho clef reads pitches as a C clef, with a `TODO`** (`Chant.ts:457-481`).
8. **Beams have no slope limit**, flags point left, and stems point only up (§4).

## Appendix: how the examples were rendered

The checks used a throwaway Vitest file outside the repository, run with a config whose root was that folder. It imported `render()` from `test/golden/harness.ts` and the source from `src/index.ts`. For each probe, it rendered the GABC at the given width with the harness's stand-in fonts, and wrote out two files:

- the SVG, rasterised with `rsvg-convert -z 2 -b white` so the result could be looked at;
- a dump of `score.notations`, with each notation's class and source, each note's staff position (with its offset), shape and pitch, the glyphs drawn, the lyrics, and the line breaks.

The API checks called `Language.syllabify()`, `GabcHeader` and `Gabc.updateMappingsFromSource()` directly, and read `note.pitch` from scores parsed for each clef.

The SVGs in [`exsurge-features-not-in-gregorio/`](exsurge-features-not-in-gregorio/) were rendered with the same `render()`, with one change in `setupContext`. It called `ctxt.setFont("'Times New Roman', Times, 'Liberation Serif', serif", 16, {}, fonts)`, where `fonts` measures text with the advance widths read from the system's `Times New Roman.ttf`. That makes the lyric spacing in the SVGs right for Times New Roman and for Liberation Serif, which has the same widths. A minimal way to repeat one check:

```ts
import * as E from "../src/index";
import { render } from "../test/golden/harness";

const { score, outputs } = await render(E, "(c4) a(G|) b(G|F|E|) c(g0) d(g9) (::)", { width: 400 }, ["svg"]);
console.log(score.notations.map((n: any) => [n.constructor.name, n.notes?.map((x: any) => [x.staffPosition, x.inclinataFlags])]));
```
