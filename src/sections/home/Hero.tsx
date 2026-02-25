"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { HomeParticleBackground } from "./HomeParticleBackground";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/hero-bg.png"
          alt="Serene landscape"
          className="w-full h-full object-cover"
        />
        {/* Particle Effect: Dust/Star Dust */}
        <HomeParticleBackground />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background dark:from-background/80 dark:via-background/60 dark:to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 dark:from-background/50 dark:to-background/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 flex justify-center"
        >
          <a
            href="https://cloud.beunec.com/aselius-workspace"
            className="inline-flex items-center gap-2 sm:gap-3 p-1 pr-4 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-beunec-blue/10 dark:border-border hover:border-beunec-blue/30 shadow-sm hover:shadow transition-all group"
          >
            <span className="px-3 py-1 bg-beunec-blue text-white text-xs font-semibold rounded-full">
              New
            </span>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Introducing: Aselius Workspace
            </span>
            <ArrowRight className="w-4 h-4 ml-1 text-muted-foreground group-hover:text-beunec-blue group-hover:translate-x-0.5 transition-all" />
          </a>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight"
        >
          <span className="text-gradient">Shaping</span> the{" "}
          <span className="text-gradient">Future of Work</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Redefining how people, agents, and intelligent systems collaborate seemlessly
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-beunec-blue hover:bg-beunec-blue-dark text-white px-8 py-6 text-base font-medium group shadow-calm hover:shadow-calm-lg transition-all duration-300 rounded-full"
          >
            <a href="/cloud-platform">Get Started with BCP</a>
            <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-base font-medium border-2 hover:bg-muted/50 transition-all duration-300 rounded-full"
          >
            <a href="/resources">Explore our Insights</a>
          </Button>
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
