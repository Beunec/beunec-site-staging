import type { Metadata } from "next";
import { AseliusDocsShell } from "@/components/docs/AseliusDocsShell";
import { ASELIUS_DOCS } from "@/lib/aselius-docs";

export const metadata: Metadata = {
  title: "Aselius Documentation",
  description:
    "Guides for Aselius, Beunec's agentic infrastructure software: Workspace, Rivine engines, Automation, Observability, Manage Teams, Aselius MCP, Selius, and more.",
};

export default function AseliusDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AseliusDocsShell docs={ASELIUS_DOCS}>{children}</AseliusDocsShell>;
}
