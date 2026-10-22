// The scores that the golden tests render, chosen to reach every kind of
// notation, marking and text that exsurge draws, and each of the settings that
// change how it lays them out.

import type { OutputName, RenderOptions } from "./harness";

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
    // no notes are lost or made up; the brackets, fusion, linea and
    // quadratum are read but not drawn yet
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
    // a porrectus stroke wider than a fourth (or between nudged notes, as a
    // note on a space is under a Chi-Rho clef) has no glyph yet, so its notes
    // are drawn as puncta joined by a line, and the note after it follows them
    // rather than standing on the last (k is a torculus resupinus)
    name: "porrectus-wide",
    gabc: "(c4) a(kfk) b(lel) c(kfkh) d(ldl) e(kfk~) f(kf_k) g(k.fk) h(-kfk) i(jfj) (::) (xp3) j(hgh) k(ghgh) (::)"
  },

  // Gregorio: Phase 6
  {
    // a cavum stays in its neume, and each note with one is drawn hollow (a
    // porrectus's stroke if either of its notes has one)
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
    // with ctxt.inclinatumLeaning, inclinata lean as their gabc says (g to i)
    // or as their line goes (a to f, and n to p), and an auctus (j to m) has
    // a tail
    name: "inclinatum-variants",
    gabc:
      "(c4) a(hGFE) b(GHI) c(GG) d(G) e(hG) f(fG) g(hG0F0) h(fG1H1) i(gG2G2) j(G<) k(G>) l(hGF<) m(hGF>) " +
      "n(hvGFGF) o(fhGF) p(hGF~) q(hGrFr) r(G<r) s(fG1rH1r) t(G<_) u(hG'F'E') (::)",
    setupContext: (ctxt) => (ctxt.inclinatumLeaning = true)
  },
  {
    // a stropha with < or > is a stropha aucta, with a longer tail (e and j
    // are plain strophae)
    name: "stropha-aucta",
    gabc: "(c4) a(fs<) b(fs>) c(fss<) d(fsss>) e(fs) f(fs<r) g(hs<) h(fs<_) i(fs<.) j(fss) k(fs<') (::)"
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
  { name: "tree-fill-container", outputs: ["tree"], gabc: kyrie, zoom: true }
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
    ...settingCases.find((c) => c.name === "titles-aligned-and-wrapped")!,
    name: "svg-measured-titles",
    outputs: ["svg", "node"],
    strategy: "svg"
  }
];
