import {useId} from 'react';
import type {Appearance} from '../types';
import {ponytailHairAsset,ponytailHairFit} from '../data/ponytailHair';
export function PonytailHair({gender,color,hat=false,thumbnail=false}:{gender:Appearance['gender'];color:Appearance['hairColorId'];hat?:boolean;thumbnail?:boolean}){
 const uid=useId().replace(/[^a-zA-Z0-9]/g,'');const asset=ponytailHairAsset(gender,color);
 if(thumbnail)return <svg className="hairstyle-thumbnail" viewBox={asset.preview} aria-hidden="true"><image href={asset.src} width={asset.width} height={asset.height}/></svg>;
 return <svg className="avatar-hair-overlay" viewBox="0 0 1024 1536" aria-hidden="true"><defs><clipPath id={`${uid}-hat`}><rect y="115" width="1024" height="1421"/></clipPath></defs><g clipPath={hat?`url(#${uid}-hat)`:undefined}><image href={asset.src} {...ponytailHairFit(gender)} preserveAspectRatio="none"/></g></svg>;
}
