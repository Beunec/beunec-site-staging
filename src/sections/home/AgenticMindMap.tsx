"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type NodeKind = "text" | "glyph";

type MapNode = {
  id: string;
  kind: NodeKind;
  label?: string;
  x: number;
  y: number;
  glyph?: "hex" | "grid" | "orbit" | "stack" | "pulse";
  drift?: number;
};

const CX = 500;
const CY = 270;

/** Beunec Agentic Infrastructure mind-field: labels & blurbs from Beunec Docs. */
const NODES: MapNode[] = [
  { id: "n1", kind: "text", label: "What is the Future of Work?", x: 120, y: 70, drift: 0 },
  { id: "n2", kind: "text", label: "How does Rivine Orchestration work?", x: 880, y: 90, drift: 1 },
  { id: "n3", kind: "text", label: "Self-Awareness Must Precede Safety", x: 80, y: 260, drift: 2 },
  { id: "n4", kind: "text", label: "Who is accountable", x: 900, y: 280, drift: 3 },
  { id: "n5", kind: "text", label: "Solution Agent", x: 140, y: 450, drift: 4 },
  { id: "n6", kind: "text", label: "REA / REI / RE-AI™", x: 860, y: 460, drift: 5 },
  { id: "n7", kind: "text", label: "Artificial Experience", x: 500, y: 40, drift: 6 },
  { id: "n8", kind: "text", label: "Human escalation", x: 500, y: 500, drift: 7 },
  { id: "g1", kind: "glyph", glyph: "hex", x: 260, y: 160, drift: 0.5 },
  { id: "g2", kind: "glyph", glyph: "grid", x: 740, y: 150, drift: 1.5 },
  { id: "g3", kind: "glyph", glyph: "orbit", x: 230, y: 360, drift: 2.5 },
  { id: "g4", kind: "glyph", glyph: "stack", x: 770, y: 370, drift: 3.5 },
  { id: "g5", kind: "glyph", glyph: "pulse", x: 500, y: 120, drift: 4.5 },
  { id: "g6", kind: "glyph", glyph: "hex", x: 500, y: 420, drift: 5.5 },
];

const EDGES: [string, string][] = [
  ["n1", "g1"],
  ["n7", "g5"],
  ["n2", "g2"],
  ["n3", "g3"],
  ["n4", "g4"],
  ["n5", "g3"],
  ["n6", "g4"],
  ["n8", "g6"],
  ["g5", "g6"],
  ["g1", "g5"],
  ["g2", "g5"],
  ["g3", "g6"],
  ["g4", "g6"],
  ["g5", "center"],
  ["g6", "center"],
  ["g1", "center"],
  ["g2", "center"],
  ["g3", "center"],
  ["g4", "center"],
];

/** Concise popup copy, verbatim or tightly excerpted from Beunec Docs. */
const DESCRIPTIONS: Record<string, string> = {
  n1: "encompassing evolving practices, changing operations, and the tasks expected of us all heavily influenced by technology, artificial intelligence, finance/banking, and new modes of governance.",
  n2: "Rivine is Beunec's research direction for orchestrating agentic work, the runtime that decides how many agents a task actually needs, in what order they run, and what happens when one of them fails.",
  n3: "An organization cannot govern what it does not understand.",
  n4: "A governed system should make clear who is accountable and how people can inspect, override, or reverse an action.",
  n5: "recognizes what has been overlooked, examines why instability persists, and commits to the research, invention, development, and deployment necessary to produce lasting stability.",
  n6: "Underneath every Rivine engine is a shared reasoning framework with three modes, chosen per task rather than fixed per engine: REA, REI, and REAI.",
  n7: "what the system is allowed to keep, and what it is required to forget, after a turn ends.",
  n8: "Recognizing the difference between \"the system doesn't know\" and \"the system shouldn't decide this alone.\"",
  g1: "A model may generate intelligence. Agentic Infrastructure determines whether that intelligence can become dependable action.",
  g2: "Delegate as little additional capacity as necessary to complete the task reliably.",
  g3: "Safety must emerge through incremental actions and observable behavior.",
  g4: "Human governance is part of Agentic Infrastructure, not an external feature added after development.",
  g5: "Every live reasoning pass carries the alignment membrane; delegated outcomes can become durable, queryable experience.",
  g6: "Escalating to a human reviewer when the task's difficulty or ambiguity crosses a threshold, instead of pushing forward on a model that is out of its depth.",
};

