import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { withPortfolioUrls } from "./urls";
import type { SelectedWork, SelectedWorkPublic } from "./types";

export async function getPublishedSelectedWorks(limit?: number) {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as SelectedWorkPublic[];

  const rows = await fetchSelectedWorksOrdered(supabase, {
    published: true,
    limit,
  });
  return rows.map(withPortfolioUrls);
}

async function fetchSelectedWorksOrdered(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>,
  filters?: { published?: boolean; limit?: number }
) {
  let query = supabase.from("selected_works").select("*");

  if (filters?.published) query = query.eq("published", true);

  let { data, error } = await query
    .order("sort_order", { ascending: true })
    .order("work_date", { ascending: false });

  if (error?.code === "42703") {
    ({ data, error } = await query.order("work_date", { ascending: false }));
  }

  if (error || !data) return [] as SelectedWork[];

  const rows = filters?.limit ? data.slice(0, filters.limit) : data;
  return rows as SelectedWork[];
}

export async function getAllSelectedWorksAdmin() {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as SelectedWorkPublic[];

  const rows = await fetchSelectedWorksOrdered(supabase);
  return rows.map(withPortfolioUrls);
}

export async function getSelectedWorkById(id: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("selected_works")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data ? withPortfolioUrls(data as SelectedWork) : null;
}

export async function getPublishedSelectedWorkBySlug(slug: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("selected_works")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  return data ? withPortfolioUrls(data as SelectedWork) : null;
}
