// The scores that the golden tests render, chosen to reach every kind of
// notation, marking and text that exsurge draws, and each of the settings that
// change how it lays them out.

import type { OutputName, RenderOptions } from "./harness";
import { nabcFonts } from "./nabcFonts";

const { gregall, gresgmodern, grelaon } = nabcFonts;

export interface GoldenCase extends RenderOptions {
  name: string;
  gabc: string;
  /**
   * The outputs to check.  Each feature case checks the svg string, the svg
   * tree, the svg DOM nodes and the canvas, which each have their own code
   * for each kind of element; a settings case checks the svg string unless
   * it changes which elements are drawn.
   */
  outputs?: OutputName[];
}

const allOutputs: OutputName[] = ["svg", "tree", "node", "canvas"];
const withLines: OutputName[] = [...allOutputs, "lines", "nodeLines"];

// -----------------------------------------------------------------------------
// gabc

const kyrie =
  "(c4) KY(f)ri(gfg)e(h.) *() e(ixjvIH'GhvF'E)lé(ghg')i(gf)son.(f.) (::) " +
  "Chri(e!fgf)ste(e.) e(ixjvIH'GhvF'E)lé(ghg')i(gf)son.(f.) (::)";

const puer =
  "(c3) PU(ei)ER(i) *() na(iji)tus(h) est(hhh) no(ih/ji)bis,(i) (;) et(ei~) fí(iji)li(hg)us(f) da(hhi)tus(h) est(h) no(hihh)bis:(efe) (:) " +
  "cu(e)jus(f) im(h)pé(gi!jk)ri(ih)um(h) (,) su(h)per(h) hú(ih/ji)me(hg)rum(hhh) e(hf//hghvGF)jus:(gf) (:) et(hg) vo(h)cá(hji)bi(h)tur(hhh) " +
  "no(h)men(hhh) e(highvGF)jus,(gf) (;) ma(hj)gni(i) con(eh~)sí(h)li(hhhf)i(f) An(fhf!gwh)ge(efe)lus.(e) Ps.(::) Can(ehg)tá(hi)te(i) " +
  "Dó(i)mi(i)no(i) cán(ik)ti(j)cum(j) no(ji)vum:(ij) *(:) qui(ig)a(hi) mi(i)ra(i)bí(i!jwk)li(i)a(h) fe(hhh)cit.(fe) (::) Gló(ehg)ri(hi)a(i) " +
  "Pa(i)tri.(i) (::) E(i) u(i!jwk) o(i) u(h) a(hhh) e.(fe) (::)";

const christus =
  "(c4) CHris(ffg)tus(f.) *(,) fac(fg)tus(f) est(f') pro(f) no(ghF'ED.g_e/fg)bis(f.) (;) o(f)bé(hf/gh!jj/kjk)di(jij)ens(h_g) (,) " +
  "us(h!jjh)que(f.) ad(ixfiH'Gh) mor(fgf___)tem,(f.) (:) mor(ixf!hhi)tem(g) au(ixgjj//)tem(j.h!iw!jvIG'hw!ivHG) cru(fv.ff)cis.(f_c) (,) " +
  "(fg!hvGF.e!g'h//fhg/hggf.) (z0::c3) V/. Prop(d)ter(d) quod(d) et(fe~) De(eh)us(h.) (,) e(h)xal(h)tá(h)vit(h) il(h)lum,(ihhe.//hih___/ihhe.) (,) " +
  "(hi!kv//lvKI'jvHF.) (,) (h_g/ijh'___ jvIH'jvIH'//hvGF.) (:) et(f) de(f!h'i)dit(i) il(i)li(ih/jki/hhf.) (,) no(hf/hhh)men,(h.f!gwh!iv.hi/jhh/iih.) (;) " +
  "quod(d) est(d) su(d)per(d) o(dfE'D)mne(ef) *() no(fhG'Fhhh)men.(hhf.) (,) (gxg_fgvED.fgED.fehv.hhhff//dfe/feed.) (::)";

const adTeLevavi =
  "(c4) AD(c)te(d) le(f)vá(fe)vi(f) á(fg)ni(gf)mam(f) me(fe)am:(e.) (,) De(f)us(fg) me(f)us,(fe) in(e) te(f) con(gh)fí(g)do,(fe) (;) " +
  "non(f) e(fe)ru(c)bé(d)scam:(fe..) (:) ne(f)que(f) ir(fe)rí(fg)de(gf)ant(f) me(fe) in(f)i(gh)mí(g)ci(fe) me(f)i:(f.) (;) " +
  "<i>et</i>(f) e(fg)nim(f) u(fe)ni(e)vér(f)si(gh) qui(g) te(fe) ex(f)spé(fe)ctant,(e.) (,) non(d) con(fe)fun(f)dén(gf)tur.(f.) (::) " +
  "E(f)<sp>'ae</sp>(g) <b>vi</b>(h)as(g) <sc>tu</sc>(f)as,(e) Dó(f)mi(gh)ne,(g.) (;) de(f)món(fe)stra(c) mi(d)hi:(fe..) (::)";

const salveRegina =
  "(c3) SAL(ixed)ve(e.) *(;) Re(e)gí(ef)na,(e.) (,) ma(e)ter(f) mi(g)se(h)ri(i)cór(j)di(ih)ae:(i.) (;) " +
  "Vi(ixed)ta,(e.) dul(e)cé(ef)do,(e.) (,) et(e) spes(f) no(g)stra,(h) sal(i)ve.(j.) (:) " +
  "Ad(j) te(ji) cla(h)má(gh)mus,(g.) (,) éx(e)su(f)les,(g) fí(h)li(i)i(j) He(j)vae.(i.) (:) " +
  "Ad(i) te(h) su(ixh)spi(g)rá(f)mus,(e.) (,) ge(f)mén(g)tes(h) et(i) flen(j)tes(k) in(j) hac(i) la(h)cri(g)má(f)rum(e) val(f)le.(e.) (::)";

// a text only lyric a little too wide for a line 270 wide, with a smaller line after a break
const resizedLyricWithSizedText =
  "(c4) Ky(f)ri(g)e(h) (,) A long run of text only words, too wide for the line<br><e>and a smaller line</e>() (::)";

// porrectus strokes of several falls, for drawing at glyph multipliers
const porrectusAtMultipliers =
  "(c4) a(hgh) b(jhj) c(jgj) d(kfk) e(lel) f(jhji) g(gjhj) h(fkfk) i(h_g_h_) j(jg_'j) k(hg.h.) l(hrgh) (::) " +
  "(xp3) m(hgh) (::)";

// headers for Gabc.applyHeader()
const headerSettings =
  "name: Ave Maria;\noffice-part: Antiphona;\nannotation: Ant.;\nannotation: VIII\nG;;\n" +
  "staff-lines: 5;\nlanguage: English;\n%%\n" +
  "(c4) A(f)ve(gh) Ma(h)ri(g)a,(f.) (;) gra(hj)ti(i)a(h) ple(gh)na(g.) (::)";

const headerModeAnnotation =
  "name: Ave Maria;\nmode: 8;\nmode-modifier: t.;\nmode-differentia: G*;\n%%\n" +
  "(c4) A(f)ve(gh) Ma(h)ri(g)a,(f.) (;) gra(hj)ti(i)a(h) ple(gh)na(g.) (::)";

