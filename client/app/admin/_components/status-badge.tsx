const VARIANTS: Record<string, string> = {
  paid: "bg-green-50 text-green-700 ring-green-200",
  confirmed: "bg-green-50 text-green-700 ring-green-200",
  shipped: "bg-blue-50 text-blue-700 ring-blue-200",
  delivered: "bg-blue-50 text-blue-700 ring-blue-200",
  held: "bg-amber-50 text-amber-700 ring-amber-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  new: "bg-amber-50 text-amber-700 ring-amber-200",
  read: "bg-gray-50 text-gray-600 ring-gray-200",
  replied: "bg-green-50 text-green-700 ring-green-200",
  archived: "bg-gray-50 text-gray-400 ring-gray-200",
  cancelled: "bg-red-50 text-red-600 ring-red-200",
  active: "bg-green-50 text-green-700 ring-green-200",
  inactive: "bg-gray-50 text-gray-400 ring-gray-200",
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = VARIANTS[status.toLowerCase()] || VARIANTS.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ${variant}`}
    >
      {status}
    </span>
  );
}
