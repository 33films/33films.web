"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Player from "@vimeo/player";
import {
  PREVIEW_SEGMENT_MS,
  previewSegmentStarts,
  vimeoSdkOptions,
} from "@/lib/portfolio/vimeo";
import {
  workHoverPreviewUrl,
  workUsesVimeo,
  type SelectedWorkPublic,
} from "@/lib/portfolio/types";

const PREVIEW_PLAY_DELAY_MS = 550;

type Stop = () => void;
let activeStop: Stop | null = null;
let suspended = false;

function claimPreview(stop: Stop) {
  if (activeStop && activeStop !== stop) activeStop();
  activeStop = stop;
}

export function suspendPreviews(value: boolean) {
  suspended = value;
  if (value && activeStop) activeStop();
}

function releasePreview(stop: Stop) {
  if (activeStop === stop) activeStop = null;
}

export function canHoverPreview() {
  if (typeof window === "undefined") return false;
  const hover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return hover && !reduce;
}

export default function VideoPreview({
  work,
  active,
  priority = false,
}: {
  work: SelectedWorkPublic;
  active: boolean;
  priority?: boolean;
}) {
  const [warm, setWarm] = useState(false);
  const [armed, setArmed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const localUrl = workHoverPreviewUrl(work);
  const usesVimeoPreview = !localUrl && workUsesVimeo(work) && Boolean(work.vimeo_id);

  useEffect(() => {
    if (active) {
      setWarm(true);
      const play = window.setTimeout(() => setArmed(true), PREVIEW_PLAY_DELAY_MS);
      return () => window.clearTimeout(play);
    }
    setArmed(false);
    setPlaying(false);
    const hide = window.setTimeout(() => setWarm(false), 8000);
    return () => window.clearTimeout(hide);
  }, [active]);

  return (
    <div className="image-mask relative aspect-video w-full overflow-hidden bg-dark">
      {warm && usesVimeoPreview && work.vimeo_id ? (
        <VimeoEngine
          vimeoId={work.vimeo_id}
          title={work.title}
          active={armed}
          onPlaying={setPlaying}
        />
      ) : null}
      {warm && localUrl ? (
        <LocalEngine src={localUrl} active={armed} onPlaying={setPlaying} />
      ) : null}
      {work.thumbnail_url ? (
        <Image
          src={work.thumbnail_url}
          alt={work.title}
          fill
          priority={priority}
          draggable={false}
          className={`pointer-events-none z-[1] object-cover select-none transition-opacity duration-500 ${
            active && playing ? "opacity-0" : "opacity-100"
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 z-[1] bg-dark" />
      )}
    </div>
  );
}

function VimeoEngine({
  vimeoId,
  title,
  active,
  onPlaying,
}: {
  vimeoId: string;
  title: string;
  active: boolean;
  onPlaying: (playing: boolean) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const timerRef = useRef<number | null>(null);
  const cuesRef = useRef<number[]>([0]);
  const stopRef = useRef<Stop>(() => undefined);
  const onPlayingRef = useRef(onPlaying);
  const [ready, setReady] = useState(false);
  const canEmbed = Boolean(vimeoSdkOptions(vimeoId, "preview"));

  onPlayingRef.current = onPlaying;

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pausePreview = useCallback(() => {
    clearTimer();
    const player = playerRef.current;
    if (player) void player.pause().catch(() => undefined);
    onPlayingRef.current(false);
    releasePreview(stopRef.current);
  }, [clearTimer]);

  stopRef.current = pausePreview;

  useEffect(() => {
    const host = hostRef.current;
    const options = vimeoSdkOptions(vimeoId, "preview");
    if (!host || !options) return;

    const mount = document.createElement("div");
    mount.className = "absolute inset-0";
    host.appendChild(mount);
    const player = new Player(mount, options);
    playerRef.current = player;
    let cancelled = false;

    const markPlay = () => onPlayingRef.current(true);
    player.on("play", markPlay);
    player.on("error", () => {
      onPlayingRef.current(false);
      setReady(false);
    });

    player
      .ready()
      .then(async () => {
        if (cancelled) return;
        await player.setMuted(true).catch(() => undefined);
        await player.setVolume(0).catch(() => undefined);
        const duration = await player.getDuration().catch(() => 0);
        if (cancelled) return;
        cuesRef.current = previewSegmentStarts(duration || 0);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) onPlayingRef.current(false);
      });

    return () => {
      cancelled = true;
      setReady(false);
      clearTimer();
      player.off("play", markPlay);
      void player
        .destroy()
        .catch(() => undefined)
        .finally(() => mount.remove());
      playerRef.current = null;
      onPlayingRef.current(false);
    };
  }, [clearTimer, vimeoId]);

  useEffect(() => {
    if (!ready) return;
    const player = playerRef.current;
    if (!player) return;

    if (!active) {
      pausePreview();
      return;
    }

    let cancelled = false;
    let index = 0;

    const stale = () => cancelled || suspended;

    const start = async () => {
      if (stale()) return;
      claimPreview(stopRef.current);
      try {
        await player.setMuted(true);
        await player.setVolume(0);
        const cues = cuesRef.current;
        await player.setCurrentTime(cues[0] ?? 0).catch(() => undefined);
        if (stale()) return;
        await player.play();
        if (stale()) {
          void player.pause().catch(() => undefined);
          return;
        }
        if (cues.length < 2) return;
        timerRef.current = window.setInterval(() => {
          index = (index + 1) % cues.length;
          void player.setCurrentTime(cues[index]).then(() => {
            if (!stale()) void player.play();
          });
        }, PREVIEW_SEGMENT_MS);
      } catch {
        onPlayingRef.current(false);
      }
    };

    void start();
    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [active, clearTimer, pausePreview, ready]);

  if (!canEmbed) return null;

  return (
    <div
      ref={hostRef}
      title={title}
      className="work-preview-host pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
    />
  );
}

function LocalEngine({
  src,
  active,
  onPlaying,
}: {
  src: string;
  active: boolean;
  onPlaying: (playing: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopRef = useRef<Stop>(() => undefined);
  const onPlayingRef = useRef(onPlaying);
  onPlayingRef.current = onPlaying;

  const pausePreview = useCallback(() => {
    const node = videoRef.current;
    if (node) node.pause();
    onPlayingRef.current(false);
    releasePreview(stopRef.current);
  }, []);

  stopRef.current = pausePreview;

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

    if (!active || suspended) {
      pausePreview();
      return;
    }

    let cancelled = false;
    claimPreview(stopRef.current);
    node.muted = true;
    node.loop = true;
    node.currentTime = 0;
    void node
      .play()
      .then(() => {
        if (cancelled || suspended) node.pause();
        else onPlayingRef.current(true);
      })
      .catch(() => onPlayingRef.current(false));
    return () => {
      cancelled = true;
    };
  }, [active, pausePreview, src]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
    />
  );
}
