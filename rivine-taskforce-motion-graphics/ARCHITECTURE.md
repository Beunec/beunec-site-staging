# Rivine TaskForce · Motion Graphics: upgrade architecture

**Scope:** the Motion Graphics specialty mode of Rivine TaskForce (code-to-video). It covers why output looks like animated slides, what changes, the tool set (voiceover, music, Grok Imagine image, Grok Imagine Video 1.5 Lite), the E2B sandbox layout, the render and QA pipeline, cost controls, and an ordered migration with checklists.

**Inputs reviewed:** `agent.py`, `audio.py`, `jobs.py`, `render.py` and `motion_graphics_system_prompt.md` (v1.0.0, 1,224 lines), plus the code-to-video master playbook supplied with the request. HyperFrames is out of scope: the engine described here is our own.

**Companion files in this folder:**

| File | What it is |
| --- | --- |
| `SYSTEM_PROMPT.md` | The new LLM instruction for the agent; it replaces `motion_graphics_system_prompt.md` |
| `skills/*/SKILL.md` | Seven playbooks the agent reads on demand inside the sandbox |
| `references/scenes.mjs` | Film engine: timeline, keyframes, springs, seeded noise, 2.5D camera with depth layers, kinetic type, callouts, masks, path drawing, image-sequence video, voice timing |
| `references/render.mjs` | Sandbox renderer for the `window.motion` contract: stills, a determinism and layout check, parallel MP4 render |
| `references/voiceover.mjs` | Turns the `generate_voiceover` result into `timing.json` with cue points (no manual voice step) |
| `references/export-social.mjs` | Muxes and masters one soundtrack onto every format, then verifies each file |

The reference code was run end to end in a Chromium + FFmpeg environment:
- A test film rendered, at 1920x1080 and 1080x1920.
- The determinism check passed, with an identical frame after seeking away and back.
- Rendering with two parallel workers joined losslessly.
- The mastered outputs passed every check: H.264 + AAC 48 kHz, exact duration, a clean full decode, -15.3 LUFS integrated loudness, and true peak below -1 dBFS.

---

## 1. Findings: why the output reads as a slide deck

You suspected the inline-only format; that is part of it, but not all of it. In order of impact, with evidence:

