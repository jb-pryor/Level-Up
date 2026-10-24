-- Allow the additional hairstyle in shared household avatars.
create or replace function private.clean_avatar(p jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
begin
  if jsonb_typeof(p) is distinct from 'object' then raise exception 'Invalid avatar'; end if;
  if not coalesce(
    (p->>'gender') in ('male','female') and
    (p->>'bodyId') = case when p->>'gender' = 'male' then 'base-a' else 'base-b' end and
    (p->>'complexionId') in ('1','2','3') and
    (p->>'hairStyleId') in ('short-swept','long','long-waves','bald') and
    (p->>'hairColorId') in ('brown','black','blonde','gray') and
    (p->>'eyeColorId') in ('brown','blue','green','gray','red') and
    (p->>'expressionId') in ('smile','neutral'), false) then raise exception 'Invalid avatar'; end if;
  return jsonb_build_object('gender',p->>'gender','bodyId',p->>'bodyId','complexionId',p->>'complexionId',
    'hairStyleId',p->>'hairStyleId','hairColorId',p->>'hairColorId','eyeColorId',p->>'eyeColorId','expressionId',p->>'expressionId');
end;
$$;
