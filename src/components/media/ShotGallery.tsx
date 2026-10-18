"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { fitClass, type Shot } from "@/lib/aselius-media";
import { ShotImage } from "./ShotImage";
import { TiltFrame } from "./TiltFrame";

type ShotGalleryProps = {
  shots: Shot[];
  /** Show area filter chips (off for short docs strips). */
  filters?: boolean;
  /** Tailwind grid columns for the tiles. */
  columns?: string;
  /** Show this many tiles until "Show all" is pressed. */
  limit?: number;
};

/**
 * Real screenshots as tiles: tilt under the pointer, open full size in a
 * native <dialog> (focus trap, Escape and backdrop close come free), and step
 * through with the arrow keys. Tiles are buttons, so the whole gallery works
 * from the keyboard.
 */
export function ShotGallery({ shots, filters = false, columns = "sm:grid-cols-2 lg:grid-cols-3", limit }: ShotGalleryProps) {
  const areas = Array.from(new Set(shots.map((s) => s.area)));
  const [area, setArea] = useState<string>("All");
  const [open, setOpen] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const visible = area === "All" ? shots : shots.filter((s) => s.area === area);
  const current = open === null ? null : visible[open] ?? null;

  const show = useCallback((index: number) => {
    setOpen(index);
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const step = useCallback(
    (delta: number) => {
      setOpen((i) => (i === null ? i : (i + delta + visible.length) % visible.length));
    },
    [visible.length],
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => setOpen(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    d.addEventListener("close", onClose);
    d.addEventListener("keydown", onKey);
    return () => {
      d.removeEventListener("close", onClose);
      d.removeEventListener("keydown", onKey);
    };
  }, [step]);

  return (
    <div>
      {filters && areas.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter screenshots">
          {["All", ...areas].map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={area === a}
              onClick={() => setArea(a)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                area === a
                  ? "border-accent-sage bg-accent-sage/15 text-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      <ul className={`grid gap-5 ${columns}`}>
        {(limit && !expanded ? visible.slice(0, limit) : visible).map((shot, i) => (
          <li key={shot.id} data-reveal style={{ ["--rv-i" as string]: i % 3 }}>
            <TiltFrame className="h-full">
              <button
                type="button"
                onClick={() => show(i)}
                className="group block h-full w-full overflow-hidden rounded-2xl border border-border bg-container text-left shadow-[var(--shadow-soft)] transition-colors hover:border-accent-sage/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-sage)]"
                aria-label={`Open screenshot: ${shot.title}`}
              >
                <span className="relative block aspect-[16/10] overflow-hidden bg-media-blank">
                  <ShotImage
                    shot={shot}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className={`h-full w-full ${fitClass(shot)} transition-transform duration-700 ease-out group-hover:scale-[1.04]`}
                  />
                  <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-container/90 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </span>
                <span className="block px-4 py-3.5">
                  <span className="block font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">
                    {shot.area}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-foreground">{shot.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{shot.caption}</span>
                </span>
              </button>
            </TiltFrame>
          </li>
        ))}
      </ul>

      {limit && !expanded && visible.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-6 inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Show all {visible.length} screenshots
        </button>
      )}

      <dialog
        ref={dialogRef}
        aria-label={current ? current.title : "Screenshot"}
        className="shot-dialog m-auto w-[min(96vw,1280px)] max-h-[94vh] overflow-hidden rounded-2xl border border-border bg-container p-0 text-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {current && (
          <figure className="flex max-h-[94vh] flex-col">
            <div className="relative min-h-0 flex-1 overflow-auto bg-media-blank">
              <ShotImage
                key={current.id}
                shot={current}
                sizes="96vw"
                className={`mx-auto h-auto ${current.h > current.w ? "max-h-[78vh] w-auto" : "w-full"}`}
              />
            </div>
            <figcaption className="flex items-start gap-4 border-t border-border px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">
                  {current.area} · {open! + 1} / {visible.length}
                </p>
                <p className="mt-1 text-sm font-semibold">{current.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.caption}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
                  aria-label="Next screenshot"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-secondary"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </figcaption>
          </figure>
        )}
      </dialog>
    </div>
  );
}