| # | Cause | Evidence | Effect on output |
| --- | --- | --- | --- |
| 1 | **The prompt teaches by two long example films, and both are slide-structured.** | §17 and §18 of the system prompt are a UI-replica film and a classroom lesson. They take up lines 367 to 1108, about 87 KB of the 139 KB prompt (63%), and both are built as "scene card + caption + fade". The prompt says not to copy their colours or topics, but nothing stops the model copying their structure. | Every film inherits the same skeleton: a centred card, a caption band, one fade per scene. |
| 2 | **The motion vocabulary is UI transitions only.** | §7's reusable moves are: rise, slide, scale reveal, pop, stroke draw, count-up, checklist stagger, typewriter, focus, wipe, crossfade, bar fill. Nothing covers camera language, depth, object continuity across shots, rhythm, editing, or choreography. | The model can only build what it has words for: entrances and exits, not shots. |
| 3 | **The planning schema and rubric reward slides.** | §5 asks per scene for "one intended takeaway, exact visible words, caption". In the §21 rubric, motion quality is 15/100, and nothing scores originality, camera, composition or continuity. | The optimisation target is a correct slide, not a directed film. |
| 4 | **QA punishes kinetic and cinematic composition.** | `render.py` `_LAYOUT_JS` flags text overlapping other text by more than 15%, text more than 4 px off the stage, and clipped overflow at every scene's middle and end. These are errors, and the agent is told to "fix every error" within 3 review rounds. | Layered type, words flying through frame, big type cropped by a push-in and masked reveals all fail QA. The agent learns to keep text in separate, safe boxes, which is the slide look. |
| 5 | **No libraries and no network.** | Prompt §1: "pure inline HTML, CSS, and JavaScript… Do not require React, Remotion, GSAP, Three.js". The host contract repeats "inline CSS and JS only… no CDN scripts". | No timeline engine, no 3D, no D3 geometry, no Lottie. Every film hand-rolls tweens. The no-network rule is right; what is missing is a set of libraries available offline. |
| 6 | **The model also has to build a preview player.** | The host contract requires every film to ship Play/Pause, Replay, a seek slider, a sound toggle, preview scaling and responsive layout. QA checks the player at 375, 768 and 1440 px. | Tokens and review rounds go to player UI instead of the film. The UI-enhancement pass then polishes the page, not the motion. |
| 7 | **Uploads are not usable as media.** | `_split_uploads` takes at most 6 images of at most 4 MB each, inlined as data URLs. Every other upload becomes text (`content[:60_000]`), so videos and audio are unusable. The scene must stay under 1.5 MB. | The agent cannot crop, cut out, grade or sequence a user's photo or clip. It can only embed the image as-is or describe the file. |
| 8 | **Render caps hurt picture quality.** | `MAX_MP4_BYTES = 11 MB` caps video bitrate (`_video_kbps`) at about 815 kbps for 90 s, about 1.3 Mbps for 60 s and about 2.7 Mbps for 30 s. YouTube's 1080p30 upload guidance is about 8 Mbps. Frames travel as JPEG at q93, the long side is capped at 1920 px, and Chromium launches with `--disable-gpu`. | Gradients band, fine type smears in motion, and longer films get visibly worse. "Premium" looks cheap after encode. |
| 9 | **The drafting model and its settings fight creativity.** | `agent.py` runs DeepSeek V4.1 Flash on Fireworks at `temperature=0.2`, with Opus only inside the UI-enhancement pass. The prompt header names `claude-sonnet-5-5`, and your notes mention GLM 5.3, so three statements of the model disagree. | Conservative, template-like drafts that a second model then edits. |
| 10 | **Word timing is estimated.** | `audio.py` `word_times()` spreads words across each line by weighted length, because Gemini TTS returns no word timestamps. Line starts are exact. | Cuts on lines land correctly. Word-level hits (a number on its word) can drift by a few hundred ms. |
| 11 | **Prompt weight is spent on things the agent cannot use.** | §10.1 stock-music URLs (unusable: no network at render), §12 in-browser encoding, §13 host job contract, §22 package validation record. | The prompt is about 35k to 40k tokens on every model call, and the creative direction is diluted. |

**Conclusion.** Replacing the model alone would not fix this; the prompt, the examples and QA would keep producing slides. The fix is five surgical changes together:
1. **Direction:** a lean prompt plus creative and cinematic playbooks, with no full example films.
2. **Freedom:** offline libraries and real media in a sandbox.
3. **QA:** layout checked only at rest moments, with a "free" marker for intentional overlap and crop.
4. **Quality caps:** bitrate and resolution raised.
5. **Model:** one capable model, without the post-pass.

---

## 2. Decisions

| Decision | Verdict | Notes |
| --- | --- | --- |
| Remove the UI-Enhancement agent from Motion Graphics | **Do it** | It edits the delivered film after QA with a second Opus call, forces a `deliver` hand-off when time is short, and improves page presentation, not motion. Remove `_enhance_wanted`, `_enhance_deadline`, `_enhance` and the `deliver` hand-off branch in `run()` (see §9 step 1). |
| One model: **Claude Opus 5.5 at `effort: "high"`** | **Do it** | Drafts and reviews in one loop. Remove `temperature` (rejected on Opus 5.5) and the Fireworks client. Request shape in §8. Cost is controlled by the much smaller prompt, prompt caching (cache reads $0.20 per MTok) and removing the second model pass (§7). |
| Creative and cinematic playbooks | **Do it** | `skills/` holds 7 playbooks, read on demand from the sandbox (not pasted into every call). |
| Uploads as real files in the sandbox, not parsed to markdown first | **Do it** | §5. Images, video, audio and documents land in `/work/film/assets/uploads/` with a manifest. Images are also shown to the model. |
| Libraries and frameworks allowed | **Do it, offline** | Pre-install GSAP, Three.js, D3, lottie-web and fonts in the E2B template; the render stays network-blocked. Remotion and HyperFrames are not used. |
| E2B sandbox and code interpreter | **Use it as the workspace and the renderer** | The agent writes files and runs commands there. Renders run there with parallel workers. |

