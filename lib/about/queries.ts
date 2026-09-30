import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { team } from "@/data/team";
import { getDictionary } from "@/lib/i18n/server";
import { withAboutPhotoUrl } from "./urls";
import type { AboutMember, AboutMemberPublic } from "./types";

function isMissingAboutSchema(error: { code?: string; message?: string } | null) {
  const code = error?.code ?? "";
  const message = error?.message ?? "";
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    message.includes("about_members") ||
    message.includes("about_settings") ||
    message.includes("schema cache")
  );
}

async function fallbackMembers(): Promise<AboutMemberPublic[]> {
  const t = (await getDictionary()).studio.members;
  return team.map((member, index) => ({
    id: member.id,
    name: t[member.id].name,
    role: t[member.id].role,
    photo_path: member.image,
    photo_url: member.image,
    sort_order: index,
    created_at: "",
    updated_at: "",
  }));
}

export async function getAboutEnabled() {
  const supabase = await createServerSupabase();
  if (!supabase) return true;

  const { data, error } = await supabase
    .from("about_settings")
    .select("enabled")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    if (isMissingAboutSchema(error)) return true;
    console.error("about_settings read", error);
    return true;
  }

  return data?.enabled !== false;
}

export async function getAboutMembers() {
  const supabase = await createServerSupabase();
  if (!supabase) return fallbackMembers();

  const { data, error } = await supabase
    .from("about_members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingAboutSchema(error)) return fallbackMembers();
    console.error("about_members read", error);
    return [] as AboutMemberPublic[];
  }

  return ((data ?? []) as AboutMember[]).map(withAboutPhotoUrl);
}

export async function getAboutAdminState() {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return { schemaMissing: true as const, enabled: true, members: [] as AboutMemberPublic[] };
  }

  const settings = await supabase
    .from("about_settings")
    .select("enabled")
    .eq("id", 1)
    .maybeSingle();

  if (settings.error && isMissingAboutSchema(settings.error)) {
    return { schemaMissing: true as const, enabled: true, members: [] as AboutMemberPublic[] };
  }

  const members = await supabase
    .from("about_members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (members.error && isMissingAboutSchema(members.error)) {
    return { schemaMissing: true as const, enabled: true, members: [] as AboutMemberPublic[] };
  }

  return {
    schemaMissing: false as const,
    enabled: settings.data?.enabled !== false,
    members: ((members.data ?? []) as AboutMember[]).map(withAboutPhotoUrl),
  };
}

export async function getPublicAbout() {
  const enabled = await getAboutEnabled();
  if (!enabled) return { enabled: false, members: [] as AboutMemberPublic[] };
  return { enabled: true, members: await getAboutMembers() };
}
