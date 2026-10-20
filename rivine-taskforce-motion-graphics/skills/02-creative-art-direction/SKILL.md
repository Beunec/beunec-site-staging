---
name: creative-art-direction
summary: Find a concept and build a distinctive, coherent visual language for each film, including when the user gives no design direction, so output is directed and specific rather than a template.
use_when: Every film. Essential when the brief has no brand, no references and no look.
pairs_with: [01-direction-and-research, 03-cinematic-motion, 06-design-system]
---

# Creative art direction

## 1. The job

Your first instinct is the average of every motion graphic you have seen; that is exactly the generic look. Art direction means making deliberate, specific choices that come from **this** subject, **this** audience and **this** message, then holding them consistently for the whole film.

You decide, in order:
1. The concept.
2. The world.
3. The palette.
4. The type.
5. Composition.
6. The motion character.

Each choice is written in one line in `PLAN.md` with its reason.

## 2. Concept first: three options, then commit

Before any styling, write three different concepts in one line each, then pick one. A concept is a **visual idea that carries meaning**, not a style word.

| Brief | Weak (style words) | Strong concepts (pick one) |
| --- | --- | --- |
| "Explain our task automation product" | "modern, clean, techy" | 1. **Domino run:** each task tips the next; the camera tracks the chain reaction through the workspace. 2. **Air traffic control:** tasks are flights on a radar; the product assigns runways. 3. **Loom:** loose threads (tasks) are woven into fabric (a finished deliverable). |
| "Quarterly results for the board" | "corporate, professional" | 1. **Strata:** each quarter is a geological layer; the camera descends through time. 2. **Ledger in motion:** a single ruled page; numbers write themselves into place and the page turns. 3. **Lighthouse:** one beam sweeps across the metrics that matter. |
| "Launch reel for a coffee brand" | "warm, cozy, aesthetic" | 1. **Pour:** every transition is a liquid wipe in the brand's colours. 2. **Morning in 15 seconds:** light moves across a table from dawn to full sun. 3. **Grind to cup:** macro shots of texture, set to the rhythm of the grinder. |
| "Teach how vaccines train the immune system" | "friendly, educational" | 1. **Wanted poster:** the body circulates a description of the intruder. 2. **Training ground:** cells rehearse against a dummy before the real fight. 3. **Lock and key:** one key, many locks, scaled from cell to body. |

Choose the concept that:
- makes the core message visible without words,
- gives you **objects that can persist and transform** across shots (continuity),
- suits the tone,
- can be built well in code within the budget. Prefer a concept you can execute beautifully over one you can only sketch.

## 3. Build the world

A world is the set of things that exist in the film and the rules they obey. Write it down:

- **Objects:** what exists (threads, chips, strata, light beams, paper, liquid, nodes, the user's product screens, the user's photos).
- **Material:** how they look and behave (matte paper, glossy glass, ink, liquid, rubber, light, wire). Material decides shadows, edges, textures and motion feel.
- **Space:** flat, layered 2.5D (depth planes with parallax), isometric, or true 3D. Choose the least complex space that carries the concept.
- **Physics:** heavy and slow, light and springy, rigid and snapping, fluid and flowing. This sets your easing and spring constants.
- **Light:** where it comes from, what it reveals, how it changes over the film (dawn to day, spotlight to full stage).

Everything in the film belongs to this world. A generic element (a floating icon, a stock card) that is not part of the world is cut.

## 4. Palette: derive it, don't default

When there is no brand, derive the palette from the concept and subject:

1. **Pick the dominant field:** the colour of the world's space (night sky, paper, concrete, deep water, warm wood). It covers 60 to 70% of the frame.
2. **Pick the subject colour:** the colour of the main objects (20 to 30%).
3. **Pick one accent:** the colour of meaning: the highlight, the selected item, the key number. It covers 5 to 10% and appears **once per shot**.
4. **Add neutrals for text:** a near-white and a near-black tuned to the field, never pure #000 or #fff on a coloured field.

Method for picking hues: sample them from something real in the concept (rust and lichen for "strata"; espresso, crema and morning light for coffee; paper, graphite and a red pencil for "ledger"). Then check contrast: text at least 4.5:1, large text at least 3:1, after any transparency.

Ranges that keep films out of the generic zone:
- Prefer fields that are not white, not cream, and not navy-to-purple gradients: charcoal greens, ink blues, terracotta, bone, slate, oxblood, deep teal, warm greys, sunlit yellow, chalk, black with a single colour of light.
- One saturated colour at most. Let value (light and dark) carry hierarchy.
- Gradients only when the world has light (a sky, a lamp, a sunrise), and soft.

When the user gives a brand: use their colours exactly, keep their hierarchy (which is primary, which is accent), and apply rules 3 and 4 to their palette.

## 5. Type: choose a voice

From the bundled fonts (`/opt/motion/fonts`), pick at most two families: a display voice and a reading voice.

