import fs from "fs";
import path from "path";

export type AseliusDoc = {
  slug: string;
  title: string;
  /** File name inside `dir`. Required unless `externalHref` is set. */
  file?: string;
  blurb: string;
  /** Sidebar group heading. Defaults to "Documentation". */
  group?: string;
  /** Source folder relative to repo root. Defaults to the platform docs folder. */
  dir?: string;
  /**
   * When set, the sidebar and docs index link here instead of an internal
   * `/aselius-platform/docs/{slug}` page. Used for Rivine Browse → paper site.
   */
  externalHref?: string;
};

const DEFAULT_DIR = "Aselius Platform Documentations";
const ENGINES_DIR = "Beunec Docs/rivine agentic engines";

const BROWSE_PAPER = "https://browse.aselius.beunec.com/paper";

/** Sidebar order = array order. Add a line here to publish another .md. */
export const ASELIUS_DOCS: AseliusDoc[] = [
  {
    slug: "workspace",
    title: "Workspace",
    file: "aselius-workspace.md",
    group: "Platform",
    blurb: "The agentic task environment: Taskspace, engines, previews, and governance.",
  },
  {
    slug: "automations",
    title: "Automation",
    file: "Automations.md",
    group: "Platform",
    blurb: "Scheduled Rivine engine runs that continue whether or not your computer is on.",
  },
  {
    slug: "observability",
    title: "Observability",
    file: "Observability.md",
    group: "Platform",
    blurb: "Tokens, cost, latency, and Artificial Experience activity for your own turns.",
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
    slug: "aselius-mcp",
    title: "Aselius MCP",
    file: "aselius-mcp.md",
    group: "Platform",
    blurb: "Use Aselius from any AI app: connect Claude, Cursor, ChatGPT or any MCP client to https://workspace.beunec.com/mcp.",
  },
  {
    slug: "messaging-channels",
    title: "Messaging Channels",
    file: "messaging-channels.md",
    group: "Platform",
    blurb: "Start and follow a Rivine engine task from Telegram, Discord or WhatsApp.",
  },
  {
    slug: "preview-app",
    title: "Aselius Preview App",
    file: "preview-app.md",
    group: "Platform",
    blurb: "preview.aselius.beunec.com: a deliverable rendered exactly as generated, with access codes, theme and language.",
  },
  {
    slug: "comparison",
    title: "How Aselius Compares",
    file: "aselius-competitors.md",
    group: "Platform",
    blurb: "Why Aselius is agentic infrastructure software, not another Claude Cowork, ChatGPT Work or Kimi Work.",
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
    blurb: "Seven media agents: generate and surgically edit images and video, record speech, compose music.",
  },
  {
    slug: "rivine-confluence",
    title: "Rivine Confluence",
    file: "rivine_confluence.md",
    group: "Rivine Engines",
    dir: ENGINES_DIR,
    blurb: "Country forecasting and scenarios: models choose evidence; code computes the numbers.",
  },
  {
    slug: "rivine-assist",
    title: "Rivine Assist",
    file: "rivine_assist.md",
    group: "Rivine Engines",
    dir: ENGINES_DIR,
    blurb: "Surgical follow-up edits on a document already open in Preview, without a full engine turn.",
  },
  {
    slug: "rivine-browse",
    title: "Rivine Browse",
    group: "Rivine Engines",
    blurb: "Browser agent in your real tabs and sessions. Opens the Browse product paper.",
    externalHref: BROWSE_PAPER,
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
  {
    slug: "selius",
    title: "Selius",
    file: "Selius.md",
    group: "Rivine Platform",
    blurb: "Speech-to-speech voice for Aselius and Rivine Browse, with the ivory-and-jade dragon.",
  },
];

export function getAseliusDoc(slug: string): AseliusDoc | undefined {
  return ASELIUS_DOCS.find((doc) => doc.slug === slug);
}

/** Docs that have an on-site markdown page (excludes external-only entries). */
export function getInternalAseliusDocs(docs: AseliusDoc[] = ASELIUS_DOCS): AseliusDoc[] {
  return docs.filter((doc) => !doc.externalHref);
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
  if (!doc.file) {
    throw new Error(`Aselius doc "${doc.slug}" has no markdown file (external-only).`);
  }
  const full = path.join(process.cwd(), doc.dir ?? DEFAULT_DIR, doc.file);
  return fs.readFileSync(full, "utf8");
}
