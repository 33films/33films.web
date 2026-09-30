-- Additive only. Does not drop tables.
-- Run after supabase/schema.sql (or on an existing 33FILMS database).

alter table public.files
  add column if not exists user_id uuid references public.profiles(id) on delete set null;

alter table public.files
  add column if not exists folder text;

create index if not exists files_project_id_idx on public.files (project_id);
create index if not exists files_user_id_idx on public.files (user_id);
create index if not exists files_folder_idx on public.files (folder);

-- Never copy a self-assigned role from signup metadata.
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

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
    and email = (select email from public.profiles where id = auth.uid())
  );

-- Keep the private bucket private if it already exists.
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do update set public = false;

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
