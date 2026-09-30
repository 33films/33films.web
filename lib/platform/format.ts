export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function fileExtension(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function isAllowedFile(name: string, mime: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const allowedExt = [
    "mp4",
    "mov",
    "avi",
    "mkv",
    "webm",
    "jpg",
    "jpeg",
    "png",
    "webp",
    "pdf",
    "zip",
    "rar",
    "docx",
    "xlsx",
  ];
  if (allowedExt.includes(ext)) return true;
  return (
    mime.startsWith("video/") ||
    mime.startsWith("audio/") ||
    mime.startsWith("image/") ||
    mime === "application/pdf"
  );
}
