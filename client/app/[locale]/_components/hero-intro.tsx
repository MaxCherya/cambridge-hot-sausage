"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const VantaNetBg = dynamic(
  () => import("./vanta-net-bg").then((m) => m.VantaNetBg),
  { ssr: false },
);

export function HeroIntro() {
  const root = useRef<HTMLDivElement>(null);
  const tHome = useTranslations("home");
  const tCommon = useTranslations("common");

  useGSAP(
    () => {
      gsap.from(".hero-item", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative isolate flex h-full min-h-dvh w-full flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center"
    >
      <VantaNetBg />
      {/* Cream wash behind the hero copy so the net stays visible at the
          edges but doesn't fight the text in the middle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(ellipse_60%_50%_at_center,rgba(245,241,232,0.92)_0%,rgba(245,241,232,0.7)_35%,rgba(245,241,232,0)_70%)]"
      />
      <span className="hero-item text-xs uppercase tracking-[0.3em] text-brand-sage">
        {tHome("hero.eyebrow")}
      </span>
      <h1 className="hero-item font-display text-4xl leading-tight text-accent sm:text-6xl">
        {tHome("hero.title")}
      </h1>
      <p className="hero-item max-w-xl text-balance text-base text-foreground/80 sm:text-lg">
        {tHome("hero.subtitle")}
      </p>
      <div className="hero-item flex flex-wrap items-center justify-center gap-3">
        <Link href="/shop">
          <Button variant="primary" size="lg">
            {tCommon("actions.visitShop")}
          </Button>
        </Link>
        <Link href="/events">
          <Button variant="outline" size="lg">
            {tCommon("actions.bookEvent")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
