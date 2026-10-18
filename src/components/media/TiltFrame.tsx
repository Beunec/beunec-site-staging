"use client";

import { useRef, type ReactNode } from "react";

type TiltFrameProps = {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees. */
  max?: number;
};

/**
 * Tilts its content toward the pointer with a soft light sheen, like turning a
 * printed screenshot in your hand. One rAF write per frame through CSS custom
 * properties, transform only. Mouse and pen only: touch scrolls normally, and
 * reduced motion leaves the frame flat.
 */
export function TiltFrame({ children, className = "", max = 7 }: TiltFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const set = (x: number, y: number, on: boolean) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.style.setProperty("--rx", `${(-y * max).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * max).toFixed(2)}deg`);
      el.style.setProperty("--gx", `${((x + 1) * 50).toFixed(1)}%`);
      el.style.setProperty("--gy", `${((y + 1) * 50).toFixed(1)}%`);
      el.dataset.tilt = on ? "on" : "off";
    });
  };

  return (
    <div
      ref={ref}
      data-tilt="off"
      className={`tilt-frame ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1, true);
      }}
      onPointerLeave={() => set(0, 0, false)}
    >
      <div className="tilt-frame__inner">
        {children}
        <span aria-hidden="true" className="tilt-frame__sheen" />
      </div>
    </div>
  );
}
