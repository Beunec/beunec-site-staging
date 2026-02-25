import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Data Readiness Policy | Beunec",
    description: "Data readiness policy for Beunec Technologies, Inc. and the Beunec Cloud Platform.",
};

export default function DataReadinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
