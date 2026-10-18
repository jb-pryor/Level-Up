import { maleShirtPath } from '../data/maleShirts';
import { EyeOverlay } from './EyeOverlay';
import { TransitioningAvatar } from './TransitioningAvatar';
import { useId } from 'react';
import type { Appearance, Outfit } from '../types';
import { starterOutfit } from '../types';
import { avatarPresets } from '../data/avatarPresets';

export function Avatar({ appearance, outfit = starterOutfit }: { appearance: Appearance; outfit?: Outfit }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const preset = avatarPresets[appearance.bodyId];
  const path = `/avatars/${appearance.bodyId}`;
  const matrix = (r: number, g: number, b: number) => `${r} ${r} ${r} 0 0 ${g} ${g} ${g} 0 0 ${b} ${b} ${b} 0 0 0 0 0 1 0`;
  const hairMatrix = appearance.hairColorId === 'black' ? matrix(.10,.09,.09) : matrix(.62,.43,.19);
  const eyeMatrix = appearance.eyeColorId === 'blue' ? matrix(.18,.36,.49) : matrix(.23,.40,.26);
  if(appearance.gender==='male')return <TransitioningAvatar overlay={<><EyeOverlay color={appearance.eyeColorId}/>{maleShirtPath(outfit.shirt)&&<svg className="avatar-shirt-overlay" viewBox="0 0 1024 1536" aria-hidden="true"><image href={maleShirtPath(outfit.shirt)!} width="1024" height="1536"/></svg>}</>} src={`/avatars/new-male-bases/Aligned-Avatars/Complexion-${appearance.complexionId}-${appearance.expressionId}.png`} alt={`${appearance.name||'Your character'}, complexion ${appearance.complexionId}, ${appearance.expressionId==='smile'?'smiling':'neutral expression'}`} />;
  return <svg viewBox="0 -90 1024 1626" role="img" aria-label={`${appearance.name || 'Your character'}, ${appearance.hairStyleId === 'long' ? 'long' : 'short'} ${appearance.hairColorId} hair, ${appearance.expressionId === 'smile' ? 'smiling' : 'neutral expression'}`} className="avatar">
    <defs>
      <filter id={`${uid}-hair`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={hairMatrix}/></filter>
      <filter id={`${uid}-eyes`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={eyeMatrix}/></filter>
      <filter id={`${uid}-shirt`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={outfit.shirt === 'green-shirt' ? matrix(.09,.31,.18) : matrix(.14,.24,.46)}/></filter>
      <filter id={`${uid}-pants`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={outfit.pants === 'dark-pants' ? matrix(.13,.14,.15) : matrix(.28,.31,.19)}/></filter>
      <clipPath id={`${uid}-pants-clip`}><path d={preset.pants}/></clipPath>
      <clipPath id={`${uid}-eyes-clip`}>{preset.eyes.map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r}/>)}</clipPath>
      <clipPath id={`${uid}-hat-hair`}><rect x="0" y={appearance.bodyId === 'base-a' ? 175 : 205} width="1024" height="1536"/></clipPath>
    </defs>
    {appearance.hairStyleId === 'long' && <image href="/avatars/hair/long-back.png" width="1024" height="1536" transform={preset.hairTransform.long} filter={appearance.hairColorId === 'brown' ? undefined : `url(#${uid}-hair)`}/>}
    <image href={`${path}.png`} width="1024" height="1536"/>
    {appearance.eyeColorId !== 'brown' && <image href={`${path}.png`} width="1024" height="1536" clipPath={`url(#${uid}-eyes-clip)`} filter={`url(#${uid}-eyes)`}/>}
    {appearance.expressionId === 'neutral' && <image href={`${path}-mouth.png`} width="1024" height="1536"/>}
    {outfit.pants !== 'starter' && <image href={`${path}.png`} width="1024" height="1536" clipPath={`url(#${uid}-pants-clip)`} filter={`url(#${uid}-pants)`}/>}
    {outfit.shirt !== 'starter' && <image href={`${path}-shirt.png`} width="1024" height="1536" filter={`url(#${uid}-shirt)`}/>}
    {outfit.shoes && <image href={`${path}-shoes.png`} width="1024" height="1536"/>}
    <g clipPath={outfit.hat ? `url(#${uid}-hat-hair)` : undefined}><image href={`/avatars/hair/${appearance.hairStyleId === 'long' ? 'long-front' : 'short'}.png`} width="1024" height="1536" transform={preset.hairTransform[appearance.hairStyleId]} filter={appearance.hairColorId === 'brown' ? undefined : `url(#${uid}-hair)`}/>
    </g>
    {outfit.hat && <image href={`${path}-hat.png`} width="1024" height="1536"/>}
  </svg>;
}
