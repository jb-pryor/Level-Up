import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {defaultAppearance} from '../types.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {savePlayer,loadPlayer} from './save.ts';
import {sharedProfile,headAppearance} from './householdActivity.ts';
for(const gender of ['male','female'])test(`${gender}: curly-short colors survive saves, appearance edits and household portraits`,()=>{
 for(const hairColorId of ['black','brown','blonde','gray']){
  const bytes=readFileSync(new URL(`../../public/avatars/hair/newHair/fitted/${hairColorId}-curly-hair-fitted.png`,import.meta.url));
  assert.equal(bytes.readUInt32BE(16),1024);assert.equal(bytes.readUInt32BE(20),1706);assert.equal(bytes[25],6);
  let s=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Curly',gender,bodyId:gender==='male'?'base-a':'base-b',hairStyleId:'short-curly',hairColorId}});
  s={...s,player:{...s.player,totalXp:271,coins:67}};
  let raw;assert(savePlayer({setItem:(_,v)=>raw=v},s.player));assert.deepEqual(loadPlayer({getItem:()=>raw}).player,s.player);
  const portrait=headAppearance(sharedProfile(s.player).avatar,s.player.name);assert.equal(portrait.hairStyleId,'short-curly');assert.equal(portrait.hairColorId,hairColorId);
  const edited=gameReducer(s,{type:'edit',appearance:{...portrait,complexionId:'3',expressionId:'neutral'}});assert.equal(edited.player.hairStyleId,'short-curly');assert.equal(edited.player.totalXp,271);assert.equal(edited.player.coins,67);
 }
});
