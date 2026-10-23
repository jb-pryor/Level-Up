import {maleShirts} from './maleShirts.ts';
export const femaleTeePath='/avatars/shirts/female/white-tee.png';
export const femaleShirtColors:Record<string,[number,number,number]>={
 green:[.02,.48,.24],blue:[.04,.32,.79],black:[.14,.14,.16],gray:[.52,.56,.60],navy:[.08,.15,.28],orange:[.98,.35,.02],pink:[.94,.40,.67],purple:[.43,.10,.65],red:[.82,.08,.07],white:[1,1,1],yellow:[.98,.80,.05],
};
export function femaleShirtTint(id:string){const color=maleShirts[id as keyof typeof maleShirts];const rgb=femaleShirtColors[color];return rgb?rgb.flatMap(n=>[n*.2126,n*.7152,n*.0722,0,0]).concat([0,0,0,1,0]).join(' '):null;}
// Canonical 1024x1536 placements, shared by all normalized female bases.
export const femalePantsTransform='translate(-3 -182) scale(1 1.13)';
export const femaleShoesTransform='translate(61.5 158.3) scale(.88)';
export const femaleCapTransform='translate(36 -45) scale(.93)';
