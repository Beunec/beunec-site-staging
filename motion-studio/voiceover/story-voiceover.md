# The Aselius story: voiceover and music

Video length: 2:41.2 (161.2 s). 19 voice lines, timed to the frames at about 150 words a minute.
Every word the voice says is the caption on screen at that moment, so viewers can read along.

## Best result: one line at a time

1. In ElevenLabs Text to Speech, paste each file from `story-lines/` (01.txt, 02.txt, ...) and download each clip as 01.mp3, 02.mp3, ... in the same order.
2. Use the same voice and settings for every line (below), so the read sounds continuous.
3. Run `node motion-studio/mux-audio.mjs story --lines <folder of mp3s> --music <music.mp3>`. It places each line at its exact start time below, gently speeds up any line that runs long, ducks the music under the voice, and writes the final video.

## Quicker: the whole script in one go

Paste `story-elevenlabs.txt` into ElevenLabs. It contains the full narration with `<break>` pauses timed to the cuts. Pauses work with the Multilingual v2 and Flash/Turbo models; with Eleven v3, use line-by-line instead. Then run `node motion-studio/mux-audio.mjs story --voice <voiceover.mp3> --music <music.mp3>`.

## Voice settings

- **Model:** Eleven Multilingual v2.
- **Voice:** a calm, clear, warm narrator (male or female), mid pitch, no strong accent.
- **Speed:** 1.0. The timing assumes about 2.5 words a second.
- **Stability:** 55 to 65. **Similarity:** 75. **Style exaggeration:** 0 to 10. **Speaker boost:** on.
- **Pronunciation:** add your preferred pronunciation of *Aselius* and *Rivine* to an ElevenLabs pronunciation dictionary before generating, so every line says them the same way. URLs are already written the way they should be read ("aselius dot beunec dot com").

## Timed script

| # | Starts | Ends by | Voice reads | Caption on screen |
| --- | --- | --- | --- | --- |
| 1 | 0:00.7 | 0:05.5 | Most AI gives you a reply. Aselius gives you the work. | Most AI gives you a reply. Aselius gives you the work. |
| 2 | 0:06.8 | 0:16.1 | Aselius is agentic infrastructure software, run by specialized Rivine engines. Every result is a real file you can inspect, edit and export. | Aselius is agentic infrastructure software, run by specialized Rivine engines. Every result is a real file you can inspect, edit and export. |
| 3 | 0:17.4 | 0:23.8 | Everything lives in one sidebar: your workspaces, Connector, Selius, Automations, Observability, Credits and Manage Teams. | Everything lives in one sidebar: your workspaces, Connector, Selius, Automations, Observability, Credits and Manage Teams. |
| 4 | 0:25.1 | 0:33.1 | Inside a workspace, Taskspace is where work happens: the conversation on the left, the Preview Panel on the right. | Inside a workspace, Taskspace is where work happens: the conversation on the left, the Preview Panel on the right. |
| 5 | 0:34.5 | 0:44.9 | Choose the Rivine engine for the job: TaskForce, Research, Code, Cicero, Creative, Confluence, Assist or Browse. The engine you pick is the engine that runs. | Choose the Rivine engine for the job: TaskForce, Research, Code, Cicero, Creative, Confluence, Assist or Browse. The engine you pick is the engine that runs. |
| 6 | 0:46.2 | 0:53.9 | Set the engine and its specialty, then send. Or start from an Agent Note that already has both. | Set the engine and its specialty, then send. Or start from an Agent Note that already has both. |
| 7 | 0:55.1 | 1:02.0 | Every step shows as it happens. Stop it any time; the trail stays with the thread. | Every step shows as it happens. Stop it any time; the trail stays with the thread. |
| 8 | 1:03.3 | 1:10.2 | Before it acts in your apps, you approve the exact action. Nothing runs until you do. | Before it acts in your apps, you approve the exact action. Nothing runs until you do. |
| 9 | 1:11.4 | 1:15.9 | If it needs you, it asks one question and waits. | If it needs you, it asks one question and waits. |
| 10 | 1:17.2 | 1:24.4 | One turn. A whole launch kit: documents, data, media and the app, each one a real file. | One turn. A whole launch kit: documents, data, media and the app, each one a real file. |
| 11 | 1:25.8 | 1:33.0 | Open any file exactly as generated: Word as pages, Excel as a grid, decks slide by slide. | Open any file exactly as generated: Word as pages, Excel as a grid, decks slide by slide. |
| 12 | 1:34.3 | 1:38.4 | Edit with Rivine Assist. Then save, publish or export. | Edit with Rivine Assist. Then save, publish or export. |
| 13 | 1:39.6 | 1:46.5 | Publish a snapshot with its own access code. Later edits stay private until you update it. | Publish a snapshot with its own access code. Later edits stay private until you update it. |
| 14 | 1:47.8 | 1:53.9 | It opens on any device. No sign-in. Exactly as generated, with a Download button. | It opens on any device. No sign-in. Exactly as generated, with a Download button. |
| 15 | 1:55.1 | 1:59.6 | Automations run on a schedule, even with your computer off. | Automations run on a schedule, even with your computer off. |
| 16 | 2:00.9 | 2:11.8 | Use Aselius from any AI app. Connect Claude, Cursor or ChatGPT to Aselius M C P, at workspace dot beunec dot com slash M C P. | Use Aselius from any AI app. Connect Claude, Cursor or ChatGPT to Aselius MCP at workspace.beunec.com/mcp. |
| 17 | 2:13.1 | 2:25.1 | The same engines, wherever you work: the web app, Rivine Browse, the Rivine Code CLI, Aselius MCP, your chat apps, and Selius by voice. One wallet across every surface. | The same engines, wherever you work: the web app, Rivine Browse, the Rivine Code CLI, Aselius MCP, your chat apps, and Selius by voice. One wallet across every surface. |
| 18 | 2:26.4 | 2:34.0 | Not another Claude Cowork, ChatGPT Work or Kimi Work. Specialized engines, real deliverables, and you stay in control. | Not another Claude Cowork, ChatGPT Work or Kimi Work. Specialized engines, real deliverables, and you stay in control. |
| 19 | 2:35.4 | 2:39.8 | Aselius. Agentic infrastructure software, at aselius dot beunec dot com. | Aselius. Agentic infrastructure software, at aselius.beunec.com. |

## Background music prompt (ElevenLabs Music)

Generate 162 seconds:

```text
Cinematic, warm and restrained underscore for a 161-second software story about agentic AI work. Instrumental only, no vocals, no choir. Around 88 BPM in D major. Soft felt piano and warm analog synth pads carry a simple four-note motif; light pulsing synth arpeggio and a gentle sub bass enter after the first 15 seconds; subtle brushed percussion and soft claps from about one third of the way in, never busy. Leave the 300 Hz to 3 kHz range open so a spoken voiceover sits clearly on top. Mood: calm confidence, clarity, quiet precision, optimistic and premium, not corporate jingle, not epic trailer. Small lifts every 15 to 20 seconds to mark new chapters, a fuller but still understated moment near the end, then a clean resolve on the tonic with a soft piano note and a natural reverb tail. No sudden drops, no risers, no sound effects.
```
