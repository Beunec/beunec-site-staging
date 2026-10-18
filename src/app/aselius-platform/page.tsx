import Link from "next/link";
import { ReelVideo } from "@/components/media/ReelVideo";
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
  Sparkles,
  Terminal,
  Users,
  Workflow,
} from "lucide-react";
import { Header } from "@/sections/Header";
import { Footer } from "@/sections/Footer";
import { ParticleBackground } from "@/sections/governance/ParticleBackground";
import { PlatformTour } from "@/sections/aselius/PlatformTour";
import { KineticHeadline } from "@/components/motion/KineticHeadline";
import { ShotImage } from "@/components/media/ShotImage";
import { TiltFrame } from "@/components/media/TiltFrame";
import { ShotGallery } from "@/components/media/ShotGallery";
import { ScrollStory, type StoryStep } from "@/components/media/ScrollStory";
import { HotspotMap, type Hotspot } from "@/components/media/HotspotMap";
import { StoryVideo, type Chapter } from "@/components/media/StoryVideo";
import { LiveJournal } from "@/components/media/LiveJournal";
import { McpSection } from "@/sections/aselius/McpSection";
import { SHOTS, getShot } from "@/lib/aselius-media";
import { UPDATES } from "@/lib/aselius-updates";
import storyMeta from "../../../motion-studio/story-meta.json";

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
    body: "Tokens, cost, latency, retries, and Artificial Experience events for your own turns, without storing conversation content.",
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
    body: "Reverse-engineering of implementation: gather context, change, verify with evidence, and continue across durable time slices. Not a one-shot chat reply.",
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
  also?: { label: string; href: string };
};

const ENGINES: EngineCard[] = [
  { icon: MessageSquare, name: "Rivine TaskForce", tagline: "Action-oriented professional work with connected apps and specialties", href: `${DOCS}/rivine-taskforce` },
  { icon: Microscope, name: "Rivine Research", tagline: "Source-grounded research delivered as Markdown, PDF, or a spreadsheet", href: `${DOCS}/rivine-research` },
  {
    icon: Code2,
    name: "Rivine Code",
    tagline: "Build, verify, and deliver working projects in a web sandbox or your terminal",
    href: `${DOCS}/rivine-code`,
    also: { label: "Also available as a terminal client", href: `${DOCS}/rivine-code-cli` },
  },
  { icon: Scale, name: "Rivine Cicero", tagline: "Legal drafting and review under guardrails; assistive, not legal advice", href: `${DOCS}/rivine-cicero` },
  { icon: Palette, name: "Rivine Creative", tagline: "Image, video, and audio creation and editing", href: `${DOCS}/rivine-creative` },
  { icon: Globe2, name: "Rivine Confluence", tagline: "Country forecasts and scenarios: evidence from models, numbers from code", href: `${DOCS}/rivine-confluence` },
  { icon: PenLine, name: "Rivine Assist", tagline: "Surgical follow-up edits on a document already open in Preview", href: `${DOCS}/rivine-assist` },
  { icon: Compass, name: "Rivine Browse", tagline: "Tasks in your real browser tabs and signed-in sessions", href: BROWSE_URL, external: true },
  { icon: Mic, name: "Selius", tagline: "Voice companion for Aselius and Browse that asks before it acts", href: `${DOCS}/selius` },
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
    body: "Scheduled engine runs that continue whether or not your computer is on, with test runs, review gates, and ledgers.",
    href: `${DOCS}/automations`,
  },
  {
    icon: Eye,
    title: "Observability",
    body: "Cost, latency, retries, and Artificial Experience activity for your turns, without storing chat content.",
    href: `${DOCS}/observability`,
  },
  {
    icon: Users,
    title: "Manage Teams",
    body: "Organizations, roles, and personal connections so people and workspaces live under one account model.",
    href: `${DOCS}/manage-teams`,
  },
];

