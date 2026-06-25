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
            const el = entry.target as HTMLElement;
            el.setAttribute("data-revealed", "");

            // After the CSS animation finishes, strip both data
            // attributes so the element falls back to its normal
            // class-based styles — hover transitions can then work
            // without the animation's fill-mode blocking them.
            el.addEventListener(
              "animationend",
              () => {
                el.style.opacity = "1";
                el.style.transform = "none";
                el.removeAttribute("data-reveal");
                el.removeAttribute("data-revealed");
              },
              { once: true },
            );

            observer.unobserve(el);
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

    const scanRoot = (root: ParentNode) => {
      root
        .querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])")
        .forEach((el) => {
          if (observed.has(el)) return;
          observed.add(el);
          observer.observe(el);
        });
    };

    scanRoot(document);

    // Catch elements added later (client navigations, dynamic content).
    // Scope the work to the actually-added subtrees instead of re-scanning
    // the whole document on every mutation — O(added) instead of O(DOM).
    const mutation = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node as HTMLElement;
          if (el.matches?.("[data-reveal]:not([data-revealed])")) {
            if (!observed.has(el)) {
              observed.add(el);
              observer.observe(el);
            }
          }
          scanRoot(el);
        });
      }
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
