import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPortfolioPublicUrl } from "@/lib/portfolio/urls";
import {
  HOME_MEDIA_BUCKET,
  type HeroAdminState,
  type HeroVideo,
  type HomeSettings,
} from "./types";

function isMissingHomeSchema(error: { code?: string; message?: string } | null) {
  const code = error?.code ?? "";
  const message = error?.message ?? "";
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    message.includes("home_settings") ||
    message.includes("schema cache")
  );
}

async function readHomeSettings() {
  const supabase = await createServerSupabase();
  if (!supabase) return { settings: null, schemaMissing: true };

  const { data, error } = await supabase
    .from("home_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    if (!isMissingHomeSchema(error)) console.error("home_settings read", error);
    return { settings: null, schemaMissing: isMissingHomeSchema(error) };
  }

  return { settings: (data as HomeSettings | null) ?? null, schemaMissing: false };
}

export async function getHeroVideo(): Promise<HeroVideo | null> {
  const { settings } = await readHomeSettings();

  if (settings?.hero_source === "vimeo" && settings.hero_vimeo_id) {
    return { kind: "vimeo", vimeoId: settings.hero_vimeo_id };
  }

  if (settings?.hero_source === "upload" && settings.hero_video_path) {
    const src = getPortfolioPublicUrl(HOME_MEDIA_BUCKET, settings.hero_video_path);
    if (src) return { kind: "file", src };
  }

  return null;
}

export async function getHeroAdminState(): Promise<HeroAdminState> {
  const { settings, schemaMissing } = await readHomeSettings();
  const videoPath = settings?.hero_video_path ?? null;

  return {
    schemaMissing,
    source: settings?.hero_source ?? "default",
    videoPath,
    videoUrl: videoPath ? getPortfolioPublicUrl(HOME_MEDIA_BUCKET, videoPath) : "",
    vimeoId: settings?.hero_vimeo_id ?? null,
  };
}
