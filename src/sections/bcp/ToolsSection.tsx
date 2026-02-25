"use client";

import { motion } from "framer-motion";
import { Workflow, Brain, PenTool, ClipboardCheck } from "lucide-react";

const tools = [
  {
    icon: Workflow,
    title: "De Orchestrator",
    description:
      "BCP handles the \"heavy lifting\" by connecting your preferred tools and data sources. It maps your entire digital stack so you never have to search for a context again.",
  },
  {
    icon: Brain,
    title: "De Reasoner",
    description:
      "Powered by the ARG™, this agent executes complex logic from legal cross-referencing to financial audits using reflective intelligence that moves beyond simple chat.",
  },
  {
    icon: PenTool,
    title: "De Scribe",
    description:
      "Our collaborative writing agent doesn't just \"generate\" text; it uses APST™ to surgically edit and refine your drafts within the Canvas, keeping your voice consistent.",
  },
  {
    icon: ClipboardCheck,
    title: "De Auditor",
    description:
      "Meet your new compliance safety-switch. Aselius’s ARG™ audits every response against human ethics and enterprise standards before you ever see it.",
  },
];

export function ToolsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-wider text-beunec-blue uppercase mb-4 block">
            PROACTIVE PARTNER
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Work with a Dynamic{" "}
            <span className="text-beunec-blue">System Orchestrator</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            BCP lives where you work, managing your tools, files, and logic so you can stay in the zone.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <center key={tool.title}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="h-full p-6 rounded-2xl bg-muted/50 border border-border hover:border-beunec-blue/30 hover:bg-muted transition-all duration-300">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <tool.icon className="w-6 h-6 text-beunec-blue dark:text-[#D3D3D3]" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {tool.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </motion.div>
            </center>
          ))}
        </div>
      </div>
    </section>
  );
}
