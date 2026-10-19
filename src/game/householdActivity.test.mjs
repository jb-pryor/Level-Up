import test from 'node:test';
import assert from 'node:assert/strict';
import { sharedProfile, headAppearance, parseOutbox, outboxKey } from './householdActivity.ts';
import { defaultAppearance } from '../types.ts';
const userId='10000000-0000-4000-8000-000000000001';
const profile=sharedProfile({...defaultAppearance,name:'Benjie',totalXp:345,coins:90,equipped:{shirt:'blue-shirt'},activeQuestIds:['walk'],favoriteQuestIds:['dishes']});
const event={id:'20000000-0000-4000-8000-000000000001',userId,householdId:'30000000-0000-4000-8000-000000000001',questId:'walk',completedAt:'2026-10-18T10:00:00.000Z',profile};
test('household snapshots include head appearance, name and earned level without private progress',()=>{
  assert.equal(profile.level,4);assert.equal(profile.displayName,'Benjie');
  assert.deepEqual(Object.keys(profile).sort(),['avatar','displayName','level']);
  assert.equal('coins' in profile.avatar,false);assert.equal('equipped' in profile.avatar,false);assert.equal('name' in profile.avatar,false);
});
test('retry queue keeps stable event IDs and original account, household, completion time and snapshot',()=>{
  const loaded=parseOutbox(JSON.stringify([event]),userId);
  assert.deepEqual(loaded,[event]);assert.deepEqual(parseOutbox(JSON.stringify(loaded),userId),loaded);
  assert.notEqual(outboxKey(userId),outboxKey('another-account'));
  assert.throws(()=>parseOutbox(JSON.stringify([event]),'another-account'));
});
test('invalid, duplicate and unknown-quest queued events are rejected without silently dropping them',()=>{
  assert.throws(()=>parseOutbox('broken',userId));assert.throws(()=>parseOutbox('{}',userId));
  assert.throws(()=>parseOutbox(JSON.stringify([event,event]),userId));
  for(const invalid of [{...event,id:'bad'},{...event,questId:'missing'},{...event,completedAt:'bad'},{...event,profile:{...profile,level:-1}}])assert.throws(()=>parseOutbox(JSON.stringify([invalid]),userId));
  assert.deepEqual(parseOutbox(null,userId),[]);
});
test('remote head data is restricted to supported appearance values and matching body',()=>{
  const head=headAppearance({gender:'female',bodyId:'../../bad',complexionId:'9',eyeColorId:'<script>',hairColorId:'gray'},'Same Name');
  assert.equal(head.bodyId,'base-b');assert.equal(head.complexionId,'1');assert.equal(head.eyeColorId,'brown');assert.equal(head.hairColorId,'gray');assert.equal(head.name,'Same Name');
  assert.deepEqual(headAppearance(null,''),defaultAppearance);
});