---

## 3. Target architecture

```
                         ┌─────────────────────────────────────────────┐
 user brief + uploads ──►│ Host (Lambda): agent loop                   │
                         │  model: claude-opus-5-5, effort high        │
                         │  system: SYSTEM_PROMPT.md (cached)          │
                         │  tools ────────────────────────────────┐    │
                         └────────────────────────────────────────┼────┘
            ┌──────────────────────────┬──────────────────────────┼──────────────────────┐
            ▼                          ▼                          ▼                      ▼
   E2B sandbox (per task)      Generation services         Grounded research       Host storage
   /work/film/ (the film)      generate_voiceover (TTS)    (existing tools)        scene bundle,
   /work/film/assets/uploads   generate_music (Lyria)                               MP4s, poster,
   /skills/*/SKILL.md          generate_image (Grok Imagine)                        soundtrack
   /opt/motion/ (references)   generate_video_clip (Grok Imagine Video 1.5 Lite)
   node, chromium, ffmpeg,     └─ outputs are written into /work/film/assets/generated/
   python + Pillow, numpy
            │
            ├─ sandbox_exec / sandbox_write / sandbox_read   (author, inspect, process media)
            ├─ preview_frames(times)  → images back to the model (render.mjs --stills)
            ├─ check_film()           → determinism + rest-moment layout report (render.mjs --check)
            └─ finish()               → render.mjs (all formats, parallel) → export-social.mjs
                                        → verified MP4s + poster → jobs state "ready"
```

Principles:

- **The film is a folder, not a string.** `/work/film/index.html` plus modules, assets and `timing.json`. The model edits files; nothing has to fit in one tool argument.
- **One contract, unchanged at its core.** `window.motion = { meta: {width, height, fps, duration, scenes, rest?}, ready, renderFrame(t), audioBase64?() }`. Existing films and `render.py` keep working. New optional fields:
  - `meta.rest`: absolute times when text is at rest. QA checks layout there.
  - `data-qa="free"` on elements whose overlap or crop is intentional.
- **The host owns the player.** The deliverable preview wraps the film in a host player (injected like `RIVINE_SOUNDTRACK` today). Films no longer contain controls.
- **Network stays blocked at render.** Libraries and fonts are local files. Generated media is downloaded into the film folder before render.

---

## 4. Tools

All tools are declared at session start, in the same order every call, which keeps the prompt cache warm and suits preserved thinking. With streaming, set `eager_input_streaming: true` on tools that take large inputs (`sandbox_write`) and validate inputs before running them (§8).

| Tool | Purpose | Input (essentials) | Returns | When |
| --- | --- | --- | --- | --- |
| `sandbox_exec` | Run a shell command in `/work` (node, python, ffmpeg) | `cmd`, `timeout_s` (default 120) | stdout/stderr (truncated), exit code | Any time |
| `sandbox_write` | Create or overwrite a file | `path`, `content` | bytes written | Authoring |
| `sandbox_edit` | Exact find/replace in a file (each `old` once) | `path`, `edits[]` | ok / which edit failed | Fixes |
| `sandbox_read` | Read a text file or list a directory | `path`, `offset?`, `limit?` | content | Skills, uploads manifest, own files |
| `view_image` | Show the model an image from the sandbox (downscaled) | `path`, `max_side?` | image block | Inspect uploads, generated media, crops |
| `preview_frames` | Render stills at given times (and format) | `times[]`, `query?` | images + any console errors | Every build iteration |
| `check_film` | Determinism + layout at rest moments + console | `query?` | JSON report | Before `finish` |
| `generate_voiceover` | Narration (existing Gemini TTS desk) | `lines[{text, pause_after?, style?}]`, `voice`, `style`, `language` | line start/end (exact), word times (estimated), `speech_ends_at`; writes `assets/audio/voice.wav` and `vo.json` | **On demand** (§6) |
| `generate_music` | Instrumental bed (existing Lyria desk) | `prompt`, `seconds` | model, caption, length; writes `assets/audio/music.mp3` | **On demand** |
| `generate_image` | Grok Imagine still | `prompt`, `aspect`, `count` (1 to 4), `negative?` | file paths in `assets/generated/` + thumbnails shown to the model | **On demand** |
| `generate_video_clip` | Grok Imagine Video 1.5 Lite clip | `prompt`, `seconds`, `aspect`, `image_path?` (image to animate) | MP4 path, extracted frame folder, frame count, fps | **On demand** |
| `research` (existing grounded tools) | Facts the user did not supply | as today | as today | Only when facts are needed |
| `finish` | Render all formats, master audio, verify, save | `title`, `summary`, `formats[]` | job id; the MP4 is announced when verified | Once |

