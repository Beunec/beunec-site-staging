/**
 * The silent Aselius reel. Sources sit in data-src until MotionRuntime sees the
 * video near the viewport, so the page never downloads it up front; it plays
 * muted while visible and pauses when scrolled away. MP4 (H.264) first, WebM
 * (VP9) for browsers without H.264.
 */
export function ReelVideo({ className = "" }: { className?: string }) {
  return (
    <video
      data-inview
      poster="/media/aselius-reel-poster.webp"
      className={`block aspect-video w-full ${className}`}
      muted
      loop
      playsInline
      preload="none"
      width={1280}
      height={720}
      aria-label="A silent loop of real Aselius screens: a taskspace, live engine steps, the Preview Panel, publishing, the Preview app and a Rivine Code project"
    >
      <source data-src="/media/aselius-reel.mp4" type="video/mp4" />
      <source data-src="/media/aselius-reel.webm" type="video/webm" />
    </video>
  );
}
