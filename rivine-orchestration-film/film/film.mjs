/* Rivine: the orchestration runtime. A film in ten scenes, one timeline, two formats
   (?format=vertical recomposes every scene for 1080x1920). The recorded narration is the
   clock: timing.json places each line, and every visual beat lands on a spoken word.
   World: precise runtime instruments (a run ticket, a trace with checkpoints, a state
   ledger, an approval gate, an engine dock) on a calm canvas; charcoal for the problem
   and for "how a run works". Signature move: the sage trace drawing a run's path and
   stamping a checkpoint diamond at every step. */
import { createFilm, ease, prog, clamp, lerp, el, svg, draw, along, rng, noise, spring } from "./scenes.mjs";
import { V, W, H, P, TM, wt, ls, le, mk, box, enter, count, caption, stageSvg } from "./core.mjs";
import { sceneDurable, sceneApproval, sceneBuild } from "./runtime-scenes.mjs";
import { sceneHow } from "./how-scenes.mjs";
import { sceneEngines, sceneDeliverables, sceneFinale } from "./engine-scenes.mjs";

const film = createFilm({ width: W, height: H, fps: 30, duration: TM.duration, background: "#0f1110" });
const C = { x: P(960, 540), y: P(420, 760) }; // the frame's focal centre

/* ── 1 · Every agent needs somewhere to run (dark, chaos → ring) ─────────────── */
film.scene({ id: "open", start: 0, end: 11.2, rest: [le(0) + 0.4] }, (layer) => {
  mk("div", "field-dark", layer);
  const glow = mk("div", "glow", layer);
  box(glow, C.x - 560, C.y - 560, 1120, 1120);
  const wrap = mk("div", "", layer);
  box(wrap, 0, 0, W, H);
  wrap.style.transformOrigin = `${C.x}px ${C.y}px`;
  const cv = el("canvas", "", wrap);
  cv.width = W; cv.height = H;
  Object.assign(cv.style, { position: "absolute", left: "0", top: "0" });
  const ctx = cv.getContext("2d");
  const R = rng(11), N = noise(5);
  const area = P({ x0: 140, x1: 1780, y0: 90, y1: 800 }, { x0: 70, x1: 1010, y0: 270, y1: 1300 });
  const sparks = Array.from({ length: 240 }, (_, i) => ({ x: lerp(area.x0, area.x1, R()), y: lerp(area.y0, area.y1, R()), o: R() * 100, r: 2.6 + R() * 3.8, i }));
  const tags = [3, 41, 77, 120, 150].map((k) => ({ k, n: mk("div", "mono", wrap, "agent") }));
  tags.forEach(({ n }) => Object.assign(n.style, { color: "#9aa39c", fontSize: "19px" }));
  const tR = wt(0, "Rivine") - 0.3;
  const word = mk("div", "big dark-text", layer, "Rivine");
  Object.assign(word.style, { left: "0", width: `${W}px`, textAlign: "center", top: `${C.y - P(70, 74)}px`, fontSize: P("150px", "150px") });
  const sub = mk("div", "kick", layer, "The orchestration runtime");
  Object.assign(sub.style, { left: "0", width: `${W}px`, textAlign: "center", top: `${C.y + P(100, 108)}px`, color: "#a9b5ab" });
  const cap = caption(layer, 0, { emph: ["that place."], dark: true });
  const R0 = P(330, 360);
  const pos = (s, t) => {
    const cx = s.x + N(t * 0.33 + s.o) * 120, cy = s.y + N(t * 0.33 + s.o + 40) * 120;
    const q = ease.outExpo(prog(t, tR + (s.i % 40) * 0.012, 1.6));
    const a = (s.i / sparks.length) * Math.PI * 2 + t * 0.11;
    const rr = R0 * (1 + 0.035 * N(s.i * 0.7 + t * 0.6));
    return { x: lerp(cx, C.x + Math.cos(a) * rr, q), y: lerp(cy, C.y + Math.sin(a) * rr, q), q };
  };
  return (t) => {
    wrap.style.transform = `scale(${lerp(1, 1.06, ease.inOutCubic(prog(t, 0, 11)))})`;
    ctx.clearRect(0, 0, W, H);
    const pts = sparks.map((s) => ({ s, ...pos(s, t) }));
    const qAll = ease.outCubic(prog(t, tR + 0.8, 1.2));
    if (qAll > 0) {
      ctx.strokeStyle = `rgba(169,181,171,${0.22 * qAll})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(C.x, C.y, R0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const p of pts) {
      const flick = 0.4 + 0.5 * (0.5 + 0.5 * N(t * 1.7 + p.s.o * 3));
      ctx.fillStyle = `rgba(236,239,233,${lerp(flick, 0.92, p.q)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s.r * lerp(1, 0.8, p.q), 0, Math.PI * 2);
      ctx.fill();
    }
    // A few agents labelled while they still have nowhere to run.
    for (const { k, n } of tags) {
      const p = pts[k];
      n.style.transform = `translate(${p.x + 10}px, ${p.y - 30}px)`;
      n.style.opacity = String(clamp(prog(t, 0.6 + k * 0.004, 0.8)) * (1 - clamp(prog(t, tR - 0.2, 0.5))));
    }
    enter(word, t, tR + 0.25, { dur: 1.0, s: 0.72, y: 0, blur: 14 });
    enter(sub, t, wt(0, "place") - 0.1, { dur: 0.8, y: 14 });
    cap(t);
  };
});

/* ── 2 · Plans the work, runs it, finishes it (+ how a plan decomposes) ─────── */
film.scene({ id: "runtime", start: 10.3, end: 24.0, enter: { type: "iris", dur: 0.9, cx: C.x, cy: C.y }, rest: [le(1) + 0.25 - 10.3, 22.6 - 10.3] }, (layer) => {
  mk("div", "field-light", layer);
  const g = mk("div", "", layer);
  box(g, 0, 0, W, H);
  const names = ["Plan", "Run", "Finish"];
  const ST = P(
    names.map((n, k) => ({ x: [400, 960, 1520][k], y: 330 })),
    names.map((n, k) => ({ x: 150, y: [470, 750, 1030][k] })),
  );
  const s = stageSvg(g);
  const base = svg("path", { d: P(`M ${ST[0].x} 330 L ${ST[2].x} 330`, `M 150 ${ST[0].y} L 150 ${ST[2].y}`), stroke: "rgba(20,21,18,.16)", "stroke-width": 6, "stroke-linecap": "round", fill: "none" }, s);
  const live = svg("path", { d: base.getAttribute("d"), stroke: "#6b7a6e", "stroke-width": 6, "stroke-linecap": "round", fill: "none" }, s);
  const nodes = ST.map((p) => box(mk("div", "node", g), p.x, p.y));
  const labels = names.map((n, k) => {
    const l = mk("div", "title", g, n);
    if (V) box(l, 210, ST[k].y - 78);
    else Object.assign(l.style, { left: `${ST[k].x - 220}px`, width: "440px", textAlign: "center", top: `${ST[k].y - 140}px`, fontSize: "88px" });
    return l;
  });
  const tk = mk("div", "ticket", g);
  tk.innerHTML = `<div class="id">RUN 4127</div><div class="name">Q3 launch plan</div><div class="chip">Queued</div><div class="bar"><i></i></div>`;
  const chip = tk.querySelector(".chip"), fill = tk.querySelector(".bar > i");
  const plate = mk("div", "plate", g);
  box(plate, P(160, 72), P(640, 1170), P(1600, 936), 96);
  plate.innerHTML = `<div class="kick" style="position:absolute;left:30px;top:35px">Rivine runtime</div><div class="small" style="position:absolute;right:30px;top:32px;color:#9aa39c">${P("plans · runs · finishes · under every engine", "under every engine")}</div>`;
  const cap = caption(layer, 1, { emph: ["orchestration runtime"], out: 17.2 });
  const tP = wt(1, "plans"), tRn = wt(1, "runs"), tF = wt(1, "finishes");
  const stationAt = (t) => (t < tRn ? 0 : t < tF ? lerp(0, 1, ease.inOutCubic(prog(t, tRn, 0.8))) + 0 : 1 + ease.inOutCubic(prog(t, tF, 0.8)));
  // demo: the plan decomposes into a dependency graph
  const D = mk("div", "", layer);
  box(D, 0, 0, W, H);
  const CW = P(370, 420), CH = 78;
  const dag = P(
    { req: [120, 400], c1: [[560, 240], [560, 560]], c2: [[1000, 240], [1000, 560]], rev: [1440, 400], done: [1440, 640] },
    { req: [330, 330], c1: [[72, 520], [588, 520]], c2: [[72, 720], [588, 720]], rev: [330, 910], done: [330, 1080] },
  );
  const chipAt = (txt, x, y, cls = "chip2") => {
    const c = mk("div", cls, D, txt, x, y, CW);
    Object.assign(c.style, { height: `${CH}px`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "29px" });
    return c;
  };
  const req = chipAt("Plan our Q3 launch", ...dag.req);
  Object.assign(req.style, { background: "#141512", color: "#ecefe9", borderColor: "#141512" });
  const c1 = [chipAt("Research the market", ...dag.c1[0]), chipAt("Pull last quarter", ...dag.c1[1])];
  const c2 = [chipAt("Draft the plan", ...dag.c2[0]), chipAt("Build the model", ...dag.c2[1])];
  const rev = chipAt("Review both", ...dag.rev);
  const done = chipAt("Launch plan ✓", ...dag.done);
  Object.assign(done.style, { background: "#6b7a6e", color: "#fff", borderColor: "#6b7a6e" });
  const ds = stageSvg(D);
  D.insertBefore(ds, D.firstChild); // edges behind the chips, inside this group
  const mid = (a) => ({ r: [a[0] + CW, a[1] + CH / 2], l: [a[0], a[1] + CH / 2], b: [a[0] + CW / 2, a[1] + CH], tp: [a[0] + CW / 2, a[1]] });
  const curve = (p, q) => (V
    ? `M ${p[0]} ${p[1]} C ${p[0]} ${p[1] + 60}, ${q[0]} ${q[1] - 60}, ${q[0]} ${q[1]}`
    : `M ${p[0]} ${p[1]} C ${p[0] + 90} ${p[1]}, ${q[0] - 90} ${q[1]}, ${q[0]} ${q[1]}`);
  const out = (a) => (V ? mid(a).b : mid(a).r), inn = (a) => (V ? mid(a).tp : mid(a).l);
  const edge = (a, b) => svg("path", { d: curve(out(a), inn(b)), stroke: "#6b7a6e", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, ds);
  const e1 = dag.c1.map((p) => edge(dag.req, p));
  const e2 = V ? [edge(dag.c1[0], dag.c2[0]), edge(dag.c1[1], dag.c2[1])] : dag.c1.map((p, k) => edge(p, dag.c2[k]));
  const e3 = dag.c2.map((p) => edge(p, dag.rev));
  const e4 = [edge(dag.rev, dag.done)];
  if (!V) e4[0].setAttribute("d", `M ${dag.rev[0] + CW / 2} ${dag.rev[1] + CH} L ${dag.done[0] + CW / 2} ${dag.done[1]}`);
  const kicks = (V ? [] : [["in parallel", 560], ["in parallel", 1000], ["waits for both", 1440]]).map(([txt, x]) => {
    const k = mk("div", "kick", D, txt, x, 186, CW);
    k.style.textAlign = "center";
    return k;
  });
  const head = mk("div", "title", D, "Decompose. Order. Run in parallel.");
  if (V) box(head, 72, 1250, 936); else box(head, 140, 82, 1600);
  head.style.fontSize = P("52px", "58px");
  const T0 = 17.3;
  return (t) => {
    const leave = { out: T0 - 0.2, outDur: 0.5, to: { y: -30 } };
    enter(g, t, 10.6, { dur: 0.6, y: 0, ...leave });
    const st = stationAt(t);
    const k0 = Math.floor(Math.min(st, 1.999)), f = st - k0;
    const px = lerp(ST[k0].x, ST[Math.min(2, k0 + 1)].x, f), py = lerp(ST[k0].y, ST[Math.min(2, k0 + 1)].y, f);
    if (V) box(tk, 210, py + 10); else box(tk, px - 215, 392);
    enter(tk, t, 10.9, { dur: 0.7, y: 30 });
    draw(live, clamp(st / 2));
    nodes.forEach((n, k) => n.classList.toggle("on", t >= [tP, tRn, tF][k] && st >= k - 0.02));
    labels.forEach((l, k) => enter(l, t, [tP, tRn, tF][k] - 0.25, { dur: 0.6, y: 22 }));
    chip.textContent = t < tP ? "Queued" : t < tRn ? "Planning" : t < tF + 0.6 ? "Running" : "Done ✓";
    fill.style.transform = `scaleX(${clamp(st / 2) * (t >= tP ? 1 : 0)})`;
    enter(plate, t, 11.2, { dur: 0.9, y: 40 });
    cap(t);
    // demo
    enter(head, t, T0, { dur: 0.8, y: 20 });
    enter(req, t, T0 + 0.1, { dur: 0.6, s: 0.9, y: 0 });
    e1.forEach((p, k) => draw(p, ease.inOutCubic(prog(t, T0 + 0.5 + k * 0.1, 0.6))));
    c1.forEach((c, k) => enter(c, t, T0 + 0.9 + k * 0.08, { dur: 0.6, x: P(-30, 0), y: P(0, -20) }));
    e2.forEach((p, k) => draw(p, ease.inOutCubic(prog(t, T0 + 1.7 + k * 0.1, 0.6))));
    c2.forEach((c, k) => enter(c, t, T0 + 2.1 + k * 0.08, { dur: 0.6, x: P(-30, 0), y: P(0, -20) }));
    e3.forEach((p, k) => draw(p, ease.inOutCubic(prog(t, T0 + 3.0, 0.7))));
    enter(rev, t, T0 + 3.5, { dur: 0.6, x: P(-30, 0), y: P(0, -20) });
    draw(e4[0], ease.inOutCubic(prog(t, T0 + 4.2, 0.5)));
    enter(done, t, T0 + 4.6, { dur: 0.7, s: 0.85, y: 0, e: (x) => ease.outBack(x, 1.6) });
    kicks.forEach((k, i) => enter(k, t, T0 + 0.9 + i * 1.2, { dur: 0.5, y: 10 }));
    // siblings that run in parallel pulse together
    const pulse = (a, b) => 1 + 0.05 * Math.max(0, Math.sin(clamp(prog(t, a, b - a)) * Math.PI));
    c1.forEach((c) => (c.style.scale = String(pulse(T0 + 1.6, T0 + 2.4))));
    c2.forEach((c) => (c.style.scale = String(pulse(T0 + 2.8, T0 + 3.6))));
  };
});

/* ── 3 · Frameworks are building blocks inside your process ─────────────────── */
film.scene({ id: "frameworks", start: 23.3, end: 45.6, enter: { type: "wipe", dur: 0.7, dir: "right" }, rest: [le(2) + 0.3 - 23.3, le(3) + 0.3 - 23.3, le(4) + 0.3 - 23.3, 44.6 - 23.3] }, (layer) => {
  mk("div", "field-light", layer);
  const FW = ["LangChain", "LangGraph", "AutoGen", "CrewAI"];
  const tray = P({ w: 400, h: 280 }, { w: 450, h: 240 });
  const tp = FW.map((_, k) => P({ x: 110 + k * 430, y: 110 }, { x: k % 2 ? 558 : 72, y: 290 + Math.floor(k / 2) * 270 }));
  const R = rng(4);
  const trays = FW.map((name, k) => {
    const tr = mk("div", "tray", layer, null, tp[k].x, tp[k].y, tray.w, tray.h);
    mk("div", "name", tr, name);
    const parts = Array.from({ length: 7 }, (_, j) => {
      const p = mk("div", "part", tr);
      const w = 46 + R() * 76, h = 30 + R() * 34;
      box(p, 26 + (j % 4) * ((tray.w - 60) / 4) + R() * 10, 100 + Math.floor(j / 4) * 80 + R() * 8, w, h);
      p.style.background = ["#141512", "#6b7a6e", "#7a8b99", "#d8dbd3"][(j + k) % 4];
      if (j % 3 === 0) p.style.borderRadius = "50%";
      return p;
    });
    return { tr, parts };
  });
  const tNames = [wt(2, "LangChain"), wt(2, "LangGraph"), wt(2, "AutoGen"), wt(2, "CrewAI")];
  // constructs: an agent, a graph, a crew
  const cs = stageSvg(layer);
  const CX = P([480, 960, 1440], [200, 540, 880]), CY = P(580, 990), sc = P(1.25, 0.82);
  const ink = "currentColor", sage = "#6b7a6e";
  const agent = svg("g", {}, cs), graph = svg("g", {}, cs), crew = svg("g", {}, cs);
  const pieces = { agent: [], graph: [], crew: [] };
  // agent: a core with three tool arms
  [[-90, -60], [100, -50], [0, 105]].forEach(([dx, dy]) => {
    const l = svg("path", { d: `M ${CX[0]} ${CY} L ${CX[0] + dx * sc} ${CY + dy * sc}`, stroke: ink, "stroke-width": 4, fill: "none" }, agent);
    const b = svg("rect", { x: CX[0] + dx * sc - 16, y: CY + dy * sc - 16, width: 32, height: 32, rx: 7, fill: sage }, agent);
    pieces.agent.push(l, b);
  });
  pieces.agent.push(svg("circle", { cx: CX[0], cy: CY, r: 34 * sc, fill: ink }, agent));
  // graph: five nodes
  const gn = [[-110, -40], [-20, -95], [-10, 30], [95, -50], [100, 70]].map(([x, y]) => [CX[1] + x * sc, CY + y * sc]);
  [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 4]].forEach(([a, b]) => pieces.graph.push(svg("path", { d: `M ${gn[a][0]} ${gn[a][1]} L ${gn[b][0]} ${gn[b][1]}`, stroke: ink, "stroke-width": 4, fill: "none" }, graph)));
  gn.forEach(([x, y], k) => pieces.graph.push(svg("circle", { cx: x, cy: y, r: 20 * sc, fill: k === 4 ? sage : ink }, graph)));
  // crew: three agents around a shared table
  const cn = [[-70, 30], [70, 30], [0, -80]].map(([x, y]) => [CX[2] + x * sc, CY + y * sc]);
  pieces.crew.push(svg("circle", { cx: CX[2], cy: CY - 5 * sc, r: 62 * sc, fill: "none", stroke: "#7a8b99", "stroke-width": 3, "stroke-dasharray": "8 8" }, crew));
  cn.forEach(([x, y]) => pieces.crew.push(svg("circle", { cx: x, cy: y, r: 28 * sc, fill: ink }, crew)));
  const cl = ["agents", "graphs", "crews"].map((n, k) => {
    const l = mk("div", "label", layer, n);
    Object.assign(l.style, { left: `${CX[k] - 120}px`, width: "240px", textAlign: "center", top: `${CY + 120 * sc}px` });
    return l;
  });
  const tA = [wt(3, "agents"), wt(3, "graphs"), wt(3, "crews")];
  // the process window that contains them
  const win = mk("div", "win", layer, null, P(250, 72), P(360, 790), P(1420, 936), P(480, 420));
  layer.insertBefore(win, cs); // behind the constructs: they live inside the process
  win.innerHTML = `<div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span style="margin-left:10px" class="wt">your-app · python · pid 4127</span></div>`;
  const wt_ = win.querySelector(".wt");
  const logs = ["step 12/30 · tool call: search", "step 13/30 · writing draft", "step 14/30 · tool call: sheets"].map((txt, k) => {
    const l = mk("div", "logline", win, txt);
    l.style.top = `${P(342, 310) + k * 28}px`;
    return l;
  });
  const pb = mk("div", "", win, null, 22, P(446, 398), P(1376, 892), 10);
  Object.assign(pb.style, { borderRadius: "6px", background: "rgba(255,255,255,.1)", overflow: "hidden" });
  const pbf = mk("i", "", pb, null, 0, 0, P(1376, 892), 10);
  Object.assign(pbf.style, { background: sage, transformOrigin: "left" });
  const pct = mk("div", "mono", win, "62%");
  Object.assign(pct.style, { left: "auto", right: "24px", top: P("410px", "362px"), color: "#b9c3bb" });
  const tLib = wt(4, "library"), tStop = wt(4, "stops"), tWork = wt(4, "work");
  const q2 = mk("div", "big", layer, "Start again from zero?");
  Object.assign(q2.style, { left: P("140px", "72px"), top: P("130px", "300px"), width: P("1640px", "936px"), fontSize: P("104px", "96px") });
  const zero = mk("div", "mono", win, "restarting · step 1 of 30");
  Object.assign(zero.style, { left: "22px", top: P("410px", "362px"), color: "#e6b3a7" });
  const capA = caption(layer, 2, { emph: ["a framework:"] });
  const capB = caption(layer, 3, { emph: ["building blocks."] });
  const capC = caption(layer, 4, { emph: ["inside your process."] });
  const N = noise(3);
  return (t) => {
    const tOut = ls(4) - 0.1;
    trays.forEach(({ tr, parts }, k) => {
      enter(tr, t, tNames[k] - 0.2, { dur: 0.7, y: 50, out: tOut, to: { y: -60 } });
      parts.forEach((p, j) => enter(p, t, tNames[k] + 0.1 + j * 0.05, { dur: 0.5, s: 0.4, y: 0 }));
      tr.style.filter = t > tA[0] - 0.2 ? `saturate(${1 - 0.6 * clamp(prog(t, tA[0] - 0.2, 0.6))})` : "none";
    });
    // constructs build on their words
    const fall = ease.inCubic(prog(t, tWork, 0.9));
    [agent, graph, crew].forEach((grp, k) => {
      const q = ease.outExpo(prog(t, tA[k] - 0.1, 0.8));
      const dy = (1 - q) * 30 + fall * P(260, 160) + N(k * 9 + t) * 4 * fall;
      grp.setAttribute("transform", `translate(0 ${dy}) rotate(${fall * [8, -6, 10][k]} ${CX[k]} ${CY})`);
      grp.style.opacity = String(q * (1 - 0.65 * fall));
      grp.style.filter = t > tStop ? `grayscale(1)` : "none";
      const inWin = ease.inOutCubic(prog(t, tLib - 0.2, 0.6));
      const c = Math.round(lerp(20, 232, inWin));
      grp.style.color = `rgb(${c},${Math.round(lerp(21, 235, inWin))},${Math.round(lerp(18, 229, inWin))})`;
      enter(cl[k], t, tA[k], { dur: 0.6, y: 12, out: tLib - 0.4, outDur: 0.4 });
    });
    // the window closes around them: a library inside your process (and they stay inside it)
    const qw = enter(win, t, tLib - 0.4, { dur: 0.8, s: 1.06, y: 0 });
    const wx = P(250, 72), wy = P(360, 790), ww = P(1420, 936), wh = P(480, 420);
    cs.style.clipPath = t >= tLib - 0.1 ? `inset(${wy + 46}px ${W - wx - ww}px ${H - wy - wh}px ${wx}px round 0 0 16px 16px)` : "none";
    const dead = t >= tStop - 0.05;
    win.style.borderColor = dead ? "#c8553d" : "rgba(255,255,255,.1)";
    win.style.boxShadow = dead ? "0 0 0 3px rgba(200,85,61,.55), 0 40px 80px -30px rgba(0,0,0,.6)" : "";
    wt_.textContent = dead ? "process exited · code 137" : "your-app · python · pid 4127";
    wt_.style.color = dead ? "#e6b3a7" : "";
    logs.forEach((l, k) => { l.style.opacity = String(qw * (t < tStop ? clamp(prog(t, tLib + k * 0.35, 0.3)) : 0.35)); });
    const run = t < tStop ? 0.62 + 0.02 * clamp(prog(t, tLib, 1.2)) : (0.64 * (1 - ease.inOutCubic(prog(t, tWork + 0.2, 1.1))));
    pbf.style.transform = `scaleX(${run})`;
    pct.textContent = `${Math.round(run * 100)}%`;
    pct.style.opacity = String(t < tWork + 1.3 ? 1 : 0);
    zero.style.opacity = String(clamp(prog(t, tWork + 1.3, 0.4)));
    enter(q2, t, le(4) + 0.4, { dur: 0.9, y: 40 });
    capA(t); capB(t); capC(t);
  };
});

/* ── 4 to 6 · durable state, the approval gate, what you would build ─────────── */
sceneDurable(film);
sceneApproval(film);
sceneBuild(film);
/* ── 7 · how a run works (music-led) ─────────────────────────────────────────── */
sceneHow(film);
/* ── 8 to 10 · engines, deliverables, Aselius ───────────────────────────────── */
sceneEngines(film);
sceneDeliverables(film);
sceneFinale(film);

film.publish();
