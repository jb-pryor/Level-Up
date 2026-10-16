// Original gentle eight-bar chiptune. Separate from the sound-effect mixer.
let context:AudioContext|null=null;
let output:GainNode|null=null;
let timer:ReturnType<typeof setInterval>|null=null;
let generation=0;
let nextTime=0,step=0;
const voices=new Set<OscillatorNode>();
const beat=60/92/2;
const chords=[[60,64,67],[57,60,64],[53,57,60],[55,59,62],[60,64,67],[57,60,64],[53,57,60],[55,59,62]];
const melody=[
  [76,0,79,0,81,79,76,0],[72,0,76,0,79,76,72,0],
  [72,0,77,0,76,0,72,0],[74,0,79,0,77,74,71,0],
  [76,79,0,83,81,0,79,0],[76,0,72,0,76,79,0,76],
  [77,0,76,0,72,0,69,0],[71,0,74,0,79,0,74,0],
];
function tone(midi:number,time:number,duration:number,volume:number,type:OscillatorType){
  if(!context||!output)return;
  const osc=context.createOscillator(),gain=context.createGain();
  osc.type=type;osc.frequency.value=440*2**((midi-69)/12);
  gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.018);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
  osc.connect(gain);gain.connect(output);voices.add(osc);
  osc.onended=()=>{voices.delete(osc);osc.disconnect();gain.disconnect()};
  osc.start(time);osc.stop(time+duration+.02);
}
function schedule(){
  if(!context||context.state!=='running')return;
  // Skip missed time after a background-tab pause, never queue a burst of old notes.
  if(nextTime<context.currentTime)nextTime=context.currentTime+.04;
  while(nextTime<context.currentTime+.25){
    const bar=Math.floor(step/8)%8,index=step%8,chord=chords[bar];
    const lead=melody[bar][index];
    if(lead)tone(lead,nextTime,beat*1.3,.055,'square');
    tone(chord[[0,1,2,1,0,1,2,1][index]]+12,nextTime,beat*1.5,.035,'triangle');
    if(index%4===0)tone(chord[0]-24,nextTime,beat*3.5,.12,'triangle');
    nextTime+=beat;step=(step+1)%64;
  }
}
export function stopMusic(){
  generation++;
  if(timer!==null){clearInterval(timer);timer=null;}
  for(const voice of voices){try{voice.stop()}catch{/* Already finished. */}}
  voices.clear();
}
export async function startMusic():Promise<boolean>{
  stopMusic();const request=generation;
  try{
    if(typeof window==='undefined'||!window.AudioContext)return false;
    if(!context||context.state==='closed'){
      context=new window.AudioContext();output=context.createGain();output.gain.value=.3;output.connect(context.destination);
    }
    if(context.state==='suspended')await context.resume();
    if(request!==generation||context.state!=='running')return false;
    step=0;nextTime=context.currentTime+.06;schedule();timer=setInterval(schedule,100);return true;
  }catch{return false;}
}
