import { MusicToggle } from './components/MusicToggle';
import { CoinIcon } from './components/CoinIcon';
import { useEffect, useReducer, useRef, useState } from 'react';
import { CharacterSetup } from './components/CharacterSetup';
import { Avatar } from './components/Avatar';
import { LevelUpCelebration } from './components/LevelUpCelebration';
import { Wardrobe, ItemPicture } from './components/Wardrobe';
import { QuestCatalog } from './components/QuestCatalog';
import { DailyQuests } from './components/DailyQuests';
import { FavoriteQuests } from './components/FavoriteQuests';
import { PersonalStats } from './components/PersonalStats';
import { Shop } from './components/Shop';
import { Modal } from './components/Modal';
import { gameReducer } from './game/gameReducer';
import { levelFor, xpIntoLevel } from './game/progression';
import type { Outfit } from './types';
import { starterOutfit } from './types';
import { cosmetics } from './data/cosmetics';
import { loadBrowserPlayer, saveBrowserPlayer, deleteBrowserPlayerSave } from './game/save';
import { RewardEffects } from './components/RewardEffects';
import { useAnimatedNumber } from './game/useAnimatedNumber';
import { playSound, setSoundEnabled, soundEnabled, unlockAudio, playTransformationSound } from './game/soundEffects';

