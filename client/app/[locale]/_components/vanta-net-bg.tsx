"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function VantaNetBg() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: { destroy: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const NET = (await import("vanta/dist/vanta.net.min")).default;
      if (cancelled || !ref.current) return;

      effect = NET({
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        backgroundColor: 0xf5f1e8, // brand cream
        color: 0x5a1f1f, // brand maroon
        points: 12,
        maxDistance: 22,
        spacing: 16,
      });
    })();

    return () => {
      cancelled = true;
      effect?.destroy();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
    />
  );
}
