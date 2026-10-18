"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";

type Phase = "checking" | "ready" | "invalid" | "done";

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;

function isMissingSession(error: { name?: string; message?: string; code?: string } | null) {
  if (!error) return false;
  return (
    error.name === "AuthSessionMissingError" ||
    error.code === "session_not_found" ||
    /session missing/i.test(error.message ?? "")
  );
}

function logResetError(
  step: string,
  error: { code?: string; status?: number; name?: string; message?: string } | null
) {
  if (isMissingSession(error)) return;
  console.error("[auth-debug]", {
    step,
    code: error?.code ?? null,
    status: error?.status ?? null,
  });
}

function readRecoveryParams() {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  return {
    code: url.searchParams.get("code"),
    tokenHash: url.searchParams.get("token_hash"),
    type: url.searchParams.get("type") ?? hash.get("type"),
    hashToken: hash.get("access_token"),
    refreshToken: hash.get("refresh_token") ?? "",
    errorCode:
      url.searchParams.get("error_code") ??
      hash.get("error_code") ??
      url.searchParams.get("error") ??
      hash.get("error"),
  };
}

export default function ResetPasswordForm() {
  const { dictionary } = useI18n();
  const t = dictionary.auth;

  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    const params = readRecoveryParams();
    const finish = (ok: boolean) => {
      if (cancelled) return;
      setPhase(ok ? "ready" : "invalid");
      if (ok) window.history.replaceState(null, "", "/reset-password");
    };

    if (!supabase) {
      finish(false);
      return;
    }

    // Middleware already rejected this link and removed the one-time proof.
    if (params.errorCode && !params.code && !params.tokenHash && !params.hashToken) {
      finish(false);
      return;
    }

    void (async () => {
      if (params.hashToken && params.type === "recovery") {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.hashToken,
          refresh_token: params.refreshToken,
        });
        if (sessionError) logResetError("recovery.setSession", sessionError);
        const { data } = await supabase.auth.getUser();
        finish(Boolean(data.user) && !sessionError);
        return;
      }

      if (params.tokenHash && params.type === "recovery") {
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: params.tokenHash,
        });
        if (otpError) logResetError("recovery.verifyOtp", otpError);
        finish(!otpError);
        return;
      }

      if (params.code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
        if (exchangeError) logResetError("recovery.exchangeCode", exchangeError);
        const { data } = await supabase.auth.getUser();
        finish(Boolean(data.user));
        return;
      }

      // The server middleware exchanges ?code= / token_hash and redirects here with the session cookie.
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) logResetError("recovery.getUser", userError);
      finish(Boolean(data.user));
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const rules = [
    { ok: password.length >= 8, label: t.ruleLength },
    { ok: /[A-Za-z]/.test(password), label: t.ruleLetter },
    { ok: /\d/.test(password), label: t.ruleNumber },
  ];
  const confirmMismatch = confirm.length > 0 && password !== confirm;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!PASSWORD_PATTERN.test(password)) {
      setError(t.weakPassword);
      return;
    }
    if (password !== confirm) {
      setError(t.mismatch);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError(t.setup);
      return;
    }

    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setPending(false);
      logResetError("recovery.updateUser", updateError);
      if (updateError.code === "same_password") setError(t.samePassword);
      else if (updateError.code === "weak_password") setError(t.weakPassword);
      else if (updateError.status === 429) setError(t.rateLimited);
      else if (updateError.status === 401 || updateError.code === "session_not_found") {
        setPhase("invalid");
      } else setError(t.error);
      return;
    }

    await supabase.auth.signOut().catch(() => undefined);
    setPending(false);
    setPassword("");
    setConfirm("");
    setPhase("done");
  };

  return (
    <div className="flex min-h-screen flex-col bg-black px-5 py-10 md:px-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-label tracking-[0.2em] text-off-white">
          33FILMS
        </Link>
        <LanguageSwitcher />
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
        <p className="text-label text-gray">{t.subtitle}</p>
        <h1 className="text-headline mt-4 text-off-white">{t.reset}</h1>

        {phase === "checking" ? (
          <div className="mt-12 space-y-5" role="status">
            <p className="text-label text-off-white/70">{t.verifyingLink}</p>
            <div className="relative h-px w-40 overflow-hidden bg-off-white/15">
              <span className="player-indeterminate absolute inset-y-0 w-1/3 bg-off-white" />
            </div>
          </div>
        ) : null}

        {phase === "invalid" ? (
          <div className="mt-12 space-y-8" role="alert">
            <p className="text-body text-off-white/80">{t.linkInvalid}</p>
            <Link
              href="/forgot-password"
              className="text-label block w-full border border-off-white py-4 text-center text-off-white transition-colors hover:bg-off-white hover:text-black"
            >
              {t.requestNewLink}
            </Link>
          </div>
        ) : null}

        {phase === "done" ? (
          <div className="mt-12 space-y-8" role="status">
            <p className="text-body text-off-white/80">{t.resetDone}</p>
            <Link
              href="/login"
              className="text-label block w-full border border-off-white py-4 text-center text-off-white transition-colors hover:bg-off-white hover:text-black"
            >
              {t.goToLogin}
            </Link>
          </div>
        ) : null}

        {phase === "ready" ? (
          <>
            <p className="text-body mt-6 text-gray">{t.resetHint}</p>
            <form onSubmit={onSubmit} className="mt-12 space-y-8" noValidate>
              <div>
                <PasswordField
                  id="new_password"
                  label={t.newPassword}
                  value={password}
                  onChange={setPassword}
                />
                <ul className="mt-4 space-y-2">
                  {rules.map((rule) => (
                    <li
                      key={rule.label}
                      className={`text-label ${rule.ok ? "text-off-white" : "text-gray"}`}
                    >
                      {rule.ok ? "●" : "○"} {rule.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <PasswordField
                  id="confirm_new_password"
                  label={t.confirmNewPassword}
                  value={confirm}
                  onChange={setConfirm}
                />
                {confirmMismatch ? (
                  <p className="text-label mt-3 text-off-white/70">{t.mismatch}</p>
                ) : null}
              </div>

              {error ? (
                <p className="text-body text-off-white/70" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                className="text-label w-full border border-off-white py-4 text-off-white transition-colors hover:bg-off-white hover:text-black disabled:opacity-50"
              >
                {pending ? t.saving : t.submitReset}
              </button>
            </form>
          </>
        ) : null}

        {phase !== "done" ? (
          <div className="mt-10">
            <Link href="/login" className="text-label text-gray hover:text-off-white">
              {t.backToLogin}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-label text-gray">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={72}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none focus:border-off-white"
      />
    </div>
  );
}
