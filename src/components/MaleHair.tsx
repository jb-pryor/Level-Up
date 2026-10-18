import type { Appearance } from '../types';
export function MaleHair({color}:{color:Appearance['hairColorId']}){
  return <svg className="avatar-hair-overlay" viewBox="0 0 1024 1536" aria-hidden="true"><image href={`/avatars/hair/newHair/fitted/${color}.png`} x="0" y="-120" width="1024" height="1800"/></svg>;
}
