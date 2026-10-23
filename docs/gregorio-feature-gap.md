# exsurge and Gregorio: feature gap and implementation plan

This document lists where exsurge's handling of GABC differs from Gregorio's, the reference GABC implementation (the `gregorio` program plus GregorioTeX), and plans how to close the gaps that matter. Part 1 is an inventory, grouped by area. Part 2 is a plan in phases, each sized to be its own pull request.

## Contents

- [Versions and method](#versions-and-method)
- [Summary](#summary)
- **Part 1. Inventory**
  1. [File structure and headers](#1-file-structure-and-headers)
  2. [Pitches and single-note shapes](#2-pitches-and-single-note-shapes)
  3. [Neume formation, fusion and shape hints](#3-neume-formation-fusion-and-shape-hints)
  4. [Signs on notes](#4-signs-on-notes)
  5. [Bars and divisions](#5-bars-and-divisions)
  6. [Clefs](#6-clefs)
  7. [Accidentals](#7-accidentals)
  8. [Neume spacing codes](#8-neume-spacing-codes)
  9. [Line breaks and custos](#9-line-breaks-and-custos)
  10. [Zero-width groups `{}` ("polyphony")](#10-zero-width-groups--polyphony)
  11. [Lyric markup and syllable controls](#11-lyric-markup-and-syllable-controls)
  12. [Centring, translations, elisions and hyphens](#12-centring-translations-elisions-and-hyphens)
  13. [NABC (St. Gall and Laon neumes)](#13-nabc-st-gall-and-laon-neumes)
  14. [Typesetting and layout](#14-typesetting-and-layout)
  15. [Where exsurge's own syntax collides with Gregorio's](#15-where-exsurges-own-syntax-collides-with-gregorios)
  16. [What exsurge has that Gregorio lacks](#16-what-exsurge-has-that-gregorio-lacks)
- **Part 2. [Implementation plan](#part-2-implementation-plan)**
- [Appendix: how the render checks were run](#appendix-how-the-render-checks-were-run)

## Versions and method

**exsurge** is at commit `0b0e48a`, the TypeScript conversion on branch `claude/exsurge-typescript-refactor-e0c5a3`. **Gregorio** is a shallow clone of `gregorio-project/gregorio` at commit `b63f074` (24 August 2026). That is the `develop` branch just after release 6.2.0, and every Gregorio reference below points into it. To browse a reference on GitHub, prefix its path with `https://github.com/gregorio-project/gregorio/blob/b63f074253bd2f6b837f9f9778bba299ac139ec0/`.

**Gregorio's behaviour** comes from three sources:

- the GABC and NABC references (`doc/Gabc.tex`, `doc/GregorioNabcRef.tex`, `doc/Command_Index_User.tex`);
- the lexers and parser (`src/gabc/`);
- GregorioTeX (`tex/`), together with `CHANGELOG.md` and `UPGRADE.md` for features that were changed or removed.

**exsurge's status** comes from rendering, not from reading the code alone. A throwaway Vitest file, kept out of the repository, rendered about 110 GABC probes with the golden-test harness, and a few more checks called the header parser directly. The harness uses fake text fonts but exsurge's real glyph outlines. For each probe the file dumped what exsurge parsed: each notation's class, each note's shape, modifier and liquescence flags, its markings, and the glyph codes drawn. It also rasterised the SVG so the result could be looked at. The [appendix](#appendix-how-the-render-checks-were-run) describes how to do this again. Code references point at the code that produces each behaviour.

**Abbreviations used in the tables:**

| Short form | File |
|---|---|
| `notes.l` | `src/gabc/gabc-notes-determination.l` (Gregorio's lexer for the inside of `( )`) |
| `score.l`, `score.y` | `src/gabc/gabc-score-determination.l` and `.y` (Gregorio's lexer and parser for headers and lyrics) |
| `Gabc.tex` | `doc/Gabc.tex` (Gregorio's GABC reference) |
| `CmdUser.tex` | `doc/Command_Index_User.tex` (GregorioTeX's user commands) |
| `NabcRef.tex` | `doc/GregorioNabcRef.tex` |
| `greciliae.sfd` | `fonts/greciliae-base.sfd` (the components of Gregorio's default square-note font) |
| `Gabc.ts`, `Neumes.ts`, `Drawing.ts`, `ChantLine.ts`, `Chant.ts`, `Signs.ts`, `Text.ts`, `Glyphs.ts`, `Titles.ts` | `src/Exsurge.Gabc.ts`, `src/Exsurge.Chant.Neumes.ts`, and so on, in this repository |

**Status values** for exsurge:

- **supported**: rendered as Gregorio renders it, allowing for the different font.
- **partial**: some forms work, or the construct is parsed but drawn approximately.
- **missing**: silently ignored; the output is as if the construct weren't there.
- **buggy**: the output is wrong. The construct is drawn as something else, notes are lost or made up, or markup is printed as text.

**Implementation sizes** are rough:

- **S**: under a day, mostly in the parser.
- **M**: one to three days, with parser and layout work.
- **L**: one to two weeks, or new glyph outlines.
- **XL**: several weeks.

## Summary

Most of the gaps are of five kinds:

1. **Valid Gregorio GABC that exsurge renders wrongly.** These matter most, because they corrupt output instead of just leaving something out:
   - NABC after `|` is drawn as square notes.
   - `%` comments in the notation section are printed as small-caps lyrics.
   - A `$` escape splits a syllable and invents a note.
   - `[[ ]]` brackets swallow the notes inside them.
   - A flat F clef (`fb3`) is drawn as a clivis.
   - A porrectus spanning a fifth or more (`kfk`) loses its first two notes.
   - The musica ficta signs `r6` to `r8` are drawn as hollow notes.
   - `G0` moves a punctum inclinatum off its pitch.
   - `<nlba>` written inside the notes becomes notes.
   - The syllable controls `<eu>`, `<nlba>`, `<pr>` and `<clear>`, the `<tt>` style tag, and most `<sp>` specials are printed literally.

   All of these can be fixed without new glyphs, and almost all of them in the parser alone (Phase 1).
2. **Note shapes.** Several shapes are missing or approximate: cavum inside neumes, oriscus scapus and explicit oriscus orientation, quilisma quadratum, pes quadratum, the inclinatum's leaning and liquescent forms, stropha aucta, bivirga reversa, linea, and parenthesized signs. Neume fusion (`@`, `@[ ]`, `[shape:stroke]`) is missing too. Some of these can be built from exsurge's existing outlines; the rest need new ones.
3. **Bars, breaks and spacing.** The missing pieces are:
   - divisio minimis `^`;
   - the dotted, high and parenthesized bars;
   - custos control (`z-`, `Z-`, `[nocustos]`);
   - the spacing codes `/0`, `/!` and `/[n]`, and `! ` (a non-breaking space);
   - no-line-break areas (`<nlba>`, `<eu>`).

   Separately, exsurge makes a space between neumes no wider than `//`.
4. **Headers.** exsurge parses the header but never acts on it. `annotation`, `mode`, `staff-lines` and `language` have to be applied through the API, and the mode line isn't produced at all.
5. **Typesetting.**
   - Initials can only span one line, and there are no first-syllable or first-word styles.
   - Lines are filled greedily, while Gregorio breaks the whole score as one TeX paragraph.
   - NABC is not drawn at all. It is the largest single feature by far: about 600 outlines for the St. Gall font alone.

The plan's phase order: (1) stop corrupting valid input; (2) bars, breaks, custos and spacing codes; (3) settings from the header, and two-clef forms; (4) lyric semantics; (5) note shapes that can be built from existing outlines; (6) new outlines for cavum, quilisma quadratum, the inclinatum and stropha variants, parentheses, and a porrectus stroke spanning a fifth; (7) brackets, slurs, ledger lines and episema tuning; (8) neume fusion; (9) initials spanning more than one line; (10) NABC; (11, optional) paragraph-wide line breaking; (12) ledger lines drawn by Gregorio's rules, added after the rest of the plan.

---

# Part 1. Inventory

## 1. File structure and headers

Gregorio has only one header syntax. Each header is `name: value;`, and a value can span several lines if it ends with `;;`. The header section ends at a line of `%%` (`score.l:117-155`, `:220-228`; `Gabc.tex:36-74`). There is no newer form. The `initial-style` and `centering-scheme` headers have been removed: Gregorio now accepts them like any unknown header, and they have no effect.

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| `%%` separator | Required, and may have more than two `%`: `%%+` followed by a newline (`score.l:225-228`). With no header, Gregorio reports an error. | **partial**. A `%%` line, optionally followed by a space, is recognised (`Gabc.ts:118`, `:156-159`), and GABC with no header also renders. A `%%%` line is not recognised: `GabcHeader.getLength()` returns 0 and the header lines render as lyrics. | Low | S |
| `name: value;` lines | `score.l:138-155` | **supported** (`Gabc.ts:119`, `:161-206`). Fields are stored under the GABC name and its camelCase form. Repeated fields are also collected in `…Array` (`annotationArray`). | — | — |
| Multi-line value ending in `;;` | `score.l:142-150`, `Gabc.tex:72-74` | **buggy**. Only the first line is kept. `commentary: first line⏎second line;;` gives `commentary: "first line"`, and the second line is dropped. `def-m` macros are often written this way (`Gabc.tex:217-224`). | Low | S |
| Trailing space after `;` | Ignored since 5.0.0 (`CHANGELOG.md:179`) | **buggy**. `name: x;   ` gives the value `"x;   "` (`Gabc.ts:119`). | Low | S |
| Comment lines in the header (`%`, `#`) | A line starting with `%` or `#` (`score.l:129-137`) | **supported**. `%` lines are kept for round-tripping (`cValues`, `comments`); `#` lines are dropped. | — | — |
| `%` comments in the notation section | A `%` starts a comment that runs to the end of the line and also removes the line-end space (`score.l:313-321`, `notes.l:784-792`, `Gabc.tex:63-64`). | **buggy**. Comments are printed as lyric text. `Ky(f)ri(g)e(h) % a comment⏎ e(g)` gives a text-only syllable reading " A COMMENT" in small caps, because `%…%` is exsurge's small-caps markup (`Drawing.ts:1001-1006`). | **High** for files from Gregorio-based collections, which often contain comments | S–M (see the syntax conflicts in §15) |
| `name`, `gabc-copyright`, `score-copyright`, `author`, `office-part`, `occasion`, `meter`, `commentary`, `arranger`, `date`, `manuscript*`, `book`, `transcriber`, `transcription-date`, `user-notes` | Stored, but not typeset unless captured with `\gresetheadercapture` (`score.y:775-799`, `:840-844`, `:849-851`; `Gabc.tex:138-154`) | **supported**, in the same way: parsed into `GabcHeader`, not typeset. | — | — |
| `annotation` (up to 2) | Text centred above the initial, one line per header (`score.y:831-839`, `Gabc.tex:110-127`, `tex/gregoriotex-main.tex:451-547`) | **partial**. Parsed, but the score never reads it, so it only appears if the client calls `score.annotation = new Annotations(ctxt, …)` (`Chant.ts:610`). A full header with two `annotation` lines rendered with a drop cap and no annotation. | Medium | S |
| `mode`, `mode-modifier`, `mode-differentia` | When there is no annotation, the mode is typeset above the initial. A leading digit 1–8 becomes a roman numeral (`\gresetmodenumbersystem`), and the modifier and differentia follow (`score.y:800-814`, `Gabc.tex:156-203`, `src/gregoriotex/gregoriotex-write.c:4717-4729`). | **missing**. Nothing in `src/` reads the mode. | Medium (most antiphons and introits have a mode) | S |
| `staff-lines` | 2 to 5 lines (`score.y:815-822`, `src/struct.c:1217-1234`) | **partial**. Clients can set `score.staffLineCount` (`Chant.ts:639`; golden cases `two-line-staff` to `five-line-staff`), but the header is ignored: `staff-lines: 5;` still drew 4 lines. | Medium | S |
| `language` | Chooses the vowel rules (`score.y:784-789`, `Gabc.tex:383-400`) | **partial**. Clients can set `ctxt.defaultLanguage` (`Text.ts:707`), but the header is ignored. | Low–medium | S |
| `nabc-lines` | Turns on `\|` as the NABC separator (`score.y:823-830`) | **missing** (see §13) | — | — |
| `oriscus-orientation: legacy` | The older oriscus rules (`score.y:845-848`, `Gabc.tex:131-133`) | **missing**. exsurge has its own rules (§2). | Low | S |
| `def-m0` to `def-m9`, used as `[nm1]`, `[gm1]`, `[em1]`, `[altm1]` | TeX macros at note, glyph or element level (`score.l:156-159`, `notes.l:949-975`, `Gabc.tex:205-226`, `:1106-1118`). `def-m0` can be defined but not invoked (only digits 1–9 match). | **missing**, but harmless: the header is parsed and `[nm1]` and the like are ignored. Rendering TeX doesn't apply to exsurge. | Low | S (optional client hook) |
| `initial-style`, `centering-scheme` | Removed (`CHANGELOG.md:215`, `:471`; `UPGRADE.md:202-206`, `:399-401`), so now ignored | Ignored by both. exsurge could map them for old files (`initial-style: 0` meaning no drop cap). | Low | S |

## 2. Pitches and single-note shapes

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| Pitches `a`–`m`; `n` and `p` on a five-line staff | `notes.l:1405`, `Gabc.tex:408-450` | **partial**. `a`–`n` work. `p` is dropped silently (`Gabc.ts:98` only allows `[a-nA-N]`): `(p)` renders nothing, even with `staffLineCount = 5`. | Low | S |
| Punctum quadratum `g`, initio debilis `-g` | `notes.l:1405-1410`, `Gabc.tex:566` | **supported** | — | — |
| Punctum inclinatum `G`, with automatic leaning | `notes.l:1414-1417`. The leaning comes from the surrounding pitches (`Gabc.tex:464-468`): the font has ascending, descending and upright ("stans") glyphs (`greciliae.sfd`: `AscendensPunctumInclinatum`, `DescendensPunctumInclinatum`, `StansPunctumInclinatum`). | **partial**. There is one diamond glyph and no leaning (`Neumes.ts:1132-1133`). | Low–medium | L (2 new outlines) |
| `G0`, `G1`, `G2`: forced leaning (down, up, upright) | `notes.l:1414`, `Gabc.tex:466-468`, `CHANGELOG.md:138` | **buggy**. exsurge reads the `0` in `G0` as its own staff-position nudge, so the note moves down ⅓ step (`Gabc.ts:2290-2307`): `(hG0F0)` drew G and F at the wrong heights. `G1` and `G2` are ignored. | Medium (Gregorio users write `G0` and `G1` routinely) | S for the parser, L for the glyphs |
| Oriscus `o`, with automatic orientation | It points towards the first following note that is neither at the unison nor an oriscus (`Gabc.tex:543-554`, `CHANGELOG.md:184`, `src/struct.c:413-439`). | **partial**. A standalone oriscus looks only at the first note of the next neume (`Neumes.ts:886-910`). So in `(gogh)`, where the oriscus is followed by a pes that starts on the same note, the oriscus is drawn descending; Gregorio points it up. | Low–medium | S–M |
| `o0` / `o1`: forced orientation | `notes.l:1455-1462`, `Gabc.tex:549-550` | **missing**. The digit is ignored: `(go1f)` still points down and `(go0h)` up. | Low | S |
| `O`, `O0`, `O1`: oriscus scapus (an oriscus with a stem joining it to the previous note) | `notes.l:1463-1474`, `Gabc.tex:567-568`. The glyphs are oriscus plus a virga-like stem (`fonts/squarize.py:1034-1045`). | **partial**. Parsed as `Stemmed` (`Gabc.ts:2054-2065`) but drawn like a plain oriscus: `(gO)` has no stem, and `(egOi)` looks the same as `(egoi)`. | Low–medium | M (built from existing outlines) |
| Quilisma `w` | `notes.l:1475-1478` | **supported** (as a single note and in a pes) | — | — |
| Quilisma quadratum `W` | `notes.l:1479-1482`, `Gabc.tex:570-571`; glyph `QuilismaPesOneNothing` in `greciliae.sfd` | **missing**. Drawn as a plain punctum or pes (`Gabc.ts:2039-2041` has no case for `W`). | Low | L (new outline) |
| Virga `v`, virga reversa `V`, bivirga and trivirga `vv`, `vvv` | `notes.l:1381-1386`, `:1483-1490` | **supported** | — | — |
| `VV`, `VVV`: bivirga and trivirga reversa | `notes.l:1387-1392` | **partial**. Only one virga reversa is drawn (`Gabc.ts:2034-2037`). | Low | S |
| Stropha `s`, distropha `ss`, tristropha `sss` | `notes.l:1393-1404`, `:1491-1494` | **supported**, in exsurge's own curved stropha design | — | — |
| Stropha aucta `s<` / `s>` (also `ss<`, `sss>`) | `src/struct.c:520-529` turns `>` into `<`; glyph `StrophaAucta` (`greciliae.sfd:6147`) | **partial**. The liquescence is parsed but the plain stropha is drawn. `GlyphCode.StrophaLiquescent` is declared (`Drawing.ts:391`) but has no outline in `Glyphs.ts`. | Low | L (new outline) |
| Liquescents `~ < >` on a punctum, and in pes, clivis, torculus, porrectus, scandicus, ancus | `notes.l:1435-1446`, `Gabc.tex:474-476` | **supported** (golden cases `liquescents`, `neume-variants`; render: `(fh~) (hf<) (hfh~) (fhg<)`) | — | — |
| Liquescents on an inclinatum: `G~`, `G<`, `G>` | Glyphs `PunctumInclinatumDeminutus` and `PunctumInclinatumAuctus` (`greciliae.sfd:4981`) | **partial**. `G~` works. `G<` and `G>` draw a plain diamond (`Neumes.ts:1120-1121` only checks for "any liquescence"). | Low | L (1–2 new outlines) |
| Liquescent virga reversa `gV<` / `gV>` | Glyphs exist (`fonts/squarize.py:1022-1033`) | **missing**. A plain virga is drawn. | Low | M |
| Punctum cavum `r` on a single note | `notes.l:1261-1263`, `Gabc.tex:478` | **supported** (`Neumes.ts:1130-1131`) | — | — |
| Cavum on any note of any neume, e.g. `(fgr)`, `(gfr)`, `(gvr)`, `(gor)`, `(gwr)`, `(Gr)` | Since 5.0.0 every component glyph has a `#Cavum` version (`CHANGELOG.md:195`, `greciliae.sfd` names ending `#Cavum`) | **buggy**. Inside a neume `r` is ignored: `(fgr)`, `(gfr)`, `(fhrg)`, `(gvr)` and `(gor)` are drawn solid. `(frg)` and `(grf)` split the neume into a hollow note and a separate punctum (`Gabc.ts:1442-1443`). `(gwr)` loses its quilisma and `(Gr)` stays a solid diamond. | Medium (Dominican and modern editions) | L (about 20 hollow outlines plus parser work) |
| `R` (a punctum between lines) and `r0` (a cavum between lines) | `notes.l:1264-1272` | **supported** (`Neumes.ts:117-122`) | — | — |
| Linea `=` | `notes.l:1377-1380`, `Gabc.tex:477`. The `Linea` glyph is a flat bar with tall side strokes (`greciliae.sfd:2989`). | **missing**. Drawn as a plain punctum. | Low | S–M (built from `LineaVisualizer`) |
| `r1`–`r5`: accents above the staff (acute, grave, circle, semicircles) | `notes.l:1273-1287`, `Gabc.tex:717-721` | **supported** (`Gabc.ts:1952-1994`) | — | — |
| `r6`, `r7`, `r8`: musica ficta (flat, natural, sharp above the staff) | `notes.l:1288-1296`, `Gabc.tex:722-724` | **buggy**. These become cavum notes, because only `r0`–`r5` are recognised and the digit is lost (`Gabc.ts:98` doesn't allow `6`–`8`). `(gr6)` draws a hollow note, and `(gv_r7)` a hollow virga. | Medium (wrong pitches for singers) | S (Flat, Natural and Sharp outlines exist) |

## 3. Neume formation, fusion and shape hints

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| Neumes formed automatically: pes, clivis, torculus, porrectus, climacus, scandicus, salicus, pes quassus, torculus resupinus, porrectus flexus, pes subpunctis, ancus | `src/gabc/gabc-glyphs-determination.c`, `Gabc.tex:556-601` | **supported**, with exsurge's own state machine (`Gabc.ts:1372-1816`; golden cases `two-note-neumes`, `three-and-more-note-neumes`, `neume-variants`) | — | — |
| Porrectus, porrectus flexus and torculus resupinus whose stroke spans a fifth or more, e.g. `(kfk)`, `(lel)` | Stroke glyphs for intervals of 1 to 5 (`porrectus1`–`porrectus5` in `greciliae.sfd`; `ALL_AMBITUS` in `fonts/squarize.py`) | **buggy**. Only `Porrectus1`–`4` exist, and for a wider interval the stroke becomes `GlyphCode.None` (`Neumes.ts:370-386`, "fixme: should we generate an error here?"). `(kfk)` drew only the stem and the last note, so the first two notes vanished. | Medium (silent loss of notes in wide-ranging melismas) | S for a fallback; L for a `Porrectus5` outline |
| Pes quadratum `q` | `notes.l:1447-1450`, `Gabc.tex:569`; separate glyphs (`fonts/squarize.py:1303-1374`) | **missing**. `(fqg)` draws a round pes. `(gfqh)` draws a porrectus where Gregorio draws a clivis and then a square pes. | Low–medium | M (built from existing outlines) |
| Neume fusion: `@` between notes; `@` before a flexus or porrectus to drop the stem | `notes.l:1411-1413`, `:1422-1425`, `Gabc.tex:603-649`, `CHANGELOG.md:94` | **missing**. `@` is skipped and the notes are regrouped automatically. `(h@iw@ji@j@ih~)` became a punctum, a torculus resupinus flexus and a separate liquescent instead of one fused shape. | Medium (needed for melismatic chants in modern editions) | L |
| Automatic fusion `@[ … ]` | `notes.l:994-999`, `Gabc.tex:651-666` | **missing** (as above) | Medium | L (in the same work as `@`) |
| Shape hint `[shape:stroke]`: a clivis drawn as a porrectus-like stroke | `notes.l:1113-1119`, `Gabc.tex:689-700`, `CHANGELOG.md:95` | **missing**. Ignored. | Low | S–M (the stroke is the first part of the `Porrectus1`–`4` outlines) |
| `!`: zero-width break in the chain of notes | `notes.l:1373-1376`, `Gabc.tex:684-686` | **supported** | — | — |

## 4. Signs on notes

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| Punctum mora `.`, `..`, `.0`, `.1` | `notes.l:1432-1434`, `Gabc.tex:744-755` | **supported** (golden case `morae`) | — | — |
| Ictus `'`, `'0`, `'1` | `notes.l:1426-1428`, `Gabc.tex:757-768` | **supported** (golden case `ictus`) | — | — |
| Horizontal episema `_`, with modifiers `_0`–`_5` and bridging (`_2` stops it) | `notes.l:1429-1431`, `Gabc.tex:769-799` | **supported** (golden case `episemata`). Automatic placement above or below follows the same rules for each shape. For example, `(f_g_h_)` puts the episemata under f and g and over h, in exsurge and in Gregorio's scandicus case (`src/gregoriotex/gregoriotex-position.c:759-782`). | — | — |
| Episema tuning `[oh:…]`, `[uh:…]`, and the block forms `[oh:{]…[oh:}]` | `notes.l:1132-1141`, `Gabc.tex:1032-1086` | **missing**. Ignored. | Low | M |
| Automatic ledger lines: which notes and signs get one, and how far it reaches | `src/gabc/gabc-score-determination.c:521-659`, `notes.l:152-162`, `tex/gregoriotex-signs.tex:1566-1650`, `CHANGELOG.md:188`, `UPGRADE.md:83-96` | **partial**. exsurge draws them (golden case `ledger-lines`), but by its own rules. A line takes in one more note on each side, within one neume, and lines less than two staff intervals apart are joined. Gregorio runs a line through the notes of one element by other rules and never joins lines from different elements. It also draws a line through an accidental and under the high bars. exsurge's line reaches half a staff interval past the notes; Gregorio's reaches about one. Phase 12 has examples. | Low–medium | M–L |
| Ledger-line hints `[hl:0/1]`, `[ll:0/1]` (episema placement, short or long stems) | `notes.l:1495-1506`, `Gabc.tex:933-968`, `:1021-1030` | **missing**. Ignored. exsurge already has long and short virga outlines (`Glyphs.ts:960`, `:980`). | Low | S |
| Choral signs `[cs:text]` | `notes.l:793-795`, `Gabc.tex:908-911` | **supported** (`Gabc.ts:2153-2160`) | — | — |
| NABC choral sign `[cn:code]` | `notes.l:796-798`, `Gabc.tex:913-914` | **missing**. Ignored (depends on §13). | Low | — |
| Above-lines text in the notes `[alt:text]` | `notes.l:985-987`, `Gabc.tex:1088-1091` | **supported** (`Gabc.ts:2161-2168`) | — | — |
| Braces `[ob:0;len]`, `[ub:…]`, `[ocb:…]`, `[ocba:…]`, and the `{`/`}` forms | `notes.l:799-948`, `Gabc.tex:916-931`. `len` is any TeX length. | **partial**. The `{`/`}` forms work, even across lines (golden cases `braces`, `brace-across-lines`), but a length is only understood in `mm` (`Gabc.ts:111`). `[ob:0;0.5cm]`, `[ub:1;0.3in]` and `[ocb:1;10pt]` silently draw no brace at all. | Low–medium | S |
| Brace on a bar `,_` | `Gabc.tex:823-830` | **supported** (golden case `dividers`) | — | — |
| Vertical episema on a bar, e.g. `:'` | `Gabc.tex:823-830` | **missing**. Dropped: `(:')` drew a plain bar. | Low | S |
| Square brackets around notes `[[ … ]]` | `notes.l:1142-1147`, `:518-575`, `CHANGELOG.md:196` | **buggy**. `([[gh]])` loses the brackets. `(f[[gh]]i)` also loses the notes g and h, because the bracketed text is taken as an instruction on f, so only `f`–`i` is drawn. | Medium (silent data loss) | S to stop the loss; M to draw the brackets |
| Slurs `[oslur:s;w,h]`, `[uslur:…]`, and the `{`/`}` forms | `notes.l:1123-1131`, `Gabc.tex:1000-1019` | **missing**. Ignored. | Low | M |
| Custom ledger lines `[oll:l;r]`, `[ull:…]`, `{`/`}`, and `[oll:0]` to suppress one | `notes.l:1065-1112`, `Gabc.tex:970-998` | **missing**. Ignored. | Low | M |
| TeX verbatim and macros `[nv:]`, `[gv:]`, `[ev:]`, `[nm1]` and the like | `notes.l:949-984`, `Gabc.tex:1093-1118` | Ignored, which is the right result: these are TeX-only. | — | — |

## 5. Bars and divisions

Gregorio added `` `0 `` and `,0` in 5.1.0, `:?` in 5.1.0, `^` in 5.2.0, and `` `? `` and `,?` in 6.0.0 (`CHANGELOG.md:148-149`, `:139`, `:104`). exsurge's parser stops before them; a comment at `Gabc.ts:1182` reads "other gregorio dividers are not supported yet".

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| Virgula `` ` `` | `notes.l:1216-1218` | **supported** (`Signs.ts:366`) | — | — |
| Virgula on the ledger line above the staff `` `0 `` | `notes.l:1219-1221` | **partial**. Drawn as an ordinary virgula. | Low | S |
| Parenthesized virgula `` `? ``, `` `0? `` | `notes.l:1222-1227`; glyphs `VirgulaParen*` | **partial**. Drawn without parentheses. | Low | S–M (parenthesis outlines, shared with §7) |
| Divisio "minimis" (eighth bar) `^`, `^0` | `notes.l:1228-1233`; glyphs `DivisioMinimis*` | **missing**. Dropped silently, so no bar is drawn and the phrase division disappears. | Medium | S (a short line; no outline needed) |
| Divisio minima `,` | `notes.l:1234-1236` | **supported** (`Signs.ts:139`) | — | — |
| `,0` (on the ledger line above), `,?` and `,0?` (parenthesized) | `notes.l:1237-1245` | **partial**. Drawn as a plain minima. | Low | S–M |
| Divisio minor `;`, maior `:`, finalis `::` | `notes.l:1249-1257` | **supported** (`Signs.ts:153`, `:169`, `:232`) | — | — |
| Dotted divisio maior `:?` | `notes.l:1258-1260`; glyphs `DivisioMaiorDotted*` | **partial**. Drawn as a solid bar. | Low | S |
| Dominican bars `;1`–`;8` and `,1`–`,8` | `notes.l:1246-1248`, `Gabc.tex:818-820` | **supported** (`Signs.ts:202`) | — | — |
| A bar inside a note group, `(fg,h)` | Allowed | **supported** | — | — |
| Text under a bar, `*(;)`, `ij.(:)` | Allowed | **supported** (exsurge treats it as a directive and colours it as a rubric) | — | — |

## 6. Clefs

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| `c1`–`c4`, `f1`–`f4`; `c5` and `f5` on five lines | `notes.l:1194-1199`, `Gabc.tex:847-870` | **supported** (`Gabc.ts:1184-1197`) | — | — |
| C clef with flat `cb1`–`cb5` | `notes.l:1200-1205` | **supported** (`Gabc.ts:1222-1237`) | — | — |
| F clef with flat `fb1`–`fb5` | `notes.l:1200-1205` | **buggy**. Not recognised as a clef, so `(fb3)` is read as the notes f and b, drawn as a clivis with ledger lines (`Gabc.ts:98` only has `cb`). | Medium | S (the outlines exist) |
| Two clefs at once, `c1@c4`, `f3@c4` | `notes.l:1206-1215`; drawn so they don't collide (`Gabc.tex:854-856`) | **partial**. `@` is skipped and the two clefs become separate clefs one after the other. As the first clef of a score only the second one appears (`(c1@c4)` showed only c4), and in the middle of a score both are drawn side by side. | Low | S–M |
| Clef change within a line | Allowed | **supported** (golden case `clef-changes`) | — | — |
| Clef change just before a line break | The new clef goes only at the start of the next line, and the custos is worked out with the new clef (`CHANGELOG.md:187`, `src/gregoriotex/gregoriotex-write.c:4080-4101`). | **partial**. `(c3) (z)` drew the new clef at the end of the first line, before the custos, and again at the start of the next line. | Low–medium | M |
| Hiding the clef (`\gresetclef{invisible}`) | `CmdUser.tex:402-410` | **missing** | Low | S |

## 7. Accidentals

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| Flat `x`, natural `y`, sharp `#` | `notes.l:1297-1328`, `Gabc.tex:481-483` | **supported** (`Gabc.ts:1287-1324`) | — | — |
| Parenthesized `x?`, `y?`, `#?` | `notes.l:1301-1328`; glyphs `FlatParen`, `NaturalParen`, `SharpParen` (`greciliae.sfd:2757`) | **partial**. Drawn without parentheses. | Low | M (parenthesis outlines) |
| Soft `X`, `Y`, `##` | `notes.l:1305-1332`, `Gabc.tex:512-541`, `\gresetalterationeffect` | **supported**. The golden case `soft-accidentals` is Gregorio's own example (`Gabc.tex:529`). | — | — |
| How long a flat lasts | Gregorio doesn't track this, except that soft alterations last to the end of the line or the next note | exsurge resets flats at each new word, following Solesmes practice (`Gabc.ts:746-755`). That only matters for which soft accidentals are shown. | — | — |

## 8. Neume spacing codes

Gregorio's default widths (`tex/gregoriotex-gsp-default.tex:100-122`) relative to `/` are: `/0` = 0.5, `/!` = 1 (unbreakable), `/` = 1, `//` ≈ 1.58, a space ≈ 3.16, and `/[n]` = n. exsurge measures in multiples of `ctxt.intraNeumeSpacing`. Its render gave a gap of 1 unit for `/` and 2 units for both `//` and a space.

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| `/`, `//`, space between neumes | `notes.l:1341-1356`, `Gabc.tex:676-680` | **partial**. All three work, but a space is the same width as `//` (`Gabc.ts:1255-1261` has a `fixme` saying so). In Gregorio a space is twice `//`. | Low–medium (dense melismas look more crowded than in Gregorio) | S (an option; changing the default would alter every snapshot) |
| `!` alone, `!/`, `!//` | `notes.l:1357-1376` | **supported** (golden case `neume-spacing`) | — | — |
| `/0`: half space, kept within the neume | `notes.l:1333-1336` | **partial**. Treated as `/`, so it is full width and the line can break there. | Low | S |
| `/!`: small unbreakable space | `notes.l:1337-1340` | **partial**. Treated as `/`. | Low | S |
| `/[n]`, `!/[n]`: a space of n times `/`, which may be negative | `notes.l:1051-1064`, `Gabc.tex:681-683` | **missing**. Treated as `/`, so the factor is ignored and a negative space (moving back) is impossible. | Low–medium | S–M |
| `! ` before a space: a non-breaking large space | `notes.l:1369-1372`, `Gabc.tex:684-686` | **buggy**. The space is lost and the notes touch: `(f! g)` placed g at the same distance as `(f!g)`. | Low | S |

## 9. Line breaks and custos

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| `z` (justified break), `Z` (ragged break) | `notes.l:1170-1173`, `:1182-1185`, `Gabc.tex:886-906` | **supported** (`Gabc.ts:1239-1244`) | — | — |
| `z+`, `Z+`: break with a custos | `notes.l:1174-1177`, `:1186-1189` | **supported**, in effect: the `+` is ignored, but exsurge always draws a custos at a break. | — | — |
| `z-`, `Z-`: break without a custos | `notes.l:1178-1181`, `:1190-1193` | **missing**. The custos is still drawn. | Low–medium | S |
| `z0`, `g+`: a custos inside the line | `notes.l:1158-1169`, `Gabc.tex:872-880` | **supported** (`Gabc.ts:1245-1247`, `:1280-1286`) | — | — |
| `[nocustos]` | `notes.l:1164-1166`, `Gabc.tex:881-884` | **missing**. Ignored. | Low | S |
| Automatic custos at the end of a line | Switched on and off with `\greseteolcustos{auto/manual}` (`tex/gregoriotex-main.tex:1422-1456`) | **partial**. Always on; there is no setting to turn it off. | Low | S |
| `<nlba>…</nlba>`: no line break in this area (in the lyrics or the notes) | `score.l:251-256`, `notes.l:988-993`, `Gabc.tex:286-288`, `:901-904` | **buggy**. Inside the notes, `<` and `>` become liquescence marks and `n l b a` become notes: `(fg<nlba>hg …)` drew made-up notes. In the lyrics, the tags are printed and the word structure breaks (§11). | Medium | S to parse; M for the layout |
| A `z` at the very end of a score | Ignored with a warning (`Gabc.tex:906`) | **supported**: no extra line is drawn | — | — |

## 10. Zero-width groups `{}` ("polyphony")

Gregorio has no polyphony. `src/struct.h:667-672` still has a "voices" array for polyphonic scores, but it is left over from early versions and now holds the NABC lines. Inside notes, Gregorio's lexer turns `{…}` into a zero-width box: `\hbox to 0pt{…\hss}` (`notes.l:1148-1157`, not documented in `Gabc.tex`). That is how GABC files stack notes vertically.

| Feature | Gregorio | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| `{…}` inside notes, e.g. `(f{h}g)`, `({hj}g)` | Zero-width box (`notes.l:1148-1157`) | **supported** (`Gabc.ts:1325-1338`; golden case `zero-width-groups`) | — | — |
| True multi-voice polyphony | Not supported | Not supported | — | — |

## 11. Lyric markup and syllable controls

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| `<b>`, `<i>`, `<sc>`, `<ul>`, `<c>` | `score.l:257-292`, `Gabc.tex:254-270` | **supported** (`Drawing.ts:990-999`, `:2749`) | — | — |
| `<tt>` (teletype) | `score.l:263-268` | **buggy**. Printed literally: `<tt>tt</tt>`. | Low | S |
| `<e>` (elision) | Typeset in the `elision` style, and treated as consonants when finding the vowel to centre on (`Gabc.tex:279-281`, `:391-394`; `src/characters.c:297-301`) | **partial**. Styled italic at 90% size (`Drawing.ts:998`), but with none of the elision behaviour. exsurge's own rule treats a syllable ending in `</i>` as an elision (`Gabc.ts:1040-1043`). | Medium (spacing and centring in hymns) | S–M |
| `<sp>…</sp>` special characters | Defaults (`Gabc.tex:345-381`, `tex/gregoriotex-symbols.tex:216-245`): `ae`, `oe`, `'ae`, `'oe`, `'æ`, `'œ`, `A/`, `R/`, `V/`, `*`, `+`, `-` (zero-width hyphen), `\`, `&`, `#`, `_`, `ot`, `ut`, `dt` (ties) and `~`. Users can add their own. | **partial**. The ligatures, accented ligatures, `A/`, `R/`, `V/` (drawn as letters in the "Exsurge Characters" font) and `~` work (`Drawing.ts:2749`). The rest are printed with their tags, e.g. `<sp>*</sp>`, `<sp>ot</sp>`, `<sp>unknown</sp>`. `<sp>_</sp>` collides with `_italic_` markup and prints `<sp></sp>`. | Medium | S |
| `<v>…</v>` verbatim TeX | `score.l:322-335` | **partial**. `\grecross`, `\greextra{…}` and accented ligatures are mapped to characters (`Drawing.ts:2750`). Any other TeX is printed as it stands, e.g. `\textit{x}`. | Low | S (drop unknown commands) |
| `<alt>…</alt>` above-lines text | `score.l:342-349`, `score.y:1115-1119` | **supported**. One small bug: markup inside loses the spaces between tags, so `<alt><b>Bold</b> <i>it</i></alt>` renders "Boldit". | Low | S |
| `<eu>…</eu>` (euouae area) | No line break inside, and no custos before it by default (`score.l:350-355`, `tex/gregoriotex-main.tex:1442-1469`, `:1742-1785`) | **buggy**. The tags are printed: "&lt;eu&gt;E", and "&lt;/eu&gt;" in red as a directive under the next bar. | **High** (the psalm-tone ending of almost every office antiphon) | S to parse; M for the behaviour |
| `<nlba>…</nlba>` in lyrics | No line break in this area | **buggy**. The tags are printed, and the closing tag joins the next word: `son.(f)</nlba> Chri(f)` gave "son.-" with a hyphen, then "&lt;/nlba&gt; Chri" as a middle syllable. | Medium | S to parse; M for the behaviour |
| `<pr>`, `<pr:0.5>` (protrusion into the margin) | `score.l:368-384`, `Gabc.tex:289-294` | **buggy**. Printed literally. | Low | S to parse; M for the behaviour |
| `<clear>`, `<clear/>` | Text may not reach back into the previous syllable's notes (`score.l:365-367`, `tex/gregoriotex-syllable.lua:430-454`) | **buggy**. Printed literally. | Low | S to parse; M for the behaviour |
| `<asc>` | **Does not exist** in Gregorio 6.2 (no match in `src/`, `tex/` or `doc/`) | Printed literally, as Gregorio would print it | — | — |
| `$` escape: `$(`, `$$` | `score.l:240`, `Gabc.tex:247-250`, `CHANGELOG.md:114` | **buggy**. `a$(b$)(f)` ends the syllable at `$(` and reads `b$` as a note, so a note b is drawn under the staff. `$$` and `$<` are printed literally. `__syllablesRegex` has no escape handling (`Gabc.ts:95`). | Low–medium | S |
| `~` lyric tie | An undertie by default; overtie and double tie can be configured (`score.l:237-239`, `CHANGELOG.md:48`, `tex/gregoriotex-main.tex:1793-1833`) | **partial** (a conflict). exsurge turns `~` into a space (`Gabc.ts:738-741`): `De~us` renders "De us". | Low | S (an option) |
| Trailing `-`: forced hyphen | `score.y:1121-1167` | **supported** (`Gabc.ts:1018-1027`; golden case `lyric-connectors`) | — | — |
| Trailing `,` `;` `:` `.` protruding automatically | `score.y:1140-1149`. All four protrusion factors default to 0 (`tex/gregoriotex-gsp-default.tex:66-77`), so nothing changes unless configured. | No difference by default | — | — |
| Directives `*`, `+` | Gregorio prints `\GreStar` and `\GreDagger` | exsurge detects directives (`*`, `†`, `ij.`, numbers) and colours them as rubrics (`Gabc.ts:1046`, `Drawing.ts:3971`). This is an exsurge addition (§16). | — | — |

## 12. Centring, translations, elisions and hyphens

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| Centring on the vowel | The default (`\gresetlyriccentering{vowel}`, `Gabc.tex:319-335`, `tex/gregoriotex-syllable.tex:747-815`) | **supported**. Latin rules by default (`Text.ts:92`). | — | — |
| Other centring modes: `syllable`, `firstletter` | `\gresetlyriccentering` | **partial**. Centring over the whole syllable comes only with a Language whose `centerNeume` is set (English, `Text.ts:61-66`). There is no `firstletter` mode. | Low | S |
| Vowel rules for each language | Latin, English, Church Slavonic (with Polish, Czech and Slovak as aliases) and Hungarian, plus user rules in `gregorio-vowels.dat` (`Gabc.tex:383-400`, `:1121-1227`; `tex/gregorio-vowels.dat:30-130`) | **partial**. Latin, English and Spanish (`Text.ts:707-711`). There is no Church Slavonic, no Hungarian and no data-driven rule file. | Low–medium | M |
| Forcing the centre with `{ }`: `f{i}re`, `{Ky}ri` | `Gabc.tex:334-335` | **supported** (`Gabc.ts:902-998`; golden case `lyric-centering`) | — | — |
| Translation `[…]`, and `[/]` to centre it between two syllables | `score.l:356-364`, `score.y:1077-1113`, `Gabc.tex:337-343` | **supported** (golden cases `above-lines-text-and-translations`, `long-translation`). Styles inside work. | — | — |
| Centring a translation under its syllable | `\gresettranslationcentering{left/center}` | **partial**. Left-aligned only. | Low | S |
| Elision with `<e>` | See §11 | **partial** | Medium | S–M |
| Automatic hyphens between syllables, and at the end of a line | A hyphen is added whenever the texts don't touch (`maximumspacewithoutdash` is 0); the end-of-line hyphen can protrude (`tex/gregoriotex-syllable.lua:389-427`, `tex/gregoriotex.lua:1085-1113`) | **supported**, with exsurge's own connector rules (`ChantLine.ts:1386-1399`, `:1709-1719`) | — | — |
| A first syllable that the initial empties, e.g. `A(…)ve` | A hyphen is forced by default (`\gresetemptyfirstsyllablehyphen`, `src/gregoriotex/gregoriotex-write.c:3765-3788`) | **supported**. With a drop cap, `A(f)ve(g)` draws the initial A and a lone hyphen under f. There is no setting to turn the hyphen off. | — | — |

## 13. NABC (St. Gall and Laon neumes)

Gregorio has supported NABC since 4.0.0, the Laon font since 5.0.0, and a second NABC line below the staff since 6.2.0 (`CHANGELOG.md:555`, `:197`, `:51`). The C program splits each note group on `|`, keeps the NABC strings without parsing them, and passes them to TeX. Lua code parses them and puts the neumes together from glyphs that are named after the NABC strings themselves (`tex/gregoriotex-nabc.lua:305-479`).

| Feature | Gregorio (syntax, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| `nabc-lines: N;` with `\|` inside a note group: `(gabc\|nabc1\|nabc2\|gabc…)`, where `\|\|` skips a voice and `$\|` escapes the bar | `score.l:389-396`, `score.y:648-683`, `:862-919`, `NabcRef.tex:161-175`. Using `\|` without the header is a fatal error. | **buggy**. `\|` is exsurge's inclinatum-stem modifier (`Gabc.ts:1947-1949`), and the NABC letters are read as pitches. `(g\|vi)` draws a virga g and a note i; `(gh\|pe)` draws a torculus g–h–e; `(hg\|cl)` adds a pes c–l. This happens with or without the `nabc-lines` header. | **High** for anyone with St. Gall or Laon transcriptions, because the output is garbage | S to separate and keep the strings |
| The NABC language: 29 St. Gall base neumes (`vi pu ta gr cl pe po to ci sc pf sf tr st ds ts tg bv tv pr pi vs or sa pq ql qi pt ni`); modifiers `S G M - > ~`; a variant digit; `h` plus a pitch; `!` fusion; `su`/`pp` subpunctis and prepunctis; `ls` significative letters in 9 positions; Laon `lt` Tironian notes; `/`, `//` and `` ` `` spacing | `NabcRef.tex:177-500`, `tex/gregoriotex-nabc.lua:120-303` | **missing** | High for that audience | L (port about 250 lines of Lua) |
| Fonts: gregall (602 outlines), gresgmodern (523) and grelaon (571), all OFL 1.1, chosen with `\gresetnabcfont` | `fonts/gregall.sfd:2-6`, `tex/gregoriotex-nabc.tex:42-56` | **missing** (no outlines) | — | XL (glyph conversion) |
| Layout: voice 1 above the staff, voice 2 below it; each string hangs from the left edge of its element's first glyph and widens the syllable if it overflows; rows pushed out for high and low notes; `\gresetnabcalignment`, visibility controls | `tex/gregoriotex-main.tex:708-845`, `tex/gregoriotex-syllable.tex:441-470`, `tex/gregoriotex-gsp-default.tex:364-390` | **missing** | — | L |

There are about 1,700 outlines across the three fonts. The glyph names are NABC strings, and lookup tries the longest precomposed combination first (up to three significative letters, in any order) before falling back to placing letters on a 3×3 grid (`tex/gregoriotex-nabc.lua:339-461`). Malformed NABC doesn't raise an error; the PDF shows the literal text "ERR" (`:313`, `:322`, `:332`).

## 14. Typesetting and layout

| Feature | Gregorio (control, reference) | exsurge status and evidence | User impact | Size |
|---|---|---|---|---|
| Initial on one line | `\gresetinitiallines{1}`, the default (`tex/gregoriotex-syllable.tex:1689-1701`) | **supported** (`useDropCap`; `DropCap` at 4× the lyric size, `Drawing.ts:303-307`, `:4103`) | — | — |
| No initial | `\gresetinitiallines{0}` | **supported** (`useDropCap = false`) | — | — |
| Initial over 2 or more lines | `\gresetinitiallines{n}` for any n since 6.1.0 (`CHANGELOG.md:96`). The first n lines are indented and the initial is dropped across them (`tex/gregoriotex-main.tex:387-415`, `tex/gregoriotex.lua:643-715`). | **missing**. Only one-line initials. | Medium (common in printed graduals) | L |
| Placing the initial: anchor, position, raise, minimum and manual width, an illuminated (image) initial | `\gresetinitialanchor`, `\gresetinitialposition`, `initialraise`, `minimalinitialwidth`, `\greillumination` (`CmdUser.tex:908-935`, `tex/gregoriotex-main.tex:307-365`) | **partial**. Placed automatically, with the padding in `ctxt.textStyles.dropCap`. There is no image initial. | Low | M |
| Initial at least as wide as the annotation | `tex/gregoriotex-main.tex:350-365` | **supported** (`ChantLine.ts:826-840`) | — | — |
| `firstsyllableinitial`, `firstsyllable` and `firstword` styles | `\grechangestyle{firstsyllable…}` (`src/characters.c:1338-1380`) | **missing** (no such text styles; `Drawing.ts:218-232`) | Low–medium | M |
| Annotation of one or two lines (up to four in exsurge) | `\greannotation`, the `annotation` header (`tex/gregoriotex-main.tex:451-547`) | **supported** through the API (`Annotation`, `Annotations`, `Drawing.ts:4241`, `:4265`; golden cases `annotations-with-drop-cap`, `tall-annotations-with-drop-cap`). The header is not used (§1). | — | S |
| Mode line | `mode` headers and `\gresetmodenumbersystem` | **missing** | Medium | S |
| Commentary (flush right above the score) | `\grecommentary` (`tex/gregoriotex-main.tex:596-633`) | **partial**. `titles.setTextRight` does the same job (`Titles.ts:165`); the `commentary` header is not used. | Low | S |
| Justification | TeX paragraph | **supported** (`ChantLine.ts:1681`) | — | — |
| Last line: `ragged`, `justified`, `trimmed` | `\gresetlastline` (`tex/gregoriotex-main.tex:1118-1134`) | **partial**. Ragged (the default), and something like `trimmed` with `score.extendLastSystemStaffLines = false` (`ChantLine.ts:1425`). There is no `justified`. | Low | S |
| How lines are broken | Knuth-Plass over the whole score, as one TeX paragraph, with penalties (end of word −100, end of syllable −50, after a bar −200, and so on), tolerance 9000 and looseness −1 (`tex/gregoriotex-gsp-default.tex:26-63`) | **partial**. exsurge fills lines greedily, squeezing within `condensingTolerance`, with minimums for the last line (`ChantLine.ts:900-1200`). The two make different line breaks. | Medium (lines broken differently from the printed books) | XL |
| Syllables that don't break | A syllable of fewer than 10 notes is never split, and a split keeps 4 notes together at each end (`\gresetunbreakablesyllablenotes`, `tex/gregoriotex-syllable.tex:883-894`) | **partial**. exsurge can break between the neumes of a syllable wherever it allows a break (`Gabc.ts:1420-1426`). | Low–medium | M |
| Extra space for notes above or below the staff | Worked out per line (`\gresetlineheightexpansion{variable}`, `tex/gregoriotex.lua:850-868`) | **supported**: each line's bounds, with `minSpaceAboveStaff` and `minSpaceBelowStaff`. There is no `uniform` mode. | — | — |
| Above-lines text | `<alt>`, `[alt:]` | **supported** | — | — |
| Staff lines: 2 to 5, line thickness, colour | `staff-lines`, `\grechangestafflinethickness`, `\gresetlinecolor` | **supported** through the API (`staffLineCount`, `staffLineColor`, `setStaffHeight`) | — | — |
| Hiding or phantoming lyrics, notes, clef, lines, translation, alt text | `\gresetlyrics`, `\gresetnotes`, `\gresetclef`, `\gresetlines`, … (`CmdUser.tex:946-972`) | **missing** | Low | M |
| Text styles | `\grechangestyle` with 20 style names (`CmdUser.tex:802-838`) | **partial**. `ctxt.textStyles` covers lyric, translation, al, annotation, dropCap, choralSign and the titles (`Drawing.ts:218-232`). There are no elision, mode line, commentary or first-syllable styles. | Low | S–M |
| Other neume styles: greciliae, gregorio and granapadano fonts; medicaea, hufnagel and mensural glyph styles; Dominican (`op`) shapes | `\gresetgregoriofont`, `\gresetglyphstyle` (`CmdUser.tex:440-628`) | **missing**. There is one square-note style. greextra holds codepoints for some Medicaea, Hufnagel and Mensural clefs and custodes (`greextraGlyphs.ts`), but nothing uses them for neumes. | Low | XL |
| Spacing configuration files (`gsp-*.tex`) | `\greloadspaceconf`, `\grechangedim` | exsurge has its own `ChantContext` settings (`interSyllabicMultiplier`, `intraNeumeSpacing`, …) | — | — |

## 15. Where exsurge's own syntax collides with Gregorio's

These collisions decide how to fix several gaps without breaking existing exsurge content. Each fix in the plan keeps exsurge's meaning wherever the Gregorio meaning can't be told apart from it.

| Syntax | Gregorio meaning | exsurge meaning | Proposed resolution |
|---|---|---|---|
| `\|` inside notes | NABC separator, allowed only with `nabc-lines` (`score.y:870-876`) | Stem on an inclinatum (`G\|FE`, `Gabc.ts:1947-1949`; golden case `inclinata-with-stems`) | Treat `\|` as the NABC separator only when the header sets `nabc-lines` greater than 0. Otherwise keep the exsurge meaning. |
| A digit after a capital pitch: `G0`, `G1`, `G2` | Which way the inclinatum leans | `0`/`9` nudge the note ⅓ step down or up (`Gabc.ts:2290-2307`) | Apply the nudge only to lowercase pitches and custodes (the golden case `staff-position-offsets` uses only lowercase). After a capital, read `0`/`1`/`2` as the leaning. |
| `o<`, `o>` | In the default rules, `<` and `>` are dropped from an oriscus (`src/struct.c:433-438`) | Orientation up or down (`Gabc.ts:2043-2065`) | Keep `o<` and `o>` as aliases and add `o0`/`o1` (and `O0`/`O1`). |
| `~` in lyrics | Lyric tie (an undertie) | Non-breaking space (`Gabc.ts:738-741`) | Add a `ctxt.lyricTie` setting that defaults to the current behaviour. |
| `%` in lyrics | Comment to the end of the line | `%small caps%` markup (`Drawing.ts:1005`) | Treat `%` as a comment unless a closing `%` follows before the end of the line. The golden case `lyric-markup` has `%small%(g)`, which this keeps as markup. |
| `*`, `_`, `^` in lyrics | Literal characters (`*` prints a star) | `*bold*`, `_italic_` and `^red^` markup | Leave as they are and document. Only `<sp>_</sp>` needs fixing (§11). |
| A syllable ending in `</i>` | Just italic | An elision (`Gabc.ts:1040-1043`) | Also recognise `<e>`. Keep the `</i>` rule, behind a setting. |
| `\|` in lyrics | A literal character | Separates lyric lines (`Gabc.ts:887-888`) | No collision in practice; keep it. |

## 16. What exsurge has that Gregorio lacks

- Several lyric lines per syllable, for verses: `Ky|Chri|Ky(f)` (`Gabc.ts:887-888`; golden case `multiple-lyric-lines`).
- Nudging a note ⅓ step down or up with `f0`/`f9` (`Gabc.ts:2290-2307`), meant for use with the Chi-Rho clef only.
- Stems on inclinata, `G|FE` (`Gabc.ts:1947`).
- Treble and Chi-Rho clefs, `treble2`, `treble-2`, `xp3` (`Chant.ts:396`, `:444`).
- Oriscus orientation as `o<`/`o>`.
- Markdown-like lyric markup (`*bold*`, `_italic_`, `^red^`, `%small caps%`), plus `<u>`, `<br>` and `<font family fill class>` (`Drawing.ts:1001-1006`, `:2749`).
- Directives detected automatically and coloured as rubrics (`Gabc.ts:1046`, `Drawing.ts:3971`), and a rubric colour setting.
- Text-only syllables that flow onto extra lines (`ChantLine.ts:301`), and minimums for the last line.
- A titles block: supertitle, title, subtitle, and left and right text (`Titles.ts:44`).
- Editing support: incremental re-layout from changed GABC (`Gabc.updateMappingsFromSource`, `Gabc.ts:432`), selection, an insertion cursor, and note ids.
- Output as an SVG string, SVG DOM nodes, a React-style tree or a canvas, with pagination and asynchronous layout.
- Round-tripping the header with its comments (`GabcHeader.toString`, `Gabc.ts:208-244`).
- Spanish vowel rules (`Text.ts:404`).

---

# Part 2. Implementation plan

The phases are in priority order: corruption first, then commonly used notation, then typesetting refinements, then the large features. Each phase is meant to be one PR, or a few PRs where it says so.

**Conventions for every phase:**

- **Golden cases.** Add new cases to `featureCases` in `test/golden/cases.ts`, with outputs `["svg", "tree", "node", "canvas"]`. Generate their snapshots with `npx vitest -u`, review them, and commit them under `test/golden/__snapshots__/<name>/`. `test/bundle.test.ts` also checks the built bundles against the same snapshots, so the PR should run the full `npm test`.
- **Existing cases.** Prefer new cases to editing existing ones, so that the diff shows only what was meant to change. Where an existing snapshot has to change, the item says which one.
- **Parsing-only tests.** Put header and other tests that don't render in plain unit tests: `test/core.test.ts`, or a new `test/gabcHeader.test.ts`.
- **Glyph table.** Adding an outline to `Glyphs.ts` changes the glyph-table snapshot (`test/golden/__snapshots__/tables/glyphs.json`). That change is expected.
- **Licence of new outlines.** Gregorio's fonts are under the SIL Open Font License 1.1. Greciliae is itself adapted from Caeciliae, which is by exsurge's author (`fonts/fonts_README.md`, `greciliae.sfd:6`). Outlines taken from Gregorio's `.sfd` files keep the OFL: put them in a separate module that carries the OFL notice, and don't use the reserved font names. The alternative is to draw them anew in the style of exsurge's existing outlines. Decide this before Phase 6.

## Phase 1. Stop corrupting valid Gregorio GABC

**Goal.** Every construct in Part 1 marked **buggy** should either render correctly or be ignored harmlessly. There are two exceptions: cavum inside neumes, which needs Phase 6's outlines, and `! ` before a space, which is item 2.6. This phase is almost all parser work, and it needs no new outlines.
**Size.** M overall. The items can go in one PR or two: headers and lyrics in one, notes in the other.

| # | Item | Where | Parser work | Layout work | Glyphs | Golden cases |
|---|---|---|---|---|---|---|
| 1.1 | Header: multi-line `;;` values, trailing whitespace, `%%+` | `Gabc.ts:118-206` | Collect lines until `;;`. Trim after `;`. Accept `^%%+\s*$` as the end of the header. `toString()` writes multi-line values back with `;;`. | none | — | unit tests (`GabcHeader`) |
| 1.2 | `%` comments in the notation section | `Gabc.createMappingsFromSource` and `updateMappingsFromSource` (`Gabc.ts:259-284`, `:432`) | Replace `%…` up to the end of the line with spaces of the same length, so source indices don't move, unless a second `%` closes it on the same line (§15). Also drop the line-end space after a comment. | none | — | `comments-in-notation` |
| 1.3 | `$` escapes in lyrics (`$(`, `$)`, `$$`, `$<`) and `$\|` in notes | `__syllablesRegex` (`Gabc.ts:95`), `makeLyric` (`:1007`) | Make the syllable regex skip `$.`, and remove the `$` when building the lyric text. | none | — | `dollar-escapes` |
| 1.4 | NABC separation | `createMappingsFromSource` (`Gabc.ts:260-261` currently throws the header away) and `parseNotations` | Parse the header there and keep `nabcLines` (on the context or a parse-options object). With `nabcLines > 0`, split each group on unescaped `\|` following Gregorio's state machine (`score.y:862-919`). Keep the GABC parts, and store the NABC strings on the first notation of the preceding GABC part (`notation.nabc = string[]`). | none yet (see Phase 10) | — | `nabc-separated` (renders as plain square notes) |
| 1.5 | Note tokens that currently eat notes or produce wrong ones | `__notationsRegex` (`Gabc.ts:98`), `createNoteFromData` (`:1819-2135`) | Treat `[[` and `]]` as tokens of their own and record bracket starts and ends on notes, for Phase 7. Treat `<nlba>` and `</nlba>` inside notes as tokens and record them, for Phase 2. Accept and record `@`, `@[` and `]` (Phase 8), `=` (Phase 5), `q` and `W` (Phases 5 and 6), `?` after an accidental, `6`–`8` after `r`, and `VV`/`VVV` (Phase 5). | none | — | `gregorio-note-tokens` (checks that no notes are lost: `(f[[gh]]i)`, `(fg<nlba>hg</nlba>ih)`) |
| 1.6 | Musica ficta `r6`/`r7`/`r8` | `createNoteFromData` (`Gabc.ts:1952-1994`); `Markings.Accent` positioning | Map them to accent-like markings that use the Flat, Natural and Sharp glyphs. | Place them above the staff like `r1`–`r5`, at a reduced size. | Flat, Natural and Sharp exist (`Glyphs.ts:418`, …) | `musica-ficta` |
| 1.7 | F clef with a flat, `fb1`–`fb5` | `Gabc.ts:98`, `:1222-1237` | Handle it like `cb`. | none | FaClef and Flat exist | `flat-fa-clefs` |
| 1.8 | Digits after a capital pitch: `G0`/`G1`/`G2` | `getStaffPositionOffset` / `setStaffPositionAndOffset` (`Gabc.ts:2290-2307`), `createNoteFromData` | Nudge only lowercase pitches and custodes. After a capital, record `0`/`1`/`2` as the leaning (drawn in Phase 6; until then the same diamond, at the right pitch). | none | — | `inclinatum-digits` |
| 1.9 | Lyric control tags printed as text: `<eu>`, `<nlba>`, `<pr>`, `<pr:n>`, `<clear>` | `createMappingFromWord` (`Gabc.ts:719-874`) and `makeLyric` | Remove the tags before splitting into words, and record their effects on the notation or lyric (`euouae`, `noLineBreak`, `protrusion`, `clear`). Their behaviour comes in Phases 2 and 4. `</nlba>` and `</eu>` must not join two words. | none | — | `gregorio-lyric-controls` |
| 1.10 | `<tt>`, and the full set of `<sp>` specials | `Drawing.ts:990-999`, `:2749`, `specialCharMap` (`:980-988`) | Add `tt` (monospace) to the tag list. Use a configurable table: `*`, `+` → †, `-` → nothing, `\`, `&`, `#`, `_`, `%`, `ot` → ⁀, `ut` → ‿, `dt`, and for an unknown special print its contents without the tags. | none | — | `gregorio-special-characters` |
| 1.11 | A porrectus stroke wider than a fourth, which is currently not drawn | `NeumeBuilder.withPorrectusSwash` (`Neumes.ts:347-392`) | — | Until Phase 6 adds a `Porrectus5` outline, draw the first two notes as puncta joined by a `NeumeLineVisualizer`, so that no notes are lost. | existing outlines | `porrectus-wide` |

**Risks to existing output.**

- 1.2: the `lyric-markup` golden case must not change, because its `%small%` is closed on the same line.
- 1.3: text that contains a literal `$` will now need `$$`.
- 1.4: the `inclinata-with-stems` case has no header and must stay as it is.
- 1.8: anyone who used `G0` as a nudge loses that. No golden case does.
- 1.10: the existing `special-characters` case uses `<sp>V/</sp>`, `<sp>'ae</sp>` and the like, which stay as they are. Check that `special-character-settings` (custom `specialCharMap`) still overrides the defaults.

## Phase 2. Bars, line-break controls, custos and spacing codes

**Goal.** Cover the divisions and the layout controls that Gregorio files use routinely.
**Size.** M.

| # | Item | Where | Parser work | Layout work | Glyphs | Golden cases |
|---|---|---|---|---|---|---|
| 2.1 | Divisio minimis `^`, `^0` | `Signs.ts` (a new divider, like `QuarterBar` at `:139`); `Gabc.ts:98`, `:1149-1181` | Add the tokens. | A short stroke through the top line, drawn with `DividerLineVisualizer` (`Drawing.ts:1556`). | none needed | `bar-variants` |
| 2.2 | Virgula and minima on the ledger line above, `` `0 ``, `,0` | `Signs.ts:139`, `:366` | Add the tokens. | Move the bar up one space. | none | `bar-variants` |
| 2.3 | Dotted bar `:?` | `Signs.ts:169` | Add the token. | A dashed line made of short rectangles, the same on canvas and SVG. | none | `bar-variants` |
| 2.4 | Vertical episema on bars, `:'`, `;'`, `::'`, `,'` | the Divider classes | Allow `'` after a bar. | An ictus above the bar. | VerticalEpisema exists | `bar-variants` |
| 2.5 | `z-`, `Z-`, `z+`, `Z+`, `[nocustos]`, and a setting for the end-of-line custos | `ChantLineBreak` (`Chant.ts:519`), the custos logic in `ChantLine.ts:900-960` and `:1229-1241` | Parse the suffixes. Put `custos: "auto"/"force"/"none"` on the break. Record `[nocustos]` on the note. Add `ctxt.eolCustos: "auto"/"manual"`. | Leave out the end-of-line custos as asked. | — | `line-break-custos-control` |
| 2.6 | Spacing codes `/0`, `/!`, `/[n]`, `!/[n]`, `! ` | `parseNotations` (`Gabc.ts:1250-1279`) | `/0` is 0.5× and unbreakable, `/!` is 1× and unbreakable, `/[n]` is n×, and `! ` is an unbreakable space. | Trailing space must be allowed to go negative for `/[-1]`. Keep the neume's bounds sensible. | — | `gregorio-spacing-codes` |
| 2.7 | Width of a space between neumes, as an option | `Gabc.ts:1255-1261` | Add a `ctxt.neumeSpaceMultipliers` table whose defaults are today's values. | — | — | `neume-spacing-gregorio-widths` (uses the Gregorio ratios) |
| 2.8 | `<nlba>` and `<eu>` behaviour | `ChantLine.buildFromChantNotationIndex` (`ChantLine.ts` about `:900-1200`) | Uses the flags from Phase 1. | No break inside the area. Leave out the custos just before `<eu>` (Gregorio's default). | — | `no-line-break-areas` (narrow width), `euouae` |
| 2.9 | Clef change just before a forced break | `ChantLine.ts` (where lines end), the custos at `:1229-1241` | — | Put the new clef only at the start of the next line, and work out the custos with the new clef (`src/gregoriotex/gregoriotex-write.c:4080-4101`). | — | `clef-change-before-break` |

**Risks to existing output.** 2.9 could change `clef-changes` (width 300) and the `line-break-edge-cases-*` cases if one of their clef changes lands at a line end, so check those snapshot diffs. 2.6 and 2.7 must leave `neume-spacing` unchanged. 2.8 changes line breaks only for input that uses the new tags.

## Phase 3. Settings from the header, and two-clef forms

**Goal.** A GABC file with a header renders the way Gregorio would render it, without the client having to wire anything up.
**Size.** S–M.

| # | Item | Where | Parser work | Layout work | Glyphs | Golden cases |
|---|---|---|---|---|---|---|
| 3.1 | Opt-in application of the header: a new `Gabc.applyHeader(score, ctxt, header, options)` | `Gabc.ts` (new), `Chant.ts:610`, `:639` | `staff-lines` → `staffLineCount`. `annotation` lines → `Annotations`. With no annotation, `mode`, `mode-modifier` and `mode-differentia` → an annotation, using a number system from `ctxt.modeNumberSystem` (roman lowercase, roman uppercase or arabic). `language` → `ctxt.defaultLanguage` (by name or ISO code). Optionally, the old `initial-style` and `centering-scheme`. | Annotation layout as it is now | — | `header-settings`, `header-mode-annotation` |
| 3.2 | Two clefs, `c1@c4` | `Clef` (`Chant.ts:233`), `Gabc.ts:98`, `:1184-1237` | Parse `@[cf]b?[1-5]` as a second clef on the same notation. | Draw both, staggered so they don't collide. Pitches follow the primary clef. | DoClef and FaClef exist | `two-clefs` |
| 3.3 | Hiding the clef | `Clef.draw*` | — | `ctxt.clefVisibility` | — | (unit test) |

**Risks to existing output.** Only clients that opt in see any change. Make 3.1 opt-in, so that apps which already build an annotation from the header don't get two. The existing `header` golden case doesn't call it, so it stays unchanged.

## Phase 4. Lyric semantics

**Goal.** Give the Gregorio lyric controls, elisions and special text their proper behaviour.
**Size.** M. Can be split: 4.1–4.3 in one PR, 4.4–4.8 in another.

| # | Item | Where | Parser work | Layout work | Glyphs | Golden cases |
|---|---|---|---|---|---|---|
| 4.1 | `<e>` as an elision | `makeLyric` (`Gabc.ts:1007-1061`); `Language.findVowelSegment` with its existing `ignore` ranges (`Text.ts:19-59`) | A syllable ending in `<e>…</e>` sets `elidesToNext`. Leave `<e>` text out of the vowel search. Add a setting `ctxt.italicMeansElision` (default `true`) for the `</i>` rule. | Spacing between words for elisions, as it works now | — | `elision-tags` |
| 4.2 | `<clear>` | `Lyric` (`Drawing.ts:3652`), the overlap logic in `ChantLine` | flag (from Phase 1) | The text doesn't start before the previous notation's right edge. | — | `lyric-clear` |
| 4.3 | `<pr>` and `<pr:f>` protrusion | `ChantLine` line-end fitting | flag | The last lyric on a line may run up to f × its width past `staffRight`. Gregorio's default automatic factors are 0, so there is no default change. | — | `lyric-protrusion` |
| 4.4 | Lyric tie `~` | `Gabc.ts:738-741` | `ctxt.lyricTie: "space"/"undertie"/"overtie"/"doubletie"`, defaulting to `"space"` | — | — | `lyric-tie` |
| 4.5 | First-syllable and first-word styles | `TextTypes` (`Drawing.ts:218-232`), `generateDropCap` (`:3937-3960`) | — | Apply `firstSyllableInitial`, `firstSyllable` and `firstWord` styles to the first lyric. | — | `first-syllable-styles` |
| 4.6 | More vowel rules, and a `firstletter` centring mode | `Text.ts` | New `Language` classes for Church Slavonic and Hungarian, ported from `tex/gregorio-vowels.dat:30-130`. Optionally a data-driven `Language` that reads that file's format. | — | — | `language-hungarian`, `language-church-slavonic` |
| 4.7 | `<v>`: drop unknown TeX commands | `Drawing.ts:2785-2817` | Remove `\name{…}` that has no mapping, instead of printing it. | — | — | `verbatim-unknown` |
| 4.8 | `<alt>` losing spaces between tags; translation centring option | `AboveLinesText` (`Drawing.ts:4024`), `TranslationText` (`:4060`) | — | Keep the spaces; add `ctxt.translationCentering`. | — | `alt-text-markup`, `translation-centered` |

**Risks to existing output.** 4.1 may change the existing `lyric-markup` snapshot, whose `<e>son</e>` ends a word. If its spacing changes, review the change as a correction. 4.4 and 4.8 are opt-in. 4.6 adds languages without changing Latin, English or Spanish.

## Phase 5. Note shapes built from existing outlines

**Goal.** Close the shape gaps that can be drawn by combining exsurge's existing outlines with its line visualizers: `NeumeLineVisualizer`, `VirgaLineVisualizer` and `LineaVisualizer` (`Drawing.ts:1630`, `:1803`, `:1859`).
**Size.** M–L.

| # | Item | Where | Parser work | Layout work | Glyphs | Golden cases |
|---|---|---|---|---|---|---|
| 5.1 | Oriscus orientation: `o0`/`o1`/`O0`/`O1`; the default follows the first note that is neither at the unison nor an oriscus; optionally the `oriscus-orientation: legacy` header | `createNoteFromData` (`Gabc.ts:2043-2065`); `Oriscus.performLayout` (`Neumes.ts:886-910`); the states in `Gabc.ts:1500-1530` | Parse the digits; keep `o<`/`o>` as aliases. | Look ahead across unisons and oriscus notes. | OriscusAsc and OriscusDes exist (`Glyphs.ts:498`) | `oriscus-orientation` |
| 5.2 | Oriscus scapus `O` | `Oriscus`, `PesQuassus` (`Neumes.ts:872-965`) | `Stemmed` is already parsed. | Draw a stem down on the left, like a virga's, as Gregorio's scapus glyphs do (`fonts/squarize.py:1034-1045`). | Oriscus plus `VirgaLineVisualizer` | `oriscus-scapus` |
| 5.3 | Pes quadratum `q`, including with initio debilis (`-fqg`) | the podatus state (`Gabc.ts:1532-1551`); a new `PesQuadratum` neume, or a flag on `Podatus` (`Neumes.ts:995`) | Record `q` from Phase 1. | Two square puncta joined by a stem. | PunctumQuadratum and the line visualizers | `pes-quadratum` |
| 5.4 | Bivirga and trivirga reversa, `VV`/`VVV` | `Gabc.ts:2034-2037` | Repeat the note, as `vv` does. | the existing `Bivirga`/`Trivirga` with `Reverse` | VirgaLong and VirgaShort | `virga-reversa-repeated` |
| 5.5 | Linea `=` | `createNoteFromData`, `Punctum.performLayout` (`Neumes.ts:1107-1146`) | Record `=`. | A flat bar between tall side strokes, as Gregorio's `Linea` glyph is (`greciliae.sfd:2989`): `LineaVisualizer` plus a rectangle | none | `linea` |
| 5.6 | `[shape:stroke]` | `processInstructionForNote` (`Gabc.ts:2142`), `Clivis` (`Neumes.ts:786`) | Parse the hint. | Draw the clivis as the first stroke of `Porrectus{n}`, with its left stem. | `Porrectus1`–`4` (`Glyphs.ts:699`, …) | `clivis-stroke` |
| 5.7 | Ledger-line hints `[ll:0/1]`, `[hl:0/1]` | `processInstructionForNote`; `Virga` (`Neumes.ts:1497`); episema placement in `Markings.ts` | Parse the hints. | Choose VirgaShort or VirgaLong for notes on the bottom line, and place episemata as if there were (or weren't) a ledger line. | both virga outlines exist | `ledger-line-hints` |
| 5.8 | Brace lengths in any TeX unit | `__braceSpecRegex` (`Gabc.ts:111`) | Accept `cm`, `in`, `pt`, `em`, `ex`. Convert from Gregorio's reference staff size (factor 17) to staff intervals. | — | — | `brace-units` |

**Risks to existing output.** 5.1 and 5.2 can change existing snapshots that have oriscus notes: `single-notes` has `(fo)`, `(fO)`, `(fO<)`, `(fO>)`; `two-note-neumes` has `(fOg)`; `neume-variants` has `(fog~)`. The drawing of `O` will change on purpose. 5.7 changes nothing without the hints.

## Phase 6. New glyph outlines

**Goal.** Add the shapes that can't be built from what exsurge has.
**Size.** L. Decide the outline licence first (see the conventions above). Can be split into 6.1 (cavum) and 6.2–6.7 (the other outlines).

| # | Item | Where | Parser work | Layout work | Glyphs needed | Golden cases |
|---|---|---|---|---|---|---|
| 6.1 | Cavum on any note of any neume | the state machine (`Gabc.ts:1442-1443` must stop `r` from splitting neumes), every `performLayout` in `Neumes.ts` | Keep `Cavum` on notes inside neumes. | Choose the hollow outline wherever the solid one is used now. | **New**: hollow versions of PodatusLower, PodatusUpper (and their Short forms), Porrectus1–4, Quilisma, OriscusAsc and OriscusDes, Stropha, PunctumInclinatum, and the liquescent outlines. About 20. Gregorio's are in `greciliae.sfd` (the `#Cavum` names); only PunctumCavum exists in exsurge (`Glyphs.ts:719`). | `cavum-neumes` |
| 6.2 | Quilisma quadratum `W` | Quilisma handling in `Podatus` and `Scandicus` | Record `W`. | as for the quilisma | **New**: 1 outline (Gregorio's `QuilismaPesOneNothing`) | `quilisma-quadratum` |
| 6.3 | Inclinatum leaning (automatic and with `0`/`1`/`2`) and the inclinatum liquescents `G<` and `G>` | `PunctaInclinata` and `Climacus` (`Neumes.ts:1090`, `:763`) | Digits from 1.8. | Choose the outline from the direction the line of inclinata takes. | **New**: about 4 (`AscendensPunctumInclinatum`, `StansPunctumInclinatum`, `PunctumInclinatumAuctus`, `PunctumInclinatumDeminutus`) | `inclinatum-variants` |
| 6.4 | Stropha aucta `s<`/`s>` | `Apostropha.getNoteGlyphCode` (`Neumes.ts:694-705`), `Distropha`, `Tristropha` | — | Choose `StrophaLiquescent`. | **New**: 1 outline, for the `GlyphCode.StrophaLiquescent` that is already declared (`Drawing.ts:391`) | `stropha-aucta` |
| 6.5 | Parentheses for accidentals and bars: `x?`, `y?`, `#?`, `` `? ``, `,?`, `,0?` | the `Accidental` and Divider drawing (`Signs.ts:261`, `:139`, `:366`) | `?` from 1.5 | Draw the sign between parentheses. | **New**: 2 outlines (open and close parenthesis), or Gregorio's 3 `*Paren` accidentals plus the paren bars | `parenthesized-signs` |
| 6.6 | Liquescent virga reversa `gV<`/`gV>` | `Virga` (`Neumes.ts:1497`) | — | The auctus head plus a stem | PunctumQuadratumAscLiquescent and DesLiquescent plus `VirgaLineVisualizer`; possibly no new outline | `virga-reversa-liquescent` |
| 6.7 | Porrectus stroke spanning a fifth | `withPorrectusSwash` (`Neumes.ts:370-386`) | — | Use the new outline in place of the fallback from 1.11. | **New**: 1 outline, `Porrectus5` (Gregorio's `porrectus5`) | `porrectus-wide` (its snapshot is updated) |

**Risks to existing output.** The glyph-table snapshot changes. 6.1 changes `single-notes` (`(fr)`, `(fr0)`) only if PunctumCavum is redrawn, so keep its outline as it is. 6.3 changes every inclinatum in every existing snapshot (`three-and-more-note-neumes`, `christus-factus-est`, …) if the automatic leaning becomes the default. Put it behind `ctxt.inclinatumLeaning` at first, then make it the default in a separate PR that updates the snapshots.

## Phase 7. Brackets, slurs, custom ledger lines and episema tuning

**Goal.** The remaining note-level decorations.
**Size.** M–L.

| # | Item | Where | Parser work | Layout work | Glyphs | Golden cases |
|---|---|---|---|---|---|---|
| 7.1 | `[[ … ]]` brackets | a new marking in `Markings.ts`; flags from 1.5 | Record the start and end notes, and the lowest and highest pitch. | Draw a bracket at each side covering that pitch range (Gregorio's `\GreBracket{0/1}{low}{high}`, `notes.l:518-575`), with lines and short hooks. | none | `note-brackets` |
| 7.2 | Slurs `[oslur:s;w,h]`, `[uslur:…]`, and the `{`/`}` forms | `processInstructionForNote`; a path visualizer like `RoundBraceVisualizer` (`Drawing.ts:2132`) | Parse the three forms. | A Bézier above or below, with the shift rules for s = 0, 1 or 2 (`Gabc.tex:1002-1019`). | none | `slurs` |
| 7.3 | Custom ledger lines `[oll:…]`, `[ull:…]`, `{`/`}`, `[oll:0]` | `ChantLine` ledger lines (`ChantLine.ts:61-103`, `:473`) | Parse the forms. | Add explicit ranges, and suppress automatic lines. | none | `custom-ledger-lines` |
| 7.4 | Episema tuning `[oh:…]`, `[uh:…]`, and blocks | `HorizontalEpisema` positioning in `Markings.ts` | Parse the position (`m`, `l`, `h`, `ol`, …) and the nudge. | Move the episema, and align a block on one level. | — | `episema-tuning` |

**Risks to existing output.** None. This is all new syntax.

## Phase 8. Neume fusion

**Goal.** `@`, `@[…]`, and `@` to suppress a stem.
**Size.** L.

| # | Item | Where | Parser work | Layout work | Glyphs | Golden cases |
|---|---|---|---|---|---|---|
| 8.1 | Manual fusion `@` | `createNeumesFromNotes` (`Gabc.ts:1372-1816`); a new `FusedNeume` in `Neumes.ts` | Read `@` as a fusion boundary inside the run of notes. | Draw each primitive (punctum, oriscus, oriscus scapus, quilisma, virga reversa, flexus, pes, porrectus, virga), joined to the next by a `NeumeLineVisualizer`, following the fusion rules in `Gabc.tex:610-622`. | existing outlines | `fusion-manual` |
| 8.2 | Automatic fusion `@[…]` | as above | Port Gregorio's algorithm for splitting into primitives (`src/gabc/gabc-glyphs-determination.c`, the fusion handling). | as above | — | `fusion-automatic` |
| 8.3 | `@` before a flexus or porrectus to suppress the stem | `Clivis`, `Porrectus` | Record the flag. | Leave out the left stem. | — | `fusion-no-stem` |

**Risks to existing output.** None (new syntax). Interactions with episemata, morae and ictus over fused shapes need cases of their own in `fusion-manual`.

## Phase 9. Initials over several lines

**Goal.** `\gresetinitiallines{n}` for any n.
**Size.** L.

**Where.** `ChantScore` (`Chant.ts:798-820`) creates the drop cap. `ChantLine` has the left indent (`ChantLine.ts:826-840`) and the annotation placement (`:348-372`). The `DropCap` size is set in `Drawing.ts:303-307`, `:4103`.

**Work.**

- Add `ctxt.dropCapLines` (0, 1 or N), with `useDropCap` kept as the 0/1 shorthand.
- Size the initial to N lines, unless the size is set explicitly.
- Indent the first N lines by the initial's width plus padding. This needs `ChantScore.layoutChantLines` to give each line its own left edge.
- Align the initial with the lyric baseline of the last indented line (Gregorio's default `lastbaseline`), with options for `firsttop` and `firstbaseline`.
- Keep the annotation centred above the initial.
- Pagination must keep the indented lines together.

**Glyphs.** None.

**Golden cases.** `two-line-initial`, `two-line-initial-annotation`, `three-line-initial-narrow`.

**Risks to existing output.** None while the default stays at 1.

## Phase 10. NABC rendering

**Goal.** St. Gall NABC above the staff, then below it, then Laon.
**Size.** XL. Do it as four PRs, 10a–10d.

| # | Item | Where | Work | Glyphs | Golden cases |
|---|---|---|---|---|---|
| 10a | NABC parser | a new `src/Exsurge.Nabc.ts` | Port the grammar and the canonicalisation from `tex/gregoriotex-nabc.lua:120-303`: base neumes, modifiers in the canonical order `MSG-><~`, variant digit, `h` plus a pitch, `!` fusion, `su`/`pp`/`ls`/`lt`, the spacing tokens and the 44 aliases. Pure functions with unit tests. | — | unit tests |
| 10b | Glyph data for gregall | a separate entry point (for example `exsurge/nabc-gregall`) that is loaded only when needed | Convert the 602 gregall outlines to path data, with advance width, height and depth. Glyph names are NABC strings, with `B N E T` standing for `> - ! ~` (`tex/gregoriotex-nabc.lua:87-94`). Keep the OFL notice and attribution, and don't use the reserved names. Very roughly 0.4–0.8 MB of path data, so it must not go in the main bundle. | **New**: 602 outlines | `tables/nabc-gregall.json` |
| 10c | Glyph lookup and layout | `Neume` and `ChantNotationElement` drawing; the `ChantLine` vertical bounds | Port the glyph search and the fallback that places letters on a 3×3 grid (`tex/gregoriotex-nabc.lua:339-461`). The anchor is a zero-width box at the left edge of the element's first glyph. Widen the syllable when the NABC overflows its notes. Voice 1 sits above the staff (raise 0.17351 cm, height 0.3 cm) and voice 2 below it (0.6 cm). High and low notes push the rows out (thresholds 4 and 2), and lyrics move down under voice 2. Add `ctxt.nabcAlignment` (`full`/`neume`) and per-voice visibility. | — | `nabc-st-gall-basic`, `nabc-two-voices`, `nabc-significative-letters`, `nabc-only` |
| 10d | Laon (grelaon, 571) and gresgmodern (523) | as 10b | More glyph modules; Laon's `un`, `oc`, `lt` and position-5 letters | **New**: 571 + 523 outlines | `nabc-laon` |

**Risks to existing output.** None. This depends on 1.4. Bundle size is a risk, so the glyph data must stay opt-in.

## Phase 11 (optional). Line breaking across the whole score

**Goal.** Make the line breaks that a Gregorio-printed book would show.
**Size.** XL.

**Where.** `ChantScore.layoutChantLines` and `ChantLine.buildFromChantNotationIndex`.

**Work.** Model each notation as a box, with glue for the spacing and its condensing tolerance, and penalties as in Gregorio's defaults (`tex/gregoriotex-gsp-default.tex:26-63`): end of word −100, end of syllable −50, end of element −50, after a bar −200, `z` −10001, inside `<nlba>` 10001. Add the rule that a syllable of fewer than 10 notes doesn't break. Then run a Knuth-Plass pass, keeping exsurge's custos width and last-line minimums.

**Golden cases.** Rerun every multi-line case with `ctxt.lineBreaking = "optimal"` as new cases, `*-optimal`.

**Risks to existing output.** It would change every multi-line snapshot if it became the default, so ship it opt-in (`ctxt.lineBreaking: "greedy"/"optimal"`). It also interacts with incremental editing (`updateMappingsFromSource`), where a local change shouldn't move every line.

## Phase 12. Ledger lines as Gregorio draws them

**Goal.** Draw a ledger line wherever Gregorio draws one, and make it the same length. This phase was added after the rest of the plan. Phases 5.7 and 7.3 read Gregorio's ledger-line hints and custom ledger lines, but exsurge still decides on its own where the automatic lines go.
**Size.** M–L. It can be split into 12.1–12.3 (which notes get a line, and how it is drawn), 12.4 (signs), and 12.5–12.6 (stems and episemata).

**How the two differ now.** The Gregorio column is from `gregorio` built from `b63f074`: its GregorioTeX output has one `\GreAdditionalLine` for each note or sign with a line. The exsurge column is from rendering the same gabc on master.

| gabc | Gregorio draws a line at | exsurge draws a line at |
|---|---|---|
| `(klk)`, `(lk)`, `(lj)` | `l` only | `l` and the notes beside it |
| `(j/!m)` | both notes, because the step between them crosses the line | `m` only |
| `(f/!e/!d/!c/!b)`, `(b/!c/!d/!e/!f)` | all five notes | `b` only |
| `(c/!b/!c/!d/!c)` | every note but the last | `b` only |
| `(b!c)`, `(b/!c)`, `(b/0c)` | both notes | `b` only |
| `a(b) c(b)` | each `b`, as two lines | one line, joined across the gap |
| `(bxb)`, `(lxl)`, `(b#b)` | the accidental and the note | the note only |
| `` (g`0) ``, `(g,0)` | the bar | nothing |
| any line | the note plus 0.14584 cm on each side, about one staff interval | the notes plus half a staff interval on each side |

Where they already agree: a single note beyond the staff, a pes or clivis whose step crosses the line (`km`, `mk`), and lines below the staff within one neume (`bcd`, `dba`, `cbc`).

| # | Item | Where | Parser work | Layout work | Glyphs | Golden cases |
|---|---|---|---|---|---|---|
| 12.1 | One ledger-line state for each side of each note | `Note.lowLedgerLine` and `highLedgerLine` (`Chant.ts:145-152`); the hints in `processInstructionForNote` (`Gabc.ts:3077-3085`); 7.3's `[oll:0/1]`, `[ull:0/1]` and `[oll:{]…[oll:}]` | For each side, keep a value and how it was set, in Gregorio's order (`struct.h:403-410`): supposed; explicit (`[hl:…]`, `[ll:…]`, or a note inside a variable custom ledger line); drawn (a note on or beyond the ledger line); explicitly drawn (`[oll:0/1]`, `[ull:0/1]`). A setting replaces only a weaker one (`notes.l:58-62`, `:152-162`). | — | — | `ledger-line-settings` |
| 12.2 | Which notes get a line | a pass after the neumes are built, in place of `Neume.requiresLedgerLine` (`Neumes.ts:549-591`) | — | Port `gabc_determine_ledger_lines` (`src/gabc/gabc-score-determination.c:521-659`). It works on one Gregorio element at a time. An element is the notes and accidentals of a neume and of the neumes joined to it by `!`, `/!`, `/0` or `@`; `/`, `//`, `/[n]` and a space end it. From each note drawn with a line, a line above the staff extends to the next or previous note only if the step between them crosses the line. A line below the staff extends back through falling notes and on through rising ones. That asymmetry comes from `extend_low_ledger` (`:599-621`) comparing pitches the same way as `extend_high_ledger`, and it looks like an oversight in Gregorio. Copy it so the output matches, and consider reporting it upstream. | — | `ledger-lines-gregorio` |
| 12.3 | How a line is drawn | `ChantLine.finishLayout` (`ChantLine.ts:1950-1997`, `:2069-2071`); `ctxt.minLedgerSeparation` (`Drawing.ts:1161`) | — | Draw one line for each note, at the ledger line's height. Make it as wide as the note plus `additionallineswidth` on each side: 0.14584 cm, about 1.02 staff intervals by 7.2's `texLength.ts` (`tex/gregoriotex-signs.tex:1566-1650`, `tex/gregoriotex-gsp-default.tex:94`). A cavum glyph gets no overhang on its left. Under the stroke of a porrectus or a torculus resupinus, the line spans the stroke's first two notes (`src/gregoriotex/gregoriotex-write.c:2460-2525`). The thickness stays the staff line's. Draw overlapping lines as one line. Don't join lines from different elements: default `ctxt.minLedgerSeparation` to 0, so that setting it to 2 restores today's joining. Keep exsurge's rule that a note offset with the Chi-Rho clef's `0` or `9` takes its line at the nearest line. | — | `ledger-lines-gregorio` |
| 12.4 | Lines through signs | `Accidental` (`Signs.ts:314`); the high virgula and minima (`Signs.ts:117`, `:424`); the custos (`ChantLine.ts:2030`, `:2202`) | — | An accidental on or beyond the ledger line gets a line, as a note does, and is part of 12.2's runs (`CHANGELOG.md:345`). The high virgula and minima, `` `0 `` and `,0`, get a line under them, and so do their parenthesized forms from 6.5 (`tex/gregoriotex-signs.tex:2397-2537`). The custos already gets a line; check its width against GregorioTeX's (`tex/gregoriotex-signs.tex:491-497`). | — | `ledger-lines-signs` |
| 12.5 | Stems that depend on a ledger line | `VirgaLineVisualizer` (`Drawing.ts:1965-1990`); the stems of the clivis, the porrectus flexus, the oriscus scapus (5.2) and Phase 8's fused shapes | — | Gregorio chooses the stem of a note at `c` or `d` from that note's ledger-line state (`adjusted_queuetype_of`, `src/gregoriotex/gregoriotex-write.c:205-231`, used for each stemmed glyph at `:579-912`; `CHANGELOG.md:352`). A note on the bottom line gets the short stem unless it has a line under it. 5.7 does this only for the virga, and only with a hint. Use the state from 12.1 and 12.2 for every stemmed shape. | none | `ledger-line-stems` |
| 12.6 | Episemata next to a ledger line | `HorizontalEpisema` (`Markings.ts:116-190`, `:307`) | — | Gregorio decides whether an episema over a note at `k`, or under a note at `c`, has a ledger line to clear. It looks at the state of every note under the episema and of the notes joined to them, then fills in the supposed state of notes that have none (`src/gregoriotex/gregoriotex-position.c:1143-1331`). GregorioTeX then puts the episema closer to a note with no line (`tex/gregoriotex-spaces.tex:571-610`, `CHANGELOG.md:369`, `UPGRADE.md:224-232`). exsurge looks only at the neume's first ledger line and at the hints. Port the decision, and add `ctxt.ledgerLineHeuristic` (default `true`) for Gregorio's `\gresetledgerlineheuristic{enable/disable}`. | — | `ledger-line-episemata` |

This also covers two things left over from phases 5 and 7. 5.7's hints should give way to 7.3's `[oll:0/1]`, and they should change a clivis's stem as well as a virga's.

**Checking against Gregorio.** Gregorio's output gives the expected lines for each new case. Run `gregorio` on the case's gabc and read the `\GreAdditionalLine` calls; the `\GreOCase…` argument names the note's place in its glyph. The table above was made this way.

**Risks to existing output.** 12.3 changes every snapshot that has a ledger line, because the overhang doubles. 12.2 and 12.4 change some of them further. The snapshots with ledger lines are `ledger-lines`, `two-line-staff`, `five-line-staff`, `porrectus-wide`, `musica-ficta`, `linea`, `braces`, `christus-factus-est`, `accents-and-choral-signs`, `scale-uses`, `colors`, `async-layout`, `line-breaks-and-custodes`, and the four `line-break-edge-cases-*`. 12.5 shortens the stem of a virga on the bottom line wherever no line is under it, as 5.7 noted Gregorio does. Review these changes as corrections, in a commit of their own, apart from the new cases.

**Depends on.** 5.7 (merged), 7.3 for the explicit and custom lines, and 6.5 for the parenthesized signs. Start after Phase 7 merges.

## Phase summary

| Phase | Theme | Size | Depends on | New outlines |
|---|---|---|---|---|
| 1 | Stop corrupting valid GABC | M | — | none |
| 2 | Bars, breaks, custos, spacing codes | M | 1.5, 1.9 | none |
| 3 | Settings from the header, two clefs | S–M | 1.1 | none |
| 4 | Lyric semantics | M | 1.9, 1.10 | none |
| 5 | Shapes from existing outlines | M–L | 1.5 | none |
| 6 | New outlines (cavum, W, inclinatum, stropha, parentheses, Porrectus5) | L | 1.5, 1.8, 1.11; a licence decision | about 30 |
| 7 | Brackets, slurs, ledger lines, episema tuning | M–L | 1.5 | none |
| 8 | Neume fusion | L | 1.5, 5.2 | none |
| 9 | Initials over several lines | L | — | none |
| 10 | NABC | XL | 1.4 | about 600 for St. Gall; about 1,700 for all three fonts |
| 11 | Line breaking across the whole score (optional) | XL | 2.8 | none |
| 12 | Ledger lines as Gregorio draws them | M–L | 5.7, 7.3; 6.5 for the parenthesized signs | none |

---

## Appendix: how the render checks were run

The checks used a throwaway Vitest file outside the repository. It imported `render()` from `test/golden/harness.ts` and the source from `src/index.ts`, rendered each probe at a width of 700 with the `fontkit` stand-in fonts, and wrote out three things for each probe:

- the SVG, rasterised with `rsvg-convert` so the result could be looked at;
- a dump of `score.notations`: each notation's class and source, each note's pitch, shape, modifier and liquescence flags and markings, the glyph codes drawn, and the lyrics;
- the line breaks (the notation range and custos of each line).

Header parsing was checked with `new GabcHeader(text)` directly. A minimal way to repeat one check:

```ts
import * as E from "../src/index";
import { render } from "../test/golden/harness";

const { score } = await render(E, "(c4) a(fgr) b(gr6) (::)", { width: 700 }, ["svg"]);
console.log(score.notations.map((n: any) => [n.constructor.name, n.notes?.map((x: any) => x.sourceGabc)]));
```

Most findings marked **buggy** or **missing** in Part 1 quote the GABC snippet they were observed with. Each should become a golden case when its fix lands; the plan names the cases.
