import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SignedUpload } from "@/lib/storage/types";

export async function createPortfolioSignedUpload(params: {
  bucket: string;
  path: string;
  contentType: string;
  upsert?: boolean;
}): Promise<SignedUpload> {
  const admin = createAdminClient();
  if (!admin) throw new Error("Missing service role key");

  const { data, error } = await admin.storage
    .from(params.bucket)
    .createSignedUploadUrl(params.path, { upsert: params.upsert ?? false });

  if (error || !data) throw error ?? new Error("Could not create upload URL");

  return {
    path: data.path,
    token: data.token,
    signedUrl: data.signedUrl,
  };
}

export async function removePortfolioObject(bucket: string, path: string) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Missing service role key");
  const { error } = await admin.storage.from(bucket).remove([path]);
  if (error) throw error;
}
