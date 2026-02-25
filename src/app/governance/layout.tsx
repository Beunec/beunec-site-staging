import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Governance | Beunec",
    description: "Governance as an Asset. We combine rigorous data readiness frameworks with high-fidelity security protocols to ensure verifiable AI and trust.",
    openGraph: {
        title: "Governance | Beunec",
        description: "Discover Beunec's Data Readiness Framework and trust-first infrastructure.",
        url: "https://beunec.co/governance",
        siteName: "Beunec",
        images: [
            {
                url: "/assets/social-share.png",
                width: 1200,
                height: 630,
                alt: "Beunec Governance",
            },
        ],
    },
};

export default function GovernanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
