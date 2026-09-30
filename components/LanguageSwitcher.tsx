"use client";

import { useEffect, useRef, useState } from "react";
import { locales, localeLabels, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function LanguageSwitcher({
  inverted = false,
  blend = false,
}: {
  inverted?: boolean;
  blend?: boolean;
}) {
  const { locale, setLocale, dictionary } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const text = inverted ? "text-black" : "text-off-white";
  const border = inverted ? "border-black/20" : "border-off-white/20";
  const hover = inverted ? "hover:bg-black/5" : "hover:bg-off-white/10";
  const menuText = inverted ? "text-black" : "text-off-white";
  const menuBg = inverted ? "bg-off-white" : "bg-dark";

  return (
    <div className="relative z-[70]" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`text-label flex items-center gap-2 ${text} ${blend ? "mix-blend-difference" : ""} transition-opacity hover:opacity-60`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={dictionary.nav.language}
      >
        {locale.toUpperCase()}
        <span className="text-[0.55rem] opacity-70">▾</span>
      </button>
      {open && (
        <div
          className={`absolute right-0 top-full z-[80] mt-3 min-w-[10.5rem] border ${border} ${
            inverted ? menuBg : "bg-black/50 backdrop-blur-xl"
          } py-2`}
          role="listbox"
        >
          {locales.map((code: Locale) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={code === locale}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
              className={`text-label flex w-full items-center justify-between px-4 py-2 text-left ${menuText} ${hover} ${
                code === locale ? "opacity-100" : "opacity-60"
              }`}
            >
              <span>{code.toUpperCase()}</span>
              <span className="normal-case tracking-normal opacity-70">
                {localeLabels[code]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
