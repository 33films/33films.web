"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { slugify } from "@/lib/platform/format";
import {
  createPortfolioSignedUpload,
  removePortfolioObject,
} from "@/lib/portfolio/storage";
import {
  isAllowedPortfolioVideo,
  isAllowedThumbnail,
} from "@/lib/portfolio/format";
import {
  PORTFOLIO_THUMB_BUCKET,
  PORTFOLIO_VIDEO_BUCKET,
  type SelectedWorkCategory,
  type SelectedWorkVideoSource,
} from "@/lib/portfolio/types";
import { extractVimeoId, probeVimeoEmbed } from "@/lib/portfolio/vimeo";

function schemaError(error: { code?: string; message?: string } | null) {
  const code = error?.code ?? "";
  const message = error?.message ?? "";
  if (
    code === "42703" ||
    code === "PGRST204" ||
    code === "23502" ||
    message.includes("vimeo_id") ||
    message.includes("video_source") ||
    message.includes("schema cache")
  ) {
    return "schema" as const;
  }
  return "save" as const;
}

function isMissingColumn(
  error: { code?: string; message?: string } | null,
  column: string
) {
  const code = error?.code ?? "";
  const message = error?.message ?? "";
  return (
    code === "42703" ||
    code === "PGRST204" ||
    message.includes(column) ||
    message.includes("schema cache")
  );
}

type ParsedWork =
  | {
      title: string;
      category: SelectedWorkCategory;
      workDate: string;
      published: boolean;
      thumbnailPath: string;
      videoPath: string | null;
      vimeoId: string | null;
      videoSource: SelectedWorkVideoSource;
      sortOrderInput: string;
    }
  | { error: "validation" | "vimeo" };

function parseWorkForm(formData: FormData): ParsedWork {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "") as SelectedWorkCategory;
  const workDate = String(formData.get("work_date") ?? "");
  const published = formData.get("published") === "on";
  const thumbnailPath = String(formData.get("thumbnail_path") ?? "");
  const videoSource: SelectedWorkVideoSource =
    String(formData.get("video_source") ?? "") === "VIMEO" ? "VIMEO" : "LOCAL";
  const videoPath = String(formData.get("video_path") ?? "").trim() || null;
  const vimeoInput = String(formData.get("vimeo_url") ?? "").trim();
  const vimeoId = vimeoInput ? extractVimeoId(vimeoInput) : null;
  const sortOrderInput = String(formData.get("sort_order") ?? "").trim();

  if (!title || !category || !workDate || !thumbnailPath) {
    return { error: "validation" };
  }

  if (videoSource === "VIMEO") {
    if (!vimeoId) return { error: vimeoInput ? "vimeo" : "validation" };
    return {
      title,
      category,
      workDate,
      published,
      thumbnailPath,
      videoPath,
      vimeoId,
      videoSource,
      sortOrderInput,
    };
  }

  if (!videoPath) return { error: "validation" };
  return {
    title,
    category,
    workDate,
    published,
    thumbnailPath,
    videoPath,
    vimeoId: null,
    videoSource,
    sortOrderInput,
  };
}

