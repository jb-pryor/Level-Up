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
test('completion uses boosted XP for level gates and awards the unboosted level coin bonus once',()=>{
 let s=wear('tie-dye-tee');s={...s,player:{...s.player,totalXp:264}};
 s=gameReducer(s,{type:'add',questId:'meal'});s=gameReducer(s,{type:'complete',questId:'meal'});
 assert.equal(s.player.totalXp,301);assert.equal(s.player.coins,1000-35+10+25);assert.equal(s.notice.reward.xp,37);
 assert.strictEqual(gameReducer(s,{type:'complete',questId:'meal'}),s);
 let raw;savePlayer({setItem:(_,v)=>raw=v},s.player);assert.deepEqual(loadPlayer({getItem:()=>raw}).player,s.player);
});
test('coin boosts are reflected in actual balances and completion notices',()=>{
 let s=wear('built-different-tee');s=gameReducer(s,{type:'add',questId:'walk'});s=gameReducer(s,{type:'complete',questId:'walk'});
 assert.equal(s.player.coins,971);assert.equal(s.notice.reward.coins,6);assert.equal(s.player.totalXp,165);
});

test('rarity sets consistent whole-coin prices across both shops',()=>{
 assert.deepEqual(rarityPrices,{Uncommon:20,Rare:35,Epic:75,Legendary:100});
 for(const item of cosmetics){assert(item.rarity);assert.equal(item.price,rarityPrices[item.rarity]);}
});