| Tone | Display | Reading | Motion feel |
| --- | --- | --- | --- |
| Precise, technical, calm | Neutral grotesk, tight tracking, 600 to 700 | Same family, 400 | Measured rises, clean masks |
| Editorial, serious, premium | High-contrast serif, large, sometimes italic for one word | Grotesk 400 | Slow reveals, long holds, big crops |
| Loud, playful, social | Condensed or extended display, 800 to 900, uppercase allowed | Rounded or grotesk 500 | Springs with overshoot, punches, rhythmic cuts |
| Human, warm, personal | Soft serif or humanist sans | Humanist sans | Gentle drifts, handwritten-like strokes |
| Data, finance, science | Grotesk with tabular figures | Same | Numbers settle precisely; nothing bounces |

Rules:
- **Size contrast does the work.** A frame with one 220 px word and one 32 px line beats five 60 px lines.
- **Type can be architecture:** huge words cropped by the frame, words as the floor the camera moves across, letters as objects that move. Mark these `data-qa="free"`.
- Keep line lengths short (about 3 to 8 words per line on screen).
- Never put more than about 20 words on screen at once, except a deliberate full-screen statement.

## 6. Composition

Choose a composition system per film and vary within it:

- **Asymmetric grid:** subject on a third, text on the opposite third, strong negative space. Good default for explainers.
- **Central axis:** symmetry for statements, logos and reveals. Use for impact beats only.
- **Edge tension:** objects bleed off the frame; type is cropped; the frame feels larger than the screen. Good for energy.
- **Depth stack:** foreground blur, mid-ground subject, background field. Good for premium and cinematic tone.
- **Isometric plane:** systems and architecture on one projected plane.

Per shot, decide the **focal point** and make everything else quieter (smaller, darker, blurred, further back). Vary framing across shots (wide, medium, close, macro) so the film has rhythm. Three similar frames in a row is a slide deck.

## 7. Motion character

The motion character is the film's personality in movement. Set it once and keep it:

| Character | Easing | Springs | Cut rate | Camera |
| --- | --- | --- | --- | --- |
| Calm precision | `outExpo`, `inOutCubic` | none | 3 to 6 s | long slow pushes, holds |
| Confident editorial | `bezier(0.7,0,0.2,1)` (snappy in-out) | none | 2 to 4 s | cuts on words, crisp pans |
| Playful energy | `outBack(1.5)` | stiffness 260, damping 14 | 0.5 to 2 s | whip pans, punch-ins on beats |
| Organic, warm | `inOutCubic`, long durations | stiffness 120, damping 22 | 3 to 5 s | drifting handheld-like noise at low amplitude |
| Technical / data | `linear` for time and value, `outCubic` for labels | none | 2 to 4 s | orthographic tracking, no rotation |

Signature move: give the film **one recognisable motion idea** used three or four times (threads weaving, a liquid wipe, a ruled line drawing itself, a light sweep). Repetition with variation is style; every beat doing something different is noise.

## 8. The anti-default checklist

Before building, write which of these you are avoiding and what replaces them. Before finishing, check frames against it.

- [ ] No centred card plus caption band as the main layout of most shots
- [ ] No identical fade-up for every element; entrances differ by role (headline vs label vs object)
- [ ] No grid of identical cards as the main visual (unless the brief is literally a set of equal items, and then they move as a system)
- [ ] No glassmorphism, neon glow, floating orbs or blob gradients as decoration
- [ ] No cream or off-white field, purple-blue gradient, or default single-weight sans unless the brand requires it
- [ ] No "01 / 02 / 03" labels, monospace eyebrows or pill buttons by reflex
- [ ] No typewriter paragraphs; no count-ups to numbers you were not given
- [ ] No laptop or phone mockup as a stand-in for "software" unless showing the user's real screens
- [ ] At least one shot with real depth (parallax, focus, scale change)
- [ ] At least one motivated transition that is not a crossfade (match cut, camera reveal, wipe in the world's material)
- [ ] Type used at two or more very different scales in the film
- [ ] A signature motion idea, repeated with variation

## 9. Distinctiveness test

Look at three frames from different shots side by side (`preview_frames`) and ask:

1. Could these frames belong to a different company's film with only the logo changed? If yes, the concept is not in the picture yet.
2. Is the focal point obvious in under a second in every frame?
3. Do the three frames look like one film (palette, type, material) but not like the same slide?
4. Is there anything decorative that does not belong to the world? Cut it.

Fix by changing the concept's visibility (bigger, closer, more of the world on screen), not by adding effects.

## 10. When the user gives a brand or references

- Brand guidelines win on colour, logo, type and tone. Keep the concept and motion inventive inside them.
- A reference film or site is a direction, not a template: take its principle (pacing, contrast, camera behaviour), never its exact layouts or frames.
- The user's own screenshots and photos are the hero material. Frame them like products: camera moves, depth, light, callouts on the exact pixel.
