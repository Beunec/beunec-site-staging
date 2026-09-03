import fs from "fs";
import path from "path";

export type AseliusDoc = {
  slug: string;
  title: string;
  /** File name inside `dir` (defaults to `Aselius Platform Documentations/`). */
  file: string;
  blurb: string;
  /** Sidebar group heading. Defaults to "Documentation". */
  group?: string;
  /** Source folder relative to repo root. Defaults to the platform docs folder. */
  dir?: string;
};

const DEFAULT_DIR = "Aselius Platform Documentations";
const ENGINES_DIR = "Beunec Docs/rivine agentic engines";

/** Sidebar order = array order. Add a line here to publish another .md. */
export const ASELIUS_DOCS: AseliusDoc[] = [
  {
    slug: "workspace",
    title: "Aselius Workspace",
    file: "aselius-workspace.md",
    group: "Platform",
    blurb: "The agentic task environment: Taskspace, engines, previews, and governance.",
  },
  {
    slug: "manage-files",
    title: "Manage Files",
    file: "aselius_manage-files.md",
    group: "Platform",
    blurb: "Markdown-first storage, conversion, organization, and AI over your library.",
  },
  {
    slug: "messages",
    title: "Messages",
    file: "aselius-messages-guide.md",
    group: "Platform",
    blurb: "Secure direct and group messaging with channels, files, and real-time delivery.",
  },
  {
    slug: "manage-teams",
    title: "Manage Teams",
    file: "aselius-manage-teams-guide.md",
    group: "Platform",
    blurb: "Organizations, roles, and personal connections across the platform.",
  },
  {
    slug: "plans-pricing",
    title: "Plans & Pricing",
    file: "plans-pricing.md",
    group: "Platform",
    blurb: "Base, Pro, and Essential plans, credits, and feature comparison.",
  },
  {
    slug: "comparison",
    title: "Platform Comparison",
    file: "aselius-competitors.md",
    group: "Platform",
    blurb: "How Aselius compares with other enterprise AI agent platforms.",
  },
  {
    slug: "security-disclosure",
    title: "Security Disclosure",
    file: "SECURITY_DISCLOSURE.md",
    group: "Platform",
    blurb: "Security model, data handling, encryption, and vulnerability reporting for Aselius.",
  },
  {
    slug: "rivine-taskforce",
    title: "Rivine TaskForce",
    file: "rivine_taskforce.md",
    group: "Rivine Engines",
    dir: ENGINES_DIR,
    blurb: "Action-oriented professional work: connected apps, specialties, and deliverables, not generative chat.",
  },
  {
    slug: "rivine-research",
    title: "Rivine Research",
    file: "rivine_research.md",
    group: "Rivine Engines",
    dir: ENGINES_DIR,
    blurb: "Source-grounded investigation delivered as a report or a structured spreadsheet.",
  },
  {
    slug: "rivine-code",
    title: "Rivine Code",
    file: "rivine_code.md",
    group: "Rivine Engines",
    dir: ENGINES_DIR,
    blurb: "Plans, delegates, validates, and previews software in a governed sandbox.",
  },
  {
    slug: "rivine-cicero",
    title: "Rivine Cicero",
    file: "rivine_cicero.md",
    group: "Rivine Engines",
    dir: ENGINES_DIR,
    blurb: "Legal-domain engine with conditional delegation and honest gap escalation.",
  },
  {
    slug: "rivine-creative",
    title: "Rivine Creative",
    file: "rivine_creative.md",
    group: "Rivine Engines",
    dir: ENGINES_DIR,
    blurb: "Image, video, and supporting media, reviewed on visual quality.",
  },
  {
    slug: "artificial-experience",
    title: "Artificial Experience",
    file: "Artificial Experience.md",
    group: "Rivine Platform",
    dir: ENGINES_DIR,
    blurb: "Workspace memory of facts, outcomes, and reusable work so engines reuse what already succeeded.",
  },
  {
    slug: "context-extender",
    title: "Context Extender",
    file: "Context_Extender.md",
    group: "Rivine Platform",
    dir: ENGINES_DIR,
    blurb: "Retrieval under a cap so engines operate over large corpora without sending millions of tokens per call.",
  },
  {
    slug: "rivine-code-cli",
    title: "Rivine Code CLI",
    file: "rivine-code_cli.md",
    group: "Rivine Platform",
    dir: ENGINES_DIR,
    blurb: "Rivine Code in your terminal: local files, streaming commands, and permission modes.",
  },
];

export function getAseliusDoc(slug: string): AseliusDoc | undefined {
  return ASELIUS_DOCS.find((doc) => doc.slug === slug);
}

/** Bucket docs under their group heading while preserving array order. */
export function groupAseliusDocs(
  docs: AseliusDoc[] = ASELIUS_DOCS,
): { group: string; items: AseliusDoc[] }[] {
  const order: string[] = [];
  const buckets = new Map<string, AseliusDoc[]>();
  for (const doc of docs) {
    const group = doc.group ?? "Documentation";
    if (!buckets.has(group)) {
      buckets.set(group, []);
      order.push(group);
    }
    buckets.get(group)!.push(doc);
  }
  return order.map((group) => ({ group, items: buckets.get(group)! }));
}

/** Server-only: reads the raw markdown at build time. */
export function readAseliusDoc(doc: AseliusDoc): string {
  const full = path.join(process.cwd(), doc.dir ?? DEFAULT_DIR, doc.file);
  return fs.readFileSync(full, "utf8");
}
