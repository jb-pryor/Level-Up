import { CurlyHair } from './CurlyHair';
import { LongWaves } from './LongWaves';
import type { Appearance } from '../types';
export function HairstyleThumbnail({style,color}:{style:Appearance['hairStyleId'];color:Appearance['hairColorId']}){
  if(style==='short-curly')return <CurlyHair color={color} thumbnail/>;
  if(style==='long-waves')return <LongWaves gender="female" color={color} thumbnail/>;
  if(style==='bald')return <svg className="hairstyle-thumbnail" viewBox="0 0 96 110" aria-hidden="true"><path d="M24 58V39a24 24 0 0 1 48 0v19c0 21-13 31-24 31S24 79 24 58Z" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M24 51c-12-7-12 19 2 19m46-19c12-7 12 19-2 19" fill="none" stroke="currentColor" strokeWidth="3"/></svg>;
  if(style==='short-swept')return <svg className="hairstyle-thumbnail" viewBox="280 50 480 350" aria-hidden="true"><image href={`/avatars/hair/newHair/fitted/${color}.png`} width="1024" height="1800"/></svg>;
  const tint=color==='black'?'saturate(0) brightness(.35)':color==='gray'?'saturate(0) brightness(1.5)':color==='blonde'?'sepia(.55) saturate(.85) brightness(1.8)':'none';
  return <img className="hairstyle-thumbnail" src="/avatars/hair/long-layered/chestnut.png" alt="" style={{filter:tint}}/>;
}
