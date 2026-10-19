---
name: beunec-motion-website-html
summary: Build a complete, fast, accessible motion website in plain HTML, CSS and JavaScript (no framework, no build step) with Beunec-grade kinetic typography, scroll depth, motion media and a light/dark theme, verified in a real browser.
description: Use for Rivine Code frontend tasks that ask for HTML/CSS/JS rather than a framework: a landing page, a product microsite, a launch page with a story video and a reel, a multi-page static site, or a motion UI prototype. Every page is real HTML that works from a file or any static host. Motion is CSS-first with one small vanilla runtime for reveals, lazy video and theme. Uses the same tokens, motion values and rules as beunec.co. Load 05-beunec-motion-design-system and 04-beunec-motion-direction-research with it.
version: 1.0
engine: Rivine Code (frontend)
stack: HTML5, CSS (custom properties, scroll-driven animations behind @supports), vanilla JavaScript (ES2020, no dependencies)
companions: [05-beunec-motion-design-system, 04-beunec-motion-direction-research, 01-beunec-cinematic-motion-video, 02-beunec-motion-website-nextjs]
---

# Motion websites in plain HTML, CSS and JavaScript

## 0. Mission and contract

Build a website that a person can open from a folder or any static host and that **feels considered: calm kinetic type, real media, depth on scroll, and nothing that breaks without JavaScript**. No framework, no bundler, no package install is needed to run it.

Contract:

1. **Plan first** with `04`: purpose sentence, truth inventory, page list, and a motion map per page (section, meaning, motion, technique, fallback).
2. **Design system** from `05`: tokens, Inter, 16px body, nothing under 14px, sage once per view, the easing curves and durations exactly.
3. **Real HTML text.** Every word is in the markup. The kinetic headline's word spans are written in the HTML (or generated at authoring time), never injected by JavaScript at runtime, so there is no flash and no empty heading.
4. **Progressive enhancement.** Without JavaScript the page is complete and readable. JavaScript only adds: hiding below-the-fold reveals until they scroll in, lazy video, the theme toggle and the mobile menu.
5. **CSS first, no dependencies.** No jQuery, GSAP, Lenis or animation libraries unless the request explicitly needs a pinned scrubbed story (then see `02` section 9 for the GSAP rules).
6. **Real content only.** Real copy, screenshots and video. If an asset is missing, use a neutral labelled placeholder (`--media-blank` box with the asset name) and list it in the report.
7. **Verify in a real browser** (section 11).

## 1. File structure

```
site/
  index.html
  product.html              # optional extra pages share the same header/footer markup
  assets/
    css/tokens.css          # colour, type, space tokens, light and dark
    css/base.css            # layout, typography, components
    css/motion.css          # kinetic headline, reveals, scroll depth, reduced motion
    js/site.js              # theme, menu, reveals, lazy video, story player, reel toggle
    media/                  # screenshots (webp), posters (webp), videos (mp4 + webm), captions (vtt)
    fonts/                  # Inter variable (woff2), self-hosted
```

Self-host Inter (`InterVariable.woff2`) with `font-display: swap`. Load CSS in `<head>`; load `site.js` with `defer` at the end of `<head>`.

## 2. The page shell

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Aselius · Agentic infrastructure software</title>
  <meta name="description" content="Specialized Rivine engines run governed work and hand you real files you can inspect, edit, publish and export." />
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f4f4f0" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111111" />
  <!-- Set the theme before first paint: no flash -->
  <script>
    document.documentElement.classList.add("js");   /* menu collapses only when JS can open it */
    try {
      var t = localStorage.getItem("theme");
      if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches)) document.documentElement.classList.add("dark");
    } catch (e) {}
  </script>
  <link rel="preload" href="assets/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="stylesheet" href="assets/css/tokens.css" />
  <link rel="stylesheet" href="assets/css/base.css" />
  <link rel="stylesheet" href="assets/css/motion.css" />
  <script src="assets/js/site.js" defer></script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <div class="progress sd-progress" aria-hidden="true"></div>
  <header class="site-header">
    <nav class="nav" aria-label="Main">
      <a class="brand" href="index.html">Beunec</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
      <ul id="menu" class="menu">
        <li><a href="product.html">Aselius</a></li>
        <li><a href="docs.html">Docs</a></li>
        <li><a class="btn-ink" href="https://aselius.beunec.com">Open the app</a></li>
      </ul>
      <button class="theme-btn" type="button" aria-label="Switch to dark theme">Theme</button>
    </nav>
  </header>
  <main id="main"> <!-- sections --> </main>
  <footer class="site-footer"> <!-- links --> </footer>
