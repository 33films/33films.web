-- About page visibility + team profiles. Additive only.

create table if not exists public.about_settings (
  id smallint primary key default 1 check (id = 1),
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.about_settings (id, enabled)
values (1, true)
on conflict (id) do nothing;

create table if not exists public.about_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  photo_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists about_members_sort_idx on public.about_members (sort_order, created_at);

drop trigger if exists about_settings_updated_at on public.about_settings;
create trigger about_settings_updated_at before update on public.about_settings
  for each row execute function public.touch_updated_at();

drop trigger if exists about_members_updated_at on public.about_members;
create trigger about_members_updated_at before update on public.about_members
  for each row execute function public.touch_updated_at();

alter table public.about_settings enable row level security;
alter table public.about_members enable row level security;

drop policy if exists "about_settings_public_read" on public.about_settings;
create policy "about_settings_public_read" on public.about_settings
  for select using (true);

drop policy if exists "about_settings_admin_write" on public.about_settings;
create policy "about_settings_admin_write" on public.about_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "about_members_public_read" on public.about_members;
create policy "about_members_public_read" on public.about_members
  for select using (true);

drop policy if exists "about_members_admin_write" on public.about_members;
create policy "about_members_admin_write" on public.about_members
  for all using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.about_settings to authenticated;
grant select on public.about_settings to anon;
grant select, insert, update, delete on public.about_members to authenticated;
grant select on public.about_members to anon;

insert into storage.buckets (id, name, public)
values ('about-photos', 'about-photos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "No client about photo writes" on storage.objects;
create policy "No client about photo writes"
  on storage.objects for insert
  with check (bucket_id = 'about-photos' and false);

drop policy if exists "No client about photo updates" on storage.objects;
create policy "No client about photo updates"
  on storage.objects for update
  using (bucket_id = 'about-photos' and false);

drop policy if exists "No client about photo deletes" on storage.objects;
create policy "No client about photo deletes"
  on storage.objects for delete
  using (bucket_id = 'about-photos' and false);
