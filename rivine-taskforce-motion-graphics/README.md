# Rivine TaskForce · Motion Graphics upgrade

The plan and the files to move the Motion Graphics specialty from "animated slides" to directed, cinematic code-to-video films.

| Read | For |
| --- | --- |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Engineers: what is wrong today and why (with evidence from `agent.py`, `render.py`, `audio.py`, `jobs.py` and the v1 prompt), the decisions, the target architecture, every tool, uploads, on-demand generation, render and QA changes, the Opus 5.5 integration, the migration order and the checklists |
| [`SYSTEM_PROMPT.md`](SYSTEM_PROMPT.md) | The agent's new instruction (replaces `motion_graphics_system_prompt.md`) |
| [`skills/`](skills) | Seven playbooks the agent reads on demand inside the sandbox |
| [`references/`](references) | Working mechanics the agent copies into each film: `scenes.mjs`, `render.mjs`, `voiceover.mjs`, `export-social.mjs`, plus an engine self-test |

## Skills

| # | Skill | What it gives the agent |
| --- | --- | --- |
| 01 | [direction-and-research](skills/01-direction-and-research/SKILL.md) | Purpose, truth ledger, story spines, a shot list (not a slide list), pacing, delivery specs |
| 02 | [creative-art-direction](skills/02-creative-art-direction/SKILL.md) | Concept first (three options, commit to one), building a world, deriving palette and type, composition systems, motion character, the anti-default checklist, a distinctiveness test |
| 03 | [cinematic-motion](skills/03-cinematic-motion/SKILL.md) | Camera grammar, depth, kinetic typography patterns, motivated transitions, rhythm and voice sync, driving libraries from `t` |
| 04 | [archetypes-and-engines](skills/04-archetypes-and-engines/SKILL.md) | Twelve visual archetypes, choosing CSS/SVG, GSAP, D3, Canvas, Three.js or Lottie, deterministic rules per engine, recipes |
| 05 | [media-and-generation](skills/05-media-and-generation/SKILL.md) | Using uploads as real media (crop, cut out, grade, sequence clips), and the on-demand voice, music, Grok Imagine and Grok Imagine Video 1.5 Lite policy and prompting |
| 06 | [design-system](skills/06-design-system/SKILL.md) | Tokens, a video type scale, grid, safe zones, one timeline recomposed per format, working inside a brand |
| 07 | [render-qa-and-delivery](skills/07-render-qa-and-delivery/SKILL.md) | Looking at frames like an art director, `check_film`, sync checks, the scoring rubric, `finish` and the summary |

## References (mechanics, not a look)

| File | Does |
| --- | --- |
| `scenes.mjs` | Film engine: seekable scenes with cut, fade, wipe and iris entrances; keyframe tracks; analytic springs; seeded noise; 2.5D camera with depth layers, parallax, depth of field and world-to-screen projection; kinetic type split by word, character or line; callouts; path draw and follow; image-sequence video; voice timing lookups; `meta.rest` for QA |
| `render.mjs` | Serves the film folder locally with the network blocked, waits for `window.motion`, renders stills, runs the determinism and rest-moment layout check, renders MP4 with parallel workers joined losslessly, supports format queries and a device scale for 1440p masters |
| `voiceover.mjs` | Converts the voice tool's result into `timing.json` with exact line cues and emphasis cues; merges aligned word times when available; fails when speech outruns the film |
| `export-social.mjs` | One mastered soundtrack (voice high-passed, music ducked, about -14 LUFS, true peak at or below -1 dBTP) muxed onto every format, then verified (codecs, duration, full decode, loudness, peak) with a JSON report |
| `selftest/run.sh` | Exercises all four end to end (needs Node with Playwright, Chromium and FFmpeg) |

Tested in this repository's environment:
- Determinism: an identical frame after seeking away and back.
- Clean layout at rest moments.
- Stills in 16:9 and 9:16.
- Two-worker MP4 renders in both formats.
- Mastered outputs: H.264 + AAC 48 kHz, exact 8.0 s duration, a clean decode, -15.3 LUFS integrated, and true peak within limits.
