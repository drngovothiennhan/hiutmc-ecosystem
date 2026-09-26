-- Temporary isolated Game Hub error feed; immediately superseded by the shared audit feed.
-- Kept in migration history to document the production schema transition.

create table if not exists public.ecosystem_gamehub_error_events (
  id uuid primary key default gen_random_uuid(),
  actor_member_id uuid null references public.club_members(id) on delete set null,
  error_code text not null check (error_code in (
    'rpc_failed',
    'dashboard_load_failed',
    'session_refresh_failed',
    'client_uncaught',
    'client_unhandled_rejection'
  )),
  route_key text not null check (route_key in (
    'bootstrap',
    'dashboard',
    'clinic',
    'patient',
    'leaderboard',
    'case',
    'rating',
    'background_refresh',
    'unknown'
  )),
  created_at timestamptz not null default now()
);

create index if not exists ecosystem_gamehub_error_events_created_idx
  on public.ecosystem_gamehub_error_events(created_at desc);
create index if not exists ecosystem_gamehub_error_events_actor_created_idx
  on public.ecosystem_gamehub_error_events(actor_member_id, created_at desc);

alter table public.ecosystem_gamehub_error_events enable row level security;
revoke all on table public.ecosystem_gamehub_error_events from public, anon, authenticated;

create or replace function public.game_hub_record_error_v1(p_error_code text, p_route_key text)
returns boolean
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
declare
  v_member_id uuid;
  v_recent_count integer;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  v_member_id := private.current_member_id();
  if v_member_id is null then
    raise exception 'member profile required' using errcode = '42501';
  end if;

  if p_error_code not in (
    'rpc_failed',
    'dashboard_load_failed',
    'session_refresh_failed',
    'client_uncaught',
    'client_unhandled_rejection'
  ) then
    raise exception 'invalid error code' using errcode = '22023';
  end if;

  if p_route_key not in (
    'bootstrap',
    'dashboard',
    'clinic',
    'patient',
    'leaderboard',
    'case',
    'rating',
    'background_refresh',
    'unknown'
  ) then
    raise exception 'invalid route key' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_member_id::text, 0));
  select count(*)::integer into v_recent_count
  from public.ecosystem_gamehub_error_events
  where actor_member_id = v_member_id
    and created_at > now() - interval '10 minutes';
  if v_recent_count >= 20 then
    return false;
  end if;

  insert into public.ecosystem_gamehub_error_events(actor_member_id, error_code, route_key)
  values (v_member_id, p_error_code, p_route_key);
  return true;
end;
$$;

create or replace function public.ecosystem_admin_gamehub_error_feed_v1(p_limit integer default 100)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, private, pg_catalog
as $$
declare
  v_events jsonb;
begin
  if not private.has_min_role('admin'::public.app_role) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', e.id,
    'errorCode', e.error_code,
    'routeKey', e.route_key,
    'createdAt', e.created_at
  ) order by e.created_at desc), '[]'::jsonb)
  into v_events
  from (
    select id, error_code, route_key, created_at
    from public.ecosystem_gamehub_error_events
    order by created_at desc
    limit greatest(1, least(coalesce(p_limit, 100), 200))
  ) e;

  return v_events;
end;
$$;

revoke all on function public.game_hub_record_error_v1(text, text) from public, anon;
revoke all on function public.ecosystem_admin_gamehub_error_feed_v1(integer) from public, anon;
grant execute on function public.game_hub_record_error_v1(text, text) to authenticated;
grant execute on function public.ecosystem_admin_gamehub_error_feed_v1(integer) to authenticated;
