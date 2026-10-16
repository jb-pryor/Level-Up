import type { Appearance, Outfit, Player } from '../types.ts';
import { starterOutfit } from '../types.ts';
import { quests } from '../data/quests.ts';
import { cosmetics } from '../data/cosmetics.ts';
import { levelFor } from './progression.ts';

export type Reward = { questName: string; xp: number; coins: number; previousXp: number; previousCoins: number };
export type GameState = { player: Player | null; notice: { sequence: number; message: string; error: boolean; reward?: Reward; purchaseItemId?: string } | null };
export type Action = {type:'clear-notice'|'open-wardrobe'|'reset-player'} | {type:'create';appearance:Appearance} | {type:'edit';appearance:Appearance} | {type:'add'|'complete'|'delete'|'favorite';questId:string} | {type:'reorder';questId:string;targetId:string;after:boolean} | {type:'buy';itemId:string} | {type:'equip';outfit:Outfit};
export const initialGame: GameState = {player:null,notice:null};
export function gameReducer(state: GameState, action: Action): GameState {
  if(action.type==='reset-player')return {...initialGame};
  if(action.type==='clear-notice')return {...state,notice:null};
  const feedback = (message: string, error=false, player=state.player, reward?: Reward): GameState => ({player,notice:{sequence:(state.notice?.sequence??0)+1,message,error,reward}});
  if(action.type==='create') {
    if(state.player)return feedback('Your player already exists.',true);
    if(!action.appearance.name.trim())return feedback('Enter a player name.',true);
    return feedback('Your adventure starts now.',false,{...action.appearance,name:action.appearance.name.trim(),totalXp:0,coins:0,activeQuestIds:[],ownedItemIds:[],newItemIds:[],questCompletions:{},favoriteQuestIds:[],equipped:{...starterOutfit}});
  }
  const p=state.player;if(!p)return state;
  if(action.type==='open-wardrobe')return {player:{...p,newItemIds:[]},notice:null};
  if(action.type==='reorder') {
    if(action.questId===action.targetId||!p.activeQuestIds.includes(action.questId)||!p.activeQuestIds.includes(action.targetId))return state;
    const order=p.activeQuestIds.filter(id=>id!==action.questId);
    order.splice(order.indexOf(action.targetId)+(action.after?1:0),0,action.questId);
    return {...state,player:{...p,activeQuestIds:order}};
  }
  if(action.type==='edit')return action.appearance.name.trim()?feedback('Character updated.',false,{...p,...action.appearance,name:action.appearance.name.trim()}):feedback('Enter a player name.',true);
  if(action.type==='add'||action.type==='delete'||action.type==='complete'||action.type==='favorite') {
    const quest=quests.find(q=>q.id===action.questId);if(!quest)return feedback('That quest is unavailable.',true);
    if(action.type==='favorite'&&!p.favoriteQuestIds.includes(quest.id)&&p.favoriteQuestIds.length>=4)return state;
    if(action.type==='favorite')return {...state,player:{...p,favoriteQuestIds:p.favoriteQuestIds.includes(quest.id)?p.favoriteQuestIds.filter(id=>id!==quest.id):[...p.favoriteQuestIds,quest.id]}};
    const active=p.activeQuestIds.includes(quest.id);
    if(action.type==='add')return active?feedback('Quest already in your daily quests!',true):feedback(`${quest.name} added.`,false,{...p,activeQuestIds:[...p.activeQuestIds,quest.id]});
    if(!active)return state;
    const remaining=p.activeQuestIds.filter(id=>id!==quest.id);
    if(action.type==='delete')return feedback('Quest removed. No rewards awarded.',false,{...p,activeQuestIds:remaining});
    const completions=(p.questCompletions[quest.id]??0)+1;
    if(!Number.isSafeInteger(completions))return feedback('Your skill progress could not be updated.',true);
    const totalXp=p.totalXp+quest.xp;
    const bonusCoins=(levelFor(totalXp)-levelFor(p.totalXp))*25;
    const coins=p.coins+quest.coins+bonusCoins;
    if(!Number.isSafeInteger(totalXp)||!Number.isSafeInteger(coins))return feedback('Your progress could not be updated.',true);
    const level=levelFor(totalXp),levelUp=level>levelFor(p.totalXp);
    return feedback(`+${quest.xp} XP · +${quest.coins} coins${levelUp?` · LEVEL UP! You're level ${level}.`:''}`,false,{...p,totalXp,coins,activeQuestIds:remaining,questCompletions:{...p.questCompletions,[quest.id]:completions}},{questName:quest.name,xp:quest.xp,coins:quest.coins,previousXp:p.totalXp,previousCoins:p.coins});
  }
  if(action.type==='buy') {
    const item=cosmetics.find(c=>c.id===action.itemId);if(!item)return feedback('That item is unavailable.',true);
    if(p.ownedItemIds.includes(item.id))return feedback('You already own this item.',true);
    if(levelFor(p.totalXp)<item.requiredLevel)return feedback(`Unlocks at level ${item.requiredLevel}.`,true);
    if(p.coins<item.price)return feedback('Not enough coins yet.',true);
    const result=feedback(`${item.name} added to your wardrobe.`,false,{...p,coins:p.coins-item.price,ownedItemIds:[...p.ownedItemIds,item.id],newItemIds:[...p.newItemIds,item.id]});
    return {...result,notice:{...result.notice!,purchaseItemId:item.id}};
  }
  if(action.type!=='equip')return state;
  for(const slot of ['shirt','pants','shoes','hat'] as const) {
    const id=action.outfit[slot];
    if((slot==='shirt'||slot==='pants')&&id==='starter')continue;
    if((slot==='shoes'||slot==='hat')&&id===null)continue;
    const item=cosmetics.find(c=>c.id===id&&c.slot===slot);
    if(!item||!p.ownedItemIds.includes(item.id))return feedback('Equip items you own in the matching clothing category.',true);
  }
  return feedback('Outfit equipped. Looking good!',false,{...p,equipped:{...action.outfit}});
}
