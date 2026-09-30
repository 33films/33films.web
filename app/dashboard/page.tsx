import Link from "next/link";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/platform/StatusBadge";
import FileRow from "@/components/platform/FileRow";
import { getAuthUser, isAdminRole } from "@/lib/auth/session";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { getRecentFiles, getUserProjects } from "@/lib/platform/queries";
import { formatDate } from "@/lib/platform/format";

export default async function DashboardPage() {
  const { profile } = await getAuthUser();
  if (!profile) redirect("/login");
  const dictionary = await getDictionary();
  const locale = await getLocale();
  const t = dictionary.portal;
  const portfolio = dictionary.portfolioAdmin;
  const isAdmin = isAdminRole(profile.role);
  const projects = await getUserProjects(profile.id);
  const files = await getRecentFiles(profile.id);

  return (
    <div>
      <p className="text-label text-gray">{t.welcome}</p>
      <h1 className="text-headline mt-3 text-off-white">
        {profile.full_name || profile.email}
      </h1>

      {isAdmin && (
        <section className="mt-12 border border-off-white/10 p-6">
          <p className="text-label text-gray">{dictionary.nav.admin}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href="/admin/works"
              className="text-label border border-off-white px-6 py-3 text-off-white"
            >
              {portfolio.nav} →
            </Link>
            <Link
              href="/admin/works/new"
              className="text-label border border-off-white/20 px-6 py-3 text-gray"
            >
              + {portfolio.addWork}
            </Link>
          </div>
        </section>
      )}

      <section className="mt-16">
        <h2 className="text-label text-gray">{t.myProjects}</h2>
        <div className="mt-6">
          {projects.length === 0 && (
            <p className="text-body text-gray">{t.noProjects}</p>
          )}
          {projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group flex items-start justify-between border-t border-off-white/10 py-6"
            >
              <div>
                <p className="text-label text-gray">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="text-subhead mt-2 text-off-white group-hover:opacity-70">
                  {project.name}
                </h3>
                <p className="text-label mt-2 text-gray">
                  {dictionary.status[project.status]} · {t.updated}{" "}
                  {formatDate(project.updated_at, locale)} · {project.file_count ?? 0}{" "}
                  {t.fileCount}
                </p>
              </div>
              <StatusBadge status={project.status} />
            </Link>
          ))}
          {projects.length > 0 && (
            <div className="border-t border-off-white/10" />
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-label text-gray">{t.myFiles}</h2>
        <div className="mt-4">
          {files.length === 0 ? (
            <p className="text-body border-t border-off-white/10 py-4 text-gray">
              {t.noFilesYet}
            </p>
          ) : (
            files.map((file) => <FileRow key={file.id} file={file} />)
          )}
        </div>
      </section>
    </div>
  );
}
