"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { createPortfolioSignedUpload, removePortfolioObject } from "@/lib/portfolio/storage";
import { isAllowedThumbnail } from "@/lib/portfolio/format";
import { ABOUT_PHOTO_BUCKET } from "@/lib/about/types";

function schemaError(error: { code?: string; message?: string } | null) {
  const code = error?.code ?? "";
  const message = error?.message ?? "";
  if (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    message.includes("about_members") ||
    message.includes("about_settings") ||
    message.includes("schema cache")
  ) {
    return "schema" as const;
  }
  return "save" as const;
}

function revalidateAbout() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/about");
}

export async function createAboutPhotoUploadUrl(formData: FormData) {
  await requireAdmin();
  const fileName = String(formData.get("file_name") ?? "");
  const mimeType = String(formData.get("mime_type") ?? "application/octet-stream");

  if (!isAllowedThumbnail(fileName, mimeType)) return { error: "type" as const };

  const safeName = fileName.replace(/[^\w.\-()+ ]/g, "_");
  const path = `${Date.now()}-${safeName}`;
  const signed = await createPortfolioSignedUpload({
    bucket: ABOUT_PHOTO_BUCKET,
    path,
    contentType: mimeType,
  });

  return {
    ok: true as const,
    ...signed,
    meta: { bucket: ABOUT_PHOTO_BUCKET, path, fileName: safeName, mimeType },
  };
}

export async function setAboutEnabledAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const enabled = String(formData.get("enabled") ?? "") === "true";
  const { error } = await supabase
    .from("about_settings")
    .upsert({ id: 1, enabled }, { onConflict: "id" });

  if (error) {
    console.error("about_settings upsert", error);
    return { error: schemaError(error) };
  }

  revalidateAbout();
  return { ok: true as const };
}

export async function saveAboutMemberAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const photoPath = String(formData.get("photo_path") ?? "").trim();

  if (!name || !photoPath) return { error: "validation" as const };

  if (id) {
    const { data: existing } = await supabase
      .from("about_members")
      .select("photo_path")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase
      .from("about_members")
      .update({ name, role, photo_path: photoPath })
      .eq("id", id);

    if (error) {
      console.error("about_members update", error);
      return { error: schemaError(error) };
    }

    if (existing?.photo_path && existing.photo_path !== photoPath) {
      try {
        await removePortfolioObject(ABOUT_PHOTO_BUCKET, existing.photo_path);
      } catch {
        // Keep the saved row even if leftover storage cleanup fails.
      }
    }

    revalidateAbout();
    return { ok: true as const };
  }

  const { data: last } = await supabase
    .from("about_members")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("about_members").insert({
    name,
    role,
    photo_path: photoPath,
    sort_order: (last?.sort_order ?? 0) + 1,
  });

  if (error) {
    console.error("about_members insert", error);
    return { error: schemaError(error) };
  }

  revalidateAbout();
  return { ok: true as const };
}

export async function deleteAboutMemberAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const id = String(formData.get("id") ?? "");
  const { data: member } = await supabase
    .from("about_members")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();

  if (!member) return { error: "not_found" as const };

  try {
    await removePortfolioObject(ABOUT_PHOTO_BUCKET, member.photo_path);
  } catch {
    // Continue DB delete even if storage cleanup fails.
  }

  const { error } = await supabase.from("about_members").delete().eq("id", id);
  if (error) {
    console.error("about_members delete", error);
    return { error: schemaError(error) };
  }

  revalidateAbout();
  return { ok: true as const };
}
