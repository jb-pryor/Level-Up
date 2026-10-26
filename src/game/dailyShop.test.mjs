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

import {dailyShopItems,selectDailyShopItems} from './dailyShop.ts';
import {cosmetics} from '../data/cosmetics.ts';
import {lootPool} from './loot.ts';

test('rotation has four distinct active daily items with three clothing slots and a fifty-fifty fourth slot',()=>{
 const pool=lootPool('female');
 for(const shoeRoll of [0,.499999,.5,.999999]){
  let call=0;const selection=selectDailyShopItems(pool,()=>call++===0?shoeRoll:.4);
  assert.equal(selection.length,4);assert.equal(new Set(selection.map(i=>i.id)).size,4);
  assert(selection.slice(0,3).every(i=>['shirt','pants'].includes(i.slot)));
  assert.equal(selection[3].slot==='shoes',shoeRoll<.5);
 }
});
test('stock is stable within a twelve-hour window and changes at reset for both avatars',()=>{
 const midnight=Date.parse('2026-10-25T00:00:00Z');
 for(const gender of ['male','female']){
  assert.deepEqual(dailyShopItems(midnight,gender),dailyShopItems(midnight+DAILY_SHOP_PERIOD_MS-1,gender));
  assert.notDeepEqual(dailyShopItems(midnight,gender),dailyShopItems(midnight+DAILY_SHOP_PERIOD_MS,gender));
  for(let window=0;window<500;window++){
   const items=dailyShopItems(midnight+window*DAILY_SHOP_PERIOD_MS,gender);
   assert.equal(items.length,4);assert.equal(new Set(items.map(i=>i.id)).size,4);
   assert(items.every(i=>!i.archived&&i.shop==='daily'&&(!i.maleOnly||gender==='male')));
  }
 }
});
test('every active daily item remains in loot even when absent from the four-item display',()=>{
 for(const gender of ['male','female']){
  const stock=dailyShopItems(Date.parse('2026-10-25T00:00:00Z'),gender);
  const pool=lootPool(gender);
  assert(pool.length>stock.length);
  for(const item of cosmetics.filter(i=>!i.archived&&i.shop==='daily'&&(!i.maleOnly||gender==='male')))assert(pool.some(i=>i.id===item.id));
  assert(pool.some(i=>!stock.some(s=>s.id===i.id)));
 }
});
test('future incomplete pools fill without duplicates when one clothing category is unavailable',()=>{
 const pool=lootPool('male');
 assert.equal(selectDailyShopItems([],()=>0).length,0);
 const clothing=pool.filter(i=>i.slot==='shirt').slice(0,4);
 assert.equal(selectDailyShopItems(clothing,()=>0).length,4);
 const shoes=pool.filter(i=>i.slot==='shoes').slice(0,1);
 assert.equal(selectDailyShopItems(shoes,()=>.9).length,1);
});
