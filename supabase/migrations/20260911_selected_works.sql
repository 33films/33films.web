-- Selected works (public portfolio). Additive only.

do $$ begin
  create type public.selected_work_category as enum (
    'music_video',
    'commercial',
    'brand_film',
    'short_film'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.selected_works (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  thumbnail_path text not null,
  video_path text not null,
  category public.selected_work_category not null,
  work_date date not null,
  published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists selected_works_published_idx on public.selected_works (published, work_date desc);
create index if not exists selected_works_slug_idx on public.selected_works (slug);

drop trigger if exists selected_works_updated_at on public.selected_works;
create trigger selected_works_updated_at before update on public.selected_works
  for each row execute function public.touch_updated_at();

alter table public.selected_works enable row level security;

drop policy if exists "selected_works_public_read" on public.selected_works;
create policy "selected_works_public_read" on public.selected_works
  for select using (published = true or public.is_admin());

drop policy if exists "selected_works_admin_write" on public.selected_works;
create policy "selected_works_admin_write" on public.selected_works
  for all using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.selected_works to authenticated;
grant select on public.selected_works to anon;

-- Public portfolio buckets (readable via public URL; writes only server-side).
insert into storage.buckets (id, name, public)
values
  ('portfolio-thumbnails', 'portfolio-thumbnails', true),
  ('portfolio-videos', 'portfolio-videos', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "No client portfolio thumbnail writes" on storage.objects;
create policy "No client portfolio thumbnail writes"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-thumbnails' and false);

drop policy if exists "No client portfolio thumbnail updates" on storage.objects;
create policy "No client portfolio thumbnail updates"
  on storage.objects for update
  using (bucket_id = 'portfolio-thumbnails' and false);

drop policy if exists "No client portfolio thumbnail deletes" on storage.objects;
create policy "No client portfolio thumbnail deletes"
  on storage.objects for delete
  using (bucket_id = 'portfolio-thumbnails' and false);

drop policy if exists "No client portfolio video writes" on storage.objects;
create policy "No client portfolio video writes"
  on storage.objects for insert
  with check (bucket_id = 'portfolio-videos' and false);

drop policy if exists "No client portfolio video updates" on storage.objects;
create policy "No client portfolio video updates"
  on storage.objects for update
  using (bucket_id = 'portfolio-videos' and false);

drop policy if exists "No client portfolio video deletes" on storage.objects;
create policy "No client portfolio video deletes"
  on storage.objects for delete
  using (bucket_id = 'portfolio-videos' and false);
