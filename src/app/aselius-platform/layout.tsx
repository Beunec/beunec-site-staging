import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aselius Platform",
  description:
    "Aselius is Beunec’s software-as-a-service platform for governed agentic work, collaboration, and knowledge — deploying July 18, 2026.",
};

export default function AseliusPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
