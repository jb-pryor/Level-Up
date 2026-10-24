import test from 'node:test';
import assert from 'node:assert/strict';
import { gameReducer, initialGame } from './gameReducer.ts';
import { levelFor, xpIntoLevel } from './progression.ts';
import { defaultAppearance } from '../types.ts';
const create=()=>gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'James'}});
function complete(state,id){const now=Math.max(Date.now(),...Object.values(state.player.questCooldowns));return gameReducer(gameReducer(state,{type:'add',questId:id,now}),{type:'complete',questId:id,now});}
function firstLevel(){return ['dishes','room','laundry'].reduce(complete,create());}

test('three ordinary quests reach level 2, 55 overflow XP and 55 coins including level bonus',()=>{
  const state=firstLevel();assert.equal(state.player.totalXp,105);assert.equal(levelFor(state.player.totalXp),2);assert.equal(xpIntoLevel(state.player.totalXp),55);assert.equal(state.player.coins,55);assert.deepEqual(state.player.activeQuestIds,[]);
});
test('duplicate add and repeated completion do not duplicate rewards',()=>{
  let s=gameReducer(create(),{type:'add',questId:'dishes'});s=gameReducer(s,{type:'add',questId:'dishes'});assert.equal(s.notice.message,'Quest already in your daily quests!');assert.deepEqual(s.player.activeQuestIds,['dishes']);s=gameReducer(s,{type:'complete',questId:'dishes'});assert.strictEqual(gameReducer(s,{type:'complete',questId:'dishes'}),s);assert.equal(s.player.coins,10);
});
test('delete earns no reward; deleted and completed quests can be added again',()=>{
  let s=gameReducer(create(),{type:'add',questId:'room'});s=gameReducer(s,{type:'delete',questId:'room'});assert.equal(s.player.totalXp,0);assert.equal(s.player.coins,0);s=complete(s,'room');s=complete(s,'room');assert.equal(s.player.totalXp,70);assert.equal(s.player.coins,45);
});
test('purchase deducts coins once, preserves XP, and does not auto-equip',()=>{
  let s=gameReducer(firstLevel(),{type:'buy',itemId:'green-shirt'});assert.equal(s.player.coins,25);assert.equal(s.player.totalXp,105);assert.deepEqual(s.player.ownedItemIds,['green-shirt']);assert.equal(s.player.equipped.shirt,'starter');s=gameReducer(s,{type:'buy',itemId:'green-shirt'});assert.equal(s.player.coins,25);assert.equal(s.player.ownedItemIds.length,1);
});
test('locked and unaffordable items cannot charge coins',()=>{
  const starting=create();const locked=gameReducer(starting,{type:'buy',itemId:'green-shirt'});assert.strictEqual(locked.player,starting.player);const leveled=firstLevel();const blue=gameReducer(leveled,{type:'buy',itemId:'blue-shirt'});assert.strictEqual(blue.player,leveled.player);const lowFunds={...leveled,player:{...leveled.player,coins:0}};const poor=gameReducer(lowFunds,{type:'buy',itemId:'sneakers'});assert.strictEqual(poor.player,lowFunds.player);assert.match(poor.notice.message,/Not enough/);
});
test('only owned items in their matching slots can be equipped',()=>{
  const s=firstLevel();const unowned=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:'green-shirt'}});assert.strictEqual(unowned.player,s.player);const bought=gameReducer(s,{type:'buy',itemId:'green-shirt'});const worn=gameReducer(bought,{type:'equip',outfit:{...bought.player.equipped,shirt:'green-shirt'}});assert.equal(worn.player.equipped.shirt,'green-shirt');assert.equal(worn.player.coins,25);const wrong=gameReducer(bought,{type:'equip',outfit:{...bought.player.equipped,pants:'green-shirt'}});assert.strictEqual(wrong.player,bought.player);
});
test('editing character preserves progress, quests, ownership and equipment',()=>{
  let s=gameReducer(firstLevel(),{type:'buy',itemId:'green-shirt'});s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:'green-shirt'}});s=gameReducer(s,{type:'add',questId:'gym'});const changed=gameReducer(s,{type:'edit',appearance:{...defaultAppearance,name:'New name',gender:'female',bodyId:'base-b',hairStyleId:'long'}});for(const field of ['totalXp','coins','activeQuestIds','ownedItemIds','equipped'])assert.deepEqual(changed.player[field],s.player[field]);assert.equal(changed.player.name,'New name');assert.equal(changed.player.bodyId,'base-b');
});
test('unknown IDs and blank names cannot mutate player progress',()=>{
  const s=create();for(const action of [{type:'add',questId:'missing'},{type:'buy',itemId:'missing'},{type:'edit',appearance:{...defaultAppearance,name:' '}}])assert.strictEqual(gameReducer(s,action).player,s.player);assert.equal(gameReducer(initialGame,{type:'create',appearance:defaultAppearance}).player,null);
});
test('a larger reward can cross a level and retains all overflow',()=>{
  let s=complete(create(),'gym');s=complete(s,'gym');assert.equal(s.player.totalXp,120);assert.equal(levelFor(s.player.totalXp),2);assert.equal(xpIntoLevel(s.player.totalXp),70);assert.equal(s.player.coins,65);
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

test('skill counts increase only for completed occurrences and stay separate for each quest',()=>{
  let s=create();
  for(let i=0;i<8;i++)s=complete(s,'dishes');
  assert.equal(s.player.questCompletions.dishes,8);
  const repeated=gameReducer(s,{type:'complete',questId:'dishes'});
  assert.equal(repeated.player.questCompletions.dishes,8);
  s=gameReducer(s,{type:'add',questId:'room'});
  s=gameReducer(s,{type:'delete',questId:'room'});
  assert.equal(s.player.questCompletions.room,undefined);
  s=complete(s,'room');
  assert.deepEqual(s.player.questCompletions,{dishes:8,room:1});
});

test('favorites stay saved independently of active quests and can be re-added after completion',()=>{
  let s=gameReducer(create(),{type:'favorite',questId:'dishes'});
  assert.deepEqual(s.player.favoriteQuestIds,['dishes']);assert.equal(s.player.coins,0);
  s=complete(s,'dishes');assert.deepEqual(s.player.favoriteQuestIds,['dishes']);assert.deepEqual(s.player.activeQuestIds,[]);
  s=gameReducer(s,{type:'add',questId:'dishes',now:s.player.questCooldowns.dishes});assert.deepEqual(s.player.activeQuestIds,['dishes']);
  s=gameReducer(s,{type:'favorite',questId:'dishes'});assert.deepEqual(s.player.favoriteQuestIds,[]);assert.deepEqual(s.player.activeQuestIds,['dishes']);
});

test('reordering moves active quests only and never awards or changes other progress',()=>{
  let s=create();for(const questId of ['dishes','room','laundry'])s=gameReducer(s,{type:'add',questId});
  const moved=gameReducer(s,{type:'reorder',questId:'laundry',targetId:'dishes',after:false});
  assert.deepEqual(moved.player.activeQuestIds,['laundry','dishes','room']);
  for(const field of ['coins','totalXp','questCompletions','favoriteQuestIds'])assert.deepEqual(moved.player[field],s.player[field]);
  const down=gameReducer(moved,{type:'reorder',questId:'laundry',targetId:'room',after:true});assert.deepEqual(down.player.activeQuestIds,['dishes','room','laundry']);
  assert.strictEqual(gameReducer(s,{type:'reorder',questId:'missing',targetId:'room',after:false}),s);
});

test('confirmed reset discards all player state and allows fresh character creation',()=>{
  const reset=gameReducer(firstLevel(),{type:'reset-player'});
  assert.deepEqual(reset,initialGame);
  const fresh=gameReducer(reset,{type:'create',appearance:{...defaultAppearance,name:'Fresh'}});
  assert.equal(fresh.player.totalXp,0);assert.equal(fresh.player.coins,0);
  assert.deepEqual(fresh.player.ownedItemIds,[]);assert.deepEqual(fresh.player.questCompletions,{});
});

test('favorite limit blocks a third addition but allows removing and replacing favorites',()=>{
  let s=create();for(const questId of ['dishes','room'])s=gameReducer(s,{type:'favorite',questId});
  assert.equal(s.player.favoriteQuestIds.length,2);
  assert.strictEqual(gameReducer(s,{type:'favorite',questId:'walk'}),s);
  s=gameReducer(s,{type:'favorite',questId:'room'});
  s=gameReducer(s,{type:'favorite',questId:'walk'});
  assert.deepEqual(s.player.favoriteQuestIds,['dishes','walk']);
});

test('every supplied shirt can be bought and equipped on either body without losing ownership',()=>{
  for(const color of ['green','blue','black','gray','navy','orange','pink','purple','red','white','yellow']){
    let s=firstLevel();s={...s,player:{...s.player,totalXp:500,coins:500}};
    const id=`${color}-shirt`;s=gameReducer(s,{type:'buy',itemId:id});assert(s.player.ownedItemIds.includes(id));
    s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:id}});assert.equal(s.player.equipped.shirt,id);
    if(!['green','blue'].includes(color)){
      const female=gameReducer(s,{type:'edit',appearance:{...defaultAppearance,name:'Test',gender:'female',bodyId:'base-b'}});
      assert.equal(female.player.equipped.shirt,id);assert(female.player.ownedItemIds.includes(id));
      const blocked=gameReducer(female,{type:'equip',outfit:{...female.player.equipped,shirt:id}});assert.equal(blocked.player.equipped.shirt,id);
    }
  }
});

