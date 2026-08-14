import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Use | Beunec",
    description:
        "Terms of Use for Beunec Technologies, Inc., the Aselius Platform, and all Beunec Services, including research and development offerings.",
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
