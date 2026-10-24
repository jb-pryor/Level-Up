import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newPants} from '../data/newPants.ts';
import {cosmetics} from '../data/cosmetics.ts';
import {defaultAppearance} from '../types.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {savePlayer,loadPlayer} from './save.ts';
for(const gender of ['male','female'])test(`${gender}: six pants purchase, equip and save without losing other outfit slots`,()=>{
 let state=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Pants test',gender,bodyId:gender==='male'?'base-a':'base-b'}});
 state={...state,player:{...state.player,totalXp:150,coins:1000}};
 for(const [id,asset] of Object.entries(newPants)){
  const item=cosmetics.find(c=>c.id===id);assert.equal(item.slot,'pants');const daily=['leather-pants','camo-pants','zebra-pants'].includes(id);assert.equal(item.shop,daily?'daily':'basic');assert.equal(item.rarity,id==='leather-pants'?'Legendary':daily?'Epic':'Rare');assert.equal(item.price,id==='leather-pants'?100:daily?75:35);assert.equal(item.requiredLevel,3);
  const bytes=readFileSync(new URL(`../../public/avatars/pants/new-pants/${asset.file}`,import.meta.url));assert.equal(bytes.readUInt32BE(16),1024);assert.equal(bytes.readUInt32BE(20),1536);
  const before=state.player.coins;state=gameReducer(state,{type:'buy',itemId:id});assert.equal(state.player.coins,before-item.price);
  const prior=state.player.equipped;state=gameReducer(state,{type:'equip',outfit:{...prior,pants:id}});assert.equal(state.player.equipped.pants,id);assert.equal(state.player.equipped.shirt,prior.shirt);assert.equal(state.player.equipped.shoes,prior.shoes);
  const duplicate=gameReducer(state,{type:'buy',itemId:id});assert.equal(duplicate.player.coins,state.player.coins);
  let raw;assert(savePlayer({setItem:(_,v)=>raw=v},state.player));assert.deepEqual(loadPlayer({getItem:()=>raw}).player,state.player);
 }
 const changed=gameReducer(state,{type:'edit',appearance:{...state.player,gender:gender==='male'?'female':'male',bodyId:gender==='male'?'base-b':'base-a'}});
 assert.deepEqual(changed.player.ownedItemIds,state.player.ownedItemIds);assert.deepEqual(changed.player.equipped,state.player.equipped);
});
