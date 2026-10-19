---
name: beunec-motion-design-system
summary: The shared Beunec design and motion system that every Beunec AI motion task inherits, with beunec.co and the Aselius story and reel as the worked, positive reference.
description: Load this before any motion-graphics video, motion website or motion UI task run by a Rivine engine (Rivine TaskForce for video, Rivine Code for frontend). It fixes the vocabulary, tokens, type scale, easing curves, durations, copy rules, accessibility floor and acceptance rubric so that every output reads as one consistent, considered system. When a task brings its own brand, keep the structure and rules here and swap only the token values.
version: 1.0
applies_to: [rivine-taskforce motion video, rivine-code frontend (html/css/js), rivine-code frontend (next.js/react/typescript)]
companions: [01-beunec-cinematic-motion-video, 02-beunec-motion-website-nextjs, 03-beunec-motion-website-html, 04-beunec-motion-direction-research]
---

# Beunec motion design system

## 0. How to use this note

This note is the single source of truth for *how Beunec motion looks, moves and reads*. The four companion skills tell you *how to build* a video or a website. They all point back here, and they repeat only the values they cannot work without. If a companion skill and this note ever disagree, this note wins, and you should say so in your final report.

Read it in this order:

1. Section 1, the principles. They decide every judgement call the rest of the note does not cover.
2. Section 2, the tokens. Copy them exactly. Never invent a near-miss value (for example `#6b7b6e` instead of `#6b7a6e`).
3. Section 3 and 4, type and motion. These are the values that make output feel like one family.
4. Section 5, copy rules. Most "off-brand" output fails here, not on visuals.
5. Section 9, the reference walkthrough. When unsure, do what the reference does.
6. Section 10, the acceptance rubric. Score your work honestly before you deliver.

Two kinds of task use this note:

| Task | Engine | What you deliver | Companion skill |
| --- | --- | --- | --- |
| Motion-graphics video: story explainer, product reel, launch film, social cut | Rivine TaskForce | A rendered MP4 (and editable HTML/CSS/JS source) with voiceover and music when supplied | `01-beunec-cinematic-motion-video` |
| Motion website or motion UI in an existing or new Next.js / React / TypeScript project | Rivine Code (frontend) | Working, built, browser-tested pages and components | `02-beunec-motion-website-nextjs` |
| Motion website or motion UI in plain HTML, CSS and JavaScript | Rivine Code (frontend) | Working static pages that open from disk or any static host | `03-beunec-motion-website-html` |
| Any of the above, before you build | Either | A brief, a truth inventory, a beat sheet or motion map | `04-beunec-motion-direction-research` |

Customer work: when the request is for someone else's brand, keep every *rule* in this note (principles, motion vocabulary, durations, accessibility, copy discipline, QA) and replace only the *token values* in section 2 with theirs. Do not paint a customer's product in Beunec sage unless asked.

## 1. Principles

These seven principles are the tone. Every decision should be defensible by at least one of them.

1. **Real over decorative.** Show the actual thing: real screenshots, real copy, real numbers, real file names. A camera move on a true screen beats an invented interface every time. If you do not have the real asset, say so and use a clearly labelled placeholder, never a fabricated "demo".
2. **Motion carries meaning.** Every movement must reveal, connect, emphasise or hand off. If you cannot name what a movement communicates, delete it. Text that merely fades in is an entrance, not direction.
3. **Calm confidence.** Slow camera, decisive cuts, no shake, no bounce, no glitch, no strobe. Premium means restraint: fewer moving things, each one deliberate.
4. **Readable first.** Text is on screen long enough to read twice. The rest state of every animation is a clean, legible composition. Nothing important depends on catching a moment.
5. **One focal point per beat.** At any instant the viewer knows exactly where to look. Lighting, scale, contrast and the callout dot all point at the same place.
6. **Content survives without motion.** On the web, with JavaScript off or reduced motion on, every word is present and readable. In video, the words on screen tell the story even with the sound off.
7. **Deterministic and verifiable.** A video frame is a pure function of time. A web effect has a stated rest state and a fallback. You only claim what you actually ran, rendered, measured and looked at.

## 2. Tokens

### 2.1 Colour

Beunec uses two surfaces, called **canvas** (light) and **charcoal** (dark), and two muted accents. There is no bright brand colour, and that is deliberate: emphasis comes from weight, scale, position and the sage underline, not from saturation.

