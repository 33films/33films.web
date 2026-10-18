import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localeCookie } from "@/lib/i18n/config";
import { isSupabaseConfigured } from "./env";

const RECOVERY_PATHS = ["/", "/login", "/reset-password"];

function isPrefetch(request: NextRequest) {
  return (
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch"
  );
}

function recoverySearch(url: URL) {
  return {
    code: url.searchParams.get("code"),
    tokenHash: url.searchParams.get("token_hash"),
    type: url.searchParams.get("type"),
    hasAuthError:
      url.searchParams.has("error_code") ||
      url.searchParams.has("error_description") ||
      url.searchParams.get("error") === "access_denied",
  };
}

/**
 * Recovery links arrive as ?code= (PKCE, including the Site URL fallback on /)
 * or ?token_hash=&type=recovery (custom email). Exchange them before render.
 */
type PendingCookie = { name: string; value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] };

async function settleRecovery(
  request: NextRequest,
  getCookies: () => PendingCookie[],
  supabase: {
  auth: {
    exchangeCodeForSession: (code: string) => Promise<{ error: { code?: string; status?: number } | null }>;
    verifyOtp: (args: {
      type: "recovery";
      token_hash: string;
    }) => Promise<{ error: { code?: string; status?: number } | null }>;
  };
} | null) {
  if (request.method !== "GET" || isPrefetch(request)) return null;

  const url = request.nextUrl;
  if (!RECOVERY_PATHS.includes(url.pathname)) return null;

  const proof = recoverySearch(url);
  const onReset = url.pathname === "/reset-password";
  const hasProof = Boolean(proof.code || proof.tokenHash || proof.type === "recovery" || proof.hasAuthError);
  if (!hasProof) return null;
  // The reset page already shows this error. Redirecting again would loop.
  if (onReset && !proof.code && !proof.tokenHash) return null;

  let failed = false;

  if (proof.code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(proof.code);
    if (error) {
      console.error("[auth-debug]", {
        step: "recovery.exchangeCode",
        code: error.code ?? null,
        status: error.status ?? null,
      });
      failed = true;
    }
  } else if (proof.tokenHash && proof.type === "recovery" && supabase) {
    const { error } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash: proof.tokenHash,
    });
    if (error) {
      console.error("[auth-debug]", {
        step: "recovery.verifyOtp",
        code: error.code ?? null,
        status: error.status ?? null,
      });
      failed = true;
    }
  } else {
    failed = true;
  }

  const dest = url.clone();
  const lang = dest.searchParams.get("lang");
  dest.pathname = "/reset-password";
  dest.search = "";
  if (failed) dest.searchParams.set("error", "invalid_link");

  const redirect = NextResponse.redirect(dest);
  for (const cookie of getCookies()) {
    redirect.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  if (isLocale(lang)) {
    redirect.cookies.set(localeCookie, lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return redirect;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    const redirect = await settleRecovery(request, () => [], null);
    return {
      response: redirect ?? response,
      user: null,
      role: null as "admin" | "user" | null,
      hasProfile: false,
    };
  }

  let pendingCookies: PendingCookie[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          pendingCookies = cookiesToSet;
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const recoveryRedirect = await settleRecovery(request, () => pendingCookies, supabase);
  if (recoveryRedirect) {
    return {
      response: recoveryRedirect,
      user: null,
      role: null as "admin" | "user" | null,
      hasProfile: false,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "admin" | "user" | null = null;
  let hasProfile = false;

  if (user) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();

    if (profile && !error) {
      hasProfile = true;
      role = profile.role as "admin" | "user";
      if (profile.status === "inactive") {
        await supabase.auth.signOut();
        return { response, user: null, role: null, hasProfile: false };
      }
    }
  }

  return { response, user, role, hasProfile };
}
