import { FittedShoes } from './FittedShoes';
import { NewPants } from './NewPants';
import { newPantsAsset } from '../data/newPants';
import { useId } from 'react';
import { ReferenceShirt } from './ReferenceShirt';
import { referenceShirtPath } from '../data/referenceShirts';
import type { Outfit } from '../types';
import { femaleTeePath,femaleShirtTint,femalePantsTransform,femaleCapTransform } from '../data/femaleClothing';
import { malePantsPath } from './MalePants';
export function FemaleClothing({slot,id,thumbnail=false}:{slot:keyof Outfit;id:string|null;thumbnail?:boolean}){
  const uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  if(slot==='pants'&&id&&newPantsAsset(id))return <NewPants id={id} female thumbnail={thumbnail}/>;
  if(slot==='shirt'&&id&&referenceShirtPath(id,'female'))return <ReferenceShirt id={id} gender="female" thumbnail={thumbnail}/>;
  if(slot==='shoes')return <FittedShoes id={id} female thumbnail={thumbnail}/>;
  if(id===null||slot==='shirt'&&id==='starter')return null;
  let href:string|null=null,transform:string|undefined,tint:string|null=null;
  let crop='260 420 510 450';
  if(slot==='shirt'){href=femaleTeePath;tint=femaleShirtTint(id);}
  if(slot==='pants'){href=malePantsPath;transform=femalePantsTransform;crop='300 800 430 620';tint=id==='dark-pants'?'.13 .13 .13 0 0 .14 .14 .14 0 0 .15 .15 .15 0 0 0 0 0 1 0':id==='olive-pants'?'.28 .28 .28 0 0 .31 .31 .31 0 0 .19 .19 .19 0 0 0 0 0 1 0':null;}
  if(slot==='hat'){href='/avatars/base-b-hat.png';transform=femaleCapTransform;crop='320 -30 390 250';}
  if(!href)return null;
  return <svg className={thumbnail?'wardrobe-picture':'avatar-shirt-overlay'} viewBox={thumbnail?crop:'0 0 1024 1536'} aria-hidden="true"><defs>{tint&&<filter id={`${uid}-tint`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={tint}/></filter>}</defs>
    {slot==='shirt'?<svg x="285" y="425" width="454" height="415" viewBox="45 139 1061 1126" preserveAspectRatio="none"><defs><clipPath id={`${uid}-shirt-edge`}><path d="M440 140 Q422 130 418 150 C388 180 410 260 500 290 Q575 340 655 295 C730 260 758 190 719 140 Q740 134 762 149 L947 222 Q979 235 1001 266 L1104 456 Q1115 468 1101 479 L921 566 Q905 570 902 549 L895 550 C887 650 821 768 839 870 Q860 980 964 1194 Q970 1217 953 1229 Q579 1301 201 1227 Q193 1222 203 1195 Q280 1010 318 864 C333 812 289 667 263 550 Q255 578 238 564 L45 479 Q35 472 39 455 L175 267 Q190 240 211 229 L405 149 Q427 139 440 140 Z"/></clipPath></defs><image href={href} width="1145" height="1374" clipPath={`url(#${uid}-shirt-edge)`} filter={tint?`url(#${uid}-tint)`:undefined}/></svg>:<image href={href} width="1024" height="1536" transform={transform} filter={tint?`url(#${uid}-tint)`:undefined}/>}
  </svg>;
}
