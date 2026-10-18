import type { Locale } from "@/lib/i18n/config";
import EmailLayout from "./components/EmailLayout";
import {
  EmailButton,
  EmailHeading,
  EmailLinkFallback,
  EmailNote,
  EmailText,
} from "./components/EmailParts";

export const passwordResetCopy: Record<
  Locale,
  {
    subject: string;
    preview: string;
    title: string;
    body: string;
    cta: string;
    fallback: string;
    expiry: string;
    ignore: string;
  }
> = {
  es: {
    subject: "33 FILMS — Recuperar contraseña",
    preview: "Usá este enlace para crear una nueva contraseña.",
    title: "Recuperar contraseña",
    body: "Recibimos un pedido para cambiar la contraseña de tu cuenta de 33 FILMS. Hacé clic en el botón para elegir una nueva.",
    cta: "Cambiar contraseña",
    fallback: "Si el botón no funciona, copiá este enlace",
    expiry: "Por seguridad, el enlace vence en una hora y se puede usar una sola vez.",
    ignore: "Si no pediste este cambio, ignorá este email. Tu contraseña actual sigue funcionando.",
  },
  pt: {
    subject: "33 FILMS — Recuperar senha",
    preview: "Use este link para criar uma nova senha.",
    title: "Recuperar senha",
    body: "Recebemos um pedido para alterar a senha da sua conta 33 FILMS. Clique no botão para escolher uma nova.",
    cta: "Alterar senha",
    fallback: "Se o botão não funcionar, copie este link",
    expiry: "Por segurança, o link expira em uma hora e só pode ser usado uma vez.",
    ignore: "Se você não pediu esta alteração, ignore este email. Sua senha atual continua funcionando.",
  },
  en: {
    subject: "33 FILMS — Recover your password",
    preview: "Use this link to create a new password.",
    title: "Recover your password",
    body: "We received a request to change the password for your 33 FILMS account. Click the button to choose a new one.",
    cta: "Change password",
    fallback: "If the button doesn't work, copy this link",
    expiry: "For security, the link expires in one hour and can only be used once.",
    ignore: "If you didn't request this, ignore this email. Your current password still works.",
  },
};

export function PasswordResetContent({ locale, resetUrl }: { locale: Locale; resetUrl: string }) {
  const t = passwordResetCopy[locale];
  return (
    <>
      <EmailHeading>{t.title}</EmailHeading>
      <EmailText>{t.body}</EmailText>
      <EmailButton href={resetUrl}>{t.cta}</EmailButton>
      <EmailLinkFallback href={resetUrl} label={t.fallback} />
      <EmailNote>{t.expiry}</EmailNote>
      <EmailNote>{t.ignore}</EmailNote>
    </>
  );
}

export default function PasswordResetEmail({
  locale = "es",
  resetUrl = "https://www.by33films.com/reset-password",
}: {
  locale?: Locale;
  resetUrl?: string;
}) {
  return (
    <EmailLayout preview={passwordResetCopy[locale].preview} locale={locale}>
      <PasswordResetContent locale={locale} resetUrl={resetUrl} />
    </EmailLayout>
  );
}
