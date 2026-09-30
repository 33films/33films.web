import { getPublishedSelectedWorks } from "@/lib/portfolio/queries";
import ProjectGrid from "@/components/ProjectGrid";

export default async function SelectedWorksSection({
  limit,
  showTitle = true,
}: {
  limit?: number;
  showTitle?: boolean;
}) {
  const works = await getPublishedSelectedWorks(limit);
  return <ProjectGrid works={works} limit={limit} showTitle={showTitle} />;
}
