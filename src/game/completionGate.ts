import { gameReducer, type GameState } from './gameReducer.ts';
import { levelFor } from './progression.ts';
export type CompletionGate={state:GameState;blocked:boolean};
// Advance the immediate snapshot as well as the queued React reducer state.
// Rapid clicks before the next render must still notice the level boundary.
export function completeWithLevelGate(gate:CompletionGate,questId:string,now:number):CompletionGate {
  if(gate.blocked)return gate;
  const next=gameReducer(gate.state,{type:'complete',questId,now});
  const advanced=!!next.player&&!!gate.state.player&&levelFor(next.player.totalXp)>levelFor(gate.state.player.totalXp);
  return {state:next,blocked:advanced};
}