| Token | Light (canvas) | Dark (charcoal) | Use |
| --- | --- | --- | --- |
| `--bg-global` | `#f4f4f0` | `#111111` | Page or video background |
| `--bg-container` | `#ffffff` | `#151515` | Cards, panels, windows |
| `--state-hover` | `#ededeb` | `#202020` | Hover fills, subtle chips |
| `--media-blank` | `#e6e6e6` | `#1d1d1d` | Media placeholders, window chrome |
| `--text-primary` | `#1a1a1a` | `#e8eaed` | Headlines and body |
| `--text-muted` | `#5c6370` | `#a3a3a3` | Supporting copy, captions |
| `--hairline` | `rgba(26,26,26,0.10)` | `rgba(232,234,237,0.10)` | Borders, dividers |
| `--accent-sage` | `#6b7a6e` | `#6b7a6e` | The one emphasis colour: underlines, dots, active states, primary buttons |
| `--accent-slate` | `#7a8b99` | `#7a8b99` | Secondary accent: kickers, eyebrow labels, secondary light |
| `--shadow-soft` | `0 24px 60px -24px rgba(17,17,17,0.18)` | `0 24px 60px -24px rgba(0,0,0,0.6)` | Elevated cards and media |

Video uses the dark set by default (`#111111` stage, `#e8eaed` text, `#8fa0ae` kickers, `#b8bcc3` sub-copy, `#8d9198` dimmed text) because it composites cleanly on every platform and makes real light-mode screenshots glow.

Rules:

- Never hard-code a one-off colour in a component. Reference the token (CSS variable or Tailwind token). In a video composition, keep the palette in one stylesheet.
- Light and dark must both be designed, not inverted. Check contrast in both (WCAG AA: 4.5:1 body, 3:1 large text).
- Sage is for *one* thing per view. If three things are sage, none of them is emphasised.
- No gradients as decoration. The only gradients allowed are: soft radial "lights" behind content (opacity at most 0.32), a vignette, and the scrim band under video captions.

### 2.2 Type

- **Family:** Inter (variable), with `system-ui, -apple-system, sans-serif` fallback. Monospace for URLs, code and identifiers: `ui-monospace, Menlo, monospace`.
- **Weights:** 400 body, 500 kickers and UI, 600 to 700 headlines. Never 800 or 900.
- **Tracking:** headlines `-0.025em` to `-0.035em` (tighter as size grows). Kickers and eyebrow labels are uppercase with `0.14em` to `0.22em` tracking.
- **Line height:** headlines `1.04` to `1.1`, body `1.5` to `1.65`.

Web scale (minimum sizes are a hard floor, set for readability on phones):

| Role | Size | Notes |
| --- | --- | --- |
| Hero headline | `clamp(2.5rem, 6vw, 4.5rem)` | One kinetic signature per page |
| Section headline | `text-3xl` to `text-5xl` (30 to 48px) | Medium weight, tight tracking |
| Body | 16px (`text-base`), 18px lead (`text-lg`) | Never below 16px for paragraphs |
| Secondary text, captions, labels | 14px (`text-sm`) | **Nothing on the site is smaller than 14px** |
| Kicker / eyebrow | 14px mono or Inter, uppercase, `tracking-[0.14em]`, slate | |

Video scale at 1920x1080 (scale proportionally for other sizes):

| Role | Size |
| --- | --- |
| Mega statement (opening, closing) | 84 to 104px, weight 700 |
| Caption headline | 58px, weight 700 |
| Top-of-frame title | 76px |
| Sub-copy | 29 to 40px, weight 400 |
| Kicker | 21px, uppercase, `0.22em` |
| Callout pill | 23px, weight 600 |
| Chip label | 20px, uppercase, `0.18em` |

Vertical 1080x1920: caption headline 62px, sub 36px, kicker 24px, mega 96px, pill 26px.

### 2.3 Space, shape and depth

- Web spacing follows the Tailwind 4px scale. Sections breathe: `py-20 md:py-28`. Content width `max-w-7xl` with `px-4 sm:px-6 lg:px-8`.
- Radius: cards `rounded-2xl` (16px), pills `rounded-full`, media frames 14px in video, phones 34px.
- Borders are hairlines (`1px` at 10% ink). Elevation uses `--shadow-soft` only.
- Video safe margins: 140px left and right at 1920 wide, captions anchored 74px from the bottom. Vertical: 72px left and right, nothing important above 250px or below 1540px (platform buttons sit there).

