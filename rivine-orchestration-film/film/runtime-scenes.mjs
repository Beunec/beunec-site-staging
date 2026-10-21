/* Scenes 4 to 6: the run as a trace of checkpoints. Durable state survives a restart,
   a crash and a closed laptop; an approval gate pauses the run; and the plumbing a
   framework leaves to you is part of the runtime. Scenes 4 and 5 share one trace at the
   same coordinates, so the cut between them is invisible (a match cut). */
import { ease, prog, clamp, lerp, el, svg, track, noise } from "./scenes.mjs";
import { V, W, H, P, wt, ls, le, mk, box, enter, caption, stageSvg } from "./core.mjs";

const STEPS = ["Plan", "Research", "Draft", "Model", "Review", "Approve", "Send"];
const TR = P({ x0: 220, x1: 1700, y: 300 }, { x0: 110, x1: 970, y: 560 });
const sx = (k) => lerp(TR.x0, TR.x1, k / (STEPS.length - 1));

/** The shared trace: base line, live line to the head, step nodes, labels, diamonds. */
function buildTrace(parent) {
  const s = stageSvg(parent);
  svg("path", { d: `M ${TR.x0} ${TR.y} L ${TR.x1} ${TR.y}`, stroke: "rgba(20,21,18,.15)", "stroke-width": 6, "stroke-linecap": "round", fill: "none" }, s);
  const live = svg("path", { d: `M ${TR.x0} ${TR.y} L ${TR.x0} ${TR.y}`, stroke: "#6b7a6e", "stroke-width": 6, "stroke-linecap": "round", fill: "none" }, s);
  const dots = STEPS.map((_, k) => box(mk("div", "node", parent), sx(k), TR.y));
  const labels = STEPS.map((n, k) => {
    const l = mk("div", "small", parent, n);
    Object.assign(l.style, { left: `${sx(k) - 80}px`, width: "160px", textAlign: "center", top: `${TR.y + 26}px`, fontSize: P("23px", "20px") });
    return l;
  });
  const diamonds = STEPS.map((_, k) => box(mk("div", "diamond", parent), sx(k), TR.y));
  const pulses = Array.from({ length: 7 }, () => {
    const d = mk("div", "", parent);
    Object.assign(d.style, { width: "10px", height: "10px", margin: "-5px 0 0 -5px", borderRadius: "50%", background: "#dfe8e0" });
    return d;
  });
  const head = mk("div", "", parent);
  Object.assign(head.style, { width: "46px", height: "46px", margin: "-23px 0 0 -23px", borderRadius: "50%", background: "#6b7a6e", boxShadow: "0 0 0 10px rgba(107,122,110,.22)" });
  return {
    s, live, dots, labels, diamonds, head,
    /** pos in step units; stamps: first time each step was reached; col: head colour */
    set(t, pos, stamps, col = "#6b7a6e") {
      const x = lerp(TR.x0, TR.x1, clamp(pos / (STEPS.length - 1)));
      live.setAttribute("d", `M ${TR.x0} ${TR.y} L ${x} ${TR.y}`);
      head.style.transform = `translate(${x}px, ${TR.y}px)`;
      head.style.background = col;
      // signal travelling along the finished part of the run
      const span = Math.max(1, x - TR.x0);
      pulses.forEach((d, k) => {
        const px = TR.x0 + ((t * 260 + k * 170) % Math.max(span, 170));
        d.style.transform = `translate(${Math.min(px, x - 20)}px, ${TR.y}px)`;
        d.style.opacity = span > 60 ? "0.9" : "0";
      });
      dots.forEach((d, k) => d.classList.toggle("on", pos >= k - 0.01));
      diamonds.forEach((d, k) => {
        const st = stamps[k];
        const q = st == null ? 0 : ease.outExpo(prog(t, st, 0.5));
        d.style.opacity = String(q);
        d.style.transform = `rotate(45deg) scale(${lerp(2.2, 1, q)})`;
      });
    },
  };
}

/** First time a head-position track reaches each whole step (sampled at the film's fps). */
function stampTimes(path, t0, t1) {
  const out = [];
  for (let t = t0; t <= t1 + 1e-6; t += 1 / 30) {
    const p = path(t);
    for (let k = 0; k <= Math.floor(p + 1e-6); k++) if (out[k] == null) out[k] = Math.round(t * 1000) / 1000;
  }
  return out;
}

