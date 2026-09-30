import Link from "next/link";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <div className="flex min-h-screen flex-col items-start justify-center bg-black px-5 md:px-10">
        <p className="text-label text-gray">404</p>
        <h1 className="text-headline mt-4 text-off-white">PAGE NOT FOUND</h1>
        <Link
          href="/"
          className="text-label mt-8 border border-off-white/20 px-8 py-4 text-off-white transition-colors hover:bg-off-white hover:text-black"
        >
          BACK TO HOME →
        </Link>
      </div>
      <Footer />
    </>
  );
}
