"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Calendar,
  Code2,
  Compass,
  Eye,
  FileDown,
  FileText,
  Globe2,
  Layers,
  LayoutGrid,
  Lock,
  MessageSquare,
  Mic,
  Microscope,
  Palette,
  PenLine,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";
import { PlatformTour } from "@/sections/aselius/PlatformTour";

const ASELIUS_APP = "https://aselius.beunec.com";
const DOCS = "/aselius-platform/docs";
const BROWSE_URL = "https://browse.aselius.beunec.com";

const AUDIENCE = [
  "Software engineering teams",
  "Research organizations",
  "Consulting firms",
  "Startup teams",
  "University post-graduates",
];

const DIFFERENTIATORS = [
  {
    icon: Eye,
    title: "Observability you can audit",
    body: "Tokens, cost, latency, retries, and Artificial Experience events for your own turns — without storing conversation content.",
  },
  {
    icon: Sparkles,
    title: "Artificial Experience",
    body: "Workspace memory of facts, outcomes, and reusable work so engines reuse what already succeeded instead of re-deriving it every turn.",
  },
  {
    icon: Compass,
    title: "Context Extender",
    body: "Retrieval under a cap so long corpora stay usable without flooding every model call with millions of tokens.",
  },
  {
    icon: Brain,
    title: "RE-AI reasoning framework",
    body: "Reverse-engineering of implementation: gather context, change, verify with evidence, and continue across durable time slices — not a one-shot chat reply.",
  },
  {
    icon: FileDown,
    title: "Deliverables, not chat paste",
    body: "Documents, code previews, research reports, and dashboards land in Assets. Edit in Preview and export Markdown, PDF, DOCX, or HTML when available.",
  },
  {
    icon: Mic,
    title: "Selius",
    body: "Speech-to-speech across Aselius and Rivine Browse. It asks before it acts, never approves payments or sends on its own, and shows what Rivine is doing.",
  },
];

type EngineCard = {
  icon: typeof MessageSquare;
  name: string;
  tagline: string;
  href: string;
  external?: boolean;
  soon?: boolean;
  also?: { label: string; href: string };
};

const ENGINES: EngineCard[] = [
  { icon: MessageSquare, name: "Rivine TaskForce", tagline: "Action-oriented professional work with connected apps and specialties", href: `${DOCS}/rivine-taskforce` },
  { icon: Microscope, name: "Rivine Research", tagline: "Source-grounded research → Markdown, PDF, or spreadsheet", href: `${DOCS}/rivine-research` },
  {
    icon: Code2,
    name: "Rivine Code",
    tagline: "Build, verify, and deliver working projects — web sandbox or terminal CLI",
    href: `${DOCS}/rivine-code`,
    also: { label: "Also available as a terminal client", href: `${DOCS}/rivine-code-cli` },
  },
  { icon: Scale, name: "Rivine Cicero", tagline: "Legal drafting and review under guardrails; assistive, not legal advice", href: `${DOCS}/rivine-cicero` },
  { icon: Palette, name: "Rivine Creative", tagline: "Image, video, and audio creation and editing", href: `${DOCS}/rivine-creative` },
  { icon: Globe2, name: "Rivine Confluence", tagline: "Country forecasts and scenarios: evidence from models, numbers from code", href: `${DOCS}/rivine-confluence` },
  { icon: PenLine, name: "Rivine Assist", tagline: "Surgical follow-up edits on a document already open in Preview", href: `${DOCS}/rivine-assist` },
  { icon: Compass, name: "Rivine Browse", tagline: "Tasks in your real browser tabs and signed-in sessions", href: BROWSE_URL, external: true },
  { icon: Mic, name: "Selius", tagline: "Voice companion for Aselius and Browse — asks before it acts", href: `${DOCS}/selius` },
];

