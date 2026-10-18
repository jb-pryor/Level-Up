import { useEffect, useId, useRef, useState, type ReactNode } from 'react';


export function TransitioningAvatar({src,alt,overlay}:{src:string;alt:string;overlay?:ReactNode}){
  const outlineId=useId().replace(/[^a-zA-Z0-9]/g,'');
  const [layers,setLayers]=useState({current:src,previous:null as string|null});
  const shown=useRef(src);
  useEffect(()=>{
    let cancelled=false;
    let timer:ReturnType<typeof setTimeout>|undefined;
    const next=new Image();next.src=src;
    // Keep the old character visible until the replacement is ready to paint.
    void next.decode().then(()=>{
      if(cancelled||shown.current===src)return;
      shown.current=src;
      setLayers(old=>old.current===src?{...old,previous:null}:{current:src,previous:old.current});
      timer=setTimeout(()=>{if(!cancelled)setLayers(old=>({...old,previous:null}))},330);
    }).catch(()=>{/* Retain the visible character if the new image cannot load. */});
    return()=>{cancelled=true;clearTimeout(timer)};
  },[src]);
  return <div className="avatar avatar-png-base avatar-transition" role="img" aria-label={alt}>
    {layers.previous&&<img key={`old-${layers.previous}`} className="avatar-outgoing" src={layers.previous} alt="" aria-hidden="true"/>}
    <img key={layers.current} className={layers.previous?'avatar-incoming':''} src={layers.current} alt="" aria-hidden="true"/>
    {overlay&&<div className={`avatar-eye-layer ${layers.previous?'avatar-incoming':''}`}>{overlay}</div>}
    {layers.previous&&<svg className="avatar-blue-outline" key={`outline-${layers.current}`} viewBox="0 0 1024 1536" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><filter id={`outline-${outlineId}`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="4" result="expanded"/><feComposite in="expanded" in2="SourceAlpha" operator="out" result="edge"/><feFlood floodColor="#259fff"/><feComposite in2="edge" operator="in" result="blueEdge"/><feGaussianBlur in="blueEdge" stdDeviation="3" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="blueEdge"/></feMerge></filter></defs><image href={layers.current} width="1024" height="1536" filter={`url(#outline-${outlineId})`}/></svg>}
  </div>;
}
