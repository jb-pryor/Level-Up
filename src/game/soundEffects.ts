// Original synthesized arcade effects. No external samples or audio downloads.
export type SoundName = 'click' | 'transform' | 'reorder' | 'add-quest' | 'purchase' | 'quest' | 'transfer' | 'level';
let context: AudioContext | null=null;
let master: GainNode | null=null;
let enabled=true;
const active=new Set<OscillatorNode>();
let lastTransform=-Infinity;

export function soundEnabled(){return enabled;}
export function setSoundEnabled(value:boolean){
  enabled=value;
  if(master&&context)master.gain.setTargetAtTime(value ? .6 : 0,context.currentTime,.015);
  if(!value){for(const node of active){try{node.stop()}catch{/* Already stopped. */}}active.clear();}
}
// Called from an actual click, never on page load, to respect browser audio rules.
export function unlockAudio(){
  if(!enabled||typeof window==='undefined'||!window.AudioContext)return;
  try{
    if(!context||context.state==='closed'){
      context=new window.AudioContext();master=context.createGain();master.gain.value=.6;master.connect(context.destination);
    }
    if(context.state==='suspended')void context.resume().catch(()=>{});
  }catch{/* Audio failure must not block the game. */}
}
function note(frequency:number,start:number,duration:number,volume=.08,type:OscillatorType='triangle',endFrequency?:number){
  if(!context||!master)return;
  const oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,start);
  if(endFrequency)oscillator.frequency.exponentialRampToValueAtTime(endFrequency,start+duration);
  gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.004);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  oscillator.connect(gain);gain.connect(master);active.add(oscillator);
  oscillator.onended=()=>{active.delete(oscillator);oscillator.disconnect();gain.disconnect()};
  oscillator.start(start);oscillator.stop(start+duration+.015);
}
export function playSound(name:SoundName){
  if(!enabled||!context||context.state!=='running')return;
  const now=context.currentTime+.005;
  if(name==='click'){
    // Sharp transient and fast pitch drop: a dry wooden tick, not a melodic blip.
    note(1700,now,.019,.24,'square',420);
    note(850,now,.028,.13,'triangle',190);
    note(210,now,.016,.08,'sine',110);
    return;
  }
  if(name==='transform'){
    if(now-lastTransform<.09)return;lastTransform=now;
    // Thin electric buzz sweeping downward: ziiip, without a rounded blip.
    note(2900,now,.27,.12,'sawtooth',320);
    note(3100,now+.008,.25,.045,'square',360);
    note(1700,now,.24,.07,'sine',450);
    return;
  }
  if(name==='reorder'){
    // Rounded two-syllable budoop for a task finding its new place.
    note(240,now,.065,.14,'sine',170);
    note(390,now+.075,.13,.16,'sine',560);
    note(780,now+.08,.09,.025,'triangle');
    return;
  }
  if(name==='add-quest'){
    // A bright two-note quest-book chime with soft bell overtones.
    [880,1318.51].forEach((f,i)=>{note(f,now+i*.09,.32,.13,'sine');note(f*2,now+i*.09,.2,.035,'sine');note(f*3,now+i*.09,.12,.012,'sine')});
    return;
  }
  if(name==='purchase'){
    // Register clack followed by a bright, ringing cha-ching.
    note(190,now,.045,.16,'square',85);
    [1318.51,1977.77,2637.02].forEach((f,i)=>note(f,now+.09,.22,.075/(i+1),'sine'));
    [2093,3139.5,4186].forEach((f,i)=>note(f,now+.21,.5,.12/(i+1),'sine'));
    return;
  }
  if(name==='quest'){
    [659.25,830.61,1046.5].forEach((f,i)=>{note(f,now+i*.075,.16,.08);note(f*2,now+i*.075,.11,.018,'sine')});return;
  }
  if(name==='transfer'){
    // Rounded "dup dup dup" ticks rise with the visible reward transfer.
    for(let i=0;i<16;i++)note(260+i*16,now+.07+i*.055,.045,.07,'sine',180+i*12);
    [1568,1760,2093].forEach((f,i)=>note(f,now+.64+i*.095,.1,.035,'triangle'));return;
  }
  const melody=[523.25,659.25,783.99,1046.5,783.99,1046.5,1318.51,1567.98];
  melody.forEach((f,i)=>{note(f,now+i*.1,i===melody.length-1 ? .42 : .14,.085,'triangle');note(f/2,now+i*.1,.13,.023,'square')});
  [523.25,659.25,783.99].forEach(f=>note(f,now+.85,.5,.025,'sine'));
}

// Trigger on the selection gesture, rather than waiting for PNG decoding.
export async function playTransformationSound(){
  unlockAudio();
  if(!enabled||!context)return;
  try{if(context.state==='suspended')await context.resume()}catch{return}
  playSound('transform');
}
