import { useId } from 'react';
import type { Appearance } from '../types';
// Fit the supplied eye pairs by iris center; preserve the base's eyelids/whites.
const sources={brown:{file:'eyesBrown.png',width:2122,left:502,right:1604,y:391},blue:{file:'eyesBlue.png',width:2123,left:508,right:1608,y:391},green:{file:'eyesGreen.png',width:2122,left:495,right:1617,y:392},gray:{file:'eyesGray.png',width:2121,left:495,right:1620,y:390},red:{file:'eyesRed.png',width:2122,left:511,right:1601,y:393}};
export function EyeOverlay({color,female=false,fit}:{color:Appearance['eyeColorId'];female?:boolean;fit?:{centers:[number,number];y:number}}){
  const uid=useId().replace(/[^a-zA-Z0-9]/g,''),source=sources[color];
  const scale=female?.12:.135;
  const eyes=fit?.centers??(female?[443,583]:[436,595]),y=fit?.y??(female?237:235);
  return <svg className="avatar-eye-overlay" viewBox="0 0 1024 1536" aria-hidden="true" preserveAspectRatio="xMidYMid meet"><defs>{eyes.map((x,i)=><clipPath id={`${uid}-eye-${i}`} key={i}><ellipse cx={x} cy={y} rx={female?22.5:25.5} ry={female?24:27}/></clipPath>)}</defs>{eyes.map((x,i)=><g key={i} clipPath={`url(#${uid}-eye-${i})`}><image href={`/avatars/eyes/${source.file}`} x={x-(i?source.right:source.left)*scale} y={y-source.y*scale} width={source.width*scale} height={741*scale}/></g>)}</svg>;
}
