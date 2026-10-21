import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Player } from '../types';
import { outboxKey, parseOutbox, sharedProfile, type PendingActivity, type SharedProfile } from '../game/householdActivity';

export type Member = { user_id:string; username:string; display_name:string; level:number; avatar:unknown };
export type Activity = { id:string; display_name:string; level:number; avatar:unknown; quest_name:string; completed_at:string };
type Household = { id:string; name:string; owner_id:string };
type Invite = { code:string; expires_at:string };
const PAGE_SIZE=30;
const detail=(error:unknown)=>error && typeof error==='object' && 'message' in error ? String(error.message) : 'Could not reach your household. Please try again.';

export function useHousehold(session:Session|null,player:Player|null) {
  const userId=session?.user.id??null;
  const [view,setView]=useState<{userId:string;household:Household|null;members:Member[];invite:Invite|null;activity:Activity[]}|null>(null);
  const [loading,setLoading]=useState(false),[error,setError]=useState(''),[syncError,setSyncError]=useState('');
  const [hasMore,setHasMore]=useState(false),[busy,setBusy]=useState(false);
  const current=useRef({userId,player});current.current={userId,player};
  const visibleCount=useRef(PAGE_SIZE);
  visibleCount.current=Math.max(PAGE_SIZE,view?.userId===userId?view.activity.length:0);
  const membership=useRef<{userId:string;id:string}|null>(null);
  const queue=useRef<{userId:string;events:PendingActivity[];loaded:boolean}>({userId:'',events:[],loaded:false});
  const running=useRef(false),readVersion=useRef(0);
  const household=view?.userId===userId?view.household:null;
  const persist=()=>{
    try { localStorage.setItem(outboxKey(queue.current.userId),JSON.stringify(queue.current.events)); return true; }
    catch { setSyncError('Activity is waiting to sync, but browser storage is unavailable. Keep this page open and retry.');return false; }
  };
  const refresh=useCallback(async()=>{
    if(!userId)return;
    const version=++readVersion.current;
    setLoading(true);
    try {
      const {supabase:db}=await import('../lib/supabase');if(!db)throw new Error('Account connection is unavailable.');
      const {data:member,error}=await db.from('household_members').select('household_id').eq('user_id',userId).maybeSingle();if(error)throw error;
      if(current.current.userId!==userId||version!==readVersion.current)return;
      if(!member){membership.current=null;setView({userId,household:null,members:[],invite:null,activity:[]});setError('');return;}
      const id=member.household_id as string;
      const count=visibleCount.current;
      const results=await Promise.all([
        db.from('households').select('id,name,owner_id').eq('id',id).single(),
        db.from('household_members').select('user_id').eq('household_id',id),
        db.from('household_invites').select('code,expires_at').eq('household_id',id).maybeSingle(),
        db.from('household_activity').select('id,display_name,level,avatar,quest_name,completed_at').eq('household_id',id).order('completed_at',{ascending:false}).order('id').range(0,count-1)
      ]);
      for(const result of results)if(result.error)throw result.error;
      const memberIds=(results[1].data??[]).map(m=>m.user_id);
      const profiles=await db.from('player_profiles').select('user_id,username,display_name,level,avatar').in('user_id',memberIds);if(profiles.error)throw profiles.error;
      if(current.current.userId!==userId||version!==readVersion.current)return;
      membership.current={userId,id};
      setView({userId,household:results[0].data as Household,members:profiles.data as Member[],invite:results[2].data as Invite|null,activity:results[3].data as Activity[]});
      setHasMore(results[3].data?.length===count);setError('');
    }catch(failure){if(current.current.userId===userId&&version===readVersion.current)setError(detail(failure));}
    finally{if(current.current.userId===userId&&version===readVersion.current)setLoading(false);}
  },[userId]);
  const flush=useCallback(async()=>{
    if(!userId||running.current||queue.current.userId!==userId||!queue.current.loaded)return;
    running.current=true;
    try{
      const {supabase:db}=await import('../lib/supabase');if(!db)return;
      const sameAccount=async()=>{
        if(current.current.userId!==userId)return false;
        const {data}=await db.auth.getSession();return data.session?.user.id===userId;
      };
      const authorization=async()=>{
        const {data}=await db.auth.getSession();
        if(current.current.userId!==userId||data.session?.user.id!==userId)throw new Error('Account changed.');
        return `Bearer ${data.session.access_token}`;
      };
      let sent=false;
      const update=async(profile:SharedProfile)=>{
        if(!await sameAccount())throw new Error('Account changed. Activity remains queued for its original account.');
        const {error}=await db.rpc('update_player_profile',{p_display_name:profile.displayName,p_level:profile.level,p_avatar:profile.avatar}).setHeader('Authorization',await authorization());if(error)throw error;
      };
      // One writer preserves each event snapshot, then restores the current profile.
      while(queue.current.userId===userId&&queue.current.events.length){
        const event=queue.current.events[0];
        await update(event.profile);
        if(!await sameAccount())return;
        const {error}=await db.rpc('record_household_activity',{p_event_id:event.id,p_household_id:event.householdId,p_quest_id:event.questId,p_completed_at:event.completedAt}).setHeader('Authorization',await authorization());if(error)throw error;
        if(queue.current.userId!==userId)return;
        queue.current.events.shift();persist();sent=true;
      }
      if(current.current.userId===userId&&current.current.player)await update(sharedProfile(current.current.player));
      if(current.current.userId===userId&&persist())setSyncError('');
      if(sent&&current.current.userId===userId)await refresh();
    }catch(failure){
      if(current.current.userId===userId){
        const reason=detail(failure);
        setSyncError(reason.includes('Unknown quest')
          ? 'Household needs the latest quest database update (migration 004). Your rewards are unaffected and pending activity is kept. After updating Supabase, retry household sync.'
          : `Household sync paused: ${reason} Your personal rewards are saved normally. Retry to send pending activity.`);
      }
    }
    finally{running.current=false;}
  },[userId,refresh]);
  useEffect(()=>{
    membership.current=null;setView(null);setError('');setSyncError('');setLoading(!!userId);setHasMore(false);
    if(!userId){queue.current={userId:'',events:[],loaded:false};return;}
    try{queue.current={userId,events:parseOutbox(localStorage.getItem(outboxKey(userId)),userId),loaded:true};}
    catch{queue.current={userId,events:[],loaded:false};setSyncError('Saved household activity could not be read. It has been left untouched; new activity cannot be queued yet.');}
    void refresh();void flush();
    const retry=()=>{void refresh();void flush();};
    const timer=window.setInterval(()=>{if(document.visibilityState==='visible')retry();},30000);
    window.addEventListener('online',retry);
    return()=>{clearInterval(timer);window.removeEventListener('online',retry);};
  },[userId,refresh,flush]);
  const profile=player?JSON.stringify(sharedProfile(player)):'';
  useEffect(()=>{void flush();},[profile,flush]);
  const recordCompletion=useCallback((questId:string,next:Player,now:number)=>{
    const joined=membership.current;
    if(!userId||joined?.userId!==userId)return;
    if(queue.current.userId!==userId||!queue.current.loaded){setSyncError('This completion could not be shared because the saved activity queue is unavailable. Your personal reward still works.');return;}
    try {
      queue.current.events.push({id:crypto.randomUUID(),userId,householdId:joined.id,questId,completedAt:new Date(now).toISOString(),profile:sharedProfile(next)});
      persist();void flush();
    } catch { setSyncError('This completion could not be queued for sharing. Your personal reward is unchanged.'); }
  },[userId,flush]);
  const mutate=async(name:'household_create'|'household_join'|'household_refresh_invite'|'household_leave',args?:Record<string,string>)=>{
    if(!userId||busy)return false;setBusy(true);setError('');
    try{
      const {supabase:db}=await import('../lib/supabase');if(!db)throw new Error('Account connection unavailable.');
      if(name==='household_leave'&&queue.current.events.length){await flush();if(queue.current.events.length)throw new Error('Please sync your pending activity before leaving the household.');}
      const {data:auth}=await db.auth.getSession();
      if(current.current.userId!==userId||auth.session?.user.id!==userId)throw new Error('Account changed. Please try again.');
      const {error}=await db.rpc(name,args).setHeader('Authorization',`Bearer ${auth.session.access_token}`);if(error)throw error;
      if(name==='household_leave')membership.current=null;
      await refresh();return true;
    }catch(failure){if(current.current.userId===userId)setError(detail(failure));return false;}
    finally{setBusy(false);}
  };
  const loadMore=async()=>{
    if(!household||busy||loading)return;setBusy(true);
    const id=household.id,offset=view?.activity.length??0;
    try{
      const {supabase:db}=await import('../lib/supabase');if(!db)return;
      const {data,error}=await db.from('household_activity').select('id,display_name,level,avatar,quest_name,completed_at').eq('household_id',id).order('completed_at',{ascending:false}).order('id').range(offset,offset+PAGE_SIZE-1);if(error)throw error;
      if(current.current.userId!==userId)return;
      setView(old=>old?.household?.id===id?{...old,activity:[...old.activity,...(data as Activity[]).filter(e=>!old.activity.some(existing=>existing.id===e.id))]}:old);setHasMore(data.length===PAGE_SIZE);
    }catch(failure){if(current.current.userId===userId)setError(detail(failure));}finally{setBusy(false);}
  };
  return {household,members:view?.userId===userId?view.members:[],invite:view?.userId===userId?view.invite:null,activity:view?.userId===userId?view.activity:[],loading,error,syncError,busy,hasMore,refresh,loadMore,mutate,recordCompletion,retry:()=>{void refresh();void flush();}};
}
export type HouseholdState=ReturnType<typeof useHousehold>;
