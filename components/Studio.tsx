"use client";

import Image from "next/image";
import Reveal from "./Reveal";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import type { AboutMemberPublic } from "@/lib/about/types";

export default function Studio({ members }: { members: AboutMemberPublic[] }) {
  const { dictionary } = useI18n();
  const t = dictionary.studio;

  if (members.length === 0) return null;

  return (
    <section id="about" className="bg-black px-5 py-24 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1800px]">
        <div className="grid-editorial">
          <Reveal className="col-span-4 md:col-span-5 lg:col-span-4">
            <h2 className="text-headline text-off-white">
              {t.titleA}
              <br />
              {t.titleB}
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 md:mt-24 md:grid-cols-3 md:gap-8 lg:gap-16">
          {members.map((member, index) => (
            <Reveal
              key={member.id}
              delay={0.1 + index * 0.08}
              className="flex flex-col items-center text-center"
            >
              <div className="relative aspect-square w-40 overflow-hidden rounded-full bg-dark md:w-48 lg:w-56">
                {member.photo_url ? (
                  <Image
                    src={member.photo_url}
                    alt={member.name}
                    fill
                    draggable={false}
                    className="pointer-events-none object-cover select-none"
                    sizes="(max-width: 768px) 160px, 224px"
                  />
                ) : null}
              </div>
              <p className="text-label mt-6 text-off-white">{member.name}</p>
              <p className="text-label mt-2 text-gray">{member.role}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
