import { createAdminClient } from "@/lib/supabase/admin";
import { SIGNED_URL_EXPIRES, STORAGE_BUCKET } from "@/lib/platform/types";
import type { SignedUpload, StorageAdapter } from "./types";

export class SupabaseStorageAdapter implements StorageAdapter {
  async createSignedUpload(params: {
    path: string;
    contentType: string;
    upsert?: boolean;
  }): Promise<SignedUpload> {
    const admin = createAdminClient();
    if (!admin) throw new Error("Missing service role key");

    const { data, error } = await admin.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(params.path, { upsert: params.upsert ?? false });

    if (error || !data) throw error ?? new Error("Could not create upload URL");

    return {
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
    };
  }

  async createSignedDownload(path: string, expiresIn = SIGNED_URL_EXPIRES) {
    const admin = createAdminClient();
    if (!admin) throw new Error("Missing service role key");

    const { data, error } = await admin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
      throw error ?? new Error("Could not create download URL");
    }
    return data.signedUrl;
  }

  async remove(path: string) {
    const admin = createAdminClient();
    if (!admin) throw new Error("Missing service role key");
    const { error } = await admin.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) throw error;
  }

  async replace(path: string, file: Blob, contentType: string) {
    const admin = createAdminClient();
    if (!admin) throw new Error("Missing service role key");
    const { error } = await admin.storage.from(STORAGE_BUCKET).upload(path, file, {
      contentType,
      upsert: true,
    });
    if (error) throw error;
  }
}

export const storage: StorageAdapter = new SupabaseStorageAdapter();
