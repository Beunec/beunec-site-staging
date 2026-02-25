"use client";

import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

export default function ApplicationFormPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-grow w-full p-0 m-0 overflow-hidden pt-20">
                <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSc9rn3kwNFbHktmTJa0iYVS6RR2daTNFTfg2AZDB0eBn5aMpA/viewform?embedded=true"
                    className="w-full h-[800px] md:h-[1000px] border-none"
                    title="Beunec Cloud Pro for College Students Application Form"
                >
                    Loading…
                </iframe>
            </main>
            <Footer />
        </div>
    );
}