Model IDs and endpoints for the xAI tools come from host configuration (`XAI_API_KEY`, `XAI_IMAGE_MODEL`, `XAI_VIDEO_MODEL`). Confirm the request shape, durations, resolutions and asynchronous job polling against xAI's current API documentation when integrating; this document does not assume them. The host must:
- Download results into the sandbox.
- For clips, transcode and extract frames: `ffmpeg -i clip.mp4 -vf fps=30 frames/%05d.jpg`. The film plays frames deterministically through `imageSequence()`.
- Record provenance (model, prompt, time) in `assets/manifest.json`.

---

## 5. Uploads as real media

On task start the host copies every upload into the sandbox before the first model call:

```
/work/film/assets/uploads/
  manifest.json            # [{id, name, kind, mime, bytes, width?, height?, duration?, fps?, pages?, path, preview?}]
  photo-01.jpg             # original bytes, untouched
  clip-01.mp4              # original
  clip-01/frames/00001.jpg # host-extracted at the film fps (only when a clip is short enough to use)
  clip-01/contact.jpg      # 3x3 contact sheet for the model to look at
  deck.pdf                 # original; deck/page-01.png ... rendered pages
  notes.docx               # original; notes.txt extracted text alongside (text is a convenience, not a replacement)
```

- **Images:** shown to the model (downscaled) in the first user message with their sandbox paths. The agent can crop, colour-grade, cut out, upscale-for-print or tile them with Pillow, numpy or ffmpeg in the sandbox, then use the processed file.
- **Video:** the host extracts metadata, a contact sheet and (for clips up to 60 s) frames at the film's fps. The agent trims, retimes or crops with ffmpeg and plays the result with `imageSequence()`. Live `<video>` seeking per frame is not used for export.
- **Audio:** a user voiceover or music file is used as supplied. It is measured with `ffprobe` and silence detection (`references/voiceover.mjs` accepts aligned word times).
- **Documents:** kept as files. Rendered pages are images the agent can look at and crop. Extracted text sits beside them.
- **Limits:** 200 MB per task in the sandbox, 20 uploads. Anything larger is declined with a clear message.

---

## 6. On-demand generation policy

Generation costs money and time. The agent uses a generation tool only when one of these is true:

| Tool | Use when | Never for |
| --- | --- | --- |
| `generate_voiceover` | The user asks for narration or voiceover, supplies a script to be read, or the requested format is narrated by definition (an explainer "with voiceover", an ad "with a voice"). | Silent briefs; replacing on-screen text the viewer can read. |
| `generate_music` | The user asks for music or sound, or the requested deliverable implies it (a social ad, a launch film, a reel "with music"). | Analytical, solemn or sensitive films unless asked; films the user wants silent. |
| `generate_image` | The film needs photographic or illustrative content code cannot draw well (people, places, food, materials, organic textures) **and** no upload covers it. | Text, UI, charts, diagrams, logos, icons, anything with exact words or numbers; fake screenshots of a real product. |
| `generate_video_clip` | A shot needs real-world motion code cannot produce (water, fabric, a person walking, a camera move through a real space) **and** no upload covers it. | Typography, UI demos, data, logos; padding time. |

Budgets per task (enforced by the host, stated in the tool results):

| Tool | Budget per task |
| --- | --- |
| Voiceover | One read, plus one regeneration if the script changes |
| Music | One bed, plus one regeneration |
| Images | Up to 6 |
| Video clips | Up to 3, each at most the model's clip length |

When the agent skips sound because the brief did not ask for it, the summary says so in one line ("Silent by default; ask for narration or music and I will add it").

---

## 7. Render, QA and delivery

