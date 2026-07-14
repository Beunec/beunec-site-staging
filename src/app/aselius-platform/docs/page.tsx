import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { groupAseliusDocs } from "@/lib/aselius-docs";

export default function AseliusDocsIndex() {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-4">
        Aselius Platform
      </p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
        Documentation
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mb-12">
        Guides for the Aselius Platform and the Rivine agentic engines. Pick a topic
        below, or use the menu to switch between documents.
      </p>

      <div className="space-y-12">
        {groupAseliusDocs().map(({ group, items }) => (
          <section key={group}>
            <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-4">
              {group}
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {items.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/aselius-platform/docs/${doc.slug}`}
                  className="group rounded-2xl border border-border bg-container p-6 transition-colors hover:border-accent-sage/60"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{doc.title}</h3>
                    <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent-sage" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{doc.blurb}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
