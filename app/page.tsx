import Hero from "@/components/Hero";
import SelectedWorksSection from "@/components/portfolio/SelectedWorksSection";
import Studio from "@/components/Studio";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getPublicAbout } from "@/lib/about/queries";
import { getHeroVideo } from "@/lib/home/queries";

export default async function Home() {
  const [{ enabled, members }, heroVideo] = await Promise.all([
    getPublicAbout(),
    getHeroVideo(),
  ]);

  return (
    <>
      <Hero video={heroVideo} />
      <SelectedWorksSection limit={6} />
      {enabled ? <Studio members={members} /> : null}
      <Contact />
      <Footer />
    </>
  );
}
