import { notFound, redirect } from "next/navigation";
import StatusBadge from "@/components/platform/StatusBadge";
import FileRow from "@/components/platform/FileRow";
import { getAuthUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/server";
import {
  getProjectFiles,
  getProjectFolders,
  getProjectForUser,
} from "@/lib/platform/queries";
import { formatDate } from "@/lib/platform/format";
import { getLocale } from "@/lib/i18n/server";
import type { FolderSlug } from "@/lib/platform/types";

export default async function ClientProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getAuthUser();
  if (!profile) redirect("/login");
  const project = await getProjectForUser(id, profile.id, false);
  if (!project) notFound();

  const [folders, files, dictionary, locale] = await Promise.all([
    getProjectFolders(id),
    getProjectFiles(id),
    getDictionary(),
    getLocale(),
  ]);
  const t = dictionary.portal;

  return (
    <div>
      <p className="text-label text-gray">{project.client_name}</p>
      <h1 className="text-headline mt-3 text-off-white">{project.name}</h1>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <StatusBadge status={project.status} />
        <span className="text-label text-gray">
          {t.date} {formatDate(project.created_at, locale)}
        </span>
      </div>
      {project.description && (
        <div className="mt-8 max-w-2xl">
          <p className="text-label text-gray">{t.description}</p>
          <p className="text-body mt-3">{project.description}</p>
        </div>
      )}

      <div className="mt-16 space-y-14">
        {folders.map((folder) => {
          const folderFiles = files.filter((f) => f.folder_id === folder.id);
          const label =
            dictionary.portal.folders[folder.slug as FolderSlug] ?? folder.name;
          return (
            <section key={folder.id}>
              <h2 className="text-label text-off-white">{label}</h2>
              <div className="mt-4">
                {folderFiles.length === 0 ? (
                  <p className="text-body border-t border-off-white/10 py-4 text-gray">
                    {t.noFiles}
                  </p>
                ) : (
                  folderFiles.map((file) => <FileRow key={file.id} file={file} />)
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
