import type { Player } from '../types';
import { quests } from '../data/quests';
const skillNames:Record<string,string>={dishes:'Dishwasher',room:'Room Ranger',laundry:'Laundry Legend',bed:'Bed Builder','deep-clean':'Kitchen Keeper',walk:'Trail Walker',gym:'Gym Warrior',meal:'Meal Maker',meditate:'Mind Master',yoga:'Yoga Explorer',compliment:'Hype Hero','check-in':'Friend Keeper',meet:'Icebreaker',help:'Helping Hand',thank:'Gratitude Guru'};
export function PersonalStats({player}:{player:Player}) {
  return <section className="quest-card personal-stats"><span className="eyebrow">YOUR REAL-LIFE SKILL TREE</span><h2>Personal Stats</h2><p className="muted">Every completion earns 1 skill XP. Every 5 skill XP earns a level.</p><div className="skill-grid">{quests.map(quest=>{
    const count=player.questCompletions[quest.id]??0,progress=count%5,level=1+Math.floor(count/5);
    return <article className="skill-card" key={quest.id} tabIndex={0} aria-describedby={`skill-tooltip-${quest.id}`}><div className="skill-heading"><h3>{skillNames[quest.id]}</h3><span>LEVEL {level}</span></div><p className="skill-objective">{quest.name}</p><div className="skill-track" role="progressbar" aria-label={`${skillNames[quest.id]} XP toward next level`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={5}><div style={{width:`${progress/5*100}%`}}/></div><p className="skill-progress">{progress} / 5 SKILL XP · {5-progress} to next level</p><span className="skill-tooltip" id={`skill-tooltip-${quest.id}`}>Completed {count} {count===1?'time':'times'}</span></article>;
  })}</div></section>;
}
