"use client";

import { motion } from "framer-motion";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";

export function PricingHero() {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      <ParticleBackground />
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-beunec-blue/5 via-transparent to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold tracking-wider text-beunec-blue uppercase mb-4 block dark:text-[#D3D3D3]">
            Plans
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Pricing
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the world's first System Orchestrator. Designed to eliminate
            the "Toggle Tax" for specialized professionals in Legal, Finance, Research,
            and Consulting.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
