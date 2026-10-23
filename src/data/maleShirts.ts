export const maleShirts={
  'green-shirt':'green','blue-shirt':'blue','black-shirt':'black','gray-shirt':'gray','navy-shirt':'navy','orange-shirt':'orange','pink-shirt':'pink','purple-shirt':'purple','red-shirt':'red','white-shirt':'white','yellow-shirt':'yellow',
} as const;
import type { ReferenceShirtId } from './referenceShirts';
export type ShirtId='starter'|keyof typeof maleShirts|ReferenceShirtId;
export function maleShirtPath(id:string){return id in maleShirts?`/avatars/shirts/fitted/${maleShirts[id as keyof typeof maleShirts]}.png`:null;}