const ticket = (parent, x, y, chipText) => {
  const tk = mk("div", "ticket", parent, null, x, y);
  tk.innerHTML = `<div class="id">RUN 4127</div><div class="name">Q3 launch plan</div><div class="chip">${chipText}</div><div class="bar"><i></i></div>`;
  return { tk, chip: tk.querySelector(".chip"), fill: tk.querySelector(".bar > i") };
};

/* ── 4 · Every step checkpointed; a run survives a restart, a crash, a closed laptop ── */
export function sceneDurable(film) {
  film.scene({ id: "durable", start: 45.3, end: 60.0, rest: [le(5) + 0.3 - 45.3, le(6) + 0.3 - 45.3, 59.4 - 45.3] }, (layer) => {
    mk("div", "field-light", layer);
    const tr = buildTrace(layer);
    const T = ticket(layer, P(140, 72), P(80, 270), "Running");
    const tRs = wt(6, "restart"), tCr = wt(6, "crash"), tLp = wt(6, "closed");
    const path = track([
      { t: 45.3, v: 0 }, { t: 46.3, v: 0 },
      { t: wt(5, "durable") + 0.1, v: 3, ease: "inOutCubic" },
      { t: tRs - 0.05, v: 3.42, ease: "linear" }, { t: tRs, v: 3, ease: "linear" }, { t: tRs + 0.55, v: 3 },
      { t: tCr - 0.05, v: 3.4, ease: "inOutCubic" }, { t: tCr, v: 3, ease: "linear" }, { t: tCr + 0.5, v: 3 },
      { t: 55.4, v: 4, ease: "inOutCubic" }, { t: 60, v: 4.3, ease: "inOutCubic" },
    ]);
    const stamps = stampTimes(path, 45.3, 60);
    // the durable state: one ledger row per checkpoint
    const led = mk("div", "card", layer, null, P(520, 72), P(440, 690), P(880, 936), P(370, 360));
    const lh = mk("div", "label", led, "Durable state · run 4127", 30, 26);
    lh.style.fontSize = "26px";
    const rows = STEPS.slice(0, 5).map((n, k) => {
      const r = mk("div", "mono", led, `✓  checkpoint ${k + 1}  ·  ${n.toLowerCase().padEnd(9, " ")}  saved`, 30, 86 + k * 54);
      r.style.whiteSpace = "pre";
      r.style.color = "#48614e";
      return r;
    });
    // disruptions
    const badge = (txt, col) => {
      const b = mk("div", "chip2", layer, txt);
      Object.assign(b.style, { color: col, borderColor: col, fontSize: "22px" });
      return b;
    };
    const bR = badge("⟲  restart", "#7a8b99"), bC = badge("✕  crash", "#c8553d"), bL = badge("laptop closed · still running", "#48614e");
    const crack = svg("path", { d: "", stroke: "#c8553d", "stroke-width": 5, fill: "none", "stroke-linejoin": "round" }, tr.s);
    // a laptop that closes while the run continues in the cloud
    const lap = mk("div", "", layer, null, P(1430, 760), P(560, 255), 240, 170);
    const ls_ = stageSvg(lap);
    ls_.setAttribute("viewBox", "0 0 240 170"); ls_.setAttribute("width", 240); ls_.setAttribute("height", 170);
    const lid = svg("rect", { x: 30, y: 10, width: 180, height: 120, rx: 10, fill: "#141512" }, ls_);
    svg("rect", { x: 40, y: 20, width: 160, height: 100, rx: 4, fill: "#6b7a6e", opacity: 0.5 }, ls_).setAttribute("class", "scr");
    svg("rect", { x: 10, y: 132, width: 220, height: 16, rx: 8, fill: "#141512" }, ls_);
    const scr = ls_.querySelector(".scr");
    const demo = mk("div", "title", layer, "Resumed at step 4. Not from zero.");
    if (V) box(demo, 72, 1100, 936); else box(demo, 660, 96, 1140);
    demo.style.fontSize = P("56px", "58px");
    const cap5 = caption(layer, 5, { emph: ["a runtime."] });
    const cap6 = caption(layer, 6, { emph: ["closed laptop."] });
    const N = noise(9);
    return (t) => {
      const pos = path(t);
      const grey = t >= tRs && t < tRs + 0.55, red = t >= tCr && t < tCr + 0.5;
      tr.set(t, pos, stamps, grey ? "#9aa39c" : red ? "#c8553d" : "#6b7a6e");
      enter(T.tk, t, 45.5, { dur: 0.6, y: 20 });
      T.chip.textContent = grey ? "Restarting" : red ? "Recovering" : t > 55.4 ? "Resumed ✓" : "Running";
      T.fill.style.transform = `scaleX(${clamp(pos / 6)})`;
      enter(led, t, wt(5, "checkpointed") - 0.4, { dur: 0.7, y: 30 });
      rows.forEach((r, k) => enter(r, t, stamps[k] ?? 99, { dur: 0.45, x: -16, y: 0 }));
      const hx = lerp(TR.x0, TR.x1, clamp(pos / 6));
      const by = TR.y - P(110, 100);
      [[bR, tRs], [bC, tCr], [bL, tLp]].forEach(([b, tb]) => {
        box(b, Math.min(hx - 40, W - P(520, 420)), by);
        enter(b, t, tb - 0.05, { dur: 0.35, y: 12, s: 0.9, out: tb + (b === bL ? 1.6 : 0.9), outDur: 0.3 });
      });
      // the crack: a jagged break right where the head was
      const cx = lerp(TR.x0, TR.x1, 3.4 / 6);
      const j = Array.from({ length: 6 }, (_, k) => `${cx + (k % 2 ? 14 : -14) + N(k) * 4} ${TR.y - 60 + k * 24}`).join(" L ");
      crack.setAttribute("d", `M ${j}`);
      crack.style.opacity = String(t >= tCr ? 1 - clamp(prog(t, tCr + 0.7, 0.6)) : 0);
      // the lid closes; the screen goes dark; the run does not stop
      const lq = ease.inOutCubic(prog(t, tLp - 0.1, 0.7));
      enter(lap, t, tLp - 0.6, { dur: 0.5, y: 20, out: 58.6, outDur: 0.5 });
      lid.setAttribute("transform", `translate(0 ${120 * lq}) scale(1 ${1 - 0.92 * lq})`);
      scr.setAttribute("transform", `translate(0 ${120 * lq}) scale(1 ${1 - 0.92 * lq})`);
      scr.style.opacity = String(0.5 * (1 - lq));
      enter(demo, t, 56.0, { dur: 0.8, y: 24 });
      cap5(t); cap6(t);
    };
  });
}

