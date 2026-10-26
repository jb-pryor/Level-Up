import {cosmetics} from '../data/cosmetics.ts';
import type {Cosmetic,Player} from '../types.ts';
export const DAILY_SHOP_UNLOCK_LEVEL=3;
export const DAILY_SHOP_PERIOD_MS=12*60*60*1000;
// Shared UTC midnight/noon boundaries stay consistent across reloads and devices.
export function dailyShopResetAt(now:number):number {
  return (Math.floor(now/DAILY_SHOP_PERIOD_MS)+1)*DAILY_SHOP_PERIOD_MS;
}
export function dailyShopCountdown(now:number):string {
  const seconds=Math.max(0,Math.ceil((dailyShopResetAt(now)-now)/1000));
  return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
}

// Seeded rotations give everyone the same selection throughout a reset window;
// refreshing, buying an item, or reopening the shop never rerolls the stock.
function rotationRandom(window:number){
  let seed=(window^0x6c657665)>>>0;
  return ()=>{
    seed=(seed+0x6D2B79F5)>>>0;
    let value=Math.imul(seed^(seed>>>15),1|seed);
    value^=value+Math.imul(value^(value>>>7),61|value);
    return ((value^(value>>>14))>>>0)/4294967296;
  };
}

export function selectDailyShopItems(pool:readonly Cosmetic[],random:()=>number):Cosmetic[]{
  const clothing=pool.filter(item=>item.slot==='shirt'||item.slot==='pants');
  const shoes=pool.filter(item=>item.slot==='shoes');
  const wantsShoes=random()<.5;
  const take=(items:Cosmetic[])=>items.splice(Math.floor(random()*items.length),1)[0];
  const selected:Cosmetic[]=[];
  for(let i=0;i<3&&clothing.length;i++)selected.push(take(clothing));
  const fourth=wantsShoes&&shoes.length?shoes:clothing.length?clothing:shoes;
  if(fourth.length)selected.push(take(fourth));
  return selected;
}

export function dailyShopItems(now:number,gender:Player['gender']):Cosmetic[]{
  const pool=cosmetics.filter(item=>!item.archived&&item.shop==='daily'&&(!item.maleOnly||gender==='male'));
  return selectDailyShopItems(pool,rotationRandom(Math.floor(now/DAILY_SHOP_PERIOD_MS)));
}
