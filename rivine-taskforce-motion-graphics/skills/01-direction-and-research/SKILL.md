---
name: direction-and-research
summary: Turn a brief and its attachments into a purpose, a truth ledger, a story spine and a shot list before any code, so the film says something true in the right order at the right pace.
use_when: Every film with facts, a product, data or a script; any film longer than 20 seconds.
pairs_with: [02-creative-art-direction, 03-cinematic-motion, 05-media-and-generation]
---

# Direction and research

## 1. Why plan

Slide-like films come from planning slides: "scene 1 title, scene 2 three bullets". Plan shots and ideas instead. Ten minutes of planning saves every look-and-fix round after it. Write the plan to `/work/film/PLAN.md`; it is short, and it is your contract with yourself.

## 2. Read everything first

| Input | Where | If missing |
| --- | --- | --- |
| The brief, in the user's words | The task | Infer reversible defaults and state them; ask only when a missing fact changes correctness, rights or an irreversible action |
| Uploads | `/work/film/assets/uploads/manifest.json`, images shown to you | Plan without them; never fake what they would have shown |
| Facts and figures | The user's text and documents first; grounded research only when the film depends on facts not supplied | Leave the claim out rather than guess |
| Brand | Uploaded logo, guidelines, site screenshots | Build an art direction from the subject (`skills/02`) |
| Delivery | Where it will be watched | 16:9 at 1920x1080; add 9:16 when the user mentions Reels, Shorts, TikTok, Stories or "mobile" |
| Length | The brief | Social hook 6 to 15 s; product reel 15 to 30 s; explainer 30 to 90 s; story up to 180 s |
| Sound | The brief | Silent unless asked or implied (see `skills/05`) |

## 3. The plan (six parts)

### 3.1 Purpose

One sentence: what the viewer understands or feels at the end, and what they do next.

> "A founder sees that their scattered launch tasks become one tracked plan in Aselius, and opens the app."

### 3.2 Truth ledger

| Claim on screen or in voice | Source | Status |
| --- | --- | --- |
| "Eight specialist engines" | user's product doc p.2 | confirmed |
| "Saves 10 hours a week" | not supplied | **cut**, or labelled "illustrative" if the user insists on an example |

Rules: no invented numbers, quotes, logos, customers, awards or outcomes. Units, dates and denominators stay attached to numbers. A forecast is labelled as a forecast. Sensitive fields (health, money, law, safety) get careful wording and, where needed, a disclaimer beat.

### 3.3 Audience and tone

Who watches, where, with or without sound, in three words of tone (for example "precise, warm, unhurried" or "loud, playful, fast"). Tone drives every later choice: cut rate, easing, palette contrast, type weight, music.

### 3.4 Story spine

Pick the shape that fits the purpose, not a fixed template:

| Shape | Beats | Good for |
| --- | --- | --- |
| Problem → turn → proof → payoff | tension, the idea, evidence, result + action | product launches, ads |
| Question → mechanism → answer | curiosity, how it works step by step, the takeaway | explainers, education |
| Build | an empty frame fills piece by piece into a finished system | architecture, process, brand reveals |
| Contrast | before / after, us / them, old / new in parallel | comparisons, transformations |
| Journey | a moving point travels through places or stages | timelines, routes, onboarding |
| Montage | rhythmic sequence of strong images on the beat | social, events, recaps |
| Single take | one continuous camera move through a world, no cuts | premium brand, short teasers |

Each beat carries one idea. If a beat needs two ideas, it is two beats.

### 3.5 Shot list

Plan the pictures, not the slides. One row per shot:

| t | Shot | Camera | What moves | Words (voice / on screen) | Into next |
| --- | --- | --- | --- | --- | --- |
| 0.0 | Macro on a single glowing task chip on black | slow push-in, z 1.6 → 1.9 | chip pulses once on "one" | V: "Every launch starts as one idea." | chip duplicates, camera pulls out |
| 3.1 | Wide: hundreds of chips scattered in depth | pull-out, parallax across 3 depth layers | chips drift, out of sync | V: "Then it becomes a hundred tasks." | chips snap into a grid on "Aselius" (match on motion) |

Rules:
- The camera column is never empty. "Static" is a choice that must have a reason (a hold for reading or a punch of stillness).
- Transitions are motivated: a match on shape or motion, a camera move that reveals the next subject, a cut on a word or beat. Crossfades are the exception.
- Mark the **rest moments**, when text must be fully legible. They go into `meta.rest` and QA checks them.

### 3.6 Asset list

Every upload, generated item, font and library you will use, with its path. Generation calls are planned here, with the reason they are needed (see `skills/05`). Anything not on this list is not in the film.

## 4. Pacing

- **Reading:** on-screen text needs about `words / 3 + 0.8` seconds of rest to be read once, longer for numbers and unfamiliar terms. Short punchy words can cut faster when the voice says them too.
- **Narrated films:** the voice is the clock. Shot starts sit on line starts (exact from the voice tool); accents sit on word times (estimates). Leave 0.3 to 0.8 s of breath after key lines.
- **Social vertical:** the subject and the claim in the first 1.5 s; lines of six words or fewer; a payoff before 15 s.
- **Holds:** hold longer before and after a proof point (a number, the product doing the thing), and on the final frame (at least 1.5 s).
- **Cut rate follows tone:** calm pieces cut every 3 to 6 s with long camera moves; energetic pieces cut every 0.5 to 2 s on the beat.

## 5. Directing questions (answer per shot)

1. What must the viewer not misunderstand by the end of this shot?
2. What is the visual evidence, not just the claim?
3. What does the camera reveal, and why now?
4. What stays still so the eye can read?
5. What carries over from the previous shot?
6. What is heard, and where is silence?
7. Where are the safe zones in each format?
8. What makes this shot belong to this brief and no other?

## 6. Delivery specs

| Destination | Frame | Notes |
| --- | --- | --- |
| Web, YouTube, LinkedIn | 1920x1080, 30 fps (master at 2560x1440 when asked for "high quality" or YouTube) | -14 LUFS, true peak at or below -1 dBTP |
| Reels, Shorts, TikTok, Stories | 1080x1920 | text inside y 250 to 1540 and x 72 to 1008; the first frame must read as a thumbnail |
| Square feed | 1080x1080 | fewer simultaneous elements, larger type |
| Presentation screen | 1920x1080 or the room's size | the words on screen must carry the story with sound off |

Vertical and square are recompositions of the same timeline, not crops (see `skills/06`).

## 7. Hand-off checklist

- [ ] Purpose, ledger, tone, spine, shot list and assets written in `PLAN.md`
- [ ] Every claim maps to "confirmed" or "illustrative, labelled"
- [ ] Every shot has a camera behaviour and a motivated transition
- [ ] Rest moments marked
- [ ] Generation calls justified, or none
- [ ] Next: `skills/02` for the look, `skills/03` for the motion
