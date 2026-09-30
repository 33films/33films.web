import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { parseContactPayload } from "@/lib/contact";
import { isEmailConfigured, sendContactEmails } from "@/lib/email";

export const runtime = "nodejs";

const recent = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const stamps = (recent.get(ip) ?? []).filter((time) => now - time < windowMs);
  if (stamps.length >= 5) {
    recent.set(ip, stamps);
    return true;
  }
  stamps.push(now);
  recent.set(ip, stamps);
  return false;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const parsed = parseContactPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  if (parsed.spam) {
    return NextResponse.json({ ok: true });
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "spam" }, { status: 429 });
  }

  if (!isEmailConfigured()) {
    console.error("contact: missing RESEND_API_KEY");
    return NextResponse.json({ error: "config" }, { status: 503 });
  }

  const sent = await sendContactEmails(parsed.inquiry);
  if (!sent.ok) {
    return NextResponse.json(
      {
        error: sent.error,
        ...(sent.error === "send" && "detail" in sent ? { detail: sent.detail } : {}),
      },
      { status: sent.error === "config" ? 503 : 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
