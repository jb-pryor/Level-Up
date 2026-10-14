import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { playSound } from '../game/soundEffects';

export function LevelUpCelebration({ level }: { level: number }) {
  const previous=useRef(level);
  const [celebration,setCelebration]=useState<{level:number;id:number;reduced:boolean}|null>(null);
  useEffect(()=>{
    const advanced=level>previous.current;
    previous.current=level;
    if(!advanced)return;
    playSound('level');
    setCelebration({level,id:Date.now(),reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches});
    const timer=setTimeout(()=>setCelebration(null),2400);
    return()=>clearTimeout(timer);
  },[level]);
  if(!celebration)return null;
  return <div className={`level-up-celebration ${celebration.reduced?'reduced-motion':''}`} key={celebration.id}>
    <div className="level-up-visuals" aria-hidden="true"><div className="level-up-aura"/><div className="level-up-ring ring-one"/><div className="level-up-ring ring-two"/>
      {Array.from({length:18},(_,i)=>{
        const angle=i*Math.PI*2/18;
        const coordinates:Record<string,string>={};
        for(let q=0;q<4;q++){const a=angle+q*Math.PI/2;coordinates[`--orbit-x${q}`]=`${50+41*Math.cos(a)}%`;coordinates[`--orbit-y${q}`]=`${50+41*Math.sin(a)}%`;}
        return <span key={i} className={`level-up-spark ${i%3===0?'star':''}`} style={{...coordinates,animationDelay:`${-(i%6)*80}ms`} as CSSProperties}>{i%3===0?'✦':''}</span>;
      })}
      <span className="level-up-xp xp-left">✦ XP</span><span className="level-up-xp xp-right">XP ✦</span>
    </div>
    <div className="level-up-banner" role="status"><span>LEVEL UP!</span><strong>LEVEL {celebration.level}</strong><small>Slightly less NPC. Nicely done.</small></div>
  </div>;
}
