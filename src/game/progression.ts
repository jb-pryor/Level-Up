export const levelFor = (totalXp: number) => 1 + Math.floor(totalXp / 100);
export const xpIntoLevel = (totalXp: number) => totalXp % 100;
