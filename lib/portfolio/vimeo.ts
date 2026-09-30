const NUMERIC_ID = /^\d{6,12}$/;
const PRIVACY_HASH = /^[a-zA-Z0-9]{6,16}$/;

function lastNumericId(parts: string[]): { id: string; index: number } | null {
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (NUMERIC_ID.test(parts[i])) return { id: parts[i], index: i };
  }
  return null;
}

export function extractVimeoId(urlOrId: string): string | null {
  const raw = urlOrId.trim();
  if (!raw) return null;

  if (NUMERIC_ID.test(raw)) return raw;

  const bareWithHash = raw.match(/^(\d{6,12})\/([a-zA-Z0-9]{6,16})$/);
  if (bareWithHash) return `${bareWithHash[1]}/${bareWithHash[2]}`;

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;

  const parts = url.pathname.split("/").filter(Boolean);
  const found = lastNumericId(parts);
  if (!found) return null;

  let hash: string | undefined;
  const next = parts[found.index + 1];
  if (next && PRIVACY_HASH.test(next) && next !== "videos") hash = next;

  const hParam = url.searchParams.get("h");
  if (hParam && PRIVACY_HASH.test(hParam)) hash = hParam;

  return hash ? `${found.id}/${hash}` : found.id;
}

export function vimeoPlaybackParts(
  stored: string
): { id: string; hash?: string } | null {
  const extracted = extractVimeoId(stored);
  if (!extracted) return null;
  const [id, hash] = extracted.split("/");
  return hash ? { id, hash } : { id };
}

export function vimeoEmbedSrc(stored: string): string | null {
  return buildVimeoSrc(stored, {
    muted: "1",
    autoplay: "1",
    title: "0",
    byline: "0",
    portrait: "0",
    badge: "0",
    dnt: "1",
    controls: "0",
    autopause: "1",
    playsinline: "1",
    color: "f2f0ea",
  });
}

export type VimeoProbeResult =
  | {
      ok: true;
      id: string;
      title?: string;
      thumbnailUrl?: string;
    }
  | {
      ok: false;
      id: string | null;
      reason: "invalid" | "blocked" | "network";
    };

export async function probeVimeoEmbed(urlOrId: string): Promise<VimeoProbeResult> {
  const id = extractVimeoId(urlOrId);
  if (!id) return { ok: false, id: null, reason: "invalid" };

  const watch = vimeoWatchUrl(id);
  if (!watch) return { ok: false, id: null, reason: "invalid" };

  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(watch)}`,
      { headers: { Accept: "application/json" }, cache: "no-store" }
    );

    if (res.status === 403 || res.status === 404) {
      return { ok: false, id, reason: "blocked" };
    }
    if (!res.ok) return { ok: false, id, reason: "network" };

    const data = (await res.json()) as {
      title?: string;
      thumbnail_url?: string;
    };

    return {
      ok: true,
      id,
      title: data.title,
      thumbnailUrl: data.thumbnail_url,
    };
  } catch {
    return { ok: false, id, reason: "network" };
  }
}

export function vimeoWatchUrl(stored: string): string | null {
  const parts = vimeoPlaybackParts(stored);
  if (!parts) return null;
  return parts.hash
    ? `https://vimeo.com/${parts.id}/${parts.hash}`
    : `https://vimeo.com/${parts.id}`;
}

export function vimeoSdkOptions(
  stored: string,
  kind: "preview" | "modal"
) {
  const watch = vimeoWatchUrl(stored);
  if (!watch) return null;
  const url = watch as `https://vimeo.com/${string}`;
  if (kind === "modal") {
    return {
      url,
      autoplay: false,
      muted: false,
      loop: false,
      controls: false,
      byline: false,
      title: false,
      portrait: false,
      dnt: true,
      playsinline: true,
      autopause: false,
      keyboard: false,
      pip: false,
      color: "f2f0ea",
    };
  }
  return {
    url,
    muted: true,
    autoplay: false,
    loop: true,
    background: false,
    controls: false,
    byline: false,
    title: false,
    portrait: false,
    dnt: true,
    playsinline: true,
    autopause: false,
    keyboard: false,
  };
}

export function vimeoPreviewSrc(stored: string): string | null {
  return buildVimeoSrc(stored, {
    muted: "1",
    autoplay: "1",
    loop: "1",
    title: "0",
    byline: "0",
    portrait: "0",
    badge: "0",
    dnt: "1",
    controls: "0",
    autopause: "1",
    playsinline: "1",
  });
}

function buildVimeoSrc(stored: string, params: Record<string, string>): string | null {
  const parts = vimeoPlaybackParts(stored);
  if (!parts) return null;

  const search = new URLSearchParams(params);
  if (parts.hash) search.set("h", parts.hash);

  return `https://player.vimeo.com/video/${parts.id}?${search.toString()}`;
}

export const PREVIEW_SEGMENT_MS = 2400;

export function previewSegmentStarts(duration: number): number[] {
  if (!Number.isFinite(duration) || duration <= 0) return [0];
  if (duration < 10) return [Math.min(0.35, duration * 0.08)];
  if (duration < 25) {
    return [duration * 0.12, duration * 0.42, duration * 0.74];
  }
  return [
    duration * 0.08,
    duration * 0.28,
    duration * 0.48,
    duration * 0.68,
    duration * 0.86,
  ];
}
