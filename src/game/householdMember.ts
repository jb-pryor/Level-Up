import type { Appearance, Outfit } from '../types.ts';
import { starterOutfit } from '../types.ts';
import { cosmetics } from '../data/cosmetics.ts';
export function sharedOutfit(value:unknown,gender:Appearance['gender']):Outfit {
  const raw=value&&typeof value==='object'?value as Record<string,unknown>:{};
  const outfit={...starterOutfit};
  for(const slot of ['shirt','pants','hat','shoes'] as const){
    const id=raw[slot];
    if(cosmetics.some(c=>c.id===id&&c.slot===slot&&(!c.maleOnly||gender==='male')))(outfit as Record<string,unknown>)[slot]=id;
  }
  return outfit;
}
export function sharedProgress(avatar:unknown):number|null {
  const raw=avatar&&typeof avatar==='object'?avatar as Record<string,unknown>:{};
  return Number.isSafeInteger(raw.totalXp)&&Number(raw.totalXp)>=0?Number(raw.totalXp):null;
}
export function memberPresence(updatedAt:string|undefined,now:number){
  const time=updatedAt?Date.parse(updatedAt):NaN;
  if(!Number.isFinite(time))return {active:false,label:'Last seen unavailable'};
  const elapsed=Math.max(0,now-time);
  if(elapsed<120000)return {active:true,label:'Active'};
  const minutes=Math.floor(elapsed/60000);
  if(minutes<60)return {active:false,label:`Active ${minutes} min ago`};
  const hours=Math.floor(minutes/60);
  if(hours<24)return {active:false,label:`Active ${hours} ${hours===1?'hour':'hours'} ago`};
  const days=Math.floor(hours/24);
  return {active:false,label:`Active ${days} ${days===1?'day':'days'} ago`};
}
