// Times parsing, layout and SVG output of a large score, measuring text the way the
// server (fontkit) and the browser (canvas) do, with stand-ins for the fonts so that
// the timings are of exsurge rather than of a font engine.
//
// usage: node bench/layout.js [file.gabc ...]
// With no files, a built-in passage is repeated to make a long score.
// To time real fonts as well, set BENCH_FONT to a .ttf or .otf file and
// BENCH_FONTKIT and/or BENCH_OPENTYPE to where fontkit or opentype.js is installed.
require('babel-core/register');
var fs = require('fs');
var Chant = require('../src/Exsurge.Chant');
var Drawing = require('../src/Exsurge.Drawing');
var Gabc = require('../src/Exsurge.Gabc').Gabc;

var passage =
  "(c4) AD(c)te(d) le(f)vá(fe)vi(f) á(fg)ni(gf)mam(f) me(fe)am:(e.) (,) De(f)us(fg) me(f)us,(fe) in(e) te(f) con(gh)fí(g)do,(fe) (;) " +
  "non(f) e(fe)ru(c)bé(d)scam:(fe..) (:) ne(f)que(f) ir(fe)rí(fg)de(gf)ant(f) me(fe) in(f)i(gh)mí(g)ci(fe) me(f)i:(f.) (;) " +
  "<i>et</i>(f) e(fg)nim(f) u(fe)ni(e)vér(f)si(gh) qui(g) te(fe) ex(f)spé(fe)ctant,(e.) (,) non(d) con(fe)fun(f)dén(gf)tur.(f.) (::) " +
  "E(f)<sp>'ae</sp>(g) <b>vi</b>(h)as(g) <sc>tu</sc>(f)as,(e) Dó(f)mi(gh)ne,(g.) (;) de(f)món(fe)stra(c) mi(d)hi:(fe..) (::) ";

function readScore(files) {
  if (!files.length) return new Array(40).join(passage);
  return files
    .map(function(f) {
      var src = fs.readFileSync(f, 'utf8');
      var i = src.indexOf('%%');
      return i >= 0 ? src.slice(i + 2) : src;
    })
    .join('\n');
}

var measurements = 0;
var font = {
  unitsPerEm: 1000,
  layout: function(text, features) {
    measurements++;
    var w = 0;
    for (var i = 0; i < text.length; i++) w += 300 + ((text.charCodeAt(i) * 37) % 400);
    if (features && features.smcp) w *= 0.8;
    return { advanceWidth: w, bbox: { minX: 10, maxY: 700, height: 920 } };
  }
};
var canvasCtxt = {
  font: '10px serif',
  measureText: function(text) {
    measurements++;
    var size = parseFloat(this.font.match(/([\d.]+)px/)[1]);
    var w = 0;
    for (var i = 0; i < text.length; i++) w += 300 + ((text.charCodeAt(i) * 37) % 400);
    return {
      width: (w * size) / 1000,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxAscent: 0.7 * size,
      actualBoundingBoxDescent: 0.22 * size
    };
  }
};

var realFonts = {};
if (process.env.BENCH_FONT) {
  if (process.env.BENCH_FONTKIT)
    realFonts.fontkit = require(process.env.BENCH_FONTKIT).openSync(process.env.BENCH_FONT);
  if (process.env.BENCH_OPENTYPE)
    realFonts.opentype = require(process.env.BENCH_OPENTYPE).loadSync(process.env.BENCH_FONT);
}

function createContext(strategy) {
  var ctxt = new Drawing.ChantContext();
  if (strategy === 'fake fontkit') {
    ctxt.setFont('Fake', 16, {}, { Regular: font });
  } else if (strategy !== 'fake canvas') {
    ctxt.setFont('Real', 16, {}, { Regular: realFonts[strategy] });
  } else {
    ctxt.setFont("'Fake', serif", 16);
    ctxt.textMeasuringStrategy = Drawing.TextMeasuringStrategy.Canvas;
    ctxt.canvasCtxt = canvasCtxt;
    ctxt.updateHyphenWidth();
  }
  return ctxt;
}

function now() {
  var t = process.hrtime();
  return t[0] * 1e3 + t[1] / 1e6;
}

function run(gabc, strategy) {
  var ctxt = createContext(strategy);
  var times = {};
  var t = now();
  var mappings = Gabc.createMappingsFromSource(ctxt, gabc);
  times.parse = now() - t;
  t = now();
  var score = new Chant.ChantScore(ctxt, mappings, true);
  score.performLayout(ctxt);
  times.performLayout = now() - t;
  t = now();
  score.layoutChantLines(ctxt, 800);
  times.layoutChantLines = now() - t;
  t = now();
  score.layoutChantLines(ctxt, 500);
  times.relayout = now() - t;
  t = now();
  score.createSvg(ctxt);
  times.createSvg = now() - t;
  times.total = Object.keys(times).reduce(function(sum, key) { return sum + times[key]; }, 0);
  return times;
}

function median(values) {
  values = values.slice().sort(function(a, b) { return a - b; });
  return values[Math.floor(values.length / 2)];
}

var gabc = readScore(process.argv.slice(2));
var iterations = 7;
['fake fontkit', 'fake canvas'].concat(Object.keys(realFonts)).forEach(function(strategy) {
  run(gabc, strategy); // warm up
  var runs = [];
  measurements = 0;
  for (var i = 0; i < iterations; i++) runs.push(run(gabc, strategy));
  var perRun = Math.round(measurements / iterations);
  var line = Object.keys(runs[0]).map(function(key) {
    return key + ' ' + median(runs.map(function(r) { return r[key]; })).toFixed(1) + 'ms';
  });
  if (perRun) line.push(perRun + ' text measurements');
  console.log(strategy + ': ' + line.join(', '));
});
