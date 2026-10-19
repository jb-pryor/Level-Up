import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccountState } from '../auth/useAccount';
import type { Player } from '../types';
import { validPlayer, type LoadResult } from '../game/save';
import { accountCacheKey, GUEST_SAVE_KEY, LEGACY_OWNER_KEY, saveGuest, clearGuest, readCache, cloudPlayer, reconcileCache, guestLoad, unclaimedPlayer, type AccountCache, type CloudSave } from '../game/accountSave';

type Stage='loading'|'ready'|'link'|'error'|'conflict';
const message=(e:unknown)=>e&&typeof e==='object'&&'message' in e?String(e.message):'Could not connect to your account save.';
export function usePlayerSave(account:AccountState){
  const id=account.session?.user.id??null;
  const [stage,setStage]=useState<Stage>('loading');
  const [seed,setSeed]=useState<LoadResult>({status:'empty',player:null});
  const [generation,setGeneration]=useState(0);
  const [candidate,setCandidate]=useState<Player|null>(null);
  const [status,setStatus]=useState(''),[error,setError]=useState('');
  const cache=useRef<AccountCache|null>(null),running=useRef<Promise<boolean>|null>(null);
  const conflict=useRef(false);
  const alive=useRef(true),loadVersion=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const safeStatus=(value:string)=>{if(alive.current)setStatus(value);};
  const writeCache=(value:AccountCache)=>{
    cache.current=value;
    try{localStorage.setItem(accountCacheKey(value.userId),JSON.stringify(value));return true;}
    catch{safeStatus('Browser backup unavailable. Keep this page open until your account save finishes.');return false;}
  };
  const client=async()=>{
    const {supabase:db}=await import('../lib/supabase');
    if(!db||!id)throw new Error('Account connection unavailable.');
    const {data,error}=await db.auth.getSession();if(error)throw error;
    if(data.session?.user.id!==id)throw new Error('Account changed. This player stays with its original account.');
    return {db,bearer:`Bearer ${data.session.access_token}`};
  };
  const flush=useCallback(async():Promise<boolean>=>{
    if(!id)return true;
    if(conflict.current)return false;
    if(running.current)return running.current;
    const work=(async()=>{
      try{
        while(cache.current?.dirty){
          const snapshot={...cache.current};
          safeStatus('Saving to your account…');
          const {db,bearer}=await client();
          const {data,error}=await db.rpc('save_account_player',{p_player:snapshot.player,p_expected_revision:snapshot.revision,p_mutation_id:snapshot.mutationId}).setHeader('Authorization',bearer);
          if(error)throw error;
          const revision=Number(data);if(!Number.isSafeInteger(revision)||revision<=snapshot.revision)throw new Error('Unexpected save response. Please retry.');
          const latest=cache.current!;
          writeCache({...latest,revision,dirty:latest.mutationId!==snapshot.mutationId});
        }
        safeStatus('Saved to your account');return true;
      }catch(failure){
        const detail=message(failure);
        if(alive.current&&detail.includes('PLAYER_SAVE_CONFLICT')){conflict.current=true;setStage('conflict');setError('This account has newer progress from another session. Your local changes have been kept as a backup.');}
        else safeStatus(`Not synced yet: ${detail} Your changes will retry when you reconnect.`);
        return false;
      }
    })();
    running.current=work;
    try{return await work;}finally{running.current=null;}
  },[id]);
  const load=useCallback(async(discardLocal=false)=>{
    const version=++loadVersion.current;
    setStage('loading');setError('');
    try{
      if(!id){
        let local:LoadResult;
        try{local=guestLoad(localStorage);}catch{local={status:'unavailable',player:null};}
        if(!alive.current||version!==loadVersion.current)return;
        setSeed(local);setGeneration(n=>n+1);setStage('ready');return;
      }
      const raw=localStorage.getItem(accountCacheKey(id));
      const local=readCache(raw,id);cache.current=local;
      const {db,bearer}=await client();
      const {data,error}=await db.from('player_saves').select('schema_version,player,revision,mutation_id').eq('user_id',id).maybeSingle().setHeader('Authorization',bearer);
      if(error)throw error;
      if(!alive.current||version!==loadVersion.current)return;
      const row=data as CloudSave|null;
      if(row)cloudPlayer(row); // Validate before replacing any backup.
      const decision=discardLocal?'cloud':reconcileCache(local,row);
      if(decision==='conflict'){conflict.current=true;setStage('conflict');setError('This account has newer progress from another session. Your local changes have been kept as a backup.');return;}
      if(decision==='pending'){
        setSeed({status:'ready',player:local!.player});setGeneration(n=>n+1);setStage('ready');void flush();return;
      }
      if(row){
        if(discardLocal&&local?.dirty)localStorage.setItem(`${accountCacheKey(id)}:conflict:${Date.now()}`,JSON.stringify(local));
        const player=cloudPlayer(row);
        conflict.current=false;
        writeCache({userId:id,revision:row.revision,player,dirty:false,mutationId:row.mutation_id});
        setSeed({status:'ready',player});setGeneration(n=>n+1);setStage('ready');safeStatus('Saved to your account');return;
      }
      const guest=unclaimedPlayer(localStorage);
      setCandidate(guest);setStage('link');
    }catch(failure){
      if(!alive.current||version!==loadVersion.current)return;
      const detail=message(failure);
      setError(/PGRST|player_saves|save_account_player|schema cache/i.test(detail)?'Account saving needs database migration 002. Run supabase/migrations/002_account_player_saves.sql in your Supabase SQL Editor, then retry.':detail);
      setStage('error');
    }
  },[id,flush]);
  useEffect(()=>{
    alive.current=true;void load();
    const retry=()=>{if(cache.current?.dirty)void flush();};
    const interval=setInterval(retry,15000);window.addEventListener('online',retry);
    const warn=(e:BeforeUnloadEvent)=>{if(cache.current?.dirty){e.preventDefault();e.returnValue='';}};
    window.addEventListener('beforeunload',warn);
    return()=>{alive.current=false;++loadVersion.current;clearTimeout(timer.current);clearInterval(interval);window.removeEventListener('online',retry);window.removeEventListener('beforeunload',warn);};
  },[load,flush]);
  const link=async(useCandidate:boolean)=>{
    if(!id)return;
    setStage('loading');setError('');
    try{
      const owner=localStorage.getItem(LEGACY_OWNER_KEY);
      if(useCandidate&&owner&&owner!==id&&!localStorage.getItem(GUEST_SAVE_KEY))throw new Error('That browser player has already been linked to another account.');
      const player=useCandidate?candidate:null;
      if(!writeCache({userId:id,revision:0,player,dirty:true,mutationId:crypto.randomUUID()}))throw new Error('Could not back up this player. Restore browser storage before linking it.');
      if(useCandidate){localStorage.setItem(LEGACY_OWNER_KEY,id);localStorage.removeItem(GUEST_SAVE_KEY);}
      if(!await flush()){if(alive.current)setStage(old=>old==='conflict'?old:'link');return;}
      if(useCandidate)localStorage.setItem(LEGACY_OWNER_KEY,id);
      if(!alive.current)return;
      setSeed({status:'ready',player});setGeneration(n=>n+1);setStage('ready');
    }catch(failure){setError(message(failure));setStage('link');}
  };
  const save=useCallback((player:Player|null)=>{
    if(player&&!validPlayer(player))return false;
    if(!id){if(!player)return true;try{return saveGuest(localStorage,player);}catch{return false;}}
    const previous=cache.current;if(!previous)return false;
    if(JSON.stringify(previous.player)===JSON.stringify(player))return true;
    const localOk=writeCache({...previous,player,dirty:true,mutationId:crypto.randomUUID()});
    safeStatus('Saving to your account…');clearTimeout(timer.current);timer.current=setTimeout(()=>void flush(),250);
    return localOk;
  },[id,flush]);
  const reset=async()=>{
    if(!id){try{return clearGuest(localStorage);}catch{return false;}}
    // Confirm the tombstone remotely before clearing the visible player.
    if(!await flush())return false;
    const previous=cache.current!;
    try{
      const {db,bearer}=await client();
      const mutationId=crypto.randomUUID();
      const {data,error}=await db.rpc('save_account_player',{p_player:null,p_expected_revision:previous.revision,p_mutation_id:mutationId}).setHeader('Authorization',bearer);if(error)throw error;
      writeCache({userId:id,revision:Number(data),player:null,dirty:false,mutationId});safeStatus('Saved to your account');return true;
    }catch(failure){safeStatus(`Reset was not confirmed: ${message(failure)} Please retry before making more changes.`);return false;}
  };
  const downloadBackup=()=>{
    const blob=new Blob([JSON.stringify(cache.current,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='level-up-player-backup.json';a.click();URL.revokeObjectURL(url);
  };
  return {stage,seed,generation,candidate,status,error,load,link,save,reset,flush,downloadBackup};
}
export type PlayerSaveState=ReturnType<typeof usePlayerSave>;
