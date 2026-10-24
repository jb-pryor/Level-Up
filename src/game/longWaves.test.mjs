import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {defaultAppearance} from '../types.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {savePlayer,loadPlayer} from './save.ts';
import {sharedProfile,headAppearance} from './householdActivity.ts';
import {longWavesPath,longWavesSources} from '../data/longWaves.ts';
for(const gender of ['female','male'])test(`${gender}: soft waves preserve all colors in saves and shared household portraits`,()=>{
 for(const hairColorId of ['brown','black','blonde','gray']){
  assert(existsSync(new URL(`../../public${longWavesPath(hairColorId)}`,import.meta.url)));
  const view=longWavesSources[hairColorId].viewBox.split(' ').map(Number);assert.equal(view.length,4);assert(view[2]>0&&view[3]>0);
  let s=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Waves',gender,bodyId:gender==='male'?'base-a':'base-b',hairStyleId:'long-waves',hairColorId}});
  s={...s,player:{...s.player,totalXp:222,coins:78}};
  let raw;assert(savePlayer({setItem:(_,v)=>raw=v},s.player));assert.deepEqual(loadPlayer({getItem:()=>raw}).player,s.player);
  const head=headAppearance(sharedProfile(s.player).avatar,s.player.name);assert.equal(head.hairStyleId,'long-waves');assert.equal(head.hairColorId,hairColorId);
 }
});
