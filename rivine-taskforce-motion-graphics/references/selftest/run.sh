#!/usr/bin/env bash
# Engine self-test (not a style example). Exercises: voice timing, char kinetic type with a
# spring, a 2.5D camera with depth layers, a wipe entrance, path drawing, a projected
# callout, a vertical query, determinism, a parallel render, and audio mastering + verification.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"; refs="$here/.."; cd "$here"
cp "$refs/scenes.mjs" film/
node "$refs/voiceover.mjs" vo.json --out film/timing.json --emphasis emph.json --film 8
node "$refs/render.mjs" film/index.html --check > out-check.json
node "$refs/render.mjs" film/index.html --stills 0.5,2.6,3.9,7.5 --outdir out/stills
node "$refs/render.mjs" film/index.html --workers 2 --out out/film-16x9.mp4
node "$refs/render.mjs" film/index.html --query format=vertical --workers 2 --out out/film-9x16.mp4
ffmpeg -loglevel error -y -f lavfi -i "sine=frequency=220:duration=1.2" -af "adelay=400,apad=whole_dur=6,volume=0.5" -t 6 out/voice.wav
ffmpeg -loglevel error -y -f lavfi -i "sine=frequency=110:duration=10" -af volume=0.3 out/music.mp3
node "$refs/export-social.mjs" --render 16x9=out/film-16x9.mp4 --render 9x16=out/film-9x16.mp4 \
  --voice out/voice.wav --music out/music.mp3 --duration 8 --name selftest --outdir out/final
echo "self-test passed"
