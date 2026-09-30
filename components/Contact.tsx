"use client";

import Reveal from "./Reveal";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { SOCIAL_LINKS } from "@/lib/social";
import { CONTACT_EMAIL } from "@/lib/contact";

export default function Contact() {
  const { dictionary } = useI18n();
  const t = dictionary.contact;

  return (
    <section id="contact" className="bg-off-white px-5 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-[1800px]">
        <Reveal className="max-w-3xl">
          <h2 className="text-headline text-black">
            {t.titleA}
            <br />
            {t.titleB}
          </h2>
          <p className="text-subhead mt-8 text-black">{t.talk}</p>
          <div className="mt-12 flex flex-wrap gap-4">
            <a
              href={SOCIAL_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label inline-block border border-black px-8 py-4 text-black transition-colors hover:bg-black hover:text-off-white"
            >
              {t.whatsapp}
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label inline-block border border-black px-8 py-4 text-black transition-colors hover:bg-black hover:text-off-white"
            >
              {t.instagram}
            </a>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-label mt-8 block text-black/40 transition-opacity hover:opacity-60"
          >
            {CONTACT_EMAIL}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
