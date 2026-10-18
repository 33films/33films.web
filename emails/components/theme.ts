import type { CSSProperties } from "react";

export const EMAIL_SITE_URL = "https://www.by33films.com";
export const EMAIL_LOGO_URL = `${EMAIL_SITE_URL}/images/email-logo.png`;

export const emailColors = {
  bg: "#050505",
  paper: "#f2f0ea",
  muted: "#a6a6a0",
  line: "rgba(242,240,234,0.16)",
};

export const emailFont = "Helvetica Neue, Helvetica, Arial, sans-serif";

export const emailStyles = {
  body: {
    backgroundColor: emailColors.bg,
    margin: 0,
    padding: "32px 0",
    fontFamily: emailFont,
  },
  container: {
    backgroundColor: emailColors.bg,
    margin: "0 auto",
    maxWidth: "560px",
    padding: "48px 32px",
  },
  logo: {
    display: "block",
    height: "auto",
    margin: "0 0 32px",
    width: "96px",
  },
  hr: {
    borderColor: emailColors.line,
    borderTop: `1px solid ${emailColors.line}`,
    margin: 0,
  },
  title: {
    color: emailColors.paper,
    fontSize: "26px",
    fontWeight: 400,
    letterSpacing: "0.04em",
    lineHeight: "1.25",
    margin: "32px 0 20px",
    textTransform: "uppercase",
  },
  text: {
    color: emailColors.paper,
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 24px",
  },
  label: {
    color: emailColors.muted,
    fontSize: "11px",
    letterSpacing: "0.18em",
    margin: "0 0 8px",
    textTransform: "uppercase",
  },
  note: {
    color: emailColors.muted,
    fontSize: "13px",
    lineHeight: "1.6",
    margin: "0 0 16px",
  },
  fallbackLink: {
    color: emailColors.paper,
    fontSize: "12px",
    lineHeight: "1.6",
    textDecoration: "underline",
    wordBreak: "break-all",
  },
  button: {
    backgroundColor: emailColors.paper,
    color: emailColors.bg,
    display: "inline-block",
    fontSize: "12px",
    letterSpacing: "0.18em",
    padding: "16px 28px",
    textDecoration: "none",
    textTransform: "uppercase",
  },
  footer: {
    color: emailColors.paper,
    fontSize: "11px",
    letterSpacing: "0.22em",
    margin: "16px 0 4px",
  },
  footerMuted: {
    color: emailColors.muted,
    fontSize: "11px",
    letterSpacing: "0.08em",
    margin: 0,
  },
} satisfies Record<string, CSSProperties>;
