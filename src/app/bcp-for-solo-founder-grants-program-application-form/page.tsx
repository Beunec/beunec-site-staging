"use client";

import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

export default function GrantApplicationFormPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-grow w-full p-0 m-0 overflow-hidden pt-20">
                <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSfaPOtx0QsBTVloq3AwavhM7xkRoFolq75jvUU2k7GLwxDfZw/viewform?embedded=true"
                    className="w-full h-[800px] md:h-[1000px] border-none"
                    title="Beunec Cloud Grant for Solo Founders Application Form"
                >
                    Loading…
                </iframe>
            </main>
            <Footer />
        </div>
    );
}
