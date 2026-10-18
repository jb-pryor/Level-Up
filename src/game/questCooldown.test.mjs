import test from 'node:test';
import assert from 'node:assert/strict';
import {gameReducer,initialGame} from './gameReducer.ts';
import {defaultAppearance} from '../types.ts';
import {HOME_COOLDOWN_MS,formatCooldown} from './questCooldown.ts';
const create=()=>gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Test'}});
function complete(s,id,now){return gameReducer(gameReducer(s,{type:'add',questId:id,now}),{type:'complete',questId:id,now})}
test('home completion starts 12 hours, blocks re-add until exact expiry, and repeated completion does not extend timer',()=>{
  const now=100000,s=complete(create(),'dishes',now),expiry=now+HOME_COOLDOWN_MS;
  assert.equal(s.player.questCooldowns.dishes,expiry);
  const blocked=gameReducer(s,{type:'add',questId:'dishes',now:expiry-1});assert.strictEqual(blocked.player,s.player);
  assert.strictEqual(gameReducer(s,{type:'complete',questId:'dishes',now:now+2000}),s);
  const ready=gameReducer(s,{type:'add',questId:'dishes',now:expiry});assert.deepEqual(ready.player.activeQuestIds,['dishes']);
  assert.equal(ready.player.coins,s.player.coins);
});
test('delete starts no timer; health and social remain immediately repeatable',()=>{
  let s=gameReducer(create(),{type:'add',questId:'room',now:1});s=gameReducer(s,{type:'delete',questId:'room',now:1});assert.deepEqual(s.player.questCooldowns,{});
  s=gameReducer(s,{type:'add',questId:'room',now:1});assert.deepEqual(s.player.activeQuestIds,['room']);
  for(const id of ['gym','compliment']){s=complete(s,id,1);s=complete(s,id,1);assert.equal(s.player.questCompletions[id],2)}
  assert.deepEqual(s.player.questCooldowns,{});
});
test('countdown formatting rounds up and ends at zero',()=>{
  assert.equal(formatCooldown(HOME_COOLDOWN_MS),'12:00:00');assert.equal(formatCooldown(1),'00:00:01');assert.equal(formatCooldown(0),'00:00:00');
});
