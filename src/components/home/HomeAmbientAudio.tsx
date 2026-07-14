"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

/** Homepage ambient sound. Loops at half volume with a bottom-left stop/resume control. */
const SRC = "/audio/homepage-ambient.m4a";
const VOLUME = 0.5;
const STORAGE_KEY = "beunec-home-audio-paused";

export function HomeAmbientAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userPausedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const audio = new Audio(SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    // Browsers block audio autoplay until the user interacts with the page.
    // So: try to play immediately, and if it's blocked, start on the first gesture.
    const gestureEvents = ["pointerdown", "keydown", "touchstart"] as const;
    const onFirstGesture = () => {
      gestureEvents.forEach((e) => window.removeEventListener(e, onFirstGesture));
      if (userPausedRef.current) return;
      void audio.play().then(() => setBlocked(false)).catch(() => {});
    };

    const startPaused = sessionStorage.getItem(STORAGE_KEY) === "1";
    userPausedRef.current = startPaused;

    if (!startPaused) {
      void audio
        .play()
        .then(() => setBlocked(false))
        .catch(() => {
          setBlocked(true);
          gestureEvents.forEach((e) =>
            window.addEventListener(e, onFirstGesture, { passive: true }),
          );
        });
    }

    return () => {
      gestureEvents.forEach((e) => window.removeEventListener(e, onFirstGesture));
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      userPausedRef.current = false;
      sessionStorage.setItem(STORAGE_KEY, "0");
      void audio.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    } else {
      userPausedRef.current = true;
      sessionStorage.setItem(STORAGE_KEY, "1");
      audio.pause();
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause background sound" : "Play background sound"}
        className="baap-interactive group relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-container text-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-sage)]"
      >
        {playing ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
        )}
        <span className="pointer-events-none absolute -top-9 left-0 whitespace-nowrap rounded-md border border-border bg-container px-2 py-1 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {playing ? "Stop sound" : blocked ? "Tap to play sound" : "Play sound"}
        </span>
      </button>
      <span
        className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-container/90 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur-sm"
        aria-live="polite"
      >
        <Volume2 className="h-3.5 w-3.5 text-accent-sage" />
        {playing ? "Sound on" : blocked ? "Tap play" : "Sound off"}
      </span>
    </div>
  );
}
