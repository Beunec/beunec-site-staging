import Link from "next/link";
import { UPDATES } from "@/lib/aselius-updates";

const releases = UPDATES.slice(0, 6);

export function LatestReleases() {
  return (
    <section className="w-full border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">
            Latest releases
          </p>
          <Link
            href="/aselius-platform/docs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-sage hover:text-foreground transition-colors"
          >
            Read Aselius Docs
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {releases.map((r, i) => {
            const ctaClassName =
              "btn-ink w-fit px-4 py-2";
            return (
              <article
                key={r.title}
                data-reveal
                style={{ ["--rv-i" as string]: i % 3 }}
                className="baap-container rounded-2xl border border-border p-7 flex flex-col min-h-[320px]"
              >
                <h3 className="text-xl font-medium tracking-tight text-foreground mb-4 leading-snug">
                  {r.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground flex-1 mb-8">
                  {r.body}
                </p>
                <div className="space-y-3 border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="uppercase tracking-wider text-muted-foreground">Date</span>
                    <span className="text-foreground">{r.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="uppercase tracking-wider text-muted-foreground">Category</span>
                    <span className="text-foreground">{r.category}</span>
                  </div>
                </div>
                {r.external ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={ctaClassName}
                  >
                    {r.cta} <span aria-hidden="true">→</span>
                  </a>
                ) : (
                  <Link href={r.href} className={ctaClassName}>
                    {r.cta} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
