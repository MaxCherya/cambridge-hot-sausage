"use client";

import { useEffect } from "react";

/**
 * Global reveal-on-scroll provider.
 *
 * Watches every element with `[data-reveal]` and adds `data-revealed`
 * when it intersects the viewport. CSS in globals.css handles the
 * transition between the two states.
 *
 * Variants:
 *   data-reveal             → fade + translateY(40px → 0)  (default)
 *   data-reveal="up"        → same as default
 *   data-reveal="left"      → fade + translateX(40px → 0)
 *   data-reveal="right"     → fade + translateX(-40px → 0)
 *   data-reveal="scale"     → fade + scale(0.92 → 1)
 *
 * Stagger: set `style={{ transitionDelay: "120ms" }}` on the element.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reduced motion: reveal everything immediately, never observe
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])")
        .forEach((el) => el.setAttribute("data-revealed", ""));
      return;
    }

    const observed = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "");
            observer.unobserve(entry.target);
          }
        }
      },
      {
        // Trigger when ~12% of the element is visible — reveals a touch
        // before the user actually parks their eyes on it.
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.01,
      },
    );

    const scan = () => {
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])")
        .forEach((el) => {
          if (observed.has(el)) return;
          observed.add(el);
          observer.observe(el);
        });
    };

    scan();

    // Catch elements added later (client navigations, dynamic content)
    const mutation = new MutationObserver(() => scan());
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
