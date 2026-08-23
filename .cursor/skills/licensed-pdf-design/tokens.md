# Design token presets

Map every visual choice to these CSS custom properties. Swap the preset; keep layout CSS stable.

```css
:root {
  --ink: ;
  --muted: ;
  --accent: ;
  --accent-deep: ;
  --paper: ;
  --panel: ;
  --rule: ;
  --eq: ;
  --eq-edge: ;
  --quote: ;
  --code: ;
  --code-bg: ;
  --table-head: ;
  --table-head-ink: ;
  --table-stripe: ;
  --cover-grad-top: ;
  --kicker: ;
  --serif: ;
  --sans: ;
  --mono: ;
}
```

## research (Akinnawo-Logic-V2 / Beunec licensed paper)

Ivory paper, sage institutional accent, serif body. Equation blocks are pale sage with a left rule.

```
--ink: #1c241e
--muted: #4d5a52
--accent: #5f7164
--accent-deep: #3d4d42
--paper: #f7f3ea
--panel: #efe8d9
--rule: #c9bfa8
--eq: #e7eee8
--eq-edge: #6b7a6e
--quote: #f3ece0
--code: #e7efe8
--code-bg: #1a211c
--table-head: #3d4d42
--table-head-ink: #f4f1ea
--table-stripe: #eef2ee
--cover-grad-top: #eef3ee
--kicker: #5f7164
--serif: "Iowan Old Style", Palatino, "Times New Roman", serif
--sans: "Avenir Next", "Segoe UI", sans-serif
--mono: "SF Mono", Menlo, Consolas, monospace
```

Mermaid `themeVariables`: primaryColor `#e7eee8`, primaryBorderColor `#5f7164`, lineColor `#3d4d42`, tertiaryColor `#f7f3ea`.

## scientific (journal / arXiv-adjacent)

Cool white, ink-blue accents, denser type. Minimize decoration.

```
--ink: #1a1a1a
--muted: #4a4a4a
--accent: #1f4e79
--accent-deep: #163a5c
--paper: #ffffff
--panel: #f4f6f8
--rule: #c5cdd4
--eq: #f0f4f8
--eq-edge: #1f4e79
--quote: #f7f7f5
--code: #1a1a1a
--code-bg: #f4f6f8
--table-head: #1f4e79
--table-head-ink: #ffffff
--table-stripe: #eef2f6
--cover-grad-top: #f4f6f8
--serif: "TeX Gyre Termes", "Times New Roman", serif
--sans: "TeX Gyre Heros", "Helvetica Neue", sans-serif
```

Page: two-column optional for long reviews; default single column for specs. Display math numbered if the source uses tags.

## business / corporate

Neutral gray paper, single brand accent, more sans. Cover is a horizontal band, not an academic box.

```
--ink: #1b1d21
--muted: #5c6370
--accent: #0f6e56
--accent-deep: #0b5341
--paper: #fbfbfa
--panel: #f1f2f0
--rule: #d8dbd6
--eq: #e8f3ef
--eq-edge: #0f6e56
--quote: #f4f5f3
--code-bg: #1b1d21
--table-head: #1b1d21
--table-head-ink: #fbfbfa
--table-stripe: #f1f2f0
--serif: "Georgia", serif
--sans: "Avenir Next", "Helvetica Neue", sans-serif
```

Body can be sans at 10.5–11pt. Kicker: company name + document class (Brief, White paper, Board pack).

## non-profit

Warmer paper, one human accent (terracotta or leaf), generous leading, less chrome.

```
--ink: #2b241c
--muted: #6a5e50
--accent: #b85c38
--accent-deep: #8c4328
--paper: #fbf6ee
--panel: #f3eadc
--rule: #e0d2bc
--eq: #f6efe4
--eq-edge: #b85c38
--quote: #f7eee0
--table-head: #8c4328
--table-head-ink: #fbf6ee
--table-stripe: #f3eadc
```

Cover: mission line under title. Avoid luxury-metal palettes.

## government

High contrast, official blue/black, no gradients, WCAG-minded. Serif headings optional; sans body preferred for accessibility.

```
--ink: #111111
--muted: #333333
--accent: #1b365d
--accent-deep: #111111
--paper: #ffffff
--panel: #f2f2f2
--rule: #767676
--eq: #f2f2f2
--eq-edge: #1b365d
--quote: #f7f7f7
--table-head: #1b365d
--table-head-ink: #ffffff
--table-stripe: #f2f2f2
--cover-grad-top: #ffffff
--sans: "Source Sans 3", "Noto Sans", sans-serif
--serif: "Source Serif 4", "Noto Serif", serif
```

No color as the only information. Minimum body 11pt. Skip decorative mermaid palettes; use grayscale nodes plus one blue.

## STEM (textbook / lab / engineering)

Bright paper, one technical accent (teal or engineering orange), monospace-friendly. Equations get more vertical air.

```
--ink: #12161a
--muted: #4b5560
--accent: #0e7490
--accent-deep: #155e75
--paper: #f8fafb
--panel: #eef3f5
--rule: #c5d0d6
--eq: #e6f4f7
--eq-edge: #0e7490
--quote: #eef3f5
--code: #d7f3ea
--code-bg: #0f1720
--table-head: #155e75
--table-head-ink: #f8fafb
--table-stripe: #eef3f5
--sans: "IBM Plex Sans", "Segoe UI", sans-serif
--serif: "IBM Plex Serif", Georgia, serif
--mono: "IBM Plex Mono", Menlo, monospace
```

Algorithm listings use `--code-bg`. Keep mermaid orthogonal (flowchart TD) and label math in node text as Unicode (ρ, g) if the renderer will not run KaTeX inside SVG.

## Other mappings

| Setting | Paper | Accent | Type bias |
|---|---|---|---|
| legal | white | navy | serif, 1.5 leading, numbered clauses |
| healthcare | white | clinical teal `#0f766e` | sans, high contrast, no red/green-only keys |
| education | warm white | indigo `#3730a3` | larger headings, more callouts |
| finance | cool gray | charcoal + one gold rule | dense tables, navy heads |
| climate / NGO | `#f4f7f2` | forest `#3f6212` | same structure as non-profit |
