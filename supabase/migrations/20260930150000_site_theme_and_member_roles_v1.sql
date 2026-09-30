-- Site-wide theme (Admin-selected) and Admin review of Member <-> Mod roles.
-- Additive only: one new table, four RPCs. No existing object is altered or dropped.

-- 1) Site theme -------------------------------------------------------------------------
-- A single row holds the active theme id. The id is validated by shape here; the site only
-- applies ids it knows (data/site-themes.ts) and falls back to the default design otherwise.
create table if not exists public.site_theme_settings (
  singleton boolean primary key default true check (singleton),
  theme_id text not null default 'default' check (theme_id ~ '^[a-z0-9-]{1,32}$'),
  updated_by_member_id uuid references public.club_members(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.site_theme_settings(singleton, theme_id)
values (true, 'default')
on conflict (singleton) do nothing;

alter table public.site_theme_settings enable row level security;
revoke all on table public.site_theme_settings from anon, authenticated;

-- Public read (the homepage is public). Returns only the theme id.
create or replace function public.site_theme_get_public_v1()
returns jsonb
language sql
security definer
stable
set search_path = public, pg_catalog
as $$
  select jsonb_build_object('themeId', s.theme_id, 'updatedAt', s.updated_at)
  from public.site_theme_settings s
  where s.singleton
$$;

-- Admin-only write. Identity and role come from the authenticated session.
create or replace function public.site_theme_set_v1(p_theme_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
declare
  v_member_id uuid;
  v_role public.app_role;
  v_previous text;
begin
  if not private.has_min_role('admin'::public.app_role) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_theme_id is null or p_theme_id !~ '^[a-z0-9-]{1,32}$' then
    raise exception 'invalid theme id' using errcode = '22023';
  end if;
  v_member_id := private.current_member_id();
  select role into v_role from public.club_members where id = v_member_id;

  select theme_id into v_previous from public.site_theme_settings where singleton;
  insert into public.site_theme_settings(singleton, theme_id, updated_by_member_id, updated_at)
  values (true, p_theme_id, v_member_id, now())
  on conflict (singleton) do update
    set theme_id = excluded.theme_id,
        updated_by_member_id = excluded.updated_by_member_id,
        updated_at = excluded.updated_at;

  insert into public.ecosystem_audit_log(actor_member_id, actor_role, action, target_type, target_id, details)
  values (v_member_id, v_role, 'site_theme_changed', 'site_theme', p_theme_id,
          jsonb_build_object('previous', v_previous, 'next', p_theme_id));

  return jsonb_build_object('themeId', p_theme_id, 'previous', v_previous);
end
$$;

-- 2) Member directory (minimal fields) and Member <-> Mod role review ---------------------
create or replace function public.ecosystem_admin_member_list_v1()
returns jsonb
language plpgsql
security definer
stable
set search_path = public, private, pg_catalog
as $$
begin
  if not private.has_min_role('admin'::public.app_role) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', m.id,
      'fullName', m.full_name,
      'studentCode', m.student_code,
      'role', m.role::text,
      'status', m.status::text,
      'loginEnabled', m.login_enabled
    ) order by m.full_name)
    from public.club_members m
  ), '[]'::jsonb);
end
$$;

-- Only Member <-> Mod. Admin, leader and super_mod rows are never changed here, an Admin cannot
-- change their own role, and a promotion needs an approved, login-enabled member.
create or replace function public.ecosystem_admin_set_member_role_v1(p_member_id uuid, p_role text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
declare
  v_actor uuid;
  v_actor_role public.app_role;
  v_target public.club_members%rowtype;
begin
  if not private.has_min_role('admin'::public.app_role) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_role is null or p_role not in ('member', 'mod') then
    raise exception 'invalid role' using errcode = '22023';
  end if;
  v_actor := private.current_member_id();
  if p_member_id is null or p_member_id = v_actor then
    raise exception 'cannot change own role' using errcode = '42501';
  end if;

  select * into v_target from public.club_members where id = p_member_id for update;
  if not found then
    raise exception 'member not found' using errcode = 'P0002';
  end if;
  if v_target.data_conflict then
    raise exception 'member record has a data conflict' using errcode = '55000';
  end if;
  if v_target.role::text not in ('member', 'mod') then
    raise exception 'only member and mod roles can be changed here' using errcode = '42501';
  end if;
  if p_role = 'mod' and (v_target.status::text <> 'approved' or not v_target.login_enabled) then
    raise exception 'member must be approved and login-enabled' using errcode = '55000';
  end if;

  if v_target.role::text <> p_role then
    update public.club_members
      set role = p_role::public.app_role, updated_at = now()
      where id = p_member_id;
    select role into v_actor_role from public.club_members where id = v_actor;
    insert into public.ecosystem_audit_log(actor_member_id, actor_role, action, target_type, target_id, details)
    values (v_actor, v_actor_role, 'member_role_changed', 'member', p_member_id::text,
            jsonb_build_object('previous', v_target.role::text, 'next', p_role));
  end if;

  return jsonb_build_object('id', p_member_id, 'role', p_role, 'previous', v_target.role::text);
end
$$;

revoke all on function public.site_theme_get_public_v1() from public;
revoke all on function public.site_theme_set_v1(text) from public, anon;
revoke all on function public.ecosystem_admin_member_list_v1() from public, anon;
revoke all on function public.ecosystem_admin_set_member_role_v1(uuid, text) from public, anon;
grant execute on function public.site_theme_get_public_v1() to anon, authenticated;
grant execute on function public.site_theme_set_v1(text) to authenticated;
grant execute on function public.ecosystem_admin_member_list_v1() to authenticated;
grant execute on function public.ecosystem_admin_set_member_role_v1(uuid, text) to authenticated;
