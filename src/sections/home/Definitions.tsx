"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Lightbulb, Users, UserCog } from "lucide-react";

const definitions = [
  {
    id: "future-of-work",
    icon: Lightbulb,
    title: "What is the Future of Work?",
    subtitle: "Beunec's Definition",
    content:
      "The Future of Work is a concept encompassing evolving practices, changing operations, and the tasks expected of us all heavily influenced by technology, artificial intelligence, finance/banking, and new modes of governance. This evolution directly impacts worker behavior, culture, and leadership, requiring a focus on efficiency, adaptability, and a genuine return on investment in both time and money.",
  },
  {
    id: "societal-concepts",
    icon: Users,
    title: "Societal Figure™ vs Societal Machine™",
    subtitle: "Beunec's Concept",
    content: `A Societal Figure™ is a human identity shaped and limited by societal roles, expectations, and conditioning rather than true human or personal essence. Example: Someone who believes their worth is defined solely by their job title or social status.

A Societal Machine™ is an artificial intelligence constrained by human-defined rules, data, and control systems rather than autonomous adaptive intelligence. Example: An AI that can only act within rigid instructions and cannot evolve beyond its programmed scope.`,
  },
  {
    id: "solution-agent",
    icon: UserCog,
    title: "Who is a Solution Agent™?",
    subtitle: "Beunec's Definition",
    content:
      "A Solution Agent™ is a human or AI who uses intelligence, data, and technology to proactively identify and address problems that humans or AI might overlook or underestimate. They create, invent, and innovate solutions to solve those unconditional problems.",
  },
];

export function Definitions() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="resources"
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-beunec-blue/[0.02] to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-beunec-blue/10 text-beunec-blue text-sm font-medium mb-6"
          >
            <HelpCircle className="w-4 h-4" />
            Key Definitions
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Understanding Our <span className="text-gradient">Language</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Key concepts that define how we think about the future of work and
            human-AI collaboration.
          </p>
        </motion.div>

        {/* Definitions Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {definitions.map((def, index) => (
              <motion.div
                key={def.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <AccordionItem
                  value={def.id}
                  className="border border-border rounded-xl overflow-hidden bg-white dark:bg-slate-900/50 px-6 data-[state=open]:border-beunec-blue/30 transition-colors duration-300"
                >
                  <AccordionTrigger className="py-6 hover:no-underline group">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-beunec-blue/10 flex items-center justify-center flex-shrink-0 group-hover:bg-beunec-blue group-hover:text-white transition-colors duration-300">
                        <def.icon className="w-6 h-6 text-beunec-blue group-hover:text-white transition-colors duration-300 dark:text-[#D3D3D3]" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-beunec-blue mb-1">
                          {def.subtitle}
                        </div>
                        <div className="text-lg font-semibold text-foreground group-hover:text-beunec-blue transition-colors duration-300">
                          {def.title}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="pl-16">
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {def.content}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Have more questions?{" "}
            <a
              href="mailto:support@beunec.com"
              className="text-beunec-blue hover:underline font-medium"
            >
              Contact our team
            </a>{" "}
            for detailed explanations.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
