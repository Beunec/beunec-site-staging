import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Akinnawo Logic V2",
  description:
    "Purchase Akinnawo-Logic-V2 research documentation: a commercial sale of digital intellectual property that funds Beunec's open-source agentic infrastructure roadmap. Not equity, not a donation, not an investment.",
};

export default function AkinnawoLogicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
