"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { slugify, isAllowedFile } from "@/lib/platform/format";
import { storage, queueNotification } from "@/lib/storage";
import {
  SIGNED_URL_EXPIRES,
  type ProjectStatus,
  type UserRole,
  type UserStatus,
} from "@/lib/platform/types";

export async function updateProfileAction(formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createServerSupabase();
  if (!supabase) return;

  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? ""),
      company: String(formData.get("company") ?? "") || null,
      avatar_url: avatarUrl || null,
    })
    .eq("id", profile.id);

  if (error) return { error: "auth" };
  revalidatePath("/dashboard/profile");
  return { ok: true };
}

async function logActivity(
  actorId: string,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("activity_logs").insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId ?? null,
    metadata: metadata ?? null,
  });
}

export async function adminCreateUser(formData: FormData) {
  const { profile: adminProfile } = await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return;

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) return;

  await admin
    .from("profiles")
    .update({ role: "user", full_name: fullName, email })
    .eq("id", data.user.id);

  await logActivity(adminProfile.id, "user_created", "user", data.user.id, {
    email,
  });
  revalidatePath("/admin/users");
}

export async function adminUpdateUser(formData: FormData) {
  const { profile: adminProfile } = await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return;

  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const company = String(formData.get("company") ?? "");
  const role = String(formData.get("role") ?? "user") as UserRole;
  const status = String(formData.get("status") ?? "active") as UserStatus;

  await admin
    .from("profiles")
    .update({ full_name: fullName, company: company || null, role, status })
    .eq("id", id);

  await logActivity(adminProfile.id, "user_updated", "user", id);
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
}

export async function adminDeleteUser(formData: FormData) {
  const { profile: adminProfile } = await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  await admin.auth.admin.deleteUser(id);
  await logActivity(adminProfile.id, "user_deleted", "user", id);
  revalidatePath("/admin/users");
}

