import type { SelectedWorkCategory } from "./types";

export function categoryLabel(category: SelectedWorkCategory) {
  const labels: Record<SelectedWorkCategory, string> = {
    music_video: "Music Video",
    commercial: "Commercial",
    brand_film: "Brand Film",
    short_film: "Short Film",
  };
  return labels[category];
}

export function isAllowedThumbnail(name: string, mime: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return true;
  return mime.startsWith("image/");
}

export function isAllowedPortfolioVideo(name: string, mime: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "mov", "webm", "mkv"].includes(ext)) return true;
  return mime.startsWith("video/");
}

export function formatWorkDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
