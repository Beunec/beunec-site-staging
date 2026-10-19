---
name: beunec-cinematic-motion-video
summary: Direct, build, render, sync and verify cinematic motion-graphics videos in HTML, CSS and JavaScript, the way the Aselius story and reel were made, with voiceover and music locked to the picture.
description: Use for Rivine TaskForce motion-graphics work: product story explainers, launch films, product reels, social cuts (9:16), title sequences, animated data or concept explainers, and any request for an MP4 built from code. The composition is a deterministic HTML/CSS/JS page with a pure renderAt(t); Playwright seeks every frame and FFmpeg encodes it; recorded voiceover is measured and the picture is timed to it; music is ducked under the voice; output is verified by stills, ffprobe and loudness measurement. Load 05-beunec-motion-design-system and 04-beunec-motion-direction-research with it.
version: 1.0
engine: Rivine TaskForce
stack: HTML, CSS, vanilla JavaScript, Playwright (Chromium), FFmpeg; optional Remotion when a React video project already exists
companions: [05-beunec-motion-design-system, 04-beunec-motion-direction-research]
---

# Cinematic motion video, the Beunec way

## 0. Mission and contract

You are director, motion designer, editor, sound mixer and quality engineer in one. Turn a subject into a clear, calm, truthful moving-image piece, and deliver **a real, verified MP4 plus its editable source**. A storyboard, a webpage or code that "should render" is not the deliverable.

Contract:

1. **Plan first.** Produce the direction artefacts from `04` (purpose, truth inventory, spine, beat sheet, assets). The beat sheet's voice lines are the script, the captions and the clock.
2. **Real assets only.** Every screen is a real screenshot of the real product. Every name and number is real. No invented UI, metrics, quotes or logos.
3. **Design system.** Use the tokens, type sizes, easing and durations in `05`. Do not improvise near-miss values.
4. **Deterministic.** `renderAt(t)` is a pure function of time: no timers, no `Date.now()`, no `Math.random()` (seed any noise), no CSS transitions or keyframe animations during export. Any frame can be rendered in any order and looks the same every time.
5. **Audio leads.** When narration exists, measure it and time the picture to it. Never stretch a voice line by more than 12%. Never speed the picture so text becomes unreadable.
6. **Verify by looking and measuring.** Review stills from every scene, probe every output, measure loudness and sync. Report only what you actually checked.
7. **Never touch unrelated code.** If the composition lives in a website repository, it lives in its own folder (for example `motion-studio/`) and never changes the site's runtime, auth, APIs or build.

## 1. Defaults

| Setting | Default |
| --- | --- |
| Frame | 1920x1080 (16:9) master composition; 1080x1920 (9:16) recomposed variant |
| Frame rate | 30 fps |
| Length | Story 90 to 180s, reel 15 to 20s (seamless loop), social cut 15 to 60s |
| Background | `#111111` charcoal with two drifting radial lights (sage, slate) and a vignette |
| Text | Inter; `#e8eaed` primary, `#b8bcc3` sub, `#8fa0ae` kicker, sage `#6b7a6e` underline and dots |
| Crossfade | 0.6s between scenes |
| Site encode | H.264 yuv420p CRF 24 (story) or 27 (reel), AAC 160k, plus VP9 WebM fallback |
| Master encode | H.264 yuv420p CRF 16, BT.709 tags, 2s GOP, AAC 320k 48kHz, -14 LUFS, -1 dBTP |

## 2. Project layout

Keep everything in one self-contained folder:

```
motion-studio/
  explainer/
    index.html        # loads studio.css, measured.js, scenes.js
    studio.css        # every static style; motion comes only from renderAt
    scenes.js         # the whole film as code; exposes renderAt, DURATION, CAPTIONS, CHAPTERS, ready
    measured.js       # measured voice line [start, end] seconds per cut (window.VO_MEASURED)
  audio/              # supplied voiceover and music files
  render.mjs          # Playwright frame seeker -> ffmpeg (formats, scale, workers)
  mux-audio.mjs       # voice lines + music -> final mix on the video
  voiceover.mjs       # writes the ElevenLabs script kit and cue sheet from scenes.js
  README.md           # how to edit, render and mux
```

