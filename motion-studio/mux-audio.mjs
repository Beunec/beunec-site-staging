#!/usr/bin/env node
/*
 * Puts the ElevenLabs voiceover and music on a rendered video.
 *
 *   node motion-studio/mux-audio.mjs story --lines ./vo-story --music ./music-story.mp3
 *   node motion-studio/mux-audio.mjs story --voice ./voiceover.mp3 --music ./music.mp3
 *   node motion-studio/mux-audio.mjs reel  --music ./music-reel.mp3
 *
 * --lines  a folder of clips named 01.mp3, 02.mp3 ... in script order. Each clip
 *          starts at its cue time from voiceover/<cut>-cues.json; a clip that is
 *          longer than its slot is sped up slightly (up to 12%) so it never runs
 *          into the next cut, and anything still too long is reported.
 * --voice  one continuous voiceover file (from <cut>-elevenlabs.txt), placed at 0 s.
 * --music  background music, looped or trimmed to the video and ducked under the voice.
 *
 * Writes public/media/aselius-<cut>.mp4 (AAC) and .webm (Opus) in place, keeping
 * the picture untouched. Needs ffmpeg and ffprobe on PATH.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, renameSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const cut = process.argv[2] === "reel" ? "reel" : "story";
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? resolve(process.argv[i + 1]) : null;
};
const linesDir = arg("--lines");
const voiceFile = arg("--voice");
const musicFile = arg("--music");
if (!linesDir && !voiceFile && !musicFile) {
  console.error("Give at least one of --lines <folder>, --voice <file>, --music <file>.");
  process.exit(1);
}

const { duration, cues } = JSON.parse(readFileSync(join(here, "voiceover", `${cut}-cues.json`), "utf8"));
const video = join(root, "public/media", `aselius-${cut}.mp4`);
const probe = (f) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

const inputs = ["-i", video];
const filters = [];
const voiceLabels = [];

if (linesDir) {
  const files = readdirSync(linesDir).filter((f) => /\.(mp3|wav|m4a|ogg)$/i.test(f)).sort();
  if (files.length !== cues.length) {
    console.warn(`Expected ${cues.length} clips, found ${files.length}. Clips are matched in name order.`);
  }
  files.slice(0, cues.length).forEach((f, i) => {
    const cue = cues[i];
    const slot = (cues[i + 1] ? cues[i + 1].start : duration) - cue.start - 0.15;
    const len = probe(join(linesDir, f));
    let tempo = 1;
    if (len > slot) {
      tempo = Math.min(1.12, len / slot);
      const fits = len / tempo <= slot;
      console.log(`line ${i + 1}: ${len.toFixed(2)} s in a ${slot.toFixed(2)} s slot, speeding to ${tempo.toFixed(2)}x${fits ? "" : " (still long: regenerate it a little faster)"}`);
    }
    inputs.push("-i", join(linesDir, f));
    const n = inputs.filter((x) => x === "-i").length - 1;
    filters.push(`[${n}:a]${tempo > 1 ? `atempo=${tempo.toFixed(3)},` : ""}adelay=${Math.round(cue.start * 1000)}:all=1[v${i}]`);
    voiceLabels.push(`[v${i}]`);
  });
} else if (voiceFile) {
  inputs.push("-i", voiceFile);
  filters.push(`[1:a]anull[v0]`);
  voiceLabels.push("[v0]");
}

let voice = null;
if (voiceLabels.length) {
  filters.push(`${voiceLabels.join("")}amix=inputs=${voiceLabels.length}:normalize=0,apad,atrim=0:${duration},loudnorm=I=-16:TP=-1.5:LRA=11[voice]`);
  voice = "[voice]";
}

let mix = voice;
if (musicFile) {
  inputs.push("-stream_loop", "-1", "-i", musicFile);
  const n = inputs.filter((x) => x === "-i").length - 1;
  const fadeOut = Math.max(0, duration - 2.5).toFixed(2);
  filters.push(`[${n}:a]atrim=0:${duration},afade=t=in:d=1.5,afade=t=out:st=${fadeOut}:d=2.5,volume=${voice ? "0.32" : "0.7"}[music]`);
  if (voice) {
    filters.push(`[voice]asplit=2[vmix][vkey]`);
    filters.push(`[music][vkey]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[ducked]`);
    filters.push(`[vmix][ducked]amix=inputs=2:normalize=0,alimiter=limit=0.95[premix]`);
  } else {
    filters.push(`[music]alimiter=limit=0.95[premix]`);
  }
  mix = "[premix]";
}
// The soundtrack always runs exactly as long as the picture.
filters.push(`${mix}apad,atrim=0:${duration}[final]`);
mix = "[final]";

const tmp = video.replace(/\.mp4$/, ".tmp.mp4");
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error", ...inputs,
  "-filter_complex", filters.join(";"),
  "-map", "0:v", "-map", mix,
  "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-t", String(duration), "-movflags", "+faststart", tmp,
], { stdio: "inherit" });
renameSync(tmp, video);

const webm = video.replace(/\.mp4$/, ".webm");
if (existsSync(webm)) {
  const tmpW = webm.replace(/\.webm$/, ".tmp.webm");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", webm, "-i", video, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "libopus", "-b:a", "128k", "-t", String(duration), tmpW], { stdio: "inherit" });
  renameSync(tmpW, webm);
}
console.log(`audio added to ${video}${existsSync(webm) ? " and the WebM" : ""}`);
