import type { Metadata } from "next";
import { DocPage } from "@/components/docs/DocPage";
import { DocAudioPlayer } from "@/components/docs/DocAudioPlayer";

export const metadata: Metadata = {
  title: "The Beunec Principles",
  description:
    "The Beunec Principles are our organizational framework for approaching data, governance, security, AI adoption, policy awareness, and human responsibility.",
};

export default function PrinciplesPage() {
  return (
    <>
      <DocPage file="beunec-principles.md" eyebrow="Company · Principles" />
      <DocAudioPlayer slug="principles" label="principles" />
    </>
  );
}
