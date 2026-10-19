-- Run after migration 001 in this project's SQL Editor. All test data rolls back.
begin;
insert into auth.users(id,raw_user_meta_data) values
('10000000-0000-4000-8000-000000000001','{"username":"levelup_test_alice","display_name":"Same Name"}'),
('10000000-0000-4000-8000-000000000002','{"username":"levelup_test_bob","display_name":"Same Name"}'),
('10000000-0000-4000-8000-000000000003','{"username":"levelup_test_outsider"}');
-- Unique usernames are case insensitive; display names may duplicate.
do $$ declare denied boolean := false; begin
  begin
    insert into auth.users(id,raw_user_meta_data) values ('10000000-0000-4000-8000-000000000004','{"username":"LEVELUP_TEST_ALICE"}');
  exception when others then denied := true; end;
  if not denied then raise exception 'Duplicate username accepted'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
select set_config('levelup.test_household',public.household_create('Level Up test household')::text,true);
select set_config('levelup.test_code',(select code from public.household_invites),true);
select public.update_player_profile('Same Name',4,'{"gender":"male","bodyId":"base-a","complexionId":"1","hairStyleId":"short-swept","hairColorId":"brown","eyeColorId":"blue","expressionId":"smile","private_extra":"must not survive"}');
select public.record_household_activity('20000000-0000-4000-8000-000000000001',current_setting('levelup.test_household')::uuid,'dishes',now());
select public.record_household_activity('20000000-0000-4000-8000-000000000001',current_setting('levelup.test_household')::uuid,'dishes',now());
do $$ begin
  if (select count(*) from public.household_activity) <> 1 then raise exception 'Duplicate activity was recorded'; end if;
  if exists(select 1 from public.player_profiles where avatar ? 'private_extra') then raise exception 'Avatar copied unknown fields'; end if;
  if has_table_privilege(current_user,'public.household_members','INSERT') then raise exception 'Direct membership writes allowed'; end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000002',true);
do $$ begin
  if exists(select 1 from public.household_activity) then raise exception 'Nonmember read activity'; end if;
end $$;
select public.household_join(current_setting('levelup.test_code'));
do $$ begin
  if (select count(*) from public.household_members) <> 2 then raise exception 'Member cannot see household members'; end if;
  if (select count(*) from public.player_profiles) <> 2 then raise exception 'Member profile visibility incorrect'; end if;
  if (select count(*) from public.household_activity) <> 1 then raise exception 'Member cannot read activity'; end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000003',true);
do $$ declare denied boolean := false; begin
  if exists(select 1 from public.households) or exists(select 1 from public.household_members) or exists(select 1 from public.household_activity) or exists(select 1 from public.household_invites) then raise exception 'Outsider read household data'; end if;
  if (select count(*) from public.player_profiles) <> 1 then raise exception 'Outsider read another profile'; end if;
  begin
    perform public.record_household_activity('20000000-0000-4000-8000-000000000002',current_setting('levelup.test_household')::uuid,'room',now());
  exception when others then denied := true; end;
  if not denied then raise exception 'Outsider posted activity'; end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$ declare denied boolean := false; begin
  begin perform public.household_leave(); exception when others then denied := true; end;
  if not denied then raise exception 'Owner left remaining members'; end if;
end $$;
set local role anon;
do $$ begin
  if has_table_privilege(current_user,'public.player_profiles','SELECT') then raise exception 'Anonymous profile reads granted'; end if;
  if has_function_privilege(current_user,'public.household_create(text)','EXECUTE') then raise exception 'Anonymous household writes allowed'; end if;
  if not public.household_ready() then raise exception 'Readiness probe failed'; end if;
end $$;
rollback;
