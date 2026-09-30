"use client";

import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { ProjectStatus } from "@/lib/platform/types";

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const { dictionary } = useI18n();
  return (
    <span className="text-label inline-flex border border-off-white/20 px-3 py-1 text-off-white/80">
      {dictionary.status[status]}
    </span>
  );
}
