import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cloud Platform | Beunec BCP",
    description: "Beunec Cloud unifies fragmented SaaS workflows into a single, zero-knowledge window to eliminate the \"Toggle Tax\" for high-stakes professionals.",
    openGraph: {
        title: "Beunec Cloud Platform | Global Infrastructure",
        description: "Beunec Cloud unifies fragmented SaaS workflows into a single, zero-knowledge window to eliminate the \"Toggle Tax\" for high-stakes professionals.",
        images: ["/assets/beunec-cloud-logo-whitebg.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Beunec Cloud Platform",
        description: "Eliminate the Toggle Tax with Beunec's secure, zero-knowledge workspace.",
        images: ["/assets/beunec-cloud-logo-whitebg.png"],
    },
};

export default function BCPLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
