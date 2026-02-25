"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Layers,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  FolderOpen,
  MessageCircle,
  Workflow
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Aselius Workspace",
    description: "Core component for unified governed multi-agentic orchestration",
  },
  {
    icon: BookOpen,
    title: "Beunec Docs",
    description: "Collaborate in real time on documents",
  },
  {
    icon: FolderOpen,
    title: "Manage Files",
    description: "Secure your work in the cloud",
  },
  {
    icon: MessageCircle,
    title: "Messages",
    description: "Communicate securely with your team",
  },
  {
    icon: Workflow,
    title: "TaskFlow",
    description: "Plan, assign, track and manage tasks",
  },
];

const benefits = [
  "Eliminates the toggle tax",
  "Unified software ecosystem",
  "Proprietary orchestration frameworks",
  "Designed for specialized professionals",
  "Startup-friendly architecture",
];

export function BCPProduct() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="docs"
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-beunec-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-beunec-blue/10 text-beunec-blue text-sm font-medium dark:text-[#D3D3D3]"
              >
                <Sparkles className="w-4 h-4 dark:text-[#D3D3D3]" />
                Our Product
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight"
              >
                Beunec Cloud Platform{" "}
                <span className="text-beunec-blue">(BCP)</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-lg text-muted-foreground leading-relaxed"
              >
                An AI-powered workspace for all your
                productivity tools in one easy home so you can finish your
                big jobs quickly without having to look in many different places.
              </motion.p>
            </div>

            {/* Benefits List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-3"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-beunec-blue flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a href="/cloud-platform"><Button
                size="lg"
                className="bg-beunec-blue hover:bg-beunec-blue-dark text-white px-6 group"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button></a>
              <a href="/bcp-documentation"><Button variant="outline" size="lg" className="px-6">
                View Documentation
              </Button></a>
            </motion.div>
          </motion.div>

          {/* Right Content - Feature Cards */}
          <center>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className={`p-6 rounded-2xl glass-card hover:shadow-calm transition-all duration-300 hover:-translate-y-1 ${index === 0 ? "sm:col-span-2 bg-beunec-blue/5" : ""
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${index === 0
                      ? "bg-beunec-blue text-white"
                      : "bg-beunec-blue text-white"
                      }`}
                  >
                    <feature.icon
                      className={`w-6 h-6 ${index === 0 ? "text-white" : "text-white"
                        }`}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </center>
        </div>

        {/* Technical Note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 p-6 rounded-2xl bg-muted/50 border border-border"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-beunec-blue/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-beunec-blue dark:text-[#D3D3D3]" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                Technical Excellence
              </h4>
              <p className="text-muted-foreground text-sm">
                Uses proprietary orchestration frameworks for a deterministic,
                high-accuracy AI environment. Built with modern architecture
                principles for reliability and scale.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
