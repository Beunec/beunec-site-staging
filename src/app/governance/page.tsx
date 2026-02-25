"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, FileText, Database, Lock } from "lucide-react";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";
import Link from "next/link";

export default function GovernancePage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="pt-20">
                {/* Section 1: Hero */}
                <section className="relative pt-24 pb-16 overflow-hidden bg-slate-50 dark:bg-slate-900/20">
                    <ParticleBackground />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6"
                        >
                            Governance as an Asset: <br className="hidden md:block" /> Securing the Future of Work
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="max-w-3xl mx-auto text-muted-foreground text-lg mb-10"
                        >
                            At Beunec, we believe that for AI to be useful, it must be verifiable. We combine rigorous data readiness frameworks with high-fidelity security protocols to ensure that every work operation is accurate, compliant, and mathematically isolated.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                        >
                            <Button size="lg" className="bg-beunec-blue hover:bg-beunec-blue-dark text-white rounded-lg -rotate-12 transform transition-all hover:rotate-0">
                                View Our Transparency Report
                            </Button>
                            <Button asChild size="lg" className="bg-beunec-blue hover:bg-beunec-blue-dark text-white rounded-lg rotate-12 transform transition-all hover:rotate-0">
                                <Link href="/data-readiness-policy">
                                    Read Data Readiness Framework
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                    <div className="max-w-5xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-t-[40px] overflow-hidden shadow-2xl border border-border h-[300px] md:h-[450px]"
                        >
                            <img
                                src="/assets/abstractstack.avif"
                                alt="Governance Visual"
                                className="w-full h-full object-cover scale-[1.8] object-bottom"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Section 2: Engineered for Reliability */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
                                    Engineered for Reliability
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8 italic">
                                    A Foundation Built on Institutional Pedigree. Beunec is more than a software provider; we are a Research and Deployment company. Our reliability is anchored in three core pillars:
                                </p>
                                <div className="space-y-6">
                                    {[
                                        {
                                            title: "Infrastructure Depth",
                                            desc: "Supported by an expansive non-dilutive credit bank from NVIDIA, AWS, Google Cloud, and MongoDB, we operate a 'Cost-Effective' infrastructure stack that ensures indefinite operational runway and 99.9% uptime for our users."
                                        },
                                        {
                                            title: "Expert Leadership",
                                            desc: "Our team combines specialized insights from funds management (Rutgers UES), deep-scale systems engineering (CSG International), and cognitive AI architecture (UC San Diego)."
                                        },
                                        {
                                            title: "Systemic Resilience",
                                            desc: "We move beyond 'AI Wrappers.' By building our own proprietary frameworks (ARG™ and Beunec-AE), we provide a steadfast technical moat that generalist models cannot replicate."
                                        }
                                    ].map((pillar) => (
                                        <div key={pillar.title} className="flex gap-4">
                                            <div className="h-6 w-1 bg-beunec-blue mt-1 shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-foreground mb-1">• {pillar.title}:</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="rounded-2xl overflow-hidden shadow-xl"
                            >
                                <img
                                    src="/assets/beunecteam@2024awssummit.avif"
                                    alt="Beunec Team at AWS Summit"
                                    className="w-full h-auto object-cover"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Data Readiness Framework */}
                <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-lg"
                            >
                                <img
                                    src="/assets/2024developercontest.avif"
                                    alt="Beunec Data Readiness"
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
                                    Our Data Readiness Framework
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8">
                                    Transforming Data from a Burden into a Recognized Asset. We implement a structured, multi-step Data Readiness Framework to ensure that the information powering our intelligence is clean, secure, and actionable:
                                </p>
                                <div className="space-y-4">
                                    {[
                                        "Assessment & Objectives: We establish a baseline for data management, mapping gaps between current states and the desired state of regulatory compliance (EU/US AI Acts).",
                                        "Accountability Culture: We foster data literacy across our teams, establishing clear roles for Data Stewards to ensure integrity at every layer of the organization.",
                                        "Governance Implementation: We enforce strict policies for data usage and privacy, cleansing and standardizing data to eliminate outliers and inconsistencies.",
                                        "Technical Readiness: We utilize automated monitoring in our data pipelines to ensure that our infrastructure remains 'ready' and high-quality at all times.",
                                        "Performance Monitoring: We use real-time scorecards to track data completeness and accuracy, adjusting our strategies based on verifiable results."
                                    ].map((item) => (
                                        <div key={item.split(':')[0]} className="flex gap-4">
                                            <CheckCircle2 className="w-5 h-5 text-beunec-blue mt-1 shrink-0" />
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                <strong className="text-foreground">• {item.split(':')[0]}:</strong>{item.split(':')[1]}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Trust and Transparency */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
                                    Trust and Transparency
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8">
                                    Mathematical Privacy and Zero-Access Policies. We recognize that in high-stakes professions (Legal, Accounting, Consulting), trust is the only currency. We maintain this through:
                                </p>
                                <ul className="space-y-6">
                                    {[
                                        {
                                            icon: ShieldCheck,
                                            title: "Zero-Access Internal Policy",
                                            desc: "The Beunec team has zero access to user data. Our internal behavior is governed by strict protocols that prevent any human-in-the-loop from viewing personal or professional artifacts."
                                        },
                                        {
                                            icon: Lock,
                                            title: "End-to-End Encryption",
                                            desc: "We utilize cryptographic encryption for all user data. This ensures that information is encrypted not just for us, but also for the third-party vendor services we use; even our service providers see only encrypted strings (e.g., ehi2h203...)."
                                        },
                                        {
                                            icon: Database,
                                            title: "Auditability",
                                            desc: "Every action taken within our ecosystem is governed by an auditable 'Decision Trace,' ensuring that professionals can explain and verify the logic behind every synthetic insight."
                                        }
                                    ].map((item) => (
                                        <li key={item.title} className="flex items-start gap-4">
                                            <div className="bg-beunec-blue/10 p-2 rounded-lg shrink-0">
                                                <item.icon className="w-5 h-5 text-beunec-blue" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground mb-1">• {item.title}:</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="rounded-2xl overflow-hidden shadow-xl"
                            >
                                <img
                                    src="/assets/puzzleart.avif"
                                    alt="Trust and Transparency"
                                    className="w-full h-auto object-cover"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Orchestrated Agentic AI Infrastructure */}
                <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-lg"
                            >
                                <img
                                    src="/assets/agenticai.avif"
                                    alt="Agentic AI Infrastructure"
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
                                    Orchestrated Agentic AI Infrastructure
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8">
                                    Security-First Design for the Intelligence Age. Our Agentic AI infrastructure is orchestrated to follow a 'Privacy-First' design structure, strictly separated from the vulnerabilities of generalist chat interfaces:
                                </p>
                                <div className="space-y-6">
                                    {[
                                        {
                                            tag: "ARG™ (Agentic Retrieval Generation™)",
                                            desc: "This core framework serves as the multi-agent orchestration system for our workspaces. It integrates retrieval-generation intelligence with task coordination and quality control, enabling Agent Collaboration, Real-time Task Adaptation, and Governance Verification via ReACT, TOT, and COT processing."
                                        },
                                        {
                                            tag: "Beunec Artificial Experience™ (Beunec AE™) [Coming Soon]",
                                            desc: "A secure, intelligent 'Consciousness Layer' between the user and raw LLMs. It acts as a biological-style filter, managing memory pillars to prevent 'Semantic Collapse' (model degradation from over-contextualization) and context drift while drastically reducing operational costs."
                                        },
                                        {
                                            tag: "Cicero™ System Compliance [Coming Soon]",
                                            desc: "Built into our core architecture, the Cicero system audits requests and responses in real-time against national/state laws and standards retrieved via government APIs prior to execution."
                                        }
                                    ].map((item) => (
                                        <div key={item.tag} className="flex gap-4">
                                            <div className="h-6 w-1 bg-beunec-blue mt-1 shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-foreground mb-1">• {item.tag}:</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 6: CTA */}
                <section className="py-32 relative overflow-hidden bg-white dark:bg-slate-950">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-beunec-blue/5 rounded-full blur-[120px]" />
                        {/* Subtle grid or clouds could go here to match screenshot */}
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-serif text-foreground mb-6"
                        >
                            Build with a Partner You Can Verify
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="max-w-2xl mx-auto text-muted-foreground text-lg mb-12 font-medium"
                        >
                            Join the specialized professionals & teams who trust Beunec to orchestrate their most critical work operations.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
                        >
                            <Button size="lg" className="bg-beunec-blue hover:bg-beunec-blue-dark text-white px-8 h-14 rounded-lg text-lg">
                                Join the Beunec Community
                            </Button>
                            <Button variant="outline" size="lg" className="px-8 h-14 rounded-lg border-2 border-beunec-blue text-beunec-blue hover:bg-beunec-blue/5 text-lg">
                                Contact Governance Team
                            </Button>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="text-sm text-muted-foreground italic max-w-2xl mx-auto border-t border-slate-100 dark:border-slate-800 pt-8"
                        >
                            Beunec is governed by the laws of the State of New Jersey, USA, and complies with the NJ Data Protection Act (NJDPA).
                        </motion.p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
