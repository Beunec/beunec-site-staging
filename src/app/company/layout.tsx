import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Company | Beunec",
    description: "Redefining how people, agents, and intelligent systems collaborate seamlessly. Shaping the Future of Work.",
    openGraph: {
        title: "Company | Beunec",
        description: "Discover the vision and agenda of Beunec. Creating a world where humans and AI collaborate seamlessly.",
        url: "https://beunec.co/company",
        siteName: "Beunec",
        images: [
            {
                url: "/assets/social-share.png",
                width: 1200,
                height: 630,
                alt: "Beunec",
            },
        ],
    },
};

export default function CompanyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