Assets are referenced by relative path from `explainer/` (for example `../../public/media/aselius/automations-light.webp`) so the same files serve the website and the film.

## 3. The composition (copy this skeleton)

### 3.1 index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Story</title>
    <link rel="stylesheet" href="./studio.css" />
  </head>
  <body>
    <div id="stage"></div>
    <script src="./measured.js"></script>
    <script src="./scenes.js"></script>
  </body>
</html>
```

### 3.2 studio.css (essentials)

```css
html, body { margin: 0; background: #111111; }
#stage {
  position: relative; width: 1920px; height: 1080px; overflow: hidden;
  background: #111111; color: #e8eaed;
  font-family: "Inter", system-ui, sans-serif; -webkit-font-smoothing: antialiased;
}
.layer { position: absolute; inset: 0; opacity: 0; }
.light { position: absolute; width: 1800px; height: 1800px; left: 0; top: 0; border-radius: 50%;
  background: radial-gradient(circle, rgba(107,122,110,.32), rgba(107,122,110,0) 62%); }
.light.slate { background: radial-gradient(circle, rgba(122,139,153,.24), rgba(122,139,153,0) 62%); }
.grain { position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 40%, rgba(255,255,255,.02), rgba(0,0,0,.45) 100%); }
.window { position: absolute; left: 0; top: 0; transform-origin: 0 0; border-radius: 14px; overflow: hidden;
  background: #1d1d1d; box-shadow: 0 50px 120px -30px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.09); }
.window img { display: block; width: 100%; height: 100%; }
.band { position: absolute; left: 0; right: 0; bottom: 0; height: 330px;
  background: linear-gradient(to top, rgba(17,17,17,.97) 52%, rgba(17,17,17,0)); }
.caption { position: absolute; left: 140px; right: 140px; bottom: 74px; }
.kicker { font-weight: 500; font-size: 21px; letter-spacing: .22em; text-transform: uppercase; color: #8fa0ae; }
.head { font-weight: 700; font-size: 58px; line-height: 1.08; letter-spacing: -.025em; margin-top: 16px; }
.sub { font-size: 29px; line-height: 1.4; color: #b8bcc3; margin-top: 14px; max-width: 1400px; }
.w { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .12em; margin-bottom: -.12em; }
.w > span { display: inline-block; }
.em { position: relative; display: inline-block; white-space: nowrap; }
.ul { position: absolute; left: 0; right: 0; bottom: .04em; height: .075em; border-radius: 99px;
  background: #6b7a6e; transform-origin: left center; }
.center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
  justify-content: center; text-align: center; padding: 0 200px; }
.mega { font-weight: 700; font-size: 104px; line-height: 1.04; letter-spacing: -.035em; }
.dim { color: #8d9198; }
.callout { position: absolute; left: 0; top: 0; }
.dot { position: absolute; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%; background: #6b7a6e;
  box-shadow: 0 0 0 6px rgba(107,122,110,.35), 0 0 0 1px rgba(255,255,255,.7) inset; }
.ring { position: absolute; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%;
  border: 2px solid rgba(143,160,146,.9); }
.leader { position: absolute; height: 2px; background: rgba(232,234,237,.55); transform-origin: 0 50%; }
.pill { position: absolute; white-space: nowrap; background: rgba(17,17,17,.92); border: 1px solid rgba(255,255,255,.16);
  color: #e8eaed; border-radius: 999px; padding: 10px 20px; font-size: 23px; font-weight: 600;
  box-shadow: 0 18px 40px -16px rgba(0,0,0,.7); }
.chip { position: absolute; left: 64px; top: 56px; font-size: 20px; font-weight: 600; letter-spacing: .18em;
  text-transform: uppercase; background: rgba(17,17,17,.85); border: 1px solid rgba(255,255,255,.14);
  border-radius: 999px; padding: 12px 22px; }
```

Every value is static. Nothing in the CSS animates by itself.

### 3.3 scenes.js: helpers

```js
(function () {
  const params = new URLSearchParams(location.search);
  const cut = params.get("cut") || "story";
  const V = params.get("format") === "vertical";          // 9:16 recomposition
  const W = V ? 1080 : 1920, H = V ? 1920 : 1080;
  const pick = (wide, vertical) => (V ? vertical : wide);
  if (V) document.documentElement.classList.add("vertical");
  const MEDIA = "../../public/media/product/";

  // math
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const prog = (t, start, dur) => clamp((t - start) / dur);
  const outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, q) => a + (b - a) * q;

  // dom
  const stage = document.getElementById("stage");
  const el = (tag, cls, parent, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };
  const images = [];
  const img = (stem, parent) => { const i = el("img", "", parent); i.src = MEDIA + stem + ".webp"; images.push(i); return i; };

  // Kinetic words: each word in its own mask; `emph` gets the sage underline after the words land.
  function words(parent, text, emph) {
    const parts = [];
    const push = (str, into) => str.split(" ").filter(Boolean).forEach((w, i, arr) => {
      const outer = el("span", "w", into);
      parts.push(el("span", "", outer, w));
      if (i < arr.length - 1) into.appendChild(document.createTextNode(" "));
    });
    let underline = null;
    if (emph && text.includes(emph)) {
      const [before, after = ""] = text.split(emph);
      if (before.trim()) { push(before, parent); parent.appendChild(document.createTextNode(" ")); }
      const tail = after.trim();
      const hug = /^[.,!?:]/.test(tail);                    // punctuation hugs the phrase
      const glue = hug ? el("span", "", parent) : parent;
      if (hug) glue.style.whiteSpace = "nowrap";
      const em = el("span", "em", glue);
      push(emph.trim(), em);
      underline = el("span", "ul", em);
      if (hug) {
        parts.push(el("span", "", el("span", "w", glue), tail[0]));
        if (tail.slice(1).trim()) { parent.appendChild(document.createTextNode(" ")); push(tail.slice(1).trim(), parent); }
      } else if (tail) { parent.appendChild(document.createTextNode(" ")); push(tail, parent); }
    } else push(text, parent);
    return { parts, underline };
  }
  function playWords(k, t, start, stagger, dur = 0.6) {
    k.parts.forEach((p, i) => {
      const q = outExpo(prog(t, start + i * stagger, dur));
      p.style.transform = `translate3d(0, ${(1 - q) * 105}%, 0)`;
      p.style.opacity = String(0.15 + 0.85 * q);
    });
    if (k.underline) k.underline.style.transform = `scaleX(${outExpo(prog(t, start + k.parts.length * stagger + 0.2, 0.8))})`;
  }
  const fadeUp = (node, t, start, dur = 0.8, dist = 26) => {
    const q = outExpo(prog(t, start, dur));
    node.style.opacity = String(q);
    node.style.transform = `translate3d(0, ${(1 - q) * dist}px, 0)`;
  };
  // Lighting carries the mood: two soft lights drift across the whole scene, never flicker.
  function lights(layer, a, b) {
    const l1 = el("div", "light", layer), l2 = el("div", "light slate", layer);
    el("div", "grain", layer);
    return (p) => {
      l1.style.transform = `translate3d(${lerp(a[0], a[2], p)}px, ${lerp(a[1], a[3], p)}px, 0)`;
      l2.style.transform = `translate3d(${lerp(b[0], b[2], p)}px, ${lerp(b[1], b[3], p)}px, 0)`;
    };
  }
```

### 3.4 scenes.js: the camera and callouts

Keys are image-space focus points (`x`, `y` in the screenshot's own pixels) and zoom `z` at local time `t`. The focus lands on the screen point (`cx`, `cy`). Callouts are projected from image space to screen space every frame, so they ride with the camera at a constant, readable size.

```js
  function camera(layer, stem, iw, ih, keys, opts = {}) {
    const v = (V && opts.v) || {};
    const fitW = V ? v.fitW ?? (iw >= 1200 ? 1320 : 1000) : opts.fitW || 1520;
    const fitH = V ? v.fitH ?? 1080 : opts.fitH || 720;
    const base = Math.min(fitW / iw, fitH / ih);
    const win = el("div", "window", layer);
    win.style.width = iw + "px"; win.style.height = ih + "px";
    img(stem, win);
    const cx = V ? v.cx ?? W / 2 : opts.cx ?? W / 2;
    const cy = V ? v.cy ?? 760 : opts.cy ?? 420;
    const callouts = (opts.callouts || []).map((c) => {
      const root = el("div", "callout", layer);
      return { ...c, root, leader: el("div", "leader", root), ring: el("div", "ring", root),
               dot: el("div", "dot", root), pill: el("div", "pill", root, c.label) };
    });
    const sample = (t) => {
      if (t <= keys[0].t) return keys[0];
      for (let i = 1; i < keys.length; i++) if (t <= keys[i].t) {
        const a = keys[i - 1], b = keys[i], q = inOut(prog(t, a.t, b.t - a.t));
        return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), z: lerp(a.z, b.z, q) };
      }
      return keys[keys.length - 1];
    };
    return (t) => {
      const k = sample(t), s = base * k.z;
      win.style.transform = `translate3d(${cx - k.x * s}px, ${cy - k.y * s}px, 0) scale(${s})`;
      callouts.forEach((c) => {
        const sx = cx + (c.x - k.x) * s, sy = cy + (c.y - k.y) * s;
        const q = outExpo(prog(t, c.at, 0.7));
        const out = c.until ? 1 - outExpo(prog(t, c.until, 0.4)) : 1;
        let dx = (V && c.v?.dx) ?? c.dx ?? 70, dy = (V && c.v?.dy) ?? c.dy ?? 0;
        if (V && !c.v) { dx = clamp(dx, -240, 240); if (Math.abs(dx) > 200 && Math.abs(dy) < 40) dy = sy > cy ? -70 : 70; }
        const onScreen = sx > 24 && sx < W - 24 && sy > 120 && sy < H - 120 ? 1 : 0;
        const vis = q * out * onScreen;
        c.root.style.opacity = String(vis);
        c.dot.style.transform = `translate3d(${sx}px, ${sy}px, 0) scale(${0.4 + 0.6 * q})`;
        const pulse = Math.max(0, t - c.at) % 1.6;
        c.ring.style.transform = `translate3d(${sx}px, ${sy}px, 0) scale(${1 + pulse * 1.4})`;
        c.ring.style.opacity = String(clamp(1 - pulse / 1.6) * vis);
        const len = Math.hypot(dx, dy);
        c.leader.style.width = Math.max(0, len - 12) + "px";
        c.leader.style.transform = `translate3d(${sx}px, ${sy - 1}px, 0) rotate(${Math.atan2(dy, dx)}rad) scaleX(${q})`;
        const left = dx < 0;
        let px = sx + dx;
        if (V) { const pw = c.pill.offsetWidth; px = left ? clamp(px, pw + 40, W - 40) : clamp(px, 40, W - 40 - pw); }
        c.pill.style.transform = `translate3d(${px}px, ${sy + dy}px, 0) translate(${left ? "-100%" : "0"}, -50%) translate3d(${(1 - q) * (left ? 16 : -16)}px, 0, 0)`;
      });
    };
  }
```

Rules for camera keys:

- Start wide (z 1) so the viewer sees where they are, then push to the named region (z 1.4 to 2.6) on the word that names it, then hold with a tiny drift (z +0.05).
- One push per line. Two pushes only when the line names two places.
- Pick callout points from the real pixel (open the screenshot, read the coordinates). A dot that misses its button by 20px looks wrong.
- `dx` and `dy` place the pill; keep leaders short and never cross another pill.

### 3.5 scenes.js: narration timing (the clock)

```js
  const WPS = 2.5;           // planning pace before audio exists
  const VO_IN = 0.75;        // voice starts this long into each scene
  const CROSS = 0.6;         // crossfade
  const MEASURED = (window.VO_MEASURED && window.VO_MEASURED[cut]) || [];
  const TARGET = 161.04;     // the music bed's length, when the film must end with it
  const measuredTotal = MEASURED.reduce((n, [a, b]) => n + (b - a), 0);
  // The breath after each line, spread evenly so the film ends with the music.
  const VO_TAIL = cut === "story" && MEASURED.length ? (TARGET - CROSS - measuredTotal) / MEASURED.length - VO_IN : 1.0;
  const tokens = (str) => str.split(/\s+/).filter(Boolean);
  const bare = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

  let lineIndex = 0;
  function voice(say, spoken) {
    const ws = tokens(spoken || say);
    const m = MEASURED[lineIndex++];
    const len = m ? m[1] - m[0] : ws.length / WPS;  // real length once recorded
    const step = len / ws.length;                     // this line's own pace
    return {
      len, step, start: VO_IN, end: VO_IN + len,
      at: (i) => VO_IN + i * step,
      word(phrase, from = 0) {                        // local time a word is spoken
        const want = tokens(phrase).map(bare);
        for (let i = from; i < ws.length; i++)
          if (want.every((w, j) => bare(ws[i + j] || "") === w)) return VO_IN + i * step;
        throw new Error(`"${phrase}" is not in the line: ${spoken || say}`);
      },
    };
  }

  const scenes = [], CHAPTERS = [];
  let cursor = 0;
  function scene({ say, spoken, chapter, min = 0 }, build) {
    const vo = say ? voice(say, spoken) : null;
    const dur = Math.max(min, vo ? VO_IN + vo.len + VO_TAIL + CROSS : 0);
    const start = cursor;
    if (chapter) CHAPTERS.push({ at: Math.round(start * 10) / 10, title: chapter });
    const layer = el("div", "layer", stage);
    scenes.push({ start, dur, layer, update: build(layer, dur, vo), say, spoken: spoken || say, vo });
    cursor = start + dur - CROSS;
  }
```

`vo.word("Connector")` throws if the word is not in the line, which catches script drift at load time instead of in the render.

### 3.6 scenes.js: building blocks

Lower-third caption (the narration, written on screen as it is spoken):

```js
  function caption(layer, kicker, head, sub, emph, vo) {
    el("div", "band", layer);
    const box = el("div", "caption", layer);
    const k = el("div", "kicker", box, kicker);
    const hw = words(el("div", "head", box), head, emph);
    const s = sub ? el("div", "sub", box, sub) : null;
    const subAt = vo.at(tokens(head).length);
    return (t) => {
      fadeUp(k, t, 0.15, 0.6, 14);
      playWords(hw, t, vo.start - 0.05, vo.step, 0.55);
      if (s) fadeUp(s, t, subAt - 0.1, 0.7, 14);
    };
  }
  const shot = (stem, iw, ih, keys, opts, kicker, head, sub, emph) => (layer, dur, vo) => {
    const bg = lights(layer, [-500, -700, -200, -500], [600, 0, 300, -200]);
    const cam = camera(layer, stem, iw, ih, typeof keys === "function" ? keys(vo, dur) : keys,
                       typeof opts === "function" ? opts(vo, dur) : opts);
    const cap = caption(layer, kicker, head, sub, emph, vo);
    return (t) => { bg(t / dur); cam(t); cap(t); };
  };
  const line = (head, sub) => (sub ? `${head} ${sub}` : head);
```

A screen scene:

```js
  {
    const head = "Everything lives in one sidebar:";
    const sub = "your workspaces, Connector, Automations and Credits.";
    scene({ say: line(head, sub), chapter: "Find your way around" }, shot("automations-light", 1440, 900,
      (vo) => [
        { t: 0, x: 720, y: 450, z: 1 },
        { t: vo.start, x: 720, y: 450, z: 1 },
        { t: vo.word("your") - 0.2, x: 330, y: 300, z: 1.95 },
        { t: vo.end + 2, x: 345, y: 305, z: 2.02 },
      ],
      (vo) => ({ cx: 700, v: { cx: 600 }, callouts: [
        { x: 228, y: 91,  label: "Workspaces", at: vo.word("workspaces"), dx: 330 },
        { x: 228, y: 316, label: "Connector",  at: vo.word("Connector"),  dx: 330 },
      ] }),
      "02 · Find your way around", head, sub, "one sidebar"));
  }
```

A mega statement:

```js
  scene({ say: "Most AI gives you a reply. Aselius gives you the work.", chapter: "What it is", min: 5 }, (layer, dur, vo) => {
    const bg = lights(layer, [-600, -900, -300, -600], [500, 100, 300, -100]);
    const c = el("div", "center", layer);
    const ka = words(el("div", "mega dim", c), "Most AI gives you a reply.");
    const b = el("div", "mega", c); b.style.marginTop = "18px";
    const kb = words(b, "Aselius gives you the work.", "the work");
    return (t) => {
      bg(t / dur);
      playWords(ka, t, vo.start - 0.05, vo.step, 0.6);
      playWords(kb, t, vo.word("Aselius") - 0.05, vo.step, 0.6);
    };
  });
```

Card grids, device trios, URL cards and the end card follow the same pattern: build static DOM once, then set only `transform` and `opacity` from `t` in the returned updater, with each element appearing on the word that names it.

### 3.7 scenes.js: the frame function

```js
  const DURATION = cut === "story" ? Math.round((cursor + CROSS) * 10) / 10 : 18;
  const loop = cut !== "story";
  function opacityAt(sc, local) {
    if (local < -CROSS || local > sc.dur) return 0;
    const fin = sc.start === 0 && !loop ? 1 : clamp((local + (loop ? CROSS : 0)) / CROSS);
    return Math.min(fin, clamp((sc.dur - local) / CROSS));
  }
  window.renderAt = function (t) {
    for (const sc of scenes) {
      const candidates = loop ? [t - sc.start, t - sc.start + DURATION, t - sc.start - DURATION] : [t - sc.start];
      let best = 0, bestLocal = t - sc.start;
      for (const local of candidates) {
        const o = loop ? opacityAt(sc, local)
          : local >= 0 && local <= sc.dur ? Math.min(sc.start === 0 ? 1 : clamp(local / CROSS), clamp((sc.dur - local) / CROSS)) : 0;
        if (o > best) { best = o; bestLocal = local; }
      }
      sc.layer.style.opacity = String(best);
      sc.layer.style.visibility = best > 0 ? "visible" : "hidden";
      if (best > 0) sc.update(bestLocal, sc.dur);
    }
  };
  window.DURATION = DURATION;
  window.CHAPTERS = CHAPTERS;
  window.CAPTIONS = scenes.filter((s) => s.say).map((s) => ({
    start: Math.round((s.start + s.vo.start - 0.1) * 100) / 100,
    end: Math.round((s.start + s.vo.end + 0.35) * 100) / 100,
    text: s.say, spoken: s.spoken,
  }));
  window.ready = Promise.all([
    document.fonts.ready,
    ...images.map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = r; i.onerror = r; }))),
  ]).then(() => Promise.all(images.map((i) => i.decode().catch(() => {}))));
  window.renderAt(0);
})();
```

Loops (reels): each scene's opacity is checked at `t`, `t + DURATION` and `t - DURATION`, so the last scene crossfades into the first and the loop has no seam.

## 4. Vertical (9:16) is a recomposition, never a crop

Use the same scenes and timings with `?format=vertical`:

- Stage 1080x1920; `.vertical` CSS overrides: captions `left/right 72px, bottom 380px`, band 900px tall, head 62px, sub 36px, kicker 24px, mega 96px, grids two columns, `top-title` at 260px, chip at (72, 260).
- Screens frame tighter: wide screenshots fit to about 1320px wide (they overflow the sides slightly) and sit centred at y 760, so the camera keys choose what matters.
- Callouts clamp their pills inside the frame and hide when their point is cropped. Give a callout an explicit `v: { dx, dy }` when two pills would collide.
- Inline layout values switch with `pick(wide, vertical)`.
- Safe zone: no text above y 250 or below y 1540 (platform UI covers those).
- Reels in vertical add the spoken line as a kinetic caption so the cut works muted in a feed.
- Review stills from every scene in vertical; fix collisions by overriding that callout or that layout value, never by shrinking type below the floor in `05`.

## 5. Audio: measure, then time the picture to it

### 5.1 Before audio exists

Generate a voiceover kit from the composition (the script is the captions):

- one text file per line for line-by-line generation (best sync),
- one paste-ready script with `<break time="Xs" />` pauses (ElevenLabs honours up to 3s per tag),
- a cue sheet (`start`, `end`, text) and a music prompt sized to the film.

Voice settings (ElevenLabs): Multilingual v2, stability 55 to 65, similarity 75, style 0 to 10, speaker boost on, speed 1.0, a pronunciation dictionary for product names. Spell URLs and acronyms in a `spoken` string.

### 5.2 When audio arrives

1. **Probe it:** `ffprobe -v error -show_entries format=duration -of csv=p=0 voice.mp3`.
2. **Find the line boundaries** with silence detection on the voice alone:
   `ffmpeg -i voice.mp3 -af "silencedetect=n=-35dB:d=0.25" -f null - 2>&1 | grep silence_`
   A continuous read has short pauses; choose the gaps that match your script's line breaks (one more gap than lines usually means a comma pause; check by listening to the region or by comparing each segment's length with its word count).
3. **Write `measured.js`:** `window.VO_MEASURED = { story: [[start, end], ...], reel: [[...]] }`, one pair per line, in seconds.
4. **Re-time:** the composition reads the measured lengths, sets each line's word pace to `len / words`, and spreads the remaining time as breath so the film ends with the music (`VO_TAIL` formula above). Reel scenes cut in 0.3s before their line.
5. **Cut the voice into lines** at the measured points, keeping 0.1s before and 0.15s after, with 20ms fade-in and 100ms fade-out:
   `ffmpeg -i voice.mp3 -af "atrim=START:END,asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st=LEN-0.1:d=0.1" NN.wav`
   (pad the first clip with `adelay` if its line starts at 0).
6. **Render the picture** (section 6), then **mux** (5.3).

Never speed up a line by more than 12% (`atempo` up to 1.12). If it still does not fit, the scene is too short: lengthen the scene, never squeeze the voice.

### 5.3 The mix

One filter graph places every line at its cue (`adelay`), sums them, normalises the voice, loops or trims the music, ducks it under the voice with a sidechain, limits, then pads or trims to exactly the picture length:

```
[1:a]adelay=650:all=1[v0]; [2:a]adelay=6760:all=1[v1]; ...
[v0][v1]...amix=inputs=N:normalize=0,apad,atrim=0:DUR,
   highpass=f=80,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=0.1:ratio=2.5:attack=8:release=120,   (master only)
   loudnorm=I=-16:TP=-1.5:LRA=11[voice];
