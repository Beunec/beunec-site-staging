import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing & Plans | Beunec Cloud Platform",
    description: "Flexible, transparent pricing for enterprise cloud infrastructure. Choose the plan that fits your scale.",
    openGraph: {
        title: "Beunec BCP Pricing | Flexible Plans",
        description: "Compare plans and pricing for the Beunec Cloud Platform.",
        images: ["/assets/beunec-cloud-logo-whitebg.png"],
    },
    twitter: {
        card: "summary_large_image",
        title: "BCP Pricing | Beunec",
        description: "Flexible, transparent pricing for enterprise cloud infrastructure. Choose the plan that fits your scale.",
        images: ["/assets/beunec-cloud-logo-whitebg.png"],
    },
};

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
