import type { Player, Quest } from '../types.ts';
import { cosmetics } from '../data/cosmetics.ts';
// Integer percentages avoid floating-point errors (e.g. 100 * 1.05).
export function questReward(player: Player, quest: Pick<Quest,'xp'|'coins'>) {
  const equipped=cosmetics.filter(item=>player.ownedItemIds.includes(item.id)&&player.equipped[item.slot]===item.id&&(!item.maleOnly||player.gender==='male'));
  const xpBoost=equipped.reduce((sum,item)=>sum+(item.xpBoostPercent??0),0);
  const coinBoost=equipped.reduce((sum,item)=>sum+(item.coinBoostPercent??0),0);
  return {xp:Math.ceil(quest.xp*(100+xpBoost)/100),coins:Math.ceil(quest.coins*(100+coinBoost)/100)};
}
