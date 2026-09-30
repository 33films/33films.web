"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { categoryLabel, formatWorkDate } from "@/lib/portfolio/format";
import type { SelectedWorkPublic } from "@/lib/portfolio/types";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import VideoPreview, {
  canHoverPreview,
} from "@/components/portfolio/VideoPreview";

export default function ProjectCard({
  work,
  index,
  onOpen,
}: {
  work: SelectedWorkPublic;
  index: number;
  onOpen: (work: SelectedWorkPublic) => void;
}) {
  const { locale } = useI18n();
  const number = String(index + 1).padStart(2, "0");
  const [hovered, setHovered] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(canHoverPreview());
  }, []);

  return (
    <motion.article
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <button
        type="button"
        onClick={() => {
          setHovered(false);
          onOpen(work);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group block w-full text-left"
      >
        <VideoPreview
          work={work}
          active={canHover && hovered}
          priority={index < 4}
        />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <span className="text-label text-black/40">{number}</span>
            <h3 className="text-subhead mt-1 text-black group-hover:opacity-70">
              {work.title}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-label text-black/40">{categoryLabel(work.category)}</p>
            <p className="text-label mt-1 text-black/40">
              {formatWorkDate(work.work_date, locale)}
            </p>
          </div>
        </div>
      </button>
    </motion.article>
  );
}
