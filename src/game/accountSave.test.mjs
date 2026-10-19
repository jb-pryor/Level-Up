import test from 'node:test';
import assert from 'node:assert/strict';
import {accountCacheKey,readCache,cloudPlayer,reconcileCache,guestLoad,saveGuest,clearGuest,LEGACY_OWNER_KEY,GUEST_SAVE_KEY,SAVE_KEY} from './accountSave.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {defaultAppearance} from '../types.ts';
const id='alice';
function progressed(){let s=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Alice'}});for(const questId of ['walk','meal','gym']){s=gameReducer(s,{type:'add',questId});s=gameReducer(s,{type:'complete',questId,now:100});}s=gameReducer(s,{type:'buy',itemId:'green-shirt'});s=gameReducer(s,{type:'favorite',questId:'dishes'});return s.player;}
const player=progressed();
const cache={userId:id,revision:2,player,dirty:true,mutationId:'mutation-a'};
const row={schema_version:1,revision:2,player,mutation_id:'older-mutation'};
const store=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};};
test('complete account progress round trips without mixing account caches',()=>{
  assert.deepEqual(readCache(JSON.stringify(cache),id),cache);
  assert.deepEqual(cloudPlayer(row),player);
  assert.notEqual(accountCacheKey('alice'),accountCacheKey('bob'));
  assert.throws(()=>readCache(JSON.stringify(cache),'bob'));
});
test('newer cloud progress wins over a clean cache; unsynced stale progress triggers conflict',()=>{
  assert.equal(reconcileCache({...cache,dirty:false},{...row,revision:3}),'cloud');
  assert.equal(reconcileCache(cache,{...row,revision:3}),'conflict');
  assert.equal(reconcileCache(cache,row),'pending');
  assert.equal(reconcileCache({...cache,revision:0},null),'pending');
  assert.equal(reconcileCache(null,row),'cloud');
});
test('response-lost retries recognize a committed mutation and reset tombstones stay empty',()=>{
  assert.equal(reconcileCache(cache,{...row,revision:3,mutation_id:cache.mutationId}),'cloud');
  assert.equal(cloudPlayer({...row,player:null}),null);
  assert.equal(reconcileCache({...cache,player:null},{...row,revision:3}),'conflict');
});
test('cloud corruption and unsupported schemas do not become new players',()=>{
  for(const bad of [{...row,schema_version:2},{...row,revision:0},{...row,player:{...player,coins:-1}},{...row,player:{...player,equipped:{shirt:'missing'}}}])assert.throws(()=>cloudPlayer(bad));
  assert.throws(()=>readCache('{',id));
  assert.throws(()=>readCache(JSON.stringify({...cache,player:{...player,coins:-1}}),id));
});
test('legacy player is visible until linked, then signing out cannot restore the account player as a guest',()=>{
  const storage=store();storage.setItem(SAVE_KEY,JSON.stringify({schemaVersion:1,player}));
  assert.deepEqual(guestLoad(storage).player,player);
  storage.setItem(LEGACY_OWNER_KEY,id);
  assert.equal(guestLoad(storage).player,null);
  // A subsequent guest has an independent save, without modifying the linked legacy backup.
  const guest={...player,name:'Guest',coins:0};assert.equal(saveGuest(storage,guest),true);
  assert.deepEqual(guestLoad(storage).player,guest);
  assert.equal(JSON.parse(storage.getItem(SAVE_KEY)).player.name,'Alice');
  assert.equal(clearGuest(storage),true);assert.equal(guestLoad(storage).player,null);
  assert.ok(storage.getItem(SAVE_KEY));assert.equal(storage.getItem(GUEST_SAVE_KEY),null);
});
