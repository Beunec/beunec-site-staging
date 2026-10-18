#!/usr/bin/env node
/*
 * Writes the voiceover kit for both cuts into motion-studio/voiceover/, read
 * straight from the composition so the script always matches the frames:
 *
 *   <cut>-voiceover.md     timed script, ElevenLabs settings, music prompt
 *   <cut>-elevenlabs.txt   the whole narration with timed pauses, paste-ready
 *   <cut>-lines/NN.txt     one line per file, for line-by-line generation
 *   <cut>-cues.json        exact start times, used by mux-audio.mjs
 *
 *   node motion-studio/voiceover.mjs
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "voiceover");
mkdirSync(out, { recursive: true });

const MUSIC = {
  story: `Cinematic, warm and restrained underscore for a ${"{DURATION}"}-second software story about agentic AI work. Instrumental only, no vocals, no choir. Around 88 BPM in D major. Soft felt piano and warm analog synth pads carry a simple four-note motif; light pulsing synth arpeggio and a gentle sub bass enter after the first 15 seconds; subtle brushed percussion and soft claps from about one third of the way in, never busy. Leave the 300 Hz to 3 kHz range open so a spoken voiceover sits clearly on top. Mood: calm confidence, clarity, quiet precision, optimistic and premium, not corporate jingle, not epic trailer. Small lifts every 15 to 20 seconds to mark new chapters, a fuller but still understated moment near the end, then a clean resolve on the tonic with a soft piano note and a natural reverb tail. No sudden drops, no risers, no sound effects.`,
  reel: `Minimal, seamless 18-second loop for a silent product reel of real software screens. Instrumental only. 96 BPM, A minor to C major colour. Soft muted plucks, a warm pad and a light ticking hi-hat with a gentle sidechain pulse. Even energy from start to finish with no intro, no build and no ending, so the last beat flows straight back into the first. Clean, modern, calm and quietly confident; low in the mix and never distracting.`,
};

const REEL_LINES = [
  { at: 0.5, text: "Your work, in one taskspace." },
  { at: 3.5, text: "Every step, live." },
  { at: 6.5, text: "Files, exactly as generated." },
  { at: 9.5, text: "Publish with an access code." },
  { at: 12.5, text: "Open it on any device." },
  { at: 15.5, text: "Even full code projects." },
];

const ts = (s, vtt = false) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const m = Math.floor(ms / 60000);
  const sec = ((ms % 60000) / 1000).toFixed(vtt ? 3 : 1);
  return `${m}:${sec.padStart(vtt ? 6 : 4, "0")}`;
};
const breakTags = (gap) => {
  // ElevenLabs honours <break> up to 3 seconds; longer gaps become two tags.
  const parts = [];
  let left = Math.max(0, gap);
  while (left > 0.05) {
    const take = Math.min(3, left);
    parts.push(`<break time="${take.toFixed(1)}s" />`);
    left -= take;
  }
  return parts.join(" ");
};

function writeKit(cut, cues, duration) {
  const linesDir = join(out, `${cut}-lines`);
  rmSync(linesDir, { recursive: true, force: true });
  mkdirSync(linesDir, { recursive: true });
  cues.forEach((c, i) => writeFileSync(join(linesDir, `${String(i + 1).padStart(2, "0")}.txt`), c.spoken + "\n"));

  // Continuous version: lead-in silence, then each line followed by the pause until the next one.
  let paste = breakTags(cues[0].start);
  cues.forEach((c, i) => {
    const next = cues[i + 1];
    const gap = next ? next.start - c.end : 0;
    paste += (paste ? " " : "") + c.spoken + (next ? " " + breakTags(gap) : "");
  });
  writeFileSync(join(out, `${cut}-elevenlabs.txt`), paste.trim() + "\n");
  writeFileSync(join(out, `${cut}-cues.json`), JSON.stringify({ duration, wordsPerSecond: 2.5, cues }, null, 2) + "\n");

  const title = cut === "story" ? "The Aselius story" : "The Aselius reel";
  const music = MUSIC[cut].replace("{DURATION}", String(Math.round(duration)));
  const md = [
    `# ${title}: voiceover and music`,
    "",
    `Video length: ${ts(duration)} (${duration} s). ${cues.length} voice lines, timed to the frames at about 150 words a minute.`,
    "Every word the voice says is the caption on screen at that moment, so viewers can read along.",
    "",
    "## Best result: one line at a time",
    "",
    `1. In ElevenLabs Text to Speech, paste each file from \`${cut}-lines/\` (01.txt, 02.txt, ...) and download each clip as 01.mp3, 02.mp3, ... in the same order.`,
    "2. Use the same voice and settings for every line (below), so the read sounds continuous.",
    `3. Run \`node motion-studio/mux-audio.mjs ${cut} --lines <folder of mp3s> --music <music.mp3>\`. It places each line at its exact start time below, gently speeds up any line that runs long, ducks the music under the voice, and writes the final video.`,
    "",
    "## Quicker: the whole script in one go",
    "",
    `Paste \`${cut}-elevenlabs.txt\` into ElevenLabs. It contains the full narration with \`<break>\` pauses timed to the cuts. Pauses work with the Multilingual v2 and Flash/Turbo models; with Eleven v3, use line-by-line instead. Then run \`node motion-studio/mux-audio.mjs ${cut} --voice <voiceover.mp3> --music <music.mp3>\`.`,
    "",
    "## Voice settings",
    "",
    "- **Model:** Eleven Multilingual v2.",
    "- **Voice:** a calm, clear, warm narrator (male or female), mid pitch, no strong accent.",
    "- **Speed:** 1.0. The timing assumes about 2.5 words a second.",
    "- **Stability:** 55 to 65. **Similarity:** 75. **Style exaggeration:** 0 to 10. **Speaker boost:** on.",
    "- **Pronunciation:** add your preferred pronunciation of *Aselius* and *Rivine* to an ElevenLabs pronunciation dictionary before generating, so every line says them the same way. URLs are already written the way they should be read (\"aselius dot beunec dot com\"). MCP and CLI should be read letter by letter; if your voice says them as words, add them to the dictionary too.",
    "",
    "## Timed script",
    "",
    "| # | Starts | Ends by | Voice reads | Caption on screen |",
    "| --- | --- | --- | --- | --- |",
    ...cues.map((c, i) => `| ${i + 1} | ${ts(c.start)} | ${ts(c.end)} | ${c.spoken} | ${c.text} |`),
    "",
    "## Background music prompt (ElevenLabs Music)",
    "",
    `Generate ${Math.ceil(duration)} seconds:`,
    "",
    "```text",
    music,
    "```",
    "",
  ].join("\n");
  writeFileSync(join(out, `${cut}-voiceover.md`), md);
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(pathToFileURL(join(here, "explainer/index.html")).href + "?cut=story");
const story = await page.evaluate(() => ({ duration: window.DURATION, captions: window.CAPTIONS }));
await browser.close();

const storyCues = story.captions.map((c) => ({ start: c.start, end: c.end, text: c.text, spoken: c.spoken }));
writeKit("story", storyCues, story.duration);
writeKit(
  "reel",
  REEL_LINES.map((l) => ({ start: l.at, end: l.at + l.text.split(" ").length / 2.5 + 0.35, text: l.text, spoken: l.text })),
  18,
);
console.log(`voiceover kit written to ${out}`);
