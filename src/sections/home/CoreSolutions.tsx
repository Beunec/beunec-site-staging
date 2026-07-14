"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Database, Network, ArrowUpRight } from "lucide-react";

const solutions = [
  {
    icon: Brain,
    title: "Cognitive Harmony",
    description:
      "We build the orchestration layer that lets people and organizations combine human judgment with machine precision, so important work gets done smoothly and reliably.",
    features: ["Human-AI Collaboration", "Intelligent Orchestration", "Seamless Workflows"],
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Database,
    title: "Context Preservation",
    description:
      "We protect the quality of intelligence by carefully managing how information is stored and reused, avoiding the drift and degradation common in generic AI systems.",
    features: ["Knowledge Retention", "Quality Assurance", "Smart Storage"],
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: Network,
    title: "Synergy Architectures",
    description:
      "We design secure, privacy-first & resilient frameworks where humans and AI agents work side by side, helping individuals, teams, and enterprises reach their full potential.",
    features: ["Privacy-First Design", "Secure Frameworks", "Enterprise Ready"],
    color: "from-violet-500/20 to-purple-500/20",
  },
];

export function CoreSolutions() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="platform"
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-beunec-blue/[0.02] to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-beunec-blue/10 text-beunec-blue text-sm font-medium mb-6"
          >
            <Network className="w-4 h-4" />
            Core Solutions
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Built for the{" "}
            <span className="text-gradient">Intelligence Age</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our three pillars of innovation that transform how work happens in the
            modern era.
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative"
            >
              <div
                className={`relative h-full p-8 rounded-2xl bg-gradient-to-br ${solution.color} border border-white/20 dark:border-white/10 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:shadow-calm-lg hover:-translate-y-1`}
              >
                <center>
                  <div className="w-14 h-14 rounded-xl bg-media-blank flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <solution.icon className="w-7 h-7 text-beunec-blue" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-beunec-blue transition-colors duration-300">
                    {solution.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {solution.description}
                  </p>

                  {/* Decorative Gradient */}
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-beunec-blue/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </center>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
