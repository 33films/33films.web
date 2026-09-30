"use client";

import { useState } from "react";
import { updateProfileAction } from "@/app/actions/platform";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function ProfileForm({
  fullName,
  email,
  company,
  avatarUrl,
}: {
  fullName: string;
  email: string;
  company: string;
  avatarUrl: string;
}) {
  const { dictionary } = useI18n();
  const t = dictionary.portal;
  const a = dictionary.auth;
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-12 space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setMessage(null);
        const result = await updateProfileAction(new FormData(e.currentTarget));
        setPending(false);
        if (result && "ok" in result) {
          setMessage(t.saved);
          return;
        }
        setMessage(a.error);
      }}
    >
      <Field name="full_name" label={a.fullName} defaultValue={fullName} />
      <div>
        <p className="text-label text-gray">{a.email}</p>
        <p className="mt-2 border-b border-off-white/10 py-3 text-off-white/70">
          {email}
        </p>
      </div>
      <Field name="company" label={t.company} defaultValue={company} />
      <Field name="avatar_url" label={t.avatar} defaultValue={avatarUrl} />
      {message && <p className="text-body text-off-white/70">{message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="text-label border border-off-white px-8 py-4 text-off-white hover:bg-off-white hover:text-black disabled:opacity-50"
      >
        {t.save}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="text-label text-gray" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none"
      />
    </div>
  );
}
