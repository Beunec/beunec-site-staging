---
name: beunec-motion-website-nextjs
summary: Build or surgically upgrade a Next.js / React / TypeScript / Tailwind website with Beunec-grade kinetic typography, scroll-driven depth and in-view motion media, server-rendered, accessible, fast and verified in a real browser.
description: Use for Rivine Code frontend tasks in a Next.js (App Router or Pages Router) or React + TypeScript project: a full motion website from scratch, a landing page, a product page with a story video and a reel, or a surgical motion pass over an existing site. The default technique is CSS-first (server-rendered kinetic headline, one IntersectionObserver runtime for reveals and lazy video, native scroll timelines behind @supports), with Motion for React or GSAP only when a section genuinely needs them. beunec.co is the reference implementation. Load 05-beunec-motion-design-system and 04-beunec-motion-direction-research with it.
version: 1.0
engine: Rivine Code (frontend)
stack: Next.js 14 to 16, React 18 to 19, TypeScript, Tailwind CSS 3 or 4, optional motion/react, optional gsap
companions: [05-beunec-motion-design-system, 04-beunec-motion-direction-research, 01-beunec-cinematic-motion-video, 03-beunec-motion-website-html]
---

# Motion websites in Next.js, the Beunec way

## 0. Mission and contract

Deliver a website (or a set of pages and components) that **moves with meaning, reads perfectly without motion, and is verified in a real browser**. You are a motion designer and a careful frontend engineer at once. The strongest page is not the one that animates most; it is the one that communicates most clearly while feeling considered.

Contract:

1. **Two modes, decide which.**
   - *Build mode:* there is no site yet (or the task asks for a new one). Scaffold it with the structure, tokens and components in this note.
   - *Enhance mode:* a site exists. Inspect it first and change it surgically: keep its routes, copy, brand, theme source of truth, metadata, analytics, forms, auth and APIs exactly as they are.
2. **Plan first** with `04`: purpose, truth inventory, and a section-by-section motion map (meaning, motion, technique, fallback, risk).
3. **Design system:** tokens, type floor (16px body, nothing under 14px), easing and durations from `05`. In enhance mode, map `05`'s rules onto the site's existing tokens instead of replacing them.
4. **Server-rendered text, always.** Every word is in the HTML. Motion is an enhancement that never hides content before JavaScript has run, and never hides content that is already on screen.
5. **CSS first.** Use plain CSS for headlines, reveals and scroll depth. Reach for `motion/react` only for interaction-driven or state-driven motion; reach for GSAP only for a pinned, scrubbed, multi-step story that cannot be done otherwise.
6. **No backend changes for animation.** No edits to API routes, auth, payments, data fetching contracts, environment or security headers.
7. **No invented claims, screens or numbers.** Use real copy, real screenshots and real video.
8. **Verify in the browser** (section 10) and report exactly what you ran.

## 1. Reconnaissance (enhance mode) or scaffold (build mode)

Enhance mode, before touching code:

1. Read `package.json`, the lockfile and the framework version. Identify App Router (`app/`) or Pages Router (`pages/`), the package manager, Tailwind version, installed animation packages, and the font setup.
2. Find the theme source of truth: CSS variables in a global stylesheet, the Tailwind `theme.extend.colors`, and how dark mode is toggled (`darkMode: ["class"]` with a `.dark` class on `<html>` is common).
3. List the routes and shared layout, header, footer and section components.
4. Run the baseline: `npm run lint`, `npx tsc --noEmit`, `npm run build`. Capture desktop and phone screenshots in light and dark.
5. Write the motion map. Mark dense content (legal, pricing tables, forms, docs) as static.

Build mode, scaffold:

```
app/
  layout.tsx            # fonts, theme, <MotionRuntime/>, header, footer
  page.tsx              # home: hero, sections, reel, CTA
  globals.css           # tokens + motion layer (section 3 and 4)
  <product>/page.tsx    # product page: hero, story video with chapters, tour, CTA
components/
  motion/KineticHeadline.tsx
  motion/MotionRuntime.tsx
  media/ReelVideo.tsx
  media/StoryVideo.tsx
hooks/
  use-reduced-motion.ts
public/media/           # posters (webp), videos (mp4 + webm), screenshots (webp)
```

Static export (`output: "export"`, `images: { unoptimized: true }`) is a good default for marketing sites: every page is plain HTML on any static host or CDN.

## 2. Tokens and Tailwind wiring

Put tokens in the global stylesheet once, for both themes:

