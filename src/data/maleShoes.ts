export const maleSneakersPath='/avatars/shoes/male-sneakers-fitted.png';
export const maleShoes={
  sneakers:maleSneakersPath,
  'black-red-shoes':'/avatars/shoes/fitted/black-red-shoes.png',
  'black-white-shoes':'/avatars/shoes/fitted/black-white-shoes.png',
  'blue-white-shoes':'/avatars/shoes/fitted/blue-white-shoes.png',
  'brown-shoes':'/avatars/shoes/fitted/brown-shoes.png',
  'green-yellow-shoes':'/avatars/shoes/fitted/green-yellow-shoes.png',
} as const;
export type ShoeId=keyof typeof maleShoes;
export function maleShoePath(id:string|null){return id&&id in maleShoes?maleShoes[id as ShoeId]:null;}
