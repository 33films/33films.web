export const HOME_MEDIA_BUCKET = "home-media";

// "default" is the stored value for "no hero video".
export type HeroSource = "default" | "upload" | "vimeo";

export type HomeSettings = {
  id: number;
  hero_source: HeroSource;
  hero_video_path: string | null;
  hero_vimeo_id: string | null;
  updated_at: string;
};

export type HeroVideo =
  | { kind: "file"; src: string }
  | { kind: "vimeo"; vimeoId: string };

export type HeroAdminState = {
  schemaMissing: boolean;
  source: HeroSource;
  videoPath: string | null;
  videoUrl: string;
  vimeoId: string | null;
};
