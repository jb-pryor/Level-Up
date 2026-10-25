-- Additional Home, Health, Social, and Education quests. Run after existing migrations.
-- Includes ALL current quests and retired compatibility IDs. Works even if 003 was skipped.
-- Safe to run again: replaces only this function; player saves and activity are preserved.
begin;
create or replace function private.record_household_activity(p_event_id uuid, p_household_id uuid, p_quest_id text, p_completed_at timestamptz)
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
    when 'help' then 'Help someone with a task' when 'thank' then 'Send someone a thank-you message'
    when 'study-hour' then 'Study for one hour'
    when 'homework' then 'Complete one homework assignment'
    when 'teacher' then 'Talk to a teacher about your coursework'
    when 'classmate-review' then 'Review classwork with a classmate'
    when 'read-book' then 'Read a book for 30 minutes'
    when 'read-chapter' then 'Read one chapter of an educational book'
    when 'new-area' then 'Explore a new area for 30 minutes'
    when 'new-place' then 'Visit a town or place you have never been'
    when 'park-trail' then 'Explore a new park or walking trail'
    when 'local-landmark' then 'Visit a local landmark or museum'
    when 'new-route' then 'Take a different route on a familiar trip'
    when 'try-hour' then 'Spend one hour trying something new'
    when 'new-hobby' then 'Spend 30 minutes learning a new hobby'
    when 'beginner-lesson' then 'Complete a beginner lesson in a new skill'
    when 'first-attempt' then 'Make a first attempt, even if it goes badly'
    when 'make-something' then 'Create something using a new technique'
    when 'bathroom' then 'Clean the bathroom'
    when 'countertops' then 'Wipe down countertops'
    when 'cobwebs' then 'Remove cobwebs'
    when 'clean-floors' then 'Vacuum or sweep the floors'
    when 'take-out-trash' then 'Take out trash and recycling'
    when 'clean-fridge' then 'Clean out the fridge'
    when 'change-sheets' then 'Change your bedsheets'
    when 'water-plants' then 'Check and water your plants as needed'
    when 'dental-care' then 'Brush and floss your teeth'
    when 'wind-down' then 'Spend 30 minutes winding down without screens'
    when 'make-plans' then 'Arrange time to spend with someone'
    when 'resolve-disagreement' then 'Have a calm conversation about a disagreement'
    when 'practice-quiz' then 'Complete and review a practice quiz'
    when 'organize-notes' then 'Organize your class or study notes'
    end;
  if v_quest is null then raise exception 'Unknown quest'; end if;
  select * into v_profile from public.player_profiles where user_id = v_uid;
  insert into public.household_activity(id, household_id, actor_id, quest_id, quest_name, display_name, level, avatar, completed_at)
  values (p_event_id, p_household_id, v_uid, p_quest_id, v_quest, v_profile.display_name, v_profile.level, v_profile.avatar, p_completed_at)
  on conflict(id) do nothing;
end;
$$;
commit;
