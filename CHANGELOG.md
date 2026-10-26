## [2.2.1](https://github.com/bbloomf/exsurge/compare/v2.2.0...v2.2.1) (2026-10-23)


### Bug Fixes

* **drawing:** Let each context prefix its glyph def ids ([f444b82](https://github.com/bbloomf/exsurge/commit/f444b82795c149bb538e2fec23841a1a2f2381f4))
* **layout:** Center a bar before the custos, not under the text after it ([89f5e2f](https://github.com/bbloomf/exsurge/commit/89f5e2f9f2e4d9274936e8ac20fcf1a41a3f9ee8))
* **layout:** Put a divider's lyric back where its notation's layout puts it ([6c13266](https://github.com/bbloomf/exsurge/commit/6c13266a4c4281c69c2e9a4feb9b6ff7b3ab00dd))

# [2.2.0](https://github.com/bbloomf/exsurge/compare/v2.1.1...v2.2.0) (2026-10-23)


### Bug Fixes

* **annotation:** Stack an annotation below the last line of the one before it ([d9b2fed](https://github.com/bbloomf/exsurge/commit/d9b2fede05ba188834926ac497b1affc3b70a6eb))
* **annotation:** Stack annotations by the annotation text style's lineHeight ([e9f608e](https://github.com/bbloomf/exsurge/commit/e9f608ef66ee61bebe2c79e7e6ace0bc27cd2074))
* **canvas:** Draw a line's starting clef before its notations ([3934b76](https://github.com/bbloomf/exsurge/commit/3934b76b9357f2b8a1de674f1645b1fb671f1e7b))
* **canvas:** Space a text element's lines 1.1em apart, as in the svg ([8a8ae0a](https://github.com/bbloomf/exsurge/commit/8a8ae0ac91f6b34b32f431ce085b820ea9b4584e))
* **canvas:** Undo the full line break offset after drawing a lyric ([82a606f](https://github.com/bbloomf/exsurge/commit/82a606fef50ceee09269ff50b2e7b55e80f4160b))
* **drawing:** Draw a porrectus's swash at the glyph multiplier's size ([98672e8](https://github.com/bbloomf/exsurge/commit/98672e886ae3974ad903054c553c522a2836dbbc))
* **layout:** Put extra text only lyrics below the lines of the lyrics before them ([62ffd71](https://github.com/bbloomf/exsurge/commit/62ffd718bcdd8f5f0ba8d0305b7da21779f7c08a))
* **lyric:** Center a lyric on its vowel on the line the vowel is on ([b9075ed](https://github.com/bbloomf/exsurge/commit/b9075ed607ae197a7cc3d08d646990a9560b5b25))
* **lyric:** Center a right aligned lyric where its lines are drawn ([c6a6ff9](https://github.com/bbloomf/exsurge/commit/c6a6ff9cc58742ba4171e5e505ef0328cf4e4d31))
* **markings:** Fix the Phase 7 review's findings ([f3ce63d](https://github.com/bbloomf/exsurge/commit/f3ce63d6652c88e0efe4e1f7712474d283afcdd1))
* **markings:** Size the marks on a porrectus's notes by the glyph multiplier ([79f92d8](https://github.com/bbloomf/exsurge/commit/79f92d85107bee81e26864f2cb37f3137397028f))
* **neumes:** Apply the Phase 8 code review's fixes to neume fusion ([ecaa6bc](https://github.com/bbloomf/exsurge/commit/ecaa6bc8aed8f70f1dda5639e08edd6ea67f7694))
* **neumes:** Draw a fused oriscus scapus without its stem ([d7ab285](https://github.com/bbloomf/exsurge/commit/d7ab2850f0ea906fbb654f6c0de820f9899140f4))
* **neumes:** Fix issues found in reviewing Phase 5 ([cf92a28](https://github.com/bbloomf/exsurge/commit/cf92a289678a5376c1ac9aad9c413e46253650bb)), closes [#None](https://github.com/bbloomf/exsurge/issues/None) [#Linea](https://github.com/bbloomf/exsurge/issues/Linea)
* **neumes:** Fix issues found in reviewing Phase 6 ([5105cfe](https://github.com/bbloomf/exsurge/commit/5105cfe3d5871673753efa414620a1b347c95ab7))
* **neumes:** Space leaning inclinata so their edges line up ([6b31b1f](https://github.com/bbloomf/exsurge/commit/6b31b1f0de1621cbea9ba877fd534aae9c8b55e8))
* **neumes:** Stand a leaning inclinatum's stem on its top point ([d7fefaf](https://github.com/bbloomf/exsurge/commit/d7fefaf9ebf4b48cf95d338804100c8a992a2d74))
* **svg:** Squeeze a lyric's sized spans with the rest of it ([32be4f9](https://github.com/bbloomf/exsurge/commit/32be4f98c129dec44d817a81defcecb5a85c33c5))
* **text:** Measure a text element's lines 1.1em apart, as they are drawn ([6b45646](https://github.com/bbloomf/exsurge/commit/6b45646f233bb351a463ca965ecf04600e09f552))
* **text:** Space a line by the size of the span that starts it ([3ed0eac](https://github.com/bbloomf/exsurge/commit/3ed0eac4f20d46bf1982ec5665b74b0302b833c1))
* **text:** Space a text's line breaks by its text style's lineHeight ([9c30802](https://github.com/bbloomf/exsurge/commit/9c30802f8e33577c1b0b05529058691fee40b2f3))


### Documentation

* Note that puncta inclinata now lean by default ([9f8964d](https://github.com/bbloomf/exsurge/commit/9f8964da52fd80b8f6b2644562010a57be85eb55))


### Features

* **gabc:** Accept brace lengths in any TeX unit ([4daea2a](https://github.com/bbloomf/exsurge/commit/4daea2a1d9e92fdea20eb4fea8e121b5450a0591))
* **gabc:** Read VV and VVV as Gregorio does ([a09a050](https://github.com/bbloomf/exsurge/commit/a09a050e473a93cbe1078a727958e99636344a5e))
* **glyphs:** Draw a porrectus's swash for any fall ([8401d32](https://github.com/bbloomf/exsurge/commit/8401d32a60de28985192442170ee46d85e3b0bec))
* **markings:** Draw Gregorio's brackets around notes ([495375c](https://github.com/bbloomf/exsurge/commit/495375c024c91dda017e2db53ab952a727cc2cd1))
* **markings:** Draw Gregorio's custom ledger lines ([9e0fc53](https://github.com/bbloomf/exsurge/commit/9e0fc531a2084cf940194fb9d5c9f3aa21739d23))
* **markings:** Draw Gregorio's slurs ([d42f6e4](https://github.com/bbloomf/exsurge/commit/d42f6e48d43cc10b2606195c5f124d8d5637aebf))
* **markings:** Follow Gregorio's ledger-line hints [ll:…] and [hl:…] ([1ef8483](https://github.com/bbloomf/exsurge/commit/1ef84832f316bfefe2a4825a439fec9b5f99dc95))
* **markings:** Tune episemata as Gregorio does ([a8dcd1c](https://github.com/bbloomf/exsurge/commit/a8dcd1cfc24800d05ca8320143f7a7e228b92a19))
* **neumes:** Draw a cavum on any note of a neume ([35e30d7](https://github.com/bbloomf/exsurge/commit/35e30d71c61c53930020fc3aa4422991ed23b193))
* **neumes:** Draw a clivis as a stroke with [shape:stroke] ([ca0f9f4](https://github.com/bbloomf/exsurge/commit/ca0f9f45fe7b5ace5d1b744aa770ac0aa2ea796b))
* **neumes:** Draw a flexus or porrectus after gabc @ without its stem ([965ebe8](https://github.com/bbloomf/exsurge/commit/965ebe84f240478f654dc268e20c5b573db87eb0))
* **neumes:** Draw a porrectus stroke of a fifth ([0aee985](https://github.com/bbloomf/exsurge/commit/0aee985f6a983d60d5257f5b2b612dfb3e727118))
* **neumes:** Draw a stropha aucta ([7f26682](https://github.com/bbloomf/exsurge/commit/7f26682e3ec807b202e8d1c42c1eef015f01b4de))
* **neumes:** Draw a virga reversa auctus ([c83eabb](https://github.com/bbloomf/exsurge/commit/c83eabbfad159d12b56b70012371a11cb4193f4c))
* **neumes:** Draw Gregorio's quilisma quadratum ([8ddaf23](https://github.com/bbloomf/exsurge/commit/8ddaf23395d05166005d71de7600514858a68de8))
* **neumes:** Draw the linea ([5c34862](https://github.com/bbloomf/exsurge/commit/5c34862410ada530ae042539ca59a41793c18d2c))
* **neumes:** Draw the oriscus scapus as Gregorio does ([bfafe84](https://github.com/bbloomf/exsurge/commit/bfafe844dc2571849bd05c4978d59d41670720dd))
* **neumes:** Draw the pes quadratum ([63485db](https://github.com/bbloomf/exsurge/commit/63485db36fd5762b051fea67bb4e95438a60aa85))
* **neumes:** Fuse neumes at gabc @ as Gregorio does ([a264bdc](https://github.com/bbloomf/exsurge/commit/a264bdc1f8c75bf01117b07c405be8713f5fe2ba))
* **neumes:** Fuse the notes in gabc @[…] automatically as Gregorio does ([7283efc](https://github.com/bbloomf/exsurge/commit/7283efccf887f6ad56f4034c1d6c5050822785f5))
* **neumes:** Lean inclinata as Gregorio does by default ([35f44a6](https://github.com/bbloomf/exsurge/commit/35f44a6626a4806cfdbbe7163bb2b2c2cee470e5))
* **neumes:** Lean inclinata as Gregorio does, and draw the inclinatum auctus ([91a6575](https://github.com/bbloomf/exsurge/commit/91a657559a6cec87d9c3326f2524a05e49f2bc0c))
* **neumes:** Orient the oriscus as Gregorio does ([4a87ee4](https://github.com/bbloomf/exsurge/commit/4a87ee4e4117724d510951fb28fec644d9c5c49b))
* **signs:** Draw Gregorio's parenthesized accidentals and bars ([5310da0](https://github.com/bbloomf/exsurge/commit/5310da0820848344604a44e250af98c991b93667))


### BREAKING CHANGES

* puncta inclinata now lean as Gregorio's do, as their gabc
says (G0, G1, G2) or as their line goes, and leaning inclinata are spaced
further apart along their leaning.  This changes the glyphs and spacing of
every punctum inclinatum, and can move line breaks.  Set
ctxt.inclinatumLeaning = false to draw every inclinatum upright, as before.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

## [2.1.1](https://github.com/bbloomf/exsurge/compare/v2.1.0...v2.1.1) (2026-10-22)


### Bug Fixes

* **canvas:** Draw braces on a canvas ([fdece1f](https://github.com/bbloomf/exsurge/commit/fdece1ff187d38537335ac2cbf6bab2db29b8a4f))

# [2.1.0](https://github.com/bbloomf/exsurge/compare/v2.0.0...v2.1.0) (2026-10-22)


### Bug Fixes

* Address the code review of Gregorio's Phase 2 ([35e76a3](https://github.com/bbloomf/exsurge/commit/35e76a3a7173e09078be7c0ea6648c07f37dff09))
* Address the code review of Gregorio's Phase 3 ([c912d92](https://github.com/bbloomf/exsurge/commit/c912d92819337a056d02d3cf7505b29c9ec3af1e))
* Address the code review of Gregorio's Phase 4 ([7cc3280](https://github.com/bbloomf/exsurge/commit/7cc3280ed6235ca7e4050e2f5b1ef84de86cdbde))
* **drawing:** Draw a porrectus's swash on a canvas ([241308d](https://github.com/bbloomf/exsurge/commit/241308dd57b3b4ce018712d47601b5ca306f47c7))
* **gabc:** Address the code review of Gregorio's Phase 1 ([bbc95a7](https://github.com/bbloomf/exsurge/commit/bbc95a78dbe0b1781f48a845ebd96a97a358136c)), closes [bbloomf/exsurge#20](https://github.com/bbloomf/exsurge/issues/20)
* **gabc:** Give a note nudged with 0 or 9 the pitch of its line or space ([ca3cb79](https://github.com/bbloomf/exsurge/commit/ca3cb793708ef546a64a2f5ab3e833b9a8c18a40))
* **gabc:** Leave out Gregorio's % comments in the notation section ([24d63a4](https://github.com/bbloomf/exsurge/commit/24d63a4b02a6c8ccff7fd6a158e68ad03eaa777b))
* **gabc:** Read Gregorio's <eu>, <nlba>, <pr> and <clear> instead of printing them ([72b79c1](https://github.com/bbloomf/exsurge/commit/72b79c19f9c54024a8d591cc20df8d3b5933ec68))
* **gabc:** Read Gregorio's $ escapes ([ce9baeb](https://github.com/bbloomf/exsurge/commit/ce9baeb90b3292398f77f54331f457db0dca04b1))
* **gabc:** Read Gregorio's F clefs with a flat, fb1 to fb5 ([8f5efbe](https://github.com/bbloomf/exsurge/commit/8f5efbee151b98d47ccb7dd22b21ab05fb1fadac))
* **gabc:** Read Gregorio's G0, G1 and G2 as an inclinatum's leaning ([0985601](https://github.com/bbloomf/exsurge/commit/098560104e357d7f32aec4f745418bbef666004f)), closes [bbloomf/exsurge#24](https://github.com/bbloomf/exsurge/issues/24)
* **gabc:** Read Gregorio's multi-line header values and %%+ end lines ([632ee44](https://github.com/bbloomf/exsurge/commit/632ee448f5bd35883b69dc115314b16dbde4db27))
* **gabc:** Separate Gregorio's NABC from the gabc ([547ea0b](https://github.com/bbloomf/exsurge/commit/547ea0b5dbbda9cb50b13c8daa384b13e0d435a4))
* **gabc:** Stop Gregorio's [[ ]], <nlba> and other note tokens from losing or making up notes ([36b7927](https://github.com/bbloomf/exsurge/commit/36b79274b28acdb869443e6733080cd9436d8585))
* Leave TeX that exsurge can't draw out of <v> verbatim text ([de84a10](https://github.com/bbloomf/exsurge/commit/de84a100afe4a433d9d49d4ddbc10a7fc1dd7dab))
* **neumes:** Draw a porrectus wider than a fourth without losing notes ([2a749ea](https://github.com/bbloomf/exsurge/commit/2a749ea49cfb7213453c87f34c98bea610fae196))
* **neumes:** Draw a wide porrectus's last note beside the puncta ([e6b7331](https://github.com/bbloomf/exsurge/commit/e6b733142a6e9d996c345d2b4f77fbc3cbb9c5c9))
* **neumes:** Keep a wide porrectus deminutus's small last note ([904fe33](https://github.com/bbloomf/exsurge/commit/904fe338cb2fe61149714dd3a11ab7f42add02e1))
* Put a clef change just before a forced line break on the next line only ([a3da5fc](https://github.com/bbloomf/exsurge/commit/a3da5fc4c6a09ae9b71fd79d55fff7ab89e2eab8)), closes [#1190](https://github.com/bbloomf/exsurge/issues/1190)
* **text:** Draw <tt> and all of Gregorio's <sp> specials ([070f78b](https://github.com/bbloomf/exsurge/commit/070f78b9927b7c3adf12bdb1ca34cebfa4f1f303))


### Features

* Add ctxt.lyricTie to draw a lyric ~ as Gregorio's tie ([92c09f6](https://github.com/bbloomf/exsurge/commit/92c09f6ccbcefb255cd9ddfa26cb5f9dc38918a0))
* Add Gregorio's divisio minimis, high and dotted bars, and bar episemata ([9c8a0db](https://github.com/bbloomf/exsurge/commit/9c8a0dbf21fae393d4aa6b6da1a19dc11efd3fdd))
* Add Gregorio's spacing codes and configurable neume spaces ([9e50422](https://github.com/bbloomf/exsurge/commit/9e5042272612e036f61452a91380f94c2f667b01))
* Add Hungarian and Church Slavonic vowel rules, and ctxt.lyricCentering ([4c1d404](https://github.com/bbloomf/exsurge/commit/4c1d404fcb5b648d5ba62551385365c7be14f32a))
* Add the first word, first syllable and first letter styles ([375b119](https://github.com/bbloomf/exsurge/commit/375b119a07661c412cb41d4c02ec4e991a9fe07f))
* Control the end-of-line custos with z+, z-, [nocustos] and ctxt.eolCustos ([5265b09](https://github.com/bbloomf/exsurge/commit/5265b0916706c3d82c4205ffbaed858ab06c4f2a))
* **gabc:** Apply the settings in a gabc header with Gabc.applyHeader() ([f5f9e15](https://github.com/bbloomf/exsurge/commit/f5f9e1545c55caed945edb40eb2fae4a860e6965)), closes [#20](https://github.com/bbloomf/exsurge/issues/20)
* **gabc:** Draw two clefs at once (c1@c4) ([e23cc42](https://github.com/bbloomf/exsurge/commit/e23cc42b5c635b05cc9993842ee1f16c670a5b26))
* **gabc:** Let the language header choose Church Slavonic and Hungarian ([ee1d59e](https://github.com/bbloomf/exsurge/commit/ee1d59ebad6bb77a3ee8349a96f5fbae4e3ff7ca))
* **gabc:** Nudge notes with 0 and 9 only under a Chi-Rho clef, and give it chromatic pitches ([0801d58](https://github.com/bbloomf/exsurge/commit/0801d5888d797fc70814b656d5b5f90951e900d6))
* **gabc:** Put a note on a space at the bottom of the space under a Chi-Rho clef ([2e8dce9](https://github.com/bbloomf/exsurge/commit/2e8dce9766cebc86725b5dfb564bd1d1427ceb09))
* Hide the clefs at the start of lines with ctxt.clefVisibility ([86eccb4](https://github.com/bbloomf/exsurge/commit/86eccb4757362abf19708cfbe0624603018e17a2))
* Keep Gregorio's <nlba> and <eu> areas on one line ([83d3a08](https://github.com/bbloomf/exsurge/commit/83d3a08f9d72a2d8c89f28ff2a1ce04cc84450a0))
* Keep text before a repeated tag, and add ctxt.translationCentering ([f11d9f8](https://github.com/bbloomf/exsurge/commit/f11d9f89f5cfc6f5bbefb612ab76687fc9227721))
* Lay out Gregorio's <clear> ([69d0811](https://github.com/bbloomf/exsurge/commit/69d081174b21326492bfbac53bece0bbaf2a9d49))
* Let the text after Gregorio's <pr> protrude past the staff ([29e823b](https://github.com/bbloomf/exsurge/commit/29e823be4060f8b0ef5c1530ced91f988a98541e))
* **markings:** Draw Gregorio's musica ficta, r6, r7 and r8 ([317804a](https://github.com/bbloomf/exsurge/commit/317804a2d36c90bfc7313a0f38c65e3a2be8f1b2))
* Treat <e> as an elision, with ctxt.italicMeansElision for </i> ([88d846f](https://github.com/bbloomf/exsurge/commit/88d846f8f7a13a3964798f61d27cc179fcdeee02))

# [2.0.0](https://github.com/bbloomf/exsurge/compare/v1.30.1...v2.0.0) (2026-10-21)


### Bug Fixes

* Declare the xlink namespace in the XMLNS namespace ([28a176e](https://github.com/bbloomf/exsurge/commit/28a176ec7d4fabae8db5f12fc23f6530a1906eb4))
* Don't change ctxt.baseTextStyle when rendering an svg tree ([7bb8468](https://github.com/bbloomf/exsurge/commit/7bb8468d639905e144b8e2791d86b3b1a80be21e))
* Don't throw on a brace still open at a custos that ends the score ([1164b06](https://github.com/bbloomf/exsurge/commit/1164b06e8a4599c22111e204c94b64b5f4a2de15))
* Keep the prefix of namespaced attributes in svg nodes ([8d628c1](https://github.com/bbloomf/exsurge/commit/8d628c135cadff71bdc50715957a44f880f33bf9))
* Measure directives and text left and right with their css classes ([25633fb](https://github.com/bbloomf/exsurge/commit/25633fbd2720a7149a5bf53b9966cb86c47b57af))
* Measure text in its text style with TextMeasuringStrategy.Svg, and wrap it ([a3b57e7](https://github.com/bbloomf/exsurge/commit/a3b57e7f0d8146dfaa1748c39ad49eda5dbe6a75))

## [1.30.1](https://github.com/bbloomf/exsurge/compare/v1.30.0...v1.30.1) (2026-10-18)


### Bug Fixes

* Find the first Spanish vowel segment, skipping a silent u before an accented vowel ([2e787d6](https://github.com/bbloomf/exsurge/commit/2e787d6fcfcf6a4c85e7a2557f001ea3f6f6e67a))
* Let a line break after a / or space that ends a syllable, and give !/ its width ([356b26f](https://github.com/bbloomf/exsurge/commit/356b26f5a2e9cd2a7ef404b21441ff3fc99b6ebe))
* Make Note.shapeModifierMatches read shapeModifiers ([852b37c](https://github.com/bbloomf/exsurge/commit/852b37c88d2efb977362901546e040b175d3ee53))
* Make re-parsing edited gabc match a fresh parse ([8e52945](https://github.com/bbloomf/exsurge/commit/8e52945fb67f366c3439aab8d3c954b1097f81f0))
* Measure text again once a font is added to document.fonts ([3b97983](https://github.com/bbloomf/exsurge/commit/3b979830d94d32df9a7d46147b3977b0622fa16d))
* Wrap each line by its own width, and stop lines at <br> ([8f8f2ab](https://github.com/bbloomf/exsurge/commit/8f8f2aba86c514678d9466ddb2ed3157150abbce))

# [1.30.0](https://github.com/bbloomf/exsurge/compare/v1.29.0...v1.30.0) (2026-10-18)


### Bug Fixes

* Add each neume line visualizer once, after it's positioned ([a6d6046](https://github.com/bbloomf/exsurge/commit/a6d6046c18189088e542c327c594708e83dddf80))
* Address review findings on the typings, and type-check them in npm test ([f733e45](https://github.com/bbloomf/exsurge/commit/f733e45aa310b25171c426adb9abcc69687e9c8b))
* Allow a line break between neumes separated by / or a space ([5f54a35](https://github.com/bbloomf/exsurge/commit/5f54a35890702fadad95617dfd86a167f9d90b24))
* Keep line breaks when text wraps to three or more lines ([d5c4f3b](https://github.com/bbloomf/exsurge/commit/d5c4f3b56c7aac696a6dcba1eb7b99f8413ed112))
* Only create a connector span for lyrics that allow a connector ([e58aae3](https://github.com/bbloomf/exsurge/commit/e58aae39c4fd00d78f0d55323dd3bf1f5ad43834))
* Spell shapeModifiers consistently for the reverse virga ([2a67202](https://github.com/bbloomf/exsurge/commit/2a6720242f31ca8c97c38d1122946a997c390593))
* Stop Spanish findVowelSegment from looping forever on a u diphthong ([2c7d0f7](https://github.com/bbloomf/exsurge/commit/2c7d0f74391997fba77a2d3dd722ba85735a67e3))
* Strip trailing whitespace from lyrics after a | ([540b942](https://github.com/bbloomf/exsurge/commit/540b9426bd2c9b05a6a9818d63e73bf0a5d738e5))
* Use the right unit identifiers in the Units helpers ([cf59945](https://github.com/bbloomf/exsurge/commit/cf59945ae86d592543eb4a71b72deccc46ccadae))


### Performance Improvements

* Cache text measurements and merged span styles ([783eef3](https://github.com/bbloomf/exsurge/commit/783eef3acff70320e00995a1c1557413bec899a9))
* Speed up gabc re-diffing, glyph drawing, and line breaking ([140410b](https://github.com/bbloomf/exsurge/commit/140410b7b4e44e61fd2ad72647a20efa78b1098f))

# [1.29.0](https://github.com/bbloomf/exsurge/compare/v1.28.0...v1.29.0) (2026-10-15)


### Bug Fixes

* Ask document.fonts about the face that the lyric hyphen is drawn in ([7ad3771](https://github.com/bbloomf/exsurge/commit/7ad3771a07f0019beaab8a49571d1aba852220f1))
* Bring ChantContext and ChantScore typings in line with the source ([f687b60](https://github.com/bbloomf/exsurge/commit/f687b6005f37455e690a0e0ceeb0a84fb3880597))
* Clear the remaining strict errors in index.d.ts ([14fa78a](https://github.com/bbloomf/exsurge/commit/14fa78a8bced430cf7347003ec1d828c01664769))
* Keep textStyles.choralSign.size in step with the staff ([5b62688](https://github.com/bbloomf/exsurge/commit/5b62688883f615fcc34e6ab31348e4ad2a0307a6))
* Keep the lyric word spacing ratio across a hyphen with no width ([514244d](https://github.com/bbloomf/exsurge/commit/514244d084a31cda58d66c60bc7384aeb1586208))
* Make npm test run once instead of watching ([da666de](https://github.com/bbloomf/exsurge/commit/da666de6ff7dfb9aea517502575317fc03db5d0c))
* Remove the leftover ctxt.onFontLoaded hook from performLayoutAsync ([8259fc6](https://github.com/bbloomf/exsurge/commit/8259fc6375147e9bc31d3aea2eed84334cabc9aa))
* Stop performLayoutAsync from waiting forever for a lyric font ([6cd09a6](https://github.com/bbloomf/exsurge/commit/6cd09a6206fe06cbc777e0da78892843e5dcd02f))
* Style choral signs at the size they are measured at ([c842fe2](https://github.com/bbloomf/exsurge/commit/c842fe23405b5217a3f72fd285dc309ecbb99519))
* Type ctxt.minLyricWordSpacingRatio ([5b06a7f](https://github.com/bbloomf/exsurge/commit/5b06a7fbd9b0e8cff2a2b2b0702212d397a6433a)), closes [#5](https://github.com/bbloomf/exsurge/issues/5)
* Type text type lookups and title elements as the source has them ([5a9b461](https://github.com/bbloomf/exsurge/commit/5a9b461c75d4969770e852dae205ff401d5c64a5))
* Wait only once per context for a lyric font without document.fonts ([59ac17e](https://github.com/bbloomf/exsurge/commit/59ac17e28c792baffdb570be0af6cd62d130d14d))

# [1.28.0](https://github.com/bbloomf/exsurge/compare/v1.27.1...v1.28.0) (2026-10-08)


### Features

* Support Gregorio's soft accidentals (X, Y, and ##) ([8aa8c33](https://github.com/bbloomf/exsurge/commit/8aa8c33f687e69dd54c9401e504cb32edce893ea))

## [1.27.1](https://github.com/bbloomf/exsurge/compare/v1.27.0...v1.27.1) (2026-09-23)


### Bug Fixes

* Fix issue with double drawing custos when one is explicitly given at the end of the chant (using + in the gabc) ([96a1dc9](https://github.com/bbloomf/exsurge/commit/96a1dc932ffb2a5a0b2e2acf1f492d73eda1eb6d))

# [1.27.0](https://github.com/bbloomf/exsurge/compare/v1.26.2...v1.27.0) (2026-09-15)


### Features

* Add support for negativeFillColor ([dd1e471](https://github.com/bbloomf/exsurge/commit/dd1e4710db26549e81cf03a1cc00f32d352eaabd))

## [1.26.2](https://github.com/bbloomf/exsurge/compare/v1.26.1...v1.26.2) (2026-09-14)


### Bug Fixes

* Fix undefined reference ([137bcdf](https://github.com/bbloomf/exsurge/commit/137bcdf72ec69e3aa2b8277c51aeaeb2011f18ad))

## [1.26.1](https://github.com/bbloomf/exsurge/compare/v1.26.0...v1.26.1) (2026-08-17)


### Bug Fixes

* Handle en dashes the same as em dashes ([4b5ae34](https://github.com/bbloomf/exsurge/commit/4b5ae343471420b3008a4c2bd2aa2b0494246853))

# [1.26.0](https://github.com/bbloomf/exsurge/compare/v1.25.2...v1.26.0) (2026-08-13)


### Features

* Handle em dash with no surrounding whitespace ([29305df](https://github.com/bbloomf/exsurge/commit/29305df3de56d45918f2e5952c2c192891a36758))

## [1.25.2](https://github.com/bbloomf/exsurge/compare/v1.25.1...v1.25.2) (2026-07-08)


### Bug Fixes

* Fix typing ([7c7223a](https://github.com/bbloomf/exsurge/commit/7c7223a0359d2ab870fbe904987ad5cbb8c884e4))

## [1.25.1](https://github.com/bbloomf/exsurge/compare/v1.25.0...v1.25.1) (2026-07-08)


### Features

* Add support for decoupling glyph scaling from staff scaling ([f7bef17](https://github.com/bbloomf/exsurge/commit/f7bef177c3b31e3d03a9a4bc007625427cedfe04))

# [1.25.0](https://github.com/bbloomf/exsurge/compare/v1.24.2...v1.25.0) (2026-07-08)


### Features

* Add glyphMultiplier option to setStaffHeight and setGlyphScaling ([9fb9865](https://github.com/bbloomf/exsurge/commit/9fb9865ec28fd4b0da9e79cfb7b2898023f35c3d))

## [1.24.2](https://github.com/bbloomf/exsurge/compare/v1.24.1...v1.24.2) (2026-06-07)


### Bug Fixes

* Adjust the podatus upper glyph at the end of a porrectus ([6183c28](https://github.com/bbloomf/exsurge/commit/6183c28d88fbafef37f9933ece2555947bb05af4))

## [1.24.1](https://github.com/bbloomf/exsurge/compare/v1.24.0...v1.24.1) (2026-06-05)


### Bug Fixes

* Fix podatus lower glyph when larger than a single step, and placement of upper glyph in same situations ([eb78bf2](https://github.com/bbloomf/exsurge/commit/eb78bf2a40beaa3c7c6fdc8ec5d2f74fd33d553a))

# [1.24.0](https://github.com/bbloomf/exsurge/compare/v1.23.1...v1.24.0) (2026-05-26)


### Bug Fixes

* Fix issue with ledger line above ([70acc8a](https://github.com/bbloomf/exsurge/commit/70acc8ae65240e78d11c1f76654f64456022f6d4))


### Features

* Allow n notes ([8e5fee9](https://github.com/bbloomf/exsurge/commit/8e5fee9fa19b05c0a32f94a2e4db7404a4f14b58))

## [1.23.1](https://github.com/bbloomf/exsurge/compare/v1.23.0...v1.23.1) (2026-05-23)


### Bug Fixes

* Fix redeclar ([997e8e3](https://github.com/bbloomf/exsurge/commit/997e8e39004bb7fea73d06ba060230ee5cd5aa5c))

# [1.23.0](https://github.com/bbloomf/exsurge/compare/v1.22.1...v1.23.0) (2026-05-23)


### Features

* Add support for 8th and 16th note beams ([13fced0](https://github.com/bbloomf/exsurge/commit/13fced04d0ac0b257849af1d500ab086a7ec504c))

## [1.22.1](https://github.com/bbloomf/exsurge/compare/v1.22.0...v1.22.1) (2026-04-26)


### Bug Fixes

* Update clef size ([dca950e](https://github.com/bbloomf/exsurge/commit/dca950e29ed53cd770a4092504b7872d249d0873))

# [1.22.0](https://github.com/bbloomf/exsurge/compare/v1.21.1...v1.22.0) (2026-04-26)


### Features

* Add support for ☧ clef ([0701173](https://github.com/bbloomf/exsurge/commit/070117368b3709b698ea9617823d6bc8a2127266))

## [1.21.1](https://github.com/bbloomf/exsurge/compare/v1.21.0...v1.21.1) (2026-04-22)


### Bug Fixes

* Restore podatus glyphs ([9a90599](https://github.com/bbloomf/exsurge/commit/9a90599e7796b7993693a6822cef280128d56351))

# [1.21.0](https://github.com/bbloomf/exsurge/compare/v1.20.1...v1.21.0) (2026-04-21)


### Features

* Add some new vertical positioning features ([be877b0](https://github.com/bbloomf/exsurge/commit/be877b0d73e5127a83a7d39c715a4621bb87c416))

## [1.20.1](https://github.com/bbloomf/exsurge/compare/v1.20.0...v1.20.1) (2025-10-01)


### Bug Fixes

* Fix issue with multiple v tags ([f2a862f](https://github.com/bbloomf/exsurge/commit/f2a862f9a6e8316d411c7a6d86f08f91ec3b8f28))

# [1.20.0](https://github.com/bbloomf/exsurge/compare/v1.19.1...v1.20.0) (2025-06-13)

## [1.19.1](https://github.com/bbloomf/exsurge/compare/v1.19.0...v1.19.1) (2024-12-11)

# [1.19.0](https://github.com/bbloomf/exsurge/compare/v1.18.0...v1.19.0) (2024-12-11)


### Features

* Add support for carryover (,_) etc. ([64acd8d](https://github.com/bbloomf/exsurge/commit/64acd8dff0beb56689f7295d6ccdf4e5032c200e))

# [1.18.0](https://github.com/bbloomf/exsurge/compare/v1.17.2...v1.18.0) (2024-11-18)


### Features

* Add new score option extendLastSystemStaffLines ([13b9825](https://github.com/bbloomf/exsurge/commit/13b98256c3145ba4a6fb103f5d3b5862cd19f279))

## [1.17.2](https://github.com/bbloomf/exsurge/compare/v1.17.1...v1.17.2) (2024-05-28)


### Bug Fixes

* Fix handling of 0 width when no chant was given ([0d18ae2](https://github.com/bbloomf/exsurge/commit/0d18ae2df556683f211ed3b0d4c4cbb4c64f3055))

## [1.17.1](https://github.com/bbloomf/exsurge/compare/v1.17.0...v1.17.1) (2024-03-28)


### Bug Fixes

* Fix font of ligatures ([fa72ff5](https://github.com/bbloomf/exsurge/commit/fa72ff55c90be9ebf235abdf5f6938f62ec38015))

# [1.17.0](https://github.com/bbloomf/exsurge/compare/v1.16.2...v1.17.0) (2024-03-28)


### Features

* Add support for <v>\'ae</v> style ligatures ([7c8dcf3](https://github.com/bbloomf/exsurge/commit/7c8dcf37cbd78161d898e3824c26288483f1667b))

## [1.16.2](https://github.com/bbloomf/exsurge/compare/v1.16.1...v1.16.2) (2024-03-19)


### Bug Fixes

* Fix issue with episema placement with odd number of staff lines ([43da242](https://github.com/bbloomf/exsurge/commit/43da24212f8bc0dbf2ed290744112dea54cbc035))
* **typings:** Add GabcHeader to type definitions ([9eceece](https://github.com/bbloomf/exsurge/commit/9eceece2c46de31f22dbb73965abb69345f5437d))


### Features

* Add support for treble clef ([ceac137](https://github.com/bbloomf/exsurge/commit/ceac137203cc7a725ab7f2bd67733436ac872d22))

## [1.16.1](https://github.com/bbloomf/exsurge/compare/v1.16.0...v1.16.1) (2024-03-13)


### Bug Fixes

* Handle e tag properly by not considering e tags when searching for vowels ([1cbc3bc](https://github.com/bbloomf/exsurge/commit/1cbc3bc7370fcc94d7c0b72e26376ffd98a97e1f))

# [1.16.0](https://github.com/bbloomf/exsurge/compare/v1.15.1...v1.16.0) (2024-03-13)


### Features

* Add basic support for elision <e> tag ([b5c8dd4](https://github.com/bbloomf/exsurge/commit/b5c8dd4d37d8e4deab28ce75a22f27dc6b66d618))

## [1.15.1](https://github.com/bbloomf/exsurge/compare/v1.15.0...v1.15.1) (2024-02-28)


### Bug Fixes

* Fix error that happens when pasting in long texts ([b88f6f6](https://github.com/bbloomf/exsurge/commit/b88f6f6e672177372b996e7f7d631cd46f504828))

# [1.15.0](https://github.com/bbloomf/exsurge/compare/v1.14.2...v1.15.0) (2024-02-23)


### Features

* Add support for lyric line height ([0ba8212](https://github.com/bbloomf/exsurge/commit/0ba8212b9ebbc9845f5effdec0cc1ef42a833b3d))

## [1.14.2](https://github.com/bbloomf/exsurge/compare/v1.14.1...v1.14.2) (2024-01-11)

## [1.14.1](https://github.com/bbloomf/exsurge/compare/v1.14.0...v1.14.1) (2024-01-01)


### Bug Fixes

* Fix issue with custos layout ([b8e5fe2](https://github.com/bbloomf/exsurge/commit/b8e5fe286c4135f5348bc20dc7f576a7901e1c24))

# [1.14.0](https://github.com/bbloomf/exsurge/compare/v1.13.18...v1.14.0) (2023-12-04)


### Features

* Add support for 5 line staff ([a3e403a](https://github.com/bbloomf/exsurge/commit/a3e403aac263584ec61d126109a3521123fe0157))

## [1.13.18](https://github.com/bbloomf/exsurge/compare/v1.13.17...v1.13.18) (2023-11-28)

## [1.13.17](https://github.com/bbloomf/exsurge/compare/v1.13.16...v1.13.17) (2023-11-28)


### Bug Fixes

* Fix typing ([2c733d0](https://github.com/bbloomf/exsurge/commit/2c733d06e9a3d9bbf3d14ac7c17c88352576366c))

## [1.13.16](https://github.com/bbloomf/exsurge/compare/v1.13.15...v1.13.16) (2023-11-28)

## [1.13.15](https://github.com/bbloomf/exsurge/compare/v1.13.14...v1.13.15) (2023-09-18)


### Bug Fixes

* Fix handling of clivis with terminating liquescent ([3b0d58c](https://github.com/bbloomf/exsurge/commit/3b0d58cba935503595746e95661629f3b4684733))

## [1.13.14](https://github.com/bbloomf/exsurge/compare/v1.13.13...v1.13.14) (2023-08-31)


### Bug Fixes

* Fix bug with InsertionCursor class being missing from minified produced SVG ([c6da0bc](https://github.com/bbloomf/exsurge/commit/c6da0bc2e4964bde9a78a484d788216f26098d2d))

## [1.13.13](https://github.com/bbloomf/exsurge/compare/v1.13.12...v1.13.13) (2023-08-29)


### Bug Fixes

* add back in annotation.getFromSvgElem ([f08243a](https://github.com/bbloomf/exsurge/commit/f08243a7d87afff77a500a1bbf08b53d70bc386b))

## [1.13.12](https://github.com/bbloomf/exsurge/compare/v1.13.11...v1.13.12) (2023-08-29)


### Bug Fixes

* Fix isse with annotations ([239610e](https://github.com/bbloomf/exsurge/commit/239610e26ce7d812858745a74b6b4820113a4321))

## [1.13.11](https://github.com/bbloomf/exsurge/compare/v1.13.10...v1.13.11) (2023-08-29)


### Bug Fixes

* Fix typo ([0d58cc3](https://github.com/bbloomf/exsurge/commit/0d58cc3ef2ecf3caf477560d2324f7f5569b6cc4))

## [1.13.10](https://github.com/bbloomf/exsurge/compare/v1.13.9...v1.13.10) (2023-08-29)


### Bug Fixes

* Add getFromSvgElem for annotation ([9a3d1a9](https://github.com/bbloomf/exsurge/commit/9a3d1a9f49b463e9fd37238cf6a17bcea57bcce7))

## [1.13.9](https://github.com/bbloomf/exsurge/compare/v1.13.8...v1.13.9) (2023-08-29)


### Bug Fixes

* Set sourceGabc in Annotation constructor ([ee305cf](https://github.com/bbloomf/exsurge/commit/ee305cfba31f68bbdf36e2588cd6fe2a93bbb1ea))

## [1.13.8](https://github.com/bbloomf/exsurge/compare/v1.13.7...v1.13.8) (2023-08-25)


### Bug Fixes

* Fix handling of sc tag when calculating GABC source on drop cap ([14296df](https://github.com/bbloomf/exsurge/commit/14296df77962cfd9f909c3ab1fecba62e3f54bb6))

## [1.13.7](https://github.com/bbloomf/exsurge/compare/v1.13.6...v1.13.7) (2023-06-21)


### Bug Fixes

* Fixed xml namespace ([c6bbb00](https://github.com/bbloomf/exsurge/commit/c6bbb00ff17c20bf454ee0d854f4fda4ffc9573b))

## [1.13.6](https://github.com/bbloomf/exsurge/compare/v1.13.5...v1.13.6) (2023-06-21)

## [1.13.5](https://github.com/bbloomf/exsurge/compare/v1.13.5-2...v1.13.5) (2023-06-20)


### Reverts

* Revert "part of last non-release commit" ([c6074e2](https://github.com/bbloomf/exsurge/commit/c6074e28e2e851a5c9cc918a4d34ce66ddd1d500))

## [1.13.5-2](https://github.com/bbloomf/exsurge/compare/v1.13.5-1...v1.13.5-2) (2023-06-20)

## [1.13.5-1](https://github.com/bbloomf/exsurge/compare/v1.13.5-0...v1.13.5-1) (2023-06-20)

## [1.13.5-0](https://github.com/bbloomf/exsurge/compare/v1.13.4-0...v1.13.5-0) (2023-06-20)

## [1.13.4-0](https://github.com/bbloomf/exsurge/compare/v1.13.3...v1.13.4-0) (2023-06-20)

## [1.13.3](https://github.com/bbloomf/exsurge/compare/v1.13.2...v1.13.3) (2023-06-20)

## [1.13.2](https://github.com/bbloomf/exsurge/compare/v1.13.1...v1.13.2) (2023-06-20)


### Bug Fixes

* Fix issue with running from node ([76b1437](https://github.com/bbloomf/exsurge/commit/76b14371123387a3852f0b866b91b6ba373b7ce0))

## [1.13.1](https://github.com/bbloomf/exsurge/compare/v1.13.0...v1.13.1) (2023-06-19)

# [1.13.0](https://github.com/bbloomf/exsurge/compare/v1.12.3...v1.13.0) (2023-06-16)


### Features

* Add a way to override getFontFilenameForProperties ([3f70422](https://github.com/bbloomf/exsurge/commit/3f704222bb32f46b3e1aa5137d3307462d836f73))

## [1.12.3](https://github.com/bbloomf/exsurge/compare/v1.12.2...v1.12.3) (2023-05-01)

## [1.12.2](https://github.com/bbloomf/exsurge/compare/v1.12.1...v1.12.2) (2023-05-01)

## [1.12.1](https://github.com/bbloomf/exsurge/compare/v1.12.0...v1.12.1) (2023-05-01)

# [1.12.0](https://github.com/bbloomf/exsurge/compare/v1.11.1...v1.12.0) (2023-04-14)


### Features

* Improve efficiency of re-rendering after changing context tag properties ([407b6c5](https://github.com/bbloomf/exsurge/commit/407b6c506e544d8135b3a1d7885569946e4428cd))

## [1.11.1](https://github.com/bbloomf/exsurge/compare/v1.11.0...v1.11.1) (2023-04-11)


### Bug Fixes

* Fix code order ([5d1ff43](https://github.com/bbloomf/exsurge/commit/5d1ff43db4bd424890af537ee52f7498c4de1094))

# [1.11.0](https://github.com/bbloomf/exsurge/compare/v1.10.6...v1.11.0) (2023-04-11)


### Features

* Move setting for whether to merge annotation with text-left into ChantContext ([13e820b](https://github.com/bbloomf/exsurge/commit/13e820bd3a28f7b471dea18025001a3a198979bd))

## [1.10.6](https://github.com/bbloomf/exsurge/compare/v1.10.5...v1.10.6) (2023-01-19)

## [1.10.5](https://github.com/bbloomf/exsurge/compare/v1.10.4...v1.10.5) (2022-10-21)


### Bug Fixes

* Fix an issue with episema above a punctum ([486cb3b](https://github.com/bbloomf/exsurge/commit/486cb3b4c6060beef80fbe7059401eb31d6c0b2a))

## [1.10.4](https://github.com/bbloomf/exsurge/compare/v1.10.3...v1.10.4) (2022-09-28)

## [1.10.3](https://github.com/bbloomf/exsurge/compare/v1.10.2...v1.10.3) (2022-08-16)


### Bug Fixes

* Fix the count of syllables and notes ([4ab8c17](https://github.com/bbloomf/exsurge/commit/4ab8c1738580a29e7e748020f4a9d7a41e9d5ee6))

## [1.10.2](https://github.com/bbloomf/exsurge/compare/v1.10.1...v1.10.2) (2022-08-16)


### Bug Fixes

* Fix types ([78f9c2d](https://github.com/bbloomf/exsurge/commit/78f9c2d29f7e5752069b4e7a070de5f319680a6d))

## [1.10.1](https://github.com/bbloomf/exsurge/compare/v1.10.0...v1.10.1) (2022-08-16)


### Bug Fixes

* Fix types ([06f528d](https://github.com/bbloomf/exsurge/commit/06f528db0fa27e26af1fe8d1c7074753515215c4))

# [1.10.0](https://github.com/bbloomf/exsurge/compare/v1.9.7...v1.10.0) (2022-08-16)


### Features

* Support new context properties for controlling a minimum number of syllables and notes on the last system ([6798238](https://github.com/bbloomf/exsurge/commit/67982388826b526fc8f451dbbc8d8df5d9f0edf4))

## [1.9.7](https://github.com/bbloomf/exsurge/compare/v1.9.6...v1.9.7) (2022-07-14)


### Bug Fixes

* Fix another issue with getting properties for plus or asterisk ([944d01a](https://github.com/bbloomf/exsurge/commit/944d01a73567d7e8526c4f2c169c7ecf2514ec0d))

## [1.9.6](https://github.com/bbloomf/exsurge/compare/v1.9.5...v1.9.6) (2022-07-14)


### Bug Fixes

* Fix an issue with asterisk properties typeo ([88a31d8](https://github.com/bbloomf/exsurge/commit/88a31d8c46788f76383910469f37d3f73ec22d3d))

## [1.9.5](https://github.com/bbloomf/exsurge/compare/v1.9.4...v1.9.5) (2022-07-14)


### Bug Fixes

* Fix character replacement of a single + or * ([040e15d](https://github.com/bbloomf/exsurge/commit/040e15dfea812a1a6ef25e6a7d5bcc0f851eb613))

## [1.9.4](https://github.com/bbloomf/exsurge/compare/v1.9.3...v1.9.4) (2022-07-14)


### Bug Fixes

* Fix an issue with mixing commands and text inside v tags ([758e4f2](https://github.com/bbloomf/exsurge/commit/758e4f2a791c7e39f0fc39d5ebe73dcc0d279a2a))

## [1.9.3](https://github.com/bbloomf/exsurge/compare/v1.9.2...v1.9.3) (2022-07-14)


### Bug Fixes

* Fix an issue with asterisk replacement ([f01c9fe](https://github.com/bbloomf/exsurge/commit/f01c9fe9abaafbc0e9b8d9e53bf59a0489dc4ef1))

## [1.9.2](https://github.com/bbloomf/exsurge/compare/v1.9.1...v1.9.2) (2022-07-14)


### Bug Fixes

* Fix an issue with character substitution etc happening within <v> tags ([0fa6fdc](https://github.com/bbloomf/exsurge/commit/0fa6fdce73ad371cf713178224ad1fe7b48632a4))

## [1.9.1](https://github.com/bbloomf/exsurge/compare/v1.9.0...v1.9.1) (2022-07-14)


### Bug Fixes

* Update type definitions ([e9ce2cc](https://github.com/bbloomf/exsurge/commit/e9ce2ccfbd358df5da54d7c3f10352215d68d35b))

# [1.9.0](https://github.com/bbloomf/exsurge/compare/v1.8.0...v1.9.0) (2022-07-14)


### Features

* Add greextra glyph names etc. ([8af0145](https://github.com/bbloomf/exsurge/commit/8af01454ee8ed65b19f615a656ae317b767edf34))

# [1.8.0](https://github.com/bbloomf/exsurge/compare/v1.7.0...v1.8.0) (2022-07-13)


### Features

* Add support for font tag and family="" class="" and fill="" attributes ([09e73be](https://github.com/bbloomf/exsurge/commit/09e73bebebfa552b1746941f78ee93f1f5131d51))

# [1.7.0](https://github.com/bbloomf/exsurge/compare/v1.6.5...v1.7.0) (2022-07-11)


### Features

* Add <sp>'oe</sp> notation ([8fe32b5](https://github.com/bbloomf/exsurge/commit/8fe32b5f61c1db9109f6ee4803b46162de077ec2))

## [1.6.5](https://github.com/bbloomf/exsurge/compare/v1.6.4...v1.6.5) (2022-06-27)

## [1.6.4](https://github.com/bbloomf/exsurge/compare/v1.6.3...v1.6.4) (2022-06-24)

## [1.6.3](https://github.com/bbloomf/exsurge/compare/v1.6.2...v1.6.3) (2022-06-24)


### Bug Fixes

* Fix an issue with centering bars between neumes ([5fa3194](https://github.com/bbloomf/exsurge/commit/5fa3194bc01a57ab7611dd9dac3433357a519547))

## [1.6.2](https://github.com/bbloomf/exsurge/compare/v1.6.1...v1.6.2) (2022-06-23)

## [1.6.1](https://github.com/bbloomf/exsurge/compare/v1.6.0...v1.6.1) (2022-06-21)

# [1.6.0](https://github.com/bbloomf/exsurge/compare/v1.5.3...v1.6.0) (2021-10-20)


### Features

* Add rubric class to rubrical tspans ([01bc6d5](https://github.com/bbloomf/exsurge/commit/01bc6d5bf9a0f0a1555fd605d8d84b1588b95788))

## [1.5.3](https://github.com/bbloomf/exsurge/compare/v1.5.2...v1.5.3) (2021-09-13)


### Bug Fixes

* Fix issue with rendering punca linea ([557b172](https://github.com/bbloomf/exsurge/commit/557b172227e199a8bfd0f3c8941f953357a751ba))

## [1.5.2](https://github.com/bbloomf/exsurge/compare/v1.5.1...v1.5.2) (2021-09-07)


### Bug Fixes

* Fix an issue with linea visualizer's createSvgFragment method ([3a82fd3](https://github.com/bbloomf/exsurge/commit/3a82fd3004ba53d362c75cbd7059abcb59f6283c))

## [1.5.1](https://github.com/bbloomf/exsurge/compare/v1.5.0...v1.5.1) (2021-09-07)


### Bug Fixes

* Fix an issue with spacing around puncta cava with linea ([eda9ad9](https://github.com/bbloomf/exsurge/commit/eda9ad94581aff55ab47cd2e783b882d12e85576))

# [1.5.0](https://github.com/bbloomf/exsurge/compare/v1.4.2...v1.5.0) (2021-09-03)


### Features

* Support R and r0 modifiers and V ([401a02a](https://github.com/bbloomf/exsurge/commit/401a02a7fef13b980d3b7249bb1a83f835df2183))

## [1.4.2](https://github.com/bbloomf/exsurge/compare/v1.4.1...v1.4.2) (2021-07-28)


### Bug Fixes

* <v> tags in GABC can now include parentheses so that open parenthesis can be represented in lyrics ([52edd46](https://github.com/bbloomf/exsurge/commit/52edd46679bf68e8bbc1ec258e7e1ea3e6d646e1))

## [1.4.1](https://github.com/bbloomf/exsurge/compare/v1.4.0...v1.4.1) (2021-03-05)


### Bug Fixes

* Fix an issue with note element class names ([ef6dd94](https://github.com/bbloomf/exsurge/commit/ef6dd941ea49ee5446f0176c3dda1ca6a210c278))

# [1.4.0](https://github.com/bbloomf/exsurge/compare/v1.3.0...v1.4.0) (2021-03-05)


### Features

* Add ids to note elements ([737a6f2](https://github.com/bbloomf/exsurge/commit/737a6f290d1c7beb63bb5be127d85fb25ae29d77))

# [1.3.0](https://github.com/bbloomf/exsurge/compare/v1.2.1...v1.3.0) (2021-01-20)


### Features

* Add optional context function for mapping annotations to text left ([3726a9f](https://github.com/bbloomf/exsurge/commit/3726a9f5acd80b13899243396d67294bac095107))

## [1.2.1](https://github.com/bbloomf/exsurge/compare/v1.2.0...v1.2.1) (2021-01-14)


### Bug Fixes

* Disallow versicle/response symbols for dropcap ([7be2db9](https://github.com/bbloomf/exsurge/commit/7be2db958190b40480bee4abfabebae211f17772))

# [1.2.0](https://github.com/bbloomf/exsurge/compare/v1.1.2...v1.2.0) (2021-01-12)


### Features

* Allow unicode ℣ and ℟ to be used for versicle response symbols ([ce55bc4](https://github.com/bbloomf/exsurge/commit/ce55bc418b1cb09537156ae310414df5ebcadde5))

## [1.1.2](https://github.com/bbloomf/exsurge/compare/v1.1.1...v1.1.2) (2020-12-23)


### Bug Fixes

* Fix ocba (accented brace) ([6079102](https://github.com/bbloomf/exsurge/commit/6079102f72a31e7d603ef5ace521125b86003c0d))

## [1.1.1](https://github.com/bbloomf/exsurge/compare/v1.1.0...v1.1.1) (2020-12-11)


### Bug Fixes

* Fix null pointer exception ([a516d1c](https://github.com/bbloomf/exsurge/commit/a516d1c7aa0f10ccb3124402f17d867b67242cdf))

# [1.1.0](https://github.com/bbloomf/exsurge/compare/v1.0.7...v1.1.0) (2020-12-08)


### Features

* Allow old style exsurge versicle/antiphon/symbol ([59d903a](https://github.com/bbloomf/exsurge/commit/59d903a7e24d5f02f085f0a389e1be1038bf0340))

## [1.0.7](https://github.com/bbloomf/exsurge/compare/v1.0.6...v1.0.7) (2020-12-08)


### Bug Fixes

* Fix a bug with relaying out morae on a clivis ([83b8aa9](https://github.com/bbloomf/exsurge/commit/83b8aa946539b96f2b2f596e47cacefb71f5eb3b))

## [1.0.6](https://github.com/bbloomf/exsurge/compare/v1.0.5...v1.0.6) (2020-12-07)


### Bug Fixes

* Allow children to be an array ([a141c82](https://github.com/bbloomf/exsurge/commit/a141c82de61ec24f1852c599dad2f3b25cce88af))

## [1.0.5](https://github.com/bbloomf/exsurge/compare/v1.0.4...v1.0.5) (2020-12-04)


### Bug Fixes

* Fix a couple minor bugs ([dac8010](https://github.com/bbloomf/exsurge/commit/dac801094bea331cbc9339d302d5d9fd8cb459db))

## [1.0.4](https://github.com/bbloomf/exsurge/compare/v1.0.3...v1.0.4) (2020-12-03)


### Bug Fixes

* **english:** Center neume around elided syllables in English ([9cc7d0c](https://github.com/bbloomf/exsurge/commit/9cc7d0cd831643e8a6b2fb7cdcc004a3a83da3b2))
* **exsurge:** Fix algorithm for controlling whether to condense the space between two lyric words during justification ([59bce69](https://github.com/bbloomf/exsurge/commit/59bce6911eed1813d6511d51d7ae8833e2e9993b))
* **exsurge:** Fix rendering issue that was causing puncta to collide in some cases ([0fb6a2e](https://github.com/bbloomf/exsurge/commit/0fb6a2e8f8d53fec526e2671bd95fa51b4f41417))

## [1.0.3](https://github.com/bbloomf/exsurge/compare/v1.0.2...v1.0.3) (2020-08-26)


### Bug Fixes

* **english:** Center neume around elided syllables in English ([c37586b](https://github.com/bbloomf/exsurge/commit/c37586be3b3c67ca3da927f671c25e404b8eb8d6))

## [1.0.2](https://github.com/bbloomf/exsurge/compare/v1.0.1...v1.0.2) (2020-08-05)


### Bug Fixes

* **exsurge:** Fix algorithm for controlling whether to condense the space between two lyric words during justification ([394fb62](https://github.com/bbloomf/exsurge/commit/394fb62c98e8ca0d34aacb7464baced7dd7ec311))

## [1.0.1](https://github.com/bbloomf/exsurge/compare/v1.0.0...v1.0.1) (2020-08-04)


### Bug Fixes

* **exsurge:** Fix rendering issue that was causing puncta to collide in some cases ([f8c1c0f](https://github.com/bbloomf/exsurge/commit/f8c1c0feecb4775eed2eb61b27b953e91ca733a9))

# [1.0.0](https://github.com/bbloomf/exsurge/compare/afd8f3d21e8f9a1dba6b32934b634ccda483d2ed...v1.0.0) (2020-06-08)


### Bug Fixes

* **exsurge.drawing, exsurge.chant:** namespace exsurge styles ([afd8f3d](https://github.com/bbloomf/exsurge/commit/afd8f3d21e8f9a1dba6b32934b634ccda483d2ed))
