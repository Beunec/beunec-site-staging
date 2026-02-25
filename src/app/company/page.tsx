"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";
import Link from "next/link";

export default function CompanyPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-20">
                {/* Section 1: Hero */}
                <section className="relative py-20 overflow-hidden">
                    <ParticleBackground />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-6xl font-serif text-foreground mb-6"
                            >
                                Redefining Productivity Through <br /> Intelligent Awareness
                            </motion.h1>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto"
                            >
                                <img
                                    src="/assets/open-space-office.avif"
                                    alt="Beunec Office"
                                    className="w-full h-auto object-cover"
                                />
                            </motion.div>
                        </div>

                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-2xl font-medium text-foreground mb-6">Who we are</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                                Beunec is a research and deployment company, founded in 2024 in New Jersey, focused on shaping the future of work for professionals, startups, and SMEs. We build cloud-based, privacy-first, data-readiness, and security-driven systems that transform fragmented digital workflows into a unified, intelligent ecosystem where humans and AI collaborate seamlessly; we are the system orchestrator for the intelligence age.
                            </p>
                            <Button asChild className="bg-beunec-blue hover:bg-beunec-blue-dark text-white rounded-lg px-8 py-6 text-lg">
                                <Link href="/cloud-platform">
                                    See our Solution
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Section 2: 2050 Vision & Agenda */}
                <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="text-beunec-blue font-semibold tracking-widest uppercase text-sm mb-4 block dark:text-[#D3D3D3]">
                                    Our 2050 Vision & Agenda
                                </span>
                                <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-8">
                                    Immersive Intelligent Work Future
                                </h2>
                                <div className="space-y-6">
                                    <p className="text-muted-foreground leading-relaxed">
                                        Beunec's 2050 Vision is to create a world where humans, AI, and humanoid systems work together seamlessly across physical and digital spaces, transforming how organizations train, hire, and operate. Its Four Pillars: A unified Beunec identity layer, humanoid-ready workflows, autonomous agentic ecosystems that handle daily work, and governance by design so trust, privacy, and compliance are built into every interaction.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Beunec's Agenda is to move from 2024 vision and system architecture readiness into 2025-2026 full Beunec Cloud and ID activation, reach 2027-2030 early humanoid-agent integration and education toolkits, expand 2035-2040 into cross-industry workforce simulation and global governance ecosystems, and by 2050 have humanoid systems fully mainstreamed into workflows worldwide.
                                    </p>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]"
                            >
                                {/* I'll use a placeholder or generic team image if specific vision image isn't named, 
                    but the user referred to the uploaded screenshot which shows a meeting. 
                    Since they didn't provide a path for this specific vision image in text, 
                    I'll use are-you-human-humanoid.avif or similar if available, or just skip if not specified.
                    Actually, the prompt says "new page and its sections" and provides media for other sections.
                    I will use a placeholder for this one if no asset is provided, but wait, 
                    Image 2 in the screenshots is for this section.
                */}
                                <img
                                    src="/assets/mbmforumgrouppic.avif"
                                    alt="Beunec Vision"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Built on Purpose */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-lg"
                            >
                                <img
                                    src="/assets/beunec-mbm-forum.avif"
                                    alt="Beunec Mission"
                                    className="w-full h-auto"
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="order-1 lg:order-2"
                            >
                                <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
                                    Built on Purpose. Designed for Evolution.
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8">
                                    We were founded in 2023 and incorporated in 2024 with a main goal: "to ensure individuals, teams & enterprises are prepared to thrive in a future workforce built on AGI, humanoids, and agentic systems." We believe in scalable, ethical technology that reimagines how work is done from operations to collaboration.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Video Background */}
                <section className="py-24 bg-background overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative h-[500px] md:h-[600px] rounded-[40px] overflow-hidden flex items-center justify-center bg-slate-900 group"
                        >
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                            >
                                <source src="https://ik.imagekit.io/beuneccloud25/Beunec,%20Future%20of%20Work%20Hero%20Section.mp4" type="video/mp4" />
                            </video>

                            {/* Overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/60" />

                            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                                <motion.h2
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl md:text-6xl font-serif text-white mb-0"
                                >
                                    Shaping the Future <br className="hidden md:block" /> of Human-AI Collaboration
                                </motion.h2>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Section 5: Core Definition */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-20">
                            <h2 className="text-3xl font-serif text-foreground mb-12">Core Definition & Company Identity</h2>
                            <div className="grid lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-beunec-blue mb-4 flex items-center gap-2 dark:text-[#D3D3D3]">
                                            Beunec® = Bone + Unique + C
                                        </h3>
                                        <ul className="space-y-2 text-muted-foreground">
                                            <li>• "Bene" — Latin for goodness, integrity</li>
                                            <li>• "Unique" — Singular in design, purpose, and identity</li>
                                            <li>• "C" — Code, Consciousness, Company</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-beunec-blue mb-4 dark:text-[#D3D3D3]">Definition Strip:</h3>
                                        <p className="italic text-muted-foreground">
                                            "Beunec®: means an entity that embodies excellence, uniqueness, and technological innovation in delivering future-ready business solutions."
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-beunec-blue mb-4 dark:text-[#D3D3D3]">What We Do:</h3>
                                        <ul className="space-y-3">
                                            {[
                                                "Build agent-governed cloud platforms",
                                                "Architect agentic-intelligent ecosystems",
                                                "Engineer Immersive, ID-verified digital experiences"
                                            ].map((item) => (
                                                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                                                    <CheckCircle2 className="w-5 h-5 text-beunec-blue mt-0.5 shrink-0 dark:text-[#D3D3D3]" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex gap-12 text-sm text-muted-foreground pt-4 dark:text-[#D3D3D3]">
                                        <div>
                                            <strong>Company Type:</strong> Private | NJ | March, 2024
                                        </div>
                                        <div>
                                            <strong>Trademark:</strong> Beunec® (Registered with USPTO)
                                        </div>
                                    </div>
                                </div>
                                <div className="relative rounded-2xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-800">
                                    <img
                                        src="/assets/abstractcontourmapdesign.avif"
                                        alt="Beunec Identity Map"
                                        className="w-full h-full object-cover opacity-80"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 6: Brand Elements */}
                <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-start">
                            <div className="space-y-12">
                                <div>
                                    <h2 className="text-3xl font-serif text-foreground mb-8">Brand Elements & Visual Language</h2>
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="font-bold text-beunec-blue uppercase tracking-wider text-sm mb-4 dark:text-[#D3D3D3]">Typography:</h4>
                                            <ul className="space-y-2 text-muted-foreground">
                                                <li>• Titles: EB Garamond, Forum, Philosopher</li>
                                                <li>• Body: Inter, Source Serif Pro</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-beunec-blue uppercase tracking-wider text-sm mb-4 dark:text-[#D3D3D3]">Primary Palette:</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                                                {[
                                                    { name: "Beunec Navy Blue", hex: "#00477d", desc: "Trust & Intelligence" },
                                                    { name: "Off-white", hex: "#e7ecef", desc: "Clarity & Simplicity" },
                                                    { name: "Golden Yellow", hex: "#ffd38c", desc: "Warmth & Purpose" },
                                                    { name: "Fern Green", hex: "#a9cbb7", desc: "Growth & Harmony" },
                                                    { name: "Midnight Slate", hex: "#1e293b", desc: "Authority & Precision" },
                                                    { name: "Soft Clay", hex: "#d4a373", desc: "Organic & Grounded" },
                                                ].map((color) => (

                                                    <div key={color.name} className="flex flex-col gap-2">
                                                        <div
                                                            className="w-full h-12 rounded-md shadow-sm border border-black/5"
                                                            style={{ backgroundColor: color.hex }}
                                                        />
                                                        <div className="text-xs">
                                                            <div className="font-bold">{color.name}</div>
                                                            <div className="text-muted-foreground">{color.hex}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-beunec-blue uppercase tracking-wider text-sm mb-4 dark:text-[#D3D3D3]">Style Ethos:</h4>
                                            <ul className="space-y-2 text-muted-foreground">
                                                <li>• Minimalist, Mindful, Agentically Intelligent</li>
                                                <li>• Aesthetic rooted in digital elegance and ancient clarity</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-beunec-blue uppercase tracking-wider text-sm mb-6 dark:text-[#D3D3D3]">Logo Usage & Brand Protection</h4>
                                    <ul className="space-y-4 text-sm text-muted-foreground">
                                        <li>• Logos: Full logo, symbol-only, monochrome version</li>
                                        <li>• Usage Guidelines:
                                            <ul className="pl-4 mt-2 space-y-1">
                                                <li>- Clear margin rules</li>
                                                <li>- No distortions, shadow overlays, or unauthorized recoloring</li>
                                                <li>- Trademark: Beunec® — registered & protected</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    className="rounded-2xl overflow-hidden shadow-lg aspect-[16/10]"
                                >
                                    <img src="/assets/balloonoververdanthills.avif" alt="Brand Vision" className="w-full h-full object-cover" />
                                </motion.div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-border flex items-center justify-center">
                                        <img src="/assets/beunec-logo-transparent-blacktext.png" alt="Beunec Logo Black" className="h-10 w-auto" />
                                    </div>
                                    <div className="bg-slate-900 p-8 rounded-xl shadow-sm border border-border flex items-center justify-center">
                                        <img src="/assets/beunec-logo-transparent-whitetext.png" alt="Beunec Logo White" className="h-10 w-auto" />
                                    </div>
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-border flex items-center justify-center">
                                        <img src="/assets/Beunec_logo_black.png" alt="Beunec Logo Full Black" className="h-10 w-auto" />
                                    </div>
                                    <div className="bg-beunec-blue/5 p-8 rounded-xl shadow-sm border border-border flex items-center justify-center">
                                        <img src="/assets/beunec-logo.png" alt="Beunec Logo Standard" className="h-10 w-auto" />
                                    </div>
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-border flex items-center justify-center">
                                        <img src="/assets/beunec-cloud-logo-icon.png" alt="Beunec Cloud Icon" className="h-10 w-auto" />
                                    </div>
                                    <div className="bg-slate-950 p-8 rounded-xl shadow-sm border border-border flex items-center justify-center text-white">
                                        <img src="/assets/beunec-cloud-logo-transparent.png" alt="Beunec Cloud Transparent" className="h-10 w-auto" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
