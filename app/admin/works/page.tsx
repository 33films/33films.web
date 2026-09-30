import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser, isAdminRole } from "@/lib/auth/session";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { getAllSelectedWorksAdmin } from "@/lib/portfolio/queries";
import AdminWorksTable from "@/components/admin/AdminWorksTable";

export default async function AdminWorksPage() {
  const { profile } = await getAuthUser();
  if (!profile || !isAdminRole(profile.role)) redirect("/dashboard");

  const works = await getAllSelectedWorksAdmin();
  const dictionary = await getDictionary();
  const locale = await getLocale();
  const t = dictionary.portfolioAdmin;

  return (
    <div>
      <h1 className="text-headline text-off-white">{t.sectionTitle}</h1>
      <p className="text-body mt-4 max-w-2xl text-gray">{t.adminHint}</p>
      <Link
        href="/admin/works/new"
        className="text-label mt-8 inline-block border border-off-white px-6 py-3 text-off-white"
      >
        + {t.addWork}
      </Link>

      {works.length === 0 ? (
        <p className="text-body mt-10 text-gray">{t.empty}</p>
      ) : (
        <AdminWorksTable works={works} locale={locale} />
      )}
    </div>
  );
}
