"use client";

import { type ReactNode } from "react";

export default function ImageReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return <div className={`overflow-hidden ${className}`}>{children}</div>;
}