</body>
</html>
```

## 3. Tokens (tokens.css)

```css
@font-face {
  font-family: "Inter";
  src: url("../fonts/InterVariable.woff2") format("woff2");
  font-weight: 100 900;
  font-display: swap;
}
:root {
  color-scheme: light;
  --accent-sage: #6b7a6e;
  --accent-slate: #7a8b99;
  --bg-global: #f4f4f0;
  --bg-container: #ffffff;
  --state-hover: #ededeb;
  --media-blank: #e6e6e6;
  --text-primary: #1a1a1a;
  --text-muted: #5c6370;
  --hairline: rgba(26, 26, 26, 0.1);
  --shadow-soft: 0 24px 60px -24px rgba(17, 17, 17, 0.18);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-cine: cubic-bezier(0.22, 1, 0.36, 1);
  --font: "Inter", system-ui, -apple-system, sans-serif;
  --mono: ui-monospace, Menlo, monospace;
  --wrap: 80rem;
  --gutter: clamp(1rem, 4vw, 2rem);
}
.dark {
  color-scheme: dark;
  --bg-global: #111111;
  --bg-container: #151515;
  --state-hover: #202020;
  --media-blank: #1d1d1d;
  --text-primary: #e8eaed;
  --text-muted: #a3a3a3;
  --hairline: rgba(232, 234, 237, 0.1);
  --shadow-soft: 0 24px 60px -24px rgba(0, 0, 0, 0.6);
}
```

## 4. Base styles (base.css, essentials)

```css
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; font: 400 1rem/1.6 var(--font); background: var(--bg-global); color: var(--text-primary); -webkit-font-smoothing: antialiased; }
img, video { display: block; max-width: 100%; height: auto; }
a { color: inherit; }
:focus-visible { outline: 2px solid var(--accent-sage); outline-offset: 3px; border-radius: 4px; }
.skip { position: absolute; left: -999px; } .skip:focus { left: 1rem; top: 1rem; z-index: 10; background: var(--bg-container); padding: .5rem 1rem; }

.wrap { max-width: var(--wrap); margin: 0 auto; padding: 0 var(--gutter); }
.section { padding: 5rem 0; border-top: 1px solid var(--hairline); }
@media (min-width: 768px) { .section { padding: 7rem 0; } }

.eyebrow { font: 500 .875rem/1.4 var(--mono); text-transform: uppercase; letter-spacing: .14em; color: var(--accent-slate); margin: 0 0 1.25rem; }
.h1 { font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.05; letter-spacing: -.03em; font-weight: 600; margin: 0; }
.h2 { font-size: clamp(1.875rem, 4vw, 3rem); line-height: 1.1; letter-spacing: -.025em; font-weight: 500; margin: 0; }
.lead { font-size: 1.125rem; line-height: 1.65; color: var(--text-muted); max-width: 40rem; }
.muted { color: var(--text-muted); }
.small { font-size: .875rem; }                           /* the floor: nothing smaller */

.btn-ink { display: inline-flex; align-items: center; gap: .5rem; min-height: 44px; padding: .625rem 1.25rem;
  border-radius: 999px; background: var(--text-primary); color: var(--bg-global); font-size: .875rem; font-weight: 500;
  text-decoration: none; transition: opacity .2s ease, transform .2s ease; }
