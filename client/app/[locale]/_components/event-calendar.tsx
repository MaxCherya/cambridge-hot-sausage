"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface SlotInfo {
  id: number;
  label: string;
  start_time: string;
  end_time: string;
  status: "available" | "booked";
}

interface DayInfo {
  date: string;
  status: "available" | "full" | "blocked" | "past";
  slots: SlotInfo[];
}

interface EventCalendarProps {
  onSlotSelect: (date: string, slotId: number, slotLabel: string) => void;
  selectedDate: string | null;
  selectedSlotId: number | null;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function EventCalendar({ onSlotSelect, selectedDate, selectedSlotId }: EventCalendarProps) {
  const t = useTranslations("events.calendar");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [days, setDays] = useState<DayInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const fetchCalendar = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/events/calendar?year=${y}&month=${m}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDays(data.days);
    } catch {
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar(year, month);
  }, [year, month, fetchCalendar]);

  function goMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setMonth(newMonth);
    setYear(newYear);
  }

  const firstDay = new Date(year, month - 1, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const monthName = new Date(year, month - 1).toLocaleDateString("en", { month: "long" });

  const statusColor: Record<string, string> = {
    available: "bg-brand-sage/15 text-brand-sage hover:bg-brand-sage/25 hover:ring-2 hover:ring-brand-sage/40 cursor-pointer",
    full: "bg-brand-maroon/15 text-brand-maroon/60",
    blocked: "bg-brand-ink/5 text-brand-ink/20",
    past: "text-brand-ink/15",
  };

  // The day that's showing slot picker
  const expandedDay = days.find((d) => d.date === expandedDate);

  return (
    <div className="rounded-3xl border border-brand-maroon/8 bg-white/60 p-5 backdrop-blur-sm sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => goMonth(-1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-ink/50 transition-all duration-200 hover:bg-brand-maroon/10 hover:text-brand-maroon">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-display text-xl text-brand-maroon sm:text-2xl">{monthName} {year}</h3>
        <button type="button" onClick={() => goMonth(1)} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-ink/50 transition-all duration-200 hover:bg-brand-maroon/10 hover:text-brand-maroon">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day labels */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-brand-ink/35">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }, (_, i) => <div key={`empty-${i}`} />)}

        {loading
          ? Array.from({ length: 28 }, (_, i) => <div key={`skel-${i}`} className="aspect-square animate-pulse rounded-xl bg-brand-ink/5" />)
          : days.map((day) => {
              const dayNum = new Date(day.date).getDate();
              const isSelected = selectedDate === day.date;
              const isExpanded = expandedDate === day.date;
              const hasAvailableSlots = day.status === "available";

              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={!hasAvailableSlots}
                  onClick={() => {
                    if (hasAvailableSlots) {
                      setExpandedDate(isExpanded ? null : day.date);
                    }
                  }}
                  className={`relative aspect-square rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-brand-maroon text-brand-cream ring-2 ring-brand-maroon shadow-[0_4px_16px_-4px_rgba(90,31,31,0.4)]"
                      : isExpanded
                        ? "bg-brand-sage/25 text-brand-sage ring-2 ring-brand-sage/40"
                        : statusColor[day.status] || ""
                  } ${!hasAvailableSlots && !isSelected ? "cursor-default" : ""}`}
                >
                  {dayNum}
                </button>
              );
            })}
      </div>

      {/* Slot picker — shows below calendar when a date is expanded */}
      {expandedDay && expandedDay.slots.length > 0 && (
        <div className="mt-4 rounded-2xl border border-brand-sage/20 bg-brand-sage/5 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-sage">
            {new Date(expandedDay.date).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            {expandedDay.slots.map((slot) => {
              const isBooked = slot.status === "booked";
              const isThisSelected = selectedDate === expandedDay.date && selectedSlotId === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={isBooked}
                  onClick={() => {
                    if (!isBooked) {
                      onSlotSelect(expandedDay.date, slot.id, slot.label);
                    }
                  }}
                  className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                    isThisSelected
                      ? "border-brand-maroon bg-brand-maroon text-brand-cream shadow-md"
                      : isBooked
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-default"
                        : "border-brand-sage/30 bg-white hover:border-brand-sage hover:shadow-sm cursor-pointer"
                  }`}
                >
                  <Clock size={16} className={isThisSelected ? "text-brand-gold" : isBooked ? "text-gray-300" : "text-brand-sage"} />
                  <div>
                    <p className={`text-sm font-semibold ${isThisSelected ? "text-brand-cream" : isBooked ? "text-gray-400" : "text-brand-ink"}`}>
                      {slot.label}
                    </p>
                    <p className={`text-xs ${isThisSelected ? "text-brand-cream/70" : isBooked ? "text-gray-300" : "text-brand-ink/50"}`}>
                      {slot.start_time} – {slot.end_time}
                    </p>
                  </div>
                  {isBooked && <span className="ml-auto text-[10px] font-semibold uppercase text-gray-400">Booked</span>}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] text-brand-ink/40">
            Need different hours? <a href="/contact" className="font-medium text-brand-maroon underline">Contact us directly</a>.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[10px]">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-sage/30" /> {t("available")}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-maroon/30" /> {t("confirmed")}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-ink/10" /> {t("blocked")}</span>
      </div>
    </div>
  );
}
