import { PonytailHair } from './PonytailHair';
import { AfroHair } from './AfroHair';
import { CurlyHair } from './CurlyHair';
import { LongWaves } from './LongWaves';
import { ClothingTooltips } from './ClothingTooltips';
import { ReferenceShirt } from './ReferenceShirt';
import { FemaleClothing } from './FemaleClothing';
import { AvatarEars } from './AvatarEars';
import { LongHair } from './LongHair';
import { femaleBase } from '../data/femaleBases';
import { MalePants } from './MalePants';
import { maleShoePath } from '../data/maleShoes';
import { MaleHair } from './MaleHair';
import { maleShirtPath } from '../data/maleShirts';
import { EyeOverlay } from './EyeOverlay';
import { TransitioningAvatar } from './TransitioningAvatar';
import type { Appearance, Outfit } from '../types';
import { starterOutfit } from '../types';

export function Avatar({ appearance, outfit = starterOutfit, showClothingInfo=false }: { appearance: Appearance; outfit?: Outfit; showClothingInfo?:boolean }) {
  if(appearance.gender==='male')return <TransitioningAvatar interaction={showClothingInfo?<ClothingTooltips appearance={appearance} outfit={outfit}/>:undefined} underlay={appearance.hairStyleId==='long'?<LongHair gender="male" color={appearance.hairColorId}/>:undefined} overlay={<><MalePants pants={outfit.pants}/>{appearance.hairStyleId==='short-swept'&&<MaleHair color={appearance.hairColorId}/>}{appearance.hairStyleId==='short-curly'&&<CurlyHair color={appearance.hairColorId}/>}{appearance.hairStyleId==='afro'&&<AfroHair gender="male" color={appearance.hairColorId}/>}<EyeOverlay color={appearance.eyeColorId}/><ReferenceShirt id={outfit.shirt} gender="male"/>{maleShirtPath(outfit.shirt)&&<svg className="avatar-shirt-overlay" viewBox="0 0 1024 1536" aria-hidden="true"><image href={maleShirtPath(outfit.shirt)!} width="1024" height="1536"/></svg>}{maleShoePath(outfit.shoes)&&<svg className="avatar-shoes-overlay" viewBox="0 0 1024 1536" aria-hidden="true"><image href={maleShoePath(outfit.shoes)!} width="1024" height="1536"/></svg>}{appearance.hairStyleId==='ponytail'&&<PonytailHair gender="male" color={appearance.hairColorId}/>}{appearance.hairStyleId==='long-waves'&&<LongWaves gender="male" color={appearance.hairColorId}/>}{appearance.hairStyleId==='long'&&<><LongHair gender="male" color={appearance.hairColorId} front/><AvatarEars src={`/avatars/new-male-bases/Aligned-Avatars/Complexion-${appearance.complexionId}-${appearance.expressionId}.png`}/></>}</>} src={`/avatars/new-male-bases/Aligned-Avatars/Complexion-${appearance.complexionId}-${appearance.expressionId}.png`} alt={`${appearance.name||'Your character'}, complexion ${appearance.complexionId}, ${appearance.expressionId==='smile'?'smiling':'neutral expression'}`} />;
  const base=femaleBase(appearance);
  return <TransitioningAvatar interaction={showClothingInfo?<ClothingTooltips appearance={appearance} outfit={outfit}/>:undefined} src={base.src} placement={base.placement} alt={`${appearance.name||'Your character'}, complexion ${appearance.complexionId}, ${appearance.expressionId==='smile'?'smiling':'neutral expression'}`} underlay={appearance.hairStyleId==='long'?<LongHair gender="female" hat={!!outfit.hat} color={appearance.hairColorId}/>:undefined} overlay={<>
    {appearance.hairStyleId==='short-swept'&&<MaleHair color={appearance.hairColorId} female hat={!!outfit.hat}/>}
    {appearance.eyeColorId!=='brown'&&<EyeOverlay color={appearance.eyeColorId} female fit={base.eyes}/>}
    <FemaleClothing slot="pants" id={outfit.pants}/>
    <FemaleClothing slot="shirt" id={outfit.shirt}/>
    <FemaleClothing slot="shoes" id={outfit.shoes}/>
    {appearance.hairStyleId==='long'&&<><LongHair gender="female" hat={!!outfit.hat} color={appearance.hairColorId} front/><AvatarEars src={base.src} female placement={base.placement}/></>}
    {appearance.hairStyleId==='long-waves'&&<LongWaves gender="female" color={appearance.hairColorId} hat={!!outfit.hat}/>}
    {appearance.hairStyleId==='short-curly'&&<CurlyHair color={appearance.hairColorId} female hat={!!outfit.hat}/>}
    {appearance.hairStyleId==='afro'&&<AfroHair gender="female" color={appearance.hairColorId} hat={!!outfit.hat}/>}
    {appearance.hairStyleId==='ponytail'&&<PonytailHair gender="female" color={appearance.hairColorId} hat={!!outfit.hat}/>}
    <FemaleClothing slot="hat" id={outfit.hat}/>
  </>}/>;
}
