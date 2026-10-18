import type { Locale } from "@/lib/i18n/config";
import EmailLayout from "./components/EmailLayout";
import { EmailButton, EmailHeading, EmailNote, EmailText } from "./components/EmailParts";
import { EMAIL_SITE_URL } from "./components/theme";

export const passwordChangedCopy: Record<
  Locale,
  {
    subject: string;
    preview: string;
    title: string;
    body: string;
    cta: string;
    warning: string;
  }
> = {
  es: {
    subject: "33 FILMS — Tu contraseña se modificó",
    preview: "La contraseña de tu cuenta de 33 FILMS se cambió.",
    title: "Tu contraseña se modificó",
    body: "La contraseña de tu cuenta de 33 FILMS se cambió correctamente. Ya podés iniciar sesión con la nueva.",
    cta: "Iniciar sesión",
    warning: "Si no hiciste este cambio, restablecé tu contraseña ahora desde el login y escribinos a produccion.33films@gmail.com.",
  },
  pt: {
    subject: "33 FILMS — Sua senha foi alterada",
    preview: "A senha da sua conta 33 FILMS foi alterada.",
    title: "Sua senha foi alterada",
    body: "A senha da sua conta 33 FILMS foi alterada com sucesso. Você já pode entrar com a nova.",
    cta: "Entrar",
    warning: "Se você não fez esta alteração, redefina sua senha agora pelo login e escreva para produccion.33films@gmail.com.",
  },
  en: {
    subject: "33 FILMS — Your password was changed",
    preview: "The password for your 33 FILMS account was changed.",
    title: "Your password was changed",
    body: "The password for your 33 FILMS account was changed successfully. You can now sign in with the new one.",
    cta: "Sign in",
    warning: "If you didn't make this change, reset your password now from the login page and write to produccion.33films@gmail.com.",
  },
};

export function PasswordChangedContent({ locale }: { locale: Locale }) {
  const t = passwordChangedCopy[locale];
  return (
    <>
      <EmailHeading>{t.title}</EmailHeading>
      <EmailText>{t.body}</EmailText>
      <EmailButton href={`${EMAIL_SITE_URL}/login`}>{t.cta}</EmailButton>
      <EmailNote>{t.warning}</EmailNote>
    </>
  );
}

export default function PasswordChangedEmail({ locale = "es" }: { locale?: Locale }) {
  return (
    <EmailLayout preview={passwordChangedCopy[locale].preview} locale={locale}>
      <PasswordChangedContent locale={locale} />
    </EmailLayout>
  );
}
