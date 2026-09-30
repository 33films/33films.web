"use client";

import { services } from "@/data/services";
import Reveal from "./Reveal";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function Services() {
  const { dictionary } = useI18n();
  const t = dictionary.services;

  return (
    <section id="services" className="bg-off-white px-5 pb-24 md:px-10 md:pb-40">
      <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        <div className="border-t border-black/10 md:col-span-7 md:order-first">
          {services.map((service, index) => {
            const copy = t.items[service.id];

            return (
              <Reveal key={service.number} delay={index * 0.04}>
                <article className="flex items-baseline gap-4 border-b border-black/10 py-3.5 md:gap-5 md:py-4">
                  <span className="text-label w-6 shrink-0 text-black/35">
                    {service.number}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[0.78rem] tracking-[0.14em] text-black uppercase md:text-[0.84rem]">
                      {copy.title}
                    </h3>
                    <p className="mt-1 text-[0.68rem] leading-snug tracking-[0.04em] text-black/40">
                      {copy.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="order-first md:order-none md:col-span-4 md:col-start-9">
          <h2 className="text-headline text-black md:sticky md:top-32">
            {t.titleA}
            <br />
            {t.titleB}
          </h2>
        </Reveal>
      </div>
    </section>
  );
}
