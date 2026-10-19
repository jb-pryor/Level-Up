-- Run once after 001_households.sql. Private account progress, never household-readable.
begin;
create table public.player_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null default 1 check (schema_version = 1),
  player jsonb,
  revision bigint not null check (revision > 0),
  mutation_id uuid not null,
  updated_at timestamptz not null default now(),
  check (player is null or (jsonb_typeof(player) = 'object' and octet_length(player::text) <= 262144))
);
alter table public.player_saves enable row level security;
revoke all on public.player_saves from public, anon, authenticated;
grant select on public.player_saves to authenticated;
create policy own_player_save_read on public.player_saves for select to authenticated
using (user_id = (select auth.uid()));

create function private.save_account_player(p_player jsonb, p_expected_revision bigint, p_mutation_id uuid)
returns bigint language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_row public.player_saves; v_revision bigint;
begin
  if v_uid is null then raise exception 'Sign in first'; end if;
  if p_expected_revision is null or p_expected_revision < 0 or p_mutation_id is null then raise exception 'Invalid save request'; end if;
  if p_player is not null and (jsonb_typeof(p_player) <> 'object' or octet_length(p_player::text) > 262144) then raise exception 'Invalid player save'; end if;
  -- Serialize this account, including its first save; other accounts cannot supply a user ID.
  perform 1 from public.player_profiles where user_id = v_uid for update;
  if not found then raise exception 'Account profile is missing'; end if;
  select * into v_row from public.player_saves where user_id = v_uid;
  if found then
    -- Retrying a request whose response was lost must not increment or conflict.
    if v_row.mutation_id = p_mutation_id then
      if v_row.player is distinct from p_player then raise exception 'Save request ID was reused'; end if;
      return v_row.revision;
    end if;
    if v_row.revision <> p_expected_revision then raise exception 'PLAYER_SAVE_CONFLICT'; end if;
    v_revision := v_row.revision + 1;
    update public.player_saves set player=p_player, revision=v_revision, mutation_id=p_mutation_id, updated_at=now() where user_id=v_uid;
  else
    if p_expected_revision <> 0 then raise exception 'PLAYER_SAVE_CONFLICT'; end if;
    v_revision := 1;
    insert into public.player_saves(user_id,player,revision,mutation_id) values(v_uid,p_player,v_revision,p_mutation_id);
  end if;
  return v_revision;
end;
$$;
create function public.save_account_player(p_player jsonb, p_expected_revision bigint, p_mutation_id uuid)
returns bigint language sql security invoker set search_path = '' as $$
  select private.save_account_player(p_player,p_expected_revision,p_mutation_id);
$$;
revoke all on function private.save_account_player(jsonb,bigint,uuid), public.save_account_player(jsonb,bigint,uuid) from public, anon;
grant execute on function private.save_account_player(jsonb,bigint,uuid), public.save_account_player(jsonb,bigint,uuid) to authenticated;
commit;
