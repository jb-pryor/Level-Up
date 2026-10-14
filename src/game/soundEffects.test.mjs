import test from 'node:test';
import assert from 'node:assert/strict';
import { playSound, unlockAudio, setSoundEnabled } from './soundEffects.ts';

test('effects wait for audio activation, schedule their tones, and stop when muted',()=>{
  const events=[];let created=0;
  const parameter=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(value){events.push(['master',value])}});
  globalThis.window={AudioContext:class{
    state='running';currentTime=1;destination={};
    constructor(){created++;}
    createGain(){return {gain:parameter(),connect(){},disconnect(){}};}
    createOscillator(){return {frequency:parameter(),connect(){},disconnect(){},start(time){events.push(['start',time])},stop(time){events.push(['stop',time])},onended:null};}
  }};
  playSound('level');assert.equal(created,0);assert.equal(events.length,0);
  unlockAudio();assert.equal(created,1);
  for(const sound of ['click','reorder','add-quest','purchase','quest','transfer','level']){const before=events.filter(e=>e[0]==='start').length;playSound(sound);assert(events.filter(e=>e[0]==='start').length>before,sound);}
  unlockAudio();assert.equal(created,1,'reuse one context');
  setSoundEnabled(false);const count=events.length;playSound('transfer');unlockAudio();assert.equal(events.length,count);assert(events.some(e=>e[0]==='master'&&e[1]===0));
  setSoundEnabled(true);playSound('click');assert(events.length>count);
  delete globalThis.window;
});
