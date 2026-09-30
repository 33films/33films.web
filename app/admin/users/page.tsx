import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/server";
import { getAllUsers } from "@/lib/platform/queries";
import { formatDate } from "@/lib/platform/format";
import { getLocale } from "@/lib/i18n/server";
import { adminCreateUser } from "@/app/actions/platform";

export default async function AdminUsersPage() {
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  const users = await getAllUsers();
  const dictionary = await getDictionary();
  const locale = await getLocale();
  const t = dictionary.admin;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h1 className="text-headline text-off-white">{t.users}</h1>
      </div>

      <form action={adminCreateUser} className="mt-10 grid gap-6 border border-off-white/10 p-6 md:grid-cols-3">
        <input name="full_name" placeholder={t.name} className="border-b border-off-white/20 bg-transparent py-2 text-off-white outline-none" required />
        <input name="email" type="email" placeholder={t.email} className="border-b border-off-white/20 bg-transparent py-2 text-off-white outline-none" required />
        <input name="password" type="password" placeholder={t.password} className="border-b border-off-white/20 bg-transparent py-2 text-off-white outline-none" required />
        <button className="text-label border border-off-white px-4 py-3 text-off-white md:col-span-3">
          {t.createUser} →
        </button>
      </form>

      <div className="mt-12 hidden grid-cols-12 gap-3 text-gray md:grid">
        <p className="text-label col-span-3">{t.name}</p>
        <p className="text-label col-span-3">{t.email}</p>
        <p className="text-label col-span-2">{t.role}</p>
        <p className="text-label col-span-2">{t.status}</p>
        <p className="text-label col-span-2">{t.lastActivity}</p>
      </div>
      {users.length === 0 && (
        <p className="text-body mt-10 text-gray">{t.noUsers}</p>
      )}
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/admin/users/${user.id}`}
          className="grid grid-cols-1 gap-2 border-t border-off-white/10 py-5 md:grid-cols-12 md:items-center md:gap-3"
        >
          <p className="text-label col-span-3 text-off-white">{user.full_name || "—"}</p>
          <p className="text-label col-span-3 text-gray">{user.email}</p>
          <p className="text-label col-span-2 text-gray">{user.role}</p>
          <p className="text-label col-span-2 text-gray">{user.status}</p>
          <p className="text-label col-span-2 text-gray">
            {user.last_activity_at ? formatDate(user.last_activity_at, locale) : "—"}
          </p>
        </Link>
      ))}
    </div>
  );
}
