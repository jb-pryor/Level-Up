import type { Player } from '../types';
import { quests } from '../data/quests';
import { playSound } from '../game/soundEffects';
export function FavoriteQuests({player,catalogOpen,onCatalog,onAdd,onFavorite}:{player:Player;catalogOpen:boolean;onCatalog:()=>void;onAdd:(id:string)=>void;onFavorite:(id:string)=>void}) {
  return <aside className="favorites-rail" aria-label="Quest shortcuts"><button className="primary rail-catalog" aria-haspopup="dialog" aria-expanded={catalogOpen} onClick={onCatalog}>✧ Quest catalog</button><h2>★ Favorites</h2>{player.favoriteQuestIds.length===0?<p className="favorites-empty">Favorite quests in the catalog to keep your go-to tasks here.</p>:<ul className="favorites-list">{player.favoriteQuestIds.map(id=>{
    const quest=quests.find(q=>q.id===id);if(!quest)return null;
    const added=player.activeQuestIds.includes(id);
    return <li key={id}><div className="favorite-heading"><h3>{quest.name}</h3><button className="favorite-remove" onClick={()=>onFavorite(id)} aria-label={`Unfavorite ${quest.name}`} title="Remove favorite">★</button></div><span className="favorite-xp">+{quest.xp} XP</span><button className="quiet-button" data-sound="add-quest" disabled={added} onClick={()=>{if(!added){onAdd(id);playSound('add-quest')}}}>{added?'Added ✓':'Add quest +'}</button></li>;
  })}</ul>}</aside>;
}
