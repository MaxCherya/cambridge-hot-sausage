"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";

import cert28 from "@/img/certifications/cert-28.svg";
import cert29 from "@/img/certifications/cert-29.svg";
import cert31 from "@/img/certifications/cert-31.svg";
import cert32 from "@/img/certifications/cert-32.svg";
import cert33 from "@/img/certifications/cert-33.svg";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CERTIFICATIONS: { id: string; src: StaticImageData; alt: string }[] = [
  { id: "cert-29", src: cert29, alt: "Food safety certification" },
  { id: "cert-28", src: cert28, alt: "Hygiene rating" },
  { id: "cert-31", src: cert31, alt: "Quality assurance" },
  { id: "cert-33", src: cert33, alt: "Trade accreditation" },
  { id: "cert-32", src: cert32, alt: "Industry membership" },
];

// Duplicate so the loop is seamless
const TRACK_ITEMS = [...CERTIFICATIONS, ...CERTIFICATIONS];

export function Certifications() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      if (!root.current) return;

      // Heading: scroll-linked scrub reveal
      gsap.from(root.current.querySelectorAll(".cert-heading > *"), {
        scrollTrigger: {
          trigger: root.current,
          start: "top 85%",
          end: "top 45%",
          scrub: 0.6,
        },
        y: 50,
        opacity: 0,
        stagger: 0.08,
      });

      // Marquee: continuous linear loop
      const track = trackRef.current;
      if (!track) return;

      // We rendered the list twice — animate by half the rendered width
      // so the loop joins seamlessly back to start.
      const setWidth = track.scrollWidth / 2;
      const speed = 60; // px / second — readable on mobile
      const duration = setWidth / speed;

      tweenRef.current = gsap.to(track, {
        x: -setWidth,
        duration,
        ease: "none",
        repeat: -1,
      });

      // Recompute on resize so card width changes don't break the loop
      const onResize = () => {
        if (!trackRef.current || !tweenRef.current) return;
        const newWidth = trackRef.current.scrollWidth / 2;
        tweenRef.current.kill();
        gsap.set(trackRef.current, { x: 0 });
        tweenRef.current = gsap.to(trackRef.current, {
          x: -newWidth,
          duration: newWidth / speed,
          ease: "none",
          repeat: -1,
        });
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { scope: root },
  );

  const pause = () => tweenRef.current?.pause();
  const resume = () => tweenRef.current?.resume();

  const t = useTranslations("home.certifications");

  return (
    <section
      ref={root}
      id="certifications"
      className="relative z-10 overflow-hidden bg-brand-cream py-24 shadow-[0_-30px_60px_-40px_rgba(43,43,43,0.3)] sm:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(90,31,31,0.06),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="cert-heading mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-sage">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 font-display text-4xl leading-tight text-brand-maroon sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-balance text-base text-brand-ink/70 sm:text-lg">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Marquee — full-bleed so logos slide off the page edges */}
      <div
        className="relative mt-16 overflow-hidden"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        onTouchCancel={resume}
      >
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-brand-cream to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-brand-cream to-transparent sm:w-32" />

        <ul
          ref={trackRef}
          className="flex w-max items-stretch gap-4 will-change-transform sm:gap-6"
          aria-label={t("title")}
        >
          {TRACK_ITEMS.map((cert, i) => (
            <li
              key={`${cert.id}-${i}`}
              className="w-36 shrink-0 sm:w-44"
              aria-hidden={i >= CERTIFICATIONS.length}
            >
              <div className="group flex h-32 w-full items-center justify-center rounded-2xl bg-white p-5 shadow-[0_10px_30px_-15px_rgba(90,31,31,0.18)] ring-1 ring-brand-maroon/5 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-20px_rgba(90,31,31,0.3)] hover:ring-brand-maroon/15 sm:h-36">
                <Image
                  src={cert.src}
                  alt={i < CERTIFICATIONS.length ? cert.alt : ""}
                  className="h-full w-full object-contain opacity-80 grayscale transition-all duration-500 ease-out group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
