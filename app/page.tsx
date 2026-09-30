import Hero from "@/components/Hero";
import SelectedWorksSection from "@/components/portfolio/SelectedWorksSection";
import Studio from "@/components/Studio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getPublicAbout } from "@/lib/about/queries";

export default async function Home() {
  const { enabled, members } = await getPublicAbout();

  return (
    <>
      <Hero />
      <SelectedWorksSection limit={6} />
      {enabled ? <Studio members={members} /> : null}
      <Contact />
      <Footer />
    </>
  );
}
