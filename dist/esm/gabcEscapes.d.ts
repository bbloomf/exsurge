export declare const escapeMark = "\uFDD1";
/** the source of a regex for the character after a $ (a whole surrogate pair) */
export declare const escapedCharSource = "(?:[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\s\\S])";
/** the source of a regex for an escaped character, with its mark */
export declare const escapedSource = "[\uFDD1\uFDD2](?:[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\s\\S])";
/** "$x" as the parser reads it: a mark and a character that means nothing to it */
export declare const escapeChar: (char: string) => string;
/** text with its escaped characters as they are drawn */
export declare const unescapeText: (text: string) => string;
/** text with its escaped characters as they were in the gabc ("$x") */
export declare const restoreEscapes: (text: string) => string;
//# sourceMappingURL=gabcEscapes.d.ts.map