import test from 'node:test';
import assert from 'node:assert/strict';
import {quests,questCategories} from '../data/quests.ts';
import {questHumor} from '../data/questHumor.ts';
import {skillNames} from '../data/skillNames.ts';
import {gameReducer,initialGame} from './gameReducer.ts';
import {defaultAppearance} from '../types.ts';
import {savePlayer,loadPlayer} from './save.ts';
import {cloudPlayer} from './accountSave.ts';
import {sharedProfile,parseOutbox} from './householdActivity.ts';
test('all five chapters have distinct quests, descriptions, completion humor and skills',()=>{
  assert.equal(questCategories.length,5);assert.equal(new Set(quests.map(q=>q.id)).size,quests.length);
  for(const category of questCategories){assert(quests.filter(q=>q.category===category.id).length>=5);}
  for(const quest of quests){assert(questHumor[quest.id]?.description);assert(questHumor[quest.id]?.completion);assert(skillNames[quest.id]);}
});
for(const category of ['education','exploration'])test(`${category} quests support rewards, skills, favorites, local/cloud saving and household retries`,()=>{
  let state=gameReducer(initialGame,{type:'create',appearance:{...defaultAppearance,name:'New Adventurer'}});
  for(const quest of quests.filter(q=>!q.archived&&q.category===category)){
    state=gameReducer(state,{type:'add',questId:quest.id,now:100});assert(state.player.activeQuestIds.includes(quest.id));
    const xp=state.player.totalXp,coins=state.player.coins;
    state=gameReducer(state,{type:'complete',questId:quest.id,now:200});
    assert.equal(state.player.totalXp,xp+quest.xp);assert(state.player.coins>=coins+quest.coins);assert.equal(state.player.questCompletions[quest.id],1);
    assert.equal(state.player.questCooldowns[quest.id],undefined);
    state=gameReducer(state,{type:'favorite',questId:quest.id});assert(state.player.favoriteQuestIds.includes(quest.id));
    state=gameReducer(state,{type:'add',questId:quest.id,now:201});assert(state.player.activeQuestIds.includes(quest.id));
    let raw=null;const storage={getItem:()=>raw,setItem:(_,v)=>raw=v};assert(savePlayer(storage,state.player));assert.deepEqual(loadPlayer(storage).player,state.player);
    assert.deepEqual(cloudPlayer({schema_version:1,revision:1,player:state.player,mutation_id:'save'}),state.player);
    const event={id:'10000000-0000-4000-8000-000000000001',userId:'me',householdId:'20000000-0000-4000-8000-000000000001',questId:quest.id,completedAt:new Date(200).toISOString(),profile:sharedProfile(state.player)};
    assert.equal(parseOutbox(JSON.stringify([event]),'me')[0].questId,quest.id);
    state=gameReducer(state,{type:'favorite',questId:quest.id});
  }
});

test('Explore contains the three moved quests and Education keeps both reading objectives',()=>{
  assert(!questCategories.some(c=>c.id==='discovery'));
  for(const id of ['try-hour','new-hobby','first-attempt'])assert(quests.some(q=>q.id===id&&q.category==='exploration'&&!q.archived));
  for(const id of ['read-chapter','read-book'])assert(quests.some(q=>q.id===id&&q.category==='education'&&!q.archived));
  for(const id of ['beginner-lesson','make-something'])assert(quests.find(q=>q.id===id).archived);
});

test('the complete household SQL update recognizes every current and archived quest',async()=>{
  const {readFile}=await import('node:fs/promises');
  const sql=await readFile(new URL('../../supabase/migrations/004_read_book_quest.sql',import.meta.url),'utf8');
  const recognized=new Map([...sql.matchAll(/when '([^']+)' then '((?:[^']|'')*)'/g)].map(([,id,name])=>[id,name.replaceAll("''","'")]));
  for(const quest of quests)assert.equal(recognized.get(quest.id),quest.name,`${quest.id} missing from shared activity`);
  assert.match(sql,/p_household_id is distinct from private.my_household\(\)/);
  assert.match(sql,/on conflict\(id\) do nothing/);
});
