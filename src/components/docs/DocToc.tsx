"use client";

import { useEffect, useState } from "react";
import type { DocSection } from "@/lib/doc-structure";

/**
 * "On this page" rail. One IntersectionObserver marks the section currently
 * being read; state changes once per section, never per scroll event.
 */
export function DocToc({ sections }: { sections: DocSection[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav aria-label="On this page" className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8">
      <p className="mb-3 font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">On this page</p>
      <ol className="space-y-0.5 border-l border-border">
        {sections.map((s) => {
          const on = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-3 text-sm leading-snug transition-colors ${
                  on
                    ? "border-accent-sage font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {s.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