[M:a]atrim=0:DUR,afade=t=in:d=1.5,afade=t=out:st=DUR-2.5:d=2.5,volume=0.32[music];
[voice]asplit=2[vmix][vkey];
[music][vkey]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[ducked];
[vmix][ducked]amix=inputs=2:normalize=0,alimiter=limit=0.95,apad,atrim=0:DUR,
   loudnorm=I=-14:TP=-1:LRA=11,aresample=48000[final]                                                         (master only)
```

Encode: `-map 0:v -map [final] -c:v copy -c:a aac -b:a 320k -ar 48000 -t DUR -movflags +faststart` (master) or `-b:a 160k` (site). Use `-t DUR`, never `-shortest`, so a short audio graph can never cut the picture.

## 6. Rendering

The renderer opens the composition in Chromium, waits for `window.ready` (fonts and decoded images), then for each frame `f` calls `renderAt(f / 30)` and screenshots `#stage` as PNG into an `ffmpeg -f image2pipe` encoder.

Options a good renderer exposes:

| Option | Meaning |
| --- | --- |
| `--format vertical` | 1080x1920 viewport and `&format=vertical` |
| `--scale 1.3333` | device scale factor: renders 16:9 at 2560x1440 for a crisp YouTube master |
| `--crf 16` | x264 quality |
| `--workers N` | N pages render contiguous frame ranges into separate parts with identical encoder settings, then `ffmpeg -f concat -c copy` joins them losslessly |
| `--stills 3,30,57` | PNG stills for review instead of a video |
| `--out file.mp4` | export elsewhere and skip the site's poster, captions and meta |

