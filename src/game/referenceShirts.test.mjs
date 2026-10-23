import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {referenceShirtIds,referenceShirtPath} from '../data/referenceShirts.ts';
import {cosmetics} from '../data/cosmetics.ts';
import {defaultAppearance} from '../types.ts';
import {initialGame,gameReducer} from './gameReducer.ts';
import {savePlayer,loadPlayer} from './save.ts';

test('reference garments have complete body-specific PNG assets on the canonical canvas',()=>{
  for(const id of referenceShirtIds){
    const item=cosmetics.find(item=>item.id===id);
    assert.equal(item?.slot,'shirt');assert.equal(item.requiredLevel,1);
    for(const gender of ['male','female']){
      const bytes=readFileSync(new URL(`../../public${referenceShirtPath(id,gender)}`,import.meta.url));
      assert.equal(bytes.subarray(1,4).toString(),'PNG');
      assert.equal(bytes.readUInt32BE(16),1024);assert.equal(bytes.readUInt32BE(20),1536);
      assert.equal(bytes[25],6,'RGBA transparency');
    }
  }
  assert.equal(referenceShirtPath('starter','male'),null);
});

for(const gender of ['male','female'])test(`${gender}: reference clothes charge once, equip and survive saving at level 1`,()=>{
  let state=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Try on',gender,bodyId:gender==='male'?'base-a':'base-b'}});
  state={...state,player:{...state.player,coins:1000}};
  for(const id of referenceShirtIds){
    const item=cosmetics.find(item=>item.id===id),before=state.player.coins;
    state=gameReducer(state,{type:'buy',itemId:id});assert.equal(state.player.coins,before-item.price);
    state=gameReducer(state,{type:'buy',itemId:id});assert.equal(state.player.coins,before-item.price,'duplicate purchase does not charge');
    state=gameReducer(state,{type:'equip',outfit:{...state.player.equipped,shirt:id}});
    assert.equal(state.player.equipped.shirt,id);
    let raw;savePlayer({setItem:(_,value)=>raw=value},state.player);
    assert.deepEqual(loadPlayer({getItem:()=>raw}).player,state.player);
  }
});