## 3. Motion tokens

Copy these. They are what makes Beunec motion feel like Beunec.

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Word rises, underline draws, settling transforms |
| `--ease-cine` | `cubic-bezier(0.22, 1, 0.36, 1)` | Fades, reveals, opacity |
| In-out (video camera) | cubic in-out `x < .5 ? 4x^3 : 1 - (-2x+2)^3/2` | Camera moves between keyframes |
| Linear | `linear` | Scroll-linked timelines, progress bars, time scales |

| Motion | Duration | Stagger | Distance |
| --- | --- | --- | --- |
| Headline word rise (web) | 0.95s | 65ms per word, plus 60ms lead-in | from 55% of line height, opacity 0.35 to 1 |
| Headline underline draw | 0.9s | starts after the last word, capped at 1.3s | width 0 to 100%, thickness 0.07em |
| Supporting copy fade-up | 0.9s | `--d` default 0.35s | 14px |
| Scroll reveal | 0.8s opacity, 0.95s transform | 80ms per item (`--rv-i`) | 28px rise; or 32px from left/right; or scale 0.94 |
| Video word rise | 0.55 to 0.7s | **the narration's own pace**: line length divided by word count | 105% of the word's box |
| Video crossfade between scenes | 0.6s | | |
| Video fade-up (kicker, sub-copy, cards) | 0.6 to 0.8s | at the word that names them | 10 to 30px |
| Callout appear | 0.7s | on the spoken word | dot scales 0.4 to 1, leader draws, pill slides 16px |
| Callout pulse ring | 1.6s cycle | | scale 1 to 3.2 |
| Lights drift | whole scene | | a few hundred px, never faster |

Forbidden: spring overshoot on text, elastic bounce, shake, glitch, typewriter on paragraphs, random letter scramble, infinite glow pulses, blur-in on body text, parallax on text, scroll hijacking, flashes faster than 3 per second (aim for none at all).

## 4. Motion vocabulary

Pick from this list. Do not stack them.

1. **Kinetic headline.** Each word rises out of its own mask, then one phrase gets the sage underline. The phrase is the point of the sentence ("agentic infrastructure software", "the work", "any device"). One per view.
2. **Camera on a real screen.** A screenshot in a rounded window, moved by keyframes of an image-space focus point (`x`, `y`) and zoom (`z`). The camera pushes in to the part being spoken about, holds, and drifts slightly. Never spins, never shakes.
3. **Callout.** A sage dot on the exact pixel, a pulse ring, a thin leader line and a dark pill label. It appears on the spoken word that names the thing. Its position is projected from image space, so it rides with the camera and stays a constant readable size.
4. **Lower-third caption.** Kicker (chapter number and name), headline (kinetic), sub-copy (fades in on the word that starts it), over a dark scrim band. The caption *is* the narration, so the video needs no separate subtitles.
5. **Card grid build.** Cards for engines, surfaces or features fade up one by one, each on the spoken word that names it.
6. **Mega statement.** Two short lines centered in negative space, the first dimmed, the second full white with the underline. Opening and closing beats.
7. **Device trio.** Desktop window plus two phones, entering in sequence, phones drifting slowly upward. Shows "works anywhere" without words.
8. **Scroll reveal (web).** Content below the fold rises 28px and fades in once, staggered 80ms. Content already on screen never moves.
9. **Scroll-linked depth (web).** Screenshot frames tilt up and settle (`sd-rise`), layered media drifts (`sd-drift`), a hero frame slowly zooms out (`sd-zoom`), a key statement inks in as you read (`sd-ink`), a hairline shows page progress (`sd-progress`). All behind `@supports (animation-timeline: view())`.
10. **In-view media (web).** Videos load only near the viewport, play muted while visible, pause when scrolled away.

## 5. Copy rules

Copy is half the design. These rules are strict because drift here is what makes output feel generic or contradictory.

