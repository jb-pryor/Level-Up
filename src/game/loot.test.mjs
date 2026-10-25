import test from 'node:test';
import assert from 'node:assert/strict';
import {cosmetics} from '../data/cosmetics.ts';
import {defaultAppearance} from '../types.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {lootPool,rollLootBox,lootCoinRewards} from './loot.ts';
import {loadPlayer,savePlayer,validPlayer} from './save.ts';
import {readCache,cloudPlayer} from './accountSave.ts';
function start(boxes=1){const s=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Loot tester'}});return {...s,player:{...s.player,lootBoxes:boxes}};}
const roll=(itemId='metallica-tee',coins=25,sellPercent=75)=>({id:'11111111-1111-4111-8111-111111111111',itemId,coins,sellPercent});
function roundTrip(player){let raw;assert(savePlayer({setItem:(_,v)=>raw=v},player));const result=loadPlayer({getItem:()=>raw});assert.equal(result.status,'ready');assert.deepEqual(result.player,player);return result.player;}

test('level-up awards a saved box instead of 25 coins and repeat completion cannot award again',()=>{
 let s=start(0);s={...s,player:{...s.player,totalXp:40}};
 s=gameReducer(s,{type:'add',questId:'walk'});s=gameReducer(s,{type:'complete',questId:'walk'});
 assert.equal(s.player.totalXp,55);assert.equal(s.player.coins,5);assert.equal(s.player.lootBoxes,1);
 assert.strictEqual(gameReducer(s,{type:'complete',questId:'walk'}),s);roundTrip(s.player);
 for(const questId of ['meal','gym']){s=gameReducer(s,{type:'add',questId});s=gameReducer(s,{type:'complete',questId});}
 assert.equal(s.player.totalXp,150);assert.equal(s.player.lootBoxes,2);assert.equal(s.player.coins,35);
});
test('each eligible daily item has one equally sized roll interval, including already-owned items',()=>{
 for(const gender of ['male','female']){
  const s=start();s.player.gender=gender;s.player.bodyId=gender==='male'?'base-a':'base-b';
  const pool=lootPool(gender);assert(pool.length>0);assert(pool.every(c=>c.shop==='daily'&&(!c.maleOnly||gender==='male')));
  for(let i=0;i<pool.length;i++){
   let n=0;const values=[(i+.5)/pool.length,.999,.999];
   const reward=rollLootBox(s.player,()=>values[n++]);assert.equal(reward.itemId,pool[i].id);assert.equal(reward.coins,35);assert.equal(reward.sellPercent,75);
  }
 }
});
test('coin rolls cover only the five requested amounts and quicksell endpoints',()=>{
 for(let i=0;i<5;i++){
  let n=0;const values=[0,(i+.5)/5,0];const reward=rollLootBox(start().player,()=>values[n++]);assert.equal(reward.coins,lootCoinRewards[i]);assert.equal(reward.sellPercent,50);
 }
});
test('opening consumes one box, immediately saves coins/item, and locks the roll until claimed',()=>{
 let s=gameReducer(start(2),{type:'open-loot',roll:roll()});
 assert.equal(s.player.lootBoxes,1);assert.equal(s.player.coins,25);assert(s.player.ownedItemIds.includes('metallica-tee'));assert(s.player.newItemIds.includes('metallica-tee'));assert.equal(s.player.lootReveal.duplicate,false);
 assert.strictEqual(gameReducer(s,{type:'open-loot',roll:roll('cloudscape-tee')}),s);
 s={...s,player:roundTrip(s.player)};
 assert.strictEqual(gameReducer(s,{type:'open-loot',roll:roll('worldwide-tee')}),s);
 s=gameReducer(s,{type:'claim-loot',id:roll().id,equip:true});assert.equal(s.player.equipped.shirt,'metallica-tee');assert.equal(s.player.lootReveal,null);assert.equal(s.player.coins,25);assert.equal(s.player.lootBoxes,1);
});
test('duplicates quicksell once for a saved percentage/value and do not delete existing clothing',()=>{
 for(const percent of [50,63,75]){
  let s=start();s.player.ownedItemIds=['metallica-tee'];s.player.equipped.shirt='metallica-tee';
  s=gameReducer(s,{type:'open-loot',roll:roll('metallica-tee',15,percent)});
  assert.equal(s.player.lootReveal.duplicate,true);assert.equal(s.player.coins,15);assert.equal(s.player.lootReveal.itemValue,100);
  assert.equal(s.player.ownedItemIds.length,1);assert.equal(s.player.newItemIds.length,0);
  s={...s,player:roundTrip(s.player)};
  const paid=gameReducer(s,{type:'claim-loot',id:roll().id,sell:true});assert.equal(paid.player.coins,15+Math.ceil(100*percent/100));assert.equal(paid.player.equipped.shirt,'metallica-tee');assert(paid.player.ownedItemIds.includes('metallica-tee'));
  assert.strictEqual(gameReducer(paid,{type:'claim-loot',id:roll().id,sell:true}),paid);
 }
});
test('quicksell rounds fractional rare prices and new items cannot be sold as duplicates',()=>{
 let s=start();s.player.ownedItemIds=['unique-panda-tee'];s=gameReducer(s,{type:'open-loot',roll:roll('unique-panda-tee',20,75)});assert.equal(s.player.lootReveal.sellCoins,27);
 const fresh=gameReducer(start(),{type:'open-loot',roll:roll('unique-panda-tee',20,75)});const claimed=gameReducer(fresh,{type:'claim-loot',id:roll().id,sell:true});assert.equal(claimed.player.coins,20);assert(claimed.player.ownedItemIds.includes('unique-panda-tee'));
});
test('empty inventories, forged roll ranges and unrelated items cannot create loot',()=>{
 assert.strictEqual(gameReducer(start(0),{type:'open-loot',roll:roll()} ).player.lootReveal,null);
 const s=start();
 for(const r of [roll('missing'),roll('green-shirt'),roll('metallica-tee',100),roll('metallica-tee',25,90),{...roll(),id:'bad'}])assert.strictEqual(gameReducer(s,{type:'open-loot',roll:r}),s);
 const opened=gameReducer(s,{type:'open-loot',roll:roll()});assert.strictEqual(gameReducer(opened,{type:'claim-loot',id:'wrong',sell:true}),opened);
});
test('older local/cloud/account-cache saves get zero boxes without retroactive rewards',()=>{
 const legacy={...start(0).player,totalXp:1000};delete legacy.lootBoxes;delete legacy.lootReveal;
 const local=loadPlayer({getItem:()=>JSON.stringify({schemaVersion:1,player:legacy})});assert.equal(local.status,'ready');assert.equal(local.player.lootBoxes,0);assert.equal(local.player.lootReveal,null);assert.equal(local.player.totalXp,1000);
 const cloud=cloudPlayer({schema_version:1,revision:1,player:legacy,mutation_id:'m'});assert.deepEqual(cloud,local.player);
 const cache=readCache(JSON.stringify({userId:'u',revision:1,player:legacy,dirty:false,mutationId:'m'}),'u');assert.deepEqual(cache.player,local.player);
});
test('pending reveals round-trip through cloud/cache and malformed loot saves are rejected',()=>{
 const player=gameReducer(start(),{type:'open-loot',roll:roll()}).player;
 assert.deepEqual(cloudPlayer({schema_version:1,revision:1,player,mutation_id:'m'}),player);
 for(const patch of [{lootBoxes:-1},{lootBoxes:1.5},{lootReveal:{...player.lootReveal,sellCoins:999}},{lootReveal:{...player.lootReveal,itemValue:-1}},{lootReveal:{...player.lootReveal,duplicate:'yes'}}])assert.equal(validPlayer({...player,...patch}),false);
});
test('quicksell preserves its rolled value even if item pricing changes later',()=>{
 let s=start();s.player.ownedItemIds=['metallica-tee'];s=gameReducer(s,{type:'open-loot',roll:roll()});
 const item=cosmetics.find(c=>c.id==='metallica-tee'),price=item.price;
 try{item.price=200;roundTrip(s.player);const claimed=gameReducer(s,{type:'claim-loot',id:roll().id,sell:true});assert.equal(claimed.player.coins,100);}finally{item.price=price;}
});
