"use client";

import { useEffect, useRef } from "react";
import type LenisType from "lenis";
import { usePathname } from "@/i18n/navigation";

export function SmoothScroll() {
  const lenisRef = useRef<LenisType | null>(null);
  const pathname = usePathname();

  // Lazy-load lenis + ScrollTrigger so they don't ship in the layout chunk
  // and don't block hydration. gsap itself is already pulled in by the
  // navbar; this only defers the smooth-scroll-specific bytes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      const [lenisMod, gsapMod, stMod] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      const Lenis = lenisMod.default;
      const gsap = gsapMod.default;
      const { ScrollTrigger } = stMod;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        smoothWheel: true,
        syncTouch: false,
      });
      lenisRef.current = lenis;

      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);

      cleanup = () => {
        window.clearTimeout(refreshTimer);
        lenis.off("scroll", onScroll);
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
