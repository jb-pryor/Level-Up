import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {cosmetics} from '../data/cosmetics.ts';
import {maleShirts} from '../data/maleShirts.ts';
import {maleShoes} from '../data/maleShoes.ts';
import {femaleShirtTint,femaleTeePath} from '../data/femaleClothing.ts';
import {defaultAppearance} from '../types.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {savePlayer,loadPlayer} from './save.ts';

test('every shirt color has a female fitting/tint and all shared assets exist',()=>{
  assert(existsSync(new URL(`../../public${femaleTeePath}`,import.meta.url)));
  for(const id of Object.keys(maleShirts)){const values=femaleShirtTint(id)?.split(' ').map(Number);assert.equal(values?.length,20);assert(values.every(Number.isFinite));}
  for(const path of Object.values(maleShoes))assert(existsSync(new URL(`../../public${path}`,import.meta.url)));
});
for(const complexionId of ['1','2','3'])test(`complexion ${complexionId}: female players can purchase/equip every item, save and change bodies without losing equipment`,()=>{
  let state=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Test',gender:'female',bodyId:'base-b',complexionId}});
  state={...state,player:{...state.player,totalXp:1000,coins:10000}};
  for(const item of cosmetics.filter(item=>!item.maleOnly)){
    assert.notEqual(item.maleOnly,true);
    const coins=state.player.coins;
    state=gameReducer(state,{type:'buy',itemId:item.id});assert.equal(state.player.coins,coins-item.price);assert(state.player.ownedItemIds.includes(item.id));
    state=gameReducer(state,{type:'equip',outfit:{...state.player.equipped,[item.slot]:item.id}});assert.equal(state.player.equipped[item.slot],item.id);
  }
  let raw=null;assert(savePlayer({setItem:(_,v)=>raw=v},state.player));assert.deepEqual(loadPlayer({getItem:()=>raw}).player,state.player);
  const outfit=state.player.equipped,owned=state.player.ownedItemIds;
  for(const gender of ['male','female']){state=gameReducer(state,{type:'edit',appearance:{...defaultAppearance,name:'Test',gender,bodyId:gender==='male'?'base-a':'base-b',complexionId}});assert.deepEqual(state.player.equipped,outfit);assert.deepEqual(state.player.ownedItemIds,owned);}
});