async function uniqueSlug(base: string, excludeId?: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return base;
  let slug = base || `work-${Date.now()}`;
  let suffix = 0;
  while (true) {
    let query = supabase.from("selected_works").select("id").eq("slug", slug);
    if (excludeId) query = query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

export async function createPortfolioUploadUrl(formData: FormData) {
  await requireAdmin();
  const kind = String(formData.get("kind") ?? "");
  const fileName = String(formData.get("file_name") ?? "");
  const mimeType = String(formData.get("mime_type") ?? "application/octet-stream");

  const isThumb = kind === "thumbnail";
  const bucket = isThumb ? PORTFOLIO_THUMB_BUCKET : PORTFOLIO_VIDEO_BUCKET;
  const allowed = isThumb
    ? isAllowedThumbnail(fileName, mimeType)
    : isAllowedPortfolioVideo(fileName, mimeType);

  if (!allowed) return { error: "type" as const };

  const safeName = fileName.replace(/[^\w.\-()+ ]/g, "_");
  const path = `${Date.now()}-${safeName}`;
  const signed = await createPortfolioSignedUpload({
    bucket,
    path,
    contentType: mimeType,
  });

  return {
    ok: true as const,
    ...signed,
    meta: { bucket, path, kind, fileName: safeName, mimeType },
  };
}

type WorkRow = {
  title: string;
  slug: string;
  category: SelectedWorkCategory;
  work_date: string;
  published: boolean;
  thumbnail_path: string;
  video_path: string | null;
  vimeo_id: string | null;
  video_source: SelectedWorkVideoSource;
  created_by?: string;
  sort_order?: number;
};

async function insertSelectedWorkRow(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>,
  row: WorkRow
) {
  const first = await supabase.from("selected_works").insert(row).select("id").single();
  if (!first.error && first.data) return first;
  if (first.error && isMissingColumn(first.error, "video_source")) {
    const { video_source: _source, ...legacy } = row;
    return supabase.from("selected_works").insert(legacy).select("id").single();
  }
  return first;
}

async function updateSelectedWorkRow(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>,
  row: WorkRow,
  id: string
) {
  const first = await supabase.from("selected_works").update(row).eq("id", id);
  if (!first.error) return first;
  if (isMissingColumn(first.error, "video_source")) {
    const { video_source: _source, ...legacy } = row;
    return supabase.from("selected_works").update(legacy).eq("id", id);
  }
  return first;
}

export async function probeVimeoEmbedAction(formData: FormData) {
  await requireAdmin();
  const url = String(formData.get("vimeo_url") ?? "");
  return probeVimeoEmbed(url);
}

async function ensureVimeoPlayable(parsed: Exclude<ParsedWork, { error: string }>) {
  if (parsed.videoSource !== "VIMEO" || !parsed.vimeoId) return null;
  const probe = await probeVimeoEmbed(parsed.vimeoId);
  if (probe.ok) return null;
  if (probe.reason === "blocked") return { error: "vimeo_embed" as const };
  if (probe.reason === "invalid") return { error: "vimeo" as const };
  return null;
}

export async function saveSelectedWorkAction(formData: FormData) {
  const { profile } = await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const parsed = parseWorkForm(formData);
  if ("error" in parsed) return parsed;
  const embedError = await ensureVimeoPlayable(parsed);
  if (embedError) return embedError;

  const slug = await uniqueSlug(slugify(parsed.title) || `work-${Date.now()}`);

  const { data: last } = await supabase
    .from("selected_works")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = parsed.sortOrderInput
    ? Number.parseInt(parsed.sortOrderInput, 10)
    : (last?.sort_order ?? 0) + 1;

  const { data, error } = await insertSelectedWorkRow(supabase, {
    title: parsed.title,
    slug,
    category: parsed.category,
    work_date: parsed.workDate,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : (last?.sort_order ?? 0) + 1,
    published: parsed.published,
    thumbnail_path: parsed.thumbnailPath,
    video_path: parsed.videoPath,
    vimeo_id: parsed.vimeoId,
    video_source: parsed.videoSource,
    created_by: profile.id,
  });

  if (error || !data) {
    console.error("selected_works insert", error);
    return { error: schemaError(error) };
  }

  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/works");
  redirect(`/admin/works/${data.id}`);
}

export async function updateSelectedWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const id = String(formData.get("id") ?? "");
  const parsed = parseWorkForm(formData);
  if (!id) return { error: "validation" as const };
  if ("error" in parsed) return parsed;
  const embedError = await ensureVimeoPlayable(parsed);
  if (embedError) return embedError;

  const { data: existing } = await supabase
    .from("selected_works")
    .select("thumbnail_path, video_path")
    .eq("id", id)
    .maybeSingle();

  const slugInput = String(formData.get("slug") ?? "");
  const slug = await uniqueSlug(slugify(slugInput || parsed.title), id);
  const patch: WorkRow = {
    title: parsed.title,
    slug,
    category: parsed.category,
    work_date: parsed.workDate,
    published: parsed.published,
    thumbnail_path: parsed.thumbnailPath,
    video_path: parsed.videoPath,
    vimeo_id: parsed.vimeoId,
    video_source: parsed.videoSource,
  };
  if (parsed.sortOrderInput) {
    const sortOrder = Number.parseInt(parsed.sortOrderInput, 10);
    if (Number.isFinite(sortOrder)) patch.sort_order = sortOrder;
  }

  const { error } = await updateSelectedWorkRow(supabase, patch, id);

  if (error) {
    console.error("selected_works update", error);
    return { error: schemaError(error) };
  }

  if (existing) {
    try {
      if (
        existing.thumbnail_path &&
        existing.thumbnail_path !== parsed.thumbnailPath
      ) {
        await removePortfolioObject(PORTFOLIO_THUMB_BUCKET, existing.thumbnail_path);
      }
      if (existing.video_path && existing.video_path !== parsed.videoPath) {
        await removePortfolioObject(PORTFOLIO_VIDEO_BUCKET, existing.video_path);
      }
    } catch {
      // Keep the saved row even if leftover storage cleanup fails.
    }
  }

  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/works");
  revalidatePath(`/admin/works/${id}`);
  return { ok: true as const };
}

export async function deleteSelectedWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const { data: work } = await supabase
    .from("selected_works")
    .select("thumbnail_path, video_path")
    .eq("id", id)
    .maybeSingle();

  if (!work) return;

  try {
    await removePortfolioObject(PORTFOLIO_THUMB_BUCKET, work.thumbnail_path);
    if (work.video_path) {
      await removePortfolioObject(PORTFOLIO_VIDEO_BUCKET, work.video_path);
    }
  } catch {
    // Continue DB delete even if storage cleanup fails.
  }

  await supabase.from("selected_works").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/works");
  redirect("/admin/works");
}

export async function moveSelectedWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) {
    return { error: "validation" as const };
  }

  const { data: rows } = await supabase
    .from("selected_works")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("work_date", { ascending: false });

  const list = rows ?? [];
  const index = list.findIndex((row) => row.id === id);
  if (index === -1) return { error: "not_found" as const };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= list.length) return { ok: true as const };

  const reordered = [...list];
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];

  const updates = reordered
    .map((row, position) => ({ id: row.id, from: row.sort_order, to: position + 1 }))
    .filter((row) => row.from !== row.to);

  const results = await Promise.all(
    updates.map((row) =>
      supabase.from("selected_works").update({ sort_order: row.to }).eq("id", row.id)
    )
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    console.error("selected_works reorder", failed.error);
    return { error: "save" as const };
  }

  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/works");
  return { ok: true as const };
}
