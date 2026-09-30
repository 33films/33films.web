export type SelectedWorkCategory =
  | "music_video"
  | "commercial"
  | "brand_film"
  | "short_film";

export type SelectedWorkVideoSource = "LOCAL" | "VIMEO";

export type SelectedWork = {
  id: string;
  slug: string;
  title: string;
  thumbnail_path: string;
  video_path: string | null;
  vimeo_id: string | null;
  video_source?: SelectedWorkVideoSource | null;
  category: SelectedWorkCategory;
  work_date: string;
  sort_order: number;
  published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export function resolveVideoSource(work?: {
  video_source?: SelectedWorkVideoSource | null;
  vimeo_id?: string | null;
  video_path?: string | null;
} | null): SelectedWorkVideoSource {
  if (work?.video_source === "VIMEO" || work?.video_source === "LOCAL") {
    return work.video_source;
  }
  if (work?.vimeo_id) return "VIMEO";
  return "LOCAL";
}

export function workUsesVimeo(work?: {
  video_source?: SelectedWorkVideoSource | null;
  vimeo_id?: string | null;
  video_path?: string | null;
  video_url?: string | null;
} | null): boolean {
  if (!work?.vimeo_id) return false;
  const source = resolveVideoSource(work);
  if (source === "VIMEO") return true;
  return !work.video_path && !work.video_url;
}

export function workHoverPreviewUrl(work?: {
  video_url?: string | null;
} | null): string {
  return work?.video_url?.trim() || "";
}

export type SelectedWorkPublic = SelectedWork & {
  thumbnail_url: string;
  video_url: string;
};

export const PORTFOLIO_THUMB_BUCKET = "portfolio-thumbnails";
export const PORTFOLIO_VIDEO_BUCKET = "portfolio-videos";

export const SELECTED_WORK_CATEGORIES: {
  value: SelectedWorkCategory;
  label: string;
}[] = [
  { value: "music_video", label: "Music Video" },
  { value: "commercial", label: "Commercial" },
  { value: "brand_film", label: "Brand Film" },
  { value: "short_film", label: "Short Film" },
];

export const THUMB_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
export const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "mkv"];
