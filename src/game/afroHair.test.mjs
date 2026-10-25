import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {afroHairAsset} from '../data/afroHair.ts';
import {defaultAppearance} from '../types.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {savePlayer,loadPlayer} from './save.ts';
import {sharedProfile,headAppearance} from './householdActivity.ts';
for(const gender of ['male','female'])test(`${gender}: Afro uses each supplied color and persists in saves and household avatars`,()=>{
 const paths=new Set();
 for(const hairColorId of ['black','brown','blonde','gray']){
  const asset=afroHairAsset(gender,hairColorId);paths.add(asset.src);
  const bytes=readFileSync(new URL(`../../public${asset.src}`,import.meta.url));assert.equal(bytes.readUInt32BE(16),asset.width);assert.equal(bytes.readUInt32BE(20),asset.height);
  let s=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Afro test',gender,bodyId:gender==='male'?'base-a':'base-b',hairStyleId:'afro',hairColorId}});
  s={...s,player:{...s.player,totalXp:321,coins:59,lootBoxes:2}};
  let raw;assert(savePlayer({setItem:(_,v)=>raw=v},s.player));assert.deepEqual(loadPlayer({getItem:()=>raw}).player,s.player);
  const appearance=headAppearance(sharedProfile(s.player).avatar,s.player.name);assert.equal(appearance.hairStyleId,'afro');assert.equal(appearance.hairColorId,hairColorId);assert.equal(appearance.gender,gender);
 }
 assert.equal(paths.size,4);
});
