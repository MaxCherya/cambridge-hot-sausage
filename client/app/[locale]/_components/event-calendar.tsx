"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayInfo {
  date: string;
  status: "available" | "held" | "confirmed" | "blocked" | "past";
}

interface EventCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function EventCalendar({ onDateSelect, selectedDate }: EventCalendarProps) {
  const t = useTranslations("events.calendar");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [days, setDays] = useState<DayInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);

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
    setAnimDir(delta > 0 ? "right" : "left");
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setMonth(newMonth);
    setYear(newYear);
    setTimeout(() => setAnimDir(null), 300);
  }

  // Calculate what day of the week the month starts on (0=Mon)
  const firstDay = new Date(year, month - 1, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Monday-based

  const monthName = new Date(year, month - 1).toLocaleDateString("en", { month: "long" });

  const statusColor: Record<string, string> = {
    available: "bg-brand-sage/15 text-brand-sage hover:bg-brand-sage/25 hover:ring-2 hover:ring-brand-sage/40 cursor-pointer",
    held: "bg-brand-gold/15 text-brand-gold/70",
    confirmed: "bg-brand-maroon/15 text-brand-maroon/60",
    blocked: "bg-brand-ink/5 text-brand-ink/20",
    past: "text-brand-ink/15",
  };

  return (
    <div className="rounded-3xl border border-brand-maroon/8 bg-white/60 p-5 backdrop-blur-sm sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goMonth(-1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-ink/50 transition-all duration-200 hover:bg-brand-maroon/10 hover:text-brand-maroon"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className={`font-display text-xl text-brand-maroon transition-transform duration-300 sm:text-2xl ${
          animDir === "right" ? "translate-x-2 opacity-0" : animDir === "left" ? "-translate-x-2 opacity-0" : ""
        }`}>
          {monthName} {year}
        </h3>
        <button
          type="button"
          onClick={() => goMonth(1)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-ink/50 transition-all duration-200 hover:bg-brand-maroon/10 hover:text-brand-maroon"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day labels */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-brand-ink/35">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {Array.from({ length: startOffset }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {loading
          ? Array.from({ length: 28 }, (_, i) => (
              <div key={`skel-${i}`} className="aspect-square animate-pulse rounded-xl bg-brand-ink/5" />
            ))
          : days.map((day) => {
              const dayNum = new Date(day.date).getDate();
              const isSelected = selectedDate === day.date;
              const isAvailable = day.status === "available";

              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => isAvailable && onDateSelect(day.date)}
                  className={`relative aspect-square rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-brand-maroon text-brand-cream ring-2 ring-brand-maroon shadow-[0_4px_16px_-4px_rgba(90,31,31,0.4)]"
                      : statusColor[day.status] || ""
                  } ${!isAvailable && !isSelected ? "cursor-default" : ""}`}
                >
                  {dayNum}
                  {day.status === "held" && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-gold" />
                  )}
                  {day.status === "confirmed" && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-maroon" />
                  )}
                </button>
              );
            })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[10px]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-sage/30" />
          {t("available")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-gold/40" />
          {t("held")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-maroon/30" />
          {t("confirmed")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-ink/10" />
          {t("blocked")}
        </span>
      </div>
    </div>
  );
}
