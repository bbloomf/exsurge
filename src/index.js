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

// import { Annotation, ChantContext } from './Exsurge.Drawing.js'
// import { Gabc } from './Exsurge.Gabc.js'
//
// // client side support
//
// if (typeof document !== 'undefined' && document.registerElement) {
//   var ChantVisualElementPrototype = Object.create(HTMLElement.prototype);
//
//   ChantVisualElementPrototype.createdCallback = function() {
//     var ctxt = new ChantContext();
//
//     ctxt.setFont("'Crimson Text', serif", 19.2);
//
//     var useDropCap = true;
//     var useDropCapAttr = this.getAttribute("use-drop-cap");
//     if (useDropCapAttr === 'false')
//       useDropCap = false;
//
//     var score = Gabc.loadChantScore(ctxt, this.innerText, useDropCap);
//
//     var annotationAttr = this.getAttribute("annotation");
//     if (annotationAttr) {
//       // add an annotation
//       score.annotation = new Annotation(ctxt, annotationAttr);
//     }
//
//     var _element = this;
//
//     var width = 0;
//     var doLayout = function() {
//       var newWidth = _element.parentElement.clientWidth;
//       if(width === newWidth) return;
//       width = newWidth;
//       // perform layout on the chant
//       score.performLayout(ctxt, function() {
//         score.layoutChantLines(ctxt, width, function() {
//           // render the score to svg code
//           _element.appendElement(score.createSvgNode(ctxt));
//         });
//       });
//     }
//     doLayout();
//     if (window.addEventListener)
//       window.addEventListener('resize',doLayout,false);
//     else if (window.attachEvent)
//       window.attachEvent('onresize',doLayout);
//   }
//
//   ChantVisualElementPrototype.attachedCallback = function() {
//
//   }
//
//   // register the custom element
//   // if(window.customElements && window.customElements.define) {
//   //   window.customElements.define('chant-visual', ChantVisualElementPrototype);
//   // } else {
//     document.registerElement('chant-visual', {
//       prototype: ChantVisualElementPrototype
//     });
//   // }
// }

export * from './Exsurge.Core.js'
export * from './Exsurge.Text.js'
export * from './Exsurge.Glyphs.js'
export * from './Exsurge.Drawing.js'
export * from './Exsurge.Chant.js'
export * from './Exsurge.Chant.ChantLine.js'
export * from './Exsurge.Chant.Markings.js'
export * from './Exsurge.Chant.Signs.js'
export * from './Exsurge.Chant.Neumes.js'
export * from './Exsurge.Gabc.js'
export * from './Exsurge.Titles.js'
export * from './greextraGlyphs.js'