function wrapLabel(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Layered abstract-art glyphs (gradient fills + organic accents) instead of flat icon outlines. */
function Glyph({ type, hot }: { type: MapNode["glyph"]; hot: boolean }) {
  const stroke = hot ? "var(--accent-sage)" : "rgba(232,234,237,0.55)";
  const accent = hot ? "rgba(232,234,237,0.4)" : "rgba(232,234,237,0.14)";

  switch (type) {
    case "hex":
      return (
        <g>
          <polygon
            points="0,-18 15.6,-9 15.6,9 0,18 -15.6,9 -15.6,-9"
            fill="url(#glyph-grad-a)"
            stroke={stroke}
            strokeWidth="1.15"
          />
          <path d="M-6,-4 C-3,-9 4,-9 6,-3 C8,2 4,7 -1,6 C-6,5 -8,1 -6,-4 Z" fill={accent} />
          <circle cx="5" cy="-6" r="1.4" fill={stroke} fillOpacity="0.8" />
        </g>
      );
    case "grid":
      return (
        <g>
          <rect
            x="-15"
            y="-15"
            width="30"
            height="30"
            rx="5"
            fill="url(#glyph-grad-b)"
            stroke={stroke}
            strokeWidth="1.15"
          />
          <rect x="-9" y="-4" width="20" height="13" rx="3" fill={accent} transform="rotate(-8)" />
          <circle cx="-8" cy="-8" r="1.2" fill={stroke} fillOpacity="0.7" />
          <circle cx="4" cy="-9" r="1.2" fill={stroke} fillOpacity="0.4" />
        </g>
      );
    case "orbit":
      return (
        <g>
          <circle r="16" fill="url(#glyph-grad-c)" stroke={stroke} strokeWidth="1.15" />
          <path d="M-11,3 C-6,-8 8,-9 11,1 C7,-2 -2,-3 -11,3 Z" fill={accent} />
          <circle cx="9" cy="6" r="2.2" fill={stroke} fillOpacity="0.85" />
        </g>
      );
    case "stack":
      return (
        <g>
          <path
            d="M-14,10 C-14,5 14,5 14,10 C14,14 -14,14 -14,10 Z"
            fill="url(#glyph-grad-a)"
            stroke={stroke}
            strokeWidth="1"
          />
          <path
            d="M-10,0 C-10,-4 10,-4 10,0 C10,3 -10,3 -10,0 Z"
            fill="url(#glyph-grad-b)"
            stroke={stroke}
            strokeWidth="1"
          />
          <path
            d="M-6,-9 C-6,-12 6,-12 6,-9 C6,-7 -6,-7 -6,-9 Z"
            fill="url(#glyph-grad-c)"
            stroke={stroke}
            strokeWidth="1"
          />
        </g>
      );
    default:
      return (
        <g>
          <circle r="15" fill="url(#glyph-grad-c)" stroke={stroke} strokeWidth="1.15" />
          <circle r="9" fill="none" stroke={stroke} strokeOpacity="0.5" strokeWidth="0.85" />
          <circle r="4" fill={hot ? stroke : "rgba(232,234,237,0.5)"} fillOpacity={hot ? 0.9 : 0.6} />
        </g>
      );
  }
}

function BubbleNode({
  node,
  progress,
  hot,
  onEnter,
  onLeave,
  onClick,
  reduceMotion,
}: {
  node: MapNode;
  progress: MotionValue<number>;
  hot: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClick: () => void;
  reduceMotion: boolean | null;
}) {
  // Position is fixed; expansion now comes from the container's width growing,
  // not from re-deriving x/y here. Only a gentle overall scale rides on `progress`.
  const scale = useTransform(progress, [0, 1], [0.88, 1.08]);
  const fontSize = useTransform(progress, [0, 1], [9.5, 13]);
  const labelW = useTransform(progress, (t) => {
    const base = Math.min((node.label?.length ?? 12) * 6.6, 240);
    return base * (0.9 + t * 0.25);
  });
  const labelX = useTransform(labelW, (w) => -w / 2);

  const phase = (node.drift ?? 0) * 0.7;
  const dur = 5.5 + (node.drift ?? 0) * 0.55;
  const rotateDeg = (node.drift ?? 0) * 6;

  // Wiggle lives on its own nested group so it never fights the position transform.
  // Explicit rest values (not undefined) so a running loop actually stops
  // when the map scrolls out of view.
  const wiggle = reduceMotion
    ? { y: 0, x: 0, rotate: 0 }
    : {
        y: [0, -6 - ((node.drift ?? 0) % 3), 3, -4, 0],
        x: [0, 3, -2.5, 2, 0],
        rotate: [0, 1.6, -1.2, 0.6, 0],
      };
  const wiggleTransition = reduceMotion
    ? undefined
    : { duration: dur, repeat: Infinity, ease: "easeInOut" as const, delay: phase };

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick();
  };

  if (node.kind === "text") {
    return (
      <motion.g
        style={{ x: node.x, y: node.y, scale }}
        className="cursor-pointer"
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onClick={handleClick}
      >
        <motion.g animate={wiggle} transition={wiggleTransition}>
          <motion.rect
            x={labelX}
            y={-16}
            width={labelW}
            height={32}
            rx={16}
            fill={hot ? "rgba(107,122,110,0.28)" : "rgba(29,29,29,0.92)"}
            stroke={hot ? "var(--accent-sage)" : "rgba(232,234,237,0.18)"}
            strokeWidth={1.15}
            animate={reduceMotion ? { strokeOpacity: 0.5 } : { strokeOpacity: [0.35, 0.65, 0.35] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: dur * 0.9, repeat: Infinity, ease: "easeInOut", delay: phase }
            }
          />
          <motion.text
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#e8eaed"
            fillOpacity={hot ? 1 : 0.88}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            style={{ fontSize }}
          >
            {node.label}
          </motion.text>
        </motion.g>
      </motion.g>
    );
  }

  return (
    <motion.g
      style={{ x: node.x, y: node.y, scale }}
      className="cursor-pointer"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onClick={handleClick}
    >
      <motion.g animate={wiggle} transition={wiggleTransition}>
        {!reduceMotion && (
          <motion.circle
            r={22}
            fill="none"
            stroke="var(--accent-sage)"
            initial={{ opacity: 0.15, scale: 0.9 }}
            animate={{ opacity: [0.2, 0, 0.2], scale: [0.95, 1.35, 0.95] }}
            transition={{ duration: dur, repeat: Infinity, ease: "easeOut", delay: phase }}
          />
        )}
        <g transform={`rotate(${rotateDeg})`}>
          <Glyph type={node.glyph} hot={hot} />
        </g>
      </motion.g>
    </motion.g>
  );
}

