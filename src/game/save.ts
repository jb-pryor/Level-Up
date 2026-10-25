import {validLootRoll} from './loot.ts';
import type { Player } from '../types.ts';
import { quests } from '../data/quests.ts';
import { cosmetics } from '../data/cosmetics.ts';
export const SAVE_KEY='level-up:save:v1';
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
export type LoadResult={status:'empty'|'ready';player:Player|null}|{status:'invalid'|'unavailable';player:null};
const record=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const oneOf=(v:unknown,choices:string[])=>typeof v==='string'&&choices.includes(v);
const ids=(v:unknown,allowed:string[]):v is string[]=>Array.isArray(v)&&v.every(id=>oneOf(id,allowed))&&new Set(v).size===v.length;
export function validPlayer(v:unknown):v is Player {
  if(!record(v)||typeof v.name!=='string'||!v.name.trim()||!oneOf(v.gender,['male','female'])||v.bodyId!==(v.gender==='male'?'base-a':'base-b'))return false;
  if(!oneOf(v.complexionId,['1','2','3']))return false;
  if(!oneOf(v.hairStyleId,['short-swept','short-curly','afro','long','long-waves','bald'])||!oneOf(v.hairColorId,['brown','black','blonde','gray'])||!oneOf(v.eyeColorId,['brown','blue','green','gray','red'])||!oneOf(v.expressionId,['smile','neutral']))return false;
  if(!Number.isSafeInteger(v.lootBoxes)||Number(v.lootBoxes)<0)return false;
  if(v.lootReveal!==null){
    const reveal=v.lootReveal;
    if(!record(reveal)||!validLootRoll(reveal)||typeof reveal.duplicate!=='boolean'||!Number.isSafeInteger(reveal.sellCoins)||Number(reveal.sellCoins)<0)return false;
    if(!Array.isArray(v.ownedItemIds)||!v.ownedItemIds.includes(reveal.itemId))return false;
    if(!Number.isSafeInteger(reveal.itemValue)||Number(reveal.itemValue)<0)return false;
    if(reveal.sellCoins!==Math.ceil(Number(reveal.itemValue)*reveal.sellPercent/100))return false;
  }
  if(![v.totalXp,v.coins].every(n=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0))return false;
  if(!ids(v.activeQuestIds,quests.map(q=>q.id))||!ids(v.ownedItemIds,cosmetics.map(c=>c.id))||!ids(v.newItemIds,v.ownedItemIds)||!record(v.equipped))return false;
  if(!ids(v.favoriteQuestIds,quests.map(q=>q.id)))return false;
  if(!record(v.questCooldowns)||!Object.entries(v.questCooldowns).every(([id,end])=>quests.some(q=>q.id===id&&q.category==='home')&&typeof end==='number'&&Number.isSafeInteger(end)&&end>=0))return false;
  if(!record(v.questCompletions)||!Object.entries(v.questCompletions).every(([id,count])=>quests.some(q=>q.id===id)&&typeof count==='number'&&Number.isSafeInteger(count)&&count>=0))return false;
  for(const slot of ['shirt','pants','hat','shoes'] as const){
    const id=v.equipped[slot];
    if((slot==='shirt'||slot==='pants')&&id==='starter')continue;
    if((slot==='hat'||slot==='shoes')&&id===null)continue;
    if(typeof id!=='string'||!v.ownedItemIds.includes(id)||!cosmetics.some(c=>c.id===id&&c.slot===slot&&(!c.maleOnly||v.gender==='male')))return false;
  }
  return true;
}
export function loadPlayer(storage:StoragePort):LoadResult {
  let raw:string|null;
  try{raw=storage.getItem(SAVE_KEY)}catch{return {status:'unavailable',player:null}}
  if(raw===null)return {status:'empty',player:null};
  try{
    const data:unknown=JSON.parse(raw);
    if(!record(data)||data.schemaVersion!==1||!record(data.player))return {status:'invalid',player:null};
    // Older saves have no completion history; preserve progress without inventing counts.
    const player={...data.player,lootBoxes:data.player.lootBoxes===undefined?0:data.player.lootBoxes,lootReveal:data.player.lootReveal===undefined?null:data.player.lootReveal,complexionId:data.player.complexionId===undefined||data.player.complexionId==='4'?'1':data.player.complexionId,questCooldowns:data.player.questCooldowns===undefined?{}:data.player.questCooldowns,favoriteQuestIds:data.player.favoriteQuestIds===undefined?[]:data.player.favoriteQuestIds,questCompletions:data.player.questCompletions===undefined?{}:data.player.questCompletions};
    if(!validPlayer(player))return {status:'invalid',player:null};
    // Keep the earliest two favorites after the household layout reduces the cap.
    return {status:'ready',player:{...player,favoriteQuestIds:player.favoriteQuestIds.slice(0,2)}};
  }catch{return {status:'invalid',player:null}}
}
export function savePlayer(storage:StoragePort,player:Player):boolean {
  if(!validPlayer(player))return false;
  try{storage.setItem(SAVE_KEY,JSON.stringify({schemaVersion:1,player}));return true}catch{return false}
}
export function loadBrowserPlayer():LoadResult {
  try{return loadPlayer(window.localStorage)}catch{return {status:'unavailable',player:null}}
}
export function saveBrowserPlayer(player:Player):boolean {
  try{return savePlayer(window.localStorage,player)}catch{return false}
}

export function deletePlayerSave(storage:Pick<Storage,'removeItem'>):boolean {
  try{storage.removeItem(SAVE_KEY);return true}catch{return false}
}
export function deleteBrowserPlayerSave():boolean {
  try{return deletePlayerSave(window.localStorage)}catch{return false}
}
