/* Scenes 8 to 10: one runtime under many engines; the result is a deliverable; and
   Aselius is built on it. Engines dock onto the runtime plate on the word that names
   them; work is routed through one shared state; files materialise on their words. */
import { ease, prog, clamp, lerp, el, svg, draw } from "./scenes.mjs";
import { V, W, H, P, wt, ls, le, mk, box, enter, caption, stageSvg } from "./core.mjs";

const ENGINES = [
  ["TaskForce", "Work across your apps"], ["Research", "Sourced reports"], ["Code", "Working software"], ["Cicero", "Legal drafting & review"],
  ["Creative", "Images, video, audio"], ["Confluence", "Forecasts & scenarios"], ["Assist", "Surgical edits"], ["Browse", "Your own browser tabs"],
];

function plateEl(parent, x, y, w, h, left, right) {
  const p = mk("div", "plate", parent, null, x, y, w, h);
  p.innerHTML = `<div class="kick" style="position:absolute;left:30px;top:${h / 2 - 11}px">${left}</div><div class="small" style="position:absolute;right:30px;top:${h / 2 - 15}px;color:#9aa39c">${right}</div>`;
  return p;
}

/* ── 8 · One runtime, many engines; routing with one shared state ───────────── */
export function sceneEngines(film) {
  film.scene({ id: "engines", start: 109.6, end: 133.2, enter: { type: "iris", dur: 0.9, cx: P(960, 540), cy: P(560, 760) }, rest: [le(10) + 0.3 - 109.6, le(11) + 0.3 - 109.6, 132.2 - 109.6] }, (layer) => {
    mk("div", "field-light", layer);
    const ew = P(380, 440), eh = 132;
    const pos = ENGINES.map((_, k) => P({ x: 140 + (k % 4) * 420, y: 100 + Math.floor(k / 4) * 200 }, { x: k % 2 ? 568 : 72, y: 290 + Math.floor(k / 2) * 190 }));
    const PL = P({ x: 160, y: 580, w: 1600, h: 92 }, { x: 72, y: 1080, w: 936, h: 92 });
    const s = stageSvg(layer);
    const pins = pos.map((p) => svg("path", { d: `M ${p.x + ew / 2} ${p.y + eh} L ${p.x + ew / 2} ${PL.y}`, stroke: "rgba(20,21,18,.22)", "stroke-width": 3, "stroke-dasharray": "2 8", "stroke-linecap": "round", fill: "none" }, s));
    const plate = plateEl(layer, PL.x, PL.y, PL.w, PL.h, "Rivine runtime", "one shared state");
    const flow = mk("div", "", plate, null, 0, PL.h - 8, PL.w, 8);
    Object.assign(flow.style, { borderRadius: "0 0 22px 22px", background: "linear-gradient(90deg, rgba(107,122,110,0) 0%, #8fa592 50%, rgba(107,122,110,0) 100%)", backgroundSize: "40% 100%", backgroundRepeat: "no-repeat" });
    const engines = ENGINES.map(([n, d], k) => {
      const e = mk("div", "engine", layer, null, pos[k].x, pos[k].y, ew, eh);
      e.innerHTML = `<div class="n">Rivine ${n}</div><div class="d">${d}</div><div class="led"></div>`;
      return e;
    });
    const tEng = ENGINES.map(([n], k) => wt(10, n));
    // routed work: tickets travel the plate, then up a pin into an engine
    const jobs = [[1, 124.4], [2, 124.9], [0, 125.4], [3, 125.9], [5, 126.4]].map(([k, t0]) => {
      const j = mk("div", "", layer, null, 0, 0, 26, 26);
      Object.assign(j.style, { margin: "-13px 0 0 -13px", borderRadius: "7px", background: "#6b7a6e", boxShadow: "0 6px 14px -6px rgba(20,21,18,.5)" });
      return { j, k, t0 };
    });
    // one run hops Research → Code → TaskForce, carrying its state with it
    const hop = mk("div", "chip2", layer, "run 4127 · context kept");
    Object.assign(hop.style, { background: "#141512", color: "#ecefe9", borderColor: "#141512", fontSize: "20px", padding: "10px 16px" });
    const hopPath = [1, 2, 0];
    const capA = caption(layer, 10, { emph: ["many engines:"] });
    const capB = caption(layer, 11, { emph: ["one shared state."] });
    const ex = (k) => pos[k].x + ew / 2, py = PL.y + PL.h / 2;
    return (t) => {
      enter(plate, t, 110.0, { dur: 0.9, y: 50 });
      flow.style.backgroundPosition = `${((t * 0.35) % 1.4) * 100 - 20}% 0`;
      flow.style.opacity = String(clamp(prog(t, wt(11, "shared") - 0.3, 0.6)) * 0.9 + 0.1);
      engines.forEach((e) => delete e.dataset.hit);
      engines.forEach((e, k) => {
        enter(e, t, tEng[k] - 0.12, { dur: 0.7, y: -50, s: 0.92, e: (x) => ease.outBack(x, 1.3) });
        e.querySelector(".led").style.opacity = String(clamp(prog(t, tEng[k] + 0.3, 0.3)));
        draw(pins[k], ease.outCubic(prog(t, tEng[k] + 0.1, 0.5)));
      });
      jobs.forEach(({ j, k, t0 }) => {
        const a = ease.inOutCubic(prog(t, t0, 1.0)), b = ease.inOutCubic(prog(t, t0 + 1.0, 0.7));
        const x = lerp(PL.x + 40, ex(k), a), y = b > 0 ? lerp(py, pos[k].y + eh, b) : py;
        j.style.transform = `translate(${x}px, ${y}px)`;
        j.style.opacity = String(clamp(prog(t, t0, 0.2)) * (1 - clamp(prog(t, t0 + 1.6, 0.3))));
        if (t >= t0 + 1.6 && t < t0 + 2.5) engines[k].dataset.hit = String(t0);
      });
      // the hop: the same run moves Research → Code → TaskForce without losing context
      const h0 = 127.8;
      const legs = [[1, 2, h0], [2, 0, h0 + 1.8]];
      let hx = ex(1), hy = pos[1].y;
      for (const [a, c, s0] of legs) {
        if (t >= s0) {
          const f = ease.inOutCubic(prog(t, s0, 1.2));
          hx = lerp(ex(a), ex(c), f);
          hy = lerp(pos[a].y, pos[c].y, f) - 46 * Math.sin(f * Math.PI);
        }
      }
      hop.style.left = `${hx - P(150, 140)}px`;
      hop.style.top = `${hy - 58}px`;
      engines.forEach((e) => (e.style.boxShadow = e.dataset.hit ? "0 0 0 4px rgba(107,122,110,.5), 0 22px 46px -26px rgba(20,21,18,.35)" : ""));
      enter(hop, t, h0 - 0.3, { dur: 0.5, y: 12, out: 132.4, outDur: 0.4 });
      capA(t); capB(t);
    };
  });
}

