"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], [role='menuitem'], [role='menuitemradio'], [role='menuitemcheckbox'], [role='option'], [role='tab'], summary, label, select, [data-cursor='hover']";
const TEXT_SELECTOR = "input, textarea, [contenteditable='true']";

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Bail on touch / coarse pointers — there's no cursor to replace
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    const ringSpeed = 0.18; // 0..1 — lower = laggier

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Dot follows cursor instantly
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    };

    const onDown = () => ring.classList.add("cursor-down");
    const onUp = () => ring.classList.remove("cursor-down");

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(TEXT_SELECTOR)) {
        ring.classList.add("cursor-hidden");
        dot.classList.add("cursor-hidden");
        return;
      }
      ring.classList.remove("cursor-hidden");
      dot.classList.remove("cursor-hidden");
      if (target.closest(INTERACTIVE_SELECTOR)) {
        ring.classList.add("cursor-hover");
      } else {
        ring.classList.remove("cursor-hover");
      }
    };

    const onLeave = () => {
      ring.classList.add("cursor-hidden");
      dot.classList.add("cursor-hidden");
    };
    const onEnter = () => {
      ring.classList.remove("cursor-hidden");
      dot.classList.remove("cursor-hidden");
    };

    let rafId = 0;
    const tick = () => {
      ringX += (mouseX - ringX) * ringSpeed;
      ringY += (mouseY - ringY) * ringSpeed;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    document.documentElement.classList.add("custom-cursor-on");

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.classList.remove("custom-cursor-on");
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="custom-cursor-ring"
        style={{ transform: "translate3d(-100px,-100px,0)" }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="custom-cursor-dot"
        style={{ transform: "translate3d(-100px,-100px,0)" }}
      />
    </>
  );
}
