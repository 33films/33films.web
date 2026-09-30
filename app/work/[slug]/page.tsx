import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, getProjectBySlug, getNextProject } from "@/data/projects";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { getDictionary } from "@/lib/i18n/server";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project — 33FILMS" };

  return {
    title: `${project.title} — 33FILMS`,
    description: project.description,
    openGraph: {
      title: `${project.title} — 33FILMS`,
      description: project.description,
      images: [{ url: project.heroImage }],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const nextProject = getNextProject(slug);
  const t = (await getDictionary()).work;

  return (
    <PageTransition>
      <article className="bg-black">
        {/* Header */}
        <header className="px-5 pt-32 pb-12 md:px-10 md:pt-40 md:pb-20">
          <div className="mx-auto max-w-[1800px]">
            <div className="grid-editorial">
              <div className="col-span-4 md:col-span-8">
                <span className="text-label text-gray">{project.number}</span>
                <h1 className="text-display mt-4 text-off-white">
                  {project.title}
                </h1>
              </div>

              <div className="col-span-4 mt-10 md:col-span-3 md:col-start-10 md:mt-16">
                <dl className="space-y-4">
                  {[
                    { label: t.year, value: project.year },
                    { label: t.client, value: project.client },
                    { label: t.director, value: project.director },
                    { label: t.production, value: project.production },
                    { label: t.category, value: project.category },
                  ].map((item) => (
                    <div key={item.label}>
                      <dt className="text-label text-gray">{item.label}</dt>
                      <dd className="text-label mt-1 text-off-white">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </header>

        {/* Video / Image Hero */}
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-dark">
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center border border-off-white/40">
              <span className="text-label text-off-white">{t.play}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="px-5 py-20 md:px-10 md:py-32">
          <div className="mx-auto max-w-[1800px]">
            <div className="grid-editorial">
              <p className="text-body col-span-4 md:col-span-6 md:col-start-4 text-gray">
                {project.description}
              </p>
            </div>
          </div>
        </section>

        {/* Credits */}
        <section className="border-t border-off-white/10 px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-[1800px]">
            <h2 className="text-label mb-8 text-gray">{t.credits}</h2>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { role: t.director, name: project.director },
                { role: t.production, name: project.production },
                { role: t.client, name: project.client },
                { role: t.category, name: project.category },
              ].map((credit) => (
                <div key={credit.role}>
                  <p className="text-label text-gray">{credit.role}</p>
                  <p className="text-label mt-2 text-off-white">{credit.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="px-5 pb-20 md:px-10 md:pb-32">
          <div className="mx-auto max-w-[1800px]">
            <div className="flex flex-col gap-4 md:gap-6">
              {project.gallery.map((image, index) => (
                <div
                  key={index}
                  className={`image-mask relative overflow-hidden bg-dark ${
                    index % 2 === 0
                      ? "aspect-[16/9] w-full"
                      : "aspect-[4/5] w-full md:w-2/3 md:ml-auto"
                  }`}
                  data-cursor="view"
                >
                  <Image
                    src={image}
                    alt={`${project.title} — frame ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes={
                      index % 2 === 0 ? "100vw" : "(max-width: 768px) 100vw, 66vw"
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Next Project */}
        {nextProject && (
          <section className="border-t border-off-white/10 px-5 py-20 md:px-10 md:py-32">
            <div className="mx-auto max-w-[1800px]">
              <Link
                href={`/work/${nextProject.slug}`}
                className="group block"
                data-cursor="view"
              >
                <p className="text-label text-gray">{t.next}</p>
                <h2 className="text-headline mt-4 text-off-white transition-opacity group-hover:opacity-60">
                  {nextProject.title}
                </h2>
                <p className="text-label mt-2 text-gray">
                  {nextProject.category} — {nextProject.year}
                </p>
              </Link>
            </div>
          </section>
        )}
      </article>
      <Footer />
    </PageTransition>
  );
}
