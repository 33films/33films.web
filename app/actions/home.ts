"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { createPortfolioSignedUpload, removePortfolioObject } from "@/lib/portfolio/storage";
import { isAllowedPortfolioVideo } from "@/lib/portfolio/format";
import { extractVimeoId, probeVimeoEmbed } from "@/lib/portfolio/vimeo";
import { HOME_MEDIA_BUCKET, type HeroSource } from "@/lib/home/types";

function schemaError(error: { code?: string; message?: string } | null) {
  const code = error?.code ?? "";
  const message = error?.message ?? "";
  if (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    message.includes("home_settings") ||
    message.includes("schema cache")
  ) {
    return "schema" as const;
  }
  return "save" as const;
}

export async function createHeroVideoUploadUrl(formData: FormData) {
  await requireAdmin();
  const fileName = String(formData.get("file_name") ?? "");
  const mimeType = String(formData.get("mime_type") ?? "application/octet-stream");

  if (!isAllowedPortfolioVideo(fileName, mimeType)) return { error: "type" as const };

  const safeName = fileName.replace(/[^\w.\-()+ ]/g, "_");
  const path = `hero/${Date.now()}-${safeName}`;

  try {
    const signed = await createPortfolioSignedUpload({
      bucket: HOME_MEDIA_BUCKET,
      path,
      contentType: mimeType,
    });
    return { ok: true as const, ...signed };
  } catch (error) {
    console.error("home-media signed upload", error);
    return { error: "upload" as const };
  }
}

export async function saveHeroVideoAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const raw = String(formData.get("source") ?? "");
  if (raw !== "upload" && raw !== "vimeo") return { error: "save" as const };
  const source: HeroSource = raw;
  const videoPath = String(formData.get("video_path") ?? "").trim() || null;
  const vimeoInput = String(formData.get("vimeo_url") ?? "").trim();

  const { data: existing, error: readError } = await supabase
    .from("home_settings")
    .select("hero_video_path, hero_vimeo_id")
    .eq("id", 1)
    .maybeSingle();

  if (readError) {
    console.error("home_settings read", readError);
    return { error: schemaError(readError) };
  }

  const update: {
    id: number;
    hero_source: HeroSource;
    hero_video_path?: string | null;
    hero_vimeo_id?: string | null;
  } = { id: 1, hero_source: source };

  if (source === "upload") {
    if (!videoPath) return { error: "video" as const };
    update.hero_video_path = videoPath;
  }

  if (source === "vimeo") {
    const vimeoId = extractVimeoId(vimeoInput);
    if (!vimeoId) return { error: "vimeo" as const };
    const probe = await probeVimeoEmbed(vimeoId);
    if (!probe.ok && probe.reason === "blocked") return { error: "vimeo_embed" as const };
    if (!probe.ok && probe.reason === "invalid") return { error: "vimeo" as const };
    update.hero_vimeo_id = vimeoId;
  }

  const { error } = await supabase.from("home_settings").upsert(update, { onConflict: "id" });

  if (error) {
    console.error("home_settings upsert", error);
    return { error: schemaError(error) };
  }

  const previousPath = existing?.hero_video_path;
  if (source === "upload" && previousPath && previousPath !== videoPath) {
    try {
      await removePortfolioObject(HOME_MEDIA_BUCKET, previousPath);
    } catch {
      // The new video is already live; a leftover file is harmless.
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/home");
  return { ok: true as const };
}

export async function deleteHeroVideoAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const kind = String(formData.get("kind") ?? "");
  if (kind !== "upload" && kind !== "vimeo") return { error: "save" as const };
  const pendingPath = String(formData.get("pending_path") ?? "").trim();

  const { data: existing, error: readError } = await supabase
    .from("home_settings")
    .select("hero_source, hero_video_path")
    .eq("id", 1)
    .maybeSingle();

  if (readError) {
    console.error("home_settings read", readError);
    return { error: schemaError(readError) };
  }

  const update: {
    id: number;
    hero_source?: HeroSource;
    hero_video_path?: null;
    hero_vimeo_id?: null;
  } = { id: 1 };

  if (kind === "upload") update.hero_video_path = null;
  else update.hero_vimeo_id = null;
  if (!existing || existing.hero_source === kind) update.hero_source = "default";

  const { error } = await supabase.from("home_settings").upsert(update, { onConflict: "id" });
  if (error) {
    console.error("home_settings delete", error);
    return { error: schemaError(error) };
  }

  if (kind === "upload") {
    const paths = new Set(
      [existing?.hero_video_path, pendingPath].filter(
        (path): path is string => Boolean(path) && path!.startsWith("hero/")
      )
    );
    for (const path of paths) {
      try {
        await removePortfolioObject(HOME_MEDIA_BUCKET, path);
      } catch {
        // The row is already cleared; a leftover file is harmless.
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/home");
  return { ok: true as const };
}
