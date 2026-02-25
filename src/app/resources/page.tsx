"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Loader2 } from "lucide-react";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";

interface SubstackPost {
    title: string;
    pubDate: string;
    link: string;
    guid: string;
    author: string;
    thumbnail: string;
    description: string;
    content: string;
    enclosure: {
        link?: string;
        type?: string;
    };
    categories: string[];
}

const getPostImage = (post: SubstackPost) => {
    // Priority: Enclosure (Substack CDN) > Thumbnail > Description Image Match
    if (post.enclosure?.link) return post.enclosure.link;
    if (post.thumbnail) return post.thumbnail;

    // Fallback: Try to find image in description/content
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = post.description.match(imgRegex) || post.content.match(imgRegex);
    return match ? match[1] : null;
};

// Generate slug from title
const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 80);
};

export default function ResourcesPage() {
    const [posts, setPosts] = useState<SubstackPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const rssUrl = "https://beunec.substack.com/feed";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    useEffect(() => {
        window.scrollTo(0, 0);

        fetch(apiUrl)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch posts");
                return res.json();
            })
            .then((data) => {
                if (data.status === "ok") {
                    setPosts(data.items);
                } else {
                    throw new Error(data.message || "Failed to parse feed");
                }
            })
            .catch((err) => {
                console.error("Error fetching Substack posts:", err);
                setError("Unable to load latest resources. Please check back later.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [apiUrl]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            <main className="pt-24 lg:pt-32 pb-24">
                {/* Hero Section */}
                <section className="relative px-4 py-20 mb-20 overflow-hidden">
                    <ParticleBackground />
                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-3 py-1 rounded-full bg-beunec-blue/10 text-beunec-blue text-xs font-bold uppercase tracking-widest mb-4 inline-block dark:text-[#D3D3D3]"
                        >
                            The Beunec Journal
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-serif mb-6"
                        >
                            Latest Insights from <br /> the Frontier of Work
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
                        >
                            Explore our latest research, deep dives into agentic systems, and updates on the Beunec Cloud Platform.
                        </motion.p>
                    </div>
                </section>

                {/* Content Section */}
                <section className="px-4 max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <Loader2 className="w-10 h-10 text-beunec-blue animate-spin" />
                            <p className="text-muted-foreground animate-pulse">Fetching latest papers...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-border">
                            <p className="text-red-500 mb-6">{error}</p>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                                className="border-beunec-blue text-beunec-blue"
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-32">
                            <p className="text-muted-foreground">No posts discovered yet. Stay tuned!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post, idx) => (
                                <motion.article
                                    key={post.guid}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-beunec-blue/5 transition-all duration-300 cursor-pointer"
                                    onClick={() => router.push(`/resources/${generateSlug(post.title)}`)}
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-[16/9] overflow-hidden bg-muted relative">
                                        {getPostImage(post) ? (
                                            <img
                                                src={getPostImage(post)!}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-beunec-blue/10 to-beunec-blue/5">
                                                <img src="/assets/beunec-logo-transparent-blacktext.png" className="w-12 h-auto opacity-20" alt="Beunec" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="w-4 h-4 text-beunec-blue" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(post.pubDate).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {post.author || "Beunec Team"}
                                            </div>
                                        </div>

                                        <h2 className="text-xl font-bold mb-3 group-hover:text-beunec-blue transition-colors line-clamp-2 dark:text-[#D3D3D3]">
                                            {post.title}
                                        </h2>

                                        <div
                                            className="text-muted-foreground text-sm line-clamp-3 mb-6"
                                            dangerouslySetInnerHTML={{ __html: post.description.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...' }}
                                        />

                                        <div className="mt-auto flex items-center text-sm font-semibold text-beunec-blue dark:text-[#D3D3D3]">
                                            Read full article
                                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    )}
                </section>

                {/* Substack Call to Action */}
                <section className="px-4 mt-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="max-w-4xl mx-auto p-8 md:p-12 rounded-[2.5rem] bg-slate-900 text-white text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-beunec-blue/10 pointer-events-none" />
                        <h2 className="text-2xl md:text-4xl font-serif mb-6 relative z-10">
                            Never miss a breakthrough.
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-lg mx-auto relative z-10">
                            Join 1,000+ professionals of all levels and students receiving our weekly insights. Directly to your inbox.
                        </p>
                        <div className="relative z-10">
                            <Button
                                asChild
                                className="bg-white text-slate-950 hover:bg-slate-100 px-8 py-6 rounded-xl text-lg font-bold"
                            >
                                <a href="https://beunec.substack.com" target="_blank" rel="noopener noreferrer">
                                    Subscribe to Substack
                                </a>
                            </Button>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
