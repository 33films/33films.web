"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { categoryLabel, formatWorkDate } from "@/lib/portfolio/format";
import { workUsesVimeo, type SelectedWorkPublic } from "@/lib/portfolio/types";
import VimeoPlayer from "./VimeoPlayer";
import { suspendPreviews } from "./VideoPreview";

export default function WorkDetailModal({
  work,
  onClose,
}: {
  work: SelectedWorkPublic;
  onClose: () => void;
}) {
  const { locale } = useI18n();
  const hasVimeo = workUsesVimeo(work);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    suspendPreviews(true);
    return () => suspendPreviews(false);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/90 p-5 md:items-center md:p-10"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative my-auto w-full max-w-6xl bg-black"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="text-label absolute top-0 right-0 z-40 px-4 py-3 text-gray hover:text-off-white"
        >
          ✕
        </button>

        {hasVimeo && work.vimeo_id ? (
          <VimeoPlayer
            vimeoId={work.vimeo_id}
            poster={work.thumbnail_url}
            title={work.title}
            onExit={onClose}
          />
        ) : work.video_url ? (
          <div className="relative aspect-video w-full overflow-hidden bg-dark">
            <video
              src={work.video_url}
              controls
              playsInline
              preload="metadata"
              poster={work.thumbnail_url}
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div
            className="relative aspect-video w-full overflow-hidden bg-dark bg-cover bg-center"
            style={
              work.thumbnail_url
                ? { backgroundImage: `url(${work.thumbnail_url})` }
                : undefined
            }
          />
        )}

        <div className="border-t border-off-white/10 px-5 py-7 md:flex md:items-end md:justify-between md:px-6 md:py-9">
          <div>
            <p className="font-[family-name:var(--font-geist)] text-[0.68rem] font-medium tracking-[0.32em] text-gray uppercase">
              {categoryLabel(work.category)}
            </p>
            <h2
              id="work-modal-title"
              className="mt-4 font-[family-name:var(--font-geist)] text-2xl font-light tracking-[0.08em] text-off-white uppercase md:text-3xl"
            >
              {work.title}
            </h2>
          </div>
          <p className="mt-5 font-[family-name:var(--font-geist)] text-[0.68rem] font-medium tracking-[0.32em] text-gray uppercase md:mt-0">
            {formatWorkDate(work.work_date, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}
