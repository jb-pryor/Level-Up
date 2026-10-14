export type BodyId = 'base-a' | 'base-b';
export type Appearance = {
  name: string;
  gender: 'male' | 'female';
  bodyId: BodyId;
  hairStyleId: 'short-swept' | 'long';
  hairColorId: 'brown' | 'black' | 'blonde';
  eyeColorId: 'brown' | 'blue' | 'green';
  expressionId: 'smile' | 'neutral';
};
export type Outfit = { shirt: 'starter' | 'green-shirt' | 'blue-shirt'; pants: 'starter' | 'dark-pants' | 'olive-pants'; shoes: null | 'sneakers'; hat: null | 'cap' };
export const starterOutfit: Outfit = { shirt: 'starter', pants: 'starter', shoes: null, hat: null };
export const defaultAppearance: Appearance = { name: '', gender: 'male', bodyId: 'base-a', hairStyleId: 'short-swept', hairColorId: 'brown', eyeColorId: 'brown', expressionId: 'smile' };

export type Player = Appearance & { totalXp: number; coins: number; activeQuestIds: string[]; ownedItemIds: string[]; newItemIds: string[]; equipped: Outfit };
export type Category = 'home' | 'health' | 'social';
export type Quest = { id: string; name: string; category: Category; xp: number; coins: number };
export type Cosmetic = { id: string; name: string; description: string; slot: keyof Outfit; price: number; requiredLevel: number };