export const featureCases: GoldenCase[] = [
  // ---- notes and neumes
  {
    name: "single-notes",
    gabc:
      "(c4) a(f) b(fv) c(fV) d(fvv) e(fvvv) f(fs) g(fss) h(fsss) i(fo) j(fO) k(fw) l(F) m(f~) n(f<) o(f>) " +
      "p(-f) q(fr) r(fR) s(fr0) t(fo<) u(fo>) v(fO<) w(fO>) x(F~) y(fs<) z(fv~) (::)"
  },
  {
    name: "two-note-neumes",
    gabc:
      "(c4) a(fg) b(fh) c(fi) d(fk) e(fg~) f(-fh) g(fg<) h(fg>) i(fwg) j(gf) k(hf) l(kf) m(gf~) n(gf<) o(gf>) " +
      "p(gof) q(fog) r(fOg) s(-gf) t(fhd~) u(gfe~) v(gvFE) w(fgV) (::)"
  },
  {
    name: "three-and-more-note-neumes",
    gabc:
      "(c4) a(fhg) b(fhg~) c(gfg) d(hfh) e(ifi) f(jfj) g(kfk) h(gFE) i(gvFE) j(fgh) k(fogh) l(fgFE) m(fhgh) n(gfgf) " +
      "o(fghg) p(foghf) q(fhghf) r(gfe~) s(GFE) t(hGFED) u(fge) v(-fhg) w(fh>g) (::)"
  },
  {
    name: "neume-variants",
    gabc:
      "(c4) a(fwhg) b(fhg<) c(fhg>) d(fhgh~) e(fhgh<) f(fhgh>) g(-fhgh) h(fwhgh) i(fhghf~) j(fhghf<) k(fhghf>) " +
      "l(-fhghf) m(fwhghf) n(fhgh~f) o(fghv) p(fghg~) q(fghg<) r(fghg>) s(gfg~) t(gfg<) u(gfg>) v(gfgf~) w(gfgf<) " +
      "x(gfgf>) y(gfg~f) z(fog~) A(fog<) B(fog>) C(f<fg) D(f>fg) E(ffg) F(fs_) G(fs_0_1) H(fs_1) I(hgf~) J(hge~) (::)"
  },
  {
    name: "inclinata-with-stems",
    gabc: "(c4) a(G|FE) b(GF||E) c(hG|F|E|D) d(H||GF) e(gvF|E|) (::)"
  },
  {
    name: "liquescents",
    gabc:
      "(c4) a(f~) b(fg~) c(gf~) d(fhg~) e(gfg~) f(gF~) g(gFE~) h(fo~) i(fg<) j(fg>) k(gf<) l(gf>) m(fh<g) n(-fg) o(-fhg) (::)"
  },
  {
    name: "staff-position-offsets",
    gabc: "(xp4) a(f0) b(f9) c(g0h9) d(e9f0g) e(f0+) (::)"
  },
  {
    name: "ledger-lines",
    gabc:
      "(c4) a(lml) b(kmlk) c(aba) d(bcb) e(ab) f(m) g(a) h(lm) i(ba) j(jlk) k(dca) l(nml) (::) (c1) m(cba) n(abc) (f1) o(abcb) (::)"
  },

  // ---- markings
  {
    name: "episemata",
    gabc:
      "(c4) a(f_) b(f_0) c(f_1) d(f_2) e(f_3) f(f_4) g(f_5) h(fg__) i(f_g_) j(fgh___) k(gf_) l(g_f_) m(fhg_) " +
      "n(gfg_) o(G_F_E_) p(f_0_1) q(hg__f_) r(fg_h_) s(e_f_g_h_i_) (::)"
  },
  {
    name: "morae",
    gabc:
      "(c4) a(f.) b(f..) c(f.1) d(f.0) e(g.) f(fg.) g(f.g.) h(gf.) i(hg.) j(fhg.) k(gfg.) l(GFE.) m(GF.E.) " +
      "n(fv.) o(fo.) p(fs.) q(f.g) r(g.f) s(hgh.) t(g.1) u(g.0) v(f.!g) w(g.!f) x(hg.!fe) y(fg..h) z(G.F.) (::)"
  },
  {
    name: "markings-on-porrectus-and-inclinata",
    gabc:
      "(c4) a(g_fg) b(gf_g) c(hf_0h) d(g'fg) e(gf'g) f(gf.g) g(GFE~_) h(GF~_) i(G_F_E_D~_) j(gf_g_) k(h_g_f_) (::)"
  },
  {
    name: "ictus",
    gabc: "(c4) a(f') b(f'0) c(f'1) d(fv') e(g'f) f(fg') g(f'g) h(G'FE) i(gf_') j(f_'0) k(hgh') l(gfg') (::)"
  },
  {
    name: "accents-and-choral-signs",
    gabc:
      "(c4) a(fr1) b(fr2) c(fr3) d(fr4) e(fr5) f(lr1) g(f[cs:t]) h(gf[cs:c]) i(g[cs:md]f) j(fg[cs:s]) (::)"
  },
  {
    name: "braces",
    gabc:
      "(c4) a(f[ob:1{]g h[ob:0}]) b(f[ub:1{]gh[ub:0}]) c(f[ocb:1{]gh[ocb:0}]) d(f[ocba:1{]gh[ocba:0}]) " +
      "e(f[ob:0{]gh[ob:1}]) f(f[ob:1;6mm]g) g(h[ocb:1;3mm]g) h(k[ub:1{]m[ub:0}]) (::)"
  },
  {
    name: "brace-across-lines",
    width: 220,
    gabc:
      "(c4) Ky(f[ob:1{]g)ri(h)e(g) e(f)lé(g)i(h)son(g) Ky(f)ri(e)e(d) e(f)lé(g)i(h[ob:0}])son(g) (::) " +
      "Chri(f[ocb:1{]g)ste(h) e(g)lé(f)i(e)son(f[ocb:0}]) (::)"
  },
  {
    name: "brace-open-at-final-custos",
    gabc: "(c4) a(g[ob:1{]h+)"
  },
  {
    // braces are drawn in the neume line color, not the staff line color
    name: "brace-colors",
    outputs: ["svg", "canvas"],
    gabc: "(c4) a(f[ob:1{]g h[ob:0}]) b(f[ub:1{]gh[ub:0}]) c(f[ocba:1{]gh[ocba:0}]) d(g) (,_) e(f) (::)",
    setupContext: (ctxt) => {
      ctxt.neumeLineColor = "#111";
      ctxt.staffLineColor = "#222";
    }
  },

  // ---- accidentals and clefs
  {
    name: "accidentals",
    gabc:
      "(c4) a(gxg) b(ixi) c(iyi) d(f#f) e(gxgh) f(ixhi) g(f#gf) h(ixiyi) i(hxgh) (,) j(gx) k(g) (::) " +
      "(c3) l(exe) m(ixi!jh) (::)"
  },
  {
    name: "soft-accidentals",
    gabc:
      "(c3) (e) (e) (e) gX(gXge) (f)gX(gXghED) (eddc) (;) (efef//hhv) gX(gXfe//fgED//efDC//ef) (;) (hhvFEf)(fv_//hhf)gY(gYghghf) (::) " +
      "(c4) a(gXg) b(gYg) c(g##g) d(hgfgXgh) e(ixiXi) (::) (c3) f(ixi) g(jihiXij) h(hgiXwjh) (::) " +
      "(cb3) i(fYf) j(fXf) k(hgfXgh) (::)"
  },
  {
    name: "clefs",
    gabc:
      "(c1) a(c) (c2) b(e) (c3) c(g) (c4) d(i) (c5) e(k) (f1) f(c) (f2) g(e) (f3) h(g) (f4) i(i) (f5) j(k) " +
      "(cb1) k(c) (cb2) l(e) (cb3) m(g) (cb4) n(i) (cb5) o(k) (::)"
  },
  {
    name: "other-clefs",
    gabc: "(treble2) a(f) (treble-2) b(g) (treble4) c(h) (xp3) d(g) (xp-3) e(h) (xp1) f(e) (::)"
  },
  {
    name: "clef-changes",
    width: 300,
    gabc:
      "(c4) Ky(f)ri(g)e(h) (c3) e(g)lé(f)i(e)son.(f) (,) (f3) Chri(f)ste(g) (cb3) e(gh)lé(i)i(h)son.(g) (::) (c4) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (::)"
  },

  // ---- dividers, line breaks and spacing
  {
    name: "dividers",
    gabc:
      "(c4) a(f) (,) b(g) (;) c(h) (:) d(g) (::) e(f) (`) f(g) (;3) g(h) (,5) h(g) (;1) i(f) (,_) j(g) (;_) k(h) (:_) l(g) (`_) m(f) (;8) n(e) (::)"
  },
  {
    name: "dividers-on-syllables",
    gabc: "(c4) Al(f)le(g)lú(h)ia.(g) *(;) ij.(:) Al(f)le(g)lú(h)ia.(g) (,) iij.(::) † (,) Al(f)le(g)(;)lú(h)(:)ia.(g) (::)"
  },
  {
    name: "line-breaks-and-custodes",
    gabc:
      "(c4) Ky(f)ri(g)e(h) (z) e(g)lé(f)i(e)son.(f) (Z) Chri(f)ste(g) (z0) e(h)lé(i)i(h)son.(g) (::) " +
      "Ky(f+)ri(g)e(h) e(i+) (::) lé(f)i(e)son.(f) (z) (::) a(k+) b(j+) c(l+) d(b+) e(a+) (::)"
  },
  {
    name: "neume-spacing",
    gabc:
      "(c4) a(f/g) b(f//g) c(f g) d(f!g) e(f!/g) f(f!//g) g(f///g) h(fg/hg) i(f/) j(g//) k(h ) l(f!/g!//h!i) m(f/ g) n(fg//hi) (::)"
  },
  {
    name: "zero-width-groups",
    gabc: "(c4) a(f{h}g) b(e{gi}f) c({hj}g) d(fg{ik}h) e(f{h}{j}g) (::)"
  },

  // ---- lyrics
  {
    name: "lyric-markup",
    gabc:
      "(c4) <b>Ky</b>(f)<i>ri</i>(g)<u>e</u>(h) <ul>e</ul>(g)<c>lé</c>(f)<sc>i</sc>(e)<e>son</e>(f) (,) " +
      "*bold*(f) _italic_(g) ^red^(h) %small%(g) <b><i>both</i></b>(f) <font family=\"X\" fill=\"#123\" class=\"k\">font</font>(g) " +
      "<i>un<b>closed(h) <b>a</i>b</b>(g) (::)"
  },
  {
    name: "special-characters",
    gabc:
      "(c4) ℣.(f) ℟.(g) V/.(h) R/.(g) A/.(f) <sp>V/</sp>(g) <sp>R/</sp>(h) * (f) + (g) † (h) " +
      "<sp>'ae</sp>(g) <sp>ae</sp>(f) <sp>'oe</sp>(g) <sp>OE</sp>(h) <sp>'e</sp>(g) <sp>~</sp>(f) " +
      "a*b(f) <v>\\greextra{Cross}</v>(g) <v>\\grecross</v>(h) <v>{\\'ae}</v>(g) <v>\\greextra{StarSix}x</v>(f) (::)"
  },
  {
    name: "lyric-connectors",
    gabc:
      "(c4) Lon(f)gi(g)tú(h)di(g)ne(f) di(g)é(h)rum(g) ve(f)nit-(g) do(h)mi-(g) ex(f)tre(g)ma—(h)men(g)te(f) " +
      "can–(g)ta(h) <i>e</i>(g)ius(f) Do(f)mi(g)nus(h) (::)"
  },
  {
    name: "lyric-centering",
    gabc:
      "(c4) {Ky}ri(f)e(g) f{i}re(h) {fenced}(g) in{gre}di(f) <v>a</v>{b}c(g) <b>{bol}d</b>(h) ab{c(g) (::)"
  },
  {
    name: "multiple-lyric-lines",
    gabc:
      "(c4) Ky|Chri|Ky(f)ri|ste|ri(g)e|e |e(h) e|e|e(g)lé|lé|lé(f)i|i|i(e)son.|son.|son.(f) (::)"
  },
  {
    name: "directives",
    gabc: "(c4) Ky(f)ri(g)e(h) *(;) ij.(:) e(g)lé(f)i(e)son.(f) iij.(::) 1.(f) 23(g) **(h) †(::)"
  },
  {
    name: "text-only-syllables",
    gabc:
      "(c4) Ky(f)ri(g)e() e() lé(f) i(e)son.() (,) This is text with no notes() and more text() (;) " +
      "Glo(f)ri(g)a() Pa(h)tri() (::)"
  },
  {
    name: "extra-text-only-lines",
    width: 300,
    gabc:
      "(c4) Ky(f)ri(g)e(h) (,) Here is a very long run of text only syllables that will not fit() " +
      "on the line() and so goes underneath() (;) e(g)lé(f)i(e)son.(f) (::)"
  },
  {
    name: "above-lines-text-and-translations",
    gabc:
      "(c4) <alt>Above</alt>Ky(f)ri(g)e(h) [alt:Also above]e(g)lé(f)i(e)son.(f) (,) " +
      "Chri[Christ](f)ste(g) e[have mercy](h)lé(g)i(f)son[/](e) (,) " +
      "a(f[alt:note]g) b(g[alt:al1]f[alt:al2]) <alt>One</alt><alt>Two</alt>c(h) (::)"
  },
  {
    name: "long-translation",
    width: 320,
    gabc:
      "(c4) Ky[Lord, have mercy upon us, and on all the people who will listen](f)ri(g)e(h) e(g)lé(f)i(e)son[/](f) (,) " +
      "Chri(f)ste(g) e(h)lé(g)i(f)son.(e) (::)"
  },
  {
    name: "line-breaks-in-text",
    gabc: "(c4) Ky<br>rie(f) e<br/>lé(g) son.<br><br>A(h) (::)"
  },
  {
    // the lines after the breaks are in a smaller font, which spaces them less
    name: "line-breaks-in-sized-text",
    gabc: "(c4) Ky<br><e>rie</e>(f) e<br><br><e>lé</e>(g) son.(h) (::)",
    setupScore: (score, ctxt) => score.titles.setTitle(ctxt, "Ad te levávi<br><e>ánimam meam</e>")
  },
  {
    // a text only lyric squeezed to fit on the line, with smaller text in it
    name: "resized-lyric-with-sized-text",
    width: 270,
    gabc: resizedLyricWithSizedText
  },
  {
    name: "resized-lyric-with-px-sized-text",
    width: 270,
    gabc: resizedLyricWithSizedText,
    setupContext: (ctxt) => {
      ctxt.fontStyleDictionary.e = { "font-style": "italic", "font-size": "12px" };
    }
  },
  {
    // the notes are centered on a vowel (after the last space) and on a {}
    // that are on a second line, which is narrower than the first
    name: "centering-after-line-breaks",
    gabc: "(c4) Kýrie eléison<br>Lord have(f) mer(g)cy(h) Christe<br>e{lé}(g)i(h)son.(g) (::)"
  },
  {
    name: "elisions",
    gabc: "(c4) Glo(f)ri(g)<i>a</i>(h) in(g) ex(f)cél(g)sis(h) De(g)<i>o</i>(f) et(g) (::)"
  },
  {
    name: "unicode-and-escaping",
    gabc: "(c4) &amp;(f) a<b(g) c>d(h) Æ(g) œ(f) ǽ(g) ŭ(h) ȳ(g) ĕ(f) (::)"
  },

  // ---- real chants
  { name: "kyrie", outputs: withLines, gabc: kyrie, useDropCap: true },
  { name: "puer-natus-est", gabc: puer, useDropCap: true },
  { name: "christus-factus-est", gabc: christus, useDropCap: true },
  { name: "ad-te-levavi", gabc: adTeLevavi, useDropCap: true },
  { name: "salve-regina", gabc: salveRegina, useDropCap: true },
  {
    name: "header",
    useDropCap: true,
    gabc: "name: Kyrie;\noffice-part: Kyriale;\n%commented: yes;\n%%\n" + kyrie
  },

  // Gregorio: Phase 1
  {
    // the tags aren't printed, and </eu> and </nlba> after the notes don't join two words
    name: "gregorio-lyric-controls",
    gabc:
      "(c4) Gló(ehg)ri(hi)a(i) Pa(i)tri.(i) (:) <eu>E(i) u(i!jwk) o(i) u(h) a(hhh) e</eu>(fe..) (::) " +
      "<eu>E(i) u(i) o(i) u(h) a(hhh) e(fe..)</eu> (::) <nlba>Ky(f)ri(g)e.(h)</nlba> Chri(g)ste(f) " +
      "<nlba>e</nlba>(g) <clear>e(g)lé(f)i(g)son<pr>.(f) son<pr:0.5>;(g) a<clear/>b<pr/>c(h) (::)"
  },
  {
    // Gregorio's default specials, an unknown one shown as its text, and <tt>
    name: "gregorio-special-characters",
    gabc:
      "(c4) <tt>tt</tt>(f) a<sp>*</sp>(g) b<sp>+</sp>(h) ex<sp>-</sp>cel(g) <sp>\\</sp>(f) <sp>&</sp>(g) <sp>#</sp>(h) " +
      "<sp>_</sp>(g) <sp>%</sp>(f) De<sp>ut</sp>us(g) De<sp>ot</sp>us(h) De<sp>dt</sp>us(g) <sp>unknown</sp>(f) " +
      "_it<sp>_</sp>al_(g) <i>a<tt>b</tt>c</i>(h) (::)"
  },
  {
    // no notes are lost or made up (i is a linea, j a pes quadratum and o a
    // bivirga)
    name: "gregorio-note-tokens",
    gabc:
      "(c4) a([[gh]]) b(f[[gh]]i) c(fg<nlba>hg</nlba>ih) d(<nlba>fg) e(hg</nlba>) f(h@iw@ji@j@ih~) " +
      "g(@[fhg]) h(@hg) i(g=) j(fqg) k(gWh) l(fx?g) m(fy?f) n(f#?f) o(gVV) (::)"
  },
  {
    // the comments aren't printed, and one at the end of a line takes the line
    // break away; a % in the notes or after a letter isn't one
    name: "comments-in-notation",
    gabc:
      "(c4) Ky(f)ri(g)e(h) % a comment (x)\n e(g)lé(f)i(g)son.(f) (::)\n% a whole line\n" +
      "Chri(g)ste(h) % comment\n e(g)lé(f)i(g)%c\nson(g) a(f%g) %small%(g) a%b%c(h) % 50% off\n 50%(f) (::)"
  },
  {
    // the escaped characters are printed as they are
    name: "dollar-escapes",
    gabc:
      "(c4) a$(b$)(f) c$$d(g) e$<b>f(h) g$~h(g) i$[j$](f) k$|l(g) m$-(f) n(g) o$%p(g) q$*r*(f[cs:x$]y]) (::)"
  },
  {
    // the NABC isn't drawn yet, but no notes are made of it
    name: "nabc-separated",
    gabc:
      "nabc-lines: 1;\n%%\n(c3) FAc(e|talsi8)tus(ei|pe) est(i|vi) re(i|vihh)pén(i|vihi)te(e.|tahglsi9) " +
      "so(kjki|pfhhlsl2lsc2)nus(i.|ta) (,) ad(fg/hggf|peclhgpi|hg|cl)ve(i|ta)ni(ij|pe) a(fg|pe||vi) b(|vi) (::)"
  },
  {
    // small accidentals above the staff, or above a note that's higher
    name: "musica-ficta",
    gabc: "(c4) a(gr6) b(hr7) c(fr8) d(gv_r7) e(lr6) f(gr1) g(fgr6h) h(gr3) i(cr8) (::)"
  },
  {
    // the flat on the B above the F on lines 1 and 2, and below it on lines 3 to 5
    name: "flat-fa-clefs",
    gabc: "(fb3) a(ghd) b(dfd) (fb4) c(egf) (fb2) d(ihi) (fb1) e(gfg) (fb5) f(hgh) (f3) g(d) (::)"
  },
  {
    // a 0, 1 or 2 after an inclinatum is its leaning, so the notes stay on their pitches
    name: "inclinatum-digits",
    gabc: "(c4) a(G) b(G0) c(G1) d(G2) e(hGF) f(hG0F0) g(fG1H1) h(gG2G2) i(-G0) (::) (xp3) j(H0) k(h0) l(H9) (::)"
  },
  {
    // a porrectus stroke of a fifth (a, c and e to h), and wider ones (b, d),
    // and one between nudged notes, as a note on a space is under a Chi-Rho
    // clef (j, and k, a torculus resupinus), each drawn for the fall it has
    name: "porrectus-wide",
    gabc: "(c4) a(kfk) b(lel) c(kfkh) d(ldl) e(kfk~) f(kf_k) g(k.fk) h(-kfk) i(jfj) (::) (xp3) j(hgh) k(ghgh) (::)"
  },
  {
    // a porrectus's stroke drawn for any fall: wider than a fifth, in a
    // porrectus (a), a torculus resupinus (b) and a porrectus flexus (c); and
    // under a Chi-Rho clef, of 1⅓ (d, i, j), ⅔ (e, f, k), 3⅓ (g) and 2⅔ (h)
    // staff positions, hollow (j, k) and in a porrectus flexus (l)
    name: "porrectus-any-fall",
    gabc:
      "(c4) a(mcm) b(dkdk) c(lclk) (::) " +
      "(xp3) d(hgh) e(hg9h) f(h0gh) g(jgj) h(ifh) i(fhgh) j(hgr0h) k(hg9rh) l(jgjh) (::)"
  },

  // Gregorio: Phase 2
  {
    name: "bar-variants",
    gabc:
      "(c4) a(f) (^) b(g) (^0) c(h) (`0) d(g) (,0) e(f) (:?) f(g) (:') g(h) (;') h(g) (::') i(f) (,') j(g) (`') " +
      "k(h) (,_') l(g) (;3') m(f) (fg^hg:?f) (::)"
  },
  {
    // the last [nocustos] is where the line breaks at this width
    name: "line-break-custos-control",
    width: 200,
    gabc:
      "(c4) Ky(f)ri(g)e(h) (z) e(g)lé(f)i(e)son.(f) (z+) Chri(f)ste(g) (z-) e(h)lé(i)i(h)son.(g) (Z) Ky(f)ri(g)e(h) (Z+) " +
      "e(g)lé(f) (Z-) i(e)son.(f) (;) Ky(f)ri(g)e(h[nocustos]) (z) e(g)lé(f)i(e)son.(f) (,) Chri(f)ste(g) " +
      "Chri(f)ste(g) e(h [nocustos])lé(i)i(h)son.(g) (::)"
  },
  {
    name: "line-break-custos-manual",
    width: 200,
    setupContext: (ctxt: any) => {
      ctxt.eolCustos = "manual";
    },
    gabc:
      "(c4) Ky(f)ri(g)e(h) (z) e(g)lé(f)i(e)son.(f) (z+) Chri(f)ste(g) (Z) e(h)lé(i)i(h)son.(g) (Z+) " +
      "Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) Chri(f)ste(g) e(h)lé(i)i(h)son.(g) (::)"
  },
  {
    name: "gregorio-spacing-codes",
    gabc:
      "(c4) a(f/0g) b(f/!g) c(f/g) d(f/[2]g) e(f/[0.5]g) f(f/[-1]g) g(f!/[2]g) h(f! g) i(f g) j(f//g) k(f///g) " +
      "l(gh/[-2]ih) m(f!/0g!/!h) (::)"
  },
  {
    // the line can only break before the hg that the /0, /! and "! " spaces keep together
    name: "gregorio-spacing-codes-unbreakable",
    width: 120,
    gabc: "(c4) Ky(f)ri(gf/hg/fe/fg/hg/0hi/!hg! hg/!fe/0fg)e(f) e(gh/gf/ef/gh/ih/gf)lé(f)i(e)son.(f) (::)"
  },
  {
    name: "neume-spacing-gregorio-widths",
    setupContext: (ctxt: any) => {
      ctxt.neumeSpaceMultipliers = { "/0": 0.5, "/!": 1, "/": 1, "//": 1.58, " ": 3.16 };
    },
    // neume-spacing's gabc, and the codes it doesn't have
    gabc:
      "(c4) a(f/g) b(f//g) c(f g) d(f!g) e(f!/g) f(f!//g) g(f///g) h(fg/hg) i(f/) j(g//) k(h ) l(f!/g!//h!i) m(f/ g) " +
      "n(fg//hi) o(f/0g) p(f/!g) q(f/[2]g) r(f! g) (::)"
  },
  {
    // each clef goes only at the start of the line after the break
    name: "clef-change-before-break",
    gabc:
      "(c4) Ky(f)ri(g)e(h) (c3) (z) e(g)lé(f)i(e)son.(f) (::c4) (Z) Chri(f)ste(g) e(h)lé(i)i(h)son.(g) " +
      "(z0) (;) (f3) (z+) Ky(f)ri(g)e(h) (cb3) (z-) e(g)lé(f)i(e)son.(f) (::)"
  },
  {
    // without the areas, the lines would break after "ste" and after "ih"
    name: "no-line-break-areas",
    width: 190,
    gabc:
      "(c4) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (;) <nlba>Chri(f)ste(g) e(h)lé(i)i(h)son.(g)</nlba> (:) " +
      "Ky(f)ri(g)e(h) e(hg<nlba>hi/hg/ih/ji</nlba>hg)lé(f)i(e)son.(f) (::)"
  },
  {
    // the line breaks before the euouae, with no custos, rather than in it
    name: "euouae",
    width: 200,
    gabc: "(c4) Gló(ehg)ri(hi)a(i) Pa(i)tri.(i) (:) Ky(f)ri(g)e(h) <eu>E(i) u(i!jwk) o(i) u(h) a(hhh) e(fe..)</eu> (::)"
  },

  // Gregorio: Phase 3
  {
    // clefs two lines or more apart are drawn one over the other, and clefs
    // on neighboring lines one after the other, each with its flat; the
    // pitches follow the first clef, and each line starts with both
    name: "two-clefs",
    gabc:
      "(c1@c4) A(d)B(j) (c3) C(h) (f3@c4) D(h) (c2@c3) E(h) (cb4@cb2) F(h) (z) " +
      "G(g) (c4@fb2) H(h) (c1@fb3) I(h) (::)"
  },
  {
    // the annotation (the second written over two lines), the staff lines
    // and the language, from the header
    name: "header-settings",
    useDropCap: true,
    gabc: headerSettings,
    setupScore: (score, ctxt, E) => E.Gabc.applyHeader(score, ctxt, new E.GabcHeader(headerSettings))
  },
  {
    // with no annotation header, the mode is the annotation
    name: "header-mode-annotation",
    useDropCap: true,
    gabc: headerModeAnnotation,
    setupScore: (score, ctxt, E) => E.Gabc.applyHeader(score, ctxt, new E.GabcHeader(headerModeAnnotation))
  },

  // Gregorio: Phase 4
  {
    // an elision counts as consonants when centering: at the start, in the
    // middle and at the end of a syllable, and as the whole of one
    name: "elision-tags",
    gabc:
      "(c4) <e>A</e>ve(f) ma(g)ri<e>a</e>(h) <e>et</e>(g) qu<e>e</e>(f) mon(g)str<e>a</e> te(h) " +
      "s<e>a</e>n(g)ctum(f) (::)"
  },
  {
    // a ~ drawn as an undertie, centered on the syllable's first vowel
    name: "lyric-tie",
    gabc: "(c4) Glo(f)ri(g)a~in(h) ex(g)cel(f)sis(g) De~o(h) <sp>~</sp>(g) (::)",
    setupContext: (ctxt) => (ctxt.lyricTie = "undertie")
  },
  {
    // after the drop cap: the first word in small caps, its first syllable in
    // bold and that syllable's first letter in red, with the lyric's own
    // markup (the italics) kept
    name: "first-syllable-styles",
    useDropCap: true,
    gabc: "(c4) Glo(f)<i>ri</i>(g)a(h) in(g) ex(f)cél(g)sis(h) (::)",
    setupContext: (ctxt) => {
      ctxt.firstWordStyle = { "font-variant": "small-caps" };
      ctxt.firstSyllableStyle = { "font-weight": "bold" };
      ctxt.firstSyllableInitialStyle = { fill: "#d00" };
    }
  },
  {
    // ő and ű are vowels, which the Latin rules don't know
    name: "language-hungarian",
    gabc: "(c4) Üd(f)vöz(g)légy,(h) sző(g)lő(f) fű(g) nyűg(h) Ö(g)rök(f)ké(g) (::)",
    setupContext: (ctxt, E) => (ctxt.defaultLanguage = E.language.hungarian)
  },
  {
    // the Czech and Polish that Gregorio's Church Slavonic rules are for, with
    // syllables centered on a syllabic l or r, which have no vowel
    name: "language-church-slavonic",
    gabc: "(c4) Hos(f)po(g)di(h)ne,(g) po(f)mi(g)luj(h) ny.(g) (;) Smrt(f) vlk(g) Świę(h)ty(g) Bůh(f) (::)",
    setupContext: (ctxt, E) => (ctxt.defaultLanguage = E.language.churchSlavonic)
  },
  {
    // TeX commands that have no meaning outside TeX are left out of verbatim
    // text, rather than printed, though the text of their arguments is kept
    // (except for spacing); Gregorio's symbol commands, accents and escaped
    // characters are drawn
    name: "verbatim-unknown",
    gabc:
      "(c4) a<v>\\textit{b}</v>c(f) <v>\\hspace{1em}</v>d(g) <v>{\\bf e}</v>(h) <v>\\GreStar</v>(g) " +
      "<v>\\'e\\&\\%</v>(f) <v>\\GreDagger{}</v>(g) <v>\\greextra{StarHeight}</v>(h) (::)"
  },
  {
    // above-lines text and translations are in italics already, and keep the
    // text before (and between) any italic markup of their own
    name: "alt-text-markup",
    gabc:
      "(c4) <alt><b>Bold</b> <i>it</i> plain</alt>Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (,) " +
      "[alt:<b>B</b> and <i>i</i>]Chri[<b>Christ</b> <i>have</i> mercy](g)ste(h) (::)"
  },
  {
    // translations centered under their syllables, except one ended with [/]
    name: "translation-centered",
    gabc:
      "(c4) Ky[Lord](f)ri(g)e(h) e[have mercy](g)lé(f)i(e)son.[on us](f) (,) " +
      "Chri[Christ, have mercy](f)ste(g) e(h)lé(g)i(f)son[/](e) (::)",
    setupContext: (ctxt) => (ctxt.translationCentering = "center")
  },
  {
    // the same syllables without and with <clear>: with it, the text doesn't
    // reach back under the notes before it
    name: "lyric-clear",
    gabc:
      "(c4) Ky(fgfh) e(hih) Chri(g)ste(h) Ky(fgfh) e(hih) <clear>Chri(g)ste(h) (,) " +
      "a(f) Sanctus(g) a(f) <clear>Sanctus(g) (::)"
  },
  {
    // "son." only fits on the first line because its period may go past the
    // end of the staff, and the svg is made wider for it
    name: "lyric-protrusion",
    width: 114,
    gabc: "(c4) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son<pr>.(f) Chri(f)ste(g) e(h)lé(g)i(f)son.(e) (::)"
  },
  {
    // the same, with the period at the end of a second line
    name: "lyric-protrusion-after-line-break",
    width: 114,
    gabc: "(c4) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son<br>son<pr>.(f) Chri(f)ste(g) e(h)lé(g)i(f)son.(e) (::)"
  },

  // Gregorio: Phase 5
  {
    // an oriscus scapus has a stem down on its left, unless it's joined to a
    // lower punctum before it (f-h, and the salicus i-j); as in Gregorio, a
    // pes quassus (e) has no stem, and k's g after a higher note isn't joined
    name: "oriscus-scapus",
    gabc:
      "(c4) a(gO) b(fO) c(gOf) d(hOe) e(fOg) f(fgO) g(dgO) h(e_gO_) i(egOi) j(egOih) k(hgO) l(gO<) m(gO>) (::)"
  },
  {
    // an oriscus points to the first note after it that isn't at the unison,
    // even in a later syllable (a, b, i, l), and down if there's none (n); o1
    // and o0 (and exsurge's o< and o>) point it up or down, even in a clivis
    // (e, g) or a pes quassus (f, h)
    name: "oriscus-orientation",
    gabc:
      "(c4) a(gogh) b(go)(g)(f) c(go1)(f) d(go0)(h) e(go1f) f(fo0g) g(gO1f) h(fO0g) i(gogoh) " +
      "j(go<)(f) k(go>)(h) l(egO)(g)(h) m(egO0)(h) n(go) (::)"
  },
  {
    // the q note starts a new neume (i, p) and ends it with the next note if
    // that's higher (j); if it's lower, the q does nothing (k, l), as in
    // Gregorio; a liquescent pes quadratum is drawn as a pes is (g, h)
    name: "pes-quadratum",
    gabc:
      "(c4) a(fqg) b(gqh) c(fqh) d(eqi) e(-fqg) f(-fqh) g(fqg<) h(fqg~) i(gfqh) j(fqgh) k(gqf) l(gqfg) " +
      "m(fqgv) n(f_qg_) o(f.qg.) p(efqg) (::)"
  },
  {
    // a linea is a flat bar between two lines, and a neume of its own (c),
    // whatever shape it's given (d); its markings go by the bar; i is a
    // punctum between lines (gabc R), to compare
    name: "linea",
    gabc: "(c4) a(g=) b(f=) c(fg=h) d(gv=) e(g=_) f(f=_0) g(g=.) h(g=') i(gR) j(b=) k(l=) (::)"
  },
  {
    // [shape:stroke] on a clivis's second note draws it as the stroke that a
    // porrectus (e) starts with (a-d, i-k); as in Gregorio, it does nothing
    // on a liquescent (f), an oriscus (g) or the first note (h)
    name: "clivis-stroke",
    gabc:
      "(c4) a(gf[shape:stroke]) b(hf[shape:stroke]) c(if[shape:stroke]) d(jf[shape:stroke]) e(gfg) " +
      "f(gf~[shape:stroke]) g(gof[shape:stroke]) h(g[shape:stroke]f) i(hf[shape:x,stroke]) " +
      "j(h_f_[shape:stroke]) k(h'f.[shape:stroke]) (::)"
  },
  {
    // [ll:0] gives a stem on the bottom line the short length (c, j; the
    // first hint counts, d), and [ll:1] the long one it has anyway (b);
    // [ll:1] and [hl:1] place an episema below c (f, g) or above k (i) as if
    // there were a ledger line there
    name: "ledger-line-hints",
    gabc:
      "(c4) a(dv) b(dv[ll:1]) c(dv[ll:0]) d(dv[ll:0][ll:1]) e(c_0) f(c_0[ll:1]) g(dc_0[ll:1]) h(k_) " +
      "i(k_[hl:1]) j(dO[ll:0]) k(dO) (::)"
  },
  {
    // a brace given a length in any TeX unit is drawn, as one in mm (e) is:
    // to the next note
    name: "brace-units",
    gabc:
      "(c4) a(f[ob:0;0.5cm]g) b(g[ub:1;0.3in]h) c(f[ocb:1;10pt]gh) d(h[ocba:0;1,5em]g) e(f[ob:1;6mm]g) " +
      "f(f[ob:1;\\gre@dimen]g) (::)"
  },
  {
    // Gregorio reads VV and VVV as vv and vvv (b-e): a bivirga or trivirga of
    // virgas that aren't reversed, unlike a lone V (a)
    name: "virga-reversa-repeated",
    gabc: "(c4) a(gV) b(gVV) c(gvv) d(gVVV) e(gvvv) f(gVV_) g(dVV) h(gVV.) (::)"
  },

  // Gregorio: Phase 6
  {
    // a cavum stays in its neume, and each note with one is drawn hollow (a
    // porrectus's stroke if either of its notes has one), but a punctum cavum
    // between lines stands alone (D)
    name: "cavum-neumes",
    gabc:
      "(c4) a(fgr) b(frg) c(fhr) d(frh) e(gfr) f(grf) g(fhrg) h(gvr) i(gor) j(gor~) k(gwr) l(fwrh) m(Gr) " +
      "n(hGrFr) o(hGF~r) p(hgrh) q(hrgh) r(hfrh) s(ifri) t(jfrj) u(hgrhg) v(fr~) w(fgr~) x(gfr~) y(fgr<) " +
      "z(gfr>) A(-frh) B(gorh) C(fsrsr) D(fr0g) E(fgr_) F(hgr'h) (::)"
  },
  {
    // a quilisma quadratum is a quilisma, and a higher note in its pes goes
    // beside it, joined by a line, rather than above it (n is a quilisma pes)
    name: "quilisma-quadratum",
    gabc: "(c4) a(gWh) b(gWi) c(gWj) d(gWk) e(gWh<) f(gWh>) g(gWh~) h(gW) i(gWhg) j(-gWh) k(gWrh) l(gW_h_) m(gW.h.) n(gwh) (::)"
  },
  {
    // inclinata lean as their gabc says (g to i) or as their line goes (a to
    // f, and n to p), and are spaced so that their edges line up, and an
    // auctus (j to m) has a tail
    name: "inclinatum-variants",
    gabc:
      "(c4) a(hGFE) b(GHI) c(GG) d(G) e(hG) f(fG) g(hG0F0) h(fG1H1) i(gG2G2) j(G<) k(G>) l(hGF<) m(hGF>) " +
      "n(hvGFGF) o(fhGF) p(hGF~) q(hGrFr) r(G<r) s(fG1rH1r) t(G<_) u(hG'F'E') (::)"
  },
  {
    // without ctxt.inclinatumLeaning, every inclinatum is upright, whatever
    // its gabc or its line
    name: "inclinatum-upright",
    gabc: "(c4) a(hGFE) b(GHI) c(hG0F0) d(fG1H1) e(gG2G2) f(hvGFGF) g(hGrFr) h(hGF<) i(fG|H||) j(hG|F|) (::)",
    setupContext: (ctxt) => (ctxt.inclinatumLeaning = false)
  },
  {
    // the stem of a leaning inclinatum stands on its top point, to the left
    // of its middle in a descending line (d, f) and to the right in an
    // ascending one (a, b, c, e), and a liquescent's in its middle (d)
    name: "inclinata-with-stems-leaning",
    gabc: "(c4) a(fG|H|I|) b(G|H||) c(hG1|F1|) d(hGF~|) e(fG|) f(hG|) (::)"
  },
  {
    // a stropha with < or > is a stropha aucta, with a longer tail (e and j
    // are plain strophae), and an ictus below it clears the tail (k)
    name: "stropha-aucta",
    gabc: "(c4) a(fs<) b(fs>) c(fss<) d(fsss>) e(fs) f(fs<r) g(hs<) h(fs<_) i(fs<.) j(fss) k(fs<') l(fs<ss) (::)"
  },
  {
    // accidentals and bars between parentheses (e, i and j are without them)
    name: "parenthesized-signs",
    gabc: "(c4) a(fx?fg) b(hy?hg) c(f#?fg) d(ix?ih) e(fxfg) f(g) (`?) g(h) (,?) h(g) (,0?) i(f) (`) j(g) (,) k(f) (::)"
  },
  {
    // a virga reversa with < or > has an auctus's head (a and j are without)
    name: "virga-reversa-liquescent",
    gabc: "(c4) a(gV) b(gV<) c(gV>) d(hV<) e(hV>) f(gV<r) g(gV<_) h(gV>.) i(fgV<) j(gv) (::)"
  },
  {
    // a porrectus stroke of a fifth, in a porrectus (a, e to j), a porrectus
    // flexus (b) and a torculus resupinus (c, d)
    name: "porrectus-fifth",
    gabc: "(c4) a(kfk) b(kfkh) c(dkfk) d(dkfkh) e(kfrk) f(kfk~) g(kfk<) h(lglj) i(kf'k) j(k_f_k) (::)"
  },

  // Gregorio: Phase 7
  {
    // a bracket at each side of the notes in it, from below the lowest to
    // above the highest, with a short, normal or long top as Gregorio picks
    // it, and after a mora; brackets can span syllables, a ]] with no notes
    // since the [[ doesn't close them, and a [[ inside brackets is ignored
    name: "note-brackets",
    gabc:
      "(c4) a([[gh]]) b(f[[gh]]i) c([[g]]) d([[fh]]) e([[fg]]) f([[eg]]) g([[eh]]) h([[ce]]) i([[jk]]) " +
      "j(e[[ghg]]f) ad([[ef) te(g]]) k(f[[]]g]]) l(g[[h[[i]]) m([[g.]]) (::)"
  },
  {
    // slurs of a given width and height, over or under the notes, and from
    // note to note, shifted left by none, a punctum or half a punctum; one
    // from note to note across a line break is drawn in two parts, one in em
    // takes the em of TeX's default font (as a brace's length does), and one
    // that ends without a start isn't drawn
    name: "slurs",
    gabc:
      "(c4) a(g[oslur:0;5mm,0mm]h) b(g[uslur:0;5mm,0mm]h) c(e[oslur:0;8mm,2mm]) d(j[oslur:1;4mm,-1mm]) " +
      "e(f[oslur:1{]gh[oslur:0}]) f(h[uslur:2{]gf[uslur:2}]) g(fg[oslur:2{]) h(hi) i(h[oslur:2}]) " +
      "j(f[oslur:0;1em,1mm]) k(g[oslur:0{]) l(h) (z) m(g[oslur:0}]) n(h[uslur:0}]) (::)"
  },
  {
    // ledger lines drawn at notes in the staff, or left out at notes beyond
    // it; ledger lines of a given length from just after a note, or from just
    // before one, and from note to note, even across a line break (and one
    // that ends without a start isn't drawn)
    name: "custom-ledger-lines",
    gabc:
      "(c4) a(g[oll:1]) b(m[oll:0]) c(d[ull:1]) d(b[ull:0]) e(g[oll:0;5mm]h) f([oll:1;5mm]gh) g([ull:1{1]fgh) " +
      "h(g[ull:}]f) i(h[oll:2mm;2mm]) j(fg[oll:1]h) k(lm[oll:0]) l(e[ull:}]) m(g[oll:0{1]) (z) n(hg) o(h[oll:}]) (::)"
  },
  {
    // episemata moved to the middle, or low or high, in their spaces, and
    // nudged, over and under notes in spaces and on lines; and the episemata
    // in blocks put on one level, even across syllables and spaces, where
    // the note the block starts after isn't in it
    name: "episema-tuning",
    gabc:
      "(c4) a(g_) b(g_[oh:m]) c(g_[oh:l]) d(g_[oh:h]) e(h_[oh:l]) f(h_[oh:+1mm]) g(h_[oh:m-0.5mm]) h(g_0[uh:l]) " +
      "i(h_0[uh:m]) j(g_0[uh:oh]) (::) k(e_[oh:{]f_) l(g_ h_[oh}]) m(g_) n([oh:h{]f_ g_ e_[oh}]) o([uh:{]h_0 j_0) p(f_0[uh}]) (::)"
  },

  // Gregorio: Phase 8
  {
    // Gregorio's neume fusion with @ (a-c are Gabc.tex's examples): the glyphs
    // either side of an @ are joined, by a line where they're more than a step
    // apart (e, f, i, j), and a flexus joined to a higher note is a
    // porrectus's stroke (a, h).  A pes or porrectus can only end the shape (g,
    // l, q), and a fused oriscus scapus has no stem (p).  Where Gregorio doesn't
    // join them, the glyph after the @ follows with no space: a quilisma (a, r),
    // a flexus after inclinata (c), a pes after a higher note (u, but not m's
    // pes quassus), a torculus (s).  The glyphs either side of the @ are
    // Gregorio's, so t's second j isn't in a distropha.  Then episemata, morae
    // and ictus on fused shapes, and ledger lines
    name: "fusion-manual",
    gabc:
      "(c4) a(h@iw@ji@j@ih~) b(d@eo@fd) c(IJ@kh) d(g@h@g@h@g) e(e@g@e) f(g@ih) g(e@gfg) h(hg@hg) " +
      "i(gV@e) j(g@iv) k(h@gv) l(h@fg~) m(h@fog) n(gO@h) o(gO@f) p(f@gO@h) q(gw@hi) r(g@hw) s(g@hih) " +
      "t(jj@h) u(h@fg) (:) v(g_@h_@g_) w(e_@gfg_) x(h_@iw@j_i_@j@ih~) y(g_@ih) z(hg_@h'g) A(e@g@e__) " +
      "B(g.@h@g.) C(g@h.@g@h.) D(f.@hgh.) E(g'@h@g') F(gV'@e.) G(b@d@b) H(l@j@l) (::)"
  },
  {
    // Gregorio's automatic fusion, @[…] (a-c are Gabc.tex's examples, drawn as
    // in fusion-manual), which splits the notes as Gregorio does: a flexus
    // before a higher note is a porrectus's stroke (d, k), and the last two
    // notes are a pes or flexus, or the last three a porrectus (g, which is
    // drawn as usual).  An oriscus, quilisma or virga starts a glyph, and a
    // virga or a liquescent ends one (h, n, o); other notes make their neumes
    // as usual (c's inclinata, l's virga reversa).  The glyphs after the first
    // are fused, and the first only with an @ (p-r), even after a ! or a space
    // in the @[…] (s, t)
    name: "fusion-automatic",
    gabc:
      "(c4) a(@[hiwjijih~]) b(@[deofd]) c(@[IJkh]) d(@[ghghg]) e(@[ghiji]) f(@[hgfe]) g(@[hgh]) " +
      "h(@[gh~ij]) i(@[gwhg]) j(@[gogh]) k(@[hghg]) l(@[gVhg]) m(@[gOhg]) n(@[fhvg]) o(@[fgOgjV~]) " +
      "p(f@[ghg]f) q(@[gh]@[ij]) r(@[gh]@[@ij]) s(@[fg!hg]) t(@[fg hg]) (::)"
  },
  {
    // an @ before a flexus or porrectus leaves out its stem, even where it
    // isn't joined to the glyph before (l, m), and a flexus's oriscus scapus
    // (j) has no stem either; a, c and k are as usual
    name: "fusion-no-stem",
    gabc: "(c4) a(hg) b(@hg) c(hgh) d(@hgh) e(@ig) f(@kfk) g(@hg~) h(@kf) i(@gof) j(@gOf) k(gOf) l(fg@hg) m(fg@hgh) (::)"
  },
  {
    // a note fused to a linea is joined to its bar (a, b); a fused porrectus
    // flexus or ancus isn't joined to the glyph before, and keeps its stem
    // (c-e); [shape:stroke] draws a flexus that isn't joined to the glyph after
    // it as a stroke, without its stem if it's fused (f, g); a quilisma
    // quadratum isn't joined to the glyph before (h, i); an empty @[] fuses
    // nothing (j); and a fused note's episema goes above after a fused
    // torculus (k), and below before an episema below (l)
    name: "fusion-details",
    gabc:
      "(c4) a(j=@h) b(h=@j) c(g@hghg) d(e@hghg) e(e@igf~) f(hf[shape:stroke]@f) g(@hf[shape:stroke]) " +
      "h(f@gW) i(@[fgWh]) j(@[]ghg) k(g@hih@g_@h) l(g_@h_0) (::)"
  },

  // Gregorio: Phase 9
  {
    // a drop cap beside two lines (Gregorio's \gresetinitiallines{2}), made
    // big enough to reach across them, with its baseline on the second
    // line's lyric baseline; both lines start after it.  (Drawn line by line,
    // each line's svg has the part of the drop cap beside it.)
    name: "two-line-initial",
    outputs: withLines,
    gabc: adTeLevavi,
    useDropCap: true,
    setupContext: (ctxt) => (ctxt.dropCapLines = 2)
  },
  {
    // with the annotation centered above it
    name: "two-line-initial-annotation",
    gabc: adTeLevavi,
    useDropCap: true,
    setupContext: (ctxt) => (ctxt.dropCapLines = 2),
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotations(ctxt, "Intr.", "VIII"))
  },
  {
    // a drop cap beside three lines at the size set in its text style, which
    // isn't made bigger to reach across them: the annotation, at the first
    // line's top staff line, is wider, so all three lines start after it
    name: "three-line-initial-narrow",
    gabc:
      "(c4) IN(d)tro(f)í(gh)bo(g) ad(f) al(gh)tá(h)re(h) De(hi)i:(h.) (;) ad(h) De(g)um(hj) qui(h) " +
      "lae(gf)tí(g)fi(h)cat(gf) ju(e)ven(f)tú(gh)tem(g) me(f)am.(f.) (:) Con(f)fi(gh)té(h)bor(g) ti(f)bi(gh) " +
      "in(h) cí(hi)tha(h)ra,(g.) (;) De(f)us,(gh) De(h)us(g) me(f)us.(f.) (:) Quid(f) tri(gh)stis(h) es(g) " +
      "á(f)ni(gh)ma(h) me(hi)a,(h.) (;) et(h) qua(g)re(hj) con(h)túr(gf)bas(g) me?(f.) (::)",
    useDropCap: true,
    setupContext: (ctxt) => {
      ctxt.dropCapLines = 3;
      ctxt.textStyles.dropCap.size = 96;
    },
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotations(ctxt, "Ad Introitum", "Tonus VIII"))
  },
  {
    // the top of the drop cap on the first line's top staff line (Gregorio's
    // \gresetinitialanchor{top} and \gresetinitialposition{firsttop}), and
    // the annotation above it, which makes the first line taller
    name: "two-line-initial-first-top",
    gabc: adTeLevavi,
    useDropCap: true,
    setupContext: (ctxt) => {
      ctxt.dropCapLines = 2;
      ctxt.dropCapAnchor = "top";
      ctxt.dropCapPosition = "firsttop";
    },
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotations(ctxt, "Intr.", "VIII"))
  },
  {
    // the baseline of the drop cap on the first line's lyric baseline, at its
    // text style's size, since it doesn't reach across the lines from there
    name: "two-line-initial-first-baseline",
    gabc: adTeLevavi,
    useDropCap: true,
    setupContext: (ctxt) => {
      ctxt.dropCapLines = 2;
      ctxt.dropCapPosition = "firstbaseline";
    }
  },
  {
    // the baseline of the drop cap at the bottom of the second line, below its
    // lyrics, at its text style's size
    name: "two-line-initial-last-bottom",
    gabc: adTeLevavi,
    useDropCap: true,
    setupContext: (ctxt) => {
      ctxt.dropCapLines = 2;
      ctxt.dropCapPosition = "lastbottom";
    }
  },
  {
    // a drop cap beside three lines in a score of one line goes on that line,
    // made just big enough to reach across it
    name: "three-line-initial-one-line",
    gabc: "(c4) AL(f)le(g)lú(h)ia.(g) (::)",
    useDropCap: true,
    setupContext: (ctxt) => (ctxt.dropCapLines = 3)
  },
  {
    // the second line, beside the drop cap, stays on the first page although
    // the page is too short for it (and drawn line by line, the second line's
    // svg has the part of the drop cap beside it)
    name: "two-line-initial-paginated",
    outputs: ["svg", "tree", "canvas", "lines"],
    gabc: adTeLevavi,
    useDropCap: true,
    width: 400,
    paginate: 150,
    setupContext: (ctxt) => (ctxt.dropCapLines = 2)
  },
  {
    // text other than the lyrics on the lines beside the drop cap starts
    // after it too: the text-only syllables that go on below the first line,
    // and the text above the second line and its translation
    name: "two-line-initial-text",
    gabc:
      "(c4) Ky(f)ri(g)e(h) (,) Here is a very long run of text only syllables that will not fit() " +
      "on the line() and so goes underneath() (;) e(g)lé(f)i(e)son.(f) (:) " +
      "Chri(g)ste[Christ, have mercy upon us](h) e<alt>Some text above the staff that goes on</alt>(g)lé(f)i(e)son.(f) (:) " +
      "Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (::)",
    useDropCap: true,
    width: 500,
    setupContext: (ctxt) => {
      ctxt.dropCapLines = 2;
      ctxt.translationCentering = "center";
    }
  },

  // Gregorio: Phase 10
  {
    // the example that Gregorio's NABC reference starts with, drawn with
    // gregall above the staff, each neume at the left of its notes
    name: "nabc-st-gall-basic",
    gabc:
      "nabc-lines: 1;\n%%\n(f3) AL(ef~|ta>)le(fg/hggf|peclhgpi)lú(ef~|ta>)ia.(f.|ta-) (,) " +
      "(ii//|bv-|gh!ivHG//|vi-hhppu2su1sut1|fhg/|to|eef.|pt) (;)",
    setupContext: (ctxt) => (ctxt.nabcFonts = [gregall])
  },
  {
    // the second line of NABC below the staff, with the lyrics below it,
    // and NABC wider than its notes pushing the next syllable over.  On the
    // second line of the score, a neume pitched low (hb) pushes the first
    // line of NABC up, and a note two below the staff pushes the second down.
    name: "nabc-two-voices",
    gabc:
      "nabc-lines: 2;\n%%\n(c4) A(f|vi|ta)ve(gh|pe|pe-) Ma(hg|cl|cllst2)rí(gf/ef|po|po)a(e.|ta-|pu) (;) " +
      "gra(f|vihh|vi)ti(f|pe|pe)a(f|vi|vi) (z) ple(h|vihb|vi)na(b|cl|cl) Dó(c|tolsc3ppt1|tolsc3ppt1)mi(d|vi|vi)nus(d|pu|pu) (::)",
    setupContext: (ctxt) => (ctxt.nabcFonts = [gregall])
  },
  {
    // significative letters: at each position, in glyphs with the neume
    // (vilsc3) and around it, several at one position, and with puncta
    // before and after the neume
    name: "nabc-significative-letters",
    gabc:
      "nabc-lines: 1;\n%%\n(c3) FAc(e|talsi8)tus(ei|pe) est(i|vilsc3) re(i|vihhlsl2lsc2)pén(i|vilst1lsc4lsx7)te(e.|tahglsi9) (,) " +
      "de(e|pfhhlsl2lsc2) cæ(e|cllsc3lse7)lo(e|tolst2lss9lsc7) so(e|vippt1lsc2)nus,(dc..|clppt2lsc6lst8) (;)",
    setupContext: (ctxt) => (ctxt.nabcFonts = [gregall])
  },
  {
    // NABC on syllables without notes, which takes its own room
    name: "nabc-only",
    gabc: "nabc-lines: 1;\n%%\n(c4) a(|vi) b(|pe) c(|cllsc3) d(f|ta) e(|/to) (::)",
    setupContext: (ctxt) => (ctxt.nabcFonts = [gregall])
  },
  {
    // NABC that Gregorio can't draw, where ERR goes: a neume that isn't
    // one, glyphs too far apart in pitch, a letter that GregorioTeX doesn't
    // know, and a neume (pv) that gregall has no glyph for
    name: "nabc-errors",
    gabc: "nabc-lines: 1;\n%%\n(c4) a(f|vixx) b(g|viha!puhp/pe) c(h|vilspulcre2) d(g|pv) e(f|ta) (::)",
    setupContext: (ctxt) => (ctxt.nabcFonts = [gregall])
  },
  {
    // with nabcAlignment "neume", the letters on the left hang back, and
    // the notes move over to make room for them
    name: "nabc-neume-alignment",
    gabc: "nabc-lines: 1;\n%%\n(c4) a(f|vilst4lsc1) b(g|pelsx7) c(h|tolse4lsc6) (::)",
    setupContext: (ctxt) => {
      ctxt.nabcFonts = [gregall];
      ctxt.nabcAlignment = "neume";
    }
  },
  {
    // the first line of NABC as a phantom, taking its room, and the second
    // invisible, taking none
    name: "nabc-visibility",
    gabc: "nabc-lines: 2;\n%%\n(c4) A(f|vi|ta)ve(gh|pe|pe-) Ma(hg|cl|cllst2)ri(gf|cl|cl)a(e.|ta-|pu) (::)",
    setupContext: (ctxt) => {
      ctxt.nabcFonts = [gregall];
      ctxt.nabcVisibility = ["phantom", "invisible"];
    }
  },
  {
    // the Laon neumes of the score that Gregorio's NABC reference prints
    // (doc/omnes.gabc), drawn with grelaon: un and oc, letters inside the
    // neume (lsa5), and a Tironian note (ltsr6)
    name: "nabc-laon",
    gabc:
      "nabc-lines: 1;\n%%\n(f3) OM(f_c/ef~|clGhhta>)nes(f.|un1hg) *(,) qui(e|puhd) in(f|pu) Chris(f/ghf|un1helst8`tohi)to(f_ef.|clGhglsa5vi) (,) " +
      "bap(f|puhd)ti(hh|bvlsa2)zá(h|un)ti(fe|unhd) es(e!gwh!ivHG'/hwihi|un1hbppn1ppq1sun2ql!po)tis,(ie..|clGhg) (;) " +
      "al(hhf~|unlsa2`vi>)le(hh|bvlsa2)lú(hih|to>ltsr6)ia.(f.|unhd) (::)",
    setupContext: (ctxt) => (ctxt.nabcFonts = [grelaon])
  },
  {
    // nabc-st-gall-basic, drawn with gresgmodern
    name: "nabc-gresgmodern",
    gabc:
      "nabc-lines: 1;\n%%\n(f3) AL(ef~|ta>)le(fg/hggf|peclhgpi)lú(ef~|ta>)ia.(f.|ta-) (,) " +
      "(ii//|bv-|gh!ivHG//|vi-hhppu2su1sut1|fhg/|to|eef.|pt) (;)",
    setupContext: (ctxt) => (ctxt.nabcFonts = [gresgmodern])
  }
];