test('sneaker purchase supports equip and barefoot without altering other outfit slots',()=>{
  let s=firstLevel();s=gameReducer(s,{type:'buy',itemId:'sneakers'});
  assert.equal(s.player.coins,15);assert(s.player.ownedItemIds.includes('sneakers'));
  const original=s.player.equipped;
  s=gameReducer(s,{type:'equip',outfit:{...original,shoes:'sneakers'}});assert.equal(s.player.equipped.shoes,'sneakers');
  assert.equal(s.player.equipped.shirt,original.shirt);assert.equal(s.player.equipped.pants,original.pants);
  s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shoes:null}});assert.equal(s.player.equipped.shoes,null);
  assert(s.player.ownedItemIds.includes('sneakers'));
});

test('all new shoe styles stay owned and equipped when changing to the female body',()=>{
  for(const id of ['black-red-shoes','black-white-shoes','blue-white-shoes','brown-shoes','green-yellow-shoes']){
    let s=firstLevel();s=gameReducer(s,{type:'buy',itemId:id});assert.equal(s.player.coins,15);assert(s.player.ownedItemIds.includes(id));
    s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shoes:id}});assert.equal(s.player.equipped.shoes,id);
    const female=gameReducer(s,{type:'edit',appearance:{...defaultAppearance,name:'Test',gender:'female',bodyId:'base-b'}});
    assert.equal(female.player.equipped.shoes,id);assert(female.player.ownedItemIds.includes(id));
    assert.equal(gameReducer(female,{type:'equip',outfit:{...female.player.equipped,shoes:id}}).player.equipped.shoes,id);
    let freshFemale=gameReducer(create(),{type:'edit',appearance:{...defaultAppearance,name:'Test',gender:'female',bodyId:'base-b'}});
    freshFemale={...freshFemale,player:{...freshFemale.player,totalXp:500,coins:500}};
    assert(gameReducer(freshFemale,{type:'buy',itemId:id}).player.ownedItemIds.includes(id));
  }
});