/* ── 5 · When a step needs a person, the run pauses for approval, then continues ── */
export function sceneApproval(film) {
  film.scene({ id: "approval", start: 60.0, end: 73.4, rest: [le(7) + 0.3 - 60, le(8) + 0.3 - 60, 72.6 - 60] }, (layer) => {
    mk("div", "field-light", layer);
    const wrap = mk("div", "", layer, null, 0, 0, W, H);
    wrap.style.transformOrigin = `${W / 2}px ${P(380, 700)}px`;
    const tr = buildTrace(wrap);
    const T = ticket(wrap, P(140, 72), P(80, 270), "Running");
    const tClick = ls(8) - 0.25;
    const path = track([{ t: 60, v: 4.3 }, { t: 61.6, v: 5, ease: "inOutCubic" }, { t: tClick + 0.35, v: 5 }, { t: tClick + 2.4, v: 6, ease: "inOutCubic" }]);
    const stamps = [60, 60, 60, 60, 60, 61.6, tClick + 2.4];
    // the gate at step 6
    const gx = sx(5);
    const gate = mk("div", "", wrap, null, gx - 7, TR.y - 96, 14, 82);
    Object.assign(gate.style, { borderRadius: "8px", background: "#141512" });
    const who = mk("div", "", wrap, null, gx - 24, TR.y - 152, 48, 48);
    who.innerHTML = `<svg viewBox="0 0 48 48" width="48" height="48"><circle cx="24" cy="16" r="9" fill="#141512"/><path d="M8 44c2-10 9-15 16-15s14 5 16 15" fill="#141512"/></svg>`;
    const ring = mk("div", "", wrap, null, gx, TR.y, 0, 0);
    Object.assign(ring.style, { width: "36px", height: "36px", margin: "-18px 0 0 -18px", borderRadius: "50%", border: "3px solid #6b7a6e" });
    // the approval card
    const card = mk("div", "card", layer, null, P(560, 90), P(420, 660), P(800, 900), P(380, 410));
    card.innerHTML = `
      <div class="kick" style="position:absolute;left:34px;top:32px;color:#c08a3e">Approval needed · step 6</div>
      <div class="title" style="position:absolute;left:34px;top:70px;right:34px;font-size:40px">Send the signed contract to Acme Ltd.</div>
      <div class="small" style="position:absolute;left:34px;top:${P(178, 188)}px">Action · email with 1 attachment</div>
      <div class="small" style="position:absolute;left:34px;top:${P(214, 224)}px">Requested by · TaskForce</div>
      <div class="deny" style="position:absolute;left:34px;bottom:30px;height:62px;width:${P(200, 260)}px;border-radius:14px;border:2px solid rgba(20,21,18,.2);display:flex;align-items:center;justify-content:center;font:600 24px/1 Inter">Deny</div>
      <div class="ok" style="position:absolute;right:34px;bottom:30px;height:62px;width:${P(300, 380)}px;border-radius:14px;background:#141512;color:#fff;display:flex;align-items:center;justify-content:center;font:600 24px/1 Inter">Approve &amp; run</div>`;
    const ok = card.querySelector(".ok");
    const okX = P(560 + 800 - 34 - 150, 90 + 900 - 34 - 190), okY = P(420 + 380 - 30 - 31, 660 + 410 - 30 - 31);
    const cur = mk("div", "", layer, null, 0, 0, 44, 44);
    cur.innerHTML = `<svg viewBox="0 0 44 44" width="44" height="44"><path d="M8 4 L8 36 L16 28 L22 41 L28 38 L22 26 L33 26 Z" fill="#fff" stroke="#141512" stroke-width="3" stroke-linejoin="round"/></svg>`;
    const burst = mk("div", "", layer, null, okX, okY, 0, 0);
    Object.assign(burst.style, { width: "80px", height: "80px", margin: "-40px 0 0 -40px", borderRadius: "50%", border: "3px solid #6b7a6e" });
    // the full trail, recorded
    const trail = mk("div", "card", layer, null, P(560, 72), P(430, 690), P(800, 936), P(330, 330));
    mk("div", "label", trail, "Run trail · 4127", 30, 26).style.fontSize = "26px";
    const lines = ["14:02  paused at step 6 · waiting for you", "14:06  approved by you", "14:06  resumed from checkpoint 6", "14:07  contract sent · receipt saved"].map((x, k) => {
      const r = mk("div", "mono", trail, x, 30, 86 + k * 52);
      r.style.whiteSpace = "pre";
      return r;
    });
    const cap7 = caption(layer, 7, { emph: ["waits for approval."] });
    const cap8 = caption(layer, 8, { emph: ["full trail recorded."] });
    const tTrail = wt(8, "trail");
    return (t) => {
      const pos = path(t);
      const paused = t >= 61.6 && t < tClick + 0.35;
      tr.set(t, pos, stamps, paused ? "#c08a3e" : "#6b7a6e");
      T.chip.textContent = paused ? "Paused · needs you" : t > tClick + 2.4 ? "Done ✓" : "Running";
      T.chip.style.background = paused ? "rgba(192,138,62,.16)" : "";
      T.chip.style.color = paused ? "#8a5f22" : "";
      T.fill.style.transform = `scaleX(${clamp(pos / 6)})`;
      // the gate opens on approval
      const open = ease.inOutCubic(prog(t, tClick + 0.15, 0.5));
      gate.style.transform = `translateY(${-150 * open})`;
      gate.style.opacity = String(1 - open);
      who.style.opacity = String(clamp(prog(t, 60.6, 0.4)) * (1 - open));
      const pul = paused ? ((t - 61.6) % 1.4) / 1.4 : 0;
      ring.style.transform = `scale(${1 + pul * 2.2})`;
      ring.style.opacity = String(paused ? 1 - pul : 0);
      enter(card, t, wt(7, "pauses") - 0.3, { dur: 0.7, y: 60, out: tClick + 0.45, outDur: 0.45, to: { y: 60 } });
      // the cursor comes in, clicks Approve
      const cq = ease.inOutCubic(prog(t, tClick - 1.3, 1.2));
      const fx = P(1700, 940), fy = P(1000, 1500);
      box(cur, lerp(fx, okX, cq) - 8, lerp(fy, okY, cq) - 4);
      cur.style.opacity = String(clamp(prog(t, tClick - 1.4, 0.3)) * (1 - clamp(prog(t, tClick + 0.5, 0.3))));
      const press = t >= tClick && t < tClick + 0.16;
      ok.style.transform = press ? "scale(.95)" : "none";
      const b = prog(t, tClick, 0.6);
      burst.style.transform = `scale(${0.4 + b * 1.6})`;
      burst.style.opacity = String(t >= tClick ? 1 - b : 0);
      enter(trail, t, tTrail - 0.9, { dur: 0.7, y: 30 });
      lines.forEach((l, k) => enter(l, t, tTrail - 0.6 + k * 0.35, { dur: 0.45, x: -16, y: 0 }));
      // pull back: the whole run, every step on record
      wrap.style.transform = `scale(${lerp(1, 0.94, ease.inOutCubic(prog(t, 69.6, 3)))})`;
      cap7(t); cap8(t);
    };
  });
}

