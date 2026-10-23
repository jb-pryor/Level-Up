import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {femaleBase} from '../data/femaleBases.ts';
import {defaultAppearance} from '../types.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {savePlayer,loadPlayer} from './save.ts';

test('all six female bases exist and are fitted without modifying their source PNGs',()=>{
  const paths=new Set();
  for(const complexionId of ['1','2','3'])for(const expressionId of ['smile','neutral']){
    const base=femaleBase({complexionId,expressionId});paths.add(base.src);
    assert(existsSync(new URL(`../../public${base.src}`,import.meta.url)));
    assert(base.placement.width>0&&base.placement.height>0);assert(base.placement.x>0);
  }
  assert.equal(paths.size,6);
  const smile=femaleBase({complexionId:'1',expressionId:'smile'}),neutral=femaleBase({complexionId:'1',expressionId:'neutral'});
  assert.notEqual(smile.placement.width,neutral.placement.width);
});
test('new female complexions, expressions and bald/long hair preserve progress through saves',()=>{
  for(const complexionId of ['1','2','3'])for(const expressionId of ['smile','neutral'])for(const hairStyleId of ['bald','long']){
    const state=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'Player',gender:'female',bodyId:'base-b',complexionId,expressionId,hairStyleId}});
    let raw=null;assert(savePlayer({setItem:(_,value)=>raw=value},state.player));
    assert.deepEqual(loadPlayer({getItem:()=>raw}).player,state.player);
  }
});
test('new long hair PNG has a real alpha channel',()=>{
  const data=readFileSync(new URL('../../public/avatars/hair/long-layered/chestnut.png',import.meta.url));
  assert.equal(data.readUInt8(25),6);
  assert(data.readUInt32BE(16)>=1024);assert(data.readUInt32BE(20)>=1024);
});
