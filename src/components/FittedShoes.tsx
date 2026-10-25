import {useId} from 'react';
import {maleShoePath,shoeFit} from '../data/maleShoes';
import {femaleShoesTransform} from '../data/femaleClothing';

export function FittedShoes({id,female=false,thumbnail=false}:{id:string|null;female?:boolean;thumbnail?:boolean}){
  const uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  const path=id==='suede-clogs'?null:maleShoePath(id);if(!path)return null;
  const cleanAlpha=path.endsWith('-open-heel.png');
  const fit=id?shoeFit[id]:undefined;
  const crop=id==='bunny-slippers'?'210 1240 610 296':female?'250 1310 530 225':'200 1310 630 226';
  return <svg className={thumbnail?'wardrobe-picture':'avatar-shoes-overlay'} viewBox={thumbnail?crop:'0 0 1024 1536'} aria-hidden="true">
    {cleanAlpha&&<defs><filter id={`${uid}-alpha`} colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncA type="table" tableValues="0 0 0 0 0 0 0 0 0 1 1"/></feComponentTransfer></filter></defs>}
    <g transform={female?femaleShoesTransform:undefined}>
      {fit?<><defs><clipPath id={`${uid}-left`}><rect width="512" height="1536"/></clipPath><clipPath id={`${uid}-right`}><rect x="512" width="512" height="1536"/></clipPath></defs>
        {[348,680].map((anchor,index)=><g key={anchor} transform={`translate(${anchor+(female?(index?7:-7):0)} 1536) scale(${fit.x*(female?1.08:1)} ${fit.y}) translate(${-anchor} -1536)`}><g clipPath={`url(#${uid}-${index?'right':'left'})`}><image href={path} width="1024" height="1536" filter={cleanAlpha?`url(#${uid}-alpha)`:undefined}/></g></g>)}</>:<image href={path} width="1024" height="1536" filter={cleanAlpha?`url(#${uid}-alpha)`:undefined}/>}
    </g>
  </svg>;
}
