import { redirect } from "next/navigation";
import PlatformNav from "@/components/platform/PlatformNav";
import ProfileAccessError from "@/components/platform/ProfileAccessError";
import { getAuthUser, isAdminRole } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getAuthUser();
  if (!user) redirect("/login");
  if (!profile) {
    return (
      <div className="min-h-screen bg-black">
        <ProfileAccessError />
      </div>
    );
  }
  if (!isAdminRole(profile.role)) redirect("/dashboard");

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-black md:flex-row">
      <PlatformNav variant="admin" name={profile.full_name || profile.email} />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-10 md:px-10 md:py-12">
        {children}
      </div>
    </div>
  );
}
