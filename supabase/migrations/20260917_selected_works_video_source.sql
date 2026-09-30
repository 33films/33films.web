-- Additive: explicit LOCAL vs VIMEO source. Keeps video_path / vimeo_id.

do $$ begin
  create type public.selected_work_video_source as enum ('LOCAL', 'VIMEO');
exception when duplicate_object then null; end $$;

alter table public.selected_works
  add column if not exists video_source public.selected_work_video_source;

update public.selected_works
set video_source = case
  when vimeo_id is not null and btrim(vimeo_id) <> '' then 'VIMEO'::public.selected_work_video_source
  else 'LOCAL'::public.selected_work_video_source
end
where video_source is null;

alter table public.selected_works
  alter column video_source set default 'LOCAL';

alter table public.selected_works
  alter column video_source set not null;

alter table public.selected_works
  drop constraint if exists selected_works_has_playback;

alter table public.selected_works
  add constraint selected_works_has_playback
  check (
    (
      video_source = 'LOCAL'
      and video_path is not null
      and btrim(video_path) <> ''
    )
    or (
      video_source = 'VIMEO'
      and vimeo_id is not null
      and btrim(vimeo_id) <> ''
    )
  );
