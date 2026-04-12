"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";

interface EventConfig {
  base_price: string;
  band_1_miles: number;
  band_1_price: string;
  band_2_miles: number;
  band_2_price: string;
  band_3_miles: number;
  band_3_price: string;
  band_4_miles: number;
  band_4_price: string;
  max_radius_miles: number;
  hold_duration_minutes: number;
  min_guests: number;
  max_guests: number;
}

const FIELD_LABELS: Record<keyof EventConfig, string> = {
  base_price: "Base Price (£)",
  band_1_miles: "Band 1 Miles",
  band_1_price: "Band 1 Price (£)",
  band_2_miles: "Band 2 Miles",
  band_2_price: "Band 2 Price (£)",
  band_3_miles: "Band 3 Miles",
  band_3_price: "Band 3 Price (£)",
  band_4_miles: "Band 4 Miles",
  band_4_price: "Band 4 Price (£)",
  max_radius_miles: "Max Radius (miles)",
  hold_duration_minutes: "Hold Duration (minutes)",
  min_guests: "Min Guests",
  max_guests: "Max Guests",
};

const FIELD_KEYS = Object.keys(FIELD_LABELS) as (keyof EventConfig)[];

export default function EventConfigPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EventConfig | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.eventConfig(),
    queryFn: () => adminFetch<EventConfig>("/admin/event-config"),
  });

  useEffect(() => {
    if (data && !form) {
      setForm(data);
    }
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: (payload: EventConfig) =>
      adminFetch("/admin/event-config", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "event-config"] });
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    },
  });

  function handleChange(key: keyof EventConfig, value: string) {
    if (!form) return;
    setForm({ ...form, [key]: value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    const payload: EventConfig = {
      ...form,
      band_1_miles: Number(form.band_1_miles),
      band_2_miles: Number(form.band_2_miles),
      band_3_miles: Number(form.band_3_miles),
      band_4_miles: Number(form.band_4_miles),
      max_radius_miles: Number(form.max_radius_miles),
      hold_duration_minutes: Number(form.hold_duration_minutes),
      min_guests: Number(form.min_guests),
      max_guests: Number(form.max_guests),
    };

    saveMutation.mutate(payload);
  }

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5A1F1F]/20 border-t-[#5A1F1F]" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Event Configuration</h1>

      {successMessage && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200">
          Configuration saved successfully.
        </div>
      )}

      {saveMutation.isError && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 ring-1 ring-red-200">
          Failed to save. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FIELD_KEYS.map((key) => (
            <div key={key}>
              <label htmlFor={key} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                {FIELD_LABELS[key]}
              </label>
              <input
                id={key}
                type={typeof form[key] === "number" ? "number" : "text"}
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                step={key.includes("price") || key === "base_price" ? "0.01" : "1"}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:ring-2 focus:ring-[#5A1F1F]/20"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-lg bg-[#5A1F1F] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#5A1F1F]/90 disabled:opacity-50"
          >
            {saveMutation.isPending ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}
