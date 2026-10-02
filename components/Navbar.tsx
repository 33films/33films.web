"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { signOutAction } from "@/app/actions/auth";

export default function Navbar({ aboutEnabled = true }: { aboutEnabled?: boolean }) {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const pathname = usePathname();
  const { dictionary } = useI18n();
  const { profile } = useAuth();
  const t = dictionary.nav;

  const publicLinks = [
    { href: "/work", label: t.work },
    ...(aboutEnabled ? [{ href: "/about", label: t.studio }] : []),
    { href: "/contact", label: t.contact },
  ];

  const authLinks =
    profile?.role === "admin"
      ? [
          { href: "/admin", label: t.admin },
          { href: "/admin/home", label: dictionary.homeAdmin.nav },
          { href: "/admin/works", label: dictionary.portfolioAdmin.nav },
          { href: "/admin/about", label: dictionary.aboutAdmin.nav },
          { href: "/admin/users", label: t.users },
          { href: "/admin/projects", label: t.projects },
          { href: "/admin/files", label: t.files },
        ]
      : profile
        ? [
            { href: "/dashboard", label: t.dashboard },
            { href: "/dashboard", label: t.projects },
            { href: "/dashboard/profile", label: t.profile },
          ]
        : [];

  const links = profile ? authLinks : publicLinks;

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setHidden(current > lastScroll && current > 100);
      setLastScroll(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/12 bg-black/45 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-2xl backdrop-saturate-150"
        initial={{ y: 0 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <nav className="flex items-center justify-between px-5 py-4 md:px-10 md:py-5">
          <Link
            href="/"
            className="text-label tracking-[0.2em] text-off-white transition-opacity hover:opacity-60"
          >
            33FILMS
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <div className="flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={`text-label transition-opacity hover:opacity-60 ${
                    pathname === link.href ? "text-off-white" : "text-off-white/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            {profile ? (
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="text-label text-off-white/70 transition-opacity hover:opacity-100"
                >
                  {t.logout}
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="text-label text-off-white/70 transition-opacity hover:opacity-100"
              >
                {t.clientLogin}
              </Link>
            )}
            <LanguageSwitcher />
          </div>

          <div className="flex items-center gap-5 lg:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative z-50 flex flex-col gap-1.5"
              aria-label="Toggle menu"
            >
              <motion.span
                className="block h-px w-6 bg-off-white"
                animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              />
              <motion.span
                className="block h-px w-6 bg-off-white"
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              />
              <motion.span
                className="block h-px w-6 bg-off-white"
                animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-between bg-black/70 px-5 py-24 backdrop-blur-2xl backdrop-saturate-150 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col gap-6">
              {links.map((link, i) => (
                <motion.div
                  key={`${link.href}-${link.label}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={link.href}
                    className="text-headline text-off-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {!profile && (
                <Link
                  href="/login"
                  className="text-headline text-off-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {t.clientLogin}
                </Link>
              )}
            </div>
            <p className="text-label text-off-white/50">MONTEVIDEO — URUGUAY</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