/* ── 9 · A deliverable, not a chat reply ───────────────────────────────────── */
export function sceneDeliverables(film) {
  film.scene({ id: "deliverables", start: 132.6, end: 147.6, enter: { type: "wipe", dur: 0.6, dir: "right" }, rest: [le(12) + 0.3 - 132.6, 146.4 - 132.6] }, (layer) => {
    mk("div", "field-light", layer);
    const bub = mk("div", "bubble", layer, "Here is a summary of what you could do for the Q3 launch…", P(700, 280), P(130, 270));
    const strike = mk("div", "", bub, null, 20, 48, 480, 5);
    Object.assign(strike.style, { background: "#c8553d", borderRadius: "4px", transformOrigin: "left" });
    const fw = P(330, 430), fh = P(380, 360);
    const fpos = [0, 1, 2, 3].map((k) => P({ x: 180 + k * 400, y: 300 }, { x: k % 2 ? 578 : 72, y: 470 + Math.floor(k / 2) * 390 }));
    const file = (k, name, ext, inner) => {
      const f = mk("div", "file", layer, null, fpos[k].x, fpos[k].y, fw, fh);
      f.innerHTML = `${inner}<div class="ft">${name}<span>${ext}</span></div>`;
      return f;
    };
    const lines = (n, top, ws) => Array.from({ length: n }, (_, k) => `<div style="position:absolute;left:26px;top:${top + k * 30}px;width:${ws[k % ws.length]}px;height:11px;border-radius:4px;background:rgba(20,21,18,.18)"></div>`).join("");
    const doc = file(0, "Q3 launch plan", ".docx", `<div style="position:absolute;left:26px;top:28px;width:190px;height:20px;border-radius:5px;background:#141512"></div>${lines(7, 76, [240, 220, 260, 180, 250])}`);
    const cells = Array.from({ length: 6 * 4 }, (_, k) => {
      const r = Math.floor(k / 4), c = k % 4, hl = r === 3 && c === 3;
      const v = r === 0 ? ["Market", "Q1", "Q2", "Q3"][c] : c === 0 ? ["US", "UK", "DE", "FR", "JP"][r - 1] : String(120 + ((k * 37) % 180));
      return `<div style="position:absolute;left:${16 + c * ((fw - 32) / 4)}px;top:${18 + r * 46}px;width:${(fw - 32) / 4 - 4}px;height:40px;border-radius:6px;background:${hl ? "#6b7a6e" : r === 0 ? "#141512" : "rgba(20,21,18,.06)"};color:${hl || r === 0 ? "#fff" : "#141512"};font:600 17px/40px Inter;text-align:center">${v}</div>`;
    }).join("");
    const sheet = file(1, "Launch model", ".xlsx", cells);
    const bars = [70, 120, 95, 160].map((h, k) => `<div style="position:absolute;left:${40 + k * 56}px;bottom:96px;width:36px;height:${h}px;border-radius:5px 5px 0 0;background:${k === 3 ? "#6b7a6e" : "#141512"}"></div>`).join("");
    const deck = file(2, "Board deck", ".pptx", `<div style="position:absolute;left:26px;top:28px;width:200px;height:22px;border-radius:5px;background:#141512"></div><div style="position:absolute;left:26px;top:62px;width:140px;height:11px;border-radius:4px;background:rgba(20,21,18,.2)"></div>${bars}`);
    const code = file(3, "launch-site", "/app.tsx", `<div style="position:absolute;inset:0 0 56px 0;background:#121513"></div>` +
      [["#a9c0ae", 160], ["#7a8b99", 230], ["#ecefe9", 190], ["#c08a3e", 120], ["#ecefe9", 210], ["#a9c0ae", 150], ["#7a8b99", 180]].map(([c, w], k) => `<div style="position:absolute;left:${26 + (k % 3 === 1 ? 24 : 0)}px;top:${28 + k * 34}px;width:${w}px;height:12px;border-radius:4px;background:${c}"></div>`).join(""));
    const files = [doc, sheet, deck, code];
    const tF = [wt(12, "documents"), wt(12, "spreadsheets"), wt(12, "decks"), wt(12, "working")];
    const bundle = mk("div", "ticket", layer, null, P(780, 360), P(830, 1320));
    bundle.innerHTML = `<div class="id">RUN 4127</div><div class="name">Q3 launch plan</div><div class="chip">Done ✓ · 4 files</div><div class="bar"><i></i></div>`;
    const line = mk("div", "title", layer, "Open it, edit it, ship it.");
    if (V) box(line, 72, 280, 936); else box(line, 140, 120, 900);
    line.style.fontSize = P("56px", "60px");
    const cap = caption(layer, 12, { emph: ["a deliverable,"] });
    const tNot = wt(12, "not");
    return (t) => {
      enter(bub, t, 133.0, { dur: 0.6, y: 20, out: tF[0] - 0.35, outDur: 0.5, to: { y: -30, s: 0.85 } });
      strike.style.transform = `scaleX(${ease.outExpo(prog(t, tNot + 0.1, 0.5))})`;
      // the files gather into one deliverable at the end
      const g = ease.inOutCubic(prog(t, 141.0, 1.6));
      files.forEach((f, k) => {
        enter(f, t, tF[k] - 0.15, { dur: 0.7, y: 60, s: 0.9, r: [-3, 2, -2, 3][k] });
        const cx = P(960, 540) - fw / 2 + (k - 1.5) * P(36, 28), cy = P(300, 520) + k * P(10, 14);
        f.style.left = `${lerp(fpos[k].x, cx, g)}px`;
        f.style.top = `${lerp(fpos[k].y, cy, g)}px`;
        f.style.zIndex = String(k);
      });
      enter(bundle, t, 142.2, { dur: 0.7, y: 30 });
      bundle.style.zIndex = "10";
      bundle.querySelector(".bar > i").style.transform = "scaleX(1)";
      enter(line, t, 142.6, { dur: 0.8, y: 20 });
      cap(t);
    };
  });
}

