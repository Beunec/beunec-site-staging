"use client";

import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Laptop, ShieldCheck, Users, Zap, Award, Rocket, BarChart3, Globe } from "lucide-react";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";
import Link from "next/link";

export default function SoloFoundersGrantPage() {
    const applicationUrl = "/bcp-for-solo-founder-grants-program-application-form";

    return (
        <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50 dark:bg-slate-900/30">
                    <ParticleBackground />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <motion.h1
                                className="text-4xl md:text-6xl font-serif text-beunec-blue dark:text-blue-400 mb-6 leading-tight max-w-4xl mx-auto"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                Fuel your focus: the Beunec Cloud Grant for solo founders
                            </motion.h1>
                            <motion.p
                                className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Get 6 months of Beunec Cloud Pro at no cost, to eliminate the "toggle tax," protect your IP, and push your product further, faster.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <Button
                                    asChild
                                    className="bg-beunec-blue hover:bg-beunec-blue-dark text-white px-8 py-6 text-lg rounded-md shadow-lg transition-all"
                                >
                                    <Link href={applicationUrl}>Apply Now</Link>
                                </Button>
                                <a href="#terms" className="text-sm border-b border-muted-foreground/30 text-muted-foreground hover:text-foreground transition-colors">
                                    Read the terms & conditions
                                </a>
                            </motion.div>
                        </div>

                        {/* Floating Image Elements (Circular/Oval) */}
                        <div className="relative h-[300px] md:h-[400px] mt-10">
                            {/* Top Left - Office (Oval) */}
                            <motion.div
                                className="absolute left-[5%] top-0 w-44 h-28 md:w-64 md:h-44 rounded-[100px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800"
                                    alt="Modern Office"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Top Right - Meeting (Oval) */}
                            <motion.div
                                className="absolute right-[5%] top-10 w-44 h-28 md:w-64 md:h-44 rounded-[100px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <img
                                    src="https://static.wixstatic.com/media/nsplsh_4d4950ae1f2a45adb77293846e1770e7~mv2.jpg/v1/fill/w_468,h_316,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Redd%20Francisco.jpg"
                                    alt="Collaborative Space"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Bottom Left - Planning (Circle) */}
                            <motion.div
                                className="absolute left-[15%] bottom-0 w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                <img
                                    src="https://static.wixstatic.com/media/nsplsh_cc6c3624dc8046a2afcb632edd41291b~mv2.jpg/v1/fill/w_712,h_472,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Sable%20Flow.jpg"
                                    alt="Team Planning"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Bottom Right - Designer (Circle) */}
                            <motion.div
                                className="absolute right-[15%] bottom-10 w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                <img
                                    src="https://static.wixstatic.com/media/nsplsh_6c39307a52625776436f45~mv2_d_5772_3848_s_4_2.jpg/v1/fill/w_712,h_472,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/nsplsh_6c39307a52625776436f45~mv2_d_5772_3848_s_4_2.jpg"
                                    alt="Creative Focus"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* Subtle Background Decorations */}
                    <div className="absolute top-20 left-10 opacity-10 text-beunec-blue">
                        <svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" /></svg>
                    </div>
                    <div className="absolute bottom-20 right-10 opacity-10 text-beunec-blue">
                        <svg width="120" height="120" viewBox="0 0 120 120"><rect x="20" y="20" width="80" height="80" rx="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" /></svg>
                    </div>
                </section>

                {/* Section 2: The Opportunity & Infrastructure */}
                <section className="py-24 bg-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            {/* Left Column */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                                    <img
                                        src="https://static.wixstatic.com/media/nsplsh_889095abb6054e6dafbe58afe1d8518e~mv2.jpg/v1/fill/w_804,h_654,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Priscilla%20Du%20Preez%20%F0%9F%87%A8%F0%9F%87%A6.jpg"
                                        alt="The Opportunity"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">The Opportunity</h3>
                                    <p className="text-muted-foreground text-lg">Zero upfront cost. Founder-grade power.</p>

                                    <Button asChild variant="outline" className="border-beunec-blue text-beunec-blue hover:bg-beunec-blue/5 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/5 font-medium transition-colors">
                                        <Link href="/cloud-platform">
                                            Learn more about BCP
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Right Column */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                                    <img
                                        src="https://static.wixstatic.com/media/nsplsh_48b9da2075254a7693a7af0c9fb468fc~mv2.jpg/v1/fill/w_804,h_654,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Annie%20Spratt.jpg"
                                        alt="Infrastructure"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">We provide the Infrastructure; you bring the vision.</h3>
                                    <ul className="space-y-4 text-sm md:text-base">
                                        <li className="flex gap-3">
                                            <div className="mt-1"><Rocket className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">6 months of Pro access:</strong> 100% discount on our Pro tier, including the full Beunec Cloud Platform in one unified workspace.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><Zap className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Integrated AI credits:</strong> Use built-in AI for research, summarization, drafting, and analysis without stitching tools together.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><ShieldCheck className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Zero-retention security:</strong> Work inside a cryptographically protected stack that keeps your intellectual property yours.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><Award className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Clean exit:</strong> When the grant ends, your account moves to our free Base plan; no auto-billing, no hidden fees; fully aligned with New Jersey consumer protections.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Technical Edge & Unified Workspace */}
                <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            {/* Left Column */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8 order-2 lg:order-1"
                            >
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">Don't just browse with AI, build on a true system of record.</h3>
                                    <ul className="space-y-4 text-sm md:text-base">
                                        <li className="flex gap-3">
                                            <div className="mt-1"><Laptop className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Unified workspace:</strong> Files, docs, tasks, and secure messaging live in a single persistent context instead of across tabs and tools.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><ShieldCheck className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Cryptographic IP protection:</strong> Our zero-retention architecture ensures even infrastructure providers see only encrypted strings, not your work.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><BarChart3 className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Persistent context:</strong> Your artifacts stay anchored in one environment, so conversations, drafts, and decisions remain connected over time.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><Globe className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Granular sharing:</strong> CloudHandle links let you share exactly what's needed, no more exposing whole folders or workspaces to collaborators.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                                    <img
                                        src="https://static.wixstatic.com/media/nsplsh_a1520e13dc054e408824a797ff24d702~mv2.jpg/v1/fill/w_812,h_652,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Vitaly%20Gariev.jpg"
                                        alt="Unified Workspace"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                            </motion.div>

                            {/* Right Column */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8 order-1 lg:order-2"
                            >
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                                    <img
                                        src="https://static.wixstatic.com/media/nsplsh_cf3c9335de904b659f73b24cad34fb33~mv2.jpg/v1/fill/w_804,h_652,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Mika%20Baumeister.jpg"
                                        alt="Technical Edge"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">The Technical Edge</h3>
                                    <p className="text-muted-foreground text-lg italic">Why Beunec Cloud beats general-purpose AI</p>

                                    <Button asChild variant="outline" className="border-beunec-blue text-beunec-blue hover:bg-beunec-blue/5 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/5 font-medium transition-colors">
                                        <a href="https://cloud.beunec.com/auth/login?screen_hint=signup&returnTo=/">
                                            Signup for BCP Now
                                        </a>
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Eligibility & Selection */}
                <section className="py-24 bg-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            {/* Left Column */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                                    <img
                                        src="https://static.wixstatic.com/media/nsplsh_7230736141514e6a456a51~mv2.jpg/v1/fill/w_804,h_652,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20S%20O%20C%20I%20A%20L%20_%20C%20U%20T.jpg"
                                        alt="Eligibility"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">Eligibility & Selection</h3>
                                    <p className="text-muted-foreground text-lg italic">Built for specialists, awarded for impact</p>
                                </div>
                            </motion.div>

                            {/* Right Column */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                                    <img
                                        src="https://static.wixstatic.com/media/nsplsh_78586e747839794c5a6355~mv2_d_6000_4000_s_4_2.jpg/v1/fill/w_804,h_652,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Marvin%20Meyer.jpg"
                                        alt="Vision"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400 text-right">We back solo builders with real businesses and long-term intent.</h3>
                                    <ul className="space-y-4 text-sm md:text-base">
                                        <li className="flex gap-3 flex-row-reverse text-right">
                                            <div className="mt-1"><Users className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Who it's for:</strong> Solo founders and stealth teams ({"<"}5 people) in accounting, legal, consulting, medicine, finance, and cross-disciplinary research.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3 flex-row-reverse text-right">
                                            <div className="mt-1"><ShieldCheck className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Signal of seriousness:</strong> Applications with a clear business model and a verified business email are prioritized.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3 flex-row-reverse text-right">
                                            <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Simple application:</strong> Share what you're building, who you serve, and how you plan to grow; we review on a rolling basis.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3 flex-row-reverse text-right">
                                            <div className="mt-1"><Award className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">NJ-governed trust:</strong> The program is governed by New Jersey law to ensure transparency and protection for your growing company.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-24 bg-[#0a192f] dark:bg-slate-950 text-white overflow-hidden relative border-t border-slate-800">
                    {/* Cloud decorations */}
                    <div className="absolute top-10 left-[10%] opacity-20"><svg width="80" height="40" viewBox="0 0 80 40"><path d="M10 30 Q10 10 30 15 Q40 5 60 15 Q75 15 70 35 Z" fill="white" /></svg></div>
                    <div className="absolute bottom-20 right-[15%] opacity-20"><svg width="100" height="50" viewBox="0 0 100 50"><path d="M15 40 Q15 20 35 25 Q45 15 65 25 Q80 25 75 45 Z" fill="white" /></svg></div>

                    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                        <motion.h2
                            className="text-4xl md:text-5xl font-serif mb-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            Ready to reclaim your builder hours?
                        </motion.h2>
                        <motion.p
                            className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            We review applications within one week; join the Beunec Cloud Grant community and build your next intelligent system on solid ground.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                        >
                            <Button
                                asChild
                                className="bg-beunec-blue hover:bg-beunec-blue-dark text-white px-10 py-7 text-xl rounded-md shadow-2xl transition-all hover:scale-105"
                            >
                                <Link href={applicationUrl}>Start your application</Link>
                            </Button>
                        </motion.div>

                        <p className="mt-12 text-xs text-slate-500 uppercase tracking-widest max-w-xl mx-auto">
                            Grant recipients agree to display the Beunec Cloud Grants badge on their site for the duration of the program.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
