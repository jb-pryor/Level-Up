import { useEffect, useRef, useState } from 'react';
import { animatedXp } from './rewardAnimation';
export function useAnimatedNumber(target: number, xp=false, paused=false) {
  const [shown,setShown]=useState(target),current=useRef(target);
  useEffect(()=>{
    if(paused)return;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    if(media.matches||target===current.current){current.current=target;setShown(target);return;}
    const from=current.current,start=performance.now(),duration=xp?950:650;
    let frame=0;
    const tick=(now:number)=>{
      const p=Math.max(0,Math.min(1,(now-start-100)/duration));
      const value=xp?animatedXp(from,target,p):from+(target-from)*(1-(1-p)**3);
      current.current=value;setShown(value);
      if(p<1)frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[target,xp,paused]);
  return shown;
}
