"use client";

import { motion } from "framer-motion";

const programs = [
    { name: "Nvidia Inception Program", src: "/assets/Nvidia Inception Program Badge.avif" },
    { name: "Google Cloud for Startups", src: "/assets/Google Cloud for Startup Program Badge.avif", scaleClass: "scale-[1.7]" },
    { name: "AWS Activate", src: "/assets/AWS Activate Program Badge.avif" },
    { name: "MongoDB for Startups", src: "/assets/MongoDB for Startups Program Badge.avif", scaleClass: "scale-[0.8]" },
    { name: "Redis", src: "/assets/Redis for Startups Program Badge.avif", scaleClass: "scale-[0.55]" },
    { name: "ElevenLabs", src: "/assets/IIElevenLabs  for Startups Program Badge.avif", scaleClass: "scale-[0.9]" },
    { name: "Fireworks AI", src: "/assets/Fireworks AI  for Startups Program Badge.avif", scaleClass: "scale-[1.3]" },
    { name: "Cloudflare for Startups", src: "/assets/Cloudflare  for Startups Program Badge.avif", scaleClass: "scale-[0.8]" },
];

export function AcceleratorsSection() {
    return (
        <section className="py-24 lg:py-32 bg-background border-t border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-16 lg:gap-20">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-3xl sm:text-4xl font-semibold text-slate-700 dark:text-slate-300 mb-6 leading-tight">
                            Supported by leading accelerators and vendor benefit programs
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-[15px]">
                            Beunec participated in leading non-dilutive accelerators and
                            vendor benefits programs to secure infrastructure and research
                            support, while maintaining active or legacy memberships to
                            ensure a robust, resource-backed development cycle necessary for
                            our early development and production.
                        </p>
                    </motion.div>

                    {/* Logos Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-2 sm:grid-cols-4 gap-12 sm:gap-x-16 sm:gap-y-20 items-center justify-items-center"
                    >
                        {programs.map((program, index) => (
                            <motion.div
                                key={program.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                className="w-full flex justify-center"
                            >
                                <img
                                    src={program.src}
                                    alt={program.name}
                                    className={`h-12 sm:h-16 lg:h-20 object-contain  transition-all duration-300 opacity-70 hover:opacity-100 ${program.scaleClass || ""} dark:invert`}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
