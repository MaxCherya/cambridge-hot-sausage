"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatusBadge } from "../../_components/status-badge";

interface ReviewListItem {
  id: number;
  product_name: string;
  author: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

const FILTERS = ["", "pending", "approved"];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-gray-200"}>
          &#9733;
        </span>
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const [filter, setFilter] = useState("");
  const queryClient = useQueryClient();

  const params: Record<string, string> = {};
  if (filter) params.status = filter;

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.reviews(params),
    queryFn: () => {
      const qs = filter ? `?status=${filter}` : "";
      return adminFetch<{ count: number; results: ReviewListItem[] }>(`/admin/reviews${qs}`);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/admin/reviews/${id}/approve`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) =>
      adminFetch(`/admin/reviews/${id}/reject`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>

      <div className="mt-4 flex gap-1.5">
        {FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === s
                ? "bg-[#5A1F1F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 font-semibold text-gray-500">Product</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Author</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Rating</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : !data || data.results.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No reviews found</td></tr>
            ) : (
              data.results.map((review) => (
                <tr key={review.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{review.product_name}</td>
                  <td className="px-4 py-3 text-gray-600">{review.author}</td>
                  <td className="px-4 py-3">
                    <StarRating rating={review.rating} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={review.is_approved ? "active" : "pending"} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {!review.is_approved && (
                        <button
                          type="button"
                          onClick={() => approveMutation.mutate(review.id)}
                          disabled={approveMutation.isPending}
                          className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200 transition-colors hover:bg-green-100"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => rejectMutation.mutate(review.id)}
                        disabled={rejectMutation.isPending}
                        className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </div>
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
