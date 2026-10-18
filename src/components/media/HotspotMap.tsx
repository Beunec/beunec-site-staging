"use client";

import { useState } from "react";
import type { Shot } from "@/lib/aselius-media";
import { ShotImage } from "./ShotImage";

export type Hotspot = {
  /** Position on the screenshot, in percent of its width and height. */
  x: number;
  y: number;
  title: string;
  body: string;
};

/**
 * A real screen with numbered pins. Hovering or focusing a pin, or its row in
 * the list, highlights both, so the list doubles as the accessible version of
 * the map and works the same on touch.
 */
export function HotspotMap({ shot, spots }: { shot: Shot; spots: Hotspot[] }) {
  const [active, setActive] = useState<number | null>(0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-container shadow-[var(--shadow-soft)]">
        <ShotImage shot={shot} sizes="(min-width: 1024px) 58vw, 100vw" className="h-auto w-full" />
        {spots.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-label={`${i + 1}. ${s.title}`}
            aria-pressed={active === i}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full bg-accent-sage/40 ${active === i ? "animate-ping" : "opacity-0"} motion-reduce:animate-none`}
            />
            <span
              className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold shadow-lg transition-transform duration-300 sm:h-7 sm:w-7 ${
                active === i
                  ? "scale-110 border-white bg-accent-sage text-white"
                  : "border-white/90 bg-[#111111]/85 text-white group-hover:scale-110"
              }`}
            >
              {i + 1}
            </span>
          </button>
        ))}
      </div>

      <ol className="space-y-1.5">
        {spots.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`flex w-full gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                active === i ? "border-accent-sage/60 bg-container" : "border-transparent hover:bg-secondary"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  active === i ? "bg-accent-sage text-white" : "bg-secondary text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{s.title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{s.body}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
