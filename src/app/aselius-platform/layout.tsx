import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aselius: agentic infrastructure software",
  description:
    "Aselius is Beunec's agentic infrastructure software: specialized Rivine engines run governed work and hand you real deliverables. Use it on the web, from any AI app through Aselius MCP, in your browser, terminal and chat apps. Open it at aselius.beunec.com.",
};

export default function AseliusPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
