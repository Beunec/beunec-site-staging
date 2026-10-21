#!/usr/bin/env node
/*
 * export-social.mjs: put the soundtrack on every rendered format, master it, verify it.
 *
 *   node export-social.mjs --render 16x9=out/film-16x9.mp4 --render 9x16=out/film-9x16.mp4 \
 *        --soundtrack out/soundtrack.mp3 [--sfx out/sfx.wav] --duration 32 --name launch --outdir out/final
 *
 *   # or mix here from stems (voice on its timeline, music ducked under it):
 *   node export-social.mjs --render 16x9=out/film.mp4 --voice out/voice.wav --music out/music.mp3 --duration 32
 *
 * Every format shares one soundtrack, because every format shares one timeline (the film
 * recomposes the picture per format; it never retimes it).
 *
 * Output per format: <name>-<format>.mp4 with H.264 (copied, untouched) and AAC 48 kHz
 * 256 kbps, loudness about -14 LUFS integrated and true peak at or below -1 dBTP (streaming
 * norm). Then each file is verified: streams, dimensions, duration within 0.1 s of the film,
 * a full decode with no errors, integrated loudness and true peak. The report is printed as
 * JSON and written next to the files; a failed check exits non-zero.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
const all = (name) => argv.flatMap((a, i) => (a === name ? [argv[i + 1]] : []));
const opt = (name, fallback = null) => all(name)[0] ?? fallback;
const renders = all("--render").map((s) => { const [fmt, file] = s.split("="); return { fmt, file: resolve(file) }; });
const D = Number(opt("--duration"));
const name = opt("--name", "film");
const outdir = resolve(opt("--outdir", "out/final"));
const soundtrack = opt("--soundtrack");
const voice = opt("--voice");
const music = opt("--music");
const sfx = opt("--sfx");
if (!renders.length || !D) throw new Error("Give at least one --render fmt=file and --duration seconds.");
mkdirSync(outdir, { recursive: true });

const ff = (args) => execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: "inherit" });
// FFmpeg reports (decode errors, ebur128 summary) on stderr, whether or not it succeeds.
const ffText = (args) => String(spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8" }).stderr || "");

// 1. One mastered soundtrack (WAV) for every format.
const mix = join(outdir, `${name}-soundtrack.wav`);
const inputs = [];
const graph = [];
let n = 0;
const pad = `apad,atrim=0:${D}`;
if (soundtrack) { inputs.push("-i", soundtrack); graph.push(`[${n++}:a]aresample=48000,aformat=channel_layouts=stereo,${pad}[bed]`); }
if (voice) { inputs.push("-i", voice); graph.push(`[${n++}:a]aresample=48000,aformat=channel_layouts=stereo,${pad},highpass=f=80,acompressor=threshold=0.1:ratio=2.5:attack=8:release=120[vo]`); }
if (music) {
  inputs.push("-stream_loop", "-1", "-i", music);
  graph.push(`[${n++}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${D},asetpts=N/SR/TB,afade=t=in:d=1,afade=t=out:st=${Math.max(0, D - 2)}:d=2,volume=${voice ? 0.35 : 0.8}[mu]`);
}
if (sfx) { inputs.push("-i", sfx); graph.push(`[${n++}:a]aresample=48000,aformat=channel_layouts=stereo,${pad}[fx]`); }
const labels = [];
if (graph.some((g) => g.endsWith("[vo]")) && graph.some((g) => g.endsWith("[mu]"))) {
  graph.push("[vo]asplit=2[vom][vok]", "[mu][vok]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[mud]");
  labels.push("[vom]", "[mud]");
} else {
  if (graph.some((g) => g.endsWith("[vo]"))) labels.push("[vo]");
  if (graph.some((g) => g.endsWith("[mu]"))) labels.push("[mu]");
}
if (graph.some((g) => g.endsWith("[bed]"))) labels.push("[bed]");
if (graph.some((g) => g.endsWith("[fx]"))) labels.push("[fx]");
if (!labels.length) {
  inputs.push("-f", "lavfi", "-t", String(D), "-i", "anullsrc=channel_layout=stereo:sample_rate=48000");
  graph.push(`[${n++}:a]anull[silence]`);
  labels.push("[silence]");
}
const silent = labels[0] === "[silence]";
graph.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0,${pad}${silent ? "" : ",loudnorm=I=-14:TP=-2:LRA=11,alimiter=limit=0.79:level=disabled"}[out]`);
ff([...inputs, "-filter_complex", graph.join(";"), "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", "-t", String(D), mix]);

// 2. Mux onto each format, picture untouched.
const report = [];
for (const { fmt, file } of renders) {
  const out = join(outdir, `${name}-${fmt}.mp4`);
  ff(["-i", file, "-i", mix, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-t", String(D), "-movflags", "+faststart", out]);

  // 3. Verify what was actually written.
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", out]).toString());
  const v = probe.streams.find((s) => s.codec_type === "video") || {};
  const a = probe.streams.find((s) => s.codec_type === "audio") || {};
  const dur = Number(probe.format.duration);
  const decodeErrors = ffText(["-v", "error", "-i", out, "-f", "null", "-"]).trim();
  // The summary block is the last "I:" and "Peak:" lines.
  const loud = ffText(["-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"]);
  const I = Number((loud.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop()?.match(/-?[\d.]+/)[0]);
  const TP = Number((loud.match(/Peak:\s+(-?[\d.]+) dBFS/g) || []).pop()?.match(/-?[\d.]+/)[0]);
  const checks = {
    h264_yuv420p: v.codec_name === "h264" && v.pix_fmt === "yuv420p",
    aac_48k: a.codec_name === "aac" && Number(a.sample_rate) === 48000,
    duration: Math.abs(dur - D) <= 0.1,
    decodes: decodeErrors === "",
    loudness: silent || (I >= -16 && I <= -12),
    true_peak: silent || TP <= -0.9,
  };
  report.push({ format: fmt, file: out, width: v.width, height: v.height, fps: v.r_frame_rate, duration: dur, lufs: I, true_peak_dbfs: TP, bytes: Number(probe.format.size), checks, ok: Object.values(checks).every(Boolean) });
}
writeFileSync(join(outdir, `${name}-report.json`), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
process.exit(report.every((r) => r.ok) ? 0 : 2);
