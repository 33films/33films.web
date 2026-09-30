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

insert into public.project_folders (project_id, slug, name, sort_order)
select p.id, 'storyboard', 'Storyboard', 1
from public.projects p
where not exists (
  select 1
  from public.project_folders f
  where f.project_id = p.id
    and f.slug = 'storyboard'
);
