import { redirect } from "next/navigation";
import { getAuthUser, isAdminRole } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/server";
import { getHeroAdminState } from "@/lib/home/queries";
import HomeHeroAdminPanel from "@/components/admin/HomeHeroAdminPanel";

export default async function AdminHomePage() {
  const { profile } = await getAuthUser();
  if (!profile || !isAdminRole(profile.role)) redirect("/dashboard");

  const state = await getHeroAdminState();
  const t = (await getDictionary()).homeAdmin;

  return (
    <div>
      <h1 className="text-headline text-off-white">{t.sectionTitle}</h1>
      <p className="text-body mt-4 max-w-2xl text-gray">{t.hint}</p>
      <HomeHeroAdminPanel state={state} />
    </div>
  );
}
