import {cosmetics} from '../data/cosmetics.ts';
import type {Player} from '../types.ts';
export const lootCoinRewards=[15,20,25,30,35] as const;
export type LootRoll={id:string;itemId:string;coins:number;sellPercent:number};
export type LootReveal=LootRoll&{duplicate:boolean;sellCoins:number;itemValue:number};
export const lootPool=(gender:Player['gender'])=>cosmetics.filter(c=>!c.archived&&c.shop==='daily'&&(!c.maleOnly||gender==='male'));
// Current Daily Shop tiers total 100: Rare 60%, Epic 25%, Legendary 15%.
// If Common stock is added, its weight participates and available tiers normalize.
export const lootRarityWeights={Common:10,Rare:60,Epic:25,Legendary:15} as const;
export function rollLootBox(player:Player,random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296):LootRoll|null {
  const pool=lootPool(player.gender);if(!pool.length)return null;
  const tiers=Object.entries(lootRarityWeights).map(([rarity,weight])=>({weight,items:pool.filter(item=>(item.rarity??'Common')===rarity)})).filter(tier=>tier.items.length);
  let target=random()*tiers.reduce((sum,tier)=>sum+tier.weight,0);
  let item=pool[0];
  for(const tier of tiers){
    if(target<tier.weight){item=tier.items[Math.floor(target/tier.weight*tier.items.length)];break;}
    target-=tier.weight;
  }
  return {id:crypto.randomUUID(),itemId:item.id,coins:lootCoinRewards[Math.floor(random()*lootCoinRewards.length)],sellPercent:50+Math.floor(random()*26)};
}
export function validLootRoll(value:unknown):value is LootRoll & Record<string,unknown> {
  if(!value||typeof value!=='object')return false;
  const v=value as LootRoll;
  return typeof v.id==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(v.id)&&cosmetics.some(c=>c.id===v.itemId)&&lootCoinRewards.includes(v.coins as typeof lootCoinRewards[number])&&Number.isInteger(v.sellPercent)&&v.sellPercent>=50&&v.sellPercent<=75;
}
