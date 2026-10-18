import type { Player, Quest } from '../types.ts';
export const HOME_COOLDOWN_MS=12*60*60*1000;
export function cooldownRemaining(player:Player,quest:Quest,now:number){
  return quest.category==='home'?Math.max(0,(player.questCooldowns[quest.id]??0)-now):0;
}
export function formatCooldown(ms:number){
  const seconds=Math.max(0,Math.ceil(ms/1000));
  return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
}
