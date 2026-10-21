import { CoinIcon } from './CoinIcon';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { playSound } from '../game/soundEffects';
import { Modal } from './Modal';

export function LevelUpCelebration({ level, deferred=false, onAcknowledge }: { level: number; deferred?:boolean; onAcknowledge?:()=>void }) {
  const previous=useRef(level);
  const [celebration,setCelebration]=useState<{level:number;id:number;reduced:boolean}|null>(null);
  const [advancement,setAdvancement]=useState<{level:number;coins:number}|null>(null);
  useEffect(()=>{
    // Leave the previous level unconsumed until the quest popup is dismissed.
    if(deferred)return;
    const advanced=level>previous.current;
    const levelsGained=level-previous.current;
    previous.current=level;
    if(!advanced)return;
    playSound('level');
    setAdvancement({level,coins:levelsGained*25});
    setCelebration({level,id:Date.now(),reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches});
  },[level,deferred]);
  useEffect(()=>{
    if(!celebration)return;
    const timer=setTimeout(()=>setCelebration(null),2400);
    return()=>clearTimeout(timer);
  },[celebration?.id]);
  const acknowledge=()=>{setAdvancement(null);onAcknowledge?.();};
  if(!celebration&&!advancement)return null;
  return <>{advancement&&<Modal title="Level up!" className="level-advancement-dialog" onClose={acknowledge}><div className="level-up-banner level-up-banner-expanded"><span>LEVEL UP!</span><strong>LEVEL {advancement.level}</strong><small>Slightly less NPC. Nicely done.</small><p className="level-bonus"><CoinIcon/> +{advancement.coins} GOLD COINS</p><button className="primary" onClick={acknowledge}>Close</button></div></Modal>}{celebration&&<div className={`level-up-celebration ${celebration.reduced?'reduced-motion':''}`} key={celebration.id}>
    <div className="level-up-visuals" aria-hidden="true"><div className="level-up-aura"/><div className="level-up-ring ring-one"/><div className="level-up-ring ring-two"/>
      {Array.from({length:18},(_,i)=>{
        const angle=i*Math.PI*2/18;
        const coordinates:Record<string,string>={};
        for(let q=0;q<4;q++){const a=angle+q*Math.PI/2;coordinates[`--orbit-x${q}`]=`${50+41*Math.cos(a)}%`;coordinates[`--orbit-y${q}`]=`${50+41*Math.sin(a)}%`;}
        return <span key={i} className={`level-up-spark ${i%3===0?'star':''}`} style={{...coordinates,animationDelay:`${-(i%6)*80}ms`} as CSSProperties}>{i%3===0?'✦':''}</span>;
      })}
      <span className="level-up-xp xp-left">✦ XP</span><span className="level-up-xp xp-right">XP ✦</span>
    </div>
  </div>}</>;
}
