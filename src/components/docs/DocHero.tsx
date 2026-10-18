import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { KineticHeadline } from "@/components/motion/KineticHeadline";
import type { GlanceFact } from "@/lib/doc-structure";

/** Inline markdown only (bold, code, links) for the lead and fact values. */
function Inline({ children }: { children: string }) {
  return (
    <ReactMarkdown
      allowedElements={["p", "strong", "em", "code", "a"]}
      unwrapDisallowed
      components={{
        p: ({ children: c }) => <>{c}</>,
        strong: ({ children: c }) => <strong className="font-semibold text-foreground">{c}</strong>,
        code: ({ children: c }) => (
          <code className="rounded bg-container border border-border px-1 py-0.5 font-mono text-[max(14px,0.9em)] text-accent-sage">{c}</code>
        ),
        a: ({ href, children: c }) => (
          <a href={href} className="text-accent-slate underline underline-offset-4 hover:text-accent-sage">
            {c}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

/**
 * Top of every docs page: the title builds word by word, the lead settles in,
 * and the "At a glance" facts land as cards, so a reader gets the whole idea
 * before the first section.
 */
export function DocHero({
  title,
  lead,
  glance,
  eyebrow,
}: {
  title: string;
  lead: string | null;
  glance: GlanceFact[];
  eyebrow?: ReactNode;
}) {
  return (
    <header className="mb-10">
      {eyebrow ? (
        <p className="kt-fade mb-4 font-mono text-sm uppercase tracking-[0.14em] text-accent-slate" style={{ ["--d" as string]: "0s" }}>
          {eyebrow}
        </p>
      ) : null}
      <KineticHeadline
        lead={title}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.08]"
      />
      {lead ? (
        <p
          className="kt-fade mt-6 max-w-3xl text-lg sm:text-xl leading-relaxed text-muted-foreground"
          style={{ ["--d" as string]: "0.35s" }}
        >
          <Inline>{lead}</Inline>
        </p>
      ) : null}

      {glance.length > 0 ? (
        <section aria-label="At a glance" className="mt-9">
          <h2 className="kt-fade mb-4 font-mono text-sm uppercase tracking-[0.14em] text-accent-slate" style={{ ["--d" as string]: "0.5s" }}>
            At a glance
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {glance.map((fact, i) => (
              <div
                key={fact.label}
                className="kt-fade rounded-2xl border border-border bg-container p-4 sm:p-5"
                style={{ ["--d" as string]: `${0.55 + i * 0.08}s` }}
              >
                <dt className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-accent-sage" />
                  {fact.label}
                </dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                  <Inline>{fact.value}</Inline>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </header>
  );
}
