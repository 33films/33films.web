"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

// TEMP: auth diagnostics for production. Logs only code/status/message; remove once resolved.
function logAuthError(
  step: string,
  error: { code?: string; status?: number; message?: string } | null
) {
  console.error("[auth-debug]", {
    step,
    code: error?.code ?? null,
    status: error?.status ?? null,
    message: error?.message ?? null,
  });
}

export type AuthActionState = {
  error?: "setup" | "auth" | "inactive" | "confirm" | "mismatch";
  ok?: boolean;
} | null;

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logAuthError("signIn.signInWithPassword", error);
    return { error: "auth" };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user) {
    logAuthError("signIn.getUser", userError);
    return { error: "auth" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (profile?.status === "inactive") {
    await supabase.auth.signOut();
    return { error: "inactive" };
  }

  await supabase
    .from("profiles")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", user.id);

  if (next.startsWith("/")) redirect(next);
  redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" };

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  if (password !== confirmPassword) return { error: "mismatch" };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) {
    logAuthError("signUp", error);
    return { error: "auth" };
  }
  if (!data.session) return { error: "confirm" };
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createServerSupabase();
  await supabase?.auth.signOut();
  redirect("/");
}

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" };
  const email = String(formData.get("email") ?? "");
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login`,
  });
  return { ok: true };
}