.btn-ink:hover { opacity: .9; } .btn-ink:active { transform: scale(.98); }
.link-arrow { display: inline-flex; align-items: center; gap: .375rem; min-height: 44px; font-size: .875rem; font-weight: 500;
  color: var(--accent-sage); text-decoration: none; }

.card { background: var(--bg-container); border: 1px solid var(--hairline); border-radius: 1rem; padding: 1.5rem; }
.card .dot { width: .625rem; height: .625rem; border-radius: 50%; background: var(--accent-sage); margin-bottom: 1rem; }
.frame { border-radius: 1rem; overflow: hidden; border: 1px solid var(--hairline); box-shadow: var(--shadow-soft); background: var(--media-blank); }
.grid-3 { display: grid; gap: 1rem; } @media (min-width: 768px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }

/* Header and mobile menu */
.site-header { position: sticky; top: 0; z-index: 5; background: color-mix(in srgb, var(--bg-global) 85%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--hairline); }
.nav { max-width: var(--wrap); margin: 0 auto; padding: .5rem var(--gutter); display: flex; align-items: center; gap: 1rem; min-height: 64px; }
.brand { font-weight: 600; text-decoration: none; margin-right: auto; }
.menu { display: flex; gap: 1.5rem; align-items: center; list-style: none; margin: 0; padding: 0; }
.menu a:not(.btn-ink) { display: inline-flex; min-height: 44px; align-items: center; text-decoration: none; font-size: .9375rem; }
.menu-btn, .theme-btn { min-height: 44px; min-width: 44px; border: 1px solid var(--hairline); border-radius: 999px; background: transparent; color: inherit; font: inherit; font-size: .875rem; padding: 0 1rem; }
.menu-btn { display: none; }
@media (max-width: 767px) {
  .nav { flex-wrap: wrap; }
  .menu { flex-wrap: wrap; gap: .25rem 1.25rem; }            /* no JS: links stay visible, wrapped */
  .js .menu-btn { display: inline-flex; align-items: center; }
  .js .menu { display: none; position: absolute; left: 0; right: 0; top: 64px; flex-direction: column; align-items: stretch; gap: 0; padding: .5rem var(--gutter) 1rem; background: var(--bg-global); border-bottom: 1px solid var(--hairline); }
  .js .menu.open { display: flex; }
}
.progress { position: fixed; left: 0; right: 0; top: 0; height: 2px; background: var(--accent-sage); z-index: 6; }
```

## 5. The kinetic headline (written in HTML)

Write the spans by hand (or generate them when you author the page). Each word: `<span class="kt-w"><span style="--i:N">word</span></span>`. The emphasised phrase and any punctuation right after it go inside `<span class="kt-em">`, with `--em-delay` set to just after the last word (`min(0.06 + words * 0.065 + 0.35, 1.3)` seconds).

```html
<h1 class="h1 kt-head">
  <span class="kt-w"><span style="--i:0">Aselius</span></span>
  <span class="kt-w"><span style="--i:1">is</span></span>
  <span class="kt-em" style="--em-delay:.80s"><span class="kt-w"><span style="--i:2">agentic</span></span>
    <span class="kt-w"><span style="--i:3">infrastructure</span></span>
    <span class="kt-w"><span style="--i:4">software.</span></span></span>
</h1>
<p class="lead kt-fade" style="--d:.45s">Specialized Rivine engines run governed work and hand you real files.</p>
```

Screen readers read the heading as normal text (the spans add no semantics). Translation tools and text selection keep working.

## 6. Motion layer (motion.css)

```css
/* Kinetic headline */
.kt-head .kt-w { display: inline-block; overflow: clip; vertical-align: bottom; padding-block: .06em .12em; margin-block: -.06em -.12em; }
.kt-head .kt-w > span { display: inline-block; animation: kt-rise .95s var(--ease-out-expo) both; animation-delay: calc(var(--i, 0) * 65ms + 60ms); }
.kt-head .kt-em { background-image: linear-gradient(var(--accent-sage), var(--accent-sage)); background-repeat: no-repeat;
  background-position: 0 92%; background-size: 100% .07em; -webkit-box-decoration-break: clone; box-decoration-break: clone;
  animation: kt-draw .9s var(--ease-out-expo) both; animation-delay: var(--em-delay, .7s); }
