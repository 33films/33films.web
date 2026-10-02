"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { vimeoBackgroundSrc } from "@/lib/portfolio/vimeo";
import type { HeroVideo } from "@/lib/home/types";

const LOGO_SRC = "/images/Logowhite.svg";

export default function Hero({ video }: { video: HeroVideo | null }) {
  const { dictionary } = useI18n();
  const t = dictionary.hero;

  return (
    <section className="relative isolate h-screen w-full overflow-hidden bg-black">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {!video ? null : video.kind === "vimeo" ? (
          <HeroVimeo vimeoId={video.vimeoId} />
        ) : (
          <video
            key={video.src}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={video.src} />
          </video>
        )}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <div className="absolute bottom-16 left-5 z-10 flex max-w-xs flex-col items-start md:bottom-20 md:left-10">
        <h1 className="mb-4 w-2/3">
          <img
            src={LOGO_SRC}
            alt="33 FILMS"
            draggable={false}
            className="pointer-events-none h-auto w-full object-contain select-none"
          />
        </h1>
        <div className="w-full">
          <p className="text-label text-off-white/80">
            {t.taglineA}
            <br />
            {t.taglineB}
          </p>
          <p className="text-label mt-3 text-off-white/55">{t.disciplines}</p>
        </div>
      </div>

      <div className="absolute top-28 right-5 z-10 md:top-32 md:right-10">
        <p className="text-label text-right text-off-white/70">
          {t.location}
        </p>
      </div>

      <div className="absolute right-5 bottom-8 z-10 md:right-10 md:bottom-10">
        <p className="text-label text-off-white/55">{t.scroll}</p>
      </div>
    </section>
  );
}

function HeroVimeo({ vimeoId }: { vimeoId: string }) {
  const [loaded, setLoaded] = useState(false);
  const src = vimeoBackgroundSrc(vimeoId);
  if (!src) return null;

  return (
    <iframe
      src={src}
      title="33FILMS"
      tabIndex={-1}
      aria-hidden="true"
      allow="autoplay; fullscreen; picture-in-picture"
      onLoad={() => window.setTimeout(() => setLoaded(true), 600)}
      className={`pointer-events-none absolute top-1/2 left-1/2 h-[max(100vh,56.25vw)] w-[max(100vw,177.78vh)] -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-1000 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
