import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";

export default async function ProjectToolNav({
  projectId,
  projectName,
  active,
}: {
  projectId: string;
  projectName: string;
  active: "brief" | "storyboard";
}) {
  const dictionary = await getDictionary();
  const tabs = [
    { key: "brief" as const, href: `/admin/projects/${projectId}/brief` },
    { key: "storyboard" as const, href: `/admin/projects/${projectId}/storyboard` },
  ];

  return (
    <div className="tool-page-chrome flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-off-white/10 px-5 py-4 md:px-10">
      <Link
        href={`/admin/projects/${projectId}`}
        className="text-label text-gray transition-opacity hover:opacity-60"
      >
        ← {projectName}
      </Link>
      <nav className="flex items-center gap-6">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            className={`text-label border-b pb-1 transition-colors ${
              active === tab.key
                ? "border-off-white text-off-white"
                : "border-transparent text-gray hover:text-off-white"
            }`}
          >
            {dictionary.portal.folders[tab.key]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