1. **No em dashes.** Use a colon, a comma, a full stop or a middle dot (`·`) for kickers ("03 · Pick an engine"). This is a house rule across the site, docs and video.
2. **Short, declarative, concrete.** "Every step shows as it happens." not "Experience unprecedented real-time visibility into your workflows."
3. **Name the real thing.** Use the product's real names exactly as the product uses them (for Beunec: Aselius, Rivine TaskForce, Rivine Research, Rivine Code, Rivine Cicero, Rivine Creative, Rivine Confluence, Rivine Assist, Rivine Browse, Taskspace, Preview Panel, Agent Note, Aselius MCP, Selius). Never invent a feature name.
4. **Positioning (Beunec).** Aselius is *agentic infrastructure software*. Specialized Rivine engines run governed work and hand you real files you can inspect, edit, publish and export. It is not another general chat agent; say what it does instead of attacking others.
5. **Only verified claims.** No invented metrics, testimonials, customer logos, benchmarks or "X times faster". If a number appears, it has a source you can name.
6. **Spoken and shown are the same.** In narrated video, the words on screen are the narration. When the voice must read something differently (URLs: "aselius dot beunec dot com"; acronyms: "M C P"), keep a separate `spoken` string, but the meaning must match.
7. **Sentence case** for headlines and buttons. Uppercase only for kickers and chips.
8. **Calls to action are plain verbs:** "Open the app", "Watch the story", "Read the docs", "Explore Aselius".

## 6. Accessibility floor

Non-negotiable on every output:

- `prefers-reduced-motion: reduce` turns every web effect off and shows the settled state. Videos never autoplay with sound; a reduced-motion user gets controls.
- Real HTML text for every word on a web page. Split words are `aria-hidden` visual copies only when the heading carries the full accessible name, or (as on beunec.co) the split spans are the real text and read naturally.
- Tap targets at least 44x44px. Body text at least 16px, nothing below 14px.
- Focus outlines visible. No scroll trapping, no wheel or touch interception, no disabled zoom.
- Every video has a text equivalent: either the captions track or a transcript. If the words are burned into the picture as the narration, subtitles default **off** (so they do not double the on-screen text) but stay available in the CC menu.
- No flashing. Contrast AA in both themes.

## 7. Performance floor

- Animate `transform` and `opacity` only during scroll. One-off load animations may animate a background size (the underline).
- No animation library when CSS does it. On beunec.co the kinetic headline, reveals and scroll depth are all CSS, plus one small observer component.
- Media is lazy: `preload="none"`, `data-src` swapped in by an IntersectionObserver, posters as small WebP.
- Never block first paint on animation. Never ship a loading screen to synchronise motion.
- Video for the web: H.264 MP4 first, VP9 WebM fallback, poster WebP under 40KB, site cuts at CRF 24 to 27.

## 8. Anti-patterns (reject on sight)

| Anti-pattern | Why it fails | Do this instead |
| --- | --- | --- |
| Floating glassmorphism cards with no content | Generic, says nothing | Real screen, real copy |
| Every heading animates the same way | Motion stops meaning anything | One kinetic signature per view, quiet reveals elsewhere |
| Bright gradient blobs, neon glows | Off-tone, cheap | Soft radial lights at 0.24 to 0.32 opacity |
| Fake UI built to look like the product | Misleading | Use real screenshots; if missing, ask or label placeholder |
| Counters that count up from zero to an unverified number | Fabricated drama | Show the verified number, emphasise with weight and underline |
| Text animated faster than it can be read | Unreadable | Use narration pace or at least 2.5 words per second of hold |
| Subtitles duplicating on-screen narration text | Visual noise | Burned-in kinetic caption is the narration; CC off by default |
| Hidden content waiting for JavaScript | Blank page on slow devices | Visible by default; hide only below-fold items after JS runs |
| Background music louder than the voice | Unintelligible | Duck music under voice; voice at -16 LUFS (web) or -14 (master) |

## 9. The reference: beunec.co and the Aselius videos

Treat these as the worked, positive example. When a decision is unclear, do what they do.

### 9.1 The website (beunec.co)

