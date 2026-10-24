import { completeWithLevelGate } from './game/completionGate';
import { usePlayerSave, type PlayerSaveState } from './account/usePlayerSave';
import type { AccountState } from './auth/useAccount';
import { useHousehold } from './household/useHousehold';
import { useAccount } from './auth/useAccount';
import { MusicToggle } from './components/MusicToggle';
import { CoinIcon } from './components/CoinIcon';
import { lazy, Suspense, useEffect, useReducer, useRef, useState } from 'react';
import { CharacterSetup } from './components/CharacterSetup';
import { Avatar } from './components/Avatar';
import { LevelUpCelebration } from './components/LevelUpCelebration';
import { Wardrobe, WardrobeDetails, ItemPicture, type Slot } from './components/Wardrobe';
import { QuestCatalog } from './components/QuestCatalog';
import { DailyQuests } from './components/DailyQuests';
import { FavoriteQuests } from './components/FavoriteQuests';
import { PersonalStats } from './components/PersonalStats';
import { ShopPanel } from './components/ShopPanel';
import { Modal } from './components/Modal';
import { gameReducer } from './game/gameReducer';
import { levelFor, xpIntoLevel, xpForNextLevel } from './game/progression';
import type { Outfit } from './types';
import { starterOutfit } from './types';
import { cosmetics } from './data/cosmetics';

import { RewardEffects } from './components/RewardEffects';
import { useAnimatedNumber } from './game/useAnimatedNumber';
import { playSound, setSoundEnabled, soundEnabled, unlockAudio, playTransformationSound } from './game/soundEffects';

const HouseholdSetup=lazy(()=>import('./components/HouseholdSetup').then(module=>({default:module.HouseholdSetup})));