Encoder settings: `-c:v libx264 -preset slow -tune animation -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -r 30 -g 60 -movflags +faststart`.

Speed: a 1920x1080 frame takes roughly 0.5 to 0.7s on one worker; 2560x1440 about 1.8 times that. A 161s film is 4,830 frames. Use workers up to the CPU count minus one, and run long renders in the background with a progress log.

For the website also write: a WebM fallback (`-c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1`), a poster WebP (1280 wide, quality 80, from a frame that shows the product), the captions VTT from `window.CAPTIONS`, and a meta JSON (`duration`, `chapters`) that the site's player imports so chapters always match the video.

## 7. Verification (do all of it)

1. **Stills review.** Render one still near the end of every scene (and mid-way through long ones), in every format. Tile them into contact sheets and look: clipped words, overflowing emphasis phrases, colliding pills, callouts off their target, text in the vertical unsafe zones, empty frames.
2. **Probe outputs:** `ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,sample_rate,bit_rate -of compact=p=0 out.mp4`. Picture and audio durations must match the composition's `DURATION`.
3. **Loudness:** `ffmpeg -i out.mp4 -af ebur128 -f null - 2>&1 | grep -A2 Integrated`. Expect about -14 LUFS (master) or about -16 to -17 (site), true peak at or below -1 dBTP.
4. **Sync:** for several cues, measure RMS 0.4s before and after the line's start: `ffmpeg -ss T -t 0.4 -i out.mp4 -af astats=metadata=0 -vn -f null -`. The level should jump about 10dB or more exactly at the cue. Report the measured numbers.
5. **Speed-up warnings:** the mux must report any line that needed `atempo`. Zero is the target.
6. **Watch it.** Play the whole file once at normal speed with sound before delivering.
7. **Captions policy:** the narration is written on screen, so subtitles are not burned in and the site's captions track is not `default`; the VTT stays available for accessibility.

