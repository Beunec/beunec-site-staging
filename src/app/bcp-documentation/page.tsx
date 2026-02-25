"use client";

import { useEffect } from "react";
import { GitBookProvider, GitBookFrame } from "@gitbook/embed/react";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";

export default function DocumentationPage() {
    useEffect(() => {
        // Ensure the page starts at the top
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-grow pt-16 lg:pt-20">
                <div className="w-full h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] relative bg-slate-50 dark:bg-slate-900/10">
                    <GitBookProvider siteURL="https://beunec.gitbook.io/cloud">
                        <GitBookFrame
                            className="w-full h-full border-none relative z-10"
                        />

                        {/* Local Testing Help / Fallback */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-0">
                            <div className="max-w-md space-y-4">
                                <p className="text-muted-foreground text-sm">
                                    If the documentation doesn't load locally, it's due to GitBook's <span className="font-mono text-beunec-blue">https</span> security policy.
                                    <br />
                                    This will resolve automatically on production.
                                </p>
                                <a
                                    href="https://beunec.gitbook.io/cloud"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-6 py-3 bg-beunec-blue text-white rounded-lg font-medium shadow-lg hover:bg-beunec-blue-dark transition-all"
                                >
                                    Open Documentation Directly
                                </a>
                            </div>
                        </div>
                    </GitBookProvider>
                </div>
            </main>

            <Footer />
        </div>
    );
}
