/* Shared helpers for the Rivine film: format, timing lookups, the narration
   written on screen at the speed it is spoken, and small motion utilities.
   Every function here derives what it draws from t alone. */
import { ease, prog, clamp, lerp, el } from "./scenes.mjs";

export const V = new URLSearchParams(location.search).get("format") === "vertical";
document.documentElement.dataset.format = V ? "vertical" : "wide";
export const W = V ? 1080 : 1920;
export const H = V ? 1920 : 1080;
/** pick(wide, vertical) */
export const P = (w, v) => (V ? v : w);

export const TM = await (await fetch("./timing.json")).json();
export const LINES = TM.lines;
const bare = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Film time at which `phrase` is spoken in line i (searching from word index `from`). */
export function wt(i, phrase, from = 0) {
  const ws = LINES[i].words;
  const want = String(phrase).split(/\s+/).map(bare).filter(Boolean);
  for (let j = from; j < ws.length; j++) if (want.every((w, k) => bare(ws[j + k]?.w || "") === w)) return ws[j].start;
  throw new Error(`"${phrase}" not in line ${i}: ${LINES[i].text}`);
}
export const ls = (i) => LINES[i].start;
export const le = (i) => LINES[i].end;

/** Place a node: left/top/width/height in px (undefined values are skipped). */
export function box(node, x, y, w, h) {
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  if (w != null) node.style.width = `${w}px`;
  if (h != null) node.style.height = `${h}px`;
  return node;
}
export function mk(tag, cls, parent, text, x, y, w, h) {
  const n = el(tag, cls, parent, text);
  n.style.position = "absolute";
  if (x != null) box(n, x, y, w, h);
  return n;
}

/**
 * Entrance and exit from t. Returns visibility (0..1).
 * from: { x, y, s, r, blur } offsets the node starts from; out: time it leaves (optional).
 */
export function enter(node, t, start, { dur = 0.7, x = 0, y = 26, s = 1, r = 0, blur = 0, e = "outExpo", out, outDur = 0.45, to = { y: -16 } } = {}) {
  const f = typeof e === "function" ? e : ease[e];
  const q = f(prog(t, start, dur));
  let ox = x * (1 - q), oy = y * (1 - q), os = lerp(s, 1, q), or = r * (1 - q), ob = blur * (1 - q), op = q;
  if (out != null) {
    const r2 = ease.inCubic(prog(t, out, outDur));
    ox += (to.x ?? 0) * r2; oy += (to.y ?? 0) * r2; os *= lerp(1, to.s ?? 1, r2); op *= 1 - r2;
  }
  node.style.transform = `translate(${ox}px, ${oy}px) rotate(${or}deg) scale(${os})`;
  node.style.opacity = String(clamp(op));
  node.style.filter = ob > 0.05 ? `blur(${ob}px)` : "none";
  node.style.visibility = op > 0.003 ? "visible" : "hidden";
  return clamp(op);
}

/** A number counting to its exact value between t0 and t0+dur. */
export const count = (t, t0, dur, a, b) => Math.round(lerp(a, b, ease.outCubic(prog(t, t0, dur))));

/**
 * The narration on screen. Each word rises out of its own mask at the moment it is
 * spoken; phrases in `emph` get the sage underline once their last word lands.
 * The block leaves at `out` (default: shortly before the next line).
 */
export function caption(layer, i, { emph = [], dark = false, out, pos } = {}) {
  const ln = LINES[i];
  const cap = mk("div", "cap" + (dark ? " dark" : ""), layer);
  Object.assign(cap.style, pos || (V ? { left: "72px", right: "72px", bottom: "400px", top: "auto" } : { left: "140px", width: "1400px", bottom: "92px", top: "auto" }));
  cap.setAttribute("aria-label", ln.text);
  const marks = new Set();
  const groups = [];
  for (const ph of emph) {
    const st = ln.words.findIndex((_, j) => ph.split(/\s+/).map(bare).every((w, k) => bare(ln.words[j + k]?.w || "") === w));
    if (st < 0) throw new Error(`emphasis "${ph}" not in line ${i}`);
    const n = ph.split(/\s+/).length;
    for (let k = 0; k < n; k++) marks.add(st + k);
    groups.push({ st, n });
  }
  const parts = [];
  const unders = [];
  let j = 0;
  while (j < ln.words.length) {
    const g = groups.find((x) => x.st === j);
    const host = g ? mk("span", "em", cap) : cap;
    if (g) host.style.position = "relative";
    const end = g ? j + g.n : j + 1;
    for (; j < end; j++) {
      const outer = el("span", "", host);
      Object.assign(outer.style, { display: "inline-block", overflow: "hidden", verticalAlign: "bottom", padding: "0.06em 0 0.14em", margin: "-0.06em 0 -0.14em" });
      const inner = el("span", "", outer, ln.words[j].w);
      inner.style.display = "inline-block";
      parts.push({ n: inner, t: ln.words[j].start });
      if (j < end - 1 || !g) host.appendChild(document.createTextNode(" "));
    }
    if (g) {
      const u = el("i", "", host);
      unders.push({ u, t: ln.words[end - 1].start + 0.25 });
      cap.appendChild(document.createTextNode(" "));
    }
  }
  const outAt = out ?? (LINES[i + 1] ? Math.min(LINES[i + 1].start - 0.45, ln.end + 3.2) : ln.end + 1.4);
  return (t) => {
    const vis = t >= ln.start - 0.2 && t < outAt + 0.5;
    cap.style.visibility = vis ? "visible" : "hidden";
    if (!vis) return;
    const leave = ease.inCubic(prog(t, outAt, 0.42));
    cap.style.opacity = String(1 - leave);
    cap.style.transform = `translateY(${-18 * leave}px)`;
    for (const p of parts) {
      const q = ease.outExpo(prog(t, p.t - 0.06, 0.5));
      p.n.style.transform = `translateY(${(1 - q) * 104}%)`;
      p.n.style.opacity = String(0.15 + 0.85 * q);
    }
    for (const { u, t: ut } of unders) u.style.transform = `scaleX(${ease.outExpo(prog(t, ut, 0.7))})`;
  };
}

/** SVG helper with a viewBox the size of the stage, so paths use stage pixels. */
export function stageSvg(parent) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("width", W);
  s.setAttribute("height", H);
  s.setAttribute("viewBox", `0 0 ${W} ${H}`);
  Object.assign(s.style, { position: "absolute", left: "0", top: "0", overflow: "visible" });
  parent.appendChild(s);
  return s;
}
