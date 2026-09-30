-- Account-synced daily missions. Additive only: one new table and two RPCs.
-- Badges, streaks, weekly progress and XP are derived from these rows by the client
-- (data/learning-progress.ts); the server stores only which mission was done on which day.
-- Identity comes from the authenticated session (private.current_member_id()), never from the client.

create table if not exists public.member_mission_completions (
  member_id uuid not null references public.club_members(id) on delete cascade,
  day date not null,
  mission_id text not null check (mission_id ~ '^[a-z0-9-]{1,40}$'),
  created_at timestamptz not null default now(),
  primary key (member_id, day, mission_id)
);

create index if not exists member_mission_completions_member_day_idx
  on public.member_mission_completions (member_id, day desc);

alter table public.member_mission_completions enable row level security;

drop policy if exists member_mission_completions_member_read on public.member_mission_completions;
create policy member_mission_completions_member_read on public.member_mission_completions
for select to authenticated
using (member_id = private.current_member_id());

-- Writes go only through the RPCs below.
revoke all on table public.member_mission_completions from anon, authenticated;
grant select on table public.member_mission_completions to authenticated;

-- Merge a batch of completions (first sign-in on a device) and return the member's full list.
-- Invalid, far-future or over-cap rows are skipped silently; existing rows are never overwritten.
create or replace function public.mission_completions_sync(p_rows jsonb default '[]'::jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
declare
  v_member_id uuid;
  v_row jsonb;
  v_day date;
  v_mission text;
  v_max_day date := ((now() at time zone 'Asia/Ho_Chi_Minh')::date + 1);
  v_count integer;
begin
  v_member_id := private.current_member_id();
  if v_member_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'rows must be an array' using errcode = '22023';
  end if;
  if jsonb_array_length(p_rows) > 1200 then
    raise exception 'too many rows' using errcode = '22023';
  end if;

  select count(*) into v_count from public.member_mission_completions where member_id = v_member_id;

  for v_row in select value from jsonb_array_elements(p_rows) loop
    begin
      v_day := (v_row ->> 'day')::date;
      v_mission := v_row ->> 'missionId';
    exception when others then
      continue;
    end;
    if v_mission is null or v_mission !~ '^[a-z0-9-]{1,40}$' then continue; end if;
    if v_day is null or v_day > v_max_day or v_day < date '2020-01-01' then continue; end if;
    exit when v_count >= 1200;
    insert into public.member_mission_completions(member_id, day, mission_id)
    values (v_member_id, v_day, v_mission)
    on conflict do nothing;
    if found then v_count := v_count + 1; end if;
  end loop;

  return jsonb_build_object('completions', coalesce((
    select jsonb_agg(jsonb_build_object('day', to_char(t.day, 'YYYY-MM-DD'), 'missionId', t.mission_id) order by t.day, t.mission_id)
    from (
      select day, mission_id
      from public.member_mission_completions
      where member_id = v_member_id
      order by day desc, mission_id
      limit 1200
    ) as t
  ), '[]'::jsonb));
end
$$;

-- Mark or unmark one mission for one day.
create or replace function public.mission_completion_set(p_day date, p_mission_id text, p_done boolean)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
declare
  v_member_id uuid;
  v_max_day date := ((now() at time zone 'Asia/Ho_Chi_Minh')::date + 1);
  v_count integer;
begin
  v_member_id := private.current_member_id();
  if v_member_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_mission_id is null or p_mission_id !~ '^[a-z0-9-]{1,40}$' then
    raise exception 'invalid mission' using errcode = '22023';
  end if;
  if p_day is null or p_day > v_max_day or p_day < date '2020-01-01' then
    raise exception 'invalid day' using errcode = '22023';
  end if;

  if coalesce(p_done, false) then
    select count(*) into v_count from public.member_mission_completions where member_id = v_member_id;
    if v_count >= 1200 then
      raise exception 'completion limit reached' using errcode = '54000';
    end if;
    insert into public.member_mission_completions(member_id, day, mission_id)
    values (v_member_id, p_day, p_mission_id)
    on conflict do nothing;
  else
    delete from public.member_mission_completions
    where member_id = v_member_id and day = p_day and mission_id = p_mission_id;
  end if;

  return jsonb_build_object('ok', true);
end
$$;

revoke all on function public.mission_completions_sync(jsonb) from public, anon;
revoke all on function public.mission_completion_set(date, text, boolean) from public, anon;
grant execute on function public.mission_completions_sync(jsonb) to authenticated;
grant execute on function public.mission_completion_set(date, text, boolean) to authenticated;
