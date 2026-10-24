import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyShopResetAt,dailyShopCountdown,DAILY_SHOP_PERIOD_MS,DAILY_SHOP_UNLOCK_LEVEL} from './dailyShop.ts';
import {levelFor} from './progression.ts';
test('daily shop unlocks at level 3, starting at 150 total XP',()=>{
  assert(levelFor(149)<DAILY_SHOP_UNLOCK_LEVEL);assert(levelFor(150)>=DAILY_SHOP_UNLOCK_LEVEL);
});
test('daily shop uses shared twelve-hour resets that do not restart on opening or refreshing',()=>{
  const midnight=Date.parse('2026-10-19T00:00:00Z'),noon=midnight+DAILY_SHOP_PERIOD_MS;
  assert.equal(dailyShopResetAt(midnight),noon);assert.equal(dailyShopResetAt(midnight+3600000),noon);
  assert.equal(dailyShopCountdown(midnight),'12:00:00');assert.equal(dailyShopCountdown(midnight+3600000),'11:00:00');
  assert.equal(dailyShopCountdown(noon-1000),'00:00:01');assert.equal(dailyShopCountdown(noon),'12:00:00');
  assert.equal(dailyShopResetAt(noon),midnight+2*DAILY_SHOP_PERIOD_MS);
});