## 8. Deliverables

| File | Spec |
| --- | --- |
| `<name>-16x9.mp4` | 2560x1440 (or 1920x1080), H.264 CRF 16, AAC 320k 48kHz, -14 LUFS: YouTube and LinkedIn |
| `<name>-9x16.mp4` | 1080x1920, H.264 CRF 17, AAC 320k 48kHz, -14 LUFS: Reels, Shorts, TikTok, Stories |
| Site cut | 1920x1080 MP4 + WebM, CRF 24, AAC 160k, poster, VTT, meta JSON |
| Source | the `motion-studio` folder, measured.js, the voiceover kit, a README with exact commands |

## 9. Failure conditions (fix before delivery)

Illegible or misspelled text; a word that does not match the voice; callouts on the wrong pixel; text in the vertical unsafe zone; any frame that depends on wall-clock time; fake UI or numbers; music over the voice; clipping or true peak above -1 dBTP; picture and audio of different lengths; a voice line stretched beyond 12%; output quality asserted without stills and measurements; a webpage called a video.

## 10. Final report

Follow `05` section 11. Include: story angle; formats with measured duration, resolution, fps, codecs, loudness and file sizes; how sync was verified (with numbers); where the files are; what you could not verify (for example, speech-to-text was unavailable so line text was matched by pauses and word counts).

## 11. When to use Remotion instead

If the project already has a Remotion setup, the same principles apply: one composition per format, `useCurrentFrame()` as the only clock, the measured voice lengths as props, `Sequence` per scene with `from` and `durationInFrames` computed from the narration, `<Audio>` for the mixed track, and the same verification. Do not add Remotion to a project only for this; the HTML pipeline above needs nothing but Chromium and FFmpeg.
