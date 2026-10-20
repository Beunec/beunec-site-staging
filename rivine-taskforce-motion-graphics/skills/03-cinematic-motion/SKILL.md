---
name: cinematic-motion
summary: Camera grammar, depth, kinetic typography, transitions, rhythm and voice sync for code-built films, with working patterns on scenes.mjs and the libraries in the sandbox.
use_when: Every film. This is how shots move.
pairs_with: [02-creative-art-direction, 04-archetypes-and-engines, 07-render-qa-and-delivery]
---

# Cinematic motion

## 0. Setup

```bash
cp /opt/motion/scenes.mjs /work/film/
```

```html
<!-- /work/film/index.html -->
<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Film</title>
<link rel="stylesheet" href="./film.css"></head>
<body><div id="stage"></div><script type="module" src="./film.mjs"></script></body></html>
```

```js
// /work/film/film.mjs
import { createFilm, camera, split, kinetic, callout, track, spring, ease, prog, clamp, lerp, el, svg, draw, along, wipe, iris, rng, noise, voiceTiming, imageSequence } from "./scenes.mjs";
const fmt = new URLSearchParams(location.search).get("format") || "wide";   // wide | vertical | square
const W = fmt === "vertical" ? 1080 : fmt === "square" ? 1080 : 1920;
const H = fmt === "vertical" ? 1920 : 1080;
document.documentElement.dataset.format = fmt;
const vo = voiceTiming(await (await fetch("./timing.json")).json()); // only when narrated
const film = createFilm({ width: W, height: H, fps: 30, duration: 32 });
// ...shots...
film.publish();
```

Everything below sets properties from `t` only. The engine does the bookkeeping: scene windows, entrances, `meta.scenes` and `meta.rest`.

## 1. Camera grammar

Every shot has a camera behaviour with a reason. Never animate a camera "to keep things moving".

| Move | Says | Build with `camera()` keys |
| --- | --- | --- |
| **Push in** | "Look closer; this matters" | zoom 1.0 → 1.4 to 2.5 toward the subject, ease `inOutCubic` or `outExpo` |
| **Pull out** | "Here is the bigger picture" | zoom 2.0 → 1.0, often revealing the next subject |
| **Track** (truck) | "Follow this" / "Here is the sequence" | x moves at constant speed (`linear`) along a row of objects |
| **Pan** | "Something else is over here" | x or y moves with `inOutCubic`; short, motivated |
| **Orbit** (2.5D) | "See it from all sides" | combine x drift with layer depth so near layers slide past far ones; or a true orbit in Three.js |
| **Dolly zoom** | Unease, revelation | zoom in while the foreground layer moves opposite; rare |
| **Rack focus** | "Shift attention" | `cam.focus(depth)` moves from one depth to another over 0.6 to 1 s |
| **Hold** | "Read this" / "Let it land" | identical keys, or a tiny drift (zoom +0.02) so the frame breathes |
| **Whip pan** | Energy, change of place | a fast x move (0.25 to 0.4 s) with motion blur on the layer (`filter: blur` scaled by speed), cut in the middle |

Shot sizes vary for rhythm: wide (context) → medium (structure) → close (detail) → macro (texture, one number). Plan them in the shot list.

```js
film.scene({ id: "system", start: 6, end: 12.5, rest: [5.6] }, (layer) => {
  const world = el("div", "", layer);
  const cam = camera(world, { width: W, height: H, keys: [
    { t: 6.0, x: 960, y: 540, zoom: 1.0 },                               // wide: the whole system
    { t: vo.line(2).start, x: 960, y: 540, zoom: 1.0 },                  // hold until the line starts
    { t: vo.word(2, "approval") - 0.2, x: 1320, y: 610, zoom: 2.1, ease: "inOutCubic" }, // push to the approval gate on its word
    { t: 12.5, x: 1335, y: 615, zoom: 2.16 },                            // breathe
  ]});
  const far = cam.layer(el("div", "bg-grid", world), 0.35);   // background: moves a little
  const mid = cam.layer(el("div", "nodes", world), 1);        // the subject plane
  const near = cam.layer(el("div", "dust", world), 1.6);      // foreground: moves more, out of focus
  cam.focus(1, 5);                                            // depth of field around the subject plane
  const tag = callout(layer, cam, { x: 1320, y: 610, label: "You approve", at: vo.word(2, "approval"), dx: 140, dy: -90 });
  return (t) => { cam.apply(t); tag(t); };
});
```

