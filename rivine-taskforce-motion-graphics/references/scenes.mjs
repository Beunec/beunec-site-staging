/*
 * scenes.mjs: a small, dependency-free film engine for code-to-video motion graphics.
 *
 * It gives the agent building blocks, not a look: a seekable scene timeline, keyframe
 * tracks, analytic springs, seeded noise, a 2.5D camera with depth layers and projected
 * callouts, kinetic type split by word, character or line, mask and iris transitions,
 * image-sequence playback for video clips, and voice-timing lookups. Art direction
 * (palette, type, composition, rhythm) is decided per brief; nothing here imposes one.
 *
 * Contract it produces (unchanged from the host renderer):
 *   window.motion = { meta: {width, height, fps, duration, scenes:[{id,start,end}], rest?},
 *                     ready, renderFrame(t), audioBase64?() }
 *
 * Determinism rules every scene must keep:
 *   - Set every visible property from `t` on every frame. No timers, Date.now(),
 *     Math.random(), CSS transitions/animations, or state carried between frames.
 *   - Randomness comes from rng(seed) / noise(seed), called with values derived from t.
 *   - Libraries (GSAP, Three.js, D3, lottie-web) are driven by t: gsapTimeline.time(t),
 *     renderer.render() after setting transforms, lottie.goToAndStop(frame, true).
 *
 * Usage:
 *   import { createFilm, ease, track, kinetic, camera } from "./scenes.mjs";
 *   const film = createFilm({ width: 1920, height: 1080, fps: 30, duration: 24 });
 *   film.scene({ id: "hook", start: 0, end: 6, enter: { type: "cut" } }, (layer, s) => { ...; return (t, local) => {...}; });
 *   film.publish();   // sets window.motion
 */

/* ── math ─────────────────────────────────────────────── */
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, q) => a + (b - a) * q;
export const prog = (t, start, dur) => (dur <= 0 ? (t >= start ? 1 : 0) : clamp((t - start) / dur));
export const smoothstep = (x) => { const p = clamp(x); return p * p * (3 - 2 * p); };

export const ease = {
  linear: (x) => x,
  inCubic: (x) => x * x * x,
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inOutExpo: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
  outQuint: (x) => 1 - Math.pow(1 - x, 5),
  // Overshoot for playful briefs only; `s` 1.2 to 1.7.
  outBack: (x, s = 1.4) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
  // cubic-bezier(x1,y1,x2,y2) like CSS, solved per call (fine for a few hundred elements).
  bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (u) => ((ax * u + bx) * u + cx) * u;
    const sy = (u) => ((ay * u + by) * u + cy) * u;
    return (x) => {
      let u = x;
      for (let i = 0; i < 8; i++) {
        const d = sx(u) - x;
        const dx = (3 * ax * u + 2 * bx) * u + cx;
        if (Math.abs(d) < 1e-6 || Math.abs(dx) < 1e-6) break;
        u -= d / dx;
      }
      return sy(clamp(u));
    };
  },
};

/* Analytic damped spring from 0 to 1 at local time `x` seconds: same value for the same x, always. */
export function spring(x, { stiffness = 170, damping = 26, mass = 1 } = {}) {
  if (x <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * x) * (Math.cos(wd * x) + ((zeta * w0) / wd) * Math.sin(wd * x));
  }
  return 1 - Math.exp(-w0 * x) * (1 + w0 * x);
}

/*
 * Keyframe track: track([{t:0, v:0}, {t:1.2, v:1, ease:"outExpo"}, ...])(t)
 * `v` may be a number, an array or an object of numbers. Each key's `ease` shapes the
 * segment that ends at it. Holds before the first key and after the last.
 */
export function track(keys) {
  const k = [...keys].sort((a, b) => a.t - b.t);
  const mix = (a, b, q) => {
    if (typeof a === "number") return lerp(a, b, q);
    if (Array.isArray(a)) return a.map((x, i) => lerp(x, b[i], q));
    const o = {};
    for (const key in a) o[key] = lerp(a[key], b[key], q);
    return o;
  };
  return (t) => {
    if (t <= k[0].t) return k[0].v;
    for (let i = 1; i < k.length; i++) {
      if (t <= k[i].t) {
        const e = k[i].ease;
        const f = typeof e === "function" ? e : ease[e || "inOutCubic"];
        return mix(k[i - 1].v, k[i].v, f(prog(t, k[i - 1].t, k[i].t - k[i - 1].t)));
      }
    }
    return k[k.length - 1].v;
  };
}

