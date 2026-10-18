/**
 * Splits a docs markdown file into the parts the docs page presents
 * differently: the title, the lead paragraph, the "At a glance" facts, the
 * body, and the list of sections for the contents rail.
 *
 * Expected shape (every Aselius doc follows it; anything else still renders):
 *   # Title
 *   Lead paragraph.
 *   ## At a glance
 *   - **Label:** value
 *   ## Sections...
 */

export type GlanceFact = { label: string; value: string };
export type DocSection = { id: string; text: string };

export type DocStructure = {
  title: string | null;
  lead: string | null;
  glance: GlanceFact[];
  body: string;
  sections: DocSection[];
};

/** Heading text → anchor id. Shared with the markdown renderer so links match. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseDoc(markdown: string): DocStructure {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  const skipBlank = () => {
    while (i < lines.length && lines[i].trim() === "") i++;
  };

  skipBlank();
  let title: string | null = null;
  if (lines[i]?.startsWith("# ")) {
    title = lines[i].slice(2).trim();
    i++;
  }

  // Lead: the first plain paragraph after the title.
  skipBlank();
  let lead: string | null = null;
  const leadStart = i;
  const isPlain = (l: string) => l.trim() !== "" && !/^(#|>|[-*+] |\d+\. |\||```|!\[|<)/.test(l.trim());
  if (title && i < lines.length && isPlain(lines[i])) {
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && isPlain(lines[i])) para.push(lines[i++].trim());
    lead = para.join(" ");
  } else {
    i = leadStart;
  }

  // At a glance: a "## At a glance" section made of "- **Label:** value" bullets.
  skipBlank();
  const glance: GlanceFact[] = [];
  if (/^##\s+at a glance\s*$/i.test(lines[i] ?? "")) {
    i++;
    while (i < lines.length && !lines[i].startsWith("## ")) {
      const m = lines[i].match(/^\s*[-*]\s+\*\*(.+?):?\*\*:?\s*(.+)$/);
      if (m) glance.push({ label: m[1].replace(/:$/, "").trim(), value: m[2].trim() });
      i++;
    }
  }

  const body = lines.slice(i).join("\n").trim();

  const sections: DocSection[] = [];
  let fenced = false;
  for (const line of body.split("\n")) {
    if (line.trim().startsWith("```")) fenced = !fenced;
    if (fenced) continue;
    const m = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (m) {
      const text = m[1].replace(/[`*_]/g, "").trim();
      sections.push({ id: slugifyHeading(text), text });
    }
  }

  return { title, lead, glance, body, sections };
}
