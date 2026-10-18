"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";

type MermaidBlockProps = {
  chart: string;
};

type BaapPalette = {
  bg: string;
  text: string;
  container: string;
  hover: string;
  sage: string;
  slate: string;
  border: string;
  media: string;
  softSage: string;
  softSlate: string;
  softWarm: string;
};

function readPalette(): BaapPalette {
  const s = getComputedStyle(document.documentElement);
  const g = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback;
  const dark = document.documentElement.classList.contains("dark");
  return {
    bg: g("--bg-global", dark ? "#111111" : "#f4f4f0"),
    text: g("--text-primary", dark ? "#e8eaed" : "#1a1a1a"),
    container: g("--bg-container", dark ? "#151515" : "#ffffff"),
    hover: g("--state-hover", dark ? "#202020" : "#ededeb"),
    media: g("--media-blank", dark ? "#1d1d1d" : "#e6e6e6"),
    sage: g("--accent-sage", "#6b7a6e"),
    slate: g("--accent-slate", "#7a8b99"),
    border: dark ? "rgba(230,226,216,0.16)" : "rgba(20,21,18,0.12)",
    softSage: dark ? "rgba(107,122,110,0.28)" : "rgba(107,122,110,0.18)",
    softSlate: dark ? "rgba(122,139,153,0.28)" : "rgba(122,139,153,0.18)",
    softWarm: dark ? "rgba(138,122,98,0.28)" : "rgba(138,122,98,0.16)",
  };
}

function themeCss(p: BaapPalette) {
  return `
    .mermaid { background: transparent !important; }
    .cluster rect {
      fill: ${p.softSage} !important;
      stroke: ${p.sage} !important;
      stroke-width: 1.5px !important;
      rx: 14px !important;
      ry: 14px !important;
    }
    .cluster-label, .cluster span, .cluster foreignObject div {
      color: ${p.text} !important;
      fill: ${p.text} !important;
    }
    .node rect, .node polygon, .node circle, .node path {
      fill: ${p.container} !important;
      stroke: ${p.slate} !important;
      stroke-width: 1.75px !important;
    }
    .node .label, .nodeLabel, .node span, .node foreignObject div,
    .label, .edgeLabel, .edgeLabel span {
      color: ${p.text} !important;
      fill: ${p.text} !important;
    }
    .edgeLabel rect {
      fill: ${p.bg} !important;
      opacity: 0.92 !important;
    }
    .edgePath .path, .flowchart-link {
      stroke: ${p.slate} !important;
      stroke-width: 2px !important;
    }
    .marker, marker path {
      fill: ${p.sage} !important;
      stroke: ${p.sage} !important;
    }
    .actor, .actor-line, .messageLine0, .messageLine1 {
      stroke: ${p.slate} !important;
    }
    .statediagram-state rect {
      fill: ${p.softSlate} !important;
      stroke: ${p.slate} !important;
    }
    .statediagram-note rect {
      fill: ${p.softWarm} !important;
      stroke: ${p.sage} !important;
    }
    .transition { stroke: ${p.slate} !important; }
  `;
}

function stripHardcodedStyles(source: string) {
  // Let BAAP theme win: drop author `style Node fill:#...` lines
  return source
    .split("\n")
    .filter((line) => !/^\s*style\s+\w+\s+fill:/i.test(line.trim()))
    .join("\n");
}

type DiagramShellProps = {
  children: ReactNode;
  fullscreen: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  viewportRef?: RefObject<HTMLDivElement | null>;
};

function DiagramControls({
  fullscreen,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
}: {
  fullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
}) {
  const btn =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-container text-foreground transition-colors hover:bg-state-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-sage)]";
  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
      <button type="button" className={btn} onClick={onZoomOut} aria-label="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </button>
      <button type="button" className={btn} onClick={onZoomIn} aria-label="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        onClick={onToggleFullscreen}
        aria-label={fullscreen ? "Exit fullscreen" : "View fullscreen"}
      >
        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
    </div>
  );
}

