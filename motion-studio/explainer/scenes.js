/*
 * Aselius story, as code.
 *
 * Two cuts share this file:
 *   ?cut=story  the narrated-by-text explainer (about 98 s), with chapters and captions
 *   ?cut=reel   a silent, seamless loop of real screens (18 s) for the site
 *
 * Determinism: window.renderAt(t) is a pure function of t. No timers, no
 * Date.now(), no randomness, so the renderer can ask for any frame in any order
 * and always gets the same picture. Every screen in the video is a real Aselius
 * screenshot from public/media/aselius; every sentence on screen is in SCRIPT
 * below, which also produces the captions file.
 */
(function () {
  const W = 1920;
  const H = 1080;
  const MEDIA = "../../public/media/aselius/";
  const cut = new URLSearchParams(location.search).get("cut") || "story";

  /* ── math ─────────────────────────────────────────────── */
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const prog = (t, start, dur) => clamp((t - start) / dur);
  const outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, q) => a + (b - a) * q;

  /* ── dom helpers ──────────────────────────────────────── */
  const stage = document.getElementById("stage");
  const el = (tag, cls, parent, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  };
  const images = [];
  const img = (stem, parent) => {
    const i = el("img", "", parent);
    i.src = MEDIA + stem + ".webp";
    images.push(i);
    return i;
  };

  /* Kinetic words: each word rises out of its own mask. `emph` marks a phrase
     that gets an underline drawn after the words land. */
  function words(parent, text, emph) {
    const parts = [];
    const pushWords = (str, into) =>
      str.split(" ").filter(Boolean).forEach((w, idx, arr) => {
        const outer = el("span", "w", into);
        parts.push(el("span", "", outer, w));
        if (idx < arr.length - 1) into.appendChild(document.createTextNode(" "));
      });
    let underline = null;
    if (emph && text.includes(emph)) {
      const [before, after] = text.split(emph);
      if (before.trim()) {
        pushWords(before, parent);
        parent.appendChild(document.createTextNode(" "));
      }
      const tailRaw = (after || "").trim();
      const glue = /^[.,!?:]/.test(tailRaw) ? el("span", "", parent) : parent;
      if (glue !== parent) glue.style.whiteSpace = "nowrap";
      const em = el("span", "em", glue);
      pushWords(emph.trim(), em);
      underline = el("span", "ul", em);
      const tail = (after || "").trim();
      if (tail && /^[.,!?:]/.test(tail)) {
        // punctuation hugs the phrase; anything after it follows normally
        const outer = el("span", "w", glue);
        parts.push(el("span", "", outer, tail[0]));
        const rest = tail.slice(1).trim();
        if (rest) {
          parent.appendChild(document.createTextNode(" "));
          pushWords(rest, parent);
        }
      } else if (tail) {
        parent.appendChild(document.createTextNode(" "));
        pushWords(tail, parent);
      }
    } else {
      pushWords(text, parent);
    }
    return { parts, underline };
  }
  function playWords(k, t, start, stagger = 0.055, dur = 0.85) {
    k.parts.forEach((p, i) => {
      const q = outExpo(prog(t, start + i * stagger, dur));
      p.style.transform = `translate3d(0, ${(1 - q) * 105}%, 0)`;
      p.style.opacity = String(0.15 + 0.85 * q);
    });
    if (k.underline) {
      const q = outExpo(prog(t, start + k.parts.length * stagger + 0.2, 0.8));
      k.underline.style.transform = `scaleX(${q})`;
    }
  }
  const fadeUp = (node, t, start, dur = 0.8, dist = 26) => {
    const q = outExpo(prog(t, start, dur));
    node.style.opacity = String(q);
    node.style.transform = `translate3d(0, ${(1 - q) * dist}px, 0)`;
  };

  /* Moving light: lighting carries the mood; it drifts slowly, never flickers. */
  function lights(layer, a, b) {
    const l1 = el("div", "light", layer);
    const l2 = el("div", "light slate", layer);
    el("div", "grain", layer);
    return (t) => {
      l1.style.transform = `translate3d(${lerp(a[0], a[2], t)}px, ${lerp(a[1], a[3], t)}px, 0)`;
      l2.style.transform = `translate3d(${lerp(b[0], b[2], t)}px, ${lerp(b[1], b[3], t)}px, 0)`;
    };
  }

  /* Camera on a screenshot. Keys are image-space focus points and zoom; the
     focus lands on screen point (cx, cy). Callouts are projected into screen
     space so labels stay a constant, readable size while the camera moves. */
  function camera(layer, stem, iw, ih, keys, opts = {}) {
    const fitW = opts.fitW || 1520;
    const fitH = opts.fitH || 720;
    const base = Math.min(fitW / iw, fitH / ih);
    const win = el("div", "window" + (opts.phone ? " phone" : ""), layer);
    win.style.width = iw + "px";
    win.style.height = ih + "px";
    img(stem, win);
    const cx = opts.cx ?? W / 2;
    const cy = opts.cy ?? 420;
    const state = { x: iw / 2, y: ih / 2, s: base };
    const callouts = (opts.callouts || []).map((c) => {
      const root = el("div", "callout", layer);
      const leader = el("div", "leader", root);
      const ring = el("div", "ring", root);
      const dot = el("div", "dot", root);
      const pill = el("div", "pill", root, c.label);
      return { ...c, root, leader, ring, dot, pill };
    });
    const sample = (t) => {
      if (t <= keys[0].t) return keys[0];
      for (let i = 1; i < keys.length; i++) {
        if (t <= keys[i].t) {
          const a = keys[i - 1];
          const b = keys[i];
          const q = inOut(prog(t, a.t, b.t - a.t));
          return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), z: lerp(a.z, b.z, q) };
        }
      }
      return keys[keys.length - 1];
    };
    return (t) => {
      const k = sample(t);
      const s = base * k.z;
      state.x = k.x;
      state.y = k.y;
      state.s = s;
      win.style.transform = `translate3d(${cx - k.x * s}px, ${cy - k.y * s}px, 0) scale(${s})`;
      callouts.forEach((c) => {
        const sx = cx + (c.x - k.x) * s;
        const sy = cy + (c.y - k.y) * s;
        const q = outExpo(prog(t, c.at, 0.7));
        const out = c.until ? 1 - outExpo(prog(t, c.until, 0.4)) : 1;
        const vis = q * out;
        const dx = c.dx ?? 70;
        const dy = c.dy ?? 0;
        c.root.style.opacity = String(vis);
        c.dot.style.transform = `translate3d(${sx}px, ${sy}px, 0) scale(${0.4 + 0.6 * q})`;
        const pulse = (t - c.at) % 1.6;
        c.ring.style.transform = `translate3d(${sx}px, ${sy}px, 0) scale(${1 + pulse * 1.4})`;
        c.ring.style.opacity = String(clamp(1 - pulse / 1.6) * vis);
        const len = Math.hypot(dx, dy) * q;
        const ang = Math.atan2(dy, dx);
        c.leader.style.width = Math.max(0, Math.hypot(dx, dy) - 12) + "px";
        c.leader.style.transform = `translate3d(${sx}px, ${sy - 1}px, 0) rotate(${ang}rad) scaleX(${len / Math.max(1, Math.hypot(dx, dy))})`;
        const left = dx < 0;
        c.pill.style.transform = `translate3d(${sx + dx}px, ${sy + dy}px, 0) translate(${left ? "-100%" : "0"}, -50%) translate3d(${(1 - q) * (left ? 16 : -16)}px, 0, 0)`;
      });
    };
  }

  /* Lower-third caption: chapter kicker, kinetic headline, supporting line. */
  function caption(layer, kicker, head, sub, emph) {
    el("div", "band", layer);
    const box = el("div", "caption", layer);
    const k = el("div", "kicker", box, kicker);
    const h = el("div", "head", box);
    const hw = words(h, head, emph);
    const s = sub ? el("div", "sub", box, sub) : null;
    return (t) => {
      fadeUp(k, t, 0.25, 0.7, 14);
      playWords(hw, t, 0.35);
      if (s) fadeUp(s, t, 0.35 + hw.parts.length * 0.055 + 0.35, 0.8, 18);
    };
  }

  /* ── the script ───────────────────────────────────────── */
  const scenes = [];
  const CROSS = 0.6;
  function scene(start, dur, build, say) {
    const layer = el("div", "layer", stage);
    const update = build(layer, dur);
    scenes.push({ start, dur, layer, update, say });
  }

  const shot = (stem, iw, ih, keys, opts, kicker, head, sub, emph) => (layer) => {
    const bg = lights(layer, [-500, -700, -200, -500], [600, 0, 300, -200]);
    const cam = camera(layer, stem, iw, ih, keys, opts);
    const cap = caption(layer, kicker, head, sub, emph);
    return (t, dur) => {
      bg(t / dur);
      cam(t);
      cap(t);
    };
  };

  const CHAPTERS = [];
  const chapter = (at, title) => CHAPTERS.push({ at, title });

  if (cut === "story") {
    /* 01 What Aselius is */
    chapter(0, "What Aselius is");
    scene(0, 5.0, (layer) => {
      const bg = lights(layer, [-600, -900, -300, -600], [500, 100, 300, -100]);
      const c = el("div", "center", layer);
      const a = el("div", "mega dim", c);
      const b = el("div", "mega", c);
      b.style.marginTop = "18px";
      const ka = words(a, "Most AI gives you a reply.");
      const kb = words(b, "Aselius gives you the work.", "the work");
      return (t, dur) => {
        bg(t / dur);
        playWords(ka, t, 0.3, 0.07, 0.9);
        playWords(kb, t, 1.9, 0.08, 0.9);
      };
    }, "Most AI gives you a reply. Aselius gives you the work.");

    scene(4.4, 6.2, (layer) => {
      const bg = lights(layer, [-300, -600, -100, -400], [400, 0, 100, -300]);
      const box = el("div", "top-title", layer);
      box.style.top = "300px";
      const k = el("div", "kicker", box, "Aselius by Beunec");
      const h = el("div", "head", box);
      h.style.fontSize = "76px";
      const hw = words(h, "An agentic workspace, run by specialized Rivine engines.", "Rivine engines");
      const s = el("div", "sub", box, "They research, build, draft and create. Every result is a real file you can inspect, edit and export.");
      s.style.fontSize = "34px";
      s.style.marginTop = "28px";
      return (t, dur) => {
        bg(t / dur);
        fadeUp(k, t, 0.3, 0.7, 14);
        playWords(hw, t, 0.45, 0.06);
        fadeUp(s, t, 1.6, 0.9, 20);
      };
    }, "Aselius is an agentic workspace, run by specialized Rivine engines. They research, build, draft and create. Every result is a real file you can inspect, edit and export.");

    /* 02 Find your way around */
    chapter(10.0, "Find your way around");
    scene(10.0, 8.0, shot("automations-light", 1440, 900, [
      { t: 0, x: 720, y: 450, z: 1 },
      { t: 1.4, x: 720, y: 450, z: 1 },
      { t: 3.0, x: 330, y: 300, z: 1.95 },
      { t: 8, x: 345, y: 305, z: 2.02 },
    ], {
      cx: 700,
      cy: 420,
      callouts: [
        { x: 228, y: 91, label: "Workspaces and their taskspaces", at: 3.1, dx: 330 },
        { x: 228, y: 316, label: "Connector: the apps you authorize", at: 3.5, dx: 330 },
        { x: 228, y: 354, label: "Selius: voice", at: 3.9, dx: 330 },
        { x: 228, y: 392, label: "Automations: scheduled runs", at: 4.3, dx: 330 },
        { x: 228, y: 430, label: "Observability: cost, latency, retries", at: 4.7, dx: 330 },
        { x: 228, y: 468, label: "Credits: one prepaid wallet", at: 5.1, dx: 330 },
        { x: 228, y: 506, label: "Manage Teams: people and organizations", at: 5.5, dx: 330 },
      ],
    }, "02 · Find your way around", "Everything lives in one sidebar.", null, "one sidebar"),
    "Everything lives in one sidebar: workspaces and their taskspaces, Connector, Selius, Automations, Observability, Credits and Manage Teams.");

    scene(17.4, 8.0, shot("workspace-xlsx-light", 1440, 900, [
      { t: 0, x: 720, y: 450, z: 1 },
      { t: 8, x: 720, y: 440, z: 1.1 },
    ], {
      callouts: [
        { x: 230, y: 31, label: "Taskspace, Governance, Share", at: 1.6, dx: 0, dy: 70 },
        { x: 1300, y: 31, label: "Credits left", at: 2.2, dx: -150, dy: 0 },
        { x: 1060, y: 70, label: "Preview Panel", at: 2.8, dx: -150, dy: 64 },
        { x: 1256, y: 120, label: "Publish and Download", at: 3.4, dx: -30, dy: 130 },
        { x: 320, y: 480, label: "Agent Notes: ready-made engine prompts", at: 4.0, dx: 60, dy: -70 },
        { x: 1392, y: 756, label: "Selius", at: 4.6, dx: -70, dy: -50 },
      ],
    }, "02 · Find your way around", "Inside a workspace, Taskspace is where work happens.", "The conversation on the left. The Preview Panel on the right.", "Taskspace"),
    "Inside a workspace, Taskspace is where work happens: the conversation on the left, the Preview Panel on the right.");

    /* 03 Pick an engine */
    chapter(24.8, "Pick an engine");
    scene(24.8, 7.6, (layer) => {
      const bg = lights(layer, [-400, -800, -100, -500], [500, 200, 200, -100]);
      const top = el("div", "top-title", layer);
      const k = el("div", "kicker", top, "03 · Pick an engine");
      const h = el("div", "head", top);
      const hw = words(h, "Choose the Rivine engine for the job.", "Rivine engine");
      const grid = el("div", "grid", layer);
      grid.style.top = "330px";
      const ENGINES = [
        ["TaskForce", "Professional work with your connected apps"],
        ["Research", "Sourced reports and spreadsheets"],
        ["Code", "Working projects, on the web or in your terminal"],
        ["Cicero", "Legal drafting and review"],
        ["Creative", "Images, video and audio"],
        ["Confluence", "Country forecasts and scenarios"],
        ["Assist", "Surgical edits to an open document"],
        ["Browse", "Tasks in your own browser tabs"],
      ];
      const cards = ENGINES.map(([n, w]) => {
        const c = el("div", "card", grid);
        el("span", "tag", c);
        el("div", "name", c, "Rivine " + n);
        el("div", "what", c, w);
        return c;
      });
      const note = el("div", "sub", layer, "The engine you pick is the engine that runs.");
      note.style.position = "absolute";
      note.style.left = "140px";
      note.style.top = "900px";
      note.style.color = "#e8eaed";
      return (t, dur) => {
        bg(t / dur);
        fadeUp(k, t, 0.2, 0.7, 14);
        playWords(hw, t, 0.3);
        cards.forEach((c, i) => fadeUp(c, t, 1.0 + i * 0.16, 0.8, 34));
        fadeUp(note, t, 3.0, 0.8, 16);
      };
    }, "Choose the Rivine engine for the job: TaskForce, Research, Code, Cicero, Creative, Confluence, Assist or Browse. The engine you pick is the engine that runs.");

    scene(31.8, 5.8, shot("workspace-xlsx-light", 1440, 900, [
      { t: 0, x: 720, y: 600, z: 1.2 },
      { t: 2.2, x: 720, y: 790, z: 2.5 },
      { t: 5.8, x: 724, y: 792, z: 2.6 },
    ], {
      callouts: [
        { x: 612, y: 813, label: "Specialty", at: 2.3, dx: -40, dy: -110 },
        { x: 770, y: 813, label: "Engine", at: 2.7, dx: 40, dy: -110 },
      ],
    }, "03 · Pick an engine", "Set the engine and its specialty, then send.", "Or start from an Agent Note that already has both.", "then send"),
    "Set the engine and its specialty in the input bar, then send. Or start from an Agent Note that already has both.");

    /* 04 Watch it work */
    chapter(37.0, "Watch it work");
    scene(37.0, 6.4, shot("engine-running-light", 1440, 900, [
      { t: 0, x: 760, y: 450, z: 1 },
      { t: 2.6, x: 760, y: 560, z: 1.9 },
      { t: 6.4, x: 770, y: 570, z: 1.98 },
    ], {
      callouts: [
        { x: 338, y: 563, label: "Planning", at: 2.6, dx: -70, dy: 0 },
        { x: 1163, y: 592, label: "Each step reports its result", at: 3.1, dx: -40, dy: -90 },
      ],
    }, "04 · Watch it work", "Every step shows as it happens.", "Stop it any time. The trail stays with the thread.", "as it happens"),
    "Every step shows as it happens. Stop it any time; the trail stays with the thread.");

    scene(42.8, 5.6, shot("hitl-app-action-light", 768, 431, [
      { t: 0, x: 384, y: 215, z: 1 },
      { t: 5.6, x: 520, y: 230, z: 1.16 },
    ], {
      fitW: 1240,
      fitH: 650,
      callouts: [{ x: 678, y: 392, label: "Nothing runs until you approve", at: 1.8, dx: -60, dy: -90 }],
    }, "04 · Watch it work", "Before it acts in your apps, you approve the exact action.", null, "approve"),
    "Before it acts in your apps, you approve the exact action. Nothing runs until you do.");

    scene(47.8, 5.2, shot("hitl-question-dark", 768, 372, [
      { t: 0, x: 384, y: 186, z: 1 },
      { t: 5.2, x: 384, y: 190, z: 1.07 },
    ], { fitW: 1240, fitH: 620 }, "04 · Watch it work", "If it needs you, it asks one question and waits.", null, "waits"),
    "If it needs you, it asks one question and waits for your answer.");

    /* 05 Deliverables, not chat */
    chapter(52.4, "Deliverables, not chat");
    scene(52.4, 6.4, shot("workspace-thread-dark", 1440, 900, [
      { t: 0, x: 760, y: 420, z: 1 },
      { t: 6.4, x: 760, y: 400, z: 1.42 },
    ], {}, "05 · Deliverables, not chat", "One turn. A whole launch kit.", "Documents, data, media and the app. Each one a real file.", "A whole launch kit"),
    "One turn, a whole launch kit: documents, data, media and the app, each one a real file.");

    scene(58.2, 6.0, shot("workspace-docx-light", 1440, 900, [
      { t: 0, x: 480, y: 440, z: 1.25 },
      { t: 1.2, x: 480, y: 440, z: 1.25 },
      { t: 4.2, x: 1185, y: 360, z: 1.55 },
      { t: 6.0, x: 1190, y: 360, z: 1.6 },
    ], {}, "05 · Deliverables, not chat", "Open any file exactly as generated.", "Word as pages. Excel as a grid. Decks slide by slide.", "exactly as generated"),
    "Open any file exactly as generated: Word as pages, Excel as a grid, decks slide by slide.");

    scene(63.6, 6.0, shot("preview-panel-dark", 1440, 900, [
      { t: 0, x: 720, y: 450, z: 1 },
      { t: 2.0, x: 1180, y: 480, z: 1.12 },
      { t: 6.0, x: 1185, y: 480, z: 1.16 },
    ], {
      callouts: [
        { x: 1110, y: 848, label: "Rivine Assist", at: 2.3, dx: -120, dy: -70 },
        { x: 1276, y: 113, label: "Publish", at: 2.8, dx: -330, dy: 0 },
        { x: 1368, y: 113, label: "Export", at: 3.2, dx: 20, dy: 110 },
      ],
    }, "05 · Deliverables, not chat", "Edit with Rivine Assist. Save, publish or export.", null, "Rivine Assist"),
    "Ask Rivine Assist for a follow-up edit, then save, publish or export.");

    /* 06 Share it anywhere */
    chapter(69.0, "Share it anywhere");
    scene(69.0, 6.0, shot("publish-dialog-light", 1440, 900, [
      { t: 0, x: 720, y: 450, z: 1 },
      { t: 2.0, x: 720, y: 440, z: 1.45 },
      { t: 6.0, x: 720, y: 445, z: 1.5 },
    ], {
      callouts: [
        { x: 720, y: 408, label: "Code, Open or Members", at: 2.2, dx: 420, dy: -10 },
        { x: 647, y: 542, label: "Its own access code", at: 2.8, dx: -330, dy: 0 },
      ],
    }, "06 · Share it anywhere", "Publish a snapshot with its own access code.", "Later edits stay private until you update it.", "its own access code"),
    "Publish a snapshot with its own access code. Later edits stay private until you update it.");

    scene(74.4, 6.6, (layer) => {
      const bg = lights(layer, [-500, -700, -200, -500], [600, 0, 300, -200]);
      const desk = camera(layer, "preview-xlsx-desktop", 1280, 800, [{ t: 0, x: 640, y: 400, z: 1 }], { fitW: 1080, fitH: 640, cx: 690, cy: 400 });
      const p1 = camera(layer, "preview-docx-mobile", 390, 844, [{ t: 0, x: 195, y: 422, z: 1 }], { fitW: 300, fitH: 600, cx: 1440, cy: 430, phone: true });
      const p2 = camera(layer, "preview-access-code-mobile", 390, 844, [{ t: 0, x: 195, y: 422, z: 1 }], { fitW: 300, fitH: 600, cx: 1720, cy: 470, phone: true });
      const cap = caption(layer, "06 · Share it anywhere", "It opens on any device. No sign-in.", "preview.aselius.beunec.com shows the file exactly as generated, with a Download button.", "any device");
      const wins = layer.querySelectorAll(".window");
      return (t, dur) => {
        bg(t / dur);
        desk(t);
        p1(t);
        p2(t);
        // Arrival: desktop glides in, phones rise after it, then everything settles.
        const qd = outExpo(prog(t, 0.1, 1.2));
        const q1 = outExpo(prog(t, 0.6, 1.2));
        const q2 = outExpo(prog(t, 0.9, 1.2));
        wins[0].style.opacity = String(qd);
        wins[0].style.translate = `${(1 - qd) * -80}px 0`;
        wins[1].style.opacity = String(q1);
        wins[1].style.translate = `0 ${(1 - q1) * 120 - t * 4}px`;
        wins[2].style.opacity = String(q2);
        wins[2].style.translate = `0 ${(1 - q2) * 140 - t * 7}px`;
        cap(t);
      };
    }, "preview.aselius.beunec.com opens it on any device, with no sign-in, exactly as generated and with a Download button.");

    /* 07 Beyond the browser tab */
    chapter(80.4, "Beyond the browser tab");
    scene(80.4, 6.0, shot("automations-dark", 1440, 900, [
      { t: 0, x: 720, y: 450, z: 1 },
      { t: 2.2, x: 870, y: 330, z: 1.55 },
      { t: 6.0, x: 875, y: 335, z: 1.6 },
    ], {
      callouts: [{ x: 520, y: 389, label: "Rivine Research, every day at 08:00 UTC", at: 2.4, dx: 40, dy: 110 }],
    }, "07 · Beyond the browser tab", "Automations run on a schedule, even with your computer off.", null, "even with your computer off"),
    "Automations run Research, TaskForce, Cicero and Confluence on a schedule, even with your computer off.");

    scene(85.8, 7.0, (layer) => {
      const bg = lights(layer, [-400, -800, -100, -500], [500, 200, 200, -100]);
      const top = el("div", "top-title", layer);
      const k = el("div", "kicker", top, "07 · Beyond the browser tab");
      const h = el("div", "head", top);
      const hw = words(h, "The same engines, wherever you work.", "wherever you work");
      const grid = el("div", "grid three", layer);
      grid.style.top = "330px";
      const SURFACES = [
        ["Aselius web app", "aselius.beunec.com"],
        ["Rivine Browse", "Your own tabs: Mac, Windows and Chrome"],
        ["Rivine Code CLI", "Rivine Code in your terminal"],
        ["Aselius MCP", "From Claude, Cursor, ChatGPT and other MCP clients"],
        ["Telegram, Discord, WhatsApp", "Start and follow a task from chat"],
        ["Selius", "Speech to speech, and it asks before it acts"],
      ];
      const cards = SURFACES.map(([n, w]) => {
        const c = el("div", "card", grid);
        el("span", "tag", c);
        el("div", "name", c, n);
        el("div", "what", c, w);
        return c;
      });
      const note = el("div", "sub", layer, "One prepaid wallet across every surface.");
      note.style.position = "absolute";
      note.style.left = "140px";
      note.style.top = "800px";
      note.style.color = "#e8eaed";
      return (t, dur) => {
        bg(t / dur);
        fadeUp(k, t, 0.2, 0.7, 14);
        playWords(hw, t, 0.3);
        cards.forEach((c, i) => fadeUp(c, t, 1.0 + i * 0.18, 0.8, 34));
        fadeUp(note, t, 3.0, 0.8, 16);
      };
    }, "The same engines, wherever you work: the Aselius web app, Rivine Browse in your own tabs, the Rivine Code CLI, Aselius MCP, Telegram, Discord and WhatsApp, and Selius by voice. One prepaid wallet across every surface.");

    /* 08 Get started */
    chapter(92.2, "Get started");
    scene(92.2, 6.3, (layer) => {
      const bg = lights(layer, [-300, -700, -300, -500], [500, 100, 400, 0]);
      const c = el("div", "center", layer);
      const logo = el("img", "logo", c);
      logo.src = "../../public/assets/aselius-logo-icon.png";
      images.push(logo);
      const name = el("div", "mega", c);
      name.style.marginTop = "28px";
      const nw = words(name, "Aselius");
      const url = el("div", "url", c, "aselius.beunec.com");
      const docs = el("div", "small", c, "Documentation at beunec.co/aselius-platform/docs");
      return (t, dur) => {
        bg(t / dur);
        const q = outExpo(prog(t, 0.2, 1.1));
        logo.style.opacity = String(q);
        logo.style.transform = `scale(${0.86 + 0.14 * q})`;
        playWords(nw, t, 0.6, 0.06, 0.9);
        fadeUp(url, t, 1.3, 0.8, 16);
        fadeUp(docs, t, 1.7, 0.8, 16);
        // final fade to charcoal
        const end = prog(t, dur - 0.9, 0.9);
        c.style.opacity = String(1 - end);
      };
    }, "Aselius. aselius.beunec.com. Documentation at beunec.co/aselius-platform/docs.");
  } else {
    /* Reel: six real screens, slow camera, a label each, loops seamlessly. */
    const REEL = [
      ["workspace-thread-light", 1440, 900, "Taskspace", { x: 760, y: 420 }, { x: 760, y: 400 }],
      ["engine-running-light", 1440, 900, "Live engine steps", { x: 760, y: 470 }, { x: 760, y: 560 }],
      ["workspace-xlsx-light", 1440, 900, "Preview Panel", { x: 900, y: 420 }, { x: 1150, y: 360 }],
      ["publish-dialog-light", 1440, 900, "Publish", { x: 720, y: 450 }, { x: 720, y: 440 }],
      ["preview-xlsx-desktop", 1280, 800, "preview.aselius.beunec.com", { x: 640, y: 400 }, { x: 600, y: 360 }],
      ["code-project-dark", 1280, 760, "Rivine Code project", { x: 640, y: 380 }, { x: 700, y: 330 }],
    ];
    const SEG = 3;
    REEL.forEach(([stem, iw, ih, label, a, b], i) => {
      scene(i * SEG, SEG + CROSS, (layer) => {
        const bg = lights(layer, [-500, -700, -200, -500], [600, 0, 300, -200]);
        const cam = camera(layer, stem, iw, ih, [
          { t: -CROSS, x: a.x, y: a.y, z: 1.02 },
          { t: SEG + CROSS, x: b.x, y: b.y, z: 1.18 },
        ], { fitW: 1700, fitH: 940, cy: 540 });
        const chip = el("div", "chip", layer, label);
        return (t, dur) => {
          bg(clamp((t + CROSS) / (dur + CROSS)));
          cam(t);
          fadeUp(chip, t, 0.15, 0.6, 10);
        };
      });
    });
  }

  const DURATION = cut === "story" ? 98.5 : 18;
  const loop = cut !== "story";

  function opacityAt(sc, local) {
    if (local < -CROSS || local > sc.dur) return 0;
    const first = sc.start === 0 && !loop;
    const fin = first ? 1 : clamp((local + (loop ? CROSS : 0)) / CROSS);
    const fout = clamp((sc.dur - local) / CROSS);
    return Math.min(fin, fout);
  }

  window.renderAt = function renderAt(t) {
    for (const sc of scenes) {
      let best = 0;
      let bestLocal = t - sc.start;
      const candidates = loop ? [t - sc.start, t - sc.start + DURATION, t - sc.start - DURATION] : [t - sc.start];
      for (const local of candidates) {
        const o = loop ? opacityAt(sc, local) : local >= 0 && local <= sc.dur ? Math.min(sc.start === 0 ? 1 : clamp(local / CROSS), clamp((sc.dur - local) / CROSS)) : 0;
        if (o > best) {
          best = o;
          bestLocal = local;
        }
      }
      sc.layer.style.opacity = String(best);
      sc.layer.style.visibility = best > 0 ? "visible" : "hidden";
      if (best > 0) sc.update(bestLocal, sc.dur);
    }
  };

  window.DURATION = DURATION;
  window.CHAPTERS = CHAPTERS;
  window.CAPTIONS = scenes
    .filter((s) => s.say)
    .map((s) => ({ start: s.start + 0.3, end: Math.min(DURATION, s.start + s.dur - 0.35), text: s.say }));
  window.ready = Promise.all([
    document.fonts.ready,
    ...images.map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = r; i.onerror = r; }))),
  ]).then(() => Promise.all(images.map((i) => i.decode().catch(() => {}))));
  window.renderAt(0);
})();