const RIVINE_PLATFORM = [
  { name: "Artificial Experience", blurb: "Reuse what already worked in your workspace", href: `${DOCS}/artificial-experience` },
  { name: "Context Extender", blurb: "Operate over large corpora without flooding the model", href: `${DOCS}/context-extender` },
  { name: "Rivine Code CLI", blurb: "Same Code engine, on the files already on your disk", href: `${DOCS}/rivine-code-cli` },
  { name: "Selius", blurb: "Speech-to-speech voice and the ivory-and-jade dragon", href: `${DOCS}/selius` },
];

const FLOW = [
  { icon: MessageSquare, label: "Your intent" },
  { icon: Layers, label: "Rivine engine" },
  { icon: Lock, label: "Isolated execution" },
  { icon: FileText, label: "Deliverable + snapshot" },
  { icon: Eye, label: "Preview & export" },
];

const APPS = [
  {
    icon: LayoutGrid,
    title: "Workspace",
    body: "The agentic task environment: Taskspace, Rivine engines, Preview Panel, governance, and connectors in one surface.",
    href: `${DOCS}/workspace`,
  },
  {
    icon: Workflow,
    title: "Automation",
    body: "Scheduled engine runs that continue whether or not your computer is on — with test runs, review gates, and ledgers.",
    href: `${DOCS}/automations`,
  },
  {
    icon: Eye,
    title: "Observability",
    body: "Cost, latency, retries, and Artificial Experience activity for your turns — without storing chat content.",
    href: `${DOCS}/observability`,
  },
  {
    icon: Users,
    title: "Manage Teams",
    body: "Organizations, roles, and personal connections so people and workspaces live under one account model.",
    href: `${DOCS}/manage-teams`,
  },
];

const SURFACES = [
  {
    icon: Workflow,
    title: "Aselius MCP",
    body: "Connect Claude, Cursor, ChatGPT or any MCP client at workspace.beunec.com/mcp and run a Rivine engine task without leaving it.",
    href: `${DOCS}/aselius-mcp`,
  },
  {
    icon: MessageSquare,
    title: "Messaging Channels",
    body: "Telegram, Discord and WhatsApp start and follow a real engine task — pick the engine and specialty right in the chat.",
    href: `${DOCS}/messaging-channels`,
  },
  {
    icon: Globe2,
    title: "Aselius Preview App",
    body: "preview.aselius.beunec.com renders a published deliverable exactly as generated, with access codes, theme and language.",
    href: `${DOCS}/preview-app`,
  },
];

const COMPARISON = [
  {
    dim: "Product shape",
    them: "Claude Cowork / Code + ChatGPT Work (and Codex): agentic chat, desktop/local files, browser actions, projects, scheduled tasks",
    us: "Full Aselius Platform: Workspace, Automation, Observability, Manage Teams, credits, connectors, Selius, plus Rivine Browse",
  },
  {
    dim: "Specialization",
    them: "One general agent (plus a Code / Codex lane) that decides tools inside a shared conversation",
    us: "Specialized Rivine engines (TaskForce, Research, Code, Cicero, Confluence, Assist, Creative, Browse) with Mode-level routing — not one model in a costume",
  },
  {
    dim: "Verification",
    them: "Model-led checks, user review of files, approval prompts for risky actions",
    us: "Runtime verification floor + independent critic on Code; Confluence numbers from code ledgers; HITL on low-confidence steps",
  },
  {
    dim: "Long-horizon work",
    them: "Local/desktop process or cloud session that keeps working while you step away",
    us: "Browse-durable Lambda slices + continuation for Workspace engines; Browse steps that never hold a 15-minute server call",
  },
  {
    dim: "Browser automation",
    them: "Built-in Cowork / ChatGPT browser or Chrome side panel inside their product",
    us: "Rivine Browse in your real tabs and signed-in sessions (extension + desktop), with server-side safety gates",
  },
  {
    dim: "Outputs",
    them: "Finished docs, sheets, decks, Sites / artifacts beside chat",
    us: "Assets + Preview Panel + export; Live Preview for Code; Assist for surgical follow-ups on the open deliverable",
  },
  {
    dim: "Memory & context",
    them: "Projects, memory, connectors / plugins, skills",
    us: "Artificial Experience + Context Extender under every engine, scoped to the workspace",
  },
  {
    dim: "Ops & teams",
    them: "Org admin, usage monitoring, permission policies inside Claude / ChatGPT accounts",
    us: "Observability app, credit gateway per engine, Automation ledger, Manage Teams with CloudHandle",
  },
  {
    dim: "Voice",
    them: "Voice modes in the vendor app (product-specific)",
    us: "Selius across Aselius web and Rivine Browse — asks before acting; never self-approves risk",
  },
];

