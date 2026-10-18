import type { Metadata } from "next";
import { AseliusDocsShell } from "@/components/docs/AseliusDocsShell";
import { ASELIUS_DOCS } from "@/lib/aselius-docs";

export const metadata: Metadata = {
  title: "Aselius Platform Documentation",
  description:
    "Guides for the Aselius Platform: Workspace, Automation, Observability, Manage Teams, Selius, Rivine engines, and more.",
};

export default function AseliusDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AseliusDocsShell docs={ASELIUS_DOCS}>{children}</AseliusDocsShell>;
}
