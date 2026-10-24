import test from 'node:test';
import assert from 'node:assert/strict';
import {sharedOutfit,sharedProgress,memberPresence} from './householdMember.ts';
import {sharedProfile,parseOutbox} from './householdActivity.ts';
import {defaultAppearance,starterOutfit} from '../types.ts';
const now=Date.parse('2026-10-24T12:00:00Z');
test('presence uses real update timestamps with a two-minute visible-app window',()=>{
 assert.deepEqual(memberPresence(undefined,now),{active:false,label:'Last seen unavailable'});
 assert.equal(memberPresence('bad',now).active,false);
 assert.deepEqual(memberPresence(new Date(now-119999).toISOString(),now),{active:true,label:'Active'});
 assert.deepEqual(memberPresence(new Date(now-120000).toISOString(),now),{active:false,label:'Active 2 min ago'});
 assert.equal(memberPresence(new Date(now-3*3600000).toISOString(),now).label,'Active 3 hours ago');
 assert.equal(memberPresence(new Date(now-86400000).toISOString(),now).label,'Active 1 day ago');
});
test('remote clothing accepts known slot IDs and drops unknown items or private fields',()=>{
 assert.deepEqual(sharedOutfit(null,'female'),starterOutfit);
 assert.deepEqual(sharedOutfit({shirt:'metallica-tee',pants:'leather-pants',hat:'cap',shoes:'black-white-shoes',coins:1000},'female'),{shirt:'metallica-tee',pants:'leather-pants',hat:'cap',shoes:'black-white-shoes'});
 assert.deepEqual(sharedOutfit({shirt:'../../secret',pants:'green-shirt',hat:'<script>',shoes:'unknown'},'male'),starterOutfit);
 assert.equal(sharedProgress({totalXp:0}),0);assert.equal(sharedProgress({totalXp:345}),345);
 for(const v of [-1,1.2,'345',Infinity,null])assert.equal(sharedProgress({totalXp:v}),null);
});
test('queued full avatar snapshots round-trip while legacy snapshots remain readable',()=>{
 const userId='10000000-0000-4000-8000-000000000001';
 const profile=sharedProfile({...defaultAppearance,name:'Party',totalXp:1234,coins:999,equipped:{shirt:'metallica-tee',pants:'leather-pants',hat:'cap',shoes:'sneakers'}});
 const event={id:'20000000-0000-4000-8000-000000000001',userId,householdId:'30000000-0000-4000-8000-000000000001',questId:'walk',completedAt:new Date(now).toISOString(),profile};
 const decoded=parseOutbox(JSON.stringify([event]),userId)[0];assert.deepEqual(decoded,event);assert.equal('coins' in decoded.profile.avatar,false);
 const {outfit,totalXp,...head}=profile.avatar;
 const old={...event,profile:{...profile,avatar:head}};
 assert.deepEqual(parseOutbox(JSON.stringify([old]),userId)[0],old);
});
