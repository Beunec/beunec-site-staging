#!/usr/bin/env python3
"""Builds audio/voice-timeline.wav (each narration line from audio/voice-source.mp3 placed at
its start in film/timing.json) and audio/music-bed.wav (the Aselius story bed, from 6.04 s,
155 s long, so it resolves with the film). Run from this folder; needs ffmpeg."""
import json, subprocess, os

tm = json.load(open("film/timing.json"))
L, D = tm["lines"], tm["duration"]
os.makedirs("audio/lines", exist_ok=True)
ins, graph = [], []
for i, l in enumerate(L):
    a, b = l["src"]
    a0, e = max(0, a - 0.12), b + 0.2
    dur = e - a0
    f = f"audio/lines/{i:02d}.wav"
    # atrim + asetpts resets timestamps so the fades are relative to the clip
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "audio/voice-source.mp3", "-af",
                    f"atrim={a0:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={dur - 0.12:.3f}:d=0.12",
                    "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", f], check=True)
    ins += ["-i", f]
    delay = int(round((l["start"] - (a - a0)) * 1000))
    graph.append(f"[{i}:a]adelay={delay}|{delay}[v{i}]")
graph.append("".join(f"[v{i}]" for i in range(len(L))) + f"amix=inputs={len(L)}:normalize=0,apad=whole_dur={D}[out]")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *ins, "-filter_complex", ";".join(graph), "-map", "[out]",
                "-t", str(D), "-c:a", "pcm_s16le", "audio/voice-timeline.wav"], check=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "6.04", "-i", "../motion-studio/audio/story-music.mp3",
                "-t", str(D), "-c:a", "pcm_s16le", "audio/music-bed.wav"], check=True)
print("audio/voice-timeline.wav and audio/music-bed.wav written")
