# Rivine: the orchestration runtime (motion film)

A 2:35 explainer film about Rivine, the orchestration runtime that powers every Rivine engine behind Aselius. It is built in HTML, CSS and JavaScript and rendered to MP4 in two formats.

| File | Format | For |
| --- | --- | --- |
| `videos/rivine-orchestration-16x9-1440p.mp4` | 2560x1440, 30 fps, 2:35 | YouTube, LinkedIn |
| `videos/rivine-orchestration-9x16.mp4` | 1080x1920, 30 fps, 2:35 | Instagram Reels, TikTok, YouTube Shorts |

Both are H.264 with AAC at 48 kHz and are mastered to about -14 LUFS. The narration is written on screen as it is spoken, so no subtitles are needed.

## The film

The concept is the run as a trace. A single run ("RUN 4127 · Q3 launch plan") travels through the film as a ticket. Its path is a sage line that stamps a checkpoint at every step. The opening is charcoal: agents with nowhere to run, scattered sparks that snap into a ring on the word "Rivine". After that, Rivine's world is a calm canvas made of runtime instruments, not slides.

| Time | Scene | What you see |
| --- | --- | --- |
| 0:00 | Every agent needs somewhere to run | Agents scattered in the dark snap into one ring on "Rivine" |
| 0:10 | Plans, runs, finishes | The run ticket travels Plan → Run → Finish on the Rivine runtime plate, then the plan breaks down into a task graph (parallel branches, one review that waits for both) |
| 0:23 | Frameworks | LangChain, LangGraph, AutoGen and CrewAI as kits of parts; they build an agent, a graph and a crew; then a process window closes around them and, when it exits, everything falls and restarts from zero |
| 0:45 | Durable state | Every step stamps a checkpoint into a state ledger; a restart, a crash and a closing laptop each interrupt the run, and it resumes at step 4, not from zero |
| 1:00 | Human approval | The run pauses at an approval gate; a real approval card; the cursor approves; the run continues from the same checkpoint and the trail is recorded |
| 1:13 | What you would build | Queue, retries, credentials, billing, timeouts, approvals: built and wobbly in the framework column, built in on the Rivine side |
| 1:18 | How a Rivine run works | Five music-led beats from the research paper: decompose; delegate as little as necessary; tools that heal themselves; checked before you see it; remembered with provenance |
| 1:50 | One runtime, many engines | Eight engines dock onto the runtime plate on their spoken names; work is routed through one shared state; one run moves Research → Code → TaskForce without losing context |
| 2:12 | Deliverables, not chat | A chat reply is struck out; a document, spreadsheet, deck and code project appear on their words and gather into one finished run |
| 2:27 | Built on Rivine | Aselius on top, the engines beneath, the runtime at the base; end card |

## Sound

- **Voice:** your attached soundtrack: Gemini TTS, voice "Charon", 14 lines, 88 s of speech, used unchanged. Each line is cut at its measured boundaries and placed on the film's timeline. Measured placement is within 8 ms of plan for every line. Words appear on screen at the pace of their spoken phrase, using the pauses measured inside each line.
- **Music:** the Aselius story music bed (`motion-studio/audio/story-music.mp3`), started 6.04 s in so it resolves exactly at 2:35. It is ducked under the voice. Swap in any bed of 155 s or longer by replacing `audio/music-bed.wav`.
- **Length:** the voice is 88 s. To reach 2:35, the film shows each claim after it is said, and the middle section "How a Rivine run works" (1:18 to 1:50) is carried by music and large on-screen type. With a longer narration, re-time `film/timing.json` (see Rebuild).

## A content note

Line 5 of the narration says, "a framework is a library inside your process. When the process stops, the work stops." That is fair as a default. However, LangGraph does offer persistent checkpointers, which you configure, host and operate yourself. The rest of the film makes the more precise point: with a framework you assemble and run that infrastructure, while Rivine is the runtime that already has it. If you re-record, consider:

> "A framework gives you the parts. Persistence, retries, approvals and recovery are yours to wire, host and run."

## Rebuild

```bash
# from this folder; needs Node with Playwright, Chromium and FFmpeg
python3 build-audio.py                                           # voice placed on the timeline + music bed
R=../rivine-taskforce-motion-graphics/references
node $R/render.mjs film/index.html --check                       # determinism + layout at rest moments
node $R/render.mjs film/index.html --stills 20,64,96 --outdir out
node $R/render.mjs film/index.html --scale 1.3333334 --crf 16 --workers 3 --out out/rivine-16x9.mp4
node $R/render.mjs film/index.html --query format=vertical --crf 17 --workers 3 --out out/rivine-9x16.mp4
node $R/export-social.mjs --render 16x9-1440p=out/rivine-16x9.mp4 --render 9x16=out/rivine-9x16.mp4 \
  --voice audio/voice-timeline.wav --music audio/music-bed.wav --duration 155 --name rivine-orchestration --outdir videos
```

- `film/timing.json` holds each line's source window, its start on the film timeline, and each word's time.
- `build-audio.py` builds `audio/voice-timeline.wav` from `audio/voice-source.mp3` (each line cut at `src`, delayed to `start`) and the trimmed music bed.
- Code: `film/film.mjs` (scenes 1 to 3), `runtime-scenes.mjs` (4 to 6), `how-scenes.mjs` (7), `engine-scenes.mjs` (8 to 10), `core.mjs` (timing, narration on screen, helpers), and `scenes.mjs` (the engine from `rivine-taskforce-motion-graphics/references`).
