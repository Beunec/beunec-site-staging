import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocMarkdown } from "@/components/docs/DocMarkdown";
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
  return <DocMarkdown content={markdown} />;
}
