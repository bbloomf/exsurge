// Checks src/index.d.ts against how exsurge is used.  It is only type-checked
// (npm run test:types), never run.  Each @ts-expect-error marks a use that
// the JS doesn't support, so it must stay a type error.
import type { Font as FontkitFont } from "fontkit";
import {
  ChantContext,
  ChantScore,
  Gabc,
  GabcHeader,
  ScoreWithTitles,
  SvgTreeNode,
  TextElement,
  TextSpan,
  TextTypes,
  Titles
} from "exsurge";

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B
  ? 1
  : 2
  ? true
  : false;
const same = <A, B>(check: Equals<A, B>) => check;

const ctxt = new ChantContext();
const mappings = Gabc.createMappingsFromSource(ctxt, "(c4) Ky(f)ri(g)e(h)");
const score = new ChantScore(ctxt, mappings, true);

// ChantContext: text styles
ctxt.textColor = "#333";
ctxt.textStyles.al.prefix = "<b>";
ctxt.textStyles.title.padding = 1.5;
ctxt.textStyles.dropCap.padding = 2;
// @ts-expect-error the drop cap's padding has no fallback if it's unset
ctxt.textStyles.dropCap.padding = undefined;
// @ts-expect-error removed in the 2020 text-style refactor; see textStyles
ctxt.lyricTextColor = "#000";
// @ts-expect-error removed in the 2020 text-style refactor; see textStyles
ctxt.alTextStyle = "<i>";
// @ts-expect-error removed in the 2020 text-style refactor; see textStyles
ctxt.dropCapPadding = 1;

// ChantContext: everything else
ctxt.fontLoadTimeout = 1000;
same<typeof ctxt.staffInterval, number>(true);
same<typeof ctxt.editable, boolean | undefined>(true);
// @ts-expect-error derived from minLyricWordSpacing; set that instead
ctxt.minLyricWordSpacingRatio = 2;
document.head.appendChild(ctxt.createStyleNode());
const styleTree: SvgTreeNode = ctxt.createStyleTree();
// @ts-expect-error createStyleReact() is createStyleTree()
ctxt.createStyleReact();
declare const fontkitFont: FontkitFont;
ctxt.setFont("Garamond", 16, {}, { Regular: fontkitFont });

// ChantScore
same<typeof score.forceLayout, boolean | undefined>(true);
score.performLayoutAsync(ctxt, () =>
  score.layoutChantLines(ctxt, 500, (laidOut) =>
    laidOut.createSvgTree(ctxt, true)
  )
);
score.waitForLyricFont(ctxt, () => {});
// @ts-expect-error an internal step of performLayout()/performLayoutAsync()
score.initializeLayout(ctxt);
const headerLength: number = Gabc.updateMappingsFromSource(
  ctxt,
  score.mappings,
  "(c4) Ky(g)ri(g)e(h)"
);

// Titles
const titles = new Titles(ctxt, score, { title: "Kyrie" });
const isTitles: boolean = score.titles instanceof Titles;
const titleSpans: TextSpan[] | undefined = titles.title?.spans;
const titlesHeight: number = titles.layoutTitles(ctxt, 500);

// TextTypes
const lyric: TextElement | null | undefined = TextTypes.lyric.getFromScore(
  score,
  titles.title!
);
// @ts-expect-error a lyric can only be found from another lyric element
TextTypes.lyric.getFromScore(score);
// @ts-expect-error annotations need the element to look for, too
TextTypes.annotation.getFromScore(score, undefined);
// @ts-expect-error a score made without a ChantContext has no titles
TextTypes.title.getFromScore(new ChantScore());
if (score.titles) TextTypes.title.getFromScore(score as ScoreWithTitles);
const svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
TextTypes.annotation.getFromSvgElem(score, svgText);
// @ts-expect-error the drop cap has no getFromSvgElem
TextTypes.dropCap.getFromSvgElem(score, svgText);
const choralSignSize: number = TextTypes.choralSign.size(ctxt);
// @ts-expect-error choral signs are sized by the staff, not by defaultSize()
TextTypes.choralSign.defaultSize(12);
same<typeof TextTypes.lyric.key, keyof typeof TextTypes>(true);

// GabcHeader
const header = new GabcHeader("name: Kyrie;\n%%\n");
same<typeof header.name, string | undefined>(true);
same<typeof header.commentaryArray, string[] | undefined>(true);
same<typeof header.comments, string[]>(true);
same<typeof header.cValues, { [key: string]: string }>(true);
const headerText: string = header.toString() + header.original;
