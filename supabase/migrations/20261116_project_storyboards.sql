-- Additive storyboard document. One row per project. Does not alter scenes stored in the browser.

create table if not exists public.project_storyboards (
  project_id uuid primary key references public.projects(id) on delete cascade,
  document jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.project_storyboards enable row level security;

drop policy if exists "storyboards_admin_all" on public.project_storyboards;
create policy "storyboards_admin_all" on public.project_storyboards
  for all using (public.is_admin()) with check (public.is_admin());

grant select, insert, update, delete on public.project_storyboards to authenticated;
grant all on public.project_storyboards to service_role;
