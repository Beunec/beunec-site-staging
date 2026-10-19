# Beunec motion kit

Upload-ready Aselius videos, and the five skills Beunec AI (Rivine TaskForce and Rivine Code) uses to make motion graphics and motion websites like them.

## Videos

| File | Frame | For | Audio |
| --- | --- | --- | --- |
| `videos/aselius-story-16x9-1440p.mp4` | 2560x1440 (16:9), 30 fps, 2:41 | YouTube, LinkedIn, presentations | Voiceover + music, AAC 320k 48 kHz, about -14 LUFS |
| `videos/aselius-story-9x16.mp4` | 1080x1920 (9:16), 30 fps, 2:41 | Instagram Reels, YouTube Shorts, TikTok, LinkedIn mobile | Voiceover + music, AAC 320k 48 kHz, about -14 LUFS |
| `videos/aselius-reel-9x16.mp4` | 1080x1920 (9:16), 30 fps, 18 s loop | Reels, Shorts, TikTok, Stories | Voiceover + music, AAC 320k 48 kHz, about -14 LUFS |

- **No subtitles needed.** Every spoken line is written on screen as it is said, so nothing is burned in twice. The English captions file (`public/media/aselius-story.en.vtt`) is there if a platform asks for one.
- **Why 1440p for the story master:** YouTube typically streams uploads of 1440p and above with a higher-quality codec, so text and UI screenshots stay sharp even when viewers watch at 1080p.
- **Vertical is recomposed, not cropped:** captions sit inside the social safe zone (clear of the top 250 px and bottom 380 px where app buttons sit), screens are framed tighter, grids become two columns, and the reel shows each spoken line as a kinetic caption so it reads with the sound off.
- **Story chapters (for the YouTube description):**

```
0:00 What Aselius is
0:17 Find your way around
0:36 Pick an engine
0:56 Watch it work
1:14 Deliverables, not chat
1:37 Share it anywhere
1:51 Beyond the browser tab
2:23 Why Aselius
2:33 Get started
```

### Re-exporting

Everything is rebuilt from source in `motion-studio/`:

```bash
npm i --no-save playwright                      # once; uses an installed Chromium (CHROMIUM_PATH)
node motion-studio/export-social.mjs            # renders all three, then masters the audio into videos/
node motion-studio/export-social.mjs --only story-9x16
```

The voiceover and music it uses are in `motion-studio/audio/`. Line timings measured from the recorded voiceover are in `motion-studio/explainer/measured.js`; change them only if you record a new read.

## Skills

Each skill is a self-contained agent note. Load **05** and **04** for every motion task, then the build skill for the job.

| # | Skill | Engine | Use it to |
| --- | --- | --- | --- |
| 01 | [`beunec-cinematic-motion-video`](skills/01-beunec-cinematic-motion-video/SKILL.md) | Rivine TaskForce | Direct, build, render, sync and verify a motion-graphics video in HTML/CSS/JS (story, reel, launch film, 9:16 social cut) |
| 02 | [`beunec-motion-website-nextjs`](skills/02-beunec-motion-website-nextjs/SKILL.md) | Rivine Code (frontend) | Build or surgically upgrade a Next.js / React / TypeScript site with kinetic type, scroll depth and motion media |
| 03 | [`beunec-motion-website-html`](skills/03-beunec-motion-website-html/SKILL.md) | Rivine Code (frontend) | Build a complete motion website in plain HTML, CSS and JavaScript, no framework or build step |
| 04 | [`beunec-motion-direction-research`](skills/04-beunec-motion-direction-research/SKILL.md) | Both | Turn a request into a purpose, truth inventory, story spine, beat sheet or motion map, and pick delivery specs |
| 05 | [`beunec-motion-design-system`](skills/05-beunec-motion-design-system/SKILL.md) | Both | The shared tokens, type, easing, durations, copy rules, accessibility floor and acceptance rubric; beunec.co and these videos as the worked reference |

How they fit together:

```
request
  -> 04 direction (purpose, truth, spine, beats or motion map)
  -> 05 design system (tokens, motion values, copy rules)
  -> 01 video  |  02 Next.js site  |  03 HTML site
  -> verify (stills, ffprobe, loudness, sync  |  build, browser, reduced motion)
  -> report (what was made, measured, verified, not verified)
```

These skills were rewritten from four source notes (a cinematic motion graphics skill, a kinetic typography and scroll art direction skill, which was supplied twice, and a research and direction reference). They keep the useful substance of those notes, drop the parts that do not fit Beunec's stack, and add the exact patterns, values and checks from beunec.co and the Aselius videos, so any model that follows them produces the same calm, consistent result.
