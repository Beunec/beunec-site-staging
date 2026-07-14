"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Code2,
  Eye,
  FileDown,
  FileText,
  FolderOpen,
  GitBranch,
  Layers,
  LayoutGrid,
  Lock,
  MessageSquare,
  Microscope,
  Palette,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
  Wand2,
} from "lucide-react";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";

const LAUNCH_DATE = "July 18, 2026";
const DOCS = "/aselius-platform/docs";

const AUDIENCE = [
  "Software engineering teams",
  "Research organizations",
  "Consulting firms",
  "Startup teams",
  "University post-graduates",
];

const DIFFERENTIATORS = [
  {
    icon: Layers,
    title: "Specialized engines, not one model",
    body: "Chat, Research, Code, Cicero, and Creative are each a governed runtime with their own tools, verification, and sandbox, not one chat model wearing hats.",
  },
  {
    icon: FileDown,
    title: "You leave with deliverables",
    body: "Documents, code previews, research reports, and media land in Assets. Edit in the Preview Panel and export to Markdown, PDF, DOCX, or HTML.",
  },
  {
    icon: ShieldCheck,
    title: "It asks before high-risk actions",
    body: "Human-in-the-Loop pauses on low-confidence or sensitive steps and shows an approval request. You approve or reject before execution continues.",
  },
  {
    icon: Eye,
    title: "Routing you can see",
    body: "Every turn shows which engine and specialty handled it, with agent notes and citations, transparent by default, not an opaque black box.",
  },
  {
    icon: Lock,
    title: "Governed and scoped",
    body: "Per-workspace governance rules shape behavior, and connectors expose only the access you authorize, credentials are never globally handed to agents.",
  },
  {
    icon: GitBranch,
    title: "Tasks that persist",
    body: "Taskspaces keep the conversation, assets, and configuration over time. Continue a task next week, not a throwaway chat session.",
  },
];

const ENGINES = [
  { icon: MessageSquare, name: "Rivine Chat", tagline: "Action-oriented professional dialogue", href: `${DOCS}/rivine-chat` },
  { icon: Microscope, name: "Rivine Research", tagline: "Source-grounded research → PDF or spreadsheet", href: `${DOCS}/rivine-research` },
  { icon: Code2, name: "Rivine Code", tagline: "Build, debug, and preview software in a sandbox", href: `${DOCS}/rivine-code` },
  { icon: Scale, name: "Rivine Cicero", tagline: "Legal drafting, review, and policy work", href: `${DOCS}/rivine-cicero` },
  { icon: Palette, name: "Rivine Creative", tagline: "Image, video, and audio creation and editing", href: `${DOCS}/rivine-creative` },
];

const FLOW = [
  { icon: MessageSquare, label: "Your intent" },
  { icon: Wand2, label: "Mediator routes" },
  { icon: Layers, label: "Rivine engine" },
  { icon: Lock, label: "Secure sandbox" },
  { icon: FileText, label: "Deliverable + snapshot" },
  { icon: Eye, label: "Preview & export" },
];

const APPS = [
  {
    icon: LayoutGrid,
    title: "Aselius Workspace",
    body: "The agentic task environment: Taskspace conversation, engines, previews, and governance in one surface.",
    href: `${DOCS}/workspace`,
  },
  {
    icon: FolderOpen,
    title: "Manage Files",
    body: "Markdown-first storage that converts uploads into readable, AI-ready knowledge you can organize and query.",
    href: `${DOCS}/manage-files`,
  },
  {
    icon: MessageSquare,
    title: "Messages",
    body: "Secure direct and group messaging with channels, attachments, and real-time delivery for your team.",
    href: `${DOCS}/messages`,
  },
  {
    icon: Users,
    title: "Manage Teams",
    body: "Organizations, roles, and personal connections so people and AI-assisted workspaces live in one platform.",
    href: `${DOCS}/manage-teams`,
  },
];

const COMPARISON = [
  { dim: "Architecture", them: "A chat layer over one model", us: "Specialized Rivine engines with verification + HITL" },
  { dim: "Outputs", them: "Copy-paste out of the chat", us: "Assets + Preview Panel: edit, export, reopen" },
  { dim: "Continuity", them: "Session-based chat", us: "Persistent Taskspaces with assets + config" },
  { dim: "Coding", them: "IDE autocomplete", us: "Rivine Code sandbox with in-browser preview" },
  { dim: "Transparency", them: "Opaque routing", us: "Visible engine, agent notes, HITL checkpoints" },
];

