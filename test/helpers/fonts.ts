// stands in for a fontkit font: a hyphen is hyphenWidth em wide and every other character half an em
export function fakeFont(hyphenWidth: number) {
  return {
    unitsPerEm: 2048,
    layout: function(text: string) {
      var width = 0;
      for (var i = 0; i < text.length; i++) width += text[i] === '-' ? hyphenWidth * 2048 : 1024;
      return { advanceWidth: width, bbox: { minX: 0, maxY: 1434, height: 1843 } };
    }
  };
}