@keyframes kt-rise { from { transform: translate3d(0, 55%, 0); opacity: .35; } to { transform: none; opacity: 1; } }
@keyframes kt-draw { from { background-size: 0% .07em; } to { background-size: 100% .07em; } }
.kt-fade { animation: kt-fade-up .9s var(--ease-cine) both; animation-delay: var(--d, .35s); }
@keyframes kt-fade-up { from { opacity: 0; transform: translate3d(0, 14px, 0); } to { opacity: 1; transform: none; } }

/* Reveals (JS adds .rv-pending only to below-the-fold items, then .rv-in) */
[data-reveal].rv-pending { opacity: 0; transform: translate3d(0, var(--rv-y, 28px), 0); }
[data-reveal="fade"].rv-pending { transform: none; }
[data-reveal="scale"].rv-pending { transform: scale(.94); }
[data-reveal="left"].rv-pending { transform: translate3d(-32px, 0, 0); }
[data-reveal="right"].rv-pending { transform: translate3d(32px, 0, 0); }
[data-reveal].rv-in { opacity: 1; transform: none; transition: opacity .8s var(--ease-cine), transform .95s var(--ease-out-expo); transition-delay: calc(var(--rv-i, 0) * 80ms); }

/* Scroll depth (compositor only, native timelines, static fallback) */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .sd-rise { animation: sd-rise linear both; animation-timeline: view(); animation-range: entry 0% cover 45%; }
    @keyframes sd-rise { from { transform: perspective(1400px) rotateX(16deg) translate3d(0, 60px, 0) scale(.92); opacity: .4; } to { transform: none; opacity: 1; } }
    .sd-drift { animation: sd-drift linear both; animation-timeline: view(); animation-range: cover 0% cover 100%; }
    @keyframes sd-drift { from { transform: translate3d(0, var(--drift, 40px), 0); } to { transform: translate3d(0, calc(var(--drift, 40px) * -1), 0); } }
    .sd-zoom { animation: sd-zoom linear both; animation-timeline: view(); animation-range: entry 10% exit 10%; }
    @keyframes sd-zoom { from { transform: scale(1.08); } to { transform: scale(1); } }
    .sd-ink { background-image: linear-gradient(90deg, var(--text-primary) 0 50%, color-mix(in srgb, var(--text-primary) 22%, transparent) 50% 100%);
      background-size: 200% 100%; background-repeat: no-repeat; -webkit-background-clip: text; background-clip: text; color: transparent;
      animation: sd-ink linear both; animation-timeline: view(); animation-range: cover 15% cover 55%; }
    @keyframes sd-ink { from { background-position-x: 100%; } to { background-position-x: 0%; } }
    .sd-progress { transform-origin: left center; animation: sd-progress linear both; animation-timeline: scroll(root block); }
    @keyframes sd-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  }
}
@supports not (animation-timeline: view()) { .sd-progress { display: none; } }
@media (forced-colors: active) { .sd-ink { color: CanvasText !important; background: none !important; } }