/** Every place a Rivine engine can be reached today, per Plans & Pricing: all plans, one wallet. */
const SURFACES = [
  {
    icon: LayoutGrid,
    title: "Aselius web app",
    where: "aselius.beunec.com",
    body: "The full platform: Workspace, Automation, Observability, Manage Teams, Credits and every Rivine engine.",
    href: ASELIUS_APP,
    external: true,
  },
  {
    icon: Compass,
    title: "Rivine Browse",
    where: "Chrome extension, Mac and Windows",
    body: "Tasks in your own tabs and signed-in sessions, with your approval for anything sensitive.",
    href: BROWSE_URL,
    external: true,
  },
  {
    icon: Terminal,
    title: "Rivine Code CLI",
    where: "Your terminal",
    body: "Rivine Code on the files already on your disk, in your editor and your git.",
    href: `${DOCS}/rivine-code-cli`,
  },
  {
    icon: Workflow,
    title: "Aselius MCP",
    where: "workspace.beunec.com/mcp",
    body: "Start and follow an engine task from Claude, Cursor, ChatGPT or any MCP client.",
    href: `${DOCS}/aselius-mcp`,
  },
  {
    icon: MessageSquare,
    title: "Messaging Channels",
    where: "Telegram, Discord, WhatsApp",
    body: "Pick the engine and specialty in the chat; results come back with a one-tap preview link.",
    href: `${DOCS}/messaging-channels`,
  },
  {
    icon: Globe2,
    title: "Aselius Preview App",
    where: "preview.aselius.beunec.com",
    body: "A published deliverable, exactly as generated, on any device, with access codes, theme and language.",
    href: `${DOCS}/preview-app`,
  },
  {
    icon: Mic,
    title: "Selius",
    where: "Aselius and Rivine Browse",
    body: "Speech to speech. Tap the dragon to talk; it asks before it acts.",
    href: `${DOCS}/selius`,
  },
];

const COMPARISON = [
  {
    dim: "Product shape",
    them: "One general agent in a chat or desktop app that decides which tools to use",
    us: "Agentic infrastructure software: Workspace, Automation, Observability, Manage Teams, credits, connectors, Selius, plus Rivine Browse",
  },
  {
    dim: "Specialization",
    them: "One general agent, sometimes with a separate coding lane, inside a shared conversation",
    us: "Specialized Rivine engines (TaskForce, Research, Code, Cicero, Confluence, Assist, Creative, Browse), each chosen directly with its specialty. Not one model in a costume",
  },
  {
    dim: "Verification",
    them: "Model-led checks, user review of files, approval prompts for risky actions",
    us: "Runtime verification floor + independent critic on Code; Confluence numbers computed by code with a ledger; HITL on low-confidence steps",
  },
  {
    dim: "Long-horizon work",
    them: "A desktop process or cloud session that keeps working while you step away",
    us: "Durable, resumable engine turns in the cloud; Automation on a schedule whether or not your computer is on",
  },
  {
    dim: "Browser automation",
    them: "A built-in browser or side panel inside the vendor's product",
    us: "Rivine Browse in your real tabs and signed-in sessions (extension + desktop), with safety gates",
  },
  {
    dim: "Outputs",
    them: "Docs, sheets, decks or artifacts beside the chat",
    us: "Assets + Preview Panel + export; Live Preview for Code; Assist for surgical follow-ups; publish with an access code",
  },
  {
    dim: "Where you use it",
    them: "The vendor's own app",
    us: "Web app, Rivine Browse, Rivine Code CLI, Aselius MCP from any AI app, and Telegram, Discord or WhatsApp",
  },
  {
    dim: "Memory & context",
    them: "Projects, memory, connectors or plugins inside one product",
    us: "Artificial Experience + Context Extender under every engine, scoped to the workspace",
  },
  {
    dim: "Ops & teams",
    them: "Admin and usage views inside the vendor account",
    us: "Observability app, credit gateway per engine, Automation ledger, Manage Teams with CloudHandle",
  },
  {
    dim: "Voice",
    them: "Voice modes in the vendor app",
    us: "Selius across Aselius web and Rivine Browse; asks before acting and never self-approves risk",
  },
];