function DiagramShell({
  children,
  fullscreen,
  zoom,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  viewportRef,
}: DiagramShellProps) {
  return (
    <div
      className={`relative overflow-hidden border border-border ${
        fullscreen
          ? "h-full w-full rounded-none bg-[var(--bg-global)]"
          : "my-8 rounded-2xl bg-[color-mix(in_srgb,var(--bg-container)_72%,var(--accent-sage)_8%)]"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, color-mix(in srgb, var(--accent-sage) 18%, transparent), transparent 55%), radial-gradient(100% 70% at 100% 100%, color-mix(in srgb, var(--accent-slate) 16%, transparent), transparent 50%)",
        }}
      />
      <DiagramControls
        fullscreen={fullscreen}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onToggleFullscreen={onToggleFullscreen}
      />
      <div
        ref={viewportRef}
        className={`relative overflow-auto p-4 sm:p-6 ${fullscreen ? "h-full" : "max-h-[70vh]"}`}
      >
        <div
          className="origin-top-left transition-transform duration-150 ease-out [&_svg]:max-w-none"
          style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Client-only mermaid render, BAAP themed, zoom + fullscreen. */
export function MermaidBlock({ chart }: MermaidBlockProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const fullscreenHostRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dark, setDark] = useState(false);

  const renderChart = useCallback(async () => {
    try {
      const palette = readPalette();
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        fontFamily: "inherit",
        themeVariables: {
          darkMode: document.documentElement.classList.contains("dark"),
          background: palette.bg,
          primaryColor: palette.softSage,
          primaryTextColor: palette.text,
          primaryBorderColor: palette.sage,
          secondaryColor: palette.softSlate,
          secondaryTextColor: palette.text,
          secondaryBorderColor: palette.slate,
          tertiaryColor: palette.softWarm,
          tertiaryTextColor: palette.text,
          tertiaryBorderColor: palette.sage,
          lineColor: palette.slate,
          textColor: palette.text,
          mainBkg: palette.container,
          nodeBorder: palette.slate,
          clusterBkg: palette.softSage,
          clusterBorder: palette.sage,
          titleColor: palette.text,
          edgeLabelBackground: palette.bg,
          noteBkgColor: palette.softWarm,
          noteTextColor: palette.text,
          noteBorderColor: palette.sage,
        },
        themeCSS: themeCss(palette),
      });

      const id = `doc-mermaid-${reactId}-${Date.now()}`;
      const { svg: next } = await mermaid.render(id, stripHardcodedStyles(chart.trim()));
      setSvg(next);
      setFailed(false);
    } catch {
      setFailed(true);
      setSvg(null);
    }
  }, [chart, reactId]);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    void renderChart();
  }, [renderChart, dark]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  const zoomIn = () => setZoom((z) => Math.min(2.5, Math.round((z + 0.15) * 100) / 100));
  const zoomOut = () => setZoom((z) => Math.max(0.5, Math.round((z - 0.15) * 100) / 100));
  const toggleFs = () => {
    setFullscreen((f) => !f);
    setZoom(1);
  };

  if (failed) {
    return (
      <pre className="my-6 overflow-x-auto rounded-2xl border border-border bg-[var(--bg-container)] p-5 text-sm leading-relaxed text-[var(--text-primary)]">
        {chart}
      </pre>
    );
  }

  const diagram = (
    <div
      ref={hostRef}
      className="[&_svg]:mx-auto [&_svg]:block"
      aria-label="Diagram"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );

  return (
    <>
      <DiagramShell
        fullscreen={false}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onToggleFullscreen={toggleFs}
      >
        {diagram}
      </DiagramShell>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-[var(--bg-global)]/95 backdrop-blur-sm p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen diagram"
        >
          <DiagramShell
            fullscreen
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onToggleFullscreen={toggleFs}
            viewportRef={fullscreenHostRef}
          >
            <div
              className="[&_svg]:mx-auto [&_svg]:block"
              dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
            />
          </DiagramShell>
        </div>
      )}
    </>
  );
}
