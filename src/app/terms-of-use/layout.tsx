import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Use | Beunec",
    description: "Terms and conditions for using the Beunec Cloud Platform.",
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