```css
@layer base {
  :root {
    --accent-sage: #6b7a6e;
    --accent-slate: #7a8b99;
    --bg-global: #f4f4f0;
    --text-primary: #1a1a1a;
    --text-muted: #5c6370;
    --bg-container: #ffffff;
    --state-hover: #ededeb;
    --media-blank: #e6e6e6;
    --hairline: rgba(26, 26, 26, 0.1);
    --shadow-soft: 0 24px 60px -24px rgba(17, 17, 17, 0.18);
  }
  .dark {
    color-scheme: dark;
    --bg-global: #111111;
    --text-primary: #e8eaed;
    --text-muted: #a3a3a3;
    --bg-container: #151515;
    --state-hover: #202020;
    --media-blank: #1d1d1d;
    --hairline: rgba(232, 234, 237, 0.1);
    --shadow-soft: 0 24px 60px -24px rgba(0, 0, 0, 0.6);
  }
  body { background: var(--bg-global); color: var(--text-primary); }
}
```

Map them in Tailwind with `color-mix` so opacity modifiers (`bg-container/90`) still work:

```js
// tailwind.config.js (theme.extend.colors)
const token = (v) => `color-mix(in srgb, var(${v}) calc(<alpha-value> * 100%), transparent)`;
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        global: token("--bg-global"),
        container: token("--bg-container"),
        "state-hover": token("--state-hover"),
        "media-blank": token("--media-blank"),
        "accent-sage": token("--accent-sage"),
        "accent-slate": token("--accent-slate"),
        ink: token("--text-primary"),
      },
      fontFamily: { sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"] },
    },
  },
};
```

Font, in `app/layout.tsx`:

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
// <html lang="en" className={inter.variable} suppressHydrationWarning>
```

Theme: respect `prefers-color-scheme` on first visit, remember the user's choice, and set the class before paint (a tiny inline script in `<head>` reading `localStorage`, wrapped in try/catch) to avoid a flash. `themeColor` metadata: `#f4f4f0` light, `#111111` dark.

## 3. The kinetic headline (server component, CSS-driven)

Each word rises out of its own mask on first paint, then the emphasised phrase gets a sage underline. It is a **server component**: real text in the HTML, no hydration wait, no blank heading on slow devices. The words start 35% visible, so the heading reads from the first frame.

```tsx
// components/motion/KineticHeadline.tsx
import type { ElementType, ReactNode } from "react";

type Props = {
  lead: string;            // plain text before the emphasised phrase
  emphasis?: string;       // the phrase the motion lands on
  tail?: string;           // text after it (punctuation is fine)
  as?: ElementType;
  className?: string;
  emphasisDelay?: number;  // seconds; defaults to just after the last word
};

export function KineticHeadline({ lead, emphasis, tail, as: Tag = "h1", className = "", emphasisDelay }: Props) {
  let i = 0;
  const words = (text: string): ReactNode[] =>
    text.split(/(\s+)/).filter((p) => p.length > 0).map((part) => {
      if (/^\s+$/.test(part)) return " ";
      const index = i++;
      return (
        <span key={`w${index}`} className="kt-w">
          <span style={{ ["--i" as string]: index }}>{part}</span>
        </span>
      );
    });

  const leadNodes = words(lead);
  const emNodes = emphasis ? words(emphasis) : [];
  const delay = emphasisDelay ?? Math.min(0.06 + i * 0.065 + 0.35, 1.3);
  // Punctuation right after the phrase stays inside it, so it never wraps onto a line alone.
  const glued = tail?.match(/^[.,!?:;]+/)?.[0] ?? "";
  const gluedNodes = glued ? words(glued) : [];
  const rest = tail ? tail.slice(glued.length) : "";
  const tailNodes = rest.trim() ? words(rest) : [];

  return (
    <Tag className={`kt-head ${className}`}>
      {leadNodes}
      {emphasis ? (
        <>
          {lead && !/\s$/.test(lead) ? " " : null}
          <span className="kt-em" style={{ ["--em-delay" as string]: `${delay}s` }}>
            {emNodes}
            {gluedNodes}
          </span>
        </>
      ) : null}
      {rest && /^\s/.test(rest) ? " " : null}
      {tailNodes}
    </Tag>
  );
}
```

Use: `<KineticHeadline lead="Aselius is" emphasis="agentic infrastructure software" tail="." className="text-4xl sm:text-6xl font-medium tracking-tight" />`

The CSS (global stylesheet, outside any `@layer` so Tailwind does not rewrite it):

