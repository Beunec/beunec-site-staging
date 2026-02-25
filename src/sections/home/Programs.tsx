"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, ArrowRight, Clock, Users } from "lucide-react";

const programs = [
  {
    icon: GraduationCap,
    title: "Beunec Campus Leaders Program",
    description:
      "A student-focused initiative designed to empower the next generation of innovators. Join our community of campus ambassadors and help shape the future of work at your university.",
    status: "active",
    badge: "Now Open",
    features: ["Student Network", "Leadership Training", "Early Access"],
  },
  {
    icon: Briefcase,
    title: "BCP Strategic Fellow",
    description:
      "A contractor position for strategic thinkers who want to contribute to our mission. Work alongside our core team on high-impact projects.",
    status: "coming-soon",
    badge: "Coming Soon",
    features: ["Strategic Projects", "Remote Friendly", "Competitive Pay"],
  },
];

export function Programs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-beunec-blue/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-beunec-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-beunec-blue/10 text-beunec-blue text-sm font-medium mb-6"
          >
            <Users className="w-4 h-4" />
            Programs & Careers
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Join Our <span className="text-gradient">Journey</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Be part of the movement shaping the future of work.
          </p>
        </motion.div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative"
            >
              <div
                className={`relative h-full p-8 rounded-2xl border transition-all duration-500 ${program.status === "active"
                    ? "bg-white dark:bg-slate-900/50 border-border hover:border-beunec-blue/30 hover:shadow-calm"
                    : "bg-muted/30 border-border/50"
                  }`}
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${program.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                  >
                    {program.status === "coming-soon" && (
                      <Clock className="w-3 h-3" />
                    )}
                    {program.badge}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${program.status === "active"
                      ? "bg-beunec-blue/10 group-hover:bg-beunec-blue group-hover:text-white"
                      : "bg-muted"
                    } transition-colors duration-300`}
                >
                  <program.icon
                    className={`w-7 h-7 ${program.status === "active"
                        ? "text-beunec-blue group-hover:text-white dark:text-[#D3D3D3]"
                        : "text-muted-foreground"
                      } transition-colors duration-300`}
                  />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {program.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {program.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {program.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                {program.status === "active" ? (
                  <Button
                    className="w-full bg-beunec-blue hover:bg-beunec-blue-dark text-white group/btn"
                  >
                    Apply Now
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <Clock className="mr-2 w-4 h-4" />
                    Coming Soon
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
