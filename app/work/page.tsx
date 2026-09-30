import type { Metadata } from "next";
import SelectedWorksSection from "@/components/portfolio/SelectedWorksSection";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Trabajos — 33FILMS",
  description: "Proyectos audiovisuales seleccionados de 33FILMS.",
};

export default function WorkPage() {
  return (
    <PageTransition>
      <div className="bg-off-white pt-32">
        <SelectedWorksSection showTitle={true} />
      </div>
      <Footer />
    </PageTransition>
  );
}
