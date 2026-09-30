import {
  PORTFOLIO_THUMB_BUCKET,
  PORTFOLIO_VIDEO_BUCKET,
  type SelectedWork,
  type SelectedWorkPublic,
} from "./types";

export function getPortfolioPublicUrl(bucket: string, path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base || !path) return "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function withPortfolioUrls(work: SelectedWork): SelectedWorkPublic {
  return {
    ...work,
    video_path: work.video_path ?? null,
    vimeo_id: work.vimeo_id ?? null,
    video_source: work.video_source ?? null,
    thumbnail_url: getPortfolioPublicUrl(PORTFOLIO_THUMB_BUCKET, work.thumbnail_path),
    video_url: work.video_path
      ? getPortfolioPublicUrl(PORTFOLIO_VIDEO_BUCKET, work.video_path)
      : "",
  };
}
