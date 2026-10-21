export function foldSpanish(input: string) {
  return input
    .toLowerCase()
    .replace(/ñ/g, "n")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:'"“”«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = row[j] ?? 0;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min((row[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, prev + cost);
      prev = temp;
    }
  }
  return row[b.length] ?? 0;
}

export function scorePhrase(target: string, heard: string) {
  const a = foldSpanish(target);
  const b = foldSpanish(heard);
  if (!b) return 0;
  if (a === b) return 100;
  const longest = Math.max(a.length, b.length);
  const raw = Math.round((1 - distance(a, b) / longest) * 100);
  const score = Math.max(0, Math.min(100, raw));
  const contains = b.includes(a) || a.includes(b);
  if (contains) {
    const ratio = Math.min(a.length, b.length) / longest;
    if (ratio > 0.72) return Math.max(score, 92);
  }
  return score;
}

export function scoreNote(score: number) {
  if (score >= 90) return "That landed. Say it once more, a little slower, just to keep it.";
  if (score >= 75) return "Close. Listen again and match the stressed syllable.";
  if (score >= 50) return "The shape is there. Hear it, then try the whole phrase in one breath.";
  return "I heard something different. Play it, then stay a little closer to the mic.";
}
