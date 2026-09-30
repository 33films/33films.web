"use client";

import { FormEvent, useMemo, useState, type InputHTMLAttributes } from "react";
import { CONTACT_EMAIL, CONTACT_PROJECT_TYPES } from "@/lib/contact";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const fieldClass =
  "mt-2 min-h-12 w-full border-b border-black/20 bg-transparent py-3 text-black outline-none transition-colors placeholder:text-black/25 focus:border-black focus-visible:border-black";

type FormState = "idle" | "loading" | "success" | "error" | "config";
type ApiError = {
  ok?: boolean;
  error?: string;
  detail?: { name?: string; statusCode?: number | null; message?: string };
};

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export default function ContactForm() {
  const { dictionary } = useI18n();
  const t = dictionary.contact;
  const [state, setState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [debugDetail, setDebugDetail] = useState<string>("");
  const startedAt = useMemo(() => Date.now(), []);

  const types = [
    { value: "commercial", label: t.typeCommercial },
    { value: "brand_film", label: t.typeBrand },
    { value: "music_video", label: t.typeMusic },
    { value: "short_film", label: t.typeShort },
    { value: "other", label: t.typeOther },
  ];

  const validate = (form: FormData): FieldErrors => {
    const next: FieldErrors = {};
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (!name) next.name = t.nameRequired;
    if (!email || !EMAIL.test(email)) next.email = t.emailInvalid;
    if (!message) next.message = t.messageRequired;
    return next;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "loading") return;

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      setState("idle");
      return;
    }

    setState("loading");

    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      company: String(form.get("company") ?? "").trim(),
      projectType: String(form.get("projectType") ?? CONTACT_PROJECT_TYPES[0]),
      budget: "",
      deadline: "",
      message: String(form.get("message") ?? "").trim(),
      website: String(form.get("website") ?? ""),
      startedAt,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as ApiError | null;

      if (res.ok && data?.ok) {
        setState("success");
        formEl.reset();
        return;
      }
      const resendMessage = data?.detail?.message;
      setDebugDetail(
        [
          `HTTP ${res.status}`,
          data?.error ? `error=${data.error}` : null,
          data?.detail?.statusCode ? `resend=${data.detail.statusCode}` : null,
          resendMessage,
        ]
          .filter(Boolean)
          .join(" — ")
      );
      setState(data?.error === "config" ? "config" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="max-w-xl" role="status" aria-live="polite">
        <p className="text-headline text-black">{t.successTitle}</p>
        <p className="text-body mt-6 text-black/50">{t.successBody}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative max-w-xl space-y-8"
      noValidate
      aria-busy={state === "loading"}
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
      />

      <Field
        id="name"
        label={t.name}
        placeholder={t.namePlaceholder}
        error={errors.name}
        autoComplete="name"
        required
      />
      <Field
        id="email"
        label={t.email}
        type="email"
        placeholder={t.emailPlaceholder}
        error={errors.email}
        autoComplete="email"
        inputMode="email"
        required
      />
      <Field
        id="company"
        label={t.company}
        placeholder={t.companyPlaceholder}
        autoComplete="organization"
      />

      <div>
        <label htmlFor="projectType" className="text-label text-black/40">
          {t.projectType}
        </label>
        <select
          id="projectType"
          name="projectType"
          required
          defaultValue="commercial"
          className={`${fieldClass} appearance-none`}
        >
          {types.map((item) => (
            <option key={item.value} value={item.value} className="bg-off-white text-black">
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="text-label text-black/40">
          {t.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder={t.messagePlaceholder}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${fieldClass} resize-none`}
        />
        {errors.message ? (
          <p id="message-error" className="text-label mt-2 text-black/50" role="alert">
            {errors.message}
          </p>
        ) : null}
      </div>

      {state === "error" || state === "config" ? (
        <div role="alert">
          <p className="text-label text-black">{t.errorTitle}</p>
          <p className="text-body mt-3 text-black/50">
            {state === "config" ? (
              t.configError
            ) : (
              <>
                {t.error}{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="underline decoration-black/20 underline-offset-4 hover:opacity-60"
                >
                  {CONTACT_EMAIL}
                </a>
              </>
            )}
          </p>
          {debugDetail ? (
            <p className="text-label mt-4 text-black/40">{debugDetail}</p>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={state === "loading"}
        className="text-label min-h-12 w-full border border-black px-12 py-4 text-black transition-colors hover:bg-black hover:text-off-white focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
      >
        {state === "loading" ? t.sending : t.send}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  error,
  autoComplete,
  inputMode,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-label text-black/40">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={fieldClass}
      />
      {error ? (
        <p id={`${id}-error`} className="text-label mt-2 text-black/50" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
