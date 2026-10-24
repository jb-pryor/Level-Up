import {useId} from 'react';
import type {Appearance} from '../types';
export const curlyHairPath=(color:Appearance['hairColorId'])=>`/avatars/hair/newHair/fitted/${color}-curly-hair-fitted.png`;
export function CurlyHair({color,female=false,hat=false,thumbnail=false}:{color:Appearance['hairColorId'];female?:boolean;hat?:boolean;thumbnail?:boolean}){
  const uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  if(thumbnail)return <svg className="hairstyle-thumbnail" viewBox="270 10 490 355" aria-hidden="true"><image href={curlyHairPath(color)} width="1024" height="1706"/></svg>;
  return <svg className="avatar-hair-overlay" viewBox="0 0 1024 1536" aria-hidden="true"><defs><clipPath id={`${uid}-hat`}><rect y="115" width="1024" height="1421"/></clipPath></defs><g clipPath={hat?`url(#${uid}-hat)`:undefined}><g transform={female?'translate(82 8) scale(.84)':undefined}><image href={curlyHairPath(color)} y="-90" width="1024" height="1706"/></g></g></svg>;
}
