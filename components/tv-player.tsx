"use client";

import {
  Clock3,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_PLAYLIST } from "@/lib/default-playlist";
import type { PlaylistResponse, SignageItem, SignagePlaylist } from "@/lib/types";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

function isScheduled(item: SignageItem, date = new Date()): boolean {
  if (!item.enabled) return false;
  const schedule = item.schedule;
  if (!schedule) return true;
  if (schedule.startsAt && date < new Date(schedule.startsAt)) return false;
  if (schedule.endsAt && date > new Date(schedule.endsAt)) return false;
  if (schedule.days?.length && !schedule.days.includes(date.getDay())) return false;
  const hhmm = date.toTimeString().slice(0, 5);
  if (schedule.fromHour && hhmm < schedule.fromHour) return false;
  if (schedule.toHour && hhmm > schedule.toHour) return false;
  return true;
}

function formatClock(date: Date): string {
  return new Intl.DateTimeFormat("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(date);
}

function slideClass(item: SignageItem): string {
  return `tv-scene transition-${item.transition} theme-${item.theme || "brand"}`;
}

export function TvPlayer() {
  const [playlist, setPlaylist] = useState<SignagePlaylist>(DEFAULT_PLAYLIST);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [online, setOnline] = useState(true);
  const [now, setNow] = useState(new Date());
  const [status, setStatus] = useState("Cargando programación…");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceoverRef = useRef<HTMLAudioElement | null>(null);
  const timerStartedAt = useRef(Date.now());
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const items = useMemo(() => playlist.items.filter((item) => isScheduled(item)), [playlist, now]);
  const current = items[index % Math.max(1, items.length)] || DEFAULT_PLAYLIST.items[0];

  const loadPlaylist = useCallback(async () => {
    try {
      const response = await fetch(`/api/playlist?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo actualizar");
      const data = (await response.json()) as PlaylistResponse;
      setPlaylist(data.playlist);
      setStatus(data.source === "blob" ? "Programación publicada" : "Modo demostración");
      setOnline(true);
    } catch {
      setOnline(false);
      setStatus("Sin conexión · usando contenido guardado");
    }
  }, []);

  const next = useCallback(() => {
    setIndex((value) => (items.length ? (value + 1) % items.length : 0));
    timerStartedAt.current = Date.now();
    setProgress(0);
  }, [items.length]);

  useEffect(() => {
    const savedSound = window.localStorage.getItem("bm-tv-sound") === "on";
    setSoundEnabled(savedSound);
    loadPlaylist();
  }, [loadPlaylist]);

  useEffect(() => {
    const refreshMs = Math.max(10, playlist.settings.autoRefreshSeconds) * 1000;
    const refresh = window.setInterval(loadPlaylist, refreshMs);
    return () => window.clearInterval(refresh);
  }, [loadPlaylist, playlist.settings.autoRefreshSeconds]);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => { setOnline(true); loadPlaylist(); };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [loadPlaylist]);

  useEffect(() => {
    if (paused || !current) return;
    timerStartedAt.current = Date.now();
    setProgress(0);
    const durationMs = Math.max(2, current.durationSeconds) * 1000;
    const ticker = window.setInterval(() => {
      const elapsed = Date.now() - timerStartedAt.current;
      setProgress(Math.min(100, (elapsed / durationMs) * 100));
      if (elapsed >= durationMs) next();
    }, 200);
    return () => window.clearInterval(ticker);
  }, [current, next, paused]);

  useEffect(() => {
    const voiceover = voiceoverRef.current;
    if (!voiceover) return;
    voiceover.pause();
    voiceover.currentTime = 0;
    if (soundEnabled && current.voiceoverUrl) {
      voiceover.src = current.voiceoverUrl;
      voiceover.volume = 1;
      voiceover.play().catch(() => undefined);
    }
  }, [current, soundEnabled]);

  useEffect(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    const hasTrack = Boolean(playlist.settings.backgroundMusicUrl);
    if (!soundEnabled || !hasTrack || paused) {
      audio.pause();
      return;
    }
    if (audio.src !== playlist.settings.backgroundMusicUrl) {
      audio.src = playlist.settings.backgroundMusicUrl || "";
    }
    const duck = Boolean(current.voiceoverUrl) || (current.kind === "video" && !current.muted);
    audio.volume = Math.min(1, Math.max(0, playlist.settings.backgroundMusicVolume * (duck ? 0.2 : 1)));
    audio.play().catch(() => undefined);
  }, [current, paused, playlist.settings.backgroundMusicUrl, playlist.settings.backgroundMusicVolume, soundEnabled]);

  useEffect(() => {
    let hideTimer: number | undefined;
    const show = () => {
      setControlsVisible(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setControlsVisible(false), 5000);
    };
    show();
    window.addEventListener("mousemove", show);
    window.addEventListener("touchstart", show);
    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener("mousemove", show);
      window.removeEventListener("touchstart", show);
    };
  }, []);

  useEffect(() => {
    async function requestWakeLock() {
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> } };
        if (nav.wakeLock) {
          wakeLockRef.current = await nav.wakeLock.request("screen");
        }
      } catch {
        // Some TV browsers do not expose the Wake Lock API.
      }
    }
    requestWakeLock();
    const onVisibility = () => { if (document.visibilityState === "visible") requestWakeLock(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      wakeLockRef.current?.release().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "m") toggleSound();
      if (event.key.toLowerCase() === "f") enterFullscreen();
      if (event.key === "ArrowRight") next();
      if (event.key === " ") setPaused((value) => !value);
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  function toggleSound() {
    setSoundEnabled((value) => {
      const nextValue = !value;
      window.localStorage.setItem("bm-tv-sound", nextValue ? "on" : "off");
      return nextValue;
    });
  }

  function enterFullscreen() {
    document.documentElement.requestFullscreen?.().catch(() => undefined);
  }

  function restart() {
    setIndex(0);
    timerStartedAt.current = Date.now();
    setProgress(0);
  }

  return (
    <main className="tv-shell" onDoubleClick={enterFullscreen}>
      <ServiceWorkerRegister />
      <audio ref={backgroundAudioRef} loop preload="auto" />
      <audio ref={voiceoverRef} preload="auto" />

      <section key={`${current.id}-${index}`} className={slideClass(current)}>
        {current.kind === "video" && current.src ? (
          <video
            className={`scene-media fit-${current.fit || "cover"}`}
            src={current.src}
            poster={current.poster}
            autoPlay
            playsInline
            muted={!soundEnabled || Boolean(current.muted)}
            onError={next}
          />
        ) : current.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={`scene-media fit-${current.fit || "cover"}`} src={current.src} alt="" />
        ) : null}

        <div className="scene-scrim" />
        <div className="scene-brand-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-mark.svg" alt="Barrio MAX" />
          <span>BARRIO <b>MAX</b></span>
        </div>

        <article className="scene-copy">
          {current.eyebrow && <p className="scene-eyebrow">{current.eyebrow}</p>}
          {current.badge && <span className="scene-badge">{current.badge}</span>}
          <h1>{current.title}</h1>
          {current.subtitle && <p className="scene-subtitle">{current.subtitle}</p>}
          {current.price && <strong className="scene-price">{current.price}</strong>}
          {current.callToAction && <div className="scene-cta">{current.callToAction}</div>}
        </article>
      </section>

      <header className="tv-topbar">
        <div className="tv-status">{online ? <Wifi /> : <WifiOff />}<span>{status}</span></div>
        {playlist.settings.showClock && (
          <div className="tv-clock"><Clock3 /><span><b>{formatClock(now)}</b><small>{formatDate(now)}</small></span></div>
        )}
      </header>

      <footer className="tv-footer">
        <div><strong>{playlist.settings.businessName}</strong><span>{playlist.settings.slogan}</span></div>
        <div className="tv-contact"><span>{playlist.settings.location}</span><b>{playlist.settings.phone}</b></div>
      </footer>

      {playlist.settings.showProgress && <div className="tv-progress"><span style={{ width: `${progress}%` }} /></div>}

      <nav className={`tv-controls ${controlsVisible ? "visible" : ""}`} aria-label="Controles de pantalla">
        <button onClick={() => setPaused((value) => !value)}>{paused ? <Play /> : <Pause />}</button>
        <button onClick={next}><SkipForward /></button>
        <button onClick={restart}><RotateCcw /></button>
        <button onClick={toggleSound}>{soundEnabled ? <Volume2 /> : <VolumeX />}</button>
        <button onClick={enterFullscreen}><Maximize /></button>
        <a href="/admin">ADMIN</a>
      </nav>

      {!soundEnabled && controlsVisible && (
        <button className="sound-prompt" onClick={toggleSound}><Volume2 /> Activar música y voces</button>
      )}
    </main>
  );
}
