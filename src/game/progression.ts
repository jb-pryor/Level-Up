// Cost of advancing from this level; growth slows after the introductory levels.
export const xpForNextLevel = (level: number) => level <= 5 ? 50 * level : 250 + 25 * (level - 5);
export function xpAtLevel(level: number): number {
  const n = Math.max(0, Math.floor(level) - 1);
  if (n <= 5) return 25 * n * (n + 1);
  const later = n - 5;
  return 750 + 275 * later + 12.5 * later * (later - 1);
}
export function levelFor(totalXp: number): number {
  const xp = Math.max(0, totalXp);
  let low = 1, high = Math.ceil(Math.sqrt(xp / 12.5)) + 10;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (xpAtLevel(middle) <= xp) low = middle;
    else high = middle - 1;
  }
  return low;
}
export const xpIntoLevel = (totalXp: number) => totalXp - xpAtLevel(levelFor(totalXp));
