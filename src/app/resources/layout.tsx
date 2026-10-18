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
                url: "/assets/beunec-logo-transparent-blacktext.png",
                width: 1605,
                height: 442,
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
