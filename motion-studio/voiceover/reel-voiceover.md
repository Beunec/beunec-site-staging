# The Aselius reel: voiceover and music

Video length: 0:18.0 (18 s). 6 voice lines, timed to the frames at about 150 words a minute.
Every word the voice says is the caption on screen at that moment, so viewers can read along.

## Best result: one line at a time

1. In ElevenLabs Text to Speech, paste each file from `reel-lines/` (01.txt, 02.txt, ...) and download each clip as 01.mp3, 02.mp3, ... in the same order.
2. Use the same voice and settings for every line (below), so the read sounds continuous.
3. Run `node motion-studio/mux-audio.mjs reel --lines <folder of mp3s> --music <music.mp3>`. It places each line at its exact start time below, gently speeds up any line that runs long, ducks the music under the voice, and writes the final video.

## Quicker: the whole script in one go

Paste `reel-elevenlabs.txt` into ElevenLabs. It contains the full narration with `<break>` pauses timed to the cuts. Pauses work with the Multilingual v2 and Flash/Turbo models; with Eleven v3, use line-by-line instead. Then run `node motion-studio/mux-audio.mjs reel --voice <voiceover.mp3> --music <music.mp3>`.

## Voice settings

- **Model:** Eleven Multilingual v2.
- **Voice:** a calm, clear, warm narrator (male or female), mid pitch, no strong accent.
- **Speed:** 1.0. The timing assumes about 2.5 words a second.
- **Stability:** 55 to 65. **Similarity:** 75. **Style exaggeration:** 0 to 10. **Speaker boost:** on.
- **Pronunciation:** add your preferred pronunciation of *Aselius* and *Rivine* to an ElevenLabs pronunciation dictionary before generating, so every line says them the same way. URLs are already written the way they should be read ("aselius dot beunec dot com").

## Timed script

| # | Starts | Ends by | Voice reads | Caption on screen |
| --- | --- | --- | --- | --- |
| 1 | 0:00.5 | 0:02.9 | Your work, in one taskspace. | Your work, in one taskspace. |
| 2 | 0:03.5 | 0:05.0 | Every step, live. | Every step, live. |
| 3 | 0:06.5 | 0:08.4 | Files, exactly as generated. | Files, exactly as generated. |
| 4 | 0:09.5 | 0:11.8 | Publish with an access code. | Publish with an access code. |
| 5 | 0:12.5 | 0:14.8 | Open it on any device. | Open it on any device. |
| 6 | 0:15.5 | 0:17.4 | Even full code projects. | Even full code projects. |

## Background music prompt (ElevenLabs Music)

Generate 18 seconds:

```text
Minimal, seamless 18-second loop for a silent product reel of real software screens. Instrumental only. 96 BPM, A minor to C major colour. Soft muted plucks, a warm pad and a light ticking hi-hat with a gentle sidechain pulse. Even energy from start to finish with no intro, no build and no ending, so the last beat flows straight back into the first. Clean, modern, calm and quietly confident; low in the mix and never distracting.
```
