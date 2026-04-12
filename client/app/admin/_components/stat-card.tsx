import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: "maroon" | "gold" | "sage" | "ink";
}

const BG = {
  maroon: "bg-[#5A1F1F]/10 text-[#5A1F1F]",
  gold: "bg-[#ECD691]/20 text-[#5A1F1F]",
  sage: "bg-[#4F6B58]/10 text-[#4F6B58]",
  ink: "bg-gray-100 text-gray-600",
};

export function StatCard({ label, value, icon, color = "maroon" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${BG[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
          <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
