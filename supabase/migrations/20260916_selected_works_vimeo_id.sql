-- Additive: Vimeo IDs for selected works. video_path stays for legacy MP4s.

alter table public.selected_works
  add column if not exists vimeo_id text;

alter table public.selected_works
  alter column video_path drop not null;

alter table public.selected_works
  drop constraint if exists selected_works_has_playback;

alter table public.selected_works
  add constraint selected_works_has_playback
  check (
    (vimeo_id is not null and btrim(vimeo_id) <> '')
    or (video_path is not null and btrim(video_path) <> '')
  );
