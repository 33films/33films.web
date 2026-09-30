import Script from "next/script";
import { notFound, redirect } from "next/navigation";
import ProjectToolNav from "@/components/platform/ProjectToolNav";
import { getAuthUser } from "@/lib/auth/session";
import { ensureDefaultProjectFolders, getProjectForUser } from "@/lib/platform/queries";

export default async function ProjectBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const project = await getProjectForUser(id, profile.id, true);
  if (!project) notFound();
  await ensureDefaultProjectFolders(id);

  return (
    <div className="-mx-5 -my-10 min-h-full bg-black md:-mx-10 md:-my-12">
      <link rel="stylesheet" href="/brief/brief.css?v=20260922r" />
      <ProjectToolNav
        projectId={project.id}
        projectName={project.name}
        active="brief"
      />
      <div
        id="brief-app"
        data-project-id={project.id}
        data-project-name={project.name}
      />
      <Script src="/brief/brief.js?v=20260922r" strategy="afterInteractive" />
    </div>
  );
}
