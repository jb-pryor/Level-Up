import test from 'node:test';
import assert from 'node:assert/strict';
import { gameReducer, initialGame } from './gameReducer.ts';
import { levelFor, xpIntoLevel } from './progression.ts';
import { defaultAppearance } from '../types.ts';
const create=()=>gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'James'}});
function complete(state,id){return gameReducer(gameReducer(state,{type:'add',questId:id}),{type:'complete',questId:id});}
function firstLevel(){return ['dishes','room','laundry'].reduce(complete,create());}

test('three ordinary quests reach level 2, 5 overflow XP and 30 coins',()=>{
  const state=firstLevel();assert.equal(state.player.totalXp,105);assert.equal(levelFor(state.player.totalXp),2);assert.equal(xpIntoLevel(state.player.totalXp),5);assert.equal(state.player.coins,30);assert.deepEqual(state.player.activeQuestIds,[]);assert.match(state.notice.message,/LEVEL UP/);
});
test('duplicate add and repeated completion do not duplicate rewards',()=>{
  let s=gameReducer(create(),{type:'add',questId:'dishes'});s=gameReducer(s,{type:'add',questId:'dishes'});assert.equal(s.notice.message,'Quest already in your daily quests!');assert.deepEqual(s.player.activeQuestIds,['dishes']);s=gameReducer(s,{type:'complete',questId:'dishes'});assert.strictEqual(gameReducer(s,{type:'complete',questId:'dishes'}),s);assert.equal(s.player.coins,10);
});
test('delete earns no reward; deleted and completed quests can be added again',()=>{
  let s=gameReducer(create(),{type:'add',questId:'room'});s=gameReducer(s,{type:'delete',questId:'room'});assert.equal(s.player.totalXp,0);assert.equal(s.player.coins,0);s=complete(s,'room');s=complete(s,'room');assert.equal(s.player.totalXp,70);assert.equal(s.player.coins,20);
});
test('purchase deducts coins once, preserves XP, and does not auto-equip',()=>{
  let s=gameReducer(firstLevel(),{type:'buy',itemId:'green-shirt'});assert.equal(s.player.coins,0);assert.equal(s.player.totalXp,105);assert.deepEqual(s.player.ownedItemIds,['green-shirt']);assert.equal(s.player.equipped.shirt,'starter');s=gameReducer(s,{type:'buy',itemId:'green-shirt'});assert.equal(s.player.coins,0);assert.equal(s.player.ownedItemIds.length,1);
});
test('locked and unaffordable items cannot charge coins',()=>{
  const starting=create();const locked=gameReducer(starting,{type:'buy',itemId:'green-shirt'});assert.strictEqual(locked.player,starting.player);const leveled=firstLevel();const blue=gameReducer(leveled,{type:'buy',itemId:'blue-shirt'});assert.strictEqual(blue.player,leveled.player);const poor=gameReducer(leveled,{type:'buy',itemId:'sneakers'});assert.strictEqual(poor.player,leveled.player);assert.match(poor.notice.message,/Not enough/);
});
test('only owned items in their matching slots can be equipped',()=>{
  const s=firstLevel();const unowned=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:'green-shirt'}});assert.strictEqual(unowned.player,s.player);const bought=gameReducer(s,{type:'buy',itemId:'green-shirt'});const worn=gameReducer(bought,{type:'equip',outfit:{...bought.player.equipped,shirt:'green-shirt'}});assert.equal(worn.player.equipped.shirt,'green-shirt');assert.equal(worn.player.coins,0);const wrong=gameReducer(bought,{type:'equip',outfit:{...bought.player.equipped,pants:'green-shirt'}});assert.strictEqual(wrong.player,bought.player);
});
test('editing character preserves progress, quests, ownership and equipment',()=>{
  let s=gameReducer(firstLevel(),{type:'buy',itemId:'green-shirt'});s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:'green-shirt'}});s=gameReducer(s,{type:'add',questId:'gym'});const changed=gameReducer(s,{type:'edit',appearance:{...defaultAppearance,name:'New name',gender:'female',bodyId:'base-b',hairStyleId:'long'}});for(const field of ['totalXp','coins','activeQuestIds','ownedItemIds','equipped'])assert.deepEqual(changed.player[field],s.player[field]);assert.equal(changed.player.name,'New name');assert.equal(changed.player.bodyId,'base-b');
});
test('unknown IDs and blank names cannot mutate player progress',()=>{
  const s=create();for(const action of [{type:'add',questId:'missing'},{type:'buy',itemId:'missing'},{type:'edit',appearance:{...defaultAppearance,name:' '}}])assert.strictEqual(gameReducer(s,action).player,s.player);assert.equal(gameReducer(initialGame,{type:'create',appearance:defaultAppearance}).player,null);
});
test('a larger reward can cross a level and retains all overflow',()=>{
  let s=complete(create(),'gym');s=complete(s,'gym');assert.equal(s.player.totalXp,120);assert.equal(levelFor(s.player.totalXp),2);assert.equal(xpIntoLevel(s.player.totalXp),20);assert.equal(s.player.coins,40);
});

test('new purchases accumulate until opening the wardrobe; closing and equipping retain the count',()=>{
  let s=firstLevel();s={...s,player:{...s.player,coins:200}};
  s=gameReducer(s,{type:'buy',itemId:'green-shirt'});
  assert.equal(s.notice.purchaseItemId,'green-shirt');
  s=gameReducer(s,{type:'clear-notice'});
  assert.deepEqual(s.player.newItemIds,['green-shirt']);
  s=gameReducer(s,{type:'buy',itemId:'dark-pants'});
  assert.deepEqual(s.player.newItemIds,['green-shirt','dark-pants']);
  const duplicate=gameReducer(s,{type:'buy',itemId:'dark-pants'});
  assert.deepEqual(duplicate.player.newItemIds,s.player.newItemIds);
  assert.equal(duplicate.notice.purchaseItemId,undefined);
  s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:'green-shirt'}});
  assert.equal(s.player.newItemIds.length,2);
  const seen=gameReducer(s,{type:'open-wardrobe'});
  assert.deepEqual(seen.player.newItemIds,[]);
  assert.deepEqual(seen.player.ownedItemIds,s.player.ownedItemIds);
  assert.deepEqual(seen.player.equipped,s.player.equipped);
  assert.equal(seen.player.coins,s.player.coins);
  assert.equal(seen.notice,null);
});
