import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth/session";
import { getAllFiles } from "@/lib/platform/queries";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { formatBytes, formatDate, fileExtension } from "@/lib/platform/format";
import FileRow from "@/components/platform/FileRow";

export default async function AdminFilesPage() {
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") redirect("/dashboard");
  const files = await getAllFiles();
  const dictionary = await getDictionary();
  const locale = await getLocale();
  const t = dictionary.admin;

  return (
    <div>
      <h1 className="text-headline text-off-white">{t.files}</h1>
      {files.length === 0 ? (
        <p className="text-body mt-10 text-gray">{t.noFiles}</p>
      ) : (
        <>
          <div className="mt-10 hidden grid-cols-12 gap-3 text-gray lg:grid">
            <p className="text-label col-span-3">{t.files}</p>
            <p className="text-label col-span-2">{t.project}</p>
            <p className="text-label col-span-2">{t.user}</p>
            <p className="text-label col-span-1">{dictionary.portal.size}</p>
            <p className="text-label col-span-1">{dictionary.portal.type}</p>
            <p className="text-label col-span-1">{dictionary.portal.date}</p>
            <p className="text-label col-span-2">{t.uploadedBy}</p>
          </div>
          {files.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-1 gap-3 border-t border-off-white/10 py-5 lg:grid-cols-12 lg:items-start"
            >
              <div className="lg:col-span-3">
                <p className="text-label text-off-white">{file.original_name}</p>
                <div className="mt-3">
                  <FileRow file={file} admin compact />
                </div>
              </div>
              <p className="text-label text-gray lg:col-span-2">
                {file.project_name ? (
                  <Link href={`/admin/projects/${file.project_id}`} className="text-off-white">
                    {file.project_name}
                  </Link>
                ) : (
                  "—"
                )}
              </p>
              <p className="text-label text-gray lg:col-span-2">
                {file.user_name || file.user_email || "—"}
              </p>
              <p className="text-label text-gray lg:col-span-1">{formatBytes(file.size)}</p>
              <p className="text-label text-gray lg:col-span-1">
                {fileExtension(file.original_name)}
              </p>
              <p className="text-label text-gray lg:col-span-1">
                {formatDate(file.created_at, locale)}
              </p>
              <p className="text-label text-gray lg:col-span-2">
                {file.uploaded_by_name || file.uploaded_by_email || "—"}
              </p>
            </div>
          ))}
        </>
      )}
      <Link href="/admin/projects" className="text-label mt-10 inline-block text-gray">
        {t.projects} →
      </Link>
    </div>
  );
}
