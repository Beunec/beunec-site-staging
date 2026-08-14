import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Data Readiness Policy | Beunec",
    description:
        "Data Readiness Policy for Beunec Technologies, Inc., the Aselius Platform, and all Beunec Services, including research and development offerings.",
};

export default function DataReadinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
