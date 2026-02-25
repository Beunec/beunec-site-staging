import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Resources | Beunec",
    description: "Stay updated with the latest research, product releases, and insights on the future of work from the Beunec team.",
    openGraph: {
        title: "Resources | Beunec",
        description: "Latest insights and updates from Beunec.",
        url: "https://beunec.co/resources",
        siteName: "Beunec",
        images: [
            {
                url: "/assets/social-share.png",
                width: 1200,
                height: 630,
                alt: "Beunec Resources",
            },
        ],
    },
};

export default function ResourcesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
