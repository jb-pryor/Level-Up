import type { Player } from '../types.ts';
import { validPlayer, loadPlayer, SAVE_KEY } from './save.ts';
export const GUEST_SAVE_KEY='level-up:guest-save:v1';
export const LEGACY_OWNER_KEY='level-up:legacy-owner:v1';
export const accountCacheKey=(id:string)=>`level-up:account-save:v1:${id}`;
export type AccountCache={userId:string;revision:number;player:Player|null;dirty:boolean;mutationId:string};
export type CloudSave={schema_version:number;revision:number;player:unknown;mutation_id:string};
export function readCache(raw:string|null,id:string):AccountCache|null {
  if(!raw)return null;
  const c=JSON.parse(raw) as AccountCache;
  if(c&&c.player!==null&&c.player!==undefined){
    const migrated=loadPlayer({getItem:()=>JSON.stringify({schemaVersion:1,player:c.player}),setItem:()=>{}});
    if(migrated.status==='ready')c.player=migrated.player;
  }
  if(!c||c.userId!==id||!Number.isSafeInteger(c.revision)||c.revision<0||typeof c.dirty!=='boolean'||typeof c.mutationId!=='string'||(c.player!==null&&!validPlayer(c.player)))throw new Error('Your account backup could not be read. It has been preserved.');
  return c;
}
export function cloudPlayer(row:CloudSave):Player|null {
  if(row.schema_version!==1||!Number.isSafeInteger(row.revision)||row.revision<1)throw new Error('This cloud save version is not supported.');
  if(row.player===null)return null;
  // Apply the same backwards-compatible migrations as local saves.
  const result=loadPlayer({getItem:()=>JSON.stringify({schemaVersion:1,player:row.player}),setItem:()=>{}});
  if(result.status!=='ready'||!result.player)throw new Error('Your cloud player could not be read. It has been left untouched.');
  return result.player;
}
export function reconcileCache(cache:AccountCache|null,row:CloudSave|null):'cloud'|'pending'|'conflict' {
  if(!cache?.dirty)return 'cloud';
  if(row?.mutation_id===cache.mutationId)return 'cloud';
  return cache.revision===(row?.revision??0)?'pending':'conflict';
}
export function guestLoad(storage:Pick<Storage,'getItem'|'setItem'>){
  const raw=storage.getItem(GUEST_SAVE_KEY);
  if(raw!==null)return loadPlayer({getItem:()=>raw,setItem:()=>{}});
  if(storage.getItem(LEGACY_OWNER_KEY))return {status:'empty' as const,player:null};
  return loadPlayer(storage);
}
export function unclaimedPlayer(storage:Pick<Storage,'getItem'|'setItem'>){return guestLoad(storage).player;}
export function saveGuest(storage:Pick<Storage,'getItem'|'setItem'>,player:Player){
  if(!validPlayer(player))return false;
  try{storage.setItem(GUEST_SAVE_KEY,JSON.stringify({schemaVersion:1,player}));return true;}catch{return false;}
}
export function clearGuest(storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>){
  try{storage.removeItem(GUEST_SAVE_KEY);if(!storage.getItem(LEGACY_OWNER_KEY))storage.removeItem(SAVE_KEY);return true;}catch{return false;}
}
export {SAVE_KEY};
