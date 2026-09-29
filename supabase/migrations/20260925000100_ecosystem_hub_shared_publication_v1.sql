-- Shared public release lane for HIU TMC Hub registry content.
-- Drafts stay staff-only; only this curated publication is returned publicly.

create table if not exists public.ecosystem_hub_publications (
  hub_slug text primary key check (hub_slug in ('study-os','ai-thiet-chan','trung-y-van','atlas')),
  publication jsonb not null check (jsonb_typeof(publication) = 'object'),
  revision bigint not null default 1 check (revision >= 1),
  published_by_member_id uuid null references public.club_members(id) on delete set null,
  published_at timestamptz not null default now()
);

alter table public.ecosystem_hub_publications enable row level security;
revoke all on table public.ecosystem_hub_publications from anon, authenticated;

create or replace function public.ecosystem_public_hub_registry()
returns jsonb language sql stable security definer
set search_path = public, pg_catalog
as $$
  select coalesce(
    jsonb_agg(jsonb_build_object('hubSlug',hub_slug,'publication',publication,'revision',revision,'publishedAt',published_at) order by hub_slug),
    '[]'::jsonb
  )
  from public.ecosystem_hub_publications;
$$;

create or replace function public.ecosystem_admin_publish_hub(p_hub_slug text)
returns jsonb language plpgsql security definer
set search_path = public, private, pg_catalog
as $$
declare
  v_member_id uuid;
  v_role public.app_role;
  v_draft jsonb;
  v_row public.ecosystem_hub_publications%rowtype;
begin
  if not private.has_min_role('admin'::public.app_role) then
    raise exception 'forbidden' using errcode='42501';
  end if;
  if p_hub_slug not in ('study-os','ai-thiet-chan','trung-y-van','atlas') then
    raise exception 'invalid hub slug' using errcode='22023';
  end if;

  select draft into v_draft from public.ecosystem_hub_drafts where hub_slug=p_hub_slug;
  if not found then raise exception 'hub draft not found' using errcode='P0002'; end if;
  if exists(
    select 1 from jsonb_object_keys(v_draft) k(key)
    where key not in ('name','shortName','tagline','description','currentUpstreamUrl')
  ) then raise exception 'draft contains unsupported fields' using errcode='22023'; end if;
  if v_draft ? 'currentUpstreamUrl' and coalesce(v_draft->>'currentUpstreamUrl','') !~ '^https://' then
    raise exception 'currentUpstreamUrl must use https' using errcode='22023';
  end if;

  v_member_id:=private.current_member_id();
  select role into v_role from public.club_members where id=v_member_id;
  insert into public.ecosystem_hub_publications(hub_slug,publication,revision,published_by_member_id,published_at)
  values(p_hub_slug,v_draft,1,v_member_id,now())
  on conflict (hub_slug) do update set publication=excluded.publication,revision=public.ecosystem_hub_publications.revision+1,
    published_by_member_id=excluded.published_by_member_id,published_at=excluded.published_at
  returning * into v_row;

  insert into public.ecosystem_audit_log(actor_member_id,actor_role,action,target_type,target_id,details)
  values(v_member_id,v_role,'hub_published','hub',p_hub_slug,jsonb_build_object('revision',v_row.revision));
  return jsonb_build_object('hubSlug',v_row.hub_slug,'publication',v_row.publication,'revision',v_row.revision,'publishedAt',v_row.published_at);
end $$;

revoke all on function public.ecosystem_public_hub_registry() from public, authenticated;
revoke all on function public.ecosystem_admin_publish_hub(text) from public, anon;
grant execute on function public.ecosystem_public_hub_registry() to anon, authenticated;
grant execute on function public.ecosystem_admin_publish_hub(text) to authenticated;
