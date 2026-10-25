-- Add Ponytail hair while retaining existing hairstyles and household outfit/XP support.
-- Existing row-level access rules are unchanged; private saves remain private.
begin;
create or replace function private.clean_avatar(p jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare v_avatar jsonb; v_outfit jsonb; v_slot text; v_item jsonb;
begin
  if jsonb_typeof(p) is distinct from 'object' then raise exception 'Invalid avatar'; end if;
  if not coalesce(
    (p->>'gender') in ('male','female') and
    (p->>'bodyId') = case when p->>'gender' = 'male' then 'base-a' else 'base-b' end and
    (p->>'complexionId') in ('1','2','3') and
    (p->>'hairStyleId') in ('short-swept','short-curly','afro','ponytail','long','long-waves','bald') and
    (p->>'hairColorId') in ('brown','black','blonde','gray') and
    (p->>'eyeColorId') in ('brown','blue','green','gray','red') and
    (p->>'expressionId') in ('smile','neutral'), false) then raise exception 'Invalid avatar'; end if;
  v_avatar := jsonb_build_object('gender',p->>'gender','bodyId',p->>'bodyId','complexionId',p->>'complexionId',
    'hairStyleId',p->>'hairStyleId','hairColorId',p->>'hairColorId','eyeColorId',p->>'eyeColorId','expressionId',p->>'expressionId');
  if p ? 'totalXp' then
    if jsonb_typeof(p->'totalXp') is distinct from 'number' or
       (p->>'totalXp') !~ '^[0-9]+$' then raise exception 'Invalid shared XP'; end if;
    if (p->>'totalXp')::numeric > 9007199254740991 then raise exception 'Invalid shared XP'; end if;
    v_avatar := v_avatar || jsonb_build_object('totalXp',p->'totalXp');
  end if;
  if p ? 'outfit' then
    if jsonb_typeof(p->'outfit') is distinct from 'object' then raise exception 'Invalid outfit'; end if;
    v_outfit := '{}'::jsonb;
    foreach v_slot in array array['shirt','pants','hat','shoes'] loop
      v_item := p->'outfit'->v_slot;
      if v_item is null or v_item = 'null'::jsonb then
        v_item := case when v_slot in ('shirt','pants') then '"starter"'::jsonb else 'null'::jsonb end;
      elsif jsonb_typeof(v_item) is distinct from 'string' or
            (p->'outfit'->>v_slot) !~ '^[a-z0-9][a-z0-9-]{0,63}$' then
        raise exception 'Invalid outfit item';
      end if;
      v_outfit := v_outfit || jsonb_build_object(v_slot,v_item);
    end loop;
    v_avatar := v_avatar || jsonb_build_object('outfit',v_outfit);
  end if;
  return v_avatar;
end;
$$;

commit;
