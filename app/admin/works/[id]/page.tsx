import { notFound, redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/server";
import { getSelectedWorkById } from "@/lib/portfolio/queries";
import SelectedWorkForm, {
  SelectedWorkDeleteButton,
} from "@/components/admin/SelectedWorkForm";

export default async function AdminEditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const work = await getSelectedWorkById(id);
  if (!work) notFound();

  const t = (await getDictionary()).portfolioAdmin;

  return (
    <div>
      <h1 className="text-headline text-off-white">{t.editWork}</h1>
      <p className="text-label mt-3 text-gray">{work.title}</p>
      <div className="mt-12">
        <SelectedWorkForm work={work} />
        <SelectedWorkDeleteButton id={work.id} />
      </div>
    </div>
  );
}
