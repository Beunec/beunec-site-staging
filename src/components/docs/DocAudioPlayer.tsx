"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import {
  getDocAudioSrc,
  type DocAudioSlug,
} from "@/lib/beunec-doc-audio";

type DocAudioPlayerProps = {
  slug: DocAudioSlug;
  /** Short label for aria, e.g. "research philosophy" */
  label: string;
};

/** Narrated doc page: autoplay on load; bottom-left play/pause control. */
export function DocAudioPlayer({ slug, label }: DocAudioPlayerProps) {
  const src = getDocAudioSrc(slug);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onCanPlay = () => setReady(true);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("canplay", onCanPlay);

    void audio
      .play()
      .then(() => setBlocked(false))
      .catch(() => setBlocked(true));

    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("canplay", onCanPlay);
      audioRef.current = null;
    };
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    } else {
      audio.pause();
    }
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-label={
          playing ? `Pause ${label} narration` : `Play ${label} narration`
        }
        className="baap-interactive group relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-container text-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-sage)]"
      >
        {playing ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
        )}
        <span className="pointer-events-none absolute -top-9 left-0 whitespace-nowrap rounded-md border border-border bg-container px-2 py-1 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {playing ? "Pause narration" : blocked ? "Tap to play narration" : "Play narration"}
        </span>
      </button>
      {ready && (
        <span
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-container/90 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur-sm"
          aria-live="polite"
        >
          <Volume2 className="h-3.5 w-3.5 text-accent-sage" />
          {playing ? "Narrating…" : blocked ? "Tap play" : "Paused"}
        </span>
      )}
    </div>
  );
}
