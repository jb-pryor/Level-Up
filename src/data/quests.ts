import type { Quest } from '../types.ts';
export const quests: Quest[] = [
  {id:'dishes',name:'Do the dishes',category:'home',xp:35,coins:10},
  {id:'room',name:'Clean your room',category:'home',xp:35,coins:10},
  {id:'laundry',name:'Wash and put away laundry',category:'home',xp:35,coins:10},
  {id:'bed',name:'Make your bed',category:'home',xp:15,coins:5},
  {id:'deep-clean',name:'Deep-clean the kitchen',category:'home',xp:60,coins:20},
  {id:'walk',name:'Take a 15-minute walk',category:'health',xp:15,coins:5},
  {id:'gym',name:'Complete a gym workout',category:'health',xp:60,coins:20},
  {id:'meal',name:'Prepare a balanced meal',category:'health',xp:35,coins:10},
  {id:'meditate',name:'Meditate for five minutes',category:'health',xp:15,coins:5},
  {id:'yoga',name:'Do a 20-minute yoga session',category:'health',xp:35,coins:10},
  {id:'compliment',name:'Give someone a sincere compliment',category:'social',xp:15,coins:5},
  {id:'check-in',name:'Check in with a friend',category:'social',xp:35,coins:10},
  {id:'meet',name:'Introduce yourself to someone new',category:'social',xp:35,coins:10},
  {id:'help',name:'Help someone with a task',category:'social',xp:60,coins:20},
  {id:'thank',name:'Send someone a thank-you message',category:'social',xp:15,coins:5},
];
export const questCategories = [{id:'home',label:'Home improvement',icon:'⌂'},{id:'health',label:'Health',icon:'♡'},{id:'social',label:'Social positivity',icon:'✧'}] as const;
