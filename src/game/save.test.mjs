import test from 'node:test';
import assert from 'node:assert/strict';
import {loadPlayer,savePlayer,SAVE_KEY} from './save.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {defaultAppearance} from '../types.ts';
function storage(raw=null){return {raw,getItem(){return this.raw},setItem(key,value){assert.equal(key,SAVE_KEY);this.raw=value}}}
function progressed(){
  let s=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'James'}});
  for(const id of ['dishes','room','laundry']){s=gameReducer(s,{type:'add',questId:id});s=gameReducer(s,{type:'complete',questId:id})}
  s=gameReducer(s,{type:'buy',itemId:'green-shirt'});
  s=gameReducer(s,{type:'equip',outfit:{...s.player.equipped,shirt:'green-shirt'}});
  return gameReducer(s,{type:'add',questId:'walk'}).player;
}
test('saved player restores appearance, balances, unfinished quests, outfit and unread items',()=>{
  const store=storage(),player=progressed();assert.equal(loadPlayer(store).status,'empty');
  assert(savePlayer(store,player));assert.deepEqual(loadPlayer(store),{status:'ready',player});
  const seen=gameReducer({player,notice:null},{type:'open-wardrobe'}).player;
  savePlayer(store,seen);assert.deepEqual(loadPlayer(store).player.newItemIds,[]);
});
test('unreadable and unsupported saves remain untouched',()=>{
  for(const raw of ['oops','null','{}',JSON.stringify({schemaVersion:2,player:progressed()})]){
    const store=storage(raw);assert.equal(loadPlayer(store).status,'invalid');assert.equal(store.raw,raw);
  }
});
test('invalid balances, appearance, duplicate IDs, unknown IDs and illegal equipment are rejected',()=>{
  const player=progressed();
  for(const changes of [{totalXp:-1},{coins:1.2},{coins:Number.MAX_SAFE_INTEGER+1},{name:' '},{gender:'female'},{hairColorId:'purple'},{activeQuestIds:['walk','walk']},{activeQuestIds:['missing']},{ownedItemIds:['missing']},{newItemIds:['cap']},{equipped:{...player.equipped,pants:'green-shirt'}},{equipped:{...player.equipped,hat:'cap'}}]){
    const invalid={...player,...changes};const store=storage(JSON.stringify({schemaVersion:1,player:invalid}));
    assert.equal(loadPlayer(store).status,'invalid',JSON.stringify(changes));assert.equal(savePlayer(store,invalid),false);
  }
});
test('storage permission and quota errors do not throw or mutate session progress',()=>{
  const player=progressed(),original=structuredClone(player);
  const store={getItem(){throw Error('blocked')},setItem(){throw Error('quota')}};
  assert.equal(loadPlayer(store).status,'unavailable');assert.equal(savePlayer(store,player),false);assert.deepEqual(player,original);
});

test('pre-stats saves keep existing progress and start with an empty skill history',()=>{
  const player=progressed();delete player.questCompletions;
  const store=storage(JSON.stringify({schemaVersion:1,player}));
  const loaded=loadPlayer(store);assert.equal(loaded.status,'ready');
  assert.deepEqual(loaded.player,{...player,questCompletions:{}});
  assert.equal(JSON.parse(store.raw).player.questCompletions,undefined,'loading preserves original value');
});
test('invalid completion history cannot enter a save',()=>{
  for(const questCompletions of [null,[],{dishes:-1},{dishes:1.5},{missing:4}]){
    const store=storage(JSON.stringify({schemaVersion:1,player:{...progressed(),questCompletions}}));
    assert.equal(loadPlayer(store).status,'invalid');
  }
});

test('favorite quests survive saving and older saves migrate without favorites',()=>{
  const player={...progressed(),favoriteQuestIds:['dishes','walk']},store=storage();
  assert(savePlayer(store,player));assert.deepEqual(loadPlayer(store).player.favoriteQuestIds,['dishes','walk']);
  delete player.favoriteQuestIds;store.raw=JSON.stringify({schemaVersion:1,player});
  assert.deepEqual(loadPlayer(store).player.favoriteQuestIds,[]);
  player.favoriteQuestIds=['walk','walk'];store.raw=JSON.stringify({schemaVersion:1,player});assert.equal(loadPlayer(store).status,'invalid');
});

test('explicit reset deletes only this app save and reports storage deletion failure',async()=>{
  const {deletePlayerSave}=await import('./save.ts');
  const removed=[];assert.equal(deletePlayerSave({removeItem(key){removed.push(key)}}),true);
  assert.deepEqual(removed,[SAVE_KEY]);
  assert.equal(deletePlayerSave({removeItem(){throw Error('blocked')}}),false);
});
