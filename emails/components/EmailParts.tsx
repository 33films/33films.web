import type { ReactNode } from "react";
import { Button, Link, Section, Text } from "react-email";
import { emailStyles } from "./theme";

export function EmailHeading({ children }: { children: ReactNode }) {
  return <Text style={emailStyles.title}>{children}</Text>;
}

export function EmailText({ children }: { children: ReactNode }) {
  return <Text style={emailStyles.text}>{children}</Text>;
}

export function EmailLabel({ children }: { children: ReactNode }) {
  return <Text style={emailStyles.label}>{children}</Text>;
}

export function EmailNote({ children }: { children: ReactNode }) {
  return <Text style={emailStyles.note}>{children}</Text>;
}

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Section style={{ margin: "8px 0 32px" }}>
      <Button href={href} style={emailStyles.button}>
        {children}
      </Button>
    </Section>
  );
}

export function EmailLinkFallback({ href, label }: { href: string; label: string }) {
  return (
    <Section style={{ margin: "0 0 24px" }}>
      <EmailLabel>{label}</EmailLabel>
      <Text style={{ margin: 0 }}>
        <Link href={href} style={emailStyles.fallbackLink}>
          {href}
        </Link>
      </Text>
    </Section>
  );
}
