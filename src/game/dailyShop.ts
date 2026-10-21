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
