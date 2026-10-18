import type { Metadata } from "next";
import ResetPasswordForm from "@/components/platform/ResetPasswordForm";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return {
    title: `${dictionary.auth.reset} — 33FILMS`,
    robots: { index: false, follow: false },
  };
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
