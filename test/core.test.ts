//
// Author(s):
// Fr. Matthew Spencer, OSJ <mspencer@osjusa.org>
//
// Copyright (c) 2008-2016 Fr. Matthew Spencer, OSJ
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

import assert from "node:assert";
import { describe, it } from "vitest";
import * as Exsurge from "../src/index.js";



describe('Core functionality', function() {

  it('Point object', function() {
    var point = new Exsurge.Point(3.14, 159.26);
    assert.strictEqual(point.x, 3.14);
    assert.strictEqual(point.y, 159.26);

    var clone = point.clone();
    assert.strictEqual(clone.x, 3.14);
    assert.strictEqual(clone.y, 159.26);

    assert.strictEqual(point.equals(clone), true);
    assert.strictEqual(point.equals(new Exsurge.Point()), false);
  });

  it('Rect object', function() {

    var rect = new Exsurge.Rect(3, 1, 4, 5);
    assert.strictEqual(rect.x, 3);
    assert.strictEqual(rect.y, 1);
    assert.strictEqual(rect.width, 4);
    assert.strictEqual(rect.height, 5);

    var clone = rect.clone();
    assert.strictEqual(clone.x, 3);
    assert.strictEqual(clone.y, 1);
    assert.strictEqual(clone.width, 4);
    assert.strictEqual(clone.height, 5);

    assert.strictEqual(rect.isEmpty(), false);

    assert.strictEqual(rect.right(), 3 + 4);
    assert.strictEqual(rect.bottom(), 1 + 5);

    assert.strictEqual(rect.equals(clone), true);

    var badRect = new Exsurge.Rect();
    assert.strictEqual(badRect.isEmpty(), true);

    assert.strictEqual(rect.equals(badRect), false);

    // fixme: test Rect.contains and Rect.union
  });

  it('Margins object', function() {
    var margins = new Exsurge.Margins(10, 11, 12, 13);
    assert.strictEqual(margins.left, 10);
    assert.strictEqual(margins.top, 11);
    assert.strictEqual(margins.right, 12);
    assert.strictEqual(margins.bottom, 13);

    var clone = margins.clone();
    assert.strictEqual(clone.left, 10);
    assert.strictEqual(clone.top, 11);
    assert.strictEqual(clone.right, 12);
    assert.strictEqual(clone.bottom, 13);

    assert.strictEqual(margins.equals(clone), true);
  });

  it('Size object', function() {
    var size = new Exsurge.Size(3.14, 159.26);
    assert.strictEqual(size.width, 3.14);
    assert.strictEqual(size.height, 159.26);

    var clone = size.clone();
    assert.strictEqual(clone.width, 3.14);
    assert.strictEqual(clone.height, 159.26);

    assert.strictEqual(size.equals(clone), true);
    assert.strictEqual(size.equals(new Exsurge.Size()), false);
  });
});

describe('Latin syllabification', function() {

  var lang = new Exsurge.Latin();

  var assertWordSyllables = function(word: string[], syllables: string[]) {
    assert.strictEqual(word.length, syllables.length);

    for (var i = 0; i < word.length; i++) {
      assert.strictEqual(word[i], syllables[i]);
    }
  }

  it("Syllabify 'Puer natus est'", function() {

    var words = lang.syllabify('Puer natus est');
    assert.strictEqual(words.length, 3);

    assertWordSyllables(words[0], ['Pu', 'er']);
    assertWordSyllables(words[1], ['na', 'tus']);
    assertWordSyllables(words[2], ['est']);
  });
});
