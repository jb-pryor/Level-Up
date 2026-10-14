import { useState } from 'react';
import { CharacterSetup } from './components/CharacterSetup';
import { Avatar } from './components/Avatar';
import { Wardrobe } from './components/Wardrobe';
import type { Appearance, Outfit } from './types';
import { starterOutfit } from './types';

export default function App() {
  const [player,setPlayer] = useState<Appearance|null>(null);
  const [preview,setPreview]=useState(false);
  const [outfit,setOutfit]=useState<Outfit>(starterOutfit);
  const [draftOutfit,setDraftOutfit]=useState<Outfit>(starterOutfit);
  return <><header className="app-header"><a href="#" className="brand" onClick={e=>e.preventDefault()}><span className="brand-icon">↑</span>Level Up<span className="brand-dot">.</span></a><span className="header-note">SMALL ACTIONS. BIG ADVENTURES.</span>{player && <button className="quiet-button" onClick={()=>setPlayer(null)}>Edit character</button>}</header>
    {!player?<CharacterSetup onCreate={setPlayer}/>:<main className="dashboard"><div className="dashboard-heading"><div><span className="eyebrow">YOUR NEXT CHAPTER</span><h1>Let's make today count, {player.name}.</h1></div></div>
      <div className="dashboard-grid"><section className="player-card"><div className="player-title"><h2>{player.name}</h2><span className="level-pill">LEVEL 1</span></div><div className="xp-label"><span>A fresh start</span><span>0 / 100 XP</span></div><div className="xp-track"><div style={{width:'0%'}}/></div><Avatar appearance={player} outfit={preview ? draftOutfit : outfit}/><button className="quiet-button" aria-label="Edit clothes" onClick={()=>{if(!preview){setDraftOutfit({...outfit});setPreview(true)}}}>⌑ Edit clothes</button></section>
      {preview ? <Wardrobe appearance={player} draft={draftOutfit} onChange={setDraftOutfit} onConfirm={()=>{setOutfit({...draftOutfit});setPreview(false)}} onCancel={()=>setPreview(false)}/> :
      <section className="quest-card"><span className="eyebrow">ONE STEP AT A TIME</span><h2>Your daily quests</h2><div className="empty-state"><span className="empty-symbol">✧</span><h3>Your adventure is taking shape.</h3><p>Character creation is ready to try. The quest catalog and rewards come in the next working step.</p></div></section>}
      </div></main>}
    <footer>Make progress in your life. Watch it come to life.</footer></>;
}