Rules:
- One camera move per idea; ease in and out of every move unless it is a deliberate linear track.
- Keep zoom between 0.8 and 3 on screenshots and text; beyond that, pixels show.
- Hold at least 1.2 s on anything that must be read.
- Callouts are projected through the camera so they ride with the shot and stay a constant size.

## 2. Depth

Depth is what separates a film from a slide. Cheap and effective layers:

| Layer | Depth | Content |
| --- | --- | --- |
| Backdrop | 0 to 0.3 | field colour, large soft light, a texture, a grid |
| Far | 0.3 to 0.7 | secondary objects, out of focus |
| Subject | 1 | the thing being talked about, sharp |
| Near | 1.3 to 2 | particles, edges of objects, large cropped type, blurred |

- Parallax comes free from `camera()` because every move shifts each layer by its depth.
- Light: a large radial gradient that drifts slowly (a few hundred px over the shot) is motivated light; it should brighten the focal point.
- Shadow: elements on the subject plane cast soft shadows onto the backdrop when the world has a floor or wall.
- Atmosphere: seeded particles with `rng(seed)`, positions from `noise(seed)(t * speed + i)`. Keep them sparse and behind text.
- True 3D (Three.js) only when the concept needs real geometry or lighting (see `skills/04`).

## 3. Kinetic typography

Type moves the way the words mean. Split only what performs; body copy does not get split.

```js
const head = split(el("h1", "display", mid), "Ship the whole launch.", { by: "word" });
const chars = split(el("div", "mega", near), "NOW", { by: "char" });
```

Patterns (choose by meaning):

| Pattern | Meaning | Recipe |
| --- | --- | --- |
| **Mask rise** | calm, confident statement | `kinetic(k, t, { at, stagger: 0.06, from: { y: 105, opacity: 0 }, dur: 0.7, ease: "outExpo" })` |
| **Speech-locked** | narration on screen | `kinetic(k, t, { at: vo.wordTimes(i), from: { y: 105 }, dur: 0.5 })`: each word appears on its spoken time |
| **Punch** | emphasis, energy | `from: { scale: 1.6, opacity: 0, blur: 8 }, spring: { stiffness: 320, damping: 20 }` on one word |
| **Cascade** | accumulation | `by: "char"`, `stagger: 0.025`, `from: { y: 60, rotate: 10, opacity: 0 }`, spring stiffness 210, damping 18 |
| **Slam and hold** | a verdict, a number | one word at full frame width, cut in (no ease) on the beat, held 1 s, then pushed past by the camera |
| **Exit sweep** | hand-off to the next idea | `exit: { at, stagger: 0.03, to: { y: -105, opacity: 0 }, dur: 0.45, ease: "inCubic" }` |
| **Scale contrast** | hierarchy | a 200+ px word with a 32 px line under it; the small line arrives after the big word lands |
| **Type as object** | concept-led | letters placed in world space on the subject plane; the camera moves across them (`data-qa="free"`) |
| **Strike and replace** | correction, before/after | draw an SVG line across the old word (`draw(path, q)`), the new word rises in its place |

Rules:
- Stagger at speaking pace for narrated words; 40 to 80 ms per word for unnarrated reveals; 20 to 35 ms per character.
- The rest state is clean: every word upright, aligned, legible, nothing still moving during a rest moment.
- One kinetic signature per shot. Other text in the shot enters quietly (`from: { opacity: 0, y: 12 }`).
- Real text only (DOM or SVG). Set `aria-label` with `split()`, done automatically.
- Grapheme-safe: `split(..., { by: "char" })` uses `Intl.Segmenter`.

## 4. Transitions

Transitions are edits. The best ones are motivated by something in the picture.

