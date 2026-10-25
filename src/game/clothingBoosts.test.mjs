import test from 'node:test';
import assert from 'node:assert/strict';
import {cosmetics,rarityPrices} from '../data/cosmetics.ts';
import {maleShirts} from '../data/maleShirts.ts';
import {questReward} from './questReward.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {defaultAppearance} from '../types.ts';
import {savePlayer,loadPlayer} from './save.ts';
function start(){const state=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Boost test'}});return {...state,player:{...state.player,totalXp:150,coins:1000}};}
function wear(id){let s=gameReducer(start(),{type:'buy',itemId:id});return gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:id}});}
test('basic shirts show all colored tees first, then the two rare level-three shirts; remaining shirts are daily stock',()=>{
 const shirts=cosmetics.filter(c=>c.slot==='shirt'&&c.shop!=='daily');
 assert.deepEqual(shirts.slice(0,11).map(c=>c.id),Object.keys(maleShirts));
 assert(shirts.slice(0,11).every(c=>c.requiredLevel===2));
 assert.deepEqual(shirts.slice(11).map(c=>c.id),['tie-dye-tee','built-different-tee']);
 assert(shirts.slice(11).every(c=>c.requiredLevel===3&&c.rarity==='Rare'));
 assert(cosmetics.filter(c=>c.slot==='shirt'&&!shirts.includes(c)).every(c=>c.shop==='daily'&&c.requiredLevel>=3));
});
test('equipped boosts round up once and do not affect the other reward currency',()=>{
 assert.deepEqual(questReward(wear('tie-dye-tee').player,{xp:35,coins:10}),{xp:37,coins:10});
 assert.deepEqual(questReward(wear('built-different-tee').player,{xp:35,coins:10}),{xp:35,coins:11});
 assert.deepEqual(questReward(wear('built-different-tee').player,{xp:15,coins:5}),{xp:15,coins:6});
 assert.deepEqual(questReward(wear('tie-dye-tee').player,{xp:100,coins:20}),{xp:105,coins:20});
 assert.deepEqual(questReward(wear('built-different-tee').player,{xp:100,coins:20}),{xp:100,coins:21});
});
test('owning or previewing a shirt does not boost rewards; unequipping stops the boost',()=>{
 let s=gameReducer(start(),{type:'buy',itemId:'tie-dye-tee'});
 assert.deepEqual(questReward(s.player,{xp:35,coins:10}),{xp:35,coins:10});
 s=wear('tie-dye-tee');s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:'starter'}});
 assert.deepEqual(questReward(s.player,{xp:35,coins:10}),{xp:35,coins:10});
});
test('completion uses boosted XP for level gates and awards one loot box at the new level',()=>{
 let s=wear('tie-dye-tee');s={...s,player:{...s.player,totalXp:264}};
 s=gameReducer(s,{type:'add',questId:'meal'});s=gameReducer(s,{type:'complete',questId:'meal'});
 assert.equal(s.player.totalXp,301);assert.equal(s.player.lootBoxes,1);assert.equal(s.player.coins,1000-35+10);assert.equal(s.notice.reward.xp,37);
 assert.strictEqual(gameReducer(s,{type:'complete',questId:'meal'}),s);
 let raw;savePlayer({setItem:(_,v)=>raw=v},s.player);assert.deepEqual(loadPlayer({getItem:()=>raw}).player,s.player);
});
test('coin boosts are reflected in actual balances and completion notices',()=>{
 let s=wear('built-different-tee');s=gameReducer(s,{type:'add',questId:'walk'});s=gameReducer(s,{type:'complete',questId:'walk'});
 assert.equal(s.player.coins,971);assert.equal(s.notice.reward.coins,6);assert.equal(s.player.totalXp,165);
});

test('rarity sets consistent whole-coin prices across both shops',()=>{
 assert.deepEqual(rarityPrices,{Common:20,Rare:35,Epic:75,Legendary:100});
 for(const item of cosmetics){assert(item.rarity);assert.equal(item.price,rarityPrices[item.rarity]);}
});