// -----------------------------------------------------------------------------
// settings

// a double bar with lyrics, a clef change, a custos before a divider, a
// translation, a zero-width group, long above-lines text and ledger lines, to
// be broken into lines at several widths
const lineBreakEdgeCases =
  "(c4) Al(f)le(g)lú(h)ia.(g) Ps.(::) Lau(f)da(g)te(h) Dó(g)mi(f)num(e) (c3) om(f)nes(g) gen(h)tes(g) (g+) (;) " +
  "lau(f)dá(g)te[Praise him, all you peoples of the world](h) e(g)um(f) om(e)nes(f) pó(g)pu(h)li[/](g) (,) " +
  "quó(f{h}g)ni(g{i}h)am(h) <alt>A long text above the lines, to the end</alt>con(g)fir(h)má(i)ta(h) est(g) (h+) (:) " +
  "su(lml)per(kmk) nos(a) mi(ab)se(dcb)ri(c)cór(d)di(e)a(f) e(g)ius,(f) (;) et(e) vé(f)ri(g)tas(f) Dó(e)mi(d)ni(c) má(d)net(e) " +
  "in(f) ae(g)tér(h)num.(g) (::) Ky(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (::)";

const titles = (score: any, ctxt: any) => {
  score.titles.setSupertitle(ctxt, "Dominica I Adventus");
  score.titles.setTitle(ctxt, "<b>Ad te levávi</b>");
  score.titles.setSubtitle(ctxt, "Introitus · <i>Ps. 24</i>");
  score.titles.setTextLeft(ctxt, "Mode 8");
  score.titles.setTextRight(ctxt, "<sc>Graduale Romanum</sc> p. 15");
};

