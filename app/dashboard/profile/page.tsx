import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/session";
import { getDictionary } from "@/lib/i18n/server";
import ProfileForm from "@/components/platform/ProfileForm";

export default async function ProfilePage() {
  const { profile } = await getAuthUser();
  if (!profile) redirect("/login");
  const t = (await getDictionary()).portal;

  return (
    <div className="max-w-xl">
      <h1 className="text-headline text-off-white">{t.profile}</h1>
      <ProfileForm
        fullName={profile.full_name ?? ""}
        email={profile.email}
        company={profile.company ?? ""}
        avatarUrl={profile.avatar_url ?? ""}
      />
    </div>
  );
}
