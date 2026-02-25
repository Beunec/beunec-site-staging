"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Eye, Target, ShieldCheck, Bot, Workflow } from "lucide-react";

export function VisionMission() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-beunec-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-beunec-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-beunec-blue/10 text-beunec-blue text-sm font-medium dark:text-[#D3D3D3]"
              >
                <Eye className="w-4 h-4 dark:text-[#D3D3D3]" />
                Our Vision
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight"
              >
                A world where work is{" "}
                <span className="text-gradient">seamlessly orchestrated</span>
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              At Beunec, we envision a world where work is seamlessly orchestrated
              between humans and intelligent systems, unlocking a more focused and
              productive intelligence age for everyone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-beunec-blue/5 to-transparent border border-beunec-blue/10"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-beunec-blue/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-beunec-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Our Mission
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To empower professionals and teams by creating a trusted, privacy‑first
                    company that turns today’s fragmented digital work into clear,
                    governed, high‑impact outcomes.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Central Circle */}
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-beunec-blue/20 via-beunec-blue/10 to-transparent flex items-center justify-center"
              >
                <div className="w-32 h-32 rounded-full bg-beunec-blue/10 flex items-center justify-center">
                  <img
                    src="/assets/beunec-logo-transparent-blacktext.png"
                    alt="Beunec"
                    className="w-20 h-20 object-contain dark:hidden"
                  />
                  <img
                    src="/assets/beunec-logo-transparent-whitetext.png"
                    alt="Beunec"
                    className="w-20 h-20 object-contain hidden dark:block"
                  />
                </div>
              </motion.div>

              {/* Orbiting Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 z-10"
              >
                {[
                  { icon: ShieldCheck, name: "Trust & Privacy" },
                  { icon: Bot, name: "Intelligent Systems" },
                  { icon: Workflow, name: "Seamless Orchestration" },
                  { icon: Target, name: "High-Impact Outcomes" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  // Position items identically around a 35% radius
                  const top = `calc(${50 + 35 * Math.sin((i * Math.PI) / 2)}% - 32px)`;
                  const left = `calc(${50 + 35 * Math.cos((i * Math.PI) / 2)}% - 32px)`;

                  return (
                    <div
                      key={item.name}
                      className="absolute w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-border flex items-center justify-center hover:scale-110 transition-transform duration-300"
                      style={{ top, left }}
                    >
                      {/* Counter-rotate to keep icons perfectly upright relative to page */}
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <Icon strokeWidth={2.5} className="w-6 h-6 text-beunec-blue drop-shadow-sm dark:text-[#D3D3D3]" />
                      </motion.div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                <circle
                  cx="50%"
                  cy="50%"
                  r="35%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-beunec-blue/20"
                />
              </svg>
            </div>

            {/* Stats Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full glass shadow-calm"
            >
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-beunec-blue">2024</div>
                  <div className="text-xs text-muted-foreground">Founded</div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-beunec-blue">20+</div>
                  <div className="text-xs text-muted-foreground">Projects</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
