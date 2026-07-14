"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, ExternalLink, Loader2, Share2, BookOpen, Heart, MessageCircle, Repeat } from "lucide-react";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";
import DOMPurify from "isomorphic-dompurify";
import parse, { domToReact, HTMLReactParserOptions, Element } from "html-react-parser";
import { SUBSTACK_API_URL, generateSlug } from "@/lib/substack";

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
    if (post.enclosure?.link) return post.enclosure.link;
    if (post.thumbnail) return post.thumbnail;
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = post.description.match(imgRegex) || post.content.match(imgRegex);
    return match ? match[1] : null;
};

export function ArticleView() {
    const params = useParams();
    const router = useRouter();
    const slug = (params?.slug as string) || "";

    const [post, setPost] = useState<SubstackPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liked, setLiked] = useState(false);
    const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setToast({ message, type });
        window.setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        fetch(SUBSTACK_API_URL)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch posts");
                return res.json();
            })
            .then((data) => {
                if (data.status === "ok") {
                    // Find the post that matches the slug
                    const foundPost = data.items.find((item: SubstackPost) => 
                        generateSlug(item.title) === slug
                    );
                    if (foundPost) {
                        setPost(foundPost);
                    } else {
                        setError("Article not found");
                    }
                } else {
                    throw new Error(data.message || "Failed to parse feed");
                }
            })
            .catch((err) => {
                console.error("Error fetching Substack post:", err);
                setError("Unable to load this article. Please try again later.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [slug]);

    const handleShare = async () => {
        if (navigator.share && post) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.description.replace(/<[^>]*>?/gm, '').slice(0, 150),
                    url: window.location.href,
                });
                showToast('Shared successfully', 'success');
            } catch (err) {
                // User cancelled or share failed
                console.log("Share cancelled");
                showToast('Share cancelled', 'info');
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard', 'success');
            } catch (e) {
                showToast('Unable to copy link', 'error');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="baap-page min-h-screen">
                <Header />
                <main className="pt-24 lg:pt-32 pb-24">
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="w-10 h-10 text-beunec-blue animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Loading article...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="baap-page min-h-screen">
                <Header />
                <main className="pt-24 lg:pt-32 pb-24">
                    <div className="max-w-4xl mx-auto px-4 text-center py-32">
                        <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
                        <p className="text-muted-foreground mb-8">{error || "The article you're looking for doesn't exist."}</p>
                        <Button onClick={() => router.push('/resources')} className="bg-beunec-blue hover:bg-beunec-blue/90">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Resources
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const postImage = getPostImage(post);
    const formattedDate = new Date(post.pubDate).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Estimate reading time (average 200 words per minute)
    const wordCount = post.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Configure HTML parser options to style elements properly
    const parseOptions: HTMLReactParserOptions = {
        replace: (domNode) => {
            if (domNode instanceof Element && domNode.attribs) {
                // Handle images
                if (domNode.name === 'img') {
                    return (
                        <figure className="my-12 mx-auto max-w-4xl">
                            <img 
                                src={domNode.attribs.src} 
                                alt={domNode.attribs.alt || "Article image"} 
                                className="w-full h-auto rounded-2xl shadow-lg border border-border/50"
                                loading="lazy"
                            />
                            {domNode.attribs.alt && (
                                <figcaption className="text-center text-sm text-muted-foreground mt-3 font-sans">
                                    {domNode.attribs.alt}
                                </figcaption>
                            )}
                        </figure>
                    );
                }
                
                // Handle links
                if (domNode.name === 'a') {
                    return (
                        <a 
                            href={domNode.attribs.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-beunec-blue underline decoration-beunec-blue/30 hover:decoration-beunec-blue underline-offset-4 transition-all"
                        >
                            {domToReact(domNode.children as any, parseOptions)}
                        </a>
                    );
                }

                // Handle blockquotes
                if (domNode.name === 'blockquote') {
                    return (
                        <blockquote className="border-l-4 border-beunec-blue pl-5 py-2 my-6 italic text-muted-foreground font-serif bg-muted/30 rounded-r-lg">
                            {domToReact(domNode.children as any, parseOptions)}
                        </blockquote>
                    );
                }

                // Handle headings
                if (domNode.name === 'h1') {
                    return <h1 className="text-3xl md:text-4xl font-serif font-bold mt-12 mb-6 tracking-tight text-foreground">{domToReact(domNode.children as any, parseOptions)}</h1>;
                }
                if (domNode.name === 'h2') {
                    return <h2 className="text-2xl md:text-3xl font-serif font-bold mt-10 mb-5 tracking-tight text-foreground">{domToReact(domNode.children as any, parseOptions)}</h2>;
                }
                if (domNode.name === 'h3') {
                    return <h3 className="text-xl md:text-2xl font-serif font-bold mt-8 mb-4 tracking-tight text-foreground">{domToReact(domNode.children as any, parseOptions)}</h3>;
                }
                if (domNode.name === 'h4') {
                    return <h4 className="text-lg md:text-xl font-serif font-bold mt-6 mb-3 tracking-tight text-foreground">{domToReact(domNode.children as any, parseOptions)}</h4>;
                }

                // Handle paragraphs
                if (domNode.name === 'p') {
                    return <p className="font-serif text-base md:text-lg text-foreground/90 leading-relaxed mb-6">{domToReact(domNode.children as any, parseOptions)}</p>;
                }

                // Handle lists
                if (domNode.name === 'ul') {
                    return <ul className="list-disc pl-6 mb-6 font-serif text-base md:text-lg text-foreground/90 space-y-2 marker:text-beunec-blue">{domToReact(domNode.children as any, parseOptions)}</ul>;
                }
                if (domNode.name === 'ol') {
                    return <ol className="list-decimal pl-6 mb-6 font-serif text-base md:text-lg text-foreground/90 space-y-2 marker:text-beunec-blue font-medium">{domToReact(domNode.children as any, parseOptions)}</ol>;
                }
                if (domNode.name === 'li') {
                    return <li className="pl-2 mb-1">{domToReact(domNode.children as any, parseOptions)}</li>;
                }

                // Handle bold/strong
                if (domNode.name === 'strong' || domNode.name === 'b') {
                    return <strong className="font-bold text-foreground">{domToReact(domNode.children as any, parseOptions)}</strong>;
                }

                // Handle horizontal rules
                if (domNode.name === 'hr') {
                    return <hr className="border-border my-12" />;
                }
            }
        }
    };

    // Sanitize the HTML content before parsing
    const cleanHtml = DOMPurify.sanitize(post.content, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
    });

    return (
        <div className="baap-page min-h-screen selection:bg-beunec-blue/20">
            <Header />

            <main className="pt-32 pb-24">
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/resources')}
                        className="mb-8 -ml-4 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Resources
                    </Button>

                    {/* Article Header */}
                    <header className="mb-12 text-left">
                        {post.categories && post.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.categories.map((category, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 rounded-full bg-beunec-blue/10 text-beunec-blue text-xs font-bold uppercase tracking-wider"
                                    >
                                        {category}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 leading-[1.1] tracking-tight text-foreground">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-4 pb-2">
                            {/* Avatar using Beunec icon */}
                            <div className="flex-shrink-0">
                                <img src="/assets/beunec-logo.png" alt="Beunec" className="w-10 h-10 rounded-full shadow-md object-cover" />
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                                <div className="font-semibold text-foreground text-sm">{post.author || "Beunec Team"}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span>{formattedDate}</span>
                                    <span>•</span>
                                    <span>{readingTime} min read</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions row: icons left, subscribe button right */}
                        <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <button
                                    aria-label="Like"
                                    onClick={() => setLiked((v) => !v)}
                                    className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/30 bg-transparent text-sm transition-colors ${liked ? 'bg-beunec-blue/10 text-beunec-blue' : 'text-muted-foreground hover:bg-muted/30'}`}
                                >
                                    <Heart className="w-4 h-4" />
                                </button>

                                <button
                                    aria-label="Comment"
                                    onClick={() => window.open(post.link, '_blank')}
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/30 text-muted-foreground hover:bg-muted/30"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </button>

                                <button
                                    aria-label="Repost"
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(post.link);
                                            showToast('Post link copied for reposting', 'success');
                                        } catch (e) {
                                            showToast('Failed to copy link', 'error');
                                        }
                                    }}
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/30 text-muted-foreground hover:bg-muted/30"
                                >
                                    <Repeat className="w-4 h-4" />
                                </button>

                                <button
                                    aria-label="Share"
                                    onClick={handleShare}
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-border/30 text-muted-foreground hover:bg-muted/30"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div>
                                <Button asChild className="rounded-full px-4 py-2 text-sm">
                                    <a href="https://beunec.substack.com" target="_blank" rel="noopener noreferrer">Subscribe</a>
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* Article Content */}
                    <div className="article-content max-w-3xl mx-auto">
                        {parse(cleanHtml, parseOptions)}
                    </div>

                    {/* Toast */}
                    {toast && (
                        <div className="fixed right-6 bottom-6 z-50">
                            <div className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg border ${toast.type === 'success' ? 'bg-beunec-blue/95 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-container text-foreground'} border-border/40`}>
                                <div className="text-sm">{toast.message}</div>
                            </div>
                        </div>
                    )}

                    {/* Article Footer */}
                    <footer className="mt-16 pt-8 border-t border-border">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    onClick={handleShare}
                                    className="border-beunec-blue text-beunec-blue hover:bg-beunec-blue/10 rounded-full px-6"
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share Article
                                </Button>
                                <Button
                                    variant="secondary"
                                    asChild
                                    className="rounded-full px-6"
                                >
                                    <a href={post.link} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Read on Substack
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </footer>
                </article>

                {/* Subscribe CTA */}
                <section className="px-4 mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto p-10 md:p-16 rounded-[3rem] baap-container text-foreground text-center relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-beunec-blue/20 to-transparent pointer-events-none" />
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 relative z-10">
                            Enjoyed this article?
                        </h2>
                        <p className="text-muted-foreground mb-10 max-w-xl mx-auto relative z-10 text-lg">
                            Subscribe to The Beunec Journal for weekly insights on the future of work, agentic systems, and AI orchestration.
                        </p>
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                asChild
                                className="bg-beunec-sage text-primary-foreground hover:opacity-90 px-8 py-6 rounded-full font-bold text-lg transition-transform hover:scale-105"
                            >
                                <a href="https://beunec.substack.com" target="_blank" rel="noopener noreferrer">
                                    Subscribe for Free
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/resources')}
                                className="border-border text-accent-sage hover:bg-state-hover px-8 py-6 rounded-full font-bold text-lg transition-colors duration-200"
                            >
                                Browse More
                            </Button>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
