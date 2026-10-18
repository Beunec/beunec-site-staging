import { SUBSTACK_API_URL, generateSlug } from "@/lib/substack";
import { ArticleView } from "./ArticleView";

// Static export: only slugs returned here get a page; article body is still
// fetched client-side so content stays current between deploys.
export const dynamicParams = false;

type FeedItem = { title: string };

// A static export must emit at least one page for this route, so when the
// feed is unreachable at build time a placeholder slug keeps the build green.
// ArticleView shows "Article not found" for it; a rebuild picks up real posts.
const OFFLINE_PLACEHOLDER = [{ slug: "unavailable" }];

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(SUBSTACK_API_URL);
    const data = await res.json();
    if (data.status !== "ok" || !Array.isArray(data.items) || data.items.length === 0) {
      return OFFLINE_PLACEHOLDER;
    }
    return data.items.map((item: FeedItem) => ({ slug: generateSlug(item.title) }));
  } catch {
    return OFFLINE_PLACEHOLDER;
  }
}

export default function ArticlePage() {
  return <ArticleView />;
}
