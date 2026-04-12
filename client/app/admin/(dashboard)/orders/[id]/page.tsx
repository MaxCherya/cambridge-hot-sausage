"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatusBadge } from "../../../_components/status-badge";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: order, isLoading } = useQuery({
    queryKey: adminKeys.order(id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: () => adminFetch<any>(`/admin/orders/${id}`),
  });

  if (isLoading || !order) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5A1F1F]/20 border-t-[#5A1F1F]" /></div>;
  }

  const items = (order.items as Array<{ product_name: string; variant_name: string; sku: string; unit_price: string; quantity: number }>) || [];

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5A1F1F]">
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Order #{String(order.id).slice(0, 8)}</h1>
        <StatusBadge status={order.status as string} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Customer */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Customer</h2>
          <p className="font-medium text-gray-800">{order.customer_name as string}</p>
          <p className="text-sm text-gray-500">{order.customer_email as string}</p>
        </div>

        {/* Shipping */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Shipping</h2>
          <p className="text-sm text-gray-700">
            {order.shipping_name as string}<br />
            {order.shipping_line1 as string}<br />
            {order.shipping_line2 ? <>{order.shipping_line2 as string}<br /></> : null}
            {order.shipping_city as string} {order.shipping_postal_code as string}<br />
            {order.shipping_country as string}
          </p>
        </div>

        {/* Items */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Items</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 text-left font-semibold text-gray-500">Product</th>
                <th className="pb-2 text-left font-semibold text-gray-500">Variant</th>
                <th className="pb-2 text-right font-semibold text-gray-500">Price</th>
                <th className="pb-2 text-right font-semibold text-gray-500">Qty</th>
                <th className="pb-2 text-right font-semibold text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 font-medium text-gray-800">{item.product_name}</td>
                  <td className="py-2 text-gray-600">{item.variant_name}</td>
                  <td className="py-2 text-right text-gray-600">£{item.unit_price}</td>
                  <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                  <td className="py-2 text-right font-semibold text-gray-800">
                    £{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="text-sm text-gray-500">
              Subtotal: £{order.subtotal as string} · Shipping: £{order.shipping_cost as string}
            </div>
            <span className="text-xl font-bold text-gray-900">£{order.total as string}</span>
          </div>

          {order.stripe_receipt_url && (
            <a
              href={order.stripe_receipt_url as string}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#5A1F1F] hover:underline"
            >
              <ExternalLink size={12} /> View Stripe receipt
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
