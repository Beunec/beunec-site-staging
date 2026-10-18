"use client";

// The same Google Translate widget as the Aselius platform and
// preview.aselius.beunec.com (src/lib/pageLanguage.ts, GoogleTranslateLoader.tsx
// are copied from there verbatim, adapted only to drop the server routes a
// static export does not have). Google is fetched only once a non-English
// choice is made.

import { useEffect, useRef, useState } from "react";
import { Globe2 } from "lucide-react";
import {
  PAGE_LANGUAGE_LABELS,
  PAGE_LANGUAGE_EVENT,
  applyPageLanguage,
  storedPageLanguage,
} from "@/lib/pageLanguage";

export function LanguageMenu({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("English");
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(storedPageLanguage());
    const onLanguage = (e: Event) =>
      setCurrent(String((e as CustomEvent).detail || "English"));
    window.addEventListener(PAGE_LANGUAGE_EVENT, onLanguage);
    return () => window.removeEventListener(PAGE_LANGUAGE_EVENT, onLanguage);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = PAGE_LANGUAGE_LABELS.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} className={`relative notranslate ${mobile ? "w-full" : ""}`} translate="no">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary ${mobile ? "w-full justify-between" : ""}`}
      >
        <Globe2 className="h-4 w-4" aria-hidden />
        <span className={mobile ? "" : "max-w-[5.5rem] truncate"}>{current}</span>
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Language"
          translate="no"
          className="notranslate absolute right-0 z-50 mt-2 w-60 max-h-80 overflow-hidden rounded-xl border border-border bg-container shadow-xl"
        >
          <div className="border-b border-border p-2">
            <input
              type="search"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search language"
              className="w-full rounded-lg bg-secondary px-3 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => {
                    applyPageLanguage(label);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-secondary ${label === current ? "text-accent-sage font-medium" : "text-foreground"}`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
