"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { TrendingUp, Calendar, DollarSign, Package } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: 20,
    suffix: "+",
    label: "Research Projects",
    description: "Active innovation initiatives",
  },
  {
    icon: Calendar,
    value: 2024,
    suffix: "",
    label: "Year Incorporated",
    description: "Founded with a vision",
  },
  {
    icon: DollarSign,
    value: 54,
    suffix: "k+",
    label: "Non-Dilutive Grant",
    description: "Funding secured",
  },
  {
    icon: Package,
    value: 1,
    suffix: "+",
    label: "Product",
    description: "BCP Platform live",
  },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const stepValue = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += stepValue;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

export function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-beunec-blue/5 via-transparent to-beunec-blue/5" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Beunec in <span className="text-gradient">Figures</span>
          </h2>
          <p className="text-muted-foreground">
            Our journey so far, measured in milestones and achievements.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="group relative"
            >
              <div className="relative p-6 lg:p-8 rounded-2xl bg-white dark:bg-slate-900/50 border border-border hover:border-beunec-blue/30 transition-all duration-300 hover:shadow-calm text-center">
                {/* Icon */}
                <div className="w-12 h-12 mx-auto rounded-xl bg-beunec-blue/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-beunec-blue dark:text-[#D3D3D3]" />
                </div>

                {/* Value */}
                <div className="text-4xl lg:text-5xl font-bold text-foreground mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <div className="text-sm font-medium text-foreground mb-1">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-beunec-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