/* The off switch */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  [data-reveal].rv-pending, [data-reveal].rv-in { opacity: 1 !important; transform: none !important; transition: none !important; }
  .kt-head .kt-w > span, .kt-head .kt-em, .kt-fade { animation: none !important; }
  .sd-progress { display: none; }
}
```

## 7. The runtime (site.js)

```js
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  // Theme toggle: remembers the choice; the inline head script already applied it.
  const themeBtn = document.querySelector(".theme-btn");
  const syncThemeLabel = () => themeBtn?.setAttribute("aria-label", root.classList.contains("dark") ? "Switch to light theme" : "Switch to dark theme");
  syncThemeLabel();
  themeBtn?.addEventListener("click", () => {
    const dark = root.classList.toggle("dark");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
    syncThemeLabel();
  });

  // Mobile menu: a real button with aria-expanded; Escape closes it.
  const menuBtn = document.querySelector(".menu-btn");
  const menu = document.getElementById("menu");
  const setMenu = (open) => { menu?.classList.toggle("open", open); menuBtn?.setAttribute("aria-expanded", String(open)); };
  menuBtn?.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  if (!("IntersectionObserver" in window)) return;

  // Reveals: only what starts below the fold is hidden, so nothing on screen flashes.
  const revealIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.remove("rv-pending");
      e.target.classList.add("rv-in");
      revealIO.unobserve(e.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
  if (!reduce) {
    const fold = innerHeight * 0.92;
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      if (el.getBoundingClientRect().top > fold) { el.classList.add("rv-pending"); revealIO.observe(el); }
    });
  }

  // In-view video: load sources near the viewport, play muted while visible, pause when away.
  const videoIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) {
        const lazy = v.querySelectorAll("source[data-src]:not([src])");
        if (lazy.length) { lazy.forEach((s) => (s.src = s.dataset.src)); v.load(); }
        if (!reduce && v.dataset.inview !== "manual") v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    }
  }, { rootMargin: "200px 0px", threshold: 0 });
  document.querySelectorAll("video[data-inview]").forEach((v) => { if (reduce) v.controls = true; videoIO.observe(v); });

  // Reel sound toggle: sound only ever follows a click.
  document.querySelectorAll("[data-reel]").forEach((wrap) => {
    const v = wrap.querySelector("video"), b = wrap.querySelector("button");
    b?.addEventListener("click", () => {
      const on = v.muted;
      v.muted = !on;
      if (on) { v.currentTime = 0; v.play().catch(() => {}); }
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", on ? "Mute the reel" : "Play the reel with sound");
      b.querySelector("span").textContent = on ? "Sound on" : "Sound off";
    });
  });

  // Story player: poster button, then native controls; chapter buttons seek and mark the current one.
  document.querySelectorAll("[data-story]").forEach((wrap) => {
    const v = wrap.querySelector("video"), start = wrap.querySelector(".story-play");
    const chapters = [...wrap.querySelectorAll("[data-at]")];
    const play = (at) => { if (at != null) v.currentTime = at; v.controls = true; start?.remove(); v.play().catch(() => {}); };
    start?.addEventListener("click", () => play());
    chapters.forEach((c) => c.addEventListener("click", () => play(Number(c.dataset.at))));
    v.addEventListener("timeupdate", () => {
      let cur = 0; chapters.forEach((c, i) => { if (v.currentTime >= Number(c.dataset.at)) cur = i; });
      chapters.forEach((c, i) => c.toggleAttribute("aria-current", i === cur && !v.paused));
    });
  });
})();
```

## 8. Media markup

Reel (muted loop, sound toggle):

```html
<div class="frame reel" data-reel style="position:relative">
  <video data-inview muted loop playsinline preload="none" poster="assets/media/reel-poster.webp" width="1280" height="720"
         aria-label="A narrated loop of real product screens">
    <source data-src="assets/media/reel.mp4" type="video/mp4" />
    <source data-src="assets/media/reel.webm" type="video/webm" />
  </video>
  <button type="button" class="sound-btn" aria-pressed="false" aria-label="Play the reel with sound"><span>Sound off</span></button>
