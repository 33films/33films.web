export type StorageFailureCategory =
  | "configuration"
  | "authentication"
  | "authorization"
  | "not_found"
  | "storage";

export type StorageLogContext = Record<string, string | number | boolean | null>;

export type ActionUploadFailure = {
  source: "action";
  code: string;
  message: string | null;
};

export type PutUploadFailure = {
  source: "put";
  status: number;
  message: string;
};

const BLOCKED_CONTEXT_KEYS = new Set([
  "apikey",
  "api_key",
  "authorization",
  "email",
  "file_name",
  "filename",
  "key",
  "name",
  "original_name",
  "password",
  "path",
  "service_role",
  "signed_url",
  "signedurl",
  "storage_path",
  "token",
  "url",
]);

const REDACTIONS: Array<[RegExp, string]> = [
  [/SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/gi, "SUPABASE_SERVICE_ROLE_KEY=[redacted]"],
  [/sb_secret_[A-Za-z0-9_-]+/g, "[redacted]"],
  [/sb_publishable_[A-Za-z0-9_-]+/g, "[redacted]"],
  [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[redacted]"],
  [/bearer\s+\S+/gi, "bearer [redacted]"],
  [/[?&](?:token|apikey|api_key|access_token)=[^&\s"']+/gi, ""],
  [/https?:\/\/[^\s"']+/gi, "[redacted]"],
];

export function sanitizeDiagnosticText(value: string, max = 180) {
  let text = value;
  for (const [pattern, replacement] of REDACTIONS) {
    text = text.replace(pattern, replacement);
  }
  text = text.replace(/\s+/g, " ").trim();
  if (!text) return "empty";
  if (text.length > max) return text.slice(0, max);
  return text;
}

function readStatus(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

export function readErrorFields(error: unknown) {
  if (typeof error === "string") {
    return { message: error, status: null as number | null, code: null as string | null };
  }
  if (!error || typeof error !== "object") {
    return { message: "unknown", status: null as number | null, code: null as string | null };
  }
  const value = error as {
    message?: unknown;
    error?: unknown;
    status?: unknown;
    statusCode?: unknown;
    code?: unknown;
  };
  const message =
    typeof value.message === "string"
      ? value.message
      : typeof value.error === "string"
        ? value.error
        : "unknown";
  return {
    message,
    status: readStatus(value.status ?? value.statusCode),
    code: typeof value.code === "string" ? value.code : null,
  };
}

export function classifyStorageFailure(error: unknown): StorageFailureCategory {
  const { message, status, code } = readErrorFields(error);
  const text = `${code ?? ""} ${message}`.toLowerCase();

  if (
    text.includes("missing service role") ||
    text.includes("invalid api key") ||
    text.includes("no api key") ||
    text.includes("not configured") ||
    text.includes("supabase_service_role_key")
  ) {
    return "configuration";
  }

  if (
    status === 404 ||
    text.includes("not found") ||
    text.includes("object not found") ||
    code === "PGRST116"
  ) {
    return "not_found";
  }

  if (
    message === "UNAUTHENTICATED" ||
    message === "INACTIVE" ||
    status === 401 ||
    text.includes("not authenticated") ||
    text.includes("session missing") ||
    text.includes("jwt expired") ||
    text.includes("invalid jwt")
  ) {
    return "authentication";
  }

  if (
    message === "FORBIDDEN" ||
    status === 403 ||
    text.includes("permission denied") ||
    text.includes("not authorized") ||
    text.includes("unauthorized") ||
    text.includes("row-level security") ||
    text.includes("row level security")
  ) {
    return "authorization";
  }

  return "storage";
}

export function sanitizeContext(context: StorageLogContext | undefined) {
  const safe: StorageLogContext = {};
  if (!context) return safe;
  for (const [key, value] of Object.entries(context)) {
    if (BLOCKED_CONTEXT_KEYS.has(key.toLowerCase())) continue;
    if (typeof value === "string") safe[key] = sanitizeDiagnosticText(value);
    else if (typeof value === "number" || typeof value === "boolean" || value === null) {
      safe[key] = value;
    }
  }
  return safe;
}

export function storageFailureRecord(input: {
  operation: string;
  category: StorageFailureCategory;
  context?: StorageLogContext;
  error?: unknown;
}) {
  const fields = input.error === undefined ? null : readErrorFields(input.error);
  return {
    operation: input.operation,
    category: input.category,
    context: sanitizeContext(input.context),
    status: fields?.status ?? null,
    code: fields?.code ?? null,
    message: fields ? sanitizeDiagnosticText(fields.message) : null,
  };
}

export function logStorageFailure(input: {
  operation: string;
  category: StorageFailureCategory;
  context?: StorageLogContext;
  error?: unknown;
}) {
  console.error("[storage]", storageFailureRecord(input));
}

export function actionResultFailure(code: string): ActionUploadFailure {
  const safeCode = sanitizeDiagnosticText(code);
  return {
    source: "action",
    code: safeCode === "empty" ? "empty" : safeCode,
    message: null,
  };
}

export function actionRejectionFrom(error: unknown): ActionUploadFailure {
  return {
    source: "action",
    code: "rejected",
    message: sanitizeDiagnosticText(readErrorFields(error).message),
  };
}

export function interpretSignedUploadResponse(status: number, body: string): PutUploadFailure | null {
  if (status >= 200 && status < 300) return null;
  const safeStatus = Number.isFinite(status) ? status : 0;
  const fallback = safeStatus === 0 ? "network" : "empty";
  return {
    source: "put",
    status: safeStatus,
    message: sanitizeDiagnosticText(body.trim() ? body : fallback),
  };
}

export function isPutUploadFailure(value: unknown): value is PutUploadFailure {
  if (!value || typeof value !== "object") return false;
  const record = value as { source?: unknown; status?: unknown; message?: unknown };
  return record.source === "put" && typeof record.status === "number" && typeof record.message === "string";
}

export function uploadDiagnosticRecord(
  kind: "thumbnail" | "video",
  failure: ActionUploadFailure | PutUploadFailure
) {
  const bucket = kind === "thumbnail" ? "portfolio-thumbnails" : "portfolio-videos";
  return {
    operation: `${bucket}.upload`,
    bucket,
    kind,
    ...failure,
  };
}
