-- Level Up household foundation. Run in Supabase SQL Editor on this project's database.
-- No passwords, emails or service keys are stored in these application tables.
begin;
create schema if not exists private;

create table public.player_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  level integer not null default 1 check (level >= 1),
  avatar jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  owner_id uuid not null references public.player_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.household_members (
  user_id uuid primary key references public.player_profiles(user_id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  joined_at timestamptz not null default now()
);
create index household_members_household on public.household_members(household_id);
create table public.household_invites (
  household_id uuid primary key references public.households(id) on delete cascade,
  code text not null unique default replace(gen_random_uuid()::text, '-', ''),
  expires_at timestamptz not null default now() + interval '7 days'
);
create table public.household_activity (
  id uuid primary key,
  household_id uuid not null references public.households(id) on delete cascade,
  actor_id uuid references public.player_profiles(user_id) on delete set null,
  quest_id text not null,
  quest_name text not null,
  display_name text not null,
  level integer not null check (level >= 1),
  avatar jsonb not null,
  completed_at timestamptz not null,
  received_at timestamptz not null default now()
);
create index household_activity_recent on public.household_activity(household_id, completed_at desc, id);

-- Registration is atomic: a duplicate case-insensitive username rolls back signup.
create function private.on_levelup_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_username text := lower(btrim(new.raw_user_meta_data ->> 'username'));
begin
  if v_username is null or v_username !~ '^[a-z0-9_]{3,24}$' then
    raise exception 'Username must be 3-24 letters, numbers or underscores';
  end if;
  insert into public.player_profiles(user_id, username, display_name)
  values (new.id, v_username, left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), v_username), 40));
  return new;
exception when unique_violation then raise exception 'Username is already taken';
end;
$$;
revoke all on function private.on_levelup_signup() from public, anon, authenticated;
create trigger levelup_signup after insert on auth.users
for each row execute function private.on_levelup_signup();

-- Membership lookup bypasses its own table policy, avoiding recursive RLS.
create function private.my_household() returns uuid language sql stable
security definer set search_path = '' as $$
  select household_id from public.household_members where user_id = (select auth.uid());
$$;
revoke all on function private.my_household() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.my_household() to authenticated;

alter table public.player_profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.household_invites enable row level security;
alter table public.household_activity enable row level security;
revoke all on public.player_profiles, public.households, public.household_members,
  public.household_invites, public.household_activity from public, anon, authenticated;
grant select on public.player_profiles, public.households, public.household_members,
  public.household_invites, public.household_activity to authenticated;
create policy profile_members_read on public.player_profiles for select to authenticated using (
  user_id = (select auth.uid()) or exists (
    select 1 from public.household_members m
    where m.user_id = player_profiles.user_id and m.household_id = (select private.my_household())
  )
);
create policy household_members_read on public.households for select to authenticated
  using (id = (select private.my_household()));
create policy members_read on public.household_members for select to authenticated
  using (household_id = (select private.my_household()));
create policy invites_members_read on public.household_invites for select to authenticated
  using (household_id = (select private.my_household()));
create policy activity_members_read on public.household_activity for select to authenticated
  using (household_id = (select private.my_household()));

