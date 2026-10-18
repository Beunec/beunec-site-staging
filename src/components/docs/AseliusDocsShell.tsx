"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BookText, PanelLeftOpen, X } from "lucide-react";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import type { AseliusDoc } from "@/lib/aselius-docs";

type Props = {
  docs: AseliusDoc[];
  children: React.ReactNode;
};

function activeSlugFrom(pathname: string): string | null {
  const match = pathname.match(/\/aselius-platform\/docs\/([^/]+)/);
  return match ? match[1] : null;
}

/** Bucket docs under their group heading while preserving array order. */
function groupDocs(docs: AseliusDoc[]): { group: string; items: AseliusDoc[] }[] {
  const order: string[] = [];
  const buckets = new Map<string, AseliusDoc[]>();
  for (const doc of docs) {
    const group = doc.group ?? "Documentation";
    if (!buckets.has(group)) {
      buckets.set(group, []);
      order.push(group);
    }
    buckets.get(group)!.push(doc);
  }
  return order.map((group) => ({ group, items: buckets.get(group)! }));
}

function DocsNav({
  docs,
  activeSlug,
  onNavigate,
}: {
  docs: AseliusDoc[];
  activeSlug: string | null;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Documentation">
      <Link
        href="/aselius-platform"
        onClick={onNavigate}
        className="inline-flex items-center gap-2 text-sm font-medium text-accent-sage hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Platform overview
      </Link>

      {groupDocs(docs).map(({ group, items }) => (
        <div key={group} className="mb-6 last:mb-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-3">
            {group}
          </p>
          <ul className="space-y-1">
            {items.map((doc) => {
              const active = !doc.externalHref && doc.slug === activeSlug;
              const className = [
                "block rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-container text-foreground font-medium border-l-2 border-accent-sage"
                  : "text-muted-foreground hover:text-foreground hover:bg-container/60",
              ].join(" ");
              return (
                <li key={doc.slug}>
                  {doc.externalHref ? (
                    <a
                      href={doc.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onNavigate}
                      className={className}
                    >
                      {doc.title}
                      <span className="ml-1 text-[10px] text-accent-slate" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  ) : (
                    <Link
                      href={`/aselius-platform/docs/${doc.slug}`}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={className}
                    >
                      {doc.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Docs shell: sticky sidebar on desktop, icon-triggered drawer on mobile. */
export function AseliusDocsShell({ docs, children }: Props) {
  const pathname = usePathname();
  const activeSlug = activeSlugFrom(pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Esc closes the drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="baap-page min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28">
        <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28 pb-12">
              <DocsNav docs={docs} activeSlug={activeSlug} />
            </div>
          </aside>

          <main className="min-w-0 pb-24">{children}</main>
        </div>
      </div>

      <Footer />

      {/* Mobile: floating icon opens the sidebar */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open documentation menu"
        className="lg:hidden fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full border border-border bg-container px-4 py-3 text-sm font-medium text-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-sage)]"
      >
        <PanelLeftOpen className="w-5 h-5" />
        Docs
      </button>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Documentation menu">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-background border-r border-border shadow-2xl overflow-y-auto p-6 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <BookText className="w-4 h-4 text-accent-sage" />
                Aselius Docs
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close documentation menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <DocsNav docs={docs} activeSlug={activeSlug} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
