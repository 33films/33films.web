import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/server";
import SelectedWorkForm from "@/components/admin/SelectedWorkForm";

export default async function AdminNewWorkPage() {
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  const t = (await getDictionary()).portfolioAdmin;

  return (
    <div>
      <h1 className="text-headline text-off-white">{t.addWork}</h1>
      <div className="mt-12">
        <SelectedWorkForm />
      </div>
    </div>
  );
}
