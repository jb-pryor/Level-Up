import type { LootReveal } from './game/loot';
import type { PantsId } from './data/newPants';
import type { ShoeId } from './data/maleShoes';
import type { ShirtId } from './data/maleShirts';
export type BodyId = 'base-a' | 'base-b';
export type Appearance = {
  name: string;
  gender: 'male' | 'female';
  bodyId: BodyId;
  complexionId: '1' | '2' | '3';
  hairStyleId: 'short-swept' | 'short-curly' | 'afro' | 'long' | 'long-waves' | 'bald';
  hairColorId: 'brown' | 'black' | 'blonde' | 'gray';
  eyeColorId: 'brown' | 'blue' | 'green' | 'gray' | 'red';
  expressionId: 'smile' | 'neutral';
};
export type Outfit = { shirt: ShirtId; pants: PantsId; shoes: null | ShoeId; hat: null | 'cap' };
export const starterOutfit: Outfit = { shirt: 'starter', pants: 'starter', shoes: null, hat: null };
export const defaultAppearance: Appearance = { name: '', gender: 'male', bodyId: 'base-a', complexionId: '1', hairStyleId: 'short-swept', hairColorId: 'brown', eyeColorId: 'brown', expressionId: 'smile' };

export type Player = Appearance & { lootBoxes:number; lootReveal:LootReveal|null; totalXp: number; coins: number; activeQuestIds: string[]; ownedItemIds: string[]; newItemIds: string[]; questCompletions: Record<string, number>; questCooldowns: Record<string, number>; favoriteQuestIds: string[]; equipped: Outfit };
export type Category = 'home' | 'health' | 'social' | 'education' | 'exploration';
export type Quest = { id: string; name: string; category: Category; xp: number; coins: number; archived?: boolean };
export type Cosmetic = { id: string; name: string; description: string; slot: keyof Outfit; price: number; requiredLevel: number; maleOnly?: boolean; shop?: 'basic'|'daily'; rarity?: 'Common'|'Rare'|'Epic'|'Legendary'; xpBoostPercent?: number; coinBoostPercent?: number };
