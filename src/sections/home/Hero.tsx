"use client";

import { motion } from "framer-motion";
import { AgenticMindMap } from "./AgenticMindMap";

export const Hero = () => {
  return (
    <section className="w-full relative pt-28 md:pt-36 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 lg:items-end mb-12 md:mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem] leading-[1.05] tracking-tight text-foreground font-extrabold"
          >
            Understanding, developing, and actualizing{" "}
            <span className="underline underline-offset-[0.12em] decoration-2 decoration-[color:var(--accent-sage)]">
              Agentic Infrastructure
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-xl lg:ml-auto lg:mb-1"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            To move toward what is unstable, understand it without fear or exaggeration, and
            contribute the research, invention, governance, and deployment required to make it
            stable.
          </motion.p>
        </div>
      </div>

      {/* Outside max-w-7xl so it can expand wall-to-wall past the page margin */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <AgenticMindMap
          title="Beunec was born as a solution agent."
          subtitle="Drawn toward unstable systems, not to exploit their disorder, but to understand them and help make them stable."
          ctaLabel="Learn more"
          onCta={() => {
            document
              .getElementById("/company")
              ?.scrollIntoView({ behavior: "smooth" });
            window.location.href = "/company";
          }}
        />
      </motion.div>
    </section>
  );
}
