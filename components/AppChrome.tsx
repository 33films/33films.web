"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

const PRIVATE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/admin",
];

export default function AppChrome({
  children,
  aboutEnabled = true,
}: {
  children: React.ReactNode;
  aboutEnabled?: boolean;
}) {
  const pathname = usePathname();
  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (pathname === "/reset-password") return;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (hash.get("type") !== "recovery" || !hash.get("access_token")) return;
    window.location.replace(
      `/reset-password${window.location.search}${window.location.hash}`
    );
  }, [pathname]);

  useEffect(() => {
    if (!isPrivate) return;
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.scrollTop = 0;
    document.body.scrollTop = 0;
    html.style.scrollBehavior = previous;
  }, [pathname, isPrivate]);

  if (isPrivate) {
    return <div className="h-dvh overflow-y-auto bg-black">{children}</div>;
  }

  return (
    <>
      <Navbar aboutEnabled={aboutEnabled} />
      {children}
    </>
  );
}
