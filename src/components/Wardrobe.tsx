import { FemaleClothing } from './FemaleClothing';
import { ReferenceShirt } from './ReferenceShirt';
import { referenceShirtPath } from '../data/referenceShirts';
import { MalePants } from './MalePants';
import { maleShoePath } from '../data/maleShoes';
import { cosmetics } from '../data/cosmetics';
import { maleShirtPath } from '../data/maleShirts';
import { useId } from 'react';
import type { Appearance, Outfit } from '../types';
import { avatarPresets } from '../data/avatarPresets';

export type Slot = keyof Outfit;
type Item = { id: string | null; name: string; description: string };
const categories: { slot: Slot; label: string }[] = [{slot:'shirt',label:'Shirts'},{slot:'pants',label:'Pants'},{slot:'shoes',label:'Shoes'}];
const rarityOrder={Common:0,Rare:1,Epic:2,Legendary:3};
const wardrobeRank=(item:Item)=>item.id===null||item.id==='starter'?-1:rarityOrder[cosmetics.find(c=>c.id===item.id)?.rarity??'Common'];
const wardrobeItems: Record<Slot, Item[]> = {
  shirt: [{id:'starter',name:'Starter tank',description:'Your white tank top. Every adventure starts somewhere.'},...cosmetics.filter(item=>item.slot==='shirt')],
  pants: [{id:'starter',name:'Starter gray',description:'Simple gray pants. A clean slate for your journey.'},...cosmetics.filter(item=>item.slot==='pants')],
  hat: [{id:null,name:'No hat',description:'Let your hairstyle take the spotlight.'},{id:'cap',name:'Quest cap',description:'A green cap for a little extra player energy.'}],
  shoes: [{id:null,name:'Barefoot',description:'Keep the original look.'},...cosmetics.filter(item=>item.slot==='shoes')],
};

