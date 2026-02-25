"use client";

import { motion } from "framer-motion";
import { Bot, FileText, Users, Sparkles } from "lucide-react";

const aiFeatures = [
  {
    icon: Bot,
    label: "Persistent Memory",
    title: "Keep your Context Reliable",
    description:
      "Because your workspace is constantly synced, the Aselius Agents always gives trustworthy answers based on the latest version of your work.",
    image: "/assets/Aselius Persistent Memory Mockup.png",
    imageClassName: "object-contain p-0",
  },
  {
    icon: FileText,
    label: "Search Accuracy",
    title: "Emerge accurately in AI RAG",
    description:
      "Aselius ensures your internal and external AI tools & app connectors surface the correct, latest information, preventing \"Semantic Collapse.\"",
    image: "/assets/Aselius Search Accuracy Mockup.png",
    imageClassName: "object-contain p-0",
  },
  {
    icon: Users,
    label: "Unified Truth",
    title: "Reliable Foundation of Truth",
    description:
      "Aselius with its unified workspace keeps teams in product, engineering, and finance aligned with clear, up-to-date content rooted in real user needs.",
    image: "/assets/Aselius PFE Team Mockup.png",
    imageClassName: "object-contain p-0",
  },
  {
    icon: Sparkles,
    label: "LLM Access",
    title: "Secure Universal Model Access",
    description:
      "Access elite models like Gemini, Llama, and OpenAI with guaranteed privacy. Our zero-retention architecture ensures providers never see your data.",
    image: "/assets/Aselius LLM Access Mockup.png",
    badge: "Rivine-o1-ace Coming Soon",
    imageClassName: "object-contain p-0",
  },
];

export function AIEraSection() {
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
          <span className="text-sm font-semibold tracking-wider text-beunec-blue uppercase mb-4 block dark:text-[#D3D3D3]">
            Agentic Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Built for the <span className="text-beunec-blue">Agentic Era</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-xl">
            As our Agentic-as-an-Infrastructure remains reliable, every high-precision task completed within the Aselius workspace is delivered with deterministic accuracy and professional integrity.
          </p>
        </motion.div>

        {/* AI Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-border hover:border-beunec-blue/30 transition-all duration-300"
            >
              {/* Visual Area */}
              <div className="h-64 sm:h-72 w-full shrink-0 relative bg-background border-b border-border/50 overflow-hidden">
                {/* Badge */}
                {feature.badge && (
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-beunec-blue text-white text-xs font-medium shadow-sm">
                    {feature.badge}
                  </div>
                )}

                <img
                  src={feature.image}
                  alt={feature.title}
                  className={`w-full h-full transform group-hover:scale-105 transition-transform duration-500 ${feature.imageClassName || "object-cover object-top"}`}
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


      </div>
    </section>
  );
}
