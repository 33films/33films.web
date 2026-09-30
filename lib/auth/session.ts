import { createServerSupabase } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/platform/types";

export async function getAuthUser() {
  const supabase = await createServerSupabase();
  if (!supabase) return { user: null, profile: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) return { user, profile: null };

  return { user, profile: profile as Profile };
}

export async function requireUser() {
  const session = await getAuthUser();
  if (!session.user || !session.profile) {
    throw new Error("UNAUTHENTICATED");
  }
  if (session.profile.status === "inactive") {
    throw new Error("INACTIVE");
  }
  return session as { user: NonNullable<typeof session.user>; profile: Profile };
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export function isAdminRole(role: UserRole | null | undefined) {
  return role === "admin";
}