export const settingCases: GoldenCase[] = [
  // ---- text measurement
  { name: "opentype", gabc: adTeLevavi, useDropCap: true, strategy: "opentype" },
  { name: "canvas", outputs: allOutputs, gabc: adTeLevavi, useDropCap: true, strategy: "canvas" },
  { name: "canvas-basic", outputs: ["svg", "canvas"], gabc: adTeLevavi, useDropCap: true, strategy: "canvas-basic" },
  { name: "no-fonts", gabc: adTeLevavi, useDropCap: true, strategy: "none" },
  { name: "opentype-markup", outputs: allOutputs, gabc: featureCases.find((c) => c.name === "lyric-markup")!.gabc, strategy: "opentype" },
  { name: "canvas-markup", outputs: allOutputs, gabc: featureCases.find((c) => c.name === "lyric-markup")!.gabc, strategy: "canvas" },

  // ---- widths
  { name: "narrow", gabc: puer, useDropCap: true, width: 180 },
  { name: "wide", gabc: puer, useDropCap: true, width: 1400 },
  { name: "unlimited-width", gabc: kyrie, useDropCap: true, width: 0 },
  { name: "relayout", gabc: puer, useDropCap: true, width: 300, relayoutWidths: [800, 450] },
  { name: "extra-text-only-narrow", gabc: featureCases.find((c) => c.name === "extra-text-only-lines")!.gabc, width: 160 },
  ...[170, 230, 290, 350].map((width) => ({
    name: `line-break-edge-cases-${width}`,
    gabc: lineBreakEdgeCases,
    width,
    setupContext: (ctxt: any) => {
      ctxt.updateHyphenWidth();
      ctxt.minLyricWordSpacing = ctxt.hyphenWidth / 3;
    }
  })),
  {
    name: "text-only-at-end",
    gabc: "(c4) Ky(f)ri(g)e() e<br>lé<br>i<br>son.() (::) Chri(f)ste() e<br>lé<br>i<br>son.()",
    width: 400
  },

  // ---- drop caps, annotations and titles
  { name: "no-drop-cap", gabc: kyrie },
  {
    name: "drop-cap-variants",
    outputs: allOutputs,
    gabc: "(c4) <sc>ky</sc>(f)ri(g)e(h) e(g)lé(f)i(e)son.(f) (::)",
    useDropCap: true
  },
  { name: "drop-cap-special-char", gabc: "(c4) ℣.(f) Ky(g)ri(h)e(g) (::)", useDropCap: true },
  { name: "drop-cap-single-letter", gabc: "(c4) O(f) sa(g)lu(h)ta(g)ris(f) (::)", useDropCap: true },
  {
    name: "annotation-with-drop-cap",
    outputs: allOutputs,
    gabc: kyrie,
    useDropCap: true,
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotation(ctxt, "<b>Ant.</b>"))
  },
  {
    name: "annotations-with-drop-cap",
    outputs: allOutputs,
    gabc: adTeLevavi,
    useDropCap: true,
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotations(ctxt, "Intr.", "<i>VIII</i>"))
  },
  {
    name: "tall-annotations-with-drop-cap",
    gabc: "(c4) A(f)ve(g) (::)",
    useDropCap: true,
    setupContext: (ctxt) => ctxt.setStaffHeight(30),
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotations(ctxt, "Ant.", "VIII", "g", "<b>x</b>"))
  },
  {
    // an annotation after one with a line break goes below the other's last
    // line, which is spaced by its own (90%) size
    name: "annotations-with-line-breaks",
    outputs: allOutputs,
    gabc: "(c4) A(f)ve(g) (::)",
    useDropCap: true,
    setupContext: (ctxt) => ctxt.setStaffHeight(30),
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotations(ctxt, "Ant.<br><e>VIII</e>", "g"))
  },
  {
    name: "annotation-merged-into-text-left",
    outputs: allOutputs,
    gabc: kyrie,
    setupScore: (score, ctxt, E) => {
      score.annotation = new E.Annotations(ctxt, "Ant.", "VIII");
      score.titles.setTextLeft(ctxt, "Left text");
    }
  },
  {
    name: "annotation-not-merged",
    outputs: allOutputs,
    gabc: kyrie,
    setupContext: (ctxt) => ctxt.setMergeAnnotationWithTextLeft(false),
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotation(ctxt, "Ant. 8"))
  },
  {
    name: "annotation-spans-mapped",
    outputs: allOutputs,
    gabc: kyrie,
    setupContext: (ctxt) => {
      ctxt.mapAnnotationSpansToTextLeft = (spans: any[]) =>
        spans.map((span) => {
          const clone = span.clone();
          clone.text = "[" + clone.text + "]";
          return clone;
        });
    },
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotations(ctxt, "Ant.", "VIII"))
  },
  { name: "titles", outputs: withLines, gabc: adTeLevavi, useDropCap: true, setupScore: titles },
  {
    name: "titles-aligned-and-wrapped",
    outputs: allOutputs,
    gabc: kyrie,
    width: 260,
    setupContext: (ctxt) => {
      ctxt.textStyles.supertitle.alignment = "left";
      ctxt.textStyles.title.alignment = "right";
      ctxt.textStyles.subtitle.alignment = "center";
      ctxt.textStyles.title.padding = 2;
      ctxt.textStyles.leftRight.padding = 0.5;
    },
    setupScore: (score, ctxt) => {
      score.titles.setSupertitle(ctxt, "A supertitle long enough that it has to wrap onto more lines");
      score.titles.setTitle(ctxt, "Ad te <i>levávi</i> ánimam<br>meam Deus meus <i>in te confído</i> non erubéscam");
      score.titles.setSubtitle(ctxt, "Subtitle");
      score.titles.setTextRight(ctxt, "Right");
    }
  },

  // ---- staff
  { name: "staff-height", gabc: puer, useDropCap: true, setupContext: (ctxt) => ctxt.setStaffHeight(90) },
  { name: "glyph-multiplier", outputs: ["svg", "canvas"], gabc: puer, useDropCap: true, setupContext: (ctxt) => ctxt.setStaffHeight(37.5, 0.8) },
  // a porrectus (a to e), porrectus flexus (f) and torculus resupinus (g, h)
  // falling 1 to 7 staff positions, and one under a Chi-Rho clef (m), drawn
  // with the notes' size at the glyph multiplier but falling as far, with
  // episemata (i, j), morae (k), an ictus (j) and a cavum (l) on their notes
  {
    name: "porrectus-glyph-multiplier",
    outputs: ["svg", "canvas"],
    gabc: porrectusAtMultipliers,
    setupContext: (ctxt) => ctxt.setStaffHeight(37.5, 0.8)
  },
  {
    // (with the svg's glyphs scaled where they're used, rather than in their defs)
    name: "porrectus-glyph-multiplier-large",
    outputs: ["svg", "canvas"],
    gabc: porrectusAtMultipliers,
    setupContext: (ctxt) => {
      ctxt.setScaleDefs(false);
      ctxt.setStaffHeight(37.5, 1.25);
    }
  },
  {
    name: "scale-uses",
    outputs: allOutputs,
    gabc: christus,
    useDropCap: true,
    setupContext: (ctxt) => ctxt.setScaleDefs(false)
  },
  {
    name: "two-line-staff",
    outputs: withLines,
    gabc: "(c2) a(cdc) b(e) (,) c(d) (;) d(c) (:) e(b) (::) f(f) g(e+) (::)",
    setupScore: (score) => (score.staffLineCount = 2)
  },
  {
    name: "three-line-staff",
    outputs: allOutputs,
    gabc: "(c2) a(cdce) b(e_) (,) c(d.) (;) d(c') (:) e(fgf) (::)",
    setupScore: (score) => (score.staffLineCount = 3)
  },
  {
    name: "five-line-staff",
    outputs: allOutputs,
    gabc: "(c4) a(fgh_) b(j.) (,) c(kmlk) (;) d(l') (:) e(abcb) (`) f(g) (::) g(f+) h(f) (::)",
    setupScore: (score) => (score.staffLineCount = 5)
  },
  {
    name: "staff-lines-end-at-last-notation",
    outputs: allOutputs,
    gabc: kyrie,
    width: 900,
    setupScore: (score) => (score.extendLastSystemStaffLines = false)
  },

  // ---- other settings
  {
    name: "colors",
    outputs: allOutputs,
    gabc: christus,
    useDropCap: true,
    setupContext: (ctxt) => {
      ctxt.setRubricColor("#a00");
      ctxt.neumeLineColor = "#111";
      ctxt.staffLineColor = "#222";
      ctxt.dividerLineColor = "#333";
      ctxt.negativeFillColor = "#eee";
      ctxt.textColor = "#444";
      ctxt.setFont("Fake-{}", 18, { fill: "#555", class: "base", "letter-spacing": "1px" }, ctxt.fontDictionary);
    },
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotation(ctxt, "<c>Ant.</c>"))
  },
  {
    name: "text-styles",
    outputs: allOutputs,
    gabc: featureCases.find((c) => c.name === "above-lines-text-and-translations")!.gabc,
    setupContext: (ctxt) => {
      ctxt.textStyles.lyric.lineHeight = 1.4;
      ctxt.textStyles.lyric.prefix = "<b>";
      ctxt.textStyles.al.prefix = "";
      ctxt.textStyles.al.size = 20;
      ctxt.textStyles.translation.lineHeight = 1.3;
      ctxt.textStyles.translation.prefix = "<sc>";
      ctxt.textStyles.translation.color = "#060";
    }
  },
  {
    // the lines of a lyric, of a wrapped text only lyric and of the title are
    // as far apart as their text styles' line heights
    name: "line-height-with-line-breaks",
    outputs: allOutputs,
    width: 300,
    gabc:
      "(c4) Ky<br>rie(f) e<br/>lé(g) son.<br><br>A(h) (,) " +
      "Here is a very long run of text only syllables that will not fit() on the line() (::)",
    setupContext: (ctxt) => {
      ctxt.textStyles.lyric.lineHeight = 1.5;
      ctxt.textStyles.title.lineHeight = 1.3;
    },
    setupScore: (score, ctxt) => score.titles.setTitle(ctxt, "Ad te levávi<br>ánimam meam")
  },
  {
    // annotations are as far apart as the annotation text style's line height
    name: "annotation-line-height",
    outputs: allOutputs,
    gabc: kyrie,
    useDropCap: true,
    setupContext: (ctxt) => (ctxt.textStyles.annotation.lineHeight = 1.6),
    setupScore: (score, ctxt, E) => (score.annotation = new E.Annotations(ctxt, "Ant.", "VIII", "g"))
  },
  {
    name: "special-character-settings",
    gabc: featureCases.find((c) => c.name === "special-characters")!.gabc,
    setupContext: (ctxt) => {
      ctxt.textBeforeSpecialChar = "(";
      ctxt.textAfterSpecialChar = ")";
      ctxt.specialCharMap["℣"] = "V";
      ctxt.asteriskProperties = { fill: "#0a0" };
      ctxt.plusProperties = { "font-weight": "bold" };
      ctxt.clearTextCache();
    }
  },
  {
    name: "spacing-settings",
    gabc: adTeLevavi,
    useDropCap: true,
    setupContext: (ctxt) => {
      ctxt.interSyllabicMultiplier = 3;
      ctxt.interVerbalMultiplier = 2;
      ctxt.accidentalSpaceMultiplier = 3;
      ctxt.condensingTolerance = 0.1;
      ctxt.maxExtraSpaceInStaffIntervals = 1;
      ctxt.minSpaceAboveStaff = 3;
      ctxt.minSpaceBelowStaff = 2;
      ctxt.spaceBetweenSystems = 2.5;
      ctxt.minLedgerSeparation = 3;
      ctxt.updateHyphenWidth();
      ctxt.minLyricWordSpacing = ctxt.hyphenWidth * 1.5;
    }
  },
  {
    name: "last-line-minimums",
    gabc: puer,
    width: 420,
    setupContext: (ctxt) => {
      ctxt.minSyllablesLastLine = 4;
      ctxt.minNotesLastLine = 6;
    }
  },
  {
    name: "no-extra-text-only",
    gabc: featureCases.find((c) => c.name === "extra-text-only-lines")!.gabc,
    width: 300,
    setupContext: (ctxt) => (ctxt.useExtraTextOnly = false)
  },
  {
    name: "extra-text-only-from-first",
    gabc: featureCases.find((c) => c.name === "extra-text-only-lines")!.gabc,
    width: 300,
    setupContext: (ctxt) => (ctxt.startExtraTextOnlyFromFirst = true)
  },
  {
    name: "no-auto-color",
    gabc: featureCases.find((c) => c.name === "directives")!.gabc,
    setupContext: (ctxt) => (ctxt.autoColor = false)
  },
  {
    name: "font-family-attributes",
    gabc: kyrie,
    setupContext: (ctxt) => (ctxt.setFontFamilyAttributes = true)
  },
  {
    name: "english",
    gabc: "(c4) Lord(f) have(g) mer(h)cy(g) up(f)on(g) us,(h) (,) Christ(g) have(f) mer(e)cy.(f) (::) Hal(f)le(g)lu(h)jah(g) (::)",
    setupContext: (ctxt, E) => (ctxt.defaultLanguage = E.language.english)
  },
  {
    name: "spanish",
    gabc: "(c4) Se(f)ñor,(g) ten(h) pie(g)dad(f) de(g) no(h)so(g)tros.(f) (;) Cris(f)to,(g) guí(h)a(g)nos(f) que(g) (::)",
    setupContext: (ctxt, E) => (ctxt.defaultLanguage = E.language.spanish)
  },
  {
    name: "note-id-prefix",
    gabc: "(c4) Ky(f)ri(gfg)e(h) (::)",
    setupContext: (ctxt) => (ctxt.noteIdPrefix = "n")
  },
  {
    name: "def-id-prefix",
    outputs: ["svg", "node"],
    gabc: "(c4) Ky(f)ri(gfg)e(h) (::)",
    setupContext: (ctxt) => (ctxt.defIdPrefix = "s1-")
  },

  // ---- editing
  {
    name: "editable-with-selection",
    outputs: allOutputs,
    gabc: kyrie,
    setupContext: (ctxt) => (ctxt.editable = true),
    afterLayout: (score) => score.updateSelection({ element: { indices: [-1, 1, 2, 7] } })
  },
  {
    name: "insertion-cursor-after-element",
    outputs: allOutputs,
    gabc: kyrie,
    afterLayout: (score) => score.updateSelection({ element: { indices: [], insertion: { afterElementIndex: 3 } } })
  },
  {
    name: "insertion-cursor-on-line",
    outputs: allOutputs,
    gabc: kyrie,
    width: 300,
    afterLayout: (score) => score.updateSelection({ element: { indices: [], insertion: { chantLine: 1 } } })
  },
  {
    name: "insertion-cursor-on-text-only",
    outputs: allOutputs,
    gabc: "(c4) Ky(f)ri(g)e() e(h) (::)",
    afterLayout: (score) => score.updateSelection({ element: { indices: [2] } })
  },
  {
    name: "selected-porrectus",
    outputs: allOutputs,
    gabc: "(c4) a(gfg) b(hfh) c(f) (::)",
    afterLayout: (score) => score.updateSelection({ element: { indices: [0, 4] } })
  },
  {
    name: "edited",
    gabc: kyrie,
    useDropCap: true,
    edits: [
      kyrie.replace("KY(f)", "KY(fg)").replace("son.(f.) (::)", "son.(f.) (:)"),
      "(c3) " + kyrie.slice(5).replace("Chri(e!fgf)", "Chri(e!fgf_)ste(e.) (,) Chri(e)")
    ]
  },

  // ---- layout entry points
  { name: "async-layout", gabc: christus, useDropCap: true, async: true },
  { name: "paginated", outputs: ["svg", "tree", "canvas"], gabc: puer, useDropCap: true, width: 320, paginate: 140, setupScore: titles },
  { name: "tree-zoom", outputs: ["tree"], gabc: kyrie, zoom: 1.5 },
  { name: "tree-fill-container", outputs: ["tree"], gabc: kyrie, zoom: true },

  // Gregorio: Phase 9
  {
    // a canvas without actualBoundingBox metrics measures only the font's box,
    // so a drop cap beside two lines is sized as a typical capital
    name: "canvas-basic-two-line-initial",
    outputs: ["svg", "canvas"],
    gabc: adTeLevavi,
    useDropCap: true,
    strategy: "canvas-basic",
    setupContext: (ctxt) => (ctxt.dropCapLines = 2)
  }
];

