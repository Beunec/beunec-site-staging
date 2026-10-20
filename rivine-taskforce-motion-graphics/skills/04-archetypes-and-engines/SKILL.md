---
name: archetypes-and-engines
summary: Twelve visual archetypes for code-to-video and the library to build each with (CSS/SVG, GSAP, D3, Canvas, Three.js, Lottie), with the deterministic integration rules that keep every frame seekable.
use_when: Choosing what kind of visual a beat needs and which engine draws it.
pairs_with: [03-cinematic-motion, 02-creative-art-direction, 05-media-and-generation]
---

# Archetypes and engines

## 1. Archetypes are vocabularies, not genres

One good film mixes several archetypes: a kinetic hook, an isometric system, a real UI shot, a data proof and a logo end card. Pick an archetype per **beat**, based on what that beat must communicate. The look still comes from the film's art direction (`skills/02`); an archetype only says what kind of picture it is.

| # | Archetype | Communicates | Engine | Watch for |
| --- | --- | --- | --- | --- |
| 1 | Kinetic typography | emphasis, rhythm, claims | DOM/SVG + `split`/`kinetic`, or GSAP SplitText | legibility at rest, speech lock |
| 2 | Editorial grid | structure, comparison, premium | CSS grid + masks, `wipe` | negative space, few elements |
| 3 | Cinematic depth | scale, emotion, desirability | `camera()` with depth layers; Three.js for real 3D | one focal point, no blown highlights |
| 4 | Narrative explainer | how a system works | SVG objects that persist and transform, `draw`, `along` | continuity of objects across beats |
| 5 | Data story | magnitude, trend, rank | D3 scales and shapes in SVG; Canvas for thousands of marks | honest scales, units, sources |
| 6 | UI / product demo | a real workflow | the user's screenshots or recorded clips + camera + callouts | never imply features that don't exist |
| 7 | Isometric system | architecture, layers, flows | SVG with an iso projection, or Three.js orthographic camera | consistent projection, labelled parts |
| 8 | Generative field | energy, atmosphere, scale | Canvas 2D with `rng`/`noise`; GLSL in Three.js | seeded, sparse behind text |
| 9 | Logo and identity | recognition | SVG paths, `draw`, masks | never distort the approved mark |
| 10 | Science / diagram | mechanisms, algorithms | SVG/Canvas from a model of the system | fidelity over spectacle |
| 11 | 3D product | form, material, assembly | Three.js + glTF from uploads | lean geometry, consistent lighting |
| 12 | Map / network | place, routes, reach | D3 geo projections + GeoJSON from uploads or bundled data | correct geography, attribution |

## 2. Picking an engine (least complexity that looks right)

1. **CSS + SVG + `scenes.mjs`**: default for type, editorial layouts, diagrams, UI shots, callouts and 2.5D depth. Sharp at any scale, cheap to render, QA can read the text.
2. **GSAP** (paused timelines): when choreography gets dense (dozens of staggered tweens, motion paths, SVG morphs) and the timeline itself becomes the design surface.
3. **D3**: data geometry (scales, axes, shapes, layouts, projections). Render to SVG for under a few hundred marks, Canvas for more.
4. **Canvas 2D**: thousands of particles, procedural textures, trails. Redraw the whole canvas from `t` each frame.
5. **Three.js**: real 3D objects, lighting, materials, cameras that orbit or fly. Costly in a GPU-less sandbox: keep scenes small and shots short.
6. **Lottie**: only to play a supplied vector animation (from the user or a brand kit) under frame control.

Mixing is normal: an HTML/SVG overlay on top of a Canvas or WebGL layer in the same `#stage`. Put text in HTML/SVG on top so it stays sharp and checkable.

### Loading vendored libraries (offline)

Copy what you need from `/opt/motion/vendor` into `/work/film/vendor/`, then:

| Library | Load | Use |
| --- | --- | --- |
| GSAP | `<script src="./vendor/gsap.min.js"></script>` (plugins: `./vendor/SplitText.min.js`, `./vendor/MotionPathPlugin.min.js`) before the module | `const { gsap } = window; gsap.registerPlugin(window.SplitText)` |
| D3 | `<script src="./vendor/d3.min.js"></script>` | `const d3 = window.d3` |
| lottie-web | `<script src="./vendor/lottie.min.js"></script>` | `window.lottie.loadAnimation({ container, renderer: "svg", autoplay: false, loop: false, animationData })` |
| Three.js | ES module: `import * as THREE from "./vendor/three/three.module.js"` (copy the whole `three/` build folder; it imports its siblings) | as below |

Classic scripts run before the module, so the globals exist when `film.mjs` starts.

## 3. Determinism rules per engine

