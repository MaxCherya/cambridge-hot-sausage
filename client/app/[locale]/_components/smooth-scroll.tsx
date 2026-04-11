"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // Smooth, weighty inertial easing — long enough to feel premium,
      // short enough not to feel disconnected
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      smoothWheel: true,
      // Native momentum on touch — Lenis on touch fights iOS rubber-banding
      syncTouch: false,
    });

    // Keep ScrollTrigger in sync with Lenis on every scroll event
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // Drive Lenis from GSAP's ticker so all RAF-based animation is on
    // a single clock — eliminates jitter on pinned sections
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Refresh once layout settles (fonts, images, ScrollTrigger pins)
    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      window.clearTimeout(refreshTimer);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