function edgeAnchor(
  id: string,
  from: { x: number; y: number },
  to: { x: number; y: number },
): { x: number; y: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return from;
  const ux = dx / len;
  const uy = dy / len;
  const inset = id.startsWith("n") ? 17 : id.startsWith("g") ? 20 : id === "center" ? 88 : 0;
  return { x: from.x + ux * inset, y: from.y + uy * inset };
}

function Edge({
  a,
  b,
  byId,
  lit,
  i,
  reduceMotion,
}: {
  a: string;
  b: string;
  byId: Map<string, { x: number; y: number }>;
  lit: boolean;
  i: number;
  reduceMotion: boolean | null;
}) {
  const Araw = byId.get(a)!;
  const Braw = byId.get(b)!;
  const A = edgeAnchor(a, Araw, Braw);
  const B = edgeAnchor(b, Braw, Araw);
  const mx = (A.x + B.x) / 2;
  const my = (A.y + B.y) / 2 - 20;
  const d = `M ${A.x} ${A.y} Q ${mx} ${my} ${B.x} ${B.y}`;

  return (
    <g>
      <motion.path
        d={d}
        fill="none"
        stroke="url(#mind-edge)"
        strokeWidth={1.15}
        strokeOpacity={0.5}
        strokeLinecap="round"
        strokeDasharray="5 7"
        animate={reduceMotion ? { strokeDashoffset: 0 } : { strokeDashoffset: [0, -48] }}
        transition={
          reduceMotion ? undefined : { duration: 6 + (i % 4), repeat: Infinity, ease: "linear" }
        }
      />
      {/* Highlight overlay crossfades in on hover instead of snapping stroke color. */}
      <motion.path
        d={d}
        fill="none"
        stroke="var(--accent-sage)"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeDasharray="5 7"
        initial={false}
        animate={{
          opacity: lit ? 0.95 : 0,
          strokeDashoffset: reduceMotion ? 0 : [0, -48],
        }}
        transition={{
          opacity: { duration: 0.25, ease: "easeOut" },
          strokeDashoffset: reduceMotion
            ? undefined
            : { duration: 6 + (i % 4), repeat: Infinity, ease: "linear" },
        }}
      />
    </g>
  );
}

