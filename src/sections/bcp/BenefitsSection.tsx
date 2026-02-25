"use client";

import { motion } from "framer-motion";
import { Ticket, MessageCircle, Rocket, Lightbulb, Database } from "lucide-react";

const benefits = [
  {
    icon: Ticket,
    label: "ROI & TIME RECOVERY",
    title: "High-Stakes Communication & Scheduling",
    description:
      "Delegate your executive overhead to Aselius agents. Agents can read and summarize your Gmail or Outlook data to draft responses, utilizing a mandatory \"Human-in-the-Loop\" system that requires your explicit approval before sending. Simultaneously, agents audit your Google and Outlook calendars to tell you what's next or instantly schedule new events through conversational commands.",
  },
  {
    icon: Database,
    title: "Automated Data Synthesis",
    description:
      "Aselius agents autonomously retrieve and analyze information from connectors like MongoDB, Firebase, Supabase, Stripe, and GitHub. This provides low-cost, synthesized data insights that eliminate manual analysis bottlenecks, freeing your team for strategic high-value projects.",
  },
  {
    icon: Lightbulb,
    title: "Intelligent Document Data",
    description:
      "Aselius agents leverage the ARG™ to establish standardized memory pillars from local and external app files. Our high-precision OCR parses documents with 98% accuracy, including images in PDFs, allowing agents to use APST™ for surgical context extraction and reliable agentic operations.",
  },
  {
    icon: Rocket,
    title: "Ship App Demos Instantly",
    description:
      "Aselius agents autonomously generate and deploy mini-apps, interactive demo dashboards, and prototype React applications. Rendered live within the integrated Monaco space, these tools can be shared instantly with stakeholders, streamlining the path from logic to production-ready artifacts.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground max-w-2xl">
            Recover your focus, and give your team{" "}
            <span className="text-beunec-blue">time back</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-xl">
            Beunec Cloud eliminates the busywork so you can stop &quot;toggling&quot; and start executing.
          </p>
        </motion.div>

        {/* Main Feature Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Large Card */}
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-border overflow-hidden">
            <div className="grid lg:grid-cols-2">
              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="text-xs font-semibold tracking-wider text-beunec-blue uppercase mb-4 dark:text-[#D3D3D3]">
                  {benefits[0].label}
                </span>
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  {benefits[0].title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefits[0].description}
                </p>
              </div>

              {/* Visual */}
              <div className="relative h-72 lg:h-auto w-full p-6 lg:p-10 shrink-0 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-center">
                <div className="w-full h-full relative rounded-2xl overflow-hidden border border-border/50 shadow-sm bg-background group-hover:shadow-md transition-shadow duration-300">
                  <img
                    src="/assets/Aselius Email Composer Mockup.png"
                    alt="Aselius Email Composer Mockup"
                    className="w-full h-full object-cover object-top transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Smaller Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.slice(1).map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-border hover:border-beunec-blue/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-5 h-5 text-beunec-blue dark:text-[#D3D3D3]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