test('daily rarity upgrades charge the new prices and apply both reward currencies correctly',()=>{
 const cases=[
  ['pacman-planets-tee','Legendary',100,40,12],
  ['metallica-tee','Legendary',100,42,10],
  ['worldwide-tee','Legendary',100,35,12],
  ['cloudscape-tee','Epic',75,40,10],
  ['cartoon-chaos-tee','Epic',75,38,11],
  ['neon-trip-tee','Epic',75,35,12],
  ['unique-panda-tee','Rare',35,37,10],
  ['green-skull-tee','Rare',35,35,11],
  ['take-it-slow-tee','Rare',35,37,11],
 ];
 for(const [id,rarity,price,xp,coins] of cases){
  let s=wear(id);const item=cosmetics.find(c=>c.id===id);
  assert.equal(item.rarity,rarity);assert.equal(item.price,price);assert.equal(item.shop,'daily');
  assert.equal(s.player.coins,1000-price);
  s=gameReducer(s,{type:'add',questId:'meal'});s=gameReducer(s,{type:'complete',questId:'meal'});
  assert.equal(s.player.totalXp,150+xp);assert.equal(s.player.coins,1000-price+coins);
  assert.equal(s.notice.reward.xp,xp);assert.equal(s.notice.reward.coins,coins);
  assert(Number.isInteger(s.player.coins));assert(Number.isInteger(s.player.totalXp));
 }
});
test('owning multiple upgraded shirts does not stack unequipped bonuses',()=>{
 let s=wear('metallica-tee');
 for(const id of ['worldwide-tee','cartoon-chaos-tee','pacman-planets-tee'])s=gameReducer(s,{type:'buy',itemId:id});
 assert.deepEqual(questReward(s.player,{xp:60,coins:20}),{xp:72,coins:20});
 s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:'pacman-planets-tee'}});
 assert.deepEqual(questReward(s.player,{xp:60,coins:20}),{xp:68,coins:23});
});

test('pants rarity boosts apply to completions and add with the equipped shirt before rounding',()=>{
 const cases=[['lightwash-jeans',37,10],['darkwash-jeans',35,11],['tan-carpenter-pants',37,11],['camo-pants',40,10],['zebra-pants',35,12],['leather-pants',40,12]];
 for(const [id,xp,coins] of cases){
  let s=gameReducer(start(),{type:'buy',itemId:id});s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,pants:id}});
  const before=s.player.coins;s=gameReducer(s,{type:'add',questId:'meal'});s=gameReducer(s,{type:'complete',questId:'meal'});
  assert.equal(s.player.totalXp,150+xp);assert.equal(s.player.coins,before+coins);assert.equal(s.notice.reward.xp,xp);assert.equal(s.notice.reward.coins,coins);
 }
 let s=wear('tie-dye-tee');s=gameReducer(s,{type:'buy',itemId:'leather-pants'});s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,pants:'leather-pants'}});
 assert.deepEqual(questReward(s.player,{xp:35,coins:10}),{xp:41,coins:12});
 s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,pants:'starter'}});assert.deepEqual(questReward(s.player,{xp:35,coins:10}),{xp:37,coins:10});
});

test('completion receipts retain base rewards and the exact rounded gear bonuses',()=>{
 let s=wear('metallica-tee');s=gameReducer(s,{type:'buy',itemId:'leather-pants'});s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,pants:'leather-pants'}});
 s=gameReducer(s,{type:'add',questId:'gym'});s=gameReducer(s,{type:'complete',questId:'gym'});
 const receipt=s.notice.reward;
 assert.equal(receipt.baseXp,60);assert.equal(receipt.baseCoins,20);
 assert.equal(receipt.xp,80);assert.equal(receipt.coins,23);
 assert.equal(receipt.xp-receipt.baseXp,20);assert.equal(receipt.coins-receipt.baseCoins,3);
 assert.equal(s.player.totalXp,receipt.previousXp+receipt.xp);
 assert.equal(s.player.coins,receipt.previousCoins+receipt.coins);
 // Later outfit changes cannot recalculate the completed quest's receipt.
 s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:'starter',pants:'starter'}});
 assert.equal(receipt.xp,80);assert.equal(receipt.baseXp,60);
});
