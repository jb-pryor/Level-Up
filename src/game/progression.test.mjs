import test from 'node:test';
import assert from 'node:assert/strict';
import {levelFor,xpAtLevel,xpIntoLevel,xpForNextLevel} from './progression.ts';
import {animatedXp} from './rewardAnimation.ts';

test('level costs follow the agreed early and long-term curve',()=>{
  for(const [level,cost] of [[1,50],[2,100],[3,150],[4,200],[5,250],[6,275],[10,375],[15,500],[20,625],[30,875]])assert.equal(xpForNextLevel(level),cost);
});
test('every boundary preserves overflow and agrees with the cumulative XP total',()=>{
  let total=0;
  for(let level=1;level<=10000;level++){
    assert.equal(xpAtLevel(level),total);
    assert.equal(levelFor(total),level);assert.equal(xpIntoLevel(total),0);
    if(level>1){assert.equal(levelFor(total-1),level-1);assert.equal(xpIntoLevel(total-1),xpForNextLevel(level-1)-1);}
    const cost=xpForNextLevel(level);
    assert.equal(levelFor(total+cost-1),level);assert.equal(xpIntoLevel(total+cost-1),cost-1);
    total+=cost;
  }
});
test('bar rollover holds at the real boundary at introductory and later levels',()=>{
  for(const level of [1,2,5,6,20]){
    const boundary=xpAtLevel(level+1),from=boundary-10,to=boundary+20;
    const held=animatedXp(from,to,.65);
    assert(held<boundary&&held>boundary-1);assert.equal(levelFor(held),level);
    assert.equal(animatedXp(from,to,1),to);assert.equal(xpIntoLevel(to),20);
  }
});
