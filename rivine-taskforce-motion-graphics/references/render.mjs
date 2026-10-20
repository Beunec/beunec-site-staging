#!/usr/bin/env node
/*
 * render.mjs: render a window.motion film to a silent MP4 (or stills) inside the sandbox.
 *
 *   node render.mjs film/index.html --out out/film-16x9.mp4
 *   node render.mjs film/index.html --query format=vertical --out out/film-9x16.mp4
 *   node render.mjs film/index.html --stills 0,2.5,7,11.9 --outdir out/stills
 *   node render.mjs film/index.html --check                # determinism + layout report (JSON)
 *
 * Options:
 *   --query k=v&k2=v2  appended to the page URL (formats, variants)
 *   --scale 1.3333     device pixel ratio: a 1920x1080 film renders at 2560x1440
 *   --crf 16           x264 quality (16 to 18 master, 20 to 24 web)
 *   --workers N        parallel pages over contiguous frame ranges, joined losslessly
 *   --deadline 1500    seconds before the render stops with an error
 *
 * Contract: the page defines window.motion = { meta: {width, height, fps, duration, scenes, rest?},
 * ready, renderFrame(t) }. The renderer sets html[data-render], waits for `ready`, calls
 * renderFrame(k / fps) for k = 0..N-1 and screenshots #stage (PNG, lossless). The film's
 * folder is served from a local static server (ES modules, fetch() of JSON and local vendor
 * libraries all work); every request to anywhere else is blocked.
 */
import { spawn } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { basename, dirname, extname, join, normalize, resolve, sep } from "node:path";
import { chromium } from "playwright";

const argv = process.argv.slice(2);
const opt = (name, fallback = null) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : fallback;
};
const has = (name) => argv.includes(name);
const page_ = resolve(argv[0] || "index.html");
const query = opt("--query", "");
const scale = Number(opt("--scale", "1"));
const crf = opt("--crf", "18");
const workers = Math.max(1, Number(opt("--workers", "1")));
const deadline = Number(opt("--deadline", "1500")) * 1000;
const t0 = Date.now();

// Serve the film's folder (and nothing above it) on localhost.
const root = dirname(page_);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".gif": "image/gif",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".otf": "font/otf", ".wav": "audio/wav", ".mp3": "audio/mpeg",
  ".glb": "model/gltf-binary", ".gltf": "model/gltf+json", ".bin": "application/octet-stream", ".mp4": "video/mp4", ".webm": "video/webm" };
const server = createServer((req, res) => {
  const path = normalize(join(root, decodeURIComponent(new URL(req.url, "http://x").pathname)));
  if (!(path === root || path.startsWith(root + sep)) || !existsSync(path) || statSync(path).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(path).toLowerCase()] || "application/octet-stream" });
  createReadStream(path).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = `${origin}/${basename(page_)}${query ? `?${query}` : ""}`;

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  // GPU-less sandboxes render WebGL through SwiftShader: correct, slower. Keep 3D lean.
  args: ["--disable-dev-shm-usage", "--font-render-hinting=none", "--enable-unsafe-swiftshader"],
});
const problems = [];

async function openPage(viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  page.on("pageerror", (e) => problems.push(`page error: ${String(e).slice(0, 300)}`));
  page.on("console", (m) => m.type() === "error" && problems.push(m.text().slice(0, 300)));
  await page.route("**/*", (route) => {
    const u = route.request().url();
    return u.startsWith(origin) || u.startsWith("data:") || u.startsWith("blob:") ? route.continue() : route.abort();
  });
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => { document.documentElement.dataset.render = "true"; window.dispatchEvent(new Event("resize")); });
  // A module film with top-level await publishes window.motion after `load`: wait for it.
  await page.waitForFunction(() => typeof window.motion?.renderFrame === "function", null, { timeout: 20_000 })
    .catch(() => { throw new Error("window.motion.renderFrame never appeared (check the console problems)"); });
  const meta = await page.evaluate(async () => {
    await window.motion.ready;
    return window.motion.meta;
  });
  const stage = page.locator("#stage");
  const frameAt = async (t) => {
    await page.evaluate((time) => window.motion.renderFrame(time), t);
    return stage.screenshot({ type: "png", animations: "disabled" });
  };
  return { page, meta, frameAt };
}

// First page: read the film's size, then size the viewport to it.
const probe = await openPage({ width: 1920, height: 1080 });
const meta = probe.meta;
const W = meta.width, H = meta.height, FPS = meta.fps, D = meta.duration;
if (W % 2 || H % 2) throw new Error(`stage ${W}x${H}: use even dimensions`);
await probe.page.setViewportSize({ width: W, height: H });
const main = probe;

