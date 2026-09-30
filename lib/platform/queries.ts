import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ClientProject,
  Profile,
  ProjectFile,
  ProjectFolder,
  ActivityLog,
} from "./types";
import { DEFAULT_FOLDERS } from "./types";

export type AdminFileRow = ProjectFile & {
  project_name: string | null;
  user_email: string | null;
  user_name: string | null;
  uploaded_by_email: string | null;
  uploaded_by_name: string | null;
};

function countByProject(rows: { project_id: string }[] | null) {
  const counts: Record<string, number> = {};
  for (const row of rows ?? []) {
    counts[row.project_id] = (counts[row.project_id] ?? 0) + 1;
  }
  return counts;
}

export async function getUserProjects(userId: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as ClientProject[];
  const { data } = await supabase
    .from("project_users")
    .select("projects(*)")
    .eq("user_id", userId);
  const projects = (data ?? []).flatMap((row) => {
    const value = row.projects as unknown;
    if (!value) return [];
    return (Array.isArray(value) ? value : [value]) as ClientProject[];
  });
  if (!projects.length) return projects;

  const { data: files } = await supabase
    .from("files")
    .select("project_id")
    .in(
      "project_id",
      projects.map((project) => project.id)
    );
  const counts = countByProject(files);
  return projects.map((project) => ({
    ...project,
    file_count: counts[project.id] ?? 0,
  }));
}

export async function getProjectForUser(projectId: string, userId: string, isAdmin: boolean) {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return null;
  if (!isAdmin) {
    const { data: member } = await supabase
      .from("project_users")
      .select("user_id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!member) return null;
  }
  return project as ClientProject;
}

export async function getProjectFolders(projectId: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as ProjectFolder[];
  const { data } = await supabase
    .from("project_folders")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  return (data ?? []) as ProjectFolder[];
}

export async function ensureDefaultProjectFolders(projectId: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as ProjectFolder[];

  const existing = await getProjectFolders(projectId);
  const missing = DEFAULT_FOLDERS.filter(
    (folder) => !existing.some((row) => row.slug === folder.slug)
  );

  if (missing.length) {
    await supabase.from("project_folders").insert(
      missing.map((folder) => ({
        project_id: projectId,
        slug: folder.slug,
        name: folder.name,
        sort_order: folder.sort_order,
      }))
    );
  }

  return getProjectFolders(projectId);
}

export async function getProjectFiles(projectId: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as ProjectFile[];
  const { data } = await supabase
    .from("files")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return (data ?? []) as ProjectFile[];
}

export async function getRecentFiles(userId: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as ProjectFile[];
  const { data: memberships } = await supabase
    .from("project_users")
    .select("project_id")
    .eq("user_id", userId);
  const ids = (memberships ?? []).map((m) => m.project_id);
  if (!ids.length) return [];
  const { data } = await supabase
    .from("files")
    .select("*")
    .in("project_id", ids)
    .order("created_at", { ascending: false })
    .limit(8);
  return (data ?? []) as ProjectFile[];
}

export async function getAdminStats() {
  const admin = createAdminClient();
  const supabase = admin ?? (await createServerSupabase());
  if (!supabase) {
    return {
      users: 0,
      projects: 0,
      selectedWorks: 0,
      files: 0,
      storage: 0,
      activity: [] as ActivityLog[],
    };
  }
  const [
    { count: users },
    { count: projects },
    { count: selectedWorks },
    { data: files },
    { data: activity },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("selected_works").select("*", { count: "exact", head: true }),
    supabase.from("files").select("size"),
    supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);
  const storage = (files ?? []).reduce((sum, f) => sum + Number(f.size ?? 0), 0);
  return {
    users: users ?? 0,
    projects: projects ?? 0,
    selectedWorks: selectedWorks ?? 0,
    files: files?.length ?? 0,
    storage,
    activity: (activity ?? []) as ActivityLog[],
  };
}

export async function getAllUsers() {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as Profile[];
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Profile[];
}

export async function getAllProjects() {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as ClientProject[];
  const { data } = await supabase.from("projects").select("*").order("updated_at", {
    ascending: false,
  });
  const projects = (data ?? []) as ClientProject[];
  if (!projects.length) return projects;
  const { data: files } = await supabase
    .from("files")
    .select("project_id")
    .in(
      "project_id",
      projects.map((project) => project.id)
    );
  const counts = countByProject(files);
  return projects.map((project) => ({
    ...project,
    file_count: counts[project.id] ?? 0,
  }));
}

export async function getAllFiles() {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as AdminFileRow[];
  const { data } = await supabase
    .from("files")
    .select("*")
    .order("created_at", { ascending: false });
  const files = (data ?? []) as ProjectFile[];
  if (!files.length) return [];

  const projectIds = [...new Set(files.map((file) => file.project_id))];
  const profileIds = [
    ...new Set(
      files.flatMap((file) => [file.user_id, file.uploaded_by].filter(Boolean) as string[])
    ),
  ];

  const [{ data: projects }, { data: profiles }] = await Promise.all([
    supabase.from("projects").select("id, name").in("id", projectIds),
    profileIds.length
      ? supabase.from("profiles").select("id, email, full_name").in("id", profileIds)
      : Promise.resolve({ data: [] as { id: string; email: string; full_name: string | null }[] }),
  ]);

  const projectMap = new Map((projects ?? []).map((p) => [p.id, p.name as string]));
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, { email: p.email as string, name: p.full_name as string | null }])
  );

  return files.map((file) => {
    const owner = file.user_id ? profileMap.get(file.user_id) : null;
    const uploader = profileMap.get(file.uploaded_by);
    return {
      ...file,
      project_name: projectMap.get(file.project_id) ?? null,
      user_email: owner?.email ?? null,
      user_name: owner?.name ?? null,
      uploaded_by_email: uploader?.email ?? null,
      uploaded_by_name: uploader?.name ?? null,
    };
  });
}

export async function getUserDetail(id: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data: user } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!user) return null;
  const projects = await getUserProjects(id);
  return { user: user as Profile, projects };
}

export async function getProjectMembers(projectId: string) {
  const supabase = await createServerSupabase();
  if (!supabase) return [] as string[];
  const { data } = await supabase
    .from("project_users")
    .select("user_id")
    .eq("project_id", projectId);
  return (data ?? []).map((r) => r.user_id);
}
