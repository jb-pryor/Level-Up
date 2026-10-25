import { useId } from 'react';
import { newPantsAsset } from '../data/newPants';
import { femalePantsTransform } from '../data/femaleClothing';
export function NewPants({id,female=false,thumbnail=false}:{id:string;female?:boolean;thumbnail?:boolean}){
  const uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  const asset=newPantsAsset(id);if(!asset)return null;
  // These aligned designs share the narrower female stance.
  // Move each leg inward rather than scaling away its inner-edge coverage.
  const fitLegs=female&&asset.file.startsWith('pants-');
  const aligned='canvasAligned' in asset&&asset.canvasAligned;
  const picture=aligned?<image href={`/avatars/pants/new-pants/${asset.file}`} width="1024" height="1536"/>:<svg x="322" y="875" width="386" height="519" viewBox={asset.viewBox} preserveAspectRatio="none"><image href={`/avatars/pants/new-pants/${asset.file}`} width="1024" height="1536"/></svg>;
  return <svg className={thumbnail?'wardrobe-picture':'avatar-pants-overlay'} viewBox={thumbnail?(female?'300 800 430 620':'310 850 410 570'):'0 0 1024 1536'} aria-hidden="true">
    {fitLegs&&<defs><clipPath id={`${uid}-left`}><rect width="515" height="1536"/></clipPath><clipPath id={`${uid}-right`}><rect x="515" width="509" height="1536"/></clipPath></defs>}
    <g transform={female?femalePantsTransform:undefined}>{fitLegs?<>
      <g clipPath={`url(#${uid}-left)`}><g transform="translate(6 0)">{picture}</g></g>
      <g clipPath={`url(#${uid}-right)`}><g transform="translate(-6 0)">{picture}</g></g>
    </>:picture}</g>
  </svg>;
}
