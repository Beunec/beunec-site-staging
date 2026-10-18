"use client";

import { useRouter } from "next/navigation";
import { AgenticMindMap } from "./AgenticMindMap";

export function HeroMindMap() {
  const router = useRouter();
  return (
    <AgenticMindMap
      title="Beunec was born as a solution agent."
      subtitle="Drawn toward unstable systems, not to exploit their disorder, but to understand them and help make them stable."
      ctaLabel="Learn more"
      onCta={() => router.push("/company")}
    />
  );
}
