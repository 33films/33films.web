"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { signOutAction } from "@/app/actions/auth";

export default function ProfileAccessError() {
  const { dictionary } = useI18n();
  const t = dictionary.auth;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-5">
      <p className="text-label text-gray">{dictionary.portal.profile}</p>
      <h1 className="text-headline mt-4 text-off-white">{t.profileAccessTitle}</h1>
      <p className="text-body mt-6">{t.profileAccessBody}</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-label border border-off-white px-6 py-3 text-off-white"
          >
            {dictionary.nav.logout}
          </button>
        </form>
        <Link href="/login" className="text-label self-center text-gray">
          {t.backToLogin}
        </Link>
      </div>
    </div>
  );
}
