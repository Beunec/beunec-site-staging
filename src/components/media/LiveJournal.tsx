"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SUBSTACK_API_URL, generateSlug } from "@/lib/substack";

type Post = { title: string; pubDate: string; description: string };

/**
 * The newest Beunec journal posts, fetched live from the same feed as the
 * Resources page, but only once this block scrolls near the viewport so it
 * never competes with the page's first load. If the feed is unreachable the
 * block quietly falls back to a link to Resources.
 */
export function LiveJournal() {
  const ref = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done) return;
        done = true;
        io.disconnect();
        fetch(SUBSTACK_API_URL)
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((data) => {
            if (data.status !== "ok" || !Array.isArray(data.items)) throw new Error();
            setPosts(data.items.slice(0, 3));
          })
          .catch(() => setFailed(true));
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const strip = (html: string) =>
    html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 150);

  return (
    <div ref={ref} aria-live="polite">
      {posts && posts.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <li key={p.title}>
              <Link
                href={`/resources/${generateSlug(p.title)}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-container p-5 transition-colors hover:border-accent-sage/60"
              >
                <span className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">
                  {new Date(p.pubDate.replace(" ", "T")).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <span className="mt-2 text-base font-semibold leading-snug text-foreground">{p.title}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{strip(p.description)}…</span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-sage">
                  Read <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {failed ? "The journal feed is unavailable right now. " : posts ? "" : "Loading the latest posts… "}
          <Link href="/resources" className="font-medium text-accent-sage hover:text-foreground">
            Browse every post in Resources
          </Link>
        </p>
      )}
    </div>
  );
}
