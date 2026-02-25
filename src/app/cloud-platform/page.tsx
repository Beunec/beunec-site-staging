"use client";

import { useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { HeroSection } from "@/sections/bcp/HeroSection";
import { ToolsSection } from "@/sections/bcp/ToolsSection";
import { TestimonialSection } from "@/sections/bcp/TestimonialSection";
import { FeaturesSection } from "@/sections/bcp/FeaturesSection";
import { BenefitsSection } from "@/sections/bcp/BenefitsSection";
import { ConnectorsSection } from "@/sections/bcp/ConnectorsSection";
import { AIEraSection } from "@/sections/bcp/AIEraSection";
import { AcceleratorsSection } from "@/sections/bcp/AcceleratorsSection";
import { CTASection } from "@/sections/bcp/CTASection";

export default function BCP() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-beunec-blue origin-left z-[100]"
                style={{ scaleX }}
            />

            <Header />

            <main className="overflow-hidden">
                <HeroSection />
                <ToolsSection />
                <TestimonialSection />
                <FeaturesSection />
                <BenefitsSection />
                <ConnectorsSection />
                <AIEraSection />
                <AcceleratorsSection />
                <CTASection />
            </main>

            <Footer />
        </div>
    );
}
