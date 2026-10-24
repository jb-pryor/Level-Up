import { sharedOutfit, sharedProgress } from './householdMember.ts';
import type { Appearance, Player, Outfit } from '../types.ts';
import { defaultAppearance } from '../types.ts';
import { levelFor } from './progression.ts';
import { quests } from '../data/quests.ts';

export type SharedProfile = { displayName: string; level: number; avatar: Omit<Appearance, 'name'> & {outfit?:Outfit;totalXp?:number} };
export type PendingActivity = { id: string; userId: string; householdId: string; questId: string; completedAt: string; profile: SharedProfile };
export function sharedProfile(player: Player): SharedProfile {
  const { gender,bodyId,complexionId,hairStyleId,hairColorId,eyeColorId,expressionId }=player;
  return { displayName: player.name.trim().slice(0,40), level: levelFor(player.totalXp), avatar: { gender,bodyId,complexionId,hairStyleId,hairColorId,eyeColorId,expressionId,outfit:sharedOutfit(player.equipped,gender),totalXp:player.totalXp } };
}
export function headAppearance(value: unknown, name: string): Appearance {
  const p = value && typeof value === 'object' ? value as Record<string,unknown> : {};
  const pick = <T extends string>(key: string, options: readonly T[], fallback: T): T => options.includes(p[key] as T) ? p[key] as T : fallback;
  const gender=pick('gender',['male','female'],'male');
  return { ...defaultAppearance, name, gender, bodyId: gender==='male'?'base-a':'base-b',
    complexionId:pick('complexionId',['1','2','3'],'1'), hairStyleId:pick('hairStyleId',['short-swept','short-curly','long','long-waves','bald'],'short-swept'),
    hairColorId:pick('hairColorId',['brown','black','blonde','gray'],'brown'), eyeColorId:pick('eyeColorId',['brown','blue','green','gray','red'],'brown'), expressionId:pick('expressionId',['smile','neutral'],'smile') };
}
export const outboxKey = (userId: string) => `level-up:household-outbox:v1:${userId}`;
export function parseOutbox(raw: string | null, userId: string): PendingActivity[] {
  if (!raw) return [];
  const values: unknown = JSON.parse(raw);
  if (!Array.isArray(values)) throw new Error('Unreadable household activity queue');
  const ids=new Set<string>();
  return values.map(value => {
    const e=value as PendingActivity;
    const uuid=/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
    if (!e || e.userId!==userId || !uuid.test(e.id) || !uuid.test(e.householdId) || !quests.some(q=>q.id===e.questId)
      || !Number.isFinite(Date.parse(e.completedAt)) || !e.profile || typeof e.profile.displayName!=='string' || !e.profile.displayName.trim()
      || !Number.isSafeInteger(e.profile.level) || e.profile.level<1 || !e.profile.avatar || ids.has(e.id)) throw new Error('Unreadable household activity queue');
    ids.add(e.id);
    const { name: _, ...head }=headAppearance(e.profile.avatar,e.profile.displayName);
    const body=e.profile.avatar as SharedProfile['avatar'];
    const xp=sharedProgress(body);
    const avatar={...head,...(body.outfit?{outfit:sharedOutfit(body.outfit,head.gender)}:{}),...(xp!==null?{totalXp:xp}:{})};
    return { ...e, profile: { displayName:e.profile.displayName.slice(0,40),level:e.profile.level,avatar } };
  });
}