export function ItemPicture({ appearance, slot, item }: { appearance: Appearance; slot: Slot; item: Item }) {
  const uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  if(item.id===null)return <span className="wardrobe-none" aria-hidden="true">—</span>;
  if(slot==='shirt'&&referenceShirtPath(item.id,appearance.gender))return <ReferenceShirt id={item.id} gender={appearance.gender} thumbnail/>;
  if(appearance.gender==='female'&&!(slot==='shirt'&&item.id==='starter'))return <FemaleClothing slot={slot} id={item.id} thumbnail/>;
  if(appearance.gender==='male'&&slot==='pants')return <MalePants pants={item.id as Outfit['pants']} thumbnail/>;
  if(appearance.gender==='male'&&slot==='shirt'&&maleShirtPath(item.id))return <svg viewBox="210 420 610 510" aria-hidden="true" className="wardrobe-picture"><image href={maleShirtPath(item.id)!} width="1024" height="1536"/></svg>;
  const base=`/avatars/${appearance.bodyId}`;
  const matrix=(r:number,g:number,b:number)=>`${r} ${r} ${r} 0 0 ${g} ${g} ${g} 0 0 ${b} ${b} ${b} 0 0 0 0 0 1 0`;
  let href=base+'.png',viewBox='250 420 530 490',clip:string|undefined,filter:string|undefined;
  if(slot==='shirt'&&item.id!=='starter'){href=base+'-shirt.png';filter=matrix(...(item.id==='green-shirt'?[.09,.31,.18]:[.14,.24,.46]) as [number,number,number]);}
  if(slot==='shirt'&&item.id==='starter')clip=appearance.bodyId==='base-a'?'M400 457 L435 444 Q430 530 512 530 Q592 530 590 444 L625 457 L628 525 L652 601 L637 726 L662 857 Q512 880 363 857 L388 726 L373 601 L397 525 Z':'M411 466 L431 461 Q434 540 512 540 Q590 540 593 461 L612 466 L619 530 L634 585 L619 715 L657 810 Q512 844 368 810 L406 715 L390 585 L405 530 Z';
  if(slot==='pants'){viewBox='315 815 400 605';clip=avatarPresets[appearance.bodyId].pants;if(item.id!=='starter')filter=item.id==='dark-pants'?matrix(.13,.14,.15):matrix(.28,.31,.19);}
  if(slot==='hat'){href=base+'-hat.png';viewBox='320 0 390 265';}
  if(slot==='shoes'){href=appearance.gender==='male'?maleShoePath(item.id)!:base+'-shoes.png';viewBox=appearance.gender==='male'?'220 1345 590 191':'250 1340 520 195';}
  return <svg viewBox={viewBox} aria-hidden="true" className="wardrobe-picture"><defs>{clip&&<clipPath id={`${uid}-clip`}><path d={clip}/></clipPath>}{filter&&<filter id={`${uid}-filter`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={filter}/></filter>}</defs><image href={href} width="1024" height="1536" clipPath={clip?`url(#${uid}-clip)`:undefined} filter={filter?`url(#${uid}-filter)`:undefined}/></svg>;
}

export function Wardrobe({ appearance, draft, ownedItemIds, tab, onTabChange, onChange, onConfirm, onCancel }: { appearance: Appearance; draft: Outfit; ownedItemIds: string[]; tab: Slot; onTabChange:(slot:Slot)=>void; onChange:(outfit:Outfit)=>void; onConfirm:()=>void; onCancel:()=>void }) {
  const available=wardrobeItems[tab].filter(item=>appearance.gender==='male'||!cosmetics.find(c=>c.id===item.id)?.maleOnly).sort((a,b)=>wardrobeRank(a)-wardrobeRank(b));
  return <section className="quest-card wardrobe-panel" aria-label="Wardrobe">
    <div className="wardrobe-heading"><div><span className="eyebrow">MAKE IT YOURS</span><h2>Your wardrobe</h2></div></div>
    <p className="muted">Pick a look. Confirm when it feels like you.</p>
    <div className="wardrobe-tabs" role="tablist" aria-label="Clothing categories">{categories.map(({slot,label})=><button key={slot} type="button" role="tab" id={`wardrobe-tab-${slot}`} aria-selected={tab===slot} aria-controls="wardrobe-items" onClick={()=>onTabChange(slot)} onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();const index=categories.findIndex(c=>c.slot===slot);const next=categories[(index+(event.key==='ArrowRight'?1:categories.length-1))%categories.length].slot;onTabChange(next);document.getElementById(`wardrobe-tab-${next}`)?.focus()}}} tabIndex={tab===slot?0:-1}>{label}</button>)}</div>
    <div key={tab} id="wardrobe-items" className="wardrobe-grid" tabIndex={0} role="tabpanel" aria-labelledby={`wardrobe-tab-${tab}`}>{available.filter(item=>item.id===null||item.id==='starter'||ownedItemIds.includes(item.id)).map(item=><button key={item.id??'none'} className="wardrobe-item" data-rarity={cosmetics.find(c=>c.id===item.id)?.rarity??'Common'} type="button" aria-pressed={draft[tab]===item.id} onClick={()=>onChange({...draft,[tab]:item.id} as Outfit)}><div className="wardrobe-image-wrap"><ItemPicture appearance={appearance} slot={tab} item={item}/>{draft[tab]===item.id&&<span className="item-selected" aria-hidden="true">✓</span>}</div><span className="wardrobe-item-name">{item.name}</span></button>)}</div>
    <div className="wardrobe-actions"><button className="quiet-button" onClick={onCancel}>Cancel</button><button className="primary" onClick={onConfirm}>Confirm outfit <span>✓</span></button></div>
  </section>;
}


export function WardrobeDetails({appearance, draft, tab}: {appearance:Appearance; draft:Outfit; tab:Slot}) {
  const item=wardrobeItems[tab].find(item=>item.id===draft[tab])??wardrobeItems[tab][0];
  const empty=item.id===null;
  const cosmetic=cosmetics.find(c=>c.id===item.id);
  return <aside className="wardrobe-details" data-rarity={cosmetic?.rarity??'Common'} aria-label="Selected clothing details" aria-live="polite">
    <section className="wardrobe-preview-card">
      <div className="wardrobe-preview-image"><ItemPicture appearance={appearance} slot={tab} item={item}/><span className="item-selected" aria-label="Selected">✓</span></div>
      <div className="wardrobe-preview-copy"><h2>{item.name}</h2><p>{item.description}</p></div>
    </section>
    <section className="wardrobe-stat-card">
      <h2>{item.name}</h2>
      <dl><div><dt>Rarity</dt><dd>{empty?'—':cosmetic?.rarity??'Common'}</dd></div><div><dt>Coin boost</dt><dd>{cosmetic?.coinBoostPercent?`+${cosmetic.coinBoostPercent}%`:'None'}</dd></div><div><dt>XP boost</dt><dd>{cosmetic?.xpBoostPercent?`+${cosmetic.xpBoostPercent}%`:'None'}</dd></div><div><dt>Other stats</dt><dd>None</dd></div></dl>
      <p className="wardrobe-stat-note">{cosmetic?.xpBoostPercent||cosmetic?.coinBoostPercent?'Active while equipped. Quest rewards round up to whole numbers.':'No active item bonuses.'}</p>
    </section>
  </aside>;
}
