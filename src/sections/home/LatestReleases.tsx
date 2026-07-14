"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const releases = [
  {
    title: "Rivine Experimental Project",
    body: "Rivine is Beunec's answer to that gap: an orchestration and reasoning architecture built specifically for agentic work that has to survive contact with reality, flaky APIs, ambiguous instructions, multi-hour tasks, and stakes high enough that a wrong answer costs more than a slow one.",
    date: "2026",
    category: "Research",
    href: "/rivine-experimental-project",
    cta: "Read publication →",
  },
  {
    title: "Introducing Aselius Platform",
    body: "The Workspace application on the Aselius platform is the first place this architecture is available for direct use today. Beunec's roadmap, ahead of July 2027, is to expose each Rivine agentic engine through dedicated API infrastructure for enterprise, government, and developer use.",
    date: "July 18, 2026",
    category: "Coming Soon",
    href: "/aselius-platform",
    cta: "View Aselius →",
  },
  {
    title: "Announcing Rivine Agentic Engines",
    body: "Awareness and artificial experience are not an engine unto themselves. They sit under Chat, Research, Cicero, Code, and Creative the way the graph runtime already does: shared, always on, and not a substitute for the internal design of any one product.",
    date: "2026",
    category: "Announcements",
    href: "/aselius-platform/docs/rivine-research",
    cta: "Explore engines →",
  },
];

export function LatestReleases() {
  return (
    <section className="w-full border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-10">
          Latest releases
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {releases.map((r, i) => (
            <motion.article
              key={r.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="baap-container rounded-2xl border border-border p-7 flex flex-col min-h-[320px]"
            >
              <h3 className="text-xl font-medium tracking-tight text-foreground mb-4 leading-snug">
                {r.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground flex-1 mb-8">
                {r.body}
              </p>
              <div className="space-y-3 border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="uppercase tracking-wider text-muted-foreground">Date</span>
                  <span className="text-foreground">{r.date}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="uppercase tracking-wider text-muted-foreground">Category</span>
                  <span className="text-foreground">{r.category}</span>
                </div>
              </div>
              <Link
                href={r.href}
                className="inline-flex w-fit items-center rounded-full bg-[#141512] dark:bg-[#e6e2d8] text-[#e6e2d8] dark:text-[#141512] text-sm font-medium px-4 py-2 hover:opacity-90 transition-opacity"
              >
                {r.cta}
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
