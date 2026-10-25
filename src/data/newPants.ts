export const newPants = {
  'cow-print-pants':{file:'pants-cow-print-fitted.png',viewBox:'322 875 386 519',canvasAligned:true},
  'flame-pants':{file:'pants-flame-fitted.png',viewBox:'322 875 386 519',canvasAligned:true},
  'gold-fringe-pants':{file:'pants-gold-fringe-fitted.png',viewBox:'322 875 386 519',canvasAligned:true},
  'multicolor-diamond-pants':{file:'pants-multicolor-diamond-fitted.png',viewBox:'322 875 386 519',canvasAligned:true},
  'patchwork-tapestry-pants':{file:'pants-patchwork-tapestry-fitted.png',viewBox:'322 875 386 519',canvasAligned:true},
  'snoopy-pajama-pants':{file:'pants-snoopy-pajama-fitted.png',viewBox:'322 875 386 519',canvasAligned:true},

  'brown-track-pants':{file:'pants-brown-track-fitted.png',viewBox:'322 875 386 519'},
  'green-joggers':{file:'pants-green-fitted.png',viewBox:'322 875 386 519'},
  'plaid-pajama-pants':{file:'pants-plaid-pajama-fitted.png',viewBox:'322 875 386 519'},
  'red-joggers':{file:'pants-red-fitted.png',viewBox:'322 875 386 519'},
  'red-velvet-pants':{file:'pants-red-velvet-fitted.png',viewBox:'322 875 386 519'},
  'ripped-jeans':{file:'pants-ripped-jeans-fitted.png',viewBox:'322 875 386 519'},
  'shrek-pajama-pants':{file:'pants-shrek-pajama-fitted.png',viewBox:'322 875 386 519'},
  'white-airy-pants':{file:'pants-white-airy-fitted.png',viewBox:'322 875 386 519'},

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
