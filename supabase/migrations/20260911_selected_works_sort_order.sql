-- Additive: sort order for home grid.

alter table public.selected_works
  add column if not exists sort_order int not null default 0;

create index if not exists selected_works_sort_order_idx
  on public.selected_works (sort_order, work_date desc);

-- Backfill existing rows by date (newest first = lower sort_order = appears first).
with numbered as (
  select
    id,
    row_number() over (order by work_date desc, created_at desc) as rn
  from public.selected_works
)
update public.selected_works sw
set sort_order = numbered.rn
from numbered
where sw.id = numbered.id;
