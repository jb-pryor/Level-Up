import { HairstyleThumbnail } from './HairstyleThumbnail';
import { femaleBase } from '../data/femaleBases';
import { useState } from 'react';
import type { Appearance } from '../types';
import { defaultAppearance } from '../types';
import { Avatar } from './Avatar';
import { colors } from '../data/avatarPresets';

export function CharacterSetup({onCreate,initialAppearance=defaultAppearance,onCancel}:{onCreate:(appearance:Appearance)=>void;initialAppearance?:Appearance;onCancel?:()=>void}){
  const [a,setA]=useState(initialAppearance),[error,setError]=useState('');
  const update=<K extends keyof Appearance>(key:K,value:Appearance[K])=>setA(old=>({...old,[key]:value}));
  const styles: {id:Appearance['hairStyleId'];label:string}[]=[{id:'bald',label:'Bald'},{id:'short-swept',label:'Swoosh'},{id:'short-curly',label:'Curly short'},{id:'afro',label:'Afro'},{id:'ponytail',label:'Ponytail'},{id:'long',label:'Long & flowing'},{id:'long-waves',label:'Soft waves'}];
  return <main className="setup-layout">
    <section className="character-stage"><div className="stage-caption"><span className="eyebrow">YOUR STORY STARTS HERE</span><h1>A little progress.<br/>A whole new you.</h1><p>Give your everyday wins a character of their own.</p></div><div className="avatar-glow"/><Avatar appearance={a}/><span className="level-pill">✦ LEVEL 1 · A FRESH START</span></section>
    <section className="setup-panel"><span className="eyebrow">CREATE YOUR CHARACTER</span><h2>Meet your player.</h2><p className="muted">Make them feel like you. Or someone you'd love to become.</p>
      <form onSubmit={e=>{e.preventDefault();if(!a.name.trim()){setError('Enter a name for your player.');return;}onCreate({...a,name:a.name.trim()});}}>
        <label className="field">Player name<input value={a.name} maxLength={40} placeholder="What should we call you?" onChange={e=>{update('name',e.target.value);setError('');}} autoComplete="nickname"/></label>
        <fieldset><legend>Gender</legend><div className="segmented">{(['male','female'] as const).map(g=><button key={g} type="button" aria-pressed={a.gender===g} onClick={()=>{if(a.gender!==g)setA(old=>({...old,gender:g,bodyId:g==='male'?'base-a':'base-b',hairStyleId:g==='female'?'bald':'short-swept'}));}}>{g==='male'?'Male':'Female'}</button>)}</div></fieldset>
        <fieldset data-sound="transform"><legend>Complexion</legend><div className="segmented complexion-options">{(['1','2','3'] as const).map(id=><button key={id} type="button" data-sound="transform" aria-pressed={a.complexionId===id} onClick={()=>update('complexionId',id)}><ComplexionThumbnail appearance={{...a,complexionId:id}}/>Complexion {id}</button>)}</div></fieldset>
        <fieldset><legend>Eye color</legend><div className="swatches">{Object.entries(colors.eyes).map(([key,color])=><button type="button" className="swatch" key={key} style={{background:color}} aria-label={`${key} eyes`} aria-pressed={a.eyeColorId===key} onClick={()=>update('eyeColorId',key as Appearance['eyeColorId'])}/>)}</div></fieldset>
        <fieldset><legend>Hairstyle</legend><div className="segmented hairstyle-options">{styles.map(style=><button type="button" key={style.id} aria-pressed={a.hairStyleId===style.id} onClick={()=>update('hairStyleId',style.id)}><HairstyleThumbnail style={style.id} color={a.hairColorId} gender={a.gender}/>{style.label}</button>)}</div></fieldset>
        <fieldset><legend>Hair color</legend><div className="swatches">{Object.entries(colors.hair).map(([key,color])=><button type="button" className="swatch" key={key} style={{background:color}} aria-label={`${key} hair`} aria-pressed={a.hairColorId===key} onClick={()=>update('hairColorId',key as Appearance['hairColorId'])}/>)}</div></fieldset>
        <fieldset data-sound="transform"><legend>Expression</legend><div className="segmented">{([{id:'smile',label:'Smiling'},{id:'neutral',label:'Neutral'}] as const).map(expression=><button key={expression.id} type="button" data-sound="transform" aria-pressed={a.expressionId===expression.id} onClick={()=>update('expressionId',expression.id)}>{expression.label}</button>)}</div></fieldset>
        {error&&<p role="alert" className="error">{error}</p>}<button className="primary full-width" type="submit">{onCancel?'Save character':'Begin your adventure'} <span>→</span></button>
        <p className="save-note">Create a player to begin. Sign in to save progress to your account.</p>{onCancel&&<button type="button" className="quiet-button full-width" onClick={onCancel}>Cancel editing</button>}
      </form>
    </section>
  </main>;
}

function ComplexionThumbnail({appearance}:{appearance:Appearance}){
  const base=appearance.gender==='female'?femaleBase(appearance):{src:`/avatars/new-male-bases/Aligned-Avatars/Complexion-${appearance.complexionId}-${appearance.expressionId}.png`,placement:{x:0,y:0,width:1024,height:1536}};
  return <svg className="complexion-thumbnail" viewBox="270 -30 500 500" aria-hidden="true"><image href={base.src} {...base.placement}/></svg>;
}
