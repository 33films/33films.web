"use client";

import { useState } from "react";
import Link from "next/link";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import WorkDetailModal from "@/components/portfolio/WorkDetailModal";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { SelectedWorkPublic } from "@/lib/portfolio/types";

interface ProjectGridProps {
  works: SelectedWorkPublic[];
  limit?: number;
  showTitle?: boolean;
}

export default function ProjectGrid({
  works,
  limit,
  showTitle = true,
}: ProjectGridProps) {
  const { dictionary } = useI18n();
  const t = dictionary.work;
  const [active, setActive] = useState<SelectedWorkPublic | null>(null);
  const displayWorks = limit ? works.slice(0, limit) : works;

  return (
    <section id="work" className="bg-off-white px-5 py-24 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1800px]">
        {showTitle && (
          <Reveal className="mb-12 md:mb-16">
            <div className="flex items-end justify-between">
              <h2 className="text-headline text-black">
                {t.selectedA}
                <br />
                {t.selectedB}
              </h2>
              {limit ? (
                <Link
                  href="/work"
                  className="text-label hidden text-black/40 transition-opacity hover:opacity-60 md:block"
                >
                  {t.viewAll}
                </Link>
              ) : null}
            </div>
          </Reveal>
        )}

        {displayWorks.length === 0 ? (
          <p className="text-body text-black/40">{t.emptySelected}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
            {displayWorks.map((work, index) => (
              <ProjectCard
                key={work.id}
                work={work}
                index={index}
                onOpen={setActive}
              />
            ))}
          </div>
        )}

        {limit && displayWorks.length > 0 && (
          <Reveal className="mt-16 text-center md:mt-20">
            <Link
              href="/work"
              className="text-label inline-block border border-black px-8 py-4 text-black transition-colors hover:bg-black hover:text-off-white"
            >
              {t.viewAllProjects}
            </Link>
          </Reveal>
        )}
      </div>

      {active && <WorkDetailModal work={active} onClose={() => setActive(null)} />}
    </section>
  );
}
