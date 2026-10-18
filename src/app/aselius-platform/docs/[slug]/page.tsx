import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocMarkdown } from "@/components/docs/DocMarkdown";
import { DocShots } from "@/components/docs/DocShots";
import { shotsForDoc } from "@/lib/aselius-media";
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
  return { title: doc.title, description: doc.blurb };
}

export default async function AseliusDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getAseliusDoc(slug);
  if (!doc || doc.externalHref || !doc.file) notFound();

  const markdown = readAseliusDoc(doc);
  const shots = shotsForDoc(doc.slug);
  if (shots.length === 0) return <DocMarkdown content={markdown} />;

  // Screens go right after the introduction, before the first section, so a
  // reader sees the product before the detail. Never split inside a code fence.
  const cut = markdown.indexOf("\n## ");
  const fencesBefore = cut > 0 ? (markdown.slice(0, cut).match(/^```/gm) ?? []).length : 1;
  if (cut <= 0 || fencesBefore % 2 === 1) {
    return (
      <>
        <DocMarkdown content={markdown} />
        <DocShots shots={shots} />
      </>
    );
  }
  return (
    <>
      <DocMarkdown content={markdown.slice(0, cut)} />
      <DocShots shots={shots} />
      <DocMarkdown content={markdown.slice(cut + 1)} />
    </>
  );
}
