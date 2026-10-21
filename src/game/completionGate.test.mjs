import test from 'node:test';
import assert from 'node:assert/strict';
import {completeWithLevelGate} from './completionGate.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {defaultAppearance} from '../types.ts';
function start(xp){const state=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Fast Clicker'}});return {state:{...state,player:{...state.player,totalXp:xp,activeQuestIds:['walk','meal','gym','teacher']}},blocked:false};}
test('rapid completions stop on the first level-up and preserve remaining quests and rewards',()=>{
  let gate=start(60);
  gate=completeWithLevelGate(gate,'walk',100);assert.equal(gate.state.player.totalXp,75);assert.equal(gate.blocked,false);
  gate=completeWithLevelGate(gate,'meal',101);assert.equal(gate.state.player.totalXp,110);assert.equal(gate.blocked,true);
  const paused=gate;
  for(let i=0;i<20;i++){gate=completeWithLevelGate(gate,'gym',102+i);gate=completeWithLevelGate(gate,'teacher',102+i);}
  assert.equal(gate,paused);assert.deepEqual(gate.state.player.activeQuestIds,['gym','teacher']);
  assert.equal(gate.state.player.coins,40);assert.equal(gate.state.player.questCompletions.gym,undefined);
  assert.equal(gate.state.notice.reward.questName,'Prepare a balanced meal');
});
test('acknowledging a level-up resumes completion and the next boundary locks again',()=>{
  let gate=completeWithLevelGate(start(90),'walk',100);assert.equal(gate.blocked,true);
  gate={...gate,blocked:false};gate=completeWithLevelGate(gate,'gym',101);assert.equal(gate.state.player.totalXp,165);assert.equal(gate.blocked,false);
  gate=completeWithLevelGate(gate,'meal',102);assert.equal(gate.state.player.totalXp,200);assert.equal(gate.blocked,true);
});
test('repeated or invalid completion cannot invent XP or trigger advancement',()=>{
  let gate=start(0);gate=completeWithLevelGate(gate,'walk',100);const xp=gate.state.player.totalXp;
  gate=completeWithLevelGate(gate,'walk',100);gate=completeWithLevelGate(gate,'not-a-quest',100);
  assert.equal(gate.state.player.totalXp,xp);assert.equal(gate.blocked,false);
});
