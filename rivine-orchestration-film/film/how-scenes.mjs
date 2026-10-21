/* Scene 7: how a Rivine run works, in five beats led by the music (no narration here).
   Every claim is from the Rivine research publication: decomposition, conditional
   delegation, self-healing tool access, validation before delivery, memory with
   provenance. Big words carry the beat; a diagram proves it. */
import { ease, prog, clamp, lerp, el, svg, draw } from "./scenes.mjs";
import { V, W, H, P, mk, box, enter, stageSvg } from "./core.mjs";

export const BEATS = [80.4, 86.3, 92.2, 98.1, 104.0];
const SPAN = 5.9;

export function sceneHow(film) {
  film.scene({ id: "how", start: 78.6, end: 110.5, enter: { type: "wipe", dur: 0.7, dir: "up" }, rest: BEATS.map((b) => b + 4.6 - 78.6) }, (layer) => {
    mk("div", "field-dark", layer);
    const glow = mk("div", "glow", layer);
    box(glow, P(1100, 40), P(-100, 500), 1000, 1000);
    const kick = mk("div", "kick", layer, "How a Rivine run works", P(140, 72), P(80, 250));
    kick.style.color = "#a9b5ab";
    const dots = BEATS.map((_, k) => {
      const d = mk("div", "", layer, null, P(540, 640) + k * 34, P(84, 252), 22, 6);
      Object.assign(d.style, { borderRadius: "4px", background: "rgba(236,239,233,.18)" });
      return d;
    });
    const title = (txt) => {
      const n = mk("div", "big dark-text", layer, txt);
      if (V) box(n, 72, 330, 936); else box(n, 140, 230, 760);
      n.style.fontSize = P("92px", "88px");
      return n;
    };
    const subt = (txt) => {
      const n = mk("div", "small dim", layer, txt);
      if (V) box(n, 72, 560, 900); else box(n, 140, 590, 700);
      n.style.fontSize = P("28px", "30px");
      n.style.lineHeight = "1.4";
      return n;
    };
    // diagram region
    const DX = P(940, 72), DY = P(180, 760), DW = P(860, 936), DH = P(640, 640);
    const beats = [];

    /* 1 · Decompose */
    {
      const b = BEATS[0];
      const T = title("Decompose."), S = subt("One request becomes concrete, assignable steps, ordered by what depends on what.");
      const g = mk("div", "", layer, null, DX, DY, DW, DH);
      const req = mk("div", "chip2 dark", g, "Prepare the board pack", 0, DH / 2 - 33, 330);
      Object.assign(req.style, { height: "66px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", background: "#ecefe9", color: "#141512" });
      const subs = ["Pull Q3 numbers", "Research comparables", "Build the model", "Draft the narrative", "Assemble the deck"];
      const sg = stageSvg(g);
      sg.setAttribute("width", DW); sg.setAttribute("height", DH); sg.setAttribute("viewBox", `0 0 ${DW} ${DH}`);
      const items = subs.map((txt, k) => {
        const y = 40 + k * ((DH - 120) / 4);
        const c = mk("div", "chip2 dark", g, `${k + 1}  ${txt}`, DW - 420, y, 420);
        Object.assign(c.style, { height: "62px", boxSizing: "border-box", display: "flex", alignItems: "center" });
        const p = svg("path", { d: `M 330 ${DH / 2} C 400 ${DH / 2}, ${DW - 500} ${y + 31}, ${DW - 420} ${y + 31}`, stroke: "#6b7a6e", "stroke-width": 3, fill: "none" }, sg);
        return { c, p };
      });
      beats.push((t) => {
        enter(T, t, b, { dur: 0.7, y: 40, out: b + SPAN - 0.5, outDur: 0.4 });
        enter(S, t, b + 0.7, { dur: 0.7, y: 16, out: b + SPAN - 0.5, outDur: 0.4 });
        enter(g, t, b + 0.2, { dur: 0.5, y: 0, out: b + SPAN - 0.5, outDur: 0.4 });
        enter(req, t, b + 0.3, { dur: 0.6, s: 0.9, y: 0 });
        items.forEach(({ c, p }, k) => {
          draw(p, ease.inOutCubic(prog(t, b + 1.0 + k * 0.18, 0.6)));
          enter(c, t, b + 1.3 + k * 0.18, { dur: 0.5, x: -30, y: 0 });
        });
      });
    }

    /* 2 · Delegate as little as necessary */
    {
      const b = BEATS[1];
      const T = title("Delegate as little as necessary."), S = subt("A narrow request stays shallow. Multi-domain work goes deeper, in proportion to what it needs.");
      const g = mk("div", "", layer, null, DX, DY, DW, DH);
      const cols = 4, rows = 3, gx = DW / cols, gy = (DH - 160) / rows;
      const slots = Array.from({ length: 12 }, (_, k) => {
        const s = mk("div", "slot", g, null, gx * (k % cols) + gx / 2, 70 + gy * Math.floor(k / cols) + gy / 2);
        const i = el("i", "", s);
        return { s, i };
      });
      const lab = mk("div", "label dark-text", g, "", 0, DH - 70, DW);
      lab.style.textAlign = "center";
      const narrow = [5, 6], deep = [1, 5, 6, 9, 10];
      beats.push((t) => {
        enter(T, t, b, { dur: 0.7, y: 40, out: b + SPAN - 0.5, outDur: 0.4 });
        enter(S, t, b + 0.7, { dur: 0.7, y: 16, out: b + SPAN - 0.5, outDur: 0.4 });
        enter(g, t, b + 0.2, { dur: 0.5, y: 0, out: b + SPAN - 0.5, outDur: 0.4 });
        const deepOn = t >= b + 3.1;
        slots.forEach(({ s, i }, k) => {
          enter(s, t, b + 0.3 + k * 0.03, { dur: 0.4, s: 0.6, y: 0 });
          const on = narrow.includes(k) ? clamp(prog(t, b + 1.2, 0.4)) : deep.includes(k) ? clamp(prog(t, b + 3.2 + deep.indexOf(k) * 0.12, 0.35)) : 0;
          i.style.opacity = String(on);
          i.style.transform = `scale(${lerp(0.3, 1, on)})`;
        });
        lab.textContent = deepOn ? "Multi-domain work · 5 of 12 engaged" : "Narrow request · 2 of 12 engaged";
        lab.style.opacity = String(clamp(prog(t, b + 1.3, 0.4)) * (deepOn ? clamp(prog(t, b + 3.1, 0.3)) : 1 - clamp(prog(t, b + 2.85, 0.25))));
      });
    }

    /* 3 · Tools that heal themselves */
    {
      const b = BEATS[2];
      const T = title("Tools that heal themselves."), S = subt("Retry what is transient. Fall back to another source. Report what was tried, never a silent give-up.");
      const g = mk("div", "", layer, null, DX, DY, DW, DH);
      const row = (txt, y, k) => {
        const src = mk("div", "chip2 dark", g, txt, 0, y, 300);
        Object.assign(src.style, { height: "62px", boxSizing: "border-box", display: "flex", alignItems: "center" });
        const res = mk("div", "label", g, "", 340, y + 16);
        return { src, res };
      };
      const r1 = row("Source A · call", 30, 0), r2 = row("Source A · retry", 150, 1), r3 = row("Source B · fallback", 270, 2);
      const timer = mk("div", "", g, null, DW - 190, 20, 150, 150);
      timer.innerHTML = `<svg viewBox="0 0 150 150" width="150" height="150"><circle cx="75" cy="75" r="62" fill="none" stroke="rgba(236,239,233,.14)" stroke-width="10"/><circle class="arc" cx="75" cy="75" r="62" fill="none" stroke="#c8553d" stroke-width="10" stroke-linecap="round" transform="rotate(-90 75 75)" stroke-dasharray="389.6" stroke-dashoffset="389.6"/><text x="75" y="84" text-anchor="middle" fill="#ecefe9" font-family="Inter" font-weight="600" font-size="28">8 s</text></svg>`;
      const arc = timer.querySelector(".arc");
      const tl = mk("div", "small dim", g, "bounded wait: no call hangs the run", DW - 250, 182, 250);
      tl.style.textAlign = "right";
      const report = mk("div", "card", g, null, 0, 420, DW, 140);
      report.style.background = "#191c1a";
      report.style.borderColor = "rgba(255,255,255,.12)";
      report.innerHTML = `<div class="kick" style="position:absolute;left:28px;top:26px;color:#a9b5ab">Reported with the result</div><div class="mono" style="position:absolute;left:28px;top:70px;color:#ecefe9">Tried: A (timed out) → A retry (failed) → B ✓</div>`;
      beats.push((t) => {
        enter(T, t, b, { dur: 0.7, y: 40, out: b + SPAN - 0.5, outDur: 0.4 });
        enter(S, t, b + 0.7, { dur: 0.7, y: 16, out: b + SPAN - 0.5, outDur: 0.4 });
        enter(g, t, b + 0.2, { dur: 0.5, y: 0, out: b + SPAN - 0.5, outDur: 0.4 });
        const steps = [[r1, b + 0.4, "✕  timed out", "#e6b3a7"], [r2, b + 1.6, "✕  failed again", "#e6b3a7"], [r3, b + 2.7, "✓  result, normalised", "#a9c0ae"]];
        steps.forEach(([r, ts, txt, col]) => {
          enter(r.src, t, ts, { dur: 0.45, x: -24, y: 0 });
          r.res.textContent = txt;
          r.res.style.color = col;
          enter(r.res, t, ts + 0.6, { dur: 0.4, x: -12, y: 0 });
        });
        const a = clamp(prog(t, b + 0.4, 0.9));
        arc.setAttribute("stroke-dashoffset", String(389.6 * (1 - a)));
        enter(timer, t, b + 0.4, { dur: 0.4, s: 0.85, y: 0 });
        enter(tl, t, b + 0.9, { dur: 0.4, y: 8 });
        enter(report, t, b + 3.6, { dur: 0.6, y: 24 });
      });
    }

    /* 4 · Checked before you see it */
    {
      const b = BEATS[3];
      const T = title("Checked before you see it."), S = subt("The result is validated against what was asked, however confident the model sounds.");
      const g = mk("div", "", layer, null, DX, DY, DW, DH);
      const doc = mk("div", "", g, null, 0, 20, P(330, 360), 430);
      Object.assign(doc.style, { borderRadius: "16px", background: "#ecefe9" });
      doc.innerHTML = `<div style="position:absolute;left:26px;top:28px;width:200px;height:20px;border-radius:5px;background:#141512"></div>` +
        Array.from({ length: 7 }, (_, k) => `<div style="position:absolute;left:26px;top:${78 + k * 34}px;width:${[260, 240, 270, 200, 255, 230, 150][k]}px;height:12px;border-radius:4px;background:rgba(20,21,18,.22)"></div>`).join("") +
        `<div style="position:absolute;left:26px;bottom:26px;width:120px;height:60px;border-radius:8px;background:#6b7a6e;opacity:.6"></div>`;
      const checks = ["Covers all three markets", "Every figure has a source", "Deck and model both included", "Within the stated budget"].map((txt, k) => {
        const r = mk("div", "label dark-text", g, `✓  ${txt}`, P(380, 410), 40 + k * 78);
        r.style.fontSize = P("27px", "26px");
        return r;
      });
      const stamp = mk("div", "", g, null, P(80, 90), 300, 260, 84);
      Object.assign(stamp.style, { border: "5px solid #6b7a6e", color: "#6b7a6e", borderRadius: "12px", font: "800 34px/74px Inter", letterSpacing: ".12em", textAlign: "center", background: "rgba(15,17,16,.82)" });
      stamp.textContent = "VALIDATED";
      beats.push((t) => {
        enter(T, t, b, { dur: 0.7, y: 40, out: b + SPAN - 0.5, outDur: 0.4 });
        enter(S, t, b + 0.7, { dur: 0.7, y: 16, out: b + SPAN - 0.5, outDur: 0.4 });
        enter(g, t, b + 0.2, { dur: 0.5, y: 0, out: b + SPAN - 0.5, outDur: 0.4 });
        enter(doc, t, b + 0.3, { dur: 0.6, y: 30 });
        checks.forEach((c, k) => enter(c, t, b + 1.1 + k * 0.45, { dur: 0.45, x: -20, y: 0 }));
        enter(stamp, t, b + 3.2, { dur: 0.5, s: 1.6, r: -14, y: 0, e: (x) => ease.outBack(x, 1.2) });
        stamp.style.transform += " rotate(-8deg)";
      });
    }

    /* 5 · Remembered, with provenance */
    {
      const b = BEATS[4];
      const T = title("Remembered, with provenance."), S = subt("Where a fact came from, who may act on it, and when it stops being true.");
      const g = mk("div", "", layer, null, DX, DY, DW, DH);
      const MEM = [["Vector", "Related, even when the words differ", "source: thread 12"], ["Symbolic", "Rules that must not change", "fixed for this task"], ["Operational", "What ran and what it returned", "tool log"], ["Experiential", "What worked, what failed", "kept if it matters"], ["Human-authored", "Decisions only people make", "approved by you"]];
      const cw = P(272, 456), ch = P(212, 190);
      const cards = MEM.map(([a, s, p], k) => {
        const x = P(k < 3 ? k * (cw + 22) : 147 + (k - 3) * (cw + 22), (k % 2) * (cw + 24));
        const y = P(k < 3 ? 30 : 270, Math.floor(k / 2) * (ch + 18));
        const c = mk("div", "mem", g, null, x, y, cw, ch);
        c.innerHTML = `<div class="t">${a}</div><div class="s">${s}</div><div class="p">${p}</div>`;
        return c;
      });
      beats.push((t) => {
        enter(T, t, b, { dur: 0.7, y: 40, out: 109.9, outDur: 0.5 });
        enter(S, t, b + 0.7, { dur: 0.7, y: 16, out: 109.9, outDur: 0.5 });
        enter(g, t, b + 0.2, { dur: 0.5, y: 0, out: 109.9, outDur: 0.5 });
        cards.forEach((c, k) => enter(c, t, b + 0.6 + k * 0.32, { dur: 0.6, y: 40, r: [-4, 3, -2, 4, -3][k] }));
      });
    }

    return (t) => {
      enter(kick, t, 79.0, { dur: 0.6, y: 10 });
      dots.forEach((d, k) => {
        enter(d, t, 79.2 + k * 0.06, { dur: 0.4, y: 0 });
        const on = t >= BEATS[k] && (k === 4 || t < BEATS[k + 1]);
        d.style.background = on ? "#6b7a6e" : t >= BEATS[k] ? "rgba(107,122,110,.5)" : "rgba(236,239,233,.18)";
      });
      beats.forEach((f) => f(t));
    };
  });
}
