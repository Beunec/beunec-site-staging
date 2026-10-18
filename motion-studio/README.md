# Motion studio

Source for the two videos on the site. Both are built only from real Aselius screenshots in
`public/media/aselius`, and every sentence on screen lives in `explainer/scenes.js`.

| Cut | Output | Length | Where it plays |
| --- | --- | --- | --- |
| `story` | `public/media/aselius-story.mp4` / `.webm`, `aselius-story.en.vtt`, `aselius-story-poster.webp` | 2:41, 1920x1080, 30 fps, narrated, 19 voice lines, 9 chapters | Aselius page (`#story`), docs index link |
| `reel` | `public/media/aselius-reel.mp4` / `.webm`, `aselius-reel-poster.webp` | 18 s narrated loop, 1280x720, plays muted with a sound toggle | Home page, Aselius gallery |

## Render

Needs Node, `ffmpeg` on `PATH`, the Inter font installed, and Playwright with a Chromium.

```bash
npm i --no-save playwright           # once
node motion-studio/render.mjs story  # full explainer, captions, chapters, poster
node motion-studio/render.mjs reel   # the loop
node motion-studio/render.mjs story --stills 3,30,57   # check a few frames first (motion-studio/out)
```

Set `CHROMIUM_PATH` to point at a specific Chromium build.

## Voiceover and music (ElevenLabs)

The story is timed for narration: every scene lasts as long as its voice line needs at about 2.5
words a second, headline words appear as they are spoken, callouts appear on the word that names
them, and the captions file is the narration word for word.

```bash
node motion-studio/voiceover.mjs        # writes motion-studio/voiceover/
```

- `voiceover/story-voiceover.md`: the timed script, voice settings and the music prompt.
- `voiceover/story-lines/01.txt ... 19.txt`: one line per file for line-by-line generation (best sync).
- `voiceover/story-elevenlabs.txt`: the whole narration with timed `<break>` pauses, paste-ready.
- The same files exist for the reel.

### The recorded audio

The recordings live in `motion-studio/audio/`. `explainer/measured.js` holds where each voice line
starts and ends in them (found from the pauses in the read), and `scenes.js` times the picture to
those numbers: every story scene lasts its real line plus an even breath, sized so the story ends
with its music bed, and words, callouts and captions land on the measured pace of each line. Each
reel screen cuts in just before its line.

```bash
# after rendering: cut the story read at the measured lines, then mux
node motion-studio/mux-audio.mjs story --lines <folder of 01.wav ... 19.wav> --music motion-studio/audio/story-music.mp3
node motion-studio/mux-audio.mjs reel --voice motion-studio/audio/reel-voiceover.mp3 --music motion-studio/audio/reel-music.mp3
```

If you record a new read, re-measure its lines into `measured.js`, re-render, and mux again.

When new audio is ready:

```bash
node motion-studio/mux-audio.mjs story --lines ./vo-story --music ./music-story.mp3
# or: --voice ./voiceover.mp3 for a single continuous file
```

The mux places each line at its cue, eases a long line by up to 12%, ducks the music under the
voice, loudness-normalises, and writes the MP4 (AAC) and WebM (Opus) in place.

## How it works

`explainer/index.html` loads `scenes.js`, which builds every scene once and exposes
`window.renderAt(t)`. That function is pure: it sets transforms and opacity from `t` alone, with
no timers, `Date.now()` or randomness, so the renderer can seek any frame in any order and always
get the same picture. `render.mjs` seeks frame by frame, pipes PNGs into ffmpeg (H.264, yuv420p,
faststart), then writes the captions file and `story-meta.json` from the same script.

## Editing

- Change words in the `scene({ say })` calls. `say` is the caption and the narration; add `spoken` when the voice should read something differently from the screen (URLs).
- Camera moves are keyframes of an image-space focus point and zoom; callouts are pinned to image
  coordinates, so they follow the camera.
- Chapters and duration are written to `story-meta.json`, which the Aselius page imports, so the
  player always matches the video. Re-run `voiceover.mjs` after changing any line.
- Keep the copy factual: only describe what the screenshot shows or what the docs state.