export async function adminCreateProject(formData: FormData) {
  const { profile } = await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return;

  const name = String(formData.get("name") ?? "");
  const clientName = String(formData.get("client_name") ?? "");
  const description = String(formData.get("description") ?? "");
  const slug = slugify(name) || `project-${Date.now()}`;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name,
      slug,
      client_name: clientName || null,
      description: description || null,
    })
    .select("id")
    .single();

  if (error || !data) return;
  await logActivity(profile.id, "project_created", "project", data.id, { name });
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${data.id}`);
}

export async function adminUpdateProject(formData: FormData) {
  const { profile } = await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const clientName = String(formData.get("client_name") ?? "");
  const description = String(formData.get("description") ?? "");
  const status = String(formData.get("status") ?? "brief") as ProjectStatus;

  await supabase
    .from("projects")
    .update({
      name,
      client_name: clientName || null,
      description: description || null,
      status,
    })
    .eq("id", id);

  await logActivity(profile.id, "project_updated", "project", id);
  queueNotification("project_updated", { projectId: id });
  revalidatePath(`/admin/projects/${id}`);
}

export async function adminAssignUsers(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  if (!admin) return;
  const projectId = String(formData.get("project_id") ?? "");
  const userIds = formData.getAll("user_ids").map(String);

  await admin.from("project_users").delete().eq("project_id", projectId);
  if (userIds.length) {
    await admin.from("project_users").insert(
      userIds.map((user_id) => ({ project_id: projectId, user_id }))
    );
  }
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function createUploadUrl(formData: FormData) {
  const { profile } = await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const projectId = String(formData.get("project_id") ?? "");
  const folderId = String(formData.get("folder_id") ?? "");
  const fileName = String(formData.get("file_name") ?? "");
  const mimeType = String(formData.get("mime_type") ?? "application/octet-stream");
  const size = Number(formData.get("size") ?? 0);

  if (!projectId || !folderId || !fileName) {
    return { error: "auth" as const };
  }
  if (!isAllowedFile(fileName, mimeType)) {
    return { error: "type" as const };
  }

  const { data: folder } = await supabase
    .from("project_folders")
    .select("id, slug, project_id")
    .eq("id", folderId)
    .eq("project_id", projectId)
    .maybeSingle();
  if (!folder) return { error: "auth" as const };

  const { data: members } = await supabase
    .from("project_users")
    .select("user_id")
    .eq("project_id", projectId);
  const assigneeId =
    members?.length === 1 ? members[0].user_id : null;

  const safeName = fileName.replace(/[^\w.\-()+ ]/g, "_");
  const folderSlug = folder.slug || "files";
  const path = `projects/${projectId}/${folderSlug}/${Date.now()}-${safeName}`;
  const signed = await storage.createSignedUpload({
    path,
    contentType: mimeType,
  });

  return {
    ok: true as const,
    ...signed,
    meta: {
      projectId,
      folderId,
      folder: folderSlug,
      userId: assigneeId,
      fileName: safeName,
      originalName: fileName,
      mimeType,
      size,
      uploadedBy: profile.id,
    },
  };
}

export async function confirmUpload(payload: {
  projectId: string;
  folderId: string;
  folder?: string;
  userId?: string | null;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedBy: string;
}) {
  const { profile } = await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" };

  const { error } = await supabase.from("files").insert({
    project_id: payload.projectId,
    folder_id: payload.folderId,
    user_id: payload.userId ?? null,
    folder: payload.folder ?? null,
    name: payload.fileName,
    original_name: payload.originalName,
    storage_path: payload.path,
    mime_type: payload.mimeType,
    size: payload.size,
    uploaded_by: profile.id,
  });
  if (error) return { error: "upload" };

  await logActivity(profile.id, "file_uploaded", "file", payload.path, {
    name: payload.originalName,
    projectId: payload.projectId,
  });
  queueNotification("file_uploaded", payload);
  revalidatePath(`/admin/projects/${payload.projectId}`);
  revalidatePath("/admin/files");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteFileAction(formData: FormData) {
  const { profile } = await requireAdmin();
  const admin = createAdminClient();
  const supabase = admin ?? (await createServerSupabase());
  if (!supabase) return;
  const id = String(formData.get("id") ?? "");

  const { data: file } = await supabase
    .from("files")
    .select("id, storage_path, project_id")
    .eq("id", id)
    .maybeSingle();

  if (!file) return;
  if (file.storage_path) {
    await storage.remove(file.storage_path);
  }
  await supabase.from("files").delete().eq("id", id);
  await logActivity(profile.id, "file_deleted", "file", id);
  queueNotification("file_deleted", { id });
  revalidatePath("/admin");
  revalidatePath("/admin/files");
  if (file.project_id) revalidatePath(`/admin/projects/${file.project_id}`);
}

export async function markFileSeen(fileId: string) {
  const { profile } = await requireUser();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const { data: file } = await supabase
    .from("files")
    .select("id, project_id")
    .eq("id", fileId)
    .maybeSingle();
  if (!file) return { error: "not_found" as const };

  if (profile.role !== "admin") {
    const { data: membership } = await supabase
      .from("project_users")
      .select("user_id")
      .eq("project_id", file.project_id)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (!membership) return { error: "forbidden" as const };
  }

  const admin = createAdminClient();
  const writer = admin ?? supabase;
  await writer
    .from("files")
    .update({ seen_at: new Date().toISOString() })
    .eq("id", fileId)
    .is("seen_at", null);

  await supabase
    .from("profiles")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", profile.id);
  return { ok: true as const };
}

export async function getDownloadUrl(fileId: string) {
  try {
    const { profile } = await requireUser();
    const supabase = await createServerSupabase();
    if (!supabase) return { error: "setup" as const };

    const { data: file } = await supabase
      .from("files")
      .select("id, storage_path, original_name, project_id")
      .eq("id", fileId)
      .maybeSingle();

    if (!file) return { error: "not_found" as const };

    if (profile.role !== "admin") {
      const { data: membership } = await supabase
        .from("project_users")
        .select("user_id")
        .eq("project_id", file.project_id)
        .eq("user_id", profile.id)
        .maybeSingle();
      if (!membership) return { error: "forbidden" as const };
    }

    const url = await storage.createSignedDownload(
      file.storage_path,
      SIGNED_URL_EXPIRES
    );
    return { url, name: file.original_name };
  } catch {
    return { error: "unavailable" as const };
  }
}

export async function createReplaceUrl(formData: FormData) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const fileId = String(formData.get("file_id") ?? "");
  const fileName = String(formData.get("file_name") ?? "");
  const mimeType = String(formData.get("mime_type") ?? "application/octet-stream");
  const size = Number(formData.get("size") ?? 0);

  if (!isAllowedFile(fileName, mimeType)) {
    return { error: "type" as const };
  }

  const { data: file } = await supabase
    .from("files")
    .select("id, storage_path, project_id")
    .eq("id", fileId)
    .maybeSingle();
  if (!file) return { error: "not_found" as const };

  const signed = await storage.createSignedUpload({
    path: file.storage_path,
    contentType: mimeType,
    upsert: true,
  });

  return {
    ok: true as const,
    ...signed,
    meta: {
      fileId,
      projectId: file.project_id,
      fileName,
      mimeType,
      size,
    },
  };
}

export async function confirmReplace(payload: {
  fileId: string;
  projectId: string;
  fileName: string;
  mimeType: string;
  size: number;
}) {
  const { profile } = await requireAdmin();
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "setup" as const };

  const { error } = await supabase
    .from("files")
    .update({
      name: payload.fileName.replace(/[^\w.\-()+ ]/g, "_"),
      original_name: payload.fileName,
      mime_type: payload.mimeType,
      size: payload.size,
      seen_at: null,
    })
    .eq("id", payload.fileId);

  if (error) return { error: "upload" as const };
  await logActivity(profile.id, "file_replaced", "file", payload.fileId, {
    name: payload.fileName,
  });
  revalidatePath("/admin/files");
  revalidatePath(`/admin/projects/${payload.projectId}`);
  return { ok: true as const };
}
