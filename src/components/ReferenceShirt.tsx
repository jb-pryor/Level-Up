import { referenceShirtPath, redoneMaleShirts, redoneFemaleShirts } from '../data/referenceShirts';

export function ReferenceShirt({id, gender, thumbnail = false}: {id: string; gender: 'male' | 'female'; thumbnail?: boolean}) {
  const path = referenceShirtPath(id, gender);
  if (!path) return null;
  const redone=gender==='male'?redoneMaleShirts[id]:redoneFemaleShirts[id];
  // Match the colored tee thumbnail framing; avatar overlay coordinates stay fixed.
  const previewBox=redone?(gender==='male'?'210 420 610 510':'260 420 510 450'):'160 400 710 670';
  return <svg className={thumbnail ? 'wardrobe-picture' : 'avatar-shirt-overlay'} viewBox={thumbnail ? previewBox : '0 0 1024 1536'} aria-hidden="true">
    {redone?<svg x={gender==='male'?237:285} y={gender==='male'?438:425} width={gender==='male'?552:454} height={gender==='male'?451:415} viewBox={redone.viewBox} preserveAspectRatio="none"><image href={path} width={gender==='male'?1237:1145} height={gender==='male'?1271:1374} /></svg>:<image href={path} width="1024" height="1536" />}
  </svg>;
}
