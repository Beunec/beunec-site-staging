import type { Shot } from "@/lib/aselius-media";
import { ShotGallery } from "@/components/media/ShotGallery";

/** "In the product" strip on a docs page: the real screens the page describes. */
export function DocShots({ shots }: { shots: Shot[] }) {
  if (shots.length === 0) return null;
  return (
    <section aria-label="Screenshots from Aselius" className="my-12 rounded-2xl border border-border bg-container/60 p-5 sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-slate">In the product</p>
      <p className="mt-2 mb-6 text-sm leading-relaxed text-muted-foreground">
        Real screenshots of what this page describes. Open any of them full size.
      </p>
      <ShotGallery shots={shots} columns={shots.length === 1 ? "" : "sm:grid-cols-2"} limit={6} />
    </section>
  );
}
