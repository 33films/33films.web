"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { confirmUpload, createUploadUrl } from "@/app/actions/platform";
import { formatBytes } from "@/lib/platform/format";
import { isAllowedFile } from "@/lib/platform/format";
import type { ProjectFolder } from "@/lib/platform/types";

type Item = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done" | "error";
};

export default function FileUploader({
  projectId,
  folders,
}: {
  projectId: string;
  folders: ProjectFolder[];
}) {
  const { dictionary } = useI18n();
  const [folderId, setFolderId] = useState(folders[0]?.id ?? "");
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);

  const setItem = (id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const uploadFile = useCallback(
    async (file: File) => {
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      if (!isAllowedFile(file.name, file.type)) {
        setItems((prev) => [
          ...prev,
          { id, name: file.name, size: file.size, progress: 0, status: "error" },
        ]);
        return;
      }
      setItems((prev) => [
        ...prev,
        { id, name: file.name, size: file.size, progress: 0, status: "uploading" },
      ]);

      try {
        const form = new FormData();
        form.set("project_id", projectId);
        form.set("folder_id", folderId);
        form.set("file_name", file.name);
        form.set("mime_type", file.type || "application/octet-stream");
        form.set("size", String(file.size));

        const signed = await createUploadUrl(form);
        if (!signed || "error" in signed) {
          setItem(id, { status: "error" });
          return;
        }

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signed.signedUrl);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.setRequestHeader("x-upsert", "true");
          xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable) return;
            const progress = Math.round((e.loaded / e.total) * 100);
            setItem(id, { progress });
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300 ? resolve() : reject();
          xhr.onerror = () => reject();
          xhr.send(file);
        });

        const confirmed = await confirmUpload({
          ...signed.meta,
          path: signed.path,
        });
        if (!confirmed || "error" in confirmed) {
          setItem(id, { status: "error" });
          return;
        }
        setItem(id, { progress: 100, status: "done" });
      } catch {
        setItem(id, { status: "error" });
      }
    },
    [folderId, projectId]
  );

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    Array.from(list).forEach((file) => uploadFile(file));
  };

  return (
    <div className="mt-10">
      <div className="mb-4 flex flex-wrap items-end gap-6">
        <label className="block">
          <span className="text-label text-gray">{dictionary.admin.folder}</span>
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="text-label mt-2 block w-56 border-b border-off-white/20 bg-transparent py-2 text-off-white outline-none"
          >
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id} className="bg-black">
                {dictionary.portal.folders[
                  folder.slug as keyof typeof dictionary.portal.folders
                ] ?? folder.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`block cursor-pointer border border-dashed px-6 py-16 text-center ${
          drag ? "border-off-white" : "border-off-white/20"
        }`}
      >
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <p className="text-label text-off-white">{dictionary.admin.drop}</p>
        <p className="text-label mt-3 text-gray">
          MP4 MOV AVI MKV WEBM JPG PNG WEBP PDF ZIP RAR DOCX XLSX
        </p>
      </label>

      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-label text-off-white">{item.name}</p>
                <p className="text-label mt-1 text-gray">{formatBytes(item.size)}</p>
              </div>
              <p className="text-label text-gray">
                {item.status === "done"
                  ? dictionary.admin.complete
                  : item.status === "error"
                    ? dictionary.admin.uploadFail
                    : `${dictionary.admin.uploading} ${item.progress}%`}
              </p>
            </div>
            <div className="mt-2 h-px w-full bg-off-white/10">
              <div
                className={`h-px ${item.status === "error" ? "bg-off-white/40" : "bg-off-white"}`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
