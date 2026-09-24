-- Mirrors production migration ecosystem_admin_backend_shadow_v1.
-- Additive only: no existing table or UI contract is modified.

create table if not exists public.ecosystem_hub_drafts (
  hub_slug text primary key check (hub_slug in ('study-os','ai-thiet-chan','trung-y-van','atlas')),
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object'),
  revision bigint not null default 0 check (revision >= 0),
  updated_by_member_id uuid null references public.club_members(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ecosystem_moderation_queue (
  id uuid primary key default gen_random_uuid(),
  item_type text not null default 'content' check (item_type in ('content','link','announcement','event','other')),
  hub_slug text null check (hub_slug is null or hub_slug in ('study-os','ai-thiet-chan','trung-y-van','atlas')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (status in ('pending','reviewed','archived')),
  created_by_member_id uuid not null references public.club_members(id) on delete restrict,
  reviewed_by_member_id uuid null references public.club_members(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null
);

create table if not exists public.ecosystem_audit_log (
  id bigint generated always as identity primary key,
  actor_member_id uuid null references public.club_members(id) on delete set null,
  actor_role public.app_role null,
  action text not null check (char_length(action) between 3 and 80),
  target_type text not null check (char_length(target_type) between 2 and 40),
  target_id text null,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists ecosystem_moderation_queue_status_created_idx
  on public.ecosystem_moderation_queue(status, created_at desc);
create index if not exists ecosystem_audit_log_created_idx
  on public.ecosystem_audit_log(created_at desc);

alter table public.ecosystem_hub_drafts enable row level security;
alter table public.ecosystem_moderation_queue enable row level security;
alter table public.ecosystem_audit_log enable row level security;

drop policy if exists ecosystem_hub_drafts_staff_read on public.ecosystem_hub_drafts;
create policy ecosystem_hub_drafts_staff_read on public.ecosystem_hub_drafts
for select to authenticated using (private.has_min_role('mod'::public.app_role));

drop policy if exists ecosystem_moderation_queue_staff_read on public.ecosystem_moderation_queue;
create policy ecosystem_moderation_queue_staff_read on public.ecosystem_moderation_queue
for select to authenticated using (private.has_min_role('mod'::public.app_role));

drop policy if exists ecosystem_audit_log_staff_read on public.ecosystem_audit_log;
create policy ecosystem_audit_log_staff_read on public.ecosystem_audit_log
for select to authenticated using (private.has_min_role('mod'::public.app_role));

revoke all on table public.ecosystem_hub_drafts from anon, authenticated;
revoke all on table public.ecosystem_moderation_queue from anon, authenticated;
revoke all on table public.ecosystem_audit_log from anon, authenticated;
grant select on table public.ecosystem_hub_drafts to authenticated;
grant select on table public.ecosystem_moderation_queue to authenticated;
grant select on table public.ecosystem_audit_log to authenticated;

create or replace function public.ecosystem_staff_snapshot()
returns jsonb language plpgsql stable security definer
set search_path = public, private, pg_catalog
as $$
declare v_member_id uuid; v_role public.app_role;
begin
  if not private.has_min_role('mod'::public.app_role) then raise exception 'forbidden' using errcode='42501'; end if;
  v_member_id := private.current_member_id();
  select role into v_role from public.club_members where id=v_member_id;
  return jsonb_build_object(
    'memberId',v_member_id,'role',v_role,
    'hubDrafts',coalesce((select jsonb_agg(jsonb_build_object('hubSlug',hub_slug,'draft',draft,'revision',revision,'updatedAt',updated_at,'updatedByMemberId',updated_by_member_id) order by hub_slug) from public.ecosystem_hub_drafts),'[]'::jsonb),
    'moderationQueue',coalesce((select jsonb_agg(jsonb_build_object('id',id,'itemType',item_type,'hubSlug',hub_slug,'payload',payload,'status',status,'createdByMemberId',created_by_member_id,'reviewedByMemberId',reviewed_by_member_id,'createdAt',created_at,'reviewedAt',reviewed_at) order by created_at desc) from public.ecosystem_moderation_queue limit 100),'[]'::jsonb),
    'auditLog',coalesce((select jsonb_agg(jsonb_build_object('id',id,'actorMemberId',actor_member_id,'actorRole',actor_role,'action',action,'targetType',target_type,'targetId',target_id,'details',details,'createdAt',created_at) order by created_at desc) from (select * from public.ecosystem_audit_log order by created_at desc limit 100) a),'[]'::jsonb)
  );
end $$;

create or replace function public.ecosystem_admin_save_hub_draft(p_hub_slug text,p_draft jsonb,p_expected_revision bigint default null)
returns jsonb language plpgsql security definer
set search_path = public, private, pg_catalog
as $$
declare v_member_id uuid; v_role public.app_role; v_current_revision bigint; v_next_revision bigint; v_row public.ecosystem_hub_drafts%rowtype;
begin
  if not private.has_min_role('admin'::public.app_role) then raise exception 'forbidden' using errcode='42501'; end if;
  if p_hub_slug not in ('study-os','ai-thiet-chan','trung-y-van','atlas') then raise exception 'invalid hub slug' using errcode='22023'; end if;
  if p_draft is null or jsonb_typeof(p_draft)<>'object' then raise exception 'draft must be a JSON object' using errcode='22023'; end if;
  if exists(select 1 from jsonb_object_keys(p_draft) k(key) where key not in ('name','shortName','tagline','description','currentUpstreamUrl')) then raise exception 'draft contains unsupported fields' using errcode='22023'; end if;
  if p_draft ? 'currentUpstreamUrl' and coalesce(p_draft->>'currentUpstreamUrl','') !~ '^https://' then raise exception 'currentUpstreamUrl must use https' using errcode='22023'; end if;
  v_member_id:=private.current_member_id(); select role into v_role from public.club_members where id=v_member_id;
  select revision into v_current_revision from public.ecosystem_hub_drafts where hub_slug=p_hub_slug for update;
  if found then
    if p_expected_revision is not null and p_expected_revision<>v_current_revision then raise exception 'revision_conflict' using errcode='40001'; end if;
    v_next_revision:=v_current_revision+1;
    update public.ecosystem_hub_drafts set draft=p_draft,revision=v_next_revision,updated_by_member_id=v_member_id,updated_at=now() where hub_slug=p_hub_slug returning * into v_row;
  else
    if p_expected_revision is not null and p_expected_revision<>0 then raise exception 'revision_conflict' using errcode='40001'; end if;
    insert into public.ecosystem_hub_drafts(hub_slug,draft,revision,updated_by_member_id) values(p_hub_slug,p_draft,1,v_member_id) returning * into v_row;
  end if;
  insert into public.ecosystem_audit_log(actor_member_id,actor_role,action,target_type,target_id,details) values(v_member_id,v_role,'hub_draft_saved','hub',p_hub_slug,jsonb_build_object('revision',v_row.revision));
  return jsonb_build_object('hubSlug',v_row.hub_slug,'draft',v_row.draft,'revision',v_row.revision,'updatedAt',v_row.updated_at);
end $$;

create or replace function public.ecosystem_mod_submit_queue(p_item_type text,p_hub_slug text,p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = public, private, pg_catalog
as $$
declare v_member_id uuid; v_role public.app_role; v_id uuid;
begin
  if not private.has_min_role('mod'::public.app_role) then raise exception 'forbidden' using errcode='42501'; end if;
  if p_item_type not in ('content','link','announcement','event','other') then raise exception 'invalid item type' using errcode='22023'; end if;
  if p_hub_slug is not null and p_hub_slug not in ('study-os','ai-thiet-chan','trung-y-van','atlas') then raise exception 'invalid hub slug' using errcode='22023'; end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'payload must be a JSON object' using errcode='22023'; end if;
  v_member_id:=private.current_member_id(); select role into v_role from public.club_members where id=v_member_id;
  insert into public.ecosystem_moderation_queue(item_type,hub_slug,payload,created_by_member_id) values(p_item_type,p_hub_slug,p_payload,v_member_id) returning id into v_id;
  insert into public.ecosystem_audit_log(actor_member_id,actor_role,action,target_type,target_id,details) values(v_member_id,v_role,'moderation_submitted','moderation',v_id::text,jsonb_build_object('itemType',p_item_type,'hubSlug',p_hub_slug));
  return jsonb_build_object('id',v_id,'status','pending');
end $$;

create or replace function public.ecosystem_mod_review_queue(p_id uuid,p_status text)
returns jsonb language plpgsql security definer
set search_path = public, private, pg_catalog
as $$
declare v_member_id uuid; v_role public.app_role; v_row public.ecosystem_moderation_queue%rowtype;
begin
  if not private.has_min_role('mod'::public.app_role) then raise exception 'forbidden' using errcode='42501'; end if;
  if p_status not in ('reviewed','archived') then raise exception 'invalid moderation status' using errcode='22023'; end if;
  v_member_id:=private.current_member_id(); select role into v_role from public.club_members where id=v_member_id;
  update public.ecosystem_moderation_queue set status=p_status,reviewed_by_member_id=v_member_id,reviewed_at=now() where id=p_id returning * into v_row;
  if not found then raise exception 'moderation item not found' using errcode='P0002'; end if;
  insert into public.ecosystem_audit_log(actor_member_id,actor_role,action,target_type,target_id,details) values(v_member_id,v_role,'moderation_reviewed','moderation',p_id::text,jsonb_build_object('status',p_status));
  return jsonb_build_object('id',v_row.id,'status',v_row.status,'reviewedAt',v_row.reviewed_at);
end $$;

revoke all on function public.ecosystem_staff_snapshot() from public, anon;
revoke all on function public.ecosystem_admin_save_hub_draft(text,jsonb,bigint) from public, anon;
revoke all on function public.ecosystem_mod_submit_queue(text,text,jsonb) from public, anon;
revoke all on function public.ecosystem_mod_review_queue(uuid,text) from public, anon;
grant execute on function public.ecosystem_staff_snapshot() to authenticated;
grant execute on function public.ecosystem_admin_save_hub_draft(text,jsonb,bigint) to authenticated;
grant execute on function public.ecosystem_mod_submit_queue(text,text,jsonb) to authenticated;
grant execute on function public.ecosystem_mod_review_queue(uuid,text) to authenticated;
