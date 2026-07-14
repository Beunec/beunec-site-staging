"use client";

import { Header } from "@/sections/Header";
import { Hero } from "@/sections/home/Hero";
import { VisionMission } from "@/sections/home/VisionMission";
import { LatestReleases } from "@/sections/home/LatestReleases";
import { Footer } from "@/sections/Footer";
import { HomeAmbientAudio } from "@/components/home/HomeAmbientAudio";

export default function Home() {
    return (
        <div className="baap-page min-h-screen">
            <Header />
            <main>
                <Hero />
                <VisionMission />
                <LatestReleases />
            </main>
            <Footer />
            <HomeAmbientAudio />
        </div>
    );
}