function NodePopup({ node, onDismiss }: { node: MapNode; onDismiss: () => void }) {
  const text = DESCRIPTIONS[node.id] ?? "";
  const lines = useMemo(() => wrapLabel(text, 28), [text]);
  const lineHeight = 14;
  const width = Math.min(240, Math.max(130, Math.max(...lines.map((l) => l.length)) * 6.2 + 26));
  const height = lines.length * lineHeight + 18;
  const nodeGap = node.kind === "text" ? 26 : 24;
  const top = Math.max(node.y - nodeGap - height, 14);
  const centerY = top + height / 2;
  const centerX = Math.min(Math.max(node.x, width / 2 + 10), 1000 - width / 2 - 10);

  return (
    <motion.g
      style={{ x: centerX, y: centerY }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      onClick={(e) => {
        e.stopPropagation();
        onDismiss();
      }}
      className="cursor-pointer"
    >
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx={height / 2}
        fill="rgba(17,17,17,0.97)"
        stroke="var(--accent-sage)"
        strokeWidth={1.2}
      />
      <path
        d={`M -5 ${height / 2 - 1} L 0 ${height / 2 + 7} L 5 ${height / 2 - 1} Z`}
        fill="rgba(17,17,17,0.97)"
        stroke="var(--accent-sage)"
        strokeWidth={1}
      />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#e8eaed"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={10.5}
      >
        {lines.map((line, i) => (
          <tspan key={i} x={0} y={-((lines.length - 1) * lineHeight) / 2 + i * lineHeight}>
            {line}
          </tspan>
        ))}
      </text>
    </motion.g>
  );
}

type Props = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta?: () => void;
};

