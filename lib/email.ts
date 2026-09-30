import "server-only";

import { Resend } from "resend";
import ContactInquiryEmail from "@/emails/ContactInquiryEmail";
import ContactConfirmationEmail from "@/emails/ContactConfirmationEmail";
import { inquirySubject, type ContactInquiry } from "@/lib/contact";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function getEmailConfig() {
  return {
    to: process.env.CONTACT_EMAIL || process.env.CONTACT_TO_EMAIL || "produccion.33fims@gmail.com",
    from:
      process.env.EMAIL_FROM ||
      process.env.CONTACT_FROM_EMAIL ||
      "33 Films <beth.t@example.com>",
  };
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function resendErrorInfo(error: unknown) {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }
  const value = error as { name?: string; message?: string; statusCode?: number };
  return {
    name: value.name ?? "unknown",
    statusCode: value.statusCode ?? null,
    message: value.message ?? "unknown",
  };
}

export async function sendContactEmails(inquiry: ContactInquiry) {
  const resend = getResend();
  if (!resend) {
    console.error("contact: RESEND_API_KEY is not configured");
    return { ok: false as const, error: "config" as const };
  }

  const { to, from } = getEmailConfig();
  console.error("contact: sending", {
    from,
    to,
    replyTo: inquiry.email,
    hasApiKey: Boolean(process.env.RESEND_API_KEY),
  });

  try {
    const inquiryResult = await resend.emails.send({
      from,
      to: [to],
      replyTo: inquiry.email,
      subject: inquirySubject(inquiry),
      react: ContactInquiryEmail({ inquiry }),
    });

    if (inquiryResult.error) {
      const detail = resendErrorInfo(inquiryResult.error);
      console.error("contact: inquiry email failed", detail);
      return { ok: false as const, error: "send" as const, detail };
    }

    const confirmation = await resend.emails.send({
      from,
      to: [inquiry.email],
      replyTo: to,
      subject: "33 FILMS — We received your inquiry",
      react: ContactConfirmationEmail({ inquiry }),
    });

    if (confirmation.error) {
      console.error("contact: confirmation email failed", resendErrorInfo(confirmation.error));
    }

    return { ok: true as const };
  } catch (error) {
    const detail = resendErrorInfo(error);
    console.error("contact: resend threw", detail);
    return { ok: false as const, error: "send" as const, detail };
  }
}
