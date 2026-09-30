/**
 * Storage adapter — files are never public.
 * Swap this implementation to R2 / S3 / B2 later without rewriting UI.
 */
export type UploadProgress = {
  loaded: number;
  total: number;
};

export type SignedUpload = {
  path: string;
  token: string;
  signedUrl: string;
};

export interface StorageAdapter {
  createSignedUpload(params: {
    path: string;
    contentType: string;
    upsert?: boolean;
  }): Promise<SignedUpload>;
  createSignedDownload(path: string, expiresIn: number): Promise<string>;
  remove(path: string): Promise<void>;
  replace(path: string, file: Blob, contentType: string): Promise<void>;
}

export type FutureNotificationEvent =
  | "file_uploaded"
  | "project_updated"
  | "file_deleted";

/** Prepared for email/push later. Do not send in MVP. */
export function queueNotification(event: FutureNotificationEvent, payload: unknown) {
  void event;
  void payload;
}
