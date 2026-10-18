import type { Locale } from "@/lib/i18n/config";
import EmailLayout from "./components/EmailLayout";
import {
  EmailButton,
  EmailHeading,
  EmailLinkFallback,
  EmailNote,
  EmailText,
} from "./components/EmailParts";

export const authConfirmCopy: Record<
  Locale,
  {
    subject: string;
    preview: string;
    title: string;
    body: string;
    cta: string;
    fallback: string;
    ignore: string;
  }
> = {
  es: {
    subject: "33 FILMS — Confirmá tu cuenta",
    preview: "Confirmá tu email para activar tu cuenta de 33 FILMS.",
    title: "Confirmá tu cuenta",
    body: "Gracias por registrarte en el portal de 33 FILMS. Confirmá tu email para activar la cuenta y acceder a tus proyectos.",
    cta: "Confirmar email",
    fallback: "Si el botón no funciona, copiá este enlace",
    ignore: "Si no creaste esta cuenta, ignorá este email.",
  },
  pt: {
    subject: "33 FILMS — Confirme sua conta",
    preview: "Confirme seu email para ativar sua conta 33 FILMS.",
    title: "Confirme sua conta",
    body: "Obrigado por se cadastrar no portal da 33 FILMS. Confirme seu email para ativar a conta e acessar seus projetos.",
    cta: "Confirmar email",
    fallback: "Se o botão não funcionar, copie este link",
    ignore: "Se você não criou esta conta, ignore este email.",
  },
  en: {
    subject: "33 FILMS — Confirm your account",
    preview: "Confirm your email to activate your 33 FILMS account.",
    title: "Confirm your account",
    body: "Thanks for signing up to the 33 FILMS portal. Confirm your email to activate the account and access your projects.",
    cta: "Confirm email",
    fallback: "If the button doesn't work, copy this link",
    ignore: "If you didn't create this account, ignore this email.",
  },
};

export function AuthConfirmContent({ locale, confirmUrl }: { locale: Locale; confirmUrl: string }) {
  const t = authConfirmCopy[locale];
  return (
    <>
      <EmailHeading>{t.title}</EmailHeading>
      <EmailText>{t.body}</EmailText>
      <EmailButton href={confirmUrl}>{t.cta}</EmailButton>
      <EmailLinkFallback href={confirmUrl} label={t.fallback} />
      <EmailNote>{t.ignore}</EmailNote>
    </>
  );
}

export default function AuthConfirmEmail({
  locale = "es",
  confirmUrl = "https://www.by33films.com/login",
}: {
  locale?: Locale;
  confirmUrl?: string;
}) {
  return (
    <EmailLayout preview={authConfirmCopy[locale].preview} locale={locale}>
      <AuthConfirmContent locale={locale} confirmUrl={confirmUrl} />
    </EmailLayout>
  );
}
