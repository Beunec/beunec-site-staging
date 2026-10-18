import Link from "next/link";

const principles = [
  {
    title: "Self-Awareness Must Precede Safety",
    href: "/principles",
    tag: "Principles",
  },
  {
    title: "Data Readiness Comes Before Effective AI Governance",
    href: "/principles",
    tag: "Principles",
  },
  {
    title: "Stability Is More Important Than Power",
    href: "/principles",
    tag: "Principles",
  },
  {
    title: "Objectivity and Bias Control",
    href: "/research-philosophy",
    tag: "Research Philosophy",
  },
  {
    title: "Validity",
    href: "/research-philosophy",
    tag: "Research Philosophy",
  },
];

/** Agentic Infrastructure definition and the principle/research index, verbatim from Beunec Docs */
export const VisionMission = () => {
  return (
    <section id="agentic-infrastructure" className="w-full border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 space-y-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div data-reveal className="lg:col-span-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
              Our definition
            </p>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground leading-tight">
              Agentic Infrastructure
            </h2>
          </div>

          <div data-reveal style={{ ["--rv-i" as string]: 1 }} className="lg:col-span-7 space-y-6">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Agentic Infrastructure is the combined physical, virtual, operational, and human
              foundation that enables autonomous systems to execute multi-step, long-horizon tasks
              within defined boundaries and with minimal, but meaningful, human intervention.
            </p>
            {/* Inks itself in as it is read (native scroll timeline; plain text elsewhere) */}
            <blockquote
              className="border-l-2 border-accent-sage pl-5 text-xl md:text-2xl text-foreground leading-relaxed"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              <span className="sd-ink">
                A model may generate intelligence. Agentic Infrastructure determines whether that
                intelligence can become dependable action.
              </span>
            </blockquote>
            <p className="text-base leading-relaxed text-muted-foreground">
              Beunec treats Agentic Infrastructure as more than an AI model or collection of agents.
              It is the total environment required to transform machine-generated reasoning into
              controlled, observable, and usable execution.
            </p>
            <Link
              href="/agentic-infrastructure"
              className="inline-flex text-sm font-medium text-accent-sage hover:opacity-80 transition-opacity"
            >
              Read Agentic Infrastructure →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pt-4">
          <div data-reveal className="lg:col-span-4">
            <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground leading-snug">
              We prioritize discovery, real invention, development, and responsible deployment over
              attention, hype, or premature commercialization.
            </h3>
          </div>
          <ul className="lg:col-span-8 divide-y divide-border border-t border-border">
            {principles.map((item, i) => (
              <li key={item.title} data-reveal="left" style={{ ["--rv-i" as string]: i }}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-6 py-5 group transition-colors duration-200 hover:bg-state-hover px-2 -mx-2"
                >
                  <span className="text-foreground group-hover:text-accent-sage transition-colors">
                    {item.title}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground shrink-0">
                    {item.tag}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
