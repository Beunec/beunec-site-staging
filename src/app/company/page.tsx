"use client";

import { useEffect } from "react";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";

export default function CompanyPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="baap-page min-h-screen">
            <Header />

            <main className="pt-20">
                {/* Section 1: Hero: identity & what we are not */}
                <section className="relative py-20 overflow-hidden">
                    <ParticleBackground />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end mb-14 md:mb-16">
                            <div className="lg:col-span-7 text-center lg:text-left">
                                <p
                                    className="kt-fade font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-6"
                                    style={{ ["--d" as string]: "0s" }}
                                >
                                    Who We Are
                                </p>
                                <h1
                                    className="kt-fade text-3xl md:text-4xl md:text-[2.0rem] md:text-[2.75rem] leading-[1.05] tracking-tight text-foreground font-extrabold"
                                    style={{ ["--d" as string]: "0.05s" }}
                                >
                                    Understanding, developing, &amp; actualizing{" "}
                                    <span className="underline underline-offset-[0.12em] decoration-2 decoration-[color:var(--accent-sage)]">
                                        Agentic Infrastructure
                                    </span>
                                </h1>
                            </div>
                            <p
                                className="kt-fade lg:col-span-5 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-xl mx-auto lg:mx-0 lg:ml-auto lg:mb-1 text-center lg:text-left"
                                style={{ fontFamily: "Georgia, 'Times New Roman', serif", ["--d" as string]: "0.1s" }}
                            >
                                Beunec is a research and deployment organization. We study how agentic systems are built, governed, and brought into the world, not as a product line, but as infrastructure.
                            </p>
                        </div>

                        <div
                            className="kt-fade relative rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto mb-14"
                            style={{ ["--d" as string]: "0.18s" }}
                        >
                            <img
                                src="/assets/open-space-office.avif"
                                alt="Beunec office"
                                className="w-full h-auto object-cover"
                            />
                        </div>

                        <div
                            className="kt-fade max-w-3xl mx-auto space-y-6 text-center"
                            style={{ ["--d" as string]: "0.26s" }}
                        >
                            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                                We are not defined solely as a software company, an AI company, or a conventional research lab. Product launches, market cycles, and commercialization are not our reason for being.
                            </p>
                            <Link
                                href="/agentic-infrastructure"
                                className="inline-flex items-center gap-2 text-sm font-medium text-accent-sage hover:text-foreground transition-colors"
                            >
                                What we mean by Agentic Infrastructure
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Section 2: Solution Agent: fundamental responsibility */}
                <section className="py-24 bg-container">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div data-reveal
                                className="space-y-8">
                                <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">
                                    Our approach
                                </p>
                                <p className="text-lg md:text-lg text-muted-foreground leading-relaxed">
                                    Our work starts with a deeper obligation: to understand unstable systems, move toward conditions others overlook or avoid, and build solutions that make those systems more stable, useful, and governed.
                                </p>
                                <div>
                                    <h2 className="text-lg md:text-lg font-extrabold text-foreground tracking-tight mb-4">
                                        We call this being a{" "}
                                        <span className="underline underline-offset-[0.12em] decoration-2 decoration-[color:var(--accent-sage)]">
                                            Solution Agent
                                        </span>
                                        .
                                    </h2>
                                    <p className="text-muted-foreground leading-relaxed">
                                        A problem solver answers a named problem. A Solution Agent goes further, recognizing what was missed, asking why instability endures, and committing to the research, invention, development, and deployment required for lasting stability.
                                    </p>
                                </div>
                                <blockquote
                                    className="rounded-2xl border border-border px-3 py-3 text-foreground text-base sm:text-md leading-relaxed font-medium"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, rgba(107,122,110,0.12), rgba(122,139,153,0.08))",
                                    }}
                                >
                                    Drawn toward unstable systems, not to exploit disorder, but to understand it and help make it stable.
                                </blockquote>
                            </div>
                            <div data-reveal
                                className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                                <img
                                    src="/assets/mbmforumgrouppic.avif"
                                    alt="Beunec Vision"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Duty to people: integrity close */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div data-reveal
                                className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-lg">
                                <img
                                    src="/assets/beunec-mbm-forum.avif"
                                    alt="Beunec Mission"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div data-reveal
                                className="order-1 lg:order-2 space-y-8">
                                <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">
                                    What guides us
                                </p>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1]">
                                    Our duty is first to people.
                                </h2>
                                <div className="space-y-5 text-muted-foreground text-base sm:text-lg leading-relaxed">
                                    <p>
                                        Not to machines, markets, fame, or power. Technology earns its place when development respects human capability, human existence, and the environments where people live and work.
                                    </p>
                                    <p>
                                        We do not need to be the loudest organization in the room. We let the integrity, discipline, and real-world utility of our work speak for itself.
                                    </p>
                                </div>
                                <p
                                    className="text-2xl md:text-3xl text-foreground font-extrabold tracking-tight pt-2"
                                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                                >
                                    We are Beunec.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Defensible value */}
                <section className="py-24 bg-container">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div data-reveal
                            className="max-w-3xl mb-14">
                            <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-6">
                                Value
                            </p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
                                Where defensible value can develop
                            </h2>
                            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                                We do not assume that a proprietary name, framework, or prompt automatically creates a competitive moat. Defensibility must be demonstrated through implementation, performance, integration, accumulated knowledge, and sustained real-world use.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Runtime and hardware integration",
                                    body: "Deep ties to execution environments, operating systems, enterprise infrastructure, edge devices, and hardware are harder to reproduce than an API-level wrapper.",
                                },
                                {
                                    title: "Specialized context and professional knowledge",
                                    body: "Datasets and instructions from qualified professionals can sharpen specialized agents; when backed by governance, consent, quality control, and evaluation.",
                                },
                                {
                                    title: "Reliable execution patterns",
                                    body: "Validated task graphs, recovery procedures, escalation rules, and domain workflows can become durable operational knowledge over time.",
                                },
                                {
                                    title: "Memory and institutional context",
                                    body: "A governed context fabric grows more useful as it learns policies, terminology, workflows, and operating boundaries, balanced with portability, privacy, and organizational data ownership.",
                                },
                                {
                                    title: "Cost-to-performance efficiency",
                                    body: "Efficiency is defensible only with reproducible benchmarks: whether orchestration and context methods reduce unnecessary activation, token use, latency, and failure without sacrificing quality.",
                                },
                                {
                                    title: "Governance embedded in execution",
                                    body: "Governance matters when it shows up in system behavior; permissions, execution boundaries, approval checkpoints, immutable records, and human escalation, not only in policy documents.",
                                },
                            ].map((item, i) => (
                                <div data-reveal style={{ ["--rv-i" as string]: Math.round((i * 0.05) / 0.08) }}
                                    key={item.title}
                                    className="rounded-2xl border border-border bg-global p-6 space-y-3">
                                    <h3 className="text-base font-semibold text-foreground leading-snug">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {item.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 5: Our commitment */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-start">
                            <div data-reveal
                                className="space-y-8">
                                <div>
                                    <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-6">
                                        Commitment
                                    </p>
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
                                        How we hold ourselves accountable
                                    </h2>
                                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                                        Our work in Agentic Infrastructure is an ongoing research and deployment effort. Some areas are active development priorities; others are longer-term research directions. We distinguish between what has been conceptualized, experimentally validated, deployed, and independently verified.
                                    </p>
                                </div>
                                <blockquote
                                    className="rounded-2xl border border-border px-6 py-5 text-foreground text-base sm:text-lg leading-relaxed font-medium"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, rgba(107,122,110,0.12), rgba(122,139,153,0.08))",
                                    }}
                                >
                                    We will not treat ambition as evidence.
                                </blockquote>
                            </div>

                            <div data-reveal style={{ ["--rv-i" as string]: 1 }}
                                className="rounded-2xl border border-border bg-container p-8">
                                <p className="text-sm font-medium text-foreground mb-6">
                                    As our work develops, we intend to:
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        "Publish research and technical documentation where appropriate",
                                        "Clearly distinguish hypotheses from validated findings",
                                        "Document limitations and unsuccessful experiments",
                                        "Measure performance under real-world conditions",
                                        "Create pathways for professional and institutional review",
                                        "Preserve human responsibility throughout autonomous execution",
                                        "Pursue commercialization only when it supports, not compromises, the integrity of the work",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                                            <CheckCircle2 className="w-4 h-4 text-accent-sage mt-0.5 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 6: Video Background */}
                <section className="py-24 bg-background overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div data-reveal
                            className="relative h-[500px] md:h-[600px] rounded-[40px] overflow-hidden flex items-center justify-center baap-media group">
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
                                <h2 data-reveal style={{ ["--rv-i" as string]: 2 }}
                                    className="text-4xl md:text-6xl font-serif text-white mb-0">
                                    Shaping the Future <br className="hidden md:block" /> of Human-AI Collaboration
                                </h2>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 7: Core Definition */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-20">
                            <h2 className="text-3xl font-serif text-foreground mb-12">Core Definition & Company Identity</h2>
                            <div className="grid lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-beunec-blue mb-4 flex items-center gap-2">
                                            Beunec® = Bene + Unique + C
                                        </h3>
                                        <ul className="space-y-2 text-muted-foreground">
                                            <li>• "Bene": Latin for goodness, integrity</li>
                                            <li>• "Unique" - Singular in design, purpose, and identity</li>
                                            <li>Code, Consciousness, Company</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-beunec-blue mb-4">Definition Strip:</h3>
                                        <p className="italic text-muted-foreground">
                                            "Beunec®: means an entity that embodies excellence, uniqueness, integrity, and technological innovation in delivering future-ready, stable, and governed solutions."
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-beunec-blue mb-4">What We Do:</h3>
                                        <ul className="space-y-3">
                                            {[
                                                "Build agent-governed cloud platforms",
                                                "Architect agentic-intelligent ecosystems",
                                                "Engineer Immersive, ID-verified digital experiences"
                                            ].map((item) => (
                                                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                                                    <CheckCircle2 className="w-5 h-5 text-beunec-blue mt-0.5 shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex gap-12 text-sm text-muted-foreground pt-4">
                                        <div>
                                            <strong>Company Type:</strong> Private | NJ | March, 2024
                                        </div>
                                        <div>
                                            <strong>Trademark:</strong> Beunec® (Registered with USPTO)
                                        </div>
                                    </div>
                                </div>
                                <div className="relative rounded-2xl overflow-hidden shadow-inner bg-media-blank">
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

                {/* Section 8: Brand Elements */}
                <section className="py-24 bg-container">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-16 items-start">
                            <div className="space-y-12">
                                <div>
                                    <h2 className="text-3xl font-serif text-foreground mb-8">Brand Elements & Visual Language</h2>
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="font-bold text-beunec-blue uppercase tracking-wider text-sm mb-4">Typography:</h4>
                                            <ul className="space-y-2 text-muted-foreground">
                                                <li>• Titles: EB Garamond, Forum, Philosopher</li>
                                                <li>• Body: Inter, Source Serif Pro</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-beunec-blue uppercase tracking-wider text-sm mb-4">Primary Palette:</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                                                {[
                                                    { name: "Canvas", hex: "#F4F4F0", desc: "Light background" },
                                                    { name: "Charcoal", hex: "#111111", desc: "Dark background" },
                                                    { name: "Container", hex: "#FFFFFF / #151515", desc: "Panels, light and dark" },
                                                    { name: "Sage Mist", hex: "#6B7A6E", desc: "Infrastructure accent" },
                                                    { name: "Muted Slate", hex: "#7A8B99", desc: "Research accent" },
                                                    { name: "Ink and Mist", hex: "#1A1A1A / #E8EAED", desc: "Text, light and dark" },
                                                ].map((color) => (

                                                    <div key={color.name} className="flex flex-col gap-2">
                                                        <div
                                                            className="w-full h-12 rounded-md shadow-sm border border-black/5"
                                                            style={{
                                                                background: color.hex.includes("/")
                                                                    ? `linear-gradient(90deg, ${color.hex.split(" / ")[0]} 50%, ${color.hex.split(" / ")[1]} 50%)`
                                                                    : color.hex,
                                                            }}
                                                        />
                                                        <div className="text-sm">
                                                            <div className="font-bold">{color.name}</div>
                                                            <div className="text-muted-foreground">{color.hex}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-beunec-blue uppercase tracking-wider text-sm mb-4">Style Ethos:</h4>
                                            <ul className="space-y-2 text-muted-foreground">
                                                <li>• Minimalist, Warm Technical, Brutalist structure</li>
                                                <li>• Depth via container contrast, not neon borders or glow</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-beunec-blue uppercase tracking-wider text-sm mb-6">Logo Usage & Brand Protection</h4>
                                    <ul className="space-y-4 text-sm text-muted-foreground">
                                        <li>• Logos: Full logo, symbol-only, monochrome version</li>
                                        <li>• Usage Guidelines:
                                            <ul className="pl-4 mt-2 space-y-1">
                                                <li>- Clear margin rules</li>
                                                <li>- No distortions, shadow overlays, or unauthorized recoloring</li>
                                                <li>- Trademark: Beunec® - registered & protected</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div data-reveal
                                    className="rounded-2xl overflow-hidden shadow-lg aspect-[16/10]">
                                    <img src="/assets/balloonoververdanthills.avif" alt="Brand Vision" className="w-full h-full object-cover" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-global p-8 rounded-xl border border-border flex items-center justify-center">
                                        <img src="/assets/beunec-logo-transparent-blacktext.png" alt="Beunec Logo Black" className="h-10 w-auto" />
                                    </div>
                                    <div className="p-8 rounded-xl border border-border flex items-center justify-center" style={{ backgroundColor: "var(--bg-dark)" }}>
                                        <img src="/assets/beunec-logo-transparent-whitetext.png" alt="Beunec Logo White" className="h-10 w-auto" />
                                    </div>
                                    <div className="bg-container p-8 rounded-xl border border-border flex items-center justify-center">
                                        <img src="/assets/Beunec_logo_black.png" alt="Beunec Logo Full Black" className="h-10 w-auto" />
                                    </div>
                                    <div className="bg-media-blank p-8 rounded-xl border border-border flex items-center justify-center">
                                        <img src="/assets/beunec-logo.png" alt="Beunec Logo Standard" className="h-10 w-auto" />
                                    </div>
                                    <div className="bg-global p-8 rounded-xl border border-border flex items-center justify-center">
                                        <img src="/assets/aselius-logo-icon.webp" width={320} height={320} loading="lazy" alt="Aselius Logo Icon" className="h-16 sm:h-20 w-auto" />
                                    </div>
                                    <div className="p-8 rounded-xl border border-border flex items-center justify-center text-foreground" style={{ backgroundColor: "var(--bg-dark)" }}>
                                        <img src="/assets/aselius-logo-text.webp" width={640} height={228} loading="lazy" alt="Aselius Logo and Text" className="h-12 sm:h-16 w-auto max-w-full" />
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