/* ── 6 · With a framework you still build the plumbing; in Rivine it is the runtime ── */
export function sceneBuild(film) {
  film.scene({ id: "build", start: 72.9, end: 79.4, enter: { type: "wipe", dur: 0.6, dir: "right" }, rest: [le(9) + 0.3 - 72.9] }, (layer) => {
    mk("div", "field-light", layer);
    const ITEMS = ["Queue", "Retries", "Credentials", "Billing", "Timeouts", "Approvals"];
    const cw = P(660, 450), lx = P(170, 72), rx = P(1090, 558), y0 = P(250, 400), rh = 86;
    const hl = mk("div", "label", layer, P("With a framework, you build it", "You build it"), lx, y0 - 76);
    const hr = mk("div", "label", layer, P("With Rivine, it is the runtime", "Built into Rivine"), rx, y0 - 76);
    [hl, hr].forEach((h) => (h.style.fontSize = P("32px", "30px")));
    const tw = [wt(9, "queue"), wt(9, "retries"), wt(9, "credentials"), wt(9, "bill")];
    const times = [...tw, tw[3] + 0.4, tw[3] + 0.75];
    const R = [-1.6, 1.2, -0.8, 1.9, -1.3, 0.9];
    const raw = ITEMS.map((n, k) => mk("div", "block raw", layer, n, lx + (k % 2 ? 18 : 0), y0 + k * rh, cw - 30));
    const built = ITEMS.map((n, k) => {
      const b = mk("div", "block built", layer, null, rx, y0 + k * rh, cw);
      b.innerHTML = `${n}<b>✓</b>`;
      return b;
    });
    const cap9 = caption(layer, 9, { emph: ["you still build"] });
    return (t) => {
      enter(hl, t, 73.0, { dur: 0.6, y: 16 });
      enter(hr, t, 73.25, { dur: 0.6, y: 16 });
      raw.forEach((b, k) => {
        const q = enter(b, t, times[k] - 0.15, { dur: 0.55, x: -60, y: 0, r: R[k] * 4 });
        b.style.transform += ` rotate(${R[k] * q}deg)`;
      });
      built.forEach((b, k) => {
        enter(b, t, 73.4 + k * 0.05, { dur: 0.6, y: 10 });
        const lit = clamp(prog(t, times[k] - 0.1, 0.35));
        b.style.opacity = String(Math.min(Number(b.style.opacity), 0.32 + 0.68 * lit));
        b.querySelector("b").style.opacity = String(lit);
      });
      cap9(t);
    };
  });
}
