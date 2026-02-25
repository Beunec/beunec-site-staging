"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Base",
    price: "$0",
    period: "Forever Free",
    description: "The foundational workspace for individuals organizing their professional life.",
    icon: Sparkles,
    features: [
      "1 Individual Account",
      "50k Aselius Tokens / Day",
      "10 GB Cloud Storage",
      "Multi-Agent System (ARG™)",
      "Surgical Editing (APST™)",
      "Beunec IDE™ Access",
      "7+ Data Sources",
      "8+ App Connectors",
      "Unlimited workspace creation",
      "Standard 24/7 Support",
    ],
    cta: <a href='https://cloud.beunec.com'> Start for free</a>,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "per month",
    description: "For high-performance solo specialists who require daily agentic assistance.",
    icon: Zap,
    features: [
      "Everything in Base, plus:",
      "1M Aselius Tokens / Day",
      "100 GB Cloud Storage",
      "Deep Research & Reasoning",
      "Multi-Agent Write (32k tokens/day)",
      "AI Voice-typing (10 mins/day)",
      "Up to 5 concurrent Task Flows",
      "10MB OCR File Upload Limit",
      "Priority Specialist Support",
    ],
    cta: <a href='https://cloud.beunec.com'> Select Plan</a>,
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Essential",
    price: "$60",
    period: "per month",
    description: "The enterprise-grade tier for researchers, consultants, and firms.",
    icon: Crown,
    features: [
      "Everything in Pro, plus:",
      "5M Aselius Tokens / Day",
      "500 GB Cloud Storage",
      "Unlimited Task Flows",
      "High-Volume Operations",
      "20MB OCR File Upload Limit",
      "100 GB Messaging Storage",
      "Enterprise-grade security",
      "Dedicated Account Manager",
    ],
    cta: <a href='https://cloud.beunec.com'> Select Plan</a>,
    highlighted: false,
  },
];

export function PricingCards() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toggle - Annual/Monthly (Visual only for now) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-12"
        >
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl border ${plan.highlighted
                ? "border-beunec-blue bg-beunec-blue/5 dark:bg-beunec-blue/10"
                : "border-border bg-card"
                } p-6 lg:p-8`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-beunec-blue text-white text-xs font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.highlighted ? "bg-beunec-blue" : "bg-muted"
                  }`}>
                  <plan.icon className={`w-6 h-6 ${plan.highlighted ? "text-white" : "text-beunec-blue dark:text-[#D3D3D3]"}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full mb-6 ${plan.highlighted
                  ? "bg-beunec-blue hover:bg-beunec-blue-dark text-white"
                  : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
              >
                {plan.cta}
              </Button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-beunec-blue" : "text-muted-foreground"
                      }`} />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            Need a custom plan for your organization?{" "}
            <a href="mailto:support@beunec.com" className="text-beunec-blue hover:underline font-medium">
              Contact our sales team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