/* ── seeded randomness ────────────────────────────────── */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
/* Smooth 1D value noise in [-1, 1]: noise(seed)(x). Use x = t * speed + offset. */
export function noise(seed = 1) {
  const hash = (i) => {
    let h = Math.imul(i ^ seed, 0x27d4eb2d);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
    return ((h ^ (h >>> 13)) >>> 0) / 4294967296;
  };
  return (x) => {
    const i = Math.floor(x), f = x - i;
    return lerp(hash(i), hash(i + 1), smoothstep(f)) * 2 - 1;
  };
}

/* ── dom ──────────────────────────────────────────────── */
export const el = (tag, cls, parent, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  if (parent) parent.appendChild(n);
  return n;
};
const SVGNS = "http://www.w3.org/2000/svg";
export const svg = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(SVGNS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};
/* Write a transform and opacity in one call. */
export function place(node, { x = 0, y = 0, z = 0, scale = 1, rotate = 0, rotateX = 0, rotateY = 0, opacity, blur } = {}) {
  node.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(${rotate}deg) scale(${scale})`;
  if (opacity != null) node.style.opacity = String(opacity);
  if (blur != null) node.style.filter = blur > 0.05 ? `blur(${blur}px)` : "none";
}

/* ── kinetic type ─────────────────────────────────────── */
/*
 * split(node, text, { by: "word" | "char" | "line", mask: true })
 * Returns { parts: [span...], text }. Words keep real spaces; chars use Intl.Segmenter so
 * emoji and combined graphemes stay whole. `mask` wraps each part so it can rise out of a
 * clip. "line" splits on "\n" (decide line breaks yourself for exact composition).
 */
export function split(node, text, { by = "word", mask = true } = {}) {
  node.setAttribute("aria-label", text);
  const parts = [];
  const add = (str, into) => {
    const outer = mask ? el("span", "", into) : into;
    if (mask) Object.assign(outer.style, { display: "inline-block", overflow: "hidden", verticalAlign: "bottom", padding: "0.08em 0 0.14em", margin: "-0.08em 0 -0.14em" });
    const inner = el("span", "", outer, str);
    inner.style.display = "inline-block";
    inner.style.whiteSpace = "pre";
    inner.setAttribute("aria-hidden", "true");
    parts.push(inner);
  };
  if (by === "line") {
    text.split("\n").forEach((line) => { const row = el("div", "", node); add(line, row); });
  } else if (by === "char") {
    const seg = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
    const graphemes = seg ? [...seg.segment(text)].map((s) => s.segment) : [...text];
    graphemes.forEach((g) => (g === " " ? node.appendChild(document.createTextNode(" ")) : add(g, node)));
  } else {
    text.split(/(\s+)/).forEach((w) => (/^\s+$/.test(w) ? node.appendChild(document.createTextNode(" ")) : w && add(w, node)));
  }
  return { parts, text };
}

/*
 * Animate split parts at time t.
 *   at:      start time of the first part, or an array of start times (one per part,
 *            e.g. word times from the voiceover) for speech-locked type.
 *   stagger: seconds between parts when `at` is a number.
 *   from:    the state each part comes from: {x, y (% of its own height when yUnit="%"), scale, rotate, opacity, blur}
 *   dur, ease: per-part duration and easing (name or function), or spring: {stiffness, damping}.
 *   exit:    optional {at, stagger, to, dur, ease} to leave the frame.
 */
export function kinetic(k, t, { at = 0, stagger = 0.05, from = { y: 105, opacity: 0 }, yUnit = "%", dur = 0.7, ease: e = "outExpo", spring: sp, exit } = {}) {
  const f = typeof e === "function" ? e : ease[e];
  k.parts.forEach((p, i) => {
    const start = Array.isArray(at) ? at[Math.min(i, at.length - 1)] : at + i * stagger;
    const q = sp ? spring(t - start, sp) : f(prog(t, start, dur));
    let s = {
      x: (from.x ?? 0) * (1 - q), y: (from.y ?? 0) * (1 - q), scale: lerp(from.scale ?? 1, 1, q),
      rotate: (from.rotate ?? 0) * (1 - q), opacity: lerp(from.opacity ?? 1, 1, clamp(q)), blur: (from.blur ?? 0) * (1 - clamp(q)),
    };
    if (exit) {
      const xs = exit.at + i * (exit.stagger ?? 0);
      const xe = typeof exit.ease === "function" ? exit.ease : ease[exit.ease || "inCubic"];
      const r = xe(prog(t, xs, exit.dur ?? 0.5));
      const to = exit.to || { y: -105, opacity: 0 };
      s = { x: s.x + (to.x ?? 0) * r, y: s.y + (to.y ?? 0) * r, scale: s.scale * lerp(1, to.scale ?? 1, r), rotate: s.rotate + (to.rotate ?? 0) * r, opacity: s.opacity * lerp(1, to.opacity ?? 1, r), blur: s.blur + (to.blur ?? 0) * r };
    }
    const ty = yUnit === "%" ? `${s.y}%` : `${s.y}px`;
    p.style.transform = `translate3d(${s.x}px, ${ty}, 0) rotate(${s.rotate}deg) scale(${s.scale})`;
    p.style.opacity = String(s.opacity);
    p.style.filter = s.blur > 0.05 ? `blur(${s.blur}px)` : "none";
  });
}

/* ── camera (2.5D) ────────────────────────────────────── */
/*
 * camera(world, { width, height, keys })
 *   keys: [{t, x, y, zoom, rotate}] in world pixels (x, y = point at frame centre).
 *   cam.layer(node, depth): depth 1 = focal plane; 0 = fixed backdrop; 0.3 = far (moves
 *   little); 1.6 = foreground (moves more). Parallax comes free with every camera move.
 *   cam.focus(depth, amount): optional depth-of-field blur by distance from `depth`.
 *   cam.project(wx, wy, depth): world point to screen point (for callouts and labels).
 *   cam.apply(t): call once per frame before anything that projects.
 */
export function camera(world, { width, height, keys, focus } = {}) {
  const W = width, H = height;
  const path = track(keys.map((k) => ({ t: k.t, ease: k.ease, v: { x: k.x ?? W / 2, y: k.y ?? H / 2, zoom: k.zoom ?? 1, rotate: k.rotate ?? 0 } })));
  const layers = [];
  let state = { x: W / 2, y: H / 2, zoom: 1, rotate: 0 };
  let dof = focus || null;
  const frame = (depth) => {
    const s = 1 + (state.zoom - 1) * depth;
    const cx = W / 2 + (state.x - W / 2) * depth;
    const cy = H / 2 + (state.y - H / 2) * depth;
    return { s, cx, cy, r: state.rotate * Math.min(1, depth) };
  };
  return {
    layer(node, depth = 1) {
      Object.assign(node.style, { position: "absolute", left: "0", top: "0", width: W + "px", height: H + "px", transformOrigin: "0 0" });
      if (!node.parentNode) world.appendChild(node);
      layers.push({ node, depth });
      return node;
    },
    focus(depth, amount = 6) { dof = { depth, amount }; },
    apply(t) {
      state = path(t);
      for (const { node, depth } of layers) {
        const { s, cx, cy, r } = frame(depth);
        node.style.transform = `translate(${W / 2}px, ${H / 2}px) rotate(${r}deg) scale(${s}) translate(${-cx}px, ${-cy}px)`;
        if (dof) {
          const b = Math.abs(depth - dof.depth) * dof.amount;
          node.style.filter = b > 0.1 ? `blur(${b.toFixed(2)}px)` : "none";
        }
      }
      return state;
    },
    project(wx, wy, depth = 1) {
      const { s, cx, cy, r } = frame(depth);
      const dx = (wx - cx) * s, dy = (wy - cy) * s;
      const a = (r * Math.PI) / 180;
      return { x: W / 2 + dx * Math.cos(a) - dy * Math.sin(a), y: H / 2 + dx * Math.sin(a) + dy * Math.cos(a), scale: s };
    },
    get state() { return state; },
  };
}

/*
 * callout(parent, cam, { x, y, depth, label, at, until, dx, dy, className })
 * A dot on a world point with a leader and a label, projected through the camera every
 * frame so it rides with the shot at a constant, readable size. Style it per brief via
 * className (the engine only positions it). Returns update(t).
 */
export function callout(parent, cam, { x, y, depth = 1, label, at = 0, until, dx = 80, dy = -40, className = "callout" }) {
  const root = el("div", className, parent);
  Object.assign(root.style, { position: "absolute", left: "0", top: "0", pointerEvents: "none" });
  const line = el("div", "callout-line", root);
  const dot = el("div", "callout-dot", root);
  const tag = el("div", "callout-label", root, label);
  for (const n of [line, dot, tag]) Object.assign(n.style, { position: "absolute", left: "0", top: "0" });
  line.style.transformOrigin = "0 50%";
  return (t) => {
    const p = cam.project(x, y, depth);
    const q = ease.outExpo(prog(t, at, 0.7));
    const out = until != null ? 1 - ease.inCubic(prog(t, until, 0.35)) : 1;
    root.style.opacity = String(q * out);
    const len = Math.hypot(dx, dy);
    dot.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${0.3 + 0.7 * q})`;
    line.style.width = `${len}px`;
    line.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${Math.atan2(dy, dx)}rad) scaleX(${q})`;
    tag.style.transform = `translate(${p.x + dx}px, ${p.y + dy}px) translate(${dx < 0 ? "-100%" : "0"}, -50%) translate(${(1 - q) * (dx < 0 ? 14 : -14)}px, 0)`;
  };
}

/* ── transitions and masks ────────────────────────────── */
/* Reveal a node with a moving clip: dir "left" | "right" | "up" | "down". q in [0,1]. */
export function wipe(node, q, dir = "right") {
  const r = (1 - clamp(q)) * 100;
  const inset = { right: `0 ${r}% 0 0`, left: `0 0 0 ${r}%`, up: `${r}% 0 0 0`, down: `0 0 ${r}% 0` }[dir];
  node.style.clipPath = `inset(${inset})`;
}
/* Circular iris centred on (cx, cy) in the node's own pixels, radius from 0 to cover. */
export function iris(node, q, cx, cy, w, h) {
  const R = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
  node.style.clipPath = `circle(${clamp(q) * R}px at ${cx}px ${cy}px)`;
}
/* SVG path draw: set dash so `q` of the path is visible. Call once with the path to measure. */
export function draw(path, q) {
  const L = path.__len || (path.__len = path.getTotalLength());
  path.style.strokeDasharray = `${L}`;
  path.style.strokeDashoffset = `${L * (1 - clamp(q))}`;
}
/* Point at fraction q along an SVG path (for packets, cursors, vehicles). */
export function along(path, q) {
  const L = path.__len || (path.__len = path.getTotalLength());
  const p = path.getPointAtLength(clamp(q) * L);
  const p2 = path.getPointAtLength(Math.min(L, clamp(q) * L + 1));
  return { x: p.x, y: p.y, angle: (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI };
}

/* ── media ────────────────────────────────────────────── */
/*
 * Play a video clip deterministically from pre-extracted frames (ffmpeg -vf fps=30
 * assets/clip/%05d.jpg). Seeking an HTML <video> per frame is slow and unreliable in a
 * headless render; an image sequence is exact. Preloads every frame for `ready`.
 */
export function imageSequence(parent, { dir, count, fps = 30, start = 0, pattern = (i) => `${String(i + 1).padStart(5, "0")}.jpg`, loop = false, className = "" }) {
  const img = el("img", className, parent);
  const srcs = Array.from({ length: count }, (_, i) => `${dir}/${pattern(i)}`);
  const ready = Promise.all(srcs.map((s) => new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => res(im.decode?.().catch(() => {})); im.src = s; })));
  let last = -1;
  return {
    img,
    ready,
    update(t) {
      let i = Math.floor((t - start) * fps);
      i = loop ? ((i % count) + count) % count : clamp(i, 0, count - 1);
      if (i !== last) { img.src = srcs[i]; last = i; }
    },
  };
}

/* ── voice timing ─────────────────────────────────────── */
/*
 * Wrap the generate_voiceover tool result (or timing.json from voiceover.mjs):
 *   { lines: [{ i, text, start, end, words: [{ w, start, end }] }] }
 * v.line(i) -> line; v.word(i, "phrase") -> film time the phrase starts (throws when
 * absent, so script drift fails at load, not in the render); v.wordTimes(i) -> starts.
 */
export function voiceTiming(data) {
  const lines = data?.lines || [];
  const bare = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  return {
    lines,
    line: (i) => lines[i],
    wordTimes: (i) => (lines[i]?.words || []).map((w) => w.start),
    word(i, phrase) {
      const ln = lines[i];
      const want = String(phrase).split(/\s+/).map(bare).filter(Boolean);
      const ws = ln?.words || [];
      for (let j = 0; j < ws.length; j++) if (want.every((w, k) => bare(ws[j + k]?.w || "") === w)) return ws[j].start;
      throw new Error(`"${phrase}" is not in voice line ${i}: ${ln?.text}`);
    },
    get speechEndsAt() { return Math.max(0, ...lines.map((l) => l.end)); },
  };
}

/* ── the film ─────────────────────────────────────────── */
/*
 * createFilm({ width, height, fps, duration, stage })
 * film.scene({ id, start, end, enter: {type: "cut"|"fade"|"wipe"|"iris", dur, dir, cx, cy}, exit: {type: "cut"|"fade", dur}, rest }, build)
 *   build(layer, scene) runs once and returns update(t, local, scene): set everything from t.
 *   `rest` lists local times (seconds) when text is meant to be at rest; QA checks layout there.
 * film.onFrame(fn): extra per-frame work (a GSAP timeline, a Three.js render, audio-reactive values).
 * film.ready(promise): add something renderFrame must wait for (fonts, images, sequences, models).
 * film.publish(): exposes window.motion.
 */
export function createFilm({ width = 1920, height = 1080, fps = 30, duration, stage = "#stage", background } = {}) {
  const root = typeof stage === "string" ? document.querySelector(stage) : stage;
  Object.assign(root.style, { position: "relative", width: width + "px", height: height + "px", overflow: "hidden" });
  if (background) root.style.background = background;
  const scenes = [];
  const hooks = [];
  const waits = [document.fonts ? document.fonts.ready : Promise.resolve()];
  const film = {
    width, height, fps, duration, root,
    scene(opts, build) {
      const layer = el("div", "scene", root);
      Object.assign(layer.style, { position: "absolute", inset: "0", visibility: "hidden" });
      layer.dataset.scene = opts.id;
      const s = { ...opts, layer, dur: opts.end - opts.start };
      s.update = build(layer, s) || (() => {});
      scenes.push(s);
      return s;
    },
    onFrame(fn) { hooks.push(fn); },
    ready(p) { waits.push(p); },
    renderFrame(t) {
      for (const s of scenes) {
        const local = t - s.start;
        const enter = s.enter || { type: "cut" };
        const exit = s.exit || { type: "cut" };
        const inDur = enter.type === "cut" ? 0 : enter.dur ?? 0.6;
        // Exits are "cut" or "fade" (the fade runs past `end`, under the next scene's entrance).
        const outDur = exit.type === "fade" ? exit.dur ?? 0.6 : 0;
        const visible = local >= 0 && t < s.end + outDur;
        if (!visible) { s.layer.style.visibility = "hidden"; continue; }
        s.layer.style.visibility = "visible";
        const qi = inDur ? ease.inOutCubic(prog(local, 0, inDur)) : 1;
        const qo = outDur ? 1 - ease.inOutCubic(prog(t, s.end, outDur)) : 1;
        s.layer.style.opacity = enter.type === "fade" || exit.type === "fade" ? String(Math.min(enter.type === "fade" ? qi : 1, exit.type === "fade" ? qo : 1)) : "1";
        s.layer.style.clipPath = "none";
        if (enter.type === "wipe" && qi < 1) wipe(s.layer, qi, enter.dir || "right");
        if (enter.type === "iris" && qi < 1) iris(s.layer, qi, enter.cx ?? width / 2, enter.cy ?? height / 2, width, height);
        s.update(t, local, s);
      }
      for (const fn of hooks) fn(t);
    },
    publish() {
      const ordered = [...scenes].sort((a, b) => a.start - b.start);
      const rest = [];
      for (const s of ordered) for (const r of s.rest || []) rest.push(Math.round((s.start + r) * 100) / 100);
      const ready = Promise.all(waits).then(() => film.renderFrame(0));
      window.motion = {
        meta: { width, height, fps, duration, scenes: ordered.map((s) => ({ id: s.id, start: s.start, end: s.end })), rest },
        ready,
        renderFrame: (t) => film.renderFrame(t),
      };
      return window.motion;
    },
  };
  return film;
}
