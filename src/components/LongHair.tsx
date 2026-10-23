import { useId } from 'react';
import type { Appearance } from '../types';
// The same wig is fitted separately. The base sits between back and front passes,
// preserving the original ears rather than painting skin into the hair texture.
export function LongHair({gender,color,front=false,hat=false}:{gender:Appearance['gender'];color:Appearance['hairColorId'];front?:boolean;hat?:boolean}){
  const uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  const female=gender==='female';
  const sx=female?.65:.75,sy=female?.58:.65;
  const x=512-627*sx,y=female?-30:-35;
  const tint=color==='black'?'saturate(0) brightness(.35)':color==='gray'?'saturate(0) brightness(1.5)':color==='blonde'?'sepia(.55) saturate(.85) brightness(1.8)':'none';
  const href='/avatars/hair/long-layered/chestnut.png';
  return <svg className="avatar-hair-overlay" viewBox="0 0 1024 1536" aria-hidden="true"><defs><clipPath id={`${uid}-hat`}><rect x="0" y="115" width="1024" height="1421"/></clipPath><clipPath id={`${uid}-ear-backing`}><ellipse cx={female?362:331} cy="265" rx="67" ry="73"/><ellipse cx={female?662:693} cy="265" rx="67" ry="73"/></clipPath></defs>
    <g clipPath={hat?`url(#${uid}-hat)`:undefined}>
    {!front&&<g clipPath={`url(#${uid}-ear-backing)`}><image href={href} preserveAspectRatio="none" x={x} y={y-160} width={1254*sx} height={1254*sy} style={{filter:tint}}/></g>}
    <image href={href} preserveAspectRatio="none" x={x} y={y} width={1254*sx} height={1254*sy} style={{filter:tint}}/>
    </g>
  </svg>;
}
