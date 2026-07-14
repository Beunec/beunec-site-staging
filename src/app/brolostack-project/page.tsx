import type { Metadata } from "next";
import { DocPage } from "@/components/docs/DocPage";

export const metadata: Metadata = {
  title: "Brolostack",
  description:
    "A zero-authentication, local-first state vault for AI coding agents — checkpoint, inspect, and restore project files without Git credentials.",
};

export default function BrolostackProjectPage() {
  return (
    <DocPage file="brolostack.md" eyebrow="Research · Brolostack" />
  );
}
