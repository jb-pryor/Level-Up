import { CoinIcon } from './CoinIcon';
import { useState } from 'react';
import type { Outfit, Player } from '../types';
import { cosmetics } from '../data/cosmetics';
import { levelFor } from '../game/progression';
import { ItemPicture } from './Wardrobe';
const categories: {slot:keyof Outfit;label:string}[] = [{slot:'shirt',label:'Shirts'},{slot:'pants',label:'Pants'},{slot:'hat',label:'Hats'},{slot:'shoes',label:'Shoes'}];
export function Shop({player,onBuy,feedback,daily=false}:{daily?:boolean;player:Player;onBuy:(id:string)=>void;feedback?:string}) {
  const [category,setCategory]=useState<keyof Outfit>('shirt');
  const level=levelFor(player.totalXp);
  return <>{!daily&&<div className="shop-intro"><p className="muted">New looks unlock as you level up.</p></div>}
    {!daily&&<div className="wardrobe-tabs shop-tabs" role="tablist" aria-label="Shop categories">{categories.map(({slot,label},index)=><button key={slot} type="button" role="tab" id={`shop-tab-${slot}`} aria-controls="shop-items" aria-selected={category===slot} tabIndex={category===slot?0:-1} onClick={()=>setCategory(slot)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=categories[(index+(e.key==='ArrowRight'?1:3))%4].slot;setCategory(next);document.getElementById(`shop-tab-${next}`)?.focus()}}}>{label}</button>)}</div>}
    <p className="shop-inline-feedback" role="status">{feedback}</p>
    <div className="shop-grid" id={daily?'daily-shop-items':'shop-items'} role={daily?'region':'tabpanel'} aria-label={daily?'Daily shop inventory':undefined} aria-labelledby={daily?undefined:`shop-tab-${category}`}>{cosmetics.filter(item=>(daily?item.shop==='daily':item.shop!=='daily'&&item.slot===category)).map(item=>{
      const owned=player.ownedItemIds.includes(item.id),locked=level<item.requiredLevel,poor=player.coins<item.price,wrongBody=!!item.maleOnly&&player.gender!=='male';
      if(locked)return <article className="shop-item shop-item-locked" key={item.id} aria-label={`Locked item. Unlocks at level ${item.requiredLevel}.`}><div className="shop-picture mystery-picture" aria-hidden="true"><span className="mystery-mark">?</span><svg className="mystery-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="10" width="14" height="11"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/></svg></div><div className="shop-item-info"><h3>Locked item</h3><p>Keep completing quests to reveal this reward.</p><button disabled>Unlocks at level {item.requiredLevel}</button></div></article>;
      return <article className="shop-item" data-rarity={item.rarity??'Uncommon'} key={item.id}><div className="shop-picture"><ItemPicture appearance={wrongBody?{...player,gender:'male',bodyId:'base-a'}:player} slot={item.slot} item={item}/></div><div className="shop-item-info"><h3>{item.name}</h3><p>{item.description}</p><p className="item-bonuses"><strong>{item.rarity??'Uncommon'}{item.xpBoostPercent||item.coinBoostPercent?' · ':''}</strong>{[item.xpBoostPercent?`+${item.xpBoostPercent}% quest XP`:null,item.coinBoostPercent?`+${item.coinBoostPercent}% quest coins`:null].filter(Boolean).join(' · ')}{(item.xpBoostPercent||item.coinBoostPercent)?' while equipped':null}</p><div className="shop-price"><span><CoinIcon/> {item.price}</span><span>LEVEL {item.requiredLevel}</span></div><button className={owned?'quiet-button':'primary'} disabled={owned||poor||wrongBody} data-sound="purchase" onClick={()=>onBuy(item.id)}>{wrongBody?'Male fit only':owned?'Owned ✓':poor?'Not enough coins':<>Buy · <CoinIcon/> {item.price} coins</>}</button></div></article>;
    })}</div></>;
}
