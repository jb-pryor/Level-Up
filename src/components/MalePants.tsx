import { NewPants } from './NewPants';
import { newPantsAsset } from '../data/newPants';
import { useId } from 'react';
import type { Outfit } from '../types';
export const malePantsPath='/avatars/pants/male-default-fitted.png';
export function MalePants({pants,thumbnail=false}:{pants:Outfit['pants'];thumbnail?:boolean}){
  const uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  if(newPantsAsset(pants))return <NewPants id={pants} thumbnail={thumbnail}/>;
  const values=pants==='dark-pants'?'.13 .13 .13 0 0 .14 .14 .14 0 0 .15 .15 .15 0 0 0 0 0 1 0':'.28 .28 .28 0 0 .31 .31 .31 0 0 .19 .19 .19 0 0 0 0 0 1 0';
  return <svg className={thumbnail?'wardrobe-picture':'avatar-pants-overlay'} viewBox={thumbnail?'310 850 410 570':'0 0 1024 1536'} aria-hidden="true"><defs><filter id={`${uid}-pants`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={values}/></filter></defs><image href={malePantsPath} width="1024" height="1536" filter={pants==='starter'?undefined:`url(#${uid}-pants)`}/></svg>;
}
