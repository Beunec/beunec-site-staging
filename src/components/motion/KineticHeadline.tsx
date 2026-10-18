import type { ElementType, ReactNode } from "react";

type KineticHeadlineProps = {
  /** Plain text before the emphasized phrase. */
  lead: string;
  /** The phrase the motion lands on: drawn underline in the accent color. */
  emphasis?: string;
  /** Plain text after the emphasized phrase (punctuation is fine). */
  tail?: string;
  as?: ElementType;
  className?: string;
  /** Extra seconds before the underline draws (defaults to after the last word). */
  emphasisDelay?: number;
};

/**
 * Word-by-word rise out of a mask, then the emphasized phrase is underlined.
 * Server-rendered real text, driven by CSS keyframes in index.css, so it plays
 * on first paint without waiting for hydration and stays readable, selectable
 * and translatable. Reduced motion shows the settled composition.
 */
export function KineticHeadline({
  lead,
  emphasis,
  tail,
  as: Tag = "h1",
  className = "",
  emphasisDelay,
}: KineticHeadlineProps) {
  let i = 0;
  const words = (text: string): ReactNode[] =>
    text
      .split(/(\s+)/)
      .filter((part) => part.length > 0)
      .map((part) => {
        if (/^\s+$/.test(part)) return " ";
        const index = i++;
        return (
          <span key={`w${index}`} className="kt-w">
            <span style={{ ["--i" as string]: index }}>{part}</span>
          </span>
        );
      });

  const leadNodes = words(lead);
  const emNodes = emphasis ? words(emphasis) : [];
  const delay = emphasisDelay ?? Math.min(0.06 + i * 0.065 + 0.35, 1.3);
  // Punctuation right after the phrase stays on its line instead of wrapping alone.
  const glued = tail?.match(/^[.,!?:;]+/)?.[0] ?? "";
  const gluedNodes = glued ? words(glued) : [];
  const rest = tail ? tail.slice(glued.length) : "";
  const tailNodes = rest.trim() ? words(rest) : [];

  return (
    <Tag className={`kt-head ${className}`}>
      {leadNodes}
      {emphasis ? (
        <>
          {lead && !/\s$/.test(lead) ? " " : null}
          {/* Trailing punctuation sits inside the phrase so it never wraps onto a line alone */}
          <span className="kt-em" style={{ ["--em-delay" as string]: `${delay}s` }}>
            {emNodes}
            {gluedNodes}
          </span>
        </>
      ) : null}
      {rest && /^\s/.test(rest) ? " " : null}
      {tailNodes}
    </Tag>
  );
}
