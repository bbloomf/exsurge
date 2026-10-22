#!/usr/bin/env node
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

'use strict';

const parse = require('yargs-parser');
const args = parse(process.argv.slice(2));

if (args._.length < 1) {
    console.log(
        "Rendering Gregorian Chant in square note notation\n\n" +
        "Usage:\n exsurge [--width=1000] [--annotation=...] [--use-drop-cap[=false]] file_or_source <output file>,\n"
    );
    process.exit();
}

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

global.window = (new JSDOM(``, { pretendToBeVisual: true })).window;
global.document = window.document

// mock
window.HTMLCanvasElement.prototype.getContext = () => {return null};
window.SVGElement.prototype.getBBox = () => ({x: 0, y: 0, width: 10, height: 10});
window.SVGElement.prototype.getSubStringLength = () => (10);

const fs = require('fs');
const source = fs.existsSync(args._[0]) ? fs.readFileSync(args._[0]).toString() : args._[0];

const exsurge = require('..');

const ctxt = new exsurge.ChantContext();
const mappings = exsurge.Gabc.createMappingsFromSource(ctxt, source);
const score = new exsurge.ChantScore(ctxt, mappings, args.useDropCap !== 'false');

if (args.annotation) {
    score.annotation = new exsurge.Annotation(ctxt, args.annotation);
}

const width = args.width || 1000;

score.performLayout(ctxt, function() {
    score.layoutChantLines(ctxt, width, function() {
        const svg = score.createSvgNode(ctxt);
        console.log(svg);
    });
});
