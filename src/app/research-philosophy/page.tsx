import type { Metadata } from "next";
import { DocPage } from "@/components/docs/DocPage";
import { DocAudioPlayer } from "@/components/docs/DocAudioPlayer";

export const metadata: Metadata = {
  title: "Research Philosophy",
  description:
    "Beunec’s research philosophy: objectivity, methodological transparency, reproducibility, limitations, and responsible evaluation.",
};

export default function ResearchPhilosophyPage() {
  return (
    <>
      <DocPage
        file="beunec-research-philosophy.md"
        eyebrow="Company · Research Philosophy"
      />
      <DocAudioPlayer slug="research-philosophy" label="research philosophy" />
    </>
  );
}
