import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Beunec Cloud Pro for College Students | Beunec",
    description: "Get 2 months of Beunec Cloud Pro for $0. Unify your research, files, and academic workflows in one focused workspace.",
    openGraph: {
        title: "Beunec Cloud Pro for College Students | Beunec",
        description: "Get 2 months of Beunec Cloud Pro for $0. Unify your research, files, and academic workflows in one focused workspace.",
        images: ["/assets/beunec-cloud-logo-whitebg.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "Beunec Cloud Pro for College Students | Beunec",
        description: "Get 2 months of Beunec Cloud Pro for $0. Unify your research, files, and academic workflows in one focused workspace.",
        images: ["/assets/beunec-cloud-logo-whitebg.png"],
    },
};

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
