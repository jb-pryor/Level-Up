import { referenceShirtPath } from '../data/referenceShirts';

export function ReferenceShirt({id, gender, thumbnail = false}: {id: string; gender: 'male' | 'female'; thumbnail?: boolean}) {
  const path = referenceShirtPath(id, gender);
  if (!path) return null;
  return <svg className={thumbnail ? 'wardrobe-picture' : 'avatar-shirt-overlay'} viewBox={thumbnail ? '160 400 710 670' : '0 0 1024 1536'} aria-hidden="true">
    <image href={path} width="1024" height="1536" />
  </svg>;
}
