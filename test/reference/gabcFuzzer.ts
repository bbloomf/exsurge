// Generates random gabc, from a seed, for comparing two versions of exsurge
// on many more scores than the golden cases have.

/** a small, seedable random number generator (mulberry32) */
export function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (n: number) => Math.floor(next() * n);
  const pick = <T>(items: readonly T[]): T => items[int(items.length)];
  const chance = (p: number) => next() < p;
  return { next, int, pick, chance };
}

type Random = ReturnType<typeof createRandom>;

const pitches = "abcdefghijklm";
const shapes = ["", "", "", "", "v", "V", "s", "w", "o", "O", "r", "R", "r0", "vv", "ss", "o<", "o>"];
const liquescents = ["", "", "", "", "~", "<", ">"];
const markings = [
  "", "", "", "", "", ".", "..", ".0", ".1", "_", "_0", "_1", "_2", "_3", "_4", "_5", "__", "'", "'0", "'1",
  "r1", "r2", "r3", "r4", "r5", "|"
];
const instructions = ["[cs:t]", "[cs:md]", "[alt:x]", "[ob:1{]", "[ob:0}]", "[ub:1{]", "[ub:0}]", "[ocb:1{]", "[ocb:0}]", "[ocba:1{]", "[ocba:0}]", "[ob:1;4mm]"];
const separators = ["", "", "", "", "/", "//", " ", "!", "!/", "///"];
const dividers = [",", ";", ":", "::", "`", ";3", ",5", ",_", ";_", ":_", "`_"];
const clefs = ["c1", "c2", "c3", "c4", "f1", "f2", "f3", "f4", "cb3", "cb4", "treble2", "xp3"];
const syllables = [
  "Ky", "ri", "e", "lé", "i", "son", "Chri", "ste", "glo", "A", "men", "al", "le", "lú", "ia", "De", "us", "in",
  "ad", "ju", "tó", "ri", "um", "qui", "a", "cæ", "œ", "Sanc", "tus", "ae", "Ec", "ce", "ho", "mo"
];
const lyricDecorations = [
  (s: string) => s,
  (s: string) => s,
  (s: string) => s,
  (s: string) => s,
  (s: string) => `<i>${s}</i>`,
  (s: string) => `<b>${s}</b>`,
  (s: string) => `<sc>${s}</sc>`,
  (s: string) => `<c>${s}</c>`,
  (s: string) => `<e>${s}</e>`,
  (s: string) => `{${s}}`,
  (s: string) => `${s}-`,
  (s: string) => `${s}—`,
  (s: string) => `*${s}*`,
  (s: string) => `${s}|${s}`,
  (s: string) => `<alt>${s}</alt>${s}`,
  (s: string) => `${s}[${s} ${s}]`,
  (s: string) => `${s}[/]`,
  (s: string) => `<sp>'ae</sp>${s}`,
  (s: string) => `${s}<br>${s}`,
  (s: string) => `<v>\\greextra{Cross}</v>${s}`
];

function note(random: Random, clefNotes = pitches) {
  let pitch = random.pick(clefNotes.split(""));
  if (random.chance(0.12)) pitch = pitch.toUpperCase();
  let result = (random.chance(0.05) ? "-" : "") + pitch;
  if (random.chance(0.05)) result += random.pick(["0", "9"]);
  if (pitch === pitch.toLowerCase()) result += random.pick(shapes);
  result += random.pick(liquescents);
  if (random.chance(0.3)) result += random.pick(markings);
  if (random.chance(0.03)) result += random.pick(instructions);
  return result;
}

function notationGroup(random: Random) {
  if (random.chance(0.08)) {
    // an accidental before a note
    const pitch = random.pick("efghij".split(""));
    return `${pitch}${random.pick(["x", "y", "#", "X", "Y", "##"])}${pitch}`;
  }
  if (random.chance(0.03)) return `${random.pick(pitches.split(""))}+`;
  if (random.chance(0.03)) return `{${note(random)}${note(random)}}`;
  // a run of notes, staying close to the last one
  const count = 1 + random.int(random.chance(0.3) ? 6 : 3);
  let index = random.int(pitches.length);
  let result = "";
  for (let i = 0; i < count; i++) {
    index = Math.max(0, Math.min(pitches.length - 1, index + random.pick([-2, -1, -1, 0, 1, 1, 2, 3])));
    result += note(random, pitches[index]);
    if (i < count - 1) result += random.pick(separators);
  }
  return result;
}

function word(random: Random) {
  const syllableCount = 1 + random.int(4);
  let result = "";
  for (let i = 0; i < syllableCount; i++) {
    let text = random.pick(syllables);
    if (i === 0 && random.chance(0.3)) text = text[0].toUpperCase() + text.slice(1);
    text = random.pick(lyricDecorations)(text);
    if (random.chance(0.05)) text = "";
    const groups = random.chance(0.1) ? "" : notationGroup(random);
    result += `${text}(${groups})`;
  }
  return result;
}

/** returns a random gabc score, about wordCount words long */
export function randomGabc(random: Random, wordCount = 6 + random.int(30)) {
  const parts = [`(${random.pick(clefs)})`];
  for (let i = 0; i < wordCount; i++) {
    const roll = random.next();
    if (roll < 0.1) parts.push(random.pick(["*", "ij.", "†", "", "Ps."]) + `(${random.pick(dividers)})`);
    else if (roll < 0.13) parts.push(`(${random.pick(["z", "Z", "z0"])})`);
    else if (roll < 0.15) parts.push(`(${random.pick(clefs)})`);
    else if (roll < 0.18) parts.push(`${random.pick(syllables)}()`);
    else parts.push(word(random));
  }
  parts.push(random.chance(0.8) ? "(::)" : word(random));
  return parts.join(" ");
}
