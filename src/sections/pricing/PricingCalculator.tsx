"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const plans = [
  { name: "Base", price: 0 },
  { name: "Pro", price: 20 },
  { name: "Essential", price: 60 },
];

export function PricingCalculator() {
  const [selectedPlan, setSelectedPlan] = useState(1); // Default to Pro
  const [userCount, setUserCount] = useState(1);

  const plan = plans[selectedPlan];
  const monthlyTotal = plan.price * userCount;
  const annualTotal = monthlyTotal * 10; // 2 months free

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Pricing calculator
          </h2>
          <p className="text-muted-foreground">
            Use our calculator to budget for everything your team needs.
          </p>
        </motion.div>

        {/* Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border rounded-2xl p-6 lg:p-8"
        >
          {/* Plan Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-3">
              Select a plan
            </label>
            <div className="grid grid-cols-3 gap-3">
              {plans.map((p, index) => (
                <button
                  key={p.name}
                  onClick={() => setSelectedPlan(index)}
                  className={`p-4 rounded-xl border text-center transition-all ${selectedPlan === index
                      ? "border-beunec-blue bg-beunec-blue/5"
                      : "border-border hover:border-beunec-blue/30"
                    }`}
                >
                  <div className="font-semibold text-foreground">{p.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${p.price}/user
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User Count */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-foreground">
                Number of users
              </label>
              <span className="text-sm text-muted-foreground">
                ${plan.price} per user
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setUserCount(Math.max(1, userCount - 1))}
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={userCount}
                onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center py-2 rounded-lg border border-border bg-background"
              />
              <button
                onClick={() => setUserCount(userCount + 1)}
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Total per month</span>
              <span className="text-2xl font-bold text-foreground">${monthlyTotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Total per year
              </span>
              <span className="text-xl font-semibold text-beunec-blue">${annualTotal}</span>
            </div>
          </div>
        </motion.div>

        {/* Contact Sales */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-6 text-muted-foreground"
        >
          Want custom pricing, or need help selecting the right plan?{" "}
          <a href="#" className="text-beunec-blue hover:underline font-medium">
            Contact our sales team
          </a>
        </motion.p>
      </div>
    </section>
  );
}
