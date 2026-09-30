"use client";

import Link from "next/link";
import { useActionState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { AuthActionState } from "@/app/actions/auth";

type Mode = "login" | "register" | "forgot";

export default function AuthForm({
  mode,
  action,
  nextPath = "",
}: {
  mode: Mode;
  action: (
    prev: AuthActionState,
    formData: FormData
  ) => Promise<AuthActionState>;
  nextPath?: string;
}) {
  const { dictionary } = useI18n();
  const t = dictionary.auth;
  const [state, formAction, pending] = useActionState(action, null);

  const error =
    state?.error === "setup"
      ? t.setup
      : state?.error === "inactive"
        ? t.inactive
        : state?.error === "confirm"
          ? t.confirmEmail
          : state?.error === "mismatch"
            ? t.mismatch
            : state?.error
              ? t.error
              : null;

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
        <h1 className="text-headline mt-4 text-off-white">
          {mode === "login"
            ? t.login
            : mode === "register"
              ? t.register
              : t.forgot}
        </h1>

        <form action={formAction} className="mt-12 space-y-8">
          {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

          {mode === "register" && (
            <Field name="full_name" label={t.fullName} />
          )}
          <Field name="email" label={t.email} type="email" />
          {mode !== "forgot" && (
            <Field name="password" label={t.password} type="password" />
          )}
          {mode === "register" && (
            <Field
              name="confirm_password"
              label={t.confirmPassword}
              type="password"
            />
          )}

          {error && <p className="text-body text-off-white/70">{error}</p>}
          {state?.ok && <p className="text-body text-off-white/70">{t.resetSent}</p>}

          <button
            type="submit"
            disabled={pending}
            className="text-label w-full border border-off-white py-4 text-off-white transition-colors hover:bg-off-white hover:text-black disabled:opacity-50"
          >
            {mode === "login"
              ? t.submitLogin
              : mode === "register"
                ? t.submitRegister
                : t.submitForgot}
          </button>
        </form>

        <div className="mt-10 space-y-3">
          {mode === "login" && (
            <>
              <Link href="/forgot-password" className="text-label block text-gray">
                {t.forgotLink}
              </Link>
              <p className="text-label text-gray">
                {t.noAccount}{" "}
                <Link href="/register" className="text-off-white">
                  {t.register}
                </Link>
              </p>
            </>
          )}
          {mode !== "login" && (
            <p className="text-label text-gray">
              {t.haveAccount}{" "}
              <Link href="/login" className="text-off-white">
                {t.backToLogin}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
}: {
  name: string;
  label: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-label text-gray">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        className="mt-2 w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none focus:border-off-white"
      />
    </div>
  );
}
