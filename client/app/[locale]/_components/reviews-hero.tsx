"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Star } from "lucide-react";
import type { ReviewSummary } from "@/types/review";

interface ReviewsHeroProps {
  summary: ReviewSummary;
}

function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, rating - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star
              className="absolute inset-0 text-brand-gold/25"
              size={size}
              strokeWidth={1.4}
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                className="text-brand-gold"
                size={size}
                strokeWidth={1.4}
                fill="currentColor"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function ReviewsHero({ summary }: ReviewsHeroProps) {
  const t = useTranslations("reviews");
  const sectionRef = useRef<HTMLElement>(null);
  const ratingRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ratingRef.current || !countRef.current || !barsRef.current) return;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.3,
      });

      // Animate the big rating number counting up
      tl.fromTo(
        ratingRef.current,
        { textContent: "0.0" },
        {
          duration: 1.4,
          ease: "power2.out",
          onUpdate() {
            const progress = tl.progress();
            const current = (summary.averageRating * Math.min(progress * 2.5, 1)).toFixed(1);
            if (ratingRef.current) ratingRef.current.textContent = current;
          },
        },
        0,
      );

      // Animate total count
      tl.fromTo(
        countRef.current,
        { textContent: "0" },
        {
          duration: 1.2,
          ease: "power2.out",
          onUpdate() {
            const progress = tl.progress();
            const current = Math.round(summary.totalRatings * Math.min(progress * 2, 1));
            if (countRef.current) countRef.current.textContent = String(current);
          },
        },
        0,
      );

      // Animate distribution bars
      const bars = barsRef.current.querySelectorAll<HTMLElement>("[data-bar]");
      const maxCount = Math.max(...summary.distribution);

      bars.forEach((bar, i) => {
        const starIndex = 4 - i; // bars render 5-star first
        const percentage = maxCount > 0 ? (summary.distribution[starIndex] / maxCount) * 100 : 0;

        gsap.fromTo(
          bar,
          { width: "0%" },
          {
            width: `${percentage}%`,
            duration: 1,
            ease: "power3.out",
            delay: 0.5 + i * 0.08,
          },
        );
      });
    },
    { scope: sectionRef },
  );

  const maxCount = Math.max(...summary.distribution);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-brand-maroon pb-20 pt-32 text-brand-cream sm:pb-28 sm:pt-40"
    >
      {/* Decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-gold/8 blur-[140px]" />
        <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-sage/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center">
          <span
            data-reveal
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold sm:text-xs"
          >
            {t("hero.eyebrow")}
          </span>
          <h1
            data-reveal
            style={{ animationDelay: "100ms" }}
            className="mt-3 font-display text-4xl leading-[1.1] sm:mt-4 sm:text-5xl lg:text-6xl"
          >
            {t("hero.title")}
          </h1>
          <p
            data-reveal
            style={{ animationDelay: "200ms" }}
            className="mx-auto mt-5 max-w-2xl text-balance text-base text-brand-cream/70 sm:mt-6 sm:text-lg"
          >
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Stats card */}
        <div
          data-reveal
          style={{ animationDelay: "350ms" }}
          className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-cream/[0.04] p-6 backdrop-blur-sm sm:mt-16 sm:p-8"
        >
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:gap-10">
            {/* Big rating */}
            <div className="flex flex-col items-center gap-2 sm:min-w-[140px]">
              <span
                ref={ratingRef}
                className="font-display text-6xl leading-none text-brand-gold sm:text-7xl"
              >
                {summary.averageRating.toFixed(1)}
              </span>
              <StarRating rating={summary.averageRating} size={22} />
              <span className="mt-1 text-xs text-brand-cream/50">
                {t("stats.outOf")}
              </span>
            </div>

            {/* Divider */}
            <div className="hidden h-24 w-px bg-brand-gold/15 sm:block" />
            <div className="h-px w-32 bg-brand-gold/15 sm:hidden" />

            {/* Distribution bars */}
            <div ref={barsRef} className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star, i) => {
                const count = summary.distribution[star - 1];
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="flex w-12 items-center justify-end gap-1 text-xs text-brand-cream/65">
                      {star}
                      <Star size={11} fill="currentColor" className="text-brand-gold/70" />
                    </span>
                    <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-brand-cream/[0.06]">
                      <div
                        data-bar
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-gold/80 to-brand-gold"
                        style={{
                          width: maxCount > 0 ? `${(count / maxCount) * 100}%` : "0%",
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs tabular-nums text-brand-cream/50">
                      {count}
                    </span>
                  </div>
                );
              })}
              <p className="pt-1 text-right text-xs text-brand-cream/45">
                <span ref={countRef}>{summary.totalRatings}</span> {t("stats.totalReviews").toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
