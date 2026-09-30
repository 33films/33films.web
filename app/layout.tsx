import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import AppChrome from "@/components/AppChrome";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { getAboutEnabled } from "@/lib/about/queries";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    openGraph: {
      title: dictionary.meta.title,
      description: dictionary.meta.description,
      type: "website",
      locale: "es_UY",
      siteName: "33FILMS",
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.meta.title,
      description: dictionary.meta.description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const aboutEnabled = await getAboutEnabled();

  return (
    <html lang={locale} className={`${geist.variable} ${jetbrainsMono.variable}`}>
      <body className={`${geist.className} antialiased`}>
        <LanguageProvider initialLocale={locale}>
          <AuthProvider>
            <AppChrome aboutEnabled={aboutEnabled}>{children}</AppChrome>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
