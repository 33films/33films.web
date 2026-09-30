import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/server";
import { getAdminStats } from "@/lib/platform/queries";
import { formatBytes, formatDate } from "@/lib/platform/format";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminHome() {
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  const stats = await getAdminStats();
  const dictionary = await getDictionary();
  const locale = await getLocale();
  const t = dictionary.admin;
  const portfolio = dictionary.portfolioAdmin;

  const cards = [
    { label: t.totalUsers, value: String(stats.users) },
    { label: t.activeProjects, value: String(stats.projects) },
    { label: portfolio.nav, value: String(stats.selectedWorks) },
    { label: t.files, value: String(stats.files) },
    { label: t.storageUsed, value: formatBytes(stats.storage) },
  ];

  return (
    <div>
      <h1 className="text-headline text-off-white">{t.dashboard}</h1>
      <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="border-t border-off-white/20 pt-4">
            <p className="text-label text-gray">{card.label}</p>
            <p className="text-subhead mt-3 text-off-white">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-20 border-t border-off-white/10 pt-10">
        <h2 className="text-subhead text-off-white">{portfolio.sectionTitle}</h2>
        <p className="text-body mt-3 max-w-2xl text-gray">{portfolio.adminHint}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/admin/works/new"
            className="text-label border border-off-white px-6 py-3 text-off-white"
          >
            + {portfolio.addWork}
          </Link>
          <Link
            href="/admin/works"
            className="text-label border border-off-white/20 px-6 py-3 text-gray"
          >
            {portfolio.nav} →
          </Link>
          <Link
            href="/admin/about"
            className="text-label border border-off-white/20 px-6 py-3 text-gray"
          >
            {dictionary.aboutAdmin.nav} →
          </Link>
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-label text-gray">{t.recentActivity}</h2>
        <div className="mt-6">
          {stats.activity.length === 0 ? (
            <p className="text-body border-t border-off-white/10 py-4 text-gray">
              {t.noActivity}
            </p>
          ) : (
            stats.activity.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-t border-off-white/10 py-4"
            >
              <p className="text-label text-off-white">{item.action.replaceAll("_", " ")}</p>
              <p className="text-label text-gray">
                {formatDate(item.created_at, locale)}
              </p>
            </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
