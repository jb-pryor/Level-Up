import { useId, useState } from 'react';
import { cosmetics } from '../data/cosmetics';
import type { Appearance, Outfit } from '../types';

export function ClothingTooltips({appearance,outfit}:{appearance:Appearance;outfit:Outfit}) {
  const uid=useId();
  const [dismissed,setDismissed]=useState<string|null>(null);
  const regions=[
    {slot:'shirt',x:appearance.gender==='male'?260:290,y:455,w:appearance.gender==='male'?505:445,h:370,tip:555},
    {slot:'pants',x:335,y:850,w:355,h:510,tip:1000},
    {slot:'shoes',x:265,y:1380,w:495,h:145,tip:1385},
    {slot:'hat',x:330,y:10,w:365,h:220,tip:85},
  ] as const;
  return <svg className="clothing-hit-map" viewBox="0 0 1024 1536" aria-label="Clothing bonuses">
    {regions.map(region=>{
      const id=outfit[region.slot];
      if(id===null||region.slot==='hat'&&appearance.gender==='male')return null;
      const item=cosmetics.find(c=>c.id===id);
      const name=item?.name??(region.slot==='shirt'?'Starter tank':'Starter gray');
      const boosts=[item?.xpBoostPercent?`+${item.xpBoostPercent}% quest XP`:null,item?.coinBoostPercent?`+${item.coinBoostPercent}% quest coins`:null].filter(Boolean);
      const bonus=boosts.join(' · ')||'No boost';
      const tooltipId=`${uid}-${region.slot}`;
      return <g key={region.slot} className="clothing-hit-region" tabIndex={0} role="group" aria-label={name} aria-describedby={tooltipId} data-dismissed={dismissed===region.slot} onPointerEnter={()=>setDismissed(null)} onPointerLeave={()=>setDismissed(null)} onFocus={()=>setDismissed(null)} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();setDismissed(region.slot)}}}>
        <rect className="clothing-hit-target" x={region.x} y={region.y} width={region.w} height={region.h}/>
        <g id={tooltipId} role="tooltip" className="clothing-boost-tooltip">
          <path className="clothing-tooltip-connector" d={`M${region.x+region.w-12} ${region.tip+53} H780`}/>
          <rect className="clothing-tooltip-box" x="780" y={region.tip} width="610" height="106" rx="8"/>
          <path className="clothing-tooltip-notch" d={`M780 ${region.tip+40} l-13 13 13 13 Z`}/>
          <text x="805" y={region.tip+42} className="clothing-tooltip-name">{name}</text>
          <text x="805" y={region.tip+81}>{bonus}</text>
        </g>
      </g>;
    })}
  </svg>;
}
