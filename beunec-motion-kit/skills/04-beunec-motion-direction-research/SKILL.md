---
name: beunec-motion-direction-research
summary: How Beunec AI researches, directs and plans a motion piece before building it, so that the video or website says something true, in the right order, at the right pace.
description: Load at the start of every motion task (video or web) and before writing any code. It turns a request into a brief, a truth inventory, a story spine, a beat sheet (video) or a motion map (web), and a list of the exact assets and facts you will use. It also holds the directing heuristics, the platform delivery specs and the primary technical sources. Pairs with 05-beunec-motion-design-system (look and rules) and with 01, 02 or 03 (how to build).
version: 1.0
applies_to: [rivine-taskforce motion video, rivine-code frontend]
companions: [05-beunec-motion-design-system, 01-beunec-cinematic-motion-video, 02-beunec-motion-website-nextjs, 03-beunec-motion-website-html]
---

# Direction and research for Beunec motion

## 0. Why this step exists

Most weak motion work fails before the first line of code: it animates a vague message, invents a screen, or paces itself by effects instead of by meaning. This note makes you decide, in writing, what the piece must say, what is true, what the viewer sees at each moment and why. It costs a few minutes and saves every revision after it.

Output of this step is a short **direction document** (kept in your working notes or delivered with the source) containing the six artefacts in section 2. Do not skip any of them; a two-line version is fine for small tasks.

## 1. Inputs to collect first

Before you plan, gather and read:

| Input | Where to look | If missing |
| --- | --- | --- |
| The request, in the requester's words | The task | Ask only if the purpose is genuinely ambiguous; otherwise choose a reversible default and state it |
| Product truth | Official docs, the product itself, the requester's notes | Do not fill gaps from memory. Mark as unknown and leave it out |
| Real visual assets | Screenshot folders, the live product, brand kit, existing site media | Ask for them, or capture them from the real product if you have access. Never draw a fake UI |
| Existing brand and site | The site's stylesheet, tokens, fonts, components | Use `05-beunec-motion-design-system` tokens |
| Audio | Supplied voiceover and music files | Write a voiceover script and a music prompt (see 01) and deliver a valid silent cut |
| Delivery targets | Where it will be posted or embedded | Default: 16:9 1920x1080 for web, plus a 9:16 1080x1920 social cut |
| Constraints | Length, language, deadline, legal or regulated content | Defaults: story 90 to 180s, reel 15 to 20s, English |

Read the real documentation for the product you depict. For Beunec, the public docs live at `beunec.co/aselius-platform/docs`. Anything that reveals internal architecture, code, providers or infrastructure stays out of public motion work.

## 2. The six artefacts

### 2.1 Purpose sentence

One sentence: what the viewer must understand or feel at the end, and what they should do next.

> Example (Aselius story): "A first-time viewer understands that Aselius is agentic infrastructure software whose specialized Rivine engines turn a request into real, editable, publishable files, and knows to open aselius.beunec.com."

### 2.2 Truth inventory

Three columns, filled honestly:

| Confirmed (with source) | Provided by requester (attribute it) | Unknown (do not imply) |
| --- | --- | --- |
| "Eight Rivine engines" (product docs) | "Most cost-effective engine is TaskForce" (requester) | Performance numbers, customer counts |

Rules: no fabricated numbers, quotes, testimonials, logos, benchmarks or outcomes. In regulated subjects (health, finance, law, safety) prefer precise labels and add a disclaimer card when needed.

### 2.3 Audience and tone

Who is watching (expert or newcomer), where (feed, landing page, conference screen), with or without sound, and the tone in three words. Beunec default: **calm, precise, confident**.

### 2.4 Story spine

The order of ideas. A reliable spine for product stories:

