"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatusBadge } from "../../_components/status-badge";

interface OrderListItem {
  id: string;
  short_id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total: string;
  created_at: string;
  item_count: number;
}

const STATUSES = ["", "pending", "paid", "shipped", "delivered", "cancelled"];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();

  const params: Record<string, string> = {};
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.orders(params),
    queryFn: () => {
      const qs = statusFilter ? `?status=${statusFilter}` : "";
      return adminFetch<{ count: number; results: OrderListItem[] }>(`/admin/orders${qs}`);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminFetch(`/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {/* Status filter tabs */}
      <div className="mt-4 flex gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-[#5A1F1F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 font-semibold text-gray-500">Order</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Customer</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Items</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Total</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : !data || data.results.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No orders found</td></tr>
            ) : (
              data.results.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-xs font-semibold text-[#5A1F1F] hover:underline">
                      #{order.short_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{order.customer_name || "Guest"}</p>
                    <p className="text-xs text-gray-400">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.item_count}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">£{order.total}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => statusMutation.mutate({ id: order.id, status: e.target.value })}
                      className="rounded-md border-0 bg-transparent py-0 text-xs font-semibold focus:ring-2 focus:ring-[#5A1F1F]/20"
                    >
                      {STATUSES.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
