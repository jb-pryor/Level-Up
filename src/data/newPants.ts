export const newPants = {
  'lightwash-jeans':{file:'lightwash-jeans.png',viewBox:'321 876 387 519'},
  'darkwash-jeans':{file:'darkwash-jeans.png',viewBox:'321 844 387 551'},
  'tan-carpenter-pants':{file:'tan-carpenter-pants.png',viewBox:'320 875 389 523'},
  'leather-pants':{file:'leather-pants.png',viewBox:'321 843 386 521'},
  'camo-pants':{file:'camo-pants.png',viewBox:'324 873 385 521'},
  'zebra-pants':{file:'zebra-pants.png',viewBox:'322 875 384 520'},
} as const;
export type NewPantsId=keyof typeof newPants;
export type PantsId='starter'|'dark-pants'|'olive-pants'|NewPantsId;
export function newPantsAsset(id:string){return Object.hasOwn(newPants,id)?newPants[id as NewPantsId]:null;}
