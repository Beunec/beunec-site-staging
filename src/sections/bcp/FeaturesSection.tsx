"use client";

import { motion } from "framer-motion";

const features = [
  {
    label: "Aselius Workspace™",
    title: "Controlled-Agency AI Orchestration",
    description:
      "Beunec understands your workspace structure, surrounding content, and style guide. It helps your team rewrite, clarify, and update content right in the editor, without altering how they work.",
    image: "/assets/Aselius App Closeup Mockup.png",
  },
  {
    label: "Beunec Docs™",
    title: "Collaborative editing inside documents",
    description:
      "Collaborate in real-time with your team and utilize over 4 specialized AI agents (Summarizer, Reasoner, Researcher, Translator, Humanizer) to assist with high-fidelity writing, just one click away.",
    image: "/assets/Beunec Docs App Mockup.png",
  },
  {
    label: "Manage Files",
    title: "Centralized Secure File Management",
    description:
      "A centralized, secure environment to view, manage, and share uploaded files across the entire BCP ecosystem with granular permission controls and enterprise encryption.",
    image: "/assets/Manage Files App Mockup.png",
  },
  {
    label: "Messages",
    title: "Encrypted Private Communication",
    description:
      "Communicate securely with teams using CloudHandle identifiers and end-to-end encryption. Create productivity-focused channels and group chats to keep your team aligned.",
    image: "/assets/Messages App Mockup.png",
  },
  {
    label: "TaskFlow",
    title: "Smart Agile Project Planner",
    description:
      "An intelligent project planner to create, assign, and track project timelines and milestones via a real-time Kanban interface designed for agile professionals.",
    image: "/assets/TaskFlow App Mockup.png",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-sm font-semibold tracking-wider text-beunec-blue uppercase mb-4 block dark:text-[#D3D3D3]">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground max-w-2xl">
            A workspace engine built for{" "}
            <span className="text-beunec-blue">high-stakes execution</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-xl">
            Beunec Cloud Platform learns your professional standards so your output stays accurate, verified, and dependable.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-6">
          {/* First row - 2 larger cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {features.slice(0, 2).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-muted/50 border border-border hover:border-beunec-blue/30 transition-all duration-300"
              >
                {/* Visual Area */}
                <div className="h-64 sm:h-72 w-full shrink-0 relative bg-background border-b border-border/50 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <span className="text-xs font-semibold tracking-wider text-beunec-blue uppercase dark:text-[#D3D3D3]">
                    {feature.label}
                  </span>
                  <h3 className="text-xl font-semibold text-foreground mt-2 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Second row - 3 smaller cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.slice(2).map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index + 2) * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-muted/50 border border-border hover:border-beunec-blue/30 hover:bg-muted transition-all duration-300 flex flex-col"
              >
                {/* Image Area */}
                <div className="h-48 sm:h-56 w-full shrink-0 relative bg-background border-b border-border/50 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6">
                  <span className="text-xs font-semibold tracking-wider text-beunec-blue uppercase dark:text-[#D3D3D3]">
                    {feature.label}
                  </span>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section >
  );
}
