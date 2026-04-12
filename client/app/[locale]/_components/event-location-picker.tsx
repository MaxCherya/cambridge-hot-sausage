"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Loader2, MapPin } from "lucide-react";

const LocationMap = dynamic(() => import("./event-location-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-brand-cream/60 text-sm text-brand-ink/50">
      Loading map…
    </div>
  ),
});

interface PriceResult {
  distance_miles: number;
  address: string;
  base_price: number;
  band_label: string;
  surcharge: number;
  total_price: number;
}

interface EventLocationPickerProps {
  onLocationConfirm: (lat: number, lng: number, price: PriceResult) => void;
}

export function EventLocationPicker({ onLocationConfirm }: EventLocationPickerProps) {
  const t = useTranslations("events.location");
  const tPricing = useTranslations("events.pricing");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null);
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setPin({ lat, lng });
    setError("");
    setPriceResult(null);
    setCalculating(true);

    try {
      const res = await fetch("/api/v1/events/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("invalidLocation"));
        setCalculating(false);
        return;
      }

      setPriceResult(data);
      onLocationConfirm(lat, lng, data);
    } catch {
      setError(t("invalidLocation"));
    } finally {
      setCalculating(false);
    }
  }, [onLocationConfirm, t]);

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="overflow-hidden rounded-3xl border border-brand-maroon/8 shadow-[0_8px_30px_-10px_rgba(90,31,31,0.1)]">
        <div className="h-[300px] sm:h-[400px]">
          <LocationMap onMapClick={handleMapClick} pin={pin} />
        </div>
      </div>

      {/* Status */}
      {calculating && (
        <div className="flex items-center justify-center gap-2 text-sm text-brand-ink/50">
          <Loader2 size={16} className="animate-spin" />
          {t("calculating")}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Price breakdown */}
      {priceResult && !error && (
        <div className="rounded-2xl border border-brand-maroon/8 bg-white/60 p-5 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 flex-shrink-0 text-brand-maroon" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-brand-ink">{priceResult.address}</p>
              <p className="mt-1 text-xs text-brand-ink/45">
                {t("distance", { miles: priceResult.distance_miles.toFixed(0) })}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-brand-maroon/5 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-ink/60">{tPricing("basePrice")}</span>
              <span className="tabular-nums text-brand-ink">£{priceResult.base_price.toFixed(2)}</span>
            </div>
            {priceResult.surcharge > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-ink/60">
                  {tPricing("distanceBand")} ({priceResult.band_label})
                </span>
                <span className="tabular-nums text-brand-ink">+£{priceResult.surcharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-brand-maroon/5 pt-2 text-sm font-semibold">
              <span className="text-brand-ink">{tPricing("total")}</span>
              <span className="font-display text-xl text-brand-maroon">£{priceResult.total_price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {!pin && !calculating && (
        <p className="text-center text-sm text-brand-ink/40">{t("placeholder")}</p>
      )}
    </div>
  );
}