```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-cine: cubic-bezier(0.22, 1, 0.36, 1);
}
.kt-head .kt-w {
  display: inline-block;
  overflow: clip;
  vertical-align: bottom;
  padding-block: 0.06em 0.12em;   /* room for descenders */
  margin-block: -0.06em -0.12em;
}
.kt-head .kt-w > span {
  display: inline-block;
  animation: kt-rise 0.95s var(--ease-out-expo) both;
  animation-delay: calc(var(--i, 0) * 65ms + 60ms);
}
.kt-head .kt-em {
  /* A background, not a pseudo-element, so the underline wraps with the phrase on narrow screens */
  background-image: linear-gradient(var(--accent-sage), var(--accent-sage));
  background-repeat: no-repeat;
  background-position: 0 92%;
  background-size: 100% 0.07em;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  animation: kt-draw 0.9s var(--ease-out-expo) both;
  animation-delay: var(--em-delay, 0.7s);
}
@keyframes kt-rise { from { transform: translate3d(0, 55%, 0); opacity: 0.35; } to { transform: none; opacity: 1; } }
@keyframes kt-draw { from { background-size: 0% 0.07em; } to { background-size: 100% 0.07em; } }

.kt-fade { animation: kt-fade-up 0.9s var(--ease-cine) both; animation-delay: var(--d, 0.35s); }
@keyframes kt-fade-up { from { opacity: 0; transform: translate3d(0, 14px, 0); } to { opacity: 1; transform: none; } }
```

Rules: one kinetic headline per view (the hero, and at most one per major section). Supporting copy uses `kt-fade` with `--d` staggered by about 0.1s. Never split body paragraphs.

## 4. Reveals and lazy video: one runtime for the whole site

Instead of a motion component per card, mount **one** client component in the root layout. Mark content with `data-reveal`; mark videos with `data-inview`.

```tsx
// components/motion/MotionRuntime.tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionRuntime() {
  const pathname = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window)) return;

    const revealIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.remove("rv-pending");
        el.classList.add("rv-in");
        revealIO.unobserve(el);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });

    const videoIO = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const video = e.target as HTMLVideoElement;
        if (e.isIntersecting) {
          const lazy = video.querySelectorAll<HTMLSourceElement>("source[data-src]:not([src])");
          if (lazy.length) { lazy.forEach((s) => (s.src = s.dataset.src!)); video.load(); }
          if (!reduce && video.dataset.inview !== "manual") void video.play().catch(() => {});
        } else if (!video.paused) video.pause();
      }
    }, { rootMargin: "200px 0px", threshold: 0 });

    const fold = () => window.innerHeight * 0.92;
    const register = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-rv])").forEach((el) => {
        el.dataset.rv = "1";
        if (reduce) return;
        // Only hide what starts below the fold: nothing on screen ever flashes.
        if (el.getBoundingClientRect().top > fold()) { el.classList.add("rv-pending"); revealIO.observe(el); }
      });
      root.querySelectorAll<HTMLVideoElement>("video[data-inview]:not([data-rv])").forEach((v) => {
        v.dataset.rv = "1";
        if (reduce) v.controls = true;
        videoIO.observe(v);
      });
    };
    register(document);

    // Content that renders after data arrives registers too.
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => {
        if (n.nodeType !== Node.ELEMENT_NODE) return;
        const el = n as HTMLElement;
        if (el.matches?.("[data-reveal], video[data-inview]")) register(el.parentElement ?? document);
        else if (el.querySelector?.("[data-reveal], video[data-inview]")) register(el);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect(); revealIO.disconnect(); videoIO.disconnect();
      // A client navigation must never leave anything stuck hidden.
      document.querySelectorAll<HTMLElement>("[data-rv]").forEach((el) => { el.classList.remove("rv-pending"); delete el.dataset.rv; });
    };
  }, [pathname]);
  return null;
}
```

CSS for reveals:

```css
[data-reveal].rv-pending { opacity: 0; transform: translate3d(0, var(--rv-y, 28px), 0); }
[data-reveal="fade"].rv-pending { transform: none; }
[data-reveal="scale"].rv-pending { transform: scale(0.94); }
[data-reveal="left"].rv-pending { transform: translate3d(-32px, 0, 0); }
[data-reveal="right"].rv-pending { transform: translate3d(32px, 0, 0); }
[data-reveal].rv-in {
  opacity: 1; transform: none;
  transition: opacity 0.8s var(--ease-cine), transform 0.95s var(--ease-out-expo);
  transition-delay: calc(var(--rv-i, 0) * 80ms);
}
```

