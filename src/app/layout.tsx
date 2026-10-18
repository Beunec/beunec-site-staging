import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ClientSideProtection } from "@/components/providers/ClientSideProtection";
import { GoogleTranslateLoader } from "@/components/i18n/GoogleTranslateLoader";
import { MotionRuntime } from "@/components/motion/MotionRuntime";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f4f4f0" },
        { media: "(prefers-color-scheme: dark)", color: "#111111" },
    ],
};

export const metadata: Metadata = {
    // Basic SEO
    title: {
        default: "Beunec | Agentic Infrastructure & the Aselius Platform",
        template: "%s | Beunec",
    },
    description:
        "Beunec is a research and deployment organization building Agentic Infrastructure. Aselius, our agentic infrastructure software, runs governed agentic work through specialized Rivine engines (research, code, documents, and creative), with every result inspectable, editable, and yours to export.",
    keywords: [
        "Beunec",
        "Beunec Technologies",
        "Agentic Infrastructure",
        "Aselius",
        "Aselius Platform",
        "Rivine",
        "Rivine engines",
        "agentic AI",
        "AI agents",
        "agentic workspace",
        "multi-agent orchestration",
        "governed AI",
        "human-in-the-loop AI",
        "AI research and deployment",
        "Solution Agent",
        "agentic engines",
        "AI deliverables",
        "enterprise AI agents",
    ],
    authors: [{ name: "Beunec Technologies, Inc.", url: "https://beunec.co" }],
    creator: "Beunec Technologies, Inc.",
    publisher: "Beunec Technologies, Inc.",
    
    // Canonical & Alternate URLs
    metadataBase: new URL("https://beunec.co"),
    alternates: {
        canonical: "https://beunec.co",
        languages: {
            "en-US": "https://beunec.co",
        },
    },
    
    // Robots & Indexing - Critical for Google/Bing
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: false,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    
    // Open Graph for Social Sharing
    openGraph: {
        title: "Beunec | Agentic Infrastructure & the Aselius Platform",
        description:
            "A research and deployment organization building Agentic Infrastructure. Aselius runs governed agentic work through specialized Rivine engines (research, code, documents, and creative), with inspectable, exportable deliverables.",
        url: "https://beunec.co",
        siteName: "Beunec",
        images: [
            {
                url: "https://beunec.co/assets/beunec-logo-transparent-blacktext.png",
                width: 1605,
                height: 442,
                alt: "Beunec: Agentic Infrastructure",
                type: "image/png",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    
    // Twitter Card
    twitter: {
        card: "summary_large_image",
        title: "Beunec | Agentic Infrastructure & the Aselius Platform",
        description:
            "Governed agentic work through specialized Rivine engines: research, code, documents, and creative. Every result inspectable, editable, and yours to export.",
        images: ["https://beunec.co/assets/beunec-logo-transparent-blacktext.png"],
        creator: "@beunecofficial",
        site: "@beunecofficial",
    },
    
    // Icons & App Manifest
    icons: {
        icon: [
            { url: "/assets/beunec-logo.png", sizes: "any", type: "image/png" },
        ],
        shortcut: "/assets/beunec-logo.png",
        apple: [
            { url: "/assets/beunec-logo.png", sizes: "180x180", type: "image/png" },
        ],
    },
    manifest: "/site.webmanifest",
    
    // App Links
    appleWebApp: {
        capable: true,
        title: "Beunec",
        statusBarStyle: "black-translucent",
    },
    
    // Category
    category: "technology",
    
    // Classification
    classification: "Business",
    
    // Other Meta Tags
    other: {
        "geo.region": "US",
        "geo.placename": "Global",
        "geo.position": "37.0902;-95.7129",
        "ICBM": "37.0902, -95.7129",
        "apple-mobile-web-app-capable": "yes",
        "mobile-web-app-capable": "yes",
        "format-detection": "telephone=no",
        "msapplication-TileColor": "#111111",
        "msapplication-config": "/browserconfig.xml",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // JSON-LD Structured Data for Rich Search Results
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://beunec.co/#organization",
                "name": "Beunec Technologies, Inc.",
                "alternateName": "Beunec",
                "url": "https://beunec.co",
                "description": "A research and deployment organization focused on understanding, developing, and actualizing Agentic Infrastructure.",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://beunec.co/assets/beunec-logo.png",
                    "width": 800,
                    "height": 800,
                },
                "sameAs": [
                    "https://twitter.com/beunecofficial",
                    "https://linkedin.com/company/beunecofficial",
                    "https://github.com/beunec",
                    "https://youtube.com/@beunec",
                    "https://instagram.com/beunec_"
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "availableLanguage": ["English"],
                },
            },
            {
                "@type": "WebSite",
                "@id": "https://beunec.co/#website",
                "url": "https://beunec.co",
                "name": "Beunec",
                "description": "Agentic Infrastructure research and deployment, and the Aselius platform.",
                "publisher": {
                    "@id": "https://beunec.co/company",
                },
            },
            {
                "@type": "SoftwareApplication",
                "@id": "https://beunec.co/aselius-platform#software",
                "name": "Aselius Platform",
                "url": "https://beunec.co/aselius-platform",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "description": "Aselius is Beunec's agentic infrastructure software: specialized Rivine engines research, code, draft, and create, producing inspectable, editable, and exportable deliverables. Use it on the web, in your browser, in your terminal, in chat apps, or from any AI app through Aselius MCP.",
                "releaseDate": "2026-08-10",
                "publisher": {
                    "@id": "https://beunec.co/company",
                },
                "offers": {
                    "@type": "AggregateOffer",
                    "priceCurrency": "USD",
                    "lowPrice": "0",
                    "highPrice": "40",
                    "offerCount": "3",
                },
            },
        ],
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${inter.className}`} suppressHydrationWarning>
                {/* Plain script tag so crawlers read the structured data from the HTML itself */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <ClientSideProtection>
                    <ThemeProvider>
                        {children}
                        <GoogleTranslateLoader />
                        <MotionRuntime />
                    </ThemeProvider>
                </ClientSideProtection>
            </body>
        </html>
    );
}
