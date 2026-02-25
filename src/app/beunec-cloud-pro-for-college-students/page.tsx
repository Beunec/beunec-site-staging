"use client";

import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, GraduationCap, Laptop, ShieldCheck, Users, Zap } from "lucide-react";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";
import Link from "next/link";

export default function StudentOfferPage() {
    const applicationUrl = "/beunec-cloud-pro-for-college-students-application-form";

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
                                className="text-4xl md:text-6xl font-serif text-beunec-blue dark:text-blue-400 mb-6 leading-tight"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                Master your discipline with Beunec <br className="hidden md:block" /> Cloud Pro.
                            </motion.h1>
                            <motion.p
                                className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                Get 2 months of Beunec Cloud Pro for $0; unify your research, files, and academic workflows in one focused workspace.
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
                                    <a href={applicationUrl}>Verify your student status</a>
                                </Button>
                                <a href="#terms" className="text-sm border-b border-muted-foreground/30 text-muted-foreground hover:text-foreground transition-colors">
                                    View promotion terms
                                </a>
                            </motion.div>
                        </div>

                        {/* Floating Image Elements (Circular/Oval) */}
                        <div className="relative h-[300px] md:h-[400px] mt-10">
                            {/* Top Left - Library */}
                            <motion.div
                                className="absolute left-[5%] top-0 w-32 h-44 md:w-48 md:h-64 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800"
                                    alt="Library"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Top Right - Graduation */}
                            <motion.div
                                className="absolute right-[5%] top-10 w-40 h-28 md:w-64 md:h-44 rounded-[100px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <img
                                    src="https://static.wixstatic.com/media/nsplsh_2a089b800aa84b5b823ddbc8bb44e127~mv2.jpg/v1/fill/w_468,h_316,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Ying%20Ge.jpg"
                                    alt="Graduation"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Bottom Left - Lecture Hall */}
                            <motion.div
                                className="absolute left-[15%] bottom-0 w-44 h-32 md:w-72 md:h-52 rounded-[120px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800"
                                    alt="Lecture Hall"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Bottom Right - Student */}
                            <motion.div
                                className="absolute right-[15%] bottom-10 w-32 h-40 md:w-48 md:h-60 rounded-[80px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=800"
                                    alt="Student"
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

                {/* Section 2: Next Gen & Student Advantage */}
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
                                        src="https://static.wixstatic.com/media/nsplsh_d0fbdf7c24a34891a22ad5827f55c104~mv2.jpg/v1/fill/w_804,h_654,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Mimi%20Thian.jpg"
                                        alt="Next Gen Collaboration"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">Built for the next generation of specialists.</h3>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <div className="mt-1"><Laptop className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Full Pro features:</strong> Enjoy 60 days of our highest tier, including advanced file management and AI-powered collaborative drafting.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><Zap className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Research efficiency:</strong> Kill the "toggle tax" when writing papers or analyzing data by keeping all your work in a single, persistent context.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><Users className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Secure collaboration:</strong> Share projects safely with CloudHandle links that protect your broader digital workspace.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><GraduationCap className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Who qualifies:</strong> Open to currently enrolled students at degree-granting institutions in the U.S., Canada, and eligible regions.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>

                            {/* Right Column */}
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8 flex flex-col justify-center"
                            >
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                                    <img
                                        src="https://static.wixstatic.com/media/nsplsh_ff0b9afaa31d4386885d339b3892544a~mv2.jpg/v1/fill/w_804,h_654,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Windows.jpg"
                                        alt="Student Advantage"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">The Student Advantage</h3>
                                    <p className="text-muted-foreground text-lg">4 months of Pro power. Zero debt.</p>

                                    <Button variant="outline" className="border-beunec-blue text-beunec-blue hover:bg-beunec-blue/5 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/5 font-medium transition-colors" asChild>
                                        <Link href="/cloud-platform">
                                            Learn more about BCP
                                        </Link>
                                    </Button>

                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Beyond the Chatbox & AI Specialist */}
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
                                        src="https://static.wixstatic.com/media/nsplsh_091961c4206c4eff9ed481181a037527~mv2.jpg/v1/fill/w_804,h_652,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Wes%20Hicks.jpg"
                                        alt="Beyond the Chatbox"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">Beyond the Chatbox</h3>
                                    <p className="text-muted-foreground text-lg">The AI workspace for future professionals.</p>

                                    <Button asChild variant="outline" className="border-beunec-blue text-beunec-blue hover:bg-beunec-blue/5 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/5 font-medium transition-colors">
                                        <a href="https://cloud.beunec.com/auth/login?screen_hint=signup&returnTo=/">
                                            Signup for BCP Now
                                        </a>
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
                                        src="https://static.wixstatic.com/media/nsplsh_d8ff023cc28f4f12ac6576af0d0d1890~mv2.jpg/v1/fill/w_812,h_652,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Vitaly%20Gariev.jpg"
                                        alt="Lecture Environment"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">Don't just chat with AI, work like a specialist.</h3>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <div className="mt-1"><ShieldCheck className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">IP protection:</strong> Your papers and datasets stay yours, safeguarded by our zero-retention, encrypted architecture.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><Zap className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Stable context:</strong> Unlike generic tools that lose the thread, Beunec Cloud keeps your research context anchored for deeper focus and better output.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><Users className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Career prep:</strong> Use the same style of workspace relied on by accountants, researchers, and analysts, and graduate already fluent in professional-grade tools.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Simple Verification & Apply Any Time */}
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
                                <div className="space-y-4">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">Simple Verification, Rolling Intake</h3>
                                    <p className="text-muted-foreground text-lg italic">Quick claim. Immediate impact.</p>
                                </div>
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
                                    <img
                                        src="https://static.wixstatic.com/media/nsplsh_6ef1b8e9ba1a4c71928034863b32d580~mv2.jpg/v1/fill/w_804,h_652,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Dom%20Fou.jpg"
                                        alt="University Setting"
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
                                        src="https://static.wixstatic.com/media/nsplsh_05f94ce4a8b041868b451296ced2a839~mv2.jpg/v1/fill/w_804,h_652,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Image%20by%20Erika%20Fletcher.jpg"
                                        alt="Campus Building"
                                        className="w-full h-[400px] object-cover"
                                    />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-3xl font-serif text-beunec-blue dark:text-blue-400">Apply any time; start as soon as you're verified.</h3>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Fast verification:</strong> Confirm your student status through our portal; your 4-month Pro term starts right after approval.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">No upfront fees:</strong> Begin with $0 due today and experience the platform exactly as a paying specialist would.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">Simple application:</strong> Share what you're building, who you serve, and how you plan to grow; we review on a rolling basis.</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-beunec-blue dark:text-blue-400" /></div>
                                            <div>
                                                <p className="text-foreground"><strong className="text-beunec-blue dark:text-blue-400">You're in control:</strong> Cancel anytime in account settings; Pro access continues until your promo window ends.</p>
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
                            Ready to level up your academic workflow?
                        </motion.h2>
                        <motion.p
                            className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            After 2 months, your plan renews at the standard Pro rate unless you cancel before the promo ends.
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
                                <a href={applicationUrl}>Claim my student offer</a>
                            </Button>
                        </motion.div>

                        <p className="mt-12 text-xs text-slate-500 uppercase tracking-widest">
                            Limited to one student offer per subscriber. Standard rates apply after the 2-month promotional period.
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
