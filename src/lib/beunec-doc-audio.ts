export type DocAudioSlug =
  | "principles"
  | "research-philosophy"
  | "agentic-infrastructure"
  | "rivine-experimental-project";

/**
 * Narration files are served as static assets from `public/audio/<slug>.mp3`.
 * Source masters live in Dropbox; the mp3s are committed so the site stays
 * 100% static (no proxy/worker) and Dropbox's `application/json` + nosniff
 * content-type can't break <audio> playback.
 */
export function getDocAudioSrc(slug: DocAudioSlug): string {
  return `/audio/${slug}.mp3`;
}