| Transition | When | Build |
| --- | --- | --- |
| **Cut on action** | most of the time | the next scene starts on the frame an action peaks (a slam, a click, a beat); `enter: { type: "cut" }` |
| **Match cut** | continuity of an object | the last frame's object shape or position equals the next scene's first; e.g. a circle in scene A at (960,540) r=80 becomes a planet in scene B at the same place and size |
| **Camera reveal** | the next subject is in the same world | pull out or pan in one scene until the next subject is framed; no cut at all |
| **Material wipe** | the world's material moves across | a shape in the world's material (liquid, paper, light) crosses the frame; `wipe(layer, q, "right")` or an SVG path mask synchronised to it |
| **Iris** | focus on a point | `enter: { type: "iris", cx, cy, dur: 0.7 }` from the point that matters |
| **Push through** | depth | the camera flies through a near-layer object (zoom on the near layer to 6+, fade it) into the next scene |
| **Crossfade** | time passing, mood | `exit: { type: "fade", dur: 0.6 }` + `enter: { type: "fade" }`; use rarely |

Avoid: the same transition between every shot, spins and flips, and transitions longer than 0.9 s unless they carry meaning.

## 5. Rhythm and timing

- **Music:** when there is a bed, find its tempo (from the prompt you wrote, or by onset detection with ffmpeg in the sandbox). Cut on bars (every 4 beats) for calm pieces and on beats for energetic ones. At 96 BPM a beat is 0.625 s.
- **Voice:** shot starts sit on line starts (`vo.line(i).start`, exact). Accents sit on words (`vo.word(i, "phrase")`, estimated within about ±0.15 s): let accents ease in 0.1 s early so they read as on time.
- **Breath:** after an important line, hold 0.5 to 1 s before the next cut.
- **Variation:** alternate long shots and short shots; alternate moving camera and held camera; alternate dense and sparse frames.
- **End:** the final frame holds at least 1.5 s with nothing moving except light.

## 6. Driving libraries from `t`

- **GSAP:** build one paused timeline per scene at build time; in the updater call `tl.time(local)`. No `repeat: -1`, no `onComplete` side effects, no `gsap.ticker`.

  ```js
  const { gsap } = window;   // index.html: <script src="./vendor/gsap.min.js"></script> before the module
  const tl = gsap.timeline({ paused: true });
  tl.from(nodes, { scale: 0, stagger: 0.05, duration: 0.5, ease: "expo.out" }, 0.4);
  return (t, local) => { cam.apply(t); tl.time(local); };
  ```

- **Three.js:** set positions, rotations and uniforms from `t`, then `renderer.render(scene, camera)` inside the updater. `preserveDrawingBuffer: true`. Keep geometry light (SwiftShader).
- **Lottie:** `anim.goToAndStop(Math.round(local * anim.frameRate), true)`.
- **Canvas / p5:** redraw the whole canvas each frame from `t` (instance mode, `noLoop()`, call `redraw()` with t in scope).

## 7. Worked shot patterns (adapt, never paste whole)

- **Hook in 1.5 s:** black → a single word slams in at full width on the first beat → camera pushes into a letter → the letter's counter becomes the next scene's circle (match cut).
- **UI hero shot:** the user's screenshot on the subject plane with soft shadow; camera starts wide at a slight angle (2.5D: rotateX 8deg on the plane), pushes to the control being named on its word; callout lands; rack focus to the result panel.
- **Data reveal:** an axis draws itself (`draw`), bars grow from the baseline with `outCubic` staggered by 60 ms, the camera holds; on the key value, the camera pushes to it and its label punches in.
- **System build:** nodes appear on a grid as the voice names them; edges draw along paths; a packet travels `along(path, q)` from request to result; camera tracks the packet.
- **Logo end card:** the world's signature motion resolves into the logo (paths draw, mask opens); hold 1.5 s; light sweeps once.

## 8. Self-check per shot

- [ ] Camera behaviour has a reason; holds where text must be read
- [ ] Depth: at least two layers moving at different rates, or a deliberate flat shot
- [ ] One focal point; everything else quieter
- [ ] Type motion matches meaning; rest state clean
- [ ] Transition into the next shot is motivated
- [ ] Every property set from `t`; scrubbing backwards gives the same frame
