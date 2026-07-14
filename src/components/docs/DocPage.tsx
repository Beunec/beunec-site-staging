import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { DocMarkdown } from "@/components/docs/DocMarkdown";
import { readBeunecDoc } from "@/lib/beunec-docs";

type DocPageProps = {
  file: string;
  eyebrow: string;
};

/** Shell for markdown doc routes — edit Beunec Docs/*.md, not React. */
export function DocPage({ file, eyebrow }: DocPageProps) {
  const markdown = readBeunecDoc(file);

  return (
    <div className="baap-page min-h-screen">
      <Header />
      <main className="pt-28 md:pt-32 pb-20 md:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-8">
            {eyebrow}
          </p>
          <DocMarkdown content={markdown} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
