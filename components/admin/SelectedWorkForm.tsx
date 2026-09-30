"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import {
  createPortfolioUploadUrl,
  probeVimeoEmbedAction,
  saveSelectedWorkAction,
  updateSelectedWorkAction,
  deleteSelectedWorkAction,
} from "@/app/actions/selected-work";
import {
  SELECTED_WORK_CATEGORIES,
  resolveVideoSource,
  type SelectedWorkPublic,
  type SelectedWorkVideoSource,
} from "@/lib/portfolio/types";
import { extractVimeoId, vimeoPreviewSrc, type VimeoProbeResult } from "@/lib/portfolio/vimeo";

type UploadState = {
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
  name?: string;
};

export default function SelectedWorkForm({ work }: { work?: SelectedWorkPublic }) {
  const { dictionary } = useI18n();
  const t = dictionary.portfolioAdmin;
  const isEdit = Boolean(work);

  const [title, setTitle] = useState(work?.title ?? "");
  const [category, setCategory] = useState(work?.category ?? "commercial");
  const [workDate, setWorkDate] = useState(work?.work_date?.slice(0, 10) ?? "");
  const [published, setPublished] = useState(work?.published ?? false);
  const [thumbnailPath, setThumbnailPath] = useState(work?.thumbnail_path ?? "");
  const [videoPath, setVideoPath] = useState(work?.video_path ?? "");
  const [videoSource, setVideoSource] = useState<SelectedWorkVideoSource>(
    resolveVideoSource(work)
  );
  const [vimeoUrl, setVimeoUrl] = useState(
    work?.vimeo_id ? `https://vimeo.com/${work.vimeo_id}` : ""
  );
  const [thumbnailPreview, setThumbnailPreview] = useState(work?.thumbnail_url ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [thumbUpload, setThumbUpload] = useState<UploadState>({ progress: 0, status: "idle" });
  const [videoUpload, setVideoUpload] = useState<UploadState>({ progress: 0, status: "idle" });
  const [vimeoProbe, setVimeoProbe] = useState<VimeoProbeResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  const uploadFile = useCallback(
    async (file: File, kind: "thumbnail" | "video") => {
      const setUpload = kind === "thumbnail" ? setThumbUpload : setVideoUpload;
      const setPath = kind === "thumbnail" ? setThumbnailPath : setVideoPath;

      setUpload({ progress: 0, status: "uploading", name: file.name });
      setMessage(null);

      try {
        const form = new FormData();
        form.set("kind", kind);
        form.set("file_name", file.name);
        form.set("mime_type", file.type || "application/octet-stream");

        const signed = await createPortfolioUploadUrl(form);
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

        setPath(signed.path);
        if (kind === "thumbnail") {
          setThumbnailPreview(URL.createObjectURL(file));
        }
        setUpload({ progress: 100, status: "done", name: file.name });
      } catch {
        setUpload({ progress: 0, status: "error", name: file.name });
        setMessage(t.uploadFail);
      }
    },
    [t.uploadFail]
  );

  const parsedVimeoId = extractVimeoId(vimeoUrl);
  const vimeoVerified =
    vimeoProbe?.ok === true && vimeoProbe.id === parsedVimeoId;
  const vimeoBlocked = vimeoProbe?.ok === false && vimeoProbe.reason === "blocked";
  const hasPlayback =
    videoSource === "VIMEO"
      ? Boolean(parsedVimeoId) && !vimeoBlocked
      : Boolean(videoPath);

  const verifyVimeo = async () => {
    setVerifying(true);
    setMessage(null);
    const form = new FormData();
    form.set("vimeo_url", vimeoUrl);
    const result = await probeVimeoEmbedAction(form);
    setVimeoProbe(result);
    if (!result.ok) {
      setMessage(
        result.reason === "blocked"
          ? t.vimeoBlocked
          : result.reason === "invalid"
            ? t.vimeoInvalid
            : t.vimeoNetwork
      );
    }
    setVerifying(false);
  };
  const localFileName =
    videoUpload.name || (videoPath ? videoPath.split("/").pop() : "");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setPending(true);
    setMessage(null);

    if (videoSource === "VIMEO") {
      if (!parsedVimeoId) {
        setMessage(t.vimeoInvalid);
        setPending(false);
        return;
      }
      const formProbe = new FormData();
      formProbe.set("vimeo_url", vimeoUrl);
      const probe = await probeVimeoEmbedAction(formProbe);
      setVimeoProbe(probe);
      if (!probe.ok && probe.reason !== "network") {
        setMessage(
          probe.reason === "blocked"
            ? t.vimeoBlocked
            : t.vimeoInvalid
        );
        setPending(false);
        return;
      }
    } else if (!videoPath) {
      setMessage(t.videoRequired);
      setPending(false);
      return;
    }

    const form = new FormData(formEl);
    form.set("title", title);
    form.set("category", category);
    form.set("work_date", workDate);
    if (published) form.set("published", "on");
    form.set("thumbnail_path", thumbnailPath);
    form.set("video_source", videoSource);
    form.set("video_path", videoPath);
    form.set("vimeo_url", videoSource === "VIMEO" ? vimeoUrl : "");
    if (work) {
      form.set("id", work.id);
      form.set("slug", work.slug);
    }

    const result = isEdit
      ? await updateSelectedWorkAction(form)
      : await saveSelectedWorkAction(form);

    if (result && "error" in result) {
      setMessage(
        result.error === "vimeo"
          ? t.vimeoInvalid
          : result.error === "vimeo_embed"
            ? t.vimeoBlocked
          : result.error === "schema"
            ? t.schemaMissing
            : result.error === "validation"
              ? t.saveFail
              : t.saveFail
      );
      setPending(false);
      return;
    }
    if (isEdit) {
      setMessage(t.saved);
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-10">
      <div>
        <label className="text-label text-gray" htmlFor="title">
          {t.title}
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-2 w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none"
        />
      </div>

      <UploadField
        label={t.thumbnail}
        accept="image/jpeg,image/png,image/webp"
        upload={thumbUpload}
        onFile={(f) => uploadFile(f, "thumbnail")}
        hint="JPG PNG WEBP"
        currentName={thumbnailPath ? thumbnailPath.split("/").pop() : undefined}
        replaceLabel={t.replaceFile}
      />

      {thumbnailPreview && (
        <div className="relative aspect-video w-full max-w-md overflow-hidden bg-dark">
          <Image
            src={thumbnailPreview}
            alt=""
            fill
            className="object-cover grayscale"
            sizes="400px"
          />
        </div>
      )}

      <div>
        <UploadField
          label={t.previewVideo}
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.webm,.mkv"
          upload={videoUpload}
          onFile={(f) => uploadFile(f, "video")}
          hint={
            videoSource === "VIMEO"
              ? `MP4 MOV WEBM MKV · ${t.previewOptional}`
              : `MP4 MOV WEBM MKV · ${t.videoRequired}`
          }
          currentName={localFileName}
          replaceLabel={t.replaceFile}
        />
        <p className="text-label mt-3 max-w-xl text-gray">{t.previewHint}</p>
        {videoPath && videoUpload.status === "idle" && (
          <p className="text-label mt-2 text-off-white">
            {t.fileReady} · {localFileName}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="text-label text-gray">{t.videoSource}</legend>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <SourceOption
            active={videoSource === "LOCAL"}
            label={t.sourceLocal}
            onClick={() => {
              setVideoSource("LOCAL");
              setVimeoProbe(null);
            }}
          />
          <SourceOption
            active={videoSource === "VIMEO"}
            label={t.sourceVimeo}
            onClick={() => setVideoSource("VIMEO")}
          />
        </div>
      </fieldset>

      {videoSource === "VIMEO" ? (
        <div>
          <label className="text-label text-gray" htmlFor="vimeo_url">
            {t.vimeoUrl}
          </label>
          <input
            id="vimeo_url"
            value={vimeoUrl}
            onChange={(e) => {
              setVimeoUrl(e.target.value);
              setVimeoProbe(null);
            }}
            placeholder={t.vimeoPlaceholder}
            className="mt-2 w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none placeholder:text-gray/50"
          />
          <p className="text-label mt-2 text-gray">{t.vimeoHint}</p>
          <button
            type="button"
            onClick={() => void verifyVimeo()}
            disabled={verifying || !vimeoUrl.trim()}
            className="text-label mt-5 border border-off-white/20 px-6 py-3 text-off-white hover:bg-off-white hover:text-black disabled:opacity-40"
          >
            {verifying ? t.vimeoVerifying : t.vimeoVerify}
          </button>
          {vimeoBlocked ? (
            <p className="text-label mt-4 text-off-white">{t.vimeoBlocked}</p>
          ) : parsedVimeoId ? (
            <p className="text-label mt-4 text-off-white">
              {t.vimeoLinked} · {parsedVimeoId}
              {vimeoVerified ? ` · ${t.vimeoEmbedOk}` : ""}
            </p>
          ) : vimeoUrl.trim() ? (
            <p className="text-label mt-4 text-gray">{t.vimeoInvalid}</p>
          ) : null}
          {vimeoVerified && parsedVimeoId && vimeoPreviewSrc(parsedVimeoId) ? (
            <div className="relative mt-6 aspect-video w-full max-w-md overflow-hidden bg-dark">
              <iframe
                src={vimeoPreviewSrc(parsedVimeoId) ?? undefined}
                title={vimeoProbe && vimeoProbe.ok ? vimeoProbe.title ?? title : title}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; encrypted-media"
              />
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-label text-gray">{t.previewLocalNote}</p>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label className="text-label text-gray" htmlFor="category">
            {t.category}
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            className="text-label mt-2 w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none"
          >
            {SELECTED_WORK_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value} className="bg-black">
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-label text-gray" htmlFor="work_date">
            {t.date}
          </label>
          <input
            id="work_date"
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
            required
            className="mt-2 w-full border-b border-off-white/20 bg-transparent py-3 text-off-white outline-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4"
        />
        <span className="text-label text-off-white">
          {published ? t.published : t.unpublished}
        </span>
      </label>

      {message && <p className="text-body text-gray">{message}</p>}

      <button
        type="submit"
        disabled={pending || !thumbnailPath || !hasPlayback}
        className="text-label border border-off-white px-8 py-4 text-off-white hover:bg-off-white hover:text-black disabled:opacity-50"
      >
        {pending ? t.saving : t.save}
      </button>
    </form>
  );
}

export function SelectedWorkDeleteButton({ id }: { id: string }) {
  const { dictionary } = useI18n();
  const t = dictionary.portfolioAdmin;

  return (
    <form
      action={deleteSelectedWorkAction}
      className="mt-10"
      onSubmit={(e) => {
        if (!confirm(t.deleteConfirm)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-label text-gray">
        {t.delete} →
      </button>
    </form>
  );
}

function SourceOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-label border px-4 py-4 ${
        active
          ? "border-off-white bg-off-white text-black"
          : "border-off-white/20 text-off-white"
      }`}
    >
      {label}
    </button>
  );
}

function UploadField({
  label,
  accept,
  hint,
  upload,
  onFile,
  currentName,
  replaceLabel,
}: {
  label: string;
  accept: string;
  hint: string;
  upload: UploadState;
  onFile: (file: File) => void;
  currentName?: string;
  replaceLabel: string;
}) {
  const { dictionary } = useI18n();
  const t = dictionary.portfolioAdmin;
  const hasFile = Boolean(currentName) || upload.status === "done";

  return (
    <div>
      <p className="text-label text-gray">{label}</p>
      <label className="text-label mt-3 block cursor-pointer border border-dashed border-off-white/20 px-4 py-8 text-center text-off-white">
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
        {hasFile ? replaceLabel : t.selectFile}
        <span className="mt-2 block text-gray">{hint}</span>
      </label>
      {upload.status !== "idle" && (
        <div className="mt-3">
          <p className="text-label text-gray">
            {upload.name}{" "}
            {upload.status === "done"
              ? t.uploadDone
              : upload.status === "error"
                ? t.uploadFail
                : `${upload.progress}%`}
          </p>
          {upload.status === "uploading" && (
            <div className="mt-3 h-px w-full bg-off-white/20">
              <div
                className="h-px bg-off-white transition-[width] duration-150"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
