(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("exsurge", [], factory);
	else if(typeof exports === 'object')
		exports["exsurge"] = factory();
	else
		root["exsurge"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

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
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _ExsurgeCore = __webpack_require__(1);
	
	Object.keys(_ExsurgeCore).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeCore[key];
	    }
	  });
	});
	
	var _ExsurgeText = __webpack_require__(2);
	
	Object.keys(_ExsurgeText).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeText[key];
	    }
	  });
	});
	
	var _ExsurgeGlyphs = __webpack_require__(3);
	
	Object.keys(_ExsurgeGlyphs).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeGlyphs[key];
	    }
	  });
	});
	
	var _ExsurgeDrawing = __webpack_require__(4);
	
	Object.keys(_ExsurgeDrawing).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeDrawing[key];
	    }
	  });
	});
	
	var _ExsurgeChant = __webpack_require__(8);
	
	Object.keys(_ExsurgeChant).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeChant[key];
	    }
	  });
	});
	
	var _ExsurgeChantChantLine = __webpack_require__(9);
	
	Object.keys(_ExsurgeChantChantLine).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeChantChantLine[key];
	    }
	  });
	});
	
	var _ExsurgeChantMarkings = __webpack_require__(10);
	
	Object.keys(_ExsurgeChantMarkings).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeChantMarkings[key];
	    }
	  });
	});
	
	var _ExsurgeChantSigns = __webpack_require__(11);
	
	Object.keys(_ExsurgeChantSigns).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeChantSigns[key];
	    }
	  });
	});
	
	var _ExsurgeChantNeumes = __webpack_require__(13);
	
	Object.keys(_ExsurgeChantNeumes).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeChantNeumes[key];
	    }
	  });
	});
	
	var _ExsurgeGabc = __webpack_require__(12);
	
	Object.keys(_ExsurgeGabc).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeGabc[key];
	    }
	  });
	});
	
	var _ExsurgeTitles = __webpack_require__(14);
	
	Object.keys(_ExsurgeTitles).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _ExsurgeTitles[key];
	    }
	  });
	});
	
	var _greextraGlyphs = __webpack_require__(7);
	
	Object.keys(_greextraGlyphs).forEach(function (key) {
	  if (key === "default" || key === "__esModule") return;
	  Object.defineProperty(exports, key, {
	    enumerable: true,
	    get: function get() {
	      return _greextraGlyphs[key];
	    }
	  });
	});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	exports.DeviceIndependent = DeviceIndependent;
	exports.Centimeters = Centimeters;
	exports.Millimeters = Millimeters;
	exports.Inches = Inches;
	exports.ToCentimeters = ToCentimeters;
	exports.ToMillimeters = ToMillimeters;
	exports.ToInches = ToInches;
	exports.generateRandomGuid = generateRandomGuid;
	exports.getCssForProperties = getCssForProperties;
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
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
	
	var Units = exports.Units = {
	  // enums
	  DeviceIndepenedent: 0, // device independent units: 96/inch
	  Centimeters: 1,
	  Millimeters: 2,
	  Inches: 3,
	
	  // constants for device independent units (diu)
	  DIU_PER_INCH: 96,
	  DIU_PER_CENTIMETER: 96 / 2.54,
	
	  ToDeviceIndependent: function ToDeviceIndependent(n, inputUnits) {
	    switch (inputUnits) {
	      case Centimeters:
	        return n * Units.DIU_PER_CENTIMETER;
	      case Millimeters:
	        return n * Units.DIU_PER_CENTIMETER / 10;
	      case Inches:
	        return n * Units.DIU_PER_INCH;
	      default:
	        return n;
	    }
	  },
	
	  FromDeviceIndependent: function FromDeviceIndependent(n, outputUnits) {
	    switch (outputUnits) {
	      case Centimeters:
	        return n / Units.DIU_PER_CENTIMETER;
	      case Millimeters:
	        return n / Units.DIU_PER_CENTIMETER * 10;
	      case Inches:
	        return n / Units.DIU_PER_INCH;
	      default:
	        return n;
	    }
	  },
	
	  StringToUnitsType: function StringToUnitsType(s) {
	    switch (s.ToLower()) {
	      case "in":
	      case "inches":
	        return Units.Inches;
	
	      case "cm":
	      case "centimeters":
	        return Units.Centimeters;
	
	      case "mm":
	      case "millimeters":
	        return Units.Millimeters;
	
	      case "di":
	      case "device-independent":
	        return Units.DeviceIndepenedent;
	
	      default:
	        return Units.DeviceIndepenedent;
	    }
	  },
	
	  UnitsTypeToString: function UnitsTypeToString(units) {
	    switch (units) {
	      case Units.Inches:
	        return "in";
	      case Units.Centimeters:
	        return "cm";
	      case Units.Millimeters:
	        return "mm";
	      case Units.DeviceIndepenedent:
	        return "device-independent";
	      default:
	        return "device-independent";
	    }
	  }
	};
	
	function DeviceIndependent(n) {
	  return n;
	}
	
	function Centimeters(n) {
	  return Units.ToDeviceIndependent(n, Units.Centimeters);
	}
	
	function Millimeters(n) {
	  return Units.ToDeviceIndependent(n, Units.Millimeters);
	}
	
	function Inches(n) {
	  return Units.ToDeviceIndependent(n, Units.Inches);
	}
	
	function ToCentimeters(n) {
	  return Units.FromDeviceIndependent(n, Units.Centimeters);
	}
	
	function ToMillimeters(n) {
	  return Units.FromDeviceIndependent(n, Units.Millimeters);
	}
	
	function ToInches(n) {
	  return Units.FromDeviceIndependent(n, Units.Inches);
	}
	
	/*
	 * Point
	 */
	
	var Point = exports.Point = function () {
	  function Point(x, y) {
	    _classCallCheck(this, Point);
	
	    this.x = typeof x !== 'undefined' ? x : 0;
	    this.y = typeof y !== 'undefined' ? y : 0;
	  }
	
	  _createClass(Point, [{
	    key: "clone",
	    value: function clone() {
	      return new Point(this.x, this.y);
	    }
	  }, {
	    key: "equals",
	    value: function equals(point) {
	      return this.x === point.x && this.y === point.y;
	    }
	  }]);
	
	  return Point;
	}();
	
	/*
	 * Rect
	 */
	
	
	var Rect = exports.Rect = function () {
	  function Rect(x, y, width, height) {
	    _classCallCheck(this, Rect);
	
	    this.x = typeof x !== 'undefined' ? x : Infinity;
	    this.y = typeof y !== 'undefined' ? y : Infinity;
	    this.width = typeof width !== 'undefined' ? width : -Infinity;
	    this.height = typeof height !== 'undefined' ? height : -Infinity;
	  }
	
	  _createClass(Rect, [{
	    key: "clone",
	    value: function clone() {
	      return new Rect(this.x, this.y, this.width, this.height);
	    }
	  }, {
	    key: "isEmpty",
	    value: function isEmpty() {
	      return this.x === Infinity && this.y === Infinity && this.width === -Infinity && this.height === -Infinity;
	    }
	
	    // convenience method
	
	  }, {
	    key: "right",
	    value: function right() {
	      return this.x + this.width;
	    }
	  }, {
	    key: "bottom",
	    value: function bottom() {
	      return this.y + this.height;
	    }
	  }, {
	    key: "equals",
	    value: function equals(rect) {
	      return this.x === rect.x && this.y === rect.y && this.width === rect.width && this.height === rect.height;
	    }
	
	    // other can be a Point or a Rect
	
	  }, {
	    key: "contains",
	    value: function contains(other) {
	      if (other instanceof Point) {
	        return other.x >= this.x && other.x <= this.x + this.width && other.y >= this.y && other.y <= this.y + this.height;
	      } else {
	        // better be instance of Rect
	        return this.x <= other.x && this.x + this.width >= other.x + other.width && this.y <= other.y && this.y + this.height >= other.y + other.height;
	      }
	    }
	  }, {
	    key: "union",
	    value: function union(rect) {
	
	      var right = Math.max(this.x + this.width, rect.x + rect.width);
	      var bottom = Math.max(this.y + this.height, rect.y + rect.height);
	
	      this.x = Math.min(this.x, rect.x);
	      this.y = Math.min(this.y, rect.y);
	
	      this.width = right - this.x;
	      this.height = bottom - this.y;
	    }
	  }]);
	
	  return Rect;
	}();
	
	/**
	 * Margins
	 *
	 * @class
	 */
	
	
	var Margins = exports.Margins = function () {
	  function Margins(left, top, right, bottom) {
	    _classCallCheck(this, Margins);
	
	    this.left = typeof left !== 'undefined' ? left : 0;
	    this.top = typeof top !== 'undefined' ? top : 0;
	    this.right = typeof right !== 'undefined' ? right : 0;
	    this.bottom = typeof bottom !== 'undefined' ? bottom : 0;
	  }
	
	  _createClass(Margins, [{
	    key: "clone",
	    value: function clone() {
	      return new Margins(this.left, this.top, this.right, this.bottom);
	    }
	  }, {
	    key: "equals",
	    value: function equals(margins) {
	      return this.left === margins.left && this.top === margins.top && this.right === margins.right && this.bottom === margins.bottom;
	    }
	  }]);
	
	  return Margins;
	}();
	
	/**
	 * Size
	 *
	 * @class
	 */
	
	
	var Size = exports.Size = function () {
	  function Size(width, height) {
	    _classCallCheck(this, Size);
	
	    this.width = typeof width !== 'undefined' ? width : 0;
	    this.height = typeof height !== 'undefined' ? height : 0;
	  }
	
	  _createClass(Size, [{
	    key: "clone",
	    value: function clone() {
	      return new Size(this.width, this.height);
	    }
	  }, {
	    key: "equals",
	    value: function equals(size) {
	      return this.width === size.width && this.height === size.height;
	    }
	  }]);
	
	  return Size;
	}();
	
	/*
	 * Pitches, notes
	 */
	
	
	var Step = exports.Step = {
	  Do: 0,
	  Du: 1,
	  Re: 2,
	  Me: 3,
	  Mi: 4,
	  Fa: 5,
	  Fu: 6,
	  So: 7,
	  La: 9,
	  Te: 10,
	  Ti: 11
	};
	
	// this little array helps map step values to staff positions. The numeric values of steps
	// correspond to whole step increments (2) or half step increments (1). This gives us the ability
	// to compare pitches precisely, but makes it challenging to place steps on the staff. this little
	// array maps the steps to an incremental position the steps take on the staff line. This works
	// so simply because chant only uses do and fa clefs, and only has a flatted ti (te), making
	// for relatively easy mapping to staff line locations.
	//                         Do Du Re Me Mi Fa Fu So    La Te Ti
	var __StepToStaffPosition = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 6, 6];
	var __StaffOffsetToStep = [Step.Do, Step.Re, Step.Mi, Step.Fa, Step.So, Step.La, Step.Ti]; // no accidentals in this one
	
	
	var Pitch = exports.Pitch = function () {
	  function Pitch(step, octave) {
	    _classCallCheck(this, Pitch);
	
	    if (typeof octave === 'undefined') {
	      octave = Math.floor(step / 12);
	      step = step % 12;
	    }
	    this.step = step;
	    this.octave = octave;
	  }
	
	  _createClass(Pitch, [{
	    key: "toInt",
	    value: function toInt() {
	      return this.octave * 12 + this.step;
	    }
	  }, {
	    key: "transpose",
	    value: function transpose(step) {
	      return new Pitch(this.toInt() + step);
	    }
	  }, {
	    key: "isHigherThan",
	    value: function isHigherThan(pitch) {
	      return this.toInt() > pitch.toInt();
	    }
	  }, {
	    key: "isLowerThan",
	    value: function isLowerThan(pitch) {
	      return this.toInt() < pitch.toInt();
	    }
	  }, {
	    key: "equals",
	    value: function equals(pitch) {
	      return this.toInt() === pitch.toInt();
	    }
	  }], [{
	    key: "stepToStaffOffset",
	    value: function stepToStaffOffset(step) {
	      return __StepToStaffPosition[step];
	    }
	  }, {
	    key: "staffOffsetToStep",
	    value: function staffOffsetToStep(offset) {
	      while (offset < 0) {
	        offset = __StaffOffsetToStep.length + offset;
	      }return __StaffOffsetToStep[offset % __StaffOffsetToStep.length];
	    }
	  }]);
	
	  return Pitch;
	}();
	
	function generateRandomGuid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	  }
	  return s4() + s4();
	}
	
	function getCssForProperties(properties) {
	  return Object.entries(properties).map(function (_ref) {
	    var _ref2 = _slicedToArray(_ref, 2),
	        key = _ref2[0],
	        val = _ref2[1];
	
	    return key && val && key !== "class" ? key + ": " + val + ";" : "";
	  }).join("");
	}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	//
	
	/**
	 * @class
	 */
	var Language = exports.Language = function () {
	  function Language(name) {
	    _classCallCheck(this, Language);
	
	    this.name = typeof name !== "undefined" ? name : "<unknown>";
	    this.centerNeume = false;
	  }
	
	  /**
	   * @param {String} text The string to parsed into words.
	   * @return {Word[]} the resulting parsed words from syllabification
	   */
	
	
	  _createClass(Language, [{
	    key: "syllabify",
	    value: function syllabify(text) {
	      var parsedWords = [];
	
	      if (typeof text === "undefined" || text === "") return parsedWords;
	
	      // Divide the text into words separated by whitespace
	      var words = text.split(/[\s]+/);
	
	      for (var i = 0, end = words.length; i < end; i++) {
	        parsedWords.push(this.syllabifyWord(words[i]));
	      }return parsedWords;
	    }
	  }]);
	
	  return Language;
	}();
	
	var English = exports.English = function (_Language) {
	  _inherits(English, _Language);
	
	  function English() {
	    _classCallCheck(this, English);
	
	    var _this = _possibleConstructorReturn(this, (English.__proto__ || Object.getPrototypeOf(English)).call(this, "English"));
	
	    _this.centerNeume = true;
	    _this.regexLetter = /[a-z\u00c0-\u02af\u0300-\u036f\u1e00-\u1eff‿]+/i;
	    return _this;
	  }
	
	  /**
	   * @param {String} s the string to search
	   * @param {Number} startIndex The index at which to start searching for a vowel in the string
	   * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
	   */
	
	
	  _createClass(English, [{
	    key: "findVowelSegment",
	    value: function findVowelSegment(s, startIndex) {
	      var match = this.regexLetter.exec(s.slice(startIndex));
	      if (match) return {
	        found: true,
	        startIndex: startIndex + match.index,
	        length: match[0].length
	      };
	
	      // no vowels sets found after startIndex!
	      return { found: false, startIndex: -1, length: -1 };
	    }
	  }]);
	
	  return English;
	}(Language);
	
	/**
	 * @class
	 */
	
	
	var Latin = exports.Latin = function (_Language2) {
	  _inherits(Latin, _Language2);
	
	  /**
	   * @constructs
	   */
	  function Latin() {
	    _classCallCheck(this, Latin);
	
	    // fixme: ui is only diphthong in the exceptional cases below (according to Wheelock's Latin)
	    var _this2 = _possibleConstructorReturn(this, (Latin.__proto__ || Object.getPrototypeOf(Latin)).call(this, "Latin"));
	
	    _this2.diphthongs = ["ae", "au", "oe", "aé", "áu", "oé"];
	    // for centering over the vowel, we will need to know any combinations that might be diphthongs:
	    _this2.possibleDiphthongs = _this2.diphthongs.concat(["ei", "eu", "ui", "éi", "éu", "úi"]);
	    _this2.regexVowel = /(i|(?:[qg]|^)u)?([eé][iu]|[uú]i|[ao][eé]|[aá]u|[aeiouáéíóúäëïöüāēīōūăĕĭŏŭåe̊o̊ůæœǽyýÿ])/i;
	
	    // some words that are simply exceptions to standard syllabification rules!
	    var wordExceptions = new Object();
	
	    // ui combos pronounced as diphthongs
	    wordExceptions["huius"] = ["hui", "us"];
	    wordExceptions["cuius"] = ["cui", "us"];
	    wordExceptions["huic"] = ["huic"];
	    wordExceptions["cui"] = ["cui"];
	    wordExceptions["hui"] = ["hui"];
	
	    // eu combos pronounced as diphthongs
	    wordExceptions["euge"] = ["eu", "ge"];
	    wordExceptions["seu"] = ["seu"];
	
	    _this2.vowels = ["a", "e", "i", "o", "u", "á", "é", "í", "ó", "ú", "ä", "ë", "ï", "ö", "ü", "ā", "ē", "ī", "ō", "ū", "ă", "ĕ", "ĭ", "ŏ", "ŭ", "å", "e̊", "o̊", "ů", "æ", "œ", "ǽ", // no accented œ in unicode?
	    "y", "ý", "ÿ"]; // y is treated as a vowel; not native to Latin but useful for words borrowed from Greek
	
	    _this2.vowelsThatMightBeConsonants = ["i", "u"];
	
	    _this2.muteConsonantsAndF = ["b", "c", "d", "g", "p", "t", "f"];
	
	    _this2.liquidConsonants = ["l", "r"];
	    return _this2;
	  }
	
	  // c must be lowercase!
	
	
	  _createClass(Latin, [{
	    key: "isVowel",
	    value: function isVowel(c) {
	      for (var i = 0, end = this.vowels.length; i < end; i++) {
	        if (this.vowels[i] === c) return true;
	      }return false;
	    }
	  }, {
	    key: "isVowelThatMightBeConsonant",
	    value: function isVowelThatMightBeConsonant(c) {
	      for (var i = 0, end = this.vowelsThatMightBeConsonants.length; i < end; i++) {
	        if (this.vowelsThatMightBeConsonants[i] === c) return true;
	      }return false;
	    }
	
	    // substring should be a vowel and the character following
	
	  }, {
	    key: "isVowelActingAsConsonant",
	    value: function isVowelActingAsConsonant(substring) {
	      return this.isVowelThatMightBeConsonant(substring[0]) && this.isVowel(substring[1]);
	    }
	
	    /**
	     * f is not a mute consonant, but we lump it together for syllabification
	     * since it is syntactically treated the same way
	     *
	     * @param {String} c The character to test; must be lowercase
	     * @return {boolean} true if c is an f or a mute consonant
	     */
	
	  }, {
	    key: "isMuteConsonantOrF",
	    value: function isMuteConsonantOrF(c) {
	      for (var i = 0, end = this.muteConsonantsAndF.length; i < end; i++) {
	        if (this.muteConsonantsAndF[i] === c) return true;
	      }return false;
	    }
	
	    /**
	     *
	     * @param {String} c The character to test; must be lowercase
	     * @return {boolean} true if c is a liquid consonant
	     */
	
	  }, {
	    key: "isLiquidConsonant",
	    value: function isLiquidConsonant(c) {
	      for (var i = 0, end = this.liquidConsonants.length; i < end; i++) {
	        if (this.liquidConsonants[i] === c) return true;
	      }return false;
	    }
	
	    /**
	     *
	     * @param {String} s The string to test; must be lowercase
	     * @return {boolean} true if s is a diphthong
	     */
	
	  }, {
	    key: "isDiphthong",
	    value: function isDiphthong(s) {
	      for (var i = 0, end = this.diphthongs.length; i < end; i++) {
	        if (this.diphthongs[i] === s) return true;
	      }return false;
	    }
	
	    /**
	     *
	     * @param {String} s The string to test; must be lowercase
	     * @return {boolean} true if s is a diphthong
	     */
	
	  }, {
	    key: "isPossibleDiphthong",
	    value: function isPossibleDiphthong(s) {
	      for (var i = 0, end = this.possibleDiphthongs.length; i < end; i++) {
	        if (this.possibleDiphthongs[i] === s) return true;
	      }return false;
	    }
	
	    /**
	     * Rules for Latin syllabification (from Collins, "A Primer on Ecclesiastical Latin")
	     *
	     * Divisions occur when:
	     *   1. After open vowels (those not followed by a consonant) (e.g., "pi-us" and "De-us")
	     *   2. After vowels followed by a single consonant (e.g., "vi-ta" and "ho-ra")
	     *   3. After the first consonant when two or more consonants follow a vowel
	     *      (e.g., "mis-sa", "minis-ter", and "san-ctus").
	     *
	     * Exceptions:
	     *   1. In compound words the consonants stay together (e.g., "de-scribo").
	     *   2. A mute consonant (b, c, d, g, p, t) or f followed by a liquid consonant (l, r)
	     *      go with the succeeding vowel: "la-crima", "pa-tris"
	     *
	     * In addition to these rules, Wheelock's Latin provides this sound exception:
	     *   -  Also counted as single consonants are qu and the aspirates ch, ph,
	     *      th, which should never be separated in syllabification:
	     *      architectus, ar-chi-tec-tus; loquacem, lo-qua-cem.
	     *
	     */
	
	  }, {
	    key: "syllabifyWord",
	    value: function syllabifyWord(word) {
	      var syllables = [];
	      var haveCompleteSyllable = false;
	      var previousWasVowel = false;
	      var workingString = word.toLowerCase();
	      var startSyllable = 0;
	
	      var c, lookahead, haveLookahead;
	
	      // a helper function to create syllables
	      var makeSyllable = function makeSyllable(length) {
	        if (haveCompleteSyllable) {
	          syllables.push(word.substr(startSyllable, length));
	          startSyllable += length;
	        }
	
	        haveCompleteSyllable = false;
	      };
	
	      for (var i = 0, wordLength = workingString.length; i < wordLength; i++) {
	        c = workingString[i];
	
	        // get our lookahead in case we need them...
	        lookahead = "*";
	        haveLookahead = i + 1 < wordLength;
	
	        if (haveLookahead) lookahead = workingString[i + 1];
	
	        var cIsVowel = this.isVowel(c);
	
	        // i is a special case for a vowel. when i is at the beginning
	        // of the word (Iesu) or i is between vowels (alleluia),
	        // then the i is treated as a consonant (y)
	        if (c === "i") {
	          if (i === 0 && haveLookahead && this.isVowel(lookahead)) cIsVowel = false;else if (previousWasVowel && haveLookahead && this.isVowel(lookahead)) {
	            cIsVowel = false;
	          }
	        }
	
	        if (c === "-") {
	          // a hyphen forces a syllable break, which effectively resets
	          // the logic...
	
	          haveCompleteSyllable = true;
	          previousWasVowel = false;
	          makeSyllable(i - startSyllable);
	          startSyllable++;
	        } else if (cIsVowel) {
	          // once we get a vowel, we have a complete syllable
	          haveCompleteSyllable = true;
	
	          if (previousWasVowel && !this.isDiphthong(workingString[i - 1] + "" + c)) {
	            makeSyllable(i - startSyllable);
	            haveCompleteSyllable = true;
	          }
	
	          previousWasVowel = true;
	        } else if (haveLookahead) {
	          if (c === "q" && lookahead === "u" || lookahead === "h" && (c === "c" || c === "p" || c === "t")) {
	            // handle wheelock's exceptions for qu, ch, ph and th
	            makeSyllable(i - startSyllable);
	            i++; // skip over the 'h' or 'u'
	          } else if (previousWasVowel && this.isVowel(lookahead)) {
	            // handle division rule 2
	            makeSyllable(i - startSyllable);
	          } else if (this.isMuteConsonantOrF(c) && this.isLiquidConsonant(lookahead)) {
	            // handle exception 2
	            makeSyllable(i - startSyllable);
	          } else if (haveCompleteSyllable) {
	            // handle division rule 3
	            makeSyllable(i + 1 - startSyllable);
	          }
	
	          previousWasVowel = false;
	        }
	      }
	
	      // if we have a complete syllable, we can add it as a new one. Otherwise
	      // we tack the remaining characters onto the last syllable.
	      if (haveCompleteSyllable) syllables.push(word.substr(startSyllable));else if (startSyllable > 0) syllables[syllables.length - 1] += word.substr(startSyllable);
	
	      return syllables;
	    }
	
	    /**
	     * @param {String} s the string to search
	     * @param {Number} startIndex The index at which to start searching for a vowel in the string
	     * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
	     */
	
	  }, {
	    key: "findVowelSegment",
	    value: function findVowelSegment(s, startIndex) {
	      var match = this.regexVowel.exec(s.slice(startIndex));
	      if (match) {
	        if (match[1]) {
	          // the first group should be ignored, as it is to separate an i or u that is used as a consonant.
	          match.index += match[1].length;
	        }
	        return {
	          found: true,
	          startIndex: startIndex + match.index,
	          length: match[2].length
	        };
	      }
	
	      // no vowels sets found after startIndex!
	      return { found: false, startIndex: -1, length: -1 };
	    }
	  }]);
	
	  return Latin;
	}(Language);
	
	/**
	 * @class
	 */
	
	
	var Spanish = exports.Spanish = function (_Language3) {
	  _inherits(Spanish, _Language3);
	
	  function Spanish() {
	    _classCallCheck(this, Spanish);
	
	    var _this3 = _possibleConstructorReturn(this, (Spanish.__proto__ || Object.getPrototypeOf(Spanish)).call(this, "Spanish"));
	
	    _this3.vowels = ["a", "e", "i", "o", "u", "y", "á", "é", "í", "ó", "ú", "ü"];
	
	    _this3.weakVowels = ["i", "u", "ü", "y"];
	
	    _this3.strongVowels = ["a", "e", "o", "á", "é", "í", "ó", "ú"];
	
	    _this3.diphthongs = ["ai", "ei", "oi", "ui", "ia", "ie", "io", "iu", "au", "eu", "ou", "ua", "ue", "uo", "ái", "éi", "ói", "úi", "iá", "ié", "ió", "iú", "áu", "éu", "óu", "uá", "ué", "uó", "üe", "üi"];
	
	    _this3.uDiphthongExceptions = ["gue", "gui", "qua", "que", "qui", "quo"];
	    return _this3;
	  }
	
	  // c must be lowercase!
	
	
	  _createClass(Spanish, [{
	    key: "isVowel",
	    value: function isVowel(c) {
	      for (var i = 0, end = this.vowels.length; i < end; i++) {
	        if (this.vowels[i] === c) return true;
	      }return false;
	    }
	
	    /**
	     * @param {String} c The character to test; must be lowercase
	     * @return {boolean} true if c is an f or a mute consonant
	     */
	
	  }, {
	    key: "isWeakVowel",
	    value: function isWeakVowel(c) {
	      for (var i = 0, end = this.weakVowels.length; i < end; i++) {
	        if (this.weakVowels[i] === c) return true;
	      }return false;
	    }
	
	    /**
	     * @param {String} c The character to test; must be lowercase
	     * @return {boolean} true if c is an f or a mute consonant
	     */
	
	  }, {
	    key: "isStrongVowel",
	    value: function isStrongVowel(c) {
	      for (var i = 0, end = this.strongVowels.length; i < end; i++) {
	        if (this.strongVowels[i] === c) return true;
	      }return false;
	    }
	
	    /**
	     *
	     * @param {String} s The string to test; must be lowercase
	     * @return {boolean} true if s is a diphthong
	     */
	
	  }, {
	    key: "isDiphthong",
	    value: function isDiphthong(s) {
	      for (var i = 0, end = this.diphthongs.length; i < end; i++) {
	        if (this.diphthongs[i] === s) return true;
	      }return false;
	    }
	  }, {
	    key: "createSyllable",
	    value: function createSyllable(text) {
	      /*
	      var accented = false;
	      var ellidesToNext = false;
	       if (text.length > 0) {
	           if (text[0] == '`') {
	              accented = true;
	              text = text.substr(1);
	          }
	           if (text[text.length - 1] == '_') {
	              ellidesToNext = true;
	              text = text.substr(0, text.length - 1);
	          }
	      }
	       var s = new Syllable(text);
	       s.isMusicalAccent = accented;
	      s.elidesToNext = ellidesToNext;*/
	
	      return text;
	    }
	
	    /**
	     */
	
	  }, {
	    key: "syllabifyWord",
	    value: function syllabifyWord(word) {
	      var syllables = [];
	
	      var haveCompleteSyllable = false;
	      var previousIsVowel = false;
	      var previousIsStrongVowel = false; // only valid if previousIsVowel == true
	      var startSyllable = 0;
	
	      // fixme: first check for prefixes
	
	      for (var i = 0; i < word.length; i++) {
	        var c = word[i].toLowerCase();
	
	        if (this.isVowel(c)) {
	          // we have a complete syllable as soon as we have a vowel
	          haveCompleteSyllable = true;
	
	          var cIsStrongVowel = this.isStrongVowel(c);
	
	          if (previousIsVowel) {
	            // if we're at a strong vowel, then we finish out the last syllable
	            if (cIsStrongVowel) {
	              if (previousIsStrongVowel) {
	                syllables.push(this.createSyllable(word.substr(startSyllable, i - startSyllable)));
	                startSyllable = i;
	              }
	            }
	          }
	
	          previousIsVowel = true;
	          previousIsStrongVowel = cIsStrongVowel;
	        } else {
	          if (!haveCompleteSyllable) {
	            // do nothing since we don't have a complete syllable yet...
	          } else {
	            // handle explicit syllable breaks
	            if (word[i] === "-") {
	              // start new syllable
	              syllables.push(this.createSyllable(word.substr(startSyllable, i - startSyllable)));
	              startSyllable = ++i;
	            } else {
	              var numberOfConsonants = 1,
	                  consonant2;
	
	              // count how many more consonants there are
	              for (var j = i + 1; j < word.length; j++) {
	                if (this.isVowel(word[j])) break;
	                numberOfConsonants++;
	              }
	
	              if (numberOfConsonants === 1) {
	                // start new syllable
	                syllables.push(this.createSyllable(word.substr(startSyllable, i - startSyllable)));
	                startSyllable = i;
	              } else if (numberOfConsonants === 2) {
	                consonant2 = word[i + 1].toLowerCase();
	                if (consonant2 === "l" || consonant2 === "r" || c === "c" && consonant2 === "h") {
	                  // split before the consonant pair
	                  syllables.push(this.createSyllable(word.substr(startSyllable, i - startSyllable)));
	                  startSyllable = i++;
	                } else {
	                  //split the consonants
	                  syllables.push(this.createSyllable(word.substr(startSyllable, ++i - startSyllable)));
	                  startSyllable = i;
	                }
	              } else if (numberOfConsonants === 3) {
	                consonant2 = word[i + 1].toLowerCase();
	
	                // if second consonant is s, divide cc-c, otherwise divide c-cc
	                if (consonant2 === "s") {
	                  i += 2;
	                  syllables.push(this.createSyllable(word.substr(startSyllable, i - startSyllable)));
	                } else syllables.push(this.createSyllable(word.substr(startSyllable, ++i - startSyllable)));
	
	                startSyllable = i;
	              } else if (numberOfConsonants === 4) {
	                // four always get split cc-cc
	                syllables.push(this.createSyllable(word.substr(startSyllable, i - startSyllable + 2)));
	                startSyllable = i + 2;
	                i += 3;
	              }
	            }
	
	            haveCompleteSyllable = false;
	          }
	
	          previousIsVowel = false;
	        }
	      }
	
	      // if we have a complete syllable, we can add it as a new one. Otherwise
	      // we tack the remaining characters onto the last syllable.
	      if (haveCompleteSyllable) syllables.push(word.substr(startSyllable));else if (startSyllable > 0) syllables[syllables.length - 1] += word.substr(startSyllable);else if (syllables.length === 0) syllables.push(this.createSyllable(word));
	
	      return syllables;
	    }
	
	    /**
	     * @param {String} s the string to search
	     * @param {Number} startIndex The index at which to start searching for a vowel in the string
	     * @retuns a custom class with three properties: {found: (true/false) startIndex: (start index in s of vowel segment) length ()}
	     */
	
	  }, {
	    key: "findVowelSegment",
	    value: function findVowelSegment(s, startIndex) {
	      var i, end, index;
	      var workingString = s.toLowerCase();
	
	      // do we have a diphthongs?
	      for (i = 0, end = this.diphthongs.length; i < end; i++) {
	        var d = this.diphthongs[i];
	        index = workingString.indexOf(d, startIndex);
	
	        if (index >= 0) {
	          // check the exceptions...
	          if (d[0] === "u" && index > 0) {
	            var tripthong = s.substr(index - 1, 3).toLowerCase();
	
	            for (var j = 0, endj = this.uDiphthongExceptions.length; i < endj; j++) {
	              if (tripthong === this.uDiphthongExceptions[j]) {
	                // search from after the u...
	                return this.findVowelSegment(s, index + 1);
	              }
	            }
	          }
	
	          return { found: true, startIndex: index, length: d.length };
	        }
	      }
	
	      // no diphthongs. Let's look for single vowels then...
	      for (i = 0, end = this.vowels.length; i < end; i++) {
	        index = workingString.indexOf(this.vowels[i], startIndex);
	
	        if (index >= 0) return { found: true, startIndex: index, length: 1 };
	      }
	
	      // no vowels sets found after startIndex!
	      return { found: false, startIndex: -1, length: -1 };
	    }
	  }]);
	
	  return Spanish;
	}(Language);
	
	var language = exports.language = {
	  english: new English(),
	  latin: new Latin(),
	  spanish: new Spanish()
	};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
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
	
	// generated based on the svg data
	var Glyphs = exports.Glyphs = {
	  None: {
	    paths: [{
	      type: "positive",
	      data: ""
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 0,
	      height: 0
	    },
	    origin: {
	      x: 0,
	      y: 0
	    },
	    align: "left"
	  },
	  AcuteAccent: {
	    paths: [{
	      type: "positive",
	      data: "M4 0C-.614.52-.614.52-.803-3.182l60.768-108.422c4.52-7.182 10.543-13.67 18.075-13.67 5.27 0 14.31 1.264 23.346 7.793 7.53 5.223 8.803 11.752 8.803 16.975 0 3.917-.52 11.1-8.05 17.628L4 0z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 0, // TODO: figure out a better way to align this horizontally.  width should be 110.992,
	      height: 125.794
	    },
	    origin: {
	      x: 0.803,
	      y: 125.274
	    },
	    align: "left"
	  },
	  GraveAccent: {
	    paths: [{
	      type: "positive",
	      data: "M105.386.26C110 .78 110 .78 110.189-2.922l-60.768-108.422c-4.52-7.182-10.543-13.67-18.075-13.67-5.27 0-14.31 1.264-23.346 7.793-7.53 5.223-8.803 11.752-8.803 16.975 0 3.917.52 11.1 8.05 17.628L105.386.26z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 0, //110.992,
	      height: 125.794
	    },
	    origin: {
	      x: 0, // -110.992,
	      y: 125.274
	    },
	    align: "left"
	  },
	  Circle: {
	    paths: [{
	      type: "positive",
	      data: "M0 -50A50 50 0 0 0 100 -50 50 50 0 0 0 0 -50M10 -50A40 40 0 0 1 90 -50 40 40 0 0 1 10 -50"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 100
	    },
	    origin: {
	      x: -50,
	      y: 100
	    }
	  },
	  Semicircle: {
	    paths: [{
	      type: "positive",
	      data: "M0 -50A50 50 0 0 0 100 -50 5 5 0 0 0 90 -50 40 40 0 0 1 10 -50 5 5 0 0 0 0 -50"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 55
	    },
	    origin: {
	      x: -50,
	      y: 50
	    }
	  },
	  ReversedSemicircle: {
	    paths: [{
	      type: "positive",
	      data: "M0 0A50 50 0 0 1 100 0 5 5 0 0 1 90 0 40 40 0 0 0 10 0 5 5 0 0 1 0 0"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 55
	    },
	    origin: {
	      x: -50,
	      y: 50
	    }
	  },
	  Stropha: {
	    paths: [{
	      type: "positive",
	      data: "M1.22-73.438c4.165 13.02 12.238 27.084 24.217 42.188L49.657 0 34.812 27.344C18.666 55.47-.084 72.396-21.438 78.124c4.687-3.645 7.03-8.593 7.03-14.843 0-8.853-4.947-20.572-14.843-35.155L-48 0 1.22-73.438z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 97.657,
	      height: 151.562
	    },
	    origin: {
	      x: 48,
	      y: 73.438
	    },
	    align: "left"
	  },
	  BeginningAscLiquescent: {
	    paths: [{
	      type: "positive",
	      data: "M-50 43.688V-61c4.167 7.292 12.76 10.938 25.78 10.938 9.376 0 20.053-1.563 32.032-4.688C31.773-60.48 45.833-71.677 50-88.344v117.97C43.75 42.645 32.812 51.5 17.187 56.186-.52 61.398-15.886 64-28.906 64-42.97 64-50 57.23-50 43.687z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 152.344
	    },
	    origin: {
	      x: 50,
	      y: 88.344
	    },
	    align: "left"
	  },
	  BeginningDesLiquescent: {
	    paths: [{
	      type: "positive",
	      data: "M-50-56.03c0-13.022 7.03-19.532 21.094-19.532 13.02 0 28.385 2.604 46.093 7.812C32.813-63.583 43.75-54.73 50-41.187V76C45.833 59.854 31.77 48.656 7.812 42.406c-11.98-3.125-22.656-4.687-32.03-4.687-13.022 0-21.615 3.905-25.782 11.718v-105.47z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 151.562
	    },
	    origin: {
	      x: 50,
	      y: 75.562
	    },
	    align: "left"
	  },
	  CustosDescLong: {
	    paths: [{
	      type: "positive",
	      data: "M39.063 273.472c5.73.52 7.29-6.25 4.687-20.312V-65.59c-13.542 2.083-24.22 5.468-32.03 10.156C3.905-50.226 0-43.714 0-35.904V71.91c5.73-5.21 10.677-8.594 14.844-10.157 5.73-1.562 12.24-2.343 19.53-2.343v196.875c0 11.458 1.563 17.187 4.688 17.187"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 46.353,
	      height: 339.582
	    },
	    origin: {
	      x: 0,
	      y: 65.59
	    },
	    align: "left"
	  },
	  CustosDescShort: {
	    paths: [{
	      type: "positive",
	      data: "M34.375 191.923c0 8.333 1.563 12.24 4.688 11.72 3.125-.522 4.687-7.033 4.687-19.533v-250c-13.542 2.084-24.22 5.47-32.03 10.157C3.905-50.525 0-44.015 0-36.203V71.61c5.73-5.208 10.677-8.593 14.844-10.156 5.73-1.562 12.24-2.344 19.53-2.344v132.813z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 43.75,
	      height: 270.053
	    },
	    origin: {
	      x: 0,
	      y: 65.89
	    },
	    align: "left"
	  },
	  CustosLong: {
	    paths: [{
	      type: "positive",
	      data: "M39.063-269.562c5.73-.52 7.29 6.25 4.687 20.312V69.5c-13.542-2.083-24.22-5.47-32.03-10.156C3.905 54.134 0 47.624 0 39.812V-68c5.73 5.208 10.677 8.594 14.844 10.156 5.73 1.563 12.24 2.344 19.53 2.344v-196.875c0-11.458 1.563-17.187 4.688-17.187z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 46.353,
	      height: 339.582
	    },
	    origin: {
	      x: 0,
	      y: 270.082
	    },
	    align: "left"
	  },
	  CustosShort: {
	    paths: [{
	      type: "positive",
	      data: "M34.375-188.125c0-8.333 1.563-12.24 4.688-11.72 3.125.522 4.687 7.033 4.687 19.532v250c-13.542-2.083-24.22-5.468-32.03-10.156C3.905 54.324 0 47.813 0 40V-67.813c5.73 5.21 10.677 8.594 14.844 10.157 5.73 1.562 12.24 2.344 19.53 2.343v-132.812z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 43.75,
	      height: 270.052
	    },
	    origin: {
	      x: 0,
	      y: 200.365
	    },
	    align: "left"
	  },
	  DoClef: {
	    paths: [{
	      type: "positive",
	      data: "M0 98.406V-97.688C0-118 5.99-134.275 17.97-146.516c11.978-12.24 27.603-18.36 46.874-18.36 10.937 0 19.53 3.126 25.78 9.376s9.376 14.583 9.376 25v107.813l-6.25-5.47c-4.167-3.645-10.287-7.42-18.36-11.327-8.072-3.907-16.796-5.86-26.17-5.86-11.46 0-21.486 4.427-30.08 13.282-8.593 8.854-12.89 19.53-12.89 32.03s4.297 23.308 12.89 32.423c8.594 9.115 18.62 13.672 30.08 13.672 9.374 0 18.098-1.822 26.17-5.468 8.073-3.646 14.193-7.292 18.36-10.938l6.25-6.25V132c0 9.896-3.125 18.1-9.375 24.61-6.25 6.51-14.844 9.765-25.78 9.765-19.272 0-34.897-6.25-46.876-18.75C5.99 135.125 0 118.72 0 98.405z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 331.251
	    },
	    origin: {
	      x: 0,
	      y: 164.876
	    },
	    align: "left"
	  },
	  FaClef: {
	    paths: [{
	      type: "positive",
	      data: "M85.156-32v193.75c0 9.375-1.562 14.323-4.687 14.844-1.564 0-2.605-.52-3.126-1.563-.52-1.04-.782-2.603-.78-4.686V56.28c-8.335-8.332-19.793-12.5-34.376-12.5-17.71 0-31.77 3.907-42.188 11.72V-32c0-18.23 14.193-27.344 42.578-27.344 28.385 0 42.578 9.115 42.578 27.344zM98.438 93V-92.156c0-19.27 5.73-34.896 17.187-46.875 11.458-11.98 26.562-17.97 45.313-17.97 10.937 0 19.14 2.865 24.61 8.594 5.467 5.73 8.202 13.542 8.202 23.437v103.126l-5.47-4.687c-3.645-3.647-9.374-7.293-17.186-10.94-7.813-3.645-15.886-5.467-24.22-5.468-11.978 0-22.004 4.167-30.077 12.5-8.073 8.334-12.11 18.36-12.11 30.08 0 11.717 4.037 22.004 12.11 30.858s18.1 13.28 30.078 13.28c8.333 0 16.406-1.822 24.22-5.468 7.81-3.645 13.54-7.03 17.186-10.156l5.47-5.468V125.81c0 9.896-2.865 17.84-8.594 23.83-5.73 5.988-13.802 8.983-24.22 8.983-18.75 0-33.853-6.12-45.31-18.36-11.46-12.24-17.19-27.994-17.19-47.265z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 193.752,
	      height: 333.595
	    },
	    origin: {
	      x: 0.001,
	      y: 157.001
	    },
	    align: "left"
	  },
	  Flat: {
	    paths: [{
	      type: "positive",
	      data: "M7.813-204.406c4.166 0 6.25 5.208 6.25 15.625L12.5-10.657C33.854 13.302 54.167 25.28 73.438 25.28c9.374 0 14.062-4.686 14.062-14.06 0-6.25-1.042-11.72-3.125-16.407-2.083-4.688-7.03-9.766-14.844-15.235-7.81-5.47-13.02-8.984-15.624-10.547L27.344-45.81V-80.97c17.187 0 33.073 4.82 47.656 14.454C89.583-56.88 96.875-47.376 96.875-38c0 67.708-.26 101.562-.78 101.563-38.543 0-69.532-12.24-92.97-36.72C0-52.322-1.042-123.936 0-188c0-10.937 2.604-16.406 7.813-16.406z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 97.917,
	      height: 267.969
	    },
	    origin: {
	      x: 1.042,
	      y: 204.406
	    },
	    align: "left"
	  },
	  Mora: {
	    paths: [{
	      type: "positive",
	      data: "M47.478-24c6.957 0 12.793 2.288 17.49 6.883C69.662-12.52 72-6.904 72-.267c0 6.64-2.337 12.352-7.033 17.118C60.27 21.618 54.435 24 47.477 24c-6.26 0-11.748-2.383-16.444-7.15C26.337 12.086 24 6.374 24-.265c0-6.638 2.337-12.255 7.033-16.85C35.73-21.713 41.217-24 47.478-24z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 48,
	      height: 48
	    },
	    origin: {
	      x: -24,
	      y: 24
	    },
	    align: "left"
	  },
	  Natural: {
	    paths: [{
	      type: "positive",
	      data: "M7.906-166.563c-2.864 0-5.614.52-8.218 1.563v13.28l.78 56.25.782 78.907v85.157c.52 3.646 2.604 5.73 6.25 6.25l23.438-3.906 23.437-3.907v29.69c0 42.186-.26 63.54-.78 64.06l6.25 2.345c1.04.52 2.082.78 3.124.78 2.603 0 4.947-1.3 7.03-3.905L67.656-71.25c-.52-2.604-2.083-3.906-4.687-3.906-7.814 0-17.19 1.04-28.126 3.125l-19.53 3.124.78-38.28V-165c-2.604-1.042-5.323-1.562-8.188-1.563zM55.938-40v71.875l-41.407 7.03c0-48.436.262-72.655.783-72.655L55.938-40z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 70.311,
	      height: 330.469
	    },
	    origin: {
	      x: 0.312,
	      y: 166.563
	    },
	    align: "left"
	  },
	  Sharp: {
	    paths: [{
	      type: "positive",
	      data: "m41.725,-73.773c-5.421,-0.241-10.878,5.856-6.549,12.357L67.061,-20.473 61.264,-12.5 13.436,-71.199c-5.634,-5.934-16.988,1.032-11.232,9.783L50.756,0.182 2.203,61.416c-6.745,7.984 3.442,17.859 11.232,9.783L61.264,12.5l5.797,7.973-31.885,40.943c-5.578,6.844 5.588,16.005 11.594,9.783L77.568,33.154 108.367,71.199c4.894,6.717 17.343,-1.575 11.232,-9.783L87.715,20.473 93.873,12.5 141.34,71.199c6.725,7.67 17.509,-2.248 11.596,-9.783L104.02,0.182 152.936,-61.416c5.52,-7.02-5.541,-16.309-11.596,-9.783L93.873,-12.5l-6.158,-7.973 31.884766,-40.943c5.407,-7.045-5.505,-15.924-11.232,-9.783L77.568,-33.154 46.77,-71.199c-1.435,-1.708-3.238,-2.494-5.044922,-2.574zM77.568,-8.516 84.09,0.182 77.568,8.516 70.684,0.182Z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 154.646,
	      height: 147.987
	    },
	    origin: {
	      x: 0,
	      y: 74.098
	    },
	    align: "left"
	  },
	  OriscusAsc: {
	    paths: [{
	      type: "positive",
	      data: "M50 30.25c0 12.5-3.125 21.354-9.375 26.562-3.125 2.605-7.813 3.907-14.063 3.907-3.125 0-5.99-.522-8.593-1.564-2.605-1.04-5.6-2.474-8.986-4.297C5.6 53.035 2.734 51.603.39 50.56c-2.343-1.04-5.338-2.474-8.984-4.296-3.646-1.823-6.77-3.256-9.375-4.297-2.603-1.043-5.468-1.564-8.593-1.564-6.25 0-10.937 1.563-14.062 4.688C-46.875 50.824-50 59.677-50 71.656v-106.25c0-13.02 3.125-21.875 9.375-26.562 3.125-2.604 7.813-3.906 14.063-3.907 3.125 0 5.99.52 8.593 1.563 2.605 1.042 5.73 2.474 9.376 4.297 3.646 1.823 6.51 2.995 8.594 3.516l10.938 5.468c6.25 3.126 11.458 4.69 15.624 4.69 6.25 0 10.938-1.564 14.063-4.69C46.875-55.426 50-64.02 50-76V30.25z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 147.656
	    },
	    origin: {
	      x: 50,
	      y: 76
	    },
	    align: "left"
	  },
	  OriscusDes: {
	    paths: [{
	      type: "positive",
	      data: "M-50 30.844v-106.25c0 11.458 3.125 20.052 9.375 25.78 3.125 3.126 7.813 4.69 14.063 4.688 4.687 0 13.41-3.255 26.17-9.765 12.762-6.51 21.746-9.766 26.954-9.766 6.25 0 10.938 1.303 14.063 3.907C46.875-55.874 50-47.02 50-34V72.25c0-11.98-3.125-20.833-9.375-26.563C37.5 42.563 32.812 41 26.562 41 21.875 41 13.023 44.385 0 51.156c-4.167 2.604-8.594 4.948-13.28 7.032-4.69 2.083-9.116 3.124-13.283 3.124-6.25 0-10.937-1.302-14.062-3.906C-46.875 52.198-50 43.344-50 30.844z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 147.656
	    },
	    origin: {
	      x: 50,
	      y: 75.406
	    },
	    align: "left"
	  },
	  OriscusLiquescent: {
	    paths: [{
	      type: "positive",
	      data: "M 19.055,78.887 C 20.242,78.487 21.532,77.890 22.925,77.097 24.318,76.304 26.700882,74.417 30.074,71.438 33.447,68.458 36.524,64.985 39.303,61.019 42.083,57.052 44.563,51.396 46.743,44.05 48.923,36.704 50.013,28.671 50.013,19.950525 L 50.013,-34.226 C 50.013,-54.464 42.074,-64.584 26.195,-64.584 20.248,-64.584 11.519,-61.410 0.007,-55.064 -11.506,-48.717 -20.235,-45.544 -26.182,-45.544 -34.515,-45.544 -40.568,-48.520 -44.340791,-54.473 -48.114,-60.426 -50.000,-67.369 -50.000,-75.303 L -50.000,30.07 C -50.000,49.909 -42.060754,59.829 -26.182,59.829 -21.023,59.829 -12.39,56.455 -0.284,49.709 11.822,42.963 20.648,39.59 26.195,39.59 29.369,40.777 30.362,44.25 29.17479,50.009 27.988,55.768 26.001,62.020829 23.216,68.767 z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 147.656
	    },
	    origin: {
	      x: 50,
	      y: 75.406
	    },
	    align: "left"
	  },
	  PodatusLower: {
	    paths: [{
	      type: "positive",
	      data: "M-4.688-30.28c22.396 0 34.636-.262 36.72-.782 5.728-1.563 8.593-5.21 8.593-10.938H50v97.656c0 2.604-1.302 4.167-3.906 4.688-5.21.52-21.355.78-48.438.78-23.958 0-38.54-.26-43.75-.78-2.604 0-3.906-1.302-3.906-3.906v-82.032c0-3.646 1.302-5.468 3.906-5.468h2.344c2.604.52 15.625.78 39.063.78z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 103.124
	    },
	    origin: {
	      x: 50,
	      y: 42
	    },
	    align: "left"
	  },
	  PodatusUpper: {
	    paths: [{
	      type: "positive",
	      data: "M-46.094-63.78c13.542 0 24.61 2.473 33.203 7.42C-4.298-51.41 0-43.99 0-34.093V62h-9.375c0-10.938-2.604-19.14-7.812-24.61-5.21-5.468-14.844-8.203-28.907-8.202-18.23 0-33.333 4.166-45.312 12.5v-75.782c0-19.79 15.104-29.687 45.312-29.687z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 91.406,
	      height: 125.781
	    },
	    origin: {
	      x: 91.406,
	      y: 63.781
	    },
	    align: "right"
	  },
	  Porrectus1: {
	    paths: [{
	      type: "positive",
	      data: "M233.594 162.875c-58.855 0-107.032-6.25-144.53-18.75C34.895 125.895-11.46 99.855-50 66V-52.75C-21.354-24.625 26.302 6.885 92.97 41.78 123.697 57.928 163.54 66 212.5 66c21.354 0 34.635-9.896 39.844-29.688V151.94c0 7.29-6.25 10.937-18.75 10.937z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 302.344,
	      height: 215.627
	    },
	    origin: {
	      x: 50,
	      y: 52.75
	    },
	    align: "left"
	  },
	  Porrectus2: {
	    paths: [{
	      type: "positive",
	      data: "M309.375 259.375c-50.52 0-110.938-22.396-181.25-67.188C48.437 141.667-10.938 94.272-50 50V-68.75C0-3.125 60.417 52.083 131.25 96.875c58.333 36.98 110.677 58.854 157.03 65.625h7.033c16.145 0 26.822-9.896 32.03-29.688v114.844c0 7.812-5.99 11.72-17.968 11.72z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 377.343,
	      height: 328.126
	    },
	    origin: {
	      x: 50,
	      y: 68.75
	    },
	    align: "left"
	  },
	  Porrectus3: {
	    paths: [{
	      type: "positive",
	      data: "M309.375 355.78c-48.96-16.666-109.115-55.468-180.47-116.405C79.428 198.23 19.793 134.687-50 48.75V-70C20 40 94.104 103.79 135.25 148.063 190 200 230 230 288.28 258.906c4.168 2.083 8.334 3.125 12.5 3.125 12.5 0 21.355-10.937 26.564-32.81v114.06c0 9.376-3.386 14.063-10.156 14.064-2.084 0-4.688-.522-7.813-1.563z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 377.344,
	      height: 427.345
	    },
	    origin: {
	      x: 50,
	      y: 70
	    },
	    align: "left"
	  },
	  Porrectus4: {
	    paths: [{
	      type: "positive",
	      data: "M350 453.438c-52.754-22.397-120-77.345-201.74-164.844C90.87 227.656 24.784 147.708-50 48.75V-70C-8.84-1.25 58.406 86.51 151.74 193.28c60.868 69.793 119.13 124.22 174.782 163.282 5.797 3.646 11.014 5.47 15.652 5.47 12.173 0 21.45-11.72 27.826-35.157V441.72c0 9.373-3.19 14.06-9.565 14.06-2.9 0-6.377-.78-10.435-2.342z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 420,
	      height: 525.78
	    },
	    origin: {
	      x: 50,
	      y: 70
	    },
	    align: "left"
	  },
	  PunctumCavum: {
	    paths: [{
	      type: "positive",
	      data: "M0-60.906c33.333 0 50 9.635 50 28.906v94.53C39.062 51.595 22.396 46.126 0 46.126s-39.063 5.47-50 16.406V-32c0-19.27 16.667-28.906 50-28.906z"
	    }, {
	      type: "negative",
	      data: "M.08-42.56c9.585.206 20.126.53 27.954 6.822 4.96 3.9 4.71 10.792 4.574 16.482v51.278C22.09 27.066 7.283 26.072.168 26.01c-7.72.23-21.895.935-32.616 4.674.04-19.197-.083-38.395.064-57.59.567-7.5 7.834-12.33 14.62-13.774 5.818-1.498 11.857-1.86 17.844-1.88z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 123.438
	    },
	    origin: {
	      x: 50,
	      y: 60.906
	    },
	    align: "left"
	  },
	  PunctumQuadratum: {
	    paths: [{
	      type: "positive",
	      data: "M0-60.906c33.333 0 50 9.635 50 28.906v94.53C39.062 51.595 22.396 46.126 0 46.126s-39.063 5.47-50 16.406V-32c0-19.27 16.667-28.906 50-28.906z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 123.438
	    },
	    origin: {
	      x: 50,
	      y: 60.906
	    },
	    align: "left"
	  },
	  PunctumQuadratumLiquescent: {
	    paths: [{
	      type: "positive",
	      data: "M0-36.5436c19.999799999999997 0 30 5.781 30 17.3436v56.717999999999996C23.437199999999997 30.956999999999997 13.4376 27.6756 0 27.6756s-23.4378 3.2819999999999996-30 9.843599999999999V-19.2c0-11.562 10.000200000000001-17.3436 30-17.3436z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 123.438
	    },
	    origin: {
	      x: 50,
	      y: 60.906
	    },
	    align: "left"
	  },
	  PunctumQuadratumAscLiquescent: {
	    paths: [{
	      type: "positive",
	      data: "M-50 43.688V-61c4.167 7.292 12.76 10.938 25.78 10.938 9.376 0 20.053-1.563 32.032-4.688C31.773-60.48 45.833-71.677 50-88.344v117.97C43.75 42.645 32.812 51.5 17.187 56.186-.52 61.398-15.886 64-28.906 64-42.97 64-50 57.23-50 43.687z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 152.344
	    },
	    origin: {
	      x: 50,
	      y: 88.344
	    },
	    align: "left"
	  },
	  PunctumQuadratumDesLiquescent: {
	    paths: [{
	      type: "positive",
	      data: "M-50-56.03c0-13.022 7.03-19.532 21.094-19.532 13.02 0 28.385 2.604 46.093 7.812C32.813-63.583 43.75-54.73 50-41.187V76C45.833 59.854 31.77 48.656 7.812 42.406c-11.98-3.125-22.656-4.687-32.03-4.687-13.022 0-21.615 3.905-25.782 11.718v-105.47z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 151.562
	    },
	    origin: {
	      x: 50,
	      y: 75.562
	    },
	    align: "left"
	  },
	  PunctumInclinatum: {
	    paths: [{
	      type: "positive",
	      data: "M0-75.78L50 0 0 75-50 0 0-75.78z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 150.78
	    },
	    origin: {
	      x: 50,
	      y: 75.78
	    },
	    align: "left"
	  },
	  PunctumInclinatumLiquescent: {
	    paths: [{
	      type: "positive",
	      data: "M 0,-53.164 35,-0.117 0,52.383 -35,-0.117 0,-53.164 z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 105.546
	    },
	    origin: {
	      x: 50,
	      y: 53.164
	    },
	    align: "left"
	  },
	  Quilisma: {
	    paths: [{
	      type: "positive",
	      data: "M-50 34.938V-51c5.73 20.833 13.02 31.25 21.875 31.25 7.813 0 12.5-15.625 14.063-46.875 3.645 12.5 6.9 21.224 9.765 26.172s6.9 7.422 12.11 7.422c5.208 0 9.374-14.324 12.5-42.97 5.73 22.917 10.677 34.375 14.843 34.375 5.73 0 10.677-15.885 14.844-47.656v100c0 17.707-3.125 26.56-9.375 26.56-4.688 0-9.115-5.988-13.28-17.968-2.085 21.875-8.074 32.813-17.97 32.813-7.813 0-16.146-7.292-25-21.875-4.688 20.312-10.677 30.47-17.97 30.47-5.207 0-9.244-2.605-12.108-7.814C-48.568 47.698-50 41.708-50 34.938z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 150
	    },
	    origin: {
	      x: 50,
	      y: 89.282
	    },
	    align: "left"
	  },
	  TerminatingAscLiquescent: {
	    paths: [{
	      type: "positive",
	      data: "M-9.375 40.22c0-11.98-4.948-17.97-14.844-17.97-10.936 0-19.53 3.646-25.78 10.938v-53.126c0-6.77 2.604-12.76 7.813-17.968 5.208-5.21 10.677-8.594 16.406-10.157 2.603-.52 5.207-.78 7.81-.78 3.647 0 7.032.78 10.157 2.343C-2.603-43.896 0-39.73 0-34V73.03h-9.375V40.22z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 49.999,
	      height: 121.873
	    },
	    origin: {
	      x: 49.999,
	      y: 48.843
	    },
	    align: "right"
	  },
	  TerminatingDesLiquescent: {
	    paths: [{
	      type: "positive",
	      data: "M-9.375-48.156V-80.97H0V26.845c0 5.73-2.604 9.896-7.813 12.5-3.125 1.562-6.51 2.343-10.156 2.343-2.603 0-5.207-.26-7.81-.78-5.73-1.563-11.2-4.95-16.407-10.157C-47.398 25.542-50 19.292-50 12v-52.344c6.25 7.292 14.844 10.938 25.78 10.938 9.897 0 14.845-6.25 14.845-18.75z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 50,
	      height: 122.658
	    },
	    origin: {
	      x: 50,
	      y: 80.97
	    },
	    align: "right"
	  },
	  VerticalEpisemaAbove: {
	    paths: [{
	      type: "positive",
	      data: "M-8-4c2 3 6 4 8 4s6-1 8-4v-52c-2-3-6-4-8-4s-6 1-8 4z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 16,
	      height: 60
	    },
	    origin: {
	      x: 8,
	      y: 60
	    },
	    align: "left"
	  },
	  VerticalEpisemaBelow: {
	    paths: [{
	      type: "positive",
	      data: "M-8 56c2 3 6 4 8 4s6-1 8-4v-52c-2-3-6-4-8-4s-6 1-8 4z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 16,
	      height: 60
	    },
	    origin: {
	      x: 8,
	      y: 0
	    },
	    align: "left"
	  },
	  VirgaLong: {
	    paths: [{
	      type: "positive",
	      data: "M50-38v285.156c0 6.77-2.344 10.937-7.03 12.5-1.564 0-2.605-.78-3.126-2.344-.52-1.562-.782-10.156-.782-25.78V54.186C29.168 45.334 16.146 40.907 0 40.907c-22.917 0-39.583 5.208-50 15.624V-38c0-19.27 16.667-28.906 50-28.906S50-57.27 50-38z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 326.562
	    },
	    origin: {
	      x: 50,
	      y: 66.906
	    },
	    align: "left"
	  },
	  VirgaShort: {
	    paths: [{
	      type: "positive",
	      data: "M50-38v211.72c0 7.29-2.344 11.457-7.03 12.5-1.564 0-2.606-.783-3.126-2.345-.52-1.563-.782-10.156-.782-25.78V54.187C29.167 45.332 16.146 40.906 0 40.906c-22.917 0-39.583 5.21-50 15.625V-38c0-19.27 16.667-28.906 50-28.906S50-57.27 50-38z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 100,
	      height: 253.126
	    },
	    origin: {
	      x: 50,
	      y: 66.906
	    },
	    align: "left"
	  },
	  Virgula: {
	    paths: [{
	      type: "positive",
	      data: "M8.178-55.66c0-22.137 12.092-33.2 36.287-33.2 11.835 0 23.53 5.66 35.108 16.98C91.15-60.547 96.94-41.766 96.94-15.534c0 53.515-31.646 87.487-94.937 101.895-2.048-2.06-3.077-5.146-3.077-9.273 0-1.03.247-1.8.76-2.316 42.71-19.027 64.075-41.678 64.075-67.92 0-11.322-2.325-20.326-6.945-27.016-4.62-6.69-9.52-11.052-14.676-13.11-5.147-2.048-11.836-3.85-20.07-5.403C12.81-39.707 8.18-45.37 8.18-55.66z"
	    }],
	    bounds: {
	      x: 0,
	      y: 0,
	      width: 98.014,
	      height: 175.221
	    },
	    origin: {
	      x: 1.074,
	      y: 88.86
	    },
	    align: "left"
	  }
	};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ChantNotationElement = exports.Annotations = exports.Annotation = exports.TextLeftRight = exports.Subtitle = exports.Title = exports.Supertitle = exports.TitleTextElement = exports.DropCap = exports.TranslationText = exports.AboveLinesText = exports.ChoralSign = exports.Lyric = exports.LyricArray = exports.LyricType = exports.TextElement = exports.TextSpan = exports.CurlyBraceVisualizer = exports.RoundBraceVisualizer = exports.GlyphVisualizer = exports.LineaVisualizer = exports.VirgaLineVisualizer = exports.NeumeLineVisualizer = exports.DividerLineVisualizer = exports.ChantLayoutElement = exports.ChantContext = exports.TextMeasuringStrategy = exports.QuickSvg = exports.GlyphCode = exports.DefaultTrailingSpace = exports.TextTypesByClass = exports.TextTypes = exports.MarkingPositionHint = undefined;
	
	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); //
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
	
	var _ExsurgeCore = __webpack_require__(1);
	
	var _ExsurgeGlyphs = __webpack_require__(3);
	
	var _ExsurgeText = __webpack_require__(2);
	
	var _addAccent = __webpack_require__(5);
	
	var _makeLigature = __webpack_require__(6);
	
	var _greextraGlyphs = __webpack_require__(7);
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function getFontFilenameForProperties() {
	  var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "{}";
	
	  var italic = properties["font-style"] === "italic" ? "Italic" : "",
	      bold = properties["font-weight"] === "bold" ? "Bold" : "";
	  return url.replace("{}", "" + (italic || bold ? "" + bold + italic : "Regular"));
	}
	
	// load in the web font for special chant characters here:
	// var __exsurgeCharactersFont = require("url?limit=30000!../assets/fonts/ExsurgeChar.otf")
	
	var canAccessDOM = typeof document !== "undefined";
	
	var __getNeumeFromSvgElem = function __getNeumeFromSvgElem(score, elem) {
	  var note = score.notes[elem.parentElement.querySelector("[element-index]").getAttribute("element-index")];
	  return note.neume || note;
	};
	
	// for positioning markings on notes
	var MarkingPositionHint = exports.MarkingPositionHint = {
	  Default: 0,
	  Above: 1,
	  Below: 2
	};
	
	/**
	 * List of types of text and their defaults relative to lyrics
	 * @type Array
	 */
	var TextTypes = exports.TextTypes = {
	  supertitle: {
	    display: "Supertitle",
	    defaultSize: function defaultSize(size) {
	      return size * 7 / 6;
	    }, // 14pt
	    containedInScore: function containedInScore(score) {
	      return score.titles.hasSupertitle();
	    },
	    getFromScore: function getFromScore(score) {
	      return score.titles.supertitle;
	    }
	  },
	  title: {
	    display: "Title",
	    defaultSize: function defaultSize(size) {
	      return size * 3 / 2;
	    }, // 18pt
	    containedInScore: function containedInScore(score) {
	      return score.titles.hasTitle();
	    },
	    getFromScore: function getFromScore(score) {
	      return score.titles.title;
	    }
	  },
	  subtitle: {
	    display: "Subtitle",
	    defaultSize: function defaultSize(size) {
	      return size;
	    }, // 12pt
	    containedInScore: function containedInScore(score) {
	      return score.titles.hasSubtitle();
	    },
	    getFromScore: function getFromScore(score) {
	      return score.titles.subtitle;
	    }
	  },
	  leftRight: {
	    display: "Left / Right Text",
	    cssClass: "textLeftRight",
	    defaultSize: function defaultSize(size) {
	      return size * 0.9;
	    },
	    containedInScore: function containedInScore(score) {
	      return score.titles.hasTextLeft() || score.titles.hasTextRight();
	    },
	    getFromScore: function getFromScore(score, elem) {
	      return score.titles[elem.extraClass];
	    },
	    getFromSvgElem: function getFromSvgElem(score, elem) {
	      return score.titles[elem.classList.contains("textRight") ? "textRight" : "textLeft"];
	    }
	  },
	  annotation: {
	    display: "Annotation",
	    defaultSize: function defaultSize(size) {
	      return size * 2 / 3;
	    },
	    containedInScore: function containedInScore(score) {
	      return !!score.annotation;
	    },
	    getFromScore: function getFromScore(score, _ref) {
	      var _ref$elementIndex = _ref.elementIndex,
	          elementIndex = _ref$elementIndex === undefined ? 0 : _ref$elementIndex;
	      return score.annotation && (score.annotation.annotations ? score.annotation.annotations[elementIndex] : score.annotation);
	    }
	  },
	  dropCap: {
	    display: "Drop Cap",
	    defaultSize: function defaultSize(size) {
	      return size * 4;
	    },
	    containedInScore: function containedInScore(score) {
	      return !!score.dropCap;
	    },
	    getFromScore: function getFromScore(score) {
	      return score.dropCap;
	    }
	  },
	  al: {
	    display: "Above Staff",
	    cssClass: "aboveLinesText",
	    defaultSize: function defaultSize(size) {
	      return size;
	    },
	    containedInScore: function containedInScore(score) {
	      return score.hasAboveLinesText;
	    },
	    getFromScore: function getFromScore(score, elem) {
	      return score.notations[elem.notation.notationIndex].alText[elem.alIndex];
	    },
	    getFromSvgElem: function getFromSvgElem(score, elem) {
	      return __getNeumeFromSvgElem(score, elem).alText[elem.getAttribute("al-index") || 0];
	    }
	  },
	  choralSign: {
	    display: "Choral Sign",
	    size: function size(ctxt) {
	      return ctxt.staffInterval * 1.5;
	    },
	    containedInScore: function containedInScore(score) {
	      return false;
	    },
	    getFromScore: function getFromScore(score, elem) {
	      return score.notes[elem.note.elementIndex].choralSign;
	    }
	  },
	  lyric: {
	    display: "Lyric",
	    defaultSize: function defaultSize(size) {
	      return size * 0.9;
	    },
	    containedInScore: function containedInScore(score) {
	      return score.hasLyrics;
	    },
	    getFromScore: function getFromScore(score, elem) {
	      return score.notations[elem.notation.notationIndex].lyrics[elem.lyricIndex];
	    },
	    getFromSvgElem: function getFromSvgElem(score, elem) {
	      return __getNeumeFromSvgElem(score, elem).lyrics[elem.getAttribute("lyric-index") || 0];
	    }
	  },
	  translation: {
	    display: "Translation",
	    defaultSize: function defaultSize(size) {
	      return size * 0.75;
	    },
	    containedInScore: function containedInScore(score) {
	      return score.hasTranslations;
	    },
	    getFromScore: function getFromScore(score, elem) {
	      return score.notations[elem.notation.notationIndex].translationText[elem.translationIndex];
	    },
	    getFromSvgElem: function getFromSvgElem(score, elem) {
	      return __getNeumeFromSvgElem(score, elem).translationText[elem.getAttribute("translation-index") || 0];
	    }
	  }
	};
	var TextTypesByClass = exports.TextTypesByClass = {};
	Object.entries(TextTypes).forEach(function (_ref2) {
	  var _ref3 = _slicedToArray(_ref2, 2),
	      key = _ref3[0],
	      entry = _ref3[1];
	
	  var cssClass = entry.cssClass = entry.cssClass || key;
	  entry.key = key;
	  TextTypesByClass[cssClass] = entry;
	});
	
	var DefaultTrailingSpace = exports.DefaultTrailingSpace = function DefaultTrailingSpace(ctxt) {
	  return ctxt.intraNeumeSpacing * ctxt.interSyllabicMultiplier;
	};
	DefaultTrailingSpace.isDefault = true;
	
	var GlyphCode = exports.GlyphCode = {
	  None: "None",
	
	  AcuteAccent: "AcuteAccent",
	  GraveAccent: "GraveAccent",
	  Circle: "Circle",
	  Semicircle: "Semicircle",
	  ReversedSemicircle: "ReversedSemicircle",
	  Stropha: "Stropha",
	  StrophaLiquescent: "StrophaLiquescent",
	
	  BeginningAscLiquescent: "BeginningAscLiquescent",
	  BeginningDesLiquescent: "BeginningDesLiquescent",
	
	  CustosDescLong: "CustosDescLong",
	  CustosDescShort: "CustosDescShort",
	  CustosLong: "CustosLong",
	  CustosShort: "CustosShort",
	
	  // clefs and other markings
	  DoClef: "DoClef",
	  FaClef: "FaClef",
	  Flat: "Flat",
	  Mora: "Mora",
	  Natural: "Natural",
	  OriscusAsc: "OriscusAsc",
	  OriscusDes: "OriscusDes",
	  OriscusLiquescent: "OriscusLiquescent",
	
	  PodatusLower: "PodatusLower",
	  PodatusUpper: "PodatusUpper",
	
	  Porrectus1: "Porrectus1", // 1 staff line difference,
	  Porrectus2: "Porrectus2", // 2 lines difference, etc...
	  Porrectus3: "Porrectus3",
	  Porrectus4: "Porrectus4",
	
	  PunctumCavum: "PunctumCavum",
	  PunctumQuadratum: "PunctumQuadratum",
	  PunctumQuadratumLiquescent: "PunctumQuadratumLiquescent",
	  PunctumQuadratumAscLiquescent: "PunctumQuadratumAscLiquescent",
	  PunctumQuadratumDesLiquescent: "PunctumQuadratumDesLiquescent",
	  PunctumInclinatum: "PunctumInclinatum",
	  PunctumInclinatumLiquescent: "PunctumInclinatumLiquescent",
	  Quilisma: "Quilisma",
	
	  Sharp: "Sharp",
	  TerminatingAscLiquescent: "TerminatingAscLiquescent",
	  TerminatingDesLiquescent: "TerminatingDesLiquescent",
	  VerticalEpisemaAbove: "VerticalEpisemaAbove",
	  VerticalEpisemaBelow: "VerticalEpisemaBelow",
	  VirgaLong: "VirgaLong",
	  VirgaShort: "VirgaShort",
	  Virgula: "Virgula",
	
	  UpperBrace: "UpperBrace"
	}; // GlyphCode
	
	var QuickSvg = exports.QuickSvg = {
	  // namespaces
	  ns: "http://www.w3.org/2000/svg",
	  xmlns: "http://www.w3.org/2000/xmlns/",
	  xlink: "http://www.w3.org/1999/xlink",
	
	  hasDOMAccess: function hasDOMAccess() {
	    return canAccessDOM;
	  },
	
	  // create the root level svg object
	  svg: function svg(width, height) {
	    var node = document.createElementNS(this.ns, "svg");
	
	    node.setAttribute("xmlns", this.ns);
	    node.setAttribute("version", "1.1");
	    node.setAttributeNS(this.xmlns, "xmlns:xlink", this.xlink);
	
	    node.setAttribute("width", width);
	    node.setAttribute("height", height);
	
	    // create the defs element
	    var defs = document.createElementNS(this.ns, "defs");
	    node.appendChild(defs);
	
	    node.defs = defs;
	
	    node.clearNotations = function () {
	      // clear out all children except defs
	      node.removeChild(defs);
	
	      while (node.hasChildNodes()) {
	        node.removeChild(node.lastChild);
	      }node.appendChild(defs);
	    };
	
	    return node;
	  },
	
	  rect: function rect(width, height) {
	    var node = document.createElementNS(this.ns, "rect");
	
	    node.setAttribute("width", width);
	    node.setAttribute("height", height);
	
	    return node;
	  },
	
	  line: function line(x1, y1, x2, y2) {
	    var node = document.createElementNS(this.ns, "line");
	
	    node.setAttribute("x1", x1);
	    node.setAttribute("y1", y1);
	    node.setAttribute("x2", x2);
	    node.setAttribute("y2", y2);
	
	    return node;
	  },
	
	  g: function g() {
	    var node = document.createElementNS(this.ns, "g");
	
	    return node;
	  },
	
	  text: function text() {
	    var node = document.createElementNS(this.ns, "text");
	
	    return node;
	  },
	
	  tspan: function tspan(str) {
	    var node = document.createElementNS(this.ns, "tspan");
	    node.textContent = str;
	
	    return node;
	  },
	
	  // nodeRef should be the id of the object in defs (without the #)
	  use: function use(nodeRef) {
	    var node = document.createElementNS(this.ns, "use");
	    node.setAttributeNS(this.xlink, "xlink:href", "#" + nodeRef);
	
	    return node;
	  },
	
	  svgFragmentForGlyph: function svgFragmentForGlyph(glyph) {
	    var svgSrc = "";
	    for (var i = 0; i < glyph.paths.length; ++i) {
	      var path = glyph.paths[i];
	      svgSrc += QuickSvg.createFragment(path.data ? "path" : "g", {
	        d: path.data || undefined,
	        fill: path.type === "negative" ? "#fff" : undefined
	      });
	    }
	    return svgSrc;
	  },
	
	  nodesForGlyph: function nodesForGlyph(glyph) {
	    var functionName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "createNode";
	
	    var nodes = [];
	    for (var i = 0; i < glyph.paths.length; ++i) {
	      var path = glyph.paths[i];
	      var props = {};
	      if (path.data) props.d = path.data;
	      if (path.type === "negative") props.fill = "#fff";
	      nodes.push(QuickSvg[functionName](path.data ? "path" : "g", props));
	    }
	    return nodes;
	  },
	
	  createNode: function createNode(name, attributes, children) {
	    var node = document.createElementNS(this.ns, name);
	    if (attributes && attributes.source) {
	      node.source = attributes.source;
	      delete attributes.source;
	    }
	    for (var attr in attributes) {
	      if (attributes.hasOwnProperty(attr) && typeof attributes[attr] !== "undefined") {
	        var val = attributes[attr];
	        var match = attr.match(/^([^:]+):([^:]+)$/);
	        if (match) {
	          node.setAttributeNS(this[match[1]], match[2], val);
	        } else {
	          node.setAttribute(attr, val);
	        }
	      }
	    }
	    if (children) {
	      if (typeof children === "string") {
	        node.textContent = children;
	      } else if (children.constructor === [].constructor) {
	        for (var i = 0; i < children.length; ++i) {
	          node.appendChild(children[i]);
	        }
	      } else {
	        node.appendChild(children);
	      }
	    }
	    return node;
	  },
	
	  createSvgTree: function createSvgTree(name, props) {
	    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	      children[_key - 2] = arguments[_key];
	    }
	
	    if ("class" in props) {
	      props.className = props.class;
	      delete props.class;
	    }
	    if (children.length === 1 && children[0] instanceof Array) {
	      children = children[0];
	    }
	    var convertKeysToCamelCase = function convertKeysToCamelCase(obj) {
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;
	
	      try {
	        for (var _iterator = Object.keys(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var key = _step.value;
	
	          if (/[-:][a-z]/.test(key)) {
	            if (/^\w+-index$/.test(key)) continue;
	            var camelCase = key.replace(/[-:]([a-z])/g, function (whole, letter) {
	              return letter.toUpperCase();
	            });
	            obj[camelCase] = obj[key];
	            delete obj[key];
	          }
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator.return) {
	            _iterator.return();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }
	    };
	    convertKeysToCamelCase(props);
	    if (props.style) convertKeysToCamelCase(props.style);
	    var source = props.source;
	    if (source && source.sourceGabc) {
	      props["source-gabc"] = source.sourceGabc;
	    }
	    return { name: name, props: props, children: children };
	  },
	
	
	  createFragment: function createFragment(name, attributes, child) {
	    if (child === undefined || child === null) child = "";
	
	    var fragment = "<" + name + " ";
	
	    for (var attr in attributes) {
	      if (attributes.hasOwnProperty(attr) && typeof attributes[attr] !== "undefined") fragment += attr + '="' + attributes[attr] + '" ';
	    }
	
	    fragment += ">" + child + "</" + name + ">";
	
	    return fragment;
	  },
	
	  parseFragment: function parseFragment(fragment) {
	    // create temporary holder
	    var well = document.createElement("svg");
	
	    // act as a setter if svg is given
	    if (fragment) {
	      var container = this.g();
	
	      // dump raw svg
	      // do this to allow the browser to automatically create svg nodes?
	      well.innerHTML = "<svg>" + fragment.replace(/\n/, "").replace(/<(\w+)([^<]+?)\/>/g, "<$1$2></$1>") + "</svg>";
	
	      // transplant nodes
	      for (var i = 0, il = well.firstChild.childNodes.length; i < il; i++) {
	        container.appendChild(well.firstChild.firstChild);
	      }return container;
	    }
	  },
	
	  translate: function translate(node, x, y) {
	    node.setAttribute("transform", "translate(" + x + "," + y + ")");
	    return node;
	  },
	
	  scale: function scale(node, sx, sy) {
	    node.setAttribute("transform", "scale(" + sx + "," + sy + ")");
	    return node;
	  }
	};
	
	var TextMeasuringStrategy = exports.TextMeasuringStrategy = {
	  // shapes
	  Svg: 0,
	  Canvas: 1,
	  OpenTypeJS: 2
	};
	
	/*
	 * ChantContext
	 */
	
	var ChantContext = exports.ChantContext = function () {
	  function ChantContext() {
	    var _this = this;
	
	    var textMeasuringStrategy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : QuickSvg.hasDOMAccess() ? TextMeasuringStrategy.Canvas : TextMeasuringStrategy.OpenTypeJS;
	
	    _classCallCheck(this, ChantContext);
	
	    this.textMeasuringStrategy = textMeasuringStrategy;
	    this.getFontFilenameForProperties = getFontFilenameForProperties;
	    this.defs = {};
	    this.makeDefs = [];
	    if (QuickSvg.hasDOMAccess()) {
	      this.defsNode = QuickSvg.createNode("defs");
	    }
	
	    // font styles
	    this.textStyles = {};
	    this.textColor = "#000";
	    this.setFont("'Palatino Linotype', 'Book Antiqua', Palatino, serif", 16);
	
	    this.rubricColor = "#d00";
	    this.specialCharProperties = {
	      "font-family": "'Exsurge Characters'",
	      fill: this.rubricColor,
	      class: 'rubric'
	    };
	    this.textBeforeSpecialChar = "";
	    this.textAfterSpecialChar = ".";
	    this.specialCharMap = {
	      "℣": 'v',
	      "℟": 'r',
	      "+": "+",
	      "*": "*"
	    };
	    this.plusProperties = {};
	    this.asteriskProperties = {};
	    this.specialCharText = function (char) {
	      return _this.specialCharMap[char] || char;
	    };
	
	    this.fontStyleDictionary = {
	      b: { "font-weight": "bold" },
	      i: { "font-style": "italic" },
	      u: { "text-decoration": "underline" },
	      ul: { "text-decoration": "underline" },
	      c: { fill: this.rubricColor, class: 'rubric' },
	      sc: {
	        "font-variant": "small-caps",
	        "font-variant-caps": "small-caps",
	        "font-feature-settings": "'smcp'",
	        "-webkit-font-feature-settings": "'smcp'"
	      },
	      v: {}
	    };
	
	    this.markupSymbolDictionary = {
	      "*": "b",
	      "_": "i",
	      "^": "c",
	      "%": "sc"
	    };
	
	    this.textStyles.al.prefix = "<i>";
	
	    this.textStyles.translation.prefix = "<i>";
	
	    this.textStyles.dropCap.padding = 1; // minimum padding on either side of drop cap in staffIntervals
	
	    this.textStyles.annotation.padding = 1; // minimum padding on either side of annotation in staffIntervals
	
	    this.minLedgerSeparation = 2; // multiple of staffInterval
	    this.minSpaceAboveStaff = 2; // multiple of staffInterval
	    this.minSpaceBelowStaff = 1; // multiple of staffInterval
	    this.spaceBetweenSystems = 1.5; // multiple of staffInterval
	
	    // everything depends on the scale of the punctum
	    this.glyphPunctumWidth = _ExsurgeGlyphs.Glyphs.PunctumQuadratum.bounds.width;
	    this.glyphPunctumHeight = _ExsurgeGlyphs.Glyphs.PunctumQuadratum.bounds.height;
	
	    // max space to add between notations when justifying, in multiples of this.staffInterval
	    this.maxExtraSpaceInStaffIntervals = 0.5;
	
	    // for keeping track of the clef
	    this.activeClef = null;
	
	    this.neumeLineColor = "#000";
	    this.staffLineColor = "#000";
	    this.dividerLineColor = "#000";
	
	    this.defaultLanguage = _ExsurgeText.language.latin;
	
	    // calculate the pixel ratio for drawing to a canvas
	    this.pixelRatio = typeof window === 'undefined' ? 1.0 : window.devicePixelRatio || 1.0;
	
	    //this.canvasCtxt.scale(this.pixelRatio, this.pixelRatio);
	
	    if (textMeasuringStrategy === TextMeasuringStrategy.Svg) {
	      this.svgTextMeasurer = QuickSvg.svg(0, 0);
	      this.svgTextMeasurer.setAttribute("id", "TextMeasurer");
	      this.svgTextMeasurer.setAttribute("style", "position:absolute");
	      document.body.insertBefore(this.svgTextMeasurer, document.body.firstChild);
	    } else if (textMeasuringStrategy === TextMeasuringStrategy.Canvas) {
	      this.makeCanvasIfNeeded();
	    }
	
	    // for connecting neume syllables...
	    this.syllableConnector = "-";
	
	    // set whether to scale the def tags (scaleDefs = true) or the use tags.
	    this.scaleDefs = true;
	
	    // fixme: for now, we just set these using the glyph scales as noted above, presuming a
	    // staff line size of 0.5 in. Really what we should do is scale the punctum size based
	    // on the text metrics, right? 1 punctum ~ x height size?
	    this.setGlyphScaling(1.0 / 16.0);
	
	    // minimum space between puncta of different syllables, in multiples of this.intraNeumeSpacing
	    this.interSyllabicMultiplier = 2.5;
	
	    // space between an accidental and the following note, in multiples of this.intraNeumeSpacing
	    this.accidentalSpaceMultiplier = 2;
	
	    // space added between puncta of different words, in multiples of this.intraNeumeSpacing
	    this.interVerbalMultiplier = 1;
	
	    this.drawGuides = false;
	    this.drawDebuggingBounds = true;
	
	    // we keep track of where we are in processing notations, so that
	    // we can maintain the context for notations to know about.
	    //
	    // these are only gauranteed to be valid during the performLayout phase!
	    this.activeNotations = null;
	    this.currNotationIndex = -1;
	
	    this.minSyllablesLastLine = 0;
	    this.minNotesLastLine = 0;
	
	    // chant notation elements are normally separated by a minimum fixed amount of space
	    // on the staff line. It can happen, however, that two text elements are almost close
	    // enough to merge, only to be separated much more by the required hyphen (or other
	    // connecting string).
	    //
	    // This tolerance value allows a little bit of flexibility to merge two close lyrical
	    // elements, thus bringing the chant notation elements a bit closer than otherwise
	    // would be normally allowed.
	    //
	    // condensing tolerance is a percentage value (0.0-1.0, inclusive) that indicates
	    // how much the default spacing can shrink. E.g., a value of 0.20 allows the layout
	    // engine to separate two glyphs by only 80% of the normal inter-neume spacing value.
	    this.condensingTolerance = 0.3;
	
	    // if auto color is true, then exsurge tries to automatically colorize
	    // some elements of the chant (directives become rubric color, etc.)
	    this.autoColor = true;
	
	    this.useExtraTextOnly = true;
	
	    this.noteIdPrefix = 'note-';
	
	    this.insertFontsInDoc();
	    this.setMergeAnnotationWithTextLeft(true);
	  }
	
	  _createClass(ChantContext, [{
	    key: "getFontForProperties",
	    value: function getFontForProperties() {
	      var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	      var fontFamily = arguments[1];
	
	      var key = this.getFontFilenameForProperties(properties),
	          keyWithFontFamily = this.getFontFilenameForProperties(properties, fontFamily);
	      return this.fontDictionary && (this.fontDictionary[keyWithFontFamily] || this.fontDictionary[fontFamily] || this.fontDictionary.Regular);
	    }
	  }, {
	    key: "setFont",
	    value: function setFont(font) {
	      var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;
	      var baseStyle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      var opentypeFontDictionary = arguments[3];
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;
	
	      try {
	        for (var _iterator2 = Object.entries(TextTypes)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          var _step2$value = _slicedToArray(_step2.value, 2),
	              key = _step2$value[0],
	              textType = _step2$value[1];
	
	          var textStyle = this.textStyles[key] = this.textStyles[key] || {};
	          textStyle.size = textType.defaultSize ? textType.defaultSize(size, this) : textType.size(this);
	          textStyle.font = font;
	          textStyle.color = this.textColor || "#000";
	        }
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }
	
	      this.baseTextStyle = baseStyle;
	
	      if (opentypeFontDictionary) {
	        this.textMeasuringStrategy = TextMeasuringStrategy.OpenTypeJS;
	        this.fontDictionary = opentypeFontDictionary;
	      }
	    }
	  }, {
	    key: "setRubricColor",
	    value: function setRubricColor(color) {
	      this.rubricColor = color;
	      this.specialCharProperties.fill = color;
	      this.fontStyleDictionary.c.fill = color;
	    }
	  }, {
	    key: "setMergeAnnotationWithTextLeft",
	    value: function setMergeAnnotationWithTextLeft(merge) {
	      this.mergeAnnotationWithTextLeft = merge ? __mergeAnnotationWithTextLeft : undefined;
	    }
	  }, {
	    key: "setScaleDefs",
	    value: function setScaleDefs(scaleDefs) {
	      scaleDefs = !!scaleDefs;
	      if (this.scaleDefs !== scaleDefs) {
	        this.scaleDefs = scaleDefs;
	        this.setGlyphScaling(this.glyphScaling);
	      }
	    }
	  }, {
	    key: "createStyleCss",
	    value: function createStyleCss() {
	      var style = "";
	      var _iteratorNormalCompletion3 = true;
	      var _didIteratorError3 = false;
	      var _iteratorError3 = undefined;
	
	      try {
	        for (var _iterator3 = Object.entries(TextTypes)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	          var _step3$value = _slicedToArray(_step3.value, 2),
	              key = _step3$value[0],
	              textType = _step3$value[1];
	
	          var cssClass = textType.cssClass,
	              _textStyles$key = this.textStyles[key],
	              color = _textStyles$key.color,
	              font = _textStyles$key.font,
	              size = _textStyles$key.size;
	
	          style += "svg.Exsurge ." + cssClass + "{fill:" + color + ";font-family:" + font + ";font-size:" + size + "px;font-kerning:normal}";
	        }
	      } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion3 && _iterator3.return) {
	            _iterator3.return();
	          }
	        } finally {
	          if (_didIteratorError3) {
	            throw _iteratorError3;
	          }
	        }
	      }
	
	      return style;
	    }
	  }, {
	    key: "createStyleNode",
	    value: function createStyleNode() {
	      var node = QuickSvg.createNode("style", {});
	      node.textContent = this.createStyleCss();
	      return node;
	    }
	  }, {
	    key: "createStyleTree",
	    value: function createStyleTree() {
	      return { name: "style", props: {}, children: [this.createStyleCss()] };
	    }
	  }, {
	    key: "createStyle",
	    value: function createStyle() {
	      return "<style>" + this.createStyleCss() + "</style>";
	    }
	  }, {
	    key: "updateHyphenWidth",
	    value: function updateHyphenWidth() {
	      // measure the size of a hyphen for the lyrics
	      var hyphen = new Lyric(this, this.syllableConnector, LyricType.SingleSyllable);
	      var multiplier = this.minLyricWordSpacing / (this.hyphenWidth || this.minLyricWordSpacing) || 1;
	      this.hyphenWidth = hyphen.bounds.width;
	
	      this.minLyricWordSpacing = multiplier * this.hyphenWidth;
	    }
	  }, {
	    key: "setStaffHeight",
	    value: function setStaffHeight(staffHeight) {
	      this.setGlyphScaling(staffHeight / 600);
	    }
	  }, {
	    key: "setGlyphScaling",
	    value: function setGlyphScaling(glyphScaling) {
	      this.glyphScaling = glyphScaling;
	
	      this.staffInterval = this.glyphPunctumWidth * this.glyphScaling;
	
	      // setup the line weights for the various elements.
	      this.staffLineWeight = Math.ceil(5 * this.staffInterval / 8) / 5;
	      this.neumeLineWeight = this.staffLineWeight; // the weight of connecting lines in the glyphs.
	      this.dividerLineWeight = this.neumeLineWeight; // of quarter bar, half bar, etc.
	      this.episemaLineWeight = this.neumeLineWeight * 1.25; // of horizontal episemata
	
	      this.intraNeumeSpacing = this.staffInterval / 2.0;
	
	      while (this.defsNode && this.defsNode.firstChild) {
	        this.defsNode.removeChild(this.defsNode.firstChild);
	      }for (var i = 0; i < this.makeDefs.length; ++i) {
	        this.makeDefs[i]();
	      }
	
	      this.updateHyphenWidth();
	    }
	  }, {
	    key: "calculateHeightFromStaffPosition",
	    value: function calculateHeightFromStaffPosition(staffPosition) {
	      return -staffPosition * this.staffInterval;
	    }
	  }, {
	    key: "insertFontsInDoc",
	    value: function insertFontsInDoc() {
	      if (!canAccessDOM) return;
	
	      var styleElement = document.getElementById("exsurge-fonts");
	
	      if (styleElement === null) {
	        // create it since it doesn't exist yet.
	        styleElement = document.createElement("style");
	        styleElement.id = "exsurge-fonts";
	
	        // styleElement.appendChild(document.createTextNode("@font-face{font-family: 'Exsurge Characters';font-weight: normal;font-style: normal;src: url(" + __exsurgeCharactersFont + ") format('opentype');}"));
	
	        document.head.appendChild(styleElement);
	      }
	    }
	
	    // returns the next neume starting at this.currNotationIndex, or null
	    // if there isn't a neume after this one...
	
	  }, {
	    key: "findNextNeume",
	    value: function findNextNeume() {
	      if (typeof this.currNotationIndex === "undefined") throw "findNextNeume() called without a valid currNotationIndex set";
	
	      for (var i = this.currNotationIndex + 1; i < this.notations.length; i++) {
	        var notation = this.notations[i];
	
	        if (notation.isNeume && !notation.hasNoWidth) return notation;
	      }
	
	      return null;
	    }
	  }, {
	    key: "makeCanvasIfNeeded",
	    value: function makeCanvasIfNeeded() {
	      if (!this.canvas) {
	        this.canvas = document.createElement("canvas");
	        this.canvasCtxt = this.canvas.getContext("2d");
	      }
	    }
	  }, {
	    key: "setCanvasSize",
	    value: function setCanvasSize(width, height) {
	      var scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
	
	      this.makeCanvasIfNeeded();
	
	      this.canvas.style.width = width * scale + "px";
	      this.canvas.style.height = height * scale + "px";
	      scale *= this.pixelRatio;
	      this.canvas.width = width * scale;
	      this.canvas.height = height * scale;
	
	      this.canvasCtxt.setTransform(scale, 0, 0, scale, 0, 0);
	    }
	  }]);
	
	  return ChantContext;
	}();
	
	/*
	 * ChantLayoutElement
	 */
	
	
	var ChantLayoutElement = exports.ChantLayoutElement = function () {
	  function ChantLayoutElement() {
	    _classCallCheck(this, ChantLayoutElement);
	
	    this.bounds = new _ExsurgeCore.Rect();
	    this.origin = new _ExsurgeCore.Point(0, 0);
	
	    this.selected = false;
	    this.highlighted = false;
	  }
	
	  // draws the element on an html5 canvas
	
	
	  _createClass(ChantLayoutElement, [{
	    key: "draw",
	    value: function draw(ctxt) {
	      throw "ChantLayout Elements must implement draw(ctxt)";
	    }
	
	    // returns svg element
	
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      throw "ChantLayout Elements must implement createSvgNode(ctxt)";
	    }
	
	    // returns svg code for the element, used for printing support
	
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      throw "ChantLayout Elements must implement createSvgFragment(ctxt)";
	    }
	  }]);
	
	  return ChantLayoutElement;
	}();
	
	var DividerLineVisualizer = exports.DividerLineVisualizer = function (_ChantLayoutElement) {
	  _inherits(DividerLineVisualizer, _ChantLayoutElement);
	
	  function DividerLineVisualizer(ctxt, staffPosition0, staffPosition1, divider) {
	    _classCallCheck(this, DividerLineVisualizer);
	
	    var _this2 = _possibleConstructorReturn(this, (DividerLineVisualizer.__proto__ || Object.getPrototypeOf(DividerLineVisualizer)).call(this));
	
	    _this2.divider = divider;
	
	    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition0);
	    var y1 = ctxt.calculateHeightFromStaffPosition(staffPosition1);
	
	    if (y0 > y1) {
	      var temp = y0;
	      y0 = y1;
	      y1 = temp;
	    }
	
	    _this2.bounds.x = 0;
	    _this2.bounds.y = y0;
	    _this2.bounds.width = ctxt.dividerLineWeight;
	    _this2.bounds.height = y1 - y0;
	
	    _this2.origin.x = _this2.bounds.width / 2;
	    _this2.origin.y = y0;
	    return _this2;
	  }
	
	  _createClass(DividerLineVisualizer, [{
	    key: "draw",
	    value: function draw(ctxt) {
	      var canvasCtxt = ctxt.canvasCtxt;
	
	      canvasCtxt.fillStyle = ctxt.dividerLineColor;
	
	      canvasCtxt.fillRect(this.bounds.x, this.bounds.y, ctxt.dividerLineWeight, this.bounds.height);
	    }
	  }, {
	    key: "getSvgProps",
	    value: function getSvgProps(ctxt) {
	      var props = {
	        x: this.bounds.x,
	        y: this.bounds.y,
	        width: ctxt.dividerLineWeight,
	        height: this.bounds.height,
	        fill: ctxt.dividerLineColor,
	        class: "dividerLine"
	      };
	      if (this.divider) {
	        if (this.divider.selected) props.class += " selected";
	        props["source-index"] = this.divider.sourceIndex;
	        props["element-index"] = this.divider.elementIndex;
	        props.source = this.divider;
	      }
	      return props;
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
	    }
	  }]);
	
	  return DividerLineVisualizer;
	}(ChantLayoutElement);
	
	var NeumeLineVisualizer = exports.NeumeLineVisualizer = function (_ChantLayoutElement2) {
	  _inherits(NeumeLineVisualizer, _ChantLayoutElement2);
	
	  function NeumeLineVisualizer(ctxt, note0, note1, hanging) {
	    _classCallCheck(this, NeumeLineVisualizer);
	
	    var _this3 = _possibleConstructorReturn(this, (NeumeLineVisualizer.__proto__ || Object.getPrototypeOf(NeumeLineVisualizer)).call(this));
	
	    var staffPosition0 = note0.staffPosition;
	    var staffPosition1 = note1.staffPosition;
	
	    // note0 should be the upper one for our calculations here
	    if (staffPosition0 < staffPosition1) {
	      var temp = staffPosition0;
	      staffPosition0 = staffPosition1;
	      staffPosition1 = temp;
	    }
	
	    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition0);
	    var y1 = 0;
	
	    if (hanging) {
	      // if the difference between the notes is only one, and the upper
	      // note is on a line, and the lower note is within the four staff lines,
	      // then our hanging line goes past the lower note by a whole
	      // staff interval
	      if (staffPosition0 - staffPosition1 === 1 && Math.abs(staffPosition0) % 2 === 1 && staffPosition1 > -3) staffPosition1--;
	
	      y1 += ctxt.glyphPunctumHeight * ctxt.glyphScaling / 2.2;
	    }
	
	    y1 += ctxt.calculateHeightFromStaffPosition(staffPosition1);
	
	    _this3.bounds.x = 0;
	    _this3.bounds.y = y0;
	    _this3.bounds.width = ctxt.neumeLineWeight;
	    _this3.bounds.height = y1 - y0;
	
	    _this3.origin.x = 0;
	    _this3.origin.y = 0;
	    return _this3;
	  }
	
	  _createClass(NeumeLineVisualizer, [{
	    key: "draw",
	    value: function draw(ctxt) {
	      var canvasCtxt = ctxt.canvasCtxt;
	
	      canvasCtxt.fillStyle = ctxt.neumeLineColor;
	
	      canvasCtxt.fillRect(this.bounds.x, this.bounds.y, ctxt.neumeLineWeight, this.bounds.height);
	    }
	  }, {
	    key: "getSvgProps",
	    value: function getSvgProps(ctxt) {
	      return {
	        x: this.bounds.x,
	        y: this.bounds.y,
	        width: ctxt.neumeLineWeight,
	        height: this.bounds.height,
	        fill: ctxt.neumeLineColor,
	        class: "neumeLine"
	      };
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
	    }
	  }]);
	
	  return NeumeLineVisualizer;
	}(ChantLayoutElement);
	
	var VirgaLineVisualizer = exports.VirgaLineVisualizer = function (_ChantLayoutElement3) {
	  _inherits(VirgaLineVisualizer, _ChantLayoutElement3);
	
	  function VirgaLineVisualizer(ctxt, note) {
	    _classCallCheck(this, VirgaLineVisualizer);
	
	    var _this4 = _possibleConstructorReturn(this, (VirgaLineVisualizer.__proto__ || Object.getPrototypeOf(VirgaLineVisualizer)).call(this));
	
	    var staffPosition = note.staffPosition;
	
	    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition);
	    var y1;
	
	    if (Math.abs(staffPosition % 2) === 0) y1 = y0 + ctxt.staffInterval * 1.8;else y1 = y0 + ctxt.staffInterval * 2.7;
	
	    _this4.bounds.x = 0;
	    _this4.bounds.y = y0;
	    _this4.bounds.width = ctxt.neumeLineWeight;
	    _this4.bounds.height = y1 - y0;
	
	    _this4.origin.x = 0;
	    _this4.origin.y = 0;
	    return _this4;
	  }
	
	  _createClass(VirgaLineVisualizer, [{
	    key: "draw",
	    value: function draw(ctxt) {
	      var canvasCtxt = ctxt.canvasCtxt;
	
	      canvasCtxt.fillStyle = ctxt.neumeLineColor;
	      canvasCtxt.fillRect(this.bounds.x, this.bounds.y, ctxt.neumeLineWeight, this.bounds.height);
	    }
	  }, {
	    key: "getSvgProps",
	    value: function getSvgProps(ctxt) {
	      return {
	        x: this.bounds.x,
	        y: this.bounds.y,
	        width: ctxt.neumeLineWeight,
	        height: this.bounds.height,
	        fill: ctxt.neumeLineColor,
	        class: "neumeLine"
	      };
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      return QuickSvg.createNode("rect", this.getSvgProps(ctxt));
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      return QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      return QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
	    }
	  }]);
	
	  return VirgaLineVisualizer;
	}(ChantLayoutElement);
	
	var LineaVisualizer = exports.LineaVisualizer = function (_ChantLayoutElement4) {
	  _inherits(LineaVisualizer, _ChantLayoutElement4);
	
	  function LineaVisualizer(ctxt, note) {
	    _classCallCheck(this, LineaVisualizer);
	
	    var _this5 = _possibleConstructorReturn(this, (LineaVisualizer.__proto__ || Object.getPrototypeOf(LineaVisualizer)).call(this));
	
	    var staffPosition = note.staffPosition;
	
	    var y0 = ctxt.calculateHeightFromStaffPosition(staffPosition) - note.origin.y;
	    var y1 = y0 + note.bounds.height;
	
	    _this5.bounds.x = 0;
	    _this5.bounds.y = y0;
	    _this5.bounds.width = ctxt.neumeLineWeight * 5 + note.bounds.width;
	    _this5.bounds.height = y1 - y0;
	
	    _this5.origin.x = ctxt.neumeLineWeight * 2.5;
	    _this5.origin.y = 0;
	    return _this5;
	  }
	
	  _createClass(LineaVisualizer, [{
	    key: "draw",
	    value: function draw(ctxt) {
	      var canvasCtxt = ctxt.canvasCtxt;
	
	      canvasCtxt.fillStyle = ctxt.neumeLineColor;
	      canvasCtxt.fillRect(this.bounds.x, this.bounds.y, ctxt.neumeLineWeight, this.bounds.height);
	      canvasCtxt.fillRect(this.bounds.x + this.bounds.width - ctxt.neumeLineWeight, this.bounds.y, ctxt.neumeLineWeight, this.bounds.height);
	    }
	  }, {
	    key: "getSvgProps",
	    value: function getSvgProps(ctxt, x) {
	      return {
	        x: x,
	        y: this.bounds.y,
	        width: ctxt.neumeLineWeight,
	        height: this.bounds.height,
	        fill: ctxt.neumeLineColor,
	        class: "neumeLine"
	      };
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      var _this6 = this;
	
	      return QuickSvg.createNode("g", null, [this.bounds.x, this.bounds.x + this.bounds.width - ctxt.neumeLineWeight].map(function (x) {
	        return QuickSvg.createNode("rect", _this6.getSvgProps(ctxt, x));
	      }));
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      var _this7 = this;
	
	      return QuickSvg.createSvgTree.apply(QuickSvg, ["g", {}].concat(_toConsumableArray([this.bounds.x, this.bounds.x + this.bounds.width - ctxt.neumeLineWeight].map(function (x) {
	        return QuickSvg.createSvgTree("rect", _this7.getSvgProps(ctxt, x));
	      }))));
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      var _this8 = this;
	
	      return QuickSvg.createFragment("g", null, [this.bounds.x, this.bounds.x + this.bounds.width - ctxt.neumeLineWeight].map(function (x) {
	        return QuickSvg.createFragment("rect", _this8.getSvgProps(ctxt, x));
	      }).join(''));
	    }
	  }]);
	
	  return LineaVisualizer;
	}(ChantLayoutElement);
	
	var GlyphVisualizer = exports.GlyphVisualizer = function (_ChantLayoutElement5) {
	  _inherits(GlyphVisualizer, _ChantLayoutElement5);
	
	  function GlyphVisualizer(ctxt, glyphCode) {
	    _classCallCheck(this, GlyphVisualizer);
	
	    var _this9 = _possibleConstructorReturn(this, (GlyphVisualizer.__proto__ || Object.getPrototypeOf(GlyphVisualizer)).call(this));
	
	    _this9.glyph = null;
	
	    _this9.setGlyph(ctxt, glyphCode);
	    return _this9;
	  }
	
	  _createClass(GlyphVisualizer, [{
	    key: "setGlyph",
	    value: function setGlyph(ctxt, glyphCode) {
	      if (this.glyphCode !== glyphCode) {
	        if (typeof glyphCode === "undefined" || glyphCode === null || glyphCode === "") glyphCode = this.glyphCode = GlyphCode.None;else this.glyphCode = glyphCode;
	
	        var glyph = this.glyph = _ExsurgeGlyphs.Glyphs[glyphCode];
	
	        // if this glyph hasn't been used yet, then load it up in the defs section for sharing
	        if (!ctxt.defs.hasOwnProperty(glyphCode)) {
	          var getDefProps = function getDefProps() {
	            var options = {
	              id: glyphCode,
	              class: "glyph"
	            };
	            if (ctxt.scaleDefs === true) {
	              options.transform = "scale(" + ctxt.glyphScaling + ")";
	            }
	            return options;
	          };
	          var makeDef = function makeDef() {
	            var options = getDefProps();
	            // create the ref
	            ctxt.defs[glyphCode] = QuickSvg.createFragment("g", options, QuickSvg.svgFragmentForGlyph(glyph));
	
	            if (ctxt.defsNode) ctxt.defsNode.appendChild(QuickSvg.createNode("g", options, QuickSvg.nodesForGlyph(glyph)));
	          };
	          makeDef.makeSvgTree = function () {
	            return QuickSvg.createSvgTree.apply(QuickSvg, ["g", getDefProps()].concat(_toConsumableArray(QuickSvg.nodesForGlyph(glyph, "createSvgTree"))));
	          };
	          makeDef.glyphCode = glyphCode;
	          makeDef();
	          ctxt.makeDefs.push(makeDef);
	        }
	
	        this.align = this.glyph.align;
	      }
	
	      this.origin.x = this.glyph.origin.x * ctxt.glyphScaling;
	      this.origin.y = this.glyph.origin.y * ctxt.glyphScaling;
	
	      this.bounds.x = 0;
	      this.bounds.y = -this.origin.y;
	      this.bounds.width = this.glyph.bounds.width * ctxt.glyphScaling;
	      this.bounds.height = this.glyph.bounds.height * ctxt.glyphScaling;
	    }
	  }, {
	    key: "setStaffPosition",
	    value: function setStaffPosition(ctxt, staffPosition) {
	      this.bounds.y = ctxt.calculateHeightFromStaffPosition(staffPosition) - this.origin.y;
	    }
	  }, {
	    key: "draw",
	    value: function draw(ctxt) {
	      var canvasCtxt = ctxt.canvasCtxt;
	
	      var x = this.bounds.x + this.origin.x;
	      var y = this.bounds.y + this.origin.y;
	      canvasCtxt.translate(x, y);
	      canvasCtxt.scale(ctxt.glyphScaling, ctxt.glyphScaling);
	
	      for (var i = 0; i < this.glyph.paths.length; i++) {
	        var path = this.glyph.paths[i];
	        canvasCtxt.fillStyle = path.type === "negative" ? "#fff" : ctxt.neumeLineColor;
	        canvasCtxt.fill(new Path2D(path.data));
	      }
	
	      canvasCtxt.scale(1.0 / ctxt.glyphScaling, 1.0 / ctxt.glyphScaling);
	      canvasCtxt.translate(-x, -y);
	    }
	  }, {
	    key: "getSvgAttributes",
	    value: function getSvgAttributes(ctxt, source) {
	      var className = "";
	      if (/^Porrectus\d$/.test(this.glyphCode)) {
	        var notes = source.neume.notes,
	            noteIndex = notes.indexOf(source),
	            nextNote = notes[noteIndex + 1];
	        className = source.selected ? nextNote.selected ? "selected" : "selectedA" : nextNote.selected ? "selectedB" : "";
	      } else {
	        var isSelected = source && (source.selected || source.model && source.model.selected);
	        className = isSelected ? "selected" : "";
	      }
	      var result = {
	        "xlink:href": "#" + this.glyphCode,
	        class: className
	      };
	      if (source) {
	        result["source-index"] = source.sourceIndex;
	        result["element-index"] = source.elementIndex;
	        if ('noteIndex' in source) {
	          result.class += ' note';
	          result.id = ctxt.noteIdPrefix + (source.noteIndex + 1);
	          if (source.neume) {
	            var glyphCode = source.glyphVisualizer.glyphCode;
	            if (/^Porrectus/.test(glyphCode)) {
	              result.class += ' porrectus porrectus-start';
	            } else if (glyphCode === 'None') {
	              result.class += ' porrectus porrectus-end';
	            }
	          }
	        }
	      }
	      if (ctxt.scaleDefs === true) {
	        result.x = this.bounds.x + this.origin.x;
	        result.y = this.bounds.y + this.origin.y;
	      } else {
	        result.x = (this.bounds.x + this.origin.x) / ctxt.glyphScaling;
	        result.y = (this.bounds.y + this.origin.y) / ctxt.glyphScaling;
	        result.transform = "scale(" + ctxt.glyphScaling + ")";
	      }
	      return result;
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt, source) {
	      var attributes = this.getSvgAttributes(ctxt, source);
	      attributes.source = source;
	      return QuickSvg.createNode("use", attributes);
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt, source) {
	      var attributes = this.getSvgAttributes(ctxt, source);
	      if (source) attributes.source = source;
	      return QuickSvg.createSvgTree("use", attributes);
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt, source) {
	      return QuickSvg.createFragment("use", this.getSvgAttributes(ctxt, source));
	    }
	  }]);
	
	  return GlyphVisualizer;
	}(ChantLayoutElement);
	
	var RoundBraceVisualizer = exports.RoundBraceVisualizer = function (_ChantLayoutElement6) {
	  _inherits(RoundBraceVisualizer, _ChantLayoutElement6);
	
	  function RoundBraceVisualizer(ctxt, x1, x2, y, isAbove) {
	    _classCallCheck(this, RoundBraceVisualizer);
	
	    var _this10 = _possibleConstructorReturn(this, (RoundBraceVisualizer.__proto__ || Object.getPrototypeOf(RoundBraceVisualizer)).call(this));
	
	    if (x1 > x2) {
	      // swap the xs
	      var temp = x1;
	      x1 = x2;
	      x2 = temp;
	    }
	
	    _this10.isAbove = isAbove;
	    _this10.braceHeight = 3 * ctxt.staffInterval / 2;
	
	    _this10.bounds = new _ExsurgeCore.Rect(x1, isAbove ? y - _this10.braceHeight : y, x2 - x1, _this10.braceHeight);
	
	    _this10.origin.x = 0;
	    _this10.origin.y = 0;
	    return _this10;
	  }
	
	  _createClass(RoundBraceVisualizer, [{
	    key: "getSvgPathProps",
	    value: function getSvgPathProps(ctxt) {
	      return {
	        d: this.generatePathString(),
	        stroke: ctxt.neumeLineColor,
	        "stroke-width": ctxt.staffLineWeight + "px",
	        fill: "none",
	        class: "brace"
	      };
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      var node = QuickSvg.createNode("path", this.getSvgPathProps(ctxt));
	      if (this.accent) {
	        return QuickSvg.createNode("g", {
	          class: "accentedBrace"
	        }, [node, this.accent.createSvgNode(ctxt)]);
	      } else return node;
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      var node = QuickSvg.createSvgTree("path", this.getSvgPathProps(ctxt));
	      if (this.accent) {
	        return QuickSvg.createSvgTree("g", {
	          class: "accentedBrace"
	        }, node, this.accent.createSvgTree(ctxt));
	      } else return node;
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      var fragment = QuickSvg.createFragment("path", this.getSvgPathProps(ctxt));
	
	      if (this.accent) {
	        fragment += this.accent.createSvgFragment(ctxt);
	
	        return QuickSvg.createFragment("g", {
	          class: "accentedBrace"
	        }, fragment);
	      } else return fragment;
	    }
	
	    // returns svg path d string
	
	  }, {
	    key: "generatePathString",
	    value: function generatePathString() {
	      var x1 = this.bounds.x;
	      var x2 = this.bounds.right();
	      var width = this.bounds.width;
	      var y, dx, dy;
	
	      dx = width / 6;
	      dy = this.bounds.height;
	      if (this.isAbove) {
	        y = this.bounds.bottom();
	        dy = -dy;
	      } else {
	        y = this.bounds.y;
	      }
	
	      //Calculate Control Points of path,
	      var cx1 = x1 + dx;
	      var cy = y + dy;
	      var cx2 = x2 - dx;
	
	      // two decimal points should be enough, but if we need more precision, we can
	      // up it here.
	      var dp = 2;
	      return "M " + x1.toFixed(dp) + " " + y.toFixed(dp) + " C " + cx1.toFixed(dp) + " " + cy.toFixed(dp) + " " + cx2.toFixed(dp) + " " + cy.toFixed(dp) + " " + x2.toFixed(dp) + " " + y.toFixed(dp);
	    }
	  }]);
	
	  return RoundBraceVisualizer;
	}(ChantLayoutElement);
	
	var CurlyBraceVisualizer = exports.CurlyBraceVisualizer = function (_ChantLayoutElement7) {
	  _inherits(CurlyBraceVisualizer, _ChantLayoutElement7);
	
	  function CurlyBraceVisualizer(ctxt, x1, x2, y) {
	    var isAbove = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
	    var addAcuteAccent = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
	
	    _classCallCheck(this, CurlyBraceVisualizer);
	
	    var _this11 = _possibleConstructorReturn(this, (CurlyBraceVisualizer.__proto__ || Object.getPrototypeOf(CurlyBraceVisualizer)).call(this));
	
	    if (x1 > x2) {
	      // swap the xs
	      var temp = x1;
	      x1 = x2;
	      x2 = temp;
	    }
	
	    _this11.isAbove = isAbove;
	    _this11.braceHeight = ctxt.staffInterval / 2;
	
	    // y is the actual vertical start of the brace (left hand side)
	    // thus for a brace over notes, bounds.y is the bottom of brace,
	    // but for a brace under the notes, y is simply the y passed in.
	    if (isAbove) y -= _this11.braceHeight;
	
	    var bounds = new _ExsurgeCore.Rect(x1, y, x2 - x1, _this11.braceHeight);
	
	    if (addAcuteAccent && isAbove) {
	      _this11.accent = new GlyphVisualizer(ctxt, GlyphCode.AcuteAccent);
	      _this11.accent.bounds.x += bounds.x + (x2 - x1) / 2;
	      _this11.accent.bounds.y += bounds.y - ctxt.staffInterval / 4;
	
	      bounds.union(_this11.accent.bounds);
	    }
	
	    _this11.bounds = bounds;
	
	    _this11.origin.x = 0;
	    _this11.origin.y = 0;
	    return _this11;
	  }
	
	  _createClass(CurlyBraceVisualizer, [{
	    key: "getSvgPathProps",
	    value: function getSvgPathProps(ctxt) {
	      return {
	        d: this.generatePathString(),
	        stroke: ctxt.neumeLineColor,
	        "stroke-width": ctxt.staffLineWeight + "px",
	        fill: "none",
	        class: "brace"
	      };
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      var node = QuickSvg.createNode("path", this.getSvgPathProps(ctxt));
	
	      if (this.accent) {
	        return QuickSvg.createNode("g", {
	          class: "accentedBrace"
	        }, [node, this.accent.createSvgNode(ctxt)]);
	      } else return node;
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      var node = QuickSvg.createSvgTree("path", this.getSvgPathProps(ctxt));
	      if (this.accent) {
	        return QuickSvg.createSvgTree("g", {
	          class: "accentedBrace"
	        }, node, this.accent.createSvgTree(ctxt));
	      } else return node;
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      var fragment = QuickSvg.createFragment("path", this.getSvgPathProps(ctxt));
	
	      if (this.accent) {
	        fragment += this.accent.createSvgFragment(ctxt);
	
	        return QuickSvg.createFragment("g", {
	          class: "accentedBrace"
	        }, fragment);
	      } else return fragment;
	    }
	
	    // code below inspired by: https://gist.github.com/alexhornbake
	    // optimized for braces that are only drawn horizontally.
	    // returns svg path d string
	
	  }, {
	    key: "generatePathString",
	    value: function generatePathString() {
	      var q = 0.6; // .5 is normal, higher q = more expressive bracket
	
	      var x1 = this.bounds.x;
	      var x2 = this.bounds.right();
	      var width = this.bounds.width;
	      var y, h;
	
	      if (this.isAbove) {
	        y = this.bounds.bottom();
	        h = -this.braceHeight;
	      } else {
	        y = this.bounds.y;
	        h = this.braceHeight;
	      }
	
	      // calculate Control Points of path
	      var qy1 = y + q * h;
	      var qx2 = x1 + 0.25 * width;
	      var qy2 = y + (1 - q) * h;
	      var tx1 = x1 + 0.5 * width;
	      var ty1 = y + h;
	      var qy3 = y + q * h;
	      var qx4 = x1 + 0.75 * width;
	      var qy4 = y + (1 - q) * h;
	
	      // two decimal points should be enough, but if we need more precision, we can
	      // up it here.
	      var dp = 2;
	      return "M " + x1.toFixed(dp) + " " + y.toFixed(dp) + " Q " + x1.toFixed(dp) + " " + qy1.toFixed(dp) + " " + qx2.toFixed(dp) + " " + qy2.toFixed(dp) + " T " + tx1.toFixed(dp) + " " + ty1.toFixed(dp) + " M " + x2.toFixed(dp) + " " + y.toFixed(dp) + " Q " + x2.toFixed(dp) + " " + qy3.toFixed(dp) + " " + qx4.toFixed(dp) + " " + qy4.toFixed(dp) + " T " + tx1.toFixed(dp) + " " + ty1.toFixed(dp);
	    }
	  }]);
	
	  return CurlyBraceVisualizer;
	}(ChantLayoutElement);
	
	var TextSpan = exports.TextSpan = function () {
	  function TextSpan(text, propertyArray, activeTags) {
	    var index = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
	    var extraProps = arguments[4];
	
	    _classCallCheck(this, TextSpan);
	
	    if (typeof propertyArray === "undefined" || propertyArray === null) propertyArray = [];
	
	    this.text = text;
	    this.propertyArray = propertyArray;
	    this.activeTags = activeTags || [];
	    this.index = index;
	    if (extraProps) {
	      if ('xOffset' in extraProps) this.xOffset = extraProps.xOffset;
	      if ('newLine' in extraProps) this.newLine = extraProps.newLine;
	    }
	  }
	
	  _createClass(TextSpan, [{
	    key: "clone",
	    value: function clone() {
	      var result = new TextSpan(this.text, this.propertyArray, this.activeTags, this.index);
	      if ('xOffset' in this) result.xOffset = this.xOffset;
	      if ('newLine' in this) result.newLine = this.newLine;
	      return result;
	    }
	  }, {
	    key: "properties",
	    get: function get() {
	      var result = Object.assign.apply(null, [{}].concat(this.propertyArray).concat());
	      if ('xOffset' in this) result.xOffset = this.xOffset;
	      if ('newLine' in this) result.newLine = this.newLine;
	      return result;
	    }
	  }]);
	
	  return TextSpan;
	}();
	
	var MarkupStackFrame = function () {
	  function MarkupStackFrame(tagName, startIndex) {
	    var propertyArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
	    var symbol = arguments[3];
	
	    _classCallCheck(this, MarkupStackFrame);
	
	    this.tagName = tagName;
	    this.startIndex = startIndex;
	    this.propertyArray = propertyArray;
	    if (symbol) this.symbol = symbol;
	  }
	
	  _createClass(MarkupStackFrame, [{
	    key: "properties",
	    get: function get() {
	      return Object.assign.apply(null, [{}].concat(this.propertyArray));
	    }
	  }], [{
	    key: "createStackFrame",
	    value: function createStackFrame(ctxt, tagName, startIndex) {
	      var extraProperties = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
	      var symbol = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';
	
	      return new MarkupStackFrame(tagName, startIndex, [ctxt.fontStyleDictionary[tagName], extraProperties], symbol);
	    }
	  }]);
	
	  return MarkupStackFrame;
	}();
	
	// for escaping html strings before they go into the svgs
	// adapted from http://stackoverflow.com/a/12034334/5720160
	
	
	var __subsForTspans = {
	  "&": "&amp;",
	  "<": "&lt;",
	  ">": "&gt;"
	};
	
	var TextElement = exports.TextElement = function (_ChantLayoutElement8) {
	  _inherits(TextElement, _ChantLayoutElement8);
	
	  function TextElement(ctxt, text, fontFamily, fontSize, textAnchor, sourceIndex, sourceGabc) {
	    _classCallCheck(this, TextElement);
	
	    // set these to some sane values for now...
	    var _this12 = _possibleConstructorReturn(this, (TextElement.__proto__ || Object.getPrototypeOf(TextElement)).call(this));
	
	    _this12.bounds.x = 0;
	    _this12.bounds.y = 0;
	    _this12.bounds.width = 0;
	    _this12.bounds.height = 0;
	    _this12.origin.x = 0;
	    _this12.origin.y = 0;
	
	    _this12.fontFamily = fontFamily;
	    _this12.fontSize = fontSize;
	    _this12.textAnchor = textAnchor;
	    _this12.sourceIndex = sourceIndex;
	    _this12.sourceGabc = sourceGabc;
	    _this12.dominantBaseline = "baseline"; // default placement
	
	    _this12.generateSpansFromText(ctxt, text);
	
	    _this12.recalculateMetrics(ctxt);
	    return _this12;
	  }
	
	  _createClass(TextElement, [{
	    key: "getFromScore",
	    value: function getFromScore(score) {
	      return this.textType.getFromScore(score, this);
	    }
	  }, {
	    key: "generateSpansFromText",
	    value: function generateSpansFromText(ctxt, text) {
	      var _this13 = this;
	
	      text = text.replace(/\s+/g, " ");
	      this.text = "";
	      this.spans = [];
	
	      // save ourselves a lot of grief for a very common text:
	      if (text === "*" || text === "+" || text === "†") {
	        var properties = text === "*" ? [ctxt.asteriskProperties] : text === "+" ? [ctxt.plusProperties] : null;
	        text = ctxt.specialCharText(text) || text;
	        this.spans.push(new TextSpan(text, properties));
	        return;
	      }
	
	      var markupStack = [];
	      var spanStartIndex = 0;
	      var newLineInNextSpan = 0;
	
	      var filterFrames = function filterFrames(frame, symbol) {
	        return frame.Symbol === symbol;
	      };
	
	      var closeSpan = function closeSpan(spanText, index, extraProperties) {
	        if (spanText === "" && !_this13.dropCap) return;
	
	        _this13.text += spanText;
	
	        var properties = [];
	        for (var i = 0; i < markupStack.length; i++) {
	          properties.push.apply(properties, markupStack[i].propertyArray);
	        }
	
	        if (extraProperties) properties.push(extraProperties);
	        var span = new TextSpan(spanText, properties, markupStack.map(function (frame) {
	          return frame.tagName;
	        }), index);
	        _this13.spans.push(span);
	        if (newLineInNextSpan) {
	          span.newLine = newLineInNextSpan;
	          newLineInNextSpan = 0;
	        }
	      };
	
	      var markupRegex = /(<br\/?>)|<v>([\s\S]*?)(?:<\/v>|$)|(\*)(?=\s*\*|[^*]*(?:$|<v>))|(\+)|<sp>(?:(~)|(')?([ao]e|[æœaeiouy])|([arv])\/)<\/sp>|([arv])\/\.|([℣℟])\.?|(?:([*_^%])|<(\/)?([bciuv]|ul|sc|font)(?:\s+(?:family="([^"]+)"|fill="([^"]+)"|class="([^"]+)"))*>)(?=(?:(.+?)(?:\11|<\/\13>))?)/gi;
	      var vTagRegex = /(\\grecross)|\{greextra\}\{([^}]*)\}/g;
	      var match = null;
	      var openedAsterisk = false;
	      var closeCurrentSpan = function closeCurrentSpan() {
	        return closeSpan(text.substring(spanStartIndex, match.index), spanStartIndex);
	      };
	      while (match = markupRegex.exec(text)) {
	        var _match = match,
	            _match2 = _slicedToArray(_match, 18),
	            newLine = _match2[1],
	            vTag = _match2[2],
	            asterisk = _match2[3],
	            plus = _match2[4],
	            tilde = _match2[5],
	            accent = _match2[6],
	            vowelLigature = _match2[7],
	            specialChar = _match2[8],
	            specialChar2 = _match2[9],
	            specialChar3 = _match2[10],
	            markupSymbol = _match2[11],
	            closingTag = _match2[12],
	            tagName = _match2[13],
	            family = _match2[14],
	            fill = _match2[15],
	            cssClass = _match2[16],
	            enclosedText = _match2[17];
	
	        specialChar = specialChar || specialChar2 || specialChar3;
	        // non-matching symbols first
	        if (newLine) {
	          // close the current span, if any:
	          if (match.index > spanStartIndex) {
	            closeCurrentSpan();
	          }
	          // add the newline span:
	          newLineInNextSpan++;
	        } else if (vTag) {
	          closeCurrentSpan();
	          var vMatch = void 0;
	          var lastIndex = 0;
	          var iOffset = 0;
	          while (vMatch = vTagRegex.exec(vTag)) {
	            if (lastIndex < vMatch.index) {
	              closeSpan(vTag.slice(lastIndex, vMatch.index), match.index + lastIndex + iOffset);
	              iOffset = 3; // length of '<v>'
	            }
	
	            var _vMatch = vMatch,
	                _vMatch2 = _slicedToArray(_vMatch, 3),
	                grecross = _vMatch2[1],
	                greextra = _vMatch2[2];
	
	            if (grecross) {
	              // grecross is just the command for the Cross:
	              // set up greextra so it will get handled with it below:
	              greextra = 'Cross';
	            }
	            var char = _greextraGlyphs.greextraGlyphs[greextra];
	            if (char) {
	              closeSpan(char, match.index + vMatch.index + iOffset, { 'font-family': 'greextra' });
	            }
	            lastIndex = vTagRegex.lastIndex;
	            iOffset = 3; // length of '<v>'
	          }
	          if (lastIndex < vTag.length) {
	            closeSpan(vTag.slice(lastIndex), match.index + lastIndex + iOffset);
	          }
	        } else if (asterisk) {
	          closeCurrentSpan();
	          // first check if it is just a symbol to close:
	          if (markupStack.length > 0 && markupStack[markupStack.length - 1].symbol === asterisk) {
	            // close asterisk tag
	            markupStack.pop();
	          } else {
	            // add special asterisk:
	            closeSpan(ctxt.specialCharText(asterisk) || '*', match.index, ctxt.asteriskProperties);
	          }
	        } else if (plus) {
	          closeCurrentSpan();
	          closeSpan(ctxt.specialCharText(plus) || '+', match.index, ctxt.plusProperties);
	        } else if (tilde) {
	          closeCurrentSpan();
	          closeSpan('∼', match.index);
	        } else if (vowelLigature) {
	          var vowel = (0, _makeLigature.makeLigature)(vowelLigature);
	          if (accent) vowel = (0, _addAccent.addAccent)(vowel);
	          closeCurrentSpan();
	          closeSpan(vowel, match.index);
	        } else if (specialChar) {
	          closeCurrentSpan();
	          closeSpan(ctxt.textBeforeSpecialChar + ctxt.specialCharText(specialChar) + ctxt.textAfterSpecialChar, match.index, ctxt.specialCharProperties);
	        } else {
	          // otherwise we're dealing with matching markup delimeters
	          if (markupSymbol === "*") {
	            // we are only strict with the asterisk, because there are cases when it needs to be displayed rather than count as a markup symbol
	            if (enclosedText && /[^\s*]/.test(enclosedText)) {
	              openedAsterisk = true;
	            } else if (openedAsterisk) {
	              openedAsterisk = false;
	            } else {
	              // actually use the asterisk, since it doesn't have a matching closing asterisk
	              continue;
	            }
	          }
	          if (markupSymbol) {
	            tagName = ctxt.markupSymbolDictionary[markupSymbol];
	            if (markupStack.length > 0 && markupStack[markupStack.length - 1].tagName === tagName && markupStack[markupStack.length - 1].symbol === markupSymbol) {
	              closingTag = true;
	            }
	          }
	          if (markupStack.length > 0 && markupStack[markupStack.length - 1].tagName === tagName) {
	            if (closingTag) {
	              // group close
	              closeCurrentSpan();
	              markupStack.pop();
	            }
	          } else if (markupStack.filter(filterFrames).length > 0) {
	            // trying to open a recursive group (or forgot to close a previous group)
	            // in either case, we just unwind to the previous stack frame
	            spanStartIndex = markupStack[markupStack.length - 1].startIndex;
	            markupStack.pop();
	            continue;
	          } else {
	            closeCurrentSpan();
	            if (closingTag) {
	              // out of order group close:
	              var index = markupStack.findIndex(function (frame) {
	                return frame.tagName === tagName;
	              });
	              if (index >= 0) {
	                markupStack.splice(index, 1);
	              }
	            } else {
	              // group open
	              var extraProperties = {};
	              if (family) extraProperties['font-family'] = family;
	              if (fill) extraProperties.fill = fill;
	              if (cssClass) extraProperties.class = cssClass;
	              markupStack.push(MarkupStackFrame.createStackFrame(ctxt, tagName, match.index, extraProperties, markupSymbol));
	            }
	          }
	        }
	
	        // advance the start index past the current markup
	        spanStartIndex = match.index + match[0].length;
	      }
	
	      // if we finished matches, and there is still some text left,
	      // or if we haven't generated any spans yet, create one final run
	      if (spanStartIndex < text.length || this.spans.length === 0) closeSpan(text.slice(spanStartIndex), spanStartIndex);
	    }
	  }, {
	    key: "getCanvasFontForProperties",
	    value: function getCanvasFontForProperties(ctxt) {
	      var properties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	      var font = "";
	      if (properties["font-style"] === "italic") font += "italic ";
	      if (properties["font-variant"] === "small-caps") font += "small-caps ";
	      if (properties["font-weight"] === "bold") font += "bold ";
	      var fontSize = parseFloat(properties["font-size"]) || this.fontSize(ctxt);
	      if (/%$/.test(properties["font-size"])) {
	        fontSize *= this.fontSize(ctxt) / 100;
	      }
	      font += fontSize * (this.resize || 1) + "px ";
	      font += properties["font-family"] || this.fontFamily(ctxt);
	      return font;
	    }
	  }, {
	    key: "measureSubstringBBox",
	    value: function measureSubstringBBox(ctxt, length) {
	      return this.measureSubstring(ctxt, length, true);
	    }
	
	    // if length is undefined and this.rightAligned === true, then offsets will be marked for each newLine span
	
	  }, {
	    key: "measureSubstring",
	    value: function measureSubstring(ctxt, length) {
	      var returnBBox = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	
	      if (length === 0) return 0;
	      if (!length) length = Infinity;
	      if (length < 0) {
	        var lines = -length;
	        length = Infinity;
	      }
	      var canvasCtxt = ctxt.canvasCtxt;
	      var width = 0;
	      var widths = [];
	      var newLineSpans = [this.spans[0]];
	      var subStringLength = 0;
	      var numLines = 1;
	      var fontSize = this.fontSize(ctxt) * (this.resize || 1);
	      var bbox = new _ExsurgeCore.Rect(0, 0, 0, 0);
	      for (var i = 0; i < this.spans.length; i++) {
	        var span = this.spans[i],
	            myText = span.text.slice(0, length - subStringLength);
	        if (span.newLine) {
	          numLines += parseInt(span.newLine) || 1;
	          if (!lines && this.rightAligned === true && length === Infinity) {
	            newLineSpans[newLineSpans.length - 1].xOffset = this.firstLineMaxWidth - width;
	            newLineSpans.push(span);
	          } else if (--lines === 0) break;
	          widths.push(width);
	          width = 0;
	        }
	        if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Canvas) {
	          canvasCtxt.font = this.getCanvasFontForProperties(ctxt, span.properties);
	          var metrics = canvasCtxt.measureText(myText, width, fontSize * (numLines - 1));
	          if ("actualBoundingBoxAscent" in metrics) {
	            var left = metrics.actualBoundingBoxLeft;
	            bbox.union(new _ExsurgeCore.Rect(width - left, fontSize * (numLines - 1) - metrics.actualBoundingBoxAscent, metrics.width + left, metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent));
	            if (this instanceof DropCap) {
	              width += Math.max(0, left);
	            }
	          } else {
	            bbox.union(new _ExsurgeCore.Rect(width, fontSize * (numLines - 2), metrics.width, fontSize));
	          }
	          width += metrics.width;
	        } else if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.OpenTypeJS && ctxt.fontDictionary) {
	          // get the bounding box for the substring, placing it at x = width, y = fontSize * (numLines - 1)
	          var font = ctxt.getFontForProperties(span.properties, span.properties["font-family"] || this.fontFamily(ctxt));
	          var options = { features: { liga: true } };
	          if (span.properties["font-variant"] === "small-caps") {
	            options.features.smcp = true;
	          }
	          var spanFontSize = parseFloat(span.properties["font-size"]) || fontSize;
	          if (/%$/.test(span.properties["font-size"])) {
	            spanFontSize *= fontSize / 100;
	          }
	          var subBbox = font.getPath(myText, width, fontSize * (numLines - 1), spanFontSize, options).getBoundingBox();
	          var subWidth = font.getAdvanceWidth(myText, spanFontSize, options);
	
	          bbox.union(new _ExsurgeCore.Rect(width + subBbox.x1, subBbox.y1, subWidth - subBbox.x1, subBbox.y2 - subBbox.y1));
	          width += subWidth;
	          if (this instanceof DropCap) {
	            width -= subBbox.x1;
	          }
	        }
	        subStringLength += myText.length;
	        if (subStringLength === length) break;
	      }
	      if (!lines && width && newLineSpans.length && this.rightAligned === true && length === Infinity) {
	        newLineSpans[newLineSpans.length - 1].xOffset = this.firstLineMaxWidth - width;
	      }
	      width = Math.max.apply(Math, [width].concat(widths));
	      if (returnBBox === true) {
	        var height = bbox.height;
	        var y = bbox.y,
	            x = bbox.x;
	        return { width: width, height: height, x: x, y: y };
	      } else {
	        return width;
	      }
	    }
	  }, {
	    key: "recalculateMetrics",
	    value: function recalculateMetrics(ctxt) {
	      var resetNewLines = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
	
	      if (resetNewLines) {
	        delete this.maxWidth;
	        delete this.firstLineMaxWidth;
	        delete this.rightAligned;
	        delete this.resize;
	        delete this.numLines;
	        // replace newlines with spaces
	        this.spans.forEach(function (span) {
	          delete span.xOffset;
	          if (span.newLine === true) {
	            delete span.newLine;
	            span.text = " " + span.text;
	          }
	        });
	      }
	
	      this.bounds.x = 0;
	      this.bounds.y = 0;
	
	      this.origin.x = 0;
	
	      if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
	        while (ctxt.svgTextMeasurer.firstChild) {
	          ctxt.svgTextMeasurer.removeChild(ctxt.svgTextMeasurer.firstChild);
	        }ctxt.svgTextMeasurer.appendChild(this.createSvgNode(ctxt));
	        ctxt.svgTextMeasurer.appendChild(ctxt.createStyleNode());
	
	        var bbox = ctxt.svgTextMeasurer.firstChild.getBBox();
	        this.bounds.width = bbox.width;
	        this.bounds.height = bbox.height;
	        this.origin.y = -bbox.y; // offset to baseline from top
	        this.origin.x = -bbox.x;
	      } else {
	        var _bbox = this.measureSubstringBBox(ctxt);
	        this.bounds.width = _bbox.width;
	        this.bounds.height = _bbox.height;
	        this.origin.y = -_bbox.y;
	        this.origin.x = -_bbox.x;
	      }
	      this.numLines = this.spans.reduce(function (result, span) {
	        return result + (span.newLine ? parseInt(span.newLine) || 1 : 0);
	      }, 1);
	    }
	  }, {
	    key: "setMaxWidth",
	    value: function setMaxWidth(ctxt, maxWidth) {
	      var firstLineMaxWidth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : maxWidth;
	
	      if (this.spans.filter(function (s) {
	        return s.newLine === true;
	      }).length) {
	        // first get rid of any new lines set from a previous maxWidth
	        this.recalculateMetrics(ctxt);
	      }
	      if (this.bounds.width > maxWidth) {
	        this.maxWidth = maxWidth;
	        var percentage = maxWidth / this.bounds.width;
	        if (this instanceof Lyric && percentage >= 0.85) {
	          this.resize = percentage;
	        } else {
	          if (firstLineMaxWidth < 0) firstLineMaxWidth = maxWidth;
	          this.firstLineMaxWidth = firstLineMaxWidth;
	          var lastWidth = 0,
	              lastMatch = null,
	              regex = /\s+|$/g,
	              max = firstLineMaxWidth,
	              match;
	          while ((match = regex.exec(this.text)) && (!lastMatch || match.index > lastMatch.index)) {
	            var width = this.measureSubstring(ctxt, match.index);
	            if (width > max && lastMatch) {
	              var _spans;
	
	              var spanIndex = 0,
	                  length = 0;
	              while (length < lastMatch.index && spanIndex < this.spans.length) {
	                var span = this.spans[spanIndex++];
	                length += span.text.length + (span.newLine ? 1 : 0);
	              }
	              if (length > lastMatch.index) {
	                var _span = this.spans[--spanIndex];
	                length -= _span.text.length;
	              }
	              var splitSpan = this.spans[spanIndex],
	                  textLeft = splitSpan.text.slice(0, lastMatch.index - length),
	                  textRight = splitSpan.text.slice(lastMatch.index + lastMatch[0].length - length),
	                  newSpans = [];
	              this.rightAligned = max === firstLineMaxWidth && firstLineMaxWidth !== maxWidth;
	              if (textLeft) newSpans.push(new TextSpan(textLeft, splitSpan.propertyArray, splitSpan.activeTags));
	              if (textRight) {
	                newSpans.push(new TextSpan(textRight, splitSpan.propertyArray, splitSpan.activeTags, undefined, { newLine: true }));
	              } else if (this.spans[spanIndex + 1]) {
	                this.spans[spanIndex + 1].newLine = true;
	              }
	              (_spans = this.spans).splice.apply(_spans, [spanIndex, 1].concat(newSpans));
	              this.needsLayout = true;
	              max = maxWidth;
	              if (match.index === this.text.length || this.measureSubstring(ctxt) <= maxWidth) break;
	              width = 0;
	              match = lastMatch = null;
	            }
	            lastWidth = width;
	            lastMatch = match;
	          }
	        }
	        this.recalculateMetrics(ctxt, false);
	      }
	    }
	  }, {
	    key: "getCssClasses",
	    value: function getCssClasses() {
	      return this.textType && this.textType.cssClass || "";
	    }
	  }, {
	    key: "getExtraStyleProperties",
	    value: function getExtraStyleProperties(ctxt) {
	      return ctxt.baseTextStyle || {};
	    }
	  }, {
	    key: "draw",
	    value: function draw(ctxt) {
	      var canvasCtxt = ctxt.canvasCtxt;
	
	      if (this.textAnchor === "middle") canvasCtxt.textAlign = "center";else canvasCtxt.textAlign = "start";
	
	      var translateWidth = 0,
	          translateHeight = 0;
	      for (var i = 0; i < this.spans.length; i++) {
	        var span = this.spans[i];
	        var xOffset = span.xOffset || 0;
	        if (span.newLine) {
	          count = parseInt(span.newLine) || 1;
	          canvasCtxt.translate(translateWidth + xOffset, this.fontSize(ctxt) * count);
	          translateWidth = -xOffset;
	          translateHeight -= this.fontSize(ctxt);
	        } else if (xOffset) {
	          canvasCtxt.translate(translateWidth + xOffset, 0);
	          translateWidth = -xOffset;
	        }
	        var properties = Object.assign({}, this.getExtraStyleProperties(ctxt), span.properties);
	        canvasCtxt.font = this.getCanvasFontForProperties(ctxt, properties);
	        canvasCtxt.fillStyle = properties.fill || "#000";
	        canvasCtxt.fillText(span.text, this.bounds.x, this.bounds.y, span.textLength || undefined);
	        var metrics = canvasCtxt.measureText(span.text, this.bounds.x, this.bounds.y);
	        translateWidth -= metrics.width;
	        canvasCtxt.translate(metrics.width, 0);
	      }
	      canvasCtxt.translate(translateWidth, translateHeight);
	    }
	  }, {
	    key: "getSvgProps",
	    value: function getSvgProps() {
	      return {
	        "source-index": this.sourceIndex,
	        x: this.bounds.x,
	        y: this.bounds.y,
	        class: this.getCssClasses().trim(),
	        "text-anchor": this.textAnchor
	        //'dominant-baseline': this.dominantBaseline, // hanging baseline doesn't work in Safari
	      };
	    }
	  }, {
	    key: "getSpanOptions",
	    value: function getSpanOptions(span, ctxt) {
	      var useStyleObject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	
	      var options = {
	        "source-index": span.index,
	        class: span.properties.class,
	        style: useStyleObject ? Object.assign({}, span.properties) : (0, _ExsurgeCore.getCssForProperties)(span.properties)
	      };
	
	      if (span.newLine) {
	        var xOffset = span.xOffset || 0;
	        options.dy = 1.1 * (parseInt(span.newLine) || 1) + "em";
	        options.x = this.bounds.x + xOffset;
	      } else if (span.xOffset) {
	        options.x = this.bounds.x + span.xOffset;
	      }
	      if (span.textLength) {
	        options.textLength = span.textLength;
	        options.lengthAdjust = "spacingAndGlyphs";
	        options.y = this.bounds.y;
	      }
	      if (this.resize) {
	        options["font-size"] = span.properties["font-size"] || this.fontSize(ctxt) * this.resize;
	      }
	      // if (ctxt.setFontFamilyAttributes) {
	      //   options["font-family"] =
	      //     span.properties["font-family"] ||
	      //     getFontFilenameForProperties(span.properties, this.fontFamily(ctxt));
	      //   let properties = Object.assign({}, span.properties);
	      //   delete properties["font-weight"];
	      //   delete properties["font-style"];
	      //   options["style"] = getCssForProperties(properties);
	      // } else {
	      //   options["style"] = getCssForProperties(span.properties);
	      // }
	
	      return options;
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      var spans = [];
	
	      for (var i = 0; i < this.spans.length; i++) {
	        var span = this.spans[i];
	        var _options = this.getSpanOptions(span, ctxt);
	
	        spans.push(QuickSvg.createNode("tspan", _options, span.text));
	      }
	
	      var options = this.getSvgProps();
	      var extraStyleProperties = this.getExtraStyleProperties(ctxt);
	      options.style = (0, _ExsurgeCore.getCssForProperties)(extraStyleProperties);
	      if (extraStyleProperties.class) {
	        options.class = extraStyleProperties.class + ' ' + options.class;
	      }
	      options.source = this;
	
	      return this.svgNode = QuickSvg.createNode("text", options, spans);
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      var spans = [];
	
	      for (var i = 0; i < this.spans.length; i++) {
	        var span = this.spans[i];
	        var _options2 = this.getSpanOptions(span, ctxt, true);
	
	        spans.push(QuickSvg.createSvgTree("tspan", _options2, span.text));
	      }
	
	      var options = this.getSvgProps();
	      options.style = this.getExtraStyleProperties(ctxt);
	      if (options.style.class) {
	        options.class = options.style.class + ' ' + options.class;
	      }
	      options.source = this;
	
	      return QuickSvg.createSvgTree.apply(QuickSvg, ["text", options].concat(spans));
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      var spans = "";
	
	      for (var i = 0; i < this.spans.length; i++) {
	        var span = this.spans[i];
	        var _options3 = this.getSpanOptions(span, ctxt);
	
	        spans += QuickSvg.createFragment("tspan", _options3, TextElement.escapeForTspan(span.text));
	      }
	
	      var options = this.getSvgProps();
	      var extraStyleProperties = this.getExtraStyleProperties(ctxt);
	      options.style = (0, _ExsurgeCore.getCssForProperties)(extraStyleProperties);
	      if (extraStyleProperties.class) {
	        options.class = extraStyleProperties.class + ' ' + options.class;
	      }
	      if (ctxt.setFontFamilyAttributes) {
	        options["font-size"] = this.fontSize(ctxt);
	      }
	
	      return QuickSvg.createFragment("text", options, spans);
	    }
	  }], [{
	    key: "escapeForTspan",
	    value: function escapeForTspan(string) {
	      return String(string).replace(/[&<>]/g, function (s) {
	        return __subsForTspans[s];
	      });
	    }
	  }]);
	
	  return TextElement;
	}(ChantLayoutElement);
	
	var LyricType = exports.LyricType = {
	  SingleSyllable: 0,
	  BeginningSyllable: 1,
	  MiddleSyllable: 2,
	  EndingSyllable: 3,
	
	  Directive: 4 // for asterisks, "ij." elements, or other performance notes.
	};
	
	var LyricArray = exports.LyricArray = {
	  getLeft: function getLeft(lyricArray) {
	    if (lyricArray.length === 0) return NaN;
	
	    var x = Number.MAX_VALUE;
	    for (var i = 0; i < lyricArray.length; i++) {
	      if (lyricArray[i]) x = Math.min(x, lyricArray[i].notation.bounds.x + lyricArray[i].bounds.x);
	    }
	
	    return x;
	  },
	
	  getRight: function getRight(lyricArray, presumeConnectorNeeded) {
	    if (lyricArray.length === 0) return NaN;
	
	    var x = Number.MIN_VALUE;
	    for (var i = 0; i < lyricArray.length; i++) {
	      var l = lyricArray[i];
	      if (l) x = Math.max(x, l.notation.bounds.x + l.bounds.x + l.bounds.width + (presumeConnectorNeeded && l.allowsConnector() && !l.needsConnector ? l.getConnectorWidth() : 0));
	    }
	
	    return x;
	  },
	
	  hasOnlyOneLyric: function hasOnlyOneLyric(lyricArray) {
	    return lyricArray.filter(function (l) {
	      return l.originalText;
	    }).length === 1;
	  },
	
	  indexOfLyric: function indexOfLyric(lyricArray) {
	    return lyricArray.indexOf(lyricArray.filter(function (l) {
	      return l.originalText;
	    })[0]);
	  },
	
	  mergeIn: function mergeIn(lyricArray, newLyrics) {
	    for (var i = 0; i < newLyrics.length; ++i) {
	      if (newLyrics[i].originalText || !lyricArray[i]) lyricArray[i] = newLyrics[i];
	    }
	  },
	
	  mergeInArray: function mergeInArray(lyricArray, notations) {
	    for (var i = 0; i < notations.length; ++i) {
	      this.mergeIn(lyricArray, notations[i].lyrics);
	    }
	  },
	
	  setNotation: function setNotation(lyricArray, notation) {
	    notation.lyrics = lyricArray;
	    for (var i = 0; i < lyricArray.length; ++i) {
	      lyricArray[i].notation = notation;
	    }
	  }
	};
	
	var Lyric = exports.Lyric = function (_TextElement) {
	  _inherits(Lyric, _TextElement);
	
	  function Lyric(ctxt, text, lyricType, notation, notations, sourceIndex) {
	    _classCallCheck(this, Lyric);
	
	    var _this14 = _possibleConstructorReturn(this, (Lyric.__proto__ || Object.getPrototypeOf(Lyric)).call(this, ctxt, (ctxt.textStyles.lyric.prefix || "") + text, function (ctxt) {
	      return ctxt.textStyles.lyric.font;
	    }, function (ctxt) {
	      return ctxt.textStyles.lyric.size;
	    }, "start", sourceIndex, text));
	
	    _this14.textType = TextTypes.lyric;
	
	    // save the original text in case we need to later use the lyric
	    // in a dropcap...
	    _this14.originalText = text;
	
	    _this14.notation = notation;
	    _this14.notations = notations;
	
	    if (typeof lyricType === "undefined" || lyricType === null || lyricType === "") _this14.lyricType = LyricType.SingleSyllable;else _this14.lyricType = lyricType;
	
	    // Lyrics keep track of how to center them on notation elements.
	    // centerTextIndex is the index in this.text where the centering starts,
	    // centerLength is how many characters comprise the center point.
	    // performLayout will do the processing
	    _this14.centerStartIndex = -1;
	    _this14.centerLength = text.length;
	
	    _this14.needsConnector = false;
	
	    // Lyrics can have their own language defined, which affects the alignment
	    // of the text with the notation element
	    _this14.language = null;
	
	    if (_this14.allowsConnector) _this14.connectorSpan = new TextSpan(ctxt.syllableConnector);
	    return _this14;
	  }
	
	  _createClass(Lyric, [{
	    key: "allowsConnector",
	    value: function allowsConnector() {
	      return this.lyricType === LyricType.BeginningSyllable || this.lyricType === LyricType.MiddleSyllable;
	    }
	  }, {
	    key: "setForceConnector",
	    value: function setForceConnector(force) {
	      this.forceConnector = force && this.allowsConnector();
	    }
	  }, {
	    key: "setNeedsConnector",
	    value: function setNeedsConnector(needs, width) {
	      if (needs === true || this.forceConnector) {
	        this.needsConnector = true;
	        if (typeof width !== "undefined") {
	          this.setConnectorWidth(width);
	        } else {
	          this.bounds.width = this.widthWithoutConnector + this.getConnectorWidth();
	        }
	
	        if (this.spans.length > 0 && this.spans[this.spans.length - 1] !== this.connectorSpan) this.spans.push(this.connectorSpan);
	      } else {
	        this.connectorWidth = 0;
	        this.needsConnector = false;
	        this.bounds.width = this.widthWithoutConnector;
	
	        var span = this.spans.pop();
	        if (span && span !== this.connectorSpan) this.spans.push(span);
	      }
	    }
	  }, {
	    key: "setConnectorWidth",
	    value: function setConnectorWidth(width) {
	      this.connectorWidth = width;
	      this.connectorSpan.textLength = width;
	      if (this.needsConnector) this.bounds.width = this.widthWithoutConnector + this.getConnectorWidth();
	    }
	  }, {
	    key: "getConnectorWidth",
	    value: function getConnectorWidth() {
	      return this.connectorWidth || this.defaultConnectorWidth;
	    }
	  }, {
	    key: "getLeft",
	    value: function getLeft() {
	      return this.notation.bounds.x + this.bounds.x;
	    }
	  }, {
	    key: "getRight",
	    value: function getRight() {
	      return this.notation.bounds.x + this.bounds.x + this.bounds.width;
	    }
	  }, {
	    key: "recalculateMetrics",
	    value: function recalculateMetrics(ctxt) {
	      var resetNewLines = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
	
	      this.setNeedsConnector();
	
	      _get(Lyric.prototype.__proto__ || Object.getPrototypeOf(Lyric.prototype), "recalculateMetrics", this).call(this, ctxt, resetNewLines);
	
	      this.widthWithoutConnector = this.bounds.width;
	
	      this.connectorWidth = 0;
	      this.defaultConnectorWidth = ctxt.hyphenWidth;
	
	      var activeLanguage = this.language || ctxt.defaultLanguage;
	
	      // calculate the point where the text lines up to the staff notation
	      // and offset the rect that much. By default we just center the text,
	      // but the logic below allows for smarter lyric alignment based
	      // on manual override or language control.
	      var offset = this.widthWithoutConnector / 2,
	          x1,
	          x2,
	          vowelSegmentWidth = this.widthWithoutConnector;
	
	      // some simple checks for sanity, and disable manual centering if the numbers are bad
	      if (this.centerStartIndex >= 0 && (this.centerStartIndex >= this.text.length || this.centerLength < 0 || this.centerStartIndex + this.centerLength > this.text.length)) this.centerStartIndex = -1;
	
	      if (this.text.length === 0) {
	        // if we have no text to work with, then there's nothing to do!
	        // Unless it's a drop cap, in which case we center the connector:
	        if (this.dropCap && this.originalText) {
	          offset = ctxt.hyphenWidth / 2;
	          vowelSegmentWidth = ctxt.hyphenWidth;
	        }
	      } else if (this.centerStartIndex >= 0) {
	        // if we have manually overriden the centering logic for this lyric,
	        // then always use that.
	        if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
	          // svgTextMeasurer still has the current lyric in it...
	          x1 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(0, this.centerStartIndex);
	          x2 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(0, this.centerStartIndex + this.centerLength);
	        } else {
	          x1 = this.measureSubstring(ctxt, this.centerStartIndex);
	          x2 = this.measureSubstring(ctxt, this.centerStartIndex + this.centerLength);
	        }
	        offset = (x1 + x2) / 2;
	        vowelSegmentWidth = x2 - x1;
	      } else {
	        // if it's a directive with no manual centering override, then
	        // just center the text.
	        if (this.lyricType !== LyricType.Directive) {
	          // only consider text content after the last space (if any)
	          var startIndex = this.text.lastIndexOf(" ") + 1;
	
	          // unless there are no text characters following the space:
	          if (startIndex > 0 && !this.text.slice(startIndex).match(/[a-záéíóúýäëïöüÿàèìòùỳāēīōūȳăĕĭŏŭ]/i)) {
	            startIndex = 0;
	          }
	
	          // Non-directive elements are lined up to the chant notation based on vowel segments,
	          var result = activeLanguage.findVowelSegment(this.text, startIndex);
	
	          if (result.found !== true) {
	            var match = this.text.slice(startIndex).match(/[a-z]+/i);
	            if (match) {
	              result.startIndex = startIndex + match.index;
	              result.length = match[0].length;
	            } else {
	              result.startIndex = startIndex;
	              result.length = this.text.length - startIndex;
	            }
	          }
	          if (ctxt.textMeasuringStrategy === TextMeasuringStrategy.Svg) {
	            // svgTextMeasurer still has the current lyric in it...
	            x1 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(0, result.startIndex);
	            x2 = ctxt.svgTextMeasurer.firstChild.getSubStringLength(0, result.startIndex + result.length);
	          } else {
	            x1 = this.measureSubstring(ctxt, result.startIndex);
	            x2 = this.measureSubstring(ctxt, result.startIndex + result.length);
	          }
	          offset = (x1 + x2) / 2;
	          vowelSegmentWidth = x2 - x1;
	        }
	      }
	
	      this.vowelSegmentWidth = vowelSegmentWidth;
	
	      this.bounds.x = -offset;
	      this.bounds.y = 0;
	
	      this.origin.x = offset;
	    }
	  }, {
	    key: "generateDropCap",
	    value: function generateDropCap(ctxt) {
	      if (this.dropCap) return this.dropCap;
	      // disallow special characters:
	      if (this.spans[0].properties['font-family'] === ctxt.specialCharProperties['font-family']) {
	        return null;
	      }
	      var dropCapSpan = this.spans[0].clone();
	      dropCapSpan.text = dropCapSpan.text.slice(0, 1).toUpperCase();
	      var dropCapLowerCase = dropCapSpan.text.toLowerCase();
	      // disallow any characters that do not change from .toUpperCase():
	      if (dropCapSpan.text === dropCapLowerCase) return null;
	
	      if (dropCapSpan.activeTags.indexOf("sc") >= 0) dropCapSpan.text = dropCapLowerCase;
	
	      var dropCap = this.dropCap = new DropCap(ctxt, "", this.sourceIndex);
	      dropCap.spans = [dropCapSpan];
	      var dropCapSourceGabcLength = this.sourceGabc.match(/^(?:<\/?[^>]>)*.?(?:<\/[^>]>)*/)[0].length;
	      dropCap.sourceGabc = this.sourceGabc.slice(0, dropCapSourceGabcLength);
	      this.sourceIndex += dropCap.sourceGabc.length;
	      this.sourceGabc = this.sourceGabc.slice(dropCapSourceGabcLength);
	
	      this.spans[0].text = this.spans[0].text.slice(1);
	      this.text = this.text.slice(1);
	      this.centerStartIndex--; // lost a letter, so adjust centering accordingly
	
	      return dropCap;
	    }
	  }, {
	    key: "getCssClasses",
	    value: function getCssClasses() {
	      var classes = this.lyricType === LyricType.Directive ? "directive " : "";
	
	      return classes + _get(Lyric.prototype.__proto__ || Object.getPrototypeOf(Lyric.prototype), "getCssClasses", this).call(this);
	    }
	  }, {
	    key: "getExtraStyleProperties",
	    value: function getExtraStyleProperties(ctxt) {
	      var props = _get(Lyric.prototype.__proto__ || Object.getPrototypeOf(Lyric.prototype), "getExtraStyleProperties", this).call(this, ctxt);
	
	      if (this.lyricType === LyricType.Directive && ctxt.autoColor === true) props = Object.assign({}, props, { fill: ctxt.rubricColor });
	
	      return props;
	    }
	  }]);
	
	  return Lyric;
	}(TextElement);
	
	var ChoralSign = exports.ChoralSign = function (_TextElement2) {
	  _inherits(ChoralSign, _TextElement2);
	
	  function ChoralSign(ctxt, text, note, sourceIndex) {
	    _classCallCheck(this, ChoralSign);
	
	    var _this15 = _possibleConstructorReturn(this, (ChoralSign.__proto__ || Object.getPrototypeOf(ChoralSign)).call(this, ctxt, (ctxt.textStyles.choralSign.prefix || "") + text, function (ctxt) {
	      return ctxt.textStyles.choralSign.font;
	    }, TextTypes.choralSign.size, "start", sourceIndex, text));
	
	    _this15.positionHint = MarkingPositionHint.Default;
	    _this15.note = note;
	    _this15.textType = TextTypes.choralSign;
	    return _this15;
	  }
	
	  _createClass(ChoralSign, [{
	    key: "recalculateMetrics",
	    value: function recalculateMetrics(ctxt) {
	      _get(ChoralSign.prototype.__proto__ || Object.getPrototypeOf(ChoralSign.prototype), "recalculateMetrics", this).call(this, ctxt);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      this.recalculateMetrics(ctxt);
	      this.bounds.x = this.note.bounds.x + Math.max(0, (ctxt.staffInterval - this.bounds.width) / 2); // center on the note itself
	
	      var offset = void 0,
	          staffPosition = void 0;
	      if (this.positionHint === MarkingPositionHint.Below) {
	        offset = -1;
	        staffPosition = this.note.staffPosition + 2 * offset;
	        staffPosition += staffPosition % 2 === 0 ? 0.3 : 1;
	      } else {
	        offset = 1;
	        staffPosition = this.note.staffPosition + 2 * offset;
	        staffPosition += staffPosition % 2 === 0 ? 0.3 : -0.4;
	      }
	      // if (staffPosition % 2 === 0) staffPosition += offset;
	      this.bounds.y = ctxt.calculateHeightFromStaffPosition(staffPosition) + this.origin.y;
	    }
	  }]);
	
	  return ChoralSign;
	}(TextElement);
	
	var AboveLinesText = exports.AboveLinesText = function (_TextElement3) {
	  _inherits(AboveLinesText, _TextElement3);
	
	  /**
	   * @param {String} text
	   */
	  function AboveLinesText(ctxt, text, notation, sourceIndex) {
	    _classCallCheck(this, AboveLinesText);
	
	    var _this16 = _possibleConstructorReturn(this, (AboveLinesText.__proto__ || Object.getPrototypeOf(AboveLinesText)).call(this, ctxt, (ctxt.textStyles.al.prefix || "") + text, function (ctxt) {
	      return ctxt.textStyles.al.font;
	    }, function (ctxt) {
	      return ctxt.textStyles.al.size;
	    }, "start", sourceIndex, text));
	
	    _this16.notation = notation;
	    _this16.textType = TextTypes.al;
	
	    _this16.padding = ctxt.staffInterval / 2;
	    return _this16;
	  }
	
	  return AboveLinesText;
	}(TextElement);
	
	var TranslationText = exports.TranslationText = function (_TextElement4) {
	  _inherits(TranslationText, _TextElement4);
	
	  /**
	   * @param {String} text
	   */
	  function TranslationText(ctxt, text, notation, sourceIndex) {
	    _classCallCheck(this, TranslationText);
	
	    var gabcSource = text;
	    var anchor = "start";
	    if (text === "/") {
	      text = "";
	      anchor = "end";
	    } else {
	      text = (ctxt.textStyles.translation.prefix || "") + text;
	    }
	
	    var _this17 = _possibleConstructorReturn(this, (TranslationText.__proto__ || Object.getPrototypeOf(TranslationText)).call(this, ctxt, text, function (ctxt) {
	      return ctxt.textStyles.translation.font;
	    }, function (ctxt) {
	      return ctxt.textStyles.translation.size;
	    }, anchor, sourceIndex, gabcSource));
	
	    _this17.notation = notation;
	    _this17.textType = TextTypes.translation;
	
	    _this17.padding = ctxt.staffInterval / 2;
	    return _this17;
	  }
	
	  return TranslationText;
	}(TextElement);
	
	var DropCap = exports.DropCap = function (_TextElement5) {
	  _inherits(DropCap, _TextElement5);
	
	  /**
	   * @param {String} text
	   */
	  function DropCap(ctxt, text, sourceIndex) {
	    _classCallCheck(this, DropCap);
	
	    var _this18 = _possibleConstructorReturn(this, (DropCap.__proto__ || Object.getPrototypeOf(DropCap)).call(this, ctxt, (ctxt.textStyles.dropCap.prefix || "") + text, function (ctxt) {
	      return ctxt.textStyles.dropCap.font;
	    }, function (ctxt) {
	      return ctxt.textStyles.dropCap.size;
	    }, "middle", sourceIndex, text));
	
	    _this18.textType = TextTypes.dropCap;
	
	    _this18.padding = ctxt.staffInterval * ctxt.textStyles.dropCap.padding;
	    return _this18;
	  }
	
	  return DropCap;
	}(TextElement);
	
	var TitleTextElement = exports.TitleTextElement = function (_TextElement6) {
	  _inherits(TitleTextElement, _TextElement6);
	
	  function TitleTextElement(ctxt, text, fontFamily, fontSize, textAnchor, sourceIndex, sourceGabc) {
	    _classCallCheck(this, TitleTextElement);
	
	    return _possibleConstructorReturn(this, (TitleTextElement.__proto__ || Object.getPrototypeOf(TitleTextElement)).call(this, ctxt, text, fontFamily, fontSize, textAnchor, sourceIndex, sourceGabc));
	  }
	
	  return TitleTextElement;
	}(TextElement);
	
	var Supertitle = exports.Supertitle = function (_TitleTextElement) {
	  _inherits(Supertitle, _TitleTextElement);
	
	  function Supertitle(ctxt, text, sourceIndex) {
	    _classCallCheck(this, Supertitle);
	
	    var _this20 = _possibleConstructorReturn(this, (Supertitle.__proto__ || Object.getPrototypeOf(Supertitle)).call(this, ctxt, (ctxt.textStyles.supertitle.prefix || "") + text, function (ctxt) {
	      return ctxt.textStyles.supertitle.font;
	    }, function (ctxt) {
	      return ctxt.textStyles.supertitle.size;
	    }, "middle", sourceIndex, text));
	
	    _this20.textType = TextTypes.supertitle;
	
	    _this20.padding = function (ctxt) {
	      return (Number(ctxt.textStyles.supertitle.padding) || 1) * ctxt.textStyles.supertitle.size / 3;
	    };
	    return _this20;
	  }
	
	  return Supertitle;
	}(TitleTextElement);
	
	var Title = exports.Title = function (_TitleTextElement2) {
	  _inherits(Title, _TitleTextElement2);
	
	  function Title(ctxt, text, sourceIndex) {
	    _classCallCheck(this, Title);
	
	    var _this21 = _possibleConstructorReturn(this, (Title.__proto__ || Object.getPrototypeOf(Title)).call(this, ctxt, (ctxt.textStyles.title.prefix || "") + text, function (ctxt) {
	      return ctxt.textStyles.title.font;
	    }, function (ctxt) {
	      return ctxt.textStyles.title.size;
	    }, "middle", sourceIndex, text));
	
	    _this21.textType = TextTypes.title;
	
	    _this21.padding = function (ctxt) {
	      return (Number(ctxt.textStyles.title.padding) || 1) * ctxt.textStyles.title.size / 3;
	    };
	    return _this21;
	  }
	
	  return Title;
	}(TitleTextElement);
	
	var Subtitle = exports.Subtitle = function (_TitleTextElement3) {
	  _inherits(Subtitle, _TitleTextElement3);
	
	  function Subtitle(ctxt, text, sourceIndex) {
	    _classCallCheck(this, Subtitle);
	
	    var _this22 = _possibleConstructorReturn(this, (Subtitle.__proto__ || Object.getPrototypeOf(Subtitle)).call(this, ctxt, (ctxt.textStyles.subtitle.prefix || "") + text, function (ctxt) {
	      return ctxt.textStyles.subtitle.font;
	    }, function (ctxt) {
	      return ctxt.textStyles.subtitle.size;
	    }, "middle", sourceIndex, text));
	
	    _this22.textType = TextTypes.subtitle;
	
	    _this22.padding = function (ctxt) {
	      return (Number(ctxt.textStyles.subtitle.padding) || 1) * ctxt.textStyles.subtitle.size / 3;
	    };
	    return _this22;
	  }
	
	  return Subtitle;
	}(TitleTextElement);
	
	var TextLeftRight = exports.TextLeftRight = function (_TitleTextElement4) {
	  _inherits(TextLeftRight, _TitleTextElement4);
	
	  function TextLeftRight(ctxt, text, type, sourceIndex) {
	    _classCallCheck(this, TextLeftRight);
	
	    var _this23 = _possibleConstructorReturn(this, (TextLeftRight.__proto__ || Object.getPrototypeOf(TextLeftRight)).call(this, ctxt, (ctxt.textStyles.leftRight.prefix || "") + text, function (ctxt) {
	      return ctxt.textStyles.leftRight.font;
	    }, function (ctxt) {
	      return ctxt.textStyles.leftRight.size;
	    }, type === "textLeft" ? "start" : "end", sourceIndex, text));
	
	    _this23.textType = TextTypes.leftRight;
	    _this23.extraClass = type === "textLeft" ? "textLeft" : "textRight";
	    _this23.headerKey = type === "textLeft" ? "text-left" : "text-right";
	    _this23.padding = function (ctxt) {
	      return (Number(ctxt.textStyles.leftRight.padding) || 1) * ctxt.textStyles.leftRight.size / 5;
	    };
	    return _this23;
	  }
	
	  _createClass(TextLeftRight, [{
	    key: "getCssClasses",
	    value: function getCssClasses() {
	      return this.extraClass + " " + _get(TextLeftRight.prototype.__proto__ || Object.getPrototypeOf(TextLeftRight.prototype), "getCssClasses", this).call(this);
	    }
	  }]);
	
	  return TextLeftRight;
	}(TitleTextElement);
	
	var Annotation = exports.Annotation = function (_TextElement7) {
	  _inherits(Annotation, _TextElement7);
	
	  /**
	   * @param {String} text
	   */
	  function Annotation(ctxt, text) {
	    _classCallCheck(this, Annotation);
	
	    var _this24 = _possibleConstructorReturn(this, (Annotation.__proto__ || Object.getPrototypeOf(Annotation)).call(this, ctxt, (ctxt.textStyles.annotation.prefix || "") + text, function (ctxt) {
	      return ctxt.textStyles.annotation.font;
	    }, function (ctxt) {
	      return ctxt.textStyles.annotation.size;
	    }, "middle"));
	
	    _this24.textType = TextTypes.annotation;
	    _this24.padding = ctxt.staffInterval * ctxt.textStyles.annotation.padding;
	    _this24.dominantBaseline = "hanging"; // so that annotations can be aligned at the top.
	    return _this24;
	  }
	
	  return Annotation;
	}(TextElement);
	
	var Annotations = exports.Annotations = function (_ChantLayoutElement9) {
	  _inherits(Annotations, _ChantLayoutElement9);
	
	  /**
	   * @param {String} text
	   */
	  function Annotations(ctxt) {
	    _classCallCheck(this, Annotations);
	
	    var _this25 = _possibleConstructorReturn(this, (Annotations.__proto__ || Object.getPrototypeOf(Annotations)).call(this));
	
	    _this25.lineHeight = 1.1;
	
	    for (var _len2 = arguments.length, texts = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	      texts[_key2 - 1] = arguments[_key2];
	    }
	
	    _this25.annotations = texts.map(function (text) {
	      return new Annotation(ctxt, text);
	    });
	    _this25.padding = Math.max.apply(null, _this25.annotations.map(function (annotation) {
	      return annotation.padding;
	    }));
	    return _this25;
	  }
	
	  _createClass(Annotations, [{
	    key: "updateBounds",
	    value: function updateBounds(multiplier) {
	      if (!multiplier) multiplier = 1;
	      for (var i = 0; i < this.annotations.length; ++i) {
	        var annotation = this.annotations[i];
	        annotation.bounds.x += this.bounds.x * multiplier;
	        annotation.bounds.y += this.bounds.y * multiplier;
	      }
	    }
	  }, {
	    key: "recalculateMetrics",
	    value: function recalculateMetrics(ctxt) {
	      this.bounds.x = 0;
	      this.bounds.y = 0;
	
	      this.bounds.width = 0;
	      this.bounds.height = 0;
	
	      this.origin.x = 0;
	      this.origin.y = 0;
	
	      var y = 0;
	      for (var i = 0; i < this.annotations.length; ++i) {
	        var annotation = this.annotations[i];
	        annotation.recalculateMetrics(ctxt);
	        this.bounds.width = Math.max(this.bounds.width, annotation.bounds.width);
	        annotation.bounds.y += y;
	        this.bounds.height = annotation.bounds.bottom();
	        this.origin.y = this.origin.y || annotation.origin.y;
	        y += annotation.fontSize(ctxt) * (annotation.resize || 1) * this.lineHeight;
	      }
	    }
	  }, {
	    key: "draw",
	    value: function draw(ctxt) {
	      this.updateBounds();
	      this.annotations.forEach(function (annotation) {
	        annotation.draw(ctxt);
	      });
	      this.updateBounds(-1);
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      this.updateBounds();
	      var result = this.annotations.map(function (annotation) {
	        return annotation.createSvgNode(ctxt);
	      });
	      this.updateBounds(-1);
	      return result;
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      this.updateBounds();
	      var result = this.annotations.map(function (annotation) {
	        return annotation.createSvgTree(ctxt);
	      });
	      this.updateBounds(-1);
	      return { children: result };
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      this.updateBounds();
	      var result = this.annotations.map(function (annotation) {
	        return annotation.createSvgFragment(ctxt);
	      }).join("");
	      this.updateBounds(-1);
	      return result;
	    }
	  }]);
	
	  return Annotations;
	}(ChantLayoutElement);
	
	var ChantNotationElement = exports.ChantNotationElement = function (_ChantLayoutElement10) {
	  _inherits(ChantNotationElement, _ChantLayoutElement10);
	
	  function ChantNotationElement() {
	    _classCallCheck(this, ChantNotationElement);
	
	    //double
	    var _this26 = _possibleConstructorReturn(this, (ChantNotationElement.__proto__ || Object.getPrototypeOf(ChantNotationElement)).call(this));
	
	    _this26.leadingSpace = 0.0;
	    _this26.trailingSpace = DefaultTrailingSpace;
	    _this26.keepWithNext = false;
	    _this26.needsLayout = true;
	
	    _this26.lyrics = [];
	
	    _this26.score = null; // the ChantScore
	    _this26.line = null; // the ChantLine
	
	    _this26.visualizers = [];
	    return _this26;
	  }
	
	  _createClass(ChantNotationElement, [{
	    key: "hasLyrics",
	    value: function hasLyrics() {
	      return this.lyrics.length !== 0;
	    }
	  }, {
	    key: "getAllLyricsLeft",
	    value: function getAllLyricsLeft() {
	      if (this.lyrics.length === 0) return this.bounds.right();
	
	      var x = Number.MAX_VALUE;
	      for (var i = 0; i < this.lyrics.length; i++) {
	        if (this.lyrics[i]) x = Math.min(x, this.lyrics[i].bounds.x);
	      }
	
	      return this.bounds.x + x;
	    }
	  }, {
	    key: "getAllLyricsRight",
	    value: function getAllLyricsRight() {
	      if (this.lyrics.length === 0) return this.bounds.x;
	
	      var x = Number.MIN_VALUE;
	      for (var i = 0; i < this.lyrics.length; i++) {
	        if (this.lyrics[i]) x = Math.max(x, this.lyrics[i].bounds.x + this.lyrics[i].bounds.width);
	      }
	
	      return this.bounds.x + x;
	    }
	
	    // used by subclasses while building up the chant notations.
	
	  }, {
	    key: "addVisualizer",
	    value: function addVisualizer(chantLayoutElement) {
	      if (!chantLayoutElement.ignoreBounds) {
	        if (this.bounds.isEmpty()) this.bounds = chantLayoutElement.bounds.clone();else this.bounds.union(chantLayoutElement.bounds);
	      }
	
	      this.visualizers.push(chantLayoutElement);
	    }
	
	    // same as addVisualizer, except the element is unshifted to the front
	    // of the visualizer array rather than the end. This way, some
	    // visualizers can be placed behind the others...ledger lines for example.
	
	  }, {
	    key: "prependVisualizer",
	    value: function prependVisualizer(chantLayoutElement) {
	      if (this.bounds.isEmpty()) this.bounds = chantLayoutElement.bounds.clone();else this.bounds.union(chantLayoutElement.bounds);
	
	      this.visualizers.unshift(chantLayoutElement);
	    }
	
	    // chant notation elements are given an opportunity to perform their layout via this function.
	    // subclasses should call this function first in overrides of this function.
	    // on completion, exsurge presumes that the bounds, the origin, and the fragment objects are
	    // all valid and prepared for higher level layout.
	
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      if (typeof this.trailingSpace === "function") this.calculatedTrailingSpace = this.trailingSpace(ctxt);else this.calculatedTrailingSpace = this.trailingSpace;
	
	      // reset the bounds and the staff notations before doing a layout
	      this.visualizers = [];
	      this.bounds = new _ExsurgeCore.Rect(Infinity, Infinity, -Infinity, -Infinity);
	
	      for (var i = 0; i < this.lyrics.length; i++) {
	        this.lyrics[i].recalculateMetrics(ctxt);
	      }if (this.alText) for (i = 0; i < this.alText.length; i++) {
	        this.alText[i].recalculateMetrics(ctxt);
	      }if (this.translationText) for (i = 0; i < this.translationText.length; i++) {
	        this.translationText[i].recalculateMetrics(ctxt);
	      }
	    }
	
	    // some subclasses have internal dependencies on other notations (for example,
	    // a custos can depend on a later neume which it uses to set its height).
	    // subclasses can override this function so that when the notations are
	    // altered, the subclass can correctly invalidate (and later restore) its own
	    // depedencies
	
	  }, {
	    key: "resetDependencies",
	    value: function resetDependencies() {}
	
	    // a helper function for subclasses to call after they are done performing layout...
	
	  }, {
	    key: "finishLayout",
	    value: function finishLayout(ctxt) {
	      var _this27 = this;
	
	      this.bounds.x = 0;
	
	      var language = this.lyrics[0] && this.lyrics[0].language || ctxt.defaultLanguage;
	      // center the neume itself over the syllable, or just the first punctum
	      // if the neume is wider than the syllable + the width of a punctum, we always revert to centering just over the punctum
	      var calculateLyricX = language.centerNeume ? function (lyric) {
	        return lyric.bounds.x = _this27.bounds.width + ctxt.staffInterval < lyric.vowelSegmentWidth ? _this27.bounds.width / 2 - lyric.origin.x : _this27.origin.x - lyric.origin.x;
	      } : function (lyric) {
	        return lyric.bounds.x = _this27.origin.x - lyric.origin.x;
	      };
	      this.lyrics.forEach(calculateLyricX);
	
	      this.needsLayout = false;
	    }
	  }, {
	    key: "draw",
	    value: function draw(ctxt) {
	      var canvasCtxt = ctxt.canvasCtxt;
	      canvasCtxt.translate(this.bounds.x, 0);
	
	      for (var i = 0; i < this.visualizers.length; i++) {
	        this.visualizers[i].draw(ctxt);
	      }for (i = 0; i < this.lyrics.length; i++) {
	        this.lyrics[i].draw(ctxt);
	      }if (this.translationText) for (i = 0; i < this.translationText.length; i++) {
	        this.translationText[i].draw(ctxt);
	      }if (this.alText) for (i = 0; i < this.alText.length; i++) {
	        this.alText[i].draw(ctxt);
	      }canvasCtxt.translate(-this.bounds.x, 0);
	    }
	  }, {
	    key: "getInnerSvgNodes",
	    value: function getInnerSvgNodes(ctxt) {
	      var functionName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "createSvgNode";
	
	      var inner = [];
	
	      for (i = 0; i < this.lyrics.length; i++) {
	        inner.push(this.lyrics[i][functionName](ctxt));
	      }if (this.translationText) for (i = 0; i < this.translationText.length; i++) {
	        inner.push(this.translationText[i][functionName](ctxt));
	      }if (this.alText) for (i = 0; i < this.alText.length; i++) {
	        inner.push(this.alText[i][functionName](ctxt));
	      }if (this.visualizers.length) {
	        var visualizers = [];
	        for (var i = 0; i < this.visualizers.length; i++) {
	          visualizers.push(this.visualizers[i][functionName](ctxt, this));
	        }if (functionName === "createSvgTree") {
	          inner.push(QuickSvg.createSvgTree.apply(QuickSvg, ["g", { class: "Notations" }].concat(visualizers)));
	        } else {
	          inner.push(QuickSvg.createNode("g", { class: "Notations" }, visualizers));
	        }
	      }
	      return inner;
	    }
	  }, {
	    key: "getSvgProps",
	    value: function getSvgProps() {
	      return {
	        // this.constructor.name will not be the same after being mangled by UglifyJS
	        class: "ChantNotationElement " + this.constructor.name,
	        transform: "translate(" + this.bounds.x + "," + 0 + ")"
	      };
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      var inner = this.getInnerSvgNodes(ctxt, "createSvgNode");
	      var svgProps = this.getSvgProps();
	      svgProps.source = this;
	      return QuickSvg.createNode("g", svgProps, inner);
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      var inner = this.getInnerSvgNodes(ctxt, "createSvgTree");
	      var svgProps = this.getSvgProps();
	      svgProps.source = this;
	      return QuickSvg.createSvgTree.apply(QuickSvg, ["g", svgProps].concat(_toConsumableArray(inner)));
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      var inner = "";
	
	      for (i = 0; i < this.lyrics.length; i++) {
	        inner += this.lyrics[i].createSvgFragment(ctxt);
	      }if (this.translationText) for (i = 0; i < this.translationText.length; i++) {
	        inner += this.translationText[i].createSvgFragment(ctxt);
	      }if (this.alText) for (i = 0; i < this.alText.length; i++) {
	        inner += this.alText[i].createSvgFragment(ctxt);
	      }for (var i = 0; i < this.visualizers.length; i++) {
	        inner += this.visualizers[i].createSvgFragment(ctxt, this);
	      }return QuickSvg.createFragment("g", this.getSvgProps(), inner);
	    }
	  }]);
	
	  return ChantNotationElement;
	}(ChantLayoutElement);
	
	var __connectorSpan = new TextSpan(" • ");
	var __mergeAnnotationWithTextLeft = function __mergeAnnotationWithTextLeft() {
	  for (var _len3 = arguments.length, annotationSpans = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	    annotationSpans[_key3] = arguments[_key3];
	  }
	
	  return annotationSpans.reduce(function (result, spans) {
	    if (result && result.length) {
	      if (spans && spans.length) return result.concat(__connectorSpan, spans);else return result;
	    } else if (spans && spans.length) {
	      return spans;
	    }
	    return [];
	  });
	};

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var addAccent = exports.addAccent = function addAccent(vowel) {
	  return {
	    "Æ": "Ǽ",
	    "Œ": "Œ́",
	    "A": "Á",
	    "E": "É",
	    "I": "Í",
	    "O": "Ó",
	    "U": "Ú",
	    "Y": "Ý",
	    "æ": "ǽ",
	    "œ": "œ́",
	    "a": "á",
	    "e": "é",
	    "i": "í",
	    "o": "ó",
	    "u": "ú",
	    "y": "ý"
	  }[vowel] || vowel;
	};

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var makeLigature = exports.makeLigature = function makeLigature(vowels) {
	  return {
	    AE: "Æ",
	    Ae: "Æ",
	    ae: "æ",
	    OE: "Œ",
	    Oe: "Œ",
	    oe: "œ"
	  }[vowels] || vowels;
	};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var greextraGlyphs = exports.greextraGlyphs = {
	  MedicaeaFlat: "",
	  HufnagelCustosUpShort: "",
	  HufnagelCustosUpLong: "",
	  HufnagelCustosUpMedium: "",
	  HufnagelCustosDownShort: "",
	  HufnagelCustosDownLong: "",
	  HufnagelCustosDownMedium: "",
	  MedicaeaCustosUpShort: "",
	  MedicaeaCustosUpLong: "",
	  MedicaeaCustosUpMedium: "",
	  MedicaeaCustosDownShort: "",
	  MedicaeaCustosDownLong: "",
	  MedicaeaCustosDownMedium: "",
	  MensuralCustosUpShort: "",
	  MensuralCustosUpLong: "",
	  MensuralCustosUpMedium: "",
	  MensuralCustosDownShort: "",
	  MensuralCustosDownLong: "",
	  MensuralCustosDownMedium: "",
	  MensuralFlat: "",
	  HufnagelFlat: "",
	  MedicaeaCClef: "",
	  MedicaeaCClefChange: "",
	  MedicaeaFClef: "",
	  MedicaeaFClefChange: "",
	  HufnagelCClef: "",
	  HufnagelCClefChange: "",
	  HufnagelFClef: "",
	  HufnagelFClefChange: "",
	  HugnagelCFClef: "",
	  HufnagelCFClefChange: "",
	  MensuralFlatHole: "",
	  HufnagelFlatHole: "",
	  MedicaeaFlatHole: "",
	  StarSix: "",
	  Dagger: "",
	  "Bar.alt": "",
	  StarHeight: "",
	  Cross: "",
	  "RBar.alt": "",
	  "VBar.alt": "",
	  Drawing1: "",
	  Drawing2: "",
	  RWithBarGoth: "",
	  VWithBarGoth: "",
	  Line1: "",
	  Line2: "",
	  Line3: "",
	  Line4: "",
	  Line5: "",
	  "Cross.alt": "",
	  ABarCaption: "",
	  RBarCaption: "",
	  VBarCaption: "",
	  ABarCaptionSC: "",
	  RBarCaptionSC: "",
	  VBarCaptionSC: "",
	  ABar: "",
	  RBar: "",
	  VBar: "",
	  ABarSC: "",
	  RBarSC: "",
	  VBarSC: "",
	  ABarSmall: "",
	  RBarSmall: "",
	  VBarSmall: "",
	  ABarSmallSC: "",
	  RBarSmallSC: "",
	  VBarSmallSC: "",
	  "RBar.alt2": "",
	  "VBar.alt2": "",
	  ABarCaptionSlant: "",
	  RBarCaptionSlant: "",
	  VBarCaptionSlant: "",
	  ABarSlant: "",
	  RBarSlant: "",
	  VBarSlant: "",
	  ABarSmallSlant: "",
	  RBarSmallSlant: "",
	  VBarSmallSlant: ""
	};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ChantDocument = exports.ChantScore = exports.ChantMapping = exports.ChantLineBreak = exports.TextOnly = exports.FaClef = exports.DoClef = exports.Clef = exports.Note = exports.NoteShapeModifiers = exports.NoteShape = exports.LiquescentType = undefined;
	
	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _ExsurgeChantChantLine = __webpack_require__(9);
	
	var _ExsurgeChantSigns = __webpack_require__(11);
	
	var _ExsurgeCore = __webpack_require__(1);
	
	var _ExsurgeDrawing = __webpack_require__(4);
	
	var _ExsurgeGabc = __webpack_require__(12);
	
	var _ExsurgeTitles = __webpack_require__(14);
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
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
	
	var LiquescentType = exports.LiquescentType = {
	  None: 0,
	
	  // flags that can be combined, though of course it
	  // it doesn't make sense to combine some!
	  Large: 1 << 0,
	  Small: 1 << 1,
	  Ascending: 1 << 2,
	  Descending: 1 << 3,
	  InitioDebilis: 1 << 4,
	
	  // handy liquescent types
	  LargeAscending: 1 << 0 | 1 << 2,
	  LargeDescending: 1 << 0 | 1 << 3,
	  SmallAscending: 1 << 1 | 1 << 2,
	  SmallDescending: 1 << 1 | 1 << 3
	};
	
	var NoteShape = exports.NoteShape = {
	  // shapes
	  Default: 0,
	  Virga: 1,
	  Inclinatum: 2,
	  Quilisma: 3,
	  Stropha: 4,
	  Oriscus: 5
	};
	
	var NoteShapeModifiers = exports.NoteShapeModifiers = {
	  // flags which modify the shape
	  // not all of them apply to every shape of course
	  None: 0,
	  Ascending: 1 << 0,
	  Descending: 1 << 1,
	  Cavum: 1 << 2,
	  Stemmed: 1 << 3,
	  Linea: 1 << 4,
	  Reverse: 1 << 5
	};
	
	/**
	 * @class
	 */
	
	var Note = exports.Note = function (_ChantLayoutElement) {
	  _inherits(Note, _ChantLayoutElement);
	
	  /**
	   * @para {Pitch} pitch
	   */
	  function Note(pitch) {
	    _classCallCheck(this, Note);
	
	    var _this = _possibleConstructorReturn(this, (Note.__proto__ || Object.getPrototypeOf(Note)).call(this));
	
	    if (typeof pitch !== "undefined") _this.pitch = pitch;else _this.pitch = null;
	
	    _this.glyphVisualizer = null;
	
	    // The staffPosition on a note is an integer that indicates the vertical position on the staff.
	    // 0 is the center space on the staff (equivalent to gabc 'g'). Positive numbers go up
	    // the staff, and negative numbers go down, i.e., 1 is gabc 'h', 2 is gabc 'i', -1 is gabc 'f', etc.
	    _this.staffPosition = 0;
	    _this.liquescent = LiquescentType.None;
	    _this.shape = NoteShape.Default;
	    _this.shapeModifiers = NoteShapeModifiers.None;
	
	    // notes keep track of the neume they belong to in order to facilitate layout
	    // this.neume gets set when a note is added to a neume via Neume.addNote()
	    _this.neume = null;
	
	    // various markings that can exist on a note, organized by type
	    // for faster access and simpler code logic
	    _this.episemata = [];
	    _this.morae = []; // silly to have an array of these, but gabc allows multiple morae per note!
	
	    // these are set on the note when they are needed, otherwise, they're undefined
	    // this.ictus
	    // this.accuteAccent
	    // this.braceStart
	    // this.braceEnd
	    return _this;
	  }
	
	  _createClass(Note, [{
	    key: "setGlyph",
	    value: function setGlyph(ctxt, glyphCode) {
	      if (this.glyphVisualizer) this.glyphVisualizer.setGlyph(ctxt, glyphCode);else this.glyphVisualizer = new _ExsurgeDrawing.GlyphVisualizer(ctxt, glyphCode);
	
	      this.glyphVisualizer.setStaffPosition(ctxt, this.staffPosition);
	
	      // assign glyphvisualizer metrics to this note
	      this.bounds.x = this.glyphVisualizer.bounds.x;
	      this.bounds.y = this.glyphVisualizer.bounds.y;
	      this.bounds.width = this.glyphVisualizer.bounds.width;
	      this.bounds.height = this.glyphVisualizer.bounds.height;
	
	      this.origin.x = this.glyphVisualizer.origin.x;
	      this.origin.y = this.glyphVisualizer.origin.y;
	    }
	
	    // a utility function for modifiers
	
	  }, {
	    key: "shapeModifierMatches",
	    value: function shapeModifierMatches(shapeModifier) {
	      if (shapeModifier === NoteShapeModifiers.None) return this.shapeModifier === NoteShapeModifiers.None;else return this.shapeModifier & shapeModifier !== 0;
	    }
	  }, {
	    key: "draw",
	    value: function draw(ctxt) {
	      this.glyphVisualizer.bounds.x = this.bounds.x;
	      this.glyphVisualizer.bounds.y = this.bounds.y;
	
	      this.glyphVisualizer.draw(ctxt);
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      this.glyphVisualizer.bounds.x = this.bounds.x;
	      this.glyphVisualizer.bounds.y = this.bounds.y;
	      this.svgNode = this.glyphVisualizer.createSvgNode(ctxt, this);
	      return this.svgNode;
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      this.glyphVisualizer.bounds.x = this.bounds.x;
	      this.glyphVisualizer.bounds.y = this.bounds.y;
	      return this.glyphVisualizer.createSvgTree(ctxt, this);
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      this.glyphVisualizer.bounds.x = this.bounds.x;
	      this.glyphVisualizer.bounds.y = this.bounds.y;
	      return this.glyphVisualizer.createSvgFragment(ctxt, this);
	    }
	  }]);
	
	  return Note;
	}(_ExsurgeDrawing.ChantLayoutElement);
	
	var Clef = exports.Clef = function (_ChantNotationElement) {
	  _inherits(Clef, _ChantNotationElement);
	
	  function Clef(staffPosition, octave) {
	    var defaultAccidental = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	
	    _classCallCheck(this, Clef);
	
	    var _this2 = _possibleConstructorReturn(this, (Clef.__proto__ || Object.getPrototypeOf(Clef)).call(this));
	
	    _this2.isClef = true;
	    _this2.staffPosition = staffPosition;
	    _this2.octave = octave;
	    _this2.defaultAccidental = defaultAccidental;
	    _this2.activeAccidental = defaultAccidental;
	    _this2.keepWithNext = true;
	    return _this2;
	  }
	
	  _createClass(Clef, [{
	    key: "resetAccidentals",
	    value: function resetAccidentals() {
	      this.activeAccidental = this.defaultAccidental;
	    }
	  }, {
	    key: "pitchToStaffPosition",
	    value: function pitchToStaffPosition(pitch) {}
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      ctxt.activeClef = this;
	
	      if (this.defaultAccidental) this.defaultAccidental.performLayout(ctxt);
	
	      _get(Clef.prototype.__proto__ || Object.getPrototypeOf(Clef.prototype), "performLayout", this).call(this, ctxt);
	    }
	  }, {
	    key: "finishLayout",
	    value: function finishLayout(ctxt) {
	      // if we have a default accidental, then add a glyph for it now
	      if (this.defaultAccidental) {
	        var accidentalGlyph = this.defaultAccidental.createGlyphVisualizer(ctxt);
	        accidentalGlyph.bounds.x += this.visualizers[0].bounds.right() + ctxt.intraNeumeSpacing;
	        this.addVisualizer(accidentalGlyph);
	      }
	
	      _get(Clef.prototype.__proto__ || Object.getPrototypeOf(Clef.prototype), "finishLayout", this).call(this, ctxt);
	    }
	  }, {
	    key: "clone",
	    value: function clone() {
	      if (this.model) return this.model.clone();
	      var clone = new this.constructor(this.staffPosition, this.octave, this.defaultAccidental);
	      clone.sourceGabc = this.sourceGabc;
	      clone.sourceIndex = this.sourceIndex;
	      clone.elementIndex = this.elementIndex;
	      clone.model = this;
	      return clone;
	    }
	  }], [{
	    key: "default",
	    value: function _default() {
	      return __defaultDoClef;
	    }
	  }]);
	
	  return Clef;
	}(_ExsurgeDrawing.ChantNotationElement);
	
	var DoClef = exports.DoClef = function (_Clef) {
	  _inherits(DoClef, _Clef);
	
	  function DoClef(staffPosition, octave) {
	    var defaultAccidental = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	
	    _classCallCheck(this, DoClef);
	
	    var _this3 = _possibleConstructorReturn(this, (DoClef.__proto__ || Object.getPrototypeOf(DoClef)).call(this, staffPosition, octave, defaultAccidental));
	
	    _this3.leadingSpace = 0.0;
	    return _this3;
	  }
	
	  _createClass(DoClef, [{
	    key: "pitchToStaffPosition",
	    value: function pitchToStaffPosition(pitch) {
	      return (pitch.octave - this.octave) * 7 + this.staffPosition + _ExsurgeCore.Pitch.stepToStaffOffset(pitch.step) - _ExsurgeCore.Pitch.stepToStaffOffset(_ExsurgeCore.Step.Do);
	    }
	  }, {
	    key: "staffPositionToPitch",
	    value: function staffPositionToPitch(staffPosition) {
	      var offset = staffPosition - this.staffPosition;
	      var octaveOffset = Math.floor(offset / 7);
	
	      var step = _ExsurgeCore.Pitch.staffOffsetToStep(offset);
	
	      if (this.activeAccidental && this.activeAccidental.staffPosition === staffPosition) step += this.activeAccidental.accidentalType;
	
	      return new _ExsurgeCore.Pitch(step, this.octave + octaveOffset);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(DoClef.prototype.__proto__ || Object.getPrototypeOf(DoClef.prototype), "performLayout", this).call(this, ctxt);
	
	      var glyph = new _ExsurgeDrawing.GlyphVisualizer(ctxt, _ExsurgeDrawing.GlyphCode.DoClef);
	      glyph.setStaffPosition(ctxt, this.staffPosition);
	      this.addVisualizer(glyph);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return DoClef;
	}(Clef);
	
	var __defaultDoClef = new DoClef(3, 2);
	
	var FaClef = exports.FaClef = function (_Clef2) {
	  _inherits(FaClef, _Clef2);
	
	  function FaClef(staffPosition, octave) {
	    var defaultAccidental = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	
	    _classCallCheck(this, FaClef);
	
	    var _this4 = _possibleConstructorReturn(this, (FaClef.__proto__ || Object.getPrototypeOf(FaClef)).call(this, staffPosition, octave, defaultAccidental));
	
	    _this4.octave = octave;
	
	    _this4.leadingSpace = 0;
	    return _this4;
	  }
	
	  _createClass(FaClef, [{
	    key: "pitchToStaffPosition",
	    value: function pitchToStaffPosition(pitch) {
	      return (pitch.octave - this.octave) * 7 + this.staffPosition + _ExsurgeCore.Pitch.stepToStaffOffset(pitch.step) - _ExsurgeCore.Pitch.stepToStaffOffset(_ExsurgeCore.Step.Fa);
	    }
	  }, {
	    key: "staffPositionToPitch",
	    value: function staffPositionToPitch(staffPosition) {
	      var offset = staffPosition - this.staffPosition + 3; // + 3 because it's a fa clef (3 == offset from Do)
	      var octaveOffset = Math.floor(offset / 7);
	
	      var step = _ExsurgeCore.Pitch.staffOffsetToStep(offset);
	
	      if (this.activeAccidental && this.activeAccidental.staffPosition === staffPosition) step += this.activeAccidental.accidentalType;
	
	      return new _ExsurgeCore.Pitch(step, this.octave + octaveOffset);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(FaClef.prototype.__proto__ || Object.getPrototypeOf(FaClef.prototype), "performLayout", this).call(this, ctxt);
	
	      var glyph = new _ExsurgeDrawing.GlyphVisualizer(ctxt, _ExsurgeDrawing.GlyphCode.FaClef);
	      glyph.setStaffPosition(ctxt, this.staffPosition);
	      this.addVisualizer(glyph);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return FaClef;
	}(Clef);
	
	/*
	 * TextOnly
	 */
	
	
	var TextOnly = exports.TextOnly = function (_ChantNotationElement2) {
	  _inherits(TextOnly, _ChantNotationElement2);
	
	  function TextOnly(sourceIndex, sourceLength) {
	    _classCallCheck(this, TextOnly);
	
	    var _this5 = _possibleConstructorReturn(this, (TextOnly.__proto__ || Object.getPrototypeOf(TextOnly)).call(this));
	
	    _this5.sourceIndex = sourceIndex;
	    _this5.sourceLength = sourceLength;
	    _this5.sourceGabc = "";
	    _this5.trailingSpace = 0;
	    return _this5;
	  }
	
	  _createClass(TextOnly, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(TextOnly.prototype.__proto__ || Object.getPrototypeOf(TextOnly.prototype), "performLayout", this).call(this, ctxt);
	
	      // add an empty glyph as a placeholder
	      this.addVisualizer(new _ExsurgeDrawing.GlyphVisualizer(ctxt, _ExsurgeDrawing.GlyphCode.None));
	
	      this.origin.x = 0;
	      this.origin.y = 0;
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return TextOnly;
	}(_ExsurgeDrawing.ChantNotationElement);
	
	var ChantLineBreak = exports.ChantLineBreak = function (_ChantNotationElement3) {
	  _inherits(ChantLineBreak, _ChantNotationElement3);
	
	  function ChantLineBreak(justify) {
	    _classCallCheck(this, ChantLineBreak);
	
	    var _this6 = _possibleConstructorReturn(this, (ChantLineBreak.__proto__ || Object.getPrototypeOf(ChantLineBreak)).call(this));
	
	    _this6.calculatedTrailingSpace = _this6.trailingSpace = 0;
	    _this6.justify = justify;
	    return _this6;
	  }
	
	  _createClass(ChantLineBreak, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      // reset the bounds before doing a layout
	      this.bounds = new _ExsurgeCore.Rect(0, 0, 0, 0);
	    }
	  }, {
	    key: "clone",
	    value: function clone() {
	      var lb = new ChantLineBreak();
	      lb.justify = this.justify;
	
	      return lb;
	    }
	  }]);
	
	  return ChantLineBreak;
	}(_ExsurgeDrawing.ChantNotationElement);
	
	// a chant mapping is a lightweight format independent way of
	// tracking how a chant language (e.g., gabc) has been
	// mapped to exsurge notations.
	
	
	var ChantMapping =
	// source can be any object type. in the case of gabc, source is a text
	// string that maps to a gabc word (e.g.: "no(g)bis(fg)").
	// notations is an array of ChantNotationElements
	exports.ChantMapping = function ChantMapping(source, notations, sourceIndex) {
	  _classCallCheck(this, ChantMapping);
	
	  this.source = source;
	  this.notations = notations;
	  this.sourceIndex = sourceIndex;
	};
	
	/*
	 * Score, document
	 */
	
	
	var ChantScore = exports.ChantScore = function () {
	  // mappings is an array of ChantMappings.
	  function ChantScore(ctxt) {
	    var mappings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
	    var useDropCap = arguments[2];
	
	    _classCallCheck(this, ChantScore);
	
	    this.mappings = mappings;
	
	    this.lines = [];
	    this.notes = [];
	    if (ctxt) this.titles = new _ExsurgeTitles.Titles(ctxt, this);
	
	    this.startingClef = null;
	
	    this.useDropCap = useDropCap;
	    this.dropCap = null;
	
	    this.annotation = null;
	
	    this.compiled = false;
	
	    this.autoColoring = true;
	    this.needsLayout = true;
	
	    // valid after chant lines are created...
	    this.bounds = new _ExsurgeCore.Rect();
	
	    if (ctxt) this.updateNotations(ctxt);
	  }
	
	  /**
	   * Make a copy of the score, only including the specified lines
	   * @param  {number} startLine starting index
	   * @param  {number} endLine   ending index
	   * @return {ChantScore}           the partial score
	   */
	
	
	  _createClass(ChantScore, [{
	    key: "copyLines",
	    value: function copyLines(startLine, endLine) {
	      var result = new ChantScore();
	      result.lines = this.lines.slice(startLine, endLine);
	      result.bounds = this.bounds.clone();
	      var lastLine = result.lines.slice(-1)[0];
	      result.bounds.height = lastLine.bounds.bottom() - lastLine.origin.y;
	      if (startLine === 0) {
	        result.titles = this.titles;
	        result.dropCap = this.dropCap;
	        result.annotation = this.annotation;
	      }
	      return result;
	    }
	  }, {
	    key: "updateSelection",
	    value: function updateSelection(selection) {
	      this.selection = selection;
	      var elementSelection = selection && selection.element || {
	        indices: []
	      };
	      var selectedIndices = elementSelection.indices;
	      var insertion = elementSelection.insertion;
	      if (!insertion && selectedIndices.length === 1 && this.notes[selectedIndices[0]] instanceof TextOnly) {
	        // if there is only one selection, and its a text only, it should display as an insertion cursor:
	        insertion = { afterElementIndex: selectedIndices[0] };
	      }
	      // update the selected elements so that they can be given a .selected class when rendered
	      for (var i = 0; i < this.notes.length; ++i) {
	        var element = this.notes[i];
	        element.selected = selectedIndices.includes(i);
	      }
	      (this.startingClef.model || this.startingClef).selected = selectedIndices.includes(-1);
	      for (var _i = 0; _i < this.lines.length; ++_i) {
	        this.lines[_i].insertionCursor = null;
	      }
	      // update the insertion cursor, so it can be drawn on the correct system
	      this.insertionElement = null;
	      var insertionLine = null;
	      if (insertion) {
	        if (typeof insertion.chantLine === "number") {
	          insertionLine = this.lines[insertion.chantLine];
	          this.insertionElement = insertionLine.startingClef;
	          insertionLine.insertionCursor = new _ExsurgeChantSigns.InsertionCursor();
	        } else if (typeof insertion.afterElementIndex === "number") {
	          this.insertionElement = this.notes[insertion.afterElementIndex];
	          if (!this.insertionElement) {
	            insertionLine = this.lines[0];
	            this.insertionElement = insertionLine.startingClef;
	          } else if (this.insertionElement.neume) {
	            this.insertionElement = this.insertionElement.neume;
	          }
	          if (!insertionLine) {
	            insertionLine = this.insertionElement.line || this.lines[this.lines.length - 1];
	          }
	          insertionLine.insertionCursor = new _ExsurgeChantSigns.InsertionCursor();
	        }
	      }
	    }
	  }, {
	    key: "updateNotations",
	    value: function updateNotations(ctxt) {
	      var i, j, mapping, notation;
	
	      // flatten all mappings into one array for N(0) access to notations
	      this.notations = [];
	      this.notes = [];
	      this.hasLyrics = false;
	      this.hasAboveLinesText = false;
	      this.hasTranslations = false;
	      var elementSelection = this.selection && this.selection.element || {
	        indices: []
	      };
	      var selectedIndices = elementSelection.indices;
	      var nonNoteElementCount = 0;
	
	      // find the starting clef...
	      // start with a default clef in case the notations don't provide one.
	      this.startingClef = null;
	
	      for (i = 0; i < this.mappings.length; i++) {
	        mapping = this.mappings[i];
	        for (j = 0; j < mapping.notations.length; j++) {
	          notation = mapping.notations[j];
	          notation.score = this;
	          notation.mapping = mapping;
	
	          if (!this.startingClef) {
	            if (notation.isNeume) {
	              this.startingClef = Clef.default();
	            } else if (notation.isClef) {
	              this.startingClef = notation;
	              continue;
	            }
	          }
	
	          notation.notationIndex = this.notations.push(notation) - 1;
	          if (!this.hasLyrics && notation.hasLyrics()) this.hasLyrics = true;
	          if (!this.hasAboveLinesText && notation.alText) this.hasAboveLinesText = true;
	          if (!this.hasTranslations && notation.translationText) this.hasTranslations = true;
	
	          // Update this.notes and find element indices:
	          var elements = notation.notes || [notation];
	          var _iteratorNormalCompletion = true;
	          var _didIteratorError = false;
	          var _iteratorError = undefined;
	
	          try {
	            for (var _iterator = elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	              var element = _step.value;
	
	              var elementIndex = element.elementIndex = this.notes.push(element) - 1;
	              if (element instanceof Note) {
	                element.noteIndex = elementIndex - nonNoteElementCount;
	              } else {
	                ++nonNoteElementCount;
	              }
	
	              element.selected = selectedIndices.includes(elementIndex);
	            }
	          } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	              }
	            } finally {
	              if (_didIteratorError) {
	                throw _iteratorError;
	              }
	            }
	          }
	        }
	      }
	
	      // if we've reached this far and we *still* don't have a clef, then there aren't even
	      // any neumes in the score. still, set the default clef just for good measure
	      if (!this.startingClef) this.startingClef = Clef.default();
	      this.startingClef.elementIndex = -1;
	
	      // update drop cap
	      if (this.useDropCap) this.recreateDropCap(ctxt);else this.dropCap = null;
	
	      this.needsLayout = true;
	    }
	  }, {
	    key: "recreateDropCap",
	    value: function recreateDropCap(ctxt) {
	      this.dropCap = null;
	
	      // find the first notation with lyrics to use
	      for (var i = 0; i < this.notations.length; i++) {
	        if (this.notations[i].hasLyrics() && this.notations[i].lyrics[0] !== null && this.notations[i].lyrics[0].spans && this.notations[i].lyrics[0].spans.length) {
	          var notation = this.notations[i],
	              lyrics = notation.lyrics[0];
	          if (this.useDropCap) {
	            this.dropCap = lyrics.generateDropCap(ctxt);
	          } else {
	            lyrics.dropCap = null;
	            lyrics.generateSpansFromText(ctxt, lyrics.originalText);
	          }
	          notation.needsLayout = true;
	          return;
	        }
	      }
	    }
	
	    /**
	     * Shared layout initialization method for performLayout() and performLayoutAsync()
	     * @param  {ChantContext} ctxt
	     */
	
	  }, {
	    key: "initializeLayout",
	    value: function initializeLayout(ctxt) {
	      // setup the context
	      ctxt.activeClef = this.startingClef;
	      ctxt.notations = this.notations;
	      ctxt.currNotationIndex = 0;
	
	      if (this.dropCap) this.dropCap.recalculateMetrics(ctxt);
	
	      if (this.annotation) this.annotation.recalculateMetrics(ctxt);
	    }
	
	    // this is the the synchronous version of performLayout that
	    // process everything without yielding to any other workers/threads.
	    // good for server side processing or very small chant pieces.
	
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt, force) {
	      if (!force && this.needsLayout === false) return; // nothing to do here!
	
	      ctxt.updateHyphenWidth();
	
	      this.initializeLayout(ctxt);
	
	      for (var i = 0; i < this.notations.length; i++) {
	        var notation = this.notations[i];
	        if (force || notation.needsLayout) {
	          ctxt.currNotationIndex = i;
	          notation.performLayout(ctxt);
	        }
	      }
	
	      this.needsLayout = false;
	    }
	
	    // for web applications, probably performLayoutAsync would be more
	    // apppropriate that the above performLayout, since it will process
	    // the notations without locking up the UI thread.
	
	  }, {
	    key: "performLayoutAsync",
	    value: function performLayoutAsync(ctxt, finishedCallback) {
	      var _this7 = this;
	
	      if (this.needsLayout === false) {
	        if (finishedCallback) setTimeout(function () {
	          return finishedCallback();
	        }, 0);
	
	        return; // nothing to do here!
	      }
	
	      if (ctxt.onFontLoaded) {
	        ctxt.onFontLoaded.push(function () {
	          return _this7.performLayoutAsync(ctxt, finishedCallback);
	        });
	        return;
	      }
	
	      // check for sane value of hyphen width:
	      ctxt.updateHyphenWidth();
	      if (!ctxt.hyphenWidth || ctxt.hyphenWidth / ctxt.textStyles.lyric.size > 0.6) {
	        setTimeout(function () {
	          _this7.performLayoutAsync(ctxt, finishedCallback);
	        }, 100);
	        return;
	      }
	
	      this.initializeLayout(ctxt);
	
	      setTimeout(function () {
	        return _this7.layoutElementsAsync(ctxt, 0, finishedCallback);
	      }, 0);
	    }
	  }, {
	    key: "layoutElementsAsync",
	    value: function layoutElementsAsync(ctxt, index, finishedCallback) {
	      var _this8 = this;
	
	      if (index >= this.notations.length) {
	        this.needsLayout = false;
	
	        if (finishedCallback) setTimeout(function () {
	          return finishedCallback();
	        }, 0);
	
	        return;
	      }
	
	      if (index === 0) ctxt.activeClef = this.startingClef;
	
	      var timeout = new Date().getTime() + 50; // process for fifty milliseconds
	      do {
	        var notation = this.notations[index];
	        if (notation.needsLayout) {
	          ctxt.currNotationIndex = index;
	          notation.performLayout(ctxt);
	        }
	
	        index++;
	      } while (index < this.notations.length && new Date().getTime() < timeout);
	
	      // schedule the next block of processing
	      setTimeout(function () {
	        return _this8.layoutElementsAsync(ctxt, index, finishedCallback);
	      }, 0);
	    }
	  }, {
	    key: "layoutChantLines",
	    value: function layoutChantLines(ctxt, width, finishedCallback) {
	      this.lines = [];
	
	      if (ctxt.mergeAnnotationWithTextLeft && this.annotation && !this.dropCap) {
	        var annotation = this.annotation,
	            annotationSpans = annotation.annotations ? annotation.annotations.map(function (annotation) {
	          return annotation.spans;
	        }) : [annotation.spans];
	        this.overrideTextLeft = new _ExsurgeDrawing.TextLeftRight(ctxt, "", "textLeft");
	        if (ctxt.mapAnnotationSpansToTextLeft) {
	          annotationSpans = annotationSpans.map(ctxt.mapAnnotationSpansToTextLeft);
	        }
	        this.overrideTextLeft.spans = ctxt.mergeAnnotationWithTextLeft.apply(ctxt, _toConsumableArray(annotationSpans).concat([this.titles.textLeft && this.titles.textLeft.spans]));
	      } else {
	        this.overrideTextLeft = null;
	      }
	
	      var y = width > 0 ? this.titles.layoutTitles(ctxt, width) : 0;
	      var currIndex = 0;
	
	      ctxt.activeClef = this.startingClef;
	
	      var spaceBetweenSystems = ctxt.staffInterval * ctxt.spaceBetweenSystems;
	
	      do {
	        var line = new _ExsurgeChantChantLine.ChantLine(this);
	
	        line.buildFromChantNotationIndex(ctxt, currIndex, width);
	        currIndex = line.notationsStartIndex + line.numNotationsOnLine;
	        line.performLayout(ctxt);
	        line.elementIndex = this.lines.length;
	        this.lines.push(line);
	
	        line.bounds.y = -line.bounds.y + y;
	        y += line.bounds.height + spaceBetweenSystems;
	      } while (currIndex < this.notations.length);
	
	      var lastLine = this.lines[this.lines.length - 1];
	
	      this.bounds.x = 0;
	      this.bounds.y = 0;
	      this.bounds.width = lastLine.bounds.width;
	      this.bounds.height = y - spaceBetweenSystems;
	
	      this.pages = [this];
	
	      if (this.selection) {
	        this.updateSelection(this.selection);
	      }
	
	      if (finishedCallback) finishedCallback(this);
	    }
	  }, {
	    key: "paginate",
	    value: function paginate(height) {
	      if (!height) return;
	      this.pages = [];
	      var pageHeightOffset = 0,
	          startLineIndex = 0;
	      for (var i = 1; i < this.lines.length; ++i) {
	        var line = this.lines[i];
	        var pageHeight = line.bounds.bottom() - pageHeightOffset - line.origin.y;
	
	        if (pageHeight > height) {
	          // this line will be the first on the new page
	          this.pages.push(this.copyLines(startLineIndex, i));
	          startLineIndex = i;
	          pageHeightOffset = line.bounds.y - line.origin.y;
	          line.bounds.y = line.origin.y;
	        } else {
	          // not a new page yet...update the bounds:
	          line.bounds.y -= pageHeightOffset;
	        }
	      }
	      this.pages.push(this.copyLines(startLineIndex, this.lines.length));
	    }
	  }, {
	    key: "draw",
	    value: function draw(ctxt) {
	      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
	
	      ctxt.setCanvasSize(this.bounds.width, this.bounds.height, scale);
	
	      var canvasCtxt = ctxt.canvasCtxt;
	
	      canvasCtxt.clearRect(0, 0, ctxt.canvas.width, ctxt.canvas.height);
	
	      canvasCtxt.translate(this.bounds.x, this.bounds.y);
	
	      if (this.titles) this.titles.draw(ctxt);
	
	      for (var i = 0; i < this.lines.length; i++) {
	        this.lines[i].draw(ctxt);
	      }canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
	    }
	  }, {
	    key: "getSvgProps",
	    value: function getSvgProps(ctxt, zoom) {
	      var width = typeof zoom === "number" ? zoom * this.bounds.width : zoom ? undefined : this.bounds.width,
	          height = zoom ? undefined : this.bounds.height;
	
	      return {
	        xmlns: "http://www.w3.org/2000/svg",
	        version: "1.1",
	        class: "Exsurge ChantScore" + (ctxt.editable ? " EditableChantScore" : ""),
	        width: width,
	        height: height,
	        viewBox: [0, 0, this.bounds.width, this.bounds.height].join(" ")
	      };
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      // create defs section
	      var node = [ctxt.defsNode.cloneNode(true)];
	      node[0].appendChild(ctxt.createStyleNode());
	
	      if (this.titles) node.push(this.titles.createSvgNode(ctxt));
	
	      for (var i = 0; i < this.lines.length; i++) {
	        node.push(this.lines[i].createSvgNode(ctxt));
	      }node = _ExsurgeDrawing.QuickSvg.createNode("g", {}, node);
	
	      node = _ExsurgeDrawing.QuickSvg.createNode("svg", this.getSvgProps(ctxt), node);
	
	      node.source = this;
	      this.svg = node;
	
	      return node;
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt, zoom) {
	      // create defs section
	      var node = [_ExsurgeDrawing.QuickSvg.createSvgTree.apply(_ExsurgeDrawing.QuickSvg, ["defs", {}].concat(_toConsumableArray(ctxt.makeDefs.map(function (makeDef) {
	        return makeDef.makeSvgTree();
	      })), [ctxt.createStyleTree()]))];
	
	      if (this.titles) node.push(this.titles.createSvgTree(ctxt));
	
	      for (var i = 0; i < this.lines.length; i++) {
	        node.push(this.lines[i].createSvgTree(ctxt));
	      }node = _ExsurgeDrawing.QuickSvg.createSvgTree.apply(_ExsurgeDrawing.QuickSvg, ["g", {}].concat(_toConsumableArray(node)));
	      var svgProps = this.getSvgProps(ctxt, zoom);
	      svgProps.source = this;
	      node = _ExsurgeDrawing.QuickSvg.createSvgTree("svg", svgProps, node);
	
	      return node;
	    }
	  }, {
	    key: "createSvg",
	    value: function createSvg(ctxt) {
	      var fragment = "";
	
	      // create defs section
	      for (var def in ctxt.defs) {
	        if (ctxt.defs.hasOwnProperty(def)) fragment += ctxt.defs[def];
	      }fragment += ctxt.createStyle();
	
	      fragment = _ExsurgeDrawing.QuickSvg.createFragment("defs", {}, fragment);
	
	      if (this.titles) fragment += this.titles.createSvgFragment(ctxt);
	
	      for (var i = 0; i < this.lines.length; i++) {
	        fragment += this.lines[i].createSvgFragment(ctxt);
	      }fragment = _ExsurgeDrawing.QuickSvg.createFragment("g", {}, fragment);
	
	      fragment = _ExsurgeDrawing.QuickSvg.createFragment("svg", this.getSvgProps(ctxt), fragment);
	
	      return fragment;
	    }
	  }, {
	    key: "createSvgNodeForEachLine",
	    value: function createSvgNodeForEachLine(ctxt) {
	      var node = [];
	
	      var top = 0;
	      for (var i = 0; i < this.lines.length; i++) {
	        var lineFragment = [ctxt.defsNode.cloneNode(true), this.lines[i].createSvgNode(ctxt, top)];
	        lineFragment[0].appendChild(ctxt.createStyleNode());
	        var height = this.lines[i].bounds.height + ctxt.staffInterval * 1.5;
	        lineFragment = _ExsurgeDrawing.QuickSvg.createNode("g", {}, lineFragment);
	        lineFragment = _ExsurgeDrawing.QuickSvg.createNode("svg", {
	          xmlns: "http://www.w3.org/2000/svg",
	          version: "1.1",
	          class: "Exsurge ChantScore",
	          width: this.bounds.width,
	          height: height,
	          viewBox: [0, 0, this.bounds.width, height].join(" ")
	        }, lineFragment);
	        node.push(lineFragment);
	        top += height;
	      }
	      return node;
	    }
	  }, {
	    key: "createSvgForEachLine",
	    value: function createSvgForEachLine(ctxt) {
	      var fragment = "",
	          fragmentDefs = "";
	
	      // create defs section
	      for (var def in ctxt.defs) {
	        if (ctxt.defs.hasOwnProperty(def)) fragmentDefs += ctxt.defs[def];
	      }fragmentDefs += ctxt.createStyle();
	
	      fragmentDefs = _ExsurgeDrawing.QuickSvg.createFragment("defs", {}, fragmentDefs);
	      var top = 0;
	      for (var i = 0; i < this.lines.length; i++) {
	        var lineFragment = fragmentDefs + this.lines[i].createSvgFragment(ctxt, top);
	        var height = this.lines[i].bounds.height + ctxt.staffInterval * 1.5;
	        lineFragment = _ExsurgeDrawing.QuickSvg.createFragment("g", {}, lineFragment);
	        lineFragment = _ExsurgeDrawing.QuickSvg.createFragment("svg", {
	          xmlns: "http://www.w3.org/2000/svg",
	          version: "1.1",
	          "xmlns:xlink": "http://www.w3.org/1999/xlink",
	          class: "Exsurge ChantScore",
	          width: this.bounds.width,
	          height: height
	        }, lineFragment);
	        fragment += lineFragment;
	        top += height;
	      }
	      return fragment;
	    }
	  }, {
	    key: "unserializeFromJson",
	    value: function unserializeFromJson(data, ctxt) {
	      this.autoColoring = data["auto-coloring"];
	
	      if (data.annotation !== null && data.annotation !== "") {
	        // create the annotation
	        this.annotation = new _ExsurgeDrawing.Annotation(ctxt, data.annotation);
	      } else this.annotation = null;
	
	      var createDropCap = data["drop-cap"] === "auto" ? true : false;
	
	      _ExsurgeGabc.Gabc.parseChantNotations(data.notations, this, createDropCap);
	    }
	  }, {
	    key: "serializeToJson",
	    value: function serializeToJson() {
	      var data = {};
	
	      data["type"] = "score";
	      data["auto-coloring"] = true;
	
	      if (this.annotation !== null) data.annotation = this.annotation.unsanitizedText;else data.annotation = "";
	
	      return data;
	    }
	  }]);
	
	  return ChantScore;
	}();
	
	var ChantDocument = exports.ChantDocument = function () {
	  function ChantDocument() {
	    _classCallCheck(this, ChantDocument);
	
	    var defaults = {
	      layout: {
	        units: "mm",
	        "default-font": {
	          "font-family": "Crimson",
	          "font-size": 14
	        },
	        page: {
	          width: 8.5,
	          height: 11,
	          "margin-left": 0,
	          "margin-top": 0,
	          "margin-right": 0,
	          "margin-bottom": 0
	        }
	      },
	      scores: []
	    };
	
	    // default layout
	    this.copyLayout(this, defaults);
	
	    this.scores = defaults.scores;
	  }
	
	  _createClass(ChantDocument, [{
	    key: "copyLayout",
	    value: function copyLayout(to, from) {
	      to.layout = {
	        units: from.layout.units,
	        "default-font": {
	          "font-family": from.layout["default-font"]["font-family"],
	          "font-size": from.layout["default-font"]["font-size"]
	        },
	        page: {
	          width: from.layout.page.width,
	          height: from.layout.page.height,
	          "margin-left": from.layout.page["margin-left"],
	          "margin-top": from.layout.page["margin-top"],
	          "margin-right": from.layout.page["margin-right"],
	          "margin-bottom": from.layout.page["margin-bottom"]
	        }
	      };
	    }
	  }, {
	    key: "unserializeFromJson",
	    value: function unserializeFromJson(data) {
	      this.copyLayout(this, data);
	
	      this.scores = [];
	
	      // read in the scores
	      for (var i = 0; i < data.scores.length; i++) {
	        var score = new ChantScore();
	
	        score.unserializeFromJson(data.scores[i]);
	        this.scores.push(score);
	      }
	    }
	  }, {
	    key: "serializeToJson",
	    value: function serializeToJson() {
	      var data = {};
	
	      this.copyLayout(data, this);
	
	      data.scores = [];
	
	      // save scores...
	      for (var i = 0; i < this.scores.length; i++) {
	        data.scores.push(this.scores[i].serializeToJson());
	      }return data;
	    }
	  }]);

	  return ChantDocument;
	}();

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ChantLine = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _ExsurgeChant = __webpack_require__(8);
	
	var _ExsurgeChantMarkings = __webpack_require__(10);
	
	var _ExsurgeChantSigns = __webpack_require__(11);
	
	var _ExsurgeCore = __webpack_require__(1);
	
	var _ExsurgeDrawing = __webpack_require__(4);
	
	var _ExsurgeGlyphs = __webpack_require__(3);
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
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
	
	// a chant line represents one staff line on the page. ChantLines are created by the score
	// and laid out by the page
	var ChantLine = exports.ChantLine = function (_ChantLayoutElement) {
	  _inherits(ChantLine, _ChantLayoutElement);
	
	  function ChantLine(score) {
	    _classCallCheck(this, ChantLine);
	
	    var _this = _possibleConstructorReturn(this, (ChantLine.__proto__ || Object.getPrototypeOf(ChantLine)).call(this));
	
	    _this.score = score;
	
	    _this.notationsStartIndex = 0;
	    _this.numNotationsOnLine = 0;
	    _this.notationBounds = null; // Rect
	
	    _this.staffLeft = 0;
	    _this.staffRight = 0;
	
	    _this.startingClef = null; // necessary for the layout process
	    _this.custos = null;
	
	    _this.justify = true;
	
	    // these are markings that exist at the chant line level rather than at the neume level.
	    _this.ledgerLines = [];
	    _this.braces = [];
	
	    _this.nextLine = null;
	    _this.previousLine = null; // for layout assistance
	
	    _this.lyricLineHeight = 0; // height of each text line
	    _this.lyricLineBaseline = 0; // offsets from the top of the text line to the baseline
	    _this.numLyricLines = 0; // maximum count of lyrics on the same syllable
	
	    // fixme: make these configurable values from the score
	    _this.spaceAfterNotations = 0; // the space between the notation bounds and the first text track
	    _this.spaceBetweenTextTracks = 0; // spacing between each text track
	
	    _this.lastLyrics = [];
	    return _this;
	  }
	
	  _createClass(ChantLine, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      // start off with a rectangle that holds at least the four staff lines
	      this.notationBounds = new _ExsurgeCore.Rect(this.staffLeft, -(ctxt.staffLineWeight / 2 + 3 + ctxt.minSpaceAboveStaff) * ctxt.staffInterval, this.staffRight - this.staffLeft, (ctxt.staffLineWeight + 6 + ctxt.minSpaceAboveStaff) * ctxt.staffInterval);
	
	      // run through all the elements of the line and calculate the bounds of the notations,
	      // as well as the bounds of each text track we will use
	      var i;
	      var notations = this.score.notations;
	      var lastNeumeIndex = this.extraTextOnlyIndex === null ? this.notationsStartIndex + this.numNotationsOnLine : this.extraTextOnlyIndex;
	      var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
	      var notation = null;
	
	      this.notationBounds.union(this.startingClef.bounds);
	
	      // reset the lyric line offsets before we [re]calculate them now
	      this.lyricLineHeight = ctxt.textStyles.lyric.size * 1.1;
	      this.lyricLineBaseline = 0;
	      this.numLyricLines = 0;
	
	      this.altLineHeight = 0;
	      this.altLineBaseline = 0;
	      this.numAltLines = 0;
	
	      this.translationLineHeight = ctxt.textStyles.translation.size * 1.1;
	      this.translationLineBaseline = 0;
	      this.numTranslationLines = 0;
	
	      for (i = this.notationsStartIndex; i < lastNeumeIndex; i++) {
	        notation = notations[i];
	
	        this.notationBounds.union(notation.bounds);
	
	        // keep track of lyric line offsets
	        if (notation.lyrics.length && notation.lyrics[0].text) {
	          // if (notation.lyrics[0].bounds.height > this.lyricLineHeight)
	          //   this.lyricLineHeight = notation.lyrics[0].bounds.height;
	          if (notation.lyrics[0].origin.y > this.lyricLineBaseline) this.lyricLineBaseline = notation.lyrics[0].origin.y;
	          if (notation.lyrics.length > this.numLyricLines) this.numLyricLines = notation.lyrics.length;
	        }
	
	        if (notation.alText && this.numAltLines < notation.alText.length) {
	          if (notation.alText[0].bounds.height > this.altLineHeight) this.altLineHeight = notation.alText[0].bounds.height;
	          if (notation.alText[0].origin.y > this.altLineBaseline) this.altLineBaseline = notation.alText[0].origin.y;
	          if (notation.alText.length > this.numAltLines) this.numAltLines = notation.alText.length;
	        }
	
	        if (notation.translationText && notation.translationText[0] && notation.translationText[0].text) {
	          // if (
	          //   notation.translationText[0].bounds.height > this.translationLineHeight
	          // )
	          //   this.translationLineHeight =
	          //     notation.translationText[0].bounds.height;
	          if (notation.translationText[0].origin.y > this.translationLineBaseline) this.translationLineBaseline = notation.translationText[0].origin.y;
	          if (notation.translationText.length > this.numTranslationLines) this.numTranslationLines = notation.translationText.length;
	        }
	      }
	
	      if (this.custos) this.notationBounds.union(this.custos.bounds);
	
	      // add any braces to the notationBounds as well
	      for (i = 0; i < this.braces.length; i++) {
	        this.notationBounds.union(this.braces[i].bounds);
	      } // finalize the lyrics placement
	      var notationBoundsOffset = this.notationBounds.bottom() + ctxt.minSpaceBelowStaff * ctxt.staffInterval;
	      this.lyricLineBaseline += notationBoundsOffset;
	      this.translationLineBaseline += notationBoundsOffset;
	      this.altLineBaseline += this.notationBounds.y - this.altLineHeight - ctxt.staffInterval * 0.5;
	
	      for (i = this.notationsStartIndex; i < lastNeumeIndex; i++) {
	        notation = notations[i];
	        var offset = 0;
	        for (var j = 0; j < notation.lyrics.length; j++) {
	          notation.lyrics[j].bounds.y = offset + this.lyricLineBaseline;
	          offset += this.lyricLineHeight;
	        }
	
	        if (notation.translationText) {
	          for (j = 0; j < notation.translationText.length; j++) {
	            notation.translationText[j].bounds.y = offset + this.translationLineBaseline;
	            offset += this.translationLineHeight;
	          }
	        }
	
	        if (notation.alText) {
	          offset = 0;
	          for (j = 0; j < notation.alText.length; j++) {
	            notation.alText[j].bounds.y = offset + this.altLineBaseline;
	            offset -= ctxt.textStyles.al.size * 1.1;
	          }
	        }
	      }
	
	      this.extraTextOnlyHeight = 0;
	      // handle placement of extra TextOnly elements:
	      if (ctxt.useExtraTextOnly) {
	        var extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex;
	        if (this.extraTextOnlyIndex === null) {
	          // even if extraTextOnlyIndex is null, there might be extra lines on the last lyric if it is TextOnly:
	          var lastNotation = notations[lastNeumeIndex - 1] || {};
	          if (lastNotation.constructor === _ExsurgeChant.ChantLineBreak) lastNotation = notations[lastNeumeIndex - 2];
	          if (lastNotation.constructor === _ExsurgeChant.TextOnly && lastNotation.lyrics.length === 1 && lastNotation.lyrics[0].bounds.height > this.lyricLineHeight) {
	            this.extraTextOnlyHeight = this.lyricLineHeight;
	          }
	        } else {
	          var lastLyrics = null;
	          var xOffset = 0;
	          offset = (this.numLyricLines - 1) * this.lyricLineHeight;
	          offset += this.numTranslationLines * this.translationLineHeight;
	          var extraLines = 0;
	          for (i = this.extraTextOnlyIndex; i < lastIndex; i++) {
	            notation = notations[i];
	            if (!notation.lyrics[extraTextOnlyLyricIndex]) continue;
	            lastLyrics = notation.lyrics[extraTextOnlyLyricIndex];
	            if (lastLyrics.lineWidth) {
	              xOffset = this.staffRight - lastLyrics.lineWidth;
	              offset += this.lyricLineHeight;
	              extraLines++;
	            }
	            extraLines += lastLyrics.numLines - 1;
	            lastLyrics.bounds.y = offset + this.lyricLineBaseline;
	            notation.bounds.x += xOffset;
	          }
	          this.extraTextOnlyHeight = this.lyricLineHeight * extraLines;
	        }
	      }
	
	      if (this.startingClef.hasLyrics()) {
	        offset = 0;
	        for (j = 0; j < this.startingClef.lyrics.length; j++) {
	          this.startingClef.lyrics[j].bounds.y = offset + this.lyricLineBaseline;
	          offset += this.lyricLineHeight;
	        }
	      }
	
	      // dropCap and the annotations
	      if (this.notationsStartIndex === 0) {
	        if (this.score.annotation !== null) {
	          // annotations use dominant-baseline to align text to the top
	          this.score.annotation.bounds.x = this.staffLeft / 2;
	          this.score.annotation.bounds.y = -ctxt.staffInterval * 3;
	          if (this.score.dropCap !== null) {
	            var lowestPossibleAnnotationY = this.lyricLineBaseline - this.score.annotation.bounds.height - ctxt.staffInterval * ctxt.textStyles.annotation.padding - this.score.dropCap.origin.y;
	            // if the annotation would overlap with the drop cap, move the annotation higher.
	            // otherwise, center the annotation in the vertical space between the top of the drop cap and the top of the staff.
	            if (lowestPossibleAnnotationY < this.score.annotation.bounds.y) {
	              this.score.annotation.bounds.y = lowestPossibleAnnotationY;
	            } else {
	              this.score.annotation.bounds.y = (this.score.annotation.bounds.y + lowestPossibleAnnotationY) / 2;
	            }
	            if (this.score.annotation.bounds.y < this.notationBounds.y) {
	              this.notationBounds.y = this.score.annotation.bounds.y;
	              this.notationBounds.height += this.notationBounds.y - this.score.annotation.bounds.y;
	            }
	          }
	          this.score.annotation.bounds.y += this.score.annotation.origin.y;
	        }
	
	        if (this.score.dropCap !== null) {
	          // drop caps and annotations are drawn from their center, so aligning them
	          // horizontally is as easy as this.staffLeft / 2
	          this.score.dropCap.bounds.x = this.staffLeft / 2;
	          this.score.dropCap.bounds.y = this.lyricLineBaseline - this.score.dropCap.origin.y;
	          this.notationBounds.union(this.score.dropCap.bounds);
	          this.score.dropCap.bounds.y = this.lyricLineBaseline;
	        }
	      }
	
	      if (this.numLyricLines > 0) {
	        // add up the lyric line heights to get the total height of the chant line
	        var lyricAndTextRect = new _ExsurgeCore.Rect(0, notationBoundsOffset, 0, this.lyricLineHeight * this.numLyricLines + this.extraTextOnlyHeight + this.translationLineHeight * this.numTranslationLines);
	        this.notationBounds.union(lyricAndTextRect);
	      }
	      if (this.numAltLines > 0) {
	        var altLineTextRect = new _ExsurgeCore.Rect(0, this.notationBounds.y - this.altLineHeight - 0.5 * ctxt.staffInterval - ctxt.textStyles.al.size * 1.1 * (this.numAltLines - 1), 0, ctxt.textStyles.al.size * 1.1 * this.numAltLines);
	        this.notationBounds.union(altLineTextRect);
	      }
	      // Ensure that there is at least minSpaceBelowStaff below the lowest staff line:
	      this.notationBounds.union(new _ExsurgeCore.Rect(0, 0, 0, (3 + ctxt.staffLineWeight / 2 + ctxt.minSpaceBelowStaff) * ctxt.staffInterval));
	      var totalHeight = this.notationBounds.height;
	
	      this.bounds.x = 0;
	      this.bounds.y = this.notationBounds.y;
	      this.bounds.width = this.notationBounds.right();
	      this.bounds.height = totalHeight;
	
	      // the origin of the chant line's coordinate space is at the center line of the left extremity of the staff
	      this.origin = new _ExsurgeCore.Point(this.staffLeft, -this.notationBounds.y);
	    }
	
	    // TODO: remove if not necsessary
	
	  }, {
	    key: "layoutInsertionCursor",
	    value: function layoutInsertionCursor(ctxt) {
	      if (this.insertionCursor) {
	        // we have either a Notation to draw the cursor after, or the ChantLine itself when the cursor is the first thing on the line
	        this.insertionCursor.performLayout(ctxt);
	        this.insertionCursor.bounds.x = this.score.insertionElement.bounds.right() + (this.score.insertionElement.trailingSpace && this.score.insertionElement.calculatedTrailingSpace || 0) / 2 - this.insertionCursor.origin.x;
	      }
	      return this.insertionCursor;
	    }
	  }, {
	    key: "draw",
	    value: function draw(ctxt) {
	      var canvasCtxt = ctxt.canvasCtxt;
	
	      canvasCtxt.translate(this.bounds.x, this.bounds.y);
	
	      // draw the staff lines
	      var i,
	          x1 = this.staffLeft,
	          x2 = this.staffRight,
	          y;
	      canvasCtxt.lineWidth = ctxt.staffLineWeight;
	      canvasCtxt.strokeStyle = ctxt.staffLineColor;
	
	      for (i = -3; i <= 3; i += 2) {
	        y = ctxt.staffInterval * i;
	
	        canvasCtxt.beginPath();
	        canvasCtxt.moveTo(x1, y);
	        canvasCtxt.lineTo(x2, y);
	        canvasCtxt.stroke();
	      }
	
	      if (this.layoutInsertionCursor(ctxt)) {
	        this.insertionCursor.draw(ctxt);
	      }
	
	      // draw the ledger lines
	      for (i = 0; i < this.ledgerLines.length; i++) {
	        var ledgerLine = this.ledgerLines[i];
	        y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);
	
	        canvasCtxt.beginPath();
	        canvasCtxt.moveTo(ledgerLine.x1, y);
	        canvasCtxt.lineTo(ledgerLine.x2, y);
	        canvasCtxt.stroke();
	      }
	
	      // fixme: draw the braces
	
	      // draw the dropCap and the annotations
	      if (this.notationsStartIndex === 0) {
	        if (this.score.dropCap !== null) this.score.dropCap.draw(ctxt);
	
	        if (this.score.annotation !== null && (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap))
	          // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
	          this.score.annotation.draw(ctxt);
	      }
	
	      // draw the notations
	      var notations = this.score.notations;
	      var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
	
	      for (i = this.notationsStartIndex; i < lastIndex; i++) {
	        notations[i].draw(ctxt);
	      }this.startingClef.draw(ctxt);
	
	      if (this.custos) this.custos.draw(ctxt);
	
	      canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
	    }
	  }, {
	    key: "getInnerNodes",
	    value: function getInnerNodes(ctxt) {
	      var top = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	      var functionNames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { quickSvg: "createNode", elements: "createSvgNode" };
	
	      var inner = [];
	
	      // add the chant lines
	      var i,
	          x1 = this.staffLeft,
	          x2 = this.staffRight;
	
	      if (ctxt.editable) {
	        inner.push(_ExsurgeDrawing.QuickSvg[functionNames.quickSvg]("rect", {
	          key: "insertion",
	          x: x1,
	          y: ctxt.staffInterval * -3,
	          width: x2 - x1,
	          height: ctxt.staffInterval * 6,
	          fill: "none"
	        }));
	      }
	
	      // create the staff lines
	      for (i = -3; i <= 3; i += 2) {
	        inner.push(_ExsurgeDrawing.QuickSvg[functionNames.quickSvg]("line", {
	          key: i,
	          x1: x1,
	          y1: ctxt.staffInterval * i,
	          x2: x2,
	          y2: ctxt.staffInterval * i,
	          stroke: ctxt.staffLineColor,
	          "stroke-width": ctxt.staffLineWeight,
	          class: "staffLine"
	        }));
	      }
	
	      inner = [_ExsurgeDrawing.QuickSvg[functionNames.quickSvg]("g", { class: "staffLines" }, inner)];
	
	      if (this.layoutInsertionCursor(ctxt)) {
	        inner.push(this.insertionCursor[functionNames.elements](ctxt));
	      }
	
	      // create the ledger lines
	      for (i = 0; i < this.ledgerLines.length; i++) {
	        var ledgerLine = this.ledgerLines[i];
	        var y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);
	
	        inner.push(_ExsurgeDrawing.QuickSvg[functionNames.quickSvg]("line", {
	          x1: ledgerLine.x1,
	          y1: y,
	          x2: ledgerLine.x2,
	          y2: y,
	          stroke: ctxt.staffLineColor,
	          "stroke-width": ctxt.staffLineWeight,
	          class: "ledgerLine"
	        }));
	      }
	
	      // add any braces
	      for (i = 0; i < this.braces.length; i++) {
	        inner.push(this.braces[i][functionNames.elements](ctxt));
	      } // dropCap and the annotations
	      if (this.notationsStartIndex === 0) {
	        if (this.score.dropCap !== null) inner.push(this.score.dropCap[functionNames.elements](ctxt));
	
	        if (this.score.annotation !== null && (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap))
	          // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
	          inner = inner.concat(this.score.annotation[functionNames.elements](ctxt));
	      }
	
	      inner.push(this.startingClef[functionNames.elements](ctxt));
	
	      var notations = this.score.notations;
	      var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
	
	      // add all of the notations
	      for (i = this.notationsStartIndex; i < lastIndex; i++) {
	        inner.push(notations[i][functionNames.elements](ctxt));
	      }if (this.custos) inner.push(this.custos[functionNames.elements](ctxt));
	      return inner;
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      var top = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	
	      var inner = this.getInnerNodes(ctxt, top, {
	        quickSvg: "createNode",
	        elements: "createSvgNode"
	      });
	
	      return _ExsurgeDrawing.QuickSvg.createNode("g", {
	        class: "chantLine",
	        transform: "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
	        "element-index": this.elementIndex,
	        source: this
	      }, inner);
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      var top = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	
	      var inner = this.getInnerNodes(ctxt, top, {
	        quickSvg: "createSvgTree",
	        elements: "createSvgTree"
	      });
	
	      return _ExsurgeDrawing.QuickSvg.createSvgTree.apply(_ExsurgeDrawing.QuickSvg, ["g", {
	        class: "chantLine",
	        transform: "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
	        "element-index": this.elementIndex
	      }].concat(_toConsumableArray(inner)));
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      var top = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	
	      var inner = "";
	
	      // add the chant lines
	      var i,
	          x1 = this.staffLeft,
	          x2 = this.staffRight;
	
	      // create the staff lines
	      for (i = -3; i <= 3; i += 2) {
	        inner += _ExsurgeDrawing.QuickSvg.createFragment("line", {
	          x1: x1,
	          y1: ctxt.staffInterval * i,
	          x2: x2,
	          y2: ctxt.staffInterval * i,
	          stroke: ctxt.staffLineColor,
	          "stroke-width": ctxt.staffLineWeight,
	          class: "staffLine"
	        });
	      }
	
	      inner = _ExsurgeDrawing.QuickSvg.createFragment("g", { class: "staffLines" }, inner);
	
	      if (this.layoutInsertionCursor(ctxt)) {
	        inner += this.insertionCursor.createSvgFragment(ctxt);
	      }
	
	      // create the ledger lines
	      for (i = 0; i < this.ledgerLines.length; i++) {
	        var ledgerLine = this.ledgerLines[i];
	        var y = ctxt.calculateHeightFromStaffPosition(ledgerLine.staffPosition);
	
	        inner += _ExsurgeDrawing.QuickSvg.createFragment("line", {
	          x1: ledgerLine.x1,
	          y1: y,
	          x2: ledgerLine.x2,
	          y2: y,
	          stroke: ctxt.staffLineColor,
	          "stroke-width": ctxt.staffLineWeight,
	          class: "ledgerLine"
	        });
	      }
	
	      // add any braces
	      for (i = 0; i < this.braces.length; i++) {
	        inner += this.braces[i].createSvgFragment(ctxt);
	      } // dropCap and the annotations
	      if (this.notationsStartIndex === 0) {
	        if (this.score.dropCap !== null) inner += this.score.dropCap.createSvgFragment(ctxt);
	
	        if (this.score.annotation !== null && (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap))
	          // only draw it if there is a dropCap or there is no mergeAnnotationWithTextLeft
	          inner += this.score.annotation.createSvgFragment(ctxt);
	      }
	
	      inner += this.startingClef.createSvgFragment(ctxt);
	
	      var notations = this.score.notations;
	      var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
	
	      // add all of the notations
	      for (i = this.notationsStartIndex; i < lastIndex; i++) {
	        inner += notations[i].createSvgFragment(ctxt);
	      }if (this.custos) inner += this.custos.createSvgFragment(ctxt);
	
	      return _ExsurgeDrawing.QuickSvg.createFragment("g", {
	        class: "chantLine",
	        transform: "translate(" + this.bounds.x + "," + (this.bounds.y - top) + ")",
	        "element-index": this.elementIndex
	      }, inner);
	    }
	
	    // code below based on code by: https://gist.github.com/alexhornbake
	    //
	    // optimized for braces that are only drawn horizontally.
	    // returns svg path string ready to insert into svg doc
	
	  }, {
	    key: "generateCurlyBraceDrawable",
	    value: function generateCurlyBraceDrawable(ctxt, x1, x2, y, isAbove) {
	      var h;
	
	      if (isAbove) h = -ctxt.staffInterval / 2;else h = ctxt.staffInterval / 2;
	
	      // and q factor, .5 is normal, higher q = more expressive bracket
	      var q = 0.6;
	
	      var len = x2 - x1;
	
	      //Calculate Control Points of path,
	      var qx1 = x1;
	      var qy1 = y + q * h;
	      var qx2 = x1 + 0.25 * len;
	      var qy2 = y + (1 - q) * h;
	      var tx1 = x1 + 0.5 * len;
	      var ty1 = y + h;
	      var qx3 = x2;
	      var qy3 = y + q * h;
	      var qx4 = x1 + 0.75 * len;
	      var qy4 = y + (1 - q) * h;
	      var d = "M " + x1 + " " + y + " Q " + qx1 + " " + qy1 + " " + qx2 + " " + qy2 + " T " + tx1 + " " + ty1 + " M " + x2 + " " + y + " Q " + qx3 + " " + qy3 + " " + qx4 + " " + qy4 + " T " + tx1 + " " + ty1;
	
	      return _ExsurgeDrawing.QuickSvg.createFragment("path", {
	        d: d,
	        stroke: ctxt.neumeLineColor,
	        "stroke-width": ctxt.neumeLineWeight + "px",
	        fill: "none"
	      });
	    }
	  }, {
	    key: "buildFromChantNotationIndex",
	    value: function buildFromChantNotationIndex(ctxt, newElementStart, width) {
	      // todo: reset / clear the children we have in case they have data
	      var notations = this.score.notations,
	          beginningLyrics = null,
	          prev = null,
	          prevNeume = null,
	          prevLyrics = [];
	      var condensableSpaces = [];
	      this.notationsStartIndex = newElementStart;
	      this.numNotationsOnLine = 0;
	
	      this.staffLeft = 0;
	      this.paddingLeft = 0;
	
	      this.extraTextOnlyIndex = null;
	      this.extraTextOnlyLyricIndex = 0;
	
	      if (width > 0) this.staffRight = width;else this.staffRight = Infinity; // no limit to staff size
	
	      // If this is the first chant line, then we have to make room for a
	      // drop cap and/or annotation, if present
	      if (this.notationsStartIndex === 0) {
	        var padding = 0;
	
	        if (this.score.dropCap !== null) padding = this.score.dropCap.bounds.width + this.score.dropCap.padding * 2;
	
	        if (this.score.annotation !== null && (!ctxt.mergeAnnotationWithTextLeft || this.score.dropCap)) padding = Math.max(padding, this.score.annotation.bounds.width + this.score.annotation.padding * 2);
	
	        this.staffLeft += padding;
	        if (this.score.dropCap !== null) this.paddingLeft = (padding - this.score.dropCap.bounds.width) / 2;
	      } else {
	        prev = notations[newElementStart - 1];
	        if (prev.constructor === _ExsurgeChantSigns.DoubleBar && prev.hasLyrics() && (prev.lyrics.length > 1 || !prev.lyrics[0].text.match(/^(i\.?)+j\.?/))) {
	          beginningLyrics = prev.lyrics.map(function (lyric) {
	            var newLyric = new _ExsurgeDrawing.Lyric(ctxt, lyric.originalText, lyric.lyricType, lyric.notation, lyric.notations, lyric.sourceIndex);
	            newLyric.elidesToNext = lyric.elidesToNext;
	            // Hide the original lyric by setting its bounds.y to an extremely high number.
	            // If the chant is re-laid out, this value will be recalculated so that it won't stay hidden.
	            lyric.bounds.y = Number.MAX_SAFE_INTEGER;
	            return newLyric;
	          });
	          var minX = beginningLyrics.map(function (l) {
	            return l.bounds.x;
	          }).reduce(function (a, b) {
	            return a < b ? a : b;
	          });
	          beginningLyrics.forEach(function (l) {
	            l.bounds.x -= minX;
	          });
	        }
	      }
	
	      // set up the clef...
	      // if the first notation on the line is a starting clef, then we treat it a little differently...
	      // the clef becomes this line's starting clef and we skip over the clef in the notations array
	      if (notations.length && notations[newElementStart].isClef) {
	        ctxt.activeClef = notations[newElementStart];
	        newElementStart++;
	        this.notationsStartIndex++;
	      }
	
	      // make a copy for this line to use at the beginning
	      this.startingClef = ctxt.activeClef.clone();
	      this.startingClef.performLayout(ctxt);
	      this.startingClef.bounds.x = this.staffLeft;
	
	      var curr = this.startingClef;
	
	      if (beginningLyrics) {
	        _ExsurgeDrawing.LyricArray.setNotation(beginningLyrics, curr);
	      }
	
	      // estimate how much space we have available to us
	      var rightNotationBoundary = this.staffRight - _ExsurgeGlyphs.Glyphs.CustosLong.bounds.width * ctxt.glyphScaling; // possible custos on the line
	      var lastTranslationTextWithEndNeume = null;
	
	      // iterate through the notations, fittng what we can on this line
	      var i,
	          j,
	          lastNotationIndex = notations.length - 1;
	
	      if (curr.hasLyrics()) _ExsurgeDrawing.LyricArray.mergeIn(this.lastLyrics, curr.lyrics);
	
	      // if we already have a start brace on the context, we must be continuing it from the previous system.
	      if (ctxt.lastStartBrace && !ctxt.lastStartBrace.note) {
	        ctxt.lastStartBrace.note = this.startingClef;
	      }
	      var lastLyricsBeforeTextOnly;
	      var textOnlyStartIndex;
	
	      for (i = newElementStart; i <= lastNotationIndex; i++) {
	        prev = curr;
	        if (curr.constructor !== _ExsurgeChant.TextOnly) prevNeume = curr;
	
	        curr = notations[i];
	
	        var actualRightBoundary;
	        if (i === lastNotationIndex || curr.constructor === _ExsurgeChantSigns.Custos || prev.constructor === _ExsurgeChantSigns.Custos && curr.isDivider || curr.constructor === _ExsurgeChant.ChantLineBreak && prevNeume.constructor === _ExsurgeChantSigns.Custos) {
	          // on the last notation of the score, we don't need a custos or trailing space, so we use staffRight as the
	          // right boundary.
	          // Also, if the current notation is a divider and the previous was a custos, we don't need extra space
	          // because if the following notation won't fit, we can switch the order and use the custos as the end-of-the-line custos
	          // Ditto in the case of the current element being a chant line break and the previous neume a custos, because that custos will become our end-of-line custos
	          actualRightBoundary = this.staffRight;
	        } else if (i === lastNotationIndex - 1) {
	          // on the penultimate notation, make sure there is at least enough room for whichever takes up less space,
	          // between the final notation and a custos:
	          actualRightBoundary = Math.max(rightNotationBoundary, this.staffRight - notations[lastNotationIndex].bounds.width);
	        } else {
	          // Otherwise, we use rightNotationBoundary, which leaves room for a custos...
	          actualRightBoundary = rightNotationBoundary;
	        }
	
	        // First check if we're already beyond the rightNotationBoundary (due to condensing that hasn't yet happened) and have a good element to end with
	        // but if we have 2 or fewer elements, or if the current element is a line break or a custos, we'll go ahead and try for them anyway.
	        var forceBreak = !curr.isDivider && curr.constructor !== _ExsurgeChant.ChantLineBreak && curr.constructor !== _ExsurgeChantSigns.Custos && !(curr.constructor === _ExsurgeChant.TextOnly && curr.hasLyrics() && /^(?:[*†]|i+j\.?)$/.test(curr.lyrics[0].text)) && lastNotationIndex - i > 1 && !prevNeume.keepWithNext && prevNeume.bounds.right() >= rightNotationBoundary;
	
	        // also force a break if we've run into extra TextOnly elements, but the current notation is not a TextOnly and has lyrics
	        forceBreak = forceBreak || this.extraTextOnlyIndex !== null && curr.constructor !== _ExsurgeChant.TextOnly && curr.constructor !== _ExsurgeChant.ChantLineBreak && curr.constructor !== _ExsurgeChantSigns.Custos && curr.hasLyrics();
	
	        if (curr instanceof _ExsurgeChant.TextOnly && prev === prevNeume) {
	          lastLyricsBeforeTextOnly = this.lastLyrics.slice();
	          textOnlyStartIndex = i;
	        }
	        if (curr instanceof _ExsurgeChant.TextOnly && notations[textOnlyStartIndex] && !notations[textOnlyStartIndex].hasLyrics()) {
	          // we want textOnlyStartIndex to be the first TextOnly that actually has lyrics,
	          // so if the current "textOnlyStart" element does not have lyrics, and we have another textOnly
	          // that does have lyrics, we will use it instead
	          textOnlyStartIndex = i;
	        }
	
	        if (curr.hasLyrics() && curr.lyrics[0].needsLayout) {
	          curr.lyrics[0].recalculateMetrics(ctxt);
	        }
	
	        // try to fit the curr element on this line.
	        // if it doesn't fit, we finish up here.
	        var fitsOnLine = !forceBreak && this.positionNotationElement(ctxt, this.lastLyrics, prevNeume, curr, actualRightBoundary, this.extraTextOnlyIndex ? [] : condensableSpaces // no spaces are condensable once we are on extra text only lyrics
	        );
	        var candidateForExtraTextOnlyLine = ctxt.useExtraTextOnly && curr.constructor === _ExsurgeChant.TextOnly && _ExsurgeDrawing.LyricArray.hasOnlyOneLyric(curr.lyrics) && (fitsOnLine === false || this.extraTextOnlyIndex !== null);
	        var extraTextOnlyLyricIndex;
	        if (candidateForExtraTextOnlyLine && this.extraTextOnlyIndex === null) {
	          // check to make sure there is enough text to put on the text only line:
	          extraTextOnlyLyricIndex = _ExsurgeDrawing.LyricArray.indexOfLyric(curr.lyrics);
	          if (textOnlyStartIndex === i) {
	            var currentLyric = notations[i].lyrics[extraTextOnlyLyricIndex].text;
	            if (currentLyric.length <= 1) {
	              var nextNotation = notations[i + 1];
	              candidateForExtraTextOnlyLine = nextNotation && nextNotation.constructor === _ExsurgeChant.TextOnly && nextNotation.lyrics[extraTextOnlyLyricIndex] && nextNotation.lyrics[extraTextOnlyLyricIndex].text.length > 0;
	            }
	          }
	        }
	        if (candidateForExtraTextOnlyLine) {
	          // a special case for TextOnly elements that don't fit on the line: since they don't have neumes associated with them, we can place this
	          // and any additional TextOnly elements just below the current lyric lines, but we can only do this if the TextOnly elements have only one
	          // line of lyrics associated with them.
	          var firstOnLine;
	          extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex;
	          if (this.extraTextOnlyIndex === null && notations[textOnlyStartIndex].lyrics.length) {
	            if (textOnlyStartIndex === this.notationsStartIndex || !ctxt.startExtraTextOnlyFromFirst) {
	              textOnlyStartIndex = i;
	              var lastNotationWithLyrics = notations.slice(this.notationsStartIndex, i).reverse().find(function (notation) {
	                return notation.hasLyrics();
	              });
	              lastLyricsBeforeTextOnly = lastNotationWithLyrics && lastNotationWithLyrics.lyrics.slice() || [];
	            }
	            // go back to the first in this string of consecutive TextOnly elements.
	            this.extraTextOnlyIndex = textOnlyStartIndex;
	            extraTextOnlyLyricIndex = this.extraTextOnlyLyricIndex = _ExsurgeDrawing.LyricArray.indexOfLyric(curr.lyrics);
	            this.lastLyricsBeforeTextOnly = lastLyricsBeforeTextOnly;
	            this.lastLyrics = [];
	            i = textOnlyStartIndex - 1;
	            this.numNotationsOnLine = textOnlyStartIndex - this.notationsStartIndex;
	            continue;
	          }
	          delete curr.lyrics[extraTextOnlyLyricIndex].lineWidth;
	          if (!fitsOnLine || i === this.extraTextOnlyIndex) {
	            curr.bounds.x = curr.lyrics[extraTextOnlyLyricIndex].origin.x;
	            var lastLyricRight = ctxt.startExtraTextOnlyFromFirst ? _ExsurgeDrawing.LyricArray.getRight(this.lastLyrics) + (ctxt.minLyricWordSpacing || 0) : 0;
	            curr.lyrics[extraTextOnlyLyricIndex].setMaxWidth(ctxt, this.staffRight, this.staffRight - lastLyricRight);
	            firstOnLine = curr;
	          }
	          if (firstOnLine) firstOnLine.lyrics[extraTextOnlyLyricIndex].lineWidth = curr.lyrics[extraTextOnlyLyricIndex].getRight();
	        } else if (fitsOnLine === false) {
	          var isTextOnlyBeforeDivider = function isTextOnlyBeforeDivider(i) {
	            var curr = notations[i];
	            if (curr.constructor !== _ExsurgeChant.TextOnly) return false;
	            var firstDivider = notations.slice(i + 1).findIndex(function (notation) {
	              return notation.isDivider;
	            });
	            if (firstDivider < 0) return false;
	            return notations.slice(i + 1, i + 1 + firstDivider).every(function (notation) {
	              return notation.constructor === _ExsurgeChant.TextOnly;
	            });
	          };
	          // first check for elements that cannot begin a system: dividers and custodes
	          while (this.numNotationsOnLine > 1 && (curr.isDivider || curr.constructor === _ExsurgeChantSigns.Custos || isTextOnlyBeforeDivider(i))) {
	            curr = notations[--i];
	            this.numNotationsOnLine--;
	            if (this.lastLyricsBeforeTextOnly && isTextOnlyBeforeDivider(i)) {
	              delete this.lastLyricsBeforeTextOnly;
	            }
	          }
	
	          if (lastTranslationTextWithEndNeume) {}
	          // console.info(notations[i - 1], lastTranslationTextWithEndNeume);
	          // TODO?: need to go back to before the last translation text start:
	
	
	          // count syllables and notes
	          var notationsAfterBreak = notations.slice(i + 1);
	          var countSyllables = 0;
	          var countNotes = 0;
	          if (ctxt.minSyllablesLastLine && ctxt.minNotesLastLine) {
	            countSyllables = notationsAfterBreak.filter(function (notation) {
	              return notation.hasLyrics();
	            }).length;
	            countNotes = notationsAfterBreak.flatMap(function (notation) {
	              return notation.notes;
	            }).filter(function (note) {
	              return !!note;
	            }).length;
	          }
	
	          // check if the prev elements want to be kept with this one
	          for (j = i - 1; j > this.notationsStartIndex; j--) {
	            var cne = notations[j];
	            curr = notations[j + 1];
	
	            // curr is the first notation on the next line
	            // cne is the last notation on this line
	            if (ctxt.minSyllablesLastLine && ctxt.minNotesLastLine) {
	              countSyllables += curr.hasLyrics() ? 1 : 0;
	              countNotes += (curr.notes || []).length;
	            }
	
	            if (cne.firstWithNoWidth) {
	              this.numNotationsOnLine--;
	              continue;
	            }
	
	            // don't let a line break occur in the middle of a translation
	            if (lastTranslationTextWithEndNeume) {
	              this.numNotationsOnLine--;
	              if (cne === lastTranslationTextWithEndNeume) {
	                lastTranslationTextWithEndNeume = null;
	              }
	              continue;
	            }
	
	            // force any notations starting with a quilisma or inclinatum (diamond) to be kept with the previous notation:
	            if (curr && curr.notes && (curr.notes[0].shape === _ExsurgeChant.NoteShape.Quilisma || curr.notes[0].shape === _ExsurgeChant.NoteShape.Inclinatum)) {
	              this.numNotationsOnLine--;
	              continue;
	            }
	
	            if (countSyllables < ctxt.minSyllablesLastLine && countNotes < ctxt.minNotesLastLine) {
	              this.numNotationsOnLine--;
	              continue;
	            }
	
	            // if the line break is allowed (cne.allowLineBreakBeforeNext), keep this number of notations around so we can check during justification
	            // whether there would be too much space introduced between
	            if (cne.keepWithNext === true) {
	              if (cne.allowLineBreakBeforeNext && !this.maxNumNotationsOnLine) this.maxNumNotationsOnLine = this.numNotationsOnLine;
	              this.numNotationsOnLine--;
	            } else break;
	          }
	          if (this.extraTextOnlyIndex && this.notationsStartIndex + this.numNotationsOnLine <= this.extraTextOnlyIndex) {
	            // we've cut back to before the extra text only index, so we have to remove it:
	            this.extraTextOnlyIndex = null;
	          }
	
	          // if for some reason not a single notation can fit on the line, we'd better put it on anyway, to avoid an infinite loop:
	          if (this.numNotationsOnLine === 0) this.numNotationsOnLine = 1;
	
	          // determine the neumes we can space apart, if we do end up justifying
	          curr = this.findNeumesToJustify(prevLyrics);
	
	          this.lastLyrics = prevLyrics;
	          if (this.maxNumNotationsOnLine) {
	            // Check whether we should squeeze some extra notations on the line to avoid too much space after justification:
	            // Check how much space we would have without the extra notations
	            var extraSpace = this.getWhitespaceOnRight(ctxt);
	            if (extraSpace / this.toJustify.length > ctxt.staffInterval * ctxt.maxExtraSpaceInStaffIntervals) {
	              _ExsurgeDrawing.LyricArray.mergeInArray(prevLyrics, notations.slice(this.notationsStartIndex + this.numNotationsOnLine, this.notationsStartIndex + this.maxNumNotationsOnLine));
	              this.numNotationsOnLine = this.maxNumNotationsOnLine;
	              delete this.maxNumNotationsOnLine;
	            }
	          }
	
	          // if the next line begins with a fresh word, than there can be extra space between the last notation on this line and the custos:
	          var next = this.score.notations[this.extraTextOnlyIndex === null ? this.notationsStartIndex + this.numNotationsOnLine : this.extraTextOnlyIndex];
	          if (next && next.hasLyrics() && (next.lyrics[0].lyricType === _ExsurgeDrawing.LyricType.BeginningSyllable || next.lyrics[0].lyricType === _ExsurgeDrawing.LyricType.SingleSyllable)) {
	            this.toJustify.push(this.custos);
	          }
	
	          if (j >= 1 && notations[j].isDivider && notations[j - 1].constructor === _ExsurgeChantSigns.Custos) {
	            // reverse the order: put the divider first, and end the line with the custos.
	            prevLyrics = [];
	            for (i = j - 2; i >= this.notationsStartIndex; i--) {
	              if (notations[i].hasLyrics()) {
	                _ExsurgeDrawing.LyricArray.mergeIn(prevLyrics, notations[i].lyrics);
	                break;
	              }
	            }
	            // remove the custos and divider from the condensable spaces list, before adding the divider back, when repositioning it.
	            condensableSpaces.sum -= condensableSpaces.pop().condensable;
	            condensableSpaces.sum -= condensableSpaces.pop().condensable;
	            this.positionNotationElement(ctxt, prevLyrics, notations[j - 2], notations[j], this.staffRight, condensableSpaces);
	            this.custos = notations[j - 1];
	            this.custos.bounds.x = this.staffRight - this.custos.bounds.width - this.custos.leadingSpace;
	          }
	
	          // we are at the end of the line!
	          break;
	        }
	
	        if (curr.hasLyrics()) _ExsurgeDrawing.LyricArray.mergeIn(this.lastLyrics, curr.lyrics);
	
	        if (lastTranslationTextWithEndNeume && curr === lastTranslationTextWithEndNeume.translationText[0].endNeume) {
	          lastTranslationTextWithEndNeume = null;
	        } else if (curr.translationText && curr.translationText.length && curr.translationText[0].endNeume) {
	          lastTranslationTextWithEndNeume = curr;
	        }
	
	        curr.line = this;
	        this.numNotationsOnLine++;
	
	        if (curr.isClef) ctxt.activeClef = curr;
	
	        // line breaks are a special case indicating to stop processing here
	        if (curr.constructor === _ExsurgeChant.ChantLineBreak && width > 0) {
	          this.justify = curr.justify || this.extraTextOnlyIndex !== null || this.getWhitespaceOnRight(ctxt) < 0;
	          if (this.justify) this.findNeumesToJustify(prevLyrics);
	          break;
	        }
	
	        if (curr.constructor === _ExsurgeChantSigns.Custos) {
	          this.custos = curr;
	        } else if (curr.isNeume) {
	          this.custos = null;
	        }
	      }
	
	      var lastIndex = this.notationsStartIndex + this.numNotationsOnLine - 1;
	      var last = notations[lastIndex] || {};
	      while (lastIndex > 0 && (last.constructor === _ExsurgeChant.ChantLineBreak || last.constructor === _ExsurgeChantSigns.Custos || last.constructor === _ExsurgeChant.TextOnly)) {
	        last = notations[--lastIndex];
	      }
	      var isLastLine = this.notationsStartIndex + this.numNotationsOnLine === notations.length;
	      if (this.justify && this.extraTextOnlyIndex !== null || width > 0 && isLastLine) {
	        // this is the last chant line, or it has extra TextOnly elements at the end
	        if (!this.toJustify) this.findNeumesToJustify(prevLyrics);
	        this.justify = (!isLastLine || last.isDivider) && this.getWhitespaceOnRight(ctxt) / (this.toJustify.length || 1) <= ctxt.staffInterval * ctxt.maxExtraSpaceInStaffIntervals;
	      }
	
	      if (!this.custos) {
	        // create the automatic custos at the end of the line if there are neumes left in the notations
	        for (i = this.notationsStartIndex + this.numNotationsOnLine; i < notations.length; i++) {
	          var notation = notations[i];
	
	          if (notation.isNeume) {
	            this.custos = new _ExsurgeChantSigns.Custos(true);
	            ctxt.currNotationIndex = i - 1; // make sure the context knows where the custos is
	            this.custos.performLayout(ctxt);
	
	            if (this.justify) {
	              // Put the custos at the very end of the line
	              this.custos.bounds.x = this.staffRight - this.custos.bounds.width - this.custos.leadingSpace;
	            } else {
	              this.custos.bounds.x = prevNeume.bounds.right() + prevNeume.calculatedTrailingSpace;
	            }
	            // nothing more to see here...
	            break;
	          }
	        }
	      }
	
	      if (this.lastLyricsBeforeTextOnly) {
	        this.lastLyrics = this.lastLyricsBeforeTextOnly;
	        delete this.lastLyricsBeforeTextOnly;
	      }
	
	      // find the final lyric and mark it as connecting if needed.
	      if (width > 0) {
	        var whitespace = this.getWhitespaceOnRight();
	        var rightEdge = this.staffRight;
	        if (whitespace < 0) {
	          rightEdge -= whitespace;
	        }
	      }
	      i = 0;
	      while (this.lastLyrics && this.lastLyrics[i]) {
	        var lyrics = this.lastLyrics[i];
	        if (lyrics.allowsConnector()) {
	          lyrics.setNeedsConnector(true, 0);
	          if (width > 0 && ctxt.minLyricWordSpacing < ctxt.hyphenWidth) {
	            whitespace = rightEdge - lyrics.getRight();
	            // shrink the hyphen if we are already out of whitespace or if we would be if we used a regular hyphen:
	            if (whitespace < 0) {
	              var minHyphenWidth = Math.max(ctxt.hyphenWidth + whitespace, this.lastLyrics.length > 1 ? ctxt.intraNeumeSpacing : ctxt.minLyricWordSpacing);
	              // we might not need to shift the syllable, but we do want to shrink the hyphen...
	              lyrics.setConnectorWidth(minHyphenWidth);
	            }
	          }
	        }
	        ++i;
	      }
	
	      // if the provided width is less than zero, then set the width of the line
	      // based on the last notation
	      if (width <= 0) {
	        this.staffRight = notations[this.notationsStartIndex + this.numNotationsOnLine - 1].bounds.right();
	        this.justify = false;
	      }
	
	      // Justify the line if we need to
	      this.justifyElements(ctxt, this.justify, condensableSpaces);
	
	      this.centerDividers();
	
	      this.finishLayout(ctxt);
	    }
	  }, {
	    key: "centerDividers",
	    value: function centerDividers() {
	      var lastIndex = this.extraTextOnlyIndex === null ? this.notationsStartIndex + this.numNotationsOnLine : this.extraTextOnlyIndex,
	          curr;
	      for (var i = this.notationsStartIndex; i < lastIndex; i++) {
	        curr = this.score.notations[i];
	
	        if (curr && curr.isDivider) {
	          var j = 1;
	          var prev = this.score.notations[i - 1];
	          var next = i + 1 === lastIndex ? this.custos : this.score.notations[i + 1];
	          if (prev === next && next === this.custos) {
	            prev = this.score.notations[i - 2];
	            // force custos to right edge in this case, since it is a custos that exists
	            // regardless of line break, and would normally be before the double bar, but in this case it ends the line:
	            next.bounds.x = this.staffRight - next.bounds.width;
	          }
	          if (prev && next) {
	            //if (prev instanceof TextOnly || next instanceof TextOnly) continue;
	            var oldBoundsX = curr.bounds.x;
	            var barWidth = curr.bounds.width;
	            var leftPoint = prev instanceof _ExsurgeChant.TextOnly && prev.hasLyrics() ? prev.lyrics[0].getRight() : prev.bounds.right(),
	                rightPoint = next instanceof _ExsurgeChant.TextOnly && next.hasLyrics() ? next.lyrics[0].getLeft() : next.bounds.x;
	            if (prev instanceof _ExsurgeChant.TextOnly) {
	              var _prev = this.score.notations.slice(this.notationsStartIndex, i).reverse().find(function (notation) {
	                return !(notation instanceof _ExsurgeChant.TextOnly);
	              });
	              leftPoint = _prev ? _prev.bounds.right() : 0;
	            }
	            if (leftPoint) {
	              curr.bounds.x = (leftPoint + rightPoint - barWidth) / 2;
	            }
	            if (curr.hasLyrics()) {
	              var offset = oldBoundsX - curr.bounds.x;
	              for (j = curr.lyrics.length - 1; j >= 0; j--) {
	                curr.lyrics[j].bounds.x += offset;
	                curr.lyrics[j].needsLayout = true;
	              }
	            }
	          } else if (i === lastIndex - 1 && this.justify && (curr.constructor === _ExsurgeChantSigns.DoubleBar || curr.constructor === _ExsurgeChantSigns.FullBar)) {
	            curr.bounds.x = this.staffRight - curr.bounds.width;
	          }
	        }
	      }
	    }
	  }, {
	    key: "findNeumesToJustify",
	    value: function findNeumesToJustify(prevLyrics) {
	      this.toJustify = [];
	      var prev,
	          curr = null,
	          next = null,
	          nextOrCurr = null,
	          lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
	      for (var i = this.notationsStartIndex; i < lastIndex; i++) {
	        prev = nextOrCurr;
	        curr = this.score.notations[i];
	        next = curr.isAccidental && this.score.notations[++i];
	        nextOrCurr = next || curr;
	        var hasLyrics = nextOrCurr.hasLyrics();
	
	        if (!curr || !prev) continue;
	
	        if (this.extraTextOnlyIndex !== null && i >= this.extraTextOnlyIndex && curr.constructor === _ExsurgeChant.TextOnly) continue;
	
	        if (prev !== null) {
	          _ExsurgeDrawing.LyricArray.mergeIn(prevLyrics, prev.lyrics);
	          if (prev.keepWithNext === true) continue;
	        }
	
	        if (!curr.isDivider && prevLyrics.length && prevLyrics[0].allowsConnector() && hasLyrics) continue;
	
	        if (nextOrCurr.constructor === _ExsurgeChant.ChantLineBreak) continue;
	
	        if (nextOrCurr === this.custos && !hasLyrics) continue;
	
	        if (i === 0 && this.score.useDropCap && hasLyrics) continue;
	
	        // otherwise, we can add space before this element
	        this.toJustify.push(curr);
	      }
	      if (nextOrCurr !== null) _ExsurgeDrawing.LyricArray.mergeIn(prevLyrics, nextOrCurr.lyrics);
	      return nextOrCurr;
	    }
	  }, {
	    key: "getWhitespaceOnRight",
	    value: function getWhitespaceOnRight(ctxt) {
	      var notations = this.score.notations;
	      var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
	      var last = notations[lastIndex - 1];
	      if (this.extraTextOnlyIndex !== null && last.constructor === _ExsurgeChant.TextOnly) {
	        lastIndex = this.extraTextOnlyIndex;
	        last = notations[lastIndex - 1];
	      }
	      var lastRightNeume = last ? last.bounds.right() + last.calculatedTrailingSpace : 0;
	      var lastLyrics = this.lastLyricsBeforeTextOnly || this.lastLyrics;
	      var lastRightLyric = lastLyrics.length ? _ExsurgeDrawing.LyricArray.getRight(lastLyrics) : 0;
	
	      if (this.custos) {
	        lastRightNeume += this.custos.bounds.width + this.custos.leadingSpace;
	        if (this.custos.hasLyrics()) {
	          lastRightLyric = _ExsurgeDrawing.LyricArray.getRight(this.custos.lyrics);
	        }
	      } else if (ctxt && lastIndex < notations.length) {
	        lastRightNeume += _ExsurgeGlyphs.Glyphs.CustosLong.bounds.width * ctxt.glyphScaling;
	      }
	      return this.staffRight - Math.max(lastRightLyric, lastRightNeume);
	    }
	  }, {
	    key: "justifyElements",
	    value: function justifyElements(ctxt, doJustify, condensableSpaces) {
	      var i;
	      var toJustify = this.toJustify || [];
	      var notations = this.score.notations;
	      var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
	
	      // if it wasn't an ideal line break, and the last note is further from the custos than it would have been from its next punctum,
	      // move the custos over.
	      // We do this first so that if it opens up any new whitespace, that gets accounted for when we do the justification
	      var lastNotation = notations[this.notationsStartIndex + this.numNotationsOnLine - 1];
	      var extraSpaceBeforeCustos = this.staffRight < Infinity && this.custos && lastNotation.keepWithNext && this.custos.bounds.x - lastNotation.bounds.right() - lastNotation.calculatedTrailingSpace;
	      if (extraSpaceBeforeCustos > 0) {
	        // first, shrink the hyphen(s) if applicable, to move the neumes closer to the custos:
	        i = 0;
	        while (this.lastLyrics && this.lastLyrics[i]) {
	          var lyrics = this.lastLyrics[i];
	          if (lyrics.allowsConnector()) {
	            var connectorWidth = lyrics.getConnectorWidth();
	            if (ctxt.minLyricWordSpacing < connectorWidth) {
	              var minHyphenWidth = Math.max(connectorWidth - extraSpaceBeforeCustos, this.lastLyrics.length > 1 ? ctxt.intraNeumeSpacing : ctxt.minLyricWordSpacing);
	              // we might not need to shift the syllable, but we do want to shrink the hyphen...
	              lyrics.setConnectorWidth(minHyphenWidth);
	            }
	          }
	          ++i;
	        }
	        this.custos.bounds.x = lastNotation.bounds.right() + lastNotation.calculatedTrailingSpace;
	      }
	
	      // first step of justification is to determine how much space we have to use up
	      var extraSpace = this.getWhitespaceOnRight();
	
	      if (Math.abs(extraSpace) < 0.5 || extraSpace > 0 && (doJustify && toJustify.length === 0 || !doJustify)) return;
	
	      this.condensableSpaces = condensableSpaces;
	
	      var curr, prev;
	      var offset = 0;
	      var increment = extraSpace / toJustify.length;
	      var multiplier = 0;
	      var toJustifyIndex = 0;
	      if (extraSpace < 0) {
	        toJustify = condensableSpaces.filter(function (s) {
	          return s.condensable > 0;
	        });
	        multiplier = extraSpace / condensableSpaces.sum;
	        increment = 0;
	      }
	      var nextToJustify = toJustify[toJustifyIndex++];
	      var incrementOffsetAtNextChance = false;
	      for (i = this.notationsStartIndex; i < lastIndex; i++) {
	        prev = curr;
	        curr = notations[i];
	
	        if (this.extraTextOnlyIndex !== null && i >= this.extraTextOnlyIndex && curr.constructor === _ExsurgeChant.TextOnly) {
	          continue;
	        }
	
	        if (!multiplier && curr === this.custos) {
	          if (curr.hasLyrics()) {
	            curr.bounds.x = Math.min(curr.bounds.x + (this.staffRight - _ExsurgeDrawing.LyricArray.getRight(curr.lyrics)), this.staffRight - curr.bounds.width);
	            offset += increment;
	          } else {
	            curr.bounds.x = Math.min(curr.bounds.x + offset, this.staffRight - curr.bounds.width);
	          }
	          continue;
	        }
	
	        if (multiplier) {
	          if (nextToJustify && nextToJustify.notation === curr) {
	            offset += multiplier * nextToJustify.condensable;
	            nextToJustify = toJustify[toJustifyIndex++];
	          }
	        } else if (nextToJustify === curr) {
	          if (prev.hasNoWidth) {
	            incrementOffsetAtNextChance = true;
	          } else {
	            offset += increment;
	          }
	          nextToJustify = toJustify[toJustifyIndex++];
	        } else if (incrementOffsetAtNextChance && !prev.hasNoWidth) {
	          incrementOffsetAtNextChance = false;
	          offset += increment;
	        }
	
	        curr.bounds.x += offset;
	      }
	
	      if (extraSpaceBeforeCustos > 0) {
	        this.custos.bounds.x = lastNotation.bounds.right() + lastNotation.calculatedTrailingSpace;
	      }
	    }
	  }, {
	    key: "handleEndBrace",
	    value: function handleEndBrace(ctxt, note, i) {
	      var startBrace = ctxt.lastStartBrace;
	      if (!startBrace) return;
	      // calculate the y value of the brace by iterating over all notations
	      // under/over the brace.
	      var y;
	      var k = startBrace.notationIndex;
	      var notations = this.score.notations;
	      var dy = ctxt.intraNeumeSpacing / 2; // some safe space between brace and notes.
	      var startNote = startBrace.note;
	
	      if (startBrace.isAbove) {
	        y = Math.min.apply(Math, [ctxt.calculateHeightFromStaffPosition(4)].concat(_toConsumableArray([startNote, note].concat(notations.slice(k, i + 1)).map(function (n) {
	          return n.bounds.y - dy;
	        }))));
	      } else {
	        y = Math.max.apply(Math, [ctxt.calculateHeightFromStaffPosition(-4)].concat(_toConsumableArray([startNote, note].concat(notations.slice(k, i + 1)).map(function (n) {
	          return n.bounds.bottom() + dy;
	        }))));
	      }
	
	      var addAcuteAccent = false;
	
	      if (startBrace.shape === _ExsurgeChantMarkings.BraceShape.RoundBrace) {
	        this.braces.push(new _ExsurgeDrawing.RoundBraceVisualizer(ctxt, startBrace.getAttachmentX(startNote), note.braceEnd.getAttachmentX(note), y, startBrace.isAbove));
	      } else {
	        if (startBrace.shape === _ExsurgeChantMarkings.BraceShape.AccentedCurlyBrace) addAcuteAccent = true;
	
	        this.braces.push(new _ExsurgeDrawing.CurlyBraceVisualizer(ctxt, startBrace.getAttachmentX(startNote), note.braceEnd.getAttachmentX(note), y, startBrace.isAbove, addAcuteAccent));
	      }
	
	      delete ctxt.lastStartBrace;
	    }
	  }, {
	    key: "finishLayout",
	    value: function finishLayout(ctxt) {
	      var _this2 = this;
	
	      this.ledgerLines = []; // clear any existing ledger lines
	
	      var notations = this.score.notations;
	      var lastIndex = this.notationsStartIndex + this.numNotationsOnLine;
	
	      // an element needs to have a staffPosition property, as well as the standard
	      // bounds property. so it could be a note, or it could be a custos
	      // offsetX can be used to add to the position info for the element,
	      // useful in the case of notes.
	      var processElementForLedgerLine = function processElementForLedgerLine(element) {
	        var endElem = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : element;
	        var staffPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : element.staffPosition;
	        var offsetX = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : element.neume ? element.neume.bounds.x : 0;
	
	        // do we need a ledger line for this note?
	
	        if (staffPosition >= 5 || staffPosition <= -5) {
	          var x1 = offsetX + element.bounds.x - ctxt.intraNeumeSpacing;
	          var x2 = offsetX + endElem.bounds.x + endElem.bounds.width + ctxt.intraNeumeSpacing;
	
	          // round the staffPosition to the nearest line
	          if (staffPosition > 0) staffPosition = staffPosition - (staffPosition - 1) % 2;else staffPosition = staffPosition - (staffPosition + 1) % 2;
	
	          // if we have a ledger line close by, then average out the distance between the two
	          var minLedgerSeparation = ctxt.staffInterval * ctxt.minLedgerSeparation;
	
	          if (_this2.ledgerLines.length > 0 && _this2.ledgerLines[_this2.ledgerLines.length - 1].x2 + minLedgerSeparation >= x1) {
	            // average out the distance
	            var half = (x1 - _this2.ledgerLines[_this2.ledgerLines.length - 1].x2) / 2;
	            _this2.ledgerLines[_this2.ledgerLines.length - 1].x2 += half;
	            x1 -= half;
	          }
	
	          // never let a ledger line extend past the staff width
	          if (x2 > _this2.staffRight) x2 = _this2.staffRight;
	
	          // finally, add the ledger line
	          _this2.ledgerLines.push({
	            x1: x1,
	            x2: x2,
	            staffPosition: staffPosition
	          });
	        }
	      };
	
	      var episemata = []; // keep track of episemata in case we can connect some
	      var startBrace = null;
	      var minY = Number.MAX_VALUE,
	          maxY = Number.MIN_VALUE; // for braces
	
	      var positionNonLyricText = function positionNonLyricText(text, neume, rightX) {
	        text.setMaxWidth(ctxt, _this2.staffRight);
	        //text.bounds.x = neume.hasLyrics()? Math.min(...neume.lyrics.map(l => l.bounds.x)) : 0;
	        text.bounds.x = 0;
	        if (rightX) text.bounds.x = (text.bounds.x + rightX - text.bounds.width) / 2;
	        var beyondStaffRight = neume.bounds.x + text.bounds.right() - _this2.staffRight;
	        if (beyondStaffRight > 0) {
	          text.bounds.x -= beyondStaffRight;
	        }
	        if (neume.bounds.x + text.bounds.x < 0) {
	          text.bounds.x = -neume.bounds.x;
	        }
	      };
	
	      // make a final pass over all of the notes to add any necessary
	      // ledger lines and to smooth out episemata
	      for (var i = this.notationsStartIndex; i < lastIndex; i++) {
	        var neume = notations[i];
	
	        minY = Math.min(minY, neume.bounds.y);
	        maxY = Math.max(maxY, neume.bounds.bottom());
	
	        if (neume.constructor === _ExsurgeChantSigns.Custos) {
	          processElementForLedgerLine(neume);
	          continue;
	        }
	
	        // if the AboveLinesText would extend beyond the right edge of the staff, right align it instead
	        if (neume.alText) {
	          for (var j = 0; j < neume.alText.length; j++) {
	            positionNonLyricText(neume.alText[j], neume);
	          }
	        }
	
	        // set up horizontal position of translations
	        if (neume.translationText) {
	          for (j = 0; j < neume.translationText.length; j++) {
	            var text = neume.translationText[j];
	            if (text.endNeume) {
	              var rightX = text.endNeume.hasLyrics() ? text.endNeume.bounds.x + Math.max.apply(Math, _toConsumableArray(text.endNeume.lyrics.map(function (l) {
	                return l.bounds.right();
	              }))) : text.endNeume.bounds.right();
	              rightX -= neume.bounds.x;
	              positionNonLyricText(text, neume, rightX);
	            } else {
	              positionNonLyricText(text, neume);
	            }
	          }
	        }
	
	        // if it's not a neume then just skip here
	        if (!neume.isNeume) continue;
	
	        for (j = 0; j < neume.ledgerLines.length; j++) {
	          var ll = neume.ledgerLines[j];
	          processElementForLedgerLine(ll.element, ll.endElem, ll.staffPosition);
	        }
	
	        for (j = 0; j < neume.notes.length; j++) {
	          var k,
	              note = neume.notes[j];
	
	          // blend episemata as we're able
	          if (note.episemata.length === 0) episemata = [];
	          for (k = 0; k < note.episemata.length; k++) {
	            var episema = note.episemata[k];
	
	            var spaceBetweenEpisemata = 0;
	
	            // calculate the distance between the last episemata and this one...
	            // lots of code for a simple: currEpisemata.left - prevEpisemata.right
	            if (episemata.length > 0) spaceBetweenEpisemata = neume.bounds.x + episema.bounds.x - (episemata[episemata.length - 1].note.neume.bounds.x + episemata[episemata.length - 1].bounds.right());
	
	            // we try to blend the episema if we're able.
	            if (episemata.length === 0 || episemata[episemata.length - 1].positionHint !== episema.positionHint || episemata[episemata.length - 1].terminating === true || episemata[episemata.length - 1].alignment === _ExsurgeChantMarkings.HorizontalEpisemaAlignment.Left || episemata[episemata.length - 1].alignment === _ExsurgeChantMarkings.HorizontalEpisemaAlignment.Center || episema.alignment === _ExsurgeChantMarkings.HorizontalEpisemaAlignment.Right || episema.alignment === _ExsurgeChantMarkings.HorizontalEpisemaAlignment.Center || spaceBetweenEpisemata > ctxt.intraNeumeSpacing * 2 && note.glyphVisualizer.glyphCode !== _ExsurgeDrawing.GlyphCode.None) {
	              // start a new set of episemata to potentially blend
	              episemata = [episema];
	            } else {
	              // blend all previous with this one
	              var newY;
	
	              if (episema.positionHint === _ExsurgeDrawing.MarkingPositionHint.Below) newY = Math.max(episema.bounds.y, episemata[episemata.length - 1].bounds.y);else newY = Math.min(episema.bounds.y, episemata[episemata.length - 1].bounds.y);
	
	              if (episema.bounds.y !== newY) episema.bounds.y = newY;else {
	                for (var l = 0; l < episemata.length; l++) {
	                  episemata[l].bounds.y = newY;
	                }
	              }
	
	              // extend the last episema to meet the new one
	              var newWidth = neume.bounds.x + episema.bounds.x - (episemata[episemata.length - 1].note.neume.bounds.x + episemata[episemata.length - 1].bounds.x);
	              if (newWidth < 0) {
	                newWidth *= -1;
	                episemata[episemata.length - 1].bounds.x -= newWidth;
	              }
	              episemata[episemata.length - 1].bounds.width = newWidth;
	
	              episemata.push(episema);
	            }
	          }
	
	          if (note.braceEnd) this.handleEndBrace(ctxt, note, i);
	
	          if (note.braceStart) {
	            ctxt.lastStartBrace = startBrace = note.braceStart;
	            startBrace.notationIndex = i;
	          }
	        }
	      }
	
	      // if we still have an active brace, that means it spands two chant lines!
	      if (startBrace !== null) {
	        if (this.custos) {
	          // if the next end brace is on the first note following the line break, simply use it with the custos
	          // Do the same if there is only an accidental between
	          // otherwise, make a new end brace to work for this one, and a new start brace for the next line.
	          var nextNotation = notations[lastIndex];
	          var nextNote = nextNotation.notes && nextNotation.notes[0];
	          var nextNotationButOne = notations[lastIndex + 1];
	          var nextNoteButOne = nextNotationButOne && nextNotationButOne.notes && nextNotationButOne.notes[0];
	          var braceEnd = nextNote && nextNote.braceEnd || nextNotation.isAccidental && nextNoteButOne && nextNoteButOne.braceEnd;
	          if (braceEnd) {
	            this.custos.braceEnd = braceEnd;
	            this.handleEndBrace(ctxt, this.custos, i);
	          } else {
	            this.braceStart = startBrace;
	            this.custos.braceEnd = new _ExsurgeChantMarkings.BracePoint(this.custos, startBrace.isAbove, startBrace.shape, _ExsurgeChantMarkings.BraceAttachment.Right);
	            this.handleEndBrace(ctxt, this.custos, i - 1);
	            ctxt.lastStartBrace = new _ExsurgeChantMarkings.BracePoint(null, startBrace.isAbove, startBrace.shape, _ExsurgeChantMarkings.BraceAttachment.Left);
	            ctxt.lastStartBrace.notationIndex = i;
	          }
	        }
	      }
	
	      // don't forget to also include the final custos, which may need a ledger line too
	      if (this.custos) processElementForLedgerLine(this.custos);
	    }
	
	    // this is where the real core of positioning neumes takes place
	    // returns true if positioning was able to fit the neume before rightNotationBoundary.
	    // returns false if cannot fit before given right margin.
	    // fixme: if this returns false, shouldn't we set the connectors on prev to be activated?!
	
	  }, {
	    key: "positionNotationElement",
	    value: function positionNotationElement(ctxt, prevLyrics, prev, curr, rightNotationBoundary) {
	      var condensableSpaces = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];
	
	      if (!condensableSpaces.hasOwnProperty("sum")) condensableSpaces.sum = 0;
	      var i,
	          space = { notation: curr },
	          fixedX = false;
	
	      // To begin we just place the current notation right after the previous,
	      // irrespective of lyrics.
	      // But if the previous neume was part of a polyphonic "no width" group and the current is not, or is of a separate group,
	      // we force it to have the same x as the previous group.
	      if ((!curr.hasNoWidth || curr.firstWithNoWidth === curr) && prev.firstWithNoWidth) {
	        curr.bounds.x = prev.firstWithNoWidth.bounds.x;
	        fixedX = true;
	      } else {
	        curr.bounds.x = prev.bounds.right();
	      }
	
	      if (curr.constructor === _ExsurgeChant.TextOnly && this.extraTextOnlyIndex === null || !curr.hasLyrics() && prev.calculatedTrailingSpace < 0) {
	        // We transfer over the trailing space from the previous neume if the current neume is text only,
	        // so that the text only neume has a better chance at not needing a connector.
	        curr.calculatedTrailingSpace = prev.calculatedTrailingSpace;
	        if (curr.hasLyrics()) curr.calculatedTrailingSpace -= curr.lyrics[0].bounds.width;
	        if (curr.constructor === _ExsurgeChant.TextOnly && curr.lyrics.length === 1) {
	          curr.lyrics[0].setMaxWidth(ctxt, this.staffRight, this.staffRight - _ExsurgeDrawing.LyricArray.getRight(prevLyrics) - ctxt.minLyricWordSpacing);
	        }
	      } else if (!fixedX) {
	        curr.bounds.x += prev.calculatedTrailingSpace;
	      }
	
	      if (curr.hasLyrics() && !prev.isDivider && !prev.isAccidental && this.numNotationsOnLine > 0 && (curr.lyrics[0].lyricType === _ExsurgeDrawing.LyricType.SingleSyllable || curr.lyrics[0].lyricType === _ExsurgeDrawing.LyricType.BeginningSyllable)) {
	        curr.bounds.x += ctxt.intraNeumeSpacing * ctxt.interVerbalMultiplier;
	      }
	      if (curr.hasNoWidth || fixedX) {
	        space.total = space.condensable = 0;
	      } else if (this.extraTextOnlyIndex !== null && curr.constructor === _ExsurgeChant.TextOnly) {
	        curr.bounds.x = 0;
	        space.total = space.condensable = 0;
	      } else {
	        space.total = curr.bounds.x - prev.bounds.right();
	        space.condensable = space.total * ctxt.condensingTolerance;
	      }
	
	      // if the previous notation has no lyrics, then we simply make sure the
	      // current notation with lyrics is in the bounds of the line
	      if (prevLyrics.length === 0) {
	        var maxRight = curr.bounds.right() + curr.calculatedTrailingSpace;
	
	        // if the lyric left is negative, then offset the neume appropriately
	        for (i = 0; i < curr.lyrics.length; i++) {
	          var currLyric = curr.lyrics[i];
	          // we hope for the best!
	          // but always use a connector if the lyric has original text that was all used up for the drop cap.
	          var needsConnector = currLyric.allowsConnector() && currLyric.dropCap && currLyric.originalText && !currLyric.text;
	          currLyric.setNeedsConnector(needsConnector);
	          var minLeft = this.staffLeft - this.paddingLeft;
	
	          if (currLyric.getLeft() < minLeft) curr.bounds.x -= currLyric.getLeft() - minLeft;
	
	          space.condensable = Math.min(space.condensable, currLyric.getLeft() - minLeft);
	          maxRight = Math.max(maxRight, currLyric.getRight());
	        }
	
	        if (maxRight > rightNotationBoundary + condensableSpaces.sum + space.condensable) return false;
	        condensableSpaces.push(space);
	        condensableSpaces.sum += space.condensable;
	        return true;
	      } else {
	        if (curr.firstOfSyllable && prevLyrics.length && !curr.hasLyrics()) {
	          curr.bounds.x = Math.max(curr.bounds.x, prevLyrics[0].getRight());
	          space.total = curr.bounds.x - prev.bounds.right();
	          space.condensable = space.total * ctxt.condensingTolerance;
	        }
	      }
	
	      // if the curr notation has no lyrics, then simply check whether there is enough room
	      if (curr.hasLyrics() === false) {
	        if (curr.bounds.right() + curr.calculatedTrailingSpace > rightNotationBoundary + condensableSpaces.sum + space.condensable) return false;
	        condensableSpaces.push(space);
	        condensableSpaces.sum += space.condensable;
	        return true;
	      }
	
	      // if we have multiple lyrics on the current or the previous notation,
	      // we will have to run several passes over each set of lyrics:
	
	      // on the first pass, we will check the absolute left-most placement of the new syllables
	      // we will make additional passes until everything is stable
	      do {
	        var hasShifted = false;
	        var atLeastOneWithoutConnector = false;
	        for (i = 0; i < curr.lyrics.length; i++) {
	          if (!curr.lyrics[i].originalText) continue;
	          var prevLyricRight = 0;
	          var condensableSpacesSincePrevLyric = [];
	          var condensableSpaceSincePrevLyric = null;
	          if (i < prevLyrics.length && prevLyrics[i]) {
	            prevLyricRight = prevLyrics[i].getRight();
	            var notationI = condensableSpaces.map(function (s) {
	              return s.notation;
	            }).lastIndexOf(prevLyrics[i].notation);
	            if (notationI >= 0) {
	              condensableSpacesSincePrevLyric = condensableSpaces.slice(notationI + 1);
	              condensableSpacesSincePrevLyric.sum = condensableSpacesSincePrevLyric.map(function (s) {
	                return s.condensable;
	              }).reduce(function (a, b) {
	                return a + b;
	              }, 0);
	            } else {
	              condensableSpacesSincePrevLyric.sum = 0;
	            }
	          }
	
	          curr.lyrics[i].setNeedsConnector(false); // we hope for the best!
	          var currLyricLeft = curr.lyrics[i].getLeft();
	          if (!prevLyrics[i] || prevLyrics[i].allowsConnector() === false) {
	            // No connector needed, but include space between words if necessary!
	            var extraSpace = currLyricLeft - prevLyricRight - ctxt.minLyricWordSpacing;
	            if (extraSpace < 0) {
	              // push the current element over a bit.
	              var shift = prevLyricRight + ctxt.minLyricWordSpacing - currLyricLeft;
	              curr.bounds.x += shift;
	              condensableSpaceSincePrevLyric = 0;
	              hasShifted = shift > 0.5;
	            } else {
	              condensableSpaceSincePrevLyric = extraSpace;
	            }
	          } else {
	            // we may need a connector yet...
	            if (prevLyricRight + 0.1 > currLyricLeft - condensableSpacesSincePrevLyric.sum - space.condensable) {
	              // in this case, the lyric elements actually overlap.
	              // so nope, no connector needed. instead, we just place the lyrics together
	              // fixme: for better text layout, we could actually use the kerning values
	              // between the prev and curr lyric elements!
	              var _shift = prevLyricRight - currLyricLeft;
	              if (_shift < -0.1) {
	                (function () {
	                  // in this case, the spacing needs to be condensed in the neumes since the last lyric...
	                  var multiplier = _shift / (condensableSpacesSincePrevLyric.sum + space.condensable);
	                  var offset = 0;
	                  condensableSpacesSincePrevLyric.forEach(function (s) {
	                    offset += multiplier * s.condensable;
	                    s.notation.bounds.x += offset;
	                  });
	                })();
	              }
	              curr.bounds.x += _shift;
	              condensableSpaceSincePrevLyric = 0;
	              atLeastOneWithoutConnector = true;
	              hasShifted = _shift > 0.5;
	            } else {
	              // bummer, looks like we couldn't merge the syllables together. Better add a connector...
	              if (ctxt.minLyricWordSpacing < ctxt.hyphenWidth) {
	                var spaceBetweenSyls = currLyricLeft - prevLyricRight;
	                if (spaceBetweenSyls < ctxt.hyphenWidth) {
	                  var minHyphenWidth = prevLyrics.length > 1 ? ctxt.intraNeumeSpacing : ctxt.minLyricWordSpacing;
	                  // we might not need to shift the syllable, but we do want to shrink the hyphen...
	                  prevLyrics[i].setConnectorWidth(Math.max(minHyphenWidth, spaceBetweenSyls));
	                }
	              }
	              prevLyrics[i].setNeedsConnector(true);
	              prevLyricRight = prevLyrics[i].getRight();
	
	              if (prevLyricRight + 0.1 > currLyricLeft) {
	                var _shift2 = prevLyricRight - currLyricLeft;
	                curr.bounds.x += _shift2;
	                condensableSpaceSincePrevLyric = 0;
	                hasShifted = _shift2 > 0.5;
	              } else {
	                condensableSpaceSincePrevLyric = currLyricLeft - prevLyricRight;
	              }
	            }
	          }
	
	          if (condensableSpaceSincePrevLyric !== null) {
	            if (condensableSpaceSincePrevLyric < condensableSpacesSincePrevLyric.sum + space.condensable) {
	              (function () {
	                // reduce condensable space so that lyrics retain at least the width of a space character between words:
	                var multiplier = condensableSpaceSincePrevLyric / (condensableSpacesSincePrevLyric.sum + space.condensable);
	                space.condensable *= multiplier;
	                if (condensableSpacesSincePrevLyric.sum) {
	                  condensableSpacesSincePrevLyric.forEach(function (space) {
	                    space.condensable *= multiplier;
	                  });
	                  condensableSpaces.sum = condensableSpaces.map(function (s) {
	                    return s.condensable;
	                  }).reduce(function (a, b) {
	                    return a + b;
	                  }, 0);
	                }
	              })();
	            }
	          }
	        }
	      } while (curr.lyrics.length > 1 && hasShifted && atLeastOneWithoutConnector);
	
	      for (i = Math.min(curr.lyrics.length, prevLyrics.length) - 1; i >= 0; i--) {
	        var pLyrics = prevLyrics[i];
	        if (pLyrics.needsConnector && pLyrics.connectorWidth) {
	          currLyricLeft = curr.lyrics[i].getLeft();
	          prevLyricRight = pLyrics.getRight() - pLyrics.connectorWidth;
	          spaceBetweenSyls = currLyricLeft - prevLyricRight;
	          if (spaceBetweenSyls >= ctxt.hyphenWidth) spaceBetweenSyls = 0;
	          pLyrics.setConnectorWidth(spaceBetweenSyls);
	        }
	      }
	
	      if (curr.bounds.right() + curr.calculatedTrailingSpace < rightNotationBoundary + condensableSpaces.sum + space.condensable && _ExsurgeDrawing.LyricArray.getRight(curr.lyrics, true) <= this.staffRight + condensableSpaces.sum + space.condensable) {
	        if (prev.isAccidental) {
	          // move the previous accidental up next to the current note:
	          var _shift3 = curr.bounds.x - prev.bounds.width - prev.calculatedTrailingSpace - prev.bounds.x;
	          prev.bounds.x += _shift3;
	          if (Math.abs(_shift3) > 0.1) {
	            var lastCondensable = condensableSpaces[condensableSpaces.length - 1];
	            condensableSpaces.sum -= lastCondensable.condensable;
	            lastCondensable.condensable = 0;
	          }
	        }
	        condensableSpaces.push(space);
	        condensableSpaces.sum += space.condensable;
	        return true;
	      }
	
	      // if we made it this far, then the element won't fit on this line.
	      return false;
	    }
	
	    /**
	     * Find the notation closest to x without going past it
	     * @param {number} x
	     */
	
	  }, {
	    key: "bisectNotationAtX",
	    value: function bisectNotationAtX(x) {
	      var useMidpoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
	
	      var minIndex = -1,
	          maxIndex = Math.min(this.numNotationsOnLine, Infinity),
	          curIndex = minIndex + (maxIndex - minIndex >> 1),
	          notations = this.score.notations.slice(this.notationsStartIndex, this.notationsStartIndex + this.numNotationsOnLine);
	
	      while (minIndex < curIndex) {
	        var _notation = notations[curIndex];
	        var notationX = _notation.bounds.x;
	        if (notationX > x) {
	          maxIndex = curIndex;
	        } else {
	          minIndex = curIndex;
	        }
	        curIndex = minIndex + (maxIndex - minIndex >> 1);
	      }
	      var notation = notations[curIndex];
	      if (useMidpoint && notation && notation.bounds.width === 0 && curIndex + 1 < notations.length) {
	        var nextNotation = notations[curIndex + 1],
	            closenessToLeft = x - notation.bounds.x,
	            closenessToRight = nextNotation.bounds.x - x;
	        if (nextNotation.bounds.width === 0 && closenessToRight < closenessToLeft) ++curIndex;
	      }
	      return notations[curIndex];
	    }
	  }]);
	
	  return ChantLine;
	}(_ExsurgeDrawing.ChantLayoutElement);

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.BracePoint = exports.BraceAttachment = exports.BraceShape = exports.Mora = exports.Ictus = exports.HorizontalEpisema = exports.HorizontalEpisemaAlignment = exports.Accent = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _ExsurgeChant = __webpack_require__(8);
	
	var _ExsurgeDrawing = __webpack_require__(4);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
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
	
	var Accent = exports.Accent = function (_GlyphVisualizer) {
	  _inherits(Accent, _GlyphVisualizer);
	
	  function Accent(ctxt, note) {
	    var glyphCode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _ExsurgeDrawing.GlyphCode.AcuteAccent;
	
	    _classCallCheck(this, Accent);
	
	    var _this = _possibleConstructorReturn(this, (Accent.__proto__ || Object.getPrototypeOf(Accent)).call(this, ctxt, glyphCode));
	
	    _this.note = note;
	    _this.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;
	    return _this;
	  }
	
	  _createClass(Accent, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      this.bounds.x = this.note.bounds.x + this.bounds.width / 2; // center on the note itself
	
	      // this puts the acute accent either over the staff lines, or over the note if the
	      // note is above the staff lines
	      this.setStaffPosition(ctxt, Math.max(this.note.staffPosition + 1, 4));
	    }
	  }]);
	
	  return Accent;
	}(_ExsurgeDrawing.GlyphVisualizer);
	
	// for positioning markings on notes
	
	
	var HorizontalEpisemaAlignment = exports.HorizontalEpisemaAlignment = {
	  Default: 0,
	  Left: 1,
	  Center: 2,
	  Right: 3
	};
	
	/*
	 * HorizontalEpisema
	 *
	 * A horizontal episema marking is it's own visualizer (that is, it implements createSvgFragment)
	 */
	
	var HorizontalEpisema = exports.HorizontalEpisema = function (_ChantLayoutElement) {
	  _inherits(HorizontalEpisema, _ChantLayoutElement);
	
	  function HorizontalEpisema(note) {
	    _classCallCheck(this, HorizontalEpisema);
	
	    var _this2 = _possibleConstructorReturn(this, (HorizontalEpisema.__proto__ || Object.getPrototypeOf(HorizontalEpisema)).call(this));
	
	    _this2.note = note;
	
	    _this2.positionHint = _ExsurgeDrawing.MarkingPositionHint.Default;
	    _this2.terminating = false; // indicates if this episema should terminate itself or not
	    _this2.alignment = HorizontalEpisemaAlignment.Default;
	    return _this2;
	  }
	
	  _createClass(HorizontalEpisema, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      // following logic helps to keep the episemata away from staff lines if they get too close
	
	      var y = 0,
	          step;
	      var minDistanceAway = ctxt.staffInterval * 0.25; // min distance from neume
	      var glyphCode = this.note.glyphVisualizer.glyphCode;
	      var ledgerLine = this.note.neume.ledgerLines[0] || {};
	      var punctumInclinatumShorten = false;
	
	      if (glyphCode === _ExsurgeDrawing.GlyphCode.PunctumInclinatum) {
	        var notes = this.note.neume.notes,
	            index = notes.indexOf(this.note),
	            prevNote = notes[index - 1];
	        if (prevNote && prevNote.glyphVisualizer.glyphCode === _ExsurgeDrawing.GlyphCode.PunctumInclinatum && prevNote.staffPosition - this.note.staffPosition === 1) {
	          punctumInclinatumShorten = true;
	        }
	      }
	
	      if (this.positionHint === _ExsurgeDrawing.MarkingPositionHint.Below) {
	        y = this.note.bounds.bottom() + minDistanceAway; // the highest the line could be at
	        if (glyphCode === _ExsurgeDrawing.GlyphCode.None)
	          // correction for episema under the second note of a porrectus
	          y += ctxt.staffInterval / 2;
	        step = Math.ceil(y / ctxt.staffInterval);
	        // if there's enough space, center the episema between the punctum and the next staff line
	        if (step % 2 === 0) {
	          step = (step + 3 / 4 + (y - minDistanceAway) / ctxt.staffInterval) / 2;
	        } else {
	          // otherwise, find nearest acceptable third between staff lines (or staff line)
	          step = (Math.ceil(1.5 * y / ctxt.staffInterval - 0.5) * 2 + 1) / 3;
	
	          // if it's an odd step, that means we're on a staff line,
	          // so we shift to between the staff line
	          if (Math.abs(step) % 2 === 1) {
	            if (Math.abs(step) < 4 || ledgerLine.staffPosition === -step) {
	              step += 2 / 3;
	            } else {
	              // no ledger line, but we don't want the episema to be at exactly the same height the ledger line would occupy:
	              step += 1 / 3;
	            }
	          }
	        }
	      } else {
	        y = this.note.bounds.y - minDistanceAway; // the lowest the line could be at
	        step = Math.floor(y / ctxt.staffInterval);
	        // if there's enough space, center the episema between the punctum and the next staff line
	        if (step % 2 === 0) {
	          step = (step - 3 / 4 + (y + minDistanceAway) / ctxt.staffInterval) / 2;
	        } else {
	          // otherwise, find nearest acceptable third between staff lines (or staff line)
	          step = (Math.floor(1.5 * y / ctxt.staffInterval - 0.5) * 2 + 1) / 3;
	
	          // find nearest acceptable third between staff lines (or staff line)
	          if (Math.abs(step) % 2 === 1) {
	            // if it was a staff line, we need to adjust
	            if (Math.abs(step) < 4 || ledgerLine.staffPosition === -step) {
	              step -= 2 / 3;
	            } else {
	              // no ledger line, but we don't want the episema to be at exactly the same height the ledger line would occupy:
	              step -= 1 / 3;
	            }
	          }
	        }
	      }
	
	      y = step * ctxt.staffInterval;
	
	      var width = this.note.bounds.width;
	      var x = this.note.bounds.x;
	
	      // The porrectus requires special handling of the note width,
	      // otherwise the width is just that of the note itself
	      if (glyphCode === _ExsurgeDrawing.GlyphCode.Porrectus1 || glyphCode === _ExsurgeDrawing.GlyphCode.Porrectus2 || glyphCode === _ExsurgeDrawing.GlyphCode.Porrectus3 || glyphCode === _ExsurgeDrawing.GlyphCode.Porrectus4) width = ctxt.staffInterval;else if (glyphCode === _ExsurgeDrawing.GlyphCode.None) {
	        width = ctxt.staffInterval;
	        x -= width;
	      } else if (punctumInclinatumShorten) {
	        width *= 2 / 3;
	        x += 0.5 * width;
	      } else if (glyphCode === _ExsurgeDrawing.GlyphCode.PunctumInclinatumLiquescent) {
	        width *= 2 / 3;
	        x += 0.25 * width;
	      }
	
	      // also, the position hint can affect the x/width of the episema
	      if (this.alignment === HorizontalEpisemaAlignment.Left) {
	        width *= 0.8;
	      } else if (this.alignment === HorizontalEpisemaAlignment.Center) {
	        x += width * 0.1;
	        width *= 0.8;
	      } else if (this.alignment === HorizontalEpisemaAlignment.Right) {
	        x += width * 0.2;
	        width *= 0.8;
	      }
	
	      this.bounds.x = x;
	      this.bounds.y = y - ctxt.episemaLineWeight / 2;
	      this.bounds.width = width;
	      this.bounds.height = ctxt.episemaLineWeight;
	
	      this.origin.x = 0;
	      this.origin.y = 0;
	    }
	  }, {
	    key: "draw",
	    value: function draw(ctxt) {
	      var canvasCtxt = ctxt.canvasCtxt;
	
	      canvasCtxt.fillStyle = ctxt.neumeLineColor;
	
	      canvasCtxt.fillRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
	    }
	  }, {
	    key: "getSvgProps",
	    value: function getSvgProps(ctxt) {
	      return {
	        x: this.bounds.x,
	        y: this.bounds.y,
	        width: this.bounds.width,
	        height: this.bounds.height,
	        fill: ctxt.neumeLineColor,
	        class: "horizontalEpisema"
	      };
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      return _ExsurgeDrawing.QuickSvg.createNode("rect", this.getSvgProps(ctxt));
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      return _ExsurgeDrawing.QuickSvg.createSvgTree("rect", this.getSvgProps(ctxt));
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      return _ExsurgeDrawing.QuickSvg.createFragment("rect", this.getSvgProps(ctxt));
	    }
	  }]);
	
	  return HorizontalEpisema;
	}(_ExsurgeDrawing.ChantLayoutElement);
	
	/*
	 * Ictus
	 */
	
	
	var Ictus = exports.Ictus = function (_GlyphVisualizer2) {
	  _inherits(Ictus, _GlyphVisualizer2);
	
	  function Ictus(ctxt, note) {
	    _classCallCheck(this, Ictus);
	
	    var _this3 = _possibleConstructorReturn(this, (Ictus.__proto__ || Object.getPrototypeOf(Ictus)).call(this, ctxt, _ExsurgeDrawing.GlyphCode.VerticalEpisemaAbove));
	
	    _this3.note = note;
	    _this3.positionHint = _ExsurgeDrawing.MarkingPositionHint.Default;
	    return _this3;
	  }
	
	  _createClass(Ictus, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      var glyphCode = this.note.glyphVisualizer.glyphCode;
	      // we have to place the ictus further from the note in some cases to avoid a collision with an episema on the same note:
	      var positionHint = this.positionHint || _ExsurgeDrawing.MarkingPositionHint.Below;
	      var staffPosition = this.note.staffPosition + (positionHint === _ExsurgeDrawing.MarkingPositionHint.Above ? 1 : -1);
	      var collisionWithEpisema = this.note.episemata.length > 0 && (this.note.episemata[0].positionHint || _ExsurgeDrawing.MarkingPositionHint.Above) === positionHint;
	      var horizontalOffset;
	      var verticalOffset = 1;
	      var shortOffset = -0.2;
	      var extraOffset = 0;
	      var collisionWithStaffLine = staffPosition % 2 && (Math.abs(staffPosition) < 4 || (this.note.neume.ledgerLines[0] || {}).staffPosition === staffPosition);
	
	      // The porrectus requires special handling of the note width,
	      // otherwise the width is just that of the note itself
	      if (glyphCode === _ExsurgeDrawing.GlyphCode.Porrectus1 || glyphCode === _ExsurgeDrawing.GlyphCode.Porrectus2 || glyphCode === _ExsurgeDrawing.GlyphCode.Porrectus3 || glyphCode === _ExsurgeDrawing.GlyphCode.Porrectus4) horizontalOffset = ctxt.staffInterval / 2;else if (glyphCode === _ExsurgeDrawing.GlyphCode.None) {
	        horizontalOffset = -ctxt.staffInterval / 2;
	      } else {
	        horizontalOffset = this.note.bounds.width / 2;
	        if (glyphCode === _ExsurgeDrawing.GlyphCode.PunctumInclinatum && !collisionWithStaffLine && !collisionWithEpisema) {
	          extraOffset = 0.3;
	        }
	      }
	
	      if (this.positionHint === _ExsurgeDrawing.MarkingPositionHint.Above) {
	        glyphCode = _ExsurgeDrawing.GlyphCode.VerticalEpisemaAbove;
	        verticalOffset *= -1;
	      } else {
	        glyphCode = _ExsurgeDrawing.GlyphCode.VerticalEpisemaBelow;
	      }
	      if (collisionWithEpisema) {
	        extraOffset = 0.4;
	      }
	      verticalOffset *= ctxt.staffInterval * (extraOffset + (collisionWithStaffLine ? 0.3 : shortOffset));
	
	      this.setGlyph(ctxt, glyphCode);
	      this.setStaffPosition(ctxt, staffPosition);
	
	      this.bounds.x = this.note.bounds.x + horizontalOffset - this.origin.x;
	      this.bounds.y += verticalOffset;
	    }
	  }]);
	
	  return Ictus;
	}(_ExsurgeDrawing.GlyphVisualizer);
	
	/*
	 * Mora
	 */
	
	
	var Mora = exports.Mora = function (_GlyphVisualizer3) {
	  _inherits(Mora, _GlyphVisualizer3);
	
	  function Mora(ctxt, note) {
	    _classCallCheck(this, Mora);
	
	    var _this4 = _possibleConstructorReturn(this, (Mora.__proto__ || Object.getPrototypeOf(Mora)).call(this, ctxt, _ExsurgeDrawing.GlyphCode.Mora));
	
	    _this4.note = note;
	    _this4.positionHint = _ExsurgeDrawing.MarkingPositionHint.Default;
	    _this4.horizontalOffset = ctxt.staffInterval / 2 + _this4.origin.x;
	    return _this4;
	  }
	
	  _createClass(Mora, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      this.setGlyph(ctxt, this.glyphCode);
	      this.horizontalOffset = ctxt.staffInterval / 2 + this.origin.x;
	      var staffPosition = this.note.staffPosition;
	
	      this.setStaffPosition(ctxt, staffPosition);
	
	      var verticalOffset = 0;
	      // First, we need to find the next note in the neume.
	      var noteIndex = this.note.neume.notes.indexOf(this.note);
	      var nextNote;
	      if (noteIndex >= 0) {
	        ++noteIndex;
	        if (this.note.neume.notes.length > noteIndex) {
	          nextNote = this.note.neume.notes[noteIndex];
	          if (nextNote.morae && nextNote.morae.length && this.note.neume.notes.length === noteIndex + 1) {
	            // this note is the second to last in its neume, and the last note also has a mora
	            this.horizontalOffset += nextNote.bounds.right() - this.note.bounds.right();
	          } else if (nextNote.bounds.right() > this.note.bounds.right()) {
	            // center the dot over the following note.
	            this.horizontalOffset = (nextNote.bounds.right() - this.note.bounds.right() - this.bounds.right()) / 2;
	          } else {
	            nextNote = null;
	          }
	        } else if (this.note.neume.notes.length === noteIndex) {
	          // this note is the last in its neume:
	          if (this.note.neume.trailingSpace === 0) {
	            // if this was the last note in its neume, we only care about the next note if there is no trailing space at the end of this neume.
	            var notationIndex = this.note.neume.score.notations.indexOf(this.note.neume);
	            if (notationIndex >= 0) {
	              var nextNotation = this.note.neume.score.notations[notationIndex + 1];
	              if (nextNotation && nextNotation.notes) {
	                nextNote = nextNotation.notes[0];
	              }
	            }
	          } else if (this.note.shape !== _ExsurgeChant.NoteShape.Inclinatum) {
	            this.note.neume.calculatedTrailingSpace += this.origin.x;
	          }
	        }
	      }
	
	      if (this.positionHint === _ExsurgeDrawing.MarkingPositionHint.Above) {
	        if (staffPosition % 2 === 0) verticalOffset -= ctxt.staffInterval * 1.75;else verticalOffset -= ctxt.staffInterval * 0.75;
	      } else if (this.positionHint === _ExsurgeDrawing.MarkingPositionHint.Below) {
	        if (staffPosition % 2 === 0) verticalOffset += ctxt.staffInterval * 1.75;else verticalOffset += ctxt.staffInterval * 0.75;
	      } else {
	        if (staffPosition % 2 === 0) {
	          // if the note is in a space and followed by a note on the line below, we often want to move the mora dot up slightly so that it is centered
	          // between the top of the note's space and the top of the following note.
	          if (nextNote && nextNote.staffPosition === staffPosition - 1) {
	            verticalOffset -= ctxt.staffInterval * 0.25;
	          }
	        } else {
	          verticalOffset -= ctxt.staffInterval * 0.75;
	        }
	      }
	      this.bounds.x = this.horizontalOffset + this.note.bounds.right();
	      this.bounds.y += verticalOffset;
	    }
	  }]);
	
	  return Mora;
	}(_ExsurgeDrawing.GlyphVisualizer);
	
	// indicates the shape of the brace
	
	
	var BraceShape = exports.BraceShape = {
	  RoundBrace: 0,
	  CurlyBrace: 1,
	  AccentedCurlyBrace: 2
	};
	
	// indicates how the brace is alignerd to the note to which it's connected
	var BraceAttachment = exports.BraceAttachment = {
	  Left: 0,
	  Right: 1
	};
	
	var BracePoint = exports.BracePoint = function (_ChantLayoutElement2) {
	  _inherits(BracePoint, _ChantLayoutElement2);
	
	  function BracePoint(note, isAbove, shape, attachment) {
	    _classCallCheck(this, BracePoint);
	
	    var _this5 = _possibleConstructorReturn(this, (BracePoint.__proto__ || Object.getPrototypeOf(BracePoint)).call(this));
	
	    _this5.note = note;
	    _this5.isAbove = isAbove;
	    _this5.shape = shape;
	    _this5.attachment = attachment;
	    return _this5;
	  }
	
	  _createClass(BracePoint, [{
	    key: "getAttachmentX",
	    value: function getAttachmentX(note) {
	      if (!note) note = this.note;
	      if (this.attachment === BraceAttachment.Left) return (note.neume ? note.neume.bounds.x : 0) + note.bounds.x;else return (note.neume ? note.neume.bounds.x : 0) + note.bounds.right();
	    }
	  }]);
	
	  return BracePoint;
	}(_ExsurgeDrawing.ChantLayoutElement);

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Virgula = exports.Accidental = exports.AccidentalType = exports.DoubleBar = exports.DominicanBar = exports.InsertionCursor = exports.FullBar = exports.HalfBar = exports.QuarterBar = exports.Divider = exports.Custos = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
	
	var _ExsurgeCore = __webpack_require__(1);
	
	var _ExsurgeDrawing = __webpack_require__(4);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
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
	
	/*
	 *
	 */
	var Custos = exports.Custos = function (_ChantNotationElement) {
	  _inherits(Custos, _ChantNotationElement);
	
	  // if auto is true, then the custos will automatically try to determine it's height based on
	  // subsequent notations
	  function Custos() {
	    var auto = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	
	    _classCallCheck(this, Custos);
	
	    var _this = _possibleConstructorReturn(this, (Custos.__proto__ || Object.getPrototypeOf(Custos)).call(this));
	
	    _this.auto = auto;
	    _this.staffPosition = 0; // default sane value
	    return _this;
	  }
	
	  _createClass(Custos, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Custos.prototype.__proto__ || Object.getPrototypeOf(Custos.prototype), "performLayout", this).call(this, ctxt);
	
	      if (this.auto) {
	        var neume = ctxt.findNextNeume();
	
	        if (neume) this.staffPosition = ctxt.activeClef.pitchToStaffPosition(neume.notes[0].pitch);
	
	        // in case there was a weird fa/do clef change, let's sanitize the staffPosition by making sure it is
	        // within reasonable bounds
	        while (this.staffPosition < -6) {
	          this.staffPosition += 7;
	        }while (this.staffPosition > 6) {
	          this.staffPosition -= 7;
	        }
	      }
	
	      var glyph = new _ExsurgeDrawing.GlyphVisualizer(ctxt, Custos.getGlyphCode(this.staffPosition));
	      glyph.setStaffPosition(ctxt, this.staffPosition);
	      this.addVisualizer(glyph);
	
	      this.finishLayout(ctxt);
	    }
	
	    // called when layout has changed and our dependencies are no longer good
	
	  }, {
	    key: "resetDependencies",
	    value: function resetDependencies() {
	      // we only need to resolve new dependencies if we're an automatic custos
	      if (this.auto) this.needsLayout = true;
	    }
	  }], [{
	    key: "getGlyphCode",
	    value: function getGlyphCode(staffPosition) {
	      if (staffPosition <= 2) {
	        // ascending custodes
	        if (Math.abs(staffPosition) % 2 === 1) return _ExsurgeDrawing.GlyphCode.CustosLong;else return _ExsurgeDrawing.GlyphCode.CustosShort;
	      } else {
	        // descending custodes
	        if (Math.abs(staffPosition) % 2 === 1) return _ExsurgeDrawing.GlyphCode.CustosDescLong;else return _ExsurgeDrawing.GlyphCode.CustosDescShort;
	      }
	    }
	  }]);
	
	  return Custos;
	}(_ExsurgeDrawing.ChantNotationElement);
	
	/*
	 * Divider
	 */
	
	
	var Divider = exports.Divider = function (_ChantNotationElement2) {
	  _inherits(Divider, _ChantNotationElement2);
	
	  function Divider() {
	    _classCallCheck(this, Divider);
	
	    var _this2 = _possibleConstructorReturn(this, (Divider.__proto__ || Object.getPrototypeOf(Divider)).call(this));
	
	    _this2.isDivider = true;
	    _this2.resetsAccidentals = true;
	    return _this2;
	  }
	
	  return Divider;
	}(_ExsurgeDrawing.ChantNotationElement);
	
	/*
	 * QuarterBar
	 */
	
	
	var QuarterBar = exports.QuarterBar = function (_Divider) {
	  _inherits(QuarterBar, _Divider);
	
	  function QuarterBar() {
	    _classCallCheck(this, QuarterBar);
	
	    return _possibleConstructorReturn(this, (QuarterBar.__proto__ || Object.getPrototypeOf(QuarterBar)).apply(this, arguments));
	  }
	
	  _createClass(QuarterBar, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(QuarterBar.prototype.__proto__ || Object.getPrototypeOf(QuarterBar.prototype), "performLayout", this).call(this, ctxt);
	      this.addVisualizer(new _ExsurgeDrawing.DividerLineVisualizer(ctxt, 2, 4, this));
	
	      this.origin.x = this.bounds.width / 2;
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return QuarterBar;
	}(Divider);
	
	/*
	 * HalfBar
	 */
	
	
	var HalfBar = exports.HalfBar = function (_Divider2) {
	  _inherits(HalfBar, _Divider2);
	
	  function HalfBar() {
	    _classCallCheck(this, HalfBar);
	
	    return _possibleConstructorReturn(this, (HalfBar.__proto__ || Object.getPrototypeOf(HalfBar)).apply(this, arguments));
	  }
	
	  _createClass(HalfBar, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(HalfBar.prototype.__proto__ || Object.getPrototypeOf(HalfBar.prototype), "performLayout", this).call(this, ctxt);
	
	      this.addVisualizer(new _ExsurgeDrawing.DividerLineVisualizer(ctxt, -2, 2, this));
	
	      this.origin.x = this.bounds.width / 2;
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return HalfBar;
	}(Divider);
	
	/*
	 * FullBar
	 */
	
	
	var FullBar = exports.FullBar = function (_Divider3) {
	  _inherits(FullBar, _Divider3);
	
	  function FullBar() {
	    _classCallCheck(this, FullBar);
	
	    return _possibleConstructorReturn(this, (FullBar.__proto__ || Object.getPrototypeOf(FullBar)).apply(this, arguments));
	  }
	
	  _createClass(FullBar, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(FullBar.prototype.__proto__ || Object.getPrototypeOf(FullBar.prototype), "performLayout", this).call(this, ctxt);
	
	      this.addVisualizer(new _ExsurgeDrawing.DividerLineVisualizer(ctxt, -3, 3, this));
	
	      this.origin.x = this.bounds.width / 2;
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return FullBar;
	}(Divider);
	
	/*
	 * Insertion Cursor
	 */
	
	
	var InsertionCursor = exports.InsertionCursor = function (_Divider4) {
	  _inherits(InsertionCursor, _Divider4);
	
	  function InsertionCursor() {
	    _classCallCheck(this, InsertionCursor);
	
	    return _possibleConstructorReturn(this, (InsertionCursor.__proto__ || Object.getPrototypeOf(InsertionCursor)).apply(this, arguments));
	  }
	
	  _createClass(InsertionCursor, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(InsertionCursor.prototype.__proto__ || Object.getPrototypeOf(InsertionCursor.prototype), "performLayout", this).call(this, ctxt);
	
	      this.addVisualizer(new _ExsurgeDrawing.DividerLineVisualizer(ctxt, -4, 4));
	
	      this.origin.x = this.bounds.width / 2;
	      this.bounds.width = 0;
	      this.bounds.height = 0;
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return InsertionCursor;
	}(Divider);
	
	/*
	 * DominicanBar
	 */
	
	
	var DominicanBar = exports.DominicanBar = function (_Divider5) {
	  _inherits(DominicanBar, _Divider5);
	
	  function DominicanBar(staffPosition) {
	    _classCallCheck(this, DominicanBar);
	
	    var _this7 = _possibleConstructorReturn(this, (DominicanBar.__proto__ || Object.getPrototypeOf(DominicanBar)).call(this));
	
	    staffPosition--;
	    var parity = staffPosition % 2;
	
	    _this7.staffPosition = staffPosition - 2 * parity;
	    return _this7;
	  }
	
	  _createClass(DominicanBar, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(DominicanBar.prototype.__proto__ || Object.getPrototypeOf(DominicanBar.prototype), "performLayout", this).call(this, ctxt);
	      this.addVisualizer(new _ExsurgeDrawing.DividerLineVisualizer(ctxt, this.staffPosition - 3, this.staffPosition, this));
	
	      this.origin.x = this.bounds.width / 2;
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return DominicanBar;
	}(Divider);
	
	/*
	 * DoubleBar
	 */
	
	
	var DoubleBar = exports.DoubleBar = function (_Divider6) {
	  _inherits(DoubleBar, _Divider6);
	
	  function DoubleBar() {
	    _classCallCheck(this, DoubleBar);
	
	    return _possibleConstructorReturn(this, (DoubleBar.__proto__ || Object.getPrototypeOf(DoubleBar)).apply(this, arguments));
	  }
	
	  _createClass(DoubleBar, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(DoubleBar.prototype.__proto__ || Object.getPrototypeOf(DoubleBar.prototype), "performLayout", this).call(this, ctxt);
	
	      var line0 = new _ExsurgeDrawing.DividerLineVisualizer(ctxt, -3, 3, this);
	      line0.bounds.x = 0;
	      this.addVisualizer(line0);
	
	      var line1 = new _ExsurgeDrawing.DividerLineVisualizer(ctxt, -3, 3, this);
	      line1.bounds.x = ctxt.intraNeumeSpacing * 2 - line1.bounds.width;
	      this.addVisualizer(line1);
	
	      this.origin.x = this.bounds.width / 2;
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return DoubleBar;
	}(Divider);
	
	var AccidentalType = exports.AccidentalType = {
	  Flat: -1,
	  Natural: 0,
	  Sharp: 1
	};
	
	/*
	 * Accidental
	 */
	
	var Accidental = exports.Accidental = function (_ChantNotationElement3) {
	  _inherits(Accidental, _ChantNotationElement3);
	
	  function Accidental(staffPosition, accidentalType) {
	    _classCallCheck(this, Accidental);
	
	    var _this9 = _possibleConstructorReturn(this, (Accidental.__proto__ || Object.getPrototypeOf(Accidental)).call(this));
	
	    _this9.isAccidental = true;
	    _this9.keepWithNext = true; // accidentals should always stay connected...
	
	    _this9.staffPosition = staffPosition;
	    _this9.accidentalType = accidentalType;
	    return _this9;
	  }
	
	  _createClass(Accidental, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Accidental.prototype.__proto__ || Object.getPrototypeOf(Accidental.prototype), "performLayout", this).call(this, ctxt);
	
	      this.addVisualizer(this.createGlyphVisualizer(ctxt));
	
	      this.finishLayout(ctxt);
	    }
	
	    // creation of the glyph visualizer is refactored out or performLayout
	    // so that clefs can use the same logic for their accidental glyph
	
	  }, {
	    key: "createGlyphVisualizer",
	    value: function createGlyphVisualizer(ctxt) {
	      var glyphCode = _ExsurgeDrawing.GlyphCode.Flat;
	
	      switch (this.accidentalType) {
	        case AccidentalType.Natural:
	          glyphCode = _ExsurgeDrawing.GlyphCode.Natural;
	          break;
	        case AccidentalType.Sharp:
	          glyphCode = _ExsurgeDrawing.GlyphCode.Sharp;
	          break;
	        default:
	          glyphCode = _ExsurgeDrawing.GlyphCode.Flat;
	          break;
	      }
	
	      var glyph = new _ExsurgeDrawing.GlyphVisualizer(ctxt, glyphCode);
	      glyph.setStaffPosition(ctxt, this.staffPosition);
	
	      return glyph;
	    }
	  }, {
	    key: "adjustStep",
	    value: function adjustStep(step) {
	      switch (this.accidentalType) {
	        case AccidentalType.Flat:
	          if (step === _ExsurgeCore.Step.Ti) return _ExsurgeCore.Step.Te;
	          if (step === _ExsurgeCore.Step.Mi) return _ExsurgeCore.Step.Me;
	          break;
	        case AccidentalType.Sharp:
	          if (step === _ExsurgeCore.Step.Do) return _ExsurgeCore.Step.Du;
	          if (step === _ExsurgeCore.Step.Fa) return _ExsurgeCore.Step.Fu;
	          break;
	        case AccidentalType.Natural:
	          if (step === _ExsurgeCore.Step.Te) return _ExsurgeCore.Step.Ti;
	          if (step === _ExsurgeCore.Step.Me) return _ExsurgeCore.Step.Mi;
	          if (step === _ExsurgeCore.Step.Du) return _ExsurgeCore.Step.Do;
	          if (step === _ExsurgeCore.Step.Fu) return _ExsurgeCore.Step.Fa;
	          break;
	      }
	
	      // no adjustment needed
	      return step;
	    }
	  }, {
	    key: "applyToPitch",
	    value: function applyToPitch(pitch) {
	      // no adjusment needed
	      if (this.pitch.octave !== pitch.octave) return;
	
	      pitch.step = this.adjustStep(pitch.step);
	    }
	  }]);
	
	  return Accidental;
	}(_ExsurgeDrawing.ChantNotationElement);
	
	/*
	 * Virgula
	 */
	
	
	var Virgula = exports.Virgula = function (_Divider7) {
	  _inherits(Virgula, _Divider7);
	
	  function Virgula() {
	    _classCallCheck(this, Virgula);
	
	    // unlike other dividers a virgula does not reset accidentals
	    var _this10 = _possibleConstructorReturn(this, (Virgula.__proto__ || Object.getPrototypeOf(Virgula)).call(this));
	
	    _this10.resetsAccidentals = false;
	
	    // the staff position of the virgula is customizable, so that it
	    // can be placed on different lines (top or bottom) depending on the
	    // notation tradition of what is being notated (e.g., Benedictine has it
	    //  on top line, Norbertine at the bottom)
	    _this10.staffPosition = 3;
	    return _this10;
	  }
	
	  _createClass(Virgula, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Virgula.prototype.__proto__ || Object.getPrototypeOf(Virgula.prototype), "performLayout", this).call(this, ctxt);
	
	      var glyph = new _ExsurgeDrawing.GlyphVisualizer(ctxt, _ExsurgeDrawing.GlyphCode.Virgula);
	      glyph.setStaffPosition(ctxt, this.staffPosition);
	
	      this.addVisualizer(glyph);
	
	      this.origin.x = this.bounds.width / 2;
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Virgula;
	}(Divider);

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Gabc = exports.GabcHeader = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //
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
	
	var _ExsurgeCore = __webpack_require__(1);
	
	var _ExsurgeDrawing = __webpack_require__(4);
	
	var _ExsurgeChant = __webpack_require__(8);
	
	var _ExsurgeChantMarkings = __webpack_require__(10);
	
	var Markings = _interopRequireWildcard(_ExsurgeChantMarkings);
	
	var _ExsurgeChantSigns = __webpack_require__(11);
	
	var Signs = _interopRequireWildcard(_ExsurgeChantSigns);
	
	var _ExsurgeChantNeumes = __webpack_require__(13);
	
	var Neumes = _interopRequireWildcard(_ExsurgeChantNeumes);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	// reusable reg exps
	var __syllablesRegex = /(?=\S)((?:<v>[\s\S]*<\/v>|[^(])*)(?:\(?([^)]*)\)?)?/g;
	var __altTranslationRegex = /<alt>(.*?)<\/alt>|\[(alt:)?(.*?)\]/g;
	
	var __notationsRegex = /z0|z|Z|::|:|[,;][1-6]?|`|[cf][1-4]|cb[1-4]|\/+| |\!|-?[a-mA-M][oOwWvVrRsxy#~\+><_\.'012345]*(?:\[[^\]]*\]?)*|\{([^}]+)\}?/g;
	var __notationsRegex_group_insideBraces = 1;
	
	var __bracketedCommandRegex = /^([a-z]+):(.*)/;
	
	// for the brace string inside of [ and ] in notation data
	// the capturing groups are:
	//  1. o or u, to indicate over or under
	//  2. b, cb, or cba, to indicate the brace type
	//  3. 0 or 1 to indicate the attachment point
	//  4. { or } to indicate opening/closing (this group will be null if the metric version is used)
	//  5. a float indicating the millimeter length of the brace (not supported yet)
	var __braceSpecRegex = /([ou])(b|cb|cba):([01])(?:([{}])|;(\d*(?:\.\d+)?)mm)/;
	
	var TrailingSpaceForAccidental = function TrailingSpaceForAccidental(ctxt) {
	  return ctxt.intraNeumeSpacing * ctxt.accidentalSpaceMultiplier;
	};
	var TrailingSpaceMultiple = function TrailingSpaceMultiple(multiplier) {
	  return function (ctxt) {
	    return ctxt.intraNeumeSpacing * multiplier;
	  };
	};
	
	var regexHeaderEnd = /(?:^|\n)%%\s?\n/;
	var regexHeaderLine = /^([\w-_.]+):\s*((?:[^;\r\n]|;[ \t])*)(?:;|$)/i;
	var regexHeaderComment = /^%.*/;
	
	var GabcHeader = exports.GabcHeader = function () {
	  _createClass(GabcHeader, null, [{
	    key: "getLength",
	    value: function getLength(gabc) {
	      var match = gabc.match(regexHeaderEnd);
	      return match ? match.index + match[0].length : 0;
	    }
	  }]);
	
	  function GabcHeader(text) {
	    _classCallCheck(this, GabcHeader);
	
	    if (typeof text !== "string") text = "";
	    this.comments = [];
	    this.cValues = {};
	    this.original = "";
	    var match = text.match(regexHeaderEnd);
	    if (match) {
	      var txtHeader = this.original = text.slice(0, match.index + match[0].length);
	      var lines = txtHeader.split(/\r?\n/g);
	      for (var i = 0; i < lines.length; ++i) {
	        var line = lines[i],
	            _match = regexHeaderLine.exec(line);
	        if (_match) {
	          var key = _match[1].replace(/-([a-z])/g, function (a, letter) {
	            return letter.toUpperCase();
	          });
	          if (this[_match[1]]) {
	            var arrayName = _match[1] + "Array";
	            if (!this[arrayName]) {
	              this[arrayName] = [this[_match[1]]];
	            }
	            this[arrayName].push(_match[2]);
	          } else {
	            this[_match[1]] = _match[2];
	          }
	          if (key !== _match[1]) this[key] = this[_match[1]];
	        } else if (_match = regexHeaderComment.exec(line)) {
	          if (line !== "%%") {
	            _match = regexHeaderLine.exec(line.slice(1));
	            if (_match) {
	              var _key = _match[1].replace(/-([a-z])/g, function (a, letter) {
	                return letter.toUpperCase();
	              });
	              this.cValues[_match[1]] = _match[2];
	              if (_key !== _match[1]) this.cValues[_key] = _match[2];
	            } else {
	              this.comments[i] = line;
	            }
	          }
	        }
	      }
	    }
	  }
	
	  _createClass(GabcHeader, [{
	    key: "toString",
	    value: function toString() {
	      var result = [];
	      for (var key in this) {
	        if (typeof this[key] !== "string" || /^(length|original|comments|cValues)$/.test(key)) {
	          continue;
	        }
	        var alternateKey = key.replace(/[A-Z]/g, function (letter) {
	          return "-" + letter.toLowerCase();
	        });
	        if (alternateKey !== key && alternateKey in this) continue;
	        var array = this[key + "Array"];
	        if (array) {
	          for (var i = 0; i < array.length; ++i) {
	            result.push(key + ": " + array[i] + ";");
	          }
	        } else {
	          result.push(key + ": " + this[key] + ";");
	        }
	      }
	      for (var _key2 in this.cValues) {
	        if (_key2.length === 0 || !this.cValues.hasOwnProperty(_key2)) continue;
	        result.push("%" + _key2 + ": " + this.cValues[_key2] + ";");
	      }
	      for (var _i in this.comments) {
	        if (!this.comments.hasOwnProperty(_i)) continue;
	        try {
	          result.splice(_i, 0, this.comments[_i]);
	        } catch (e) {
	          console.warn(e);
	        }
	      }
	      return result.join("\n") + "\n%%\n";
	    }
	  }]);
	
	  return GabcHeader;
	}();
	
	var elementCountForNotations = function elementCountForNotations(items) {
	  return items.reduce(function (sum, item) {
	    return sum + (item.notes ? item.notes.length : 1);
	  }, 0);
	};
	
	var Gabc = exports.Gabc = function () {
	  function Gabc() {
	    _classCallCheck(this, Gabc);
	  }
	
	  _createClass(Gabc, null, [{
	    key: "createMappingsFromSource",
	
	    // takes gabc source code (without the header info) and returns an array
	    // of ChantMappings describing the chant. A chant score can then be created
	    // fron the chant mappings and later updated via updateMappings() if need
	    // be...
	    value: function createMappingsFromSource(ctxt, gabcSource) {
	      var headerLength = GabcHeader.getLength(gabcSource);
	      gabcSource = gabcSource.slice(headerLength);
	      var words = this.splitWords(gabcSource);
	
	      // set the default clef
	      ctxt.activeClef = _ExsurgeChant.Clef.default();
	
	      var mappings = this.createMappingsFromWords(ctxt, words, function (clef) {
	        return ctxt.activeClef = clef;
	      });
	
	      // always set the last notation to have a trailingSpace of 0. This makes layout for the last chant line simpler
	      if (mappings.length > 0 && mappings[mappings.length - 1].notations.length > 0) mappings[mappings.length - 1].notations[mappings[mappings.length - 1].notations.length - 1].trailingSpace = 0;
	
	      return mappings;
	    }
	
	    // A simple general purpose diff algorithm adapted here for comparing
	    // an array of existing mappings with an updated list of gabc words.
	    // note before is an array of mappings, and after is an array of strings
	    // (gabc words).
	    //
	    // This is definitely not the most effecient diff algorithm, but for our
	    // limited needs and source size it seems to work just fine...
	    //
	    // code is adapted from: https://github.com/paulgb/simplediff
	    //
	    // Returns:
	    //   A list of pairs, with the first part of the pair being one of three
	    //   strings ('-', '+', '=') and the second part being a list of values from
	    //   the original before and/or after lists. The first part of the pair
	    //   corresponds to whether the list of values is a deletion, insertion, or
	    //   unchanged, respectively.
	
	  }, {
	    key: "diffDescriptorsAndNewWords",
	    value: function diffDescriptorsAndNewWords(before, after) {
	      // Create a map from before values to their indices
	      var oldIndexMap = {},
	          i;
	      for (i = 0; i < before.length; i++) {
	        oldIndexMap[before[i].source] = oldIndexMap[before[i].source] || [];
	        oldIndexMap[before[i].source].push(i);
	      }
	
	      var overlap = [],
	          startOld,
	          startNew,
	          subLength,
	          inew;
	
	      startOld = startNew = subLength = 0;
	
	      for (inew = 0; inew < after.length; inew++) {
	        var _overlap = [];
	        oldIndexMap[after[inew]] = oldIndexMap[after[inew]] || [];
	        for (i = 0; i < oldIndexMap[after[inew]].length; i++) {
	          var iold = oldIndexMap[after[inew]][i];
	          // now we are considering all values of val such that
	          // `before[iold] == after[inew]`
	          _overlap[iold] = (iold && overlap[iold - 1] || 0) + 1;
	          if (_overlap[iold] > subLength) {
	            // this is the largest substring seen so far, so store its indices
	            subLength = _overlap[iold];
	            startOld = iold - subLength + 1;
	            startNew = inew - subLength + 1;
	          }
	        }
	        overlap = _overlap;
	      }
	
	      if (subLength === 0) {
	        // If no common substring is found, we return an insert and delete...
	        var result = [];
	
	        if (before.length) result.push(["-", before]);
	
	        if (after.length) result.push(["+", after]);
	
	        return result;
	      }
	
	      // ...otherwise, the common substring is unchanged and we recursively
	      // diff the text before and after that substring
	      return [].concat(this.diffDescriptorsAndNewWords(before.slice(0, startOld), after.slice(0, startNew)), [["=", after.slice(startNew, startNew + subLength)]], this.diffDescriptorsAndNewWords(before.slice(startOld + subLength), after.slice(startNew + subLength)));
	    }
	
	    // this function essentially performs and applies a rudimentary diff between a
	    // previously parsed set of mappings and between a new gabc source text.
	    // the mappings array passed in is changed in place to be updated from the
	    // new source
	
	  }, {
	    key: "updateMappingsFromSource",
	    value: function updateMappingsFromSource(ctxt, mappings, newGabcSource) {
	      var insertionIndex = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	      var oldInsertionIndex = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
	
	      var headerLength = GabcHeader.getLength(newGabcSource);
	      newGabcSource = newGabcSource.slice(headerLength);
	      // always remove the last old mapping since it's spacing/trailingSpace is handled specially
	      mappings.pop();
	
	      if (insertionIndex === null) {
	        insertionIndex = NaN;
	      }
	      if (oldInsertionIndex === null) {
	        oldInsertionIndex = NaN;
	      }
	
	      var newWords = this.splitWords(newGabcSource);
	
	      var results = this.diffDescriptorsAndNewWords(mappings, newWords);
	
	      var index = 0,
	          j,
	          k,
	          l,
	          sourceIndex = 0,
	          wordLength = 0,
	          mapping,
	          elementIndex = 0;
	
	      ctxt.activeClef = _ExsurgeChant.Clef.default();
	
	      // apply the results to the mappings, marking notations that need to be processed
	      var lastTranslationNeumes = [];
	      for (var i = 0; i < results.length; i++) {
	        var resultCode = results[i][0];
	        var resultValues = results[i][1];
	
	        if (index > 0) sourceIndex = mappings[index - 1].sourceIndex + mappings[index - 1].source.length + 1;
	        if (resultCode === "=") {
	          var sourceIndexDiff = sourceIndex - mappings[index].sourceIndex;
	          // skip over ones that haven't changed, but updating the clef and source
	          // index (and pitch in case clef or accidentals have changed) as we go
	          for (j = 0; j < resultValues.length; j++, index++) {
	            mapping = mappings[index];
	            if (elementIndex === 0 && mapping.notations.length && mapping.notations[0].isClef) {
	              // the first clef doesn't get kept as a notation:
	              elementIndex = -1;
	            }
	            if (insertionIndex >= elementIndex || oldInsertionIndex >= elementIndex) {
	              // check if the insertion index is within this mapping:
	              var elementCount = elementCountForNotations(mapping.notations);
	              if (insertionIndex >= elementIndex && insertionIndex < elementIndex + elementCount || oldInsertionIndex >= elementIndex && oldInsertionIndex < elementIndex + elementCount) {
	                // re-do this mapping:
	                // TODO: check sourceIndex
	                var _sourceIndex = mapping.sourceIndex + sourceIndexDiff;
	                mapping = this.createMappingFromWord(ctxt, resultValues[j], _sourceIndex, lastTranslationNeumes, insertionIndex - elementIndex);
	                mappings.splice(index, 1, mapping);
	
	                elementIndex += elementCount;
	                continue;
	              }
	              elementIndex += elementCount;
	            }
	            mapping.sourceIndex += sourceIndexDiff;
	            for (k = 0; k < mapping.notations.length; k++) {
	              var curNotation = mapping.notations[k];
	              var prevIsAccidental = mapping.notations[k - 1] && mapping.notations[k - 1].isAccidental;
	              // notify the notation that its dependencies are no longer valid
	              curNotation.resetDependencies();
	
	              if (curNotation.isClef) {
	                ctxt.activeClef = mappings[index].notations[k];
	              }
	
	              if (curNotation.isAccidental) {
	                ctxt.activeClef.activeAccidental = curNotation;
	              } else if (curNotation.resetsAccidentals || !prevIsAccidental && curNotation.hasLyrics() && curNotation.lyrics[0].lyricType <= _ExsurgeDrawing.LyricType.BeginningSyllable) {
	                ctxt.activeClef.resetAccidentals();
	              }
	
	              // update source index, pitch, and automatic braces
	              if (curNotation.notes) {
	                for (l = 0; l < curNotation.notes.length; ++l) {
	                  var note = curNotation.notes[l];
	                  note.sourceIndex += sourceIndexDiff;
	                  note.pitch = ctxt.activeClef.staffPositionToPitch(note.staffPosition);
	                  if (note.braceEnd && note.braceEnd.automatic) delete note.braceEnd;
	                  if (this.needToEndBrace && !note.braceStart && !note.braceEnd) {
	                    note.braceEnd = new Markings.BracePoint(note, this.needToEndBrace.isAbove, this.needToEndBrace.shape, this.needToEndBrace.attachment === Markings.BraceAttachment.Left ? Markings.BraceAttachment.Right : Markings.BraceAttachment.Left);
	                    note.braceEnd.automatic = true;
	                    delete this.needToEndBrace;
	                  } else if (note.braceStart && note.braceStart.automatic) {
	                    this.needToEndBrace = note.braceStart;
	                  }
	                }
	              }
	              if (curNotation.translationText) {
	                for (l = 0; l < curNotation.translationText.length; ++l) {
	                  var transText = curNotation.translationText[l];
	                  delete transText.endNeume;
	                  curNotation.translationText[l].sourceIndex += sourceIndexDiff;
	                  if (transText.textAnchor === "end" && lastTranslationNeumes[0]) {
	                    var lastTranslationText = lastTranslationNeumes[0].translationText[l];
	                    if (lastTranslationText) lastTranslationText.endNeume = curNotation;
	                  }
	                }
	                lastTranslationNeumes[0] = curNotation;
	              }
	              if (sourceIndexDiff) {
	                if (typeof curNotation.sourceIndex === "number") {
	                  curNotation.sourceIndex += sourceIndexDiff;
	                }
	                for (l = 0; l < curNotation.lyrics.length; ++l) {
	                  curNotation.lyrics[l].sourceIndex += sourceIndexDiff;
	                }
	                if (curNotation.alText) {
	                  for (l = 0; l < curNotation.alText.length; ++l) {
	                    curNotation.alText[l].sourceIndex += sourceIndexDiff;
	                  }
	                }
	              }
	            }
	          }
	        } else if (resultCode === "-") {
	          // delete elements that no longer exist, but first notify all
	          // elements of the change
	          mappings.splice(index, resultValues.length);
	        } else if (resultCode === "+") {
	          // insert new ones
	          for (j = 0; j < resultValues.length; j++) {
	            wordLength = resultValues[j].length + 1;
	            mapping = this.createMappingFromWord(ctxt, resultValues[j], sourceIndex, lastTranslationNeumes, insertionIndex - elementIndex);
	
	            if (elementIndex === 0 && mapping.notations.length && mapping.notations[0].isClef) {
	              // the first clef doesn't get kept as a notation:
	              elementIndex = -1;
	              var _elementCount = elementCountForNotations(mapping.notations);
	              if (insertionIndex < _elementCount) {
	                // re-do the first mapping, because it was broken up incorrectly, due to the presence of the initial clef
	                mapping = this.createMappingFromWord(ctxt, resultValues[j], sourceIndex, lastTranslationNeumes, insertionIndex - elementIndex);
	              }
	            }
	
	            for (k = 0; k < mapping.notations.length; k++) {
	              var _curNotation = mapping.notations[k];
	              elementIndex += _curNotation.notes ? _curNotation.notes.length : 1;
	              if (_curNotation.isClef) {
	                ctxt.activeClef = mapping.notations[k];
	              }
	            }
	
	            mappings.splice(index++, 0, mapping);
	            sourceIndex += wordLength;
	          }
	        }
	      }
	
	      // always set the last notation to have a trailingSpace of 0. This makes layout for the last chant line simpler
	      if (mappings.length > 0 && mappings[mappings.length - 1].notations.length > 0) mappings[mappings.length - 1].notations[mappings[mappings.length - 1].notations.length - 1].trailingSpace = 0;
	
	      return headerLength;
	    }
	
	    // takes an array of gabc words (like that returned by splitWords below)
	    // and returns an array of ChantMapping objects, one for each word.
	
	  }, {
	    key: "createMappingsFromWords",
	    value: function createMappingsFromWords(ctxt, words) {
	      var mappings = [];
	      var sourceIndex = 0,
	          wordLength = 0,
	          lastTranslationNeumes = [];
	
	      for (var i = 0; i < words.length; i++) {
	        sourceIndex += wordLength;
	        wordLength = words[i].length + 1;
	        var word = words[i].trim();
	
	        if (word === "") continue;
	
	        var mapping = this.createMappingFromWord(ctxt, word, sourceIndex, lastTranslationNeumes);
	
	        if (mapping) mappings.push(mapping);
	      }
	
	      return mappings;
	    }
	
	    // takes a gabc word (like those returned by splitWords below) and returns
	    // a ChantMapping object that contains the gabc word source text as well
	    // as the generated notations.
	
	  }, {
	    key: "createMappingFromWord",
	    value: function createMappingFromWord(ctxt, word, sourceIndex, lastTranslationNeumes, insertionIndex) {
	      var matches = [];
	      var notations = [];
	      var currSyllable = 0;
	
	      while (match = __syllablesRegex.exec(word)) {
	        matches.push(match);
	      }for (var j = 0; j < matches.length; j++) {
	        var match = matches[j];
	
	        var lyricText = match[1].replace(/(^|<\/sp>)([\s\S]*?)($|<sp>)/g, function (_, pre, main, post) {
	          return "" + pre + main.replace(/~/g, " ") + post;
	        });
	        var alText = [];
	        var translationText = [];
	        var notationData = match[2];
	
	        // new words reset the accidentals, per the Solesmes style (see LU xviij)
	        // but we need to also make sure that there _is_ a word and that it has notes associated with it.
	        if (currSyllable === 0 && /[a-z]/i.test(lyricText) && /[a-m]/i.test(notationData)) ctxt.activeClef.resetAccidentals();
	
	        var items = this.parseNotations(ctxt, notationData, sourceIndex + match.index + match[1].length + 1, insertionIndex);
	
	        if (items.length === 0) continue;
	
	        if (insertionIndex >= 0) insertionIndex -= elementCountForNotations(items);
	
	        items[0].firstOfSyllable = !!lyricText;
	        items[0].firstOfParentheses = true;
	        notations.push.apply(notations, _toConsumableArray(items));
	
	        // add the lyrics and/or alText to the first notation that makes sense...
	        var notationWithLyrics = null;
	        for (var i = 0; i < items.length; i++) {
	          var cne = items[i];
	
	          if (cne.isAccidental && i + 1 < items.length) continue;
	
	          notationWithLyrics = cne;
	          break;
	        }
	
	        var m = __altTranslationRegex.exec();
	        var indexOffset = 0;
	        while (m = __altTranslationRegex.exec(lyricText)) {
	          var index = m.index;
	          lyricText = lyricText.slice(0, index) + lyricText.slice(index + m[0].length);
	          index += sourceIndex + indexOffset + 1;
	          if (typeof m[1] === "string") {
	            var elem = new _ExsurgeDrawing.AboveLinesText(ctxt, m[1], notationWithLyrics, index + 4);
	            elem.alIndex = alText.push(elem) - 1;
	          } else if (typeof m[2] === "string") {
	            var _elem = new _ExsurgeDrawing.AboveLinesText(ctxt, m[3], notationWithLyrics, index + m[2].length);
	            _elem.alIndex = alText.push(_elem) - 1;
	          } else {
	            var _elem2 = new _ExsurgeDrawing.TranslationText(ctxt, m[3], notationWithLyrics, index);
	            _elem2.translationIndex = translationText.push(_elem2) - 1;
	          }
	          indexOffset += m[0].length;
	          __altTranslationRegex.exec();
	        }
	        if (lyricText === "" && alText.length === 0) continue;
	
	        if (notationWithLyrics === null) return new _ExsurgeChant.ChantMapping(word, notations, sourceIndex);
	
	        if (alText.length) notationWithLyrics.alText = alText;
	
	        if (translationText.length) {
	          notationWithLyrics.translationText = translationText;
	          for (i = 0; i < translationText.length; ++i) {
	            var transText = translationText[i];
	            if (transText.textAnchor === "end" && lastTranslationNeumes[0]) {
	              var lastTranslationText = lastTranslationNeumes[0].translationText[i];
	              if (lastTranslationText) lastTranslationText.endNeume = notationWithLyrics;
	            }
	          }
	          lastTranslationNeumes[0] = notationWithLyrics;
	        }
	
	        if (lyricText === "") continue;
	
	        var proposedLyricType;
	
	        // if it's not a neume or a TextOnly notation, then make the lyrics a directive
	        if (!cne.isNeume && cne.constructor !== _ExsurgeChant.TextOnly) proposedLyricType = _ExsurgeDrawing.LyricType.Directive;
	        // otherwise trye to guess the lyricType for the first lyric anyway
	        else if (currSyllable === 0 && j === matches.length - 1) proposedLyricType = _ExsurgeDrawing.LyricType.SingleSyllable;else if (currSyllable === 0 && j < matches.length - 1) proposedLyricType = _ExsurgeDrawing.LyricType.BeginningSyllable;else if (j === matches.length - 1) proposedLyricType = _ExsurgeDrawing.LyricType.EndingSyllable;else proposedLyricType = _ExsurgeDrawing.LyricType.MiddleSyllable;
	
	        currSyllable++;
	
	        var lyrics = this.createSyllableLyrics(ctxt, lyricText, proposedLyricType, notationWithLyrics, items, sourceIndex + match.index);
	
	        if (lyrics === null || lyrics.length === 0) continue;
	
	        notationWithLyrics.lyrics = lyrics;
	      }
	
	      return new _ExsurgeChant.ChantMapping(word, notations, sourceIndex);
	    }
	
	    // returns an array of lyrics (an array because each syllable can have multiple lyrics)
	
	  }, {
	    key: "createSyllableLyrics",
	    value: function createSyllableLyrics(ctxt, text, proposedLyricType, notation, notations, sourceIndex) {
	      var _this = this;
	
	      var lyrics = [];
	
	      // an extension to gabc: multiple lyrics per syllable can be separated by a |
	      var lyricTexts = text.split("|");
	
	      var _loop = function _loop() {
	        lyricText = lyricTexts[i];
	
	
	        if (i > 0) {
	          if (lyricText.match(/\s$/)) {
	            lyricText = lyricText.replace(/s+$/, "");
	            proposedLyricType = _ExsurgeDrawing.LyricType.EndingSyllable;
	          } else {
	            proposedLyricType = _ExsurgeDrawing.LyricType.MiddleSyllable;
	          }
	        }
	
	        // gabc allows lyrics to indicate the centering part of the text by
	        // using braces to indicate how to center the lyric. So a lyric can
	        // look like "f{i}re" or "{fenced}" to center on the i or on the entire
	        // word, respectively. Here we determine if the lyric should be spaced
	        // manually with this method of using braces.
	        // however, we don't want to consider any braces inside of v tags, so we
	        // do a bit of text processing here:
	        lyricTextWithoutVTags = lyricText;
	
	        var vtagRegex = /<v>[\s\S]*?<\/v>/;
	        var match = void 0;
	        var vtags = [];
	        while (match = vtagRegex.exec(lyricTextWithoutVTags)) {
	          var index = match.index;
	          var length = match[0].length;
	          vtags[index] = length;
	          lyricTextWithoutVTags = lyricTextWithoutVTags.slice(0, index) + lyricTextWithoutVTags.slice(index + length);
	        }
	        centerStartIndex = lyricTextWithoutVTags.indexOf("{");
	        centerLength = 0;
	
	
	        if (centerStartIndex >= 0) {
	          var indexClosingBracket = lyricTextWithoutVTags.indexOf("}");
	
	          if (indexClosingBracket >= 0 && indexClosingBracket > centerStartIndex) {
	            var getTrueIndex = function getTrueIndex(indexWithoutVTags) {
	              // map indices back to the lyricText with the V tags:
	              var accum = 0;
	              for (var _index in vtags) {
	                if (vtags.hasOwnProperty(_index) && indexWithoutVTags >= _index) {
	                  accum += vtags[_index];
	                } else {
	                  break;
	                }
	              }
	              return indexWithoutVTags + accum;
	            };
	            centerStartIndex = getTrueIndex(centerStartIndex);
	            indexClosingBracket = getTrueIndex(indexClosingBracket);
	            centerLength = indexClosingBracket - centerStartIndex - 1;
	
	            // strip out the brackets:
	            lyricText = lyricText.substring(0, centerStartIndex) + lyricText.substring(centerStartIndex + 1, indexClosingBracket) + lyricText.substring(indexClosingBracket + 1, lyricText.length);
	          } else centerStartIndex = -1; // if there's no closing bracket, don't enable centering
	        }
	
	        lyric = _this.makeLyric(ctxt, lyricText, proposedLyricType, notation, notations, sourceIndex);
	
	
	        if (centerStartIndex >= 0) {
	          // update indices in case there had been any tags, etc.
	          var textIndex = 0,
	              centerEndIndex = -1;
	          var _iteratorNormalCompletion = true;
	          var _didIteratorError = false;
	          var _iteratorError = undefined;
	
	          try {
	            for (var _iterator = lyric.spans[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	              var span = _step.value;
	
	              if (centerStartIndex >= span.index && centerStartIndex <= span.index + span.text.length) {
	                centerEndIndex = centerStartIndex + centerLength;
	                centerStartIndex += textIndex - span.index;
	              }
	              if (centerEndIndex >= 0 && centerEndIndex >= span.index && centerEndIndex <= span.index + span.text.length) {
	                centerEndIndex += textIndex - span.index;
	                centerLength = centerEndIndex - centerStartIndex;
	                centerEndIndex = -1;
	                break;
	              }
	              textIndex += span.text.length;
	            }
	          } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	              }
	            } finally {
	              if (_didIteratorError) {
	                throw _iteratorError;
	              }
	            }
	          }
	
	          if (centerEndIndex >= 0) {
	            centerEndIndex = textIndex;
	            centerLength = centerEndIndex - centerStartIndex;
	          }
	        }
	
	        // if we have manual lyric centering, then set it now
	        if (centerStartIndex >= 0) {
	          lyric.centerStartIndex = centerStartIndex;
	          lyric.centerLength = centerLength;
	        }
	
	        lyric.lyricIndex = lyrics.push(lyric) - 1;
	        sourceIndex += lyricText.length + 1;
	      };
	
	      for (var i = 0; i < lyricTexts.length; i++) {
	        var lyricText;
	        var lyricTextWithoutVTags;
	        var centerStartIndex;
	        var centerLength;
	        var lyric;
	
	        _loop();
	      }
	      notation.lyrics = lyrics;
	      return lyrics;
	    }
	  }, {
	    key: "makeLyric",
	    value: function makeLyric(ctxt, text, lyricType, notation, notations, sourceIndex) {
	      var elides = false;
	      var forceConnector = false;
	      if (text.length > 1) {
	        if (text[text.length - 1] === "-") {
	          forceConnector = true;
	          if (lyricType === _ExsurgeDrawing.LyricType.EndingSyllable) lyricType = _ExsurgeDrawing.LyricType.MiddleSyllable;else if (lyricType === _ExsurgeDrawing.LyricType.SingleSyllable) lyricType = _ExsurgeDrawing.LyricType.BeginningSyllable;
	
	          text = text.slice(0, -1);
	        } else if (text[text.length - 1] === " ") {
	          if (lyricType === _ExsurgeDrawing.LyricType.MiddleSyllable) lyricType = _ExsurgeDrawing.LyricType.EndingSyllable;else if (lyricType === _ExsurgeDrawing.LyricType.BeginningSyllable) lyricType = _ExsurgeDrawing.LyricType.SingleSyllable;
	
	          text = text.slice(0, -1);
	        } else if (/<\/i>$/.test(text)) {
	          // must be an elision
	          elides = true;
	        }
	      }
	
	      if (text.match(/^(?:[*†]+|i+j|\d+)\.?$/)) lyricType = _ExsurgeDrawing.LyricType.Directive;
	
	      var lyric = new _ExsurgeDrawing.Lyric(ctxt, text, lyricType, notation, notations, sourceIndex);
	      lyric.elidesToNext = elides;
	      if (forceConnector) lyric.setForceConnector(true);
	
	      return lyric;
	    }
	
	    // takes a string of gabc notations and creates exsurge objects out of them.
	    // returns an array of notations.
	
	  }, {
	    key: "parseNotations",
	    value: function parseNotations(ctxt, data, sourceIndex, insertionIndex) {
	      var _this2 = this;
	
	      // if there is no data, then this must be a text only object
	      if (!data) return [new _ExsurgeChant.TextOnly(sourceIndex, 0)];
	
	      var baseSourceIndex = sourceIndex;
	      var sourceLength = 0;
	      var notations = [];
	      var notes = [];
	      var trailingSpace = _ExsurgeDrawing.DefaultTrailingSpace;
	
	      var addToLastSourceGabc = function addToLastSourceGabc(gabc) {
	        if (notes.length > 0) {
	          notes[notes.length - 1].sourceGabc += gabc;
	        }
	      };
	      var addNotation = function addNotation(notation) {
	        // first, if we have any notes left over, we create a neume out of them
	        if (notes.length > 0) {
	          // create neume(s)
	          var neumes = _this2.createNeumesFromNotes(ctxt, notes, trailingSpace);
	          for (var i = 0; i < neumes.length; i++) {
	            notations.push(neumes[i]);
	          }notes = [];
	        }
	
	        // reset the trailing space
	        trailingSpace = _ExsurgeDrawing.DefaultTrailingSpace;
	
	        // then, if we're passed a notation, let's add it
	        // also, perform chant logic here
	        if (notation !== null) {
	          var prevNotation = notations[notations.length - 1];
	          notation.sourceIndex = sourceIndex;
	          notation.sourceGabc = match[0];
	          if (notation.isClef) {
	            ctxt.activeClef = notation;
	            if (prevNotation && prevNotation.trailingSpace.isDefault && prevNotation.isDivider) {
	              prevNotation.trailingSpace = TrailingSpaceForAccidental;
	            }
	          } else if (notation.isAccidental) {
	            ctxt.activeClef.activeAccidental = notation;
	          } else if (notation.trailingSpace.isDefault && notation instanceof Signs.Custos) {
	            notation.trailingSpace = TrailingSpaceForAccidental;
	          } else if (notation.resetsAccidentals) ctxt.activeClef.resetAccidentals();
	
	          notations.push(notation);
	        }
	      };
	
	      var regex = new RegExp(__notationsRegex.source, "g");
	      var match;
	
	      while (match = regex.exec(data)) {
	        sourceIndex = baseSourceIndex + match.index;
	        sourceLength = match[0].length;
	        var atom = match[0];
	
	        // handle the clefs and dividers here
	        switch (atom) {
	          case ",":
	            addNotation(new Signs.QuarterBar());
	            break;
	          case "`":
	            addNotation(new Signs.Virgula());
	            break;
	          case ";":
	            addNotation(new Signs.HalfBar());
	            break;
	          case ";1":
	          case ";2":
	          case ";3":
	          case ";4":
	          case ";5":
	          case ";6":
	          case ",1":
	          case ",2":
	          case ",3":
	          case ",4":
	          case ",5":
	          case ",6":
	            addNotation(new Signs.DominicanBar(parseInt(atom[1], 10)));
	            break;
	          case ":":
	            addNotation(new Signs.FullBar());
	            break;
	          case "::":
	            addNotation(new Signs.DoubleBar());
	            break;
	          // other gregorio dividers are not supported yet
	
	          case "c1":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.DoClef(-3, 2));
	            break;
	
	          case "c2":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.DoClef(-1, 2));
	            break;
	
	          case "c3":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.DoClef(1, 2));
	            break;
	
	          case "c4":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.DoClef(3, 2));
	            break;
	
	          case "f1":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.FaClef(-3, 2));
	            break;
	
	          case "f2":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.FaClef(-1, 2));
	            break;
	
	          case "f3":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.FaClef(1, 2));
	            break;
	
	          case "f4":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.FaClef(3, 2));
	            break;
	
	          case "cb1":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.DoClef(-3, 2, new Signs.Accidental(-4, Signs.AccidentalType.Flat)));
	            break;
	
	          case "cb2":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.DoClef(-1, 2, new Signs.Accidental(-2, Signs.AccidentalType.Flat)));
	            break;
	
	          case "cb3":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.DoClef(1, 2, new Signs.Accidental(0, Signs.AccidentalType.Flat)));
	            break;
	
	          case "cb4":
	            addNotation(ctxt.activeClef = new _ExsurgeChant.DoClef(3, 2, new Signs.Accidental(2, Signs.AccidentalType.Flat)));
	            break;
	
	          case "z":
	            addNotation(new _ExsurgeChant.ChantLineBreak(true));
	            break;
	          case "Z":
	            addNotation(new _ExsurgeChant.ChantLineBreak(false));
	            break;
	          case "z0":
	            addNotation(new Signs.Custos(true));
	            break;
	
	          // spacing indicators
	          case "!":
	            trailingSpace = 0;
	            addToLastSourceGabc(atom);
	            addNotation(null);
	            break;
	          case " ":
	            // fixme: is this correct? logically what is the difference in gabc
	            // between putting a space between notes vs putting '//' between notes?
	            trailingSpace = TrailingSpaceMultiple(2);
	            addToLastSourceGabc(atom);
	            addNotation(null);
	            break;
	
	          default:
	            // might be a number of slashes, a custos, might be an accidental, or might be a note
	            if (atom[0] === "/") {
	              trailingSpace = TrailingSpaceMultiple(atom.length);
	              addToLastSourceGabc(atom);
	              addNotation(null);
	            } else if (atom.length > 1 && atom[1] === "+") {
	              // custos
	              var custos = new Signs.Custos();
	
	              custos.staffPosition = this.gabcHeightToExsurgeHeight(atom[0]);
	
	              addNotation(custos);
	            } else if (atom.length > 1 && /[xy#]/.test(atom[1])) {
	              var accidentalType;
	
	              switch (atom[1]) {
	                case "y":
	                  accidentalType = Signs.AccidentalType.Natural;
	                  break;
	                case "#":
	                  accidentalType = Signs.AccidentalType.Sharp;
	                  break;
	                default:
	                  accidentalType = Signs.AccidentalType.Flat;
	                  break;
	              }
	
	              var noteArray = [];
	              this.createNoteFromData(ctxt, ctxt.activeClef, atom, noteArray, sourceIndex);
	              var accidental = new Signs.Accidental(noteArray[0].staffPosition, accidentalType);
	              accidental.pitch = this.gabcHeightToExsurgePitch(ctxt.activeClef, atom[0]);
	              accidental.sourceIndex = sourceIndex;
	              accidental.sourceLength = sourceLength;
	              accidental.trailingSpace = TrailingSpaceForAccidental;
	
	              ctxt.activeClef.activeAccidental = accidental;
	
	              addNotation(accidental);
	            } else if (atom.length > 1 && atom[0] === "{") {
	              (function () {
	                trailingSpace = 0;
	                addNotation(null);
	                var bracketedNotations = _this2.parseNotations(ctxt, match[__notationsRegex_group_insideBraces], sourceIndex + 1);
	                // Set the width of these notations to 0
	                bracketedNotations.forEach(function (neume) {
	                  neume.hasNoWidth = true;
	                  neume.firstWithNoWidth = bracketedNotations[0];
	                });
	                notations.push.apply(notations, _toConsumableArray(bracketedNotations));
	              })();
	            } else {
	              // looks like it's a note
	              if (insertionIndex === -1) {
	                trailingSpace = TrailingSpaceMultiple(1);
	                addNotation(null);
	              }
	              this.createNoteFromData(ctxt, ctxt.activeClef, atom, notes, sourceIndex);
	              --insertionIndex;
	            }
	            break;
	        }
	      }
	
	      // finish up any remaining notes we have left
	      addNotation(null);
	
	      return notations;
	    }
	  }, {
	    key: "createNeumesFromNotes",
	    value: function createNeumesFromNotes(ctxt, notes, finalTrailingSpace) {
	      var neumes = [];
	      var firstNoteIndex = 0;
	      var currNoteIndex = 0;
	
	      // here we use a simple finite state machine to create the neumes from the notes
	      // createNeume is helper function which returns the next state after a neume is created
	      // (unknownState). Each state object has a neume() function and a handle() function.
	      // neume() allows us to create the neume of the state in the event that we run out
	      // of notes. handle() gives the state an opportunity to examine the currNote and
	      // determine what to do...either transition to a different neume/state, or
	      // continue building the neume of that state. handle() returns the next state
	
	      var createNeume = function createNeume(neume, includeCurrNote) {
	        var includePrevNote = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
	
	        // add the notes to the neume
	        var lastNoteIndex;
	        if (includeCurrNote) lastNoteIndex = currNoteIndex;else if (includePrevNote) lastNoteIndex = currNoteIndex - 1;else lastNoteIndex = currNoteIndex - 2;
	
	        if (lastNoteIndex < 0) return;
	
	        while (firstNoteIndex <= lastNoteIndex) {
	          var note = notes[firstNoteIndex++];
	          neume.addNote(note);
	          if (note.alText) {
	            if (!neume.alText) neume.alText = [];
	            neume.alText.push(note.alText);
	            note.alText.noteIndex = firstNoteIndex - 1;
	          }
	        }
	
	        neumes.push(neume);
	
	        if (includeCurrNote === false) {
	          currNoteIndex--;
	
	          if (includePrevNote === false) currNoteIndex--;
	
	          neume.keepWithNext = true;
	          if (notes[currNoteIndex + 1].shape === _ExsurgeChant.NoteShape.Quilisma) neume.trailingSpace = 0;else {
	            neume.trailingSpace = TrailingSpaceMultiple(1);
	            neume.allowLineBreakBeforeNext = true;
	          }
	        }
	
	        return unknownState;
	      };
	
	      var unknownState = {
	        neume: function neume() {
	          return new Neumes.Punctum();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.shape === _ExsurgeChant.NoteShape.Virga) return virgaState;else if (currNote.shape === _ExsurgeChant.NoteShape.Stropha) return apostrophaState;else if (currNote.shape === _ExsurgeChant.NoteShape.Oriscus) return oriscusState;else if (currNote.shape === _ExsurgeChant.NoteShape.Inclinatum) return punctaInclinataState;else if (currNote.shapeModifiers & _ExsurgeChant.NoteShapeModifiers.Cavum) return createNeume(new Neumes.Punctum(), true);else return punctumState;
	        }
	      };
	
	      var punctumState = {
	        neume: function neume() {
	          return new Neumes.Punctum();
	        },
	        handle: function handle(currNote, prevNote, notesRemaining) {
	          if (currNote.shape || prevNote.liquescent === _ExsurgeChant.LiquescentType.Small) {
	            var neume = new Neumes.Punctum();
	            var state = createNeume(neume, false);
	            // if the current note is on a space within the staff AND the previous note is on the line below AND the previous note has a mora,
	            // then we went the trailing space at its default of intraNeumeSpacing to prevent the dot from running up into the current note.
	            // Otherwise, we want no trailing space.
	            if (currNote.staffPosition > prevNote.staffPosition && (currNote.staffPosition % 2 === 1 || prevNote.staffPosition !== currNote.staffPosition - 1 || !prevNote.morae || prevNote.morae.length === 0)) neume.trailingSpace = 0;
	            return state;
	          }
	
	          if (currNote.staffPosition > prevNote.staffPosition) {
	            if (currNote.ictus) currNote.ictus.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;
	            return podatusState;
	          } else if (currNote.staffPosition < prevNote.staffPosition) {
	            if (prevNote.ictus) prevNote.ictus.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;
	            if (currNote.shape === _ExsurgeChant.NoteShape.Inclinatum) return climacusState;else if (prevNote.staffPosition - currNote.staffPosition <= 4) {
	              return clivisState;
	            }
	          } else if (!prevNote.morae || !prevNote.morae.length) {
	            return distrophaState;
	          }
	          return createNeume(new Neumes.Punctum(), false);
	        }
	      };
	
	      var punctaInclinataState = {
	        neume: function neume() {
	          return new Neumes.PunctaInclinata();
	        },
	        handle: function handle() {
	          if (currNote.shape !== _ExsurgeChant.NoteShape.Inclinatum) return createNeume(new Neumes.PunctaInclinata(), false);else return punctaInclinataState;
	        }
	      };
	
	      var oriscusState = {
	        neume: function neume() {
	          return new Neumes.Oriscus();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.shape === _ExsurgeChant.NoteShape.Default) {
	            if (currNote.staffPosition > prevNote.staffPosition) {
	              prevNote.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Ascending;
	              return createNeume(new Neumes.PesQuassus(), true);
	            } else if (currNote.staffPosition < prevNote.staffPosition) {
	              prevNote.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Descending;
	              return createNeume(new Neumes.Clivis(), true);
	            }
	          }
	          // stand alone oriscus
	          var neume = new Neumes.Oriscus(),
	              state = createNeume(neume, false);
	          // if the current note is on a space within the staff AND the previous note is on the line below AND the previous note has a mora,
	          // then we went the trailing space at its default of intraNeumeSpacing to prevent the dot from running up into the current note.
	          // Otherwise, we want no trailing space.
	          if (currNote.staffPosition > prevNote.staffPosition && (currNote.staffPosition % 2 === 1 || prevNote.staffPosition !== currNote.staffPosition - 1 || !prevNote.morae || prevNote.morae.length === 0)) neume.trailingSpace = 0;
	          return state;
	        }
	      };
	
	      var podatusState = {
	        neume: function neume() {
	          return new Neumes.Podatus();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.staffPosition > prevNote.staffPosition) {
	            if (currNote.ictus) currNote.ictus.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;
	            if (prevNote.ictus) prevNote.ictus.positionHint = _ExsurgeDrawing.MarkingPositionHint.Below;
	
	            if (prevNote.shape === _ExsurgeChant.NoteShape.Oriscus) return salicusState;else return scandicusState;
	          } else if (currNote.staffPosition < prevNote.staffPosition) {
	            if (currNote.shape === _ExsurgeChant.NoteShape.Inclinatum) return pesSubpunctisState;else return torculusState;
	          } else return createNeume(new Neumes.Podatus(), false);
	        }
	      };
	
	      var clivisState = {
	        neume: function neume() {
	          return new Neumes.Clivis();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.shape === _ExsurgeChant.NoteShape.Default && currNote.staffPosition > prevNote.staffPosition) {
	            if (currNote.ictus) currNote.ictus.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;
	            return porrectusState;
	          } else return createNeume(new Neumes.Clivis(), false);
	        }
	      };
	
	      var climacusState = {
	        neume: function neume() {
	          return new Neumes.Climacus();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.shape !== _ExsurgeChant.NoteShape.Inclinatum) return createNeume(new Neumes.Climacus(), false);else return state;
	        }
	      };
	
	      var porrectusState = {
	        neume: function neume() {
	          return new Neumes.Porrectus();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.shape === _ExsurgeChant.NoteShape.Default && currNote.staffPosition < prevNote.staffPosition) return createNeume(new Neumes.PorrectusFlexus(), true);else return createNeume(new Neumes.Porrectus(), false);
	        }
	      };
	
	      var pesSubpunctisState = {
	        neume: function neume() {
	          return new Neumes.PesSubpunctis();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.shape !== _ExsurgeChant.NoteShape.Inclinatum) return createNeume(new Neumes.PesSubpunctis(), false);else return state;
	        }
	      };
	
	      var salicusState = {
	        neume: function neume() {
	          return new Neumes.Salicus();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.staffPosition < prevNote.staffPosition) return salicusFlexusState;else return createNeume(new Neumes.Salicus(), false);
	        }
	      };
	
	      var salicusFlexusState = {
	        neume: function neume() {
	          return new Neumes.SalicusFlexus();
	        },
	        handle: function handle(currNote, prevNote) {
	          return createNeume(new Neumes.SalicusFlexus(), false);
	        }
	      };
	
	      var scandicusState = {
	        neume: function neume() {
	          return new Neumes.Scandicus();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (prevNote.shape === _ExsurgeChant.NoteShape.Virga && currNote.shape === _ExsurgeChant.NoteShape.Inclinatum && currNote.staffPosition < prevNote.staffPosition) {
	            // if we get here, then it seems we have a podatus, now being followed by a climacus
	            // rather than a scandicus. react accordingly
	            return createNeume(new Neumes.Podatus(), false, false);
	          } else if (currNote.shape === _ExsurgeChant.NoteShape.Default && currNote.staffPosition < prevNote.staffPosition) return scandicusFlexusState;else return createNeume(new Neumes.Scandicus(), false);
	        }
	      };
	
	      var scandicusFlexusState = {
	        neume: function neume() {
	          return new Neumes.ScandicusFlexus();
	        },
	        handle: function handle(currNote, prevNote) {
	          return createNeume(new Neumes.ScandicusFlexus(), false);
	        }
	      };
	
	      var virgaState = {
	        neume: function neume() {
	          return new Neumes.Virga();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.shape === _ExsurgeChant.NoteShape.Inclinatum && currNote.staffPosition < prevNote.staffPosition) return climacusState;else if (currNote.shape === _ExsurgeChant.NoteShape.Virga && currNote.staffPosition === prevNote.staffPosition) return bivirgaState;else return createNeume(new Neumes.Virga(), false);
	        }
	      };
	
	      var bivirgaState = {
	        neume: function neume() {
	          return new Neumes.Bivirga();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.shape === _ExsurgeChant.NoteShape.Virga && currNote.staffPosition === prevNote.staffPosition) return createNeume(new Neumes.Trivirga(), true);else return createNeume(new Neumes.Bivirga(), false);
	        }
	      };
	
	      var apostrophaState = {
	        neume: function neume() {
	          return new Neumes.Apostropha();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.staffPosition === prevNote.staffPosition) return distrophaState;else return createNeume(new Neumes.Apostropha(), false);
	        }
	      };
	
	      var distrophaState = {
	        neume: function neume() {
	          return new Neumes.Distropha();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.staffPosition === prevNote.staffPosition) {
	            if (prevNote.morae && prevNote.morae.length) {
	              return createNeume(new Neumes.Distropha(), false);
	            } else {
	              return tristrophaState;
	            }
	          } else return createNeume(new Neumes.Apostropha(), false, false);
	        }
	      };
	
	      var tristrophaState = {
	        neume: function neume() {
	          return new Neumes.Tristropha();
	        },
	        handle: function handle(currNote, prevNote) {
	          // we only create a tristropha when the note run ends after three
	          // and the neume() function of this state is called. Otherwise
	          // we always interpret the third note to belong to the next sequence
	          // of notes.
	          //
	          // fixme: gabc allows any number of punctum/stropha in succession...
	          // is this a valid neume type? Or is it just multiple *stropha neumes
	          // in succession? Should we simplify the apostropha/distropha/
	          // tristropha classes to a generic stropha neume that can have 1 or
	          // more successive notes?
	          return createNeume(new Neumes.Distropha(), false, false);
	        }
	      };
	
	      var torculusState = {
	        neume: function neume() {
	          return new Neumes.Torculus();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.shape === _ExsurgeChant.NoteShape.Default && currNote.staffPosition > prevNote.staffPosition) {
	            var prevNoteButOne = notes[currNoteIndex - 2];
	            if (prevNoteButOne && prevNoteButOne.staffPosition - prevNote.staffPosition <= 4) {
	              if (currNote.ictus) currNote.ictus.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;
	              return torculusResupinusState;
	            }
	          }
	          return createNeume(new Neumes.Torculus(), false);
	        }
	      };
	
	      var torculusResupinusState = {
	        neume: function neume() {
	          return new Neumes.TorculusResupinus();
	        },
	        handle: function handle(currNote, prevNote) {
	          if (currNote.shape === _ExsurgeChant.NoteShape.Default && currNote.staffPosition < prevNote.staffPosition) return createNeume(new Neumes.TorculusResupinusFlexus(), true);else return createNeume(new Neumes.TorculusResupinus(), false);
	        }
	      };
	
	      var state = unknownState;
	
	      while (currNoteIndex < notes.length) {
	        var prevNote = currNoteIndex > 0 ? notes[currNoteIndex - 1] : null;
	        var currNote = notes[currNoteIndex];
	
	        state = state.handle(currNote, prevNote, notes.length - 1 - currNoteIndex);
	
	        // if we are on the last note, then try to create a neume if we need to.
	        if (currNoteIndex === notes.length - 1 && state !== unknownState) createNeume(state.neume(), true);
	
	        currNoteIndex++;
	      }
	
	      if (neumes.length > 0) {
	        if (!finalTrailingSpace.isDefault) {
	          neumes[neumes.length - 1].trailingSpace = finalTrailingSpace;
	          neumes[neumes.length - 1].keepWithNext = true;
	
	          if (finalTrailingSpace > 0) neumes[neumes.length - 1].allowLineBreakBeforeNext = neumes[neumes.length - 1].keepWithNext = true;
	        }
	      }
	
	      return neumes;
	    }
	
	    // appends any notes created to the notes array argument
	
	  }, {
	    key: "createNoteFromData",
	    value: function createNoteFromData(ctxt, clef, data, notes, sourceIndex) {
	      var note = new _ExsurgeChant.Note();
	      note.sourceIndex = sourceIndex;
	      note.sourceGabc = data;
	
	      if (data.length < 1) throw "Invalid note data: " + data;
	
	      if (data[0] === "-") {
	        // liquescent initio debilis
	        note.liquescent = _ExsurgeChant.LiquescentType.InitioDebilis;
	        data = data.substring(1);
	      }
	
	      if (data.length < 1) throw "Invalid note data: " + data;
	
	      // the next char is always the pitch
	      var pitch = this.gabcHeightToExsurgePitch(clef, data[0]);
	
	      if (data[0] === data[0].toUpperCase()) note.shape = _ExsurgeChant.NoteShape.Inclinatum;
	
	      note.staffPosition = this.gabcHeightToExsurgeHeight(data[0]);
	      note.pitch = pitch;
	
	      var mark;
	
	      var episemaNoteIndex = notes.length;
	      var episemaNote = note;
	
	      // process the modifiers
	      for (var i = 1; i < data.length; i++) {
	        var c = data[i];
	        var lookahead = "\0";
	
	        var haveLookahead = i + 1 < data.length;
	        if (haveLookahead) lookahead = data[i + 1];
	
	        switch (c) {
	          // rhythmic markings
	          case ".":
	            mark = null;
	
	            // gabc supports putting up to two morae on each note, by repeating the
	            // period. here, we check to see if we've already created a mora for the
	            // note, and if so, we simply force the second one to have an Above
	            // position hint. if a user decides to try to put position indicators
	            // on the double morae (such as 1 or 2), then really the behavior is
	            // not defined by gabc, so it's on the user to figure it out.
	            if (note.morae.length > 0 && notes.length) {
	              var previousNote = notes.slice(-1)[0];
	              var previousMora = note.morae.slice(-1)[0];
	              previousMora.note = previousNote;
	            }
	
	            mark = new Markings.Mora(ctxt, note);
	            if (haveLookahead && lookahead === "1") mark.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;else if (haveLookahead && lookahead === "0") mark.positionHint = _ExsurgeDrawing.MarkingPositionHint.Below;
	
	            note.morae.push(mark);
	            break;
	
	          case "_":
	            var episemaHadModifier = false;
	
	            mark = new Markings.HorizontalEpisema(episemaNote);
	            while (haveLookahead) {
	              if (lookahead === "0") mark.positionHint = _ExsurgeDrawing.MarkingPositionHint.Below;else if (lookahead === "1") mark.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;else if (lookahead === "2") mark.terminating = true;
	              // episema terminates
	              else if (lookahead === "3") mark.alignment = Markings.HorizontalEpisemaAlignment.Left;else if (lookahead === "4") mark.alignment = Markings.HorizontalEpisemaAlignment.Center;else if (lookahead === "5") mark.alignment = Markings.HorizontalEpisemaAlignment.Right;else break;
	
	              // the gabc definition for episemata is so convoluted...
	              // - double underscores create episemata over multiple notes.
	              // - unless the _ has a 0, 1, 3, 4, or 5 modifier, which means
	              //   another underscore puts a second episema on the same note
	              // - (when there's a 2 lookahead, then this is treated as an
	              //   unmodified underscore, so another underscore would be
	              //   added to previous notes
	              if (mark.alignment !== Markings.HorizontalEpisemaAlignment.Default && mark.positionHint !== _ExsurgeDrawing.MarkingPositionHint.Below) episemaHadModifier = true;
	
	              i++;
	              haveLookahead = i + 1 < data.length;
	
	              if (haveLookahead) lookahead = data[i + 1];
	            }
	
	            // since gabc allows consecutive underscores which is a shortcut to
	            // apply the episemata to previous notes, we keep track of that here
	            // in order to add the new episema to the correct note.
	
	            if (episemaNote) episemaNote.episemata.push(mark);
	
	            if (episemaNote === note && episemaHadModifier) episemaNote = note;else if (episemaNoteIndex >= 0 && notes.length > 0) episemaNote = notes[--episemaNoteIndex];
	
	            break;
	
	          case "'":
	            mark = new Markings.Ictus(ctxt, note);
	            if (haveLookahead && lookahead === "1") mark.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;else if (haveLookahead && lookahead === "0") mark.positionHint = _ExsurgeDrawing.MarkingPositionHint.Below;else if (note.shape === _ExsurgeChant.NoteShape.Virga)
	              // ictus on a virga goes above by default:
	              mark.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;
	
	            note.ictus = mark;
	            break;
	
	          //note shapes
	          case "r":
	            if (haveLookahead && /^[0-5]$/.test(lookahead)) {
	              switch (lookahead) {
	                case "0":
	                  note.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Cavum;
	                  note.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Linea;
	                  break;
	                case "1":
	                  note.accent = new Markings.Accent(ctxt, note, _ExsurgeDrawing.GlyphCode.AcuteAccent);
	                  break;
	                case "2":
	                  note.accent = new Markings.Accent(ctxt, note, _ExsurgeDrawing.GlyphCode.GraveAccent);
	                  break;
	                case "3":
	                  note.accent = new Markings.Accent(ctxt, note, _ExsurgeDrawing.GlyphCode.Circle);
	                  break;
	                case "4":
	                  note.accent = new Markings.Accent(ctxt, note, _ExsurgeDrawing.GlyphCode.Semicircle);
	                  break;
	                case "5":
	                  note.accent = new Markings.Accent(ctxt, note, _ExsurgeDrawing.GlyphCode.ReversedSemicircle);
	                  break;
	                default:
	              }
	              i++;
	            } else note.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Cavum;
	            break;
	
	          case "R":
	            note.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Linea;
	            break;
	
	          case "s":
	            if (note.shape === _ExsurgeChant.NoteShape.Stropha) {
	              // if we're already a stropha, that means this is gabc's
	              // quick stropha feature (e.g., gsss). create a new note
	              var newNote = new _ExsurgeChant.Note();
	              newNote.sourceIndex = sourceIndex + i;
	              newNote.sourceGabc = "s";
	              newNote.staffPosition = note.staffPosition;
	              newNote.pitch = note.pitch;
	              notes.push(note);
	              note = newNote;
	              episemaNoteIndex++; // since a new note was added, increase the index here
	            }
	
	            note.shape = _ExsurgeChant.NoteShape.Stropha;
	            break;
	
	          case "v":
	            if (note.shape === _ExsurgeChant.NoteShape.Virga) {
	              // if we're already a stropha, that means this is gabc's
	              // quick virga feature (e.g., gvvv). create a new note
	              var _newNote = new _ExsurgeChant.Note();
	              _newNote.sourceIndex = sourceIndex + i;
	              _newNote.sourceGabc = "v";
	              _newNote.staffPosition = note.staffPosition;
	              _newNote.pitch = note.pitch;
	              notes.push(note);
	              note = _newNote;
	              episemaNoteIndex++; // since a new note was added, increase the index here
	            }
	
	            note.shape = _ExsurgeChant.NoteShape.Virga;
	            break;
	
	          case "V":
	            note.shape = _ExsurgeChant.NoteShape.Virga;
	            note.shapeModifers |= _ExsurgeChant.NoteShapeModifiers.Reverse;
	            break;
	
	          case "w":
	            note.shape = _ExsurgeChant.NoteShape.Quilisma;
	            break;
	
	          case "o":
	            note.shape = _ExsurgeChant.NoteShape.Oriscus;
	            if (haveLookahead && lookahead === "<") {
	              note.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Ascending;
	              i++;
	            } else if (haveLookahead && lookahead === ">") {
	              note.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Descending;
	              i++;
	            }
	            break;
	
	          case "O":
	            note.shape = _ExsurgeChant.NoteShape.Oriscus;
	            if (haveLookahead && lookahead === "<") {
	              note.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Ascending | _ExsurgeChant.NoteShapeModifiers.Stemmed;
	              i++;
	            } else if (haveLookahead && lookahead === ">") {
	              note.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Descending | _ExsurgeChant.NoteShapeModifiers.Stemmed;
	              i++;
	            } else note.shapeModifiers |= _ExsurgeChant.NoteShapeModifiers.Stemmed;
	            break;
	
	          // liquescents
	          case "~":
	            if (note.shape === _ExsurgeChant.NoteShape.Inclinatum) note.liquescent |= _ExsurgeChant.LiquescentType.Small;else if (note.shape === _ExsurgeChant.NoteShape.Oriscus) note.liquescent |= _ExsurgeChant.LiquescentType.Large;else note.liquescent |= _ExsurgeChant.LiquescentType.Small;
	            break;
	          case "<":
	            note.liquescent |= _ExsurgeChant.LiquescentType.Ascending;
	            break;
	          case ">":
	            note.liquescent |= _ExsurgeChant.LiquescentType.Descending;
	            break;
	
	          // accidentals
	          case "x":
	            if (note.pitch.step === _ExsurgeCore.Step.Mi) note.pitch.step = _ExsurgeCore.Step.Me;else if (note.pitch.step === _ExsurgeCore.Step.Ti) note.pitch.step = _ExsurgeCore.Step.Te;
	            break;
	          case "y":
	            if (note.pitch.step === _ExsurgeCore.Step.Te) note.pitch.step = _ExsurgeCore.Step.Ti;else if (note.pitch.step === _ExsurgeCore.Step.Me) note.pitch.step = _ExsurgeCore.Step.Mi;else if (note.pitch.step === _ExsurgeCore.Step.Du) note.pitch.step = _ExsurgeCore.Step.Do;else if (note.pitch.step === _ExsurgeCore.Step.Fu) note.pitch.step = _ExsurgeCore.Step.Fa;
	            break;
	          case "#":
	            if (note.pitch.step === _ExsurgeCore.Step.Do) note.pitch.step = _ExsurgeCore.Step.Du;else if (note.pitch.step === _ExsurgeCore.Step.Fa) note.pitch.step = _ExsurgeCore.Step.Fu;
	            break;
	
	          // gabc special item groups
	          case "[":
	            // read in the whole group and parse it
	            var startIndex = ++i;
	            while (i < data.length && data[i] !== "]") {
	              i++;
	            }this.processInstructionForNote(ctxt, note, data.substring(startIndex, i), startIndex);
	            break;
	        }
	      }
	
	      if (this.needToEndBrace && !note.braceStart && !note.braceEnd && !/[xy#]/.test(c)) {
	        note.braceEnd = new Markings.BracePoint(note, this.needToEndBrace.isAbove, this.needToEndBrace.shape, this.needToEndBrace.attachment === Markings.BraceAttachment.Left ? Markings.BraceAttachment.Right : Markings.BraceAttachment.Left);
	        note.braceEnd.automatic = true;
	        delete this.needToEndBrace;
	      }
	
	      notes.push(note);
	    }
	
	    // an instruction in this context is referring to a special gabc coding found after
	    // notes between ['s and ]'s. choral signs and braces fall into this
	    // category.
	    //
	    // currently only brace instructions are supported here!
	
	  }, {
	    key: "processInstructionForNote",
	    value: function processInstructionForNote(ctxt, note, instruction, sourceIndexOffset) {
	      var results = instruction.match(__bracketedCommandRegex);
	      if (results === null) return;
	      var cmd = results[1];
	      var data = results[2];
	      switch (cmd) {
	        case "cs":
	          note.choralSign = new _ExsurgeDrawing.ChoralSign(ctxt, data, note, note.sourceIndex + sourceIndexOffset, instruction.length);
	          return;
	        case "alt":
	          note.alText = new _ExsurgeDrawing.AboveLinesText(ctxt, data, note, note.sourceIndex + sourceIndexOffset, instruction.length);
	          return;
	      }
	
	      results = instruction.match(__braceSpecRegex);
	
	      if (results === null) return;
	
	      // see the comments at the definition of __braceSpecRegex for the
	      // capturing groups
	      var above = results[1] === "o";
	      var shape = Markings.BraceShape.CurlyBrace; // default
	
	      switch (results[2]) {
	        case "b":
	          shape = Markings.BraceShape.RoundBrace;
	          break;
	        case "cb":
	          shape = Markings.BraceShape.CurlyBrace;
	          break;
	        case "cba":
	          shape = Markings.BraceShape.AccentedCurlyBrace;
	          break;
	      }
	
	      var attachmentPoint = results[3] === "1" ? Markings.BraceAttachment.Left : Markings.BraceAttachment.Right;
	
	      if (results[4] === "{" || results[5]) note.braceStart = new Markings.BracePoint(note, above, shape, attachmentPoint);else note.braceEnd = new Markings.BracePoint(note, above, shape, attachmentPoint);
	
	      // just have the next note end a brace that uses length;
	      if (results[5]) {
	        note.braceStart.automatic = true;
	        this.needToEndBrace = note.braceStart;
	      }
	    }
	
	    // takes raw gabc text source and parses it into words. For example, passing
	    // in a string of "me(f.) (,) ma(fff)num(d!ewf) tu(fgF'E)am,(f.)" would return
	    // an array of four strings: ["me(f.)", "(,)", "ma(fff)num(d!ewf)", "tu(fgF'E)am,(f.)"]
	
	  }, {
	    key: "splitWords",
	    value: function splitWords(gabcNotations) {
	      // split the notations on whitespace boundaries, as long as the space
	      // immediately follows a set of parentheses. Prior to doing that, we replace
	      // all whitespace with spaces, which prevents tabs and newlines from ending
	      // up in the notation data.
	      gabcNotations = gabcNotations
	      // .trim()
	      // .replace(/\s/g, " ")
	      .replace(/\)\s(?=[^\)]*(?:\(|$))/g, ")\n");
	      return gabcNotations.split(/\n/g);
	    }
	  }, {
	    key: "parseSource",
	    value: function parseSource(gabcSource) {
	      return this.parseWords(this.splitWords(gabcSource));
	    }
	
	    // gabcWords is an array of strings, e.g., the result of splitWords above
	
	  }, {
	    key: "parseWords",
	    value: function parseWords(gabcWords) {
	      var words = [];
	
	      for (var i = 0; i < gabcWords.length; i++) {
	        words.push(this.parseWord(gabcWords[i]));
	      }return words;
	    }
	
	    // returns an array of objects, each of which has the following properties
	    //  - notations (string)
	    //  - lyrics (array of strings)
	
	  }, {
	    key: "parseWord",
	    value: function parseWord(gabcWord) {
	      var syllables = [];
	      var matches = [];
	
	      syllables.wordLength = gabcWord.length;
	
	      while (match = __syllablesRegex.exec(gabcWord)) {
	        matches.push(match);
	      }for (var j = 0; j < matches.length; j++) {
	        var match = matches[j];
	
	        var lyrics = match[1].trim().split("|");
	        var notations = match[2];
	
	        syllables.push({
	          notations: notations,
	          lyrics: lyrics
	        });
	      }
	
	      return syllables;
	    }
	
	    // returns pitch
	
	  }, {
	    key: "gabcHeightToExsurgeHeight",
	    value: function gabcHeightToExsurgeHeight(gabcHeight) {
	      return gabcHeight.toLowerCase().charCodeAt(0) - "a".charCodeAt(0) - 6;
	    }
	
	    // returns pitch
	
	  }, {
	    key: "gabcHeightToExsurgePitch",
	    value: function gabcHeightToExsurgePitch(clef, gabcHeight) {
	      var exsurgeHeight = this.gabcHeightToExsurgeHeight(gabcHeight);
	
	      var pitch = clef.staffPositionToPitch(exsurgeHeight);
	
	      return pitch;
	    }
	  }]);

	  return Gabc;
	}();

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Virga = exports.Tristropha = exports.TorculusResupinusFlexus = exports.TorculusResupinus = exports.Torculus = exports.ScandicusFlexus = exports.Scandicus = exports.SalicusFlexus = exports.Salicus = exports.Punctum = exports.PunctaInclinata = exports.PorrectusFlexus = exports.Porrectus = exports.Podatus = exports.PesSubpunctis = exports.PesQuassus = exports.Oriscus = exports.Distropha = exports.Clivis = exports.Climacus = exports.Trivirga = exports.Bivirga = exports.Apostropha = exports.Neume = undefined;
	
	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //
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
	
	var _ExsurgeChant = __webpack_require__(8);
	
	var _ExsurgeDrawing = __webpack_require__(4);
	
	var _ExsurgeGlyphs = __webpack_require__(3);
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var NeumeBuilder = function () {
	  function NeumeBuilder(ctxt, neume) {
	    var startingX = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
	
	    _classCallCheck(this, NeumeBuilder);
	
	    this.ctxt = ctxt;
	    this.neume = neume;
	    this.x = startingX;
	    this.lastNote = null;
	    this.lineIsHanging = false;
	    this.minX = 0;
	  }
	
	  // used to start a hanging line on the left of the next note
	
	
	  _createClass(NeumeBuilder, [{
	    key: "lineFrom",
	    value: function lineFrom(note) {
	      var previousNotation = this.ctxt.notations[this.ctxt.currNotationIndex - 1];
	      if (this.x === 0 && previousNotation && previousNotation.notes && previousNotation.trailingSpace === 0) {
	        this.lastNote = previousNotation.notes.slice(-1)[0];
	        this.minX = -this.ctxt.neumeLineWeight;
	      } else {
	        this.lastNote = note;
	        this.lineIsHanging = true;
	      }
	      return this;
	    }
	
	    // add a note, with a connecting line on the left if we have one
	
	  }, {
	    key: "noteAt",
	    value: function noteAt(note, glyph) {
	      var withLineTo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
	
	      if (!note) throw "NeumeBuilder.noteAt: note must be a valid note";
	
	      if (!glyph) throw "NeumeBuilder.noteAt: glyph must be a valid glyph code";
	
	      note.setGlyph(this.ctxt, glyph);
	      var noteAlignsRight = note.glyphVisualizer.align === "right";
	
	      var needsLine = withLineTo && this.lastNote !== null && (this.lineIsHanging || this.lastNote.glyphVisualizer && this.lastNote.glyphVisualizer.align === "right" || Math.abs(this.lastNote.staffPosition - note.staffPosition) > 1);
	
	      if (needsLine) {
	        var line = new _ExsurgeDrawing.NeumeLineVisualizer(this.ctxt, this.lastNote, note, this.lineIsHanging);
	        this.neume.addVisualizer(line);
	        line.bounds.x = Math.max(this.minX, this.x - line.bounds.width);
	
	        if (!noteAlignsRight) this.x = line.bounds.x;
	      }
	
	      var xOffset = 0;
	      if (note.shapeModifiers & _ExsurgeChant.NoteShapeModifiers.Linea) {
	        var linea = new _ExsurgeDrawing.LineaVisualizer(this.ctxt, note);
	        this.neume.addVisualizer(linea);
	        note.origin.x += linea.origin.x;
	        xOffset = linea.origin.x;
	      }
	
	      // if this is the first note of a right aligned glyph (probably an initio debilis),
	      // then there's nothing to worry about. but if it's not then first, then this
	      // subtraction will right align it visually
	      if (noteAlignsRight && this.lastNote) note.bounds.x = this.x - note.bounds.width;else {
	        note.bounds.x = this.x + xOffset;
	        this.x += note.bounds.width + xOffset;
	      }
	
	      this.neume.addVisualizer(note);
	
	      this.lastNote = note;
	      this.lineIsHanging = false;
	
	      return this;
	    }
	
	    // a special form of noteAdd that creates a virga
	    // uses a punctum cuadratum and a line rather than the virga glyphs
	
	  }, {
	    key: "virgaAt",
	    value: function virgaAt(note) {
	      var withLineTo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
	
	      // add the punctum for the virga
	      this.noteAt(note, _ExsurgeDrawing.GlyphCode.PunctumQuadratum);
	
	      // add a line for the virga
	      var line = new _ExsurgeDrawing.VirgaLineVisualizer(this.ctxt, note);
	      this.x -= line.bounds.width;
	      if (note.shapeModifers & _ExsurgeChant.NoteShapeModifiers.Reverse) {
	        line.bounds.x = 0;
	      } else {
	        line.bounds.x = this.x;
	      }
	      this.neume.addVisualizer(line);
	
	      this.lastNote = note;
	      this.lineIsHanging = false;
	
	      return this;
	    }
	  }, {
	    key: "advanceBy",
	    value: function advanceBy(x) {
	      this.lastNote = null;
	      this.lineIsHanging = false;
	
	      this.x += x;
	
	      return this;
	    }
	
	    // for terminating hanging lines with no lower notes
	
	  }, {
	    key: "withLineEndingAt",
	    value: function withLineEndingAt(note) {
	      if (this.lastNote === null) return;
	
	      var line = new _ExsurgeDrawing.NeumeLineVisualizer(this.ctxt, this.lastNote, note, true);
	      this.neume.addVisualizer(line);
	      this.x -= line.bounds.width;
	      line.bounds.x = this.x;
	
	      this.neume.addVisualizer(line);
	
	      this.lastNote = note;
	
	      return this;
	    }
	  }, {
	    key: "withPodatus",
	    value: function withPodatus(lowerNote, upperNote) {
	      var upperGlyph;
	      var lowerGlyph;
	
	      if (lowerNote.liquescent === _ExsurgeChant.LiquescentType.InitioDebilis) {
	        // liquescent upper note or not?
	        if (upperNote.liquescent === _ExsurgeChant.LiquescentType.None) upperGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;else upperGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;
	
	        lowerGlyph = _ExsurgeDrawing.GlyphCode.TerminatingDesLiquescent;
	      } else if (upperNote.liquescent & _ExsurgeChant.LiquescentType.Small) {
	        lowerGlyph = _ExsurgeDrawing.GlyphCode.BeginningAscLiquescent;
	        upperGlyph = _ExsurgeDrawing.GlyphCode.TerminatingAscLiquescent;
	      } else if (upperNote.liquescent & _ExsurgeChant.LiquescentType.Ascending) {
	        lowerGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	        upperGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumAscLiquescent;
	      } else if (upperNote.liquescent & _ExsurgeChant.LiquescentType.Descending) {
	        lowerGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	        upperGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;
	      } else {
	        // standard shape
	        lowerGlyph = _ExsurgeDrawing.GlyphCode.PodatusLower;
	        upperGlyph = _ExsurgeDrawing.GlyphCode.PodatusUpper;
	      }
	
	      // allow a quilisma pes
	      if (lowerNote.shape === _ExsurgeChant.NoteShape.Quilisma) lowerGlyph = _ExsurgeDrawing.GlyphCode.Quilisma;
	
	      this.noteAt(lowerNote, lowerGlyph).noteAt(upperNote, upperGlyph);
	
	      // make sure we don't have lines connected to the podatus
	      this.lastNote = null;
	
	      return this;
	    }
	  }, {
	    key: "withClivis",
	    value: function withClivis(upper, lower) {
	      var lowerGlyph;
	
	      if (upper.shape === _ExsurgeChant.NoteShape.Oriscus) this.noteAt(upper, _ExsurgeDrawing.GlyphCode.OriscusDes, false);else this.lineFrom(lower).noteAt(upper, _ExsurgeDrawing.GlyphCode.PunctumQuadratum);
	
	      if (lower.liquescent & _ExsurgeChant.LiquescentType.Small) {
	        lowerGlyph = _ExsurgeDrawing.GlyphCode.TerminatingDesLiquescent;
	      } else if (lower.liquescent === _ExsurgeChant.LiquescentType.Ascending) lowerGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumAscLiquescent;else if (lower.liquescent === _ExsurgeChant.LiquescentType.Descending) lowerGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;else lowerGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	
	      this.noteAt(lower, lowerGlyph);
	
	      // make sure we don't have lines connected to the clivis
	      this.lastNote = null;
	
	      return this;
	    }
	
	    // lays out a sequence of notes that are inclinata (e.g., climacus, pes subpunctis)
	
	  }, {
	    key: "withInclinata",
	    value: function withInclinata(notes) {
	      var staffPosition = notes[0].staffPosition,
	          prevStaffPosition = notes[0].staffPosition;
	
	      // it is important to advance by the width of the inclinatum glyph itself
	      // rather than by individual note widths, so that any liquescents are spaced
	      // the same as non-liquscents
	      var advanceWidth = _ExsurgeGlyphs.Glyphs.PunctumInclinatum.bounds.width * this.ctxt.glyphScaling;
	
	      // now add all the punctum inclinatum
	      for (var i = 0; i < notes.length; i++, prevStaffPosition = staffPosition) {
	        var note = notes[i];
	
	        if (note.liquescent & _ExsurgeChant.LiquescentType.Small) note.setGlyph(this.ctxt, _ExsurgeDrawing.GlyphCode.PunctumInclinatumLiquescent);else if (note.liquescent & _ExsurgeChant.LiquescentType.Large)
	          // fixme: is the large inclinatum liquescent the same as the apostropha?
	          note.setGlyph(this.ctxt, _ExsurgeDrawing.GlyphCode.Stropha);
	          // fixme: some climaci in the new chant books end with a punctum quadratum
	          // (see, for example, the antiphon "Sancta Maria" for October 7).
	        else note.setGlyph(this.ctxt, _ExsurgeDrawing.GlyphCode.PunctumInclinatum);
	
	        staffPosition = note.staffPosition;
	
	        var multiple = Math.abs(prevStaffPosition - staffPosition);
	        switch (multiple) {
	          case 0:
	            multiple = 1.1;
	            break;
	          default:
	            multiple *= 2 / 3;
	            break;
	        }
	
	        if (i > 0) this.x += advanceWidth * multiple;
	
	        note.bounds.x = this.x;
	
	        this.neume.addVisualizer(note);
	      }
	
	      return this;
	    }
	  }, {
	    key: "withPorrectusSwash",
	    value: function withPorrectusSwash(start, end) {
	      var needsLine = this.lastNote !== null && (this.lineIsHanging || this.lastNote.glyphVisualizer && this.lastNote.glyphVisualizer.align === "right" || Math.abs(this.lastNote.staffPosition - start.staffPosition) > 1);
	
	      if (needsLine) {
	        var line = new _ExsurgeDrawing.NeumeLineVisualizer(this.ctxt, this.lastNote, start, this.lineIsHanging);
	        this.x = Math.max(this.minX, this.x - line.bounds.width);
	        line.bounds.x = this.x;
	        this.neume.addVisualizer(line);
	      }
	
	      var glyph;
	
	      switch (start.staffPosition - end.staffPosition) {
	        case 1:
	          glyph = _ExsurgeDrawing.GlyphCode.Porrectus1;
	          break;
	        case 2:
	          glyph = _ExsurgeDrawing.GlyphCode.Porrectus2;
	          break;
	        case 3:
	          glyph = _ExsurgeDrawing.GlyphCode.Porrectus3;
	          break;
	        case 4:
	          glyph = _ExsurgeDrawing.GlyphCode.Porrectus4;
	          break;
	        default:
	          // fixme: should we generate an error here?
	          glyph = _ExsurgeDrawing.GlyphCode.None;
	          break;
	      }
	
	      start.setGlyph(this.ctxt, glyph);
	      start.bounds.x = this.x;
	
	      // the second glyph does not draw anything, but it still has logical importance for the editing
	      // environment...it can respond to changes which will then change the swash glyph of the first.
	      end.setGlyph(this.ctxt, _ExsurgeDrawing.GlyphCode.None);
	
	      this.x = start.bounds.right();
	      end.bounds.x = this.x - end.bounds.width;
	
	      this.neume.addVisualizer(start);
	      this.neume.addVisualizer(end);
	
	      this.lastNote = end;
	      this.lineIsHanging = false;
	
	      return this;
	    }
	  }]);
	
	  return NeumeBuilder;
	}();
	
	/*
	 * Neumes base class
	 */
	
	
	var Neume = exports.Neume = function (_ChantNotationElement) {
	  _inherits(Neume, _ChantNotationElement);
	
	  function Neume() {
	    var notes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	
	    _classCallCheck(this, Neume);
	
	    var _this = _possibleConstructorReturn(this, (Neume.__proto__ || Object.getPrototypeOf(Neume)).call(this));
	
	    _this.isNeume = true; // poor man's reflection
	    _this.notes = notes;
	
	    for (var i = 0; i < notes.length; i++) {
	      notes[i].neume = _this;
	    }return _this;
	  }
	
	  _createClass(Neume, [{
	    key: "addNote",
	    value: function addNote(note) {
	      note.neume = this;
	      this.notes.push(note);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Neume.prototype.__proto__ || Object.getPrototypeOf(Neume.prototype), "performLayout", this).call(this, ctxt);
	    }
	  }, {
	    key: "finishLayout",
	    value: function finishLayout(ctxt) {
	      this.ledgerLines = this.requiresLedgerLine();
	
	      // allow subclasses an opportunity to position their own markings...
	      this.positionMarkings();
	
	      // layout the markings of the notes
	      for (var i = 0; i < this.notes.length; i++) {
	        var note = this.notes[i];
	        var j;
	
	        for (j = 0; j < note.episemata.length; j++) {
	          note.episemata[j].performLayout(ctxt);
	          this.addVisualizer(note.episemata[j]);
	        }
	
	        for (j = 0; j < note.morae.length; j++) {
	          note.morae[j].performLayout(ctxt);
	          this.addVisualizer(note.morae[j]);
	        }
	
	        // if the note has an ictus, then add it here
	        if (note.ictus) {
	          note.ictus.performLayout(ctxt);
	          this.addVisualizer(note.ictus);
	        }
	
	        if (note.accent) {
	          note.accent.performLayout(ctxt);
	          this.addVisualizer(note.accent);
	        }
	
	        if (note.choralSign) {
	          note.choralSign.performLayout(ctxt);
	          this.addVisualizer(note.choralSign);
	        }
	
	        // braces are handled by the chant line, so we don't mess with them here
	        // this is because brace size depends on chant line logic (neume spacing,
	        // justification, etc.) so they are considered chant line level
	        // markings rather than note level markings
	      }
	
	      this.origin.x = this.notes[0].origin.x;
	      this.origin.y = this.notes[0].origin.y;
	
	      _get(Neume.prototype.__proto__ || Object.getPrototypeOf(Neume.prototype), "finishLayout", this).call(this, ctxt);
	    }
	  }, {
	    key: "requiresLedgerLine",
	    value: function requiresLedgerLine() {
	      var firstAbove = false,
	          needsAbove = false,
	          firstBelow = false,
	          needsBelow = false,
	
	      // isPorrectus = false,
	      result = [];
	
	      if (!this.notes) return result;
	
	      for (var i = 0; i < this.notes.length; ++i) {
	        var note = this.notes[i];
	        var staffPosition = note.staffPosition;
	        if (staffPosition >= 4) {
	          needsAbove = needsAbove || staffPosition >= 5;
	          if (firstAbove === false) firstAbove = Math.max(0, i - 1);
	          if (staffPosition >= 5) continue;
	        } else if (staffPosition <= -4) {
	          needsBelow = needsBelow || staffPosition <= -5;
	          if (firstBelow === false) firstBelow = Math.max(0, i - 1);
	          if (staffPosition <= -5) continue;
	        }
	        if (needsAbove || needsBelow) {
	          var endI = i; // Math.abs(staffPosition) >= 4? i : i - 1;
	          result.push({
	            element: this.notes[firstAbove || firstBelow || 0],
	            endElem: this.notes[endI],
	            staffPosition: needsAbove ? 5 : -5
	          });
	          firstAbove = firstBelow = needsAbove = needsBelow = false;
	        }
	        // isPorrectus = /^Porrectus\d$/.test(note.glyphVisualizer.glyphCode);
	      }
	      if (needsAbove || needsBelow) {
	        result.push({
	          element: this.notes[firstAbove || firstBelow || 0],
	          endElem: this.notes[this.notes.length - 1],
	          staffPosition: needsAbove ? 5 : -5
	        });
	      }
	      return result;
	    }
	  }, {
	    key: "resetDependencies",
	    value: function resetDependencies() {}
	  }, {
	    key: "build",
	    value: function build(ctxt) {
	      return new NeumeBuilder(ctxt, this);
	    }
	  }, {
	    key: "positionEpisemata",
	    value: function positionEpisemata(note, position) {
	      var i;
	      for (i = 0; i < note.episemata.length; i++) {
	        if (note.episemata[i].positionHint === _ExsurgeDrawing.MarkingPositionHint.Default) note.episemata[i].positionHint = position;
	      }if (note.choralSign) note.choralSign.positionHint = position;
	      return note.episemata.length;
	    }
	  }, {
	    key: "positionEpisemataAbove",
	    value: function positionEpisemataAbove(note) {
	      return this.positionEpisemata(note, _ExsurgeDrawing.MarkingPositionHint.Above);
	    }
	  }, {
	    key: "positionEpisemataBelow",
	    value: function positionEpisemataBelow(note) {
	      return this.positionEpisemata(note, _ExsurgeDrawing.MarkingPositionHint.Below);
	    }
	  }, {
	    key: "positionPodatusEpisemata",
	    value: function positionPodatusEpisemata(bottomNote, topNote) {
	      // 1. episema on lower note by default be below, upper note above
	      this.positionEpisemataBelow(bottomNote);
	      this.positionEpisemataAbove(topNote);
	      if (topNote.ictus) {
	        topNote.ictus.positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;
	      }
	    }
	  }, {
	    key: "positionInclinataMorae",
	    value: function positionInclinataMorae(notes) {
	      notes = notes.slice(-2);
	      if (notes.length < 2 || notes[1].staffPosition > notes[0].staffPosition) return;
	      var bottomNote = notes[1],
	          topNote = notes[0],
	          mark;
	
	      // The mora on the second (lower) note should be below the punctum,
	      // if the punctum is on a line and the previous punctum is in the space above.
	      if (Math.abs(bottomNote.staffPosition % 2) === 1 && topNote.staffPosition - bottomNote.staffPosition === 1 && bottomNote.morae.length > 0) {
	        mark = bottomNote.morae.slice(-1)[0];
	        if (mark.positionHint === _ExsurgeDrawing.MarkingPositionHint.Default) mark.positionHint = _ExsurgeDrawing.MarkingPositionHint.Below;
	      }
	    }
	  }, {
	    key: "positionPodatusMorae",
	    value: function positionPodatusMorae(bottomNote, topNote) {
	      var mark;
	
	      // The mora on the first (lower) note should be below it,
	      // if it is on a line.
	      if (Math.abs(bottomNote.staffPosition % 2) === 1) {
	        if (bottomNote.morae.length === 1) {
	          mark = bottomNote.morae[0];
	        } else if (topNote.morae.length > 1) {
	          mark = topNote.morae[0];
	        }
	        if (mark && mark.positionHint === _ExsurgeDrawing.MarkingPositionHint.Default) mark.positionHint = _ExsurgeDrawing.MarkingPositionHint.Below;
	      }
	
	      // if there is a mora on the first note but not on the second, and the neume
	      // continues with a punctum higher than the second note, we need to adjust
	      // the space after the neume so that it follows immediately with no gap
	      if (bottomNote.morae.length > 0 && topNote.morae.length === 0) {
	        bottomNote.morae[0].ignoreBounds = true;
	      }
	    }
	    // for any subclasses that begin with a podatus, they can call this from their own positionMarkings()
	
	  }, {
	    key: "positionPodatusMarkings",
	    value: function positionPodatusMarkings(bottomNote, topNote) {
	      this.positionPodatusEpisemata(bottomNote, topNote);
	      this.positionPodatusMorae(bottomNote, topNote);
	    }
	
	    // just like a clivis, but the first note of the three also works like the second note of the clivis:
	    // episema below, unless the middle note also has an episema
	
	  }, {
	    key: "positionTorculusMarkings",
	    value: function positionTorculusMarkings(firstNote, secondNote, thirdNote) {
	      var hasTopEpisema = this.positionClivisMarkings(secondNote, thirdNote);
	      hasTopEpisema = this.positionEpisemata(firstNote, hasTopEpisema ? _ExsurgeDrawing.MarkingPositionHint.Above : _ExsurgeDrawing.MarkingPositionHint.Below) && hasTopEpisema;
	      return hasTopEpisema;
	    }
	  }, {
	    key: "positionClivisMorae",
	    value: function positionClivisMorae(firstNote, secondNote) {
	      // 1. second note of a clivis that ends on a line and goes down one step has its mora below:
	      var morae = firstNote.morae.concat(secondNote.morae);
	      if (secondNote.morae.length && firstNote.staffPosition - secondNote.staffPosition === 1 && Math.abs(secondNote.staffPosition % 2) === 1) {
	        morae.slice(-1)[0].positionHint = _ExsurgeDrawing.MarkingPositionHint.Below;
	      }
	    }
	  }, {
	    key: "positionClivisEpisemata",
	    value: function positionClivisEpisemata(firstNote, secondNote) {
	      var hasTopEpisema = this.positionEpisemataAbove(firstNote);
	      this.positionEpisemata(secondNote, hasTopEpisema ? _ExsurgeDrawing.MarkingPositionHint.Above : _ExsurgeDrawing.MarkingPositionHint.Below);
	      return hasTopEpisema;
	    }
	  }, {
	    key: "positionClivisMarkings",
	    value: function positionClivisMarkings(firstNote, secondNote) {
	      this.positionClivisMorae(firstNote, secondNote);
	      return this.positionClivisEpisemata(firstNote, secondNote);
	    }
	  }, {
	    key: "positionPorrectusMarkings",
	    value: function positionPorrectusMarkings(firstNote, secondNote, thirdNote) {
	      // episemata on first and second note work like a clivis,
	      // the second note should have its episema below, unless the first note also has an episema.
	      this.positionClivisEpisemata(firstNote, secondNote);
	      this.positionPodatusMarkings(secondNote, thirdNote);
	    }
	  }, {
	    key: "positionPorrectusFlexusMarkings",
	    value: function positionPorrectusFlexusMarkings(first, second, third, fourth) {
	      var hasTopEpisema = this.positionEpisemataAbove(first);
	      hasTopEpisema = this.positionClivisMarkings(third, fourth) || hasTopEpisema;
	      this.positionEpisemata(second, hasTopEpisema ? _ExsurgeDrawing.MarkingPositionHint.Above : _ExsurgeDrawing.MarkingPositionHint.Below);
	    }
	
	    // subclasses can override this in order to correctly place markings in a neume specific way
	
	  }, {
	    key: "positionMarkings",
	    value: function positionMarkings() {}
	  }]);
	
	  return Neume;
	}(_ExsurgeDrawing.ChantNotationElement);
	
	/*
	 * Apostropha
	 */
	
	
	var Apostropha = exports.Apostropha = function (_Neume) {
	  _inherits(Apostropha, _Neume);
	
	  function Apostropha() {
	    _classCallCheck(this, Apostropha);
	
	    return _possibleConstructorReturn(this, (Apostropha.__proto__ || Object.getPrototypeOf(Apostropha)).apply(this, arguments));
	  }
	
	  _createClass(Apostropha, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      var positionHint = _ExsurgeDrawing.MarkingPositionHint.Above;
	
	      // logic here is this: if first episema is default position, place it above.
	      // then place the second one (if there is one) opposite of the first.
	      for (var i = 0; i < this.notes[0].episemata.length; i++) {
	        if (this.notes[0].episemata[i].positionHint === _ExsurgeDrawing.MarkingPositionHint.Default) this.notes[0].episemata[i].positionHint = positionHint;else positionHint = this.notes[0].episemata[i].positionHint;
	
	        // now place the next one in the opposite position
	        positionHint = positionHint === _ExsurgeDrawing.MarkingPositionHint.Above ? _ExsurgeDrawing.MarkingPositionHint.Below : _ExsurgeDrawing.MarkingPositionHint.Above;
	      }
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Apostropha.prototype.__proto__ || Object.getPrototypeOf(Apostropha.prototype), "performLayout", this).call(this, ctxt);
	
	      this.build(ctxt).noteAt(this.notes[0], Apostropha.getNoteGlyphCode(this.notes[0]));
	
	      this.finishLayout(ctxt);
	    }
	  }], [{
	    key: "getNoteGlyphCode",
	    value: function getNoteGlyphCode(note) {
	      if (note.shape === _ExsurgeChant.NoteShape.Stropha) return _ExsurgeDrawing.GlyphCode.Stropha;
	
	      if (note.liquescent & _ExsurgeChant.LiquescentType.Ascending) return _ExsurgeDrawing.GlyphCode.PunctumQuadratumAscLiquescent;else if (note.liquescent & _ExsurgeChant.LiquescentType.Descending) return _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;
	
	      if (note.shapeModifiers & _ExsurgeChant.NoteShapeModifiers.Cavum) return _ExsurgeDrawing.GlyphCode.PunctumCavum;
	
	      return _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	    }
	  }]);
	
	  return Apostropha;
	}(Neume);
	
	/*
	 * Bivirga
	 *
	 * For simplicity in implementation, Bivirga's have two notes in the object
	 * structure. These technically must be the same pitch though.
	 */
	
	
	var Bivirga = exports.Bivirga = function (_Neume2) {
	  _inherits(Bivirga, _Neume2);
	
	  function Bivirga() {
	    _classCallCheck(this, Bivirga);
	
	    return _possibleConstructorReturn(this, (Bivirga.__proto__ || Object.getPrototypeOf(Bivirga)).apply(this, arguments));
	  }
	
	  _createClass(Bivirga, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionEpisemataAbove(this.notes[0]);
	      this.positionEpisemataAbove(this.notes[1]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Bivirga.prototype.__proto__ || Object.getPrototypeOf(Bivirga.prototype), "performLayout", this).call(this, ctxt);
	
	      this.build(ctxt).virgaAt(this.notes[0]).advanceBy(ctxt.intraNeumeSpacing).virgaAt(this.notes[1]);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Bivirga;
	}(Neume);
	
	/*
	 * Trivirga
	 *
	 * For simplicity in implementation, Trivirga's have three notes in the object
	 * structure. These technically must be the same pitch though.
	 */
	
	
	var Trivirga = exports.Trivirga = function (_Neume3) {
	  _inherits(Trivirga, _Neume3);
	
	  function Trivirga() {
	    _classCallCheck(this, Trivirga);
	
	    return _possibleConstructorReturn(this, (Trivirga.__proto__ || Object.getPrototypeOf(Trivirga)).apply(this, arguments));
	  }
	
	  _createClass(Trivirga, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionEpisemataAbove(this.notes[0]);
	      this.positionEpisemataAbove(this.notes[1]);
	      this.positionEpisemataAbove(this.notes[2]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Trivirga.prototype.__proto__ || Object.getPrototypeOf(Trivirga.prototype), "performLayout", this).call(this, ctxt);
	
	      this.build(ctxt).virgaAt(this.notes[0]).advanceBy(ctxt.intraNeumeSpacing).virgaAt(this.notes[1]).advanceBy(ctxt.intraNeumeSpacing).virgaAt(this.notes[2]);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Trivirga;
	}(Neume);
	
	/*
	 * Climacus
	 */
	
	
	var Climacus = exports.Climacus = function (_Neume4) {
	  _inherits(Climacus, _Neume4);
	
	  function Climacus() {
	    _classCallCheck(this, Climacus);
	
	    return _possibleConstructorReturn(this, (Climacus.__proto__ || Object.getPrototypeOf(Climacus)).apply(this, arguments));
	  }
	
	  _createClass(Climacus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      for (var i = 0; i < this.notes.length; i++) {
	        this.positionEpisemataAbove(this.notes[i]);
	      }
	      this.positionInclinataMorae(this.notes);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Climacus.prototype.__proto__ || Object.getPrototypeOf(Climacus.prototype), "performLayout", this).call(this, ctxt);
	
	      this.build(ctxt).virgaAt(this.notes[0]).advanceBy(ctxt.intraNeumeSpacing).withInclinata(this.notes.slice(1));
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Climacus;
	}(Neume);
	
	/*
	 * Clivis
	 */
	
	
	var Clivis = exports.Clivis = function (_Neume5) {
	  _inherits(Clivis, _Neume5);
	
	  function Clivis() {
	    _classCallCheck(this, Clivis);
	
	    return _possibleConstructorReturn(this, (Clivis.__proto__ || Object.getPrototypeOf(Clivis)).apply(this, arguments));
	  }
	
	  _createClass(Clivis, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionClivisMarkings(this.notes[0], this.notes[1]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Clivis.prototype.__proto__ || Object.getPrototypeOf(Clivis.prototype), "performLayout", this).call(this, ctxt);
	
	      var upper = this.notes[0];
	      var lower = this.notes[1];
	
	      this.build(ctxt).withClivis(upper, lower);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Clivis;
	}(Neume);
	
	/*
	 * Distropha
	 *
	 * For simplicity in implementation, Distropha's have two notes in the object
	 * structure. These technically must be the same pitch though (like Bivirga).
	 */
	
	
	var Distropha = exports.Distropha = function (_Neume6) {
	  _inherits(Distropha, _Neume6);
	
	  function Distropha() {
	    _classCallCheck(this, Distropha);
	
	    return _possibleConstructorReturn(this, (Distropha.__proto__ || Object.getPrototypeOf(Distropha)).apply(this, arguments));
	  }
	
	  _createClass(Distropha, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionEpisemataAbove(this.notes[0]);
	      this.positionEpisemataAbove(this.notes[1]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Distropha.prototype.__proto__ || Object.getPrototypeOf(Distropha.prototype), "performLayout", this).call(this, ctxt);
	      var glyphCodes = this.notes.map(function (note) {
	        return Apostropha.getNoteGlyphCode(note);
	      });
	      var glyphAdvance = ctxt.intraNeumeSpacing;
	      glyphCodes.slice(0, 2).forEach(function (glyphCode) {
	        if (glyphCode === _ExsurgeDrawing.GlyphCode.Stropha) glyphAdvance -= ctxt.intraNeumeSpacing / 4;
	      });
	
	      this.build(ctxt).noteAt(this.notes[0], glyphCodes[0]).advanceBy(glyphAdvance).noteAt(this.notes[1], glyphCodes[1]);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Distropha;
	}(Neume);
	
	/*
	 * Oriscus
	 */
	
	
	var Oriscus = exports.Oriscus = function (_Neume7) {
	  _inherits(Oriscus, _Neume7);
	
	  function Oriscus() {
	    _classCallCheck(this, Oriscus);
	
	    return _possibleConstructorReturn(this, (Oriscus.__proto__ || Object.getPrototypeOf(Oriscus)).apply(this, arguments));
	  }
	
	  _createClass(Oriscus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionEpisemataAbove(this.notes[0]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Oriscus.prototype.__proto__ || Object.getPrototypeOf(Oriscus.prototype), "performLayout", this).call(this, ctxt);
	
	      // determine the glyph to use
	      var note = this.notes[0];
	      var glyph;
	
	      if (note.liquescent !== _ExsurgeChant.LiquescentType.None) {
	        glyph = _ExsurgeDrawing.GlyphCode.OriscusLiquescent;
	      } else {
	        if (note.shapeModifiers & _ExsurgeChant.NoteShapeModifiers.Ascending) glyph = _ExsurgeDrawing.GlyphCode.OriscusAsc;else if (note.shapeModifiers & _ExsurgeChant.NoteShapeModifiers.Descending) glyph = _ExsurgeDrawing.GlyphCode.OriscusDes;else {
	          // by default we take the descending form, unless we can figure out by a lookahead here
	          glyph = _ExsurgeDrawing.GlyphCode.OriscusDes;
	
	          // try to find a neume following this one
	          var neume = ctxt.findNextNeume();
	
	          if (neume) {
	            var nextNoteStaffPosition = ctxt.activeClef.pitchToStaffPosition(neume.notes[0].pitch);
	
	            if (nextNoteStaffPosition > note.staffPosition) glyph = _ExsurgeDrawing.GlyphCode.OriscusAsc;
	          }
	        }
	      }
	
	      this.build(ctxt).noteAt(note, glyph);
	
	      this.finishLayout(ctxt);
	    }
	  }, {
	    key: "resetDependencies",
	    value: function resetDependencies() {
	      // a single oriscus tries to automatically use the right direction
	      // based on the following neumes. if we don't have a manually designated
	      // direction, then we reset our layout so that we can try to guess it
	      // at next layout phase.
	      if (this.notes[0].shapeModifiers & _ExsurgeChant.NoteShapeModifiers.Ascending || this.notes[0].shapeModifiers & _ExsurgeChant.NoteShapeModifiers.Descending) return;
	
	      this.needsLayout = true;
	    }
	  }]);
	
	  return Oriscus;
	}(Neume);
	
	/*
	 * PesQuassus
	 */
	
	
	var PesQuassus = exports.PesQuassus = function (_Neume8) {
	  _inherits(PesQuassus, _Neume8);
	
	  function PesQuassus() {
	    _classCallCheck(this, PesQuassus);
	
	    return _possibleConstructorReturn(this, (PesQuassus.__proto__ || Object.getPrototypeOf(PesQuassus)).apply(this, arguments));
	  }
	
	  _createClass(PesQuassus, [{
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(PesQuassus.prototype.__proto__ || Object.getPrototypeOf(PesQuassus.prototype), "performLayout", this).call(this, ctxt);
	
	      var lower = this.notes[0];
	      var upper = this.notes[1];
	
	      var lowerGlyph;
	
	      var lowerStaffPos = lower.staffPosition;
	      var upperStaffPos = upper.staffPosition;
	
	      if (lower.shape === _ExsurgeChant.NoteShape.Oriscus) lowerGlyph = _ExsurgeDrawing.GlyphCode.OriscusAsc;else lowerGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	
	      var builder = this.build(ctxt).noteAt(lower, lowerGlyph);
	
	      if (upperStaffPos - lowerStaffPos === 1)
	        // use a virga glyph in this case
	        builder.virgaAt(upper);else if (upper.liquescent === _ExsurgeChant.LiquescentType.LargeDescending) builder.noteAt(upper, _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent).withLineEndingAt(lower);else builder.noteAt(upper, _ExsurgeDrawing.GlyphCode.PunctumQuadratum).withLineEndingAt(lower);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return PesQuassus;
	}(Neume);
	
	/*
	 * PesSubpunctis
	 */
	
	
	var PesSubpunctis = exports.PesSubpunctis = function (_Neume9) {
	  _inherits(PesSubpunctis, _Neume9);
	
	  function PesSubpunctis() {
	    _classCallCheck(this, PesSubpunctis);
	
	    return _possibleConstructorReturn(this, (PesSubpunctis.__proto__ || Object.getPrototypeOf(PesSubpunctis)).apply(this, arguments));
	  }
	
	  _createClass(PesSubpunctis, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionPodatusEpisemata(this.notes[0], this.notes[1]);
	      for (var i = 2; i < this.notes.length; ++i) {
	        this.positionEpisemataAbove(this.notes[i]);
	      }
	      this.positionInclinataMorae(this.notes.slice(1));
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(PesSubpunctis.prototype.__proto__ || Object.getPrototypeOf(PesSubpunctis.prototype), "performLayout", this).call(this, ctxt);
	
	      // podatus followed by inclinata
	      this.build(ctxt).withPodatus(this.notes[0], this.notes[1]).advanceBy(ctxt.intraNeumeSpacing * 0.68).withInclinata(this.notes.slice(2));
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return PesSubpunctis;
	}(Neume);
	
	/*
	 * Podatus
	 *
	 * This podatus class handles a few neume types actually, depending on the note
	 * data: Podatus (including various liquescent types on the upper note),
	 * Podatus initio debilis, and Quilisma-Pes
	 */
	
	
	var Podatus = exports.Podatus = function (_Neume10) {
	  _inherits(Podatus, _Neume10);
	
	  function Podatus() {
	    _classCallCheck(this, Podatus);
	
	    return _possibleConstructorReturn(this, (Podatus.__proto__ || Object.getPrototypeOf(Podatus)).apply(this, arguments));
	  }
	
	  _createClass(Podatus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionPodatusMarkings(this.notes[0], this.notes[1]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Podatus.prototype.__proto__ || Object.getPrototypeOf(Podatus.prototype), "performLayout", this).call(this, ctxt);
	
	      this.build(ctxt).withPodatus(this.notes[0], this.notes[1]);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Podatus;
	}(Neume);
	
	/*
	 * Porrectus
	 */
	
	
	var Porrectus = exports.Porrectus = function (_Neume11) {
	  _inherits(Porrectus, _Neume11);
	
	  function Porrectus() {
	    _classCallCheck(this, Porrectus);
	
	    return _possibleConstructorReturn(this, (Porrectus.__proto__ || Object.getPrototypeOf(Porrectus)).apply(this, arguments));
	  }
	
	  _createClass(Porrectus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionPorrectusMarkings(this.notes[0], this.notes[1], this.notes[2]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Porrectus.prototype.__proto__ || Object.getPrototypeOf(Porrectus.prototype), "performLayout", this).call(this, ctxt);
	
	      var first = this.notes[0];
	      var second = this.notes[1];
	      var third = this.notes[2];
	
	      var thirdGlyph;
	
	      if (third.liquescent & _ExsurgeChant.LiquescentType.Small) thirdGlyph = _ExsurgeDrawing.GlyphCode.TerminatingAscLiquescent;else if (third.liquescent & _ExsurgeChant.LiquescentType.Descending) thirdGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;else thirdGlyph = _ExsurgeDrawing.GlyphCode.PodatusUpper;
	
	      this.build(ctxt).lineFrom(second).withPorrectusSwash(first, second).noteAt(third, thirdGlyph);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Porrectus;
	}(Neume);
	
	/*
	 * PorrectusFlexus
	 */
	
	
	var PorrectusFlexus = exports.PorrectusFlexus = function (_Neume12) {
	  _inherits(PorrectusFlexus, _Neume12);
	
	  function PorrectusFlexus() {
	    _classCallCheck(this, PorrectusFlexus);
	
	    return _possibleConstructorReturn(this, (PorrectusFlexus.__proto__ || Object.getPrototypeOf(PorrectusFlexus)).apply(this, arguments));
	  }
	
	  _createClass(PorrectusFlexus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionPorrectusFlexusMarkings(this.notes[0], this.notes[1], this.notes[2], this.notes[3]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(PorrectusFlexus.prototype.__proto__ || Object.getPrototypeOf(PorrectusFlexus.prototype), "performLayout", this).call(this, ctxt);
	
	      var first = this.notes[0];
	      var second = this.notes[1];
	      var third = this.notes[2];
	      var fourth = this.notes[3];
	
	      var thirdGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum,
	          fourthGlyph;
	
	      if (fourth.liquescent & _ExsurgeChant.LiquescentType.Small) {
	        thirdGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;
	        fourthGlyph = _ExsurgeDrawing.GlyphCode.TerminatingDesLiquescent;
	      } else if (fourth.liquescent & _ExsurgeChant.LiquescentType.Ascending) fourthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumAscLiquescent;else if (fourth.liquescent & _ExsurgeChant.LiquescentType.Descending) fourthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;else fourthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	
	      this.build(ctxt).lineFrom(second).withPorrectusSwash(first, second).noteAt(third, thirdGlyph).noteAt(fourth, fourthGlyph);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return PorrectusFlexus;
	}(Neume);
	
	// this is some type of pseudo nume right? there is no such thing as a neume
	// of puncta inclinata, but this will be part of other composite neumes.
	
	
	var PunctaInclinata = exports.PunctaInclinata = function (_Neume13) {
	  _inherits(PunctaInclinata, _Neume13);
	
	  function PunctaInclinata() {
	    _classCallCheck(this, PunctaInclinata);
	
	    return _possibleConstructorReturn(this, (PunctaInclinata.__proto__ || Object.getPrototypeOf(PunctaInclinata)).apply(this, arguments));
	  }
	
	  _createClass(PunctaInclinata, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionInclinataMorae(this.notes);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(PunctaInclinata.prototype.__proto__ || Object.getPrototypeOf(PunctaInclinata.prototype), "performLayout", this).call(this, ctxt);
	
	      this.build(ctxt).withInclinata(this.notes);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return PunctaInclinata;
	}(Neume);
	
	/*
	 * Punctum
	 */
	
	
	var Punctum = exports.Punctum = function (_Neume14) {
	  _inherits(Punctum, _Neume14);
	
	  function Punctum() {
	    _classCallCheck(this, Punctum);
	
	    return _possibleConstructorReturn(this, (Punctum.__proto__ || Object.getPrototypeOf(Punctum)).apply(this, arguments));
	  }
	
	  _createClass(Punctum, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionEpisemataAbove(this.notes[0]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Punctum.prototype.__proto__ || Object.getPrototypeOf(Punctum.prototype), "performLayout", this).call(this, ctxt);
	
	      var note = this.notes[0];
	      var glyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	
	      // determine the glyph to use
	      if (note.liquescent !== _ExsurgeChant.LiquescentType.None) {
	        if (note.shape === _ExsurgeChant.NoteShape.Inclinatum) glyph = _ExsurgeDrawing.GlyphCode.PunctumInclinatumLiquescent;else if (note.shape === _ExsurgeChant.NoteShape.Oriscus) glyph = _ExsurgeDrawing.GlyphCode.OriscusLiquescent;else if (note.liquescent & _ExsurgeChant.LiquescentType.Ascending) glyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumAscLiquescent;else if (note.liquescent & _ExsurgeChant.LiquescentType.Descending) glyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;else glyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumLiquescent;
	      } else {
	        if (note.shapeModifiers & _ExsurgeChant.NoteShapeModifiers.Cavum) glyph = _ExsurgeDrawing.GlyphCode.PunctumCavum;else if (note.shape === _ExsurgeChant.NoteShape.Inclinatum) glyph = _ExsurgeDrawing.GlyphCode.PunctumInclinatum;else if (note.shape === _ExsurgeChant.NoteShape.Quilisma) glyph = _ExsurgeDrawing.GlyphCode.Quilisma;else glyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	      }
	
	      this.build(ctxt).noteAt(note, glyph);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Punctum;
	}(Neume);
	
	/*
	 * Salicus
	 */
	
	
	var Salicus = exports.Salicus = function (_Neume15) {
	  _inherits(Salicus, _Neume15);
	
	  function Salicus() {
	    _classCallCheck(this, Salicus);
	
	    return _possibleConstructorReturn(this, (Salicus.__proto__ || Object.getPrototypeOf(Salicus)).apply(this, arguments));
	  }
	
	  _createClass(Salicus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      // by default place episema below
	      // fixme: is this correct?
	      for (var i = 0; i < this.notes.length; i++) {
	        this.positionEpisemataBelow(this.notes[i]);
	      }
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Salicus.prototype.__proto__ || Object.getPrototypeOf(Salicus.prototype), "performLayout", this).call(this, ctxt);
	
	      var first = this.notes[0];
	      var second = this.notes[1];
	      var third = this.notes[2];
	
	      var builder = this.build(ctxt).noteAt(first, _ExsurgeDrawing.GlyphCode.PunctumQuadratum);
	
	      // if the next note doesn't require a stem connector, then add a tad bit
	      // of spacing here
	      if (!(second.shapeModifiers & _ExsurgeChant.NoteShapeModifiers.Stemmed)) builder.advanceBy(ctxt.intraNeumeSpacing);
	
	      // second note is always an oriscus, which may or may not be stemmed
	      // to the first
	      builder.noteAt(second, _ExsurgeDrawing.GlyphCode.OriscusAsc);
	
	      // third note can be a punctum quadratum or various liquescent forms
	      if (third.liquescent & _ExsurgeChant.LiquescentType.Small) builder.noteAt(third, _ExsurgeDrawing.GlyphCode.TerminatingAscLiquescent);else if (third.liquescent === _ExsurgeChant.LiquescentType.Ascending) builder.noteAt(third, _ExsurgeDrawing.GlyphCode.PunctumQuadratumAscLiquescent);else if (third.liquescent === _ExsurgeChant.LiquescentType.Descending) builder.noteAt(third, _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent);else builder.virgaAt(third);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Salicus;
	}(Neume);
	
	/*
	 * Salicus Flexus
	 */
	
	
	var SalicusFlexus = exports.SalicusFlexus = function (_Neume16) {
	  _inherits(SalicusFlexus, _Neume16);
	
	  function SalicusFlexus() {
	    _classCallCheck(this, SalicusFlexus);
	
	    return _possibleConstructorReturn(this, (SalicusFlexus.__proto__ || Object.getPrototypeOf(SalicusFlexus)).apply(this, arguments));
	  }
	
	  _createClass(SalicusFlexus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      var hasTopEpisema = this.positionTorculusMarkings(this.notes[1], this.notes[2], this.notes[3]);
	      this.positionEpisemata(this.notes[0], hasTopEpisema ? _ExsurgeDrawing.MarkingPositionHint.Above : _ExsurgeDrawing.MarkingPositionHint.Below);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(SalicusFlexus.prototype.__proto__ || Object.getPrototypeOf(SalicusFlexus.prototype), "performLayout", this).call(this, ctxt);
	
	      var first = this.notes[0];
	      var second = this.notes[1];
	      var third = this.notes[2];
	      var fourth = this.notes[3];
	
	      var builder = this.build(ctxt).noteAt(first, _ExsurgeDrawing.GlyphCode.PunctumQuadratum);
	
	      // if the next note doesn't require a stem connector, then add a tad bit
	      // of spacing here
	      if (!(second.shapeModifiers & _ExsurgeChant.NoteShapeModifiers.Stemmed)) builder.advanceBy(ctxt.intraNeumeSpacing);
	
	      // second note is always an oriscus, which may or may not be stemmed
	      // to the first
	      builder.noteAt(second, _ExsurgeDrawing.GlyphCode.OriscusAsc);
	
	      // third note can be a punctum quadratum or various liquescent forms,
	      // ...based on note four though!
	      if (fourth.liquescent & _ExsurgeChant.LiquescentType.Small) builder.noteAt(third, _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent);else builder.noteAt(third, _ExsurgeDrawing.GlyphCode.PunctumQuadratum);
	
	      // finally, do the fourth note
	      if (fourth.liquescent & _ExsurgeChant.LiquescentType.Small) builder.noteAt(fourth, _ExsurgeDrawing.GlyphCode.TerminatingDesLiquescent);else if (fourth.liquescent & _ExsurgeChant.LiquescentType.Ascending) builder.noteAt(fourth, _ExsurgeDrawing.GlyphCode.PunctumQuadratumAscLiquescent);else if (fourth.liquescent & _ExsurgeChant.LiquescentType.Descending) builder.noteAt(fourth, _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent);else builder.noteAt(fourth, _ExsurgeDrawing.GlyphCode.PunctumQuadratum);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return SalicusFlexus;
	}(Neume);
	
	/*
	 * Scandicus
	 */
	
	
	var Scandicus = exports.Scandicus = function (_Neume17) {
	  _inherits(Scandicus, _Neume17);
	
	  function Scandicus() {
	    _classCallCheck(this, Scandicus);
	
	    return _possibleConstructorReturn(this, (Scandicus.__proto__ || Object.getPrototypeOf(Scandicus)).apply(this, arguments));
	  }
	
	  _createClass(Scandicus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      if (this.notes[2].shape === _ExsurgeChant.NoteShape.Virga) {
	        this.positionPodatusMarkings(this.notes[0], this.notes[1]);
	        this.positionEpisemataAbove(this.notes[2]);
	      } else {
	        this.positionEpisemataBelow(this.notes[0]);
	        this.positionPodatusMarkings(this.notes[1], this.notes[2]);
	      }
	    }
	
	    // if the third note shape is a virga, then the scadicus is rendered
	    // as a podatus followed by a virga. Otherwise, it's rendered as a
	    // punctum followed by a podatus...
	
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Scandicus.prototype.__proto__ || Object.getPrototypeOf(Scandicus.prototype), "performLayout", this).call(this, ctxt);
	
	      var first = this.notes[0];
	      var second = this.notes[1];
	      var third = this.notes[2];
	
	      if (third.shape === _ExsurgeChant.NoteShape.Virga) {
	        this.build(ctxt).withPodatus(first, second).virgaAt(third);
	      } else {
	        this.build(ctxt).noteAt(first, first.shape === _ExsurgeChant.NoteShape.Quilisma ? _ExsurgeDrawing.GlyphCode.Quilisma : _ExsurgeDrawing.GlyphCode.PunctumQuadratum).withPodatus(second, third);
	      }
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Scandicus;
	}(Neume);
	
	/*
	 * Scandicus Flexus
	 */
	
	
	var ScandicusFlexus = exports.ScandicusFlexus = function (_Neume18) {
	  _inherits(ScandicusFlexus, _Neume18);
	
	  function ScandicusFlexus() {
	    _classCallCheck(this, ScandicusFlexus);
	
	    return _possibleConstructorReturn(this, (ScandicusFlexus.__proto__ || Object.getPrototypeOf(ScandicusFlexus)).apply(this, arguments));
	  }
	
	  _createClass(ScandicusFlexus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      if (this.notes[2].shape === _ExsurgeChant.NoteShape.Virga) {
	        this.positionPodatusMarkings(this.notes[0], this.notes[1]);
	        this.positionClivisMarkings(this.notes[2], this.notes[3]);
	      } else {
	        this.positionEpisemataBelow(this.notes[0]);
	        this.positionPodatusMarkings(this.notes[1], this.notes[2]);
	        this.positionEpisemataAbove(this.notes[3]);
	      }
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(ScandicusFlexus.prototype.__proto__ || Object.getPrototypeOf(ScandicusFlexus.prototype), "performLayout", this).call(this, ctxt);
	
	      var first = this.notes[0];
	      var second = this.notes[1];
	      var third = this.notes[2];
	      var fourth = this.notes[3];
	
	      if (third.shape === _ExsurgeChant.NoteShape.Virga) {
	        this.build(ctxt).withPodatus(first, second).advanceBy(ctxt.intraNeumeSpacing).withClivis(third, fourth);
	      } else {
	        var fourthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	
	        if (fourth.liquescent & _ExsurgeChant.LiquescentType.Ascending) fourthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumAscLiquescent;else if (fourth.liquescent & _ExsurgeChant.LiquescentType.Descending) fourthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;
	
	        this.build(ctxt).noteAt(first, _ExsurgeDrawing.GlyphCode.PunctumQuadratum).withPodatus(second, third).advanceBy(ctxt.intraNeumeSpacing).noteAt(fourth, fourthGlyph);
	      }
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return ScandicusFlexus;
	}(Neume);
	
	/*
	 * Torculus
	 */
	
	
	var Torculus = exports.Torculus = function (_Neume19) {
	  _inherits(Torculus, _Neume19);
	
	  function Torculus() {
	    _classCallCheck(this, Torculus);
	
	    return _possibleConstructorReturn(this, (Torculus.__proto__ || Object.getPrototypeOf(Torculus)).apply(this, arguments));
	  }
	
	  _createClass(Torculus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionTorculusMarkings(this.notes[0], this.notes[1], this.notes[2]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Torculus.prototype.__proto__ || Object.getPrototypeOf(Torculus.prototype), "performLayout", this).call(this, ctxt);
	
	      var note1 = this.notes[0];
	      var note2 = this.notes[1];
	      var note3 = this.notes[2];
	
	      var glyph1, glyph3;
	
	      if (note1.liquescent === _ExsurgeChant.LiquescentType.InitioDebilis) glyph1 = _ExsurgeDrawing.GlyphCode.TerminatingDesLiquescent;else if (note1.shape === _ExsurgeChant.NoteShape.Quilisma) glyph1 = _ExsurgeDrawing.GlyphCode.Quilisma;else glyph1 = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	
	      if (note3.liquescent & _ExsurgeChant.LiquescentType.Small) glyph3 = _ExsurgeDrawing.GlyphCode.TerminatingDesLiquescent;else if (note3.liquescent & _ExsurgeChant.LiquescentType.Ascending) glyph3 = _ExsurgeDrawing.GlyphCode.PunctumQuadratumAscLiquescent;else if (note3.liquescent & _ExsurgeChant.LiquescentType.Descending) glyph3 = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;else glyph3 = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	
	      this.build(ctxt).noteAt(note1, glyph1).noteAt(note2, _ExsurgeDrawing.GlyphCode.PunctumQuadratum).noteAt(note3, glyph3);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Torculus;
	}(Neume);
	
	/*
	 * TorculusResupinus
	 */
	
	
	var TorculusResupinus = exports.TorculusResupinus = function (_Neume20) {
	  _inherits(TorculusResupinus, _Neume20);
	
	  function TorculusResupinus() {
	    _classCallCheck(this, TorculusResupinus);
	
	    return _possibleConstructorReturn(this, (TorculusResupinus.__proto__ || Object.getPrototypeOf(TorculusResupinus)).apply(this, arguments));
	  }
	
	  _createClass(TorculusResupinus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionPorrectusMarkings(this.notes[1], this.notes[2], this.notes[3]);
	      this.positionClivisEpisemata(this.notes[1], this.notes[0]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(TorculusResupinus.prototype.__proto__ || Object.getPrototypeOf(TorculusResupinus.prototype), "performLayout", this).call(this, ctxt);
	
	      var first = this.notes[0];
	      var second = this.notes[1];
	      var third = this.notes[2];
	      var fourth = this.notes[3];
	
	      var firstGlyph, fourthGlyph;
	
	      if (first.liquescent === _ExsurgeChant.LiquescentType.InitioDebilis) {
	        firstGlyph = _ExsurgeDrawing.GlyphCode.TerminatingDesLiquescent;
	      } else if (first.shape === _ExsurgeChant.NoteShape.Quilisma) firstGlyph = _ExsurgeDrawing.GlyphCode.Quilisma;else firstGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	
	      if (fourth.liquescent & _ExsurgeChant.LiquescentType.Small) fourthGlyph = _ExsurgeDrawing.GlyphCode.TerminatingAscLiquescent;else if (third.liquescent & _ExsurgeChant.LiquescentType.Descending) fourthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;else fourthGlyph = _ExsurgeDrawing.GlyphCode.PodatusUpper;
	
	      this.build(ctxt).noteAt(first, firstGlyph).withPorrectusSwash(second, third).noteAt(fourth, fourthGlyph);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return TorculusResupinus;
	}(Neume);
	
	/*
	 * TorculusResupinusFlexus
	 */
	
	
	var TorculusResupinusFlexus = exports.TorculusResupinusFlexus = function (_Neume21) {
	  _inherits(TorculusResupinusFlexus, _Neume21);
	
	  function TorculusResupinusFlexus() {
	    _classCallCheck(this, TorculusResupinusFlexus);
	
	    return _possibleConstructorReturn(this, (TorculusResupinusFlexus.__proto__ || Object.getPrototypeOf(TorculusResupinusFlexus)).apply(this, arguments));
	  }
	
	  _createClass(TorculusResupinusFlexus, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionPorrectusFlexusMarkings(this.notes[1], this.notes[2], this.notes[3], this.notes[4]);
	      this.positionClivisEpisemata(this.notes[1], this.notes[0]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(TorculusResupinusFlexus.prototype.__proto__ || Object.getPrototypeOf(TorculusResupinusFlexus.prototype), "performLayout", this).call(this, ctxt);
	
	      var first = this.notes[0];
	      var second = this.notes[1];
	      var third = this.notes[2];
	      var fourth = this.notes[3];
	      var fifth = this.notes[4];
	
	      var firstGlyph,
	          fourthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum,
	          fifthGlyph;
	
	      if (first.liquescent === _ExsurgeChant.LiquescentType.InitioDebilis) {
	        firstGlyph = _ExsurgeDrawing.GlyphCode.TerminatingDesLiquescent;
	      } else if (first.shape === _ExsurgeChant.NoteShape.Quilisma) firstGlyph = _ExsurgeDrawing.GlyphCode.Quilisma;else firstGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	
	      if (fifth.liquescent & _ExsurgeChant.LiquescentType.Small) {
	        fourthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;
	        fifthGlyph = _ExsurgeDrawing.GlyphCode.TerminatingDesLiquescent;
	      } else if (fifth.liquescent & _ExsurgeChant.LiquescentType.Ascending) fifthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumAscLiquescent;else if (fifth.liquescent & _ExsurgeChant.LiquescentType.Descending) fifthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratumDesLiquescent;else fifthGlyph = _ExsurgeDrawing.GlyphCode.PunctumQuadratum;
	
	      this.build(ctxt).noteAt(first, firstGlyph).withPorrectusSwash(second, third).noteAt(fourth, fourthGlyph).noteAt(fifth, fifthGlyph);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return TorculusResupinusFlexus;
	}(Neume);
	
	/*
	 * Tristropha
	 *
	 * For simplicity in implementation, Tristropha's have three notes in the object
	 * structure. These technically must be the same pitch though (like the
	 * Distropha and Bivirga).
	 */
	
	
	var Tristropha = exports.Tristropha = function (_Neume22) {
	  _inherits(Tristropha, _Neume22);
	
	  function Tristropha() {
	    _classCallCheck(this, Tristropha);
	
	    return _possibleConstructorReturn(this, (Tristropha.__proto__ || Object.getPrototypeOf(Tristropha)).apply(this, arguments));
	  }
	
	  _createClass(Tristropha, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionEpisemataAbove(this.notes[0]);
	      this.positionEpisemataAbove(this.notes[1]);
	      this.positionEpisemataAbove(this.notes[2]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Tristropha.prototype.__proto__ || Object.getPrototypeOf(Tristropha.prototype), "performLayout", this).call(this, ctxt);
	      var glyphCodes = this.notes.map(function (note) {
	        return Apostropha.getNoteGlyphCode(note);
	      });
	      var glyphAdvance = glyphCodes[0] === _ExsurgeDrawing.GlyphCode.Stropha ? ctxt.intraNeumeSpacing / 2 : ctxt.intraNeumeSpacing;
	
	      this.build(ctxt).noteAt(this.notes[0], glyphCodes[0]).advanceBy(glyphAdvance).noteAt(this.notes[1], glyphCodes[1]).advanceBy(glyphAdvance).noteAt(this.notes[2], glyphCodes[2]);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Tristropha;
	}(Neume);
	
	/*
	 * Virga
	 */
	
	
	var Virga = exports.Virga = function (_Neume23) {
	  _inherits(Virga, _Neume23);
	
	  function Virga() {
	    _classCallCheck(this, Virga);
	
	    return _possibleConstructorReturn(this, (Virga.__proto__ || Object.getPrototypeOf(Virga)).apply(this, arguments));
	  }
	
	  _createClass(Virga, [{
	    key: "positionMarkings",
	    value: function positionMarkings() {
	      this.positionEpisemataAbove(this.notes[0]);
	    }
	  }, {
	    key: "performLayout",
	    value: function performLayout(ctxt) {
	      _get(Virga.prototype.__proto__ || Object.getPrototypeOf(Virga.prototype), "performLayout", this).call(this, ctxt);
	
	      this.build(ctxt).virgaAt(this.notes[0]);
	
	      this.finishLayout(ctxt);
	    }
	  }]);
	
	  return Virga;
	}(Neume);

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Titles = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _ExsurgeCore = __webpack_require__(1);
	
	var _ExsurgeDrawing = __webpack_require__(4);
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //
	// Author(s):
	// Benjamin Bloomfield <benjamin@sourceandsummit.com>
	//
	// Copyright (c) 2019
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
	
	var Titles = exports.Titles = function (_ChantLayoutElement) {
	  _inherits(Titles, _ChantLayoutElement);
	
	  function Titles(ctxt, score) {
	    var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
	        supertitle = _ref.supertitle,
	        title = _ref.title,
	        subtitle = _ref.subtitle,
	        textLeft = _ref.textLeft,
	        textRight = _ref.textRight;
	
	    _classCallCheck(this, Titles);
	
	    var _this = _possibleConstructorReturn(this, (Titles.__proto__ || Object.getPrototypeOf(Titles)).call(this));
	
	    _this.score = score;
	    _this.setSupertitle(ctxt, supertitle);
	    _this.setTitle(ctxt, title);
	    _this.setSubtitle(ctxt, subtitle);
	    _this.setTextLeft(ctxt, textLeft);
	    _this.setTextRight(ctxt, textRight);
	    return _this;
	  }
	
	  _createClass(Titles, [{
	    key: "setBoundsX",
	    value: function setBoundsX(ctxt, elementName, width) {
	      var element = this[elementName];
	      switch (ctxt.textStyles[elementName].alignment) {
	        case "left":
	          element.textAnchor = "start";
	          element.bounds.x = 0;
	          break;
	        case "right":
	          element.textAnchor = "end";
	          element.bounds.x = width;
	          break;
	        case "center":
	        default:
	          element.textAnchor = "middle";
	          element.bounds.x = width / 2;
	      }
	    }
	
	    /**
	     * Lays out the titles, and returns their total height
	     * @param  {ChantContext} ctxt
	     * @return {number}      the tottal height of titles laid out
	     */
	
	  }, {
	    key: "layoutTitles",
	    value: function layoutTitles(ctxt, width) {
	      this.bounds = new _ExsurgeCore.Rect(0, 0, 0, 0);
	      var y = 0;
	      if (this.supertitle) {
	        this.supertitle.recalculateMetrics(ctxt);
	        this.supertitle.setMaxWidth(ctxt, width);
	
	        this.setBoundsX(ctxt, "supertitle", width);
	        this.supertitle.bounds.y = y;
	        this.bounds.union(this.supertitle.bounds);
	        this.supertitle.bounds.y += this.supertitle.origin.y;
	        y += this.supertitle.bounds.height + this.supertitle.padding(ctxt);
	      }
	      if (this.title) {
	        if (y) y += this.title.padding(ctxt);
	        this.title.recalculateMetrics(ctxt);
	        this.title.setMaxWidth(ctxt, width);
	        this.setBoundsX(ctxt, "title", width);
	        this.title.bounds.y = y;
	        this.bounds.union(this.title.bounds);
	        this.title.bounds.y += this.title.origin.y;
	        y += this.title.bounds.height + this.title.padding(ctxt);
	      }
	      if (this.subtitle) {
	        if (y) y += this.subtitle.padding(ctxt);
	        this.subtitle.recalculateMetrics(ctxt);
	        this.subtitle.setMaxWidth(ctxt, width);
	        this.setBoundsX(ctxt, "subtitle", width);
	        this.subtitle.bounds.y = y;
	        this.bounds.union(this.subtitle.bounds);
	        this.subtitle.bounds.y += this.subtitle.origin.y;
	        y += this.subtitle.bounds.height + this.subtitle.padding(ctxt);
	      }
	      var finalY = y,
	          textLeft = this.score.overrideTextLeft || this.textLeft;
	      if (textLeft) {
	        textLeft.recalculateMetrics(ctxt);
	        textLeft.bounds.y = y;
	        this.bounds.union(textLeft.bounds);
	        textLeft.bounds.y += textLeft.origin.y;
	        finalY = y + textLeft.bounds.height + textLeft.padding(ctxt);
	      }
	      if (this.textRight) {
	        this.textRight.recalculateMetrics(ctxt);
	        this.textRight.bounds.x = width;
	        this.textRight.bounds.y = y;
	        this.bounds.union(this.textRight.bounds);
	        this.textRight.bounds.y += this.textRight.origin.y;
	        finalY = Math.max(finalY, y + this.textRight.bounds.height + this.textRight.padding(ctxt));
	      }
	      return finalY;
	    }
	  }, {
	    key: "setSupertitle",
	    value: function setSupertitle(ctxt, supertitle) {
	      this.supertitle = supertitle ? new _ExsurgeDrawing.Supertitle(ctxt, supertitle) : null;
	    }
	  }, {
	    key: "setTitle",
	    value: function setTitle(ctxt, title) {
	      this.title = title ? new _ExsurgeDrawing.Title(ctxt, title) : null;
	    }
	  }, {
	    key: "setSubtitle",
	    value: function setSubtitle(ctxt, subtitle) {
	      this.subtitle = subtitle ? new _ExsurgeDrawing.Subtitle(ctxt, subtitle) : null;
	    }
	  }, {
	    key: "setTextLeft",
	    value: function setTextLeft(ctxt, textLeft) {
	      this.textLeft = textLeft ? new _ExsurgeDrawing.TextLeftRight(ctxt, textLeft, "textLeft") : null;
	    }
	  }, {
	    key: "setTextRight",
	    value: function setTextRight(ctxt, textRight) {
	      this.textRight = textRight ? new _ExsurgeDrawing.TextLeftRight(ctxt, textRight, "textRight") : null;
	    }
	  }, {
	    key: "hasSupertitle",
	    value: function hasSupertitle(ctxt, supertitle) {
	      return !!this.supertitle;
	    }
	  }, {
	    key: "hasTitle",
	    value: function hasTitle(ctxt, title) {
	      return !!this.title;
	    }
	  }, {
	    key: "hasSubtitle",
	    value: function hasSubtitle(ctxt, subtitle) {
	      return !!this.subtitle;
	    }
	  }, {
	    key: "hasTextLeft",
	    value: function hasTextLeft(ctxt, textLeft) {
	      return !!this.textLeft;
	    }
	  }, {
	    key: "hasTextRight",
	    value: function hasTextRight(ctxt, textRight) {
	      return !!this.textRight;
	    }
	  }, {
	    key: "draw",
	    value: function draw(ctxt) {
	      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
	
	      var canvasCtxt = ctxt.canvasCtxt;
	      canvasCtxt.translate(this.bounds.x, this.bounds.y);
	
	      var _arr = [this.supertitle, this.title, this.subtitle, this.score.overrideTextLeft || this.textLeft, this.textRight];
	      for (var _i = 0; _i < _arr.length; _i++) {
	        var el = _arr[_i];
	        if (el) el.draw(ctxt, scale);
	      }
	
	      canvasCtxt.translate(-this.bounds.x, -this.bounds.y);
	    }
	  }, {
	    key: "getInnerNodes",
	    value: function getInnerNodes(ctxt) {
	      var functionName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "createSvgNode";
	
	      var nodes = [];
	
	      var _arr2 = [this.supertitle, this.title, this.subtitle, this.score.overrideTextLeft || this.textLeft, this.textRight];
	      for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
	        var el = _arr2[_i2];
	        if (el) nodes.push(el[functionName](ctxt));
	      }
	      return nodes;
	    }
	  }, {
	    key: "createSvgNode",
	    value: function createSvgNode(ctxt) {
	      var nodes = this.getInnerNodes(ctxt, "createSvgNode");
	
	      var node = _ExsurgeDrawing.QuickSvg.createNode("g", { class: "Titles" }, nodes);
	
	      node.source = this;
	      this.svg = node;
	
	      return node;
	    }
	  }, {
	    key: "createSvgTree",
	    value: function createSvgTree(ctxt) {
	      var nodes = this.getInnerNodes(ctxt, "createSvgTree");
	
	      return _ExsurgeDrawing.QuickSvg.createSvgTree.apply(_ExsurgeDrawing.QuickSvg, ["g", { class: "Titles", source: this }].concat(_toConsumableArray(nodes)));
	    }
	  }, {
	    key: "createSvgFragment",
	    value: function createSvgFragment(ctxt) {
	      var fragment = "";
	
	      var _arr3 = [this.supertitle, this.title, this.subtitle, this.score.overrideTextLeft || this.textLeft, this.textRight];
	      for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
	        var el = _arr3[_i3];
	        if (el) fragment += el.createSvgFragment(ctxt);
	      }
	
	      fragment = _ExsurgeDrawing.QuickSvg.createFragment("g", { class: "Titles" }, fragment);
	      return fragment;
	    }
	  }]);
	
	  return Titles;
	}(_ExsurgeDrawing.ChantLayoutElement);

/***/ })
/******/ ])
});
;
//# sourceMappingURL=exsurge.js.map