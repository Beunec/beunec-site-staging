#!/usr/bin/env node
/*
 * voiceover.mjs: turn the generate_voiceover tool result into the film's timing map.
 *
 * No manual voice step: the agent writes the script, calls generate_voiceover (host TTS),
 * saves the JSON it returns, and runs this to get one file the film imports:
 *
 *   node voiceover.mjs vo.json --out film/timing.json [--emphasis beats.json] [--words aligned-words.json] [--film 32]
 *
 * Input (tool result): { lines: [{ i, text, start, end, words: [{ w, start, end }] }], speech_ends_at, timing }
 *   Line start/end are exact (measured from the synthesised audio). Word times are
 *   estimates spread inside each line; they are good for staggering type at speaking pace,
 *   not for hard cuts on a syllable.
 * --words: optional word timestamps from a real aligner run in the sandbox (for example a
 *   Whisper-family model with word timestamps), as [{ w, start, end }] on the film timeline.
 *   They replace the estimates for the words they match, line by line.
 * --emphasis: [{ line: 0, phrase: "the work" }, ...] the words the picture should hit
 *   (a word punch, a cut, a reveal). Kept out of the spoken text, because TTS reads text verbatim.
 * --film:  the planned film duration; the script fails when speech runs past it.
 *
 * Output (timing.json):
 *   { lines: [...same shape...], speechEndsAt, source: "estimated" | "aligned",
 *     cues: [{ t, line, kind: "line" | "emphasis", text }] }
 * `cues` lists every line start (cut points) and every emphasis phrase's start, so scene
 * starts and accents are placed on the voice, not guessed.
 */
import { readFileSync, writeFileSync } from "node:fs";

const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
};
const input = JSON.parse(readFileSync(argv[0], "utf8"));
const out = opt("--out") || "timing.json";
const film = opt("--film") ? Number(opt("--film")) : null;
const emphasis = opt("--emphasis") ? JSON.parse(readFileSync(opt("--emphasis"), "utf8")) : [];
const aligned = opt("--words") ? JSON.parse(readFileSync(opt("--words"), "utf8")) : null;
const bare = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

const lines = (input.lines || []).map((ln, i) => ({
  i: ln.i ?? i,
  text: String(ln.text || ""),
  start: Number(ln.start),
  end: Number(ln.end),
  words: (ln.words || []).map((w) => ({ w: String(w.w), start: Number(w.start), end: Number(w.end) })),
}));
if (!lines.length) throw new Error("No lines in the voiceover result.");

let source = "estimated";
if (aligned?.length) {
  // Match aligned words to each line in order, inside the line's exact window.
  let k = 0;
  for (const ln of lines) {
    for (const w of ln.words) {
      while (k < aligned.length && aligned[k].end < ln.start - 0.05) k++;
      const a = aligned[k];
      if (a && bare(a.w) === bare(w.w) && a.start >= ln.start - 0.1 && a.end <= ln.end + 0.1) {
        w.start = Math.round(a.start * 100) / 100;
        w.end = Math.round(a.end * 100) / 100;
        k++;
      }
    }
  }
  source = "aligned";
}

// Sanity: lines in order, words inside their line.
for (let i = 0; i < lines.length; i++) {
  const ln = lines[i];
  if (!(ln.end > ln.start)) throw new Error(`Line ${i} has no duration.`);
  if (i && ln.start < lines[i - 1].end - 0.01) throw new Error(`Line ${i} starts before line ${i - 1} ends.`);
  for (const w of ln.words) {
    w.start = Math.min(Math.max(w.start, ln.start), ln.end);
    w.end = Math.min(Math.max(w.end, w.start), ln.end);
  }
}
const speechEndsAt = Math.max(...lines.map((l) => l.end));
if (film != null && speechEndsAt > film - 0.6) {
  throw new Error(`Speech ends at ${speechEndsAt.toFixed(2)} s; the film needs at least ${(speechEndsAt + 0.6).toFixed(1)} s.`);
}

const cues = lines.map((ln) => ({ t: ln.start, line: ln.i, kind: "line", text: ln.text }));
for (const { line, phrase } of emphasis) {
  const ln = lines.find((l) => l.i === line);
  const want = String(phrase).split(/\s+/).map(bare).filter(Boolean);
  const ws = ln?.words || [];
  const j = ws.findIndex((_, j) => want.every((w, k) => bare(ws[j + k]?.w || "") === w));
  if (j < 0) throw new Error(`Emphasis "${phrase}" is not in line ${line}: ${ln?.text}`);
  cues.push({ t: ws[j].start, line, kind: "emphasis", text: phrase });
}
cues.sort((a, b) => a.t - b.t);

writeFileSync(out, JSON.stringify({ lines, speechEndsAt: Math.round(speechEndsAt * 100) / 100, source, cues }, null, 2) + "\n");
console.log(JSON.stringify({ out, lines: lines.length, speechEndsAt, source, cues: cues.length }));
