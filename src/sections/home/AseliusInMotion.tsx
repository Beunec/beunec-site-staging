import Link from "next/link";
import { ReelVideo } from "@/components/media/ReelVideo";
import { ArrowRight } from "lucide-react";

/** Home teaser for Aselius: a silent loop of real screens that only loads and plays while on screen. */
export function AseliusInMotion() {
  return (
    <section className="w-full border-t border-border" aria-labelledby="aselius-motion-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div data-reveal className="lg:col-span-4">
            <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-5">
              Aselius, at work
            </p>
            <h2
              id="aselius-motion-title"
              className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground leading-tight"
            >
              Where this research becomes something you can use.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Aselius is Beunec&apos;s agentic infrastructure software. Specialized Rivine engines run governed
              work and hand you real files: documents, spreadsheets, decks and code you can preview, edit,
              publish and export. Use it on the web, or from any AI app through Aselius MCP.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link href="/aselius-platform#story" className="btn-ink">
                Watch the story <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/aselius-platform"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-sage hover:text-foreground transition-colors"
              >
                Explore Aselius <span aria-hidden="true">→</span>
              </Link>
              <a
                href="https://aselius.beunec.com"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-accent-sage transition-colors"
              >
                Open the app <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="sd-rise overflow-hidden rounded-2xl border border-border bg-[#111111] shadow-[var(--shadow-soft)]">
              <ReelVideo />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Every frame is a real Aselius screenshot. Loops silently while on screen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
