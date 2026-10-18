"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Cable,
  Coins,
  Eye,
  LayoutGrid,
  Mic,
  Pause,
  Play,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { getShot, type Shot } from "@/lib/aselius-media";
import { ShotImage } from "@/components/media/ShotImage";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

const DOCS = "/aselius-platform/docs";

type Scene = {
  id: string;
  label: string;
  icon: typeof LayoutGrid;
  title: string;
  body: string;
  href: string;
  shot?: Shot;
};

const SCENES: Scene[] = [
  {
    id: "workspace",
    label: "Workspace",
    icon: LayoutGrid,
    title: "Taskspace and the Rivine engines",
    body: "Pick TaskForce, Research, Code, Cicero, Confluence, Creative, Assist or Browse. Deliverables land in Assets with Preview and export.",
    href: `${DOCS}/workspace`,
    shot: getShot("workspace-thread"),
  },
  {
    id: "connectors",
    label: "Connector",
    icon: Cable,
    title: "Scoped connectors, not global keys",
    body: "Authorize only the apps a task needs. Credentials stay governed, and engines never get a free pass to your stack.",
    href: `${DOCS}/workspace`,
    shot: getShot("connectors"),
  },
  {
    id: "governance",
    label: "Governance",
    icon: ShieldCheck,
    title: "Rules every engine follows",
    body: "System instructions and content restrictions set once per workspace, editable by Owners and Operators.",
    href: `${DOCS}/workspace`,
    shot: getShot("governance"),
  },
  {
    id: "credits",
    label: "Credits",
    icon: Coins,
    title: "A wallet that gates every turn",
    body: "Each engine checks its start floor before work begins, from one prepaid balance shared by every surface.",
    href: `${DOCS}/plans-pricing`,
    shot: getShot("credits"),
  },
  {
    id: "automation",
    label: "Automation",
    icon: Workflow,
    title: "Scheduled engines while you sleep",
    body: "Research, TaskForce, Cicero and Confluence run on a schedule. Browse and Assist stay interactive on purpose.",
    href: `${DOCS}/automations`,
    shot: getShot("automations"),
  },
  {
    id: "selius",
    label: "Selius",
    icon: Mic,
    title: "Voice that asks before it acts",
    body: "Speech to speech across Aselius and Rivine Browse. It never approves payments or sends on its own judgement.",
    href: `${DOCS}/selius`,
    shot: getShot("selius"),
  },
  {
    id: "teams",
    label: "Manage Teams",
    icon: Users,
    title: "People and organizations under one account",
    body: "Organizations, roles and CloudHandle connections, so workspaces stay with the team that owns them.",
    href: `${DOCS}/manage-teams`,
    shot: getShot("shared-with-me"),
  },
  {
    id: "observability",
    label: "Observability",
    icon: Eye,
    title: "What your turns actually did",
    body: "Success, retries, tokens, cost, latency and Artificial Experience activity, without storing chat content.",
    href: `${DOCS}/observability`,
  },
];

const INTERVAL_MS = 5200;

/**
 * A self-advancing tour of the apps in today's deployment, framed with real
 * screenshots. It pauses on hover, on keyboard focus, when scrolled off screen,
 * and with the pause button; reduced motion starts it paused.
 */
export function PlatformTour() {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();
  // null = the visitor hasn't chosen; reduced motion then means paused.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reduced;
  const [hold, setHold] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.25 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  const running = !paused && !hold && onScreen;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [running, index]);

  const scene = SCENES[index]!;

  return (
    <section ref={root} className="border-t border-border py-20 md:py-24" aria-labelledby="tour-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl" data-reveal>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate">
              Live on Aselius today
            </p>
            <h2 id="tour-title" className="mb-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-4xl">
              The platform in motion
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Workspace, Connector, Governance, Credits, Automation, Selius, Manage Teams and
              Observability: the apps active in today&apos;s deployment, shown as they are.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUserPaused(!paused)}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-pressed={paused}
          >
            {paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
            {paused ? "Play tour" : "Pause tour"}
          </button>
        </div>

        <div
          className="grid items-stretch gap-6 lg:grid-cols-[14rem_1fr]"
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocusCapture={() => setHold(true)}
          onBlurCapture={() => setHold(false)}
        >
          <div className="flex flex-wrap gap-2 lg:flex-col" role="tablist" aria-label="Aselius apps">
            {SCENES.map((s, i) => {
              const active = i === index;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="tour-panel"
                  onClick={() => setIndex(i)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                    active
                      ? "border-accent-sage bg-accent-sage/15 text-foreground"
                      : "border-border text-muted-foreground hover:bg-container/60 hover:text-foreground"
                  }`}
                >
                  <s.icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-accent-sage" : ""}`} aria-hidden />
                  {s.label}
                </button>
              );
            })}
          </div>

          <div
            id="tour-panel"
            role="tabpanel"
            aria-label={scene.label}
            className="relative overflow-hidden rounded-2xl border border-border bg-container"
          >
            <div className="absolute inset-x-0 top-0 z-10 h-1 bg-accent-sage/25" aria-hidden="true">
              <div
                key={`${scene.id}-${running}`}
                className="h-full origin-left bg-accent-sage"
                style={{
                  transform: running ? undefined : "scaleX(0)",
                  animation: running ? `tour-progress ${INTERVAL_MS}ms linear both` : undefined,
                }}
              />
            </div>

            <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] xl:items-center">
              <div key={scene.id} className="tour-copy">
                <div className="mb-5 flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-global">
                    <scene.icon className="h-5 w-5 text-accent-sage" aria-hidden />
                  </span>
                  <div>
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-slate">{scene.label}</p>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">{scene.title}</h3>
                  </div>
                </div>
                <p className="mb-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">{scene.body}</p>
                <Link
                  href={scene.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-sage transition-colors hover:text-foreground"
                >
                  Read the guide <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-media-blank">
                {SCENES.map((s, i) => (
                  <div
                    key={s.id}
                    aria-hidden={i !== index}
                    className="absolute inset-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ opacity: i === index ? 1 : 0, transform: i === index ? "scale(1)" : "scale(1.035)" }}
                  >
                    {s.shot ? (
                      <ShotImage
                        shot={s.shot}
                        sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 60vw, 100vw"
                        className={`h-full w-full object-cover object-left-top ${i === index ? "kb-drift" : ""}`}
                      />
                    ) : (
                      <ObservabilityFrame />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** No Observability screenshot is published yet, so this frame says so and shows no numbers. */
function ObservabilityFrame() {
  const metrics = ["Success and failure", "Retries", "Tokens", "Cost", "Latency", "Artificial Experience"];
  return (
    <div className="flex h-full flex-col justify-between bg-global p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-slate">
        What Observability records for each of your turns
      </p>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {metrics.map((m) => (
          <li key={m} className="rounded-lg border border-border bg-container px-3 py-2.5 text-xs font-medium text-foreground">
            {m}
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground">
        Never conversation content. Open it from the platform rail at aselius.beunec.com.
      </p>
    </div>
  );
}
