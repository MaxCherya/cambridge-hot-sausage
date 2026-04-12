"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, MapPin, Users, Clock } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatusBadge } from "../../../_components/status-badge";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: booking, isLoading } = useQuery({
    queryKey: adminKeys.booking(id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => adminFetch<any>(`/admin/bookings/${id}`),
  });

  if (isLoading || !booking) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5A1F1F]/20 border-t-[#5A1F1F]" /></div>;
  }

  return (
    <div>
      <Link href="/admin/bookings" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5A1F1F]">
        <ArrowLeft size={14} /> Back to bookings
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Booking #{String(booking.id).slice(0, 8)}</h1>
        <StatusBadge status={booking.status as string} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Event Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /> <span className="font-medium">{booking.date as string}</span> {booking.timing_start as string} – {booking.timing_end as string}</div>
            <div className="flex items-center gap-2"><Users size={14} className="text-gray-400" /> {booking.num_guests as number} guests</div>
            <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-gray-400" /> <span className="text-gray-600">{booking.location_address as string || "—"}</span></div>
            {typeof booking.distance_miles === "number" && <p className="text-xs text-gray-400 pl-[22px]">{booking.distance_miles.toFixed(0)} miles from Cambridge</p>}
          </div>
          {booking.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{booking.notes as string}</div>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Customer</h2>
          <p className="font-medium text-gray-800">{booking.customer_name as string}</p>
          <p className="text-sm text-gray-500">{booking.customer_email as string}</p>
          {booking.customer_phone && <p className="text-sm text-gray-500">{booking.customer_phone as string}</p>}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total</span>
            <p className="mt-1 text-2xl font-bold text-gray-900">£{booking.price as string}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