/* ── 10 · Aselius is built on Rivine; end card ─────────────────────────────── */
export function sceneFinale(film) {
  film.scene({ id: "finale", start: 146.9, end: 155.0, enter: { type: "fade", dur: 0.6 }, rest: [le(13) + 0.3 - 146.9, 154.4 - 146.9] }, (layer) => {
    mk("div", "field-light", layer);
    const st = mk("div", "", layer, null, 0, 0, W, H);
    st.style.transformOrigin = `${W / 2}px ${P(440, 760)}px`;
    // three layers: Aselius on the engines on the runtime
    const shotW = P(900, 936), shotH = Math.round(shotW * 900 / 1440);
    const shot = mk("div", "card", st, null, (W - shotW) / 2, P(50, 330), shotW, shotH);
    shot.style.overflow = "hidden";
    const img = el("img", "", shot);
    img.src = "./assets/aselius-workspace.webp";
    Object.assign(img.style, { width: "100%", height: "100%", display: "block" });
    film.ready(img.decode().catch(() => {}));
    const tagA = mk("div", "chip2", st, "Aselius · the workspace you use");
    box(tagA, (W - shotW) / 2 + 20, P(50, 330) + 20);
    const rowY = P(50, 330) + shotH + P(22, 30);
    const chips = ENGINES.map(([n], k) => {
      const per = P(8, 4), cw = P(186, 222);
      const c = mk("div", "chip2", st, n, 0, 0, cw);
      c.style.textAlign = "center";
      c.style.fontSize = "21px";
      const x0 = (W - per * (cw + 10) + 10) / 2;
      box(c, x0 + (k % per) * (cw + 10), rowY + Math.floor(k / per) * 62);
      return c;
    });
    const plY = rowY + P(70, 138);
    const plate = plateEl(st, (W - P(1560, 936)) / 2, plY, P(1560, 936), 84, "Rivine runtime", "orchestration · state · recovery · approvals");
    if (V) plate.querySelector(".small").textContent = "orchestration · state · approvals";
    // end card
    const end = mk("div", "", layer, null, 0, 0, W, H);
    end.style.background = "#f4f4f0";
    const word = mk("div", "big", end, "Rivine");
    Object.assign(word.style, { left: "0", width: `${W}px`, textAlign: "center", top: `${P(300, 640)}px`, fontSize: P("170px", "170px") });
    const tl = mk("div", "title", end, P("The orchestration runtime behind every Rivine engine.", "The orchestration runtime behind every Rivine engine."));
    Object.assign(tl.style, { left: `${P(260, 72)}px`, width: `${P(1400, 936)}px`, textAlign: "center", top: `${P(500, 860)}px`, fontSize: P("46px", "50px") });
    const url = mk("div", "label", end, "Built into Aselius · aselius.beunec.com");
    Object.assign(url.style, { left: "0", width: `${W}px`, textAlign: "center", top: `${P(640, 1060)}px`, color: "#6b7a6e" });
    const logo = el("img", "", end);
    logo.src = "./assets/aselius-logo-icon.png";
    Object.assign(logo.style, { position: "absolute", width: "64px", height: "64px", left: `${W / 2 - 32}px`, top: `${P(722, 1150)}px` });
    film.ready(logo.decode().catch(() => {}));
    const cap = caption(layer, 13, { emph: ["built on Rivine."], out: 150.5 });
    const tRv = wt(13, "Rivine");
    return (t) => {
      enter(shot, t, 147.0, { dur: 0.8, y: 50 });
      enter(tagA, t, 147.6, { dur: 0.5, y: 10 });
      chips.forEach((c, k) => enter(c, t, 147.5 + k * 0.05, { dur: 0.5, y: 24 }));
      enter(plate, t, 148.0, { dur: 0.7, y: 30 });
      const glowQ = clamp(prog(t, tRv, 0.5)) * (1 - clamp(prog(t, 150.2, 0.4)));
      plate.style.boxShadow = `0 0 0 ${6 * glowQ}px rgba(107,122,110,.5), 0 30px 70px -30px rgba(0,0,0,.45)`;
      st.style.transform = `scale(${lerp(1, 0.96, ease.inOutCubic(prog(t, 147, 3.5)))})`;
      const e = ease.inOutCubic(prog(t, 150.6, 0.8));
      end.style.opacity = String(e);
      end.style.visibility = e > 0 ? "visible" : "hidden";
      enter(word, t, 150.9, { dur: 1.0, s: 0.9, y: 0, blur: 10 });
      enter(tl, t, 151.6, { dur: 0.8, y: 18 });
      enter(url, t, 152.2, { dur: 0.7, y: 14 });
      enter(logo, t, 152.6, { dur: 0.6, s: 0.8, y: 0 });
      cap(t);
    };
  });
}
