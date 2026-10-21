-- Run after migration 004. Temporary activity and users are rolled back.
begin;
insert into auth.users(id,raw_user_meta_data) values
('51000000-0000-4000-8000-000000000001','{"username":"new_quest_test"}');
set local role authenticated;
select set_config('request.jwt.claim.sub','51000000-0000-4000-8000-000000000001',true);
select set_config('levelup.new_quest_household',public.household_create('New chapters test')::text,true);
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'study-hour',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'homework',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'teacher',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'classmate-review',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'read-chapter',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'new-area',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'new-place',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'park-trail',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'local-landmark',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'new-route',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'try-hour',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'new-hobby',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'beginner-lesson',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'first-attempt',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'make-something',now());
select public.record_household_activity(gen_random_uuid(),current_setting('levelup.new_quest_household')::uuid,'read-book',now());
do $$ begin
  if (select count(*) from public.household_activity) <> 16 then raise exception 'New quest activity missing'; end if;
  if exists(select 1 from public.household_activity where quest_name is null or quest_name = '') then raise exception 'Activity name missing'; end if;
end $$;
rollback;
