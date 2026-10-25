export const maleSneakersPath='/avatars/shoes/male-sneakers-fitted.png';
export const maleShoes={
  sneakers:maleSneakersPath,
  'black-red-shoes':'/avatars/shoes/fitted/black-red-shoes.png',
  'black-white-shoes':'/avatars/shoes/fitted/black-white-shoes.png',
  'blue-white-shoes':'/avatars/shoes/fitted/blue-white-shoes.png',
  'brown-shoes':'/avatars/shoes/fitted/brown-shoes.png',
  'green-yellow-shoes':'/avatars/shoes/fitted/green-yellow-shoes.png',
  'black-high-tops':'/avatars/shoes/fitted/shoes-black-high-tops-fitted.png',
  'double-strap-sandals':'/avatars/shoes/fitted/shoes-double-strap-sandals-open-heel.png',
  'blue-five-toe-shoes':'/avatars/shoes/fitted/shoes-blue-five-toe-shoes-open-heel.png',
  'bear-claw-slippers':'/avatars/shoes/fitted/shoes-bear-claw-slippers-fitted.png',
  'cream-samba-sneakers':'/avatars/shoes/fitted/shoes-cream-samba-sneakers-fitted.png',
  'suede-clogs':'/avatars/shoes/fitted/shoes-suede-clogs-open-heel.png',
  'gray-running-shoes':'/avatars/shoes/fitted/shoes-gray-running-shoes-fitted.png',
  'bunny-slippers':'/avatars/shoes/fitted/shoes-bunny-slippers-fitted.png',
  'grass-sneakers':'/avatars/shoes/fitted/shoes-grass-sneakers-fitted.png',
} as const;
export type ShoeId=keyof typeof maleShoes;
export function maleShoePath(id:string|null){return id&&id in maleShoes?maleShoes[id as ShoeId]:null;}

// Scale each foot around its own sole anchor so enlarging shoes preserves stance.
export const shoeFit:Record<string,{x:number;y:number}>={
  'black-high-tops':{x:1.08,y:1.08},
  'double-strap-sandals':{x:1.12,y:1.15},
  'blue-five-toe-shoes':{x:1.12,y:1.14},
  'bear-claw-slippers':{x:1.07,y:1.10},
  'cream-samba-sneakers':{x:1.10,y:1.12},
  'suede-clogs':{x:1.12,y:1.14},
  'gray-running-shoes':{x:1.09,y:1.12},
  'bunny-slippers':{x:1.06,y:1.06},
  'grass-sneakers':{x:1.09,y:1.12},
};
