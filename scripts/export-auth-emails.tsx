/**
 * Renders the Supabase Auth email templates to static HTML.
 * Supabase keeps generating and sending the secure links; these files only replace the design.
 *
 *   npm run emails:export
 *
 * Output: supabase/templates/<name>.html and <name>.subject.txt — paste them into
 * Supabase → Authentication → Email Templates.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import { render } from "react-email";
import type { Locale } from "@/lib/i18n/config";
import { EmailDocument, EmailFrame } from "@/emails/components/EmailLayout";
import { AuthConfirmContent, authConfirmCopy } from "@/emails/AuthConfirmEmail";
import { PasswordResetContent, passwordResetCopy } from "@/emails/PasswordResetEmail";
import { PasswordChangedContent, passwordChangedCopy } from "@/emails/PasswordChangedEmail";

const OUT_DIR = path.join(process.cwd(), "supabase", "templates");
const LOCALES: Locale[] = ["es", "pt", "en"];

// Locale saved in the user's metadata, falling back to Spanish. Guarded so missing data never errors.
const LOCALE_FROM_DATA =
  '{{ $l := "es" }}{{ with .Data }}{{ with .locale }}{{ $l = . }}{{ end }}{{ end }}';

function byLocale(values: Record<Locale, string>) {
  return `{{ if eq $l "pt" }}${values.pt}{{ else if eq $l "en" }}${values.en}{{ else }}${values.es}{{ end }}`;
}

function pick<T extends Record<string, unknown>>(copy: Record<Locale, T>, key: keyof T) {
  return Object.fromEntries(LOCALES.map((l) => [l, String(copy[l][key])])) as Record<Locale, string>;
}

/** React escapes quotes and ampersands; Go template actions need them raw. */
function restoreTemplateActions(html: string) {
  return html.replace(/\{\{[\s\S]*?\}\}/g, (action) =>
    action
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
  );
}

async function exportTemplate({
  name,
  prelude,
  subjects,
  previews,
  content,
}: {
  name: string;
  prelude: string;
  subjects: Record<Locale, string>;
  previews: Record<Locale, string>;
  content: (locale: Locale) => ReactNode;
}) {
  const branches: [string, Locale][] = [
    ['{{ if eq $l "pt" }}', "pt"],
    ['{{ else if eq $l "en" }}', "en"],
    ["{{ else }}", "es"],
  ];
  const blocks = branches.flatMap(([action, locale]) => [
    action,
    <EmailFrame key={locale}>{content(locale)}</EmailFrame>,
  ]);

  const html = await render(
    <EmailDocument preview={byLocale(previews)}>
      {blocks}
      {"{{ end }}"}
    </EmailDocument>
  );

  // The prelude must precede the <title> React Email derives from the preview, which already uses $l.
  await writeFile(
    path.join(OUT_DIR, `${name}.html`),
    prelude + restoreTemplateActions(html),
    "utf8"
  );
  await writeFile(
    path.join(OUT_DIR, `${name}.subject.txt`),
    `${prelude}${byLocale(subjects)}\n`,
    "utf8"
  );
  console.log(`✓ supabase/templates/${name}.html`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  await exportTemplate({
    name: "confirm-signup",
    prelude: LOCALE_FROM_DATA,
    subjects: pick(authConfirmCopy, "subject"),
    previews: pick(authConfirmCopy, "preview"),
    content: (locale) => (
      <AuthConfirmContent locale={locale} confirmUrl="{{ .ConfirmationURL }}" />
    ),
  });

  await exportTemplate({
    name: "reset-password",
    prelude: LOCALE_FROM_DATA,
    subjects: pick(passwordResetCopy, "subject"),
    previews: pick(passwordResetCopy, "preview"),
    content: (locale) => (
      <PasswordResetContent locale={locale} resetUrl="{{ .ConfirmationURL }}" />
    ),
  });

  await exportTemplate({
    name: "password-changed",
    prelude: LOCALE_FROM_DATA,
    subjects: pick(passwordChangedCopy, "subject"),
    previews: pick(passwordChangedCopy, "preview"),
    content: (locale) => <PasswordChangedContent locale={locale} />,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
