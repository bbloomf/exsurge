// Gregorio's $ escapes: a $ takes away any special meaning of the character
// after it, so "$(" is a parenthesis in the lyrics and "$$" a $.  The parser
// replaces each "$x" with escapeMark and a character that means nothing to
// it (for ASCII, which has the special characters, one in the private use
// area; otherwise x itself), keeping the source the same length, and the
// text is unescaped when it's drawn.

export const escapeMark = "﷑";
// an escape mark and the character it escapes
const escapedRegex = /﷑([\uD800-\uDBFF][\uDC00-\uDFFF]|[\s\S])/g;

/** "$x" as the parser reads it: escapeMark and a character that means nothing to it */
export const escapeChar = (char: string) =>
  escapeMark +
  (char.length === 1 && char.charCodeAt(0) < 0x80
    ? String.fromCharCode(0xe000 + char.charCodeAt(0))
    : char);

/** the character that escapeChar() made the character after escapeMark of */
export const unescapeChar = (char: string) => {
  let code = char.charCodeAt(0);
  return char.length === 1 && code >= 0xe000 && code < 0xe080
    ? String.fromCharCode(code - 0xe000)
    : char;
};

/** text with its escaped characters as they are drawn */
export const unescapeText = (text: string) =>
  text.replace(escapedRegex, (match, char) => unescapeChar(char));

/** text with its escaped characters as they were in the gabc ("$x") */
export const restoreEscapes = (text: string) =>
  text.replace(escapedRegex, (match, char) => "$" + unescapeChar(char));