**Render (in E2B, `references/render.mjs`):**
- PNG frame transport. H.264 `yuv420p`, BT.709 tags, CRF 18 for the deliverable (16 for a master), 2 s GOP, `+faststart`.
- Workers equal to vCPUs minus 1, over contiguous frame ranges, joined with the concat demuxer (lossless, no seam).
- `--scale 1.3333` renders a 1920x1080 composition at 2560x1440 for YouTube or LinkedIn masters.
- Raise `MAX_SIDE` to 2560 and `MAX_DURATION_S` to 180.
- Store MP4s in object storage (signed URLs), and raise or bypass the 12 MB durable-asset limit for video. The bitrate cap goes away; size is controlled by CRF.
- WebGL in a GPU-less sandbox runs on SwiftShader: correct, slower. Keep 3D scenes lean (§4 of the engines skill).

**Formats:** one timeline, recomposed per format (`?format=vertical|square`). `finish(formats=["16x9","9x16"])` renders each and `export-social.mjs` puts the single mastered soundtrack on all of them.

**Audio mastering (`export-social.mjs`):** one soundtrack for every format. The voice is high-passed and lightly compressed, music is sidechain-ducked under the voice, then everything is normalised to about -14 LUFS with a true peak at or below -1 dBTP, as 48 kHz AAC at 256 kbps. Each output is verified:
- H.264 with yuv420p, and AAC at 48 kHz.
- Duration within 0.1 s of the film.
- A full decode with no errors.
- Loudness between -16 and -12 LUFS.
- True peak at or below -0.9 dBFS.

**QA changes in `render.py`:**

| Check | Today | Change |
| --- | --- | --- |
| Determinism (8 to 22 to 8) | Perceptual compare | Keep |
| Text overflow, off-stage, overlap | Every scene's middle and end, as errors | Check only at `meta.rest` times (fallback: last 0.3 s of each scene); skip `[data-qa="free"]` subtrees; overlap only between non-free text |
| Preview page overflow at 375/768/1440 | Required | Remove (host player) |
| Frames to the model | Separate user message, later rewritten by `_slim_messages` | Return frames inside the tool result (image blocks); clear old tool results with context editing, never rewrite history (§8) |
| Creative review | None | After `check_film` passes, the agent reviews frames against the creative rubric in `skills/02` and `skills/07` before `finish` |

---

## 8. Model integration (Python, Anthropic SDK)

Replace the Fireworks client in `agent.py` with the Anthropic SDK. This shape follows the current API: adaptive thinking is always on for Opus 5.5, effort must be set explicitly (the default is `medium`), sampling parameters are rejected, and the server-side refusal fallback is enabled.

```python
from anthropic import AsyncAnthropic

client = AsyncAnthropic()  # ANTHROPIC_API_KEY from the environment

async def call_model(system_text: str, tools: list, messages: list):
    async with client.beta.messages.stream(
        model="claude-opus-5-5",
        max_tokens=64000,
        betas=[
            "server-side-fallback-2026-07-01",     # fallbacks="default": a classifier decline is retried server-side
            "thinking-binding-controls-2026-08-01", # explicit preserved-thinking behaviour
            "context-management-2025-06-27",        # clear old tool results (QA frames) without editing history
        ],
        fallbacks="default",
        thinking={"type": "adaptive", "block_binding": {"prefix_mismatch_behavior": "drop_block"}},
        output_config={"effort": "high"},
        context_management={"edits": [{"type": "clear_tool_uses_20250919"}]},
        system=[{"type": "text", "text": system_text, "cache_control": {"type": "ephemeral", "ttl": "1h"}}],
        tools=tools,           # same list, same order, every call
        messages=messages,     # append-only
    ) as stream:
        return await stream.get_final_message()
```

Rules for the loop:

