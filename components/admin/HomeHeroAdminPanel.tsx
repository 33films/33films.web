"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import {
  createHeroVideoUploadUrl,
  deleteHeroVideoAction,
  saveHeroVideoAction,
} from "@/app/actions/home";
import { probeVimeoEmbedAction } from "@/app/actions/selected-work";
import { extractVimeoId, vimeoBackgroundSrc, type VimeoProbeResult } from "@/lib/portfolio/vimeo";
import type { HeroAdminState } from "@/lib/home/types";

type EditableSource = "upload" | "vimeo";

type UploadState = {
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
  name?: string;
};

export default function HomeHeroAdminPanel({ state }: { state: HeroAdminState }) {
  const { dictionary } = useI18n();
  const t = dictionary.homeAdmin;
  const router = useRouter();

  const [source, setSource] = useState<EditableSource>(
    state.source === "vimeo" ? "vimeo" : "upload"
  );
  const [videoPath, setVideoPath] = useState(state.videoPath ?? "");
  const [videoPreview, setVideoPreview] = useState(state.videoUrl);
  const [vimeoUrl, setVimeoUrl] = useState(
    state.vimeoId ? `https://vimeo.com/${state.vimeoId}` : ""
  );
  const [vimeoProbe, setVimeoProbe] = useState<VimeoProbeResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [upload, setUpload] = useState<UploadState>({ progress: 0, status: "idle" });
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const parsedVimeoId = extractVimeoId(vimeoUrl);
  const vimeoBlocked = vimeoProbe?.ok === false && vimeoProbe.reason === "blocked";
  const vimeoVerified = vimeoProbe?.ok === true && vimeoProbe.id === parsedVimeoId;

  const canSave =
    (source === "upload" && Boolean(videoPath) && upload.status !== "uploading") ||
    (source === "vimeo" && Boolean(parsedVimeoId) && !vimeoBlocked);
  const canDelete =
    source === "upload"
      ? Boolean(videoPath) && upload.status !== "uploading"
      : Boolean(state.vimeoId || vimeoUrl.trim());

  const onDelete = async () => {
    if (!confirm(t.deleteConfirm)) return;
    setDeleting(true);
    setMessage(null);
    const payload = new FormData();
    payload.set("kind", source);
    if (source === "upload" && videoPath !== state.videoPath) {
      payload.set("pending_path", videoPath);
    }
    const result = await deleteHeroVideoAction(payload);
    setDeleting(false);

    if (result && "error" in result) {
      setMessage(result.error === "schema" ? t.schemaMissing : t.deleteFail);
      return;
    }

    if (source === "upload") {
      setVideoPath("");
      setVideoPreview("");
      setUpload({ progress: 0, status: "idle" });
    } else {
      setVimeoUrl("");
      setVimeoProbe(null);
    }
    setMessage(t.deleted);
    router.refresh();
  };

  const uploadFile = useCallback(
    async (file: File) => {
      setUpload({ progress: 0, status: "uploading", name: file.name });
      setMessage(null);

      try {
        const payload = new FormData();
        payload.set("file_name", file.name);
        payload.set("mime_type", file.type || "application/octet-stream");

        const signed = await createHeroVideoUploadUrl(payload);
        if (!signed || "error" in signed) {
          setUpload({ progress: 0, status: "error", name: file.name });
          setMessage(signed?.error === "type" ? t.typeFail : t.uploadFail);
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
            xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(String(xhr.status)));
          xhr.onerror = () => reject(new Error("network"));
          xhr.send(file);
        });

        setVideoPath(signed.path);
        setVideoPreview(URL.createObjectURL(file));
        setUpload({ progress: 100, status: "done", name: file.name });
      } catch (error) {
        setUpload({ progress: 0, status: "error", name: file.name });
        setMessage(error instanceof Error && error.message === "413" ? t.sizeFail : t.uploadFail);
      }
    },
    [t.sizeFail, t.typeFail, t.uploadFail]
  );

  const verifyVimeo = async () => {
    setVerifying(true);
    setMessage(null);
    const payload = new FormData();
    payload.set("vimeo_url", vimeoUrl);
    const result = await probeVimeoEmbedAction(payload);
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

  const onSave = async () => {
    setPending(true);
    setMessage(null);
    const payload = new FormData();
    payload.set("source", source);
    payload.set("video_path", videoPath);
    payload.set("vimeo_url", vimeoUrl);
    const result = await saveHeroVideoAction(payload);
    setPending(false);

    if (result && "error" in result) {
      setMessage(
        result.error === "schema"
          ? t.schemaMissing
          : result.error === "vimeo"
            ? t.vimeoInvalid
            : result.error === "vimeo_embed"
              ? t.vimeoBlocked
              : result.error === "video"
                ? t.videoRequired
                : t.saveFail
      );
      return;
    }

    setMessage(t.saved);
    router.refresh();
  };

  if (state.schemaMissing) {
    return <p className="text-body mt-8 max-w-2xl text-gray">{t.schemaMissing}</p>;
  }

  const sourceOptions: { id: EditableSource; label: string }[] = [
    { id: "upload", label: t.sourceUpload },
    { id: "vimeo", label: t.sourceVimeo },
  ];

  return (
    <div className="mt-12 max-w-2xl space-y-12">
      <fieldset className="border-t border-off-white/10 pt-8">
        <legend className="text-label text-gray">{t.source}</legend>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {sourceOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={source === option.id}
              onClick={() => {
                setSource(option.id);
                setMessage(null);
              }}
              className={`text-label border px-4 py-4 ${
                source === option.id
                  ? "border-off-white bg-off-white text-black"
                  : "border-off-white/20 text-off-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-label mt-4 text-off-white">
          {state.source === source ? t.live : state.source === "default" ? t.none : ""}
        </p>
      </fieldset>

      {source === "upload" ? (
        <div>
          <p className="text-label text-gray">{t.file}</p>
          <label className="text-label mt-3 block cursor-pointer border border-dashed border-off-white/20 px-4 py-8 text-center text-off-white">
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file);
                e.target.value = "";
              }}
            />
            {videoPath ? t.replaceFile : t.selectFile}
            <span className="mt-2 block text-gray">{t.fileHint}</span>
          </label>
          {upload.status !== "idle" ? (
            <div className="mt-3">
              <p className="text-label text-gray">
                {upload.name}{" "}
                {upload.status === "done"
                  ? t.uploadDone
                  : upload.status === "error"
                    ? t.uploadFail
                    : `${upload.progress}%`}
              </p>
              {upload.status === "uploading" ? (
                <div className="mt-3 h-px w-full bg-off-white/20">
                  <div
                    className="h-px bg-off-white transition-[width] duration-150"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          {videoPreview ? (
            <PreviewFrame>
              <video
                key={videoPreview}
                src={videoPreview}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              />
            </PreviewFrame>
          ) : null}
        </div>
      ) : null}

      {source === "vimeo" ? (
        <div>
          <label className="text-label text-gray" htmlFor="hero-vimeo-url">
            {t.vimeoUrl}
          </label>
          <input
            id="hero-vimeo-url"
            value={vimeoUrl}
            onChange={(e) => {
              setVimeoUrl(e.target.value);
              setVimeoProbe(null);
            }}
            placeholder="https://vimeo.com/123456789"
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
          {parsedVimeoId && !vimeoBlocked ? (
            <p className="text-label mt-4 text-off-white">
              {t.vimeoLinked} · {parsedVimeoId}
              {vimeoVerified ? ` · ${t.vimeoOk}` : ""}
            </p>
          ) : vimeoUrl.trim() && !parsedVimeoId ? (
            <p className="text-label mt-4 text-gray">{t.vimeoInvalid}</p>
          ) : null}
          {parsedVimeoId && !vimeoBlocked && vimeoBackgroundSrc(parsedVimeoId) ? (
            <PreviewFrame>
              <iframe
                key={parsedVimeoId}
                src={vimeoBackgroundSrc(parsedVimeoId) ?? undefined}
                title="Hero preview"
                allow="autoplay; fullscreen"
                className="pointer-events-none absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 border-0"
              />
            </PreviewFrame>
          ) : null}
        </div>
      ) : null}

      {message ? <p className="text-body text-gray">{message}</p> : null}

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={pending || deleting || !canSave}
          className="text-label border border-off-white px-8 py-4 text-off-white hover:bg-off-white hover:text-black disabled:opacity-50"
        >
          {pending ? t.saving : t.save}
        </button>
        {canDelete ? (
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={pending || deleting}
            className="text-label border border-off-white/20 px-8 py-4 text-gray hover:border-off-white hover:text-off-white disabled:opacity-50"
          >
            {deleting ? t.deleting : t.delete}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-6 aspect-video w-full overflow-hidden bg-dark">{children}</div>
  );
}
