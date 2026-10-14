import { useState } from 'react';
import type { Appearance } from '../types';
import { defaultAppearance } from '../types';
import { Avatar } from './Avatar';
import { colors } from '../data/avatarPresets';

export function CharacterSetup({ onCreate }: { onCreate: (appearance: Appearance) => void }) {
  const [a,setA] = useState(defaultAppearance);
  const [error,setError] = useState('');
  const update = <K extends keyof Appearance>(key: K, value: Appearance[K]) => setA(old=>({...old,[key]:value}));
  return <main className="setup-layout">
    <section className="character-stage"><div className="stage-caption"><span className="eyebrow">YOUR STORY STARTS HERE</span><h1>A little progress.<br/>A whole new you.</h1><p>Give your everyday wins a character of their own.</p></div><div className="avatar-glow"/><Avatar appearance={a}/><span className="level-pill">✦ LEVEL 1 · A FRESH START</span></section>
    <section className="setup-panel"><span className="eyebrow">CREATE YOUR CHARACTER</span><h2>Meet your player.</h2><p className="muted">Make them feel like you. Or someone you'd love to become.</p>
      <form onSubmit={e=>{e.preventDefault();if(!a.name.trim()){setError('Enter a name for your player.');return}onCreate({...a,name:a.name.trim()})}}>
        <label className="field">Player name<input value={a.name} maxLength={40} placeholder="What should we call you?" onChange={e=>{update('name',e.target.value);setError('')}} autoComplete="nickname"/></label>
        <fieldset><legend>Gender</legend><div className="segmented">{(['male','female'] as const).map(g=><button key={g} type="button" aria-pressed={a.gender===g} onClick={()=>setA(old=>({...old,gender:g,bodyId:g==='male'?'base-a':'base-b',hairStyleId:g==='male'?'short-swept':'long'}))}>{g==='male'?'Male':'Female'}</button>)}</div></fieldset>
        <fieldset><legend>Hairstyle</legend><div className="segmented"><button type="button" aria-pressed={a.hairStyleId==='short-swept'} onClick={()=>update('hairStyleId','short-swept')}>Short & swept</button><button type="button" aria-pressed={a.hairStyleId==='long'} onClick={()=>update('hairStyleId','long')}>Long & flowing</button></div></fieldset>
        <div className="field-columns"><fieldset><legend>Hair color</legend><div className="swatches">{Object.entries(colors.hair).map(([key,color])=><button type="button" className="swatch" key={key} style={{background:color}} aria-label={`${key} hair`} aria-pressed={a.hairColorId===key} onClick={()=>update('hairColorId',key as Appearance['hairColorId'])}/>)}</div></fieldset><fieldset><legend>Eye color</legend><div className="swatches">{Object.entries(colors.eyes).map(([key,color])=><button type="button" className="swatch" key={key} style={{background:color}} aria-label={`${key} eyes`} aria-pressed={a.eyeColorId===key} onClick={()=>update('eyeColorId',key as Appearance['eyeColorId'])}/>)}</div></fieldset></div>
        <fieldset><legend>Expression</legend><div className="segmented"><button type="button" aria-pressed={a.expressionId==='smile'} onClick={()=>update('expressionId','smile')}>Smiling</button><button type="button" aria-pressed={a.expressionId==='neutral'} onClick={()=>update('expressionId','neutral')}>Neutral</button></div></fieldset>
        {error&&<p role="alert" className="error">{error}</p>}<button className="primary full-width" type="submit">Begin your adventure <span>→</span></button>
        <p className="save-note">Your progress will stay in this browser. No account needed.</p>
      </form>
    </section>
  </main>;
}