if (has("--stills")) {
  const outdir = resolve(opt("--outdir", "stills"));
  mkdirSync(outdir, { recursive: true });
  for (const t of opt("--stills").split(",").map(Number)) writeFileSync(join(outdir, `t${t.toFixed(2)}.png`), await main.frameAt(t));
  console.log(JSON.stringify({ stills: outdir, problems }));
  await browser.close();
  server.close();
  process.exit(problems.length ? 2 : 0);
}

if (has("--check")) {
  // Determinism: a frame must not depend on the frames rendered before it.
  const ta = Math.min(8, D * 0.3), tb = Math.min(22, D * 0.8);
  const a = await main.frameAt(ta);
  await main.frameAt(tb);
  const b = await main.frameAt(ta);
  const same = Buffer.compare(a, b) === 0;
  // Layout at rest moments only (meta.rest, else each scene's last 0.3 s): text that leaves
  // the stage or overflows its box. Elements marked data-qa="free" are intentional (big type
  // cropped by the camera, words flying through) and are skipped.
  const rest = meta.rest?.length ? meta.rest : (meta.scenes || []).map((s) => Math.max(s.start, s.end - 0.3));
  const layout = [];
  for (const t of rest) {
    await main.page.evaluate((time) => window.motion.renderFrame(time), t);
    const issues = await main.page.evaluate(() => {
      const S = document.querySelector("#stage").getBoundingClientRect();
      const out = [];
      for (const n of document.querySelectorAll("#stage *")) {
        if (n.closest('[data-qa="free"]')) continue;
        const own = [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
        if (!own) continue;
        const cs = getComputedStyle(n);
        if (cs.visibility === "hidden" || Number(cs.opacity) < 0.05) continue;
        let hidden = false;
        for (let p = n; p && p.id !== "stage"; p = p.parentElement) if (Number(getComputedStyle(p).opacity) < 0.05 || getComputedStyle(p).visibility === "hidden") hidden = true;
        if (hidden) continue;
        const r = n.getBoundingClientRect();
        const off = Math.max(S.left - r.left, r.right - S.right, S.top - r.top, r.bottom - S.bottom);
        if (off > 4) out.push({ kind: "off-stage", text: n.textContent.trim().slice(0, 40), px: Math.round(off) });
        if (n.scrollWidth > n.clientWidth + 2 && n.clientWidth > 0 && cs.display !== "inline") out.push({ kind: "overflow", text: n.textContent.trim().slice(0, 40) });
      }
      return out.slice(0, 20);
    });
    for (const i of issues) layout.push({ t, ...i });
  }
  console.log(JSON.stringify({ meta, deterministic: same, layout, problems }, null, 2));
  await browser.close();
  server.close();
  process.exit(!same || layout.length || problems.length ? 2 : 0);
}

const out = resolve(opt("--out", "out/film.mp4"));
mkdirSync(dirname(out), { recursive: true });
const encoder = (file) =>
  spawn("ffmpeg", [
    "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-pix_fmt", "yuv420p",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
    "-r", String(FPS), "-g", String(FPS * 2), "-movflags", "+faststart", file,
  ], { stdio: ["pipe", "inherit", "inherit"] });
const closed = (p) => new Promise((r, j) => p.on("close", (c) => (c === 0 ? r() : j(new Error(`ffmpeg exited ${c}`)))));

async function renderRange(from, to, file, r, label) {
  const ff = encoder(file);
  for (let f = from; f < to; f++) {
    if (Date.now() - t0 > deadline) throw new Error(`render passed its deadline at frame ${f}`);
    const png = await r.frameAt(f / FPS);
    if (!ff.stdin.write(png)) await new Promise((res) => ff.stdin.once("drain", res));
    if ((f - from) % 150 === 0) console.log(`${label}: ${f - from}/${to - from}`);
  }
  ff.stdin.end();
  await closed(ff);
}

const N = Math.round(D * FPS);
if (workers === 1) {
  await renderRange(0, N, out, main, "frames");
} else {
  const tmp = `${out}.parts`;
  mkdirSync(tmp, { recursive: true });
  const size = Math.ceil(N / workers);
  const parts = [];
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const from = w * size, to = Math.min(N, from + size);
    if (from >= to) return;
    const r = w === 0 ? main : await openPage({ width: W, height: H });
    parts[w] = join(tmp, `${w}.mp4`);
    await renderRange(from, to, parts[w], r, `worker ${w + 1}`);
  }));
  const list = join(tmp, "list.txt");
  writeFileSync(list, parts.filter(Boolean).map((p) => `file '${p}'`).join("\n") + "\n");
  await closed(spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", out], { stdio: "inherit" }));
  rmSync(tmp, { recursive: true, force: true });
}
await browser.close();
server.close();
if (problems.length) {
  console.error(JSON.stringify({ problems }));
  process.exit(2);
}
console.log(JSON.stringify({ out, width: W * scale, height: H * scale, fps: FPS, duration: D, frames: N, seconds: Math.round((Date.now() - t0) / 1000) }));
