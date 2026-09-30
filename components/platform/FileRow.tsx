"use client";

import { useI18n } from "@/lib/i18n/LanguageProvider";
import { formatBytes, formatDate, fileExtension } from "@/lib/platform/format";
import {
  getDownloadUrl,
  deleteFileAction,
  markFileSeen,
  createReplaceUrl,
  confirmReplace,
} from "@/app/actions/platform";
import type { ProjectFile } from "@/lib/platform/types";
import { useState } from "react";

export default function FileRow({
  file,
  admin = false,
  compact = false,
}: {
  file: ProjectFile;
  admin?: boolean;
  compact?: boolean;
}) {
  const { locale, dictionary } = useI18n();
  const isNew = !file.seen_at;
  const [message, setMessage] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);

  const download = async () => {
    setMessage(null);
    const result = await getDownloadUrl(file.id);
    if (!result || "error" in result || !("url" in result) || !result.url) {
      setMessage(
        result && "error" in result && result.error === "forbidden"
          ? dictionary.auth.unauthorized
          : dictionary.portal.downloadFail
      );
      return;
    }
    await markFileSeen(file.id);
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const replace = async (list: FileList | null) => {
    const next = list?.[0];
    if (!next) return;
    setReplacing(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.set("file_id", file.id);
      form.set("file_name", next.name);
      form.set("mime_type", next.type || "application/octet-stream");
      form.set("size", String(next.size));
      const signed = await createReplaceUrl(form);
      if (!signed || "error" in signed) {
        setMessage(dictionary.admin.uploadFail);
        return;
      }
      const put = await fetch(signed.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": next.type || "application/octet-stream",
          "x-upsert": "true",
        },
        body: next,
      });
      if (!put.ok) {
        setMessage(dictionary.admin.uploadFail);
        return;
      }
      const confirmed = await confirmReplace(signed.meta);
      if (!confirmed || "error" in confirmed) {
        setMessage(dictionary.admin.uploadFail);
        return;
      }
      setMessage(dictionary.admin.complete);
    } catch {
      setMessage(dictionary.admin.uploadFail);
    } finally {
      setReplacing(false);
    }
  };

  const actions = (
      <div className={`flex flex-wrap gap-4 ${compact ? "" : "col-span-12 md:col-span-1 md:justify-end"}`}>
        <button type="button" onClick={download} className="text-label text-off-white">
          {dictionary.portal.download}
        </button>
        {admin && (
          <>
            <label className="text-label cursor-pointer text-gray">
              {replacing ? dictionary.admin.uploading : dictionary.admin.replace}
              <input
                type="file"
                className="hidden"
                onChange={(e) => replace(e.target.files)}
              />
            </label>
            <form action={deleteFileAction}>
              <input type="hidden" name="id" value={file.id} />
              <button type="submit" className="text-label text-gray">
                {dictionary.admin.delete}
              </button>
            </form>
          </>
        )}
      </div>
  );

  if (compact) {
    return (
      <div>
        {actions}
        {message && <p className="text-label mt-2 text-gray">{message}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 items-center gap-3 border-t border-off-white/10 py-4">
      <div className="col-span-12 md:col-span-5">
        <p className="text-label text-off-white">
          {file.original_name}
          {isNew && !admin && (
            <span className="ml-3 text-gray">{dictionary.portal.new}</span>
          )}
        </p>
        {message && <p className="text-label mt-2 text-gray">{message}</p>}
      </div>
      <p className="text-label col-span-4 text-gray md:col-span-2">
        {fileExtension(file.original_name)}
      </p>
      <p className="text-label col-span-4 text-gray md:col-span-2">
        {formatBytes(file.size)}
      </p>
      <p className="text-label col-span-4 text-gray md:col-span-2">
        {formatDate(file.created_at, locale)}
      </p>
      {actions}
    </div>
  );
}
