---
name: media-and-generation
summary: Use the user's uploaded images, video, audio and documents as real media in the sandbox (crop, cut out, grade, sequence), and call voice, music, Grok Imagine image and Grok Imagine Video 1.5 Lite generation only when the brief needs them.
use_when: The user attached anything; or you are about to call generate_voiceover, generate_music, generate_image or generate_video_clip.
pairs_with: [01-direction-and-research, 03-cinematic-motion, 07-render-qa-and-delivery]
---

# Media and generation

## 1. Uploads are real files

Everything the user attached is in `/work/film/assets/uploads/` with `manifest.json`:

```json
[{ "id": "u1", "name": "hero.jpg", "kind": "image", "mime": "image/jpeg", "width": 4032, "height": 3024, "path": "assets/uploads/hero.jpg" },
 { "id": "u2", "name": "demo.mp4", "kind": "video", "width": 1920, "height": 1080, "duration": 21.4, "fps": 30,
   "path": "assets/uploads/demo.mp4", "frames": "assets/uploads/demo/frames", "contact": "assets/uploads/demo/contact.jpg" },
 { "id": "u3", "name": "deck.pdf", "kind": "document", "pages": 12, "path": "assets/uploads/deck.pdf", "rendered": "assets/uploads/deck/page-%02d.png", "text": "assets/uploads/deck.txt" }]
```

Images are shown to you at the start. Look at anything else with `view_image` (contact sheets, rendered pages, your own crops). The user's material is the hero: their product, people, places and data beat anything generated.

## 2. Working with images (Pillow, OpenCV, ffmpeg in the sandbox)

Never edit the original; write to `assets/work/`.

| Task | How |
| --- | --- |
| Crop to the subject for a shot | `python3 -c "from PIL import Image; im=Image.open('assets/uploads/hero.jpg'); im.crop((x0,y0,x1,y1)).save('assets/work/hero-face.jpg', quality=92)"` |
| Fit for the frame without upscaling blur | crop first, then resize with `Image.LANCZOS` to at most the displayed size times the render scale |
| Grade to the film's palette | adjust levels and white balance; a subtle duotone or split-tone towards the palette's field and accent (`ImageOps.colorize` on luminance, then blend 20 to 40%) |
| Cut out a subject | for a clean background: threshold or `cv2.grabCut` with a rectangle; save PNG with alpha; check edges at 200% with `view_image` |
| Extend a background for vertical | mirror-blur the edges (`ImageFilter.GaussianBlur` on a scaled copy behind) rather than stretching |
| Screenshot callouts | find exact pixel coordinates of the control (open the image, read coordinates) and use them in `callout()` |
| Texture or grain | generate once with numpy into a PNG, overlay at 5 to 10% |

Use processed images as layers on the camera (`skills/03`): photos look cinematic with a slow push, depth (cut-out subject on the near layer, background on the far layer) and light.

## 3. Working with video

- Look at `contact.jpg` first; choose the in and out points.
- Trim and retime with ffmpeg, then extract frames at the film's fps:
  ```bash
  ffmpeg -ss 3.2 -to 8.7 -i assets/uploads/demo.mp4 -vf "fps=30,scale=1920:-2" -q:v 3 assets/work/demo-a/%05d.jpg
  ```
- Play deterministically:
  ```js
  const clip = imageSequence(mid, { dir: "./assets/work/demo-a", count: 165, fps: 30, start: 12.0, className: "clip" });
  film.ready(clip.ready);
  // in the updater: clip.update(t);
  ```
- Treat clips like screenshots: frame them, move the camera over them, call out what matters.
- Keep clips short (2 to 6 s per shot). Long screen recordings are cut into the moments that prove the point.
- Speed changes: extract with `setpts=0.5*PTS` for 2x; never above 3x for UI the viewer must follow.

## 4. Working with audio and documents

- **A user voiceover:** measure it (`ffprobe` duration; `ffmpeg -af silencedetect=n=-35dB:d=0.25` for line breaks). Write `vo.json` with each line's measured start and end and run `voiceover.mjs`. Picture follows the voice; never stretch a voice more than 12%.
- **User music:** use as the bed; measure tempo by onsets if you cut on beats; it will be mastered with the rest.
- **Documents:** read the text file for facts; use rendered pages as images (crop the chart or table you need and animate over it, or rebuild the chart from its numbers with D3 when it must move).

