import { useEffect, useState } from 'react';
import type { Category, Player } from '../types';
import { quests, questCategories } from '../data/quests';
import { questHumor } from '../data/questHumor';
import { playSound } from '../game/soundEffects';

function CategoryIcon({category}:{category:Category}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{category==='home'?<><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></>:category==='health'?<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>:<><circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M16 4a3 3 0 0 1 0 6M17 12a5 5 0 0 1 4 5v4"/></>}</svg>;
}
export function QuestCatalog({player,onAdd,onFavorite}:{player:Player;onAdd:(id:string)=>void;onFavorite:(id:string)=>void}) {
  const [category,setCategory]=useState<Category>('home'),[search,setSearch]=useState(''),[selectedId,setSelectedId]=useState<string|null>(null);
  const filtered=quests.filter(q=>q.category===category&&q.name.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b)=>{
    const aIndex=player.activeQuestIds.indexOf(a.id),bIndex=player.activeQuestIds.indexOf(b.id);
    if(aIndex<0&&bIndex<0)return 0;
    if(aIndex<0)return -1;
    if(bIndex<0)return 1;
    return aIndex-bIndex;
  });
  const selected=filtered.find(q=>q.id===selectedId)??filtered[0];
  const [favoriteLimit,setFavoriteLimit]=useState<{id:string;attempt:number}|null>(null);
  useEffect(()=>{if(!favoriteLimit)return;const timer=setTimeout(()=>setFavoriteLimit(null),4000);return()=>clearTimeout(timer)},[favoriteLimit]);
  const categoryLabel=questCategories.find(c=>c.id===category)!.label;
  return <div className="quest-book">
    <div className="book-pages" key={category} id="quest-book-pages" role="tabpanel" aria-labelledby={`book-tab-${category}`}>
      <section className="book-page book-left"><div className="book-page-heading"><span className="book-chapter">CHAPTER {category==='home'?'I':category==='health'?'II':'III'}</span><h3>{categoryLabel}</h3><p>Choose your next real-life adventure.</p></div>
        <label className="book-search">Find a quest<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search this chapter…"/></label>
        <div className="book-quest-list" aria-label={`${categoryLabel} quests`}>{filtered.map(q=><div className="book-quest-entry" key={q.id}><button type="button" className="book-quest-row" aria-pressed={selected?.id===q.id} onClick={()=>setSelectedId(q.id)}><span className="book-quest-symbol">{player.activeQuestIds.includes(q.id)?'✓':'✧'}</span><span className="book-quest-name">{q.name}</span><span className="book-xp">+{q.xp} XP</span></button></div>)}</div>
        {!filtered.length&&<p className="book-no-results">No quests match this search. Try another word or chapter.</p>}
        <span className="book-page-number">{category==='home'?'01':category==='health'?'03':'05'} / QUESTS</span>
      </section>
      <section className="book-page book-right" aria-label="Quest details"><span className="book-chapter">YOUR NEXT MISSION</span>{selected&&<button type="button" className="quest-favorite-star quest-detail-favorite" aria-pressed={player.favoriteQuestIds.includes(selected.id)} aria-label={`${player.favoriteQuestIds.includes(selected.id)?'Unfavorite':'Favorite'} ${selected.name}`} title={player.favoriteQuestIds.includes(selected.id)?'Remove favorite':'Favorite quest'} onClick={()=>{if(!player.favoriteQuestIds.includes(selected.id)&&player.favoriteQuestIds.length>=4){setFavoriteLimit(old=>({id:selected.id,attempt:(old?.attempt??0)+1}));return;}setFavoriteLimit(null);onFavorite(selected.id)}}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6.5 7 1-5 5 1.2 7-6.2-3.4L5.8 21l1.2-6.5-5-5 7-1Z"/></svg></button>}{selected&&favoriteLimit?.id===selected.id&&<span className="favorite-limit-message" role="status"><span aria-hidden="true">!</span> Limit of 4 favorites</span>}{selected?<><div className="book-detail-emblem"><CategoryIcon category={category}/></div><h3 className="book-detail-title">{selected.name}</h3><p className="book-description">{questHumor[selected.id]?.description}</p><div className="book-objective"><span>OBJECTIVE</span><p>{selected.name}</p></div><div className="book-reward"><span>COMPLETION REWARD</span><strong>✦ +{selected.xp} XP</strong></div><div className="book-add-area"><button className="primary book-add" data-sound="add-quest" disabled={player.activeQuestIds.includes(selected.id)} onClick={()=>{if(player.activeQuestIds.includes(selected.id))return;setSelectedId(selected.id);onAdd(selected.id);playSound('add-quest')}}>{player.activeQuestIds.includes(selected.id)?'Added':'Add quest'} <span>{player.activeQuestIds.includes(selected.id)?'✓':'+'}</span></button><p className="book-hint">Complete it in real life, then check it off.</p></div></>:<div className="book-detail-empty"><span>✧</span><p>A new quest is waiting to be discovered.</p></div>}
        <span className="book-page-number">{category==='home'?'02':category==='health'?'04':'06'} / DETAILS</span>
      </section>
    </div>
    <nav className="book-bookmarks" role="tablist" aria-label="Quest categories">{questCategories.map((c,index)=><button key={c.id} id={`book-tab-${c.id}`} type="button" role="tab" aria-label={c.label} title={c.label} aria-selected={category===c.id} aria-controls="quest-book-pages" tabIndex={category===c.id?0:-1} className={`book-bookmark bookmark-${c.id}`} onClick={()=>{setCategory(c.id);setSelectedId(null)}} onKeyDown={e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const next=questCategories[(index+(e.key==='ArrowDown'?1:2))%3].id;setCategory(next);setSelectedId(null);document.getElementById(`book-tab-${next}`)?.focus()}}}><CategoryIcon category={c.id}/><span>{c.id==='home'?'Home':c.id==='health'?'Health':'Social'}</span></button>)}</nav>
  </div>;
}
