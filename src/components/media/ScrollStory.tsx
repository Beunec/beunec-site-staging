"use client";

import { useEffect, useRef, useState } from "react";
import { fitClass, type Shot } from "@/lib/aselius-media";
import { ShotImage } from "./ShotImage";

export type StoryStep = {
  kicker: string;
  title: string;
  body: string;
  shot: Shot;
};

/**
 * Scroll-told sequence: the copy scrolls normally while, on large screens, a
 * sticky frame beside it cuts to the screenshot for whichever step sits in the
 * middle of the viewport. No scroll hijacking and no pinning library: native
 * `position: sticky`, one IntersectionObserver, and state that changes once per
 * step, not per scroll event. Below `lg` each step simply carries its own frame.
 */
export function ScrollStory({ steps, label }: { steps: StoryStep[]; label: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
      <ol aria-label={label} className="relative">
        {/* progress rail */}
        <span aria-hidden="true" className="absolute left-[11px] top-2 bottom-2 hidden w-px bg-border lg:block" />
        <span
          aria-hidden="true"
          className="absolute left-[11px] top-2 hidden w-px origin-top bg-accent-sage transition-transform duration-700 ease-out lg:block"
          style={{ height: "calc(100% - 1rem)", transform: `scaleY(${(active + 1) / steps.length})` }}
        />
        {steps.map((step, i) => (
          <li
            key={step.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-step={i}
            className="relative flex flex-col justify-center py-8 lg:min-h-[64vh] lg:py-0 lg:pl-12"
          >
            <span
              aria-hidden="true"
              className={`absolute left-0 top-8 hidden h-[23px] w-[23px] items-center justify-center rounded-full border text-[10px] font-semibold transition-colors duration-500 lg:top-1/2 lg:-mt-3 lg:flex ${
                i <= active
                  ? "border-accent-sage bg-accent-sage text-white"
                  : "border-border bg-global text-muted-foreground"
              }`}
            >
              {i + 1}
            </span>
            <div
              className={`transition-opacity duration-500 ${i === active ? "lg:opacity-100" : "lg:opacity-45"}`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate">
                {String(i + 1).padStart(2, "0")} · {step.kicker}
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{step.title}</h3>
              <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
            <figure className="mt-6 overflow-hidden rounded-xl border border-border bg-container shadow-[var(--shadow-soft)] lg:hidden">
              <ShotImage shot={step.shot} sizes="100vw" className="h-auto w-full" />
              <figcaption className="px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                {step.shot.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>

      <div className="hidden lg:block">
        <div className="sticky top-28">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-media-blank shadow-[var(--shadow-soft)]">
            {steps.map((step, i) => (
              <div
                key={step.title}
                aria-hidden={i !== active}
                className="absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  opacity: i === active ? 1 : 0,
                  transform: i === active ? "scale(1)" : i < active ? "scale(0.97)" : "scale(1.04)",
                }}
              >
                <ShotImage
                  shot={step.shot}
                  sizes="55vw"
                  className={`h-full w-full ${fitClass(step.shot)}`}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground">
            {steps[active]?.shot.caption}
          </p>
        </div>
      </div>
    </div>
  );
}
