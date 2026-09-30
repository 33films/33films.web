export type UserRole = "admin" | "user";
export type UserStatus = "active" | "inactive";

export type ProjectStatus =
  | "brief"
  | "pre_production"
  | "production"
  | "post_production"
  | "review"
  | "approved"
  | "delivered"
  | "archived";

export type FolderSlug =
  | "brief"
  | "storyboard"
  | "production"
  | "review"
  | "deliverables"
  | "video"
  | "photography"
  | "audio"
  | "documents";

export const DEFAULT_FOLDERS: { slug: FolderSlug; name: string; sort_order: number }[] =
  [
    { slug: "brief", name: "Brief", sort_order: 0 },
    { slug: "storyboard", name: "Storyboard", sort_order: 1 },
    { slug: "production", name: "Producción", sort_order: 2 },
    { slug: "review", name: "Revisión", sort_order: 3 },
    { slug: "deliverables", name: "Entregables", sort_order: 4 },
  ];

export const ALLOWED_MIME_PREFIXES = [
  "video/",
  "audio/",
  "image/",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/vnd.openxmlformats-officedocument",
];

export const ALLOWED_EXTENSIONS = [
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

export type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  company: string | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
};

export type ClientProject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  client_name: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  file_count?: number;
};

export type ProjectFolder = {
  id: string;
  project_id: string;
  slug: FolderSlug;
  name: string;
  sort_order: number;
};

export type ProjectFile = {
  id: string;
  project_id: string;
  folder_id: string;
  user_id: string | null;
  folder: string | null;
  name: string;
  original_name: string;
  storage_path: string;
  mime_type: string;
  size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  seen_at: string | null;
};

export type ActivityLog = {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export const STORAGE_BUCKET = "client-files";
export const SIGNED_URL_EXPIRES = 180;
