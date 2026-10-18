export const SUBSTACK_FEED_URL = "https://beunec.substack.com/feed";

export const SUBSTACK_API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
  SUBSTACK_FEED_URL,
)}`;

/** URL slug from a post title. Must match everywhere so links resolve. */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
