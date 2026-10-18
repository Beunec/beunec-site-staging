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

  /* ── narration timing ───────────────────────────────────
     The voiceover is the source of truth. Each scene lasts as long as its
     line needs at WPS words per second, headline words appear as they are
     said, and callouts appear on the word that names them. Captions are the
     narration, word for word. */
  const WPS = 2.5; // a natural ElevenLabs pace, about 150 words a minute
  const VO_IN = 0.75; // the voice starts this long into a scene
  const VO_TAIL = 1.0; // a breath after the line, before the cut
  const CROSS = 0.6;
  const tokens = (str) => str.split(/\s+/).filter(Boolean);
  const bare = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

  /* Timing helper for one scene's voice line. `spoken` is what the voice
     reads (URLs spelled out); `say` is what the captions and screen show. */
  function voice(say, spoken) {
    const words = tokens(spoken || say);
    const len = words.length / WPS;
    return {
      len,
      start: VO_IN,
      end: VO_IN + len,
      at: (i) => VO_IN + i / WPS,
      // local time at which a word (or the first word of a phrase) is spoken
      word(phrase, from = 0) {
        const want = tokens(phrase).map(bare);
        for (let i = from; i < words.length; i++) {
          if (want.every((w, j) => bare(words[i + j] || "") === w)) return VO_IN + i / WPS;
        }
        throw new Error(`"${phrase}" is not in the line: ${spoken || say}`);
      },
    };
  }

  /* Lower-third caption: the headline is the first part of the voice line
     and builds at speaking pace; the rest of the line appears as it is read. */
  function caption(layer, kicker, head, sub, emph, vo) {
    el("div", "band", layer);
    const box = el("div", "caption", layer);
    const k = el("div", "kicker", box, kicker);
    const h = el("div", "head", box);
    const hw = words(h, head, emph);
    const s = sub ? el("div", "sub", box, sub) : null;
    const subAt = vo.at(tokens(head).length);
    return (t) => {
      fadeUp(k, t, 0.15, 0.6, 14);
      playWords(hw, t, vo.start - 0.05, 1 / WPS, 0.55);
      if (s) fadeUp(s, t, subAt - 0.1, 0.7, 14);
    };
  }

  /* ── the script ───────────────────────────────────────── */
  const scenes = [];
  const CHAPTERS = [];
  let cursor = 0;
  function scene({ say, spoken, chapter, min = 0 }, build) {
    const vo = say ? voice(say, spoken) : null;
    const dur = Math.max(min, vo ? VO_IN + vo.len + VO_TAIL + CROSS : 0);
    const start = cursor;
    if (chapter) CHAPTERS.push({ at: Math.round(start * 10) / 10, title: chapter });
    const layer = el("div", "layer", stage);
    const update = build(layer, dur, vo);
    scenes.push({ start, dur, layer, update, say, spoken: spoken || say, vo });
    cursor = start + dur - CROSS;
  }

  /* A real screen with a camera move, callouts and the caption. Camera keys
     and callout times may be functions of the voice line. */
  const shot = (stem, iw, ih, keys, opts, kicker, head, sub, emph) => (layer, dur, vo) => {
    const bg = lights(layer, [-500, -700, -200, -500], [600, 0, 300, -200]);
    const k = typeof keys === "function" ? keys(vo, dur) : keys;
    const o = typeof opts === "function" ? opts(vo, dur) : opts;
    const cam = camera(layer, stem, iw, ih, k, o);
    const cap = caption(layer, kicker, head, sub, emph, vo);
    return (t) => {
      bg(t / dur);
      cam(t);
      cap(t);
    };
  };
  const line = (head, sub) => (sub ? `${head} ${sub}` : head);

  if (cut === "story") {
    /* 01 What Aselius is */
    scene({ say: "Most AI gives you a reply. Aselius gives you the work.", chapter: "What Aselius is", min: 5 }, (layer, dur, vo) => {
      const bg = lights(layer, [-600, -900, -300, -600], [500, 100, 300, -100]);
      const c = el("div", "center", layer);
      const a = el("div", "mega dim", c);
      const b = el("div", "mega", c);
      b.style.marginTop = "18px";
      const ka = words(a, "Most AI gives you a reply.");
      const kb = words(b, "Aselius gives you the work.", "the work");
      return (t) => {
        bg(t / dur);
        playWords(ka, t, vo.start - 0.05, 1 / WPS, 0.6);
        playWords(kb, t, vo.word("Aselius") - 0.05, 1 / WPS, 0.6);
      };
    });

    {
      const head = "Aselius is agentic infrastructure software, run by specialized Rivine engines.";
      const sub = "Every result is a real file you can inspect, edit and export.";
      scene({ say: line(head, sub) }, (layer, dur, vo) => {
        const bg = lights(layer, [-300, -600, -100, -400], [400, 0, 100, -300]);
        const box = el("div", "top-title", layer);
        box.style.top = "300px";
        const k = el("div", "kicker", box, "Aselius by Beunec");
        const h = el("div", "head", box);
        h.style.fontSize = "76px";
        const hw = words(h, head, "agentic infrastructure software");
        const s = el("div", "sub", box, sub);
        s.style.fontSize = "36px";
        s.style.marginTop = "28px";
        return (t) => {
          bg(t / dur);
          fadeUp(k, t, 0.15, 0.6, 14);
          playWords(hw, t, vo.start - 0.05, 1 / WPS, 0.55);
          fadeUp(s, t, vo.word("Every") - 0.1, 0.7, 18);
        };
      });
    }

    /* 02 Find your way around */
    {
      const head = "Everything lives in one sidebar:";
      const sub = "your workspaces, Connector, Selius, Automations, Observability, Credits and Manage Teams.";
      scene({ say: line(head, sub), chapter: "Find your way around" }, shot("automations-light", 1440, 900,
        (vo) => [
          { t: 0, x: 720, y: 450, z: 1 },
          { t: vo.start, x: 720, y: 450, z: 1 },
          { t: vo.word("your") - 0.2, x: 330, y: 300, z: 1.95 },
          { t: vo.end + 2, x: 345, y: 305, z: 2.02 },
        ],
        (vo) => ({
          cx: 700,
          cy: 420,
          callouts: [
            { x: 228, y: 91, label: "Workspaces", at: vo.word("workspaces"), dx: 330 },
            { x: 228, y: 316, label: "Connector", at: vo.word("Connector"), dx: 330 },
            { x: 228, y: 354, label: "Selius", at: vo.word("Selius"), dx: 330 },
            { x: 228, y: 392, label: "Automations", at: vo.word("Automations"), dx: 330 },
            { x: 228, y: 430, label: "Observability", at: vo.word("Observability"), dx: 330 },
            { x: 228, y: 468, label: "Credits", at: vo.word("Credits"), dx: 330 },
            { x: 228, y: 506, label: "Manage Teams", at: vo.word("Manage Teams"), dx: 330 },
          ],
        }),
        "02 · Find your way around", head, sub, "one sidebar"));
    }

    {
      const head = "Inside a workspace, Taskspace is where work happens:";
      const sub = "the conversation on the left, the Preview Panel on the right.";
      scene({ say: line(head, sub) }, shot("workspace-xlsx-light", 1440, 900,
        (vo, dur) => [
          { t: 0, x: 720, y: 450, z: 1 },
          { t: dur, x: 720, y: 440, z: 1.1 },
        ],
        (vo) => ({
          callouts: [
            { x: 165, y: 31, label: "Taskspace", at: vo.word("Taskspace"), dx: 0, dy: 70 },
            { x: 470, y: 300, label: "The conversation", at: vo.word("conversation"), dx: 60, dy: -70 },
            { x: 1060, y: 70, label: "Preview Panel", at: vo.word("Preview Panel"), dx: -150, dy: 64 },
          ],
        }),
        "02 · Find your way around", head, sub, "Taskspace"));
    }

    /* 03 Pick an engine */
    {
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
      const head = "Choose the Rivine engine for the job:";
      const sub = "TaskForce, Research, Code, Cicero, Creative, Confluence, Assist or Browse. The engine you pick is the engine that runs.";
      scene({ say: line(head, sub), chapter: "Pick an engine" }, (layer, dur, vo) => {
        const bg = lights(layer, [-400, -800, -100, -500], [500, 200, 200, -100]);
        const top = el("div", "top-title", layer);
        const k = el("div", "kicker", top, "03 · Pick an engine");
        const h = el("div", "head", top);
        const hw = words(h, head, "Rivine engine");
        const grid = el("div", "grid", layer);
        grid.style.top = "330px";
        const cards = ENGINES.map(([n, w]) => {
          const c = el("div", "card", grid);
          el("span", "tag", c);
          el("div", "name", c, "Rivine " + n);
          el("div", "what", c, w);
          return { c, at: vo.word(n, tokens(head).length) };
        });
        const note = el("div", "sub", layer, "The engine you pick is the engine that runs.");
        Object.assign(note.style, { position: "absolute", left: "140px", top: "900px", color: "#e8eaed" });
        return (t) => {
          bg(t / dur);
          fadeUp(k, t, 0.15, 0.6, 14);
          playWords(hw, t, vo.start - 0.05, 1 / WPS, 0.55);
          cards.forEach(({ c, at }) => fadeUp(c, t, at - 0.1, 0.6, 30));
          fadeUp(note, t, vo.word("The engine you pick") - 0.1, 0.7, 16);
        };
      });
    }

    {
      const head = "Set the engine and its specialty, then send.";
      const sub = "Or start from an Agent Note that already has both.";
      scene({ say: line(head, sub) }, shot("workspace-xlsx-light", 1440, 900,
        (vo) => [
          { t: 0, x: 720, y: 600, z: 1.2 },
          { t: vo.start + 0.6, x: 720, y: 790, z: 2.5 },
          { t: vo.word("Or") - 0.1, x: 724, y: 792, z: 2.6 },
          { t: vo.word("Agent") + 0.9, x: 480, y: 470, z: 1.5 },
          { t: vo.end + 3, x: 470, y: 475, z: 1.55 },
        ],
        (vo) => ({
          callouts: [
            { x: 770, y: 813, label: "Engine", at: vo.word("engine"), dx: 40, dy: -110, until: vo.word("Or") },
            { x: 612, y: 813, label: "Specialty", at: vo.word("specialty"), dx: -40, dy: -110, until: vo.word("Or") },
            { x: 320, y: 470, label: "Agent Note", at: vo.word("Agent") + 0.8, dx: 60, dy: -80 },
          ],
        }),
        "03 · Pick an engine", head, sub, "then send"));
    }

    /* 04 Watch it work */
    {
      const head = "Every step shows as it happens.";
      const sub = "Stop it any time; the trail stays with the thread.";
      scene({ say: line(head, sub), chapter: "Watch it work" }, shot("engine-running-light", 1440, 900,
        (vo, dur) => [
          { t: 0, x: 760, y: 450, z: 1 },
          { t: vo.word("step"), x: 760, y: 560, z: 1.9 },
          { t: dur, x: 770, y: 570, z: 1.98 },
        ],
        (vo) => ({
          callouts: [
            { x: 338, y: 563, label: "Each step", at: vo.word("step"), dx: -70, dy: 0 },
            { x: 1183, y: 810, label: "Stop", at: vo.word("Stop"), dx: -60, dy: -90 },
          ],
        }),
        "04 · Watch it work", head, sub, "as it happens"));
    }

    {
      const head = "Before it acts in your apps, you approve the exact action.";
      const sub = "Nothing runs until you do.";
      scene({ say: line(head, sub) }, shot("hitl-app-action-light", 768, 431,
        (vo, dur) => [
          { t: 0, x: 384, y: 215, z: 1 },
          { t: dur, x: 520, y: 230, z: 1.16 },
        ],
        (vo) => ({
          fitW: 1240,
          fitH: 650,
          callouts: [{ x: 678, y: 392, label: "Approve & run", at: vo.word("approve"), dx: -60, dy: -90 }],
        }),
        "04 · Watch it work", head, sub, "approve"));
    }

    scene({ say: "If it needs you, it asks one question and waits." }, shot("hitl-question-dark", 768, 372,
      (vo, dur) => [
        { t: 0, x: 384, y: 186, z: 1 },
        { t: dur, x: 384, y: 190, z: 1.07 },
      ],
      { fitW: 1240, fitH: 620 },
      "04 · Watch it work", "If it needs you, it asks one question and waits.", null, "waits"));

    /* 05 Deliverables, not chat */
    {
      const head = "One turn. A whole launch kit:";
      const sub = "documents, data, media and the app, each one a real file.";
      scene({ say: line(head, sub), chapter: "Deliverables, not chat" }, shot("workspace-thread-dark", 1440, 900,
        (vo, dur) => [
          { t: 0, x: 760, y: 420, z: 1 },
          { t: dur, x: 760, y: 400, z: 1.42 },
        ],
        {},
        "05 · Deliverables, not chat", head, sub, "A whole launch kit"));
    }

    {
      const head = "Open any file exactly as generated:";
      const sub = "Word as pages, Excel as a grid, decks slide by slide.";
      scene({ say: line(head, sub) }, shot("workspace-docx-light", 1440, 900,
        (vo, dur) => [
          { t: 0, x: 480, y: 440, z: 1.25 },
          { t: vo.start + 0.6, x: 480, y: 440, z: 1.25 },
          { t: vo.word("Word") + 0.4, x: 1185, y: 360, z: 1.55 },
          { t: dur, x: 1190, y: 360, z: 1.6 },
        ],
        {},
        "05 · Deliverables, not chat", head, sub, "exactly as generated"));
    }

    {
      const head = "Edit with Rivine Assist.";
      const sub = "Then save, publish or export.";
      scene({ say: line(head, sub) }, shot("preview-panel-dark", 1440, 900,
        (vo, dur) => [
          { t: 0, x: 720, y: 450, z: 1 },
          { t: vo.start + 0.8, x: 1180, y: 480, z: 1.12 },
          { t: dur, x: 1185, y: 480, z: 1.16 },
        ],
        (vo) => ({
          callouts: [
            { x: 1110, y: 848, label: "Rivine Assist", at: vo.word("Rivine Assist"), dx: -120, dy: -70 },
            { x: 1195, y: 113, label: "Save", at: vo.word("save"), dx: -330, dy: 0 },
            { x: 1276, y: 113, label: "Publish", at: vo.word("publish"), dx: -330, dy: 60 },
            { x: 1368, y: 113, label: "Export", at: vo.word("export"), dx: 20, dy: 110 },
          ],
        }),
        "05 · Deliverables, not chat", head, sub, "Rivine Assist"));
    }

    /* 06 Share it anywhere */
    {
      const head = "Publish a snapshot with its own access code.";
      const sub = "Later edits stay private until you update it.";
      scene({ say: line(head, sub), chapter: "Share it anywhere" }, shot("publish-dialog-light", 1440, 900,
        (vo, dur) => [
          { t: 0, x: 720, y: 450, z: 1 },
          { t: vo.start + 1, x: 720, y: 440, z: 1.45 },
          { t: dur, x: 720, y: 445, z: 1.5 },
        ],
        (vo) => ({
          callouts: [
            { x: 720, y: 408, label: "Code, Open or Members", at: vo.word("snapshot"), dx: 420, dy: -10 },
            { x: 647, y: 542, label: "Its own access code", at: vo.word("access"), dx: -330, dy: 0 },
          ],
        }),
        "06 · Share it anywhere", head, sub, "its own access code"));
    }

    {
      const head = "It opens on any device. No sign-in.";
      const sub = "Exactly as generated, with a Download button.";
      scene({ say: line(head, sub) }, (layer, dur, vo) => {
        const bg = lights(layer, [-500, -700, -200, -500], [600, 0, 300, -200]);
        const desk = camera(layer, "preview-xlsx-desktop", 1280, 800, [{ t: 0, x: 640, y: 400, z: 1 }], { fitW: 1080, fitH: 640, cx: 690, cy: 400 });
        const p1 = camera(layer, "preview-docx-mobile", 390, 844, [{ t: 0, x: 195, y: 422, z: 1 }], { fitW: 300, fitH: 600, cx: 1440, cy: 430, phone: true });
        const p2 = camera(layer, "preview-access-code-mobile", 390, 844, [{ t: 0, x: 195, y: 422, z: 1 }], { fitW: 300, fitH: 600, cx: 1720, cy: 470, phone: true });
        const cap = caption(layer, "06 · Share it anywhere", head, sub, "any device", vo);
        const wins = layer.querySelectorAll(".window");
        const tDesk = vo.word("opens") - 0.3;
        const tPhone = vo.word("device") - 0.2;
        return (t) => {
          bg(t / dur);
          desk(t);
          p1(t);
          p2(t);
          const qd = outExpo(prog(t, tDesk, 1.2));
          const q1 = outExpo(prog(t, tPhone, 1.2));
          const q2 = outExpo(prog(t, tPhone + 0.3, 1.2));
          wins[0].style.opacity = String(qd);
          wins[0].style.translate = `${(1 - qd) * -80}px 0`;
          wins[1].style.opacity = String(q1);
          wins[1].style.translate = `0 ${(1 - q1) * 120 - t * 4}px`;
          wins[2].style.opacity = String(q2);
          wins[2].style.translate = `0 ${(1 - q2) * 140 - t * 7}px`;
          cap(t);
        };
      });
    }

    /* 07 Beyond the browser tab */
    scene({ say: "Automations run on a schedule, even with your computer off.", chapter: "Beyond the browser tab" }, shot("automations-dark", 1440, 900,
      (vo, dur) => [
        { t: 0, x: 720, y: 450, z: 1 },
        { t: vo.word("schedule"), x: 870, y: 330, z: 1.55 },
        { t: dur, x: 875, y: 335, z: 1.6 },
      ],
      (vo) => ({
        callouts: [{ x: 520, y: 389, label: "Every day at 08:00 UTC", at: vo.word("schedule"), dx: 40, dy: 110 }],
      }),
      "07 · Beyond the browser tab", "Automations run on a schedule, even with your computer off.", null, "even with your computer off"));

    {
      const head = "Use Aselius from any AI app.";
      const sub = "Connect Claude, Cursor or ChatGPT to Aselius MCP at workspace.beunec.com/mcp.";
      const spokenSub = "Connect Claude, Cursor or ChatGPT to Aselius M C P, at workspace dot beunec dot com slash M C P.";
      scene({ say: line(head, sub), spoken: line(head, spokenSub) }, (layer, dur, vo) => {
        const bg = lights(layer, [-400, -800, -100, -500], [500, 200, 200, -100]);
        const top = el("div", "top-title", layer);
        const k = el("div", "kicker", top, "07 · Beyond the browser tab");
        const h = el("div", "head", top);
        h.style.fontSize = "76px";
        const hw = words(h, head, "any AI app");
        const s = el("div", "sub", top, sub);
        s.style.marginTop = "24px";
        const box = el("div", "card", layer);
        Object.assign(box.style, { position: "absolute", left: "140px", right: "140px", top: "560px", padding: "40px 48px" });
        const lab = el("div", "kicker", box, "Aselius MCP server");
        const url = el("div", "", box, "https://workspace.beunec.com/mcp");
        Object.assign(url.style, { fontFamily: "ui-monospace, Menlo, monospace", fontSize: "64px", fontWeight: "600", marginTop: "18px", color: "#e8eaed", letterSpacing: "-0.01em" });
        const row = el("div", "", box);
        Object.assign(row.style, { display: "flex", gap: "16px", marginTop: "30px" });
        const chips = ["Claude", "Cursor", "ChatGPT"].map((n) => {
          const c = el("div", "pill", row, n);
          Object.assign(c.style, { position: "static" });
          return { c, at: vo.word(n) };
        });
        const more = el("div", "pill", row, "Any MCP-compatible app");
        more.style.position = "static";
        return (t) => {
          bg(t / dur);
          fadeUp(k, t, 0.15, 0.6, 14);
          playWords(hw, t, vo.start - 0.05, 1 / WPS, 0.55);
          fadeUp(s, t, vo.word("Connect") - 0.1, 0.7, 14);
          fadeUp(box, t, vo.word("Connect") - 0.2, 0.8, 30);
          fadeUp(lab, t, vo.word("Connect"), 0.6, 10);
          fadeUp(url, t, vo.word("Connect") + 0.3, 0.7, 14);
          chips.forEach(({ c, at }) => fadeUp(c, t, at - 0.1, 0.5, 12));
          fadeUp(more, t, vo.word("workspace") + 0.4, 0.5, 12);
        };
      });
    }

    {
      const SURFACES = [
        ["Aselius web app", "aselius.beunec.com", "web"],
        ["Rivine Browse", "Your own tabs: Mac, Windows and Chrome", "Browse"],
        ["Rivine Code CLI", "Rivine Code in your terminal", "CLI"],
        ["Aselius MCP", "From Claude, Cursor, ChatGPT and other MCP apps", "MCP"],
        ["Chat apps", "Telegram, Discord and WhatsApp", "chat"],
        ["Selius", "Speech to speech, and it asks before it acts", "Selius"],
      ];
      const head = "The same engines, wherever you work:";
      const sub = "the web app, Rivine Browse, the Rivine Code CLI, Aselius MCP, your chat apps, and Selius by voice. One wallet across every surface.";
      scene({ say: line(head, sub) }, (layer, dur, vo) => {
        const bg = lights(layer, [-400, -800, -100, -500], [500, 200, 200, -100]);
        const top = el("div", "top-title", layer);
        const k = el("div", "kicker", top, "07 · Beyond the browser tab");
        const h = el("div", "head", top);
        const hw = words(h, head, "wherever you work");
        const grid = el("div", "grid three", layer);
        grid.style.top = "330px";
        const from = tokens(head).length;
        const cards = SURFACES.map(([n, w, key]) => {
          const c = el("div", "card", grid);
          el("span", "tag", c);
          el("div", "name", c, n);
          el("div", "what", c, w);
          return { c, at: vo.word(key, from) };
        });
        const note = el("div", "sub", layer, "One wallet across every surface.");
        Object.assign(note.style, { position: "absolute", left: "140px", top: "800px", color: "#e8eaed" });
        return (t) => {
          bg(t / dur);
          fadeUp(k, t, 0.15, 0.6, 14);
          playWords(hw, t, vo.start - 0.05, 1 / WPS, 0.55);
          cards.forEach(({ c, at }) => fadeUp(c, t, at - 0.15, 0.6, 30));
          fadeUp(note, t, vo.word("One wallet") - 0.1, 0.7, 16);
        };
      });
    }

    /* 08 Why Aselius */
    {
      const head = "Not another Claude Cowork, ChatGPT Work or Kimi Work.";
      const sub = "Specialized engines, real deliverables, and you stay in control.";
      scene({ say: line(head, sub), chapter: "Why Aselius" }, (layer, dur, vo) => {
        const bg = lights(layer, [-600, -900, -300, -600], [500, 100, 300, -100]);
        const c = el("div", "center", layer);
        const k = el("div", "kicker", c, "08 · Why Aselius");
        const a = el("div", "mega", c);
        a.style.fontSize = "84px";
        a.style.marginTop = "26px";
        const ka = words(a, head, "Not another");
        const b = el("div", "sub", c, sub);
        Object.assign(b.style, { fontSize: "40px", marginTop: "34px", color: "#e8eaed" });
        return (t) => {
          bg(t / dur);
          fadeUp(k, t, 0.15, 0.6, 14);
          playWords(ka, t, vo.start - 0.05, 1 / WPS, 0.6);
          fadeUp(b, t, vo.word("Specialized") - 0.1, 0.8, 18);
        };
      });
    }

    /* 09 Get started */
    scene({
      say: "Aselius. Agentic infrastructure software, at aselius.beunec.com.",
      spoken: "Aselius. Agentic infrastructure software, at aselius dot beunec dot com.",
      chapter: "Get started",
      min: 6.5,
    }, (layer, dur, vo) => {
      const bg = lights(layer, [-300, -700, -300, -500], [500, 100, 400, 0]);
      const c = el("div", "center", layer);
      const logo = el("img", "logo", c);
      logo.src = "../../public/assets/aselius-logo-icon.png";
      images.push(logo);
      const name = el("div", "mega", c);
      name.style.marginTop = "28px";
      const nw = words(name, "Aselius");
      const tag = el("div", "url", c, "Agentic infrastructure software");
      const url = el("div", "url", c, "aselius.beunec.com");
      Object.assign(url.style, { color: "#8fa0ae", marginTop: "12px" });
      const docs = el("div", "small", c, "Documentation at beunec.co/aselius-platform/docs");
      return (t) => {
        bg(t / dur);
        const q = outExpo(prog(t, 0.2, 1.1));
        logo.style.opacity = String(q);
        logo.style.transform = `scale(${0.86 + 0.14 * q})`;
        playWords(nw, t, vo.start - 0.05, 1 / WPS, 0.7);
        fadeUp(tag, t, vo.word("Agentic") - 0.1, 0.7, 16);
        fadeUp(url, t, vo.word("aselius dot") - 0.1, 0.7, 16);
        fadeUp(docs, t, vo.end + 0.2, 0.7, 16);
        c.style.opacity = String(1 - prog(t, dur - 0.9, 0.9));
      };
    });
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
      cursor = i * SEG;
      scene({ min: SEG + CROSS }, (layer) => {
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

  const DURATION = cut === "story" ? Math.round((cursor + CROSS) * 10) / 10 : 18;
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
  // Captions and voiceover cues come from the same lines, timed to the voice.
  window.CAPTIONS = scenes
    .filter((s) => s.say)
    .map((s) => ({
      start: Math.round((s.start + s.vo.start - 0.1) * 100) / 100,
      end: Math.round((s.start + s.vo.end + 0.35) * 100) / 100,
      text: s.say,
      spoken: s.spoken,
      words: tokens(s.spoken).length,
    }));
  window.ready = Promise.all([
    document.fonts.ready,
    ...images.map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = r; i.onerror = r; }))),
  ]).then(() => Promise.all(images.map((i) => i.decode().catch(() => {}))));
  window.renderAt(0);
})();