// -----------------------------------------------------------------------------
// text measured from svg elements

/**
 * Cases that measure text with TextMeasuringStrategy.Svg, which needs a DOM
 * that can measure text, so these are rendered only by the tests that stub
 * that (see stubSvgTextMeasurement() in harness.ts).
 */
export const svgMeasuredCases: GoldenCase[] = [
  { name: "svg-measured", outputs: allOutputs, gabc: adTeLevavi, useDropCap: true, strategy: "svg" },
  {
    ...featureCases.find((c) => c.name === "lyric-markup")!,
    name: "svg-measured-markup",
    outputs: ["svg", "node"],
    strategy: "svg"
  },
  {
    ...featureCases.find((c) => c.name === "lyric-centering")!,
    name: "svg-measured-centering",
    outputs: ["svg", "node"],
    strategy: "svg"
  },
  {
    ...featureCases.find((c) => c.name === "line-breaks-in-sized-text")!,
    name: "svg-measured-sized-line-breaks",
    outputs: ["svg", "node"],
    strategy: "svg"
  },
  {
    ...featureCases.find((c) => c.name === "resized-lyric-with-sized-text")!,
    name: "svg-measured-resized-lyric",
    outputs: ["svg", "node"],
    strategy: "svg"
  },
  {
    ...featureCases.find((c) => c.name === "centering-after-line-breaks")!,
    name: "svg-measured-centering-after-line-breaks",
    outputs: ["svg", "node"],
    strategy: "svg"
  },
  {
    ...featureCases.find((c) => c.name === "lyric-protrusion-after-line-break")!,
    name: "svg-measured-protrusion-after-line-break",
    outputs: ["svg", "node"],
    strategy: "svg"
  },
  {
    ...featureCases.find((c) => c.name === "extra-text-only-lines")!,
    name: "svg-measured-extra-text-only-lines",
    outputs: ["svg", "node"],
    strategy: "svg"
  },
  {
    ...settingCases.find((c) => c.name === "line-height-with-line-breaks")!,
    name: "svg-measured-line-height",
    outputs: ["svg", "node"],
    strategy: "svg"
  },
  {
    ...settingCases.find((c) => c.name === "titles-aligned-and-wrapped")!,
    name: "svg-measured-titles",
    outputs: ["svg", "node"],
    strategy: "svg"
  },

  // Gregorio: Phase 9
  {
    // getBBox() measures only the font's box (where there's no canvas to
    // measure the letter on), so the drop cap is sized as a typical capital
    ...featureCases.find((c) => c.name === "two-line-initial")!,
    name: "svg-measured-two-line-initial",
    outputs: ["svg", "node", "nodeLines"],
    strategy: "svg"
  }
];
