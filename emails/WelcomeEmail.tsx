import type { Locale } from "@/lib/i18n/config";
import EmailLayout from "./components/EmailLayout";
import { EmailButton, EmailHeading, EmailNote, EmailText } from "./components/EmailParts";
import { EMAIL_SITE_URL } from "./components/theme";

export const welcomeCopy: Record<
  Locale,
  {
    subject: string;
    preview: string;
    title: (name: string) => string;
    body: string;
    detail: string;
    cta: string;
    help: string;
  }
> = {
  es: {
    subject: "33 FILMS — Bienvenido al portal",
    preview: "Tu cuenta en el portal de 33 FILMS ya está activa.",
    title: (name) => (name ? `Bienvenido, ${name}` : "Bienvenido"),
    body: "Tu cuenta en el portal de 33 FILMS ya está activa.",
    detail: "Desde tu panel vas a poder ver tus proyectos, revisar entregas y descargar archivos a medida que los compartamos.",
    cta: "Ir a mi panel",
    help: "¿Necesitás ayuda? Escribinos a produccion.33films@gmail.com.",
  },
  pt: {
    subject: "33 FILMS — Boas-vindas ao portal",
    preview: "Sua conta no portal da 33 FILMS já está ativa.",
    title: (name) => (name ? `Boas-vindas, ${name}` : "Boas-vindas"),
    body: "Sua conta no portal da 33 FILMS já está ativa.",
    detail: "No seu painel você poderá ver seus projetos, revisar entregas e baixar arquivos conforme os compartilharmos.",
    cta: "Ir para o painel",
    help: "Precisa de ajuda? Escreva para produccion.33films@gmail.com.",
  },
  en: {
    subject: "33 FILMS — Welcome to the portal",
    preview: "Your 33 FILMS portal account is now active.",
    title: (name) => (name ? `Welcome, ${name}` : "Welcome"),
    body: "Your 33 FILMS portal account is now active.",
    detail: "From your dashboard you can see your projects, review deliveries and download files as we share them.",
    cta: "Go to my dashboard",
    help: "Need help? Write to produccion.33films@gmail.com.",
  },
};

export default function WelcomeEmail({
  locale = "es",
  name = "",
}: {
  locale?: Locale;
  name?: string;
}) {
  const t = welcomeCopy[locale];
  return (
    <EmailLayout preview={t.preview} locale={locale}>
      <EmailHeading>{t.title(name)}</EmailHeading>
      <EmailText>{t.body}</EmailText>
      <EmailText>{t.detail}</EmailText>
      <EmailButton href={`${EMAIL_SITE_URL}/dashboard`}>{t.cta}</EmailButton>
      <EmailNote>{t.help}</EmailNote>
    </EmailLayout>
  );
}
