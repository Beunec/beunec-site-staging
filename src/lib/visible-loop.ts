/**
 * Runs `step` on requestAnimationFrame only while `el` is on screen and the tab
 * is visible. With reduced motion requested it draws one still frame instead.
 * Returns `running()` (for input handlers that should do nothing while paused)
 * and `stop()` for effect cleanup.
 */
export function startVisibleLoop(el: Element, step: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let inView = false;
  let visible = !document.hidden;
  let frame = 0;

  const tick = () => {
    step();
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    const run = inView && visible && !reduce;
    if (run && !frame) frame = requestAnimationFrame(tick);
    else if (!run && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };

  if (reduce) step();
  const io = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    sync();
  });
  io.observe(el);
  const onVisibility = () => {
    visible = !document.hidden;
    sync();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    running: () => frame !== 0,
    redraw: () => {
      if (!frame) step();
    },
    stop: () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}