function SkeletonBar({ w }: { w: string }) {
  return <div className="h-2 rounded" style={{ width: w, background: "var(--accent-slate)", opacity: 0.22 }} />;
}

/** Subtle motion mock of Aselius Workspace — theme-aware, no raster image. */
function WorkspaceArtifact() {
  const reduceMotion = useReducedMotion();
  const rail = [
    { Icon: LayoutGrid, active: true },
    { Icon: Workflow, active: false },
    { Icon: Eye, active: false },
    { Icon: Users, active: false },
  ];

  return (
    <div className="rounded-2xl border border-border bg-container shadow-2xl overflow-hidden select-none">
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-border"
        style={{ background: "var(--bg-global)" }}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent-sage)" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent-slate)" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(138,122,98,0.7)" }} />
        <span className="ml-2 text-[11px] font-medium text-muted-foreground">Aselius · Workspace · Taskspace</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
          <Eye className="w-3 h-3" /> Preview
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_1fr]">
        <div
          className="flex flex-col items-center gap-2.5 py-4 px-2.5 border-r border-border"
          style={{ background: "var(--bg-global)" }}
        >
          {rail.map((a, i) => (
            <motion.span
              key={i}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border"
              style={
                a.active
                  ? { background: "rgba(107,122,110,0.18)", borderColor: "var(--accent-sage)" }
                  : { borderColor: "transparent" }
              }
              animate={
                reduceMotion || !a.active
                  ? undefined
                  : { boxShadow: ["0 0 0 0 rgba(107,122,110,0)", "0 0 0 4px rgba(107,122,110,0.18)", "0 0 0 0 rgba(107,122,110,0)"] }
              }
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              <a.Icon className="w-4 h-4" style={{ color: a.active ? "var(--accent-sage)" : "var(--accent-slate)" }} />
            </motion.span>
          ))}
        </div>

        <div className="min-w-0 p-4 space-y-3 border-r border-border">
          <motion.div
            className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] leading-snug text-foreground"
            style={{ background: "rgba(122,139,153,0.16)" }}
            initial={false}
            animate={reduceMotion ? undefined : { opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          >
            Draft a market analysis from these 3 PDFs
          </motion.div>
          <motion.div
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] font-medium text-foreground"
            style={{ background: "rgba(107,122,110,0.14)" }}
            animate={reduceMotion ? undefined : { y: [0, -1, 0] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          >
            <Microscope className="w-3 h-3 text-accent-sage" /> Rivine Research · PDF
          </motion.div>
          <div className="space-y-1.5 pt-0.5">
            <SkeletonBar w="92%" />
            <SkeletonBar w="98%" />
            <SkeletonBar w="73%" />
          </div>
          <motion.div
            className="rounded-xl border border-border p-3 flex items-center gap-3"
            style={{ background: "var(--bg-global)" }}
            animate={reduceMotion ? undefined : { borderColor: ["var(--border)", "rgba(107,122,110,0.45)", "var(--border)"] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(107,122,110,0.16)" }}
            >
              <FileText className="w-4 h-4 text-accent-sage" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-foreground truncate">market-analysis.pdf</div>
              <div className="text-[10px] text-muted-foreground">Snapshot · open in Preview</div>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />
          </motion.div>
          <div className="flex items-center gap-1 pt-0.5">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-sage)" }} />
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-sage)", animationDelay: "0.2s" }} />
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-sage)", animationDelay: "0.4s" }} />
          </div>
        </div>

        <div className="hidden md:block p-4" style={{ background: "var(--bg-global)" }}>
          <div className="flex items-center gap-3 text-[10px] font-medium mb-3">
            <span className="text-muted-foreground">Assets</span>
            <span className="text-foreground border-b-2 pb-0.5" style={{ borderColor: "var(--accent-sage)" }}>
              Preview
            </span>
            <span className="text-muted-foreground">HTML</span>
          </div>
          <motion.div
            className="rounded-lg border border-border bg-container p-3 space-y-2"
            animate={reduceMotion ? undefined : { opacity: [0.92, 1, 0.92] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="h-3 w-2/3 rounded" style={{ background: "var(--accent-slate)", opacity: 0.32 }} />
            <div className="space-y-1.5 pt-1">
              <SkeletonBar w="100%" />
              <SkeletonBar w="95%" />
              <SkeletonBar w="88%" />
              <SkeletonBar w="93%" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-3 rounded"
                  style={{ background: "var(--accent-slate)", opacity: i < 3 ? 0.3 : 0.16 }}
                  animate={
                    reduceMotion
                      ? undefined
                      : { opacity: i < 3 ? [0.22, 0.38, 0.22] : [0.12, 0.2, 0.12] }
                  }
                  transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </div>
          </motion.div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <FileDown className="w-3 h-3 text-accent-sage" /> Export · PDF · DOCX · Markdown
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AseliusPlatformPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="baap-page min-h-screen">
      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className="relative py-16 md:py-20 overflow-hidden">
          <ParticleBackground />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-global/80 backdrop-blur-sm px-4 py-1.5 mb-6"
                >
                  <Calendar className="w-3.5 h-3.5 text-accent-sage" />
                  <span className="text-xs font-medium text-foreground">Now live · aselius.beunec.com</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.04] tracking-tight text-foreground font-extrabold"
                >
                  Where AI engines do real work, and you keep the{" "}
                  <span className="underline underline-offset-[0.12em] decoration-2 decoration-[color:var(--accent-sage)]">
                    deliverables
                  </span>
                  .
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-6 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Aselius runs research, code, legal drafting, and professional work through specialized
                  Rivine engines. Every result is previewable, editable, and yours to export: governed,
                  and never just a chat reply.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <a
                    href={ASELIUS_APP}
                    className="inline-flex items-center gap-2 rounded-full bg-[#141512] dark:bg-[#e6e2d8] text-[#e6e2d8] dark:text-[#141512] text-sm font-medium px-5 py-2.5 hover:opacity-90 transition-opacity"
                  >
                    Open Aselius
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    href={DOCS}
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent-sage hover:text-foreground transition-colors"
                  >
                    Read the documentation
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.6 }}
              >
                <WorkspaceArtifact />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-16 border-t border-border pt-8"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-4">
                Built for people who ship
              </p>
              <div className="flex flex-wrap gap-2.5">
                {AUDIENCE.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-border bg-container px-3.5 py-1.5 text-sm text-muted-foreground"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* New §2: platform motion tour */}
        <PlatformTour />

        {/* Differentiators */}
        <section className="py-20 md:py-24 bg-container">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mb-14"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
                Why it is different
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1]">
                Not another Claude Work
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {DIFFERENTIATORS.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 3) * 0.06 }}
                  className="rounded-2xl border border-border bg-global p-6"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-container mb-4">
                    <item.icon className="w-5 h-5 text-accent-sage" />
                  </span>
                  <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Engines */}
        <section className="py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
            >
              <div className="max-w-2xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
                  Rivine agentic engines
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
                  Pick the right specialist for the job
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Each engine is a governed runtime with its own specialties, tools, and verification —
                  or pin an engine, or let Auto / the Mediator route for you.
                </p>
              </div>
              <Link
                href={`${DOCS}/workspace`}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent-sage hover:text-foreground transition-colors shrink-0"
              >
                Engine documentation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ENGINES.map((engine, i) => {
                const inner = (
                  <>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-global">
                      <engine.icon className="w-5 h-5 text-accent-sage" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-semibold text-foreground">{engine.name}</h3>
                        {engine.soon && (
                          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            Coming soon
                          </span>
                        )}
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-sage" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">{engine.tagline}</p>
                    </div>
                  </>
                );

                return (
                  <motion.div
                    key={engine.name}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 3) * 0.06 }}
                  >
                    <div className="group flex h-full flex-col rounded-2xl border border-border bg-container p-5 transition-colors hover:border-accent-sage/60">
                      {engine.external ? (
                        <a
                          href={engine.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-4 min-w-0"
                        >
                          {inner}
                        </a>
                      ) : (
                        <Link href={engine.href} className="flex items-start gap-4 min-w-0">
                          {inner}
                        </Link>
                      )}
                      {engine.also && (
                        <Link
                          href={engine.also.href}
                          className="mt-3 ml-14 text-xs text-accent-sage hover:underline underline-offset-2"
                        >
                          {engine.also.label}
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-border bg-container/60 p-6 md:p-7">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-2">
                    Rivine Platform
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    Memory, context, the terminal client, and voice that sit under the engines.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {RIVINE_PLATFORM.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group rounded-xl border border-border bg-global px-4 py-3 transition-colors hover:border-accent-sage/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{item.name}</h3>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-sage" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{item.blurb}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Task flow — unchanged intent */}
        <section className="py-20 md:py-24 bg-container">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mb-12"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
                How one task runs
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
                Say what you need. Review what you get.
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                You describe the outcome. Work runs in an isolated environment, and a deliverable
                lands as a snapshot you can preview and export; you stay in control the whole way.
              </p>
            </motion.div>

            <div className="flex flex-wrap items-stretch gap-3">
              {FLOW.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-global px-4 py-3"
                  >
                    <step.icon className="w-4 h-4 text-accent-sage" />
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">{step.label}</span>
                  </motion.div>
                  {i < FLOW.length - 1 && (
                    <ArrowRight className="hidden sm:block w-4 h-4 text-accent-slate/60 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Apps */}
        <section className="py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mb-12"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
                One platform, four apps
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1]">
                Everything in one place, not five tabs
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-5">
              {APPS.map((app, i) => (
                <motion.div
                  key={app.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 2) * 0.06 }}
                >
                  <Link
                    href={app.href}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-container p-6 transition-colors hover:border-accent-sage/60"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-global">
                        <app.icon className="w-5 h-5 text-accent-sage" />
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-sage" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{app.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{app.body}</p>
                    <span className="mt-4 text-xs font-medium text-accent-sage">Read the guide →</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Surfaces — where else the engines reach */}
        <section className="py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mb-12"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
                Not just the browser tab
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1]">
                Reach the same engines from where you already work
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-5">
              {SURFACES.map((surface, i) => (
                <motion.div
                  key={surface.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={surface.href}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-container p-6 transition-colors hover:border-accent-sage/60"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-global">
                        <surface.icon className="w-5 h-5 text-accent-sage" />
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-sage" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{surface.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{surface.body}</p>
                    <span className="mt-4 text-xs font-medium text-accent-sage">Read the guide →</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Real screenshots + a short motion reel, not mockups */}
        <section className="py-20 md:py-24 bg-container">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mb-10"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
                Not a rendering
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
                What the platform actually shows you
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Every frame below is a real screenshot of a live Aselius session — an Excel workbook
                rendered exactly as generated, a protected preview link, a published Rivine Code
                project, and the full step trail an engine took.
              </p>
            </motion.div>

            <motion.video
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full rounded-2xl border border-border mb-8"
              src="/showcase/aselius-motion.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="A short, silent tour of the Aselius Workspace, Preview app and Rivine Code publishing, built from real screenshots"
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { src: "/showcase/workspace-docx-exact.png", caption: "Workspace: Word rendered exactly as generated" },
                { src: "/showcase/preview-xlsx-desktop.png", caption: "preview.aselius.beunec.com: the same Excel grid, public" },
                { src: "/showcase/preview-protected-locked.png", caption: "Protected links: members-only, from outside Aselius" },
                { src: "/showcase/code-project-viewer-dark.png", caption: "Code projects: a saved Rivine Code build, read-only" },
                { src: "/showcase/engine-steps-live.png", caption: "Engine steps: a running turn, followed from a fresh tab" },
                { src: "/showcase/preview-protected-code-entry.png", caption: "A plain link asks for the access code, on a phone" },
              ].map((item) => (
                <motion.figure
                  key={item.src}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group overflow-hidden rounded-xl border border-border bg-global"
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    className="w-full h-40 object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                  <figcaption className="px-3 py-2 text-xs text-muted-foreground leading-snug">
                    {item.caption}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </div>
        </section>

        {/* Positioning */}
        <section className="py-20 md:py-24 bg-container">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mb-10"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
                An honest lens
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
                Already using Claude Work / Code or ChatGPT Work?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Fair comparison is Aselius Platform against those agentic workplace products — not a
                generic autocomplete. We will not claim features we have not shipped.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl border border-border bg-global"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[0.85fr_1.15fr_1.15fr] gap-px bg-border">
                <div className="hidden sm:block bg-global px-5 py-3 text-[11px] font-mono uppercase tracking-wider text-accent-slate" />
                <div className="hidden sm:block bg-global px-5 py-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Claude Work/Code &amp; ChatGPT Work
                </div>
                <div className="hidden sm:block bg-global px-5 py-3 text-[11px] font-mono uppercase tracking-wider text-accent-sage">
                  Aselius Platform
                </div>

                {COMPARISON.map((row) => (
                  <div key={row.dim} className="contents">
                    <div className="bg-global px-5 py-4 text-sm font-semibold text-foreground">{row.dim}</div>
                    <div className="bg-global px-5 py-4 text-sm text-muted-foreground">
                      <span className="sm:hidden text-[10px] font-mono uppercase tracking-wider text-accent-slate block mb-1">
                        Claude Work/Code &amp; ChatGPT Work
                      </span>
                      {row.them}
                    </div>
                    <div className="bg-global px-5 py-4 text-sm text-foreground">
                      <span className="sm:hidden text-[10px] font-mono uppercase tracking-wider text-accent-sage block mb-1">
                        Aselius Platform
                      </span>
                      {row.us}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Not here to replace your IDE, legal counsel, or brokerage stack; here to run governed
                AI-engine work and leave with deliverables.
              </p>
              <Link
                href={`${DOCS}/comparison`}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent-sage hover:text-foreground transition-colors shrink-0"
              >
                Full comparison
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border overflow-hidden relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(107,122,110,0.14), rgba(122,139,153,0.08))",
                }}
              />
              <div className="relative px-6 py-16 md:px-16 md:py-20 text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-global/80 backdrop-blur-sm px-4 py-1.5 mb-6">
                  <Calendar className="w-3.5 h-3.5 text-accent-sage" />
                  <span className="text-xs font-medium text-foreground">Live at aselius.beunec.com</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-5">
                  Open Aselius
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
                  Base (free), Pro ($20/mo), and Essential ($40/mo) include Workspace, Automation,
                  Observability, and teams. Base has limited Rivine access; Pro and Essential unlock
                  full engines.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
                  {["Base · Free", "Pro · $20/mo", "Essential · $40/mo"].map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-border bg-global px-3.5 py-1.5 text-sm text-muted-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={ASELIUS_APP}
                    className="inline-flex items-center gap-2 rounded-full bg-[#141512] dark:bg-[#e6e2d8] text-[#e6e2d8] dark:text-[#141512] text-sm font-medium px-5 py-2.5 hover:opacity-90 transition-opacity"
                  >
                    Try Aselius
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    href={`${DOCS}/plans-pricing`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent-sage hover:text-foreground transition-colors"
                  >
                    Plans &amp; pricing
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
