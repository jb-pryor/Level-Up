import type {Appearance} from '../types';
import {femaleBase} from './femaleBases.ts';
const maleFiles={black:'ponytail-male-black-fitted.png',brown:'ponytail-brown-male-fitted.png',blonde:'ponytail-male-blond-fitted.png',gray:'ponytail-male-gray-fitted.png'} as const;
const femaleFiles={black:'ponytail-female-black-fitted.png',brown:'poneytail-brown-female-fitted.png',blonde:'ponytail-female-blond-fitted.png',gray:'ponytail-female-gray-fitted.png'} as const;
export function ponytailHairAsset(gender:Appearance['gender'],color:Appearance['hairColorId']){
 const female=gender==='female';
 return {src:`/avatars/hair/newHair/fitted/${(female?femaleFiles:maleFiles)[color]}`,width:female?852:1019,height:female?1846:1543,preview:female?'220 0 550 555':'275 0 575 510'};
}
export const ponytailHairFit=(gender:Appearance['gender'])=>gender==='male'?{x:16,y:-20,width:1024,height:1536}:femaleBase({complexionId:'1',expressionId:'smile'}).placement;
