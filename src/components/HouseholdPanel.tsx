import { useState, type FormEvent } from 'react';
import type { HouseholdState } from '../household/useHousehold';
import { headAppearance } from '../game/householdActivity';
import { Avatar } from './Avatar';

function Portrait({avatar,name}:{avatar:unknown;name:string}){
  return <div className="household-portrait" aria-label={`${name}'s avatar`}><Avatar appearance={headAppearance(avatar,name)}/></div>;
}
export function HouseholdPanel({state,userId}:{state:HouseholdState;userId:string}){
  const [tab,setTab]=useState<'activity'|'members'>('activity');
  const [name,setName]=useState(''),[code,setCode]=useState('');
  const [copied,setCopied]=useState(''),[confirmLeave,setConfirmLeave]=useState(false);
  const {household,members,invite,activity,loading,busy,error,syncError}=state;
  const create=async(e:FormEvent)=>{e.preventDefault();await state.mutate('household_create',{p_name:name.trim()});};
  const join=async(e:FormEvent)=>{e.preventDefault();await state.mutate('household_join',{p_code:code.trim()});};
  const owner=household?.owner_id===userId;
  const inviteExpired=!invite||Date.parse(invite.expires_at)<=Date.now();
  return <section className="household-panel" aria-label="Your household">
    {(error||syncError)&&<div className="account-error" role="alert"><p>{error||syncError}</p><button className="quiet-button" disabled={loading||busy} onClick={state.retry}>Retry</button></div>}
    {loading&&!household?<p role="status">Loading household…</p>:!household?<>
      <h3>Build your party.</h3><p>Create a household or join one with an invite code. You can belong to one household at a time.</p>
      <div className="household-entry-grid"><form className="account-form" onSubmit={create}><fieldset disabled={busy||loading}><label>Household name<input required maxLength={60} value={name} onChange={e=>setName(e.target.value)} placeholder="The dishwashing guild"/></label><button className="primary" type="submit">{busy?'Please wait…':'Create household'}</button></fieldset></form>
      <form className="account-form" onSubmit={join}><fieldset disabled={busy||loading}><label>Invite code<input required maxLength={32} autoCapitalize="none" spellCheck={false} value={code} onChange={e=>setCode(e.target.value)} placeholder="Paste your invite code"/></label><button className="quiet-button" type="submit">Join household</button></fieldset></form></div>
    </>:<>
      <div className="household-title"><h3>{household.name}</h3><span className="household-member-count">{members.length} {members.length===1?'member':'members'}</span></div>
      <details className="household-invite"><summary>Invite your party</summary><p>Share this code with someone you want to join your household.</p>{invite?<><label>Invite code<input readOnly value={invite.code} onFocus={e=>e.target.select()} aria-label="Household invite code"/></label><p className="muted">{inviteExpired?'This invite has expired.':`Expires ${new Date(invite.expires_at).toLocaleString()}`}</p><div className="household-controls"><button className="quiet-button" disabled={inviteExpired} onClick={async()=>{try{await navigator.clipboard.writeText(invite.code);setCopied('Copied!');}catch{setCopied('Select the code above and copy it manually.');}}}>Copy code</button>{owner&&<button className="quiet-button" disabled={busy} onClick={async()=>{if(await state.mutate('household_refresh_invite'))setCopied('New code ready. The previous code no longer works.');}}>New invite code</button>}</div></>:<p>No invite available.</p>}{copied&&<p role="status">{copied}</p>}</details>
      <nav className="household-tabs" aria-label="Household views"><button className="quiet-button" aria-pressed={tab==='activity'} onClick={()=>setTab('activity')}>Activity</button><button className="quiet-button" aria-pressed={tab==='members'} onClick={()=>setTab('members')}>Members ({members.length})</button><button className="account-text-button" disabled={loading||busy} onClick={()=>void state.refresh()}>{loading?'Refreshing…':'Refresh'}</button></nav>
      {tab==='members'?<div className="household-rows" aria-label="Household members">{members.map(member=><article className="household-row" key={member.user_id}><Portrait avatar={member.avatar} name={member.display_name}/><div><strong>{member.display_name}</strong><p>@{member.username}{member.user_id===userId?' · You':''}{member.user_id===household.owner_id?' · Owner':''}</p></div><span className="household-row-level">Level {member.level}</span></article>)}</div>:<>
        {!activity.length?<div className="household-empty"><span aria-hidden="true">✦</span><p>No household activity yet. Complete a quest to give your party something to applaud.</p><p className="muted">Only quests completed while signed in and in this household are shared.</p></div>:<div className="household-rows" aria-label="Household activity">{activity.map(event=><article className="household-row" key={event.id}><Portrait avatar={event.avatar} name={event.display_name}/><div><strong>{event.display_name}</strong><span className="household-row-level"> · Level {event.level}</span><p>Completed <strong>{event.quest_name}</strong></p><time dateTime={event.completed_at}>{new Date(event.completed_at).toLocaleString()}</time></div></article>)}</div>}
        {state.hasMore&&<button className="quiet-button household-load-more" disabled={busy||loading} onClick={()=>void state.loadMore()}>{busy?'Loading…':'Older activity'}</button>}
      </>}
      <p className="muted household-refresh-note">Updates every 30 seconds. Your household sees your player name, avatar, level and completed quests.</p>
      {confirmLeave?<div className="household-leave-confirm"><p>{owner?'Delete this household? This removes its invite and shared activity. Your personal player stays saved.':'Leave this household? Your past activity remains with the household. Your personal player stays saved.'}</p><div className="household-controls"><button className="quiet-button reset-player-button" disabled={busy} onClick={async()=>{if(await state.mutate('household_leave'))setConfirmLeave(false);}}>{owner?'Delete household':'Leave household'}</button><button className="quiet-button" disabled={busy} onClick={()=>setConfirmLeave(false)}>Cancel</button></div></div>:<button className="account-text-button" onClick={()=>setConfirmLeave(true)}>{owner?'Delete household':'Leave household'}</button>}
      {owner&&members.length>1&&<p className="muted">The owner can delete the household after the other members leave.</p>}
    </>}
  </section>;
}
