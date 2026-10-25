import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ponytailHairAsset} from '../data/ponytailHair.ts';
import {defaultAppearance} from '../types.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {savePlayer,loadPlayer} from './save.ts';
import {sharedProfile,headAppearance} from './householdActivity.ts';
for(const gender of ['male','female'])test(`${gender}: Ponytail uses all supplied colors and survives saving/household sharing`,()=>{
 const paths=new Set();
 for(const hairColorId of ['black','brown','blonde','gray']){
  const asset=ponytailHairAsset(gender,hairColorId);paths.add(asset.src);
  const png=readFileSync(new URL(`../../public${asset.src}`,import.meta.url));assert.equal(png.readUInt32BE(16),asset.width);assert.equal(png.readUInt32BE(20),asset.height);
  let s=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Ponytail',gender,bodyId:gender==='male'?'base-a':'base-b',hairStyleId:'ponytail',hairColorId}});
  s={...s,player:{...s.player,totalXp:482,coins:74,lootBoxes:1}};
  let raw;assert(savePlayer({setItem:(_,v)=>raw=v},s.player));assert.deepEqual(loadPlayer({getItem:()=>raw}).player,s.player);
  const portrait=headAppearance(sharedProfile(s.player).avatar,s.player.name);assert.equal(portrait.hairStyleId,'ponytail');assert.equal(portrait.hairColorId,hairColorId);assert.equal(portrait.gender,gender);
 }
 assert.equal(paths.size,4);
});