/** A task from start to finish, told with real frames. */
const STORY: StoryStep[] = [
  {
    kicker: "Ask",
    title: "Pick an engine and its specialty, then say what you need.",
    body: "The engine you pick in the input bar is the engine that runs, every time. Agent Notes start you from a ready-made engine and specialty.",
    shot: getShot("workspace-xlsx"),
  },
  {
    kicker: "Watch",
    title: "Every step shows up as it happens.",
    body: "Planning, lookups and checks appear in the thread while the engine works. Stop it whenever you like; the trail stays.",
    shot: getShot("engine-running"),
  },
  {
    kicker: "Decide",
    title: "Nothing risky runs without you.",
    body: "Before an engine acts in a connected app, you see the exact action and choose Deny or Approve & run. If it needs input, it asks and waits.",
    shot: getShot("hitl-app-action"),
  },
  {
    kicker: "Receive",
    title: "Deliverables, not a chat reply.",
    body: "One turn can return documents, spreadsheets, decks, media and an app, each a real file in Assets.",
    shot: getShot("workspace-thread"),
  },
  {
    kicker: "Inspect",
    title: "Open it exactly as generated.",
    body: "Word as pages, Excel as a grid, decks slide by slide, right beside the conversation. Rivine Assist makes follow-up edits in place.",
    shot: getShot("workspace-docx"),
  },
  {
    kicker: "Publish",
    title: "Share a snapshot with its own access code.",
    body: "Publishing never changes your original. Code access is the default; Open and Members are one click away.",
    shot: getShot("publish-dialog"),
  },
  {
    kicker: "Open anywhere",
    title: "Anyone opens it, on any device, without signing in.",
    body: "preview.aselius.beunec.com renders the file exactly as generated, with a Download button for the original.",
    shot: getShot("preview-xlsx"),
  },
];

/** Positions are percentages of the 1440 x 900 Workspace frame. */
const SPOTS: Hotspot[] = [
  { x: 2.5, y: 22, title: "Platform rail", body: "Workspaces, Connector, Selius, Automations, Observability, Credits, Manage Teams and Settings, one click each." },
  { x: 14, y: 3.5, title: "Taskspace, Governance, Share Workspace", body: "Work in Taskspace, set the rules every engine follows in Governance, and invite people by role." },
  { x: 92, y: 3.5, title: "Credits left", body: "Your prepaid balance. Each engine checks its start floor before a turn begins." },
  { x: 22, y: 50, title: "Agent Notes", body: "Ready-made prompts that set the engine and specialty for you, such as Rivine Research · PDF." },
  { x: 50.5, y: 90.3, title: "Specialty and engine", body: "Choose the Rivine engine and its specialty in the input bar. Apps connects scoped connectors; Voice starts Selius." },
  { x: 72, y: 7.7, title: "Preview Panel", body: "Assets lists every file; Preview shows the open one exactly as generated." },
  { x: 87, y: 13.4, title: "Publish and Download", body: "Publish a snapshot to the Preview app with an access code, or download the original file." },
  { x: 96.6, y: 84, title: "Selius", body: "Tap the dragon to talk. Selius asks before it acts." },
];

// Written by motion-studio/render.mjs, so the chapter list always matches the video.
const CHAPTERS: Chapter[] = storyMeta.chapters;
const STORY_LENGTH = `${Math.floor(storyMeta.duration / 60)}:${String(Math.round(storyMeta.duration % 60)).padStart(2, "0")}`;

function SectionHead({ kicker, title, body, id }: { kicker: string; title: string; body?: string; id?: string }) {
  return (
    <div data-reveal className="max-w-2xl mb-12">
      <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-5">{kicker}</p>
      <h2 id={id} className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1]">
        {title}
      </h2>
      {body && <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">{body}</p>}
    </div>
  );
}

