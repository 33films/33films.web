-- 33FILMS — run this in the Supabase SQL editor.
-- Private by default. Roles live in profiles, never trusted from the client.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.user_status as enum ('active', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.project_status as enum (
    'brief',
    'pre_production',
    'production',
    'post_production',
    'review',
    'approved',
    'delivered',
    'archived'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique not null,
  role public.user_role not null default 'user',
  status public.user_status not null default 'active',
  avatar_url text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  client_name text,
  status public.project_status not null default 'brief',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_users (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists public.project_folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order int not null default 0,
  unique (project_id, slug)
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  folder_id uuid not null references public.project_folders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  folder text,
  name text not null,
  original_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  size bigint not null default 0,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  seen_at timestamptz
);

create index if not exists files_project_id_idx on public.files (project_id);
create index if not exists files_user_id_idx on public.files (user_id);
create index if not exists files_folder_idx on public.files (folder);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Future notifications (MVP stores events; sending is not implemented)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.project_users
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.seed_project_folders()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.project_folders (project_id, slug, name, sort_order)
  values
    (new.id, 'brief', 'Brief', 0),
    (new.id, 'storyboard', 'Storyboard', 1),
    (new.id, 'production', 'Producción', 2),
    (new.id, 'review', 'Revisión', 3),
    (new.id, 'deliverables', 'Entregables', 4);
  return new;
end;
$$;

drop trigger if exists on_project_created_folders on public.projects;
create trigger on_project_created_folders
  after insert on public.projects
  for each row execute function public.seed_project_folders();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists files_updated_at on public.files;
create trigger files_updated_at before update on public.files
  for each row execute function public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_users enable row level security;
alter table public.project_folders enable row level security;
alter table public.files enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "projects_select" on public.projects;
create policy "projects_select" on public.projects
  for select using (public.is_admin() or public.is_project_member(id));

drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "project_users_select" on public.project_users;
create policy "project_users_select" on public.project_users
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "project_users_admin_write" on public.project_users;
create policy "project_users_admin_write" on public.project_users
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "folders_select" on public.project_folders;
create policy "folders_select" on public.project_folders
  for select using (public.is_admin() or public.is_project_member(project_id));

drop policy if exists "folders_admin_write" on public.project_folders;
create policy "folders_admin_write" on public.project_folders
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "files_select" on public.files;
create policy "files_select" on public.files
  for select using (public.is_admin() or public.is_project_member(project_id));

drop policy if exists "files_admin_write" on public.files;
create policy "files_admin_write" on public.files
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "activity_select_admin" on public.activity_logs;
create policy "activity_select_admin" on public.activity_logs
  for select using (public.is_admin());

drop policy if exists "activity_insert_admin" on public.activity_logs;
create policy "activity_insert_admin" on public.activity_logs
  for insert with check (public.is_admin());

drop policy if exists "notifications_own" on public.notifications;
create policy "notifications_own" on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

-- Storage bucket must be PRIVATE. Create it in the dashboard or:
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do update set public = false;

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.role()) = 'service_role' or public.is_admin() then
    return new;
  end if;
  new.id := old.id;
  new.role := old.role;
  new.status := old.status;
  new.email := old.email;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

drop policy if exists "No public storage reads" on storage.objects;
create policy "No public storage reads"
  on storage.objects for select
  using (bucket_id = 'client-files' and false);

drop policy if exists "No client storage writes" on storage.objects;
create policy "No client storage writes"
  on storage.objects for insert
  with check (bucket_id = 'client-files' and false);

drop policy if exists "No client storage updates" on storage.objects;
create policy "No client storage updates"
  on storage.objects for update
  using (bucket_id = 'client-files' and false);

drop policy if exists "No client storage deletes" on storage.objects;
create policy "No client storage deletes"
  on storage.objects for delete
  using (bucket_id = 'client-files' and false);

grant usage on schema public to postgres, anon, authenticated, service_role;

grant all on all tables in schema public to postgres, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

grant usage, select on all sequences in schema public to postgres, service_role, authenticated;

alter default privileges in schema public
  grant all on tables to postgres, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select on tables to anon;
