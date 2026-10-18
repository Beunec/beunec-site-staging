# Motion studio

Source for the two videos on the site. Both are built only from real Aselius screenshots in
`public/media/aselius`, and every sentence on screen lives in `explainer/scenes.js`.

| Cut | Output | Length | Where it plays |
| --- | --- | --- | --- |
| `story` | `public/media/aselius-story.mp4`, `aselius-story.en.vtt`, `aselius-story-poster.webp` | about 1:39, 1920x1080, 30 fps | Aselius page (`#story`), docs index link |
| `reel` | `public/media/aselius-reel.mp4`, `aselius-reel-poster.webp` | 18 s seamless loop, 1280x720 | Home page, Aselius gallery |

## Render

Needs Node, `ffmpeg` on `PATH`, the Inter font installed, and Playwright with a Chromium.

```bash
npm i --no-save playwright           # once
node motion-studio/render.mjs story  # full explainer, captions, chapters, poster
node motion-studio/render.mjs reel   # the silent loop
node motion-studio/render.mjs story --stills 3,30,57   # check a few frames first (motion-studio/out)
```

Set `CHROMIUM_PATH` to point at a specific Chromium build.

## How it works

`explainer/index.html` loads `scenes.js`, which builds every scene once and exposes
`window.renderAt(t)`. That function is pure: it sets transforms and opacity from `t` alone, with
no timers, `Date.now()` or randomness, so the renderer can seek any frame in any order and always
get the same picture. `render.mjs` seeks frame by frame, pipes PNGs into ffmpeg (H.264, yuv420p,
faststart), then writes the captions file and `chapters.json` from the same script.

## Editing

- Change words in the `scene(...)` calls; the last argument of each is its caption text.
- Camera moves are keyframes of an image-space focus point and zoom; callouts are pinned to image
  coordinates, so they follow the camera.
- If a chapter time changes, update `CHAPTERS` in `src/app/aselius-platform/page.tsx` to match
  `chapters.json`.
- Keep the copy factual: only describe what the screenshot shows or what the docs state.
