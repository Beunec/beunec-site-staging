---
name: design-system
summary: Turn the film's art direction (or a supplied brand) into one consistent set of tokens, a type scale for video, spacing, safe zones and per-format layouts, so every shot and every format reads as one film.
use_when: Building film.css and the layout for each format; working inside a supplied brand; making vertical or square versions.
pairs_with: [02-creative-art-direction, 03-cinematic-motion, 07-render-qa-and-delivery]
---

# Design system for a film

## 1. Purpose

Art direction (`skills/02`) decides *what* the film looks like. This playbook makes it **consistent**: every colour, size, space and timing comes from a small set of tokens, and each format recomposes the same film. A film with tokens looks designed; a film with one-off values looks assembled.

## 2. Tokens (write them once, in `film.css`)

```css
:root {
  /* colour: derived in PLAN.md (skills/02 §4) or taken from the brand */
  --field: #1b1f1d;      /* dominant space, 60-70% */
  --subject: #c9b99a;    /* main objects, 20-30% */
  --accent: #d2553f;     /* meaning, once per shot */
  --ink: #f1ece2;        /* text on field */
  --ink-muted: #b9b2a5;  /* secondary text */
  --line: rgba(241, 236, 226, 0.18);
  /* type */
  --display: "Fraunces", Georgia, serif;
  --text: "Inter", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, monospace;
  /* space: one unit, multiples only */
  --u: 8px;
  /* motion: the film's character (skills/02 §7) */
  --cut: 0.6s;
}
#stage { background: var(--field); color: var(--ink); font-family: var(--text); -webkit-font-smoothing: antialiased; }
```

The same values live in JS where motion needs them (`const C = getComputedStyle(document.documentElement)`), so CSS and JS never disagree.

Contrast: check `--ink` on `--field`, and on the darkest and lightest areas of any photo or gradient behind text, at least 4.5:1 for body and 3:1 for large display type. If a photo sits behind text, add a scrim in the field colour (a gradient from 85% to 0%), not a grey box.

## 3. Type scale for video

Video is viewed at a distance and on phones. Sizes at 1920x1080 (scale proportionally for 2560x1440; vertical has its own column):

| Role | 16:9 (1920x1080) | 9:16 (1080x1920) | Weight / tracking |
| --- | --- | --- | --- |
| Mega (hook, verdict) | 160 to 260 px | 120 to 180 px | 700 to 900, -0.04em |
| Display (shot headline) | 72 to 110 px | 64 to 88 px | 600 to 700, -0.03em |
| Title | 48 to 64 px | 48 to 60 px | 600, -0.02em |
| Body line | 30 to 40 px | 34 to 42 px | 400 to 500 |
| Label, callout | 22 to 28 px | 24 to 30 px | 500 to 600 |
| Fine print (sources) | 18 to 22 px | 20 to 24 px | 400, muted |

Rules:
- Nothing essential below 22 px at 1080p.
- Line height 1.0 to 1.1 for display, 1.3 to 1.45 for lines.
- Tabular figures for numbers that change (`font-variant-numeric: tabular-nums`), with width reserved for the final value.
- Two families at most; the display voice for headlines only.

## 4. Space and grid

- A 12-column grid for 16:9 with 120 to 160 px outer margins; a 4-column grid for 9:16 with 72 px margins; 8-column for square with 80 px margins.
- All spacing in multiples of `--u` (8 px). Gaps between related items: 2 to 3 units; between groups: 6 to 10 units.
- Align text to the grid edges, not to the centre, unless the shot is a deliberate central-axis composition.

## 5. Safe zones

| Format | Keep essential text inside | Why |
| --- | --- | --- |
| 16:9 1920x1080 | x 96 to 1824, y 64 to 1016 | TV and player overlays |
| 9:16 1080x1920 | x 72 to 1008, y 250 to 1540 | profile, caption and button areas on Reels, Shorts, TikTok |
| 1:1 1080x1080 | x 80 to 1000, y 80 to 1000 | feed crops |

Images and backgrounds may bleed past safe zones; text and key subjects may not (except elements marked `data-qa="free"`, chosen on purpose).

## 6. One timeline, several formats

Formats share the timeline (and the soundtrack); the layout recomposes. Build it in, don't bolt it on:

```js
const fmt = new URLSearchParams(location.search).get("format") || "wide";
const L = {
  wide:     { W: 1920, H: 1080, cols: 12, margin: 140, display: 96, focus: { cx: 960, cy: 470 } },
  vertical: { W: 1080, H: 1920, cols: 4,  margin: 72,  display: 76, focus: { cx: 540, cy: 760 } },
  square:   { W: 1080, H: 1080, cols: 8,  margin: 80,  display: 80, focus: { cx: 540, cy: 470 } },
}[fmt];
document.documentElement.dataset.format = fmt;   // CSS: :root[data-format="vertical"] .headline { ... }
```

What changes per format, and what doesn't:

| Changes | Stays |
| --- | --- |
| Positions, grid columns, text sizes and line breaks | Timing of every beat, cut points, voice and music |
| Camera framing (tighter in vertical; focus point moves to the upper middle) | The concept, palette, type families, motion character |
| Number of simultaneous items (rows instead of columns, fewer at once) | The order of information |
| Caption position (above the vertical bottom safe line) | Callout targets (they follow the camera) |

Check every format with `preview_frames(query="format=vertical")` at the same moments as the wide version.

## 7. Working inside a supplied brand

- **Colours:** use the brand's values exactly; map them to `--field`, `--subject`, `--accent` and the ink pair by their documented roles (primary, secondary, highlight).
- **Type:** use the brand font if the user supplied the files (WOFF2 or TTF in uploads); otherwise the closest bundled family, and say so in the summary.
- **Logo:** the supplied file only, never redrawn; clear space as specified, or at least the height of the mark's main letter.
- **Tone:** the brand's motion guidance (if any) sets the motion character.
- Keep inventing inside it: concept, camera, composition and rhythm are still yours.

**Worked example: Beunec and Aselius** (one brand's choices, not defaults for others):
- Canvas `#f4f4f0` light or charcoal `#111111` dark, sage `#6b7a6e` as the single accent, slate `#7a8b99` for labels.
- Inter only.
- Chapter kickers like "03 · Pick an engine".
- Slow camera pushes on real screenshots, callouts on the spoken word.

Those choices fit that brand's calm, precise tone. A coffee brand or a children's lesson would get entirely different tokens from its own art direction.

## 8. Consistency checks

- [ ] Every colour in the film comes from the tokens (search the code for stray hex values)
- [ ] Every text size comes from the scale; nothing essential under 22 px at 1080p
- [ ] Contrast checked on the real backgrounds, including photos and gradients
- [ ] Spacing in multiples of 8; text aligned to the grid
- [ ] Safe zones respected in every format; `data-qa="free"` used only on purpose
- [ ] Vertical and square checked at the same moments as wide
