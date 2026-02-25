"use client";

import React, { useEffect, useRef } from "react";

/**
 * CursorParticles
 * - Renders a ring of small particles that orbit the device cursor.
 * - Only runs on pointer: fine devices (desktop/trackpad) to avoid mobile perf/UX issues.
 * - Light-weight, uses requestAnimationFrame and direct DOM transforms for performance.
 *
 * Assumptions:
 * - Using 6 brand colors inferred from tailwind config: #00477d, #0066b3, #003355, #f8fafc, #0f172a
 *   and one added accent: #00A6FF. If you want different hex values, tell me and I'll update.
 */

const CursorParticles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particleRefs = useRef<HTMLDivElement[]>([]);
  const rafRef = useRef<number | null>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const state = useRef({ angle: 0 });

  const COLORS = [
    "#00477d",
    "#0066b3",
    "#003355",
    "#f8fafc",
    "#0f172a",
    "#00A6FF",
  ];

  const COUNT = 14; // between 10-20
  const RADIUS = 18; // base radius around cursor
  const SIZE = 8; // particle size in px

  useEffect(() => {
    // Only run on devices with a fine pointer
    if (typeof window === "undefined") return;
    const prefersFine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    if (!prefersFine) return;

    const handleMove = (e: PointerEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (containerRef.current) containerRef.current.style.opacity = "1";
    };

    const handleLeave = () => {
      mouse.current.x = -9999;
      mouse.current.y = -9999;
      if (containerRef.current) containerRef.current.style.opacity = "0";
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);
    window.addEventListener("blur", handleLeave);

    // Animation loop
    const step = () => {
      state.current.angle += 0.03;
      const base = state.current.angle;
      const nowX = mouse.current.x;
      const nowY = mouse.current.y;

      for (let i = 0; i < COUNT; i++) {
        const el = particleRefs.current[i];
        if (!el) continue;
        const t = (i / COUNT) * Math.PI * 2;
        // Give slight orbit radius variation per particle
        const r = RADIUS + (i % 3) * 4 + Math.sin(base + i) * 2;
        const angle = base + t + (i * 0.12);
        const x = nowX + Math.cos(angle) * r - SIZE / 2;
        const y = nowY + Math.sin(angle) * r - SIZE / 2;

        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${0.9 + Math.sin(base + i) * 0.15})`;
        el.style.opacity = nowX < 0 ? "0" : "1";
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("blur", handleLeave);
    };
  }, []);

  // render particles
  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        zIndex: 9999,
        opacity: 0,
        transition: "opacity 200ms linear",
      }}
    >
      {Array.from({ length: COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (!el) return;
            particleRefs.current[i] = el;
          }}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: SIZE,
            height: SIZE,
            borderRadius: "999px",
            background: COLORS[i % COLORS.length],
            boxShadow: `0 4px 14px ${COLORS[i % COLORS.length]}33`,
            transform: `translate3d(-9999px,-9999px,0)`,
            transition: "opacity 120ms linear, transform 120ms linear",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
};

export default CursorParticles;
