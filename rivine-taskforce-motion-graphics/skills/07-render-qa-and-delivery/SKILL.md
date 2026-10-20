---
name: render-qa-and-delivery
summary: Look at the film, check it, score it against a creative and technical rubric, fix the narrow cause of each defect, then finish with the right formats and an honest summary.
use_when: Every look-fix round and before calling finish.
pairs_with: [03-cinematic-motion, 06-design-system, 05-media-and-generation]
---

# Render, QA and delivery

## 1. Look before you check

Numbers do not see a slide deck; you do. After each build round:

```text
preview_frames(times=[0, peak of each shot, each transition midpoint, every rest moment, last frame])
preview_frames(times=[same], query="format=vertical")      # when vertical is a deliverable
```

For each frame, ask in this order:
1. **Focal point:** obvious in under a second?
2. **Hierarchy:** one dominant element, everything else quieter?
3. **Composition:** aligned to the grid, balanced, using negative space on purpose?
4. **Contrast and legibility:** text readable at phone size (imagine the frame at 360 px wide)?
5. **Concept visible:** could this frame belong to another brief? (`skills/02` §9)
6. **Motion state:** at rest moments, has everything settled; mid-move, is the motion readable?

Fix the biggest problem first, one cause at a time, and look again. Typical fixes:

| You see | Narrow fix |
| --- | --- |
| Text competes with the image | Scrim in the field colour behind the text, or move text to the empty third, or push the camera so the image fills less |
| Everything is the same size | Raise the key word by 2 to 3 steps of the scale; shrink the rest |
| Frame looks like a slide | Add depth (a near and far layer), change the framing (closer or cropped), make the transition motivated |
| Busy | Remove an element; let one thing move at a time |
| Callout misses its target | Read the exact pixel from the source image; check the camera key at that moment |
| Vertical looks crammed | Fewer items at once, stack instead of row, larger type, tighter camera |

## 2. `check_film` (technical gates)

`check_film` (or `node /opt/motion/render.mjs film/index.html --check`) reports:

- **Deterministic:** the same frame after seeking away and back. Fails when state leaks between frames: something is accumulated, timed, random, or left by a CSS transition. Fix by setting the property from `t` every frame.
- **Layout at rest moments:** text off the stage or overflowing its box, at `meta.rest` times (fallback: the last 0.3 s of each scene). Intentional crop or overlap lives inside `data-qa="free"`. Never use `free` to hide a mistake.
- **Console problems:** script errors, failed local loads. Any error fails the gate.

Also verify:
- `meta.duration` covers speech end + 0.6 s when narrated.
- `meta.scenes` cover the whole timeline with no gaps that show an empty stage by accident.
- Every asset referenced exists locally; nothing points to the network.

## 3. Sync checks (narrated or scored films)

- Shot starts equal line starts from `timing.json` (cue list). Check two or three by rendering stills 0.1 s after a line start: the new shot is visible.
- Word accents (`vo.word`) land with about 0.1 s of lead; stills at the accent time show the element arriving.
- After `finish`, the host verifies the mastered file. In the summary, report sync as "shots cut on measured line starts; word accents on estimated word times" unless aligned word times were used.

## 4. The rubric (score before finish)

Score each 0 to 5. A critical row (*) below 4 means another round, not delivery.

| Dimension | 5 looks like |
| --- | --- |
| Truth* | Every name, number and claim is the user's or sourced; illustrative data labelled |
| Concept | One visual idea carries the film; frames could not belong to another brief |
| Direction | Shots have camera behaviour and reasons; framing varies; transitions are motivated |
| Composition and type* | Clear focal points, strong scale contrast, grid-aligned, legible at phone size |
| Motion craft | Easing and springs match the motion character; rest states clean; one signature move |
| Rhythm | Pacing varies; holds before and after proof; cuts on words or beats |
| Media use | Uploads used as hero material; generated media only where needed and inspected |
| Sound* (when present) | Voice clear, music under it, sync on cues; silence when the brief wants it |
| Technical* | Deterministic, no console errors, layout clean at rest, all formats render |
| Formats | Each format recomposed, safe zones respected |

Never let a self-score override a failed gate or a frame you have not looked at.

## 5. `finish`

```text
finish(title="…", formats=["16x9", "9x16"], summary="…")
```

- **Formats:** what the user asked for. If unspecified: 16:9. Add 9:16 when the brief mentions social or mobile.
- **The host then:**
  1. Renders each format with parallel workers.
  2. Masters one soundtrack for all formats (`export-social.mjs`).
  3. Verifies each file: codecs, duration, full decode, loudness and peak.
  4. Saves the MP4s and a poster.
  5. Marks the deliverable ready.
- **Summary** (at most two short paragraphs, plain language):
  1. The film in one sentence (its concept), the duration, the formats, and the sound (voice, music, or silent and why).
  2. What you verified: deterministic frames, layout at rest moments, frames reviewed and revised, sync on cues. Anything not done or not verifiable. The MP4s are rendering now.

Example:

> "Launch Loom: loose task threads are woven into one finished plan as the narrator walks through it. 34 seconds, 16:9 and 9:16, narrated with a soft piano bed under the voice.
> Frames checked at every shot and transition in both formats and revised twice (tighter framing on the approval step, a larger type contrast on the closing line); the timeline is deterministic and layout is clean at rest moments. Shots cut on the measured voice lines; word accents use estimated word times. Your MP4s are rendering now and will appear on this deliverable when verified."

## 6. Editing a delivered film

Change only what was asked:
- Keep the concept, copy, assets, palette and timing.
- A timing change moves that shot and the offsets after it, and the soundtrack timing if narrated.
- Re-run `preview_frames` around the change, then `check_film`, then `finish` with the same formats.
