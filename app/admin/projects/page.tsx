import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";
import { getAllProjects } from "@/lib/platform/queries";
import { adminCreateProject } from "@/app/actions/platform";
import { getDictionary } from "@/lib/i18n/server";
import StatusBadge from "@/components/platform/StatusBadge";

export default async function AdminProjectsPage() {
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  const projects = await getAllProjects();
  const dictionary = await getDictionary();
  const t = dictionary.admin;

  return (
    <div>
      <h1 className="text-headline text-off-white">{t.projects}</h1>
      <form action={adminCreateProject} className="mt-10 grid gap-6 border border-off-white/10 p-6 md:grid-cols-3">
        <input name="name" placeholder="Project name" required className="border-b border-off-white/20 bg-transparent py-2 text-off-white outline-none" />
        <input name="client_name" placeholder="Client" className="border-b border-off-white/20 bg-transparent py-2 text-off-white outline-none" />
        <input name="description" placeholder="Description" className="border-b border-off-white/20 bg-transparent py-2 text-off-white outline-none" />
        <button className="text-label border border-off-white px-4 py-3 text-off-white md:col-span-3">
          {t.createProject} →
        </button>
      </form>
      <div className="mt-12">
        {projects.length === 0 && (
          <p className="text-body text-gray">{t.noProjects}</p>
        )}
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/admin/projects/${project.id}`}
            className="flex items-center justify-between border-t border-off-white/10 py-6"
          >
            <div>
              <h2 className="text-subhead text-off-white">{project.name}</h2>
              <p className="text-label mt-2 text-gray">
                {project.client_name} · {project.file_count ?? 0} {dictionary.portal.fileCount}
              </p>
            </div>
            <StatusBadge status={project.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