## 5. Generation: only when the brief needs it

| Tool | Call only when | Never for |
| --- | --- | --- |
| `generate_voiceover` | the user asked for narration or voice, gave a script to read, or asked for an inherently narrated format | silent briefs; repeating on-screen text |
| `generate_music` | the user asked for music or sound, or the deliverable implies it (an ad, launch film, reel "with music") | films the user wants silent; sensitive or analytical pieces unless asked |
| `generate_image` | the film needs photographic or illustrative content code cannot draw well, and no upload covers it | text, numbers, UI, charts, diagrams, logos, fake product screenshots |
| `generate_video_clip` | a shot needs real-world motion code cannot make (water, fabric, people, a camera through a real place), and no upload covers it | typography, UI, data, logos, filler |

Plan each call in `PLAN.md` with its reason. The host enforces per-task budgets and reports what is left; stay inside them. If you chose silence, say so in the summary.

### 5.1 Voiceover

```json
{ "voice": "Charon", "style": "calm, warm, confident; mid pace",
  "lines": [
    { "text": "Every launch starts as one idea.", "pause_after": 0.5 },
    { "text": "Then it becomes a hundred tasks.", "pause_after": 0.6 }
  ] }
```

- Write for the ear: short sentences, one beat per line, 6 to 18 words.
- Spell out what must be read differently ("dot com", "M C P", numbers as words when they must be said a certain way).
- No stage directions inside the text (the model reads text verbatim); delivery goes in `style`.
- After the call: save the result as `vo.json`, then
  ```bash
  node /opt/motion/voiceover.mjs vo.json --out timing.json --emphasis beats.json --film 32
  ```
  `beats.json` lists the words the picture should hit: `[{ "line": 1, "phrase": "hundred" }]`.
- Line starts are exact; word times are estimates. Shot starts sit on line starts; accents on words with 0.1 s lead.

### 5.2 Music

Write the prompt as a short spec:

> "Instrumental only. 92 BPM, D minor to F major. Felt piano motif, warm analog pad, soft sub bass entering at 8 seconds, light brushed percussion from 16 seconds. Leave 300 Hz to 3 kHz open for a voice. Small lifts every 8 bars, a clean resolve on the last bar with a natural reverb tail. No vocals, no risers, no sound effects."

- `seconds` = the film's duration.
- It is faded and ducked under any voice automatically.
- Never name artists or songs.

### 5.3 Grok Imagine (images)

Prompt as a cinematographer, in this order:
1. The subject and action.
2. The setting.
3. The lens and framing ("85 mm portrait, shallow depth of field", "top-down macro").
4. The light ("low warm side light, soft shadows").
5. The palette, from `PLAN.md`.
6. The mood.
7. What to exclude ("no text, no logos, no watermarks").

> "Close-up of hands sorting paper index cards on a dark oak desk, top-down 50 mm, low warm window light from the left, palette of oxblood, bone and graphite, calm focused mood, no text, no logos, no watermarks."

- Ask for the aspect you will frame (16:9, 9:16 or 1:1), or wider than the frame so the camera can move.
- Request 2 to 4 variations only when choosing matters; look at each with `view_image`; reject anything with garbled text, wrong anatomy or off-palette colour.
- Grade the chosen image to the film's palette (§2). Overlay all text in code.

### 5.4 Grok Imagine Video 1.5 Lite (clips)

- One clear motion per clip; describe the camera move explicitly ("slow dolly forward", "static camera, steam rising").
- To keep continuity with the film, pass a still from the film or a graded image as `image_path` to animate from.
- The host returns the MP4 and extracted frames at the film's fps; use `imageSequence()`. Check the contact sheet for warping, flicker or artefacts before using a clip; trim the clean part.
- Generated clips are atmosphere and B-roll. They do not stand in for the user's real product.

## 6. Provenance

Record every upload used and every generated item in `assets/manifest.json` (source, prompt, model, time, what it is used for). The host uses it for the deliverable's asset list.

## 7. Checklist

- [ ] Every upload considered; the relevant ones used as hero material
- [ ] Processed media written to `assets/work/`, originals untouched
- [ ] Clips trimmed to the moments that matter; played with `imageSequence()`
- [ ] Each generation call justified in `PLAN.md`, within budget
- [ ] Every generated image or clip inspected; no text inside generated media
- [ ] Voice timing in `timing.json`; music length equals the film
