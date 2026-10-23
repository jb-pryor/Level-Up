import { useId } from 'react';
export function AvatarEars({src,female=false,placement}:{src:string;female?:boolean;placement?:{x:number;y:number;width:number;height:number}}){
  const id=useId().replace(/[^a-zA-Z0-9]/g,'');
  const path=female?'M386 220 C352 198 330 224 340 267 C350 300 365 314 391 308 L388 240 Z':'M344 217 C310 200 293 230 307 276 C318 309 337 320 361 313 L358 238 Z';
  return <svg className="avatar-hair-overlay" viewBox="0 0 1024 1536" aria-hidden="true"><defs><clipPath id={`${id}-ears`}><path d={path}/><path d={path} transform="translate(1024 0) scale(-1 1)"/></clipPath></defs><image href={src} {...(placement??{width:1024,height:1536})} clipPath={`url(#${id}-ears)`}/></svg>;
}
