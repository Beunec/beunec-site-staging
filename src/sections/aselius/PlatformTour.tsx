"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Cable,
  Coins,
  Eye,
  LayoutGrid,
  Mic,
  Users,
  Workflow,
} from "lucide-react";

const SCENES = [
  {
    id: "workspace",
    label: "Workspace",
    icon: LayoutGrid,
    title: "Taskspace + Rivine engines",
    body: "Pin TaskForce, Research, Code, Cicero, Confluence, Assist, or Browse. Deliverables land in Assets with Preview and export.",
    chips: ["Rivine Research", "HITL pause", "Preview · PDF"],
  },
  {
    id: "connectors",
    label: "App connectors",
    icon: Cable,
    title: "Scoped connectors, not global keys",
    body: "Authorize only the apps a task needs. Credentials stay governed; engines never get a free pass to your stack.",
    chips: ["Drive", "Slack", "GitHub", "Sheets"],
  },
  {
    id: "credits",
    label: "Credits",
    icon: Coins,
    title: "Wallet that gates every turn",
    body: "Each engine checks its floor before work starts. Mid-turn top-up stays visible — no silent zombie runs.",
    chips: ["Balance", "Engine floor", "Top up"],
  },
  {
    id: "observability",
    label: "Observability",
    icon: Eye,
    title: "What your turns actually did",
    body: "Success, retries, tokens, cost, latency, and Artificial Experience activity — without storing chat content.",
    chips: ["Cost", "Latency", "AE events"],
  },
  {
    id: "automation",
    label: "Automation",
    icon: Workflow,
    title: "Scheduled engines while you sleep",
    body: "Research, TaskForce, Cicero, and Confluence runs on a schedule. Browse and Assist stay interactive on purpose.",
    chips: ["Cron", "Test run", "Needs review"],
  },
  {
    id: "selius",
    label: "Selius",
    icon: Mic,
    title: "Voice that asks before it acts",
    body: "Speech-to-speech across Aselius and Rivine Browse. It never approves payments or sends on its own judgement.",
    chips: ["Hey Selius", "Approve aloud", "Dragon"],
  },
  {
    id: "teams",
    label: "Manage Teams",
    icon: Users,
    title: "People and orgs under one account",
    body: "Organizations, roles, and CloudHandle connections so workspaces stay with the team that owns them.",
    chips: ["Owner", "Member", "CloudHandle"],
  },
] as const;

const INTERVAL_MS = 2800;

/** Fast looping tour of live Aselius surfaces — theme-aware vector frames. */
export function PlatformTour() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SCENES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const scene = SCENES[index]!;

  return (
    <section className="py-20 md:py-24 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate mb-5">
            Live on Aselius today
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
            The platform in motion
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Workspace, connectors, credits, Observability, Automation, Selius, and Manage Teams —
            the surfaces that are active in today&apos;s deployment, not a roadmap mock.
          </p>
        </div>

        <div className="grid lg:grid-cols-[14rem_1fr] gap-6 items-stretch">
          <div className="flex lg:flex-col flex-wrap gap-2">
            {SCENES.map((s, i) => {
              const active = i === index;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors text-left",
                    active
                      ? "border-accent-sage bg-[rgba(107,122,110,0.14)] text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-container/60",
                  ].join(" ")}
                >
                  <s.icon className="w-3.5 h-3.5 shrink-0" style={{ color: active ? "var(--accent-sage)" : undefined }} />
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-border bg-container overflow-hidden min-h-[280px] relative">
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: "rgba(107,122,110,0.25)" }}
            >
              {!reduceMotion && (
                <motion.div
                  key={scene.id}
                  className="h-full"
                  style={{ background: "var(--accent-sage)" }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
                />
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={scene.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="p-6 md:p-8"
              >
                <div className="flex items-start gap-4 mb-5">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-global">
                    <scene.icon className="w-5 h-5 text-accent-sage" />
                  </span>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-slate mb-1">
                      {scene.label}
                    </p>
                    <h3 className="text-xl font-semibold text-foreground tracking-tight">
                      {scene.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl mb-6">
                  {scene.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  {scene.chips.map((c) => (
                    <motion.span
                      key={c}
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-full border border-border bg-global px-3 py-1 text-xs text-muted-foreground"
                    >
                      {c}
                    </motion.span>
                  ))}
                </div>

                {/* Mini frame that changes with the scene */}
                <div
                  className="mt-8 rounded-xl border border-border bg-global p-4 overflow-hidden"
                  aria-hidden="true"
                >
                  <SceneFrame sceneId={scene.id} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function SceneFrame({ sceneId }: { sceneId: string }) {
  if (sceneId === "workspace") {
    return (
      <img
        src="/showcase/workspace-xlsx-grid.png"
        alt="An Excel workbook rendered exactly as generated, as a real grid, in the Aselius Workspace Preview panel"
        loading="lazy"
        className="w-full rounded-lg border border-border"
      />
    );
  }
  if (sceneId === "connectors") {
    return (
      <div className="grid grid-cols-4 gap-2">
        {["Drive", "Slack", "GitHub", "Sheets"].map((n) => (
          <div key={n} className="rounded-lg border border-border px-2 py-3 text-center text-[10px] text-muted-foreground">
            {n}
          </div>
        ))}
      </div>
    );
  }
  if (sceneId === "credits") {
    return (
      <div className="flex items-end gap-3 h-16">
        {[40, 65, 48, 80, 55].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t"
            style={{ background: "rgba(107,122,110,0.35)", height: `${h}%` }}
            animate={{ height: [`${h * 0.7}%`, `${h}%`, `${h * 0.85}%`] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </div>
    );
  }
  if (sceneId === "observability") {
    return (
      <img
        src="/showcase/engine-steps-saved.png"
        alt="A Rivine engine's full step trail, saved to the taskspace thread after the turn finished"
        loading="lazy"
        className="w-full rounded-lg border border-border"
      />
    );
  }
  if (sceneId === "automation") {
    return (
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="rounded-full border border-border px-2 py-1">08:00 UTC</span>
        <span>→</span>
        <span className="rounded-full border border-border px-2 py-1" style={{ borderColor: "var(--accent-sage)" }}>
          Research brief
        </span>
        <span>→</span>
        <span className="rounded-full border border-border px-2 py-1">Needs review</span>
      </div>
    );
  }
  if (sceneId === "selius") {
    return (
      <div className="flex items-center gap-3">
        <motion.span
          className="h-10 w-10 rounded-full"
          style={{ background: "linear-gradient(135deg, #e8e4d8, #6b7a6e)" }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-3/4 rounded" style={{ background: "var(--accent-slate)", opacity: 0.3 }} />
          <div className="h-2 w-1/2 rounded" style={{ background: "var(--accent-slate)", opacity: 0.18 }} />
        </div>
        <span className="text-[10px] text-accent-sage font-medium">Listening…</span>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      {["Owner", "Admin", "Member"].map((r) => (
        <span key={r} className="rounded-lg border border-border px-3 py-2 text-[11px] text-muted-foreground">
          {r}
        </span>
      ))}
    </div>
  );
}