| Engine | Do | Never |
| --- | --- | --- |
| DOM/SVG | set transform, opacity, `d`, dash offset and text from `t` each frame | CSS `transition`/`animation`, classes toggled by events |
| GSAP | `gsap.timeline({ paused: true })` built once; `tl.time(local)` per frame | `repeat: -1` without a computed time; `gsap.ticker`; callbacks with side effects |
| D3 | compute scales once; compute each mark's attributes from `t` | `d3.transition()` (real-time timers) |
| Canvas | clear and redraw everything from `t`; seeded randomness | accumulating state between frames (trails must be recomputed from history formulas) |
| Three.js | set all transforms, uniforms and camera from `t`, then `renderer.render()`; `preserveDrawingBuffer: true` | `AnimationMixer.update(delta)` with real deltas (use `mixer.setTime(t)`), `clock.getDelta()` |
| Lottie | `goToAndStop(frame, true)` | `play()`, `loop` |
| Video | `imageSequence()` frames | seeking a `<video>` per frame for export |

`ready` waits for everything: fonts, images, sequences, glTF loads, Lottie data, decoded textures. `createFilm().ready(promise)` adds a wait.

## 4. Recipes

### 4.1 Data: honest bars that grow

```js
// index.html loads the vendored UMD build before the module: <script src="./vendor/d3.min.js"></script>
const d3 = window.d3;
const data = JSON.parse(await (await fetch("./assets/data.json")).text()); // the user's numbers only
const x = d3.scaleBand(data.map((d) => d.label), [200, 1720]).padding(0.25);
const y = d3.scaleLinear([0, d3.max(data, (d) => d.value)], [880, 260]).nice();
const g = svg("g", {}, plotSvg);
const bars = data.map((d) => svg("rect", { x: x(d.label), width: x.bandwidth(), y: 880, height: 0, fill: "var(--subject)" }, g));
// in the updater:
bars.forEach((b, i) => {
  const q = ease.outCubic(prog(t, 2 + i * 0.06, 0.9));
  const h = (880 - y(data[i].value)) * q;
  b.setAttribute("y", 880 - h); b.setAttribute("height", h);
});
```

Axis, units, period and source are visible at the rest moment. Values animate from the baseline; the final number is the exact value.

### 4.2 Isometric system

```js
const iso = (x, y, z, tw = 120, th = 60) => ({ x: (x - y) * tw / 2, y: (x + y) * th / 2 - z * th });
// Place service blocks on a grid, draw edges as SVG paths between iso points,
// move packets with along(path, q), light nodes as the voice names them.
```

Keep one projection for the whole film and one light direction (darker right faces, lighter top faces).

### 4.3 Generative field behind type

```js
const R = rng(7), N = noise(7);
const pts = Array.from({ length: 600 }, () => ({ x: R() * W, y: R() * H, s: 0.5 + R() * 1.5, o: R() * 100 }));
// updater: ctx.clearRect(...); for each p: x = p.x + N(t * 0.2 + p.o) * 40; y = p.y + N(t * 0.2 + p.o + 50) * 40; draw.
```

Keep density and contrast low behind text; let it react to the story (calm, then gathering, then aligned) rather than looping.

### 4.4 3D product turn

```js
import * as THREE from "./vendor/three/three.module.js";
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
// load the user's glTF in ready; then per frame:
model.rotation.y = lerp(-0.6, 0.6, ease.inOutCubic(prog(local, 0, dur)));
camera3.position.set(0, 0.2, lerp(4.2, 3.1, ease.outCubic(prog(local, 0, dur))));
renderer.render(scene3, camera3);
```

Three lights at most (key, fill, rim); no bloom; materials from the brand or the product photos.

### 4.5 Logo resolve

Separate the approved SVG into meaningful parts (mark and wordmark), reveal with `draw()` on strokes and masks on fills, and finish on the untouched lockup for at least 1.5 s. Never re-draw or re-colour a supplied logo.

### 4.6 Map route

Use `d3.geoMercator()` (or an equal-area projection for comparisons) fitted to the region, draw boundaries from bundled or uploaded GeoJSON, and draw the route with `draw()`; a marker follows `along()`. Attribution stays on screen.

## 5. Performance in the sandbox

- Frame cost: DOM/SVG is about 0.3 to 0.7 s per 1080p frame with screenshots; WebGL on SwiftShader can be several times that. Budget: a 60 s film at 30 fps is 1,800 frames.
- Avoid animating `filter: blur` on large layers every frame unless it matters (depth of field on 1 to 2 layers is fine).
- Pre-render heavy static layers to images once (in `ready`) and move the images.
- Keep the DOM under about 2,000 nodes; Canvas beyond that.
