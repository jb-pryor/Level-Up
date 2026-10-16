import { useEffect, useRef, useState } from 'react';
import { startMusic, stopMusic } from '../game/music';
export function MusicToggle(){
  const [on,setOn]=useState(false),[error,setError]=useState(false);
  const desired=useRef(false),attempt=useRef(0);
  useEffect(()=>()=>{desired.current=false;attempt.current++;stopMusic()},[]);
  return <div className="music-control">{error&&<span role="status" className="music-error">Music unavailable. Try again.</span>}<button className="quiet-button" aria-pressed={on} aria-label={on?'Turn background music off':'Turn background music on'} onClick={async()=>{
    const request=++attempt.current;desired.current=!desired.current;setError(false);
    if(!desired.current){stopMusic();setOn(false);return;}
    setOn(true);const started=await startMusic();
    if(request===attempt.current&&desired.current&&!started){desired.current=false;setOn(false);setError(true);}
  }}>♪ Music {on?'on':'off'}</button></div>;
}
