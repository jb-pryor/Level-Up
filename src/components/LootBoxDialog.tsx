import {useEffect,useRef,useState} from 'react';
import type {Player} from '../types';
import {cosmetics} from '../data/cosmetics';
import {rollLootBox,type LootRoll} from '../game/loot';
import {playSound,playLootSound} from '../game/soundEffects';
import {Modal} from './Modal';
import {ItemPicture} from './Wardrobe';
import {CoinIcon} from './CoinIcon';
export function LootChest(){return <svg className="loot-chest-icon" viewBox="0 0 64 56" aria-hidden="true"><path d="M8 8h48v8h6v32H2V16h6Z" fill="#ffc84a" stroke="#372092" strokeWidth="4"/><path d="M4 26h56M16 8v40M48 8v40" fill="none" stroke="#93602e" strokeWidth="4"/><path d="M26 22h12v16H26Z" fill="#fff19c" stroke="#372092" strokeWidth="3"/><path d="M30 26h4v8h-4Z" fill="#372092"/></svg>;}
export function LootBoxDialog({player,onOpen,onClaim,onClose}:{player:Player;onOpen:(roll:LootRoll)=>void;onClaim:(id:string,sell?:boolean,equip?:boolean)=>void;onClose:()=>void}){
 const [phase,setPhase]=useState<'ready'|'opening'|'reveal'>(player.lootReveal?'reveal':'ready');
 const [error,setError]=useState('');const opening=useRef(false);
 const reveal=player.lootReveal,item=cosmetics.find(c=>c.id===reveal?.itemId);
 useEffect(()=>{
  if(phase!=='opening')return;
  const timer=setTimeout(()=>{setPhase('reveal');opening.current=false;playSound('loot-reveal');},window.matchMedia('(prefers-reduced-motion: reduce)').matches?250:1300);
  return()=>clearTimeout(timer);
 },[phase]);
 const open=()=>{
  if(opening.current||player.lootBoxes<1||player.lootReveal)return;
  const roll=rollLootBox(player);if(!roll){setError('No clothing is available in the daily shop yet. Your box is safe.');return;}
  opening.current=true;setError('');void playLootSound();onOpen(roll);setPhase('opening');
 };
 const claim=(sell=false,equip=false)=>{
  if(!reveal)return;onClaim(reveal.id,sell,equip);setPhase('ready');
  if(sell)playSound('purchase');
 };
 return <Modal title={phase==='opening'?'Opening loot…':phase==='reveal'?'Your loot!':'Loot boxes'} onClose={onClose} className="loot-dialog">
  {phase==='opening'?<div className="loot-opening" role="status"><div className="loot-rays"/><div className="loot-opening-chest"><LootChest/></div><span className="loot-spark spark-one">✦</span><span className="loot-spark spark-two">✧</span><span className="loot-spark spark-three">✦</span><h3>Rolling your reward…</h3><p>A little mystery. A lot of wardrobe potential.</p></div>:phase==='reveal'&&reveal&&item?<div className="loot-reveal" data-rarity={item.rarity??'Common'}>
   <span className="loot-rarity">{item.rarity} {reveal.duplicate?'· Duplicate item':'· New clothing!'}</span>
   <div className="loot-item-picture"><ItemPicture appearance={player} slot={item.slot} item={item}/></div><h3>{item.name}</h3><p>{item.description}</p><p className="loot-item-bonuses">{[item.xpBoostPercent?`+${item.xpBoostPercent}% quest XP`:null,item.coinBoostPercent?`+${item.coinBoostPercent}% quest coins`:null].filter(Boolean).join(' · ')||'Cosmetic only · No boosts'}</p>
   <p className="loot-coins"><CoinIcon/> +{reveal.coins} coins</p>
   {reveal.duplicate?<><p className="loot-duplicate-note">Already in your wardrobe. Quicksell the extra for {reveal.sellPercent}% of its {reveal.itemValue}-coin value.</p><button className="primary" data-sound="loot" onClick={()=>claim(true)}>Quicksell · <CoinIcon/> +{reveal.sellCoins} coins</button></>:<div className="loot-reveal-actions"><button className="primary" onClick={()=>claim(false,true)}>Equip & collect ✓</button><button className="quiet-button" onClick={()=>claim()}>Keep in wardrobe</button></div>}
   <p className="muted loot-saved-note">Rewards are saved. Closing keeps this reveal for later.</p>
  </div>:<div className="loot-ready"><LootChest/><h3>{player.lootBoxes?`${player.lootBoxes} loot ${player.lootBoxes===1?'box':'boxes'} waiting`:'Your next level brings another box'}</h3><p>One random daily-shop item + 15–35 coins. All eligible items have an equal chance. Duplicates can be quicksold.</p>{error&&<p role="alert">{error}</p>}<button className="primary" disabled={player.lootBoxes<1} data-sound="loot" onClick={open}>Open a loot box ✦</button></div>}
 </Modal>;
}
