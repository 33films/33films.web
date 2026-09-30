"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";
import { vimeoSdkOptions } from "@/lib/portfolio/vimeo";
import { useI18n } from "@/lib/i18n/LanguageProvider";

const HIDE_CONTROLS_MS = 2600;
const SEEK_STEP = 5;
const VOLUME_STEP = 0.1;
// Stopping just before the real end keeps Vimeo's end screen (related videos) from appearing.
const END_GUARD_S = 0.35;

type Status = "loading" | "ready" | "error";
type Quality = { id: string; label: string };

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export default function VimeoPlayer({
  vimeoId,
  poster,
  title,
  onExit,
}: {
  vimeoId: string;
  poster?: string;
  title: string;
  onExit?: () => void;
}) {
  const { dictionary } = useI18n();
  const t = dictionary.work;

  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const hideTimer = useRef<number | null>(null);
  const clickTimer = useRef<number | null>(null);
  const endGuard = useRef(false);

  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [playing, setPlaying] = useState(false);
  const [hasFrames, setHasFrames] = useState(false);
  const [qualities, setQualities] = useState<Quality[]>([]);
  const [quality, setQualityState] = useState("auto");
  const [qualityMenu, setQualityMenu] = useState(false);
  const [ended, setEnded] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(false);
  const [mutedFallback, setMutedFallback] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [scrub, setScrub] = useState<number | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const canEmbed = Boolean(vimeoSdkOptions(vimeoId, "modal"));

  useEffect(() => {
    const host = hostRef.current;
    const options = vimeoSdkOptions(vimeoId, "modal");
    if (!host || !options) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    setPlaying(false);
    setHasFrames(false);
    setEnded(false);
    setBuffering(false);
    setCurrent(0);
    setBuffered(0);
    setMutedFallback(false);
    setQualities([]);
    setQualityState("auto");
    setQualityMenu(false);
    endGuard.current = false;

    const mount = document.createElement("div");
    mount.className = "absolute inset-0";
    host.appendChild(mount);
    const player = new Player(mount, options);
    playerRef.current = player;
    let cancelled = false;

    const failTimer = window.setTimeout(() => {
      if (!cancelled) setStatus("error");
    }, 30000);

    const onPlay = () => {
      if (cancelled) return;
      setPlaying(true);
      setEnded(false);
    };
    const onPause = () => {
      if (!cancelled) setPlaying(false);
    };
    const finish = () => {
      if (cancelled) return;
      endGuard.current = true;
      setPlaying(false);
      setEnded(true);
      setQualityMenu(false);
      setControlsVisible(true);
    };
    const onTime = (data: { seconds: number; duration: number }) => {
      if (cancelled) return;
      setCurrent(data.seconds);
      if (data.duration) setDuration(data.duration);
      if (data.seconds > 0) setHasFrames(true);
      if (
        !endGuard.current &&
        data.duration > END_GUARD_S * 2 &&
        data.seconds >= data.duration - END_GUARD_S
      ) {
        finish();
        void player.pause().catch(() => undefined);
      }
    };
    const onQuality = (data: { quality: string }) => {
      if (!cancelled) setQualityState(data.quality);
    };
    const onProgress = (data: { percent: number }) => {
      if (!cancelled) setBuffered(clamp(data.percent));
    };
    const onBufferStart = () => {
      if (!cancelled) setBuffering(true);
    };
    const onBufferEnd = () => {
      if (!cancelled) setBuffering(false);
    };
    const onVolume = (data: { volume: number }) => {
      if (!cancelled) setVolume(data.volume);
    };
    const onError = () => {
      if (!cancelled) setStatus("error");
    };

    player.on("play", onPlay);
    player.on("playing", onBufferEnd);
    player.on("pause", onPause);
    player.on("ended", finish);
    player.on("qualitychange", onQuality);
    player.on("timeupdate", onTime);
    player.on("progress", onProgress);
    player.on("bufferstart", onBufferStart);
    player.on("bufferend", onBufferEnd);
    player.on("volumechange", onVolume);
    player.on("error", onError);

    player
      .ready()
      .then(async () => {
        if (cancelled) return;
        window.clearTimeout(failTimer);
        const length = await player.getDuration().catch(() => 0);
        const level = await player.getVolume().catch(() => 1);
        const list = await player.getQualities().catch(() => []);
        const active = await player.getQuality().catch(() => "auto");
        if (cancelled) return;
        setDuration(length);
        setVolume(level || 1);
        setQualities(
          list
            .filter((q) => q.id !== "auto")
            .map((q) => ({ id: q.id, label: q.label || q.id }))
        );
        setQualityState(active || "auto");
        setStatus("ready");
        try {
          await player.setMuted(false);
          setMuted(false);
          await player.play();
        } catch {
          try {
            await player.setMuted(true);
            setMuted(true);
            await player.play();
            if (!cancelled) setMutedFallback(true);
          } catch {
            // Autoplay blocked entirely; the play button stays visible.
          }
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      window.clearTimeout(failTimer);
      player.off("play", onPlay);
      player.off("playing", onBufferEnd);
      player.off("pause", onPause);
      player.off("ended", finish);
      player.off("qualitychange", onQuality);
      player.off("timeupdate", onTime);
      player.off("progress", onProgress);
      player.off("bufferstart", onBufferStart);
      player.off("bufferend", onBufferEnd);
      player.off("volumechange", onVolume);
      player.off("error", onError);
      void player
        .destroy()
        .catch(() => undefined)
        .finally(() => mount.remove());
      playerRef.current = null;
    };
  }, [vimeoId, attempt]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    wrapRef.current?.focus({ preventScroll: true });
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      if (clickTimer.current) window.clearTimeout(clickTimer.current);
    };
  }, []);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setControlsVisible(false), HIDE_CONTROLS_MS);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      setControlsVisible(true);
      return;
    }
    revealControls();
  }, [playing, revealControls]);

  const replay = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;
    endGuard.current = false;
    setEnded(false);
    setCurrent(0);
    try {
      await player.setCurrentTime(0);
      await player.play();
    } catch {
      setStatus("error");
    }
  }, []);

  const changeQuality = useCallback(async (id: string) => {
    const player = playerRef.current;
    setQualityMenu(false);
    if (!player) return;
    try {
      await player.setQuality(id);
      setQualityState(id);
    } catch {
      // Vimeo only allows forcing a quality on Plus/PRO/Business videos.
      setQualities([]);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    const player = playerRef.current;
    if (!player || status !== "ready") return;
    try {
      if (ended) {
        await replay();
        return;
      }
      if (await player.getPaused()) await player.play();
      else await player.pause();
    } catch {
      setStatus("error");
    }
  }, [ended, status, replay]);

  const seekTo = useCallback(
    async (seconds: number) => {
      const player = playerRef.current;
      if (!player || !duration) return;
      const target = clamp(seconds, 0, Math.max(0, duration - END_GUARD_S * 2));
      setCurrent(target);
      setEnded(false);
      endGuard.current = false;
      await player.setCurrentTime(target).catch(() => undefined);
    },
    [duration]
  );

  const applyVolume = useCallback(async (next: number) => {
    const player = playerRef.current;
    if (!player) return;
    const level = clamp(next);
    setVolume(level);
    await player.setVolume(level).catch(() => undefined);
    const silent = level === 0;
    await player.setMuted(silent).catch(() => undefined);
    setMuted(silent);
    if (!silent) setMutedFallback(false);
  }, []);

  const toggleMute = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;
    const next = !muted;
    await player.setMuted(next).catch(() => undefined);
    if (!next && volume === 0) {
      await player.setVolume(1).catch(() => undefined);
      setVolume(1);
    }
    setMuted(next);
    setMutedFallback(false);
  }, [muted, volume]);

  const toggleFullscreen = useCallback(async () => {
    const node = wrapRef.current;
    if (!node) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (node.requestFullscreen) {
        await node.requestFullscreen();
      } else {
        await playerRef.current?.requestFullscreen();
      }
    } catch {
      await playerRef.current?.requestFullscreen().catch(() => undefined);
    }
  }, []);

  const onSurfaceClick = () => {
    if (qualityMenu) {
      setQualityMenu(false);
      return;
    }
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      void toggleFullscreen();
      return;
    }
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
      void togglePlay();
    }, 220);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (status !== "ready") return;
    const key = e.key.toLowerCase();
    const fromControl =
      e.target !== e.currentTarget && (e.target as HTMLElement).closest("button");
    if (fromControl && (key === " " || key === "enter")) return;
    if (key === " " || key === "k") {
      e.preventDefault();
      void togglePlay();
    } else if (key === "arrowright") {
      e.preventDefault();
      void seekTo(current + SEEK_STEP);
    } else if (key === "arrowleft") {
      e.preventDefault();
      void seekTo(current - SEEK_STEP);
    } else if (key === "arrowup") {
      e.preventDefault();
      void applyVolume((muted ? 0 : volume) + VOLUME_STEP);
    } else if (key === "arrowdown") {
      e.preventDefault();
      void applyVolume((muted ? 0 : volume) - VOLUME_STEP);
    } else if (key === "m") {
      void toggleMute();
    } else if (key === "f") {
      void toggleFullscreen();
    } else {
      return;
    }
    revealControls();
  };

  if (!canEmbed) {
    return (
      <div className="relative aspect-video w-full bg-dark">
        <p className="text-label absolute inset-0 flex items-center justify-center text-gray">
          {t.videoError}
        </p>
      </div>
    );
  }

  const shown = scrub ?? (duration > 0 ? current / duration : 0);
  const ready = status === "ready";
  const showChrome =
    ready && !ended && (controlsVisible || !playing || scrub !== null || qualityMenu);
  const covered = !hasFrames || ended;
  const waiting =
    status === "loading" || (ready && !ended && (buffering || (playing && !hasFrames)));
  const activeQuality = qualities.find((q) => q.id === quality);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      aria-label={title}
      onKeyDown={onKeyDown}
      onPointerMove={ready ? revealControls : undefined}
      onPointerLeave={() => playing && setControlsVisible(false)}
      className={`vimeo-player group/player relative w-full overflow-hidden bg-black outline-none select-none ${
        fullscreen ? "h-full" : "aspect-video"
      } ${ready && playing && !showChrome ? "cursor-none" : ""}`}
    >
      <div
        ref={hostRef}
        title={title}
        className="vimeo-player-host pointer-events-none absolute inset-0"
      />

      {ready ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={onSurfaceClick}
          className="absolute inset-0 z-10 cursor-pointer"
        />
      ) : null}

      <div
        className={`pointer-events-none absolute inset-0 z-20 bg-black bg-cover bg-center transition-opacity duration-700 ${
          covered ? "opacity-100" : "opacity-0"
        }`}
        style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      >
        <div
          className={`absolute inset-0 ${
            ended ? "bg-black/80" : status === "loading" || waiting ? "bg-black/70" : "bg-black/55"
          }`}
        />
      </div>

      {waiting ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="flex h-28 w-56 flex-col items-center justify-center gap-5 bg-black">
            <p className="text-label text-off-white/70">
              {status === "loading" || !hasFrames ? t.videoLoading : t.buffering}
            </p>
            <div className="relative h-px w-32 overflow-hidden bg-off-white/15">
              <span className="player-indeterminate absolute inset-y-0 w-1/3 bg-off-white" />
            </div>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-black/70">
          <p className="text-label text-gray">{t.videoError}</p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="text-label border border-off-white/30 px-6 py-3 text-off-white transition-colors hover:bg-off-white hover:text-black"
          >
            {t.retry}
          </button>
        </div>
      ) : null}

      {ready && !playing && !ended && !waiting ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <span className="text-label flex items-center gap-3 border border-off-white/40 bg-black/40 px-8 py-4 text-off-white backdrop-blur-sm">
            <span aria-hidden="true">▶</span>
            {t.play}
          </span>
        </div>
      ) : null}

      {ready && ended ? (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <button
            type="button"
            autoFocus
            onClick={() => void replay()}
            className="text-label flex w-44 items-center justify-center gap-3 border border-off-white/40 bg-black/40 py-4 text-off-white backdrop-blur-sm transition-colors hover:bg-off-white hover:text-black"
          >
            <span aria-hidden="true">↺</span>
            {t.replay}
          </button>
          {onExit ? (
            <button
              type="button"
              onClick={async () => {
                if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
                onExit();
              }}
              className="text-label flex w-44 items-center justify-center gap-3 border border-off-white/40 bg-black/40 py-4 text-off-white backdrop-blur-sm transition-colors hover:bg-off-white hover:text-black"
            >
              <span aria-hidden="true">✕</span>
              {t.exit}
            </button>
          ) : null}
        </div>
      ) : null}

      {ready && mutedFallback ? (
        <button
          type="button"
          onClick={() => void toggleMute()}
          className="text-label absolute top-4 left-4 z-40 border border-off-white/40 bg-black/60 px-4 py-2 text-off-white backdrop-blur-sm transition-colors hover:bg-off-white hover:text-black md:top-5 md:left-5"
        >
          {t.soundOn}
        </button>
      ) : null}

      <div
        className={`absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pt-16 pb-4 transition-opacity duration-300 md:px-6 md:pb-5 ${
          showChrome ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ScrubLine
          value={shown}
          buffered={buffered}
          duration={duration}
          ariaLabel={title}
          ariaValueText={`${formatTime(current)} / ${formatTime(duration)}`}
          onScrub={setScrub}
          onCommit={(ratio) => {
            setScrub(null);
            void seekTo(ratio * duration);
          }}
          showTooltip
        />

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 md:gap-7">
            <button
              type="button"
              onClick={() => void togglePlay()}
              className="text-label w-14 text-left text-off-white transition-opacity hover:opacity-60"
            >
              {ended ? t.replay : playing ? t.pause : t.play}
            </button>
            <p className="text-label text-off-white/60 tabular-nums">
              <span className="text-off-white">{formatTime(scrub !== null ? scrub * duration : current)}</span>
              <span className="mx-2 text-off-white/30">/</span>
              {formatTime(duration)}
            </p>
          </div>

          <div className="flex items-center gap-5 md:gap-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void toggleMute()}
                className="text-label w-12 text-right text-off-white transition-opacity hover:opacity-60"
              >
                {muted || volume === 0 ? t.unmute : t.mute}
              </button>
              <div className="hidden w-20 md:block">
                <ScrubLine
                  value={muted ? 0 : volume}
                  ariaLabel={t.mute}
                  ariaValueText={`${Math.round((muted ? 0 : volume) * 100)}%`}
                  onScrub={(ratio) => {
                    if (ratio !== null) void applyVolume(ratio);
                  }}
                  onCommit={(ratio) => void applyVolume(ratio)}
                  compact
                />
              </div>
            </div>
            {qualities.length > 1 ? (
              <div className="relative">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={qualityMenu}
                  onClick={() => setQualityMenu((open) => !open)}
                  className="text-label flex items-center gap-2 text-off-white transition-opacity hover:opacity-60"
                >
                  <span className="hidden text-off-white/50 sm:inline">{t.quality}</span>
                  {activeQuality?.label ?? t.qualityAuto}
                </button>
                {qualityMenu ? (
                  <ul
                    role="listbox"
                    aria-label={t.quality}
                    className="absolute right-0 bottom-full mb-4 min-w-36 border border-off-white/15 bg-black/90 py-2 backdrop-blur-sm"
                  >
                    {[{ id: "auto", label: t.qualityAuto }, ...qualities].map((q) => {
                      const selected = q.id === quality;
                      return (
                        <li key={q.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => void changeQuality(q.id)}
                            className={`text-label flex w-full items-center justify-between gap-6 px-4 py-2 text-left transition-colors hover:bg-off-white hover:text-black ${
                              selected ? "text-off-white" : "text-off-white/50"
                            }`}
                          >
                            {q.label}
                            <span aria-hidden="true" className={selected ? "" : "invisible"}>
                              ●
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="text-label text-off-white transition-opacity hover:opacity-60"
            >
              {fullscreen ? t.exitFullscreen : t.fullscreen}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrubLine({
  value,
  buffered = 0,
  duration = 0,
  ariaLabel,
  ariaValueText,
  onScrub,
  onCommit,
  showTooltip = false,
  compact = false,
}: {
  value: number;
  buffered?: number;
  duration?: number;
  ariaLabel: string;
  ariaValueText: string;
  onScrub: (ratio: number | null) => void;
  onCommit: (ratio: number) => void;
  showTooltip?: boolean;
  compact?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [hover, setHover] = useState<number | null>(null);

  const ratioAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return clamp((clientX - rect.left) / rect.width);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = compact ? VOLUME_STEP : duration > 0 ? SEEK_STEP / duration : 0.02;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      onCommit(clamp(value + step));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      onCommit(clamp(value - step));
    }
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-valuetext={ariaValueText}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        e.stopPropagation();
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        onScrub(ratioAt(e.clientX));
      }}
      onPointerMove={(e) => {
        const ratio = ratioAt(e.clientX);
        setHover(ratio);
        if (dragging.current) onScrub(ratio);
      }}
      onPointerUp={(e) => {
        if (!dragging.current) return;
        dragging.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
        onCommit(ratioAt(e.clientX));
      }}
      onPointerCancel={() => {
        dragging.current = false;
        onScrub(null);
      }}
      onPointerLeave={() => setHover(null)}
      className="group/scrub relative cursor-pointer touch-none py-2 outline-none"
    >
      <div
        className={`relative w-full bg-off-white/15 transition-[height] duration-200 ${
          compact ? "h-px group-hover/scrub:h-[2px]" : "h-px group-hover/scrub:h-[3px] group-focus-visible/scrub:h-[3px]"
        }`}
      >
        {buffered > 0 ? (
          <div
            className="absolute inset-y-0 left-0 bg-off-white/30"
            style={{ width: `${buffered * 100}%` }}
          />
        ) : null}
        {showTooltip && hover !== null ? (
          <div
            className="absolute inset-y-0 left-0 bg-off-white/20"
            style={{ width: `${hover * 100}%` }}
          />
        ) : null}
        <div
          className="absolute inset-y-0 left-0 bg-off-white"
          style={{ width: `${value * 100}%` }}
        />
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 bg-off-white opacity-0 transition-opacity duration-200 group-hover/scrub:opacity-100 group-focus-visible/scrub:opacity-100"
          style={{ left: `${value * 100}%` }}
        />
      </div>

      {showTooltip && hover !== null && duration > 0 ? (
        <span
          className="text-label pointer-events-none absolute bottom-full mb-2 -translate-x-1/2 border border-off-white/20 bg-black/80 px-2 py-1 text-off-white tabular-nums backdrop-blur-sm"
          style={{ left: `${clamp(hover, 0.03, 0.97) * 100}%` }}
        >
          {formatTime(hover * duration)}
        </span>
      ) : null}
    </div>
  );
}
