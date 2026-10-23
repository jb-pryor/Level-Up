import { useId } from 'react';
import type { Appearance } from '../types';
export function MaleHair({color,female=false,hat=false}:{color:Appearance['hairColorId'];female?:boolean;hat?:boolean}){
  const id=useId().replace(/[^a-zA-Z0-9]/g,'');
  return <svg className="avatar-hair-overlay" viewBox="0 0 1024 1536" aria-hidden="true"><defs><clipPath id={`${id}-hat`}><rect x="0" y="115" width="1024" height="1421"/></clipPath></defs><g clipPath={hat?`url(#${id}-hat)`:undefined}><g transform={female?'translate(82 8) scale(.84)':undefined}><image href={`/avatars/hair/newHair/fitted/${color}.png`} x="0" y="-120" width="1024" height="1800"/></g></g></svg>;
}