export function AgenticMindMap({ title, subtitle, ctaLabel, onCta }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Fitted content width (page original / max-w-7xl) → full viewport (wall-to-wall)
  const fittedW = useMotionValue(1280);
  const viewportW = useMotionValue(1280);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      // Match site gutters: px-4 / sm:px-6 / lg:px-8, cap at max-w-7xl (80rem)
      const gutter = vw >= 1024 ? 64 : vw >= 640 ? 48 : 32;
      fittedW.set(Math.min(1280, vw - gutter));
      viewportW.set(vw);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [fittedW, viewportW]);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.12", "end 0.88"],
  });

  // ponytail: numeric lerp: start at fitted page width, end at 100vw (not 58%→fitted)
  const widthPx = useTransform(
    [scrollYProgress, fittedW, viewportW],
    ([p, fitted, full]) => {
      const t = Math.min(1, Math.max(0, p as number));
      return (fitted as number) + ((full as number) - (fitted as number)) * t;
    }
  );
  const containerWidth = useSpring(widthPx, { stiffness: 120, damping: 28, mass: 0.35 });
  // Scale a full-width stage instead of animating its width: same picture, but
  // the browser composites it instead of re-laying out the SVG every frame.
  const stageScale = useTransform([containerWidth, viewportW], ([w, full]) =>
    Math.min(1, (w as number) / Math.max(1, full as number)),
  );
  const inView = useInView(trackRef, { margin: "200px 0px" });
  const still = !!reduceMotion || !inView;

  const radius = useTransform(scrollYProgress, [0, 0.65, 1], [24, 12, 0]);
  const borderColor = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]
  );

  const rawProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const progress = useSpring(rawProgress, { stiffness: 120, damping: 28, mass: 0.35 });

  const centerOpacity = useTransform(scrollYProgress, [0, 0.2, 0.55], [0.55, 0.85, 1]);
  const centerScale = useTransform(scrollYProgress, [0, 1], [0.96, 1]);

  const byId = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    NODES.forEach((n) => m.set(n.id, { x: n.x, y: n.y }));
    m.set("center", { x: CX, y: CY });
    return m;
  }, []);

  const selectedNode = selected ? NODES.find((n) => n.id === selected) ?? null : null;

  return (
    <>
    {/* Full-bleed track so width can leave the page margin and meet the walls */}
    <div
      ref={trackRef}
      className="relative h-[220vh] md:h-[240vh] w-screen max-w-[100vw] left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
    >
      <div className="sticky top-24 md:top-28 z-10 flex justify-center">
        <motion.div
          className="relative overflow-hidden"
          style={{
            background: "var(--bg-dark)",
            width: "100vw",
            scale: stageScale,
            transformOrigin: "50% 0%",
            borderRadius: radius,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor,
          }}
        >
          <svg
            viewBox="0 0 1000 540"
            className="w-full h-auto min-h-[380px] md:min-h-[520px]"
            role="img"
            aria-label="Interactive mind map of Beunec Agentic Infrastructure ideas. Scroll to expand, click a node for details."
          >
            <defs>
              <linearGradient id="mind-edge" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6b7a6e" stopOpacity="0.18" />
                <stop offset="50%" stopColor="#7a8b99" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#6b7a6e" stopOpacity="0.18" />
              </linearGradient>
              <radialGradient id="mind-glow" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#1d1d1d" stopOpacity="1" />
                <stop offset="100%" stopColor="#111111" stopOpacity="1" />
              </radialGradient>
              <linearGradient id="glyph-grad-a" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6b7a6e" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#6b7a6e" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="glyph-grad-b" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7a8b99" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7a8b99" stopOpacity="0.08" />
              </linearGradient>
              <radialGradient id="glyph-grad-c" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#e8eaed" stopOpacity="0.22" />
                <stop offset="60%" stopColor="#202020" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#111111" stopOpacity="0.9" />
              </radialGradient>
            </defs>

            <rect width="1000" height="540" fill="url(#mind-glow)" onClick={() => setSelected(null)} />

            {EDGES.map(([a, b], i) => (
              <Edge
                key={`${a}-${b}`}
                a={a}
                b={b}
                byId={byId}
                lit={hot === a || hot === b}
                i={i}
                reduceMotion={still}
              />
            ))}

            {NODES.map((n) => (
              <BubbleNode
                key={n.id}
                node={n}
                progress={progress}
                hot={hot === n.id}
                onEnter={() => setHot(n.id)}
                onLeave={() => setHot(null)}
                onClick={() => setSelected((s) => (s === n.id ? null : n.id))}
                reduceMotion={still}
              />
            ))}

            <AnimatePresence>
              {selectedNode && (
                <NodePopup key={selectedNode.id} node={selectedNode} onDismiss={() => setSelected(null)} />
              )}
            </AnimatePresence>
          </svg>

          <motion.div
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 md:p-10"
            style={{ opacity: centerOpacity, scale: centerScale }}
          >
            <div className="pointer-events-auto max-w-md text-center">
              <h2
                className="text-2xl sm:text-3xl md:text-[2.25rem] leading-snug text-[color:var(--on-ink)] mb-4"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {title}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-[color:var(--on-ink)] opacity-75 mb-7">{subtitle}</p>
              <button
                type="button"
                onClick={onCta}
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--on-ink)] text-[#111111] text-sm font-medium px-5 py-2.5 hover:opacity-90 transition-opacity duration-200"
              >
                {ctaLabel}
                <span aria-hidden>→</span>
              </button>
            </div>
          </motion.div>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm uppercase tracking-[0.14em] text-[color:var(--on-ink)] opacity-35 pointer-events-none">
            Scroll to expand
          </p>
        </motion.div>
      </div>
    </div>

    {/* On phones the map's labels are too small to read, so the same topics
        are listed here in full; the map above stays as the visual. */}
    <div className="md:hidden mx-auto max-w-7xl px-4 sm:px-6 mt-8">
      <p className="mb-3 font-mono text-sm uppercase tracking-[0.14em] text-accent-slate">Explore the ideas</p>
      <ul className="divide-y divide-border rounded-2xl border border-border bg-container">
        {NODES.filter((n) => n.kind === "text").map((n) => (
          <li key={n.id}>
            <details className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-base font-medium text-foreground">
                {n.label}
                <span aria-hidden className="text-accent-sage transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{DESCRIPTIONS[n.id]}</p>
            </details>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}