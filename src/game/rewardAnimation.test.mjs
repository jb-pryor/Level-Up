import test from 'node:test';
import assert from 'node:assert/strict';
import { animatedXp } from './rewardAnimation.ts';
import { gameReducer, initialGame } from './gameReducer.ts';
import { defaultAppearance } from '../types.ts';
test('XP animation begins at existing progress and finishes at the exact reward total',()=>{
  assert.equal(animatedXp(35,70,0),35);assert.equal(animatedXp(35,70,.5),52.5);assert.equal(animatedXp(35,70,1),70);
});
test('a level-up fills and holds the old bar before rolling over with overflow',()=>{
  const held=animatedXp(70,105,.65);assert(held>99&&held<100);const after=animatedXp(70,105,.85);assert(after>=100&&after<=105);assert.equal(animatedXp(70,105,1),105);
});
test('completion provides the quest name, reward amounts and previous balances',()=>{
  let state=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Test'}});state=gameReducer(state,{type:'add',questId:'room'});state=gameReducer(state,{type:'complete',questId:'room'});assert.deepEqual(state.notice.reward,{questName:'Clean your room',xp:35,coins:10,previousXp:0,previousCoins:0});assert.strictEqual(gameReducer(state,{type:'complete',questId:'room'}),state);
});
