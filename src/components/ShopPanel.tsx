import { useState } from 'react';
import type { Player } from '../types';
import { Shop } from './Shop';
import { levelFor } from '../game/progression';
import { useNow } from '../game/useNow';
import { DAILY_SHOP_UNLOCK_LEVEL, dailyShopCountdown, dailyShopResetAt } from '../game/dailyShop';

export function ShopPanel({player,onBuy,feedback}:{player:Player;onBuy:(id:string)=>void;feedback?:string}){
  const [daily,setDaily]=useState(false);
  const unlocked=levelFor(player.totalXp)>=DAILY_SHOP_UNLOCK_LEVEL;
  const showingDaily=daily&&unlocked;
  return <section className={`quest-card inline-shop shop-panel${showingDaily?' daily-shop-panel':''}`} aria-label={showingDaily?'Daily shop':'Basic shop'}>
    <div className="inline-panel-heading"><h2>{showingDaily?'Daily shop':'Your next upgrade'}</h2><button className="quiet-button shop-mode-toggle" disabled={!unlocked} title={!unlocked?'Daily shop unlocks at level 3':undefined} onClick={()=>setDaily(value=>!value)}>{!unlocked&&<svg viewBox="0 0 20 22" aria-hidden="true"><path d="M5 9V6a5 5 0 0 1 10 0v3M3 9h14v11H3zM10 13v3" fill="none" stroke="currentColor" strokeWidth="2"/></svg>}{showingDaily?'Basic shop':'Daily shop'}{!unlocked&&<span className="daily-shop-lock-level">Level 3</span>}</button></div>
    <div className="shop-view-content" hidden={showingDaily}><Shop player={player} onBuy={onBuy} feedback={feedback}/></div>
    {showingDaily&&<DailyShop/>}
  </section>;
}
function DailyShop(){
  const now=useNow();
  const resetAt=dailyShopResetAt(now);
  return <div className="daily-shop-content shop-view-content">
    <p className="daily-shop-timer"><span>Next refresh in</span> <time dateTime={new Date(resetAt).toISOString()} aria-label={`Next daily shop refresh in ${dailyShopCountdown(now)}`}>{dailyShopCountdown(now)}</time></p>
    <div className="daily-shop-empty" aria-label="Daily shop inventory"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 13h24v15H4zM2 13l4-9h20l4 9M12 28v-9h8v9M2 13c0 5 7 5 7 0 0 5 7 5 7 0 0 5 7 5 7 0 0 5 7 5 7 0" fill="none" stroke="currentColor" strokeWidth="2"/></svg><h3>New stock coming soon</h3><p>The shelves are empty. Even the shopkeeper is pretending to look busy.</p></div>
  </div>;
}
