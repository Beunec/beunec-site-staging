"use client";

import { motion } from "framer-motion";

export function TestimonialSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
        >
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <div className="relative">
              <div className="w-40 h-40 md:w-40 md:h-48 rounded-2xl overflow-hidden shadow-lg border border-border">
                <img
                  src="/assets/Helen Hopersky Headshot.jpeg"
                  alt="Helen Hopersky"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Quote */}
          <div className="flex-1 text-center md:text-left">
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-md md:text-lg lg:text-xl font-medium text-foreground leading-relaxed mb-6"
            >
              "I value BCP as a disciplined workspace where AI strengthens my decision-making and judgement rather than replacing it.
              Its structured orchestration and governance-driven design make it a reliable environment for executing tasks efficiently."
            </motion.blockquote>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="font-semibold text-foreground">Helen Hopersky</div>
              <div className="text-sm text-muted-foreground">
                CEO & Co-Founder{" "}
                <span className="text-beunec-blue">Lingua Balance LLC</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
