import { useEffect, useState, type CSSProperties, type RefObject } from 'react';
import type { GameState, Reward } from '../game/gameReducer';
import { Modal } from './Modal';
import { playSound } from '../game/soundEffects';
import { quests } from '../data/quests';
import { questHumor } from '../data/questHumor';
type Point={x:number;y:number};
type Effect={id:number;reward:Reward;start:Point;xp:Point;coins:Point;reduced:boolean;levelUp:boolean;phase:'pending'|'flight'};
export function RewardEffects({notice,source,xpTarget,coinTarget,onRelease}:{notice:GameState['notice'];source:RefObject<Point|null>;xpTarget:RefObject<HTMLDivElement|null>;coinTarget:RefObject<HTMLDivElement|null>;onRelease:(sequence:number)=>void}) {
  const [effect,setEffect]=useState<Effect|null>(null);
  useEffect(()=>{
    if(!notice?.reward){setEffect(null);return;}
    const xp=xpTarget.current?.getBoundingClientRect(),wallet=coinTarget.current?.getBoundingClientRect();
    if(!xp||!wallet)return;
    const reward=notice.reward;
    playSound('quest');
    setEffect({id:notice.sequence,reward,start:source.current??{x:window.innerWidth/2,y:window.innerHeight/2},xp:{x:xp.left+xp.width*.5,y:xp.top+xp.height/2},coins:{x:wallet.left+wallet.width/2,y:wallet.top+wallet.height/2},reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches,levelUp:Math.floor((reward.previousXp+reward.xp)/100)>Math.floor(reward.previousXp/100),phase:'pending'});
  },[notice?.sequence]);
  useEffect(()=>{
    if(effect?.phase!=='flight')return;
    const bar=xpTarget.current,wallet=coinTarget.current;
    if(!effect.reduced){bar?.classList.add('reward-receiving');wallet?.classList.add('reward-receiving');}
    const timer=setTimeout(()=>setEffect(null),1400);
    return()=>{clearTimeout(timer);bar?.classList.remove('reward-receiving');wallet?.classList.remove('reward-receiving')};
  },[effect?.id,effect?.phase]);
  if(!effect)return null;
  const release=()=>{
    playSound('transfer');
    const xp=xpTarget.current?.getBoundingClientRect(),wallet=coinTarget.current?.getBoundingClientRect();
    setEffect({...effect,phase:'flight',start:{x:window.innerWidth/2,y:window.innerHeight/2},xp:xp?{x:xp.left+xp.width*.5,y:xp.top+xp.height/2}:effect.xp,coins:wallet?{x:wallet.left+wallet.width/2,y:wallet.top+wallet.height/2}:effect.coins});
    onRelease(effect.id);
  };
  if(effect.phase==='pending')return <Modal title="Quest completed!" onClose={release} className="reward-dialog"><div className="reward-summary"><span className="completion-mark" aria-hidden="true">✓</span><div><span className="eyebrow">LOOK WHO DID A THING</span><h3>Quest: {effect.reward.questName}, completed!</h3><p className="quest-completion-roast">{questHumor[quests.find(q=>q.name===effect.reward.questName)?.id??'']?.completion}</p><p>Reward: <span>+{effect.reward.xp} XP</span> · <strong>+{effect.reward.coins} coins</strong></p>{effect.levelUp&&<span className="reward-level-up">LEVEL UP! Level {1+Math.floor((effect.reward.previousXp+effect.reward.xp)/100)}</span>}</div></div><button className="primary reward-close" onClick={release}>Close <span>Collect rewards →</span></button></Modal>;
  if(effect.reduced)return null;
  return <div className="reward-particles" aria-hidden="true" key={`particles-${effect.id}`}>{(['xp','coins'] as const).flatMap(kind=>Array.from({length:kind==='xp'?26:10},(_,index)=>{
    const end=effect[kind],dx=end.x-effect.start.x,dy=end.y-effect.start.y;
    const spread=(index%2===0?1:-1)*(25+(index%6)*12);
    const style={'--start-x':`${effect.start.x+(index%5-2)*10}px`,'--start-y':`${effect.start.y+(index%3-1)*8}px`,'--travel-x':`${dx}px`,'--travel-y':`${dy}px`,'--mid-x':`${dx*.4+spread}px`,'--mid-y':`${dy*.4-75-index%4*15}px`,'--trail-angle':`${Math.atan2(dy,dx)*180/Math.PI}deg`,animationDelay:`${index*15}ms`} as CSSProperties;
    return <span key={`${kind}-${index}`} className={`reward-particle ${kind} ${kind==='xp'&&index%4===0?'spark':''}`} style={style}>{kind==='coins'?'◈':''}</span>;
  }))}<span className="reward-impact" style={{left:effect.xp.x,top:effect.xp.y}}/><span className="reward-impact gold" style={{left:effect.coins.x,top:effect.coins.y}}/></div>;
}
