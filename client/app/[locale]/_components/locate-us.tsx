"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { MapPin, Navigation } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LocateUsMap = dynamic(() => import("./locate-us-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-cream/60 text-sm text-brand-ink/50">
      Loading map…
    </div>
  ),
});

const LAT = 52.206090944020346;
const LNG = 0.12063357052785396;
const NAME = "Cambridge Hot Sausage";
const ADDRESS = "2 Market Passage, Cambridge CB2 3PA";

// Universal directions URL — opens Google Maps in browser, or the native
// Google/Apple Maps app on mobile devices that have it installed.
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;

export function LocateUs() {
  const root = useRef<HTMLElement>(null);
  const t = useTranslations("home.locateUs");

  useGSAP(
    () => {
      if (!root.current) return;

      const headingEls = root.current.querySelectorAll(".locate-heading > *");
      const cards = root.current.querySelectorAll(".locate-card");

      gsap.set(headingEls, { opacity: 0, y: 32 });
      gsap.set(cards, { opacity: 0, y: 40 });

      gsap.to(headingEls, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: root.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: root.current.querySelector(".locate-grid"),
          start: "top bottom",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="locate-us"
      className="relative z-10 overflow-hidden bg-brand-cream py-24 sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(79,107,88,0.07),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="locate-heading mx-auto max-w-2xl text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 font-display text-4xl leading-tight text-brand-maroon sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-brand-ink/70 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="locate-grid mt-12 grid gap-6 sm:mt-16 lg:grid-cols-5 lg:gap-8">
          {/* Map card */}
          <div className="locate-card relative h-[360px] overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-25px_rgba(43,43,43,0.35)] ring-1 ring-brand-maroon/10 sm:h-[480px] lg:col-span-3">
            <LocateUsMap />
          </div>

          {/* Address + directions card */}
          <div className="locate-card flex flex-col justify-between gap-8 rounded-3xl bg-white p-8 shadow-[0_30px_60px_-25px_rgba(43,43,43,0.35)] ring-1 ring-brand-maroon/10 sm:p-10 lg:col-span-2">
            <div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-maroon/10 text-brand-maroon ring-1 ring-brand-maroon/15">
                <MapPin className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 font-display text-2xl leading-snug text-brand-maroon sm:text-3xl">
                {NAME}
              </h3>
              <span className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-sage">
                {t("addressLabel")}
              </span>
              <address className="mt-2 text-base not-italic leading-relaxed text-brand-ink/80">
                {ADDRESS}
              </address>
            </div>

            <div>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-maroon px-6 py-4 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_15px_35px_-12px_rgba(90,31,31,0.5)] transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-brand-ink hover:shadow-[0_20px_45px_-12px_rgba(90,31,31,0.65)] active:scale-100 sm:text-base"
              >
                <Navigation
                  className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12"
                  strokeWidth={2.2}
                />
                <span>{t("directions")}</span>
              </a>
              <p className="mt-3 text-center text-xs text-brand-ink/50">
                {t("directionsHint")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