function SkeletonBar({ w }: { w: string }) {
  return <div className="h-2 rounded" style={{ width: w, background: "var(--accent-slate)", opacity: 0.22 }} />;
}

/** Live vector mock of Aselius Workspace — theme-aware, no raster image. */
function WorkspaceArtifact() {
  const rail = [
    { Icon: LayoutGrid, active: true },
    { Icon: FolderOpen, active: false },
    { Icon: MessageSquare, active: false },
    { Icon: Users, active: false },
  ];
  return (
    <div className="rounded-2xl border border-border bg-container shadow-2xl overflow-hidden select-none">
      {/* title bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-border"
        style={{ background: "var(--bg-global)" }}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent-sage)" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent-slate)" }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(138,122,98,0.7)" }} />
        <span className="ml-2 text-[11px] font-medium text-muted-foreground">Aselius Workspace · Taskspace</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
          <Eye className="w-3 h-3" /> Preview
        </span>
      </div>

      <div className="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_1fr]">
        {/* sidebar rail */}
        <div
          className="flex flex-col items-center gap-2.5 py-4 px-2.5 border-r border-border"
          style={{ background: "var(--bg-global)" }}
        >
          {rail.map((a, i) => (
            <span
              key={i}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border"
              style={
                a.active
                  ? { background: "rgba(107,122,110,0.18)", borderColor: "var(--accent-sage)" }
                  : { borderColor: "transparent" }
              }
            >
              <a.Icon className="w-4 h-4" style={{ color: a.active ? "var(--accent-sage)" : "var(--accent-slate)" }} />
            </span>
          ))}
        </div>

        {/* conversation */}
        <div className="min-w-0 p-4 space-y-3 border-r border-border">
          <div
            className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-tr-sm px-3 py-2 text-[11px] leading-snug text-foreground"
            style={{ background: "rgba(122,139,153,0.16)" }}
          >
            Draft a market analysis from these 3 PDFs
          </div>
          <div
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[10px] font-medium text-foreground"
            style={{ background: "rgba(107,122,110,0.14)" }}
          >
            <Microscope className="w-3 h-3 text-accent-sage" /> Rivine Research · PDF
          </div>
          <div className="space-y-1.5 pt-0.5">
            <SkeletonBar w="92%" />
            <SkeletonBar w="98%" />
            <SkeletonBar w="73%" />
          </div>
          <div
            className="rounded-xl border border-border p-3 flex items-center gap-3"
            style={{ background: "var(--bg-global)" }}
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
          </div>
          <div className="flex items-center gap-1 pt-0.5">
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-sage)" }} />
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-sage)", animationDelay: "0.2s" }} />
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-sage)", animationDelay: "0.4s" }} />
          </div>
        </div>

        {/* preview panel */}
        <div className="hidden md:block p-4" style={{ background: "var(--bg-global)" }}>
          <div className="flex items-center gap-3 text-[10px] font-medium mb-3">
            <span className="text-muted-foreground">Assets</span>
            <span className="text-foreground border-b-2 pb-0.5" style={{ borderColor: "var(--accent-sage)" }}>
              Preview
            </span>
            <span className="text-muted-foreground">HTML</span>
          </div>
          <div className="rounded-lg border border-border bg-container p-3 space-y-2">
            <div className="h-3 w-2/3 rounded" style={{ background: "var(--accent-slate)", opacity: 0.32 }} />
            <div className="space-y-1.5 pt-1">
              <SkeletonBar w="100%" />
              <SkeletonBar w="95%" />
              <SkeletonBar w="88%" />
              <SkeletonBar w="93%" />
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-3 rounded" style={{ background: "var(--accent-slate)", opacity: i < 3 ? 0.3 : 0.16 }} />
              ))}
            </div>
          </div>
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
                  <span className="text-xs font-medium text-foreground">Coming soon · {LAUNCH_DATE}</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.04] tracking-tight text-foreground font-extrabold"
                >
                  Where agents do real work, and you keep the{" "}
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
                  Aselius runs research, code, documents, and creative through specialized Rivine
                  engines. Every result is previewable, editable, and yours to export, governed, and
                  never just a chat reply.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <Link
                    href={DOCS}
                    className="inline-flex items-center gap-2 rounded-full bg-[#141512] dark:bg-[#e6e2d8] text-[#e6e2d8] dark:text-[#141512] text-sm font-medium px-5 py-2.5 hover:opacity-90 transition-opacity"
                  >
                    Read the documentation
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`${DOCS}/workspace`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent-sage hover:text-foreground transition-colors"
                  >
                    See how Workspace works
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

            {/* Audience band */}
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
                Not another chat box
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
                  Each engine is a governed runtime with its own specialties, tools, and verification,
                  or let the Mediator route for you.
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
              {ENGINES.map((engine, i) => (
                <motion.div key={engine.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.06 }}>
                  <Link
                    href={engine.href}
                    className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-container p-5 transition-colors hover:border-accent-sage/60"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-global">
                      <engine.icon className="w-5 h-5 text-accent-sage" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-semibold text-foreground">{engine.name}</h3>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-sage" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">{engine.tagline}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}

              <div className="flex h-full items-start gap-4 rounded-2xl border border-dashed border-border bg-container/50 p-5">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-global">
                  <TrendingUp className="w-5 h-5 text-accent-slate" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">Rivine FIDA</h3>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Coming soon
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    Financial research and quantitative analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Task flow */}
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
                You describe the outcome. Aselius routes, executes in an isolated environment, and
                returns an inspectable deliverable, you stay in control the whole way.
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
                    <span className="font-mono text-[10px] text-accent-slate">{`0${i + 1}`}</span>
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
                <motion.div key={app.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 2) * 0.06 }}>
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

        {/* Positioning */}
        <section className="py-20 md:py-24 bg-container">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mb-10"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
                An honest lens
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
                Already using Claude, Copilot, or Gemini?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                We will not claim features we have not shipped. Here is how Aselius is built
                differently for teams that need production-grade output.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-2xl border border-border bg-global"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.2fr] gap-px bg-border">
                <div className="hidden sm:block bg-global px-5 py-3 text-[11px] font-mono uppercase tracking-wider text-accent-slate" />
                <div className="hidden sm:block bg-global px-5 py-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Typical copilot
                </div>
                <div className="hidden sm:block bg-global px-5 py-3 text-[11px] font-mono uppercase tracking-wider text-accent-sage">
                  Aselius Workspace
                </div>

                {COMPARISON.map((row) => (
                  <div key={row.dim} className="contents">
                    <div className="bg-global px-5 py-4 text-sm font-semibold text-foreground">{row.dim}</div>
                    <div className="bg-global px-5 py-4 text-sm text-muted-foreground">
                      <span className="sm:hidden text-[10px] font-mono uppercase tracking-wider text-accent-slate block mb-1">
                        Typical copilot
                      </span>
                      {row.them}
                    </div>
                    <div className="bg-global px-5 py-4 text-sm text-foreground">
                      <span className="sm:hidden text-[10px] font-mono uppercase tracking-wider text-accent-sage block mb-1">
                        Aselius
                      </span>
                      {row.us}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Not here to replace your IDE, counsel, or brokerage, here to run governed agentic work
                and leave with deliverables.
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

        {/* CTA / coming soon */}
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
                  <span className="text-xs font-medium text-foreground">Deploys {LAUNCH_DATE}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-5">
                  Read the docs before launch
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
                  Base, Pro, and Essential plans open with governed Rivine engine access, workspace
                  storage, messaging, and team features. Explore exactly how it works today.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
                  {["Base · Free", "Pro · $10/mo", "Essential · $30/mo"].map((p) => (
                    <span key={p} className="rounded-full border border-border bg-global px-3.5 py-1.5 text-sm text-muted-foreground">
                      {p}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href={DOCS}
                    className="inline-flex items-center gap-2 rounded-full bg-[#141512] dark:bg-[#e6e2d8] text-[#e6e2d8] dark:text-[#141512] text-sm font-medium px-5 py-2.5 hover:opacity-90 transition-opacity"
                  >
                    Read the documentation
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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
