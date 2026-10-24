import { levelFor, xpAtLevel } from './progression.ts';
// A brief hold at the full bar makes rollover visible instead of jumping backward.
export function animatedXp(from: number, to: number, progress: number): number {
  if(progress>=1)return to;
  const boundary=xpAtLevel(levelFor(from)+1);
  if(to>=boundary&&from<boundary){
    const split=.60,hold=.10;
    if(progress<split)return from+(boundary-from)*(progress/split);
    if(progress<split+hold)return boundary-.001;
    return boundary+(to-boundary)*((progress-split-hold)/(1-split-hold));
  }
  return from+(to-from)*progress;
}
