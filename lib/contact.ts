export const CONTACT_EMAIL = "produccion.33fims@gmail.com";

export const CONTACT_PROJECT_TYPES = [
  "commercial",
  "brand_film",
  "music_video",
  "short_film",
  "other",
] as const;

export type ContactProjectType = (typeof CONTACT_PROJECT_TYPES)[number];

export type ContactInquiry = {
  name: string;
  email: string;
  company: string;
  projectType: ContactProjectType;
  budget: string;
  deadline: string;
  message: string;
};

export const PROJECT_TYPE_LABEL: Record<ContactProjectType, string> = {
  commercial: "Commercial",
  brand_film: "Brand Film",
  music_video: "Music Video",
  short_film: "Short Film",
  other: "Other",
};

const EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const LIMITS = {
  name: 120,
  email: 200,
  company: 160,
  message: 4000,
  budget: 80,
  deadline: 40,
  website: 200,
};

function clip(value: unknown, max: number) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function isProjectType(value: string): value is ContactProjectType {
  return (CONTACT_PROJECT_TYPES as readonly string[]).includes(value);
}

export function inquirySubject(inquiry: ContactInquiry) {
  return inquiry.company
    ? `NEW PROJECT INQUIRY — ${inquiry.name} / ${inquiry.company}`
    : `NEW PROJECT INQUIRY — ${inquiry.name}`;
}

export type ContactParseResult =
  | { ok: true; inquiry: ContactInquiry; spam: boolean }
  | { ok: false; error: "validation" };

export function parseContactPayload(body: unknown): ContactParseResult {
  if (!body || typeof body !== "object") return { ok: false, error: "validation" };

  const raw = body as Record<string, unknown>;
  const website = clip(raw.website, LIMITS.website);
  if (website) return { ok: true, spam: true, inquiry: placeholderInquiry() };

  const startedAt = Number(raw.startedAt ?? 0);
  if (Number.isFinite(startedAt) && startedAt > 0) {
    const elapsed = Date.now() - startedAt;
    if (elapsed >= 0 && elapsed < 400) {
      return { ok: true, spam: true, inquiry: placeholderInquiry() };
    }
  }

  const name = clip(raw.name, LIMITS.name);
  const email = clip(raw.email, LIMITS.email).toLowerCase();
  const company = clip(raw.company, LIMITS.company);
  const projectType = clip(raw.projectType, 40);
  const message = String(raw.message ?? "")
    .trim()
    .slice(0, LIMITS.message);
  const budget = clip(raw.budget, LIMITS.budget);
  const deadline = clip(raw.deadline, LIMITS.deadline);

  if (!name || !message || !EMAIL.test(email) || !isProjectType(projectType)) {
    return { ok: false, error: "validation" };
  }

  return {
    ok: true,
    spam: false,
    inquiry: { name, email, company, projectType, budget, deadline, message },
  };
}

function placeholderInquiry(): ContactInquiry {
  return {
    name: "",
    email: "",
    company: "",
    projectType: "other",
    budget: "",
    deadline: "",
    message: "",
  };
}
