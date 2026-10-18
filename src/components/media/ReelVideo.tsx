"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * The narrated Aselius reel. Sources sit in data-src until MotionRuntime sees the
 * video near the viewport, so the page never downloads it up front; it plays
 * muted while visible and pauses when scrolled away, and the viewer can turn the
 * voiceover and music on. MP4 (H.264) first, WebM (VP9) for browsers without H.264.
 */
export function ReelVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    const on = !sound;
    v.muted = !on;
    if (on) {
      v.currentTime = 0;
      void v.play().catch(() => {});
    }
    setSound(on);
  };

  return (
    <div className="relative">
      <video
        ref={ref}
        data-inview
        poster="/media/aselius-reel-poster.webp"
        className={`block aspect-video w-full ${className}`}
        muted
        loop
        playsInline
        preload="none"
        width={1280}
        height={720}
        aria-label="A narrated loop of real Aselius screens: a taskspace, live engine steps, the Preview Panel, publishing, the Preview app and a Rivine Code project"
      >
        <source data-src="/media/aselius-reel.mp4" type="video/mp4" />
        <source data-src="/media/aselius-reel.webm" type="video/webm" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={sound}
        aria-label={sound ? "Mute the reel" : "Play the reel with sound"}
        className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-[#111111]/75 px-3 sm:px-4 text-sm font-medium text-[#f4f4f0] backdrop-blur transition-colors hover:bg-[#111111]/90"
      >
        {sound ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
        <span className="hidden sm:inline">{sound ? "Sound on" : "Sound off"}</span>
      </button>
    </div>
  );
}