1. **Append-only history.** Append `response.content` unchanged (thinking blocks included). Replace `_slim_messages` (it rewrites earlier turns, which invalidates thinking under preserved-thinking enforcement, a 400 for accounts created on or after 2026-08-31). Old QA frames go away through `clear_tool_uses_20250919` context editing instead.
2. **Tool shape.** Anthropic tools use `name`, `description` and `input_schema`. Results go back as `{"type": "tool_result", "tool_use_id", "content": [...]}`, all results of one turn in one user message, with `is_error: True` on failure. Frames go inside `content` as `{"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": ...}}`.
3. **`tool_choice`.** `auto` only (forced `any` or `tool` is rejected on Opus 5.5). Steer from the prompt; check that `finish` was called.
4. **Stop reasons.** Check `stop_reason` before running tools. On `refusal`, do not run that turn's tools. On `max_tokens` with a `tool_use` block, do not run it; ask for a smaller write. On `pause_turn`, continue.
5. **Large tool inputs.** With streaming, set `eager_input_streaming: True` on `sandbox_write` and `sandbox_edit`. Validate parsed input (path present, content a string) before running. Return an `is_error` result on failure.
6. **Effort.** `high` for the film loop. Keep the top-level effort constant within a task (changing it invalidates the cache).
7. **Billing.** Read `usage.input_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens` and `output_tokens` into `record_api_usage` (provider `anthropic`). Opus 5.5 is $4 / $20 per MTok, with cache reads at $0.20.
8. **Verify against the installed `anthropic` SDK version** before shipping (parameter names for betas evolve).

**Cost shape.**
- **Before:** about 35k to 40k prompt tokens times up to 14 calls on the drafting model, plus a second model pass for enhancement.
- **After:** an 11 KB system prompt (about 3k tokens) plus the tool definitions, cached after the first call. Skills 02 and 03 (about 6k tokens) are read once per film and the others only when needed. No enhancement pass, and at most 10 model calls.
- **Generation spend:** capped by §6.
- **Measure:** the cost per *delivered* film on 20 real briefs, before and after, rather than the per-call price.

---

## 9. Migration, in order (surgical)

1. **Remove UI enhancement from Motion Graphics** (`agent.py`):
   - Delete `_enhance_wanted`, `_enhance_deadline` and `_enhance`.
   - Delete the block that hands off to `deliver` when enhancement needs time (`if not deliver_now and … _enhance_wanted(): … return await hand_off("deliver")`).
   - Delete the `final_html = await _enhance(...)` call.
   - Disable the `taskforce.motion_graphics` enhancement profile.
2. **Switch the model** (`agent.py`):
   - Replace `MODEL`, `PROVIDER`, `_call` and `_bill`'s provider with the §8 client.
   - Drop `temperature`.
   - Convert tool schemas and messages to the Anthropic shape.
   - Replace `_slim_messages`.
   - Set `MAX_CALLS = 10` and `MAX_REVIEW_ROUNDS = 4`.
3. **Swap the prompt:**
   - Load `SYSTEM_PROMPT.md` as the system text.
   - Delete the `HOST_CONTRACT` duplication; the tools and contract live in the prompt now.
   - Mount `skills/` at `/skills` in the sandbox.
4. **E2B template:**
   - Build the image from the checklist in §10.
   - Create one sandbox per task; persist `/work` to storage at each hand-off, and restore it on resume.
5. **Tools:** implement the §4 tools on top of the sandbox and the existing `AudioDesk`, then add `generate_image` and `generate_video_clip`.
6. **Uploads:** replace `_split_uploads` and `_inline_assets` with the §5 copy step. Keep `asset:<id>` resolution for old films.
7. **QA and render:**
   - Apply the §7 changes in `render.py`.
   - Move `render_mp4` into the sandbox (`render.mjs`).
   - Keep `jobs.py`'s state machine and asset recording; only the render call and the storage location change.
8. **Player:** add the host player shell to the preview deliverable. Stop requiring controls in films.
9. **Evaluate before rollout:**
   - Run 20 real briefs (mixed: product, data, brand, social, education) through old and new.
   - Score blind with `skills/07`'s rubric.
   - Compare cost per delivered film and render success rate.
   - Ship behind a flag, then make it the default when the new path wins on quality without exceeding the old cost by more than you accept.

---

## 10. Checklists

### 10.1 E2B template (sandbox image)