</div>
```

```css
.sound-btn { position: absolute; right: .75rem; bottom: .75rem; min-height: 44px; min-width: 44px; padding: 0 1rem; border: 0; border-radius: 999px;
  background: rgba(17, 17, 17, .75); color: #f4f4f0; font: 500 .875rem var(--font); backdrop-filter: blur(6px); }
```

Story (poster, chapters, captions available but not default when the narration is on screen):

```html
<div class="story" data-story>
  <div class="frame" style="position:relative">
    <video preload="none" playsinline poster="assets/media/story-poster.webp" aria-label="The Aselius story">
      <source src="assets/media/story.mp4" type="video/mp4" />
      <source src="assets/media/story.webm" type="video/webm" />
      <track kind="captions" src="assets/media/story.en.vtt" srclang="en" label="English" />
    </video>
    <button class="story-play btn-ink" type="button" style="position:absolute;inset:auto;left:50%;top:50%;transform:translate(-50%,-50%)">Watch the story · 2:41</button>
  </div>
  <nav aria-label="Chapters" class="card">
    <p class="eyebrow">Chapters</p>
    <ol class="chapters">
      <li><button type="button" data-at="0">0:00 What Aselius is</button></li>
      <li><button type="button" data-at="17.3">0:17 Find your way around</button></li>
    </ol>
  </nav>
</div>
```

## 9. Page recipe (home or product)

1. **Hero:** eyebrow, kinetic `h1` with one emphasised phrase, `lead.kt-fade`, actions (`btn-ink` "Open the app", `link-arrow` "Watch the story →").
2. **Proof:** a real screenshot in `.frame.sd-rise` beside three short points, each `data-reveal` with `--rv-i` 0, 1, 2.
3. **Story:** `h2`, one sentence, the story player with chapters.
4. **Feature grid:** `.grid-3` of `.card` with `.dot`, name and one line; `data-reveal` with `--rv-i` per column.
5. **Manifesto:** one sentence in large type with `sd-ink`.
6. **In motion:** the reel with its toggle beside short copy and links.
7. **CTA:** closing `h2` and the primary action.

Navigation stays still. Long-form text, tables and forms are static.

## 10. Performance and robustness

- Animate only `transform` and `opacity` on scroll. The underline's background size animates once on load.
- Videos: `preload="none"`, posters as WebP, MP4 then WebM, no autoplay with sound.
- Images: `width` and `height` attributes to prevent layout shift; `loading="lazy"` below the fold; WebP.
- One small JavaScript file with `defer`; no dependencies.
- No `will-change` on many elements; no blur animations; no loading screen.

## 11. Verification (run it)

Serve the folder (`python3 -m http.server 8080` or `npx serve site`) and test with Playwright (Chromium; add WebKit and Firefox if available) at 375x812, 768x1024 and 1440x900, light and dark:

- Zero console errors on every page.
- `document.documentElement.scrollWidth <= innerWidth` at 320px wide.
- No content text below 14px; body at 16px.
- Every link and button at least 44px tall.
- With JavaScript disabled: every word visible, and the menu links show wrapped under the brand (the menu collapses only when the `js` class is present).
- With `reducedMotion: "reduce"`: no hidden reveals, headline at rest, no scroll effects.
- Theme: toggle switches and persists across reloads; no flash on load; contrast AA in both.
- Keyboard: skip link, menu button, Escape to close, visible focus everywhere.
- Reel: loads in view, plays muted, toggle unmutes and restarts, pauses off screen.
- Story: play button starts it, chapters seek, captions are available in the menu but off by default.
- Validate HTML (no duplicate ids, every image has meaningful `alt` or `alt=""` if decorative).

## 12. Definition of done

- [ ] Direction artefacts from `04`; tokens and values from `05`.
- [ ] Every page complete without JavaScript; motion is enhancement only.
- [ ] One kinetic signature per view; reveals staggered; scroll depth on real media only.
- [ ] Media lazy and correctly ordered (MP4, WebM); reel toggle; story chapters.
- [ ] Browser checks passed at three widths, both themes, reduced motion, no JS.
- [ ] Report per `05` section 11.
