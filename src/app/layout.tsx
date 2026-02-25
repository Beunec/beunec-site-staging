import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "@/index.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ClientSideProtection } from "@/components/providers/ClientSideProtection";
import CursorParticles from "@/components/ui/CursorParticles";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
};

export const metadata: Metadata = {
    // Basic SEO
    title: {
        default: "Beunec | The Future of Work Orchestrator",
        template: "%s | Beunec",
    },
    description: "Redefining how people, agents, and intelligent systems collaborate seamlessly. Shaping the Future of Work.",
    keywords: [
        "AI System Orchestrator",
        "Artificial Intelligence",
        "Enterprise Cloud",
        "Multi-Agent Systems",
        "Humanoid Systems",
        "Scalable Cloud",
        "Toggle Tax",
        "Zero-Knowledge Workspace",
        "SaaS Integration",
        "AI Productivity",
        "Enterprise AI",
        "Workflow Automation",
        "AI Agents",
        "Business Intelligence",
        "Cloud Platform",
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
        title: "Beunec | The Future of Work Orchestrator for Specialist Professionals",
        description: "Redefining how people, agents, and intelligent systems collaborate seamlessly. Shaping the Future of Work.",
        url: "https://beunec.co",
        siteName: "Beunec",
        images: [
            {
                url: "https://beunec.co/assets/beunec-logo-transparent-blacktext.png",
                width: 1200,
                height: 630,
                alt: "Beunec - The Future of Work Orchestrator",
                type: "image/png",
            },
            {
                url: "https://beunec.co/assets/Beunec Cloud Hero Section Graphic Art.png",
                width: 1200,
                height: 630,
                alt: "Beunec Cloud Platform",
                type: "image/png",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    
    // Twitter Card
    twitter: {
        card: "summary_large_image",
        title: "Beunec | The AI System Orchestrator for Specialist Professionals",
        description: "Eliminate the Toggle Tax with Beunec's secure, zero-knowledge workspace that unifies fragmented SaaS tools.",
        images: ["https://beunec.co/assets/beunec-logo-transparent-blacktext.png"],
        creator: "@beunec",
        site: "@beunec",
    },
    
    // Icons & App Manifest
    icons: {
        icon: [
            { url: "/assets/favicon.ico", sizes: "48x48" },
            { url: "/assets/favicon.ico", sizes: "192x192", type: "image/png" },
        ],
        shortcut: "/assets/favicon.ico",
        apple: [
            { url: "/assets/favicon.ico", sizes: "180x180", type: "image/png" },
        ],
        other: [
            {
                rel: "mask-icon",
                url: "/assets/favicon.ico",
                color: "#000000",
            },
        ],
    },
    manifest: "/site.webmanifest",
    
    // App Links
    appleWebApp: {
        capable: true,
        title: "Beunec",
        statusBarStyle: "black-translucent",
    },
    
    // Verification - ADD YOUR VERIFICATION CODES HERE
    verification: {
        google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
        yandex: "YOUR_YANDEX_VERIFICATION_CODE",
        yahoo: "YOUR_YAHOO_VERIFICATION_CODE",
        other: {
            "msvalidate.01": "YOUR_BING_WEBMASTER_VERIFICATION_CODE",
            "facebook-domain-verification": "YOUR_FACEBOOK_DOMAIN_VERIFICATION",
        },
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
        "msapplication-TileColor": "#000000",
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
                "@id": "https://beunec.co/company",
                "name": "Beunec Technologies, Inc.",
                "alternateName": "Beunec",
                "url": "https://beunec.co",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://beunec.co/assets/beunec-logo-transparent-blacktext.png",
                    "width": 512,
                    "height": 512,
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
                "description": "The Future of Work Orchestrator for Specialist Professionals",
                "publisher": {
                    "@id": "https://beunec.co/company",
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://beunec.co/search?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                },
            },
            {
                "@type": "SoftwareApplication",
                "name": "Beunec Cloud Platform",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                },
                "description": "AI system orchestrator that eliminates the Toggle Tax through a secure, zero-knowledge workspace.",
            },
        ],
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <Script
                    id="json-ld-structured-data"
                    type="application/ld+json"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <ClientSideProtection>
                    <ThemeProvider>
                        <CursorParticles />
                        {children}
                    </ThemeProvider>
                </ClientSideProtection>
            </body>
        </html>
    );
}