- [ ] Node 22 LTS, npm; `playwright` with its Chromium (or a pinned Chromium + `CHROMIUM_PATH`)
- [ ] FFmpeg and ffprobe with libx264, libvpx-vp9, libopus, AAC, `ebur128`, `loudnorm`, `sidechaincompress`, `silencedetect`
- [ ] Python 3.11+, Pillow, numpy, opencv-python-headless (crop, cut-out masks, colour, contact sheets)
- [ ] Fonts installed system-wide and as WOFF2 under `/opt/motion/fonts`. A curated, licensed set: a neutral grotesk (Inter), a serif (Source Serif 4, Fraunces), a condensed display, a mono (JetBrains Mono), and Noto for wide script coverage (Arabic, CJK, Devanagari).
- [ ] Offline libraries under `/opt/motion/vendor` (pinned versions, licences recorded): `gsap` (timelines, SplitText, MotionPath), `three` (+ `GLTFLoader`), `d3` (scales, shapes, geo), `lottie-web`, `simplex-noise` (optional), `p5` (optional)
- [ ] Reference modules at `/opt/motion`: `scenes.mjs`, `render.mjs`, `voiceover.mjs`, `export-social.mjs`
- [ ] `/skills/*/SKILL.md` (this folder's `skills/`)
- [ ] A smoke test in the image build that renders a 2 s film and checks determinism

### 10.2 Agent tools

- [ ] `sandbox_exec`, `sandbox_write` (eager input streaming), `sandbox_edit`, `sandbox_read`, `view_image`
- [ ] `preview_frames`, `check_film`
- [ ] `generate_voiceover` (Gemini TTS desk) and `generate_music` (Lyria desk), writing into the sandbox
- [ ] `generate_image` (Grok Imagine) and `generate_video_clip` (Grok Imagine Video 1.5 Lite), host-configured model IDs, per-task budgets
- [ ] Grounded research tools (existing), unchanged
- [ ] `finish`: render all formats, master and verify audio, save the bundle and MP4s, poster

### 10.3 Production toolchain the agent may use

| Need | Tool |
| --- | --- |
| Timeline, choreography | `scenes.mjs` (`createFilm`, `track`, `spring`, `kinetic`, `camera`), or GSAP paused timeline + `tl.time(t)` |
| 2D vector, diagrams, maps | SVG, D3 (scales, shapes, `d3-geo`) |
| Many particles, procedural | Canvas 2D with seeded `rng`/`noise`; p5 in instance mode driven by `t` |
| 3D, depth, products | Three.js, `renderer.render()` after setting transforms from `t`; glTF models from uploads |
| Vector animation assets | lottie-web, `goToAndStop(frame, true)` |
| Image work | Pillow, OpenCV, ffmpeg (crop, mask, grade, upscale, tile) |
| Video clips | ffmpeg (trim, retime, crop, extract frames), `imageSequence()` |
| Audio | Host voice and music tools; ffmpeg for measuring, trimming, mixing |
| Capture and encode | Playwright + Chromium (`render.mjs`), FFmpeg (`export-social.mjs`) |
| Verification | `check_film`, `preview_frames`, ffprobe, `ebur128`, full decode |

### 10.4 Definition of done for one film

- [ ] Creative brief and shot plan written (skills 01 and 02)
- [ ] `check_film` passes: deterministic, no layout issue at rest moments, no console errors
- [ ] Frames reviewed against the creative rubric; at least one revision made from looking at frames
- [ ] Voice and music only if the policy allowed them; sync checked on cues
- [ ] All formats rendered and verified by `export-social.mjs`; report attached
- [ ] Summary states format, duration, sound, what was verified and what was not

---

## 11. Risks and what is not verified

- The Python integration shape in §8 follows current Anthropic API documentation but was not run against your account. Confirm it on staging with your SDK version.
- xAI request shapes, clip lengths and pricing were not verified here. Wire the tools from xAI's current docs.
- E2B specifics (template build, pause and resume, CPU count) follow E2B's custom template model. Size workers to the vCPUs you provision.
- WebGL on SwiftShader works but is slow. Heavy 3D needs a GPU render pool or shorter 3D shots.
- Word-level timing stays estimated unless an aligner runs in the sandbox. Cuts should land on line starts (exact); word-level accents are approximate.
- Model quality gains must be measured on your briefs (§9 step 9). Do not assume them.
