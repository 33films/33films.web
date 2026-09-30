import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth/session";
import { getUserDetail } from "@/lib/platform/queries";
import { adminDeleteUser, adminUpdateUser } from "@/app/actions/platform";
import { getDictionary } from "@/lib/i18n/server";
import StatusBadge from "@/components/platform/StatusBadge";

export default async function AdminUserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  const detail = await getUserDetail(id);
  if (!detail) notFound();
  const t = (await getDictionary()).admin;

  return (
    <div>
      <h1 className="text-headline text-off-white">
        {detail.user.full_name || detail.user.email}
      </h1>
      <p className="text-label mt-3 text-gray">{detail.user.email}</p>

      <form action={adminUpdateUser} className="mt-12 max-w-xl space-y-6">
        <input type="hidden" name="id" value={detail.user.id} />
        <input
          name="full_name"
          defaultValue={detail.user.full_name ?? ""}
          className="w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none"
        />
        <input
          name="company"
          defaultValue={detail.user.company ?? ""}
          className="w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none"
        />
        <select
          name="role"
          defaultValue={detail.user.role}
          className="w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none"
        >
          <option value="user" className="bg-black">USER</option>
          <option value="admin" className="bg-black">ADMIN</option>
        </select>
        <select
          name="status"
          defaultValue={detail.user.status}
          className="w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none"
        >
          <option value="active" className="bg-black">ACTIVE</option>
          <option value="inactive" className="bg-black">INACTIVE</option>
        </select>
        <button className="text-label border border-off-white px-6 py-3 text-off-white">
          {t.edit} →
        </button>
      </form>

      <section className="mt-16">
        <h2 className="text-label text-gray">PROJECTS</h2>
        {detail.projects.map((project) => (
          <Link
            key={project.id}
            href={`/admin/projects/${project.id}`}
            className="flex items-center justify-between border-t border-off-white/10 py-5"
          >
            <span className="text-subhead text-off-white">{project.name}</span>
            <StatusBadge status={project.status} />
          </Link>
        ))}
      </section>

      <form action={adminDeleteUser} className="mt-16">
        <input type="hidden" name="id" value={detail.user.id} />
        <button className="text-label text-gray">{t.delete} →</button>
      </form>
    </div>
  );
}
