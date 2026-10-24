import { newPantsAsset } from '../data/newPants';
import { femalePantsTransform } from '../data/femaleClothing';
export function NewPants({id,female=false,thumbnail=false}:{id:string;female?:boolean;thumbnail?:boolean}){
  const asset=newPantsAsset(id);if(!asset)return null;
  return <svg className={thumbnail?'wardrobe-picture':'avatar-pants-overlay'} viewBox={thumbnail?(female?'300 800 430 620':'310 850 410 570'):'0 0 1024 1536'} aria-hidden="true">
    <g transform={female?femalePantsTransform:undefined}><svg x="322" y="875" width="386" height="519" viewBox={asset.viewBox} preserveAspectRatio="none"><image href={`/avatars/pants/new-pants/${asset.file}`} width="1024" height="1536"/></svg></g>
  </svg>;
}
