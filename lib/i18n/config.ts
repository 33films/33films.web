export const locales = ["es", "pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";
export const localeCookie = "locale";

export const localeLabels: Record<Locale, string> = {
  es: "Español",
  pt: "Português",
  en: "English",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && locales.includes(value as Locale);
}
