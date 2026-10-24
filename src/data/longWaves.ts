import type { Appearance } from '../types';
// Source crops exclude transparent margins and stray low-opacity pixels.
export const longWavesSources = {
  brown:{file:'brownLongStyle2.png',viewBox:'17 30 829 850'},
  black:{file:'blackLongStyle2.png',viewBox:'120 8 597 553'},
  blonde:{file:'blondeLongStyle2.png',viewBox:'120 8 597 553'},
  gray:{file:'grayLongStyle2.png',viewBox:'120 8 597 553'},
} as const;
export const longWavesPath=(color:Appearance['hairColorId'])=>`/avatars/hair/long-layered/newStyle/${longWavesSources[color].file}`;
export const longWavesFit=(gender:Appearance['gender'])=>gender==='female'?{x:239.5,y:-25,width:545,height:555}:{x:202,y:-35,width:620,height:610};
