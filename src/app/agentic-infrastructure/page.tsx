import type { Metadata } from "next";
import { DocPage } from "@/components/docs/DocPage";
import { DocAudioPlayer } from "@/components/docs/DocAudioPlayer";

export const metadata: Metadata = {
  title: "Agentic Infrastructure",
  description:
    "Beunec’s definition of Agentic Infrastructure — the physical, virtual, operational, and human foundation for dependable autonomous systems.",
};

export default function AgenticInfrastructurePage() {
  return (
    <>
      <DocPage
        file="beunec-agentic-infrastructure.md"
        eyebrow="Company · Agentic Infrastructure"
      />
      <DocAudioPlayer slug="agentic-infrastructure" label="agentic infrastructure" />
    </>
  );
}
