"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { moveSelectedWorkAction } from "@/app/actions/selected-work";
import { categoryLabel, formatWorkDate } from "@/lib/portfolio/format";
import { resolveVideoSource, type SelectedWorkPublic } from "@/lib/portfolio/types";

export default function AdminWorksTable({
  works,
  locale,
}: {
  works: SelectedWorkPublic[];
  locale: string;
}) {
  const { dictionary } = useI18n();
  const t = dictionary.portfolioAdmin;
  const router = useRouter();
  const [rows, setRows] = useState(works);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setRows(works);
  }, [works]);

  const move = async (id: string, direction: "up" | "down") => {
    const index = rows.findIndex((row) => row.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || target < 0 || target >= rows.length) return;

    const previous = rows;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    setFailed(false);
    setPendingId(id);

    const form = new FormData();
    form.set("id", id);
    form.set("direction", direction);
    const result = await moveSelectedWorkAction(form);
    if (result && "error" in result) {
      setRows(previous);
      setFailed(true);
    } else {
      router.refresh();
    }
    setPendingId(null);
  };

  return (
    <div className="mt-10 overflow-x-auto">
      {failed ? <p className="text-body mb-6 text-gray">{t.saveFail}</p> : null}
      <div className="hidden min-w-[720px] grid-cols-12 gap-4 border-b border-off-white/10 pb-4 text-gray md:grid">
        <p className="text-label col-span-2">{t.thumbnail}</p>
        <p className="text-label col-span-3">{t.title}</p>
        <p className="text-label col-span-2">{t.category}</p>
        <p className="text-label col-span-1">{t.order}</p>
        <p className="text-label col-span-2">{t.status}</p>
        <p className="text-label col-span-2">{t.actions}</p>
      </div>

      {rows.map((work, index) => (
        <div
          key={work.id}
          className="grid min-w-[720px] grid-cols-1 gap-4 border-t border-off-white/10 py-5 md:grid-cols-12 md:items-center"
        >
          <div className="relative aspect-video w-full max-w-[140px] overflow-hidden bg-dark md:col-span-2">
            {work.thumbnail_url ? (
              <Image
                src={work.thumbnail_url}
                alt={work.title}
                fill
                className="object-cover"
                sizes="140px"
              />
            ) : null}
          </div>
          <div className="md:col-span-3">
            <p className="text-subhead text-off-white">{work.title}</p>
            <p className="text-label mt-1 text-gray">
              {resolveVideoSource(work) === "VIMEO" ? "VIMEO" : t.video}
              {work.video_url ? ` · ${t.previewVideo}` : ""}
            </p>
            <p className="text-label mt-1 text-gray">
              {formatWorkDate(work.work_date, locale)}
            </p>
          </div>
          <p className="text-label text-gray md:col-span-2">
            {categoryLabel(work.category)}
          </p>
          <p className="text-label text-off-white md:col-span-1">{index + 1}</p>
          <p className="text-label md:col-span-2">
            <span className={work.published ? "text-off-white" : "text-gray"}>
              {work.published ? `● ${t.published}` : `○ ${t.unpublished}`}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Link
              href={`/admin/works/${work.id}`}
              className="text-label text-off-white hover:opacity-70"
            >
              {t.edit}
            </Link>
            <button
              type="button"
              disabled={pendingId !== null || index === 0}
              onClick={() => move(work.id, "up")}
              className="text-label text-gray disabled:opacity-30"
              aria-label={t.moveUp}
            >
              ↑
            </button>
            <button
              type="button"
              disabled={pendingId !== null || index === rows.length - 1}
              onClick={() => move(work.id, "down")}
              className="text-label text-gray disabled:opacity-30"
              aria-label={t.moveDown}
            >
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
