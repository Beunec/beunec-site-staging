import type { Components } from "react-markdown";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidBlock } from "@/components/docs/MermaidBlock";
import { slugifyHeading } from "@/lib/doc-structure";

// Numbered sections alternate the two brand accents, nothing outside the theme.
const PRINCIPLE_ACCENTS = [
  { bar: "var(--accent-sage)", soft: "color-mix(in srgb, var(--accent-sage) 12%, transparent)", chip: "var(--accent-sage)" },
  { bar: "var(--accent-slate)", soft: "color-mix(in srgb, var(--accent-slate) 14%, transparent)", chip: "var(--accent-slate)" },
];

function nodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (typeof node === "object" && "props" in node) {
    return nodeText((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

function sectionAccent(text: string) {
  const m =
    text.match(/Principle\s+(\d+)/i) ?? text.match(/^\s*(\d+)[.:)\s]/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n) || n < 1) return null;
  return {
    ...PRINCIPLE_ACCENTS[(n - 1) % PRINCIPLE_ACCENTS.length],
    num: String(n),
  };
}

function isMermaidCode(
  child: ReactNode,
): child is ReactElement<{ className?: string; children?: ReactNode }> {
  if (!child || typeof child !== "object" || !("props" in child)) return false;
  const className = (child.props as { className?: string }).className ?? "";
  return className.includes("language-mermaid");
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
      {children}
    </h1>
  ),
  h2: ({ children }) => {
    const plain = nodeText(children);
    const accent = sectionAccent(plain);
    if (accent) {
      return (
        <h2
          id={slugifyHeading(plain)}
          data-reveal
          className="mt-14 mb-5 scroll-mt-28 rounded-2xl border border-border px-5 py-4 text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-start gap-4"
          style={{
            background: accent.soft,
            borderLeftWidth: 4,
            borderLeftColor: accent.bar,
          }}
        >
          <span
            className="shrink-0 mt-0.5 inline-flex h-8 min-w-8 items-center justify-center rounded-full text-sm font-bold px-2"
            style={{ background: accent.chip, color: "#f4f4f0" }}
          >
            {accent.num}
          </span>
          <span className="leading-snug">{children}</span>
        </h2>
      );
    }
    return (
      <h2
        id={slugifyHeading(plain)}
        data-reveal
        className="mt-14 mb-5 scroll-mt-28 text-2xl sm:text-3xl font-bold tracking-tight text-foreground border-b border-border pb-3"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 scroll-mt-28 text-xl font-semibold text-foreground tracking-tight">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-base sm:text-[1.05rem] leading-relaxed text-muted-foreground mb-5">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong
      className="font-semibold text-foreground px-1 rounded-sm"
      style={{ background: "color-mix(in srgb, var(--accent-sage) 14%, transparent)" }}
    >
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-foreground/90">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote
      data-reveal
      className="doc-callout my-8 rounded-2xl border border-border border-l-4 px-6 py-5 [&_p]:mb-0 [&_p]:text-base [&_p]:text-foreground [&_p]:leading-relaxed"
      style={{
        borderLeftColor: "var(--accent-sage)",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-sage) 12%, transparent), color-mix(in srgb, var(--accent-slate) 8%, transparent))",
      }}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="my-5 space-y-2.5 pl-0 list-none doc-md-ul">{children}</ul>
  ),
  // Numbered lists are steps: a counter in a sage disc on a vertical rail.
  ol: ({ children }) => <ol className="doc-steps my-7 list-none pl-0 doc-md-ol">{children}</ol>,
  li: ({ children }) => (
    <li data-reveal="left" className="text-base text-muted-foreground leading-relaxed doc-md-li">
      <span className="doc-md-li-dot mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-sage" aria-hidden />
      <span className="min-w-0">{children}</span>
    </li>
  ),
  a: ({ href, children }) => {
    const external = Boolean(href?.startsWith("http"));
    const className =
      "text-accent-slate underline underline-offset-4 hover:text-accent-sage transition-colors";
    const style = { textDecorationColor: "rgba(122,139,153,0.4)" };
    if (href && !external) {
      return (
        <Link href={href} className={className} style={style}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className={className}
        style={style}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  },
  hr: () => <hr className="my-12 border-border" />,
  code: ({ className, children }) => {
    const isBlock = Boolean(className) || nodeText(children).includes("\n");
    if (isBlock) {
      return (
        <code className={`${className ?? ""} font-mono text-sm text-[color:var(--on-ink)]`}>
          {children}
        </code>
      );
    }
    return (
      <code className="rounded-md bg-container border border-border px-1.5 py-0.5 font-mono text-[max(14px,0.9em)] text-accent-sage">
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    const kid = Array.isArray(children) ? children[0] : children;
    if (isMermaidCode(kid)) {
      return (
        <div data-reveal="scale">
          <MermaidBlock chart={nodeText(kid.props.children)} />
        </div>
      );
    }
    return (
      <pre className="my-6 overflow-x-auto rounded-2xl border border-border bg-[color:var(--surface-ink)] dark:bg-[color:var(--surface-ink-deep)] p-5 text-sm leading-relaxed">
        {children}
      </pre>
    );
  },
  table: ({ children }) => (
    <div data-reveal className="my-8 overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm sm:text-[15px]">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-container text-foreground">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-semibold border-b border-border">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-muted-foreground border-b border-border align-top">
      {children}
    </td>
  ),
  tr: ({ children }) => (
    <tr className="even:bg-container/50">{children}</tr>
  ),
  img: ({ src, alt }) => {
    const label = alt ?? "";
    const isDark = /\(dark\)\s*$/i.test(label);
    const isLight = /\(light\)\s*$/i.test(label);
    const themeClass = isDark
      ? "hidden dark:block"
      : isLight
        ? "block dark:hidden"
        : "";
    return (
      <img
        src={typeof src === "string" ? src : undefined}
        alt={label.replace(/\s*\((dark|light)\)\s*$/i, "")}
        className={`my-8 w-full rounded-2xl border border-border ${themeClass}`}
      />
    );
  },
};

type DocMarkdownProps = {
  content: string;
  className?: string;
};

/** Colorful BAAP-styled markdown. Feed any Beunec Docs .md string. */
export function DocMarkdown({ content, className }: DocMarkdownProps) {
  return (
    <article className={["doc-markdown", className].filter(Boolean).join(" ")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