- **Stack:** Next.js App Router with static export, Tailwind 3, Inter via `next/font` as `--font-inter`. Theme tokens live as CSS variables in one stylesheet; Tailwind colours map to those variables with `color-mix(in srgb, var(--token) calc(<alpha-value> * 100%), transparent)` so opacity modifiers work.
- **Kinetic headline:** a server component that splits words into `<span class="kt-w"><span style="--i:n">word</span></span>` and wraps the emphasised phrase (plus any trailing punctuation, so it never wraps alone) in `<span class="kt-em">`. Pure CSS keyframes play it on first paint, with no hydration wait. The underline is a background image so it wraps with the phrase on narrow screens.
- **Reveals:** one site-wide `MotionRuntime` client component. Elements carry `data-reveal` (optionally `="fade" | "scale" | "left" | "right"` and `--rv-i` for stagger). Everything is visible in server HTML; after JS runs, only elements below 92% of the viewport height get `rv-pending`, and they ease in once they intersect. On route change, every pending class is removed so nothing can stay hidden.
- **Scroll depth:** `sd-rise`, `sd-drift`, `sd-zoom`, `sd-ink`, `sd-progress`, all compositor-only and all inside `@media (prefers-reduced-motion: no-preference) { @supports (animation-timeline: view()) { ... } }`.
- **Media:** `<video data-inview>` with `<source data-src>` children; the same runtime lazy-loads, plays muted in view, pauses out of view. The home reel has a 44px sound toggle (icon-only on phones, "Sound on / Sound off" label from `sm` up). The story player has a poster play button, native controls after first play, and a chapter list beside it.
- **Readability:** body 16px, nothing below 14px, buttons and links with at least 44px tap height, a 320px-wide layout with no horizontal scroll.
- **Navigation to the product:** every Aselius section ends in plain-verb links: Open the app, Watch the story, Read the docs.

### 9.2 The story video (2:41, 16:9 and 9:16)

- 19 narrated scenes in 9 chapters: What Aselius is, Find your way around, Pick an engine, Watch it work, Deliverables not chat, Share it anywhere, Beyond the browser tab, Why Aselius, Get started.
- Every scene is a real screenshot with a camera move and callouts, or a typographic beat (mega statement, card grid, MCP URL card, end card).
- **The voiceover is the clock.** Each recorded line was measured from the audio; each scene lasts its real line plus an even breath, sized so the whole film ends exactly with its music bed. Headline words rise at the line's own pace (line length divided by its word count), sub-copy appears on the word that starts it, and each callout lands on the word that names it.
- The narration is written on screen as it is spoken, so the film reads with the sound off and needs no subtitles.
- Delivered as a 2560x1440 master for YouTube and LinkedIn, a native 1080x1920 vertical recomposition (not a crop) for Reels and Shorts, and a 1920x1080 site cut.

### 9.3 The reel (18s loop)

- Six real screens, one per voice line ("Your work, in one taskspace." "Every step, live." "Files, exactly as generated." "Publish with an access code." "Open it on any device." "Even full code projects."). Each screen cuts in 0.3s before its line.
- A slow push between two focus points per screen, a chip label top-left, seamless loop (the last scene crossfades into the first).
- Vertical cut adds the spoken line as a kinetic caption so it works muted in a feed.

## 10. Acceptance rubric

Score 0 to 5 on each. Any critical dimension (marked *) below 4 is a revision, not a delivery.

| Dimension | 5 looks like |
| --- | --- |
| Truth* | Every screen, name, number and claim is real and verifiable |
| Clarity* | A first-time viewer can say what the product does after one watch or one scroll |
| Hierarchy | One focal point per beat; sage used once per view |
| Typography* | Token sizes, no orphans, no clipped descenders, nothing below the size floor |
| Motion intent | Every movement reveals, connects, emphasises or hands off |
| Pacing | Reads comfortably; holds before proof points; the end card holds long enough to screenshot |
| Audio (video)* | Voice intelligible, music ducked, no clipping, sync verified by measurement |
| Accessibility* | Reduced motion, contrast, tap targets, keyboard, text equivalents all pass |
| Performance | Compositor-only scroll effects; lazy media; no layout shift |
| Consistency | Matches these tokens and rules exactly; no off-system values |

Never let a self-score override a failed render, a broken build or text you did not actually look at.

## 11. Final report shape (shared by all companion skills)

1. What you made, in one sentence, and where the files are.
2. The measured facts: duration, resolution, fps, codecs, loudness, file sizes (video) or routes, components and build result (web).
3. What you verified and how (stills reviewed, sync measured, browsers and widths tested, reduced motion checked).
4. What you did not do or could not verify, stated plainly.
5. Anything the requester must decide.
