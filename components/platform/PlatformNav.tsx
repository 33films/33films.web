"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { signOutAction } from "@/app/actions/auth";

export default function PlatformNav({
  variant,
  name,
  showAdminLinks = false,
}: {
  variant: "user" | "admin";
  name?: string | null;
  showAdminLinks?: boolean;
}) {
  const pathname = usePathname();
  const { dictionary } = useI18n();
  const t = dictionary.nav;

  const userLinks = [
    { href: "/dashboard", label: t.dashboard },
    { href: "/dashboard/profile", label: t.profile },
  ];

  const adminOnlyLinks = [
    { href: "/admin", label: t.admin },
    { href: "/admin/works", label: dictionary.portfolioAdmin.nav },
    { href: "/admin/about", label: dictionary.aboutAdmin.nav },
  ];

  const fullAdminLinks = [
    { href: "/admin", label: dictionary.admin.dashboard },
    { href: "/admin/users", label: dictionary.admin.users },
    { href: "/admin/projects", label: dictionary.admin.projects },
    { href: "/admin/files", label: dictionary.admin.files },
    { href: "/admin/works", label: dictionary.portfolioAdmin.nav },
    { href: "/admin/about", label: dictionary.aboutAdmin.nav },
    { href: "/admin/settings", label: dictionary.admin.settings },
  ];

  const links =
    variant === "admin"
      ? fullAdminLinks
      : showAdminLinks
        ? [...userLinks, ...adminOnlyLinks]
        : userLinks;

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-off-white/10 bg-black px-5 py-6 md:h-screen md:w-64 md:border-b-0 md:border-r lg:w-72 lg:px-8">
      <div>
        <Link href="/" className="text-label tracking-[0.2em] text-off-white">
          33FILMS
        </Link>
        {name && <p className="text-label mt-6 text-gray">{name}</p>}
        <nav className="mt-10 flex flex-wrap gap-4 md:flex-col md:gap-5">
          {variant === "user" && showAdminLinks && (
            <>
              {userLinks.map((link) => (
                <NavLink key={link.href} link={link} pathname={pathname} />
              ))}
              <p className="text-label mt-4 text-gray md:mt-6">{t.admin}</p>
              {adminOnlyLinks.map((link) => (
                <NavLink key={link.href} link={link} pathname={pathname} />
              ))}
            </>
          )}
          {(variant === "admin" || !showAdminLinks) &&
            links.map((link) => (
              <NavLink key={link.href} link={link} pathname={pathname} />
            ))}
        </nav>
      </div>
      <div className="mt-8 flex items-center justify-between gap-4 md:mt-0">
        <LanguageSwitcher />
        <form action={signOutAction}>
          <button type="submit" className="text-label text-gray">
            {t.logout}
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavLink({
  link,
  pathname,
}: {
  link: { href: string; label: string };
  pathname: string;
}) {
  const active =
    pathname === link.href ||
    (link.href !== "/admin" &&
      link.href !== "/dashboard" &&
      pathname.startsWith(`${link.href}/`));

  return (
    <Link
      href={link.href}
      className={`text-label transition-opacity hover:opacity-60 ${
        active ? "text-off-white" : "text-gray"
      }`}
    >
      {link.label}
    </Link>
  );
}
