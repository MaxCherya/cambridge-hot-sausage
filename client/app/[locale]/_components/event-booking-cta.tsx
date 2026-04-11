"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";

type FeatureKey = "schedule" | "service" | "venue";

const FEATURES: { key: FeatureKey; icon: ReactNode }[] = [
  { key: "schedule", icon: <Calendar className="h-7 w-7" strokeWidth={1.6} /> },
  { key: "service", icon: <Clock className="h-7 w-7" strokeWidth={1.6} /> },
  { key: "venue", icon: <MapPin className="h-7 w-7" strokeWidth={1.6} /> },
];

export function EventBookingCta() {
  const t = useTranslations("home.eventBooking");

  return (
    <section
      id="event-booking"
      className="relative z-10 overflow-hidden bg-brand-maroon py-24 text-brand-cream sm:py-32"
    >
      {/* Decorative backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/2 h-150 w-150 -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[120px]" />
        <div className="absolute -right-32 top-0 h-105 w-105 rounded-full bg-brand-sage/15 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <div>
          <span
            data-reveal
            className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold sm:text-xs"
          >
            {t("eyebrow")}
          </span>
          <h2
            data-reveal
            style={{ animationDelay: "100ms" }}
            className="mt-3 font-display text-4xl leading-[1.1] sm:mt-4 sm:text-5xl lg:text-6xl"
          >
            {t("title")}
          </h2>
          <p
            data-reveal
            style={{ animationDelay: "200ms" }}
            className="mx-auto mt-5 max-w-2xl text-balance text-base text-brand-cream/75 sm:mt-6 sm:text-lg"
          >
            {t("subtitle")}
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-5 lg:gap-7">
          {FEATURES.map((feature, i) => (
            <li
              key={feature.key}
              data-reveal
              style={{ animationDelay: `${300 + i * 120}ms` }}
              className="group relative overflow-hidden rounded-2xl border border-brand-gold/25 bg-brand-cream/3 p-6 text-left backdrop-blur-sm transition-all duration-500 ease-out hover:-translate-y-2 hover:border-brand-gold hover:bg-brand-cream/6 sm:p-7"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-brand-gold/0 via-brand-gold/0 to-brand-gold/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30 transition-all duration-500 group-hover:bg-brand-gold/25 group-hover:ring-brand-gold/60">
                {feature.icon}
              </div>
              <h3 className="mt-5 font-display text-xl leading-snug text-brand-cream sm:text-2xl">
                {t(`features.${feature.key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-cream/65">
                {t(`features.${feature.key}.description`)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-12 sm:mt-16">
          <div data-reveal style={{ animationDelay: "300ms" }}>
            <Link
              href="/events"
              className="group inline-flex items-center gap-3 rounded-full bg-brand-gold px-8 py-4 text-sm font-semibold uppercase tracking-wider text-brand-maroon shadow-[0_20px_45px_-15px_rgba(236,214,145,0.55)] transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-[0_30px_55px_-15px_rgba(236,214,145,0.75)] active:scale-100 sm:text-base"
            >
              <span>{t("ctaLabel")}</span>
              <span
                aria-hidden
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-maroon text-brand-gold transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-12"
              >
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.6} />
              </span>
            </Link>
          </div>
          <p
            data-reveal
            style={{ animationDelay: "400ms" }}
            className="mt-5 text-xs text-brand-cream/55"
          >
            {t("ctaNote")}
          </p>
        </div>
      </div>
    </section>
  );
}
