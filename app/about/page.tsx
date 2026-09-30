import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Reveal from "@/components/Reveal";
import { getPublicAbout } from "@/lib/about/queries";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).studio;
  return {
    title: t.metaTitle,
  };
}

export default async function AboutPage() {
  const { enabled, members } = await getPublicAbout();
  if (!enabled) notFound();

  const t = (await getDictionary()).studio;

  return (
    <PageTransition>
      <div className="bg-black pt-32">
        <section className="px-5 pb-20 md:px-10 md:pb-32">
          <div className="mx-auto max-w-[1800px]">
            <Reveal>
              <h1 className="text-headline text-off-white">
                {t.titleA}
                <br />
                {t.titleB}
              </h1>
            </Reveal>

            <div className="mt-20 grid grid-cols-1 gap-12 md:mt-28 md:grid-cols-3 md:gap-8 lg:gap-16">
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
      </div>
      <Process />
      <Services />
      <Footer />
    </PageTransition>
  );
}
