"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ContactForm from "./ContactForm";
import Reveal from "@/components/Reveal";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import { SOCIAL_LINKS } from "@/lib/social";
import { CONTACT_EMAIL } from "@/lib/contact";

export default function ContactFormPanel() {
  const { dictionary } = useI18n();
  const t = dictionary.contact;
  const [open, setOpen] = useState(false);

  return (
    <div className="grid-editorial">
      <Reveal className="col-span-4 md:col-span-6">
        <h1 className="text-headline text-black md:text-display">
          {t.titleA}
          <br />
          {t.titleB}
        </h1>
        <p className="text-subhead mt-8 text-black">{t.talk}</p>
        <div className="mt-10 flex flex-wrap gap-4">
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
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="contact-form-panel"
            className={`text-label border px-8 py-4 transition-colors ${
              open
                ? "border-black bg-black text-off-white"
                : "border-black bg-transparent text-black hover:bg-black hover:text-off-white"
            }`}
          >
            {open ? t.formClose : t.formToggle}
          </button>
        </div>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-label mt-8 block text-black/40 transition-opacity hover:opacity-60"
        >
          {CONTACT_EMAIL}
        </a>
      </Reveal>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id="contact-form-panel"
            key="contact-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="col-span-4 overflow-hidden md:col-span-5 md:col-start-8"
          >
            <motion.div
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              exit={{ y: 16 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-16 md:mt-4"
            >
              <ContactForm />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
