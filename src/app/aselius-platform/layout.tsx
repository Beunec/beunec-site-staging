import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aselius Platform",
  description:
    "Aselius is Beunec’s software-as-a-service platform for governed agentic work, collaboration, and knowledge. Open it at aselius.beunec.com.",
};

export default function AseliusPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
