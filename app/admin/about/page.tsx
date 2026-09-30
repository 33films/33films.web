import { redirect } from "next/navigation";
import { getAuthUser, isAdminRole } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/server";
import { getAboutAdminState } from "@/lib/about/queries";
import AboutAdminPanel from "@/components/admin/AboutAdminPanel";

export default async function AdminAboutPage() {
  const { profile } = await getAuthUser();
  if (!profile || !isAdminRole(profile.role)) redirect("/dashboard");

  const state = await getAboutAdminState();
  const t = (await getDictionary()).aboutAdmin;

  return (
    <div>
      <h1 className="text-headline text-off-white">{t.sectionTitle}</h1>
      <p className="text-body mt-4 max-w-2xl text-gray">{t.hint}</p>
      <AboutAdminPanel
        enabled={state.enabled}
        members={state.members}
        schemaMissing={state.schemaMissing}
      />
    </div>
  );
}
