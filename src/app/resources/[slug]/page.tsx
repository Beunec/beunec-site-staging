import { SUBSTACK_API_URL, generateSlug } from "@/lib/substack";
import { ArticleView } from "./ArticleView";

// Static export: only slugs returned here get a page; article body is still
// fetched client-side so content stays current between deploys.
export const dynamicParams = false;

type FeedItem = { title: string };

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(SUBSTACK_API_URL);
    const data = await res.json();
    if (data.status !== "ok" || !Array.isArray(data.items)) return [];
    return data.items.map((item: FeedItem) => ({ slug: generateSlug(item.title) }));
  } catch {
    // ponytail: offline build → no prebuilt articles; the /resources list
    // still renders and a rebuild regenerates them. Upgrade path: pin a
    // slug manifest committed at build time if RSS reliability becomes a problem.
    return [];
  }
}

export default function ArticlePage() {
  return <ArticleView />;
}
