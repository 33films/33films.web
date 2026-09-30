import type { Metadata } from "next";
import ContactFormPanel from "@/components/contact/ContactFormPanel";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).contact;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
  };
}

export default function ContactPage() {
  return (
    <PageTransition>
      <section className="bg-off-white px-5 pt-32 pb-32 md:px-10 md:pt-40 md:pb-48">
        <div className="mx-auto max-w-[1800px]">
          <ContactFormPanel />
        </div>
      </section>
      <Footer />
    </PageTransition>
  );
}