-- All writes authenticate the caller on the server; table writes are not granted.
create function private.create_household(p_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_id uuid;
begin
  if v_uid is null then raise exception 'Sign in first'; end if;
  perform 1 from public.player_profiles where user_id = v_uid for update;
  if not found then raise exception 'Account profile is missing'; end if;
  if exists(select 1 from public.household_members where user_id = v_uid) then raise exception 'You already belong to a household'; end if;
  if p_name is null or char_length(btrim(p_name)) not between 1 and 60 then raise exception 'Enter a household name (1-60 characters)'; end if;
  insert into public.households(name, owner_id) values (btrim(p_name), v_uid) returning id into v_id;
  insert into public.household_members(user_id, household_id) values (v_uid, v_id);
  insert into public.household_invites(household_id) values (v_id);
  return v_id;
end;
$$;
create function private.join_household(p_code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_id uuid;
begin
  if v_uid is null then raise exception 'Sign in first'; end if;
  perform 1 from public.player_profiles where user_id = v_uid for update;
  if not found then raise exception 'Account profile is missing'; end if;
  if exists(select 1 from public.household_members where user_id = v_uid) then raise exception 'You already belong to a household'; end if;
  select household_id into v_id from public.household_invites where code = lower(btrim(p_code)) and expires_at > now();
  if v_id is null then raise exception 'Invite code is invalid or expired'; end if;
  insert into public.household_members(user_id, household_id) values (v_uid, v_id);
  return v_id;
end;
$$;
create function private.refresh_household_invite() returns text
language plpgsql security definer set search_path = '' as $$
declare v_id uuid := private.my_household(); v_code text;
begin
  if v_id is null or not exists(select 1 from public.households where id = v_id and owner_id = auth.uid()) then raise exception 'Only the household owner can replace its invite'; end if;
  update public.household_invites set code = replace(gen_random_uuid()::text, '-', ''), expires_at = now() + interval '7 days'
    where household_id = v_id returning code into v_code;
  return v_code;
end;
$$;
create function private.leave_household() returns void
language plpgsql security definer set search_path = '' as $$
declare v_id uuid := private.my_household(); v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Sign in first'; end if;
  if v_id is null then return; end if;
  perform 1 from public.households where id = v_id for update;
  if exists(select 1 from public.households where id = v_id and owner_id = v_uid) then
    if exists(select 1 from public.household_members where household_id = v_id and user_id <> v_uid) then
      raise exception 'The owner cannot leave while other members remain';
    end if;
    delete from public.households where id = v_id;
  else
    delete from public.household_members where user_id = v_uid;
  end if;
end;
$$;

create function private.clean_avatar(p jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
begin
  if jsonb_typeof(p) is distinct from 'object' then raise exception 'Invalid avatar'; end if;
  if not coalesce(
    (p->>'gender') in ('male','female') and
    (p->>'bodyId') = case when p->>'gender' = 'male' then 'base-a' else 'base-b' end and
    (p->>'complexionId') in ('1','2','3') and
    (p->>'hairStyleId') in ('short-swept','long','bald') and
    (p->>'hairColorId') in ('brown','black','blonde','gray') and
    (p->>'eyeColorId') in ('brown','blue','green','gray','red') and
    (p->>'expressionId') in ('smile','neutral'), false) then raise exception 'Invalid avatar'; end if;
  return jsonb_build_object('gender',p->>'gender','bodyId',p->>'bodyId','complexionId',p->>'complexionId',
    'hairStyleId',p->>'hairStyleId','hairColorId',p->>'hairColorId','eyeColorId',p->>'eyeColorId','expressionId',p->>'expressionId');
end;
$$;
create function private.update_player_profile(p_display_name text, p_level integer, p_avatar jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 40 or p_level is null or p_level < 1 then raise exception 'Invalid player profile'; end if;
  update public.player_profiles set display_name = btrim(p_display_name), level = p_level,
    avatar = private.clean_avatar(p_avatar), updated_at = now() where user_id = auth.uid();
  if not found then raise exception 'Account profile is missing'; end if;
end;
$$;
create function private.record_household_activity(p_event_id uuid, p_household_id uuid, p_quest_id text, p_completed_at timestamptz)
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_profile public.player_profiles; v_quest text;
begin
  if v_uid is null then raise exception 'Sign in first'; end if;
  if p_household_id is null or p_household_id is distinct from private.my_household() then raise exception 'Household membership required'; end if;
  if p_event_id is null or p_completed_at is null or p_completed_at > now() + interval '5 minutes' or p_completed_at < now() - interval '30 days' then raise exception 'Invalid completion event'; end if;
  v_quest := case p_quest_id
    when 'dishes' then 'Do the dishes' when 'room' then 'Clean your room' when 'laundry' then 'Wash and put away laundry'
    when 'bed' then 'Make your bed' when 'deep-clean' then 'Deep-clean the kitchen' when 'walk' then 'Take a 15-minute walk'
    when 'gym' then 'Complete a gym workout' when 'meal' then 'Prepare a balanced meal' when 'meditate' then 'Meditate for five minutes'
    when 'yoga' then 'Do a 20-minute yoga session' when 'compliment' then 'Give someone a sincere compliment'
    when 'check-in' then 'Check in with a friend' when 'meet' then 'Introduce yourself to someone new'
    when 'help' then 'Help someone with a task' when 'thank' then 'Send someone a thank-you message' end;
  if v_quest is null then raise exception 'Unknown quest'; end if;
  select * into v_profile from public.player_profiles where user_id = v_uid;
  insert into public.household_activity(id, household_id, actor_id, quest_id, quest_name, display_name, level, avatar, completed_at)
  values (p_event_id, p_household_id, v_uid, p_quest_id, v_quest, v_profile.display_name, v_profile.level, v_profile.avatar, p_completed_at)
  on conflict(id) do nothing;
end;
$$;

-- Exposed wrappers run as the signed-in caller. Privileged implementations stay private.
create function public.household_create(p_name text) returns uuid language sql security invoker set search_path = '' as $$ select private.create_household(p_name); $$;
create function public.household_join(p_code text) returns uuid language sql security invoker set search_path = '' as $$ select private.join_household(p_code); $$;
create function public.household_refresh_invite() returns text language sql security invoker set search_path = '' as $$ select private.refresh_household_invite(); $$;
create function public.household_leave() returns void language sql security invoker set search_path = '' as $$ select private.leave_household(); $$;
create function public.update_player_profile(p_display_name text, p_level integer, p_avatar jsonb) returns void language sql security invoker set search_path = '' as $$ select private.update_player_profile(p_display_name,p_level,p_avatar); $$;
create function public.record_household_activity(p_event_id uuid, p_household_id uuid, p_quest_id text, p_completed_at timestamptz) returns void language sql security invoker set search_path = '' as $$ select private.record_household_activity(p_event_id,p_household_id,p_quest_id,p_completed_at); $$;

revoke all on function private.create_household(text), private.join_household(text), private.refresh_household_invite(), private.leave_household(), private.clean_avatar(jsonb), private.update_player_profile(text,integer,jsonb), private.record_household_activity(uuid,uuid,text,timestamptz) from public, anon;
grant execute on function private.create_household(text), private.join_household(text), private.refresh_household_invite(), private.leave_household(), private.clean_avatar(jsonb), private.update_player_profile(text,integer,jsonb), private.record_household_activity(uuid,uuid,text,timestamptz) to authenticated;
revoke all on function public.household_create(text), public.household_join(text), public.household_refresh_invite(), public.household_leave(), public.update_player_profile(text,integer,jsonb), public.record_household_activity(uuid,uuid,text,timestamptz) from public, anon;
grant execute on function public.household_create(text), public.household_join(text), public.household_refresh_invite(), public.household_leave(), public.update_player_profile(text,integer,jsonb), public.record_household_activity(uuid,uuid,text,timestamptz) to authenticated;
-- Public readiness probe: returns no household, account or member data.
create function public.household_ready() returns boolean language sql stable security invoker set search_path = '' as $$ select true; $$;
revoke all on function public.household_ready() from public;
grant execute on function public.household_ready() to anon, authenticated;
commit;
