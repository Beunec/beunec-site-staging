import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Beunec",
    description: "Privacy policy for Beunec Technologies, Inc. and the Beunec Cloud Platform.",
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
