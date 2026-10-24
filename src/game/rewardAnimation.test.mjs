import test from 'node:test';
import assert from 'node:assert/strict';
import { animatedXp } from './rewardAnimation.ts';
import { gameReducer, initialGame } from './gameReducer.ts';
import { defaultAppearance } from '../types.ts';
test('XP animation begins at existing progress and finishes at the exact reward total',()=>{
  assert.equal(animatedXp(55,90,0),55);assert.equal(animatedXp(55,90,.5),72.5);assert.equal(animatedXp(55,90,1),90);
});
test('a level-up fills and holds the old bar before rolling over with overflow',()=>{
  const held=animatedXp(125,160,.65);assert(held>149&&held<150);const after=animatedXp(125,160,.85);assert(after>=150&&after<=160);assert.equal(animatedXp(125,160,1),160);
});
test('completion provides the quest name, reward amounts and previous balances',()=>{
  let state=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Test'}});state=gameReducer(state,{type:'add',questId:'room'});state=gameReducer(state,{type:'complete',questId:'room'});assert.deepEqual(state.notice.reward,{questName:'Clean your room',xp:35,coins:10,previousXp:0,previousCoins:0});assert.strictEqual(gameReducer(state,{type:'complete',questId:'room'}),state);
});
