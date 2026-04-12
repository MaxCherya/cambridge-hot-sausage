"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { MapPin, Clock, Landmark, Navigation } from "lucide-react";

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
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;

type NearbyKey = "arcade" | "market" | "kings" | "station";
const NEARBY_KEYS: NearbyKey[] = ["arcade", "market", "kings", "station"];

export function LocationsHero() {
  const t = useTranslations("locations");

  return (
    <>
      {/* ─── Hero: Map + Header ─────────────────────────────────── */}
      <section className="relative bg-brand-maroon pt-28 pb-24 text-brand-cream sm:pt-36 sm:pb-32">
        {/* Decorative backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-gold/8 blur-[140px]" />
          <div className="absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-brand-sage/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          {/* Text */}
          <div className="mx-auto max-w-2xl text-center">
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
              className="mx-auto mt-5 max-w-xl text-balance text-base text-brand-cream/70 sm:mt-6 sm:text-lg"
            >
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Map card */}
          <div
            data-reveal="scale"
            style={{ animationDelay: "350ms" }}
            className="mx-auto mt-12 max-w-5xl sm:mt-16"
          >
            <div className="overflow-hidden rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)] ring-1 ring-white/10">
              <div className="h-[340px] sm:h-[440px] lg:h-[500px]">
                <LocateUsMap />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Highlight stats ───────────────────────────────────── */}
      <section className="relative bg-brand-cream py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[100px]" />
          <div className="absolute -left-32 bottom-0 h-[300px] w-[300px] rounded-full bg-brand-sage/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h2
            data-reveal
            className="font-display text-3xl leading-tight text-brand-maroon sm:text-4xl lg:text-5xl"
          >
            {t("highlight.title")}
          </h2>
          <p
            data-reveal
            style={{ animationDelay: "100ms" }}
            className="mx-auto mt-4 max-w-xl text-balance text-base text-brand-ink/60 sm:text-lg"
          >
            {t("highlight.subtitle")}
          </p>

          <div
            data-reveal
            style={{ animationDelay: "200ms" }}
            className="mx-auto mt-12 flex max-w-2xl items-center justify-center gap-8 sm:mt-16 sm:gap-16"
          >
            {(["years", "dogs", "days"] as const).map((key, i) => (
              <div key={key} className="text-center">
                <span className="font-display text-4xl text-brand-maroon sm:text-5xl lg:text-6xl">
                  {t(`highlight.stats.${key}.value`)}
                </span>
                <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-ink/50 sm:text-xs">
                  {t(`highlight.stats.${key}.label`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Info cards ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-maroon py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-[400px] w-[400px] rounded-full bg-brand-gold/8 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {/* Address — data-reveal on wrapper, hover on inner card */}
            <div data-reveal style={{ animationDelay: "100ms" }}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-gold/25 bg-brand-cream/[0.04] p-6 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_12px_40px_-12px_rgba(236,214,145,0.2)] sm:p-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-gold/0 via-brand-gold/0 to-brand-gold/[0.06] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30 transition-all duration-500 group-hover:bg-brand-gold/25 group-hover:ring-brand-gold/60">
                  <MapPin className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <span className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold">
                  {t("info.address.label")}
                </span>
                <h3 className="mt-2 font-display text-xl text-brand-cream">
                  {t("info.address.name")}
                </h3>
                <address className="mt-1 text-sm not-italic leading-relaxed text-brand-cream/60">
                  {t("info.address.line")}
                </address>
              </div>
            </div>

            {/* Hours */}
            <div data-reveal style={{ animationDelay: "200ms" }}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-gold/25 bg-brand-cream/[0.04] p-6 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_12px_40px_-12px_rgba(236,214,145,0.2)] sm:p-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-gold/0 via-brand-gold/0 to-brand-gold/[0.06] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30 transition-all duration-500 group-hover:bg-brand-gold/25 group-hover:ring-brand-gold/60">
                  <Clock className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <span className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold">
                  {t("info.hours.label")}
                </span>
                <dl className="mt-3 space-y-1.5 text-sm">
                  {(["weekdays", "saturday", "sunday"] as const).map((day) => (
                    <div key={day} className="flex items-center justify-between gap-4">
                      <dt className="text-brand-cream/60">{t(`info.hours.${day}`)}</dt>
                      <dd className="font-medium tabular-nums text-brand-cream">
                        {t(`info.hours.${day}Times`)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Nearby landmarks */}
            <div data-reveal style={{ animationDelay: "300ms" }} className="sm:col-span-2 lg:col-span-1">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-gold/25 bg-brand-cream/[0.04] p-6 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-brand-gold/50 hover:shadow-[0_12px_40px_-12px_rgba(236,214,145,0.2)] sm:p-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-gold/0 via-brand-gold/0 to-brand-gold/[0.06] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30 transition-all duration-500 group-hover:bg-brand-gold/25 group-hover:ring-brand-gold/60">
                  <Landmark className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <span className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold">
                  {t("info.nearby.label")}
                </span>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {NEARBY_KEYS.map((key) => (
                    <li key={key} className="flex items-center gap-2 text-brand-cream/60">
                      <span className="h-1 w-1 flex-shrink-0 rounded-full bg-brand-gold" />
                      {t(`info.nearby.items.${key}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Directions ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-cream py-20 text-brand-ink sm:py-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-brand-gold/10 blur-[100px]" />
          <div className="absolute -left-32 bottom-0 h-[300px] w-[300px] rounded-full bg-brand-sage/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6">
          <div className="text-center">
            <span
              data-reveal
              className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs"
            >
              {t("directions.eyebrow")}
            </span>
            <h2
              data-reveal
              style={{ animationDelay: "100ms" }}
              className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl lg:text-5xl"
            >
              {t("directions.title")}
            </h2>
            <p
              data-reveal
              style={{ animationDelay: "200ms" }}
              className="mx-auto mt-4 max-w-xl text-balance text-base text-brand-ink/60 sm:text-lg"
            >
              {t("directions.subtitle")}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-3 sm:gap-5 lg:gap-6">
            {(["walking", "cycling", "driving"] as const).map((mode, i) => (
              <div key={mode} data-reveal style={{ animationDelay: `${300 + i * 120}ms` }}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-maroon/8 bg-white/60 p-6 shadow-[0_2px_12px_-4px_rgba(90,31,31,0.06)] backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-brand-maroon/20 hover:shadow-[0_12px_40px_-12px_rgba(90,31,31,0.12)] sm:p-7">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-gold/0 via-brand-gold/0 to-brand-gold/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <h3 className="font-display text-xl leading-snug text-brand-maroon sm:text-2xl">
                    {t(`directions.${mode}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink/60">
                    {t(`directions.${mode}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center sm:mt-16">
            <div data-reveal style={{ animationDelay: "300ms" }}>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_20px_45px_-15px_rgba(90,31,31,0.35)] transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-[0_30px_55px_-15px_rgba(90,31,31,0.5)] active:scale-100 sm:text-base"
              >
                <Navigation
                  className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12"
                  strokeWidth={2.2}
                />
                <span>{t("directions.ctaLabel")}</span>
              </a>
            </div>
            <p
              data-reveal
              style={{ animationDelay: "400ms" }}
              className="mt-4 text-xs text-brand-ink/40"
            >
              {t("directions.ctaHint")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
