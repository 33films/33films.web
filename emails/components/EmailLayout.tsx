import type { ReactNode } from "react";
import { Body, Container, Head, Hr, Html, Img, Link, Preview, Text } from "react-email";
import type { Locale } from "@/lib/i18n/config";
import { EMAIL_LOGO_URL, EMAIL_SITE_URL, emailStyles } from "./theme";

const TAGLINE = "Creative Direction / Film / Visual Experiences";

export function EmailDocument({
  preview,
  lang = "es",
  children,
}: {
  preview: string;
  lang?: string;
  children: ReactNode;
}) {
  return (
    <Html lang={lang}>
      <Head />
      <Body style={emailStyles.body}>
        <Preview>{preview}</Preview>
        {children}
      </Body>
    </Html>
  );
}

export function EmailFrame({ children }: { children: ReactNode }) {
  return (
    <Container style={emailStyles.container}>
      <Img src={EMAIL_LOGO_URL} alt="33 FILMS" width="96" style={emailStyles.logo} />
      <Hr style={emailStyles.hr} />
      {children}
      <Hr style={{ ...emailStyles.hr, marginTop: "48px" }} />
      <Text style={emailStyles.footer}>33 FILMS</Text>
      <Text style={emailStyles.footerMuted}>{TAGLINE}</Text>
      <Text style={{ ...emailStyles.footerMuted, marginTop: "4px" }}>
        <Link href={EMAIL_SITE_URL} style={{ color: "inherit", textDecoration: "none" }}>
          by33films.com
        </Link>
      </Text>
    </Container>
  );
}

export default function EmailLayout({
  preview,
  locale,
  children,
}: {
  preview: string;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <EmailDocument preview={preview} lang={locale}>
      <EmailFrame>{children}</EmailFrame>
    </EmailDocument>
  );
}
