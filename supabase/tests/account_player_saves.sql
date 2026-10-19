-- Run after migrations 001 and 002. Temporary test data is rolled back.
begin;
insert into auth.users(id,raw_user_meta_data) values
('41000000-0000-4000-8000-000000000001','{"username":"save_test_alice"}'),
('41000000-0000-4000-8000-000000000002','{"username":"save_test_bob"}');
set local role authenticated;
select set_config('request.jwt.claim.sub','41000000-0000-4000-8000-000000000001',true);
select public.household_create('Save test household');
select set_config('levelup.save_test_invite',(select code from public.household_invites),true);
do $$ declare v bigint; begin
  v:=public.save_account_player('{"name":"Alice","coins":10}',0,'42000000-0000-4000-8000-000000000001');
  if v<>1 then raise exception 'Initial revision incorrect'; end if;
  v:=public.save_account_player('{"name":"Alice","coins":10}',0,'42000000-0000-4000-8000-000000000001');
  if v<>1 then raise exception 'Retry was not idempotent'; end if;
  v:=public.save_account_player('{"name":"Alice","coins":20}',1,'42000000-0000-4000-8000-000000000002');
  if v<>2 then raise exception 'Update revision incorrect'; end if;
  begin
    perform public.save_account_player('{"name":"Old Alice"}',1,'42000000-0000-4000-8000-000000000003');
    raise exception 'Stale write accepted';
  exception when raise_exception then
    if sqlerrm <> 'PLAYER_SAVE_CONFLICT' then raise; end if;
  end;
  if (select player->>'coins' from public.player_saves) <> '20' then raise exception 'Conflict changed player'; end if;
  if has_table_privilege('authenticated','public.player_saves','INSERT') or has_table_privilege('authenticated','public.player_saves','UPDATE') or has_table_privilege('authenticated','public.player_saves','DELETE') then raise exception 'Unexpected direct write grant'; end if;
end $$;
select set_config('request.jwt.claim.sub','41000000-0000-4000-8000-000000000002',true);
select public.household_join(current_setting('levelup.save_test_invite'));
do $$ begin
  if (select count(*) from public.player_saves) <> 0 then raise exception 'Household member can read private player save'; end if;
end $$;
select public.save_account_player('{"name":"Bob"}',0,'42000000-0000-4000-8000-000000000004');
do $$ begin
  if (select count(*) from public.player_saves) <> 1 or (select player->>'name' from public.player_saves) <> 'Bob' then raise exception 'Own save isolation failed'; end if;
end $$;
select set_config('request.jwt.claim.sub','41000000-0000-4000-8000-000000000001',true);
select public.save_account_player(null,2,'42000000-0000-4000-8000-000000000005');
do $$ begin
  if (select player is not null or revision<>3 from public.player_saves) then raise exception 'Reset did not preserve a versioned empty save'; end if;
end $$;
set local role anon;
do $$ begin
  if has_table_privilege('anon','public.player_saves','SELECT') or has_function_privilege('anon','public.save_account_player(jsonb,bigint,uuid)','EXECUTE') then raise exception 'Anonymous save access granted'; end if;
end $$;
rollback;
