-- Homepage hero video: bundled default, uploaded file, or Vimeo. Additive only.

create table if not exists public.home_settings (
  id smallint primary key default 1 check (id = 1),
  hero_source text not null default 'default'
    check (hero_source in ('default', 'upload', 'vimeo')),
  hero_video_path text,
  hero_vimeo_id text,
  updated_at timestamptz not null default now()
);

insert into public.home_settings (id, hero_source)
values (1, 'default')
on conflict (id) do nothing;

drop trigger if exists home_settings_updated_at on public.home_settings;
create trigger home_settings_updated_at before update on public.home_settings
  for each row execute function public.touch_updated_at();

alter table public.home_settings enable row level security;

drop policy if exists "home_settings_public_read" on public.home_settings;
create policy "home_settings_public_read" on public.home_settings
  for select using (true);

drop policy if exists "home_settings_admin_write" on public.home_settings;
create policy "home_settings_admin_write" on public.home_settings
  for all using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.home_settings to authenticated;
grant select on public.home_settings to anon;

insert into storage.buckets (id, name, public)
values ('home-media', 'home-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "No client home media writes" on storage.objects;
create policy "No client home media writes"
  on storage.objects for insert
  with check (bucket_id = 'home-media' and false);

drop policy if exists "No client home media updates" on storage.objects;
create policy "No client home media updates"
  on storage.objects for update
  using (bucket_id = 'home-media' and false);

drop policy if exists "No client home media deletes" on storage.objects;
create policy "No client home media deletes"
  on storage.objects for delete
  using (bucket_id = 'home-media' and false);
