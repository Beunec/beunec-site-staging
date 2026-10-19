#!/usr/bin/env node
/*
 * Renders the Aselius story and reel from motion-studio/explainer.
 *
 *   npm i --no-save playwright       # once; uses your installed Chromium
 *   node motion-studio/render.mjs story   # -> public/media/aselius-story.mp4 (+ .vtt, poster)
 *   node motion-studio/render.mjs reel    # -> public/media/aselius-reel.mp4 (+ poster)
 *   node motion-studio/render.mjs story --stills 3,12,40   # PNG stills to motion-studio/out
 *
 * Options for exports outside the site (see motion-studio/export-social.mjs):
 *   --format vertical    1080x1920 (9:16) instead of 1920x1080 (16:9)
 *   --scale 1.3333       device pixel ratio; 1.3333 renders 16:9 at 2560x1440
 *   --crf 16             x264 quality (lower is sharper; site default 24)
 *   --workers 3          render frame ranges in parallel pages, then join them
 *   --out <file.mp4>     write here and skip the site's poster, captions and meta
 *
 * Needs ffmpeg on PATH and the Inter font installed. Each frame is rendered by
 * seeking renderAt(frame / fps), so output is identical on every run and the
 * frame ranges rendered in parallel join without a seam.
 * Set CHROMIUM_PATH to use a specific Chromium binary.
 */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const argv = process.argv.slice(2);
const opt = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : fallback;
};
const cut = argv[0] === "reel" ? "reel" : "story";
const vertical = opt("--format") === "vertical";
const scale = Number(opt("--scale", "1"));
const workers = Math.max(1, Number(opt("--workers", "1")));
const outArg = opt("--out");
const stills = opt("--stills")?.split(",").map(Number) ?? null;
const FPS = 30;
const viewport = vertical ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };
const url = pathToFileURL(join(here, "explainer/index.html")).href + `?cut=${cut}${vertical ? "&format=vertical" : ""}`;

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
async function openPage() {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  await page.goto(url);
  await page.evaluate(() => window.ready);
  const stage = page.locator("#stage");
  const frameAt = async (t) => {
    await page.evaluate((time) => window.renderAt(time), t);
    return stage.screenshot({ type: "png", animations: "disabled" });
  };
  return { page, frameAt };
}

const main = await openPage();
const duration = await main.page.evaluate(() => window.DURATION);

if (stills) {
  const out = join(here, "out");
  mkdirSync(out, { recursive: true });
  for (const t of stills) writeFileSync(join(out, `${cut}${vertical ? "-vertical" : ""}-${t}.png`), await main.frameAt(t));
  console.log(`stills written to ${out}`);
  await browser.close();
  process.exit(0);
}

const mediaDir = join(root, "public/media");
const name = cut === "story" ? "aselius-story" : "aselius-reel";
const forSite = !outArg;
const mp4 = outArg ? resolve(outArg) : join(mediaDir, `${name}.mp4`);
mkdirSync(dirname(mp4), { recursive: true });
// The site reel is served small; exports keep full resolution.
const vf = forSite && cut === "reel" ? ["-vf", "scale=1280:720:flags=lanczos"] : [];
const crf = opt("--crf", forSite ? (cut === "reel" ? "27" : "24") : "16");

const encoder = (file) =>
  spawn(
    "ffmpeg",
    [
      "-y", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
      ...vf,
      "-c:v", "libx264", "-preset", "slow", "-crf", crf, "-tune", "animation",
      "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
      "-r", String(FPS), "-g", String(FPS * 2), "-movflags", "+faststart",
      file,
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
const closed = (ff) => new Promise((r, j) => ff.on("close", (code) => (code === 0 ? r() : j(new Error(`ffmpeg exited ${code}`)))));

async function renderRange(from, to, file, label, renderer) {
  const ff = encoder(file);
  for (let f = from; f < to; f++) {
    const png = await renderer.frameAt(f / FPS);
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
    if ((f - from) % 150 === 0) console.log(`${label}: frame ${f - from}/${to - from}`);
  }
  ff.stdin.end();
  await closed(ff);
}

const total = Math.round(duration * FPS);
if (workers === 1) {
  await renderRange(0, total, mp4, cut, main);
} else {
  // Same encoder settings per range, so the parts join losslessly with the concat demuxer.
  const tmp = join(dirname(mp4), `.parts-${name}-${process.pid}`);
  mkdirSync(tmp, { recursive: true });
  const size = Math.ceil(total / workers);
  const parts = [];
  await Promise.all(
    Array.from({ length: workers }, async (_, w) => {
      const from = w * size;
      const to = Math.min(total, from + size);
      if (from >= to) return;
      const file = join(tmp, `part-${w}.mp4`);
      parts[w] = file;
      const renderer = w === 0 ? main : await openPage();
      await renderRange(from, to, file, `${cut} worker ${w + 1}`, renderer);
    }),
  );
  const list = join(tmp, "list.txt");
  writeFileSync(list, parts.filter(Boolean).map((p) => `file '${p}'`).join("\n") + "\n");
  await closed(spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", mp4], { stdio: "inherit" }));
  rmSync(tmp, { recursive: true, force: true });
}

if (forSite) {
  // Poster frame (WebP, small) at a moment that shows the product.
  const posterT = cut === "story" ? 82.5 : 1.4;
  writeFileSync(join(here, "out-poster.png"), await main.frameAt(posterT));
  await closed(
    spawn("ffmpeg", ["-y", "-loglevel", "error", "-i", join(here, "out-poster.png"), "-vf", "scale=1280:-2", "-quality", "80", join(mediaDir, `${name}-poster.webp`)], { stdio: "inherit" }),
  );

  if (cut === "story") {
    const captions = await main.page.evaluate(() => window.CAPTIONS);
    const ts = (s) => {
      const ms = Math.round(s * 1000);
      const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
      const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
      const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
      return `${h}:${m}:${sec}.${String(ms % 1000).padStart(3, "0")}`;
    };
    const vtt = ["WEBVTT", ""];
    captions.forEach((c, i) => vtt.push(String(i + 1), `${ts(c.start)} --> ${ts(c.end)}`, c.text, ""));
    writeFileSync(join(mediaDir, `${name}.en.vtt`), vtt.join("\n"));
    // The site reads duration and chapters from here, so the player always matches the video.
    const chapters = await main.page.evaluate(() => window.CHAPTERS);
    writeFileSync(join(here, "story-meta.json"), JSON.stringify({ duration, chapters }, null, 2) + "\n");
  }
}

await browser.close();
console.log(`wrote ${mp4}`);
