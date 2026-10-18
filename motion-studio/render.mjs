#!/usr/bin/env node
/*
 * Renders the Aselius story and reel from motion-studio/explainer.
 *
 *   npm i --no-save playwright       # once; uses your installed Chromium
 *   node motion-studio/render.mjs story   # -> public/media/aselius-story.mp4 (+ .vtt, poster)
 *   node motion-studio/render.mjs reel    # -> public/media/aselius-reel.mp4 (+ poster)
 *   node motion-studio/render.mjs story --stills 3,12,40   # PNG stills to motion-studio/out
 *
 * Needs ffmpeg on PATH and the Inter font installed. Each frame is rendered by
 * seeking renderAt(frame / fps), so output is identical on every run.
 * Set CHROMIUM_PATH to use a specific Chromium binary.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const cut = process.argv[2] === "reel" ? "reel" : "story";
const stillsArg = process.argv.indexOf("--stills");
const stills = stillsArg > 0 ? process.argv[stillsArg + 1].split(",").map(Number) : null;
const FPS = 30;

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, "explainer/index.html")).href + `?cut=${cut}`);
await page.evaluate(() => window.ready);
const duration = await page.evaluate(() => window.DURATION);
const stage = page.locator("#stage");

const frameAt = async (t) => {
  await page.evaluate((time) => window.renderAt(time), t);
  return stage.screenshot({ type: "png", animations: "disabled" });
};

if (stills) {
  const out = join(here, "out");
  mkdirSync(out, { recursive: true });
  for (const t of stills) writeFileSync(join(out, `${cut}-${t}.png`), await frameAt(t));
  console.log(`stills written to ${out}`);
  await browser.close();
  process.exit(0);
}

const mediaDir = join(root, "public/media");
mkdirSync(mediaDir, { recursive: true });
const name = cut === "story" ? "aselius-story" : "aselius-reel";
const mp4 = join(mediaDir, `${name}.mp4`);
const scale = cut === "reel" ? ["-vf", "scale=1280:720:flags=lanczos"] : [];

const ff = spawn(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    ...scale,
    "-c:v", "libx264", "-preset", "slow", "-crf", cut === "reel" ? "27" : "24",
    "-tune", "animation", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-r", String(FPS),
    mp4,
  ],
  { stdio: ["pipe", "inherit", "inherit"] },
);

const total = Math.round(duration * FPS);
for (let f = 0; f < total; f++) {
  const png = await frameAt(f / FPS);
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 150 === 0) console.log(`${cut}: frame ${f}/${total}`);
}
ff.stdin.end();
await new Promise((r, j) => ff.on("close", (code) => (code === 0 ? r() : j(new Error(`ffmpeg exited ${code}`)))));

// Poster frame (WebP, small) at a moment that shows the product.
const posterT = cut === "story" ? 56.6 : 1.4;
writeFileSync(join(here, "out-poster.png"), await frameAt(posterT));
await new Promise((r, j) =>
  spawn("ffmpeg", ["-y", "-loglevel", "error", "-i", join(here, "out-poster.png"), "-vf", "scale=1280:-2", "-quality", "80", join(mediaDir, `${name}-poster.webp`)], { stdio: "inherit" })
    .on("close", (c) => (c === 0 ? r() : j(new Error("poster failed")))),
);

if (cut === "story") {
  const captions = await page.evaluate(() => window.CAPTIONS);
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
  const chapters = await page.evaluate(() => window.CHAPTERS);
  writeFileSync(join(here, "chapters.json"), JSON.stringify(chapters, null, 2) + "\n");
}

await browser.close();
console.log(`wrote ${mp4}`);
