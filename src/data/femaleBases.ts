import type { Appearance } from '../types';
const files={
  '1':{smile:{file:'Base6.png',w:852,h:1846,bounds:[62,41,787,1816]},neutral:{file:'Base6-neutral.png',w:941,h:1672,bounds:[153,32,787,1621]}},
  '2':{smile:{file:'Base7.png',w:852,h:1846,bounds:[56,35,792,1815]},neutral:{file:'Base7-neutral.png',w:852,h:1846,bounds:[56,36,791,1819]}},
  '3':{smile:{file:'Base8.png',w:852,h:1846,bounds:[58,39,791,1820]},neutral:{file:'Base8-neutral.png',w:852,h:1846,bounds:[59,39,789,1815]}},
};
export function femaleBase(a:Pick<Appearance,'complexionId'|'expressionId'>){
  const entry=files[a.complexionId][a.expressionId];
  const [left,top,right,bottom]=entry.bounds;
  const scale=1470/(bottom-top);
  const anchors=entry.file==='Base6-neutral.png'?[403,540,245]:[342,510,291];
  const offsetX=512-(left+right)*scale/2,offsetY=30-top*scale;
  return {eyes:{centers:[offsetX+anchors[0]*scale,offsetX+anchors[1]*scale] as [number,number],y:offsetY+anchors[2]*scale},src:`/avatars/new-female-bases/${entry.file}`,placement:{x:512-(left+right)*scale/2,y:30-top*scale,width:entry.w*scale,height:entry.h*scale}};
}
