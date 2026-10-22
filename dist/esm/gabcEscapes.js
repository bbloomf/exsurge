// Gregorio's $ escapes: a $ takes away any special meaning of the character
// after it, so "$(" is a parenthesis in the lyrics and "$$" a $.  The parser
// replaces each "$x" with a mark and a character that means nothing to it
// (for ASCII, which has the special characters, one in the private use area
// after escapeMark; otherwise x itself, after literalEscapeMark), keeping the
// source the same length, and the text is unescaped when it's drawn.
export const escapeMark = "﷑";
const literalEscapeMark = "﷒";
/** the source of a regex for the character after a $ (a whole surrogate pair) */
export const escapedCharSource = "(?:[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\s\\S])";
/** the source of a regex for an escaped character, with its mark */
export const escapedSource = `[${escapeMark}${literalEscapeMark}]${escapedCharSource}`;
const escapedRegex = new RegExp(escapedSource, "g");
/** "$x" as the parser reads it: a mark and a character that means nothing to it */
export const escapeChar = (char) => char.length === 1 && char.charCodeAt(0) < 0x80
    ? escapeMark + String.fromCharCode(0xe000 + char.charCodeAt(0))
    : literalEscapeMark + char;
/** the character that escapeChar() made an escaped character (with its mark) of */
const unescapeChar = (escaped) => escaped[0] === escapeMark ? String.fromCharCode(escaped.charCodeAt(1) - 0xe000) : escaped.slice(1);
/** text with its escaped characters as they are drawn */
export const unescapeText = (text) => text.replace(escapedRegex, unescapeChar);
/** text with its escaped characters as they were in the gabc ("$x") */
export const restoreEscapes = (text) => text.replace(escapedRegex, (escaped) => "$" + unescapeChar(escaped));
//# sourceMappingURL=gabcEscapes.js.map