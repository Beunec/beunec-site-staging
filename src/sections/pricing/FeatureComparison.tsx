"use client";
import { Fragment } from "react";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

const features = [
  {
    category: "Aselius Workspace™",
    items: [
      { name: "Multi-Agent System (ARG™)", base: true, pro: true, essential: true },
      { name: "Surgical Editing (APST™)", base: true, pro: true, essential: true },
      { name: "Beunec IDE™ Access", base: true, pro: true, essential: true },
      { name: "AI Tokens", base: "1M / Month", pro: "1M / Day", essential: "5M / Day" },
      { name: "File Upload Limit", base: "1 MB", pro: "10 MB", essential: "20 MB" },
      { name: "Deep Research & Reasoning", base: false, pro: true, essential: true },
      { name: "High-Volume Operations", base: false, pro: false, essential: true },
    ],
  },
  {
    category: "Beunec Docs™",
    items: [
      { name: "Unlimited Docs Creation", base: true, pro: true, essential: true },
      { name: "Multi-Agent Write Tokens", base: "15k / Day", pro: "32k / Day", essential: "32k / Day" },
      { name: "AI Voice-typing", base: "3 mins / Day", pro: "10 mins / Day", essential: "10 mins / Day" },
    ],
  },
  {
    category: "Storage & Messaging",
    items: [
      { name: "File & Docs Storage", base: "10 GB", pro: "100 GB", essential: "500 GB" },
      { name: "Messaging Storage", base: "1 GB", pro: "20 GB", essential: "100 GB" },
      { name: "End-to-End Encryption", base: true, pro: true, essential: true },
    ],
  },
  {
    category: "TaskFlow Management",
    items: [
      { name: "Kanban & Milestone Views", base: true, pro: true, essential: true },
      { name: "Concurrent Task Flows", base: "1", pro: "5", essential: "Unlimited" },
    ],
  },
  {
    category: "Connectors & Data",
    items: [
      { name: "Data Sources", base: "7+", pro: "7+", essential: "7+" },
      { name: "App Connectors", base: "8+", pro: "8+", essential: "8+" },
      { name: "Assets & Source Management", base: true, pro: true, essential: true },
      { name: "Dynamic Tool Selection", base: true, pro: true, essential: true },
    ],
  },
  {
    category: "Support",
    items: [
      { name: "Standard 24/7 Support", base: true, pro: true, essential: true },
      { name: "Priority Specialist Support", base: false, pro: true, essential: true },
      { name: "Dedicated Account Manager", base: false, pro: false, essential: true },
    ],
  },
];

export function FeatureComparison() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Compare plans
          </h2>
          <p className="text-muted-foreground">
            Find the perfect plan for your needs
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[800px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold text-foreground">Features</th>
                <th className="text-center py-4 px-4 font-semibold text-foreground w-1/5">
                  <div className="text-lg">Base</div>
                  <div className="text-sm text-muted-foreground font-normal">Free</div>
                </th>
                <th className="text-center py-4 px-4 font-semibold text-foreground w-1/5 bg-beunec-blue/5">
                  <div className="text-lg">Pro</div>
                  <div className="text-sm text-muted-foreground font-normal">$20/mo</div>
                </th>
                <th className="text-center py-4 px-4 font-semibold text-foreground w-1/5">
                  <div className="text-lg">Essential</div>
                  <div className="text-sm text-muted-foreground font-normal">$60/mo</div>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {features.map((section) => (
                <Fragment key={section.category}>
                  {/* Category Header */}
                  <tr key={section.category} className="bg-muted/50">
                    <td colSpan={4} className="py-3 px-4 font-semibold text-sm text-beunec-blue uppercase tracking-wider ">
                      {section.category}
                    </td>
                  </tr>
                  {/* Features */}
                  {section.items.map((item) => (
                    <tr key={item.name} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 text-sm text-foreground">{item.name}</td>
                      <td className="py-4 px-4 text-center">
                        {renderValue(item.base)}
                      </td>
                      <td className="py-4 px-4 text-center bg-beunec-blue/5">
                        {renderValue(item.pro)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {renderValue(item.essential)}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

function renderValue(value: boolean | string) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-green-500 mx-auto" />
    ) : (
      <Minus className="w-5 h-5 text-muted-foreground mx-auto" />
    );
  }
  return <span className="text-sm text-muted-foreground">{value}</span>;
}