1. **What it is** (one bold claim, in plain words).
2. **Where things are** (orientation: the main screen and its parts).
3. **How you start** (the one choice the user makes).
4. **Watch it work** (proof: live steps, human approval).
5. **What you get** (the deliverable, shown as itself).
6. **Where it goes** (share, publish, other devices).
7. **Beyond** (other surfaces and integrations).
8. **Why this, not that** (differentiation stated positively).
9. **Get started** (name, URL, one call to action).

Each chapter is one idea. If a chapter needs two ideas, split it.

### 2.5 Beat sheet (video) or motion map (web)

**Video beat sheet.** One row per scene. The narration line comes first, because it sets the clock.

| # | Chapter | Voice line (exact) | Screen or layout | Camera | Callouts on words | Emphasis phrase |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | What Aselius is | "Most AI gives you a reply. Aselius gives you the work." | Mega statement, two lines | Static, lights drift | none | "the work" |
| 3 | Find your way around | "Everything lives in one sidebar: your workspaces, Connector, ..." | `automations-light` screenshot | Push from full frame to the sidebar at z 1.95 on "your" | one per item, on its word | "one sidebar" |

**Web motion map.** One row per section of the page.

| Section | Meaning to express | Motion | Technique | Fallback | Risk |
| --- | --- | --- | --- | --- | --- |
| Hero | "This is agentic infrastructure" | Kinetic headline, underline on the key phrase | CSS keyframes, server-rendered spans | Static headline | Low |
| Product tour | "These are real screens" | Frames tilt up and settle on scroll | `sd-rise` scroll timeline | Static frames | Low |
| Feature cards | "There are eight engines" | Staggered reveal | `data-reveal` + `--rv-i` | Visible cards | Low |

### 2.6 Asset list

Every screenshot, logo, font, audio file and clip you will use, with its path or source and its licence. Use real file names (for Beunec: `public/media/aselius/<stem>.webp`, manifest in `src/lib/aselius-media.ts`). Fonts: Inter (open licence). Music and voice: supplied by the requester or generated with their approved tools only.

## 3. Directing heuristics

The five cinematic ideas from Mark Christiansen (School of Motion, "What Makes a Cinematic Shot"), translated into Beunec practice:

| Idea | In practice |
| --- | --- |
| **Less is more** | One screen, one claim, one emphasis per beat. Remove anything that does not serve the line being spoken. |
| **Direct attention** | The camera pushes to the region being named; a callout dot lands on the exact pixel; everything else is darker or out of frame. |
| **Lighting carries emotion** | Two soft radial lights (sage and slate) drift slowly behind content; a vignette pulls the eye to centre. Never flares, never bloom. |
| **The camera has a point of view** | Push in to reveal detail, pull out to show context, hold to let the viewer read. Every move has a reason you could say out loud. |
| **Composition is a point of view** | Mega statements sit centred in negative space; screens sit high with the caption below; card grids align to the same margins as captions. |

Questions to answer for every scene:

1. What can the viewer not misunderstand by the end of this beat?
2. What is the visual evidence, rather than an assertion?
3. What does the camera move reveal?
4. What must stay still so the viewer can read?
5. What is heard, and what is silent?
6. Where are the platform safe areas?
7. What makes this specific to this product rather than a template?

## 4. Pacing math

- **Narrated video:** the recorded voice sets every duration. A comfortable read is about 2.5 words per second (150 wpm). Scene length = voice lead-in (0.75s) + measured line length + breath (about 0.9s) + crossfade (0.6s). See 01 section 4 for the exact model.
- **Unnarrated video:** hold each text beat for at least `words / 2.5 + 1.5` seconds.
- **Social vertical:** the first 1.5 seconds must show the subject and the claim; keep lines to 6 words where possible.
- **Web:** headline words settle within about 1 second of first paint; nothing the user needs (navigation, CTA) waits for an animation.

## 5. Platform delivery specs

Verify current specs on the platform's own help pages before a high-stakes upload; these are reliable defaults.

