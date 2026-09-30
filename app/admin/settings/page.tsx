import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/server";

export default async function AdminSettingsPage() {
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  const t = (await getDictionary()).admin;

  return (
    <div className="max-w-2xl">
      <h1 className="text-headline text-off-white">{t.settings}</h1>
      <p className="text-body mt-8">{t.settingsBody}</p>
      <div className="mt-12 space-y-4 border-t border-off-white/10 pt-8">
        <p className="text-label text-gray">STORAGE PROVIDER</p>
        <p className="text-label text-off-white">Supabase Storage — private bucket `client-files`</p>
        <p className="text-label mt-8 text-gray">ADAPTER</p>
        <p className="text-label text-off-white">lib/storage — ready for R2 / S3 / B2</p>
      </div>
    </div>
  );
}
