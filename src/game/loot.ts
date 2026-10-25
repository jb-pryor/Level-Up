import {cosmetics} from '../data/cosmetics.ts';
import type {Player} from '../types.ts';
export const lootCoinRewards=[15,20,25,30,35] as const;
export type LootRoll={id:string;itemId:string;coins:number;sellPercent:number};
export type LootReveal=LootRoll&{duplicate:boolean;sellCoins:number;itemValue:number};
export const lootPool=(gender:Player['gender'])=>cosmetics.filter(c=>c.shop==='daily'&&(!c.maleOnly||gender==='male'));
export function rollLootBox(player:Player,random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296):LootRoll|null {
  const pool=lootPool(player.gender);if(!pool.length)return null;
  return {id:crypto.randomUUID(),itemId:pool[Math.floor(random()*pool.length)].id,coins:lootCoinRewards[Math.floor(random()*lootCoinRewards.length)],sellPercent:50+Math.floor(random()*26)};
}
export function validLootRoll(value:unknown):value is LootRoll & Record<string,unknown> {
  if(!value||typeof value!=='object')return false;
  const v=value as LootRoll;
  return typeof v.id==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(v.id)&&cosmetics.some(c=>c.id===v.itemId)&&lootCoinRewards.includes(v.coins as typeof lootCoinRewards[number])&&Number.isInteger(v.sellPercent)&&v.sellPercent>=50&&v.sellPercent<=75;
}
