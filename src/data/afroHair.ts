import type {Appearance} from '../types';
const maleFiles={black:'afro-hair-men-fitted.png',brown:'afro-male-brown-fitted.png',blonde:'afro-male-blond-fitted.png',gray:'afro-male-gray-fitted.png'} as const;
const femaleFiles={black:'afro-female-black-fitted.png',brown:'afro-female-brown-fitted.png',blonde:'afro-female-blond-fitted.png',gray:'afro-female-gray-fitted.png'} as const;
export function afroHairAsset(gender:Appearance['gender'],color:Appearance['hairColorId']){
  const female=gender==='female',black=female&&color==='black';
  return {src:`/avatars/hair/newHair/fitted/${(female?femaleFiles:maleFiles)[color]}`,width:female?(black?852:830):1021,height:female?(black?2100:2048):1800,preview:!female?'230 40 550 390':black?'155 50 550 410':'150 50 535 395'};
}
export const afroHairFit=(gender:Appearance['gender'])=>gender==='male'?{x:7,y:-120,width:1024,height:1800}:{x:166.31,y:-100,width:687.24,height:1695.744};
