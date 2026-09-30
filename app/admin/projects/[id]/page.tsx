import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";
import {
  getAllUsers,
  getProjectFiles,
  ensureDefaultProjectFolders,
  getProjectForUser,
  getProjectMembers,
} from "@/lib/platform/queries";
import Link from "next/link";
import { adminAssignUsers, adminUpdateProject } from "@/app/actions/platform";
import FileUploader from "@/components/platform/FileUploader";
import FileRow from "@/components/platform/FileRow";
import { getDictionary } from "@/lib/i18n/server";
import type { FolderSlug, ProjectStatus } from "@/lib/platform/types";

const statuses: ProjectStatus[] = [
  "brief",
  "pre_production",
  "production",
  "post_production",
  "review",
  "approved",
  "delivered",
  "archived",
];

export default async function AdminProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  const project = await getProjectForUser(id, profile.id, true);
  if (!project) notFound();

  const [folders, files, users, members, dictionary] = await Promise.all([
    ensureDefaultProjectFolders(id),
    getProjectFiles(id),
    getAllUsers(),
    getProjectMembers(id),
    getDictionary(),
  ]);

  return (
    <div>
      <p className="text-label text-gray">{project.client_name}</p>
      <h1 className="text-headline mt-2 text-off-white">{project.name}</h1>

      <form action={adminUpdateProject} className="mt-10 max-w-xl space-y-6">
        <input type="hidden" name="id" value={project.id} />
        <input name="name" defaultValue={project.name} className="w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none" />
        <input name="client_name" defaultValue={project.client_name ?? ""} className="w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none" />
        <textarea name="description" defaultValue={project.description ?? ""} className="w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none" />
        <select name="status" defaultValue={project.status} className="w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none">
          {statuses.map((status) => (
            <option key={status} value={status} className="bg-black">
              {dictionary.status[status]}
            </option>
          ))}
        </select>
        <button className="text-label border border-off-white px-6 py-3 text-off-white">
          {dictionary.admin.edit} →
        </button>
      </form>

      <form action={adminAssignUsers} className="mt-16">
        <input type="hidden" name="project_id" value={project.id} />
        <h2 className="text-label text-gray">{dictionary.admin.assign}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {users
            .filter((u) => u.role === "user")
            .map((user) => (
              <label key={user.id} className="flex items-center gap-3 border-t border-off-white/10 py-3">
                <input
                  type="checkbox"
                  name="user_ids"
                  value={user.id}
                  defaultChecked={members.includes(user.id)}
                />
                <span className="text-label text-off-white">
                  {user.full_name || user.email}
                </span>
              </label>
            ))}
        </div>
        <button className="text-label mt-6 border border-off-white/20 px-6 py-3 text-off-white">
          {dictionary.admin.assign} →
        </button>
      </form>

      <FileUploader
        projectId={project.id}
        folders={folders.filter((folder) => folder.slug !== "brief")}
      />

      <div className="mt-16 space-y-12">
        {folders.map((folder) => {
          const folderFiles = files.filter((f) => f.folder_id === folder.id);
          const isBrief = folder.slug === "brief";
          return (
            <section key={folder.id}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-label text-off-white">
                  {dictionary.portal.folders[folder.slug as FolderSlug] ?? folder.name}
                </h2>
                {isBrief || folder.slug === "storyboard" ? (
                  <Link
                    href={`/admin/projects/${project.id}/${folder.slug}`}
                    className="text-label border border-off-white px-5 py-3 text-off-white transition-colors hover:bg-off-white hover:text-black"
                  >
                    {isBrief
                      ? dictionary.portal.openBrief
                      : dictionary.portal.openStoryboard}
                  </Link>
                ) : null}
              </div>
              {isBrief ? (
                <p className="text-body border-t border-off-white/10 py-4 text-gray">
                  {dictionary.portal.briefHint}
                </p>
              ) : folderFiles.length === 0 ? (
                <p className="text-body border-t border-off-white/10 py-4 text-gray">
                  {dictionary.portal.noFiles}
                </p>
              ) : (
                folderFiles.map((file) => (
                  <FileRow key={file.id} file={file} admin />
                ))
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
