"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, MapPin, Users, Clock, Send } from "lucide-react";
import { EventCalendar } from "./event-calendar";
import { EventLocationPicker } from "./event-location-picker";

interface PriceResult {
  distance_miles: number;
  address: string;
  base_price: number;
  band_label: string;
  surcharge: number;
  total_price: number;
}

export function EventBooking() {
  const t = useTranslations("events");

  // Step state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [holdToken, setHoldToken] = useState<string | null>(null);
  const [holdExpiry, setHoldExpiry] = useState<string | null>(null);
  const [holdError, setHoldError] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Hold a date when selected
  const handleDateSelect = useCallback(async (date: string) => {
    // Release previous hold if any
    if (holdToken) {
      fetch(`/api/v1/events/release?hold_token=${holdToken}`, { method: "DELETE" });
    }

    setSelectedDate(date);
    setHoldError("");
    const token = crypto.randomUUID();

    try {
      const res = await fetch("/api/v1/events/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, hold_token: token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setHoldError(data.error || "Failed to hold date");
        setSelectedDate(null);
        return;
      }

      setHoldToken(token);
      setHoldExpiry(data.expires_at);

      // Scroll to location section
      setTimeout(() => {
        locationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    } catch {
      setHoldError("Failed to hold date");
      setSelectedDate(null);
    }
  }, [holdToken]);

  // Release hold on unmount
  useEffect(() => {
    return () => {
      if (holdToken) {
        fetch(`/api/v1/events/release?hold_token=${holdToken}`, { method: "DELETE" });
      }
    };
  }, [holdToken]);

  // Location confirmed
  const handleLocationConfirm = useCallback((lat: number, lng: number, price: PriceResult) => {
    setLocation({ lat, lng });
    setPriceResult(price);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }, []);

  // Submit booking
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!holdToken || !location || !priceResult) return;

    setSubmitting(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/v1/events/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hold_token: holdToken,
          lat: location.lat,
          lng: location.lng,
          num_guests: parseInt(form.get("num_guests") as string, 10),
          timing_start: form.get("timing_start"),
          timing_end: form.get("timing_end"),
          notes: form.get("notes") || "",
          customer_name: form.get("customer_name"),
          customer_email: form.get("customer_email"),
          customer_phone: form.get("customer_phone") || "",
        }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-maroon pt-28 pb-20 text-brand-cream sm:pt-36 sm:pb-28">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-brand-gold/8 blur-[140px]" />
          <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-sage/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-size-[48px_48px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <span data-reveal className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-gold sm:text-xs">
            {t("hero.eyebrow")}
          </span>
          <h1 data-reveal style={{ animationDelay: "100ms" }} className="mt-3 font-display text-4xl leading-[1.1] sm:mt-4 sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p data-reveal style={{ animationDelay: "200ms" }} className="mx-auto mt-5 max-w-xl text-balance text-base text-brand-cream/70 sm:mt-6 sm:text-lg">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Step 1: Calendar */}
      <section className="relative bg-brand-cream py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-maroon text-brand-cream">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="font-display text-xl text-brand-maroon sm:text-2xl">{t("calendar.title")}</h2>
              <p className="text-xs text-brand-ink/50">{t("calendar.subtitle")}</p>
            </div>
          </div>

          <EventCalendar onDateSelect={handleDateSelect} selectedDate={selectedDate} />

          {holdError && (
            <p className="mt-4 text-center text-sm text-red-600">{holdError}</p>
          )}
          {holdExpiry && selectedDate && (
            <p className="mt-4 text-center text-xs text-brand-sage">
              {t("calendar.holdActive", {
                time: new Date(holdExpiry).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              })}
            </p>
          )}
        </div>
      </section>

      {/* Step 2: Location (only shows after date is held) */}
      {holdToken && (
        <section ref={locationRef} className="relative bg-brand-cream pb-16 sm:pb-20">
          <div className="mx-auto max-w-2xl px-6">
            <div className="mb-8 flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-maroon text-brand-cream">
                <MapPin size={18} />
              </div>
              <div>
                <h2 className="font-display text-xl text-brand-maroon sm:text-2xl">{t("location.title")}</h2>
                <p className="text-xs text-brand-ink/50">{t("location.subtitle")}</p>
              </div>
            </div>

            <EventLocationPicker onLocationConfirm={handleLocationConfirm} />
          </div>
        </section>
      )}

      {/* Step 3: Details form (only shows after location is confirmed) */}
      {holdToken && priceResult && (
        <section ref={formRef} className="relative bg-brand-cream pb-20 sm:pb-28">
          <div className="mx-auto max-w-2xl px-6">
            <div className="mb-8 flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-maroon text-brand-cream">
                <Users size={18} />
              </div>
              <div>
                <h2 className="font-display text-xl text-brand-maroon sm:text-2xl">{t("form.title")}</h2>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-3xl border border-brand-maroon/8 bg-white/60 p-6 backdrop-blur-sm sm:p-8"
            >
              {/* Guests + Timing */}
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label htmlFor="num_guests" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                    {t("form.guests")}
                  </label>
                  <input
                    id="num_guests"
                    name="num_guests"
                    type="number"
                    required
                    min={10}
                    max={500}
                    defaultValue={50}
                    className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                  />
                </div>
                <div>
                  <label htmlFor="timing_start" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                    {t("form.timingStart")}
                  </label>
                  <input
                    id="timing_start"
                    name="timing_start"
                    type="time"
                    required
                    defaultValue="12:00"
                    className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                  />
                </div>
                <div>
                  <label htmlFor="timing_end" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                    {t("form.timingEnd")}
                  </label>
                  <input
                    id="timing_end"
                    name="timing_end"
                    type="time"
                    required
                    defaultValue="16:00"
                    className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                  {t("form.notes")}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  maxLength={2000}
                  placeholder={t("form.notesPlaceholder")}
                  className="w-full resize-none rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                />
              </div>

              {/* Contact */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="customer_name" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                    {t("form.name")}
                  </label>
                  <input
                    id="customer_name"
                    name="customer_name"
                    type="text"
                    required
                    maxLength={200}
                    className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                  />
                </div>
                <div>
                  <label htmlFor="customer_email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                    {t("form.email")}
                  </label>
                  <input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    required
                    className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="customer_phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                  {t("form.phone")}
                </label>
                <input
                  id="customer_phone"
                  name="customer_phone"
                  type="tel"
                  maxLength={20}
                  className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
                />
              </div>

              {/* Price summary + Submit */}
              <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/5 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="text-brand-ink/60">
                      {selectedDate} · {priceResult.distance_miles.toFixed(0)} mi
                    </p>
                  </div>
                  <span className="font-display text-2xl text-brand-maroon">
                    £{priceResult.total_price.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_15px_35px_-12px_rgba(90,31,31,0.5)] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_20px_45px_-12px_rgba(90,31,31,0.65)] active:scale-100 disabled:opacity-50 sm:text-base"
              >
                <Send size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                {submitting ? t("form.submitting") : t("form.submit")}
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
