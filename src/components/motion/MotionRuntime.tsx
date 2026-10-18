"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One observer pair for the whole site, instead of a motion component per card.
 *
 * Reveals: any element with `data-reveal` is visible in the server HTML. Once
 * this runs, only elements that start below the fold are hidden (`rv-pending`)
 * and they ease in when they reach the viewport (`rv-in`). Elements already on
 * screen are never touched, so there is no flash, and with JavaScript off or
 * reduced motion requested nothing is ever hidden.
 *
 * In-view video: `<video data-inview>` loads its `data-src` only when it first
 * comes near the viewport, plays muted while visible and pauses when it leaves,
 * so an off-screen loop never costs CPU or bandwidth.
 */
export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window)) return;

    const revealIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.remove("rv-pending");
          el.classList.add("rv-in");
          revealIO.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    const videoIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            if (video.dataset.src && !video.getAttribute("src")) {
              video.src = video.dataset.src;
              video.load();
            }
            if (!reduce && video.dataset.inview !== "manual") {
              void video.play().catch(() => {
                /* autoplay refused: the poster and controls stay */
              });
            }
          } else if (!video.paused) {
            video.pause();
          }
        }
      },
      { rootMargin: "200px 0px", threshold: 0 },
    );

    const fold = () => window.innerHeight * 0.92;

    const register = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-rv])").forEach((el) => {
        el.dataset.rv = "1";
        if (reduce) return;
        if (el.getBoundingClientRect().top > fold()) {
          el.classList.add("rv-pending");
          revealIO.observe(el);
        }
      });
      root.querySelectorAll<HTMLVideoElement>("video[data-inview]:not([data-rv])").forEach((video) => {
        video.dataset.rv = "1";
        if (reduce) video.controls = true;
        videoIO.observe(video);
      });
    };

    register(document);

    // Sections that render after data arrives (Resources, docs) register too.
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n.nodeType !== Node.ELEMENT_NODE) return;
          const el = n as HTMLElement;
          if (el.matches?.("[data-reveal], video[data-inview]")) register(el.parentElement ?? document);
          else if (el.querySelector?.("[data-reveal], video[data-inview]")) register(el);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      revealIO.disconnect();
      videoIO.disconnect();
      // A client navigation away must never leave anything stuck hidden.
      document.querySelectorAll<HTMLElement>("[data-rv]").forEach((el) => {
        el.classList.remove("rv-pending");
        delete el.dataset.rv;
      });
    };
  }, [pathname]);

  return null;
}
