import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Beunec",
    description:
        "Privacy Policy for Beunec Technologies, Inc., the Aselius Platform, and all Beunec Services, including research and development offerings.",
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
