import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocMarkdown } from "@/components/docs/DocMarkdown";
import { DocHero } from "@/components/docs/DocHero";
import { DocToc } from "@/components/docs/DocToc";
import { DocShots } from "@/components/docs/DocShots";
import { shotsForDoc } from "@/lib/aselius-media";
import { parseDoc } from "@/lib/doc-structure";
import {
  getAseliusDoc,
  getInternalAseliusDocs,
  readAseliusDoc,
} from "@/lib/aselius-docs";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getInternalAseliusDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getAseliusDoc(slug);
  if (!doc || doc.externalHref) return {};
  return { title: `${doc.title} · Aselius docs`, description: doc.blurb };
}

export default async function AseliusDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getAseliusDoc(slug);
  if (!doc || doc.externalHref || !doc.file) notFound();

  const parsed = parseDoc(readAseliusDoc(doc));
  const shots = shotsForDoc(doc.slug);

  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-12">
      <div className="min-w-0">
        <DocHero
          title={parsed.title ?? doc.title}
          lead={parsed.lead}
          glance={parsed.glance}
          eyebrow={doc.group ?? "Aselius"}
        />
        <DocShots shots={shots} />
        <DocMarkdown content={parsed.body} />
      </div>
      <aside className="hidden xl:block">
        <DocToc sections={parsed.sections} />
      </aside>
    </div>
  );
}
