"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";

export type Chapter = { at: number; title: string };

type StoryVideoProps = {
  /** Tried in order: put MP4 (H.264) first and WebM (VP9) after it. */
  sources: { src: string; type: string }[];
  poster: string;
  captions: string;
  title: string;
  duration: string;
  chapters: Chapter[];
};

/**
 * The explainer: only the poster loads with the page (preload="none"); the
 * video starts streaming when someone presses play or picks a chapter. Native
 * controls and an English captions track come with it, and every word the video
 * says on screen is also in the captions file.
 */
export function StoryVideo({ sources, poster, captions, title, duration, chapters }: StoryVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [now, setNow] = useState(0);

  const play = (at?: number) => {
    const v = ref.current;
    if (!v) return;
    if (typeof at === "number") v.currentTime = at;
    setStarted(true);
    void v.play().catch(() => {
      /* the native controls remain */
    });
  };

  const current = chapters.reduce((acc, c, i) => (now >= c.at ? i : acc), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[#111111] shadow-[var(--shadow-soft)]">
        <video
          ref={ref}
          className="block aspect-video w-full"
          poster={poster}
          preload="none"
          playsInline
          controls={started}
          onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
          onPlay={() => setStarted(true)}
          aria-label={title}
        >
          {sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
          <track kind="captions" src={captions} srcLang="en" label="English" default />
        </video>
        {!started && (
          <button
            type="button"
            onClick={() => play()}
            className="group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/45 via-black/5 to-transparent"
            aria-label={`Play: ${title}, ${duration}`}
          >
            <span className="flex items-center gap-3 rounded-full bg-white/95 py-2.5 pl-3 pr-5 text-sm font-semibold text-[#111111] shadow-2xl transition-transform duration-300 group-hover:scale-105">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-white">
                <Play className="ml-0.5 h-4 w-4" aria-hidden />
              </span>
              Watch the story · {duration}
            </span>
          </button>
        )}
      </div>

      <nav aria-label="Chapters" className="rounded-2xl border border-border bg-container p-3">
        <p className="px-2 pb-2 pt-1 font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">
          Chapters
        </p>
        <ol className="space-y-0.5">
          {chapters.map((c, i) => {
            const on = started && i === current;
            return (
              <li key={c.title}>
                <button
                  type="button"
                  onClick={() => play(c.at)}
                  aria-current={on ? "true" : undefined}
                  className={`flex w-full items-baseline gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                    on ? "bg-accent-sage/15 text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <span className="w-9 shrink-0 font-mono text-sm tabular-nums text-accent-slate">
                    {Math.floor(c.at / 60)}:{String(Math.floor(c.at % 60)).padStart(2, "0")}
                  </span>
                  <span className="leading-snug">{c.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
