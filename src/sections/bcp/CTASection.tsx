"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="pt-24 lg:pt-32 relative overflow-hidden backdrop-blur-sm">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-beunec-blue/5 to-beunec-blue/10" />

      {/* Decorative Elements */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-beunec-blue/10 blur-3xl"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Build knowledge that{" "}
            <span className="text-beunec-blue">never stands still</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join the thousands of teams using Beunec and create workspace
            orchestration that evolves alongside your product
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-beunec-blue hover:bg-beunec-blue-dark text-white px-8 group"
            >
              Start for free
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 border-2"
            >
              Talk to us
            </Button>
          </div>
        </motion.div>

        {/* Graphic Art */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-0 sm:mt-0 px-4 sm:px-0 flex justify-center w-full -mb-8 lg:-mb-12"
        >
          <div className="w-full flex justify-center translate-y-4 lg:translate-y-8">
            <img
              src="/assets/Beunec Cloud CTA Section Graphic Art.png"
              alt="Beunec Cloud Platform Interface Visualization"
              className="w-full h-auto max-w-4xl object-contain object-bottom block"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
