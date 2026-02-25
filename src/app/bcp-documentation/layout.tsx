import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "BCP Documentation | Beunec",
    description: "Explore the Beunec Cloud Platform documentation. Learn about our architecture, features, and how to use BCP effectively.",
    openGraph: {
        title: "BCP Documentation | Beunec",
        description: "Official documentation for the Beunec Cloud Platform.",
        url: "https://beunec.co/bcp-documentation",
        siteName: "Beunec",
        images: [
            {
                url: "/assets/beunec-cloud-logo-whitebg.png",
                width: 1200,
                height: 630,
                alt: "Beunec Documentation",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "BCP Documentation | Beunec",
        description: "Eliminate the Toggle Tax with Beunec's secure, zero-knowledge workspace.",
        images: ["/assets/beunec-cloud-logo-whitebg.png"],
    },
};

export default function DocumentationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
