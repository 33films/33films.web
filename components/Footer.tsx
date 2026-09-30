"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { SOCIAL_LINKS } from "@/lib/social";

export default function Footer() {
  const { dictionary } = useI18n();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1800px]">
        <div className="grid-editorial">
          <div className="col-span-4 md:col-span-3">
            <Link
              href="/"
              aria-label="33FILMS"
              className="inline-block transition-opacity hover:opacity-60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Logowhite.svg"
                alt="33 FILMS"
                draggable={false}
                className="pointer-events-none h-auto w-40 object-contain select-none md:w-52"
              />
            </Link>
            <div className="mt-8 space-y-1">
              <p className="text-label text-gray">MONTEVIDEO</p>
              <p className="text-label text-gray">URUGUAY</p>
            </div>
          </div>

          <div className="col-span-4 mt-10 md:col-span-3 md:mt-0">
            <div className="flex flex-col gap-2">
              {["FILM", "COMMERCIAL", "MUSIC", "POST", "DIGITAL"].map((item) => (
                <span key={item} className="text-label text-gray">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-4 mt-10 md:col-span-3 md:mt-0">
            <div className="flex flex-col gap-2">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-label text-gray transition-opacity hover:opacity-60"
              >
                Instagram
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-label text-gray transition-opacity hover:opacity-60"
              >
                WhatsApp
              </a>
              <a
                href="#"
                className="text-label text-gray transition-opacity hover:opacity-60"
              >
                Vimeo
              </a>
            </div>
          </div>

          <div className="col-span-4 mt-10 flex items-end justify-between md:col-span-3 md:mt-0">
            <p className="text-label text-gray/50">© 2026 33FILMS</p>
            <button
              onClick={scrollToTop}
              className="text-label text-gray transition-opacity hover:opacity-60"
            >
              {dictionary.footer.back}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
