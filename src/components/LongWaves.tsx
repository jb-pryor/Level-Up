import {useId} from 'react';
import type {Appearance} from '../types';
import {longWavesSources,longWavesPath,longWavesFit} from '../data/longWaves';
export function LongWaves({gender,color,hat=false,thumbnail=false}:{gender:Appearance['gender'];color:Appearance['hairColorId'];hat?:boolean;thumbnail?:boolean}){
  const uid=useId().replace(/[^a-zA-Z0-9]/g,'');
  const source=longWavesSources[color];
  const picture=<image href={longWavesPath(color)} width="852" height="1846"/>;
  if(thumbnail)return <svg className="hairstyle-thumbnail" viewBox={source.viewBox} aria-hidden="true">{picture}</svg>;
  return <svg className="avatar-hair-overlay" viewBox="0 0 1024 1536" aria-hidden="true"><defs><clipPath id={`${uid}-hat`}><rect y="115" width="1024" height="1421"/></clipPath></defs><g clipPath={hat?`url(#${uid}-hat)`:undefined}><svg {...longWavesFit(gender)} viewBox={source.viewBox} preserveAspectRatio="none">{picture}</svg></g></svg>;
}