export default function AseliusPlatformPage() {
  const heroShot = getShot("workspace-thread");

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
                <div
                  className="kt-fade inline-flex items-center gap-2 rounded-full border border-border bg-global/80 backdrop-blur-sm px-4 py-1.5 mb-6"
                  style={{ ["--d" as string]: "0s" }}
                >
                  <Calendar className="w-3.5 h-3.5 text-accent-sage" />
                  <span className="text-sm font-medium text-foreground">Agentic infrastructure software · live at aselius.beunec.com</span>
                </div>

                <KineticHeadline
                  lead="Where AI engines do real work, and you keep the"
                  emphasis="deliverables"
                  tail="."
                  className="text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.04] tracking-tight text-foreground font-extrabold"
                />

                <p
                  className="kt-fade mt-6 text-lg md:text-xl leading-relaxed text-muted-foreground max-w-xl"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif", ["--d" as string]: "0.55s" }}
                >
                  Aselius is Beunec&apos;s agentic infrastructure software. It runs research, code, legal
                  drafting, and professional work through specialized Rivine engines, and every result is
                  previewable, editable, and yours to export: governed, and never just a chat reply.
                </p>

                <div
                  className="kt-fade mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  style={{ ["--d" as string]: "0.7s" }}
                >
                  <a href={ASELIUS_APP} className="btn-ink">
                    Open Aselius
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#story"
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent-sage transition-colors"
                  >
                    Watch the story
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <Link
                    href={DOCS}
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent-sage hover:text-foreground transition-colors"
                  >
                    Read the documentation
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Real frames layered in depth; they drift at different speeds as you scroll */}
              <div className="kt-fade relative" style={{ ["--d" as string]: "0.25s" }}>
                <TiltFrame max={5}>
                  <div className="overflow-hidden rounded-2xl border border-border bg-container shadow-2xl">
                    <ShotImage
                      shot={heroShot}
                      priority
                      sizes="(min-width: 1024px) 46vw, 100vw"
                      className="h-auto w-full"
                    />
                  </div>
                </TiltFrame>
                <div
                  className="sd-drift pointer-events-none absolute -bottom-10 -left-4 w-[46%] sm:-left-8"
                  style={{ ["--drift" as string]: "-26px" }}
                >
                  <div className="overflow-hidden rounded-xl border border-border bg-container shadow-2xl">
                    <ShotImage shot={getShot("hitl-question")} sizes="22vw" className="h-auto w-full" alt="" />
                  </div>
                </div>
                <div
                  className="sd-drift pointer-events-none absolute -right-2 -top-10 hidden w-[19%] sm:block lg:-right-6"
                  style={{ ["--drift" as string]: "34px" }}
                >
                  <div className="overflow-hidden rounded-[1.1rem] border-4 border-[#1d1d1d] bg-container shadow-2xl">
                    <ShotImage shot={getShot("preview-docx-mobile")} sizes="10vw" className="h-auto w-full" alt="" />
                  </div>
                </div>
              </div>
            </div>

            <div className="kt-fade mt-20 border-t border-border pt-8" style={{ ["--d" as string]: "0.9s" }}>
              <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-4">
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
            </div>
          </div>
        </section>

        {/* The story video */}
        <section id="story" className="scroll-mt-24 border-t border-border bg-container py-20 md:py-24" aria-labelledby="story-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead
              id="story-title"
              kicker="Aselius, start to finish"
              title="Watch the Aselius story"
              body="What Aselius is, where everything lives, how a task runs, where the results go, every other place the Rivine engines reach, and why it is not another general agent. Every screen in it is real, and every line is narrated and captioned."
            />
            <div data-reveal="scale">
              <StoryVideo
                sources={[
                  { src: "/media/aselius-story.mp4", type: "video/mp4" },
                  { src: "/media/aselius-story.webm", type: "video/webm" },
                ]}
                poster="/media/aselius-story-poster.webp"
                captions="/media/aselius-story.en.vtt"
                title="The Aselius story: what it is, how to use it, and where else it works"
                duration={STORY_LENGTH}
                chapters={CHAPTERS}
              />
            </div>
          </div>
        </section>

        {/* A task, start to finish */}
        <section className="py-20 md:py-28" aria-labelledby="flow-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead
              id="flow-title"
              kicker="How one task runs"
              title="Say what you need. Review what you get."
              body="Scroll through a real task: you describe the outcome, work runs in an isolated environment, and the deliverable lands as a snapshot you can preview, publish and export."
            />
            <ScrollStory steps={STORY} label="A task in Aselius, step by step" />

            <div className="mt-16 flex flex-wrap items-stretch gap-3">
              {FLOW.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3" data-reveal style={{ ["--rv-i" as string]: i }}>
                  <div className="flex items-center gap-2.5 rounded-xl border border-border bg-container px-4 py-3">
                    <step.icon className="w-4 h-4 text-accent-sage" />
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">{step.label}</span>
                  </div>
                  {i < FLOW.length - 1 && <ArrowRight className="hidden sm:block w-4 h-4 text-accent-slate/60 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Navigation map */}
        <section className="border-t border-border bg-container py-20 md:py-24" aria-labelledby="map-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead
              id="map-title"
              kicker="Find your way around"
              title="Where everything lives"
              body="This is the Workspace you see after signing in. Hover or tap a number to see what each part does."
            />
            <div data-reveal>
              <HotspotMap shot={getShot("workspace-xlsx")} spots={SPOTS} />
            </div>
          </div>
        </section>

        <McpSection />

        <PlatformTour />

        {/* Differentiators */}
        <section className="py-20 md:py-24 bg-container">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead
              kicker="Why it is different"
              title="Not another Claude Cowork, ChatGPT Work or Kimi Work"
              body="Those are general agents inside one vendor's app. Aselius is agentic infrastructure software: specialized engines on shared memory, verification, approvals and billing, reachable from wherever you work."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {DIFFERENTIATORS.map((item, i) => (
                <div
                  key={item.title}
                  data-reveal
                  style={{ ["--rv-i" as string]: i % 3 }}
                  className="rounded-2xl border border-border bg-global p-6"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-container mb-4">
                    <item.icon className="w-5 h-5 text-accent-sage" />
                  </span>
                  <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Engines */}
        <section className="py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div data-reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-5">
                  Rivine agentic engines
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
                  Pick the right specialist for the job
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Each engine is a governed runtime with its own specialties, tools, and verification.
                  You choose the engine and its specialty in the input bar, and that engine is the one
                  that runs.
                </p>
              </div>
              <Link
                href={`${DOCS}/workspace`}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent-sage hover:text-foreground transition-colors shrink-0"
              >
                Engine documentation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

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
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-sage" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-1">{engine.tagline}</p>
                    </div>
                  </>
                );

                return (
                  <div key={engine.name} data-reveal style={{ ["--rv-i" as string]: i % 3 }}>
                    <div className="group flex h-full flex-col rounded-2xl border border-border bg-container p-5 transition-colors hover:border-accent-sage/60">
                      {engine.external ? (
                        <a href={engine.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 min-w-0">
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
                          className="mt-2 ml-14 inline-block py-1 text-sm text-accent-sage hover:underline underline-offset-2"
                        >
                          {engine.also.label}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div data-reveal className="mt-10 rounded-2xl border border-border bg-container/60 p-6 md:p-7">
              <div className="mb-5">
                <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-2">Rivine Platform</p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  Memory, context, the terminal client, and voice that sit under the engines.
                </p>
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
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">{item.blurb}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Apps */}
        <section className="py-20 md:py-24 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead kicker="One platform, four apps" title="Everything in one place, not five tabs" />
            <div className="grid sm:grid-cols-2 gap-5">
              {APPS.map((app, i) => (
                <div key={app.title} data-reveal style={{ ["--rv-i" as string]: i % 2 }}>
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
                    <span className="mt-4 text-sm font-medium text-accent-sage">Read the guide →</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Where else the engines reach */}
        <section className="py-20 md:py-24 bg-container" aria-labelledby="surfaces-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead
              id="surfaces-title"
              kicker="Not just the browser tab"
              title="Use the same engines wherever you already work"
              body="Every surface below is on every plan and spends the same prepaid wallet as the web app. None of them is a separate purchase."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SURFACES.map((surface, i) => {
                const body = (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-container">
                        <surface.icon className="w-5 h-5 text-accent-sage" />
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-sage" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{surface.title}</h3>
                    <p className="mt-0.5 font-mono text-sm text-accent-slate">{surface.where}</p>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{surface.body}</p>
                  </>
                );
                const cls =
                  "group flex h-full flex-col rounded-2xl border border-border bg-global p-6 transition-colors hover:border-accent-sage/60";
                return (
                  <div key={surface.title} data-reveal style={{ ["--rv-i" as string]: i % 3 }}>
                    {surface.external ? (
                      <a href={surface.href} target="_blank" rel="noopener noreferrer" className={cls}>
                        {body}
                      </a>
                    ) : (
                      <Link href={surface.href} className={cls}>
                        {body}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Real screenshots + the motion reel */}
        <section className="py-20 md:py-24" aria-labelledby="gallery-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead
              id="gallery-title"
              kicker="Not a rendering"
              title="What the platform actually shows you"
              body="Every frame below is a real screenshot of a live Aselius session. Filter by area, tilt a card, or open it full size and step through with the arrow keys."
            />
            <div className="sd-rise mb-12 overflow-hidden rounded-2xl border border-border bg-[#111111] shadow-[var(--shadow-soft)]">
              <ReelVideo />
            </div>
            <ShotGallery shots={SHOTS} filters />
          </div>
        </section>

        {/* What's new */}
        <section className="py-20 md:py-24 border-t border-border bg-container" aria-labelledby="updates-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead
              id="updates-title"
              kicker="What's new"
              title="Every release, in one place"
              body="Shipped and live today. The journal below updates on its own as Beunec publishes."
            />
            <ol className="relative border-l border-border ml-2 space-y-8">
              {UPDATES.map((u, i) => (
                <li key={u.title} data-reveal="left" style={{ ["--rv-i" as string]: Math.min(i, 3) }} className="pl-8 relative">
                  <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[color:var(--bg-container)] bg-accent-sage" aria-hidden />
                  <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">
                    {u.date} · {u.category}
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold text-foreground">{u.title}</h3>
                  <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{u.body}</p>
                  {u.external ? (
                    <a href={u.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-sm font-medium text-accent-sage hover:text-foreground">
                      {u.cta} →
                    </a>
                  ) : (
                    <Link href={u.href} className="mt-2 inline-flex text-sm font-medium text-accent-sage hover:text-foreground">
                      {u.cta} →
                    </Link>
                  )}
                </li>
              ))}
            </ol>

            <div className="mt-16">
              <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-5">
                Latest from the Beunec journal
              </p>
              <LiveJournal />
            </div>
          </div>
        </section>

        {/* Positioning */}
        <section className="py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div data-reveal className="max-w-3xl mb-10">
              <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent-slate mb-5">An honest lens</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
                Already using Claude Cowork, ChatGPT Work or Kimi Work?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                The fair comparison is Aselius against those general agent workspaces, not a generic
                autocomplete. We describe them only at the level of their public positioning, and we
                never claim features we have not shipped.
              </p>
            </div>

            <div data-reveal className="overflow-hidden rounded-2xl border border-border bg-container">
              <div className="grid grid-cols-1 sm:grid-cols-[0.85fr_1.15fr_1.15fr] gap-px bg-border">
                <div className="hidden sm:block bg-container px-5 py-3 text-sm font-mono uppercase tracking-wider text-accent-slate" />
                <div className="hidden sm:block bg-container px-5 py-3 text-sm font-mono uppercase tracking-wider text-muted-foreground">
                  General agent workspaces
                </div>
                <div className="hidden sm:block bg-container px-5 py-3 text-sm font-mono uppercase tracking-wider text-accent-sage">
                  Aselius
                </div>

                {COMPARISON.map((row) => (
                  <div key={row.dim} className="contents">
                    <div className="bg-container px-5 py-4 text-sm font-semibold text-foreground">{row.dim}</div>
                    <div className="bg-container px-5 py-4 text-sm text-muted-foreground">
                      <span className="sm:hidden text-sm font-mono uppercase tracking-wider text-accent-slate block mb-1">
                        General agent workspaces
                      </span>
                      {row.them}
                    </div>
                    <div className="bg-container px-5 py-4 text-sm text-foreground">
                      <span className="sm:hidden text-sm font-mono uppercase tracking-wider text-accent-sage block mb-1">
                        Aselius
                      </span>
                      {row.us}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
            <div data-reveal="scale" className="rounded-3xl border border-border overflow-hidden relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--accent-sage) 14%, transparent), color-mix(in srgb, var(--accent-slate) 8%, transparent))",
                }}
              />
              <div className="relative px-6 py-16 md:px-16 md:py-20 text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-global/80 backdrop-blur-sm px-4 py-1.5 mb-6">
                  <Calendar className="w-3.5 h-3.5 text-accent-sage" />
                  <span className="text-sm font-medium text-foreground">Live at aselius.beunec.com</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-5">
                  Open Aselius
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
                  Base (free), Pro ($20/mo), and Essential ($40/mo) all include Workspace, Automation,
                  and teams. Every plan reaches every Rivine engine at the same start floor, paid from
                  one prepaid wallet; Pro and Essential add more free monthly credits, storage, and support.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
                  {["Base · Free", "Pro · $20/mo", "Essential · $40/mo"].map((p) => (
                    <span key={p} className="rounded-full border border-border bg-global px-3.5 py-1.5 text-sm text-muted-foreground">
                      {p}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href={ASELIUS_APP} className="btn-ink">
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