export default function App(){
  const account=useAccount();
  if(account.loading)return <main className="dashboard"><section className="quest-card" role="status"><h2>Loading your account…</h2></section></main>;
  return <PlayerSession key={account.session?.user.id??'guest'} account={account}/>;
}
function PlayerSession({account}:{account:AccountState}){
  const saves=usePlayerSave(account);
  if(saves.stage!=='ready')return <SaveGate account={account} saves={saves}/>;
  return <GameApp key={saves.generation} account={account} saves={saves}/>;
}
function SaveGate({account,saves}:{account:AccountState;saves:PlayerSaveState}){
  const household=useHousehold(account.session,null);
  const [accountOpen,setAccountOpen]=useState(false);
  return <main className="dashboard"><section className="quest-card account-save-gate">
    <h2>{saves.stage==='loading'?'Loading your player…':saves.stage==='link'?'Your account, your player.':saves.stage==='conflict'?'Your player has newer progress.':'Your player could not be loaded'}</h2>
    {saves.error&&<p role="alert">{saves.error}</p>}
    {saves.stage==='link'&&<><p>{saves.candidate?<>Link <strong>{saves.candidate.name}</strong> and their XP, coins, clothes and quests to <strong>@{String(account.session?.user.user_metadata.username||'your account')}</strong>? This is a one-time choice.</>:'This account has no saved player yet. Create one to start your adventure.'}</p><div className="household-controls">{saves.candidate&&<button className="primary" onClick={()=>void saves.link(true)}>Link this player</button>}<button className="quiet-button" onClick={()=>void saves.link(false)}>{saves.candidate?'Start a new player':'Create my player'}</button></div></>}
    {saves.stage==='conflict'&&<><p>Download your local backup before loading the account’s latest save. This keeps older progress from overwriting another device.</p><div className="household-controls"><button className="quiet-button" onClick={saves.downloadBackup}>Download local backup</button><button className="primary" onClick={()=>{if(window.confirm('Load the latest account save? Your unsynced local progress will be archived in this browser, rather than merged.'))void saves.load(true);}}>Load account save</button></div></>}
    {saves.stage==='error'&&<button className="primary" onClick={()=>void saves.load()}>Retry loading</button>}
    {saves.status&&<p role="status">{saves.status}</p>}
    <button className="account-text-button" onClick={()=>setAccountOpen(true)}>Account</button>
    {(accountOpen||account.recovery)&&<Modal title="Account" onClose={()=>{setAccountOpen(false);account.finishRecovery();}}><Suspense fallback={<p>Loading account…</p>}><HouseholdSetup account={account} household={household} beforeSignOut={async()=>true}/></Suspense></Modal>}
  </section></main>;
}
function GameApp({account,saves}:{account:AccountState;saves:PlayerSaveState}) {
  const loaded=saves.seed;
  const [recoveryNeeded,setRecoveryNeeded]=useState(loaded.status==='invalid');
  const [saveFailed,setSaveFailed]=useState(loaded.status==='unavailable');
  const [game,dispatch]=useReducer(gameReducer,{player:loaded.player,notice:null});
  const player=game.player;
  const completionGate=useRef({state:game,blocked:false});
  completionGate.current.state=game;
  const [completionLocked,setCompletionLocked]=useState(false);
  const household=useHousehold(account.session,player);
  const completedClicks=useRef(new Set<string>());
  useEffect(()=>{completedClicks.current.clear();},[player]);
  useEffect(()=>{
    if(player&&!recoveryNeeded)setSaveFailed(!saves.save(player));
  },[player,recoveryNeeded,saves.save]);
  const [soundOn,setSoundOn]=useState(soundEnabled);
  useEffect(()=>{
    const click=(event:MouseEvent)=>{
      if(!(event.target instanceof Element))return;
      const control=event.target.closest('button, input[type="checkbox"]');
      if(!control||(control instanceof HTMLButtonElement&&control.disabled))return;
      const cue=control.closest('[data-sound]')?.getAttribute('data-sound');
      if(cue==='transform'){void playTransformationSound();return;}
      unlockAudio();if(!['purchase','add-quest'].includes(cue??''))playSound('click');
    };
    document.addEventListener('click',click,true);
    return()=>document.removeEventListener('click',click,true);
  },[]);
  const purchaseItem=cosmetics.find(item=>item.id===game.notice?.purchaseItemId);
  useEffect(()=>{if(purchaseItem)playSound('purchase')},[purchaseItem]);
  const newItemBadge=player&&player.newItemIds.length>0?<span className="new-item-badge" aria-label={`${player.newItemIds.length} new wardrobe items`}>{player.newItemIds.length}</span>:null;
  const xpTarget=useRef<HTMLDivElement>(null),coinTarget=useRef<HTMLDivElement>(null);
  const rewardSource=useRef<{x:number;y:number}|null>(null);
  const [claimedSequence,setClaimedSequence]=useState(0);
  const rewardPending=!!game.notice?.reward && game.notice.sequence!==claimedSequence;
  const displayedXp=useAnimatedNumber(player?.totalXp??0,true,rewardPending);
  const displayedCoins=useAnimatedNumber(player?.coins??0,false,rewardPending);
  const [editing,setEditing]=useState(false);
  const [resetOpen,setResetOpen]=useState(false);
  const [resetError,setResetError]=useState(false);
  const [resetBusy,setResetBusy]=useState(false);
  const resetPlayer=async()=>{
    if(resetBusy)return;setResetBusy(true);
    if(!await saves.reset()){setResetError(true);setResetBusy(false);return;}
    setResetBusy(false);
    dispatch({type:'reset-player'});setResetOpen(false);setResetError(false);
    setEditing(false);setCatalogOpen(false);setPanel('quests');
    setDraftOutfit({...starterOutfit});setClaimedSequence(0);setSaveFailed(false);
    rewardSource.current=null;
  };
  const [panel,setPanel]=useState<'quests'|'shop'|'wardrobe'|'stats'>('quests');
  const wardrobe=panel==='wardrobe';
  const [wardrobeTab,setWardrobeTab]=useState<Slot>('shirt');
  const [catalogOpen,setCatalogOpen]=useState(false);
  const [householdOpen,setHouseholdOpen]=useState(false);
  const openCatalog=()=>{dispatch({type:'clear-notice'});setCatalogOpen(true)};
  const [draftOutfit,setDraftOutfit]=useState<Outfit>(starterOutfit);
  const openPanel=(next:typeof panel)=>{dispatch({type:'clear-notice'});setPanel(next)};
  const openWardrobe=()=>{if(player){setDraftOutfit({...player.equipped});setWardrobeTab('shirt');dispatch({type:'open-wardrobe'});setPanel('wardrobe')}};
  const completeQuest=(questId:string,element:HTMLInputElement)=>{
    if(completionGate.current.blocked||completedClicks.current.has(questId))return;
    const now=Date.now();
    const prior=completionGate.current.state;
    const gated=completeWithLevelGate(completionGate.current,questId,now);
    completionGate.current=gated;
    const next=gated.state;
    if(next===prior)return;
    if(gated.blocked)setCompletionLocked(true);
    if(next.player&&next.notice?.reward&&next.player!==player){
      completedClicks.current.add(questId);
      household.recordCompletion(questId,next.player,now);
    }
    const rect=element.getBoundingClientRect();
    rewardSource.current={x:rect.left+rect.width/2,y:rect.top+rect.height/2};
    dispatch({type:'complete',questId,now});
  };
  return <><header className="app-header"><a href="#" className="brand" onClick={e=>e.preventDefault()}><span className="brand-icon">↑</span>Level Up<span className="brand-dot">.</span></a><span className="header-note">SMALL ACTIONS. BIG ADVENTURES.</span><div className="header-player-actions"><button className="quiet-button account-header-button" onClick={()=>setHouseholdOpen(true)}>{account.session?'Account':'Sign in'}</button><button className="quiet-button sound-toggle" aria-pressed={soundOn} aria-label={soundOn?'Mute sound effects':'Enable sound effects'} onClick={()=>{const next=!soundOn;setSoundOn(next);setSoundEnabled(next);if(next){unlockAudio();playSound('click')}}}>{soundOn?'Sound on':'Sound off'}</button>{player&&<>{!editing&&<button className="quiet-button" disabled={completionLocked} onClick={()=>{setEditing(true);setCatalogOpen(false);openPanel('quests')}}>Edit character</button>}<div className="coin-balance" ref={coinTarget} aria-label={`${Math.round(displayedCoins)} coins`}><span aria-hidden="true"><CoinIcon/> {Math.round(displayedCoins)} coins</span></div></>}</div></header>
    {account.session&&saves.status.startsWith('Not synced yet:')&&<div className="storage-warning" role="alert">{saves.status} <button className="quiet-button" onClick={()=>void saves.flush()}>Retry saving</button></div>}
    {household.syncError&&!householdOpen&&<div className="storage-warning" role="status">{household.syncError} <button className="quiet-button" onClick={household.retry}>Retry household sync</button></div>}
    {saveFailed&&<div className="storage-warning" role="alert">Progress cannot be saved in this browser right now. Your current session still works, but changes may be lost when you close or refresh. <button className="quiet-button" onClick={()=>{if(player)setSaveFailed(!saves.save(player));else void saves.flush()}}>Retry saving</button></div>}
    {recoveryNeeded?<main className="dashboard"><section className="quest-card"><h2>Your save could not be loaded</h2><p>The saved data is unreadable or from an unsupported version. It has been left untouched. Starting fresh will replace it once you create a new character.</p><button className="primary" onClick={()=>setRecoveryNeeded(false)}>Start fresh</button></section></main>:!player||editing?<CharacterSetup key={editing?'edit':'new'} initialAppearance={player??undefined} onCancel={editing?()=>setEditing(false):undefined} onCreate={appearance=>{dispatch({type:player?'edit':'create',appearance});setEditing(false)}}/>:
    <main className="dashboard">
      <div className={`dashboard-grid${wardrobe?' wardrobe-workspace':''}`}><section className="player-card"><div className="player-title"><h2>{player.name}</h2><span className="level-pill">LEVEL {levelFor(Math.floor(displayedXp))}</span></div><div className="xp-label"><span>{levelFor(Math.floor(displayedXp))===1?'A fresh start':'Keep leveling up'}</span><span>{Math.round(xpIntoLevel(displayedXp))} / {xpForNextLevel(levelFor(displayedXp))} XP</span></div><div className="xp-track" ref={xpTarget} role="progressbar" aria-label="XP toward next level" aria-valuemin={0} aria-valuemax={xpForNextLevel(levelFor(displayedXp))} aria-valuenow={Math.round(xpIntoLevel(displayedXp))}><div style={{width:`${100*xpIntoLevel(displayedXp)/xpForNextLevel(levelFor(displayedXp))}%`}}/></div><div className="player-avatar-zone"><Avatar showClothingInfo appearance={player} outfit={wardrobe?draftOutfit:player.equipped}/><LevelUpCelebration deferred={rewardPending} level={levelFor(player.totalXp)} onAcknowledge={()=>{completionGate.current.blocked=false;setCompletionLocked(false);}}/></div><div className="player-bottom-actions"><button className="quiet-button" onClick={openWardrobe}><svg className="wardrobe-hanger" viewBox="0 0 20 18" aria-hidden="true"><path d="M8 4a2 2 0 1 1 4 0c0 1-2 1.5-2 3v1L2 14v2h16v-2l-8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter"/></svg> Wardrobe {newItemBadge}</button><button className="quiet-button reset-player-button" onClick={()=>{setResetError(false);setResetOpen(true)}}>Reset player</button></div></section>
      <div className="quest-zone">
        {!wardrobe&&<nav className="panel-nav" aria-label="Quest panel views"><button className="quiet-button" aria-pressed={panel==='quests'} onClick={()=>openPanel('quests')}>Daily quests</button><button className="quiet-button" aria-pressed={panel==='shop'} onClick={()=>openPanel('shop')}>Shop</button><button className="quiet-button" aria-pressed={panel==='stats'} onClick={()=>openPanel('stats')}>Personal Stats</button></nav>}
        {panel==='stats'?<PersonalStats player={player}/>:panel==='shop'?<ShopPanel player={player} onBuy={itemId=>dispatch({type:'buy',itemId})} feedback={game.notice&&!game.notice.reward&&!game.notice.purchaseItemId?game.notice.message:undefined}/>:
        wardrobe?<Wardrobe tab={wardrobeTab} onTabChange={setWardrobeTab} appearance={player} draft={draftOutfit} ownedItemIds={player.ownedItemIds} onChange={setDraftOutfit} onConfirm={()=>{dispatch({type:'equip',outfit:draftOutfit});setPanel('quests')}} onCancel={()=>openPanel('quests')}/>:
        <DailyQuests completionLocked={completionLocked} player={player} onReorder={(questId,targetId,after)=>{const order=player.activeQuestIds.filter(id=>id!==questId);order.splice(order.indexOf(targetId)+(after?1:0),0,questId);if(order.some((id,index)=>id!==player.activeQuestIds[index])){unlockAudio();playSound('reorder');dispatch({type:'reorder',questId,targetId,after})}}} onCatalog={openCatalog} onComplete={completeQuest} onDelete={questId=>dispatch({type:'delete',questId})}/>}
      </div>{wardrobe?<WardrobeDetails appearance={player} draft={draftOutfit} tab={wardrobeTab}/>:<FavoriteQuests onHousehold={()=>{setHouseholdOpen(true);void household.refresh();}} player={player} catalogOpen={catalogOpen} onCatalog={openCatalog} onAdd={questId=>dispatch({type:'add',questId,now:Date.now()})} onFavorite={questId=>dispatch({type:'favorite',questId})}/>}</div>

      {catalogOpen&&<Modal title="Quest catalog" className="quest-book-modal" onClose={()=>setCatalogOpen(false)}><QuestCatalog player={player} onFavorite={questId=>dispatch({type:'favorite',questId})} onAdd={questId=>dispatch({type:'add',questId,now:Date.now()})}/></Modal>}
    </main>}
    {(householdOpen||account.recovery)&&<Modal title={account.recovery?"Reset password":"Household"} className="household-modal" onClose={()=>{setHouseholdOpen(false);account.finishRecovery()}}><Suspense fallback={<p role="status">Loading household…</p>}><HouseholdSetup account={account} displayName={player?.name} household={household} beforeSignOut={saves.flush}/></Suspense></Modal>}
    {player&&resetOpen&&<Modal title="Reset player?" className="reset-player-dialog" onClose={()=>{if(!resetBusy)setResetOpen(false);}}><p>Are you sure you want to delete your player? This cannot be undone.</p><p className="muted">{account.session?'Your character, XP, coins, quests, clothes, favorites and skill progress will be reset for this account on all devices. Your login and household membership remain.':'Your character, XP, coins, quests, clothes, favorites and skill progress will be deleted from this browser.'}</p>{resetError&&<p role="alert">Your saved player could not be deleted. Nothing has been reset. Try again when browser storage is available.</p>}<div className="reset-player-actions"><button className="quiet-button" disabled={resetBusy} onClick={()=>setResetOpen(false)}>Cancel</button><button className="quiet-button reset-player-button" disabled={resetBusy} onClick={()=>void resetPlayer()}>{resetBusy?'Resetting…':'Reset'}</button></div></Modal>}
    {player&&!editing&&purchaseItem&&<Modal title="New item!" className="purchase-dialog" onClose={()=>dispatch({type:'clear-notice'})}><div className="purchase-picture"><ItemPicture appearance={player} slot={purchaseItem.slot} item={purchaseItem}/></div><h3>{purchaseItem.name}</h3><p>{purchaseItem.description}</p><div className="purchase-actions"><button className="primary" onClick={()=>dispatch({type:'equip',outfit:{...player.equipped,[purchaseItem.slot]:purchaseItem.id}})}>Equip</button><button className="quiet-button" onClick={openWardrobe}>Wardrobe {newItemBadge}</button><button className="quiet-button" onClick={()=>dispatch({type:'clear-notice'})}>Close</button></div></Modal>}
    {player&&!editing&&<RewardEffects notice={game.notice} source={rewardSource} xpTarget={xpTarget} coinTarget={coinTarget} onRelease={setClaimedSequence}/>}
    <MusicToggle/>
    <footer>Make progress in your life. Watch it come to life.</footer></>;
}
