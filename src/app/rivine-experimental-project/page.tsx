import type { Metadata } from "next";
import { DocPage } from "@/components/docs/DocPage";
import { DocAudioPlayer } from "@/components/docs/DocAudioPlayer";

export const metadata: Metadata = {
  title: "Rivine Experimental Project",
  description:
    "An architecture for reliable, long-horizon agentic systems — Beunec’s Rivine orchestration and reasoning research.",
};

export default function RivineExperimentalProjectPage() {
  return (
    <>
      <DocPage
        file="rivine-experimental-project.md"
        eyebrow="Research · Rivine"
      />
      <DocAudioPlayer slug="rivine-experimental-project" label="Rivine experimental project" />
    </>
  );
}
