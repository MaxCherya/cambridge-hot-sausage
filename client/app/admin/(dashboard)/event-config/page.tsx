"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, Plus, Trash2 } from "lucide-react";
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

interface TimeSlot {
  id: number;
  label: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  order: number;
  available_days: string;
}

const DAYS = [
  { value: "0", label: "Mon" },
  { value: "1", label: "Tue" },
  { value: "2", label: "Wed" },
  { value: "3", label: "Thu" },
  { value: "4", label: "Fri" },
  { value: "5", label: "Sat" },
  { value: "6", label: "Sun" },
];

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

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.eventConfig(),
    queryFn: () => adminFetch<EventConfig>("/admin/event-config"),
  });

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["admin", "time-slots"],
    queryFn: async () => {
      const res = await adminFetch<{ results: TimeSlot[] } | TimeSlot[]>("/admin/time-slots");
      return Array.isArray(res) ? res : res.results;
    },
  });

  useEffect(() => {
    if (data && !form) setForm(data);
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: (payload: EventConfig) =>
      adminFetch("/admin/event-config", { method: "PUT", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "event-config"] });
      toast.success("Configuration saved");
    },
    onError: () => toast.error("Failed to save"),
  });

  const createSlotMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) =>
      adminFetch("/admin/time-slots", { method: "POST", body: JSON.stringify(d) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "time-slots"] });
      toast.success("Time slot created");
    },
    onError: () => toast.error("Failed to create slot"),
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/admin/time-slots/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "time-slots"] });
      toast.success("Time slot deleted");
    },
    onError: () => toast.error("Failed to delete slot"),
  });

  const toggleSlotMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      adminFetch(`/admin/time-slots/${id}`, { method: "PATCH", body: JSON.stringify({ is_active }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "time-slots"] });
      toast.success("Time slot updated");
    },
    onError: () => toast.error("Failed to update slot"),
  });

  function handleChange(key: keyof EventConfig, value: string) {
    if (!form) return;
    setForm({ ...form, [key]: value });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    saveMutation.mutate({
      ...form,
      band_1_miles: Number(form.band_1_miles),
      band_2_miles: Number(form.band_2_miles),
      band_3_miles: Number(form.band_3_miles),
      band_4_miles: Number(form.band_4_miles),
      max_radius_miles: Number(form.max_radius_miles),
      hold_duration_minutes: Number(form.hold_duration_minutes),
      min_guests: Number(form.min_guests),
      max_guests: Number(form.max_guests),
    });
  }

  const [newSlotDays, setNewSlotDays] = useState<string[]>([]);

  function handleCreateSlot(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createSlotMutation.mutate({
      label: fd.get("label"),
      start_time: fd.get("start_time"),
      end_time: fd.get("end_time"),
      available_days: newSlotDays.join(","),
      is_active: true,
      order: (slotsData?.length ?? 0),
    });
    e.currentTarget.reset();
    setNewSlotDays([]);
  }

  if (isLoading || !form) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5A1F1F]/20 border-t-[#5A1F1F]" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Event Configuration</h1>

      {/* Pricing config */}
      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Pricing & Limits</h2>
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
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none focus:ring-2 focus:ring-[#5A1F1F]/20"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={saveMutation.isPending} className="rounded-lg bg-[#5A1F1F] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a1919] disabled:opacity-50">
            {saveMutation.isPending ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>

      {/* Time Slots */}
      <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Time Slots</h2>
        </div>

        {slotsLoading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-2">
            {(slotsData ?? []).map((slot) => (
              <div key={slot.id} className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                <Clock size={16} className="text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{slot.label}</p>
                  <p className="text-xs text-gray-400">
                    {slot.start_time} – {slot.end_time}
                    <span className="ml-2 text-gray-300">·</span>
                    <span className="ml-1">
                      {slot.available_days
                        ? slot.available_days.split(",").map((d: string) => DAYS.find((x) => x.value === d.trim())?.label).filter(Boolean).join(", ")
                        : "Every day"}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSlotMutation.mutate({ id: slot.id, is_active: !slot.is_active })}
                  className={`h-5 w-9 rounded-full transition-colors ${slot.is_active ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${slot.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <button
                  type="button"
                  onClick={() => { if (confirm("Delete this time slot?")) deleteSlotMutation.mutate(slot.id); }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {(slotsData ?? []).length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">No time slots configured. Add one below.</p>
            )}
          </div>
        )}

        {/* Add slot form */}
        <form onSubmit={handleCreateSlot} className="mt-4 space-y-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/30 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Label</label>
              <input name="label" required placeholder="e.g. Lunch Service" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Start</label>
              <input name="start_time" type="time" required defaultValue="11:00" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">End</label>
              <input name="end_time" type="time" required defaultValue="15:00" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Available days <span className="font-normal normal-case text-gray-300">(none = every day)</span></label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setNewSlotDays((prev) =>
                    prev.includes(day.value) ? prev.filter((d) => d !== day.value) : [...prev, day.value]
                  )}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    newSlotDays.includes(day.value)
                      ? "border-[#5A1F1F] bg-[#5A1F1F] text-white"
                      : "border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={createSlotMutation.isPending} className="inline-flex items-center gap-1 rounded-lg bg-[#5A1F1F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4a1919] disabled:opacity-50">
            <Plus size={14} /> Add slot
          </button>
        </form>
      </div>
    </div>
  );
}
