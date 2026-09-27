-- Stage 1 shared spirit-pet profile. Additive and species-only; progression stays frozen.

create table if not exists public.spirit_pet_profiles (
  member_id uuid primary key references public.club_members(id) on delete cascade,
  species text not null check (species in (
    'thanh_long', 'chu_tuoc', 'kim_su', 'ky_lan', 'ho_ly', 'khong_tuoc'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.spirit_pet_profiles enable row level security;

drop policy if exists spirit_pet_profiles_member_read on public.spirit_pet_profiles;
create policy spirit_pet_profiles_member_read on public.spirit_pet_profiles
for select to authenticated
using (member_id = private.current_member_id());

revoke all on table public.spirit_pet_profiles from anon, authenticated;
grant select on table public.spirit_pet_profiles to authenticated;

-- One-time migration: normalize existing admin profiles to Thanh Long.
-- Non-admin species are left unchanged. The migration runner applies this file once.
insert into public.spirit_pet_profiles(member_id, species)
select member.id, 'thanh_long'
from public.club_members as member
where member.role::text = 'admin'
on conflict (member_id) do update
set species = 'thanh_long',
    updated_at = now();

-- New admin member rows receive Thanh Long. This trigger is INSERT-only:
-- later role changes do not mutate an existing pet profile.
create or replace function private.ensure_admin_spirit_pet_profile()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
begin
  if new.role::text = 'admin' then
    insert into public.spirit_pet_profiles(member_id, species)
    values (new.id, 'thanh_long')
    on conflict (member_id) do nothing;
  end if;
  return new;
end
$$;

drop trigger if exists club_members_admin_spirit_pet_profile on public.club_members;
create trigger club_members_admin_spirit_pet_profile
after insert on public.club_members
for each row execute function private.ensure_admin_spirit_pet_profile();

-- First-profile RPC derives identity and role from the authenticated DB session.
-- A client-supplied role/species cannot override the admin rule. Existing profiles
-- are returned unchanged so role changes cannot rewrite a saved species.
create or replace function public.spirit_pet_profile_initialize(p_requested_species text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
declare
  v_member_id uuid;
  v_role text;
  v_species text;
  v_profile public.spirit_pet_profiles%rowtype;
begin
  v_member_id := private.current_member_id();
  if v_member_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select member.role::text into v_role
  from public.club_members as member
  where member.id = v_member_id;
  if v_role is null then
    raise exception 'member profile not found' using errcode = 'P0002';
  end if;

  if v_role = 'admin' then
    v_species := 'thanh_long';
  else
    if p_requested_species is not null and p_requested_species not in (
      'thanh_long', 'chu_tuoc', 'kim_su', 'ky_lan', 'ho_ly', 'khong_tuoc'
    ) then
      raise exception 'invalid spirit pet species' using errcode = '22023';
    end if;
    v_species := coalesce(p_requested_species, 'ho_ly');
  end if;

  insert into public.spirit_pet_profiles(member_id, species)
  values (v_member_id, v_species)
  on conflict (member_id) do nothing;

  select * into v_profile
  from public.spirit_pet_profiles
  where member_id = v_member_id;

  return jsonb_build_object(
    'memberId', v_profile.member_id,
    'species', v_profile.species,
    'createdAt', v_profile.created_at,
    'updatedAt', v_profile.updated_at
  );
end
$$;

-- The only client RPC that changes species. Admin may keep/set Thanh Long,
-- but every request to write another species is rejected by the server.
create or replace function public.spirit_pet_profile_set_species(p_species text)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_catalog
as $$
declare
  v_member_id uuid;
  v_role text;
  v_profile public.spirit_pet_profiles%rowtype;
begin
  v_member_id := private.current_member_id();
  if v_member_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select member.role::text into v_role
  from public.club_members as member
  where member.id = v_member_id;
  if v_role is null then
    raise exception 'member profile not found' using errcode = 'P0002';
  end if;

  if p_species not in (
    'thanh_long', 'chu_tuoc', 'kim_su', 'ky_lan', 'ho_ly', 'khong_tuoc'
  ) then
    raise exception 'invalid spirit pet species' using errcode = '22023';
  end if;
  if v_role = 'admin' and p_species <> 'thanh_long' then
    raise exception 'admin spirit pet must remain Thanh Long' using errcode = '42501';
  end if;

  insert into public.spirit_pet_profiles(member_id, species)
  values (v_member_id, p_species)
  on conflict (member_id) do update
    set species = excluded.species,
        updated_at = now()
  returning * into v_profile;

  return jsonb_build_object(
    'memberId', v_profile.member_id,
    'species', v_profile.species,
    'createdAt', v_profile.created_at,
    'updatedAt', v_profile.updated_at
  );
end
$$;

revoke all on function public.spirit_pet_profile_initialize(text) from public, anon;
revoke all on function public.spirit_pet_profile_set_species(text) from public, anon;
grant execute on function public.spirit_pet_profile_initialize(text) to authenticated;
grant execute on function public.spirit_pet_profile_set_species(text) to authenticated;
