-- Remove the temporary isolated feed; Game Hub now uses garden_hub_report_error_v1
-- and Admin Center reads it through the shared ecosystem audit snapshot.

drop function if exists public.game_hub_record_error_v1(text, text);
drop function if exists public.ecosystem_admin_gamehub_error_feed_v1(integer);
drop table if exists public.ecosystem_gamehub_error_events;
