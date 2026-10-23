export const referenceShirtIds = ['tie-dye-tee', 'neon-trip-tee', 'pixel-knit-sweater', 'cream-cable-sweater', 'olive-stripe-sweater', 'plaid-flannel', 'scarlet-sweatshirt'] as const;
export type ReferenceShirtId = typeof referenceShirtIds[number];

export function referenceShirtPath(id: string, gender: 'male' | 'female') {
  return referenceShirtIds.includes(id as ReferenceShirtId)
    ? `/avatars/shirts/reference-collection/${gender}-${id}.png`
    : null;
}
