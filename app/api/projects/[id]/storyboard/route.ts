import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/session";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_DOCUMENT_CHARS = 8_000_000;

function isMissingTable(error: { code?: string; message?: string } | null) {
  const code = error?.code ?? "";
  const message = error?.message ?? "";
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST204" ||
    message.includes("project_storyboards")
  );
}

function isStoryboardDocument(value: unknown): value is { scenes: unknown[] } {
  if (!value || typeof value !== "object") return false;
  return Array.isArray((value as { scenes?: unknown }).scenes);
}

async function requireAdmin() {
  const { profile } = await getAuthUser();
  if (!profile || profile.role !== "admin") return null;
  return profile;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await context.params;
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "setup" }, { status: 503 });

  const { data, error } = await supabase
    .from("project_storyboards")
    .select("document")
    .eq("project_id", id)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) return NextResponse.json({ document: null, error: "schema" });
    console.error("storyboard read", error.code ?? "unknown");
    return NextResponse.json({ error: "read" }, { status: 500 });
  }

  return NextResponse.json({ document: data?.document ?? null });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await context.params;
  const supabase = await createServerSupabase();
  if (!supabase) return NextResponse.json({ error: "setup" }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const document = (body as { document?: unknown })?.document;
  if (!isStoryboardDocument(document)) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const serialized = JSON.stringify(document);
  if (serialized.length > MAX_DOCUMENT_CHARS) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  const { error } = await supabase.from("project_storyboards").upsert({
    project_id: id,
    document,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    if (isMissingTable(error)) return NextResponse.json({ error: "schema" }, { status: 503 });
    console.error("storyboard write", error.code ?? "unknown");
    return NextResponse.json({ error: "write" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
