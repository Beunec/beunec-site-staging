"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Maximize2, Network } from "lucide-react";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";

const logos = [
  { name: "Beunec Consulting", url: "https://ik.imagekit.io/xx89tvb26/Beunec%20Consulting%20Logo%20Transparent.svg" },
  { name: "Google", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Rutgers University", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Rutgers_University_with_the_state_university_logo.svg" },
  { name: "Macquarie University", url: "https://cdn.worldvectorlogo.com/logos/macquarie-university-1.svg" },
  { name: "University of Virginia", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/University_of_Virginia_logo.svg/1280px-University_of_Virginia_logo.svg.png" },
  { name: "Amazon", url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Microsoft", url: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "NYU", url: "https://commons.wikimedia.org/wiki/Special:FilePath/Nyu_short_color.svg" },
  { name: "Calorie Dense Nutrition", url: "https://cdnbars.com/cdn/shop/files/CDN.svg" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <ParticleBackground />
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-beunec-blue/5 via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground leading-[1.1]">
              Unified work.{" "}
              <span className="text-beunec-blue">Orchestrated intelligence.</span>{" "}
              Governance
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              BCP unifies your tools and AI workspace into a focused environment for high‑stakes, specialized work.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://cloud.beunec.com/"><Button
                size="lg"
                className="bg-beunec-blue hover:bg-beunec-blue-dark text-white px-8 group rounded-full"
              >
                Start for free
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button> </a>
              <a href="https://www.youtube.com/watch?v=fL-wgnIflps"><Button
                variant="outline"
                size="lg"
                className="px-8 border-2 rounded-full"
              >
                Watch a demo
              </Button></a>
            </div>

            {/* Secondary Link */}
            <motion.a
              href="/bcp-documentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-beunec-blue transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Read our use cases
            </motion.a>

            {/* Key Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="pt-10 mt-10 grid grid-cols-3 gap-3 sm:gap-3"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00487C] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#00487C]/20">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-foreground leading-snug text-center sm:text-left">Privacy-first<br />Design</div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00487C] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#00487C]/20">
                  <Maximize2 className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-foreground leading-snug text-center sm:text-left">Flexibility &<br />Scalability</div>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00487C] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#00487C]/20">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-foreground leading-snug text-center sm:text-left">Governed<br />Orchestration</div>
              </div>
            </motion.div>
          </motion.div>



          {/* Graphic Art Mockup */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}

          >
            <img
              src="/assets/Beunec Cloud Hero Section Graphic Art.png"
              alt="Beunec Cloud Graphic Art"
              className="w-auto h-auto object-cover rounded-md"
            />
          </motion.div>



        </div>

        {/* Trusted Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-24 lg:mt-32 pt-10 border-t border-border/50"
        >
          <p className="text-center text-md font-medium text-muted-foreground mb-10">
            Trusted by top professionals of all levels and teams of leading companies and institutions.
          </p>

          <div className="relative overflow-hidden w-full flex items-center h-16">
            {/* Left/Right Fade out */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />

            <motion.div
              className="flex items-center gap-16 whitespace-nowrap min-w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...logos, ...logos].map((logo, index) => (
                <img
                  key={index}
                  src={logo.url}
                  alt={logo.name}
                  className="h-8 md:h-8 object-contain opacity-60 dark:opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300  dark:brightness-0 dark:invert"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