Stagger a grid with `style={{ ["--rv-i" as string]: i % 3 }}` (restart the count per row so late items do not wait).

Do not use a `clip-path` reveal: a fully clipped element can fail to intersect and never appear.

## 5. Scroll-linked depth (native, compositor-only)

```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .sd-rise { animation: sd-rise linear both; animation-timeline: view(); animation-range: entry 0% cover 45%; }
    @keyframes sd-rise {
      from { transform: perspective(1400px) rotateX(16deg) translate3d(0, 60px, 0) scale(0.92); opacity: 0.4; }
      to { transform: none; opacity: 1; }
    }
    .sd-drift { animation: sd-drift linear both; animation-timeline: view(); animation-range: cover 0% cover 100%; }
    @keyframes sd-drift {
      from { transform: translate3d(0, var(--drift, 40px), 0); }
      to { transform: translate3d(0, calc(var(--drift, 40px) * -1), 0); }
    }
    .sd-zoom { animation: sd-zoom linear both; animation-timeline: view(); animation-range: entry 10% exit 10%; }
    @keyframes sd-zoom { from { transform: scale(1.08); } to { transform: scale(1); } }
    .sd-ink {
      background-image: linear-gradient(90deg, var(--text-primary) 0 50%, color-mix(in srgb, var(--text-primary) 22%, transparent) 50% 100%);
      background-size: 200% 100%; background-repeat: no-repeat;
      -webkit-background-clip: text; background-clip: text; color: transparent;
      animation: sd-ink linear both; animation-timeline: view(); animation-range: cover 15% cover 55%;
    }
    @keyframes sd-ink { from { background-position-x: 100%; } to { background-position-x: 0%; } }
    .sd-progress { transform-origin: left center; animation: sd-progress linear both; animation-timeline: scroll(root block); }
    @keyframes sd-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  }
}
@supports not (animation-timeline: view()) { .sd-progress { display: none; } }
@media (forced-colors: active) { .sd-ink { color: CanvasText !important; background: none !important; } }
```

Where to use them: `sd-rise` on product screenshot frames as they enter; `sd-drift` on a second layer of media for depth; `sd-zoom` inside an `overflow-hidden` hero frame; `sd-ink` on one manifesto sentence per page; `sd-progress` as a 2px hairline under the header. Browsers without scroll timelines simply show the static layout, which is complete.

