"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import {
  createAboutPhotoUploadUrl,
  deleteAboutMemberAction,
  saveAboutMemberAction,
  setAboutEnabledAction,
} from "@/app/actions/about";
import type { AboutMemberPublic } from "@/lib/about/types";

type UploadState = {
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
  name?: string;
};

const emptyForm = {
  id: "",
  name: "",
  role: "",
  photoPath: "",
  photoPreview: "",
};

export default function AboutAdminPanel({
  enabled,
  members,
  schemaMissing,
}: {
  enabled: boolean;
  members: AboutMemberPublic[];
  schemaMissing: boolean;
}) {
  const { dictionary } = useI18n();
  const t = dictionary.aboutAdmin;
  const router = useRouter();
  const [visible, setVisible] = useState(enabled);
  const [form, setForm] = useState(emptyForm);
  const [upload, setUpload] = useState<UploadState>({ progress: 0, status: "idle" });
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const isEdit = Boolean(form.id);

  const uploadFile = useCallback(
    async (file: File) => {
      setUpload({ progress: 0, status: "uploading", name: file.name });
      setMessage(null);

      try {
        const payload = new FormData();
        payload.set("file_name", file.name);
        payload.set("mime_type", file.type || "application/octet-stream");

        const signed = await createAboutPhotoUploadUrl(payload);
        if (!signed || "error" in signed) {
          setUpload({ progress: 0, status: "error", name: file.name });
          setMessage(t.uploadFail);
          return;
        }

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", signed.signedUrl);
          xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
          xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable) return;
            setUpload({
              progress: Math.round((e.loaded / e.total) * 100),
              status: "uploading",
              name: file.name,
            });
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300 ? resolve() : reject();
          xhr.onerror = () => reject();
          xhr.send(file);
        });

        setForm((current) => ({
          ...current,
          photoPath: signed.path,
          photoPreview: URL.createObjectURL(file),
        }));
        setUpload({ progress: 100, status: "done", name: file.name });
      } catch {
        setUpload({ progress: 0, status: "error", name: file.name });
        setMessage(t.uploadFail);
      }
    },
    [t.uploadFail]
  );

  const toggleEnabled = async (next: boolean) => {
    setVisible(next);
    const payload = new FormData();
    payload.set("enabled", String(next));
    const result = await setAboutEnabledAction(payload);
    if (result && "error" in result) {
      setVisible(!next);
      setMessage(result.error === "schema" ? t.schemaMissing : t.saveFail);
      return;
    }
    router.refresh();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.photoPath) {
      setMessage(t.photoRequired);
      return;
    }
    setPending(true);
    setMessage(null);
    const payload = new FormData();
    payload.set("id", form.id);
    payload.set("name", form.name);
    payload.set("role", form.role);
    payload.set("photo_path", form.photoPath);
    const result = await saveAboutMemberAction(payload);
    setPending(false);
    if (result && "error" in result) {
      setMessage(
        result.error === "schema"
          ? t.schemaMissing
          : result.error === "validation"
            ? t.photoRequired
            : t.saveFail
      );
      return;
    }
    setForm(emptyForm);
    setUpload({ progress: 0, status: "idle" });
    setMessage(t.saved);
    router.refresh();
  };

  const removeMember = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    setPendingId(id);
    const payload = new FormData();
    payload.set("id", id);
    const result = await deleteAboutMemberAction(payload);
    setPendingId(null);
    if (result && "error" in result) {
      setMessage(result.error === "schema" ? t.schemaMissing : t.saveFail);
      return;
    }
    if (form.id === id) setForm(emptyForm);
    router.refresh();
  };

  if (schemaMissing) {
    return <p className="text-body mt-8 max-w-2xl text-gray">{t.schemaMissing}</p>;
  }

  return (
    <div className="mt-12">
      <section className="border-t border-off-white/10 pt-8">
        <p className="text-label text-gray">{t.visibility}</p>
        <div className="mt-4 grid max-w-md grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => void toggleEnabled(true)}
            aria-pressed={visible}
            className={`text-label border px-4 py-4 ${
              visible
                ? "border-off-white bg-off-white text-black"
                : "border-off-white/20 text-off-white"
            }`}
          >
            {t.enabled}
          </button>
          <button
            type="button"
            onClick={() => void toggleEnabled(false)}
            aria-pressed={!visible}
            className={`text-label border px-4 py-4 ${
              !visible
                ? "border-off-white bg-off-white text-black"
                : "border-off-white/20 text-off-white"
            }`}
          >
            {t.disabled}
          </button>
        </div>
        <p className="text-body mt-4 max-w-2xl text-gray">{t.enabledHint}</p>
      </section>

      <section className="mt-16">
        <h2 className="text-subhead text-off-white">{t.members}</h2>
        {members.length === 0 ? (
          <p className="text-body mt-6 text-gray">{t.empty}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <article
                key={member.id}
                className="border-t border-off-white/10 pt-6"
              >
                <div className="relative aspect-square w-28 overflow-hidden rounded-full bg-dark">
                  {member.photo_url ? (
                    <Image
                      src={member.photo_url}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : null}
                </div>
                <p className="text-label mt-4 text-off-white">{member.name}</p>
                <p className="text-label mt-1 text-gray">{member.role}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  <button
                    type="button"
                    className="text-label text-off-white"
                    onClick={() => {
                      setForm({
                        id: member.id,
                        name: member.name,
                        role: member.role,
                        photoPath: member.photo_path,
                        photoPreview: member.photo_url,
                      });
                      setUpload({ progress: 0, status: "idle" });
                      setMessage(null);
                    }}
                  >
                    {t.edit}
                  </button>
                  <button
                    type="button"
                    className="text-label text-gray"
                    disabled={pendingId === member.id}
                    onClick={() => void removeMember(member.id)}
                  >
                    {t.delete}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <form onSubmit={onSubmit} className="mt-16 max-w-xl space-y-8 border-t border-off-white/10 pt-10">
        <h2 className="text-subhead text-off-white">
          {isEdit ? t.editMember : t.addMember}
        </h2>

        <div>
          <label className="text-label text-gray" htmlFor="about-name">
            {t.name}
          </label>
          <input
            id="about-name"
            value={form.name}
            onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
            required
            placeholder={t.namePlaceholder}
            className="text-label mt-2 w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none"
          />
        </div>

        <div>
          <label className="text-label text-gray" htmlFor="about-role">
            {t.role}
          </label>
          <input
            id="about-role"
            value={form.role}
            onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}
            placeholder={t.rolePlaceholder}
            className="text-label mt-2 w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none"
          />
        </div>

        <div>
          <p className="text-label text-gray">{t.photo}</p>
          <label className="text-label mt-3 block cursor-pointer border border-dashed border-off-white/20 px-4 py-8 text-center text-off-white">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file);
                e.target.value = "";
              }}
            />
            {form.photoPath ? t.replaceFile : t.selectFile}
          </label>
          {upload.status !== "idle" && (
            <p className="text-label mt-3 text-gray">
              {upload.name}{" "}
              {upload.status === "done"
                ? t.uploadDone
                : upload.status === "error"
                  ? t.uploadFail
                  : `${upload.progress}%`}
            </p>
          )}
          {form.photoPreview ? (
            <div className="relative mt-4 aspect-square w-28 overflow-hidden rounded-full bg-dark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.photoPreview}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
        </div>

        {message ? <p className="text-body text-gray">{message}</p> : null}

        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={pending || !form.photoPath}
            className="text-label border border-off-white px-8 py-4 text-off-white hover:bg-off-white hover:text-black disabled:opacity-50"
          >
            {pending ? t.saving : t.save}
          </button>
          {isEdit ? (
            <button
              type="button"
              className="text-label border border-off-white/20 px-8 py-4 text-gray"
              onClick={() => {
                setForm(emptyForm);
                setUpload({ progress: 0, status: "idle" });
                setMessage(null);
              }}
            >
              {t.cancel}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