export default function App() {
  const [loaded]=useState(loadBrowserPlayer);
  const [recoveryNeeded,setRecoveryNeeded]=useState(loaded.status==='invalid');
  const [saveFailed,setSaveFailed]=useState(loaded.status==='unavailable');
  const [game,dispatch]=useReducer(gameReducer,{player:loaded.player,notice:null});
  const player=game.player;
  useEffect(()=>{
    if(player&&!recoveryNeeded)setSaveFailed(!saveBrowserPlayer(player));
  },[player,recoveryNeeded]);
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
  const resetPlayer=()=>{
    if(!deleteBrowserPlayerSave()){setResetError(true);return;}
    dispatch({type:'reset-player'});setResetOpen(false);setResetError(false);
    setEditing(false);setCatalogOpen(false);setPanel('quests');
    setDraftOutfit({...starterOutfit});setClaimedSequence(0);setSaveFailed(false);
    rewardSource.current=null;
  };
  const [panel,setPanel]=useState<'quests'|'shop'|'wardrobe'|'stats'>('quests');
  const wardrobe=panel==='wardrobe';
  const [catalogOpen,setCatalogOpen]=useState(false);
  const openCatalog=()=>{dispatch({type:'clear-notice'});setCatalogOpen(true)};
  const [draftOutfit,setDraftOutfit]=useState<Outfit>(starterOutfit);
  const openPanel=(next:typeof panel)=>{dispatch({type:'clear-notice'});setPanel(next)};
  const openWardrobe=()=>{if(player){setDraftOutfit({...player.equipped});dispatch({type:'open-wardrobe'});setPanel('wardrobe')}};
  return <><header className="app-header"><a href="#" className="brand" onClick={e=>e.preventDefault()}><span className="brand-icon">↑</span>Level Up<span className="brand-dot">.</span></a><span className="header-note">SMALL ACTIONS. BIG ADVENTURES.</span><div className="header-player-actions"><button className="quiet-button sound-toggle" aria-pressed={soundOn} aria-label={soundOn?'Mute sound effects':'Enable sound effects'} onClick={()=>{const next=!soundOn;setSoundOn(next);setSoundEnabled(next);if(next){unlockAudio();playSound('click')}}}>{soundOn?'Sound on':'Sound off'}</button>{player&&<>{!editing&&<button className="quiet-button" onClick={()=>{setEditing(true);setCatalogOpen(false);openPanel('quests')}}>Edit character</button>}<div className="coin-balance" ref={coinTarget} aria-label={`${Math.round(displayedCoins)} coins`}><span aria-hidden="true"><CoinIcon/> {Math.round(displayedCoins)} coins</span></div></>}</div></header>
    {saveFailed&&<div className="storage-warning" role="alert">Progress cannot be saved in this browser right now. Your current session still works, but changes may be lost when you close or refresh. <button className="quiet-button" onClick={()=>{if(player)setSaveFailed(!saveBrowserPlayer(player));else setSaveFailed(loadBrowserPlayer().status==='unavailable')}}>Retry saving</button></div>}
    {recoveryNeeded?<main className="dashboard"><section className="quest-card"><h2>Your save could not be loaded</h2><p>The saved data is unreadable or from an unsupported version. It has been left untouched. Starting fresh will replace it once you create a new character.</p><button className="primary" onClick={()=>setRecoveryNeeded(false)}>Start fresh</button></section></main>:!player||editing?<CharacterSetup key={editing?'edit':'new'} initialAppearance={player??undefined} onCancel={editing?()=>setEditing(false):undefined} onCreate={appearance=>{dispatch({type:player?'edit':'create',appearance});setEditing(false)}}/>:
    <main className="dashboard">
      <div className="dashboard-grid"><section className="player-card"><div className="player-title"><h2>{player.name}</h2><span className="level-pill">LEVEL {levelFor(Math.floor(displayedXp))}</span></div><div className="xp-label"><span>{levelFor(Math.floor(displayedXp))===1?'A fresh start':'Keep leveling up'}</span><span>{Math.round(xpIntoLevel(displayedXp))} / 100 XP</span></div><div className="xp-track" ref={xpTarget} role="progressbar" aria-label="XP toward next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(xpIntoLevel(displayedXp))}><div style={{width:`${xpIntoLevel(displayedXp)}%`}}/></div><div className="player-avatar-zone"><Avatar appearance={player} outfit={wardrobe?draftOutfit:player.equipped}/><LevelUpCelebration level={levelFor(Math.floor(displayedXp))}/></div><div className="player-bottom-actions"><button className="quiet-button" onClick={openWardrobe}><svg className="wardrobe-hanger" viewBox="0 0 20 18" aria-hidden="true"><path d="M8 4a2 2 0 1 1 4 0c0 1-2 1.5-2 3v1L2 14v2h16v-2l-8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter"/></svg> Wardrobe {newItemBadge}</button><button className="quiet-button reset-player-button" onClick={()=>{setResetError(false);setResetOpen(true)}}>Reset player</button></div></section>
      <div className="quest-zone">
        <nav className="panel-nav" aria-label="Quest panel views"><button className="quiet-button" aria-pressed={panel==='quests'} onClick={()=>openPanel('quests')}>Daily quests</button><button className="quiet-button" aria-pressed={panel==='shop'} onClick={()=>openPanel('shop')}>Shop</button><button className="quiet-button" aria-pressed={panel==='stats'} onClick={()=>openPanel('stats')}>Personal Stats</button></nav>
        {panel==='stats'?<PersonalStats player={player}/>:panel==='shop'?<section className="quest-card inline-shop" aria-label="Shop"><div className="inline-panel-heading"><h2>Your next upgrade</h2><span className="coin-balance"><CoinIcon/> {player.coins} coins</span></div><Shop player={player} onBuy={itemId=>dispatch({type:'buy',itemId})} feedback={game.notice&&!game.notice.reward&&!game.notice.purchaseItemId?game.notice.message:undefined}/></section>:
        wardrobe?<Wardrobe appearance={player} draft={draftOutfit} ownedItemIds={player.ownedItemIds} onChange={setDraftOutfit} onConfirm={()=>{dispatch({type:'equip',outfit:draftOutfit});setPanel('quests')}} onCancel={()=>openPanel('quests')}/>:
        <DailyQuests player={player} onReorder={(questId,targetId,after)=>{const order=player.activeQuestIds.filter(id=>id!==questId);order.splice(order.indexOf(targetId)+(after?1:0),0,questId);if(order.some((id,index)=>id!==player.activeQuestIds[index])){unlockAudio();playSound('reorder');dispatch({type:'reorder',questId,targetId,after})}}} onCatalog={openCatalog} onComplete={(questId,element)=>{const rect=element.getBoundingClientRect();rewardSource.current={x:rect.left+rect.width/2,y:rect.top+rect.height/2};dispatch({type:'complete',questId,now:Date.now()})}} onDelete={questId=>dispatch({type:'delete',questId})}/>}
      </div><FavoriteQuests player={player} catalogOpen={catalogOpen} onCatalog={openCatalog} onAdd={questId=>dispatch({type:'add',questId,now:Date.now()})} onFavorite={questId=>dispatch({type:'favorite',questId})}/></div>
      {catalogOpen&&<Modal title="Quest catalog" className="quest-book-modal" onClose={()=>setCatalogOpen(false)}><QuestCatalog player={player} onFavorite={questId=>dispatch({type:'favorite',questId})} onAdd={questId=>dispatch({type:'add',questId,now:Date.now()})}/></Modal>}
    </main>}
    {player&&resetOpen&&<Modal title="Reset player?" className="reset-player-dialog" onClose={()=>setResetOpen(false)}><p>Are you sure you want to delete your player? This cannot be undone.</p><p className="muted">Your character, XP, coins, quests, clothes, favorites and skill progress will be deleted from this browser.</p>{resetError&&<p role="alert">Your saved player could not be deleted. Nothing has been reset. Try again when browser storage is available.</p>}<div className="reset-player-actions"><button className="quiet-button" onClick={()=>setResetOpen(false)}>Cancel</button><button className="quiet-button reset-player-button" onClick={resetPlayer}>Reset</button></div></Modal>}
    {player&&!editing&&purchaseItem&&<Modal title="New item!" className="purchase-dialog" onClose={()=>dispatch({type:'clear-notice'})}><div className="purchase-picture"><ItemPicture appearance={player} slot={purchaseItem.slot} item={purchaseItem}/></div><h3>{purchaseItem.name}</h3><p>{purchaseItem.description}</p><div className="purchase-actions"><button className="primary" onClick={()=>dispatch({type:'equip',outfit:{...player.equipped,[purchaseItem.slot]:purchaseItem.id}})}>Equip</button><button className="quiet-button" onClick={openWardrobe}>Wardrobe {newItemBadge}</button><button className="quiet-button" onClick={()=>dispatch({type:'clear-notice'})}>Close</button></div></Modal>}
    {player&&!editing&&<RewardEffects notice={game.notice} source={rewardSource} xpTarget={xpTarget} coinTarget={coinTarget} onRelease={setClaimedSequence}/>}
    <MusicToggle/>
    <footer>Make progress in your life. Watch it come to life.</footer></>;
}
