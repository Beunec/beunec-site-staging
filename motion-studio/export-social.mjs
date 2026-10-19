#!/usr/bin/env node
/*
 * Exports the upload-ready videos into beunec-motion-kit/videos:
 *
 *   aselius-story-16x9-1440p.mp4   2560x1440, YouTube and LinkedIn
 *   aselius-story-9x16.mp4         1080x1920, Reels, Shorts, TikTok, Stories
 *   aselius-reel-9x16.mp4          1080x1920, 18 s loop
 *
 *   node motion-studio/export-social.mjs                 # render everything, then mux
 *   node motion-studio/export-social.mjs --renders <dir> # reuse silent renders already in <dir>
 *   node motion-studio/export-social.mjs --only story-9x16
 *
 * Silent renders are named story-16x9.mp4, story-9x16.mp4 and reel-9x16.mp4.
 * The story voiceover is cut into its measured lines (explainer/measured.js) and
 * each line is placed on its scene; the reel voiceover runs continuously from 0.
 * Audio is mastered for upload: 48 kHz AAC 320k, -14 LUFS, -1 dBTP, music ducked
 * under the voice. No subtitles are burned in: the narration is already written
 * on screen as it is spoken.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const out = join(root, "beunec-motion-kit/videos");
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
};
const renders = resolve(opt("--renders") ?? join(tmpdir(), "beunec-renders"));
const only = opt("--only");
const audio = join(here, "audio");
mkdirSync(out, { recursive: true });
mkdirSync(renders, { recursive: true });

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });

// The story read, cut at its measured lines: 0.1 s before each line, 0.15 s after.
function cutStoryLines() {
  const dir = join(renders, "vo-story");
  mkdirSync(dir, { recursive: true });
  const window = {};
  new Function("window", readFileSync(join(here, "explainer/measured.js"), "utf8"))(window);
  window.VO_MEASURED.story.forEach(([a, b], i) => {
    const st = Math.max(0, a - 0.1);
    const pre = 0.1 - (a - st);
    const en = b + 0.15;
    const f = [
      `atrim=${st}:${en}`, "asetpts=PTS-STARTPTS", "afade=t=in:d=0.02",
      `afade=t=out:st=${(en - st - 0.1).toFixed(3)}:d=0.1`,
      ...(pre > 0.001 ? [`adelay=${Math.round(pre * 1000)}:all=1`] : []),
    ].join(",");
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", join(audio, "story-voiceover.mp3"), "-af", f, "-c:a", "pcm_s16le", join(dir, `${String(i + 1).padStart(2, "0")}.wav`)]);
  });
  return dir;
}

const jobs = [
  {
    id: "story-16x9",
    render: ["story", "--scale", "1.3333334", "--crf", "16", "--workers", "3"],
    mux: () => ["story", "--lines", cutStoryLines(), "--music", join(audio, "story-music.mp3")],
    file: "aselius-story-16x9-1440p.mp4",
  },
  {
    id: "story-9x16",
    render: ["story", "--format", "vertical", "--crf", "17", "--workers", "3"],
    mux: () => ["story", "--lines", cutStoryLines(), "--music", join(audio, "story-music.mp3")],
    file: "aselius-story-9x16.mp4",
  },
  {
    id: "reel-9x16",
    render: ["reel", "--format", "vertical", "--crf", "17", "--workers", "3"],
    mux: () => ["reel", "--voice", join(audio, "reel-voiceover.mp3"), "--music", join(audio, "reel-music.mp3")],
    file: "aselius-reel-9x16.mp4",
  },
];

for (const job of jobs) {
  if (only && only !== job.id) continue;
  const silent = join(renders, `${job.id}.mp4`);
  if (!existsSync(silent)) run("node", [join(here, "render.mjs"), ...job.render, "--out", silent]);
  const final = join(out, job.file);
  run("node", [join(here, "mux-audio.mjs"), ...job.mux(), "--video", silent, "--out", final, "--master"]);
}
console.log(`exports written to ${out}`);