## 6. Reduced motion (the off switch)

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  [data-reveal].rv-pending, [data-reveal].rv-in { opacity: 1 !important; transform: none !important; transition: none !important; }
  .kt-head .kt-w > span, .kt-head .kt-em, .kt-fade { animation: none !important; }
  .sd-progress { display: none; }
}
```

For client components that need it in JS, use a hydration-safe hook:

```ts
// hooks/use-reduced-motion.ts
import { useSyncExternalStore } from "react";
const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => { const mq = window.matchMedia(QUERY); mq.addEventListener("change", cb); return () => mq.removeEventListener("change", cb); };
export const usePrefersReducedMotion = () => useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
```

## 7. Motion media components

### 7.1 Reel (muted loop with a sound toggle)

```tsx
// components/media/ReelVideo.tsx
"use client";
import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function ReelVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);
  const toggle = () => {
    const v = ref.current; if (!v) return;
    const on = !sound;
    v.muted = !on;
    if (on) { v.currentTime = 0; void v.play().catch(() => {}); }
    setSound(on);
  };
  return (
    <div className="relative">
      <video ref={ref} data-inview poster="/media/reel-poster.webp" className={`block aspect-video w-full ${className}`}
        muted loop playsInline preload="none" width={1280} height={720}
        aria-label="A narrated loop of real product screens">
        <source data-src="/media/reel.mp4" type="video/mp4" />
        <source data-src="/media/reel.webm" type="video/webm" />
      </video>
      <button type="button" onClick={toggle} aria-pressed={sound}
        aria-label={sound ? "Mute the reel" : "Play the reel with sound"}
        className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-[#111111]/75 px-3 sm:px-4 text-sm font-medium text-[#f4f4f0] backdrop-blur transition-colors hover:bg-[#111111]/90">
        {sound ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
        <span className="hidden sm:inline">{sound ? "Sound on" : "Sound off"}</span>
      </button>
    </div>
  );
}
```

Browsers only autoplay muted video; sound must follow a user gesture. The toggle restarts the loop so the voice starts at its first line.

### 7.2 Story player (poster, chapters, captions available but off)

Key behaviour:

- `preload="none"` and a large poster button ("Watch the story · 2:41"); native controls appear after the first play.
- A chapter list beside the player (`<nav aria-label="Chapters">`), each chapter a button that seeks and plays, the current one marked with `aria-current` and a sage tint.
- Chapters and duration are imported from a JSON file written by the video renderer, so the player always matches the file.
- `<track kind="captions" srcLang="en" label="English" src="...vtt" />` **without** `default` when the narration is already written on screen in the video; keep it for accessibility.
- Sources: MP4 (H.264) first, WebM (VP9) second.

## 8. Page patterns

Compose pages from these, in this spirit:

1. **Hero:** eyebrow (mono, uppercase, slate), kinetic headline with one emphasised phrase, a 16 to 18px lead with `kt-fade`, two CTAs (one solid ink button, one text link with an arrow). The CTA never waits for an animation.
2. **Proof section:** a real screenshot in a rounded frame with `sd-rise`, two or three short points beside it with `data-reveal` and a stagger.
3. **Story section:** section headline, one sentence, the story player with chapters.
4. **Feature grid:** cards with a sage dot, a name and one line each, `data-reveal` staggered per row.
5. **Manifesto line:** one sentence in large type with `sd-ink`.
6. **In motion:** the reel with its sound toggle, beside short copy and links (Open the app, Watch the story, Explore).
7. **CTA:** a calm closing headline and the primary action.

Navigation stays still. Legal, pricing tables, forms and docs stay static except for gentle `data-reveal` on headings.

## 9. When to use Motion for React or GSAP

- **Motion for React (`motion/react`):** interaction-driven or state-driven motion (a tab indicator sliding, a panel expanding, a hover preview), or scroll-linked values that must feed React (`useScroll` + `useTransform` with Motion Values, never `setState` on every scroll tick). Keep these as small client leaves inside server pages.
- **GSAP + ScrollTrigger:** only a single, short, pinned, scrubbed story section on desktop that CSS cannot express. Rules: load it with a dynamic import inside the client component; scope with `gsap.context(..., ref)` and `revert()` on unmount; use `gsap.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)")` so phones and reduced-motion users get the normal flow; never animate the pinned element itself, animate its children; no nested pins; no smooth-scroll libraries.
- **Do not add by default:** Lenis, Locomotive, custom wheel handlers, WebGL or Three.js backgrounds.

## 10. Verification (run it, do not assume it)

Commands: `npm run lint`, `npx tsc --noEmit`, `npm run build`. For static export, serve the output folder (`npx serve out` or `python3 -m http.server -d out`) and test the built pages, not the dev server alone.

Playwright checks at 375x812, 768x1024 and 1440x900, in light and dark:

- Every changed route loads with zero console errors and zero hydration warnings.
- No horizontal scroll at 320px wide (`document.documentElement.scrollWidth <= innerWidth`).
- Nothing smaller than 14px in content (`getComputedStyle` scan of text nodes).
- Every link and button at least 44px tall in its tap area.
- Headings present in the HTML before hydration (fetch the HTML and grep for the headline text).
- With `reducedMotion: "reduce"`: no element has `opacity: 0` or a transform from `rv-pending`; kinetic spans are at rest.
- With JavaScript disabled: all copy visible.
- Scroll down and back up: reveals stay revealed, nothing is stuck hidden, no layout shift from late content.
- Reel: comes into view, loads its source, plays muted; the sound toggle unmutes and restarts it; it pauses when scrolled away.
- Story player: poster play button starts playback; chapters seek; captions available but not on by default.

Note: full-page screenshots taken mid-scroll can show blank regions where reveals are mid-transition. That is a capture artefact; confirm by scrolling the element into view and waiting 1s before judging.

## 11. Definition of done

- [ ] Purpose and motion map written (`04`).
- [ ] Tokens, type floor and durations from `05`; no off-system values.
- [ ] One kinetic signature per view, quiet reveals elsewhere, scroll depth only on real media.
- [ ] Content visible without JS and with reduced motion; nothing on screen ever flashes hidden.
- [ ] Media lazy; reel muted with a sound toggle; story with chapters and available captions.
- [ ] Lint, types and build pass; browser checks pass at three widths and both themes.
- [ ] Routes, metadata, analytics, forms, auth and APIs untouched (enhance mode).
- [ ] Report written per `05` section 11, with the exact checks run.
