"use client";

import { processSteps } from "@/data/services";
import Reveal from "./Reveal";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function Process() {
  const { dictionary } = useI18n();
  const t = dictionary.process;

  return (
    <section className="bg-off-white px-5 py-24 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1800px]">
        <Reveal className="mb-16 md:mb-24">
          <h2 className="text-headline text-black">
            {t.titleA}
            <br />
            {t.titleB}
          </h2>
        </Reveal>

        <div className="hidden md:block">
          <div className="editorial-line mb-12 w-full text-black" />
          <div className="grid grid-cols-5 gap-8">
            {processSteps.map((step, index) => (
              <Reveal key={step.number} delay={index * 0.08}>
                <div>
                  <span className="text-label text-black/40">{step.number}</span>
                  <h3 className="text-label mt-4 text-black">
                    {t.steps[step.id].title}
                  </h3>
                  <p className="text-body mt-3 text-black/50">
                    {t.steps[step.id].description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-10 md:hidden">
          {processSteps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.08}>
              <div className="flex gap-6 border-t border-black/10 pt-8">
                <span className="text-label shrink-0 text-black/40">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-label text-black">{t.steps[step.id].title}</h3>
                  <p className="text-body mt-2 text-black/50">
                    {t.steps[step.id].description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
