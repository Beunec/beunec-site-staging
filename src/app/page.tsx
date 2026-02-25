"use client";

import { Header } from "@/sections/Header";
import { Hero } from "@/sections/home/Hero";
import { VisionMission } from "@/sections/home/VisionMission";
import { CoreSolutions } from "@/sections/home/CoreSolutions";
import { BCPProduct } from "@/sections/home/BCPProduct";
import { Stats } from "@/sections/home/Stats";
import { Programs } from "@/sections/home/Programs";
import { Definitions } from "@/sections/home/Definitions";
import { Footer } from "@/sections/Footer";

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
                <Hero />
                <VisionMission />
                <CoreSolutions />
                <BCPProduct />
                <Stats />
                <Programs />
                <Definitions />
            </main>
            <Footer />
        </div>
    );
}
