import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { groupAseliusDocs } from "@/lib/aselius-docs";

export default function AseliusDocsIndex() {
  return (
    <div>
      <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-4">
        Aselius · agentic infrastructure software
      </p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
        Documentation
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-12">
        How to use Aselius and its Rivine agentic engines: what each part does, how to
        run it, and what you get back. Pick a topic below, or use the menu to switch
        between documents.
      </p>
      
      <Link
        href="/aselius-platform#story"
        className="group mb-12 flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-container p-4 transition-colors hover:border-accent-sage/60 sm:flex-row sm:items-center"
      >
        <img
          src="/media/aselius-story-poster.webp"
          alt=""
          width={1280}
          height={720}
          loading="lazy"
          className="aspect-video w-full rounded-xl border border-border object-cover sm:w-64"
        />
        <span className="min-w-0">
          <span className="block font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">
            New to Aselius? Start here
          </span>
          <span className="mt-2 block text-lg font-semibold text-foreground">
            Watch the Aselius story: what it is, where everything lives, and where else the engines work
          </span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent-sage">
            Every screen real, every line captioned <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </span>
      </Link>

      <div className="space-y-12">
        {groupAseliusDocs().map(({ group, items }) => (
          <section key={group}>
            <h2 className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-4">
              {group}
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {items.map((doc) => {
                const cardClass =
                  "group rounded-2xl border border-border bg-container p-6 transition-colors hover:border-accent-sage/60";
                const body = (
                  <>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{doc.title}</h3>
                      <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent-sage" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{doc.blurb}</p>
                    {doc.externalHref ? (
                      <p className="mt-3 text-sm font-medium text-accent-sage">Opens Rivine Browse →</p>
                    ) : null}
                  </>
                );
                return doc.externalHref ? (
                  <a
                    key={doc.slug}
                    href={doc.externalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    {body}
                  </a>
                ) : (
                  <Link
                    key={doc.slug}
                    href={`/aselius-platform/docs/${doc.slug}`}
                    className={cardClass}
                  >
                    {body}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
