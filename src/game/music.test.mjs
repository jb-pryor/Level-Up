import test from 'node:test';
import assert from 'node:assert/strict';
import {startMusic,stopMusic} from './music.ts';
test('music is opt-in, reuses its own context and stops scheduled voices',async()=>{
  let created=0,started=0,stopped=0;
  const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
  globalThis.window={AudioContext:class{
    state='running';currentTime=0;destination={};constructor(){created++}
    createGain(){return {gain:param(),connect(){},disconnect(){}}}
    createOscillator(){return {frequency:param(),connect(){},disconnect(){},start(){started++},stop(){stopped++}}}
  }};
  assert.equal(created,0);
  try{
    assert.equal(await startMusic(),true);assert(started>0);assert.equal(created,1);
    const before=stopped;stopMusic();assert(stopped>before);
    assert.equal(await startMusic(),true);assert.equal(created,1);
  }finally{stopMusic();delete globalThis.window}
});