| Destination | Frame | Notes |
| --- | --- | --- |
| Website embed | 1920x1080 (16:9), H.264 MP4 + VP9 WebM, 30fps | CRF 24 to 27, AAC 160k, poster WebP, captions VTT available |
| YouTube | 16:9; upload 2560x1440 or larger for sharper playback | H.264 high quality (CRF 16 to 18), AAC 320k 48kHz, about -14 LUFS integrated, -1 dBTP |
| LinkedIn feed | 16:9 1920x1080, or 1:1 / 4:5 for feed-first | Same master as YouTube works; keep text large; first frame must read |
| Instagram Reels, YouTube Shorts, TikTok, Stories | 9:16 1080x1920 | Recompose, do not crop. Keep text inside y 250 to 1540 and x 72 to 1008 |
| Presentation screens | 16:9 at the room's resolution | Sound optional, so on-screen words must carry the story |

Loudness reference: streaming platforms normalise around -14 LUFS; web players do not normalise, so web cuts sit around -16 LUFS for comfort.

## 6. Voiceover and music direction

- Write the voice lines first; they are the script and the on-screen captions at the same time.
- One idea per line, 6 to 25 words. Avoid parentheses and symbols; spell out what the voice should say ("aselius dot beunec dot com", "M C P").
- Voice: calm, clear, warm narrator, mid pitch, steady pace near 150 wpm. For ElevenLabs: Multilingual v2, stability 55 to 65, similarity 75, style 0 to 10, speaker boost on, and a pronunciation dictionary for product names.
- Music: instrumental, around 88 BPM for stories and 96 BPM for reels, warm pads and soft piano or plucks, leave 300Hz to 3kHz open for the voice, small lifts at chapter changes, a clean resolve at the end. No vocals, no risers, no sound effects.
- When audio arrives, measure it (see 01 section 5) and re-time the picture to it. Never stretch a voice more than 12%.

## 7. Research sources (primary, check the installed versions)

Direction:
- Mark Christiansen, School of Motion, *What Makes a Cinematic Shot: A Lesson for Motion Designers*.

Video rendering and timing:
- Playwright screenshots and page control: https://playwright.dev/docs/screenshots
- FFmpeg documentation (libx264, concat demuxer, loudnorm, sidechaincompress, silencedetect): https://ffmpeg.org/ffmpeg-all.html
- Remotion (React video, alternative engine): https://www.remotion.dev/docs/render and https://www.remotion.dev/docs/composition
- MDN `requestAnimationFrame` (preview only, never for export): https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame

Web motion:
- CSS scroll-driven animations: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations
- `animation-timeline` support: https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline
- Motion for React (`useScroll`, `useTransform`, `useReducedMotion`): https://motion.dev/docs/react-use-scroll
- GSAP ScrollTrigger (only when justified): https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Next.js fonts: https://nextjs.org/docs/app/getting-started/fonts

Accessibility:
- WCAG 2.2 Animation from interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- WCAG 2.2 Pause, stop, hide: https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide
- WCAG 2.2 Three flashes: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold

Sound practice:
- Plan voice timing before word animation.
- Cut on spoken phrase boundaries or motivated visual actions.
- Hold before proof points and after the final action.
- Check the real render for flicker and unsafe flashes.
- Use people and third-party brands only with rights, and depict them honestly.

## 8. Hand-off checklist

Before you start building, confirm:

- [ ] Purpose sentence written.
- [ ] Truth inventory filled; every on-screen claim maps to the confirmed or attributed column.
- [ ] Story spine has one idea per chapter.
- [ ] Beat sheet (video) has an exact voice line per scene, or motion map (web) has a fallback per section.
- [ ] Every asset exists at a real path.
- [ ] Delivery targets and specs chosen.
- [ ] Copy follows `05` section 5 (no em dashes, real names, plain verbs).

Then open the build skill: `01` for video, `02` for Next.js, `03` for plain HTML/CSS/JS.
